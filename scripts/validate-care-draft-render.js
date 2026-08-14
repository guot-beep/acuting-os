#!/usr/bin/env node
/**
 * validate-care-draft-render.js — 「產生草稿」按鈕有沒有真的接得上
 *
 * 這個功能有兩層,各自可能悄悄斷掉,而且都不會被既有的檢查抓到:
 *   1. js/care-draft.js 的計算本體 —— scripts/generate-care-draft.js 的
 *      --self-test 已經守著,這支不重複驗證那一層。
 *   2. **UI 接線** —— 按鈕存不存在、`data-care-draft` 屬性帶不帶正確的
 *      case id、點擊會不會真的呼叫 downloadCareDraft、下載時組出來的
 *      labelIdx/metricDefs 形狀對不對。這一層沒有東西守,任何一次重構
 *      (改按鈕的 data 屬性名、拿掉監聽器、改 downloadCareDraft 的呼叫方式)
 *      都會讓按鈕變成「畫得出來、按了沒反應」—— 跟診務回顧知識缺口那次
 *      發現的問題是同一種退化。
 *
 * 作法:從 app.js 抽出 computeCareReadiness / renderCareReadinessPanel /
 * downloadCareDraft,在 sandbox 裡跑,斷言:
 *   - 面板存在時按鈕存在,且 data-care-draft 是正確的 case id
 *   - 呼叫 downloadCareDraft 真的觸發下載(不是靜默失敗)
 *   - 下載內容是這個 case 產生的草稿(不是空的、不是別的 case 的)
 *   - patientCode 沒有跑出標頭註解之外
 *   - js/care-draft.js 沒載入時,按鈕點了會提示而不是靜默失敗
 *
 * 用法:node scripts/validate-care-draft-render.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const CareDraft = require(path.join(ROOT, "js", "care-draft.js"));

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

function grabAttr(html, name) {
  const m = html.match(new RegExp(`data-${name}="([^"]*)"`));
  return m ? m[1] : null;
}

const CASE = {
  id: "case.fixture", caseTitle: "測試病例", patientCode: "TEST-CODE-DO-NOT-LEAK",
  sex: "女", birthYearMonth: "1984-03", occupation: "測試",
  chiefComplaint: "測試主訴", publicationConsent: "granted",
  soapNotes: [
    { id: "n1", visitDate: "2026-05-01", visitNumber: 1, objective: "測試", acupointLinks: ["LI4"],
      tcmPatternSelections: [{ patternId: "pattern.liver_qi_stagnation", isPrimary: true }],
      outcomeMetrics: [{ metricId: "metric.pain_score", valueNumber: 7 }], outcomeVerdict: "improved" },
  ],
};

const failures = [];
const sandbox = {
  console,
  globalThis: null,
  ACUTING_KNOWLEDGE: { outcomeMetrics: { records: [] }, patternLibrary: { records: [{ id: "pattern.liver_qi_stagnation", name_zh: "肝氣鬱結" }] } },
  ACUTING_POINTS_361: [],
  AcuTingCareDraft: CareDraft,
  contentMode: "bilingual",
  localDateISO: () => "2026-08-13",
  escapeHtml: (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
  escapeAttribute: (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
  alert: (msg) => { sandbox.__alerts.push(msg); },
  __alerts: [],
  __blobs: [],
  Blob: class { constructor(parts, opts) { this.text = parts.join(""); this.type = opts && opts.type; sandbox.__blobs.push(this); } },
  URL: { createObjectURL: (b) => "blob:" + (sandbox.__blobs.indexOf(b)), revokeObjectURL: () => {} },
  document: {
    createElement: (tag) => {
      const el = { tag, clicked: false, click() { this.clicked = true; } };
      return el;
    },
  },
};
sandbox.globalThis = sandbox;

let html = "", threw = null;
try {
  vm.createContext(sandbox);
  vm.runInContext([grabFunction("computeCareReadiness"), grabFunction("downloadCareDraft"), grabFunction("renderCareReadinessPanel")].join("\n"), sandbox);
  html = sandbox.renderCareReadinessPanel(CASE, CASE.soapNotes);
} catch (err) {
  console.error("FAIL — 無法從 app.js 抽出並執行 CARE readiness 函式:");
  console.error("  " + err.message);
  process.exit(1);
}

const checks = [
  ["面板有畫出來(readiness.max > 0)", () => html.length > 0],
  ["按鈕存在", () => html.includes("data-care-draft")],
  ["按鈕的 case id 正確", () => grabAttr(html, "care-draft") === CASE.id],
];

for (const [name, fn] of checks) {
  let ok = false;
  try { ok = fn(); } catch (e) { ok = false; }
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${name}`);
  if (!ok) failures.push(name);
}

// 真的呼叫 downloadCareDraft,確認整條路(建 labelIdx/metricDefs → 呼叫
// generateDraft → 包 Blob → 觸發下載)接得上,不是只有 HTML 長得對。
sandbox.__alerts.length = 0;
sandbox.__blobs.length = 0;
let downloadThrew = null;
try { sandbox.downloadCareDraft(CASE); } catch (e) { downloadThrew = String(e); }

const downloadChecks = [
  ["downloadCareDraft 沒有拋錯", () => !downloadThrew],
  ["真的產生了一個 Blob(下載被觸發)", () => sandbox.__blobs.length === 1],
  ["Blob 類型是 markdown", () => sandbox.__blobs[0] && sandbox.__blobs[0].type === "text/markdown"],
  ["草稿內容包含這個 case 的主訴(不是空的、不是別的 case)", () => sandbox.__blobs[0] && sandbox.__blobs[0].text.includes("測試主訴")],
  ["patientCode 只出現在第一行(標頭註解)", () => {
    const text = sandbox.__blobs[0] ? sandbox.__blobs[0].text : "";
    const lines = text.split("\n");
    return lines[0].includes(CASE.patientCode) && !lines.slice(1).join("\n").includes(CASE.patientCode);
  }],
  ["沒有觸發 alert(表示沒有走到『模組未載入』的失敗分支)", () => sandbox.__alerts.length === 0],
];
for (const [name, fn] of downloadChecks) {
  let ok = false;
  try { ok = fn(); } catch (e) { ok = false; }
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${name}`);
  if (!ok) failures.push(name);
}

// 負面情境:js/care-draft.js 沒載入時,按鈕點了要提示,不能靜默失敗。
sandbox.AcuTingCareDraft = undefined;
sandbox.__alerts.length = 0;
sandbox.__blobs.length = 0;
let noModuleThrew = null;
try { sandbox.downloadCareDraft(CASE); } catch (e) { noModuleThrew = String(e); }
const noModuleOk = !noModuleThrew && sandbox.__alerts.length === 1 && sandbox.__blobs.length === 0;
console.log(`  ${noModuleOk ? "PASS" : "FAIL"} — 模組未載入時提示而非靜默失敗(不拋錯、有 alert、沒有下載)`);
if (!noModuleOk) failures.push("模組未載入時的失敗路徑不對");

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} 項:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`\nPASS — 產生草稿按鈕接得上,患者代碼沒有洩漏到正文。`);
