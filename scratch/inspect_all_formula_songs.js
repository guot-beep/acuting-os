/**
 * scratch/inspect_all_formula_songs.js
 * Inspects formula_song and formula_song_zh across all 201 formulas in formulas.json.
 */

const fs = require('fs');
const path = require('path');

const formulaPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulaData = JSON.parse(fs.readFileSync(formulaPath, 'utf8'));

const missingSong = [];
const hasSong = [];

formulaData.records.forEach(r => {
  const song = r.formula_song_zh || r.formula_song || r.fang_ge_zh;
  if (song && song.trim()) {
    hasSong.push({ id: r.id, name_zh: r.name_zh, song });
  } else {
    missingSong.push({ id: r.id, name_zh: r.name_zh });
  }
});

console.log(`Formulas WITH formula song: ${hasSong.length}`);
console.log(`Formulas MISSING formula song: ${missingSong.length}`);

console.log('\nSample formulas WITH song:');
hasSong.slice(0, 10).forEach(h => console.log(` - ${h.id} (${h.name_zh}): ${h.song.replace(/\n/g, ' / ')}`));

console.log('\nSample formulas MISSING song (first 15):');
missingSong.slice(0, 15).forEach(m => console.log(` - ${m.id} (${m.name_zh})`));
