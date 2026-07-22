#!/usr/bin/env node
/**
 * build-data.js
 *
 * Builds data/generated/app_data.js from the JSON source-of-truth files.
 * The app is a static site (no fetch for local files), so JSON must be
 * wrapped into a .js file loaded via <script> before app.js.
 *
 * RULE: humans and agents edit data/**.json only.
 *       data/generated/* is machine-written. Never edit it by hand.
 *
 * Usage: node scripts/build-data.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function writeGlobalJson(rel, globalName, value, target = "globalThis") {
  fs.writeFileSync(
    path.join(ROOT, rel),
    target + "." + globalName + " = " + JSON.stringify(value, null, 2) + ";\n"
  );
}

const SOURCES = {
  starterPoints: "data/acupoints/embedded/starter_points.json",
  professionalPoints: "data/acupoints/embedded/professional_points.json",
  lungMeridianExpansion: "data/acupoints/embedded/meridian_lu.json",
  largeIntestineMeridianExpansion: "data/acupoints/embedded/meridian_li.json",
  stomachMeridianExpansion: "data/acupoints/embedded/meridian_st.json",
  spleenMeridianExpansion: "data/acupoints/embedded/meridian_sp.json",
  heartMeridianExpansion: "data/acupoints/embedded/meridian_ht.json",
  smallIntestineMeridianExpansion: "data/acupoints/embedded/meridian_si.json",
  bladderMeridianExpansion: "data/acupoints/embedded/meridian_bl.json",
  kidneyMeridianExpansion: "data/acupoints/embedded/meridian_ki.json",
  auricularPoints: "data/auricular/embedded/auricular_points.json",
};
const I18N_SOURCE = "data/acupoints/embedded/i18n_maps.json";
const UI_CONFIG_SOURCE = "data/config/ui_config.json";

const payload = {};
for (const [name, rel] of Object.entries(SOURCES)) {
  payload[name] = readJson(rel);
}
const i18n = readJson(I18N_SOURCE);
Object.assign(payload, i18n);
payload.uiConfig = readJson(UI_CONFIG_SOURCE);
payload.pointCategoryVocabulary = readJson("data/config/point_category_vocabulary.json");   // PC5 badge/filter labels

const banner = `// GENERATED FILE - DO NOT EDIT.
// Built by scripts/build-data.js on ${new Date().toISOString()}
// Source of truth: data/acupoints/embedded/*.json, data/auricular/embedded/*.json,
//                  data/config/ui_config.json
`;
const out = banner + "globalThis.ACUTING_APP_DATA = " + JSON.stringify(payload) + ";\n";

fs.mkdirSync(path.join(ROOT, "data/generated"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "data/generated/app_data.js"), out);

const counts = Object.fromEntries(
  Object.entries(payload).map(([k, v]) => [k, Array.isArray(v) ? v.length : Object.keys(v).length])
);
console.log("Built data/generated/app_data.js");
console.log(JSON.stringify(counts, null, 2));

// ---- Knowledge bundle (formulas / conditions / sources / audit) ----------
const knowledge = {
  formulas: readJson("data/herbs/formulas.json"),
  herbs: readJson("data/herbs/herb_canon_shortlist.json"),
  conditions: readJson("data/pathology/conditions.json"),
  sources: readJson("data/sources/source_registry.json"),
  audit: readJson("data/audits/missing_report.json"),
  // CS4-2: registries the SOAP link pickers offer (ids must exist to be picked)
  patternLibrary: readJson("data/pathology/pattern_library.json"),
  tdisRegistry: readJson("data/pathology/tdis_registry.json"),
  conditionCanon: readJson("data/pathology/condition_canon_shortlist.json"),
  cloudtcmDiseaseCategories: readJson("data/pathology/cloudtcm_disease_categories.json"),
  cloudtcmDiseaseEntries: readJson("data/pathology/cloudtcm_disease_entries.json"),
  medications: readJson("data/medications/western_medications.json"),
  safetyFlags: readJson("data/herbs/formula_safety_flags.json"),
  comparisons: readJson("data/knowledge/comparisons.json"),   // LL3 contrast tables
  modernApplicationVocabulary: readJson("data/config/modern_application_vocabulary.json"),  // bilingual labels + type for 現代運用 tags
  comparisonGroupVocabulary: readJson("data/config/comparison_group_vocabulary.json"),      // bilingual labels for 鑑別群組
  herbPairs: readJson("data/herbs/herb_pairs.json"),                                        // 藥對
  herbPairRelations: readJson("data/config/herb_pair_relations.json"),                       // 七情配伍
  herbUrlMap: readJson("data/imports/cloudtcm/herb_url_map.json"),                           // direct per-herb source URLs
};
const kBanner = `// GENERATED FILE - DO NOT EDIT.
// Built by scripts/build-data.js on ${new Date().toISOString()}
// Source of truth: data/herbs/formulas.json, data/herbs/herb_canon_shortlist.json,
//                  data/pathology/conditions.json, data/sources/source_registry.json,
//                  data/audits/missing_report.json, data/knowledge/comparisons.json
`;
fs.writeFileSync(
  path.join(ROOT, "data/generated/knowledge_data.js"),
  kBanner + "globalThis.ACUTING_KNOWLEDGE = " + JSON.stringify(knowledge) + ";\n"
);
console.log("Built data/generated/knowledge_data.js");
console.log(JSON.stringify({
  formulas: knowledge.formulas.records.length,
  herbs: knowledge.herbs.records.length,
  conditions: knowledge.conditions.records.length,
  eastern: knowledge.conditions.eastern_diseases.length,
  patterns: knowledge.conditions.tcm_patterns.length,
  sources: knowledge.sources.sources.length,
  comparisons: knowledge.comparisons.records.length,
  audit_missing: knowledge.audit.total_missing,
}));

// ---- CloudTCM per-point map (code -> numeric page id + image filename) -----
const cloudtcm = readJson("data/sources/cloudtcm_point_map.json");
fs.writeFileSync(
  path.join(ROOT, "data/generated/cloudtcm_map.js"),
  "// GENERATED FILE - DO NOT EDIT. Built by scripts/build-data.js\n" +
  "// Source: data/sources/cloudtcm_point_map.json\n" +
  "globalThis.ACUTING_CLOUDTCM_MAP = " + JSON.stringify(cloudtcm.points) + ";\n"
);
console.log("Built data/generated/cloudtcm_map.js (" + Object.keys(cloudtcm.points).length + " points)");

// ---- 361 standard acupoint layer (Phase 2 runtime adapter) -----------------
const points361 = readJson("data/acupoints/361.json");
fs.writeFileSync(
  path.join(ROOT, "data/generated/points_361.js"),
  "// GENERATED FILE - DO NOT EDIT. Built by scripts/build-data.js\n" +
  "// Source of truth: data/acupoints/361.json\n" +
  "globalThis.ACUTING_POINTS_361 = " + JSON.stringify(points361) + ";\n"
);
console.log("Built data/generated/points_361.js (" + points361.length + " points)");

// ---- JS twins generated from JSON source files ----------------------------
writeGlobalJson("data/tung/point_index.js", "ACUTING_TUNG_INDEX", readJson("data/tung/point_index.json"), "window");
writeGlobalJson("data/auricular/gb93_index.js", "ACUTING_AURICULAR_GB93", readJson("data/auricular/gb93_index.json"));
writeGlobalJson("data/auricular/gb93_worklist.js", "ACUTING_AURICULAR_GB93_WORKLIST", readJson("data/auricular/gb93_worklist.json"));
console.log("Built Tung/GB93 JS twins from JSON sources");
