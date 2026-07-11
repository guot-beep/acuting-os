#!/usr/bin/env node
/**
 * merge-cloudtcm-preview.js — D3 gate: compare CloudTCM staging against
 * data/acupoints/361.json and produce a reviewable preview + diff summary.
 * NOTHING is written to 361.json without --apply-approved, and even then
 * only EMPTY target fields are filled. Differences are never auto-resolved.
 *
 *   node scripts/merge-cloudtcm-preview.js                  # preview only
 *   node scripts/merge-cloudtcm-preview.js --apply-approved # fill empty fields only
 *
 * Reads:  data/imports/cloudtcm/staging_points.json (from D2)
 * Writes: docs/CLOUDTCM_MERGE_PREVIEW.json  (full machine-readable detail)
 *         docs/CLOUDTCM_MERGE_DIFF_SUMMARY.md (Ting's review document)
 *
 * Classification per (record, field):
 * - FILL   target field is empty, CloudTCM has content → fill candidate.
 * - MATCH  both non-empty and normalized text is identical.
 * - DIFFER both non-empty and text differs → listed for source review.
 *          Model-draft prose vs CloudTCM prose is EXPECTED to differ in
 *          wording; the review question is whether the FACTS (location,
 *          depth, direction, cautions) agree.
 *
 * Field map (staging → canonical):
 *   location_zh → location_zh, technique_zh → needling,
 *   functions_zh → functions_zh, indications_zh → indications_zh,
 *   cautions_zh → contraindications.
 *   description_zh has no canonical target and is reference-only.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const STAGING_FILE = path.join(ROOT, "data", "imports", "cloudtcm", "staging_points.json");
const DB_FILE = path.join(ROOT, "data", "acupoints", "361.json");
const PREVIEW_FILE = path.join(ROOT, "docs", "CLOUDTCM_MERGE_PREVIEW.json");
const SUMMARY_FILE = path.join(ROOT, "docs", "CLOUDTCM_MERGE_DIFF_SUMMARY.md");

const APPLY = process.argv.includes("--apply-approved");

const FIELD_MAP = {
  location_zh: "location_zh",
  technique_zh: "needling",
  functions_zh: "functions_zh",
  indications_zh: "indications_zh",
  cautions_zh: "contraindications"
};

const asText = (v) => Array.isArray(v) ? v.map((x) => String(x)).join("、") : String(v == null ? "" : v);
const isEmpty = (v) => v == null || v === "" || (Array.isArray(v) && v.length === 0);
const normalize = (v) => asText(v).replace(/[\s，,。.;；、·（）()「」*_-]/g, "").toLowerCase();

function main() {
  if (!fs.existsSync(STAGING_FILE)) {
    console.error(`Missing ${path.relative(ROOT, STAGING_FILE)} — run D1 (fetch) + D2 (transform) first.`);
    process.exit(1);
  }
  const staging = JSON.parse(fs.readFileSync(STAGING_FILE, "utf8")).records || [];
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  const byCode = new Map(db.map((p) => [p.code, p]));

  const fills = [];
  const differs = [];
  const counts = {}; // field → {fill, match, differ, stagingEmpty}
  const unknown = [];

  for (const rec of staging) {
    const target = byCode.get(rec.code);
    if (!target) { unknown.push(rec.code); continue; }
    for (const [sField, tField] of Object.entries(FIELD_MAP)) {
      counts[tField] = counts[tField] || { fill: 0, match: 0, differ: 0, staging_empty: 0 };
      const sVal = rec[sField];
      if (isEmpty(sVal)) { counts[tField].staging_empty += 1; continue; }
      const tVal = target[tField];
      if (isEmpty(tVal)) {
        counts[tField].fill += 1;
        // Keep canonical field types: arrays stay arrays.
        const value = Array.isArray(target[tField]) || ["functions_zh", "indications_zh", "contraindications"].includes(tField)
          ? (Array.isArray(sVal) ? sVal : [asText(sVal)])
          : asText(sVal);
        fills.push({ code: rec.code, field: tField, value });
      } else if (normalize(sVal) === normalize(tVal)) {
        counts[tField].match += 1;
      } else {
        counts[tField].differ += 1;
        differs.push({ code: rec.code, field: tField, current: asText(tVal), cloudtcm: asText(sVal) });
      }
    }
  }

  fs.writeFileSync(PREVIEW_FILE, JSON.stringify({
    generated: new Date().toISOString(),
    staging_records: staging.length,
    canonical_records: db.length,
    unknown_codes: unknown,
    counts,
    fills,
    differs
  }, null, 1));

  const fieldRows = Object.entries(counts)
    .map(([f, c]) => `| ${f} | ${c.fill} | ${c.match} | ${c.differ} | ${c.staging_empty} |`).join("\n");
  const sample = (field, n) => differs.filter((d) => d.field === field).slice(0, n)
    .map((d) => `- **${d.code}**\n  - 現有: ${d.current.slice(0, 120)}\n  - CloudTCM: ${d.cloudtcm.slice(0, 120)}`).join("\n");

  const summary = `# CloudTCM Merge Diff Summary (D3 gate)

Generated: ${new Date().toISOString()}
Staging: ${staging.length} records · Canonical 361.json: ${db.length} records · Unknown codes: ${unknown.length}

## Counts by field

| canonical field | FILL (empty→filled) | MATCH | DIFFER | staging empty |
|---|---|---|---|---|
${fieldRows}

## How to read this

- **FILL**: only these are written by \`--apply-approved\` (empty fields only).
- **MATCH**: model draft agrees with CloudTCM after normalization — good
  cross-check signal; candidates for a future status upgrade.
- **DIFFER**: wording differs (expected for prose). Review priority:
  1. **location_zh** differences — positioning facts must agree.
  2. **needling** differences — depth/direction/safety facts must agree.
  3. functions/indications differences are usually vocabulary breadth, lower risk.
- Nothing in DIFFER is auto-resolved. CloudTCM text stays in staging as the
  reference; per-record human review decides any replacement.

## Sample DIFFER — location_zh (first 10)

${sample("location_zh", 10) || "(none)"}

## Sample DIFFER — needling (first 10)

${sample("needling", 10) || "(none)"}

Full detail: docs/CLOUDTCM_MERGE_PREVIEW.json
`;
  fs.writeFileSync(SUMMARY_FILE, summary);

  console.log(`Preview written. counts:`, counts);
  console.log(`fills: ${fills.length}, differs: ${differs.length}, unknown: ${unknown.length}`);

  if (!APPLY) { console.log("\nGate: preview only. Ting reviews the diff summary before --apply-approved."); return; }

  let applied = 0;
  for (const f of fills) {
    const target = byCode.get(f.code);
    if (!isEmpty(target[f.field])) continue;
    target[f.field] = f.value;
    target.enrichment_status = "cloudtcm_fill_pending_review";
    applied += 1;
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 1));
  console.log(`Applied ${applied} empty-field fills. DIFFER items untouched.`);
}

main();
