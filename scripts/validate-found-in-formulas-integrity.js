#!/usr/bin/env node
/**
 * validate-found-in-formulas-integrity.js — 藥對的 found_in_formulas 站不站得住
 *
 * ⚠ 先講一件寫在前面的事:**這個欄位目前是暗的。**
 * `herb_pairs.json` 的 schema_note 說它的用途是
 *   "formula ids where this pair does the work, so the formula card can show its pairs"
 * 但 2026-09-01 全庫 grep:`js/**`、`app.js`、其他 `scripts/**` 沒有任何地方讀它，
 * 只有這支驗證器讀。也就是 **274 條策展連結、涵蓋 123 張方劑卡，一條都沒上過畫面**。
 * 對照組:方劑側的 `key_pairs` 只有 25 條、涵蓋 9 張卡，而那一側是有渲染的。
 *
 * 那為什麼不直接接上去?因為接之前量了可信度,**還不到可以接的程度**:
 * 265 條可查證的連結裡，有一批的藥對成員根本不在該方的 composition 裡。
 * 接上去就是把錯的內容送上畫面 —— 那正是 CLAUDE.md 第 5 條在講的事情的反面
 * (不是 fallback 說謊，是把沒驗過的資料當成已驗過的送出去)。
 *
 * 所以這支先把它**量起來、盯住只能變好**，接線與否是內容決定，等 Ting 裁。
 *
 * 三個計數，每個一個上限，**只准變少**:
 *   dangling  found_in_formulas 指向不存在的方(目前 9 條 / 7 首方)
 *   mismatch  藥對某味不在該方 composition。比對會吃兩件事:
 *             · 同一味藥的兩張卡(中文名/別名交集分群)
 *             · **炮製前綴**(炙甘草 = 甘草)—— 這是寫法差異不是內容錯
 *             但**部位別不算**(栝樓皮 ≠ 瓜蔞、槐米 ≠ 槐花):那是不同藥材，
 *             判成相同會把真的錯連洗白。
 *   both_missing  藥對兩味都不在該方 —— 這一類幾乎確定是錯連，單獨計數
 *
 * 用法: node scripts/validate-found-in-formulas-integrity.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

// 2026-09-01 首次量測值。修好就把數字改小，只能往下不能往上。
const CEILING = { dangling: 9, mismatch: 16, both_missing: 5 };

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const hp = readJson("data/herbs/herb_pairs.json");
const pairs = hp.pairs || [];
const forms = readJson("data/herbs/formulas.json").records || [];
const herbs = readJson("data/herbs/herb_canon_shortlist.json").records || [];
if (!pairs.length || !forms.length || !herbs.length) {
  console.log("FAIL — 讀不到 pairs/formulas/herbs，不允許空跑通過。");
  process.exit(1);
}

const byF = new Map(forms.map((f) => [f.id, f]));
const byH = new Map(herbs.map((h) => [h.id, h]));
const zh = (id) => (byH.get(id) || {}).name_zh || String(id);

// 同一味藥的兩張卡:中文名或別名有交集就視為同一味
const nameSet = (h) => new Set([h.name_zh, ...(h.aliases_zh || [])].filter(Boolean));
const grp = new Map();
{
  let g = 0;
  for (const h of herbs) {
    if (grp.has(h.id)) continue;
    const k = "g" + (g++);
    grp.set(h.id, k);
    for (const o of herbs) if (!grp.has(o.id) && [...nameSet(h)].some((x) => nameSet(o).has(x))) grp.set(o.id, k);
  }
}
const gid = (id) => grp.get(id) || id;

// 炮製前綴:只認寫法差異，不認部位差異
const PREP = /^(炙|生|炒|焦|煅|製|制|酒|蜜|鹽|醋|薑|姜|土|麩|燀|去油)+/;
const stripPrep = (s) => String(s || "").replace(PREP, "");
const samePreparation = (a, b) => {
  const A = zh(a), B = zh(b);
  if (!A || !B || A === B) return false;
  return stripPrep(A) === stripPrep(B) && stripPrep(A).length >= 2;
};

let links = 0;
const dangling = new Map();
const mismatch = [];
const bothMissing = [];
for (const p of pairs) {
  for (const fid of (p.found_in_formulas || [])) {
    if (typeof fid !== "string" || !fid.startsWith("formula.")) continue;
    const f = byF.get(fid);
    if (!f) { dangling.set(fid, (dangling.get(fid) || 0) + 1); continue; }
    links++;
    const compIds = (f.composition || []).map((c) => c.herb_id).filter(Boolean);
    const compG = new Set(compIds.map(gid));
    const miss = (p.herbs || []).filter((h) => !compG.has(gid(h)) && !compIds.some((c) => samePreparation(h, c)));
    if (!miss.length) continue;
    const row = { pair: p.id, pairZh: p.name_zh || p.id, fid, fZh: f.name_zh || fid, miss: miss.map(zh) };
    if (miss.length === (p.herbs || []).length) bothMissing.push(row);
    else mismatch.push(row);
  }
}
const nDangling = [...dangling.values()].reduce((a, b) => a + b, 0);
const counts = { dangling: nDangling, mismatch: mismatch.length, both_missing: bothMissing.length };

console.log("validate-found-in-formulas-integrity — 藥對→方劑的反向索引站不站得住");
console.log("  ⚠ 此欄位目前無任何渲染端讀取(2026-09-01 全庫 grep):" + links + " 條可查證連結、"
  + new Set(pairs.flatMap((p) => (p.found_in_formulas || []).filter((x) => byF.has(x)))).size + " 張方劑卡，都沒上過畫面。");
for (const k of Object.keys(CEILING)) {
  console.log("  " + k.padEnd(14) + String(counts[k]).padStart(3) + " / 上限 " + CEILING[k]);
}
const over = Object.keys(CEILING).filter((k) => counts[k] > CEILING[k]);
const better = Object.keys(CEILING).filter((k) => counts[k] < CEILING[k]);
if (dangling.size) {
  console.log("\n  指向不存在的方(前向引用，前批已裁定「留引用不補骨架」):");
  for (const [fid, n] of dangling) console.log("    " + fid.padEnd(46) + n + " 次");
}
if (bothMissing.length) {
  console.log("\n  兩味都不在該方(幾乎確定是錯連，待裁):");
  bothMissing.forEach((r) => console.log("    " + r.pairZh.padEnd(22) + "→ " + r.fZh.padEnd(14) + " 缺:" + r.miss.join("、")));
}
if (mismatch.length) {
  console.log("\n  單味不在該方(部位別 或 方劑組成漏味 或 錯連，逐條待裁):");
  mismatch.forEach((r) => console.log("    " + r.pairZh.padEnd(22) + "→ " + r.fZh.padEnd(14) + " 缺:" + r.miss.join("、")));
}
if (better.length) {
  console.log("");
  better.forEach((k) => console.log("  ℹ 改善了:" + k + " " + CEILING[k] + " → " + counts[k] + "(把 CEILING 改成 " + counts[k] + " 鎖住)"));
}
if (over.length) {
  console.log("\nFAIL — " + over.map((k) => k + " " + counts[k] + " > " + CEILING[k]).join("、"));
  console.log("  這個欄位還沒接上畫面，所以壞掉不會有人看到 —— 正因為如此才要靠 gate 盯，"
    + "否則接線的那一天會一次爆出來。");
  process.exit(1);
}
console.log("\nPASS — 三個計數都在上限內。");
