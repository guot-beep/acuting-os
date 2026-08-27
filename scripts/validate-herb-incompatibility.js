#!/usr/bin/env node
/**
 * validate-herb-incompatibility.js — 十八反/十九畏 同方共存檢查(B1,2026-08-27)。
 *
 * 為什麼存在:B1 裁定前,含反藥對的方劑「沒有任何欄位可以承載這類配伍禁忌」
 * (TING_DECISION_QUEUE B1),而 A7 抓到同一組反藥在兩張藥卡上方向相反。
 * 資料對映在 data/config/herb_incompatibility_pairs.json;本檢查回答一個問題:
 * 哪些方劑的組成同時含有相反/相畏藥對,而卡片沒有具名承認這件事。
 *
 * 經典方劑刻意用反藥是真實存在的(《金匱》甘遂半夏湯甘遂配甘草)——所以
 * 「有反藥對」本身不是缺陷,「有反藥對而卡片隻字未提」才是。承認方式:
 * `incompatibility_note_zh` 欄位寫明是哪一對、出典與臨床立場。
 *
 * 計數規則:只看非 is_alternate、非 is_guide 的組成列(替代與藥引不必然同煎;
 * 若臨床上藥引也要計,提高規則前先在此註明理由)。
 *
 * 用法:node scripts/validate-herb-incompatibility.js [--json]
 * 進 ratchet(check-validation-ratchet.js),缺陷數只准降不准升。
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AS_JSON = process.argv.includes("--json");

const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "data/config/herb_incompatibility_pairs.json"), "utf8"));
const formulas = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8")).records;

const groups = [
  ...cfg.eighteen_incompatibilities.map((g) => ({ ...g, kind: "十八反" })),
  ...cfg.nineteen_antagonisms.map((g) => ({ ...g, kind: "十九畏" })),
].filter((g) => (g.side_a || []).length && (g.side_b || []).length);

const findings = [];
for (const f of formulas) {
  const live = (f.composition || []).filter((c) => c && !c.is_alternate && !c.is_guide);
  const ids = new Set(live.map((c) => c.herb_id).filter(Boolean));
  for (const g of groups) {
    const a = (g.side_a || []).filter((id) => ids.has(id));
    const b = (g.side_b || []).filter((id) => ids.has(id));
    if (a.length && b.length) {
      const acknowledged = typeof f.incompatibility_note_zh === "string" && f.incompatibility_note_zh.trim().length > 0;
      findings.push({
        formula: f.id, name: f.name_zh, kind: g.kind, group: g.group_zh,
        pair: `${a.join("+")} ⟂ ${b.join("+")}`, acknowledged,
      });
    }
  }
}

const defects = findings.filter((x) => !x.acknowledged);

if (AS_JSON) {
  const byCode = {};
  for (const d of defects) byCode[d.kind] = (byCode[d.kind] || 0) + 1;
  console.log(JSON.stringify({ defects: defects.length, by_code: byCode }));
  process.exit(0);
}

console.log("十八反/十九畏 同方共存檢查\n");
console.log(`  比對組(雙側皆有正典 id) ${groups.length}`);
console.log(`  同方共存(含已承認)      ${findings.length}`);
console.log(`  未承認(缺陷)            ${defects.length}\n`);
for (const x of findings) {
  console.log(`  ${x.acknowledged ? "✓ 已承認" : "⛔ 未承認"}  ${x.name}(${x.formula})  ${x.kind}:${x.group}`);
  console.log(`             ${x.pair}`);
}
if (defects.length) {
  console.log("\n處置:確屬經典刻意配伍者,補 incompatibility_note_zh 具名承認(出典+臨床立場);");
  console.log("屬資料錯誤者,修組成。兩者都不是刪掉這一對了事。");
}
console.log(defects.length ? `\nFAIL — ${defects.length} 筆未承認的反/畏共存。` : "\nPASS — 0 筆未承認的反/畏共存。");
process.exit(defects.length ? 1 : 0);
