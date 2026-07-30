/**
 * parse-te-curriculum.js
 * Parses the 10 SAN JIAO CHANNEL OF HAND SHAO YANG curriculum text
 * to extract exact functions and indications, creating 1-to-1 aligned _zh and _en arrays
 * for all 23 San Jiao channel points (TE1–TE23).
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const TE_CURRICULUM_DATA = {
  TE1: {
    fnZh: ['清熱解毒', '瀉火開竅', '通絡止痛'],
    fnEn: ['Clear heat & relieve toxicity', 'Drain fire & open orifices', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '目赤', '咽喉腫痛', '耳鳴耳聾', '熱病', '昏迷'],
    indEn: ['Headache', 'Red eyes', 'Sore throat', 'Tinnitus & deafness', 'Febrile disease', 'Coma / loss of consciousness']
  },
  TE2: {
    fnZh: ['清熱聰耳', '通絡止痛'],
    fnEn: ['Clear heat & benefit hearing', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '目赤', '耳鳴耳聾', '咽喉腫痛', '手背腫痛'],
    indEn: ['Headache', 'Red eyes', 'Tinnitus & deafness', 'Sore throat', 'Swelling & pain of back of hand']
  },
  TE3: {
    fnZh: ['清熱疏風', '聰耳明目', '通絡止痛'],
    fnEn: ['Clear heat & dispel wind', 'Benefit hearing & brighten eyes', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '目赤', '耳鳴耳聾', '咽喉腫痛', '肩背肘臂酸痛', '熱病'],
    indEn: ['Headache', 'Red eyes', 'Tinnitus & deafness', 'Sore throat', 'Shoulder, back, elbow & arm pain', 'Febrile disease']
  },
  TE4: {
    fnZh: ['清熱散風', '舒筋活絡', '寬胸理氣'],
    fnEn: ['Clear heat & scatter wind', 'Relax sinews & invigorate channels', 'Unbind chest & regulate Qi'],
    indZh: ['腕痛', '肩臂痛', '耳鳴耳聾', '目赤腫痛', '消渴', '瘧疾'],
    indEn: ['Wrist pain', 'Shoulder & arm pain', 'Tinnitus & deafness', 'Redness & swelling of eyes', 'Wasting-thirst', 'Malaria']
  },
  TE5: {
    fnZh: ['解表清熱', '疏風通絡', '聰耳明目', '清熱止痛'],
    fnEn: ['Release exterior & clear heat', 'Dispel wind & unblock channels', 'Benefit hearing & brighten eyes', 'Clear heat & stop pain'],
    indZh: ['感冒發熱', '頭痛項強', '偏頭痛', '耳鳴耳聾', '目赤腫痛', '脅痛', '瘰癧'],
    indEn: ['Fever & common cold', 'Headache & neck stiffness', 'Migraine', 'Tinnitus & deafness', 'Redness & swelling of eyes', 'Hypochondriac pain', 'Scrofula']
  },
  TE6: {
    fnZh: ['清熱解毒', '通便理腸', '活絡止痛', '宣肺利脅'],
    fnEn: ['Clear heat & relieve toxicity', 'Unblock bowels & regulate intestines', 'Invigorate channels & stop pain', 'Diffuse Lung & benefit hypochondrium'],
    indZh: ['便秘', '脅痛', '耳鳴耳聾', '暴喑', '瘰癧', '熱病'],
    indEn: ['Constipation', 'Hypochondriac pain', 'Tinnitus & deafness', 'Sudden loss of voice', 'Scrofula', 'Febrile disease']
  },
  TE7: {
    fnZh: ['清熱疏風', '安神止痛'],
    fnEn: ['Clear heat & dispel wind', 'Calm spirit & relieve pain'],
    indZh: ['耳鳴耳聾', '癲癇', '手臂痛', '脇肋痛'],
    indEn: ['Tinnitus & deafness', 'Epilepsy', 'Arm pain', 'Hypochondriac pain']
  },
  TE8: {
    fnZh: ['開竅聰耳', '通絡止痛'],
    fnEn: ['Open orifices & benefit hearing', 'Unblock channels & stop pain'],
    indZh: ['暴喑', '耳聾', '手臂痛', '齒痛'],
    indEn: ['Sudden loss of voice', 'Deafness', 'Arm pain', 'Toothache']
  },
  TE9: {
    fnZh: ['開竅聰耳', '咽喉利氣'],
    fnEn: ['Open orifices & benefit hearing', 'Benefit throat & regulate Qi'],
    indZh: ['耳聾', '咽喉腫痛', '暴喑', '齒痛', '前臂痛'],
    indEn: ['Deafness', 'Sore throat', 'Sudden loss of voice', 'Toothache', 'Forearm pain']
  },
  TE10: {
    fnZh: ['清熱化痰', '散結消腫', '安神止痛'],
    fnEn: ['Clear heat & transform phlegm', 'Dissipate nodules & reduce swelling', 'Calm spirit & stop pain'],
    indZh: ['瘰癧', '癭氣 / 甲狀腺腫', '耳聾', '心脅痛', '癲癇', '肘臂痛'],
    indEn: ['Scrofula', 'Goiter / thyroid swelling', 'Deafness', 'Precordial & hypochondriac pain', 'Epilepsy', 'Elbow & arm pain']
  },
  TE11: {
    fnZh: ['清熱解毒', '舒筋活絡'],
    fnEn: ['Clear heat & relieve toxicity', 'Relax sinews & invigorate channels'],
    indZh: ['頭痛', '項強', '肘臂痛', '目赤'],
    indEn: ['Headache', 'Neck stiffness', 'Elbow & arm pain', 'Red eyes']
  },
  TE12: {
    fnZh: ['清熱瀉火', '通絡止痛'],
    fnEn: ['Clear heat & drain fire', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '項強', '肩臂痛', '齒痛'],
    indEn: ['Headache', 'Neck stiffness', 'Shoulder & arm pain', 'Toothache']
  },
  TE13: {
    fnZh: ['清熱化痰', '通絡散結'],
    fnEn: ['Clear heat & transform phlegm', 'Unblock channels & dissipate nodules'],
    indZh: ['瘰癧', '肩臂痛', '頭痛', '目赤'],
    indEn: ['Scrofula', 'Shoulder & arm pain', 'Headache', 'Red eyes']
  },
  TE14: {
    fnZh: ['祛風濕', '利肩關節', '通絡止痛'],
    fnEn: ['Dispel wind-dampness', 'Benefit shoulder joint', 'Unblock channels & stop pain'],
    indZh: ['肩關節痛', '肩臂痛', '肩周炎', '手臂不舉'],
    indEn: ['Shoulder joint pain', 'Shoulder & arm pain', 'Frozen shoulder / periarthritis', 'Inability to raise arm']
  },
  TE15: {
    fnZh: ['祛風除濕', '通絡止痛'],
    fnEn: ['Dispel wind & eliminate dampness', 'Unblock channels & stop pain'],
    indZh: ['肩臂痛', '頸項強痛', '胸中煩滿'],
    indEn: ['Shoulder & arm pain', 'Neck & nape stiffness/pain', 'Vexation & fullness in chest']
  },
  TE16: {
    fnZh: ['清頭明目', '聰耳利咽', '散風清熱'],
    fnEn: ['Clear head & brighten eyes', 'Benefit ears & throat', 'Scatter wind & clear heat'],
    indZh: ['頭痛', '項強', '耳鳴耳聾', '目暴腫痛', '瘰癧'],
    indEn: ['Headache', 'Neck rigidity', 'Tinnitus & deafness', 'Sudden eye swelling/pain', 'Scrofula']
  },
  TE17: {
    fnZh: ['聰耳明目', '祛風清熱', '利峽開竅', '活絡止痛'],
    fnEn: ['Benefit hearing & brighten eyes', 'Dispel wind & clear heat', 'Benefit jaw & open orifices', 'Invigorate channels & stop pain'],
    indZh: ['耳鳴耳聾', '耳癤聤耳', '口眼喎斜 / 面癱', '牙關緊閉', '痄腮 / 腮腺炎'],
    indEn: ['Tinnitus & deafness', 'Otitis / ear boil & discharge', 'Facial paralysis / deviation of mouth & eye', 'Trismus / lockjaw', 'Mumps']
  },
  TE18: {
    fnZh: ['清熱聰耳', '鎮驚止痛'],
    fnEn: ['Clear heat & benefit hearing', 'Calm fright & stop pain'],
    indZh: ['頭痛', '耳鳴耳聾', '小兒驚風', '嘔吐'],
    indEn: ['Headache', 'Tinnitus & deafness', 'Infantile convulsions', 'Vomiting']
  },
  TE19: {
    fnZh: ['清熱聰耳', '安神止痛'],
    fnEn: ['Clear heat & benefit hearing', 'Calm spirit & stop pain'],
    indZh: ['頭痛', '耳鳴耳聾', '小兒驚恐', '嘔吐'],
    indEn: ['Headache', 'Tinnitus & deafness', 'Infantile fright', 'Vomiting']
  },
  TE20: {
    fnZh: ['清熱散風', '聰耳明目'],
    fnEn: ['Clear heat & scatter wind', 'Benefit hearing & brighten eyes'],
    indZh: ['頭痛', '耳鳴耳聾', '目赤腫痛', '齒痛', '痄腮'],
    indEn: ['Headache', 'Tinnitus & deafness', 'Redness & swelling of eyes', 'Toothache', 'Mumps']
  },
  TE21: {
    fnZh: ['聰耳利開竅', '清熱止痛'],
    fnEn: ['Benefit hearing & open orifices', 'Clear heat & stop pain'],
    indZh: ['耳鳴耳聾', '聤耳', '齒痛', '唇吻強'],
    indEn: ['Tinnitus & deafness', 'Otitis media / ear discharge', 'Toothache', 'Stiffness of lips']
  },
  TE22: {
    fnZh: ['清熱散風', '聰耳止痛'],
    fnEn: ['Clear heat & scatter wind', 'Benefit hearing & stop pain'],
    indZh: ['頭痛', '耳鳴', '口眼喎斜', '齒痛'],
    indEn: ['Headache', 'Tinnitus', 'Facial paralysis', 'Toothache']
  },
  TE23: {
    fnZh: ['清熱散風', '明目止痛', '鎮驚安神'],
    fnEn: ['Clear heat & scatter wind', 'Brighten eyes & stop pain', 'Calm fright & settle spirit'],
    indZh: ['頭痛', '目赤腫痛', '眼瞼瞤動', '齒痛', '癲癇'],
    indEn: ['Headache', 'Redness & swelling of eyes', 'Eyelid twitching', 'Toothache', 'Epilepsy']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (TE_CURRICULUM_DATA[code]) {
    const cData = TE_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched functions and indications for all ${updated} TE channel points.`);
