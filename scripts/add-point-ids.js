#!/usr/bin/env node
/**
 * add-point-ids.js — assign a stable, namespaced, opaque `id` to every
 * acupoint record (DECISIONS.md D2, ratified 2026-07-13).
 *
 * Approach A: ADD an `id` field; the display `code` is NOT touched, so URLs,
 * prefix matchers, and the UI keep working unchanged. Clinical foreign keys
 * (future) reference `id`, not `code`.
 *
 * id scheme (pure function of code — same code always maps to the same id):
 *   standard channel  SP6      -> SP6            (international code is stable)
 *   extra point       EX-HN3   -> ex.hn3
 *   Master Tung       T11.01   -> tung.11_01     (strip leading T, . -> _)
 *   auricular         AT4      -> ear.at4
 *                     EAR-SM   -> ear.sm         (strip EAR- prefix)
 *
 * The GB93 "AT4" and the embedded "AT4" are the SAME point (merged by code at
 * runtime) and correctly receive the same id ear.at4. The script asserts that
 * two DIFFERENT codes never collide onto one id.
 *
 *   node scripts/add-point-ids.js          # dry run + collision report
 *   node scripts/add-point-ids.js --apply
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

function pointId(code, family) {
  const c = String(code);
  if (family === "standard") return c;
  // ex / ear are NEW families -> clean lowercase slug (project id convention).
  if (family === "ex") return "ex." + c.replace(/^EX-/i, "").replace(/[.\s]+/g, "_").toLowerCase();
  if (family === "ear") return "ear." + c.replace(/^EAR-/i, "").replace(/[.\s]+/g, "_").toLowerCase();
  // Tung ALREADY has ids of the form tung.11.01 / tung.DT.01 (case + dots
  // preserved). D1 forbids changing existing ids, so match that convention
  // exactly for any future Tung point too.
  if (family === "tung") return "tung." + c.replace(/^T/, "");
  throw new Error("unknown family " + family);
}

function familyOf(code) {
  const c = String(code);
  if (/^EX-/i.test(c)) return "ex";
  if (/^T\d|^TDT|^TVT/i.test(c)) return "tung";
  return null; // standard/ear decided by the file, not the code
}

// Each entry: file, how to get the records array, and the family (or 'auto').
const TARGETS = [
  { rel: "data/acupoints/361.json", get: (d) => d, family: "standard" },
  { rel: "data/tung/point_index.json", get: (d) => d.points || d, family: "tung" },
  { rel: "data/auricular/gb93_index.json", get: (d) => d.points || [], family: "ear" },
  { rel: "data/auricular/embedded/auricular_points.json", get: (d) => d, family: "ear" },
  // EX extras (ex.hn3/ex.hn5) are the only runtime-unique points here; the
  // rest are standard-code dupes that get id = code. starter_points.json is
  // omitted (pure standard dupes, contributes no runtime-unique point).
  { rel: "data/acupoints/embedded/professional_points.json", get: (d) => d, family: "auto" },
  /* extra_points.json must stay in this list because validate-point-ids.js
   * reads it (its line 32). The two source lists drifting apart is not a
   * theoretical risk: the 72 EX ids backfilled on 2026-08-05 were reverted by
   * merge 11f37a9 on 08-06, and because only the VALIDATOR knew about this
   * file, nothing could put them back — CI stayed red with no way to fix it
   * mechanically. Adding a data file to one list means adding it to both. */
  { rel: "data/acupoints/extra_points.json", get: (d) => d.records || d.points || (Array.isArray(d) ? d : []), family: "ex" },
];

const codeToId = new Map();   // code -> id (must be a function)
const idToCode = new Map();   // id -> code (injectivity check)
let added = 0, already = 0;
const problems = [];

for (const t of TARGETS) {
  const full = path.join(ROOT, t.rel);
  const raw = fs.readFileSync(full, "utf8");
  const data = JSON.parse(raw);
  const records = t.get(data);
  for (const rec of records) {
    if (!rec || !rec.code) continue;
    const fam = t.family === "auto" ? (familyOf(rec.code) || "standard") : t.family;
    const computed = pointId(rec.code, fam);
    // Respect any id that already exists (D1: ids are immutable once set).
    const id = rec.id || computed;

    // injectivity: two DIFFERENT codes must never share one id
    if (idToCode.has(id) && idToCode.get(id) !== rec.code) {
      problems.push(`ID COLLISION: id "${id}" from codes "${idToCode.get(id)}" and "${rec.code}"`);
    }
    idToCode.set(id, rec.code);
    codeToId.set(rec.code, id);

    if (rec.id) { already++; continue; }   // already has an id — never overwrite
    if (APPLY) rec.id = computed;
    added++;
  }
  if (APPLY && !problems.length) {
    /* Two guards, both learned the hard way on 2026-08-06:
     * 1. Reuse the file's OWN indentation. A hardcoded width reformatted
     *    361.json from 4 spaces to 2 and produced a 104,798-line diff that
     *    changed nothing — in a repo where three agents merge this file, that
     *    churn is a merge conflict waiting to happen.
     * 2. Only write when the bytes actually differ, so a no-op run leaves the
     *    working tree clean instead of touching every source file. */
    const next = JSON.stringify(data, null, detectIndent(raw)) + "\n";
    if (next !== raw) fs.writeFileSync(full, next);
  }
}

/** Indentation of the first indented line, so a rewrite matches the original. */
function detectIndent(text) {
  const m = /\n(\x20+)\S/.exec(text);
  if (m) return m[1].length;
  return /\n\t+\S/.test(text) ? "\t" : 2;
}

console.log(`Families assigned. Would add: ${added}, already correct: ${already}`);
console.log(`Distinct codes: ${codeToId.size}, distinct ids: ${idToCode.size}`);
const nsCount = { standard: 0, ex: 0, tung: 0, ear: 0 };
for (const id of idToCode.keys()) {
  if (id.startsWith("tung.")) nsCount.tung++;
  else if (id.startsWith("ear.")) nsCount.ear++;
  else if (id.startsWith("ex.")) nsCount.ex++;
  else nsCount.standard++;
}
console.log("namespaces:", JSON.stringify(nsCount));
if (problems.length) {
  console.error("\nPROBLEMS (refusing to write):");
  problems.forEach((p) => console.error("  " + p));
  process.exit(1);
}
console.log(APPLY ? "\nWritten. Rebuild twins: node scripts/build-data.js" : "\nDry run. Use --apply to write.");
