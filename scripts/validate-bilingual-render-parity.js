#!/usr/bin/env node
/**
 * validate-bilingual-render-parity.js
 *
 * 同一張卡上,中文欄位有顯示、英文欄位沒有 —— 而畫面上沒有任何東西說明這件事。
 * 英文讀者以為自己看到的是完整的卡。
 *
 * 2026-08-12 一晚在六個地方撞到同一個形狀:
 *   cautions_en(361 穴逐穴警告)、part_used_en(126)、channels_en(87)、
 *   pao_zhi_notes_en(11)、summary_en(190 張條件卡)、coating(中文較少的反例)
 * 前面幾個是一個一個撞到的。這支把它變成可以一次問完的問題:
 *
 *   對每個有資料的 `X_en`,渲染程式有沒有引用它?它的 `X_zh` 有沒有被引用?
 *   只有 `_zh` 被引用 = 英文側缺口。
 *
 * 為什麼不直接比對「畫面上中英文長度」:那需要跑瀏覽器,而且拿不到「這個欄位
 * 本來就沒有英文」與「有英文但沒接上」的差別。這裡問的是後者,它才是缺陷。
 *
 * 分級:NOTE + 基線棘輪。歷史積欠可以留著,但不准再長 —— 新增一個
 * `X_en` 卻沒接上畫面,就會超過基線而紅。
 * 畢業條件:某一層降到 0 之後把它移進 BLOCKING_LAYERS。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const RENDER_SOURCES = ["app.js", "js/knowledge.js", "index.html", "scripts/build-data.js"];
const source = RENDER_SOURCES
  .map((f) => (fs.existsSync(path.join(ROOT, f)) ? fs.readFileSync(path.join(ROOT, f), "utf8") : ""))
  .join("\n");

const LAYERS = [
  ["361 經穴", "data/acupoints/361.json"],
  ["奇穴", "data/acupoints/extra_points.json"],
  ["方劑", "data/herbs/formulas.json"],
  ["中藥", "data/herbs/herb_canon_shortlist.json"],
  ["條件", "data/pathology/condition_canon_shortlist.json"],
  ["症狀", "data/symptoms/symptoms.json"],
  ["西藥", "data/pharmacology/drugs.json"],
];

/* 七層全部在 2026-08-12 當天降到 0,所以當天就畢業成 blocking —— 這正是檔頭寫的
 * 畢業條件。NOTE 級的用途是「歷史積欠不要逼人刪內容」,積欠清空之後留著 NOTE
 * 只是讓它有機會悄悄長回來。
 *
 * 這條規則現在是硬的:**新增一個有資料的 `X_en`,而畫面只讀 `X_zh`,CI 就紅**。
 * 要通過只有兩條路 —— 把英文接上畫面,或者確認它根本不該顯示(那就加進 IGNORE,
 * 並在 commit 說明為什麼那個欄位不是給讀者看的)。 */
const BLOCKING_LAYERS = new Set(["361 經穴", "奇穴", "方劑", "中藥", "條件", "症狀", "西藥"]);

// 基線:只能往下改。往上改要在同一個 commit 說明為什麼。
const BASELINE = { "361 經穴": 0, "奇穴": 0, "方劑": 0, "中藥": 0, "條件": 0, "症狀": 0, "西藥": 0 };

// 純粹的簿記/教學標記,不是讀者要看的內容。
const IGNORE = /^(.*_url|.*_ids|.*_id|board_.*|course_level_en|.*_status|.*_sha256|.*fetched_at|.*_source|_.*)$/;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const referenced = (field) => new RegExp('[."\'`]' + esc(field) + "\\b").test(source);
const nonEmpty = (v) =>
  v !== null && v !== undefined && v !== "" &&
  !(Array.isArray(v) && v.length === 0) &&
  !(typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

let blocking = 0;
const grew = [];
const worklist = process.argv.includes("--worklist");

console.log("bilingual render parity — 中文有顯示、英文沒有的欄位\n");
for (const [label, rel] of LAYERS) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const d = JSON.parse(fs.readFileSync(p, "utf8").replace(/^﻿/, ""));
  const recs = d.records || d;

  const counts = new Map();
  for (const r of recs) {
    for (const [k, v] of Object.entries(r || {})) {
      if (!/_en$/.test(k) || IGNORE.test(k)) continue;
      if (nonEmpty(v)) counts.set(k, (counts.get(k) || 0) + 1);
    }
  }

  const gaps = [];
  for (const [enField, n] of counts) {
    const zhField = enField.replace(/_en$/, "_zh");
    // 只有在中文那一側**確實有被渲染**時才算缺口 —— 兩邊都沒接是「整個欄位沒接」
    // (那是 audit-dark-fields 的題目),不是中英不對等。
    if (!referenced(zhField)) continue;
    if (referenced(enField)) continue;
    gaps.push([enField, n]);
  }
  gaps.sort((a, b) => b[1] - a[1]);

  const base = BASELINE[label];
  const isBlocking = BLOCKING_LAYERS.has(label);
  let mark = "";
  if (base != null) {
    if (gaps.length > base) { grew.push(`${label}: ${base} → ${gaps.length}`); mark = `  ⛔ 超過基線 ${base}`; }
    else if (gaps.length < base) mark = `  ✅ 低於基線 ${base}（請一併調降 BASELINE）`;
  }
  if (isBlocking) blocking += gaps.length;
  console.log(`  ${isBlocking ? "BLOCK" : "NOTE "} ${label.padEnd(10)} ${String(gaps.length).padStart(2)} 個英文缺口${mark}`);
  if (worklist && gaps.length) console.log("        " + gaps.map(([f, n]) => `${f}(${n})`).join(" · "));
}

if (grew.length) {
  blocking += grew.length;
  console.log(`\n⛔ 英文缺口變多了 —— 新增的 _en 欄位沒有接上畫面:`);
  for (const g of grew) console.log(`   ${g}`);
}
console.log(worklist ? "" : "\n提示:加 --worklist 列出欄位。");
console.log(blocking ? `\nFAIL — ${blocking} blocking defects.` : "\nPASS — no blocking defects.");
process.exit(blocking ? 1 : 0);
