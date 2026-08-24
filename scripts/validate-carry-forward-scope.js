#!/usr/bin/env node
/**
 * validate-carry-forward-scope.js — 「沿用上次治療」只准帶處置,不准帶所見
 *
 * 這個功能的價值在於複診不必重挑 7-8 個穴;它的風險在於同一個機制只要多帶
 * 一個欄位,就會把上一診的**觀察**複製成今天的紀錄。「上次寫 VAS 4,今天
 * 沒量也顯示 VAS 4」不是省時間,那是偽造病歷,而且看起來完全正常 ——
 * 沒有任何既有驗證器會發現,因為資料形狀完全合法。
 *
 * 所以白名單本身要被機器守著。日後有人想「順便也帶治則吧」「證型每次都一樣
 * 幹嘛重打」,這支會擋下來,並要求他先改這裡的禁令清單(= 一次明確的決定,
 * 而不是一次順手的 commit)。
 *
 * 作法:從 app.js 抽出 CARRY_FORWARD_FIELDS 與 carryForwardTreatment 的原始
 * 碼,斷言:
 *   1. 抽得到(抽不到直接 FAIL —— 改名/移除必須讓這支壞掉,不能默默空跑)
 *   2. 白名單非空,且每一項都在允許的處置欄位集合內
 *   3. 禁令清單裡的欄位一個都不在白名單裡
 *   4. carryForwardTreatment 的函式本體沒有直接碰任何禁令欄位
 *      (擋掉「不走白名單、直接 soapForm.elements.outcomes.value = ...」)
 *   5. 覆寫防線還在:函式本體看得到 skipped 分支
 *
 * 用法:node scripts/validate-carry-forward-scope.js [app.js 的路徑]
 *   路徑參數只為了「反空跑證明」—— 餵一份刻意加了禁令欄位的副本,確認這支
 *   真的會 FAIL。沒有這個能力,綠燈只證明它跑完了,不證明它擋得住。
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const TARGET = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, "app.js");
const app = fs.readFileSync(TARGET, "utf8");

/* 允許沿用的欄位 = 「今天要做的處置」。新增項目要先問一句:
 * 這是我打算做的事,還是我觀察/判斷到的事?後者一律不准進來。 */
const ALLOWED = new Set([
  "acupointLinks", "pointsUsed",       // 用穴
  "retentionMinutes", "technique",     // 留針/手法
  "modalities", "modalitiesPerformed", // 處置
  "formulaLinks", "herbLinks", "formulaHerbs", "medicationLinks", "westernMeds", // 方藥
]);

/* 絕不可沿用 —— 每一項都是「這一診才成立的事實或判斷」。 */
const FORBIDDEN = {
  subjective: "S:病人今天說了什麼",
  objective: "O:今天的舌脈與檢查所見",
  assessment: "A:今天的評估",
  plan: "P:今天的計畫敘述",
  outcomes: "療效:上次的療效不是今天的療效",
  outcomeVerdict: "療效判定",
  outcomeMetrics: "量化指標:沒量就不該有數字",
  tcmPattern: "證型:每一診要重新確認的判斷",
  tcmPatternSelections: "結構化證型(含 confidence,是當診的判斷)",
  treatmentPrinciple: "治則:隨證而變,預填等於代為下判斷",
  pathomechanism: "病機",
  advice: "醫囑:上次交代的不等於今天要交代的",
  followUp: "下次計畫",
  adverseEvents: "不良事件:複製過來等於憑空捏造一次事件",
  patientPerspective: "病人觀點",
  vitals: "生命徵象",
  tongueBody: "舌質", tongueCoating: "舌苔", pulse: "脈象",
  visitDate: "就診日期", visitNumber: "診次",
  lifestyleFactors: "生活型態量測",
  effectDurationDays: "效果維持天數",
  reflection: "學習反思", differentialConsidered: "鑑別考量", ifIneffectivePlan: "無效備案",
};

let pass = 0, fail = 0;
const assert = (cond, msg) => {
  if (cond) { pass++; console.log(`  PASS  ${msg}`); }
  else { fail++; console.error(`  FAIL  ${msg}`); }
};

// ---- 1. 抽取(抽不到就是硬失敗,不允許空跑)--------------------------------
const listMatch = app.match(/const CARRY_FORWARD_FIELDS = (\[[\s\S]*?\n\]);/);
if (!listMatch) {
  console.error("FAIL — app.js 裡找不到 CARRY_FORWARD_FIELDS。");
  console.error("       它被改名或移除了。這支驗證器守的是『沿用只帶處置』這條線,");
  console.error("       請更新這裡的抽取方式,不要刪掉這支測試。");
  process.exit(1);
}

let FIELDS;
try {
  FIELDS = vm.runInNewContext(listMatch[1]);
} catch (e) {
  console.error("FAIL — CARRY_FORWARD_FIELDS 抽出來但無法求值:" + e.message);
  process.exit(1);
}
assert(Array.isArray(FIELDS) && FIELDS.length > 0, `抽到白名單,共 ${FIELDS.length} 項`);

const fnStart = app.indexOf("function carryForwardTreatment(");
if (fnStart < 0) {
  console.error("FAIL — app.js 裡找不到 function carryForwardTreatment。");
  process.exit(1);
}
let body = "";
{
  let depth = 0;
  for (let j = app.indexOf("{", fnStart); j < app.length; j++) {
    if (app[j] === "{") depth++;
    else if (app[j] === "}") { depth--; if (depth === 0) { body = app.slice(fnStart, j + 1); break; } }
  }
}
assert(body.length > 0, "抽到 carryForwardTreatment 函式本體");

// ---- 2. 白名單每一項都必須是處置欄位 --------------------------------------
const keys = FIELDS.map((f) => f && f.key).filter(Boolean);
assert(keys.length === FIELDS.length, "白名單每一項都有 key");
const notAllowed = keys.filter((k) => !ALLOWED.has(k));
assert(notAllowed.length === 0,
  notAllowed.length ? `白名單出現非處置欄位:${notAllowed.join("、")} —— 先確認它是「要做的事」而非「看到的事」` : "白名單全部落在處置欄位集合內");

// ---- 3. 禁令欄位一個都不能在白名單裡 --------------------------------------
const leaked = keys.filter((k) => FORBIDDEN[k]);
assert(leaked.length === 0,
  leaked.length ? `白名單含禁止沿用的欄位:${leaked.map((k) => `${k}(${FORBIDDEN[k]})`).join("、")}` : `${Object.keys(FORBIDDEN).length} 個禁令欄位都不在白名單裡`);

// ---- 4. 函式本體不得繞過白名單直接碰禁令欄位 ------------------------------
// 擋的是 `soapForm.elements.outcomes.value = prev.outcomes` 這類旁路寫入。
const bypassed = Object.keys(FORBIDDEN).filter((k) =>
  new RegExp(`(elements\\.${k}\\b|elements\\["${k}"\\]|elements\\['${k}'\\]|prev\\.${k}\\b)`).test(body));
assert(bypassed.length === 0,
  bypassed.length ? `carryForwardTreatment 本體直接碰了禁令欄位(繞過白名單):${bypassed.join("、")}` : "函式本體沒有繞過白名單碰任何禁令欄位");

// ---- 5. 覆寫防線還在 -------------------------------------------------------
assert(/skipped\.push/.test(body), "已有內容 → 走 skipped 分支(不覆寫既有輸入)");
assert(/return \{ filled, skipped \}/.test(body), "逐項回報 filled/skipped(不做沉默的批次動作)");

console.log(`\nvalidate-carry-forward-scope: ${pass} passed, ${fail} failed`);
if (fail) {
  console.error("\n沿用機制只准帶「今天要做的處置」。要帶所見或判斷,先改 FORBIDDEN 並說明理由。");
  process.exit(1);
}
console.log("PASS —— 沿用只帶處置,所見與判斷一項都沒有被帶過來。");
