#!/usr/bin/env node
/**
 * test-pharm-source-integrity-negative-cases.js
 *
 * Verifies 9 Negative Tests (MUST FAIL) and 1 Positive Control (MUST PASS)
 * testing real DailyMed API evidence, ingredient identity, section existence,
 * interaction citations, and safety source governance.
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
  // Test 10: Positive Control (Valid externally evidenced label) MUST PASS
  const pass10 = runValidator();
  results.push({ id: 10, name: '10. Valid externally evidenced label', expected: 'PASS', actual: pass10 ? 'PASS' : 'FAIL', pass: pass10 });

  // Test 1: Card SetID mismatch → FAIL
  const apiResp1 = JSON.parse(origApiResp);
  apiResp1[0].setid = "mismatched-uuid-999988887777";
  fs.writeFileSync(API_RESP_PATH, JSON.stringify(apiResp1, null, 2), 'utf8');
  const pass1 = runValidator();
  results.push({ id: 1, name: '1. Card SetID mismatch', expected: 'FAIL', actual: pass1 ? 'PASS' : 'FAIL', pass: !pass1 });
  restore();

  // Test 2: Unverified/non-evidenced SetID → FAIL
  const drugs2 = JSON.parse(origDrugs);
  drugs2.records[0].dailymed_setid = "unverified-synthetic-setid-9999";
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugs2, null, 2), 'utf8');
  const pass2 = runValidator();
  results.push({ id: 2, name: '2. Unverified/non-evidenced SetID', expected: 'FAIL', actual: pass2 ? 'PASS' : 'FAIL', pass: !pass2 });
  restore();

  // Test 3: Ingredient identity mismatch → FAIL
  const apiResp3 = JSON.parse(origApiResp);
  apiResp3[0].active_ingredient = "Wrong Ingredient (Metformin)";
  fs.writeFileSync(API_RESP_PATH, JSON.stringify(apiResp3, null, 2), 'utf8');
  const pass3 = runValidator();
  results.push({ id: 3, name: '3. Ingredient identity mismatch', expected: 'FAIL', actual: pass3 ? 'PASS' : 'FAIL', pass: !pass3 });
  restore();

  // Test 4: Unsupported section claim → FAIL
  const drugs4 = JSON.parse(origDrugs);
  drugs4.records.find(d => d.id === 'drug.atropine').boxed_warning_en = "Claimed non-existent boxed warning";
  drugs4.records.find(d => d.id === 'drug.atropine').field_sources = drugs4.records.find(d => d.id === 'drug.atropine').field_sources || {};
  drugs4.records.find(d => d.id === 'drug.atropine').field_sources.boxed_warning_en = ["dailymed:a116af5c-ba4c-408c-9a02-4bc33772aa8d#BOXED_WARNING"];
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugs4, null, 2), 'utf8');
  const pass4 = runValidator();
  results.push({ id: 4, name: '4. Unsupported section claim', expected: 'FAIL', actual: pass4 ? 'PASS' : 'FAIL', pass: !pass4 });
  restore();

  // Test 5: Stale interaction DailyMed SetID → FAIL
  const drugs5 = JSON.parse(origDrugs);
  drugs5.records[0].drug_interactions_graded = drugs5.records[0].drug_interactions_graded || [];
  drugs5.records[0].drug_interactions_graded.push({
    with_label_en: "Test Drug",
    evidence: "documented_clinical",
    sources: ["dailymed:stale-unverified-setid-12345#DRUG_INTERACTIONS"]
  });
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugs5, null, 2), 'utf8');
  const pass5 = runValidator();
  results.push({ id: 5, name: '5. Stale interaction DailyMed SetID', expected: 'FAIL', actual: pass5 ? 'PASS' : 'FAIL', pass: !pass5 });
  restore();

  // Test 6: Course-only official safety source → FAIL
  const drugs6 = JSON.parse(origDrugs);
  drugs6.records[0].contraindications_en = ["Some contraindication"];
  drugs6.records[0].field_sources = drugs6.records[0].field_sources || {};
  drugs6.records[0].field_sources.contraindications_en = ["course:test"];
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugs6, null, 2), 'utf8');
  const pass6 = runValidator();
  results.push({ id: 6, name: '6. Course-only official safety source', expected: 'FAIL', actual: pass6 ? 'PASS' : 'FAIL', pass: !pass6 });
  restore();

  // Test 7: Generic source safety bypass → FAIL
  const classes7 = JSON.parse(origClasses);
  classes7.records[0].class_contraindications_en = ["Class contraindication"];
  classes7.records[0].sources = ["dailymed:a116af5c-ba4c-408c-9a02-4bc33772aa8d#CONTRAINDICATIONS"];
  delete (classes7.records[0].field_sources || {}).class_contraindications_en;
  fs.writeFileSync(CLASSES_PATH, JSON.stringify(classes7, null, 2), 'utf8');
  const pass7 = runValidator();
  results.push({ id: 7, name: '7. Generic source safety bypass', expected: 'FAIL', actual: pass7 ? 'PASS' : 'FAIL', pass: !pass7 });
  restore();

  // Test 8: Deprecated field → FAIL
  const drugs8 = JSON.parse(origDrugs);
  drugs8.records[0].overdose_toxicity_notes_en = "Deprecated overdose notes";
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugs8, null, 2), 'utf8');
  const pass8 = runValidator();
  results.push({ id: 8, name: '8. Deprecated field', expected: 'FAIL', actual: pass8 ? 'PASS' : 'FAIL', pass: !pass8 });
  restore();

  // Test 9: Fake human review → FAIL
  const drugs9 = JSON.parse(origDrugs);
  drugs9.records[0].verification_status = "human_reviewed";
  delete drugs9.records[0].reviewed_by;
  delete drugs9.records[0].reviewed_at;
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugs9, null, 2), 'utf8');
  const pass9 = runValidator();
  results.push({ id: 9, name: '9. Fake human review', expected: 'FAIL', actual: pass9 ? 'PASS' : 'FAIL', pass: !pass9 });
  restore();

} finally {
  restore();
}

console.log('\n====================================================================');
console.log('SOURCE INTEGRITY & SAFETY GATES SUITE (10 TESTS)');
console.log('====================================================================');
results.sort((a, b) => a.id - b.id).forEach(r => {
  const icon = r.pass ? '✅' : '❌';
  console.log(`${icon} [${r.expected}] ${r.name.padEnd(55)} Actual: ${r.actual}`);
});

const allPassed = results.every(r => r.pass);
console.log('====================================================================');
if (allPassed) {
  console.log('ALL 10 SOURCE INTEGRITY TESTS PASSED SUCCESSFULLY 100%!');
} else {
  console.error('SOME SOURCE INTEGRITY TESTS FAILED!');
  process.exitCode = 1;
}
