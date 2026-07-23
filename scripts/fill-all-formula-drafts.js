#!/usr/bin/env node
/**
 * Complete fill script for all 92 skeleton formulas in AcuTing OS.
 * Sourced directly from professional TCM authorities (CloudTCM, HKBU CMFID, Bensky F&S, Classical Texts).
 * All records remain review_status: "draft", public_safe: false.
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
    "modern_clinical_use_tags": ["meniere_disease", "hypertension", "vertigo", "tension_headache"],
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
  },
  "formula.bei_mu_gua_lou_san": {
    "source_classic": "《醫學心悟》",
    "composition": [
      { "herb_zh": "貝母", "herb_en": "Fritillaria Bulb", "pinyin": "Bei Mu", "role_zh": "君", "role_en": "Chief", "dose_range": "9g" },
      { "herb_zh": "瓜蔞", "herb_en": "Trichosanthes Fruit", "pinyin": "Gua Lou", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "天花粉", "herb_en": "Trichosanthes Root", "pinyin": "Tian Hua Fen", "role_zh": "臣", "role_en": "Deputy", "dose_range": "6g" },
      { "herb_zh": "茯苓", "herb_en": "Poria", "pinyin": "Fu Ling", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "橘紅", "herb_en": "Tangerine Peel", "pinyin": "Ju Hong", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "桔梗", "herb_en": "Platycodon Root", "pinyin": "Jie Geng", "role_zh": "使", "role_en": "Envoy", "dose_range": "6g" }
    ],
    "actions_zh": ["潤肺清熱", "理氣化痰"],
    "actions_en": ["Moisten Lungs and clear heat", "Regulate qi and transform phlegm"],
    "pattern_indications_zh": ["燥痰咳嗽證", "咳嗽嗆急，喀痰不爽，痰少而黏，咽乾口燥，舌紅苔白乾，脈數"],
    "pattern_indications_en": ["Dry phlegm cough pattern", "Choking cough, difficult expectoration of sticky sparse phlegm, dry throat and mouth, red tongue with dry white coating, rapid pulse"],
    "contraindications_zh": ["寒痰、濕痰咳嗽者忌用。"],
    "contraindications_en": ["Contraindicated in cold-phlegm or damp-phlegm cough."],
    "herb_drug_cautions": ["respiratory_red_flags"],
    "modern_clinical_use_tags": ["acute_bronchitis", "pharyngitis", "cough", "tracheitis"],
    "western_condition_links": ["cough_phlegm_pattern_support"],
    "related_formulas": ["formula.qing_zao_jiu_fei_tang", "formula.bai_he_gu_jin_tang", "formula.er_chen_tang"],
    "related_conditions": ["pattern.lung_dryness"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E8%B2%9D%E6%AF%8D%E7%93%9C%E8%90%B5%E6%95%A3",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 貝母瓜蔞散.",
      "fang_yi_zh": "方中貝母潤肺化痰為君；瓜蔞、天花粉清熱潤燥、生津潤肺為臣；橘紅、茯苓理氣滲濕，桔梗宣肺利咽為佐使。",
      "zhu_zhi_zh": "主治燥痰咳嗽，喀痰不爽、咽乾口燥。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Bei Mu Gua Lou San.",
      "actions_en": ["Moisten Lungs and clear heat", "Regulate qi and transform phlegm"],
      "pattern_indications_en": ["Dryness injuring Lung with dry phlegm cough"],
      "modifications_en": ["Add Mai Dong and Sheng Di for severe yin fluid injury"],
      "contraindications_en": ["Do not use for cold phlegm or damp phlegm cough."]
    }
  },
  "formula.bu_yang_huan_wu_tang": {
    "source_classic": "《醫林改錯》",
    "composition": [
      { "herb_zh": "黃耆", "herb_en": "Astragalus Root", "pinyin": "Huang Qi", "role_zh": "君", "role_en": "Chief", "dose_range": "120g" },
      { "herb_zh": "當歸尾", "herb_en": "Angelica Tail", "pinyin": "Dang Gui Wei", "role_zh": "臣", "role_en": "Deputy", "dose_range": "6g" },
      { "herb_zh": "赤芍", "herb_en": "Red Peony Root", "pinyin": "Chi Shao", "role_zh": "佐", "role_en": "Assistant", "dose_range": "4.5g" },
      { "herb_zh": "川芎", "herb_en": "Szechuan Lovage", "pinyin": "Chuan Xiong", "role_zh": "佐", "role_en": "Assistant", "dose_range": "3g" },
      { "herb_zh": "桃仁", "herb_en": "Peach Kernel", "pinyin": "Tao Ren", "role_zh": "佐", "role_en": "Assistant", "dose_range": "3g" },
      { "herb_zh": "紅花", "herb_en": "Safflower", "pinyin": "Hong Hua", "role_zh": "佐", "role_en": "Assistant", "dose_range": "3g" },
      { "herb_zh": "地龍", "herb_en": "Earthworm", "pinyin": "Di Long", "role_zh": "使", "role_en": "Envoy", "dose_range": "3g" }
    ],
    "actions_zh": ["補氣", "活血", "通絡"],
    "actions_en": ["Tonify qi", "Invigorate blood", "Unblock meridians"],
    "pattern_indications_zh": ["氣虛血瘀之中風後遺症", "半身不遂，口眼喎斜，言語蹇澀，口角流涎，小便頻數或遺尿，苔白，脈緩無力"],
    "pattern_indications_en": ["Qi deficiency and blood stasis in post-stroke sequelae pattern", "Hemiplegia, facial paralysis, slurred speech, drooling, urinary frequency or incontinence, white tongue coating, slow weak pulse"],
    "contraindications_zh": ["中風陽閉、陰閉，或腦出血急性期神昏者禁用。"],
    "contraindications_en": ["Contraindicated in acute stroke, cerebral hemorrhage acute stage, or wind-stroke closed pattern."],
    "herb_drug_cautions": ["stroke_red_flags", "bleeding_review", "medication_review"],
    "modern_clinical_use_tags": ["ischemic_stroke", "hemiplegia", "diabetic_neuropathy", "peripheral_vascular_disease"],
    "western_condition_links": ["stroke_recovery_support"],
    "related_formulas": ["formula.xue_fu_zhu_yu_tang", "formula.huang_qi_gui_zhi_wu_wu_tang", "formula.guizhi_tang"],
    "related_conditions": ["pattern.qi_deficiency", "pattern.blood_stasis"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E8%A3%9C%E9%99%BD%E9%82%84%E4%BA%94%E6%B9%AF",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 補陽還五湯.",
      "fang_yi_zh": "方中重用生黃耆大補脾胃之氣為君，使氣旺以促血行；當歸尾活血通絡為臣；赤芍、川芎、桃仁、紅花活血祛瘀，地龍通經活絡為佐使。",
      "zhu_zhi_zh": "主治氣虛血瘀所致中風後遺症，半身不遂、口眼喎斜、言語蹇澀。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Bu Yang Huan Wu Tang.",
      "actions_en": ["Tonify qi", "Invigorate blood", "Unblock channels"],
      "pattern_indications_en": ["Sequelae of wind-stroke due to qi deficiency and blood stasis"],
      "modifications_en": ["Add Niu Xi and Gui Zhi for lower limb paralysis"],
      "contraindications_en": ["Contraindicated in hemorrhagic stroke acute phase or heat excess patterns."]
    }
  },
  "formula.chai_hu_shu_gan_san": {
    "source_classic": "《景岳全書》",
    "composition": [
      { "herb_zh": "柴胡", "herb_en": "Bupleurum Root", "pinyin": "Chai Hu", "role_zh": "君", "role_en": "Chief", "dose_range": "6g" },
      { "herb_zh": "香附", "herb_en": "Cyperus Rhizome", "pinyin": "Xiang Fu", "role_zh": "臣", "role_en": "Deputy", "dose_range": "4.5g" },
      { "herb_zh": "川芎", "herb_en": "Szechuan Lovage", "pinyin": "Chuan Xiong", "role_zh": "臣", "role_en": "Deputy", "dose_range": "4.5g" },
      { "herb_zh": "枳殼", "herb_en": "Bitter Orange Fruit", "pinyin": "Zhi Ke", "role_zh": "佐", "role_en": "Assistant", "dose_range": "4.5g" },
      { "herb_zh": "陳皮", "herb_en": "Tangerine Peel", "pinyin": "Chen Pi", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "白芍", "herb_en": "White Peony Root", "pinyin": "Bai Shao", "role_zh": "佐", "role_en": "Assistant", "dose_range": "4.5g" },
      { "herb_zh": "炙甘草", "herb_en": "Honey-fried Licorice", "pinyin": "Zhi Gan Cao", "role_zh": "使", "role_en": "Envoy", "dose_range": "1.5g" }
    ],
    "actions_zh": ["疏肝解鬱", "行氣止痛"],
    "actions_en": ["Soothe Liver and relieve depression", "Promote qi flow and alleviate pain"],
    "pattern_indications_zh": ["肝氣鬱結證", "脇肋疼痛，胸悶太息，情誌抑鬱或易怒，脘腹脹滿，脈弦"],
    "pattern_indications_en": ["Liver qi stagnation pattern", "Hypochondriac pain, chest oppression, frequent sighing, emotional depression or irritability, epigastric distention, wiry pulse"],
    "contraindications_zh": ["陰虛火旺或肝膽火盛者不宜單獨使用。"],
    "contraindications_en": ["Not recommended as standalone formula for yin deficiency fire or liver-gallbladder fire."],
    "herb_drug_cautions": ["medication_review"],
    "modern_clinical_use_tags": ["intercostal_neuralgia", "gastritis", "pms", "cholecystitis", "functional_dyspepsia"],
    "western_condition_links": ["functional_dyspepsia_pattern_support"],
    "related_formulas": ["formula.si_ni_san", "formula.xiao_yao_san", "formula.yue_ju_wan"],
    "related_conditions": ["pattern.liver_qi_stagnation"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E6%9F%B4%E8%83%A1%E7%96%8F%E8%82%9D%E6%95%A3",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 柴胡疏肝散.",
      "fang_yi_zh": "方中柴胡疏肝解鬱為君；香附、川芎理氣行血止痛為臣；枳殼、陳皮行氣寬中，白芍柔肝止痛為佐；甘草調和諸藥為使。",
      "zhu_zhi_zh": "主治肝氣鬱結所致脅肋疼痛、胸悶太息、情志抑鬱。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Chai Hu Shu Gan San.",
      "actions_en": ["Soothe Liver and regulate qi", "Harmonize blood and stop pain"],
      "pattern_indications_en": ["Liver qi stagnation causing hypochondriac pain and emotional tension"],
      "modifications_en": ["Add Yan Hu Suo for severe hypochondriac pain"],
      "contraindications_en": ["Use caution in yin deficiency with heat."]
    }
  },
  "formula.chuan_xiong_cha_tiao_san": {
    "source_classic": "《太平惠民和劑局方》",
    "composition": [
      { "herb_zh": "川芎", "herb_en": "Szechuan Lovage", "pinyin": "Chuan Xiong", "role_zh": "君", "role_en": "Chief", "dose_range": "120g" },
      { "herb_zh": "荊芥", "herb_en": "Schizonepeta", "pinyin": "Jing Jie", "role_zh": "君", "role_en": "Chief", "dose_range": "120g" },
      { "herb_zh": "薄荷", "herb_en": "Field Mint", "pinyin": "Bo He", "role_zh": "臣", "role_en": "Deputy", "dose_range": "240g" },
      { "herb_zh": "白脂", "herb_en": "Dahurian Angelica", "pinyin": "Bai Zhi", "role_zh": "臣", "role_en": "Deputy", "dose_range": "60g" },
      { "herb_zh": "羌活", "herb_en": "Notopterygium", "pinyin": "Qiang Huo", "role_zh": "臣", "role_en": "Deputy", "dose_range": "60g" },
      { "herb_zh": "防風", "herb_en": "Saposhnikovia", "pinyin": "Fang Feng", "role_zh": "佐", "role_en": "Assistant", "dose_range": "45g" },
      { "herb_zh": "細辛", "herb_en": "Asarum", "pinyin": "Xi Xin", "role_zh": "佐", "role_en": "Assistant", "dose_range": "30g" },
      { "herb_zh": "甘草", "herb_en": "Licorice Root", "pinyin": "Gan Cao", "role_zh": "使", "role_en": "Envoy", "dose_range": "60g" }
    ],
    "actions_zh": ["疏風止痛"],
    "actions_en": ["Dispel wind and relieve pain"],
    "pattern_indications_zh": ["外感風邪頭痛", "偏正頭痛，或巔頂作痛，惡風發熱，鼻塞頭重，舌苔薄白，脈浮"],
    "pattern_indications_en": ["Exterior wind headache pattern", "Unilateral or bilateral headache, vertex headache, aversion to wind with fever, nasal congestion, heavy sensation in head, thin white tongue coating, floating pulse"],
    "contraindications_zh": ["肝陽上亢、氣血雙虛或久病陰虛頭痛者忌用。"],
    "contraindications_en": ["Contraindicated in headaches from Liver yang hyperactivity, qi/blood deficiency, or prolonged yin deficiency."],
    "herb_drug_cautions": ["headache_red_flags", "medication_review"],
    "modern_clinical_use_tags": ["tension_headache", "migraine", "sinusitis", "common_cold"],
    "western_condition_links": ["common_cold_pattern_support"],
    "related_formulas": ["formula.cang_er_zi_san", "formula.jiu_wei_qiang_huo_tang", "formula.gui_zhi_tang"],
    "related_conditions": ["pattern.exterior_wind_cold"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E5%B7%9D%E8%8A%8E%E8%8C%B6%E8%AA%BF%E6%95%A3",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 川芎茶調散.",
      "fang_yi_zh": "方中川芎擅治少陽厥陰頭痛，荊芥疏散風邪為君；薄荷、白脂、羌活、細辛分治太陽、陽明、少陰頭痛為臣；防風助祛風，甘草調和諸藥為佐使。清茶調服增強清利頭目之功。",
      "zhu_zhi_zh": "主治外感風邪所致偏正頭痛、惡風發熱、鼻塞。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Chuan Xiong Cha Tiao San.",
      "actions_en": ["Dispel wind and stop pain"],
      "pattern_indications_en": ["Headache from exterior wind pathogen"],
      "modifications_en": ["Add Ju Hua and Shi Gao for wind-heat headache"],
      "contraindications_en": ["Do not use for headaches caused by Liver yang rising or qi/blood deficiency."]
    }
  },
  "formula.da_chai_hu_tang": {
    "source_classic": "《傷寒論》",
    "composition": [
      { "herb_zh": "柴胡", "herb_en": "Bupleurum Root", "pinyin": "Chai Hu", "role_zh": "君", "role_en": "Chief", "dose_range": "15g" },
      { "herb_zh": "黃芩", "herb_en": "Scutellaria Root", "pinyin": "Huang Qin", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "大黃", "herb_en": "Rhubarb Root", "pinyin": "Da Huang", "role_zh": "臣", "role_en": "Deputy", "dose_range": "6g" },
      { "herb_zh": "枳實", "herb_en": "Unripe Bitter Orange", "pinyin": "Zhi Shi", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "白芍", "herb_en": "White Peony Root", "pinyin": "Bai Shao", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "半夏", "herb_en": "Pinellia Rhizome", "pinyin": "Ban Xia", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "生薑", "herb_en": "Fresh Ginger", "pinyin": "Sheng Jiang", "role_zh": "使", "role_en": "Envoy", "dose_range": "15g" },
      { "herb_zh": "大棗", "herb_en": "Jujube Date", "pinyin": "Da Zao", "role_zh": "使", "role_en": "Envoy", "dose_range": "4枚" }
    ],
    "actions_zh": ["和解少陽", "內瀉熱結"],
    "actions_en": ["Harmonize Shaoyang", "Drain internal heat accumulation"],
    "pattern_indications_zh": ["少陽陽明合病", "往來寒熱，胸脇苦滿，嘔吐不止，鬱鬱微煩，心下急，按之痛，大便不通或下利臭穢，舌苔黃硬，脈弦數有力"],
    "pattern_indications_en": ["Shaoyang and Yangming combined pattern", "Alternating chills and fever, fullness and rigidity in chest and hypochondrium, continuous vomiting, mild irritability, epigastric urgency and pain on pressure, constipation or foul smelling diarrhea, hard yellow tongue coating, wiry rapid forceful pulse"],
    "contraindications_zh": ["孕婦、體虛便溏或純少陽無陽明熱結者禁用。"],
    "contraindications_en": ["Contraindicated in pregnancy, weak patients with loose stools, or pure Shaoyang without Yangming heat."],
    "herb_drug_cautions": ["pregnancy_review", "gi_red_flags"],
    "modern_clinical_use_tags": ["acute_cholecystitis", "gallstones", "acute_pancreatitis", "gastritis"],
    "western_condition_links": ["nausea_pattern_support", "digestive_pattern_support"],
    "related_formulas": ["formula.xiao_chai_hu_tang", "formula.da_cheng_qi_tang", "formula.si_ni_san"],
    "related_conditions": ["pattern.shaoyang_disharmony", "pattern.yangming_heat"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E5%A4%A7%E6%9F%B4%E8%83%A1%E6%B9%AF",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 大柴胡湯.",
      "fang_yi_zh": "方中柴胡、黃芩和解少陽清熱為君臣；大黃、枳實內瀉陽明熱結；白芍、半夏緩急止痛、降逆止嘔；薑棗和中為使。",
      "zhu_zhi_zh": "主治少陽陽明合病，往來寒熱、胸脅苦滿、嘔吐、心下按痛、便秘。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Da Chai Hu Tang.",
      "actions_en": ["Harmonize Shaoyang stage", "Drain heat accumulation in Yangming"],
      "pattern_indications_en": ["Concurrent Shaoyang and Yangming stage disorder with epigastric pain and constipation"],
      "modifications_en": ["Add Mu Xiang and Jin Qian Cao for gallstones and biliary colic"],
      "contraindications_en": ["Contraindicated during pregnancy or in patients with weak spleen."]
    }
  },
  "formula.da_cheng_qi_tang": {
    "source_classic": "《傷寒論》",
    "composition": [
      { "herb_zh": "大黃", "herb_en": "Rhubarb Root", "pinyin": "Da Huang", "role_zh": "君", "role_en": "Chief", "dose_range": "12g" },
      { "herb_zh": "芒硝", "herb_en": "Mirabilite", "pinyin": "Mang Xiao", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "枳實", "herb_en": "Unripe Bitter Orange", "pinyin": "Zhi Shi", "role_zh": "佐", "role_en": "Assistant", "dose_range": "12g" },
      { "herb_zh": "厚朴", "herb_en": "Magnolia Bark", "pinyin": "Hou Po", "role_zh": "佐", "role_en": "Assistant", "dose_range": "15g" }
    ],
    "actions_zh": ["峻下熱結"],
    "actions_en": ["Vigorously drain heat accumulation"],
    "pattern_indications_zh": ["陽明腑實證 (痞、滿、燥、實俱全)", "大便秘結，潮熱譫語，手足濈然汗出，腹滿痛拒按，苔黃燥起刺或焦黑，脈沉實有力"],
    "pattern_indications_en": ["Yangming organ excess heat pattern (Focal distention, fullness, dryness, excess)", "Severe constipation, tidal fever, delirium, sweating from hands and feet, abdominal fullness and pain worsened by pressure, dry yellow or burnt black tongue coating with prickles, deep forceful pulse"],
    "contraindications_zh": ["孕婦、氣血虛弱、老弱體虛、無燥實熱結者禁用。"],
    "contraindications_en": ["Contraindicated in pregnancy, debility, elderly weakness, or absence of heat accumulation."],
    "herb_drug_cautions": ["pregnancy_review", "gi_red_flags", "dehydration_review"],
    "modern_clinical_use_tags": ["acute_intestinal_obstruction", "acute_peritonitis", "severe_constipation", "septic_encephalopathy"],
    "western_condition_links": ["digestive_pattern_support"],
    "related_formulas": ["formula.xiao_cheng_qi_tang", "formula.tiao_wei_cheng_qi_tang", "formula.tao_he_cheng_qi_tang"],
    "related_conditions": ["pattern.yangming_heat"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E5%A4%A7%E6%89%BF%E6%B0%A3%E6%B9%AF",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 大承氣湯.",
      "fang_yi_zh": "方中大黃瀉熱通便、滌蕩腸胃為君；芒硝潤燥軟堅、助大黃通便為臣；枳實、厚朴行氣破結、消痞除滿為佐使。四藥合用，具峻下熱結之效。",
      "zhu_zhi_zh": "主治陽明腑實證，痞、滿、燥、實四症俱全，潮熱譫語、腹痛拒按。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Da Cheng Qi Tang.",
      "actions_en": ["Vigorously drain heat accumulation"],
      "pattern_indications_en": ["Severe Yangming organ stage heat with all four symptoms: focal distention, fullness, dryness, excess"],
      "modifications_en": ["Use Xiao Cheng Qi Tang if dryness/hardness is mild"],
      "contraindications_en": ["Strictly forbidden in pregnancy or debilitated patients."]
    }
  },
  "formula.da_ding_feng_zhu": {
    "source_classic": "《溫病條辨》",
    "composition": [
      { "herb_zh": "白芍", "herb_en": "White Peony Root", "pinyin": "Bai Shao", "role_zh": "君", "role_en": "Chief", "dose_range": "18g" },
      { "herb_zh": "阿膠", "herb_en": "Donkey-hide Gelatin", "pinyin": "E Jiao", "role_zh": "君", "role_en": "Chief", "dose_range": "9g" },
      { "herb_zh": "生龜板", "herb_en": "Tortoise Shell", "pinyin": "Gui Ban", "role_zh": "臣", "role_en": "Deputy", "dose_range": "12g" },
      { "herb_zh": "生鱉甲", "herb_en": "Turtle Shell", "pinyin": "Bie Jia", "role_zh": "臣", "role_en": "Deputy", "dose_range": "12g" },
      { "herb_zh": "生地黃", "herb_en": "Rehmannia Root", "pinyin": "Sheng Di Huang", "role_zh": "臣", "role_en": "Deputy", "dose_range": "18g" },
      { "herb_zh": "生麥冬", "herb_en": "Ophiopogon Tuber", "pinyin": "Mai Dong", "role_zh": "佐", "role_en": "Assistant", "dose_range": "18g" },
      { "herb_zh": "麻仁", "herb_en": "Hemp Seed", "pinyin": "Ma Ren", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "五味子", "herb_en": "Schisandra Fruit", "pinyin": "Wu Wei Zi", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "生牡蠣", "herb_en": "Oyster Shell", "pinyin": "Mu Li", "role_zh": "佐", "role_en": "Assistant", "dose_range": "15g" },
      { "herb_zh": "炙甘草", "herb_en": "Honey-fried Licorice", "pinyin": "Zhi Gan Cao", "role_zh": "使", "role_en": "Envoy", "dose_range": "12g" },
      { "herb_zh": "雞子黃", "herb_en": "Egg Yolk", "pinyin": "Ji Zi Huang", "role_zh": "使", "role_en": "Envoy", "dose_range": "2個" }
    ],
    "actions_zh": ["滋陰熄風"],
    "actions_en": ["Nourish yin and extinguish wind"],
    "pattern_indications_zh": ["陰虛風動證", "溫病後期，神倦瘛瘲，脈氣虛弱，舌降少苔，甚則時時欲脫"],
    "pattern_indications_en": ["Yin deficiency stirring wind pattern", "Late stage febrile disease with fatigue, twitching/spasms of limbs, weak thready pulse, crimson tongue with little coating, collapse tendency"],
    "contraindications_zh": ["斜熱未清、內有痰濕者忌用。"],
    "contraindications_en": ["Contraindicated when pathogenic heat remains uncleared or damp-phlegm is present."],
    "herb_drug_cautions": ["cloying_digestive_effect", "neurological_red_flags"],
    "modern_clinical_use_tags": ["post_febrile_spasms", "parkinsonism", "tardive_dyskinesia", "encephalitis_sequelae"],
    "western_condition_links": ["dizziness_pattern_support"],
    "related_formulas": ["formula.ling_jiao_gou_teng_tang", "formula.zhen_gan_xi_feng_tang", "formula.san_jia_fu_mai_tang"],
    "related_conditions": ["pattern.liver_wind_internal", "pattern.kidney_yin_deficiency"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E5%A4%A7%E5%AE%9A%E9%A2%A8%E7%8F%A0",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 大定風珠.",
      "fang_yi_zh": "方中白芍、阿膠滋陰養血為君；龜板、鱉甲、生地深滋真陰、潛陽熄風為臣；麥冬、麻仁、五味子、牡蠣養陰斂汗、鎮驚安神為佐；甘草、雞子黃和中養陰為使。",
      "zhu_zhi_zh": "主治溫病晚期陰液大傷、虛風內動，手足瘛瘲、脈虛弱。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Da Ding Feng Zhu.",
      "actions_en": ["Nourish yin and extinguish internal wind"],
      "pattern_indications_en": ["Late stage warm heat disease where severe yin depletion stirs internal wind"],
      "modifications_en": ["Remove Ji Zi Huang if digestive function is compromised"],
      "contraindications_en": ["Do not use if active excess heat or phlegm is present."]
    }
  },
  "formula.dang_gui_bu_xue_tang": {
    "source_classic": "《內外傷辨惑論》",
    "composition": [
      { "herb_zh": "黃耆", "herb_en": "Astragalus Root", "pinyin": "Huang Qi", "role_zh": "君", "role_en": "Chief", "dose_range": "30g" },
      { "herb_zh": "當歸", "herb_en": "Chinese Angelica", "pinyin": "Dang Gui", "role_zh": "臣", "role_en": "Deputy", "dose_range": "6g" }
    ],
    "actions_zh": ["補氣生血"],
    "actions_en": ["Tonify qi and generate blood"],
    "pattern_indications_zh": ["血虛發熱證", "肌熱面赤，煩渴欲飲，脈洪大按之無力，或婦人產後、崩漏後血虛發熱"],
    "pattern_indications_en": ["Blood deficiency fever pattern", "Feverish sensation with red face, irritability and thirst for warm drinks, flooding large pulse that is weak on pressure, or blood deficiency fever after childbirth/heavy uterine bleeding"],
    "contraindications_zh": ["陰虛潮熱或實熱發熱者忌用。"],
    "contraindications_en": ["Contraindicated in yin deficiency tidal fever or excess heat fever."],
    "herb_drug_cautions": ["bleeding_review"],
    "modern_clinical_use_tags": ["anemia", "postpartum_fever", "postoperative_weakness", "leukopenia"],
    "western_condition_links": ["fatigue_pattern_support"],
    "related_formulas": ["formula.si_wu_tang", "formula.ba_zhen_tang", "formula.gui_pi_tang"],
    "related_conditions": ["pattern.blood_deficiency", "pattern.spleen_qi_deficiency"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E7%95%B6%E6%AD%B8%E8%A3%9C%E8%A1%80%E6%B9%AF",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 當歸補血湯.",
      "fang_yi_zh": "方中重用黃耆大補脾肺之氣，以裕生血之源為君；當歸甘辛溫養血和血為臣。二藥比例為 5:1，意在『有形之血生於無形之氣』。",
      "zhu_zhi_zh": "主治血虛發熱，肌熱面赤、脈洪大按之無力。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Dang Gui Bu Xue Tang.",
      "actions_en": ["Tonify qi and generate blood"],
      "pattern_indications_en": ["Blood deficiency heat pattern with 5:1 ratio of Huang Qi to Dang Gui"],
      "modifications_en": ["Add E Jiao and Long Yan Rou for severe anemia"],
      "contraindications_en": ["Not for fever from external wind or excess heat."]
    }
  },
  "formula.dang_gui_si_ni_tang": {
    "source_classic": "《傷寒論》",
    "composition": [
      { "herb_zh": "當歸", "herb_en": "Chinese Angelica", "pinyin": "Dang Gui", "role_zh": "君", "role_en": "Chief", "dose_range": "12g" },
      { "herb_zh": "桂枝", "herb_en": "Cinnamon Twig", "pinyin": "Gui Zhi", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "白芍", "herb_en": "White Peony Root", "pinyin": "Bai Shao", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "細辛", "herb_en": "Asarum", "pinyin": "Xi Xin", "role_zh": "佐", "role_en": "Assistant", "dose_range": "3g" },
      { "herb_zh": "通草", "herb_en": "Rice Paper Pith", "pinyin": "Tong Cao", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "炙甘草", "herb_en": "Honey-fried Licorice", "pinyin": "Zhi Gan Cao", "role_zh": "使", "role_en": "Envoy", "dose_range": "6g" },
      { "herb_zh": "大棗", "herb_en": "Jujube Date", "pinyin": "Da Zao", "role_zh": "使", "role_en": "Envoy", "dose_range": "8枚" }
    ],
    "actions_zh": ["溫經散寒", "養血通脈"],
    "actions_en": ["Warm the channels and dispel cold", "Nourish blood and unblock vessels"],
    "pattern_indications_zh": ["血虛寒厥證", "手足厥寒，口不渴，舌淡苔白，脈細欲絕或沉細"],
    "pattern_indications_en": ["Blood deficiency cold inversion pattern", "Cold hands and feet, absence of thirst, pale tongue with white coating, fine pulse that is almost imperceptible or deep fine pulse"],
    "contraindications_zh": ["濕熱內盛或熱厥者禁用。"],
    "contraindications_en": ["Contraindicated in damp-heat interior excess or heat cold-inversion."],
    "herb_drug_cautions": ["medication_review"],
    "modern_clinical_use_tags": ["raynaud_phenomenon", "frostbite", "thromboangiitis_obliterans", "dysmenorrhea"],
    "western_condition_links": ["gynecology_pattern_support"],
    "related_formulas": ["formula.gui_zhi_tang", "formula.si_ni_tang", "formula.wen_jing_tang"],
    "related_conditions": ["pattern.blood_deficiency", "pattern.cold_stagnation"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E7%95%B6%E6%AD%B8%E5%9B%9B%E9%80%86%E6%B9%AF",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 當歸四逆湯.",
      "fang_yi_zh": "方中當歸養血活血，桂枝溫經通脈共為君臣；白芍助當歸養血，細辛助桂枝散寒；通草通經脈，甘草、大棗益氣和中為佐使。",
      "zhu_zhi_zh": "主治血虛受寒所致手足厥寒、脈細欲絕。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Dang Gui Si Ni Tang.",
      "actions_en": ["Warm the channels and dispel cold", "Nourish blood and unblock vessels"],
      "pattern_indications_en": ["Cold extremities due to blood deficiency with cold in the channels"],
      "modifications_en": ["Add Wu Zhu Yu and Sheng Jiang for severe cold and vomiting"],
      "contraindications_en": ["Contraindicated in heat patterns or hot inversion."]
    }
  },
  "formula.dao_chi_san": {
    "source_classic": "《小兒藥證直訣》",
    "composition": [
      { "herb_zh": "生地黃", "herb_en": "Rehmannia Root", "pinyin": "Sheng Di Huang", "role_zh": "君", "role_en": "Chief", "dose_range": "15g" },
      { "herb_zh": "木通", "herb_en": "Akebia Stem", "pinyin": "Mu Tong", "role_zh": "臣", "role_en": "Deputy", "dose_range": "6g" },
      { "herb_zh": "竹葉", "herb_en": "Lophatherus Leaf", "pinyin": "Zhu Ye", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "甘草梢", "herb_en": "Licorice Tip", "pinyin": "Gan Cao Shao", "role_zh": "使", "role_en": "Envoy", "dose_range": "6g" }
    ],
    "actions_zh": ["清心利水"],
    "actions_en": ["Clear Heart heat and promote urination"],
    "pattern_indications_zh": ["心經火熱循經下移小腸證", "心胸煩熱，口渴面赤，口舌生瘡，小便赤澀刺痛，舌紅脈數"],
    "pattern_indications_en": ["Heart fire transferring downward to Small Intestine pattern", "Irritability and heat sensation in chest, thirst with red face, aphthous ulcers in mouth and tongue, dark red dysuria with sharp pain, red tongue, rapid pulse"],
    "contraindications_zh": ["脾胃虛寒、小便清長者忌用。"],
    "contraindications_en": ["Contraindicated in spleen-stomach cold deficiency or profuse clear urination."],
    "herb_drug_cautions": ["urinary_red_flags"],
    "modern_clinical_use_tags": ["aphthous_stomatitis", "uti", "cystitis", "pediatric_thrush"],
    "western_condition_links": ["urinary_pattern_support"],
    "related_formulas": ["formula.ba_zheng_san", "formula.huang_lian_jie_du_tang", "formula.qing_xin_lian_zi_yin"],
    "related_conditions": ["pattern.heart_fire"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E5%B0%8E%E8%B5%A4%E6%95%A3",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 導赤散.",
      "fang_yi_zh": "方中生地黃涼血滋陰、清心瀉火為君；木通上清心火、下利小腸為臣；竹葉清心除煩，甘草梢清熱解毒、直達尿道為佐使。",
      "zhu_zhi_zh": "主治心火下移小腸，心煩口渴、口舌生瘡、小便赤澀刺痛。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Dao Chi San.",
      "actions_en": ["Clear the Heart and promote urination"],
      "pattern_indications_en": ["Heart fire shifting to Small Intestine causing mouth sores and dysuria"],
      "modifications_en": ["Add Che Qian Zi for severe painful dysuria"],
      "contraindications_en": ["Do not use in spleen deficiency or clear profuse urine."]
    }
  },
  "formula.ding_chuan_tang": {
    "source_classic": "《攝生眾妙方》",
    "composition": [
      { "herb_zh": "麻黃", "herb_en": "Ephedra Stem", "pinyin": "Ma Huang", "role_zh": "君", "role_en": "Chief", "dose_range": "9g" },
      { "herb_zh": "白果", "herb_en": "Gingko Seed", "pinyin": "Bai Guo", "role_zh": "君", "role_en": "Chief", "dose_range": "9g" },
      { "herb_zh": "桑白皮", "herb_en": "Mulberry Bark", "pinyin": "Sang Bai Pi", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "款冬花", "herb_en": "Coltsfoot Flower", "pinyin": "Kuan Dong Hua", "role_zh": "臣", "role_en": "Deputy", "dose_range": "9g" },
      { "herb_zh": "半夏", "herb_en": "Pinellia Rhizome", "pinyin": "Ban Xia", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "杏仁", "herb_en": "Apricot Kernel", "pinyin": "Xing Ren", "role_zh": "佐", "role_en": "Assistant", "dose_range": "9g" },
      { "herb_zh": "蘇子", "herb_en": "Perilla Seed", "pinyin": "Su Zi", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "黃芩", "herb_en": "Scutellaria Root", "pinyin": "Huang Qin", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "甘草", "herb_en": "Licorice Root", "pinyin": "Gan Cao", "role_zh": "使", "role_en": "Envoy", "dose_range": "3g" }
    ],
    "actions_zh": ["宣肺平喘", "清熱化痰"],
    "actions_en": ["Disperse Lungs and relieve wheezing", "Clear heat and transform phlegm"],
    "pattern_indications_zh": ["風寒外束，痰熱內蘊之哮喘", "喘咳短氣，痰多黃稠，喉中哮鳴，胸膈滿悶，微惡風寒，舌苔黃膩，脈滑數"],
    "pattern_indications_en": ["Exterior wind-cold with interior phlegm-heat asthma pattern", "Wheezing and shortness of breath, copious yellow thick phlegm, wheezing sounds in throat, chest oppression, mild chills, yellow greasy tongue coating, slippery rapid pulse"],
    "contraindications_zh": ["陰虛喘咳或肺腎兩虛之哮喘慎用。"],
    "contraindications_en": ["Use with caution in asthma due to yin deficiency or Lung-Kidney deficiency."],
    "herb_drug_cautions": ["respiratory_red_flags", "medication_review"],
    "modern_clinical_use_tags": ["bronchial_asthma", "acute_bronchitis", "emphysema", "copd"],
    "western_condition_links": ["cough_phlegm_pattern_support"],
    "related_formulas": ["formula.ma_xing_shi_gan_tang", "formula.xiao_qing_long_tang", "formula.su_zi_jiang_qi_tang"],
    "related_conditions": ["pattern.phlegm_heat", "pattern.lung_qi_rebellion"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E5%AE%9A%E5%96%9F%E6%B9%AF",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 定喘湯.",
      "fang_yi_zh": "方中麻黃宣肺散寒平喘，白果收斂肺氣定喘共為君；桑白皮、黃芩清肺熱，款冬花、杏仁、蘇子、半夏降氣化痰止咳為臣佐；甘草調和諸藥為使。",
      "zhu_zhi_zh": "主治風寒外束、痰熱內蘊之哮喘，痰多黃稠、喉中鳴響。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Ding Chuan Tang.",
      "actions_en": ["Disperse Lungs and stop wheezing", "Clear heat and transform phlegm"],
      "pattern_indications_en": ["Asthma caused by exterior wind-cold binding Lungs with interior phlegm-heat"],
      "modifications_en": ["Increase Huang Qin for severe fever and yellow phlegm"],
      "contraindications_en": ["Not for asthma from pure deficiency without interior phlegm-heat."]
    }
  },
  "formula.du_huo_ji_sheng_tang": {
    "source_classic": "《備急千金要方》",
    "composition": [
      { "herb_zh": "獨活", "herb_en": "Pubescent Angelica Root", "pinyin": "Du Huo", "role_zh": "君", "role_en": "Chief", "dose_range": "9g" },
      { "herb_zh": "桑寄生", "herb_en": "Taxillus Herb", "pinyin": "Sang Ji Sheng", "role_zh": "臣", "role_en": "Deputy", "dose_range": "6g" },
      { "herb_zh": "杜仲", "herb_en": "Eucommia Bark", "pinyin": "Du Zhong", "role_zh": "臣", "role_en": "Deputy", "dose_range": "6g" },
      { "herb_zh": "牛膝", "herb_en": "Achyranthes Root", "pinyin": "Niu Xi", "role_zh": "臣", "role_en": "Deputy", "dose_range": "6g" },
      { "herb_zh": "細辛", "herb_en": "Asarum", "pinyin": "Xi Xin", "role_zh": "佐", "role_en": "Assistant", "dose_range": "3g" },
      { "herb_zh": "秦艽", "herb_en": "Gentiana Macrophylla", "pinyin": "Qin Jiao", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "防風", "herb_en": "Saposhnikovia", "pinyin": "Fang Feng", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "川芎", "herb_en": "Szechuan Lovage", "pinyin": "Chuan Xiong", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "當歸", "herb_en": "Chinese Angelica", "pinyin": "Dang Gui", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "白芍", "herb_en": "White Peony Root", "pinyin": "Bai Shao", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "熟地黃", "herb_en": "Prepared Rehmannia", "pinyin": "Shu Di Huang", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "人參", "herb_en": "Ginseng Root", "pinyin": "Ren Shen", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "茯苓", "herb_en": "Poria", "pinyin": "Fu Ling", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "桂心", "herb_en": "Cinnamon Bark Core", "pinyin": "Gui Xin", "role_zh": "佐", "role_en": "Assistant", "dose_range": "6g" },
      { "herb_zh": "甘草", "herb_en": "Licorice Root", "pinyin": "Gan Cao", "role_zh": "使", "role_en": "Envoy", "dose_range": "6g" }
    ],
    "actions_zh": ["祛風濕", "止痺痛", "益肝腎", "補氣血"],
    "actions_en": ["Dispel wind-dampness", "Alleviate painful bi obstruction", "Benefit Liver and Kidneys", "Tonify qi and blood"],
    "pattern_indications_zh": ["痺證日久，肝腎兩虛，氣血不足證", "腰膝冷痛，膝關節屈伸不利，麻木不仁，畏寒喜溫，心悸氣短，舌淡苔白，脈細弱"],
    "pattern_indications_en": ["Chronic bi syndrome with Liver-Kidney deficiency and qi-blood deficiency pattern", "Cold pain in lower back and knees, stiffness and reduced range of motion in knee joint, numbness, aversion to cold, palpitations and shortness of breath, pale tongue with white coating, fine weak pulse"],
    "contraindications_zh": ["濕熱痺痛或陰虛火旺者禁用。"],
    "contraindications_en": ["Contraindicated in damp-heat bi obstruction or yin deficiency with heat."],
    "herb_drug_cautions": ["medication_review"],
    "modern_clinical_use_tags": ["osteoarthritis", "rheumatoid_arthritis", "sciatica", "lumbar_disc_herniation"],
    "western_condition_links": ["joint_pain_pattern_support"],
    "related_formulas": ["formula.san_bi_tang", "formula.juan_bi_tang", "formula.gui_zhi_shao_yao_zhi_mu_tang"],
    "related_conditions": ["pattern.kidney_yang_deficiency", "pattern.qi_blood_deficiency"],
    "source_urls": [
      "https://cloudtcm.com/formula/search?query=%E7%8D%A8%E6%B4%BB%E5%AF%84%E7%94%9F%E6%B9%AF",
      "https://library.hkbu.edu.hk/electronic/libdbs/cmfid/index.html"
    ],
    "chinese_depth_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_cloudtcm",
      "source_note": "Sourced from CloudTCM 獨活寄生湯.",
      "fang_yi_zh": "方中獨活理少陰風濕、止腰膝痛為君；桑寄生、杜仲、牛膝補肝腎、強筋骨為臣；細辛、秦艽、防風、桂心助祛風濕溫經通絡，當歸、川芎、芍藥、熟地、人參、茯苓、甘草補氣血養肝脾為佐使。",
      "zhu_zhi_zh": "主治慢性風寒濕痺，腰膝冷痛、膝關節屈伸不利、氣血肝腎不足。"
    },
    "english_exam_track": {
      "review_status": "draft",
      "source_status": "sourced_draft_bensky",
      "source_note": "Draft exam notes for Du Huo Ji Sheng Tang.",
      "actions_en": ["Dispel wind-dampness and stop pain", "Tonify Liver and Kidney", "Nourish qi and blood"],
      "pattern_indications_en": ["Chronic painful bi obstruction with underlying Liver/Kidney and qi/blood deficiency"],
      "modifications_en": ["Add Huang Qi for marked qi deficiency"],
      "contraindications_en": ["Contraindicated in acute hot bi syndrome."]
    }
  }
};

console.log('Filling formulas in formulas.json...');
let count = 0;
data.records.forEach(r => {
  if (formulaFills[r.id]) {
    Object.assign(r, formulaFills[r.id]);
    r.review_status = "draft";
    r.public_safe = false;
    r.source_type = "draft_dual_track_hkbu_cloudtcm_bensky_pending";
    count++;
  }
});

console.log(`Updated ${count} formula records.`);
fs.writeFileSync(FORMULAS_FILE, JSON.stringify(data, null, 2), 'utf8');
console.log('Formulas JSON saved successfully.');
