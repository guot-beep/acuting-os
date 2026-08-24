#!/usr/bin/env node
/**
 * apply-condition-fill.js — merge E3 content-fill fields into
 * data/pathology/condition_canon_shortlist.json.
 *
 * Fill source: data/pathology/condition_fill_<batch>.json (a {fills: {condId:
 * {fields}}} object). Adds fields to matching records ONLY; never overwrites a
 * non-empty existing field. The `sources` array is the sole merge field: new
 * unique source URLs are appended while existing provenance is retained. The
 * script never touches records not named in the fill and never changes ids,
 * mappings, or review_status. All content stays draft.
 *
 *   node scripts/apply-condition-fill.js gyn           # dry run
 *   node scripts/apply-condition-fill.js gyn --apply
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const batch = process.argv[2];
const APPLY = process.argv.includes("--apply");
if (!batch || batch.startsWith("--")) {
  console.error("Usage: node scripts/apply-condition-fill.js <batch> [--apply]");
  process.exit(2);
}

const canonPath = path.join(ROOT, "data/pathology/condition_canon_shortlist.json");
const fillPath = path.join(ROOT, `data/pathology/condition_fill_${batch}.json`);
const canon = JSON.parse(fs.readFileSync(canonPath, "utf8"));
const fill = JSON.parse(fs.readFileSync(fillPath, "utf8"));
const byId = new Map(canon.records.map((r) => [r.id, r]));

function isEmpty(v) {
  if (v == null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

let added = 0;
const skipped = [];
const missing = [];

for (const [condId, fields] of Object.entries(fill.fills)) {
  const rec = byId.get(condId);
  if (!rec) { missing.push(condId); continue; }
  for (const [field, value] of Object.entries(fields)) {
    if (field === "sources" && Array.isArray(value)) {
      const current = Array.isArray(rec.sources) ? rec.sources : [];
      const additions = value.filter((source) => !current.includes(source));
      if (additions.length === 0) {
        skipped.push(`${condId}.sources (no new unique sources — untouched)`);
        continue;
      }
      console.log(`${APPLY ? "appended" : "would append"} ${condId}.sources (+${additions.length})`);
      if (APPLY) rec.sources = [...current, ...additions];
      added += 1;
      continue;
    }
    if (!isEmpty(rec[field])) {
      skipped.push(`${condId}.${field} (already non-empty — untouched)`);
      continue;
    }
    console.log(`${APPLY ? "filled" : "would fill"} ${condId}.${field}`);
    if (APPLY) rec[field] = value;
    added += 1;
  }
}

if (missing.length) console.error("MISSING ids (not in canon): " + missing.join(", "));
console.log(`\nTotal: ${added} fields across ${Object.keys(fill.fills).length} conditions. Skipped: ${skipped.length}. Missing: ${missing.length}`);
skipped.forEach((s) => console.log("  " + s));

if (missing.length) { console.error("Refusing to write: unknown condition ids."); process.exit(1); }
if (APPLY) {
  // Match the canonical file's established one-space JSON indentation so a
  // fill batch produces a reviewable record-level diff instead of reformatting
  // the entire database.
  fs.writeFileSync(canonPath, JSON.stringify(canon, null, 1) + "\n");
  console.log("Written " + path.relative(ROOT, canonPath));
} else {
  console.log("Dry run. Use --apply to write.");
}
