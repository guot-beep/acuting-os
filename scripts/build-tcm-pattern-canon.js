#!/usr/bin/env node
/**
 * build-tcm-pattern-canon.js — extract the 中醫證候 canon that already exists.
 *
 * Ting's plan is to link points to both 西醫病名 and 中醫證候, noting the pattern
 * canon "doesn't exist yet". It half does: condition_canon_shortlist carries a
 * tcm_patterns array on nearly every record, with the pattern name, its
 * representative formula, and its symptom list. 140 distinct patterns are in
 * there, unindexed — so nothing can point at them.
 *
 * This lifts them into data/config/tcm_pattern_canon.json with stable ids, so
 * acupoints and conditions have a shared vocabulary to join on. English names
 * are left empty on purpose: 140 translations invented without a source would
 * be exactly the fabricated provenance the herb cards were cleaned of. Ting
 * fills them as her 中醫/西醫 notes come in.
 *
 * A pattern named after its formula (當歸四逆湯證) is a 方證, not a 證候, and is
 * flagged rather than silently mixed in.
 *
 * Usage: node scripts/build-tcm-pattern-canon.js [--apply]
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "data/pathology/condition_canon_shortlist.json");
const OUT = path.join(ROOT, "data/config/tcm_pattern_canon.json");
const APPLY = process.argv.includes("--apply");

const raw = JSON.parse(fs.readFileSync(SRC, "utf8"));
const conds = raw.records || raw;

// id from the pattern name: stable, readable, and independent of ordering so
// re-running never renumbers anything already linked.
const slug = (s) => "pat." + String(s).replace(/[證症]$/, "").replace(/\s+/g, "");

const byName = new Map();
for (const c of conds) {
  for (const p of c.tcm_patterns || []) {
    const name = String(p.pattern_zh || "").trim();
    if (!name) continue;
    if (!byName.has(name)) {
      byName.set(name, {
        id: slug(name),
        name_zh: name,
        name_en: "",              // 待補 — no source to translate from yet
        aliases_zh: [],
        formula_zh: p.formula_zh || "",
        symptoms_zh: [],
        condition_ids: [],
        note: ""
      });
    }
    const e = byName.get(name);
    if (!e.formula_zh && p.formula_zh) e.formula_zh = p.formula_zh;
    if (c.id && !e.condition_ids.includes(c.id)) e.condition_ids.push(c.id);
    for (const s of p.symptoms_zh || []) {
      if (e.symptoms_zh.length < 12 && !e.symptoms_zh.includes(s)) e.symptoms_zh.push(s);
    }
  }
}

const records = [...byName.values()].sort((a, b) => b.condition_ids.length - a.condition_ids.length);

// 方證 vs 證候: a name ending in 湯證/散證/丸證 is the pattern of a formula, which
// belongs in the formula records, not in a syndrome vocabulary.
let flagged = 0;
for (const r of records) {
  if (/[湯散丸飲膏丹]證$/.test(r.name_zh)) {
    r.note = "方證（以方名命名），非標準證候 —— 待 Ting 決定是否改掛方劑";
    flagged++;
  }
}

const out = {
  _note: "中醫證候 canon。由 scripts/build-tcm-pattern-canon.js 從 data/pathology/condition_canon_shortlist.json 的 tcm_patterns 抽出，不要手改；要加證候先補來源資料再重跑。name_en 一律留空待補 —— 沒有來源就不翻譯。",
  _usage: "node scripts/build-tcm-pattern-canon.js --apply",
  generated_at: new Date().toISOString().slice(0, 10),
  source: "data/pathology/condition_canon_shortlist.json",
  count: records.length,
  records
};

console.log(`中醫證候 canon: ${records.length} 個證候，來自 ${conds.length} 筆病證`);
console.log(`  有代表方的       ${records.filter((r) => r.formula_zh).length}`);
console.log(`  有症狀清單的     ${records.filter((r) => r.symptoms_zh.length).length}`);
console.log(`  英文名待補       ${records.length}  (全部 — 無來源不翻譯)`);
console.log(`  ⚠️ 方證非證候     ${flagged}  (已標註，待 Ting 決定)`);
console.log("\n前 8 個（依關聯病證數）:");
records.slice(0, 8).forEach((r) => console.log(`  ${r.id.padEnd(16)} ${r.name_zh.padEnd(8)} ${String(r.condition_ids.length).padStart(3)} 病證  ${r.formula_zh || "—"}`));

if (!APPLY) {
  console.log("\n(dry run — pass --apply to write)");
  process.exit(0);
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`\nwritten: ${path.relative(ROOT, OUT)}`);
