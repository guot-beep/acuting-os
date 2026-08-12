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
const crypto = require("crypto");

// Short content digest for the generated-file banners. Provenance without
// volatility: identical inputs produce identical bytes, so `git diff` on
// data/generated means the DATA changed, not that someone re-ran the build.
const digest = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 12);

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
  scalpPoints: "data/scalp/scalp_points_full.json",
  extraPoints: "data/acupoints/extra_points.json",
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

// The banner used to carry `new Date()`. That made every build produce a diff
// even when no data changed — noise in a repo whose knowledge layer is valuable
// precisely because its diffs mean something (D7), and a permanent false
// failure for the CI step that checks "did you forget to rebuild?". The content
// digest keeps the provenance (it says exactly what this was built from) while
// being deterministic: same inputs, same bytes.
const body = "globalThis.ACUTING_APP_DATA = " + JSON.stringify(payload) + ";\n";
const banner = `// GENERATED FILE - DO NOT EDIT.
// Built by scripts/build-data.js · content ${digest(body)}
// Source of truth: data/acupoints/embedded/*.json, data/auricular/embedded/*.json,
//                  data/config/ui_config.json
`;
const out = banner + body;

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
  // D10 names pattern_registry the ID AUTHORITY, but only the library (50) was
  // bundled — so the 13 registry-only ids had no names at runtime. Pilot 0 made
  // that visible: sym.headache points at pattern.wind_cold, and the chip read
  // "Wind cold", the humanised slug, instead of 風寒 / Wind Cold.
  patternRegistry: readJson("data/pathology/pattern_registry.json"),
  tdisRegistry: readJson("data/pathology/tdis_registry.json"),
  conditionCanon: readJson("data/pathology/condition_canon_shortlist.json"),
  // 兩軸 maturity 的第二軸。完整度說「欄位齊了」,這個說「內容可不可信」——
  // 92 張人工 eyes-on 判定過的卡的結論,原本只存在 docs 表格裡,畫面讀不到,
  // 所以有未修復安全缺陷的卡看起來與乾淨的卡一模一樣。
  // 由 scripts/build-content-quality-overlay.js 從 ledger 重新產生,不手改。
  contentQuality: readJson("data/quality/content_quality.json"),
  // §6.5 (B) — points carry tcm_pattern_ids; without the canon in the bundle
  // the card can only print "pat.肝氣鬱結" instead of the pattern's name.
  tcmPatternCanon: readJson("data/config/tcm_pattern_canon.json"),
  // D11's fourth namespace. Without it the app has the EDGES but not the
  // TARGETS: Pilot 0 put "key_signs_ids":["sym.headache"] into this bundle
  // while symptoms.json stayed out, so a diagnosis card could only print the
  // raw id and a click had nothing to open. A ghost node in the graph.
  symptoms: readJson("data/symptoms/symptoms.json"),
  // The edge list itself (D13). Bundled so the reverse index is DERIVED FROM
  // the registry rather than from a second hand-written list in knowledge.js —
  // a hardcoded copy is how the two sides drift, which is what D13 forbids.
  relationRegistry: readJson("data/config/relation_registry.json"),
  symptomTaxonomy: readJson("data/config/symptom_taxonomy.json"),
  // LABELS ONLY. sym.headache references metric.pain_score, which rendered as
  // the raw id. This is the existing 22-metric vocabulary, not the clinical
  // measurement layer — that is a separate design review and nothing here
  // prejudges it.
  outcomeMetrics: readJson("data/clinical_cases/outcome_metrics.json"),
  cloudtcmDiseaseCategories: readJson("data/pathology/cloudtcm_disease_categories.json"),
  cloudtcmDiseaseEntries: readJson("data/pathology/cloudtcm_disease_entries.json"),
  medications: readJson("data/medications/western_medications.json"),
  safetyFlags: readJson("data/herbs/formula_safety_flags.json"),
  comparisons: readJson("data/knowledge/comparisons.json"),   // LL3 contrast tables
  modernApplicationVocabulary: readJson("data/config/modern_application_vocabulary.json"),  // bilingual labels + type for 現代運用 tags
  comparisonGroupVocabulary: readJson("data/config/comparison_group_vocabulary.json"),      // bilingual labels for 鑑別群組
  safetyFlagVocabulary: readJson("data/config/safety_flag_vocabulary.json"),                 // bilingual labels for safety_flags
  conditionCategoryVocabulary: readJson("data/config/condition_category_vocabulary.json"),  // bilingual labels for condition_canon `category` — lets point/herb/formula cards group related_conditions by system without storing the category twice
  // D11's four namespaces each group by their own controlled vocabulary. The
  // Diagnosis tab needs all three in the bundle or it can only print raw ids —
  // which is exactly why it used to render 中醫病名 and 證型 as two comma lines.
  tcmDiseaseTaxonomy: readJson("data/config/tcm_disease_taxonomy.json"),
  patternFamilyVocabulary: readJson("data/config/pattern_family_vocabulary.json"),
  // CloudTCM's pages joined onto the canonical records (Ting: it keeps no
  // classification of its own). Derived — see scripts/build-cloudtcm-ref-map.js.
  cloudtcmRefMap: readJson("data/config/cloudtcm_ref_map.json"),
  channelsAndCharts: readJson("data/channels/channels_and_charts.json"),
  herbPairs: readJson("data/herbs/herb_pairs.json"),                                        // 藥對
  herbPairRelations: readJson("data/config/herb_pair_relations.json"),                       // 七情配伍
  herbUrlMap: readJson("data/imports/cloudtcm/herb_url_map.json"),                           // direct per-herb source URLs
  // 雷達圖的 8 根軸（中英標籤 + 固定順序）。順序就是畫圖順序，所以必須來自
  // 同一份設定，不能在 knowledge.js 裡另抄一份 —— 抄第二份就會有一天不同步，
  // 而圖照樣畫得出來，只是軸錯位，畫面上看不出來。
  formulaActionGroups: readJson("data/config/formula_tag_glossary.json").action_groups,
  // 藥理層(2026-08-06)。四層一起帶進來:單藥卡要顯示分類名、標的部位與系統,
  // 而那三樣各住在自己的檔案 —— 少帶一個,卡片就只能印 id。
  pharmDrugs: readJson("data/pharmacology/drugs.json"),
  pharmDrugClasses: readJson("data/pharmacology/drug_classes.json"),
  pharmDrugTargets: readJson("data/pharmacology/drug_targets.json"),
  pharmDrugSystems: readJson("data/pharmacology/drug_systems.json"),
  // Structured safety layer (2026-08-08). Canonical red flags live here as
  // records with tier + evidence; the card arrays below are presentation.
  redFlagRegistry: readJson("data/pathology/red_flag_registry.json"),
  // Initial-intake minimum dataset (2026-08-09). Self-reported race/ethnicity
  // checkboxes are rendered from this list at runtime — see
  // docs/INTAKE_MINIMUM_DATASET_AUDIT.md — instead of being hard-coded into
  // the case form, so the vocabulary can grow without touching index.html or
  // app.js again.
  demographicVocabulary: readJson("data/config/demographic_vocabulary.json"),
  // Phase D batch 2 (docs/SPRINT_2026-08-12_BRIEF.md) — D17 §5/§6 vocab five-
  // pack (Sonnet B3). Same "vocabulary first, records born when filled"
  // approach as symptom_taxonomy.json (D14 build order): supp.*/life.*/
  // exposure.*/adverse_event.*/modality.* records don't exist yet, but the
  // SOAP dialog needs bilingual option lists NOW. Whole file bundled as-is
  // (like safetyFlagVocabulary/demographicVocabulary above) — the SOAP form
  // and any future card read the vocab's own top-level shape (`records` for
  // four of the five, `categories` for supplementCategoryVocabulary), not a
  // re-shaped copy.
  supplementCategoryVocabulary: readJson("data/config/supplement_category_vocabulary.json"),
  lifestyleFactorVocabulary: readJson("data/config/lifestyle_factor_vocabulary.json"),
  exposureVocabulary: readJson("data/config/exposure_vocabulary.json"),
  adverseEventVocabulary: readJson("data/config/adverse_event_vocabulary.json"),
  modalityVocabulary: readJson("data/config/modality_vocabulary.json"),
  // 第一批 supp.* 骨架卡(2026-08-12,docs/SUPP_CARD_TEMPLATE.md)。跟
  // supplementCategoryVocabulary 同模式掛進 bundle:卡片讀自己的頂層形狀
  // (`records`),不重塑一份副本。
  supplementRecords: readJson("data/supplements/supplements.json"),
  // AVS v3(Visit Checkout):建議庫 + 診所資訊進 bundle,Checkout 引擎
  // (js/avs.js)從 ACUTING_KNOWLEDGE 讀 —— PHI-free 靜態 config(§11);
  // 病人資料永不進這兩份檔案(validate-avs-library.js 把關)。
  avsAdviceLibrary: readJson("data/config/avs_advice_library.json"),
  clinicProfile: readJson("data/config/clinic_profile.json"),
};

// Runtime red-flag resolver — IN THE BUNDLE ONLY (D13: derive, never write
// back to source files). Two explicit paths, never blended (2026-08-08):
//
//   WIRED   a card with red_flag_refs resolves EXACTLY those ids, in that
//           order. Ref membership is the canonical wiring authority — a
//           future authored registry record on the same entity must NOT leak
//           into presentation without a wiring decision. A dangling ref or
//           ownership mismatch ABORTS the build: broken wiring must never
//           produce a plausible bundle. The anti-drift validator guarantees
//           the expansion equals the card's inline arrays byte-for-byte, so
//           swapping the source of truth changes nothing on screen.
//
//   UNWIRED compatibility fallback: entity_id scan, the pre-wiring merge.
//           This is what keeps authored-only safety presentations (24
//           conditions today, plus any future tdis records) alive until
//           their own wiring round.
{
  const regRecords = knowledge.redFlagRegistry.records || [];
  const byId = new Map(regRecords.map((r) => [r.id, r]));
const isLegacyMigrationRecord = (r) =>
  String(r.origin || "").startsWith("legacy_card_migration_");

const fallbackByEntity = new Map();
for (const r of regRecords) {
  if (isLegacyMigrationRecord(r)) continue;
  if (!fallbackByEntity.has(r.entity_id)) fallbackByEntity.set(r.entity_id, []);
  fallbackByEntity.get(r.entity_id).push(r);
}
  const resolveWired = (rec) => {
    const flags = rec.red_flag_refs.map((id) => {
      const f = byId.get(id);
      if (!f) throw new Error(`build-data: ${rec.id} red_flag_refs has dangling id ${id}`);
      if (f.entity_id !== rec.id) throw new Error(`build-data: ${rec.id} ref ${id} belongs to ${f.entity_id}`);
      return f;
    });
    rec.red_flags_zh = flags.map((f) => f.trigger_zh);
    rec.red_flags_en = flags.map((f) => f.trigger_en);
    rec.red_flag_record_ids = rec.red_flag_refs.slice();
  };
  const mergeUnwired = (rec) => {
    const flags = fallbackByEntity.get(rec.id);
    if (!flags || !flags.length) return;
    const zh = new Set((rec.red_flags_zh || []).map((s) => String(s).trim()));
    const en = new Set((rec.red_flags_en || []).map((s) => String(s).trim()));
    for (const f of flags) {
      const tzh = String(f.trigger_zh || "").trim();
      const ten = String(f.trigger_en || "").trim();
      if (tzh && !zh.has(tzh)) { (rec.red_flags_zh = rec.red_flags_zh || []).push(tzh); zh.add(tzh); }
      if (ten && !en.has(ten)) { (rec.red_flags_en = rec.red_flags_en || []).push(ten); en.add(ten); }
    }
    rec.red_flag_record_ids = flags.map((f) => f.id);
  };
  for (const rec of (knowledge.conditionCanon.records || [])) {
    if (Array.isArray(rec.red_flag_refs) && rec.red_flag_refs.length) resolveWired(rec);
    else mergeUnwired(rec);
  }
  (knowledge.tdisRegistry.records || []).forEach(mergeUnwired);
}
// Deterministic banner — see the app_data.js note above.
const kBody = "globalThis.ACUTING_KNOWLEDGE = " + JSON.stringify(knowledge) + ";\n";
const kBanner = `// GENERATED FILE - DO NOT EDIT.
// Built by scripts/build-data.js · content ${digest(kBody)}
// Source of truth: data/herbs/formulas.json, data/herbs/herb_canon_shortlist.json,
//                  data/pathology/conditions.json, data/sources/source_registry.json,
//                  data/audits/missing_report.json, data/knowledge/comparisons.json
`;
fs.writeFileSync(
  path.join(ROOT, "data/generated/knowledge_data.js"),
  kBanner + kBody
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
  symptoms: knowledge.symptoms.records.length,
  relation_edges: knowledge.relationRegistry.edges.length,
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
