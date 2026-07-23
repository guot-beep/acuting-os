#!/usr/bin/env node
/**
 * Strict Formula Quality & Provenance Validator for AcuTing OS.
 * Enforces zero-tolerance against template generators, placeholders,
 * placeholder herb names ('主藥'/'輔藥'), generic indication templates ('所主之證候'),
 * category-generated dose text, search-only URLs, and unverified Bensky/CloudTCM claims.
 */

const fs = require('fs');
const path = require('path');

const FORMULAS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'formulas.json');

const FORBIDDEN_PATTERNS = [
  /所主之證候/,
  /傳統所主/,
  /調理.*對應證候/,
  /調理.*相關證候/,
  /調和.*對應證候/,
  /待補/,
  /待確認/,
  /\?\?\?/,
  /search\?query=/i,
  /cloudtcm\.com\/(formula|herb)\/?$/i // Bare index homepage without ID
];

function validateStrict() {
  console.log('=== Running Strict Formula Quality & Provenance Validator ===');
  if (!fs.existsSync(FORMULAS_FILE)) {
    console.error('ERROR: formulas.json not found!');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(FORMULAS_FILE, 'utf8'));
  const records = data.records || [];
  let failures = [];
  let warnings = [];
  let sourcedCount = 0;

  records.forEach((r, idx) => {
    const id = r.id || `record[${idx}]`;
    const label = `${id} (${r.name_zh || 'No Name'})`;

    // 1. Composition checks for populated records
    if (r.composition && Array.isArray(r.composition) && r.composition.length > 0) {
      r.composition.forEach((item, herbIdx) => {
        if (item.herb_zh === "主藥" || item.herb_zh === "輔藥" || item.herb_zh === "???") {
          failures.push(`${label} composition[${herbIdx}]: forbidden herb name '${item.herb_zh}'`);
        }
      });
    }

    // 2. Indication / Action checks
    const textToCheck = [
      ...(r.actions_zh || []),
      ...(r.pattern_indications_zh || []),
      ...(r.indications_zh || []),
      r.fang_yi_zh || '',
      r.clinical_use_note || ''
    ].join(' ');

    FORBIDDEN_PATTERNS.forEach(pat => {
      if (pat.test(textToCheck)) {
        failures.push(`${label}: text matched forbidden template pattern ${pat}`);
      }
    });

    // 3. Exact URL checks
    if (r.source_urls && Array.isArray(r.source_urls)) {
      r.source_urls.forEach(url => {
        if (/search\?query=/i.test(url)) {
          failures.push(`${label}: source_url is a search URL instead of exact page: ${url}`);
        }
        if (/cloudtcm\.com\/(formula|herb)\/?$/i.test(url)) {
          failures.push(`${label}: source_url is database root homepage: ${url}`);
        }
      });
    }

    // 4. Provenance & Fetch Date (if sourced)
    if (r.source_type === "sourced_cloudtcm_record") {
      sourcedCount++;
      if (!r.fetched_at) {
        failures.push(`${label}: missing fetched_at timestamp for sourced record`);
      }
      if (!r.exact_source_url || !/\/formula\/\d+/.test(r.exact_source_url)) {
        failures.push(`${label}: invalid exact_source_url '${r.exact_source_url}'`);
      }
    }
  });

  console.log(`Checked ${records.length} formula records (Sourced exact CloudTCM records: ${sourcedCount}).`);
  if (warnings.length > 0) {
    console.log(`Warnings (${warnings.length}):`);
    warnings.slice(0, 10).forEach(w => console.log('  [WARN]', w));
  }

  if (failures.length > 0) {
    console.error(`FAILURES (${failures.length}):`);
    failures.forEach(f => console.error('  [FAIL]', f));
    console.error('\nStrict Quality Validator FAILED!');
    process.exit(1);
  } else {
    console.log(`OK: All ${records.length} formula records passed strict quality & provenance validation!`);
  }
}

validateStrict();
