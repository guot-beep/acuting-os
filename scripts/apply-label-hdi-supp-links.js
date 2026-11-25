#!/usr/bin/env node
/**
 * apply-label-hdi-supp-links.js — 把標籤點名、但知識庫只有補充劑卡的植物,連到那張 supp.* 卡(D38 第 0 期 ④)。
 *
 * 藥卡 herb_drug_interactions_graded 有 12 列的 `with` 是空的:標籤點名的植物不是中藥卡。
 * 其中 4 種(聖約翰草、大蒜、紫錐花、輔酶 Q10)知識庫有補充劑卡 → 機械式補上 `with`。
 * 只填空的 `with`(additive);名稱要完全對上下面的表才填,不做模糊比對;不改任何其他欄位。
 * 冪等:跑第二次 0 筆。
 *
 * 用法:node scripts/apply-label-hdi-supp-links.js [--dry-run]
 */
"use strict";
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "pharmacology", "drugs.json");
const RULES = [
  [/^st\.?\s*john['’]s\s+wort\b/i, "supp.st_johns_wort"],
  [/^garlic$/i, "supp.garlic"],
  [/^echinacea$/i, "supp.echinacea"],
  [/^co-?enzyme\s+q10$/i, "supp.coq10"],
];

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const records = Array.isArray(data) ? data : data.records;
if (!Array.isArray(records) || !records.length) { console.error("FAIL: drugs.json 讀到 0 筆藥卡"); process.exit(1); }

let changed = 0, skippedNoRule = 0;
for (const d of records) {
  for (const row of Array.isArray(d.herb_drug_interactions_graded) ? d.herb_drug_interactions_graded : []) {
    if (row.with) continue;
    const label = String(row.with_label_en || "").trim();
    const rule = RULES.find(([re]) => re.test(label));
    if (!rule) { skippedNoRule++; continue; }
    row.with = rule[1];
    changed++;
    console.log(`  ${d.id} × "${label}" → ${rule[1]}`);
  }
}
console.log(`linked ${changed} rows; ${skippedNoRule} rows still without a card (left empty)`);
if (changed && !process.argv.includes("--dry-run")) {
  const indent = (raw.match(/\n( +)"/) || [, "  "])[1];
  fs.writeFileSync(FILE, JSON.stringify(data, null, indent.length) + (raw.endsWith("\n") ? "\n" : ""));
}
