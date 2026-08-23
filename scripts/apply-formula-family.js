#!/usr/bin/env node
/**
 * apply-formula-family.js — 方劑家族(formula_family,§6 新結構、卡片區塊 10)落庫。
 *
 * 來源帳本:docs/research_packs/FORMULA_FAMILY_PROPOSALS_2026-08-19.json
 * (方剂学汇总 640 表全掃,32 基礎方 75 條;產出時已機器審計:
 * relation/change/name_zh 形狀合規、change 內每個劑量數字逐字存在於
 * 該表 evidence_quote 原句——來源無劑量就不寫,紅線 4)。
 *
 * 只填 formula_family 為空/缺的方;既有的一條不動(桂枝湯等 7 方
 * 帳本產出時就跳過了,這裡再守一層)。
 * entry.formula_id 只在帳本已對上庫內方時存在,不另行猜配。
 *
 * Dry-run by default; --apply to write。
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const LEDGER_REL = "docs/research_packs/FORMULA_FAMILY_PROPOSALS_2026-08-19.json";
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, LEDGER_REL), "utf8"));
const fdoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8"));
const formulas = fdoc.records || Object.values(fdoc).find(Array.isArray);
const byId = new Map(formulas.map((f) => [f.id, f]));

let applied = 0, entries = 0, skipped = [];
for (const prop of ledger.family_proposals) {
  const rec = byId.get(prop.base_formula_id);
  if (!rec) { skipped.push(prop.base_formula_id + " 查無"); continue; }
  if ((rec.formula_family || []).length) { skipped.push(prop.base_formula_id + " 已有家族,不覆蓋"); continue; }
  for (const e of prop.entries) {
    if (e.relation === "合") e.relation = "合方"; // F11 詞彙表:合 不是合法值
    if (!e.relation || !e.name_zh || !(e.change || []).length) {
      skipped.push(`${prop.base_formula_id} entry 形狀不合(F11):${e.name_zh || "?"}`);
      continue;
    }
  }
  applied++;
  entries += prop.entries.length;
  if (APPLY) {
    rec.formula_family = prop.entries;
    rec.field_sources = rec.field_sources || {};
    if (!rec.field_sources.formula_family) {
      rec.field_sources.formula_family = [
        `${prop.evidence_file}(${String(prop.evidence || "").slice(0, 60)};帳本 ${LEDGER_REL},劑量逐字審計)`,
      ];
    }
  } else {
    console.log(`${prop.base_formula_id}  +${prop.entries.length} 條  (${prop.entries.map((e) => e.relation + e.name_zh).join("、")})`);
  }
}
console.log(`\n寫入基礎方 ${applied},衍生條目 ${entries},跳過 ${skipped.length}`);
for (const s of skipped) console.log("  SKIP", s);

if (APPLY) {
  fs.writeFileSync(path.join(ROOT, "data/herbs/formulas.json"), JSON.stringify(fdoc, null, 2) + "\n", "utf8");
  console.log("WROTE data/herbs/formulas.json");
} else {
  console.log("DRY RUN — 加 --apply 寫入。");
}
