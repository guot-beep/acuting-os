/**
 * scratch/inspect_pattern_registry_tasks.js
 * Inspects pattern_registry.json for missing name_zh and missing system.
 */

const fs = require('fs');
const path = require('path');

const patternPath = path.join(__dirname, '../data/pathology/pattern_registry.json');
if (fs.existsSync(patternPath)) {
  const patternData = JSON.parse(fs.readFileSync(patternPath, 'utf8'));
  const recs = patternData.records || patternData;
  console.log(`Total pattern records: ${recs.length}`);
  
  const needsName = recs.filter(r => r.needs_name_zh || !r.name_zh);
  console.log(`Patterns needing name_zh: ${needsName.length}`);
  needsName.forEach(n => console.log(` - ${n.id} (${n.name_en || 'no en'})`));

  const needsSystem = recs.filter(r => r.needs_system || !r.system);
  console.log(`\nPatterns needing system: ${needsSystem.length}`);
  needsSystem.forEach(s => console.log(` - ${s.id} (${s.name_zh || s.id})`));
} else {
  console.log('pattern_registry.json does not exist!');
}
