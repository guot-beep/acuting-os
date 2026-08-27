#!/usr/bin/env node
/**
 * test-exposure-timeline-migration.js — exposure 事件序列的遷移保序契約
 * (D17 §5,2026-08-27)。
 *
 * D17 §5:baseline 暴露與 visit 層變動屬於**同一條**縱向模型,必須能重建
 * 時間線(「baseline 咖啡 3 杯/日 + Visit #4 改成 1 杯/日」)。
 *
 * 既有保護的缺口:walkthrough-phase-e 驗過「三個事件、劑量可還原」,但那是
 * 在 localStorage 這一側。**遷移那一刻**沒有任何測試 —— 而遷移正是最容易
 * 只取末狀態的地方:把 exposure 寫成一列、status='stopped'、dose='400 mg',
 * 看起來完全正確,病人現況也對,只是「劑量改過」與「一開始就是 400 mg」
 * 從此無法區分。那不會讓任何 validator 變紅,因為現況欄位全都在。
 *
 * 這支用 schema.sql 的真實表結構模擬遷移(case_agent_exposures +
 * case_exposure_events 兩表),然後從模擬出的資料列**反向重建**時間線,
 * 逐事件比對原始序列。任何一個環節只取末狀態,反向重建就對不上。
 *
 * 涵蓋四條:
 *   T1 事件數守恆(不得只搬末狀態)
 *   T2 順序守恆(createdAt 排序後逐一相等)
 *   T3 每個事件的酬載守恆(劑量/狀態/確定性/visitId 不得被壓平)
 *   T4 反向重建 = 原始(round-trip 語意等同)
 * 外加兩條負控,證明這支測得到那兩種失敗。
 *
 * 用法:node scripts/test-exposure-timeline-migration.js
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
global.localStorage = {
  getItem() { throw new Error("no real localStorage"); },
  setItem() { throw new Error("no"); },
  removeItem() { throw new Error("no"); },
};
require(path.join(ROOT, "js/clinical-store.js"));
const S = globalThis.AcuTingClinicalStore;

let pass = 0;
const ok = (m) => { pass++; console.log("  ✓ " + m); };

// ---- schema 對照:模擬遷移必須照真實表欄,不自己發明 -------------------------
const sql = fs.readFileSync(path.join(ROOT, "data/clinical_cases/schema.sql"), "utf8");
function colsOf(table) {
  const s = sql.indexOf(`CREATE TABLE IF NOT EXISTS ${table}`);
  assert(s >= 0, `schema.sql 找不到 ${table}`);
  const body = sql.slice(s, sql.indexOf("\n);", s));
  return body.split("\n").slice(1)
    .map((l) => l.trim().match(/^([a-z_]+)\s+(TEXT|INTEGER|REAL|BOOLEAN)/i))
    .filter(Boolean).map((m) => m[1]);
}
const EXP_COLS = colsOf("case_agent_exposures");
const EVT_COLS = colsOf("case_exposure_events");
assert(EVT_COLS.includes("event_type") && EVT_COLS.includes("parent_id"),
  "case_exposure_events 缺 event_type/parent_id —— 遷移目標表結構變了,本測試需同步更新");
ok(`schema 對照:case_agent_exposures ${EXP_COLS.length} 欄 / case_exposure_events ${EVT_COLS.length} 欄`);

// ---- 造一條有三次變動的真實暴露 ---------------------------------------------
// applyExposureChange / createExposure 是純函式:回傳新物件,不就地修改。
// 那本身就是 append-only 的一道保障(呼叫端拿不到可變的 events 陣列),
// 所以每一步都必須接回傳值 —— 這也是這支測試第一版寫錯的地方,值得留著。
// createdAt 由 store 自己蓋(new Date().toISOString()),不吃呼叫端給的值:
// 時間戳來自系統而非資料,遷移時排序才不會被偽造的順序騙過去。
let exp = S.createExposure(
  { agentType: "supplement", agentId: "supp.magnesium", nameText: "Magnesium glycinate", infoSource: "patient_reported" },
  { eventType: "initial_recorded", doseText: "200 mg", frequencyText: "nightly", status: "current", effectiveApprox: "2026-03" },
  "agent"
);
exp = S.applyExposureChange(exp, { eventType: "dose_changed", doseText: "400 mg", visitId: "soap.v2" }, "agent");
exp = S.applyExposureChange(exp, { eventType: "stopped", status: "stopped", note: "GI upset", visitId: "soap.v3" }, "agent");
const src = exp;
const original = S.getExposureTimeline(src);
assert.strictEqual(original.length, 3);
ok("來源:一條 exposure、三次變動(200mg → 400mg → stopped)");

// ---- 模擬遷移:照 schema 拆成兩表 --------------------------------------------
const snake = (s) => s.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
function migrate(exposure, caseId) {
  const row = { id: exposure.id, case_id: caseId };
  for (const [k, v] of Object.entries(exposure)) {
    if (k === "events") continue;
    const col = snake(k);
    if (EXP_COLS.includes(col)) row[col] = v;
  }
  const events = (exposure.events || []).map((e) => {
    const r = { id: e.id, case_id: caseId, parent_type: "agent", parent_id: exposure.id };
    for (const [k, v] of Object.entries(e)) {
      const col = snake(k);
      if (EVT_COLS.includes(col)) r[col] = v;
    }
    return r;
  });
  return { row, events };
}
function rebuild({ row, events }) {
  const camel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  const evs = [...events].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
    .map((r) => {
      const o = {};
      for (const [k, v] of Object.entries(r)) {
        if (["case_id", "parent_type", "parent_id"].includes(k)) continue;
        if (v === undefined) continue;
        o[camel(k)] = v;
      }
      return o;
    });
  return evs;
}

const migrated = migrate(src, "case.test");
const restored = rebuild(migrated);

// T1 事件數守恆
assert.strictEqual(migrated.events.length, 3, "T1:遷移後事件列數不是 3 —— 只搬了末狀態?");
ok("T1 事件數守恆:3 → 3 列");

// T2 順序守恆
assert.deepStrictEqual(restored.map((e) => e.eventType), original.map((e) => e.eventType),
  "T2:反向重建的事件順序與原始不符");
ok("T2 順序守恆:initial_recorded → dose_changed → stopped");

// T3 酬載守恆
assert.strictEqual(restored[0].doseText, "200 mg", "T3:首次劑量遺失 —— 這正是「只取末狀態」的症狀");
assert.strictEqual(restored[1].doseText, "400 mg", "T3:變更後劑量遺失");
assert.strictEqual(restored[2].status, "stopped", "T3:停用狀態遺失");
assert.strictEqual(restored[1].visitId, "soap.v2", "T3:事件的 visitId 遺失 —— 無法回答「哪一診改的」");
ok("T3 酬載守恆:每個事件的劑量/狀態/visitId 都在");

// T4 round-trip 語意等同
for (let i = 0; i < original.length; i++) {
  for (const key of ["id", "eventType", "createdAt"]) {
    assert.strictEqual(restored[i][key], original[i][key], `T4:事件[${i}].${key} 不等同`);
  }
}
ok("T4 round-trip:逐事件 id/eventType/createdAt 語意等同");

// ---- 負控:證明這支測得到失敗 -------------------------------------------------
const onlyLast = { row: migrated.row, events: [migrated.events[migrated.events.length - 1]] };
let caught = false;
try { assert.strictEqual(rebuild(onlyLast).length, 3); } catch { caught = true; }
assert(caught, "負控1 失效:只搬末狀態竟然通過了");
ok("負控1:只搬末狀態 → T1 會失敗");

const flattened = { row: migrated.row, events: migrated.events.map((e) => ({ ...e, dose_text: "400 mg" })) };
caught = false;
try { assert.strictEqual(rebuild(flattened)[0].doseText, "200 mg"); } catch { caught = true; }
assert(caught, "負控2 失效:把歷史劑量壓平成現況竟然通過了");
ok("負控2:把歷史劑量壓平成現況 → T3 會失敗");

console.log(`\n${pass} passed — exposure 事件序列的遷移保序契約成立(D17 §5)`);
