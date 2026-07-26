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
 *   E5 an _en tag array is not index-aligned with its _zh array
 *   E6 a template-grade record (has field_sources) is missing an _en array
 *   E7 a template-grade record has no contraindications_zh (禁忌症)
 *   E8 a template-grade record's functions_zh is outside 2-6 curated actions
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
  ["cautions_zh", "cautions_en"],
  ["contraindications_zh", "contraindications_en"]
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
  "dosage", "cautions_zh", "contraindications_zh", "safety_flags",
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
    if (zh.length && !en.length) {
      missingEn[enF] = (missingEn[enF] || 0) + 1;
      // A record carrying field_sources claims template grade (see
      // docs/HERB_CARD_TEMPLATE.md) — for those, a missing English array is a
      // FAILURE, not a note. Ting: 模板寫了為什麼還是會遺漏 — because the doc
      // was advisory and the check was only a report. Legacy records without
      // field_sources stay exempt; they are the known backlog.
      if (r.field_sources && Object.keys(r.field_sources).length) {
        errors.push(`E6 ${id}: template-grade record is missing ${enF} (${zh.length} 中文 tags, 0 English)`);
      }
    }
  }
  {
    const zh = Array.isArray(r[SOFT_PAIR[0]]) ? r[SOFT_PAIR[0]] : [];
    const en = Array.isArray(r[SOFT_PAIR[1]]) ? r[SOFT_PAIR[1]] : [];
    if (en.length && zh.length && en.length !== zh.length) unpairedActions++;
  }
  // Ting 2026-07-26: actions must be CURATED, not truncated and not dumped —
  // cross-compare the sources, rank by board-exam importance, keep the key
  // ones. Library today: 70 records list 0-1 actions (under-listed) and 100
  // list more than 6 (raw dumps). Template-grade records must land in 2-6.
  if (r.field_sources && Object.keys(r.field_sources).length) {
    const n = Array.isArray(r.functions_zh) ? r.functions_zh.length : 0;
    if (n < 2 || n > 6) {
      errors.push(`E8 ${id}: functions_zh has ${n} action(s) — template-grade records keep the 2-6 key actions (target ~3-5), ranked most important first`);
    }
  }
  // Ting 2026-07-26: 禁忌症 sat empty on every card because scraped safety text
  // all went into cautions_zh and nobody filled contraindications_zh. 禁忌
  // (absolute) and 慎用 (relative) are different clinical calls, so a
  // template-grade record must carry both.
  if (r.field_sources && Object.keys(r.field_sources).length &&
      !(Array.isArray(r.contraindications_zh) && r.contraindications_zh.length)) {
    errors.push(`E7 ${id}: template-grade record has no contraindications_zh (禁忌症 required — 慎用 in cautions_zh does not count)`);
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
const actionCounts = recs.map((r) => (Array.isArray(r.functions_zh) ? r.functions_zh.length : 0));
const under = actionCounts.filter((n) => n <= 1).length;
const over = actionCounts.filter((n) => n > 6).length;
console.log(`Note: action curation — ${under} record(s) list 0-1 actions (under-listed), ${over} list >6 (raw dumps), ${recs.length - under - over} in the 2-6 range.`);
console.log(`Note: ${tonelessPinyin} record(s) without tone-marked pinyin (glance layer wants Má Huáng).`);

if (errors.length) {
  console.error(`\nFAIL — ${errors.length} structural defect(s):`);
  errors.slice(0, 40).forEach((e) => console.error("  " + e));
  if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  process.exit(1);
}
console.log("\nPASS — no structural defects.");
