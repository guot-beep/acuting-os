#!/usr/bin/env node
/**
 * audit-evidence-provenance-fragmentation.js — Task 10D Round 4: Generated Provenance Proof
 *
 * READ-ONLY deterministic audit evaluating how evidence, provenance, authorship, source verification,
 * and review-state concepts are currently represented across AcuTing OS.
 *
 * Core Invariant:
 *   "SURVIVES_VERBATIM means the same canonical record carried the same field value into a runtime-loaded artifact. A matching field name somewhere else is insufficient."
 *
 * Features:
 *   --self-test     : Executes 8 algorithmic regression fixtures asserting lexical stripping, occurrence-level
 *                     reader/writer separation, operand-level precedence detection, and record-level build survival.
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
const vm = require("vm");
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
  CANDIDATE_RELATED_FIELD: "CANDIDATE_RELATED_FIELD",
  UNKNOWN_OR_AMBIGUOUS: "UNKNOWN_OR_AMBIGUOUS"
};

// 2. Canonical Datasets Scope (Pure metadata, zero hand-written is_bundled)
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

// Explicit Non-Provenance Fields (Kept in CANDIDATE_RELATED_FIELD, excluded from provenance totals)
const NON_PROVENANCE_FIELDS = new Set([
  "rx_otc_status", "exam_importance", "examimportance", "course_level_en", "course_level_zh",
  "acupoint_protocols", "claim_status", "image_full_url", "image_thumb_url", "atlas_url",
  "diagram_urls_zh", "diagram_urls_en", "total_count", "updated_at", "schema_version"
]);

function classifySemanticCategory(fieldName) {
  const k = fieldName.toLowerCase();

  // Excluded candidate non-provenance concepts
  if (NON_PROVENANCE_FIELDS.has(k)) {
    return SEMANTIC_CATEGORIES.CANDIDATE_RELATED_FIELD;
  }

  // Locators
  if (k === "source_url" || k === "source_urls" || k === "exact_source_url" || k === "safety_source_url" || k === "cloudtcm_url" || k === "american_dragon_url" || k === "dailymed_url" || k === "dailymed_setid" || k === "sources_to_check" || k === "source_sitemap_url" || k === "source_index_url" || k === "source_search_api") {
    return SEMANTIC_CATEGORIES.SOURCE_LOCATOR;
  }

  // Authorship
  if (k === "authored_by" || k === "created_by" || k === "author" || k === "author_role" || k === "authorities" || k === "content_source" || k === "pharm_source") {
    return SEMANTIC_CATEGORIES.AUTHORSHIP;
  }

  // Evidence Strength
  if (k === "evidence" || k === "evidence_level" || k === "evidence_grade" || k === "card_grade" || k === "acupoint_protocol_evidence" || k === "d_clinical_evidence" || k === "official_evidence" || k === "index_evidence" || k === "repo_evidence") {
    return SEMANTIC_CATEGORIES.EVIDENCE_STRENGTH;
  }

  // Review State
  if (k === "review_status" || k === "protocol_status" || k === "last_reviewed" || k === "reviewed_by" || k === "reviewer" || k === "reviewed" || k === "review_note" || k === "review_notes" || k === "review_rule" || k === "review_policy" || k === "safety_review" || k === "reviewer_decision" || k === "reviewer_note" || k === "review_fields") {
    return SEMANTIC_CATEGORIES.REVIEW_STATE;
  }

  // Verification State
  if (k === "source_status" || k === "verification_status" || k === "verified_by" || k === "verified" || k === "verified_at" || k === "verified_entries_reused" || k === "default_source_status" || k === "source_pending") {
    return SEMANTIC_CATEGORIES.VERIFICATION_STATE;
  }

  // Provenance / Staging Origin
  if (k === "provenance" || k === "origin" || k === "source_type" || k === "staging_source" || k === "provenance_notes" || k === "original_shape" || k === "source_field" || k === "source_hint" || k === "source_of_truth_fields" || k === "source_priority" || k === "source_files" || k === "source_file" || k === "source_collection_results" || k === "source_entries" || k === "source_index") {
    return SEMANTIC_CATEGORIES.PROVENANCE;
  }

  // Import History
  if (k === "import_artifacts" || k === "import_staging" || k === "live_counts_at_source_commit" || k === "content_import_rule" || k === "duplicated_for_provenance" || k === "granule_catalog_status" || k === "import_policy") {
    return SEMANTIC_CATEGORIES.IMPORT_HISTORY;
  }

  // Citations / Sources
  if (k === "source" || k === "sources" || k === "source_citations" || k === "citation" || k === "citations" || k === "reference" || k === "references" || k === "field_sources" || k === "dose_source" || k === "safety_source" || k === "safety_flag_sources" || k === "source_classic" || k === "source_hierarchy" || k === "herb_drug_interaction_sources" || k === "tcm_source" || k === "western_source" || k === "fda_label_source" || k === "source_reference" || k === "classic_formula_source_zh" || k === "classic_formula_source_en" || k === "herb_pair_source_note_zh" || k === "herb_pair_source_note_en" || k === "overdose_source_note" || k === "hierarchy_source_zh") {
    return SEMANTIC_CATEGORIES.SOURCE_CITATION;
  }

  return SEMANTIC_CATEGORIES.UNKNOWN_OR_AMBIGUOUS;
}

// 3. String-Aware Lexical Stripper (URL strings and template literals stay intact)
function stripCommentsLexical(code) {
  let result = "";
  let i = 0;
  const len = code.length;

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;

  while (i < len) {
    const ch = code[i];
    const next = i + 1 < len ? code[i + 1] : "";

    if (inLineComment) {
      if (ch === "\n" || ch === "\r") {
        inLineComment = false;
        result += ch;
      }
      i++;
      continue;
    }

    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i += 2;
        continue;
      }
      if (ch === "\n") result += "\n";
      i++;
      continue;
    }

    if (inSingleQuote) {
      result += ch;
      if (ch === "\\" && next) {
        result += next;
        i += 2;
        continue;
      }
      if (ch === "'") inSingleQuote = false;
      i++;
      continue;
    }

    if (inDoubleQuote) {
      result += ch;
      if (ch === "\\" && next) {
        result += next;
        i += 2;
        continue;
      }
      if (ch === '"') inDoubleQuote = false;
      i++;
      continue;
    }

    if (inTemplate) {
      result += ch;
      if (ch === "\\" && next) {
        result += next;
        i += 2;
        continue;
      }
      if (ch === "`") inTemplate = false;
      i++;
      continue;
    }

    // Not in string or comment
    if (ch === "/" && next === "/") {
      inLineComment = true;
      i += 2;
      continue;
    }

    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i += 2;
      continue;
    }

    if (ch === "'") {
      inSingleQuote = true;
      result += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inDoubleQuote = true;
      result += ch;
      i++;
      continue;
    }

    if (ch === "`") {
      inTemplate = true;
      result += ch;
      i++;
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

function discoverCodeFiles(baseDir) {
  const files = [];
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(ROOT, full).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        // Exclude data directories (data is static data artifact, not code consumer)
        if (rel.startsWith("node_modules") || rel.startsWith(".git") || rel.startsWith("data") || rel.startsWith("scratch") || rel.startsWith("curriculum")) {
          continue;
        }
        scan(full);
      } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".html") || entry.name.endsWith(".yml") || entry.name.endsWith(".sql"))) {
        if (rel !== "scripts/audit-evidence-provenance-fragmentation.js") {
          files.push({ rel, full });
        }
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

function buildCleanCodeCache(codeFiles) {
  const cache = new Map();
  for (const { rel, full } of codeFiles) {
    try {
      const raw = fs.readFileSync(full, "utf8");
      cache.set(rel, stripCommentsLexical(raw));
    } catch {
      cache.set(rel, "");
    }
  }
  return cache;
}

// Occurrence-Level Classifier
function classifyOccurrencesInCode(cleanCode, fieldName, filename, directCiScripts = new Set()) {
  const modes = new Set();
  let writeCount = 0;
  let readCount = 0;
  let displayCount = 0;
  let isValidator = false;
  let isBuilder = false;
  let isCi = false;
  let isReportOnly = false;

  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // 1. Write occurrences
  const assignPattern = new RegExp(`(?:\\.${escaped}|\\[['"]${escaped}['"]\\])\\s*=(?!=)`, "g");
  const objKeyPattern = new RegExp(`(?:[{,]\\s*|\\n\\s*)(['"]?)${escaped}\\1\\s*:\\s*(?!\\w+\\.${escaped})`, "g");
  const copyPattern = new RegExp(`(?:[{,]\\s*|\\n\\s*)(['"]?)${escaped}\\1\\s*:\\s*\\w+\\.${escaped}`, "g");

  let match;
  while ((match = assignPattern.exec(cleanCode)) !== null) {
    writeCount++;
    modes.add("WRITES");
  }

  while ((match = objKeyPattern.exec(cleanCode)) !== null) {
    writeCount++;
    modes.add("WRITES");
  }

  while ((match = copyPattern.exec(cleanCode)) !== null) {
    writeCount++;
    readCount++;
    modes.add("WRITES");
    modes.add("READS_VALUE");
    modes.add("COPIES_THROUGH");
  }

  // 2. Read occurrences
  const readMemberPattern = new RegExp(`(?:\\b\\w+\\.|\\[['"])${escaped}(?:['"]\\]|\\b)(?!\\s*=(?!=))`, "g");
  while ((match = readMemberPattern.exec(cleanCode)) !== null) {
    const idx = match.index;
    const start = Math.max(0, idx - 40);
    const end = Math.min(cleanCode.length, idx + match[0].length + 40);
    const snippet = cleanCode.substring(start, end);

    readCount++;
    modes.add("READS_VALUE");

    if (/===|!==|switch\s*\(/.test(snippet)) {
      modes.add("CHECKS_ENUM");
    }

    if (/hasOwnProperty|' in |" in |Boolean\(/.test(snippet)) {
      modes.add("CHECKS_PRESENCE");
    }

    if (/\.map\(|adapt|\.filter\(|\.split\(|JSON\.parse\(/.test(snippet)) {
      modes.add("TRANSFORMS");
    }

    if ((filename === "app.js" || filename.endsWith(".html") || filename.startsWith("js/")) &&
        (/\$\{[^}]*?\b\w+\./.test(snippet) || /innerHTML\s*=|textContent\s*=/.test(snippet))) {
      displayCount++;
      modes.add("DISPLAYS");
    }
  }

  if (filename.startsWith("scripts/validate-") || filename.startsWith("scripts/check-") || filename.startsWith("scripts/test-")) {
    isValidator = true;
    if (directCiScripts.has(filename)) isCi = true;
  } else if (filename.startsWith("scripts/build-") || filename === "scripts/build-data.js") {
    isBuilder = true;
    modes.add("COPIES_THROUGH");
  } else if (filename.startsWith("scripts/report-") || filename.startsWith("scripts/audit-")) {
    isReportOnly = true;
    if (directCiScripts.has(filename)) isCi = true;
  }

  return {
    filename,
    modes: Array.from(modes).sort(),
    isWriter: writeCount > 0,
    isReader: readCount > 0,
    isDisplay: displayCount > 0,
    isValidator,
    isBuilder,
    isCi,
    isReportOnly
  };
}

function analyzeCodeConsumersForField(fieldName, codeFiles, directCiScripts, cleanCache = null) {
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
      const clean = cleanCache ? (cleanCache.get(rel) || "") : stripCommentsLexical(fs.readFileSync(full, "utf8"));
      const res = classifyOccurrencesInCode(clean, fieldName, rel, directCiScripts);

      if (res.isWriter) {
        consumers.writers.push(rel);
      }
      if (res.isReader) {
        consumers.readers.push(rel);
        if (rel === "app.js" || rel.endsWith(".html") || rel.startsWith("js/")) {
          consumers.runtime_consumers.push(rel);
        }
        if (rel === "app.js" || rel.endsWith(".html")) {
          consumers.ui_consumers.push(rel);
        }
      }
      if (res.isValidator) consumers.validators.push(rel);
      if (res.isBuilder) consumers.builders.push(rel);
      if (res.isCi) consumers.ci_consumers.push(rel);
      if (res.isReportOnly) consumers.report_only_consumers.push(rel);

      for (const m of res.modes) {
        consumers.consumption_modes.add(m);
      }
    } catch {
      // skip unreadable
    }
  }

  consumers.no_consumer_found = consumers.readers.length === 0 && consumers.writers.length === 0;
  return consumers;
}

// Operand-Level Precedence Chain Extractor
function extractPrecedenceChainsFromCode(cleanCode, filename, provenanceFields) {
  const lines = cleanCode.split(/\r?\n/);
  const chains = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line.includes("||") && !line.includes("??")) continue;
    if (line.includes("===") || line.includes("!==")) continue;

    let expr = line;
    if (expr.includes(":") && !expr.includes("?")) {
      const colonIdx = expr.indexOf(":");
      expr = expr.substring(colonIdx + 1);
    } else if (expr.includes("=") && !expr.includes("==") && !expr.includes("=>")) {
      const eqIdx = expr.indexOf("=");
      expr = expr.substring(eqIdx + 1);
    }

    const rawOperands = expr.split(/\|\||\?\?/);
    if (rawOperands.length < 2) continue;

    const matchedFieldsInOrder = [];
    for (const op of rawOperands) {
      const cleanOp = op.replace(/"[^"]*"|'[^']*'|`[^`]*`/g, "");
      const memberMatch = cleanOp.match(/\b\w+\.([a-zA-Z0-9_]+)\b/);
      if (memberMatch) {
        const propName = memberMatch[1];
        if (provenanceFields.has(propName)) {
          if (!matchedFieldsInOrder.includes(propName)) {
            matchedFieldsInOrder.push(propName);
          }
        }
      }
    }

    if (matchedFieldsInOrder.length >= 2) {
      chains.push({
        consumer: filename,
        line_number: i + 1,
        expression: line,
        ordered_fields: matchedFieldsInOrder,
        ignored_when_higher_priority_populated: matchedFieldsInOrder.slice(1)
      });
    }
  }

  return chains;
}

function findTruePrecedenceChains(codeFiles, provenanceFieldSet, cleanCache = null) {
  const chains = [];
  for (const { rel, full } of codeFiles) {
    if (rel.startsWith("data/") || rel.startsWith("scratch/") || rel === "scripts/audit-evidence-provenance-fragmentation.js") continue;
    try {
      const clean = cleanCache ? (cleanCache.get(rel) || "") : stripCommentsLexical(fs.readFileSync(full, "utf8"));
      const found = extractPrecedenceChainsFromCode(clean, rel, provenanceFieldSet);
      chains.push(...found);
    } catch {}
  }
  return chains;
}

function evaluateRecordLevelCorrelation(fieldA, fieldB, coexistingDatasetIds, canonicalRecordsMap = null) {
  let totalEvaluated = 0;
  let totalIdentical = 0;

  for (const dsId of coexistingDatasetIds) {
    let arr = canonicalRecordsMap ? canonicalRecordsMap.get(dsId) : null;
    if (!arr) {
      const dsDef = CANONICAL_DATASETS.find((d) => d.id === dsId);
      if (!dsDef) continue;
      const fullPath = path.join(ROOT, dsDef.path);
      if (!fs.existsSync(fullPath)) continue;
      try {
        const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
        arr = Array.isArray(parsed) ? parsed : parsed.records || parsed.items || [];
      } catch {
        continue;
      }
    }
    for (const r of arr) {
      if (!r || typeof r !== "object") continue;
      if (fieldA in r && fieldB in r) {
        totalEvaluated++;
        if (JSON.stringify(r[fieldA]) === JSON.stringify(r[fieldB])) {
          totalIdentical++;
        }
      }
    }
  }

  return {
    records_evaluated: totalEvaluated,
    identical_count: totalIdentical,
    correlation_ratio: totalEvaluated > 0 ? totalIdentical / totalEvaluated : 0
  };
}

function classifyPairOverlap(fieldA, infoA, consA, fieldB, infoB, consB, coexistingDatasets, coexistingRecords, canonicalRecordsMap = null) {
  if (coexistingRecords === 0) {
    return {
      classification: "PARALLEL_BUT_UNCONNECTED",
      reason: "Fields do not coexist within the same canonical records."
    };
  }

  const semA = infoA.semantic_category;
  const semB = infoB.semantic_category;

  if (semA !== semB) {
    return {
      classification: "CLEARLY_DISTINCT",
      reason: `Fields serve different semantic dimensions (${semA} vs ${semB}).`
    };
  }

  const correlation = evaluateRecordLevelCorrelation(fieldA, fieldB, coexistingDatasets, canonicalRecordsMap);
  const sharedConsumers = consA.readers.filter((c) => consB.readers.includes(c));

  if (correlation.correlation_ratio === 1.0 && sharedConsumers.length > 0) {
    return {
      classification: "MECHANICALLY_REDUNDANT",
      reason: `Record values are 100% identical (${correlation.identical_count}/${correlation.records_evaluated}) across coexisting datasets and consumed by overlapping code paths.`
    };
  }

  if (correlation.correlation_ratio > 0 && correlation.correlation_ratio < 1.0) {
    return {
      classification: "PARTIAL_OVERLAP",
      reason: `Fields share semantic category and exhibit partial value correlation (${Math.round(correlation.correlation_ratio * 100)}% identical across ${correlation.records_evaluated} records).`
    };
  }

  if (correlation.records_evaluated > 0 && correlation.identical_count === 0) {
    return {
      classification: "CLEARLY_DISTINCT",
      reason: `Fields share category but represent strictly distinct values across all ${correlation.records_evaluated} coexisting records.`
    };
  }

  return {
    classification: "CANNOT_DETERMINE_SEMANTICALLY",
    reason: "Value equivalence cannot be mechanically proven across observed data and code paths."
  };
}

// 4. Nested Field Path Accessor
function getNestedValue(obj, fieldPath) {
  if (!obj || typeof obj !== "object") return undefined;
  const parts = fieldPath.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

// 5. Dynamic Build-Graph & Runtime Bundle Loader
function loadRuntimeBundles() {
  const indexHtmlPath = path.join(ROOT, "index.html");
  const loadedFiles = [];
  if (fs.existsSync(indexHtmlPath)) {
    const text = fs.readFileSync(indexHtmlPath, "utf8");
    const re = /src=["'](data\/generated\/[^"']+)["']/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      loadedFiles.push(m[1]);
    }
  }

  const sandbox = { globalThis: {}, window: {}, console: { log: () => {}, warn: () => {}, error: () => {} } };
  sandbox.window = sandbox.globalThis;
  const ctx = vm.createContext(sandbox);

  for (const rel of loadedFiles) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    try {
      const code = fs.readFileSync(full, "utf8");
      vm.runInContext(code, ctx);
    } catch (e) {}
  }

  const K = sandbox.globalThis.ACUTING_KNOWLEDGE || {};
  const A = sandbox.globalThis.ACUTING_APP_DATA || {};
  const P = sandbox.globalThis.ACUTING_POINTS_361 || sandbox.globalThis.POINTS_361 || [];

  const collections = new Map();
  function addCollection(name, val) {
    if (!val) return;
    if (Array.isArray(val)) {
      collections.set(name, val);
    } else if (typeof val === "object") {
      if (Array.isArray(val.records)) collections.set(name, val.records);
      else if (Array.isArray(val.items)) collections.set(name, val.items);
      else if (Array.isArray(val.entries)) collections.set(name, val.entries);
      else if (val.entries && typeof val.entries === "object") collections.set(name, Object.values(val.entries));
      else collections.set(name, [val]);
    }
  }

  for (const [k, v] of Object.entries(A)) addCollection(`appData.${k}`, v);
  for (const [k, v] of Object.entries(K)) addCollection(`knowledge.${k}`, v);
  if (Array.isArray(P) && P.length > 0) collections.set("points_361", P);

  return collections;
}

function evaluateDatasetSurvivalDeep(canonicalRecords, generatedRecords, fieldPath) {
  if (!generatedRecords || generatedRecords.length === 0) {
    return {
      status: "NOT_BUNDLED",
      evidence: "Dataset has no runtime-loaded generated build path"
    };
  }

  const genMap = new Map();
  for (const g of generatedRecords) {
    if (!g || typeof g !== "object") continue;
    const gId = g.id || g.code || g.name_zh || g.name_en;
    if (gId) genMap.set(String(gId), g);
  }

  let totalSampled = 0;
  let verbatimCount = 0;
  let transformedCount = 0;
  let droppedCount = 0;

  for (const cRec of canonicalRecords) {
    if (!cRec || typeof cRec !== "object") continue;
    const cVal = getNestedValue(cRec, fieldPath);
    if (cVal === undefined || cVal === null || cVal === "" || (Array.isArray(cVal) && cVal.length === 0)) {
      continue;
    }

    const cId = cRec.id || cRec.code || cRec.name_zh || cRec.name_en;
    if (!cId) continue;

    totalSampled++;
    const gRec = genMap.get(String(cId));
    if (!gRec) {
      droppedCount++;
      continue;
    }

    const gVal = getNestedValue(gRec, fieldPath);
    if (gVal === undefined || gVal === null) {
      droppedCount++;
    } else if (JSON.stringify(cVal) === JSON.stringify(gVal)) {
      verbatimCount++;
    } else {
      transformedCount++;
    }
  }

  if (totalSampled === 0) {
    return {
      status: "NOT_BUNDLED",
      evidence: "No non-empty canonical records observed for field path"
    };
  }

  if (verbatimCount === totalSampled) {
    return {
      status: "SURVIVES_VERBATIM",
      evidence: `100% value equality verified across ${verbatimCount}/${totalSampled} sampled records`
    };
  }

  if (verbatimCount > 0 && (droppedCount > 0 || transformedCount > 0)) {
    return {
      status: "TRANSFORMED",
      evidence: `Partial/transformed survival (${verbatimCount} verbatim, ${transformedCount} transformed, ${droppedCount} dropped across ${totalSampled} records)`
    };
  }

  if (transformedCount > 0 && droppedCount === 0) {
    return {
      status: "TRANSFORMED",
      evidence: `Values transformed across ${transformedCount}/${totalSampled} records`
    };
  }

  if (droppedCount === totalSampled) {
    return {
      status: "DROPPED",
      evidence: `Field omitted from all ${droppedCount} generated runtime records`
    };
  }

  return {
    status: "CANNOT_DETERMINE",
    evidence: "Indeterminate survival state"
  };
}

function evaluateGeneratedSurvival(provenanceFields, canonicalRecordsMap, runtimeCollections) {
  // Dynamically map canonical datasets to runtime generated collections
  const datasetToGeneratedMap = new Map();

  for (const d of CANONICAL_DATASETS) {
    const canRecords = canonicalRecordsMap.get(d.id) || [];
    if (canRecords.length === 0) {
      datasetToGeneratedMap.set(d.id, null);
      continue;
    }

    const sampleIds = new Set();
    for (const r of canRecords.slice(0, 15)) {
      const id = r.id || r.code || r.name_zh;
      if (id) sampleIds.add(String(id));
    }

    let matchedGenRecords = null;
    let maxMatches = 0;

    for (const [colName, genRecords] of runtimeCollections.entries()) {
      let matchCount = 0;
      for (const g of genRecords) {
        if (!g || typeof g !== "object") continue;
        const gId = g.id || g.code || g.name_zh;
        if (gId && sampleIds.has(String(gId))) {
          matchCount++;
        }
      }
      if (matchCount > maxMatches && matchCount >= Math.min(2, sampleIds.size)) {
        maxMatches = matchCount;
        matchedGenRecords = genRecords;
      }
    }

    datasetToGeneratedMap.set(d.id, matchedGenRecords);
  }

  const results = [];
  for (const f of provenanceFields) {
    let observedStatus = "NOT_BUNDLED";
    let observedEvidence = "Dataset not in runtime build path";

    for (const d of CANONICAL_DATASETS) {
      const records = canonicalRecordsMap.get(d.id) || [];
      const hasField = records.some((r) => r && getNestedValue(r, f) !== undefined && getNestedValue(r, f) !== null && getNestedValue(r, f) !== "");
      if (!hasField) continue;

      const genRecords = datasetToGeneratedMap.get(d.id);
      const res = evaluateDatasetSurvivalDeep(records, genRecords, f);

      if (res.status === "SURVIVES_VERBATIM" || (observedStatus === "NOT_BUNDLED" && res.status !== "NOT_BUNDLED")) {
        observedStatus = res.status;
        observedEvidence = `${d.id}: ${res.evidence}`;
      }
    }

    results.push({
      field_name: f,
      status: observedStatus,
      evidence: observedEvidence
    });
  }

  return results;
}

function runAudit() {
  const headSha = getGitSha("HEAD");
  const baseSha = getGitSha("origin/main");
  const codeFiles = discoverCodeFiles(ROOT);
  const directCiScripts = loadDirectCiScripts();
  const cleanCache = buildCleanCodeCache(codeFiles);
  const runtimeCollections = loadRuntimeBundles();

  const fieldInventoryMap = new Map();
  const datasetCoverageMap = new Map();
  const coexistingPairsTracker = new Map();
  const canonicalRecordsMap = new Map();
  const discoveredProvenanceFieldsSet = new Set();

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

    canonicalRecordsMap.set(d.id, records);

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
          const cat = classifySemanticCategory(k);

          if (cat !== SEMANTIC_CATEGORIES.UNKNOWN_OR_AMBIGUOUS) {
            recEvidenceKeys.add(k);
            if (cat !== SEMANTIC_CATEGORIES.CANDIDATE_RELATED_FIELD) {
              discoveredProvenanceFieldsSet.add(k);
            }

            if (!fieldInventoryMap.has(k)) {
              fieldInventoryMap.set(k, {
                field_name: k,
                semantic_category: cat,
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

            if (isNonEmpty && cat !== SEMANTIC_CATEGORIES.CANDIDATE_RELATED_FIELD) {
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
  const candidateRelatedList = [];
  const consumerMapList = [];
  const darkFields = [];
  const emptyWithConsumer = [];

  for (const [k, finfo] of fieldInventoryMap.entries()) {
    const semCat = finfo.semantic_category;
    const cons = analyzeCodeConsumersForField(k, codeFiles, directCiScripts, cleanCache);

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

    if (semCat === SEMANTIC_CATEGORIES.CANDIDATE_RELATED_FIELD) {
      candidateRelatedList.push(item);
      continue;
    }

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
    ["evidence", "sources"]
  ];

  const overlapMatrix = [];
  for (const [fA, fB] of targetedPairs) {
    const pairKey = [fA, fB].sort().join(" <-> ");
    const pairData = coexistingPairsTracker.get(pairKey) || { datasets: new Set(), coexistingRecords: 0 };
    const infoA = fieldInventoryMap.get(fA) || { total_present: 0, total_nonempty: 0, semantic_category: classifySemanticCategory(fA) };
    const infoB = fieldInventoryMap.get(fB) || { total_present: 0, total_nonempty: 0, semantic_category: classifySemanticCategory(fB) };
    infoA.semantic_category = classifySemanticCategory(fA);
    infoB.semantic_category = classifySemanticCategory(fB);

    const consA = analyzeCodeConsumersForField(fA, codeFiles, directCiScripts, cleanCache);
    const consB = analyzeCodeConsumersForField(fB, codeFiles, directCiScripts, cleanCache);

    const overlapRes = classifyPairOverlap(fA, infoA, consA, fB, infoB, consB, Array.from(pairData.datasets), pairData.coexistingRecords, canonicalRecordsMap);

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

  // Precedence chains (Strict Operand Extraction)
  const truePrecedenceChains = findTruePrecedenceChains(codeFiles, discoveredProvenanceFieldsSet, cleanCache);

  // Status Vocabularies & Collisions
  const statusFields = ["review_status", "source_status", "protocol_status", "card_grade"];
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

  // Generated Data Behavior (Mechanically evaluated across build graph)
  const generatedDataBehavior = evaluateGeneratedSurvival(Array.from(discoveredProvenanceFieldsSet), canonicalRecordsMap, runtimeCollections);

  return {
    meta: {
      timestamp: "2026-08-27T01:42:00Z",
      base_sha: baseSha,
      audit_source_sha: headSha,
      delivery_commit_sha: null,
      note: "The immutable delivery commit SHA is the Git branch HEAD recorded externally upon commit creation.",
      audit_type: "READ_ONLY_EVIDENCE_PROVENANCE_FRAGMENTATION_INVENTORY"
    },
    summary_counts: {
      discovered_evidence_fields_count: inventoryList.length,
      candidate_related_fields_count: candidateRelatedList.length,
      canonical_datasets_scanned: CANONICAL_DATASETS.length,
      fields_with_runtime_consumers: consumerMapList.filter((c) => c.runtime_consumers.length > 0).length,
      fields_with_validator_only_consumers: consumerMapList.filter((c) => c.validators.length > 0 && c.runtime_consumers.length === 0 && c.builders.length === 0).length,
      fields_with_no_consumer_found: darkFields.length,
      overlap_pairs_analyzed: overlapMatrix.length,
      precedence_chains_detected: truePrecedenceChains.length
    },
    field_inventory: inventoryList.sort((a, b) => b.record_count_present - a.record_count_present),
    candidate_related_fields: candidateRelatedList.sort((a, b) => b.record_count_present - a.record_count_present),
    writer_reader_map: consumerMapList.sort((a, b) => b.readers.length - a.readers.length),
    fragmentation_overlap_matrix: overlapMatrix,
    dark_evidence_fields: darkFields,
    empty_fields_with_consumers: emptyWithConsumer,
    status_vocabularies: {
      vocabularies: statusVocabularies,
      cross_field_collisions: crossFieldCollisions
    },
    per_dataset_provenance_coverage: Array.from(datasetCoverageMap.values()),
    consumer_precedence_chains: truePrecedenceChains.slice(0, 25),
    generated_data_behavior: generatedDataBehavior
  };
}

function runSelfTest() {
  console.log("=== RUNNING TASK 10D ROUND 4 REGRESSION SUITE (8 FIXTURES) ===");
  let passed = 0;

  // Fixture 1: comment-only field -> analyzer reports no consumer
  const mockCommentFile = [{ rel: "mock1.js", full: "mock1.js" }];
  const fsReadBackup = fs.readFileSync;
  fs.readFileSync = (p) => p === "mock1.js" ? "/* record.exact_source_url = 'test'; */ // record.exact_source_url" : fsReadBackup(p);
  const cons1 = analyzeCodeConsumersForField("exact_source_url", mockCommentFile, new Set());
  fs.readFileSync = fsReadBackup;
  assert.strictEqual(cons1.no_consumer_found, true);
  console.log("PASS [Fixture 1]: Comment-only field -> lexical stripper ignores comments, analyzer reports no consumer");
  passed++;

  // Fixture 2: URL string containing // -> parser preserves string literal verbatim
  const mockUrlCode = 'const x = record.source_url || "https://example.com/api//v1";';
  const strippedUrlCode = stripCommentsLexical(mockUrlCode);
  assert.ok(strippedUrlCode.includes("https://example.com/api//v1"));
  assert.ok(strippedUrlCode.includes("record.source_url"));
  console.log("PASS [Fixture 2]: URL string containing // -> lexical parser preserves string literal verbatim");
  passed++;

  // Fixture 3: read-only occurrence -> reader, not writer
  const mockReadFile = [{ rel: "mock_read.js", full: "mock_read.js" }];
  fs.readFileSync = (p) => p === "mock_read.js" ? "const val = record.sources?.[0];" : fsReadBackup(p);
  const cons3 = analyzeCodeConsumersForField("sources", mockReadFile, new Set());
  fs.readFileSync = fsReadBackup;
  assert.strictEqual(cons3.readers.length, 1);
  assert.strictEqual(cons3.writers.length, 0);
  assert.strictEqual(cons3.consumption_modes.has("READS_VALUE"), true);
  assert.strictEqual(cons3.consumption_modes.has("WRITES"), false);
  console.log("PASS [Fixture 3]: Read-only occurrence -> correctly classified as reader, NOT writer");
  passed++;

  // Fixture 4: write-only occurrence (including real app-style write-only) -> writers.length=1, readers.length=0, runtime reader=false
  const mockWriteFile = [{ rel: "app.js", full: "app.js" }];
  fs.readFileSync = (p) => p === "app.js" ? "const payload = { authored_by: 'Ting' };\npoint.source_status = 'draft';" : fsReadBackup(p);
  const cons4 = analyzeCodeConsumersForField("authored_by", mockWriteFile, new Set());
  fs.readFileSync = fsReadBackup;
  assert.strictEqual(cons4.writers.length, 1);
  assert.strictEqual(cons4.readers.length, 0);
  assert.strictEqual(cons4.runtime_consumers.length, 0);
  assert.strictEqual(cons4.consumption_modes.has("WRITES"), true);
  assert.strictEqual(cons4.consumption_modes.has("READS_VALUE"), false);
  assert.strictEqual(cons4.consumption_modes.has("DISPLAYS"), false);
  console.log("PASS [Fixture 4]: App-style write-only occurrence -> writer=1, reader=0, runtime reader=0, DISPLAYS=false");
  passed++;

  // Fixture 5: two same-occupancy fields with different values -> NOT redundant
  const diffValOverlap = classifyPairOverlap("exact_source_url", { semantic_category: "SOURCE_LOCATOR" }, { readers: ["app.js"] }, "safety_source_url", { semantic_category: "SOURCE_LOCATOR" }, { readers: ["app.js"] }, ["herbs"], 338);
  assert.notStrictEqual(diffValOverlap.classification, "MECHANICALLY_REDUNDANT");
  assert.ok(["PARTIAL_OVERLAP", "CLEARLY_DISTINCT"].includes(diffValOverlap.classification));
  console.log("PASS [Fixture 5]: Two same-occupancy fields with different values -> correctly classified as non-redundant (PARTIAL_OVERLAP / CLEARLY_DISTINCT)");
  passed++;

  // Fixture 6: real 2-field precedence -> detected with exact ordered fields
  const mockPrecedenceCode = "const s = record.sources || record.source_urls || record.exact_source_url;";
  const chains6 = extractPrecedenceChainsFromCode(mockPrecedenceCode, "app.js", new Set(["sources", "source_urls", "exact_source_url"]));
  assert.strictEqual(chains6.length, 1);
  assert.deepStrictEqual(chains6[0].ordered_fields, ["sources", "source_urls", "exact_source_url"]);
  console.log("PASS [Fixture 6]: Real 2-field fallback precedence -> correctly detected and ordered");
  passed++;

  // Fixture 7: negative precedence fixtures -> ALL produce 0 precedence
  const neg1 = 'const x = { sources: record.source_urls || [] };';
  const neg2 = 'const l = link.source || "Visual reference";';
  const neg3 = 'sources.some((source) => source.includes("x"));';
  const neg4 = 'foo = {\n  card_grade: r.card_grade,\n  field_sources: r.field_sources,\n  name: r.name || ""\n};';
  const neg5 = 'const r = record.review_status || "draft";';

  const testFieldSet = new Set(["sources", "source_urls", "source", "reference", "card_grade", "field_sources", "review_status"]);
  assert.strictEqual(extractPrecedenceChainsFromCode(neg1, "app.js", testFieldSet).length, 0);
  assert.strictEqual(extractPrecedenceChainsFromCode(neg2, "app.js", testFieldSet).length, 0);
  assert.strictEqual(extractPrecedenceChainsFromCode(neg3, "app.js", testFieldSet).length, 0);
  assert.strictEqual(extractPrecedenceChainsFromCode(neg4, "app.js", testFieldSet).length, 0);
  assert.strictEqual(extractPrecedenceChainsFromCode(neg5, "app.js", testFieldSet).length, 0);
  console.log("PASS [Fixture 7]: All negative precedence fixtures (property key, string literal, callback, unrelated on same line, literal default) -> 0 precedence");
  passed++;

  // Fixture 8: comprehensive generated survival assertions across deep records and cross-dataset contamination
  // 8.1 Same ID + same value -> SURVIVES_VERBATIM
  const can1 = [{ id: "h1", review_status: "verified" }];
  const gen1 = [{ id: "h1", review_status: "verified" }];
  assert.strictEqual(evaluateDatasetSurvivalDeep(can1, gen1, "review_status").status, "SURVIVES_VERBATIM");

  // 8.2 Same ID + changed value -> TRANSFORMED
  const can2 = [{ id: "h1", review_status: "draft" }];
  const gen2 = [{ id: "h1", review_status: "verified" }];
  assert.strictEqual(evaluateDatasetSurvivalDeep(can2, gen2, "review_status").status, "TRANSFORMED");

  // 8.3 Same ID + missing field -> DROPPED
  const can3 = [{ id: "h1", review_status: "draft" }];
  const gen3 = [{ id: "h1", other: "x" }];
  assert.strictEqual(evaluateDatasetSurvivalDeep(can3, gen3, "review_status").status, "DROPPED");

  // 8.4 Dataset no build path -> NOT_BUNDLED
  const can4 = [{ id: "h1", review_status: "draft" }];
  const gen4 = null;
  assert.strictEqual(evaluateDatasetSurvivalDeep(can4, gen4, "review_status").status, "NOT_BUNDLED");

  // 8.5 Cross-dataset same field name -> no contamination (A preserves, B drops)
  const canA = [{ id: "a1", field_sources: { a: 1 } }];
  const genA = [{ id: "a1", field_sources: { a: 1 } }];
  const canB = [{ id: "b1", field_sources: { b: 2 } }];
  const genB = [{ id: "b1", other: 123 }];
  assert.strictEqual(evaluateDatasetSurvivalDeep(canA, genA, "field_sources").status, "SURVIVES_VERBATIM");
  assert.strictEqual(evaluateDatasetSurvivalDeep(canB, genB, "field_sources").status, "DROPPED");

  // 8.6 Nested field path preserved/dropped correctly
  const canNested = [{ id: "n1", nested: { source: "http://example.com" } }];
  const genNestedPreserved = [{ id: "n1", nested: { source: "http://example.com" } }];
  const genNestedDropped = [{ id: "n1", nested: { other: 1 } }];
  assert.strictEqual(evaluateDatasetSurvivalDeep(canNested, genNestedPreserved, "nested.source").status, "SURVIVES_VERBATIM");
  assert.strictEqual(evaluateDatasetSurvivalDeep(canNested, genNestedDropped, "nested.source").status, "DROPPED");

  console.log("PASS [Fixture 8]: Deep record survival, value equality, nested paths, and cross-dataset isolation verified");
  passed++;

  console.log(`\nSelf-Test Complete: ${passed}/8 fixtures passed.\n`);
  return passed;
}

function generateMarkdownReport(auditData) {
  const meta = auditData.meta;
  const counts = auditData.summary_counts;

  return `# Evidence & Provenance Fragmentation Inventory — Task 10D (Round 4)

- **Audit Date**: 2026-08-27
- **Base SHA (origin/main)**: \`${meta.base_sha}\`
- **Audit Source SHA**: \`${meta.audit_source_sha}\`
- **Delivery Commit SHA**: \`${meta.delivery_commit_sha}\` (${meta.note})
- **Scope**: Canonical Evidence, Provenance, Authorship, Review State, and Source Verification Architecture
- **Core Invariant**: 「SURVIVES_VERBATIM means the same canonical record carried the same field value into a runtime-loaded artifact. A matching field name somewhere else is insufficient.」

---

## 1. 核心指標與概覽（Summary Metrics）

| 指標 | 數值 / 狀態 | 說明 |
|---|---|---|
| **Discovered Evidence Fields** | **${counts.discovered_evidence_fields_count}** | 嚴格正典來源、引用、作者、審核、核實與證據強度欄位 |
| **Candidate Related Fields (Excluded)** | **${counts.candidate_related_fields_count}** | 考試重要度、教材等級、圖片連結等相關但非正典來源之欄位（獨立記錄，不計入來源總數） |
| **Canonical Datasets Scanned** | **${counts.canonical_datasets_scanned}** | 涵蓋草藥、方劑、病證、經穴、症狀、鑑別、藥理、保健品等各大正典庫 |
| **Fields with Runtime Consumers** | **${counts.fields_with_runtime_consumers}** | 在 \`app.js\` 或 \`js/*.js\` 具有實質執行期讀取/渲染之欄位 |
| **Fields with Validator-Only Consumers** | **${counts.fields_with_validator_only_consumers}** | 僅由 CI / 本機驗證器檢查，未進入 UI 渲染之欄位 |
| **Dead / Dark Evidence Fields** | **${counts.fields_with_no_consumer_found}** | 正典資料中有非空數值，但整個代碼庫無任何 Consumer 之欄位 (\`DATA_PRESENT_NO_CONSUMER_FOUND\`) |
| **Overlap Pairs Analyzed** | **${counts.overlap_pairs_analyzed}** | 依據逐筆記錄數值比對判定之欄位重疊與相容狀態 |
| **Precedence Chains Found** | **${counts.precedence_chains_detected}** | 程式碼中以 \`||\` 或 \`??\` 跨 2+ 實質來源欄位之優先序遮蔽鏈路 |

---

## 2. 欄位總表與語意分類（Field Inventory）

本表列出正典資料庫中發現之所有證據/來源/審查欄位，依保守語意分類（不憑名稱任意等同）：

| 欄位名稱 (Field Name) | 語意類別 (Semantic Category) | 記錄出現總數 (Present) | 非空值筆數 (Non-Empty) | 出現資料庫數量 (Datasets) | 觀察型別 (Observed Types) |
|---|---|---|---|---|---|
${auditData.field_inventory.map((f) => `| \`${f.field_name}\` | \`${f.first_level_semantic_category}\` | ${f.record_count_present} | ${f.record_count_nonempty} | ${f.canonical_datasets_containing_it.length} | \`${f.observed_value_types.join(", ")}\` |`).join("\n")}

### 候選相關欄位（Candidate Related Fields — Excluded from Provenance Totals）
| 欄位名稱 | 類別 | 出現總數 | 非空筆數 | 說明 |
|---|---|---|---|---|
${auditData.candidate_related_fields.map((f) => `| \`${f.field_name}\` | \`${f.first_level_semantic_category}\` | ${f.record_count_present} | ${f.record_count_nonempty} | 考試大綱/等級/處方狀態/媒體連結 |`).join("\n")}

---

## 3. 代碼消費與讀寫地圖（Writer / Reader / Consumer Map）

| 欄位名稱 | 語意類別 | 消費模式 | 寫入者 (Writers) | Runtime / UI 讀取者 | 驗證器 (Validators / CI) |
|---|---|---|---|---|---|
${auditData.writer_reader_map.map((c) => `| \`${c.field_name}\` | \`${c.semantic_category}\` | \`${c.consumption_modes.join(", ") || "NONE"}\` | ${c.writers.slice(0, 2).map((s) => `\`${s}\``).join(", ") || "無"} | ${c.runtime_consumers.slice(0, 2).map((s) => `\`${s}\``).join(", ") || "無"} | ${c.validators.slice(0, 3).map((s) => `\`${s}\``).join(", ") || "無"} |`).join("\n")}

---

## 4. 欄位重疊與片段化矩陣（Fragmentation / Overlap Matrix）

針對系統中共存之多重來源與審查欄位進行**逐筆數值比對（Record-Level Value Correlation）**與分類：

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

本節僅統計跨 **2+ 實質正典來源/證據欄位** 之優先序遮蔽鏈路（排除純字串預設值 fallback）：

${auditData.consumer_precedence_chains.map((pc, i) => `${i + 1}. **\`${pc.consumer}:${pc.line_number}\`**:
   - 運算式: \`${pc.expression}\`
   - 優先順序: ${pc.ordered_fields.map((p, idx) => `**[${idx + 1}]** \`${p}\``).join(" $\\rightarrow$ ")}
   - 遮蔽欄位: ${pc.ignored_when_higher_priority_populated.map((f) => `\`${f}\``).join(", ") || "無"}
`).join("\n")}

---

## 8. 生成包生命週期行為（Generated-Data Behavior）

| 欄位名稱 | 生成包存活狀態 (Survival Status) | 觀察依據 (Evidence) |
|---|---|---|
${auditData.generated_data_behavior.map((g) => `| \`${g.field_name}\` | \`${g.status}\` | ${g.evidence} |`).join("\n")}

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
    console.log("       ACUTING OS EVIDENCE & PROVENANCE FRAGMENTATION INVENTORY (ROUND 4)       ");
    console.log("================================================================================");
    console.log(`Audit Source SHA:             ${auditData.meta.audit_source_sha}`);
    console.log(`Base SHA:                     ${auditData.meta.base_sha}`);
    console.log(`Discovered Evidence Fields:   ${auditData.summary_counts.discovered_evidence_fields_count}`);
    console.log(`Candidate Related Fields:     ${auditData.summary_counts.candidate_related_fields_count}`);
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
