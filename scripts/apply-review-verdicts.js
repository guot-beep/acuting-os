#!/usr/bin/env node
/* Apply owner review verdicts exported from the app (js/review.js) to canonical JSON.

   Usage:
     node scripts/apply-review-verdicts.js <verdicts.json>            # dry run
     node scripts/apply-review-verdicts.js <verdicts.json> --apply    # write

   Dry run by default, per the repo's staging discipline. "confirmed" promotes
   review_status draft -> source_checked and records who reviewed it and when.
   "issue" never changes status: it only attaches review_issue so the record
   stays visible as needing work. Safety-load fields are never touched here —
   this script only moves status and provenance, never content. */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const INPUT = process.argv.slice(2).find((a) => !a.startsWith("--"));

if (!INPUT) {
  console.error("usage: node scripts/apply-review-verdicts.js <verdicts.json> [--apply]");
  process.exit(1);
}

/* kind -> where its records live and how they are keyed */
const TARGETS = {
  point: { file: "data/acupoints/361.json", key: "code" },
  formula: { file: "data/herbs/formulas.json", key: "id" },
  herb: { file: "data/herbs/herb_canon_shortlist.json", key: "id" }
};

function loadArray(file) {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
  if (Array.isArray(raw)) return { array: raw, wrapper: null, prop: null };
  const prop = Object.keys(raw).find((k) => Array.isArray(raw[k]));
  if (!prop) throw new Error(`no array found in ${file}`);
  return { array: raw[prop], wrapper: raw, prop };
}

const payload = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const verdicts = payload.verdicts || [];
if (!verdicts.length) {
  console.log("no verdicts in file — nothing to do");
  process.exit(0);
}

const changes = [];
const skipped = [];
const dirty = new Map();

for (const v of verdicts) {
  const target = TARGETS[v.kind];
  if (!target) { skipped.push(`${v.kind}:${v.id} — unknown kind`); continue; }

  if (!dirty.has(v.kind)) dirty.set(v.kind, loadArray(target.file));
  const { array } = dirty.get(v.kind);
  const rec = array.find((r) => r[target.key] === v.id);
  if (!rec) { skipped.push(`${v.kind}:${v.id} — record not found`); continue; }

  if (v.verdict === "confirmed") {
    if (rec.review_status === "verified") {
      skipped.push(`${v.kind}:${v.id} — already verified, left alone`);
      continue;
    }
    changes.push({ kind: v.kind, id: v.id, from: rec.review_status, to: "source_checked", note: "" });
    rec.review_status = "source_checked";
    rec.reviewed_by = v.reviewed_by || "owner";
    rec.reviewed_at = v.reviewed_at;
    delete rec.review_issue;
  } else if (v.verdict === "issue") {
    changes.push({ kind: v.kind, id: v.id, from: rec.review_status, to: rec.review_status, note: v.note || "(no note)" });
    rec.review_issue = { note: v.note || "", raised_by: v.reviewed_by || "owner", raised_at: v.reviewed_at };
  } else {
    skipped.push(`${v.kind}:${v.id} — unknown verdict "${v.verdict}"`);
  }
}

console.log(`\n${APPLY ? "APPLYING" : "DRY RUN"} — ${changes.length} change(s), ${skipped.length} skipped\n`);
for (const c of changes) {
  const arrow = c.from === c.to ? `flagged: ${c.note}` : `${c.from} -> ${c.to}`;
  console.log(`  ${c.kind}:${c.id}  ${arrow}`);
}
if (skipped.length) {
  console.log("\nskipped:");
  skipped.forEach((s) => console.log(`  ${s}`));
}

if (!APPLY) {
  console.log("\nnothing written. re-run with --apply to write.\n");
  process.exit(0);
}

for (const [kind, loaded] of dirty) {
  const file = TARGETS[kind].file;
  const out = loaded.wrapper ? (loaded.wrapper[loaded.prop] = loaded.array, loaded.wrapper) : loaded.array;
  fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(`wrote ${file}`);
}
console.log("\nrun the validators and scripts/build-data.js next.\n");
