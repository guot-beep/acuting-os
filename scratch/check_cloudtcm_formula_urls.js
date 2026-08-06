/**
 * scratch/check_cloudtcm_formula_urls.js
 * Checks CloudTCM URLs across all formulas in data/herbs/formulas.json
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

data.records.forEach(r => {
  if (r.id.includes('yin_qiao_san') || r.id.includes('sang_ju_yin') || r.id.includes('bai_hu_tang') || r.id.includes('er_chen_tang')) {
    console.log(`Formula: ${r.id} (${r.name_zh})`);
    console.log(`  cloudtcm_url: ${r.cloudtcm_url}`);
    console.log(`  american_dragon_url: ${r.american_dragon_url}`);
    console.log(`  source_urls: ${JSON.stringify(r.source_urls)}`);
    console.log(`  external_links: ${JSON.stringify(r.external_links)}`);
  }
});
