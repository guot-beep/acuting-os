#!/usr/bin/env node
/**
 * migrate-pattern-v1-vocabulary.js — fold the imported "v1.0" pattern schema
 * into the canonical PATTERN_CARD_TEMPLATE vocabulary.
 *
 * Why this exists: merge 11f37a9 (2026-08-06) brought 17 richer pattern records
 * in under a parallel set of field names, and reverted the tongue/pulse
 * bilingual migration on the other 42. The result was not a content loss — it
 * was a MEASUREMENT loss. validate-pattern-standard reported "59/59 NO
 * PROVENANCE" while 17 of those records carried real citations in `source_ids`,
 * and the renderer reads the canonical names, so the richest cards displayed
 * their formulas and points as empty.
 *
 * Order is fixed by AI_CONSTITUTION rule 3: move the value into the canonical
 * field FIRST, then remove the old key. Never the other way round.
 *
 * Only migrates when the canonical field is empty, except tongue/pulse where the
 * richer of the two candidates wins (tongue_preview.zh "舌質紅，少苔少津" is a
 * superset of legacy tongue "舌紅少苔"). Nothing is dropped without its value
 * having landed somewhere first.
 *
 *   node scripts/migrate-pattern-v1-vocabulary.js           # dry run
 *   node scripts/migrate-pattern-v1-vocabulary.js --apply
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/pathology/pattern_library.json");
const APPLY = process.argv.includes("--apply");

const doc = JSON.parse(fs.readFileSync(FILE, "utf8"));
const records = doc.records || doc.patterns;
if (!Array.isArray(records)) throw new Error("pattern_library.json: no records array");

const empty = (v) =>
  v === undefined || v === null || v === "" ||
  (Array.isArray(v) && v.length === 0);

const moves = new Map();   // "old -> new" => count
const skipped = new Map(); // reason => count
const note = (map, k) => map.set(k, (map.get(k) || 0) + 1);

/** Move r[from] into r[to] when the target is empty, then delete r[from]. */
function move(r, from, to, transform = (v) => v) {
  if (r[from] === undefined) return;
  if (!empty(r[to])) { note(skipped, `${from} -> ${to} (target already filled)`); return; }
  const value = transform(r[from]);
  if (empty(value)) { note(skipped, `${from} -> ${to} (source empty)`); return; }
  r[to] = value;
  delete r[from];
  note(moves, `${from} -> ${to}`);
}

for (const r of records) {
  // ---- tongue / pulse ----------------------------------------------------
  // Three candidates can coexist: tongue_preview {zh,en} (richest), legacy
  // `tongue` (a bare string, pre-bilingual), and canonical tongue_zh/_en.
  for (const f of ["tongue", "pulse"]) {
    const preview = r[`${f}_preview`];
    const legacy = r[f];
    const zh = String((preview && preview.zh) || "").trim();
    const legacyZh = String(legacy || "").trim();

    // Richer of the two wins; the loser is only dropped once the winner is set.
    let winner = zh.length >= legacyZh.length ? zh : legacyZh;
    const loser = winner === zh ? legacyZh : zh;
    /* The two strings are the same observation from two sources, so the longer
     * one usually contains the shorter. Usually — not always: 肝陽上亢 had 少津
     * only in the legacy string, and 腎陽虛 had 遲 (a slow pulse, the hallmark
     * of yang deficiency) only in the legacy string. Dropping the shorter
     * string would have deleted a real diagnostic sign, so when it carries a
     * character the winner does not, both readings are kept — the constitution's
     * 兩源不合就並記, and a flag for Ting to reconcile in RV1. */
    if (loser && [...loser].some((c) => !winner.includes(c))) {
      winner = `${winner}（另作：${loser}）`;
      note(moves, `${f}: both readings kept (sources disagree)`);
    }
    if (empty(r[`${f}_zh`]) && winner) {
      r[`${f}_zh`] = winner;
      note(moves, `${zh.length >= legacyZh.length ? f + "_preview.zh" : f} -> ${f}_zh`);
    }
    if (empty(r[`${f}_en`]) && preview && preview.en) {
      r[`${f}_en`] = preview.en;
      note(moves, `${f}_preview.en -> ${f}_en`);
    }
    // Both legacy carriers go only after the canonical field holds a value.
    if (!empty(r[`${f}_zh`])) {
      if (r[`${f}_preview`] !== undefined) delete r[`${f}_preview`];
      if (r[f] !== undefined) delete r[f];
    }
  }

  // ---- provenance, classification, treatment links -----------------------
  move(r, "source_ids", "sources");
  move(r, "pattern_category", "pattern_family");
  move(r, "primary_formula_ids", "typical_formulas");
  move(r, "primary_acupoint_ids", "typical_points");

  // `status` and `review_status` are the same concept; keep the canonical one.
  if (r.status !== undefined) {
    if (empty(r.review_status)) { r.review_status = r.status; note(moves, "status -> review_status"); }
    else if (r.review_status === r.status) note(moves, "status dropped (identical to review_status)");
    else { note(skipped, `status "${r.status}" != review_status "${r.review_status}"`); continue; }
    delete r.status;
  }
}

console.log("field moves:");
for (const [k, v] of [...moves.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(3)}  ${k}`);
if (skipped.size) {
  console.log("skipped (left alone on purpose):");
  for (const [k, v] of skipped) console.log(`  ${String(v).padStart(3)}  ${k}`);
}

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + "\n");
  console.log("\nWritten " + path.relative(ROOT, FILE));
} else {
  console.log("\nDry run. Use --apply to write.");
}
