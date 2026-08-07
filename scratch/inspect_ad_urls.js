const fs = require('fs');
const formulas = JSON.parse(fs.readFileSync('data/herbs/formulas.json', 'utf8')).records;
const adUrls = JSON.parse(fs.readFileSync('scratch/all_ad_formula_urls.json', 'utf8'));

console.log('Site formulas:', formulas.length);
console.log('AD URLs count:', adUrls.length);

let matched = 0;
const siteAdMap = [];

formulas.forEach(f => {
  let adUrl = f.american_dragon_url || (f.source_urls && f.source_urls.find(u => u.includes('americandragon'))) || f.exact_source_url;
  
  // If no explicit adUrl, let's match by pinyin or English name in adUrls!
  if (!adUrl) {
    const cleanPinyin = (f.pinyin || f.name_zh || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanEn = (f.name_en || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const found = adUrls.find(u => {
      const relLower = u.rel.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (cleanPinyin && relLower.includes(cleanPinyin)) || (cleanEn && relLower.includes(cleanEn));
    });
    if (found) {
      adUrl = found.url;
    }
  }

  if (adUrl) {
    matched++;
    siteAdMap.push({ id: f.id, name_zh: f.name_zh, name_en: f.name_en, pinyin: f.pinyin, adUrl });
  } else {
    siteAdMap.push({ id: f.id, name_zh: f.name_zh, name_en: f.name_en, pinyin: f.pinyin, adUrl: null });
  }
});

console.log('Matched site formulas to American Dragon URL:', matched, '/', formulas.length);
const missing = siteAdMap.filter(m => !m.adUrl);
console.log('Missing count:', missing.length);
if (missing.length > 0) {
  console.log('Sample missing:', missing.slice(0, 10));
}

fs.writeFileSync('scratch/site_ad_map.json', JSON.stringify(siteAdMap, null, 2), 'utf8');
