/**
 * parse-sp-curriculum.js
 * Parses all 21 points of Foot Tai Yin Spleen Channel (SP1–SP21)
 * directly from curriculum PDF text and eLotus/AD sources,
 * building 1-to-1 matched clean functions_zh/en and indications_zh/en.
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const SP_CURRICULUM_DATA = {
  SP1: {
    fnZh: ['健脾統血', '益氣固脫', '安神定志'],
    fnEn: ['Fortify Spleen & govern blood', 'Tonify Qi & consolidate desertion', 'Calm spirit & settle mind'],
    indZh: ['崩漏 / 尿血', '月經過多', '便血', '腹脹腹瀉', '癲狂 / 多夢'],
    indEn: ['Uterine bleeding / Hematuria', 'Menorrhagia', 'Blood in stool / Hematochezia', 'Abdominal distension & diarrhea', 'Mania / Excessive dreaming']
  },
  SP2: {
    fnZh: ['健脾和胃', '清熱利濕'],
    fnEn: ['Fortify Spleen & harmonize Stomach', 'Clear heat & drain dampness'],
    indZh: ['腹脹胃痛', '嘔吐腹瀉', '熱病無汗', '足趾腫痛'],
    indEn: ['Abdominal distension & epigastric pain', 'Vomiting & diarrhea', 'Febrile disease without sweating', 'Toes swelling & pain']
  },
  SP3: {
    fnZh: ['健脾和胃', '化濕止瀉', '培土生金', '理氣止痛'],
    fnEn: ['Fortify Spleen & harmonize Stomach', 'Transform dampness & arrest diarrhea', 'Nourish Earth to generate Metal', 'Regulate Qi & stop pain'],
    indZh: ['腹脹腹痛', '胃痛嘔吐', '腹瀉 / 痢疾', '肢體倦怠重著', '身重關節痛'],
    indEn: ['Abdominal distension & pain', 'Epigastric pain & vomiting', 'Diarrhea / Dysentery', 'Limb lassitude & heaviness', 'Body heaviness & joint pain']
  },
  SP4: {
    fnZh: ['健脾和胃', '理氣化濕', '通調八脈', '安神止痛'],
    fnEn: ['Fortify Spleen & harmonize Stomach', 'Regulate Qi & transform dampness', 'Unblock Chong Mai', 'Calm spirit & stop pain'],
    indZh: ['胃痛腹脹', '嘔吐吞酸', '腹瀉痢疾', '月經不調 / 痛經', '心悸失眠'],
    indEn: ['Epigastric pain & abdominal distension', 'Vomiting & acid regurgitation', 'Diarrhea & dysentery', 'Irregular menses / Dysmenorrhea', 'Palpitations & insomnia']
  },
  SP5: {
    fnZh: ['健脾化濕', '通絡止痛'],
    fnEn: ['Fortify Spleen & transform dampness', 'Unblock channels & stop pain'],
    indZh: ['腹脹腹瀉', '黃疸', '足踝腫痛', '小兒驚風'],
    indEn: ['Abdominal distension & diarrhea', 'Jaundice', 'Ankle swelling & pain', 'Infantile convulsions']
  },
  SP6: {
    fnZh: ['健脾益氣', '滋陰補腎', '疏肝理氣', '調經止帶', '通利小便', '安神定志'],
    fnEn: ['Fortify Spleen & benefit Qi', 'Nourish Yin & tonify Kidney', 'Soothe Liver & regulate Qi', 'Regulate menses & arrest leukorrhea', 'Promote urination', 'Calm spirit & settle mind'],
    indZh: ['腹脹腹瀉', '月經不調 / 痛經 / 崩漏', '帶下 / 不孕', '遺精 / 陽痿', '小便不利 / 水腫', '失眠', '下肢痿痺'],
    indEn: ['Abdominal distension & diarrhea', 'Irregular menses / Dysmenorrhea / Uterine bleeding', 'Leukorrhea / Infertility', 'Spermatorrhea / Impotence', 'Difficult urination / Edema', 'Insomnia', 'Lower limb weakness']
  },
  SP7: {
    fnZh: ['健脾化濕', '通利小便'],
    fnEn: ['Fortify Spleen & transform dampness', 'Promote urination'],
    indZh: ['腹脹腹瀉', '小便不利 / 水腫', '下肢麻木痛'],
    indEn: ['Abdominal distension & diarrhea', 'Difficult urination / Edema', 'Lower limb numbness & pain']
  },
  SP8: {
    fnZh: ['調經止痛', '理血化瘀', '健脾利濕'],
    fnEn: ['Regulate menses & stop pain', 'Regulate blood & dispel stasis', 'Fortify Spleen & drain dampness'],
    indZh: ['痛經 / 月經不調', '崩漏', '小便不利', '腹脹腹瀉', '膝腿痛'],
    indEn: ['Dysmenorrhea / Irregular menses', 'Uterine bleeding', 'Difficult urination', 'Abdominal distension & diarrhea', 'Knee & leg pain']
  },
  SP9: {
    fnZh: ['健脾利濕', '通利水道', '理氣止痛', '清熱消腫'],
    fnEn: ['Fortify Spleen & drain dampness', 'Unblock water passages', 'Regulate Qi & stop pain', 'Clear heat & reduce swelling'],
    indZh: ['水腫 / 小便不利', '腹脹腹瀉', '黃疸', '陰痛 / 帶下', '膝關節腫痛'],
    indEn: ['Edema / Difficult urination', 'Abdominal distension & diarrhea', 'Jaundice', 'Pudendal pain / Leukorrhea', 'Knee joint swelling & pain']
  },
  SP10: {
    fnZh: ['清熱涼血', '活血化瘀', '祛風止癢', '調經止痛'],
    fnEn: ['Clear heat & cool blood', 'Invigorate blood & dispel stasis', 'Dispel wind & arrest itching', 'Regulate menses & stop pain'],
    indZh: ['月經不調 / 痛經 / 崩漏', '蕁麻疹 / 濕疹 / 皮膚瘙癢', '膝股痛', '小便不利'],
    indEn: ['Irregular menses / Dysmenorrhea / Uterine bleeding', 'Urticaria / Eczema / Pruritus', 'Knee & thigh pain', 'Difficult urination']
  },
  SP11: {
    fnZh: ['清熱利濕', '通利小便'],
    fnEn: ['Clear heat & drain dampness', 'Promote urination'],
    indZh: ['小便不利 / 遺尿', '腹股溝腫痛'],
    indEn: ['Difficult urination / Enuresis', 'Groin swelling & pain']
  },
  SP12: {
    fnZh: ['理氣止痛', '溫陽固本'],
    fnEn: ['Regulate Qi & stop pain', 'Warm Yang & consolidate root'],
    indZh: ['疝氣', '小腹痛', '小便不利'],
    indEn: ['Hernia', 'Lower abdominal pain', 'Difficult urination']
  },
  SP13: {
    fnZh: ['溫中理氣', '健脾止瀉'],
    fnEn: ['Warm middle & regulate Qi', 'Fortify Spleen & arrest diarrhea'],
    indZh: ['腹痛腹瀉', '便秘', '疝氣'],
    indEn: ['Abdominal pain & diarrhea', 'Constipation', 'Hernia']
  },
  SP14: {
    fnZh: ['溫中散寒', '理氣止痛'],
    fnEn: ['Warm middle & scatter cold', 'Regulate Qi & stop pain'],
    indZh: ['臍周腹痛', '腹脹腹瀉', '痢疾'],
    indEn: ['Periumbilical abdominal pain', 'Abdominal distension & diarrhea', 'Dysentery']
  },
  SP15: {
    fnZh: ['理氣通便', '健脾止瀉'],
    fnEn: ['Regulate Qi & unblock constipation', 'Fortify Spleen & arrest diarrhea'],
    indZh: ['腹脹便秘', '腹痛腹瀉', '痢疾'],
    indEn: ['Abdominal distension & constipation', 'Abdominal pain & diarrhea', 'Dysentery']
  },
  SP16: {
    fnZh: ['理氣和胃', '健脾止瀉'],
    fnEn: ['Regulate Qi & harmonize Stomach', 'Fortify Spleen & arrest diarrhea'],
    indZh: ['腹痛腹瀉', '便秘', '痢疾'],
    indEn: ['Abdominal pain & diarrhea', 'Constipation', 'Dysentery']
  },
  SP17: {
    fnZh: ['寬胸理氣', '和胃降逆'],
    fnEn: ['Unbind chest & regulate Qi', 'Harmonize Stomach & descend Qi'],
    indZh: ['胸脅脹痛', '氣喘', '反胃嘔吐'],
    indEn: ['Chest & hypochondriac distension', 'Asthma', 'Regurgitation & vomiting']
  },
  SP18: {
    fnZh: ['寬胸理氣', '通乳止痛'],
    fnEn: ['Unbind chest & regulate Qi', 'Promote lactation & stop pain'],
    indZh: ['胸脅痛', '咳嗽', '產後乳少 / 乳腫痛'],
    indEn: ['Chest & hypochondriac pain', 'Cough', 'Postpartum insufficient lactation / Breast swelling']
  },
  SP19: {
    fnZh: ['寬胸理氣', '宣肺止痛'],
    fnEn: ['Unbind chest & regulate Qi', 'Diffuse Lung & stop pain'],
    indZh: ['胸脅脹痛', '咳嗽'],
    indEn: ['Chest & hypochondriac pain', 'Cough']
  },
  SP20: {
    fnZh: ['宣肺止咳', '寬胸降氣'],
    fnEn: ['Diffuse Lung & arrest cough', 'Unbind chest & descend Qi'],
    indZh: ['胸脅脹痛', '咳嗽氣喘'],
    indEn: ['Chest & hypochondriac pain', 'Cough & asthma']
  },
  SP21: {
    fnZh: ['寬胸理氣', '通絡止痛', '調和氣血'],
    fnEn: ['Unbind chest & regulate Qi', 'Unblock channels & stop pain', 'Harmonize Qi & blood'],
    indZh: ['胸脅痛', '全身疼痛', '四肢無力', '氣喘'],
    indEn: ['Chest & hypochondriac pain', 'General body aches & pain', 'General limb weakness', 'Asthma']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (SP_CURRICULUM_DATA[code]) {
    const cData = SP_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} SP channel points.`);
