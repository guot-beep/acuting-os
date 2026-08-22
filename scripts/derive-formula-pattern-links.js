#!/usr/bin/env node
/**
 * derive-formula-pattern-links.js — §1 區塊 15 的證候連結層(formula → tcm_pattern_ids)。
 *
 * 模板(FORMULA_CARD_TEMPLATE §特性 D)定義的圖:
 *   方劑卡 ──syndromes_zh / pattern_indications_zh──→ 證候 canon
 * 這條線的資料一直只存在於中文證名字串裡,機器接不上,搜尋也跨不了卡。
 *
 * 這支腳本**只接線,不發明**:一條 tcm_pattern_ids 只在該方自己的
 * pattern_indications_zh / syndromes_zh 條目能對上
 *   (a) data/config/pattern_alias_map.json 的 alias(證型線維護的映射),或
 *   (b) data/pathology/pattern_registry.json 的 name_zh / aliases_zh
 * 時才寫入。對不上的字串原樣留著,不猜、不拆、不近似匹配。
 *
 * 正規化只做三件無語義損失的事:去尾字「證」、去全形括號註記、去空白。
 * 「兼」複合證**不拆開**:半個證名對上不代表整個複合證成立,寧缺勿濫。
 *
 * alias map 的 excluded_formula_patterns(Ting 2026-08-06 裁決的 catch-all 桶)
 * 永不寫入。
 *
 * 寫入是**併集**:既有 tcm_pattern_ids 一條不動,只新增。
 * field_sources.tcm_pattern_ids 記推導路徑,可重現、可稽核。
 *
 * 只信 pattern_indications_zh(模板 §1 區塊 6 的策展欄)。syndromes_zh 混有
 * CloudTCM 標籤殘留(至寶丹卡上掛著「大腸濕熱」這種),從那裡接線會把
 * 雜訊放大成圖上的邊——那些只進 review 報告,不寫入。
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

const fdoc = read("data/herbs/formulas.json");
const formulas = fdoc.records || Object.values(fdoc).find(Array.isArray);
const regDoc = read("data/pathology/pattern_registry.json");
const registry = Object.values(regDoc).find(Array.isArray);
const aliasDoc = read("data/config/pattern_alias_map.json");

const validIds = new Set(registry.map((p) => p.id));

// lookup: normalized zh name -> pattern id
const lookup = new Map();
const put = (name, id) => {
  if (!name || !validIds.has(id)) return;
  const key = norm(name);
  if (!key) return;
  // 同名指向不同 id = 歧義,整個 key 作廢(寧缺勿濫)
  if (lookup.has(key) && lookup.get(key) !== id) lookup.set(key, null);
  else lookup.set(key, id);
};

function norm(s) {
  return String(s)
    .replace(/（[^）]*）|\([^)]*\)/g, "")
    .replace(/\s+/g, "")
    .replace(/證$/, "");
}

for (const [alias, target] of Object.entries(aliasDoc.aliases || {})) {
  const id = typeof target === "string" ? target : target && target.pattern_id;
  put(alias.replace(/^pat\./, ""), id);
}
for (const p of registry) {
  put(p.name_zh, p.id);
  for (const a of p.aliases_zh || []) put(a, p.id);
}
// excluded catch-all buckets:哪怕 registry/alias 對得上也不寫
const excludedNames = new Set(
  (aliasDoc.excluded_formula_patterns || []).map((e) => norm(e.name_zh))
);

let touched = 0,
  linksAdded = 0,
  alreadyLinked = 0,
  unmatchedCount = new Map();

const syReview = [];
for (const f of formulas) {
  const texts = f.pattern_indications_zh || [];
  const syTexts = f.syndromes_zh || [];
  if (!texts.length && !syTexts.length) continue;
  const existing = new Set(f.tcm_pattern_ids || []);
  const add = new Set();
  for (const t of texts) {
    const key = norm(t);
    if (!key || excludedNames.has(key)) continue;
    const id = lookup.get(key);
    if (id === null || id === undefined) {
      if (id === undefined && key.length >= 3)
        unmatchedCount.set(key, (unmatchedCount.get(key) || 0) + 1);
      continue;
    }
    if (!existing.has(id)) add.add(id);
  }
  // syndromes_zh 對上的只進報告,不寫入
  for (const t of syTexts) {
    const key = norm(t);
    const id = key && !excludedNames.has(key) ? lookup.get(key) : undefined;
    if (id && !existing.has(id) && !add.has(id))
      syReview.push(`${f.id}  ${id}  ←syndromes_zh:「${t}」`);
  }
  if (existing.size) alreadyLinked++;
  if (!add.size) continue;
  touched++;
  linksAdded += add.size;
  if (APPLY) {
    f.tcm_pattern_ids = [...existing, ...add];
    f.field_sources = f.field_sources || {};
    const src =
      "derived: 本方 pattern_indications_zh 經 data/config/pattern_alias_map.json + data/pathology/pattern_registry.json name_zh 逐字對照(scripts/derive-formula-pattern-links.js,不拆複合證、不近似匹配、不用 syndromes_zh)";
    if (!f.field_sources.tcm_pattern_ids) f.field_sources.tcm_pattern_ids = [src];
  } else {
    console.log(
      `${f.id}  +[${[...add].join(", ")}]` +
        (existing.size ? `  (既有 ${existing.size} 條不動)` : "")
    );
  }
}

console.log(`\n可接線方劑: ${touched}  新增連結: ${linksAdded}  既有連結方劑: ${alreadyLinked}`);
const topUnmatched = [...unmatchedCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25);
console.log(`\n對不上的證名(前 25,原樣保留在文字欄位,不寫入):`);
for (const [k, n] of topUnmatched) console.log(`  ${n}×  ${k}`);

if (syReview.length) {
  console.log(`\nsyndromes_zh 可對上但不寫入(${syReview.length} 條,需人工覆核):`);
  for (const line of syReview) console.log("  " + line);
}

if (APPLY) {
  fs.writeFileSync(
    path.join(ROOT, "data/herbs/formulas.json"),
    JSON.stringify(fdoc, null, 2) + "\n",
    "utf8"
  );
  console.log("\nWROTE data/herbs/formulas.json");
} else {
  console.log("\nDRY RUN — 加 --apply 寫入。");
}
