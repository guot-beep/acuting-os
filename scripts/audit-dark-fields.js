#!/usr/bin/env node
/**
 * audit-dark-fields.js — 哪些欄位有資料,但畫面從來不讀
 *
 * 2026-08-12 一個晚上撞到三次同一種缺陷:
 *   cautions_en                361 條逐穴安全警告,adapter 從未讀   (E3)
 *   herb_drug_interactions_en  17 張方劑卡的中西藥交互作用,0 次引用 (A0b)
 *   herb_formulas / acupoint_protocols  條件卡的處方欄,0 次引用
 * 前兩次是碰巧發現的。第三次讓我停下來問:還有幾個?
 *
 * 驗證器看不到這一類 —— 它們檢查資料,而這裡的資料是好的。壞的是「沒有人讀」。
 * 所以做法是反過來:列出資料裡真的有內容的欄位,再去渲染程式裡找它的名字。
 *
 * 已知限制,先寫在這裡免得被當成完整答案:
 *   - 動態存取(record[key]、Object.entries 迴圈)抓不到,會誤報成 dark。
 *     所以下面另外掃了動態存取樣式,命中的欄位標成 UNKNOWN 而不是 DARK。
 *   - 「被讀到」不等於「顯示得對」:E3 那次 adapter 讀的是 contraindications_en,
 *     欄位有被引用,顯示的卻是另一個欄位的通則句。這支只回答第一個問題。
 *
 * 用途是產生待查清單給人看,不是 CI 閘門 —— 所以永遠 exit 0。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
// build-data.js 也要算進來:它會在打包時改欄位名,渲染程式用的是新名字,
// 只掃渲染程式會把「被改名後正常顯示」的欄位誤報成 dark。
const RENDER_SOURCES = [
  "app.js", "js/knowledge.js", "js/clinical-store.js", "js/previsit-validator.js",
  "index.html", "scripts/build-data.js",
];

const LAYERS = [
  ["361 經穴", "data/acupoints/361.json"],
  ["奇穴", "data/acupoints/extra_points.json"],
  ["方劑", "data/herbs/formulas.json"],
  ["中藥", "data/herbs/herb_canon_shortlist.json"],
  ["條件", "data/pathology/condition_canon_shortlist.json"],
  ["證型", "data/pathology/pattern_library.json"],
  ["症狀", "data/symptoms/symptoms.json"],
  ["西藥", "data/pharmacology/drugs.json"],
];

const source = RENDER_SOURCES.map((f) => {
  const p = path.join(ROOT, f);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}).join("\n");

// 動態存取:有這些樣式時,欄位名可能是變數,靜態搜尋不可信。
const DYNAMIC = /\[\s*(?:key|k|field|f|name|prop)\s*\]|Object\.(keys|entries|values)\s*\(\s*(?:record|rec|r|card|item)\b/;
const hasDynamic = DYNAMIC.test(source);

// 這些是內部/系統欄位,不該期待它們出現在畫面上。
// 抓取時間戳、來源網址、內部旗標本來就不該上畫面 —— 留著它們只會把真正的
// 臨床欄位淹沒在雜訊裡。判準是「這個欄位是內容,還是關於內容的簿記」。
const IGNORE = /^(id|_.*|schema_version|source_type|source_urls|field_sources|review_status|last_reviewed|card_grade|public_safe|import_artifacts|correction_note|unsourced_claims_quarantine|entity_type|.*_status|.*_sha256|created_at|updated_at|.*fetched_at|.*_source|.*_source_url|source_hint|cloudtcm_id|draft_created|mojibake_repair|.*_verified_on)$/;

const load = (rel) => {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  try {
    const d = JSON.parse(fs.readFileSync(p, "utf8").replace(/^﻿/, ""));
    return d.records || (Array.isArray(d) ? d : null);
  } catch { return null; }
};

const nonEmpty = (v) =>
  v !== null && v !== undefined && v !== "" &&
  !(Array.isArray(v) && v.length === 0) &&
  !(typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0);

let totalDark = 0;
const report = [];

for (const [label, rel] of LAYERS) {
  const recs = load(rel);
  if (!recs) { report.push(`${label}: (讀不到 ${rel})`); continue; }
  const populated = new Map();
  for (const r of recs) {
    for (const [k, v] of Object.entries(r || {})) {
      if (IGNORE.test(k)) continue;
      if (nonEmpty(v)) populated.set(k, (populated.get(k) || 0) + 1);
    }
  }
  const dark = [];
  for (const [field, count] of populated) {
    // 欄位名出現在渲染程式裡就算「有讀到」。用引號/屬性存取兩種寫法找。
    const re = new RegExp(`[."'\`]${field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    if (!re.test(source)) dark.push([field, count]);
  }
  dark.sort((a, b) => b[1] - a[1]);
  totalDark += dark.length;
  report.push(`\n${label}  (${recs.length} 筆) — 有資料但畫面找不到引用的欄位:${dark.length}`);
  for (const [field, count] of dark.slice(0, 12)) {
    report.push(`   ${field.padEnd(34)} ${String(count).padStart(4)} 筆有值`);
  }
  if (dark.length > 12) report.push(`   …另外 ${dark.length - 12} 個`);
}

console.log("dark fields — 有內容但渲染程式沒有引用\n");
console.log(report.join("\n"));
console.log(`\n合計 ${totalDark} 個欄位。`);
if (hasDynamic) {
  console.log("\n⚠️  渲染程式有動態欄位存取(record[key] / Object.entries),");
  console.log("    所以上面有些欄位可能其實是被讀到的 —— 這份是待查清單,不是判決。");
}
console.log("逐一確認方式:開卡片、切中英文、用眼睛找那個欄位的內容。");
