#!/usr/bin/env node
/**
 * apply-tongue-pulse-backfill.js — 補舌脈(卡片區塊 7 辨證要點必填)。
 *
 * 來源帳本:docs/research_packs/TONGUE_PULSE_BACKFILL_2026-08-19.json
 * (curriculum 卡片辨證要點節 / Summary Chart 的 T:/P: 行,逐字引文;
 * Summary Chart 欄位會錯位,帳本產出時逐筆確認歸屬,拿不準的整筆放棄)。
 *
 * 只寫 tongue_zh 與 pulse_zh 皆空的方;en 欄只在帳本有原文時寫。
 *
 * Dry-run by default; --apply to write。
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const LEDGER_REL = "docs/research_packs/TONGUE_PULSE_BACKFILL_2026-08-19.json";
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, LEDGER_REL), "utf8"));
const fdoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8"));
const formulas = fdoc.records || Object.values(fdoc).find(Array.isArray);
const byId = new Map(formulas.map((f) => [f.id, f]));

let applied = 0, skipped = [];
for (const prop of ledger.proposals) {
  const rec = byId.get(prop.formula_id);
  if (!rec) { skipped.push(prop.formula_id + " 查無"); continue; }
  const hasTongue = rec.tongue_zh && String(rec.tongue_zh).trim();
  const hasPulse = rec.pulse_zh && String(rec.pulse_zh).trim();
  if (hasTongue || hasPulse) { skipped.push(prop.formula_id + " 已有舌脈,不覆蓋"); continue; }
  if (!prop.tongue_zh && !prop.pulse_zh) { skipped.push(prop.formula_id + " 提案空"); continue; }
  applied++;
  if (APPLY) {
    if (prop.tongue_zh) rec.tongue_zh = prop.tongue_zh;
    if (prop.pulse_zh) rec.pulse_zh = prop.pulse_zh;
    // 庫內慣例:苔在獨立欄 coating_zh(舌質與苔不混寫);同樣只填空
    if (prop.coating_zh && !(rec.coating_zh && String(rec.coating_zh).trim())) rec.coating_zh = prop.coating_zh;
    if (prop.tongue_en && !rec.tongue_en) rec.tongue_en = prop.tongue_en;
    if (prop.pulse_en && !rec.pulse_en) rec.pulse_en = prop.pulse_en;
    rec.field_sources = rec.field_sources || {};
    const src = `${prop.evidence_file}(「${String(prop.evidence_quote).slice(0, 80)}」;帳本 ${LEDGER_REL})`;
    if (!rec.field_sources.tongue_zh && prop.tongue_zh) rec.field_sources.tongue_zh = [src];
    if (!rec.field_sources.pulse_zh && prop.pulse_zh) rec.field_sources.pulse_zh = [src];
  } else {
    console.log(`${prop.formula_id}  舌:${prop.tongue_zh || "-"}  脈:${prop.pulse_zh || "-"}`);
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
