/* 方劑家族連結(formula_family ↔ derived_from)閘門(2026-09-09,審查 H5 / M1 / M5)
 *
 * derived_from 是 scripts/link-formula-family-back.js 從基方的 formula_family 反向產生、渲染成卡片頂端可點的「原方」連結。
 * 審查抓到:兩筆 derived_from 指向自己(基方把自己列在家族裡)、兩個衍生方被兩個基方認領而後寫蓋掉先寫,
 * 而 validate-rendered-reference-resolution 的欄位表沒有登記 derived_from,一路綠燈。這支守:
 *   1. derived_from.formula_id 必須存在、不是自己;
 *   2. 基方的 formula_family 必須真的列了這個衍生方(id 或 name_zh 對得上);
 *   3. formula_family 裡不准列自己;
 *   4. 一個衍生方被幾個基方認領 → 報數(不擋),讓雙重認領看得見。
 * 用法:node scripts/validate-formula-family-links.js [--self-test]
 */
"use strict";
const path = require("path");
const root = path.resolve(__dirname, "..");
const { loadKnowledge } = require(path.join(root, "scripts/lib/load-knowledge"));

function check(formulas) {
  const byId = new Map(formulas.map((f) => [f.id, f]));
  const byName = new Map(formulas.map((f) => [String(f.name_zh || "").trim(), f]));
  const failures = [], notes = [];
  const claims = new Map();
  for (const f of formulas) {
    for (const fam of f.formula_family || []) {
      const t = (fam.formula_id && byId.get(fam.formula_id)) || byName.get(String(fam.name_zh || "").trim());
      if (t && t.id === f.id) failures.push(`${f.id} 的 formula_family 列了自己(${JSON.stringify(fam.change || [])})`);
      if (t) claims.set(t.id, (claims.get(t.id) || []).concat(f.id));
    }
    const d = f.derived_from;
    if (!d) continue;
    if (!d.formula_id || !byId.has(d.formula_id)) { failures.push(`${f.id}.derived_from 指向不存在的 ${d.formula_id}`); continue; }
    if (d.formula_id === f.id) { failures.push(`${f.id}.derived_from 指向自己`); continue; }
    const base = byId.get(d.formula_id);
    const listed = (base.formula_family || []).some((fam) => (fam.formula_id && fam.formula_id === f.id) || String(fam.name_zh || "").trim() === String(f.name_zh || "").trim());
    if (!listed) failures.push(`${f.id}.derived_from 說來自 ${base.id},但 ${base.id} 的 formula_family 沒有列它`);
  }
  for (const [tid, bases] of claims) if (bases.length > 1) notes.push(`${tid} 被 ${bases.length} 個基方認領:${bases.join(", ")}(derived_from 只存一條:${(byId.get(tid).derived_from || {}).formula_id || "無"})`);
  return { failures, notes, derived: formulas.filter((f) => f.derived_from).length };
}

if (process.argv.includes("--self-test")) {
  const mk = (id, fam, d) => ({ id, name_zh: id, formula_family: fam || [], derived_from: d });
  const cases = [
    ["正常:基方列衍生方、衍生方指回基方", check([mk("formula.a", [{ formula_id: "formula.b" }]), mk("formula.b", [], { formula_id: "formula.a" })]).failures.length === 0],
    ["自指 derived_from 要紅", check([mk("formula.a", [], { formula_id: "formula.a" })]).failures.length === 1],
    ["formula_family 列自己要紅", check([mk("formula.a", [{ formula_id: "formula.a" }])]).failures.length === 1],
    ["derived_from 指到不存在的方要紅", check([mk("formula.a", [], { formula_id: "formula.zzz" })]).failures.length === 1],
    ["基方沒列它要紅", check([mk("formula.a", []), mk("formula.b", [], { formula_id: "formula.a" })]).failures.length === 1],
    ["雙重認領只報數不擋", (() => { const r = check([mk("formula.a", [{ formula_id: "formula.c" }]), mk("formula.b", [{ formula_id: "formula.c" }]), mk("formula.c", [], { formula_id: "formula.a" })]); return r.failures.length === 0 && r.notes.length === 1; })()]
  ];
  let bad = 0;
  for (const [label, ok] of cases) { console.log(`  ${ok ? "✓" : "✗"} ${label}`); if (!ok) bad++; }
  console.log(bad ? `\nFAIL — self-test ${bad} 條` : `\nPASS — self-test ${cases.length} 條`);
  process.exit(bad ? 1 : 0);
}

const K = loadKnowledge();
if (!K) { console.error("FAIL — 讀不到 data/generated 知識分片"); process.exit(1); }
const formulas = (K.formulas && K.formulas.records) || [];
if (!formulas.length) { console.error("FAIL — formulas 0 筆"); process.exit(1); }
const r = check(formulas);
console.log(`方劑家族連結:${formulas.length} 方 · derived_from ${r.derived} 筆 · 雙重認領 ${r.notes.length}`);
for (const f of r.failures) console.log(`  ✗ ${f}`);
for (const n of r.notes) console.log(`  ⚠ ${n}`);
console.log(r.failures.length ? `\nFAIL — ${r.failures.length} 條` : "\nPASS — derived_from 都指向存在的非自身基方,且基方的 formula_family 有列它。");
process.exit(r.failures.length ? 1 : 0);
