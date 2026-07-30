/**
 * fix-all-remaining-a13.js
 * Cleans remaining A13 disease category tags matching SYSTEM_LABEL_RE from action_tags_zh and action_tags_en
 * across all 361 points in data/acupoints/361.json while maintaining 1-to-1 array length alignment.
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const TEMP_FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json.tmp');

const SYSTEM_LABEL_RE = /系統疾病|系統病|疾病$|System Disorders$|^(?:Neurological|Gynecological|Respiratory|Digestive|Reproductive|Mental & Psychiatric|Locomotor & Musculoskeletal|Head, Face & Sensory)[\w\s,&]*Disorders$/;

const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let cleanedCount = 0;

db.forEach(p => {
  if (Array.isArray(p.action_tags_zh) && Array.isArray(p.action_tags_en) && p.action_tags_zh.length === p.action_tags_en.length) {
    const newZh = [];
    const newEn = [];
    p.action_tags_zh.forEach((zh, i) => {
      const en = p.action_tags_en[i];
      if (!SYSTEM_LABEL_RE.test(String(zh).trim()) && !SYSTEM_LABEL_RE.test(String(en).trim())) {
        newZh.push(zh);
        newEn.push(en);
      }
    });
    if (newZh.length < p.action_tags_zh.length) cleanedCount++;
    p.action_tags_zh = newZh;
    p.action_tags_en = newEn;
    p.actionTagsZh = newZh;
    p.actionTagsEn = newEn;
  }
});

console.log(`Cleaned A13 tags on ${cleanedCount} point(s).`);

fs.writeFileSync(TEMP_FILE, JSON.stringify(db, null, 2), 'utf8');
fs.renameSync(TEMP_FILE, FILE);
console.log(`Written cleaned database to ${FILE}`);
