/**
 * parse-te-curriculum.js
 * Parses all 23 points of Hand Shao Yang Triple Burner / Sanjiao Channel (TE1–TE23)
 * directly from curriculum PDF text and eLotus/AD sources,
 * building 1-to-1 matched clean functions_zh/en and indications_zh/en.
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const TE_CURRICULUM_DATA = {
  TE1: {
    fnZh: ['解表清熱', '清利頭目', '利咽開竅'],
    fnEn: ['Release exterior & clear heat', 'Clear head & eyes', 'Benefit throat & open orifices'],
    indZh: ['頭痛', '目赤腫痛', '咽喉腫痛', '熱病昏迷', '耳鳴耳聾'],
    indEn: ['Headache', 'Eye redness & swelling', 'Sore throat', 'Febrile coma', 'Tinnitus & deafness']
  },
  TE2: {
    fnZh: ['清熱散風', '聰耳明目', '通絡止痛'],
    fnEn: ['Clear heat & scatter wind', 'Benefit ears & eyes', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '目赤腫痛', '耳鳴耳聾', '咽喉腫痛', '手指麻木痛'],
    indEn: ['Headache', 'Eye redness & swelling', 'Tinnitus & deafness', 'Sore throat', 'Finger numbness & pain']
  },
  TE3: {
    fnZh: ['清熱解表', '聰耳明目', '通絡止痛'],
    fnEn: ['Clear heat & release exterior', 'Benefit ears & eyes', 'Unblock channels & stop pain'],
    indZh: ['頭痛項強', '耳鳴耳聾', '目赤腫痛', '咽喉腫痛', '熱病', '手背脊痛'],
    indEn: ['Headache & neck stiffness', 'Tinnitus & deafness', 'Eye redness & swelling', 'Sore throat', 'Febrile disease', 'Dorsal hand & spine pain']
  },
  TE4: {
    fnZh: ['疏肝理氣', '清熱利膽', '通絡止痛'],
    fnEn: ['Soothe Liver & regulate Qi', 'Clear heat & benefit Gallbladder', 'Unblock channels & stop pain'],
    indZh: ['耳鳴耳聾', '頭痛項強', '黃疸 / 脅痛', '消渴', '腕關節痛'],
    indEn: ['Tinnitus & deafness', 'Headache & neck stiffness', 'Jaundice / Hypochondriac pain', 'Wasting-thirst', 'Wrist joint pain']
  },
  TE5: {
    fnZh: ['疏風解表', '清熱開竅', '通調陽維', '通絡止痛'],
    fnEn: ['Dispel wind & release exterior', 'Clear heat & open orifices', 'Unblock Yang Wei Mai', 'Unblock channels & stop pain'],
    indZh: ['外感發熱', '頭痛項強', '耳鳴耳聾', '目赤腫痛', '偏頭痛 / 脅痛', '上肢痿痺痛'],
    indEn: ['Exterior fever & common cold', 'Headache & neck stiffness', 'Tinnitus & deafness', 'Eye redness & swelling', 'Migraine / Hypochondriac pain', 'Upper limb pain/paralysis']
  },
  TE6: {
    fnZh: ['清熱理氣', '通便止痛', '疏肝利膽', '聰耳明目'],
    fnEn: ['Clear heat & regulate Qi', 'Unblock constipation & stop pain', 'Soothe Liver & benefit Gallbladder', 'Benefit ears & eyes'],
    indZh: ['便秘', '脅肋痛', '耳鳴耳聾', '暴喑', '熱病', '手臂痛'],
    indEn: ['Constipation', 'Hypochondriac pain', 'Tinnitus & deafness', 'Sudden loss of voice', 'Febrile disease', 'Arm pain']
  },
  TE7: {
    fnZh: ['清熱安神', '聰耳止痛'],
    fnEn: ['Clear heat & calm spirit', 'Benefit ears & stop pain'],
    indZh: ['耳鳴耳聾', '癲狂', '頸項強痛'],
    indEn: ['Tinnitus & deafness', 'Mania', 'Neck pain & stiffness']
  },
  TE8: {
    fnZh: ['清熱通絡', '聰耳利咽'],
    fnEn: ['Clear heat & unblock channels', 'Benefit ears & throat'],
    indZh: ['耳鳴耳聾', '暴喑 / 咽喉腫痛', '手臂痛'],
    indEn: ['Tinnitus & deafness', 'Sudden loss of voice / Sore throat', 'Arm pain']
  },
  TE9: {
    fnZh: ['清熱利咽', '通絡止痛'],
    fnEn: ['Clear heat & benefit throat', 'Unblock channels & stop pain'],
    indZh: ['咽喉腫痛', '耳聾', '齒痛', '手臂痛'],
    indEn: ['Sore throat', 'Deafness', 'Toothache', 'Arm pain']
  },
  TE10: {
    fnZh: ['清熱化痰', '散結寧神', '通絡止痛'],
    fnEn: ['Clear heat & transform phlegm', 'Dissipate nodules & calm spirit', 'Unblock channels & stop pain'],
    indZh: ['瘰癧', '偏頭痛', '癲狂', '肘臂痛', '咳嗽氣喘'],
    indEn: ['Scrofula', 'Migraine', 'Mania', 'Elbow & arm pain', 'Cough & asthma']
  },
  TE11: {
    fnZh: ['舒筋活絡', '清熱止痛'],
    fnEn: ['Relax sinews & invigorate collaterals', 'Clear heat & stop pain'],
    indZh: ['肘臂痛', '瘰癧'],
    indEn: ['Elbow & arm pain', 'Scrofula']
  },
  TE12: {
    fnZh: ['舒筋通絡', '理氣止痛'],
    fnEn: ['Relax sinews & unblock channels', 'Regulate Qi & stop pain'],
    indZh: ['肩臂痛', '頸項強痛'],
    indEn: ['Shoulder & arm pain', 'Neck pain & stiffness']
  },
  TE13: {
    fnZh: ['舒筋活絡', '散結止痛'],
    fnEn: ['Relax sinews & invigorate collaterals', 'Dissipate nodules & stop pain'],
    indZh: ['肩臂痛', '瘰癧'],
    indEn: ['Shoulder & arm pain', 'Scrofula']
  },
  TE14: {
    fnZh: ['祛風除濕', '通利關節', '舒筋活絡'],
    fnEn: ['Dispel wind & eliminate dampness', 'Benefit joints', 'Relax sinews & invigorate collaterals'],
    indZh: ['肩關節痛 / 肩周炎', '手臂不舉 / 麻木'],
    indEn: ['Shoulder joint pain / Frozen shoulder', 'Inability to raise arm / Numbness']
  },
  TE15: {
    fnZh: ['祛風通絡', '清熱止痛'],
    fnEn: ['Dispel wind & unblock channels', 'Clear heat & stop pain'],
    indZh: ['肩臂酸痛', '頸項強痛'],
    indEn: ['Shoulder & arm pain/soreness', 'Neck pain & stiffness']
  },
  TE16: {
    fnZh: ['聰耳明目', '清熱散結'],
    fnEn: ['Benefit ears & eyes', 'Clear heat & dissipate nodules'],
    indZh: ['耳鳴耳聾', '暴喑', '目痛', '瘰癧', '頸項強痛'],
    indEn: ['Tinnitus & deafness', 'Sudden loss of voice', 'Eye pain', 'Scrofula', 'Neck pain & stiffness']
  },
  TE17: {
    fnZh: ['聰耳通竅', '祛風清熱', '消腫止痛'],
    fnEn: ['Benefit ears & open orifices', 'Dispel wind & clear heat', 'Reduce swelling & stop pain'],
    indZh: ['耳鳴耳聾', '聤耳 / 中耳炎', '口眼喎斜', '齒痛', '頰腫'],
    indEn: ['Tinnitus & deafness', 'Otitis media / Ear discharge', 'Facial paralysis', 'Toothache', 'Cheek swelling']
  },
  TE18: {
    fnZh: ['清熱聰耳', '平肝息風'],
    fnEn: ['Clear heat & benefit ears', 'Pacify Liver & extinguish wind'],
    indZh: ['頭痛', '耳鳴耳聾', '小兒驚風'],
    indEn: ['Headache', 'Tinnitus & deafness', 'Infantile convulsions']
  },
  TE19: {
    fnZh: ['聰耳鎮驚', '清頭止痛'],
    fnEn: ['Benefit ears & settle fright', 'Clear head & stop pain'],
    indZh: ['頭痛', '耳鳴耳聾', '癲癇'],
    indEn: ['Headache', 'Tinnitus & deafness', 'Epilepsy']
  },
  TE20: {
    fnZh: ['聰耳明目', '祛風止痛'],
    fnEn: ['Benefit ears & eyes', 'Dispel wind & stop pain'],
    indZh: ['耳鳴', '齒痛', '唇頸強硬'],
    indEn: ['Tinnitus', 'Toothache', 'Lip & neck stiffness']
  },
  TE21: {
    fnZh: ['聰耳通竅', '清熱止痛'],
    fnEn: ['Benefit ears & open orifices', 'Clear heat & stop pain'],
    indZh: ['耳鳴耳聾', '聤耳', '齒痛', '下頜關節痛'],
    indEn: ['Tinnitus & deafness', 'Otitis media', 'Toothache', 'TMJ pain']
  },
  TE22: {
    fnZh: ['祛風通絡', '清頭止痛'],
    fnEn: ['Dispel wind & unblock channels', 'Clear head & stop pain'],
    indZh: ['偏頭痛', '耳鳴', '口眼喎斜'],
    indEn: ['Migraine', 'Tinnitus', 'Facial paralysis']
  },
  TE23: {
    fnZh: ['清熱明目', '祛風止痛'],
    fnEn: ['Clear heat & brighten eyes', 'Dispel wind & stop pain'],
    indZh: ['頭痛', '目赤腫痛', '眼瞼瞤動', '齒痛'],
    indEn: ['Headache', 'Eye redness & swelling', 'Eyelid twitching', 'Toothache']
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
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} TE/SJ channel points.`);
