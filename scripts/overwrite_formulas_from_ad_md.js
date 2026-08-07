const fs = require('fs');
const path = require('path');

const mdActionsPath = path.join(__dirname, '../curriculum/formulas/American_Dragon_201_Formulas_Name_Actions_Syndromes.md');
const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');

const mdContent = fs.readFileSync(mdActionsPath, 'utf8');
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

// Full comprehensive translation function for Formula Actions
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
    'Subdues Liver Yang': '平肝潛陽'
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

// Full comprehensive translation function for Syndromes
function translateSyndromeStrict(en) {
  if (!en) return '';

  const exactMap = {
    'Spleen Qi Deficiency': '脾氣虛證',
    'Heart Qi Deficiency': '心氣虛證',
    'Lung and Spleen Qi Deficiency': '肺脾氣虛證',
    'Heart and Lung Qi Deficiency': '心肺氣虛證',
    'Gu Syndrome': '蠱毒/體虛證',
    'Stomach Qi Deficiency': '胃氣虛證',
    'Spleen and Stomach Qi Deficiency with Phlegm-Damp Retention': '脾胃氣虛兼痰濕停聚證',
    'Atrophy disorder (Wei Syndrome) due to Spleen and Stomach Qi Deficiency': '脾胃氣虛所致之痿證',
    'Spleen Qi Deficiency (with Phlegm-Damp and pain)': '脾胃氣虛兼痰濕腹痛證',
    'Stomach Cold': '胃寒證',
    'Dampness due to Spleen Qi Deficiency': '脾虛濕阻證',
    'Central Qi Sinking': '中氣下陷證',
    'Spleen Not Governing Blood': '脾不統血證',
    'Spleen and Lung Qi Deficiency: Yin Fire due to Spleen and Lung Qi Deficiency': '肺脾氣虛兼陰火證',
    'Spontaneous sweating due to Qi Deficiency': '氣虛自汗證',
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
    'Heat lurking in the Yin aspects of the body (usually due to later stages of a Warm-Heat pathogen)': '溫病後期邪伏陰分證',
    'Deficiency Heat with steaming bone disorder': '陰虛骨蒸勞熱證',
    'Liver Wind Stirring Internally': '肝風內動證',
    'Liver Yang Rising': '肝陽上亢證',
    'Phlegm-Heat Obstructing the Heart Orifices': '痰熱蒙蔽心竅證',
    'Heart Blood Deficiency': '心血虛證',
    'Liver Blood Deficiency': '肝血虛證',
    'Restless Organ Syndrome': '臟躁證',
    'Dry Organ disorder': '臟躁乾澀證'
  };

  if (exactMap[en]) return exactMap[en];

  let t = en
    .replace(/due to/gi, '所致之')
    .replace(/with/gi, '兼')
    .replace(/and/gi, '與')
    .replace(/or/gi, '或')
    .replace(/Deficiency/gi, '虛')
    .replace(/Stagnation/gi, '鬱結')
    .replace(/Stasis/gi, '瘀')
    .replace(/Retention/gi, '停聚')
    .replace(/Invasion/gi, '侵襲')
    .replace(/Syndrome/gi, '證')
    .replace(/disorder/gi, '疾')
    .replace(/disease/gi, '病')
    .replace(/Spleen/gi, '脾').replace(/Stomach/gi, '胃').replace(/Heart/gi, '心')
    .replace(/Lung/gi, '肺').replace(/Kidney/gi, '腎').replace(/Liver/gi, '肝')
    .replace(/Gallbladder/gi, '膽').replace(/Blood/gi, '血').replace(/Qi/gi, '氣')
    .replace(/Yin/gi, '陰').replace(/Yang/gi, '陽').replace(/Damp-Heat/gi, '濕熱')
    .replace(/Dampness/gi, '濕').replace(/Damp/gi, '濕').replace(/Heat/gi, '熱')
    .replace(/Cold/gi, '寒').replace(/Phlegm/gi, '痰').replace(/Wind/gi, '風')
    .replace(/Fire/gi, '火').replace(/the/gi, '').replace(/of/gi, '')
    .replace(/body/gi, '體').replace(/usually/gi, '').replace(/later stages/gi, '後期')
    .replace(/Warm-Heat/gi, '溫熱').replace(/pathogen/gi, '邪').replace(/lurking/gi, '伏')
    .replace(/aspects/gi, '');

  let cleaned = t.replace(/\s+/g, '').replace(/[()]/g, '').trim();
  if (!cleaned.endsWith('證')) cleaned += '證';
  return cleaned;
}

// Ingest MD Actions & Syndromes
const blocks = mdContent.split(/^### /m).slice(1);
let overwrittenCount = 0;

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
    // 100% OVERWRITE
    target.actions_en = actionsEn;
    target.actions_zh = actionsEn.map(translateActionStrict);

    target.ad_syndromes_en = syndromesEn;
    target.pattern_indications_en = syndromesEn;
    target.pattern_indications_zh = syndromesEn.map(translateSyndromeStrict);
    target.pattern_focus_en = syndromesEn.slice(0, 3);

    if (!target.field_sources) target.field_sources = {};
    target.field_sources.actions_zh = ["American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)"];
    target.field_sources.pattern_indications_zh = ["American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)"];
    overwrittenCount++;
  }
});

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log(`Successfully overwritten Actions and Syndromes for ${overwrittenCount} / ${blocks.length} formulas in formulas.json.`);
