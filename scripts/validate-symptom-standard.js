#!/usr/bin/env node
/**
 * validate-symptom-standard.js — enforce docs/SYMPTOM_CARD_TEMPLATE.md.
 *
 * Batch A of the symptom layer (D14 build order: vocabulary → template →
 * validator → content). Written while the layer has ZERO records, which is the
 * point: every incident in PROJECT_LOG is content arriving before its yardstick.
 *
 * The records file does not exist yet. That is reported as a STATE, not an
 * error — a namespace with a vocabulary, a template and a validator but no
 * content is correctly built and honestly empty.
 *
 * ERRORS (exit 1):
 *   Y1  missing core identity (id / name_zh / name_en / pinyin)
 *   Y2  duplicate id
 *   Y3  id is not sym.<ascii_slug>
 *   Y4  safety_review_status missing or invalid. Every record must show that
 *       safety WAS CONSIDERED — it does not have to carry a red flag.
 *
 *       The earlier rule ("no safety_flags and no red_flags") demanded a flag
 *       on every card, which invents danger for symptoms that have none. A card
 *       for 口臭 would sprout a manufactured warning purely to pass. So the
 *       requirement is the review, not the finding:
 *
 *         specific_red_flags_present     this symptom has its own red flags
 *         shared_flags_linked            covered by registered safety_flags
 *         no_specific_red_flags_identified   reviewed; genuinely none
 *         needs_safety_review            not yet reviewed — honest and visible
 *
 *       "no_specific_red_flags_identified" is a real answer and must be sourced
 *       like any other; "needs_safety_review" is the honest default and is what
 *       a half-built card should say instead of pretending.
 *   Y5  a *_zh field has content but its *_en twin is missing
 *   Y6  a relation id does not resolve (differentiation.points_to,
 *       safety_flags, supporting_measurements)
 *   Y7  an _en array is not index-aligned with its _zh array
 *   Y8  unknown field, OR a hand-filled derived field (D13 §5.2)
 *   Y9  a *_en field has content but its *_zh twin is missing
 *   Y10 taxonomy_ids missing or not in data/config/symptom_taxonomy.json
 *   Y11 observation_modes / primary_mode violate the three §4 constraints:
 *       (a) primary_mode must be a member of observation_modes
 *       (b) observation_modes allows only patient_reported / examiner_observed —
 *           instrument_measured is NOT a symptom observation mode. A measurement
 *           is a different entity: sym.fever is the phenomenon, metric.* is the
 *           measurement, 38.5°C is the case value.
 *       (c) supporting_measurements must resolve to metric.*
 *   Y12 tradition missing or outside biomedical|tcm|both
 *   Y13 pinyin carries tone marks
 *   Y14 clinical_attributes carries an INSTANCE value (severity: 8,
 *       duration: "3 days"). The card defines which dimensions to ask about;
 *       the case records this visit's answer.
 *   Y15 a red_flag sentence matches an entry in
 *       data/config/generic_red_flag_map.json — a human has already ruled that
 *       this exact wording is generic and belongs to a registered safety_flag.
 *       Reference the flag id instead of repeating the sentence.
 *
 * NOTES (reported, do not fail):
 *   N1 no differentiation — the section that makes a symptom card clinical
 *   N2 no inquiry dimensions
 *   N3 a red_flag sentence appears verbatim on 2+ records — a CONSOLIDATION
 *       CANDIDATE, deliberately non-blocking.
 *
 *       Blocking on exact match would reward paraphrase: an agent rewrites
 *       "突發劇烈頭痛" as "突然出現非常嚴重的頭痛", the check goes quiet, and the
 *       boilerplate survives with the signal destroyed. The rule would be
 *       optimising for wording variation instead of for consolidation — worse
 *       than not checking.
 *
 *       So N3 only surfaces candidates. A human decides whether the wording is
 *       generic; if it is, the phrasing goes into generic_red_flag_map.json and
 *       Y15 blocks it from then on. Machine finds, human rules, machine enforces.
 *
 *       Semantic duplication ("急性爆發性劇烈頭痛") is invisible to both checks.
 *       Only review catches it.
 *
 *   --worklist  --taxonomy sym.pain  --all  --json
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const RECORDS = "data/symptoms/symptoms.json";
const TAXONOMY = "data/config/symptom_taxonomy.json";
const QUALITY = "data/config/symptom_quality.json";
const TIMING = "data/config/symptom_timing.json";
const LATERALITY = "data/config/symptom_laterality.json";
const SAFETY_FLAGS = "data/config/safety_flag_vocabulary.json";
const METRICS = "data/clinical_cases/outcome_metrics.json";
const GENERIC_RF_MAP = "data/config/generic_red_flag_map.json";
const PATTERN_LIB = "data/pathology/pattern_library.json";
const PATTERN_REG = "data/pathology/pattern_registry.json";

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const isEmpty = (v) => v === undefined || v === null
  || (typeof v === "string" && !v.trim())
  || (Array.isArray(v) && v.length === 0)
  || (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

// --- approved fields (docs/SYMPTOM_CARD_TEMPLATE.md §6) ---------------------
const APPROVED = new Set([
  // 6.1 identity
  "id", "name_zh", "name_en", "pinyin", "pinyin_toned", "aliases_zh", "aliases_en",
  "taxonomy_ids", "tradition", "observation_modes", "primary_mode",
  "review_status", "authored_by",
  // 6.2 description
  "definition_zh", "definition_en", "patient_words_zh", "patient_words_en",
  // 6.3 / 6.4 / 6.5
  "clinical_attributes", "inquiry_zh", "inquiry_en",
  "differentiation_zh", "differentiation_en",
  // 6.6 safety. safety_review_status is what Y4 requires — the REVIEW, not a
  // finding. Demanding a flag on every card invents danger for symptoms that
  // have none, and 100 cards would end up carrying the same generic flag.
  "safety_review_status", "safety_review_sources",
  "safety_flags", "red_flags_zh", "red_flags_en",
  // §4 measurements
  "supporting_measurements",
  // 6.8 provenance
  "sources", "field_sources", "source_type",
]);

// §5.2 — descriptive edges are stored on the DIAGNOSTIC entity. These three
// appear on a symptom card only as derived display fields; hand-filling one is
// the D13 violation this check exists for.
const DERIVED_FIELDS = ["seen_in_conditions", "seen_in_patterns", "seen_in_tdis",
  "used_by_conditions", "used_by_patterns", "used_by_tdis"];

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
// §4: exactly two. instrument_measured is deliberately absent.
const MODES = new Set(["patient_reported", "examiner_observed"]);
// Y4: the review must have happened; a red flag need not exist.
const REVIEW_STATUSES = new Set([
  "specific_red_flags_present",
  "shared_flags_linked",
  "no_specific_red_flags_identified",
  "needs_safety_review",
]);
// §6.3: dimensions that describe the card, vs values that belong to a case.
const CARD_DIMENSIONS = new Set(["location", "quality", "laterality", "timing"]);
const INSTANCE_DIMENSIONS = new Set(["severity", "duration", "onset", "frequency"]);

const argv = process.argv.slice(2);
const WORKLIST = argv.includes("--worklist");
const SHOW_ALL = argv.includes("--all");
const AS_JSON = argv.includes("--json");
const taxIdx = argv.indexOf("--taxonomy");
const ONLY_TAX = taxIdx >= 0 ? argv[taxIdx + 1] : null;

// --- load vocabularies (these must exist even with zero records) ------------
const taxonomy = readJson(TAXONOMY);
const TAX_IDS = new Set((taxonomy.categories || []).map((c) => c.id));
const VOCAB_SIZES = {
  taxonomy: TAX_IDS.size,
  quality: (readJson(QUALITY).records || []).length,
  timing: (readJson(TIMING).records || []).length,
  laterality: (readJson(LATERALITY).records || []).length,
};
const SAFETY_IDS = new Set((readJson(SAFETY_FLAGS).flags || []).map((f) => f.id));
const METRIC_IDS = new Set((readJson(METRICS).records || []).map((r) => r.id));
const GENERIC_RF = new Map((readJson(GENERIC_RF_MAP).entries || []).map((e) => [e.phrasing_zh, e.maps_to]));

const records = exists(RECORDS) ? (readJson(RECORDS).records || []) : null;

if (records === null) {
  const summary = {
    file: RECORDS,
    state: "namespace built, no records yet (Batch A)",
    vocabularies: VOCAB_SIZES,
    candidates_in_gap_map: (taxonomy.candidates || []).length,
    note: "D14 build order: vocabularies, template and validator exist; content is Batch B (15 pilot cards). Records are created one sourced batch at a time, never generated from the candidate list.",
  };
  console.log(AS_JSON
    ? JSON.stringify({ ...summary, records: 0, clean: 0, defects: 0, by_code: {} }, null, 2)
    : `validate-symptom-standard — ${RECORDS}\n\n  ${summary.state}\n`
      + `  vocabularies: taxonomy ${VOCAB_SIZES.taxonomy} · quality ${VOCAB_SIZES.quality}`
      + ` · timing ${VOCAB_SIZES.timing} · laterality ${VOCAB_SIZES.laterality}\n`
      + `  safety flags available to reference: ${SAFETY_IDS.size}\n`
      + `  metrics available to reference: ${METRIC_IDS.size}\n`
      + `  candidates in the gap map: ${summary.candidates_in_gap_map}\n\n  ${summary.note}\n\n`
      + `PASS — nothing to validate yet.`);
  process.exit(0);
}

const knownPatternIds = new Set([
  ...(readJson(PATTERN_LIB).records || []).map((r) => r.id),
  ...(readJson(PATTERN_REG).records || []).map((r) => r.id),
]);

const scope = ONLY_TAX ? records.filter((r) => (r.taxonomy_ids || []).includes(ONLY_TAX)) : records;

// Y15 is computed over the FULL set — a duplicate is a duplicate regardless of
// the --taxonomy filter.
const redFlagText = new Map();
for (const rec of records) {
  for (const f of rec.red_flags_zh || []) {
    const s = (typeof f === "string" ? f : f && f.finding || "").trim();
    if (s) redFlagText.set(s, (redFlagText.get(s) || 0) + 1);
  }
}

// --- checks -----------------------------------------------------------------
const defects = [];
const notes = [];
const seen = new Set();

for (const rec of scope) {
  const id = rec.id || "(no id)";
  const add = (code, detail) => defects.push({ code, id, detail });

  // Y1 / Y2 / Y3
  const missing = ["id", "name_zh", "name_en", "pinyin"].filter((f) => isEmpty(rec[f]));
  if (missing.length) add("Y1", `missing ${missing.join(", ")}`);
  if (rec.id) {
    if (seen.has(rec.id)) add("Y2", "duplicate id");
    else seen.add(rec.id);
  }
  if (rec.id && !ID_RE.test(rec.id)) add("Y3", `"${rec.id}" is not sym.<ascii_slug>`);

  // Y4 — the REVIEW must have happened; a red flag need not exist.
  const status = rec.safety_review_status;
  if (isEmpty(status)) {
    add("Y4", `missing safety_review_status (allowed: ${[...REVIEW_STATUSES].join(" | ")}). Safety must be shown to have been considered — "no_specific_red_flags_identified" is a valid answer, silence is not.`);
  } else if (!REVIEW_STATUSES.has(status)) {
    add("Y4", `safety_review_status "${status}" is not ${[...REVIEW_STATUSES].join(" | ")}`);
  } else {
    // The status must match what is actually on the card, or it becomes a
    // label that says "reviewed" while the card carries nothing.
    if (status === "specific_red_flags_present"
        && isEmpty(rec.red_flags_zh) && isEmpty(rec.red_flags_en)) {
      add("Y4", 'safety_review_status is "specific_red_flags_present" but no red_flags are present');
    }
    if (status === "shared_flags_linked" && isEmpty(rec.safety_flags)) {
      add("Y4", 'safety_review_status is "shared_flags_linked" but safety_flags is empty');
    }
    // "reviewed and found none" is a claim about the sources consulted. Without
    // one it is indistinguishable from "nobody looked".
    if (status === "no_specific_red_flags_identified" && isEmpty(rec.safety_review_sources)) {
      add("Y4", '"no_specific_red_flags_identified" needs safety_review_sources — which sources were checked, so the next reader does not repeat the search');
    }
  }

  // Y5 / Y7 / Y9 — bilingual
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

  // Y6 — the three id-bearing fields a symptom card may author
  for (const d of rec.differentiation_zh || []) {
    for (const pid of (d && d.points_to) || []) {
      if (!knownPatternIds.has(pid)) {
        add("Y6", `differentiation "${d.variant || "?"}" points_to "${pid}" does not resolve`);
      }
    }
  }
  for (const fid of rec.safety_flags || []) {
    if (!SAFETY_IDS.has(fid)) add("Y6", `safety_flags "${fid}" is not in ${SAFETY_FLAGS}`);
  }
  for (const mid of rec.supporting_measurements || []) {
    if (!METRIC_IDS.has(mid)) add("Y6", `supporting_measurements "${mid}" is not in ${METRICS}`);
  }

  // Y8 — unknown / hand-filled derived
  for (const f of Object.keys(rec)) {
    if (DERIVED_FIELDS.includes(f)) {
      add("Y8", `"${f}" is a DERIVED display field — the edge is stored on the diagnostic entity (D13, template §5.2). Never hand-filled.`);
    } else if (!APPROVED.has(f)) {
      add("Y8", `unknown field "${f}" — not in docs/SYMPTOM_CARD_TEMPLATE.md §6`);
    }
  }

  // Y10 — taxonomy
  const taxIds = rec.taxonomy_ids || [];
  if (!taxIds.length) add("Y10", `missing taxonomy_ids (from ${TAXONOMY})`);
  for (const t of taxIds) if (!TAX_IDS.has(t)) add("Y10", `taxonomy_id "${t}" is not in ${TAXONOMY}`);

  // Y11 — the three §4 constraints
  const modes = rec.observation_modes;
  if (isEmpty(modes)) {
    add("Y11", "missing observation_modes");
  } else {
    for (const m of modes) {
      if (!MODES.has(m)) {
        add("Y11", m === "instrument_measured"
          ? `observation_modes contains "instrument_measured" — a measurement is a different entity (§4): the phenomenon is this card, the measurement belongs in supporting_measurements -> metric.*`
          : `observation_modes contains "${m}" (allowed: ${[...MODES].join(" | ")})`);
      }
    }
    if (isEmpty(rec.primary_mode)) {
      add("Y11", "missing primary_mode");
    } else if (!modes.includes(rec.primary_mode)) {
      add("Y11", `primary_mode "${rec.primary_mode}" is not a member of observation_modes [${modes.join(", ")}]`);
    }
  }

  // Y12 / Y13
  if (isEmpty(rec.tradition)) add("Y12", "missing tradition");
  else if (!TRADITIONS.has(rec.tradition)) {
    add("Y12", `tradition "${rec.tradition}" is not ${[...TRADITIONS].join(" | ")}`);
  }
  if (typeof rec.pinyin === "string" && TONE_RE.test(rec.pinyin)) {
    add("Y13", `pinyin "${rec.pinyin}" carries tone marks`);
  }

  // Y14 — instance values must not live on the card
  const attrs = rec.clinical_attributes || {};
  for (const [dim, spec] of Object.entries(attrs)) {
    if (INSTANCE_DIMENSIONS.has(dim) && spec && spec.applicable === true) {
      add("Y14", `clinical_attributes.${dim} is marked applicable — severity/duration/onset/frequency are INSTANCE values and belong to the case layer (§8)`);
    }
    if (spec && (typeof spec === "string" || typeof spec === "number" || Array.isArray(spec))) {
      add("Y14", `clinical_attributes.${dim} holds a value (${JSON.stringify(spec).slice(0, 40)}) — the card declares dimensions, the case records values`);
    }
    if (CARD_DIMENSIONS.has(dim) && spec && spec.applicable === true && !spec.vocabulary) {
      add("Y14", `clinical_attributes.${dim} is applicable but names no vocabulary`);
    }
  }

  // Y15 blocks ONLY on a human-adjudicated entry; N3 merely surfaces candidates.
  // Splitting them this way is what stops the check from rewarding paraphrase
  // (see header): finding a duplicate is a hint, ruling it generic is a person's
  // job, and enforcement follows the ruling rather than the string comparison.
  for (const f of rec.red_flags_zh || []) {
    const s = (typeof f === "string" ? f : f && f.finding || "").trim();
    if (!s) continue;
    if (GENERIC_RF.has(s)) {
      add("Y15", `red flag "${s.slice(0, 24)}…" is registered as generic in ${GENERIC_RF_MAP} → reference safety_flag "${GENERIC_RF.get(s)}" instead of repeating the sentence`);
    } else if (redFlagText.get(s) > 1) {
      notes.push({ code: "N3", id, detail: `red flag "${s.slice(0, 24)}…" appears verbatim on ${redFlagText.get(s)} records — consolidation candidate. If review agrees it is generic, add it to ${GENERIC_RF_MAP}; do NOT simply reword it.` });
    }
  }

  // notes
  if (isEmpty(rec.differentiation_zh)) {
    notes.push({ code: "N1", id, detail: "no differentiation — the section that makes a symptom card clinical rather than a dictionary entry" });
  }
  if (isEmpty(rec.inquiry_zh)) notes.push({ code: "N2", id, detail: "no inquiry dimensions" });
}

// --- report -----------------------------------------------------------------
const LABEL = {
  Y1: "missing core identity", Y2: "duplicate id", Y3: "id outside sym.*",
  Y4: "safety review not shown / status inconsistent", Y5: "_zh filled but _en empty",
  Y6: "relation id does not resolve", Y7: "array index misalignment",
  Y8: "unknown or hand-filled derived field", Y9: "_en filled but _zh empty",
  Y10: "taxonomy_ids missing / unknown",
  Y11: "observation_modes / primary_mode constraint",
  Y12: "tradition missing / invalid", Y13: "pinyin has tone marks",
  Y14: "instance value on a card",
  Y15: "red flag registered as generic — reference the safety_flag id",
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
