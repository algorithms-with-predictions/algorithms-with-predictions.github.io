import axios from "axios";
import fs from "fs";
import yaml from "js-yaml";
import { XMLParser } from "fast-xml-parser";
import fastls from "fast-levenshtein";

const paper_dir = "papers";
const papers = fs.readdirSync(paper_dir);//.slice(0, 10);

let updated = await Promise.all(
  papers.map(async (file) => {
    let paper = yaml.load(
      fs.readFileSync(paper_dir + "/" + file, { encoding: "utf-8" })
    );
    //console.log(paper.title);

    try {
      let info = await axios.get(
        "https://dblp.org/search/publ/api?q=" +
          paper.title.split(" ").join("+"),
        { timeout: 10000 }
      );

      let data = info.data;
      let parser = new XMLParser();
      let dataObj = parser.parse(data);
      let hits = [dataObj.result.hits.hit].flat();
      //console.log(paper.title);

      hits.forEach((hit) => {
        //console.log(hit);
        if (hit === undefined) {
          return;
        }

        if (!('authors' in paper)) {
          paper.authors = hit.info.authors.author.map(a => a.split(' ').at(-1)).join(', ')
          console.log('Setting authors of ' + paper.title + ' to ' + paper.authors)
        }

        let title = hit.info.title;
        if (fastls.get(title, paper.title) < 10) {
          const venue = hit.info.venue === "CoRR" ? "arXiv" : hit.info.venue;
          if (!('publications'  in paper)) {
            paper.publications = []
          }
          if (!paper.publications.some((pub) => pub.name === venue)) {
            console.log("Added publication at " + venue + " to " + paper.title);
            paper.publications.push({
              name: venue,
              year: hit.info.year,
              url: hit.info.ee,
            });
          }
        }
      });
      return [file, paper];
    } catch (error) {
      console.log(error);
      return [file, paper];
    }
  })
);

//console.log(updated)

updated.forEach(([file, paper]) =>
  fs.writeFileSync("papers/" + file, yaml.dump(paper, { lineWidth: -1 }))
);
