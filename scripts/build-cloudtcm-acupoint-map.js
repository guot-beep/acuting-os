/**
 * Build a mapping from CloudTCM acupoint numeric IDs to AcuCode/AcuNameCH.
 * Fetches each acupoint from sitemap (IDs 1-400+) and records AcuCode, AcuNameCH, AcuNameEN.
 * Saves to: data/imports/cloudtcm/acupoint_url_map.json
 * 
 * This is used by fetch-cloudtcm-acupoint-safety.js to match our points (ST36 etc.) 
 * to CloudTCM numeric IDs.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, '..', 'data', 'imports', 'cloudtcm', 'acupoint_url_map.json');
const IS_TEST = process.argv.includes('--test');

// CloudTCM sitemap acupoint IDs — from sitemap: 1-371 are standard + some extras up to 2475
// We'll fetch all numeric IDs from 1 to 371 and also the higher ones seen in sitemap
const SITEMAP_IDS = [];
for (let i = 1; i <= 371; i++) SITEMAP_IDS.push(i);
// Extra IDs seen in sitemap
[955, 956, 957, 958, 959, 960, 961, 962, 2272, 2273, 2475].forEach(id => SITEMAP_IDS.push(id));

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve) => {
    if (redirects > 5) return resolve({ status: 500, body: '' });
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
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

async function main() {
  console.log('=== Build CloudTCM Acupoint URL Map ===');
  const idsToProcess = IS_TEST ? SITEMAP_IDS.slice(0, 10) : SITEMAP_IDS;
  const entries = [];
  let found = 0, missing = 0;

  for (const id of idsToProcess) {
    const url = `https://cloudtcm.com/acupoint/${id}`;
    const res = await fetchUrl(url);
    if (res.status !== 200) { missing++; continue; }
    const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) { missing++; continue; }
    try {
      const pd = JSON.parse(match[1]).props.pageProps.pageData || {};
      const acuCode = pd.AcuCode || null;   // e.g. "ST36"
      const nameZh = pd.AcuNameCH || null;  // e.g. "足三里"
      const nameEn = pd.AcuNameEN || null;  // e.g. "Zusanli"
      const hasCaution = pd.Caution && pd.Caution.trim().length > 0;

      entries.push({ cloudtcm_id: id, page_url: url, acu_code: acuCode, name_zh: nameZh, name_en: nameEn, has_caution: hasCaution });
      console.log(`[${id}] ${acuCode || '?'} ${nameZh || '?'} caution=${hasCaution}`);
      found++;
    } catch (e) {
      missing++;
    }
  }

  const output = { generated_at: new Date().toISOString(), source: 'CloudTCM sitemap + page scrape', total: entries.length, entries };

  if (!IS_TEST) {
    const dir = path.dirname(OUT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');
    console.log(`\nSaved ${found} acupoints to ${OUT_FILE}`);
  } else {
    console.log('\nTest entries:', JSON.stringify(entries, null, 2));
  }
}

main();
