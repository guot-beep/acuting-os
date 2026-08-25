#!/usr/bin/env node
/**
 * validate-boot-order.js — app.js 開機順序守衛(2026-08-12 夜班)
 *
 * 這支存在的理由是一個真的重複發生過的當機:
 *   app.js 在檔案中段(第 ~1243 行)就呼叫 `render();` 完成首次繪製,但很多
 *   presentation label 的 `const` 宣告寫在對應的 render 函式旁邊 —— 也就是
 *   那一行之後。`const` 有 TDZ:函式宣告會提升、`const` 不會,所以只要首次
 *   render 走到某條需要那個 const 的路徑,整個 app.js 頂層就拋
 *   "Cannot access 'X' before initialization",app 開不起來。
 *
 * 症狀狡猾:只有「資料剛好走到那條 render 路徑」的使用者才會炸。
 *   - AGENT_EXPOSURE_TYPE_LABELS:病例帶用藥帳時炸(2026-08-11 走查抓到)
 *   - ADVERSE_EVENT_INTERVENTION_LABELS:病例帶不良反應時炸(2026-08-12
 *     P4 synthetic rehearsal 抓到 —— 上次修的四個沒有涵蓋它)
 *
 * 逐個修永遠慢一步,所以改成機器守衛:**初始 render() 之後不得有任何
 * 頂層 UPPER_CASE const 宣告**。要加新的就放檔頭那個 boot-order 區。
 *
 * 用法:node scripts/validate-boot-order.js
 * exit 0 = 安全;exit 1 = 有宣告落在初始 render() 之後。
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const lines = src.split("\n");

let renderLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === "render();") { renderLine = i + 1; break; }
}
if (renderLine === -1) {
  console.error("validate-boot-order: could not find the top-level `render();` call in app.js — has boot been restructured? Refusing to pass vacuously.");
  process.exit(1);
}

const offenders = [];
lines.forEach((line, i) => {
  /* 2026-08-24 放寬:原本只比對 `= {` 與 `= [`,於是字串、正則、new Set(…)
   * 這幾種宣告完全漏網 —— 但 TDZ 不看右邊是什麼字面值,它們一樣會炸。
   * 實測當時有 4 個漏網(REPEATABLE_ROW_OTHER_VALUE 就是其一,而生活型態列
   * 的渲染路徑會用到它)。改成比對任何 `const 大寫名 = `。 */
  const m = line.match(/^const ([A-Z][A-Z0-9_]+) = /);
  if (m && i + 1 > renderLine) offenders.push({ name: m[1], line: i + 1 });
});

console.log(`validate-boot-order: initial render() at app.js:${renderLine}`);
console.log(`  top-level UPPER_CASE const declarations after it: ${offenders.length}`);
if (offenders.length) {
  console.error("FAIL — these are in the temporal dead zone during first render; move them to the boot-order block near the top of app.js:");
  offenders.forEach((o) => console.error(`  ✗ app.js:${o.line}  ${o.name}`));
  process.exit(1);
}
console.log("PASS — no top-level constant is declared after the first render().");
