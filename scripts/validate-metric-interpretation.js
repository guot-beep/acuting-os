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
 * interpretation_status 是三態,而且它**只回答一個問題**:
 * 「變化多少算臨床有意義」有沒有具名來源。
 *   sourced                  有。source 帶 {name,url},interpretation_en 是那個來源的結論。
 *   no_published_threshold   沒有。這是結論不是待辦,看到它就不要再去補一個數字。
 *   source_pending           還沒查 —— 只有這一種是待辦。
 *
 * 第二個軸 reference_range 回答另一個問題:什麼算正常 / 診斷依據 / 證據標準。
 * 這兩件事會同時成立又互相矛盾地存在:FIGO 說月經週期 24–38 天正常(有來源),
 * 但沒有人說週期縮短幾天算治療有效(沒有閾值)。2026-08-12 SOL 查證 17 筆時
 * 建議把 13 筆標成 sourced —— 若照做,validator 就會對這些記錄放行數字,於是
 * 「內膜 ≥7 mm = 可著床」「卵泡 18 mm = 成熟」「每週 <3 次 = 便秘」這些
 * **情境限定的切點會被寫成全域規則**。所以拆成兩個軸,規則也分開:
 *   reference_range 允許數字,但**有數字就必須有 scope**(那個數字的圍欄),
 *   而且必須有自己的 source —— 參考範圍也是臨床主張。
 *
 * 三個 source 槽不可互相頂替:source(改善幅度)/ reference_range.source
 * (正常範圍)/ instrument_source(量表出處)。把量表出處放進 source,
 * 會讓一份日記標準化文件看起來像在背書一個閾值。
 *
 * 兩層要求,因為它們會分別退化:
 *   1. P1 傳輸子集的六個 metric:blocking。它們直接進病人填答與病歷。
 *   2. 其餘:ratchet(KNOWN_UNLABELLED)。目前已歸零,等於純 blocking。
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
  /* 第二個軸:reference_range(什麼算正常 / 診斷依據)。
   *
   * 它跟 interpretation_status 是不同的問題,所以規則也不同 —— 這裡**允許**數字,
   * 因為 FIGO 的 24–38 天、Rome IV 的每週 3 次都是真的有來源的。危險的不是數字
   * 本身,是數字脫離情境:「內膜 ≥7 mm」在 IVF 預後研究裡有意義,被抄成一般婦科
   * 的通則就是憑空造出一個臨床標準。2026-08-12 SOL 的四條防呆註記全部是這一類。
   *
   * 所以規則是:**有數字就必須有 scope**。scope 是那個數字的圍欄。 */
  if (r.reference_range) {
    const rr = r.reference_range;
    if (typeof rr !== "object") {
      errors.push(`${id}: reference_range 必須是物件`);
    } else {
      if (!rr.source || !String(rr.source.name || "").trim()) {
        errors.push(`${id}: reference_range 沒有具名來源 —— 參考範圍也是臨床主張,不能無出處`);
      }
      const rrText = `${rr.text_en || ""} ${rr.text_zh || ""}`;
      if (THRESHOLD_RE.test(rrText) && !String(rr.scope || "").trim()) {
        errors.push(`${id}: reference_range 有數字「${(rrText.match(THRESHOLD_RE) || [])[0].trim()}」卻沒有 scope —— 沒有情境的數字會被當成通則`);
      }
    }
  }

  // source 只屬於「改善幅度的判讀」。量表出處要放 instrument_source,
  // 否則一份日記標準化文件會看起來像在背書一個閾值。
  if (status !== "sourced" && r.source) {
    errors.push(`${id}: 標為 ${status} 卻在 source 放了東西 —— 若那是量表出處,請改放 instrument_source`);
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
