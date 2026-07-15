#!/usr/bin/env node
/**
 * update-point-manifest.js — (re)write data/acupoints/point_id_manifest.json,
 * the ledger of every point id that has ever existed (DECISIONS D6).
 *
 * This is a DELIBERATE act. validate-point-ids.js fails if a manifest id has
 * vanished from the data (a hard delete — retire via review_status
 * "deprecated" instead) or if a current id is missing from the manifest (a
 * new permanent id must be added consciously). Regenerating the manifest is
 * how you ratify an intended add/retire — never run it to "make the error go
 * away" after an accidental deletion.
 *
 *   node scripts/update-point-manifest.js          # dry run (diff)
 *   node scripts/update-point-manifest.js --write
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const WRITE = process.argv.includes("--write");
const MANIFEST = "data/acupoints/point_id_manifest.json";

const TARGETS = [
  { rel: "data/acupoints/361.json", get: (d) => d },
  { rel: "data/tung/point_index.json", get: (d) => d.points || d },
  { rel: "data/auricular/gb93_index.json", get: (d) => d.points || [] },
  { rel: "data/auricular/embedded/auricular_points.json", get: (d) => d },
  { rel: "data/acupoints/embedded/professional_points.json", get: (d) => d },
];

const ids = new Set();
for (const t of TARGETS) {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, t.rel), "utf8"));
  for (const rec of t.get(data)) if (rec && rec.id) ids.add(rec.id);
}
const sorted = [...ids].sort();

let prev = [];
const mpath = path.join(ROOT, MANIFEST);
if (fs.existsSync(mpath)) prev = JSON.parse(fs.readFileSync(mpath, "utf8")).ids || [];
const prevSet = new Set(prev);
const added = sorted.filter((id) => !prevSet.has(id));
const removed = prev.filter((id) => !ids.has(id));

console.log(`current ids: ${sorted.length} | manifest ids: ${prev.length}`);
console.log(`added vs manifest: ${added.length}`, added.slice(0, 10));
console.log(`REMOVED vs manifest: ${removed.length}`, removed.slice(0, 10));
if (removed.length && !WRITE) {
  console.log("\n⚠ Ids are in the manifest but gone from data. If this is a RETIREMENT,");
  console.log("  set review_status='deprecated' on the record instead of deleting it.");
}

if (WRITE) {
  fs.writeFileSync(mpath, JSON.stringify({
    dataset: "point_id_manifest",
    policy: "Ledger of every point id that has ever existed (DECISIONS.md D6). Ids are never removed from data — retire via review_status='deprecated'. Regenerate deliberately with scripts/update-point-manifest.js --write.",
    updated: new Date().toISOString().slice(0, 10),
    count: sorted.length,
    ids: sorted,
  }, null, 0) + "\n");
  console.log("\nWritten " + MANIFEST);
} else {
  console.log("\nDry run. Use --write to (re)generate the ledger.");
}
