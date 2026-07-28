#!/usr/bin/env node
/**
 * fix-formula-name-as-ingredient.js — clear compositions that are just the
 * formula's own name with the suffix chopped off.
 *
 * F12 (composition → herb canon) surfaced 39 "herbs" that no herb record
 * matches. They are not obscure herbs. They are formula names:
 *
 *   瀉心湯   composition: ["瀉心"]
 *   左歸飲   composition: ["左歸"]
 *   知柏地黃丸 composition: ["知柏"]
 *
 * Some import stripped 湯/散/丸/飲/煎 from the formula name and wrote the stem
 * as the sole ingredient. 36 formulas carry this.
 *
 * This is not misfiled content — it is a parse artifact that was never real
 * data, so §0's 只加深不刪除 does not protect it. Leaving it is actively worse
 * than an empty composition: the card would state that 瀉心湯 contains one
 * ingredient called 瀉心, which is false, and the number 152/173 "有組成"
 * flatters the dataset by 36.
 *
 * ── Why this cannot delete a real one-herb formula ──
 * The test is that the lone ingredient is a PREFIX OF THE FORMULA'S OWN NAME.
 * 獨參湯's ingredient is 人參, which is not a prefix of 獨參湯, so it survives.
 * The script also refuses to touch anything with more than one ingredient, and
 * refuses to touch a name that the herb canon recognises.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");
const HERBS = path.join(ROOT, "data/herbs/herb_canon_shortlist.json");
const APPLY = process.argv.includes("--apply");

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = data.records || data;

const hj = JSON.parse(fs.readFileSync(HERBS, "utf8"));
const herbNames = new Set();
for (const h of (hj.records || hj)) {
  if (h.name_zh) herbNames.add(String(h.name_zh).trim());
  for (const a of h.aliases_zh || []) herbNames.add(String(a).trim());
}

const cleared = [], skipped = [], suspect = [];

for (const r of recs) {
  const comp = Array.isArray(r.composition) ? r.composition : [];
  if (comp.length !== 1) continue;
  const only = String(comp[0]?.herb_zh || "").trim();
  const name = String(r.name_zh || "").trim();
  if (!only || !name) continue;

  // The artifact signature: the "ingredient" is the head of the formula's name.
  if (!name.startsWith(only)) { skipped.push(`${name}：${only} 不是方名開頭，保留待查`); continue; }

  // ⚠️ The same truncation, but the stem happens to BE a real herb: 葛根湯 →
  // ["葛根"]. This is more dangerous than the 瀉心 case, because a card saying
  // 葛根湯 contains 葛根 alone looks plausible and is wrong — the real formula
  // has seven herbs. Clearing would throw away the one true ingredient, and
  // the real composition is only recoverable from the curriculum, which is a
  // separate job. So: keep it, and mark it so the card can warn instead of
  // asserting a composition it does not have.
  if (herbNames.has(only)) {
    r.composition_suspect = "組成只有一味，且該味是方名開頭 —— 很可能是匯入時被截斷，待由 curriculum/formulas 補齊";
    suspect.push(`${name}：composition 只有 ["${only}"]`);
    continue;
  }
  // And what remains is a dosage-form suffix, not another herb.
  const rest = name.slice(only.length);
  if (!/^[湯散丸飲煎膏丹片](加減|加味)?$|^[一-鿿]{0,4}[湯散丸飲煎膏丹]$/.test(rest)) {
    skipped.push(`${name}：剩下的「${rest}」不像劑型後綴，保留待查`);
    continue;
  }

  cleared.push(`${name}  ←  composition: ["${only}"]`);
  r.composition = [];
  r.composition_cleared_note = "原本的組成是方名去掉劑型後綴，並非真實藥材（scripts/fix-formula-name-as-ingredient.js）";
}

console.log("方名被當成藥材的組成");
console.log(`  清空 ${cleared.length} 方：`);
cleared.slice(0, 40).forEach((c) => console.log("    " + c));
if (suspect.length) {
  console.log(`\n  ⚠️ 標記為可疑（同樣是截斷，但那一味是真藥材，不能清）${suspect.length} 方：`);
  suspect.slice(0, 20).forEach((s) => console.log("    " + s));
  console.log("     → 已寫入 composition_suspect，卡片應顯示警告而不是斷言組成");
}
if (skipped.length) {
  console.log(`\n  保留 ${skipped.length} 方（不符合判定條件）：`);
  skipped.slice(0, 10).forEach((s) => console.log("    " + s));
}

const withComp = recs.filter((r) => (r.composition || []).length).length;
console.log(`\n  有真實組成的方：${withComp}/${recs.length}（清理前 ${withComp + cleared.length}）`);
console.log("\n✅ 只清空「單一成分且該成分是方名開頭」的記錄；真正的單味方（如獨參湯）不受影響");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/formulas.json");
