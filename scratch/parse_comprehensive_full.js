/**
 * scratch/parse_comprehensive_full.js
 * Parses Herbal Formulations Comprehensive.docx.md to extract formula blocks.
 */

const fs = require('fs');
const path = require('path');

const compPath = path.join(__dirname, '../curriculum/formulas/Herbal Formulations Comprehensive.docx.md');
const compText = fs.readFileSync(compPath, 'utf8');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulaData = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

// Regex to find formula sections
const lines = compText.split(/\r?\n/);
let currentFormula = null;
const compMap = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  // Check if line looks like "● Ma Huang Tang" or "Ma Huang Tang" heading or "Formula: ..."
  const m = line.match(/^(?:●|\*|#+)?\s*([A-Z][a-zA-Z\s'-]+(?:Tang|San|Wan|Yin|Gao|Dan|Pian|Jian))\b/i);
  if (m) {
    const fname = m[1].trim();
    if (!compMap[fname]) {
      compMap[fname] = { actions: [], indications: [] };
    }
    currentFormula = fname;
  }
  if (currentFormula && compMap[currentFormula]) {
    if (/^Actions?:/i.test(line)) {
      compMap[currentFormula].actions.push(line.replace(/^Actions?:\s*/i, ''));
    }
    if (/^Indications?:/i.test(line)) {
      compMap[currentFormula].indications.push(line.replace(/^Indications?:\s*/i, ''));
    }
  }
}

console.log('Comp map keys count:', Object.keys(compMap).length);
console.log('Sample keys:', Object.keys(compMap).slice(0, 30));
