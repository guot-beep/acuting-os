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

/* 巢狀路徑取值:"tcm_properties.part_used_zh" → r.tcm_properties?.part_used_zh */
function getPath(r, p) {
  return String(p).split(".").reduce((o, k) => ((o && typeof o === "object") ? o[k] : undefined), r);
}

function analysePanel(rawBody) {
  const body = stripComments(rawBody);
  const lines = body.split("\n");
  const slots = [];
  const declared = [];
  /* 容器別名:`const props = record.tcm_properties || {}`。
   * 2026-09-05 抓到的第四個坑:herbPanels 的藥用部位鏈是
   *   `(english && usableText(record.part_used_en)) || props.part_used_zh || usableText(record.part_used_en) || "待補"`
   * 之前只認 `record.x`,看不見 `props.part_used_zh`,把 176 張真空格報成 232 —— 多報 56 張,
   * 而那 56 張中文模式下卡上有字。派工單若照 232 派,會有 56 張「填了也看不出差別」。
   * 別名本身不是顯示槽(它是容器),但**宣告了卻沒用**的別名仍要報(exam 就是這樣被抓到的)。 */
  const aliases = {};
  for (const ln of lines) {
    const m = ln.match(/^\s*const\s+([A-Za-z_][\w]*)\s*=\s*(.+)$/);
    if (!m) continue;
    const am = m[2].match(/^record\.([A-Za-z_][\w]*)\s*\|\|\s*(?:\{\}|\[\])\s*;?\s*$/);
    if (am) { aliases[m[1]] = am[1]; declared.push(m[1]); continue; }
    const chain = [...new Set([...m[2].matchAll(/record\.([A-Za-z_][\w]*)/g)].map((x) => x[1]))];
    for (const [a, base] of Object.entries(aliases)) {
      for (const x of m[2].matchAll(new RegExp(`(?<![\\w$.])${a}\\.([A-Za-z_][\\w]*)`, "g"))) {
        const p = `${base}.${x[1]}`;
        if (!chain.includes(p)) chain.push(p);
      }
    }
    if (chain.length) { slots.push({ slot: m[1], chain }); declared.push(m[1]); }
  }
  /* 行內 || 鏈:不在 const 裡,而是寫在模板字串的佔位符中,例如 herbPanels 的使用部位:
   *   `${esc((english && usableText(record.part_used_en)) || props.part_used_zh || usableText(record.part_used_en) || "待補")}`
   * 之前只被「直印」規則抓到 record.part_used_en 一個來源,鏈上的 props.part_used_zh 看不見 → 232 對 176,多報 56 張。
   * herbPanels 裡這種行有 12 條。規則:同一行、含 ||、≥2 個來源 token = 一條鏈;
   * 先以 `${` / `}` 切段,免得同一行兩個不相干的佔位符被黏成一條。 */
  const aliasNames = Object.keys(aliases);
  const tokenRe = new RegExp(`(?<![\\w$.])(record${aliasNames.length ? "|" + aliasNames.join("|") : ""})\\.([A-Za-z_][\\w]*)`, "g");
  for (const ln of lines) {
    if (/^\s*const\s+/.test(ln) || !ln.includes("||")) continue;
    for (const seg of ln.split(/\$\{|\}/)) {
      if (!seg.includes("||")) continue;
      const toks = [...new Set([...seg.matchAll(tokenRe)].map((x) => (x[1] === "record" ? x[2] : `${aliases[x[1]]}.${x[2]}`)))];
      if (toks.length >= 2) slots.push({ slot: `inline:${toks[0]}`, chain: toks });
    }
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
  // 直印(不在 const 鏈裡的單一來源);別名路徑一樣算:usableText(props.x) → tcm_properties.x
  const inChains = new Set(slots.flatMap((s) => s.chain));
  const direct = [...new Set([
    ...[...body.matchAll(/(?:usableText|cleanList)\(record\.([A-Za-z_][\w]*)/g)].map((x) => x[1]),
    ...[...body.matchAll(/(?:usableText|cleanList)\(([A-Za-z_][\w]*)\.([A-Za-z_][\w]*)/g)]
      .filter((x) => aliases[x[1]]).map((x) => `${aliases[x[1]]}.${x[2]}`),
  ])].filter((f) => !inChains.has(f));
  return { slots, unused, direct, aliases };
}

/* --self-test:合成一段 panel,證明別名鏈會被解析、容器不當顯示槽、沒用到的別名仍會被報。
 * 這支是派工單的分母來源,量錯 = 派錯;所以它自己也要有負控。 */
function selfTest() {
  const body = `function testPanels(record) {
    const props = record.tcm_properties || {};
    const exam = record.english_exam_track || {};
    const part = (mode === "english" && usableText(record.part_used_en)) || props.part_used_zh || usableText(record.part_used_en) || "待補";
    out.push(esc(record.name_zh || props.alt_name || "—"));
    return part + usableText(record.other_field);
  }`;
  const { slots, unused, direct, aliases } = analysePanel(body);
  const part = slots.find((s) => s.slot === "part");
  const inl = slots.find((s) => s.slot === "inline:name_zh");
  const checks = [
    ["行內 || 鏈被抓成一條(含別名路徑)", !!inl && inl.chain.length === 2 && inl.chain.includes("tcm_properties.alt_name")],
    ["行內鏈的 token 不再被當直印", !direct.includes("name_zh")],
    ["別名被登記", aliases.props === "tcm_properties" && aliases.exam === "english_exam_track"],
    ["容器別名不是顯示槽", !slots.some((s) => s.slot === "props" || s.slot === "exam")],
    ["part 的鏈含別名路徑", !!part && part.chain.includes("tcm_properties.part_used_zh") && part.chain.includes("part_used_en")],
    ["沒用到的別名 exam 被報", unused.includes("exam")],
    ["用到的別名 props 不被報", !unused.includes("props")],
    ["直印欄位仍在", direct.includes("other_field")],
    ["巢狀取值", getPath({ tcm_properties: { part_used_zh: "根" } }, "tcm_properties.part_used_zh") === "根"],
    ["只有 props 有值的卡不算空格", !part.chain.every((f) => isEmpty(getPath({ tcm_properties: { part_used_zh: "根" } }, f)))],
    ["兩邊都空的卡算空格", part.chain.every((f) => isEmpty(getPath({ tcm_properties: {} }, f)))],
  ];
  let bad = 0;
  for (const [name, ok] of checks) { console.log(`  ${ok ? "✓" : "✗"} ${name}`); if (!ok) bad++; }
  console.log(bad ? `\nFAIL — self-test ${bad} 條` : `\nPASS — self-test ${checks.length} 條`);
  process.exit(bad ? 1 : 0);
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
    const { slots, unused, direct, aliases } = analysePanel(body);
    const unusedSet = new Set(unused);
    const rows = [];
    for (const s of slots) {
      const blank = data.records.filter((r) => s.chain.every((f) => isEmpty(getPath(r, f)))).length;
      rows.push({ slot: s.slot, chain: s.chain, blank, rendered: !unusedSet.has(s.slot) });
    }
    for (const f of direct) rows.push({ slot: `${f}(直印)`, chain: [f], blank: data.records.filter((r) => isEmpty(getPath(r, f))).length, rendered: true });
    // 宣告了卻沒用的容器別名(exam 那種):不是顯示槽,但要列在「補了也看不到」區,否則 fill 線會去填它
    for (const [a, base] of Object.entries(aliases)) {
      if (!unusedSet.has(a)) continue;
      rows.push({ slot: a, chain: [base], blank: data.records.filter((r) => isEmpty(getPath(r, base))).length, rendered: false });
    }
    rows.sort((a, b) => b.blank - a.blank);
    out[panel] = { file: data.file, cards: data.records.length, rows };
  }
  return out;
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.includes("--self-test")) selfTest();
  const only = argv.includes("--panel") ? argv[argv.indexOf("--panel") + 1] : null;
  const res = run(only);
  if (argv.includes("--json")) { console.log(JSON.stringify(res, null, 2)); process.exit(0); }
  for (const [panel, r] of Object.entries(res)) {
    if (r.error) { console.log(`\n== ${panel} — ${r.error}`); continue; }
    console.log(`\n== ${panel}  ${r.cards} 張在庫卡  (${r.file})`);
    const shown = r.rows.filter((x) => x.rendered && x.blank > 0);
    const dead = r.rows.filter((x) => !x.rendered);
    // 全印,不截:這份是派工單的分母來源。之前 slice(0,16) 把 176/360 的使用部位那列藏掉,
    // 讀報表的人以為那格沒缺口(2026-09-05)。列數多就多,靜靜少印比多印貴。
    for (const x of shown) {
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
