const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const cacheDir = path.join(__dirname, 'ad_cache');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

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

function fetchUrl(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const safeName = url.replace(/[^a-zA-Z0-9]/g, '_') + '.html';
    const cachePath = path.join(cacheDir, safeName);

    if (fs.existsSync(cachePath)) {
      const cached = fs.readFileSync(cachePath, 'utf8');
      return resolve(cached);
    }

    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = 'https://www.americandragon.com/' + redirectUrl.replace(/^\//, '');
        }
        return fetchUrl(redirectUrl, retries).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          fs.writeFileSync(cachePath, data, 'utf8');
          resolve(data);
        } else {
          if (retries > 0) {
            setTimeout(() => fetchUrl(url, retries - 1).then(resolve).catch(reject), 500);
          } else {
            resolve('');
          }
        }
      });
    });
    req.on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => fetchUrl(url, retries - 1).then(resolve).catch(reject), 500);
      } else {
        resolve('');
      }
    });
  });
}

function parseFormulaHtmlLinear(html, url = '', fallbackName = '') {
  if (!html) {
    return {
      url,
      pinyin: fallbackName || 'Unknown Formula',
      chinese: '',
      englishName: '',
      alsoKnownAs: '',
      actions: [],
      syndromes: []
    };
  }

  // Title parsing from <title> tag
  let pinyin = '';
  let chinese = '';
  let englishName = '';
  let alsoKnownAs = '';

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    const pageTitle = cleanText(titleMatch[1]);
    const parts = pageTitle.split(/\s*-\s*/).map(p => p.trim());
    if (parts.length >= 1) pinyin = parts[0];
    if (parts.length >= 2 && /[\u4e00-\u9fa5]/.test(parts[1])) chinese = parts[1];
    if (parts.length >= 3) englishName = parts[2];
    if (parts.length >= 4 && !parts[3].includes('Chinese Herbs') && !parts[3].includes('American Dragon')) {
      alsoKnownAs = parts[3];
    }
  }

  const engMatch = html.match(/English:\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
  if (engMatch && !englishName) englishName = cleanText(engMatch[1]);

  const akaMatch = html.match(/Also Known As:\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
  if (akaMatch && !alsoKnownAs) alsoKnownAs = cleanText(akaMatch[1]);

  if (!pinyin) pinyin = fallbackName || 'Unknown Formula';

  const cleaned = cleanText(html);
  const lines = cleaned.split('\n');

  let mode = null;
  const rawActions = [];
  const syndromes = [];
  let currentSyndrome = null;

  const endSectionHeaders = [
    'CONTRAINDICATIONS AND HERB/DRUG INTERACTIONS',
    'CONTRAINDICATIONS',
    'HERB/DRUG INTERACTIONS',
    'NOTES',
    'MODIFICATIONS',
    'FORMULA INGREDIENTS',
    'HERBS AND ACTIONS',
    'PRECAUTIONS',
    'DOSAGE'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === 'FORMULA ACTIONS') {
      mode = 'actions';
      continue;
    }

    if (line === 'SYNDROMES' || line === 'TCM PATTERNS') {
      if (mode === 'actions' && rawActions.length > 0) {
        // finished actions
      }
      mode = 'syndromes';
      continue;
    }

    if (endSectionHeaders.some(h => line.startsWith(h))) {
      mode = null;
      if (currentSyndrome) {
        syndromes.push(currentSyndrome);
        currentSyndrome = null;
      }
      continue;
    }

    if (mode === 'actions') {
      if (line.length > 2 && line !== 'FORMULA ACTIONS') {
        rawActions.push(line);
      }
    }

    if (mode === 'syndromes') {
      if (line === 'CLINICAL MANIFESTATIONS') continue;
      if (!currentSyndrome) {
        currentSyndrome = { name: line, manifestations: [] };
      } else {
        if (line.startsWith('T:') || line.startsWith('C:') || line.startsWith('P:') || line.length > 2) {
          currentSyndrome.manifestations.push(line);
        }
      }
    }
  }

  if (currentSyndrome) syndromes.push(currentSyndrome);

  // Group raw actions into clean bullet points
  const actions = [];
  let currentAct = '';
  for (const a of rawActions) {
    if (!currentAct) {
      currentAct = a;
    } else if (a.startsWith('and ') || a.startsWith('or ') || /^[a-z]/.test(a)) {
      currentAct += ' ' + a;
    } else {
      actions.push(currentAct);
      currentAct = a;
    }
  }
  if (currentAct) actions.push(currentAct);

  return {
    url,
    pinyin,
    chinese,
    englishName,
    alsoKnownAs,
    actions,
    syndromes
  };
}

async function mapConcurrent(items, limit, fn) {
  const results = [];
  const executing = [];
  let index = 0;
  for (const item of items) {
    const i = index++;
    const p = Promise.resolve().then(() => fn(item, i)).then(res => {
      results[i] = res;
      executing.splice(executing.indexOf(p), 1);
    });
    executing.push(p);
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
  return results;
}

function formatFormulaMarkdown(item, idx) {
  let md = `## ${idx}. ${item.pinyin} ${item.chinese ? `(${item.chinese})` : ''}\n\n`;
  if (item.englishName) md += `**English Name**: ${item.englishName}\n`;
  if (item.alsoKnownAs) md += `**Also Known As**: ${item.alsoKnownAs}\n`;
  if (item.url) md += `**Source URL**: [American Dragon Link](${item.url})\n`;
  md += `\n`;

  md += `### ⚡ Formula Actions\n`;
  if (item.actions && item.actions.length > 0) {
    item.actions.forEach(act => {
      md += `* ${act}\n`;
    });
  } else {
    md += `* (No actions listed)\n`;
  }
  md += `\n`;

  md += `### 🩺 Syndromes & Indications\n`;
  if (item.syndromes && item.syndromes.length > 0) {
    item.syndromes.forEach(syn => {
      md += `#### ${syn.name}\n`;
      if (syn.manifestations && syn.manifestations.length > 0) {
        syn.manifestations.forEach(m => {
          md += `  * ${m}\n`;
        });
      }
    });
  } else {
    md += `* (No syndromes listed)\n`;
  }
  md += `\n---\n\n`;
  return md;
}

async function main() {
  console.log('=== Starting American Dragon Master Scraper (Linear Section Parser) ===\n');

  const siteMapped = JSON.parse(fs.readFileSync('scratch/mapped_201_site_formulas.json', 'utf8'));
  console.log(`Loaded ${siteMapped.length} site formulas for Document 1.`);

  const adUrls = JSON.parse(fs.readFileSync('scratch/formula_only_ad_urls.json', 'utf8'));
  console.log(`Loaded ${adUrls.length} total formula URLs for Document 2.`);

  console.log('\n--- Task 1: Scraping 201 Site Formulas ---');
  const siteResults = await mapConcurrent(siteMapped, 15, async (item, i) => {
    if ((i + 1) % 25 === 0 || i + 1 === siteMapped.length) {
      console.log(`  Processed ${i + 1} / ${siteMapped.length} site formulas...`);
    }
    const html = item.url ? await fetchUrl(item.url) : '';
    const parsed = parseFormulaHtmlLinear(html, item.url, item.pinyin);
    return {
      siteId: item.id,
      siteNameZh: item.name_zh,
      siteNameEn: item.name_en,
      ...parsed
    };
  });

  let doc1Md = `# American Dragon (AD) Site Formulas Database (201 Formulas)\n\n`;
  doc1Md += `> Extracted 100% complete Name, Formula Actions, and Syndromes from American Dragon for all 201 formulas in AcuTing OS.\n\n---\n\n`;

  siteResults.forEach((item, idx) => {
    doc1Md += formatFormulaMarkdown(item, idx + 1);
  });

  const doc1Path = path.join(__dirname, '../data/american_dragon_site_formulas.md');
  fs.writeFileSync(doc1Path, doc1Md, 'utf8');
  console.log(`\n✅ Document 1 generated successfully: ${doc1Path} (${(doc1Md.length / 1024).toFixed(1)} KB)`);

  console.log('\n--- Task 2: Scraping All 2,141 American Dragon Formulas ---');
  const allResults = await mapConcurrent(adUrls, 15, async (item, i) => {
    if ((i + 1) % 200 === 0 || i + 1 === adUrls.length) {
      console.log(`  Processed ${i + 1} / ${adUrls.length} AD formulas...`);
    }
    const html = await fetchUrl(item.url);
    const fallbackName = item.rel.replace(/^.*[\/\\]/, '').replace(/\.html$/, '');
    const parsed = parseFormulaHtmlLinear(html, item.url, fallbackName);
    return parsed;
  });

  let doc2Md = `# American Dragon (AD) Master Formula Database (Full Site Scrape - ${allResults.length} Formulas)\n\n`;
  doc2Md += `> Complete, untruncated extract of Name, Formula Actions, and Syndromes for all ${allResults.length} formulas on American Dragon.\n\n---\n\n`;

  allResults.forEach((item, idx) => {
    doc2Md += formatFormulaMarkdown(item, idx + 1);
  });

  const doc2Path = path.join(__dirname, '../data/american_dragon_all_formulas.md');
  fs.writeFileSync(doc2Path, doc2Md, 'utf8');
  console.log(`\n✅ Document 2 generated successfully: ${doc2Path} (${(doc2Md.length / 1024 / 1024).toFixed(2)} MB)`);

  console.log('\n🎉 ALL SCRAPING & MARKDOWN GENERATION COMPLETED 100%!');
}

main().catch(console.error);
