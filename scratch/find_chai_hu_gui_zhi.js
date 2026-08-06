/**
 * scratch/find_chai_hu_gui_zhi.js
 * Searches for Chai Hu Gui Zhi Tang in curriculum files and prints its exact actions and indications.
 */

const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, '../curriculum/formulas/Formulations Summary Chart.docx.md');
const compPath = path.join(__dirname, '../curriculum/formulas/Herbal Formulations Comprehensive.docx.md');

const summaryText = fs.readFileSync(summaryPath, 'utf8');
const compText = fs.readFileSync(compPath, 'utf8');

console.log('--- Matching in Summary Chart ---');
summaryText.split(/\r?\n/).forEach((line, idx) => {
  if (/chai hu gui zhi|柴胡桂枝/i.test(line)) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});

console.log('--- Matching in Comprehensive ---');
compText.split(/\r?\n/).forEach((line, idx) => {
  if (/chai hu gui zhi|柴胡桂枝/i.test(line)) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});
