const fs = require('fs');
const path = require('path');

const outlineText = fs.readFileSync(path.join(__dirname, '../curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.md'), 'utf8');

const lines = outlineText.split('\n');
let appCStart = -1;
let appCEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Appendix C.') && lines[i].includes('Formulas')) {
    if (appCStart === -1) appCStart = i;
  }
  if (appCStart !== -1 && (lines[i].includes('Appendix D') || lines[i].includes('Bibliography'))) {
    appCEnd = i;
    break;
  }
}

if (appCEnd === -1) appCEnd = lines.length;

console.log(`Appendix C spans lines ${appCStart} to ${appCEnd}`);

const cLines = lines.slice(appCStart, appCEnd);
const textBlock = cLines.join('\n');

// Find all items in Appendix C
// Standard NCCAOM formula format: Pinyin (Pin Yin) or Pinyin Tang, etc.
fs.writeFileSync(path.join(__dirname, '../data/formulas/appendix_c_extracted_lines.txt'), textBlock, 'utf8');
console.log('Saved extracted Appendix C text block.');
