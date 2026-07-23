/**
 * Inspect CloudTCM disease page structure at /disease/tcm/2 (氣喘)
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

function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n').replace(/<\/li>/gi, '\n').replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/\n{3,}/g, '\n\n').trim();
}

async function main() {
  const url = 'https://cloudtcm.com/disease/tcm/2';
  const res = await fetchUrl(url);
  const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
  if (!match) { console.log('No NEXT_DATA'); return; }
  const pd = JSON.parse(match[1]).props.pageProps.pageData || {};

  console.log('=== CloudTCM Disease /disease/tcm/2 Field Dump ===\n');
  console.log('All keys:', Object.keys(pd).join(', '));
  console.log('');

  for (const [k, v] of Object.entries(pd)) {
    if (!v) continue;
    if (typeof v === 'string') {
      const plain = stripHtml(v);
      console.log(`\n[${k}] (${plain.length} chars):`);
      console.log(plain.slice(0, 300));
    } else if (Array.isArray(v)) {
      console.log(`\n[${k}] (array, ${v.length} items):`);
      console.log(JSON.stringify(v.slice(0, 2), null, 2).slice(0, 300));
    } else if (typeof v === 'object') {
      console.log(`\n[${k}] (object):`);
      console.log(JSON.stringify(v, null, 2).slice(0, 300));
    }
  }
}

main();
