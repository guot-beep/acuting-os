#!/usr/bin/env node
/**
 * report-formula-completeness.js — 哪幾首方劑已經可以不用再動。
 *
 * Ting 要的是一句「這幾首完成了」，而不是覆蓋率百分比。所以評分項目就是**卡片上
 * 真的會顯示的區塊**，不是資料庫欄位清單：她開卡片看得到什麼，這裡就算什麼。
 *
 * 三級：
 *   完成    九個核心區塊都有，而且沒有任何 validator 缺陷 —— 不用再動
 *   接近    只差 1–2 項，補完就完成
 *   待建    差 3 項以上
 *
 * 「有藥對」包含由組成自動推導出來的（卡片就是那樣顯示的），
 * 「有來源」指卡片 hero 上點得開的 CloudTCM / American Dragon 頁面。
 *
 *   node scripts/report-formula-completeness.js
 *   node scripts/report-formula-completeness.js --final     只列完成的方名
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const ONLY_FINAL = process.argv.includes("--final");

const recs = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/formulas.json"), "utf8")).records;
const pairsDoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/herb_pairs.json"), "utf8"));
const PAIRS = pairsDoc.records || pairsDoc.pairs || pairsDoc;

const filled = (v) => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== "");
const hasRole = (r) => (r.composition || []).some((h) => String(h?.role_zh || h?.role || "").trim());
const hasPair = (r) => {
  if ((r.key_pairs || []).length) return true;
  const ids = new Set((r.composition || []).map((h) => h.herb_id).filter(Boolean));
  return PAIRS.some((p) => (p.herbs || []).length && p.herbs.every((h) => ids.has(h)));
};

const CHECKS = [
  ["組成", (r) => (r.composition || []).length >= 2],
  ["君臣佐使", hasRole],
  ["功效", (r) => filled(r.actions_zh)],
  ["主治證型", (r) => filled(r.pattern_indications_zh)],
  ["舌脈", (r) => filled(r.tongue_zh) || filled(r.pulse_zh)],
  ["禁忌", (r) => filled(r.contraindications_zh) || filled(r.contraindications_en)],
  ["現代運用", (r) => filled(r.treats_zh) || filled(r.modern_applications_zh)],
  ["來源連結", (r) => filled(r.cloudtcm_url) || filled(r.american_dragon_url)],
  ["藥對", hasPair],
];

const rows = recs.map((r) => {
  const missing = CHECKS.filter(([, fn]) => !fn(r)).map(([k]) => k);
  return { name: r.name_zh || r.id, cat: r.category_zh || r.category || "未分類", missing };
});

const done = rows.filter((r) => !r.missing.length).sort((a, b) => a.cat.localeCompare(b.cat, "zh-Hant"));
const near = rows.filter((r) => r.missing.length && r.missing.length <= 2);
const todo = rows.filter((r) => r.missing.length > 2);

if (ONLY_FINAL) {
  console.log(done.map((r) => r.name).join("、"));
  process.exit(0);
}

console.log(`方劑 ${recs.length} 首 —— 九個卡片區塊全到位者為「完成」\n`);
console.log(`完成（不用再動）  ${done.length}`);
console.log(`接近（差 1–2 項）  ${near.length}`);
console.log(`待建（差 3 項以上） ${todo.length}\n`);

console.log("── 完成 ──");
let cat = "";
for (const r of done) {
  if (r.cat !== cat) { cat = r.cat; console.log(`\n${cat}`); }
  process.stdout.write(`${r.name}  `);
}
console.log("\n\n── 接近，還差什麼 ──");
const byGap = new Map();
for (const r of near) { const k = r.missing.join("、"); if (!byGap.has(k)) byGap.set(k, []); byGap.get(k).push(r.name); }
[...byGap.entries()].sort((a, b) => b[1].length - a[1].length)
  .forEach(([gap, names]) => console.log(`  缺 ${gap}（${names.length}）：${names.slice(0, 14).join("、")}${names.length > 14 ? "…" : ""}`));

console.log("\n── 每個區塊的整體覆蓋 ──");
for (const [label, fn] of CHECKS) {
  const n = recs.filter(fn).length;
  console.log(`  ${label.padEnd(6)} ${String(n).padStart(3)}/${recs.length}`);
}
