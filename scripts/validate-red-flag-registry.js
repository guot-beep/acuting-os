#!/usr/bin/env node
/**
 * validate-red-flag-registry.js — the structured safety layer's measuring stick.
 *
 * Defect codes:
 *   RF1  id malformed (must be rf.<slug>) or duplicated
 *   RF2  entity_id does not resolve in condition canon or tdis registry
 *   RF3  trigger_zh or trigger_en missing (bilingual law — both, always)
 *   RF4  tier missing or not in the registry's own tier_vocabulary
 *   RF5  no usable evidence: every record needs ≥1 entry with an https
 *        source_url. A red flag without a source is an invented red flag —
 *        the one thing this layer exists to prevent.
 *   RF6  review_status not in the ladder
 *
 * All codes are HARD failures: this file starts empty, so there is no legacy
 * debt to ratchet — nothing defective ever gets in.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const registry = readJson("data/pathology/red_flag_registry.json");
const records = registry.records || [];
const tiers = new Set(Object.keys(registry.tier_vocabulary || {}));
const REVIEW = new Set(["draft", "source_checked", "clinically_reviewed"]);
const entityIds = new Set([
  ...(readJson("data/pathology/condition_canon_shortlist.json").records || []).map((r) => r.id),
  ...(readJson("data/pathology/tdis_registry.json").records || []).map((r) => r.id),
]);

const defects = [];
const seen = new Set();
for (const r of records) {
  const at = r.id || "(no id)";
  const add = (code, msg) => defects.push(`${code} ${at}: ${msg}`);

  if (!/^rf\.[a-z0-9_]+(\.[a-z0-9_]+)+$/.test(String(r.id || ""))) add("RF1", "id must match rf.<entity-slug>.<trigger-slug>");
  if (seen.has(r.id)) add("RF1", "duplicate id");
  seen.add(r.id);

  if (!entityIds.has(r.entity_id)) add("RF2", `entity_id "${r.entity_id}" not found in condition canon or tdis registry`);

  if (!String(r.trigger_zh || "").trim() || !String(r.trigger_en || "").trim()) add("RF3", "trigger_zh AND trigger_en are both required");

  if (!tiers.has(r.tier)) add("RF4", `tier "${r.tier}" not in tier_vocabulary (${[...tiers].join(" | ")})`);

  const evidence = Array.isArray(r.evidence) ? r.evidence : [];
  const usable = evidence.filter((e) => /^https:\/\//.test(String(e && e.source_url || "")));
  if (!usable.length) add("RF5", "no evidence entry with an https source_url — a red flag without a source does not get written");

  if (!REVIEW.has(r.review_status)) add("RF6", `review_status "${r.review_status}" not in draft|source_checked|clinically_reviewed`);
}

const covered = new Set(records.map((r) => r.entity_id));
console.log(`red_flag_registry: ${records.length} records · ${covered.size} entities covered · ${defects.length} defects`);
if (defects.length) {
  defects.forEach((d) => console.log("  " + d));
  process.exit(1);
}
