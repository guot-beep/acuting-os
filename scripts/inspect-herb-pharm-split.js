/**
 * Inspect HerbTagAnalysisCH_JSON HerbPharm split for 羌活
 * HerbPharm=0 → 傳統功效, HerbPharm=1 → 現代藥理
 */
const https = require('https');
function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', () => resolve({ status: 500, body: '' }));
  });
}
async function main() {
  // 羌活 — find its CloudTCM ID from herb_url_map
  const fs = require('fs');
  const map = JSON.parse(fs.readFileSync('data/imports/cloudtcm/herb_url_map.json', 'utf8'));
  const entry = map.entries.find(e => e.name_zh === '羌活');
  console.log('羌活 entry:', entry);
  if (!entry) return;
  const res = await fetchUrl(entry.page_url);
  const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
  const pd = JSON.parse(match[1]).props.pageProps.pageData || {};
  const tags = pd.HerbTagAnalysisCH_JSON || [];
  console.log('\nAll tags with HerbPharm:');
  tags.forEach(t => console.log(`  HerbPharm=${t.HerbPharm}  TagName="${t.TagName}"`));
  const traditional = tags.filter(t => t.HerbPharm === 0).map(t => t.TagName);
  const modern = tags.filter(t => t.HerbPharm === 1).map(t => t.TagName);
  console.log('\nTraditional (HerbPharm=0):', traditional);
  console.log('Modern (HerbPharm=1):', modern);
}
main();
