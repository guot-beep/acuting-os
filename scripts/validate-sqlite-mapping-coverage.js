#!/usr/bin/env node
/**
 * validate-sqlite-mapping-coverage.js — localStorage→SQLite 對照表的覆蓋率閘
 * (2026-08-27,D18 前置)。
 *
 * D18 把 SQLite 遷移改成條件觸發(病例 ≥50 / 多裝置 / 容量壓力),並明列
 * 「localstorage_sqlite_mapping.json 持續逐欄維護是本提案的前提紀律」——
 * 也就是說:延後不增加未來遷移成本,**前提是那份對照表沒有落後於真實資料**。
 *
 * 但「持續維護」到今天為止只是一句承諾,沒有任何東西在檢查。這支把它變成
 * 可執行的規則:真實病例形狀(fixture)裡出現的每一個欄位,都必須在對照表裡
 * 有一筆登記(mapped / no_destination_yet / intentionally_not_migrated 皆可
 * —— 重點是「被看過並下過判斷」,不是「一定要有去處」)。
 *
 * 為什麼是 fixture 而不是真病例:真病例在瀏覽器的 localStorage 裡,repo 讀不到
 * (D7/D4)。sample_export_fixture.json 是 app 匯出形狀的存證,CI 已在用它守
 * 不變量 —— 同一份資料同時當遷移覆蓋率的量尺,不必另造。
 *
 * 漏一個欄位的後果不是抽象的:遷移那天它會靜靜地不見,而 round-trip 測試
 * 只比對「有登記的欄位」,所以不會報。這正是那種驗證器全綠但資料掉了的
 * 失敗形狀。
 *
 * 用法:node scripts/validate-sqlite-mapping-coverage.js [--json]
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AS_JSON = process.argv.includes("--json");

const mapping = JSON.parse(fs.readFileSync(path.join(ROOT, "data/clinical_cases/localstorage_sqlite_mapping.json"), "utf8"));
const registered = new Set();
for (const m of mapping.mappings || []) {
  registered.add(`${m.source_scope}.${m.source_field}`);
  registered.add(m.source_field);       // 寬鬆比對:scope 命名歷來有出入
}

const fixtureRaw = JSON.parse(fs.readFileSync(path.join(ROOT, "data/clinical_cases/sample_export_fixture.json"), "utf8"));
const cases = fixtureRaw.cases || (Array.isArray(fixtureRaw) ? fixtureRaw : [fixtureRaw]);

// scope 推導:頂層=case、soapNotes[]=soap、其餘陣列元素用該陣列名當 scope。
// 只走兩層 —— 再深的巢狀(事件序列裡的欄位)由 exposure/event 那幾筆整體登記
// 涵蓋,逐一展開會把同一個 shape 報成幾十個假缺口。
const seen = new Map();
function noteField(scope, field) {
  const key = `${scope}.${field}`;
  if (!seen.has(key)) seen.set(key, { scope, field });
}
for (const c of cases) {
  for (const [k, v] of Object.entries(c)) {
    noteField("case", k);
    if (Array.isArray(v) && v.length && typeof v[0] === "object") {
      const childScope = k === "soapNotes" ? "soap" : k;
      for (const row of v) for (const ck of Object.keys(row)) noteField(childScope, ck);
    }
  }
}

const missing = [];
for (const [key, { scope, field }] of seen) {
  if (registered.has(key) || registered.has(field)) continue;
  missing.push({ key, scope, field });
}

if (AS_JSON) {
  const byCode = {};
  for (const m of missing) byCode[m.scope] = (byCode[m.scope] || 0) + 1;
  console.log(JSON.stringify({ defects: missing.length, by_code: byCode }));
  process.exit(0);
}

console.log("localStorage→SQLite 對照表覆蓋率(D18 前提紀律)\n");
console.log(`  對照表登記欄位        ${(mapping.mappings || []).length}`);
console.log(`  fixture 出現的欄位    ${seen.size}`);
console.log(`  未登記                ${missing.length}\n`);
for (const m of missing) console.log(`  ⛔ ${m.key}  —— 真實匯出形狀裡有,對照表沒有`);
if (!missing.length) console.log("  (無)");
if (missing.length) {
  console.log("\n修法:在 localstorage_sqlite_mapping.json 補一筆,");
  console.log("status 可為 mapped / no_destination_yet / intentionally_not_migrated ——");
  console.log("重點是這個欄位被看過並下過判斷,不是一定要有去處。");
}
console.log(missing.length ? `\nFAIL — ${missing.length} 個欄位未登記。` : "\nPASS — 匯出形狀的每個欄位都在對照表裡。");
process.exit(missing.length ? 1 : 0);
