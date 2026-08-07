const fs = require('fs');
const path = require('path');

const uniqueTreats = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_unique_treats.json'), 'utf8'));

// Pure Traditional Chinese translations for medical terms
function translateMedicalTerm(en) {
  if (!en) return '';
  let s = en.trim();

  // Core replacements
  let t = s
    .replace(/Abdominal distention/gi, '腹脹')
    .replace(/Abdominal pain/gi, '腹痛')
    .replace(/during pregnancy/gi, '（妊娠期）')
    .replace(/Acid reflux/gi, '胃酸過多 / 反酸')
    .replace(/Acute infectious multiple neuritis/gi, '急性感染性多發性神經炎')
    .replace(/Aftermath of severe illness/gi, '大病後體虛調理')
    .replace(/AIDS\/HIV/gi, '愛滋病 / HIV免疫功能低下')
    .replace(/Allergic rhinitis/gi, '過敏性鼻炎')
    .replace(/Alzheimer's disease/gi, '阿茲海默症（老年癡呆症）')
    .replace(/Amenorrhea/gi, '閉經')
    .replace(/Anal prolapse/gi, '脫肛')
    .replace(/Anemia/gi, '貧血')
    .replace(/Anorexia/gi, '食慾不振 / 厭食')
    .replace(/Aphthous ulcers/gi, '口瘡 / 口腔潰瘍')
    .replace(/Aplastic anemia/gi, '再生障礙性貧血')
    .replace(/Arrhythmias/gi, '心律失常')
    .replace(/Asthma/gi, '哮喘')
    .replace(/Atrophy \(Wei\) Syndrome/gi, '痿證')
    .replace(/Benign Prostatic Hypertrophy/gi, '前列腺增生（肥大）')
    .replace(/Bi Syndrome/gi, '痺證（關節疼痛）')
    .replace(/Bladder cancer/gi, '膀胱癌')
    .replace(/Bladder prolapse/gi, '膀胱脫垂')
    .replace(/Bleeding hemorrhoids/gi, '痔瘡出血')
    .replace(/Borborygmus/gi, '腸鳴')
    .replace(/Breast discharge/gi, '乳溢 / 乳房溢液')
    .replace(/Candidiasis/gi, '念珠菌感染')
    .replace(/Cataract/gi, '白內障')
    .replace(/Cerebral arterial sclerosis/gi, '腦動脈硬化')
    .replace(/Childhood eczema/gi, '小兒濕疹')
    .replace(/Chronic bronchitis/gi, '慢性支氣管炎')
    .replace(/Chronic diarrhea/gi, '慢性腹瀉')
    .replace(/Chronic dysentery/gi, '慢性痢疾')
    .replace(/Chronic Fatigue Immune Deficiency Syndrome \(CFIDS\)/gi, '慢性疲勞綜合征 (CFS)')
    .replace(/Chronic gastritis/gi, '慢性胃炎')
    .replace(/Chronic gastroenteritis/gi, '慢性胃腸炎')
    .replace(/Chronic hepatitis/gi, '慢性肝炎')
    .replace(/Chronic laryngitis/gi, '慢性喉炎')
    .replace(/Chronic nephritis/gi, '慢性腎炎')
    .replace(/Chronic pharyngitis/gi, '慢性咽炎')
    .replace(/Chronic weakness/gi, '慢性體虛')
    .replace(/Chyluria/gi, '乳糜尿')
    .replace(/Clouded vision/gi, '視物昏花')
    .replace(/Colitis/gi, '結腸炎')
    .replace(/Common cold/gi, '感冒')
    .replace(/Constipation/gi, '便秘')
    .replace(/Cough/gi, '咳嗽')
    .replace(/Crohn's disease/gi, '克隆氏症')
    .replace(/Deafness/gi, '耳聾')
    .replace(/Depression/gi, '憂鬱症')
    .replace(/Diarrhea/gi, '腹瀉')
    .replace(/Diverticulitis/gi, '憩室炎')
    .replace(/Dizziness/gi, '頭暈目眩')
    .replace(/Dysentery/gi, '痢疾')
    .replace(/Dyspnea/gi, '氣促喘息')
    .replace(/Eczema/gi, '濕疹')
    .replace(/Edema/gi, '水腫')
    .replace(/Emaciation/gi, '消瘦')
    .replace(/Endometriosis/gi, '子宮內膜異位症')
    .replace(/Enuresis/gi, '遺尿')
    .replace(/Epistaxis/gi, '鼻衄（鼻出血）')
    .replace(/Facial paralysis/gi, '面神經麻痺（面癱）')
    .replace(/Fatigue/gi, '疲勞乏力')
    .replace(/Fever/gi, '發熱')
    .replace(/Forgetfulness/gi, '健忘')
    .replace(/Gastroptosis/gi, '胃下垂')
    .replace(/Gastritis/gi, '胃炎')
    .replace(/Headache/gi, '頭痛')
    .replace(/Hematuria/gi, '血尿')
    .replace(/Hemorrhoids/gi, '痔瘡')
    .replace(/Hiccups/gi, '呃逆')
    .replace(/Hypertension/gi, '高血壓')
    .replace(/Hypotension/gi, '低血壓')
    .replace(/Impotence/gi, '陽痿')
    .replace(/Infertility/gi, '不孕症')
    .replace(/Insomnia/gi, '失眠')
    .replace(/Irritable bowel syndrome/gi, '腸易激綜合征 (IBS)')
    .replace(/Leukopenia/gi, '白細胞減少症')
    .replace(/Leukorrhea/gi, '帶下過多')
    .replace(/Low back pain/gi, '腰痛')
    .replace(/Malnutrition/gi, '小兒疳積 / 營養不良')
    .replace(/Menorrhagia/gi, '月經過多')
    .replace(/Multiple sclerosis/gi, '多發性硬化症')
    .replace(/Myasthenia gravis/gi, '重症肌無力')
    .replace(/Nausea\/Vomiting/gi, '惡心嘔吐')
    .replace(/Neurasthenia/gi, '神經衰弱')
    .replace(/Night sweats/gi, '盜汗')
    .replace(/Obesity/gi, '肥胖症')
    .replace(/Palpitations/gi, '心悸')
    .replace(/Peptic ulcer/gi, '胃及十二指腸潰瘍')
    .replace(/Prostate cancer/gi, '前列腺癌')
    .replace(/Prostatitis/gi, '前列腺炎')
    .replace(/Raynaud's disease/gi, '雷諾氏症')
    .replace(/Rectal prolapse/gi, '脫肛')
    .replace(/Rhinitis/gi, '鼻炎')
    .replace(/Sciatica/gi, '坐骨神經痛')
    .replace(/Sinusitis/gi, '鼻竇炎')
    .replace(/Spontaneous perspiration/gi, '自汗')
    .replace(/Stomach cancer/gi, '胃癌')
    .replace(/Stroke/gi, '中風')
    .replace(/Tinnitus/gi, '耳鳴')
    .replace(/Ulcerative colitis/gi, '潰瘍性結腸炎')
    .replace(/Urinary incontinence/gi, '尿失禁')
    .replace(/Uterine bleeding/gi, '崩漏 / 功能性子宮出血')
    .replace(/Uterine fibroids/gi, '子宮肌瘤')
    .replace(/Uterine prolapse/gi, '子宮脫垂')
    .replace(/Vaginal discharge/gi, '陰道分泌物異常')
    .replace(/Vaginitis/gi, '陰道炎')
    .replace(/Vertigo/gi, '眩暈');

  // Strip English letters if t was translated, otherwise return clean Chinese concept
  let clean = t.replace(/[a-zA-Z]/g, '').trim();
  if (!clean || clean.length < 2) {
    return s; // Fallback to raw term if unmapped
  }
  return clean;
}

const TREAT_DICT = {};
uniqueTreats.forEach(t => {
  TREAT_DICT[t] = translateMedicalTerm(t);
});

fs.writeFileSync(path.join(__dirname, 'exact_treats_dict.json'), JSON.stringify(TREAT_DICT, null, 2), 'utf8');
console.log('Saved exact_treats_dict.json with', Object.keys(TREAT_DICT).length, 'entries.');
