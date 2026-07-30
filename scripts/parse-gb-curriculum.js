/**
 * parse-gb-curriculum.js
 * Parses all 44 points of Foot Shao Yang Gallbladder Channel (GB1–GB44)
 * directly from curriculum PDF text and eLotus/AD sources,
 * building 1-to-1 matched clean functions_zh/en and indications_zh/en.
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const GB_CURRICULUM_DATA = {
  GB1: {
    fnZh: ['清熱明目', '疏風通絡'],
    fnEn: ['Clear heat & benefit eyes', 'Dispel wind & unblock channels'],
    indZh: ['目赤腫痛', '目翳', '夜盲', '頭痛'],
    indEn: ['Eye redness & swelling', 'Eye opacity / Pterygium', 'Night blindness', 'Headache']
  },
  GB2: {
    fnZh: ['聰耳通竅', '清熱疏風', '通絡止痛'],
    fnEn: ['Benefit ears & open orifices', 'Clear heat & dispel wind', 'Unblock channels & stop pain'],
    indZh: ['耳鳴', '耳聾', '聤耳 / 中耳炎', '齒痛', '口眼喎斜'],
    indEn: ['Tinnitus', 'Deafness', 'Otitis media / Ear discharge', 'Toothache', 'Facial paralysis']
  },
  GB3: {
    fnZh: ['聰耳利齒', '疏風通絡'],
    fnEn: ['Benefit ears & teeth', 'Dispel wind & unblock channels'],
    indZh: ['耳鳴耳聾', '齒痛', '口眼喎斜', '偏頭痛'],
    indEn: ['Tinnitus & deafness', 'Toothache', 'Facial paralysis', 'Migraine']
  },
  GB4: {
    fnZh: ['清頭散風', '通絡止痛'],
    fnEn: ['Clear head & scatter wind', 'Unblock channels & stop pain'],
    indZh: ['偏頭痛', '目赤腫痛', '齒痛'],
    indEn: ['Migraine', 'Eye redness & swelling', 'Toothache']
  },
  GB5: {
    fnZh: ['清頭止痛', '宣肺通絡'],
    fnEn: ['Clear head & stop pain', 'Diffuse Lung & unblock channels'],
    indZh: ['偏頭痛', '目赤腫痛', '齒痛'],
    indEn: ['Migraine', 'Eye redness & swelling', 'Toothache']
  },
  GB6: {
    fnZh: ['清頭瀉火', '通絡止痛'],
    fnEn: ['Clear head & drain fire', 'Unblock channels & stop pain'],
    indZh: ['偏頭痛', '面腫', '目赤腫痛'],
    indEn: ['Migraine', 'Facial swelling', 'Eye redness & swelling']
  },
  GB7: {
    fnZh: ['清熱解毒', '疏風止痛'],
    fnEn: ['Clear heat & relieve toxicity', 'Dispel wind & stop pain'],
    indZh: ['偏頭痛', '頰腫', '齒痛', '小兒驚風'],
    indEn: ['Migraine', 'Cheek swelling', 'Toothache', 'Infantile convulsions']
  },
  GB8: {
    fnZh: ['和胃降逆', '清頭醒腦', '止嘔安神'],
    fnEn: ['Harmonize Stomach & descend Qi', 'Clear head & revive brain', 'Arrest vomiting & calm spirit'],
    indZh: ['偏頭痛', '醉酒嘔吐', '眩暈', '小兒驚風'],
    indEn: ['Migraine', 'Alcoholic intoxication vomiting', 'Dizziness', 'Infantile convulsions']
  },
  GB9: {
    fnZh: ['清熱安神', '通絡止痛'],
    fnEn: ['Clear heat & calm spirit', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '齒痛', '癲狂'],
    indEn: ['Headache', 'Toothache', 'Mania']
  },
  GB10: {
    fnZh: ['清頭明目', '通絡止痛'],
    fnEn: ['Clear head & brighten eyes', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '頸項強痛', '耳鳴'],
    indEn: ['Headache', 'Neck stiffness', 'Tinnitus']
  },
  GB11: {
    fnZh: ['清熱聰耳', '通絡止痛'],
    fnEn: ['Clear heat & benefit ears', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '耳鳴耳聾', '齒痛'],
    indEn: ['Headache', 'Tinnitus & deafness', 'Toothache']
  },
  GB12: {
    fnZh: ['聰耳明目', '平肝息風', '安神定志'],
    fnEn: ['Benefit ears & brighten eyes', 'Pacify Liver & extinguish wind', 'Calm spirit & settle mind'],
    indZh: ['頭痛', '頸項強痛', '耳鳴耳聾', '齒痛', '失眠'],
    indEn: ['Headache', 'Neck stiffness', 'Tinnitus & deafness', 'Toothache', 'Insomnia']
  },
  GB13: {
    fnZh: ['清心安神', '平肝息風'],
    fnEn: ['Clear Heart & calm spirit', 'Pacify Liver & extinguish wind'],
    indZh: ['頭痛', '癲癇', '小兒驚風'],
    indEn: ['Headache', 'Epilepsy', 'Infantile convulsions']
  },
  GB14: {
    fnZh: ['清頭明目', '祛風止痛', '疏肝理氣'],
    fnEn: ['Clear head & brighten eyes', 'Dispel wind & stop pain', 'Soothe Liver & regulate Qi'],
    indZh: ['前頭痛', '目赤腫痛', '眼瞼下垂', '口眼喎斜'],
    indEn: ['Frontal headache', 'Eye redness & swelling', 'Ptosis of eyelid', 'Facial paralysis']
  },
  GB15: {
    fnZh: ['清頭明目', '通鼻開竅'],
    fnEn: ['Clear head & brighten eyes', 'Unblock nose & open orifices'],
    indZh: ['頭痛', '目眩', '鼻塞'],
    indEn: ['Headache', 'Dizziness', 'Nasal congestion']
  },
  GB16: {
    fnZh: ['清頭明目', '疏風止痛'],
    fnEn: ['Clear head & brighten eyes', 'Dispel wind & stop pain'],
    indZh: ['頭痛', '目赤腫痛', '鼻塞'],
    indEn: ['Headache', 'Eye redness & swelling', 'Nasal congestion']
  },
  GB17: {
    fnZh: ['清熱明目', '通絡止痛'],
    fnEn: ['Clear heat & brighten eyes', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '目赤腫痛', '鼻塞'],
    indEn: ['Headache', 'Eye redness & swelling', 'Nasal congestion']
  },
  GB18: {
    fnZh: ['清頭通鼻', '疏風止痛'],
    fnEn: ['Clear head & unblock nose', 'Dispel wind & stop pain'],
    indZh: ['頭痛', '目眩', '鼻塞 / 鼻衄'],
    indEn: ['Headache', 'Dizziness', 'Nasal congestion / Epistaxis']
  },
  GB19: {
    fnZh: ['清頭安神', '通絡止痛'],
    fnEn: ['Clear head & calm spirit', 'Unblock channels & stop pain'],
    indZh: ['頭痛項強', '目眩', '癲狂'],
    indEn: ['Headache & neck stiffness', 'Dizziness', 'Mania']
  },
  GB20: {
    fnZh: ['祛風解表', '清頭明目', '平肝息風', '通竅聰耳', '寧神止痛'],
    fnEn: ['Dispel wind & release exterior', 'Clear head & brighten eyes', 'Pacify Liver & extinguish wind', 'Unblock orifices & benefit ears', 'Calm spirit & stop pain'],
    indZh: ['頭痛眩暈', '感冒發熱', '頸項強痛', '目赤腫痛', '耳鳴耳聾', '中風口眼喎斜', '失眠'],
    indEn: ['Headache & dizziness', 'Common cold & fever', 'Neck stiffness', 'Eye redness & swelling', 'Tinnitus & deafness', 'Stroke facial paralysis', 'Insomnia']
  },
  GB21: {
    fnZh: ['祛風清熱', '舒筋活絡', '降逆下氣', '催產通乳', '消腫散結'],
    fnEn: ['Dispel wind & clear heat', 'Relax sinews & invigorate collaterals', 'Descend adverse Qi', 'Promote labor & unblock lactation', 'Reduce swelling & dissipate nodules'],
    indZh: ['肩背酸痛', '手臂不舉 / 肩周炎', '乳癰 / 產後乳少', '難產', '頸項強痛', '瘰癧'],
    indEn: ['Shoulder & back pain', 'Arm weakness / Frozen shoulder', 'Acute mastitis / Insufficient lactation', 'Difficult labor / Prolonged labor', 'Neck stiffness', 'Scrofula']
  },
  GB22: {
    fnZh: ['寬胸理氣', '通絡止痛'],
    fnEn: ['Unbind chest & regulate Qi', 'Unblock channels & stop pain'],
    indZh: ['胸脇脹痛', '腋下腫痛', '手臂不舉'],
    indEn: ['Chest & hypochondriac pain', 'Axillary swelling & pain', 'Inability to raise arm']
  },
  GB23: {
    fnZh: ['寬胸理氣', '降逆止嘔'],
    fnEn: ['Unbind chest & regulate Qi', 'Descend adverse Qi & arrest vomiting'],
    indZh: ['胸脇脹痛', '嘔吐', '吞酸'],
    indEn: ['Chest & hypochondriac pain', 'Vomiting', 'Acid regurgitation']
  },
  GB24: {
    fnZh: ['疏肝利膽', '和胃降逆', '理氣化濕'],
    fnEn: ['Soothe Liver & benefit Gallbladder', 'Harmonize Stomach & descend Qi', 'Regulate Qi & transform dampness'],
    indZh: ['黃疸', '脅肋痛 / 膽囊炎', '嘔吐吞酸', '呃逆'],
    indEn: ['Jaundice', 'Hypochondriac pain / Cholecystitis', 'Vomiting & acid regurgitation', 'Hiccup']
  },
  GB25: {
    fnZh: ['溫補腎陽', '健脾利水', '理氣止痛'],
    fnEn: ['Warm & tonify Kidney Yang', 'Fortify Spleen & promote fluid movement', 'Regulate Qi & stop pain'],
    indZh: ['腰痛', '腹脹腹瀉', '水腫', '小便不利'],
    indEn: ['Lumbar pain', 'Abdominal distension & diarrhea', 'Edema', 'Difficult urination']
  },
  GB26: {
    fnZh: ['調經止帶', '理氣止痛', '溫陽固本'],
    fnEn: ['Regulate menses & arrest leukorrhea', 'Regulate Qi & stop pain', 'Warm Yang & consolidate root'],
    indZh: ['月經不調', '帶下', '疝氣', '腰脇痛'],
    indEn: ['Irregular menses', 'Leukorrhea', 'Hernia', 'Lumbar & hypochondriac pain']
  },
  GB27: {
    fnZh: ['調經止帶', '理氣化滯'],
    fnEn: ['Regulate menses & arrest leukorrhea', 'Regulate Qi & resolve stagnation'],
    indZh: ['帶下', '月經不調', '小腹痛 / 疝氣'],
    indEn: ['Leukorrhea', 'Irregular menses', 'Lower abdominal pain / Hernia']
  },
  GB28: {
    fnZh: ['調經止帶', '通絡止痛'],
    fnEn: ['Regulate menses & arrest leukorrhea', 'Unblock channels & stop pain'],
    indZh: ['帶下', '月經不調', '小腹痛', '腰腿痛'],
    indEn: ['Leukorrhea', 'Irregular menses', 'Lower abdominal pain', 'Lumbar & leg pain']
  },
  GB29: {
    fnZh: ['舒筋活絡', '通利關節'],
    fnEn: ['Relax sinews & invigorate collaterals', 'Benefit joints & stop pain'],
    indZh: ['髖關節痛', '腰腿痛', '下肢痿痺'],
    indEn: ['Hip joint pain', 'Lumbar & leg pain', 'Lower limb weakness & paralysis']
  },
  GB30: {
    fnZh: ['祛風除濕', '舒筋活絡', '通利關節', '行氣止痛'],
    fnEn: ['Dispel wind & eliminate dampness', 'Relax sinews & invigorate collaterals', 'Benefit joints', 'Promote Qi & stop pain'],
    indZh: ['坐骨神經痛', '腰腿痛', '下肢痿痺 / 麻木', '髖關節痛'],
    indEn: ['Sciatica', 'Lumbar & leg pain', 'Lower limb weakness / numbness', 'Hip joint pain']
  },
  GB31: {
    fnZh: ['祛風止癢', '舒筋活絡', '通利關節'],
    fnEn: ['Dispel wind & arrest itching', 'Relax sinews & invigorate collaterals', 'Benefit joints'],
    indZh: ['蕁麻疹 / 皮膚瘙癢', '下肢痿痺 / 麻木', '膝股痛'],
    indEn: ['Urticaria / Pruritus', 'Lower limb paralysis / numbness', 'Knee & thigh pain']
  },
  GB32: {
    fnZh: ['祛風散寒', '舒筋止痛'],
    fnEn: ['Dispel wind & scatter cold', 'Relax sinews & stop pain'],
    indZh: ['股膝風痛', '下肢麻木'],
    indEn: ['Thigh & knee pain', 'Lower limb numbness']
  },
  GB33: {
    fnZh: ['舒筋活絡', '利膝止痛'],
    fnEn: ['Relax sinews & invigorate collaterals', 'Benefit knee & stop pain'],
    indZh: ['膝關節腫痛', '下肢麻木'],
    indEn: ['Knee joint swelling & pain', 'Lower limb numbness']
  },
  GB34: {
    fnZh: ['疏肝利膽', '舒筋利節', '清熱利濕', '降逆止嘔', '通絡止痛'],
    fnEn: ['Soothe Liver & benefit Gallbladder', 'Relax sinews & benefit joints', 'Clear heat & drain dampness', 'Descend Qi & stop vomiting', 'Unblock channels & stop pain'],
    indZh: ['黃疸', '脅肋痛 / 膽囊炎', '膝關節痛', '下肢痿痺', '口苦嘔吐'],
    indEn: ['Jaundice', 'Hypochondriac pain / Cholecystitis', 'Knee joint pain', 'Lower limb weakness', 'Bitter taste & vomiting']
  },
  GB35: {
    fnZh: ['清熱解毒', '舒筋通絡'],
    fnEn: ['Clear heat & relieve toxicity', 'Relax sinews & unblock channels'],
    indZh: ['胸脅痛', '膝脛痛', '狂證'],
    indEn: ['Chest & hypochondriac pain', 'Knee & leg pain', 'Mania']
  },
  GB36: {
    fnZh: ['清熱利濕', '舒筋止痛'],
    fnEn: ['Clear heat & drain dampness', 'Relax sinews & stop pain'],
    indZh: ['胸脅痛', '下肢痿痺', '狂證'],
    indEn: ['Chest & hypochondriac pain', 'Lower limb weakness', 'Mania']
  },
  GB37: {
    fnZh: ['清肝明目', '通絡止痛'],
    fnEn: ['Clear Liver & brighten eyes', 'Unblock channels & stop pain'],
    indZh: ['目赤腫痛', '夜盲 / 視物昏花', '下肢痿痺 / 膝脛痛', '乳房脹痛'],
    indEn: ['Eye redness & swelling', 'Night blindness / Blurred vision', 'Lower limb paralysis / leg pain', 'Breast distension & pain']
  },
  GB38: {
    fnZh: ['清膽熱', '疏風通絡', '止痛平肝'],
    fnEn: ['Clear Gallbladder heat', 'Dispel wind & unblock channels', 'Stop pain & pacify Liver'],
    indZh: ['偏頭痛', '目赤腫痛', '腋下腫痛', '胸脅痛', '下肢痛'],
    indEn: ['Migraine', 'Eye redness & swelling', 'Axillary swelling & pain', 'Chest & hypochondriac pain', 'Lower limb pain']
  },
  GB39: {
    fnZh: ['益髓壯骨', '清膽產熱', '平肝息風', '通絡止痛'],
    fnEn: ['Benefit marrow & strengthen bone', 'Clear Gallbladder heat', 'Pacify Liver & extinguish wind', 'Unblock channels & stop pain'],
    indZh: ['頸項強痛', '中風半身不遂', '胸脅痛', '下肢痿痺 / 腳氣'],
    indEn: ['Neck stiffness', 'Stroke & hemiplegia', 'Chest & hypochondriac pain', 'Lower limb weakness / Beriberi']
  },
  GB40: {
    fnZh: ['疏肝利膽', '清熱通絡', '平肝息風'],
    fnEn: ['Soothe Liver & benefit Gallbladder', 'Clear heat & unblock channels', 'Pacify Liver & extinguish wind'],
    indZh: ['頸項強痛', '胸脅痛', '黃疸', '外踝腫痛', '下肢痿痺'],
    indEn: ['Neck stiffness', 'Chest & hypochondriac pain', 'Jaundice', 'External malleolus swelling & pain', 'Lower limb weakness']
  },
  GB41: {
    fnZh: ['疏肝利膽', '清頭明目', '化痰散結', '通調帶脈', '通絡止痛'],
    fnEn: ['Soothe Liver & benefit Gallbladder', 'Clear head & brighten eyes', 'Transform phlegm & dissipate nodules', 'Unblock Daimai', 'Unblock channels & stop pain'],
    indZh: ['偏頭痛', '目赤腫痛', '胸脅脹痛', '乳癰 / 乳房脹痛', '月經不調', '足跗腫痛'],
    indEn: ['Migraine', 'Eye redness & swelling', 'Chest & hypochondriac pain', 'Acute mastitis / Breast distension', 'Irregular menses', 'Dorsal foot swelling & pain']
  },
  GB42: {
    fnZh: ['清熱利膽', '通絡止痛'],
    fnEn: ['Clear heat & benefit Gallbladder', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '目赤腫痛', '胸脅痛', '足跗腫痛'],
    indEn: ['Headache', 'Eye redness & swelling', 'Chest & hypochondriac pain', 'Dorsal foot swelling & pain']
  },
  GB43: {
    fnZh: ['清肝瀉膽', '聰耳明目', '通絡止痛'],
    fnEn: ['Clear Liver & drain Gallbladder', 'Benefit ears & brighten eyes', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '目赤腫痛', '耳鳴耳聾', '胸脅痛', '熱病'],
    indEn: ['Headache', 'Eye redness & swelling', 'Tinnitus & deafness', 'Chest & hypochondriac pain', 'Febrile disease']
  },
  GB44: {
    fnZh: ['清熱開竅', '瀉肝膽火', '安神定志'],
    fnEn: ['Clear heat & open orifices', 'Drain Liver & Gallbladder fire', 'Calm spirit & settle mind'],
    indZh: ['偏頭痛', '目赤腫痛', '耳鳴', '熱病昏迷', '多夢'],
    indEn: ['Migraine', 'Eye redness & swelling', 'Tinnitus', 'Febrile coma', 'Excessive dreaming']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (GB_CURRICULUM_DATA[code]) {
    const cData = GB_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} GB channel points.`);
