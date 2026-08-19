#!/usr/bin/env node
/**
 * apply-formula-songs.js — 方歌(§1.1,Ting 2026-07-30 定案規格)落庫。
 *
 * 來源帳本:docs/research_packs/FORMULA_SONG_PROPOSALS_2026-08-19.json
 * (48 首:zhongyifangji 繁體頁方歌欄 36、jicheng.tw 公版古籍 12;
 * 每首帶來源 URL 與頁面原句,原始 HTML 存於產出 scratchpad 供覆核;
 * 模型記憶零筆)。
 *
 * §1.1 規則落實:
 * - 逐字照抄、原標點,\n 斷行(帳本已按頁面標點斷)。
 * - formula_song_source_zh 只在古籍書名可考時寫(12 首);
 *   zhongyifangji 不標歌作者 → 該欄不建(規則 1:沒有就不要建欄位)。
 * - 只填空,不覆蓋既有方歌。
 * - 金鎖固精丸:站方繁體頁該欄漏轉,歌是簡體——簡體不進 _zh,
 *   HOLD 待 Ting 裁(轉繁要逐字校,不機械轉)。
 *
 * Dry-run by default; --apply to write。
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const HOLD = new Set(["formula.jin_suo_gu_jing_wan"]);

const LEDGER_REL = "docs/research_packs/FORMULA_SONG_PROPOSALS_2026-08-19.json";
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, LEDGER_REL), "utf8"));
const fdoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8"));
const formulas = fdoc.records || Object.values(fdoc).find(Array.isArray);
const byId = new Map(formulas.map((f) => [f.id, f]));

let applied = 0, withSource = 0, skipped = [];
for (const prop of ledger.proposals) {
  if (HOLD.has(prop.formula_id)) { skipped.push(prop.formula_id + " (簡體殘留,待裁)"); continue; }
  const rec = byId.get(prop.formula_id);
  if (!rec) { skipped.push(prop.formula_id + " 查無"); continue; }
  if (rec.formula_song_zh) { skipped.push(prop.formula_id + " 已有方歌,不覆蓋"); continue; }
  applied++;
  if (APPLY) {
    rec.formula_song_zh = prop.formula_song_zh;
    if (prop.formula_song_source_zh) {
      rec.formula_song_source_zh = prop.formula_song_source_zh;
      withSource++;
    }
    rec.field_sources = rec.field_sources || {};
    if (!rec.field_sources.formula_song_zh) {
      rec.field_sources.formula_song_zh = [prop.source_url];
    }
  } else {
    console.log(`${prop.formula_id}  ${prop.formula_song_zh.split("\n")[0]}…${prop.formula_song_source_zh ? "  [" + prop.formula_song_source_zh + "]" : ""}`);
  }
}
console.log(`\n寫入 ${applied} 首(其中具書名出處 ${withSource}),跳過 ${skipped.length}`);
for (const s of skipped) console.log("  SKIP", s);

if (APPLY) {
  fs.writeFileSync(path.join(ROOT, "data/herbs/formulas.json"), JSON.stringify(fdoc, null, 2) + "\n", "utf8");
  console.log("WROTE data/herbs/formulas.json");
} else {
  console.log("DRY RUN — 加 --apply 寫入。");
}
