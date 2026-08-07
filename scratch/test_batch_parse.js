const https = require('https');
const fs = require('fs');
const path = require('path');

const cacheDir = path.join(__dirname, 'ad_cache');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (m, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (m, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function cleanText(s) {
  if (!s) return '';
  return decodeEntities(s)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n');
}

function parseFormulaHtml(html, url = '') {
  // Title from <title> tag
  let pageTitle = '';
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    pageTitle = cleanText(titleMatch[1]);
  }

  // Parse title components: Pinyin, Chinese, English, Also Known As
  let pinyin = '';
  let chinese = '';
  let englishName = '';
  let alsoKnownAs = '';

  const engMatch = html.match(/English:\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
  if (engMatch) englishName = cleanText(engMatch[1]);

  const akaMatch = html.match(/Also Known As:\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
  if (akaMatch) alsoKnownAs = cleanText(akaMatch[1]);

  if (pageTitle) {
    const parts = pageTitle.split(/\s*-\s*/).map(p => p.trim());
    if (parts.length >= 1) pinyin = parts[0];
    if (parts.length >= 2 && /[\u4e00-\u9fa5]/.test(parts[1])) chinese = parts[1];
    if (!englishName && parts.length >= 3) englishName = parts[2];
    if (!alsoKnownAs && parts.length >= 4 && !parts[3].includes('Chinese Herbs') && !parts[3].includes('American Dragon')) {
      alsoKnownAs = parts[3];
    }
  }

  // Extract FORMULA ACTIONS
  const actions = [];
  const actionsPos = html.indexOf('FORMULA ACTIONS');
  if (actionsPos !== -1) {
    const slice = html.slice(actionsPos, actionsPos + 3000);
    // Stop at next major header
    const nextHeaderMatch = slice.match(/SYNDROMES|HERBS AND ACTIONS|TCM PATTERNS|CLINICAL MANIFESTATIONS|CONTRAINDICATIONS/i);
    const endIdx = nextHeaderMatch && nextHeaderMatch.index > 50 ? nextHeaderMatch.index : 3000;
    const actionsChunk = slice.slice(0, endIdx);
    
    // Extract list items or lines
    const cleanedChunk = cleanText(actionsChunk);
    const lines = cleanedChunk.split('\n').map(l => l.trim()).filter(Boolean);
    let collect = false;
    for (const l of lines) {
      if (l.includes('FORMULA ACTIONS')) { collect = true; continue; }
      if (collect) {
        if (/^[A-Z\s]{4,}$/.test(l) && !l.includes('QI') && !l.includes('YANG')) break;
        actions.push(l);
      }
    }
  }

  // Extract SYNDROMES & CLINICAL MANIFESTATIONS
  const syndromes = [];
  const synPos = html.indexOf('SYNDROMES');
  if (synPos !== -1) {
    const slice = html.slice(synPos, synPos + 8000);
    const nextHeaderMatch = slice.match(/HERBS AND ACTIONS|FORMULA INGREDIENTS|CONTRAINDICATIONS|TCM PATTERNS|PRECAUTIONS/i);
    const endIdx = nextHeaderMatch && nextHeaderMatch.index > 50 ? nextHeaderMatch.index : 8000;
    const synChunk = slice.slice(0, endIdx);

    const cleanedSyn = cleanText(synChunk);
    const synLines = cleanedSyn.split('\n').map(l => l.trim()).filter(Boolean);
    let currentSyn = null;

    for (let i = 0; i < synLines.length; i++) {
      const line = synLines[i];
      if (line === 'SYNDROMES') continue;
      if (line === 'CLINICAL MANIFESTATIONS') continue;

      if (!currentSyn) {
        currentSyn = { name: line, manifestations: [] };
      } else if (line.startsWith('T:') || line.startsWith('C:') || line.startsWith('P:') || line.length > 3) {
        if (line.includes('HERBS AND ACTIONS') || line.includes('FORMULA INGREDIENTS')) break;
        currentSyn.manifestations.push(line);
      }
    }
    if (currentSyn) syndromes.push(currentSyn);
  }

  return {
    url,
    pinyin,
    chinese,
    englishName,
    alsoKnownAs,
    pageTitle,
    actions,
    syndromes
  };
}

async function testBatch() {
  const adUrls = JSON.parse(fs.readFileSync('scratch/all_ad_formula_urls.json', 'utf8'));
  console.log('Testing 10 random formula parses...');
  const sample10 = adUrls.slice(0, 10);

  for (const item of sample10) {
    console.log('Fetching:', item.url);
    const res = await fetchUrl(item.url);
    const parsed = parseFormulaHtml(res.body, item.url);
    console.log('Parsed:', parsed.pinyin, '|', parsed.chinese, '|', parsed.englishName);
    console.log('  Actions count:', parsed.actions.length, 'Syndromes count:', parsed.syndromes.length);
  }
}

testBatch().catch(console.error);
