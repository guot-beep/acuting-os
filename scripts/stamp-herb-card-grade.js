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

/* 功效層（functions_zh 與 actions_en 是同一層的中英兩側）有沒有記出處。
   兩個 key 名都在用：Claude 的批次記 actions_en，Codex 的批次記 functions_zh。
   只認 actions_en 會把 Codex 那 17 張有出處、且結構全數通過的卡誤判成未完成。 */
const hasActionsProvenance = (r) =>
  !!(r.field_sources && (r.field_sources.actions_en || r.field_sources.functions_zh));

// 舊定義：field_sources.actions_en 有值就算模板級（不看內容是否齊全）。
const claimedUnderOldRule = (r) => !!(r.field_sources && r.field_sources.actions_en);
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
const incomplete = [], noProvenance = [], newlyCounted = [];

for (const r of recs) {
  const rules = passesEveryRule(r);
  const cited = hasActionsProvenance(r);
  if (rules && cited) {
    r.card_grade = "template"; template++;
    // 結構本來就齊、出處記在 functions_zh 而非 actions_en，舊定義看不見的那些
    if (!claimedUnderOldRule(r)) newlyCounted.push(r.name_zh);
  } else {
    r.card_grade = "partial"; partial++;
    if (!rules) incomplete.push(r.name_zh);
    else if (!cited) noProvenance.push(r.name_zh);
  }
}

console.log("中藥卡完成度標記");
console.log(`  card_grade: template  ${template}`);
console.log(`  card_grade: partial   ${partial}`);
console.log(`  合計 ${recs.length}`);

console.log(`\n  partial 的兩種原因：`);
console.log(`    結構未齊（缺英文對照／缺禁忌／功效條數不符）  ${incomplete.length}`);
console.log(`    結構齊但功效層完全沒記出處                    ${noProvenance.length}`);
if (noProvenance.length) {
  console.log("      " + noProvenance.slice(0, 14).join("、") + (noProvenance.length > 14 ? ` …(${noProvenance.length})` : ""));
  console.log("      ↑ 這些通過結構檢查，但沒有人記下內容出自哪裡。§紅線5：沒核讀過就不算來源。");
}
if (newlyCounted.length) {
  console.log(`\n  舊定義看不見、這次正確計入 template 的 ${newlyCounted.length} 筆：`);
  console.log("    " + newlyCounted.slice(0, 14).join("、") + (newlyCounted.length > 14 ? ` …(${newlyCounted.length})` : ""));
  console.log("    ↑ 出處記在 field_sources.functions_zh（Codex 批次的寫法），不是 actions_en。");
}

/* 唯一不可以發生的事：舊定義下已經全綠的紀錄被靜默降級。
   數量可以往上（承認別人做完的卡），不可以往下（把做完的說成沒做完）。 */
const silentlyDemoted = recs.filter(
  (r) => claimedUnderOldRule(r) && passesEveryRule(r) && r.card_grade !== "template"
);
if (silentlyDemoted.length) {
  console.error(`\n❌ ${silentlyDemoted.length} 筆原本全綠卻被降級 —— 不寫入`);
  silentlyDemoted.slice(0, 10).forEach((r) => console.error("  " + r.name_zh));
  process.exit(1);
}
console.log("\n✅ 沒有任何原本全綠的紀錄被降級；partial 的每一筆都說得出是缺結構還是缺出處");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(doc, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/herb_canon_shortlist.json");
