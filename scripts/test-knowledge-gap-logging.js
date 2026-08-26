#!/usr/bin/env node
/**
 * test-knowledge-gap-logging.js — picker「找不到？記錄缺口」功能
 *
 * 背景(2026-08-25 dry run 現場,Ting 原話):
 *   「當我記錄上去沒有的conditions 時他會亂跳一個症狀 我不希望那樣...
 *    因為如果他隨便亂跳一個症狀 那我就無法真是紀錄我們所缺失的
 *    conditions symptom」
 *   「給 picker 加『其他/自由輸入』後路,先讓妳記得下來,缺口另外收集——
 *    這個我覺得投報率最高」
 *
 * 設計刻意不把自由文字塞進 symptomLinks 這類欄位(下游 AVS/驗證器假設
 * 這些只裝 canonical id),改成獨立寫進 localStorage 的一個 key
 * (acuting-knowledge-gaps-v1),完全不碰病歷欄位。這支測試從 app.js 抽出
 * 真正在跑的 readKnowledgeGaps/writeKnowledgeGaps/logKnowledgeGap/
 * knowledgeGapExportText,不複製一份邏輯來測。
 *
 * 用法:node scripts/test-knowledge-gap-logging.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const appPath = path.join(ROOT, "app.js");
const app = fs.readFileSync(appPath, "utf8");

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

function grabConstBlock(name) {
  const start = app.indexOf(`const ${name} =`);
  if (start < 0) throw new Error(`app.js 裡找不到 const ${name}`);
  const end = app.indexOf("};", start);
  if (end < 0) throw new Error(`const ${name} 沒有結尾`);
  return app.slice(start, end + 2);
}

function grabConstLine(name) {
  const re = new RegExp(`const ${name} = .*;`);
  const m = app.match(re);
  if (!m) throw new Error(`app.js 裡找不到單行 const ${name}`);
  return m[0];
}

// 每個測試情境都要一個全新的 mock localStorage —— 這樣「寫了什麼、幾次」
// 才是可斷言的事實,不是讀 code 猜的。
function mockStorage() {
  const kv = new Map();
  return {
    getItem: (k) => (kv.has(k) ? kv.get(k) : null),
    setItem: (k, v) => { kv.set(k, String(v)); },
    removeItem: (k) => { kv.delete(k); },
  };
}

function makeSandbox(storage) {
  const sandbox = { console, window: { localStorage: storage }, JSON, String, Array, Date };
  vm.createContext(sandbox);
  const src = [
    grabConstLine("KNOWLEDGE_GAP_STORAGE_KEY"),
    grabConstBlock("KNOWLEDGE_GAP_FIELD_LABELS"),
    grabFunction("readKnowledgeGaps"),
    grabFunction("writeKnowledgeGaps"),
    grabFunction("logKnowledgeGap"),
    grabFunction("knowledgeGapExportText"),
  ].join("\n\n");
  vm.runInContext(src, sandbox);
  return sandbox;
}

let pass = 0, fail = 0;
function check(label, cond) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.error(`  ✗ ${label}`); }
}

// 情境 A —— 全新裝置,記錄第一筆缺口
{
  const storage = mockStorage();
  const sb = makeSandbox(storage);
  check("一開始沒有任何缺口", sb.readKnowledgeGaps().length === 0);

  sb.logKnowledgeGap("symptomLinks", "手指麻木刺痛");
  const list1 = sb.readKnowledgeGaps();
  check("記錄後多一筆", list1.length === 1);
  check("欄位名記對了", list1[0].fieldName === "symptomLinks");
  check("查詢文字記對了(不是被改寫過的版本)", list1[0].query === "手指麻木刺痛");
  check("有中文欄位標籤(不是裸的 fieldName)", list1[0].fieldLabel === "症狀 Symptom");
  check("count 從 1 開始", list1[0].count === 1);
  check("有時間戳", typeof list1[0].firstLoggedAt === "string" && list1[0].firstLoggedAt.length > 0);

  // 真的寫進了 mock localStorage,不是只留在記憶體物件裡
  const raw = storage.getItem("acuting-knowledge-gaps-v1");
  check("真的寫進 localStorage(key 正確)", typeof raw === "string" && raw.length > 0);
  check("寫進去的內容 round-trip 得回同一筆", JSON.parse(raw)[0].query === "手指麻木刺痛");
}

// 情境 B —— 同一欄位、同一段文字再記一次要「累加次數」,不是變成兩筆
{
  const storage = mockStorage();
  const sb = makeSandbox(storage);
  sb.logKnowledgeGap("westernConditionLinks", "腕隧道症候群");
  sb.logKnowledgeGap("westernConditionLinks", "腕隧道症候群");
  sb.logKnowledgeGap("westernConditionLinks", "腕隧道症候群");
  const list = sb.readKnowledgeGaps();
  check("同一筆缺口重複記錄不會膨脹成多筆(去重)", list.length === 1);
  check("而是累加 count", list[0].count === 3);
}

// 情境 C —— 不同欄位、不同文字各自獨立記錄
{
  const storage = mockStorage();
  const sb = makeSandbox(storage);
  sb.logKnowledgeGap("symptomLinks", "耳鳴伴隨眩暈");
  sb.logKnowledgeGap("formulaLinks", "抑肝散");
  sb.logKnowledgeGap("herbLinks", "鉤藤");
  const list = sb.readKnowledgeGaps();
  check("三個不同欄位各自成一筆(不是互相蓋掉)", list.length === 3);
  const fields = list.map((g) => g.fieldName).sort();
  check("三筆的欄位名都對得上", JSON.stringify(fields) === JSON.stringify(["formulaLinks", "herbLinks", "symptomLinks"]));
}

// 情境 D —— 空字串/純空白不該記錄任何東西(避免誤觸發塞進垃圾資料)
{
  const storage = mockStorage();
  const sb = makeSandbox(storage);
  sb.logKnowledgeGap("symptomLinks", "");
  sb.logKnowledgeGap("symptomLinks", "   ");
  check("空字串不會被記成一筆缺口", sb.readKnowledgeGaps().length === 0);
}

// 情境 E —— clear() 之後真的清空(window.AcuTingKnowledgeGaps.clear 的底層)
{
  const storage = mockStorage();
  const sb = makeSandbox(storage);
  sb.logKnowledgeGap("acupointLinks", "新發現的一個經外奇穴");
  check("清空前確實有資料", sb.readKnowledgeGaps().length === 1);
  sb.writeKnowledgeGaps([]);
  check("清空後真的是空的(不是殘留舊資料)", sb.readKnowledgeGaps().length === 0);
}

// 情境 F —— exportText() 產出的文字裡看得到欄位標籤、查詢文字、次數
{
  const storage = mockStorage();
  const sb = makeSandbox(storage);
  check("沒有任何缺口時 exportText 講清楚是空的(不是印出一個空字串讓人以為壞掉了)",
    sb.knowledgeGapExportText().includes("沒有") || sb.knowledgeGapExportText().includes("no"));
  sb.logKnowledgeGap("symptomLinks", "小腿抽筋合併水腫");
  sb.logKnowledgeGap("symptomLinks", "小腿抽筋合併水腫");
  const text = sb.knowledgeGapExportText();
  check("exportText 裡看得到查詢文字", text.includes("小腿抽筋合併水腫"));
  check("exportText 裡看得到中文欄位標籤", text.includes("症狀"));
  check("exportText 裡看得到累加次數 ×2", text.includes("×2"));
}

// 情境 G —— localStorage 完全不存在(例如某些沙盒/隱私模式)不能讓看診流程當機
{
  const sb = makeSandbox(undefined); // window.localStorage 直接是 undefined
  let threw = false;
  try {
    sb.logKnowledgeGap("symptomLinks", "測試");
    sb.readKnowledgeGaps();
  } catch (err) {
    threw = true;
  }
  check("localStorage 不存在時不拋錯(不中斷看診)", !threw);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
