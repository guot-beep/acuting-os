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
// Bilingual tag pairs must be INDEX-ALIGNED: a shifted array silently mislabels
// every tag after the gap (the "Insomnia vs Palpitations" class of bug).
const PAIRS = [
  ["modern_functions_zh", "modern_functions_en"],
  ["condition_tags_zh", "condition_tags_en"],
  ["cautions_zh", "cautions_en"]
];
// Legacy: actions_en on older records is an independent English action list,
// not a per-tag translation. Misalignment there is reported, not failed — the
// renderer now only pairs them when the lengths match.
const SOFT_PAIR = ["functions_zh", "actions_en"];
// canonical record fields tracked for coverage (see HERB_RECORD_STANDARD.md)
const COVERAGE = [
  "name_zh", "name_en", "pinyin", "category",
  "condition_tags_en", "modern_functions_en", "actions_en",
  "properties_taste_temp", "channels_zh",
  "functions_zh", "indications_zh", "modern_functions_zh",
  "dosage", "cautions_zh", "safety_flags",
  "related_formulas", "exact_source_url", "safety_source_url"
];

const errors = [];
const missingEn = {};
let aliasFixable = 0;
let tonelessPinyin = 0;
let unpairedActions = 0;
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
  for (const [zhF, enF] of PAIRS) {
    const zh = Array.isArray(r[zhF]) ? r[zhF] : [];
    const en = Array.isArray(r[enF]) ? r[enF] : [];
    if (en.length && en.length !== zh.length) {
      errors.push(`E5 ${id}: ${enF} (${en.length}) is not index-aligned with ${zhF} (${zh.length}) — English would land on the wrong tag`);
    }
    if (zh.length && !en.length) missingEn[enF] = (missingEn[enF] || 0) + 1;
  }
  {
    const zh = Array.isArray(r[SOFT_PAIR[0]]) ? r[SOFT_PAIR[0]] : [];
    const en = Array.isArray(r[SOFT_PAIR[1]]) ? r[SOFT_PAIR[1]] : [];
    if (en.length && zh.length && en.length !== zh.length) unpairedActions++;
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
console.log("\nBilingual tag gaps (records with 中文 but no English — fill these):");
for (const [f, n] of Object.entries(missingEn)) console.log(`  ${f.padEnd(24)} missing on ${n} record(s)`);
console.log(`\nFixable: ${aliasFixable} record(s) with alias-mappable category (run scripts/normalize-herb-categories.js --apply)`);
console.log(`Note: ${unpairedActions} record(s) where actions_en cannot pair with functions_zh (card shows 中文 tags alone + a separate English actions list).`);
console.log(`Note: ${tonelessPinyin} record(s) without tone-marked pinyin (glance layer wants Má Huáng).`);

if (errors.length) {
  console.error(`\nFAIL — ${errors.length} structural defect(s):`);
  errors.slice(0, 40).forEach((e) => console.error("  " + e));
  if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  process.exit(1);
}
console.log("\nPASS — no structural defects.");
