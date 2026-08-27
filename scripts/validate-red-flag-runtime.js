#!/usr/bin/env node
/**
 * validate-red-flag-runtime.js — the generated bundle's red-flag resolver
 * checks (RT-RF1…RT-RF9, RT-RF10; 2026-08-08). RT-RF8 (deterministic rebuild)
 * is proven by the double-build in the migration turn and by CI's
 * generated-data-current gate.
 *
 *   RT1 all wired canonical cards exist in the bundle (55 today)
 *   RT2 every ref resolves in the bundled registry (191 today)
 *   RT3 bundle red_flag_record_ids === canonical red_flag_refs, same order
 *   RT4 bundle red_flags_zh/en === the refs' registry triggers, byte-for-byte
 *       (this is also the proof that the resolver swap changed nothing on
 *       screen: the wired cards' inline arrays already equal the expansion)
 *   RT5 zero entity ownership mismatches through the runtime ids
 *   RT6 runtime provenance ledger through wired refs = 151 supported /
 *       40 not_found / 0 pending (batch4 83/13 · batch123 68/27)
 *   RT7 authored-only fallback coverage does not drop below 24 conditions
 *   RT9 the bundle's embedded registry is semantically identical to the
 *       source registry file (resolver must not mutate clinical data)
 *   RT10 unwired condition/TDIS fallback contains zero legacy-migration records
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const K = require("./lib/load-knowledge.js").loadKnowledge();
if (!K) { console.error("validate-red-flag-runtime: 知識分片載入失敗 — 先跑 node scripts/build-data.js"); process.exit(1); }
const canon = JSON.parse(fs.readFileSync(path.join(ROOT, "data/pathology/condition_canon_shortlist.json"), "utf8"));
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "data/pathology/red_flag_registry.json"), "utf8"));
const regById = new Map(registry.records.map((r) => [r.id, r]));

const defects = [];
const bundleById = new Map(K.conditionCanon.records.map((r) => [r.id, r]));
const wiredSrc = canon.records.filter((r) => Array.isArray(r.red_flag_refs) && r.red_flag_refs.length);

let refs = 0;
const ledger = { supported: 0, not_found: 0, pending_provenance: 0 };
const perOrigin = {};
for (const src of wiredSrc) {
  const b = bundleById.get(src.id);
  if (!b) { defects.push(`RT1 ${src.id} missing from bundle`); continue; }
  refs += src.red_flag_refs.length;
  if (JSON.stringify(b.red_flag_record_ids || []) !== JSON.stringify(src.red_flag_refs))
    defects.push(`RT3 ${src.id}: bundle ids != canonical refs (order or membership)`);
  const zh = [], en = [];
  for (const id of src.red_flag_refs) {
    const f = regById.get(id);
    if (!f) { defects.push(`RT2 ${src.id}: dangling ${id}`); continue; }
    if (f.entity_id !== src.id) defects.push(`RT5 ${src.id}: ${id} owned by ${f.entity_id}`);
    zh.push(f.trigger_zh); en.push(f.trigger_en);
    ledger[f.provenance_status] = (ledger[f.provenance_status] || 0) + 1;
    const t = (perOrigin[f.origin] ||= { supported: 0, not_found: 0 });
    t[f.provenance_status] = (t[f.provenance_status] || 0) + 1;
  }
  if (JSON.stringify(b.red_flags_zh || []) !== JSON.stringify(zh)) defects.push(`RT4 ${src.id}: bundle red_flags_zh != refs expansion`);
  if (JSON.stringify(b.red_flags_en || []) !== JSON.stringify(en)) defects.push(`RT4 ${src.id}: bundle red_flags_en != refs expansion`);
}
if (wiredSrc.length !== 55) defects.push(`RT1 wired cards ${wiredSrc.length} != 55`);
if (refs !== 191) defects.push(`RT2 refs ${refs} != 191`);
if (ledger.supported !== 151 || ledger.not_found !== 40 || (ledger.pending_provenance || 0) !== 0)
  defects.push(`RT6 ledger ${ledger.supported}/${ledger.not_found}/${ledger.pending_provenance || 0} != 151/40/0`);
const b4 = perOrigin.legacy_card_migration_batch4 || {};
const b123 = perOrigin.legacy_card_migration_batch123 || {};
if ((b4.supported || 0) !== 83 || (b4.not_found || 0) !== 13) defects.push(`RT6 batch4 ${b4.supported}/${b4.not_found} != 83/13`);
if ((b123.supported || 0) !== 68 || (b123.not_found || 0) !== 27) defects.push(`RT6 batch123 ${b123.supported}/${b123.not_found} != 68/27`);

// RT7 — authored-only fallback must not shrink
// (floor raised 24→27, 2026-08-27: the 3 D23 skeletons got authored registry
// records — cond.anovulation / unexplained_infertility / insulin_resistance)
const wiredIds = new Set(wiredSrc.map((r) => r.id));
const authoredOnly = K.conditionCanon.records.filter((r) => (r.red_flag_record_ids || []).length && !wiredIds.has(r.id));
if (authoredOnly.length < 27) defects.push(`RT7 authored-only fallback ${authoredOnly.length} < 27 — safety presentation lost`);

// RT9 — bundled registry must equal the source registry
if (JSON.stringify(K.redFlagRegistry.records) !== JSON.stringify(registry.records))
  defects.push("RT9 bundled registry differs from source — resolver mutated clinical data");


// RT10 — unwired runtime fallback must never expose legacy-migration records.
// Migrated legacy membership becomes visible only after canonical red_flag_refs wiring.
const isLegacyMigrationRecord = (r) =>
  String(r.origin || "").startsWith("legacy_card_migration_");

const checkUnwiredLeakage = (records, namespace) => {
  for (const rec of records || []) {
    if (Array.isArray(rec.red_flag_refs) && rec.red_flag_refs.length) continue;

    for (const id of rec.red_flag_record_ids || []) {
      const flag = regById.get(id);
      if (!flag) {
        defects.push(`RT10 ${namespace} ${rec.id}: runtime id ${id} missing from registry`);
        continue;
      }

      if (isLegacyMigrationRecord(flag)) {
        defects.push(
          `RT10 ${namespace} ${rec.id}: unwired legacy-migration record leaked into runtime (${id}, origin ${flag.origin})`
        );
      }
    }
  }
};

checkUnwiredLeakage(K.conditionCanon.records, "condition");
checkUnwiredLeakage(K.tdisRegistry.records, "tdis");

console.log(
  `red-flag runtime: ${wiredSrc.length} wired cards · ${refs} refs · ` +
  `ledger ${ledger.supported}/${ledger.not_found}/${ledger.pending_provenance || 0} · ` +
  `authored-only fallback ${authoredOnly.length} · ${defects.length} defects`
);

if (defects.length) {
  defects.forEach((d) => console.log("  " + d));
  process.exit(1);
}
