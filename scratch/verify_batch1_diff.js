/**
 * scratch/verify_batch1_diff.js
 * Automated inspection and verification of Batch 1 formulas
 */

const fs = require('fs');
const path = require('path');

const refDir = path.join(__dirname, '../data/herbs/reference');
const targets = ['formula.yin_qiao_san', 'formula.sang_ju_yin', 'formula.bai_hu_tang'];

targets.forEach(id => {
  const filePath = path.join(refDir, `${id}.json`);
  console.log(`\n=================== Checking ${id} ===================`);
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: Reference file ${filePath} missing!`);
    return;
  }
  const f = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log(`Name: ${f.name_zh} (${f.name_en})`);
  console.log(`Category: ${f.category_zh} / ${f.category_en}`);
  console.log(`Actions count: ZH=${f.actions_zh?.length}, EN=${f.actions_en?.length}`);
  console.log(`Indications count: ${f.indications?.length}`);
  console.log(`Composition herbs count: ${f.composition?.length}`);
  const rolesMissing = f.composition.filter(c => !c.role_zh || !c.dose_g);
  console.log(`Composition herbs missing role/dose: ${rolesMissing.length}`);
  console.log(`Key pairs count: ${f.key_pairs?.length}`);
  console.log(`Formula family count: ${f.formula_family?.length || 0}`);
  console.log(`Formula song: ${f.formula_song ? 'YES' : 'NO'}`);
  console.log(`Modifications count: ${f.modifications?.length}`);
  console.log(`Comparisons count: ${f.comparisons?.length}`);
  console.log(`Contraindications count: ${f.contraindications_zh?.length}`);
  console.log(`CloudTCM URL: ${f.external_links?.find(l => l.source_id === 'cloudtcm')?.url || 'MISSING'}`);
  console.log(`American Dragon URL: ${f.external_links?.find(l => l.source_id === 'american_dragon')?.url || 'MISSING'}`);
  console.log(`Exam Pearl: ${f.exam_pearl ? 'YES' : 'NO'}`);
});
