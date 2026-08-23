#!/usr/bin/env node
/**
 * apply-herb-en-backfill.js — 中藥卡英文欄回填(actions_en / condition_tags_en)。
 *
 * 來源帳本:docs/research_packs/HERB_EN_BACKFILL_2026-08-19.json。
 * 帳本規則:只做英文全空的記錄,en 是對應 _zh 的逐條忠實翻譯(同長同序,
 * Wiseman/Bensky 慣例),zh 一字不動;損毀 zh 整筆跳過在帳本 damaged 欄。
 *
 * 這裡再守一層:只寫目標欄為空的記錄;寫入前重驗 zh 快照與現檔一致、
 * en_proposed 長度 = zh 長度(紅線 5)。
 *
 * Dry-run by default; --apply to write;--offset/--limit 分批。
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const argOf = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? Number(process.argv[i + 1]) : d; };
const OFFSET = argOf("--offset", 0);
const LIMIT = argOf("--limit", Infinity);

const LEDGER_REL = "docs/research_packs/HERB_EN_BACKFILL_2026-08-19.json";
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, LEDGER_REL), "utf8"));
const hdoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/herb_canon_shortlist.json"), "utf8"));
const herbs = hdoc.records || Object.values(hdoc).find(Array.isArray);
const byId = new Map(herbs.map((h) => [h.id, h]));

const ZH_OF = { actions_en: "functions_zh", condition_tags_en: "condition_tags_zh" };

let applied = 0, skipped = [];
for (const prop of ledger.proposals.slice(OFFSET, OFFSET + LIMIT)) {
  const rec = byId.get(prop.herb_id);
  const zf = ZH_OF[prop.field];
  if (!rec || !zf) { skipped.push(`${prop.herb_id}/${prop.field} 查無或欄位未知`); continue; }
  if ((rec[prop.field] || []).length) { skipped.push(`${prop.herb_id}/${prop.field} 已有內容,不覆蓋`); continue; }
  const zhNow = rec[zf] || [];
  if (!zhNow.length || zhNow.length !== prop.zh.length || zhNow.some((s, i) => s !== prop.zh[i]) || prop.en_proposed.length !== zhNow.length) {
    skipped.push(`${prop.herb_id}/${prop.field} zh 快照不符或長度不合`);
    continue;
  }
  applied++;
  if (APPLY) {
    rec[prop.field] = prop.en_proposed;
    rec.field_sources = rec.field_sources || {};
    if (!rec.field_sources[prop.field]) {
      rec.field_sources[prop.field] = [`translated: 本卡 ${zf} 逐條忠實翻譯(帳本 ${LEDGER_REL},紅線5 同長同序)`];
    }
  } else if (applied <= 5) {
    console.log(`${prop.herb_id}  ${prop.field}  ${prop.zh.length} 條`);
  }
}
console.log(`\n本批 offset=${OFFSET}: 寫入 ${applied},跳過 ${skipped.length}`);
for (const s of skipped.slice(0, 8)) console.log("  SKIP", s);

if (APPLY) {
  fs.writeFileSync(path.join(ROOT, "data/herbs/herb_canon_shortlist.json"), JSON.stringify(hdoc, null, 2) + "\n", "utf8");
  console.log("WROTE data/herbs/herb_canon_shortlist.json");
} else {
  console.log("DRY RUN — 加 --apply 寫入。");
}
