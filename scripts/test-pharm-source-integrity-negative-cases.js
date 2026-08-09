#!/usr/bin/env node
/**
 * test-pharm-source-integrity-negative-cases.js
 *
 * Verifies Negative Tests 1-7 (MUST FAIL) and Positive Test 8 (MUST PASS).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DRUGS_PATH = path.join(ROOT, 'data/pharmacology/drugs.json');
const CLASSES_PATH = path.join(ROOT, 'data/pharmacology/drug_classes.json');
const API_RESP_PATH = path.join(ROOT, 'data/pharmacology/dailymed_api_responses.json');

const origDrugs = fs.readFileSync(DRUGS_PATH, 'utf8');
const origClasses = fs.readFileSync(CLASSES_PATH, 'utf8');
const origApiResp = fs.readFileSync(API_RESP_PATH, 'utf8');

function restore() {
  fs.writeFileSync(DRUGS_PATH, origDrugs, 'utf8');
  fs.writeFileSync(CLASSES_PATH, origClasses, 'utf8');
  fs.writeFileSync(API_RESP_PATH, origApiResp, 'utf8');
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
  // Test 8: Positive Baseline (Real DailyMed SetID + correct identity + real sections) MUST PASS
  const pass8 = runValidator();
  results.push({ id: 8, name: 'Positive Test 8: Real DailyMed SetID + correct drug identity + real section', expected: 'PASS', actual: pass8 ? 'PASS' : 'FAIL', pass: pass8 });

  // Test 1: Fake / non-resolving DailyMed SetID MUST FAIL
  const drugs1 = JSON.parse(origDrugs);
  drugs1.records[0].dailymed_setid = "fake-uuid-9999-8888-777766665555";
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugs1, null, 2), 'utf8');
  const pass1 = runValidator();
  results.push({ id: 1, name: 'Negative Test 1: Fake / non-resolving DailyMed SetID', expected: 'FAIL', actual: pass1 ? 'PASS' : 'FAIL', pass: !pass1 });
  restore();

  // Test 2: Ingredient / setid mismatch MUST FAIL
  const apiResp2 = JSON.parse(origApiResp);
  apiResp2[0].setid = "different-setid-mismatch";
  fs.writeFileSync(API_RESP_PATH, JSON.stringify(apiResp2, null, 2), 'utf8');
  const pass2 = runValidator();
  results.push({ id: 2, name: 'Negative Test 2: SetID mismatch with verified API evidence', expected: 'FAIL', actual: pass2 ? 'PASS' : 'FAIL', pass: !pass2 });
  restore();

  // Test 3: Claimed BOXED_WARNING absent from selected label MUST FAIL
  const drugs3 = JSON.parse(origDrugs);
  drugs3.records.find(d => d.id === 'drug.atropine').boxed_warning_en = "Claimed non-existent boxed warning";
  drugs3.records.find(d => d.id === 'drug.atropine').field_sources = drugs3.records.find(d => d.id === 'drug.atropine').field_sources || {};
  drugs3.records.find(d => d.id === 'drug.atropine').field_sources.boxed_warning_en = ["dailymed:a116af5c-ba4c-408c-9a02-4bc33772aa8d#BOXED_WARNING"];
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugs3, null, 2), 'utf8');
  const pass3 = runValidator();
  results.push({ id: 3, name: 'Negative Test 3: Claimed BOXED_WARNING absent from selected label', expected: 'FAIL', actual: pass3 ? 'PASS' : 'FAIL', pass: !pass3 });
  restore();

  // Test 4: Course-only source for official safety field MUST FAIL
  const drugs4 = JSON.parse(origDrugs);
  drugs4.records[0].contraindications_en = ["Some contraindication"];
  drugs4.records[0].field_sources = drugs4.records[0].field_sources || {};
  drugs4.records[0].field_sources.contraindications_en = ["course:test"];
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugs4, null, 2), 'utf8');
  const pass4 = runValidator();
  results.push({ id: 4, name: 'Negative Test 4: Course-only source (course:test) for official safety field', expected: 'FAIL', actual: pass4 ? 'PASS' : 'FAIL', pass: !pass4 });
  restore();

  // Test 5: Generic sources only for safety field MUST FAIL
  const classes5 = JSON.parse(origClasses);
  classes5.records[0].class_contraindications_en = ["Class contraindication"];
  classes5.records[0].sources = ["dailymed:a116af5c-ba4c-408c-9a02-4bc33772aa8d#CONTRAINDICATIONS"];
  delete (classes5.records[0].field_sources || {}).class_contraindications_en;
  fs.writeFileSync(CLASSES_PATH, JSON.stringify(classes5, null, 2), 'utf8');
  const pass5 = runValidator();
  results.push({ id: 5, name: 'Negative Test 5: Generic sources only for safety field', expected: 'FAIL', actual: pass5 ? 'PASS' : 'FAIL', pass: !pass5 });
  restore();

  // Test 6: Deprecated overdose field MUST FAIL
  const drugs6 = JSON.parse(origDrugs);
  drugs6.records[0].overdose_toxicity_notes_en = "Deprecated overdose notes";
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugs6, null, 2), 'utf8');
  const pass6 = runValidator();
  results.push({ id: 6, name: 'Negative Test 6: Deprecated overdose field (overdose_toxicity_notes_en)', expected: 'FAIL', actual: pass6 ? 'PASS' : 'FAIL', pass: !pass6 });
  restore();

  // Test 7: AI human_reviewed without explicit reviewer provenance MUST FAIL
  const drugs7 = JSON.parse(origDrugs);
  drugs7.records[0].verification_status = "human_reviewed";
  delete drugs7.records[0].reviewed_by;
  delete drugs7.records[0].reviewed_at;
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugs7, null, 2), 'utf8');
  const pass7 = runValidator();
  results.push({ id: 7, name: 'Negative Test 7: AI human_reviewed without explicit reviewer provenance', expected: 'FAIL', actual: pass7 ? 'PASS' : 'FAIL', pass: !pass7 });
  restore();

} finally {
  restore();
}

console.log('\n====================================================================');
console.log('SOURCE INTEGRITY & SAFETY GATES SUITE (TESTS 1 - 8)');
console.log('====================================================================');
results.forEach(r => {
  const icon = r.pass ? '✅' : '❌';
  console.log(`${icon} [${r.expected}] ${r.name.padEnd(72)} Actual: ${r.actual}`);
});

const allPassed = results.every(r => r.pass);
console.log('====================================================================');
if (allPassed) {
  console.log('ALL SOURCE INTEGRITY TESTS (1 - 8) PASSED SUCCESSFULLY 100%!');
} else {
  console.error('SOME SOURCE INTEGRITY TESTS FAILED!');
  process.exitCode = 1;
}
