/**
 * scratch/audit_formula_status.js
 * Audits the current state of formulas in AcuTing OS
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/formulas/formulas.json');
let formulas = [];

if (fs.existsSync(formulaPath)) {
  const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));
  formulas = data.records || data.formulas || data;
} else {
  // Try reading from generated knowledge_data.js
  const code = fs.readFileSync(path.join(__dirname, '../data/generated/knowledge_data.js'), 'utf8');
  const sandbox = { globalThis: {} };
  new Function('globalThis', code)(sandbox.globalThis);
  formulas = sandbox.globalThis.ACUTING_KNOWLEDGE?.formulas?.records || [];
}

console.log(`Total formulas found: ${formulas.length}`);

// Function to check if a formula is "Gold-Standard" level (like Ma Huang Tang & Gui Zhi Tang)
function checkGoldStandard(f) {
  const hasZhName = !!f.name_zh;
  const hasEnName = !!f.name_en;
  const hasPinyin = !!(f.pinyin || f.name_pinyin);
  const hasCategory = !!(f.category || f.category_zh);
  const hasSource = !!(f.source || f.source_zh || f.sources?.length);

  // Check composition roles (Jun Chen Zuo Shi)
  const comp = f.composition || f.herbs || [];
  const hasCompositionRoles = comp.length > 0 && comp.some(h => h.role || h.role_zh || h.function_zh);

  // Check functions & indications
  const hasFunctions = !!(f.actions_zh || f.functions_zh || f.actions || f.functions);
  const hasIndications = !!(f.indications_zh || f.indications || f.clinical_applications_zh);

  // Check song / verse
  const hasSong = !!(f.song_zh || f.verse_zh || f.fang_ge);

  // Check cautions
  const hasCautions = !!(f.cautions_zh || f.contraindications_zh || f.cautions);

  // Score
  let score = 0;
  if (hasZhName && hasEnName && hasPinyin) score += 20;
  if (hasCategory && hasSource) score += 15;
  if (hasCompositionRoles) score += 25;
  if (hasFunctions && hasIndications) score += 20;
  if (hasSong) score += 10;
  if (hasCautions) score += 10;

  return {
    id: f.id,
    name_zh: f.name_zh,
    name_en: f.name_en,
    score,
    isGold: score >= 90,
    hasCompositionRoles,
    hasFunctions,
    hasIndications,
    hasSong,
    hasCautions
  };
}

const audited = formulas.map(checkGoldStandard);
const goldList = audited.filter(a => a.isGold);
const nonGoldList = audited.filter(a => !a.isGold);

console.log(`\nGold-Standard Formulas (${goldList.length}):`);
goldList.forEach(g => console.log(` - ${g.id} (${g.name_zh} / ${g.name_en}) [Score: ${g.score}]`));

console.log(`\nSample Non-Gold Formulas (${nonGoldList.length} total):`);
nonGoldList.slice(0, 15).forEach(g => console.log(` - ${g.id} (${g.name_zh} / ${g.name_en}) [Score: ${g.score}] Roles:${g.hasCompositionRoles} Func:${g.hasFunctions} Song:${g.hasSong}`));

// Specific check on Xiao Qing Long Tang
const xiaoQingLong = audited.find(a => a.id === 'formula.xiao_qing_long_tang' || a.name_zh === '小青龍湯');
console.log(`\nXiao Qing Long Tang Audit:`, xiaoQingLong || 'NOT FOUND');
if (xiaoQingLong) {
  const rawXQL = formulas.find(f => f.id === xiaoQingLong.id || f.name_zh === '小青龍湯');
  console.log(JSON.stringify(rawXQL, null, 2));
}
