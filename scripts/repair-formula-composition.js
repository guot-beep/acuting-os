#!/usr/bin/env node
/**
 * repair-formula-composition.js — fix what is visibly broken in the 組成 table,
 * without rebuilding anything that already works.
 *
 * These are the three defects Ting can see on a card today:
 *   A  in_formula_zh with empty segments — 麻黃湯's 麻黃 renders as 「　，。」 and
 *      銀翹散's 金銀花 as 「清熱瀉火，　，。」. A translation dropped a clause and
 *      left its punctuation behind.
 *   B  herb_zh holding romanized pinyin — 「Chuan Jiao」「Geng Mi」「Xi Jiao」 —
 *      so the herb shows no Chinese name.
 *   C  no herb_id, so the name never becomes a clickable herb chip.
 *
 * Deliberately conservative:
 *   - A only ever removes punctuation and whitespace. No Chinese character is
 *     deleted, so a truncated-but-real translation survives as 「緩解。」 rather
 *     than being thrown away. A field left with nothing but punctuation becomes
 *     empty, which renders as nothing instead of as 「，。」.
 *   - B/C only fill when the herb library gives exactly one match. Ambiguous or
 *     unknown names are printed and left alone — a wrong herb on a formula card
 *     is worse than a romanized one.
 *   - Nothing else in the record is touched.
 *
 *   node scripts/repair-formula-composition.js            # dry run
 *   node scripts/repair-formula-composition.js --apply
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const herbs = JSON.parse(fs.readFileSync(path.join(ROOT, "data/herbs/herb_canon_shortlist.json"), "utf8")).records;
const byName = new Map(), byPinyin = new Map();
const put = (m, k, v) => { if (!k) return; const key = String(k).trim().toLowerCase(); if (!m.has(key)) m.set(key, new Set()); m.get(key).add(v); };
for (const h of herbs) {
  put(byName, h.name_zh, h);
  for (const a of h.aliases_zh || []) put(byName, a, h);
  put(byPinyin, h.pinyin, h);
}
const only = (m, k) => { const s = m.get(String(k || "").trim().toLowerCase()); return s && s.size === 1 ? [...s][0] : null; };

const FILE = "data/herbs/formulas.json";
const raw = fs.readFileSync(path.join(ROOT, FILE), "utf8");
const doc = JSON.parse(raw);
const recs = doc.formulas || doc.records;

/** Collapse empty clauses. Only punctuation/whitespace is ever removed. */
function tidy(s) {
  let t = String(s).replace(/\s+/g, " ");
  t = t.replace(/[，,]\s*(?=[，,。.])/g, "");     // 「，　，。」 -> 「，。」
  t = t.replace(/^[\s，,。.、；;]+/, "");          // leading orphan punctuation
  t = t.replace(/[\s，,、；;]+(?=。)/g, "");       // 「緩解 ，。」 -> 「緩解。」
  t = t.replace(/[\s，,、；;]+$/, "");
  t = t.trim();
  if (!/[一-鿿A-Za-z0-9]/.test(t)) return "";   // punctuation only -> empty
  if (/[一-鿿]/.test(t) && !/[。.]$/.test(t)) t += "。";
  return t;
}

let fixedA = 0, fixedB = 0, fixedC = 0;
const unresolved = new Map(), samples = [];
for (const r of recs) {
  if (!Array.isArray(r.composition)) continue;
  for (const h of r.composition) {
    // A — punctuation-only damage
    for (const f of ["in_formula_zh", "actions_zh", "role_reason_zh"]) {
      if (typeof h[f] !== "string" || !h[f]) continue;
      const t = tidy(h[f]);
      if (t !== h[f]) {
        if (samples.length < 8 && f === "in_formula_zh") samples.push(`${r.name_zh} · ${h.herb_zh || h.name_zh}: ${JSON.stringify(h[f])} → ${JSON.stringify(t)}`);
        if (APPLY) h[f] = t;
        fixedA++;
      }
    }
    // B — romanized name, resolvable by pinyin (strip AD's parenthetical/處理前綴)
    const nm = String(h.herb_zh || h.name_zh || "").trim();
    if (nm && !/[一-鿿]/.test(nm)) {
      const bare = nm.replace(/[()（）]/g, "").trim();
      const hit = only(byPinyin, bare) || only(byName, bare);
      if (hit) { if (APPLY) { h.herb_zh = hit.name_zh; h.name_zh = hit.name_zh; h.herb_id = h.herb_id || hit.id; } fixedB++; }
      else unresolved.set(bare, (unresolved.get(bare) || 0) + 1);
    }
    // C — attach herb_id when the Chinese name matches exactly one library herb
    if (!h.herb_id) {
      const cur = String(h.herb_zh || h.name_zh || "").trim();
      const hit = only(byName, cur);
      if (hit) { if (APPLY) h.herb_id = hit.id; fixedC++; }
    }
  }
}

console.log(`A  本方功效斷句/空段修正        ${fixedA}`);
samples.forEach((s) => console.log("     " + s));
console.log(`B  拼音藥名還原為中文          ${fixedB}`);
console.log(`C  補上 herb_id（藥名可點）     ${fixedC}`);
if (unresolved.size) {
  console.log(`\n中藥庫查不到、一律不猜（${unresolved.size} 個名稱）：`);
  [...unresolved.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([n, c]) => console.log(`     ${n} ×${c}`));
}

if (APPLY) {
  const indent = (/\n(\x20+)\S/.exec(raw) || [])[1]?.length ?? 2;
  fs.writeFileSync(path.join(ROOT, FILE), JSON.stringify(doc, null, indent) + "\n");
  console.log("\nWritten " + FILE);
} else {
  console.log("\nDry run. Use --apply to write.");
}
