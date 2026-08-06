/**
 * scratch/check_mht_gzt_integrity.js
 * Inspects Ma Huang Tang and Gui Zhi Tang records in reference files and formulas.json
 */

const fs = require('fs');
const path = require('path');

const refMht = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/herbs/reference/formula.ma_huang_tang.json'), 'utf8'));
const refGzt = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/herbs/reference/formula.gui_zhi_tang.json'), 'utf8'));
const refXql = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/herbs/reference/formula.xiao_qing_long_tang.json'), 'utf8'));

console.log(`=================== 麻黃湯 Ma Huang Tang Check ===================`);
console.log(`Name: ${refMht.name_zh} / ${refMht.name_en} (${refMht.pinyin_toned})`);
console.log(`Category: ${refMht.category_zh} / ${refMht.category_en}`);
console.log(`Actions (功效):`, refMht.actions_zh);
console.log(`Indications (主治):`, refMht.indications);
console.log(`Composition (君臣佐使):`);
refMht.composition.forEach(c => console.log(`  - [${c.role_zh}] ${c.name_zh} (${c.name_en}) ${c.dose_g}g : ${c.role_reason_zh}`));
console.log(`Contraindications (禁忌):`, refMht.contraindications_zh);

console.log(`\n=================== 桂枝湯 Gui Zhi Tang Check ===================`);
console.log(`Name: ${refGzt.name_zh} / ${refGzt.name_en} (${refGzt.pinyin_toned})`);
console.log(`Category: ${refGzt.category_zh} / ${refGzt.category_en}`);
console.log(`Actions (功效):`, refGzt.actions_zh);
console.log(`Indications (主治):`, refGzt.indications);
console.log(`Composition (君臣佐使):`);
refGzt.composition.forEach(c => console.log(`  - [${c.role_zh}] ${c.name_zh} (${c.name_en}) ${c.dose_g}g : ${c.role_reason_zh}`));
console.log(`Contraindications (禁忌):`, refGzt.contraindications_zh);

console.log(`\n=================== 小青龍湯 Xiao Qing Long Tang Check ===================`);
console.log(`Name: ${refXql.name_zh} / ${refXql.name_en} (${refXql.pinyin_toned})`);
console.log(`Category: ${refXql.category_zh} / ${refXql.category_en}`);
console.log(`Actions (功效):`, refXql.actions_zh);
console.log(`Indications (主治):`, refXql.indications);
console.log(`Composition (君臣佐使):`);
refXql.composition.forEach(c => console.log(`  - [${c.role_zh}] ${c.name_zh} (${c.name_en}) ${c.dose_g}g : ${c.role_reason_zh}`));
console.log(`Contraindications (禁忌):`, refXql.contraindications_zh);
