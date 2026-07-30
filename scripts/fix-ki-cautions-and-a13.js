/**
 * fix-ki-cautions-and-a13.js
 * Writes point-specific anatomical safety cautions for KI channel points
 * and cleans remaining A13 disease category action tags.
 */

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const KI_SPECIFIC_CAUTIONS = {
  KI1:  { zh: '足底神經高度敏感，針刺疼痛感較強；避開足底深部血管。', en: 'Sole of foot is highly sensitive; avoid deep plantar vessels.' },
  KI2:  { zh: '避開足底內側動靜脈分支，孕婦慎針。', en: 'Avoid medial plantar vessels; use caution in pregnancy.' },
  KI3:  { zh: '避開脛後動靜脈，孕婦慎用強刺激。', en: 'Avoid posterior tibial vessels; avoid strong stimulation in pregnancy.' },
  KI4:  { zh: '避開跟腱內側神經與血管，進針宜緩。', en: 'Avoid nerves and vessels medial to calcaneal tendon.' },
  KI5:  { zh: '淺刺 0.3-0.5 寸，避開跟骨神經分支。', en: 'Shallow insertion 0.3-0.5 cun; avoid calcaneal nerve branches.' },
  KI6:  { zh: '避開脛後動脈分支，孕婦慎用強手法。', en: 'Avoid posterior tibial artery branches; use caution in pregnancy.' },
  KI7:  { zh: '避開脛後動靜脈與脛神經。', en: 'Avoid posterior tibial vessels and tibial nerve.' },
  KI8:  { zh: '避開脛後動靜脈，不宜過深。', en: 'Avoid posterior tibial vessels; do not insert too deeply.' },
  KI9:  { zh: '深部有脛後動靜脈，進針需掌握解剖深度。', en: 'Posterior tibial vessels lie deep; maintain correct anatomical depth.' },
  KI10: { zh: '膕窩內側肌腱凹陷處，避開膕動靜脈與半膜肌腱。', en: 'In depression of popliteal space; avoid popliteal vessels.' },
  KI11: { zh: '下腹穴位，針刺前須排空膀胱，避免刺傷膀胱。', en: 'Lower abdominal point; patient must empty bladder before needling.' },
  KI12: { zh: '下腹穴位，針刺前須排空膀胱。', en: 'Lower abdominal point; patient must empty bladder before needling.' },
  KI13: { zh: '下腹穴位，針刺前宜排空膀胱。', en: 'Lower abdominal point; empty bladder before needling.' },
  KI14: { zh: '下腹穴位，針刺前宜排空膀胱。', en: 'Lower abdominal point; empty bladder before needling.' },
  KI15: { zh: '下腹穴位，針刺前宜排空膀胱。', en: 'Lower abdominal point; empty bladder before needling.' },
  KI16: { zh: '臍旁穴位，避免過深刺入腹膜腔。', en: 'Para-umbilical point; avoid deep insertion into peritoneal cavity.' },
  KI17: { zh: '上腹穴位，避免深刺刺傷胃腸腹膜。', en: 'Upper abdominal point; avoid deep insertion to prevent abdominal organ injury.' },
  KI18: { zh: '上腹穴位，避免深刺刺傷胃腸。', en: 'Upper abdominal point; avoid deep insertion to prevent Stomach/intestine injury.' },
  KI19: { zh: '上腹穴位，避免深刺刺傷胃壁或腹膜。', en: 'Upper abdominal point; avoid deep insertion to prevent Stomach wall injury.' },
  KI20: { zh: '上腹穴位，避免深刺刺傷胃壁腹膜。', en: 'Upper abdominal point; avoid deep insertion to prevent Stomach wall injury.' },
  KI21: { zh: '靠近肋弓與幽門部，直刺過深有刺傷肝臟（右側）或胃壁（左側）風險，嚴禁深刺。', en: 'Near subcostal area; deep perpendicular insertion risks puncturing Liver (right) or Stomach (left).' },
  KI22: { zh: '胸部穴位，斜刺或平刺 0.3-0.5 寸，嚴禁直刺深刺以免致氣胸。', en: 'Thoracic point; transverse or oblique 0.3-0.5 cun. Deep perpendicular insertion contraindicated due to pneumothorax risk.' },
  KI23: { zh: '胸部穴位，斜刺或平刺 0.3-0.5 寸，嚴禁直刺深刺以免致氣胸。', en: 'Thoracic point; transverse or oblique 0.3-0.5 cun. Deep perpendicular insertion contraindicated due to pneumothorax risk.' },
  KI24: { zh: '胸部穴位，斜刺或平刺 0.3-0.5 寸，嚴禁直刺深刺以免致氣胸。', en: 'Thoracic point; transverse or oblique 0.3-0.5 cun. Deep perpendicular insertion contraindicated due to pneumothorax risk.' },
  KI25: { zh: '胸部穴位，斜刺或平刺 0.3-0.5 寸，嚴禁直刺深刺以免致氣胸。', en: 'Thoracic point; transverse or oblique 0.3-0.5 cun. Deep perpendicular insertion contraindicated due to pneumothorax risk.' },
  KI26: { zh: '胸部穴位，斜刺或平刺 0.3-0.5 寸，嚴禁直刺深刺以免致氣胸。', en: 'Thoracic point; transverse or oblique 0.3-0.5 cun. Deep perpendicular insertion contraindicated due to pneumothorax risk.' },
  KI27: { zh: '鎖骨下緣穴位，斜刺或平刺 0.3-0.5 寸，嚴禁直刺深刺以免刺傷鎖骨下動靜脈或肺尖。', en: 'Below clavicle; transverse/oblique 0.3-0.5 cun. Deep perpendicular insertion contraindicated (pneumothorax/subclavian vessel risk).' }
};

const DISEASE_CAT_RE = /系統疾病|系統病|五官疾病/;

db.forEach(point => {
  const code = point.code;
  if (!/^KI([1-9]|1[0-9]|2[0-7])$/.test(code)) return;

  // 1. Replace boilerplate cautions with point-specific cautions
  if (KI_SPECIFIC_CAUTIONS[code]) {
    const spec = KI_SPECIFIC_CAUTIONS[code];
    point.contraindications = [spec.zh];
    point.cautions_zh = [spec.zh];
    point.cautions_en = [spec.en];
    point.cautions = spec.zh;
  }

  // 2. Clean A13 action_tags_zh & action_tags_en
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
        if (en) movedEn.push(en);
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
        point.disease_tags_en.push(movedEn[idx2] || dz);
      }
    });
  }

  // Align disease_tags_zh and _en 1-to-1
  if (Array.isArray(point.disease_tags_zh) && Array.isArray(point.disease_tags_en)) {
    while (point.disease_tags_en.length < point.disease_tags_zh.length) {
      point.disease_tags_en.push(point.disease_tags_zh[point.disease_tags_en.length]);
    }
    if (point.disease_tags_en.length > point.disease_tags_zh.length) {
      point.disease_tags_en = point.disease_tags_en.slice(0, point.disease_tags_zh.length);
    }
  }
});

fs.writeFileSync(FILE, JSON.stringify(db, null, 2), 'utf8');
console.log('✅ Applied point-specific cautions and cleaned A13 tags for all KI channel points.');
