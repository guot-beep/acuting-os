#!/usr/bin/env node
/**
 * apply-source-classic.js — 方劑卡標頭出典(source_classic,§1 區塊 1 必填)落庫。
 *
 * 來源帳本:docs/research_packs/SOURCE_CLASSIC_PROPOSALS_2026-08-19.json。
 * 每筆帶 curriculum 檔路徑 + 原句引文(課件拼音書名原文保留在引文裡,
 * 中文書名是拼音對照轉寫,不在對照表內的一律沒收進帳本)。
 * curriculum 查無的 63 方誠實留空,不用模型記憶補——「查不到」是答案。
 *
 * 只落 conflict 為空的提案;帶 conflict 的(人參養榮湯書名異文、
 * 敗毒散疑似重複記錄)留給 Ting 裁定。
 * 只寫空的 source_classic,絕不覆蓋既有值(紅線 3)。
 *
 * Dry-run by default; --apply to write。
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const LEDGER_REL = "docs/research_packs/SOURCE_CLASSIC_PROPOSALS_2026-08-19.json";
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, LEDGER_REL), "utf8"));
const fdoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8"));
const formulas = fdoc.records || Object.values(fdoc).find(Array.isArray);
const byId = new Map(formulas.map((f) => [f.id, f]));

/* 課件記載本身存疑的,不落庫、進裁決清單(歸屬錯誤比語言錯誤嚴重:
   一筆流暢的錯出典讀起來像審過的)。
   - fu_ling_wan:卡片組成是指迷茯苓丸(茯苓枳殼半夏芒硝),傳統出典
     《是齋百一選方》系;課件寫 Jin Gui Yao Lue 疑與桂枝茯苓丸混淆。
   - chai_hu_gui_zhi_tang:課件寫金匱要略,通行本出於傷寒論 146 條。 */
const SUSPECT = new Set(["formula.fu_ling_wan", "formula.chai_hu_gui_zhi_tang"]);

let applied = 0, skipped = [];
for (const prop of ledger.proposals) {
  if (SUSPECT.has(prop.formula_id)) { skipped.push(`${prop.formula_id} (課件記載存疑,留裁決)`); continue; }
  if (prop.conflict) { skipped.push(`${prop.formula_id} (conflict: ${String(prop.conflict).slice(0, 50)})`); continue; }
  const rec = byId.get(prop.formula_id);
  if (!rec) { skipped.push(`${prop.formula_id} (查無記錄)`); continue; }
  if (rec.source_classic) { skipped.push(`${prop.formula_id} (已有出典「${rec.source_classic}」,不覆蓋)`); continue; }
  applied++;
  if (APPLY) {
    rec.source_classic = prop.source_classic;
    rec.field_sources = rec.field_sources || {};
    if (!rec.field_sources.source_classic) {
      rec.field_sources.source_classic = [
        `${prop.evidence_file}(「${String(prop.evidence_quote).slice(0, 90)}」;帳本 ${LEDGER_REL})`,
      ];
    }
  } else {
    console.log(`${prop.formula_id}  ${prop.source_classic}  ← ${prop.evidence_file}`);
  }
}

console.log(`\n可落 ${applied},跳過 ${skipped.length}`);
for (const s of skipped) console.log("  SKIP", s);

if (APPLY) {
  fs.writeFileSync(
    path.join(ROOT, "data/herbs/formulas.json"),
    JSON.stringify(fdoc, null, 2) + "\n",
    "utf8"
  );
  console.log("WROTE data/herbs/formulas.json");
} else {
  console.log("DRY RUN — 加 --apply 寫入。");
}
