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

async function inspectPage(label, url) {
  console.log(`\n========== ${label} ==========`);
  console.log(`URL: ${url}`);
  const res = await fetchUrl(url);
  if (res.status !== 200) { console.log(`HTTP ${res.status}`); return; }
  const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
  if (!match) { console.log('No NEXT_DATA'); return; }
  const pd = JSON.parse(match[1]).props.pageProps.pageData || {};
  console.log('Keys:', Object.keys(pd).join(', '));

  // Print caution/safety-related fields
  const cautionKeys = Object.keys(pd).filter(k =>
    /caution|safe|注意|side|adverse|contrain|warn|禁忌|危|precaut/i.test(k)
  );
  console.log('Caution-related keys:', cautionKeys);
  cautionKeys.forEach(k => {
    const v = pd[k];
    if (typeof v === 'string' && v.length > 0) {
      console.log(`\n-- ${k} (string, ${v.length} chars) --`);
      console.log(v.slice(0, 600));
    } else if (v && typeof v === 'object') {
      console.log(`\n-- ${k} (object) --`);
      console.log(JSON.stringify(v, null, 2).slice(0, 600));
    }
  });
}

async function main() {
  // Formula: 麻黃湯 formula/1
  await inspectPage('FORMULA: 麻黃湯 (formula/1)', 'https://cloudtcm.com/formula/1');
  // Acupoint: ST36 足三里
  await inspectPage('ACUPOINT: 足三里 (acupoint/ST36)', 'https://cloudtcm.com/acupoint/ST36');
  // Also try alternative acupoint URL patterns
  await inspectPage('ACUPOINT: 足三里 (acupoints/ST36)', 'https://cloudtcm.com/acupoints/ST36');
}

main();
