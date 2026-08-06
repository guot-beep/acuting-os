/**
 * scratch/find_non_array_fields.js
 * Inspects formulas.json for non-array values in expected array fields
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

const arrayFields = ['pattern_focus_en', 'pattern_focus_zh', 'safety_flags', 'modern_clinical_use_tags', 'study_tags', 'actions_en', 'actions_zh', 'key_pairs', 'formula_family', 'applications_zh', 'applications_en'];

data.records.forEach((r) => {
  arrayFields.forEach(field => {
    if (r[field] !== undefined && r[field] !== null && !Array.isArray(r[field])) {
      console.log(`Formula ${r.id} has NON-ARRAY in field ${field}: typeof = ${typeof r[field]}, value = ${JSON.stringify(r[field])}`);
    }
  });
});
