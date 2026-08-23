#!/usr/bin/env node
/**
 * apply-contra-alignment.js — 紅線 5 的對齊落庫:contraindications_en 補到與
 * contraindications_zh 逐條成對、同序、同長。
 *
 * 來源帳本:docs/research_packs/CONTRA_ALIGN_PROPOSALS_2026-08-19.json。
 * 帳本產出時的規則:en 只能是對應 zh 條目的忠實翻譯;既有 en 對得上 zh 的
 * 原文保留(54 方 241 條 en 裡 121 條原文未動);對不上任何 zh 的舊 en 進
 * orphan_en。獨立二次驗證過:zh 逐字未改、en_current 與 repo 原檔逐字一致。
 *
 * 這支腳本只落「乾淨」提案:orphan_en 或 damaged_zh 非空的 20 方一律跳過
 * ——套用那些等於刪掉英文側既有內容(紅線 2/3,刪除要先問 Ting),
 * 或是在損毀中文上蓋翻譯。它們留在帳本裡等裁決。
 *
 * 落庫前逐方再驗一次 en_proposed.length === 現行 zh.length(檔案可能在
 * 帳本產出後又被改過;不等就跳過並回報,不硬寫)。
 *
 * Dry-run by default; --apply to write. --offset/--limit 分批。
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const argOf = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? Number(process.argv[i + 1]) : dflt;
};
const OFFSET = argOf("--offset", 0);
const LIMIT = argOf("--limit", Infinity);

const LEDGER_REL = "docs/research_packs/CONTRA_ALIGN_PROPOSALS_2026-08-19.json";
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, LEDGER_REL), "utf8"));
const fdoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8"));
const formulas = fdoc.records || Object.values(fdoc).find(Array.isArray);
const byId = new Map(formulas.map((f) => [f.id, f]));

const clean = ledger.proposals.filter(
  (x) => !(x.orphan_en || []).length && !(x.damaged_zh || []).length
);
const skippedHeld = ledger.proposals.length - clean.length;

let applied = 0,
  staleSkip = [];
for (const prop of clean.slice(OFFSET, OFFSET + LIMIT)) {
  const rec = byId.get(prop.id);
  if (!rec) {
    staleSkip.push(prop.id + " (查無記錄)");
    continue;
  }
  const zhNow = rec.contraindications_zh || [];
  // 帳本快照與現檔一致才落:zh 被別條線改過就不硬寫
  if (
    zhNow.length !== prop.zh.length ||
    zhNow.some((s, i) => s !== prop.zh[i]) ||
    prop.en_proposed.length !== zhNow.length
  ) {
    staleSkip.push(prop.id + " (zh 已變動或長度不合,重出提案)");
    continue;
  }
  applied++;
  if (APPLY) {
    rec.contraindications_en = prop.en_proposed;
    rec.field_sources = rec.field_sources || {};
    if (!rec.field_sources.contraindications_en) {
      rec.field_sources.contraindications_en = [
        `aligned: ${LEDGER_REL}(逐條忠實翻譯 _zh,既有可對上的 _en 原文保留;紅線5 對齊)`,
      ];
    }
  } else {
    console.log(`${prop.id}  zh ${prop.zh.length} 條  en ${(
      prop.en_current || []
    ).length} → ${prop.en_proposed.length}${prop.note ? "  note: " + String(prop.note).slice(0, 60) : ""}`);
  }
}

console.log(
  `\n乾淨提案 ${clean.length}(帳本另有 ${skippedHeld} 方 orphan/damaged 留裁決),本批寫入 ${applied},快照不符跳過 ${staleSkip.length}`
);
for (const s of staleSkip) console.log("  SKIP", s);

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
