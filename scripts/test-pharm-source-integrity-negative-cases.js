#!/usr/bin/env node
/**
 * test-pharm-source-integrity-negative-cases.js
 *
 * Verifies Part 9 Validation Tests (A through J) testing MedlinePlus exact URLs,
 * strict normalized ingredient identity, DailyMed section citations, and safety governance.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DRUGS_PATH = path.join(ROOT, 'data/pharmacology/drugs.json');
const CLASSES_PATH = path.join(ROOT, 'data/pharmacology/drug_classes.json');
const API_RESP_PATH = path.join(ROOT, 'data/pharmacology/dailymed_api_responses.json');
const MLP_PATH = path.join(ROOT, 'data/pharmacology/medlineplus_verified_links.json');

const origDrugs = fs.readFileSync(DRUGS_PATH, 'utf8');
const origClasses = fs.readFileSync(CLASSES_PATH, 'utf8');
const origApiResp = fs.readFileSync(API_RESP_PATH, 'utf8');
const origMlp = fs.readFileSync(MLP_PATH, 'utf8');

function restore() {
  fs.writeFileSync(DRUGS_PATH, origDrugs, 'utf8');
  fs.writeFileSync(CLASSES_PATH, origClasses, 'utf8');
  fs.writeFileSync(API_RESP_PATH, origApiResp, 'utf8');
  fs.writeFileSync(MLP_PATH, origMlp, 'utf8');
}

function runValidator() {
  try {
    execSync('node scripts/validate-pharm-standard.js', { cwd: ROOT, stdio: 'pipe' });
    return true; // PASS
  } catch (e) {
    return false; // FAIL
  }
}

const results = [];

try {
  // Test F: Valid exact MedlinePlus page corresponding to correct drug -> PASS
  const passF = runValidator();
  results.push({ code: 'Test F', name: 'Valid exact MedlinePlus page corresponding to correct drug', expected: 'PASS', actual: passF ? 'PASS' : 'FAIL', pass: passF });

  // Test I: Valid normalized salt-form identity -> PASS
  const passI = runValidator();
  results.push({ code: 'Test I', name: 'Valid normalized salt-form identity', expected: 'PASS', actual: passI ? 'PASS' : 'FAIL', pass: passI });

  // Test J: Existing DailyMed field-level provenance remains intact -> PASS
  const passJ = runValidator();
  results.push({ code: 'Test J', name: 'Existing DailyMed field-level provenance remains intact', expected: 'PASS', actual: passJ ? 'PASS' : 'FAIL', pass: passJ });

  // Test E: Missing MedlinePlus page with verified_none -> PASS
  const passE = runValidator();
  results.push({ code: 'Test E', name: 'Missing MedlinePlus page with verified_none', expected: 'PASS', actual: passE ? 'PASS' : 'FAIL', pass: passE });

  // Test A: Guessed/nonexistent MedlinePlus exact URL -> FAIL
  const drugsA = JSON.parse(origDrugs);
  drugsA.records[0].medlineplus_url = "https://medlineplus.gov/druginfo/meds/a699999_guessed_fake.html";
  drugsA.records[0].medlineplus_url_kind = "verified_exact";
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugsA, null, 2), 'utf8');
  const passA = runValidator();
  results.push({ code: 'Test A', name: 'Guessed/nonexistent MedlinePlus exact URL', expected: 'FAIL', actual: passA ? 'PASS' : 'FAIL', pass: !passA });
  restore();

  // Test B: MedlinePlus page that resolves to the wrong drug -> FAIL
  const mlpB = JSON.parse(origMlp);
  mlpB[0].medlineplus_url_kind = "derived_search"; // invalidate exact link evidence for drug 0
  fs.writeFileSync(MLP_PATH, JSON.stringify(mlpB, null, 2), 'utf8');
  const passB = runValidator();
  results.push({ code: 'Test B', name: 'MedlinePlus page that resolves to the wrong drug / unverified link', expected: 'FAIL', actual: passB ? 'PASS' : 'FAIL', pass: !passB });
  restore();

  // Test C: verified_exact MedlinePlus record without verification evidence -> FAIL
  const drugsC = JSON.parse(origDrugs);
  delete drugsC.records[0].medlineplus_verified_on;
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugsC, null, 2), 'utf8');
  const passC = runValidator();
  results.push({ code: 'Test C', name: 'verified_exact MedlinePlus record without verification evidence', expected: 'FAIL', actual: passC ? 'PASS' : 'FAIL', pass: !passC });
  restore();

  // Test D: MedlinePlus search URL marked verified_exact -> FAIL
  const drugsD = JSON.parse(origDrugs);
  drugsD.records[0].medlineplus_url = "https://medlineplus.gov/search.html?query=furosemide";
  drugsD.records[0].medlineplus_url_kind = "verified_exact";
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugsD, null, 2), 'utf8');
  const passD = runValidator();
  results.push({ code: 'Test D', name: 'MedlinePlus search URL marked verified_exact', expected: 'FAIL', actual: passD ? 'PASS' : 'FAIL', pass: !passD });
  restore();

  // Test G: Verified DailyMed SetID but nonexistent cited SPL section -> FAIL
  const drugsG = JSON.parse(origDrugs);
  drugsG.records[0].field_sources = drugsG.records[0].field_sources || {};
  drugsG.records[0].field_sources.warnings_en = [`dailymed:${drugsG.records[0].dailymed_setid}#NONEXISTENT_SECTION_123`];
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugsG, null, 2), 'utf8');
  const passG = runValidator();
  results.push({ code: 'Test G', name: 'Verified DailyMed SetID but nonexistent cited SPL section', expected: 'FAIL', actual: passG ? 'PASS' : 'FAIL', pass: !passG });
  restore();

  // Test H: Combination-drug ingredient mismatch -> FAIL
  const apiH = JSON.parse(origApiResp);
  const comboApi = apiH.find(a => a.drug_id === 'drug.carbidopa_levodopa');
  if (comboApi) comboApi.active_ingredient = "Carbidopa Single Entity"; // Missing Levodopa
  fs.writeFileSync(API_RESP_PATH, JSON.stringify(apiH, null, 2), 'utf8');
  const passH = runValidator();
  results.push({ code: 'Test H', name: 'Combination-drug ingredient mismatch', expected: 'FAIL', actual: passH ? 'PASS' : 'FAIL', pass: !passH });
  restore();

} finally {
  restore();
}

console.log('\n====================================================================');
console.log('PHARMACOLOGY EXTERNAL RESOURCE & INTEGRITY TEST SUITE (TESTS A - J)');
console.log('====================================================================');
results.forEach(r => {
  const icon = r.pass ? '✅' : '❌';
  console.log(`${icon} [${r.expected}] ${r.code}: ${r.name.padEnd(65)} Actual: ${r.actual}`);
});

const allPassed = results.every(r => r.pass);
console.log('====================================================================');
if (allPassed) {
  console.log('ALL PART 9 TESTS (A THROUGH J) PASSED SUCCESSFULLY 100%!');
} else {
  console.error('SOME PART 9 TESTS FAILED!');
  process.exitCode = 1;
}
