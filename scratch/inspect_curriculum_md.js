/**
 * scratch/inspect_curriculum_md.js
 * Inspects headings and format in Formulations Summary Chart.docx.md
 */

const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, '../curriculum/formulas/Formulations Summary Chart.docx.md');
const compPath = path.join(__dirname, '../curriculum/formulas/Herbal Formulations Comprehensive.docx.md');

console.log('--- Summary Chart Sample (first 100 lines) ---');
const summaryContent = fs.readFileSync(summaryPath, 'utf8');
console.log(summaryContent.slice(0, 3000));

console.log('\n--- Comprehensive Sample (first 100 lines) ---');
const compContent = fs.readFileSync(compPath, 'utf8');
console.log(compContent.slice(0, 3000));
