#!/usr/bin/env node
/**
 * validate-metric-interpretation.js — 讓「沒有來源」是個結論,不是留白
 *
 * 為什麼需要這支:
 * outcome_metrics.json 有 27 筆,其中多數 `source` 是空的。空白同時代表兩件
 * 完全不同的事 —— 「還沒查」與「文獻上本來就沒有」。混在一起的後果不是資料
 * 不整齊,而是**下一個人看到空白會順手填一個看起來合理的閾值進去**,那就是
 * 憲法紅線 4(臨床數字必須具名來源)。
 *
 * 所以 interpretation_status 是三態,缺一不可:
 *   sourced                  已具名來源,source 必須帶 {name,url}
 *   no_published_threshold   自訂單題量表,文獻上不存在 MCID —— 這是結論,
 *                            不是待辦。看到它就不要再去「補」一個數字。
 *   source_pending           確實有文獻只是還沒查 —— 這一種才是待辦(SOL)。
 *
 * 兩層要求,因為它們會分別退化:
 *   1. P1 傳輸子集的六個 metric:blocking。它們直接進病人填答與病歷,
 *      判讀方式錯了會影響臨床解讀。
 *   2. 其餘:ratchet。目前 21 筆未標註是已知欠帳(排給 Sonnet),
 *      數字只准往下 —— 補完把 KNOWN_UNLABELLED 調成 0,它就變成純 blocking。
 *
 * 用法:node scripts/validate-metric-interpretation.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/clinical_cases/outcome_metrics.json");
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
const records = data.records || [];

// 病人頁只問這六項;它們是唯一會經由 P1 進入病歷的 metric。
const P1_TRANSPORT = [
  "metric.pain_score", "metric.sleep_hours", "metric.stress_level",
  "metric.mood", "metric.energy_level", "metric.pgic"
];
const VALID_STATUS = ["sourced", "no_published_threshold", "source_pending"];

// 凍結基線:2026-08-12 實測的未標註筆數(排給 Sonnet 補)。只准往下。
const KNOWN_UNLABELLED = 0;

// 一個數字後面接著計量單位 = 有人在宣告閾值。涵蓋 registry 實際用到的單位
// (0-10 分、mm、分鐘、小時、天、次、度),中英各一套寫法。
// 例外:「0-10」「0–10」這種量表範圍本身不是閾值,所以要求數字前面不是連字號。
const ASCII_UNITS = "points?|pts?|mm|cm|minutes?|mins?|hours?|hrs?|days?|nights?|times?|degrees?";
const CJK_UNITS = "分鐘|小時|公厘|公分|分|天|日|次|度"; // 長的排前面,否則「分鐘」會先被「分」吃掉
const THRESHOLD_RE = new RegExp(
  "(?<![-–—\\d])\\d+(?:\\.\\d+)?\\s*(?:(?:" + ASCII_UNITS + ")(?![a-z])|%|°|" + CJK_UNITS + ")",
  "i"
);

// THRESHOLD_RE 的兩面都會靜默退化,所以兩面都測,每次執行都跑:
//   太鬆 → 發明的閾值穿過去(第一版只認 point/%/分,mm 與分鐘整句穿過)
//   太嚴 → 誤擋「0-10 量表」「2012 年」這種正常敘述,於是有人把整條規則拿掉
// 這一段刻意不吃檔案、不看 exit code —— 上一版的對照因為 validator 自己
// crash(regex 語法錯)也 exit 1,結果「全部擋住」是假的。這裡直接斷言 regex。
{
  const mustFlag = [
    "A lining of 8 mm or more is considered adequate.",
    "A reduction of 15 minutes is meaningful.",
    "縮短 15 分鐘以上算臨床改善。",
    "More than 7 days is considered prolonged.",
    "夜醒減少 2 次即為改善。",
    "A gain of 10 degrees is meaningful.",
    "A 30% change is meaningful.",
    "腹脹下降 3 分即有臨床意義。",
    "A decrease of about 2 points is clinically meaningful.",
  ];
  const mustPass = [
    "Ad-hoc single-item 0-10 rating used by this clinic.",
    "本診所自訂的 0–10 單題量表,只看跨診次趨勢。",
    "待 SOL 依 2012 年的共識文件補來源。",
    "No published threshold; read as a within-patient trend.",
    "Self-reported hours of sleep per night (not a validated instrument).",
  ];
  const selfTestFailures = [];
  for (const s of mustFlag) if (!THRESHOLD_RE.test(s)) selfTestFailures.push(`該擋沒擋:「${s}」`);
  for (const s of mustPass) if (THRESHOLD_RE.test(s)) selfTestFailures.push(`誤擋:「${s}」`);
  if (selfTestFailures.length) {
    console.error("FAIL — THRESHOLD_RE self-test 沒過,本檢查目前不可信:");
    selfTestFailures.forEach((f) => console.error(`  ✗ ${f}`));
    process.exit(1);
  }
}

const errors = [];
const unlabelled = [];

for (const r of records) {
  const id = r.id || "(no id)";
  const status = r.interpretation_status;
  const isP1 = P1_TRANSPORT.includes(id);

  if (!status) {
    unlabelled.push(id);
    if (isP1) errors.push(`${id}: P1 傳輸子集的 metric 必須標 interpretation_status(三態之一)`);
    continue;
  }
  if (!VALID_STATUS.includes(status)) {
    errors.push(`${id}: interpretation_status "${status}" 不在 ${VALID_STATUS.join(" / ")}`);
    continue;
  }
  // sourced 必須真的有來源 —— 否則「已具名」就是空話
  if (status === "sourced") {
    const s = r.source;
    if (!s || typeof s !== "object" || !String(s.name || "").trim()) {
      errors.push(`${id}: 標為 sourced 但 source.name 空白 —— 具名來源不能是空的`);
    }
    if (!String(r.interpretation_en || "").trim()) {
      errors.push(`${id}: 標為 sourced 但 interpretation_en 空白`);
    }
  }
  // no_published_threshold 不准同時帶來源,否則兩個欄位互相矛盾
  if (status === "no_published_threshold" && r.source) {
    errors.push(`${id}: 標為 no_published_threshold 卻帶了 source —— 兩者矛盾,請改成 sourced 或移除 source`);
  }
  // 這一條是本檔存在的理由:不准在「沒有來源」的記錄裡寫數字閾值。
  //
  // 單位清單要跟著 registry 走,不能只寫 point/%/分 —— 第一版就是那樣,
  // 而負面對照當場證明「內膜 8 mm 以上算足夠」可以整句穿過去。這個 registry
  // 裡有一半的指標是 mm、分鐘、天數、次數,發明的閾值會用它們自己的單位寫。
  if (status !== "sourced") {
    for (const field of ["interpretation_en", "interpretation_note_zh"]) {
      const text = String(r[field] || "");
      const hit = text.match(THRESHOLD_RE);
      if (hit) {
        errors.push(`${id}: 沒有具名來源卻在 ${field} 寫了數字閾值「${hit[0].trim()}」—— 這正是本檢查要擋的事`);
      }
    }
  }
}

console.log(`validate-metric-interpretation: ${records.length} metrics`);
const byStatus = {};
for (const r of records) byStatus[r.interpretation_status || "(未標註)"] = (byStatus[r.interpretation_status || "(未標註)"] || 0) + 1;
for (const [k, v] of Object.entries(byStatus)) console.log(`  ${k.padEnd(24)} ${v}`);

if (unlabelled.length > KNOWN_UNLABELLED) {
  errors.push(`未標註 interpretation_status 的 metric 有 ${unlabelled.length} 筆,基線是 ${KNOWN_UNLABELLED} —— 只准往下`);
} else if (unlabelled.length > 0) {
  console.log(`\n  WARN — ${unlabelled.length} 筆尚未標註(基線 ${KNOWN_UNLABELLED},排給 Sonnet 補完):`);
  console.log("    " + unlabelled.slice(0, 8).join(", ") + (unlabelled.length > 8 ? " …" : ""));
  if (unlabelled.length < KNOWN_UNLABELLED) {
    console.log(`    補完後請把 KNOWN_UNLABELLED 調成 ${unlabelled.length}(歸零時本檢查自動變成純 blocking)。`);
  }
}

if (errors.length) {
  console.error(`\nFAIL — ${errors.length} 個問題:`);
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  process.exit(1);
}
console.log("\nPASS — 三態契約成立,沒有無來源的數字閾值。");
