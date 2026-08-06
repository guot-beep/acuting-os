/**
 * scratch/fix_formula_json_types.js
 * Normalizes pattern_focus_en, pattern_focus_zh, safety_flags to arrays in data/herbs/formulas.json
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

let fixedCount = 0;
data.records.forEach((r) => {
  ['pattern_focus_en', 'pattern_focus_zh', 'safety_flags', 'modern_clinical_use_tags', 'study_tags'].forEach(field => {
    if (r[field] !== undefined && r[field] !== null && !Array.isArray(r[field])) {
      if (typeof r[field] === 'string') {
        const val = r[field].trim();
        r[field] = val ? [val] : [];
      } else {
        r[field] = [];
      }
      fixedCount++;
    }
  });
});

fs.writeFileSync(formulaPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Normalized ${fixedCount} non-array fields in formulas.json to arrays!`);
