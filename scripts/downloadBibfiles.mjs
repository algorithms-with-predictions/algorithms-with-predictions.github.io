import axios from "axios";
import fs from "fs";
import yaml from "js-yaml";
import { XMLParser } from "fast-xml-parser";
import fastls from "fast-levenshtein";

const paper_dir = "papers";
const papers = fs.readdirSync(paper_dir);
console.log(papers);

await Promise.all(
  papers.map(async (file) => {
    let paper = yaml.load(
      fs.readFileSync(paper_dir + "/" + file, { encoding: "utf-8" })
    );

    let info = await axios.get(
      "https://dblp.org/search/publ/api?q=" +
        paper.title
          .split(" ")
          .map((t) => t + "$")
          .join("+")
    );

    const data = info.data;
    const parser = new XMLParser();
    let dataObj = parser.parse(data);
    let hits = [dataObj.result.hits.hit].flat();
    console.log(hits);

    hits.forEach((hit) => {
      console.log(hit);
      if (hit === undefined) {
        return;
      }

      let title = hit.info.title;
      if (fastls.get(title, paper.title) < 10) {
        const venue = hit.info.venue === "CoRR" ? "arXiv" : hit.info.venue;
        if (!paper.publications.some((pub) => pub.name === venue)) {
          paper.publications.push({
            name: venue,
            year: hit.info.year,
            url: hit.info.ee,
          });
        }
      }
    });

    fs.writeFileSync("papers/" + file + ".yml", yaml.dump(paper));
  })
);
