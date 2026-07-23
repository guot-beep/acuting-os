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

async function test() {
  // 山藥 herb/1162
  const res = await fetchUrl('https://cloudtcm.com/herb/1162');
  const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
  if (!match) { console.log('No NEXT_DATA found'); return; }
  const pd = JSON.parse(match[1]).props.pageProps.pageData || {};

  // Print all top-level keys
  console.log('pageData keys:', Object.keys(pd));
  console.log('');

  // Print caution-related fields
  const cautionKeys = Object.keys(pd).filter(k => /caution|safe|注意|side|adverse|contrain|warn/i.test(k));
  console.log('Caution-related keys:', cautionKeys);
  cautionKeys.forEach(k => {
    const v = pd[k];
    console.log(`\n--- ${k} ---`);
    if (typeof v === 'string') console.log(v.slice(0, 500));
    else console.log(JSON.stringify(v, null, 2).slice(0, 800));
  });
}

test();
