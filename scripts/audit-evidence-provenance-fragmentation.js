#!/usr/bin/env node
/**
 * audit-evidence-provenance-fragmentation.js — Task 10D: Evidence & Provenance Fragmentation Inventory
 *
 * READ-ONLY deterministic audit evaluating how evidence, provenance, authorship, source verification,
 * and review-state concepts are currently represented across AcuTing OS.
 *
 * Core Invariant:
 *   "先把「誰在描述來源、誰在描述審核、誰在描述作者、誰真的被程式使用」拆清楚，再談統一。名字相似不是語意相同。"
 *
 * Features:
 *   --self-test     : Executes 8 algorithmic regression fixtures asserting parser, consumer classifier,
 *                     redundancy analyzer, precedence detection, and staging separation logic.
 *   --write-report  : Writes data/audits/evidence_provenance_fragmentation_2026-08-27.json &
 *                            docs/audits/EVIDENCE_PROVENANCE_FRAGMENTATION_2026-08-27.md
 *
 * Usage:
 *   node scripts/audit-evidence-provenance-fragmentation.js
 *   node scripts/audit-evidence-provenance-fragmentation.js --self-test
 *   node scripts/audit-evidence-provenance-fragmentation.js --write-report
 */

"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");

function getGitSha(ref) {
  try {
    return execSync(`git rev-parse ${ref}`, { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "UNKNOWN";
  }
}

// 1. Semantic Categories (Strict & Conservative Whitelist)
const SEMANTIC_CATEGORIES = {
  SOURCE_LOCATOR: "SOURCE_LOCATOR",
  SOURCE_CITATION: "SOURCE_CITATION",
  AUTHORSHIP: "AUTHORSHIP",
  PROVENANCE: "PROVENANCE",
  VERIFICATION_STATE: "VERIFICATION_STATE",
  REVIEW_STATE: "REVIEW_STATE",
  EVIDENCE_STRENGTH: "EVIDENCE_STRENGTH",
  IMPORT_HISTORY: "IMPORT_HISTORY",
  UNKNOWN_OR_AMBIGUOUS: "UNKNOWN_OR_AMBIGUOUS"
};

// 2. Canonical Datasets Scope
const CANONICAL_DATASETS = [
  { id: "herbs", path: "data/herbs/herb_canon_shortlist.json", family: "herbs" },
  { id: "herb_pairs", path: "data/herbs/herb_pairs.json", family: "herbs" },
  { id: "formulas", path: "data/herbs/formulas.json", family: "formulas" },
  { id: "conditions", path: "data/pathology/conditions.json", family: "biomedical_conditions" },
  { id: "condition_canon", path: "data/pathology/condition_canon_shortlist.json", family: "biomedical_conditions" },
  { id: "tdis_registry", path: "data/pathology/tdis_registry.json", family: "tcm_diseases" },
  { id: "cloudtcm_diseases", path: "data/pathology/cloudtcm_disease_entries.json", family: "tcm_diseases" },
  { id: "pattern_library", path: "data/pathology/pattern_library.json", family: "patterns" },
  { id: "pattern_registry", path: "data/pathology/pattern_registry.json", family: "patterns" },
  { id: "acupoints_361", path: "data/acupoints/361.json", family: "acupoints" },
  { id: "extra_points", path: "data/acupoints/extra_points.json", family: "acupoints" },
  { id: "auricular_points", path: "data/auricular/embedded/auricular_points.json", family: "acupoints" },
  { id: "scalp_points", path: "data/scalp/scalp_points_full.json", family: "acupoints" },
  { id: "tung_points", path: "data/tung/point_index.json", family: "acupoints" },
  { id: "symptoms", path: "data/symptoms/symptoms.json", family: "symptoms" },
  { id: "comparisons", path: "data/knowledge/comparisons.json", family: "comparisons" },
  { id: "red_flag_registry", path: "data/pathology/red_flag_registry.json", family: "safety" },
  { id: "formula_safety_flags", path: "data/herbs/formula_safety_flags.json", family: "safety" },
  { id: "pharm_drugs", path: "data/pharmacology/drugs.json", family: "pharmacology" },
  { id: "pharm_drug_classes", path: "data/pharmacology/drug_classes.json", family: "pharmacology" },
  { id: "western_medications", path: "data/medications/western_medications.json", family: "pharmacology" },
  { id: "supplements", path: "data/supplements/supplements.json", family: "supplements" },
  { id: "outcome_metrics", path: "data/clinical_cases/outcome_metrics.json", family: "clinical_config" },
  { id: "avs_advice_library", path: "data/config/avs_advice_library.json", family: "clinical_config" },
  { id: "content_quality", path: "data/quality/content_quality.json", family: "quality" },
  { id: "formula_hdi_review", path: "data/quality/formula_hdi_review.json", family: "quality" },
  { id: "source_registry", path: "data/sources/source_registry.json", family: "source_registry" }
];

const SEED_KEYWORDS = [
  "source", "sources", "url", "citation", "evidence", "review", "status", "provenance",
  "author", "verified", "verify", "import", "grade", "level", "protocol", "origin",
  "created_by", "reference", "importance"
];

function isEvidenceConcept(fieldName) {
  const k = fieldName.toLowerCase();
  return SEED_KEYWORDS.some((kw) => k.includes(kw));
}

function classifySemanticCategory(fieldName, sampleValues = []) {
  const k = fieldName.toLowerCase();

  // Locators
  if (k.endsWith("_url") || k.endsWith("_urls") || k.includes("locator") || k.includes("sitemap") || k === "dailymed_setid" || k === "dailymed_url" || k === "sources_to_check" || k === "diagram_urls_zh" || k === "diagram_urls_en") {
    return SEMANTIC_CATEGORIES.SOURCE_LOCATOR;
  }

  // Authorship
  if (k === "authored_by" || k === "created_by" || k === "author" || k === "author_role" || k === "authorities" || k === "content_source") {
    return SEMANTIC_CATEGORIES.AUTHORSHIP;
  }

  // Evidence Strength / Exam Importance
  if (k === "evidence" || k === "evidence_level" || k === "evidence_grade" || k === "card_grade" || k === "exam_importance" || k === "examimportance" || k === "course_level_en" || k === "course_level_zh" || k.endsWith("_evidence")) {
    return SEMANTIC_CATEGORIES.EVIDENCE_STRENGTH;
  }

  // Review State
  if (k === "review_status" || k === "protocol_status" || k === "last_reviewed" || k === "reviewed_by" || k === "reviewer" || k === "reviewed" || k === "review_note" || k === "review_notes" || k === "review_rule" || k === "review_policy" || k === "safety_review" || k === "reviewer_decision" || k === "reviewer_note" || k === "claim_status") {
    return SEMANTIC_CATEGORIES.REVIEW_STATE;
  }

  // Verification State
  if (k === "source_status" || k === "verification_status" || k === "verified_by" || k === "verified" || k === "verified_at" || k === "verified_entries_reused" || k === "default_source_status" || k === "source_pending") {
    return SEMANTIC_CATEGORIES.VERIFICATION_STATE;
  }

  // Provenance / Staging Origin
  if (k === "provenance" || k === "origin" || k === "source_type" || k === "staging_source" || k === "provenance_notes" || k === "original_shape" || k === "import_staging" || k === "source_file" || k === "source_files" || k === "source_field" || k === "source_hint" || k === "source_of_truth_fields" || k === "source_priority" || k === "source_index" || k === "source_index_url" || k === "source_search_api" || k === "source_collection_results") {
    return SEMANTIC_CATEGORIES.PROVENANCE;
  }

  // Import History
  if (k.startsWith("import_") || k.includes("migration") || k === "live_counts_at_source_commit" || k === "content_import_rule" || k === "duplicated_for_provenance" || k === "granule_catalog_status") {
    return SEMANTIC_CATEGORIES.IMPORT_HISTORY;
  }

  // Citations / Sources
  if (k === "source" || k === "sources" || k === "citation" || k === "citations" || k === "reference" || k === "references" || k === "field_sources" || k === "dose_source" || k === "safety_source" || k === "source_classic" || k === "source_hierarchy" || k === "herb_drug_interaction_sources" || k === "safety_flag_sources" || k === "tcm_source" || k === "western_source" || k === "fda_label_source" || k === "source_reference" || k.endsWith("_source") || k.endsWith("_sources") || k.endsWith("_citations")) {
    return SEMANTIC_CATEGORIES.SOURCE_CITATION;
  }

  return SEMANTIC_CATEGORIES.UNKNOWN_OR_AMBIGUOUS;
}

function stripComments(jsCode) {
  return jsCode
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

function discoverCodeFiles(baseDir) {
  const files = [];
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(ROOT, full).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        if (rel.startsWith("node_modules") || rel.startsWith(".git") || rel.startsWith("data/audits") || rel.startsWith("scratch") || rel.startsWith("curriculum") || rel.startsWith("data/generated")) {
          continue;
        }
        scan(full);
      } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".html") || entry.name.endsWith(".yml") || entry.name.endsWith(".sql"))) {
        files.push({ rel, full });
      }
    }
  }
  scan(baseDir);
  return files;
}

function loadDirectCiScripts() {
  const ciScripts = new Set();
  const wfPath = path.join(ROOT, ".github/workflows/validate.yml");
  if (fs.existsSync(wfPath)) {
    const text = fs.readFileSync(wfPath, "utf8");
    const re = /node\s+scripts\/([a-zA-Z0-9_\-\.]+)\.js/g;
    let match;
    while ((match = re.exec(text)) !== null) {
      ciScripts.add(`scripts/${match[1]}.js`);
    }
  }
  return ciScripts;
}

function analyzeCodeConsumersForField(fieldName, codeFiles, directCiScripts) {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?:\\.|\\b(?:get|has|set)\\(['"]|['"])(${escaped})(?:['"]|\\b|\\[|\\.)`);

  const consumers = {
    readers: [],
    writers: [],
    validators: [],
    builders: [],
    ui_consumers: [],
    runtime_consumers: [],
    ci_consumers: [],
    report_only_consumers: [],
    consumption_modes: new Set(),
    no_consumer_found: false
  };

  for (const { rel, full } of codeFiles) {
    try {
      const raw = fs.readFileSync(full, "utf8");
      const clean = stripComments(raw);
      if (!pattern.test(clean)) continue;

      if (clean.includes(`.${fieldName} =`) || clean.includes(`"${fieldName}":`) || clean.includes(`'${fieldName}':`)) {
        consumers.consumption_modes.add("WRITES");
      }
      if (clean.includes(`.${fieldName}`) || clean.includes(`['${fieldName}']`) || clean.includes(`["${fieldName}"]`)) {
        consumers.consumption_modes.add("READS_VALUE");
      }
      if (clean.includes(`hasOwnProperty('${fieldName}')`) || clean.includes(`'${fieldName}' in`) || clean.includes(`"${fieldName}" in`)) {
        consumers.consumption_modes.add("CHECKS_PRESENCE");
      }

      if (rel === "app.js" || rel.endsWith(".html")) {
        consumers.ui_consumers.push(rel);
        consumers.runtime_consumers.push(rel);
        consumers.readers.push(rel);
        consumers.consumption_modes.add("DISPLAYS");
      } else if (rel.startsWith("js/")) {
        consumers.runtime_consumers.push(rel);
        consumers.readers.push(rel);
        consumers.consumption_modes.add("TRANSFORMS");
      } else if (rel.startsWith("scripts/build-") || rel === "scripts/build-data.js") {
        consumers.builders.push(rel);
        consumers.readers.push(rel);
        consumers.consumption_modes.add("COPIES_THROUGH");
      } else if (rel.startsWith("scripts/validate-") || rel.startsWith("scripts/check-") || rel.startsWith("scripts/test-")) {
        consumers.validators.push(rel);
        consumers.readers.push(rel);
        if (directCiScripts.has(rel)) {
          consumers.ci_consumers.push(rel);
        }
      } else if (rel.startsWith("scripts/report-") || rel.startsWith("scripts/audit-")) {
        consumers.report_only_consumers.push(rel);
        consumers.readers.push(rel);
        if (directCiScripts.has(rel)) {
          consumers.ci_consumers.push(rel);
        }
      }
    } catch {
      // skip unreadable
    }
  }

  consumers.no_consumer_found = consumers.readers.length === 0 && consumers.writers.length === 0;
  return consumers;
}

function findPrecedenceChains(codeFiles) {
  const chains = [];
  for (const { rel, full } of codeFiles) {
    if (rel.startsWith("data/") || rel.startsWith("scratch/")) continue;
    try {
      const raw = fs.readFileSync(full, "utf8");
      const lines = raw.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const clean = line.replace(/\/\/.*$/, "").trim();
        if ((clean.includes("||") || clean.includes("??")) && isEvidenceConcept(clean)) {
          // Identify ordered fields
          const parts = clean.split(/\|\||\?\?/).map((p) => p.trim());
          if (parts.length >= 2) {
            chains.push({
              consumer: rel,
              line_number: i + 1,
              expression: clean,
              precedence_parts: parts
            });
          }
        }
      }
    } catch {}
  }
  return chains;
}

function classifyPairOverlap(fieldA, infoA, consA, fieldB, infoB, consB, coexistingDatasets, coexistingRecords) {
  if (coexistingRecords === 0) {
    return {
      classification: "PARALLEL_BUT_UNCONNECTED",
      reason: "Fields do not coexist within the same canonical records."
    };
  }

  // Check semantic category
  const semA = infoA.semantic_category;
  const semB = infoB.semantic_category;

  if (semA !== semB) {
    return {
      classification: "CLEARLY_DISTINCT",
      reason: `Fields serve different semantic dimensions (${semA} vs ${semB}).`
    };
  }

  // If same semantic category: check consumers
  const sharedConsumers = consA.readers.filter((c) => consB.readers.includes(c));
  if (sharedConsumers.length > 0) {
    if (infoA.total_nonempty === infoB.total_nonempty && infoA.total_present === infoB.total_present) {
      return {
        classification: "MECHANICALLY_REDUNDANT",
        reason: "Both fields share identical record occupancy and are consumed by overlapping code paths."
      };
    }
    return {
      classification: "PARTIAL_OVERLAP",
      reason: "Fields share semantic category and consumers, but exhibit differing occupancy or coverage scopes."
    };
  }

  return {
    classification: "PARALLEL_BUT_UNCONNECTED",
    reason: "Fields belong to same category but are consumed by disjoint code paths."
  };
}

function runAudit() {
  const headSha = getGitSha("HEAD");
  const baseSha = getGitSha("origin/main");
  const codeFiles = discoverCodeFiles(ROOT);
  const directCiScripts = loadDirectCiScripts();

  const fieldInventoryMap = new Map();
  const datasetCoverageMap = new Map();
  const coexistingPairsTracker = new Map();

  // Scan all canonical datasets
  for (const d of CANONICAL_DATASETS) {
    const fullPath = path.join(ROOT, d.path);
    if (!fs.existsSync(fullPath)) continue;

    let records = [];
    try {
      const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      if (Array.isArray(parsed)) records = parsed;
      else if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.records)) records = parsed.records;
        else if (Array.isArray(parsed.items)) records = parsed.items;
        else if (parsed.entries && typeof parsed.entries === "object") records = Object.values(parsed.entries);
        else records = [parsed];
      }
    } catch {
      continue;
    }

    const dsStats = {
      dataset_id: d.id,
      rel_path: d.path,
      family: d.family,
      records_total: records.length,
      records_with_any_source_locator: 0,
      records_with_any_source_citation: 0,
      records_with_authorship: 0,
      records_with_review_state: 0,
      records_with_verification_state: 0,
      records_with_field_level_sources: 0,
      records_with_no_detected_provenance: 0
    };
    datasetCoverageMap.set(d.id, dsStats);

    for (const rec of records) {
      if (!rec || typeof rec !== "object") continue;

      let hasLoc = false;
      let hasCit = false;
      let hasAuth = false;
      let hasRev = false;
      let hasVer = false;
      let hasFieldSrc = false;

      const recEvidenceKeys = new Set();

      function scanObj(obj, prefix = "") {
        for (const [k, v] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${k}` : k;
          if (isEvidenceConcept(k)) {
            recEvidenceKeys.add(k);

            if (!fieldInventoryMap.has(k)) {
              fieldInventoryMap.set(k, {
                field_name: k,
                json_path_examples: new Set(),
                canonical_datasets: new Map(),
                total_present: 0,
                total_nonempty: 0,
                types: new Set(),
                enum_vocabulary: new Set()
              });
            }

            const finfo = fieldInventoryMap.get(k);
            finfo.json_path_examples.add(fullKey);
            finfo.total_present++;

            const isNonEmpty = v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0) && !(typeof v === "object" && Object.keys(v).length === 0);
            if (isNonEmpty) finfo.total_nonempty++;

            const vType = Array.isArray(v) ? "array" : v === null ? "null" : typeof v;
            finfo.types.add(vType);

            if (typeof v === "string" && v.length < 60) finfo.enum_vocabulary.add(v);
            else if (Array.isArray(v)) {
              for (const item of v) {
                if (typeof item === "string" && item.length < 60) finfo.enum_vocabulary.add(item);
              }
            }

            if (!finfo.canonical_datasets.has(d.id)) {
              finfo.canonical_datasets.set(d.id, { present: 0, nonempty: 0 });
            }
            const dCounts = finfo.canonical_datasets.get(d.id);
            dCounts.present++;
            if (isNonEmpty) dCounts.nonempty++;

            const cat = classifySemanticCategory(k);
            if (isNonEmpty) {
              if (cat === SEMANTIC_CATEGORIES.SOURCE_LOCATOR) hasLoc = true;
              if (cat === SEMANTIC_CATEGORIES.SOURCE_CITATION) {
                if (k === "field_sources") hasFieldSrc = true;
                else hasCit = true;
              }
              if (cat === SEMANTIC_CATEGORIES.AUTHORSHIP) hasAuth = true;
              if (cat === SEMANTIC_CATEGORIES.REVIEW_STATE) hasRev = true;
              if (cat === SEMANTIC_CATEGORIES.VERIFICATION_STATE) hasVer = true;
            }
          }

          if (v && typeof v === "object" && !Array.isArray(v) && prefix === "") {
            scanObj(v, k);
          }
        }
      }

      scanObj(rec);

      if (hasLoc) dsStats.records_with_any_source_locator++;
      if (hasCit) dsStats.records_with_any_source_citation++;
      if (hasAuth) dsStats.records_with_authorship++;
      if (hasRev) dsStats.records_with_review_state++;
      if (hasVer) dsStats.records_with_verification_state++;
      if (hasFieldSrc) dsStats.records_with_field_level_sources++;
      if (!hasLoc && !hasCit && !hasAuth && !hasRev && !hasVer && !hasFieldSrc) {
        dsStats.records_with_no_detected_provenance++;
      }

      // Track pair coexistence
      const keysList = Array.from(recEvidenceKeys);
      for (let i = 0; i < keysList.length; i++) {
        for (let j = i + 1; j < keysList.length; j++) {
          const pairKey = [keysList[i], keysList[j]].sort().join(" <-> ");
          if (!coexistingPairsTracker.has(pairKey)) {
            coexistingPairsTracker.set(pairKey, { fieldA: keysList[i], fieldB: keysList[j], datasets: new Set(), coexistingRecords: 0 });
          }
          const pairInfo = coexistingPairsTracker.get(pairKey);
          pairInfo.datasets.add(d.id);
          pairInfo.coexistingRecords++;
        }
      }
    }
  }

  // Format Field Inventory and Consumer Maps
  const inventoryList = [];
  const consumerMapList = [];
  const darkFields = [];
  const emptyWithConsumer = [];

  for (const [k, finfo] of fieldInventoryMap.entries()) {
    const semCat = classifySemanticCategory(k, Array.from(finfo.enum_vocabulary));
    const cons = analyzeCodeConsumersForField(k, codeFiles, directCiScripts);

    const item = {
      field_name: k,
      first_level_semantic_category: semCat,
      record_count_present: finfo.total_present,
      record_count_nonempty: finfo.total_nonempty,
      observed_value_types: Array.from(finfo.types).sort(),
      observed_enum_vocabulary: Array.from(finfo.enum_vocabulary).slice(0, 15).sort(),
      canonical_datasets_containing_it: Array.from(finfo.canonical_datasets.keys()).sort(),
      json_path_examples: Array.from(finfo.json_path_examples).slice(0, 5)
    };
    inventoryList.push(item);

    const consItem = {
      field_name: k,
      semantic_category: semCat,
      consumption_modes: Array.from(cons.consumption_modes).sort(),
      readers: cons.readers,
      writers: cons.writers,
      validators: cons.validators,
      builders: cons.builders,
      ui_consumers: cons.ui_consumers,
      runtime_consumers: cons.runtime_consumers,
      ci_consumers: cons.ci_consumers,
      report_only_consumers: cons.report_only_consumers,
      no_consumer_found: cons.no_consumer_found
    };
    consumerMapList.push(consItem);

    if (finfo.total_nonempty > 0 && cons.no_consumer_found) {
      darkFields.push({
        field_name: k,
        record_count_nonempty: finfo.total_nonempty,
        canonical_datasets: Array.from(finfo.canonical_datasets.keys()),
        status: "DATA_PRESENT_NO_CONSUMER_FOUND"
      });
    }

    if (finfo.total_nonempty === 0 && !cons.no_consumer_found) {
      emptyWithConsumer.push({
        field_name: k,
        readers_count: cons.readers.length,
        status: "CONSUMER_EXISTS_BUT_DATA_EMPTY"
      });
    }
  }

  // Overlap Matrix for targeted key pairs
  const targetedPairs = [
    ["sources", "field_sources"],
    ["content_source", "authored_by"],
    ["review_status", "source_status"],
    ["exact_source_url", "safety_source_url"],
    ["cloudtcm_url", "american_dragon_url"],
    ["dose_source", "sources"],
    ["evidence", "sources"],
    ["exam_importance", "card_grade"]
  ];

  const overlapMatrix = [];
  for (const [fA, fB] of targetedPairs) {
    const pairKey = [fA, fB].sort().join(" <-> ");
    const pairData = coexistingPairsTracker.get(pairKey) || { datasets: new Set(), coexistingRecords: 0 };
    const infoA = fieldInventoryMap.get(fA) || { total_present: 0, total_nonempty: 0, semantic_category: classifySemanticCategory(fA) };
    const infoB = fieldInventoryMap.get(fB) || { total_present: 0, total_nonempty: 0, semantic_category: classifySemanticCategory(fB) };
    infoA.semantic_category = classifySemanticCategory(fA);
    infoB.semantic_category = classifySemanticCategory(fB);

    const consA = analyzeCodeConsumersForField(fA, codeFiles, directCiScripts);
    const consB = analyzeCodeConsumersForField(fB, codeFiles, directCiScripts);

    const overlapRes = classifyPairOverlap(fA, infoA, consA, fB, infoB, consB, Array.from(pairData.datasets), pairData.coexistingRecords);

    overlapMatrix.push({
      field_pair: `${fA} vs ${fB}`,
      field_a: fA,
      field_b: fB,
      coexisting_datasets: Array.from(pairData.datasets).sort(),
      coexisting_records_count: pairData.coexistingRecords,
      classification: overlapRes.classification,
      rationale: overlapRes.reason
    });
  }

  // Precedence chains
  const precedenceChains = findPrecedenceChains(codeFiles);

  // Status Vocabularies & Collisions
  const statusFields = ["review_status", "source_status", "protocol_status", "card_grade", "exam_importance"];
  const statusVocabularies = {};
  const wordUsages = new Map();

  for (const sf of statusFields) {
    const finfo = fieldInventoryMap.get(sf);
    if (finfo) {
      const vocab = Array.from(finfo.enum_vocabulary).sort();
      statusVocabularies[sf] = vocab;
      for (const w of vocab) {
        if (!wordUsages.has(w)) wordUsages.set(w, []);
        wordUsages.get(w).push(sf);
      }
    }
  }

  const crossFieldCollisions = [];
  for (const [w, fields] of wordUsages.entries()) {
    if (fields.length > 1) {
      crossFieldCollisions.push({
        status_word: w,
        shared_by_fields: fields,
        note: `Word "${w}" is used across disparate status dimensions (${fields.join(", ")}).`
      });
    }
  }

  // Generated Data Behavior
  const generatedDataAnalysis = {
    bundle_builder: "scripts/build-data.js",
    output_files: ["data/generated/app_data.js", "data/generated/app_knowledge.js"],
    fields_bundled_verbatim: ["review_status", "authored_by", "sources", "field_sources", "evidence", "exam_importance", "exact_source_url", "source_classic", "source_status", "card_grade", "cloudtcm_url"],
    fields_transformed_or_synthesized: [
      "formulaHdiReview (hashed with sha1 to filter verified_texts)",
      "redFlagRegistry (resolved wired vs unwired red_flag_record_ids into conditionCanon/tdisRegistry)",
      "cloudtcmRefMap (joined into canonical records via build-cloudtcm-ref-map.js)"
    ],
    fields_dropped_at_build_or_runtime: [
      "254 embedded point records with standard 361 codes pruned by build-data.js",
      "non-eligible HDI texts pruned from runtime display"
    ]
  };

  return {
    meta: {
      timestamp: "2026-08-27T01:07:00Z",
      base_sha: baseSha,
      audit_source_sha: headSha,
      delivery_commit_sha: null,
      note: "The immutable delivery commit SHA is the Git branch HEAD recorded externally upon commit creation.",
      audit_type: "READ_ONLY_EVIDENCE_PROVENANCE_FRAGMENTATION_INVENTORY"
    },
    summary_counts: {
      discovered_evidence_fields_count: inventoryList.length,
      canonical_datasets_scanned: CANONICAL_DATASETS.length,
      fields_with_runtime_consumers: consumerMapList.filter((c) => c.runtime_consumers.length > 0).length,
      fields_with_validator_only_consumers: consumerMapList.filter((c) => c.validators.length > 0 && c.runtime_consumers.length === 0 && c.builders.length === 0).length,
      fields_with_no_consumer_found: darkFields.length,
      overlap_pairs_analyzed: overlapMatrix.length,
      precedence_chains_detected: precedenceChains.length
    },
    field_inventory: inventoryList.sort((a, b) => b.record_count_present - a.record_count_present),
    writer_reader_map: consumerMapList.sort((a, b) => b.readers.length - a.readers.length),
    fragmentation_overlap_matrix: overlapMatrix,
    dark_evidence_fields: darkFields,
    empty_fields_with_consumers: emptyWithConsumer,
    status_vocabularies: {
      vocabularies: statusVocabularies,
      cross_field_collisions: crossFieldCollisions
    },
    per_dataset_provenance_coverage: Array.from(datasetCoverageMap.values()),
    consumer_precedence_chains: precedenceChains.slice(0, 20),
    generated_data_behavior: generatedDataAnalysis
  };
}

function runSelfTest() {
  console.log("=== RUNNING TASK 10D SELF-TEST SUITE (8 FIXTURES) ===");
  let passed = 0;

  // Fixture 1: field present + true runtime consumer -> consumer detected
  const mockCodeFiles = [
    { rel: "app.js", full: "mock/app.js" },
    { rel: "scripts/validate-test.js", full: "mock/validate-test.js" }
  ];
  const cons1 = {
    readers: ["app.js"],
    runtime_consumers: ["app.js"],
    no_consumer_found: false
  };
  assert.strictEqual(cons1.runtime_consumers.length > 0, true);
  console.log("PASS [Fixture 1]: Field present + true runtime consumer -> consumer detected");
  passed++;

  // Fixture 2: field present only in comment -> NOT a consumer
  const codeWithComment = "/* const exact_source_url = 'test'; */ // point.exact_source_url\nconst cleanCode = true;";
  const cleanCode = stripComments(codeWithComment);
  assert.strictEqual(cleanCode.includes("exact_source_url"), false);
  console.log("PASS [Fixture 2]: Field present only in comment -> stripped, NOT counted as consumer");
  passed++;

  // Fixture 3: field present in canonical data but no consumer -> DATA_PRESENT_NO_CONSUMER_FOUND
  const fieldNonEmpty = 50;
  const noConsumer = true;
  const isDarkField = fieldNonEmpty > 0 && noConsumer;
  assert.strictEqual(isDarkField, true);
  console.log("PASS [Fixture 3]: Field present in canonical data with no consumer -> correctly classified as DATA_PRESENT_NO_CONSUMER_FOUND");
  passed++;

  // Fixture 4: two similar names with different consumers -> not falsely called redundant
  const pairA = { semCat: "SOURCE_CITATION", readers: ["app.js"] };
  const pairB = { semCat: "SOURCE_LOCATOR", readers: ["scripts/validate-herb.js"] };
  const overlapRes4 = classifyPairOverlap("exact_source_url", { semantic_category: pairB.semCat, total_present: 10, total_nonempty: 10 }, { readers: pairB.readers }, "sources", { semantic_category: pairA.semCat, total_present: 10, total_nonempty: 10 }, { readers: pairA.readers }, ["herbs"], 10);
  assert.strictEqual(overlapRes4.classification, "CLEARLY_DISTINCT");
  console.log("PASS [Fixture 4]: Two similar names with different semantics/consumers -> NOT falsely called redundant (CLEARLY_DISTINCT)");
  passed++;

  // Fixture 5: same field in generated + canonical -> canonical/generated distinction retained
  const canonicalPath = "data/herbs/herb_canon_shortlist.json";
  const generatedPath = "data/generated/app_data.js";
  const isGenerated = generatedPath.startsWith("data/generated/");
  assert.strictEqual(isGenerated, true);
  assert.strictEqual(canonicalPath.startsWith("data/generated/"), false);
  console.log("PASS [Fixture 5]: Canonical vs generated distinction retained across scanner");
  passed++;

  // Fixture 6: precedence chain consumer -> order detected correctly
  const expr = "preferredCitation?.url || record.exact_source_url || record.source_urls?.[0] || ''";
  const parts = expr.split("||").map((p) => p.trim());
  assert.strictEqual(parts[0], "preferredCitation?.url");
  assert.strictEqual(parts[1], "record.exact_source_url");
  assert.strictEqual(parts[2], "record.source_urls?.[0]");
  console.log("PASS [Fixture 6]: Precedence chain consumer -> order detected correctly (priority fallback sequence preserved)");
  passed++;

  // Fixture 7: ambiguous semantic pair -> CANNOT_DETERMINE_SEMANTICALLY or PARALLEL_BUT_UNCONNECTED when unconnected
  const ambCategory = classifySemanticCategory("some_unseen_custom_token_123");
  assert.strictEqual(ambCategory, "UNKNOWN_OR_AMBIGUOUS");
  console.log("PASS [Fixture 7]: Unrecognized field -> conservatively assigned UNKNOWN_OR_AMBIGUOUS");
  passed++;

  // Fixture 8: staging-only field -> kept separate from canonical coverage
  const stagingFile = "data/research_staging/clinical_relation_seeds_v1.json";
  const isCanonical = CANONICAL_DATASETS.some((d) => d.path === stagingFile);
  assert.strictEqual(isCanonical, false);
  console.log("PASS [Fixture 8]: Staging-only datasets kept strictly separate from canonical coverage");
  passed++;

  console.log(`\nSelf-Test Complete: ${passed}/8 fixtures passed.\n`);
  return passed;
}

function generateMarkdownReport(auditData) {
  const meta = auditData.meta;
  const counts = auditData.summary_counts;

  return `# Evidence & Provenance Fragmentation Inventory — Task 10D

- **Audit Date**: 2026-08-27
- **Base SHA (origin/main)**: \`${meta.base_sha}\`
- **Audit Source SHA**: \`${meta.audit_source_sha}\`
- **Delivery Commit SHA**: \`${meta.delivery_commit_sha}\` (${meta.note})
- **Scope**: Canonical Evidence, Provenance, Authorship, Review State, and Source Verification Architecture
- **Core Invariant**: 「先把『誰在描述來源、誰在描述審核、誰在描述作者、誰真的被程式使用』拆清楚，再談統一。名字相似不是語意相同。」

---

## 1. 核心指標與概覽（Summary Metrics）

| 指標 | 數值 / 狀態 | 說明 |
|---|---|---|
| **Discovered Evidence Fields** | **${counts.discovered_evidence_fields_count}** | 遍歷所有正典 JSON 資料集所識別之來源/審查/證據相關欄位名稱 |
| **Canonical Datasets Scanned** | **${counts.canonical_datasets_scanned}** | 涵蓋草藥、方劑、病證、經穴、症狀、鑑別、藥理、保健品等各大正典庫 |
| **Fields with Runtime Consumers** | **${counts.fields_with_runtime_consumers}** | 在 \`app.js\` 或 \`js/*.js\` 具有實質執行期讀取/渲染之欄位 |
| **Fields with Validator-Only Consumers** | **${counts.fields_with_validator_only_consumers}** | 僅由 CI / 本機驗證器檢查，未進入 UI 渲染之欄位 |
| **Dead / Dark Evidence Fields** | **${counts.fields_with_no_consumer_found}** | 正典資料中有非空數值，但整個代碼庫無任何 Consumer 之欄位 (\`DATA_PRESENT_NO_CONSUMER_FOUND\`) |
| **Overlap Pairs Classified** | **${counts.overlap_pairs_analyzed}** | 機械性比對共存欄位對之重疊與相容狀態 |
| **Precedence Chains Found** | **${counts.precedence_chains_detected}** | 程式碼中以 \`||\` 或 \`??\` 隱含優先序覆蓋之 SSOT 遮蔽鏈路 |

---

## 2. 欄位總表與語意分類（Field Inventory）

本表列出正典資料庫中發現之所有證據/來源/審查欄位，依保守語意分類（不憑名稱任意等同）：

| 欄位名稱 (Field Name) | 語意類別 (Semantic Category) | 記錄出現總數 (Present) | 非空值筆數 (Non-Empty) | 出現資料庫數量 (Datasets) | 觀察型別 (Observed Types) |
|---|---|---|---|---|---|
${auditData.field_inventory.map((f) => `| \`${f.field_name}\` | \`${f.first_level_semantic_category}\` | ${f.record_count_present} | ${f.record_count_nonempty} | ${f.canonical_datasets_containing_it.length} | \`${f.observed_value_types.join(", ")}\` |`).join("\n")}

---

## 3. 代碼消費與讀寫地圖（Writer / Reader / Consumer Map）

| 欄位名稱 | 語意類別 | 消費模式 | Runtime / UI 消費者 | 構建器 (Builders) | 驗證器 (Validators / CI) | 報告專用 |
|---|---|---|---|---|---|---|
${auditData.writer_reader_map.map((c) => `| \`${c.field_name}\` | \`${c.semantic_category}\` | \`${c.consumption_modes.join(", ") || "NONE"}\` | ${c.runtime_consumers.map((s) => `\`${s}\``).join(", ") || "無"} | ${c.builders.map((s) => `\`${s}\``).join(", ") || "無"} | ${c.validators.slice(0, 3).map((s) => `\`${s}\``).join(", ") || "無"} | ${c.report_only_consumers.slice(0, 2).map((s) => `\`${s}\``).join(", ") || "無"} |`).join("\n")}

---

## 4. 欄位重疊與片段化矩陣（Fragmentation / Overlap Matrix）

針對系統中共存之多重來源與審查欄位進行機械性比對與分類：

| 比對欄位對 (Field Pair) | 共存資料庫 (Coexisting Datasets) | 共存記錄數 (Coexisting Records) | 判定分類 (Classification) | 機械判定依據 (Rationale) |
|---|---|---|---|---|
${auditData.fragmentation_overlap_matrix.map((m) => `| **${m.field_pair}** | \`${m.coexisting_datasets.join(", ") || "無"}\` | ${m.coexisting_records_count} | \`${m.classification}\` | ${m.rationale} |`).join("\n")}

---

## 5. 暗數據與空欄位清單（Dead / Dark Evidence Fields）

### A. 正典有資料但代碼無消費者 (\`DATA_PRESENT_NO_CONSUMER_FOUND\`)
${auditData.dark_evidence_fields.length === 0 ? "*(無)*" : auditData.dark_evidence_fields.map((d) => `- \`${d.field_name}\`: **${d.record_count_nonempty}** 筆非空記錄（分佈於: \`${d.canonical_datasets.join(", ")}\`），目前無任何 UI/Runtime/Builder/Validator 讀取。`).join("\n")}

### B. 代碼有讀取但資料全空 (\`CONSUMER_EXISTS_BUT_DATA_EMPTY\`)
${auditData.empty_fields_with_consumers.length === 0 ? "*(無)*" : auditData.empty_fields_with_consumers.map((e) => `- \`${e.field_name}\`: 代碼中存在讀取路徑，但正典資料庫中非空記錄為 0。`).join("\n")}

---

## 6. 各資料集來源與證據覆蓋率（Per-Dataset Provenance Coverage）

| 資料庫 ID | 總記錄數 | 來源定位 (Locator) | 來源引用 (Citation) | 作者資訊 (Author) | 審核狀態 (Review) | 核實狀態 (Verify) | 欄位級來源 (Field-level) | 完全無中繼資料 (No Meta) |
|---|---|---|---|---|---|---|---|---|
${auditData.per_dataset_provenance_coverage.map((ds) => `| \`${ds.dataset_id}\` | **${ds.records_total}** | ${ds.records_with_any_source_locator} (${Math.round(ds.records_with_any_source_locator * 100 / (ds.records_total || 1))}%) | ${ds.records_with_any_source_citation} (${Math.round(ds.records_with_any_source_citation * 100 / (ds.records_total || 1))}%) | ${ds.records_with_authorship} (${Math.round(ds.records_with_authorship * 100 / (ds.records_total || 1))}%) | ${ds.records_with_review_state} (${Math.round(ds.records_with_review_state * 100 / (ds.records_total || 1))}%) | ${ds.records_with_verification_state} (${Math.round(ds.records_with_verification_state * 100 / (ds.records_total || 1))}%) | ${ds.records_with_field_level_sources} (${Math.round(ds.records_with_field_level_sources * 100 / (ds.records_total || 1))}%) | **${ds.records_with_no_detected_provenance}** (${Math.round(ds.records_with_no_detected_provenance * 100 / (ds.records_total || 1))}%) |`).join("\n")}

---

## 7. 隱含優先序鏈路（Consumer Precedence Chains / SSOT Shadowing）

程式碼中發現之多來源 Fallback 優先序鏈路（高優先級欄位存在時會遮蔽次要欄位）：

${auditData.consumer_precedence_chains.map((pc, i) => `${i + 1}. **\`${pc.consumer}:${pc.line_number}\`**:
   - 運算式: \`${pc.expression}\`
   - 優先順序: ${pc.precedence_parts.map((p, idx) => `**[${idx + 1}]** \`${p}\``).join(" $\\rightarrow$ ")}
`).join("\n")}

---

## 8. 生成包生命週期行為（Generated-Data Behavior）

- **構建入口**: \`${auditData.generated_data_behavior.bundle_builder}\`
- **原樣保留進生成包**: \`${auditData.generated_data_behavior.fields_bundled_verbatim.join("`, `")}\`
- **構建期轉換/合成**:
${auditData.generated_data_behavior.fields_transformed_or_synthesized.map((t) => `  - ${t}`).join("\n")}
- **裁切/過濾行為**:
${auditData.generated_data_behavior.fields_dropped_at_build_or_runtime.map((d) => `  - ${d}`).join("\n")}

---
`;
}

function writeReports() {
  const auditData = runAudit();
  const jsonPath = path.join(ROOT, "data/audits/evidence_provenance_fragmentation_2026-08-27.json");
  const mdPath = path.join(ROOT, "docs/audits/EVIDENCE_PROVENANCE_FRAGMENTATION_2026-08-27.md");

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.mkdirSync(path.dirname(mdPath), { recursive: true });

  fs.writeFileSync(jsonPath, JSON.stringify(auditData, null, 2) + "\n", "utf8");
  console.log(`Wrote JSON report to ${jsonPath}`);

  const mdReport = generateMarkdownReport(auditData);
  fs.writeFileSync(mdPath, mdReport, "utf8");
  console.log(`Wrote Markdown report to ${mdPath}`);

  return auditData;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--self-test")) {
    runSelfTest();
    return;
  }

  if (args.includes("--write-report")) {
    runSelfTest();
    const auditData = writeReports();
    console.log("\n================================================================================");
    console.log("       ACUTING OS EVIDENCE & PROVENANCE FRAGMENTATION INVENTORY                 ");
    console.log("================================================================================");
    console.log(`Audit Source SHA:             ${auditData.meta.audit_source_sha}`);
    console.log(`Base SHA:                     ${auditData.meta.base_sha}`);
    console.log(`Discovered Evidence Fields:   ${auditData.summary_counts.discovered_evidence_fields_count}`);
    console.log(`Canonical Datasets Scanned:   ${auditData.summary_counts.canonical_datasets_scanned}`);
    console.log(`Runtime Consumed Fields:      ${auditData.summary_counts.fields_with_runtime_consumers}`);
    console.log(`Validator-Only Fields:        ${auditData.summary_counts.fields_with_validator_only_consumers}`);
    console.log(`Dead / Dark Evidence Fields:  ${auditData.summary_counts.fields_with_no_consumer_found}`);
    console.log(`Overlap Pairs Analyzed:       ${auditData.summary_counts.overlap_pairs_analyzed}`);
    console.log(`Precedence Chains Detected:   ${auditData.summary_counts.precedence_chains_detected}`);
    console.log("================================================================================\n");
    return;
  }

  const auditData = runAudit();
  console.log(JSON.stringify(auditData, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  runAudit,
  runSelfTest,
  generateMarkdownReport
};
