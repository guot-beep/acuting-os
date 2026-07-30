/**
 * parse-lu-curriculum.js
 * Parses all 11 points of Hand Tai Yin Lung Channel (LU1–LU11)
 * directly from curriculum PDF text and eLotus/AD sources,
 * building 1-to-1 matched clean functions_zh/en and indications_zh/en.
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const LU_CURRICULUM_DATA = {
  LU1: {
    fnZh: ['宣肺理氣', '清熱化痰', '止咳平喘', '寬胸利膈'],
    fnEn: ['Diffuse Lung & regulate Qi', 'Clear heat & transform phlegm', 'Arrest cough & calm asthma', 'Unbind chest & benefit diaphragm'],
    indZh: ['咳嗽氣喘', '胸痛', '胸中煩悶', '肩背痛', '腹脹'],
    indEn: ['Cough & asthma', 'Chest pain', 'Fullness/oppression in chest', 'Shoulder & back pain', 'Abdominal distension']
  },
  LU2: {
    fnZh: ['宣肺止咳', '寬胸理氣', '通絡止痛'],
    fnEn: ['Diffuse Lung & arrest cough', 'Unbind chest & regulate Qi', 'Unblock channels & stop pain'],
    indZh: ['咳嗽氣喘', '胸痛', '肩臂酸痛'],
    indEn: ['Cough & asthma', 'Chest pain', 'Shoulder & arm pain']
  },
  LU3: {
    fnZh: ['宣肺降逆', '涼血止血', '清熱開竅'],
    fnEn: ['Diffuse Lung & descend Qi', 'Cool blood & stop bleeding', 'Clear heat & open orifices'],
    indZh: ['咳嗽氣喘', '鼻衄', '吐血', '臂痛'],
    indEn: ['Cough & asthma', 'Epistaxis', 'Hematemesis', 'Arm pain']
  },
  LU4: {
    fnZh: ['宣肺理氣', '通絡止痛'],
    fnEn: ['Diffuse Lung & regulate Qi', 'Unblock channels & stop pain'],
    indZh: ['咳嗽', '氣喘', '胸悶', '臂痛'],
    indEn: ['Cough', 'Asthma', 'Chest fullness', 'Arm pain']
  },
  LU5: {
    fnZh: ['清肺瀉火', '降逆平喘', '通調水道', '舒筋活絡'],
    fnEn: ['Clear Lung & drain fire', 'Descend Qi & calm asthma', 'Regulate water passages', 'Relax sinews & invigorate collaterals'],
    indZh: ['咳嗽', '氣喘', '咯血', '潮熱', '咽喉腫痛', '肘臂攣痛'],
    indEn: ['Cough', 'Asthma', 'Hemoptysis', 'Tidal fever', 'Sore throat', 'Elbow & arm pain/spasm']
  },
  LU6: {
    fnZh: ['清熱宣肺', '涼血止血', '通絡止痛'],
    fnEn: ['Clear heat & diffuse Lung', 'Cool blood & stop bleeding', 'Unblock channels & stop pain'],
    indZh: ['咯血 / 衄血', '咳嗽', '氣喘', '咽喉腫痛', '肘臂痛'],
    indEn: ['Hemoptysis / Epistaxis', 'Cough', 'Asthma', 'Sore throat', 'Elbow & arm pain']
  },
  LU7: {
    fnZh: ['宣肺解表', '祛風通絡', '通調任脈', '利咽止痛'],
    fnEn: ['Diffuse Lung & release exterior', 'Dispel wind & unblock channels', 'Unblock Ren Mai', 'Benefit throat & stop pain'],
    indZh: ['感冒發熱', '頭痛項強', '咳嗽氣喘', '咽喉腫痛', '口眼喎斜', '齒痛', '小便不利'],
    indEn: ['Common cold & fever', 'Headache & neck stiffness', 'Cough & asthma', 'Sore throat', 'Facial paralysis', 'Toothache', 'Difficult urination']
  },
  LU8: {
    fnZh: ['宣肺利咽', '降氣平喘', '通絡止痛'],
    fnEn: ['Diffuse Lung & benefit throat', 'Descend Qi & calm asthma', 'Unblock channels & stop pain'],
    indZh: ['咳嗽氣喘', '咽喉腫痛', '胸痛', '手腕痛'],
    indEn: ['Cough & asthma', 'Sore throat', 'Chest pain', 'Wrist pain']
  },
  LU9: {
    fnZh: ['補肺益氣', '止咳化痰', '通利血脈', '培土生金'],
    fnEn: ['Tonify Lung & benefit Qi', 'Arrest cough & transform phlegm', 'Unblock vessels & pulse', 'Nourish Earth to generate Metal'],
    indZh: ['咳嗽氣喘', '咯血', '咽喉腫痛', '脈痺 / 無脈症', '胸痛', '腕臂痛'],
    indEn: ['Cough & asthma', 'Hemoptysis', 'Sore throat', 'Pulse obstruction / Pulseless disease', 'Chest pain', 'Wrist & arm pain']
  },
  LU10: {
    fnZh: ['清肺利咽', '涼血止血', '利關節'],
    fnEn: ['Clear Lung & benefit throat', 'Cool blood & stop bleeding', 'Benefit joints'],
    indZh: ['咽喉腫痛', '失音 / 暴喑', '咳嗽咯血', '發熱', '掌中熱'],
    indEn: ['Sore throat', 'Loss of voice / Sudden aphasia', 'Cough & hemoptysis', 'Fever', 'Heat in palms']
  },
  LU11: {
    fnZh: ['清熱解毒', '利咽開竅', '醒神救逆'],
    fnEn: ['Clear heat & relieve toxicity', 'Benefit throat & open orifices', 'Revive spirit & rescue from collapse'],
    indZh: ['咽喉腫痛 / 喉痺', '熱病發熱', '昏迷 / 急救', '癲狂', '鼻衄'],
    indEn: ['Sore throat / Laryngeal obstruction', 'Febrile disease & high fever', 'Coma / Emergency resuscitation', 'Mania', 'Epistaxis']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (LU_CURRICULUM_DATA[code]) {
    const cData = LU_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} LU channel points.`);
