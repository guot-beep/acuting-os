#!/usr/bin/env node
/**
 * repair-mojibake-pathology.js — one-off guarded repair for the 9 destroyed
 * name_zh strings duplicated across data/pathology/conditions.json and
 * data/pathology/condition_graph_expansion.json (legacy Windows-encoding
 * damage; originals unrecoverable per the B1 triage: git-recoverable=0).
 *
 * Replacement table + approval flow: docs/CONDITIONS_INTEROP_DESIGN.md §6.1.
 * GATE: do NOT run --apply until Ting approves that table.
 *
 * Guard: a name_zh is replaced ONLY if its current value is pure mojibake
 * (no CJK, only "?" runs). Healthy fields are never touched. IDs and
 * name_en are never changed.
 *
 *   node scripts/repair-mojibake-pathology.js          # dry run
 *   node scripts/repair-mojibake-pathology.js --apply
 */

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const STAMP = "name_zh_reauthored_2026-07-12_pending_ting_review";

// id → approved replacement name_zh (docs/CONDITIONS_INTEROP_DESIGN.md §6.1)
const REPAIRS = {
  "western_condition.insulin_resistance": "胰島素阻抗背景",
  "western_condition.male_factor_context": "男性因素不孕背景",
  "western_condition.ovulatory_factor_context": "排卵因素不孕背景",
  "western_condition.ivf_cycle": "試管嬰兒療程背景",
  "western_condition.embryo_transfer": "胚胎植入背景",
  "western_condition.luteal_support": "黃體期支持背景",
  "pattern.damp_heat": "濕熱",
  "pattern.yin_deficiency": "陰虛",
  "pattern.blood_deficiency": "血虛"
};

function isMojibake(value) {
  const s = String(value || "");
  if (!s.trim()) return false;
  return !/[一-鿿]/.test(s) && /^\?+$/.test(s.trim());
}

let replaced = 0;
const skipped = [];

function repairList(list, fileLabel) {
  for (const rec of list || []) {
    const wanted = REPAIRS[rec.id];
    if (!wanted) continue;
    if (!isMojibake(rec.name_zh)) {
      skipped.push(`${fileLabel} ${rec.id} (name_zh not mojibake — untouched: "${rec.name_zh}")`);
      continue;
    }
    console.log(`${APPLY ? "repaired" : "would repair"} ${fileLabel} ${rec.id}: "${rec.name_zh}" -> "${wanted}"`);
    if (APPLY) {
      rec.name_zh = wanted;
      rec.mojibake_repair = STAMP;
    }
    replaced += 1;
  }
}

const FILES = [
  {
    rel: "data/pathology/conditions.json",
    lists: (db) => [db.records, db.tcm_patterns, db.eastern_diseases]
  },
  {
    rel: "data/pathology/condition_graph_expansion.json",
    lists: (db) => [db.western_conditions, db.tcm_patterns, db.eastern_diseases]
  }
];

for (const { rel, lists } of FILES) {
  const file = path.join(ROOT, rel);
  const db = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const list of lists(db)) repairList(list, rel);
  if (APPLY) fs.writeFileSync(file, JSON.stringify(db, null, 2) + "\n");
}

console.log(`\nTotal: ${replaced} strings across ${FILES.length} files. Skipped: ${skipped.length}`);
skipped.forEach((s) => console.log("  " + s));
if (APPLY) console.log("Written. Rebuild generated data: node scripts/build-data.js");
else console.log("Dry run. GATE: get Ting's approval of the table, then --apply.");
