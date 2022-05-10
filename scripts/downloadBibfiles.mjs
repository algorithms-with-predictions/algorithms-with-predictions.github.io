import axios from "axios";
import fs from "fs";
import yaml from "js-yaml";
import { XMLParser } from "fast-xml-parser";
import fetch from "node-fetch";
import fastls from "fast-levenshtein"

const paper_dir = "papers";
const bib_dir = "bibfiles";
const papers = fs.readdirSync(paper_dir);
console.log(papers)

  await Promise.all(papers.map(async file => {
    let paper = yaml.load(fs.readFileSync(paper_dir + "/" + file, { encoding: "utf-8" }))
    let info = await axios
      .get(
        "https://dblp.org/search/publ/api?q=" + paper.title.split(" ").map(t => t + '$').join("+") 
      );
    
    const data = info.data;
    const parser = new XMLParser();
    let dataObj = parser.parse(data);
    let hits = [dataObj.result.hits.hit].flat();

    
    let entries = await Promise.all(hits.map(async hit => {
      if(hit === undefined) {
        return ''
      }
    
      let key = hit.info.key;
      let title = hit.info.title;
      if(fastls.get(title, paper.title) > 10) {
        return ''
      }
      let bibreq = await fetch("https://dblp.org/rec/" + key + ".bib?param=1");
      let bibfile = await bibreq.text();
      return bibfile
    }));
  
    let content = entries.join('\n\n\n');
    fs.writeFileSync(bib_dir + '/' + file.split('.')[0] + '.bib', content);
  }));


