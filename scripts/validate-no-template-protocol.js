#!/usr/bin/env node
/**
 * validate-no-template-protocol.js — 樣板處方不准回來
 *
 * 2026-08-12:67 張條件卡的 acupoint_protocols **逐字相同**
 *   足三里 (ST36) | 合谷 (LI4) | 三陰交 (SP6) | 中脘 (CV12)
 * 一個字串,67 張卡。那是匯入預設值,不是 67 次臨床判斷 —— 讀的人會學到
 * 月經過多、閉經、骨盆腔發炎、經前不悅症共用同一組穴。已搬進 import_artifacts。
 *
 * 這支守著它不要再長回來。**逐字比對**,理由是實測出來的:同一批資料裡,
 * GERD(中脘・內關・足三里・太衝・陽陵泉)、貝爾氏麻痺(地倉・頰車・陽白・
 * 四白・合谷・太衝)、腸躁症、過敏性鼻炎這些**確實是逐病策展過的**,而且都含
 * 樣板裡的穴。用「含這幾個穴就報」會把真處方一起殺掉;用逐字比對剛好只抓到樣板。
 *
 * BLOCKING:目前計數是 0,沒有歷史積欠要照顧,所以再出現一張就該當場紅。
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "pathology", "condition_canon_shortlist.json");
const TEMPLATE = ["足三里 (ST36)", "合谷 (LI4)", "三陰交 (SP6)", "中脘 (CV12)"];

const d = JSON.parse(fs.readFileSync(FILE, "utf8").replace(/^﻿/, ""));
const recs = d.records || d;

const isTemplate = (a) =>
  Array.isArray(a) && a.length === TEMPLATE.length &&
  a.every((v, i) => typeof v === "string" && v.trim() === TEMPLATE[i]);

const hits = recs.filter((r) => isTemplate(r.acupoint_protocols)).map((r) => r.id);

console.log("template protocol guard\n");
console.log(`  條件卡           ${recs.length}`);
console.log(`  仍為共用樣板     ${hits.length}`);
if (hits.length) {
  console.log(`\n⛔ 這些卡的處方是匯入預設值,不是本病的處方:`);
  hits.slice(0, 20).forEach((id) => console.log(`     ${id}`));
  if (hits.length > 20) console.log(`     …另外 ${hits.length - 20} 張`);
  console.log(`\n  處置:搬進 import_artifacts(欄位 acupoint_protocols)並清空,`);
  console.log(`  不要用模型知識代寫替代處方 —— 逐病重建需要逐病來源。`);
}
console.log(hits.length ? `\nFAIL — ${hits.length} blocking defects.` : "\nPASS — no blocking defects.");
process.exit(hits.length ? 1 : 0);
