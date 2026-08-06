#!/usr/bin/env node
/**
 * build-medication-alias-map.js — close DECISIONS D15.
 *
 * The pharmacology template (77327f8) issued `drug.<generic_slug>` as the
 * ingredient namespace while `med.*` already existed with 12 records. Two
 * namespaces for one concept is the `pattern.*` vs `pat.*` defect again, and
 * D10 cost a day to undo. This closes it while it is still free.
 *
 * Why "free" is measurable and why it expires: the entire referencing surface
 * is 13 ids, all in template/sample files, and 0 in a real clinical record —
 * because clinic starts 2026-09-05. After that date this same migration edits
 * Ting's actual patient history.
 *
 * Per D1/D6 the old ids are neither re-issued nor deleted: they are mapped.
 * A case saved yesterday against med.letrozole still resolves.
 *
 *   node scripts/build-medication-alias-map.js            # dry run
 *   node scripts/build-medication-alias-map.js --write
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = "data/medications/western_medications.json";
const OUT = "data/config/medication_alias_map.json";
const WRITE = process.argv.includes("--write");

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const src = readJson(SOURCE);
const records = src.records || [];

// med.<slug> -> drug.<slug>. The slug is already the generic name in every one
// of the 12 records, which is what the pharmacology template's L4 asks for, so
// this is a prefix change and not a re-slugging. Anything that is NOT a clean
// med.<ascii_slug> is reported rather than transformed.
const aliases = {};
const rejected = [];
for (const rec of records) {
  const id = String(rec.id || "");
  const m = id.match(/^med\.([a-z0-9_]+)$/);
  if (!m) { rejected.push(id || "(no id)"); continue; }
  aliases[id] = `drug.${m[1]}`;
}

// Every place a med.* id is written down today. Kept in the map so the next
// person can see the whole surface without re-deriving it.
const REFERENCING_FILES = [
  "data/clinical_cases/fertility_workflow_seed.json",
  "data/clinical_cases/sample_deidentified_case.json",
];
const surface = {};
for (const rel of REFERENCING_FILES) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const hits = [...fs.readFileSync(p, "utf8").matchAll(/"(med\.[a-z0-9_]+)"/g)].map((x) => x[1]);
  surface[rel] = [...new Set(hits)].sort();
}

const out = {
  dataset: "Medication alias map (DECISIONS D15)",
  policy: [
    "drug.<generic_slug> is the only ingredient-level medication namespace (docs/PHARM_CARD_TEMPLATE.md L4).",
    "med.* ids are legacy. They are never re-issued and never deleted (D1/D6) — they resolve through this map, so a case written before the migration keeps working.",
    "data/medications/western_medications.json is an import/staging file, not canon: its 12 records have major_contraindications and common_adverse_effects empty 12/12 — a name list, not cards.",
    "Written 2026-08-06, before clinic opens 2026-09-05. The whole referencing surface is 13 ids in template/sample files and 0 in a real case; after 9/5 the same change edits real patient records.",
  ],
  generated_by: "scripts/build-medication-alias-map.js",
  counts: {
    staging_records: records.length,
    aliased: Object.keys(aliases).length,
    rejected: rejected.length,
    referencing_ids_in_repo: Object.values(surface).reduce((n, a) => n + a.length, 0),
  },
  aliases,
  rejected_ids: rejected,
  referencing_surface: surface,
};

console.log(`${WRITE ? "WROTE" : "DRY RUN"} — medication alias map\n`);
console.log(JSON.stringify(out.counts, null, 2));
console.log("\nsample:");
Object.entries(aliases).slice(0, 5).forEach(([a, b]) => console.log(`  ${a}  ->  ${b}`));
if (rejected.length) console.log(`\nREJECTED (not a clean med.<slug>): ${rejected.join(", ")}`);
console.log("\nreferencing surface:");
Object.entries(surface).forEach(([f, ids]) => console.log(`  ${ids.length.toString().padStart(2)}  ${f}`));

if (WRITE) {
  fs.writeFileSync(path.join(ROOT, OUT), JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`\nwrote ${OUT}`);
} else {
  console.log("\npass --write to save.");
}
