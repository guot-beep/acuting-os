#!/usr/bin/env node
/**
 * validate-herb-search-index.js — 中藥搜尋索引必須涵蓋每一味藥「卡上看得見的功效」。
 *
 * 2026-09-05 抓到的 bug:知識分頁的中藥搜尋只索引 `functions`,而 159/360 味藥只有 `functions_zh`
 * (英文 `functions` 是空的)——那 159 味用「活血」「養陰」這種功效關鍵字搜不到,可是卡片上明明印著。
 * 資料越好(中文填得越滿)、搜尋越壞,是這個庫最貴的那種病的形狀([[one-field-two-shapes]])。
 *
 * 這支不是 grep 一行字串就了事:它從 js/knowledge.js 把搜尋索引的欄位清單**解析出來**,
 * 再對真資料重建索引文字,逐味藥檢查「功效第一個詞搜不搜得到」。
 * 欄位清單哪天被改壞(拿掉 functions_zh、或改名),這裡會亮;
 * 資料哪天長出第三種形狀(例如 functions 變字串),這裡也會亮。
 *
 * 用法:node scripts/validate-herb-search-index.js   (exit 1 = 有藥搜不到)
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "js", "knowledge.js"), "utf8");

/* 1. 解析索引欄位清單:找 herbs.filter 裡那個 `const text = [ ... ].join(" ")` */
const anchor = src.indexOf("const hit = herbs.filter(");
if (anchor < 0) { console.error("FAIL — js/knowledge.js 找不到 `const hit = herbs.filter(`(搜尋函式被改名了?)"); process.exit(2); }
const start = src.indexOf("const text = [", anchor);
const end = src.indexOf("].join(", start);
if (start < 0 || end < 0 || end - start > 4000) { console.error("FAIL — 找不到搜尋索引的欄位陣列"); process.exit(2); }
const block = src.slice(start + "const text = [".length, end);
// 每一行是 `h.xxx,` 或 `...(h.xxx || []),`;註解行忽略
const fields = [];
for (const raw of block.split("\n")) {
  const line = raw.replace(/\/\/.*$/, "").trim();
  if (!line) continue;
  const m = line.match(/^(?:\.\.\.\()?h\.([A-Za-z_][A-Za-z0-9_]*)/);
  if (m) fields.push({ name: m[1], spread: line.startsWith("...") });
}
if (!fields.length) { console.error("FAIL — 欄位陣列解析出 0 個欄位(格式變了,先修這支)"); process.exit(2); }

/* 2. 用同一份清單對真資料重建索引 */
const j = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "herbs", "herb_canon_shortlist.json"), "utf8"));
const herbs = (j.records || j).filter((r) => r.review_status !== "deprecated");
const cl = (v) => (Array.isArray(v) ? v : (v ? [v] : [])).filter((x) => String(x || "").trim());
const indexText = (h) => fields.map((f) => (f.spread ? cl(h[f.name]).join(" ") : String(h[f.name] || ""))).join(" ").toLowerCase();

const problems = [];
let checked = 0;
for (const h of herbs) {
  const text = indexText(h);
  // 卡上印的功效:functions_zh 優先(渲染器的 tradFunctions 也是這個順序),否則 functions
  const shown = cl(h.functions_zh).length ? cl(h.functions_zh) : cl(h.functions);
  if (!shown.length) continue;
  checked++;
  // 取第一個功效詞的前 2 個字當關鍵字(「活血祛瘀」→「活血」;英文取第一個詞)
  const first = String(shown[0]);
  const kw = /[㐀-鿿]/.test(first) ? first.replace(/[、,，;；\s].*$/, "").slice(0, 2) : first.split(/\s+/)[0];
  if (kw && !text.includes(kw.toLowerCase())) problems.push(`${h.id}  卡上功效「${first}」,搜「${kw}」找不到`);
}

const required = ["functions", "functions_zh"];
for (const r of required) if (!fields.some((f) => f.name === r)) problems.unshift(`索引欄位清單缺 ${r}(現有:${fields.map((f) => f.name).join(", ")})`);

if (problems.length) {
  console.error(`FAIL — 中藥搜尋索引:${problems.length} 條(檢查 ${checked}/${herbs.length} 味有功效的藥;索引欄位 ${fields.length} 個)`);
  for (const p of problems.slice(0, 20)) console.error("  ⛔ " + p);
  if (problems.length > 20) console.error(`  … 另 ${problems.length - 20} 條`);
  process.exit(1);
}
console.log(`PASS — 中藥搜尋索引:${checked}/${herbs.length} 味藥的卡上功效都搜得到(索引欄位 ${fields.length} 個:${fields.map((f) => f.name).join(", ")})`);
