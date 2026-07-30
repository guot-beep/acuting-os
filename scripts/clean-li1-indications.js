/**
 * Clean LI1 indications in 361.json
 */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const li1 = db.find(p => p.code === 'LI1');
if (li1) {
  li1.indications_zh = ["牙痛", "咽喉腫痛", "頷下腫痛", "手指麻木", "熱病無汗", "昏迷急救"];
  li1.indications_en = ["Toothache", "Sore throat", "Submandibular swelling", "Finger numbness", "Febrile disease without sweating", "Coma resuscitation"];
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
  console.log('Cleaned LI1 indications in 361.json');
}
