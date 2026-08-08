#!/usr/bin/env node
/**
 * validate-crosswalk-mappings.js — the FY2026 versioned-mapping layer's stick.
 * Small and single-purpose (2026-08-08 merge); FK integrity stays in
 * validate-relations.js — this file checks only what the merge introduced.
 *
 * Hard failures:
 *   XW1 versioned entry missing system/release/effective window or description
 *   XW2 mapping_type not in the controlled set
 *   XW3 duplicate code within one condition's icd10[] (accidental duplicate;
 *       cross-condition reuse is intentional and allowed)
 *   XW4 a legacy_seed_nonterminal entry anywhere but position 0
 *   XW5 migraine_vestibular canonicalized: its record must keep the
 *       correction queue, keep G43.82 marked incorrect_do_not_use, and have
 *       NO source_checked versioned mapping until the queue is decided
 *   XW6 a versioned entry with status source_checked but billable !== true
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const xw = JSON.parse(fs.readFileSync(path.join(ROOT, "data/interop/condition_crosswalk.json"), "utf8"));

const TYPES = new Set(["exact", "leaf_option", "broad_candidate", "related_not_exact",
  "candidate_context_dependent", "index_supported_close_match"]);
const defects = [];

for (const rec of xw.records || []) {
  const seen = new Set();
  (rec.icd10 || []).forEach((e, i) => {
    if (seen.has(e.code)) defects.push(`XW3 ${rec.id}: duplicate code ${e.code}`);
    seen.add(e.code);
    if (e.mapping_status === "legacy_seed_nonterminal" || e.mapping_status === "incorrect_do_not_use") {
      if (i !== 0) defects.push(`XW4 ${rec.id}: legacy/incorrect entry ${e.code} not at position 0`);
      return; // legacy seeds are exempt from versioned-entry requirements
    }
    if (!e.mapping_type) return; // pre-merge seed shape on uncovered records
    if (!TYPES.has(e.mapping_type)) defects.push(`XW2 ${rec.id}: mapping_type "${e.mapping_type}"`);
    for (const f of ["system", "release", "effective_from", "effective_to", "description"]) {
      if (!e[f]) defects.push(`XW1 ${rec.id} ${e.code}: missing ${f}`);
    }
    if (e.status === "source_checked" && e.billable !== true) defects.push(`XW6 ${rec.id} ${e.code}: source_checked but billable=${e.billable}`);
  });
}

const mv = (xw.records || []).find((r) => r.condition_id === "cond.migraine_vestibular");
if (!mv) defects.push("XW5 migraine_vestibular record missing");
else {
  if (!mv.icd10_correction_queue) defects.push("XW5 migraine_vestibular: correction queue removed");
  if ((mv.icd10 || [])[0]?.mapping_status !== "incorrect_do_not_use") defects.push("XW5 migraine_vestibular: G43.82 no longer marked incorrect");
  if ((mv.icd10 || []).some((e) => e.mapping_type && e.status === "source_checked")) defects.push("XW5 migraine_vestibular: a mapping was canonicalized while the queue is open");
}

const versioned = (xw.records || []).reduce((n, r) => n + (r.icd10 || []).filter((e) => e.mapping_type).length, 0);
const covered = (xw.records || []).filter((r) => (r.icd10 || []).some((e) => e.mapping_type)).length;
console.log(`crosswalk mappings: ${versioned} versioned entries · ${covered} conditions covered · ${defects.length} defects`);
if (defects.length) { defects.forEach((d) => console.log("  " + d)); process.exit(1); }
