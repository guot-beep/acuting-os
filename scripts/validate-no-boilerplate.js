/**
 * scripts/validate-no-boilerplate.js
 * Mandatory validation check preventing any placeholder/boilerplate text in formulas.json.
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulaData = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

const badPatterns = [
  /經典功用/i,
  /主治證型/i,
  /功用：Action/i,
  /Actions of/i,
  /Action: Action/i,
  /Pattern Indications of/i,
  /Indication: Indication/i,
  /待補 \/ Content pending/i
];

let defects = 0;

formulaData.records.forEach(r => {
  const fieldsToCheck = [
    ...(r.actions_zh || []),
    ...(r.actions_en || []),
    ...(r.pattern_indications_zh || []),
    ...(r.pattern_indications_en || [])
  ];

  fieldsToCheck.forEach(text => {
    badPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        console.error(`❌ Boilerplate defect in formula [${r.id}]: "${text}" matches ${pattern}`);
        defects++;
      }
    });
  });
});

if (defects > 0) {
  console.error(`\n❌ Total boilerplate defects: ${defects}`);
  process.exit(1);
} else {
  console.log('✅ Mandatory check passed: 0 boilerplate or placeholder strings found in all 201 formulas.');
}
