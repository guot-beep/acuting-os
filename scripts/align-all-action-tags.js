/**
 * align-all-action-tags.js
 * Ensures action_tags_zh and action_tags_en are 1-to-1 index-aligned in length across all 361 points.
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const TEMP_FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json.tmp');

const TAG_TRANSLATION_MAP = {
  '清熱': 'Clear Heat',
  '宣肺': 'Diffuse Lung Qi',
  '平喘': 'Relieve Asthma / Calming Wheezing',
  '止咳': 'Relieve Cough',
  '通絡': 'Unblock Collaterals',
  '止痛': 'Relieve Pain / Analgesic',
  '健脾': 'Fortify Spleen',
  '和胃': 'Harmonize Stomach',
  '降逆': 'Direct Rebellious Qi Downward',
  '理氣': 'Regulate Qi',
  '活血': 'Invigorate Blood',
  '化瘀': 'Transform Blood Stasis',
  '養血': 'Nourish Blood',
  '止血': 'Stop Bleeding',
  '滋陰': 'Nourish Yin',
  '壯陽': 'Fortify Yang',
  '補腎': 'Tonify Kidney',
  '益氣': 'Supplement Qi',
  '利水': 'Promote Diuresis',
  '滲濕': 'Drain Dampness',
  '祛風': 'Dispels Wind',
  '解表': 'Release Exterior',
  '明目': 'Brighten Eyes / Improve Vision',
  '利咽': 'Benefit Throat',
  '安神': 'Calm Spirit / Tranquilize Mind',
  '養心': 'Nourish Heart',
  '平肝': 'Pacify Liver',
  '熄風': 'Extinguish Wind',
  '疏肝': 'Course Liver Qi',
  '通便': 'Unblock Bowels',
  '止瀉': 'Stop Diarrhea',
  '利尿': 'Promote Urination',
  '通乳': 'Promote Lactation',
  '矯胎': 'Correct Fetal Position',
  '急救': 'Emergency Resuscitation',
  '醒腦': 'Awaken Brain / Clear Mind',
  '升陽': 'Raise Yang Qi',
  '固表': 'Consolidate Exterior',
  '止汗': 'Stop Sweating',
  '發汗': 'Promote Sweating',
  '溫經': 'Warm Channels',
  '散寒': 'Disperse Cold',
  '清心': 'Clear Heart Fire',
  '瀉火': 'Drain Fire',
  '開竅': 'Open Orifices',
  '聰耳': 'Benefit Hearing / Ears',
  '消食': 'Relieve Food Stagnation',
  '導滯': 'Guide Out Stagnation',
  '軟堅': 'Soften Hardness',
  '散結': 'Disperse Nodules',
  '化痰': 'Transform Phlegm',
  '祛濕': 'Dispel Dampness',
  '清熱解毒': 'Clear Heat & Detoxify',
  '涼血': 'Cool Blood',
  '收斂': 'Astringe & Bind',
  '固精': 'Consolidate Essence',
  '縮尿': 'Reduce Urination',
  '止帶': 'Stop Leukorrhea',
  '調經': 'Regulate Menstruation',
  '安胎': 'Calm Fetus',
  '利膽': 'Benefit Gallbladder',
  '舒筋': 'Relax Tendons / Sinews',
  '鎮靜': 'Tranquilize Spirit',
  '引熱下行': 'Descend Heat',
  '降火': 'Descend Fire'
};

const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let fixedCount = 0;

db.forEach(p => {
  if (Array.isArray(p.action_tags_zh)) {
    const zhTags = p.action_tags_zh;
    const enTags = zhTags.map(zh => {
      const trimmed = String(zh).trim();
      return TAG_TRANSLATION_MAP[trimmed] || 'TCM Action';
    });

    p.action_tags_en = enTags;
    p.actionTagsZh = zhTags;
    p.actionTagsEn = enTags;
    fixedCount++;
  }
});

console.log(`Aligned action_tags_en for ${fixedCount} point(s).`);

fs.writeFileSync(TEMP_FILE, JSON.stringify(db, null, 2), 'utf8');
fs.renameSync(TEMP_FILE, FILE);
console.log(`Written aligned database to ${FILE}`);
