/**
 * fix-cv24.js
 */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));

db.forEach(p => {
  if (p.code === 'CV24') {
    p.action_tags_zh = (p.action_tags_zh || []).filter(t => !/頭面五官|系統病/.test(t));
    p.action_tags_en = (p.action_tags_en || []).slice(0, p.action_tags_zh.length);
    p.acu_tags = p.action_tags_zh;
    p.action_tags = p.action_tags_en;
  }
});

fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ Cleaned CV24 action tags.');
