#!/usr/bin/env node
/**
 * build-pattern-alias-map.js — close DECISIONS D10.
 *
 * The problem (measured 2026-08-05): the same TCM pattern exists in two
 * incompatible id namespaces with ZERO overlap.
 *
 *   data/pathology/pattern_registry.json   61 ids   pattern.blood_stasis
 *   data/pathology/pattern_library.json    50 ids   same namespace (48 shared)
 *   data/config/tcm_pattern_canon.json    140 recs  pat.氣血不和   <- Chinese in id
 *
 * D10 locks `pattern.<english_slug>` as the only namespace. Existing `pat.*`
 * records are never re-id'd and never deleted (D1/D6) — they are MAPPED.
 *
 * This script writes data/config/pattern_alias_map.json with three sections:
 *
 *   aliases                     pat.X -> pattern.Y, matched by Chinese name.
 *                               Safe: this is an identity match, not a claim.
 *   pending_registration        canon patterns with no pattern.* counterpart.
 *                               NOT auto-slugged — an English pattern name is
 *                               terminology that belongs to a cited source, so
 *                               the fill agent registers these with provenance
 *                               (skills/acuting-condition-fill). Sorted by how
 *                               many conditions actually reference them, so the
 *                               worklist starts where the value is.
 *   excluded_formula_patterns   方證 / 類方證 (桂枝湯證, 麻黃湯類方證 …).
 *                               D10 rule 5: a formula-pattern is not a 證候 and
 *                               does not belong in the pattern registry. Routed
 *                               out here so nobody "helpfully" registers them.
 *
 * Re-runnable and deterministic: same inputs -> same output. Run it again after
 * each registration batch and the pending list shrinks.
 *
 *   node scripts/build-pattern-alias-map.js            # dry run, prints summary
 *   node scripts/build-pattern-alias-map.js --write    # writes the map
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = "data/config/pattern_alias_map.json";

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

// Identity normalisation for name matching only — never used to build an id.
// Strips spacing/punctuation and the trailing 證 that the canon adds
// inconsistently (氣血不和證 vs 氣血不和 are the same pattern).
function normName(s) {
  return String(s || "")
    .replace(/[\s　（）()·、,，。;；:：]/g, "")
    .replace(/證$/, "")
    .trim();
}

// Decided by Ting (delegated to Claude, 2026-08-06): the two CloudTCM
// catch-all buckets are TAXONOMY RESIDUE, not clinical patterns. 氣血不和 and
// 臟腑虛弱 are how CloudTCM files "something is off with qi/blood" — they carry
// no discriminating signs, and registering them (74 condition references each)
// would create two mega-nodes linked to half the database. They are never
// registered; the fill line lifts the SPECIFIC patterns inside each condition's
// blobs instead, and these names stay here as a routing record.
const TAXONOMY_RESIDUE = new Set(["氣血不和", "臟腑虛弱"]);

// D10 rule 5: 方證 is a different diagnostic entity from 證候. The canon's own
// `kind` field is unreliable (桂枝湯類方 is tagged 證候), so the name is checked
// too: a formula name followed by 類方 / 方 / 證 is a formula-pattern.
const FORMULA_UNITS = "湯散丸飲膏丹丸子";
const FORMULA_PATTERN_RE = new RegExp(`[${FORMULA_UNITS}](類方|方)?證?$`);
function isFormulaPattern(rec) {
  if (rec.kind === "方證") return true;
  const n = String(rec.name_zh || "");
  if (/類方/.test(n)) return true;
  return FORMULA_PATTERN_RE.test(n);
}

// --- load -------------------------------------------------------------------
const registry = readJson("data/pathology/pattern_registry.json").records || [];
const library = readJson("data/pathology/pattern_library.json").records || [];
const canon = readJson("data/config/tcm_pattern_canon.json").records || [];
const conditions = readJson("data/pathology/condition_canon_shortlist.json").records || [];

// Canonical namespace: registry is the id authority, library must agree.
// Reject ambiguous active names instead of silently choosing a target; a false
// alias is an ontology error.
const canonicalByName = new Map();
function indexCanonicalName(nameZh, id, source) {
  if (!nameZh || !id) return;
  const key = normName(nameZh);
  const existing = canonicalByName.get(key);
  if (existing && existing.id !== id) {
    throw new Error(`Ambiguous canonical Chinese name ${nameZh}: ${existing.id} (${existing.source}) vs ${id} (${source})`);
  }
  canonicalByName.set(key, { id, source });
}

for (const r of registry) indexCanonicalName(r.name_zh, r.id, "registry.name_zh");
for (const r of library) {
  if (r.review_status === "deprecated") continue;
  indexCanonicalName(r.name_zh, r.id, "library.name_zh");
}

// Pattern V2-A Decision Pack §15: exact-identity aliases that also have a
// legacy pat.* endpoint. Keep this list explicit; not every historical card
// alias is safe to promote into a legacy identity mapping.
const APPROVED_LEGACY_ALIAS_TARGETS = new Map([
  ["pat.濕痰", "pattern.phlegm_damp"],
]);
const registryIds = new Set(registry.map((record) => record.id));
const activeLibraryById = new Map(
  library
    .filter((record) => record.review_status !== "deprecated")
    .map((record) => [record.id, record]),
);

// How often does each Chinese pattern name actually appear on a condition?
// The inline tcm_patterns blobs are the raw scrape (no ids) — this is exactly
// the material that has to be lifted, so it is the right priority signal.
const usage = new Map();
for (const c of conditions) {
  for (const blob of c.tcm_patterns || []) {
    const name = typeof blob === "string" ? blob : blob.pattern_zh;
    if (!name) continue;
    const k = normName(name);
    if (!usage.has(k)) usage.set(k, { count: 0, conditions: [] });
    const u = usage.get(k);
    u.count += 1;
    if (u.conditions.length < 8 && !u.conditions.includes(c.id)) u.conditions.push(c.id);
  }
}

// --- classify ---------------------------------------------------------------
const aliases = {};
const pending = [];
const excluded = [];
const seen = new Set();
let duplicateIds = 0;

for (const rec of canon) {
  if (!rec.id) continue;
  if (seen.has(rec.id)) { duplicateIds += 1; continue; }
  seen.add(rec.id);

  const nameZh = rec.name_zh || String(rec.id).replace(/^pat\./, "");
  const key = normName(nameZh);

  if (isFormulaPattern(rec)) {
    excluded.push({ legacy_id: rec.id, name_zh: nameZh, reason: "方證 / 類方證 — belongs to the formula layer, not the pattern registry (D10 rule 5)" });
    continue;
  }

  if (TAXONOMY_RESIDUE.has(key)) {
    excluded.push({ legacy_id: rec.id, name_zh: nameZh, reason: "CloudTCM catch-all bucket, not a discriminating clinical pattern — never register (Ting-delegated decision 2026-08-06); lift the specific patterns inside each condition's blobs instead" });
    continue;
  }

  const approvedAliasTarget = APPROVED_LEGACY_ALIAS_TARGETS.get(rec.id);
  if (approvedAliasTarget) {
    const targetRecord = activeLibraryById.get(approvedAliasTarget);
    if (!registryIds.has(approvedAliasTarget) || !targetRecord) {
      throw new Error(`Approved alias ${rec.id} has unresolved target ${approvedAliasTarget}`);
    }
    if (!(targetRecord.aliases_zh || []).some((alias) => normName(alias) === key)) {
      throw new Error(`Approved alias ${rec.id} is not present on ${approvedAliasTarget}`);
    }
    aliases[rec.id] = approvedAliasTarget;
    continue;
  }

  const hit = canonicalByName.get(key);
  if (hit) {
    aliases[rec.id] = hit.id;
    continue;
  }

  const u = usage.get(key) || { count: 0, conditions: [] };
  pending.push({
    legacy_id: rec.id,
    name_zh: nameZh,
    aliases_zh: rec.aliases_zh || [],
    used_by_condition_blobs: u.count,
    example_conditions: u.conditions,
  });
}

// Highest-usage patterns first — registering those unblocks the most conditions.
pending.sort((a, b) => b.used_by_condition_blobs - a.used_by_condition_blobs
  || a.name_zh.localeCompare(b.name_zh, "zh-Hant"));

// --- output -----------------------------------------------------------------
const out = {
  dataset: "Pattern alias map (DECISIONS D10)",
  policy: [
    "pattern.<english_slug> is the ONLY pattern namespace. `pat.<中文>` ids are legacy.",
    "Legacy ids are never re-id'd and never deleted (D1/D6) — they are mapped here.",
    "Chinese characters never go in an id (this repo has a documented mojibake history).",
    "pending_registration entries have NO proposed slug on purpose: an English pattern name is terminology that must come from a cited source, not from a model. Register them via skills/acuting-condition-fill.",
    "excluded_formula_patterns are 方證/類方證 — a different diagnostic entity. Do not register them as patterns.",
  ],
  generated_by: "scripts/build-pattern-alias-map.js",
  source_files: {
    id_authority: "data/pathology/pattern_registry.json",
    content_layer: "data/pathology/pattern_library.json",
    import_staging: "data/config/tcm_pattern_canon.json",
  },
  counts: {
    canon_records: canon.length,
    canon_unique_ids: seen.size,
    canon_duplicate_ids: duplicateIds,
    canonical_namespace_ids: new Set([...registry, ...library].map((r) => r.id)).size,
    mapped: Object.keys(aliases).length,
    pending_registration: pending.length,
    excluded_formula_patterns: excluded.length,
  },
  aliases,
  pending_registration: pending,
  excluded_formula_patterns: excluded,
};

const WRITE = process.argv.includes("--write");
if (WRITE) {
  fs.writeFileSync(path.join(ROOT, OUT), JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`wrote ${OUT}`);
} else {
  console.log(`(dry run — pass --write to save to ${OUT})`);
}
console.log(JSON.stringify(out.counts, null, 2));
console.log(`\ntop 10 pending registrations (by condition usage):`);
pending.slice(0, 10).forEach((p) => {
  console.log(`  ${String(p.used_by_condition_blobs).padStart(3)}×  ${p.name_zh}  (${p.legacy_id})`);
});
