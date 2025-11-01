use anyhow::{Context, Result};
use chrono::{DateTime, Datelike};
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_yml;
use std::{
    collections::HashSet,
    fs,
    io::{BufWriter, Write},
    path::PathBuf,
    time::Duration,
};
use tokio::time::sleep;

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
struct Paper {
    title: String,
    authors: Option<String>,
    labels: Vec<String>,
    publications: Vec<Publication>,
}

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
struct Publication {
    name: String,
    url: Option<String>,
    year: Option<i32>,
    month: Option<u32>,
    day: Option<u32>,
    dblp_key: Option<String>,
    bibtex: Option<String>,
}

#[derive(Debug)]
struct UpdateStats {
    papers_processed: usize,
    arxiv_updates: usize,
    dblp_updates: usize,
    errors: usize,
    new_publications: usize,
}

impl UpdateStats {
    fn new() -> Self {
        Self {
            papers_processed: 0,
            arxiv_updates: 0,
            dblp_updates: 0,
            errors: 0,
            new_publications: 0,
        }
    }

    fn print_summary(&self) {
        println!("\n=== Update Summary ===");
        println!("Papers processed: {}", self.papers_processed);
        println!("ArXiv updates: {}", self.arxiv_updates);
        println!("DBLP updates: {}", self.dblp_updates);
        println!("New publications added: {}", self.new_publications);
        println!("Errors encountered: {}", self.errors);
    }
}

fn normalize_title(title: &str) -> String {
    // More sophisticated title normalization
    let re = Regex::new(r"[^\w\s]").unwrap();
    re.replace_all(title, "")
        .to_lowercase()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
        .trim()
        .to_string()
}

fn similarity_score(s1: &str, s2: &str) -> f64 {
    let norm1 = normalize_title(s1);
    let norm2 = normalize_title(s2);

    // Jaccard similarity with token overlap
    let tokens1: HashSet<&str> = norm1.split_whitespace().collect();
    let tokens2: HashSet<&str> = norm2.split_whitespace().collect();

    let intersection = tokens1.intersection(&tokens2).count();
    let union = tokens1.union(&tokens2).count();

    if union == 0 {
        return 0.0;
    }

    let jaccard = intersection as f64 / union as f64;

    // Also consider Levenshtein distance
    let max_len = norm1.len().max(norm2.len()) as f64;
    let lev_similarity = 1.0 - (levenshtein::levenshtein(&norm1, &norm2) as f64 / max_len);

    // Combine both metrics
    0.7 * jaccard + 0.3 * lev_similarity
}

fn extract_authors_last_names(authors_text: &str) -> String {
    // Better author name extraction
    authors_text
        .split(&[',', ';', '&'][..])
        .map(|author| {
            author
                .trim()
                .split_whitespace()
                .last()
                .unwrap_or("")
                .trim_matches(|c: char| !c.is_alphabetic())
        })
        .filter(|name| !name.is_empty())
        .collect::<Vec<_>>()
        .join(", ")
}

async fn update_paper_from_arxiv(
    paper: &mut Paper,
    similarity_threshold: f64,
    stats: &mut UpdateStats,
) -> Result<()> {
    let query = format!(
        "http://export.arxiv.org/api/query?max_results=50&search_query={}",
        urlencoding::encode(&paper.title.replace("-", " "))
    );

    let client = reqwest::Client::new();
    let resp = client
        .get(&query)
        .timeout(Duration::from_secs(30))
        .send()
        .await
        .context("Failed to fetch from arXiv")?
        .text()
        .await?;

    let tree = roxmltree::Document::parse(&resp)?;
    let entries = tree
        .descendants()
        .filter(|e| e.tag_name().name() == "entry");

    for entry in entries {
        let title = entry
            .children()
            .find(|c| c.tag_name().name() == "title")
            .and_then(|c| c.text())
            .unwrap_or("");

        let similarity = similarity_score(&title, &paper.title);

        if similarity >= similarity_threshold {
            let mut updated = false;

            // Update authors if missing
            if paper.authors.is_none() {
                let authors: Vec<String> = entry
                    .descendants()
                    .filter(|c| c.tag_name().name() == "name")
                    .filter_map(|c| c.text())
                    .collect();

                if !authors.is_empty() {
                    let author_names = authors.join(", ");
                    let last_names = extract_authors_last_names(&author_names);
                    paper.authors = Some(last_names);
                    println!("  ✓ Updated authors from arXiv: {}", author_names);
                    updated = true;
                }
            }

            // Parse publication date
            if let Some(published_node) = entry
                .children()
                .find(|c| c.tag_name().name() == "published")
            {
                if let Some(publish_date) = published_node.text() {
                    if let Ok(datetime) = DateTime::parse_from_rfc3339(publish_date) {
                        let year = datetime.year();
                        let month = datetime.month();
                        let day = datetime.day();

                        // Get arXiv URL
                        if let Some(id_node) =
                            entry.children().find(|c| c.tag_name().name() == "id")
                        {
                            if let Some(id_text) = id_node.text() {
                                let re = Regex::new(r"v\d+$").unwrap();
                                let clean_url =
                                    re.replace_all(id_text, "").replace("http://", "https://");

                                // Update existing arXiv publication or create new one
                                if let Some(publ) =
                                    paper.publications.iter_mut().find(|p| p.name == "arXiv")
                                {
                                    let old_url = publ.url.clone();
                                    *publ = Publication {
                                        name: "arXiv".into(),
                                        url: Some(clean_url.clone()),
                                        year: Some(year),
                                        month: Some(month),
                                        day: Some(day),
                                        dblp_key: None,
                                        bibtex: None,
                                    };
                                    if old_url.as_ref() != Some(&clean_url) {
                                        println!("  ✓ Updated arXiv preprint URL");
                                        updated = true;
                                    }
                                } else {
                                    paper.publications.push(Publication {
                                        name: "arXiv".into(),
                                        url: Some(clean_url),
                                        year: Some(year),
                                        month: Some(month),
                                        day: Some(day),
                                        dblp_key: None,
                                        bibtex: None,
                                    });
                                    println!("  ✓ Added new arXiv preprint");
                                    stats.new_publications += 1;
                                    updated = true;
                                }
                            }
                        }
                    }
                }
            }

            if updated {
                stats.arxiv_updates += 1;
            }
            break;
        }
    }

    Ok(())
}

async fn update_paper_from_dblp(
    paper: &mut Paper,
    similarity_threshold: f64,
    stats: &mut UpdateStats,
) -> Result<()> {
    let query = format!(
        "https://dblp.org/search/publ/api?h=30&q={}",
        urlencoding::encode(&paper.title.replace("-", " "))
    );

    let client = reqwest::Client::new();
    let resp = client
        .get(&query)
        .timeout(Duration::from_secs(30))
        .send()
        .await
        .context("Failed to fetch from DBLP")?
        .text()
        .await?;

    let tree = roxmltree::Document::parse(&resp)?;
    let hits = tree.descendants().filter(|e| e.tag_name().name() == "hit");

    for hit in hits {
        let title = hit
            .descendants()
            .find(|c| c.tag_name().name() == "title")
            .and_then(|c| c.text())
            .unwrap_or("");

        let similarity = similarity_score(&title, &paper.title);

        if similarity >= similarity_threshold {
            let venue = hit
                .descendants()
                .find(|c| c.tag_name().name() == "venue")
                .and_then(|c| c.text())
                .unwrap_or("");

            // Skip preprints
            if venue == "CoRR" || venue.is_empty() {
                continue;
            }

            let mut updated = false;

            // Update authors if missing
            if paper.authors.is_none() {
                let authors: Vec<String> = hit
                    .descendants()
                    .filter(|c| c.tag_name().name() == "author")
                    .filter_map(|c| c.text())
                    .collect();

                if !authors.is_empty() {
                    let author_names = authors.join(", ");
                    let last_names = extract_authors_last_names(&author_names);
                    paper.authors = Some(last_names);
                    println!("  ✓ Updated authors from DBLP: {}", author_names);
                    updated = true;
                }
            }

            // Get publication details
            let year = hit
                .descendants()
                .find(|c| c.tag_name().name() == "year")
                .and_then(|c| c.text())
                .and_then(|y| y.parse::<i32>().ok());

            let key = hit
                .descendants()
                .find(|c| c.tag_name().name() == "key")
                .and_then(|c| c.text())
                .map(|s| s.to_string());

            let url = hit
                .descendants()
                .find(|c| c.tag_name().name() == "ee")
                .and_then(|c| c.text())
                .map(|s| s.to_string());

            // Fetch bibtex if we have a key
            let bibtex = if let Some(ref k) = key {
                let bibtex_query = format!("https://dblp.org/rec/{}.bib?param=0", k);
                match reqwest::get(&bibtex_query).await {
                    Ok(resp) => resp.text().await.ok(),
                    Err(_) => None,
                }
            } else {
                None
            };

            // Update existing publication or create new one
            if let Some(publ) = paper
                .publications
                .iter_mut()
                .find(|p| p.name.to_lowercase() == venue.to_lowercase())
            {
                let mut pub_updated = false;

                if publ.dblp_key.is_none() && key.is_some() {
                    publ.dblp_key = key.clone();
                    pub_updated = true;
                }

                if publ.bibtex.is_none() && bibtex.is_some() {
                    publ.bibtex = bibtex.clone();
                    pub_updated = true;
                }

                if publ.url.is_none() && url.is_some() {
                    publ.url = url.clone();
                    pub_updated = true;
                }

                if pub_updated {
                    println!("  ✓ Updated {} publication details", venue);
                    updated = true;
                }
            } else {
                paper.publications.push(Publication {
                    name: venue.into(),
                    url,
                    year,
                    month: None,
                    day: None,
                    dblp_key: key,
                    bibtex,
                });
                println!("  ✓ Added new publication in {}", venue);
                stats.new_publications += 1;
                updated = true;
            }

            if updated {
                stats.dblp_updates += 1;
            }
            break;
        }
    }

    Ok(())
}

fn backup_file(path: &PathBuf) -> Result<()> {
    let backup_path = path.with_extension("yml.bak");
    fs::copy(path, backup_path)?;
    Ok(())
}

#[tokio::main]
async fn main() -> Result<()> {
    println!("🚀 Starting enhanced paper updater...\n");

    let mut papers: Vec<(PathBuf, Paper)> = Vec::new();
    let mut stats = UpdateStats::new();

    // Load all papers
    println!("📂 Loading papers...");
    for entry in fs::read_dir("../papers").context("Could not read papers directory")? {
        let entry = entry?;
        let path = entry.path();

        if path.extension().and_then(|s| s.to_str()) != Some("yml") {
            continue;
        }

        match fs::File::open(&path) {
            Ok(file) => match serde_yml::from_reader::<_, Paper>(file) {
                Ok(paper) => papers.push((path, paper)),
                Err(e) => {
                    eprintln!("⚠️  Error parsing {}: {}", path.display(), e);
                    stats.errors += 1;
                }
            },
            Err(e) => {
                eprintln!("⚠️  Error opening {}: {}", path.display(), e);
                stats.errors += 1;
            }
        }
    }

    println!("📋 Loaded {} papers", papers.len());

    // Sort by publication count (fewer publications first)
    papers.sort_by_key(|(_, paper)| paper.publications.len());

    // Process papers
    for (i, (path, mut paper)) in papers.into_iter().enumerate() {
        stats.papers_processed += 1;

        println!(
            "\n[{}/{}] 📄 Updating: {}",
            i + 1,
            stats.papers_processed + papers.len() - i - 1,
            paper.title
        );

        // Backup original file
        if let Err(e) = backup_file(&path) {
            eprintln!("  ⚠️  Warning: Could not create backup: {}", e);
        }

        // Update from arXiv (higher similarity threshold)
        if let Err(e) = update_paper_from_arxiv(&mut paper, 0.7, &mut stats).await {
            eprintln!("  ❌ arXiv error: {}", e);
            stats.errors += 1;
        }

        // Update from DBLP (slightly lower threshold for published papers)
        if let Err(e) = update_paper_from_dblp(&mut paper, 0.6, &mut stats).await {
            eprintln!("  ❌ DBLP error: {}", e);
            stats.errors += 1;
        }

        // Save updated paper
        match fs::File::create(&path) {
            Ok(file) => {
                let mut writer = BufWriter::new(file);
                if let Err(e) = serde_yml::to_writer(&mut writer, &paper) {
                    eprintln!("  ❌ Error serializing paper: {}", e);
                    stats.errors += 1;
                } else if let Err(e) = writer.flush() {
                    eprintln!("  ❌ Error writing file: {}", e);
                    stats.errors += 1;
                }
            }
            Err(e) => {
                eprintln!("  ❌ Error creating file: {}", e);
                stats.errors += 1;
            }
        }

        // Rate limiting
        sleep(Duration::from_millis(1500)).await;
    }

    stats.print_summary();
    println!("\n✅ Update complete!");

    Ok(())
}
