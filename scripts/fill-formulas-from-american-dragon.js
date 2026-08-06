// Fill formula cards from the American Dragon harvest.
//
// MECHANICAL ONLY (AI_CONSTITUTION §E2). This writes fields that are a
// transcription of a named source and can be checked against it:
//   composition[].dose_range      AD dose column
//   composition[].in_formula_en   AD per-herb "Actions" cell
//   tongue_en / pulse_en          AD "T:" / "C:" / "P:"
//   applications_en               AD TREATS
//   modifications_en              AD MODIFICATIONS
//   contraindications_en          AD CONTRAINDICATIONS
//
// It does NOT write:
//   君臣佐使   AD has no rank column — roles come from the course Rank tables
//   any _zh    translating is judgement; half-translating is lesson 6
//   doses onto herbs it could not match by name — a dose on the wrong herb is
//              worse than no dose
//
// F4 is enforced the hard way: an _en array is written only when the matching
// _zh already has the same number of entries, or when no _zh exists at all.
// Anything else is skipped and counted, never padded to fit.
const fs = require("fs");

const HARVEST = "data/imports/american_dragon/american_dragon_formula_harvest.json";
const FILE = "data/herbs/formulas.json";
const AD_NOTE = "American Dragon formula page (harvested 2026-08, scripts/harvest-american-dragon-formulas.js)";

const harvest = JSON.parse(fs.readFileSync(HARVEST, "utf8")).records;
const raw = fs.readFileSync(FILE, "utf8");
const doc = JSON.parse(raw);
const trailer = raw.endsWith("\n") ? "\n" : "";
if (JSON.stringify(JSON.parse(raw), null, 2) + trailer !== raw) {
  console.error("REFUSING — re-serialising would reformat the file"); process.exit(1);
}

// pinyin -> 中文, built from the herb canon so a dose can only land on a herb
// this repo actually knows about (F12's contract, applied before the fact).
const herbCanon = JSON.parse(fs.readFileSync("data/herbs/herb_canon_shortlist.json", "utf8")).records;
const key = (s) => String(s || "").toLowerCase().replace(/[^a-z]/g, "");
const byPinyin = new Map();
for (const h of herbCanon) {
  for (const k of [h.pinyin, h.name_en, ...(h.aliases_zh || [])]) {
    const kk = key(k);
    if (kk && !byPinyin.has(kk)) byPinyin.set(kk, h.name_zh);
  }
}
const zhOf = new Set(herbCanon.map((h) => h.name_zh));

// AD writes list sections as newline-separated items with stray blank lines.
const lines = (s, cap = 24) => String(s || "").split("\n")
  .map((x) => x.replace(/^[•\-–\s]+/, "").trim())
  .filter((x) => x.length > 2 && x.length < 200 && !/^\+?\s*$/.test(x))
  .slice(0, cap);

const before = new Map(doc.records.map((r) => [r.id, JSON.stringify(r)]));
const report = [];

for (const [id, ad] of Object.entries(harvest)) {
  const r = doc.records.find((x) => x.id === id);
  if (!r || ad.error) { report.push({ id, skipped: "no record or harvest error" }); continue; }
  const did = [], skipped = [];

  // ---- composition: dose + in-formula action, matched by name ---------------
  const comp = Array.isArray(r.composition) ? r.composition : [];
  let dosed = 0, acted = 0, unmatched = [];
  for (const adh of ad.herbs || []) {
    const zh = byPinyin.get(key(adh.pinyin));
    if (!zh) { unmatched.push(adh.pinyin); continue; }
    const c = comp.find((x) => x.herb_zh === zh);
    if (!c) { unmatched.push(adh.pinyin + "(不在本方組成)"); continue; }
    if (!c.dose_range && adh.dose) { c.dose_range = adh.dose + "（AD）"; dosed++; }
    if (!c.in_formula_en && adh.actions) { c.in_formula_en = adh.actions; acted++; }
  }
  if (dosed) did.push(`dose_range +${dosed}`);
  if (acted) did.push(`in_formula_en +${acted}`);
  if (unmatched.length) skipped.push(`未對上 ${unmatched.length} 味: ${unmatched.slice(0, 3).join("/")}`);

  // ---- tongue / pulse (English only; the 中文 layer is the course's job) -----
  const tongueEn = [ad.tongue, ad.coating && `coating: ${ad.coating}`].filter(Boolean).join("; ");
  if (tongueEn && !r.tongue_en) { r.tongue_en = tongueEn; did.push("tongue_en"); }
  if (ad.pulse && !r.pulse_en) { r.pulse_en = ad.pulse; did.push("pulse_en"); }

  // ---- list sections, F4-guarded -------------------------------------------
  const put = (enField, zhField, items, label) => {
    if (!items.length || (r[enField] || []).length) return;
    const zh = Array.isArray(r[zhField]) ? r[zhField] : [];
    if (zh.length && zh.length !== items.length) {
      skipped.push(`${label} F4 ${zh.length}zh vs ${items.length}en`);
      return;
    }
    r[enField] = items;
    did.push(`${enField} ${items.length}`);
  };
  put("applications_en", "applications_zh", lines(ad.treats), "applications");
  put("modifications_en", "modifications_zh", lines(ad.modifications), "modifications");
  put("contraindications_en", "contraindications_zh", lines(ad.contraindications), "contraindications");
  put("actions_en", "actions_zh", lines(ad.formula_actions, 8), "actions");
  put("pattern_indications_en", "pattern_indications_zh", lines(ad.syndromes, 8), "indications");

  if (did.length) {
    r.field_sources = r.field_sources || {};
    for (const f of ["applications_en", "modifications_en", "contraindications_en",
      "actions_en", "pattern_indications_en", "tongue_en", "pulse_en"]) {
      if (did.some((d) => d.startsWith(f))) r.field_sources[f] = [AD_NOTE];
    }
    if (dosed || acted) r.field_sources.composition = [...new Set([...(r.field_sources.composition || []), AD_NOTE])];
  }
  report.push({ id: id.replace("formula.", ""), did, skipped });
}

// §0 guard: nothing may shrink or vanish.
const problems = [];
for (const r of doc.records) {
  const b = JSON.parse(before.get(r.id));
  for (const k of Object.keys(b)) {
    if (!(k in r)) { problems.push(`${r.id}.${k} disappeared`); continue; }
    if (k === "field_sources" || k === "composition") continue;
    if (JSON.stringify(r[k]).length < JSON.stringify(b[k]).length) problems.push(`${r.id}.${k} SHRANK`);
  }
  const bc = b.composition || [], rc = r.composition || [];
  if (rc.length < bc.length) problems.push(`${r.id}.composition lost herbs`);
}
if (problems.length) { console.error("REFUSING:\n  " + problems.slice(0, 10).join("\n  ")); process.exit(1); }

fs.writeFileSync(FILE, JSON.stringify(doc, null, 2) + trailer);
const touched = report.filter((x) => x.did && x.did.length);
console.log(`filled ${touched.length}/${report.length} formulas\n`);
for (const x of report) {
  if (!x.did || !x.did.length) { console.log(`  —  ${x.id}  ${x.skipped ? x.skipped.join("; ") : x.skipped || ""}`); continue; }
  console.log(`  ✓  ${String(x.id).padEnd(24)} ${x.did.join(", ")}`);
  if (x.skipped.length) console.log(`     skip: ${x.skipped.join("; ")}`);
}
