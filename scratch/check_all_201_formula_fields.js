/**
 * scratch/check_all_201_formula_fields.js
 * Checks field preservation across all 201 formula records.
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

let songCount = 0;
let contraCount = 0;
let compCount = 0;

data.records.forEach(r => {
  if (r.formula_song_zh || r.formula_song || r.fang_ge_zh) songCount++;
  if (r.contraindications_zh || r.contraindications_en || r.cautions_zh) contraCount++;
  if (r.composition && r.composition.length) compCount++;
});

console.log(`Total Formulas: ${data.records.length}`);
console.log(`Formulas with Formula Songs: ${songCount}`);
console.log(`Formulas with Contraindications: ${contraCount}`);
console.log(`Formulas with Composition: ${compCount}`);
