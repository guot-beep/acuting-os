/**
 * scripts/build_pattern_prototype_card.js
 * Builds the 4 Gold-Standard TCM Pattern Preview Card Prototypes
 * strictly complying with curriculum/Plan/Acuting_OS_TCM_Pattern_Preview_Cards_and_Source_Strategy_v1_2026-08-02.md
 */

const fs = require('fs');
const path = require('path');

const prototypeCards = [
  {
    id: "pattern.liver_yang_rising",
    entity_type: "tcm_pattern",
    name_zh: "肝陽上亢",
    name_en: "Liver Yang Rising",
    pinyin: "Gān Yáng Shàng Kàng",
    aliases_zh: ["肝陽上擾", "水不涵木"],
    aliases_en: ["Liver Yang Flaming Upward", "Water Failing to Nourish Wood"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.liver", "organ.kidney"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "heat",
      excess_deficiency: "mixed_deficiency_excess",
      yin_yang: "yang"
    },

    qi_blood_fluid_ids: ["yin", "yang"],
    pathogenic_factor_ids: ["internal_wind"],

    short_summary_zh: "肝腎陰虛於下，水不涵木，致使肝陽偏亢、上擾清空。以頭痛眩暈、急躁易怒、面紅目赤、腰膝痠軟為主要臨床特徵。",
    short_summary_en: "Liver and Kidney Yin deficiency below failing to nourish Wood, allowing Liver Yang to become hyperactive and surge upward to disturb the head. Characterized by throbbing headache, dizziness, irritability, facial redness, and lumbar/knee weakness.",

    key_manifestation_ids: [
      "symptom.headache",
      "symptom.dizziness",
      "symptom.irritability",
      "symptom.facial_redness",
      "symptom.lumbar_soreness"
    ],
    key_manifestations_zh: [
      "頭痛目眩",
      "急躁易怒",
      "面紅目赤",
      "腰膝痠軟",
      "耳鳴如潮"
    ],
    key_manifestations_en: [
      "Throbbing Headache & Dizziness",
      "Irritability & Agitation",
      "Facial Redness & Red Eyes",
      "Weak or Sore Lumbar/Knees",
      "Tinnitus Like Tides"
    ],

    tongue_preview: {
      zh: "舌紅，苔少或薄黃",
      en: "Red tongue with scanty or thin yellow coating"
    },
    pulse_preview: {
      zh: "脈弦有力，或弦細數",
      en: "Wiry and forceful pulse, or wiry, fine and rapid"
    },

    differentiation_preview_zh: "本虛標實（上實下虛）：上焦呈現陽亢熱象（頭痛、眩暈、面紅目赤、急躁），下焦伴隨陰虛不足（腰膝痠軟、足脛無力）。多由情志所傷或久病傷陰引發。",
    differentiation_preview_en: "Root Deficiency with Branch Excess (Upper Excess, Lower Deficiency): Upper body shows Yang hyperactivity (headache, dizziness, facial redness), while lower body exhibits Yin deficiency (weak knees/lumbar). Often triggered by emotional stress or chronic Yin depletion.",

    related_tcm_disease_ids: ["tdis.tou_tong", "tdis.xuan_yun"],
    related_biomedical_condition_ids: ["cond.migraine", "cond.hypertension", "cond.vertigo"],
    primary_formula_ids: ["formula.tian_ma_gou_teng_yin"],
    primary_acupoint_ids: ["GB20", "LR3", "GB8", "GB43", "SP6", "KI3"],

    tag_ids: ["肝經病變", "本虛標實", "清頭明目", "平肝潛陽"],
    source_ids: ["NCBAHM_2026_CH_Outline", "https://cloudtcm.com/pattern/120"],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.heart_spleen_deficiency",
    entity_type: "tcm_pattern",
    name_zh: "心脾兩虛",
    name_en: "Heart & Spleen Dual Deficiency",
    pinyin: "Xīn Pí Liǎng Xū",
    aliases_zh: ["心脾氣血兩虛"],
    aliases_en: ["Heart and Spleen Deficiency of Qi and Blood"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.heart", "organ.spleen"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "neutral",
      excess_deficiency: "deficiency",
      yin_yang: "yin"
    },

    qi_blood_fluid_ids: ["qi", "blood"],
    pathogenic_factor_ids: [],

    short_summary_zh: "心血不足，神失所養，脾氣虛弱，運化失職。以心悸怔忡、失眠多夢、健忘、食少體倦、面色萎黃為主要臨床特徵。",
    short_summary_en: "Deficiency of Heart Blood depriving the Spirit of nourishment, combined with Spleen Qi deficiency impairing transportation and transformation. Characterized by palpitations, insomnia, poor memory, fatigue, and sallow complexion.",

    key_manifestations_zh: ["心悸怔忡", "失眠多夢", "健忘體倦", "食少腹脹", "面色萎黃"],
    key_manifestations_en: ["Palpitations & Anxiety", "Insomnia & Dreamful Sleep", "Poor Memory & Fatigue", "Poor Appetite & Bloating", "Sallow Complexion"],

    tongue_preview: {
      zh: "舌淡，苔薄白",
      en: "Pale tongue with thin white coating"
    },
    pulse_preview: {
      zh: "脈細弱",
      en: "Fine and weak pulse"
    },

    differentiation_preview_zh: "雙重虛證：心不主血、脾不統血與生血不足並見。常用於心悸、失眠、月經過多、崩漏等氣血兩虛證候。",
    differentiation_preview_en: "Dual Deficiency: Failure of Heart to govern Blood and Spleen to produce/control Blood. Commonly seen in insomnia, palpitations, hypermenorrhea, and chronic bleeding.",

    related_tcm_disease_ids: ["tdis.shi_mian", "tdis.xin_ji"],
    related_biomedical_condition_ids: ["cond.insomnia", "cond.anemia", "cond.anxiety"],
    primary_formula_ids: ["formula.gui_pi_tang"],
    primary_acupoint_ids: ["HT7", "SP6", "ST36", "BL15", "BL20", "CV6"],

    tag_ids: ["心脾兩虛", "氣血雙補", "養血安神", "健脾益氣"],
    source_ids: ["NCBAHM_2026_CH_Outline", "https://cloudtcm.com/pattern/135"],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.phlegm_damp",
    entity_type: "tcm_pattern",
    name_zh: "痰濕內蘊",
    name_en: "Phlegm-Damp Accumulation",
    pinyin: "Tán Shī Nèi Yùn",
    aliases_zh: ["痰濕阻滯", "濕痰內盛"],
    aliases_en: ["Phlegm-Damp Obstruction", "Internal Phlegm-Damp Retention"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.spleen", "organ.lung"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "cold_neutral",
      excess_deficiency: "excess",
      yin_yang: "yin"
    },

    qi_blood_fluid_ids: ["fluid"],
    pathogenic_factor_ids: ["phlegm", "dampness"],

    short_summary_zh: "脾失健運，水濕不化，凝聚成痰，阻滯氣機。以形體肥胖、身重困倦、胸悶脘痞、咳嗽痰多白黏、口黏不渴為特徵。",
    short_summary_en: "Spleen failing to transform fluids, leading to moisture accumulating into phlegm and obstructing Qi movement. Characterized by heaviness, obesity, chest fullness, profuse white sticky sputum, and sticky mouth.",

    key_manifestations_zh: ["身重困倦", "胸悶脘痞", "咳嗽痰多白黏", "頭暈目眩如蒙", "口黏不渴"],
    key_manifestations_en: ["Body Heaviness & Fatigue", "Chest Fullness & Distension", "Profuse White Sticky Sputum", "Heavy Dizziness Like Wrapped", "Sticky Mouth Without Thirst"],

    tongue_preview: {
      zh: "舌體胖大，苔白膩",
      en: "Swollen tongue with thick white greasy coating"
    },
    pulse_preview: {
      zh: "脈滑或濡",
      en: "Slippery or soggy pulse"
    },

    differentiation_preview_zh: "實證病機：脾不運化為本，痰濕聚積為標。常表現為胸悶、噁心、咳嗽痰多、眩暈或肥胖症。",
    differentiation_preview_en: "Excess Pattern: Spleen dysfunction as root, phlegm-damp accumulation as branch. Commonly manifests as chest oppression, nausea, heavy cough, dizziness, or metabolic issues.",

    related_tcm_disease_ids: ["tdis.ke_sou", "tdis.xuan_yun"],
    related_biomedical_condition_ids: ["cond.bronchitis", "cond.hyperlipidemia", "cond.metabolic_syndrome"],
    primary_formula_ids: ["formula.er_chen_tang", "formula.ban_xia_bai_zhu_tian_ma_tang"],
    primary_acupoint_ids: ["ST40", "ST36", "SP9", "RN12", "PC6"],

    tag_ids: ["痰濕內蘊", "燥濕化痰", "健脾理氣"],
    source_ids: ["NCBAHM_2026_CH_Outline", "https://cloudtcm.com/pattern/142"],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.blood_stasis",
    entity_type: "tcm_pattern",
    name_zh: "瘀血內阻",
    name_en: "Blood Stasis Accumulation",
    pinyin: "Yū Xuè Nèi Zǔ",
    aliases_zh: ["血瘀證", "血脈瘀阻"],
    aliases_en: ["Blood Stasis Pattern", "Blood Vessel Obstruction"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "blood_level",
    zang_fu_ids: ["organ.liver", "organ.heart"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "neutral",
      excess_deficiency: "excess",
      yin_yang: "yin"
    },

    qi_blood_fluid_ids: ["blood"],
    pathogenic_factor_ids: ["blood_stasis"],

    short_summary_zh: "血行不暢，瘀滯內阻，脈絡不通。以刺痛、痛有定處、夜間痛甚、拒按、唇舌紫暗或有瘀點瘀斑為特徵。",
    short_summary_en: "Blood circulation impaired, resulting in localized stasis obstructing collaterals. Characterized by fixed sharp stabbing pain, nocturnal aggravation, tenderness to touch, and purple lips/tongue with macules.",

    key_manifestations_zh: ["刺痛固定拒按", "夜間痛甚", "唇舌紫暗瘀斑", "局部腫塊固定", "肌膚甲錯"],
    key_manifestations_en: ["Fixed Sharp Stabbing Pain", "Nocturnal Pain Aggravation", "Purple Lips/Tongue with Spots", "Fixed Masses/Lumps", "Dry Scaly Skin"],

    tongue_preview: {
      zh: "舌質紫暗，或有瘀點瘀斑",
      en: "Purple or dark tongue with stasis dots/macules"
    },
    pulse_preview: {
      zh: "脈細澀，或結代",
      en: "Fine and choppy pulse, or bound/intermittent"
    },

    differentiation_preview_zh: "血分實證：痛如針刺、痛有定處、夜間加重為三大診斷要點。可因氣滯、寒凝、熱灼或創傷引發。",
    differentiation_preview_en: "Blood Level Excess: Sharp stabbing pain, fixed location, and night aggravation are three key diagnostic indicators. Caused by Qi stagnation, Cold, Heat, or trauma.",

    related_tcm_disease_ids: ["tdis.bi_zheng", "tdis.tong_jing"],
    related_biomedical_condition_ids: ["cond.dysmenorrhea", "cond.thrombosis", "cond.angina"],
    primary_formula_ids: ["formula.xue_fu_zhu_yu_tang", "formula.tao_he_cheng_qi_tang"],
    primary_acupoint_ids: ["SP6", "BL17", "SP10", "LI4", "LR3"],

    tag_ids: ["瘀血內阻", "活血化瘀", "通絡止痛"],
    source_ids: ["NCBAHM_2026_CH_Outline", "https://cloudtcm.com/pattern/150"],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  }
];

// 1. Write prototypes to data/pathology/tcm_pattern_prototypes.json
const protoPath = path.join(__dirname, '../data/pathology/tcm_pattern_prototypes.json');
fs.writeFileSync(protoPath, JSON.stringify(prototypeCards, null, 2), 'utf8');
console.log(`Saved 4 prototype cards to ${protoPath}`);

// 2. Update data/pathology/pattern_library.json with these enriched records
const libraryPath = path.join(__dirname, '../data/pathology/pattern_library.json');
if (fs.existsSync(libraryPath)) {
  const lib = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
  prototypeCards.forEach(proto => {
    const idx = lib.records.findIndex(r => r.id === proto.id);
    if (idx !== -1) {
      lib.records[idx] = Object.assign({}, lib.records[idx], proto);
    } else {
      lib.records.push(proto);
    }
  });
  fs.writeFileSync(libraryPath, JSON.stringify(lib, null, 2), 'utf8');
  console.log(`Updated pattern_library.json with all 4 prototypes! Total records: ${lib.records.length}`);
}
