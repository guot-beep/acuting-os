/**
 * Inspect CloudTCM acupoint page structure for safety/caution fields.
 * URL pattern: https://cloudtcm.com/acupoint/<numeric_id>
 * Check a known acupoint (acupoint/361 = ST36 足三里 by sitemap order)
 */
const https = require('https');

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve) => {
    if (redirects > 5) return resolve({ status: 500, body: '' });
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) && res.headers.location) {
        const redirect = res.headers.location.startsWith('http') ? res.headers.location : `https://cloudtcm.com${res.headers.location}`;
        return fetchUrl(redirect, redirects + 1).then(resolve);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', () => resolve({ status: 500, body: '' }));
  });
}

async function inspectAcupoint(id) {
  const url = `https://cloudtcm.com/acupoint/${id}`;
  const res = await fetchUrl(url);
  if (res.status !== 200) { console.log(`${id}: HTTP ${res.status}`); return null; }
  const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
  if (!match) { console.log(`${id}: No NEXT_DATA`); return null; }
  const pd = JSON.parse(match[1]).props.pageProps.pageData || {};
  return { id, url, pd };
}

async function main() {
  // Sample a few acupoints from the sitemap: 361, 36, 100, 200
  const testIds = [361, 360, 100, 50, 1];

  for (const id of testIds) {
    const result = await inspectAcupoint(id);
    if (!result) continue;
    const { pd } = result;

    const name = pd.AcupointNameCH || pd.NameCH || pd.name_zh || '?';
    const code = pd.AcupointCode || pd.Code || pd.code || '?';
    console.log(`\n=== Acupoint ${id}: ${name} (${code}) ===`);
    console.log('All keys:', Object.keys(pd).join(', '));

    // Print caution/safety-related fields
    const cautionKeys = Object.keys(pd).filter(k => /caution|safe|注意|warn|禁忌|precaut|contra|side|adverse/i.test(k));
    console.log('Caution keys:', cautionKeys);
    cautionKeys.forEach(k => {
      const v = pd[k];
      if (v) console.log(`  ${k}:`, typeof v === 'string' ? v.slice(0, 300) : JSON.stringify(v).slice(0, 300));
    });

    // Also check needling/moxibustion safety fields
    const needlingKeys = Object.keys(pd).filter(k => /needl|mox|needle|acupunc|刺|灸|針/i.test(k));
    console.log('Needling keys:', needlingKeys);
    needlingKeys.forEach(k => {
      const v = pd[k];
      if (v) console.log(`  ${k}:`, typeof v === 'string' ? v.slice(0, 200) : JSON.stringify(v).slice(0, 200));
    });
  }
}

main();
