/**
 * fix SI18 disease_tags alignment
 */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const si18 = db.find(p => p.code === 'SI18');
if (si18) {
  si18.disease_tags_zh = ['面痛', '面癱', '三叉神經痛', '牙痛', '面頰腫', '頭面五官疾病', '神經系統疾病'];
  si18.disease_tags_en = ['Facial Pain', "Facial Paralysis (Bell's Palsy)", 'Trigeminal Neuralgia', 'Toothache', 'Cheek Swelling', 'Head, Face & Sense Organ Disorders', 'Neurological Disorders'];
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
  console.log('Fixed SI18 disease_tags alignment');
}
