#!/usr/bin/env node
/**
 * clean-herb-junk-functions.js — remove the scraped junk header token
 * "其他功效" from herb `functions` and `modern_functions_zh` arrays.
 *
 *   node scripts/clean-herb-junk-functions.js          # dry run: report only
 *   node scripts/clean-herb-junk-functions.js --apply  # write
 *
 * Guarded: removes ONLY the exact token "其他功效" (a CloudTCM page-structure
 * header that leaked into content). Every other value is left byte-for-byte
 * unchanged. No other field is touched. review_status is not changed.
 */
const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "data", "herbs", "herb_canon_shortlist.json");
const APPLY = process.argv.includes("--apply");
const JUNK = "其他功效";
const FIELDS = ["functions", "modern_functions_zh"];

const raw = fs.readFileSync(FILE, "utf8");
const hadTrailingNewline = raw.endsWith("\n");
const data = JSON.parse(raw);
const recs = data.records;

let removed = 0, recordsTouched = 0;
for (const r of recs) {
  let touched = false;
  for (const f of FIELDS) {
    if (!Array.isArray(r[f])) continue;
    const before = r[f].length;
    r[f] = r[f].filter((x) => String(x).trim() !== JUNK);
    const gone = before - r[f].length;
    if (gone > 0) { removed += gone; touched = true; }
  }
  if (touched) recordsTouched += 1;
}

console.log(`Junk token "${JUNK}" removed: ${removed} occurrence(s) across ${recordsTouched} herb record(s).`);
console.log(`Fields cleaned: ${FIELDS.join(", ")}. All other content untouched.`);

if (!APPLY) { console.log("\nDry run. Re-run with --apply to write."); process.exit(0); }

let out = JSON.stringify(data, null, 2);
if (hadTrailingNewline) out += "\n";
fs.writeFileSync(FILE, out);
console.log("Written.");
