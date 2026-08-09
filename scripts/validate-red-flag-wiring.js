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
    if (flag.provenance_status === "supported") supportedRefs += 1;
    else if (flag.provenance_status === "not_found") notFoundRefs += 1;
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
// Wiring is per-batch staged rollout: only batches whose WIRING round has run
// must be wired. Batch 4 is wired (8fa4d55); batch123 legacy records exist
// without refs BY DESIGN until their own wiring round — requiring refs for
// them here would force the wiring this round explicitly forbids.
const WIRED_ORIGINS = new Set(["legacy_card_migration_batch4", "legacy_card_migration_batch123"]);
const legacyByEntity = new Map();
for (const r of registry.records) {
  if (!/^rf\.[a-z0-9_]+\.legacy\d+$/.test(r.id)) continue;
  if (!WIRED_ORIGINS.has(r.origin)) continue;
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

// Per-batch invariants (staged rollout, 2026-08-08). Wiring must never move a
// provenance ledger: batch4 stays 25 cards / 96 refs at 83/13; batch123 stays
// 30 cards / 95 refs, all pending_provenance until its Task-C round runs.
const tally = {};
for (const rec of canon.records) {
  for (const id of rec.red_flag_refs || []) {
    const flag = regById.get(id); if (!flag) continue;
    const t = (tally[flag.origin] ||= { cards: new Set(), refs: 0, supported: 0, not_found: 0, pending_provenance: 0 });
    t.cards.add(rec.id); t.refs += 1; t[flag.provenance_status] = (t[flag.provenance_status] || 0) + 1;
  }
}
const expect = {
  legacy_card_migration_batch4: { cards: 25, refs: 96, supported: 83, not_found: 13, pending_provenance: 0 },
  // Task C accepted 2026-08-08: the batch123 ledger is now 68/27/0.
  legacy_card_migration_batch123: { cards: 30, refs: 95, supported: 68, not_found: 27, pending_provenance: 0 },
};
for (const [origin, e] of Object.entries(expect)) {
  const t = tally[origin] || { cards: new Set(), refs: 0, supported: 0, not_found: 0, pending_provenance: 0 };
  if (t.cards.size !== e.cards || t.refs !== e.refs || t.supported !== e.supported || t.not_found !== e.not_found || t.pending_provenance !== e.pending_provenance)
    defects.push(`CW-BATCH ${origin}: ${t.cards.size} cards / ${t.refs} refs (${t.supported}/${t.not_found}/${t.pending_provenance}) — expected ${e.cards}/${e.refs} (${e.supported}/${e.not_found}/${e.pending_provenance})`);
}

console.log(`red-flag wiring: ${wiredCards} wired cards · ${totalRefs} refs (${supportedRefs} supported / ${notFoundRefs} not_found / ${(tally.legacy_card_migration_batch123 || {}).pending_provenance || 0} pending) · ${defects.length} defects`);
if (defects.length) { defects.forEach((d) => console.log("  " + d)); process.exit(1); }
