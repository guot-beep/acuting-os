#!/usr/bin/env node
/**
 * build-formula-action-profile.js — 從組成算出每個方的「功效組成」，供類方鑑別的雷達圖用。
 *
 * Ting: 「數縮到 8 根（用八法或功效大類），兩個方疊圖，放在『類方鑑別』那一區」
 *
 * CloudTCM 那張圖有 26 根軸，其中 20 根趨近於零 —— 4 個有意義的值被埋在一圈
 * 噪音裡，兩個方疊起來根本分不出差別。8 根軸不是簡化，是讓差異看得見。
 *
 * 這裡算的是**藥味的劑量佔比**，不是「這個方有多會清熱」的主觀評分：
 *
 *     每一味藥 → herb_canon_shortlist 的 category_zh（中藥分類）
 *                → formula_tag_glossary.action_groups 的 8 大類
 *     該類佔比 = 該類藥的煎劑克數 / 全方藥味總克數
 *
 * 所以麻黃湯 = 解表 56% (麻黃9+桂枝6) · 化痰止咳 33% (杏仁9) · 補虛 11% (甘草3)。
 * 每一個數字都追得回某一味藥的某一個劑量，沒有一格是判斷出來的。
 *
 * 三件事是刻意這樣做的：
 *
 *   分母用「藥味」不用「所有組成」—— 粳米、雞蛋、醋是食材輔料，不在中藥分類
 *     體系內。把它們算進分母，白虎湯會平白少掉一截。它們照樣留在組成表裡。
 *
 *   異寫要對照，不要漏掉 —— 組成寫「黃芪」而正名是「黃耆」、「橘皮」是
 *     「陳皮」、「三稜」是「三棱」。查不到就等於那味藥從圖上消失，而且
 *     **畫面上看不出來**（圖照樣畫得出來，只是少一塊）。所以查不到就 exit(1)。
 *
 *   只有一味藥的方不出圖 —— 這裡本來寫「少於 3 味不出圖」，但那會連六一散
 *     （滑石、甘草）、當歸補血湯、左金丸這三個**本來就只有兩味**的方一起擋掉。
 *     真正的問題不是味數少，是有 14 筆的組成是從方名前綴推出來的：
 *     大黃牡丹湯 → 只有「大黃」、葛根湯 → 只有「葛根」、人參敗毒散 → 只有
 *     「人參」。那是 §紅線3「不要從名字推測內容」在方劑組成裡的殘留。
 *     替一筆壞資料畫一張看起來很篤定的圖，比不畫更糟，所以這些不出圖，
 *     而且單獨列出來待修 —— 不要讓它安靜地混在「資料還沒補」裡面。
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");
const HERBS = path.join(ROOT, "data/herbs/herb_canon_shortlist.json");
const GLOSS = path.join(ROOT, "data/config/formula_tag_glossary.json");
const APPLY = process.argv.includes("--apply");

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = data.records || data;
const herbs = JSON.parse(fs.readFileSync(HERBS, "utf8")).records;
const g = JSON.parse(fs.readFileSync(GLOSS, "utf8"));

const AXES = Object.keys(g.action_groups);            // 固定 8 根，順序即畫圖順序
const MIN_HERBS = 2;   // 六一散、當歸補血湯、左金丸 本來就是兩味方

const catToAxis = new Map();
for (const [axis, def] of Object.entries(g.action_groups)) {
  for (const c of def.herb_categories) catToAxis.set(c, axis);
}
const byName = new Map(herbs.map((h) => [String(h.name_zh || "").trim(), h]));
const alias = g.herb_aliases || {};
const nonMedicinal = new Set(g.non_medicinal || []);

const fail = [];

// ── assert 0：對照表本身要站得住 ──
if (AXES.length !== 8) fail.push(`action_groups 有 ${AXES.length} 類，Ting 定的是 8 根軸`);
for (const [from, to] of Object.entries(alias)) {
  if (!byName.has(to)) fail.push(`herb_aliases: 「${from}」指向「${to}」，但正名表裡沒有「${to}」`);
  if (byName.has(from)) fail.push(`herb_aliases: 「${from}」本身就是正名，不該當異寫`);
}
for (const n of nonMedicinal) {
  if (byName.has(n)) fail.push(`non_medicinal 收了「${n}」，但它在中藥正名表裡 —— 會被錯誤地排除在分母外`);
}
// 同一個 category_zh 不能同時屬於兩根軸
const seenCat = new Map();
for (const [axis, def] of Object.entries(g.action_groups)) {
  for (const c of def.herb_categories) {
    if (seenCat.has(c)) fail.push(`分類「${c}」同時屬於「${seenCat.get(c)}」和「${axis}」`);
    seenCat.set(c, axis);
  }
}

const resolve = (name) => byName.get(name) || byName.get(alias[name] || "") || null;
const grams = (c) => {
  const raw = String(c.decoction_reference_g || c.dose_range || "");
  const m = /(\d+(?:\.\d+)?)/.exec(raw);
  return m ? parseFloat(m[1]) : 0;
};

let built = 0, skippedThin = 0, skippedNoComp = 0, countBasis = 0;
const thin = [], nameDerived = [], unmappedCat = new Map(), unknownHerb = new Map();

// 組成只有一味，而那一味正好是方名的開頭 → 幾乎確定是從名字推出來的，不是真組成
const looksNameDerived = (r, medicinal) =>
  medicinal.length === 1 &&
  String(r.name_zh || "").startsWith(String(medicinal[0].herb_zh || "").trim());

for (const r of recs) {
  const comp = Array.isArray(r.composition) ? r.composition : [];
  if (!comp.length) { delete r.action_profile; skippedNoComp++; continue; }

  // 藥味 = 組成扣掉食材輔料
  const medicinal = comp.filter((c) => {
    const n = String(c.herb_zh || "").trim();
    return n && !nonMedicinal.has(n);
  });

  if (medicinal.length < MIN_HERBS) {
    delete r.action_profile;
    skippedThin++;
    (looksNameDerived(r, medicinal) ? nameDerived : thin)
      .push(`${r.name_zh}→${medicinal.map((c) => c.herb_zh).join("、") || "空"}`);
    continue;
  }

  // 劑量是首選；整方都沒標劑量時退回等權重，並在資料裡註明是哪一種
  const doses = medicinal.map(grams);
  const basis = doses.some((d) => d > 0) ? "decoction_g" : "count";
  if (basis === "count") countBasis++;

  const groups = {}, groupHerbs = {};
  let total = 0;
  for (let i = 0; i < medicinal.length; i++) {
    const name = String(medicinal[i].herb_zh || "").trim();
    const h = resolve(name);
    if (!h) { unknownHerb.set(name, (unknownHerb.get(name) || 0) + 1); continue; }
    const cat = h.category_zh;
    if (!cat) { unknownHerb.set(`${name}(無分類)`, 1); continue; }
    const axis = catToAxis.get(cat);
    if (!axis) { unmappedCat.set(cat, (unmappedCat.get(cat) || 0) + 1); continue; }
    const w = basis === "decoction_g" ? (doses[i] || 0) : 1;
    if (!w) continue;
    groups[axis] = +((groups[axis] || 0) + w).toFixed(3);
    total = +(total + w).toFixed(3);
    // 每一根軸都要能點回它是由哪幾味藥、各幾克堆出來的。圖上的數字不可以
    // 是一個查不到出處的分數 —— hover 就看得到 "解表 56%｜麻黃 9g、桂枝 6g"。
    (groupHerbs[axis] = groupHerbs[axis] || []).push(
      basis === "decoction_g" ? `${h.name_zh} ${doses[i]}g` : h.name_zh
    );
  }

  if (!total) { delete r.action_profile; skippedThin++; thin.push(`${r.name_zh}(無可用劑量)`); continue; }

  r.action_profile = {
    basis,
    total_g: total,
    herb_count: medicinal.length,
    groups_g: Object.fromEntries(AXES.filter((a) => groups[a]).map((a) => [a, groups[a]])),
    groups_herbs: Object.fromEntries(AXES.filter((a) => groups[a]).map((a) => [a, groupHerbs[a]])),
  };
  built++;
}

// ── assert 1：沒有任何一味藥、任何一個分類默默消失 ──
if (unknownHerb.size) {
  fail.push(`有 ${unknownHerb.size} 個藥名對不到正名表（會從圖上消失且看不出來）：`
    + [...unknownHerb].map(([k, v]) => `${k}×${v}`).join("、")
    + " —— 是異寫就加進 formula_tag_glossary.herb_aliases，是食材就加進 non_medicinal");
}
if (unmappedCat.size) {
  fail.push(`有 ${unmappedCat.size} 個中藥分類不屬於任何一根軸：`
    + [...unmappedCat].map(([k, v]) => `${k}×${v}`).join("、")
    + " —— 併進既有的 8 類（不要加第 9 根軸）");
}

// ── assert 2：每一張圖的各段加起來要等於總量 ──
for (const r of recs) {
  const p = r.action_profile;
  if (!p) continue;
  const sum = +Object.values(p.groups_g).reduce((a, b) => a + b, 0).toFixed(3);
  if (Math.abs(sum - p.total_g) > 0.01) fail.push(`${r.name_zh}: 各類合計 ${sum} ≠ total_g ${p.total_g}`);
  for (const k of Object.keys(p.groups_g)) {
    if (!AXES.includes(k)) fail.push(`${r.name_zh}: 「${k}」不是 8 根軸之一`);
    // hover 顯示的藥味加起來必須等於那根軸的長度，否則圖上的數字說一套、
    // 點開的出處說另一套 —— 而畫面上兩邊都有內容，看不出來。
    const listed = (p.groups_herbs[k] || []);
    if (!listed.length) fail.push(`${r.name_zh}: 「${k}」有 ${p.groups_g[k]}g 卻沒列出是哪幾味藥`);
    if (p.basis === "decoction_g") {
      const sum = +listed.reduce((a, s) => a + (parseFloat(/(\d+(?:\.\d+)?)g$/.exec(s)?.[1]) || 0), 0).toFixed(3);
      if (Math.abs(sum - p.groups_g[k]) > 0.01) {
        fail.push(`${r.name_zh}「${k}」: 列出的藥味合計 ${sum}g ≠ 軸長 ${p.groups_g[k]}g`);
      }
    }
  }
  for (const k of Object.keys(p.groups_herbs)) {
    if (!(k in p.groups_g)) fail.push(`${r.name_zh}: groups_herbs 有「${k}」但 groups_g 沒有`);
  }
  if (!p.total_g || p.total_g < 0) fail.push(`${r.name_zh}: total_g = ${p.total_g}`);
}

console.log("方劑功效組成（雷達圖資料）");
console.log(`  8 根軸：${AXES.join(" · ")}`);
console.log(`  有圖可畫      ${built}/${recs.length}`);
console.log(`  沒有組成      ${skippedNoComp}`);
console.log(`  組成太薄不畫  ${skippedThin}`);
console.log(`  用味數當權重  ${countBasis}（整方沒有標劑量）`);

if (nameDerived.length) {
  console.log(`\n  ⚠️ 組成疑似從方名推出來的（${nameDerived.length}）—— 這是資料要修，不是圖的問題：`);
  console.log("    " + nameDerived.join("  "));
  console.log("    ↑ 只有一味，而那一味正好是方名開頭。§紅線3 在方劑組成裡的殘留。");
}
if (thin.length) {
  console.log(`\n  組成不足 ${MIN_HERBS} 味、暫不出圖（${thin.length}）：`);
  console.log("    " + thin.join("  "));
}

const sample = recs.find((r) => r.name_zh === "麻黃湯");
if (sample && sample.action_profile) {
  const p = sample.action_profile;
  console.log(`\n  抽驗 麻黃湯（${p.herb_count} 味，共 ${p.total_g}g）：`);
  for (const [k, v] of Object.entries(p.groups_g)) {
    console.log(`    ${k.padEnd(6, "　")} ${String(v).padStart(5)}g  ${((v / p.total_g) * 100).toFixed(0)}%`);
  }
}

if (fail.length) {
  console.error(`\n❌ ${fail.length} 項不通過 —— 不寫入`);
  fail.forEach((f) => console.error("  " + f));
  process.exit(1);
}
console.log("\n✅ 每一味藥都歸到某一根軸；各類合計 = 總量；沒有第 9 根軸");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/formulas.json");
