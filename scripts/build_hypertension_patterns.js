/**
 * scripts/build_hypertension_patterns.js
 * Builds canonical TCM Pattern Cards for Dizziness & Headache (眩暈/頭痛)
 * mapped to Western Hypertension (高血壓) from Bastyr Therapeutics 5 & Board Outline
 * Source: OneDrive/08_臨床病症筆記/Hypertension_高血壓.md (Benjamin Apichai)
 */

const fs = require('fs');
const path = require('path');

const canonicalPatterns = [
  {
    id: "pattern.liver_fire_flaring",
    entity_type: "tcm_pattern",
    name_zh: "肝火上炎",
    name_en: "Liver Fire Flaring Upward",
    pinyin: "Gān Huǒ Shàng Yán",
    aliases_zh: ["肝火亢盛", "肝經實火"],
    aliases_en: ["Liver Fire Excess", "Flaring Liver Fire"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.liver"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "heat",
      excess_deficiency: "excess",
      yin_yang: "yang"
    },

    qi_blood_fluid_ids: ["qi"],
    pathogenic_factor_ids: ["fire"],

    short_summary_zh: "肝鬱化火，火性炎上，上擾清空。以頭痛脹裂、面紅目赤、口苦口乾、急躁易怒、項背緊繃、甚或鼻衄為特徵。",
    short_summary_en: "Liver Qi stagnation transforming into Fire, surging upward to agitate head and eyes. Characterized by flushed face, splitting headache, tight neck/trapezius, bitter taste, and epistaxis.",

    key_manifestations_zh: ["面紅目赤", "頭痛如裂項背緊繃", "口苦口乾", "急躁易怒", "便秘尿黃或鼻衄"],
    key_manifestations_en: ["Flushed Face & Red Eyes", "Splitting Headache & Tight Neck", "Bitter Taste & Dry Mouth", "Irritability & Agitation", "Constipation & Dark Urine"],

    tongue_preview: {
      zh: "舌質紅，苔黃，邊尖紅",
      en: "Red tongue with yellow coating, red edges/tip"
    },
    pulse_preview: {
      zh: "脈弦數有力",
      en: "Wiry and rapid, forceful pulse"
    },

    differentiation_preview_zh: "肝經純實熱證：以頭痛脹裂、面紅目赤、口苦咽乾為診斷要點。與肝陽上亢區分——本證為純實無虛，無下焦腰膝痠軟。治當清肝瀉火。",
    differentiation_preview_en: "Pure Excess Heat of Liver: Characterized by splitting headache, flushed face, bitter taste without lower body Yin deficiency. Tx: Drain Liver Fire.",
    exam_pearls_zh: "Bastyr Therapeutics 5 & NCCAOM 考點：代表方龍膽瀉肝湯 (Long Dan Xie Gan Tang)。主穴：LR2 行間、LI4 合谷、LI11 曲池、GB20 風池、GV20 百會、ST44 內庭。",

    treatment_principle_zh: "清肝瀉火，清利頭目",
    treatment_principle_en: "Calm the Liver, drain Fire, clear head and eyes",

    related_tcm_disease_ids: ["tdis.xuan_yun", "tdis.tou_tong"],
    related_biomedical_condition_ids: ["cond.hypertension", "cond.migraine"],
    primary_formula_ids: ["formula.long_dan_xie_gan_tang"],
    primary_acupoint_ids: ["LR2", "LI4", "LI11", "GB20", "GV20", "ST44", "ST36", "SP6"],

    tag_ids: ["肝火上炎", "清肝瀉火", "龍膽瀉肝湯", "眩暈", "頭痛"],
    source_ids: [
      "Bastyr_Therapeutics_5_Hypertension_Apichai_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026",
      "https://cloudtcm.com/pattern/liver_fire"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.liver_wind_stirring",
    entity_type: "tcm_pattern",
    name_zh: "肝風內動",
    name_en: "Liver Wind Stirring Internally",
    pinyin: "Gān Fēng Nèi Dòng",
    aliases_zh: ["陽化風動", "肝風上擾"],
    aliases_en: ["Internal Liver Wind", "Wind Stirring Pattern"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.liver"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "heat",
      excess_deficiency: "excess",
      yin_yang: "yang"
    },

    qi_blood_fluid_ids: ["qi"],
    pathogenic_factor_ids: ["internal_wind"],

    short_summary_zh: "肝陽化風，風氣上擾，氣血逆亂。以眩暈劇烈、頭痛、肢體麻木震顫、高調耳鳴、舌強語澀、甚或卒倒昏迷為特徵。",
    short_summary_en: "Hyperactive Liver Yang transforming into Wind, agitating upward and causing Qi/Blood chaos. Characterized by severe vertigo, limb numbness/tremors, tongue stiffness, or stroke/coma.",

    key_manifestations_zh: ["頭暈目眩劇烈", "肢體麻木震顫", "高調耳鳴暈厥", "舌強語澀口眼歪斜", "半身不遂或突然昏倒"],
    key_manifestations_en: ["Severe Vertigo & Headache", "Limb Numbness & Trembling", "High-Pitch Tinnitus & Fainting", "Tongue Stiffness & Facial Palsy", "Hemiplegia or Sudden Collapse"],

    tongue_preview: {
      zh: "舌質紅，苔薄黃",
      en: "Red tongue with thin yellow coating"
    },
    pulse_preview: {
      zh: "脈弦滑數",
      en: "Wiry, slippery, and rapid pulse"
    },

    differentiation_preview_zh: "中風前兆急症病機：出現肢麻、震顫、言語蹇澀為肝風內動核心。須警惕中風 (Stroke) 發生！中醫診斷多歸屬於眩暈、頭痛或中風範疇。",
    differentiation_preview_en: "Stroke Precursor Warning: Numbness, tremors, or dysarthria indicates internal Wind. High alert for imminent stroke!",
    exam_pearls_zh: "Bastyr Therapeutics 5 & NCCAOM 考點：代表方鎮肝熄風湯 (Zhen Gan Xi Feng Tang)。主穴：GB20 風池、GV20 百會、LR14 期門、LR3 太衝、GB34 陽陵泉、PC7 大陵。",

    treatment_principle_zh: "鎮肝熄風，滋陰潛陽",
    treatment_principle_en: "Calm Liver Wind, subdue Yang, nourish Yin",

    related_tcm_disease_ids: ["tdis.zhong_feng", "tdis.xuan_yun", "tdis.tou_tong"],
    related_biomedical_condition_ids: ["cond.stroke", "cond.hypertensive_crisis", "cond.tia", "cond.hypertension"],
    primary_formula_ids: ["formula.zhen_gan_xi_feng_tang"],
    primary_acupoint_ids: ["GB20", "GV20", "LR14", "LR3", "GB34", "PC7"],

    tag_ids: ["肝風內動", "鎮肝熄風", "中風前兆", "急症紅旗", "眩暈"],
    source_ids: [
      "Bastyr_Therapeutics_5_Hypertension_Apichai_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  }
];

// Clean up old temporary key ids if any exist in pattern_library.json
const libraryPath = path.join(__dirname, '../data/pathology/pattern_library.json');
if (fs.existsSync(libraryPath)) {
  const lib = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
  // Remove temporary IDs
  lib.records = lib.records.filter(r => !r.id.startsWith("pattern.hypertension_"));
  
  canonicalPatterns.forEach(proto => {
    const idx = lib.records.findIndex(r => r.id === proto.id);
    if (idx !== -1) {
      lib.records[idx] = Object.assign({}, lib.records[idx], proto);
    } else {
      lib.records.push(proto);
    }
  });
  fs.writeFileSync(libraryPath, JSON.stringify(lib, null, 2), 'utf8');
  console.log(`Cleaned up temp IDs and saved canonical TCM pattern names! Total records: ${lib.records.length}`);
}
