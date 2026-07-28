#!/usr/bin/env node
/**
 * link-formula-family-back.js — give every derived formula a link to its base.
 *
 * Ting: 「原方」反向連結很需要.
 *
 * formula_family is written on the BASE formula (麻黃湯 lists 麻黃加朮湯,
 * 大青龍湯, 三拗湯, 華蓋散). Opening 大青龍湯 gave no hint that it is a
 * modification of 麻黃湯 — which is the single most useful thing to know about
 * it, and is examinable in its own right.
 *
 * So the base's own entry is mirrored onto the derived record as
 * `derived_from`, carrying the same `change` and the base's id. Nothing is
 * authored here: every field is copied from the base's entry, so the two can
 * never disagree, and re-running after the base changes simply re-syncs.
 *
 * Matching is by name_zh against the formula index; a derived formula that has
 * no record yet is reported, not invented.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");
const APPLY = process.argv.includes("--apply");

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = data.records || data;
const byName = new Map(recs.map((r) => [String(r.name_zh || "").trim(), r]));
const byId = new Map(recs.map((r) => [r.id, r]));

// Rebuild from scratch each run so a removed family entry does not leave a
// stale back-link behind.
for (const r of recs) if (r.derived_from) delete r.derived_from;

let linked = 0;
const missing = [];
for (const base of recs) {
  for (const fam of base.formula_family || []) {
    const target = (fam.formula_id && byId.get(fam.formula_id)) || byName.get(String(fam.name_zh || "").trim());
    if (!target) { missing.push(`${base.name_zh} → ${fam.name_zh || fam.formula_id}`); continue; }
    target.derived_from = {
      formula_id: base.id,
      name_zh: base.name_zh,
      relation: fam.relation || "",
      change: fam.change || [],
      indication_zh: fam.indication_zh || "",
      source: fam.source || ""
    };
    target.field_sources = target.field_sources || {};
    target.field_sources.derived_from = [fam.source || `由 ${base.name_zh} 的 formula_family 反向產生`];
    linked++;
  }
}

console.log(`原方反向連結 derived_from`);
console.log(`  建立 ${linked} 條`);
for (const r of recs) {
  if (!r.derived_from) continue;
  const d = r.derived_from;
  console.log(`    ${String(r.name_zh).padEnd(10)} ← ${d.relation} ${d.name_zh}  ${(d.change || []).join(" ")}`);
}
if (missing.length) {
  console.log(`\n  ⚠️ 家族裡提到但資料庫沒有的方 ${missing.length}（不憑空建立，等課件補）：`);
  missing.forEach((m) => console.log("    " + m));
}

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/formulas.json");
