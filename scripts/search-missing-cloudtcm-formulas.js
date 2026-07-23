const fs = require('fs');
const path = require('path');
const https = require('https');

const FORMULAS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'formulas.json');
const MAP_OUT_FILE = path.join(__dirname, '..', 'data', 'imports', 'cloudtcm', 'formula_url_map.json');

const formulasData = JSON.parse(fs.readFileSync(FORMULAS_FILE, 'utf8'));
const resultMap = fs.existsSync(MAP_OUT_FILE) ? JSON.parse(fs.readFileSync(MAP_OUT_FILE, 'utf8')) : {};

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', err => resolve({ status: 500, body: '' }));
  });
}

async function searchFormula(nameZh) {
  const searchUrl = `https://cloudtcm.com/formula/search?query=${encodeURIComponent(nameZh)}`;
  const res = await fetchUrl(searchUrl);
  if (res.status === 200) {
    // Look for href="/formula/<id>" links in search page
    const matches = [...res.body.matchAll(/\/formula\/(\d+)/g)];
    if (matches && matches.length > 0) {
      const firstId = matches[0][1];
      console.log(`FOUND SEARCH LINK: ${nameZh} -> https://cloudtcm.com/formula/${firstId}`);
      return {
        cloudtcm_id: parseInt(firstId, 10),
        page_url: `https://cloudtcm.com/formula/${firstId}`,
        name_zh: nameZh
      };
    }
  }
  return null;
}

async function run() {
  console.log('Searching exact CloudTCM record pages for missing formulas...');
  const missing = [];
  formulasData.records.forEach(r => {
    if (!resultMap[r.name_zh]) {
      missing.push(r.name_zh);
    }
  });

  console.log(`Currently missing ${missing.length} formula exact pages.`);
  for (const name of missing) {
    const found = await searchFormula(name);
    if (found) {
      resultMap[name] = found;
    } else {
      console.log(`NOT FOUND ON CLOUDTCM: ${name}`);
    }
  }

  fs.writeFileSync(MAP_OUT_FILE, JSON.stringify(resultMap, null, 2), 'utf8');
  console.log(`Updated formula map with search discoveries in ${MAP_OUT_FILE}`);
}

run();
