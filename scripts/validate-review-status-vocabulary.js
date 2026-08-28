#!/usr/bin/env node
/**
 * validate-review-status-vocabulary.js — 卡片右上那顆狀態標籤會不會印出生 enum
 *
 * 為什麼有這一支(2026-08-28):
 * `review_status` 是會渲染的欄位——js/knowledge.js 的 statusPill() 拿它查 STATUS_LABEL，
 * 查不到就 **原樣印出那個字串**。所以一個詞彙外的值不會壞掉任何東西、驗證器全綠，
 * 只是學生會在卡片右上看到 `sourced_cloudtcm_record` 這種東西。實測時全庫有 165 筆這樣：
 *   herbs 41(sourced_cloudtcm_record 39 + draft_reviewed 1 + reviewed 1)——資料填錯，已訂正
 *   tdis 85 / supplements 36 / condition 3(skeleton、skeleton_unreviewed)
 *       ——這兩個是本專案刻意的骨架狀態，是 STATUS_LABEL 沒收，已補進渲染端
 * 兩種病因剛好相反，所以這支只回報「詞彙外」，不預設要改哪一邊：
 * **合法的狀態就去補 STATUS_LABEL，填錯的值就去改資料。**
 *
 * 詞彙**直接從 js/knowledge.js 解析**，不在這裡另抄一份 —— 抄第二份就會有一天不同步，
 * 而畫面照樣印得出來，只是印錯(這正是 D13 禁止的那種手抄副本)。
 * 解析不到 STATUS_LABEL 或解析出 0 個鍵 → FAIL，不允許空跑通過。
 *
 * 用法: node scripts/validate-review-status-vocabulary.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const view = fs.readFileSync(path.join(ROOT, "js/knowledge.js"), "utf8");
const m = view.match(/const\s+STATUS_LABEL\s*=\s*\{([\s\S]*?)\}\s*;/);
if (!m) {
  console.log("FAIL — js/knowledge.js 找不到 STATUS_LABEL，被改名或移除了；這支必須跟著更新，不能默默跳過。");
  process.exit(1);
}
const VOCAB = new Set([...m[1].matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/gm)].map((x) => x[1]));
if (!VOCAB.size) {
  console.log("FAIL — STATUS_LABEL 解析出 0 個鍵，解析規則失效，不允許空跑通過。");
  process.exit(1);
}

const bundlePath = path.join(ROOT, "data/generated/knowledge_data.js");
if (!fs.existsSync(bundlePath)) { console.log("FAIL — 先跑 node scripts/build-data.js"); process.exit(1); }
globalThis.window = globalThis;
require(bundlePath);
const K = globalThis.ACUTING_KNOWLEDGE || {};

// statusPill 會被叫到的那些記錄集合。新增知識線時要記得加進來——
// 漏一條就等於那條線不受這個 gate 保護。
const SETS = [
  "herbs", "formulas", "conditionCanon", "conditions", "patternLibrary", "patternRegistry",
  "symptoms", "comparisons", "tdisRegistry", "supplementRecords", "pharmDrugs", "medications",
];
let scanned = 0;
const offenders = new Map();   // value -> [{set, id}]
for (const name of SETS) {
  const d = K[name];
  const recs = (d && (d.records || d.pairs)) || [];
  for (const r of recs) {
    scanned++;
    const v = r.review_status;
    if (v === undefined || v === null || v === "") continue;   // statusPill 會 fallback 成 draft
    if (VOCAB.has(String(v))) continue;
    if (!offenders.has(String(v))) offenders.set(String(v), []);
    offenders.get(String(v)).push(name + ":" + r.id);
  }
}
if (!scanned) { console.log("FAIL — 一筆記錄都沒掃到，bundle 或集合名稱不對，不允許空跑通過。"); process.exit(1); }

console.log("validate-review-status-vocabulary — 狀態標籤會不會印出生 enum");
console.log("  受控詞彙(取自 js/knowledge.js STATUS_LABEL): " + [...VOCAB].join(" / "));
console.log("  掃描 " + SETS.length + " 個記錄集合，共 " + scanned + " 筆");
if (!offenders.size) {
  console.log("\nPASS — 沒有詞彙外的 review_status。");
  process.exit(0);
}
let total = 0;
console.log("");
for (const [v, ids] of offenders) {
  total += ids.length;
  console.log("  ✗ \"" + v + "\" — " + ids.length + " 筆   例:" + ids.slice(0, 3).join(", ") + (ids.length > 3 ? " …" : ""));
}
console.log("\nFAIL — " + total + " 筆的 review_status 不在受控詞彙內，卡片右上會直接印出這個字串。");
console.log("  兩種病因處置不同,先判斷是哪一種:");
console.log("    · 這是本專案刻意的狀態(例如 skeleton) → 去 js/knowledge.js 的 STATUS_LABEL 補中英標籤");
console.log("    · 這是填錯的值(例如把 source_type 填進來) → 改資料，並把舊值保存在 review_status_note_zh");
process.exit(1);
