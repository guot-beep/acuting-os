#!/usr/bin/env node
/**
 * validate-formula-safety-reachability.js — 安全文字不准變成「資料裡有、卡上沒有」
 * (2026-08-28)
 *
 * A1(a) 把方劑的安全欄按方向拆成 contraindications_* / cautions_*,資料層做得
 * 很乾淨:450 句離開原欄位,450 句逐字留在 import_antifacts,零遺失。所有驗證器
 * 全綠,棘輪 flat。
 *
 * 但卡面上少了 423 句 —— 而且沒有任何一支 gate 察覺:
 *
 *   1. **渲染器是二選一**。方劑卡寫的是 `contraindications_zh || cautions_zh`,
 *      禁忌非空時注意事項整段短路;`cautions_en` 從來沒有被任何一行讀過。
 *      拆欄之前兩欄裝同一份文字,印哪一欄都一樣,所以這個缺陷是隱形的;
 *      拆開的那一刻它立刻變成「資料對、畫面少一半」。150 句因此離開卡面,
 *      包括麻黃湯「高血壓者慎用」、補陽還五湯與抗凝血劑併用的出血風險。
 *   2. **封存欄不是畫面**。分類器判不出方向的句子被移進 import_artifacts,
 *      原文完整保存 —— 但 import_artifacts 不上方劑卡。273 句因此只存在於
 *      封存裡。「有備份」與「病人看得到」是兩件事。
 *
 * 兩條檢查,各對應上面一條:
 *   R1 渲染層:凡是有資料的安全欄,渲染器都必須讀。兩個都有資料的欄位之間
 *      不准用 `||` 二選一 —— 那會讓其中一欄的內容永遠印不出來。
 *   R2 資料層(棘輪):只存在於 import_artifacts、canonical 安全欄一個字都沒有的
 *      句子,數量只准變少。這是「遷移把安全文字搬走卻沒放回來」的計量。
 *
 * 這是 [[renderer-shows-what-data-does-not-say]] 與
 * [[gap-scans-must-read-the-renderer]] 的交點:欄位填得越好,`||` 丟掉的越多。
 *
 * 用法:node scripts/validate-formula-safety-reachability.js [--worklist]
 *       node scripts/validate-formula-safety-reachability.js --update   # 只准往下
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const WORKLIST = process.argv.includes("--worklist");
const UPDATE = process.argv.includes("--update");
const BASELINE_FILE = path.join(ROOT, "data/audits/formula_safety_reachability_baseline.json");

const src = fs.readFileSync(path.join(ROOT, "js/knowledge.js"), "utf8");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8").replace(/^﻿/, ""));
const records = data.records || data;

const SAFETY_FIELDS = ["contraindications_zh", "contraindications_en", "cautions_zh", "cautions_en"];
const L = (v) => (Array.isArray(v) ? v.filter((x) => String(x || "").trim() !== "").map(String) : []);
const norm = (s) => String(s).replace(/\s+/g, "").replace(/[，,。.、；;：:()（）|]/g, "").toLowerCase();

const defects = [];
let pass = 0;
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log("  ✓ " + name); }
  else { defects.push(`${name} — ${detail}`); console.log("  ⛔ " + name + " — " + detail); }
};

console.log("方劑安全文字可達性 —— 資料裡有的,卡上要看得到\n");
console.log("R1 渲染層 —— 有資料的安全欄都要被讀,且不准兩兩二選一");

// 哪些安全欄實際帶著資料
const carrying = SAFETY_FIELDS.filter((f) => records.some((r) => L(r[f]).length));
for (const f of carrying) {
  const n = records.filter((r) => L(r[f]).length).length;
  check(`R1 渲染層讀 ${f}（${n} 張卡有資料）`,
    new RegExp(`record\\.${f}\\b`).test(src),
    `js/knowledge.js 從來沒有讀過 ${f} —— ${n} 張卡的這些句子在畫面上不存在`);
}

/* 二選一短路:`record.A || record.B`,而 A、B 都是帶資料的安全欄。
 * 這種寫法會讓「A 有值」的卡永遠印不出 B —— 填得越好丟得越多。 */
for (const a of carrying) {
  for (const b of carrying) {
    if (a === b) continue;
    const shortCircuit = new RegExp(`record\\.${a}\\s*\\|\\|\\s*record\\.${b}\\b`);
    check(`R1 ${a} 沒有用 || 吞掉 ${b}`,
      !shortCircuit.test(src),
      `渲染層寫成 record.${a} || record.${b} —— 兩欄都有資料時,${b} 永遠印不出來`);
  }
}

console.log("\nR2 資料層 —— 只活在 import_artifacts 裡的安全句子(棘輪:只准變少)");

let orphaned = 0;
const rows = [];
for (const r of records) {
  const arts = Array.isArray(r.import_artifacts) ? r.import_artifacts : [];
  if (!arts.length) continue;
  const canon = new Set(SAFETY_FIELDS.flatMap((f) => L(r[f])).map(norm));
  const seen = new Set();
  for (const a of arts) {
    if (!SAFETY_FIELDS.includes(a && a.original_field)) continue;
    // artifact 的 text 是原陣列用 " | " 串起來的,拆回逐句
    for (const s of String(a.text || "").split(" | ")) {
      const n = norm(s);
      if (!n || seen.has(n)) continue;
      seen.add(n);
      if (canon.has(n)) continue;                  // 還在某個 canonical 安全欄
      orphaned++;
      rows.push(`${r.name_zh || r.id}(${r.id}) [${a.original_field}] ${s.trim().slice(0, 90)}`);
    }
  }
}
console.log(`  只在封存、canonical 安全欄一個字都沒有的句子: ${orphaned}`);
if (WORKLIST) rows.forEach((x) => console.log("      " + x));
else if (orphaned) console.log("      (加 --worklist 列出每一句)");

let baseline = null;
if (fs.existsSync(BASELINE_FILE)) baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, "utf8"));

if (UPDATE) {
  if (baseline && orphaned > baseline.orphaned_safety_sentences) {
    console.log(`\n⛔ --update 拒絕記錄退步:${baseline.orphaned_safety_sentences} → ${orphaned}。棘輪只准往下。`);
    process.exit(1);
  }
  fs.writeFileSync(BASELINE_FILE, JSON.stringify({
    orphaned_safety_sentences: orphaned,
    note: "只存在於 import_artifacts、canonical 安全欄完全沒有的方劑安全句子數。只准變少。",
    updated_at: new Date().toISOString().slice(0, 10),
  }, null, 2) + "\n");
  console.log(`\n已寫入基線:${orphaned}`);
  process.exit(0);
}

if (baseline) {
  const base = baseline.orphaned_safety_sentences;
  if (orphaned > base) {
    defects.push(`R2 孤兒安全句子變多:${base} → ${orphaned}`);
    console.log(`  ⛔ 超過基線 ${base} —— 又有安全文字被搬進封存卻沒放回卡上`);
  } else if (orphaned < base) {
    console.log(`  ✅ 低於基線 ${base}（請一併調降:--update）`);
    pass++;
  } else {
    console.log(`  ✓ 與基線 ${base} 相同`);
    pass++;
  }
} else {
  console.log("  (尚無基線檔,先跑 --update 建立)");
}

console.log("");
/* PASS 只代表「沒有變差」,不代表「沒有問題」。孤兒數不是 0 的時候要把數字
 * 講出來 —— 一支在有 280 句安全文字下不了畫面時還印「全部讀得到」的 gate,
 * 比沒有 gate 更糟。 */
console.log(defects.length
  ? `FAIL — ${defects.length} 個缺陷。`
  : orphaned
    ? `PASS(未變差)— R1 渲染層 ${pass} 條全過;R2 仍有 ${orphaned} 句安全文字只在封存裡,上不了卡面,待遷移補回。`
    : `PASS — ${pass} 條全過:每一句安全文字都在畫面讀得到的欄位裡。`);
process.exit(defects.length ? 1 : 0);
