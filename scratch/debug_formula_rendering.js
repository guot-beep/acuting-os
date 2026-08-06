/**
 * scratch/debug_formula_rendering.js
 * Checks if formulas.json or knowledge_data.js has any syntax error, invalid JSON,
 * missing required fields, or unescaped characters.
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const knowledgeJsPath = path.join(__dirname, '../data/generated/knowledge_data.js');

try {
  const rawFormulas = fs.readFileSync(formulaPath, 'utf8');
  const parsed = JSON.parse(rawFormulas);
  console.log(`formulas.json is VALID JSON. Total records: ${parsed.records.length}`);

  // Check if any record is null or missing id
  const badRecords = parsed.records.filter((r, idx) => !r || typeof r !== 'object' || !r.id);
  console.log(`Bad records count: ${badRecords.length}`);

  // Check knowledge_data.js execution
  const jsContent = fs.readFileSync(knowledgeJsPath, 'utf8');
  const sandbox = { globalThis: {} };
  new Function('globalThis', jsContent)(sandbox.globalThis);
  const kFormulas = sandbox.globalThis.ACUTING_KNOWLEDGE?.formulas?.records;
  console.log(`knowledge_data.js loaded successfully. Total formulas in ACUTING_KNOWLEDGE: ${kFormulas?.length}`);

} catch (err) {
  console.error('ERROR IN DEBUG:', err);
}
