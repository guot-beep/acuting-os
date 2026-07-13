#!/usr/bin/env node
/**
 * apply-condition-fill.js — merge E3 content-fill fields into
 * data/pathology/condition_canon_shortlist.json.
 *
 * Fill source: data/pathology/condition_fill_<batch>.json (a {fills: {condId:
 * {fields}}} object). Adds fields to matching records ONLY; never overwrites a
 * non-empty existing field; never touches records not named in the fill; never
 * changes ids, mappings, or review_status. All content stays draft.
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
  return false;
}

let added = 0;
const skipped = [];
const missing = [];

for (const [condId, fields] of Object.entries(fill.fills)) {
  const rec = byId.get(condId);
  if (!rec) { missing.push(condId); continue; }
  for (const [field, value] of Object.entries(fields)) {
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
  // Preserve the file's existing compact one-record-per-line layout so the
  // diff shows only the changed gyn records, not a 150-record reformat.
  const head = { ...canon };
  delete head.records;
  const headKeys = Object.keys(head);
  let out = "{\n";
  headKeys.forEach((k) => { out += `  ${JSON.stringify(k)}: ${JSON.stringify(head[k])},\n`; });
  out += '  "records": [\n';
  out += canon.records.map((r) => "    " + JSON.stringify(r)).join(",\n");
  out += "\n  ]\n}\n";
  fs.writeFileSync(canonPath, out);
  console.log("Written " + path.relative(ROOT, canonPath));
} else {
  console.log("Dry run. Use --apply to write.");
}
