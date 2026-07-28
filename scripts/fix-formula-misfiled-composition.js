#!/usr/bin/env node
/**
 * fix-formula-misfiled-composition.js — move a formula's per-herb notes out of
 * pattern_indications_zh and into composition, where they belong.
 *
 * F10 caught 麻黃湯 with this in pattern_indications_zh:
 *
 *   ["組成:",
 *    "麻黃：發汗解表、宣肺平喘",
 *    "桂枝：溫通心陽、散寒止痛",
 *    "杏仁：潤肺止咳、平喘化痰",
 *    "甘草：調和諸藥、益氣緩急"]
 *
 * That is not 主治證候 — it is what each herb does IN THIS FORMULA, which is
 * §1 section 4's fourth column and the most useful thing on the card. Its own
 * pattern_indications_en says something completely different ("Exterior excess
 * wind-cold pattern…"), so the 中英 pair was describing two unrelated things.
 *
 * §0 says move, do not delete: each line goes to composition[].in_formula_zh
 * on the matching herb. The 「組成:」 heading itself is a section label with no
 * content and is dropped.
 *
 * Refuses to write unless every note matches an herb already in composition —
 * a note with no home would otherwise be silently lost.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");
const APPLY = process.argv.includes("--apply");

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = data.records || data;

const HEADING = /^\s*組成\s*[:：]\s*$/;
// 「麻黃：發汗解表、宣肺平喘」 — herb name, full-width colon, what it does here.
const NOTE = /^\s*([一-鿿]{1,6})\s*[:：]\s*(.+)$/;

const fail = [];
let moved = 0, dropped = 0;
const touched = [];

for (const r of recs) {
  const pi = Array.isArray(r.pattern_indications_zh) ? r.pattern_indications_zh : [];
  if (!pi.some((v) => HEADING.test(String(v)))) continue;

  const comp = Array.isArray(r.composition) ? r.composition : [];
  const byHerb = new Map(comp.map((c) => [String(c.herb_zh || "").trim(), c]));
  const keep = [], notes = [];

  for (const v of pi) {
    const s = String(v);
    if (HEADING.test(s)) { dropped++; continue; }
    const m = NOTE.exec(s);
    if (m && byHerb.has(m[1])) { notes.push([m[1], m[2].trim()]); continue; }
    keep.push(v);
  }

  // Every note must have a home in composition, or it would vanish.
  for (const [herb] of notes) {
    if (!byHerb.has(herb)) fail.push(`${r.name_zh}: 「${herb}」不在 composition，搬過去會弄丟`);
  }
  if (!notes.length) {
    fail.push(`${r.name_zh}: 有「組成:」標題但沒有可搬的逐味說明 — 需要人工看`);
    continue;
  }

  for (const [herb, note] of notes) {
    const c = byHerb.get(herb);
    if (c.in_formula_zh && c.in_formula_zh !== note) {
      fail.push(`${r.name_zh}.${herb}: in_formula_zh 已有不同內容，不覆蓋`);
      continue;
    }
    c.in_formula_zh = note;
    moved++;
  }

  r.pattern_indications_zh = keep;
  // The 中文 side is now a different length from the English, and the English
  // was never describing these lines anyway. Rather than leave a false pairing,
  // record what happened.
  r.field_sources = r.field_sources || {};
  r.field_sources.in_formula_zh = ["原本誤置於 pattern_indications_zh，由 scripts/fix-formula-misfiled-composition.js 歸位"];
  touched.push(`${r.name_zh}（搬 ${notes.length} 味，剩 ${keep.length} 條主治）`);
}

console.log("方劑組成錯層歸位");
console.log(`  搬到 composition[].in_formula_zh  ${moved} 味`);
console.log(`  丟棄「組成:」標題                 ${dropped} 條`);
touched.forEach((t) => console.log("  " + t));

if (fail.length) {
  console.error(`\n❌ ${fail.length} 個檢查失敗 —— 不寫入:`);
  fail.forEach((f) => console.error("  " + f));
  process.exit(1);
}
if (!moved) { console.log("\n沒有需要處理的記錄。"); process.exit(0); }
console.log("\n✅ 每一條逐味說明都找到對應的藥，沒有內容遺失");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/formulas.json");
