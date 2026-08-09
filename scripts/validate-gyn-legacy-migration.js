#!/usr/bin/env node
/**
 * validate-gyn-legacy-migration.js — Batch 4 GYN legacy migration checks
 * (Ting's RF1–RF9 acceptance list, 2026-08-08). Small and single-purpose;
 * general registry shape stays in validate-red-flag-registry.js.
 *
 *   G1 coverage: all 96 export flags exist in the registry
 *   G2 wording: registry zh/en byte-identical to the frozen export
 *   G3 identity: unique ids; unique (condition_id, trigger_zh)
 *   G4 ledger: exactly 83 supported / 13 not_found / 96 total
 *   G5 evidence linkage: every supported flag has ≥1 evidence whose
 *      supports_flag_zh equals the full trigger (no truncated-note linkage)
 *   G6 not_found integrity: no evidence, status not silently supported
 *   G7 whitelist: every evidence source_url on the accepted official list
 *   G8 quote regression: the 4 corrected 001927 verbatims present; the 4
 *      rejected paraphrases absent
 *   G9 condition resolution: all 25 ids resolve in canon AND crosswalk
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const exp = readJson("data/imports/official/gyn_existing_red_flags_export.json");
const registry = readJson("data/pathology/red_flag_registry.json");
const canonIds = new Set(readJson("data/pathology/condition_canon_shortlist.json").records.map((r) => r.id));
const xwIds = new Set(readJson("data/interop/condition_crosswalk.json").records.map((r) => r.condition_id));

// Scope: THIS validator owns the Batch 4 gyn migration only. Other batches'
// legacy records (origin legacy_card_migration_batch123, 2026-08-08) have
// their own validator; counting them here would corrupt the 83/13 ledger.
const legacy = registry.records.filter((r) => /^rf\.[a-z0-9_]+\.legacy\d+$/.test(r.id) && r.origin === "legacy_card_migration_batch4");
const byKey = new Map(legacy.map((r) => [r.entity_id + "|" + r.trigger_zh, r]));
const defects = [];

// G1 + G2
let expected = 0;
for (const card of exp.records) card.red_flags_zh.forEach((zh, i) => {
  expected += 1;
  const rec = byKey.get(card.condition_id + "|" + zh);
  if (!rec) { defects.push(`G1 missing: ${card.condition_id} [${i}] ${zh.slice(0, 24)}`); return; }
  if (rec.trigger_zh !== zh) defects.push(`G2 zh mutated: ${rec.id}`);
  if (rec.trigger_en !== (card.red_flags_en[i] || "")) defects.push(`G2 en mutated: ${rec.id}`);
});

// G3
const ids = legacy.map((r) => r.id);
if (new Set(ids).size !== ids.length) defects.push("G3 duplicate red_flag_id");
if (byKey.size !== legacy.length) defects.push("G3 duplicate (condition_id, trigger_zh)");

// G4
const sup = legacy.filter((r) => r.provenance_status === "supported").length;
const nf = legacy.filter((r) => r.provenance_status === "not_found").length;
if (sup !== 83 || nf !== 13 || legacy.length !== 96) defects.push(`G4 ledger ${sup}/${nf}/${legacy.length}, accepted 83/13/96`);

// G5 + G6 + G7
const WL = /^https:\/\/(www\.)?(cms\.gov|cdc\.gov|medlineplus\.gov|niddk\.nih\.gov|nidcd\.nih\.gov|ninds\.nih\.gov|niams\.nih\.gov|nichd\.nih\.gov|nhlbi\.nih\.gov)\//;
for (const r of legacy) {
  if (r.provenance_status === "supported") {
    const linked = (r.evidence || []).filter((e) => e.supports_flag_zh === r.trigger_zh);
    if (!linked.length) defects.push(`G5 no full-text-linked evidence: ${r.id}`);
  } else {
    if ((r.evidence || []).length) defects.push(`G6 not_found with evidence: ${r.id}`);
  }
  for (const e of r.evidence || []) if (!WL.test(e.source_url || "")) defects.push(`G7 off-whitelist: ${r.id} ${e.source_url}`);
}

// G8 — the 4 corrected verbatims stay; the paraphrases must never come back
const allQuotes = legacy.flatMap((r) => (r.evidence || []).map((e) => e.quote_en));
const MUST = ["Bleeding that will not stop", "Chest pain or discomfort lasting for two minutes or more",
  "Inability to speak; Sudden dizziness, weakness, or change in vision"];
const BANNED = ["Severe chest pain or pressure", "Suddenly not able to speak, see, walk, or move"];
for (const q of MUST) if (!allQuotes.includes(q)) defects.push(`G8 corrected verbatim missing: "${q}"`);
for (const q of BANNED) if (allQuotes.includes(q)) defects.push(`G8 rejected paraphrase reappeared: "${q}"`);
if (allQuotes.filter((q) => q === "Bleeding that will not stop").length < 2) defects.push("G8 'Bleeding that will not stop' expected in menorrhagia AND postpartum evidence");

// G9
for (const card of exp.records) {
  if (!canonIds.has(card.condition_id)) defects.push(`G9 not in canon: ${card.condition_id}`);
  if (!xwIds.has(card.condition_id)) defects.push(`G9 not in crosswalk: ${card.condition_id}`);
}

const evTotal = legacy.reduce((n, r) => n + (r.evidence || []).length, 0);
console.log(`gyn legacy migration: ${legacy.length}/${expected} flags · ${sup} supported / ${nf} not_found · ${evTotal} evidence entries · ${defects.length} defects`);
if (defects.length) { defects.forEach((d) => console.log("  " + d)); process.exit(1); }
