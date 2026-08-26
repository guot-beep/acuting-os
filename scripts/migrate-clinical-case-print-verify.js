#!/usr/bin/env node
/**
 * migrate-clinical-case-print-verify.js — DRY RUN, WRITES NOTHING.
 *
 * §7 item 3 of docs/MIGRATION_LOCALSTORAGE_TO_SQLITE.md: before a real
 * migration script touches anything, the medium-risk conversions in
 * data/clinical_cases/localstorage_sqlite_mapping.json ("data_loss_risk":
 * "medium") must be shown to a human, not silently applied. This script is
 * that print-and-verify step. It never opens a database connection, never
 * writes a file under data/clinical_cases/ — it only reads an input case
 * array and prints, per case/visit, exactly what a real migration WOULD
 * write, plus every place it cannot resolve something and would otherwise
 * have to guess.
 *
 * Input shape: a JSON array of case objects matching normalizeClinicalCase()
 * (app.js) with soapNotes[] matching normalizeSoapNote(). This is the shape
 * data/clinical_cases/localstorage_sqlite_mapping.json's "case"/"soap"
 * source_scope values describe — i.e. it is what you get by reading
 * `acuting-clinical-cases-v1` out of localStorage in a browser, NOT the
 * data/clinical_cases/*.json example files (those are already in the
 * DESTINATION shape). Never run this against real patient data checked into
 * git — the real store is never in git (D7); an operator runs this against
 * an exported test file kept outside the repo, or the fixture below.
 *
 * Usage:
 *   node scripts/migrate-clinical-case-print-verify.js <cases.json>
 *   node scripts/migrate-clinical-case-print-verify.js --fixture   (uses the
 *     bundled synthetic test set, scripts/fixtures/clinical_case_migration_test_set.json)
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const argv = process.argv.slice(2);
const AS_JSON = argv.includes("--json");
const inputArg = argv.find((a) => !a.startsWith("--"));

const inputPath = argv.includes("--fixture")
  ? path.join(ROOT, "scripts/fixtures/clinical_case_migration_test_set.json")
  : inputArg;

if (!inputPath) {
  console.error("usage: node scripts/migrate-clinical-case-print-verify.js <cases.json> | --fixture");
  process.exit(1);
}

const cases = JSON.parse(fs.readFileSync(inputPath, "utf8"));
if (!Array.isArray(cases)) {
  console.error(`input must be a JSON array of cases (normalizeClinicalCase shape). Got: ${typeof cases}`);
  process.exit(1);
}

// Canon vocabularies to resolve structured link ids against — read-only,
// same files the app itself reads from. A structured id that does not
// resolve is a real data problem (stale id, typo at entry time), not
// something this script can fix — it is reported, not silently dropped.
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const idSet = (p, key) => {
  const j = readJson(p);
  const arr = j.records || j;
  return new Set(arr.map((r) => r[key] || r.code));
};
const acupointCodes = idSet("data/acupoints/361.json", "code");
const patternIds = idSet("data/pathology/pattern_library.json", "id");
const formulaIds = idSet("data/herbs/formulas.json", "id");
const medicationIds = idSet("data/pharmacology/drugs.json", "id");

let totalCases = 0, totalVisits = 0;
const report = { medium_risk_fields: {}, unresolved_ids: [], no_destination_fields_present: [] };

const bump = (bucket, key) => {
  report.medium_risk_fields[bucket] = report.medium_risk_fields[bucket] || { count: 0, samples: [] };
  report.medium_risk_fields[bucket].count += 1;
  if (report.medium_risk_fields[bucket].samples.length < 5) report.medium_risk_fields[bucket].samples.push(key);
};

for (const c of cases) {
  totalCases += 1;
  const caseKey = c.id || c.patientCode || "(no id)";

  // pastHistory -> case_intake_baseline.biomedical_history. tcm_history has
  // no localStorage source field at all today (nothing to migrate into it —
  // this is a genuine, not a mapping, gap; reported so it isn't mistaken for
  // "already handled").
  if (usable(c.pastHistory)) bump("case.pastHistory -> biomedical_history (tcm_history left NULL, no source field)", caseKey);

  // menstrualObHistory -> menstrual_history (whole value), pregnancy_history
  // stays NULL — the doc's own recommended default, never a guessed split.
  if (usable(c.menstrualObHistory)) bump("case.menstrualObHistory -> menstrual_history (pregnancy_history NULL, per recommended default)", caseKey);

  if (usable(c.currentMeds)) report.no_destination_fields_present.push({ case: caseKey, field: "currentMeds", value_preview: preview(c.currentMeds) });

  for (const s of c.soapNotes || []) {
    totalVisits += 1;
    const visitKey = `${caseKey} / visit ${s.visitNumber || s.id}`;

    if (usable(s.workflowLink)) report.no_destination_fields_present.push({ case: visitKey, field: "workflowLink", value: s.workflowLink });

    // safetyFlagLinks -> case_safety_flags (CASE level). Explicitly losing
    // which visit raised the flag — flagged every time it fires, not just
    // documented once, so a real run can't miss how often it actually bites.
    if ((s.safetyFlagLinks || []).length) bump("soap.safetyFlagLinks -> case_safety_flags (per-visit origin LOST — flag moves to case level)", visitKey);

    // Structured link arrays (risk: none) — verified against real canon ids,
    // not fuzzy text matching. A miss here is a real stale/typo'd id.
    for (const code of s.acupointLinks || []) {
      if (!acupointCodes.has(code)) report.unresolved_ids.push({ visit: visitKey, kind: "acupointLinks", value: code });
    }
    for (const sel of s.tcmPatternSelections || []) {
      if (sel.patternId && !patternIds.has(sel.patternId)) report.unresolved_ids.push({ visit: visitKey, kind: "tcmPatternSelections", value: sel.patternId });
    }
    for (const fid of s.formulaLinks || []) {
      if (!formulaIds.has(fid)) report.unresolved_ids.push({ visit: visitKey, kind: "formulaLinks", value: fid });
    }
    for (const mid of s.medicationLinks || []) {
      if (!medicationIds.has(mid)) report.unresolved_ids.push({ visit: visitKey, kind: "medicationLinks", value: mid });
    }

    // Free-text sidecar fields — these do NOT feed the structured junction
    // tables (acupointLinks/formulaLinks/tcmPatternSelections/medicationLinks
    // already do, cleanly, above). They land in the *_name_text / notes
    // columns as narrative only. Printed so a reviewer can see the free text
    // never gets silently fuzzy-matched into a wrong id.
    if (usable(s.pointsUsed)) bump("soap.pointsUsed -> narrative only, NOT parsed into visit_acupuncture (acupointLinks is the real source for that table)", visitKey);
    if (usable(s.formulaHerbs)) bump("soap.formulaHerbs -> visit_formulas.formula_name_text (narrative only, NOT parsed into formula_id — formulaLinks is the real source)", visitKey);
    if (usable(s.westernMeds)) bump("soap.westernMeds -> visit_western_medications.medication_name_text (narrative only — medicationLinks is the real source)", visitKey);
    if (usable(s.tcmPattern)) bump("soap.tcmPattern -> visit_tcm_patterns free-text note only (tcmPatternSelections is the real structured source)", visitKey);

    if (usable(s.outcomes)) bump("soap.outcomes -> visit_outcomes.notes (one row, no metric_name/value — outcomeMetrics is the real structured source)", visitKey);
    if (usable(s.effectDurationDays) || s.effectDurationDays === 0) {
      const hasCanonical = (s.outcomeMetrics || []).some((m) => m.metricId === "metric.effect_duration_days");
      bump(
        hasCanonical
          ? "soap.effectDurationDays -> IGNORED for this visit (outcomeMetrics already has metric.effect_duration_days — canonical wins per legacy-shadowed-field policy)"
          : "soap.effectDurationDays -> soap_notes.effect_duration_days (used AS FALLBACK — outcomeMetrics has no metric.effect_duration_days for this visit)",
        visitKey
      );
    }

    if (usable(s.tongueBody)) bump("soap.tongueBody -> visits.tongue_body_zh", visitKey);
    if (usable(s.tongueCoating)) bump("soap.tongueCoating -> visits.tongue_coating_zh", visitKey);
  }
  // case.allergies is CASE level, not per-visit — bumped once per case here,
  // not inside the visit loop above (a case with 5 visits must not inflate
  // this to 5 occurrences of one fact).
  if (usable(c.allergies)) bump("case.allergies -> case_intake_baseline.allergies", caseKey);
}

if (AS_JSON) {
  console.log(JSON.stringify({ totalCases, totalVisits, ...report }, null, 1));
  process.exit(0);
}

console.log(`\n=== migrate-clinical-case-print-verify — DRY RUN, nothing written ===`);
console.log(`input: ${inputPath}`);
console.log(`cases: ${totalCases}   visits: ${totalVisits}\n`);

console.log("--- medium-risk conversions (what would be written) ---");
for (const [label, info] of Object.entries(report.medium_risk_fields)) {
  console.log(`  ${label}`);
  console.log(`    occurrences: ${info.count}   sample keys: ${info.samples.join(", ")}`);
}

if (report.unresolved_ids.length) {
  console.log("\n--- UNRESOLVED structured ids (real problem — stale id or typo at entry time, not a migration bug) ---");
  for (const u of report.unresolved_ids) console.log(`  ${u.visit} | ${u.kind} = "${u.value}" — no matching canon record`);
} else {
  console.log("\n--- structured ids (acupointLinks/tcmPatternSelections/formulaLinks/medicationLinks): all resolved ---");
}

if (report.no_destination_fields_present.length) {
  console.log("\n--- FIELDS WITH REAL VALUES BUT NO SCHEMA DESTINATION (must fail loudly, never drop silently) ---");
  for (const g of report.no_destination_fields_present) console.log(`  ${g.case} | ${g.field}`);
  console.log("  A real migration script MUST refuse to run past this point until these are resolved (schema column added, or an explicit decision to hold that field back).");
} else {
  console.log("\n--- no no_destination_yet fields present in this input ---");
}

console.log("\nThis script never writes to schema.sql, never opens a database, never touches");
console.log("anything under data/clinical_cases/local|private|exports/. It only reads its input file and prints.");

function usable(v) {
  return typeof v === "string" ? v.trim().length > 0 : v != null;
}
function preview(v) {
  const s = String(v);
  return s.length > 60 ? s.slice(0, 60) + "…" : s;
}
