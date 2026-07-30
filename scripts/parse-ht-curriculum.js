/**
 * parse-ht-curriculum.js
 * Parses the 5 HEART CHANNEL OF HAND SHAO YIN curriculum text
 * to extract exact functions and indications, creating 1-to-1 aligned _zh and _en arrays
 * for all 9 Heart channel points (HT1–HT9), removing all appended raw English text.
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const HT_CURRICULUM_DATA = {
  HT1: {
    fnZh: ['寬胸理氣', '通絡止痛', '清心安神'],
    fnEn: ['Unbind chest & regulate Qi', 'Unblock channels & stop pain', 'Clear Heart & calm spirit'],
    indZh: ['胸脅痛', '腋下腫痛', '肩臂肘不舉', '心痛', '瘰癧'],
    indEn: ['Chest & hypochondriac pain', 'Axillary swelling & pain', 'Shoulder & arm pain / inability to raise arm', 'Precordial pain / cardiac pain', 'Scrofula']
  },
  HT2: {
    fnZh: ['寬胸理氣', '通絡止痛', '清心火'],
    fnEn: ['Unbind chest & regulate Qi', 'Unblock channels & stop pain', 'Clear Heart fire'],
    indZh: ['心痛', '脇肋痛', '肩臂酸痛', '目黃'],
    indEn: ['Precordial pain', 'Hypochondriac pain', 'Shoulder & arm pain', 'Yellow eyes / sclera']
  },
  HT3: {
    fnZh: ['清心安神', '舒筋活絡', '清熱散結'],
    fnEn: ['Clear Heart & calm spirit', 'Relax sinews & invigorate channels', 'Clear heat & dissipate nodules'],
    indZh: ['心痛', '手臂麻木 / 肘臂痛', '頭痛目眩', '癲狂', '瘰癧', '腋脅痛'],
    indEn: ['Precordial pain', 'Arm numbness / elbow & arm pain', 'Headache & dizziness', 'Mania / mental disorders', 'Scrofula', 'Axillary & hypochondriac pain']
  },
  HT4: {
    fnZh: ['清心寧神', '通絡止痛', '暴喑開竅'],
    fnEn: ['Clear Heart & calm spirit', 'Unblock channels & stop pain', 'Benefit throat for sudden loss of voice'],
    indZh: ['心痛', '暴喑 / 舌強不語', '肘臂攣痛', '心悸'],
    indEn: ['Precordial pain', 'Sudden loss of voice / tongue stiffness', 'Elbow & arm pain/spasm', 'Palpitations']
  },
  HT5: {
    fnZh: ['清心安神', '通經活絡', '開竅利舌', '調氣止汗'],
    fnEn: ['Clear Heart & calm spirit', 'Unblock channels & invigorate collateral', 'Open orifices & benefit tongue', 'Regulate Qi & arrest sweating'],
    indZh: ['心悸', '失眠', '舌強不語 / 暴喑', '腕臂痛', '月經過多'],
    indEn: ['Palpitations', 'Insomnia', 'Tongue stiffness & aphasia / sudden voice loss', 'Wrist & arm pain', 'Menorrhagia']
  },
  HT6: {
    fnZh: ['滋陰清熱', '固表止汗', '清心安神', '涼血止血'],
    fnEn: ['Nourish Yin & clear heat', 'Consolidate exterior & arrest night sweating', 'Clear Heart & calm spirit', 'Cool blood & stop bleeding'],
    indZh: ['心痛', '驚悸', '盜汗', '衄血 / 吐血', '暴喑'],
    indEn: ['Precordial pain', 'Fright palpitations', 'Night sweating', 'Epistaxis / hematemesis', 'Sudden loss of voice']
  },
  HT7: {
    fnZh: ['清心安神', '瀉火寧志', '調氣和血', '通絡止痛'],
    fnEn: ['Clear Heart & calm spirit', 'Drain fire & settle mind', 'Regulate Qi & harmonize blood', 'Unblock channels & stop pain'],
    indZh: ['心痛心悸', '失眠多夢', '健忘', '癲狂', '胸脅痛', '掌中熱'],
    indEn: ['Cardiac pain & palpitations', 'Insomnia & excessive dreaming', 'Amnesia / poor memory', 'Mania / mental clouding', 'Chest & hypochondriac pain', 'Heat in palms']
  },
  HT8: {
    fnZh: ['清心瀉火', '安神定志', '清利下焦'],
    fnEn: ['Clear Heart & drain fire', 'Calm spirit & settle mind', 'Clear lower jiao'],
    indZh: ['心悸心痛', '胸脅痛', '小便不利 / 尿血', '陰癢', '掌中熱'],
    indEn: ['Palpitations & cardiac pain', 'Chest & hypochondriac pain', 'Difficult urination / hematuria', 'Genital itching', 'Heat in palms']
  },
  HT9: {
    fnZh: ['清心開竅', '瀉火醒神', '解表清熱'],
    fnEn: ['Clear Heart & open orifices', 'Drain fire & revive spirit', 'Release exterior & clear heat'],
    indZh: ['心痛心悸', '熱病昏迷 / 中風', '癲狂', '喉痺', '急救醒神'],
    indEn: ['Precordial pain & palpitations', 'Febrile coma / Stroke', 'Mania', 'Throat painful obstruction', 'Resuscitation / reviving consciousness']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (HT_CURRICULUM_DATA[code]) {
    const cData = HT_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} HT channel points.`);
