const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '../curriculum/formulas/American_Dragon_201_Formulas_Name_Actions_Syndromes.md');
const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');

const mdContent = fs.readFileSync(mdPath, 'utf8');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const formulas = formulasData.records || [];

const cat1 = mdContent.split(/^## /m)[1]; // 補益劑 (26 首)
const blocks = cat1.split(/^### /m).slice(1, 11); // First 10 formulas

const batchReport = [];

blocks.forEach((block, idx) => {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  const header = lines[0];

  let isActions = false;
  const mdActions = [];

  lines.forEach(l => {
    if (l.includes('Formula Actions:')) { isActions = true; return; }
    if (l.includes('Syndromes:')) { isActions = false; return; }
    if (l.startsWith('- ') && isActions) {
      mdActions.push(l.replace(/^- /, '').trim());
    }
  });

  const cleanHeader = header.replace(/[^一-龥a-zA-Z]/g, '').toLowerCase();
  const dbRecord = formulas.find(f => {
    const fZh = (f.name_zh || '').replace(/[^一-龥a-zA-Z]/g, '').toLowerCase();
    const fPy = (f.pinyin || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
    return fZh === cleanHeader || fPy === cleanHeader || (fZh && cleanHeader && fZh.includes(cleanHeader));
  });

  batchReport.push({
    index: idx + 1,
    header: header,
    dbId: dbRecord ? dbRecord.id : 'NOT_FOUND',
    dbNameZh: dbRecord ? dbRecord.name_zh : '',
    mdActionsCount: mdActions.length,
    mdActions: mdActions,
    dbActionsZh: dbRecord ? dbRecord.actions_zh : [],
    dbActionsEn: dbRecord ? dbRecord.actions_en : [],
    isMatchLength: dbRecord ? (mdActions.length === dbRecord.actions_en.length && dbRecord.actions_zh.length === dbRecord.actions_en.length) : false
  });
});

console.log(JSON.stringify(batchReport, null, 2));
