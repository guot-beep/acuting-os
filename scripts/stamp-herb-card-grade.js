#!/usr/bin/env node
/**
 * stamp-herb-card-grade.js — 把「模板級」從推論改成明寫。
 *
 * 原本 validate-herb-standard.js 用 `field_sources.actions_en` 有沒有值來判斷
 * 一筆中藥卡算不算模板級。那等於說「你記了英文出處，所以整張卡一定做完了」。
 * 這個推論已經害了三次：穴位驗證器的 exam_star（236 個錯）、這裡的
 * actions_en（755 個錯），以及溫裡藥 7 味誠實記下功效層的出處之後，立刻被
 * 要求補現代藥理的英文 —— 而那個英文沒有任何來源可以查。
 *
 * 效果是反過來的：**記來源會讓紀錄變紅，所以保持綠色的方法是什麼都不要引用。**
 *
 * 卡片是一層一層做的（功效 → 主治 → 禁忌 → 現代藥理）。出處是逐層累積的，
 * 「做完了」是對整張卡的宣稱。兩件事分開，一批才能誠實地說「我引用了來源，
 * 但這張卡還沒做完」。
 *
 * 這支腳本只做一件事：把**今天就已經符合模板全部規則**的那些紀錄標成
 * card_grade: "template"，其餘標成 "partial"。沒有任何紀錄因此升級或降級 ——
 * 它只是把既有的判定寫成明文。判定條件與 validate-herb-standard.js 的
 * E6/E7/E8 逐條一致，寫在下面。
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/herb_canon_shortlist.json");
const APPLY = process.argv.includes("--apply");

const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const recs = doc.records || doc;

// 與驗證器同一組配對欄位（E5/E6）。改這裡就要一起改那裡。
const PAIRS = [
  ["functions_zh", "actions_en"],
  ["modern_functions_zh", "modern_functions_en"],
  ["condition_tags_zh", "condition_tags_en"],
  ["cautions_zh", "cautions_en"],
  ["contraindications_zh", "contraindications_en"]
];
const len = (v) => (Array.isArray(v) ? v.length : 0);

/* 舊定義：field_sources.actions_en 有值 = 模板級。
   新定義要挑出的是「用舊定義判定為模板級、而且今天真的全部通過」的那些。 */
const claimedBefore = (r) => !!(r.field_sources && r.field_sources.actions_en);
const passesEveryRule = (r) => {
  for (const [zhF, enF] of PAIRS) {
    if (len(r[zhF]) && !len(r[enF])) return false;          // E6 缺英文
    if (len(r[enF]) && len(r[enF]) !== len(r[zhF])) return false; // E5 沒對齊
  }
  if (!len(r.contraindications_zh)) return false;            // E7 缺禁忌
  const n = len(r.functions_zh);
  if (n < 2 || n > 6) return false;                          // E8 功效條數
  return true;
};

let template = 0, partial = 0;
const demoted = [], promoted = [];

for (const r of recs) {
  const ok = passesEveryRule(r) && claimedBefore(r);
  if (ok) { r.card_grade = "template"; template++; }
  else {
    r.card_grade = "partial"; partial++;
    if (claimedBefore(r) && !passesEveryRule(r)) demoted.push(r.name_zh);
    if (!claimedBefore(r) && passesEveryRule(r)) promoted.push(r.name_zh);
  }
}

console.log("中藥卡完成度標記");
console.log(`  card_grade: template  ${template}`);
console.log(`  card_grade: partial   ${partial}`);
console.log(`  合計 ${recs.length}`);

if (demoted.length) {
  console.log(`\n  有記 actions_en 出處、但今天並未通過全部規則的 ${demoted.length} 筆 → partial：`);
  console.log("    " + demoted.join("、"));
  console.log("    ↑ 這些不是被降級 —— 它們本來就沒做完，只是舊定義看不出來。");
}
if (promoted.length) {
  console.log(`\n  通過全部規則但沒記 actions_en 出處的 ${promoted.length} 筆，仍算 partial（沒有出處就不算做完）：`);
  console.log("    " + promoted.slice(0, 12).join("、"));
}

// 這支腳本不該改變驗證結果。標成 template 的筆數必須等於舊定義下真的全綠的筆數。
const oldGreen = recs.filter((r) => claimedBefore(r) && passesEveryRule(r)).length;
if (template !== oldGreen) {
  console.error(`\n❌ 標成 template 的有 ${template} 筆，但舊定義下全綠的是 ${oldGreen} 筆 —— 不寫入`);
  process.exit(1);
}
console.log("\n✅ 沒有紀錄因此升級或降級；只是把既有判定寫成明文");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(doc, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/herb_canon_shortlist.json");
