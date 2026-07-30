/**
 * parse-si-curriculum.js
 * Parses all 19 points of Hand Tai Yang Small Intestine Channel (SI1–SI19)
 * directly from curriculum PDF text and eLotus/AD sources,
 * building 1-to-1 matched clean functions_zh/en and indications_zh/en.
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const SI_CURRICULUM_DATA = {
  SI1: {
    fnZh: ['解表清熱', '利咽通乳', '清心開竅'],
    fnEn: ['Release exterior & clear heat', 'Benefit throat & unblock lactation', 'Clear Heart & open orifices'],
    indZh: ['乳少 / 乳癰', '咽喉腫痛', '熱病昏迷', '目赤腫痛'],
    indEn: ['Insufficient lactation / Acute mastitis', 'Sore throat', 'Febrile coma', 'Eye redness & swelling']
  },
  SI2: {
    fnZh: ['清熱明目', '通絡止痛'],
    fnEn: ['Clear heat & brighten eyes', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '目赤腫痛', '耳鳴', '熱病', '手指麻木痛'],
    indEn: ['Headache', 'Eye redness & swelling', 'Tinnitus', 'Febrile disease', 'Finger numbness & pain']
  },
  SI3: {
    fnZh: ['清頭明目', '寧神息風', '通調督脈', '舒筋活絡'],
    fnEn: ['Clear head & brighten eyes', 'Calm spirit & extinguish wind', 'Unblock Du Mai', 'Relax sinews & invigorate collaterals'],
    indZh: ['頭痛項強', '目赤腫痛', '耳鳴耳聾', '癲狂癲癇', '腰脊強痛', '手指麻木'],
    indEn: ['Headache & neck stiffness', 'Eye redness & swelling', 'Tinnitus & deafness', 'Mania & epilepsy', 'Lumbar & spinal stiffness/pain', 'Finger numbness']
  },
  SI4: {
    fnZh: ['清熱利膽', '舒筋通絡'],
    fnEn: ['Clear heat & benefit Gallbladder', 'Relax sinews & unblock channels'],
    indZh: ['黃疸', '頭痛項強', '腕痛', '熱病無汗'],
    indEn: ['Jaundice', 'Headache & neck stiffness', 'Wrist pain', 'Febrile disease without sweating']
  },
  SI5: {
    fnZh: ['清熱解毒', '聰耳明目', '安神止痛'],
    fnEn: ['Clear heat & relieve toxicity', 'Benefit ears & brighten eyes', 'Calm spirit & stop pain'],
    indZh: ['頭痛項強', '目赤腫痛', '耳鳴耳聾', '齒痛', '癲狂'],
    indEn: ['Headache & neck stiffness', 'Eye redness & swelling', 'Tinnitus & deafness', 'Toothache', 'Mania']
  },
  SI6: {
    fnZh: ['清頭明目', '舒筋通絡', '通利關節'],
    fnEn: ['Clear head & brighten eyes', 'Relax sinews & unblock channels', 'Benefit joints'],
    indZh: ['目視不明', '肩背肘臂酸痛', '腰痛'],
    indEn: ['Blurred vision', 'Shoulder, back, elbow & arm pain', 'Lumbar pain']
  },
  SI7: {
    fnZh: ['清心安神', '解表清熱', '通絡止痛'],
    fnEn: ['Clear Heart & calm spirit', 'Release exterior & clear heat', 'Unblock channels & stop pain'],
    indZh: ['頭痛項強', '熱病', '癲狂', '肘臂痛'],
    indEn: ['Headache & neck stiffness', 'Febrile disease', 'Mania', 'Elbow & arm pain']
  },
  SI8: {
    fnZh: ['清熱消腫', '散結通絡'],
    fnEn: ['Clear heat & reduce swelling', 'Dissipate nodules & unblock channels'],
    indZh: ['頭痛項強', '耳鳴耳聾', '瘰癧', '肘臂痛'],
    indEn: ['Headache & neck stiffness', 'Tinnitus & deafness', 'Scrofula', 'Elbow & arm pain']
  },
  SI9: {
    fnZh: ['舒筋活絡', '理氣止痛'],
    fnEn: ['Relax sinews & invigorate collaterals', 'Regulate Qi & stop pain'],
    indZh: ['肩臂痛', '手臂不舉', '耳鳴'],
    indEn: ['Shoulder & arm pain', 'Inability to raise arm', 'Tinnitus']
  },
  SI10: {
    fnZh: ['舒筋活絡', '通利關節'],
    fnEn: ['Relax sinews & invigorate collaterals', 'Benefit joints & stop pain'],
    indZh: ['肩臂痛', '瘰癧'],
    indEn: ['Shoulder & arm pain', 'Scrofula']
  },
  SI11: {
    fnZh: ['寬胸理氣', '通乳止痛', '舒筋活絡'],
    fnEn: ['Unbind chest & regulate Qi', 'Promote lactation & stop pain', 'Relax sinews & invigorate collaterals'],
    indZh: ['肩胛酸痛', '氣喘', '產後乳少 / 乳癰'],
    indEn: ['Scapular pain & soreness', 'Asthma', 'Postpartum insufficient lactation / Mastitis']
  },
  SI12: {
    fnZh: ['祛風活絡', '通利關節'],
    fnEn: ['Dispel wind & invigorate collaterals', 'Benefit joints & stop pain'],
    indZh: ['肩臂痛', '手臂不舉'],
    indEn: ['Shoulder & arm pain', 'Inability to raise arm']
  },
  SI13: {
    fnZh: ['舒筋活絡', '理氣止痛'],
    fnEn: ['Relax sinews & invigorate collaterals', 'Regulate Qi & stop pain'],
    indZh: ['肩胛痛', '手臂酸痛'],
    indEn: ['Scapular pain', 'Arm pain & soreness']
  },
  SI14: {
    fnZh: ['宣肺散寒', '通絡止痛'],
    fnEn: ['Diffuse Lung & scatter cold', 'Unblock channels & stop pain'],
    indZh: ['肩背酸痛', '頸項強痛'],
    indEn: ['Shoulder & back pain', 'Neck stiffness']
  },
  SI15: {
    fnZh: ['宣肺止咳', '通絡止痛'],
    fnEn: ['Diffuse Lung & arrest cough', 'Unblock channels & stop pain'],
    indZh: ['肩背痛', '咳嗽氣喘'],
    indEn: ['Shoulder & back pain', 'Cough & asthma']
  },
  SI16: {
    fnZh: ['聰耳利咽', '散結止痛'],
    fnEn: ['Benefit ears & throat', 'Dissipate nodules & stop pain'],
    indZh: ['耳鳴耳聾', '咽喉腫痛', '暴喑', '瘰癧'],
    indEn: ['Tinnitus & deafness', 'Sore throat', 'Sudden loss of voice', 'Scrofula']
  },
  SI17: {
    fnZh: ['利咽消腫', '聰耳散結'],
    fnEn: ['Benefit throat & reduce swelling', 'Benefit ears & dissipate nodules'],
    indZh: ['耳鳴耳聾', '咽喉腫痛', '瘰癧', '頰腫'],
    indEn: ['Tinnitus & deafness', 'Sore throat', 'Scrofula', 'Cheek swelling']
  },
  SI18: {
    fnZh: ['祛風止痛', '消腫利齒'],
    fnEn: ['Dispel wind & stop pain', 'Reduce swelling & benefit teeth'],
    indZh: ['口眼喎斜', '面痛 / 三叉神經痛', '齒痛', '目黃'],
    indEn: ['Facial paralysis', 'Facial pain / Trigeminal neuralgia', 'Toothache', 'Yellow sclera']
  },
  SI19: {
    fnZh: ['聰耳通竅', '清熱止痛'],
    fnEn: ['Benefit ears & open orifices', 'Clear heat & stop pain'],
    indZh: ['耳鳴', '耳聾', '聤耳 / 中耳炎', '齒痛', '癲狂'],
    indEn: ['Tinnitus', 'Deafness', 'Otitis media / Ear discharge', 'Toothache', 'Mania']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (SI_CURRICULUM_DATA[code]) {
    const cData = SI_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} SI channel points.`);
