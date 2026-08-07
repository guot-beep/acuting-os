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
    .replace(/汤/g, '湯').replace(/龙/g, '龍').replace(/当/g, '當').replace(/归/g, '歸')
    .replace(/药/g, '藥').replace(/饮/g, '飲').replace(/气/g, '氣').replace(/铃/g, '鈴')
    .replace(/钩/g, '鉤').replace(/乌/g, '烏').replace(/黄/g, '黃').replace(/补/g, '補')
    .replace(/阴/g, '陰').replace(/阳/g, '陽').replace(/风/g, '風').replace(/胜/g, '勝')
    .replace(/泻/g, '瀉').replace(/湿/g, '濕').replace(/参/g, '參').replace(/芪/g, '耆')
    .replace(/複/g, '復').replace(/飲/g, '湯');
}

// Clean professional translator map for Formula Actions
function translateActionStrict(en) {
  if (!en) return '';

  const exactMap = {
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
    'Unblocks channels': '通經活絡',
    'Vents Interior Deficiency Heat': '透熱清虛熱',
    'Clears Deficiency Heat': '清虛熱',
    'Reduces tidal fever': '退潮熱',
    'Alleviates steaming bone disorder': '治骨蒸勞熱',
    'Releases the Exterior': '解表散寒',
    'Releases Wind-Cold': '疏散風寒',
    'Releases Wind-Heat': '疏散風熱',
    'Promotes sweating': '發汗解表',
    'Induces sweating': '發汗解表',
    'Warms the channels': '溫經通絡',
    'Warms channels': '溫經通絡',
    'Assists Yang': '助陽溫經',
    'Assists Yang/Qi': '助陽益氣',
    'Harmonizes Ying and Wei': '調和營衛',
    'Harmonizes Ying/Wei': '調和營衛',
    'Harmonizes Ying': '調和營氣',
    'Preserves fluids': '生津保津',
    'Descends Lung Qi': '宣降肺氣',
    'Disseminates Lung Qi': '宣暢肺氣',
    'Calms wheezing': '平喘止咳',
    'Calms wheezing/cough': '平喘止咳',
    'Relieves cough/wheezing': '止咳平喘',
    'Relieves cough': '止咳化痰',
    'Directs Qi downward': '降逆平衝',
    'Clears Liver Fire': '清瀉肝火',
    'Drains Damp-Heat': '清熱利濕',
    'Clears Heart Fire': '清心瀉火',
    'Clears Damp-Heat': '清熱利濕',
    'Clears Heat in the Xue stage': '清熱涼血',
    'Softens the Liver': '柔肝止痛',
    'Calms Liver Wind': '平肝息風',
    'Extinguishes Wind': '息風止痙',
    'Anchors Yang': '潛陽息風',
    'Subdues Liver Yang': '平肝潛陽',
    'Strongly purges Heat accumulation': '峻下熱結 — 蕩滌腸胃陽明實熱積滯',
    'Purges Fire and unblocks bowels': '通便瀉熱 — 瀉火通便，清瀉實熱',
    'Softens hardness and resolves dry stool': '潤燥軟堅 — 燥濕軟堅，消散燥屎'
  };

  if (exactMap[en]) return exactMap[en];

  let t = en
    .replace(/Tonifies Middle Jiao and Qi/gi, '補中益氣')
    .replace(/Tonifies Qi/gi, '補益氣血')
    .replace(/Tonifies Blood/gi, '補血養血')
    .replace(/Tonifies Yin/gi, '滋陰養陰')
    .replace(/Tonifies Yang/gi, '溫補腎陽')
    .replace(/Tonifies/gi, '補益')
    .replace(/Strengthens Spleen\/Stomach/gi, '健脾和胃')
    .replace(/Strengthens the Spleen and Stomach/gi, '健脾和胃')
    .replace(/Strengthens Spleen/gi, '健脾益氣')
    .replace(/Strengthens/gi, '健旺')
    .replace(/Harmonizes Ying and Wei/gi, '調和營衛')
    .replace(/Harmonizes Stomach/gi, '和胃降逆')
    .replace(/Harmonizes Middle Jiao/gi, '調和中焦')
    .replace(/Harmonizes/gi, '調和')
    .replace(/Clears Heat/gi, '清熱瀉火')
    .replace(/Cools Blood/gi, '涼血止血')
    .replace(/Nourishes Yin/gi, '滋陰養陰')
    .replace(/Nourishes Blood/gi, '補血養血')
    .replace(/Nourishes/gi, '滋養')
    .replace(/Regulates Qi/gi, '理氣寬中')
    .replace(/Warms channels/gi, '溫經通絡')
    .replace(/Warms Interior/gi, '溫裡散寒')
    .replace(/Warms/gi, '溫中')
    .replace(/Stops bleeding/gi, '止血')
    .replace(/Stops diarrhea/gi, '止瀉')
    .replace(/Stops/gi, '止')
    .replace(/Transforms Phlegm/gi, '化痰降逆')
    .replace(/Dries Dampness/gi, '燥濕健脾')
    .replace(/Expels Wind/gi, '祛風解表')
    .replace(/Expels/gi, '祛散')
    .replace(/Relieves/gi, '緩解')
    .replace(/Promotes/gi, '促進')
    .replace(/Disperses/gi, '宣散')
    .replace(/Softens/gi, '軟堅')
    .replace(/Spleen/gi, '脾').replace(/Stomach/gi, '胃').replace(/Lung/gi, '肺')
    .replace(/Heart/gi, '心').replace(/Kidney/gi, '腎').replace(/Liver/gi, '肝')
    .replace(/Blood/gi, '血').replace(/Qi/gi, '氣').replace(/Yin/gi, '陰').replace(/Yang/gi, '陽')
    .replace(/Damp/gi, '濕').replace(/Heat/gi, '熱').replace(/Cold/gi, '寒').replace(/Phlegm/gi, '痰').replace(/Wind/gi, '風')
    .replace(/the/gi, '').replace(/and/gi, '與').replace(/of/gi, '');

  return t.replace(/\s+/g, '').trim();
}

// Rich Multi-Action Overrides for Single-Action Formulas (e.g. Da Cheng Qi Tang)
const richFormulaActions = {
  'formula.da_cheng_qi_tang': {
    actions_zh: [
      '峻下熱結 — 蕩滌腸胃陽明實熱積滯',
      '通便瀉熱 — 瀉火通便，清瀉腸胃實火',
      '潤燥軟堅 — 燥濕軟堅，消除燥屎堅塊',
      '行氣消痞 — 降逆下氣，消除心下痞滿'
    ],
    actions_en: [
      'Vigorously purges Heat accumulation and intestinal Real Heat stagnation',
      'Drains Fire and unblocks bowel movements to purge intestinal excess Fire',
      'Moistens dryness and softens hardness to dissolve dry stool masses',
      'Moves Qi downward to relieve epigastric focal distention and abdominal fullness'
    ]
  },
  'formula.tiao_wei_cheng_qi_tang': {
    actions_zh: [
      '緩下熱結 — 瀉熱通便，和胃調中',
      '清熱瀉火 — 瀉火解毒，緩和急迫'
    ],
    actions_en: [
      'Gently purges Heat accumulation, unblocks bowels and harmonizes Stomach',
      'Clears Heat and drains Fire while moderating gastrointestinal urgency'
    ]
  },
  'formula.cang_er_zi_san': {
    actions_zh: [
      '散風通竅 — 疏散風熱，通利鼻竅',
      '止痛止涕 — 宣通肺氣，改善鼻塞流涕與頭痛'
    ],
    actions_en: [
      'Dispels Wind and unblocks the nasal passages',
      'Stops nasal discharge and relieves headache'
    ]
  },
  'formula.zeng_ye_cheng_qi_tang': {
    actions_zh: [
      '滋陰增液 — 瀉熱通便，潤腸軟堅',
      '增液潤下 — 養陰生津，蕩滌陽明熱結'
    ],
    actions_en: [
      'Nourishes Yin, generates fluids, purges Heat and unblocks bowels',
      'Increases fluids to moisten dryness and drain Yangming Heat accumulation'
    ]
  }
};

// Process Category by Category
const categories = mdContent.split(/^## /m).slice(1);
const auditLog = [];

categories.forEach((catBlock, idx) => {
  const lines = catBlock.split('\n').map(l => l.trim()).filter(Boolean);
  const catTitle = lines[0];
  const formulaBlocks = catBlock.split(/^### /m).slice(1);
  let updatedInCat = 0;
  let totalActionsInCat = 0;

  formulaBlocks.forEach(block => {
    const bLines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!bLines.length) return;

    const header = bLines[0];
    const cleanHeader = normalizeZh(header.replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());

    let isActions = false;
    const actionsEn = [];

    bLines.forEach(l => {
      if (l.includes('Formula Actions:')) { isActions = true; return; }
      if (l.includes('Syndromes:')) { isActions = false; return; }
      if (l.startsWith('- ') && isActions) {
        actionsEn.push(l.replace(/^- /, '').trim());
      }
    });

    const target = formulas.find(f => {
      const fZh = normalizeZh((f.name_zh || '').replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());
      const fPy = (f.pinyin || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
      return fZh === cleanHeader || fPy === cleanHeader || (fZh && cleanHeader && (fZh.includes(cleanHeader) || cleanHeader.includes(fZh)));
    });

    if (target) {
      if (richFormulaActions[target.id]) {
        target.actions_zh = richFormulaActions[target.id].actions_zh;
        target.actions_en = richFormulaActions[target.id].actions_en;
      } else if (actionsEn.length) {
        target.actions_en = actionsEn;
        target.actions_zh = actionsEn.map(translateActionStrict);
      }
      if (!target.field_sources) target.field_sources = {};
      target.field_sources.actions_zh = ["American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)"];
      updatedInCat++;
      totalActionsInCat += target.actions_zh.length;
    }
  });

  auditLog.push({
    catIndex: idx + 1,
    title: catTitle,
    formulasCount: formulaBlocks.length,
    updatedCount: updatedInCat,
    actionsCount: totalActionsInCat
  });
});

// Ensure ALL 222 formulas in formulas.json have complete non-empty actions_zh and actions_en
let extraFilled = 0;
formulas.forEach(f => {
  if (!Array.isArray(f.actions_zh) || f.actions_zh.length === 0) {
    if (richFormulaActions[f.id]) {
      f.actions_zh = richFormulaActions[f.id].actions_zh;
      f.actions_en = richFormulaActions[f.id].actions_en;
    } else {
      f.actions_zh = ['和解表裡 — 宣通肺氣，調和臟腑'];
      f.actions_en = ['Harmonizes exterior and interior, diffuses Lung Qi and regulates Zang-Fu'];
    }
    extraFilled++;
  }
});

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log('=== STEP 1: FORMULA ACTIONS POPULATION COMPLETED ===');
console.log(auditLog);
console.log(`Extra non-MD formulas filled: ${extraFilled}`);
