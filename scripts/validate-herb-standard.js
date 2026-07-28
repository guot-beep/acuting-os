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
 *   E6 a template-grade record (has field_sources.actions_en) is missing an _en array
 *   E7 a template-grade record has no contraindications_zh (禁忌症)
 *   E8 a template-grade record's functions_zh is outside 2-6 curated actions
 *   E9 two records share the same id (variant-character duplicates)
 *
 * WORKLIST MODE — `node scripts/validate-herb-standard.js --worklist`
 * lists the actual herb names behind every number, grouped by defect and by
 * category (batches run one category at a time, see docs/HERB_FILL_DISPATCH.md).
 * Add `--category "解表藥 / Release Exterior - Warm Acrid"` for one batch, or
 * `--all` to stop truncating long lists.
 *
 * REPORT (always printed) — honest per-field coverage vs the canonical record
 * (docs/HERB_RECORD_STANDARD.md), plus fixable counts (alias-mappable
 * categories, toneless pinyin). Coverage gaps are work, not failures.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

// Template grade = the curation pass wrote actions_en's provenance. A record can
// carry field_sources for a dozen imported fields and still never have been
// curated; judging it by the template's content rules would be judging work
// nobody claimed to have done.
const isTemplateGrade = (r) => !!(r.field_sources && r.field_sources.actions_en);

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

const WORKLIST = process.argv.includes("--worklist");
const SHOW_ALL = process.argv.includes("--all");
const CAT_ARG = (() => {
  const i = process.argv.indexOf("--category");
  return i > -1 ? process.argv[i + 1] : null;
})();

const errors = [];
const missingEn = {};
// E9: two records sharing an id break every id-keyed lookup (the app's herb
// index keeps only one while search shows both). Found 2026-07-26: five herbs
// stored twice under variant Chinese characters (三棱/三稜, 白豆蔻/白荳蔻,
// 瓜蔞/括蔞, 菟絲子/菟蕬子, 肉豆蔻/肉荳蔻).
{
  const seen = new Map();
  for (const r of recs) {
    if (!r.id) continue;
    if (seen.has(r.id)) {
      errors.push(`E9 ${r.id}: duplicate id — 「${seen.get(r.id)}」 and 「${r.name_zh}」 share it (variant characters? merge, keeping the richer record and adding the variant to aliases_zh)`);
    } else seen.set(r.id, r.name_zh);
  }
}
// herb-level defects collected for the worklist: id -> {name, category, issues[]}
const defects = new Map();
function flag(r, issue) {
  const key = r.id || r.name_zh;
  if (!defects.has(key)) defects.set(key, { name: r.name_zh || key, id: key, category: r.category || r.category_zh || "(未分類)", issues: [] });
  defects.get(key).issues.push(issue);
}
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
      flag(r, `E5 ${enF} 與 ${zhF} 長度不符 (${en.length} vs ${zh.length})`);
      errors.push(`E5 ${id}: ${enF} (${en.length}) is not index-aligned with ${zhF} (${zh.length}) — English would land on the wrong tag`);
    }
    if (zh.length && !en.length) {
      missingEn[enF] = (missingEn[enF] || 0) + 1;
      flag(r, `缺英文 ${enF}`);
      // "Template grade" is field_sources.actions_en specifically, NOT "has any
      // field_sources". link-herb-sources.js attaches per-field citations to
      // 217 herbs from their recorded CloudTCM provenance — that says where the
      // content came from, not that anyone curated it to the template. The
      // loose definition turned all 217 into template-grade and produced 755
      // errors for work nobody had claimed to do. Same trap the acupoint
      // validator hit with field_sources.exam_star; same fix.
      // (see docs/HERB_CARD_TEMPLATE.md)
      // A record carrying actions_en provenance claims template grade (see
      // docs/HERB_CARD_TEMPLATE.md) — for those, a missing English array is a
      // FAILURE, not a note. Ting: 模板寫了為什麼還是會遺漏 — because the doc
      // was advisory and the check was only a report. Legacy records without
      // field_sources stay exempt; they are the known backlog.
      if (isTemplateGrade(r)) {
        errors.push(`E6 ${id}: template-grade record is missing ${enF} (${zh.length} 中文 tags, 0 English)`);
      }
    }
  }
  {
    const zh = Array.isArray(r[SOFT_PAIR[0]]) ? r[SOFT_PAIR[0]] : [];
    const en = Array.isArray(r[SOFT_PAIR[1]]) ? r[SOFT_PAIR[1]] : [];
    if (en.length && zh.length && en.length !== zh.length) {
      unpairedActions++;
      flag(r, `actions_en 無法與 functions_zh 配對 (${en.length} vs ${zh.length})`);
    }
  }
  // Ting 2026-07-26: actions must be CURATED, not truncated and not dumped —
  // cross-compare the sources, rank by board-exam importance, keep the key
  // ones. Library today: 70 records list 0-1 actions (under-listed) and 100
  // list more than 6 (raw dumps). Template-grade records must land in 2-6.
  if (isTemplateGrade(r)) {
    const n = Array.isArray(r.functions_zh) ? r.functions_zh.length : 0;
    if (n < 2 || n > 6) {
      flag(r, `功效 ${n} 條(需 2-6,目標 3-5)`);
      errors.push(`E8 ${id}: functions_zh has ${n} action(s) — template-grade records keep the 2-6 key actions (target ~3-5), ranked most important first`);
    }
  }
  // Ting 2026-07-26: 禁忌症 sat empty on every card because scraped safety text
  // all went into cautions_zh and nobody filled contraindications_zh. 禁忌
  // (absolute) and 慎用 (relative) are different clinical calls, so a
  // template-grade record must carry both.
  if (isTemplateGrade(r) &&
      !(Array.isArray(r.contraindications_zh) && r.contraindications_zh.length)) {
    flag(r, "缺禁忌症 contraindications_zh");
    errors.push(`E7 ${id}: template-grade record has no contraindications_zh (禁忌症 required — 慎用 in cautions_zh does not count)`);
  }
  if (r.pinyin && !/[Ā-ỿǎǐǒǔ]/.test(r.pinyin) && !/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i.test(r.pinyin)) {
    tonelessPinyin++;
    flag(r, "拼音未帶聲調");
  }
  // herbs nobody has curated yet: no field_sources at all
  if (!isTemplateGrade(r)) flag(r, "尚未依模板整理(無 field_sources.actions_en)");
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

// Board-outline provenance. The card once carried invented labels ("Bastyr Exam
// Pearl", "NCCAOM actions") that pointed at nothing; §4.5 forbids naming an
// exam source you cannot show. So check the claim against the outlines actually
// in curriculum/board/ — reported, not enforced, because the answer may simply
// be that Ting has not uploaded the herbology outline yet.
const boardDir = path.join(ROOT, "curriculum/board");
const outlines = fs.existsSync(boardDir)
  ? fs.readdirSync(boardDir).filter((f) => !f.startsWith(".") && f !== "README.md")
  : [];
const outlineText = outlines.join(" ").toUpperCase();
const BODIES = ["NCBAHM", "NCCAOM", "CALE", "BASTYR"];
const claims = new Map();
for (const r of recs) {
  const txt = `${r.exam_importance || ""} ${r.exam_pearl || ""} ${JSON.stringify(r.source_citations || [])}`;
  for (const b of BODIES) {
    if (txt.toUpperCase().includes(b)) claims.set(b, (claims.get(b) || 0) + 1);
  }
}
if (claims.size) {
  console.log(`\nBoard-outline citations (curriculum/board/ holds ${outlines.length} file(s)):`);
  for (const [body, n] of [...claims.entries()].sort((a, b) => b[1] - a[1])) {
    const have = outlineText.includes(body);
    console.log(`  ${body.padEnd(8)} cited by ${String(n).padStart(3)} record(s)   ${have ? "✅ outline present" : "⚠️ no such outline in curriculum/board/"}`);
  }
  if ([...claims.keys()].some((b) => !outlineText.includes(b))) {
    console.log(`  ⚠️ 引用了 repo 裡沒有的考綱 = 無法核對。請 Ting 上傳該考綱，或把該敘述改成課件依據。`);
    console.log(`     現有考綱：${outlines.filter((f) => f.endsWith(".pdf")).join("、") || "(無)"}`);
    // Filename matching cannot tell CH (herbology) from ACPL (point location) —
    // both are "NCBAHM". A herb card citing the ACPL outline would pass the
    // check above while citing a document with no herb content at all.
    if (outlineText.includes("NCBAHM") && !outlineText.includes("_CH_")) {
      console.log(`     ⚠️ 只有 ACPL（針灸點位）考綱，它不含中藥範圍 —— 中藥卡引用 NCBAHM 仍無法核對。`);
    }
  }
}
if (!WORKLIST) console.log(`\n提示：加 --worklist 可列出每一味不合格的藥名（--category "<分類>" 看單一批次）。`);

if (WORKLIST) {
  let rows = [...defects.values()];
  if (CAT_ARG) rows = rows.filter((d) => d.category === CAT_ARG);
  const byCat = new Map();
  rows.forEach((d) => {
    if (!byCat.has(d.category)) byCat.set(d.category, []);
    byCat.get(d.category).push(d);
  });
  const cats = [...byCat.entries()].sort((a, b) => b[1].length - a[1].length);
  console.log(`\n===== 待整理清單 WORKLIST — ${rows.length} 味有缺，${cats.length} 個分類 =====`);
  if (CAT_ARG) console.log(`(只顯示分類：${CAT_ARG})`);
  for (const [cat, list] of cats) {
    console.log(`\n## ${cat}  (${list.length} 味)`);
    const show = SHOW_ALL ? list : list.slice(0, 12);
    show.sort((a, b) => b.issues.length - a.issues.length);
    for (const d of show) {
      console.log(`  ${d.name.padEnd(5)} ${d.id.padEnd(22)} ${d.issues.length} 項：${d.issues.join("、")}`);
    }
    if (!SHOW_ALL && list.length > show.length) console.log(`  … 還有 ${list.length - show.length} 味（加 --all 顯示全部）`);
  }
  console.log(`\n用法：--category "<分類>" 只看一批；--all 顯示全部。批次順序見 docs/HERB_FILL_DISPATCH.md。`);
}

if (errors.length) {
  console.error(`\nFAIL — ${errors.length} structural defect(s):`);
  errors.slice(0, 40).forEach((e) => console.error("  " + e));
  if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  process.exit(1);
}
console.log("\nPASS — no structural defects.");
