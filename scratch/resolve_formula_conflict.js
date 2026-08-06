/**
 * scratch/resolve_formula_conflict.js
 * Resolves git merge conflict in data/herbs/formulas.json by taking origin/main's formulas.json
 * and overlaying our Gold-Standard Reference Files (Ma Huang Tang, Gui Zhi Tang, Xiao Qing Long Tang, Ge Gen Tang, Xiang Su San)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const refDir = path.join(__dirname, '../data/herbs/reference');

// 1. Checkout origin/main's version of data/herbs/formulas.json
execSync('git checkout origin/main -- data/herbs/formulas.json');

// 2. Read origin/main's formulas.json
const mainData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));

// 3. Overlay our Gold-Standard reference files from data/herbs/reference/
const refFiles = fs.readdirSync(refDir).filter(f => f.startsWith('formula.') && f.endsWith('.json'));

refFiles.forEach(refFile => {
  const refPath = path.join(refDir, refFile);
  const refData = JSON.parse(fs.readFileSync(refPath, 'utf8'));
  const idx = mainData.records.findIndex(r => r.id === refData.id);
  if (idx !== -1) {
    mainData.records[idx] = Object.assign({}, mainData.records[idx], refData);
  } else {
    mainData.records.push(refData);
  }
});

// 4. Save merged formulas.json
fs.writeFileSync(formulasPath, JSON.stringify(mainData, null, 2), 'utf8');
console.log(`Successfully merged formulas.json with ${refFiles.length} Gold-Standard Reference files!`);
