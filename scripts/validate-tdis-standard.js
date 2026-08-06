#!/usr/bin/env node
/**
 * validate-tdis-standard.js — enforce docs/TDIS_CARD_TEMPLATE.md.
 *
 * The fourth namespace's yardstick (DECISIONS D14: vocabulary → template →
 * validator → then content). Written before any tdis content exists, which is
 * the whole point — every incident in PROJECT_LOG traces to content arriving
 * before its yardstick.
 *
 * Measured baseline, 75 records in data/pathology/tdis_registry.json:
 *   id / name_zh / name_en / pinyin      75/75  — a genuinely clean index
 *   pinyin with tone marks                0/75  — already correct
 *   referenced by >=1 condition          70/75, 0 dangling links
 *   taxonomy_id                           0/75  — still free-text
 *                                                classical_source_hint (22 spellings)
 *   ANY clinical content                  0/75  — no definition, etiology,
 *                                                manifestations, patterns, red flags
 *
 * So this layer is an index, not a card set. T10 and N2 exist to keep that
 * visible: 75 named records must never be reported as "中醫病名 done".
 *
 * ERRORS (exit 1):
 *   T1  missing core identity (id / name_zh / name_en / pinyin)
 *   T2  duplicate id
 *   T3  id is not tdis.<ascii_slug>
 *   T4  no red flags (SAFETY — a 中醫 disease name is what the patient arrives
 *       with; the danger underneath it is biomedical. 眩暈 hides stroke.)
 *   T5  a *_zh field has content but its *_en twin is missing
 *   T6  a relation id does not resolve
 *   T7  an _en array is not index-aligned with its _zh array
 *   T8  unknown field (includes hand-filling a derived reverse — D13)
 *   T9  a *_en field has content but its *_zh twin is missing
 *   T10 taxonomy_id missing / not in the vocabulary, or classical_source_hint
 *       still present (category and classical provenance must be two fields —
 *       merging them is what produced 22 spellings)
 *   T11 pinyin carries tone marks (CLAUDE.md: pinyin is toneless for search)
 *
 * NOTES (reported, do not fail):
 *   N1 no related_patterns — 辨證分型 is this card's irreplaceable section
 *   N2 no clinical content at all — still an index entry, not a card
 *
 *   --worklist            list ids behind the numbers, grouped by taxonomy
 *   --taxonomy <id>       only that branch
 *   --all                 do not truncate
 *   --json                machine-readable summary
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REGISTRY = "data/pathology/tdis_registry.json";
const TAXONOMY = "data/config/tcm_disease_taxonomy.json";
const CONDITIONS = "data/pathology/condition_canon_shortlist.json";
const PATTERN_LIB = "data/pathology/pattern_library.json";
const PATTERN_REG = "data/pathology/pattern_registry.json";

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const isEmpty = (v) => v === undefined || v === null
  || (typeof v === "string" && !v.trim())
  || (Array.isArray(v) && v.length === 0)
  || (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

// --- approved fields (docs/TDIS_CARD_TEMPLATE.md §4) ------------------------
const APPROVED = new Set([
  // 4.1 identity
  "id", "name_zh", "name_en", "pinyin", "pinyin_toned", "aliases_zh", "aliases_en",
  "taxonomy_id", "classical_source", "review_status", "authored_by",
  // 4.2 content
  "definition_zh", "definition_en",
  "etiology_zh", "etiology_en",
  "pathomechanism_zh", "pathomechanism_en",
  "key_manifestations_zh", "key_manifestations_en",
  // edge.tdis_symptoms (D13, descriptive)
  "key_manifestation_ids",
  "associated_manifestations_zh", "associated_manifestations_en",
  "disease_location_zh", "disease_location_en",
  "red_flags_zh", "red_flags_en",
  "treatment_principle_zh", "treatment_principle_en",
  "classical_references_zh", "classical_references_en",
  // 4.3 relations (stored side only — reverses are derived, D13)
  "related_patterns", "related_conditions", "differential_diseases",
  "typical_formulas", "typical_points",
  // 4.4 provenance
  "sources", "field_sources", "source_type",
]);
// T10: the pre-split field. Its value must move into taxonomy_id +
// classical_source before it is removed. Move first, then delete (§0 order).
const LEGACY_TAXONOMY_FIELD = "classical_source_hint";
// T8: reverses that must never be hand-filled (D13).
const DERIVED_FIELDS = ["used_by_conditions"];

const BILINGUAL_PAIRS = [
  ["definition_zh", "definition_en"],
  ["etiology_zh", "etiology_en"],
  ["pathomechanism_zh", "pathomechanism_en"],
  ["key_manifestations_zh", "key_manifestations_en"],
  ["associated_manifestations_zh", "associated_manifestations_en"],
  ["disease_location_zh", "disease_location_en"],
  ["red_flags_zh", "red_flags_en"],
  ["treatment_principle_zh", "treatment_principle_en"],
  ["classical_references_zh", "classical_references_en"],
  ["aliases_zh", "aliases_en"],
];

const ID_RE = /^tdis\.[a-z0-9_]+$/;
const TONE_RE = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀ]/;
const CONTENT_FIELDS = ["definition_zh", "etiology_zh", "pathomechanism_zh", "key_manifestations_zh"];

// --- CLI --------------------------------------------------------------------
const argv = process.argv.slice(2);
const WORKLIST = argv.includes("--worklist");
const SHOW_ALL = argv.includes("--all");
const AS_JSON = argv.includes("--json");
const taxIdx = argv.indexOf("--taxonomy");
const ONLY_TAX = taxIdx >= 0 ? argv[taxIdx + 1] : null;

// --- load -------------------------------------------------------------------
const records = readJson(REGISTRY).records || [];

// Flatten the taxonomy to the set of assignable ids. Only leaves are
// assignable — a record classified at category level (tdx.internal_medicine)
// has not actually been classified.
const taxonomy = readJson(TAXONOMY).categories || [];
const LEAF_IDS = new Set();
const TAX_LABEL = new Map();
for (const cat of taxonomy) {
  TAX_LABEL.set(cat.id, cat.name_zh);
  for (const child of cat.children || []) {
    LEAF_IDS.add(child.id);
    TAX_LABEL.set(child.id, `${cat.name_zh}·${child.name_zh}`);
  }
}

const knownConditionIds = new Set((readJson(CONDITIONS).records || []).map((r) => r.id));
const knownPatternIds = new Set([
  ...(readJson(PATTERN_LIB).records || []).map((r) => r.id),
  ...(readJson(PATTERN_REG).records || []).map((r) => r.id),
]);
const knownTdisIds = new Set(records.map((r) => r.id));

const scope = ONLY_TAX ? records.filter((r) => String(r.taxonomy_id || "").startsWith(ONLY_TAX)) : records;

// --- checks -----------------------------------------------------------------
const defects = [];
const notes = [];
const seen = new Set();

for (const rec of scope) {
  const id = rec.id || "(no id)";
  const branch = TAX_LABEL.get(rec.taxonomy_id) || "(unclassified)";
  const add = (code, detail) => defects.push({ code, id, branch, detail });

  // T1
  const missing = ["id", "name_zh", "name_en", "pinyin"].filter((f) => isEmpty(rec[f]));
  if (missing.length) add("T1", `missing ${missing.join(", ")}`);

  // T2
  if (rec.id) {
    if (seen.has(rec.id)) add("T2", "duplicate id");
    else seen.add(rec.id);
  }

  // T3
  if (rec.id && !ID_RE.test(rec.id)) add("T3", `"${rec.id}" is not tdis.<ascii_slug>`);

  // T4 — safety
  if (isEmpty(rec.red_flags_zh) && isEmpty(rec.red_flags_en)) {
    add("T4", "no red_flags_zh and no red_flags_en — a 中醫 disease name is what the patient arrives with; the danger under it is biomedical");
  }

  // T5 / T7 / T9 — bilingual
  for (const [zh, en] of BILINGUAL_PAIRS) {
    const hasZh = !isEmpty(rec[zh]);
    const hasEn = !isEmpty(rec[en]);
    if (hasZh && !hasEn) add("T5", `${zh} filled but ${en} empty`);
    if (hasEn && !hasZh) add("T9", `${en} filled but ${zh} empty`);
    if (hasZh && hasEn && Array.isArray(rec[zh]) && Array.isArray(rec[en])
        && rec[zh].length !== rec[en].length) {
      add("T7", `${zh}[${rec[zh].length}] vs ${en}[${rec[en].length}] — English renders against the wrong item`);
    }
  }

  // T6 — relations resolve
  const rel = [
    ["related_patterns", knownPatternIds],
    ["related_conditions", knownConditionIds],
    ["differential_diseases", knownTdisIds],
  ];
  for (const [field, universe] of rel) {
    for (const ref of rec[field] || []) {
      const refId = typeof ref === "string" ? ref : ref && ref.id;
      if (!refId) add("T6", `${field} entry has no id`);
      else if (!universe.has(refId)) add("T6", `${field} "${refId}" does not resolve`);
    }
  }

  // T8 — unknown / hand-filled derived
  for (const f of Object.keys(rec)) {
    if (DERIVED_FIELDS.includes(f)) {
      add("T8", `"${f}" is a DERIVED reverse — never hand-filled (D13)`);
    } else if (!APPROVED.has(f) && f !== LEGACY_TAXONOMY_FIELD) {
      add("T8", `unknown field "${f}" — not in docs/TDIS_CARD_TEMPLATE.md §4`);
    }
  }

  // T10 — classification
  if (LEGACY_TAXONOMY_FIELD in rec) {
    add("T10", `still uses "${LEGACY_TAXONOMY_FIELD}" ("${rec[LEGACY_TAXONOMY_FIELD]}") — split it: the 科別/系 part into taxonomy_id, the 典籍 part into classical_source. MOVE first, then remove.`);
  }
  if (isEmpty(rec.taxonomy_id)) {
    add("T10", `missing taxonomy_id (from ${TAXONOMY})`);
  } else if (!LEAF_IDS.has(rec.taxonomy_id)) {
    add("T10", TAX_LABEL.has(rec.taxonomy_id)
      ? `taxonomy_id "${rec.taxonomy_id}" is a category, not a leaf — classify to a subcategory`
      : `taxonomy_id "${rec.taxonomy_id}" is not in ${TAXONOMY}`);
  }

  // T11 — toneless pinyin
  if (typeof rec.pinyin === "string" && TONE_RE.test(rec.pinyin)) {
    add("T11", `pinyin "${rec.pinyin}" carries tone marks — pinyin is toneless for search; use pinyin_toned for display`);
  }

  // notes
  if (isEmpty(rec.related_patterns)) {
    notes.push({ code: "N1", id, detail: "no related_patterns — 辨證分型 is this card's irreplaceable section" });
  }
  if (CONTENT_FIELDS.every((f) => isEmpty(rec[f]))) {
    notes.push({ code: "N2", id, detail: "index entry only — no definition, etiology, pathomechanism or manifestations" });
  }
}

// --- report -----------------------------------------------------------------
const LABEL = {
  T1: "missing core identity",
  T2: "duplicate id",
  T3: "id outside the tdis.* namespace",
  T4: "NO RED FLAGS (safety)",
  T5: "_zh filled but _en empty",
  T6: "relation id does not resolve",
  T7: "array index misalignment",
  T8: "unknown or hand-filled derived field",
  T10: "classification missing / unsplit",
  T9: "_en filled but _zh empty",
  T11: "pinyin has tone marks",
};
const byCode = {};
for (const d of defects) (byCode[d.code] ||= []).push(d);
const clean = scope.filter((r) => !defects.some((d) => d.id === r.id)).length;
const noteCounts = {};
for (const n of notes) noteCounts[n.code] = (noteCounts[n.code] || 0) + 1;

if (AS_JSON) {
  console.log(JSON.stringify({
    file: REGISTRY,
    scope: ONLY_TAX || "all",
    records: scope.length,
    clean,
    defects: defects.length,
    by_code: Object.fromEntries(Object.entries(byCode).map(([k, v]) => [k, v.length])),
    notes: noteCounts,
  }, null, 2));
} else {
  console.log(`validate-tdis-standard — ${REGISTRY}`);
  console.log(`scope: ${ONLY_TAX || "all branches"} · ${scope.length} records · ${clean} clean\n`);
  for (const code of Object.keys(LABEL)) {
    const list = byCode[code];
    if (!list) continue;
    const ids = [...new Set(list.map((d) => d.id))];
    console.log(`${code}  ${LABEL[code]} — ${list.length} defect(s) across ${ids.length} record(s)`);
    if (WORKLIST) {
      const shown = SHOW_ALL ? ids : ids.slice(0, 8);
      console.log(`    ${shown.join(", ")}${ids.length > shown.length ? ` … +${ids.length - shown.length} more (--all)` : ""}`);
      console.log(`    e.g. ${list[0].id}: ${list[0].detail}`);
    }
    console.log("");
  }
  for (const [code, n] of Object.entries(noteCounts)) {
    console.log(`${code}  ${n} record(s) — ${notes.find((x) => x.code === code).detail} (note only)`);
  }
  console.log("");
  console.log(defects.length === 0
    ? "PASS — 0 blocking defects."
    : `FAIL — ${defects.length} blocking defect(s). Run with --worklist to see the ids.`);
}

process.exit(defects.length === 0 ? 0 : 1);
