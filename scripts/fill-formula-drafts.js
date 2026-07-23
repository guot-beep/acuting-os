#!/usr/bin/env node
/**
 * Fill the 92 skeleton formulas in data/herbs/formulas.json with rich, sourced draft content.
 * Follows AGENTS.md content policy:
 * - Fill every field from professional sources (CloudTCM, HKBU, Bensky, classical texts)
 * - Keep review_status: "draft"
 * - Bilingual CJK and English
 * - Preserves stable IDs and source links
 */

const fs = require('fs');
const path = require('path');

const FORMULAS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'formulas.json');
const rawData = fs.readFileSync(FORMULAS_FILE, 'utf8');
const data = JSON.parse(rawData);

const formulaFills = {
  "formula.ba_zheng_san": {
    "source_classic": "《太平惠民和劑局方》",
    "composition": [
      { "herb_zh": "車前子", "herb_en": "Plantain Seed", "pinyin": "Che Qian Zi", "role_zh": "君", "role_en": "Chief", "dose_range": "9g" },
      { "herb_zh": "瞿麥", "herb_en": "Dianthus", "pinyin": "Qu Mai", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "萹蓄", "herb_en": "Polygonum Aviculare", "pinyin": "Bian Xu", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "滑石", "herb_en": "Talcum", "pinyin": "Hua Shi", "role_zh": "臣", "role_en": "Deputy", "dose_range": "15g" },
      { "herb_zh": "山梔子", "herb_en": "Gardenia Fruit", "pinyin": "Shan Zhi Zi", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "木通", "herb_en": "Akebia Stem", "pinyin": "Mu Tong", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "大黃", "herb_en": "Rhubarb Root", "pinyin": "Da Huang", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "甘草", "herb_en": "Licorice Root", "pinyin": "Gan Cao", "role_zh": "使", "role_en": "Envoy", "dose_range": "6g" },
      { "herb_zh": "燈心草", "herb_en": "Juncus Rush", "pinyin": "Deng Xin Cao", "role_zh": "使", "role_en": "Envoy", "dose_range": "3g" }
    ],
    "actions_zh": ["清熱瀉火", "利水通淋"],
    "actions_en": ["Clear heat and drain fire", "Promote urination and unblock painful urinary dysfunction"],
    "pattern_indications_zh": ["濕熱下注之熱淋、血淋", "尿頻尿急，溺時澀痛，淋漓不爽，小腹脹滿，口燥咽乾，舌苔黃膩，脈數有力"],
    "pattern_indications_en": ["Damp-heat poured downward pattern with hot or bloody painful urinary dysfunction", "Urinary frequency and urgency, burning dysuria, hesitant urination, lower abdominal distention, yellow greasy tongue coating, rapid forceful pulse"],
    "contraindications_zh": ["孕婦及體虛淋證、無濕熱者慎用。"],
    "contraindications_en": ["Use with caution in pregnancy, physical weakness, or urinary dysfunction without damp-heat."],
    "herb_drug_cautions": ["urinary_red_flags", "pregnancy_review", "dehydration_review"],
    "modern_clinical_use_tags": ["uti", "cystitis", "urethritis", "urolithiasis", "prostatitis"],
    "western_condition_links": ["urinary_pattern_support"],
    "related_formulas": ["formula.wu_ling_san", "formula.zhu_ling_tang", "formula.dao_chi_san"],
    "related_conditions": ["pattern.damp_heat"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E5%85%AB%E6%AD%A3%E6%95%A3",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 八正散 and HKBU CMFID.",
      "fang_yi_zh": "方中車前子、瞿麥、萹蓄、滑石清熱利濕、利尿通淋為君臣；梔子、木通清熱瀉火；大黃蕩滌濕熱；甘草、燈心和藥導熱下行。",
      "zhu_zhi_zh": "主治濕熱下注下焦所致熱淋、血淋，尿頻、尿急、尿痛。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Ba Zheng San.",
      "actions_en": ["Clear heat and drain fire", "Promote urination and unblock painful urinary dysfunction"],
      "pattern_indications_en": ["Damp-heat in lower burner causing dark, burning, painful, or bloody dysuria"],
      "modifications_en": ["Add Bai Mao Gen for blood dysuria", "Remove Da Huang if stools are loose"],
      "contraindications_en": ["Use with caution in pregnant patients or patients with spleen deficiency."]
    }
  },
  "formula.bai_du_san": {
    "source_classic": "《小兒藥證直訣》",
    "composition": [
      { "herb_zh": "羌活", "herb_en": "Notopterygium Root", "pinyin": "Qiang Huo", "role_zh": "君", "role_en": "Chief", "dose_range": "9g" },
      { "herb_zh": "獨活", "herb_en": "Pubescent Angelica Root", "pinyin": "Du Huo", "role_zh": "君", "role_en": "Chief", "dose_range": "9g" },
      { "herb_zh": "柴胡", "herb_en": "Bupleurum Root", "pinyin": "Chai Hu", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "前胡", "herb_en": "Peucedanum Root", "pinyin": "Qian Hu", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "川芎", "herb_en": "Szechuan Lovage Root", "pinyin": "Chuan Xiong", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "枳殼", "herb_en": "Bitter Orange Fruit", "pinyin": "Zhi Ke", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "桔梗", "herb_en": "Platycodon Root", "pinyin": "Jie Geng", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "茯苓", "herb_en": "Poria", "pinyin": "Fu Ling", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "人參", "herb_en": "Ginseng Root", "pinyin": "Ren Shen", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "甘草", "herb_en": "Licorice Root", "pinyin": "Gan Cao", "role_zh": "使", "role_en": "Envoy", "dose_range": "3g" }
    ],
    "actions_zh": ["散寒祛濕", "益氣解表"],
    "actions_en": ["Dispel cold and dampness", "Augment qi and release the exterior"],
    "pattern_indications_zh": ["氣虛外感風寒濕邪證", "憎寒壯熱，惡寒無汗，頭項強痛，肢體酸痛，咳嗽有痰，胸膈痞滿，舌苔白膩，脈浮按之無力"],
    "pattern_indications_en": ["Exterior wind-cold-dampness in qi deficiency pattern", "High fever with chills, absence of sweating, severe head and neck stiffness, body aches, cough with phlegm, chest fullness, white greasy tongue coating, floating weak pulse"],
    "contraindications_zh": ["外感風熱或陰虛外感者忌用。"],
    "contraindications_en": ["Contraindicated in exterior wind-heat or yin deficiency with exterior disorder."],
    "herb_drug_cautions": ["sweating", "febrile_illness", "medication_review"],
    "modern_clinical_use_tags": ["common_cold", "influenza", "bronchitis", "rheumatoid_arthritis"],
    "western_condition_links": ["common_cold_pattern_support"],
    "related_formulas": ["formula.jing_fang_bai_du_san", "formula.jiu_wei_qiang_huo_tang", "formula.shen_su_yin"],
    "related_conditions": ["pattern.exterior_wind_cold", "pattern.spleen_qi_deficiency"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E6%95%97%E6%AF%92%E6%95%A3",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 敗毒散.",
      "fang_yi_zh": "方中羌活、獨活散寒祛濕、通絡止痛為君；柴胡、前胡祛風解表、下氣化痰；川芎活血行氣；枳殼、桔梗宣降肺氣；茯苓健脾滲濕；人參益氣扶正以助祛斜。",
      "zhu_zhi_zh": "主治體虛外感風寒濕邪，惡寒發熱、頭痛肢酸、咳嗽喘急。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Bai Du San.",
      "actions_en": ["Dispel cold and dampness", "Augment qi and release the exterior"],
      "pattern_indications_en": ["Exterior wind-cold-dampness in a patient with qi deficiency"],
      "modifications_en": ["Replace Ren Shen with Jing Jie and Fang Feng for Jing Fang Bai Du San in robust patients"],
      "contraindications_en": ["Do not use for wind-heat patterns or patients with severe heat signs."]
    }
  },
  "formula.bai_he_gu_jin_tang": {
    "source_classic": "《慎齋遺書》",
    "composition": [
      { "herb_zh": "百合", "herb_en": "Lily Bulb", "pinyin": "Bai He", "role_zh": "君", "role_en": "Chief", "dose_range": "12g" },
      { "herb_zh": "熟地黃", "herb_en": "Prepared Rehmannia", "pinyin": "Shu Di Huang", "role_zh": "君", "role_en": "Chief", "dose_range": "12g" },
      { "herb_zh": "生地黃", "herb_en": "Rehmannia Root", "pinyin": "Sheng Di Huang", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "麥門冬", "herb_en": "Ophiopogon Tuber", "pinyin": "Mai Men Dong", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "玄參", "herb_en": "Scrophularia Root", "pinyin": "Xuan Shen", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "貝母", "herb_en": "Fritillaria Bulb", "pinyin": "Bei Mu", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "當歸", "herb_en": "Chinese Angelica Root", "pinyin": "Dang Gui", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "白芍", "herb_en": "White Peony Root", "pinyin": "Bai Shao", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "桔梗", "herb_en": "Platycodon Root", "pinyin": "Jie Geng", "role_zh": "使", "role_en": "Envoy", "dose_range": "6g" },
      { "herb_zh": "甘草", "herb_en": "Licorice Root", "pinyin": "Gan Cao", "role_zh": "使", "role_en": "Envoy", "dose_range": "3g" }
    ],
    "actions_zh": ["養陰潤肺", "化痰止咳"],
    "actions_en": ["Nourish yin and moisten Lungs", "Transform phlegm and relieve cough"],
    "pattern_indications_zh": ["肺腎陰虛，虛火上炎證", "咳嗽氣喘，痰中帶血，咽喉燥痛，午後潮熱，五心煩熱，盜汗，舌紅少苔，脈細數"],
    "pattern_indications_en": ["Lung and Kidney yin deficiency with flaring deficient fire pattern", "Coughing and wheezing, blood-streaked sputum, dry and sore throat, afternoon tidal fever, heat sensation in palms and soles, night sweats, red tongue with little coating, fine rapid pulse"],
    "contraindications_zh": ["脾虛便溏、食少腹脹或寒痰咳嗽者忌用。"],
    "contraindications_en": ["Contraindicated in spleen deficiency with loose stools, poor appetite, or cold-phlegm cough."],
    "herb_drug_cautions": ["cloying_digestive_effect", "respiratory_red_flags"],
    "modern_clinical_use_tags": ["bronchiectasis", "tuberculosis", "chronic_bronchitis", "pharyngitis"],
    "western_condition_links": ["cough_phlegm_pattern_support"],
    "related_formulas": ["formula.mai_men_dong_tang", "formula.qing_zao_jiu_fei_tang", "formula.liu_wei_di_huang_wan"],
    "related_conditions": ["pattern.lung_yin_deficiency", "pattern.kidney_yin_deficiency"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E7%99%BE%E5%90%88%E5%9B%BA%E9%87%91%E6%B9%AF",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 百合固金湯.",
      "fang_yi_zh": "方中百合、熟地滋養肺腎陰液為君；生地、麥冬、玄參清熱涼血、潤肺生津為臣；貝母化痰止咳，當歸、白芍養血柔肝，桔梗載藥上行肺經為使。",
      "zhu_zhi_zh": "主治肺腎陰虛、虛火上炎所致咳嗽咽痛、痰中帶血、午後潮熱。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Bai He Gu Jin Tang.",
      "actions_en": ["Nourish yin and moisten Lungs", "Transform phlegm and stop coughing"],
      "pattern_indications_en": ["Internal injury cough due to Lung-Kidney yin deficiency with deficient fire"],
      "modifications_en": ["Add E Jiao and Ce Bai Ye for heavy hemoptysis"],
      "contraindications_en": ["Avoid in spleen deficiency diarrhea or cold phlegm."]
    }
  },
  "formula.bai_hu_tang": {
    "source_classic": "《傷寒論》",
    "composition": [
      { "herb_zh": "石膏", "herb_en": "Gypsum", "pinyin": "Shi Gao", "role_zh": "君", "role_en": "Chief", "dose_range": "30g" },
      { "herb_zh": "知母", "herb_en": "Anemarrhena Rhizome", "pinyin": "Zhi Mu", "role_zh": "臣", "role_en": "Deputy", "dose_range": "18g" },
      { "herb_zh": "炙甘草", "herb_en": "Honey-fried Licorice", "pinyin": "Zhi Gan Cao", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "粳米", "herb_en": "Nonglutinous Rice", "pinyin": "Jing Mi", "role_zh": "使", "role_en": "Envoy", "dose_range": "9g" }
    ],
    "actions_zh": ["清熱生津"],
    "actions_en": ["Clear heat and generate fluids"],
    "pattern_indications_zh": ["陽明氣分熱盛證 (四大症)", "壯熱面赤，大汗出，大煩渴，脈洪大或滑數"],
    "pattern_indications_en": ["Yangming qi stage excess heat pattern (Four Bigs)", "High fever with red face, profuse sweating, extreme thirst with desire for cold drinks, flooding large or slippery rapid pulse"],
    "contraindications_zh": ["真寒假熱、表證未解、脈浮細或沉細者禁用。"],
    "contraindications_en": ["Contraindicated in true cold with false heat, unreleased exterior patterns, or thin fine pulse."],
    "herb_drug_cautions": ["cold_digestive_weakness", "febrile_illness"],
    "modern_clinical_use_tags": ["acute_febrile_illness", "pneumonia", "heat_stroke", "type_2_diabetes"],
    "western_condition_links": ["common_cold_pattern_support"],
    "related_formulas": ["formula.bai_hu_jia_ren_shen_tang", "formula.zhu_ye_shi_gao_tang", "formula.huang_lian_jie_du_tang"],
    "related_conditions": ["pattern.yangming_heat"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E7%99%BD%E8%99%8E%E6%B9%AF",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 白虎湯.",
      "fang_yi_zh": "方中石膏辛甘大寒，清瀉陽明氣分實熱為君；知母苦寒質潤，助石膏清熱兼滋陰潤燥為臣；甘草、粳米益胃和中、防止寒涼傷胃為佐使。",
      "zhu_zhi_zh": "主治陽明氣分熱盛，大熱、大渴、大汗、脈洪大四大症。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Bai Hu Tang.",
      "actions_en": ["Clear heat and generate fluid"],
      "pattern_indications_en": ["Yangming qi level heat with the Four Bigs: big fever, big sweat, big thirst, big pulse"],
      "modifications_en": ["Add Ren Shen for Bai Hu Jia Ren Shen Tang when qi and fluids are damaged"],
      "contraindications_en": ["Contraindicated in absence of sweating, float/fine pulse, or spleen cold."]
    }
  },
  "formula.ban_xia_bai_zhu_tian_ma_tang": {
    "source_classic": "《醫學心悟》",
    "composition": [
      { "herb_zh": "半夏", "herb_en": "Pinellia Rhizome", "pinyin": "Ban Xia", "role_zh": "君", "role_en": "Chief", "dose_range": "9g" },
      { "herb_zh": "天麻", "herb_en": "Gastrodia Rhizome", "pinyin": "Tian Ma", "role_zh": "君", "role_en": "Chief", "dose_range": "6g" },
      { "herb_zh": "白朮", "herb_en": "Atractylodes Macrocephala", "pinyin": "Bai Zhu", "role_zh": "臣", "role_en": "Deputy", "dose_range": "15g" },
      { "herb_zh": "茯苓", "herb_en": "Poria", "pinyin": "Fu Ling", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "橘紅", "herb_en": "Tangerine Peel", "pinyin": "Ju Hong", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "生薑", "herb_en": "Fresh Ginger", "pinyin": "Sheng Jiang", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "大棗", "herb_en": "Jujube Date", "pinyin": "Da Zao", "role_zh": "使", "role_en": "Envoy", "dose_range": "2枚" },
      { "herb_zh": "甘草", "herb_en": "Licorice Root", "pinyin": "Gan Cao", "role_zh": "使", "role_en": "Envoy", "dose_range": "3g" }
    ],
    "actions_zh": ["燥濕化痰", "平肝熄風"],
    "actions_en": ["Dry dampness and transform phlegm", "Pacify Liver and extinguish wind"],
    "pattern_indications_zh": ["風痰上擾證", "眩暈頭痛，胸悶嘔惡，舌苔白膩，脈弦滑"],
    "pattern_indications_en": ["Wind-phlegm disturbing upward pattern", "Dizziness, vertigo, headache, chest oppression, nausea and vomiting, white greasy tongue coating, wiry slippery pulse"],
    "contraindications_zh": ["陰虛陽亢所致頭暈、肝風內動無痰濕者慎用。"],
    "contraindications_en": ["Use with caution in dizziness due to yin deficiency with yang hyperactivity or liver wind without damp-phlegm."],
    "herb_drug_cautions": ["dizziness_pattern_review", "medication_review"],
    "modern_clinical_use_tags": ["meniere_disease", "hypertension", "vertigo", "t tension_headache"],
    "western_condition_links": ["dizziness_pattern_support"],
    "related_formulas": ["formula.er_chen_tang", "formula.tian_ma_gou_teng_yin", "formula.zhen_gan_xi_feng_tang"],
    "related_conditions": ["pattern.phlegm_damp"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E5%8D%8A%E5%A4%8F%E7%99%BD%E6%9C%AF%E5%A4%A9%E9%BA%BB%E6%B9%AF",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 半夏白朮天麻湯.",
      "fang_yi_zh": "方中半夏燥濕化痰降逆，天麻平肝熄風止眩，二藥合用為治風痰眩暈之要藥；白朮、茯苓健脾滲濕，杜絕生痰之源；陳皮理氣化痰；薑棗和中。",
      "zhu_zhi_zh": "主治風痰上擾所致眩暈頭痛、胸悶嘔惡。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Ban Xia Bai Zhu Tian Ma Tang.",
      "actions_en": ["Dry dampness and transform phlegm", "Pacify Liver and extinguish wind"],
      "pattern_indications_en": ["Wind-phlegm causing dizziness, vertigo, and headache"],
      "modifications_en": ["Add Ze Xie and Huang Bai for internal heat signs"],
      "contraindications_en": ["Contraindicated in dizziness from Liver yang hyperactivity without phlegm-damp."]
    }
  },
  "formula.ban_xia_hou_po_tang": {
    "source_classic": "《金匱要略》",
    "composition": [
      { "herb_zh": "半夏", "herb_en": "Pinellia Rhizome", "pinyin": "Ban Xia", "role_zh": "君", "role_en": "Chief", "dose_range": "12g" },
      { "herb_zh": "厚朴", "herb_en": "Magnolia Bark", "pinyin": "Hou Po", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "茯苓", "herb_en": "Poria", "pinyin": "Fu Ling", "role_zh": "臣", "role_en": "Deputy", "dose_range": "12g" },
      { "herb_zh": "生薑", "herb_en": "Fresh Ginger", "pinyin": "Sheng Jiang", "role_zh": "佐", "role_en": "Assistant", "dose_range": "15g" },
      { "herb_zh": "紫蘇葉", "herb_en": "Perilla Leaf", "pinyin": "Zi Su Ye", "role_zh": "使", "role_en": "Envoy", "dose_range": "6g" }
    ],
    "actions_zh": ["行氣散結", "降逆化痰"],
    "actions_en": ["Promote qi movement and dissipate clumps", "Direct rebellious qi downward and transform phlegm"],
    "pattern_indications_zh": ["痰氣交阻之梅核氣", "咽中如有物阻，咯之不出，咽之不下，胸脇滿悶，或咳或嘔，舌苔白潤或白膩，脈弦緩或弦滑"],
    "pattern_indications_en": ["Phlegm and qi stagnation causing Plum Pit Qi (globus hystericus)", "Subjective sensation of something lodged in the throat that cannot be hawked up or swallowed down, chest or hypochondriac fullness, cough or vomiting, white moist or greasy tongue coating, wiry slow or wiry slippery pulse"],
    "contraindications_zh": ["陰虛津傷、咽痛偏於熱證者忌用。"],
    "contraindications_en": ["Contraindicated in yin deficiency with fluid damage or sore throat due to heat pattern."],
    "herb_drug_cautions": ["dryness_review", "gi_red_flags"],
    "modern_clinical_use_tags": ["globus_hystericus", "gerd", "chronic_pharyngitis", "neurosis", "esophageal_spasm"],
    "western_condition_links": ["nausea_pattern_support", "reflux_pattern_support"],
    "related_formulas": ["formula.er_chen_tang", "formula.yue_ju_wan", "formula.chai_hu_shu_gan_san"],
    "related_conditions": ["pattern.liver_qi_stagnation", "pattern.phlegm_damp"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E5%8D%8A%E5%A4%8F%E5%8E%9A%E6%9C%B4%E6%B9%AF",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 半夏厚朴湯.",
      "fang_yi_zh": "方中半夏辛溫燥濕化痰、降逆散結為君；厚朴苦溫下氣、消除胸腹脹滿為臣；茯苓健脾滲濕，生薑溫胃止嘔為佐；紫蘇葉芳香理氣、暢達肝肺為使。",
      "zhu_zhi_zh": "主治婦人或男子痰氣交阻所致梅核氣，咽中物阻感、胸脅滿悶。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Ban Xia Hou Po Tang.",
      "actions_en": ["Move qi and dissipate clumps", "Lower rebellious qi and transform phlegm"],
      "pattern_indications_en": ["Plum pit qi (globus hystericus) due to emotional stress and phlegm-qi stagnation"],
      "modifications_en": ["Add Xiang Fu and Sha Ren for stomach pain and severe qi stagnation"],
      "contraindications_en": ["Contraindicated in red throat or yin deficiency with heat."]
    }
  },
  "formula.bao_he_wan": {
    "source_classic": "《丹溪心法》",
    "composition": [
      { "herb_zh": "山楂", "herb_en": "Hawthorn Fruit", "pinyin": "Shan Zha", "role_zh": "君", "role_en": "Chief", "dose_range": "18g" },
      { "herb_zh": "神曲", "herb_en": "Massa Fermentata", "pinyin": "Shen Qu", "role_zh": "臣", "role_en": "Deputy", "dose_range": "12g" },
      { "herb_zh": "萊菔子", "herb_en": "Radish Seed", "pinyin": "Lai Fu Zi", "role_zh": "臣", "role_en": "Deputy", "dose_range": "6g" },
      { "herb_zh": "半夏", "herb_en": "Pinellia Rhizome", "pinyin": "Ban Xia", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "茯苓", "herb_en": "Poria", "pinyin": "Fu Ling", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "陳皮", "herb_en": "Tangerine Peel", "pinyin": "Chen Pi", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "連翹", "herb_en": "Forsythia Fruit", "pinyin": "Lian Qiao", "role_zh": "使", "role_en": "Envoy", "dose_range": "6g" }
    ],
    "actions_zh": ["消食和胃"],
    "actions_en": ["Reduce food stagnation and harmonize Stomach"],
    "pattern_indications_zh": ["食積停滯證", "脘腹脹滿，噯腐吞酸，惡食嘔吐，大便溏洩或便秘，苔黃厚膩，脈滑"],
    "pattern_indications_en": ["Food stagnation pattern", "Epigastric and abdominal distention and fullness, acid regurgitation, belching with foul odor, aversion to food, vomiting, diarrhea or constipation, thick greasy tongue coating, slippery pulse"],
    "contraindications_zh": ["脾虛無食積者慎用。"],
    "contraindications_en": ["Use with caution in spleen deficiency without food stagnation."],
    "herb_drug_cautions": ["gi_red_flags"],
    "modern_clinical_use_tags": ["dyspepsia", "acute_gastritis", "pediatric_indigestion", "food_poisoning"],
    "western_condition_links": ["digestive_pattern_support"],
    "related_formulas": ["formula.jian_pi_wan", "formula.zhi_shi_dao_zhi_wan", "formula.ping_wei_san"],
    "related_conditions": ["pattern.food_stagnation"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E4%BF%9D%E5%92%8C%E4%B8%B8",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 保和丸.",
      "fang_yi_zh": "方中重用山楂消肉食油膩之積為君；神曲消酒食穀積，萊菔子消麵食痰積為臣；半夏、陳皮理氣和胃止嘔，茯苓健脾滲濕為佐；連翹清食積所化之熱為使。",
      "zhu_zhi_zh": "主治食積停滯，脘腹脹滿、噯腐吞酸、惡食嘔吐。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Bao He Wan.",
      "actions_en": ["Reduce food stagnation and harmonize Stomach"],
      "pattern_indications_en": ["Food retention causing epigastric fullness, acid regurgitation, and aversion to food"],
      "modifications_en": ["Add Mu Xiang and Bing Lang for severe abdominal pain and constipation"],
      "contraindications_en": ["Not for pure spleen deficiency without food accumulation."]
    }
  }
};

console.log('Loading formulas...');
let count = 0;
data.records.forEach(r => {
  if (formulaFills[r.id]) {
    const fill = formulaFills[r.id];
    Object.assign(r, fill);
    r.review_status = "draft";
    r.public_safe = false;
    r.source_type = "draft_dual_track_hkbu_cloudtcm_bensky_pending";
    count++;
  }
});

console.log(`Updated ${count} formula records in initial batch.`);

fs.writeFileSync(FORMULAS_FILE, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully wrote updated formulas.json.');
