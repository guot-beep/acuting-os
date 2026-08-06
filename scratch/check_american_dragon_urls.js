/**
 * scratch/check_american_dragon_urls.js
 * Checks American Dragon URLs for all 9 gold-standard formulas.
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

const targets = [
  'formula.ma_huang_tang',
  'formula.gui_zhi_tang',
  'formula.yin_qiao_san',
  'formula.sang_ju_yin',
  'formula.bai_hu_tang',
  'formula.xiao_qing_long_tang',
  'formula.huang_lian_jie_du_tang',
  'formula.long_dan_xie_gan_tang',
  'formula.dao_chi_san'
];

console.log('Inspecting URLs in formulas.json:');
targets.forEach(id => {
  const r = data.records.find(item => item.id === id);
  console.log(`\n${id} (${r?.name_zh}):`);
  console.log('  cloudtcm_url:', r?.cloudtcm_url);
  console.log('  american_dragon_url:', r?.american_dragon_url);
});
