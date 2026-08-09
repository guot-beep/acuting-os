#!/usr/bin/env node
/**
 * wire-gyn-red-flag-refs.js — Batch 4 GYN canonical wiring (2026-08-08).
 *
 * Reference-first + compatibility mirror: each of the 25 gyn cards gains
 * red_flag_refs — the ordered rf.<cond>.legacyNN ids — while red_flags_zh/_en
 * stay untouched as the backwards-compatible mirror. The registry owns
 * identity/provenance/lifecycle from here on; validate-red-flag-wiring.js
 * enforces that the two representations never drift.
 *
 * Deterministic, idempotent (rerun is byte-identical), local-only. Every
 * preflight below is a hard stop — this script never "fixes" data.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const exp = readJson("data/imports/official/gyn_existing_red_flags_export.json");
const registry = readJson("data/pathology/red_flag_registry.json");
const CANON = path.join(ROOT, "data/pathology/condition_canon_shortlist.json");
const canon = JSON.parse(fs.readFileSync(CANON, "utf8"));

const fail = (msg) => { console.error("PREFLIGHT FAIL: " + msg); process.exit(1); };
const legacy = registry.records.filter((r) => /^rf\.[a-z0-9_]+\.legacy\d+$/.test(r.id));
const regByCond = new Map();
for (const r of legacy) { if (!regByCond.has(r.entity_id)) regByCond.set(r.entity_id, []); regByCond.get(r.entity_id).push(r); }

// -- Preflight 1-10 ----------------------------------------------------------
if (exp.records.length !== 25) fail(`export conditions = ${exp.records.length}, expected 25`);
const expFlags = exp.records.reduce((n, r) => n + r.red_flags_zh.length, 0);
if (expFlags !== 96) fail(`export flags = ${expFlags}, expected 96`);
if (legacy.length !== 96) fail(`registry legacy ids = ${legacy.length}, expected 96`);
const sup = legacy.filter((r) => r.provenance_status === "supported").length;
if (sup !== 83) fail(`supported = ${sup}, expected 83`);
if (legacy.length - sup !== 13) fail(`not_found = ${legacy.length - sup}, expected 13`);

for (const card of exp.records) {
  const slug = card.condition_id.replace(/^cond\./, "");
  const recs = (regByCond.get(card.condition_id) || []).slice()
    .sort((a, b) => a.id.localeCompare(b.id));
  if (recs.length !== card.red_flags_zh.length) fail(`${card.condition_id}: registry count ${recs.length} != export ${card.red_flags_zh.length}`);
  recs.forEach((r, i) => {
    const wanted = `rf.${slug}.legacy${String(i + 1).padStart(2, "0")}`;
    if (r.id !== wanted) fail(`${card.condition_id}: ordinal gap — position ${i} is ${r.id}, expected ${wanted}`);
    if (r.trigger_zh !== card.red_flags_zh[i]) fail(`${r.id}: registry zh != export zh`);
    if (r.trigger_en !== (card.red_flags_en[i] || "")) fail(`${r.id}: registry en != export en`);
  });
  const cRec = canon.records.find((c) => c.id === card.condition_id);
  if (!cRec) fail(`canon missing ${card.condition_id}`);
  const zhSame = JSON.stringify(cRec.red_flags_zh || []) === JSON.stringify(card.red_flags_zh);
  const enSame = JSON.stringify(cRec.red_flags_en || []) === JSON.stringify(card.red_flags_en);
  if (!zhSame || !enSame) fail(`${card.condition_id}: canonical legacy arrays drifted from the frozen export — resolve BEFORE wiring, never auto-fix`);
}

// -- Wire --------------------------------------------------------------------
let wired = 0, refs = 0;
for (const card of exp.records) {
  const slug = card.condition_id.replace(/^cond\./, "");
  const cRec = canon.records.find((c) => c.id === card.condition_id);
  cRec.red_flag_refs = card.red_flags_zh.map((_, i) => `rf.${slug}.legacy${String(i + 1).padStart(2, "0")}`);
  wired += 1; refs += cRec.red_flag_refs.length;
}
fs.writeFileSync(CANON, JSON.stringify(canon, null, 2) + "\n");
console.log(`wired ${wired} cards · ${refs} refs · preflight 10/10 passed`);
