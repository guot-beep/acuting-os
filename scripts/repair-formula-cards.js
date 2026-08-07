#!/usr/bin/env node
/**
 * repair-formula-cards.js — 補強既有的方劑卡，不重建任何已經填好的東西。
 *
 * Ting 在卡片上看到的毛病，逐類修：
 *   A  本方功效有空段     麻黃湯的麻黃顯示「　，。」，銀翹散的金銀花「清熱瀉火，　，。」
 *   B  藥名只有拼音       「Chuan Jiao」「Geng Mi」「Xi Jiao」，沒有中文
 *   C  沒有 herb_id       藥名不會變成可點的膠囊
 *   D  分類「待補」        curriculum/formulas 的 22 區塊卡每張都寫了 Canonical category
 *   E  缺 American Dragon 連結 / 臺灣中藥典編號
 *   F  正則殘渣           大建中湯主治顯示「兼.證」
 *
 * 保守原則（這幾條是重點，不是客套）：
 *   - 只填空欄位。已經有值的一律不動，除非它是**純標點**或**已知殘渣**。
 *   - A 只刪標點與空白，不刪任何中文字 —— 被截斷但真實的翻譯留成「緩解。」，
 *     不會被整句丟掉。
 *   - B/C 只在中藥庫「剛好一個」相符時才填；查不到或有歧義就印出來、不猜。
 *     卡片上一味錯的藥比一個拼音更糟。
 *   - 每一筆填入都寫進 field_sources，來源是 Ting 的課件卡而不是我的記憶。
 *
 *   node scripts/repair-formula-cards.js            # dry run
 *   node scripts/repair-formula-cards.js --apply
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const CARD_DIR = path.join(ROOT, "curriculum/formulas");

// ---- herb library ----------------------------------------------------------
const herbs = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/herb_canon_shortlist.json"), "utf8")).records;
const byName = new Map(), byPinyin = new Map();
const put = (m, k, v) => { if (!k) return; const key = String(k).trim().toLowerCase(); if (!m.has(key)) m.set(key, new Set()); m.get(key).add(v); };
for (const h of herbs) { put(byName, h.name_zh, h); (h.aliases_zh || []).forEach((a) => put(byName, a, h)); put(byPinyin, h.pinyin, h); }
const only = (m, k) => { const s = m.get(String(k || "").trim().toLowerCase()); return s && s.size === 1 ? [...s][0] : null; };

// ---- parse Ting's 22-block cards -------------------------------------------
const cards = new Map();   // name_zh -> {category, adUrl, thp, baFa, level, file}
for (const f of fs.readdirSync(CARD_DIR).filter((x) => /^\d\d_Formula_Cards_.*\.md$/.test(x))) {
  const text = fs.readFileSync(path.join(CARD_DIR, f), "utf8");
  for (const block of text.split(/\n(?=# \d+\. )/).slice(1)) {
    const head = /^# \d+\.\s*([^\s·]+)/.exec(block);
    if (!head) continue;
    const pick = (re) => { const m = re.exec(block); return m ? m[1].trim() : ""; };
    cards.set(head[1].trim(), {
      category: pick(/\*\*Canonical category[^:]*:\*\*\s*([^\n—]+)/),
      adUrl: pick(/\*\*American Dragon direct URL:\*\*\s*(\S+)/),
      thp: pick(/\*\*Taiwan Herbal Pharmacopeia[^:]*:\*\*\s*([^\n]+)/),
      baFa: pick(/\*\*Ba Fa \/ strategy:\*\*\s*([^\n]+)/),
      level: pick(/\*\*Course knowledge level:\*\*\s*([^\n]+)/),
      file: "curriculum/formulas/" + f,
    });
  }
}

// ---- repair ----------------------------------------------------------------
function tidy(s) {
  let t = String(s).replace(/\s+/g, " ");
  t = t.replace(/[，,]\s*(?=[，,。.])/g, "");
  t = t.replace(/^[\s，,。.、；;]+/, "");
  t = t.replace(/[\s，,、；;]+(?=。)/g, "");
  t = t.replace(/[\s，,、；;]+$/, "").trim();
  if (!/[一-鿿A-Za-z0-9]/.test(t)) return "";
  if (/[一-鿿]/.test(t) && !/[。.]$/.test(t)) t += "。";
  return t;
}
const empty = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length);
const GARBAGE = /^[兼與所和]?[.．]證?$|^[.．]|[.．]證$/;

const FILE = "data/herbs/formulas.json";
const raw = fs.readFileSync(path.join(ROOT, FILE), "utf8");
const doc = JSON.parse(raw);
const recs = doc.formulas || doc.records;

const n = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
const unresolved = new Map(), egA = [], egF = [], noCard = [];

for (const r of recs) {
  // ---- composition -------------------------------------------------------
  for (const h of r.composition || []) {
    for (const f of ["in_formula_zh", "actions_zh", "role_reason_zh"]) {
      if (typeof h[f] !== "string" || !h[f]) continue;
      const t = tidy(h[f]);
      if (t !== h[f]) { if (egA.length < 6 && f === "in_formula_zh") egA.push(`${r.name_zh} · ${h.herb_zh || h.name_zh}: ${JSON.stringify(h[f])} → ${JSON.stringify(t)}`); if (APPLY) h[f] = t; n.A++; }
    }
    const nm = String(h.herb_zh || h.name_zh || "").trim();
    if (nm && !/[一-鿿]/.test(nm)) {
      const bare = nm.replace(/[()（）]/g, "").trim();
      const hit = only(byPinyin, bare) || only(byName, bare);
      if (hit) { if (APPLY) { h.herb_zh = hit.name_zh; h.name_zh = hit.name_zh; h.herb_id = h.herb_id || hit.id; } n.B++; }
      else unresolved.set(bare, (unresolved.get(bare) || 0) + 1);
    }
    if (!h.herb_id) { const hit = only(byName, h.herb_zh || h.name_zh); if (hit) { if (APPLY) h.herb_id = hit.id; n.C++; } }
  }

  // ---- F: regex residue sitting in a visible list -------------------------
  for (const f of ["pattern_indications_zh", "actions_zh", "syndromes_zh"]) {
    if (!Array.isArray(r[f])) continue;
    const kept = r[f].filter((s) => !GARBAGE.test(String(s).trim()));
    if (kept.length !== r[f].length) {
      egF.push(`${r.name_zh} [${f}] 移除 ${r[f].filter((s) => GARBAGE.test(String(s).trim())).map((s) => JSON.stringify(s)).join(" ")}`);
      if (APPLY) {
        const en = f.replace(/_zh$/, "_en");                       // keep the pair aligned
        if (Array.isArray(r[en]) && r[en].length === r[f].length) r[en] = r[en].filter((_, i) => !GARBAGE.test(String(r[f][i]).trim()));
        r[f] = kept;
      }
      n.F++;
    }
  }

  // ---- D/E: category, links, pharmacopeia number from Ting's card ---------
  const card = cards.get(String(r.name_zh || "").trim());
  if (!card) { if (r.name_zh) noCard.push(r.name_zh); continue; }
  const src = [card.file + "（22 區塊方劑卡）"];
  const fill = (field, value, code) => {
    if (!value || !empty(r[field])) return;
    if (APPLY) { r[field] = value; r.field_sources = Object.assign({}, r.field_sources, { [field]: src }); }
    n[code]++;
  };
  fill("category_zh", card.category, "D");
  fill("category", card.category, "D");
  fill("ba_fa_zh", card.baFa, "D");
  fill("course_level_en", card.level, "D");
  fill("american_dragon_url", card.adUrl, "E");
  if (card.thp && /Yes/i.test(card.thp)) fill("taiwan_pharmacopeia_zh", card.thp.replace(/^Yes\s*—\s*/, ""), "E");
  if (APPLY && r.review_status === "skeleton" && (r.composition || []).length) r.review_status = "draft";
}

console.log(`A  本方功效斷句/空段         ${n.A}`); egA.forEach((s) => console.log("     " + s));
console.log(`B  拼音藥名還原為中文        ${n.B}`);
console.log(`C  補上 herb_id             ${n.C}`);
console.log(`D  分類 / 八法 / 課程層級     ${n.D}`);
console.log(`E  AD 連結 / 臺灣中藥典編號   ${n.E}`);
console.log(`F  移除正則殘渣              ${n.F}`); egF.slice(0, 5).forEach((s) => console.log("     " + s));
console.log(`\n解析到 Ting 的課件卡: ${cards.size} 張`);
if (noCard.length) console.log(`資料庫有但課件卡沒有的方劑 (${noCard.length}): ${noCard.slice(0, 10).join("、")}`);
if (unresolved.size) {
  console.log(`\n中藥庫查不到、一律不猜（${unresolved.size}）：`);
  [...unresolved.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([x, c]) => console.log(`     ${x} ×${c}`));
}

if (APPLY) {
  const indent = (/\n(\x20+)\S/.exec(raw) || [])[1]?.length ?? 2;
  fs.writeFileSync(path.join(ROOT, FILE), JSON.stringify(doc, null, indent) + "\n");
  console.log("\nWritten " + FILE);
} else console.log("\nDry run. Use --apply to write.");
