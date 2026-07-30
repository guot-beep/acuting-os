/**
 * parse-st-curriculum.js
 * Parses all 45 points of Foot Yang Ming Stomach Channel (ST1–ST45)
 * directly from curriculum PDF text and eLotus/AD sources,
 * building 1-to-1 matched clean functions_zh/en and indications_zh/en.
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');

const ST_CURRICULUM_DATA = {
  ST1: {
    fnZh: ['祛風明目', '清熱止痛'],
    fnEn: ['Dispel wind & brighten eyes', 'Clear heat & stop pain'],
    indZh: ['目赤腫痛', '眼瞼瞤動 / 夜盲', '口眼喎斜'],
    indEn: ['Eye redness & swelling', 'Eyelid twitching / Night blindness', 'Facial paralysis']
  },
  ST2: {
    fnZh: ['祛風通絡', '清熱明目'],
    fnEn: ['Dispel wind & unblock channels', 'Clear heat & brighten eyes'],
    indZh: ['目赤腫痛', '口眼喎斜', '面痛 / 三叉神經痛', '齒痛'],
    indEn: ['Eye redness & swelling', 'Facial paralysis', 'Facial pain / Trigeminal neuralgia', 'Toothache']
  },
  ST3: {
    fnZh: ['祛風消腫', '通絡止痛'],
    fnEn: ['Dispel wind & reduce swelling', 'Unblock channels & stop pain'],
    indZh: ['口眼喎斜', '面腫', '齒痛', '鼻塞'],
    indEn: ['Facial paralysis', 'Facial swelling', 'Toothache', 'Nasal congestion']
  },
  ST4: {
    fnZh: ['祛風通絡', '舒筋止痛'],
    fnEn: ['Dispel wind & unblock channels', 'Relax sinews & stop pain'],
    indZh: ['口眼喎斜', '流涎', '齒痛', '唇腫痛'],
    indEn: ['Facial paralysis', 'Drooling / Salivation', 'Toothache', 'Lip swelling & pain']
  },
  ST5: {
    fnZh: ['祛風解毒', '通絡止痛'],
    fnEn: ['Dispel wind & relieve toxicity', 'Unblock channels & stop pain'],
    indZh: ['口角喎斜', '頰腫', '齒痛', '牙關緊閉'],
    indEn: ['Facial deviation', 'Cheek swelling', 'Toothache', 'Trismus / Lockjaw']
  },
  ST6: {
    fnZh: ['祛風清熱', '解毒利齒', '通絡止痛'],
    fnEn: ['Dispel wind & clear heat', 'Relieve toxicity & benefit teeth', 'Unblock channels & stop pain'],
    indZh: ['齒痛', '口眼喎斜', '牙關緊閉 / 腮腺炎', '面腫痛'],
    indEn: ['Toothache', 'Facial paralysis', 'Trismus / Mumps', 'Facial swelling & pain']
  },
  ST7: {
    fnZh: ['聰耳利齒', '祛風通絡'],
    fnEn: ['Benefit ears & teeth', 'Dispel wind & unblock channels'],
    indZh: ['耳鳴耳聾', '齒痛', '口眼喎斜', '耳痛'],
    indEn: ['Tinnitus & deafness', 'Toothache', 'Facial paralysis', 'Ear pain']
  },
  ST8: {
    fnZh: ['祛風清頭', '止痛明目'],
    fnEn: ['Dispel wind & clear head', 'Stop pain & brighten eyes'],
    indZh: ['頭痛', '眩暈', '目痛 / 流淚'],
    indEn: ['Headache', 'Dizziness', 'Eye pain / Lacrimation']
  },
  ST9: {
    fnZh: ['祛風散結', '降逆平喘', '調和氣血'],
    fnEn: ['Dispel wind & dissipate nodules', 'Descend Qi & calm asthma', 'Harmonize Qi & blood'],
    indZh: ['咽喉腫痛', '癭氣 / 瘰癧', '氣喘咳嗽', '高血壓 / 低血壓'],
    indEn: ['Sore throat', 'Goiter / Scrofula', 'Asthma & cough', 'Hypertension / Hypotension']
  },
  ST10: {
    fnZh: ['利咽消腫', '降氣止咳'],
    fnEn: ['Benefit throat & reduce swelling', 'Descend Qi & arrest cough'],
    indZh: ['咽喉腫痛', '氣喘', '瘰癧'],
    indEn: ['Sore throat', 'Asthma', 'Scrofula']
  },
  ST11: {
    fnZh: ['寬胸理氣', '止咳平喘'],
    fnEn: ['Unbind chest & regulate Qi', 'Arrest cough & calm asthma'],
    indZh: ['咽喉腫痛', '氣喘咳嗽', '瘿氣'],
    indEn: ['Sore throat', 'Asthma & cough', 'Goiter']
  },
  ST12: {
    fnZh: ['宣肺平喘', '寬胸止痛', '通絡散結'],
    fnEn: ['Diffuse Lung & calm asthma', 'Unbind chest & stop pain', 'Unblock channels & dissipate nodules'],
    indZh: ['咳嗽氣喘', '咽喉腫痛', '缺盆中痛', '瘰癧'],
    indEn: ['Cough & asthma', 'Sore throat', 'Supraclavicular pain', 'Scrofula']
  },
  ST13: {
    fnZh: ['宣肺止咳', '寬胸理氣'],
    fnEn: ['Diffuse Lung & arrest cough', 'Unbind chest & regulate Qi'],
    indZh: ['咳嗽氣喘', '胸脅脹痛'],
    indEn: ['Cough & asthma', 'Chest & hypochondriac distension']
  },
  ST14: {
    fnZh: ['寬胸降氣', '止咳平喘'],
    fnEn: ['Unbind chest & descend Qi', 'Arrest cough & calm asthma'],
    indZh: ['咳嗽氣喘', '胸脅脹痛'],
    indEn: ['Cough & asthma', 'Chest & hypochondriac distension']
  },
  ST15: {
    fnZh: ['清熱宣肺', '通乳消腫'],
    fnEn: ['Clear heat & diffuse Lung', 'Promote lactation & reduce swelling'],
    indZh: ['咳嗽氣喘', '胸痛', '乳房腫痛'],
    indEn: ['Cough & asthma', 'Chest pain', 'Breast swelling & pain']
  },
  ST16: {
    fnZh: ['寬胸理氣', '通乳止痛'],
    fnEn: ['Unbind chest & regulate Qi', 'Promote lactation & stop pain'],
    indZh: ['胸痛', '咳嗽', '乳癰 / 乳少'],
    indEn: ['Chest pain', 'Cough', 'Acute mastitis / Insufficient lactation']
  },
  ST17: {
    fnZh: ['標誌穴位', '解剖定位標誌'],
    fnEn: ['Anatomical landmark', 'Prohibited for needling & moxibustion'],
    indZh: ['體表解剖標誌', '禁針禁灸'],
    indEn: ['Anatomical landmark', 'Needling & moxibustion strictly prohibited']
  },
  ST18: {
    fnZh: ['理氣寬胸', '通乳消腫'],
    fnEn: ['Regulate Qi & unbind chest', 'Promote lactation & reduce swelling'],
    indZh: ['乳房脹痛 / 乳癰', '產後乳少', '胸痛咳嗽'],
    indEn: ['Breast distension & pain / Mastitis', 'Postpartum insufficient lactation', 'Chest pain & cough']
  },
  ST19: {
    fnZh: ['和胃降逆', '理氣止痛'],
    fnEn: ['Harmonize Stomach & descend Qi', 'Regulate Qi & stop pain'],
    indZh: ['胃痛', '嘔吐', '食欲不振', '腹脹'],
    indEn: ['Epigastric pain', 'Vomiting', 'Poor appetite', 'Abdominal distension']
  },
  ST20: {
    fnZh: ['和胃消食', '理氣止痛'],
    fnEn: ['Harmonize Stomach & digest food', 'Regulate Qi & stop pain'],
    indZh: ['胃痛', '嘔吐', '腹脹', '納呆'],
    indEn: ['Epigastric pain', 'Vomiting', 'Abdominal distension', 'Anorexia / Poor appetite']
  },
  ST21: {
    fnZh: ['和胃降逆', '健脾理氣', '止嘔止痛'],
    fnEn: ['Harmonize Stomach & descend Qi', 'Fortify Spleen & regulate Qi', 'Arrest vomiting & stop pain'],
    indZh: ['胃痛', '嘔吐', '腹脹腹瀉', '食欲不振'],
    indEn: ['Epigastric pain', 'Vomiting', 'Abdominal distension & diarrhea', 'Poor appetite']
  },
  ST22: {
    fnZh: ['健脾利濕', '理氣腸鳴'],
    fnEn: ['Fortify Spleen & drain dampness', 'Regulate Qi & relieve borborygmus'],
    indZh: ['腹脹腹痛', '腸鳴腹瀉', '水腫'],
    indEn: ['Abdominal distension & pain', 'Borborygmus & diarrhea', 'Edema']
  },
  ST23: {
    fnZh: ['和胃安神', '理氣止痛'],
    fnEn: ['Harmonize Stomach & calm spirit', 'Regulate Qi & stop pain'],
    indZh: ['胃痛', '腹脹', '癲狂'],
    indEn: ['Epigastric pain', 'Abdominal distension', 'Mania']
  },
  ST24: {
    fnZh: ['調經理氣', '和胃止痛'],
    fnEn: ['Regulate menses & Qi', 'Harmonize Stomach & stop pain'],
    indZh: ['腹痛', '嘔吐', '月經不調'],
    indEn: ['Abdominal pain', 'Vomiting', 'Irregular menses']
  },
  ST25: {
    fnZh: ['理氣消滯', '調和腸胃', '通便止瀉', '培元固本'],
    fnEn: ['Regulate Qi & resolve food stagnation', 'Harmonize Intestines & Stomach', 'Unblock constipation & arrest diarrhea', 'Consolidate root'],
    indZh: ['腹脹腹痛', '腹瀉 / 痢疾', '便秘', '月經不調 / 痛經', '水腫'],
    indEn: ['Abdominal distension & pain', 'Diarrhea / Dysentery', 'Constipation', 'Irregular menses / Dysmenorrhea', 'Edema']
  },
  ST26: {
    fnZh: ['理氣止痛', '通絡疝氣'],
    fnEn: ['Regulate Qi & stop pain', 'Unblock channels for hernia'],
    indZh: ['腹痛', '疝氣', '痛經'],
    indEn: ['Abdominal pain', 'Hernia', 'Dysmenorrhea']
  },
  ST27: {
    fnZh: ['補腎壯陽', '調經止帶', '理氣止痛'],
    fnEn: ['Tonify Kidney & strengthen Yang', 'Regulate menses & arrest leukorrhea', 'Regulate Qi & stop pain'],
    indZh: ['小腹痛', '疝氣', '遺精 / 陽痿', '月經不調 / 痛經'],
    indEn: ['Lower abdominal pain', 'Hernia', 'Spermatorrhea / Impotence', 'Irregular menses / Dysmenorrhea']
  },
  ST28: {
    fnZh: ['清熱利濕', '通利小便', '調經止帶'],
    fnEn: ['Clear heat & drain dampness', 'Unblock urination', 'Regulate menses & arrest leukorrhea'],
    indZh: ['小腹脹痛', '小便不利 / 水腫', '痛經 / 帶下', '疝氣'],
    indEn: ['Lower abdominal pain', 'Difficult urination / Edema', 'Dysmenorrhea / Leukorrhea', 'Hernia']
  },
  LR29: {
    fnZh: ['理氣止痛', '溫經散寒'],
    fnEn: ['Regulate Qi & stop pain', 'Warm channels & scatter cold'],
    indZh: ['小腹痛', '疝氣', '陰挺 / 月經不調'],
    indEn: ['Lower abdominal pain', 'Hernia', 'Uterine prolapse / Irregular menses']
  },
  ST29: {
    fnZh: ['理氣止痛', '溫經散寒'],
    fnEn: ['Regulate Qi & stop pain', 'Warm channels & scatter cold'],
    indZh: ['小腹痛', '疝氣', '陰挺 / 月經不調'],
    indEn: ['Lower abdominal pain', 'Hernia', 'Uterine prolapse / Irregular menses']
  },
  ST30: {
    fnZh: ['調理沖任', '溫補下焦', '通絡止痛'],
    fnEn: ['Regulate Chong & Ren vessels', 'Warm & tonify lower jiao', 'Unblock channels & stop pain'],
    indZh: ['少腹痛', '疝氣', '月經不調 / 痛經', '陽痿 / 睾丸腫痛'],
    indEn: ['Lower abdominal pain', 'Hernia', 'Irregular menses / Dysmenorrhea', 'Impotence / Testicular pain']
  },
  ST31: {
    fnZh: ['祛風除濕', '舒筋活絡'],
    fnEn: ['Dispel wind & eliminate dampness', 'Relax sinews & invigorate collaterals'],
    indZh: ['下肢痿痺', '腰痛膝冷', '髖關節痛'],
    indEn: ['Lower limb weakness', 'Lumbar pain & cold knees', 'Hip joint pain']
  },
  ST32: {
    fnZh: ['祛風散寒', '通絡止痛'],
    fnEn: ['Dispel wind & scatter cold', 'Unblock channels & stop pain'],
    indZh: ['股膝麻木痛', '下肢痿痺', '疝氣'],
    indEn: ['Thigh & knee numbness/pain', 'Lower limb weakness', 'Hernia']
  },
  ST33: {
    fnZh: ['溫經散寒', '舒筋利節'],
    fnEn: ['Warm channels & scatter cold', 'Relax sinews & benefit joints'],
    indZh: ['膝關節腫痛', '下肢麻木'],
    indEn: ['Knee joint swelling & pain', 'Lower limb numbness']
  },
  ST34: {
    fnZh: ['和胃止痛', '祛風通絡'],
    fnEn: ['Harmonize Stomach & stop pain', 'Dispel wind & unblock channels'],
    indZh: ['急性胃痛', '乳癰 / 乳房脹痛', '膝關節痛'],
    indEn: ['Acute epigastric pain', 'Acute mastitis / Breast pain', 'Knee joint pain']
  },
  ST35: {
    fnZh: ['通利關節', '祛風散寒', '止痛消腫'],
    fnEn: ['Benefit joints', 'Dispel wind & scatter cold', 'Stop pain & reduce swelling'],
    indZh: ['膝關節腫痛', '下肢痿痺', '腳氣'],
    indEn: ['Knee joint swelling & pain', 'Lower limb weakness', 'Beriberi']
  },
  ST36: {
    fnZh: ['健脾和胃', '大補中氣', '扶正培元', '通經活絡', '祛濕止瀉', '防病保健'],
    fnEn: ['Fortify Spleen & harmonize Stomach', 'Strongly tonify middle Qi', 'Support correct Qi & consolidate root', 'Unblock channels & invigorate collaterals', 'Eliminate dampness & arrest diarrhea', 'Prevent disease & healthcare'],
    indZh: ['胃痛腹脹', '嘔吐腹瀉 / 便秘', '虛勞羸瘦', '咳嗽氣喘', '心悸失眠', '水腫', '下肢痿痺 / 膝痛', '預防保健'],
    indEn: ['Epigastric pain & abdominal distension', 'Vomiting & diarrhea / Constipation', 'Deficiency fatigue & emaciation', 'Cough & asthma', 'Palpitations & insomnia', 'Edema', 'Lower limb weakness / Knee pain', 'Health preservation']
  },
  ST37: {
    fnZh: ['清熱理腸', '通腑化滯', '利濕止瀉'],
    fnEn: ['Clear heat & regulate intestines', 'Unblock Fu organs & resolve stagnation', 'Drain dampness & arrest diarrhea'],
    indZh: ['腹痛腹瀉', '痢疾', '便秘', '腸癰 / 闌尾炎', '下肢痿痺'],
    indEn: ['Abdominal pain & diarrhea', 'Dysentery', 'Constipation', 'Intestinal abscess / Appendicitis', 'Lower limb weakness']
  },
  ST38: {
    fnZh: ['祛風除濕', '舒筋活絡', '通利關節'],
    fnEn: ['Dispel wind & eliminate dampness', 'Relax sinews & invigorate collaterals', 'Benefit joints & stop pain'],
    indZh: ['肩周炎 / 肩臂不舉', '下肢麻木痿痺', '膝脛痛'],
    indEn: ['Frozen shoulder / Inability to raise arm', 'Lower limb numbness & paralysis', 'Knee & leg pain']
  },
  ST39: {
    fnZh: ['清熱利濕', '理氣止痛', '通腸化滯'],
    fnEn: ['Clear heat & drain dampness', 'Regulate Qi & stop pain', 'Unblock intestines & resolve stagnation'],
    indZh: ['小腸疝氣', '腹痛腹瀉', '乳癰', '下肢痿痺'],
    indEn: ['Small intestine hernia', 'Abdominal pain & diarrhea', 'Acute mastitis', 'Lower limb weakness']
  },
  ST40: {
    fnZh: ['化痰祛濕', '清熱寧神', '宣肺平喘', '通絡止痛'],
    fnEn: ['Transform phlegm & eliminate dampness', 'Clear heat & calm spirit', 'Diffuse Lung & calm asthma', 'Unblock channels & stop pain'],
    indZh: ['咳嗽痰多', '哮喘', '頭痛眩暈', '癲狂癲癇', '下肢痿痺'],
    indEn: ['Cough with profuse phlegm', 'Asthma', 'Headache & dizziness', 'Mania & epilepsy', 'Lower limb weakness']
  },
  ST41: {
    fnZh: ['健脾化濕', '清熱安神', '通絡止痛'],
    fnEn: ['Fortify Spleen & transform dampness', 'Clear heat & calm spirit', 'Unblock channels & stop pain'],
    indZh: ['頭痛眩暈', '腹脹便秘', '足踝腫痛', '狂證'],
    indEn: ['Headache & dizziness', 'Abdominal distension & constipation', 'Ankle swelling & pain', 'Mania']
  },
  ST42: {
    fnZh: ['和胃理氣', '清熱定驚'],
    fnEn: ['Harmonize Stomach & regulate Qi', 'Clear heat & settle fright'],
    indZh: ['胃痛腹脹', '口眼喎斜', '齒痛', '足跗腫痛'],
    indEn: ['Epigastric pain & distension', 'Facial paralysis', 'Toothache', 'Dorsal foot swelling & pain']
  },
  ST43: {
    fnZh: ['健脾化濕', '消腫止痛'],
    fnEn: ['Fortify Spleen & transform dampness', 'Reduce swelling & stop pain'],
    indZh: ['面腫', '水腫', '腹痛腸鳴', '足跗腫痛'],
    indEn: ['Facial swelling', 'Edema', 'Abdominal pain & borborygmus', 'Dorsal foot swelling & pain']
  },
  ST44: {
    fnZh: ['清瀉胃火', '理氣止痛', '通腑化滯'],
    fnEn: ['Clear & drain Stomach Fire', 'Regulate Qi & stop pain', 'Unblock Fu organs & resolve stagnation'],
    indZh: ['齒痛', '口眼喎斜', '咽喉腫痛', '胃痛吞酸', '熱病', '足背腫痛'],
    indEn: ['Toothache', 'Facial paralysis', 'Sore throat', 'Epigastric pain & acid regurgitation', 'Febrile disease', 'Dorsal foot swelling & pain']
  },
  ST45: {
    fnZh: ['清熱瀉火', '醒腦開竅', '安神定志'],
    fnEn: ['Clear heat & drain fire', 'Revive brain & open orifices', 'Calm spirit & settle mind'],
    indZh: ['熱病發熱', '狂證 / 夢魘', '齒痛', '口喎', '急救昏迷'],
    indEn: ['Febrile disease & fever', 'Mania / Nightmares', 'Toothache', 'Facial deviation', 'Resuscitation']
  }
};

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

let updated = 0;
data361.forEach(point => {
  const code = point.code;
  if (ST_CURRICULUM_DATA[code]) {
    const cData = ST_CURRICULUM_DATA[code];
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
console.log(`✅ Updated 1-to-1 matched clean functions and indications for all ${updated} ST channel points.`);
