#!/usr/bin/env node
/**
 * restore-formula-roles.js — put back the 君臣佐使 that an ingest rebuild cleared.
 *
 * On 2026-08-07 a batch ingest rebuilt `composition` arrays from one source.
 * A rebuild loses whatever that source did not carry, so `role_zh` went from
 * 82 formulas to 11 — 桂枝湯, 麻黃湯, 銀翹散 and 68 others lost the chief/deputy/
 * assistant/envoy structure, which is the core of a formula card and heavily
 * examined. The ingest reported `zero_deletion_check: true`; it was measuring
 * something else. That is why this reads the values back out of git rather
 * than trusting either side's report.
 *
 * ADDITIVE ONLY, by design — the rule the rebuild broke:
 *   - writes `role_zh` only where it is currently empty
 *   - never edits any other field, never reorders or removes a herb
 *   - matches on herb_id first, then exact herb name; anything ambiguous is
 *     left alone and printed, because a wrong 君藥 is worse than a missing one
 *
 *   node scripts/restore-formula-roles.js              # dry run
 *   node scripts/restore-formula-roles.js --apply
 *   node scripts/restore-formula-roles.js --from <git-ref>
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const FILE = "data/herbs/formulas.json";
const APPLY = process.argv.includes("--apply");
const fromIdx = process.argv.indexOf("--from");
const FROM = fromIdx > -1 ? process.argv[fromIdx + 1] : "safe/2026-08-06-verified";

const raw = fs.readFileSync(path.join(ROOT, FILE), "utf8");
const doc = JSON.parse(raw);
const now = doc.formulas || doc.records;

const past = (() => {
  const t = execSync(`git show ${FROM}:${FILE}`, { cwd: ROOT, maxBuffer: 5e8 }).toString();
  const j = JSON.parse(t);
  return new Map((j.formulas || j.records).map((r) => [r.id, r]));
})();

const roleOf = (h) => String(h?.role_zh || h?.role || "").trim();
const nameOf = (h) => String(h?.herb_zh || h?.name_zh || "").trim();

let restored = 0, formulas = 0;
const ambiguous = [], stillEmpty = [];

for (const rec of now) {
  const old = past.get(rec.id);
  if (!old || !Array.isArray(rec.composition) || !Array.isArray(old.composition)) continue;
  if (!old.composition.some(roleOf)) continue;          // nothing to give back
  if (rec.composition.some(roleOf)) continue;           // already has roles — leave it

  let n = 0;
  for (const h of rec.composition) {
    if (roleOf(h)) continue;                            // never overwrite
    const byId = h.herb_id && old.composition.filter((o) => o.herb_id === h.herb_id);
    const byName = old.composition.filter((o) => nameOf(o) && nameOf(o) === nameOf(h));
    const cands = (byId && byId.length ? byId : byName).filter(roleOf);
    if (cands.length === 1) { if (APPLY) h.role_zh = roleOf(cands[0]); n++; restored++; }
    else if (cands.length > 1) ambiguous.push(`${rec.name_zh || rec.id} · ${nameOf(h)} — ${cands.length} candidate roles`);
    else stillEmpty.push(`${rec.name_zh || rec.id} · ${nameOf(h)}`);
  }
  if (n) formulas++;
}

console.log(`source of truth: ${FROM}`);
console.log(`restored ${restored} role(s) across ${formulas} formula(s)`);
if (ambiguous.length) {
  console.log(`\nleft alone — ambiguous (${ambiguous.length}), a wrong 君藥 is worse than none:`);
  ambiguous.slice(0, 10).forEach((x) => console.log("   " + x));
}
if (stillEmpty.length) {
  console.log(`\nleft alone — herb not present in ${FROM} (${stillEmpty.length}), needs the curriculum card:`);
  stillEmpty.slice(0, 10).forEach((x) => console.log("   " + x));
}

if (APPLY) {
  const indent = (/\n(\x20+)\S/.exec(raw) || [])[1]?.length ?? 2;
  fs.writeFileSync(path.join(ROOT, FILE), JSON.stringify(doc, null, indent) + "\n");
  console.log("\nWritten " + FILE);
} else {
  console.log("\nDry run. Use --apply to write.");
}
