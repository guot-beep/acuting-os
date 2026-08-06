/**
 * scratch/audit_formula_candidates.js
 * Read-only audit to identify candidate formulas for restoration.
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));
const formulas = data.records || data.formulas || data;

// Read curriculum content files to check availability
const curriculumFiles = [
  path.join(__dirname, '../curriculum/formulas/Herbal Formulations Comprehensive.docx.md'),
  path.join(__dirname, '../curriculum/formulas/Formulations Summary Chart.docx.md'),
  path.join(__dirname, '../curriculum/formulas/Formulas That Tonify 补益剂.md'),
  path.join(__dirname, '../curriculum/formulas/Formulas That Treat Both Exterior & Interior 表里双解剂.md'),
  path.join(__dirname, '../curriculum/formulas/Dui-Yao-.md')
];

let curriculumCombined = '';
curriculumFiles.forEach(file => {
  if (fs.existsSync(file)) {
    curriculumCombined += fs.readFileSync(file, 'utf8') + '\n\n';
  }
});

// Protected formulas (Gold Standard / Refined)
const protectedIds = new Set([
  'formula.ma_huang_tang',
  'formula.gui_zhi_tang',
  'formula.xiao_qing_long_tang',
  'formula.ge_gen_tang',
  'formula.xiang_su_san'
]);

// High-risk herb keywords
const highRiskHerbs = ['麻黃', '附子', '細辛', '朱砂', '雄黃', '罌粟殼', '巴豆', 'Ma Huang', 'Fu Zi', 'Xi Xin', 'Zhu Sha', 'Xiong Huang', 'Ba Dou'];

function containsHighRisk(f) {
  const compStr = JSON.stringify(f.composition || f.herbs || []);
  return highRiskHerbs.some(h => compStr.includes(h) || (f.name_zh && f.name_zh.includes(h)));
}

const candidates = [];

formulas.forEach(f => {
  if (protectedIds.has(f.id)) return; // Skip protected

  // Check if present in curriculum text
  const inCurriculum = curriculumCombined.includes(f.name_zh) || (f.pinyin && curriculumCombined.toLowerCase().includes(f.pinyin.toLowerCase()));

  const comp = f.composition || f.herbs || [];
  const hasJunChenZuoShi = comp.length > 0 && comp.every(h => h.role || h.role_zh);
  const hasFangYi = !!(f.fang_yi_zh || f.explanation_zh || f.analysis_zh);
  const hasSong = !!(f.formula_song || f.song_zh || f.verse_zh || f.formula_song_zh);
  const hasIndications = !!(f.indications && f.indications.length > 0);
  const hasCautions = !!(f.cautions_zh || f.contraindications_zh || (f.contraindications && f.contraindications.length > 0));

  // Defects
  const defects = [];
  if (!hasJunChenZuoShi) defects.push('缺君臣佐使角色');
  if (comp.some(h => !h.dose_g)) defects.push('缺生藥克數劑量');
  if (!hasFangYi) defects.push('缺方義剖析');
  if (!hasSong) defects.push('缺方歌');
  if (!hasIndications) defects.push('缺完整主治與舌脈');
  if (!hasCautions) defects.push('缺使用禁忌');

  if (inCurriculum && defects.length > 0) {
    candidates.push({
      id: f.id,
      name_zh: f.name_zh,
      name_en: f.name_en,
      pinyin: f.pinyin || f.pinyin_toned,
      category: f.category || f.category_zh,
      defects,
      defectCount: defects.length,
      hasHighRisk: containsHighRisk(f)
    });
  }
});

// Sort candidates by defect count (most incomplete first)
candidates.sort((a, b) => b.defectCount - a.defectCount);

console.log(`Total candidate formulas in curriculum needing restoration: ${candidates.length}`);
console.log(`Top 15 candidates:`);
candidates.slice(0, 15).forEach((c, idx) => {
  console.log(`${idx + 1}. [${c.id}] ${c.name_zh} (${c.name_en}) - Category: ${c.category}`);
  console.log(`   Defects (${c.defectCount}): ${c.defects.join(', ')} | High-Risk: ${c.hasHighRisk}`);
});
