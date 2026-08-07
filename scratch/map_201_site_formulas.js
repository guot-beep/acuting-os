const fs = require('fs');

const formulas = JSON.parse(fs.readFileSync('data/herbs/formulas.json', 'utf8')).records;
const adUrls = JSON.parse(fs.readFileSync('scratch/formula_only_ad_urls.json', 'utf8'));

function norm(s) {
  if (!s) return '';
  return s.toLowerCase()
    .replace(/tang|wan|san|yin|zi|jian/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function fullNorm(s) {
  if (!s) return '';
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const siteMap = [];

formulas.forEach((f, idx) => {
  let matchedUrl = f.american_dragon_url || f.exact_source_url;

  if (!matchedUrl && f.source_urls && Array.isArray(f.source_urls)) {
    matchedUrl = f.source_urls.find(u => u.includes('americandragon'));
  }

  if (!matchedUrl) {
    const pinyinFull = fullNorm(f.pinyin);
    const pinyinStem = norm(f.pinyin);
    const enFull = fullNorm(f.name_en);

    // 1. Try full pinyin match
    let match = adUrls.find(u => fullNorm(u.rel).includes(pinyinFull));
    
    // 2. Try pinyin stem match
    if (!match && pinyinStem.length > 4) {
      match = adUrls.find(u => norm(u.rel).includes(pinyinStem));
    }

    // 3. Try English name match
    if (!match && enFull.length > 6) {
      match = adUrls.find(u => fullNorm(u.rel).includes(enFull));
    }

    if (match) matchedUrl = match.url;
  }

  siteMap.push({
    index: idx + 1,
    id: f.id,
    name_zh: f.name_zh || '',
    name_en: f.name_en || '',
    pinyin: f.pinyin || '',
    url: matchedUrl || null
  });
});

const matchedCount = siteMap.filter(s => s.url).length;
console.log(`Matched ${matchedCount} / ${formulas.length} site formulas`);

const missing = siteMap.filter(s => !s.url);
if (missing.length > 0) {
  console.log('\nMissing formulas count:', missing.length);
  missing.forEach(m => console.log(`  ${m.index}. ${m.id} | ${m.name_zh} | ${m.pinyin} | ${m.name_en}`));
}

fs.writeFileSync('scratch/mapped_201_site_formulas.json', JSON.stringify(siteMap, null, 2), 'utf8');
