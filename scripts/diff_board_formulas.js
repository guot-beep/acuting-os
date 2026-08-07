const fs = require('fs');
const path = require('path');

const outlineText = fs.readFileSync(path.join(__dirname, '../curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.md'), 'utf8');

// Find Appendix C
const lines = outlineText.split('\n');
let inFormulaList = false;
const rawBoardFormulas = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.includes('Appendix C') && line.includes('Formulas')) {
    inFormulaList = true;
    continue;
  }
  if (inFormulaList) {
    if (line.includes('Appendix D') || line.includes('Bibliography')) {
      // End of Appendix C
      // But keep scanning if needed
    }
    // Match lines that look like formula entries
    // Usually Pinyin followed by English translation or Chinese name
    if (line.length > 0) {
      rawBoardFormulas.push(line);
    }
  }
}

const formulasJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/herbs/formulas.json'), 'utf8'));
const recs = formulasJson.records || [];

console.log('Total local formulas in formulas.json:', recs.length);

// Check exam_importance field in local records
const officialBoardTagged = recs.filter(r => r.exam_importance && r.exam_importance.includes('Appendix C 官方應試方劑'));
const nonBoardTagged = recs.filter(r => r.exam_importance && r.exam_importance.includes('非 NCBAHM'));
const otherTagged = recs.filter(r => !officialBoardTagged.includes(r) && !nonBoardTagged.includes(r));

console.log('Official Appendix C Tagged in local data:', officialBoardTagged.length);
console.log('Non-Board Tagged in local data:', nonBoardTagged.length);
console.log('Other / Unmarked in local data:', otherTagged.length);

if (otherTagged.length > 0) {
  console.log('Other tagged records:', otherTagged.map(r => `${r.id}: ${r.name_zh} / ${r.pinyin}`));
}
