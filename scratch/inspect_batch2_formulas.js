/**
 * scratch/inspect_batch2_formulas.js
 * Inspects formula.huang_lian_jie_du_tang, formula.long_dan_xie_gan_tang, formula.dao_chi_san in formulas.json
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

const ids = [
  'formula.huang_lian_jie_du_tang',
  'formula.long_dan_xie_gan_tang',
  'formula.dao_chi_san'
];

ids.forEach(id => {
  const r = data.records.find(item => item.id === id);
  console.log(`\n================ ID: ${id} ================`);
  console.log('name_zh:', r?.name_zh);
  console.log('name_en:', r?.name_en);
  console.log('pinyin:', r?.pinyin);
  console.log('category:', r?.category || r?.category_zh);
  console.log('cloudtcm_url:', r?.cloudtcm_url);
  console.log('american_dragon_url:', r?.american_dragon_url);
  console.log('composition:', JSON.stringify(r?.composition, null, 2));
});
