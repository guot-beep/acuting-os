#!/usr/bin/env node
/**
 * import-zhiyuan-disease-index.js — ingest the 知源中醫 disease classification
 * Ting captured (536 entries, 7 categories × 28 subcategories) as STAGING and
 * as a TAXONOMY, never as canon records.
 *
 * Why not just create 536 condition records: that would take the condition
 * layer from 150 records to 686 with zero content — 536 skeletons wearing
 * content's clothes, the exact failure AGENTS.md calls 最重罪 and the one the
 * C10 check exists to catch. Records get created when someone fills them from
 * a real source, one batch at a time. Until then this is a gap report.
 *
 * Two outputs, both honest about what they are:
 *
 *   data/imports/zhiyuan/disease_index.json
 *     All 536 entries with their category path, marked source_tier C
 *     (screenshot capture, model-assisted English, not a cited edition).
 *     Import layers are NOT namespaces (D11) — nothing here may appear in a
 *     relation field.
 *
 *   data/config/tcm_disease_taxonomy.json
 *     The 7×28 hierarchy as a controlled vocabulary for tdis.* records.
 *     This is the genuinely valuable part: tdis_registry's 75 records carry
 *     ad-hoc `classical_source_hint` strings (中醫內科學·脾胃, 中醫婦科學, …)
 *     and those turn out to BE this taxonomy, written by hand 22 different
 *     ways. A controlled vocabulary replaces the free text.
 *
 * The English column is model-generated from screenshots. It is recorded as
 * `name_en_draft`, never `name_en` — a translation without a cited edition is
 * a hypothesis, and several entries visibly need it (the file itself flags
 * "verification needed" and "label incomplete"; 疰疾 and 痢症 look like OCR
 * damage of 痄腮/疰夏 and 痢疾).
 *
 *   node scripts/import-zhiyuan-disease-index.js <path-to-md>
 *   node scripts/import-zhiyuan-disease-index.js <path> --write
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = process.argv[2];
const WRITE = process.argv.includes("--write");
if (!SRC || SRC.startsWith("--")) {
  console.error("usage: node scripts/import-zhiyuan-disease-index.js <path-to-md> [--write]");
  process.exit(2);
}

const md = fs.readFileSync(SRC, "utf8");
const lines = md.split(/\r?\n/);

// A 中醫 name that is really a biomedical diagnosis is a cond.* candidate, not
// a tdis.* one (D11). These are surface cues only — the call is the fill line's,
// so the flag is advisory and every entry keeps its raw category path.
const BIOMEDICAL_CUE = /(炎$|症$|癌|綜合征|綜合徵|症候群|病毒|細菌|梗塞|硬化$|骨折|脫位|結核|中毒|障礙$|囊腫$|突出症|滑脫症|疝$)/;
const NEEDS_REVIEW = /(verification needed|label incomplete|context dependent|traditional term)/i;

let category = null, categoryEn = null, sub = null, subEn = null;
const entries = [];
const taxonomy = [];
const seen = new Set();

/* IDs are ASCII, always (D10: Chinese characters in an id are a known mojibake
 * landmine in this repo). The English label is the slug source; if a section
 * ever lacks one, that is a data problem to fix at capture time, not something
 * to paper over with the Chinese name. */
function slug(nameEn, nameZh) {
  const base = String(nameEn || "")
    .toLowerCase()
    .replace(/\band\b|\bor\b|\bthe\b|\bof\b/g, " ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .split("_").filter(Boolean).slice(0, 3).join("_");
  if (!base) throw new Error(`no English label to slug for "${nameZh}" — fix the capture, do not use the Chinese name as an id`);
  return base;
}

for (const line of lines) {
  let m;
  if ((m = line.match(/^## (.+?)(?: \| (.+))?$/))) {
    if (m[1].trim() === "使用建議") { category = null; continue; }
    category = m[1].trim(); categoryEn = (m[2] || "").trim(); sub = null;
    taxonomy.push({ id: `tdx.${slug(categoryEn, category)}`, level: "category", name_zh: category, name_en: categoryEn, children: [] });
    continue;
  }
  if ((m = line.match(/^### (.+?)(?: \| (.+))?$/))) {
    sub = m[1].trim(); subEn = (m[2] || "").trim();
    const parent = taxonomy[taxonomy.length - 1];
    if (parent) parent.children.push({ id: `tdx.${slug(categoryEn, category)}.${slug(subEn, sub)}`, name_zh: sub, name_en: subEn });
    continue;
  }
  if ((m = line.match(/^- (.+?) \| (.+)$/)) && category && sub) {
    const zh = m[1].trim(), en = m[2].trim();
    const key = `${zh}|${sub}`;
    if (seen.has(key)) continue;            // 氣瘤 and 乳癰 each appear twice
    seen.add(key);
    entries.push({
      name_zh: zh,
      name_en_draft: en,
      category_zh: category, category_en: categoryEn,
      subcategory_zh: sub, subcategory_en: subEn,
      taxonomy_id: `tdx.${slug(categoryEn, category)}.${slug(subEn, sub)}`,
      likely_namespace: BIOMEDICAL_CUE.test(zh) ? "cond" : "tdis",
      needs_source_review: NEEDS_REVIEW.test(en) || undefined,
    });
  }
}

// --- what do we already have? -----------------------------------------------
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const tdis = readJson("data/pathology/tdis_registry.json").records;
const cond = readJson("data/pathology/condition_canon_shortlist.json").records;
const tByName = new Map(tdis.map((r) => [r.name_zh, r.id]));
const cByName = new Map(cond.map((r) => [r.name_zh, r.id]));

let haveT = 0, haveC = 0, missing = 0;
for (const e of entries) {
  if (tByName.has(e.name_zh)) { e.existing_id = tByName.get(e.name_zh); haveT += 1; }
  else if (cByName.has(e.name_zh)) { e.existing_id = cByName.get(e.name_zh); haveC += 1; }
  else missing += 1;
}

const staging = {
  dataset: "知源中醫 disease classification index (staging)",
  source_name: "知源中醫 app",
  capture_method: "screenshots transcribed by a model; English column is a model draft, not a cited edition",
  source_tier: "C",
  review_status: "draft",
  medical_claim_policy: "Taxonomy and name index only. Presence here is NOT content, NOT a diagnosis, and NOT evidence that a name maps to a Western condition.",
  identity_policy: "Import layer, not a namespace (DECISIONS D11). No id here may appear in any relation field. Canon records are created one filled batch at a time in tdis.* or cond.*, never generated from this file.",
  translation_policy: "name_en_draft only. Promote to name_en solely with a cited source.",
  imported_from: path.basename(SRC),
  counts: {
    entries: entries.length,
    already_in_tdis: haveT,
    already_in_cond: haveC,
    not_yet_present: missing,
    flagged_needs_source_review: entries.filter((e) => e.needs_source_review).length,
    likely_cond_by_surface_cue: entries.filter((e) => e.likely_namespace === "cond").length,
  },
  records: entries,
};

const taxonomyOut = {
  dataset: "TCM disease taxonomy (中醫病名科別分類)",
  policy: [
    "Controlled vocabulary for tdis.* records' category/subcategory.",
    "Replaces the free-text classical_source_hint on tdis_registry: those 75 records spell this same taxonomy 22 different ways (中醫內科學·脾胃, 中醫婦科學, 針灸治療學…).",
    "This is a 中醫科別 axis. It does NOT replace condition_category_vocabulary.json, which is a 西醫系統別 axis for cond.* — a record can carry both.",
  ],
  source: "知源中醫 app classification, cross-checked against the 中醫內科學 system names already implied by tdis_registry",
  created: "2026-08-06",
  categories: taxonomy,
};

// --- report -----------------------------------------------------------------
console.log(`${WRITE ? "WROTE" : "DRY RUN"} — 知源中醫 disease index\n`);
console.log(JSON.stringify(staging.counts, null, 2));
console.log(`\ntaxonomy: ${taxonomy.length} categories, ${taxonomy.reduce((n, c) => n + c.children.length, 0)} subcategories`);
console.log("\nper category (entries · already have · new):");
for (const c of taxonomy) {
  const inCat = entries.filter((e) => e.category_zh === c.name_zh);
  const have = inCat.filter((e) => e.existing_id).length;
  console.log(`  ${String(inCat.length).padStart(3)} · ${String(have).padStart(3)} · ${String(inCat.length - have).padStart(3)}  ${c.name_zh}`);
}

if (WRITE) {
  fs.mkdirSync(path.join(ROOT, "data/imports/zhiyuan"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "data/imports/zhiyuan/disease_index.json"), JSON.stringify(staging, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(ROOT, "data/config/tcm_disease_taxonomy.json"), JSON.stringify(taxonomyOut, null, 2) + "\n", "utf8");
  console.log("\nwrote data/imports/zhiyuan/disease_index.json + data/config/tcm_disease_taxonomy.json");
} else {
  console.log("\npass --write to save.");
}
