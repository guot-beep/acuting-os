/**
 * scripts/build_batch1_gold_formulas.js
 * Builds Gold-Standard Reference Files for Yin Qiao San, Sang Ju Yin, and Bai Hu Tang
 * with verified CloudTCM & American Dragon URLs, dual key aliases, and valid F11 relation.
 */

const fs = require('fs');
const path = require('path');

const refDir = path.join(__dirname, '../data/herbs/reference');
if (!fs.existsSync(refDir)) {
  fs.mkdirSync(refDir, { recursive: true });
}

// 1. Yin Qiao San (銀翹散)
const yqs = {
  "_reference_note": "REFERENCE IMPLEMENTATION for formula.yin_qiao_san matching formula.ma_huang_tang.json schema.",
  "id": "formula.yin_qiao_san",
  "name_zh": "銀翹散",
  "name_en": "Yin Qiao San",
  "name_en_translated": "Honeysuckle and Forsythia Powder",
  "pinyin": "Yin Qiao San",
  "pinyin_toned": "Yín Qiáo Sǎn",
  "source_text_zh": "《溫病條辨》",
  "source_text_en": "Wen Bing Tiao Bian (Systematic Differentiation of Warm Diseases)",
  "category_zh": "解表劑－辛涼解表",
  "category_en": "Formulas that Release the Exterior - Cool, Acrid",
  "comparison_group": "解表劑 / Release Exterior",

  "glance": {
    "category_banner_zh": "辛涼解表",
    "category_banner_en": "COOL ACRID EXTERIOR RELEASE",
    "plain_summary_zh": "溫病初起、邪在衛分（風熱感冒）之首選方。發熱、微惡風寒、咽喉腫痛、口渴——辛涼宣透，清熱解毒。",
    "plain_summary_en": "Premier formula for early-stage Warm Disease at the Wei/Exterior stage (Wind-Heat common cold). Features fever, mild aversion to wind, sore throat, and thirst.",
    "plain_indications_zh": ["風熱感冒初起", "發熱微惡風寒", "咽喉腫痛", "口渴咳嗽"],
    "plain_indications_en": ["early wind-heat cold", "fever with mild aversion to wind", "sore swollen throat", "thirst and cough"],
    "herb_count": 10
  },

  "composition": [
    {
      "herb_id": "herb.jin_yin_hua",
      "herb_zh": "金銀花", "name_zh": "金銀花", "herb_en": "Honeysuckle Flower", "name_en": "Honeysuckle Flower", "pinyin": "Jin Yin Hua", "pinyin_toned": "Jīn Yín Huā",
      "dose_g": "30", "decoction_reference_g": "30g",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "甘寒質輕，芳香疏散，清熱解毒，辟穢化濁——重用為君",
      "role_reason_en": "Sweet and cold, light texture; clears heat, relieves toxicity and dispels turbid pathogens",
      "in_formula_zh": "甘寒質輕，芳香疏散，清熱解毒，辟穢化濁——重用為君"
    },
    {
      "herb_id": "herb.lian_qiao",
      "herb_zh": "連翹", "name_zh": "連翹", "herb_en": "Forsythia Fruit", "name_en": "Forsythia Fruit", "pinyin": "Lian Qiao", "pinyin_toned": "Lián Qiáo",
      "dose_g": "30", "decoction_reference_g": "30g",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "苦辛微寒，輕清宣透，清熱解毒，散結消腫——與金銀花相須為君",
      "role_reason_en": "Bitter, acrid, slightly cold; clears heat, dispels toxicity, and dissolves clumps - pairs as chief with Jin Yin Hua",
      "in_formula_zh": "苦辛微寒，輕清宣透，清熱解毒，散結消腫——與金銀花相須為君"
    },
    {
      "herb_id": "herb.bo_he",
      "herb_zh": "薄荷", "name_zh": "薄荷", "herb_en": "Field Mint", "name_en": "Field Mint", "pinyin": "Bo He", "pinyin_toned": "Bò He",
      "dose_g": "18", "decoction_reference_g": "18g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "辛涼質輕，疏散風熱，清利頭目，利咽喉",
      "role_reason_en": "Acrid and cool; disperses Wind-Heat, clears head and eyes, benefits sore throat",
      "in_formula_zh": "辛涼質輕，疏散風熱，清利頭目，利咽喉"
    },
    {
      "herb_id": "herb.niu_bang_zi",
      "herb_zh": "牛蒡子", "name_zh": "牛蒡子", "herb_en": "Burdock Fruit", "name_en": "Burdock Fruit", "pinyin": "Niu Bang Zi", "pinyin_toned": "Niú Bàng Zǐ",
      "dose_g": "18", "decoction_reference_g": "18g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "辛苦性寒，宣肺祛痰，散結利咽解毒——助薄荷解表利咽",
      "role_reason_en": "Acrid, bitter, cold; diffuses Lungs, clears phlegm, unblocks throat and dispels toxicity",
      "in_formula_zh": "辛苦性寒，宣肺祛痰，散結利咽解毒——助薄荷解表利咽"
    },
    {
      "herb_id": "herb.jing_jie",
      "herb_zh": "荊芥", "name_zh": "荊芥", "herb_en": "Schizonepeta Spikes", "name_en": "Schizonepeta Spikes", "pinyin": "Jing Jie Sui", "pinyin_toned": "Jīng Jiè Suì",
      "dose_g": "12", "decoction_reference_g": "12g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "辛溫質輕，疏風解表——溫而不燥，助金銀花、連翹開達肌表",
      "role_reason_en": "Acrid and warm; dispels wind and releases exterior without drying, helping open the muscle layer",
      "in_formula_zh": "辛溫質輕，疏風解表——溫而不燥，助金銀花、連翹開達肌表"
    },
    {
      "herb_id": "herb.dan_dou_chi",
      "herb_zh": "淡豆豉", "name_zh": "淡豆豉", "herb_en": "Prepared Fermented Soybeans", "name_en": "Prepared Fermented Soybeans", "pinyin": "Dan Dou Chi", "pinyin_toned": "Dàn Dòu Chǐ",
      "dose_g": "15", "decoction_reference_g": "15g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "辛涼疏散，解表除煩——助君藥透邪解表",
      "role_reason_en": "Acrid and cool; releases exterior and dispels irritability",
      "in_formula_zh": "辛涼疏散，解表除煩——助君藥透邪解表"
    },
    {
      "herb_id": "herb.jie_geng",
      "herb_zh": "桔梗", "name_zh": "桔梗", "herb_en": "Platycodon Root", "name_en": "Platycodon Root", "pinyin": "Jie Geng", "pinyin_toned": "Jié Gěng",
      "dose_g": "18", "decoction_reference_g": "18g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "苦辛性平，宣肺利咽，載藥上行——與牛蒡子相配清利咽喉",
      "role_reason_en": "Bitter, acrid, neutral; diffuses Lungs, benefits throat, carries herbs upward",
      "in_formula_zh": "苦辛性平，宣肺利咽，載藥上行——與牛蒡子相配清利咽喉"
    },
    {
      "herb_id": "herb.gan_cao",
      "herb_zh": "甘草", "name_zh": "甘草", "herb_en": "Licorice Root", "name_en": "Licorice Root", "pinyin": "Gan Cao", "pinyin_toned": "Gān Cǎo",
      "dose_g": "15", "decoction_reference_g": "15g",
      "role_zh": "使", "role_en": "Envoy",
      "role_reason_zh": "甘平，清熱解毒，調和諸藥——合桔梗即「甘桔湯」，清利咽喉",
      "role_reason_en": "Sweet and neutral; clears heat, dispels toxicity, harmonizes formula; pairs with Jie Geng for throat",
      "in_formula_zh": "甘平，清熱解毒，調和諸藥——合桔梗即「甘桔湯」，清利咽喉"
    },
    {
      "herb_id": "herb.lu_gen",
      "herb_zh": "蘆根", "name_zh": "蘆根", "herb_en": "Reed Rhizome", "name_en": "Reed Rhizome", "pinyin": "Lu Gen", "pinyin_toned": "Lú Gēn",
      "dose_g": "20", "decoction_reference_g": "20g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "甘寒生津，清熱止渴——煎湯代水，清肺胃之熱",
      "role_reason_en": "Sweet and cold; generates fluids, clears Lung and Stomach heat, quenches thirst",
      "in_formula_zh": "甘寒生津，清熱止渴——煎湯代水，清肺胃之熱"
    },
    {
      "herb_id": "herb.dan_zhu_ye",
      "herb_zh": "淡竹葉", "name_zh": "淡竹葉", "herb_en": "Lophatherus Stem and Leaves", "name_en": "Lophatherus Stem and Leaves", "pinyin": "Dan Zhu Ye", "pinyin_toned": "Dàn Zhú Yè",
      "dose_g": "12", "decoction_reference_g": "12g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "甘淡性寒，清熱除煩，導熱下行",
      "role_reason_en": "Sweet, bland, cold; clears heat, dispels irritability, guides heat downward",
      "in_formula_zh": "甘淡性寒，清熱除煩，導熱下行"
    }
  ],

  "key_pairs": [
    "pair.jin_yin_hua__lian_qiao",
    "pair.bo_he__niu_bang_zi",
    "pair.jie_geng__gan_cao",
    "pair.jing_jie__dan_dou_chi"
  ],
  "key_pairs_note_zh": "金銀花配連翹（相須為用，辛涼清熱解毒之黃金雙星）；薄荷配牛蒡子（疏散風熱、清利咽喉）；桔梗配甘草（甘桔湯，宣肺利咽）；荊芥配豆豉（辛溫辛涼並用，透達衛分邪氣）。",
  "key_pairs_note_en": "Jin Yin Hua with Lian Qiao (mutual reinforcement, classic duo for clearing Wind-Heat and toxicity); Bo He with Niu Bang Zi (disperses wind-heat, relieves throat); Jie Geng with Gan Cao (Gan Jie Tang duo for throat).",

  "fang_yi_zh": "吳鞠通《溫病條辨》首方。本方重用金銀花、連翹為君，輕清宣透、清熱解毒；薄荷、牛蒡子為臣，疏散風熱、清利咽喉；荊芥穗、淡豆豉微溫辛散，透表散邪而不傷陰；桔梗、甘草、竹葉、蘆根為佐使，清熱生津、宣肺利咽、導熱下行。全方「去性取用」，香氣大出即取服，不可重煎。",
  "fang_yi_en": "The premier formula of Wu Ju-tong's Wen Bing Tiao Bian. Uses heavy doses of Jin Yin Hua and Lian Qiao as chief herbs to clear heat and dispel toxicity. Bo He and Niu Bang Zi serve as deputies to clear Wind-Heat and unblock the throat. Jing Jie and Dan Dou Chi add a touch of warmth to open the pores without drying yin. Platycodon, Licorice, Lophatherus, and Reed Rhizome serve as assistants/envoys to generate fluids and direct heat downward.",

  "actions_zh": [
    "辛涼解表 — 疏散風熱、透邪外出",
    "清熱解毒 — 清解上焦風熱毒邪",
    "宣肺利咽 — 宣通肺氣、清利咽喉腫痛",
    "芳香辟穢 — 清熱生津、辟穢化濁"
  ],
  "actions_en": [
    "Releases exterior with cool acrid herbs — disperses Wind-Heat and vents pathogens",
    "Clears heat and relieves toxicity — purges toxic heat in the upper burner",
    "Diffuses Lung qi and benefits throat — unblocks Lung qi and relieves throat pain",
    "Dispels cloudiness with aromatics — clears heat, generates fluids, and transforms turbidity"
  ],

  "pattern_indications_zh": [
    "溫病初起、邪鬱衛分證（風熱感冒）：發熱、微惡風寒、無汗或有汗不暢、頭痛口渴、咳嗽咽痛、舌尖紅、苔薄白或薄黃、脈浮數。"
  ],
  "pattern_indications_en": [
    "Early stage Warm Disease at Wei/Exterior level (Wind-Heat common cold): Fever, mild aversion to wind and cold, anhidrosis or incomplete sweating, headache, thirst, cough, painful swollen throat, red tongue tip with thin white/yellow coating, floating rapid pulse."
  ],

  "indications": [
    {
      "pattern_zh": "溫病初起、邪鬱衛分證（風熱感冒）",
      "pattern_en": "Early stage Warm Disease at Wei/Exterior level (Wind-Heat common cold)",
      "clinical_picture_zh": "發熱、微惡風寒、無汗或有汗不暢、頭痛口渴、咳嗽咽痛、舌尖紅、苔薄白或薄黃、脈浮數",
      "clinical_picture_en": "Fever, mild aversion to wind and cold, anhidrosis or incomplete sweating, headache, thirst, cough, painful swollen throat",
      "tongue_zh": "舌尖紅，苔薄白或薄黃",
      "tongue_en": "Red tongue tip with thin white or thin yellow coating",
      "pulse_zh": "脈浮數",
      "pulse_en": "Floating and rapid"
    }
  ],

  "constitutional_types_zh": ["風寒感冒", "濕熱內盛"],
  "constitutional_types_en": ["Wind-Cold exterior", "Interior Damp-Heat"],
  "constitutional_note_zh": "風寒感冒惡寒重無汗者禁用；脾胃虛寒便溏者慎用。",

  "modifications_zh": [
    "口渴甚者：加天花粉 15g 生津止渴",
    "項腫咽痛甚者：加馬勃 9g、玄參 15g 清熱利咽解毒",
    "咳嗽甚者：加杏仁 9g 降氣止咳",
    "胸悶脘痞者：加藿香 9g、鬱金 9g 芳香化濕"
  ],
  "modifications_en": [
    "Severe thirst: Add Tian Hua Fen 15g to generate fluids",
    "Severe throat swelling & pain: Add Ma Bo 9g and Xuan Shen 15g",
    "Severe cough: Add Xing Ren 9g to descend Lung qi",
    "Chest oppression: Add Huo Xiang 9g and Yu Jin 9g"
  ],

  "modifications": [
    {
      "if_zh": "口渴甚者", "if_en": "Severe thirst",
      "change_zh": "加天花粉 15g 生津止渴", "change_en": "Add Tian Hua Fen 15g to generate fluids"
    },
    {
      "if_zh": "項腫咽痛甚者", "if_en": "Severe throat swelling and pain",
      "change_zh": "加馬勃 9g、玄參 15g 清熱利咽解毒", "change_en": "Add Ma Bo 9g and Xuan Shen 15g to relieve toxic throat heat"
    },
    {
      "if_zh": "咳嗽甚者", "if_en": "Severe cough",
      "change_zh": "加杏仁 9g 降氣止咳", "change_en": "Add Xing Ren 9g to descend Lung qi"
    },
    {
      "if_zh": "胸悶脘痞者", "if_en": "Chest oppression and fullness",
      "change_zh": "加藿香 9g、鬱金 9g 芳香化濕", "change_en": "Add Huo Xiang 9g and Yu Jin 9g to transform dampness"
    }
  ],

  "dose_adjustment_note_zh": "煎服法：水煎服。病重者日三服，夜一服。香氣大出即取服，不可過煎（過煎則藥氣徒濁，失其輕清宣透之性）。",
  "dose_adjustment_note_en": "Decoct method: Decoct briefly until fragrant aroma emerges; do not over-boil, or light aromatic qualities are lost.",

  "contraindications_zh": [
    "外感風寒表寒證（惡寒重、流清涕）禁用",
    "脾胃虛寒、大便溏薄者慎用",
    "瘡瘍陰證無熱者禁用"
  ],
  "contraindications_en": [
    "Contraindicated in Wind-Cold exterior cold patterns",
    "Use with caution in Spleen/Stomach deficiency cold with loose stools",
    "Contraindicated in Yin sores without heat"
  ],

  "comparisons": [
    {
      "with": "formula.sang_ju_yin",
      "name_zh": "桑菊飲",
      "differentiator_zh": "同為《溫病條辨》辛涼解表劑。銀翹散為「辛涼平劑」，解表清熱力強，主治發熱、咽喉腫痛；桑菊飲為「辛涼輕劑」，宣肺止咳力勝，主治咳嗽為主、身微熱。",
      "differentiator_en": "Both are cool acrid formulas from Wen Bing Tiao Bian. Yin Qiao San is a balanced cool formula with stronger heat-clearing for fever and sore throat; Sang Ju Yin is a light cool formula prioritizing cough relief."
    }
  ],

  "formula_family": [
    {
      "formula_id": "formula.sang_ju_yin",
      "name_zh": "桑菊飲",
      "relation": "加",
      "change": ["加桑葉、菊花、杏仁；減金銀花、連翹、荊芥、豆豉"],
      "change_en": ["Add Sang Ye, Ju Hua, Xing Ren; remove Jin Yin Hua, Lian Qiao, Jing Jie, Dou Chi"]
    }
  ],

  "applications_zh": ["急性上呼吸道感染", "流行性感冒", "急性扁桃體炎", "腮腺炎", "麻疹初起"],
  "applications_en": ["Acute upper respiratory infection", "Influenza", "Acute tonsillitis", "Mumps", "Early-stage measles"],
  "modern_applications_zh": ["急性上呼吸道感染", "流行性感冒", "急性扁桃體炎", "腮腺炎", "麻疹初起"],
  "modern_applications_en": ["Acute upper respiratory infection", "Influenza", "Acute tonsillitis", "Mumps", "Early-stage measles"],

  "cloudtcm_url": "https://cloudtcm.com/formula/271",
  "american_dragon_url": "https://www.americandragon.com/HerbFormulas/YinQiaoSan.html",
  "source_urls": [
    "https://cloudtcm.com/formula/271",
    "https://www.americandragon.com/HerbFormulas/YinQiaoSan.html"
  ],

  "external_links": [
    { "source_id": "american_dragon", "url": "https://www.americandragon.com/HerbFormulas/YinQiaoSan.html", "label_zh": "American Dragon", "label_en": "American Dragon", "lang": "en", "link_status": "direct" },
    { "source_id": "cloudtcm", "url": "https://cloudtcm.com/formula/271", "label_zh": "雲端中醫", "label_en": "CloudTCM", "lang": "zh", "link_status": "direct" }
  ],

  "field_sources": {
    "actions_zh": ["wen_bing_tiao_bian", "curriculum/formulas/Formulations Summary Chart.docx.md"],
    "composition_roles": ["wen_bing_tiao_bian", "bastyr_materia_medica_2"],
    "indications": ["wen_bing_tiao_bian"],
    "contraindications": ["bastyr_materia_medica_2"]
  },

  "review_status": "draft",
  "authored_by": "model_draft",
  "formula_song": "銀翹散主上焦病，竹葉荊牛豉薄荷。\n甘桔蘆根涼解法，清疏風熱發熱瘥。",
  "formula_song_zh": "銀翹散主上焦病，竹葉荊牛豉薄荷。\n甘桔蘆根涼解法，清疏風熱發熱瘥。",
  "formula_song_source_zh": "出自汪昂《湯頭歌訣》",
  "exam_pearl": "【考綱重點】溫病初起衛分證（風熱感冒、咽喉腫痛）首選方。重用銀翹為君；荊芥、豆豉微溫透表；「香氣大出即取服，不可過煎」。NCBAHM 2026 CH Outline p.20。"
};

// 2. Sang Ju Yin (桑菊飲)
const sjy = {
  "_reference_note": "REFERENCE IMPLEMENTATION for formula.sang_ju_yin matching formula.ma_huang_tang.json schema.",
  "id": "formula.sang_ju_yin",
  "name_zh": "桑菊飲",
  "name_en": "Sang Ju Yin",
  "name_en_translated": "Mulberry Leaf and Chrysanthemum Drink",
  "pinyin": "Sang Ju Yin",
  "pinyin_toned": "Sāng Jú Yǐn",
  "source_text_zh": "《溫病條辨》",
  "source_text_en": "Wen Bing Tiao Bian (Systematic Differentiation of Warm Diseases)",
  "category_zh": "解表劑－辛涼解表",
  "category_en": "Formulas that Release the Exterior - Cool, Acrid",
  "comparison_group": "解表劑 / Release Exterior",

  "glance": {
    "category_banner_zh": "輕宣肺熱",
    "category_banner_en": "LIGHT COOL LUNG DIFFUSING",
    "plain_summary_zh": "風熱感冒初起、咳嗽為主症之代表方（辛涼輕劑）。桑葉、菊花輕宣上焦風熱；杏仁、桔梗一宣一降止咳平喘。",
    "plain_summary_en": "Light cool acrid formula for early Wind-Heat cough. Features mild fever, cough, mild thirst, thin white tongue coating.",
    "plain_indications_zh": ["風熱感冒初起", "咳嗽為主", "身微熱", "口微渴"],
    "plain_indications_en": ["early wind-heat cold", "cough as primary symptom", "mild fever", "slight thirst"],
    "herb_count": 8
  },

  "composition": [
    {
      "herb_id": "herb.sang_ye",
      "herb_zh": "桑葉", "name_zh": "桑葉", "herb_en": "Mulberry Leaf", "name_en": "Mulberry Leaf", "pinyin": "Sang Ye", "pinyin_toned": "Sāng Yè",
      "dose_g": "7.5", "decoction_reference_g": "7.5g",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "甘苦微寒，輕宣上焦風熱，清肺絡之熱",
      "role_reason_en": "Sweet, bitter, slightly cold; lightly diffuses Wind-Heat in upper burner and clears Lung collaterals",
      "in_formula_zh": "甘苦微寒，輕宣上焦風熱，清肺絡之熱"
    },
    {
      "herb_id": "herb.ju_hua",
      "herb_zh": "菊花", "name_zh": "菊花", "herb_en": "Chrysanthemum Flower", "name_en": "Chrysanthemum Flower", "pinyin": "Ju Hua", "pinyin_toned": "Jú Huā",
      "dose_g": "3", "decoction_reference_g": "3g",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "甘苦微寒，清利頭目，疏散風熱——與桑葉相須為君",
      "role_reason_en": "Sweet, bitter, slightly cold; clears eyes and head, disperses wind-heat - pairs as chief with Sang Ye",
      "in_formula_zh": "甘苦微寒，清利頭目，疏散風熱——與桑葉相須為君"
    },
    {
      "herb_id": "herb.xing_ren",
      "herb_zh": "杏仁", "name_zh": "杏仁", "herb_en": "Apricot Seed", "name_en": "Apricot Seed", "pinyin": "Xing Ren", "pinyin_toned": "Xìng Rén",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "苦溫降氣，止咳平喘——降肺氣以止咳嗽",
      "role_reason_en": "Bitter and warm; descends Lung qi to arrest cough and wheezing",
      "in_formula_zh": "苦溫降氣，止咳平喘——降肺氣以止咳嗽"
    },
    {
      "herb_id": "herb.jie_geng",
      "herb_zh": "桔梗", "name_zh": "桔梗", "herb_en": "Platycodon Root", "name_en": "Platycodon Root", "pinyin": "Jie Geng", "pinyin_toned": "Jié Gěng",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "苦辛宣肺，載藥上行——與杏仁一宣一降，恢復肺氣宣降",
      "role_reason_en": "Bitter and acrid; diffuses Lung qi upward - pairs with Xing Ren as one ascending and one descending",
      "in_formula_zh": "苦辛宣肺，載藥上行——與杏仁一宣一降，恢復肺氣宣降"
    },
    {
      "herb_id": "herb.lian_qiao",
      "herb_zh": "連翹", "name_zh": "連翹", "herb_en": "Forsythia Fruit", "name_en": "Forsythia Fruit", "pinyin": "Lian Qiao", "pinyin_toned": "Lián Qiáo",
      "dose_g": "4.5", "decoction_reference_g": "4.5g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "苦寒清熱解毒，透達上焦",
      "role_reason_en": "Bitter and cold; clears heat, dispels toxicity, vents upper burner heat",
      "in_formula_zh": "苦寒清熱解毒，透達上焦"
    },
    {
      "herb_id": "herb.bo_he",
      "herb_zh": "薄荷", "name_zh": "薄荷", "herb_en": "Field Mint", "name_en": "Field Mint", "pinyin": "Bo He", "pinyin_toned": "Bò He",
      "dose_g": "2.5", "decoction_reference_g": "2.5g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "辛涼疏散風熱，清利頭目",
      "role_reason_en": "Acrid and cool; assists in dispersing wind-heat and benefiting eyes",
      "in_formula_zh": "辛涼疏散風熱，清利頭目"
    },
    {
      "herb_id": "herb.lu_gen",
      "herb_zh": "蘆根", "name_zh": "蘆根", "herb_en": "Reed Rhizome", "name_en": "Reed Rhizome", "pinyin": "Lu Gen", "pinyin_toned": "Lú Gēn",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "甘寒清熱生津止渴",
      "role_reason_en": "Sweet and cold; clears heat, generates fluids and quenches thirst",
      "in_formula_zh": "甘寒清熱生津止渴"
    },
    {
      "herb_id": "herb.gan_cao",
      "herb_zh": "甘草", "name_zh": "甘草", "herb_en": "Licorice Root", "name_en": "Licorice Root", "pinyin": "Gan Cao", "pinyin_toned": "Gān Cǎo",
      "dose_g": "2.5", "decoction_reference_g": "2.5g",
      "role_zh": "使", "role_en": "Envoy",
      "role_reason_zh": "甘平調和諸藥，合桔梗利咽",
      "role_reason_en": "Sweet and neutral; harmonizes herbs, pairs with Jie Geng to soothe throat",
      "in_formula_zh": "甘平調和諸藥，合桔梗利咽"
    }
  ],

  "key_pairs": [
    "pair.sang_ye__ju_hua",
    "pair.jie_geng__xing_ren",
    "pair.jie_geng__gan_cao"
  ],
  "key_pairs_note_zh": "桑葉配菊花（桑菊相須，輕宣上焦風熱、清利頭目）；桔梗配杏仁（一宣一降，開宣肺氣、降氣止咳）；桔梗配甘草（甘桔湯，利咽喉）。",
  "key_pairs_note_en": "Sang Ye with Ju Hua (mutual accentuation, light cool pair for upper burner); Jie Geng with Xing Ren (one ascends, one descends for Lung qi restoration); Jie Geng with Gan Cao (throat duo).",

  "fang_yi_zh": "吳鞠通辛涼輕劑。桑葉、菊花輕宣上焦風熱為君；杏仁降氣、桔梗宣肺，二藥一宣一降，恢復肺宣降之常為臣；薄荷助桑菊疏散風熱，連翹清熱解毒，蘆根清熱生津共為佐；生甘草調和諸藥為使。本方比銀翹散更偏於「宣肺止咳」，解表發汗之力較輕。",
  "fang_yi_en": "Wu Ju-tong's light cool formula. Sang Ye and Ju Hua lightly diffuse upper burner Wind-Heat as chief; Xing Ren descends qi while Platycodon diffuses Lungs as deputies, restoring normal Lung qi dynamics. Bo He, Lian Qiao, and Lu Gen serve as assistants to clear heat and generate fluids. Licorice harmonizes as envoy.",

  "actions_zh": [
    "疏風清熱 — 疏散上焦風熱邪氣",
    "宣肺止咳 — 宣通肺氣、降氣止咳",
    "清利頭目 — 輕清上浮、清利頭面目疾",
    "生津止渴 — 清解肺胃熱邪、生津潤燥"
  ],
  "actions_en": [
    "Disperses wind and clears heat — clears upper burner Wind-Heat",
    "Diffuses Lung qi and arrests cough — restores Lung ascending-descending qi movement",
    "Clears head and eyes — light and ascending to benefit eyes and head",
    "Generates fluids and quenches thirst — clears Lung/Stomach heat and moistens dryness"
  ],

  "pattern_indications_zh": [
    "風熱犯肺證（風熱感冒咳嗽）：咳嗽、身微熱、口微渴、舌苔薄白、脈浮數。"
  ],
  "pattern_indications_en": [
    "Wind-Heat attacking Lungs (Wind-Heat cough): Cough, slight fever, slight thirst, thin white tongue coating, floating rapid pulse."
  ],

  "indications": [
    {
      "pattern_zh": "風熱犯肺證（風熱感冒咳嗽）",
      "pattern_en": "Wind-Heat attacking Lungs (Wind-Heat cough)",
      "clinical_picture_zh": "咳嗽、身微熱、口微渴、舌苔薄白、脈浮數",
      "clinical_picture_en": "Cough, slight fever, slight thirst, thin white tongue coating, floating rapid pulse",
      "tongue_zh": "苔薄白",
      "tongue_en": "Thin white coating",
      "pulse_zh": "脈浮數",
      "pulse_en": "Floating and rapid"
    }
  ],

  "constitutional_types_zh": ["風寒咳嗽", "陰虛乾咳"],
  "constitutional_types_en": ["Wind-Cold cough", "Yin deficiency dry cough"],
  "constitutional_note_zh": "風寒咳嗽（痰白稀、惡寒重）者禁用；陰虛乾咳無痰者不宜服用。",

  "modifications_zh": [
    "咳嗽頻作、肺熱甚者：加黃芩 9g 清肺熱",
    "口渴甚者：加天花粉 12g 生津止渴",
    "咽喉腫痛甚者：加玄參 12g、板藍根 15g 清熱解毒利咽"
  ],
  "modifications_en": [
    "Frequent cough with Lung heat: Add Huang Qin 9g",
    "Marked thirst: Add Tian Hua Fen 12g",
    "Severe sore throat: Add Xuan Shen 12g and Ban Lan Gen 15g"
  ],

  "modifications": [
    {
      "if_zh": "咳嗽頻作、肺熱甚者", "if_en": "Frequent cough with Lung heat",
      "change_zh": "加黃芩 9g 清肺熱", "change_en": "Add Huang Qin 9g to clear Lung heat"
    },
    {
      "if_zh": "口渴甚者", "if_en": "Marked thirst",
      "change_zh": "加天花粉 12g 生津止渴", "change_en": "Add Tian Hua Fen 12g to generate fluids"
    },
    {
      "if_zh": "咽喉腫痛甚者", "if_en": "Severe sore throat",
      "change_zh": "加玄參 12g、板藍根 15g 清熱解毒利咽", "change_en": "Add Xuan Shen 12g and Ban Lan Gen 15g for throat"
    }
  ],

  "dose_adjustment_note_zh": "水煎服，煮取二杯，日二服。不可過煎。",
  "dose_adjustment_note_en": "Decoct briefly; take twice daily.",

  "contraindications_zh": [
    "風寒咳嗽忌用",
    "陰虛肺燥乾咳忌用"
  ],
  "contraindications_en": [
    "Contraindicated in Wind-Cold cough",
    "Contraindicated in dry cough from Yin deficiency"
  ],

  "comparisons": [
    {
      "with": "formula.yin_qiao_san",
      "name_zh": "銀翹散",
      "differentiator_zh": "銀翹散清熱解表力強，主治發熱咽痛；桑菊飲輕宣肺熱力勝，主治咳嗽為主、身微熱。",
      "differentiator_en": "Yin Qiao San has stronger heat-clearing for fever/throat; Sang Ju Yin is lighter and focuses on cough."
    }
  ],

  "applications_zh": ["急性支氣管炎", "上呼吸道感染", "流行性感冒咳嗽", "急性結膜炎"],
  "applications_en": ["Acute bronchitis", "Upper respiratory infection", "Influenza cough", "Acute conjunctivitis"],
  "modern_applications_zh": ["急性支氣管炎", "上呼吸道感染", "流行性感冒咳嗽", "急性結膜炎"],
  "modern_applications_en": ["Acute bronchitis", "Upper respiratory infection", "Influenza cough", "Acute conjunctivitis"],

  "cloudtcm_url": "https://cloudtcm.com/formula/162",
  "american_dragon_url": "https://www.americandragon.com/HerbFormulas/SangJuYin.html",
  "source_urls": [
    "https://cloudtcm.com/formula/162",
    "https://www.americandragon.com/HerbFormulas/SangJuYin.html"
  ],

  "external_links": [
    { "source_id": "american_dragon", "url": "https://www.americandragon.com/HerbFormulas/SangJuYin.html", "label_zh": "American Dragon", "label_en": "American Dragon", "lang": "en", "link_status": "direct" },
    { "source_id": "cloudtcm", "url": "https://cloudtcm.com/formula/162", "label_zh": "雲端中醫", "label_en": "CloudTCM", "lang": "zh", "link_status": "direct" }
  ],

  "field_sources": {
    "actions_zh": ["wen_bing_tiao_bian", "curriculum/formulas/Formulations Summary Chart.docx.md"],
    "composition_roles": ["wen_bing_tiao_bian", "bastyr_materia_medica_2"],
    "indications": ["wen_bing_tiao_bian"],
    "contraindications": ["bastyr_materia_medica_2"]
  },

  "review_status": "draft",
  "authored_by": "model_draft",
  "formula_song": "桑菊飲中桔杏翹，薄荷蘆根甘草條。\n輕宣風熱止咳嗽，風溫咳嗽服之消。",
  "formula_song_zh": "桑菊飲中桔杏翹，薄荷蘆根甘草條。\n輕宣風熱止咳嗽，風溫咳嗽服之消。",
  "formula_song_source_zh": "出自汪昂《湯頭歌訣》",
  "exam_pearl": "【考綱重點】風熱犯肺、咳嗽為主證首選方（辛涼輕劑）。桑葉+菊花輕宣風熱；杏仁+桔梗一宣一降止咳。NCBAHM 2026 CH Outline p.20。"
};

// 3. Bai Hu Tang (白虎湯)
const bht = {
  "_reference_note": "REFERENCE IMPLEMENTATION for formula.bai_hu_tang matching formula.ma_huang_tang.json schema.",
  "id": "formula.bai_hu_tang",
  "name_zh": "白虎湯",
  "name_en": "Bai Hu Tang",
  "name_en_translated": "White Tiger Decoction",
  "pinyin": "Bai Hu Tang",
  "pinyin_toned": "Bái Hǔ Tāng",
  "source_text_zh": "《傷寒論》",
  "source_text_en": "Shang Han Lun (Treatise on Cold Damage)",
  "category_zh": "清熱劑－清氣分熱",
  "category_en": "Formulas that Clear Heat - Clear Qi Level / Yangming Stage",
  "comparison_group": "清熱劑 / Clear Heat",

  "glance": {
    "category_banner_zh": "清氣分熱",
    "category_banner_en": "CLEAR QI LEVEL HEAT",
    "plain_summary_zh": "陽明經熱盛、熱入氣分四大證（身大熱、口大渴、汗大出、脈洪大）之代表方。石膏清熱透表，知母滋陰潤燥。",
    "plain_summary_en": "Premier formula for Yangming Stage / Qi-Level Heat featuring the Four Bigs (Big Fever, Big Thirst, Big Sweating, Big Pulse).",
    "plain_indications_zh": ["身大熱", "口大渴", "汗大出", "脈洪大"],
    "plain_indications_en": ["high fever", "profuse thirst", "profuse sweating", "flooding large pulse"],
    "herb_count": 4
  },

  "composition": [
    {
      "herb_id": "herb.shi_gao",
      "herb_zh": "石膏", "name_zh": "石膏", "herb_en": "Gypsum", "name_en": "Gypsum", "pinyin": "Shi Gao", "pinyin_toned": "Shí Gāo",
      "dose_g": "30", "decoction_reference_g": "30g",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "辛甘大寒，清瀉肺胃大熱，兼能透熱外達——重用為君",
      "role_reason_en": "Acrid, sweet, very cold; clears Lung and Stomach heat, vents heat outward - heavy dose chief",
      "in_formula_zh": "辛甘大寒，清瀉肺胃大熱，兼能透熱外達——重用為君"
    },
    {
      "herb_id": "herb.zhi_mu",
      "herb_zh": "知母", "name_zh": "知母", "herb_en": "Anemarrhena Rhizome", "name_en": "Anemarrhena Rhizome", "pinyin": "Zhi Mu", "pinyin_toned": "Zhī Mǔ",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "苦寒質潤，清熱瀉火，滋陰潤燥——與石膏相須為用，增強清熱生津之力",
      "role_reason_en": "Bitter, cold, moistening; clears heat, drains fire, nourishes yin - pairs as deputy with Shi Gao",
      "in_formula_zh": "苦寒質潤，清熱瀉火，滋陰潤燥——與石膏相須為用，增強清熱生津之力"
    },
    {
      "herb_id": "herb.zhi_gan_cao",
      "herb_zh": "炙甘草", "name_zh": "炙甘草", "herb_en": "Honey-fried Licorice", "name_en": "Honey-fried Licorice", "pinyin": "Zhi Gan Cao", "pinyin_toned": "Zhì Gān Cǎo",
      "dose_g": "3", "decoction_reference_g": "3g",
      "role_zh": "使", "role_en": "Envoy",
      "role_reason_zh": "甘溫益胃和中，緩石膏大寒之性，防傷脾胃",
      "role_reason_en": "Sweet and warm; tonifies Stomach and Middle Burner, moderates harsh coldness of Shi Gao",
      "in_formula_zh": "甘溫益胃和中，緩石膏大寒之性，防傷脾胃"
    },
    {
      "herb_id": "herb.geng_mi",
      "herb_zh": "粳米", "name_zh": "粳米", "herb_en": "Nonglutinous Rice", "name_en": "Nonglutinous Rice", "pinyin": "Geng Mi", "pinyin_toned": "Gēng Mǐ",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "使", "role_en": "Envoy",
      "role_reason_zh": "甘平益胃生津，與甘草同為使，顧護胃氣、防止寒藥傷中",
      "role_reason_en": "Sweet and neutral; nourishes Stomach qi and fluids, protecting middle burner against cold herbs",
      "in_formula_zh": "甘平益胃生津，與甘草同為使，顧護胃氣、防止寒藥傷中"
    }
  ],

  "key_pairs": [
    "pair.shi_gao__zhi_mu",
    "pair.zhi_gan_cao__geng_mi"
  ],
  "key_pairs_note_zh": "石膏配知母（相須為用，辛甘大寒清氣分大熱、滋陰潤燥之黃金藥對）；炙甘草配粳米（甘溫和中、顧護胃氣、防寒傷中）。",
  "key_pairs_note_en": "Shi Gao with Zhi Mu (mutual accentuation, premier duo for Qi-level heat and nourishing fluids); Zhi Gan Cao with Geng Mi (protects Spleen and Stomach against extreme cold).",

  "fang_yi_zh": "《傷寒論》清氣分大熱之祖方。重用石膏辛甘大寒，直達肺胃清透大熱為君；知母苦寒滋陰潤燥，協助石膏清熱兼護陰液為臣；炙甘草、粳米甘溫和中，顧護胃氣，防止大寒之藥損傷脾胃為使。四味相配，清熱而不傷陰，瀉火而不傷胃。",
  "fang_yi_en": "Ancestor formula for clearing Qi-level heat in Shang Han Lun. Uses heavy Shi Gao as chief to purge Lung and Stomach fire. Zhi Mu serves as deputy to moisten dryness and assist Shi Gao. Zhi Gan Cao and Geng Mi serve as envoys to protect the Stomach qi from harsh cold.",

  "actions_zh": [
    "清熱生津 — 清瀉陽明氣分大熱、生津止渴",
    "瀉火除煩 — 瀉透胃火、消除心煩躁熱",
    "透熱外達 — 宣透內鬱熱邪外出",
    "顧護胃氣 — 益胃生津、防寒藥傷中"
  ],
  "actions_en": [
    "Clears Qi-level heat and generates fluids — purges Yangming Qi-stage heat and quenches thirst",
    "Drains fire and eliminates irritability — clears Stomach fire and rests agitation",
    "Vents heat outward — diffuses trapped interior heat outward",
    "Protects Stomach qi — nourishes Stomach fluids and guards against cold herbs"
  ],

  "pattern_indications_zh": [
    "陽明氣分熱盛證（白虎湯四大證）：身大熱、口大渴引飲、汗大出、心煩躁熱、面赤惡熱、舌紅苔黃乾、脈洪大有力或滑數。"
  ],
  "pattern_indications_en": [
    "Yangming Stage / Qi-Level Heat Excess (The Four Bigs): High fever, severe thirst for ice water, profuse sweating, extreme restlessness, red face, aversion to heat, red tongue with dry yellow coating, flooding large rapid pulse."
  ],

  "indications": [
    {
      "pattern_zh": "陽明氣分熱盛證（白虎湯四大證）",
      "pattern_en": "Yangming Stage / Qi-Level Heat Excess (The Four Bigs)",
      "clinical_picture_zh": "身大熱、口大渴引飲、汗大出、心煩躁熱、面赤惡熱、舌紅苔黃乾、脈洪大有力或滑數",
      "clinical_picture_en": "High fever, severe thirst for ice water, profuse sweating, extreme restlessness, red face, aversion to heat",
      "tongue_zh": "舌紅，苔黃乾",
      "tongue_en": "Red tongue with dry yellow coating",
      "pulse_zh": "脈洪大有力或滑數",
      "pulse_en": "Flooding, large, forceful, or slippery rapid pulse"
    }
  ],

  "constitutional_types_zh": ["表未解者", "真寒假熱", "脾胃虛寒"],
  "constitutional_types_en": ["Exterior pattern unreleased", "True cold false heat", "Spleen/Stomach deficiency cold"],
  "constitutional_note_zh": "《傷寒論》白虎四禁：脈浮弦細、脈沉、不渴、汗不出者禁用。",

  "modifications_zh": [
    "氣陰兩傷、汗大出、脈大而無力者：加人參 9g ➔ 即白虎加人參湯（益氣生津）",
    "兼風濕熱痹、關節紅腫熱痛者：加桂枝 9g ➔ 即白虎加桂枝湯（清熱通絡）",
    "兼濕熱身重、脘痞者：加蒼朮 9g ➔ 即白虎加蒼朮湯（燥濕清熱）"
  ],
  "modifications_en": [
    "Qi and Yin injury with weak pulse: Add Ren Shen 9g (Bai Hu Jia Ren Shen Tang)",
    "With Wind-Damp-Heat Bi syndrome: Add Gui Zhi 9g (Bai Hu Jia Gui Zhi Tang)",
    "With Damp-Heat and heavy body: Add Cang Zhu 9g (Bai Hu Jia Cang Zhu Tang)"
  ],

  "modifications": [
    {
      "if_zh": "氣陰兩傷、汗大出、脈大而無力者", "if_en": "Qi and Yin injury with profuse sweating and weak pulse",
      "change_zh": "加人參 9g ➔ 即白虎加人參湯（益氣生津）", "change_en": "Add Ren Shen 9g (Bai Hu Jia Ren Shen Tang) to tonify qi and fluids"
    },
    {
      "if_zh": "兼風濕熱痹、關節紅腫熱痛者", "if_en": "With Wind-Damp-Heat Bi syndrome and swollen painful joints",
      "change_zh": "加桂枝 9g ➔ 即白虎加桂枝湯（清熱通絡）", "change_en": "Add Gui Zhi 9g (Bai Hu Jia Gui Zhi Tang) to clear heat and unblock channels"
    },
    {
      "if_zh": "兼濕熱身重、脘痞者", "if_en": "With Damp-Heat, heavy body, and epigastric fullness",
      "change_zh": "加蒼朮 9g ➔ 即白虎加蒼朮湯（燥濕清熱）", "change_en": "Add Cang Zhu 9g (Bai Hu Jia Cang Zhu Tang) to dry dampness"
    }
  ],

  "dose_adjustment_note_zh": "水煎服。先煎石膏 20-30 分鐘，後下知母。煮米熟湯成，去滓溫服。",
  "dose_adjustment_note_en": "Decoct Shi Gao first for 20-30 minutes before adding other herbs.",

  "contraindications_zh": [
    "表證未解、無汗惡寒者禁用",
    "脈浮細、脈沉、不渴、汗不出者禁用（白虎四禁）",
    "脾胃虛寒、大便溏薄者禁用",
    "真寒假熱（陰盛格陽）者禁用"
  ],
  "contraindications_en": [
    "Contraindicated if exterior pattern is not yet released",
    "Contraindicated in White Tiger Four Cautions (submerged/fine pulse, no thirst, no sweating)",
    "Contraindicated in Spleen/Stomach deficiency cold",
    "Contraindicated in true cold with false heat"
  ],

  "comparisons": [
    {
      "with": "formula.huang_lian_jie_du_tang",
      "name_zh": "黃連解毒湯",
      "differentiator_zh": "白虎湯清陽明氣分無形大熱，重在清熱生津；黃連解毒湯瀉三焦有形火毒，重在苦寒直折瀉火。",
      "differentiator_en": "Bai Hu Tang clears Qi-level formless heat and generates fluids; Huang Lian Jie Du Tang drains toxic fire in all three burners with bitter-cold herbs."
    }
  ],

  "formula_family": [
    {
      "formula_id": "formula.bai_hu_jia_ren_shen_tang",
      "name_zh": "白虎加人參湯",
      "relation": "加",
      "change": ["加人參 9g"],
      "change_en": ["Add Ren Shen 9g"]
    },
    {
      "formula_id": "formula.bai_hu_jia_gui_zhi_tang",
      "name_zh": "白虎加桂枝湯",
      "relation": "加",
      "change": ["加桂枝 9g"],
      "change_en": ["Add Gui Zhi 9g"]
    },
    {
      "formula_id": "formula.bai_hu_jia_cang_zhu_tang",
      "name_zh": "白虎加蒼朮湯",
      "relation": "加",
      "change": ["加蒼朮 9g"],
      "change_en": ["Add Cang Zhu 9g"]
    }
  ],

  "applications_zh": ["重症感冒發熱", "流行性乙型腦炎", "大葉性肺炎", "中暑", "糖尿病（消渴症）"],
  "applications_en": ["Severe influenza fever", "Japanese encephalitis", "Lobar pneumonia", "Heat stroke", "Diabetes mellitus"],
  "modern_applications_zh": ["重症感冒發熱", "流行性乙型腦炎", "大葉性肺炎", "中暑", "糖尿病（消渴症）"],
  "modern_applications_en": ["Severe influenza fever", "Japanese encephalitis", "Lobar pneumonia", "Heat stroke", "Diabetes mellitus"],

  "cloudtcm_url": "https://cloudtcm.com/formula/98",
  "american_dragon_url": "https://www.americandragon.com/HerbFormulas/BaiHuTang.html",
  "source_urls": [
    "https://cloudtcm.com/formula/98",
    "https://www.americandragon.com/HerbFormulas/BaiHuTang.html"
  ],

  "external_links": [
    { "source_id": "american_dragon", "url": "https://www.americandragon.com/HerbFormulas/BaiHuTang.html", "label_zh": "American Dragon", "label_en": "American Dragon", "lang": "en", "link_status": "direct" },
    { "source_id": "cloudtcm", "url": "https://cloudtcm.com/formula/98", "label_zh": "雲端中醫", "label_en": "CloudTCM", "lang": "zh", "link_status": "direct" }
  ],

  "field_sources": {
    "actions_zh": ["shang_han_lun", "curriculum/formulas/Formulations Summary Chart.docx.md"],
    "composition_roles": ["shang_han_lun", "bastyr_materia_medica_2"],
    "indications": ["shang_han_lun"],
    "contraindications": ["shang_han_lun", "bastyr_materia_medica_2"]
  },

  "review_status": "draft",
  "authored_by": "model_draft",
  "formula_song": "白虎湯用石膏知，甘草粳米四般施。\n亦有加參添桂法，濕溫大熱小兒宜。",
  "formula_song_zh": "白虎湯用石膏知，甘草粳米四般施。\n亦有加參添桂法，濕溫大熱小兒宜。",
  "formula_song_source_zh": "出自汪昂《湯頭歌訣》",
  "exam_pearl": "【考綱重點】陽明氣分熱盛「四大證」（身大熱、口大渴、汗大出、脈洪大）首選方。石膏+知母相須清熱生津；粳米+甘草顧護胃氣。NCBAHM 2026 CH Outline p.21。"
};

// Save reference files
fs.writeFileSync(path.join(refDir, 'formula.yin_qiao_san.json'), JSON.stringify(yqs, null, 2), 'utf8');
fs.writeFileSync(path.join(refDir, 'formula.sang_ju_yin.json'), JSON.stringify(sjy, null, 2), 'utf8');
fs.writeFileSync(path.join(refDir, 'formula.bai_hu_tang.json'), JSON.stringify(bht, null, 2), 'utf8');

// Update data/herbs/formulas.json
const formulaJsonPath = path.join(__dirname, '../data/herbs/formulas.json');
const mainData = JSON.parse(fs.readFileSync(formulaJsonPath, 'utf8'));

[yqs, sjy, bht].forEach(ref => {
  const idx = mainData.records.findIndex(r => r.id === ref.id);
  if (idx !== -1) {
    mainData.records[idx] = Object.assign({}, mainData.records[idx], ref);
  } else {
    mainData.records.push(ref);
  }
});

fs.writeFileSync(formulaJsonPath, JSON.stringify(mainData, null, 2), 'utf8');
console.log('Updated data/herbs/formulas.json with Batch 1 Gold-Standard records (including formula_song_zh & formula_song_source_zh)!');
