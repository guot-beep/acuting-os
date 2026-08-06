#!/usr/bin/env node
/**
 * validate-symptom-standard.js — enforce docs/SYMPTOM_CARD_TEMPLATE.md.
 *
 * The fourth namespace's yardstick, and the last of D14's four parts to land
 * for sym.*. Written while the layer has ZERO records — which is the whole
 * point of the build order (vocabulary → template → validator → content).
 * Every incident in PROJECT_LOG is content arriving before its yardstick.
 *
 * The records file does not exist yet. That is reported as a state, not an
 * error: a namespace with a vocabulary, a template and a validator but no
 * content is correctly built and honestly empty. 129 candidates sit in
 * data/config/symptom_taxonomy.json as a gap map.
 *
 * ERRORS (exit 1):
 *   Y1  missing core identity (id / name_zh / name_en / pinyin)
 *   Y2  duplicate id
 *   Y3  id is not sym.<ascii_slug>
 *   Y4  no red flags (SAFETY — a patient does not say "I have a subarachnoid
 *       haemorrhage", she says "my head hurts". The red flag has to hang on
 *       the symptom to catch anything.)
 *   Y5  a *_zh field has content but its *_en twin is missing
 *   Y6  a relation id does not resolve (including differentiation.points_to)
 *   Y7  an _en array is not index-aligned with its _zh array
 *   Y8  unknown field (includes hand-filling a derived reverse — D13)
 *   Y9  a *_en field has content but its *_zh twin is missing
 *   Y10 taxonomy_ids missing or not in data/config/symptom_taxonomy.json
 *   Y11 tradition missing or outside biomedical|tcm|both
 *   Y12 pinyin carries tone marks
 *
 * NOTES (reported, do not fail):
 *   N1 no differentiation — the section that makes a symptom card clinical
 *   N2 no inquiry dimensions
 *
 *   --worklist  --taxonomy sym.pain  --all  --json
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const RECORDS = "data/symptoms/symptoms.json";
const TAXONOMY = "data/config/symptom_taxonomy.json";
const CONDITIONS = "data/pathology/condition_canon_shortlist.json";
const TDIS = "data/pathology/tdis_registry.json";
const PATTERN_LIB = "data/pathology/pattern_library.json";
const PATTERN_REG = "data/pathology/pattern_registry.json";

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const isEmpty = (v) => v === undefined || v === null
  || (typeof v === "string" && !v.trim())
  || (Array.isArray(v) && v.length === 0)
  || (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

const APPROVED = new Set([
  // 4.1 identity
  "id", "name_zh", "name_en", "pinyin", "pinyin_toned", "aliases_zh", "aliases_en",
  "taxonomy_ids", "tradition", "review_status", "authored_by",
  // 4.2 description
  "definition_zh", "definition_en", "patient_words_zh", "patient_words_en",
  // 4.3 / 4.4 the two sections that make this a clinical card
  "inquiry_zh", "inquiry_en", "differentiation_zh", "differentiation_en",
  // 4.5 safety
  "red_flags_zh", "red_flags_en",
  // 4.6 relations (stored side only — reverses are derived, D13)
  "seen_in_tdis", "seen_in_conditions", "suggests_patterns",
  // 4.7 provenance
  "sources", "field_sources", "source_type",
]);
const DERIVED_FIELDS = ["used_by_conditions", "used_by_tdis", "used_by_patterns"];

const BILINGUAL_PAIRS = [
  ["definition_zh", "definition_en"],
  ["patient_words_zh", "patient_words_en"],
  ["inquiry_zh", "inquiry_en"],
  ["differentiation_zh", "differentiation_en"],
  ["red_flags_zh", "red_flags_en"],
  ["aliases_zh", "aliases_en"],
];

const ID_RE = /^sym\.[a-z0-9_]+$/;
const TONE_RE = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀ]/;
const TRADITIONS = new Set(["biomedical", "tcm", "both"]);

const argv = process.argv.slice(2);
const WORKLIST = argv.includes("--worklist");
const SHOW_ALL = argv.includes("--all");
const AS_JSON = argv.includes("--json");
const taxIdx = argv.indexOf("--taxonomy");
const ONLY_TAX = taxIdx >= 0 ? argv[taxIdx + 1] : null;

// --- load -------------------------------------------------------------------
const taxonomy = readJson(TAXONOMY);
const TAX_IDS = new Set((taxonomy.categories || []).map((c) => c.id));
const records = exists(RECORDS) ? (readJson(RECORDS).records || []) : null;

if (records === null) {
  const summary = {
    file: RECORDS,
    state: "namespace built, no records yet",
    vocabulary: `${TAX_IDS.size} categories in ${TAXONOMY}`,
    candidates_in_gap_map: (taxonomy.candidates || []).length,
    note: "D14 build order: vocabulary, template and validator exist; content is next. Records are created one sourced batch at a time, never generated from the candidate list.",
  };
  console.log(AS_JSON ? JSON.stringify({ ...summary, records: 0, clean: 0, defects: 0, by_code: {} }, null, 2)
    : `validate-symptom-standard — ${RECORDS}\n\n  ${summary.state}\n  vocabulary: ${summary.vocabulary}\n  candidates in the gap map: ${summary.candidates_in_gap_map}\n\n  ${summary.note}\n\nPASS — nothing to validate yet.`);
  process.exit(0);
}

const knownConditionIds = new Set((readJson(CONDITIONS).records || []).map((r) => r.id));
const knownTdisIds = new Set((readJson(TDIS).records || []).map((r) => r.id));
const knownPatternIds = new Set([
  ...(readJson(PATTERN_LIB).records || []).map((r) => r.id),
  ...(readJson(PATTERN_REG).records || []).map((r) => r.id),
]);

const scope = ONLY_TAX ? records.filter((r) => (r.taxonomy_ids || []).includes(ONLY_TAX)) : records;

// --- checks -----------------------------------------------------------------
const defects = [];
const notes = [];
const seen = new Set();

for (const rec of scope) {
  const id = rec.id || "(no id)";
  const add = (code, detail) => defects.push({ code, id, detail });

  const missing = ["id", "name_zh", "name_en", "pinyin"].filter((f) => isEmpty(rec[f]));
  if (missing.length) add("Y1", `missing ${missing.join(", ")}`);

  if (rec.id) {
    if (seen.has(rec.id)) add("Y2", "duplicate id");
    else seen.add(rec.id);
  }
  if (rec.id && !ID_RE.test(rec.id)) add("Y3", `"${rec.id}" is not sym.<ascii_slug>`);

  if (isEmpty(rec.red_flags_zh) && isEmpty(rec.red_flags_en)) {
    add("Y4", "no red flags — a patient reports the symptom, not the diagnosis; the flag has to hang here to catch anything");
  }

  for (const [zh, en] of BILINGUAL_PAIRS) {
    const hasZh = !isEmpty(rec[zh]);
    const hasEn = !isEmpty(rec[en]);
    if (hasZh && !hasEn) add("Y5", `${zh} filled but ${en} empty`);
    if (hasEn && !hasZh) add("Y9", `${en} filled but ${zh} empty`);
    if (hasZh && hasEn && Array.isArray(rec[zh]) && Array.isArray(rec[en])
        && rec[zh].length !== rec[en].length) {
      add("Y7", `${zh}[${rec[zh].length}] vs ${en}[${rec[en].length}] — English renders against the wrong item`);
    }
  }

  const rel = [
    ["seen_in_tdis", knownTdisIds],
    ["seen_in_conditions", knownConditionIds],
    ["suggests_patterns", knownPatternIds],
  ];
  for (const [field, universe] of rel) {
    for (const ref of rec[field] || []) {
      const refId = typeof ref === "string" ? ref : ref && ref.id;
      if (!refId) add("Y6", `${field} entry has no id`);
      else if (!universe.has(refId)) add("Y6", `${field} "${refId}" does not resolve`);
    }
  }
  // differentiation.points_to is a relation too — the whole point of the card.
  for (const d of rec.differentiation_zh || []) {
    for (const pid of (d && d.points_to) || []) {
      if (!knownPatternIds.has(pid)) add("Y6", `differentiation "${d.variant || "?"}" points_to "${pid}" does not resolve`);
    }
  }

  for (const f of Object.keys(rec)) {
    if (DERIVED_FIELDS.includes(f)) add("Y8", `"${f}" is a DERIVED reverse — never hand-filled (D13)`);
    else if (!APPROVED.has(f)) add("Y8", `unknown field "${f}" — not in docs/SYMPTOM_CARD_TEMPLATE.md §4`);
  }

  const taxIds = rec.taxonomy_ids || [];
  if (!taxIds.length) add("Y10", `missing taxonomy_ids (from ${TAXONOMY})`);
  for (const t of taxIds) if (!TAX_IDS.has(t)) add("Y10", `taxonomy_id "${t}" is not in ${TAXONOMY}`);

  if (isEmpty(rec.tradition)) add("Y11", "missing tradition");
  else if (!TRADITIONS.has(rec.tradition)) add("Y11", `tradition "${rec.tradition}" is not ${[...TRADITIONS].join(" | ")}`);

  if (typeof rec.pinyin === "string" && TONE_RE.test(rec.pinyin)) {
    add("Y12", `pinyin "${rec.pinyin}" carries tone marks`);
  }

  if (isEmpty(rec.differentiation_zh)) notes.push({ code: "N1", id, detail: "no differentiation — the section that makes a symptom card clinical rather than a dictionary entry" });
  if (isEmpty(rec.inquiry_zh)) notes.push({ code: "N2", id, detail: "no inquiry dimensions" });
}

// --- report -----------------------------------------------------------------
const LABEL = {
  Y1: "missing core identity", Y2: "duplicate id", Y3: "id outside sym.*",
  Y4: "NO RED FLAGS (safety)", Y5: "_zh filled but _en empty",
  Y6: "relation id does not resolve", Y7: "array index misalignment",
  Y8: "unknown or hand-filled derived field", Y9: "_en filled but _zh empty",
  Y10: "taxonomy_ids missing / unknown", Y11: "tradition missing / invalid",
  Y12: "pinyin has tone marks",
};
const byCode = {};
for (const d of defects) (byCode[d.code] ||= []).push(d);
const clean = scope.filter((r) => !defects.some((d) => d.id === r.id)).length;
const noteCounts = {};
for (const n of notes) noteCounts[n.code] = (noteCounts[n.code] || 0) + 1;

if (AS_JSON) {
  console.log(JSON.stringify({
    file: RECORDS, scope: ONLY_TAX || "all", records: scope.length, clean,
    defects: defects.length,
    by_code: Object.fromEntries(Object.entries(byCode).map(([k, v]) => [k, v.length])),
    notes: noteCounts,
  }, null, 2));
} else {
  console.log(`validate-symptom-standard — ${RECORDS}`);
  console.log(`scope: ${ONLY_TAX || "all"} · ${scope.length} records · ${clean} clean\n`);
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
  console.log(defects.length === 0 ? "PASS — 0 blocking defects."
    : `FAIL — ${defects.length} blocking defect(s). Run with --worklist to see the ids.`);
}

process.exit(defects.length === 0 ? 0 : 1);
