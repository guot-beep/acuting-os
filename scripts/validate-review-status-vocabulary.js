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

/* 2026-09-06:改讀 index.html 真正載入的六片 shard(knowledge_core/ref/rx/mm/dx/pat.js),
   不讀 knowledge_data.js —— 那一片沒有被 index.html 載入,驗它等於驗一份畫面用不到的複本;
   兩份分岔時(build-data 只更新其中一份)閘門看的會是錯的那份。 */
for (const f of ["core", "ref", "rx", "mm", "dx", "pat"]) {
  const p = path.join(ROOT, "data/generated/knowledge_" + f + ".js");
  if (!fs.existsSync(p)) { console.log("FAIL — 先跑 node scripts/build-data.js(缺 " + f + " 分片)"); process.exit(1); }
  globalThis.window = globalThis;
  require(p);
}
const K = globalThis.ACUTING_KNOWLEDGE || {};

// statusPill 會被叫到的那些記錄集合。新增知識線時要記得加進來——
// 漏一條就等於那條線不受這個 gate 保護。
const SETS = [
  "herbs", "formulas", "conditionCanon", "conditions", "patternLibrary", "patternRegistry",
  "symptoms", "comparisons", "tdisRegistry", "supplementRecords", "pharmDrugs", "medications",
];
/* 渲染端對這三個集合是 `review_status || status`(js/knowledge.js 的證型卡 L3351/L3501、
   鑑別表 L2906);驗證器要跟渲染器同一把尺,不然 status:"owner_filled" 而沒有 review_status 的記錄,
   卡上印生字串、這裡卻看不到(覆核員負控實測放行)。用 || 不用 ??,因為渲染器是 ||:
   review_status 為空字串時渲染器會退到 status,?? 不會。 */
const STATUS_FALLBACK_SETS = new Set(["patternLibrary", "patternRegistry", "comparisons"]);
let scanned = 0;
const offenders = new Map();   // value -> [{set, id}]
const missingSets = [];
for (const name of SETS) {
  const d = K[name];
  const recs = d && (d.records || d.pairs);
  /* 2026-09-06:原本 `|| []` —— 集合從 bundle 消失時掃 0 筆、沒有違規、閘門全綠
     (覆核員負控:delete K.tdisRegistry → PASS)。集合不在 = 那條線不受保護,要 FAIL 並印集合名。 */
  if (!d || !Array.isArray(recs) || !recs.length) { missingSets.push(name + (d ? "(存在但沒有 records/pairs 或為空)" : "(bundle 裡沒有這個集合)")); continue; }
  for (const r of recs) {
    scanned++;
    const v = STATUS_FALLBACK_SETS.has(name) ? (r.review_status || r.status) : r.review_status;
    if (v === undefined || v === null || v === "") continue;   // statusPill 會 fallback 成 draft
    if (VOCAB.has(String(v))) continue;
    if (!offenders.has(String(v))) offenders.set(String(v), []);
    offenders.get(String(v)).push(name + ":" + r.id);
  }
}
if (missingSets.length) {
  console.log("validate-review-status-vocabulary — 狀態標籤會不會印出生 enum");
  console.log("  掃描 " + SETS.length + " 個記錄集合，共 " + scanned + " 筆");
  missingSets.forEach((s) => console.log("  ✗ 集合不在 bundle:" + s));
  console.log("\nFAIL — " + missingSets.length + " 個集合在六片 shard 裡讀不到。那條線就不受這個 gate 保護;");
  console.log("  集合改名就把 SETS 跟著改,build-data 掉了集合就去修 build,不要在這裡放行。");
  process.exit(1);
}
if (!scanned) { console.log("FAIL — 一筆記錄都沒掃到，bundle 或集合名稱不對，不允許空跑通過。"); process.exit(1); }

console.log("validate-review-status-vocabulary — 狀態標籤會不會印出生 enum");
console.log("  受控詞彙(取自 js/knowledge.js STATUS_LABEL): " + [...VOCAB].join(" / "));
console.log("  掃描 " + SETS.length + " 個記錄集合(六片 shard)，共 " + scanned + " 筆;"
  + [...STATUS_FALLBACK_SETS].join("/") + " 讀 review_status || status(與渲染器同一把尺)");
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
