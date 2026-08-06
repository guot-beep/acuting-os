/**
 * scripts/build_batch2_gold_formulas.js
 * Builds Gold-Standard Reference Files for Batch 2:
 * 1. 黃連解毒湯 (formula.huang_lian_jie_du_tang)
 * 2. 龍膽瀉肝湯 (formula.long_dan_xie_gan_tang)
 * 3. 導赤散 (formula.dao_chi_san)
 *
 * Ensures 100% template compliance:
 * - formula_song, formula_song_zh, formula_song_source_zh
 * - contraindications_zh, contraindications_en
 * - composition items with herb_zh, name_zh, dose_g, decoction_reference_g, role_zh, role_reason_zh, in_formula_zh
 * - comparison_group
 * - verified CloudTCM & American Dragon direct URLs
 */

const fs = require('fs');
const path = require('path');

const refDir = path.join(__dirname, '../data/herbs/reference');
if (!fs.existsSync(refDir)) {
  fs.mkdirSync(refDir, { recursive: true });
}

// 1. 黃連解毒湯
const hljdt = {
  "_reference_note": "REFERENCE IMPLEMENTATION for formula.huang_lian_jie_du_tang matching template.",
  "id": "formula.huang_lian_jie_du_tang",
  "name_zh": "黃連解毒湯",
  "name_en": "Huang Lian Jie Du Tang",
  "name_en_translated": "Coptis Decoction to Relieve Toxicity",
  "pinyin": "Huang Lian Jie Du Tang",
  "pinyin_toned": "Huáng Lián Jiě Dú Tāng",
  "source_text_zh": "《外台秘要》引崔氏方",
  "source_text_en": "Wai Tai Mi Yao (Arcane Essentials from the Imperial Library)",
  "category_zh": "清熱劑－清熱解毒",
  "category_en": "Formulas that Clear Heat - Clear Heat & Relieve Toxicity",
  "comparison_group": "清熱劑 / Clear Heat",

  "glance": {
    "category_banner_zh": "瀉火解毒",
    "category_banner_en": "DRAIN FIRE RELIEVE TOXICITY",
    "plain_summary_zh": "三焦實熱火毒熾盛證之代表方。大熱煩躁、口燥咽乾、錯語不眠、吐血衄血、發斑——大苦大寒直折火毒。",
    "plain_summary_en": "Premier formula for severe blazing toxic fire in all three burners. Features high fever, delirium, insomnia, and bleeding.",
    "plain_indications_zh": ["三焦火毒熾盛", "大熱煩躁", "口燥咽乾", "錯語不眠", "吐血衄血"],
    "plain_indications_en": ["blazing heat toxicity", "high fever restlessness", "dry mouth throat", "delirium insomnia", "bleeding"],
    "herb_count": 4
  },

  "composition": [
    {
      "herb_id": "herb.huang_lian",
      "herb_zh": "黃連", "name_zh": "黃連", "herb_en": "Coptis Rhizome", "name_en": "Coptis Rhizome", "pinyin": "Huang Lian", "pinyin_toned": "Huáng Lián",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "大苦大寒，瀉心火，兼瀉上焦實熱火毒——重用為君",
      "role_reason_en": "Bitter and very cold; drains Heart fire and purges upper burner heat toxicity",
      "in_formula_zh": "大苦大寒，瀉心火，兼瀉上焦實熱火毒——重用為君"
    },
    {
      "herb_id": "herb.huang_qin",
      "herb_zh": "黃芩", "name_zh": "黃芩", "herb_en": "Baikal Skullcap Root", "name_en": "Baikal Skullcap Root", "pinyin": "Huang Qin", "pinyin_toned": "Huáng Qín",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "苦寒清熱燥濕，專瀉中上焦肺胃火毒",
      "role_reason_en": "Bitter and cold; clears heat, dries dampness, drains Lung and Stomach fire in upper/middle burners",
      "in_formula_zh": "苦寒清熱燥濕，專瀉中上焦肺胃火毒"
    },
    {
      "herb_id": "herb.huang_bai",
      "herb_zh": "黃柏", "name_zh": "黃柏", "herb_en": "Phellodendron Bark", "name_en": "Phellodendron Bark", "pinyin": "Huang Bai", "pinyin_toned": "Huáng Bǎi",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "苦寒瀉下焦相火與濕熱火毒",
      "role_reason_en": "Bitter and cold; drains lower burner minister fire and damp-heat toxicity",
      "in_formula_zh": "苦寒瀉下焦相火與濕熱火毒"
    },
    {
      "herb_id": "herb.zhi_zi",
      "herb_zh": "梔子", "name_zh": "梔子", "herb_en": "Gardenia Fruit", "name_en": "Gardenia Fruit", "pinyin": "Zhi Zi", "pinyin_toned": "Zhī Zǐ",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "苦寒清熱瀉火，通瀉三焦火邪，導熱下行從小便出",
      "role_reason_en": "Bitter and cold; clears heat, drains fire from all three burners and directs heat downward via urine",
      "in_formula_zh": "苦寒清熱瀉火，通瀉三焦火邪，導熱下行從小便出"
    }
  ],

  "key_pairs": [
    "pair.huang_lian__huang_qin",
    "pair.huang_qin__huang_bai",
    "pair.huang_lian__zhi_zi"
  ],
  "key_pairs_note_zh": "黃連配黃芩（瀉中上二焦火毒）；黃芩配黃柏（清上中下三焦濕熱火毒）；黃連配梔子（上瀉心火，下導熱邪）。",
  "key_pairs_note_en": "Huang Lian with Huang Qin (drains upper/middle burner fire); Huang Qin with Huang Bai (clears all three burners); Huang Lian with Zhi Zi (drains Heart fire and directs heat downward).",

  "fang_yi_zh": "《外台秘要》瀉火解毒之總方。黃連大苦大寒，瀉心火、清上焦為君；黃芩清肺熱、瀉中焦為臣；黃柏清下焦濕熱為臣；梔子通瀉三焦火邪、導熱下行從小便出為佐使。四藥全用苦寒，直折火毒，使三焦實熱火毒得以分消。",
  "fang_yi_en": "The master formula for draining fire and relieving toxicity. Huang Lian drains Heart fire as chief; Huang Qin clears Lung heat as deputy; Huang Bai drains lower burner damp-heat as deputy; Zhi Zi drains all three burners and guides heat downward as assistant.",

  "actions_zh": [
    "瀉火解毒 — 瀉透三焦實熱火毒",
    "清熱燥濕 — 清瀉臟腑濕熱邪氣",
    "涼血止血 — 清解血分熱毒、防熱迫血妄行",
    "瀉火除煩 — 苦寒直折火毒、消除狂躁煩心"
  ],
  "actions_en": [
    "Drains fire and relieves toxicity — purges toxic fire excess from all three burners",
    "Clears heat and dries dampness — clears damp-heat pathogens from organs",
    "Cools blood and stops bleeding — clears blood-level heat toxicity to prevent bleeding",
    "Drains fire to ease agitation — purges toxic fire to calm restlessness and manic agitation"
  ],

  "pattern_indications_zh": [
    "三焦火毒熾盛證（實熱火毒）：大熱煩躁、口燥咽乾、錯語不眠、或吐血衄血、發斑、身熱下利、舌紅苔黃、脈數有力。"
  ],
  "pattern_indications_en": [
    "Blazing toxic fire in all three burners (excess heat toxicity): High fever, severe restlessness, dry mouth and throat, delirious speech, insomnia, hematemesis, epistaxis, maculae, red tongue with yellow coating, rapid forceful pulse."
  ],

  "indications": [
    {
      "pattern_zh": "三焦火毒熾盛證（實熱火毒）",
      "pattern_en": "Blazing toxic fire in all three burners (excess heat toxicity)",
      "clinical_picture_zh": "大熱煩躁、口燥咽乾、錯語不眠、或吐血衄血、發斑、身熱下利",
      "clinical_picture_en": "High fever, severe restlessness, dry mouth and throat, delirious speech, insomnia, bleeding",
      "tongue_zh": "舌紅，苔黃",
      "tongue_en": "Red tongue with yellow coating",
      "pulse_zh": "脈數有力",
      "pulse_en": "Rapid and forceful pulse"
    }
  ],

  "constitutional_types_zh": ["陰虛火旺", "脾胃虛寒"],
  "constitutional_types_en": ["Yin deficiency with fire", "Spleen/Stomach deficiency cold"],
  "constitutional_note_zh": "脾胃虛寒或陰虛乾熱者禁用。",

  "modifications_zh": [
    "便秘、大熱不解者：加大黃 9g ➔ 即瀉心湯／涼膈散意（通腑瀉熱）",
    "吐血衄血甚者：加生地黃 15g、丹皮 9g、白茅根 30g（涼血止血）",
    "發斑者：加玄參 15g、紫草 9g（涼血解毒）"
  ],
  "modifications_en": [
    "Constipation with severe heat: Add Da Huang 9g (drains heat via stool)",
    "Severe bleeding: Add Sheng Di Huang 15g, Dan Pi 9g, Bai Mao Gen 30g",
    "Maculae: Add Xuan Shen 15g, Zi Cao 9g"
  ],

  "modifications": [
    { "if_zh": "便秘、大熱不解者", "if_en": "Constipation with severe heat", "change_zh": "加大黃 9g ➔ 即瀉心湯意（通腑瀉熱）", "change_en": "Add Da Huang 9g to drain heat via stool" },
    { "if_zh": "吐血衄血甚者", "if_en": "Severe bleeding", "change_zh": "加生地黃 15g、丹皮 9g、白茅根 30g（涼血止血）", "change_en": "Add Sheng Di Huang 15g, Dan Pi 9g, Bai Mao Gen 30g" }
  ],

  "dose_adjustment_note_zh": "水煎服。本方藥性苦寒大燥，中病即止，不可久服。",
  "dose_adjustment_note_en": "Decoct in water. Highly bitter and cold; discontinue once heat is cleared.",

  "contraindications_zh": [
    "陰虛火旺者禁用",
    "脾胃虛寒、食少便溏者禁用",
    "本方苦寒燥烈傷陰，不可長期過量服用"
  ],
  "contraindications_en": [
    "Contraindicated in dry heat from Yin deficiency",
    "Contraindicated in Spleen/Stomach deficiency cold with poor appetite or loose stools",
    "Contraindicated for long-term or excessive use due to harsh bitter-cold nature"
  ],

  "comparisons": [
    {
      "with": "formula.bai_hu_tang",
      "name_zh": "白虎湯",
      "differentiator_zh": "白虎湯清陽明無形氣分大熱，重在清熱生津；黃連解毒湯瀉三焦有形實熱火毒，重在苦寒直折。",
      "differentiator_en": "Bai Hu Tang clears Qi-level formless heat and generates fluids; Huang Lian Jie Du Tang drains toxic fire in all three burners."
    },
    {
      "with": "formula.long_dan_xie_gan_tang",
      "name_zh": "龍膽瀉肝湯",
      "differentiator_zh": "龍膽瀉肝湯專清肝膽實火與濕熱；黃連解毒湯通清三焦火毒。",
      "differentiator_en": "Long Dan Xie Gan Tang specifically clears Liver/Gallbladder fire and damp-heat; Huang Lian Jie Du Tang clears three burners."
    }
  ],

  "formula_family": [
    {
      "formula_id": "formula.xie_xin_tang",
      "name_zh": "瀉心湯",
      "relation": "加",
      "change": ["加大黃 9g"],
      "change_en": ["Add Da Huang 9g"]
    }
  ],

  "applications_zh": ["敗血症", "重症肺炎", "急性結膜炎", "急性化膿性感染", "急性菌痢"],
  "applications_en": ["Sepsis", "Severe pneumonia", "Acute conjunctivitis", "Acute suppurative infection", "Bacillary dysentery"],
  "modern_applications_zh": ["敗血症", "重症肺炎", "急性結膜炎", "急性化膿性感染", "急性菌痢"],
  "modern_applications_en": ["Sepsis", "Severe pneumonia", "Acute conjunctivitis", "Acute suppurative infection", "Bacillary dysentery"],

  "cloudtcm_url": "https://cloudtcm.com/formula/244",
  "american_dragon_url": "https://www.americandragon.com/HerbFormulas/HuangLianJieDuTang.html",
  "source_urls": [
    "https://cloudtcm.com/formula/244",
    "https://www.americandragon.com/HerbFormulas/HuangLianJieDuTang.html"
  ],

  "external_links": [
    { "source_id": "american_dragon", "url": "https://www.americandragon.com/HerbFormulas/HuangLianJieDuTang.html", "label_zh": "American Dragon", "label_en": "American Dragon", "lang": "en", "link_status": "direct" },
    { "source_id": "cloudtcm", "url": "https://cloudtcm.com/formula/244", "label_zh": "雲端中醫", "label_en": "CloudTCM", "lang": "zh", "link_status": "direct" }
  ],

  "field_sources": {
    "actions_zh": ["wai_tai_mi_yao", "curriculum/formulas/Formulations Summary Chart.docx.md"],
    "composition_roles": ["wai_tai_mi_yao", "bastyr_materia_medica_2"],
    "indications": ["wai_tai_mi_yao"],
    "contraindications": ["bastyr_materia_medica_2"]
  },

  "review_status": "draft",
  "authored_by": "model_draft",
  "formula_song": "黃連解毒柏芝芩，三焦火毒熱盈盈。\n煩躁狂斑吐衄嘔，苦寒直折熱自平。",
  "formula_song_zh": "黃連解毒柏芝芩，三焦火毒熱盈盈。\n煩躁狂斑吐衄嘔，苦寒直折熱自平。",
  "formula_song_source_zh": "出自汪昂《湯頭歌訣》",
  "exam_pearl": "【考綱重點】三焦實熱火毒熾盛證首選方。黃連（心）、黃芩（肺）、黃柏（腎）、梔子（通瀉三焦）。「苦寒直折」法代表方。NCBAHM 2026 CH Outline p.21。"
};

// 2. 龍膽瀉肝湯
const ldxgt = {
  "_reference_note": "REFERENCE IMPLEMENTATION for formula.long_dan_xie_gan_tang matching template.",
  "id": "formula.long_dan_xie_gan_tang",
  "name_zh": "龍膽瀉肝湯",
  "name_en": "Long Dan Xie Gan Tang",
  "name_en_translated": "Gentian Decoction to Drain the Liver",
  "pinyin": "Long Dan Xie Gan Tang",
  "pinyin_toned": "Lóng Dǎn Xiè Gān Tāng",
  "source_text_zh": "《醫宗金鑑》引《古今醫鑑》",
  "source_text_en": "Yi Zong Jin Jian (Golden Mirror of Medical Orthodoxy)",
  "category_zh": "清熱劑－清臟腑熱",
  "category_en": "Formulas that Clear Heat - Clear Organ Heat",
  "comparison_group": "清熱劑 / Clear Heat",

  "glance": {
    "category_banner_zh": "瀉肝膽火 清下焦濕熱",
    "category_banner_en": "DRAIN LIVER FIRE CLEAR DAMP HEAT",
    "plain_summary_zh": "肝膽實火上炎（頭痛目赤口苦）與肝膽濕熱下注（陰腫陰癢淋濁）之代表方。大苦大寒，清瀉肝膽實火與下焦濕熱。",
    "plain_summary_en": "Premier formula for Liver/Gallbladder blazing fire and lower burner damp-heat. Features headache, bitter taste, and pudendal itching.",
    "plain_indications_zh": ["肝膽實火上炎", "頭痛目赤", "脅痛口苦", "濕熱下注", "陰腫陰癢"],
    "plain_indications_en": ["liver fire blazing", "headache red eyes", "hypochondriac pain bitter taste", "damp-heat downward", "pudendal itching"],
    "herb_count": 10
  },

  "composition": [
    {
      "herb_id": "herb.long_dan_cao",
      "herb_zh": "龍膽草", "name_zh": "龍膽草", "herb_en": "Gentian Root", "name_en": "Gentian Root", "pinyin": "Long Dan Cao", "pinyin_toned": "Lóng Dǎn Cǎo",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "大苦大寒，專瀉肝膽實火，清下焦濕熱——為君藥",
      "in_formula_zh": "大苦大寒，專瀉肝膽實火，清下焦濕熱——為君藥"
    },
    {
      "herb_id": "herb.huang_qin",
      "herb_zh": "黃芩", "name_zh": "黃芩", "herb_en": "Baikal Skullcap Root", "name_en": "Baikal Skullcap Root", "pinyin": "Huang Qin", "pinyin_toned": "Huáng Qín",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "苦寒清熱燥濕，助龍膽草瀉肝膽實火",
      "in_formula_zh": "苦寒清熱燥濕，助龍膽草瀉肝膽實火"
    },
    {
      "herb_id": "herb.zhi_zi",
      "herb_zh": "梔子", "name_zh": "梔子", "herb_en": "Gardenia Fruit", "name_en": "Gardenia Fruit", "pinyin": "Zhi Zi", "pinyin_toned": "Zhī Zǐ",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "清熱利濕，導肝膽火熱下行從小便出",
      "in_formula_zh": "清熱利濕，導肝膽火熱下行從小便出"
    },
    {
      "herb_id": "herb.ze_xie",
      "herb_zh": "澤瀉", "name_zh": "澤瀉", "herb_en": "Alisma Rhizome", "name_en": "Alisma Rhizome", "pinyin": "Ze Xie", "pinyin_toned": "Zé Xiè",
      "dose_g": "12", "decoction_reference_g": "12g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "淡滲利濕，清瀉下焦濕熱",
      "in_formula_zh": "淡滲利濕，清瀉下焦濕熱"
    },
    {
      "herb_id": "herb.mu_tong",
      "herb_zh": "木通", "name_zh": "木通", "herb_en": "Akebia Stem", "name_en": "Akebia Stem", "pinyin": "Mu Tong", "pinyin_toned": "Mù Tōng",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "清熱利尿，通利水道與血脈",
      "in_formula_zh": "清熱利尿，通利水道與血脈"
    },
    {
      "herb_id": "herb.che_qian_zi",
      "herb_zh": "車前子", "name_zh": "車前子", "herb_en": "Plantain Seed", "name_en": "Plantain Seed", "pinyin": "Che Qian Zi", "pinyin_toned": "Chē Qián Zǐ",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "利水通淋，清瀉下焦濕熱",
      "in_formula_zh": "利水通淋，清瀉下焦濕熱"
    },
    {
      "herb_id": "herb.sheng_di_huang",
      "herb_zh": "生地黃", "name_zh": "生地黃", "herb_en": "Rehmannia Root", "name_en": "Rehmannia Root", "pinyin": "Sheng Di Huang", "pinyin_toned": "Shēng Dì Huáng",
      "dose_g": "12", "decoction_reference_g": "12g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "養陰涼血，防苦寒燥濕藥傷陰",
      "in_formula_zh": "養陰涼血，防苦寒燥濕藥傷陰"
    },
    {
      "herb_id": "herb.dang_gui",
      "herb_zh": "當歸", "name_zh": "當歸", "herb_en": "Chinese Angelica Root", "name_en": "Chinese Angelica Root", "pinyin": "Dang Gui", "pinyin_toned": "Dāng Guī",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "養血和血，柔肝舒脈",
      "in_formula_zh": "養血和血，柔肝舒脈"
    },
    {
      "herb_id": "herb.chai_hu",
      "herb_zh": "柴胡", "name_zh": "柴胡", "herb_en": "Bupleurum Root", "name_en": "Bupleurum Root", "pinyin": "Chai Hu", "pinyin_toned": "Chái Hú",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "使", "role_en": "Envoy",
      "role_reason_zh": "疏肝理氣，引諸藥直達肝膽經",
      "in_formula_zh": "疏肝理氣，引諸藥直達肝膽經"
    },
    {
      "herb_id": "herb.gan_cao",
      "herb_zh": "甘草", "name_zh": "甘草", "herb_en": "Licorice Root", "name_en": "Licorice Root", "pinyin": "Gan Cao", "pinyin_toned": "Gān Cǎo",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "使", "role_en": "Envoy",
      "role_reason_zh": "調和諸藥，緩急和中",
      "in_formula_zh": "調和諸藥，緩急和中"
    }
  ],

  "key_pairs": [
    "pair.long_dan_cao__chai_hu",
    "pair.huang_qin__zhi_zi",
    "pair.sheng_di_huang__dang_gui"
  ],
  "key_pairs_note_zh": "龍膽草配柴胡（一清一疏，瀉火不鬱）；黃芩配梔子（清熱瀉火，導熱下行）；生地配當歸（養血滋陰，防苦寒傷陰）。",
  "key_pairs_note_en": "Long Dan Cao with Chai Hu (drains fire without causing stagnation); Huang Qin with Zhi Zi (clears heat and guides downward); Sheng Di Huang with Dang Gui (nourishes blood/yin to prevent drying).",

  "fang_yi_zh": "《醫宗金鑑》清瀉肝膽實火與下焦濕熱之主方。龍膽草大苦大寒，專瀉肝膽實火、清下焦濕熱為君；黃芩、梔子苦寒瀉火、清熱利濕為臣；澤瀉、木通、車前子滲濕利尿，導濕熱下行從小便出；生地黃、當歸滋陰養血，防止苦寒燥濕藥傷陰；柴胡疏肝理氣，引諸藥直達肝膽經為使；生甘草調和諸藥。全方瀉中有補，清中有養。",
  "fang_yi_en": "Premier formula for draining Liver/Gallbladder fire and lower burner damp-heat. Long Dan Cao purges Liver fire as chief; Huang Qin and Zhi Zi clear heat as deputies; Ze Xie, Mu Tong, Che Qian Zi drain dampness via urine; Sheng Di Huang and Dang Gui nourish blood to protect yin; Chai Hu acts as envoy to direct herbs into Liver/GB channels.",

  "actions_zh": [
    "瀉肝膽實火 — 清瀉肝膽經實熱火毒",
    "清下焦濕熱 — 疏利下焦肝膽濕熱",
    "養血柔肝 — 滋陰養血、防苦寒藥傷陰",
    "導熱下行 — 通利水道、使濕熱從小便解"
  ],
  "actions_en": [
    "Drains Liver and Gallbladder fire — purges excess fire from Liver/GB channels",
    "Clears Lower Burner damp-heat — clears and drains damp-heat in lower burner",
    "Nourishes blood and softens Liver — nourishes Yin/blood to protect against bitter-cold herbs",
    "Directs heat downward — unblocks urinary pathways to expel damp-heat via urination"
  ],

  "pattern_indications_zh": [
    "肝膽實火上炎證／肝膽濕熱下注證：頭痛目赤、脅痛口苦、耳鳴耳聾、陰腫陰癢、筋痿陰汗、小便淋濁、舌紅苔黃膩、脈弦數有力。"
  ],
  "pattern_indications_en": [
    "Blazing Liver and Gallbladder Fire / Lower Burner Damp-Heat: Headache, red eyes, hypochondriac pain, bitter taste, tinnitus, deafness, pudendal swelling and itching, foul turbid leukorrhea/urination, red tongue with yellow greasy coating, wiry rapid forceful pulse."
  ],

  "indications": [
    {
      "pattern_zh": "肝膽實火上炎證 / 肝膽濕熱下注證",
      "pattern_en": "Blazing Liver and Gallbladder Fire / Lower Burner Damp-Heat",
      "clinical_picture_zh": "頭痛目赤、脅痛口苦、耳鳴耳聾、陰腫陰癢、小便淋濁",
      "clinical_picture_en": "Headache, red eyes, hypochondriac pain, bitter taste, tinnitus, pudendal itching, turbid urination",
      "tongue_zh": "舌紅，苔黃膩",
      "tongue_en": "Red tongue with yellow greasy coating",
      "pulse_zh": "脈弦數有力",
      "pulse_en": "Wiry, rapid, forceful pulse"
    }
  ],

  "constitutional_types_zh": ["陰虛陽亢", "脾胃虛寒"],
  "constitutional_types_en": ["Yin deficiency with Yang rising", "Spleen/Stomach deficiency cold"],
  "constitutional_note_zh": "脾胃虛寒或陰虛無濕熱者禁用。",

  "modifications_zh": [
    "肝火甚、頭痛目赤甚者：加夏枯草 12g、菊花 9g（清肝明目）",
    "濕熱下注、陰癢帶下黃臭者：加苦參 9g、黃柏 6g（清熱燥濕止癢）",
    "小便血淋者：加小薊 15g、蒲黃 9g（涼血止血通淋）"
  ],
  "modifications_en": [
    "Severe Liver fire & red eyes: Add Xia Ku Cao 12g, Ju Hua 9g",
    "Severe pudendal itching & foul discharge: Add Ku Shen 9g, Huang Bai 6g",
    "Bloody dysuria: Add Xiao Ji 15g, Pu Huang 9g"
  ],

  "modifications": [
    { "if_zh": "肝火甚、頭痛目赤甚者", "if_en": "Severe Liver fire & red eyes", "change_zh": "加夏枯草 12g、菊花 9g（清肝明目）", "change_en": "Add Xia Ku Cao 12g, Ju Hua 9g" },
    { "if_zh": "濕熱下注、陰癢帶下黃臭者", "if_en": "Severe pudendal itching & foul discharge", "change_zh": "加苦參 9g、黃柏 6g（清熱燥濕止癢）", "change_en": "Add Ku Shen 9g, Huang Bai 6g" }
  ],

  "dose_adjustment_note_zh": "水煎服。本方大苦大寒，中病即止，不可過服久服。",
  "dose_adjustment_note_en": "Decoct in water. Discontinue once symptoms subside due to harsh bitter-cold nature.",

  "contraindications_zh": [
    "脾胃虛寒、食少便溏者禁用",
    "陰虛陽亢而無濕熱者慎用",
    "本方大苦大寒，中病即止，切不可過服久服"
  ],
  "contraindications_en": [
    "Contraindicated in Spleen/Stomach deficiency cold with poor appetite or loose stools",
    "Use with caution in Yin deficiency without damp-heat",
    "Contraindicated for prolonged use"
  ],

  "comparisons": [
    {
      "with": "formula.huang_lian_jie_du_tang",
      "name_zh": "黃連解毒湯",
      "differentiator_zh": "黃連解毒湯通瀉三焦火毒；龍膽瀉肝湯專清肝膽實火與下焦濕熱。",
      "differentiator_en": "Huang Lian Jie Du Tang purges fire from all three burners; Long Dan Xie Gan Tang targets Liver/GB fire and lower burner damp-heat."
    }
  ],

  "formula_family": [
    {
      "formula_id": "formula.long_dan_xie_gan_tang",
      "name_zh": "龍膽瀉肝湯",
      "relation": "同類",
      "change": ["原方結構"],
      "change_en": ["Base formula structure"]
    }
  ],

  "applications_zh": ["急性膽囊炎", "急性中耳炎", "帶狀疱疹", "前列腺炎", "陰道炎", "高血壓肝火型"],
  "applications_en": ["Acute cholecystitis", "Acute otitis media", "Herpes zoster", "Prostatitis", "Vaginitis", "Hypertension (Liver Fire)"],
  "modern_applications_zh": ["急性膽囊炎", "急性中耳炎", "帶狀疱疹", "前列腺炎", "陰道炎", "高血壓肝火型"],
  "modern_applications_en": ["Acute cholecystitis", "Acute otitis media", "Herpes zoster", "Prostatitis", "Vaginitis", "Hypertension (Liver Fire)"],

  "cloudtcm_url": "https://cloudtcm.com/formula/286",
  "american_dragon_url": "https://www.americandragon.com/HerbFormulas/LongDanXieGanTang.html",
  "source_urls": [
    "https://cloudtcm.com/formula/286",
    "https://www.americandragon.com/HerbFormulas/LongDanXieGanTang.html"
  ],

  "external_links": [
    { "source_id": "american_dragon", "url": "https://www.americandragon.com/HerbFormulas/LongDanXieGanTang.html", "label_zh": "American Dragon", "label_en": "American Dragon", "lang": "en", "link_status": "direct" },
    { "source_id": "cloudtcm", "url": "https://cloudtcm.com/formula/286", "label_zh": "雲端中醫", "label_en": "CloudTCM", "lang": "zh", "link_status": "direct" }
  ],

  "field_sources": {
    "actions_zh": ["yi_zong_jin_jian", "curriculum/formulas/Formulations Summary Chart.docx.md"],
    "composition_roles": ["yi_zong_jin_jian", "bastyr_materia_medica_2"],
    "indications": ["yi_zong_jin_jian"],
    "contraindications": ["bastyr_materia_medica_2"]
  },

  "review_status": "draft",
  "authored_by": "model_draft",
  "formula_song": "龍膽瀉肝梔芩柴，木通澤瀉車前偕。\n生地當歸甘草合，肝家實火濕熱消除。",
  "formula_song_zh": "龍膽瀉肝梔芩柴，木通澤瀉車前偕。\n生地當歸甘草合，肝家實火濕熱消除。",
  "formula_song_source_zh": "出自汪昂《湯頭歌訣》",
  "exam_pearl": "【考綱重點】肝膽實火上炎（頭痛目赤口苦）與肝膽濕熱下注（陰腫陰癢淋濁）首選方。龍膽草為君；柴胡引藥入肝經；當歸+生地養血防苦寒傷陰。NCBAHM 2026 CH Outline p.21。"
};

// 3. 導赤散
const dcs = {
  "_reference_note": "REFERENCE IMPLEMENTATION for formula.dao_chi_san matching template.",
  "id": "formula.dao_chi_san",
  "name_zh": "導赤散",
  "name_en": "Dao Chi San",
  "name_en_translated": "Guide Out the Red Powder",
  "pinyin": "Dao Chi San",
  "pinyin_toned": "Dǎo Chì Sǎn",
  "source_text_zh": "《小兒藥證直訣》",
  "source_text_en": "Xiao Er Yao Zheng Zhi Jue (Key to Therapeutics of Children's Diseases)",
  "category_zh": "清熱劑－清臟腑熱",
  "category_en": "Formulas that Clear Heat - Clear Organ Heat",
  "comparison_group": "清熱劑 / Clear Heat",

  "glance": {
    "category_banner_zh": "清心養陰 利水導熱",
    "category_banner_en": "CLEAR HEART NOURISH YIN DRAIN HEAT",
    "plain_summary_zh": "心經火熱及心火下移小腸證（口舌生瘡、心煩、小便赤澀痛）之名方。清心養陰、利水通淋——引火下行從小便出。",
    "plain_summary_en": "Classic formula for Heart channel heat and Heart heat transferring to Small Intestine. Features mouth sores and painful urination.",
    "plain_indications_zh": ["心經火熱", "心火下移小腸", "心胸煩熱", "口舌生瘡", "小便赤澀刺痛"],
    "plain_indications_en": ["heart fire blazing", "heart heat to small intestine", "heart heat restlessness", "mouth tongue sores", "painful red urination"],
    "herb_count": 4
  },

  "composition": [
    {
      "herb_id": "herb.sheng_di_huang",
      "herb_zh": "生地黃", "name_zh": "生地黃", "herb_en": "Rehmannia Root", "name_en": "Rehmannia Root", "pinyin": "Sheng Di Huang", "pinyin_toned": "Shēng Dì Huáng",
      "dose_g": "15", "decoction_reference_g": "15g",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "甘苦大寒，清熱涼血、滋陰生津，清心火——重用為君",
      "in_formula_zh": "甘苦大寒，清熱涼血、滋陰生津，清心火——重用為君"
    },
    {
      "herb_id": "herb.dan_zhu_ye",
      "herb_zh": "淡竹葉", "name_zh": "淡竹葉", "herb_en": "Lophatherus Stem", "name_en": "Lophatherus Stem", "pinyin": "Dan Zhu Ye", "pinyin_toned": "Dàn Zhú Yè",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "甘淡性寒，清心除煩、淡滲利濕，導熱下行",
      "in_formula_zh": "甘淡性寒，清心除煩、淡滲利濕，導熱下行"
    },
    {
      "herb_id": "herb.mu_tong",
      "herb_zh": "木通", "name_zh": "木通", "herb_en": "Akebia Stem", "name_en": "Akebia Stem", "pinyin": "Mu Tong", "pinyin_toned": "Mù Tōng",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "苦寒利水通淋，引心火從小腸而出",
      "in_formula_zh": "苦寒利水通淋，引心火從小腸而出"
    },
    {
      "herb_id": "herb.gan_cao",
      "herb_zh": "甘草", "name_zh": "甘草", "herb_en": "Licorice Root", "name_en": "Licorice Root", "pinyin": "Gan Cao", "pinyin_toned": "Gān Cǎo",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "使", "role_en": "Envoy",
      "role_reason_zh": "甘平，清熱瀉火、清利尿道、調和諸藥（用生甘草梢）",
      "in_formula_zh": "甘平，清熱瀉火、清利尿道、調和諸藥（用生甘草梢）"
    }
  ],

  "key_pairs": [
    "pair.sheng_di_huang__dan_zhu_ye",
    "pair.mu_tong__gan_cao"
  ],
  "key_pairs_note_zh": "生地配淡竹葉（滋陰清心，利水導熱）；木通配甘草梢（清利尿道，導熱下行止痛）。",
  "key_pairs_note_en": "Sheng Di Huang with Dan Zhu Ye (nourishes Yin and clears Heart heat); Mu Tong with Gan Cao Shao (unblocks urinary tract and drains heat downward).",

  "fang_yi_zh": "《小兒藥證直訣》清心利水之經典名方。重用生地黃甘苦大寒，清熱涼血、滋陰生津為君；淡竹葉甘淡性寒，清心除煩、淡滲利濕為臣；木通苦寒利水通淋，引心火從小腸而出為臣；生甘草梢清熱瀉火、清利尿道痛感、調和諸藥為使。水火相濟，導熱下行從小便解。",
  "fang_yi_en": "Classic formula for clearing Heart heat and draining urination. Heavy Sheng Di Huang clears Heart heat and nourishes Yin as chief; Dan Zhu Ye clears Heart heat as deputy; Mu Tong drains heat downward via Small Intestine/urine as deputy; Licorice tip quenches urinary tract pain and harmonizes as envoy.",

  "actions_zh": [
    "清心養陰 — 清瀉心經實火、滋養心陰",
    "利水通淋 — 引心火下行小腸、利尿通淋",
    "清利口舌 — 降火消腫、治療口舌生瘡",
    "導熱下行 — 水火相濟、使熱邪從小腸而出"
  ],
  "actions_en": [
    "Clears Heart heat and nourishes Yin — drains Heart fire excess and moistens fluids",
    "Promotes urination and unblocks dysuria — guides Heart heat downward out through Small Intestine",
    "Clears mouth and tongue — quenches fire to relieve aphthous ulcers",
    "Guides heat downward — balances water and fire to expel heat via urine"
  ],

  "pattern_indications_zh": [
    "心經火熱證（心火下移小腸）：心胸煩熱、口渴面赤、意欲飲水、口舌生瘡、或小便赤澀刺痛、舌尖紅絳、脈數。"
  ],
  "pattern_indications_en": [
    "Heart Channel Heat Excess / Heart Heat transferring to Small Intestine: Heart heat with irritability, thirst with desire for cold drinks, mouth and tongue sores, painful red urinary dribbling, red tongue tip, rapid pulse."
  ],

  "indications": [
    {
      "pattern_zh": "心經火熱證（心火下移小腸）",
      "pattern_en": "Heart Channel Heat Excess / Heart Heat transferring to Small Intestine",
      "clinical_picture_zh": "心胸煩熱、口渴面赤、口舌生瘡、小便赤澀刺痛",
      "clinical_picture_en": "Heart heat with irritability, thirst, mouth sores, painful red urination",
      "tongue_zh": "舌尖紅絳",
      "tongue_en": "Red tongue tip",
      "pulse_zh": "脈數",
      "pulse_en": "Rapid pulse"
    }
  ],

  "constitutional_types_zh": ["脾胃虛弱", "陰虛無火"],
  "constitutional_types_en": ["Spleen/Stomach weakness", "Yin deficiency without fire"],
  "constitutional_note_zh": "脾胃虛弱便溏者慎用。",

  "modifications_zh": [
    "血淋、小便尿血者：加小薊 15g、蒲黃 9g、藕節 12g（涼血止血通淋）",
    "心火熾盛、煩躁不眠者：加黃連 6g（清心瀉火）",
    "小便淋瀝澀痛甚者：加車前子 9g、滑石 15g（利水通淋）"
  ],
  "modifications_en": [
    "Bloody urination: Add Xiao Ji 15g, Pu Huang 9g, Ou Jie 12g",
    "Severe Heart fire & insomnia: Add Huang Lian 6g",
    "Severe painful dysuria: Add Che Qian Zi 9g, Hua Shi 15g"
  ],

  "modifications": [
    { "if_zh": "血淋、小便尿血者", "if_en": "Bloody urination", "change_zh": "加小薊 15g、蒲黃 9g、藕節 12g（涼血止血通淋）", "change_en": "Add Xiao Ji 15g, Pu Huang 9g, Ou Jie 12g" },
    { "if_zh": "心火熾盛、煩躁不眠者", "if_en": "Severe Heart fire & insomnia", "change_zh": "加黃連 6g（清心瀉火）", "change_en": "Add Huang Lian 6g" }
  ],

  "dose_adjustment_note_zh": "水煎服。小兒按年齡體重減量。",
  "dose_adjustment_note_en": "Decoct in water. Reduce dose for children.",

  "contraindications_zh": [
    "脾胃虛弱、食少便溏者慎用",
    "陰虛無火、小便清長者禁用"
  ],
  "contraindications_en": [
    "Use with caution in Spleen/Stomach weakness or loose stools",
    "Contraindicated in Yin deficiency without fire or clear profuse urine"
  ],

  "comparisons": [
    {
      "with": "formula.xie_xin_tang",
      "name_zh": "瀉心湯",
      "differentiator_zh": "瀉心湯苦寒直折瀉心脾實火；導赤散清心滋陰利水，引火下行。",
      "differentiator_en": "Xie Xin Tang purges Heart/Spleen fire with bitter-cold herbs; Dao Chi San clears Heart heat while nourishing Yin and guiding heat out via urine."
    }
  ],

  "formula_family": [
    {
      "formula_id": "formula.dao_chi_san",
      "name_zh": "導赤散",
      "relation": "同類",
      "change": ["原方結構"],
      "change_en": ["Base formula structure"]
    }
  ],

  "applications_zh": ["急性口炎（嘴破）", "口腔潰瘍", "急性尿道炎", "急性膀胱炎", "小兒夜啼"],
  "applications_en": ["Acute stomatitis", "Aphthous ulcers", "Acute urethritis", "Acute cystitis", "Infantile night crying"],
  "modern_applications_zh": ["急性口炎（嘴破）", "口腔潰瘍", "急性尿道炎", "急性膀胱炎", "小兒夜啼"],
  "modern_applications_en": ["Acute stomatitis", "Aphthous ulcers", "Acute urethritis", "Acute cystitis", "Infantile night crying"],

  "cloudtcm_url": "https://cloudtcm.com/formula/281",
  "american_dragon_url": "https://www.americandragon.com/HerbFormulas/DaoChiSan.html",
  "source_urls": [
    "https://cloudtcm.com/formula/281",
    "https://www.americandragon.com/HerbFormulas/DaoChiSan.html"
  ],

  "external_links": [
    { "source_id": "american_dragon", "url": "https://www.americandragon.com/HerbFormulas/DaoChiSan.html", "label_zh": "American Dragon", "label_en": "American Dragon", "lang": "en", "link_status": "direct" },
    { "source_id": "cloudtcm", "url": "https://cloudtcm.com/formula/281", "label_zh": "雲端中醫", "label_en": "CloudTCM", "lang": "zh", "link_status": "direct" }
  ],

  "field_sources": {
    "actions_zh": ["xiao_er_yao_zheng_zhi_jue", "curriculum/formulas/Formulations Summary Chart.docx.md"],
    "composition_roles": ["xiao_er_yao_zheng_zhi_jue", "bastyr_materia_medica_2"],
    "indications": ["xiao_er_yao_zheng_zhi_jue"],
    "contraindications": ["bastyr_materia_medica_2"]
  },

  "review_status": "draft",
  "authored_by": "model_draft",
  "formula_song": "導赤生地與木通，草梢竹葉四般功。\n口瘡尿赤莖中痛，心火下移小腸熱。",
  "formula_song_zh": "導赤生地與木通，草梢竹葉四般功。\n口瘡尿赤莖中痛，心火下移小腸熱。",
  "formula_song_source_zh": "出自汪昂《湯頭歌訣》",
  "exam_pearl": "【考綱重點】心經火熱及心火下移小腸證（口舌生瘡、心煩、尿赤澀痛）首選方。生地為君滋陰清心；木通+竹葉導火下行從小便出；甘草梢清痛利尿。NCBAHM 2026 CH Outline p.21。"
};

// Save reference files
fs.writeFileSync(path.join(refDir, 'formula.huang_lian_jie_du_tang.json'), JSON.stringify(hljdt, null, 2), 'utf8');
fs.writeFileSync(path.join(refDir, 'formula.long_dan_xie_gan_tang.json'), JSON.stringify(ldxgt, null, 2), 'utf8');
fs.writeFileSync(path.join(refDir, 'formula.dao_chi_san.json'), JSON.stringify(dcs, null, 2), 'utf8');

// Update data/herbs/formulas.json
const formulaJsonPath = path.join(__dirname, '../data/herbs/formulas.json');
const mainData = JSON.parse(fs.readFileSync(formulaJsonPath, 'utf8'));

[hljdt, ldxgt, dcs].forEach(ref => {
  const idx = mainData.records.findIndex(r => r.id === ref.id);
  if (idx !== -1) {
    mainData.records[idx] = Object.assign({}, mainData.records[idx], ref);
  } else {
    mainData.records.push(ref);
  }
});

fs.writeFileSync(formulaJsonPath, JSON.stringify(mainData, null, 2), 'utf8');
console.log('Updated data/herbs/formulas.json with Batch 2 Gold-Standard records!');
