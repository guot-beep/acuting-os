const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/pathology/condition_canon_shortlist.json', 'utf8'));
const recs = data.records || data;
console.log('Total conditions:', recs.length);
const fields = ['id','name_zh','name_en','cloudtcm_url','etiology_zh','symptoms_zh','tcm_patterns','treatment_principles','acupoint_protocols','herb_formulas','review_status'];
const empty = {};
fields.forEach(f => {
  empty[f] = recs.filter(r => !r[f] || (Array.isArray(r[f]) && r[f].length === 0) || r[f] === '').length;
});
console.log('Empty field counts:', JSON.stringify(empty, null, 2));
console.log('\nSample record (first):', JSON.stringify(recs[0], null, 2).slice(0, 1000));
console.log('\nSample record (second):', JSON.stringify(recs[1], null, 2).slice(0, 400));
