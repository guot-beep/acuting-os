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

/* Codex R5 P3.3:plan 生成已搬進 js/clinical-store.js(單一來源,app 匯入
 * 驗證共用)。本 CLI 委派之;sha256 以 async 包裝注入。 */
const sha256Async = async (t) => sha256(t);
const buildPlan = (rawBytes, adjudications) => S.buildMigrationPlan(rawBytes, adjudications, sha256Async);

async function selfTest() {
  const fixture = JSON.stringify([
    { id: "c1", patientCode: "P-A", birthYear: 1980, sex: "F", updatedAt: "2026-08-01", soapNotes: [{ id: "s1" }] },
    { id: "c2", patientCode: "P-A", sex: "F", occupation: "chef", updatedAt: "2026-08-05", soapNotes: [] },
    { id: "c3", patientCode: "P-B", sex: "M", updatedAt: "", soapNotes: [{ id: "s2" }, { id: "s3" }] },
    { id: "c4", patientCode: "", soapNotes: [] }
  ]);
  const a = JSON.stringify(await buildPlan(fixture));
  const b = JSON.stringify(await buildPlan(fixture));
  const plan = JSON.parse(a);
  const checks = [
    ["deterministic (two runs byte-identical)", a === b],
    ["patients derived", plan.counts.patients === 2],
    ["multi-case patient grouped", plan.patients.find((p) => p.patientCode === "P-A").caseCount === 2],
    ["patient id is pure function", plan.patients.find((p) => p.patientCode === "P-A").id === "patient." + sha256("acuting-patient:P-A").slice(0, 12)],
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
  (async () => {
  const rawBytes = fs.readFileSync(args[1], "utf8");
  const adjIdx = args.indexOf("--adjudications");
  const adjudications = adjIdx > -1 && args[adjIdx + 1] ? JSON.parse(fs.readFileSync(args[adjIdx + 1], "utf8")) : [];
  const plan = await buildPlan(rawBytes, adjudications);
  const outIdx = args.indexOf("--out");
  const serialized = JSON.stringify(plan, null, 2);
  if (outIdx > -1 && args[outIdx + 1]) { fs.writeFileSync(args[outIdx + 1], serialized + "\n"); console.log(`plan written: ${args[outIdx + 1]}`); }
  else console.log(serialized);
  console.log(`# dry-run only — nothing was written to any storage. source_sha256=${plan.source_sha256.slice(0, 16)}… cases=${plan.counts.cases} patients=${plan.counts.patients} review=${plan.counts.conflictPatients}`);
  })().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
} else {
  console.log("usage:\n  node scripts/migrate-c2b.js --dry-run <raw-cases.json> [--out plan.json]\n  node scripts/migrate-c2b.js --self-test");
  process.exit(2);
}
