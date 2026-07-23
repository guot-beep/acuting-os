#!/usr/bin/env node
/**
 * fetch-cloudtcm-conditions.js
 * 
 * Populates data/pathology/condition_canon_shortlist.json with exact CloudTCM disease record data:
 *   - etiology_zh (Info_TCM)
 *   - western_pathology_zh (Info_WM)
 *   - tcm_patterns (SyndromeList)
 *   - acupoint_protocols (Acupoint_JSON)
 *   - herb_formulas (FormulaList)
 *   - classical_references (Reference)
 *   - exact_source_url (CloudTCM disease page URL)
 *   - fetched_at (timestamp)
 * 
 * Keeps review_status: "draft". No dummy template fallbacks.
 * 
 * Agent: Antigravity Content Import Agent (Claude Sonnet 4.6)
 * Date: 2026-07-23
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONDITIONS_FILE = path.join(__dirname, '..', 'data', 'pathology', 'condition_canon_shortlist.json');
const ENTRIES_FILE = path.join(__dirname, '..', 'data', 'pathology', 'cloudtcm_disease_entries.json');

const IS_TEST = process.argv.includes('--test');

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
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&middot;/gi, '·')
    .replace(/[\uFFFD\uFFFC]+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text.length > 0 ? text : null;
}

async function main() {
  console.log('=== CloudTCM Pathology Conditions Fill ===');
  console.log(`Agent: Antigravity Content Import Agent`);
  console.log(`Date: ${new Date().toISOString()}\n`);

  const condData = JSON.parse(fs.readFileSync(CONDITIONS_FILE, 'utf8'));
  const records = condData.records || condData;

  const entriesData = JSON.parse(fs.readFileSync(ENTRIES_FILE, 'utf8'));
  const entriesList = entriesData.entries || entriesData.records || entriesData.diseases || [];

  // Build mapping from name_zh → source_url
  const nameToUrlMap = new Map();
  entriesList.forEach(e => {
    if (e.name_zh && e.source_url) nameToUrlMap.set(e.name_zh, e.source_url);
  });

  console.log(`Total condition records in file: ${records.length}`);
  console.log(`Total disease entries in map: ${nameToUrlMap.size}`);

  const toProcess = IS_TEST ? records.slice(0, 5) : records;
  let filled = 0, noUrl = 0, skipped = 0;

  for (const r of toProcess) {
    const name = r.name_zh;
    let url = nameToUrlMap.get(name);

    // Fuzzy fallback match if exact name not in map
    if (!url) {
      for (const [k, v] of nameToUrlMap.entries()) {
        if (k.includes(name) || name.includes(k)) {
          url = v;
          break;
        }
      }
    }

    if (!url) {
      console.log(`[NO URL] ${r.id} (${name})`);
      noUrl++;
      continue;
    }

    const res = await fetchUrl(url);
    if (res.status !== 200) { console.error(`  [HTTP ${res.status}] ${name} -> ${url}`); skipped++; continue; }

    const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) { skipped++; continue; }

    try {
      const pd = JSON.parse(match[1]).props.pageProps.pageData || {};

      // 1. Etiology / TCM Info
      const tcmInfo = stripHtml(pd.Info_TCM);
      if (tcmInfo) r.etiology_zh = tcmInfo;

      // 2. Western Medical Info
      const wmInfo = stripHtml(pd.Info_WM);
      if (wmInfo) r.western_pathology_zh = wmInfo;

      // 3. Patterns / SyndromeList
      if (pd.SyndromeList && Array.isArray(pd.SyndromeList) && pd.SyndromeList.length > 0) {
        r.tcm_patterns = pd.SyndromeList.map(s => ({
          pattern_zh: stripHtml(s.SynNameCH),
          formula_zh: stripHtml(s.FormulaNameCH),
          symptoms_zh: s.DiseaseList ? s.DiseaseList.map(d => stripHtml(d.DiseaseNameCH)).filter(Boolean) : []
        })).filter(p => p.pattern_zh);
      }

      // 4. Acupoint Protocols / Acupoint_JSON
      if (pd.AcuPoint_JSON || pd.Acupoint_JSON) {
        const points = pd.AcuPoint_JSON || pd.Acupoint_JSON;
        if (Array.isArray(points) && points.length > 0) {
          r.acupoint_protocols = points.map(p => ({
            name_zh: stripHtml(p.title),
            code: stripHtml(p.text)
          })).filter(p => p.name_zh);
        }
      }

      // 5. Herb Formulas / FormulaList
      if (pd.FormulaList && Array.isArray(pd.FormulaList) && pd.FormulaList.length > 0) {
        r.herb_formulas = pd.FormulaList.map(f => stripHtml(f.title)).filter(Boolean);
      }

      // 6. Classical References / Reference
      const ref = stripHtml(pd.Reference);
      if (ref) r.classical_references_zh = ref;

      // Provenance metadata
      r.exact_source_url = url;
      r.fetched_at = new Date().toISOString();
      r.source_type = "sourced_cloudtcm_record";
      r.review_status = "draft";

      const fieldsFilled = [
        tcmInfo && 'etiology_zh',
        wmInfo && 'western_pathology_zh',
        r.tcm_patterns && 'tcm_patterns',
        r.acupoint_protocols && 'acupoints',
        r.herb_formulas && 'formulas'
      ].filter(Boolean);

      console.log(`[OK] ${r.id} (${name}): ${fieldsFilled.join(', ')}`);
      filled++;
    } catch (e) {
      console.error(`  [ERR] ${r.id}: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n=== Conditions Fill Complete: ${filled} filled, ${noUrl} no URL, ${skipped} skipped ===`);

  if (IS_TEST) {
    const sample = toProcess[0];
    console.log('\nSample record:', JSON.stringify(sample, null, 2).slice(0, 1500));
  } else {
    if (Array.isArray(condData)) {
      fs.writeFileSync(CONDITIONS_FILE, JSON.stringify(records, null, 2), 'utf8');
    } else {
      const out = { ...condData, records };
      fs.writeFileSync(CONDITIONS_FILE, JSON.stringify(out, null, 2), 'utf8');
    }
    console.log(`Saved to ${CONDITIONS_FILE}`);
  }
}

main();
