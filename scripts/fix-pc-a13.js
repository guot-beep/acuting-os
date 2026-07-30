/**
 * fix-pc-a13.js
 * Cleans remaining A13 disease category tags for PC channel points.
 */

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const TRANSLATIONS = {
  '婦科疾病': 'Gynecological disorders',
  '精神神志疾病': 'Mental & emotional disorders'
};

const DISEASE_CAT_RE = /系統疾病|系統病|五官疾病|婦科疾病|精神神志疾病/;

db.forEach(point => {
  if (!/^PC[1-9]$/.test(point.code)) return;

  if (Array.isArray(point.action_tags_zh) && Array.isArray(point.action_tags_en)) {
    const newZh = [];
    const newEn = [];
    const movedZh = [];
    const movedEn = [];

    for (let i = 0; i < point.action_tags_zh.length; i++) {
      const zh = point.action_tags_zh[i];
      const en = point.action_tags_en[i];
      if (DISEASE_CAT_RE.test(zh)) {
        movedZh.push(zh);
        movedEn.push(en && !/[\u4e00-\u9fa5]/.test(en) ? en : (TRANSLATIONS[zh] || 'Systemic disorder'));
      } else {
        newZh.push(zh);
        if (en) newEn.push(en);
      }
    }

    point.action_tags_zh = newZh;
    point.action_tags_en = newEn;
    point.acu_tags = newZh;
    point.action_tags = newEn;

    if (!Array.isArray(point.disease_tags_zh)) point.disease_tags_zh = [];
    if (!Array.isArray(point.disease_tags_en)) point.disease_tags_en = [];

    movedZh.forEach((dz, idx2) => {
      if (!point.disease_tags_zh.includes(dz)) {
        point.disease_tags_zh.push(dz);
        point.disease_tags_en.push(movedEn[idx2] || TRANSLATIONS[dz] || 'Systemic disorder');
      }
    });
  }

  if (Array.isArray(point.disease_tags_zh) && Array.isArray(point.disease_tags_en)) {
    point.disease_tags_en = point.disease_tags_zh.map((zh, idx) => {
      const en = point.disease_tags_en[idx];
      if (en && !/[\u4e00-\u9fa5]/.test(en)) return en;
      return TRANSLATIONS[zh] || 'Systemic disorder';
    });
  }
});

fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ Cleaned remaining A13 tags for PC channel.');
