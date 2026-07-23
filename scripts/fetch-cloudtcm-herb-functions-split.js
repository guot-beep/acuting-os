#!/usr/bin/env node
/**
 * fetch-cloudtcm-herb-functions-split.js
 * 
 * Re-fetches HerbTagAnalysisCH_JSON for all herbs and splits by HerbPharm:
 *   HerbPharm=0 → functions_zh (傳統功效)
 *   HerbPharm=1 → modern_functions_zh (現代藥理功效)
 * 
 * Also saves full AnalysisCH text per modern function tag as modern_functions_detail_zh
 * (the detailed pharmacological analysis text shown on CloudTCM)
 * 
 * Agent: Antigravity Content Import Agent (Claude Sonnet 4.6)
 * Date: 2026-07-23
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const HERBS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'herb_canon_shortlist.json');
const MAP_FILE = path.join(__dirname, '..', 'data', 'imports', 'cloudtcm', 'herb_url_map.json');
const IS_TEST = process.argv.includes('--test');
const TEST_HERBS = ['羌活', '麻黃', '附子', '當歸', '黃連'];

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
  return str.replace(/[\uFFFD\uFFFC]+/g, '').replace(/\r\n/g, '\n').trim();
}

async function main() {
  console.log('=== CloudTCM Herb Functions Split (Traditional vs Modern) ===');
  console.log(`Agent: Antigravity Content Import Agent (Claude Sonnet 4.6)`);
  console.log(`Date: ${new Date().toISOString()}\n`);

  const repoData = JSON.parse(fs.readFileSync(HERBS_FILE, 'utf8'));
  const mapData = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));

  const nameToUrlMap = new Map();
  mapData.entries.forEach(e => {
    if (e.name_zh && e.page_url) nameToUrlMap.set(e.name_zh, e.page_url);
  });

  const records = IS_TEST
    ? repoData.records.filter(r => TEST_HERBS.includes(r.name_zh))
    : repoData.records;

  let filled = 0, noTags = 0, skipped = 0;

  for (const r of records) {
    const url = nameToUrlMap.get(r.name_zh);
    if (!url) { console.log(`[SKIP no URL] ${r.name_zh}`); skipped++; continue; }

    const res = await fetchUrl(url);
    if (res.status !== 200) { console.error(`  [HTTP ${res.status}] ${r.name_zh}`); skipped++; continue; }

    const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) { skipped++; continue; }

    try {
      const pd = JSON.parse(match[1]).props.pageProps.pageData || {};
      const tags = pd.HerbTagAnalysisCH_JSON;

      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        console.log(`[NO TAGS] ${r.name_zh}`);
        noTags++;
        continue;
      }

      // Split by HerbPharm
      const traditional = tags.filter(t => t.HerbPharm === 0).map(t => cleanText(t.TagName)).filter(Boolean);
      const modern = tags.filter(t => t.HerbPharm === 1).map(t => cleanText(t.TagName)).filter(Boolean);

      // Modern detail: full AnalysisCH per modern tag (for future detailed view)
      const modernDetail = tags
        .filter(t => t.HerbPharm === 1 && t.AnalysisCH)
        .map(t => ({
          tag: cleanText(t.TagName),
          analysis_zh: cleanText(t.AnalysisCH)
        }));

      // Write back
      if (traditional.length > 0) r.functions_zh = traditional;
      if (modern.length > 0) {
        r.modern_functions_zh = modern;
        r.modern_functions_source = 'cloudtcm_herb_tag_analysis';
        r.modern_functions_source_url = url;
      }
      if (modernDetail.length > 0) r.modern_functions_detail_zh = modernDetail;

      // Keep unified functions array (all tags) for backward compat
      r.functions = [...traditional, ...modern];

      console.log(`[OK] ${r.name_zh}: trad=[${traditional.join('、')}] modern=[${modern.slice(0,4).join('、')}${modern.length > 4 ? '…' : ''}]`);
      filled++;
    } catch (e) {
      console.error(`  [ERR] ${r.name_zh}: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n=== Done: ${filled} split, ${noTags} no tags, ${skipped} skipped ===`);

  if (IS_TEST) {
    const sample = records.find(r => r.name_zh === '羌活');
    if (sample) {
      console.log('\nSample 羌活:');
      console.log('  functions_zh:', sample.functions_zh);
      console.log('  modern_functions_zh:', sample.modern_functions_zh);
      console.log('  modern_functions_detail_zh count:', sample.modern_functions_detail_zh?.length);
    }
  } else {
    fs.writeFileSync(HERBS_FILE, JSON.stringify(repoData, null, 2), 'utf8');
    console.log(`Saved to ${HERBS_FILE}`);
  }
}

main();
