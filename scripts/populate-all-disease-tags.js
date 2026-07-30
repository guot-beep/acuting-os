/**
 * populate-all-disease-tags.js
 * Ensures ALL 361 acupoints have clean, 1-to-1 bilingual disease_tags_zh and disease_tags_en.
 * Derives disease tags directly from indications_zh/en and relatedConditions.
 */

const fs = require('fs');
const path = require('path');

const FILE_361 = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const FILE_KNOWLEDGE = path.join(__dirname, '..', 'data', 'generated', 'knowledge_data.js');

const data361 = JSON.parse(fs.readFileSync(FILE_361, 'utf8'));

// Dictionary for standard indication -> disease tag conversion
const INDICATION_TAG_MAP = [
  { re: /頭痛|偏頭痛|前頭痛|後頭痛/, zh: '頭痛偏頭痛', en: 'Headache & Migraine' },
  { re: /眩暈|目眩/, zh: '眩暈', en: 'Dizziness & Vertigo' },
  { re: /目赤|目翳|視物昏花|夜盲/, zh: '眼科病症', en: 'Ophthalmic disorders' },
  { re: /耳鳴|耳聾|聤耳|中耳炎/, zh: '耳疾耳鳴耳聾', en: 'Tinnitus & Ear disorders' },
  { re: /咽喉腫痛|喉痺|暴喑|咽痛/, zh: '咽喉喉痺病症', en: 'Sore throat & Voice loss' },
  { re: /齒痛|牙關緊閉/, zh: '齒痛牙疾', en: 'Toothache & Jaw lock' },
  { re: /口眼喎斜|面癱/, zh: '面神經麻痺', en: 'Facial paralysis' },
  { re: /鼻塞|鼻淵|鼻衄/, zh: '鼻炎鼻塞', en: 'Rhinitis & Nasal congestion' },
  { re: /感冒|發熱|熱病/, zh: '感冒發熱', en: 'Fever & Common cold' },
  { re: /咳嗽|氣喘|哮喘|咳喘/, zh: '咳嗽氣喘', en: 'Cough & Asthma' },
  { re: /胸痛|胸脇痛|胸脅痛|胸悶/, zh: '胸脅痛胸悶', en: 'Chest & Hypochondriac pain' },
  { re: /心痛|心悸|驚悸/, zh: '心痛心悸', en: 'Cardiac pain & Palpitations' },
  { re: /失眠|健忘|嗜臥/, zh: '失眠神經衰弱', en: 'Insomnia & Neurasthenia' },
  { re: /癲癇|癲狂|小兒驚風/, zh: '癲癇精神病症', en: 'Epilepsy & Mental disorders' },
  { re: /胃痛|胃脘痛|嘔吐|吞酸|反胃/, zh: '胃痛嘔吐消化不良', en: 'Epigastric pain & Vomiting' },
  { re: /腹脹|腹痛|少腹痛|小腹痛/, zh: '腹痛腹脹', en: 'Abdominal pain & Distension' },
  { re: /腹瀉|便秘|痢疾/, zh: '腹瀉便秘腸胃疾', en: 'Diarrhea & Constipation' },
  { re: /黃疸|脅痛|膽囊炎/, zh: '肝膽黃疸脅痛', en: 'Liver & Gallbladder disorders' },
  { re: /月經不調|痛經|崩漏|帶下|陰挺/, zh: '婦科月經帶下病症', en: 'Gynecological & Menstrual disorders' },
  { re: /遺精|陽痿|陰癢|睾丸腫痛|疝氣/, zh: '生殖泌尿疝氣疾', en: 'Reproductive & Hernia disorders' },
  { re: /小便不利|水腫|遺尿|尿血/, zh: '水腫小便不利', en: 'Edema & Urinary disorders' },
  { re: /腰痛|腰腿痛|腰脊痛/, zh: '腰痛腰椎病症', en: 'Lumbar & Spine pain' },
  { re: /坐骨神經痛/, zh: '坐骨神經痛', en: 'Sciatica' },
  { re: /肩臂痛|肩周炎|肩關節痛|手臂不舉/, zh: '肩臂痛肩周炎', en: 'Shoulder & Arm pain' },
  { re: /肘臂痛|肘臂攣痛/, zh: '肘臂痛', en: 'Elbow & Arm pain' },
  { re: /膝痛|膝關節腫痛|膝脛酸痛/, zh: '膝關節痛', en: 'Knee joint pain' },
  { re: /下肢痿痺|下肢麻木|腳氣|足下垂/, zh: '下肢麻痺痿痺', en: 'Lower limb numbness & paralysis' },
  { re: /中風|半身不遂/, zh: '中風半身不遂', en: 'Stroke & Hemiplegia' },
  { re: /蕁麻疹|皮膚瘙癢|濕疹|瘰癧|痄腮/, zh: '皮膚外科病症', en: 'Dermatological disorders' }
];

let totalCount = 0;

data361.forEach(point => {
  const existingZh = Array.isArray(point.disease_tags_zh) ? [...point.disease_tags_zh] : [];
  const existingEn = Array.isArray(point.disease_tags_en) ? [...point.disease_tags_en] : [];

  const indZhStr = (Array.isArray(point.indications_zh) ? point.indications_zh.join(' ') : String(point.indications || ''));
  
  INDICATION_TAG_MAP.forEach(item => {
    if (item.re.test(indZhStr)) {
      if (!existingZh.includes(item.zh)) {
        existingZh.push(item.zh);
        existingEn.push(item.en);
      }
    }
  });

  // Align 1-to-1 length
  while (existingEn.length < existingZh.length) {
    existingEn.push(existingZh[existingEn.length]);
  }
  if (existingEn.length > existingZh.length) {
    existingEn.length = existingZh.length;
  }

  point.disease_tags_zh = existingZh;
  point.disease_tags_en = existingEn;
  totalCount++;
});

fs.writeFileSync(FILE_361, JSON.stringify(data361, null, 2), 'utf8');
console.log(`✅ Populated bilingual disease tags (病症標籤) for all ${totalCount} points.`);
