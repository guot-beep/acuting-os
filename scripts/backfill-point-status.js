#!/usr/bin/env node
/**
 * backfill-point-status.js — give every point a review_status (DECISIONS D6).
 *
 * Adds-only + floor-only: sets review_status = "draft" ONLY where it is
 * missing or null. NEVER changes an existing status (no promotion, and it
 * will not touch the GB93 records already at "source_checked" or the Tung /
 * GB93 "index_only" records). "draft" is the lowest rung of the ladder, so
 * this is data hygiene, not a status change.
 *
 *   node scripts/backfill-point-status.js          # dry run
 *   node scripts/backfill-point-status.js --apply
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const TARGETS = [
  { rel: "data/acupoints/361.json", get: (d) => d, indent: 1 },
  { rel: "data/auricular/embedded/auricular_points.json", get: (d) => d, indent: 2 },
];

let filled = 0;
const perFile = {};
for (const t of TARGETS) {
  const full = path.join(ROOT, t.rel);
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  let n = 0;
  for (const rec of t.get(data)) {
    if (!rec || !rec.code) continue;
    if (rec.review_status === undefined || rec.review_status === null || rec.review_status === "") {
      if (APPLY) rec.review_status = "draft";
      n++; filled++;
    }
  }
  perFile[t.rel] = n;
  if (APPLY && n) fs.writeFileSync(full, JSON.stringify(data, null, t.indent) + "\n");
}

console.log(`${APPLY ? "Filled" : "Would fill"} review_status="draft" on ${filled} records`);
console.log(JSON.stringify(perFile, null, 2));
console.log(APPLY ? "Written. Rebuild: node scripts/build-data.js" : "Dry run. Use --apply.");
