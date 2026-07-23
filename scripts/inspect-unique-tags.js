const fs = require('fs');

const pts = JSON.parse(fs.readFileSync('data/acupoints/361.json', 'utf8'));

const allAcuTags = new Set();
const allIndications = new Set();

pts.forEach(p => {
  (p.acu_tags || []).forEach(t => allAcuTags.add(t.trim()));
  (p.indications_zh || []).forEach(i => allIndications.add(i.trim()));
});

console.log('Unique acu_tags count:', allAcuTags.size);
console.log('Unique indications_zh count:', allIndications.size);

console.log('\n--- Sample acu_tags ---');
console.log(Array.from(allAcuTags).slice(0, 30));

console.log('\n--- Sample indications_zh ---');
console.log(Array.from(allIndications).slice(0, 30));
