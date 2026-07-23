const fs = require('fs');
const path = require('path');
const https = require('https');

const FORMULAS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'formulas.json');
const MAP_OUT_FILE = path.join(__dirname, '..', 'data', 'imports', 'cloudtcm', 'formula_url_map.json');

const formulasData = JSON.parse(fs.readFileSync(FORMULAS_FILE, 'utf8'));
const existingMap = fs.existsSync(MAP_OUT_FILE) ? JSON.parse(fs.readFileSync(MAP_OUT_FILE, 'utf8')) : {};

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', err => resolve({ status: 500, body: '' }));
  });
}

async function run() {
  console.log('Building exact CloudTCM formula map (IDs 251 to 600)...');
  const repoFormulas = new Map();
  formulasData.records.forEach(r => {
    repoFormulas.set(r.name_zh, r);
  });

  const resultMap = { ...existingMap };
  const foundSet = new Set();

  for (let id = 251; id <= 600; id++) {
    const url = `https://cloudtcm.com/formula/${id}`;
    const res = await fetchUrl(url);
    if (res.status === 200) {
      const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
      if (match) {
        try {
          const nextData = JSON.parse(match[1]);
          const pd = nextData.props.pageProps.pageData || {};
          const nameZh = pd.FormulaNameCH || pd.AlternateName || pd.Title;
          if (nameZh) {
            console.log(`CloudTCM #${id}: ${nameZh}`);
            resultMap[nameZh] = {
              cloudtcm_id: id,
              page_url: url,
              name_zh: nameZh,
              name_en: pd.FormulaNameEN,
              source: pd.Source,
              pageData: pd
            };
          }
        } catch (e) {}
      }
    }
  }

  repoFormulas.forEach((val, name) => {
    if (resultMap[name]) foundSet.add(name);
  });

  console.log(`Scanned CloudTCM IDs 251-600. Total mapped pages: ${Object.keys(resultMap).length}. Repo formulas matched: ${foundSet.size} / ${repoFormulas.size}.`);
  
  fs.writeFileSync(MAP_OUT_FILE, JSON.stringify(resultMap, null, 2), 'utf8');
  console.log(`Saved exact CloudTCM formula map to ${MAP_OUT_FILE}`);
}

run();
