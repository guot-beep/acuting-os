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

/* 搜尋範圍必須是 formulaPanels 的函式本體,不能是整個檔案。
 * 第一版拿整個 js/knowledge.js 做 grep,結果 `record.cautions_en` 在中藥面板
 * 也出現過,於是「方劑面板根本沒讀它」這個注入永遠抓不到 —— 負向對照當場
 * 打臉(NC2 exit 0)。一支範圍畫錯的 gate 會穩定地報綠,那比沒有 gate 更糟。 */
const panelStart = src.indexOf("function formulaPanels(");
const panelEnd = src.indexOf("function herbPanels(", panelStart + 1);
const panel = panelStart >= 0 && panelEnd > panelStart ? src.slice(panelStart, panelEnd) : "";
/* 比對程式碼之前一律先剝掉註解 —— 這支的檔頭與 knowledge.js 的註解為了
 * 說明清楚,都逐字引述了它們要禁止的寫法,不剝就會在乾淨的檔案上報紅。 */
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const panelCode = stripComments(panel);
check("R1a 找得到 formulaPanels 的函式本體",
  !!panel,
  "js/knowledge.js 裡切不出 formulaPanels…herbPanels 這一段 —— 函式被改名或搬家了," +
  "這支的 R1 已經在看錯的地方,請一併更新(不要讓它繼續報綠)");

// 哪些安全欄實際帶著資料
const carrying = SAFETY_FIELDS.filter((f) => records.some((r) => L(r[f]).length));
for (const f of carrying) {
  const n = records.filter((r) => L(r[f]).length).length;
  check(`R1 方劑面板讀 ${f}（${n} 張卡有資料）`,
    !!panel && new RegExp(`record\\.${f}\\b`).test(panelCode),
    `formulaPanels 從來沒有讀過 ${f} —— ${n} 張卡的這些句子在方劑卡上不存在`);
}

/* 二選一短路:`record.A || record.B`,而 A、B 都是帶資料的安全欄。
 * 這種寫法會讓「A 有值」的卡永遠印不出 B —— 填得越好丟得越多。 */
for (const a of carrying) {
  for (const b of carrying) {
    if (a === b) continue;
    const shortCircuit = new RegExp(`record\\.${a}\\s*\\|\\|\\s*record\\.${b}\\b`);
    check(`R1 ${a} 沒有用 || 吞掉 ${b}`,
      !shortCircuit.test(panelCode),
      `渲染層寫成 record.${a} || record.${b} —— 兩欄都有資料時,${b} 永遠印不出來`);
  }
}

/* ── R3 ────────────────────────────────────────────────────────────────
 * R1 只問「欄位有沒有被讀」,答得出「有」的渲染器仍然可能把內容藏起來 ——
 * 這正是 2026-08-28 我自己犯的:去重寫成整塊判斷
 * (`alreadyShown(cautionsZh,…) || alreadyShown(cautionsEn,…)`),任一語言側
 * 80% 重複就把整個注意事項區藏掉,24 句在 18 張卡上重新消失。R1 全過、
 * R2 flat,而卡面又少了 —— 所以要有一條直接問「印出來的集合裡有沒有它」。
 *
 * 這一條**鏡像了渲染層的去重規則**,兩邊必須一起改;R1 守著渲染層的形狀,
 * 形狀變了 R1 會先紅。判準是性質不是數量:**canonical 安全欄裡的每一句,
 * 都必須出現在渲染集合裡**(重複印是雜訊,不算違規;少印一句才是)。 */
/* R1f —— R3(下面)是**鏡像**規則:它自己抄了一份去重邏輯,所以渲染層改回
 * 整塊判斷時 R3 不會跟著紅(它算的是自己那份)。鏡像會腐,所以要有一條直接
 * 盯著渲染層形狀的斷言:去重必須逐項,`alreadyShown` 這種對整份清單做比例
 * 判斷的寫法,不准拿來決定整個 cautions 區的存亡。 */
check("R1f 注意事項區的去重是逐項,不是整塊",
  !!panel && !/alreadyShown\s*\(\s*(raw)?[Cc]autions/.test(panelCode),
  "formulaPanels 用 alreadyShown(cautions…) 對整份清單做比例判斷 —— " +
  "只要有一項不是重複,整區就不該被藏掉。逐項扣掉已印過的,不要整塊丟");

console.log("\nR3 卡面 —— canonical 安全欄的每一句都要出現在渲染集合裡");
const chipKey = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9一-鿿]/g, "");
const examOf = (r) => (r && r.exam_layer) || (r && r.exam) || {};
const renderedSet = (r) => {
  const cz = L(r.contraindications_zh);
  const ce = L(r.contraindications_en).length ? L(r.contraindications_en) : L(examOf(r).contraindications_en);
  const rz = L(r.cautions_zh), re = L(r.cautions_en);
  const sz = new Set(cz.map(chipKey)), se = new Set(ce.map(chipKey));
  let uz, ue;
  if (rz.length && re.length && rz.length === re.length) {
    const keep = rz.map((v, i) => !(sz.has(chipKey(v)) && se.has(chipKey(re[i]))));
    uz = rz.filter((_, i) => keep[i]); ue = re.filter((_, i) => keep[i]);
  } else {
    uz = rz.filter((v) => !sz.has(chipKey(v))); ue = re.filter((v) => !se.has(chipKey(v)));
  }
  return new Set([...cz, ...ce, ...uz, ...ue].map(chipKey));
};
let hidden = 0;
const hiddenRows = [];
for (const r of records) {
  const shown = renderedSet(r);
  for (const f of SAFETY_FIELDS) {
    for (const s of L(r[f])) {
      const k = chipKey(s);
      if (!k || shown.has(k)) continue;
      hidden++;
      hiddenRows.push(`${r.name_zh || r.id}(${r.id}) [${f}] ${s.trim().slice(0, 90)}`);
    }
  }
}
check("R3 沒有 canonical 安全句子被去重規則藏起來",
  hidden === 0,
  `${hidden} 句在 canonical 安全欄裡,卻不會出現在卡面上 —— 去重規則把不是重複的東西一起丟了`);
if (hidden && WORKLIST) hiddenRows.forEach((x) => console.log("      " + x));
else if (hidden) console.log("      (加 --worklist 列出每一句)");

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
