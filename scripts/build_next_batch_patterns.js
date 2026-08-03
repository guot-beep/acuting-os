/**
 * scripts/build_next_batch_patterns.js
 * Builds the next batch of canonical Zang-Fu & Pathological System TCM Pattern Cards
 * Sources: Bastyr conditions course materials (05. Lung, 02. Spleen, Liver Pathology, Insomnia notes)
 */

const fs = require('fs');
const path = require('path');

const batchPatterns = [
  {
    id: "pattern.lung_yin_deficiency",
    entity_type: "tcm_pattern",
    name_zh: "肺陰虛",
    name_en: "Lung Yin Deficiency",
    pinyin: "Fèi Yīn Xū",
    aliases_zh: ["肺陰不足", "燥熱傷肺"],
    aliases_en: ["Lung Yin Depletion", "Dry-Heat Injuring Lung Yin"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.lung"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "heat",
      excess_deficiency: "deficiency",
      yin_yang: "yin"
    },

    qi_blood_fluid_ids: ["yin", "fluid"],
    pathogenic_factor_ids: ["dryness"],

    short_summary_zh: "肺陰虧虛，虛熱內生，肺失清肅。以乾咳少痰、痰中帶血、口乾咽燥、五心煩熱、午後潮熱、盜汗為特徵。",
    short_summary_en: "Depletion of Lung Yin leading to internal Deficiency-Heat and loss of Lung moistening function. Characterized by dry cough with little sputum, blood-streaked sputum, dry throat, tidal fever, and night sweats.",

    key_manifestations_zh: ["乾咳無痰或少痰", "痰中帶血絲", "口乾咽燥形體消瘦", "五心煩熱午後潮熱", "盜汗顴紅"],
    key_manifestations_en: ["Dry Cough with Scanty Sputum", "Blood-Streaked Sputum", "Dry Throat & Emaciation", "Five-Center Heat & Tidal Fever", "Night Sweats & Malar Flush"],

    tongue_preview: {
      zh: "舌質紅，少苔少津",
      en: "Red tongue body with scanty coating and dry fluids"
    },
    pulse_preview: {
      zh: "脈細數",
      en: "Fine and rapid pulse"
    },

    differentiation_preview_zh: "肺系虛熱證：乾咳少痰、痰中帶血、潮熱盜汗為三大診斷要點。多由久咳傷陰、熱病後期傷津引發。",
    differentiation_preview_en: "Lung System Deficiency-Heat: Key features are dry cough, blood-streaked sputum, and night sweats. Caused by chronic cough or febrile fluid depletion.",
    exam_pearls_zh: "Bastyr Lung Pathology & NCCAOM 考點：代表方百合固金湯 (Bai He Gu Jin Tang) 或沙參麥冬湯。主穴：LU9 太淵、KI6 照海、LU5 尺澤、BL13 肺俞。",

    treatment_principle_zh: "養陰潤肺，清熱止咳",
    treatment_principle_en: "Nourish Yin, moisten the Lungs, clear Heat, stop cough",

    related_tcm_disease_ids: ["tdis.ke_sou", "tdis.fei_lao"],
    related_biomedical_condition_ids: ["cond.bronchitis", "cond.atypical_pneumonia", "cond.tuberculosis"],
    primary_formula_ids: ["formula.bai_he_gu_jin_tang", "formula.sha_shen_mai_dong_tang"],
    primary_acupoint_ids: ["LU9", "KI6", "LU5", "BL13", "CV17"],

    tag_ids: ["肺陰虛", "養陰潤肺", "百合固金湯", "咳嗽"],
    source_ids: [
      "Bastyr_Lung_Pathology_Notes_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026",
      "https://cloudtcm.com/pattern/lung_yin_xu"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.spleen_qi_deficiency",
    entity_type: "tcm_pattern",
    name_zh: "脾氣虛",
    name_en: "Spleen Qi Deficiency",
    pinyin: "Pí Qì Xū",
    aliases_zh: ["脾胃氣虛", "脾失健運"],
    aliases_en: ["Spleen and Stomach Qi Deficiency", "Impaired Spleen Transformation"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.spleen", "organ.stomach"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "neutral",
      excess_deficiency: "deficiency",
      yin_yang: "yin"
    },

    qi_blood_fluid_ids: ["qi"],
    pathogenic_factor_ids: [],

    short_summary_zh: "脾氣虛弱，運化水谷失職。以食少腹脹、飯後尤甚、大便溏薄、神疲乏力、肢體倦怠、面色萎黃為特徵。",
    short_summary_en: "Weakness of Spleen Qi impairing transportation and transformation of food and water. Characterized by poor appetite, postprandial abdominal distension, loose stools, fatigue, and sallow complexion.",

    key_manifestations_zh: ["食少納呆腹脹", "食後腹脹加重", "大便溏薄", "神疲乏力肢體倦怠", "面色萎黃舌邊齒痕"],
    key_manifestations_en: ["Poor Appetite & Bloating", "Postprandial Abdominal Fullness", "Loose Stools", "Mental Fatigue & Weak Limbs", "Sallow Complexion & Teethmarks"],

    tongue_preview: {
      zh: "舌質淡胖，邊有齒痕，苔薄白",
      en: "Pale swollen tongue with teethmarks and thin white coating"
    },
    pulse_preview: {
      zh: "脈緩無力或細弱",
      en: "Moderate, weak, or fine pulse"
    },

    differentiation_preview_zh: "消化系本虛病機：食少、腹脹、便溏、氣虛為四大診斷要點。為多數脾胃病與氣血生化不足之根本。",
    differentiation_preview_en: "Digestive Root Deficiency: Key indicators are poor appetite, bloating, loose stools, and tiredness. Root cause of fluid/blood deficiency.",
    exam_pearls_zh: "Bastyr Spleen Pathology & NCCAOM 考點：代表方四君子湯 (Si Jun Zi Tang) 或參苓白朮散。主穴：ST36 足三里、SP6 三陰交、RN12 中脘、BL20 脾俞。",

    treatment_principle_zh: "健脾益氣，和胃助運",
    treatment_principle_en: "Tonify Spleen Qi, harmonize Stomach, assist transportation",

    related_tcm_disease_ids: ["tdis.xie_xie", "tdis.fu_zhang", "tdis.xu_lao"],
    related_biomedical_condition_ids: ["cond.ibs", "cond.chronic_gastritis", "cond.anemia"],
    primary_formula_ids: ["formula.si_jun_zi_tang", "formula.shen_ling_bai_zhu_san"],
    primary_acupoint_ids: ["ST36", "SP6", "RN12", "BL20", "RN6"],

    tag_ids: ["脾氣虛", "健脾益氣", "四君子湯", "腹脹便溏"],
    source_ids: [
      "Bastyr_Spleen_Pathology_Notes_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026",
      "https://cloudtcm.com/pattern/spleen_qi_xu"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.kidney_yin_deficiency",
    entity_type: "tcm_pattern",
    name_zh: "腎陰虛",
    name_en: "Kidney Yin Deficiency",
    pinyin: "Shèn Yīn Xū",
    aliases_zh: ["腎水不足", "真陰虧損"],
    aliases_en: ["Kidney Yin Depletion", "Kidney Water Deficiency"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.kidney"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "heat",
      excess_deficiency: "deficiency",
      yin_yang: "yin"
    },

    qi_blood_fluid_ids: ["yin"],
    pathogenic_factor_ids: [],

    short_summary_zh: "腎陰虧虛，髓海失充，虛熱內生。以腰膝痠軟、頭暈耳鳴、失眠多夢、五心煩熱、潮熱盜汗、咽乾口燥為特徵。",
    short_summary_en: "Deficiency of Kidney Yin failing to nourish the marrow and generating internal Deficiency-Heat. Characterized by lumbar/knee soreness, tinnitus, insomnia, five-center heat, and night sweats.",

    key_manifestations_zh: ["腰膝痠軟無力", "頭暈耳鳴健忘", "失眠多夢", "五心煩熱潮熱盜汗", "咽乾口燥齒搖髮脫"],
    key_manifestations_en: ["Sore & Weak Lumbar/Knees", "Dizziness & Tinnitus", "Insomnia & Dreamful Sleep", "Five-Center Heat & Night Sweats", "Dry Throat & Loose Teeth"],

    tongue_preview: {
      zh: "舌質紅，少苔或無苔少津",
      en: "Red tongue with scanty or absent coating"
    },
    pulse_preview: {
      zh: "脈細數，尺脈尤甚",
      en: "Fine and rapid pulse, especially in the Chi position"
    },

    differentiation_preview_zh: "腎系本虛病機：腰膝痠軟、耳鳴、虛熱（潮熱盜汗手足心熱）為三大診斷要點。為更年期、慢性腎病核心。",
    differentiation_preview_en: "Kidney System Root Deficiency: Lumbar soreness, tinnitus, and deficiency-heat are key diagnostic features. Core pattern in menopausal syndrome.",
    exam_pearls_zh: "Bastyr TCM Pathology & NCCAOM 考點：代表方六味地黃丸 (Liu Wei Di Huang Wan)。君藥熟地黃滋補腎陰，臣藥山茱萸、山藥，佐藥澤瀉、丹皮、茯苓三瀉三補。",

    treatment_principle_zh: "滋補腎陰，培元固本",
    treatment_principle_en: "Nourish Kidney Yin, enrich the root",

    related_tcm_disease_ids: ["tdis.yao_tong", "tdis.xuan_yun", "tdis.er_ming"],
    related_biomedical_condition_ids: ["cond.menopausal_syndrome", "cond.chronic_kidney_disease", "cond.osteoporosis"],
    primary_formula_ids: ["formula.liu_wei_di_huang_wan"],
    primary_acupoint_ids: ["KI3", "KI6", "SP6", "BL23", "RN4"],

    tag_ids: ["腎陰虛", "滋補腎陰", "六味地黃丸", "腰膝痠軟"],
    source_ids: [
      "Bastyr_TCM_Pathology_Notes_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026",
      "https://cloudtcm.com/pattern/kidney_yin_xu"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.kidney_yang_deficiency",
    entity_type: "tcm_pattern",
    name_zh: "腎陽虛",
    name_en: "Kidney Yang Deficiency",
    pinyin: "Shèn Yáng Xū",
    aliases_zh: ["命門火衰", "腎火不足"],
    aliases_en: ["Decline of Mingmen Fire", "Kidney Yang Depletion"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.kidney"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "cold",
      excess_deficiency: "deficiency",
      yin_yang: "yang"
    },

    qi_blood_fluid_ids: ["yang"],
    pathogenic_factor_ids: ["cold"],

    short_summary_zh: "腎陽虧虛，命門火衰，溫煦失職。以腰膝酸冷、畏寒肢冷（下肢尤甚）、神疲乏力、小便清長夜尿多、陽痿或水腫為特徵。",
    short_summary_en: "Deficiency of Kidney Yang and decline of Gate of Vitality Fire. Characterized by cold soreness of lumbar/knees, aversion to cold with icy limbs, clear profuse nocturia, erectile dysfunction, or edema.",

    key_manifestations_zh: ["腰膝酸冷畏寒肢冷", "下肢冰冷尤甚", "神疲乏力", "小便清長夜尿頻多", "陽痿早洩或下肢水腫"],
    key_manifestations_en: ["Cold Soreness of Lumbar/Knees", "Cold Limbs (Lower Limbs Worse)", "Mental Fatigue", "Clear Profuse Nocturia", "Erectile Dysfunction or Edema"],

    tongue_preview: {
      zh: "舌質淡胖，苔白滑",
      en: "Pale swollen tongue with white slippery coating"
    },
    pulse_preview: {
      zh: "脈沉細無力，尺脈沉微",
      en: "Deep, fine, and weak pulse, especially faint in Chi position"
    },

    differentiation_preview_zh: "腎系虛寒病機：腰膝酸冷、畏寒肢冷、夜尿多、脈沉細為四大診斷要點。與腎陰虛（熱象、手足心熱）明確對照。",
    differentiation_preview_en: "Kidney Deficiency-Cold: Cold knees, aversion to cold, and nocturia are key diagnostic criteria. Clear contrast with Kidney Yin Deficiency.",
    exam_pearls_zh: "Bastyr TCM Pathology & NCCAOM 考點：代表方金匱腎氣丸 (Jin Kui Shen Qi Wan) 或右歸丸。主藥附子、肉桂溫補命門之火。",

    treatment_principle_zh: "溫補腎陽，補益命門",
    treatment_principle_en: "Warm and tonify Kidney Yang, replenish Gate of Vitality",

    related_tcm_disease_ids: ["tdis.yao_tong", "tdis.shui_zhong", "tdis.yang_wei"],
    related_biomedical_condition_ids: ["cond.hypothyroidism", "cond.chronic_nephritis", "cond.erectile_dysfunction"],
    primary_formula_ids: ["formula.jin_kui_shen_qi_wan", "formula.you_gui_wan"],
    primary_acupoint_ids: ["RN4", "GV4", "KI3", "BL23", "RN6"],

    tag_ids: ["腎陽虛", "溫補腎陽", "金匱腎氣丸", "畏寒肢冷"],
    source_ids: [
      "Bastyr_TCM_Pathology_Notes_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026",
      "https://cloudtcm.com/pattern/kidney_yang_xu"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.insomnia_heart_kidney_disharmony",
    entity_type: "tcm_pattern",
    name_zh: "心腎不交",
    name_en: "Heart and Kidney Disharmony",
    pinyin: "Xīn Shèn Bù Jiāo",
    aliases_zh: ["水火未濟", "心火亢盛腎陰不足"],
    aliases_en: ["Non-Interaction of Heart and Kidney", "Water and Fire Incompatibility"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.heart", "organ.kidney"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "heat",
      excess_deficiency: "mixed_deficiency_excess",
      yin_yang: "yang"
    },

    qi_blood_fluid_ids: ["yin"],
    pathogenic_factor_ids: ["fire"],

    short_summary_zh: "腎水不足，不能上濟心火；心火偏亢，不能下溫腎水。以心煩不寐、入睡困難、心悸健忘、頭暈耳鳴、腰膝痠軟、五心煩熱為特徵。",
    short_summary_en: "Kidney Water failing to rise to nourish Heart, while Heart Fire flares unrestrained. Characterized by severe insomnia, difficulty falling asleep, palpitations, tinnitus, lumbar soreness, and five-center heat.",

    key_manifestations_zh: ["心煩不寐入睡困難", "心悸健忘", "頭暈耳鳴腰膝痠軟", "五心煩熱潮熱盜汗", "口舌生瘡口乾"],
    key_manifestations_en: ["Severe Insomnia & Inability to Sleep", "Palpitations & Memory Loss", "Dizziness Tinnitus & Sore Knees", "Five-Center Heat & Night Sweats", "Mouth Ulcers & Dry Mouth"],

    tongue_preview: {
      zh: "舌質紅，舌尖紅，苔少",
      en: "Red tongue with red tip and scanty coating"
    },
    pulse_preview: {
      zh: "脈細數",
      en: "Fine and rapid pulse"
    },

    differentiation_preview_zh: "心腎失調病機：心火上炎（心煩失眠、舌尖紅）與腎陰下虛（腰膝痠軟、耳鳴）並見。治療強調「交通心腎、水火相濟」。",
    differentiation_preview_en: "Disharmony of Water and Fire: Heart Fire flaring (insomnia, red tip) coexisting with Kidney Yin deficiency (sore knees, tinnitus). Tx: Connect Heart and Kidney.",
    exam_pearls_zh: "Bastyr Insomnia Therapeutics & NCCAOM 考點：代表方黃連阿膠湯 (Huang Lian A Jiao Tang) 或交泰丸。主穴：HT7 神門、KI3 太溪、SP6 三陰交、Anmian 安眠。",

    treatment_principle_zh: "滋陰降火，交通心腎",
    treatment_principle_en: "Nourish Yin, clear Fire, harmonize Heart and Kidney",

    related_tcm_disease_ids: ["tdis.shi_mian", "tdis.xin_ji"],
    related_biomedical_condition_ids: ["cond.insomnia", "cond.anxiety"],
    primary_formula_ids: ["formula.huang_lian_a_jiao_tang", "formula.jiao_tai_wan"],
    primary_acupoint_ids: ["HT7", "KI3", "SP6", "EX-HN16", "BL15", "BL23"],

    tag_ids: ["心腎不交", "水火未濟", "黃連阿膠湯", "不寐"],
    source_ids: [
      "Bastyr_Insomnia_Therapeutics_Notes_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026",
      "https://cloudtcm.com/pattern/heart_kidney_disharmony"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  }
];

// Update pattern_library.json
const libraryPath = path.join(__dirname, '../data/pathology/pattern_library.json');
if (fs.existsSync(libraryPath)) {
  const lib = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
  batchPatterns.forEach(proto => {
    const idx = lib.records.findIndex(r => r.id === proto.id);
    if (idx !== -1) {
      lib.records[idx] = Object.assign({}, lib.records[idx], proto);
    } else {
      lib.records.push(proto);
    }
  });
  fs.writeFileSync(libraryPath, JSON.stringify(lib, null, 2), 'utf8');
  console.log(`Updated pattern_library.json with 5 new canonical patterns! Total records: ${lib.records.length}`);
}
