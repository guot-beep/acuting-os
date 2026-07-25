#!/usr/bin/env node
/**
 * normalize-herb-categories.js — one category system, enforced at data level.
 *
 *   node scripts/normalize-herb-categories.js          # dry run
 *   node scripts/normalize-herb-categories.js --apply  # write
 *
 * Guarded: changes ONLY the `category` field —
 *   (a) variant labels are rewritten to their canonical form via the alias map;
 *   (b) records with no `category` get one mapped from their `category_zh`.
 * `category_zh` itself is never modified (no data downgraded). Preserves file
 * indentation and trailing newline. Canon: data/config/herb_category_canon.json.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const canon = JSON.parse(fs.readFileSync(path.join(ROOT, "data/config/herb_category_canon.json"), "utf8"));
const CANON = new Set(canon.categories);
const ALIAS = canon.aliases || {};

const file = path.join(ROOT, "data/herbs/herb_canon_shortlist.json");
const raw = fs.readFileSync(file, "utf8");
const hadNL = raw.endsWith("\n");
const indent = raw.startsWith("{\n ") ? raw.slice(2).match(/^ +/)[0].length : 2;
const doc = JSON.parse(raw);
const recs = doc.records || doc;

let rewritten = 0, filledFrom = 0, untouched = 0, unmappable = [];
for (const r of recs) {
  if (r.category && CANON.has(r.category)) { untouched++; continue; }
  if (r.category && ALIAS[r.category]) {
    console.log(`  rewrite  ${r.id}: "${r.category}" -> "${ALIAS[r.category]}"`);
    if (APPLY) r.category = ALIAS[r.category];
    rewritten++;
    continue;
  }
  if (!r.category && r.category_zh) {
    const mapped = CANON.has(r.category_zh) ? r.category_zh : ALIAS[r.category_zh];
    if (mapped) {
      console.log(`  fill     ${r.id}: category <- category_zh "${r.category_zh}" -> "${mapped}"`);
      if (APPLY) r.category = mapped;
      filledFrom++;
      continue;
    }
  }
  if (r.category || r.category_zh) unmappable.push(`${r.id}: category="${r.category || ""}" category_zh="${r.category_zh || ""}"`);
}

console.log(`\nSummary: ${untouched} already canonical, ${rewritten} variant rewrites, ${filledFrom} filled from category_zh, ${unmappable.length} unmappable.`);
if (unmappable.length) {
  console.log("Unmappable (add aliases via Claude):");
  unmappable.slice(0, 20).forEach((u) => console.log("  " + u));
}
if (APPLY) {
  let out = JSON.stringify(doc, null, indent);
  if (hadNL) out += "\n";
  fs.writeFileSync(file, out);
  console.log("\nApplied.");
} else {
  console.log("\nDry run. Re-run with --apply to write.");
}
