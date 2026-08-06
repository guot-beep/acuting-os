/**
 * scratch/inspect_comprehensive_blocks.js
 * Inspects formula blocks in Herbal Formulations Comprehensive.docx.md
 */

const fs = require('fs');
const path = require('path');

const compPath = path.join(__dirname, '../curriculum/formulas/Herbal Formulations Comprehensive.docx.md');
const text = fs.readFileSync(compPath, 'utf8');

// Find occurrences of "Actions" or "Indications" or formula names
const matches = text.match(/(?:Actions|Functions|Indications|Composition|Ingredients):\s*[^\n]+/gi) || [];
console.log('Found matches:', matches.length);
console.log('Sample matches (first 25):', matches.slice(0, 25));
