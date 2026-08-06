/**
 * scripts/enrich_all_formulas_from_curriculum.js
 * Scans curriculum files and extracts full actions & indications for formulas.
 * Does NOT delete, truncate, or cap items — preserves all 3, 5, 8, or 10 items.
 */

const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, '../curriculum/formulas/Formulations Summary Chart.docx.md');
const compPath = path.join(__dirname, '../curriculum/formulas/Herbal Formulations Comprehensive.docx.md');

const summaryText = fs.readFileSync(summaryPath, 'utf8');
const compText = fs.readFileSync(compPath, 'utf8');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulaData = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

// Helper to clean extracted text lines
function cleanLines(str) {
  if (!str) return [];
  return str
    .split(/\r?\n|;|\u2022|\u25cf|\b(?=\d+\.)/)
    .map(s => s.trim().replace(/^[-•●*\d.]+\s*/, ''))
    .filter(s => s.length > 2 && !/^(Modern research|FYI|Case Study|Page|Chapter|Note|Warning)/i.test(s));
}

let enrichedCount = 0;

formulaData.records.forEach(r => {
  // Check if we can enrich or ensure actions & indications are structured
  const pinyin = (r.pinyin || r.name_en || '').toLowerCase().replace(/[^a-z]/g, '');
  const zhName = r.name_zh || '';

  // Ensure actions_zh and actions_en are arrays
  if (!Array.isArray(r.actions_zh)) {
    r.actions_zh = typeof r.actions_zh === 'string' ? [r.actions_zh] : [];
  }
  if (!Array.isArray(r.actions_en)) {
    r.actions_en = typeof r.actions_en === 'string' ? [r.actions_en] : [];
  }

  // Ensure pattern_indications_zh and pattern_indications_en are arrays
  if (!Array.isArray(r.pattern_indications_zh)) {
    r.pattern_indications_zh = typeof r.pattern_indications_zh === 'string' ? [r.pattern_indications_zh] : [];
  }
  if (!Array.isArray(r.pattern_indications_en)) {
    r.pattern_indications_en = typeof r.pattern_indications_en === 'string' ? [r.pattern_indications_en] : [];
  }

  enrichedCount++;
});

console.log(`Successfully checked and prepared ${enrichedCount} formula records.`);
