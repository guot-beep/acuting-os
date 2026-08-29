#!/usr/bin/env node
/**
 * validate-bilingual-index-pairing.js — 逐索引配對的兩側必須是同一份清單(2026-08-28)。
 *
 * 卡片上的雙語 chip 是**逐索引**印出來的:第 i 個中文配第 i 個英文。
 * 這種印法只有在兩個陣列是同一份清單的兩個語言版本時才成立。它會用兩種方式壞掉,
 * 而**只有第一種是長度檢查抓得到的**:
 *
 *   (1) 長度不符 —— 第 1 項中文配上第 1 項不相干的英文。已由渲染層擋下(只印中文)。
 *   (2) 長度相符但**來源欄位不同** —— 長度檢查完全看不見。
 *       渲染層原本允許 modern_pharmacology_zh 湊 modern_functions_en,11 張卡剛好
 *       一樣長就配了進去,而那是兩份不同的清單、順序也不同:
 *         香薷「發汗與退熱作用」→ "Increases gastric acid secretion"
 *         石膏「顯著解熱作用」  → "Hypoglycemic activity"
 *         蒼耳子「降血糖作用」  → "Analgesic activity"
 *       印錯的翻譯比沒有翻譯糟 —— 讀者沒有理由懷疑括號裡那句。
 *
 * 這支同時守兩側:
 *   R1 渲染層(靜態掃 js/knowledge.js):不准跨欄位湊長度。
 *   R2 資料層(掃各層 JSON):逐索引配對的欄位對,`_en` 要嘛與 `_zh` 等長,要嘛留空。
 *      (CLAUDE.md 第 3 條:索引對齊 —— 不然整個留空。)
 *
 * 這是 [[renderer-shows-what-data-does-not-say]] 的同一課:資料沒錯、驗證器全綠,
 * 錯的是畫面。而這種錯只有開卡片用眼睛讀才看得到 —— 所以要把它變成一行指令。
 *
 * 用法:node scripts/validate-bilingual-index-pairing.js [--worklist]
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const WORKLIST = process.argv.includes("--worklist");
const src = fs.readFileSync(path.join(ROOT, "js/knowledge.js"), "utf8");

const defects = [];
let passed = 0;
const check = (name, ok, detail) => {
  if (ok) { passed++; console.log("  ✓ " + name); }
  else { defects.push(`${name} — ${detail}`); console.log("  ⛔ " + name + " — " + detail); }
};

console.log("雙語逐索引配對:兩側必須同源\n");
console.log("R1 渲染層 —— 不准跨欄位湊長度");

/* modernPharm 的中文有兩個可能來源(modern_pharmacology_zh 優先,否則
 * modern_functions_zh),所以英文那一側也必須跟著換。抓法:把解析 modernPharmEn
 * 的那一段切出來,如果它同時提到兩個 _en 欄位,就必須有一個依「中文取自哪裡」
 * 決定的條件式 —— 否則那就是無條件 fallback,也就是這支要擋的錯。 */
const m = src.match(/const\s+modernPharmEn\s*=[\s\S]{0,900}?\n\s*\)?\(?\)?;/);
const block = m ? m[0] : "";
check("R1a 找得到 modernPharmEn 的解析段", !!block,
  "js/knowledge.js 裡找不到 modernPharmEn —— 欄位被改名了,這支的 R1 已經看不到真正的渲染規則,請一併更新");

if (block) {
  const mentionsPharmEn = /modern_pharmacology_en/.test(block);
  const mentionsFuncEn = /modern_functions_en/.test(block);
  const hasSourceGuard = /modern_pharmacology_zh/.test(block) || /usingPharmZh/.test(block);
  check("R1b 英文來源跟著中文來源走",
    !(mentionsPharmEn && mentionsFuncEn) || hasSourceGuard,
    "modernPharmEn 同時無條件接受 modern_pharmacology_en 與 modern_functions_en —— " +
    "長度剛好相符時就會拿另一份清單的英文去配,印出錯的翻譯");
}

/* 長度守門本身也不能不見:同源但長度不符還是會錯位。 */
check("R1c 仍有長度相符才配的守門",
  /\.length\s*===\s*modernPharm\.length/.test(src),
  "modernPharmEn 少了長度檢查 —— 同源但長度不符一樣會逐項錯位");
check("R1d indications 仍有長度守門",
  /indicationsAligned\s*=\s*indicationsEn\.length\s*===\s*indicationsZh\.length/.test(src),
  "indications 的長度守門不見了");
check("R1e actions 仍有長度守門",
  /actionsAligned\s*=\s*actionsEn\.length\s*===\s*tradFunctions\.length/.test(src),
  "actions 的長度守門不見了");

/* ── R2 資料層 ─────────────────────────────────────────────────────────
 * 渲染層實際逐索引配對的欄位對。左邊可能有多個中文來源(渲染層取第一個非空的),
 * 右邊是它對應的英文欄位。注意 functions_zh 的英文叫 actions_en(366 張都用它,
 * functions_en 只有 1 張)—— 欄位名不同不代表不同源,這裡照渲染層的實際取法寫。
 *
 * 分工:`validate-herb-card-schema.js` 的 H5 已經在守**中藥層**的
 * functions/indications/contraindications/cautions 四對(棘輪基線 6:糯稻根、
 * 梨皮、珍珠母、寒水石、硝石、青木香,兩側各自有對方沒有的真內容,補齊要中醫
 * 判斷,屬 fill 線)。兩支數同一批就等於同一個缺陷被記兩次、降一次卻只掉一半,
 * 所以這裡把那個面讓給 H5(見 SKIP),只守它沒涵蓋的:
 *   - 中藥層的 modern_pharmacology / modern_functions / condition_tags
 *   - 其餘五層的全部五對(H5 是中藥專用)
 * 這一面現在是 0,所以它是硬紅不是棘輪。 */
const PAIRS = [
  { label: "現代藥理", zh: ["modern_pharmacology_zh"], en: "modern_pharmacology_en" },
  { label: "現代功效", zh: ["modern_functions_zh"], en: "modern_functions_en" },
  { label: "傳統功效", zh: ["functions_zh", "traditional_functions_zh"], en: "actions_en" },
  { label: "主治", zh: ["indications_zh"], en: "indications_en" },
  { label: "病症標籤", zh: ["condition_tags_zh"], en: "condition_tags_en" },
];

// H5 已經擁有的面:中藥層 × 這兩對。留給棘輪,這裡不重複計數。
const SKIP = new Set(["中藥|傳統功效", "中藥|主治"]);

const LAYERS = [
  ["中藥", "data/herbs/herb_canon_shortlist.json"],
  ["方劑", "data/herbs/formulas.json"],
  ["361 經穴", "data/acupoints/361.json"],
  ["奇穴", "data/acupoints/extra_points.json"],
  ["條件", "data/pathology/condition_canon_shortlist.json"],
  ["症狀", "data/symptoms/symptoms.json"],
];

const list = (v) => (Array.isArray(v) ? v.filter((x) => String(x || "").trim() !== "") : []);

console.log("\nR2 資料層 —— `_en` 與 `_zh` 等長,或留空");
let misaligned = 0;
const rows = [];
for (const [layer, rel] of LAYERS) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const d = JSON.parse(fs.readFileSync(p, "utf8").replace(/^﻿/, ""));
  const recs = d.records || d;
  if (!Array.isArray(recs)) continue;
  let layerBad = 0;
  for (const r of recs) {
    for (const pair of PAIRS) {
      if (SKIP.has(`${layer}|${pair.label}`)) continue;
      // 照渲染層的取法:第一個非空的中文來源
      let zh = [];
      for (const f of pair.zh) { zh = list(r[f]); if (zh.length) break; }
      if (!zh.length) continue;
      const en = list(r[pair.en]);
      if (!en.length) continue;          // 留空是允許的(缺英文是待補,不是錯配)
      if (en.length === zh.length) continue;
      layerBad++;
      rows.push(`${layer} ${r.name_zh || r.id}(${r.id}) ${pair.label}: zh=${zh.length} ${pair.en}=${en.length}`);
    }
  }
  misaligned += layerBad;
  console.log(`  ${layerBad === 0 ? "✓" : "⛔"} ${layer.padEnd(8)} ${String(layerBad).padStart(3)} 個索引不對齊`);
}
if (misaligned) {
  defects.push(`R2 索引不對齊 ${misaligned} 筆`);
  if (WORKLIST) rows.forEach((x) => console.log("      " + x));
  else console.log("      (加 --worklist 列出每一筆)");
}

console.log("");
console.log(defects.length
  ? `FAIL — ${defects.length} 個缺陷。`
  : `PASS — R1 ${passed} 條全過,R2 各層索引全對齊:逐索引配對的兩側都是同一份清單。`);
process.exit(defects.length ? 1 : 0);
