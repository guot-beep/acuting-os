/**
 * scratch/find_batch2_cloudtcm_urls.js
 * Finds existing CloudTCM & AD URLs for Huang Lian Jie Du Tang, Long Dan Xie Gan Tang, Dao Chi San in formulas.json
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

const targets = [
  'formula.huang_lian_jie_du_tang',
  'formula.long_dan_xie_gan_tang',
  'formula.dao_chi_san'
];

targets.forEach(id => {
  const r = data.records.find(item => item.id === id);
  console.log(`\nID: ${id}`);
  console.log('  cloudtcm_url:', r?.cloudtcm_url);
  console.log('  american_dragon_url:', r?.american_dragon_url);
  console.log('  source_urls:', r?.source_urls);
  console.log('  external_links:', JSON.stringify(r?.external_links));
});
