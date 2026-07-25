#!/usr/bin/env node
/**
 * validate-content-junk.js — QA wall check (Codex runs this on every batch).
 *
 * Fails (exit 1) if any canonical content array contains a scraped
 * page-structure header token (see scripts/lib/content-junk-tokens.js) as a
 * standalone element — e.g. "其他功效" / "藥理作用" leaking out of CloudTCM
 * page structure into a herb's functions list.
 *
 * Read-only. To fix what it reports: node scripts/clean-content-junk.js --apply
 */
const fs = require("fs");
const path = require("path");
const { JUNK_TOKENS, CONTENT_FILES } = require("./lib/content-junk-tokens.js");

const ROOT = path.join(__dirname, "..");
const findings = [];

for (const rel of CONTENT_FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  let data;
  try { data = JSON.parse(fs.readFileSync(abs, "utf8")); } catch (e) { continue; }
  const recs = data.records || data.points || (Array.isArray(data) ? data : []);
  for (const r of recs) {
    const id = r.id || r.code || r.name_zh || "(unknown)";
    for (const [field, v] of Object.entries(r)) {
      if (!Array.isArray(v)) continue;
      for (const x of v) {
        if (typeof x !== "string" && typeof x !== "number") continue;
        if (JUNK_TOKENS.has(String(x).trim())) {
          findings.push({ file: rel, id, field, token: String(x).trim() });
        }
      }
    }
  }
}

if (findings.length === 0) {
  console.log("validate-content-junk: PASS — no scraped header tokens in content arrays.");
  process.exit(0);
}

console.error(`validate-content-junk: FAIL — ${findings.length} junk header token(s) found:`);
for (const f of findings.slice(0, 40)) {
  console.error(`  ${f.file}  ${f.id}  ${f.field}  →  "${f.token}"`);
}
if (findings.length > 40) console.error(`  ... and ${findings.length - 40} more`);
console.error(`\nFix: node scripts/clean-content-junk.js --apply`);
process.exit(1);
