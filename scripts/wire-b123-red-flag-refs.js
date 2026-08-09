#!/usr/bin/env node
/**
 * wire-b123-red-flag-refs.js — Batch 1–3 canonical wiring (2026-08-08).
 * Same architecture as wire-gyn-red-flag-refs.js (reference-first +
 * compatibility mirror), scoped to the 30 conditions the f72dfb7 migration
 * covered. Conditions without migrated legacy entries stay untouched — no
 * empty red_flag_refs are ever added.
 *
 * Deterministic, idempotent, offline. Every preflight is a hard stop; this
 * script never edits clinical wording and never touches the registry.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const exp = readJson("data/imports/official/b123_existing_red_flags_export.json");
const registry = readJson("data/pathology/red_flag_registry.json");
const CANON = path.join(ROOT, "data/pathology/condition_canon_shortlist.json");
const canon = JSON.parse(fs.readFileSync(CANON, "utf8"));
const fail = (m) => { console.error("PREFLIGHT FAIL: " + m); process.exit(1); };

const b123 = registry.records.filter((r) => r.origin === "legacy_card_migration_batch123");
const byId = new Map(registry.records.map((r) => [r.id, r]));

// -- Preflight 1-14 ----------------------------------------------------------
if (exp.records.length !== 30) fail(`export conditions ${exp.records.length} != 30`);
const expFlags = exp.records.reduce((n, r) => n + r.red_flags_zh.length, 0);
if (expFlags !== 95) fail(`export flags ${expFlags} != 95`);
if (b123.length !== 95) fail(`registry batch123 entries ${b123.length} != 95`);
const perBatch = { batch1: 0, batch2: 0, batch3: 0 };
for (const card of exp.records) perBatch[card.source_batch] += card.red_flags_zh.length;
if (perBatch.batch1 !== 1 || perBatch.batch2 !== 86 || perBatch.batch3 !== 8) fail(`per-batch split ${JSON.stringify(perBatch)} != 1/86/8`);
const pend = b123.filter((r) => r.provenance_status === "pending_provenance").length;
if (pend !== 95) fail(`pending_provenance ${pend} != 95`);
if (b123.some((r) => r.provenance_status === "supported")) fail("unexpected supported in batch123");
if (b123.some((r) => r.provenance_status === "not_found")) fail("unexpected not_found in batch123");

for (const card of exp.records) {
  const slug = card.condition_id.replace(/^cond\./, "");
  card.red_flags_zh.forEach((zh, i) => {
    const id = `rf.${slug}.legacy${String(i + 1).padStart(2, "0")}`;
    const rec = byId.get(id);
    if (!rec) fail(`ordinal gap: ${id} missing from registry`);
    if (rec.entity_id !== card.condition_id) fail(`ownership: ${id} -> ${rec.entity_id}`);
    if (rec.trigger_zh !== zh) fail(`${id}: registry zh != export`);
    if (rec.trigger_en !== card.red_flags_en[i]) fail(`${id}: registry en != export`);
  });
  const cRec = canon.records.find((c) => c.id === card.condition_id);
  if (!cRec) fail(`canon missing ${card.condition_id}`);
  if (JSON.stringify(cRec.red_flags_zh || []) !== JSON.stringify(card.red_flags_zh) ||
      JSON.stringify(cRec.red_flags_en || []) !== JSON.stringify(card.red_flags_en))
    fail(`${card.condition_id}: canonical arrays drifted from frozen export — never auto-fix`);
}
// Batch 4 wiring baseline must be intact before we touch anything.
const b4Wired = canon.records.filter((r) => Array.isArray(r.red_flag_refs) && r.red_flag_refs.some((id) => byId.get(id)?.origin === "legacy_card_migration_batch4"));
const b4Refs = b4Wired.reduce((n, r) => n + r.red_flag_refs.length, 0);
if (b4Wired.length !== 25 || b4Refs !== 96) fail(`Batch 4 wiring baseline ${b4Wired.length}/${b4Refs} != 25/96`);

// -- Wire --------------------------------------------------------------------
let wired = 0, refs = 0;
for (const card of exp.records) {
  const slug = card.condition_id.replace(/^cond\./, "");
  const cRec = canon.records.find((c) => c.id === card.condition_id);
  cRec.red_flag_refs = card.red_flags_zh.map((_, i) => `rf.${slug}.legacy${String(i + 1).padStart(2, "0")}`);
  wired += 1; refs += cRec.red_flag_refs.length;
}
fs.writeFileSync(CANON, JSON.stringify(canon, null, 2) + "\n");
console.log(`wired ${wired} cards · ${refs} refs (b1 ${perBatch.batch1} / b2 ${perBatch.batch2} / b3 ${perBatch.batch3}) · preflight 14/14 passed`);
