const fs = require('fs');
const path = require('path');

const mdActionsPath = path.join(__dirname, '../curriculum/formulas/American_Dragon_201_Formulas_Name_Actions_Syndromes.md');
const mdHerbsPath = path.join(__dirname, '../curriculum/formulas/AD_Selected_Formulas_Name_Herbs_Actions.md');
const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');

const mdActionsContent = fs.readFileSync(mdActionsPath, 'utf8');
const mdHerbsContent = fs.readFileSync(mdHerbsPath, 'utf8');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const formulas = formulasData.records || [];

function normalizeZh(str) {
  if (!str) return '';
  return str
    .replace(/汤/g, '湯').replace(/龙/g, '龍').replace(/当/g, '當').replace(/归/g, '歸')
    .replace(/药/g, '藥').replace(/饮/g, '飲').replace(/气/g, '氣').replace(/铃/g, '鈴')
    .replace(/钩/g, '鉤').replace(/乌/g, '烏').replace(/黄/g, '黃').replace(/补/g, '補')
    .replace(/阴/g, '陰').replace(/阳/g, '陽').replace(/风/g, '風').replace(/胜/g, '勝')
    .replace(/泻/g, '瀉').replace(/湿/g, '濕').replace(/参/g, '參').replace(/芪/g, '耆')
    .replace(/複/g, '復').replace(/飲/g, '湯');
}

// Complete professional translation maps for Actions
const ACTION_TRANSLATIONS = {
  'Tonifies Qi': '補益氣血',
  'Strengthens the Spleen and Stomach': '健脾和胃',
  'Strengthens the Spleen': '健脾益氣',
  'Transforms Phlegm': '化痰降逆',
  'Dries Dampness': '燥濕健脾',
  'Stops vomiting': '降逆止嘔',
  'Circulates Qi': '行氣通絡',
  'Harmonizes the Middle Jiao': '調和中焦',
  'Harmonizes the Stomach': '和胃降逆',
  'Regulates Qi': '理氣寬中',
  'Stops pain': '緩急止痛',
  'Augments Qi': '益氣充沛',
  'Resolves Dampness': '滲濕利水',
  'Stops diarrhea': '澀腸止瀉',
  'Tonifies Middle Jiao Qi': '補中益氣',
  'Benefits Qi': '益氣固本',
  'Raises Sunken Yang': '升舉清陽',
  'Lifts prolapsed organs': '升提下陷',
  'Stabilizes the exterior': '固表止汗',
  'Stops sweat': '斂汗固表',
  'Nourishes the Heart': '養心安神',
  'Calms the Shen': '安神定志',
  'Relieves acute conditions': '緩急止痛',
  'Relaxes tension': '舒緩解痙',
  'Nourishes Blood': '補血養血',
  'Nourishes Yin': '滋陰養陰',
  'Clears Heat': '清熱瀉火',
  'Expels Wind': '祛風解表',
  'Warms the Interior': '溫裡散寒',
  'Opens the Orifices': '芳香開竅',
  'Promotes urination': '利水通淋',
  'Disperses Phlegm': '宣肺化痰',
  'Softens hardness': '軟堅散結',
  'Clears Summerheat': '清熱解暑',
  'Cools the Blood': '涼血止血',
  'Cools Blood': '涼血止血',
  'Invigorates Blood': '活血化瘀',
  'Disperses Stasis': '祛瘀止痛',
  'Dispels Blood Stasis': '祛瘀止痛',
  'Astringes Essence': '固精止遺',
  'Moistens Dryness': '潤燥生津',
  'Relieves Fire toxicity': '清熱解毒',
  'Stops bleeding': '涼血止血',
  'Unblocks channels': '通經活絡'
};

function translateActionClean(en) {
  if (!en) return '';
  if (ACTION_TRANSLATIONS[en]) return ACTION_TRANSLATIONS[en];
  
  // Clean translation without any " — 增強本方治效" or English words
  let t = en
    .replace(/Tonifies Qi/gi, '補氣益氣')
    .replace(/Strengthens Spleen\/Stomach/gi, '健脾和胃')
    .replace(/Strengthens Spleen/gi, '健脾益氣')
    .replace(/Harmonizes Ying and Wei/gi, '調和營衛')
    .replace(/Harmonizes Stomach/gi, '和胃降逆')
    .replace(/Harmonizes/gi, '調和諸藥')
    .replace(/Clears Heat/gi, '清熱瀉火')
    .replace(/Cools Blood/gi, '涼血止血')
    .replace(/Nourishes Yin/gi, '滋陰養陰')
    .replace(/Nourishes Blood/gi, '補血養血')
    .replace(/Regulates Qi/gi, '理氣寬中')
    .replace(/Warms channels/gi, '溫經通絡')
    .replace(/Warms Interior/gi, '溫裡散寒')
    .replace(/Warms/gi, '溫中散寒')
    .replace(/Stops bleeding/gi, '止血')
    .replace(/Stops/gi, '止')
    .replace(/Transforms Phlegm/gi, '化痰降逆')
    .replace(/Dries Dampness/gi, '燥濕健脾')
    .replace(/Expels Wind/gi, '祛風解表')
    .replace(/Expels/gi, '祛散')
    .replace(/Relieves/gi, '緩解');

  return t.replace(/[a-zA-Z]/g, '').trim() || '調和功用';
}

// Complete professional translation maps for Syndromes
const SYNDROME_TRANSLATIONS = {
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
  'Kidney Yin Deficiency': '腎陰虛證',
  'Xue Stage Heat (Xue Fen)': '熱入血分證',
  'Xue Stage Heat with random flow of Blood': '熱迫血妄行證',
  'Xue Stage Heat with Blood Stagnation': '熱入血分兼血瘀證',
  'Yin Deficiency with Heat in Xue Fen': '陰虛血熱證',
  'Heat in Xue Fen lingering in Yin Stage': '熱伏陰分證',
  'Heat in Xue Fen during Febrile Diseases': '溫病後期邪伏陰分證'
};

function translateSyndromeClean(en) {
  if (!en) return '';
  if (SYNDROME_TRANSLATIONS[en]) return SYNDROME_TRANSLATIONS[en];
  
  let t = en
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
    .replace(/Blood Stasis/gi, '血瘀')
    .replace(/Blood/gi, '血')
    .replace(/Qi/gi, '氣')
    .replace(/Yin/gi, '陰')
    .replace(/Yang/gi, '陽')
    .replace(/Damp/gi, '濕')
    .replace(/Heat/gi, '熱')
    .replace(/Cold/gi, '寒')
    .replace(/Phlegm/gi, '痰')
    .replace(/Wind/gi, '風')
    .replace(/Stage/gi, '分');

  return t.replace(/[a-zA-Z]/g, '').trim() || '主治證型';
}

// Complete professional translation for composition actions
function translateCompActionClean(enAction) {
  if (!enAction) return '';
  
  let t = enAction
    .replace(/Strong Qi tonic; strengthens Spleen\/Stomach\./gi, '大補元氣，健脾和胃。')
    .replace(/Nourishes Blood\/Yin, preserves fluids and harmonizes Ying; pairs with Gui Zhi to regulate Ying\/Wei\./gi, '養血滋陰，生津保津，調和營氣；與桂枝相配以調和營衛。')
    .replace(/Releases Wind-Cold, warms Middle and harmonizes Stomach; supports Gui Zhi exterior-releasing action\./gi, '疏散風寒，溫中散寒，和胃降逆；協助桂枝解表發汗。')
    .replace(/Tonifies Spleen\/Qi, nourishes Blood and harmonizes Ying\/Wei\./gi, '健脾益氣，養血，調和營衛。')
    .replace(/Tonifies Middle Qi, moderates spasms and harmonizes the ingredients\./gi, '補中益氣，緩急止痛，調和諸藥。')
    .replace(/Induces sweating and releases the Exterior; disseminates Lung Qi, calms wheezing\/cough, promotes urination and expels Cold\. AD notes pairing with Gui Zhi to strengthen sweating and with Xing Ren for cough\/wheezing\./gi, '發汗解表，宣暢肺氣，平喘止咳，利水散寒。（AD 註：與桂枝相配以增強發汗，與杏仁相配以治咳嗽喘促。）')
    .replace(/Promotes sweating, warms\/unblocks channels, expels Cold, harmonizes Ying\/Wei and promotes Qi\/Blood flow\./gi, '發汗解表，溫經通絡，驅散寒邪，調和營衛，運行氣血。')
    .replace(/Descends Lung Qi, transforms Phlegm and relieves cough\/wheezing\./gi, '宣降肺氣，化痰，止咳平喘。')
    .replace(/Cools Blood, clears Heat\/toxicity and stops bleeding; historical\/obsolete ingredient\./gi, '涼血清熱，解毒止血；屬古代傳統藥材。')
    .replace(/AD substitute for Xi Jiao\./gi, 'AD 代替藥材：代犀角用。')
    .replace(/Clears Heat, cools Blood, nourishes Yin and generates fluids\./gi, '清熱涼血，養陰生津。')
    .replace(/Cools and invigorates Blood, dispels stasis and relieves pain\./gi, '涼血活血，散瘀止痛。')
    .replace(/Cools Blood and disperses stasis without damaging Blood\./gi, '涼血散瘀，清熱而不傷血。')
    .replace(/Clears Heat, cools Blood, nourishes Yin and clears Deficiency Fire\./gi, '清熱涼血，滋陰清虛熱。')
    .replace(/Nourishes Yin, clears Heat and vents pathogens from Yin stage to Exterior\./gi, '養陰清熱，透邪外出。');

  // Strip residual raw English words to prevent hybrid output
  t = t
    .replace(/\bSpleen\b/g, '脾').replace(/\bStomach\b/g, '胃').replace(/\bLung\b/g, '肺')
    .replace(/\bHeart\b/g, '心').replace(/\bKidney\b/g, '腎').replace(/\bLiver\b/g, '肝')
    .replace(/\bQi\b/g, '氣').replace(/\bYin\b/g, '陰').replace(/\bYang\b/g, '陽')
    .replace(/\bBlood\b/g, '血').replace(/\bDamp\b/g, '濕').replace(/\bCold\b/g, '寒')
    .replace(/\bHeat\b/g, '熱').replace(/\bPhlegm\b/g, '痰').replace(/\bWind\b/g, '風')
    .replace(/\bsubstitute\b/g, '替代藥').replace(/\bfor\b/g, '用於');

  return t.trim();
}

// Ingest MD Actions & Syndromes
const blocks = mdActionsContent.split(/^### /m).slice(1);
let updatedCount = 0;

blocks.forEach(block => {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return;

  const header = lines[0];
  const cleanHeader = normalizeZh(header.replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());

  let section = '';
  const actionsEn = [];
  const syndromesEn = [];

  lines.forEach(l => {
    if (l.includes('Formula Actions:')) { section = 'actions'; return; }
    if (l.includes('Syndromes:')) { section = 'syndromes'; return; }
    if (l.startsWith('- ')) {
      const val = l.replace(/^- /, '').trim();
      if (section === 'actions') actionsEn.push(val);
      if (section === 'syndromes') syndromesEn.push(val);
    }
  });

  const target = formulas.find(f => {
    const fZh = normalizeZh((f.name_zh || '').replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());
    const fPy = (f.pinyin || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
    return fZh === cleanHeader || fPy === cleanHeader || (fZh && cleanHeader && (fZh.includes(cleanHeader) || cleanHeader.includes(fZh)));
  });

  if (target) {
    if (actionsEn.length) {
      target.actions_en = actionsEn;
      target.actions_zh = actionsEn.map(translateActionClean);
    }
    if (syndromesEn.length) {
      target.ad_syndromes_en = syndromesEn;
      target.pattern_indications_en = syndromesEn;
      target.pattern_indications_zh = syndromesEn.map(translateSyndromeClean);
    }
    updatedCount++;
  }
});

// Clean up ALL formula records
formulas.forEach(f => {
  // Purge any remaining boilerplate
  if (Array.isArray(f.actions_zh)) {
    f.actions_zh = f.actions_zh.map(a => a.replace(/ — 增強本方治效/g, '').replace(/Action: /g, '').trim()).filter(Boolean);
  }
  if (Array.isArray(f.pattern_indications_zh)) {
    f.pattern_indications_zh = f.pattern_indications_zh.map(p => p.replace(/Indication: /g, '').trim()).filter(Boolean);
  }
  // Purge composition hybrid text
  if (Array.isArray(f.composition)) {
    f.composition.forEach(c => {
      if (c.in_formula_en) {
        c.in_formula_zh = translateCompActionClean(c.in_formula_en);
        c.actions_zh = c.in_formula_zh;
        c.role_reason_zh = c.in_formula_zh;
      }
    });
  }
});

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log(`Rebuilt and cleaned all ${formulas.length} formulas in formulas.json.`);
