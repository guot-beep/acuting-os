#!/usr/bin/env node
/**
 * clean-content-junk.js — remove scraped page-structure header tokens
 * (scripts/lib/content-junk-tokens.js) from canonical content arrays.
 * Supersedes the herb-only clean-herb-junk-functions.js.
 *
 *   node scripts/clean-content-junk.js          # dry run: report only
 *   node scripts/clean-content-junk.js --apply  # write
 *
 * Guarded: removes ONLY exact standalone matches of denylisted tokens.
 * Every other value is left byte-identical. No field renamed, no
 * review_status changed. Re-serializes each file with its detected indent.
 */
const fs = require("fs");
const path = require("path");
const { JUNK_TOKENS, CONTENT_FILES } = require("./lib/content-junk-tokens.js");

const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
let totalRemoved = 0;

for (const rel of CONTENT_FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const raw = fs.readFileSync(abs, "utf8");
  const hadNL = raw.endsWith("\n");
  const indent = raw.startsWith("{\n ") ? raw.slice(2).match(/^ +/)[0].length : 2;
  const data = JSON.parse(raw);
  const recs = data.records || data.points || (Array.isArray(data) ? data : []);
  let fileRemoved = 0;
  for (const r of recs) {
    for (const [field, v] of Object.entries(r)) {
      if (!Array.isArray(v)) continue;
      const before = v.length;
      r[field] = v.filter((x) => !((typeof x === "string" || typeof x === "number") && JUNK_TOKENS.has(String(x).trim())));
      fileRemoved += before - r[field].length;
    }
  }
  if (fileRemoved > 0) {
    console.log(`${rel}: ${fileRemoved} token(s) removed`);
    totalRemoved += fileRemoved;
    if (APPLY) {
      let out = JSON.stringify(data, null, indent);
      if (hadNL) out += "\n";
      fs.writeFileSync(abs, out);
    }
  }
}

console.log(`\nTotal junk tokens ${APPLY ? "removed" : "removable"}: ${totalRemoved}.`);
if (!APPLY) console.log("Dry run. Re-run with --apply to write.");
