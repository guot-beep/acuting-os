/**
 * parse-pc-curriculum.js
 * Parses the 9 PERICARDIUM CHANNEL OF HAND JUE YIN curriculum text
 * to extract exact functions and indications, creating 1-to-1 aligned _zh and _en arrays
 * for all 9 Pericardium channel points (PC1–PC9).
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const PC_CURRICULUM_DATA = {
  PC1: {
    fnZh: ['寬胸理氣', '通絡散結', '降逆止嘔'],
    fnEn: ['Unbind chest & regulate Qi', 'Unblock channels & dissipate nodules', 'Descend adverse Qi & stop vomiting'],
    indZh: ['胸脅脹痛', '咳嗽', '氣喘', '乳癰', '瘰癧'],
    indEn: ['Chest & hypochondriac pain', 'Cough', 'Asthma', 'Acute mastitis / breast abscess', 'Scrofula / neck lymphatic nodules']
  },
  PC2: {
    fnZh: ['寬胸理氣', '寧心安神'],
    fnEn: ['Unbind chest & regulate Qi', 'Pacify Heart & calm spirit'],
    indZh: ['心痛', '胸脅痛', '咳嗽', '臂痛'],
    indEn: ['Precordial pain', 'Chest & hypochondriac pain', 'Cough', 'Arm pain']
  },
  PC3: {
    fnZh: ['清熱瀉火', '和胃降逆', '涼血解毒', '清心除煩'],
    fnEn: ['Clear heat & drain fire', 'Harmonize Stomach & descend adverse Qi', 'Cool blood & relieve toxicity', 'Clear Heart & eliminate vexation'],
    indZh: ['心痛', '心悸', '吐瀉', '胃痛', '熱病', '肘臂痙攣痛'],
    indEn: ['Precordial pain', 'Palpitations', 'Vomiting & diarrhea', 'Epigastric pain', 'Febrile disease / heat disease', 'Spasm & pain of elbow/arm']
  },
  PC4: {
    fnZh: ['清心瀉火', '涼血止血', '寬胸理氣', '安神定志'],
    fnEn: ['Clear Heart & drain fire', 'Cool blood & stop bleeding', 'Unbind chest & regulate Qi', 'Calm spirit & settle mind'],
    indZh: ['急性心痛', '心悸', '嘔血', '衄血', '癔病 / 驚恐'],
    indEn: ['Acute precordial pain', 'Palpitations', 'Hematemesis / blood vomiting', 'Epistaxis / nosebleed', 'Hysteria / panic attacks']
  },
  PC5: {
    fnZh: ['和胃化痰', '寧心安神', '寬胸理氣'],
    fnEn: ['Harmonize Stomach & transform phlegm', 'Pacify Heart & calm spirit', 'Unbind chest & regulate Qi'],
    indZh: ['心痛', '心悸', '胃痛', '嘔吐', '癲狂', '瘧疾'],
    indEn: ['Precordial pain', 'Palpitations', 'Epigastric pain', 'Vomiting', 'Mania / mental confusion', 'Malaria']
  },
  PC6: {
    fnZh: ['寧心安神', '和胃降逆', '寬胸理氣', '通絡止痛'],
    fnEn: ['Pacify Heart & calm spirit', 'Harmonize Stomach & descend adverse Qi', 'Unbind chest & regulate Qi', 'Unblock channels & stop pain'],
    indZh: ['心痛心悸', '胃痛嘔吐', '胸脅痛', '失眠癲狂', '暈車暈船', '少腹痛'],
    indEn: ['Precordial pain & palpitations', 'Epigastric pain & vomiting', 'Chest & hypochondriac pain', 'Insomnia & mania', 'Motion sickness / nausea', 'Lower abdominal pain']
  },
  PC7: {
    fnZh: ['清心瀉火', '寧心安神', '和胃寬胸', '清營涼血'],
    fnEn: ['Clear Heart & drain fire', 'Pacify Heart & calm spirit', 'Harmonize Stomach & unbind chest', 'Clear Ying level & cool blood'],
    indZh: ['心痛心悸', '失眠健忘', '癲狂', '胃痛', '口臭', '瘡瘍'],
    indEn: ['Precordial pain & palpitations', 'Insomnia & memory loss', 'Mania', 'Epigastric pain', 'Halitosis / bad breath', 'Skin sores & carbuncles']
  },
  PC8: {
    fnZh: ['清心瀉火', '涼血止血', '開竅醒神', '除煩止嘔'],
    fnEn: ['Clear Heart & drain fire', 'Cool blood & stop bleeding', 'Open orifices & revive spirit', 'Eliminate vexation & stop vomiting'],
    indZh: ['心痛', '癲狂', '口舌生瘡', '口臭', '嘔吐', '中暑'],
    indEn: ['Precordial pain', 'Mania / psychosis', 'Mouth & tongue sores', 'Halitosis', 'Vomiting', 'Heatstroke']
  },
  PC9: {
    fnZh: ['開竅醒神', '清心瀉火', '退熱急救'],
    fnEn: ['Open orifices & revive spirit', 'Clear Heart & drain fire', 'Clear fever & emergency resuscitation'],
    indZh: ['昏迷中風', '熱病汗不出', '小兒驚風', '心痛', '舌強腫痛'],
    indEn: ['Coma & stroke', 'Febrile illness with anhidrosis', 'Infantile convulsions', 'Precordial pain', 'Tongue stiffness & swelling']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (PC_CURRICULUM_DATA[code]) {
    const cData = PC_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched functions and indications for all ${updated} PC channel points.`);
