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

/* 讀 index.html 真正載入的六片 shard,不只 mm:id 命名空間要從**整個 bundle** 的 id 前綴取
   (herb./pair. 在 mm,pattern./tdis./cond./sym./cmp./drug. 在別片),只讀一片就只認得兩個。 */
for (const f of ["core", "ref", "rx", "mm", "dx", "pat"]) {
  const p = path.join(ROOT, "data/generated/knowledge_" + f + ".js");
  if (!fs.existsSync(p)) { console.log("FAIL — 先跑 node scripts/build-data.js(缺 " + f + " 分片)"); process.exit(1); }
  globalThis.window = globalThis;
  require(p);
}
const K = globalThis.ACUTING_KNOWLEDGE || {};
const pairs = (K.herbPairs && K.herbPairs.pairs) || [];
if (!pairs.length) { console.log("FAIL — bundle 讀不到 herbPairs,不是資料乾淨"); process.exit(1); }

/* 2026-09-06 之前這裡是一份手抄清單:四個 id 前綴 + 九個欄位名 + 「herbs 陣列」。
   覆核員負控:寫 official_claim_status / migrated_from / pattern.spleen_qi_xu / tdis.hypertension
   進 teaching_note_zh,全部放行 —— 手抄清單守得住的只有抄過的那幾個。換成兩條通則:
     · 記錄 id:命名空間**從 bundle 實際的 id 前綴集合取**(今天 24 個),不另抄一份會腐的清單
     · snake_case 詞形:中文欄位裡不該出現 a_b 這種東西,不管它叫什麼
   另保留一條通則接住舊清單裡的「herbs 陣列」:英文詞 + 陣列/欄位。
   刻意不收「Appendix B」「NCBAHM」這種**考綱專有名詞** —— 那是讀卡的人該看到的字,不是工程術語。 */
const idPrefixes = new Set();
for (const v of Object.values(K)) {
  const recs = v && (v.records || v.pairs);
  if (!Array.isArray(recs)) continue;
  for (const r of recs) if (r && typeof r.id === "string" && r.id.includes(".")) idPrefixes.add(r.id.split(".")[0]);
}
if (idPrefixes.size < 2) {
  console.log("FAIL — 從 bundle 抽到的 id 前綴只有 " + idPrefixes.size + " 個(今天是 24 個),bundle 形狀變了,不允許空跑通過。");
  process.exit(1);
}
const prefixAlt = [...idPrefixes].sort((a, b) => b.length - a.length).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
const MARKERS = [
  { re: new RegExp("\\b(?:" + prefixAlt + ")\\.[a-z0-9_]+(?:\\.[a-z0-9_]+)*", "g"), what: "記錄 id" },
  { re: /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g, what: "snake_case 欄位名" },
  { re: /\b[a-z][a-z0-9_]*\s*(?:陣列|欄位)/g, what: "欄位名(英文詞+陣列/欄位)" },
];

/* 下限(2026-09-06):有值的 teaching_note_zh 一條都沒抽到 = 欄位名變了或 build 掉欄位,
   不是「卡上沒有學習提示所以沒問題」。今天 74 條有值。 */
const withNote = pairs.filter((p) => p.teaching_note_zh).length;
if (!withNote) {
  console.log("validate-card-text-audience — 會上卡片的字是寫給讀卡的人看的嗎");
  console.log("  掃 herb_pairs.teaching_note_zh —— 有值 0 條 / 全部 " + pairs.length + " 條");
  console.log("\nFAIL — 有值的 teaching_note_zh 一條都沒抽到(今天應有 74 條),欄位名可能變了;這是量不到,不是資料乾淨,不允許空跑通過。");
  process.exit(1);
}

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
  + withNote + " 條 / 全部 " + pairs.length + " 條");
console.log("  id 命名空間取自 bundle 前綴集合: " + idPrefixes.size + " 個");
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
