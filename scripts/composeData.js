const paper_dir = 'papers'
const outputJSON = 'papers.json'

const yaml = require('js-yaml');
const fs = require('fs');

const papers = fs.readdirSync(paper_dir);
const paper_objs = papers.map((paper) => yaml.load(fs.readFileSync(paper_dir + '/' +paper, {encoding: 'utf-8'})))

fs.writeFileSync(outputJSON, JSON.stringify(paper_objs, null, null));
