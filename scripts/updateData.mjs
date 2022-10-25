import axios from "axios";
import fs from "fs";
import yaml from "js-yaml";
import { XMLParser } from "fast-xml-parser";
import fastls from "fast-levenshtein";

const paper_dir = "papers";
const papers = fs.readdirSync(paper_dir);

async function updateFromArxiv(paper) {
  let info = await axios.get(
    "http://export.arxiv.org/api/query?max_results=30&search_query=" +
      paper.title.replace("-", " ").split(" ").join("+"),
    { timeout: 30000 }
  );
  let data = info.data;
  let parser = new XMLParser();
  let dataObj = parser.parse(data);
  let hits = [dataObj.feed.entry].flat();

  hits.forEach((hit) => {
    if (hit === undefined) {
      return;
    }

    let title = hit.title;
    if (fastls.get(title, paper.title) < 5) {
      if (!("authors" in paper)) {
        paper.authors = hit.author
          .map((a) => a.name.split(" ").at(-1))
          .join(", ");
        console.log(
          "Setting authors of " + paper.title + " to " + paper.authors
        );
      }

      let date = new Date(hit.published);
      let year = date.getFullYear();
      let month = date.getMonth();
      let day = date.getDate();
      let pdfurl = hit.id
        //.replace("abs", "pdf")
        .replace(/v\d+/, "")
        .replace("http", "https"); // + ".pdf";

      if (!paper.publications.some((pub) => pub.name === "arXiv")) {
        console.log("Added arXiv preprint to " + paper.title);
        paper.publications.push({
          name: "arXiv",
          year,
          month,
          day,
          url: pdfurl,
        });
      } else {
        let publ_index = paper.publications.findIndex(
          (pub) => pub.name === "arXiv"
        );
        paper.publications[publ_index] = {
          ...paper.publications[publ_index],
          url: pdfurl,
          year,
          month,
          day,
        };
      }
    }
  });
}

async function updateFromDBLP(paper) {
  let info = await axios.get(
    "https://dblp.org/search/publ/api?q=" +
      paper.title.replace("-", " ").split(" ").join("+"),
    { timeout: 30000 }
  );

  let data = info.data;
  let parser = new XMLParser();
  let dataObj = parser.parse(data);
  let hits = [dataObj.result.hits.hit].flat();

  hits.forEach((hit) => {
    if (hit === undefined || hit.info.venue === "CoRR") {
      return;
    }

    let title = hit.info.title;
    if (fastls.get(title, paper.title) < 5) {
      if (!("authors" in paper)) {
        paper.authors = hit.info.authors.author
          .map((a) => a.split(" ").at(-1))
          .join(", ");
        console.log(
          "Setting authors of " + paper.title + " to " + paper.authors
        );
      }

      const venue = hit.info.venue;
      if (!paper.publications.some((pub) => pub.name === venue)) {
        console.log("Added publication at " + venue + " to " + paper.title);
        paper.publications.push({
          name: venue,
          year: hit.info.year,
          url: hit.info.ee,
        });
      }
      //else {
      //     let publ_index = paper.publications.findIndex(
      //         (pub) => pub.name === venue
      //     );
      //     paper.publications[publ_index] = {
      //         ...paper.publications[publ_index],
      //         year: hit.info.year,
      //       };
      //   }
    }
  });
}

let updated = await Promise.all(
  papers.map(async (file) => {
    let paper = yaml.load(
      fs.readFileSync(paper_dir + "/" + file, { encoding: "utf-8" })
    );

    if (!("publications" in paper)) {
      paper.publications = [];
    }

    try {
      await updateFromArxiv(paper);
    } catch (error) {
      console.log(
        "Failed to fetch data from arXiv for the paper: " + paper.title
      );
    }
    try {
      await updateFromDBLP(paper);
    } catch (error) {
      console.log(
        "Failed to fetch data from DBLP for the paper: " + paper.title
      );
    }
    return [file, paper];
  })
);

updated.forEach(([file, paper]) =>
  fs.writeFileSync("papers/" + file, yaml.dump(paper, { lineWidth: -1 }))
);
