/**
 * fix-bl40-and-a13.js
 * Properly translates disease tags for BL channel points and clears A13 disease category tags.
 */

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const TRANSLATIONS = {
  '泌尿系統疾病': 'Urinary system disorders',
  '生殖系統疾病': 'Reproductive system disorders',
  '運動系統疾病': 'Motor system disorders',
  '神經系統疾病': 'Nervous system disorders',
  '消化系統疾病': 'Digestive system disorders',
  '呼吸系統疾病': 'Respiratory system disorders',
  '循環系統疾病': 'Circulatory system disorders',
  '五官疾病': 'ENT / Five senses disorders'
};

const DISEASE_CAT_RE = /系統疾病|系統病|五官疾病/;

db.forEach(point => {
  if (!/^BL([1-9]|[1-5][0-9]|6[0-7])$/.test(point.code)) return;

  // Clean action_tags_zh and action_tags_en
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

  // Ensure disease_tags_zh and disease_tags_en match 1-to-1 and contain no CJK in _en
  if (Array.isArray(point.disease_tags_zh) && Array.isArray(point.disease_tags_en)) {
    point.disease_tags_en = point.disease_tags_zh.map((zh, idx) => {
      const en = point.disease_tags_en[idx];
      if (en && !/[\u4e00-\u9fa5]/.test(en)) return en;
      return TRANSLATIONS[zh] || 'Systemic disorder';
    });
  }
});

fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ Properly translated disease tags for BL channel.');
