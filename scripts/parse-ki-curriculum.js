/**
 * parse-ki-curriculum.js
 * Parses the 8 KIDNEY CHANNEL OF FOOT SHAO YIN curriculum text
 * to extract exact functions and indications, creating 1-to-1 aligned _zh and _en arrays
 * for all 27 Kidney channel points (KI1–KI27).
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const KI_CURRICULUM_DATA = {
  KI1: {
    fnZh: ['滋陰降火', '醒腦開竅', '平肝息風', '引熱下行'],
    fnEn: ['Nourish Yin & descend fire', 'Revive brain & open orifices', 'Pacify Liver & extinguish wind', 'Direct heat downwards'],
    indZh: ['頭痛', '眩暈', '咽喉腫痛', '小便不利', '便秘', '昏迷', '小兒驚風'],
    indEn: ['Headache', 'Dizziness', 'Sore throat', 'Difficult urination', 'Constipation', 'Coma / fainting', 'Infantile convulsions']
  },
  KI2: {
    fnZh: ['滋陰清熱', '調經止血'],
    fnEn: ['Nourish Yin & clear heat', 'Regulate menses & stop bleeding'],
    indZh: ['陰虛潮熱', '咽喉腫痛', '月經不調', '小便不利', '陰癢'],
    indEn: ['Yin deficiency tidal fever', 'Sore throat', 'Irregular menses', 'Difficult urination', 'Pudendal itching']
  },
  KI3: {
    fnZh: ['滋陰補腎', '培元固本', '清熱利尿', '納氣平喘'],
    fnEn: ['Nourish Yin & tonify Kidney', 'Fortify Yuan Qi & consolidate root', 'Clear heat & promote urination', 'Grasp Qi & relieve asthma'],
    indZh: ['頭痛眩暈', '咽喉腫痛', '齒痛', '耳鳴耳聾', '腰痛', '陽痿遺精', '消渴', '小便頻數'],
    indEn: ['Headache & dizziness', 'Sore throat', 'Toothache', 'Tinnitus & deafness', 'Lumbar pain', 'Impotence & spermatorrhea', 'Wasting-thirst', 'Frequent urination']
  },
  KI4: {
    fnZh: ['調補腎氣', '固精平喘', '安神定志'],
    fnEn: ['Regulate & tonify Kidney Qi', 'Secure essence & relieve asthma', 'Calm spirit & settle mind'],
    indZh: ['腰脊強痛', '氣喘', '月經不調', '小便不利', '嗜臥', '癡呆'],
    indEn: ['Lumbar spinal rigidity & pain', 'Asthma', 'Irregular menses', 'Difficult urination', 'Somnolence / lethargy', 'Dementia / memory loss']
  },
  KI5: {
    fnZh: ['清熱利濕', '通經止痛', '調經活血'],
    fnEn: ['Clear heat & drain dampness', 'Unblock channels & stop pain', 'Regulate menses & invigorate blood'],
    indZh: ['痛經', '月經不調', '小便不利', '足跟痛'],
    indEn: ['Dysmenorrhea', 'Irregular menses', 'Difficult urination', 'Heel pain']
  },
  KI6: {
    fnZh: ['滋陰清熱', '利咽明目', '寧神定志', '通調二便'],
    fnEn: ['Nourish Yin & clear heat', 'Benefit throat & brighten eyes', 'Calm spirit & settle mind', 'Regulate urination & defecation'],
    indZh: ['咽喉乾痛', '失眠', '癲癇', '月經不調', '帶下', '小便頻數', '便秘'],
    indEn: ['Dry sore throat', 'Insomnia', 'Epilepsy', 'Irregular menses', 'Leukorrhea', 'Frequent urination', 'Constipation']
  },
  KI7: {
    fnZh: ['調節汗液', '益腎利水', '清熱止瀉'],
    fnEn: ['Regulate sweat / anhidrosis', 'Benefit Kidney & promote urination', 'Clear heat & arrest diarrhea'],
    indZh: ['盜汗無汗', '水腫', '腹脹', '腹瀉', '腰脊強痛'],
    indEn: ['Night sweats / anhidrosis', 'Edema', 'Abdominal distension', 'Diarrhea', 'Lumbar spinal rigidity']
  },
  KI8: {
    fnZh: ['調經止血', '清熱利濕'],
    fnEn: ['Regulate menses & stop bleeding', 'Clear heat & drain dampness'],
    indZh: ['崩漏', '月經不調', '陰挺', '睾丸腫痛'],
    indEn: ['Uterine bleeding', 'Irregular menses', 'Uterine prolapse', 'Testicular swelling & pain']
  },
  KI9: {
    fnZh: ['寧神定志', '清熱解毒', '理氣止痛'],
    fnEn: ['Calm spirit & settle mind', 'Clear heat & relieve toxicity', 'Regulate Qi & stop pain'],
    indZh: ['癲狂', '疝氣', '小腿痛', '胎毒 / 毒素'],
    indEn: ['Mania / mental clouding', 'Hernia', 'Lower leg pain', 'Fetal toxicity / poisoning']
  },
  KI10: {
    fnZh: ['滋陰清熱', '利尿通淋', '舒筋活絡'],
    fnEn: ['Nourish Yin & clear heat', 'Promote urination & unblock Strangury', 'Relax sinews & invigorate channels'],
    indZh: ['小便不利', '陰癢', '陽痿', '膝膕酸痛'],
    indEn: ['Difficult urination', 'Pudendal itching', 'Impotence', 'Knee & popliteal pain']
  },
  KI11: {
    fnZh: ['益腎清熱', '通利下焦'],
    fnEn: ['Benefit Kidney & clear heat', 'Unblock lower jiao'],
    indZh: ['小腹脹痛', '小便不利', '遺精', '陰痛'],
    indEn: ['Lower abdominal pain', 'Difficult urination', 'Spermatorrhea', 'Genital pain']
  },
  KI12: {
    fnZh: ['益腎補虛', '固精止帶'],
    fnEn: ['Benefit Kidney & tonify deficiency', 'Secure essence & arrest leukorrhea'],
    indZh: ['遺精', '陽痿', '帶下', '陰挺'],
    indEn: ['Spermatorrhea', 'Impotence', 'Leukorrhea', 'Uterine prolapse']
  },
  KI13: {
    fnZh: ['調經止帶', '益腎固精'],
    fnEn: ['Regulate menses & arrest leukorrhea', 'Benefit Kidney & secure essence'],
    indZh: ['月經不調', '帶下', '奔豚氣', '小便不利'],
    indEn: ['Irregular menses', 'Leukorrhea', 'Running piglet Qi', 'Difficult urination']
  },
  KI14: {
    fnZh: ['理氣活血', '調經止痛', '通利水濕'],
    fnEn: ['Regulate Qi & invigorate blood', 'Regulate menses & stop pain', 'Promote water transformation'],
    indZh: ['月經不調', '痛經', '小腹痛', '水腫', '小便不利'],
    indEn: ['Irregular menses', 'Dysmenorrhea', 'Lower abdominal pain', 'Edema', 'Difficult urination']
  },
  KI15: {
    fnZh: ['和胃理氣', '通利水濕'],
    fnEn: ['Harmonize Stomach & regulate Qi', 'Promote water transformation'],
    indZh: ['腹痛', '便秘', '月經不調', '小便不利'],
    indEn: ['Abdominal pain', 'Constipation', 'Irregular menses', 'Difficult urination']
  },
  KI16: {
    fnZh: ['和胃消脹', '潤腸通便'],
    fnEn: ['Harmonize Stomach & relieve distension', 'Moisten intestines & unblock bowels'],
    indZh: ['腹痛', '腹脹', '便秘', '嘔吐'],
    indEn: ['Abdominal pain', 'Abdominal distension', 'Constipation', 'Vomiting']
  },
  KI17: {
    fnZh: ['和胃降逆', '理氣止痛'],
    fnEn: ['Harmonize Stomach & descend adverse Qi', 'Regulate Qi & stop pain'],
    indZh: ['腹痛', '腹脹', '嘔吐', '便秘'],
    indEn: ['Abdominal pain', 'Abdominal distension', 'Vomiting', 'Constipation']
  },
  KI18: {
    fnZh: ['和胃消食', '理氣止痛'],
    fnEn: ['Harmonize Stomach & relieve food stagnation', 'Regulate Qi & stop pain'],
    indZh: ['胃痛', '嘔吐', '腹脹', '便秘'],
    indEn: ['Epigastric pain', 'Vomiting', 'Abdominal distension', 'Constipation']
  },
  KI19: {
    fnZh: ['和胃降逆', '消食理氣'],
    fnEn: ['Harmonize Stomach & descend adverse Qi', 'Relieve food retention & regulate Qi'],
    indZh: ['腹脹', '腹痛', '嘔吐', '呃逆'],
    indEn: ['Abdominal distension', 'Abdominal pain', 'Vomiting', 'Hiccup']
  },
  KI20: {
    fnZh: ['和胃降逆', '寬胸理氣'],
    fnEn: ['Harmonize Stomach & descend adverse Qi', 'Unbind chest & regulate Qi'],
    indZh: ['腹脹', '腹痛', '嘔吐', '心痛'],
    indEn: ['Abdominal distension', 'Abdominal pain', 'Vomiting', 'Precordial pain']
  },
  KI21: {
    fnZh: ['和胃降逆', '理氣止嘔'],
    fnEn: ['Harmonize Stomach & descend adverse Qi', 'Regulate Qi & stop vomiting'],
    indZh: ['腹痛', '嘔吐', '呃逆', '胸脅痛'],
    indEn: ['Abdominal pain', 'Vomiting', 'Hiccup', 'Chest & hypochondriac pain']
  },
  KI22: {
    fnZh: ['宣肺平喘', '寬胸理氣'],
    fnEn: ['Diffuse Lung & relieve asthma', 'Unbind chest & regulate Qi'],
    indZh: ['咳嗽', '氣喘', '胸脅支滿', '嘔吐'],
    indEn: ['Cough', 'Asthma', 'Fullness in chest & hypochondrium', 'Vomiting']
  },
  KI23: {
    fnZh: ['宣肺止咳', '寬胸降逆'],
    fnEn: ['Diffuse Lung & stop cough', 'Unbind chest & descend adverse Qi'],
    indZh: ['咳嗽', '氣喘', '胸脅痛', '嘔吐'],
    indEn: ['Cough', 'Asthma', 'Chest & hypochondriac pain', 'Vomiting']
  },
  KI24: {
    fnZh: ['寬胸理氣', '宣肺止平喘'],
    fnEn: ['Unbind chest & regulate Qi', 'Diffuse Lung & relieve asthma'],
    indZh: ['咳嗽', '氣喘', '胸脅痛', '嘔吐'],
    indEn: ['Cough', 'Asthma', 'Chest & hypochondriac pain', 'Vomiting']
  },
  KI25: {
    fnZh: ['宣肺降逆', '寬胸止痛'],
    fnEn: ['Diffuse Lung & descend adverse Qi', 'Unbind chest & stop pain'],
    indZh: ['咳嗽', '氣喘', '胸脅痛', '嘔吐'],
    indEn: ['Cough', 'Asthma', 'Chest & hypochondriac pain', 'Vomiting']
  },
  KI26: {
    fnZh: ['宣肺平喘', '理氣化痰'],
    fnEn: ['Diffuse Lung & relieve asthma', 'Regulate Qi & transform phlegm'],
    indZh: ['咳嗽', '氣喘', '胸脅支滿', '嘔吐'],
    indEn: ['Cough', 'Asthma', 'Chest fullness & hypochondrium', 'Vomiting']
  },
  KI27: {
    fnZh: ['納氣平喘', '宣肺止咳', '寬胸理氣'],
    fnEn: ['Grasp Qi & relieve asthma', 'Diffuse Lung & stop cough', 'Unbind chest & regulate Qi'],
    indZh: ['咳嗽', '氣喘', '胸痛', '不嗜食'],
    indEn: ['Cough', 'Asthma', 'Chest pain', 'Loss of appetite']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (KI_CURRICULUM_DATA[code]) {
    const cData = KI_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched functions and indications for all ${updated} KI channel points.`);
