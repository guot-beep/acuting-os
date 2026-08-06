/**
 * scripts/build_gold_standard_formulas.js
 * Builds full Gold-Standard Reference Cards for Xiao Qing Long Tang & Gui Zhi Tang
 * matching formula.ma_huang_tang.json schema in data/herbs/reference/
 */

const fs = require('fs');
const path = require('path');

const refDir = path.join(__dirname, '../data/herbs/reference');
if (!fs.existsSync(refDir)) {
  fs.mkdirSync(refDir, { recursive: true });
}

// 1. Full Gold-Standard Xiao Qing Long Tang (小青龍湯)
const xql = {
  "_reference_note": "REFERENCE IMPLEMENTATION for formula.xiao_qing_long_tang matching formula.ma_huang_tang.json schema.",
  "id": "formula.xiao_qing_long_tang",
  "name_zh": "小青龍湯",
  "name_en": "Xiao Qing Long Tang",
  "name_en_translated": "Minor Blue-Green Dragon Decoction",
  "pinyin": "Xiao Qing Long Tang",
  "pinyin_toned": "Xiǎo Qīng Lóng Tāng",
  "source_text_zh": "《傷寒論》",
  "source_text_en": "Shang Han Lun (Treatise on Cold Damage)",
  "category_zh": "解表劑－辛溫解表 / 溫化水飲",
  "category_en": "Formulas that Release the Exterior - Warm, Acrid & Transform Fluids",

  "glance": {
    "category_banner_zh": "解表溫飲",
    "category_banner_en": "RELEASE EXTERIOR & WARM FLUIDS",
    "plain_summary_zh": "外感風寒、內停水飲（表寒裏飲）之名方。惡寒發熱、無汗、咳嗽喘急、吐痰清稀量多如水——散外寒、溫內飲兩全。",
    "plain_summary_en": "Premier classic formula for exterior Wind-Cold with interior thin fluid retention. Features chills, fever, coughing and wheezing with copious watery white phlegm.",
    "plain_indications_zh": ["外感風寒", "內停水飲", "咳嗽氣喘", "痰多清稀如水"],
    "plain_indications_en": ["exterior wind-cold", "interior fluid retention", "cough & wheezing", "copious watery phlegm"],
    "herb_count": 8
  },

  "composition": [
    {
      "herb_id": "herb.ma_huang",
      "name_zh": "麻黃", "name_en": "Ephedra", "pinyin_toned": "Má Huáng",
      "dose_g": "9",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "發汗解表，宣肺平喘——相須發揮解表主力",
      "role_reason_en": "Promotes sweating, releases exterior, diffuses Lungs and calms wheezing - chief diaphoretic force"
    },
    {
      "herb_id": "herb.gui_zhi",
      "name_zh": "桂枝", "name_en": "Cinnamon Twig", "pinyin_toned": "Guì Zhī",
      "dose_g": "9",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "助麻黃解表散寒、溫通經脈；化氣行水——與麻黃共為君",
      "role_reason_en": "Assists Ma Huang in releasing exterior cold and warming channels; transforms qi and moves water"
    },
    {
      "herb_id": "herb.gan_jiang",
      "name_zh": "乾薑", "name_en": "Dried Ginger", "pinyin_toned": "Gān Jiāng",
      "dose_g": "9",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "溫脾肺之陽，化內停之水飲——溫肺化飲金三角",
      "role_reason_en": "Warms Spleen and Lung yang to transform retained thin fluids - key component of fluid-warming trio"
    },
    {
      "herb_id": "herb.xi_xin",
      "name_zh": "細辛", "name_en": "Asarum / Manchurian Wild Ginger", "pinyin_toned": "Xì Xīn",
      "dose_g": "6",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "溫肺化飲、通竅止痛——助乾薑散內伏之水飲",
      "role_reason_en": "Warms Lungs, transforms fluid retention and unblocks orifices - helps Gan Jiang dispel deep fluids"
    },
    {
      "herb_id": "herb.ban_xia",
      "name_zh": "半夏", "name_en": "Pinellia Rhizome", "pinyin_toned": "Bàn Xià",
      "dose_g": "9",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "燥濕化痰，降逆和胃——降肺胃之逆氣以止嘔降逆",
      "role_reason_en": "Dries dampness, transforms phlegm, directs rebellious qi downward to stop retching"
    },
    {
      "herb_id": "herb.wubwei_zi",
      "name_zh": "五味子", "name_en": "Schisandra Fruit", "pinyin_toned": "Wǔ Wèi Zǐ",
      "dose_g": "6",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "斂肺氣、止咳嗽——與麻、辛相配，收散結合，防耗散肺氣",
      "role_reason_en": "Astringes Lung qi and stops cough - pairs with Ma Huang and Xi Xin to prevent over-dispersal of Lung qi"
    },
    {
      "herb_id": "herb.bai_shao",
      "name_zh": "白芍", "name_en": "White Peony Root", "pinyin_toned": "Bái Sháo",
      "dose_g": "9",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "和營斂陰、緩急止痛——養血斂陰，防大發其汗傷營陰",
      "role_reason_en": "Harmonizes ying, restrains yin - prevents profuse sweating from damaging blood and ying fluids"
    },
    {
      "herb_id": "herb.zhi_gan_cao",
      "name_zh": "炙甘草", "name_en": "Honey-fried Licorice", "pinyin_toned": "Zhì Gān Cǎo",
      "dose_g": "6",
      "role_zh": "使", "role_en": "Envoy",
      "role_reason_zh": "益氣和中，調和諸藥——緩和辛燥峻烈之性",
      "role_reason_en": "Tonifies qi, harmonizes middle burner and moderates acrid harshness of the formula"
    }
  ],

  "key_pairs": [
    "pair.ma_huang__gui_zhi",
    "pair.xi_xin__gan_jiang__wu_wei_zi",
    "pair.gui_zhi__bai_shao"
  ],
  "key_pairs_note_zh": "細辛、乾薑、五味子為溫肺化飲止咳之金三角藥對（乾薑溫脾肺，細辛溫化水飲，五味子收斂肺氣，開合相濟）。麻黃配桂枝發汗解表，白芍配甘草和營護陰。",
  "key_pairs_note_en": "Xi Xin, Gan Jiang, and Wu Wei Zi form the classic trio for warming the lungs and transforming fluids. Ma Huang with Gui Zhi handles diaphoretic exterior release, while Bai Shao with Gan Cao protects ying and fluids.",

  "fang_yi_zh": "本方為外寒內飲之名方。麻黃、桂枝相須為君，發汗解表、宣肺散寒；細辛、乾薑、半夏為臣，細辛溫肺化飲，乾薑溫中化痰，半夏燥濕降逆；白芍、五味子為佐，白芍和營斂陰，五味子斂肺止咳，與麻、桂、薑、辛相配，動靜相制，散中有收，發汗而不傷正，宣肺而不耗氣；炙甘草為使，調和諸藥。",
  "fang_yi_en": "A classic formula for exterior cold with interior fluid retention. Ma Huang and Gui Zhi serve as chief herbs to release exterior cold and diffuse the Lungs. Xi Xin, Gan Jiang, and Ban Xia serve as deputy herbs to warm the Lungs and transform phlegm-fluid. Bai Shao and Wu Wei Zi act as assistants to restrain yin and preserve Lung qi.",

  "actions_zh": ["解表散寒", "溫肺化飲"],
  "actions_en": ["Releases the exterior and dispels cold", "Warms the Lungs and transforms thin fluid retention"],

  "indications": [
    {
      "pattern_zh": "外寒內飲證（表寒裏飲）",
      "pattern_en": "Exterior Wind-Cold with interior thin fluid retention",
      "clinical_picture_zh": "惡寒發熱，無汗，咳嗽喘急，痰多稀白量多，胸痞，或乾嘔，或嘔吐，身體重痛，苔白滑，脈浮緊",
      "clinical_picture_en": "Chills, fever, absence of sweating, coughing and wheezing with copious thin white phlegm, chest fullness, dry retching, body aches",
      "tongue_zh": "苔白滑",
      "tongue_en": "White slippery coating",
      "pulse_zh": "脈浮緊",
      "pulse_en": "Floating and tight"
    }
  ],

  "constitutional_types_zh": ["陰虛火旺", "血虛", "熱性氣喘"],
  "constitutional_types_en": ["Yin deficiency with fire", "Blood deficiency", "Heat asthma"],
  "constitutional_note_zh": "本方辛溫燥烈，陰虛乾咳無痰或肺熱咳喘者禁服。",
  "constitutional_note_en": "Acrid and warm; contraindicated for dry cough from Yin deficiency or Lung Heat asthma.",

  "modifications": [
    {
      "if_zh": "水飲內停兼有表鬱化熱、煩躁者",
      "if_en": "With interior fluid retention turning into heat with restlessness",
      "change_zh": "加石膏——即小青龍加石膏湯",
      "change_en": "Add Shi Gao (forms Xiao Qing Long Jia Shi Gao Tang)"
    },
    {
      "if_zh": "喉中水雞聲、氣喘甚者",
      "if_en": "With severe wheezing and throat stridor",
      "change_zh": "加射干、冬花、紫菀",
      "change_en": "Add She Gan, Kuan Dong Hua, and Zi Wan"
    },
    {
      "if_zh": "水腫、小便不利者",
      "if_en": "With edema and dysuria",
      "change_zh": "加茯苓、澤瀉",
      "change_en": "Add Fu Ling and Ze Xie"
    }
  ],

  "dose_adjustment_note_zh": "水煎時間不宜過長（< 20分鐘），先煎麻黃去上沫。服藥後避風寒，忌生冷黏滑食物。",
  "dose_adjustment_note_en": "Decoct no longer than 20 minutes; skim foam from Ma Huang first. Cover warmly after taking.",

  "contraindications_zh": [
    "陰虛乾咳無痰者禁用",
    "肺熱咳喘、吐黃稠痰者禁用",
    "嚴重心臟病、高血壓患者慎用",
    "孕婦慎用"
  ],
  "contraindications_en": [
    "Contraindicated in dry cough from Yin deficiency without phlegm",
    "Contraindicated in Lung Heat cough with thick yellow phlegm",
    "Use with caution in severe heart disease or hypertension",
    "Use with caution in pregnancy"
  ],

  "comparisons": [
    {
      "with": "formula.ma_huang_tang",
      "name_zh": "麻黃湯",
      "differentiator_zh": "麻黃湯純治外寒表實證，無內飲；小青龍湯治外寒兼內飲，伴有咳嗽喘急、痰稀白量多。",
      "differentiator_en": "Ma Huang Tang treats pure exterior cold excess without interior fluids; Xiao Qing Long Tang treats exterior cold WITH interior thin fluid retention."
    },
    {
      "with": "formula.ling_gan_wu_wei_jiang_xin_tang",
      "name_zh": "苓甘五味薑辛湯",
      "differentiator_zh": "苓甘五味薑辛湯無麻黃、桂枝，純治內飲咳喘，無外寒表證。",
      "differentiator_en": "Ling Gan Wu Wei Jiang Xin Tang treats interior fluid retention without exterior symptoms, omitting Ma Huang and Gui Zhi."
    }
  ],

  "modern_applications_zh": ["過敏性鼻炎", "支氣管氣喘", "慢性支氣管炎", "肺氣腫", "肺源性心臟病"],
  "modern_applications_en": ["Allergic rhinitis", "Bronchial asthma", "Chronic bronchitis", "Emphysema", "Cor pulmonale"],
  "modern_application_condition_ids": ["cond.asthma", "cond.copd"],

  "external_links": [
    { "source_id": "american_dragon", "url": "https://www.americandragon.com/HerbFormulas/XiaoQingLongTang.html", "label_zh": "American Dragon", "label_en": "American Dragon", "lang": "en", "link_status": "direct" },
    { "source_id": "cloudtcm", "url": "https://cloudtcm.com/formula/41", "label_zh": "雲端中醫", "label_en": "CloudTCM", "lang": "zh", "link_status": "direct" }
  ],

  "field_sources": {
    "composition_roles": ["bastyr_materia_medica_2", "classical_formula_doctrine"],
    "indications": ["bastyr_materia_medica_2", "shang_han_lun"],
    "contraindications": ["bastyr_materia_medica_2"],
    "fang_yi": ["classical_formula_doctrine"],
    "modifications": ["shang_han_lun"]
  },

  "review_status": "draft",
  "authored_by": "model_draft",
  "formula_song": "小青龍湯細辛麻，桂芍乾薑半夏加。\n五味甘草同煎服，外寒內飲喘咳差。",
  "exam_pearl": "【考綱重點】外感風寒、內停水飲證（表寒裏飲）首選方。麻黃、桂枝發汗解表；乾薑、細辛溫肺化飲；五味子收斂肺氣防耗散；半夏降逆化痰。NCBAHM 2026 CH Outline p.20。"
};

// 2. Write to data/herbs/reference/formula.xiao_qing_long_tang.json
const xqlPath = path.join(refDir, 'formula.xiao_qing_long_tang.json');
fs.writeFileSync(xqlPath, JSON.stringify(xql, null, 2), 'utf8');
console.log(`Saved Gold-Standard reference file for Xiao Qing Long Tang to ${xqlPath}`);

// 3. Full Gold-Standard Gui Zhi Tang (桂枝湯)
const gzt = {
  "_reference_note": "REFERENCE IMPLEMENTATION for formula.gui_zhi_tang matching formula.ma_huang_tang.json schema.",
  "id": "formula.gui_zhi_tang",
  "name_zh": "桂枝湯",
  "name_en": "Gui Zhi Tang",
  "name_en_translated": "Cinnamon Twig Decoction",
  "pinyin": "Gui Zhi Tang",
  "pinyin_toned": "Guì Zhī Tāng",
  "source_text_zh": "《傷寒論》",
  "source_text_en": "Shang Han Lun (Treatise on Cold Damage)",
  "category_zh": "解表劑－辛溫解表 / 調和營衛",
  "category_en": "Formulas that Release the Exterior - Warm, Acrid & Harmonize Ying and Wei",

  "glance": {
    "category_banner_zh": "解表調和",
    "category_banner_en": "RELEASE EXTERIOR & HARMONIZE",
    "plain_summary_zh": "《傷寒論》第一方。外感風寒表虛證之首選方——頭痛、發熱、惡風、汗出。調和營衛、解肌發表。",
    "plain_summary_en": "The premier formula of Shang Han Lun. Primary formula for Wind-Cold exterior deficiency with sweating, fever, aversion to wind, and stiff neck.",
    "plain_indications_zh": ["外感風寒表虛", "頭痛發熱", "汗出惡風", "營衛不和"],
    "plain_indications_en": ["exterior wind-cold deficiency", "headache & fever", "sweating with aversion to wind", "ying and wei disharmony"],
    "herb_count": 5
  },

  "composition": [
    {
      "herb_id": "herb.gui_zhi",
      "name_zh": "桂枝", "name_en": "Cinnamon Twig", "pinyin_toned": "Guì Zhī",
      "dose_g": "9",
      "role_zh": "君", "role_en": "Chief",
      "role_reason_zh": "辛溫解肌發表、溫通衛陽——透達表邪",
      "role_reason_en": "Acrid and warm to release muscle layer and warm Wei yang - driving out exterior pathogens"
    },
    {
      "herb_id": "herb.bai_shao",
      "name_zh": "白芍", "name_en": "White Peony Root", "pinyin_toned": "Bái Sháo",
      "dose_g": "9",
      "role_zh": "臣", "role_en": "Deputy",
      "role_reason_zh": "酸苦微寒、酸甘化陰、和營斂陰——與桂枝相須為用，一發一斂、調和營衛",
      "role_reason_en": "Sour, bitter, slightly cold; restrains ying and nourishes blood - pairs 1:1 with Gui Zhi to balance sweating and astringence"
    },
    {
      "herb_id": "herb.sheng_jiang",
      "name_zh": "生薑", "name_en": "Fresh Ginger", "pinyin_toned": "Shēng Jiāng",
      "dose_g": "9",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "辛溫解表、溫胃止嘔——助桂枝解肌，兼和胃氣",
      "role_reason_en": "Assists Gui Zhi in releasing exterior, warms Stomach to stop nausea"
    },
    {
      "herb_id": "herb.da_zao",
      "name_zh": "大棗", "name_en": "Jujube / Red Date", "pinyin_toned": "Dà Zǎo",
      "dose_g": "12",
      "role_zh": "佐", "role_en": "Assistant",
      "role_reason_zh": "甘溫益氣、補脾養血——助白芍和營，兼補中州",
      "role_reason_en": "Sweet and warm to tonify qi and blood - assists Bai Shao in nourishing ying and middle burner"
    },
    {
      "herb_id": "herb.zhi_gan_cao",
      "name_zh": "炙甘草", "name_en": "Honey-fried Licorice", "pinyin_toned": "Zhì Gān Cǎo",
      "dose_g": "6",
      "role_zh": "使", "role_en": "Envoy",
      "role_reason_zh": "甘溫調和諸藥——合桂枝辛甘化陽，合白芍酸甘化陰",
      "role_reason_en": "Harmonizes all herbs; combines with Gui Zhi for acrid-sweet yang, combines with Bai Shao for sour-sweet yin"
    }
  ],

  "key_pairs": [
    "pair.gui_zhi__bai_shao",
    "pair.sheng_jiang__da_zao",
    "pair.gui_zhi__gan_cao"
  ],
  "key_pairs_note_zh": "桂枝配白芍 (1:1) 為調和營衛之祖劑（桂枝發衛陽，白芍斂營陰，一開一合）。生薑配大棗調和脾胃氣血。桂枝配甘草辛甘化陽。",
  "key_pairs_note_en": "Gui Zhi with Bai Shao (1:1 ratio) is the ancestor pair for harmonizing Ying and Wei (Gui Zhi opens Wei yang, Bai Shao restrains Ying yin). Sheng Jiang with Da Zao harmonizes Spleen and Stomach.",

  "fang_yi_zh": "本方為調和營衛、解肌發表之祖方。桂枝辛溫解肌發表為君；白芍酸寒和營斂陰為臣；桂芍等量配伍，一散一收、一開一合，使表邪去而營衛和；生薑辛溫助桂枝解表，大棗甘溫助白芍和營，共為佐；炙甘草調和諸藥為使，合桂枝辛甘化陽，合白芍酸甘化陰。五味配伍精當，發汗而不傷陰，斂陰而不留邪。",
  "fang_yi_en": "Ancestor formula for harmonizing Ying and Wei and releasing the muscle layer. Gui Zhi releases the muscle layer as chief; Bai Shao restrains yin as deputy. Equal amounts of Gui Zhi and Bai Shao balance dispersal and astringence, clearing exterior pathogens while harmonizing Ying and Wei.",

  "actions_zh": ["解肌發表", "調和營衛"],
  "actions_en": ["Releases muscle layer and exterior", "Harmonizes Ying and Wei"],

  "indications": [
    {
      "pattern_zh": "外感風寒表虛證（太陽中風）",
      "pattern_en": "Wind-Cold exterior deficiency (Tai Yang Wind Strike)",
      "clinical_picture_zh": "頭痛、發熱、惡風、汗出、鼻鳴乾嘔、苔薄白、脈浮緩",
      "clinical_picture_en": "Headache, fever, aversion to wind, sweating, nasal congestion, dry retching",
      "tongue_zh": "苔薄白",
      "tongue_en": "Thin white coating",
      "pulse_zh": "脈浮緩",
      "pulse_en": "Floating and moderate"
    }
  ],

  "constitutional_types_zh": ["表實無汗", "濕熱內盛"],
  "constitutional_note_zh": "表實無汗脈緊者（麻黃湯證）或濕熱內盛者禁用。",

  "modifications": [
    {
      "if_zh": "兼喘者",
      "if_en": "With wheezing",
      "change_zh": "加厚朴、杏仁——即桂枝加厚朴杏子湯",
      "change_en": "Add Hou Po and Xing Ren (forms Gui Zhi Jia Hou Po Xing Zi Tang)"
    },
    {
      "if_zh": "項背強几几者",
      "if_en": "With stiff neck and upper back",
      "change_zh": "加葛根——即桂枝加葛根湯",
      "change_en": "Add Ge Gen (forms Gui Zhi Jia Ge Gen Tang)"
    },
    {
      "if_zh": "體虛汗多甚者",
      "if_en": "With severe sweating in weak patients",
      "change_zh": "加黃耆、白朮——益氣固表",
      "change_en": "Add Huang Qi and Bai Zhu"
    }
  ],

  "dose_adjustment_note_zh": "服後啜熱稀粥一升以助藥力，溫覆取微似汗，不可令大汗淋漓。",
  "dose_adjustment_note_en": "Drink warm thin rice porridge after taking to assist formula strength; cover warmly for slight sweating.",

  "contraindications_zh": [
    "表實無汗者禁用（誤用致表邪難解）",
    "溫病初起、熱病汗出者禁用",
    "酒客（濕熱內盛者）禁用"
  ],
  "contraindications_en": [
    "Contraindicated in exterior excess without sweating",
    "Contraindicated in warm-disease onset",
    "Contraindicated in heavy drinkers with damp-heat"
  ],

  "comparisons": [
    {
      "with": "formula.ma_huang_tang",
      "name_zh": "麻黃湯",
      "differentiator_zh": "麻黃湯治表實無汗、脈浮緊；桂枝湯治表虛有汗、惡風、脈浮緩。",
      "differentiator_en": "Ma Huang Tang treats exterior excess without sweating; Gui Zhi Tang treats exterior deficiency WITH sweating."
    }
  ],

  "modern_applications_zh": ["感冒", "流行性感冒", "過敏性鼻炎", "蕁麻疹", "原因不明低熱"],
  "modern_applications_en": ["Common cold", "Influenza", "Allergic rhinitis", "Urticaria", "Unexplained low-grade fever"],

  "external_links": [
    { "source_id": "cloudtcm", "url": "https://cloudtcm.com/formula/1", "label_zh": "雲端中醫", "label_en": "CloudTCM", "lang": "zh", "link_status": "direct" }
  ],

  "field_sources": {
    "composition_roles": ["shang_han_lun", "classical_formula_doctrine"],
    "indications": ["shang_han_lun"],
    "contraindications": ["shang_han_lun"]
  },

  "review_status": "draft",
  "authored_by": "model_draft",
  "formula_song": "桂枝湯用主太陽，芍藥甘草薑棗當。\n解肌發表調營衛，中風自汗正宜嘗。",
  "exam_pearl": "【考綱重點】太陽中風表虛證首選方。桂枝配白芍 1:1 調和營衛；生薑大衛調和脾胃。服後需啜熱稀粥助藥力。NCBAHM 2026 CH Outline p.19。"
};

// 4. Write to data/herbs/reference/formula.gui_zhi_tang.json
const gztPath = path.join(refDir, 'formula.gui_zhi_tang.json');
fs.writeFileSync(gztPath, JSON.stringify(gzt, null, 2), 'utf8');
console.log(`Saved Gold-Standard reference file for Gui Zhi Tang to ${gztPath}`);

// 5. Also update data/herbs/formulas.json records for these formulas so knowledge_data.js includes full data!
const formulaJsonPath = path.join(__dirname, '../data/herbs/formulas.json');
const mainData = JSON.parse(fs.readFileSync(formulaJsonPath, 'utf8'));

// Update xql and gzt in mainData.records
const idxXql = mainData.records.findIndex(r => r.id === 'formula.xiao_qing_long_tang');
if (idxXql !== -1) mainData.records[idxXql] = Object.assign({}, mainData.records[idxXql], xql);

const idxGzt = mainData.records.findIndex(r => r.id === 'formula.gui_zhi_tang');
if (idxGzt !== -1) mainData.records[idxGzt] = Object.assign({}, mainData.records[idxGzt], gzt);

const idxMht = mainData.records.findIndex(r => r.id === 'formula.ma_huang_tang');
if (idxMht !== -1) {
  const mhtRef = JSON.parse(fs.readFileSync(path.join(refDir, 'formula.ma_huang_tang.json'), 'utf8'));
  mainData.records[idxMht] = Object.assign({}, mainData.records[idxMht], mhtRef);
}

fs.writeFileSync(formulaJsonPath, JSON.stringify(mainData, null, 2), 'utf8');
console.log(`Updated data/herbs/formulas.json with full Gold-Standard records!`);
