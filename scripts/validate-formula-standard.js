#!/usr/bin/env node
/**
 * validate-formula-standard.js — enforce docs/FORMULA_CARD_TEMPLATE.md.
 *
 * Third of the three card validators, same shape as validate-herb-standard
 * (E1–E9) and validate-acupoint-standard (A1–A9).
 *
 * BLOCKING (exit 1):
 *   F1 id / name_zh / pinyin missing
 *   F2 duplicate id
 *   F3 template-grade record's _zh field carries no Chinese at all
 *   F4 template-grade record's _en array is not index-aligned with its _zh
 *      (English would render against the wrong item — the defect that hit both
 *      the herb and the acupoint cards)
 *   F5 template-grade record missing an _en array
 *   F6 template-grade record has a composition entry with no herb_zh
 *   F7 template-grade record has no 君臣佐使, or names more than 2 君藥
 *   F8 template-grade record's actions_zh exceeds 8 items
 *   F9 fully-destroyed mojibake anywhere in the record — EVERY record, not
 *      just template-grade, because corrupt text is corrupt either way and it
 *      must never reach a card. Partially damaged text (a few characters lost,
 *      the rest readable) is a worklist note instead: §0 does not delete
 *      readable clinical content.
 *
 * F3/F4/F6 apply only to template-grade records on purpose. The imported
 * English is often a 2-item summary against a 50-item CloudTCM dump — those
 * were never meant to pair, and erroring on 58 of them would wedge the wall
 * over work nobody has claimed to do. Once a card is curated, pairing is the
 * whole contract.
 *
 * "Template grade" is field_sources.actions_zh specifically, NOT "has any
 * field_sources". Both sibling validators were broken once by the loose
 * definition — the herb one produced 755 errors when import provenance was
 * attached to 217 herbs, and the acupoint one 236 when exam stars were
 * written. Attaching a citation says where content came from, not that anyone
 * curated it.
 *
 * WORKLIST — `--worklist` lists the formula names behind the numbers.
 *   --category "<分類>"  only that batch
 *   --all               do not truncate
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");

const WORKLIST = process.argv.includes("--worklist");
const ALL = process.argv.includes("--all");
const catArg = (() => {
  const i = process.argv.indexOf("--category");
  return i > -1 ? process.argv[i + 1] : null;
})();

const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
const recs = data.records || data;

const arr = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]);
const hasHan = (s) => /[一-鿿]/.test(String(s));
const MOJIBAKE = /\?{4,}|�/;
// A string that is almost entirely question marks carries no information and
// must never reach a card. A string with a few characters lost is damaged but
// still readable, and §0 says readable content is not deleted — so that is a
// worklist item for manual repair, not a blocker.
const lostRatio = (s) => ((String(s).match(/[?�]/g) || []).length) / Math.max(1, String(s).length);
const FULLY_LOST = 0.8;

// Template grade = someone wrote where actions_zh came from.
const isTemplate = (r) => !!(r.field_sources && r.field_sources.actions_zh);

const errors = [];
const flags = new Map();
const flag = (r, msg) => {
  const k = r.id || r.name_zh;
  if (!flags.has(k)) flags.set(k, { name: r.name_zh, category: r.category || r.category_en || "", items: [] });
  flags.get(k).items.push(msg);
};

const seen = new Set();
const PAIRS = [
  ["actions_zh", "actions_en"],
  ["pattern_indications_zh", "pattern_indications_en"],
  ["modifications_zh", "modifications_en"],
  ["contraindications_zh", "contraindications_en"]
];

let nTemplate = 0, nRoles = 0, nMojibake = 0, nDamaged = 0, nComp = 0, nMisaligned = 0;

for (const r of recs) {
  const id = r.id || r.name_zh || "(no id)";

  // F1
  for (const f of ["id", "name_zh", "pinyin"]) {
    if (!String(r[f] || "").trim()) errors.push(`F1 ${id}: missing ${f}`);
  }
  // F2
  if (r.id) {
    if (seen.has(r.id)) errors.push(`F2 ${r.id}: duplicate id`);
    seen.add(r.id);
  }

  // F9 — every record. Corrupt text is corrupt regardless of curation state.
  const mojiFields = [], damagedFields = [];
  const walk = (o, p) => {
    if (typeof o === "string") {
      if (MOJIBAKE.test(o)) (lostRatio(o) >= FULLY_LOST ? mojiFields : damagedFields).push(p);
      return;
    }
    if (Array.isArray(o)) return o.forEach((v) => walk(v, `${p}[]`));
    if (o && typeof o === "object") for (const k of Object.keys(o)) walk(o[k], p ? `${p}.${k}` : k);
  };
  walk(r, "");
  if (mojiFields.length) {
    nMojibake++;
    const uniq = [...new Set(mojiFields)];
    errors.push(`F9 ${id}: 完全損毀的亂碼 in ${uniq.slice(0, 4).join(", ")}${uniq.length > 4 ? ` +${uniq.length - 4}` : ""}`);
    flag(r, `亂碼 ${uniq.slice(0, 3).join("、")}`);
  }
  if (damagedFields.length) {
    nDamaged++;
    flag(r, `缺字待修 ${[...new Set(damagedFields)].slice(0, 3).join("、")}`);
  }

  // F3 / F4 / F5
  for (const [zf, ef] of PAIRS) {
    const zh = arr(r[zf]), en = arr(r[ef]);
    if (zh.length && !zh.some(hasHan)) {
      flag(r, `${zf} 沒有中文`);
      if (isTemplate(r)) errors.push(`F3 ${id}: ${zf} has no Chinese`);
    }
    // The imported English is often a 2-item summary against a 50-item CloudTCM
    // dump — those were never meant to pair, so on an uncurated record this is
    // a note. Once someone curates the card, pairing is the whole contract.
    if (zh.length && en.length && zh.length !== en.length) {
      nMisaligned++;
      flag(r, `中英未對齊 ${ef} ${en.length} vs ${zh.length}`);
      if (isTemplate(r)) errors.push(`F4 ${id}: ${ef} (${en.length}) is not index-aligned with ${zf} (${zh.length}) — English would land on the wrong item`);
    }
    if (zh.length && !en.length) {
      flag(r, `缺英文 ${ef}`);
      if (isTemplate(r)) errors.push(`F5 ${id}: template-grade record is missing ${ef} (${zh.length} 中文, 0 English)`);
    }
  }

  // F6 — an ingredient with no name is not an ingredient.
  const comp = arr(r.composition);
  if (comp.length) nComp++;
  comp.forEach((c, i) => {
    if (String(c?.herb_zh || "").trim()) return;
    flag(r, `組成第 ${i + 1} 味沒有藥名`);
    if (isTemplate(r)) errors.push(`F6 ${id}: composition[${i}] has no herb_zh`);
  });
  if (!comp.length) flag(r, "缺組成 composition");

  // F7 — 君臣佐使 is the core of a formula card.
  const roles = comp.map((c) => String(c?.role_zh || c?.role || "").trim()).filter(Boolean);
  if (roles.length) nRoles++;
  else {
    flag(r, "缺君臣佐使");
    if (isTemplate(r)) errors.push(`F7 ${id}: template-grade record has no 君臣佐使 in composition`);
  }
  const chiefs = roles.filter((x) => /君|chief/i.test(x)).length;
  if (chiefs > 2) errors.push(`F7 ${id}: ${chiefs} 味君藥 — 君藥只能 1-2 味`);

  // F8 — the ceiling is the real rule; there is no floor, same as A6/E8.
  const na = arr(r.actions_zh).length;
  if (na > 8) {
    flag(r, `功效 ${na} 條(上限 8，目標 3-5)`);
    if (isTemplate(r)) errors.push(`F8 ${id}: actions_zh has ${na} items — condense to the 8 key actions`);
  }

  if (isTemplate(r)) nTemplate++;
  else flag(r, "尚未依模板整理(無 field_sources.actions_zh)");

  if (!arr(r.modifications_zh).length) flag(r, "缺加減變化");
  if (!String(r.source_classic || "").trim()) flag(r, "缺出典 source_classic");
  if (!arr(r.contraindications_zh).length) flag(r, "缺禁忌 contraindications_zh");
}

console.log(`validate-formula-standard: ${recs.length} formulas (${nTemplate} template-grade)\n`);
const pct = (n) => `${n}/${recs.length}`;
console.log(`  有組成 composition        ${pct(nComp)}`);
console.log(`  有君臣佐使                ${pct(nRoles)}`);
console.log(`  有加減變化                ${pct(recs.filter((r) => arr(r.modifications_zh).length).length)}`);
console.log(`  有出典                    ${pct(recs.filter((r) => r.source_classic).length)}`);
console.log(`  有禁忌                    ${pct(recs.filter((r) => arr(r.contraindications_zh).length).length)}`);
console.log(`  ⚠️ 完全損毀的亂碼         ${pct(nMojibake)}`);
console.log(`  ⚠️ 缺字待修(仍可讀)      ${pct(nDamaged)}`);
console.log(`  ⚠️ 中英未對齊             ${pct(nMisaligned)}`);

// The linking layer, reported but not blocking — same as the acupoint card.
const linked = recs.filter((r) => arr(r.related_conditions).length || arr(r.condition_links).length).length;
console.log(`\n連接層(待補不擋):`);
console.log(`  病證連結                  ${pct(linked)}`);
console.log(`  單味藥連結 herb_id        ${pct(recs.filter((r) => arr(r.composition).some((c) => c?.herb_id)).length)}`);

if (WORKLIST) {
  const rows = [...flags.values()].filter((f) => !catArg || f.category === catArg);
  const byCat = new Map();
  for (const f of rows) {
    if (!byCat.has(f.category)) byCat.set(f.category, []);
    byCat.get(f.category).push(f);
  }
  console.log(`\n===== 待整理清單 WORKLIST — ${rows.length} 方 =====`);
  for (const [cat, list] of [...byCat].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n## ${cat || "(未分類)"}  (${list.length} 方)`);
    for (const f of (ALL ? list : list.slice(0, 12))) {
      console.log(`  ${String(f.name).padEnd(12)} ${f.items.length} 項：${f.items.slice(0, 3).join("；")}`);
    }
    if (!ALL && list.length > 12) console.log(`  … 還有 ${list.length - 12} 方（--all 顯示全部）`);
  }
  console.log("\n用法：--category \"<分類>\" 只看一批；--all 顯示全部。批次順序見 docs/FORMULA_CARD_TEMPLATE.md §6。");
} else {
  console.log("\n提示：加 --worklist 列出每一個不合格的方劑（--category \"<分類>\" 看單一批次）。");
}

if (errors.length) {
  console.error(`\n❌ ${errors.length} blocking defect(s):\n`);
  errors.slice(0, ALL ? errors.length : 25).forEach((e) => console.error("  " + e));
  if (!ALL && errors.length > 25) console.error(`  … and ${errors.length - 25} more (--all)`);
  process.exit(1);
}
console.log("\nPASS — no blocking defects.");
