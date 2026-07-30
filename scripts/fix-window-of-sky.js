/**
 * fix-window-of-sky.js
 * Ensures all 10 Window of Sky points (天窗十穴) have explicit point_identity_zh
 * and point_identity_en set in 361.json.
 */

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const WINDOW_OF_SKY = {
  LU3: {
    zh: ['天窗穴（Window of Sky Point）', '手太陰肺經上臂要穴'],
    en: ['Window of Sky point (Tianfu)', 'Lung channel upper arm point']
  },
  ST9: {
    zh: ['天窗穴（Window of Sky Point）', '氣海穴（四海之一）', '人迎脈診候預後要穴'],
    en: ['Window of Sky point (Renying)', 'Sea of Qi point', 'Carotid pulse diagnosis landmark']
  },
  LI18: {
    zh: ['天窗穴（Window of Sky Point）', '頸部利咽解毒要穴'],
    en: ['Window of Sky point (Futu)', 'Neck & throat point']
  },
  SI16: {
    zh: ['天窗穴（Window of Sky Point）', '利耳咽喉解毒要穴'],
    en: ['Window of Sky point (Tianchuang)', 'Primary ear & throat point']
  },
  SI17: {
    zh: ['天窗穴（Window of Sky Point）', '頸部咽喉消腫要穴'],
    en: ['Window of Sky point (Tianrong)', 'Neck swelling & throat point']
  },
  TE16: {
    zh: ['天窗穴（Window of Sky Point）', '頭面清熱聰耳要穴'],
    en: ['Window of Sky point (Tianyou)', 'Head & ear point']
  },
  SJ16: {
    zh: ['天窗穴（Window of Sky Point）', '頭面清熱聰耳要穴'],
    en: ['Window of Sky point (Tianyou)', 'Head & ear point']
  },
  BL10: {
    zh: ['天窗穴（Window of Sky Point）', '後頭項強止痛第一要穴'],
    en: ['Window of Sky point (Tianzhu)', 'Primary occipital & neck rigidity point']
  },
  UB10: {
    zh: ['天窗穴（Window of Sky Point）', '後頭項強止痛第一要穴'],
    en: ['Window of Sky point (Tianzhu)', 'Primary occipital & neck rigidity point']
  },
  CV22: {
    zh: ['天窗穴（Window of Sky Point）', '降氣平喘宣肺第一要穴'],
    en: ['Window of Sky point (Tiantu)', 'Primary point for descending Lung Qi & asthma']
  },
  RN22: {
    zh: ['天窗穴（Window of Sky Point）', '降氣平喘宣肺第一要穴'],
    en: ['Window of Sky point (Tiantu)', 'Primary point for descending Lung Qi & asthma']
  },
  GV16: {
    zh: ['天窗穴（Window of Sky Point）', '髓海（四海之一）', '祛風醒腦要穴'],
    en: ['Window of Sky point (Fengfu)', 'Sea of Marrow point', 'Primary wind-dispelling point']
  },
  DU16: {
    zh: ['天窗穴（Window of Sky Point）', '髓海（四海之一）', '祛風醒腦要穴'],
    en: ['Window of Sky point (Fengfu)', 'Sea of Marrow point', 'Primary wind-dispelling point']
  },
  PC1: {
    zh: ['天窗穴（Window of Sky Point）', '胸脅理氣解鬱穴'],
    en: ['Window of Sky point (Tianchi)', 'Chest & hypochondrium point']
  }
};

let count = 0;
db.forEach(point => {
  const code = point.code;
  if (WINDOW_OF_SKY[code]) {
    point.point_identity_zh = WINDOW_OF_SKY[code].zh;
    point.point_identity_en = WINDOW_OF_SKY[code].en;
    count++;
  }
});

fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
console.log(`Updated Window of Sky identities for ${count} point(s) in 361.json.`);
