const fs = require("fs");
const yaml = require("js-yaml");

const rawdata = fs.readFileSync("content/papers.json");
const papers = JSON.parse(rawdata);

papers.forEach((paper) => {
  const years = Object.values(paper.publications).map((pub) => pub.year);
  const minyear = Math.min(...years).toString();
  const year = minyear.slice(-2);
  const authors = paper.authors.flatMap((author) =>
    author.split(",").map((a) => a.trim())
  );
  const authorstring = authors.join(", ");
  const other = authors.splice(1);
  const otherabbr = other.map((a) => a.charAt(0).toUpperCase()).join("");
  const titleword = paper.title.split(" ")[0].toLowerCase();
  const filename = authors[0] + otherabbr + year + titleword;

  const pubs = Object.entries(paper.publications).map(([name, obj]) => ({
    name: name,
    ...obj,
  }));

  const obj = {
    ...paper,
    authors: authorstring,
    publications: pubs,
  };

  fs.writeFileSync("papers/" + filename + ".yml", yaml.dump(obj));
});
