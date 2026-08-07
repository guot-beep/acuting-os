const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '../curriculum/formulas/American_Dragon_201_Formulas_Name_Actions_Syndromes.md');
const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');

const mdContent = fs.readFileSync(mdPath, 'utf8');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const formulas = formulasData.records || [];

function normalizeZh(str) {
  if (!str) return '';
  return str
    .replace(/汤/g, '湯')
    .replace(/龙/g, '龍')
    .replace(/当/g, '當')
    .replace(/归/g, '歸')
    .replace(/药/g, '藥')
    .replace(/饮/g, '飲')
    .replace(/气/g, '氣')
    .replace(/铃/g, '鈴')
    .replace(/钩/g, '鉤')
    .replace(/乌/g, '烏')
    .replace(/黄/g, '黃')
    .replace(/补/g, '補')
    .replace(/阴/g, '陰')
    .replace(/阳/g, '陽')
    .replace(/风/g, '風')
    .replace(/胜/g, '勝')
    .replace(/泻/g, '瀉')
    .replace(/湿/g, '濕')
    .replace(/参/g, '參')
    .replace(/芪/g, '耆')
    .replace(/複/g, '復')
    .replace(/飲/g, '湯')
    .replace(/[]/g, '');
}

// Action Translation Map (English -> Chinese title + detailed description)
const actionTranslateMap = {
  'Tonifies Qi': '補益氣血 — 大補宗氣與脾胃中氣',
  'Strengthens the Spleen and Stomach': '健脾和胃 — 運化水谷精微與後天之本',
  'Strengthens the Spleen': '健脾益氣 — 促進脾胃運化水濕',
  'Transforms Phlegm': '化痰降逆 — 燥濕化痰，理氣和中',
  'Dries Dampness': '燥濕健脾 — 苦溫燥濕，運化水濕',
  'Stops vomiting': '降逆止嘔 — 和胃降逆，溫中止嘔',
  'Circulates Qi': '行氣通絡 — 暢通氣機，寬胸理氣',
  'Harmonizes the Middle Jiao': '調和中焦 — 溫中和胃，平調寒熱',
  'Harmonizes the Stomach': '和胃降逆 — 調和脾胃，降逆止嘔',
  'Regulates Qi': '理氣寬中 — 疏肝理氣，調暢氣機',
  'Stops pain': '緩急止痛 — 通絡止痛，溫散寒凝',
  'Augments Qi': '益氣充沛 — 補中益氣，固表止汗',
  'Resolves Dampness': '滲濕利水 — 分清化濁，健脾利濕',
  'Stops diarrhea': '澀腸止瀉 — 健脾止瀉，固腸安胃',
  'Tonifies Middle Jiao Qi': '補中益氣 — 補益中焦，升提清陽',
  'Benefits Qi': '益氣固本 — 充沛衛陽，固表禦邪',
  'Raises Sunken Yang': '升舉清陽 — 升陽舉陷，柴升麻舉',
  'Lifts prolapsed organs': '升提下陷 — 治療臟器脫垂、子宮脫垂',
  'Stabilizes the exterior': '固表止汗 — 益氣固表，平定自汗',
  'Stops sweat': '斂汗固表 — 實衛固表，止自汗盜汗',
  'Nourishes the Heart': '養心安神 — 補益心血，養心寧神',
  'Calms the Shen': '安神定志 — 鎮靜安神，寧心擇志',
  'Relieves acute conditions': '緩急止痛 — 緩和急迫，減輕痙攣',
  'Relaxes tension': '舒緩解痙 — 緩和緊張，平復急躁',
  'Nourishes Blood': '補血養血 — 養血和營，充盈血海',
  'Nourishes Yin': '滋陰養陰 — 補益肝腎，生津潤燥',
  'Clears Heat': '清熱瀉火 — 清熱涼血，瀉火解毒',
  'Expels Wind': '祛風解表 — 疏散風邪，通絡止痛',
  'Warms the Interior': '溫裡散寒 — 溫補脾腎，助陽祛寒',
  'Opens the Orifices': '芳香開竅 — 豁痰開竅，清心安神',
  'Promotes urination': '利水通淋 — 滲濕利水，通利小便',
  'Disperses Phlegm': '宣肺化痰 — 止咳平喘，宣通肺氣',
  'Softens hardness': '軟堅散結 — 軟堅化痰，消散癥瘕',
  'Clears Summerheat': '清熱解暑 — 祛暑利濕，生津止渴',
  'Cools Blood': '涼血止血 — 清熱涼血，散瘀止血',
  'Invigorates Blood': '活血化瘀 — 溫經通脈，行血止痛',
  'Disperses Stasis': '祛瘀止痛 — 散瘀止痛，溫經通絡',
  'Astringes Essence': '固精止遺 — 固澀下焦，封藏腎精',
  'Moistens Dryness': '潤燥生津 — 養陰潤肺，潤腸通便'
};

function translateActionLine(enLine) {
  if (actionTranslateMap[enLine]) return actionTranslateMap[enLine];
  
  let translated = enLine
    .replace(/Tonifies Qi/gi, '補氣益氣')
    .replace(/Strengthens the Spleen/gi, '健脾益氣')
    .replace(/Harmonizes/gi, '調和諸藥')
    .replace(/Clears Heat/gi, '清熱瀉火')
    .replace(/Nourishes Yin/gi, '滋陰養陰')
    .replace(/Nourishes Blood/gi, '補血養血')
    .replace(/Regulates Qi/gi, '理氣寬中')
    .replace(/Warms/gi, '溫中散寒')
    .replace(/Stops/gi, '止')
    .replace(/Transforms Phlegm/gi, '化痰降逆')
    .replace(/Dries Dampness/gi, '燥濕健脾')
    .replace(/Expels/gi, '祛散');
    
  return `${translated} — 增強本方治效`;
}

const syndromeTranslateMap = {
  'Spleen Qi Deficiency': '脾氣虛證',
  'Heart Qi Deficiency': '心氣虛證',
  'Lung and Spleen Qi Deficiency': '肺脾氣虛證',
  'Heart and Lung Qi Deficiency': '心肺氣虛證',
  'Gu Syndrome': '蠱毒/體虛證',
  'Stomach Qi Deficiency': '胃氣虛證',
  'Spleen and Stomach Qi Deficiency with Phlegm-Damp Retention': '脾胃氣虛兼痰濕停聚證',
  'Atrophy disorder (Wei Syndrome) due to Spleen and Stomach Qi Deficiency': '脾胃氣虛所致之痿證',
  'Heart Blood Deficiency with Liver Qi Stagnation': '心血虛伴肝氣鬱結證',
  'Restless Organ Syndrome': '臟躁證',
  'Dry Organ disorder': '臟躁乾澀證',
  'Central Qi Sinking': '中氣下陷證',
  'Spleen Not Governing Blood': '脾不統血證',
  'Spleen and Lung Qi Deficiency: Yin Fire due to Spleen and Lung Qi Deficiency': '肺脾氣虛兼陰火證',
  'Exterior Wind-Cold Invasion': '外感風寒表證',
  'Wind-Cold with Spleen Deficiency': '風寒表虛兼脾虛證',
  'Wind-Cold with Phlegm-Fluids': '風寒客表兼水飲內停證',
  'Wind-Heat Invasion': '外感風熱表證',
  'Warm-Heat Febrile Disease': '溫病初起表熱證',
  'Damp-Heat in the Lower Jiao': '下焦濕熱證',
  'Liver and Gallbladder Damp-Heat': '肝膽濕熱證',
  'Heart Fire Blazing': '心火熾盛證',
  'Yin Deficiency with Heat': '陰虛內熱證',
  'Blood Stasis in Lower Abdomen': '少腹血瘀證',
  'Blood Stasis in Mansion of Blood': '血府血瘀證',
  'Kidney Yang Deficiency': '腎陽虛證',
  'Kidney Yin Deficiency': '腎陰虛證'
};

function translateSyndromeLine(enLine) {
  if (syndromeTranslateMap[enLine]) return syndromeTranslateMap[enLine];
  
  let zh = enLine
    .replace(/Deficiency/gi, '虛證')
    .replace(/Stagnation/gi, '鬱結')
    .replace(/Syndrome/gi, '證')
    .replace(/Disorder/gi, '疾')
    .replace(/Spleen/gi, '脾')
    .replace(/Stomach/gi, '胃')
    .replace(/Heart/gi, '心')
    .replace(/Lung/gi, '肺')
    .replace(/Kidney/gi, '腎')
    .replace(/Liver/gi, '肝')
    .replace(/Blood/gi, '血')
    .replace(/Qi/gi, '氣')
    .replace(/Yin/gi, '陰')
    .replace(/Yang/gi, '陽')
    .replace(/Damp/gi, '濕')
    .replace(/Heat/gi, '熱')
    .replace(/Cold/gi, '寒')
    .replace(/Phlegm/gi, '痰')
    .replace(/Wind/gi, '風');

  return zh;
}

const blocks = mdContent.split(/^### /m).slice(1);
let updatedCount = 0;

blocks.forEach((block) => {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return;

  const headerLine = lines[0]; // e.g. 四君子湯
  const cleanHeader = normalizeZh(headerLine.replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());

  let currentSection = '';
  const actionsEn = [];
  const syndromesEn = [];

  lines.forEach(line => {
    if (line.includes('Formula Actions:')) { currentSection = 'actions'; return; }
    if (line.includes('Syndromes:')) { currentSection = 'syndromes'; return; }
    if (line.startsWith('- ')) {
      const val = line.replace(/^- /, '').trim();
      if (currentSection === 'actions') actionsEn.push(val);
      if (currentSection === 'syndromes') syndromesEn.push(val);
    }
  });

  const targetFormula = formulas.find(f => {
    const fZh = normalizeZh((f.name_zh || '').replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());
    const fPy = (f.pinyin || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
    return fZh === cleanHeader || fPy === cleanHeader || (fZh && cleanHeader && (fZh.includes(cleanHeader) || cleanHeader.includes(fZh)));
  });

  if (targetFormula) {
    if (actionsEn.length > 0) {
      targetFormula.actions_en = actionsEn;
      targetFormula.actions_zh = actionsEn.map(translateActionLine);
    }
    if (syndromesEn.length > 0) {
      targetFormula.ad_syndromes_en = syndromesEn;
      targetFormula.pattern_indications_en = syndromesEn;
      targetFormula.pattern_indications_zh = syndromesEn.map(translateSyndromeLine);
      targetFormula.pattern_focus_en = syndromesEn.slice(0, 3);
    }
    if (!targetFormula.field_sources) targetFormula.field_sources = {};
    targetFormula.field_sources.actions_zh = ["American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)"];
    targetFormula.field_sources.pattern_indications_zh = ["American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)"];
    updatedCount++;
  } else {
    console.log('Unmatched formula block:', headerLine);
  }
});

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log(`Successfully populated Actions and Syndromes for ${updatedCount} / ${blocks.length} formulas in formulas.json.`);
