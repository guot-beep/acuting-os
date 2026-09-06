#!/usr/bin/env node
/**
 * validate-herb-pair-render.js — 單味藥卡的兩個藥對來源有沒有真的都到畫面上
 *
 * 為什麼有這一支(2026-08-27):
 * 藥卡的「經典對藥」有兩個來源，各自半滿：
 *   authored   herb_canon_shortlist.json 的 key_pairs（52 味 / 94 條自由文字，
 *              其中 45 條標明是 NCBAHM Appendix B / Bastyr 官方對藥，藥對層沒有）
 *   structured herb_pairs.json 的 218 筆（帶七情 relation、主治、注意、教學提示）
 * 渲染端曾寫成 `keyPairs || herbPairsSection(record)` —— 一個 OR，手寫欄一存在
 * 就把結構化那段整個蓋掉。36 味卡因此看不到自己的 109 條藥對記錄（黃耆 11、
 * 當歸 7、杜仲 7），而且畫面上看不出少了東西：填得越好的卡丟得越多。
 * 資料層的驗證器全綠 —— 因為兩份資料都在，是 renderer 只選了一邊。
 *
 * 所以這支不看 JSON 有沒有值，只問三件事：
 *   1. 那個會吞內容的 OR 有沒有回來（原樣或換名重生）
 *   2. build 期的重複判定（key_pairs_covered_pair_ids）有沒有算、算得對不對
 *      —— 用嚴格集合相等；子集不算重複，否則三味考綱組合會再把獨立的二味
 *      藥對藏起來（實測 9 條）
 *   3. 併集後每一味實際會顯示幾張結構化藥對卡，數字對不對得上
 *
 * 另外把「只存在於卡上、藥對層查無」的條數印出來當 backlog 計數（不擋，
 * 那是內容工作），數字變大代表兩側又在往反方向漂。
 *
 * 用法: node scripts/validate-herb-pair-render.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const problems = [];
const notes = [];

// ---- 1. renderer 回歸守衛 --------------------------------------------------
const viewRaw = fs.readFileSync(path.join(ROOT, "js/knowledge.js"), "utf8");
// 註解裡會引述這個壞寫法(說明為什麼不能這樣寫),不能拿註解當違規。
// 先把 /* */ 與 // 註解剝掉再比對,只看真的會執行的程式碼。
const view = viewRaw.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
if (/keyPairs\s*\|\|\s*herbPairsSection/.test(view)) {
  problems.push(
    "js/knowledge.js 又出現 `keyPairs || herbPairsSection(record)` —— 這個 OR 會讓有手寫\n" +
    "    key_pairs 的藥卡整段蓋掉結構化藥對區(實測 36 味卡共 109 條被吞)。要併集顯示,\n" +
    "    用 herbPairsBlock(record, keyPairs)。"
  );
}
if (!/function\s+herbPairsBlock\s*\(/.test(view)) {
  problems.push("js/knowledge.js 找不到 herbPairsBlock() —— 併集渲染被移除或改名,這支必須跟著更新,不能默默跳過。");
}
if (!/herbPairsBlock\(record,\s*keyPairs\)/.test(view)) {
  problems.push("js/knowledge.js 的「經典對藥」區沒有呼叫 herbPairsBlock(record, keyPairs) —— 接線斷了。");
}

// ---- 2/3. build 期重複判定與併集數 ----------------------------------------
const bundlePath = path.join(ROOT, "data/generated/knowledge_mm.js");
if (!fs.existsSync(bundlePath)) {
  problems.push("data/generated/knowledge_mm.js 不存在 —— 先跑 node scripts/build-data.js");
} else {
  globalThis.window = globalThis;
  require(bundlePath);
  const K = globalThis.ACUTING_KNOWLEDGE || {};
  const herbs = (K.herbs && K.herbs.records) || [];
  const pairs = (K.herbPairs && K.herbPairs.pairs) || [];
  if (!herbs.length || !pairs.length) {
    problems.push("bundle 讀不到 herbs/herbPairs —— 不允許空跑通過。");
  } else {
    const nameById = new Map();
    for (const h of herbs) if (h.name_zh) nameById.set(h.id, h.name_zh);
    const allNames = [...new Set(nameById.values())].sort((a, b) => b.length - a.length);
    const namesIn = (label) => {
      const found = new Set();
      let rest = String(label || "");
      for (const n of allNames) if (rest.includes(n)) { found.add(n); rest = rest.split(n).join(" "); }
      return found;
    };
    const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
    const pairById = new Map(pairs.map((p) => [p.id, p]));
    const pairsByHerb = new Map();
    for (const p of pairs) for (const id of (p.herbs || [])) {
      if (!pairsByHerb.has(id)) pairsByHerb.set(id, []);
      pairsByHerb.get(id).push(p);
    }

    let authoredHerbs = 0, authoredEntries = 0, coveredTotal = 0, unionShown = 0, orphanEntries = 0;
    for (const h of herbs) {
      const authored = h.key_pairs || [];
      const mine = pairsByHerb.get(h.id) || [];
      if (!authored.length) {
        if (Array.isArray(h.key_pairs_covered_pair_ids) && h.key_pairs_covered_pair_ids.length) {
          problems.push(`${h.id} 沒有 authored key_pairs 卻帶了 key_pairs_covered_pair_ids —— 判定來源錯了。`);
        }
        continue;
      }
      authoredHerbs++;
      authoredEntries += authored.length;
      const covered = h.key_pairs_covered_pair_ids;
      if (!Array.isArray(covered)) {
        problems.push(`${h.id} 有 authored key_pairs 但 build 沒算 key_pairs_covered_pair_ids —— 推導沒跑到。`);
        continue;
      }
      // 期望值就地重算,不信任 bundle 自己說的話
      const labelSets = authored.map((kp) => namesIn(kp && kp.pair));
      const expect = mine
        .filter((p) => {
          const memberSet = new Set((p.herbs || []).map((id) => nameById.get(id)).filter(Boolean));
          return memberSet.size && labelSets.some((s) => sameSet(s, memberSet));
        })
        .map((p) => p.id);
      const a = [...covered].sort().join(","), b = expect.sort().join(",");
      if (a !== b) problems.push(`${h.id} key_pairs_covered_pair_ids 與重算不符\n      bundle: [${a}]\n      重算:   [${b}]`);
      for (const id of covered) {
        const p = pairById.get(id);
        if (!p) problems.push(`${h.id} 的 covered 指向不存在的藥對 ${id}`);
        else if (!(p.herbs || []).includes(h.id)) problems.push(`${h.id} 的 covered 列了不含本藥的藥對 ${id}`);
      }
      coveredTotal += covered.length;
      unionShown += mine.length - covered.length;
      // 只活在卡上的條目 = 沒有任何本藥藥對與該標籤集合相等
      for (const s of labelSets) {
        const hit = mine.some((p) => sameSet(s, new Set((p.herbs || []).map((id) => nameById.get(id)).filter(Boolean))));
        if (!hit) orphanEntries++;
      }
    }
    /* 下限(2026-09-06):authored key_pairs 一味都沒抽到 = 欄位名變了或 build 掉欄位,
       不是「沒有手寫藥對所以沒有併集問題」。覆核員負控把每味藥的 key_pairs 刪掉,
       上面的迴圈一條都不進、problems 空、閘門全綠。今天 26 味 / 33 條。 */
    if (!authoredHerbs) {
      problems.push(`authored key_pairs 一味都沒抽到(herbs 共 ${herbs.length} 味;今天應有 26 味 / 33 條)—— 欄位名可能變了或 build 掉了欄位。這是量不到,不是資料乾淨,不允許空跑通過。`);
    }
    notes.push(`authored key_pairs: ${authoredHerbs} 味 / ${authoredEntries} 條`);
    notes.push(`判定與藥對層重複(渲染時濾掉): ${coveredTotal} 條`);
    notes.push(`併集後在這些卡上新增顯示的結構化藥對: ${unionShown} 條`);
    notes.push(`只存在於卡上、藥對層查無的條目: ${orphanEntries} 條  ← backlog(不擋);變大=兩側又在漂`);
  }
}

console.log("validate-herb-pair-render — 藥對雙軌是否併集到畫面");
notes.forEach((n) => console.log("  " + n));
if (problems.length) {
  console.log("");
  problems.forEach((p) => console.log("  ✗ " + p));
  console.log(`\nFAIL — ${problems.length} 項`);
  process.exit(1);
}
console.log("\nPASS — 兩個藥對來源都到畫面上,重複判定與重算一致。");
