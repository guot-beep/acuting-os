#!/usr/bin/env node
/**
 * triage-knowledge-gaps.js — 診間記下的缺口 → fill 線工單(2026-08-27)。
 *
 * gap logger 已經在收(app.js `acuting-knowledge-gaps-v1`,Ting 在 dry run
 * 現場要的「別亂跳一個症狀,讓我記得下來」),但下游是空的:匯出是一段
 * 純文字,沒有人能照它派工,於是缺口只是被記著,不會變成卡片。
 *
 * 這支補上那一段:吃 gap 匯出(JSON 或 AcuTingKnowledgeGaps.exportText 的
 * 文字格式),對照現有正典,分成三類再輸出可直接派的工單。
 *
 *   ALREADY_EXISTS  —— 庫裡其實有,只是當下沒搜到(別名/寫法差異)。
 *                      這類**不該建新卡**,該補 aliases —— 建新卡會製造重複,
 *                      而重複正是 D10/D21/D22 花了好幾天在收拾的東西。
 *   NEEDS_CARD      —— 庫裡真的沒有。附上命名空間建議(照 D11 四套)。
 *   AMBIGUOUS       —— 同名跨命名空間(如「月經過多」cond 與 tdis 都有),
 *                      或字串太短無法判斷 —— 需要人決定要哪一個。
 *
 * 為什麼分這三類而不是全丟成待辦:診間記下的字是病人語言或臨床速記,
 * 直接當成「要建的卡」會讓知識庫長出一堆同義重複。**先問「是不是已經有」
 * 才問「要不要建」**,是這個庫已經用血學過的規則。
 *
 * 用法:
 *   node scripts/triage-knowledge-gaps.js <gaps.json|gaps.txt>
 *   node scripts/triage-knowledge-gaps.js --demo      # 用內建樣本示範
 *   node scripts/triage-knowledge-gaps.js <file> --json
 *
 * 不寫入任何 canonical 檔案 —— 輸出是給人看的工單。
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const AS_JSON = args.includes("--json");
const DEMO = args.includes("--demo");
const file = args.find((a) => !a.startsWith("--"));

// ---- 載入正典:id、名稱、別名都算「已經有」 ---------------------------------
const LAYERS = [
  ["cond.*", "data/pathology/condition_canon_shortlist.json"],
  ["tdis.*", "data/pathology/tdis_registry.json"],
  ["pattern.*", "data/pathology/pattern_library.json"],
  ["pattern.*", "data/pathology/pattern_registry.json"],
  ["sym.*", "data/symptoms/symptoms.json"],
  ["herb.*", "data/herbs/herb_canon_shortlist.json"],
  ["formula.*", "data/herbs/formulas.json"],
  ["supp.*", "data/supplements/supplements.json"],
  ["drug.*", "data/pharmacology/drugs.json"],
];
const index = new Map();   // 正規化名稱 → [{ns,id,name}]
const norm = (s) => String(s || "").trim().toLowerCase().replace(/[\s·・、,，。.()（）]/g, "");
function put(ns, id, name) {
  const k = norm(name);
  if (!k) return;
  if (!index.has(k)) index.set(k, []);
  const list = index.get(k);
  if (!list.some((e) => e.id === id)) list.push({ ns, id, name });
}
for (const [ns, rel] of LAYERS) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const doc = JSON.parse(fs.readFileSync(p, "utf8"));
  for (const r of doc.records || []) {
    if (!r || !r.id) continue;
    for (const n of [r.name_zh, r.name_en, r.pinyin, ...(r.aliases_zh || []), ...(r.aliases_en || [])]) put(ns, r.id, n);
  }
}

// ---- 讀 gap ---------------------------------------------------------------
const DEMO_GAPS = [
  { fieldLabel: "症狀", query: "腰痠", count: 3 },
  { fieldLabel: "症狀", query: "胸口悶悶的說不上來", count: 1 },
  { fieldLabel: "西醫病名", query: "月經過多", count: 2 },
  { fieldLabel: "方劑", query: "交泰丸", count: 1 },
  { fieldLabel: "中藥", query: "黃耆", count: 5 },
];
let gaps;
if (DEMO) {
  gaps = DEMO_GAPS;
} else if (!file) {
  console.error("用法:node scripts/triage-knowledge-gaps.js <gaps.json|gaps.txt> [--json]");
  console.error("      node scripts/triage-knowledge-gaps.js --demo");
  process.exit(2);
} else {
  const raw = fs.readFileSync(file, "utf8").trim();
  if (raw.startsWith("[") || raw.startsWith("{")) {
    const j = JSON.parse(raw);
    gaps = Array.isArray(j) ? j : (j.gaps || j.records || []);
  } else {
    // AcuTingKnowledgeGaps.exportText 的格式:[標籤] 查詢字 ×N（最後 時間）
    gaps = raw.split("\n").map((line) => {
      const m = line.match(/^\[([^\]]+)\]\s*(.+?)\s*×(\d+)/);
      return m ? { fieldLabel: m[1], query: m[2], count: Number(m[3]) } : null;
    }).filter(Boolean);
  }
}

// ---- 分類 ------------------------------------------------------------------
const NS_HINT = {
  "症狀": "sym.*", "西醫病名": "cond.*", "中醫病名": "tdis.*", "證型": "pattern.*",
  "方劑": "formula.*", "中藥": "herb.*", "西藥": "drug.*", "營養品": "supp.*",
};
const buckets = { ALREADY_EXISTS: [], NEEDS_CARD: [], AMBIGUOUS: [] };
for (const g of gaps) {
  const hits = index.get(norm(g.query)) || [];
  const expect = NS_HINT[g.fieldLabel] || null;
  const row = { ...g, expect, hits };
  if (!hits.length) {
    row.verdict = String(g.query).length < 2
      ? "字串過短,無法判斷"
      : (/[，。、？?]|說不上|不知道|大概/.test(g.query) ? "像是病人原話而非術語,先轉成臨床詞再判" : null);
    (row.verdict ? buckets.AMBIGUOUS : buckets.NEEDS_CARD).push(row);
  } else if (hits.length > 1 || (expect && !hits.some((h) => h.ns === expect))) {
    row.verdict = hits.length > 1 ? "同名跨多個命名空間" : `庫裡有,但在 ${hits[0].ns} 而非預期的 ${expect}`;
    buckets.AMBIGUOUS.push(row);
  } else {
    buckets.ALREADY_EXISTS.push(row);
  }
}

if (AS_JSON) {
  console.log(JSON.stringify({ total: gaps.length, counts: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])), buckets }, null, 2));
  process.exit(0);
}

const line = (g) => `${String(g.count || 1).toString().padStart(3)}× [${g.fieldLabel}] ${g.query}`;
console.log("診間缺口分流 → fill 線工單\n");
console.log(`  正典索引(名稱+別名)  ${index.size}`);
console.log(`  缺口筆數              ${gaps.length}\n`);

console.log(`【A】庫裡其實已經有 —— 不要建新卡  (${buckets.ALREADY_EXISTS.length})`);
for (const g of buckets.ALREADY_EXISTS) {
  const h = g.hits[0];
  // 命中的是卡名本身 vs 命中別名,處置不同:前者是搜尋沒搜到(UI/索引問題),
  // 後者是別名已經在做事。兩種都不該建新卡,但要修的地方不一樣。
  const isOwnName = norm(h.name) === norm(g.query);
  console.log(`  ${line(g)}\n      → ${h.id}(${h.name})${isOwnName
    ? " —— 命中的就是卡名本身,卡沒問題;查不到是搜尋路徑的事,別建新卡"
    : `;若常用此寫法,把「${g.query}」加進該卡 aliases_zh`}`);
}
if (!buckets.ALREADY_EXISTS.length) console.log("  (無)");

console.log(`\n【B】庫裡真的沒有 —— 建卡  (${buckets.NEEDS_CARD.length})`);
for (const g of buckets.NEEDS_CARD) console.log(`  ${line(g)}\n      → 建議命名空間 ${g.expect || "(依內容判斷)"};照 D14 先確認詞彙表/模板/驗證器齊備`);
if (!buckets.NEEDS_CARD.length) console.log("  (無)");

console.log(`\n【C】需要人裁定  (${buckets.AMBIGUOUS.length})`);
for (const g of buckets.AMBIGUOUS) {
  console.log(`  ${line(g)}\n      → ${g.verdict}`);
  for (const h of g.hits) console.log(`         候選:${h.id}(${h.name})`);
}
if (!buckets.AMBIGUOUS.length) console.log("  (無)");

console.log("\n紀律:先問「是不是已經有」才問「要不要建」—— 診間記下的是病人語言或");
console.log("臨床速記,直接當成待建卡會長出同義重複,而重複正是 D10/D21/D22 收拾過的東西。");
