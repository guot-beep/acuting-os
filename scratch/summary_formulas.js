/**
 * scratch/summary_formulas.js
 * Audits all formulas in data/herbs/formulas.json and data/herbs/reference/
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const refDir = path.join(__dirname, '../data/herbs/reference');

const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));
const formulas = data.records || data.formulas || data;

console.log(`Total formulas in data/herbs/formulas.json: ${formulas.length}`);

// Check which formulas have individual enriched reference files in data/herbs/reference/
const refFiles = fs.existsSync(refDir) ? fs.readdirSync(refDir).filter(f => f.startsWith('formula.')) : [];
console.log(`Enriched formula reference files found: ${refFiles.length}`);

const goldStandardList = [];
const highQualityList = [];
const needsWorkList = [];

formulas.forEach(f => {
  const refFile = path.join(refDir, `${f.id}.json`);
  let fullRecord = f;
  let hasRefFile = false;
  if (fs.existsSync(refFile)) {
    hasRefFile = true;
    fullRecord = Object.assign({}, f, JSON.parse(fs.readFileSync(refFile, 'utf8')));
  }

  const comp = fullRecord.composition || fullRecord.herbs || [];
  const hasJunChenZuoShi = comp.length > 0 && comp.every(h => h.role || h.role_zh);
  const hasFangYi = !!(fullRecord.fang_yi_zh || fullRecord.explanation_zh || fullRecord.analysis_zh);
  const hasSong = !!(fullRecord.formula_song || fullRecord.song_zh || fullRecord.verse_zh);
  const hasIndications = !!(fullRecord.indications && fullRecord.indications.length > 0);
  const hasModifications = !!(fullRecord.modifications && fullRecord.modifications.length > 0);
  const hasComparisons = !!(fullRecord.comparisons && fullRecord.comparisons.length > 0);
  const hasCautions = !!(fullRecord.cautions_zh || fullRecord.contraindications_zh || fullRecord.cautions?.length);
  const hasModernApps = !!(fullRecord.modern_applications_zh || fullRecord.applications_zh?.length);

  // Criteria for Gold-Standard: Has Jun Chen Zuo Shi on ALL herbs, Fang Yi, Song, Indications, Modifications, Comparisons, Cautions, Modern Apps
  if (hasJunChenZuoShi && hasFangYi && hasSong && hasIndications && hasCautions) {
    goldStandardList.push({
      id: f.id,
      name_zh: f.name_zh,
      name_en: f.name_en,
      hasRefFile,
      hasModifications,
      hasComparisons
    });
  } else if (hasRefFile) {
    highQualityList.push({
      id: f.id,
      name_zh: f.name_zh,
      name_en: f.name_en,
      missing: [
        !hasJunChenZuoShi ? 'composition roles (君臣佐使)' : null,
        !hasFangYi ? 'fang yi (方義)' : null,
        !hasSong ? 'song (方歌)' : null,
        !hasIndications ? 'indications (適應症)' : null,
        !hasCautions ? 'cautions (禁忌)' : null
      ].filter(Boolean)
    });
  } else {
    needsWorkList.push({
      id: f.id,
      name_zh: f.name_zh,
      name_en: f.name_en
    });
  }
});

console.log(`\n==================================================`);
console.log(`🏆 Gold-Standard Formulas (${goldStandardList.length} total):`);
goldStandardList.forEach(g => console.log(`  - ${g.id} (${g.name_zh} · ${g.name_en})`));

console.log(`\n==================================================`);
console.log(`🥈 High-Quality / Partial Reference Formulas (${highQualityList.length} total):`);
highQualityList.forEach(g => console.log(`  - ${g.id} (${g.name_zh}) missing: [${g.missing.join(', ')}]`));

console.log(`\n==================================================`);
console.log(`📝 Basic / Needs Enriched Reference File (${needsWorkList.length} total)`);
console.log(`  (Sample of first 20: ${needsWorkList.slice(0, 20).map(n => n.name_zh).join('、')})`);

// Specific check on Xiao Qing Long Tang
console.log(`\n==================================================`);
console.log(`🔍 Specific Audit: 小青龍湯 (formula.xiao_qing_long_tang):`);
const xqlRefFile = path.join(refDir, 'formula.xiao_qing_long_tang.json');
if (fs.existsSync(xqlRefFile)) {
  const xql = JSON.parse(fs.readFileSync(xqlRefFile, 'utf8'));
  console.log(`  Name: ${xql.name_zh} (${xql.name_en})`);
  console.log(`  Formula Song (方歌): ${xql.formula_song || 'MISSING'}`);
  console.log(`  Composition Herbs (${xql.composition?.length || 0}):`);
  xql.composition?.forEach(h => console.log(`    - ${h.name_zh} (${h.role_zh || 'NO ROLE'}) ${h.dosage_zh || ''} : ${h.action_zh || ''}`));
  console.log(`  Fang Yi (方義): ${xql.fang_yi_zh ? xql.fang_yi_zh.substring(0, 60) + '...' : 'MISSING'}`);
  console.log(`  Cautions/Contraindications: ${xql.cautions_zh ? xql.cautions_zh.substring(0, 60) + '...' : 'MISSING'}`);
} else {
  console.log(`  No reference file found for formula.xiao_qing_long_tang!`);
}
