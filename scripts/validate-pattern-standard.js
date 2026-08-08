#!/usr/bin/env node
/**
 * validate-pattern-standard.js — enforce docs/PATTERN_CARD_TEMPLATE.md.
 *
 * Written 2026-08-06, BEFORE the pattern fill sprint. The condition validator's
 * twin. Measured baseline on the 50 records in pattern_library.json:
 *
 *   sources          0/50   — not one record has any provenance at all
 *   key_signs_en     0/50   — Chinese only
 *   tongue/pulse     50/50 on the OLD language-less field names
 *   typical_points   0/50   — field exists, every value is []
 *   typical_formulas 0/50   — same
 *   contraindications 0/50  — no safety layer
 *   differential      0/50  — no discrimination from neighbouring patterns
 *
 * What is GOOD and must not be destroyed: key_signs_zh, tongue, pulse and
 * treatment_principle are filled 50/50 and treatment_principle is 50 unique
 * strings — per-record writing, not a template. §0 只加深不刪除 applies.
 *
 * ERRORS (exit 1):
 *   P1 missing core identity (id / name_zh / name_en / pattern_family)
 *   P2 duplicate id
 *   P3 id is not pattern.<ascii_slug>  (includes the retired pat.<中文> space)
 *   P4 no provenance at all (sources and field_sources both empty)
 *   P5 a *_zh field has content but its *_en twin is missing (or reverse)
 *   P6 a differential_patterns / related_conditions id does not resolve
 *   P7 an _en array is not index-aligned with its _zh array
 *   P8 unknown field (the additionalProperties:false equivalent)
 *   P9 tongue/pulse still on the language-less legacy field name
 *
 * NOTES (reported, do not fail):
 *   N1 no differential_patterns — the one thing a pattern card is uniquely for
 *   N2 no treatment links at all (typical_points and typical_formulas empty)
 *
 *   --worklist          list the ids behind the numbers, grouped by family
 *   --family 臟腑        only that pattern_family
 *   --all               do not truncate
 *   --json              machine-readable summary
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const LIBRARY = "data/pathology/pattern_library.json";
const REGISTRY = "data/pathology/pattern_registry.json";
const CONDITIONS = "data/pathology/condition_canon_shortlist.json";
const FAMILY_VOCAB = "data/config/pattern_family_vocabulary.json";

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const isEmpty = (v) => v === undefined || v === null
  || (typeof v === "string" && !v.trim())
  || (Array.isArray(v) && v.length === 0)
  || (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

// --- approved fields (docs/PATTERN_CARD_TEMPLATE.md §4) ---------------------
const APPROVED = new Set([
  // 4.1 identity
  "id", "name_zh", "name_en", "pinyin", "pinyin_toned", "aliases_zh", "aliases_en",
  "pattern_family", "secondary_family", "review_status", "authored_by", "legacy_ids",
  "deprecated_note_zh", "deprecated_note_en",
  // 4.2 positioning
  "eight_principles", "zang_fu", "qi_blood_fluid", "root_or_branch",
  // 4.3 mechanism
  "mechanism_zh", "mechanism_en", "common_causes_zh", "common_causes_en",
  "progression_zh", "progression_en",
  // 4.4 presentation
  "key_signs_zh", "key_signs_en",
  // edge.pattern_symptoms (D13, descriptive). ADDITIVE: key_signs_zh stays as
  // display fallback until sym.* coverage is sufficient (§0 只加深不刪除).
  "key_signs_ids", "supporting_signs_zh", "supporting_signs_en",
  "tongue_zh", "tongue_en", "pulse_zh", "pulse_en",
  "emotional_features_zh", "emotional_features_en",
  // 4.5 differential
  "differential_patterns",
  // 4.6 treatment
  "treatment_principle_zh", "treatment_principle_en",
  "typical_formulas", "formula_modifications_zh", "formula_modifications_en",
  "typical_points", "point_rationale_zh", "point_rationale_en",
  "lifestyle_zh", "lifestyle_en",
  // 4.7 safety
  "contraindications_zh", "contraindications_en", "cautions_zh", "cautions_en",
  "mistreatment_consequence_zh", "mistreatment_consequence_en",
  // 4.8 relations + provenance.
  // related_conditions is NOT here: it is the derived reverse of
  // cond.related_patterns (D13). Hand-filling it lands as P8 by design.
  "sources", "field_sources", "source_type",
  /* ---- v1.0 import vocabulary, reviewed and adopted 2026-08-06 -------------
   * Merge 11f37a9 brought 17 pattern records in under a schema a content agent
   * invented (it should not have — schema is not theirs to change). But the
   * fields hold real content: eight-principles classification, exam pearls, a
   * differentiation write-up, and entity links. Rejecting them would mean
   * deleting sourced content, which §0 forbids, so they are adopted here and
   * documented in PATTERN_CARD_TEMPLATE.md §4.9 rather than left permanently
   * "unknown" — a template that does not describe what the records actually
   * contain is how the two vocabularies drifted apart in the first place.
   * Everything with a canonical home was already migrated by
   * scripts/migrate-pattern-v1-vocabulary.js; these are the ones with none.
   * NOT a relaxation: P1/P4/P5 still report every genuine gap, and P5 rose
   * 50 -> 134 after the migration because the missing English is now visible. */
  "entity_type", "schema_version", "created_at", "updated_at", "last_reviewed_at",
  "short_summary_zh", "short_summary_en",
  "key_manifestations_zh", "key_manifestations_en", "key_manifestation_ids",
  "differentiation_preview_zh", "differentiation_preview_en",
  "eight_principles", "zang_fu_ids", "qi_blood_fluid_ids", "pathogenic_factor_ids",
  "related_tcm_disease_ids", "related_biomedical_condition_ids",
  "tag_ids", "exam_pearls_zh",
]);
// P9: pre-bilingual field names still in the data. Migrate value first, then drop.
const LEGACY_FIELDS = ["tongue", "pulse"];

const BILINGUAL_PAIRS = [
  ["key_signs_zh", "key_signs_en"],
  ["supporting_signs_zh", "supporting_signs_en"],
  ["tongue_zh", "tongue_en"],
  ["pulse_zh", "pulse_en"],
  ["mechanism_zh", "mechanism_en"],
  ["common_causes_zh", "common_causes_en"],
  ["progression_zh", "progression_en"],
  ["treatment_principle_zh", "treatment_principle_en"],
  ["formula_modifications_zh", "formula_modifications_en"],
  ["point_rationale_zh", "point_rationale_en"],
  ["lifestyle_zh", "lifestyle_en"],
  ["contraindications_zh", "contraindications_en"],
  ["cautions_zh", "cautions_en"],
  ["mistreatment_consequence_zh", "mistreatment_consequence_en"],
  ["emotional_features_zh", "emotional_features_en"],
  ["aliases_zh", "aliases_en"],
];

const ID_RE = /^pattern\.[a-z0-9_]+$/;

// --- CLI --------------------------------------------------------------------
const argv = process.argv.slice(2);
const WORKLIST = argv.includes("--worklist");
const SHOW_ALL = argv.includes("--all");
const AS_JSON = argv.includes("--json");
const famIdx = argv.indexOf("--family");
const ONLY_FAMILY = famIdx >= 0 ? argv[famIdx + 1] : null;

// --- load -------------------------------------------------------------------
const library = readJson(LIBRARY).records || [];
const registry = readJson(REGISTRY).records || [];
const knownPatternIds = new Set([...library, ...registry].map((r) => r.id));
const knownConditionIds = new Set((readJson(CONDITIONS).records || []).map((r) => r.id));
const FAMILY_IDS = new Set((readJson(FAMILY_VOCAB).records || []).map((r) => r.id));

const scope = ONLY_FAMILY ? library.filter((r) => r.pattern_family === ONLY_FAMILY) : library;

// --- checks -----------------------------------------------------------------
const defects = [];
const notes = [];
const seen = new Map();

for (const rec of scope) {
  const id = rec.id || "(no id)";
  const fam = rec.pattern_family || "(no family)";
  const add = (code, detail) => defects.push({ code, id, family: fam, detail });

  // P1 — identity, and pattern_family must come from the controlled vocabulary
  // (data/config/pattern_family_vocabulary.json). An unlisted value is a defect
  // by design: 辨證體系 is a closed set, and a free-text one is how tdis ended
  // up with 22 spellings of the same taxonomy.
  const missing = ["id", "name_zh", "name_en", "pattern_family"].filter((f) => isEmpty(rec[f]));
  if (missing.length) add("P1", `missing ${missing.join(", ")}`);
  if (!isEmpty(rec.pattern_family) && !FAMILY_IDS.has(rec.pattern_family)) {
    add("P1", `pattern_family "${rec.pattern_family}" is not in ${FAMILY_VOCAB} (allowed: ${[...FAMILY_IDS].join(" | ")})`);
  }

  // P2
  if (rec.id) {
    if (seen.has(rec.id)) add("P2", "duplicate id");
    else seen.set(rec.id, true);
  }

  // P3 — namespace (DECISIONS D10)
  if (rec.id && !ID_RE.test(rec.id)) {
    add("P3", String(rec.id).startsWith("pat.")
      ? `"${rec.id}" uses the retired pat.* namespace — register as pattern.<english_slug> and map via data/config/pattern_alias_map.json (D10)`
      : `"${rec.id}" is not pattern.<ascii_slug>`);
  }

  // P4 — provenance
  if (isEmpty(rec.sources) && isEmpty(rec.field_sources)) add("P4", "no sources and no field_sources");

  // P5 / P7 — bilingual
  for (const [zh, en] of BILINGUAL_PAIRS) {
    const hasZh = !isEmpty(rec[zh]);
    const hasEn = !isEmpty(rec[en]);
    if (hasZh && !hasEn) add("P5", `${zh} filled but ${en} empty`);
    if (hasEn && !hasZh) add("P5", `${en} filled but ${zh} empty`);
    if (hasZh && hasEn && Array.isArray(rec[zh]) && Array.isArray(rec[en])
        && rec[zh].length !== rec[en].length) {
      add("P7", `${zh}[${rec[zh].length}] vs ${en}[${rec[en].length}] — index misalignment renders English against the wrong item`);
    }
  }

  // P6 — relations resolve
  for (const d of rec.differential_patterns || []) {
    const pid = typeof d === "string" ? d : d.pattern_id;
    if (!pid) add("P6", "differential_patterns entry has no pattern_id");
    else if (!knownPatternIds.has(pid)) add("P6", `differential_patterns "${pid}" does not resolve`);
  }
  for (const cid of rec.related_conditions || []) {
    if (!knownConditionIds.has(cid)) add("P6", `related_conditions "${cid}" does not resolve`);
  }

  // P8 — unknown fields
  for (const f of Object.keys(rec)) {
    if (!APPROVED.has(f) && !LEGACY_FIELDS.includes(f)) {
      add("P8", `unknown field "${f}" — not in docs/PATTERN_CARD_TEMPLATE.md §4`);
    }
  }

  // P9 — legacy language-less field still present
  for (const f of LEGACY_FIELDS) {
    if (f in rec && !isEmpty(rec[f])) {
      add("P9", `"${f}" is the pre-bilingual field — move the value into ${f}_zh (and add ${f}_en) FIRST, then remove "${f}"`);
    }
  }

  // notes
  if (isEmpty(rec.differential_patterns)) {
    notes.push({ code: "N1", id, family: fam, detail: "no differential_patterns — a pattern card's one irreplaceable section" });
  }
  if (isEmpty(rec.typical_points) && isEmpty(rec.typical_formulas)) {
    notes.push({ code: "N2", id, family: fam, detail: "no treatment links at all (typical_points and typical_formulas both empty)" });
  }
}

// --- report -----------------------------------------------------------------
const LABEL = {
  P1: "missing core identity",
  P2: "duplicate id",
  P3: "id outside the pattern.* namespace (D10)",
  P4: "NO PROVENANCE",
  P5: "bilingual twin empty",
  P6: "relation id does not resolve",
  P7: "array index misalignment",
  P8: "unknown field",
  P9: "legacy tongue/pulse field not migrated",
};
const byCode = {};
for (const d of defects) (byCode[d.code] ||= []).push(d);
const clean = scope.filter((r) => !defects.some((d) => d.id === r.id)).length;

if (AS_JSON) {
  const noteCounts = {};
  for (const n of notes) noteCounts[n.code] = (noteCounts[n.code] || 0) + 1;
  console.log(JSON.stringify({
    file: LIBRARY,
    scope: ONLY_FAMILY || "all",
    records: scope.length,
    clean,
    defects: defects.length,
    by_code: Object.fromEntries(Object.entries(byCode).map(([k, v]) => [k, v.length])),
    notes: noteCounts,
  }, null, 2));
} else {
  console.log(`validate-pattern-standard — ${LIBRARY}`);
  console.log(`scope: ${ONLY_FAMILY || "all families"} · ${scope.length} records · ${clean} clean\n`);
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
  const noteCounts = {};
  for (const n of notes) noteCounts[n.code] = (noteCounts[n.code] || 0) + 1;
  for (const [code, n] of Object.entries(noteCounts)) {
    console.log(`${code}  ${n} record(s) — ${notes.find((x) => x.code === code).detail} (note only)`);
  }
  console.log("");
  console.log(defects.length === 0
    ? "PASS — 0 blocking defects."
    : `FAIL — ${defects.length} blocking defect(s). Run with --worklist to see the ids.`);
}

process.exit(defects.length === 0 ? 0 : 1);
