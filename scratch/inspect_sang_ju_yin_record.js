/**
 * scratch/inspect_sang_ju_yin_record.js
 * Inspects all URL fields on formula.sang_ju_yin in data/herbs/formulas.json
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

const sjy = data.records.find(r => r.id === 'formula.sang_ju_yin');
console.log('formula.sang_ju_yin record in formulas.json:');
console.log('  cloudtcm_url:', sjy?.cloudtcm_url);
console.log('  american_dragon_url:', sjy?.american_dragon_url);
console.log('  source_urls:', sjy?.source_urls);
console.log('  external_links:', sjy?.external_links);

const kPath = path.join(__dirname, '../data/generated/knowledge_data.js');
const kContent = fs.readFileSync(kPath, 'utf8');
const sandbox = { globalThis: {} };
new Function('globalThis', kContent)(sandbox.globalThis);
const kSjy = sandbox.globalThis.ACUTING_KNOWLEDGE?.formulas?.records?.find(r => r.id === 'formula.sang_ju_yin');
console.log('\nformula.sang_ju_yin record in knowledge_data.js:');
console.log('  cloudtcm_url:', kSjy?.cloudtcm_url);
console.log('  american_dragon_url:', kSjy?.american_dragon_url);
console.log('  source_urls:', kSjy?.source_urls);
