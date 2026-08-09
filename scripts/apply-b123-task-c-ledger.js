#!/usr/bin/env node
/**
 * apply-b123-task-c-ledger.js — apply the ACCEPTED Batch 1–3 Task C ledger to
 * the registry (2026-08-08): pending_provenance → supported | not_found.
 *
 * Deterministic, idempotent, offline. Reads only the accepted supplement and
 * the manifest; hard-fails if the recomputed ledger differs from the accepted
 * 68/27, if any flag is double-classified, or if wording drifted. Touches
 * ONLY the 95 batch123 records — authored baseline and Batch 4 byte-preserved.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const supp = readJson("data/imports/official/b123_task_c_provenance_supplement.json");
const man = readJson("data/imports/official/b123_task_c_manifest.json");
const REG = path.join(ROOT, "data/pathology/red_flag_registry.json");
const registry = JSON.parse(fs.readFileSync(REG, "utf8"));
const fail = (m) => { console.error("LEDGER FAIL: " + m); process.exit(1); };

const ACCEPTED = { supported: 68, not_found: 27 };
const TIER_RANK = { emergency_referral: 3, urgent_referral: 2, routine_referral: 1 };

const manIds = new Set(); for (const c of man.conditions) for (const f of c.flags) manIds.add(f.red_flag_id);
const evByFlag = new Map(); const nf = new Map();
for (const r of supp.records) {
  for (const s of r.red_flag_sources || []) {
    if (!manIds.has(s.supports_red_flag_id)) fail("evidence for unknown flag " + s.supports_red_flag_id);
    if (!evByFlag.has(s.supports_red_flag_id)) evByFlag.set(s.supports_red_flag_id, []);
    evByFlag.get(s.supports_red_flag_id).push(s);
  }
  for (const n of r.not_found || []) {
    if (!manIds.has(n.red_flag_id)) fail("not_found for unknown flag " + n.red_flag_id);
    nf.set(n.red_flag_id, n);
  }
}
for (const id of evByFlag.keys()) if (nf.has(id)) fail("double-classified " + id);
if (evByFlag.size !== ACCEPTED.supported || nf.size !== ACCEPTED.not_found)
  fail(`recomputed ${evByFlag.size}/${nf.size} != accepted ${ACCEPTED.supported}/${ACCEPTED.not_found}`);
if (evByFlag.size + nf.size !== manIds.size) fail("coverage != 95");

let updated = 0;
for (const rec of registry.records) {
  if (rec.origin !== "legacy_card_migration_batch123") continue;
  const ev = evByFlag.get(rec.id);
  if (ev) {
    for (const s of ev) if (s.supports_flag_zh !== rec.trigger_zh) fail("wording drift on " + rec.id);
    rec.provenance_status = "supported";
    rec.evidence = ev.map((s) => ({
      source_url: s.source_url, source_org: s.source_org, page_title: s.page_title,
      section: s.section, quote_en: s.quote_en, retrieved_at: supp.retrieved_at || "2026-08-08",
      supports_flag_zh: s.supports_flag_zh, supports_flag_en: s.supports_flag_en,
    }));
    const top = ev.reduce((a, s) => (TIER_RANK[s.suggested_tier] > TIER_RANK[a] ? s.suggested_tier : a), "routine_referral");
    rec.tier = top;
    rec.tier_basis = "derived: max accepted Task C suggested_tier across this flag's evidence";
    delete rec.notes;
  } else {
    const n = nf.get(rec.id);
    if (!n) fail("unaccounted " + rec.id);
    rec.provenance_status = "not_found";
    rec.evidence = [];
    rec.notes = "Whitelisted provenance search RAN (Task C, accepted 2026-08-08) and found no whole-claim official support. Pages checked: " + JSON.stringify(n.pages_checked || n.checked || []) + ". Human provenance backlog — do not delete, do not invent.";
  }
  rec.provenance_review = "task_c_accepted_2026-08-08";
  updated += 1;
}
if (updated !== 95) fail("updated " + updated + " != 95");
fs.writeFileSync(REG, JSON.stringify(registry, null, 2) + "\n");
console.log(`ledger applied: 95 records → ${evByFlag.size} supported / ${nf.size} not_found · evidence entries ${[...evByFlag.values()].reduce((n, a) => n + a.length, 0)}`);
