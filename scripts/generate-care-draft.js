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
 * PHI(2026-08-14 Ting ruling / CODEX AUDIT #1):產出**是病歷**,不是去識別的
 * 摘要。瀏覽器端下載前有二次確認框;CLI 這一端的等價物是 `--phi-ack` ——
 * 寫檔(`--out`)必須明示,印到 stdout 則至少走一次 stderr 警告。這不是儀式:
 * 寫出去的那個檔會被雲端同步,而 CLI 最常見的用法就是「先存起來再說」。
 *
 * Usage:
 *   node scripts/generate-care-draft.js <cases-export.json> --case <caseId> [--lang zh|en|both]
 *   node scripts/generate-care-draft.js <cases-export.json> --case <caseId> --out draft.md --phi-ack
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
//
// 載入一律走 scripts/lib/load-knowledge.js。這裡曾用「單一賦值 + 裸 JSON RHS」
// 的正則自己解發射格式——分片改用 Object.assign 合流後那個正則會靜默解掛
// （catch → null → 標籤全部退化成 raw id 而 exit 0）。發射格式只准 build-data
// 與 lib 兩處知道。
// ---------------------------------------------------------------------------
const { loadKnowledge, loadGeneratedGlobal } = require(path.join(__dirname, "lib", "load-knowledge.js"));

function buildLabelIndex() {
  const K = loadKnowledge();
  const points = loadGeneratedGlobal(path.join("data", "generated", "points_361.js"), "ACUTING_POINTS_361");
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
    else if (a === "--phi-ack") args.phiAck = true;
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

  /* PHI(2026-08-14 Ting ruling / CODEX AUDIT #1)。
   * 舊斷言是 `bodyLines[0].includes("patientCode")` —— 它要求病人代碼**出現**
   * 在第一行,所以修好之後留著它會把正確行為判成 FAIL。整組換掉,不是加一條:
   * 現在的契約是「一個字都不出現」,加上檔名也不准帶。 */
  assert(!item.patientCode || !draft.includes(item.patientCode), "patientCode leaked into the draft");
  assert(!item.caseTitle || !draft.includes(item.caseTitle), "caseTitle leaked into the draft");
  assert(draft.startsWith("> ⚠️ **本檔含 PHI"), "PHI banner is not the first thing in the draft");
  const fname = CareDraft.draftFilename(item, "2026-08-11");
  assert(!item.caseTitle || !fname.includes(item.caseTitle), "caseTitle leaked into the download filename");
  assert(!item.patientCode || !fname.includes(item.patientCode), "patientCode leaked into the download filename");
  console.log(`PASS: patientCode/caseTitle absent from draft and filename (${fname}); PHI banner on top`);

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

  // 警告一律走 stderr:stdout 是草稿本身,管線接出去的人不該被警告污染,
  // 但也不該看不到警告。
  const counts = CareDraft.phiCounts(draft);   // 與黑框、瀏覽器確認框同一支
  const findings = counts.findings;
  const kinds = [...new Set(findings.map((f) => `${f.id} ${f.label}`))];
  console.error("⚠️  這份草稿含 PHI,未做任何去識別。");
  console.error(`    精確日期 ${counts.dates.distinct} 個(全文 ${counts.dates.total} 處)· 病歷原文照錄 · 病人原話照錄`);
  console.error(
    findings.length
      ? `    自動掃描另外命中 ${findings.length} 處識別碼樣式:${kinds.join("、")}`
      : "    自動掃描未命中識別碼樣式 —— 掃不到不代表乾淨,姓名沒有機器特徵"
  );

  if (args.out) {
    if (!args.phiAck) {
      console.error("");
      console.error(`⛔ 拒絕寫檔:${args.out}`);
      console.error("   寫出去的檔案會被雲端同步、會被順手轉寄。要寫請明示:");
      console.error(`   node scripts/generate-care-draft.js ${file} --case ${args.case} --out ${args.out} --phi-ack`);
      process.exit(2);
    }
    fs.writeFileSync(args.out, draft);
    console.error(`draft written (PHI): ${args.out}`);
  } else {
    console.log(draft);
  }
}

if (require.main === module) main();

module.exports = { generateDraft: CareDraft.generateDraft, loadCasesFile, findCase, buildLabelIndex, loadOutcomeMetricDefs, ageRangeFromBirth: CareDraft.ageRangeFromBirth, buildTimeline: CareDraft.buildTimeline };
