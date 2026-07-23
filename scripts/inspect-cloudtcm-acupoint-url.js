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

async function tryUrls() {
  const candidates = [
    'https://cloudtcm.com/acupoint/ST36',
    'https://cloudtcm.com/acupoints/ST36',
    'https://cloudtcm.com/point/ST36',
    'https://cloudtcm.com/points/ST36',
    'https://cloudtcm.com/acupoint/36',
    'https://cloudtcm.com/acupoint/stomach-36',
    'https://cloudtcm.com/treatment/ST36',
  ];
  for (const url of candidates) {
    const res = await fetchUrl(url);
    console.log(`${res.status}  ${url}`);
    if (res.status === 200) {
      const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
      if (match) {
        const pd = JSON.parse(match[1]).props.pageProps.pageData || {};
        console.log('  Keys:', Object.keys(pd).slice(0, 15).join(', '));
        const cautionKeys = Object.keys(pd).filter(k => /caution|safe|注意|warn|禁忌|precaut/i.test(k));
        console.log('  Caution keys:', cautionKeys);
      }
    }
  }
}

tryUrls();
