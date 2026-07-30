/**
 * parse-gv-curriculum.js
 * Parses the 14 DU CHANNEL (GOVERNING VESSEL) curriculum text
 * to extract exact functions and indications, creating 1-to-1 aligned _zh and _en arrays
 * for all 28 Du Mai channel points (GV1–GV28).
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const GV_CURRICULUM_DATA = {
  GV1: {
    fnZh: ['通調督脈', '固脫止瀉', '清熱利濕', '升陽舉陷'],
    fnEn: ['Unblock Governing Vessel', 'Consolidate desertion & arrest diarrhea', 'Clear heat & drain dampness', 'Raise Yang & lift prolapse'],
    indZh: ['痔疾', '脫肛', '便秘', '腹瀉', '腰脊強痛', '癲癇'],
    indEn: ['Hemorrhoids', 'Rectal prolapse', 'Constipation', 'Diarrhea', 'Lumbar & spinal stiffness/pain', 'Epilepsy']
  },
  GV2: {
    fnZh: ['溫補下焦', '祛風除濕', '通絡止痛'],
    fnEn: ['Warm & tonify lower jiao', 'Dispel wind & eliminate dampness', 'Unblock channels & stop pain'],
    indZh: ['腰骶痛', '下肢痿痺', '月經不調', '帶下', '痔疾'],
    indEn: ['Lumbosacral pain', 'Lower limb weakness & numbness', 'Irregular menses', 'Leukorrhea', 'Hemorrhoids']
  },
  GV3: {
    fnZh: ['溫補腎陽', '祛風除濕', '通利關節'],
    fnEn: ['Warm & tonify Kidney Yang', 'Dispel wind & eliminate dampness', 'Benefit joints'],
    indZh: ['腰骶痛', '下肢麻痺 / 痿痺', '月經不調', '遺精', '帶下'],
    indEn: ['Lumbosacral pain', 'Lower limb numbness / paralysis', 'Irregular menses', 'Spermatorrhea', 'Leukorrhea']
  },
  GV4: {
    fnZh: ['培元固本', '溫補命門火', '壯腰健腎', '固精止帶'],
    fnEn: ['Fortify original Qi & consolidate root', 'Warm & tonify Mingmen Fire', 'Strengthen lumbar & tonify Kidney', 'Consolidate essence & arrest leukorrhea'],
    indZh: ['腰脊強痛', '陽痿遺精', '月經不調', '帶下', '不孕', '虛寒腹瀉', '遺尿'],
    indEn: ['Lumbar & spinal stiffness/pain', 'Erectile dysfunction & spermatorrhea', 'Irregular menses', 'Leukorrhea', 'Infertility', 'Deficiency-cold diarrhea', 'Enuresis']
  },
  GV5: {
    fnZh: ['溫補脾腎', '理氣止痛'],
    fnEn: ['Warm & tonify Spleen & Kidney', 'Regulate Qi & stop pain'],
    indZh: ['腰脊強痛', '腹脹腹瀉', '遺精'],
    indEn: ['Lumbar & spinal stiffness', 'Abdominal distension & diarrhea', 'Spermatorrhea']
  },
  GV6: {
    fnZh: ['健脾利濕', '寧神止痛'],
    fnEn: ['Fortify Spleen & drain dampness', 'Calm spirit & stop pain'],
    indZh: ['腰脊強痛', '腹脹', '黃疸', '癲癇'],
    indEn: ['Lumbar & spinal stiffness', 'Abdominal distension', 'Jaundice', 'Epilepsy']
  },
  GV7: {
    fnZh: ['溫陽健脾', '和胃降逆'],
    fnEn: ['Warm Yang & fortify Spleen', 'Harmonize Stomach & descend adverse Qi'],
    indZh: ['腰脊強痛', '腹脹', '黃疸', '嘔吐'],
    indEn: ['Lumbar & spinal stiffness', 'Abdominal distension', 'Jaundice', 'Vomiting']
  },
  GV8: {
    fnZh: ['舒筋理氣', '鎮驚熄風'],
    fnEn: ['Relax sinews & regulate Qi', 'Calm fright & extinguish wind'],
    indZh: ['脊強反折', '胃痛腹脹', '癲癇', '小兒驚風'],
    indEn: ['Opisthotonos / spinal stiffness', 'Epigastric pain & distension', 'Epilepsy', 'Infantile convulsions']
  },
  GV9: {
    fnZh: ['寬胸理氣', '清熱利膽', '通絡止痛'],
    fnEn: ['Unbind chest & regulate Qi', 'Clear heat & benefit Gallbladder', 'Unblock channels & stop pain'],
    indZh: ['黃疸', '胸脅脹痛', '咳嗽氣喘', '脊背強痛'],
    indEn: ['Jaundice', 'Chest & hypochondriac pain', 'Cough & asthma', 'Spinal & back pain']
  },
  GV10: {
    fnZh: ['宣肺止咳', '清熱解毒'],
    fnEn: ['Diffuse Lung & arrest cough', 'Clear heat & relieve toxicity'],
    indZh: ['咳嗽氣喘', '疔瘡腫毒', '脊背強痛'],
    indEn: ['Cough & asthma', 'Furuncles & toxic swelling', 'Spinal & back stiffness']
  },
  GV11: {
    fnZh: ['清心安神', '宣肺止痛'],
    fnEn: ['Clear Heart & calm spirit', 'Diffuse Lung & stop pain'],
    indZh: ['心痛心悸', '失眠健忘', '咳嗽氣喘', '脊背強痛'],
    indEn: ['Precordial pain & palpitations', 'Insomnia & memory loss', 'Cough & asthma', 'Spinal & back pain']
  },
  GV12: {
    fnZh: ['宣肺平喘', '寧神鎮驚', '清熱解毒'],
    fnEn: ['Diffuse Lung & calm asthma', 'Calm spirit & settle fright', 'Clear heat & relieve toxicity'],
    indZh: ['咳嗽氣喘', '小兒驚風', '癲狂', '疔瘡腫毒', '脊背強痛'],
    indEn: ['Cough & asthma', 'Infantile convulsions', 'Mania / mental clouding', 'Furuncles & toxic swelling', 'Spinal & back pain']
  },
  GV13: {
    fnZh: ['解表清熱', '和營衛'],
    fnEn: ['Release exterior & clear heat', 'Harmonize Ying & Wei'],
    indZh: ['熱病發熱', '瘧疾', '脊背強痛'],
    indEn: ['Febrile diseases & fever', 'Malaria', 'Spinal & back stiffness/pain']
  },
  GV14: {
    fnZh: ['解表清熱', '疏風散寒', '清心寧神', '調和營衛', '清熱解毒'],
    fnEn: ['Release exterior & clear heat', 'Dispel wind & scatter cold', 'Clear Heart & calm spirit', 'Harmonize Ying & Wei', 'Clear heat & relieve toxicity'],
    indZh: ['感冒發熱', '瘧疾', '咳嗽氣喘', '項強脊痛', '骨蒸潮熱', '小兒驚風', '風疹'],
    indEn: ['Fever & common cold', 'Malaria', 'Cough & asthma', 'Neck stiffness & spinal pain', 'Tidal fever & bone steaming', 'Infantile convulsions', 'Urticaria / Rubella']
  },
  GV15: {
    fnZh: ['聰耳利舌', '清心開竅', '通絡止痛'],
    fnEn: ['Benefit ears & tongue', 'Clear Heart & open orifices', 'Unblock channels & stop pain'],
    indZh: ['舌強不語 / 暴喑', '癲狂癲癇', '項強頭痛'],
    indEn: ['Tongue stiffness & aphasia / Voice loss', 'Mania & epilepsy', 'Neck stiffness & headache']
  },
  GV16: {
    fnZh: ['祛風散寒', '清頭明目', '通竅開音', '平肝息風'],
    fnEn: ['Dispel wind & scatter cold', 'Clear head & brighten eyes', 'Open orifices & restore voice', 'Pacify Liver & extinguish wind'],
    indZh: ['頭痛項強', '眩暈', '目眩', '暴喑', '中風半身不遂'],
    indEn: ['Headache & neck stiffness', 'Dizziness', 'Blurred vision', 'Sudden voice loss', 'Stroke & hemiplegia']
  },
  GV17: {
    fnZh: ['清頭明目', '寧神定志'],
    fnEn: ['Clear head & brighten eyes', 'Calm spirit & settle mind'],
    indZh: ['頭痛項強', '目眩', '癲狂'],
    indEn: ['Headache & neck stiffness', 'Dizziness', 'Mania / mental clouding']
  },
  GV18: {
    fnZh: ['清風止痛', '安神定志'],
    fnEn: ['Clear wind & stop pain', 'Calm spirit & settle mind'],
    indZh: ['頭痛', '項強', '癲狂'],
    indEn: ['Headache', 'Neck stiffness', 'Mania / mental clouding']
  },
  GV19: {
    fnZh: ['清熱散風', '寧神止痛'],
    fnEn: ['Clear heat & scatter wind', 'Calm spirit & stop pain'],
    indZh: ['頭痛', '眩暈', '狂證'],
    indEn: ['Headache', 'Dizziness', 'Mania / psychosis']
  },
  GV20: {
    fnZh: ['平肝息風', '清頭明目', '升陽舉陷', '醒腦開竅', '寧神定志'],
    fnEn: ['Pacify Liver & extinguish wind', 'Clear head & brighten eyes', 'Raise Yang & lift prolapse', 'Revive brain & open orifices', 'Calm spirit & settle mind'],
    indZh: ['頭痛眩暈', '中風半身不遂', '脫肛 / 陰挺', '失眠健忘', '神志昏迷', '高血壓 / 低血壓'],
    indEn: ['Headache & dizziness', 'Stroke & hemiplegia', 'Prolapse of rectum / Uterus', 'Insomnia & memory loss', 'Coma / loss of consciousness', 'Hypertension / Hypotension']
  },
  GV21: {
    fnZh: ['清頭散風', '寧神止痛'],
    fnEn: ['Clear head & scatter wind', 'Calm spirit & stop pain'],
    indZh: ['頭痛', '眩暈', '小兒驚風'],
    indEn: ['Headache', 'Dizziness', 'Infantile convulsions']
  },
  GV22: {
    fnZh: ['清頭明目', '通鼻開竅', '平肝息風'],
    fnEn: ['Clear head & brighten eyes', 'Unblock nose & open orifices', 'Pacify Liver & extinguish wind'],
    indZh: ['頭痛', '眩暈', '鼻塞流涕', '小兒驚風'],
    indEn: ['Headache', 'Dizziness', 'Nasal congestion & rhinorrhea', 'Infantile convulsions']
  },
  GV23: {
    fnZh: ['宣肺通鼻', '清頭明目', '寧神止痛'],
    fnEn: ['Diffuse Lung & unblock nose', 'Clear head & brighten eyes', 'Calm spirit & stop pain'],
    indZh: ['頭痛', '鼻塞 / 鼻淵 / 鼻衄', '目赤腫痛', '癲狂'],
    indEn: ['Headache', 'Nasal congestion / Sinusitis / Epistaxis', 'Redness & swelling of eyes', 'Mania']
  },
  GV24: {
    fnZh: ['清心安神', '清頭明目', '通鼻開竅'],
    fnEn: ['Clear Heart & calm spirit', 'Clear head & brighten eyes', 'Unblock nose & open orifices'],
    indZh: ['頭痛', '眩暈', '失眠驚悸', '鼻塞', '癲狂'],
    indEn: ['Headache', 'Dizziness', 'Insomnia & fright palpitations', 'Nasal congestion', 'Mania']
  },
  GV25: {
    fnZh: ['宣肺通鼻', '醒神救逆', '升壓急救'],
    fnEn: ['Diffuse Lung & unblock nose', 'Revive spirit & rescue from collapse', 'Raise blood pressure in emergency'],
    indZh: ['休克昏迷 / 低血壓急救', '鼻塞 / 鼻淵 / 鼻衄', '酒皶鼻'],
    indEn: ['Shock coma / Hypotension resuscitation', 'Nasal congestion / Sinusitis / Epistaxis', 'Rosacea']
  },
  GV26: {
    fnZh: ['醒腦開竅', '清熱解毒', '急救救逆', '通調督脈', '調和陰陽'],
    fnEn: ['Revive brain & open orifices', 'Clear heat & relieve toxicity', 'Emergency resuscitation', 'Unblock Governing Vessel', 'Harmonize Yin & Yang'],
    indZh: ['昏迷休克', '中風口噤', '小兒驚風', '癲狂', '急性腰扭傷', '面腫'],
    indEn: ['Coma & shock', 'Stroke trismus / Lockjaw', 'Infantile convulsions', 'Mania / Psychosis', 'Acute lumbar sprain', 'Facial swelling']
  },
  GV27: {
    fnZh: ['清熱散風', '開竅寧神'],
    fnEn: ['Clear heat & scatter wind', 'Open orifices & calm spirit'],
    indZh: ['癲狂', '口喎', '齒齦腫痛', '鼻塞'],
    indEn: ['Mania', 'Facial deviation', 'Swollen & painful gums', 'Nasal congestion']
  },
  GV28: {
    fnZh: ['清熱止痛', '明目通鼻'],
    fnEn: ['Clear heat & stop pain', 'Brighten eyes & unblock nose'],
    indZh: ['齒齦腫痛', '口喎', '鼻淵', '癲狂'],
    indEn: ['Swollen & painful gums', 'Facial deviation', 'Sinusitis', 'Mania']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (GV_CURRICULUM_DATA[code]) {
    const cData = GV_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} GV channel points.`);
