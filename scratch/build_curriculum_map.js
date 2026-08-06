/**
 * scratch/build_curriculum_map.js
 * Scans Formulations Summary Chart.docx.md and Herbal Formulations Comprehensive.docx.md
 * and extracts all formula names, actions, and indications, matching them to formulas.json
 */

const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, '../curriculum/formulas/Formulations Summary Chart.docx.md');
const compPath = path.join(__dirname, '../curriculum/formulas/Herbal Formulations Comprehensive.docx.md');

const summaryText = fs.readFileSync(summaryPath, 'utf8');
const compText = fs.readFileSync(compPath, 'utf8');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulaData = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

console.log(`Total formulas in formulas.json: ${formulaData.records.length}`);

// Let's parse formula blocks from Summary Chart first
// Formula blocks usually start with formula name like "Ma Huang Tang []", "Gui Zhi Tang []", etc.
const lines = summaryText.split(/\r?\n/);
let currentFormula = null;
const summaryMap = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const fMatch = line.match(/^([A-Z][a-zA-Z\s]+ Tang|[A-Z][a-zA-Z\s]+ San|[A-Z][a-zA-Z\s]+ Wan|[A-Z][a-zA-Z\s]+ Yin)\s*\[/);
  if (fMatch) {
    currentFormula = fMatch[1].trim();
    if (!summaryMap[currentFormula]) {
      summaryMap[currentFormula] = { actions: [], indications: [] };
    }
  }
  if (currentFormula && summaryMap[currentFormula]) {
    if (line.includes('Actions:')) {
      summaryMap[currentFormula].actions.push(line.replace(/Actions:\s*/i, '').trim());
    }
    if (line.includes('Indications:')) {
      summaryMap[currentFormula].indications.push(line.replace(/Indications:\s*/i, '').trim());
    }
  }
}

console.log('Extracted summary map keys count:', Object.keys(summaryMap).length);
console.log('Sample summary map:', JSON.stringify(Object.keys(summaryMap).slice(0, 20), null, 2));
