#!/usr/bin/env node
/**
 * validate-exposure-safety-render.js — 病歷裡的用藥安全提示有沒有真的到畫面上
 *
 * 59 種藥有 25 種帶 FDA 黑框警告,資料早就在 data/pharmacology/drugs.json,
 * 藥卡也畫得出來。這支管的是另一件事:**病歷的用藥列有沒有帶到**。
 * 在此之前,要看到黑框得離開病例跳到藥卡再跳回來 —— 最嚴重的那類警告
 * 反而藏在最遠的地方。
 *
 * 三條斷言,對應三種會靜默壞掉的方式:
 *   1. 黑框警告要出現,而且**不能被收在 <details> 裡**。收起來等於沒帶過來,
 *      而且這種退化不會有人回報 —— 畫面看起來還是好的。
 *   2. 「知識庫沒有這張卡」要明說。查不到卻不畫,跟「查過沒事」在畫面上
 *      長得一模一樣,讀的人會把前者讀成後者。這比不顯示更危險。
 *   3. 顯示的文字必須逐字來自卡片。渲染層不得改寫、摘要或補寫安全文字 ——
 *      這個專案有過 renderer 說出資料沒說的話的前例。
 *
 * 作法:從 app.js 抽出真正在跑的函式在 sandbox 執行,不複製一份邏輯來測。
 * 抽取失敗直接 FAIL,不允許空跑通過。
 *
 * 用法:node scripts/validate-exposure-safety-render.js
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

const BOXED_ZH = "華法林可造成重大或致命出血。所有用藥病人都須定期監測 INR。";
const CONTRA_A = "活動性出血";
const CONTRA_B = "懷孕（除機械瓣膜外）";

const KNOWLEDGE = {
  pharmDrugs: {
    records: [
      { id: "drug.fixture_boxed", name_zh: "測試藥甲", boxed_warning_zh: BOXED_ZH, contraindications_zh: [CONTRA_A, CONTRA_B] },
      { id: "drug.fixture_contra_only", name_zh: "測試藥乙", contraindications_zh: [CONTRA_A] },
      { id: "drug.fixture_clean", name_zh: "測試藥丙" },
    ],
  },
  supplementRecords: { records: [{ id: "supp.fixture", name_zh: "測試補充劑" }] },
  medications: { records: [] },
};

const sandbox = {
  console,
  globalThis: null,
  ACUTING_KNOWLEDGE: KNOWLEDGE,
  escapeHtml: (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
};
sandbox.globalThis = sandbox;

const failures = [];
let render;
try {
  vm.createContext(sandbox);
  vm.runInContext([
    grabFunction("lookupAgentSafetyCard"),
    grabFunction("safetyFieldList"),
    grabFunction("renderAgentExposureSafety"),
  ].join("\n"), sandbox);
  render = (agentId) => sandbox.renderAgentExposureSafety({ agentId, nameText: "測試" });
  render("drug.fixture_boxed");
} catch (err) {
  console.error("FAIL — 無法從 app.js 抽出並執行安全提示的 render 函式:");
  console.error("  " + err.message);
  process.exit(1);
}

// 把 <details>…</details> 整段挖掉,剩下的就是「不用點開就看得到」的部分
const visibleWithoutClicking = (html) => html.replace(/<details[\s\S]*?<\/details>/g, "");

const boxedHtml = render("drug.fixture_boxed");
const contraHtml = render("drug.fixture_contra_only");
const cleanHtml = render("drug.fixture_clean");
const unknownHtml = render("drug.does_not_exist");
const noIdHtml = render("");
const suppHtml = render("supp.fixture");

const checks = [
  ["黑框警告的文字有出現", () => boxedHtml.includes(BOXED_ZH)],
  ["黑框警告不用點開就看得到(不在 <details> 裡)", () => visibleWithoutClicking(boxedHtml).includes(BOXED_ZH)],
  ["黑框警告的文字逐字來自卡片(渲染層沒有改寫)", () => {
    const m = boxedHtml.match(/<p>([^<]*)<\/p>/);
    return !!m && m[1] === BOXED_ZH;
  }],
  ["禁忌有帶出來,且十筆不會全部攤開洗版(收在 <details>)", () =>
    boxedHtml.includes(CONTRA_A) && !visibleWithoutClicking(boxedHtml).includes(CONTRA_A)],
  ["只有禁忌沒有黑框時,不畫黑框區塊", () =>
    contraHtml.includes(CONTRA_A) && !/BOXED WARNING/.test(contraHtml)],
  ["卡片存在但沒有安全欄位 → 什麼都不畫(這是「查過了,沒有」)", () => cleanHtml === ""],
  ["查不到卡片 → 必須明說沒查過", () => /未做安全檢查/.test(unknownHtml) && /沒有這張卡/.test(unknownHtml)],
  ["沒有連結 agentId → 必須明說沒查過", () => /未做安全檢查/.test(noIdHtml)],
  ["supp.* 走補充劑區塊而不是誤報「沒有卡片」", () => suppHtml === "" ],
  ["「沒查過」與「查過沒事」的輸出不相同", () => unknownHtml !== cleanHtml && noIdHtml !== cleanHtml],
];

/* 第四種壞法,不是行為而是覆蓋率:app 有不只一個地方會列用藥。
 * 實測時病人工作區的總帳(app.js:7130)就漏了 —— 同一個臨床問題在病例頁
 * 有黑框警告、在病人頁沒有,比兩邊都沒有更糟:讀的人會把後者的沉默
 * 當成「這個病人沒有這個問題」。所以每一個用藥列都要帶。 */
{
  const lists = (app.match(/class="agent-exposure-list"/g) || []).length;
  const callSites = (app.match(/\$\{renderAgentExposureSafety\(/g) || []).length;
  const ok = lists > 0 && callSites >= lists;
  console.log(`  ${ok ? "PASS" : "FAIL"} — 每個用藥列都帶安全提示(${lists} 個列表 / ${callSites} 個呼叫點)`);
  if (!ok) failures.push(`有 ${lists} 個 .agent-exposure-list,但只有 ${callSites} 處呼叫 renderAgentExposureSafety`);
}

for (const [name, fn] of checks) {
  let ok = false;
  try { ok = fn(); } catch (e) { ok = false; }
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${name}`);
  if (!ok) failures.push(name);
}

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} 項:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`\nPASS — 黑框警告到得了病歷,且「沒查過」與「查過沒事」分得出來。`);
