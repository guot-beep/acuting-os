#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function argValue(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const input = argValue("--input", "data/pathology/condition_canon_shortlist.json");
const outDir = argValue("--out-dir", "tmp/cr010");
const expectedBaseline = Number(argValue("--expected-baseline", "209"));

function loadRecords(p) {
  const raw = JSON.parse(fs.readFileSync(p, "utf8"));
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.records)) return raw.records;
  throw new Error(`Unsupported condition file shape: ${p}`);
}

function nonEmpty(v) {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return true;
}

function bilingual(r, zh, en) {
  return nonEmpty(r[zh]) && nonEmpty(r[en]);
}

const criteria = [
  ["summary", "summary_zh", "summary_en", 1, false],
  ["western_context", "western_context_zh", "western_context_en", 1, false],
  ["western_pathology", "western_pathology_zh", "western_pathology_en", 1, false],
  ["etiology", "etiology_zh", "etiology_en", 1, false],
  ["risk_factors", "risk_factors_zh", "risk_factors_en", 1, false],
  ["red_flags", "red_flags_zh", "red_flags_en", 2, true],
  ["acupuncture_scope", "acupuncture_scope_zh", "acupuncture_scope_en", 2, true],
];

const relationFields = [
  "related_patterns", "related_eastern_diseases", "sign_symptom_ids",
  "herb_formulas", "acupoint_protocols", "medication_links", "workflow_links"
];

function scoreRecord(r) {
  let score = 0;
  const present = {};
  const missing = [];
  const bilingualMismatch = [];

  for (const [key, zh, en, points, hard] of criteria) {
    const zhOk = nonEmpty(r[zh]), enOk = nonEmpty(r[en]);
    const ok = zhOk && enOk;
    present[key] = ok;
    if (ok) score += points;
    else {
      missing.push(key);
      if (zhOk !== enOk) bilingualMismatch.push({key, zh_field: zh, en_field: en, zh_present: zhOk, en_present: enOk});
    }
  }

  const sources = nonEmpty(r.sources);
  const fieldSources = nonEmpty(r.field_sources);
  if (sources) score += 1; else missing.push("sources");
  if (fieldSources) score += 1; else missing.push("field_sources");

  const relations = relationFields.some(f => nonEmpty(r[f]));
  if (relations) score += 1; else missing.push("structured_relations");

  const hardGates = {
    red_flags: present.red_flags,
    acupuncture_scope: present.acupuncture_scope,
    sources,
    field_sources: fieldSources
  };
  const allHard = Object.values(hardGates).every(Boolean);

  let maturity;
  if (score >= 10 && allHard) maturity = "FULL_DETAIL_CANDIDATE";
  else if (score <= 3) maturity = "SKELETON";
  else maturity = "DETAIL_PARTIAL";

  return {
    id: r.id,
    name_en: r.name_en || "",
    name_zh: r.name_zh || "",
    category: r.category || "",
    domain: r.domain || [],
    review_status: r.review_status || "",
    score,
    maturity,
    hard_gates: hardGates,
    present,
    missing,
    bilingual_mismatch: bilingualMismatch,
    relation_counts: Object.fromEntries(relationFields.map(f => [f, Array.isArray(r[f]) ? r[f].length : (nonEmpty(r[f]) ? 1 : 0)]))
  };
}

const records = loadRecords(input);
const audited = records.map(scoreRecord);

const groups = audited.reduce((acc, r) => {
  (acc[r.maturity] ||= []).push(r);
  return acc;
}, {});

for (const k of Object.keys(groups)) {
  groups[k].sort((a,b) => a.score - b.score || String(a.id).localeCompare(String(b.id)));
}

const full = groups.FULL_DETAIL_CANDIDATE?.length || 0;
const partial = groups.DETAIL_PARTIAL?.length || 0;
const skeleton = groups.SKELETON?.length || 0;

const summary = {
  generated_at: new Date().toISOString(),
  input,
  live_condition_count: records.length,
  expected_baseline_reference_only: expectedBaseline,
  baseline_changed: records.length !== expectedBaseline,
  full_detail_count: full,
  partial_count: partial,
  skeleton_count: skeleton,
  remaining_detail_slots_to_300: Math.max(0, 300 - full),
  minimum_future_identity_slots_if_all_current_selected: Math.max(0, 300 - records.length),
  note: "Counts are live at execution time. Baseline mismatch is informational, not failure."
};

fs.mkdirSync(outDir, {recursive:true});
const jsonOut = path.join(outDir, "cr010_condition_detail_maturity_live.json");
fs.writeFileSync(jsonOut, JSON.stringify({status:"AUDIT_ONLY_NOT_CANONICAL", summary, records:audited}, null, 2));

const queue = audited
  .filter(r => r.maturity !== "FULL_DETAIL_CANDIDATE")
  .sort((a,b) => {
    // safer/high-value gaps first: missing safety/provenance, then lower score
    const aRisk = (!a.hard_gates.red_flags ? 4:0) + (!a.hard_gates.acupuncture_scope ? 3:0) + (!a.hard_gates.sources ? 2:0) + (!a.hard_gates.field_sources ? 2:0);
    const bRisk = (!b.hard_gates.red_flags ? 4:0) + (!b.hard_gates.acupuncture_scope ? 3:0) + (!b.hard_gates.sources ? 2:0) + (!b.hard_gates.field_sources ? 2:0);
    return bRisk - aRisk || a.score - b.score || String(a.id).localeCompare(String(b.id));
  });

fs.writeFileSync(path.join(outDir, "cr010_common300_detail_queue_live.json"),
  JSON.stringify({status:"PRODUCTION_QUEUE_CANDIDATE_NOT_COMMON300_SELECTION", summary, records:queue}, null, 2));

const lines = [];
lines.push("# CR-010 Condition Detail Maturity — LIVE");
lines.push("");
lines.push("**AUDIT ONLY / NOT CANONICAL**");
lines.push("");
lines.push(`- live condition count: **${records.length}**`);
lines.push(`- FULL_DETAIL_CANDIDATE: **${full}**`);
lines.push(`- DETAIL_PARTIAL: **${partial}**`);
lines.push(`- SKELETON: **${skeleton}**`);
lines.push(`- remaining detail slots to Common 300: **${Math.max(0,300-full)}**`);
lines.push(`- minimum future identity slots if every current card were selected: **${Math.max(0,300-records.length)}**`);
lines.push(`- baseline ${expectedBaseline} changed: **${records.length !== expectedBaseline ? "YES" : "NO"}**`);
lines.push("");
lines.push("## Important");
lines.push("This maturity heuristic is not the Common-300 ranking. Clinical commonness, board weight and safety importance must still select which conditions receive detail first.");
lines.push("");
lines.push("## Non-full cards");
lines.push("");
lines.push("| ID | English | Score | Maturity | Missing |");
lines.push("|---|---|---:|---|---|");
for (const r of queue) {
  lines.push(`| \`${r.id}\` | ${String(r.name_en).replace(/\|/g,"/")} | ${r.score}/12 | ${r.maturity} | ${r.missing.join(", ")} |`);
}
fs.writeFileSync(path.join(outDir, "CR010_CONDITION_DETAIL_MATURITY_LIVE.md"), lines.join("\n"));

console.log(JSON.stringify(summary, null, 2));
console.log(`Wrote ${jsonOut}`);
console.log(`Wrote ${path.join(outDir, "cr010_common300_detail_queue_live.json")}`);
console.log(`Wrote ${path.join(outDir, "CR010_CONDITION_DETAIL_MATURITY_LIVE.md")}`);
