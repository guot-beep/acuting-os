const fs = require('fs');
const path = require('path');

const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const formulas = formulasData.records || [];

function translateEnglishActionToZh(text) {
  if (!text) return '';
  
  let str = text;

  // Replacements from specific to general
  const phraseMap = [
    [/Induces sweating and releases the Exterior/gi, '發汗解表'],
    [/Induces sweating/gi, '發汗解表'],
    [/Promotes sweating/gi, '發汗解表'],
    [/Releases the Exterior/gi, '解表散寒'],
    [/releases exterior/gi, '解表'],
    [/Releases Wind-Cold/gi, '疏散風寒'],
    [/warms\/unblocks channels/gi, '溫經通絡'],
    [/warms channels/gi, '溫經通絡'],
    [/assists Yang\/Qi/gi, '助陽益氣'],
    [/harmonizes Ying and Wei/gi, '調和營衛'],
    [/harmonizes Ying\/Wei/gi, '調和營衛'],
    [/harmonizes Ying/gi, '調和營氣'],
    [/harmonizes Stomach/gi, '和胃降逆'],
    [/harmonizes the ingredients/gi, '調和諸藥'],
    [/harmonizes/gi, '調和諸藥'],
    [/Nourishes Blood\/Yin/gi, '養血滋陰'],
    [/nourishes Blood\/Yin/gi, '養血滋陰'],
    [/nourishes Blood/gi, '養血'],
    [/preserves fluids/gi, '生津保津'],
    [/pairs with Gui Zhi to regulate Ying\/Wei/gi, '與桂枝相配以調和營衛'],
    [/supports Gui Zhi exterior-releasing action/gi, '協助桂枝解表發汗'],
    [/disseminates Lung Qi/gi, '宣暢肺氣'],
    [/calms wheezing\/cough/gi, '平喘止咳'],
    [/promotes urination and expels Cold/gi, '利水散寒'],
    [/promotes Qi\/Blood flow/gi, '運行氣血'],
    [/Descends Lung Qi/gi, '宣降肺氣'],
    [/transforms Phlegm/gi, '化痰'],
    [/relieves cough\/wheezing/gi, '止咳平喘'],
    [/AD notes pairing with Gui Zhi to strengthen sweating and with Xing Ren for cough\/wheezing\./gi, '（AD 註：與桂枝相配以增強發汗，與杏仁相配以治咳嗽喘促。）'],
    [/Strong Qi tonic/gi, '大補元氣'],
    [/strengthens Spleen\/Stomach/gi, '健脾和胃'],
    [/strengthens Spleen/gi, '健脾'],
    [/supports Spleen transformation\/transportation/gi, '促進脾胃運化'],
    [/treats Spleen\/Stomach Qi deficiency/gi, '主治脾胃氣虛證'],
    [/Tonifies Middle Jiao and Qi/gi, '補中益氣'],
    [/Tonifies Middle Qi/gi, '補中益氣'],
    [/Tonifies Spleen\/Qi/gi, '健脾益氣'],
    [/Tonifies Qi/gi, '補氣益氣'],
    [/tonifies Qi/gi, '補氣'],
    [/tonifies/gi, '補益'],
    [/Tonifies/gi, '補益'],
    [/lists it as a common Ren Shen substitute/gi, '列為人參之常用替代藥'],
    [/especially for Gu-type presentations/gi, '特別適用於體虛證型'],
    [/supports Spleen\/Stomach deficiency/gi, '補益脾胃虛弱'],
    [/strengthens Spleen Qi/gi, '健旺脾氣'],
    [/dries Dampness/gi, '燥濕'],
    [/Drains Dampness/gi, '利水滲濕'],
    [/drains Dampness/gi, '利水滲濕'],
    [/drains Damp/gi, '利濕'],
    [/assists the formula’s Qi-tonifying effect/gi, '協助本方補氣之功'],
    [/moderates Zhi Gan Cao/gi, '緩和炙甘草之性'],
    [/moderates spasms/gi, '緩急止痛'],
    [/moderates/gi, '緩和'],
    [/for weak Spleen with fatigue, anorexia and loose stools/gi, '主治脾虛倦怠、食欲不振及便溏'],
    [/Harmonizes, warms and strengthens the Middle Jiao/gi, '調和、溫煦並健旺中焦脾胃'],
    [/for Spleen deficiency with poor appetite\/fatigue\/loose stools and palpitations/gi, '主治脾虛食少、疲乏便溏及心悸'],
    [/reinforces Spleen Qi/gi, '加強補益脾氣'],
    [/combines with/gi, '配伍'],
    [/for Spleen-Stomach Qi deficiency/gi, '主治脾胃氣虛'],
    [/Listed as a Ren Shen substitute/gi, '列為人參之替代藥'],
    [/tonifies Middle Jiao Qi/gi, '補中氣'],
    [/reduces nausea\/vomiting/gi, '止嘔降逆'],
    [/addresses nausea, vomiting and anorexia from congested fluids/gi, '治水飲內停之噁心嘔吐與食欲不振'],
    [/harmonizes and warms the Middle Jiao/gi, '溫中調和脾胃'],
    [/supports Spleen Qi/gi, '益脾氣'],
    [/Moves Qi/gi, '行氣理氣'],
    [/moves Qi/gi, '行氣'],
    [/supports Spleen and regulates Middle/gi, '健脾和中'],
    [/for Damp obstruction arising from Spleen deficiency/gi, '主治脾虛濕阻'],
    [/harmonizes Stomach/gi, '和胃降逆'],
    [/descends rebellious Qi and stops vomiting/gi, '降逆止嘔'],
    [/for epigastric\/abdominal distention or pain from Stomach Qi disharmony/gi, '治胃氣不和之脘腹脹痛'],
    [/Optional warming addition/gi, '可選溫中加味'],
    [/warms Middle/gi, '溫中散寒'],
    [/warms the Middle/gi, '溫中散寒'],
    [/expels Cold/gi, '驅散寒邪'],
    [/harmonizes Ying\/Wei and supports the Middle/gi, '調和營衛並補益中焦'],
    [/With /g, '與 '],
    [/ and /g, ' 及 '],
    [/ for /g, ' 主治 '],
    [/ or /g, ' 或 ']
  ];

  for (const [regex, replacement] of phraseMap) {
    str = str.replace(regex, replacement);
  }

  // Clean remaining terms
  str = str
    .replace(/\bSpleen\b/g, '脾')
    .replace(/\bStomach\b/g, '胃')
    .replace(/\bLung\b/g, '肺')
    .replace(/\bHeart\b/g, '心')
    .replace(/\bKidney\b/g, '腎')
    .replace(/\bLiver\b/g, '肝')
    .replace(/\bQi\b/g, '氣')
    .replace(/\bYin\b/g, '陰')
    .replace(/\bYang\b/g, '陽')
    .replace(/\bBlood\b/g, '血')
    .replace(/\bDamp\b/g, '濕')
    .replace(/\bCold\b/g, '寒')
    .replace(/\bHeat\b/g, '熱')
    .replace(/\bPhlegm\b/g, '痰')
    .replace(/\bWind\b/g, '風');

  return str.trim();
}

let count = 0;
formulas.forEach(f => {
  if (Array.isArray(f.composition)) {
    f.composition.forEach(c => {
      if (c.in_formula_en) {
        c.in_formula_zh = translateEnglishActionToZh(c.in_formula_en);
        c.actions_zh = c.in_formula_zh;
        c.role_reason_zh = c.in_formula_zh;
        count++;
      }
    });
  }
});

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log(`Successfully re-translated ${count} herb composition actions.`);
