#!/usr/bin/env node
/**
 * validate-card-text-audience.js — 會上卡片的字,是寫給讀卡的人看的嗎
 *
 * 為什麼有這一支(2026-09-01):
 * 藥對記錄的 `teaching_note_zh` 會渲染成卡上的「學習提示」(js/knowledge.js 的 k-pair-teach)。
 * 但它長年被當成工程筆記在用,28 條裡塞著欄位名與記錄 id ——
 * 「found_in_formulas 留空」「herbs 陣列用 herb.lu_gen,不另建 herb.wei_jing」
 * 「故本記錄不標 board_exam_pair／ncbahm_official_pair」。
 * 讀卡的人不知道 found_in_formulas 是什麼,也永遠看不到 herb.wei_jing 這個 id。
 *
 * 更糟的是這種句子會**腐爛而沒人發現**:有兩條寫著「宣稱本身留在藥卡標籤上未動,
 * 待 Ting 裁定該標籤怎麼改」,而那些標籤早在別的批次被遷走了 —— 卡上因此長期
 * 掛著一句已經不成立的話。
 *
 * 這支只守一件事:**這個欄位裡不准出現欄位名與記錄 id**。
 * 內部作業記錄有自己的家 —— `curation_note_zh`(不渲染),那裡不受本規則管。
 *
 * 這是窄閘門,只管 herb_pairs 的 teaching_note_zh。別的資料集要不要一起收,
 * 是另一條線;不在這裡假裝已經守住。
 *
 * 用法: node scripts/validate-card-text-audience.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const CEILING = 0;   // 只准變少

const bundle = path.join(ROOT, "data/generated/knowledge_mm.js");
if (!fs.existsSync(bundle)) { console.log("FAIL — 先跑 node scripts/build-data.js"); process.exit(1); }
globalThis.window = globalThis;
require(bundle);
const K = globalThis.ACUTING_KNOWLEDGE || {};
const pairs = (K.herbPairs && K.herbPairs.pairs) || [];
if (!pairs.length) { console.log("FAIL — bundle 讀不到 herbPairs,不是資料乾淨"); process.exit(1); }

/* 記錄 id 與欄位名。刻意不收「Appendix B」「NCBAHM」這種**考綱專有名詞** ——
   那是讀卡的人該看到的字,不是工程術語。 */
const MARKERS = [
  { re: /\bherb\.[a-z0-9_]+/g,     what: "藥卡 id" },
  { re: /\bpair\.[a-z0-9_.]+/g,    what: "藥對 id" },
  { re: /\bformula\.[a-z0-9_]+/g,  what: "方劑 id" },
  { re: /\bcond\.[a-z0-9_]+/g,     what: "病症 id" },
  { re: /found_in_formulas|key_pairs|board_exam_pair|ncbahm_official_pair|review_status|schema_note|teaching_note_zh|curation_note_zh|contains_ncbahm_official_pairs?/g,
    what: "欄位名" },
  { re: /herbs 陣列/g,             what: "欄位名" },
];

const hits = [];
for (const p of pairs) {
  const t = String(p.teaching_note_zh || "");
  if (!t) continue;
  const found = [];
  for (const m of MARKERS) { m.re.lastIndex = 0; const g = t.match(m.re); if (g) found.push(m.what + ": " + [...new Set(g)].join("、")); }
  if (found.length) hits.push({ id: p.id, name: p.name_zh, found });
}

console.log("validate-card-text-audience — 會上卡片的字是寫給讀卡的人看的嗎");
console.log("  掃 herb_pairs.teaching_note_zh(渲染成卡上「學習提示」)—— 有值 "
  + pairs.filter((p) => p.teaching_note_zh).length + " 條 / 全部 " + pairs.length + " 條");
console.log("  帶欄位名或記錄 id 的: " + hits.length + "(上限 " + CEILING + ")");
if (hits.length) {
  console.log("");
  hits.slice(0, 20).forEach((h) => {
    console.log("  ✗ " + h.id + "（" + h.name + "）");
    h.found.forEach((f) => console.log("       " + f));
  });
  if (hits.length > 20) console.log("  …另有 " + (hits.length - 20) + " 條。");
}

if (hits.length > CEILING) {
  console.log("\nFAIL — " + hits.length + " 條的「學習提示」裡有欄位名或記錄 id,超出上限 " + CEILING + "。");
  console.log("  讀卡的人不知道那些是什麼。內部作業記錄請放 curation_note_zh(不渲染),");
  console.log("  teaching_note_zh 只寫這味藥/這組配伍的事實。");
  process.exit(1);
}
console.log("\nPASS — 卡上的學習提示沒有欄位名與記錄 id。");
