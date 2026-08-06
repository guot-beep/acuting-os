/**
 * scratch/find_all_boilerplate_formulas.js
 * Scans formulas.json for any formula containing boilerplate string placeholders
 * like "經典功用與條文", "主治證型", "Actions of", "Indication:", "Action:"
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulaData = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

const badFormulas = [];

formulaData.records.forEach(r => {
  const isBadAct = (r.actions_zh || []).some(a => /經典功用|主治證型|功用：Action/i.test(a)) ||
                   (r.actions_en || []).some(a => /Actions of|Action: Action/i.test(a));
  const isBadInd = (r.pattern_indications_zh || []).some(i => /主治證型|主治：Indication/i.test(i)) ||
                   (r.pattern_indications_en || []).some(i => /Pattern Indications of|Indication: Indication/i.test(i));

  if (isBadAct || isBadInd) {
    badFormulas.push({
      id: r.id,
      name_zh: r.name_zh,
      name_en: r.name_en,
      actions_zh: r.actions_zh,
      actions_en: r.actions_en,
      pattern_indications_zh: r.pattern_indications_zh,
      pattern_indications_en: r.pattern_indications_en
    });
  }
});

console.log(`Found ${badFormulas.length} formulas with boilerplate placeholder text:`);
badFormulas.forEach(b => {
  console.log(`- ${b.id} (${b.name_zh} / ${b.name_en})`);
});
