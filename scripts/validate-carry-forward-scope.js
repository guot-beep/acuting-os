#!/usr/bin/env node
/**
 * validate-carry-forward-scope.js — 「沿用上次治療」只准帶處置,不准帶所見;
 * 方藥/西藥另有獨立的 opt-in 確認流程,不准混進一鍵按鈕的白名單
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
 * 2026-08-25 加了第二條線:方藥(方劑/中藥)跟穴位不是同一種風險 —— 穴位帶
 * 錯了當場可調整,方藥帶錯了是把上次的處方原封不動搬進一個可能已經改變的
 * 用藥/妊娠/安全狀態。所以方藥必須留在 CARRY_FORWARD_HERB_FIELDS(獨立按鈕
 * + 預設不勾選的安全確認句),絕不能出現在 CARRY_FORWARD_FIELDS(一鍵、無
 * 確認)裡。這支也守著這條線,而且順便把 medicationLinks/westernMeds(西藥,
 * 目前沒有 UI 用到)也一併鎖進「需要 opt-in」的分類,免得日後有人直接加進
 * 一鍵白名單就繞過了安全確認。
 *
 * 作法:從 app.js 抽出 CARRY_FORWARD_FIELDS、CARRY_FORWARD_HERB_FIELDS、
 * carryForwardFields/carryForwardTreatment/carryForwardHerbs 的原始碼,斷言:
 *   1. 三個函式與兩個白名單都抽得到(抽不到直接 FAIL —— 改名/移除必須讓這支
 *      壞掉,不能默默空跑)
 *   2. 兩個白名單各自非空,且每一項都在自己允許的欄位集合內
 *   3. 禁令清單裡的欄位一個都不在任一白名單裡
 *   4. 方藥類欄位(formulaLinks/herbLinks/formulaHerbs/medicationLinks/
 *      westernMeds)一個都不在 CARRY_FORWARD_FIELDS(一鍵白名單)裡 ——
 *      這條是方藥 opt-in 改造新加的線,擋的正是「順手把方藥加回一鍵按鈕」
 *   5. carryForwardFields(實際碰 prev[key] 的共用核心)本體沒有直接寫死
 *      任何禁令欄位(擋掉「不走白名單、直接 soapForm.elements.outcomes.value
 *      = ...」這種繞過)
 *   6. 覆寫防線還在:carryForwardFields 本體看得到 skipped 分支、回傳
 *      { filled, skipped }
 *   7. UI 層的方藥安全閘門還在:app.js 裡看得到方藥按鈕預設 disabled、
 *      看得到確認 checkbox 的 change handler 控制它的 disabled 狀態、
 *      看得到 click handler 對 checked 狀態的 defense-in-depth 二次檢查
 *
 * 用法:node scripts/validate-carry-forward-scope.js [app.js 的路徑]
 *   路徑參數只為了「反空跑證明」—— 餵一份刻意加了禁令欄位/繞過安全閘門的
 *   副本,確認這支真的會 FAIL。沒有這個能力,綠燈只證明它跑完了,不證明它
 *   擋得住。
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const TARGET = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, "app.js");
const app = fs.readFileSync(TARGET, "utf8");

/* 一鍵白名單(穴位/處置)允許的欄位 = 「今天要做的處置」,且刻意不含任何
 * 方藥/西藥欄位。新增項目要先問一句:這是我打算做的事,還是我觀察/判斷到
 * 的事?後者一律不准進來;是方藥/西藥則要進 HERB_ALLOWED,不能進這裡。 */
const BULK_ALLOWED = new Set([
  "acupointLinks", "pointsUsed",       // 用穴
  "retentionMinutes", "technique",     // 留針/手法
  "modalities", "modalitiesPerformed", // 處置
]);

/* opt-in 白名單(方藥/西藥)允許的欄位。UI 層必須要求先勾選安全確認句
 * 才能呼叫到這裡 —— 這支只檢查「欄位分類對不對」,不負責檢查確認流程本身
 * 是否被繞過(那是第 7 步的工作)。 */
const HERB_ALLOWED = new Set([
  "formulaLinks", "herbLinks", "formulaHerbs",   // 方劑/中藥
  "medicationLinks", "westernMeds",              // 西藥(目前無 UI 入口,先鎖分類)
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
function extractList(constName) {
  const re = new RegExp(`const ${constName} = (\\[[\\s\\S]*?\\n\\]);`);
  const m = app.match(re);
  if (!m) return null;
  try { return vm.runInNewContext(m[1]); } catch { return null; }
}

const FIELDS = extractList("CARRY_FORWARD_FIELDS");
const HERB_FIELDS = extractList("CARRY_FORWARD_HERB_FIELDS");

if (!FIELDS) {
  console.error("FAIL — app.js 裡找不到 CARRY_FORWARD_FIELDS(或無法求值)。");
  console.error("       它被改名或移除了。這支驗證器守的是『沿用只帶處置』這條線,");
  console.error("       請更新這裡的抽取方式,不要刪掉這支測試。");
  process.exit(1);
}
if (!HERB_FIELDS) {
  console.error("FAIL — app.js 裡找不到 CARRY_FORWARD_HERB_FIELDS(或無法求值)。");
  console.error("       方藥的 opt-in 白名單被改名或移除了 —— 這是 2026-08-25");
  console.error("       方藥安全改造加的線,不要刪掉這支測試。");
  process.exit(1);
}
assert(Array.isArray(FIELDS) && FIELDS.length > 0, `抽到一鍵白名單,共 ${FIELDS.length} 項`);
assert(Array.isArray(HERB_FIELDS) && HERB_FIELDS.length > 0, `抽到方藥 opt-in 白名單,共 ${HERB_FIELDS.length} 項`);

function extractFnBody(fnName) {
  const fnStart = app.indexOf(`function ${fnName}(`);
  if (fnStart < 0) return "";
  let depth = 0;
  for (let j = app.indexOf("{", fnStart); j < app.length; j++) {
    if (app[j] === "{") depth++;
    else if (app[j] === "}") { depth--; if (depth === 0) return app.slice(fnStart, j + 1); }
  }
  return "";
}

const coreBody = extractFnBody("carryForwardFields");
const treatmentBody = extractFnBody("carryForwardTreatment");
const herbBody = extractFnBody("carryForwardHerbs");
assert(coreBody.length > 0, "抽到 carryForwardFields 函式本體(實際碰 prev[key] 的共用核心)");
assert(treatmentBody.length > 0, "抽到 carryForwardTreatment 函式本體");
assert(herbBody.length > 0, "抽到 carryForwardHerbs 函式本體");

// ---- 2. 兩個白名單各自的欄位都必須落在自己允許的集合內 ---------------------
const bulkKeys = FIELDS.map((f) => f && f.key).filter(Boolean);
const herbKeys = HERB_FIELDS.map((f) => f && f.key).filter(Boolean);
assert(bulkKeys.length === FIELDS.length, "一鍵白名單每一項都有 key");
assert(herbKeys.length === HERB_FIELDS.length, "方藥白名單每一項都有 key");

const bulkNotAllowed = bulkKeys.filter((k) => !BULK_ALLOWED.has(k));
assert(bulkNotAllowed.length === 0,
  bulkNotAllowed.length ? `一鍵白名單出現非處置欄位:${bulkNotAllowed.join("、")}` : "一鍵白名單全部落在處置欄位集合內");

const herbNotAllowed = herbKeys.filter((k) => !HERB_ALLOWED.has(k));
assert(herbNotAllowed.length === 0,
  herbNotAllowed.length ? `方藥白名單出現非方藥/西藥欄位:${herbNotAllowed.join("、")}` : "方藥白名單全部落在方藥/西藥欄位集合內");

// ---- 3. 禁令欄位一個都不能在任一白名單裡 -----------------------------------
const leakedBulk = bulkKeys.filter((k) => FORBIDDEN[k]);
const leakedHerb = herbKeys.filter((k) => FORBIDDEN[k]);
assert(leakedBulk.length === 0,
  leakedBulk.length ? `一鍵白名單含禁止沿用的欄位:${leakedBulk.map((k) => `${k}(${FORBIDDEN[k]})`).join("、")}` : "一鍵白名單沒有禁令欄位");
assert(leakedHerb.length === 0,
  leakedHerb.length ? `方藥白名單含禁止沿用的欄位:${leakedHerb.map((k) => `${k}(${FORBIDDEN[k]})`).join("、")}` : "方藥白名單沒有禁令欄位");

// ---- 4. 方藥/西藥欄位不准出現在一鍵白名單裡(opt-in 改造的核心防線) --------
const herbLeakedIntoBulk = bulkKeys.filter((k) => HERB_ALLOWED.has(k));
assert(herbLeakedIntoBulk.length === 0,
  herbLeakedIntoBulk.length
    ? `一鍵白名單混入方藥/西藥欄位:${herbLeakedIntoBulk.join("、")} —— 方藥必須走獨立的 opt-in 確認流程,不能一鍵無差別帶入`
    : "方藥/西藥欄位一個都不在一鍵白名單裡(opt-in 防線完整)");

// ---- 5. 函式本體不得繞過白名單直接碰禁令欄位 ------------------------------
// 擋的是 `soapForm.elements.outcomes.value = prev.outcomes` 這類旁路寫入。
// carryForwardFields 是唯一真正碰 prev[key] 的地方,是這個檢查該掃的目標。
const bypassed = Object.keys(FORBIDDEN).filter((k) =>
  new RegExp(`(elements\\.${k}\\b|elements\\["${k}"\\]|elements\\['${k}'\\]|prev\\.${k}\\b)`).test(coreBody));
assert(bypassed.length === 0,
  bypassed.length ? `carryForwardFields 本體直接碰了禁令欄位(繞過白名單):${bypassed.join("、")}` : "carryForwardFields 本體沒有繞過白名單碰任何禁令欄位");

// ---- 6. 覆寫防線還在 -------------------------------------------------------
assert(/skipped\.push/.test(coreBody), "carryForwardFields 已有內容 → 走 skipped 分支(不覆寫既有輸入)");
assert(/return \{ filled, skipped \}/.test(coreBody), "carryForwardFields 逐項回報 filled/skipped(不做沉默的批次動作)");
assert(/carryForwardFields\(prev, CARRY_FORWARD_FIELDS\)/.test(treatmentBody), "carryForwardTreatment 委派給共用核心、帶的是一鍵白名單");
assert(/carryForwardFields\(prev, CARRY_FORWARD_HERB_FIELDS\)/.test(herbBody), "carryForwardHerbs 委派給共用核心、帶的是方藥白名單");

// ---- 7. UI 層的方藥安全閘門(預設 disabled + 確認勾選才能按)---------------
assert(/id="carryForwardHerbBtn" disabled/.test(app), "方藥按鈕在標記裡預設 disabled(不是預設可按、事後才擋)");
assert(/carryForwardHerbConfirm[\s\S]{0,400}addEventListener\("change"/.test(app), "確認 checkbox 有 change handler 控制按鈕的 disabled 狀態");
assert(/carryForwardHerbBtn[\s\S]{0,600}if \(!herbConfirm\.checked\) return;/.test(app), "方藥按鈕的 click handler 對確認勾選做 defense-in-depth 二次檢查");

console.log(`\nvalidate-carry-forward-scope: ${pass} passed, ${fail} failed`);
if (fail) {
  console.error("\n沿用機制只准帶「今天要做的處置」。要帶所見或判斷,先改 FORBIDDEN 並說明理由。");
  console.error("方藥/西藥一律要走 opt-in 確認流程,不能加進一鍵白名單。");
  process.exit(1);
}
console.log("PASS —— 沿用只帶處置,所見與判斷一項都沒有被帶過來;方藥/西藥維持獨立的 opt-in 安全確認。");
