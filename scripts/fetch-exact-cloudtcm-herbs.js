#!/usr/bin/env node
/**
 * Exact CloudTCM Scraper & Data Importer for AcuTing OS Single Herbs.
 * 
 * Rules:
 * 1. Fetches exact page data from https://cloudtcm.com/herb/<id>
 * 2. Parses exact taste/property, meridians, functions, dosage, cautions.
 * 3. Saves exact source_urls, exact_source_url, and fetched_at timestamp.
 * 4. NEVER generates template fallback taste/temp or dosage strings.
 * 5. Leaves missing fields as null / [].
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const HERBS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'herb_canon_shortlist.json');
const MAP_FILE = path.join(__dirname, '..', 'data', 'imports', 'cloudtcm', 'herb_url_map.json');

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
    .replace(/[\uFFFD\uFFFC]+/g, '')
    .trim();
}

function parseDosageObject(dosageObj) {
  if (!dosageObj) return null;
  if (typeof dosageObj === 'string') return stripHtml(dosageObj);
  const parts = [];
  if (dosageObj["一般建議"]) parts.push(`一般建議：${stripHtml(dosageObj["一般建議"])}`);
  if (dosageObj["食療用量範圍"]) parts.push(`食療範圍：${stripHtml(dosageObj["食療用量範圍"])}`);
  if (dosageObj["特殊說明"]) parts.push(`特殊說明：${stripHtml(dosageObj["特殊說明"])}`);
  return parts.length > 0 ? parts.join('；') : null;
}

function parseCautionHtml(cautionHtml) {
  const text = stripHtml(cautionHtml);
  if (!text) return null;
  return text;
}

function cleanText(str) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/[\uFFFD\uFFFC]+/g, '').trim();
}

function sanitizeHerbRecord(r) {
  // Remove bare root URLs or search URLs
  if (r.source_urls && Array.isArray(r.source_urls)) {
    r.source_urls = r.source_urls.filter(url => !/^https?:\/\/cloudtcm\.com\/(herb|formula)\/?$/i.test(url) && !/search\?query=/i.test(url));
  }

  r.clinical_use_note = cleanText(r.clinical_use_note);
  r.cautions = cleanText(r.cautions);
  r.properties_taste_temp = cleanText(r.properties_taste_temp);
  r.dosage = cleanText(r.dosage);

  if (r.chinese_depth_track) {
    r.chinese_depth_track.summary_zh = cleanText(r.chinese_depth_track.summary_zh);
  }

  // Ensure mandatory exam track structures exist
  if (!r.chinese_depth_track) {
    r.chinese_depth_track = {
      review_status: "draft",
      source_status: "cloudtcm_or_institution_review_pending"
    };
  }
  if (!r.english_exam_track) {
    r.english_exam_track = {
      review_status: "draft",
      source_status: "bensky_review_pending",
      common_pairings: r.common_pairings || []
    };
  }
  if (!r.source_hint) {
    r.source_hint = "CloudTCM Single Herb Database & HKBU MMID";
  }
}

async function main() {
  console.log('=== CloudTCM Exact Single Herb Scraper ===');
  if (!fs.existsSync(HERBS_FILE)) {
    console.error('ERROR: herb_canon_shortlist.json missing');
    process.exit(1);
  }

  const repoData = JSON.parse(fs.readFileSync(HERBS_FILE, 'utf8'));
  const urlMapData = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {};
  const entries = urlMapData.entries || [];

  const nameToUrlMap = new Map();
  entries.forEach(entry => {
    if (entry.name_zh && entry.page_url) {
      nameToUrlMap.set(entry.name_zh, entry.page_url);
    }
  });

  const recordsToProcess = IS_TEST_RUN ? repoData.records.slice(0, 5) : repoData.records;
  console.log(`Processing ${recordsToProcess.length} herb records (Test mode: ${IS_TEST_RUN})...`);

  let fetchedCount = 0;
  let skippedCount = 0;

  for (const r of recordsToProcess) {
    const name = r.name_zh;
    const exactUrl = nameToUrlMap.get(name);

    if (!exactUrl) {
      console.log(`[SKIP] No exact CloudTCM page found for herb: ${name}`);
      sanitizeHerbRecord(r);
      skippedCount++;
      continue;
    }

    console.log(`[FETCH] ${name} -> ${exactUrl}`);

    const res = await fetchUrl(exactUrl);
    if (res.status !== 200) {
      console.error(`  Failed to fetch ${exactUrl} (Status ${res.status})`);
      sanitizeHerbRecord(r);
      skippedCount++;
      continue;
    }

    const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) {
      console.error(`  Could not parse __NEXT_DATA__ for ${exactUrl}`);
      sanitizeHerbRecord(r);
      skippedCount++;
      continue;
    }

    try {
      const nextData = JSON.parse(match[1]);
      const pd = nextData.props.pageProps.pageData || {};

      if (pd.HerbProperty_JSON && Array.isArray(pd.HerbProperty_JSON)) {
        const propTitles = pd.HerbProperty_JSON.map(p => p.title).filter(Boolean);
        if (propTitles.length > 0) {
          r.properties_taste_temp = propTitles.join('、');
        }
      }

      if (pd.HerbMeridian_JSON && Array.isArray(pd.HerbMeridian_JSON)) {
        const meridianTitles = pd.HerbMeridian_JSON.map(m => m.title).filter(Boolean);
        if (meridianTitles.length > 0) {
          r.channels_entered = meridianTitles;
        }
      }

      if (pd.Dosage) {
        const parsedDose = parseDosageObject(pd.Dosage);
        if (parsedDose) r.dosage = parsedDose;
      }

      if (pd.Caution) {
        const parsedCaution = parseCautionHtml(pd.Caution);
        if (parsedCaution) r.cautions = parsedCaution;
      }

      if (pd.ActionIndication || pd.MetaDescription) {
        const desc = stripHtml(pd.ActionIndication || pd.MetaDescription);
        if (desc) {
          r.clinical_use_note = desc;
          r.chinese_depth_track.summary_zh = desc;
        }
      }

      r.source_urls = [exactUrl];
      r.exact_source_url = exactUrl;
      r.fetched_at = new Date().toISOString();
      r.review_status = "draft";
      r.public_safe = false;
      r.source_type = "sourced_cloudtcm_record";

      sanitizeHerbRecord(r);
      fetchedCount++;
    } catch (e) {
      console.error(`  Error parsing herb data for ${name}: ${e.message}`);
      sanitizeHerbRecord(r);
      skippedCount++;
    }
  }

  if (!IS_TEST_RUN) {
    repoData.records.forEach(sanitizeHerbRecord);
  }

  console.log(`\nFetch complete! Successfully parsed: ${fetchedCount}, Skipped/Unmatched: ${skippedCount}`);

  if (IS_TEST_RUN) {
    console.log('\n--- TEST RUN 5 HERBS OUTPUT SAMPLE ---');
    console.log(JSON.stringify(recordsToProcess, null, 2).slice(0, 3500));
  } else {
    fs.writeFileSync(HERBS_FILE, JSON.stringify(repoData, null, 2), 'utf8');
    console.log(`Saved updated herbs to ${HERBS_FILE}`);
  }
}

main();
