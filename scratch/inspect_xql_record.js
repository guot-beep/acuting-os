/**
 * scratch/inspect_xql_record.js
 * Inspects formula.xiao_qing_long_tang in formulas.json
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

const record = data.records.find(r => r.id === 'formula.xiao_qing_long_tang');
console.log(JSON.stringify(record, null, 2));
