#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FORMULA_URL = "https://cloudtcm.com/formula";
const DISEASE_URL = "https://cloudtcm.com/disease/tcm";

const DISEASE_EN = {
  "疼痛症狀": "Pain Symptoms",
  "全身及四肢": "General and Limb Symptoms",
  "眼科專屬": "Eye-specific Symptoms",
  "頭面(眼耳)症狀": "Head and Face (Eye and Ear) Symptoms",
  "現代疾病": "Modern Medical Conditions",
  "飲食腸胃": "Dietary and Gastrointestinal Symptoms",
  "頭面(鼻口喉)症狀": "Head and Face (Nose, Mouth, and Throat) Symptoms",
  "女性特屬症狀": "Female-specific Symptoms",
  "胸部及呼吸": "Chest and Respiratory Symptoms",
  "皮膚症狀": "Skin Symptoms",
  "男性特屬症狀": "Male-specific Symptoms",
  "大小便症狀": "Urinary and Bowel Symptoms",
  "精神狀態": "Mental and Emotional Symptoms",
  "背部腰部狀態": "Back and Lumbar Symptoms"
};

const FUNCTION_EN = {
  "辛溫解表":"Release the Exterior with Acrid-Warm", "辛涼解表":"Release the Exterior with Acrid-Cool", "扶正解表":"Support the Upright Qi and Release the Exterior",
  "寒下":"Cold Purgation", "溫下":"Warm Purgation", "潤下":"Moisten the Intestines and Purge", "攻補兼施":"Combine Purgation and Tonification", "逐水":"Drive Out Water",
  "和解少陽":"Harmonize the Shaoyang", "調和肝脾":"Harmonize the Liver and Spleen", "健脾胃":"Strengthen the Spleen and Stomach", "治瘧":"Address Malarial Disorders",
  "清氣分熱":"Clear Heat from the Qi Level", "清熱涼血":"Clear Heat and Cool the Blood", "清熱解毒":"Clear Heat and Resolve Toxicity", "清臟腑熱":"Clear Heat from the Zang-Fu Organs",
  "祛暑解表":"Clear Summerheat and Release the Exterior", "祛暑利濕":"Clear Summerheat and Promote Urination", "清暑益氣":"Clear Summerheat and Augment Qi",
  "溫裡":"Warm the Interior", "回陽救逆":"Restore Yang and Rescue from Reversal", "溫經散寒":"Warm the Channels and Disperse Cold",
  "補氣":"Tonify Qi", "補血":"Tonify Blood", "活血祛瘀":"Invigorate Blood and Dispel Stasis", "氣血雙補":"Tonify Qi and Blood",
  "固澀收斂":"Stabilize, Bind, and Astringe", "固崩止帶":"Secure Uterine Bleeding and Stop Discharge", "固表止汗":"Secure the Exterior and Stop Sweating", "澀腸固脫":"Astringe the Intestines and Prevent Prolapse",
  "養心安神":"Nourish the Heart and Calm the Spirit", "重鎮安神":"Settle and Calm the Spirit with Heavy Substances", "開竅":"Open the Orifices",
  "理氣行氣":"Regulate and Move Qi", "降氣":"Direct Qi Downward", "理血":"Regulate Blood", "止血":"Stop Bleeding",
  "疏散外風":"Disperse External Wind", "平息內風":"Extinguish Internal Wind", "化濕和胃":"Transform Dampness and Harmonize the Stomach", "清熱燥濕":"Clear Heat and Dry Dampness",
  "利水滲濕":"Promote Urination and Leach Dampness", "溫化水濕":"Warm and Transform Water-Dampness", "潤燥化痰":"Moisten Dryness and Transform Phlegm", "燥濕化痰":"Dry Dampness and Transform Phlegm",
  "治風化痰":"Dispel Wind and Transform Phlegm", "清熱化痰":"Clear Heat and Transform Phlegm", "消食化滯":"Reduce Food Stagnation", "驅蟲":"Expel Parasites",
  "涌吐":"Induce Vomiting", "消導化積":"Reduce Accumulation and Guide Out Stagnation", "軟堅":"Soften Hardness", "生肌":"Generate Flesh", "清熱":"Clear Heat",
  "解表溫裡":"Release the Exterior and Warm the Interior", "滋陰潤燥":"Nourish Yin and Moisten Dryness", "通經絡":"Unblock the Channels and Collaterals", "調經":"Regulate Menstruation",
  "消補兼施":"Combine Reduction and Tonification", "鎮靜":"Settle and Calm", "通便":"Unblock the Bowels", "氣血兩清":"Clear Heat from the Qi and Blood Levels", "止癢":"Relieve Itching",
  "老人病":"Geriatric Conditions", "傷寒感冒":"Cold Damage and Common Cold", "皮膚病":"Skin Disorders", "解酒毒":"Resolve Alcohol Toxicity", "破血":"Break Up Blood Stasis",
  "和解":"Harmonize", "散結":"Dissipate Nodules", "補益":"Tonify and Supplement", "補中益氣":"Tonify the Middle and Augment Qi", "補腎":"Tonify the Kidneys", "生津止渴":"Generate Fluids and Relieve Thirst",
  "瀉火":"Drain Fire", "抗癌":"Cancer-related Support (Source Category)", "安神":"Calm the Spirit", "解表攻裡":"Release the Exterior and Purge the Interior", "理氣":"Regulate Qi",
  "澀精止遺":"Secure Essence and Stop Leakage", "斂瘡":"Astringe Sores", "清宣外燥":"Clear and Disperse External Dryness", "安胎":"Calm the Fetus", "清熱利尿":"Clear Heat and Promote Urination",
  "耳病":"Ear Disorders", "養陰清熱":"Nourish Yin and Clear Heat", "產病":"Childbirth-related Disorders", "清肝明目":"Clear the Liver and Brighten the Eyes", "消食":"Reduce Food Stagnation",
  "祛風勝濕":"Dispel Wind and Overcome Dampness", "跌打損傷":"Traumatic Injuries", "接骨":"Support Bone Union", "散寒去寒":"Disperse Cold", "強筋骨":"Strengthen the Sinews and Bones",
  "祛濕":"Dispel Dampness", "解痛":"Relieve Pain", "瀉下":"Purge Downward", "燥濕和胃":"Dry Dampness and Harmonize the Stomach", "止瀉":"Stop Diarrhea",
  "通經":"Promote Menstruation", "散血":"Disperse Blood Stasis", "治燥":"Treat Dryness", "平喘":"Calm Wheezing", "消痔":"Address Hemorrhoids", "明目":"Brighten the Eyes",
  "鎮咳":"Suppress Cough", "止帶":"Stop Vaginal Discharge", "陰陽雙補":"Tonify Yin and Yang", "解表清裡":"Release the Exterior and Clear the Interior", "消痞":"Dissipate Focal Distention",
  "止疝":"Address Hernial Disorders", "平肝息風":"Calm the Liver and Extinguish Wind", "解痙":"Relieve Spasm", "清肺熱":"Clear Lung Heat", "消翳":"Dispel Eye Opacity",
  "解表":"Release the Exterior", "補益肝腎":"Tonify the Liver and Kidneys", "祛暑清熱":"Clear Summerheat and Heat", "去邪":"Expel Pathogenic Factors", "除煩":"Relieve Restlessness",
  "溫陽":"Warm Yang", "喉痹":"Throat Obstruction", "止渴":"Relieve Thirst", "祛暑":"Clear Summerheat", "牙病":"Dental Disorders", "表裡雙解":"Release the Exterior and Interior",
  "養生":"Health Preservation", "透疹":"Vent Rashes", "蛇蟲咬傷":"Snake and Insect Bites", "消腫毒":"Reduce Swelling and Toxicity", "治風":"Treat Wind Disorders",
  "祛痰":"Transform Phlegm", "化癰疽":"Resolve Abscesses and Deep Sores", "化解瘟疫":"Resolve Epidemic Pathogens", "排膿":"Discharge Pus", "開胃":"Improve Appetite", "固澀":"Stabilize and Bind"
};

function parseArgs(argv) {
  const result = {};
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i].startsWith("--")) result[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
  }
  return result;
}

function nextData(html, label) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`Missing __NEXT_DATA__ in ${label}`);
  return JSON.parse(match[1]).props.pageProps.pageData;
}

async function readSource(file, url) {
  if (file) return fs.readFileSync(path.resolve(file), "utf8");
  const response = await fetch(url, { headers: { "user-agent": "AcuTingOS-source-index/1.0" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

function numericId(route) {
  const values = String(route).match(/\d+/g);
  if (!values?.length) throw new Error(`No numeric id in route: ${route}`);
  // CloudTCM list routes end in /<taxonomy-id>/0; the trailing zero is a
  // page index, not the stable taxonomy id.
  return Number(values[0]);
}

function writeJson(relativePath, value) {
  const output = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  console.log(`Wrote ${relativePath}`);
}

async function main() {
  const args = parseArgs(process.argv);
  const formula = nextData(await readSource(args["formula-html"], FORMULA_URL), "formula page");
  const disease = nextData(await readSource(args["disease-html"], DISEASE_URL), "disease page");
  const functions = formula.pageDataList_1 || [];
  const indications = formula.pageDataList_2 || [];
  const diseaseCategories = disease.symptomCategoryTags || [];

  if (functions.length !== 139 || indications.length !== 2473 || diseaseCategories.length !== 14) {
    throw new Error(`Source counts changed: disease=${diseaseCategories.length}, functions=${functions.length}, indications=${indications.length}`);
  }
  const untranslatedFunctions = functions.filter((item) => !FUNCTION_EN[item.title]);
  const untranslatedDisease = diseaseCategories.filter((item) => !DISEASE_EN[item.TagName]);
  if (untranslatedFunctions.length || untranslatedDisease.length) {
    throw new Error(`Missing curated translations: disease=${untranslatedDisease.length}, functions=${untranslatedFunctions.length}`);
  }

  const common = {
    source_name: "CloudTCM / 雲端中醫",
    review_status: "draft",
    source_tier: "B",
    source_snapshot_date: new Date().toISOString().slice(0, 10),
    medical_claim_policy: "Source taxonomy labels only; a tag is not evidence of efficacy, diagnosis, or treatment equivalence."
  };
  writeJson("data/pathology/cloudtcm_disease_categories.json", {
    dataset: "CloudTCM bilingual disease browse categories",
    ...common,
    source_url: DISEASE_URL,
    count: diseaseCategories.length,
    records: diseaseCategories.map((item) => ({
      id: `cloudtcm.disease_category.${item.TagID}`,
      source_id: item.TagID,
      name_zh: item.TagName,
      name_en: DISEASE_EN[item.TagName],
      source_url: DISEASE_URL,
      translation_status: "curated_draft"
    }))
  });
  writeJson("data/herbs/cloudtcm_formula_function_tags.json", {
    dataset: "CloudTCM bilingual formula function tags",
    ...common,
    source_url: FORMULA_URL,
    count: functions.length,
    records: functions.map((item) => {
      const id = numericId(item.route);
      return {
        id: `cloudtcm.formula_function.${id}`,
        source_id: id,
        name_zh: item.title,
        name_en: FUNCTION_EN[item.title],
        source_url: new URL(item.route, "https://cloudtcm.com").href,
        translation_status: "curated_draft"
      };
    })
  });
  writeJson("data/herbs/cloudtcm_formula_indication_tags.json", {
    dataset: "CloudTCM formula indication tag translation queue",
    ...common,
    source_url: FORMULA_URL,
    count: indications.length,
    bilingual_complete: 0,
    translation_policy: "Chinese source canon is complete. name_en remains null until medically appropriate English is reviewed; never substitute pinyin or an unreviewed machine translation.",
    records: indications.map((item) => {
      const id = numericId(item.route);
      return {
        id: `cloudtcm.formula_indication.${id}`,
        source_id: id,
        name_zh: item.title,
        name_en: null,
        source_url: new URL(item.route, "https://cloudtcm.com").href,
        translation_status: "pending_professional_translation"
      };
    })
  });
  console.log(`PASS: disease=${diseaseCategories.length}, functions=${functions.length}, indications=${indications.length}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
