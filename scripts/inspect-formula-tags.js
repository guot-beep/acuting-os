/**
 * Inspect CloudTCM formula tag structure:
 * FormulaTag_JSON, FormulaSyndrome_JSON, ModernDisease_JSON, Symptom_JSON, Pain_JSON, etc.
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
  const urls = [
    'https://cloudtcm.com/formula/1', // 麻黃湯
    'https://cloudtcm.com/formula/2', // 桂枝湯
    'https://cloudtcm.com/formula/15' // 六味地黃丸
  ];
  for (const u of urls) {
    const res = await fetchUrl(u);
    const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) continue;
    const pd = JSON.parse(match[1]).props.pageProps.pageData || {};
    console.log(`\n=== Formula ${pd.FormulaNameCH || pd.Title} (${u}) ===`);
    console.log('FormulaTag_JSON:', pd.FormulaTag_JSON);
    console.log('FormulaSyndrome_JSON:', pd.FormulaSyndrome_JSON);
    console.log('ModernDisease_JSON sample:', (pd.ModernDisease_JSON || []).slice(0, 5));
    console.log('Symptom_JSON sample:', (pd.Symptom_JSON || []).slice(0, 5));
  }
}
main();
