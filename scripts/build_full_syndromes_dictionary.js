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

// Translation rules generator for TCM syndromes
function autoTranslateSyndrome(en) {
  let s = en.trim();

  // Special cases
  if (s === "Gu Syndrome") return "蠱毒 / 蠱證";
  if (s === "Leg Qi") return "腳氣病";
  if (s === "Tan Yin") return "痰飲證";
  if (s === "Xiao Ke") return "消渴證";
  if (s === "Jin Ye Stasis") return "津液停滯證";
  if (s === "Yang Ming Jing") return "陽明經證";
  if (s === "Jue Yin Heat") return "厥陰熱證";
  if (s === "Summerheat Stroke") return "中暑證";
  if (s === "Xue Stage Heat (Xue Fen)") return "血分熱證";
  if (s === "Steaming Bone Disorder") return "骨蒸勞熱證";

  // Common pattern replacements
  let zh = s
    .replace(/Atrophy disorder \(Wei Syndrome\) due to/gi, "痿證（")
    .replace(/Atrophy \(Wei Syndrome\) due to/gi, "痿證（")
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
    .replace(/Spleen and Stomach Qi Deficiency/gi, "脾胃氣虛證")
    .replace(/Spleen Qi Deficiency \(with Phlegm-Damp and pain\)/gi, "脾氣虛兼痰濕腹痛證")
    .replace(/Dampness due to Spleen Qi Deficiency/gi, "脾虛濕盛證")
    .replace(/Spleen Deficiency with Dampness/gi, "脾虛濕盛證")
    .replace(/Spleen Deficiency with Diarrhea/gi, "脾虛泄瀉證")
    .replace(/Spleen and Stomach Qi Deficiency with Qi Sinking/gi, "中氣下陷證")
    .replace(/Central Qi Sinking/gi, "中氣下陷證")
    .replace(/Spleen Qi Sinking/gi, "脾氣下陷證")
    .replace(/Spleen Not Governing Blood/gi, "脾不統血證")
    .replace(/Spleen Qi Deficiency/gi, "脾氣虛證")
    .replace(/Stomach Qi Deficiency/gi, "胃氣虛證")
    .replace(/Stomach Cold/gi, "胃寒證")
    .replace(/Heart Qi Deficiency/gi, "心氣虛證")
    .replace(/Lung and Spleen Qi Deficiency/gi, "肺脾氣虛證")
    .replace(/Heart and Lung Qi Deficiency/gi, "心肺氣虛證")
    .replace(/Lung Qi Deficiency/gi, "肺氣虛證")
    .replace(/Spontaneous sweating due to Wei Qi Deficiency/gi, "衛氣虛自汗證")
    .replace(/Spontaneous sweating due to Qi Deficiency/gi, "氣虛自汗證")
    .replace(/Lung and Kidney Qi Deficiency/gi, "肺腎氣虛證")
    .replace(/Lung Qi and Yin Deficiency/gi, "肺氣陰兩虛證")
    .replace(/Qi, Yang, and Blood Deficiency/gi, "氣陽血俱虛證")
    .replace(/Heart and Spleen Qi and Blood Deficiency due to overexertion/gi, "心脾氣血兩虛證")
    .replace(/Heart \(Blood\) and Spleen \(Qi\) Deficiency due to worry \(excessive deliberation or obsession\)/gi, "心脾兩虛證（思慮過度）")
    .replace(/Chronic non-healing sores/gi, "瘡潰不斂證")
    .replace(/Liver Wind Stirring Internally: Liver Blood Deficiency Generates Wind/gi, "肝風內動證（肝血虛生風）")
    .replace(/Liver Blood Stagnation due to Blood Deficiency/gi, "肝血瘀滯證")
    .replace(/Liver Blood Deficiency/gi, "肝血虛證")
    .replace(/Insufficiency of the Chong and Ren channels/gi, "衝任虛損證")
    .replace(/Insufficiency of the Chong Mai and Ren Mai/gi, "衝任虛損證")
    .replace(/Habitual miscarriage/gi, "習慣性流產")
    .replace(/Yin maculae due to Blood Deficiency with Cold/gi, "血虛有寒陰斑證")
    .replace(/Heart Blood Deficiency/gi, "心血虛證")
    .replace(/Heart and Liver Blood Deficiency/gi, "心肝血虛證")
    .replace(/Yin ulcers/gi, "陰瘡")
    .replace(/Fever and headache due to Blood loss/gi, "失血發熱頭痛證")
    .replace(/Qi and Blood Deficiency failing to nourish the fetus/gi, "氣血兩虛胎失所養證")
    .replace(/Qi and Blood Deficiency/gi, "氣血兩虛證")
    .replace(/Liver and Spleen Deficiency/gi, "肝脾兩虛證")
    .replace(/Qi, Blood and Yang Deficiency with Cold/gi, "氣血陽虛有寒證")
    .replace(/Kidney Jing Insufficiency/gi, "腎精不足證")
    .replace(/Liver and Kidney Yin Deficiency \(especially essence and marrow\)/gi, "肝腎陰虛精髓虧損證")
    .replace(/Kidney Yin and Jing Deficiency/gi, "腎陰精虧虛證")
    .replace(/Kidney Yang Deficiency with waning of Ming Men Fire \(with Spleen and Stomach Deficiency Cold\)/gi, "腎陽不足命門火衰證")
    .replace(/Kidney Yang Deficiency/gi, "腎陽虛證")
    .replace(/True Cold and False Heat/gi, "真寒假熱證")
    .replace(/Liver \(Yin and\) Blood Deficiencies/gi, "肝陰血虛證")
    .replace(/Liver and Kidney Yin Deficiencies \(Liver Yin Deficiency is the prominent factor\)/gi, "肝腎陰虛證（肝陰虛為主）")
    .replace(/Liver and Kidney Yin Deficiency with Liver Yang Rising/gi, "肝腎陰虛肝陽上亢證")
    .replace(/Liver and Kidney Yin Deficiencies with eye diseases/gi, "肝腎陰虛眼疾證")
    .replace(/Kidney Yin Deficiency with Fire Flaring/gi, "腎陰虛火旺證")
    .replace(/Liver and Kidney Yin Deficiency \(with Fire Flaring\)/gi, "肝腎陰虛火旺證")
    .replace(/Damp-Heat in the Lower Jiao with underlying Kidney Yin Deficiency/gi, "下焦濕熱兼腎陰虛證")
    .replace(/Liver Yin Deficiency/gi, "肝陰虛證")
    .replace(/Liver and Kidney Yin Deficiency \(with Liver Qi Stagnation\)/gi, "肝腎陰虛兼肝氣鬱滯證")
    .replace(/Liver and Kidney Yin Deficiency with abdominal masses/gi, "肝腎陰虛積聚證")
    .replace(/Liver and Kidney Yin Deficiency/gi, "肝腎陰虛證")
    .replace(/Heart and Kidney Yin Deficiency/gi, "心腎陰虛證")
    .replace(/Kidney Yin Deficiency/gi, "腎陰虛證")
    .replace(/Qi Stage Lung and Stomach Heat Injuring the Qi and Fluids/gi, "氣分肺胃熱盛傷氣津證")
    .replace(/Stomach Fluid Deficiency/gi, "胃津不足證")
    .replace(/Ying Stage Heat Attacks the Pericardium/gi, "營分熱陷心包證")
    .replace(/Ying Stage Heat \(Re\)/gi, "營分熱證")
    .replace(/Xue Stage Heat with random flow of Blood/gi, "血分熱迫血妄行證")
    .replace(/Xue Stage Heat with Blood Stagnation/gi, "血分熱與血瘀互結證")
    .replace(/Obstruction of the Three Jiaos by Fire Toxin which pervades both the Exterior and Interior/gi, "三焦火毒熾盛表裏俱熱證")
    .replace(/Lung Heat/gi, "肺熱證")
    .replace(/Colon Heat/gi, "大腸熱證")
    .replace(/Heart Fire Flaring Up/gi, "心火上炎證")
    .replace(/Heat Stagnation \(unformed Heat in the Upper Jiao with Heat Accumulation in the Middle Jiao\)/gi, "上焦鬱熱兼中焦積熱證")
    .replace(/Constipation with Heat in the Upper Jiao/gi, "上焦熱盛便秘證")
    .replace(/Qi Stage Gallbladder Heat/gi, "氣分膽熱證")
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
    .replace(/Cough due to Yin Deficiency caused by Lung Heat/gi, "肺熱傷陰咳嗽證");

  // Fallback cleanup if any english letters remain
  if (/[a-zA-Z]/.test(zh)) {
    zh = zh
      .replace(/Liver/gi, "肝").replace(/Kidney/gi, "腎").replace(/Spleen/gi, "脾")
      .replace(/Stomach/gi, "胃").replace(/Lung/gi, "肺").replace(/Heart/gi, "心")
      .replace(/Gallbladder/gi, "膽").replace(/Bladder/gi, "膀胱").replace(/San Jiao/gi, "三焦")
      .replace(/Deficiency/gi, "虛").replace(/Excess/gi, "實").replace(/Stagnation/gi, "鬱滯")
      .replace(/Dampness/gi, "濕").replace(/Phlegm/gi, "痰").replace(/Heat/gi, "熱")
      .replace(/Cold/gi, "寒").replace(/Fire/gi, "火").replace(/Wind/gi, "風")
      .replace(/Blood/gi, "血").replace(/Qi/gi, "氣").replace(/Yin/gi, "陰").replace(/Yang/gi, "陽")
      .replace(/Jing/gi, "精").replace(/with/gi, "兼").replace(/and/gi, "與")
      .replace(/Syndrome/gi, "證").replace(/Stage/gi, "分");
  }

  return zh.replace(/\s+/g, '').replace(/（+/g, '（').replace(/）+/g, '）');
}

const dict = {};
list.forEach(en => {
  dict[en] = autoTranslateSyndrome(en);
});

fs.writeFileSync(path.join(__dirname, 'exact_syndromes_dict.json'), JSON.stringify(dict, null, 2), 'utf8');
console.log('Successfully created exact_syndromes_dict.json with', Object.keys(dict).length, 'entries!');
