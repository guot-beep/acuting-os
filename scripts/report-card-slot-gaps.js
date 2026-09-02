#!/usr/bin/env node
/**
 * report-card-slot-gaps.js — 依「渲染器實際讀什麼」量卡面空格,而不是依「資料欄位空不空」。
 *
 * 為什麼要這樣量(這個庫踩過三次的坑):
 *   1. `A || B` 二選一:`record.modern_applications_zh || record.treats_zh` —— treats_zh 空著
 *      不代表卡上是空的。用欄位空值去數缺口,會把填得好的卡算成缺口。
 *   2. 宣告了卻沒用:herbPanels 有 `const exam = record.english_exam_track || {}`,底下一個
 *      exam 欄位都沒讀 —— 那個欄位補得再滿,卡面一個字都不會多。
 *   3. 真正該問的問題是:**這張卡的這一格,使用者看不看得到東西**。
 *
 * 做法:解析 js/knowledge.js 裡每個 *Panels(record) 函式的函式體,抽出
 *   (a) 顯示槽:`const slot = ...record.a...record.b...`(含 ||、三元 fallback)→ 鏈上全空才算空格
 *   (b) 直印:`usableText(record.x)` / `cleanList(record.x)` 出現在函式體其他地方
 *   (c) 宣告後未使用的變數 → 標成 declared_unused(補了也不會上卡,fill 線不該碰)
 * 然後對每個卡種的資料檔數「幾張卡這一格是空的」。
 *
 * 用法:node scripts/report-card-slot-gaps.js [--json] [--panel herbPanels]
 * 這是報告型工具,永遠 exit 0;數字給人看、給派工單用,不當 gate。
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "js/knowledge.js");

/* 卡種 → 資料檔。build-data 合併過的 generated 不含全部欄位,這裡讀來源檔並排除退役卡。 */
const PANEL_DATA = {
  herbPanels: ["data/herbs/herb_canon_shortlist.json"],
  formulaPanels: ["data/herbs/formulas.json"],
  pharmPanels: ["data/pharmacology/drugs.json"],
};
/* 條件 / 證型 / 穴位卡的渲染在 app.js(不是 knowledge.js 的 *Panels),形狀不同,
 * 這支先不猜 —— 猜錯會產生一份看起來很有說服力卻全錯的缺口報表(這個庫踩過)。 */

function functionBody(src, name) {
  const start = src.indexOf(`function ${name}(record)`);
  if (start < 0) return null;
  let depth = 0, end = -1;
  for (let p = src.indexOf("{", start); p < src.length; p++) {
    if (src[p] === "{") depth++;
    else if (src[p] === "}") { depth--; if (!depth) { end = p; break; } }
  }
  return end < 0 ? null : src.slice(start, end);
}

/* 判「宣告了卻沒用」之前一定要先去掉註解:herbPanels 的註解裡就有「exam」這個字,
 * 第一版因此把「宣告後從未使用的 exam」算成有在用 —— 這個庫踩過同一個坑(R1f 假紅)。 */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
}

function analysePanel(rawBody) {
  const body = stripComments(rawBody);
  const lines = body.split("\n");
  const slots = [];
  const declared = [];
  for (const ln of lines) {
    const m = ln.match(/^\s*const\s+([A-Za-z_][\w]*)\s*=\s*(.+)$/);
    if (!m) continue;
    const chain = [...new Set([...m[2].matchAll(/record\.([A-Za-z_][\w]*)/g)].map((x) => x[1]))];
    if (chain.length) { slots.push({ slot: m[1], chain }); declared.push(m[1]); }
  }
  /* 宣告後有沒有被用到(排除宣告行本身)。
   * `\b${v}\b` 不夠:CSS 類名 "k-exam-badge" 會讓變數 exam 看起來有被用到(第二版的假陰性),
   * `record.exam_importance` 則靠 \w 邊界自己排除。所以比對「識別字位置」——
   * 前面不是 \w $ . -,後面不是 \w -。 */
  const unused = declared.filter((v) => {
    const uses = [...body.matchAll(new RegExp(`(?<![\\w$.-])${v}(?![\\w-])`, "g"))].length;
    const declLines = lines.filter((l) => new RegExp(`^\\s*const\\s+${v}\\s*=`).test(l)).length;
    return uses <= declLines;
  });
  // 直印(不在 const 鏈裡的單一來源)
  const inChains = new Set(slots.flatMap((s) => s.chain));
  const direct = [...new Set([...body.matchAll(/(?:usableText|cleanList)\(record\.([A-Za-z_][\w]*)/g)].map((x) => x[1]))]
    .filter((f) => !inChains.has(f));
  return { slots, unused, direct };
}

const isEmpty = (v) =>
  v === undefined || v === null ||
  (typeof v === "string" && !v.trim()) ||
  (Array.isArray(v) && v.filter((x) => x !== null && String(x).trim()).length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

function loadRecords(files) {
  for (const f of files) {
    const abs = path.join(ROOT, f);
    if (!fs.existsSync(abs)) continue;
    const j = JSON.parse(fs.readFileSync(abs, "utf8"));
    const recs = Array.isArray(j) ? j : (j.records || null);
    if (Array.isArray(recs)) return { file: f, records: recs.filter((r) => r && r.review_status !== "deprecated") };
  }
  return null;
}

function run(only) {
  const src = fs.readFileSync(SRC, "utf8");
  const out = {};
  for (const [panel, files] of Object.entries(PANEL_DATA)) {
    if (only && panel !== only) continue;
    const body = functionBody(src, panel);
    if (!body) { out[panel] = { error: "找不到這個 panel 函式" }; continue; }
    const data = loadRecords(files);
    if (!data) { out[panel] = { error: `找不到資料檔:${files.join(" / ")}` }; continue; }
    const { slots, unused, direct } = analysePanel(body);
    const unusedSet = new Set(unused);
    const rows = [];
    for (const s of slots) {
      const blank = data.records.filter((r) => s.chain.every((f) => isEmpty(r[f]))).length;
      rows.push({ slot: s.slot, chain: s.chain, blank, rendered: !unusedSet.has(s.slot) });
    }
    for (const f of direct) rows.push({ slot: `${f}(直印)`, chain: [f], blank: data.records.filter((r) => isEmpty(r[f])).length, rendered: true });
    rows.sort((a, b) => b.blank - a.blank);
    out[panel] = { file: data.file, cards: data.records.length, rows };
  }
  return out;
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  const only = argv.includes("--panel") ? argv[argv.indexOf("--panel") + 1] : null;
  const res = run(only);
  if (argv.includes("--json")) { console.log(JSON.stringify(res, null, 2)); process.exit(0); }
  for (const [panel, r] of Object.entries(res)) {
    if (r.error) { console.log(`\n== ${panel} — ${r.error}`); continue; }
    console.log(`\n== ${panel}  ${r.cards} 張在庫卡  (${r.file})`);
    const shown = r.rows.filter((x) => x.rendered && x.blank > 0);
    const dead = r.rows.filter((x) => !x.rendered);
    for (const x of shown.slice(0, 16)) {
      console.log(`  ${String(x.blank).padStart(4)}/${r.cards} 張空白  ${x.slot.padEnd(22)} ← ${x.chain.join(" || ")}`);
    }
    if (dead.length) {
      console.log(`  ── 宣告了卻沒印在卡上(補了也看不到,fill 線不要碰)──`);
      for (const x of dead) console.log(`       ${x.slot.padEnd(22)} ← ${x.chain.join(" || ")}`);
    }
  }
  console.log("\n注意:空白 = 這張卡的這一格在畫面上沒有東西(整條 fallback 鏈都空)。");
  console.log("有些空白是設計如此(那一區沒值就不出現);要當派工目標之前,先開一張卡用眼睛確認那格真的該有東西。");
  process.exit(0);
}
module.exports = { run, functionBody, analysePanel };
