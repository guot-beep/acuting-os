#!/usr/bin/env node
/**
 * test-pharm-negative-cases.js — Direct negative test suite for pharmacology safety gates.
 *
 * Verifies Negative Tests A, B, C, D (must FAIL) and E (must PASS).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DRUGS_PATH = path.join(ROOT, 'data/pharmacology/drugs.json');
const CLASSES_PATH = path.join(ROOT, 'data/pharmacology/drug_classes.json');

// 這兩行把當下的檔案內容當成「原始檔」,結束時寫回去。若此刻檔案已經被別的
// 行程改壞,還原就會把壞資料寫成永久狀態(2026-08-12 實際發生)。先確認乾淨。
require('./lib/pharm-fixture-guard').assertFixturesClean(ROOT, [
  'data/pharmacology/drugs.json', 'data/pharmacology/drug_classes.json',
  'data/pharmacology/medlineplus_verified_links.json',
]);

const origDrugs = fs.readFileSync(DRUGS_PATH, 'utf8');
const origClasses = fs.readFileSync(CLASSES_PATH, 'utf8');

function restore() {
  fs.writeFileSync(DRUGS_PATH, origDrugs, 'utf8');
  fs.writeFileSync(CLASSES_PATH, origClasses, 'utf8');
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
  // Test E: Baseline valid dataset MUST PASS
  const basePass = runValidator();
  results.push({ test: 'Negative Test E (Baseline Valid Dataset)', expected: 'PASS', actual: basePass ? 'PASS' : 'FAIL', pass: basePass });

  // Test A: Contraindication sourced ONLY to course:test MUST FAIL
  const drugsA = JSON.parse(origDrugs);
  drugsA.records[0].contraindications_en = ["Some contraindication"];
  drugsA.records[0].field_sources = drugsA.records[0].field_sources || {};
  drugsA.records[0].field_sources.contraindications_en = ["course:test"];
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugsA, null, 2), 'utf8');
  const passA = runValidator();
  results.push({ test: 'Negative Test A (Contraindication sourced ONLY to course:test)', expected: 'FAIL', actual: passA ? 'PASS' : 'FAIL', pass: !passA });
  restore();

  // Test B: Class contraindication with only generic sources: ["course:test"] MUST FAIL
  const classesB = JSON.parse(origClasses);
  classesB.records[0].class_contraindications_en = ["Class contraindication"];
  classesB.records[0].sources = ["course:test"];
  delete (classesB.records[0].field_sources || {}).class_contraindications_en;
  fs.writeFileSync(CLASSES_PATH, JSON.stringify(classesB, null, 2), 'utf8');
  const passB = runValidator();
  results.push({ test: 'Negative Test B (Class contraindication with only generic sources: ["course:test"])', expected: 'FAIL', actual: passB ? 'PASS' : 'FAIL', pass: !passB });
  restore();

  // Test C: Record containing overdose_toxicity_notes_en MUST FAIL
  const drugsC = JSON.parse(origDrugs);
  drugsC.records[0].overdose_toxicity_notes_en = "Deprecated overdose notes";
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugsC, null, 2), 'utf8');
  const passC = runValidator();
  results.push({ test: 'Negative Test C (Record containing overdose_toxicity_notes_en)', expected: 'FAIL', actual: passC ? 'PASS' : 'FAIL', pass: !passC });
  restore();

  // Test D: AI-authored record marked human_reviewed without explicit reviewed_by/reviewed_at MUST FAIL
  const drugsD = JSON.parse(origDrugs);
  drugsD.records[0].verification_status = "human_reviewed";
  delete drugsD.records[0].reviewed_by;
  delete drugsD.records[0].reviewed_at;
  fs.writeFileSync(DRUGS_PATH, JSON.stringify(drugsD, null, 2), 'utf8');
  const passD = runValidator();
  results.push({ test: 'Negative Test D (AI-authored record marked human_reviewed without explicit reviewer provenance)', expected: 'FAIL', actual: passD ? 'PASS' : 'FAIL', pass: !passD });
  restore();

} finally {
  restore();
}

console.log('\n====================================================');
console.log('PHARMACOLOGY NEGATIVE TEST SUITE (TESTS A - E)');
console.log('====================================================');
results.forEach(r => {
  const icon = r.pass ? '✅' : '❌';
  console.log(`${icon} ${r.test.padEnd(70)} Expected: ${r.expected} | Actual: ${r.actual}`);
});

const allPassed = results.every(r => r.pass);
console.log('====================================================');
if (allPassed) {
  console.log('ALL NEGATIVE TESTS PASSED SUCCESSFULLY 100%!');
} else {
  console.error('SOME NEGATIVE TESTS FAILED!');
  process.exitCode = 1;
}
