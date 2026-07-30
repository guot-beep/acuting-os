/**
 * parse-gb-curriculum.js
 * Parses the 11 GALLBLADDER CHANNEL OF FOOT SHAO YANG curriculum text
 * to extract exact functions and indications, creating 1-to-1 aligned _zh and _en arrays
 * for all 44 Gallbladder channel points (GB1–GB44).
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const GB_CURRICULUM_DATA = {
  GB1: {
    fnZh: ['清熱散風', '明目退翳', '通絡止痛'],
    fnEn: ['Clear heat & scatter wind', 'Brighten eyes & reduce opacity', 'Unblock channels & stop pain'],
    indZh: ['目赤腫痛', '目翳', '視物昏花', '頭痛', '口眼喎斜'],
    indEn: ['Redness, swelling & pain of eyes', 'Eye opacity / pterygium', 'Blurred vision', 'Headache', 'Facial paralysis / deviation of mouth & eye']
  },
  GB2: {
    fnZh: ['聰耳利竅', '清熱散風', '通絡止痛'],
    fnEn: ['Benefit hearing & open orifices', 'Clear heat & scatter wind', 'Unblock channels & stop pain'],
    indZh: ['耳鳴耳聾', '聤耳 / 中耳炎', '齒痛', '口眼喎斜', '耳宗痛'],
    indEn: ['Tinnitus & deafness', 'Otitis media / ear discharge', 'Toothache', 'Facial paralysis', 'Earache']
  },
  GB3: {
    fnZh: ['聰耳利竅', '祛風止痛'],
    fnEn: ['Benefit hearing & open orifices', 'Dispel wind & stop pain'],
    indZh: ['耳鳴耳聾', '聤耳', '偏頭痛', '齒痛', '面癱'],
    indEn: ['Tinnitus & deafness', 'Otitis media', 'Migraine', 'Toothache', 'Facial paralysis']
  },
  GB4: {
    fnZh: ['清熱祛風', '通絡止痛'],
    fnEn: ['Clear heat & dispel wind', 'Unblock channels & stop pain'],
    indZh: ['偏頭痛', '目眩', '齒痛', '小兒驚風'],
    indEn: ['Migraine', 'Dizziness', 'Toothache', 'Infantile convulsions']
  },
  GB5: {
    fnZh: ['清頭散風', '通絡止痛'],
    fnEn: ['Clear head & scatter wind', 'Unblock channels & stop pain'],
    indZh: ['偏頭痛', '目赤腫痛', '齒痛'],
    indEn: ['Migraine', 'Redness & swelling of eyes', 'Toothache']
  },
  GB6: {
    fnZh: ['清頭明目', '通絡止痛'],
    fnEn: ['Clear head & brighten eyes', 'Unblock channels & stop pain'],
    indZh: ['偏頭痛', '目赤痛', '耳鳴'],
    indEn: ['Migraine', 'Red eye pain', 'Tinnitus']
  },
  GB7: {
    fnZh: ['祛風清熱', '利口齒'],
    fnEn: ['Dispel wind & clear heat', 'Benefit mouth & teeth'],
    indZh: ['頭痛', '頰腫', '齒痛'],
    indEn: ['Headache', 'Cheek swelling', 'Toothache']
  },
  GB8: {
    fnZh: ['和胃降逆', '清頭止痛', '醒酒安神'],
    fnEn: ['Harmonize Stomach & descend adverse Qi', 'Clear head & stop pain', 'Sober up & calm spirit'],
    indZh: ['偏頭痛', '眩暈', '嘔吐', '小兒驚風', '醉酒'],
    indEn: ['Migraine', 'Dizziness', 'Vomiting', 'Infantile convulsions', 'Alcohol intoxication']
  },
  GB9: {
    fnZh: ['寧神定志', '祛風止痛'],
    fnEn: ['Calm spirit & settle mind', 'Dispel wind & stop pain'],
    indZh: ['頭痛', '癲癇', '驚恐'],
    indEn: ['Headache', 'Epilepsy', 'Fright & panic']
  },
  GB10: {
    fnZh: ['清熱聰耳', '散結止痛'],
    fnEn: ['Clear heat & benefit hearing', 'Dissipate nodules & stop pain'],
    indZh: ['頭痛', '耳鳴耳聾', '瘰癧'],
    indEn: ['Headache', 'Tinnitus & deafness', 'Scrofula']
  },
  GB11: {
    fnZh: ['清熱聰耳', '安神止痛'],
    fnEn: ['Clear heat & benefit hearing', 'Calm spirit & stop pain'],
    indZh: ['頭痛', '耳鳴耳聾', '咽喉腫痛', '四肢抽搐'],
    indEn: ['Headache', 'Tinnitus & deafness', 'Sore throat', 'Limb convulsions']
  },
  GB12: {
    fnZh: ['祛風清熱', '寧神聰耳'],
    fnEn: ['Dispel wind & clear heat', 'Calm spirit & benefit hearing'],
    indZh: ['頭痛', '項強', '齒痛', '口眼喎斜', '失眠'],
    indEn: ['Headache', 'Neck stiffness', 'Toothache', 'Facial paralysis', 'Insomnia']
  },
  GB13: {
    fnZh: ['寧神定志', '平肝息風'],
    fnEn: ['Calm spirit & settle mind', 'Pacify Liver & extinguish wind'],
    indZh: ['頭痛', '眩暈', '癲癇', '小兒驚風'],
    indEn: ['Headache', 'Dizziness', 'Epilepsy', 'Infantile convulsions']
  },
  GB14: {
    fnZh: ['清頭明目', '祛風寧神', '通絡止痛'],
    fnEn: ['Clear head & brighten eyes', 'Dispel wind & calm spirit', 'Unblock channels & stop pain'],
    indZh: ['前頭痛', '目赤腫痛', '眼瞼瞤動', '面癱', '夜盲'],
    indEn: ['Frontal headache', 'Redness & swelling of eyes', 'Eyelid twitching', 'Facial paralysis', 'Night blindness']
  },
  GB15: {
    fnZh: ['清頭明目', '通鼻開竅'],
    fnEn: ['Clear head & brighten eyes', 'Unblock nose & open orifices'],
    indZh: ['頭痛', '目眩', '鼻塞', '流淚'],
    indEn: ['Headache', 'Dizziness', 'Nasal congestion', 'Lacrimation']
  },
  GB16: {
    fnZh: ['清熱明目', '通鼻止痛'],
    fnEn: ['Clear heat & brighten eyes', 'Unblock nose & stop pain'],
    indZh: ['頭痛', '目赤腫痛', '遠視', '近視', '鼻塞'],
    indEn: ['Headache', 'Redness & swelling of eyes', 'Farsightedness', 'Nearsightedness', 'Nasal congestion']
  },
  GB17: {
    fnZh: ['清熱散風', '通絡止痛'],
    fnEn: ['Clear heat & scatter wind', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '目眩', '齒痛'],
    indEn: ['Headache', 'Dizziness', 'Toothache']
  },
  GB18: {
    fnZh: ['宣肺通鼻', '清頭止痛'],
    fnEn: ['Diffuse Lung & unblock nose', 'Clear head & stop pain'],
    indZh: ['頭痛', '鼻塞', '鼻衄', '目眩'],
    indEn: ['Headache', 'Nasal congestion', 'Epistaxis', 'Dizziness']
  },
  GB19: {
    fnZh: ['清風止痛', '寧神定志'],
    fnEn: ['Clear wind & stop pain', 'Calm spirit & settle mind'],
    indZh: ['後頭痛', '項強', '目眩', '癲狂'],
    indEn: ['Occipital headache', 'Neck rigidity', 'Dizziness', 'Mania / mental clouding']
  },
  GB20: {
    fnZh: ['祛風解表', '清頭明目', '通竅聰耳', '平肝息風'],
    fnEn: ['Dispel wind & release exterior', 'Clear head & brighten eyes', 'Open orifices & benefit hearing', 'Pacify Liver & extinguish wind'],
    indZh: ['感冒發熱', '頭痛項強', '眩暈', '目赤腫痛', '耳鳴耳聾', '中風', '鼻塞', '高血壓'],
    indEn: ['Fever & common cold', 'Headache & neck stiffness', 'Dizziness', 'Redness & swelling of eyes', 'Tinnitus & deafness', 'Stroke / Wind stroke', 'Nasal congestion', 'Hypertension']
  },
  GB21: {
    fnZh: ['祛風清熱', '通經活絡', '催產通乳', '降氣散結'],
    fnEn: ['Dispel wind & clear heat', 'Unblock channels & invigorate collateral', 'Promote labor & unblock lactation', 'Descend Qi & dissipate nodules'],
    indZh: ['肩背酸痛', '項強', '乳癰', '乳汁不下', '難產', '瘰癧'],
    indEn: ['Shoulder & back pain', 'Neck stiffness', 'Acute mastitis', 'Insufficient lactation', 'Difficult labor', 'Scrofula']
  },
  GB22: {
    fnZh: ['寬胸理氣', '通絡消腫'],
    fnEn: ['Unbind chest & regulate Qi', 'Unblock channels & reduce swelling'],
    indZh: ['胸脅脹痛', '臂痛不舉', '腋下腫'],
    indEn: ['Chest & hypochondriac distension', 'Arm pain & inability to raise arm', 'Axillary swelling']
  },
  GB23: {
    fnZh: ['降逆平喘', '寬胸理氣'],
    fnEn: ['Descend adverse Qi & relieve asthma', 'Unbind chest & regulate Qi'],
    indZh: ['胸脅痛', '氣喘', '嘔吐'],
    indEn: ['Chest & hypochondriac pain', 'Asthma', 'Vomiting']
  },
  GB24: {
    fnZh: ['疏肝理氣', '清熱利膽', '和胃降逆'],
    fnEn: ['Course Liver & regulate Qi', 'Clear heat & benefit Gallbladder', 'Harmonize Stomach & descend adverse Qi'],
    indZh: ['黃疸', '脅痛', '嘔吐', '吞酸', '腹脹'],
    indEn: ['Jaundice', 'Hypochondriac pain', 'Vomiting', 'Acid regurgitation', 'Abdominal distension']
  },
  GB25: {
    fnZh: ['溫補腎陽', '利水消腫', '理氣止痛'],
    fnEn: ['Warm & tonify Kidney Yang', 'Promote urination & reduce edema', 'Regulate Qi & stop pain'],
    indZh: ['腰脅痛', '腹脹', '水腫', '小便不利'],
    indEn: ['Lumbar & hypochondriac pain', 'Abdominal distension', 'Edema', 'Difficult urination']
  },
  GB26: {
    fnZh: ['調經止帶', '理氣活血', '通利下焦'],
    fnEn: ['Regulate menses & arrest leukorrhea', 'Regulate Qi & invigorate blood', 'Unblock lower jiao'],
    indZh: ['月經不調', '帶下', '疝氣', '腰脅痛'],
    indEn: ['Irregular menses', 'Leukorrhea', 'Hernia', 'Lumbar & hypochondriac pain']
  },
  GB27: {
    fnZh: ['調經止帶', '理氣止痛'],
    fnEn: ['Regulate menses & arrest leukorrhea', 'Regulate Qi & stop pain'],
    indZh: ['小腹痛', '帶下', '疝氣', '腰痛'],
    indEn: ['Lower abdominal pain', 'Leukorrhea', 'Hernia', 'Lumbar pain']
  },
  GB28: {
    fnZh: ['調經止帶', '理氣活血'],
    fnEn: ['Regulate menses & arrest leukorrhea', 'Regulate Qi & invigorate blood'],
    indZh: ['帶下', '月經不調', '小腹痛', '疝氣'],
    indEn: ['Leukorrhea', 'Irregular menses', 'Lower abdominal pain', 'Hernia']
  },
  GB29: {
    fnZh: ['舒筋活絡', '理氣止痛'],
    fnEn: ['Relax sinews & invigorate channels', 'Regulate Qi & stop pain'],
    indZh: ['腰腿痛', '坐骨神經痛', '下肢癱瘓'],
    indEn: ['Lumbar & leg pain', 'Sciatica', 'Lower limb paralysis']
  },
  GB30: {
    fnZh: ['祛風除濕', '舒筋活絡', '通利關節', '止痛通痺'],
    fnEn: ['Dispel wind & eliminate dampness', 'Relax sinews & invigorate channels', 'Benefit joints', 'Relieve pain & unblock Bi syndrome'],
    indZh: ['坐骨神經痛', '腰腿痛', '下肢麻痺 / 痿痺', '半身不遂'],
    indEn: ['Sciatica', 'Lumbar & leg pain', 'Lower limb numbness / paralysis', 'Hemiplegia']
  },
  GB31: {
    fnZh: ['祛風止癢', '舒筋活絡', '通利關節'],
    fnEn: ['Dispel wind & arrest itching', 'Relax sinews & invigorate channels', 'Benefit joints'],
    indZh: ['下肢痿痺', '麻木', '半身不遂', '全身瘙癢 / 蕁麻疹'],
    indEn: ['Lower limb weakness / paralysis', 'Numbness', 'Hemiplegia', 'Generalized pruritus / urticaria']
  },
  GB32: {
    fnZh: ['祛風散寒', '舒筋活絡'],
    fnEn: ['Dispel wind & scatter cold', 'Relax sinews & invigorate channels'],
    indZh: ['股膝酸痛', '下肢麻痺'],
    indEn: ['Thigh & knee pain', 'Lower limb numbness / paralysis']
  },
  GB33: {
    fnZh: ['舒筋利節', '通絡止痛'],
    fnEn: ['Relax sinews & benefit joints', 'Unblock channels & stop pain'],
    indZh: ['膝關節腫痛', '臏骨疼痛', '膝屈伸不利'],
    indEn: ['Knee joint swelling & pain', 'Patellar pain', 'Difficulty flexing/extending knee']
  },
  GB34: {
    fnZh: ['舒筋利節', '疏肝利膽', '清熱利濕', '和胃降逆'],
    fnEn: ['Relax sinews & benefit joints', 'Course Liver & benefit Gallbladder', 'Clear heat & drain dampness', 'Harmonize Stomach & descend adverse Qi'],
    indZh: ['脅肋痛', '黃疸', '口苦', '嘔吐', '膝腿腫痛', '坐骨神經痛', '小兒驚風'],
    indEn: ['Hypochondriac pain', 'Jaundice', 'Bitter taste in mouth', 'Vomiting', 'Knee & leg swelling/pain', 'Sciatica', 'Infantile convulsions']
  },
  GB35: {
    fnZh: ['清熱利濕', '舒筋止痛'],
    fnEn: ['Clear heat & drain dampness', 'Relax sinews & stop pain'],
    indZh: ['胸脅脹滿', '膝脛酸痛', '膽囊炎'],
    indEn: ['Chest & hypochondriac fullness', 'Knee & shin pain', 'Cholecystitis']
  },
  GB36: {
    fnZh: ['清熱解毒', '舒筋活絡'],
    fnEn: ['Clear heat & relieve toxicity', 'Relax sinews & invigorate channels'],
    indZh: ['胸脅痛', '下肢酸痛', '狂犬咬傷 / 毒蛇咬傷'],
    indEn: ['Hypochondriac pain', 'Lower limb pain', 'Rabies / snake bite toxicity']
  },
  GB37: {
    fnZh: ['清肝明目', '通絡止痛'],
    fnEn: ['Clear Liver & brighten eyes', 'Unblock channels & stop pain'],
    indZh: ['夜盲', '目赤腫痛', '眼花', '下肢麻痺', '乳房脹痛'],
    indEn: ['Night blindness', 'Redness & swelling of eyes', 'Dim vision', 'Lower limb numbness', 'Breast distension & pain']
  },
  GB38: {
    fnZh: ['清瀉膽熱', '平肝息風', '通絡止痛'],
    fnEn: ['Clear Gallbladder heat', 'Pacify Liver & extinguish wind', 'Unblock channels & stop pain'],
    indZh: ['偏頭痛', '目外眥痛', '缺盆中腫痛', '腋下腫痛', '胸脅痛', '下肢酸痛'],
    indEn: ['Migraine', 'Pain at outer canthus', 'Pain in supraclavicular fossa', 'Axillary pain', 'Hypochondriac pain', 'Lower limb pain']
  },
  GB39: {
    fnZh: ['益髓壯骨', '清熱利膽', '祛風通絡'],
    fnEn: ['Benefit marrow & strengthen bones', 'Clear heat & benefit Gallbladder', 'Dispel wind & unblock channels'],
    indZh: ['頸項強痛', '偏頭痛', '胸脅痛', '下肢痿痺', '腳氣'],
    indEn: ['Neck rigidity & pain', 'Migraine', 'Hypochondriac pain', 'Lower limb atrophy / paralysis', 'Beriberi / foot edema']
  },
  GB40: {
    fnZh: ['疏肝利膽', '清熱利濕', '舒筋通絡'],
    fnEn: ['Course Liver & benefit Gallbladder', 'Clear heat & drain dampness', 'Relax sinews & unblock channels'],
    indZh: ['脅痛', '口苦', '瘧疾', '外踝腫痛', '足下垂 / 腳氣'],
    indEn: ['Hypochondriac pain', 'Bitter taste in mouth', 'Malaria', 'External malleolus swelling & pain', 'Foot drop / beriberi']
  },
  GB41: {
    fnZh: ['疏肝理氣', '清頭明目', '通利帶脈', '消腫散結'],
    fnEn: ['Course Liver & regulate Qi', 'Clear head & brighten eyes', 'Benefit Dai Mai (Girdling Vessel)', 'Reduce swelling & dissipate nodules'],
    indZh: ['偏頭痛', '目外眥痛', '脅肋痛', '月經不調', '乳癰 / 乳房脹痛', '足背腫痛'],
    indEn: ['Migraine', 'Outer canthus pain', 'Hypochondriac pain', 'Irregular menses', 'Acute mastitis / breast distension', 'Pain on dorsum of foot']
  },
  GB42: {
    fnZh: ['疏肝理氣', '清熱明目'],
    fnEn: ['Course Liver & regulate Qi', 'Clear heat & brighten eyes'],
    indZh: ['頭痛', '目赤痛', '腋下腫痛', '胸脅痛', '足背腫痛'],
    indEn: ['Headache', 'Red eye pain', 'Axillary swelling & pain', 'Hypochondriac pain', 'Dorsum of foot swelling']
  },
  GB43: {
    fnZh: ['清熱瀉火', '聰耳明目', '通絡止痛'],
    fnEn: ['Clear heat & drain fire', 'Benefit hearing & brighten eyes', 'Unblock channels & stop pain'],
    indZh: ['頭痛', '目赤腫痛', '耳鳴耳聾', '脅痛', '熱病'],
    indEn: ['Headache', 'Redness & swelling of eyes', 'Tinnitus & deafness', 'Hypochondriac pain', 'Febrile disease']
  },
  GB44: {
    fnZh: ['清熱瀉火', '開竅醒神', '平肝息風'],
    fnEn: ['Clear heat & drain fire', 'Open orifices & revive spirit', 'Pacify Liver & extinguish wind'],
    indZh: ['偏頭痛', '目赤腫痛', '耳鳴耳聾', '咽喉腫痛', '熱病昏迷'],
    indEn: ['Migraine', 'Redness & swelling of eyes', 'Tinnitus & deafness', 'Sore throat', 'Febrile disease with coma']
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
console.log(`✅ Updated 1-to-1 matched functions and indications for all ${updated} GB channel points.`);
