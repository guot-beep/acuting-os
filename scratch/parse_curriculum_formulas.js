/**
 * scratch/parse_curriculum_formulas.js
 * Parses Formulations Summary Chart.docx.md and Herbal Formulations Comprehensive.docx.md
 * to extract actions and indications for all formulas.
 */

const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, '../curriculum/formulas/Formulations Summary Chart.docx.md');
const compPath = path.join(__dirname, '../curriculum/formulas/Herbal Formulations Comprehensive.docx.md');

const summaryText = fs.readFileSync(summaryPath, 'utf8');
const compText = fs.readFileSync(compPath, 'utf8');

// Let's test extracting formulas from summaryText
console.log('Summary Text length:', summaryText.length);
console.log('Comp Text length:', compText.length);

// Let's see all lines matching "Actions:" or "Indications:" in summaryText
const actionsMatches = summaryText.match(/Actions?:[^\n]+/gi) || [];
console.log(`Found ${actionsMatches.length} Actions in Summary Chart`);
console.log('Sample actions:', actionsMatches.slice(0, 10));

const indicationsMatches = summaryText.match(/Indications?:[^\n]+/gi) || [];
console.log(`Found ${indicationsMatches.length} Indications in Summary Chart`);
console.log('Sample indications:', indicationsMatches.slice(0, 10));
