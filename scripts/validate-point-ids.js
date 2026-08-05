#!/usr/bin/env node
/**
 * validate-point-ids.js — enforce DECISIONS.md D2 (point id namespacing).
 *
 * Every runtime acupoint record must carry a stable `id`:
 *   - standard channel  : id === code (international code, e.g. SP6)
 *   - extra point EX-*   : id starts "ex."
 *   - Master Tung  T*    : id starts "tung."
 *   - auricular          : id starts "ear."
 * No two DIFFERENT codes may share one id. No bare (un-namespaced)
 * non-standard id is allowed — this is the machine enforcer that stops a
 * future agent from re-introducing a collision-prone code as an id.
 *
 * Usage: node scripts/validate-point-ids.js
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const FILES = [
  { rel: "data/acupoints/361.json", get: (d) => d, family: "standard" },
  { rel: "data/tung/point_index.json", get: (d) => d.points || d, family: "tung" },
  { rel: "data/auricular/gb93_index.json", get: (d) => d.points || [], family: "ear" },
  { rel: "data/auricular/embedded/auricular_points.json", get: (d) => d, family: "ear" },
  { rel: "data/acupoints/embedded/professional_points.json", get: (d) => d, family: "auto" },
  /* extra_points.json was outside this list while it grew from 2 records to 72,
   * so 70 extra points reached the repo with a `code` and no `id` at all and
   * this validator still passed — it was only ever looking at 361.json for the
   * `ex.` namespace. A file the enforcer does not read is a file with no rule.
   * Clinical foreign keys reference `id` (D2), so those records cannot be
   * linked to a case until they have one. */
  { rel: "data/acupoints/extra_points.json", get: (d) => d.records || d.points || (Array.isArray(d) ? d : []), family: "ex" },
];

let failures = 0;
const fail = (m) => { failures++; console.error("FAIL: " + m); };
const idToCode = new Map();
const counts = { standard: 0, ex: 0, tung: 0, ear: 0 };

function expectedNamespace(code, family) {
  if (family === "auto") return /^EX-/i.test(code) ? "ex" : "standard";
  return family;
}

for (const f of FILES) {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, f.rel), "utf8"));
  for (const rec of f.get(data)) {
    if (!rec || !rec.code) continue;
    const ns = expectedNamespace(rec.code, f.family);
    const id = rec.id;
    if (!id) { fail(`${f.rel}: ${rec.code} has no id`); continue; }

    if (ns === "standard") {
      if (id !== rec.code) fail(`${rec.code}: standard id should equal code, got "${id}"`);
      else counts.standard++;
    } else {
      const prefix = ns + ".";
      if (!id.startsWith(prefix)) fail(`${rec.code}: ${ns} id must start "${prefix}", got "${id}"`);
      else counts[ns]++;
    }
    // injectivity: different codes must not collide onto one id
    if (idToCode.has(id) && idToCode.get(id) !== rec.code) {
      fail(`id collision "${id}": codes "${idToCode.get(id)}" and "${rec.code}"`);
    }
    idToCode.set(id, rec.code);
  }
}

// Expected totals (DECISIONS.md D2, locked 2026-07-13)
const EXPECT = { standard: 361, ex: 2, tung: 277, ear: 41 };
for (const k of Object.keys(EXPECT)) {
  // standard counts include the professional-file dupes that also equal code;
  // dedupe by counting distinct ids per namespace instead.
}
const distinct = { standard: 0, ex: 0, tung: 0, ear: 0 };
for (const id of idToCode.keys()) {
  if (id.startsWith("tung.")) distinct.tung++;
  else if (id.startsWith("ear.")) distinct.ear++;
  else if (id.startsWith("ex.")) distinct.ex++;
  else distinct.standard++;
}
for (const k of Object.keys(EXPECT)) {
  if (distinct[k] !== EXPECT[k]) fail(`distinct ${k} ids = ${distinct[k]}, expected ${EXPECT[k]}`);
}

// ---- D6: knowledge is never hard-deleted (manifest / tombstone check) ----
const MPATH = path.join(ROOT, "data/acupoints/point_id_manifest.json");
if (fs.existsSync(MPATH)) {
  const manifest = JSON.parse(fs.readFileSync(MPATH, "utf8")).ids || [];
  const current = new Set(idToCode.keys());
  // any id in the ledger that has vanished from the data = a hard delete.
  // Retirement is allowed ONLY as review_status="deprecated" (still present).
  const vanished = manifest.filter((id) => !current.has(id));
  if (vanished.length) {
    fail(`${vanished.length} point id(s) removed from data but still in the manifest — hard delete is forbidden (DECISIONS D6). Retire via review_status="deprecated", or if intentional run update-point-manifest.js --write. First: ${vanished.slice(0, 8).join(", ")}`);
  }
  // any current id not yet in the ledger = a new permanent id added without
  // ratifying it. Add it deliberately via update-point-manifest.js --write.
  const unlisted = [...current].filter((id) => !manifest.includes(id));
  if (unlisted.length) {
    fail(`${unlisted.length} point id(s) not in the manifest — a new permanent id must be ratified with update-point-manifest.js --write. First: ${unlisted.slice(0, 8).join(", ")}`);
  }
} else {
  console.warn("WARN: point_id_manifest.json missing — run update-point-manifest.js --write");
}

if (failures) { console.error(`\n${failures} failure(s).`); process.exit(1); }
console.log("Point id validation passed.");
console.log("distinct ids by namespace:", JSON.stringify(distinct), "| total:", idToCode.size);
