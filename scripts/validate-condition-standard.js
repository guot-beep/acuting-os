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
 *   C11 risk_factors_zh filled but not structured (§5.5). Risk factors used to
 *      live inside western_pathology_*, which merged two questions: how the
 *      disease happens, and who gets it. `modifiable` is the field that earns
 *      the split — it separates what to counsel on from background risk.
 *   C12 acupuncture_scope_zh filled but not structured (§5.6). The only field
 *      written for the practitioner, and the easiest place for an efficacy
 *      claim to arrive ungraded, so `evidence` is required and "unknown" is a
 *      valid value while absent is not. Also refuses a co_management that tells
 *      a patient to stop a medication without routing it to the prescriber —
 *      that is scope of practice, not just safety.
 *   C13 import_artifacts entry not structured (§3.5.5). The relocation target
 *      for import junk moved out of canonical fields: every entry must say what
 *      moved, from where, and why. Accepts either of the two key shapes now in
 *      the data — see §3.5.5; unifying them rewrites provenance and is Ting's
 *      call.
 *
 * C11, C12 and C13 check SHAPE, not presence. Requiring both on all 150 records
 * would add 300 defects to a layer already carrying 396, and a gate that fails
 * every run is a gate that gets switched off.
 *
 * NOTES (reported, do not fail the build):
 *   N1 inline tcm_patterns blobs not yet lifted into related_patterns
 *   N5 classical_references_zh probably misattributed (P3, see below)
 *
 * N5 / P3 — the only check this file has ever had on `classical_references_zh`.
 * Until 2026-08-12 the field appeared here exactly twice, both membership lines
 * (CONTENT_FIELDS, SKELETON_CONTENT_FIELDS), and neither was a check: 52 filled
 * records produced 0 defects. A classical citation reads as provenance — it
 * tells the reader "a classic said this about THIS disease" — so a citation
 * about a different disease is not an incomplete card, it is a card that is
 * wrong with a source attached. Predicate, from
 * docs/research_packs/CLASSICAL_REFS_ATTRIBUTION_SCAN.md §4.2:
 *
 *   flag R when
 *     (a) normalize(R.classical_references_zh) equals that of >=1 other record
 *         (normalize = drop HTML entities, keep CJK only), AND
 *     (b) no term of length >=2 from
 *         { R.name_zh, R.aliases_zh[], tdis_registry[R.related_eastern_diseases].name_zh }
 *         occurs as a literal substring of the passage.
 *
 * Measured on the pre-remediation corpus: 18 flags, 16 of them records the scan
 * had independently read as WRONG-TOPIC or ADJACENT — an 11.1 % false-positive
 * rate. Both false positives were card-side vocabulary gaps, not passage
 * problems (`cond.irregular_menstruation` lacks 月經先期/月經後期 in aliases_zh
 * although the passage's 「或早或遲」 is exactly that; `cond.chronic_prostatitis`
 * lacks 精濁, the correct classical name of its own disease). That is why this
 * is an N-code and not a C-code: a blocking gate that fails on a correct card
 * is a gate that gets switched off, and the two fixes are content improvements
 * that belong to the card, not to the validator.
 *
 * Deliberately NOT done here: adding ["classical_references_zh",
 * "classical_references_en"] to BILINGUAL_PAIRS. `_en` does not exist on any of
 * the 505 records, so that one line would mint one C5 per filled record in a
 * single commit and break check-validation-ratchet. Whether a classical Chinese
 * passage should have an English twin at all is Ting's call (scan §4.3).
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
const TDIS_REGISTRY = "data/pathology/tdis_registry.json";

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
  // Added 2026-08-06. Risk factors were living inside western_pathology_*,
  // which conflated two different questions: how the disease happens, versus
  // who gets it and therefore what to ask in intake.
  "risk_factors_zh", "risk_factors_en",
  "red_flags_zh", "red_flags_en",
  // Added 2026-08-06. red_flags says when to stop; this says how far treatment
  // can go. Neither substitutes for the other, and this is the only field on
  // the card written for the practitioner rather than about the disease.
  "acupuncture_scope_zh", "acupuncture_scope_en",
  "classical_references_zh", "classical_references_en",
]);
const RELATION_FIELDS = new Set([
  "related_eastern_diseases", "related_patterns",
  // edge.condition_symptoms (D13, descriptive). related_tcm_symptoms is
  // deprecated_but_temporarily_accepted, NOT retired — 1 record still holds a
  // value and deleting it before its ids exist would lose the inline blob
  // (§0 只加深不刪除). It stays approved so that record is not a defect, and
  // N2 reports it so it does not become invisible. Removed from APPROVED only
  // after migration. New content must use sign_symptom_ids.
  "sign_symptom_ids", "related_tcm_symptoms",
  "herb_formulas", "acupoint_protocols", "medication_links", "workflow_links",
  // Added 2026-08-08 (template §3): ordered rf.* ids referencing the red-flag
  // registry. Optional — only batches whose registry migration is done carry
  // it. Wiring consistency is validate-red-flag-wiring.js's job, not C8's.
  "red_flag_refs",
]);
const PROVENANCE_FIELDS = new Set([
  "sources", "field_sources", "source_type", "fetched_at", "content_source",
  "public_safe", "source_status",
]);
// Raw import kept for provenance (§0 只加深不刪除). Never used for navigation.
// import_artifacts (§3.5.5): misfiled import text archived move-not-delete.
// Provenance only — C5/C9/C10 never look inside it.
const RAW_IMPORT_FIELDS = new Set(["tcm_patterns", "import_artifacts"]);

const APPROVED = new Set([
  // 3.5.5 import_artifacts (2026-08-11): relocation destination for junk-import
  // text (blog narratives, ad codes, misfiled essays) — provenance only,
  // never rendered. See template §3.5.5.
  "import_artifacts",
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
  ["risk_factors_zh", "risk_factors_en"],
  ["red_flags_zh", "red_flags_en"],
  ["acupuncture_scope_zh", "acupuncture_scope_en"],
  ["aliases_zh", "aliases_en"],
];

/* Structured sub-shapes for the two fields added 2026-08-06.
 *
 * Both are checked for shape rather than for presence. Requiring them on all
 * 150 records would add 300 defects to a layer that already carries 396, and a
 * gate that fails every run gets switched off — the same reason the herb schema
 * validator reports thin cards instead of blocking them. What is enforced is
 * that a filled field is not a paragraph of prose: one sentence repeated across
 * 150 cards is the boilerplate §C.12 warns about, and it defeats every coverage
 * measure while looking complete. */
const RISK_DIRECTIONS = new Set(["increases", "decreases"]);
const SCOPE_KEYS = new Set(["can_treat", "precautions", "co_management"]);
const SCOPE_EVIDENCE = new Set([
  "guideline", "label_derived", "course", "clinical_judgment", "unknown",
]);

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
// Entities with at least one structured red-flag record (see C4).
const RED_FLAG_COVERED = new Set(
  (readJson("data/pathology/red_flag_registry.json").records || []).map((r) => r.entity_id)
);
const patternIds = new Set([
  ...(readJson(PATTERN_REGISTRY).records || []).map((r) => r.id),
  ...(readJson(PATTERN_LIBRARY).records || []).map((r) => r.id),
]);
// N5/P3 needs the TCM disease NAME behind each related_eastern_diseases id —
// a card that links tdis.long_bi is claiming 癃閉, and that is the word the
// passage has to contain for the citation to be about this card's disease.
const tdisNames = new Map(
  (readJson(TDIS_REGISTRY).records || []).map((r) => [r.id, r.name_zh])
);

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

// N5/P3 part (a): duplicate passage blocks, computed over the FULL dataset for
// the same reason C10 is. Normalization keeps CJK only, so `&hellip;` vs `…`,
// `"` vs 「」 and stray whitespace cannot hide a copy — those differences are
// import damage, not different citations.
const CLASSICAL_FIELD = "classical_references_zh";
const normClassical = (s) => String(s).replace(/&[a-zA-Z#0-9]+;/g, "").replace(/[^一-鿿]/g, "");
const classicalGroups = new Map(); // normalized passage -> [record ids]
for (const rec of conditions) {
  const v = typeof rec[CLASSICAL_FIELD] === "string" ? rec[CLASSICAL_FIELD].trim() : "";
  if (!v) continue;
  const k = normClassical(v);
  if (!k) continue;
  if (!classicalGroups.has(k)) classicalGroups.set(k, []);
  classicalGroups.get(k).push(rec.id);
}

// N5/P3 part (b): the disease terms this card claims as its own identity.
function ownDiseaseTerms(rec) {
  const terms = [rec.name_zh, ...(Array.isArray(rec.aliases_zh) ? rec.aliases_zh : [])];
  for (const tid of (Array.isArray(rec.related_eastern_diseases) ? rec.related_eastern_diseases : [])) {
    if (tdisNames.has(tid)) terms.push(tdisNames.get(tid));
  }
  return terms
    .filter((t) => typeof t === "string")
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
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

  // C4 red flags — SAFETY. The structured registry (red_flag_registry.json,
  // 2026-08-08) is an equally valid home: build-data derives its triggers onto
  // the card, so a registry-covered condition DOES tell the reader when to
  // stop. Inline strings are legacy-authored and still count.
  //
  // Skeleton-tier carve-out (2026-08-11, template §5 "C4 與骨架層", Ting's
  // uncapped-skeleton ruling): C4's target is a card that CLAIMS content but
  // omits safety. A pure skeleton (review_status "skeleton" AND zero content
  // fields) claims nothing — it is an index slot. It counts under N4 (note)
  // instead, so the backlog stays visible without blocking. The moment ANY
  // content field appears, C4 applies in full — "has a summary but no red
  // flags" is exactly the state C4 exists to catch.
  const SKELETON_CONTENT_FIELDS = ["summary_zh", "summary_en", "etiology_zh", "etiology_en",
    "western_pathology_zh", "western_pathology_en", "western_context_zh", "western_context_en",
    "risk_factors_zh", "risk_factors_en", "acupuncture_scope_zh", "acupuncture_scope_en",
    "classical_references_zh", "classical_references_en"];
  const isPureSkeleton = rec.review_status === "skeleton"
    && SKELETON_CONTENT_FIELDS.every((f) => isEmpty(rec[f]))
    && isEmpty(rec.red_flags_zh) && isEmpty(rec.red_flags_en);
  if (isEmpty(rec.red_flags_zh) && isEmpty(rec.red_flags_en) && !RED_FLAG_COVERED.has(rec.id)) {
    if (isPureSkeleton) notes.push({ code: "N4", id, category: cat, detail: "skeleton index slot (no content claimed) — C4 deferred until any content field lands" });
    else add("C4", "no red_flags_zh / red_flags_en and no red_flag_registry record");
  }

  // C11 risk_factors shape (§5.5). Not required — checked only when filled, and
  // checked on BOTH languages: a malformed entry is malformed whichever side it
  // sits on, and the first version of this only looked at _zh, which let an
  // illegal direction through on the English twin.
  for (const field of ["risk_factors_zh", "risk_factors_en"]) {
    if (isEmpty(rec[field])) continue;
    if (!Array.isArray(rec[field])) {
      add("C11", `${field} must be an array of structured entries, not prose (§5.5)`);
      continue;
    }
    rec[field].forEach((f, i) => {
      if (typeof f === "string") {
        add("C11", `${field}[${i}] is a bare string — needs factor / direction / modifiable / source (§5.5)`);
        return;
      }
      if (!f || isEmpty(f.factor)) add("C11", `${field}[${i}] missing factor`);
      if (f && f.direction && !RISK_DIRECTIONS.has(f.direction)) {
        add("C11", `${field}[${i}].direction "${f.direction}" not in ${[...RISK_DIRECTIONS].join(" | ")}`);
      }
      // modifiable decides whether this is a counselling target or background
      // risk; omitting it collapses "worth worrying about" into "can act on".
      if (f && typeof f.modifiable !== "boolean") {
        add("C11", `${field}[${i}] missing modifiable (true|false) — it separates a counselling target from background risk`);
      }
    });
  }

  // C12 acupuncture_scope shape (§5.6). The one field written for the
  // practitioner, and the one most likely to drift into a therapeutic claim.
  // Checked on both languages for the same reason as C11 — a malformed entry is
  // malformed whichever side it sits on.
  for (const field of ["acupuncture_scope_zh", "acupuncture_scope_en"]) {
    if (isEmpty(rec[field])) continue;
    const s = rec[field];
    if (typeof s === "string" || Array.isArray(s)) {
      add("C12", `${field} must be an object with can_treat / precautions / co_management, not prose (§5.6)`);
      continue;
    }
    const keys = Object.keys(s).filter((k) => !k.startsWith("_"));
    const unknown = keys.filter((k) => !SCOPE_KEYS.has(k) && k !== "evidence" && k !== "source" && k !== "note");
    if (unknown.length) {
      add("C12", `${field} has unknown keys ${unknown.join(", ")} — allowed: ${[...SCOPE_KEYS].join(" / ")} plus evidence / source / note`);
    }
    if (!keys.some((k) => SCOPE_KEYS.has(k))) {
      add("C12", `${field} has none of ${[...SCOPE_KEYS].join(" / ")}`);
    }
    // An efficacy statement without a grade reads as settled. unknown is a
    // valid grade and the correct starting value — absent is not.
    if (isEmpty(s.evidence)) {
      add("C12", `${field} missing evidence grade — use unknown if not yet checked, never leave it out (§5.6)`);
    } else if (!SCOPE_EVIDENCE.has(s.evidence)) {
      add("C12", `${field}.evidence "${s.evidence}" not in ${[...SCOPE_EVIDENCE].join(" | ")}`);
    } else if (s.evidence !== "unknown" && isEmpty(s.source)) {
      add("C12", `${field}.evidence is "${s.evidence}" but no source — only "unknown" may omit one`);
    }
    // Scope of practice, not just safety: telling a patient to stop an
    // anticoagulant is the prescriber's call. Ticagrelor's own label says to
    // manage bleeding without discontinuing where possible.
    const co = String(s.co_management || "");
    if (/停藥|停用|discontinu|stop taking/i.test(co) && !/聯絡|諮詢|contact|consult/i.test(co)) {
      add("C12", `${field}.co_management suggests stopping a medication without routing it to the prescriber — out of scope (§5.6)`);
    }
  }

  // C13 import_artifacts shape (§3.5.5). Archived junk only earns its keep as
  // provenance if every entry says WHAT moved, FROM WHERE, and WHY — a bare text
  // blob is the junk relocated, not documented.
  //
  // Two key shapes exist on purpose (§3.5.5 warning box): the two lines that
  // invented this field on 2026-08-11 named the keys differently, and the merge
  // kept both verbatim because rewriting an archive entry rewrites provenance.
  // So this gate accepts EITHER shape and refuses to normalise them — unifying
  // the keys is Ting's call, not the validator's.
  if (!isEmpty(rec.import_artifacts)) {
    if (!Array.isArray(rec.import_artifacts)) {
      add("C13", "import_artifacts must be an array of archive entries (§3.5.5)");
    } else {
      rec.import_artifacts.forEach((a, i) => {
        if (!a || typeof a !== "object" || Array.isArray(a)) {
          add("C13", `import_artifacts[${i}] must be an object (§3.5.5)`);
          return;
        }
        const shapeA = ["original_field", "text", "reason", "moved_at"];
        const shapeB = ["field", "text", "reason", "archived_at"];
        const missA = shapeA.filter((k) => isEmpty(a[k]));
        const missB = shapeB.filter((k) => isEmpty(a[k]));
        if (missA.length && missB.length) {
          const shape = missA.length <= missB.length ? shapeA : shapeB;
          const miss = missA.length <= missB.length ? missA : missB;
          add("C13", `import_artifacts[${i}] missing ${miss.join(", ")} — needs {${shape.join(", ")}} (§3.5.5)`);
        }
      });
    }
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

  // N2 deprecated_but_temporarily_accepted field still in use
  if (!isEmpty(rec.related_tcm_symptoms)) {
    notes.push({ code: "N2", id, category: cat, detail: "uses related_tcm_symptoms — deprecated_but_temporarily_accepted. Migrate to sign_symptom_ids (edge.condition_symptoms); no NEW content may use this field." });
  }

  // N5 classical_references_zh probably misattributed (P3 = duplicate block AND
  // the card's own disease term absent from the passage). Note only — see the
  // header for the measured 11.1 % false-positive rate and why it is not a C.
  const classical = typeof rec[CLASSICAL_FIELD] === "string" ? rec[CLASSICAL_FIELD].trim() : "";
  if (classical) {
    const group = classicalGroups.get(normClassical(classical)) || [];
    if (group.length >= 2) {
      const terms = ownDiseaseTerms(rec);
      const hit = terms.find((t) => classical.includes(t));
      if (!hit) {
        const others = group.filter((g) => g !== rec.id);
        notes.push({
          code: "N5",
          id,
          category: cat,
          detail: `${CLASSICAL_FIELD} is shared verbatim with ${others.join(", ")} AND names none of this card's own disease terms (${terms.join(" / ") || "none declared"}). Inside a group of n cards at most one can be the true home, so this citation is probably about another card's disease. Either move it (see CONDITION_CARD_TEMPLATE §3.5.5: write the true home FIRST, then archive and clear here), or — if the passage really is about this disease under a classical name — add that name to aliases_zh, which is a content fix and clears this note honestly.`,
        });
      }
    }
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
  C11: "risk_factors shape (§5.5)",
  C12: "acupuncture_scope shape (§5.6)",
  C13: "import_artifacts entry shape (§3.5.5)",
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
    // per-code note summary (N1 blobs / N2 deprecated field / N4 skeleton slots)
    const NOTE_LABELS = {
      N1: "inline tcm_patterns blobs not lifted into related_patterns",
      N2: "related_tcm_symptoms (deprecated_but_temporarily_accepted)",
      N4: "skeleton index slots (no content claimed; C4 deferred)",
      N5: "classical_references_zh duplicated AND missing this card's own disease term (P3)",
    };
    for (const code of Object.keys(NOTE_LABELS)) {
      const list = notes.filter((n) => n.code === code);
      if (!list.length) continue;
      console.log(`${code}  ${NOTE_LABELS[code]} — ${list.length} record(s) (note only, does not fail)`);
      if (WORKLIST) {
        const shown = SHOW_ALL ? list : list.slice(0, 5);
        shown.forEach((n) => console.log(`    ${n.id}: ${n.detail}`));
        if (!SHOW_ALL && list.length > shown.length) console.log(`    … +${list.length - shown.length} more (--all)`);
      }
    }
    console.log("");
  }
  console.log(defects.length === 0
    ? "PASS — 0 blocking defects."
    : `FAIL — ${defects.length} blocking defect(s). Run with --worklist to see the record ids.`);
}

process.exit(defects.length === 0 ? 0 : 1);
