#!/usr/bin/env node
/**
 * validate-dose-basis-render.js — 標了基準就必須顯示在畫面上(D29,2026-08-27)。
 *
 * 這條規則的由來是本庫最貴的一課([[renderer-shows-what-data-does-not-say]]):
 * 資料層做對了不等於畫面說對了。至寶丹雄黃 30g 的 dose_basis 早在資料裡標成
 * formula_batch_amount,但渲染層只讀 decoction_reference_g —— 於是線上此刻
 * 那格就是一個沒有任何限定語的「30g」,而單味藥典上限是 0.05–0.1g。
 * 標了基準卻不顯示,等於沒標。
 *
 * 三條檢查(全部是靜態掃描 js/knowledge.js,不需要瀏覽器):
 *   R1 渲染層必須讀 dose_basis
 *   R2 五個受控值都要有對應的中文標籤 —— 少一個,那個值就會靜靜地不顯示
 *   R3 malformed 狀態必須有自己的顯示分支(「這個數字現在不能信」與
 *      「已查證是整批量」不是同一件事,不能共用同一個標籤)
 *
 * 用法:node scripts/validate-dose-basis-render.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "js/knowledge.js"), "utf8");
const vocab = JSON.parse(fs.readFileSync(path.join(ROOT, "data/config/dose_basis_vocabulary.json"), "utf8"));

const defects = [];
let pass = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { defects.push(`${name} — ${detail}`); console.log("  ⛔ " + name + " — " + detail); }
};

console.log("dose_basis 渲染守則(D29)\n");

check("R1 渲染層讀 dose_basis",
  /item\.dose_basis\b/.test(src),
  "js/knowledge.js 沒有讀 item.dose_basis —— 標了基準卻不顯示等於沒標");

for (const e of vocab.dose_basis_enum) {
  check(`R2 ${e.id} 有中文標籤`,
    new RegExp(`${e.id}\\s*:`).test(src),
    `BASIS_LABEL 缺 ${e.id} —— 這個值會靜靜地不顯示`);
}

check("R3 malformed 有自己的顯示分支",
  /dose_basis_status\s*===\s*["']malformed["']/.test(src),
  "malformed(數值形狀壞掉,現在不能信)沒有專屬分支,會與已查證的基準共用標籤");

console.log("");
console.log(defects.length ? `FAIL — ${defects.length} 個缺陷。` : `PASS — ${pass} 條全過:標過基準的劑量都會帶著基準上畫面。`);
process.exit(defects.length ? 1 : 0);
