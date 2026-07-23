#!/usr/bin/env node
/**
 * fetch-cloudtcm-formula-tags.js
 * 
 * Fetches structured tag data for all formulas from CloudTCM:
 *   - formula_tags_zh: FormulaTag_JSON (TagName)
 *   - syndromes_zh: FormulaSyndrome_JSON (SynNameCH)
 *   - modern_diseases_zh: ModernDisease_JSON (title)
 *   - symptoms_zh: Symptom_JSON (title)
 * 
 * Agent: Antigravity Content Import Agent (Claude Sonnet 4.6)
 * Date: 2026-07-23
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const FORMULAS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'formulas.json');
const MAP_FILE = path.join(__dirname, '..', 'data', 'imports', 'cloudtcm', 'formula_url_map.json');

const IS_TEST = process.argv.includes('--test');
const TEST_IDS = ['formula.ma_huang_tang', 'formula.gui_zhi_tang', 'formula.ba_zheng_san'];

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

function cleanText(str) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/[\uFFFD\uFFFC]+/g, '').trim();
}

async function main() {
  console.log('=== CloudTCM Formula Tag Enrichment ===');
  console.log(`Agent: Antigravity Content Import Agent`);
  console.log(`Date: ${new Date().toISOString()}\n`);

  const formulaData = JSON.parse(fs.readFileSync(FORMULAS_FILE, 'utf8'));
  const records = formulaData.records || formulaData;

  const urlMap = new Map();
  if (fs.existsSync(MAP_FILE)) {
    const mapData = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    (mapData.entries || []).forEach(e => {
      if (e.formula_id && e.page_url) urlMap.set(e.formula_id, e.page_url);
    });
  }
  records.forEach(r => { if (r.exact_source_url && !urlMap.has(r.id)) urlMap.set(r.id, r.exact_source_url); });

  const toProcess = IS_TEST ? records.filter(r => TEST_IDS.includes(r.id)) : records;
  let filled = 0, skipped = 0;

  for (const r of toProcess) {
    const pageUrl = urlMap.get(r.id);
    if (!pageUrl) { skipped++; continue; }

    const res = await fetchUrl(pageUrl);
    if (res.status !== 200) { skipped++; continue; }

    const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) { skipped++; continue; }

    try {
      const pd = JSON.parse(match[1]).props.pageProps.pageData || {};

      // 1. FormulaTag_JSON
      if (pd.FormulaTag_JSON && Array.isArray(pd.FormulaTag_JSON)) {
        const tags = pd.FormulaTag_JSON.map(t => cleanText(t.TagName)).filter(Boolean);
        if (tags.length > 0) r.formula_tags_zh = tags;
      }

      // 2. FormulaSyndrome_JSON
      if (pd.FormulaSyndrome_JSON && Array.isArray(pd.FormulaSyndrome_JSON)) {
        const syndromes = pd.FormulaSyndrome_JSON.map(s => cleanText(s.SynNameCH || s.title)).filter(Boolean);
        if (syndromes.length > 0) r.syndromes_zh = syndromes;
      }

      // 3. ModernDisease_JSON
      if (pd.ModernDisease_JSON && Array.isArray(pd.ModernDisease_JSON)) {
        const diseases = pd.ModernDisease_JSON.map(d => cleanText(d.title)).filter(Boolean);
        if (diseases.length > 0) r.modern_diseases_zh = diseases;
      }

      // 4. Symptom_JSON
      if (pd.Symptom_JSON && Array.isArray(pd.Symptom_JSON)) {
        const symptoms = pd.Symptom_JSON.map(s => cleanText(s.title)).filter(Boolean);
        if (symptoms.length > 0) r.symptoms_zh = symptoms;
      }

      r.tags_fetched_at = new Date().toISOString();
      r.tags_source_url = pageUrl;

      console.log(`[OK] ${r.id} (${r.name_zh || ''}): tags=[${(r.formula_tags_zh||[]).join(', ')}] syn=[${(r.syndromes_zh||[]).slice(0,3).join(', ')}] dis=[${(r.modern_diseases_zh||[]).slice(0,3).join(', ')}]`);
      filled++;
    } catch (e) {
      console.error(`  [ERR] ${r.id}: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n=== Formula Tag Enrichment Done: ${filled} filled, ${skipped} skipped ===`);

  if (IS_TEST) {
    console.log(JSON.stringify(toProcess.slice(0, 2), null, 2).slice(0, 1500));
  } else {
    fs.writeFileSync(FORMULAS_FILE, JSON.stringify(formulaData, null, 2), 'utf8');
    console.log(`Saved to ${FORMULAS_FILE}`);
  }
}

main();
