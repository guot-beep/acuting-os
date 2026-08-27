#!/usr/bin/env node
/**
 * validate-dose-basis.js — composition[].dose_basis 受控與一致性(D29,2026-08-27)。
 *
 * 背景:A3 查證證實 `dose_g` 混裝至少三種互不可比的基準(整批製方量/成品單位
 * 暴露/單味成人日劑量)。至寶丹雄黃 30g 曾被讀成「藥典上限 300 倍」——錯的是
 * 欄位語意不是數字。Ting 2026-08-27 裁定照 SOL 五值枚舉設 dose_basis 欄。
 *
 * 這支守三件事(全部只在「有標」時才管 —— 未標不是缺陷,是未判定):
 *   B1 dose_basis 值必須在受控詞彙內
 *   B2 dose_basis_status 值必須在受控詞彙內
 *   B3 per_unit_exposure 若由批量換算而來,必須自陳為「名目分配輸入」
 *      (dose_basis_note_zh 含「名目分配」或 nominal apportioned)——
 *      否則等於把算術結果冒充實測人體暴露
 *
 * 刻意不做的:不推測任何一列的基準、不因為數字大就報錯。340 列 ≥30g 疑似
 * 整批量,但疑似不是判定 —— 那需要逐列來源,是 fill 線的活,不是驗證器的。
 *
 * 用法:node scripts/validate-dose-basis.js [--json]
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AS_JSON = process.argv.includes("--json");

const vocab = JSON.parse(fs.readFileSync(path.join(ROOT, "data/config/dose_basis_vocabulary.json"), "utf8"));
const BASIS = new Set(vocab.dose_basis_enum.map((e) => e.id));
const STATUS = new Set(vocab.quality_status_enum.map((e) => e.id));
const formulas = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8")).records;

const defects = [];
let labelled = 0;
let total = 0;

for (const f of formulas) {
  (f.composition || []).forEach((c, i) => {
    if (!c) return;
    total++;
    const where = `${f.id}.composition[${i}] (${c.name_zh || c.herb_zh || "?"})`;
    if (c.dose_basis !== undefined) {
      labelled++;
      if (!BASIS.has(c.dose_basis)) {
        defects.push({ code: "B1", where, detail: `dose_basis "${c.dose_basis}" 不在受控詞彙(${[...BASIS].join("/")})` });
      }
      if (c.dose_basis === "per_unit_exposure") {
        const note = String(c.dose_basis_note_zh || c.dose_basis_note_en || "");
        const derived = c.dose_basis_derived_from_batch === true;
        if (derived && !/名目分配|nominal apportioned/i.test(note)) {
          defects.push({ code: "B3", where, detail: "per_unit_exposure 由批量換算但未自陳為「名目分配輸入」—— 算術結果不得冒充實測人體暴露" });
        }
      }
    }
    if (c.dose_basis_status !== undefined && !STATUS.has(c.dose_basis_status)) {
      defects.push({ code: "B2", where, detail: `dose_basis_status "${c.dose_basis_status}" 不在受控詞彙` });
    }
  });
}

if (AS_JSON) {
  const byCode = {};
  for (const d of defects) byCode[d.code] = (byCode[d.code] || 0) + 1;
  console.log(JSON.stringify({ defects: defects.length, by_code: byCode }));
  process.exit(0);
}

console.log("dose_basis 受控與一致性檢查\n");
console.log(`  composition 列          ${total}`);
console.log(`  已標 dose_basis         ${labelled}  (未標不是缺陷,是未判定)`);
console.log(`  缺陷                    ${defects.length}\n`);
for (const d of defects) console.log(`  ⛔ ${d.code}  ${d.where}\n       ${d.detail}`);
if (!defects.length) console.log("  (無)");
console.log(defects.length ? `\nFAIL — ${defects.length} 個缺陷。` : "\nPASS — dose_basis 標示全部合規。");
process.exit(defects.length ? 1 : 0);
