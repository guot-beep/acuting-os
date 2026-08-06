/**
 * scratch/inspect_formula_details.js
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));
const formulas = data.records || data.formulas || data;

const targetIds = ['formula.ma_huang_tang', 'formula.gui_zhi_tang', 'formula.xiao_qing_long_tang'];

targetIds.forEach(id => {
  const found = formulas.find(f => f.id === id);
  console.log(`\n=================== ${id} ===================`);
  if (found) {
    console.log(JSON.stringify(found, null, 2));
  } else {
    console.log('NOT FOUND');
  }
});
