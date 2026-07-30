/**
 * fix-st-a13.js
 * Cleans remaining A13 disease category tags for ST channel points and fixes ST17 needling depth string.
 */

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

db.forEach(point => {
  if (point.code === 'ST17') {
    point.acumethod_zh = '⚠️ 本穴禁針禁灸（直刺0.0寸，嚴禁針刺與施灸）。僅作為體表解剖定位標誌。';
    point.needling = '⚠️ 本穴禁針禁灸（直刺0.0寸，嚴禁針刺與施灸）。僅作為體表解剖定位標誌。';
    point.acumethod_en = 'Needling & moxibustion strictly prohibited 0.0 cun (NO NEEDLING). Anatomical landmark only (Ruzhong).';
  }

  if (!/^ST([1-9]|[1-3][0-9]|4[0-5])$/.test(point.code)) return;

  if (Array.isArray(point.action_tags_zh)) {
    const cleanZh = point.action_tags_zh.filter(t => !DISEASE_CAT_RE.test(t));
    const cleanEn = Array.isArray(point.action_tags_en) ? point.action_tags_en.slice(0, cleanZh.length) : [];
    point.action_tags_zh = cleanZh;
    point.action_tags_en = cleanEn;
    point.acu_tags = cleanZh;
    point.action_tags = cleanEn;
  }
});

fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ Cleaned remaining A13 tags and fixed ST17 needling string for ST channel.');
