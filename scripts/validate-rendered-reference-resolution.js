#!/usr/bin/env node
/**
 * validate-rendered-reference-resolution.js — 會上畫面的跨卡引用,解析得到嗎
 *
 * 為什麼有這一支(2026-08-28):
 * 這個庫反覆出現的不是資料錯,是**資料到畫面之間查表失敗時不出聲**。
 * 同一週已經抓到三次:一個 `||` 讓 36 味藥卡吞掉 109 條藥對、STATUS_LABEL 少兩個鍵
 * 讓 124 張卡印生 enum、兩處手抄 pill 讓 151 顆標籤印小寫 draft。
 * 這支管第四種:**引用了不存在的 id**。三種畫面後果都遇過:
 *   靜默丟掉   formulas.key_pairs 走 .filter(Boolean) —— 3 張方劑卡的策展藥對整份消失,
 *              改印「依組成推得」的候選,看起來像本來就沒策展過(已於同日改成會出聲)
 *   印生 slug  herbPairs.herbs 查不到就靜態 chip,標籤是 id 去前綴
 *   死連結     relationButton 不管目標存不存在都渲染成可點按鈕
 *
 * 規則:**只准變少**。每個欄位一個上限,超過就 FAIL;低於就提示可以把上限調下來。
 * 不用「清單」是因為懸空 id 會換人不換數量;盯數量比盯名單耐用。
 *
 * 用法: node scripts/validate-rendered-reference-resolution.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

// 上限 = 2026-08-28 首次量測值。修好就把數字改小,只能往下不能往上。
const CEILING = {
  "formulas.key_pairs": 0,   // 2026-08-28 從 15 降到 0:3 條重導 + 12 條建記錄
  "herbPairs.herbs": 3,
  "patternLibrary.typical_formulas": 5,
  "herbPairs.found_in_formulas": 9,
};
const BEHAVIOUR = {
  "formulas.key_pairs": "方劑卡藥對區:解析不到的現在會列出 id 說明尚未建立(改前是靜默丟掉)",
  "herbPairs.herbs": "藥對卡成員 chip:查不到就印 id 去前綴的 slug,不是藥名",
  "patternLibrary.typical_formulas": "證型大卡代表方",
  "herbPairs.found_in_formulas": "方劑卡「經典對藥」區的第二個來源(2026-09-01 起與 key_pairs 併集渲染;"
    + "解析不到的 9 條與 validate-found-in-formulas-integrity 的 dangling 9 是同一批前向引用)",
};
/* 形狀不對的引用(2026-09-06):字串但前綴不對、物件但沒有 id/formula_id/herb_id、或根本不是字串/物件。
   之前是 continue —— 覆核員負控往 formulas.key_pairs 塞 "herb.x" / "noprefix" / {pair_id:"pair.x"},
   三種全放行;而渲染端一樣查不到。今天四個欄位都是 0,上限 0。 */
const MALFORMED_CEILING = 0;

for (const f of ["core", "ref", "rx", "mm", "dx", "pat"]) {
  const p = path.join(ROOT, "data/generated/knowledge_" + f + ".js");
  if (!fs.existsSync(p)) { console.log("FAIL — 先跑 node scripts/build-data.js(缺 " + f + " 分片)"); process.exit(1); }
  globalThis.window = globalThis;
  require(p);
}
const K = globalThis.ACUTING_KNOWLEDGE || {};
const recs = (n) => { const d = K[n]; return (d && (d.records || d.pairs)) || []; };
if (!recs("herbs").length || !recs("formulas").length || !recs("herbPairs").length) {
  console.log("FAIL — bundle 讀不到 herbs/formulas/herbPairs,不允許空跑通過。"); process.exit(1);
}
const ID = {
  herb: new Set(recs("herbs").map((r) => r.id)),
  formula: new Set(recs("formulas").map((r) => r.id)),
  pair: new Set(recs("herbPairs").map((r) => r.id)),
};
const FIELDS = [
  { set: "formulas", field: "key_pairs", ns: "pair" },
  { set: "herbPairs", field: "herbs", ns: "herb" },
  { set: "patternLibrary", field: "typical_formulas", ns: "formula" },
  { set: "herbPairs", field: "found_in_formulas", ns: "formula" },
];

const problems = [];
const improved = [];
const notes = [];

// ---- 渲染端守衛:relationButton 必須先檢查目標存不存在 -----------------------
// 跟下面的數量上限是兩件事:上限管「資料裡還有幾個懸空」,這裡管「萬一有,畫面怎麼表現」。
// 沒有這道檢查,一個懸空 id 會渲染成看起來可點、點了完全沒反應的按鈕
// —— openKnowledgeDetail() 對「kind 認得但記錄不存在」原本是靜默 return。
// 剝掉註解再比對:註解裡引述壞寫法不算違規。
{
  const rawView = fs.readFileSync(path.join(ROOT, "js/knowledge.js"), "utf8");
  const code = rawView.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
  if (!/function\s+relationTargetExists\s*\(/.test(code)) {
    problems.push("js/knowledge.js 找不到 relationTargetExists() —— relationButton 的存在性檢查被移除或改名，"
      + "這支必須跟著更新，不能默默跳過");
  } else if (!/function\s+relationButton[\s\S]{0,500}?relationTargetExists\s*\(/.test(code)) {
    problems.push("js/knowledge.js 的 relationButton() 沒有呼叫 relationTargetExists() —— 目標不存在時會渲染成死連結");
  }
  // 2026-09-06:改測剝過註解的 code,不測 rawView —— 把 console.warn 換成一行註解「used to log: no ${kind} record for id」
  // 就能滿足舊寫法(覆核員負控實測放行)。其他三項本來就是測 code。
  if (!/no \$\{kind\} record for id/.test(code)) {
    problems.push("js/knowledge.js 的 openKnowledgeDetail() 對「kind 認得但記錄不存在」又變回靜默 return —— 那一路要出聲");
  }
  // 證型大卡的 chip 走的是 entityLabel + entityCardExists,不是 relationButton,要分開盯。
  if (!/function\s+entityCardExists\s*\(/.test(code)) {
    problems.push("js/knowledge.js 找不到 entityCardExists() —— 證型大卡的代表方/西醫對應 chip 會恢復成"
      + "「查不到就印美化 slug、看起來跟真的一樣」");
  }
  // ENTITY_NAMES 少收一個集合,那個命名空間的 chip 就全部印美化 slug(2026-08-28 實測:formulas 少收 → 207 個)
  {
    const m2 = code.match(/const\s+ENTITY_NAMES\s*=[\s\S]*?return map;/);
    const body = m2 ? m2[0] : "";
    for (const need of ["formulas", "patternLibrary", "patternRegistry", "conditionCanon", "symptoms", "tdisRegistry"]) {
      if (!new RegExp("add\\(K\\." + need + "\\)").test(body)) {
        problems.push("js/knowledge.js 的 ENTITY_NAMES 沒收 K." + need
          + " —— 該命名空間的 chip 會全部印美化 slug 而不是名稱");
      }
    }
  }
}
let scanned = 0;
for (const f of FIELDS) {
  const key = f.set + "." + f.field;
  const bad = new Map();
  const malformed = [];
  let total = 0;
  for (const r of recs(f.set)) {
    const v = r[f.field];
    for (const x of (Array.isArray(v) ? v : (v ? [v] : []))) {
      const id = typeof x === "string" ? x : (x && (x.id || x.formula_id || x.herb_id));
      if (typeof id !== "string" || !id.startsWith(f.ns + ".")) {
        // 2026-09-06 之前是 continue:形狀不對的引用直接消失,總數與懸空數都看不到它。
        malformed.push((r.id || "?") + " → " + (typeof x === "string" ? x : JSON.stringify(x)));
        continue;
      }
      total++; scanned++;
      if (!ID[f.ns].has(id)) bad.set(id, (bad.get(id) || 0) + 1);
    }
  }
  const n = [...bad.values()].reduce((a, x) => a + x, 0);
  const cap = CEILING[key];
  notes.push(key.padEnd(34) + "引用 " + String(total).padStart(4) + " → 解析不到 " + String(n).padStart(3) + " / 上限 " + String(cap === undefined ? "(未設)" : cap)
    + "  形狀不對 " + malformed.length + " / 上限 " + MALFORMED_CEILING);
  if (malformed.length > MALFORMED_CEILING) {
    problems.push(key + " 有 " + malformed.length + " 筆形狀不對的引用(不是 " + f.ns + ". 開頭的字串,也不是帶 id/formula_id/herb_id 的物件),渲染端一樣查不到:"
      + "\n      " + malformed.slice(0, 5).join("\n      "));
  }
  if (cap === undefined) { problems.push(key + " 沒有設上限 —— 新欄位要先量一次再把數字寫進 CEILING"); continue; }
  /* 下限(2026-09-06):這個欄位一筆引用都沒抽到、而上限存在 = 欄位名變了或 build 掉欄位。
     原本只有全域的 scanned 下限:一個欄位空掉、其他三個還在,照樣全綠(覆核員負控:
     formulas.key_pairs 全改成 {pair_id} → 抽 0 → PASS)。今天 25 / 739 / 207 / 257。 */
  if (total === 0) {
    problems.push(key + " 一筆引用都沒抽到,但上限 " + cap + " 存在 —— 欄位名可能變了或 build 掉了欄位。這是量不到,不是資料乾淨,不允許空跑通過。");
    continue;
  }
  if (n > cap) {
    problems.push(key + " 解析不到 " + n + " 條,超過上限 " + cap + "。畫面行為:" + (BEHAVIOUR[key] || "?")
      + "\n      新增的:" + [...bad.keys()].slice(0, 8).join(", "));
  } else if (n < cap) improved.push(key + " " + cap + " → " + n + "(把 CEILING 裡的數字改成 " + n + " 鎖住)");
}
if (!scanned) { console.log("FAIL — 一筆引用都沒掃到,欄位名稱可能變了,不允許空跑通過。"); process.exit(1); }

console.log("validate-rendered-reference-resolution — 會上畫面的跨卡引用解析得到嗎");
notes.forEach((n) => console.log("  " + n));
if (improved.length) { console.log(""); improved.forEach((s) => console.log("  ℹ 改善了:" + s)); }
if (problems.length) {
  console.log("");
  problems.forEach((p) => console.log("  ✗ " + p));
  console.log("\nFAIL — " + problems.length + " 項。引用不存在的 id 不是資料整潔問題:"
    + "查不到時畫面會靜默丟掉、印生 slug、或給出一個點了沒東西的死連結。");
  process.exit(1);
}
console.log("\nPASS — 會上畫面的引用解析不到的數量都在上限內。");
