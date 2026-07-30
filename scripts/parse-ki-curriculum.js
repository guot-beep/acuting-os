/**
 * parse-ki-curriculum.js
 * Parses all 27 points of Foot Shao Yin Kidney Channel (KI1–KI27)
 * directly from curriculum PDF text and eLotus/AD sources,
 * building 1-to-1 matched clean functions_zh/en and indications_zh/en.
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const KI_CURRICULUM_DATA = {
  KI1: {
    fnZh: ['滋陰降火', '醒腦開竅', '平肝熄風', '安神定志'],
    fnEn: ['Nourish Yin & descend Fire', 'Revive brain & open orifices', 'Pacify Liver & extinguish wind', 'Calm spirit & settle mind'],
    indZh: ['頭痛眩暈', '咽喉腫痛', '熱病昏迷 / 中風', '癲狂癲癇', '小便不利', '足心熱 / 奔豚氣'],
    indEn: ['Headache & dizziness', 'Sore throat', 'Febrile coma / Stroke', 'Mania & epilepsy', 'Difficult urination', 'Heat in soles / Running piglet Qi']
  },
  KI2: {
    fnZh: ['滋陰降火', '清熱利濕', '調經止帶'],
    fnEn: ['Nourish Yin & descend Fire', 'Clear heat & drain dampness', 'Regulate menses & arrest leukorrhea'],
    indZh: ['月經不調 / 痛經', '陰挺 / 帶下', '遺精 / 陽痿', '咽喉腫痛', '足跗腫痛'],
    indEn: ['Irregular menses / Dysmenorrhea', 'Uterine prolapse / Leukorrhea', 'Spermatorrhea / Impotence', 'Sore throat', 'Dorsal foot swelling & pain']
  },
  KI3: {
    fnZh: ['滋陰益腎', '壯陽固本', '調經止帶', '納氣平喘', '清熱明目'],
    fnEn: ['Nourish Yin & tonify Kidney', 'Strengthen Yang & consolidate root', 'Regulate menses & arrest leukorrhea', 'Grasp Qi & calm asthma', 'Clear heat & brighten eyes'],
    indZh: ['頭痛眩暈', '耳鳴耳聾', '腰膝酸痛', '月經不調 / 痛經', '遺精 / 陽痿', '消渴', '氣喘', '失眠 / 健忘'],
    indEn: ['Headache & dizziness', 'Tinnitus & deafness', 'Lumbar & knee soreness/pain', 'Irregular menses / Dysmenorrhea', 'Spermatorrhea / Impotence', 'Wasting-thirst', 'Asthma', 'Insomnia & forgetfulness']
  },
  KI4: {
    fnZh: ['納氣平喘', '調理腰腎', '固本止血'],
    fnEn: ['Grasp Qi & calm asthma', 'Regulate lumbar & Kidney', 'Consolidate root & stop bleeding'],
    indZh: ['氣喘咳嗽', '咯血', '腰脊強痛', '小便不利 / 癡呆'],
    indEn: ['Asthma & cough', 'Hemoptysis', 'Lumbar & spinal stiffness/pain', 'Difficult urination / Dementia']
  },
  KI5: {
    fnZh: ['調經止痛', '清熱利濕'],
    fnEn: ['Regulate menses & stop pain', 'Clear heat & drain dampness'],
    indZh: ['月經不調 / 痛經 / 崩漏', '小便不利', '疝氣'],
    indEn: ['Irregular menses / Dysmenorrhea / Uterine bleeding', 'Difficult urination', 'Hernia']
  },
  KI6: {
    fnZh: ['滋陰清熱', '通調陰蹻', '安神利咽', '調經通便'],
    fnEn: ['Nourish Yin & clear heat', 'Unblock Yin Qiao Mai', 'Calm spirit & benefit throat', 'Regulate menses & unblock constipation'],
    indZh: ['咽喉乾痛 / 失音', '失眠 / 癲癇', '月經不調 / 痛經', '小便頻數 / 癃閉', '便秘', '腳氣 / 足踝痛'],
    indEn: ['Dry sore throat / Loss of voice', 'Insomnia / Epilepsy', 'Irregular menses / Dysmenorrhea', 'Frequent urination / Anuria', 'Constipation', 'Beriberi / Ankle pain']
  },
  KI7: {
    fnZh: ['益腎興陽', '清熱利濕', '固表止汗', '利水消腫'],
    fnEn: ['Tonify Kidney & arouse Yang', 'Clear heat & drain dampness', 'Consolidate exterior & arrest sweating', 'Promote urination & reduce swelling'],
    indZh: ['水腫 / 小便不利', '自汗 / 盜汗', '腹脹腹瀉', '腰脊強痛', '下肢痿痺'],
    indEn: ['Edema / Difficult urination', 'Spontaneous sweating / Night sweating', 'Abdominal distension & diarrhea', 'Lumbar & spinal pain', 'Lower limb weakness']
  },
  KI8: {
    fnZh: ['清熱利濕', '調經止帶'],
    fnEn: ['Clear heat & drain dampness', 'Regulate menses & arrest leukorrhea'],
    indZh: ['崩漏 / 帶下', '陰挺 / 疝氣', '小便不利'],
    indEn: ['Uterine bleeding / Leukorrhea', 'Uterine prolapse / Hernia', 'Difficult urination']
  },
  KI9: {
    fnZh: ['寧心安神', '清熱開竅', '理氣止痛'],
    fnEn: ['Calm Heart & spirit', 'Clear heat & open orifices', 'Regulate Qi & stop pain'],
    indZh: ['癲狂 / 疝氣', '嘔吐', '小痛疝氣', '下肢腫痛'],
    indEn: ['Mania / Hernia', 'Vomiting', 'Lower abdominal hernia pain', 'Lower limb swelling & pain']
  },
  KI10: {
    fnZh: ['滋陰清熱', '利濕通淋', '健膝止痛'],
    fnEn: ['Nourish Yin & clear heat', 'Drain dampness & unblock strangury', 'Strengthen knees & stop pain'],
    indZh: ['小便不利 / 遺尿', '陰痛 / 陽痿', '膝關節痛', '崩漏 / 腹痛'],
    indEn: ['Difficult urination / Enuresis', 'Pudendal pain / Impotence', 'Knee joint pain', 'Uterine bleeding / Abdominal pain']
  },
  KI11: {
    fnZh: ['益腎固精', '調經止帶'],
    fnEn: ['Tonify Kidney & consolidate essence', 'Regulate menses & arrest leukorrhea'],
    indZh: ['少腹痛', '小便不利', '遺精', '月經不調'],
    indEn: ['Lower abdominal pain', 'Difficult urination', 'Spermatorrhea', 'Irregular menses']
  },
  KI12: {
    fnZh: ['益腎固精', '理氣止痛'],
    fnEn: ['Tonify Kidney & consolidate essence', 'Regulate Qi & stop pain'],
    indZh: ['少腹痛', '遺精 / 陽痿', '帶下'],
    indEn: ['Lower abdominal pain', 'Spermatorrhea / Impotence', 'Leukorrhea']
  },
  KI13: {
    fnZh: ['調經理氣', '補腎固精'],
    fnEn: ['Regulate menses & Qi', 'Tonify Kidney & consolidate essence'],
    indZh: ['月經不調 / 痛經', '帶下 / 不孕', '遺精'],
    indEn: ['Irregular menses / Dysmenorrhea', 'Leukorrhea / Infertility', 'Spermatorrhea']
  },
  KI14: {
    fnZh: ['調經止痛', '健脾利濕'],
    fnEn: ['Regulate menses & stop pain', 'Fortify Spleen & drain dampness'],
    indZh: ['月經不調 / 痛經', '少腹痛 / 腹瀉', '小便不利'],
    indEn: ['Irregular menses / Dysmenorrhea', 'Lower abdominal pain / Diarrhea', 'Difficult urination']
  },
  KI15: {
    fnZh: ['健脾和胃', '調經理氣'],
    fnEn: ['Fortify Spleen & harmonize Stomach', 'Regulate menses & Qi'],
    indZh: ['腹痛腹瀉', '便秘', '月經不調'],
    indEn: ['Abdominal pain & diarrhea', 'Constipation', 'Irregular menses']
  },
  KI16: {
    fnZh: ['和胃理腸', '健脾止瀉'],
    fnEn: ['Harmonize Stomach & Intestines', 'Fortify Spleen & arrest diarrhea'],
    indZh: ['腹痛腹脹', '腹瀉 / 便秘', '嘔吐'],
    indEn: ['Abdominal pain & distension', 'Diarrhea / Constipation', 'Vomiting']
  },
  KI17: {
    fnZh: ['和胃降逆', '理氣止痛'],
    fnEn: ['Harmonize Stomach & descend Qi', 'Regulate Qi & stop pain'],
    indZh: ['腹痛腹脹', '嘔吐', '便秘'],
    indEn: ['Abdominal pain & distension', 'Vomiting', 'Constipation']
  },
  KI18: {
    fnZh: ['和胃降逆', '理氣止痛'],
    fnEn: ['Harmonize Stomach & descend Qi', 'Regulate Qi & stop pain'],
    indZh: ['胃痛嘔吐', '腹脹腹痛'],
    indEn: ['Epigastric pain & vomiting', 'Abdominal distension & pain']
  },
  KI19: {
    fnZh: ['和胃理氣', '寬胸止痛'],
    fnEn: ['Harmonize Stomach & regulate Qi', 'Unbind chest & stop pain'],
    indZh: ['胸脅脹痛', '嘔吐', '心悸'],
    indEn: ['Chest & hypochondriac pain', 'Vomiting', 'Palpitations']
  },
  KI20: {
    fnZh: ['和胃降逆', '理氣止痛'],
    fnEn: ['Harmonize Stomach & descend Qi', 'Regulate Qi & stop pain'],
    indZh: ['嘔吐', '腹脹胃痛', '心痛'],
    indEn: ['Vomiting', 'Abdominal distension & stomach pain', 'Precordial pain']
  },
  KI21: {
    fnZh: ['和胃降逆', '理氣止嘔'],
    fnEn: ['Harmonize Stomach & descend Qi', 'Regulate Qi & arrest vomiting'],
    indZh: ['嘔吐 / 反胃', '腹脹胃痛', '胸痛咳嗽'],
    indEn: ['Vomiting / Acid regurgitation', 'Abdominal distension & stomach pain', 'Chest pain & cough']
  },
  KI22: {
    fnZh: ['宣肺平喘', '寬胸理氣'],
    fnEn: ['Diffuse Lung & calm asthma', 'Unbind chest & regulate Qi'],
    indZh: ['咳嗽氣喘', '胸脅脹痛', '嘔吐'],
    indEn: ['Cough & asthma', 'Chest & hypochondriac pain', 'Vomiting']
  },
  KI23: {
    fnZh: ['宣肺止咳', '寬胸理氣'],
    fnEn: ['Diffuse Lung & arrest cough', 'Unbind chest & regulate Qi'],
    indZh: ['咳嗽氣喘', '胸脅痛', '嘔吐'],
    indEn: ['Cough & asthma', 'Chest & hypochondriac pain', 'Vomiting']
  },
  KI24: {
    fnZh: ['宣肺平喘', '寬胸理氣'],
    fnEn: ['Diffuse Lung & calm asthma', 'Unbind chest & regulate Qi'],
    indZh: ['咳嗽氣喘', '胸脅痛', '嘔吐'],
    indEn: ['Cough & asthma', 'Chest & hypochondriac pain', 'Vomiting']
  },
  KI25: {
    fnZh: ['宣肺平喘', '寬胸理氣'],
    fnEn: ['Diffuse Lung & calm asthma', 'Unbind chest & regulate Qi'],
    indZh: ['咳嗽氣喘', '胸脅痛', '心悸'],
    indEn: ['Cough & asthma', 'Chest & hypochondriac pain', 'Palpitations']
  },
  KI26: {
    fnZh: ['宣肺止咳', '寬胸理氣'],
    fnEn: ['Diffuse Lung & arrest cough', 'Unbind chest & regulate Qi'],
    indZh: ['咳嗽氣喘', '胸脅脹痛', '嘔吐'],
    indEn: ['Cough & asthma', 'Chest & hypochondriac pain', 'Vomiting']
  },
  KI27: {
    fnZh: ['宣肺降逆', '納氣平喘', '寬胸理氣'],
    fnEn: ['Diffuse Lung & descend Qi', 'Grasp Qi & calm asthma', 'Unbind chest & regulate Qi'],
    indZh: ['咳嗽氣喘', '胸痛', '嘔吐 / 不嗜食'],
    indEn: ['Cough & asthma', 'Chest pain', 'Vomiting / Anorexia']
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
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} KI channel points.`);
