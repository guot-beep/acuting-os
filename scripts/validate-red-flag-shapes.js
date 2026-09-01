#!/usr/bin/env node
/**
 * validate-red-flag-shapes.js — 急症紅旗有兩種形狀,渲染層必須兩種都認得
 * (2026-09-01)。
 *
 * 為什麼有這支:`red_flags_zh` / `red_flags_en` 同時存在兩種形狀 ——
 *   字串  1389 筆
 *   物件   519 筆 {finding, urgency_level, recommended_action, rationale, source}
 * 而渲染層只認得字串。物件走到 `esc()` 就變成 "[object Object]",於是
 * **508 張條件卡裡有 137 張(27%)的急症紅旗印的是那串字**,而標題還正確地
 * 數出「Red flags (3)」—— 等於告訴臨床者「這裡有三條」然後一條都讀不到。
 * 受影響的包括子宮外孕、子癲前症、異常子宮出血,全庫風險最高的那幾張轉診卡。
 *
 * 所有驗證器當時全綠,因為它們檢查資料而不檢查畫面;是 2026-09-01 開卡片
 * 用眼睛讀才發現的。這支把那雙眼睛變成一行指令。
 *
 * 三條檢查:
 *   R1 資料:每一筆紅旗要嘛是字串,要嘛是**已知的物件形狀**(至少有 finding)。
 *      第三種形狀一律 FAIL —— 那表示又多了一種渲染層不認得的東西。
 *   R2 資料:物件形狀的 urgency_level 必須在受控詞彙內,否則分級標籤會靜靜消失。
 *   R3 渲染:條件卡與證型卡的紅旗路徑都必須讀 `finding`(= 認得物件形狀)。
 *
 * 已知殘留(不是這支的缺陷,是待辦):tdisRegistry 有 200 筆物件形狀的紅旗,
 * 但 TDIS 卡**根本沒有渲染紅旗的區塊** —— 那 75 張卡的紅旗整個是暗的。
 * 那是「接線」問題不是「形狀」問題,列在 docs/TING_PENDING_RULINGS 裡。
 *
 * 用法:node scripts/validate-red-flag-shapes.js [--worklist]
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const WORKLIST = process.argv.includes("--worklist");
const src = fs.readFileSync(path.join(ROOT, "js/knowledge.js"), "utf8");

const LAYERS = [
  ["條件", "data/pathology/condition_canon_shortlist.json"],
  ["TDIS", "data/pathology/tdis_registry.json"],
  ["症狀", "data/symptoms/symptoms.json"],
  ["證型", "data/pathology/pattern_library.json"],
];
const FIELDS = ["red_flags_zh", "red_flags_en"];
/* 同一個概念**兩套詞彙**,兩套都真的在用:
 *   條件卡自帶     emergency / urgent / same_day / routine
 *   redFlagRegistry 的 tier  emergency_referral / urgent_referral / routine_referral
 * 兩套都認,因為既有碎裂不該讓這支一開始就紅 —— 一支起手就紅的 gate 會被關掉。
 * 但要把分裂數出來:碎裂本身是待裁項(見 docs/TING_PENDING_RULINGS),
 * 而「哪些藥/病是 emergency 等級」這種查詢在兩套詞彙下答不出一致的結果。 */
const URGENCY_CARD = new Set(["emergency", "urgent", "same_day", "routine"]);
const URGENCY_REGISTRY = new Set(["emergency_referral", "urgent_referral", "routine_referral"]);
const URGENCY = new Set([...URGENCY_CARD, ...URGENCY_REGISTRY]);

const defects = [];
let pass = 0;
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log("  ✓ " + name); }
  else { defects.push(name); console.log("  ⛔ " + name + " — " + detail); }
};

console.log("急症紅旗的兩種形狀 —— 渲染層必須兩種都認得\n");
console.log("R1/R2 資料層");

let strings = 0, objects = 0, unknown = 0, badUrgency = 0, cardStyle = 0, registryStyle = 0;
const unknownRows = [], urgencyRows = [];
for (const [label, rel] of LAYERS) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const d = JSON.parse(fs.readFileSync(p, "utf8").replace(/^﻿/, ""));
  const recs = d.records || d;
  if (!Array.isArray(recs)) continue;
  let ls = 0, lo = 0;
  for (const r of recs) for (const f of FIELDS) {
    for (const v of (Array.isArray(r[f]) ? r[f] : [])) {
      if (typeof v === "string") { strings++; ls++; continue; }
      if (v && typeof v === "object" && !Array.isArray(v) && String(v.finding || "").trim()) {
        objects++; lo++;
        if (v.urgency_level) {
          if (!URGENCY.has(v.urgency_level)) {
            badUrgency++; urgencyRows.push(`${label} ${r.name_zh || r.id}.${f}: urgency_level="${v.urgency_level}"`);
          } else if (URGENCY_REGISTRY.has(v.urgency_level)) registryStyle++;
          else cardStyle++;
        }
        continue;
      }
      unknown++;
      unknownRows.push(`${label} ${r.name_zh || r.id}.${f}: ${JSON.stringify(v).slice(0, 80)}`);
    }
  }
  if (ls || lo) console.log(`    ${label.padEnd(5)} 字串 ${String(ls).padStart(5)}  物件 ${String(lo).padStart(4)}`);
}
console.log(`    合計    字串 ${String(strings).padStart(5)}  物件 ${String(objects).padStart(4)}`);

check("R1 沒有第三種形狀", unknown === 0,
  `${unknown} 筆既不是字串也不是 {finding,…} —— 渲染層不會認得,會印成 [object Object] 或空白`);
if (unknown && WORKLIST) unknownRows.slice(0, 20).forEach((x) => console.log("      " + x));
console.log(`    urgency_level 兩套詞彙:卡片式 ${cardStyle} 筆 / registry 式 ${registryStyle} 筆(同一概念兩套,已列待裁)`);
check("R2 urgency_level 都在已知的兩套詞彙內", badUrgency === 0,
  `${badUrgency} 筆用了未登記的 urgency_level —— 分級標籤會靜靜不顯示`);
if (badUrgency && WORKLIST) urgencyRows.slice(0, 20).forEach((x) => console.log("      " + x));

console.log("\nR3 渲染層 —— 兩條紅旗路徑都要認得物件形狀");
/* 比對前先剝註解:上面的檔頭與 knowledge.js 的註解都逐字引述了壞字串,
 * 不剝會在乾淨的檔案上誤判(這個坑 2026-08-31 踩過一次)。 */
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const code = stripComments(src);

const rowsStart = code.indexOf("const redFlagRows");
const helperStart = code.indexOf("const RF_URGENCY_LABEL");
/* 切片要從輔助函式(rfText/rfTitle)開始 —— 它們定義在 redFlagRows **之前**,
 * 第一版從 `const redFlagRows` 切,把讀 finding 的那幾行切在外面,於是在
 * 已經修好的檔案上誤報「沒有讀 finding」。 */
const rowsBody = rowsStart >= 0
  ? code.slice(helperStart >= 0 && helperStart < rowsStart ? helperStart : rowsStart, rowsStart + 2600)
  : "";
check("R3a 找得到 redFlagRows", !!rowsBody,
  "js/knowledge.js 裡找不到 redFlagRows —— 函式被改名了,這支已經看不到真正的渲染路徑,請一併更新");
check("R3b 條件卡紅旗認得物件(有讀 finding)",
  !!rowsBody && /finding/.test(rowsBody),
  "redFlagRows 沒有讀 finding —— 物件形狀會印成 [object Object],137 張卡的急症紅旗會變成亂碼");

const patStart = code.indexOf("急症紅旗 Safety Red Flags");
const patBody = patStart >= 0 ? code.slice(Math.max(0, patStart - 200), patStart + 900) : "";
check("R3c 證型卡紅旗也認得物件",
  !!patBody && /finding/.test(patBody),
  "證型卡那條路徑直接 map(esc) —— 目前沒有物件形狀的證型紅旗,但同一個欄位,哪天有了就會印出亂碼");

console.log("");
console.log(defects.length
  ? `FAIL — ${defects.length} 個缺陷。`
  : `PASS — ${pass} 條全過:${strings} 筆字串 + ${objects} 筆物件,兩種形狀渲染層都認得。`);
process.exit(defects.length ? 1 : 0);
