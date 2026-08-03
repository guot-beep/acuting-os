/**
 * scratch/inspect_knowledge_patterns.js
 */

const fs = require('fs');

const path = 'data/generated/knowledge_data.js';
const code = fs.readFileSync(path, 'utf8');

// evaluate globalThis.ACUTING_KNOWLEDGE
const sandbox = { globalThis: {} };
const fn = new Function('globalThis', code);
fn(sandbox.globalThis);

const K = sandbox.globalThis.ACUTING_KNOWLEDGE;
console.log('K.patternLibrary:', K.patternLibrary ? K.patternLibrary.records.length : 'none');

const liverYang = K.patternLibrary.records.find(r => r.id === 'pattern.liver_yang_rising');
console.log('Found Liver Yang Rising:', liverYang ? liverYang.name_zh : 'NOT FOUND');
