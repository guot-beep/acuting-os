/**
 * parse-lr-curriculum.js
 * Parses all 14 points of Foot Jue Yin Liver Channel (LR1–LR14)
 * directly from curriculum PDF text and eLotus/AD sources,
 * building 1-to-1 matched clean functions_zh/en and indications_zh/en.
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const LR_CURRICULUM_DATA = {
  LR1: {
    fnZh: ['理氣止痛', '固崩止帶', '疏肝理氣', '清熱開竅'],
    fnEn: ['Regulate Qi & stop pain', 'Consolidate flooding & stop leukorrhea', 'Soothe Liver & regulate Qi', 'Clear heat & open orifices'],
    indZh: ['疝氣小腹痛', '崩漏', '陰挺 / 睾丸腫痛', '小便不利 / 尿血', '癲狂'],
    indEn: ['Hernia & lower abdominal pain', 'Uterine bleeding / Menorrhagia', 'Uterine prolapse / Testicular swelling', 'Difficult urination / Hematuria', 'Mania / Mental disorders']
  },
  LR2: {
    fnZh: ['清肝瀉火', '平肝息風', '清熱利濕', '涼血止血'],
    fnEn: ['Clear Liver & drain fire', 'Pacify Liver & extinguish wind', 'Clear heat & drain dampness', 'Cool blood & stop bleeding'],
    indZh: ['頭痛眩暈', '目赤腫痛', '口眼喎斜', '月經過多 / 崩漏', '小便痛 / 陰痛', '痛經'],
    indEn: ['Headache & dizziness', 'Eye redness & swelling', 'Facial paralysis', 'Menorrhagia / Uterine bleeding', 'Dysuria / Pudendal pain', 'Dysmenorrhea']
  },
  LR3: {
    fnZh: ['平肝息風', '疏肝理氣', '清頭明目', '通絡止痛', '調經和血'],
    fnEn: ['Pacify Liver & extinguish wind', 'Soothe Liver & regulate Qi', 'Clear head & brighten eyes', 'Unblock channels & stop pain', 'Regulate menses & harmonize blood'],
    indZh: ['頭痛眩暈', '目赤腫痛', '脅肋痛', '月經不調 / 痛經', '中風口眼喎斜', '癲癇', '下肢痿痺'],
    indEn: ['Headache & dizziness', 'Eye redness & swelling', 'Hypochondriac pain', 'Irregular menses / Dysmenorrhea', 'Stroke facial paralysis', 'Epilepsy', 'Lower limb weakness']
  },
  LR4: {
    fnZh: ['疏肝理氣', '清下焦濕熱'],
    fnEn: ['Soothe Liver & regulate Qi', 'Clear lower jiao damp-heat'],
    indZh: ['疝氣小腹痛', '小便不利', '遺精', '外踝腫痛'],
    indEn: ['Hernia & lower abdominal pain', 'Difficult urination', 'Spermatorrhea', 'External malleolus swelling & pain']
  },
  LR5: {
    fnZh: ['疏肝理氣', '清熱利濕', '調經止帶', '通絡止痛'],
    fnEn: ['Soothe Liver & regulate Qi', 'Clear heat & drain dampness', 'Regulate menses & arrest leukorrhea', 'Unblock channels & stop pain'],
    indZh: ['陰癢 / 睪丸腫痛', '小便不利', '月經不調', '帶下', '梅核氣', '脛骨酸痛'],
    indEn: ['Genital itching / Testicular pain', 'Difficult urination', 'Irregular menses', 'Leukorrhea', 'Plum-pit Qi / Globus hystericus', 'Tibial soreness']
  },
  LR6: {
    fnZh: ['疏肝理氣', '清熱止血'],
    fnEn: ['Soothe Liver & regulate Qi', 'Clear heat & stop bleeding'],
    indZh: ['疝氣', '崩漏', '腹瀉', '下肢麻木'],
    indEn: ['Hernia', 'Uterine bleeding', 'Diarrhea', 'Lower limb numbness']
  },
  LR7: {
    fnZh: ['舒筋活絡', '利膝止痛'],
    fnEn: ['Relax sinews & invigorate collaterals', 'Benefit knee & stop pain'],
    indZh: ['膝關節腫痛', '下肢痿痺'],
    indEn: ['Knee joint swelling & pain', 'Lower limb weakness & paralysis']
  },
  LR8: {
    fnZh: ['滋陰養肝', '清熱利濕', '舒筋活絡', '調經止帶'],
    fnEn: ['Nourish Yin & tonify Liver blood', 'Clear heat & drain dampness', 'Relax sinews & invigorate collaterals', 'Regulate menses & arrest leukorrhea'],
    indZh: ['小便不利 / 陰痛', '陰挺 / 帶下', '遺精 / 陽痿', '膝關節痛', '月經不調'],
    indEn: ['Difficult urination / Pudendal pain', 'Uterine prolapse / Leukorrhea', 'Spermatorrhea / Impotence', 'Knee joint pain', 'Irregular menses']
  },
  LR9: {
    fnZh: ['理氣止痛', '清熱利濕'],
    fnEn: ['Regulate Qi & stop pain', 'Clear heat & drain dampness'],
    indZh: ['小便不利', '月經不調', '睾丸腫痛', '股內側痛'],
    indEn: ['Difficult urination', 'Irregular menses', 'Testicular pain', 'Medial thigh pain']
  },
  LR10: {
    fnZh: ['清熱利濕', '調經止痛'],
    fnEn: ['Clear heat & drain dampness', 'Regulate menses & stop pain'],
    indZh: ['小便不利', '月經不調', '陰癢'],
    indEn: ['Difficult urination', 'Irregular menses', 'Genital itching']
  },
  LR11: {
    fnZh: ['疏肝理氣', '清熱利濕'],
    fnEn: ['Soothe Liver & regulate Qi', 'Clear heat & drain dampness'],
    indZh: ['陰痛', '月經不調', '股內側痛'],
    indEn: ['Pudendal pain', 'Irregular menses', 'Medial thigh pain']
  },
  LR12: {
    fnZh: ['溫經散寒', '理氣止痛'],
    fnEn: ['Warm channels & scatter cold', 'Regulate Qi & stop pain'],
    indZh: ['少腹痛', '疝氣', '陰挺'],
    indEn: ['Lower abdominal pain', 'Hernia', 'Uterine prolapse']
  },
  LR13: {
    fnZh: ['健脾和胃', '疏肝理氣', '消食化積', '理氣止痛'],
    fnEn: ['Fortify Spleen & harmonize Stomach', 'Soothe Liver & regulate Qi', 'Digest food & resolve stagnation', 'Regulate Qi & stop pain'],
    indZh: ['腹脹腹瀉', '嘔吐', '脅肋痛 / 肝脾腫大', '胃痛'],
    indEn: ['Abdominal distension & diarrhea', 'Vomiting', 'Hypochondriac pain / Hepatosplenomegaly', 'Epigastric pain']
  },
  LR14: {
    fnZh: ['疏肝理氣', '和胃降逆', '活血化瘀', '寬胸止痛'],
    fnEn: ['Soothe Liver & regulate Qi', 'Harmonize Stomach & descend Qi', 'Invigorate blood & dispel stasis', 'Unbind chest & stop pain'],
    indZh: ['脅肋痛', '腹脹嘔吐', '乳癰 / 乳房脹痛', '鬱證 / 氣喘'],
    indEn: ['Hypochondriac pain', 'Abdominal distension & vomiting', 'Acute mastitis / Breast distension', 'Depression / Asthma']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (LR_CURRICULUM_DATA[code]) {
    const cData = LR_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} LR channel points.`);
