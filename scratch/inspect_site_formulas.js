const fs = require('fs');

const formulas = JSON.parse(fs.readFileSync('data/herbs/formulas.json', 'utf8'));

console.log('Site formulas count:', formulas.length);
console.log('Sample formula:', {
  id: formulas[0].id,
  nameZh: formulas[0].nameZh,
  nameEn: formulas[0].nameEn,
  pinyin: formulas[0].pinyin,
  ad_url: formulas[0].ad_url || formulas[0].source_url || formulas[0].cloudtcm_url
});

// Check how many have ad_url already
const withAdUrl = formulas.filter(f => f.ad_url || (f.source_url && f.source_url.includes('americandragon')));
console.log('Formulas with existing American Dragon URL:', withAdUrl.length);
