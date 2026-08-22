#!/usr/bin/env node
/**
 * apply-contraindications-backfill.js — 補 35 方全空的禁忌(卡片區塊 14 必填)。
 *
 * 來源帳本:docs/research_packs/CONTRAINDICATIONS_BACKFILL_2026-08-19.json
 * (白名單站【使用注意】/curriculum 卡片 §14,逐字照抄原句;英文來源
 * 帶原文引文,zh 為忠實中譯並標 translated_from_en)。
 *
 * 只寫 contraindications_zh 為空的方;帶 conflict 的跳過留裁決;
 * 語氣強度(禁用/慎用)照來源,不升不降(紅線 4 精神)。
 *
 * Dry-run by default; --apply to write。
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const LEDGER_REL = "docs/research_packs/CONTRAINDICATIONS_BACKFILL_2026-08-19.json";
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, LEDGER_REL), "utf8"));
const fdoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8"));
const formulas = fdoc.records || Object.values(fdoc).find(Array.isArray);
const byId = new Map(formulas.map((f) => [f.id, f]));

let applied = 0, skipped = [];
for (const prop of ledger.proposals) {
  const rec = byId.get(prop.formula_id);
  if (!rec) { skipped.push(prop.formula_id + " 查無"); continue; }
  if (prop.conflict) { skipped.push(prop.formula_id + " conflict 留裁決"); continue; }
  if ((rec.contraindications_zh || []).length) { skipped.push(prop.formula_id + " 已有禁忌,不覆蓋"); continue; }
  if (!(prop.contraindications_zh || []).length) { skipped.push(prop.formula_id + " 提案空"); continue; }
  applied++;
  if (APPLY) {
    rec.contraindications_zh = prop.contraindications_zh;
    rec.field_sources = rec.field_sources || {};
    if (!rec.field_sources.contraindications_zh) {
      rec.field_sources.contraindications_zh = [
        `${prop.source_url || prop.evidence_file}(「${String(prop.evidence_quote).slice(0, 80)}」${prop.translated_from_en ? ";原文英文,zh 為忠實中譯" : ""};帳本 ${LEDGER_REL})`,
      ];
    }
  } else {
    console.log(`${prop.formula_id}  ${prop.contraindications_zh.length} 條  ← ${prop.source_url || prop.evidence_file}`);
  }
}
console.log(`\n寫入 ${applied},跳過 ${skipped.length}`);
for (const s of skipped) console.log("  SKIP", s);

if (APPLY) {
  fs.writeFileSync(path.join(ROOT, "data/herbs/formulas.json"), JSON.stringify(fdoc, null, 2) + "\n", "utf8");
  console.log("WROTE data/herbs/formulas.json");
} else {
  console.log("DRY RUN — 加 --apply 寫入。");
}
