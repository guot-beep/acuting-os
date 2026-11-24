#!/usr/bin/env node
/*
 * report-clinical-western-inventory.js — READ-ONLY inventory for
 * docs/CLINICAL_WESTERN_LAYER_DESIGN.md §2. Writes nothing, reads no patient data.
 *
 *   node scripts/report-clinical-western-inventory.js          # human table
 *   node scripts/report-clinical-western-inventory.js --json   # machine
 *
 * Every number in the design doc's inventory table comes from this script, so
 * the table can be re-measured on any tree (stamp the tree + sha when quoting).
 */
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const rd = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const recs = (j) => (Array.isArray(j) ? j : j.records || []);
const filled = (v) =>
  v != null && v !== "" && !(Array.isArray(v) && !v.length) &&
  !(typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length);
const countFilled = (rows, k) => rows.filter((r) => filled(r[k])).length;
const out = {};
const put = (k, v) => { out[k] = v; };

// ── 1. drug layer ──
const drugs = recs(rd("data/pharmacology/drugs.json"));
const drugIds = new Set(drugs.map((d) => d.id));
put("drug.records", drugs.length);
for (const k of ["boxed_warning_en", "drug_interactions_graded", "herb_drug_interactions_graded",
  "integrative_clinical_flags", "acupuncture_note_zh", "related_herb_ids", "rxnorm_rxcui"]) {
  put(`drug.${k}`, `${countFilled(drugs, k)}/${drugs.length}`);
}
const hdi = drugs.flatMap((d) => (d.herb_drug_interactions_graded || []).map((x) => ({ drug: d.id, ...x })));
put("drug.hdi_rows", hdi.length);
put("drug.hdi_rows_linked_to_herb_id", hdi.filter((x) => /^herb\./.test(String(x.with || ""))).length);
put("drug.hdi_rows_with_source", hdi.filter((x) => (x.sources || []).length).length);
put("drug.ddi_rows", drugs.reduce((n, d) => n + (d.drug_interactions_graded || []).length, 0));
put("drug.classes", recs(rd("data/pharmacology/drug_classes.json")).length);
put("drug.targets", recs(rd("data/pharmacology/drug_targets.json")).length);
put("drug.systems", recs(rd("data/pharmacology/drug_systems.json")).length);
put("dailymed.verified_labels", (rd("data/pharmacology/dailymed_verified_labels_manifest.json").labels || []).length);
put("medlineplus.verified_links", recs(rd("data/pharmacology/medlineplus_verified_links.json")).length);
const scope = rd("data/pharmacology/drug_scope_manifest.json").records;
put("scope.records", scope.length);
put("scope.planned_without_card", scope.filter((r) => !drugIds.has(r.id)).length);

// priority populations Ting named → which drugs exist as cards (by id, hand-listed
// so the report cannot silently "find" a drug by fuzzy matching)
const POP = {
  anticoagulant_antiplatelet: ["drug.warfarin", "drug.apixaban", "drug.rivaroxaban", "drug.dabigatran", "drug.clopidogrel",
    "drug.ticagrelor", "drug.prasugrel", "drug.aspirin", "drug.enoxaparin", "drug.heparin"],
  ivf_fertility: ["drug.letrozole", "drug.clomiphene", "drug.progesterone", "drug.estradiol", "drug.follitropin_alfa",
    "drug.menotropins", "drug.ganirelix", "drug.leuprolide", "drug.human_chorionic_gonadotropin", "drug.cetrorelix"],
  depression_anxiety: ["drug.sertraline", "drug.escitalopram", "drug.trazodone", "drug.phenelzine", "drug.fluoxetine",
    "drug.duloxetine", "drug.venlafaxine", "drug.bupropion", "drug.amitriptyline", "drug.mirtazapine"],
  gi: ["drug.omeprazole", "drug.pantoprazole", "drug.ondansetron", "drug.famotidine", "drug.mesalamine",
    "drug.infliximab", "drug.adalimumab", "drug.loperamide"],
  oncology_chemo_endocrine: ["drug.tamoxifen", "drug.anastrozole", "drug.letrozole", "drug.cyclophosphamide",
    "drug.doxorubicin", "drug.paclitaxel", "drug.cisplatin", "drug.carboplatin", "drug.fluorouracil",
    "drug.capecitabine", "drug.irinotecan", "drug.pembrolizumab", "drug.dexamethasone"],
  immunosuppressant: ["drug.tacrolimus", "drug.cyclosporine", "drug.mycophenolate", "drug.methotrexate",
    "drug.prednisone", "drug.azathioprine"],
};
for (const [k, ids] of Object.entries(POP)) {
  const have = ids.filter((i) => drugIds.has(i));
  put(`pop.${k}`, `${have.length}/${ids.length} have cards` + (have.length ? ` (${have.map((i) => i.slice(5)).join(", ")})` : ""));
}

// ── 2. herb / formula side ──
const herbs = recs(rd("data/herbs/herb_canon_shortlist.json"));
put("herb.records", herbs.length);
for (const k of ["safety_flags", "modern_pharmacology_en"]) put(`herb.${k}`, `${countFilled(herbs, k)}/${herbs.length}`);
const herbHdiFields = Object.keys(herbs.reduce((a, r) => Object.assign(a, r), {})).filter((k) => /herb_drug|drug_interact/i.test(k));
put("herb.herb_drug_fields_present", herbHdiFields.length ? herbHdiFields.join(",") : "none");
const flagCount = (rows, f) => rows.filter((r) => (r.safety_flags || []).includes(f)).length;
for (const f of ["anticoagulant_review", "bleeding_review", "sedative_medication_review", "blood_sugar_review",
  "hypertension_review", "medication_review", "pregnancy_review"]) put(`herb.flag.${f}`, flagCount(herbs, f));
const formulas = recs(rd("data/herbs/formulas.json"));
put("formula.records", formulas.length);
put("formula.composition_has_herb_id", formulas.filter((f) => (f.composition || []).some((c) => /^herb\./.test(String(c.herb_id || "")))).length);
for (const k of ["herb_drug_interactions_en", "herb_drug_cautions", "safety_flags"]) put(`formula.${k}`, `${countFilled(formulas, k)}/${formulas.length}`);

// American Dragon 201: Herb/Drug Interactions section — caution vs. benefit claim
const ad = fs.readFileSync(path.join(root, "curriculum/formulas/American_Dragon_201_Formulas_Name_Treats_Contraindications_Interactions.md"), "utf8");
const blocks = ad.split(/\n### /).slice(1);
const lines = [];
for (const b of blocks) {
  const m = b.match(/\*\*Herb\/Drug Interactions:\*\*([\s\S]*?)(\n\*\*|\n## |\n### |$)/);
  if (m) for (const l of m[1].split("\n")) if (l.trim().startsWith("-")) lines.push(l.trim());
}
const BENEFIT = /protective|effective|effectiveness|reduce|relieve|improve|synergistic|beneficial|potentiate the effects|eliminate|decrease|controlled|recommended|satisfactory|important modality/i;
put("ad201.formulas", blocks.length);
put("ad201.formulas_with_hdi_section", blocks.filter((b) => /\*\*Herb\/Drug Interactions:\*\*\s*\n\s*-/.test(b)).length);
put("ad201.hdi_lines", lines.length);
put("ad201.hdi_lines_benefit_claim", lines.filter((l) => BENEFIT.test(l)).length);
put("ad201.hdi_lines_other(caution candidates)", lines.filter((l) => !BENEFIT.test(l)).map((l) => l.slice(2, 70)).join(" | "));

// ── 3. diagnostic + exam side ──
const conds = recs(rd("data/pathology/condition_canon_shortlist.json"));
put("cond.records", conds.length);
const rf = recs(rd("data/pathology/red_flag_registry.json"));
put("redflag.records", rf.length);
const tiers = {};
rf.forEach((x) => { tiers[x.tier || "(none)"] = (tiers[x.tier || "(none)"] || 0) + 1; });
put("redflag.tiers", JSON.stringify(tiers));
put("sym.records", recs(rd("data/symptoms/symptoms.json")).length);
put("exam.records(data/anatomy/exams.json)", fs.existsSync(path.join(root, "data/anatomy/exams.json")) ? recs(rd("data/anatomy/exams.json")).length : "file absent");
for (const f of ["muscles", "bones", "nerves", "vessels"]) put(`anatomy.${f}`, recs(rd(`data/anatomy/${f}.json`)).length);

// ── 4. case record + render paths (structure only — never reads patient data) ──
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const preshift = fs.readFileSync(path.join(root, "js/preshift.js"), "utf8");
const has = (src, re) => re.test(src);
put("case.agentExposures_normalizer", has(app, /agentExposures: Array\.isArray\(value\.agentExposures\)/));
put("case.agentType_values", (app.match(/AGENT_EXPOSURE_TYPE_LABELS = \{([^}]*)\}/) || [, ""])[1].match(/\w+(?=:)/g).join("|"));
put("case.agentStatus_values", (app.match(/AGENT_EXPOSURE_STATUS_LABELS = \{([^}]*)\}/) || [, ""])[1].match(/\w+(?=:)/g).join("|"));
put("soap.objective_is_free_text", has(app, /objective: String\(value\.objective \|\| ""\)/));
put("soap.structured_exam_field", has(app, /examFindings/));
put("caseview.drug_acupuncture_note_rendered", has(app, /acupuncture_note_zh/));
put("caseview.herb_drug_pair_matching", has(app, /herb_drug_interactions_graded/));
put("preshift.reads_agentExposures", has(preshift, /agentExposures/));
put("preshift.reads_currentMeds_text", has(preshift, /currentMeds/));
put("preshift.anticoagulant_by_regex", has(preshift, /\["anticoagulant",/));

if (process.argv.includes("--json")) { console.log(JSON.stringify(out, null, 2)); process.exit(0); }
const w = Math.max(...Object.keys(out).map((k) => k.length));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(w), " ", v);
