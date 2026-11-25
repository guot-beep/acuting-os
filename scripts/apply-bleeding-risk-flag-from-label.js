#!/usr/bin/env node
/**
 * apply-bleeding-risk-flag-from-label.js — 抗凝 / 抗血小板藥卡補 `bleeding_risk` 整合旗標(D38 第 0 期)。
 *
 * 發現(2026-11-25):華法林有 bleeding_risk,但 apixaban、rivaroxaban、dabigatran、ticagrelor、prasugrel、
 * aspirin、enoxaparin、heparin 這幾張**最主要的抗凝 / 抗血小板藥卡連 integrative_clinical_flags 欄位都沒有**
 * —— 交互檢查 B 層與診前單「用藥有出血風險」對它們永遠不會亮,畫面看起來像「查過沒事」。
 *
 * 規則(機械式,不靠判斷):
 *   1. 藥類是抗凝 / 抗血小板(下面的 CLASSES),而且
 *   2. 這張卡**自己的、有 DailyMed 來源的欄位**裡有寫 bleeding / hemorrhage。
 * 兩條都成立才加,而且把那幾個欄位的來源記到 field_sources.integrative_clinical_flags(出處跟著旗標走)。
 * 只加不改:已有 bleeding_risk 的不動;已有其他旗標的保留原陣列、只在後面加。冪等。
 *
 * 用法:node scripts/apply-bleeding-risk-flag-from-label.js [--dry-run]
 */
"use strict";
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "pharmacology", "drugs.json");
const CLASSES = new Set([
  "drugclass.factor_xa_inhibitors", "drugclass.direct_thrombin_inhibitors", "drugclass.p2y12_inhibitors",
  "drugclass.cox_antiplatelet", "drugclass.heparins", "drugclass.vitamin_k_antagonists",
]);
const FIELDS = ["boxed_warning_en", "contraindications_en", "warnings_en", "serious_adverse_effects_en", "adverse_effects_en"];
const BLEED = /bleed|hemorrhag|haemorrhag/i;

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const records = Array.isArray(data) ? data : data.records;
if (!Array.isArray(records) || !records.length) { console.error("FAIL: drugs.json 讀到 0 筆"); process.exit(1); }

let changed = 0, inClass = 0;
for (const d of records) {
  if (!CLASSES.has(d.drugclass_id)) continue;
  inClass++;
  const flags = Array.isArray(d.integrative_clinical_flags) ? d.integrative_clinical_flags : null;
  if (flags && flags.includes("bleeding_risk")) continue;
  const fs_ = d.field_sources || {};
  const hits = FIELDS.filter((f) => BLEED.test(JSON.stringify(d[f] || "")) && Array.isArray(fs_[f]) && fs_[f].some((s) => /^dailymed:/.test(s)));
  if (!hits.length) { console.log(`  skip ${d.id}: 卡上沒有有來源的出血文字`); continue; }
  d.integrative_clinical_flags = flags ? [...flags, "bleeding_risk"] : ["bleeding_risk"];
  d.field_sources = d.field_sources || {};
  if (!d.field_sources.integrative_clinical_flags) {
    d.field_sources.integrative_clinical_flags = [...new Set(hits.flatMap((f) => fs_[f]).filter((s) => /^dailymed:/.test(s)))];
  }
  changed++;
  console.log(`  ${d.id}: + bleeding_risk  (依據 ${hits.join(", ")})`);
}
if (!inClass) { console.error("FAIL: 0 張卡在抗凝 / 抗血小板藥類 —— 藥類 id 可能改了"); process.exit(1); }
console.log(`${changed} cards flagged; ${inClass} cards in anticoagulant/antiplatelet classes`);
if (changed && !process.argv.includes("--dry-run")) {
  const indent = (raw.match(/\n( +)"/) || [, "  "])[1];
  fs.writeFileSync(FILE, JSON.stringify(data, null, indent.length) + (raw.endsWith("\n") ? "\n" : ""));
}
