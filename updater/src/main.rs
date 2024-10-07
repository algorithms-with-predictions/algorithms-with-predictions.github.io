use anyhow::Result;
use chrono::{DateTime, Datelike};
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_yml;
use tokio::time::sleep;
use std::{
    fs,
    io::{BufWriter, Write}, time::Duration,
};

#[derive(Serialize, Deserialize, PartialEq, Debug)]
struct Paper {
    title: String,
    authors: Option<String>,
    labels: Vec<String>,
    publications: Vec<Publication>,
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
struct Publication {
    name: String,
    url: Option<String>,
    year: Option<i32>,
    month: Option<u32>,
    day: Option<u32>,
    dblp_key: Option<String>,
    bibtex: Option<String>,
}

async fn update_paper_from_arxiv(paper: &mut Paper, acc: usize) -> Result<(), Box<dyn std::error::Error>> {
    let query = format!(
        "http://export.arxiv.org/api/query?max_results=20&search_query={}",
        paper.title.replace("-", "+").replace(" ", "+")
    );
    let resp = reqwest::get(query).await?.text().await?;
    let tree = roxmltree::Document::parse(&resp)?;

    let entries = tree
        .descendants()
        .filter(|e| e.tag_name().name() == "entry");

    for entry in entries {
        let title = entry
            .children()
            .find(|c| c.tag_name().name() == "title")
            .unwrap()
            .text()
            .unwrap();

        if levenshtein::levenshtein(&title.to_lowercase(), &paper.title.to_lowercase()) < acc {
            if paper.authors.is_none() {
                println!("Setting authors of {} from arXiv!", paper.title);
                let authors = entry
                    .descendants()
                    .filter(|c| c.tag_name().name() == "name")
                    .map(|c| c.text().unwrap().split(" ").last().unwrap())
                    .collect::<Vec<&str>>()
                    .join(", ");

                paper.authors = Some(authors);
            }

            let publish_date = entry
                .children()
                .find(|c| c.tag_name().name() == "published")
                .unwrap()
                .text()
                .unwrap();

            let datetime = DateTime::parse_from_rfc3339(&publish_date)?;
            let year = datetime.year();
            let month = datetime.month();
            let day = datetime.day();

            let re = Regex::new(r"v\d+").unwrap();
            let pdfurl = entry
                .children()
                .find(|c| c.tag_name().name() == "id")
                .unwrap()
                .text()
                .unwrap()
                .replace("http", "https");
            let pdfurl = re.replace_all(&pdfurl, "");

            if let Some(publ) = paper.publications.iter_mut().find(|p| p.name == "arXiv") {
                *publ = Publication {
                    name: "arXiv".into(),
                    url: pdfurl.to_string().into(),
                    year: year.into(),
                    month: month.into(),
                    day: day.into(),
                    dblp_key: None,
                    bibtex: None,
                };
            } else {
                println!("Added arXiv preprint to {}.", paper.title);
                paper.publications.push(Publication {
                    name: "arXiv".into(),
                    url: pdfurl.to_string().into(),
                    year: year.into(),
                    month: month.into(),
                    day: day.into(),
                    dblp_key: None,
                    bibtex: None,
                });
            }

            break;
        }
    }

    Ok(())
}

async fn update_paper_from_dblp(paper: &mut Paper, acc: usize) -> Result<(), Box<dyn std::error::Error>> {
    let query = format!(
        "https://dblp.org/search/publ/api?h=20&q={}",
        paper.title.replace("-", "+").replace(" ", "+")
    );
    let resp = reqwest::get(query).await?.text().await?;
    let tree = roxmltree::Document::parse(&resp)?;

    let hits = tree.descendants().filter(|e| e.tag_name().name() == "hit");

    for hit in hits {
        let title = hit
            .descendants()
            .find(|c| c.tag_name().name() == "title")
            .unwrap()
            .text()
            .unwrap();

        if levenshtein::levenshtein(&title.to_lowercase(), &paper.title.to_lowercase()) < acc {
            if paper.authors.is_none() {
                let authors = hit
                    .descendants()
                    .filter(|c| c.tag_name().name() == "author")
                    .map(|c| c.text().unwrap().split(" ").last().unwrap())
                    .collect::<Vec<&str>>()
                    .join(", ");

                paper.authors = Some(authors);
            }

            let venue = hit
                .descendants()
                .find(|c| c.tag_name().name() == "venue")
                .unwrap()
                .text()
                .unwrap();

            if venue == "CoRR" {
                continue;
            }

            let year = hit
                .descendants()
                .find(|c| c.tag_name().name() == "year")
                .unwrap()
                .text()
                .unwrap();

            let key = hit
                .descendants()
                .find(|c| c.tag_name().name() == "key")
                .unwrap()
                .text()
                .unwrap();

            let url = hit
                .descendants()
                .find(|c| c.tag_name().name() == "ee")
                .unwrap()
                .text()
                .unwrap();

            let bibtex_query = format!("https://dblp.org/rec/{key}.bib?param=0");
            let bibtex = reqwest::get(bibtex_query).await?.text().await?;

            if let Some(publ) = paper
                .publications
                .iter_mut()
                .find(|p| p.name.to_lowercase() == venue.to_lowercase())
            {
                if publ.dblp_key.is_none() {
                    publ.dblp_key = Some(key.to_string());
                }
                if publ.bibtex.is_none() {
                    publ.bibtex = Some(bibtex.to_string());
                }
            } else {
                println!(
                    "Added publication in {} to {} from DBLP.",
                    venue, paper.title
                );
                paper.publications.push(Publication {
                    name: venue.into(),
                    url: url.to_string().into(),
                    year: year.parse::<i32>().unwrap().into(),
                    month: None,
                    day: None,
                    dblp_key: Some(key.to_string()),
                    bibtex: Some(bibtex),
                });
            }

            break;
        }
    }

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    for entry in fs::read_dir("../papers")? {
        let entry = entry?;
        let file = std::fs::File::open(entry.path())?;
        let mut paper: Paper = serde_yml::from_reader(file)?;

        update_paper_from_arxiv(&mut paper, 4).await?;
        update_paper_from_dblp(&mut paper, 4).await?;

        let file = std::fs::File::create(entry.path())?;
        let mut writer = BufWriter::new(file);
        serde_yml::to_writer(&mut writer, &paper)?;
        writer.flush()?;
        sleep(Duration::from_millis(10000)).await;
    }

    Ok(())
}
