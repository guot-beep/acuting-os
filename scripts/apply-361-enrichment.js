#!/usr/bin/env node
/**
 * apply-361-enrichment.js — fill EMPTY fields on existing data/acupoints/361.json
 * records from batch files in data/imports/model_draft/enrichment/*.json.
 *
 *   node scripts/apply-361-enrichment.js           # dry run: report only
 *   node scripts/apply-361-enrichment.js --apply   # fill + write diff summary
 *
 * Batch file format (one file per channel batch, e.g. lu_ht_enrichment.json):
 * {
 *   "records": [
 *     { "code": "LU1", "needling": "…", "location_en": "…",
 *       "functions_en": ["…"], "indications_en": ["…"], "contraindications": ["…"] }
 *   ]
 * }
 * Only these five fields are accepted. Anything else is ignored and reported.
 *
 * Safety contract:
 * - FILL-EMPTY-ONLY. A field is written only when the existing value is ""
 *   or []. Non-empty existing values are NEVER touched; such attempts are
 *   reported as conflicts for Ting to review manually.
 * - Records not found in 361.json are reported and skipped.
 * - Every record that receives at least one fill gets
 *   enrichment_status: "model_draft_pending_source_review" (does not change
 *   the record's own review_status/source_status if present).
 * - Appends a dated section to docs/361_DRAFT_FILL_SUMMARY.md.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ENRICH_DIR = path.join(ROOT, "data", "imports", "model_draft", "enrichment");
const DB_FILE = path.join(ROOT, "data", "acupoints", "361.json");
const SUMMARY_FILE = path.join(ROOT, "docs", "361_DRAFT_FILL_SUMMARY.md");

const APPLY = process.argv.includes("--apply");
const ALLOWED = ["needling", "location_en", "functions_en", "indications_en", "contraindications"];

const isEmpty = (v) => v == null || v === "" || (Array.isArray(v) && v.length === 0);

function main() {
  if (!fs.existsSync(ENRICH_DIR)) { console.error(`No batch dir at ${path.relative(ROOT, ENRICH_DIR)}.`); process.exit(1); }
  const files = fs.readdirSync(ENRICH_DIR).filter((f) => f.endsWith(".json")).sort();
  if (!files.length) { console.error("No enrichment batch files found."); process.exit(1); }

  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  const byCode = new Map(db.map((p) => [p.code, p]));

  let filled = 0;
  const filledByField = {};
  const touchedCodes = new Set();
  const conflicts = [];
  const unknownCodes = [];
  const ignoredFields = new Set();

  for (const file of files) {
    const batch = JSON.parse(fs.readFileSync(path.join(ENRICH_DIR, file), "utf8"));
    for (const rec of batch.records || []) {
      const target = byCode.get(rec.code);
      if (!target) { unknownCodes.push(rec.code); continue; }
      for (const [field, value] of Object.entries(rec)) {
        if (field === "code") continue;
        if (!ALLOWED.includes(field)) { ignoredFields.add(field); continue; }
        if (isEmpty(value)) continue;
        if (!isEmpty(target[field])) {
          conflicts.push({ code: rec.code, field, existing: String(target[field]).slice(0, 60) });
          continue;
        }
        if (APPLY) {
          target[field] = value;
          target.enrichment_status = "model_draft_pending_source_review";
        }
        filled += 1;
        filledByField[field] = (filledByField[field] || 0) + 1;
        touchedCodes.add(rec.code);
      }
    }
  }

  console.log(`Batch files: ${files.join(", ")}`);
  console.log(`Fields ${APPLY ? "filled" : "fillable"}: ${filled}`, filledByField);
  console.log(`Records touched: ${touchedCodes.size}`);
  if (conflicts.length) console.log(`Conflicts (existing value kept, NOT overwritten): ${conflicts.length}`, conflicts.slice(0, 5));
  if (unknownCodes.length) console.log(`Unknown codes skipped: ${unknownCodes.join(", ")}`);
  if (ignoredFields.size) console.log(`Ignored non-allowed fields: ${[...ignoredFields].join(", ")}`);

  if (!APPLY) { console.log("\nDry run only. Re-run with --apply to write."); return; }

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 1));

  const section = `
---

## Enrichment fill — ${new Date().toISOString()}

- Batch files: ${files.join(", ")}
- Fields filled (empty-only): ${filled} across ${touchedCodes.size} records — ${JSON.stringify(filledByField)}
- Conflicts skipped (existing values untouched): ${conflicts.length}
- Codes: ${[...touchedCodes].join(", ")}
- All fills are model drafts pending source review (CloudTCM D1-D3 cross-check + WHO SAPL).
`;
  fs.appendFileSync(SUMMARY_FILE, section);
  console.log(`\nApplied. Summary appended to ${path.relative(ROOT, SUMMARY_FILE)}.`);
}

main();
