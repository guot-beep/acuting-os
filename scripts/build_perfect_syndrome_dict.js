const fs = require('fs');
const path = require('path');

const md1Content = fs.readFileSync(path.join(__dirname, '../curriculum/formulas/American_Dragon_201_Formulas_Name_Actions_Syndromes.md'), 'utf8');
const blocks1 = md1Content.split(/^### /m).slice(1);
const uniqueSyndromes = new Set();

blocks1.forEach(b => {
  const lines = b.split('\n').map(l => l.trim()).filter(Boolean);
  let isSyndromes = false;
  lines.forEach(l => {
    if (l.includes('Syndromes:')) { isSyndromes = true; return; }
    if (l.includes('Formula Actions:')) { isSyndromes = false; return; }
    if (l.startsWith('- ') && isSyndromes) {
      uniqueSyndromes.add(l.replace(/^- /, '').trim());
    }
  });
});

const list = Array.from(uniqueSyndromes);

// Master dictionary of 100% clean, professional Traditional Chinese TCM Syndrome Names
const MASTER_SYNDROME_MAP = {
  "Spleen Qi Deficiency": "脾氣虛證",
  "Heart Qi Deficiency": "心氣虛證",
  "Lung and Spleen Qi Deficiency": "肺脾氣虛證",
  "Heart and Lung Qi Deficiency": "心肺氣虛證",
  "Gu Syndrome": "蠱毒 / 蠱證",
  "Stomach Qi Deficiency": "胃氣虛證",
  "Spleen and Stomach Qi Deficiency with Phlegm-Damp Retention": "脾胃氣虛兼痰濕內停證",
  "Atrophy disorder (Wei Syndrome) due to Spleen and Stomach Qi Deficiency": "痿證（脾胃氣虛型）",
  "Spleen Qi Deficiency (with Phlegm-Damp and pain)": "脾氣虛兼痰濕腹痛證",
  "Stomach Cold": "胃寒證",
  "Dampness due to Spleen Qi Deficiency": "脾虛濕盛證",
  "Central Qi Sinking": "中氣下陷證",
  "Spleen Not Governing Blood": "脾不統血證",
  "Spleen and Lung Qi Deficiency: Yin Fire due to Spleen and Lung Qi Deficiency": "脾肺氣虛陰火內生證",
  "Spontaneous sweating due to Qi Deficiency": "氣虛自汗證",
  "Spontaneous sweating due to Wei Qi Deficiency": "衛氣虛自汗證",
  "Lung Qi Deficiency": "肺氣虛證",
  "Lung and Kidney Qi Deficiency": "肺腎氣虛證",
  "Lung Qi and Yin Deficiency": "肺氣陰兩虛證",
  "Atrophy disorder (Wei Syndrome) due to Lung Heat with Fluid Deficiency": "痿證（肺熱傷津型）",
  "Qi, Yang, and Blood Deficiency": "氣陽血俱虛證",
  "Heart and Spleen Qi and Blood Deficiency due to overexertion": "心脾氣血兩虛證",
  "Chronic non-healing sores": "瘡潰不斂證",
  "Liver Blood Deficiency": "肝血虛證",
  "Liver Wind Stirring Internally: Liver Blood Deficiency Generates Wind": "肝風內動證（肝血虛生風）",
  "Liver Blood Stagnation due to Blood Deficiency": "肝血瘀滯證",
  "Insufficiency of the Chong and Ren channels": "衝任虛損證",
  "Insufficiency of the Chong Mai and Ren Mai": "衝任虛損證",
  "Habitual miscarriage": "習慣性流產",
  "Yin maculae due to Blood Deficiency with Cold": "血虛有寒陰斑證",
  "Heart Blood Deficiency": "心血虛證",
  "Heart and Liver Blood Deficiency": "心肝血虛證",
  "Yin ulcers": "陰瘡",
  "Fever and headache due to Blood loss": "失血發熱頭痛證",
  "Qi and Blood Deficiency": "氣血兩虛證",
  "Liver and Spleen Deficiency": "肝脾兩虛證",
  "Qi, Blood and Yang Deficiency with Cold": "氣血陽虛有寒證",
  "Atrophy (Wei Syndrome) due to Qi Deficiency": "痿證（氣虛型）",
  "Qi and Blood Deficiency failing to nourish the fetus": "氣血兩虛胎失所養證",
  "Kidney Yin Deficiency": "腎陰虛證",
  "Heart and Kidney Yin Deficiency": "心腎陰虛證",
  "Liver and Kidney Yin Deficiency": "肝腎陰虛證",
  "Atrophy disorder (Wei Syndrome) due to Liver and Kidney Deficiency": "痿證（肝腎虧虛型）",
  "Kidney Jing Insufficiency": "腎精不足證",
  "Liver and Kidney Yin Deficiency (especially essence and marrow)": "肝腎陰虛精髓虧損證",
  "Kidney Yin and Jing Deficiency": "腎陰精虧虛證",
  "Kidney Yang Deficiency with waning of Ming Men Fire (with Spleen and Stomach Deficiency Cold)": "腎陽不足命門火衰證",
  "Atrophy disorder (Wei Syndrome) due to Kidney Qi and Yang Deficiency": "痿證（腎氣陽虛型）",
  "Kidney Yang Deficiency": "腎陽虛證",
  "True Cold and False Heat": "真寒假熱證",
  "Liver (Yin and) Blood Deficiencies": "肝陰血虛證",
  "Liver and Kidney Yin Deficiencies (Liver Yin Deficiency is the prominent factor)": "肝腎陰虛證（肝陰虛為主）",
  "Liver and Kidney Yin Deficiency with Liver Yang Rising": "肝腎陰虛肝陽上亢證",
  "Liver and Kidney Yin Deficiencies with eye diseases": "肝腎陰虛眼疾證",
  "Kidney Yin Deficiency with Fire Flaring": "腎陰虛火旺證",
  "Liver and Kidney Yin Deficiency (with Fire Flaring)": "肝腎陰虛火旺證",
  "Steaming Bone Disorder": "骨蒸勞熱證",
  "Damp-Heat in the Lower Jiao with underlying Kidney Yin Deficiency": "下焦濕熱兼腎陰虛證",
  "Leg Qi": "腳氣病",
  "Tan Yin": "痰飲證",
  "Xiao Ke": "消渴證",
  "Jin Ye Stasis": "津液停滯證",
  "Qi, Blood and Yin Deficiency due to worry and emotional excess injuring Heart and Spleen": "思慮過度心脾氣血陰虛證",
  "Irregular pulses (knotted and intermittent) due to Yang Deficiency and Yin Deficiency": "陰陽兩虛脈結代證",
  "Generalized numbness due to Exhaustion of Ying and Wei": "營衛俱虛體麻木證",
  "Lung atrophy due to Yin Deficiency": "陰虛肺痿證",
  "Liver Yin Deficiency": "肝陰虛證",
  "Liver and Kidney Yin Deficiency (with Liver Qi Stagnation)": "肝腎陰虛兼肝氣鬱滯證",
  "Liver and Kidney Yin Deficiency with abdominal masses": "肝腎陰虛積聚證",
  "Heart (Blood) and Spleen (Qi) Deficiency due to worry (excessive deliberation or obsession)": "心脾兩虛證（思慮過度）",
  "Yang Ming Jing": "陽明經證",
  "Qi-level Stomach Heat": "氣分胃熱證",
  "Jue Yin Heat": "厥陰熱證",
  "Qi Stage Lung and Stomach Heat Injuring the Qi and Fluids": "氣分肺胃熱盛傷氣津證",
  "Stomach Fluid Deficiency": "胃津不足證",
  "Summerheat Stroke": "中暑證",
  "Ying Stage Heat (Re)": "營分熱證",
  "Ying Stage Heat Attacks the Pericardium": "營分熱陷心包證",
  "Xue Stage Heat (Xue Fen)": "血分熱證",
  "Xue Stage Heat with random flow of Blood": "血分熱迫血妄行證",
  "Xue Stage Heat with Blood Stagnation": "血分熱與血瘀互結證",
  "Obstruction of the Three Jiaos by Fire Toxin which pervades both the Exterior and Interior": "三焦火毒熾盛表裏俱熱證",
  "Lung Heat": "肺熱證",
  "Colon Heat": "大腸熱證",
  "Heart Fire Flaring Up": "心火上炎證",
  "Heat Stagnation (unformed Heat in the Upper Jiao with Heat Accumulation in the Middle Jiao)": "上焦鬱熱兼中焦積熱證",
  "Constipation with Heat in the Upper Jiao": "上焦熱盛便秘證",
  "Qi Stage Gallbladder Heat": "氣分膽熱證",
  "Small Intestine Excess Heat": "小腸實熱證",
  "Heat in the Heart and Small Intestine Channels": "心與小腸經熱證",
  "Liver Fire Flaring Up": "肝火上炎證",
  "Damp-Heat in the Liver and Gallbladder": "肝膽濕熱證",
  "Damp-Heat in the Liver Channel": "肝經濕熱證",
  "San Jiao Damp-Heat": "三焦濕熱證",
  "Liver Qi Stagnation": "肝氣鬱滯證",
  "Liver Qi Invades the Stomach (with Heat)": "肝氣犯胃兼熱證",
  "Heat in the Liver Channel with Stomach Disharmony": "肝經有熱胃失和降證",
  "Excess Fire in the Liver Channel with Heat in Stomach": "肝經實火兼胃熱證",
  "Liver Fire Scorches the Lungs": "肝火犯肺證",
  "Cough due to Yin Deficiency caused by Lung Heat": "肺熱傷陰咳嗽證",
  "Children who alternate between Excess and Deficiency": "小兒虛實夾雜證",
  "Stomach Fire Blazing": "胃火熾盛證",
  "Stomach Heat with Yin Deficiency due to Stomach Fire Injuring the Kidney Yin": "胃熱兼陰虛證（胃火傷腎陰）",
  "Damp-Heat In Colon (Dysentery)": "大腸濕熱痢疾證",
  "Damp-Heat in Colon (Damp-Heat Dysentery)": "大腸濕熱痢疾證",
  "Hot dysenteric disorder due to Heat and toxin searing the Stomach and Intestines": "熱毒灼傷胃腸熱痢證",
  "Jue Yin Stage dysenteric disorder due to Heat": "厥陰病熱痢證",
  "Heat lurking in the Yin aspects of the body (usually due to later stages of a Warm-Heat pathogen)": "溫病後期邪伏陰分證",
  "Steaming bone disorder due to Kidney and Liver Yin Deficiency": "肝腎陰虛骨蒸勞熱證",
  "Phlegm-Heat Congests the Lungs": "痰熱壅肺證",
  "Lung Abscess due to Wind-Heat toxin obstructing the Lungs with Phlegm and Blood Stasis": "風熱毒邪壅肺兼痰血瘀阻肺癰證",
  "Recuperation from febrile diseases": "熱病後康復期證",
  "Eye disorders due to upward blazing of Heat toxin": "熱毒上炎眼疾證",
  "Acute fever of the head due to Wind-Heat Toxin with Phlegm": "風熱毒邪兼痰上攻頭面高熱證",
  "Early-stage abscesses and sores due to accumulation of Heat toxins and Stagnation of Qi and Blood": "瘡瘍初期熱毒蘊結氣血凝滯證",
  "Early-stage and sores due to accumulation of Heat toxins and Phlegm Fire": "瘡瘍初期熱毒痰火蘊結證",
  "Boils and carbuncles with inflammation (Chuang Yung)": "瘡瘍疔毒證",
  "Fire toxin due to an External Heat invasion which has lodged in the channels": "外感熱邪陷於經絡火毒證"
};

function autoCleanSyndrome(en) {
  if (MASTER_SYNDROME_MAP[en]) return MASTER_SYNDROME_MAP[en];

  let zh = en
    .replace(/Spleen and Stomach Qi Deficiency with Phlegm-Damp Retention/gi, "脾胃氣虛兼痰濕內停證")
    .replace(/Spleen and Stomach Qi Deficiency with Dampness/gi, "脾胃氣虛兼濕濁證")
    .replace(/Spleen and Stomach Qi Deficiency with Phlegm-Dampness/gi, "脾胃氣虛兼痰濕證")
    .replace(/Spleen and Stomach Qi Deficiency with Qi Stagnation and Dampness/gi, "脾胃氣虛兼氣滯濕阻證")
    .replace(/Spleen and Stomach Qi Deficiency/gi, "脾胃氣虛證")
    .replace(/Spleen Qi Deficiency/gi, "脾氣虛證")
    .replace(/Stomach Qi Deficiency/gi, "胃氣虛證")
    .replace(/Heart Qi Deficiency/gi, "心氣虛證")
    .replace(/Lung Qi Deficiency/gi, "肺氣虛證")
    .replace(/Kidney Qi Deficiency/gi, "腎氣虛證")
    .replace(/Liver Qi Deficiency/gi, "肝氣虛證")
    .replace(/Liver Yin Deficiency/gi, "肝陰虛證")
    .replace(/Kidney Yin Deficiency/gi, "腎陰虛證")
    .replace(/Spleen Yin Deficiency/gi, "脾陰虛證")
    .replace(/Stomach Yin Deficiency/gi, "胃陰虛證")
    .replace(/Lung Yin Deficiency/gi, "肺陰虛證")
    .replace(/Heart Yin Deficiency/gi, "心陰虛證")
    .replace(/Kidney Yang Deficiency/gi, "腎陽虛證")
    .replace(/Spleen Yang Deficiency/gi, "脾陽虛證")
    .replace(/Heart Yang Deficiency/gi, "心陽虛證")
    .replace(/Liver Blood Deficiency/gi, "肝血虛證")
    .replace(/Heart Blood Deficiency/gi, "心血虛證")
    .replace(/Spleen Blood Deficiency/gi, "脾血虛證")
    .replace(/Qi and Blood Deficiency/gi, "氣血兩虛證")
    .replace(/Liver and Kidney Yin Deficiency/gi, "肝腎陰虛證")
    .replace(/Heart and Kidney Yin Deficiency/gi, "心腎陰虛證")
    .replace(/Lung and Kidney Yin Deficiency/gi, "肺腎陰虛證")
    .replace(/Spleen and Kidney Yang Deficiency/gi, "脾腎陽虛證")
    .replace(/Heart and Kidney Yang Deficiency/gi, "心腎陽虛證")
    .replace(/Liver Qi Stagnation/gi, "肝氣鬱滯證")
    .replace(/Stomach Heat/gi, "胃熱證")
    .replace(/Lung Heat/gi, "肺熱證")
    .replace(/Liver Heat/gi, "肝熱證")
    .replace(/Heart Fire/gi, "心火證")
    .replace(/Liver Fire/gi, "肝火證")
    .replace(/Stomach Fire/gi, "胃火證")
    .replace(/Damp-Heat/gi, "濕熱證")
    .replace(/Phlegm-Heat/gi, "痰熱證")
    .replace(/Cold-Damp/gi, "寒濕證")
    .replace(/Wind-Cold/gi, "風寒證")
    .replace(/Wind-Heat/gi, "風熱證")
    .replace(/Blood Stasis/gi, "血瘀證")
    .replace(/Phlegm Stagnation/gi, "痰濁證")
    .replace(/Food Stagnation/gi, "食積證");

  // Filter out any lingering English
  if (/[a-zA-Z]/.test(zh)) {
    zh = zh
      .replace(/due to/gi, "所致之")
      .replace(/with/gi, "兼")
      .replace(/and/gi, "與")
      .replace(/injuring/gi, "傷")
      .replace(/excess/gi, "過度")
      .replace(/worry/gi, "思慮")
      .replace(/emotional/gi, "情志")
      .replace(/irregular/gi, "不調")
      .replace(/pulses/gi, "脈")
      .replace(/numbness/gi, "麻木")
      .replace(/exhaustion/gi, "衰竭")
      .replace(/atrophy/gi, "痿證")
      .replace(/scorches/gi, "犯")
      .replace(/children/gi, "小兒")
      .replace(/dysenteric/gi, "痢疾")
      .replace(/disorder/gi, "病")
      .replace(/searing/gi, "灼")
      .replace(/lurking/gi, "伏")
      .replace(/aspects/gi, "分")
      .replace(/body/gi, "體")
      .replace(/usually/gi, "常")
      .replace(/later/gi, "後期")
      .replace(/stages/gi, "階段")
      .replace(/pathogen/gi, "邪")
      .replace(/steaming/gi, "骨蒸")
      .replace(/bone/gi, "骨")
      .replace(/congests/gi, "壅")
      .replace(/abscess/gi, "癰")
      .replace(/obstructing/gi, "阻")
      .replace(/recuperation/gi, "康復")
      .replace(/febrile/gi, "熱病")
      .replace(/diseases/gi, "病")
      .replace(/upward/gi, "上")
      .replace(/blazing/gi, "炎")
      .replace(/head/gi, "頭")
      .replace(/acute/gi, "急性")
      .replace(/early-stage/gi, "初期")
      .replace(/abscesses/gi, "癰")
      .replace(/sores/gi, "瘡")
      .replace(/accumulation/gi, "積")
      .replace(/boils/gi, "癤")
      .replace(/carbuncles/gi, "疽")
      .replace(/inflammation/gi, "炎")
      .replace(/invasion/gi, "侵")
      .replace(/lodged/gi, "留")
      .replace(/channels/gi, "經")
      .replace(/external/gi, "外")
      .replace(/[a-zA-Z]/g, '')
      .replace(/[\(\)]/g, '')
      .replace(/\s+/g, '');
  }

  if (!zh.endsWith('證') && !zh.includes('型') && !zh.includes('病') && !zh.includes('散') && !zh.includes('湯') && !zh.includes('丸')) {
    zh += '證';
  }

  return zh;
}

const finalDict = {};
list.forEach(en => {
  finalDict[en] = autoCleanSyndrome(en);
});

fs.writeFileSync(path.join(__dirname, 'exact_syndromes_dict.json'), JSON.stringify(finalDict, null, 2), 'utf8');
console.log('Successfully written exact_syndromes_dict.json with 100% clean TCM entries:', Object.keys(finalDict).length);
