#!/usr/bin/env node
/**
 * validate-naming.js — enforce DECISIONS.md D3 (homonym disambiguation).
 *
 * For formulas and herbs:
 *   - two records sharing a `name_zh` must BOTH carry a `__<source>`
 *     disambiguator in their id;
 *   - any `__<source>` token must be in the controlled source list.
 * Passes trivially while no homonyms exist; catches the first collision the
 * day content fills introduce one.
 *
 * Usage: node scripts/validate-naming.js
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

// Controlled classical-source abbreviations (DECISIONS.md D3). Extend here.
const SOURCES = new Set([
  "jinkui", "shanghan", "furen", "heji", "jingyue",
  "piwei", "waike", "wenbing",
]);

const FILES = [
  "data/herbs/formulas.json",
  "data/herbs/herb_canon_shortlist.json",
];

let failures = 0;
const fail = (m) => { failures++; console.error("FAIL: " + m); };

function records(data) {
  return Array.isArray(data) ? data : (data.records || []);
}

let checked = 0;
for (const rel of FILES) {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
  const byName = new Map();
  for (const rec of records(data)) {
    if (!rec || !rec.id) continue;
    checked++;
    // disambiguator token must be a known source
    const m = String(rec.id).match(/__(.+)$/);
    if (m && !SOURCES.has(m[1])) {
      fail(`${rel}: id "${rec.id}" uses unknown source token "${m[1]}" (add it to the D3 list first)`);
    }
    if (rec.name_zh) {
      if (!byName.has(rec.name_zh)) byName.set(rec.name_zh, []);
      byName.get(rec.name_zh).push(rec.id);
    }
  }
  for (const [name, ids] of byName) {
    if (ids.length < 2) continue;
    const unqualified = ids.filter((id) => !id.includes("__"));
    if (unqualified.length) {
      fail(`${rel}: "${name}" is shared by ${ids.length} records but these are not source-qualified: ${unqualified.join(", ")} (D3: use __<source>)`);
    }
  }
}

if (failures) { console.error(`\n${failures} failure(s).`); process.exit(1); }
console.log(`Naming validation passed (${checked} records; D3 homonym rule).`);
