/**
 * fix-cv-a13.js
 * Cleans remaining A13 disease category tags for CV channel points and fixes CV8 needling string.
 */

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

db.forEach(point => {
  if (point.code === 'CV8') {
    point.acumethod_zh = '⚠️ 本穴禁針（直刺0.0寸，嚴禁針刺）！僅限隔鹽或隔薑施灸。';
    point.needling = '⚠️ 本穴禁針（直刺0.0寸，嚴禁針刺）！僅限隔鹽或隔薑施灸。';
    point.acumethod_en = 'Needling contraindicated 0.0 cun (NO NEEDLING). Moxibustion only with salt or ginger in navel. Primary point for warming Yang, emergency collapse & chronic diarrhea (Shenque).';
  }

  if (!/^CV([1-9]|1[0-9]|2[0-4])$/.test(point.code)) return;

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
console.log('✅ Fixed CV8 needling string and cleaned remaining A13 tags for CV channel.');
