#!/usr/bin/env node
/**
 * validate-red-flag-wiring.js — canonical card ↔ red-flag registry wiring
 * (CW-RF1…CW-RF8, 2026-08-08). This is also the permanent ANTI-DRIFT guard:
 * once a card carries red_flag_refs, the registry text is the authority —
 * editing the card's legacy arrays without the registry (or vice versa)
 * fails here. Small and single-purpose; registry shape and ledger stay in
 * validate-red-flag-registry.js / validate-gyn-legacy-migration.js.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const canon = readJson("data/pathology/condition_canon_shortlist.json");
const registry = readJson("data/pathology/red_flag_registry.json");
const regById = new Map(registry.records.map((r) => [r.id, r]));

const defects = [];
let wiredCards = 0, totalRefs = 0, supportedRefs = 0, notFoundRefs = 0;

for (const rec of canon.records) {
  if (!Array.isArray(rec.red_flag_refs)) continue;   // wiring is per-batch opt-in
  wiredCards += 1;
  const refs = rec.red_flag_refs;
  totalRefs += refs.length;

  // CW-RF8 duplicates within one card
  if (new Set(refs).size !== refs.length) defects.push(`CW-RF8 ${rec.id}: duplicate refs`);

  const zh = [], en = [];
  refs.forEach((id) => {
    const flag = regById.get(id);
    if (!flag) { defects.push(`CW-RF2 ${rec.id}: dangling ref ${id}`); return; }
    // CW-RF3 ownership
    if (flag.entity_id !== rec.id) defects.push(`CW-RF3 ${rec.id}: ref ${id} belongs to ${flag.entity_id}`);
    zh.push(flag.trigger_zh); en.push(flag.trigger_en);
    if (flag.provenance_status === "not_found") notFoundRefs += 1; else supportedRefs += 1;
  });

  // CW-RF4 + CW-RF5: expansion must equal the legacy arrays exactly, in order.
  // This single check IS the anti-drift guard in both directions.
  if (JSON.stringify(zh) !== JSON.stringify(rec.red_flags_zh || []))
    defects.push(`CW-RF5 ${rec.id}: red_flags_zh drifted from registry expansion (edit registry + card together, never one side)`);
  if (JSON.stringify(en) !== JSON.stringify(rec.red_flags_en || []))
    defects.push(`CW-RF5 ${rec.id}: red_flags_en drifted from registry expansion`);
}

// CW-RF1 coverage for the migrated batch: every entity that has legacy
// registry records must be wired, and ref counts must match.
const legacyByEntity = new Map();
for (const r of registry.records) {
  if (!/^rf\.[a-z0-9_]+\.legacy\d+$/.test(r.id)) continue;
  legacyByEntity.set(r.entity_id, (legacyByEntity.get(r.entity_id) || 0) + 1);
}
for (const [entity, count] of legacyByEntity) {
  const rec = canon.records.find((c) => c.id === entity);
  if (!rec || !Array.isArray(rec.red_flag_refs)) { defects.push(`CW-RF1 ${entity}: has ${count} legacy registry records but no red_flag_refs`); continue; }
  if (rec.red_flag_refs.length !== count) defects.push(`CW-RF1 ${entity}: ${rec.red_flag_refs.length} refs vs ${count} registry records`);
}

// CW-RF7: not_found flags must be referenced like any other
const nfIds = registry.records.filter((r) => r.provenance_status === "not_found").map((r) => r.id);
const allRefs = new Set(canon.records.flatMap((r) => r.red_flag_refs || []));
for (const id of nfIds) if (!allRefs.has(id)) defects.push(`CW-RF7 not_found flag ${id} excluded from canonical refs`);

console.log(`red-flag wiring: ${wiredCards} wired cards · ${totalRefs} refs (${supportedRefs} supported / ${notFoundRefs} not_found) · ${defects.length} defects`);
if (defects.length) { defects.forEach((d) => console.log("  " + d)); process.exit(1); }
