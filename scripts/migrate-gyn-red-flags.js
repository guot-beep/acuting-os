#!/usr/bin/env node
/**
 * migrate-gyn-red-flags.js — Batch 4 GYN legacy red-flag registry migration.
 *
 * Deterministic and idempotent: reads ONLY the two accepted local artifacts
 * (the frozen legacy-wording export + the accepted Task C staging), rebuilds
 * the 96 rf.<cond>.legacyNN records from scratch, and replaces exactly that
 * id range. Rerunning produces byte-identical output. No network. Hard-fails
 * if the recomputed provenance ledger differs from the accepted 83/13.
 *
 * Identity: rf.<cond-slug>.legacyNN where NN is the flag's 1-based position
 * in the FROZEN export file. Deterministic across reruns, stable under any
 * future wording revision (position, not text, is the identity), and never
 * derived from URLs, quotes, or truncated notes.
 *
 * Legacy wording is FROZEN: trigger_zh/_en are copied verbatim from the
 * export. This script never rewrites, merges, splits, or deletes a flag.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const exp = readJson("data/imports/official/gyn_existing_red_flags_export.json");
const b4 = readJson("data/imports/official/cond_batch4_gyn.json");
const REG_PATH = path.join(ROOT, "data/pathology/red_flag_registry.json");
const registry = JSON.parse(fs.readFileSync(REG_PATH, "utf8"));

const ACCEPTED_SUPPORTED = 83, ACCEPTED_NOT_FOUND = 13;
const TIER_RANK = { emergency_referral: 3, urgent_referral: 2, routine_referral: 1 };
const NF_PREFIX = "No whitelisted official support located for existing flag: ";

// Recompute the ledger from the accepted staging — never trust a summary.
const evidenceByFlag = new Map();   // "<cond>|<zh>" -> [evidence]
const notFoundEn = new Map();       // cond -> Set(en text)
for (const r of b4.records) {
  for (const s of r.red_flag_sources || []) {
    const key = r.condition_id + "|" + s.supports_flag_zh;
    if (!evidenceByFlag.has(key)) evidenceByFlag.set(key, []);
    evidenceByFlag.get(key).push(s);
  }
  notFoundEn.set(r.condition_id, new Set(
    (r.not_found || []).filter((n) => n.startsWith(NF_PREFIX)).map((n) => n.slice(NF_PREFIX.length).trim())
  ));
}

const records = [];
let supported = 0, notFound = 0;
for (const card of exp.records) {
  const slug = card.condition_id.replace(/^cond\./, "");
  card.red_flags_zh.forEach((zh, i) => {
    const en = card.red_flags_en[i] || "";
    const id = `rf.${slug}.legacy${String(i + 1).padStart(2, "0")}`;
    const evidence = evidenceByFlag.get(card.condition_id + "|" + zh) || [];
    const isNF = notFoundEn.get(card.condition_id)?.has(en.trim());
    if (evidence.length && isNF) throw new Error("flag both supported and not_found: " + id);
    if (!evidence.length && !isNF) throw new Error("flag unaccounted in accepted staging: " + id + " " + zh);
    const rec = {
      id,
      entity_id: card.condition_id,
      trigger_zh: zh,           // FROZEN legacy wording — never edited here
      trigger_en: en,
      provenance_status: evidence.length ? "supported" : "not_found",
      origin: "legacy_card_migration_batch4",
      migrated_from: "data/imports/official/gyn_existing_red_flags_export.json",
      review_status: "draft",
      authored_by: "migration:claude",
      evidence: evidence.map((s) => ({
        source_url: s.source_url,
        source_org: s.source_org,
        page_title: s.page_title,
        section: s.section,
        quote_en: s.quote_en,
        retrieved_at: "2026-08-07",
        supports_flag_zh: s.supports_flag_zh,
        supports_flag_en: s.supports_flag_en,
        ...(s.supplement ? { supplement: s.supplement } : {}),
      })),
    };
    if (evidence.length) {
      supported += 1;
      const top = evidence.reduce((a, s) => (TIER_RANK[s.suggested_tier] > TIER_RANK[a] ? s.suggested_tier : a), "routine_referral");
      rec.tier = top;
      rec.tier_basis = "derived: max accepted Task C suggested_tier across this flag's evidence";
    } else {
      notFound += 1;
      rec.notes = "Legacy clinical flag exists on the card; no whitelisted official provenance located (Task C accepted 2026-08-08). Queued for the human provenance backlog — do not delete, do not auto-source.";
    }
    records.push(rec);
  });
}

if (supported !== ACCEPTED_SUPPORTED || notFound !== ACCEPTED_NOT_FOUND) {
  console.error(`LEDGER MISMATCH: recomputed ${supported}/${notFound}, accepted ${ACCEPTED_SUPPORTED}/${ACCEPTED_NOT_FOUND} — refusing to migrate.`);
  process.exit(1);
}

// Replace exactly the legacy id range for these 25 conditions; all other
// records (the 35-record authored baseline and anything future) untouched.
const slugs = new Set(exp.records.map((c) => c.condition_id.replace(/^cond\./, "")));
const isLegacyGyn = (r) => { const m = String(r.id).match(/^rf\.([a-z0-9_]+)\.legacy\d+$/); return !!m && slugs.has(m[1]); };
const kept = registry.records.filter((r) => !isLegacyGyn(r));
registry.records = [...kept, ...records];
fs.writeFileSync(REG_PATH, JSON.stringify(registry, null, 2) + "\n");
console.log(`migrated: ${records.length} legacy records (${supported} supported / ${notFound} not_found) · kept ${kept.length} pre-existing records · total ${registry.records.length}`);
