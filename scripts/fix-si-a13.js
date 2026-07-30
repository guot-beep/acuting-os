/**
 * fix-si-a13.js
 * Cleans remaining A13 disease category tags for SI channel points in both Chinese and English.
 */

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const DISEASE_CAT_RE_ZH = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;
const DISEASE_CAT_RE_EN = /Head, Face & Sensory|Disorders|System/i;

db.forEach(point => {
  if (!/^SI([1-9]|1[0-9])$/.test(point.code)) return;

  if (Array.isArray(point.action_tags_zh) && Array.isArray(point.action_tags_en)) {
    const cleanZh = [];
    const cleanEn = [];

    for (let i = 0; i < point.action_tags_zh.length; i++) {
      const tagZh = point.action_tags_zh[i];
      const tagEn = point.action_tags_en[i];

      if (!DISEASE_CAT_RE_ZH.test(tagZh) && (!tagEn || !DISEASE_CAT_RE_EN.test(tagEn))) {
        cleanZh.push(tagZh);
        if (tagEn) cleanEn.push(tagEn);
      }
    }

    point.action_tags_zh = cleanZh;
    point.action_tags_en = cleanEn;
    point.acu_tags = cleanZh;
    point.action_tags = cleanEn;
  }
});

fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ Cleaned remaining A13 tags (ZH & EN) for SI channel.');
