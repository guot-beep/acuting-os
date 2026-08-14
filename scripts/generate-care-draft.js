#!/usr/bin/env node
/* CARE case-report draft generator — CLI 版
 *
 * 2026-08-13 改寫:計算全部移到 `js/care-draft.js`(瀏覽器與 CLI 共用),
 * 本檔只負責「讀檔 → 呼叫計算 → 印/寫檔」。理由同 scripts/practice-audit.js
 * 那次改寫:app 畫面現在也要生成同一份草稿(病例詳情的 Case Report Readiness
 * 面板有「產生草稿」按鈕),同一個問題不能有兩份實作。
 *
 * Reads an app export (v1 array or v2 {cases:[...]} envelope), picks one
 * case, and emits a CARE 2013-structured markdown draft (+ STRICTA 2010 when
 * the case has needling data). Spec/mapping = docs/CARE_READINESS_MAP_v0.md.
 *
 * Usage:
 *   node scripts/generate-care-draft.js <cases-export.json> --case <caseId> [--out draft.md] [--lang zh|en|both]
 *   node scripts/generate-care-draft.js --self-test
 */
"use strict";
const fs = require("fs");
const path = require("path");

require(path.join(__dirname, "..", "js", "clinical-store.js"));
const CareDraft = require(path.join(__dirname, "..", "js", "care-draft.js"));

// ---------------------------------------------------------------------------
// Knowledge label resolver — best-effort, NEVER throws. Any bundle that is
// missing/unparseable is silently skipped; resolveLabel() falls back to the
// raw id. This generator must still work on a fresh checkout that has not
// run build-data.js.
// ---------------------------------------------------------------------------
function loadGeneratedGlobalAssignment(relPath) {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
    const jsonText = raw.replace(/^[^=]*=\s*/, "").replace(/;\s*$/, "");
    return JSON.parse(jsonText);
  } catch (e) {
    return null;
  }
}

function buildLabelIndex() {
  const K = loadGeneratedGlobalAssignment(path.join("data", "generated", "knowledge_data.js"));
  const points = loadGeneratedGlobalAssignment(path.join("data", "generated", "points_361.js"));
  return CareDraft.buildLabelIndexFromKnowledge(K, points);
}

function loadOutcomeMetricDefs() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "..", "data", "clinical_cases", "outcome_metrics.json"), "utf8");
    const j = JSON.parse(raw);
    return CareDraft.metricDefMapFromKnowledge(j.records);
  } catch (e) {
    return new Map();   // absent bundle -> empty map, resolveMetricLabel falls back to raw id
  }
}

function loadCasesFile(file) {
  const raw = fs.readFileSync(file, "utf8");
  let parsed = JSON.parse(raw);
  if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.cases)) parsed = parsed.cases; // v2 envelope
  if (!Array.isArray(parsed)) throw new Error(`${file}: not a v1 array nor a v2 envelope with .cases`);
  return parsed;
}

function findCase(cases, caseId) {
  const found = cases.find((c) => c.id === caseId);
  if (!found) {
    const ids = cases.map((c) => c.id).join(", ");
    throw new Error(`case "${caseId}" not found. Available ids: ${ids || "(none)"}`);
  }
  return found;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--case") args.case = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--lang") args.lang = argv[++i];
    else if (a === "--self-test") args.selfTest = true;
    else args._.push(a);
  }
  return args;
}

function assert(cond, msg) {
  if (!cond) throw new Error("SELF-TEST FAIL: " + msg);
}

function runSelfTest() {
  console.log("=== generate-care-draft.js self-test ===");
  const labelIdx = buildLabelIndex();
  const metricDefs = loadOutcomeMetricDefs();

  const fixtureFile = path.join(__dirname, "..", "data", "clinical_cases", "sample_export_fixture.json");
  const cases = loadCasesFile(fixtureFile);
  assert(cases.length > 0, "fixture has no cases");
  const item = cases[0];
  const draft = CareDraft.generateDraft(item, { lang: "both", labelIdx, metricDefs, refDate: new Date("2026-08-11") });

  const CARE_HEADERS = ["CARE 1", "CARE 2", "摘要 Abstract", "4 · ", "5 · ", "6 · ", "7 · ", "8 · ", "9 · ", "10 · ", "11 · ", "12 · ", "13 · "];
  for (const h of CARE_HEADERS) assert(draft.includes(h), `missing CARE A-section header containing "${h}"`);
  console.log(`PASS: all ${CARE_HEADERS.length} CARE A-section headers present`);

  assert(draft.includes("⚠️") && draft.includes("發表同意"), "consent warning missing for non-granted case");
  console.log("PASS: consent warning renders for non-granted publicationConsent");

  const gapCount = (draft.match(/〔缺:/g) || []).length;
  assert(gapCount > 0, "expected gap markers > 0 for the sparse fixture case");
  console.log(`PASS: gap markers present (count=${gapCount})`);

  const bodyLines = draft.split("\n");
  assert(bodyLines[0].includes("patientCode"), "header HTML comment missing");
  const bodyOnly = bodyLines.slice(1).join("\n");
  assert(!item.patientCode || !bodyOnly.includes(item.patientCode), "patientCode leaked into draft body outside the header comment");
  console.log("PASS: patientCode confined to header comment only");

  assert(!draft.includes("STRICTA"), "fixture case has no needling data — STRICTA section should be absent");
  console.log("PASS: STRICTA section absent for the fixture case (no needling data)");

  // Synthetic needling case — inline only, never written to data/. Exercises
  // the other half of "STRICTA presence follows needling data" that the
  // fixture (deliberately needling-free) cannot cover on its own.
  const needlingCase = {
    id: "case.selftest_needling",
    patientCode: "SELFTEST-ONLY-NOT-REAL",
    caseTitle: "Self-test needling case",
    publicationConsent: "granted",
    soapNotes: [
      {
        id: "soap.st1",
        visitDate: "2026-01-01",
        visitNumber: 1,
        acupointLinks: ["LI4", "ST36"],
        needleCount: 6,
        needleDepthText: "0.5-1 cun",
        deqiResponse: "obtained",
        needleStimulation: "manual",
        retentionMinutes: 20,
        needleTypeText: "0.25x40mm"
      }
    ]
  };
  const draft2 = CareDraft.generateDraft(needlingCase, { lang: "both", labelIdx, metricDefs, refDate: new Date("2026-08-11") });
  assert(draft2.includes("STRICTA"), "synthetic needling case should render the STRICTA section");
  console.log("PASS: STRICTA section present when needling data exists (synthetic case)");

  console.log("=== ALL SELF-TESTS PASSED ===");
}

function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  if (args.selfTest) {
    runSelfTest();
    return;
  }
  const file = args._[0];
  if (!file || !args.case) {
    console.log("usage: node scripts/generate-care-draft.js <cases-export.json> --case <caseId> [--out draft.md] [--lang zh|en|both]");
    console.log("       node scripts/generate-care-draft.js --self-test");
    process.exit(2);
  }
  const lang = args.lang || "both";
  if (!["zh", "en", "both"].includes(lang)) {
    console.error(`invalid --lang "${lang}" (must be zh|en|both)`);
    process.exit(2);
  }
  let cases;
  try {
    cases = loadCasesFile(file);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  let item;
  try {
    item = findCase(cases, args.case);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  const labelIdx = buildLabelIndex();
  const metricDefs = loadOutcomeMetricDefs();
  const draft = CareDraft.generateDraft(item, { lang, labelIdx, metricDefs, refDate: new Date() });
  if (args.out) {
    fs.writeFileSync(args.out, draft);
    console.log(`draft written: ${args.out}`);
  } else {
    console.log(draft);
  }
}

if (require.main === module) main();

module.exports = { generateDraft: CareDraft.generateDraft, loadCasesFile, findCase, buildLabelIndex, loadOutcomeMetricDefs, ageRangeFromBirth: CareDraft.ageRangeFromBirth, buildTimeline: CareDraft.buildTimeline };
