#!/usr/bin/env node
/**
 * fetch-cloudtcm-herb-safety.js
 * 
 * Per-herb CloudTCM safety fill from the `Caution` field on each herb's record page.
 * Replaces generic template safety_flags strings with actual herb-specific caution text.
 * 
 * Source: CloudTCM `pageData.Caution` (HTML), parsed to plain text per numbered item.
 * Saved to: herb.cautions_zh (array of strings, one per numbered point)
 *           herb.safety_source_url (exact CloudTCM page URL)
 *           herb.cautions_en (null unless already sourced from Bensky)
 * 
 * Agent: Antigravity Content Import Agent (Claude Sonnet 4.6)
 * Date: 2026-07-23
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
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) && res.headers.location) {
        const redirect = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://cloudtcm.com${res.headers.location}`;
        return fetchUrl(redirect, redirects + 1).then(resolve);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', () => resolve({ status: 500, body: '' }));
  });
}

/**
 * Parse CloudTCM Caution HTML into array of plain text items.
 * CloudTCM uses <ol><li>...</li></ol> numbered items with **bold:** prefix convention.
 */
function parseCautionHtml(html) {
  if (!html || typeof html !== 'string') return null;

  // Strip Markdown-style bold markers (**text:**)
  const cleaned = html
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[\uFFFD\uFFFC]+/g, '');

  // Extract <li> items
  const liMatches = [...cleaned.matchAll(/<li>([\s\S]*?)<\/li>/gi)];
  if (liMatches.length > 0) {
    return liMatches.map(m =>
      m[1]
        .replace(/<[^>]+>/g, '')    // strip tags
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/\r?\n/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
    ).filter(s => s.length > 0);
  }

  // Fallback: strip all HTML and return as single item
  const plain = cleaned
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return plain.length > 0 ? [plain] : null;
}

async function main() {
  console.log('=== CloudTCM Herb Safety Fill (Caution field) ===');
  console.log(`Agent: Antigravity Content Import Agent (Claude Sonnet 4.6)`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('');

  const repoData = JSON.parse(fs.readFileSync(HERBS_FILE, 'utf8'));
  const urlMapData = fs.existsSync(MAP_FILE)
    ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'))
    : {};
  const entries = urlMapData.entries || [];

  const nameToUrlMap = new Map();
  entries.forEach(entry => {
    if (entry.name_zh && entry.page_url) nameToUrlMap.set(entry.name_zh, entry.page_url);
  });

  const recordsToProcess = IS_TEST_RUN
    ? repoData.records.filter(r => ['山藥', '麻黃', '附子', '甘草', '大黃'].includes(r.name_zh))
    : repoData.records;

  let filledCount = 0;
  let nullCount = 0;
  let skippedCount = 0;

  for (const r of recordsToProcess) {
    const name = r.name_zh;
    const exactUrl = nameToUrlMap.get(name);

    if (!exactUrl) {
      console.log(`[SKIP no URL] ${name}`);
      skippedCount++;
      continue;
    }

    const res = await fetchUrl(exactUrl);
    if (res.status !== 200) {
      console.error(`  [HTTP ${res.status}] ${name} -> ${exactUrl}`);
      skippedCount++;
      continue;
    }

    const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) {
      console.error(`  [NO NEXT_DATA] ${name}`);
      skippedCount++;
      continue;
    }

    try {
      const nextData = JSON.parse(match[1]);
      const pd = nextData.props.pageProps.pageData || {};

      const cautionHtml = pd.Caution || null;

      if (cautionHtml && cautionHtml.trim().length > 0) {
        const items = parseCautionHtml(cautionHtml);
        if (items && items.length > 0) {
          // Replace generic template safety_flags with real cautions_zh
          r.cautions_zh = items;
          r.safety_source_url = exactUrl;
          r.safety_fetched_at = new Date().toISOString();
          // Keep safety_flags array for tag-based filtering but mark as sourced
          r.safety_source = 'cloudtcm_caution_field';

          console.log(`[OK] ${name}: ${items.length} caution items`);
          console.log(`     └─ ${items[0].slice(0, 60)}...`);
          filledCount++;
        } else {
          console.log(`[EMPTY parse] ${name}`);
          r.cautions_zh = null;
          nullCount++;
        }
      } else {
        console.log(`[NULL caution] ${name}: Caution field empty on CloudTCM`);
        r.cautions_zh = null;
        nullCount++;
      }

    } catch (e) {
      console.error(`  [PARSE ERROR] ${name}: ${e.message}`);
      skippedCount++;
    }
  }

  console.log('');
  console.log(`=== Safety Fill Complete ===`);
  console.log(`Filled: ${filledCount}, Null (empty on CloudTCM): ${nullCount}, Skipped/Error: ${skippedCount}`);

  if (IS_TEST_RUN) {
    const tested = recordsToProcess.slice(0, 3);
    console.log('\nSample output:');
    tested.forEach(r => {
      console.log(`\n${r.name_zh}:`);
      console.log('  cautions_zh:', JSON.stringify(r.cautions_zh, null, 2));
    });
  } else {
    fs.writeFileSync(HERBS_FILE, JSON.stringify(repoData, null, 2), 'utf8');
    console.log(`Saved to ${HERBS_FILE}`);
  }
}

main();
