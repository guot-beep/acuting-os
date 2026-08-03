/**
 * scripts/build_lin_syndrome_patterns.js
 * Builds the Lin Syndrome (淋證) Pattern Cards from Bastyr MM2 & Board Outline
 * Source: curriculum/conditions/MM2-Lin Syndrome-Overview.md (Erin Stewart, DAOM, LAc & Maciocia)
 */

const fs = require('fs');
const path = require('path');

const linPatterns = [
  {
    id: "pattern.heat_lin",
    entity_type: "tcm_pattern",
    name_zh: "熱淋",
    name_en: "Heat Lin (Damp-Heat Bladder Pattern)",
    pinyin: "Rè Lín",
    aliases_zh: ["膀胱濕熱證", "熱淋證"],
    aliases_en: ["Heat Dysuria Pattern", "Bladder Damp-Heat Lin"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.bladder", "organ.kidney"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "heat",
      excess_deficiency: "excess",
      yin_yang: "yang"
    },

    qi_blood_fluid_ids: ["fluid"],
    pathogenic_factor_ids: ["damp_heat"],

    short_summary_zh: "濕熱蘊結下焦，膀胱氣化失司。以小便頻急刺痛、尿色黃赤短少、小腹急痛、發熱惡寒為特徵。",
    short_summary_en: "Damp-Heat accumulating in the Lower Burner, impairing Bladder Qi transformation. Characterized by frequent, urgent, burning urination with dark, scanty urine and lower abdominal distension.",

    key_manifestations_zh: ["尿頻尿急灼熱刺痛", "尿色黃赤短少", "小腹脹痛拒按", "口苦口渴", "或伴發熱惡寒"],
    key_manifestations_en: ["Frequent Urgent Burning Urination", "Dark Scanty Reddish Urine", "Lower Abdominal Pain/Distension", "Bitter Taste & Thirst", "Possible Fever & Chills"],

    tongue_preview: {
      zh: "舌質紅，苔黃膩",
      en: "Red tongue body with yellow greasy coating"
    },
    pulse_preview: {
      zh: "脈滑數",
      en: "Slippery and rapid pulse"
    },

    differentiation_preview_zh: "下焦實熱證：以小便頻急灼熱、刺痛短赤為診斷要點。多因飲食不節（過食辛辣油脂飲酒）或外感濕熱下注引發。",
    differentiation_preview_en: "Lower Burner Excess Heat: Burning urgent dysuria is key diagnostic criteria. Triggered by greasy spicy food, alcohol, or external Damp-Heat invasion.",
    exam_pearls_zh: "Bastyr MM2 & NCCAOM 考點：代表方八正散（八正散 = 滑石、木通、車前子、萁麥、萁蓄、梔子、大黃、甘草）。核心草藥：滑石、木通、車前子、梔子、燈心草。",

    treatment_principle_zh: "清熱利濕，通淋止痛",
    treatment_principle_en: "Clear Heat, drain Dampness, unblock urination",

    related_tcm_disease_ids: ["tdis.lin_zheng"],
    related_biomedical_condition_ids: ["cond.uti", "cond.cystitis", "cond.prostatitis"],
    primary_formula_ids: ["formula.ba_zheng_san"],
    primary_acupoint_ids: ["BL28", "CV3", "SP9", "BL60", "SP6"],

    tag_ids: ["熱淋", "膀胱濕熱", "清熱利濕", "通淋止痛"],
    source_ids: [
      "Bastyr_MM2_Lin_Syndrome_Overview_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026",
      "Maciocia_Practice_of_Chinese_Medicine_2nd",
      "https://cloudtcm.com/pattern/re_lin"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.stone_lin",
    entity_type: "tcm_pattern",
    name_zh: "石淋",
    name_en: "Stone Lin (Urinary Calculus Pattern)",
    pinyin: "Shí Lín",
    aliases_zh: ["砂淋", "結石下注"],
    aliases_en: ["Gravel Lin", "Urolithiasis Pattern"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.bladder", "organ.kidney"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "heat",
      excess_deficiency: "excess",
      yin_yang: "yang"
    },

    qi_blood_fluid_ids: ["fluid"],
    pathogenic_factor_ids: ["damp_heat", "stone"],

    short_summary_zh: "濕熱久蘊下焦，煎熬尿液，凝結成砂石。以腰腹絞痛、尿中夾砂石或血尿、尿道刺痛為特徵。",
    short_summary_en: "Damp-Heat long accumulating in the Lower Burner, condensing urine into sand or stones. Characterized by severe colicky flank/abdominal pain, sand in urine, or hematuria.",

    key_manifestations_zh: ["腰腹劇烈絞痛", "痛引少腹或陰部", "尿中排出砂石", "尿色紅赤或血尿", "小便頻急難排"],
    key_manifestations_en: ["Severe Colicky Flank/Abdominal Pain", "Pain Radiating to Groin", "Passage of Sand/Stones in Urine", "Blood-Tinged Hematuria", "Painful Dribbling Urination"],

    tongue_preview: {
      zh: "舌紅，苔黃膩或厚",
      en: "Red tongue with thick yellow greasy coating"
    },
    pulse_preview: {
      zh: "脈弦數或滑數",
      en: "Wiry or slippery, rapid pulse"
    },

    differentiation_preview_zh: "實證砂石病機：腰腹陣發性絞痛、痛引少腹、排出砂石為三大診斷要點。當加「軟堅散結排石」藥。",
    differentiation_preview_en: "Excess Stone Pathomechanism: Paroxysmal colicky flank pain radiating to groin and presence of gravel. Requires herbs that soften hardness and dissolve stones.",
    exam_pearls_zh: "Maciocia & Bastyr 考點：必加軟堅排石核心藥對「金錢草、海金沙、雞內金」。代表方三金湯、石韋散。",

    treatment_principle_zh: "清熱利濕，通淋排石，止痛",
    treatment_principle_en: "Clear Heat, drain Damp, promote urination, expel stones, relieve pain",

    related_tcm_disease_ids: ["tdis.lin_zheng"],
    related_biomedical_condition_ids: ["cond.urolithiasis", "cond.nephrolithiasis"],
    primary_formula_ids: ["formula.shi_wei_san"],
    primary_acupoint_ids: ["BL28", "CV3", "KI5", "BL23", "SP9"],

    tag_ids: ["石淋", "通淋排石", "三金藥對", "腰痛"],
    source_ids: [
      "Bastyr_MM2_Lin_Syndrome_Overview_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026",
      "Maciocia_Practice_of_Chinese_Medicine_2nd"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.qi_lin_excess",
    entity_type: "tcm_pattern",
    name_zh: "氣淋 (實證)",
    name_en: "Qi Lin - Excess Type (Liver Qi Stagnation)",
    pinyin: "Qì Lín Shí Zhèng",
    aliases_zh: ["肝鬱氣滯氣淋"],
    aliases_en: ["Dysuria from Liver Qi Stagnation"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.liver", "organ.bladder"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "neutral",
      excess_deficiency: "excess",
      yin_yang: "yang"
    },

    qi_blood_fluid_ids: ["qi"],
    pathogenic_factor_ids: ["qi_stagnation"],

    short_summary_zh: "肝氣鬱結，氣機阻滯，膀胱氣化失暢。以小便澀滯、滴瀝不暢、臍下急痛、脅肋脹滿、隨情志變化加重為特徵。",
    short_summary_en: "Liver Qi stagnation obstructing Qi movement and Bladder transformation. Characterized by hesitant dribbling urination, hypogastric distress, flank distension, and aggravation by emotional stress.",

    key_manifestations_zh: ["小便澀滯滴瀝", "少腹臍下急痛", "脅肋脹滿", "隨情志波動加重", "情志抑鬱易怒"],
    key_manifestations_en: ["Hesitant Dribbling Urination", "Acute Hypogastric Distress", "Flank Distension & Fullness", "Aggravated by Stress/Emotions", "Irritability & Emotional Stress"],

    tongue_preview: {
      zh: "舌苔薄白",
      en: "Thin white tongue coating"
    },
    pulse_preview: {
      zh: "脈弦",
      en: "Wiry pulse"
    },

    differentiation_preview_zh: "氣滯實證：排尿困難隨情緒焦慮或生氣加重，無明顯尿道灼熱，伴脅脹腹滿。治當疏肝理氣。",
    differentiation_preview_en: "Qi Stagnation Excess: Dysuria worsens with stress/anger, without severe burning heat. Accompanied by flank distension.",
    exam_pearls_zh: "Maciocia & Bastyr 考點：代表方沉香散 (Chen Xiang San)。疏肝理氣、利尿通淋。",

    treatment_principle_zh: "疏肝理氣，利尿通淋",
    treatment_principle_en: "Soothe the Liver, regulate Qi, unblock urination",

    related_tcm_disease_ids: ["tdis.lin_zheng"],
    related_biomedical_condition_ids: ["cond.prostatitis", "cond.neurogenic_bladder"],
    primary_formula_ids: ["formula.chen_xiang_san"],
    primary_acupoint_ids: ["LR3", "GB34", "CV3", "BL28", "PC6"],

    tag_ids: ["氣淋", "實證氣淋", "疏肝理氣", "情志因素"],
    source_ids: [
      "Bastyr_MM2_Lin_Syndrome_Overview_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026",
      "Maciocia_Practice_of_Chinese_Medicine_2nd"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.blood_lin_excess",
    entity_type: "tcm_pattern",
    name_zh: "血淋 (實熱證)",
    name_en: "Blood Lin - Excess Heat Pattern",
    pinyin: "Xuè Lín Shí Zhèng",
    aliases_zh: ["熱灼血絡血淋"],
    aliases_en: ["Dysuria with Hematuria from Blood Heat"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.bladder", "organ.heart"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "heat",
      excess_deficiency: "excess",
      yin_yang: "yang"
    },

    qi_blood_fluid_ids: ["blood"],
    pathogenic_factor_ids: ["heat", "blood_heat"],

    short_summary_zh: "實熱下注，灼傷血絡，迫血妄行。以小便頻急刺痛、尿色鮮紅或夾有血塊、心煩口渴為特徵。",
    short_summary_en: "Excess Heat pouring downward into Bladder, injuring Blood collaterals and forcing Blood to spill. Characterized by sharp pain, bright red urine or blood clots, and thirst.",

    key_manifestations_zh: ["小便頻急熱痛", "尿色鮮紅或夾血塊", "尿道割痛難忍", "心煩口渴", "小腹脹痛"],
    key_manifestations_en: ["Frequent Urgent Painful Urination", "Bright Red Urine or Clots", "Severe Stabbing Pain in Urethra", "Irritability & Thirst", "Lower Abdominal Pain"],

    tongue_preview: {
      zh: "舌質紅，苔黃",
      en: "Red tongue body with yellow coating"
    },
    pulse_preview: {
      zh: "脈數有力",
      en: "Rapid and forceful pulse"
    },

    differentiation_preview_zh: "血分實熱證：尿血鮮紅、割痛難忍。與虛證血淋（尿色淡紅、微痛或無痛、體倦）相對照。",
    differentiation_preview_en: "Blood Level Excess Heat: Bright red urine with severe cutting pain. Contrasts with Deficiency Blood Lin (pale red urine, mild ache, fatigue).",
    exam_pearls_zh: "Bastyr MM2 & NCCAOM 考點：代表方小薊飲子 (Xiao Ji Yin Zi)。涼血止痛、清熱通淋。",

    treatment_principle_zh: "清熱涼血，通淋止血",
    treatment_principle_en: "Clear Heat, cool Blood, stop bleeding, unblock urination",

    related_tcm_disease_ids: ["tdis.lin_zheng", "tdis.niao_xue"],
    related_biomedical_condition_ids: ["cond.hematuria", "cond.acute_cystitis"],
    primary_formula_ids: ["formula.xiao_ji_yin_zi"],
    primary_acupoint_ids: ["SP10", "BL17", "BL28", "CV3", "SP6"],

    tag_ids: ["血淋", "涼血止血", "小薊飲子", "血尿"],
    source_ids: [
      "Bastyr_MM2_Lin_Syndrome_Overview_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026",
      "Maciocia_Practice_of_Chinese_Medicine_2nd"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.cloudy_lin",
    entity_type: "tcm_pattern",
    name_zh: "膏淋",
    name_en: "Cloudy Lin (Chyluria Pattern)",
    pinyin: "Gāo Lín",
    aliases_zh: ["乳溺", "濁淋"],
    aliases_en: ["Turbid Dysuria Pattern", "Chylous Lin"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.spleen", "organ.kidney", "organ.bladder"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "damp_neutral",
      excess_deficiency: "mixed_deficiency_excess",
      yin_yang: "yin"
    },

    qi_blood_fluid_ids: ["fluid"],
    pathogenic_factor_ids: ["dampness", "turbidity"],

    short_summary_zh: "濕熱阻滯下焦，清濁不分，脂液下薛。以小便混濁如米泔水或如脂膏、尿道熱澀刺痛為特徵。",
    short_summary_en: "Damp-Heat obstructing Lower Burner, failing to separate clear from turbid, allowing fat/essence to spill into urine. Characterized by milky, turbid, or greasy urine with urethral discomfort.",

    key_manifestations_zh: ["小便混濁如米泔水", "小便浮油如脂膏", "尿道熱澀疼痛", "小腹沉重感", "口黏不渴"],
    key_manifestations_en: ["Milky Turbid Rice-Water Urine", "Greasy Fatty Substance Floating in Urine", "Urethral Burning & Pain", "Lower Abdominal Heaviness", "Sticky Mouth Without Thirst"],

    tongue_preview: {
      zh: "舌質紅，苔白膩或黃膩",
      en: "Red tongue with white or yellow greasy coating"
    },
    pulse_preview: {
      zh: "脈濡數或滑數",
      en: "Soggy, slippery, or rapid pulse"
    },

    differentiation_preview_zh: "清濁不分病機：尿液渾濁呈米泔或脂膏狀。實證多由濕熱下注，虛證多由脾腎不固。",
    differentiation_preview_en: "Turbidity Separation Pathomechanism: Milky or greasy urine appearance. Excess is caused by Damp-Heat; Deficiency is caused by Spleen/Kidney unsteadiness.",
    exam_pearls_zh: "Bastyr MM2 & Maciocia 考點：代表方萆薢分清飲 (Bi Xie Fen Qing Yin)。分清別濁、萆薢清熱利濕。",

    treatment_principle_zh: "清熱利濕，分清泄濁",
    treatment_principle_en: "Clear Heat, drain Dampness, separate clear from turbid",

    related_tcm_disease_ids: ["tdis.lin_zheng"],
    related_biomedical_condition_ids: ["cond.chyluria", "cond.lipiduria"],
    primary_formula_ids: ["formula.bi_xie_fen_qing_yin"],
    primary_acupoint_ids: ["CV3", "BL28", "SP9", "ST40", "KI3"],

    tag_ids: ["膏淋", "分清別濁", "萆薢分清飲", "尿濁"],
    source_ids: [
      "Bastyr_MM2_Lin_Syndrome_Overview_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026",
      "Maciocia_Practice_of_Chinese_Medicine_2nd"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  },
  {
    id: "pattern.fatigue_lin",
    entity_type: "tcm_pattern",
    name_zh: "勞淋",
    name_en: "Fatigue Lin (Exhaustion Dysuria Pattern)",
    pinyin: "Láo Lín",
    aliases_zh: ["久淋", "虛淋"],
    aliases_en: ["Recurrent Chronic Lin Pattern"],

    status: "draft",
    review_status: "draft",
    schema_version: "v1.0",

    pattern_category: "zang_fu",
    zang_fu_ids: ["organ.kidney", "organ.spleen"],

    eight_principles: {
      interior_exterior: "interior",
      heat_cold: "cold_neutral",
      excess_deficiency: "deficiency",
      yin_yang: "yin"
    },

    qi_blood_fluid_ids: ["qi", "yin"],
    pathogenic_factor_ids: [],

    short_summary_zh: "久病淋濁，脾腎虧虛，正氣耗傷。以小便淋漓不已、時作時止、遇勞即發、腰膝痠軟、神疲乏力為特徵。",
    short_summary_en: "Chronic Lin depleting Spleen and Kidney Qi/Yin. Characterized by recurrent dribbling dysuria triggered by physical or mental exertion, accompanied by fatigue and weak lumbar/knees.",

    key_manifestations_zh: ["小便淋漓時作時止", "遇勞累即發作加重", "小腹墜脹隱痛", "腰膝痠軟無力", "神疲乏力面色少華"],
    key_manifestations_en: ["Recurrent Dribbling Urination", "Triggered/Worsened by Exertion", "Bearing-Down Abdominal Discomfort", "Weak Sore Lumbar & Knees", "Mental Fatigue & Sallow Complexion"],

    tongue_preview: {
      zh: "舌質淡，苔薄白",
      en: "Pale tongue with thin white coating"
    },
    pulse_preview: {
      zh: "脈沉細無力",
      en: "Deep, fine, and weak pulse"
    },

    differentiation_preview_zh: "脾腎本虛病機：病程長，平時隱痛或微感不適，一有勞累或性生活即急性發作。治當補益脾腎。",
    differentiation_preview_en: "Spleen & Kidney Root Deficiency: Chronic course, low-grade discomfort flared up by fatigue or overwork. Tx: Tonify Spleen & Kidney.",
    exam_pearls_zh: "Bastyr MM2 & Maciocia 考點：代表方無比山藥丸 (Wu Bi Shan Yao Wan) 或補中益氣湯加減。益氣滋陰、固澀小便。",

    treatment_principle_zh: "健脾益氣，補腎固澀",
    treatment_principle_en: "Tonify Spleen Qi, strengthen Kidney, consolidate urination",

    related_tcm_disease_ids: ["tdis.lin_zheng"],
    related_biomedical_condition_ids: ["cond.recurrent_uti", "cond.chronic_prostatitis"],
    primary_formula_ids: ["formula.wu_bi_shan_yao_wan", "formula.bu_zhong_yi_qi_tang"],
    primary_acupoint_ids: ["BL23", "BL20", "RN6", "ST36", "KI3", "SP6"],

    tag_ids: ["勞淋", "久淋", "健脾補腎", "遇勞即發"],
    source_ids: [
      "Bastyr_MM2_Lin_Syndrome_Overview_2025",
      "NCBAHM_CH_Exam_Content_Outline_2026",
      "Maciocia_Practice_of_Chinese_Medicine_2nd"
    ],

    created_at: "2026-08-02",
    updated_at: "2026-08-02",
    last_reviewed_at: "2026-08-02"
  }
];

// 1. Write prototypes to data/pathology/tcm_pattern_lin_syndrome.json
const protoPath = path.join(__dirname, '../data/pathology/tcm_pattern_lin_syndrome.json');
fs.writeFileSync(protoPath, JSON.stringify(linPatterns, null, 2), 'utf8');
console.log(`Saved 6 Lin Syndrome pattern cards to ${protoPath}`);

// 2. Update data/pathology/pattern_library.json with these enriched records
const libraryPath = path.join(__dirname, '../data/pathology/pattern_library.json');
if (fs.existsSync(libraryPath)) {
  const lib = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
  linPatterns.forEach(proto => {
    const idx = lib.records.findIndex(r => r.id === proto.id);
    if (idx !== -1) {
      lib.records[idx] = Object.assign({}, lib.records[idx], proto);
    } else {
      lib.records.push(proto);
    }
  });
  fs.writeFileSync(libraryPath, JSON.stringify(lib, null, 2), 'utf8');
  console.log(`Updated pattern_library.json with 6 Lin Syndrome patterns! Total records: ${lib.records.length}`);
}
