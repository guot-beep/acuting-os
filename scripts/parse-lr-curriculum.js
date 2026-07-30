/**
 * parse-lr-curriculum.js
 * Parses the 12 LIVER CHANNEL OF FOOT JUE YIN curriculum text
 * to extract exact functions and indications, creating 1-to-1 aligned _zh and _en arrays
 * for all 14 Liver channel points (LR1–LR14).
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const LR_CURRICULUM_DATA = {
  LR1: {
    fnZh: ['疏肝理氣', '調經止血', '清熱利尿', '開竅醒神'],
    fnEn: ['Course Liver & regulate Qi', 'Regulate menses & stop bleeding', 'Clear heat & promote urination', 'Open orifices & revive spirit'],
    indZh: ['疝氣', '崩漏', '月經過多', '陰挺', '小便不利', '癲癇'],
    indEn: ['Hernia', 'Uterine bleeding', 'Menorrhagia', 'Uterine prolapse', 'Difficult urination', 'Epilepsy']
  },
  LR2: {
    fnZh: ['清瀉肝火', '平肝息風', '涼血止血', '清利下焦'],
    fnEn: ['Clear Liver fire', 'Pacify Liver & extinguish wind', 'Cool blood & stop bleeding', 'Clear lower jiao'],
    indZh: ['頭痛眩暈', '目赤腫痛', '脅痛', '口苦', '崩漏', '小便不利', '小兒驚風'],
    indEn: ['Headache & dizziness', 'Redness & swelling of eyes', 'Hypochondriac pain', 'Bitter taste in mouth', 'Uterine bleeding', 'Difficult urination', 'Infantile convulsions']
  },
  LR3: {
    fnZh: ['平肝息風', '疏肝理氣', '清熱明目', '通絡止痛'],
    fnEn: ['Pacify Liver & extinguish wind', 'Course Liver & regulate Qi', 'Clear heat & brighten eyes', 'Unblock channels & stop pain'],
    indZh: ['頭痛眩暈', '目赤腫痛', '脅痛', '月經不調', '黃疸', '癲癇', '中風', '下肢麻痺'],
    indEn: ['Headache & dizziness', 'Redness & swelling of eyes', 'Hypochondriac pain', 'Irregular menses', 'Jaundice', 'Epilepsy', 'Stroke', 'Lower limb numbness']
  },
  LR4: {
    fnZh: ['疏肝理氣', '清熱利濕', '通絡止痛'],
    fnEn: ['Course Liver & regulate Qi', 'Clear heat & drain dampness', 'Unblock channels & stop pain'],
    indZh: ['疝氣', '小腹痛', '小便不利', '黃疸', '內踝腫痛'],
    indEn: ['Hernia', 'Lower abdominal pain', 'Difficult urination', 'Jaundice', 'Medial malleolus swelling & pain']
  },
  LR5: {
    fnZh: ['疏肝理氣', '清熱利濕', '調經止帶'],
    fnEn: ['Course Liver & regulate Qi', 'Clear heat & drain dampness', 'Regulate menses & arrest leukorrhea'],
    indZh: ['月經不調', '帶下', '小便不利', '陰癢', '睾丸腫痛'],
    indEn: ['Irregular menses', 'Leukorrhea', 'Difficult urination', 'Pudendal itching', 'Testicular swelling & pain']
  },
  LR6: {
    fnZh: ['理氣活血', '制約崩漏', '通絡止痛'],
    fnEn: ['Regulate Qi & invigorate blood', 'Arrest uterine bleeding', 'Unblock channels & stop pain'],
    indZh: ['崩漏', '月經不調', '疝氣', '小腹痛', '脛骨痛'],
    indEn: ['Uterine bleeding', 'Irregular menses', 'Hernia', 'Lower abdominal pain', 'Tibial pain']
  },
  LR7: {
    fnZh: ['祛風除濕', '舒筋利節'],
    fnEn: ['Dispel wind & eliminate dampness', 'Relax sinews & benefit joints'],
    indZh: ['膝關節腫痛', '臏骨下痛', '下肢痿痺'],
    indEn: ['Knee joint swelling & pain', 'Infrapatellar pain', 'Lower limb weakness / atrophy']
  },
  LR8: {
    fnZh: ['滋陰養肝', '清熱利濕', '通利下焦', '舒筋活絡'],
    fnEn: ['Nourish Yin & Liver Blood', 'Clear heat & drain dampness', 'Unblock lower jiao', 'Relax sinews & invigorate channels'],
    indZh: ['陰癢', '陰挺', '小便不利', '遺精', '膝脛酸痛', '月經不調'],
    indEn: ['Pudendal itching', 'Uterine prolapse', 'Difficult urination', 'Spermatorrhea', 'Knee & shin pain', 'Irregular menses']
  },
  LR9: {
    fnZh: ['理氣活血', '清熱利濕', '調經止痛'],
    fnEn: ['Regulate Qi & invigorate blood', 'Clear heat & drain dampness', 'Regulate menses & stop pain'],
    indZh: ['月經不調', '小便不利', '腰股痛', '遺尿'],
    indEn: ['Irregular menses', 'Difficult urination', 'Lumbar & thigh pain', 'Enuresis']
  },
  LR10: {
    fnZh: ['理氣活血', '通利下焦'],
    fnEn: ['Regulate Qi & invigorate blood', 'Unblock lower jiao'],
    indZh: ['小便不利', '陰股痛', '睾丸腫痛', '嗜臥'],
    indEn: ['Difficult urination', 'Genital & thigh pain', 'Testicular swelling & pain', 'Somnolence / fatigue']
  },
  LR11: {
    fnZh: ['調經止帶', '理氣活血'],
    fnEn: ['Regulate menses & arrest leukorrhea', 'Regulate Qi & invigorate blood'],
    indZh: ['月經不調', '帶下', '陰挺', '少腹痛'],
    indEn: ['Irregular menses', 'Leukorrhea', 'Uterine prolapse', 'Lower abdominal pain']
  },
  LR12: {
    fnZh: ['溫經散寒', '理氣止痛'],
    fnEn: ['Warm channels & scatter cold', 'Regulate Qi & stop pain'],
    indZh: ['少腹痛', '疝氣', '陰挺'],
    indEn: ['Lower abdominal pain', 'Hernia', 'Uterine prolapse']
  },
  LR13: {
    fnZh: ['疏肝理脾', '和胃消食', '理氣活血', '散結消腫'],
    fnEn: ['Course Liver & fortify Spleen', 'Harmonize Stomach & digest food', 'Regulate Qi & invigorate blood', 'Dissipate nodules & reduce swelling'],
    indZh: ['腹脹', '腹瀉', '脅痛', '痞塊 / 脾腫大', '嘔吐', '黃疸'],
    indEn: ['Abdominal distension', 'Diarrhea', 'Hypochondriac pain', 'Abdominal masses / splenomegaly', 'Vomiting', 'Jaundice']
  },
  LR14: {
    fnZh: ['疏肝理氣', '和胃降逆', '活血化瘀'],
    fnEn: ['Course Liver & regulate Qi', 'Harmonize Stomach & descend adverse Qi', 'Invigorate blood & dispel stasis'],
    indZh: ['脅痛', '腹脹', '嘔吐', '吞酸', '乳癰', '熱病'],
    indEn: ['Hypochondriac pain', 'Abdominal distension', 'Vomiting', 'Acid regurgitation', 'Acute mastitis', 'Febrile disease']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (LR_CURRICULUM_DATA[code]) {
    const cData = LR_CURRICULUM_DATA[code];
    point.functions_zh = cData.fnZh;
    point.functions_en = cData.fnEn;
    point.functions = cData.fnZh.join('，');

    point.indications_zh = cData.indZh;
    point.indications_en = cData.indEn;
    point.indications = cData.indZh.join('，');

    updated++;
  }
});

fs.writeFileSync(FILE_361, JSON.stringify(data361, null, 2), 'utf8');
console.log(`✅ Updated 1-to-1 matched functions and indications for all ${updated} LR channel points.`);
