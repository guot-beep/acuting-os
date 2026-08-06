/**
 * scratch/inspect_all_formula_songs.js
 * Inspects formula_song_zh / formula_song on all restored gold-standard formulas.
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const data = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

const targets = [
  'formula.ma_huang_tang',
  'formula.gui_zhi_tang',
  'formula.yin_qiao_san',
  'formula.sang_ju_yin',
  'formula.bai_hu_tang',
  'formula.xiao_qing_long_tang'
];

console.log('Inspecting formula songs for key restored formulas:');
targets.forEach(id => {
  const r = data.records.find(item => item.id === id);
  console.log(`\nID: ${id} (${r?.name_zh})`);
  console.log('  formula_song_zh:', JSON.stringify(r?.formula_song_zh));
  console.log('  formula_song:', JSON.stringify(r?.formula_song));
  console.log('  formula_song_source_zh:', JSON.stringify(r?.formula_song_source_zh));
});
