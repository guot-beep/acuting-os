/**
 * parse-cv-curriculum.js
 * Parses the 13 CONCEPTION VESSEL (REN CHANNEL) curriculum text
 * to extract exact functions and indications, creating 1-to-1 aligned _zh and _en arrays
 * for all 24 Ren Mai channel points (CV1–CV24).
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const CV_CURRICULUM_DATA = {
  CV1: {
    fnZh: ['清利下焦', '調經通便', '醒神救逆'],
    fnEn: ['Clear lower jiao', 'Regulate menses & unblock bowels', 'Revive spirit & rescue from collapse'],
    indZh: ['小便不利', '遺精', '月經不調', '陰癢', '溺水急救 / 昏迷', '痔疾'],
    indEn: ['Difficult urination', 'Spermatorrhea', 'Irregular menses', 'Pudendal itching', 'Drowning resuscitation / Coma', 'Hemorrhoids']
  },
  CV2: {
    fnZh: ['清熱利濕', '調經止帶', '通利下焦'],
    fnEn: ['Clear heat & drain dampness', 'Regulate menses & arrest leukorrhea', 'Unblock lower jiao'],
    indZh: ['小便不利', '遺尿', '赤白帶下', '陰癢', '疝氣'],
    indEn: ['Difficult urination', 'Enuresis', 'Red & white leukorrhea', 'Pudendal itching', 'Hernia']
  },
  CV3: {
    fnZh: ['清熱利濕', '培元固本', '調經止帶', '助氣化水'],
    fnEn: ['Clear heat & drain dampness', 'Fortify original Qi & consolidate root', 'Regulate menses & arrest leukorrhea', 'Promote Qi transformation & fluid movement'],
    indZh: ['小便頻數 / 遺尿', '小便不利', '帶下', '月經不調', '痛經', '陽痿 / 遺精', '小腹痛'],
    indEn: ['Frequent urination / Enuresis', 'Difficult urination', 'Leukorrhea', 'Irregular menses', 'Dysmenorrhea', 'Erectile dysfunction / Spermatorrhea', 'Lower abdominal pain']
  },
  CV4: {
    fnZh: ['培元固本', '補腎壯陽', '調經止帶', '大補元氣'],
    fnEn: ['Fortify original Qi & consolidate root', 'Tonify Kidney & strengthen Yang', 'Regulate menses & arrest leukorrhea', 'Strongly tonify original Qi'],
    indZh: ['虛勞羸瘦', '陽痿遺精', '月經不調 / 崩漏', '帶下', '不孕', '小腹痛 / 疝氣', '遺尿'],
    indEn: ['Deficiency fatigue & emaciation', 'Erectile dysfunction & spermatorrhea', 'Irregular menses / Uterine bleeding', 'Leukorrhea', 'Infertility', 'Lower abdominal pain / Hernia', 'Enuresis']
  },
  CV5: {
    fnZh: ['健脾益氣', '培元固本', '通利小便'],
    fnEn: ['Fortify Spleen & benefit Qi', 'Consolidate original Qi', 'Promote urination'],
    indZh: ['小便不利', '遺尿', '腹脹', '水腫', '崩漏', '帶下'],
    indEn: ['Difficult urination', 'Enuresis', 'Abdominal distension', 'Edema', 'Uterine bleeding', 'Leukorrhea']
  },
  CV6: {
    fnZh: ['培補元氣', '大補虛勞', '理氣活血', '升陽舉陷'],
    fnEn: ['Tonify original Qi', 'Strongly relieve deficiency fatigue', 'Regulate Qi & invigorate blood', 'Raise Yang & lift prolapse'],
    indZh: ['虛損羸瘦', '腹脹', '腹瀉', '月經不調', '崩漏', '陰挺 / 脫肛', '陽痿'],
    indEn: ['Deficiency emaciation', 'Abdominal distension', 'Diarrhea', 'Irregular menses', 'Uterine bleeding', 'Uterine prolapse / Rectal prolapse', 'Erectile dysfunction']
  },
  CV7: {
    fnZh: ['調經止帶', '理氣止痛'],
    fnEn: ['Regulate menses & arrest leukorrhea', 'Regulate Qi & stop pain'],
    indZh: ['月經不調', '帶下', '崩漏', '小腹痛', '水腫'],
    indEn: ['Irregular menses', 'Leukorrhea', 'Uterine bleeding', 'Lower abdominal pain', 'Edema']
  },
  CV8: {
    fnZh: ['溫陽救逆', '健脾和胃', '固本止瀉', '理氣止痛'],
    fnEn: ['Warm Yang & rescue from collapse', 'Fortify Spleen & harmonize Stomach', 'Consolidate root & arrest diarrhea', 'Regulate Qi & stop pain'],
    indZh: ['中風脫證 / 昏迷', '虛寒腹瀉 / 痢疾', '腹痛腹脹', '水腫', '脫肛'],
    indEn: ['Stroke desertion pattern / Coma', 'Deficiency-cold diarrhea / Dysentery', 'Abdominal pain & distension', 'Edema', 'Prolapse of rectum']
  },
  CV9: {
    fnZh: ['健脾利水', '通利小便', '消腫散結'],
    fnEn: ['Fortify Spleen & promote fluid movement', 'Unblock urination', 'Reduce swelling & dissipate nodules'],
    indZh: ['水腫', '小便不利', '腹脹', '腸鳴腹瀉'],
    indEn: ['Edema', 'Difficult urination', 'Abdominal distension', 'Borborygmus & diarrhea']
  },
  CV10: {
    fnZh: ['和胃消食', '理氣止痛'],
    fnEn: ['Harmonize Stomach & digest food', 'Regulate Qi & stop pain'],
    indZh: ['腹脹', '嘔吐', '食谷不化', '胃痛'],
    indEn: ['Abdominal distension', 'Vomiting', 'Undigested food in stool', 'Epigastric pain']
  },
  CV11: {
    fnZh: ['和胃降逆', '健脾利濕'],
    fnEn: ['Harmonize Stomach & descend adverse Qi', 'Fortify Spleen & drain dampness'],
    indZh: ['胃痛', '嘔吐', '腹脹', '腸鳴'],
    indEn: ['Epigastric pain', 'Vomiting', 'Abdominal distension', 'Borborygmus']
  },
  CV12: {
    fnZh: ['和胃健脾', '降逆利濕', '理氣止痛', '培補中氣'],
    fnEn: ['Harmonize Stomach & fortify Spleen', 'Descend adverse Qi & drain dampness', 'Regulate Qi & stop pain', 'Nourish middle Qi'],
    indZh: ['胃痛', '腹脹', '嘔吐', '吞酸', '腹瀉', '黃疸', '癲癇'],
    indEn: ['Epigastric pain', 'Abdominal distension', 'Vomiting', 'Acid regurgitation', 'Diarrhea', 'Jaundice', 'Epilepsy']
  },
  CV13: {
    fnZh: ['和胃降逆', '理氣化痰'],
    fnEn: ['Harmonize Stomach & descend adverse Qi', 'Regulate Qi & transform phlegm'],
    indZh: ['胃痛', '嘔吐', '反胃', '癲癇'],
    indEn: ['Epigastric pain', 'Vomiting', 'Regurgitation', 'Epilepsy']
  },
  CV14: {
    fnZh: ['寬胸理氣', '清心安神', '和胃降逆'],
    fnEn: ['Unbind chest & regulate Qi', 'Clear Heart & calm spirit', 'Harmonize Stomach & descend adverse Qi'],
    indZh: ['心痛心悸', '嘔吐', '吞酸', '癲狂', '胸痛'],
    indEn: ['Cardiac pain & palpitations', 'Vomiting', 'Acid regurgitation', 'Mania / psychosis', 'Chest pain']
  },
  CV15: {
    fnZh: ['清心安神', '寬胸化痰'],
    fnEn: ['Clear Heart & calm spirit', 'Unbind chest & transform phlegm'],
    indZh: ['心痛', '驚悸', '癲狂', '癲癇', '胸腹脹痛'],
    indEn: ['Precordial pain', 'Fright palpitations', 'Mania', 'Epilepsy', 'Chest & abdominal distension']
  },
  CV16: {
    fnZh: ['寬胸理氣', '和胃降逆'],
    fnEn: ['Unbind chest & regulate Qi', 'Harmonize Stomach & descend adverse Qi'],
    indZh: ['胸脅脹痛', '嘔吐', '噎膈'],
    indEn: ['Chest & hypochondriac distension', 'Vomiting', 'Dysphagia / esophageal blockage']
  },
  CV17: {
    fnZh: ['寬胸理氣', '宣肺平喘', '催乳通絡', '降氣止嘔'],
    fnEn: ['Unbind chest & regulate Qi', 'Diffuse Lung & calm asthma', 'Promote lactation & unblock channels', 'Descend Qi & stop vomiting'],
    indZh: ['胸痛', '咳嗽', '氣喘', '產後乳少', '乳癰', '噎膈'],
    indEn: ['Chest pain', 'Cough', 'Asthma', 'Postpartum insufficient lactation', 'Acute mastitis', 'Dysphagia']
  },
  CV18: {
    fnZh: ['寬胸理氣', '宣肺止咳'],
    fnEn: ['Unbind chest & regulate Qi', 'Diffuse Lung & arrest cough'],
    indZh: ['胸痛', '咳嗽', '氣喘', '嘔吐'],
    indEn: ['Chest pain', 'Cough', 'Asthma', 'Vomiting']
  },
  CV19: {
    fnZh: ['寬胸理氣', '宣肺止痛'],
    fnEn: ['Unbind chest & regulate Qi', 'Diffuse Lung & stop pain'],
    indZh: ['胸脅痛', '咳嗽', '氣喘'],
    indEn: ['Chest & hypochondriac pain', 'Cough', 'Asthma']
  },
  CV20: {
    fnZh: ['寬胸利膈', '宣肺平喘'],
    fnEn: ['Unbind chest & benefit diaphragm', 'Diffuse Lung & calm asthma'],
    indZh: ['咳嗽', '氣喘', '胸痛', '咽喉腫痛'],
    indEn: ['Cough', 'Asthma', 'Chest pain', 'Sore throat']
  },
  CV21: {
    fnZh: ['寬胸降氣', '宣肺止咳'],
    fnEn: ['Unbind chest & descend Qi', 'Diffuse Lung & arrest cough'],
    indZh: ['咳嗽', '氣喘', '胸痛', '咽喉腫痛'],
    indEn: ['Cough', 'Asthma', 'Chest pain', 'Sore throat']
  },
  CV22: {
    fnZh: ['宣肺利咽', '降氣平喘', '寬胸理氣', '清熱化痰'],
    fnEn: ['Diffuse Lung & benefit throat', 'Descend Qi & calm asthma', 'Unbind chest & regulate Qi', 'Clear heat & transform phlegm'],
    indZh: ['咳嗽', '氣喘', '暴喑 / 咽喉腫痛', '梅核氣', '噎膈'],
    indEn: ['Cough', 'Asthma', 'Sudden voice loss / Sore throat', 'Plum-pit Qi / Globus hystericus', 'Dysphagia']
  },
  CV23: {
    fnZh: ['利咽舌開竅', '清熱化痰', '降逆止嘔'],
    fnEn: ['Benefit throat & tongue to open orifices', 'Clear heat & transform phlegm', 'Descend adverse Qi & stop vomiting'],
    indZh: ['舌強不語 / 舌下腫痛', '暴喑', '吞咽困難', '唾液多 / 口乾'],
    indEn: ['Tongue stiffness & aphasia / Sublingual swelling', 'Sudden loss of voice', 'Dysphagia / Difficulty swallowing', 'Hypersalivation / Dry mouth']
  },
  CV24: {
    fnZh: ['祛風清熱', '通絡止痛', '消腫利口'],
    fnEn: ['Dispel wind & clear heat', 'Unblock channels & stop pain', 'Reduce swelling & benefit mouth'],
    indZh: ['口眼喎斜', '齒齦腫痛', '流涎', '暴喑', '癲狂'],
    indEn: ['Facial paralysis', 'Swollen & painful gums', 'Drooling / Salivation', 'Sudden loss of voice', 'Mania']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (CV_CURRICULUM_DATA[code]) {
    const cData = CV_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} CV channel points.`);
