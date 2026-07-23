const https = require('https');

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve) => {
    if (redirects > 5) return resolve({ status: 500, body: '' });
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http') ? res.headers.location : `https://cloudtcm.com${res.headers.location}`;
        return fetchUrl(redirectUrl, redirects + 1).then(resolve);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', () => resolve({ status: 500, body: '' }));
  });
}

async function test() {
  const res = await fetchUrl('https://cloudtcm.com/herb/1');
  const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
  if (match) {
    const pd = JSON.parse(match[1]).props.pageProps.pageData || {};
    console.log('HerbFuntion_JSON:', pd.HerbFuntion_JSON);
    console.log('HerbTagAnalysisCH_JSON:', pd.HerbTagAnalysisCH_JSON);
    console.log('BD_Analysis sample:', (pd.BD_Analysis || '').slice(0, 400));
    console.log('MetaDescription sample:', (pd.MetaDescription || '').slice(0, 300));
  }
}

test();
