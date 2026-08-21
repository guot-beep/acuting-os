#!/usr/bin/env node
/**
 * apply-pi-actions-alignment.js — 紅線 5 對齊:pattern_indications_en / actions_en。
 *
 * 來源帳本:docs/research_packs/PI_ACTIONS_ALIGN_PROPOSALS_2026-08-19.json(60 筆)。
 * 這條線跟 contraindications 不同:既有 en 大多是意譯,對齊提案把它們改成
 * 忠實翻譯並將原文移入 orphan_en——那是覆蓋既有內容,依憲法先問 Ting。
 * 所以這支只落三無提案(無 orphan_en、無 damaged_zh、note 無歸屬旗標),
 * 其餘 58 筆在 PI_ACTIONS_ALIGN_HELD_FOR_RULING.md 等裁決。
 *
 * 落庫前逐筆重驗 zh 快照與現檔一致。Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const LEDGER_REL = "docs/research_packs/PI_ACTIONS_ALIGN_PROPOSALS_2026-08-19.json";
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, LEDGER_REL), "utf8"));
const fdoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8"));
const formulas = fdoc.records || Object.values(fdoc).find(Array.isArray);
const byId = new Map(formulas.map((f) => [f.id, f]));

const FIELD = { pattern_indications: ["pattern_indications_zh", "pattern_indications_en"], actions: ["actions_zh", "actions_en"] };
const flagged = (x) => /ATTRIBUTION FLAG|SUSPECTED FAKE/i.test(x.note || "");
const clean = ledger.proposals.filter(
  (x) => !(x.orphan_en || []).length && !(x.damaged_zh || []).length && !flagged(x)
);

let applied = 0, skipped = [];
for (const prop of clean) {
  const [zf, ef] = FIELD[prop.field];
  const rec = byId.get(prop.id);
  if (!rec) { skipped.push(prop.id + " 查無"); continue; }
  const zhNow = rec[zf] || [];
  if (zhNow.length !== prop.zh.length || zhNow.some((s, i) => s !== prop.zh[i]) || prop.en_proposed.length !== zhNow.length) {
    skipped.push(`${prop.id}/${prop.field} zh 快照不符`);
    continue;
  }
  applied++;
  if (APPLY) {
    rec[ef] = prop.en_proposed;
    rec.field_sources = rec.field_sources || {};
    if (!rec.field_sources[ef]) {
      rec.field_sources[ef] = [`aligned: ${LEDGER_REL}(逐條忠實翻譯 _zh;紅線5 對齊)`];
    }
  } else {
    console.log(`${prop.id}  ${prop.field}  en ${(prop.en_current || []).length} → ${prop.en_proposed.length}`);
  }
}
console.log(`\n三無乾淨提案 ${clean.length}/${ledger.proposals.length},寫入 ${applied},跳過 ${skipped.join("; ") || 0}`);

if (APPLY) {
  fs.writeFileSync(path.join(ROOT, "data/herbs/formulas.json"), JSON.stringify(fdoc, null, 2) + "\n", "utf8");
  console.log("WROTE data/herbs/formulas.json");
} else {
  console.log("DRY RUN — 加 --apply 寫入。");
}
