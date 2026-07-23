#!/usr/bin/env node
/**
 * Exact CloudTCM Scraper & Data Importer for AcuTing OS Formulas.
 * 
 * Rules:
 * 1. Fetches exact page data from https://cloudtcm.com/formula/<id>
 * 2. Parses exact composition (herb names, grams), actions, indications, cautions, source.
 * 3. Saves exact source_urls, exact_source_url, and fetched_at timestamp.
 * 4. NEVER generates template fallback herbs ('主藥'/'輔藥') or indication text ('所主之證候').
 * 5. Leaves missing fields as null / [].
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const FORMULAS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'formulas.json');
const MAP_FILE = path.join(__dirname, '..', 'data', 'imports', 'cloudtcm', 'formula_url_map.json');

const IS_TEST_RUN = process.argv.includes('--test');

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', err => resolve({ status: 500, body: '' }));
  });
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

function parseActionsAndIndications(actionHtml) {
  const text = stripHtml(actionHtml);
  if (!text) return { actions_zh: [], pattern_indications_zh: [] };

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const actions_zh = [];
  const pattern_indications_zh = [];

  let currentSec = '';
  lines.forEach(line => {
    if (line.includes('主治功效') || line.includes('功效')) {
      currentSec = 'actions';
    } else if (line.includes('主治') || line.includes('適應症') || line.includes('證候')) {
      currentSec = 'indications';
    } else if (currentSec === 'actions') {
      actions_zh.push(line.replace(/^[0-9.：:\s]+/, ''));
    } else if (currentSec === 'indications' || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('•')) {
      pattern_indications_zh.push(line.replace(/^[0-9.：:\s•]+/, ''));
    }
  });

  if (actions_zh.length === 0 && lines.length > 0) {
    actions_zh.push(lines[0]);
  }
  if (pattern_indications_zh.length === 0 && lines.length > 1) {
    pattern_indications_zh.push(...lines.slice(1));
  }

  return { actions_zh, pattern_indications_zh };
}

function parseCautions(cautionsHtml) {
  const text = stripHtml(cautionsHtml);
  if (!text) return [];
  return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
}

function sanitizeRecord(r) {
  // Remove bare root URLs
  if (r.source_urls && Array.isArray(r.source_urls)) {
    r.source_urls = r.source_urls.filter(url => !/^https?:\/\/cloudtcm\.com\/(formula|herb)\/?$/i.test(url) && !/search\?query=/i.test(url));
  }

  // Remove empty or template herb items
  if (r.composition && Array.isArray(r.composition)) {
    r.composition = r.composition.filter(h => h.herb_zh && h.herb_zh !== "主藥" && h.herb_zh !== "輔藥" && h.herb_zh !== "???");
  }

  // Clean template phrases in text fields
  const cleanArray = (arr) => {
    if (!arr || !Array.isArray(arr)) return arr;
    return arr.filter(str => !/所主之證候|傳統所主|調理.*對應證候|\?\?\?/.test(str));
  };

  r.actions_zh = cleanArray(r.actions_zh);
  r.pattern_indications_zh = cleanArray(r.pattern_indications_zh);
  r.indications_zh = cleanArray(r.indications_zh);

  if (r.fang_yi_zh && /所主之證候|傳統所主|\?\?\?/.test(r.fang_yi_zh)) {
    r.fang_yi_zh = null;
  }
}

async function main() {
  console.log('=== CloudTCM Exact Formula Scraper ===');
  if (!fs.existsSync(FORMULAS_FILE)) {
    console.error('ERROR: formulas.json missing');
    process.exit(1);
  }

  const repoData = JSON.parse(fs.readFileSync(FORMULAS_FILE, 'utf8'));
  const urlMap = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {};

  const nameToUrlMap = new Map();
  Object.values(urlMap).forEach(entry => {
    if (entry.name_zh && entry.page_url) {
      nameToUrlMap.set(entry.name_zh, entry);
    }
  });

  const recordsToProcess = IS_TEST_RUN ? repoData.records.slice(0, 5) : repoData.records;
  console.log(`Processing ${recordsToProcess.length} formula records (Test mode: ${IS_TEST_RUN})...`);

  let fetchedCount = 0;
  let skippedCount = 0;

  for (const r of recordsToProcess) {
    const name = r.name_zh;
    const mapEntry = nameToUrlMap.get(name);

    if (!mapEntry || !mapEntry.page_url) {
      console.log(`[SKIP] No exact CloudTCM page found for: ${name}`);
      sanitizeRecord(r);
      skippedCount++;
      continue;
    }

    const exactUrl = mapEntry.page_url;
    console.log(`[FETCH] ${name} -> ${exactUrl}`);

    const res = await fetchUrl(exactUrl);
    if (res.status !== 200) {
      console.error(`  Failed to fetch ${exactUrl} (Status ${res.status})`);
      sanitizeRecord(r);
      skippedCount++;
      continue;
    }

    const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) {
      console.error(`  Could not parse __NEXT_DATA__ for ${exactUrl}`);
      sanitizeRecord(r);
      skippedCount++;
      continue;
    }

    try {
      const nextData = JSON.parse(match[1]);
      const pd = nextData.props.pageProps.pageData || {};

      if (pd.Source) {
        r.source_classic = pd.Source.startsWith('《') ? pd.Source : `《${pd.Source}》`;
      }

      if (pd.FormulaHerb_JSON && Array.isArray(pd.FormulaHerb_JSON) && pd.FormulaHerb_JSON.length > 0) {
        r.composition = pd.FormulaHerb_JSON.map(h => {
          const inner = (h['dbo.T_FormulaHerb'] && h['dbo.T_FormulaHerb'][0]) || {};
          const grams = inner.Grams ? `${inner.Grams}g` : null;
          return {
            herb_zh: h.HerbNameCH,
            herb_en: h.HerbNameEN || null,
            pinyin: null,
            role_zh: null,
            role_en: null,
            dose_range: grams,
            elucidation_zh: stripHtml(inner.Elucidation || '')
          };
        });
      }

      if (pd.ActionIndication) {
        const parsed = parseActionsAndIndications(pd.ActionIndication);
        if (parsed.actions_zh.length > 0) r.actions_zh = parsed.actions_zh;
        if (parsed.pattern_indications_zh.length > 0) r.pattern_indications_zh = parsed.pattern_indications_zh;
      }

      if (pd.Cautions) {
        const cautionsArr = parseCautions(pd.Cautions);
        if (cautionsArr.length > 0) r.contraindications_zh = cautionsArr;
      }

      const elud = stripHtml(pd.Elucidation || '');
      if (elud) {
        r.fang_yi_zh = elud;
        r.chinese_depth_track = r.chinese_depth_track || {};
        r.chinese_depth_track.fang_yi_zh = elud;
      }

      r.source_urls = [exactUrl];
      r.exact_source_url = exactUrl;
      r.fetched_at = new Date().toISOString();
      r.review_status = "draft";
      r.public_safe = false;
      r.source_type = "sourced_cloudtcm_record";

      sanitizeRecord(r);
      fetchedCount++;
    } catch (e) {
      console.error(`  Error parsing page data for ${name}: ${e.message}`);
      sanitizeRecord(r);
      skippedCount++;
    }
  }

  // Also sanitize any remaining records if not test run
  if (!IS_TEST_RUN) {
    repoData.records.forEach(sanitizeRecord);
  }

  console.log(`\nFetch complete! Successfully parsed: ${fetchedCount}, Skipped/Unmatched: ${skippedCount}`);

  if (IS_TEST_RUN) {
    console.log('\n--- TEST RUN 5 FORMULAS OUTPUT SAMPLE ---');
    console.log(JSON.stringify(recordsToProcess, null, 2).slice(0, 3500));
  } else {
    fs.writeFileSync(FORMULAS_FILE, JSON.stringify(repoData, null, 2), 'utf8');
    console.log(`Saved updated formulas to ${FORMULAS_FILE}`);
  }
}

main();
