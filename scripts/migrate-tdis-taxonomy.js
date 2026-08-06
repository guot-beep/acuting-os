#!/usr/bin/env node
/**
 * migrate-tdis-taxonomy.js — split tdis_registry's `classical_source_hint`
 * into `taxonomy_id` + `classical_source` (docs/TDIS_CARD_TEMPLATE.md §2).
 *
 * The one field currently holds three different kinds of thing, which is why
 * 75 records spell one taxonomy 22 ways:
 *
 *   中醫內科學·脾胃    a 科別+系 CATEGORY        -> taxonomy_id
 *   金匱要略·婦人      a CLASSICAL SOURCE        -> classical_source
 *   針灸治療學         a textbook the name came  -> neither; the disease has to
 *                     from, not a category         be classified on its own terms
 *
 * Only the unambiguous chapter->leaf mappings are applied. Three groups are
 * deliberately left for a human/fill pass, because assigning them is a
 * clinical judgement and a wrong one is invisible afterwards:
 *
 *   針灸治療學 (5)   面癱 落枕 肩凝症 牙痛 面痛 — each belongs to a different
 *                    branch (經絡肢體 / 骨傷 / 口腔 / …). Guessing here would
 *                    file 牙痛 under acupuncture-textbook forever.
 *   中醫內科學 (2)   梅核氣 肥胖 — chapter given without a system.
 *   split hints      中醫內科學·氣血津液/腦系 (頭痛), 中醫兒科/內科 (遺尿) —
 *                    the source itself records two homes; picking one silently
 *                    is exactly the "record the disagreement" rule inverted.
 *
 * Move first, then delete (§0): classical_source_hint is only removed once its
 * content has landed in the new fields. Records left unmapped KEEP the old
 * field so nothing is lost — they simply stay on the T10 worklist.
 *
 *   node scripts/migrate-tdis-taxonomy.js            # dry run
 *   node scripts/migrate-tdis-taxonomy.js --write
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REGISTRY = "data/pathology/tdis_registry.json";

// Unambiguous chapter -> taxonomy leaf. Every one of these is a 1:1 restatement
// of the same system in the controlled vocabulary, not a reclassification.
const HINT_TO_LEAF = {
  "中醫內科學·肺系": "tdx.internal_medicine.respiratory_system_disorders",
  "中醫內科學·脾胃": "tdx.internal_medicine.spleen_stomach_gastrointestinal",
  "中醫內科學·腎系": "tdx.internal_medicine.kidney_genitourinary_disorders",
  "中醫內科學·心系": "tdx.internal_medicine.cardiovascular_neuropsychiatric_disorders",
  "中醫內科學·肝膽": "tdx.internal_medicine.liver_gallbladder_disorders",
  "中醫內科學·氣血津液": "tdx.internal_medicine.qi_blood_body",
  "中醫內科學·肢體經絡": "tdx.internal_medicine.channel_limb_neuromuscular",
  // 腦系 has no counterpart leaf in the captured taxonomy; the 知源 tree files
  // 眩暈/中風/顫證 under 內科·肝膽病症 and the neuro ones under 經絡肢體病症.
  // Both are defensible, so this one is NOT auto-assigned — see UNMAPPED below.
  "中醫外科學·皮膚": "tdx.surgery_dermatology.dermatologic_disorders",
  "中醫耳鼻喉科": null,          // needs nose/ear/throat leaf — per-record
  "中醫眼科": "tdx.ophthalmology.general",
  "中醫口腔科": "tdx.stomatology.general",
  "中醫男科": "tdx.andrology.general",
  "中醫傷科學": "tdx.orthopedics_traumatology.limb_joint_disorders",
};

// Hints whose 科別 part maps but which also carry a classical source.
const HINT_TO_SOURCE = {
  "金匱要略": "金匱要略",
  "金匱要略·婦人": "金匱要略·婦人病脈證并治",
};

// 婦科 needs a sub-branch per disease; assign from the disease name where the
// 知源 taxonomy is unambiguous about it.
const GYN_LEAF = [
  [/^(痛經|月經先期|月經後期|月經過多|月經過少|崩漏|閉經|絕經前後諸證)$/, "tdx.gynecology_obstetrics.menstrual_disorders"],
  [/^帶下病$/, "tdx.gynecology_obstetrics.leukorrhea_disorders"],
  [/^(妊娠惡阻|胎位不正)$/, "tdx.gynecology_obstetrics.pregnancy_disorders"],
  [/^缺乳$/, "tdx.gynecology_obstetrics.postpartum_disorders"],
  [/^(不孕|癥瘕)$/, "tdx.gynecology_obstetrics.miscellaneous_gynecologic_disorders"],
];

// 外科學 without a sub-branch: assign from the disease name.
const SURGERY_LEAF = [
  [/^痔瘡$/, "tdx.surgery_dermatology.anorectal_disorders"],
  [/^癭病$/, "tdx.surgery_dermatology.goiters_masses_tumors"],
];

// 耳鼻喉 sub-branch by organ.
const ENT_LEAF = [
  [/^鼻/, "tdx.ent.nose"],
  [/^耳/, "tdx.ent.ear"],
  [/^乳蛾$/, "tdx.ent.throat"],
];

function leafFor(rec) {
  const hint = rec.classical_source_hint;
  if (!hint) return null;
  if (hint === "中醫婦科學") return match(GYN_LEAF, rec.name_zh);
  if (hint === "中醫外科學") return match(SURGERY_LEAF, rec.name_zh);
  if (hint === "中醫耳鼻喉科") return match(ENT_LEAF, rec.name_zh);
  if (hint === "金匱要略·婦人") return "tdx.gynecology_obstetrics.miscellaneous_gynecologic_disorders";
  if (hint === "金匱要略") return null;   // 百合病 — chapter is a source, not a category
  return HINT_TO_LEAF[hint] || null;
}
function match(table, name) {
  for (const [re, leaf] of table) if (re.test(name)) return leaf;
  return null;
}

const file = JSON.parse(fs.readFileSync(path.join(ROOT, REGISTRY), "utf8"));
const taxonomy = JSON.parse(fs.readFileSync(path.join(ROOT, "data/config/tcm_disease_taxonomy.json"), "utf8")).categories;
const LEAVES = new Set(taxonomy.flatMap((c) => (c.children || []).map((ch) => ch.id)));

const stats = { assigned: 0, classical_source_set: 0, left_for_human: [], bad_leaf: [] };

for (const rec of file.records || []) {
  const hint = rec.classical_source_hint;
  if (!hint) continue;

  if (HINT_TO_SOURCE[hint] && !rec.classical_source) {
    rec.classical_source = HINT_TO_SOURCE[hint];
    stats.classical_source_set += 1;
  }

  const leaf = leafFor(rec);
  if (!leaf) { stats.left_for_human.push(`${rec.name_zh} (${hint})`); continue; }
  if (!LEAVES.has(leaf)) { stats.bad_leaf.push(`${rec.name_zh} -> ${leaf}`); continue; }

  rec.taxonomy_id = leaf;              // move…
  delete rec.classical_source_hint;    // …then delete
  stats.assigned += 1;
}

console.log((process.argv.includes("--write") ? "APPLIED" : "DRY RUN") + " — tdis taxonomy split\n");
console.log(`  assigned taxonomy_id      ${stats.assigned}/75`);
console.log(`  classical_source split    ${stats.classical_source_set}`);
console.log(`  left for a human pass     ${stats.left_for_human.length}`);
if (stats.bad_leaf.length) console.log(`  BAD LEAF (bug)            ${stats.bad_leaf.length}: ${stats.bad_leaf.join(", ")}`);
console.log("\nleft for a human pass (they keep classical_source_hint, so nothing is lost):");
stats.left_for_human.forEach((s) => console.log("  " + s));

if (process.argv.includes("--write")) {
  fs.writeFileSync(path.join(ROOT, REGISTRY), JSON.stringify(file, null, 2) + "\n", "utf8");
  console.log(`\nwrote ${REGISTRY}`);
} else {
  console.log("\npass --write to apply.");
}
