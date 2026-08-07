const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mdActionsPath = path.join(__dirname, '../curriculum/formulas/American_Dragon_201_Formulas_Name_Actions_Syndromes.md');
const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const dictPath = path.join(__dirname, 'exact_366_dict.json');

const mdContent = fs.readFileSync(mdActionsPath, 'utf8');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));
const formulas = formulasData.records || [];
const EXACT_366_DICT = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

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

function translateActionStrict(en) {
  const cleanEn = (en || '').trim();
  if (!cleanEn) return '';
  if (EXACT_366_DICT[cleanEn]) {
    return EXACT_366_DICT[cleanEn];
  }
  throw new Error(`MISSING STRICT TRANSLATION DICTIONARY ENTRY FOR: "${cleanEn}"`);
}

function processBatch(startIndex, count = 10) {
  const blocks = mdContent.split(/^### /m).slice(1);
  const targetBlocks = blocks.slice(startIndex, startIndex + count);
  const report = [];

  targetBlocks.forEach((block, idx) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const header = lines[0]; // e.g. "四君子湯" or "31. 黃連解毒湯"
    const headerTitle = header.replace(/^\d+\.\s*/, '').trim();
    const cleanHeader = normalizeZh(headerTitle.replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());

    let isActions = false;
    const mdActions = [];

    lines.forEach(l => {
      if (l.includes('Formula Actions:')) { isActions = true; return; }
      if (l.includes('Syndromes:')) { isActions = false; return; }
      if (l.startsWith('- ') && isActions) {
        mdActions.push(l.replace(/^- /, '').trim());
      }
    });

    const targetFormula = formulas.find(f => {
      const fZh = normalizeZh((f.name_zh || '').replace(/[^一-龥a-zA-Z]/g, '').toLowerCase());
      const fPy = (f.pinyin || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
      return fZh === cleanHeader || fPy === cleanHeader;
    });

    if (targetFormula) {
      targetFormula.actions_en = mdActions;
      targetFormula.actions_zh = mdActions.map(translateActionStrict);
      if (!targetFormula.field_sources) targetFormula.field_sources = {};
      targetFormula.field_sources.actions_zh = ["American Dragon Formula Index (American_Dragon_201_Formulas_Name_Actions_Syndromes.md, 2026-08-07)"];

      if (targetFormula.english_exam_track) {
        targetFormula.english_exam_track.actions_en = targetFormula.actions_en;
        targetFormula.english_exam_track.actions_zh = targetFormula.actions_zh;
      }

      report.push({
        num: startIndex + idx + 1,
        formula_id: targetFormula.id,
        name_zh: targetFormula.name_zh,
        pinyin: targetFormula.pinyin,
        md_actions_count: mdActions.length,
        actions_en: mdActions,
        actions_zh: targetFormula.actions_zh,
        zero_deletion_check: mdActions.length === targetFormula.actions_zh.length && mdActions.length === targetFormula.actions_en.length
      });
    } else {
      report.push({
        num: startIndex + idx + 1,
        header: headerTitle,
        error: 'Target formula not found in formulas.json'
      });
    }
  });

  fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
  execSync('node scripts/build-data.js', { cwd: path.join(__dirname, '..') });
  return report;
}

const batchIndex = parseInt(process.argv[2] || '0', 10);
const report = processBatch(batchIndex, 10);
console.log(JSON.stringify(report, null, 2));
