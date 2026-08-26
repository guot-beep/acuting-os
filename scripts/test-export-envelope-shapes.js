#!/usr/bin/env node
/**
 * test-export-envelope-shapes.js — D12 匯出信封契約(2026-08-26)。
 *
 * 契約:
 *   匯出(v1 路徑) = { schema_version: 1, exported_at, case_count, cases }
 *   匯入接受三種形狀,其他一律 fail loud:
 *     1. 裸病例陣列(2026-08-26 以前的每一份備份 —— 永久支援)
 *     2. schema_version:1 信封(本日起的匯出)
 *     3. schema_version:2 信封(v2 staging 備份;由 app.js 的 v2 分支處理,
 *        不歸 unwrapV1CasesPayload 管 —— 走到它就是上游條件破了,必須丟錯)
 *
 * 照 test-knowledge-gap-logging.js 的模式:從 app.js 抽真正在跑的
 * v1ExportEnvelope / unwrapV1CasesPayload 來測,不複製一份邏輯。
 * 另含兩條靜態斷言:裸匯出(payload = clinicalCases)不得回歸;
 * fixture 必須維持信封形狀(它是「app 匯出長什麼樣」的存證)。
 *
 * 用法:node scripts/test-export-envelope-shapes.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const ROOT = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");

function grabFunction(name) {
  const start = app.indexOf("function " + name + "(");
  if (start < 0) throw new Error(`app.js 裡找不到 function ${name} —— 被改名或移除了,這個測試必須跟著更新,不能默默跳過`);
  let depth = 0;
  for (let j = app.indexOf("{", start); j < app.length; j++) {
    if (app[j] === "{") depth++;
    else if (app[j] === "}") { depth--; if (depth === 0) return app.slice(start, j + 1); }
  }
  throw new Error(`function ${name} 的括號沒有收斂`);
}

const sandbox = { console, JSON, Array, Date, Error, Number, String };
vm.createContext(sandbox);
vm.runInContext(grabFunction("v1ExportEnvelope") + "\n" + grabFunction("unwrapV1CasesPayload"), sandbox);
const { v1ExportEnvelope, unwrapV1CasesPayload } = sandbox;

let pass = 0;
const ok = (m) => { pass++; console.log("PASS", m); };
const mustThrowUserFacing = (fn, label, msgPart) => {
  try {
    fn();
  } catch (e) {
    assert.strictEqual(e.userFacing, true, `${label}: 錯誤必須是 userFacing(alert 才會顯示原因)`);
    if (msgPart) assert.ok(e.message.includes(msgPart), `${label}: 訊息應含「${msgPart}」,實際:${e.message}`);
    ok(label);
    return;
  }
  throw new Error(`${label}: 應該要丟錯卻沒有`);
};

const CASES = [{ id: "case.t1", patientCode: "P-2099-001", soapNotes: [] }];

// 1. 舊裸陣列:原樣通過(參照相等 —— 不准偷偷複製或改動)
assert.strictEqual(unwrapV1CasesPayload(CASES), CASES);
ok("裸陣列(舊備份)原樣通過");

// 2. 匯出→匯入 round-trip
const env = v1ExportEnvelope(CASES);
assert.strictEqual(env.schema_version, 1);
assert.strictEqual(env.case_count, 1);
assert.ok(!Number.isNaN(Date.parse(env.exported_at)), "exported_at 必須是可解析時間");
assert.strictEqual(unwrapV1CasesPayload(JSON.parse(JSON.stringify(env)))[0].id, "case.t1");
ok("v1ExportEnvelope → unwrap round-trip");

// 3. 信封壞形狀:cases 不是陣列
mustThrowUserFacing(() => unwrapV1CasesPayload({ schema_version: 1, cases: "x" }), "schema_version:1 但 cases 非陣列", "cases 不是陣列");

// 4. v2 信封到不了這裡 —— 到了就必須丟錯,不准當 v1 解讀
mustThrowUserFacing(() => unwrapV1CasesPayload({ schema_version: 2 }), "v2 形狀不完整落到 v1 路徑", "v2");

// 5. 認不得的物件
mustThrowUserFacing(() => unwrapV1CasesPayload({ schema_version: 3, cases: [] }), "未知 schema_version", "認不得");
mustThrowUserFacing(() => unwrapV1CasesPayload({ hello: 1 }), "無版本欄位的物件", "認不得");

// 6. 非物件非陣列
mustThrowUserFacing(() => unwrapV1CasesPayload("text"), "字串輸入", "不是陣列也不是物件");

// 7. 錯誤訊息絕不轉述輸入內容(SOL R-13):塞一段假病歷文字,訊息不得含它
try {
  unwrapV1CasesPayload({ schema_version: 9, chiefComplaint: "頭痛在XX國小教書時加重" });
  throw new Error("應丟錯");
} catch (e) {
  assert.ok(!e.message.includes("國小"), "錯誤訊息洩漏了輸入內容");
  ok("形狀錯誤訊息不轉述檔案內容");
}

// 8. 靜態:裸匯出不得回歸 —— v1 匯出路徑必須經過 v1ExportEnvelope
assert.ok(!app.includes("payload = clinicalCases;"), "app.js 又出現裸匯出 payload = clinicalCases —— D12 信封被繞過了");
assert.ok(app.includes("payload = v1ExportEnvelope(clinicalCases);"), "v1 匯出路徑沒有走 v1ExportEnvelope");
ok("靜態:匯出路徑走信封,裸匯出未回歸");

// 9. fixture 是信封形狀的存證,而且 invariants gate 的 loader 讀得懂它
const fixture = JSON.parse(fs.readFileSync(path.join(ROOT, "data/clinical_cases/sample_export_fixture.json"), "utf8"));
assert.strictEqual(fixture.schema_version, 1, "fixture 必須維持 schema_version:1 信封(它是匯出格式的存證)");
const unwrapped = unwrapV1CasesPayload(fixture);
assert.ok(Array.isArray(unwrapped) && unwrapped.length > 0, "fixture 信封解出的 cases 不能是空的");
ok("fixture 維持信封形狀且可解出病例");

console.log(`\n${pass}/10 PASS — D12 匯出信封契約成立`);
