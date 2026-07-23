#!/usr/bin/env node
/**
 * Strict Single Herb Quality & Provenance Validator for AcuTing OS.
 * Enforces zero-tolerance against template generators, placeholders,
 * category-generated taste/temp/dose text, search-only URLs, and bare database homepages.
 */

const fs = require('fs');
const path = require('path');

const HERBS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'herb_canon_shortlist.json');

const FORBIDDEN_PATTERNS = [
  /所主之證候/,
  /傳統所主/,
  /調理.*對應證候/,
  /調理.*相關證候/,
  /調和.*對應證候/,
  /分類預設/,
  /待補/,
  /待確認/,
  /\?\?\?/,
  /search\?query=/i,
  /cloudtcm\.com\/(herb|formula)\/?$/i
];

function validateStrictHerbs() {
  console.log('=== Running Strict Single Herb Quality & Provenance Validator ===');
  if (!fs.existsSync(HERBS_FILE)) {
    console.error('ERROR: herb_canon_shortlist.json not found!');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(HERBS_FILE, 'utf8'));
  const records = data.records || [];
  let failures = [];
  let warnings = [];
  let sourcedCount = 0;

  records.forEach((r, idx) => {
    const id = r.id || `record[${idx}]`;
    const label = `${id} (${r.name_zh || 'No Name'})`;

    // 1. Text checks for placeholders & template strings
    const textToCheck = [
      r.properties_taste_temp || '',
      r.dosage || '',
      r.cautions || '',
      r.clinical_use_note || '',
      ...(Array.isArray(r.functions) ? r.functions : [])
    ].join(' ');

    FORBIDDEN_PATTERNS.forEach(pat => {
      if (pat.test(textToCheck)) {
        failures.push(`${label}: text matched forbidden template pattern ${pat}`);
      }
    });

    // 2. Exact URL checks
    if (r.source_urls && Array.isArray(r.source_urls)) {
      r.source_urls.forEach(url => {
        if (/search\?query=/i.test(url)) {
          failures.push(`${label}: source_url is a search URL instead of exact page: ${url}`);
        }
        if (/cloudtcm\.com\/(herb|formula)\/?$/i.test(url)) {
          failures.push(`${label}: source_url is database root homepage: ${url}`);
        }
      });
    }

    // 3. Provenance & Fetch Date (if sourced)
    if (r.source_type === "sourced_cloudtcm_record") {
      sourcedCount++;
      if (!r.fetched_at) {
        failures.push(`${label}: missing fetched_at timestamp for sourced record`);
      }
      if (!r.exact_source_url || !/\/herb\/\d+/.test(r.exact_source_url)) {
        failures.push(`${label}: invalid exact_source_url '${r.exact_source_url}'`);
      }
    }
  });

  console.log(`Checked ${records.length} herb records (Sourced exact CloudTCM records: ${sourcedCount}).`);
  if (warnings.length > 0) {
    console.log(`Warnings (${warnings.length}):`);
    warnings.slice(0, 10).forEach(w => console.log('  [WARN]', w));
  }

  if (failures.length > 0) {
    console.error(`FAILURES (${failures.length}):`);
    failures.forEach(f => console.error('  [FAIL]', f));
    console.error('\nStrict Single Herb Quality Validator FAILED!');
    process.exit(1);
  } else {
    console.log(`OK: All ${records.length} single herb records passed strict quality & provenance validation!`);
  }
}

validateStrictHerbs();
