#!/usr/bin/env node
/**
 * validate-outcome-panel-render.js — 契約有沒有真的到畫面上
 *
 * outcome_metrics.json 的 interpretation_status 三態,只有畫在讀數字的地方
 * 才有意義。Outcome Tracking 表格如果只顯示「-3」,看的人無從分辨那是
 * 「文獻上有意義的變化」還是「一個沒有任何閾值可以對照的自評分數」。
 *
 * 這支存在的理由是本專案反覆出現的退化型態:資料改對了、validator 全綠,
 * 但 renderer 悄悄不再顯示那個欄位,或反過來顯示了資料沒說的話。那類問題
 * 檢查 JSON 抓不到 —— 只有把 render 函式真的跑一次、看輸出的 HTML 才抓得到。
 *
 * 作法:從 app.js 抽出真正在跑的那幾個函式(不是複製一份邏輯來測),
 * 在 sandbox 裡餵三態各一筆,斷言輸出。抽取失敗就 FAIL,不允許空跑通過。
 *
 * 用法:node scripts/validate-outcome-panel-render.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

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

function grabConstBlock(name) {
  const start = app.indexOf(`const ${name} =`);
  if (start < 0) throw new Error(`app.js 裡找不到 const ${name}`);
  const end = app.indexOf("};", start);
  if (end < 0) throw new Error(`const ${name} 沒有結尾`);
  return app.slice(start, end + 2);
}

// 用固定的測試資料,不讀真的 outcome_metrics.json —— 這支測的是 renderer 的
// 行為,不是資料內容。資料內容由 validate-metric-interpretation.js 負責。
const FIXTURE = [
  {
    id: "metric.fixture_sourced", label_zh: "有來源", direction_good: "decrease",
    interpretation_status: "sourced",
    interpretation_en: "A decrease of about 2 points is commonly cited as clinically meaningful.",
    source: { name: "Farrar JT, Young JP Jr. Clinical importance of changes. Pain. 2001;94(2):149-158.", url: "https://example.invalid/" },
    // 刻意也帶一個 reference_range,確認「sourced 不畫參考範圍 badge」的
    // 判斷是真的在檢查 status,不是因為這筆資料根本沒有 reference_range 可畫。
    reference_range: { text_zh: "無關數字。", scope: "不該被畫出來。", source: { name: "Should Not Render." } },
  },
  {
    id: "metric.fixture_none", label_zh: "無閾值", direction_good: "increase",
    interpretation_status: "no_published_threshold",
    interpretation_en: "Ad-hoc single-item 0-10 rating used by this clinic.",
    interpretation_note_zh: "本診所自訂的量表,不要為它發明一個數字。",
  },
  {
    id: "metric.fixture_pending", label_zh: "待補", direction_good: "individualized",
    interpretation_status: "source_pending",
    interpretation_note_zh: "待 SOL 補來源。",
  },
  { id: "metric.fixture_unlabelled", label_zh: "未標註", direction_good: "decrease" },
  {
    // D20 第二軸:沒有改善閾值,但有具名的正常範圍(帶 scope 圍欄)。
    id: "metric.fixture_refrange", label_zh: "有範圍無閾值", direction_good: "individualized",
    interpretation_status: "no_published_threshold",
    interpretation_note_zh: "無公認閾值。",
    reference_range: {
      text_zh: "FIGO 正常範圍 24–38 天。",
      scope: "生殖年齡、非妊娠。是分類界線,不是改善幅度。",
      source: { name: "Munro MG, et al. Int J Gynaecol Obstet. 2018;143(3):393-408.", url: "https://example.invalid/" },
    },
  },
  {
    // 邊界情況:reference_range 存在但沒有 scope —— 不該通過
    // validate-metric-interpretation.js,但 renderer 自己也不能假設上游一定
    // 乾淨。沒有 scope 的參考範圍不該畫出來。
    id: "metric.fixture_refrange_no_scope", label_zh: "範圍缺 scope", direction_good: "individualized",
    interpretation_status: "no_published_threshold",
    interpretation_note_zh: "無公認閾值。",
    reference_range: { text_zh: "某個數字。", source: { name: "Some Source." } },
  },
];

const sandbox = {
  console,
  globalThis: null,
  ACUTING_KNOWLEDGE: { outcomeMetrics: { records: FIXTURE } },
  escapeHtml: (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
  formatMetricNumberDisplay: (cfg, v) => String(v),
  outcomeMetricPanelLabel: (id) => id,
  computeOutcomeTrackingRows: (item) => item.rows,
};
sandbox.globalThis = sandbox;

const failures = [];
let html = "";
try {
  vm.createContext(sandbox);
  vm.runInContext([
    grabConstBlock("OUTCOME_DIRECTION_HINT_LABELS"),
    grabConstBlock("OUTCOME_INTERPRETATION_BADGES"),
    grabFunction("shortCitation"),
    grabFunction("getOutcomeMetricDef"),
    grabFunction("renderOutcomeTrackingPanel"),
  ].join("\n"), sandbox);
  html = sandbox.renderOutcomeTrackingPanel({
    rows: FIXTURE.map((r) => ({ cfg: { metricId: r.id }, baseline: 7, today: 4, change: -3, trend: "7→5→4" })),
  });
} catch (err) {
  console.error("FAIL — 無法從 app.js 抽出並執行 render 函式:");
  console.error("  " + err.message);
  process.exit(1);
}

const cellOf = (id) => (html.split("<tr>").find((s) => s.includes(id)) || "");
const hintOf = (id) => (cellOf(id).match(/<small class="interp-hint[^>]*>([^<]*)</) || [])[1] || "";
// 專找 refrange 那個 badge —— 一列可能同時有 interpHint 與 refRangeHint 兩個
// interp-hint span,hintOf 只抓得到第一個,所以另外用 class 精確比對。
const refRangeHintOf = (id) => (cellOf(id).match(/<small class="interp-hint interp-refrange"[^>]*>([^<]*)</) || [])[1] || "";

const checks = [
  ["sourced 要顯示可查證的短引用", () => /Farrar JT 2001/.test(hintOf("metric.fixture_sourced"))],
  ["no_published_threshold 要明說沒有閾值", () => /無公認閾值/.test(hintOf("metric.fixture_none"))],
  ["source_pending 要明說來源待補", () => /待補/.test(hintOf("metric.fixture_pending"))],
  ["未標註的不畫 badge(空白好過假結論)", () => hintOf("metric.fixture_unlabelled") === ""],
  ["未標註的仍要出現在表格裡(不能被整列吃掉)", () => cellOf("metric.fixture_unlabelled") !== ""],
  ["方向提示沒有被 badge 擠掉", () => /direction-hint/.test(cellOf("metric.fixture_sourced"))],
  ["有 scope 的參考範圍會顯示可查證的短引用", () => /Munro MG 2018/.test(refRangeHintOf("metric.fixture_refrange"))],
  ["參考範圍不會蓋掉原本的無閾值 badge(兩個都要在)", () => /無公認閾值/.test(hintOf("metric.fixture_refrange"))],
  ["沒有 scope 的參考範圍不畫 badge(缺圍欄寧可不顯示)", () => refRangeHintOf("metric.fixture_refrange_no_scope") === ""],
  ["sourced 的列不會多畫一個參考範圍 badge(避免同一格兩套判讀依據)", () => refRangeHintOf("metric.fixture_sourced") === ""],
];
for (const [name, fn] of checks) {
  let ok = false;
  try { ok = fn(); } catch (e) { ok = false; }
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${name}`);
  if (!ok) failures.push(name);
}

// 最重要的一條:沒有具名來源的 metric,可見文字裡不准出現數字閾值。
// 只看可見文字,title 屬性(hover 全文)不算。
const visible = html.replace(/title="[^"]*"/g, "").replace(/<[^>]+>/g, " ");
const noneCell = cellOf("metric.fixture_none").replace(/title="[^"]*"/g, "").replace(/<[^>]+>/g, " ");
const pendingCell = cellOf("metric.fixture_pending").replace(/title="[^"]*"/g, "").replace(/<[^>]+>/g, " ");
for (const [label, text] of [["no_published_threshold", noneCell], ["source_pending", pendingCell]]) {
  const hit = text.match(/\d+(\.\d+)?\s*(points?|%|分)/i);
  const ok = !hit;
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${label} 的可見文字沒有數字閾值${ok ? "" : `(出現「${hit[0]}」)`}`);
  if (!ok) failures.push(`${label} 顯示了數字閾值`);
}

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} 項:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`\nPASS — 三態都畫到了 Outcome Tracking 上,未標註的維持空白。`);
