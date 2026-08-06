#!/usr/bin/env node
/**
 * build-cloudtcm-ref-map.js — dissolve CloudTCM's parallel classification into
 * the canonical namespaces.
 *
 * Ting: 「請把雲端中醫不要設自己的歸類，把全部融合到其他中西醫病名或是證型上」
 *       「但他的分類很專業」「因為兩套不同系統 但相似的名字」
 *
 * All three observations are correct at once, and the measurement explains how:
 *
 *   46 entries   現代疾病 Modern Medical Conditions   -> these are 病名
 *   144 entries  13 symptom categories by body region -> these are 症狀
 *                (疼痛症狀 44 · 全身及四肢 20 · 頭面 30 · 大小便 14 · 飲食腸胃 14
 *                 · 精神狀態 8 · 眼科 8 · 胸部呼吸 7 · 女性 6 · 皮膚 5 · 男性 2 …)
 *
 * So the taxonomy IS professional — as a SYMPTOM axis, which is exactly the
 * `sym.*` namespace D11 left unbuilt for want of a consumer. The consumer is
 * these 144 records: they have exact source pages and diagrams and nowhere to
 * live. That is why only 19/190 matched a disease record; the rest were never
 * diseases.
 *
 * And 「兩套不同系統但相似的名字」 is the reason this does NOT merge by name
 * beyond exact matches. CloudTCM's 濕疹 and our 濕瘡, its 氣喘 and our 哮病,
 * are the same clinical territory described by two systems — deciding they are
 * one entity is a clinical judgement (D11: same string ≠ same entity, and
 * 痺證/痛風 shows how a plausible pair can be a category and one disease
 * inside it). Candidates are emitted, never merged.
 *
 * Outputs:
 *   data/config/cloudtcm_ref_map.json    joins source pages + images onto
 *                                        the canonical disease/pattern records
 *   data/config/symptom_taxonomy.json    the symptom axis, seeded from the 13
 *                                        categories (D14 part 1 for sym.*)
 *
 * The map is a separate derived file, not fields written into 225 records:
 * data/pathology/** belongs to another line, and a value copied into every
 * record has to be un-copied by hand when the import refreshes (D13: join at
 * render time, store once).
 *
 *   node scripts/build-cloudtcm-ref-map.js
 *   node scripts/build-cloudtcm-ref-map.js --write
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REF_OUT = "data/config/cloudtcm_ref_map.json";
const SYM_OUT = "data/config/symptom_taxonomy.json";
const WRITE = process.argv.includes("--write");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const norm = (s) => String(s || "")
  .replace(/[\s　（）()·、,，。;；:：]/g, "")
  .replace(/證$/, "")
  .trim();

// ASCII ids only (D10). Slug from the English label the source already carries.
const slug = (en, zh) => {
  const s = String(en || "").toLowerCase()
    .replace(/\b(and|or|the|of|specific|symptoms?|conditions?)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
    .split("_").filter(Boolean).slice(0, 3).join("_");
  if (!s) throw new Error(`no English label to slug for "${zh}"`);
  return s;
};

const entries = readJson("data/pathology/cloudtcm_disease_entries.json").records || [];
const categories = readJson("data/pathology/cloudtcm_disease_categories.json").records || [];
const conds = readJson("data/pathology/condition_canon_shortlist.json").records || [];
const tdis = readJson("data/pathology/tdis_registry.json").records || [];
const patterns = readJson("data/pathology/pattern_library.json").records || [];

const catById = new Map(categories.map((c) => [c.id, c]));
// The one disease category. Everything else is a symptom axis.
const DISEASE_CATEGORY = categories.find((c) => /現代疾病/.test(c.name_zh));

const index = new Map();
const addAll = (records, ns) => records.forEach((r) => {
  for (const name of [r.name_zh, ...(r.aliases_zh || [])]) {
    const k = norm(name);
    if (k && !index.has(k)) index.set(k, { id: r.id, ns });
  }
});
addAll(conds, "cond");     // cond first: a name in both spaces is two entities (D11)
addAll(tdis, "tdis");
addAll(patterns, "pattern");

const refs = {};
const matchedCounts = { cond: 0, tdis: 0, pattern: 0 };
const diseaseGap = [];     // 現代疾病 with no canonical record yet -> cond.* gap map
const symptomSeed = [];    // the symptom axis -> sym.* gap map

for (const e of entries) {
  const isDisease = DISEASE_CATEGORY && (e.category_ids || []).includes(DISEASE_CATEGORY.id);
  const hit = index.get(norm(e.name_zh));
  const payload = {
    source_id: e.id,
    name_zh: e.name_zh,
    name_en_draft: e.name_en,
    source_url: e.source_url,
    image_url: e.image_url || undefined,
  };

  if (hit) {
    (refs[hit.id] ||= []).push(payload);
    matchedCounts[hit.ns] += 1;
    continue;
  }
  if (isDisease) {
    diseaseGap.push(payload);
  } else {
    symptomSeed.push({
      ...payload,
      taxonomy_ids: (e.category_ids || []).map((id) => {
        const c = catById.get(id);
        return c ? `sym.${slug(c.name_en, c.name_zh)}` : id;
      }),
    });
  }
}

const refMap = {
  dataset: "CloudTCM source pages joined to canonical records",
  policy: [
    "Ting 2026-08-06: CloudTCM keeps no classification of its own. Its 現代疾病 entries join cond.*; its 13 symptom categories become the sym.* axis (data/config/symptom_taxonomy.json); its category bar is retired from the UI.",
    "Derived — rebuilt by scripts/build-cloudtcm-ref-map.js. Never hand-edit. Never copy these values into the records themselves (D13: join at render time, store once).",
    "cloudtcm.* ids stay provenance handles and never appear in a relation field (D11).",
    "Exact-name matching only. Two systems can use similar names for different entities (濕疹/濕瘡, 氣喘/哮病) — those are candidates for human review, never auto-merged.",
  ],
  generated_by: "scripts/build-cloudtcm-ref-map.js",
  counts: {
    source_entries: entries.length,
    matched_to_canonical: matchedCounts.cond + matchedCounts.tdis + matchedCounts.pattern,
    matched_by_namespace: matchedCounts,
    canonical_records_with_a_source_page: Object.keys(refs).length,
    disease_gap_for_cond: diseaseGap.length,
    symptom_seed_for_sym: symptomSeed.length,
  },
  refs,
  disease_gap_candidates: diseaseGap,
};

const symTaxonomy = {
  dataset: "Symptom taxonomy (sym.* axis)",
  policy: [
    "Controlled vocabulary for the fourth namespace (D11). Seeded from CloudTCM's 13 symptom categories, which are a body-region/system symptom axis — a genuinely professional one, and the axis this repo lacked.",
    "A symptom is ONE namespace, not two: 頭痛 and headache are one observation in two languages (D11). TCM-only observations (口苦, 舌淡) carry a `tradition` tag rather than a second id space.",
    "sym.* records do not exist yet. This is the vocabulary and the gap map; records are born when someone fills them from a real source (D14 build order).",
  ],
  source: "CloudTCM 症狀分類 (13 categories, 144 entries), 2026-08-06",
  created: "2026-08-06",
  categories: categories
    .filter((c) => !DISEASE_CATEGORY || c.id !== DISEASE_CATEGORY.id)
    .map((c) => ({
      id: `sym.${slug(c.name_en, c.name_zh)}`,
      name_zh: c.name_zh,
      name_en: c.name_en,
      source_category_id: c.id,
      entry_count: entries.filter((e) => (e.category_ids || []).includes(c.id)).length,
    })),
  ungrouped_note: "現代疾病 is deliberately absent: those 46 entries are 病名 and belong to cond.*, not to the symptom axis.",
  candidates: symptomSeed,
};

console.log((WRITE ? "WROTE" : "DRY RUN") + " — CloudTCM dissolved into the canonical namespaces\n");
console.log(JSON.stringify(refMap.counts, null, 2));
console.log(`\nsym.* axis: ${symTaxonomy.categories.length} categories, ${symptomSeed.length} candidate symptoms`);
symTaxonomy.categories.forEach((c) => console.log(`  ${String(c.entry_count).padStart(3)}  ${c.id.padEnd(28)}${c.name_zh}`));

if (WRITE) {
  fs.writeFileSync(path.join(ROOT, REF_OUT), JSON.stringify(refMap, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(ROOT, SYM_OUT), JSON.stringify(symTaxonomy, null, 2) + "\n", "utf8");
  console.log(`\nwrote ${REF_OUT} + ${SYM_OUT}`);
} else {
  console.log("\npass --write to save.");
}
