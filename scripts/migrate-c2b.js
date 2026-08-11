/* C2b migration — DRY-RUN ONLY scaffold(docs/C2B_MIGRATION_PLAN.md §B)
 *
 * 現階段這支腳本【只會】產生 deterministic plan,不寫任何 storage。
 * execute 模式刻意不存在:真實執行要等 (1) Codex 對計畫+本腳本+dry-run 報告
 * 給 GO,(2) Ting 在場。到時 execute 也不是這支直接改 localStorage —— 而是
 * 由 app 端把 plan 寫進 shadow key `acuting-clinical-v2-staging`,驗證全綠後
 * 單一 pointer 切換(計畫 §B.4)。
 *
 * Determinism 條款(Codex §B.1):
 *   - Patient id = "patient." + sha256(patientCode).hex.slice(0,12) —— 純函數。
 *   - 無 Date.now / Math.random;plan 的 executed_at 留給真實執行時的 journal。
 *   - 同一 source bytes 重跑必得 byte-identical plan(自測見 --self-test)。
 *
 * 用法:
 *   node scripts/migrate-c2b.js --dry-run <raw-cases.json> [--out plan.json]
 *   node scripts/migrate-c2b.js --self-test
 *
 * 輸入必須是 RAW snapshot(直接來自 localStorage 的 bytes),不得先經
 * normalizer(Codex §A.4 / HIGH#6:normalize 會填 defaults,污染 missingness)。
 */
"use strict";
const fs = require("fs");
const crypto = require("crypto");

// 衍生邏輯與 runtime 同源:直接載入 clinical-store(零 DOM 依賴,globalThis 掛載)。
require("../js/clinical-store.js");
const S = globalThis.AcuTingClinicalStore;

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const patientIdOf = (patientCode) => "patient." + sha256("acuting-patient:" + patientCode).slice(0, 12);

function buildPlan(rawBytes) {
  const cases = JSON.parse(rawBytes);
  if (!Array.isArray(cases)) throw new Error("raw snapshot must be a JSON array of cases");

  // 衍生 patient 視圖 —— 注意:這裡吃 RAW case 物件。derivePatientsFromCases
  // 對缺鍵容忍([]/"" 視為空),不需要也不可以先 normalize。
  const derived = S.derivePatientsFromCases(cases);

  const patients = derived.map((p) => ({
    id: patientIdOf(p.patientCode),
    patientCode: p.patientCode,
    caseIds: p.caseIds,
    caseCount: p.caseCount,
    // 9 個抬升欄位照 derivation 結果;conflicts/needsReview 原樣進 plan,
    // needsReview 欄位落地為 NULL + 附錄,等人工裁決(計畫 §B.7)。
    fields: Object.fromEntries(["birthYearMonth", "birthYear", "sex", "genderIdentity", "raceEthnicity", "raceEthnicityDetail", "occupation", "allergyStatus", "allergies"].map((f) => [f, p[f]])),
    conflicts: p.conflicts,
    needsReview: p.needsReview
  }));

  const caseAssignments = cases.map((c) => ({
    caseId: c.id,
    patientCode: String(c.patientCode || "").trim(),
    patientId: String(c.patientCode || "").trim() ? patientIdOf(String(c.patientCode).trim()) : null
  }));

  const blankCodeCases = caseAssignments.filter((a) => !a.patientId).map((a) => a.caseId);
  const reviewQueue = patients.filter((p) => p.needsReview.length || Object.keys(p.conflicts).length);

  return {
    migration_version: "c2b-1",
    source_sha256: sha256(rawBytes),
    source_bytes: rawBytes.length,
    counts: {
      cases: cases.length,
      soapNotes: cases.reduce((s, c) => s + (Array.isArray(c.soapNotes) ? c.soapNotes.length : 0), 0),
      patients: patients.length,
      blankCodeCases: blankCodeCases.length,
      conflictPatients: reviewQueue.length
    },
    patients,
    caseAssignments,
    blankCodeCases,
    manualReviewQueue: reviewQueue.map((p) => ({ patientId: p.id, patientCode: p.patientCode, needsReview: p.needsReview, conflicts: p.conflicts }))
  };
}

function selfTest() {
  const fixture = JSON.stringify([
    { id: "c1", patientCode: "P-A", birthYear: 1980, sex: "F", updatedAt: "2026-08-01", soapNotes: [{ id: "s1" }] },
    { id: "c2", patientCode: "P-A", sex: "F", occupation: "chef", updatedAt: "2026-08-05", soapNotes: [] },
    { id: "c3", patientCode: "P-B", sex: "M", updatedAt: "", soapNotes: [{ id: "s2" }, { id: "s3" }] },
    { id: "c4", patientCode: "", soapNotes: [] }
  ]);
  const a = JSON.stringify(buildPlan(fixture));
  const b = JSON.stringify(buildPlan(fixture));
  const plan = JSON.parse(a);
  const checks = [
    ["deterministic (two runs byte-identical)", a === b],
    ["patients derived", plan.counts.patients === 2],
    ["multi-case patient grouped", plan.patients.find((p) => p.patientCode === "P-A").caseCount === 2],
    ["patient id is pure function", plan.patients.find((p) => p.patientCode === "P-A").id === patientIdOf("P-A")],
    ["blank-code case listed, not dropped", plan.blankCodeCases.length === 1 && plan.blankCodeCases[0] === "c4"],
    ["counts cover soap notes", plan.counts.soapNotes === 3],
    ["birthYear lifted", plan.patients.find((p) => p.patientCode === "P-A").fields.birthYear === 1980]
  ];
  let failed = 0;
  for (const [name, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); if (!ok) failed++; }
  process.exit(failed ? 1 : 0);
}

const args = process.argv.slice(2);
if (args[0] === "--self-test") {
  selfTest();
} else if (args[0] === "--dry-run" && args[1]) {
  const rawBytes = fs.readFileSync(args[1], "utf8");
  const plan = buildPlan(rawBytes);
  const outIdx = args.indexOf("--out");
  const serialized = JSON.stringify(plan, null, 2);
  if (outIdx > -1 && args[outIdx + 1]) { fs.writeFileSync(args[outIdx + 1], serialized + "\n"); console.log(`plan written: ${args[outIdx + 1]}`); }
  else console.log(serialized);
  console.log(`# dry-run only — nothing was written to any storage. source_sha256=${plan.source_sha256.slice(0, 16)}… cases=${plan.counts.cases} patients=${plan.counts.patients} review=${plan.counts.conflictPatients}`);
} else {
  console.log("usage:\n  node scripts/migrate-c2b.js --dry-run <raw-cases.json> [--out plan.json]\n  node scripts/migrate-c2b.js --self-test");
  process.exit(2);
}
