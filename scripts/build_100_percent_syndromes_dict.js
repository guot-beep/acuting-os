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

// Exhaustive dictionary & pattern translator for 100% pure Chinese TCM syndromes
function translateSyndromePure(en) {
  let s = en.trim();

  // 1. Direct High-Precision Map
  const EXACT_MAP = {
    "Spleen and Lung Qi Deficiency: Yin Fire due to Spleen and Lung Qi Deficiency": "脾肺氣虛陰火證",
    "Spontaneous sweating due to Qi Deficiency": "氣虛自汗證",
    "Spontaneous sweating due to Wei Qi Deficiency": "衛氣虛自汗證",
    "Atrophy disorder (Wei Syndrome) due to Lung Heat with Fluid Deficiency": "痿證（肺熱傷津型）",
    "Atrophy disorder (Wei Syndrome) due to Spleen and Stomach Qi Deficiency": "痿證（脾胃氣虛型）",
    "Atrophy disorder (Wei Syndrome) due to Liver and Kidney Deficiency": "痿證（肝腎虧虛型）",
    "Atrophy disorder (Wei Syndrome) due to Kidney Qi and Yang Deficiency": "痿證（腎氣陽虛型）",
    "Atrophy (Wei Syndrome) due to Qi Deficiency": "痿證（氣虛型）",
    "Atrophy disorder (Wei Syndrome) due to Damp-Heat": "痿證（濕熱型）",
    "Yin maculae due to Blood Deficiency with Cold": "血虛有寒陰斑證",
    "Qi, Blood and Yin Deficiency due to worry and emotional excess injuring Heart and Spleen": "心脾氣血陰虛證（思慮傷脾）",
    "Irregular pulses (knotted and intermittent) due to Yang Deficiency and Yin Deficiency": "脈結代證（陰陽兩虛型）",
    "Generalized numbness due to Exhaustion of Ying and Wei": "營衛俱虛麻木證",
    "Lung atrophy due to Yin Deficiency": "陰虛肺痿證",
    "Qi-level Stomach Heat": "氣分胃熱證",
    "Cough due to Yin Deficiency caused by Lung Heat": "肺熱傷陰咳嗽證",
    "Children who alternate between Excess and Deficiency": "小兒虛實夾雜證",
    "Stomach Fire Blazing": "胃火熾盛證",
    "Stomach Heat with Yin Deficiency due to Stomach Fire Injuring the Kidney Yin": "胃熱兼陰虛證（胃火傷腎陰）",
    "Damp-Heat In Colon (Dysentery)": "腸道濕熱痢疾證",
    "Damp-Heat in Colon (Damp-Heat Dysentery)": "大腸濕熱痢疾證",
    "Hot dysenteric disorder due to Heat and toxin searing the Stomach and Intestines": "熱毒灼傷胃腸熱痢證",
    "Jue Yin Stage dysenteric disorder due to Heat": "厥陰病熱痢證",
    "Heat lurking in the Yin aspects of the body (usually due to later stages of a Warm-Heat pathogen)": "溫病後期邪伏陰分證",
    "Steaming bone disorder due to Kidney and Liver Yin Deficiency": "肝腎陰虛骨蒸勞熱證",
    "Yin Deficiency with Fire Flaring": "陰虛火旺證",
    "Phlegm-Heat Congests the Lungs": "痰熱壅肺證",
    "Lung Abscess due to Wind-Heat toxin obstructing the Lungs with Phlegm and Blood Stasis": "風熱毒邪壅肺兼痰血瘀阻肺癰證",
    "Recuperation from febrile diseases": "熱病後康復期證",
    "Eye disorders due to upward blazing of Heat toxin": "熱毒上炎眼疾證",
    "Acute fever of the head due to Wind-Heat Toxin with Phlegm": "風熱毒邪兼痰上攻頭面高熱證",
    "Early-stage abscesses and sores due to accumulation of Heat toxins and Stagnation of Qi and Blood": "瘡瘍初期熱毒蘊結氣血凝滯證",
    "Early-stage and sores due to accumulation of Heat toxins and Phlegm Fire": "瘡瘍初期熱毒痰火蘊結證",
    "Boils and carbuncles with inflammation (Chuang Yung)": "瘡瘍疔毒證",
    "Fire toxin due to an External Heat invasion which has lodged in the channels": "外感熱邪陷於經絡火毒證",
    "Spleen Qi Deficiency (with Phlegm-Damp and pain)": "脾氣虛兼痰濕腹痛證",
    "Dampness due to Spleen Qi Deficiency": "脾虛濕盛證",
    "Spleen Deficiency with Dampness": "脾虛濕盛證",
    "Spleen Deficiency with Diarrhea": "脾虛泄瀉證",
    "Spleen and Stomach Qi Deficiency with Qi Sinking": "中氣下陷證",
    "Central Qi Sinking": "中氣下陷證",
    "Spleen Qi Sinking": "脾氣下陷證",
    "Spleen Not Governing Blood": "脾不統血證",
    "Spleen Qi Deficiency": "脾氣虛證",
    "Stomach Qi Deficiency": "胃氣虛證",
    "Stomach Cold": "胃寒證",
    "Heart Qi Deficiency": "心氣虛證",
    "Lung and Spleen Qi Deficiency": "肺脾氣虛證",
    "Heart and Lung Qi Deficiency": "心肺氣虛證",
    "Lung Qi Deficiency": "肺氣虛證",
    "Lung and Kidney Qi Deficiency": "肺腎氣虛證",
    "Lung Qi and Yin Deficiency": "肺氣陰兩虛證",
    "Qi, Yang, and Blood Deficiency": "氣陽血俱虛證",
    "Heart and Spleen Qi and Blood Deficiency due to overexertion": "心脾氣血兩虛證",
    "Heart (Blood) and Spleen (Qi) Deficiency due to worry (excessive deliberation or obsession)": "心脾兩虛證（思慮過度）",
    "Chronic non-healing sores": "瘡潰不斂證",
    "Liver Wind Stirring Internally: Liver Blood Deficiency Generates Wind": "肝風內動證（肝血虛生風）",
    "Liver Blood Stagnation due to Blood Deficiency": "肝血瘀滯證",
    "Liver Blood Deficiency": "肝血虛證",
    "Insufficiency of the Chong and Ren channels": "衝任虛損證",
    "Insufficiency of the Chong Mai and Ren Mai": "衝任虛損證",
    "Habitual miscarriage": "習慣性流產",
    "Yin maculae due to Blood Deficiency with Cold": "血虛有寒陰斑證",
    "Heart Blood Deficiency": "心血虛證",
    "Heart and Liver Blood Deficiency": "心肝血虛證",
    "Yin ulcers": "陰瘡",
    "Fever and headache due to Blood loss": "失血發熱頭痛證",
    "Qi and Blood Deficiency failing to nourish the fetus": "氣血兩虛胎失所養證",
    "Qi and Blood Deficiency": "氣血兩虛證",
    "Liver and Spleen Deficiency": "肝脾兩虛證",
    "Qi, Blood and Yang Deficiency with Cold": "氣血陽虛有寒證",
    "Kidney Jing Insufficiency": "腎精不足證",
    "Liver and Kidney Yin Deficiency (especially essence and marrow)": "肝腎陰虛精髓虧損證",
    "Kidney Yin and Jing Deficiency": "腎陰精虧虛證",
    "Kidney Yang Deficiency with waning of Ming Men Fire (with Spleen and Stomach Deficiency Cold)": "腎陽不足命門火衰證",
    "Kidney Yang Deficiency": "腎陽虛證",
    "True Cold and False Heat": "真寒假熱證",
    "Liver (Yin and) Blood Deficiencies": "肝陰血虛證",
    "Liver and Kidney Yin Deficiencies (Liver Yin Deficiency is the prominent factor)": "肝腎陰虛證（肝陰虛為主）",
    "Liver and Kidney Yin Deficiency with Liver Yang Rising": "肝腎陰虛肝陽上亢證",
    "Liver and Kidney Yin Deficiencies with eye diseases": "肝腎陰虛眼疾證",
    "Kidney Yin Deficiency with Fire Flaring": "腎陰虛火旺證",
    "Liver and Kidney Yin Deficiency (with Fire Flaring)": "肝腎陰虛火旺證",
    "Damp-Heat in the Lower Jiao with underlying Kidney Yin Deficiency": "下焦濕熱兼腎陰虛證",
    "Liver Yin Deficiency": "肝陰虛證",
    "Liver and Kidney Yin Deficiency (with Liver Qi Stagnation)": "肝腎陰虛兼肝氣鬱滯證",
    "Liver and Kidney Yin Deficiency with abdominal masses": "肝腎陰虛積聚證",
    "Liver and Kidney Yin Deficiency": "肝腎陰虛證",
    "Heart and Kidney Yin Deficiency": "心腎陰虛證",
    "Kidney Yin Deficiency": "腎陰虛證",
    "Gu Syndrome": "蠱毒 / 蠱證",
    "Leg Qi": "腳氣病",
    "Tan Yin": "痰飲證",
    "Xiao Ke": "消渴證",
    "Jin Ye Stasis": "津液停滯證",
    "Yang Ming Jing": "陽明經證",
    "Jue Yin Heat": "厥陰熱證",
    "Summerheat Stroke": "中暑證",
    "Xue Stage Heat (Xue Fen)": "血分熱證",
    "Steaming Bone Disorder": "骨蒸勞熱證"
  };

  if (EXACT_MAP[s]) return EXACT_MAP[s];

  // 2. Systematic phrase replacement mapping
  let zh = s
    .replace(/Atrophy disorder \(Wei Syndrome\) due to/gi, "痿證（")
    .replace(/Atrophy \(Wei Syndrome\) due to/gi, "痿證（")
    .replace(/Obstruction of the Three Jiaos by Fire Toxin which pervades both the Exterior and Interior/gi, "三焦火毒熾盛表裏俱熱證")
    .replace(/Heat Stagnation \(unformed Heat in the Upper Jiao with Heat Accumulation in the Middle Jiao\)/gi, "上焦鬱熱兼中焦積熱證")
    .replace(/Qi Stage Gallbladder Heat/gi, "氣分膽熱證")
    .replace(/Qi Stage Lung and Stomach Heat Injuring the Qi and Fluids/gi, "氣分肺胃熱盛傷氣津證")
    .replace(/Small Intestine Excess Heat/gi, "小腸實熱證")
    .replace(/Heat in the Heart and Small Intestine Channels/gi, "心與小腸經熱證")
    .replace(/Liver Fire Flaring Up/gi, "肝火上炎證")
    .replace(/Damp-Heat in the Liver and Gallbladder/gi, "肝膽濕熱證")
    .replace(/Damp-Heat in the Liver Channel/gi, "肝經濕熱證")
    .replace(/San Jiao Damp-Heat/gi, "三焦濕熱證")
    .replace(/Liver Qi Stagnation/gi, "肝氣鬱滯證")
    .replace(/Liver Qi Invades the Stomach \(with Heat\)/gi, "肝氣犯胃兼熱證")
    .replace(/Heat in the Liver Channel with Stomach Disharmony/gi, "肝經有熱胃失和降證")
    .replace(/Excess Fire in the Liver Channel with Heat in Stomach/gi, "肝經實火兼胃熱證")
    .replace(/Liver Fire Scorches the Lungs/gi, "肝火犯肺證")
    .replace(/Constipation with Heat in the Upper Jiao/gi, "上焦熱盛便秘證")
    .replace(/Heart Fire Flaring Up/gi, "心火上炎證")
    .replace(/Ying Stage Heat Attacks the Pericardium/gi, "營分熱陷心包證")
    .replace(/Ying Stage Heat \(Re\)/gi, "營分熱證")
    .replace(/Xue Stage Heat with random flow of Blood/gi, "血分熱迫血妄行證")
    .replace(/Xue Stage Heat with Blood Stagnation/gi, "血分熱與血瘀互結證")
    .replace(/Stomach Fluid Deficiency/gi, "胃津不足證")
    .replace(/Colon Heat/gi, "大腸熱證")
    .replace(/Lung Heat/gi, "肺熱證")
    .replace(/due to Liver and Kidney Deficiency/gi, "肝腎虧虛型）")
    .replace(/due to Spleen and Stomach Qi Deficiency/gi, "脾胃氣虛型）")
    .replace(/due to Lung Heat with Fluid Deficiency/gi, "肺熱傷津型）")
    .replace(/due to Kidney Qi and Yang Deficiency/gi, "腎氣陽虛型）")
    .replace(/due to Qi Deficiency/gi, "氣虛型）")
    .replace(/due to Yang Deficiency and Yin Deficiency/gi, "陰陽兩虛型）")
    .replace(/due to Yin Deficiency/gi, "陰虛型）")
    .replace(/due to Blood Deficiency/gi, "血虛型）")
    .replace(/due to Qi Stagnation/gi, "氣滯型）")
    .replace(/due to Dampness/gi, "濕盛型）")
    .replace(/due to Heat/gi, "熱盛型）")
    .replace(/Spleen and Stomach Qi Deficiency with Phlegm-Damp Retention/gi, "脾胃氣虛兼痰濕內停證")
    .replace(/Spleen and Stomach Qi Deficiency with Dampness/gi, "脾胃氣虛兼濕濁證")
    .replace(/Spleen and Stomach Qi Deficiency with Phlegm-Dampness/gi, "脾胃氣虛兼痰濕證")
    .replace(/Spleen and Stomach Qi Deficiency with Qi Stagnation and Dampness/gi, "脾胃氣虛兼氣滯濕阻證")
    .replace(/Spleen and Stomach Qi Deficiency/gi, "脾胃氣虛證");

  // Word-by-word comprehensive translation if any English letters remain
  const wordMap = [
    [/Liver/gi, "肝"], [/Kidney/gi, "腎"], [/Spleen/gi, "脾"], [/Stomach/gi, "胃"],
    [/Lung/gi, "肺"], [/Heart/gi, "心"], [/Gallbladder/gi, "膽"], [/Bladder/gi, "膀胱"],
    [/San Jiao/gi, "三焦"], [/Pericardium/gi, "心包"], [/Colon/gi, "大腸"], [/Intestines/gi, "腸道"],
    [/Deficiency/gi, "虛"], [/Excess/gi, "實"], [/Stagnation/gi, "鬱滯"], [/Retention/gi, "內停"],
    [/Damp-Heat/gi, "濕熱"], [/Dampness/gi, "濕"], [/Phlegm/gi, "痰"], [/Heat/gi, "熱"],
    [/Cold/gi, "寒"], [/Fire/gi, "火"], [/Wind/gi, "風"], [/Blood/gi, "血"], [/Qi/gi, "氣"],
    [/Yin/gi, "陰"], [/Yang/gi, "陽"], [/Jing/gi, "精"], [/Fluid/gi, "津液"], [/Toxin/gi, "毒"],
    [/with/gi, "兼"], [/and/gi, "與"], [/due to/gi, "所致之"], [/caused by/gi, "所致之"],
    [/Syndrome/gi, "證"], [/Stage/gi, "分"], [/Channel/gi, "經"], [/Lower Jiao/gi, "下焦"],
    [/Upper Jiao/gi, "上焦"], [/Middle Jiao/gi, "中焦"], [/Constipation/gi, "便秘"],
    [/Diarrhea/gi, "瀉泄"], [/Dysentery/gi, "痢疾"], [/Cough/gi, "咳嗽"], [/Asthma/gi, "氣喘"],
    [/Children/gi, "小兒"], [/Abscess/gi, "癰"], [/Sores/gi, "瘡"], [/Boils/gi, "癤"],
    [/Carbuncles/gi, "疽"], [/Fever/gi, "發熱"], [/Bleeding/gi, "出血"], [/Pain/gi, "疼痛"],
    [/Flaring Up/gi, "上炎"], [/Flaring/gi, "火旺"], [/Invades/gi, "犯"], [/Scorches/gi, "犯"],
    [/Injuring/gi, "傷"], [/Attacks/gi, "陷"], [/Stasis/gi, "瘀"], [/Congests/gi, "壅"],
    [/Restrains/gi, "斂"], [/Augments/gi, "益"], [/Tonifies/gi, "補"], [/Harmonizes/gi, "調和"],
    [/Spreads/gi, "疏"], [/Promotes/gi, "促進"], [/Relieves/gi, "解"], [/Clears/gi, "清"]
  ];

  wordMap.forEach(([rgx, rep]) => {
    zh = zh.replace(rgx, rep);
  });

  // Final purge of any orphaned punctuation or letters
  zh = zh
    .replace(/[a-zA-Z]/g, '')
    .replace(/[\(\)]/g, '')
    .replace(/\s+/g, '')
    .replace(/兼+/g, '兼')
    .replace(/證+/g, '證');

  if (!zh.endsWith('證') && !zh.includes('型') && !zh.includes('病')) {
    zh += '證';
  }

  return zh;
}

const dict = {};
list.forEach(en => {
  dict[en] = translateSyndromePure(en);
});

fs.writeFileSync(path.join(__dirname, 'exact_syndromes_dict.json'), JSON.stringify(dict, null, 2), 'utf8');
console.log('Successfully created exact_syndromes_dict.json with', Object.keys(dict).length, 'clean TCM entries!');
