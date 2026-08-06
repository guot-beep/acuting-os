/**
 * scripts/build_gold_standard_formulas.js
 * Restores and synchronizes all 6 Gold-Standard formulas:
 * 1. 麻黃湯 (formula.ma_huang_tang)
 * 2. 桂枝湯 (formula.gui_zhi_tang)
 * 3. 銀翹散 (formula.yin_qiao_san)
 * 4. 桑菊飲 (formula.sang_ju_yin)
 * 5. 白虎湯 (formula.bai_hu_tang)
 * 6. 小青龍湯 (formula.xiao_qing_long_tang)
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

// 1. 麻黃湯
const mht = {
  "_reference_note": "REFERENCE IMPLEMENTATION for formula.ma_huang_tang matching template.",
  "id": "formula.ma_huang_tang",
  "name_zh": "麻黃湯",
  "name_en": "Ma Huang Tang",
  "name_en_translated": "Ephedra Decoction",
  "pinyin": "Ma Huang Tang",
  "pinyin_toned": "Má Huáng Tāng",
  "source_text_zh": "《傷寒論》",
  "source_text_en": "Shang Han Lun (Treatise on Cold Damage)",
  "category_zh": "解表劑－辛溫解表",
  "category_en": "Formulas that Release the Exterior - Warm, Acrid",
  "comparison_group": "解表劑 / Release Exterior",

  "glance": {
    "category_banner_zh": "解表散寒",
    "category_banner_en": "RELEASE EXTERIOR DISPEL COLD",
    "plain_summary_zh": "最常用於感冒或流感初期，惡寒重、無汗、全身痠痛時——身體需要一股強力把邪氣推出去的時候。",
    "plain_summary_en": "Most often used for the early stages of a cold or flu with strong chills, no sweating and aching muscles.",
    "plain_indications_zh": ["感冒初起", "無汗惡寒", "身痛", "氣喘"],
    "plain_indications_en": ["early cold or flu", "chills without sweating", "body aches", "wheezing"],
    "herb_count": 4
  },

  "composition": [
    {
      "herb_id": "herb.ma_huang",
      "herb_zh": "麻黃", "name_zh": "麻黃", "herb_en": "Ephedra", "name_en": "Ephedra", "pinyin": "Ma Huang", "pinyin_toned": "Má Huáng",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "發汗解表，宣肺平喘——本方的推動力",
      "in_formula_zh": "發汗解表，宣肺平喘——本方的推動力"
    },
    {
      "herb_id": "herb.gui_zhi",
      "herb_zh": "桂枝", "name_zh": "桂枝", "herb_en": "Cinnamon Twig", "name_en": "Cinnamon Twig", "pinyin": "Gui Zhi", "pinyin_toned": "Guì Zhī",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "溫通經脈、解肌發表，助麻黃透達營衛，發汗之力倍增",
      "in_formula_zh": "溫通經脈、解肌發表，助麻黃透達營衛，發汗之力倍增"
    },
    {
      "herb_id": "herb.xing_ren",
      "herb_zh": "杏仁", "name_zh": "杏仁", "herb_en": "Apricot Seed", "name_en": "Apricot Seed", "pinyin": "Xing Ren", "pinyin_toned": "Xìng Rén",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "降肺氣，止咳平喘——與麻黃一宣一降，恢復肺的宣降之常",
      "in_formula_zh": "降肺氣，止咳平喘——與麻黃一宣一降，恢復肺的宣降之常"
    },
    {
      "herb_id": "herb.zhi_gan_cao",
      "herb_zh": "炙甘草", "name_zh": "炙甘草", "herb_en": "Honey-fried Licorice", "name_en": "Honey-fried Licorice", "pinyin": "Zhi Gan Cao", "pinyin_toned": "Zhì Gān Cǎo",
      "dose_g": "3", "decoction_reference_g": "3g",
      "role_zh": "使", "role_en": "Envoy",
      "role_reason_zh": "調和諸藥，緩麻黃、桂枝之峻烈，防過汗傷正",
      "in_formula_zh": "調和諸藥，緩麻黃、桂枝之峻烈，防過汗傷正"
    }
  ],

  "key_pairs": ["pair.ma_huang__gui_zhi", "pair.ma_huang__xing_ren"],
  "key_pairs_note_zh": "麻黃配桂枝（相須）決定本方發汗解表的方向；麻黃配杏仁（相使）負責宣降平喘。",
  "key_pairs_note_en": "Ma Huang with Gui Zhi sets exterior-releasing direction; Ma Huang with Xing Ren handles diffusing-descending.",

  "fang_yi_zh": "本方為辛溫發汗之峻劑。麻黃開腠發汗、宣肺平喘為君；桂枝助其發汗、解肌溫經為臣；杏仁降氣止咳、與麻黃相配一宣一降為佐；炙甘草調和並緩其峻烈為使。",
  "fang_yi_en": "A forceful warm-acrid diaphoretic formula. Ma Huang opens pores and calms wheezing; Gui Zhi assists sweating and warms channels.",

  "actions_zh": ["發汗解表 — 宣透太陽經風寒邪氣", "宣肺平喘 — 宣通肺氣、止咳嗽平喘急", "溫通經脈 — 溫散寒邪、通利關節止痛"],
  "actions_en": ["Releases exterior by inducing sweating — vents Taiyang Wind-Cold", "Diffuses Lung qi and calms wheezing — restores Lung diffusing", "Warms channels and unblocks collateral pain — dispels cold for joint pain"],

  "pattern_indications_zh": ["風寒表實證（太陽傷寒）：惡寒重、發熱輕、無汗、頭痛、身疼腰痛、骨節疼痛、項強、或見喘、苔薄白、脈浮緊。"],
  "pattern_indications_en": ["Wind-Cold excess (Tai Yang cold damage): Strong chills, mild fever, anhidrosis, headache, body aches, joint pain, stiff neck, wheezing, thin white coating, floating tight pulse."],

  "indications": [
    {
      "pattern_zh": "風寒表實證（太陽傷寒）",
      "pattern_en": "Wind-Cold excess (Tai Yang cold damage)",
      "clinical_picture_zh": "惡寒重、發熱輕、無汗、頭痛、身疼腰痛、骨節疼痛、項強、或見喘",
      "clinical_picture_en": "Strong chills, mild fever, absence of sweating, headache, body aches, wheezing",
      "tongue_zh": "苔薄白", "tongue_en": "Thin white coating",
      "pulse_zh": "脈浮緊", "pulse_en": "Floating and tight"
    }
  ],

  "modifications_zh": [
    "喘甚者：加重杏仁用量，或加蘇子 9g、桑白皮 9g 降氣平喘",
    "兼裡熱、煩躁口渴者：加石膏 15g ➔ 即大青龍湯法",
    "痰多、胸悶者：加半夏 9g、陳皮 6g 化痰",
    "體虛、年老者：全方減量，麻黃改用麻黃絨"
  ],
  "modifications_en": [
    "Marked wheezing: Increase Xing Ren or add Su Zi 9g and Sang Bai Pi 9g",
    "With interior heat & restlessness: Add Shi Gao 15g (Da Qing Long Tang method)",
    "Copious phlegm & chest oppression: Add Ban Xia 9g and Chen Pi 6g",
    "Debilitated or elderly: Reduce doses, substitute Ma Huang Rong"
  ],

  "modifications": [
    { "if_zh": "喘甚", "if_en": "Marked wheezing", "change_zh": "加重杏仁用量，或加蘇子 9g、桑白皮 9g 降氣平喘", "change_en": "Increase Xing Ren, add Su Zi 9g" },
    { "if_zh": "兼裡熱、煩躁口渴", "if_en": "With interior heat", "change_zh": "加石膏 15g ➔ 即大青龍湯法", "change_en": "Add Shi Gao 15g" }
  ],

  "contraindications_zh": [
    "表虛自汗、陰虛盜汗者禁用",
    "瘡家、衄家、亡血家慎用（血汗同源，重劑不可發汗）",
    "嚴重心臟病、高血壓患者慎用",
    "孕婦慎用"
  ],
  "contraindications_en": [
    "Contraindicated in exterior deficiency with spontaneous sweating",
    "Contraindicated in yin deficiency and blood deficiency",
    "Contraindicated in pregnancy",
    "Contraindicated with hypertension or heart disease"
  ],

  "comparisons": [
    {
      "with": "formula.gui_zhi_tang", "name_zh": "桂枝湯",
      "differentiator_zh": "麻黃湯治表實無汗、脈浮緊；桂枝湯治表虛有汗、惡風、脈浮緩。",
      "differentiator_en": "Ma Huang Tang treats exterior EXCESS without sweating; Gui Zhi Tang treats exterior DEFICIENCY with sweating."
    }
  ],

  "formula_family": [
    {
      "formula_id": "formula.da_qing_long_tang",
      "name_zh": "大青龍湯",
      "relation": "加",
      "change": ["加石膏 15g、生薑 9g、大棗 4枚；倍麻黃"],
      "change_en": ["Add Shi Gao 15g, Sheng Jiang 9g, Da Zhao 4 pieces; double Ma Huang"]
    }
  ],

  "cloudtcm_url": "https://cloudtcm.com/formula/7",
  "american_dragon_url": "https://www.americandragon.com/HerbFormulas/MaHuangTang.html",
  "source_urls": [
    "https://cloudtcm.com/formula/7",
    "https://www.americandragon.com/HerbFormulas/MaHuangTang.html"
  ],
  "external_links": [
    { "source_id": "american_dragon", "url": "https://www.americandragon.com/HerbFormulas/MaHuangTang.html", "label_zh": "American Dragon", "label_en": "American Dragon", "lang": "en", "link_status": "direct" },
    { "source_id": "cloudtcm", "url": "https://cloudtcm.com/formula/7", "label_zh": "雲端中醫", "label_en": "CloudTCM", "lang": "zh", "link_status": "direct" }
  ],

  "field_sources": {
    "actions_zh": ["shang_han_lun", "curriculum/formulas/Formulations Summary Chart.docx.md"],
    "composition_roles": ["shang_han_lun"],
    "indications": ["shang_han_lun"],
    "contraindications": ["bastyr_materia_medica_2"]
  },

  "review_status": "draft",
  "authored_by": "model_draft",
  "formula_song": "麻黃湯中用桂枝，杏仁甘草四般施。\n發熱惡寒頭項痛，喘而無汗宜服之。",
  "formula_song_zh": "麻黃湯中用桂枝，杏仁甘草四般施。\n發熱惡寒頭項痛，喘而無汗宜服之。",
  "formula_song_source_zh": "出自汪昂《湯頭歌訣》",
  "exam_pearl": "【考綱重點】外感風寒表實證（惡寒重、無汗、身痛、脈浮緊）首選方。麻黃+桂枝發汗解表；麻黃+杏仁一宣一降平喘。NCBAHM 2026 CH Outline p.20。"
};

// 2. 桂枝湯
const gzt = {
  "_reference_note": "REFERENCE IMPLEMENTATION for formula.gui_zhi_tang matching template.",
  "id": "formula.gui_zhi_tang",
  "name_zh": "桂枝湯",
  "name_en": "Gui Zhi Tang",
  "name_en_translated": "Cinnamon Twig Decoction",
  "pinyin": "Gui Zhi Tang",
  "pinyin_toned": "Guì Zhī Tāng",
  "source_text_zh": "《傷寒論》",
  "source_text_en": "Shang Han Lun (Treatise on Cold Damage)",
  "category_zh": "解表劑－辛溫解表",
  "category_en": "Formulas that Release the Exterior - Warm, Acrid",
  "comparison_group": "解表劑 / Release Exterior",

  "glance": {
    "category_banner_zh": "解肌發表 調和營衛",
    "category_banner_en": "RELEASE MUSCLE HARMONIZE YING WEI",
    "plain_summary_zh": "外感風寒表虛證（汗出惡風）之祖方。解肌發表、調和營衛——萬方之祖。",
    "plain_summary_en": "The ancestor of all formulas for Wind-Cold exterior deficiency pattern with sweating.",
    "plain_indications_zh": ["外感風寒", "汗出惡風", "頭痛發熱", "苔薄白脈浮緩"],
    "plain_indications_en": ["wind-cold exterior", "sweating with aversion to wind", "headache and fever", "floating slow pulse"],
    "herb_count": 5
  },

  "composition": [
    {
      "herb_id": "herb.gui_zhi",
      "herb_zh": "桂枝", "name_zh": "桂枝", "herb_en": "Cinnamon Twig", "name_en": "Cinnamon Twig", "pinyin": "Gui Zhi", "pinyin_toned": "Guì Zhī",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "辛溫解肌發表，溫通衛陽",
      "in_formula_zh": "辛溫解肌發表，溫通衛陽"
    },
    {
      "herb_id": "herb.bai_shao",
      "herb_zh": "白芍", "name_zh": "白芍", "herb_en": "White Peony Root", "name_en": "White Peony Root", "pinyin": "Bai Shao", "pinyin_toned": "Bái Sháo",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "酸苦微寒，斂陰和營，益陰固表——與桂枝相須調和營衛",
      "in_formula_zh": "酸苦微寒，斂陰和營，益陰固表——與桂枝相須調和營衛"
    },
    {
      "herb_id": "herb.sheng_jiang",
      "herb_zh": "生薑", "name_zh": "生薑", "herb_en": "Fresh Ginger", "name_en": "Fresh Ginger", "pinyin": "Sheng Jiang", "pinyin_toned": "Shēng Jiāng",
      "dose_g": "9", "decoction_reference_g": "9g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "辛溫助桂枝解表，溫胃止嘔",
      "in_formula_zh": "辛溫助桂枝解表，溫胃止嘔"
    },
    {
      "herb_id": "herb.da_zhao",
      "herb_zh": "大棗", "name_zh": "大棗", "herb_en": "Jujube Date", "name_en": "Jujube Date", "pinyin": "Da Zhao", "pinyin_toned": "Dà Zǎo",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "甘溫益氣養血，助白芍和營",
      "in_formula_zh": "甘溫益氣養血，助白芍和營"
    },
    {
      "herb_id": "herb.zhi_gan_cao",
      "herb_zh": "炙甘草", "name_zh": "炙甘草", "herb_en": "Honey-fried Licorice", "name_en": "Honey-fried Licorice", "pinyin": "Zhi Gan Cao", "pinyin_toned": "Zhì Gān Cǎo",
      "dose_g": "6", "decoction_reference_g": "6g",
      "role_zh": "使", "role_en": "Envoy",
      "role_reason_zh": "甘平調和諸藥，合桂枝辛甘化陽，合白芍酸甘化陰",
      "in_formula_zh": "甘平調和諸藥，合桂枝辛甘化陽，合白芍酸甘化陰"
    }
  ],

  "key_pairs": ["pair.gui_zhi__bai_shao", "pair.sheng_jiang__da_zhao", "pair.shao_yao__gan_cao"],
  "key_pairs_note_zh": "桂枝配白芍（一發一收、調和營衛）；生薑配大棗（升降相因、調和脾胃）；芍藥配甘草（酸甘化陰、緩急止痛）。",
  "key_pairs_note_en": "Gui Zhi with Bai Shao (one disperses, one restrains for Ying-Wei harmony); Sheng Jiang with Da Zhao (harmonizes Spleen and Stomach); Shao Yao with Gan Cao (sour and sweet transform into Yin).",

  "fang_yi_zh": "《傷寒論》群方之首。桂枝辛溫透表解肌為君；白芍酸苦斂陰和營為臣；生薑助桂枝解表止嘔，大棗助白芍和營補中，二藥相配調和脾胃為佐；炙甘草調和諸藥，合桂枝辛甘化陽，合白芍酸甘化陰為使。全方散中有收，發汗而不傷陰。",
  "fang_yi_en": "The premier formula of Shang Han Lun. Gui Zhi disperses and releases muscle layer as chief; Bai Shao restrains yin and harmonizes ying as deputy.",

  "actions_zh": ["解肌發表 — 疏散太陽肌表風寒", "調和營衛 — 助衛陽而固營陰", "溫中和胃 — 溫脾胃、降逆氣止嘔"],
  "actions_en": ["Releases muscle layer and dispels exterior — vents Wind-Cold in muscle layer", "Harmonizes Ying and Wei levels — supports Wei yang while preserving Ying yin", "Warms middle burner and harmonizes stomach — warms Spleen/Stomach to descend rebellious qi"],

  "pattern_indications_zh": ["外感風寒表虛證（太陽中風）：發熱、惡風、汗出、頭痛、鼻鳴乾嘔、苔薄白、脈浮緩。"],
  "pattern_indications_en": ["Wind-Cold exterior deficiency (Tai Yang wind strike): Fever, aversion to wind, sweating, headache, dry retching, thin white coating, floating moderate/slow pulse."],

  "indications": [
    {
      "pattern_zh": "外感風寒表虛證（太陽中風）",
      "pattern_en": "Wind-Cold exterior deficiency (Tai Yang wind strike)",
      "clinical_picture_zh": "發熱、惡風、汗出、頭痛、鼻鳴乾嘔",
      "clinical_picture_en": "Fever, aversion to wind, sweating, headache, nasal congestion, dry retching",
      "tongue_zh": "苔薄白", "tongue_en": "Thin white coating",
      "pulse_zh": "脈浮緩", "pulse_en": "Floating and moderate/slow"
    }
  ],

  "modifications_zh": [
    "項背強幾幾者：加葛根 15g ➔ 即桂枝加葛根湯",
    "腹滿時痛者：倍白芍至 18g ➔ 即桂枝加芍藥湯",
    "喘甚者：加厚朴 9g、杏仁 9g ➔ 即桂枝加厚朴杏子湯"
  ],
  "modifications_en": [
    "Stiff neck and upper back: Add Ge Gen 15g (Gui Zhi Jia Ge Gen Tang)",
    "Abdominal fullness and pain: Double Bai Shao to 18g (Gui Zhi Jia Shao Yao Tang)",
    "Wheezing: Add Hou Po 9g and Xing Ren 9g (Gui Zhi Jia Hou Po Xing Zi Tang)"
  ],

  "modifications": [
    { "if_zh": "項背強幾幾者", "if_en": "Stiff neck and upper back", "change_zh": "加葛根 15g ➔ 即桂枝加葛根湯", "change_en": "Add Ge Gen 15g" },
    { "if_zh": "腹滿時痛者", "if_en": "Abdominal pain", "change_zh": "倍白芍至 18g ➔ 即桂枝加芍藥湯", "change_en": "Double Bai Shao to 18g" }
  ],

  "contraindications_zh": [
    "表實無汗、麻黃湯證者禁用",
    "溫病初起、風熱感冒（咽喉腫痛、發熱重）禁用",
    "內熱熾盛、酒客病者禁用"
  ],
  "contraindications_en": [
    "Contraindicated in exterior excess without sweating (Ma Huang Tang pattern)",
    "Contraindicated in Wind-Heat or early stage Warm Disease",
    "Contraindicated in alcoholics or interior heat excess"
  ],

  "comparisons": [
    {
      "with": "formula.ma_huang_tang", "name_zh": "麻黃湯",
      "differentiator_zh": "麻黃湯治表實無汗，重在發汗解表；桂枝湯治表虛有汗，重在解肌調和營衛。",
      "differentiator_en": "Ma Huang Tang treats exterior excess without sweating; Gui Zhi Tang treats exterior deficiency with sweating."
    }
  ],

  "formula_family": [
    {
      "formula_id": "formula.gui_zhi_jia_ge_gen_tang",
      "name_zh": "桂枝加葛根湯",
      "relation": "加",
      "change": ["加葛根 15g"],
      "change_en": ["Add Ge Gen 15g"]
    },
    {
      "formula_id": "formula.gui_zhi_jia_shao_yao_tang",
      "name_zh": "桂枝加芍藥湯",
      "relation": "倍",
      "change": ["倍白芍至 18g"],
      "change_en": ["Double Bai Shao to 18g"]
    }
  ],

  "cloudtcm_url": "https://cloudtcm.com/formula/8",
  "american_dragon_url": "https://www.americandragon.com/HerbFormulas/GuiZhiTang.html",
  "source_urls": [
    "https://cloudtcm.com/formula/8",
    "https://www.americandragon.com/HerbFormulas/GuiZhiTang.html"
  ],
  "external_links": [
    { "source_id": "american_dragon", "url": "https://www.americandragon.com/HerbFormulas/GuiZhiTang.html", "label_zh": "American Dragon", "label_en": "American Dragon", "lang": "en", "link_status": "direct" },
    { "source_id": "cloudtcm", "url": "https://cloudtcm.com/formula/8", "label_zh": "雲端中醫", "label_en": "CloudTCM", "lang": "zh", "link_status": "direct" }
  ],

  "field_sources": {
    "actions_zh": ["shang_han_lun", "curriculum/formulas/Formulations Summary Chart.docx.md"],
    "composition_roles": ["shang_han_lun"],
    "indications": ["shang_han_lun"],
    "contraindications": ["bastyr_materia_medica_2"]
  },

  "review_status": "draft",
  "authored_by": "model_draft",
  "formula_song": "桂枝湯治太陽風，芍藥甘草薑棗同。\n解肌發表調營衛，汗出惡風此方功。",
  "formula_song_zh": "桂枝湯治太陽風，芍藥甘草薑棗同。\n解肌發表調營衛，汗出惡風此方功。",
  "formula_song_source_zh": "出自汪昂《湯頭歌訣》",
  "exam_pearl": "【考綱重點】外感風寒表虛證（發熱、惡風、汗出、脈浮緩）萬方之祖。桂枝+白芍1:1調和營衛；生薑+大棗調和脾胃。服後「啜熱稀粥」助汗。NCBAHM 2026 CH Outline p.20。"
};

// Load batch 1 & Xiao Qing Long Tang generator scripts
require('./build_batch1_gold_formulas.js');
require('./build_xiao_qing_long_tang_gold.js');

// Now read formulas.json and ensure all 6 reference files exist and are synced
const formulaJsonPath = path.join(__dirname, '../data/herbs/formulas.json');
const mainData = JSON.parse(fs.readFileSync(formulaJsonPath, 'utf8'));

[mht, gzt].forEach(ref => {
  fs.writeFileSync(path.join(refDir, `${ref.id}.json`), JSON.stringify(ref, null, 2), 'utf8');
  const idx = mainData.records.findIndex(r => r.id === ref.id);
  if (idx !== -1) {
    mainData.records[idx] = Object.assign({}, mainData.records[idx], ref);
  } else {
    mainData.records.push(ref);
  }
});

fs.writeFileSync(formulaJsonPath, JSON.stringify(mainData, null, 2), 'utf8');
console.log('Successfully built and updated ALL 6 Gold-Standard formulas in formulas.json!');
