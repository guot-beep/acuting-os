#!/usr/bin/env node
/**
 * validate-learn-state-boundary.js — 學習狀態不得寫進 canonical 知識層
 * (LEARN_STATE_CONTRACT,2026-08-27)。
 *
 * 規則:醫學事實對所有人相同,學習狀態只對一個人成立。把後者寫進前者會有
 * 兩個後果 ——
 *   1. 知識層的 diff 每天被學習行為洗版,而 D7 的整個價值就在於知識層的
 *      diff 有意義;
 *   2. 「這張卡答錯過 3 次」會被當成知識的一部分匯出/公開。
 * 與 D9(臨床統計永不寫進正典)同一條規矩,只是換一個來源。
 *
 * 這支現在是綠的 —— 學習狀態層還不存在。**綠著上線正是重點**:等到有人
 * 開始建 Learn 的那天,誘惑會很具體(「在 herb 卡上加個 wrong_count 最快」),
 * 而那時候這條規則已經在擋了,不必靠當事人記得讀過這份契約。
 *
 * 判定:canonical 檔案的記錄不得帶學習狀態欄位。`board_domains` 這類考科
 * 歸屬**不算** —— 它描述「這個知識點屬於哪一科」,換一個人答案不會變,
 * 是知識事實。分界線就是「換一個人答案會不會變」。
 *
 * 用法:node scripts/validate-learn-state-boundary.js [--json]
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AS_JSON = process.argv.includes("--json");

/* 學習狀態的欄位形狀:**個人化**、隨練習變動。
 *
 * 分界線是契約自己寫的那句:「換一個人,答案會不會變」。
 *
 * 第一版把 `last_reviewed` 列進來,結果報了 157 筆假警報 —— 那是**內容審核
 * 時間戳**(這張卡上次被誰審過),對所有人相同,是編輯稽核紀錄不是學習狀態。
 * 一支會報假警報的 gate 比沒有更糟:重複幾次之後,下一個人就直接把它關掉。
 * 所以樣式改成只認「個人練習」語意明確的字 —— review/reviewed 這種
 * 編輯與學習共用的字眼一律不進黑名單,寧可漏抓也不要誤傷。
 *
 * 真的建 Learn 那天,狀態欄位會長成 seen_count / wrong_count / next_review_at
 * 這種形狀(見 LEARN_STATE_CONTRACT §3),而它們該住在使用者本機,不在這裡。 */
const BANNED = [
  "wrong_count", "seen_count", "correct_count", "practice_count", "attempt_count",
  "next_review_at", "next_review_due",
  "mastery", "mastery_level", "user_mastery",
  "srs_interval", "ease_factor", "learn_streak", "study_streak",
  "learn_state", "study_state", "learner_confidence",
];
/* 明確不算的:知識事實或編輯稽核 —— 換一個人答案不會變。
 * last_reviewed / last_reviewed_at 屬此類(內容審核時間戳,全庫 157 筆)。 */
const ALLOWED_LOOKALIKES = new Set([
  "board_domains", "exam_importance", "exam_star", "study_tags",
  "nccaom_high_yield", "course_level_en", "english_exam_track", "chinese_depth_track",
  "last_reviewed", "last_reviewed_at", "reviewed_at", "reviewed_by", "review_status",
  "safety_review_status", "source_status",
]);

const CANON = [
  "data/pathology/condition_canon_shortlist.json",
  "data/pathology/tdis_registry.json",
  "data/pathology/pattern_library.json",
  "data/pathology/pattern_registry.json",
  "data/symptoms/symptoms.json",
  "data/herbs/herb_canon_shortlist.json",
  "data/herbs/formulas.json",
  "data/supplements/supplements.json",
  "data/pharmacology/drugs.json",
  "data/acupoints/361.json",
];

const violations = [];
let scanned = 0;

for (const rel of CANON) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const doc = JSON.parse(fs.readFileSync(p, "utf8"));
  const recs = doc.records || (Array.isArray(doc) ? doc : []);
  for (const r of recs) {
    if (!r || typeof r !== "object") continue;
    scanned++;
    for (const key of Object.keys(r)) {
      if (ALLOWED_LOOKALIKES.has(key)) continue;
      const hit = BANNED.find((b) => key === b || key.endsWith("_" + b) || key.startsWith(b + "_"));
      if (hit) violations.push({ file: rel, id: r.id, field: key, matched: hit });
    }
  }
}

if (AS_JSON) {
  const byCode = {};
  for (const v of violations) byCode[v.matched] = (byCode[v.matched] || 0) + 1;
  console.log(JSON.stringify({ defects: violations.length, by_code: byCode }));
  process.exit(0);
}

console.log("學習狀態邊界(LEARN_STATE_CONTRACT)\n");
console.log(`  掃描 canonical 記錄   ${scanned}`);
console.log(`  禁用欄位樣式          ${BANNED.length}`);
console.log(`  違規                  ${violations.length}\n`);
for (const v of violations) console.log(`  ⛔ ${v.file}\n       ${v.id}.${v.field}(命中「${v.matched}」)`);
if (!violations.length) console.log("  (無 —— 學習狀態層尚未建立,這條先綠著擋在前面)");
if (violations.length) {
  console.log("\n修法:學習狀態存使用者本機(不進 git),以 canonical_id 單向指向知識層;");
  console.log("要在卡片上顯示「答錯過幾次」,在 render 時 join,不寫進資料。");
  console.log("見 docs/LEARN_STATE_CONTRACT.md。");
}
console.log(violations.length ? `\nFAIL — ${violations.length} 個學習狀態欄位混進 canonical。` : "\nPASS — canonical 知識層沒有個人化學習狀態。");
process.exit(violations.length ? 1 : 0);
