/**
 * parse-li-curriculum.js
 * Parses all 20 points of Hand Yang Ming Large Intestine Channel (LI1–LI20)
 * directly from curriculum PDF text and eLotus/AD sources,
 * building 1-to-1 matched clean functions_zh/en and indications_zh/en.
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const LI_CURRICULUM_DATA = {
  LI1: {
    fnZh: ['解表清熱', '利咽開竅', '通絡止痛'],
    fnEn: ['Release exterior & clear heat', 'Benefit throat & open orifices', 'Unblock channels & stop pain'],
    indZh: ['咽喉腫痛', '齒痛', '熱病昏迷', '耳鳴耳聾', '手指麻木'],
    indEn: ['Sore throat', 'Toothache', 'Febrile coma', 'Tinnitus & deafness', 'Finger numbness']
  },
  LI2: {
    fnZh: ['清熱消腫', '利咽止痛'],
    fnEn: ['Clear heat & reduce swelling', 'Benefit throat & stop pain'],
    indZh: ['齒痛', '咽喉腫痛', '目赤腫痛', '熱病'],
    indEn: ['Toothache', 'Sore throat', 'Eye redness & swelling', 'Febrile disease']
  },
  LI3: {
    fnZh: ['清熱利咽', '消腫止痛'],
    fnEn: ['Clear heat & benefit throat', 'Reduce swelling & stop pain'],
    indZh: ['齒痛', '咽喉腫痛', '目赤腫痛', '手指腹脹痛'],
    indEn: ['Toothache', 'Sore throat', 'Eye redness & swelling', 'Finger & hand pain/swelling']
  },
  LI4: {
    fnZh: ['疏風解表', '清熱止痛', '宣肺通竅', '調和營衛', '催產通經'],
    fnEn: ['Dispel wind & release exterior', 'Clear heat & stop pain', 'Diffuse Lung & unblock orifices', 'Harmonize Ying & Wei', 'Promote labor & unblock menses'],
    indZh: ['頭痛', '目赤腫痛', '齒痛 / 面腫', '咽喉腫痛', '感冒發熱', '痛經 / 滯產', '半身不遂'],
    indEn: ['Headache', 'Eye redness & swelling', 'Toothache / Facial swelling', 'Sore throat', 'Common cold & fever', 'Dysmenorrhea / Delayed labor', 'Hemiplegia']
  },
  LI5: {
    fnZh: ['清熱瀉火', '聰耳明目', '通絡止痛'],
    fnEn: ['Clear heat & drain fire', 'Benefit ears & brighten eyes', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '目赤腫痛', '耳鳴耳聾', '齒痛', '手腕痛'],
    indEn: ['Headache', 'Eye redness & swelling', 'Tinnitus & deafness', 'Toothache', 'Wrist pain']
  },
  LI6: {
    fnZh: ['宣肺利水', '清熱通絡'],
    fnEn: ['Diffuse Lung & promote fluid movement', 'Clear heat & unblock channels'],
    indZh: ['水腫', '小便不利', '目赤腫痛', '耳鳴耳聾', '手臂痛'],
    indEn: ['Edema', 'Difficult urination', 'Eye redness & swelling', 'Tinnitus & deafness', 'Arm pain']
  },
  LI7: {
    fnZh: ['清熱解毒', '和胃止痛'],
    fnEn: ['Clear heat & relieve toxicity', 'Harmonize Stomach & stop pain'],
    indZh: ['頭痛', '齒痛', '咽喉腫痛', '腹痛腸鳴', '疔瘡腫毒'],
    indEn: ['Headache', 'Toothache', 'Sore throat', 'Abdominal pain & borborygmus', 'Furuncles & toxic swelling']
  },
  LI8: {
    fnZh: ['理氣和胃', '通絡止痛'],
    fnEn: ['Regulate Qi & harmonize Stomach', 'Unblock channels & stop pain'],
    indZh: ['腹痛腹脹', '肘臂痛', '頭痛'],
    indEn: ['Abdominal pain & distension', 'Elbow & arm pain', 'Headache']
  },
  LI9: {
    fnZh: ['通絡止痛', '調和腸胃'],
    fnEn: ['Unblock channels & stop pain', 'Harmonize Intestines & Stomach'],
    indZh: ['手臂麻木痛', '腸鳴腹痛', '偏癱'],
    indEn: ['Arm numbness & pain', 'Borborygmus & abdominal pain', 'Hemiplegia']
  },
  LI10: {
    fnZh: ['通經活絡', '理氣和胃', '調和氣血'],
    fnEn: ['Unblock channels & invigorate collaterals', 'Regulate Qi & harmonize Stomach', 'Harmonize Qi & blood'],
    indZh: ['手臂麻木痛 / 偏癱', '腹痛腹瀉', '齒痛', '肩臂不舉'],
    indEn: ['Arm numbness & pain / Hemiplegia', 'Abdominal pain & diarrhea', 'Toothache', 'Shoulder & arm pain']
  },
  LI11: {
    fnZh: ['清熱解表', '涼血息風', '消腫止癢', '調和氣血', '通絡止痛'],
    fnEn: ['Clear heat & release exterior', 'Cool blood & extinguish wind', 'Reduce swelling & arrest itching', 'Harmonize Qi & blood', 'Unblock channels & stop pain'],
    indZh: ['發熱感冒', '高血壓', '蕁麻疹 / 濕疹', '肘臂屈伸不利 / 肩周炎', '咽喉腫痛', '頭痛眩暈', '腹痛腹瀉'],
    indEn: ['Fever & common cold', 'Hypertension', 'Urticaria / Eczema', 'Elbow & arm stiffness / Frozen shoulder', 'Sore throat', 'Headache & dizziness', 'Abdominal pain & diarrhea']
  },
  LI12: {
    fnZh: ['舒筋通絡', '理氣止痛'],
    fnEn: ['Relax sinews & unblock channels', 'Regulate Qi & stop pain'],
    indZh: ['肘臂攣痛', '麻木不仁', '瘰癧'],
    indEn: ['Elbow & arm pain/spasm', 'Numbness of upper limb', 'Scrofula']
  },
  LI13: {
    fnZh: ['舒筋活絡', '清熱化痰'],
    fnEn: ['Relax sinews & invigorate collaterals', 'Clear heat & transform phlegm'],
    indZh: ['肘臂痛', '瘰癧', '咳嗽'],
    indEn: ['Elbow & arm pain', 'Scrofula', 'Cough']
  },
  LI14: {
    fnZh: ['清熱明目', '舒筋通絡'],
    fnEn: ['Clear heat & brighten eyes', 'Relax sinews & unblock channels'],
    indZh: ['肩臂痛', '瘰癧', '目疾'],
    indEn: ['Shoulder & arm pain', 'Scrofula', 'Eye disorders']
  },
  LI15: {
    fnZh: ['祛風除濕', '通利關節', '舒筋活絡', '止痛消腫'],
    fnEn: ['Dispel wind & eliminate dampness', 'Benefit joints', 'Relax sinews & invigorate collaterals', 'Stop pain & reduce swelling'],
    indZh: ['肩關節痛 / 肩周炎', '手臂不舉 / 麻木', '瘰癧', '風疹'],
    indEn: ['Shoulder joint pain / Frozen shoulder', 'Inability to raise arm / Numbness', 'Scrofula', 'Urticaria / Rubella']
  },
  LI16: {
    fnZh: ['解表清熱', '通絡止痛'],
    fnEn: ['Release exterior & clear heat', 'Unblock channels & stop pain'],
    indZh: ['肩臂痛', '瘰癧', '癭氣'],
    indEn: ['Shoulder & arm pain', 'Scrofula', 'Goiter']
  },
  LI17: {
    fnZh: ['利咽散結', '通絡止痛'],
    fnEn: ['Benefit throat & dissipate nodules', 'Unblock channels & stop pain'],
    indZh: ['咽喉腫痛', '暴喑', '瘰癧'],
    indEn: ['Sore throat', 'Sudden loss of voice', 'Scrofula']
  },
  LI18: {
    fnZh: ['宣肺利咽', '理氣化痰'],
    fnEn: ['Diffuse Lung & benefit throat', 'Regulate Qi & transform phlegm'],
    indZh: ['咽喉腫痛', '暴喑', '咳嗽氣喘', '瘰癧'],
    indEn: ['Sore throat', 'Sudden loss of voice', 'Cough & asthma', 'Scrofula']
  },
  LI19: {
    fnZh: ['宣肺通鼻', '清熱止痛'],
    fnEn: ['Diffuse Lung & unblock nose', 'Clear heat & stop pain'],
    indZh: ['鼻塞 / 鼻衄', '口喎', '齒痛'],
    indEn: ['Nasal congestion / Epistaxis', 'Facial deviation', 'Toothache']
  },
  LI20: {
    fnZh: ['宣肺通鼻', '疏風清熱', '通絡止痛'],
    fnEn: ['Diffuse Lung & unblock nose', 'Dispel wind & clear heat', 'Unblock channels & stop pain'],
    indZh: ['鼻塞 / 鼻淵 / 鼻衄', '口眼喎斜', '面腫皮膚瘙癢', '膽道蛔蟲症'],
    indEn: ['Nasal congestion / Sinusitis / Epistaxis', 'Facial paralysis', 'Facial swelling & itching', 'Biliary ascariasis']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (LI_CURRICULUM_DATA[code]) {
    const cData = LI_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} LI channel points.`);
