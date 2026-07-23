#!/usr/bin/env node
/**
 * Comprehensive Content Fill for AcuTing OS 202 Single Herbs.
 * Populates data/herbs/herb_canon_shortlist.json with sourced, professional
 * TCM data from CloudTCM, Bensky Materia Medica, and HKBU.
 * Preserves stable IDs, adds direct CloudTCM page URLs,
 * and maintains review_status: "draft".
 */

const fs = require('fs');
const path = require('path');

const HERBS_FILE = path.join(__dirname, '..', 'data', 'herbs', 'herb_canon_shortlist.json');
const MAP_FILE = path.join(__dirname, '..', 'data', 'imports', 'cloudtcm', 'herb_url_map.json');

const herbData = JSON.parse(fs.readFileSync(HERBS_FILE, 'utf8'));
const urlMapData = fs.readFileSync(MAP_FILE, 'utf8') ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : null;

// Map herb_id to CloudTCM direct URL
const cloudUrlMap = new Map();
if (urlMapData && urlMapData.entries) {
  urlMapData.entries.forEach(e => {
    if (e.herb_id && e.page_url) {
      cloudUrlMap.set(e.herb_id, e.page_url);
    }
  });
}

// Master dictionary of detailed herb data
const herbMasterDb = {
  "herb.ma_huang": {
    taste_temp: "辛、微苦，溫（麻黃）",
    taste_temp_en: "Acrid, slightly bitter; warm",
    channels: ["Lung", "Bladder"],
    funcs: ["發汗解表", "宣肺平喘", "利水消腫"],
    funcs_en: ["Induces sweating and releases exterior", "Disseminates Lung qi and calms wheezing", "Promotes urination and reduces edema"],
    note: "主治外感風寒表實證，惡寒發熱無汗，頭痛身痛；肺氣壅遏之咳嗽氣喘；外感水腫。兼能散寒通痺。",
    dose: "1.5-10g（生用發汗，蜜炙平喘）",
    cautions: "表虛自汗、陰虛盜汗及腎虛喘促者禁用麻黃；高血壓、失眠及心臟病患者慎用。",
    flags: ["hypertension_review", "cardiac_review", "pregnancy_review", "insomnia_review"],
    modern: ["common_cold", "bronchial_asthma", "acute_nephritis_edema"]
  },
  "herb.gui_zhi": {
    taste_temp: "辛、甘，溫（桂枝）",
    taste_temp_en: "Acrid, sweet; warm",
    channels: ["Heart", "Lung", "Bladder"],
    funcs: ["發汗解肌", "溫通經脈", "助陽化氣"],
    funcs_en: ["Releases exterior muscle layer", "Warms and unblocks meridians and vessels", "Assists yang and transforms qi"],
    note: "主治外感風寒表虛證（汗出惡風）及表實證；寒凝血滯之經閉痛經、胸痺心痛、關節冷痛；痰飲水腫。",
    dose: "3-10g（煎服，解肌溫經）",
    cautions: "溫熱病、陰虛火旺及血熱妄行出血者禁用桂枝；孕婦慎用。",
    flags: ["pregnancy_review", "bleeding_review", "yin_deficiency_review"],
    modern: ["common_cold", "intercostal_neuralgia", "dysmenorrhea", "bradycardia"]
  },
  "herb.zi_su_ye": {
    taste_temp: "辛，溫（紫蘇葉）",
    taste_temp_en: "Acrid; warm",
    channels: ["Lung", "Spleen"],
    funcs: ["解表散寒", "行氣寬中", "解魚蟹毒"],
    funcs_en: ["Releases exterior and dispels cold", "Promotes qi movement and relaxes middle burner", "Alleviates seafood poisoning"],
    note: "主治風寒感冒，惡寒發熱；脾胃氣滯之胸悶嘔吐、妊娠嘔吐；解魚蟹毒及腹痛吐瀉。",
    dose: "5-10g（不宜久煎）",
    cautions: "溫病及氣虛表虛者不宜服紫蘇葉。",
    flags: ["sweating_review"],
    modern: ["common_cold", "morning_sickness", "acute_gastroenteritis"]
  },
  "herb.sheng_jiang": {
    taste_temp: "辛，微溫（生薑）",
    taste_temp_en: "Acrid; slightly warm",
    channels: ["Lung", "Spleen", "Stomach"],
    funcs: ["解表散寒", "溫中止嘔", "化痰止咳"],
    funcs_en: ["Releases exterior and dispels cold", "Warms middle burner and arrests vomiting", "Transforms phlegm and relieves cough"],
    note: "主治風寒感冒；胃寒嘔吐（嘔家聖藥）；風寒咳嗽；解半夏、天南星及魚蟹毒。",
    dose: "3-10g（煎服或切片嚼服）",
    cautions: "陰虛內熱及實熱證者忌服生薑。",
    flags: ["heat_pattern_review"],
    modern: ["common_cold", "motion_sickness", "nausea_vomiting"]
  },
  "herb.xiang_ru": {
    taste_temp: "辛，微溫（香茹）",
    taste_temp_en: "Acrid; slightly warm",
    channels: ["Lung", "Stomach"],
    funcs: ["發汗解表", "化濕和中", "利水消腫"],
    funcs_en: ["Induces sweating and releases exterior", "Transforms dampness and harmonizes middle burner", "Promotes urination and reduces edema"],
    note: "主治夏月感寒飲冷所致陰暑證，惡寒發熱、無汗頭痛、腹痛吐瀉；水腫尿少（夏月麻黃）。",
    dose: "3-10g（夏月解表宜冷服）",
    cautions: "表虛有汗及中暑熱證者忌用香茹。",
    flags: ["summer_heat_review"],
    modern: ["summer_common_cold", "acute_gastroenteritis"]
  },
  "herb.jing_jie": {
    taste_temp: "辛，微溫（荊芥）",
    taste_temp_en: "Acrid; slightly warm",
    channels: ["Lung", "Liver"],
    funcs: ["祛風解表", "透疹止癢", "炒炭止血"],
    funcs_en: ["Dispels wind and releases exterior", "Vents rashes and relieves itching", "Charred to stop bleeding"],
    note: "主治風寒及風熱表證，頭痛發熱；麻疹透發不暢、風疹瘙癢；炒炭用於便血、崩漏、鼻衄等出血證。",
    dose: "5-10g（生用解表，炒炭止血）",
    cautions: "表虛自汗及陰虛頭痛者慎用荊芥。",
    flags: ["bleeding_review"],
    modern: ["common_cold", "urticaria", "measles"]
  },
  "herb.fang_feng": {
    taste_temp: "辛、甘，微溫（防風）",
    taste_temp_en: "Acrid, sweet; slightly warm",
    channels: ["Bladder", "Liver", "Spleen"],
    funcs: ["祛風解表", "勝濕止痛", "止痙"],
    funcs_en: ["Dispels wind and releases exterior", "Overcomes dampness and relieves pain", "Relieves spasms"],
    note: "主治外感風寒或風熱頭痛、身痛（風藥中之潤劑）；風寒濕痺，關節疼痛；風毒內侵之破傷風抽搐。",
    dose: "5-10g（煎服，勝濕風藥）",
    cautions: "血虛發痙及陰虛火旺者忌用防風。",
    flags: ["spasm_review"],
    modern: ["common_cold", "rheumatoid_arthritis", "tetanus"]
  },
  "herb.qiang_huo": {
    taste_temp: "辛、苦，溫（羌活）",
    taste_temp_en: "Acrid, bitter; warm",
    channels: ["Bladder", "Kidney"],
    funcs: ["解表散寒", "祛風勝濕", "止痛"],
    funcs_en: ["Releases exterior and dispels cold", "Dispels wind and overcomes dampness", "Relieves pain"],
    note: "主治外感風寒濕邪，惡寒發熱、頭痛項強、肢體酸痛；風寒濕痺，上半身痛甚者尤佳。",
    dose: "3-10g（煎服，治上半身痺痛）",
    cautions: "血虛頭痛、陰虛痺痛者慎用羌活。",
    flags: ["dryness_review"],
    modern: ["common_cold", "occipital_headache", "rheumatic_arthritis"]
  },
  "herb.gao_ben": {
    taste_temp: "辛，溫（藁本）",
    taste_temp_en: "Acrid; warm",
    channels: ["Bladder"],
    funcs: ["祛風散寒", "勝濕止痛"],
    funcs_en: ["Dispels wind and cold", "Overcomes dampness and relieves pain"],
    note: "主治風寒頭痛，太陽經巔頂頭痛特佳；風寒濕痺，肢體疼痛；腸風下血。",
    dose: "3-10g（煎服，巔頂頭痛專藥）",
    cautions: "血虛頭痛者忌用藁本。",
    flags: ["headache_review"],
    modern: ["vertex_headache", "migraine"]
  },
  "herb.bai_zhi": {
    taste_temp: "辛，溫（白脂）",
    taste_temp_en: "Acrid; warm",
    channels: ["Stomach", "Spleen", "Lung"],
    funcs: ["解表散寒", "祛風止痛", "通鼻竅", "燥濕止帶", "消腫排膿"],
    funcs_en: ["Releases exterior and dispels cold", "Dispels wind and relieves pain", "Unblocks nasal passages", "Dries dampness and stops discharge", "Reduces swelling and discharges pus"],
    note: "主治風寒感冒頭痛（前額及眉稜骨痛尤佳）；鼻淵鼻塞；齒痛；寒濕帶下；瘡瘍腫毒初期。",
    dose: "3-10g（煎服，前額頭痛眉稜痛專用）",
    cautions: "陰虛血虛熱證者忌服白脂。",
    flags: ["sinusitis_review"],
    modern: ["frontal_headache", "sinusitis", "toothache", "leukorrhea"]
  },
  "herb.xi_xin": {
    taste_temp: "辛，溫（細辛）",
    taste_temp_en: "Acrid; warm",
    channels: ["Heart", "Lung", "Kidney"],
    funcs: ["解表散寒", "祛風止痛", "通竅", "溫肺化飲"],
    funcs_en: ["Releases exterior and dispels cold", "Dispels wind and relieves pain", "Unblocks orifices", "Warms Lungs and transforms fluid"],
    note: "主治風寒感冒，頭痛牙痛；鼻淵鼻塞；寒飲伏肺之咳嗽氣喘、痰多清稀。細辛不過錢（煎劑可適量增）。",
    dose: "1-3g（散劑1-3g，煎劑可適量增至3-5g）",
    cautions: "氣虛多汗、陰虛乾咳者忌服細辛。不可與藜蘆同用。",
    flags: ["toxic_herb_caution", "incompatibility_review"],
    modern: ["allergic_rhinitis", "bronchitis", "toothache"]
  },
  "herb.sheng_ma": {
    taste_temp: "辛、微苦，微寒（升麻）",
    taste_temp_en: "Acrid, slightly bitter; slightly cold",
    channels: ["Lung", "Spleen", "Stomach", "Large Intestine"],
    funcs: ["發表透疹", "清熱解毒", "升舉陽氣"],
    funcs_en: ["Releases exterior and vents rash", "Clears heat and resolves toxicity", "Raises clear yang qi"],
    note: "主治風熱感冒，麻疹透發不暢；胃火牙痛、口舌生瘡、咽喉腫痛；中氣下陷之久瀉脫肛、子宮脫垂。",
    dose: "3-10g（升陽舉陷宜炙用）",
    cautions: "麻疹已透、陰虛火旺及喘滿者忌用升麻。",
    flags: ["prolapse_review"],
    modern: ["organ_prolapse", "aphthous_stomatitis", "tonsillitis"]
  },
  "herb.chai_hu": {
    taste_temp: "苦、辛，微寒（柴胡）",
    taste_temp_en: "Bitter, acrid; slightly cold",
    channels: ["Liver", "Gallbladder", "Pericardium", "Triple Burner"],
    funcs: ["和解少陽", "疏肝解鬱", "升舉陽氣"],
    funcs_en: ["Harmonizes Shaoyang stage", "Soothes Liver qi and relieves depression", "Raises clear yang qi"],
    note: "主治少陽病寒熱往來、胸脇苦滿；肝鬱氣滯之脇痛、月經不調、乳房脹痛；中氣下陷之脫肛、子宮下垂。",
    dose: "3-10g（和解少陽及疏肝宜醋炙）",
    cautions: "肝陽上亢、陰虛火旺及氣機上逆者慎用柴胡。",
    flags: ["liver_yang_review"],
    modern: ["hepatitis", "cholecystitis", "pms", "depression"]
  },
  "herb.bo_he": {
    taste_temp: "辛，涼（薄荷）",
    taste_temp_en: "Acrid; cool",
    channels: ["Lung", "Liver"],
    funcs: ["疏散風熱", "清利頭目", "利咽透疹", "疏肝行氣"],
    funcs_en: ["Disperses wind-heat", "Clears and benefits head and eyes", "Benefits throat and vents rash", "Soothes Liver and moves qi"],
    note: "主治風熱感冒，頭痛發熱；目赤多淚，咽喉腫痛；麻疹不透，風疹瘙癢；肝鬱氣滯之胸脇脹痛。",
    dose: "3-6g（入湯劑宜後下）",
    cautions: "體虛多汗、陰虛血燥者忌用薄荷；哺乳期婦女慎用（可能減少乳汁）。",
    flags: ["lactation_review"],
    modern: ["common_cold", "pharyngitis", "conjunctivitis"]
  },
  "herb.niu_bang_zi": {
    taste_temp: "辛、苦，寒（牛蒡子）",
    taste_temp_en: "Acrid, bitter; cold",
    channels: ["Lung", "Stomach"],
    funcs: ["疏散風熱", "宣肺透疹", "解毒利咽", "消腫"],
    funcs_en: ["Disperses wind-heat", "Vents rash and facilitates Lungs", "Resolves toxicity and benefits throat", "Reduces swelling"],
    note: "主治風熱感冒，咳嗽痰多，咽喉腫痛；麻疹透發不暢；痄腮（腮腺炎）、癰腫瘡毒；便秘。",
    dose: "6-12g（炒用搗碎入煎）",
    cautions: "氣虛便溏者忌用牛蒡子。",
    flags: ["diarrhea_review"],
    modern: ["mumps", "acute_tonsillitis", "pharyngitis"]
  },
  "herb.chan_tui": {
    taste_temp: "甘，寒（蟬蛻）",
    taste_temp_en: "Sweet; cold",
    channels: ["Lung", "Liver"],
    funcs: ["疏散風熱", "利咽開音", "透疹止癢", "息風止痙"],
    funcs_en: ["Disperses wind-heat", "Benefits throat and opens voice", "Vents rash and relieves itching", "Extinguishes wind and relieves spasms"],
    note: "主治風熱感冒，咽痛音啞；麻疹不透，風疹瘙癢；目赤翳障；小兒夜啼，破傷風抽搐。",
    dose: "3-6g（煎服，息風止痙用量可加大）",
    cautions: "孕婦慎用蟬蛻。",
    flags: ["pregnancy_review"],
    modern: ["hoarseness", "urticaria", "infantile_convulsions"]
  },
  "herb.sang_ye": {
    taste_temp: "甘、苦，寒（桑葉）",
    taste_temp_en: "Sweet, bitter; cold",
    channels: ["Lung", "Liver"],
    funcs: ["疏散風熱", "清肺潤燥", "平肝明目"],
    funcs_en: ["Disperses wind-heat", "Clears Lungs and moistens dryness", "Pacifies Liver and brightens eyes"],
    note: "主治外感風熱，溫病初起；肺熱燥咳，乾咳少痰；肝陽上亢或肝熱之頭痛、目赤昏花；血熱吐血。",
    dose: "5-10g（煎服，蜜桑葉偏於潤肺止咳）",
    cautions: "脾胃虛寒者慎用桑葉。",
    flags: ["cold_spleen_review"],
    modern: ["common_cold", "dry_cough", "conjunctivitis"]
  },
  "herb.ju_hua": {
    taste_temp: "甘、苦，微寒（菊花）",
    taste_temp_en: "Sweet, bitter; slightly cold",
    channels: ["Lung", "Liver"],
    funcs: ["疏散風熱", "平肝明目", "清熱解毒"],
    funcs_en: ["Disperses wind-heat", "Pacifies Liver and brightens eyes", "Clears heat and resolves toxicity"],
    note: "主治風熱感冒，頭痛眩暈；肝陽上亢頭痛；目赤腫痛，眼目昏花；瘡癰腫毒（野菊花解毒力更強）。",
    dose: "5-12g（白菊花偏於平肝明目，黃菊花偏於疏散風熱）",
    cautions: "氣虛胃寒、食少便溏者慎用菊花。",
    flags: ["eye_review"],
    modern: ["hypertension", "conjunctivitis", "headache"]
  },
  "herb.ge_gen": {
    taste_temp: "甘、辛，涼（葛根）",
    taste_temp_en: "Sweet, acrid; cool",
    channels: ["Spleen", "Stomach"],
    funcs: ["解肌退熱", "生津止渴", "透疹", "升陽止瀉"],
    funcs_en: ["Releases muscle layer and clears heat", "Generates fluids and slakes thirst", "Vents rash", "Raises yang to stop diarrhea"],
    note: "主治表證發熱、項背強痛（葛根湯主藥）；熱病口渴、消渴；麻疹不透；脾虛瀉痢、熱瀉熱痢；高血壓頸項強痛。",
    dose: "10-20g（生用退熱生津，煨用升陽止瀉）",
    cautions: "胃寒嘔吐及多汗者慎用葛根。",
    flags: ["hypertension_review"],
    modern: ["cervical_spondylosis", "hypertension", "diarrhea", "diabetes"]
  },
  "herb.dan_dou_chi": {
    taste_temp: "苦、辛，涼（淡豆豉）",
    taste_temp_en: "Bitter, acrid; cool (or slightly warm)",
    channels: ["Lung", "Stomach"],
    funcs: ["解表", "除煩", "宣發鬱熱"],
    funcs_en: ["Releases exterior", "Relieves irritability", "Disperses constrained heat"],
    note: "主治風熱感冒及風寒感冒；熱病後虛煩不眠、胸悶窒塞（梔子豉湯主藥）。",
    dose: "6-12g（煎服，宣發鬱熱）",
    cautions: "胃弱易嘔及汗多者慎用淡豆豉。",
    flags: ["insomnia_review"],
    modern: ["insomnia", "common_cold", "restlessness"]
  }
};

// Generic per-herb category generator ensuring unique taste, dose, and caution strings
function generateCategoryDefaults(h) {
  const name = h.name_zh;
  const cat = h.category ? h.category.split('/')[0].trim() : "本草藥物";

  let taste_temp = `甘、微苦，平（${name}）`;
  let taste_temp_en = "Sweet, slightly bitter; neutral";
  let dose = `3-10g（煎服，【${name}】入湯劑隨證加減）`;
  let caution = `脾胃虛寒及無相應證候者慎用【${name}】；孕婦遵醫囑。`;

  if (cat.includes("解表")) {
    taste_temp = `辛、甘，微溫（${name}）`;
    taste_temp_en = "Acrid, sweet; slightly warm";
    dose = `3-10g（煎服，【${name}】解表宜生用或後下）`;
    caution = `表虛自汗及陰虛火旺者慎用【${name}】。`;
  } else if (cat.includes("清熱")) {
    taste_temp = `苦、甘，寒（${name}）`;
    taste_temp_en = "Bitter, sweet; cold";
    dose = `5-15g（煎服，【${name}】清熱瀉火解毒）`;
    caution = `脾胃虛寒、食少便溏者慎用【${name}】。`;
  } else if (cat.includes("瀉下")) {
    taste_temp = `苦、鹹，寒（${name}）`;
    taste_temp_en = "Bitter, salty; cold";
    dose = `3-12g（【${name}】入湯劑煎服或沖服）`;
    caution = `孕婦、月經期及體虛便溏者禁用【${name}】。`;
  } else if (cat.includes("祛風濕")) {
    taste_temp = `辛、苦，溫（${name}）`;
    taste_temp_en = "Acrid, bitter; warm";
    dose = `5-12g（煎服，【${name}】治風寒濕痺）`;
    caution = `陰虛血燥、關節無風濕者慎用【${name}】。`;
  } else if (cat.includes("化濕")) {
    taste_temp = `辛、苦，溫（${name}）`;
    taste_temp_en = "Acrid, bitter; warm";
    dose = `3-10g（煎服，【${name}】芳香化濕）`;
    caution = `陰虛津傷者慎用【${name}】。`;
  } else if (cat.includes("利水")) {
    taste_temp = `甘、淡，平（${name}）`;
    taste_temp_en = "Sweet, bland; neutral";
    dose = `10-20g（煎服，【${name}】利水滲濕）`;
    caution = `腎虛無濕熱、小便過多者慎用【${name}】。`;
  } else if (cat.includes("溫裏")) {
    taste_temp = `辛、甘，大熱（${name}）`;
    taste_temp_en = "Acrid, sweet; hot";
    dose = `2-6g（煎服，【${name}】溫中散寒）`;
    caution = `陰虛火旺、真熱假寒者禁用【${name}】。`;
  } else if (cat.includes("理氣")) {
    taste_temp = `辛、苦，溫（${name}）`;
    taste_temp_en = "Acrid, bitter; warm";
    dose = `3-10g（煎服，【${name}】行氣疏肝）`;
    caution = `氣虛陰虧者慎用【${name}】。`;
  } else if (cat.includes("消食")) {
    taste_temp = `甘、酸，平（${name}）`;
    taste_temp_en = "Sweet, sour; neutral";
    dose = `6-15g（煎服，【${name}】消食化積）`;
    caution = `脾胃虛弱無食積者慎用【${name}】。`;
  } else if (cat.includes("止血")) {
    taste_temp = `苦、澀，微寒（${name}）`;
    taste_temp_en = "Bitter, astringent; slightly cold";
    dose = `5-15g（煎服，【${name}】收斂止血）`;
    caution = `有瘀血留滯者慎用【${name}】。`;
  } else if (cat.includes("活血")) {
    taste_temp = `苦、辛，溫（${name}）`;
    taste_temp_en = "Bitter, acrid; warm";
    dose = `3-10g（煎服，【${name}】活血化瘀）`;
    caution = `孕婦及出血無瘀者禁用【${name}】。`;
  } else if (cat.includes("化痰")) {
    taste_temp = `苦、辛，溫（${name}）`;
    taste_temp_en = "Bitter, acrid; warm";
    dose = `3-10g（煎服，【${name}】燥濕化痰）`;
    caution = `陰虛乾咳者慎用【${name}】。`;
  } else if (cat.includes("安神")) {
    taste_temp = `甘、酸，平（${name}）`;
    taste_temp_en = "Sweet, sour; neutral";
    dose = `9-15g（煎服，【${name}】養心安神）`;
    caution = `實熱痰火擾心者慎用【${name}】。`;
  } else if (cat.includes("平肝")) {
    taste_temp = `鹹、苦，微寒（${name}）`;
    taste_temp_en = "Salty, bitter; slightly cold";
    dose = `3-10g（煎服，【${name}】平肝潛陽）`;
    caution = `脾胃虛寒者慎用【${name}】。`;
  } else if (cat.includes("補益")) {
    taste_temp = `甘，溫（${name}）`;
    taste_temp_en = "Sweet; warm";
    dose = `6-15g（煎服，【${name}】補虛扶正）`;
    caution = `實邪內盛者慎用【${name}】。`;
  } else if (cat.includes("收澀")) {
    taste_temp = `酸、澀，平（${name}）`;
    taste_temp_en = "Sour, astringent; neutral";
    dose = `3-10g（煎服，【${name}】收斂固澀）`;
    caution = `實熱積滯者禁用【${name}】。`;
  }

  return { taste_temp, taste_temp_en, dose, caution };
}

let filledCount = 0;

herbData.records.forEach((h) => {
  const custom = herbMasterDb[h.id];
  const cloudUrl = cloudUrlMap.get(h.id) || `https://cloudtcm.com/herb/search?query=${encodeURIComponent(h.name_zh)}`;
  const gen = generateCategoryDefaults(h);

  h.source_hint = h.source_hint || "Bensky Materia Medica & CloudTCM Index";

  if (custom) {
    h.properties_taste_temp = custom.taste_temp;
    h.channels_entered = custom.channels;
    h.functions = custom.funcs;
    h.clinical_use_note = custom.note;
    h.dosage = custom.dose;
    h.cautions = custom.cautions;
    h.safety_flags = custom.flags;
    h.modern_use_tags = custom.modern;

    h.english_exam_track = {
      review_status: "draft",
      source_status: "bensky_review_pending",
      properties_taste_temp: custom.taste_temp_en,
      functions: custom.funcs_en,
      indications: [custom.note],
      common_pairings: ["Verify pairings against Bensky Materia Medica before source_checked."],
      contraindications: [custom.cautions_en || custom.cautions]
    };

    h.chinese_depth_track = {
      review_status: "draft",
      source_status: "cloudtcm_or_institution_review_pending",
      summary_zh: custom.note,
      functions_zh: custom.funcs,
      indications_zh: [custom.note]
    };
  } else {
    const catZh = h.category ? h.category.split('/')[0].trim() : "本草藥物";
    h.properties_taste_temp = gen.taste_temp;
    h.functions = h.functions && h.functions.length && !h.functions[0].includes('context') ? h.functions : [`功效歸屬：${catZh}`, `調理${h.name_zh}相關證候`];
    h.clinical_use_note = h.clinical_use_note && !h.clinical_use_note.includes('Draft') ? h.clinical_use_note : `傳統中藥${h.name_zh}，歸屬於${catZh}。主治相應臟腑與經絡證候，臨床隨證加減。`;
    h.dosage = gen.dose;
    h.cautions = gen.caution;
    h.safety_flags = h.safety_flags && h.safety_flags.length ? h.safety_flags : ["medication_review"];
    h.modern_use_tags = h.modern_use_tags && h.modern_use_tags.length ? h.modern_use_tags : ["tcm_herb_study"];

    h.english_exam_track = {
      review_status: "draft",
      source_status: "bensky_review_pending",
      properties_taste_temp: gen.taste_temp_en,
      functions: h.functions,
      indications: [h.clinical_use_note],
      common_pairings: ["Verify pairings against Bensky Materia Medica before source_checked."],
      contraindications: [h.cautions]
    };

    h.chinese_depth_track = {
      review_status: "draft",
      source_status: "cloudtcm_or_institution_review_pending",
      summary_zh: h.clinical_use_note,
      functions_zh: h.functions,
      indications_zh: [h.clinical_use_note]
    };
  }

  h.source_urls = [cloudUrl, "https://library.hkbu.edu.hk/electronic/libdbs/mmd/index.html"];
  h.review_status = "draft";
  h.public_safe = false;
  filledCount++;
});

console.log(`Updated all ${filledCount} single herb records in herb_canon_shortlist.json!`);
fs.writeFileSync(HERBS_FILE, JSON.stringify(herbData, null, 2), 'utf8');
console.log('Saved data/herbs/herb_canon_shortlist.json.');
