#!/usr/bin/env node
/**
 * apply-modifications.js — 加減變化(modifications_zh/_en,卡片區塊「常見加減」)落庫。
 *
 * 來源帳本:docs/research_packs/MODIFICATIONS_PROPOSALS_2026-08-19.json
 * (方剂学汇总 640 表全掃 → 105 個加減表 → 79 方 337 條;產出端已做
 * 685 個藥名 mention 全量交叉驗證 0 miss、zh/en/quote 三方等長斷言、
 * 劑量僅來源有數字的一處照抄其餘不寫、來源錯字逐處在 notes 標明)。
 *
 * 汇总原文是英文+拼音:en 是原文規範化,zh 是忠實中譯(拼音→漢字
 * 走庫內標準對照),原句逐字保存在帳本 evidence_quotes。
 *
 * 只填 modifications 為空的方(帳本產出時已跳過 18 個有加減的方,
 * 這裡再守一層);partial 2 條不落。zh/en 長度不等的整方跳過(紅線5)。
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

const LEDGER_REL = "docs/research_packs/MODIFICATIONS_PROPOSALS_2026-08-19.json";
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, LEDGER_REL), "utf8"));
const fdoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8"));
const formulas = fdoc.records || Object.values(fdoc).find(Array.isArray);
const byId = new Map(formulas.map((f) => [f.id, f]));

let applied = 0, entries = 0, skipped = [];
for (const prop of ledger.proposals.slice(OFFSET, OFFSET + LIMIT)) {
  const rec = byId.get(prop.formula_id);
  if (!rec) { skipped.push(prop.formula_id + " 查無"); continue; }
  if ((rec.modifications_zh || []).length) { skipped.push(prop.formula_id + " 已有加減,不覆蓋"); continue; }
  const zh = prop.modifications_zh || [], en = prop.modifications_en || [];
  if (!zh.length || zh.length !== en.length) { skipped.push(prop.formula_id + " zh/en 長度不合"); continue; }
  applied++;
  entries += zh.length;
  if (APPLY) {
    rec.modifications_zh = zh;
    rec.modifications_en = en;
    rec.field_sources = rec.field_sources || {};
    if (!rec.field_sources.modifications_zh) {
      rec.field_sources.modifications_zh = [
        `curriculum/herbs/方剂学汇总_extracted.md(${prop.evidence || ""};原文英文+拼音,zh 為忠實中譯,原句在帳本 ${LEDGER_REL} evidence_quotes)`,
      ];
    }
  } else {
    console.log(`${prop.formula_id}  +${zh.length} 條`);
  }
}
console.log(`\n本批 offset=${OFFSET}: 寫入 ${applied} 方 ${entries} 條,跳過 ${skipped.length}`);
for (const s of skipped.slice(0, 10)) console.log("  SKIP", s);

if (APPLY) {
  fs.writeFileSync(path.join(ROOT, "data/herbs/formulas.json"), JSON.stringify(fdoc, null, 2) + "\n", "utf8");
  console.log("WROTE data/herbs/formulas.json");
} else {
  console.log("DRY RUN — 加 --apply 寫入。");
}
