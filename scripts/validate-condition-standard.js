#!/usr/bin/env node
/**
 * validate-condition-standard.js — enforce docs/CONDITION_CARD_TEMPLATE.md.
 *
 * The herb wall (validate-herb-standard.js) and the acupoint wall
 * (validate-acupoint-standard.js) made those rules machine-checked instead of
 * advisory. This is the condition/pattern twin, written BEFORE the condition
 * fill sprint rather than after it — the 2026-07-22 herb incident (202 records
 * sharing 26 template sentences, 8 validators green, reported complete) is what
 * happens when the yardstick arrives after the content.
 *
 * The condition layer's actual defects, measured 2026-08-05 across the 150
 * records in data/pathology/condition_canon_shortlist.json:
 *   - red_flags present on only 55/150 — the safety field, missing on 95
 *   - etiology_zh and western_pathology_zh on 150/150 with NO _en twin at all
 *   - four competing source fields (sources / source_urls / source_links /
 *     exact_source_url) and one-off fields on 1-2 records each
 *   - no entity_type: biomedical conditions and TCM diseases are mixed
 *   - two parallel pattern systems: related_patterns (445 links, all resolve)
 *     vs tcm_patterns (728 inline blobs, zero resolve — raw import, not ids)
 *
 * ERRORS (exit 1):
 *   C1 missing core identity (id / name_zh / name_en / category)
 *   C2 duplicate id
 *   C3 missing or invalid entity_type
 *   C4 no red flags at all (SAFETY — a condition card with no red-flag field
 *      tells the reader nothing about when to stop and refer)
 *   C5 a *_zh field has content but its *_en twin is missing or empty
 *   C6 a related_patterns id does not resolve in the pattern registry
 *   C7 source field drift — uses a non-canonical source field name
 *   C8 unknown field (the additionalProperties:false equivalent; agents must
 *      not invent fields — propose a schema change instead)
 *   C9 a *_en field has content but its *_zh twin is missing or empty
 *   C10 a content field's value is shared VERBATIM by 2+ records. Found by the
 *      Sonnet translation pilot 2026-08-06: 73 records share one generic
 *      etiology/pathology placeholder pair, and 7 share a text that is
 *      specifically about 月經不調 while sitting on endometriosis, PMS,
 *      infertility… A shared sentence is not content (憲法 §C.12) — and here
 *      it is worse: it makes the C5 "translate the missing _en" backlog look
 *      like translation work when the Chinese source itself is fake-filled.
 *      Translation lines must SKIP any field flagged C10.
 *
 * NOTES (reported, do not fail the build):
 *   N1 inline tcm_patterns blobs not yet lifted into related_patterns
 *
 * WORKLIST — `--worklist` lists the actual condition ids behind the numbers,
 * grouped by category (batches run one category at a time).
 *   --category gyn_fertility   only that category
 *   --all                      do not truncate long lists
 *   --json                     machine-readable summary
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CONDITION_FILE = "data/pathology/condition_canon_shortlist.json";
const PATTERN_REGISTRY = "data/pathology/pattern_registry.json";
const PATTERN_LIBRARY = "data/pathology/pattern_library.json";

// --- the approved field set (docs/CONDITION_CARD_TEMPLATE.md §3) -------------
// Anything outside this set is C8. Growing this list is a schema change: it
// goes in the template doc first, then here, then the data.
const CORE_FIELDS = new Set([
  "id", "entity_type", "name_zh", "name_en", "aliases_zh", "aliases_en",
  "category", "domain", "icd_hint", "review_status", "authored_by",
]);
const CONTENT_FIELDS = new Set([
  "summary_zh", "summary_en",
  "western_context_zh", "western_context_en",
  "western_pathology_zh", "western_pathology_en",
  "etiology_zh", "etiology_en",
  "red_flags_zh", "red_flags_en",
  "classical_references_zh", "classical_references_en",
]);
const RELATION_FIELDS = new Set([
  "related_eastern_diseases", "related_patterns", "related_tcm_symptoms",
  "herb_formulas", "acupoint_protocols", "medication_links", "workflow_links",
]);
const PROVENANCE_FIELDS = new Set([
  "sources", "field_sources", "source_type", "fetched_at", "content_source",
  "public_safe", "source_status",
]);
// Raw import kept for provenance (§0 只加深不刪除). Never used for navigation.
const RAW_IMPORT_FIELDS = new Set(["tcm_patterns"]);

const APPROVED = new Set([
  ...CORE_FIELDS, ...CONTENT_FIELDS, ...RELATION_FIELDS,
  ...PROVENANCE_FIELDS, ...RAW_IMPORT_FIELDS,
]);

// C7: exactly one canonical source field. These are the drift variants found
// in the data on 2026-08-05 — they must fold into `sources`.
const CANONICAL_SOURCE_FIELD = "sources";
const DRIFT_SOURCE_FIELDS = ["source_urls", "source_links", "exact_source_url"];

const ENTITY_TYPES = new Set(["biomedical_condition", "tcm_disease"]);

// C5/C9: bilingual twins. Both directions are checked — a zh-only field is as
// broken as an en-only one, and the repo has both.
const BILINGUAL_PAIRS = [
  ["summary_zh", "summary_en"],
  ["western_context_zh", "western_context_en"],
  ["western_pathology_zh", "western_pathology_en"],
  ["etiology_zh", "etiology_en"],
  ["red_flags_zh", "red_flags_en"],
  ["aliases_zh", "aliases_en"],
];

// --- helpers ----------------------------------------------------------------
function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}
function isEmpty(v) {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

// --- CLI --------------------------------------------------------------------
const argv = process.argv.slice(2);
const WORKLIST = argv.includes("--worklist");
const SHOW_ALL = argv.includes("--all");
const AS_JSON = argv.includes("--json");
const catIdx = argv.indexOf("--category");
const ONLY_CATEGORY = catIdx >= 0 ? argv[catIdx + 1] : null;

// --- load -------------------------------------------------------------------
const conditions = readJson(CONDITION_FILE).records || [];
const patternIds = new Set([
  ...(readJson(PATTERN_REGISTRY).records || []).map((r) => r.id),
  ...(readJson(PATTERN_LIBRARY).records || []).map((r) => r.id),
]);

const scope = ONLY_CATEGORY
  ? conditions.filter((c) => c.category === ONLY_CATEGORY)
  : conditions;

// C10 groups are computed over the FULL dataset (a duplicate is a duplicate no
// matter which --category you are looking at), then reported per in-scope record.
const C10_FIELDS = ["etiology_zh", "western_pathology_zh", "summary_zh"];
const sharedValues = new Map(); // field -> Map(normValue -> count)
for (const f of C10_FIELDS) {
  const byVal = new Map();
  for (const rec of conditions) {
    const v = typeof rec[f] === "string" ? rec[f].trim() : "";
    if (v) byVal.set(v, (byVal.get(v) || 0) + 1);
  }
  sharedValues.set(f, byVal);
}

// --- checks -----------------------------------------------------------------
const defects = [];   // {code, id, category, detail}
const notes = [];
const seen = new Map();

for (const rec of scope) {
  const id = rec.id || "(no id)";
  const cat = rec.category || "(no category)";
  const add = (code, detail) => defects.push({ code, id, category: cat, detail });

  // C1 core identity
  const missingCore = ["id", "name_zh", "name_en", "category"].filter((f) => isEmpty(rec[f]));
  if (missingCore.length) add("C1", `missing ${missingCore.join(", ")}`);

  // C2 duplicate id
  if (rec.id) {
    if (seen.has(rec.id)) add("C2", `duplicate id (also at index ${seen.get(rec.id)})`);
    else seen.set(rec.id, conditions.indexOf(rec));
  }

  // C3 entity_type — D11: the namespace IS the entity type, so this field is
  // not a free choice. A cond.* record labelled tcm_disease would create a
  // second home for TCM diseases (they live in tdis.*, 75 records).
  const expectedType = String(rec.id || "").startsWith("tdis.")
    ? "tcm_disease"
    : "biomedical_condition";
  if (isEmpty(rec.entity_type)) {
    add("C3", `missing entity_type — must be "${expectedType}" for a ${String(rec.id || "").split(".")[0]}.* record (D11)`);
  } else if (!ENTITY_TYPES.has(rec.entity_type)) {
    add("C3", `invalid entity_type "${rec.entity_type}" (allowed: ${[...ENTITY_TYPES].join(" | ")})`);
  } else if (rec.entity_type !== expectedType) {
    add("C3", `entity_type "${rec.entity_type}" disagrees with the "${String(rec.id).split(".")[0]}.*" namespace — expected "${expectedType}" (D11: the namespace IS the type). A TCM disease belongs in tdis.*, not here.`);
  }

  // C4 red flags — SAFETY
  if (isEmpty(rec.red_flags_zh) && isEmpty(rec.red_flags_en)) {
    add("C4", "no red_flags_zh and no red_flags_en");
  }

  // C5 / C9 bilingual twins
  for (const [zh, en] of BILINGUAL_PAIRS) {
    const hasZh = !isEmpty(rec[zh]);
    const hasEn = !isEmpty(rec[en]);
    if (hasZh && !hasEn) add("C5", `${zh} filled but ${en} empty`);
    if (hasEn && !hasZh) add("C9", `${en} filled but ${zh} empty`);
  }

  // C6 pattern links resolve — and D10: the legacy `pat.<中文>` namespace is
  // retired, so a legacy id gets a message that names the fix instead of a
  // generic "not found".
  for (const pid of rec.related_patterns || []) {
    if (patternIds.has(pid)) continue;
    if (String(pid).startsWith("pat.")) {
      add("C6", `related_patterns "${pid}" uses the retired pat.* namespace — resolve it through data/config/pattern_alias_map.json (DECISIONS D10)`);
    } else {
      add("C6", `related_patterns "${pid}" not in pattern registry/library`);
    }
  }

  // C7 source field drift. NOTE: exact_source_url usually holds the CloudTCM
  // page Ting wants kept (D11) — folding means MOVING the URL into `sources`,
  // never dropping it. Move first, then remove the old field.
  for (const f of DRIFT_SOURCE_FIELDS) {
    if (f in rec) {
      const isCloud = typeof rec[f] === "string" && rec[f].includes("cloudtcm.com");
      add("C7", `uses "${f}" — MOVE the value into "${CANONICAL_SOURCE_FIELD}" first, then remove the field${isCloud ? " (this is a CloudTCM page URL — it must survive the fold, D11)" : ""}`);
    }
  }

  // C8 unknown fields
  for (const f of Object.keys(rec)) {
    if (!APPROVED.has(f) && !DRIFT_SOURCE_FIELDS.includes(f)) {
      add("C8", `unknown field "${f}" — not in docs/CONDITION_CARD_TEMPLATE.md §3`);
    }
  }

  // C10 verbatim-shared content
  for (const f of C10_FIELDS) {
    const v = typeof rec[f] === "string" ? rec[f].trim() : "";
    if (!v) continue;
    const n = sharedValues.get(f).get(v);
    if (n >= 2) add("C10", `${f} is shared verbatim by ${n} records — boilerplate or misfiled text, not this condition's content. Do NOT translate it; the fill line replaces it from real sources.`);
  }

  // N1 unlifted inline pattern blobs
  const inline = (rec.tcm_patterns || []).length;
  const resolved = (rec.related_patterns || []).length;
  if (inline > resolved) {
    notes.push({ code: "N1", id, category: cat, detail: `${inline} inline tcm_patterns blobs vs ${resolved} resolved related_patterns` });
  }
}

// --- report -----------------------------------------------------------------
const byCode = {};
for (const d of defects) (byCode[d.code] ||= []).push(d);
const CODE_LABEL = {
  C1: "missing core identity",
  C2: "duplicate id",
  C3: "missing/invalid entity_type",
  C4: "NO RED FLAGS (safety)",
  C5: "_zh filled but _en empty",
  C6: "related_patterns id does not resolve",
  C7: "source field drift",
  C8: "unknown field",
  C9: "_en filled but _zh empty",
  C10: "content shared verbatim across records (boilerplate/misfiled)",
};

const cleanRecords = scope.filter((r) => !defects.some((d) => d.id === r.id)).length;

if (AS_JSON) {
  console.log(JSON.stringify({
    file: CONDITION_FILE,
    scope: ONLY_CATEGORY || "all",
    records: scope.length,
    clean: cleanRecords,
    defects: defects.length,
    by_code: Object.fromEntries(Object.entries(byCode).map(([k, v]) => [k, v.length])),
    notes: notes.length,
  }, null, 2));
} else {
  console.log(`validate-condition-standard — ${CONDITION_FILE}`);
  console.log(`scope: ${ONLY_CATEGORY || "all categories"} · ${scope.length} records · ${cleanRecords} clean\n`);
  for (const code of Object.keys(CODE_LABEL)) {
    const list = byCode[code];
    if (!list) continue;
    const ids = [...new Set(list.map((d) => d.id))];
    console.log(`${code}  ${CODE_LABEL[code]} — ${list.length} defect(s) across ${ids.length} record(s)`);
    if (WORKLIST) {
      const byCat = {};
      for (const d of list) (byCat[d.category] ||= new Set()).add(d.id);
      for (const [cat, set] of Object.entries(byCat).sort()) {
        const arr = [...set];
        const shown = SHOW_ALL ? arr : arr.slice(0, 8);
        const more = arr.length - shown.length;
        console.log(`    ${cat}: ${shown.join(", ")}${more > 0 ? ` … +${more} more (--all)` : ""}`);
      }
      const sample = list[0];
      console.log(`    e.g. ${sample.id}: ${sample.detail}`);
    }
    console.log("");
  }
  if (notes.length) {
    console.log(`N1  inline tcm_patterns blobs not lifted into related_patterns — ${notes.length} record(s) (note only, does not fail)`);
    if (WORKLIST) {
      const shown = SHOW_ALL ? notes : notes.slice(0, 5);
      shown.forEach((n) => console.log(`    ${n.id}: ${n.detail}`));
      if (!SHOW_ALL && notes.length > shown.length) console.log(`    … +${notes.length - shown.length} more (--all)`);
    }
    console.log("");
  }
  console.log(defects.length === 0
    ? "PASS — 0 blocking defects."
    : `FAIL — ${defects.length} blocking defect(s). Run with --worklist to see the record ids.`);
}

process.exit(defects.length === 0 ? 0 : 1);
