#!/usr/bin/env node
/**
 * validate-b123-legacy-migration.js — Batch 1–3 legacy migration checks
 * (Ting's B13-RF1…RF9 acceptance list, 2026-08-08). Canonical/crosswalk
 * isolation (B13-RF10/11) is a git-level check reported by the migration
 * turn; idempotency (B13-RF12) is proven by the double-run.
 *
 *   B1 coverage: all 95 export flags exist in the registry
 *   B2 wording: registry zh/en byte-identical to the frozen export
 *   B3 ordinal: legacyNN matches export order, no gap, no duplicate
 *   B4 identity: ids unique across the WHOLE registry
 *   B5 ownership: every condition_id resolves in canon
 *   B6 provenance-state integrity: batch123 records are pending_provenance
 *      with zero evidence — never not_found (no search ran), never supported
 *   B7 evidence linkage: any future evidence must carry full-text
 *      supports_flag_zh equal to the trigger (enforced now for safety)
 *   B8 coexistence: authored baseline (35) fully present
 *   B9 Batch 4 regression: 96 records, 83/13 ledger, 142 evidence, zero
 *      wording/id mutation against the gyn export
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const exp = readJson("data/imports/official/b123_existing_red_flags_export.json");
const gynExp = readJson("data/imports/official/gyn_existing_red_flags_export.json");
const registry = readJson("data/pathology/red_flag_registry.json");
const canonIds = new Set(readJson("data/pathology/condition_canon_shortlist.json").records.map((r) => r.id));

const defects = [];
const b123 = registry.records.filter((r) => r.origin === "legacy_card_migration_batch123");
const byId = new Map(registry.records.map((r) => [r.id, r]));

// B1 + B2 + B3
let expected = 0;
for (const card of exp.records) {
  const slug = card.condition_id.replace(/^cond\./, "");
  card.red_flags_zh.forEach((zh, i) => {
    expected += 1;
    const id = `rf.${slug}.legacy${String(i + 1).padStart(2, "0")}`;
    const rec = byId.get(id);
    if (!rec) { defects.push(`B1 missing ${id}`); return; }
    if (rec.trigger_zh !== zh) defects.push(`B2 zh mutated ${id}`);
    if (rec.trigger_en !== card.red_flags_en[i]) defects.push(`B2 en mutated ${id}`);
    if (rec.entity_id !== card.condition_id) defects.push(`B3 ownership ${id}`);
  });
  const count = b123.filter((r) => r.entity_id === card.condition_id).length;
  if (count !== card.red_flags_zh.length) defects.push(`B3 ordinal count ${card.condition_id}: ${count} vs ${card.red_flags_zh.length}`);
}
if (b123.length !== expected) defects.push(`B1 stray batch123 records: ${b123.length} vs export ${expected}`);

// B4
const ids = registry.records.map((r) => r.id);
if (new Set(ids).size !== ids.length) defects.push("B4 duplicate id in registry");

// B5 + B6 + B7. B6 expectations updated after the accepted Task C pass
// (2026-08-08): the search HAS now run, so the honest ledger is exactly
// 68 supported / 27 not_found / 0 pending. supported requires evidence;
// not_found requires none; pending may no longer exist in this batch.
for (const r of b123) {
  if (!canonIds.has(r.entity_id)) defects.push(`B5 orphan ${r.id}`);
  if (r.provenance_status === "supported" && !(r.evidence || []).length) defects.push(`B6 ${r.id}: supported without evidence`);
  if (r.provenance_status === "not_found" && (r.evidence || []).length) defects.push(`B6 ${r.id}: not_found with evidence`);
  if (r.provenance_status === "pending_provenance") defects.push(`B6 ${r.id}: still pending after the accepted Task C ledger`);
  for (const e of r.evidence || []) if (e.supports_flag_zh !== r.trigger_zh) defects.push(`B7 ${r.id}: evidence not full-text linked`);
}
const supB = b123.filter((r) => r.provenance_status === "supported").length;
const nfB = b123.filter((r) => r.provenance_status === "not_found").length;
if (supB !== 68 || nfB !== 27) defects.push(`B6 ledger ${supB}/${nfB}, accepted 68/27`);

// B8
const authored = registry.records.filter((r) => !/\.legacy\d+$/.test(r.id));
if (authored.length !== 35) defects.push(`B8 authored baseline ${authored.length}, expected 35`);

// B9 — Batch 4 full regression against ITS frozen export
const b4 = registry.records.filter((r) => r.origin === "legacy_card_migration_batch4");
const b4sup = b4.filter((r) => r.provenance_status === "supported").length;
const b4ev = b4.reduce((n, r) => n + (r.evidence || []).length, 0);
if (b4.length !== 96 || b4sup !== 83 || b4.length - b4sup !== 13 || b4ev !== 142)
  defects.push(`B9 Batch 4 ledger drifted: ${b4.length} records ${b4sup}/${b4.length - b4sup}, evidence ${b4ev}`);
for (const card of gynExp.records) {
  const slug = card.condition_id.replace(/^cond\./, "");
  card.red_flags_zh.forEach((zh, i) => {
    const rec = byId.get(`rf.${slug}.legacy${String(i + 1).padStart(2, "0")}`);
    if (!rec) { defects.push(`B9 Batch 4 id missing rf.${slug}.legacy${String(i + 1).padStart(2, "0")}`); return; }
    if (rec.trigger_zh !== zh || rec.trigger_en !== card.red_flags_en[i]) defects.push(`B9 Batch 4 wording mutated: rf.${slug}.legacy${String(i + 1).padStart(2, "0")}`);
  });
}

const pending = b123.filter((r) => r.provenance_status === "pending_provenance").length;
console.log(`b123 legacy migration: ${b123.length}/${expected} flags · ${pending} pending_provenance · authored ${authored.length} · batch4 ${b4.length} (${b4sup}/${b4.length - b4sup}, ${b4ev} ev) · ${defects.length} defects`);
if (defects.length) { defects.forEach((d) => console.log("  " + d)); process.exit(1); }
