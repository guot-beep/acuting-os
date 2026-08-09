#!/usr/bin/env node
/**
 * migrate-b123-red-flags.js — Batch 1–3 legacy red-flag registry migration
 * (2026-08-08). Same architecture as migrate-gyn-red-flags.js: deterministic,
 * idempotent, offline, reads only the frozen export, rebuilds exactly its own
 * rf.<cond>.legacyNN range, and never touches authored records or Batch 4.
 *
 * Provenance semantics — the distinction that matters (Ting, 2026-08-08):
 *   not_found            = a provenance search RAN and found nothing (gyn Task C)
 *   pending_provenance   = the search has NOT been run yet (all 95 flags here)
 * These 95 flags have had no Task-C-style research; pretending either
 * "supported" or "not_found" would be a lie in opposite directions.
 *
 * Legacy wording is FROZEN: verbatim from the export, never edited/merged/
 * split/deleted. This is identity/provenance normalization, not editing.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const exp = readJson("data/imports/official/b123_existing_red_flags_export.json");
const canon = readJson("data/pathology/condition_canon_shortlist.json");
const REG_PATH = path.join(ROOT, "data/pathology/red_flag_registry.json");
const registry = JSON.parse(fs.readFileSync(REG_PATH, "utf8"));
const fail = (m) => { console.error("MIGRATION FAIL: " + m); process.exit(1); };

// -- Preflight ---------------------------------------------------------------
if (exp.records.length !== 30) fail(`export conditions ${exp.records.length}, expected 30`);
const totalFlags = exp.records.reduce((n, r) => n + r.red_flags_zh.length, 0);
if (totalFlags !== 95) fail(`export flags ${totalFlags}, expected 95`);
const b4Before = registry.records.filter((r) => r.origin === "legacy_card_migration_batch4");
const authoredBefore = registry.records.filter((r) => !/\.legacy\d+$/.test(r.id));
if (b4Before.length !== 96) fail(`Batch 4 entries ${b4Before.length}, expected 96 — refusing to run`);
const slugs = new Set();
for (const card of exp.records) {
  const slug = card.condition_id.replace(/^cond\./, "");
  slugs.add(slug);
  if (card.red_flags_zh.length !== card.red_flags_en.length) fail(`${card.condition_id}: bilingual mismatch ${card.red_flags_zh.length}/${card.red_flags_en.length} — BLOCKED, never guess a translation`);
  const c = canon.records.find((r) => r.id === card.condition_id);
  if (!c) fail(`orphan condition ${card.condition_id}`);
  if (JSON.stringify(c.red_flags_zh || []) !== JSON.stringify(card.red_flags_zh) ||
      JSON.stringify(c.red_flags_en || []) !== JSON.stringify(card.red_flags_en)) fail(`${card.condition_id}: canonical arrays drifted from the frozen export — resolve before migrating, never auto-fix`);
  // identity collision guard: the legacyNN range must not collide with any
  // authored id, and no OTHER batch owns this slug's legacy range.
  for (const r of authoredBefore) if (r.entity_id === card.condition_id) {
    // coexistence is allowed; same-ID collision is impossible (authored ids
    // are semantic slugs) — but assert anyway.
    if (/\.legacy\d+$/.test(r.id)) fail(`authored record ${r.id} uses the legacy namespace`);
  }
  for (const r of b4Before) if (r.entity_id === card.condition_id) fail(`${card.condition_id} already migrated in Batch 4`);
}

// -- Build -------------------------------------------------------------------
const records = [];
for (const card of exp.records) {
  const slug = card.condition_id.replace(/^cond\./, "");
  card.red_flags_zh.forEach((zh, i) => {
    records.push({
      id: `rf.${slug}.legacy${String(i + 1).padStart(2, "0")}`,
      entity_id: card.condition_id,
      trigger_zh: zh,                                  // FROZEN
      trigger_en: card.red_flags_en[i],                // FROZEN
      provenance_status: "pending_provenance",
      origin: "legacy_card_migration_batch123",
      source_batch: card.source_batch,
      migrated_from: "data/imports/official/b123_existing_red_flags_export.json",
      review_status: "draft",
      authored_by: "migration:claude",
      evidence: [],
      notes: "Legacy clinical flag from the card; whitelisted provenance search has NOT yet been run (pending_provenance ≠ not_found). Queue for a Task-C-style pass before any supported/not_found verdict.",
    });
  });
}
if (records.length !== 95) fail(`built ${records.length} records, expected 95`);

// Replace exactly this range; everything else byte-preserved.
const isMine = (r) => { const m = String(r.id).match(/^rf\.([a-z0-9_]+)\.legacy\d+$/); return !!m && slugs.has(m[1]); };
const kept = registry.records.filter((r) => !isMine(r));
if (kept.filter((r) => r.origin === "legacy_card_migration_batch4").length !== 96) fail("Batch 4 would be altered — abort");
registry.records = [...kept, ...records];
fs.writeFileSync(REG_PATH, JSON.stringify(registry, null, 2) + "\n");
console.log(`migrated ${records.length} Batch 1-3 legacy records (all pending_provenance) · kept ${kept.length} (authored ${authoredBefore.length} + batch4 96) · total ${registry.records.length}`);
