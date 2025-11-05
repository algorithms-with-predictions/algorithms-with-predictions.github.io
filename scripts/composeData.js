/* eslint-disable no-console */
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const paper_dir = join(__dirname, '..', 'papers');
const outputJSON = join(__dirname, '..', 'papers.json');
const publicJSON = join(__dirname, '..', 'public', 'papers.json');

console.info('📚 Processing papers from:', paper_dir);

const papers = fs.readdirSync(paper_dir);
console.info(`📄 Found ${papers.length} paper files`);

const paper_objs = papers.map(paper => {
  const filePath = join(paper_dir, paper);
  const paperData = yaml.load(fs.readFileSync(filePath, { encoding: 'utf-8' }));

  if (paperData && typeof paperData === 'object' && !Array.isArray(paperData)) {
    const paperWithoutAbstract = { ...paperData };
    delete paperWithoutAbstract.abstract;
    return paperWithoutAbstract;
  }

  return paperData;
});

const jsonContent = JSON.stringify(paper_objs, null, 2);

// Write to root (for development/legacy compatibility)
fs.writeFileSync(outputJSON, jsonContent);
// Write to public folder (for production build)
fs.writeFileSync(publicJSON, jsonContent);

console.info(
  '✅ Generated papers.json successfully in both root and public folders!'
);
