#!/usr/bin/env node
/**
 * validate-relation-registry-integrity.js — 登記邊的引用完整性(D13,2026-08-27)。
 *
 * D13:每條圖上的邊只存一側,反向推導;`data/config/relation_registry.json`
 * 是權威 —— 「沒登記的連結欄位對圖是隱形的」。登記表本身已有 29 條邊,
 * 但沒有任何東西檢查**那些欄位裡的 id 指得到東西**。
 *
 * 這支只回答一個問題:登記邊的每一個引用,目標存在嗎?
 *
 * 為什麼這條值得單獨守:懸空引用不會讓任何現有 validator 變紅 —— 各層的
 * standard 檢查只看自己那層的欄位長相,不追對面。它的症狀是畫面上一個
 * 點不開的連結,或一張永遠算不出成員的比較表(玉屏風散黃耆就是這樣漏了
 * 一年,見 A14)。而 id 一旦被寫進病歷(9/2 之後),懸空就從 UI 瑕疵
 * 變成資料完整性問題。
 *
 * 刻意不做的:
 *   - 不檢查覆蓋率(某張卡沒填 related_patterns 是誠實的缺口,不是缺陷)
 *   - 不檢查反向欄位是否手工回填(那是 validate-condition-standard 等各層
 *     的職責,重複檢查會讓兩邊的訊息互相打架)
 *   - staging/import 層(cloudtcm.* 等)不在範圍 —— D11 說它們是出處handle
 *
 * 用法:node scripts/validate-relation-registry-integrity.js [--json]
 * 進棘輪(懸空引用是既有積欠,一次歸零會擋住每次 merge)。
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AS_JSON = process.argv.includes("--json");
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "data/config/relation_registry.json"), "utf8"));

// ---- 建立各命名空間的已知 id 池 --------------------------------------------
const POOLS = {
  "cond.": ["data/pathology/condition_canon_shortlist.json"],
  "tdis.": ["data/pathology/tdis_registry.json"],
  "pattern.": ["data/pathology/pattern_registry.json", "data/pathology/pattern_library.json"],
  "sym.": ["data/symptoms/symptoms.json"],
  "herb.": ["data/herbs/herb_canon_shortlist.json"],
  "formula.": ["data/herbs/formulas.json", "data/herbs/formula_canon_shortlist.json"],
  "supp.": ["data/supplements/supplements.json"],
  "drug.": ["data/pharmacology/drugs.json"],
  "cmp.": ["data/knowledge/comparisons.json"],
};
const known = new Set();
for (const files of Object.values(POOLS)) {
  for (const rel of files) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) continue;
    const doc = JSON.parse(fs.readFileSync(p, "utf8"));
    const recs = doc.records || (Array.isArray(doc) ? doc : []);
    for (const r of recs) if (r && typeof r.id === "string") known.add(r.id);
  }
}
// 穴位 id 另有六個來源(照 validate-point-ids.js 的清單)
for (const [rel, get] of [
  ["data/acupoints/361.json", (d) => d],
  ["data/tung/point_index.json", (d) => d.points || d],
  ["data/auricular/gb93_index.json", (d) => d.points || []],
  ["data/auricular/embedded/auricular_points.json", (d) => d],
  ["data/acupoints/embedded/professional_points.json", (d) => d],
  ["data/acupoints/extra_points.json", (d) => d.records || d.points || (Array.isArray(d) ? d : [])],
]) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const arr = get(JSON.parse(fs.readFileSync(p, "utf8")));
  if (Array.isArray(arr)) for (const r of arr) {
    if (r && typeof r.id === "string") known.add(r.id);
    if (r && typeof r.code === "string") known.add(r.code);   // 標準穴 id===code
  }
}

const ID_SHAPE = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
const STANDARD_POINT = /^[A-Z]{2,5}\d{1,3}$/;
const dangling = [];
const checked = { refs: 0, edges: 0 };

// ---- 掃描登記邊 ------------------------------------------------------------
for (const edge of registry.edges || []) {
  if (!edge.file || !edge.field) continue;          // 臨床層等無檔案的邊跳過
  const p = path.join(ROOT, edge.file);
  if (!fs.existsSync(p)) continue;
  const doc = JSON.parse(fs.readFileSync(p, "utf8"));
  const recs = doc.records || (Array.isArray(doc) ? doc : []);
  if (!recs.length) continue;
  checked.edges++;

  // 欄位路徑可能是 "differential_patterns[].pattern_id" 這種
  const [base, sub] = String(edge.field).split("[].");
  for (const rec of recs) {
    const raw = rec[base];
    if (raw == null) continue;
    const values = (Array.isArray(raw) ? raw : [raw])
      .map((v) => (sub ? (v && v[sub]) : (typeof v === "string" ? v : v && (v.id || v.pattern_id))))
      .filter((v) => typeof v === "string" && (ID_SHAPE.test(v) || STANDARD_POINT.test(v)));
    for (const v of values) {
      checked.refs++;
      if (!known.has(v)) {
        /* junction 檔(formula_pattern_links.json)的記錄沒有 id,來源鍵是 formula_id;
         * 之前印成 `undefined → pattern.x`,讀報告的人找不到是哪一筆。 */
        dangling.push({ edge: edge.id, from: rec.id || rec.formula_id || rec.source_id || rec.pattern_id || "(記錄無 id)", field: edge.field, target: v });
      }
    }
  }
}

if (AS_JSON) {
  const byCode = {};
  for (const d of dangling) byCode[d.edge] = (byCode[d.edge] || 0) + 1;
  console.log(JSON.stringify({ defects: dangling.length, by_code: byCode }));
  process.exit(0);
}

console.log("登記邊的引用完整性(D13)\n");
console.log(`  登記邊              ${(registry.edges || []).length}(其中有檔案可掃 ${checked.edges})`);
console.log(`  已知 id 池          ${known.size}`);
console.log(`  檢查的引用          ${checked.refs}`);
console.log(`  懸空(目標不存在)    ${dangling.length}\n`);
const byEdge = {};
for (const d of dangling) (byEdge[d.edge] = byEdge[d.edge] || []).push(d);
for (const [e, list] of Object.entries(byEdge).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ⛔ ${e}  ${list.length} 筆`);
  for (const d of list.slice(0, 5)) console.log(`       ${d.from} → ${d.target}`);
  if (list.length > 5) console.log(`       …還有 ${list.length - 5}`);
}
if (!dangling.length) console.log("  (無)");
console.log(dangling.length ? `\n${dangling.length} 筆懸空引用。修法:補上目標卡,或撤下該引用 —— 不要留著指向虛無的連結。` : "\nPASS — 登記邊的引用全部指得到。");
process.exit(0);   // 報告型:數字由棘輪守,不直接擋
