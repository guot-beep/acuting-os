#!/usr/bin/env node
/**
 * fetch-cloudtcm-formula-safety.js
 * 
 * Fills formula records with exact CloudTCM `Cautions` field content.
 * Each formula's cautions_zh gets the plain-text items parsed from the HTML.
 * 
 * Also pulls Pharmacology (現代藥理) and Source (出典) while on the page.
 * 
 * Agent: Antigravity Content Import Agent (Claude Sonnet 4.6)
 * Date: 2026-07-23
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FORMULAS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'formulas.json');
const MAP_FILE = path.join(__dirname, '..', 'data', 'imports', 'cloudtcm', 'formula_url_map.json');

const IS_TEST = process.argv.includes('--test');
const TEST_IDS = ['formula.ma_huang_tang', 'formula.gui_zhi_tang', 'formula.liu_wei_di_huang_wan', 'formula.si_jun_zi_tang', 'formula.xiao_chai_hu_tang'];

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
  if (!html || typeof html !== 'string') return null;
  const text = html
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n').replace(/<strong>(.*?)<\/strong>/gi, '$1')
    .replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&middot;/gi, '·')
    .replace(/[\uFFFD\uFFFC]+/g, '').replace(/\n{3,}/g, '\n\n').trim();
  return text.length > 0 ? text : null;
}

function parseCautionItems(html) {
  if (!html) return null;
  const liMatches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
  if (liMatches.length > 1) {
    return liMatches.map(m => stripHtml(m[1])).filter(Boolean);
  }
  const plain = stripHtml(html);
  return plain ? [plain] : null;
}

async function main() {
  console.log('=== CloudTCM Formula Safety Fill ===');
  console.log(`Agent: Antigravity Content Import Agent (Claude Sonnet 4.6)`);
  console.log(`Date: ${new Date().toISOString()}\n`);

  const formulaData = JSON.parse(fs.readFileSync(FORMULAS_FILE, 'utf8'));
  const records = formulaData.records || formulaData;

  // Build URL map from formula_url_map.json
  const urlMap = new Map(); // formula_id → cloudtcm page_url
  if (fs.existsSync(MAP_FILE)) {
    const mapData = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    (mapData.entries || []).forEach(e => {
      if (e.formula_id && e.page_url) urlMap.set(e.formula_id, e.page_url);
    });
    console.log(`Loaded formula URL map: ${urlMap.size} entries`);
  } else {
    // Fallback: use exact_source_url already on each record
    records.forEach(r => { if (r.exact_source_url) urlMap.set(r.id, r.exact_source_url); });
    console.log(`Using exact_source_url from records: ${urlMap.size} entries`);
  }

  const toProcess = IS_TEST ? records.filter(r => TEST_IDS.includes(r.id)) : records;
  let filled = 0, nullCount = 0, skipped = 0;

  for (const r of toProcess) {
    const pageUrl = urlMap.get(r.id) || r.exact_source_url;
    if (!pageUrl) {
      console.log(`[NO URL] ${r.id}`);
      skipped++;
      continue;
    }

    const res = await fetchUrl(pageUrl);
    if (res.status !== 200) { console.error(`  [HTTP ${res.status}] ${r.id}`); skipped++; continue; }

    const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) { skipped++; continue; }

    try {
      const pd = JSON.parse(match[1]).props.pageProps.pageData || {};

      // === CAUTIONS (安全禁忌) ===
      const cautionItems = parseCautionItems(pd.Cautions);
      if (cautionItems && cautionItems.length > 0) {
        r.cautions_zh = cautionItems;
        r.safety_source = 'cloudtcm_cautions_field';
        r.safety_source_url = pageUrl;
        r.safety_fetched_at = new Date().toISOString();
        console.log(`[OK] ${r.id} (${r.name_zh || ''}): ${cautionItems.length} caution items`);
        console.log(`     └─ ${cautionItems[0].slice(0, 70)}`);
        filled++;
      } else {
        console.log(`[NULL] ${r.id}: Cautions field empty`);
        r.cautions_zh = null;
        nullCount++;
      }

      // === PHARMACOLOGY (現代藥理) ===
      const pharma = stripHtml(pd.Pharmacology);
      if (pharma) r.pharmacology_zh = pharma;

    } catch (e) {
      console.error(`  [ERR] ${r.id}: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n=== Formula Safety Done: ${filled} filled, ${nullCount} null, ${skipped} skipped ===`);

  if (!IS_TEST) {
    fs.writeFileSync(FORMULAS_FILE, JSON.stringify(formulaData, null, 2), 'utf8');
    console.log(`Saved to ${FORMULAS_FILE}`);
  } else {
    const sample = toProcess[0];
    if (sample) {
      console.log(`\nSample ${sample.id}:`);
      console.log('  cautions_zh:', JSON.stringify(sample.cautions_zh, null, 2)?.slice(0, 400));
    }
  }
}

main();
