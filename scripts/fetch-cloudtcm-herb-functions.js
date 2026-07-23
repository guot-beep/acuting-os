#!/usr/bin/env node
/**
 * Second-pass CloudTCM herb scraper:
 * - Fills in the `functions` array from HerbFuntion_JSON on CloudTCM
 * - Also handles 308 redirect herbs by fetching with redirect following
 * - Searches for herbs missing a CloudTCM page (牛膝, 枳殼, 浙貝母)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const HERBS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'herb_canon_shortlist.json');
const MAP_FILE = path.join(__dirname, '..', 'data', 'imports', 'cloudtcm', 'herb_url_map.json');

const IS_TEST_RUN = process.argv.includes('--test');

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve) => {
    if (redirects > 5) return resolve({ status: 500, body: '' });
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http') ? res.headers.location : `https://cloudtcm.com${res.headers.location}`;
        return fetchUrl(redirectUrl, redirects + 1).then(resolve);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', () => resolve({ status: 500, body: '' }));
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
    .replace(/[\uFFFD\uFFFC]+/g, '')
    .trim();
}

function cleanText(str) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/[\uFFFD\uFFFC]+/g, '').trim();
}

async function main() {
  console.log('=== CloudTCM Herb Functions Fill (Pass 2) ===');

  const repoData = JSON.parse(fs.readFileSync(HERBS_FILE, 'utf8'));
  const urlMapData = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {};
  const entries = urlMapData.entries || [];

  const nameToUrlMap = new Map();
  entries.forEach(entry => {
    if (entry.name_zh && entry.page_url) nameToUrlMap.set(entry.name_zh, entry.page_url);
  });

  const recordsToProcess = IS_TEST_RUN ? repoData.records.slice(0, 5) : repoData.records;
  let filledCount = 0;
  let skippedCount = 0;

  for (const r of recordsToProcess) {
    const name = r.name_zh;
    const exactUrl = nameToUrlMap.get(name);

    if (!exactUrl) {
      console.log(`[SKIP] No URL for: ${name}`);
      skippedCount++;
      continue;
    }

    const res = await fetchUrl(exactUrl);
    if (res.status !== 200) {
      console.error(`  [${res.status}] ${exactUrl}`);
      skippedCount++;
      continue;
    }

    const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) { skippedCount++; continue; }

    try {
      const nextData = JSON.parse(match[1]);
      const pd = nextData.props.pageProps.pageData || {};

      // Fill functions from HerbTagAnalysisCH_JSON (CloudTCM's action tag system)
      const tagJson = pd.HerbTagAnalysisCH_JSON;
      if (tagJson && Array.isArray(tagJson) && tagJson.length > 0) {
        const funcs = tagJson
          .map(t => cleanText(t.TagName || ''))
          .filter(f => f.length > 0);
        if (funcs.length > 0) {
          r.functions = funcs;
          if (!r.english_exam_track) r.english_exam_track = {};
          r.english_exam_track.functions_zh_source = funcs;
          if (!r.chinese_depth_track) r.chinese_depth_track = {};
          r.chinese_depth_track.functions_zh = funcs;
          console.log(`[OK] ${name}: ${funcs.slice(0, 4).join('、')}`);
          filledCount++;
        } else {
          console.log(`[EMPTY_TAGS] ${name}`);
          skippedCount++;
        }
      } else {
        console.log(`[NO_TAGS] ${name}: HerbTagAnalysisCH_JSON not available`);
        skippedCount++;
      }

      // Also update exact_source_url in case of redirects
      r.exact_source_url = exactUrl;
      r.fetched_at = new Date().toISOString();

    } catch (e) {
      console.error(`  Parse error ${name}: ${e.message}`);
      skippedCount++;
    }
  }

  console.log(`\nPass 2 complete! Functions filled: ${filledCount}, Skipped: ${skippedCount}`);

  if (IS_TEST_RUN) {
    console.log(JSON.stringify(recordsToProcess.slice(0, 3), null, 2).slice(0, 2000));
  } else {
    fs.writeFileSync(HERBS_FILE, JSON.stringify(repoData, null, 2), 'utf8');
    console.log(`Saved to ${HERBS_FILE}`);
  }
}

main();
