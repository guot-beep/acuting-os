#!/usr/bin/env node
/**
 * validate-herb-standard.js — enforce docs/HERB_RECORD_STANDARD.md.
 *
 * Ting: herb data got filled fast but not systematically. This makes the
 * standard machine-checked instead of goodwill-based. Codex runs it on every
 * herb batch; any fill AI must leave it green.
 *
 * ERRORS (exit 1) — structural defects:
 *   E1 missing id / name_zh / pinyin
 *   E2 no category AND no category_zh at all
 *   E3 category present but not in the canon (data/config/herb_category_canon.json)
 *      and not a known alias
 *   E4 a *_zh text field is non-empty but contains no Chinese at all
 *
 * REPORT (always printed) — honest per-field coverage vs the canonical record
 * (docs/HERB_RECORD_STANDARD.md), plus fixable counts (alias-mappable
 * categories, toneless pinyin). Coverage gaps are work, not failures.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const canon = JSON.parse(fs.readFileSync(path.join(ROOT, "data/config/herb_category_canon.json"), "utf8"));
const CANON = new Set(canon.categories);
const ALIAS = canon.aliases || {};

const doc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/herb_canon_shortlist.json"), "utf8"));
const recs = doc.records || doc;

const hasCJK = (s) => /[㐀-鿿]/.test(String(s));
const zhTextOk = (v) => {
  if (v == null) return true;
  const vals = Array.isArray(v) ? v : [v];
  const nonEmpty = vals.filter((x) => String(x).trim() !== "");
  if (!nonEmpty.length) return true;
  return nonEmpty.some((x) => hasCJK(x));
};
const filled = (v) => Array.isArray(v) ? v.length > 0 : (v != null && String(v).trim() !== "" && (typeof v !== "object" || Object.keys(v).length > 0));

const ZH_FIELDS = ["name_zh", "category_zh", "functions_zh", "modern_functions_zh", "cautions_zh", "indications_zh", "channels_zh"];
// canonical record fields tracked for coverage (see HERB_RECORD_STANDARD.md)
const COVERAGE = [
  "name_zh", "name_en", "pinyin", "category",
  "properties_taste_temp", "channels_zh",
  "functions_zh", "indications_zh", "modern_functions_zh",
  "dosage", "cautions_zh", "safety_flags",
  "related_formulas", "exact_source_url", "safety_source_url"
];

const errors = [];
let aliasFixable = 0;
let tonelessPinyin = 0;
const cov = Object.fromEntries(COVERAGE.map((k) => [k, 0]));

for (const r of recs) {
  const id = r.id || r.name_zh || "(unknown)";
  if (!r.id || !r.name_zh || !r.pinyin) errors.push(`E1 ${id}: missing id/name_zh/pinyin`);
  if (!r.category && !r.category_zh) errors.push(`E2 ${id}: no category and no category_zh`);
  if (r.category && !CANON.has(r.category)) {
    if (ALIAS[r.category]) aliasFixable++;
    else errors.push(`E3 ${id}: category "${r.category}" not in canon and has no alias`);
  }
  if (!r.category && r.category_zh && (ALIAS[r.category_zh] || CANON.has(r.category_zh))) aliasFixable++;
  for (const f of ZH_FIELDS) {
    if (!zhTextOk(r[f])) errors.push(`E4 ${id}: ${f} has content but no Chinese`);
  }
  if (r.pinyin && !/[Ā-ỿǎǐǒǔ]/.test(r.pinyin) && !/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i.test(r.pinyin)) tonelessPinyin++;
  for (const k of COVERAGE) if (filled(r[k])) cov[k]++;
}

console.log(`validate-herb-standard: ${recs.length} records\n`);
console.log("Coverage vs canonical record (docs/HERB_RECORD_STANDARD.md):");
for (const k of COVERAGE) {
  const pct = Math.round((cov[k] / recs.length) * 100);
  console.log(`  ${k.padEnd(24)} ${String(cov[k]).padStart(4)}/${recs.length}  ${String(pct).padStart(3)}%`);
}
console.log(`\nFixable: ${aliasFixable} record(s) with alias-mappable category (run scripts/normalize-herb-categories.js --apply)`);
console.log(`Note: ${tonelessPinyin} record(s) without tone-marked pinyin (glance layer wants Má Huáng).`);

if (errors.length) {
  console.error(`\nFAIL — ${errors.length} structural defect(s):`);
  errors.slice(0, 40).forEach((e) => console.error("  " + e));
  if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  process.exit(1);
}
console.log("\nPASS — no structural defects.");
