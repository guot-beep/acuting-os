/**
 * scratch/inspect_batch1_raw.js
 * Inspects raw records for Yin Qiao San, Sang Ju Yin, and Bai Hu Tang
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));
const formulas = data.records || data.formulas || data;

const targets = ['formula.yin_qiao_san', 'formula.sang_ju_yin', 'formula.bai_hu_tang'];

targets.forEach(id => {
  const f = formulas.find(item => item.id === id);
  console.log(`\n=================== ${id} ===================`);
  if (f) {
    console.log(JSON.stringify(f, null, 2));
  } else {
    console.log('NOT FOUND');
  }
});
