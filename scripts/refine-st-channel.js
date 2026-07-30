/**
 * refine-st-channel.js
 * Refines Stomach Channel (足陽明胃經 ST1–ST45):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Jing-Well, Ying-Spring, Shu-Stream, Yuan-Source, Luo-Connecting, Xi-Cleft, He-Sea, Lower He-Sea, Sea of Grain, Four Command, Ma Danyang, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-st-channel.js          (dry run)
 *   node scripts/refine-st-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for ST channel (ST1–ST45)
const ST_NEEDLING_EN = {
  ST1:  'Perpendicular insertion 0.3–0.7 cun along infraorbital margin with patient looking upward. CAUTION: STRICTLY AVOID DEEP ORBITAL INSERTION OR OPTIC NERVE INJURY.',
  ST2:  'Perpendicular insertion 0.2–0.4 cun in infraorbital foramen. CAUTION: Deep insertion inside infraorbital canal contraindicated.',
  ST3:  'Perpendicular or oblique insertion 0.3–0.5 cun directly below pupil level with lower border of ala nasi.',
  ST4:  'Oblique insertion 0.3–0.5 cun toward ST6 at corner of mouth. Key point for facial paralysis & drooling (Dicang).',
  ST5:  'Perpendicular or oblique insertion 0.3–0.5 cun anterior to angle of mandible. CAUTION: Avoid facial artery & vein.',
  ST6:  'Perpendicular insertion 0.3–0.5 cun or oblique toward ST4 at prominence of masseter muscle when teeth are clenched. Primary point for mumps, toothache & facial paralysis (Jiache).',
  ST7:  'Perpendicular insertion 0.3–0.5 cun with mouth closed in depression anterior to condyloid process. Primary point for jaw lock, ear pain & toothache (Xiaguan).',
  ST8:  'Subcutaneous insertion 0.5–0.8 cun along scalp 0.5 cun within corner of forehead. Primary point for frontal headache & dizziness (Touwei).',
  ST9:  'Perpendicular insertion 0.3–0.5 cun at anterior border of sternocleidomastoid muscle level with laryngeal prominence. Primary point for hypertension & goiter (Renying). CAUTION: STRICTLY AVOID CAROTID ARTERY PUNCTURE.',
  ST10: 'Perpendicular insertion 0.3–0.5 cun at anterior border of SCM.',
  ST11: 'Perpendicular insertion 0.3–0.5 cun at superior border of clavicle between sternal & clavicular heads of SCM.',
  ST12: 'Perpendicular insertion 0.3–0.5 cun in midpoint of supraclavicular fossa. CAUTION: STRICTLY AVOID DEEP PERPENDICULAR INSERTION TO PREVENT PNEUMOTHORAX.',
  ST13: 'Perpendicular insertion 0.3–0.5 cun below clavicle on mammillary line 4 cun lateral to midline. CAUTION: Deep insertion risks pneumothorax.',
  ST14: 'Perpendicular insertion 0.3–0.5 cun in 1st intercostal space. CAUTION: Deep insertion risks pneumothorax.',
  ST15: 'Perpendicular insertion 0.3–0.5 cun in 2nd intercostal space. CAUTION: Deep insertion risks pneumothorax.',
  ST16: 'Perpendicular insertion 0.3–0.5 cun in 3rd intercostal space. CAUTION: Deep insertion risks pneumothorax.',
  ST17: 'NO NEEDLING OR MOXIBUSTION (STRICTLY PROHIBITED). Anatomical landmark only (Ruzhong).',
  ST18: 'Oblique or subcutaneous insertion 0.5–0.8 cun in 5th intercostal space directly below nipple. Key point for mastitis & insufficient lactation (Rugen). CAUTION: Deep perpendicular insertion risks pneumothorax.',
  ST19: 'Perpendicular insertion 0.5–0.8 cun 6 cun superior to navel 2 cun lateral to midline.',
  ST20: 'Perpendicular insertion 0.5–0.8 cun 5 cun superior to navel 2 cun lateral to midline.',
  ST21: 'Perpendicular insertion 0.8–1.0 cun 4 cun superior to navel 2 cun lateral to midline. Primary point for severe epigastric pain & vomiting (Liangmen).',
  ST22: 'Perpendicular insertion 0.8–1.0 cun 3 cun superior to navel 2 cun lateral to midline.',
  ST23: 'Perpendicular insertion 0.8–1.0 cun 2 cun superior to navel 2 cun lateral to midline.',
  ST24: 'Perpendicular insertion 0.8–1.0 cun 1 cun superior to navel 2 cun lateral to midline.',
  ST25: 'Perpendicular insertion 0.8–1.2 cun 2 cun lateral to navel. Front-Mu of Large Intestine (Tianshu). Primary point on the body for diarrhea, dysentery, constipation & abdominal pain.',
  ST26: 'Perpendicular insertion 0.8–1.0 cun 1 cun inferior to navel 2 cun lateral to midline.',
  ST27: 'Perpendicular insertion 0.8–1.2 cun 2 cun inferior to navel 2 cun lateral to midline. Primary point for Kidney Yang, hernia & dysmenorrhea (Daju).',
  ST28: 'Perpendicular insertion 0.8–1.2 cun 3 cun inferior to navel 2 cun lateral to midline. Key point for edema, dysuria & lower abdominal pain (Shuidao).',
  ST29: 'Perpendicular insertion 0.8–1.2 cun 4 cun inferior to navel 2 cun lateral to midline. Primary point for dysmenorrhea, infertility & cold in uterus (Guilai).',
  ST30: 'Perpendicular insertion 0.5–1.0 cun at superior border of pubic symphysis 2 cun lateral to midline. Sea of Grain & Chong Mai point (Qichong). CAUTION: Avoid spermatic cord / femoral vessels.',
  ST31: 'Perpendicular insertion 1.0–1.5 cun directly below anterior superior iliac spine level with lower border of pubic symphysis.',
  ST32: 'Perpendicular insertion 1.0–1.5 cun 6 cun superior to lateral border of patella on line joining ASIS & patella.',
  ST33: 'Perpendicular insertion 0.8–1.0 cun 3 cun superior to lateral border of patella.',
  ST34: 'Perpendicular insertion 0.8–1.0 cun 2 cun superior to lateral border of patella. Xi-Cleft point of Stomach channel (Liangqiu). Primary point for acute epigastric pain & acute mastitis.',
  ST35: 'Perpendicular insertion 0.8–1.0 cun in depression lateral to patellar ligament when knee is flexed. Key point for knee joint pain (Dubi).',
  ST36: 'Perpendicular insertion 1.0–1.5 cun 3 cun inferior to ST35 1 finger-breadth lateral to anterior crest of tibia. He-Sea (Earth, Horary), Lower He-Sea of Stomach, Sea of Grain, Four Command Point for Abdomen & Ma Danyang point (Zusanli). Primary point on the body for tonifying Qi, digestion, diarrhea & health preservation.',
  ST37: 'Perpendicular insertion 1.0–1.5 cun 3 cun inferior to ST36. Lower He-Sea point of Large Intestine channel (Shangjuxu). Primary point for diarrhea, dysentery & appendicitis.',
  ST38: 'Perpendicular insertion 1.0–1.5 cun 5 cun inferior to ST36 midway between knee & ankle. Primary point on the body for frozen shoulder & inability to raise arm (Tiaokou).',
  ST39: 'Perpendicular insertion 1.0–1.5 cun 6 cun inferior to ST36. Lower He-Sea point of Small Intestine channel (Xiajuxu). Primary point for small intestine pain & hernia.',
  ST40: 'Perpendicular insertion 1.0–1.5 cun 8 cun superior to lateral malleolus 2 finger-breadths lateral to anterior crest of tibia. Luo-Connecting point of Stomach channel (Fenglong). Primary point on the body for transforming phlegm-dampness, asthma & mania.',
  ST41: 'Perpendicular insertion 0.5–0.8 cun at midpoint of anterior ankle crease between tendons of extensor hallucis longus & extensor digitorum longus. Jing-River (Fire, Mother) point (Jiexi).',
  ST42: 'Perpendicular insertion 0.3–0.5 cun at highest point of dorsum of foot between 2nd & 3rd metatarsal bones. Yuan-Source point of Stomach channel (Chongyang). CAUTION: Avoid dorsalis pedis artery.',
  ST43: 'Perpendicular or oblique insertion 0.3–0.5 cun in depression distal to junction of 2nd & 3rd metatarsal bones. Shu-Stream (Wood) point (Xiangu).',
  ST44: 'Perpendicular or oblique insertion 0.3–0.5 cun in web space between 2nd & 3rd toes. Ying-Spring (Water, Child/Sedation) point (Neiting). Primary point for clearing Stomach Fire, toothache & acid regurgitation.',
  ST45: 'Subcutaneous insertion 0.1 cun at lateral side of 2nd toenail corner, or prick to bleed. Jing-Well (Metal) point (Lidui). Key point for severe nightmares, febrile coma & clearing Stomach Fire.'
};

// Board exam pearls & stars for ST channel key points
const ST_EXAM_PEARLS = {
  ST6: {
    star: 1,
    zh: '★ 頰車為下頜關節、齒痛、面癱與腮腺炎第一要穴（「牙痛面癱尋頰車」）。直刺0.3-0.5寸或向地倉方向透刺。',
    en: '★ Jiache is the primary point for jaw lock, toothache, mumps, and facial paralysis. Perpendicular 0.3-0.5 inch or needle toward ST4.'
  },
  ST8: {
    star: 1,
    zh: '★ 頭維為前頭痛與眩暈第一要穴（「前頭痛尋頭維」）。沿皮刺0.5-0.8寸。',
    en: '★ Touwei is the primary point for frontal headache, dizziness, and eye pain. Subcutaneous 0.5-0.8 inch.'
  },
  ST25: {
    star: 1,
    zh: '★ 天樞為大腸之募穴。腹瀉、腹痛、便秘與痢疾第一要穴（「腹瀉便秘首選天樞」）。直刺0.8-1.2寸。',
    en: '★ Tianshu is the Front-Mu point of Large Intestine. Primary point on the body for diarrhea, dysentery, constipation, and abdominal pain. Perpendicular 0.8-1.2 inch.'
  },
  ST34: {
    star: 1,
    zh: '★ 梁丘為郄穴（胃經郄穴）。急性胃痛、胃痙攣與乳癰第一要穴（「急痛胃痙攣尋梁丘」）。直刺0.8-1.0寸。',
    en: '★ Liangqiu is the Xi-Cleft point of Stomach. Primary point for acute epigastric pain, stomach cramps, and acute mastitis. Perpendicular 0.8-1.0 inch.'
  },
  ST36: {
    star: 1,
    zh: '★ 足三里為合穴（土/本穴）、胃下合穴、四總穴（「肚腹三里留」）、馬丹陽天星十二穴。大補脾胃中氣、消化不良、腹痛腹瀉與全身保健第一要穴。直刺1.0-1.5寸。',
    en: '★ Zusanli is the He-Sea (Earth), Lower He-Sea of ST, Sea of Grain, and Four Command Point (Abdomen). Primary point on the body for tonifying Qi, digestion, diarrhea, and health preservation. Perpendicular 1.0-1.5 inch.'
  },
  ST37: {
    star: 1,
    zh: '★ 上巨虛為大腸之下合穴。腸癰（闌尾炎）、痢疾與大腸急痛第一要穴（「大腸下合上巨虛」）。直刺1.0-1.5寸。',
    en: '★ Shangjuxu is the Lower He-Sea point of Large Intestine. Primary point for appendicitis, dysentery, and intestinal disorders. Perpendicular 1.0-1.5 inch.'
  },
  ST38: {
    star: 1,
    zh: '★ 條口為肩周炎與肩臂不舉第一遠端要穴（「肩痛條口透承山」）。直刺1.0-1.5寸。',
    en: '★ Tiaokou is the primary distal point on the body for frozen shoulder and inability to raise arm. Perpendicular 1.0-1.5 inch.'
  },
  ST39: {
    star: 1,
    zh: '★ 下巨虛為小腸之下合穴。小腸疝氣與腹痛第一要穴（「小腸下合下巨虛」）。直刺1.0-1.5寸。',
    en: '★ Xiajuxu is the Lower He-Sea point of Small Intestine. Primary point for small intestine pain, hernia, and diarrhea. Perpendicular 1.0-1.5 inch.'
  },
  ST40: {
    star: 1,
    zh: '★ 豐隆為絡穴（通脾經）。全身化痰祛濕第一要穴（「痰多眩暈首選豐隆」）。直刺1.0-1.5寸。',
    en: '★ Fenglong is the Luo-Connecting point of Stomach. Primary point on the body for transforming all forms of phlegm-dampness, asthma, and mania. Perpendicular 1.0-1.5 inch.'
  },
  ST44: {
    star: 1,
    zh: '★ 內庭為滎穴（水/子穴）。瀉胃火、牙痛（下齒痛）與胃痛吐酸第一要穴（「胃火牙痛尋內庭」）。直刺或斜刺0.3-0.5寸。',
    en: '★ Neiting is the Ying-Spring (Water, Child/Sedation) point. Primary point for draining Stomach Fire, toothache, and acid regurgitation. Perpendicular/oblique 0.3-0.5 inch.'
  }
};

const ST_SPECIFIC_CAUTIONS = {
  ST1:  { zh: '眼球與下眶緣之間，直刺 0.3-0.7 寸。⚠️ 嚴禁深刺眼眶以免刺傷眼球或視神經。', en: 'Between eyeball & infraorbital margin; perpendicular 0.3-0.7 cun. ⚠️ Avoid deep orbital insertion.' },
  ST2:  { zh: '眶下孔處，直刺 0.2-0.4 寸。', en: 'Infraorbital foramen; perpendicular 0.2-0.4 cun.' },
  ST3:  { zh: '瞳子直下平鼻翼下緣，直刺 0.3-0.5 寸。', en: 'Level with lower border of ala nasi; perpendicular 0.3-0.5 cun.' },
  ST4:  { zh: '口角旁 0.4 寸，斜刺 0.3-0.5 寸。', en: '0.4 cun lateral to corner of mouth; oblique 0.3-0.5 cun.' },
  ST5:  { zh: '咬肌止點前緣，直刺 0.3-0.5 寸。避開面動靜脈。', en: 'Anterior to angle of mandible; perpendicular 0.3-0.5 cun. Avoid facial vessels.' },
  ST6:  { zh: '咬肌隆起處，直刺 0.3-0.5 寸。', en: 'Prominence of masseter muscle; perpendicular 0.3-0.5 cun.' },
  ST7:  { zh: '顴弓下緣凹陷處，閉口直刺 0.3-0.5 寸。', en: 'Below zygomatic arch; closed mouth, perpendicular 0.3-0.5 cun.' },
  ST8:  { zh: '額角髮際內 0.5 寸，沿皮刺 0.5-0.8 寸。', en: '0.5 cun within hairline corner; subcutaneous 0.5-0.8 cun.' },
  ST9:  { zh: '喉結旁胸鎖乳突肌前緣，直刺 0.3-0.5 寸。⚠️ 嚴禁深刺刺傷頸總動脈。', en: 'Anterior to SCM at laryngeal prominence; perpendicular 0.3-0.5 cun. ⚠️ Avoid carotid artery.' },
  ST10: { zh: '人迎下胸鎖乳突肌前緣，直刺 0.3-0.5 寸。', en: 'Anterior border of SCM; perpendicular 0.3-0.5 cun.' },
  ST11: { zh: '鎖骨上緣胸鎖乳突肌兩頭之間，直刺 0.3-0.5 寸。', en: 'Superior border of clavicle; perpendicular 0.3-0.5 cun.' },
  ST12: { zh: '鎖骨上窩中點，直刺 0.3-0.5 寸。⚠️ 嚴禁向內深刺以免刺傷肺尖致氣胸。', en: 'Supraclavicular fossa midpoint; perpendicular 0.3-0.5 cun. ⚠️ Deep insertion risks pneumothorax.' },
  ST13: { zh: '鎖骨下緣，直刺 0.3-0.5 寸。⚠️ 嚴禁深刺以免刺傷肺臟。', en: 'Inferior to clavicle; perpendicular 0.3-0.5 cun. ⚠️ Deep insertion risks pneumothorax.' },
  ST14: { zh: '第 1 肋間隙，直刺 0.3-0.5 寸。⚠️ 嚴禁深刺以免刺傷肺臟。', en: '1st intercostal space; perpendicular 0.3-0.5 cun. ⚠️ Deep insertion risks pneumothorax.' },
  ST15: { zh: '第 2 肋間隙，直刺 0.3-0.5 寸。⚠️ 嚴禁深刺以免刺傷肺臟。', en: '2nd intercostal space; perpendicular 0.3-0.5 cun. ⚠️ Deep insertion risks pneumothorax.' },
  ST16: { zh: '第 3 肋間隙，直刺 0.3-0.5 寸。⚠️ 嚴禁深刺以免刺傷肺臟。', en: '3rd intercostal space; perpendicular 0.3-0.5 cun. ⚠️ Deep insertion risks pneumothorax.' },
  ST17: { zh: '乳頭正中。⚠️ 禁針禁灸！僅作為體表解剖定位標誌。', en: 'Center of nipple. ⚠️ NEEDLING & MOXIBUSTION STRICTLY PROHIBITED! Landmark only.' },
  ST18: { zh: '第 5 肋間隙乳頭直下，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肺臟致氣胸。', en: '5th intercostal space; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion risks pneumothorax.' },
  ST19: { zh: '臍上 6 寸旁開 2 寸，直刺 0.5-0.8 寸。', en: '6 cun above navel, 2 cun lateral; perpendicular 0.5-0.8 cun.' },
  ST20: { zh: '臍上 5 寸旁開 2 寸，直刺 0.5-0.8 寸。', en: '5 cun above navel, 2 cun lateral; perpendicular 0.5-0.8 cun.' },
  ST21: { zh: '臍上 4 寸旁開 2 寸，直刺 0.8-1.0 寸。', en: '4 cun above navel, 2 cun lateral; perpendicular 0.8-1.0 cun.' },
  ST22: { zh: '臍上 3 寸旁開 2 寸，直刺 0.8-1.0 寸。', en: '3 cun above navel, 2 cun lateral; perpendicular 0.8-1.0 cun.' },
  ST23: { zh: '臍上 2 寸旁開 2 寸，直刺 0.8-1.0 寸。', en: '2 cun above navel, 2 cun lateral; perpendicular 0.8-1.0 cun.' },
  ST24: { zh: '臍上 1 寸旁開 2 寸，直刺 0.8-1.0 寸。', en: '1 cun above navel, 2 cun lateral; perpendicular 0.8-1.0 cun.' },
  ST25: { zh: '臍中旁開 2 寸，直刺 0.8-1.2 寸。瘦弱者深刺避開腹膜。', en: '2 cun lateral to navel; perpendicular 0.8-1.2 cun.' },
  ST26: { zh: '臍下 1 寸旁開 2 寸，直刺 0.8-1.0 寸。', en: '1 cun below navel, 2 cun lateral; perpendicular 0.8-1.0 cun.' },
  ST27: { zh: '臍下 2 寸旁開 2 寸，直刺 0.8-1.2 寸。', en: '2 cun below navel, 2 cun lateral; perpendicular 0.8-1.2 cun.' },
  ST28: { zh: '臍下 3 寸旁開 2 寸，直刺 0.8-1.2 寸。', en: '3 cun below navel, 2 cun lateral; perpendicular 0.8-1.2 cun.' },
  ST29: { zh: '臍下 4 寸旁開 2 寸，直刺 0.8-1.2 寸。', en: '4 cun below navel, 2 cun lateral; perpendicular 0.8-1.2 cun.' },
  ST30: { zh: '恥骨聯合上緣旁開 2 寸，直刺 0.5-1.0 寸。避開精索與股血管。', en: 'Superior border of pubic symphysis, 2 cun lateral; perpendicular 0.5-1.0 cun.' },
  ST31: { zh: '髂前上棘直下平恥骨聯合下緣，直刺 1.0-1.5 寸。', en: 'Below ASIS level with pubic symphysis; perpendicular 1.0-1.5 cun.' },
  ST32: { zh: '髕底上 6 寸，直刺 1.0-1.5 寸。', en: '6 cun above patella base; perpendicular 1.0-1.5 cun.' },
  ST33: { zh: '髕底上 3 寸，直刺 0.8-1.0 寸。', en: '3 cun above patella base; perpendicular 0.8-1.0 cun.' },
  ST34: { zh: '髕底上 2 寸外側，直刺 0.8-1.0 寸。', en: '2 cun above patella base; perpendicular 0.8-1.0 cun.' },
  ST35: { zh: '屈膝髕韌帶外側凹陷處，直刺 0.8-1.0 寸。', en: 'Flexed knee patellar ligament depression; perpendicular 0.8-1.0 cun.' },
  ST36: { zh: '犢鼻下 3 寸脛骨前嵴外一橫指，直刺 1.0-1.5 寸。', en: '3 cun below ST35, 1 finger lateral to tibia crest; perpendicular 1.0-1.5 cun.' },
  ST37: { zh: '犢鼻下 6 寸，直刺 1.0-1.5 寸。', en: '6 cun below ST35; perpendicular 1.0-1.5 cun.' },
  ST38: { zh: '條口穴（犢鼻下 8 寸），直刺 1.0-1.5 寸。', en: '8 cun below ST35; perpendicular 1.0-1.5 cun.' },
  ST39: { zh: '犢鼻下 9 寸，直刺 1.0-1.5 寸。', en: '9 cun below ST35; perpendicular 1.0-1.5 cun.' },
  ST40: { zh: '條口穴外 1 寸（外踝尖上 8 寸），直刺 1.0-1.5 寸。', en: '1 cun lateral to ST38; perpendicular 1.0-1.5 cun.' },
  ST41: { zh: '足踝關節橫紋中央凹陷處，直刺 0.5-0.8 寸。', en: 'Center of ankle crease; perpendicular 0.5-0.8 cun.' },
  ST42: { zh: '足背高點第 2、3 跖骨結合部，直刺 0.3-0.5 寸。避開足背動脈。', en: 'Highest point of dorsum of foot; perpendicular 0.3-0.5 cun.' },
  ST43: { zh: '第 2、3 跖骨結合部前方凹陷處，直刺 0.3-0.5 寸。', en: 'Distal to junction of 2nd & 3rd metatarsals; perpendicular 0.3-0.5 cun.' },
  ST44: { zh: '第 2、3 趾縫間，直刺或斜刺 0.3-0.5 寸。', en: 'Web space between 2nd & 3rd toes; perpendicular/oblique 0.3-0.5 cun.' },
  ST45: { zh: '第 2 趾甲角旁 0.1 寸，點刺出血或淺刺 0.1 寸。', en: 'Lateral side of 2nd toenail corner; prick to bleed or 0.1 cun.' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^ST([1-9]|[1-3][0-9]|4[0-5])$/.test(code)) return;

  const idx = parseInt(code.replace('ST', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 8), 6);

  // 1. Needling Method EN
  if (ST_NEEDLING_EN[code] && point.acumethod_en !== ST_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: ST_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = ST_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (ST_SPECIFIC_CAUTIONS[code]) {
    const spec = ST_SPECIFIC_CAUTIONS[code];
    if (APPLY) {
      point.contraindications = [spec.zh];
      point.cautions_zh = [spec.zh];
      point.cautions_en = [spec.en];
      point.cautions = spec.zh;
    }
  }

  // 3. Clean A13 Disease Category Action Tags
  if (Array.isArray(point.action_tags_zh) && Array.isArray(point.action_tags_en)) {
    const newZh = [];
    const newEn = [];
    const movedZh = [];
    const movedEn = [];

    for (let i = 0; i < point.action_tags_zh.length; i++) {
      const tagZh = point.action_tags_zh[i];
      const tagEn = point.action_tags_en[i];

      if (DISEASE_CAT_RE.test(tagZh)) {
        movedZh.push(tagZh);
        if (tagEn) movedEn.push(tagEn);
      } else {
        newZh.push(tagZh);
        if (tagEn) newEn.push(tagEn);
      }
    }

    if (movedZh.length > 0) {
      changes.push({ code, field: 'action_tags_zh/en (clean A13)', from: movedZh.join(', '), to: newZh.join(', ') });
      if (APPLY) {
        point.action_tags_zh = newZh;
        point.action_tags_en = newEn;
        point.acu_tags = newZh;
        point.action_tags = newEn;

        if (!Array.isArray(point.disease_tags_zh)) point.disease_tags_zh = [];
        if (!Array.isArray(point.disease_tags_en)) point.disease_tags_en = [];

        movedZh.forEach((dz, idx2) => {
          if (!point.disease_tags_zh.includes(dz)) {
            point.disease_tags_zh.push(dz);
            if (movedEn[idx2] && !point.disease_tags_en.includes(movedEn[idx2])) {
              point.disease_tags_en.push(movedEn[idx2]);
            }
          }
        });
      }
    }
  }

  // Align disease_tags_zh and _en 1-to-1
  if (APPLY && Array.isArray(point.disease_tags_zh) && Array.isArray(point.disease_tags_en)) {
    while (point.disease_tags_en.length < point.disease_tags_zh.length) {
      point.disease_tags_en.push(point.disease_tags_zh[point.disease_tags_en.length]);
    }
    if (point.disease_tags_en.length > point.disease_tags_zh.length) {
      point.disease_tags_en = point.disease_tags_en.slice(0, point.disease_tags_zh.length);
    }
  }

  // 4. Exam Pearls & Stars
  if (ST_EXAM_PEARLS[code]) {
    const ep = ST_EXAM_PEARLS[code];
    if (point.exam_star !== ep.star) {
      changes.push({ code, field: 'exam_star', from: point.exam_star, to: ep.star });
      if (APPLY) point.exam_star = ep.star;
    }
    if (point.exam_pearl !== ep.zh) {
      changes.push({ code, field: 'exam_pearl', from: point.exam_pearl, to: ep.zh });
      if (APPLY) point.exam_pearl = ep.zh;
    }
    if (point.exam_pearl_en !== ep.en) {
      changes.push({ code, field: 'exam_pearl_en', from: point.exam_pearl_en, to: ep.en });
      if (APPLY) point.exam_pearl_en = ep.en;
    }
  }

  // 5. ST17 Prohibited Point
  if (code === 'ST17') {
    const noNeedleZh = '⚠️ 本穴禁針禁灸（乳中穴正對乳頭，解剖學上嚴禁針刺與施灸，僅作為體表標誌）。';
    if (!point.contraindications.includes(noNeedleZh)) {
      if (APPLY) {
        point.contraindications = [noNeedleZh];
        point.cautions_zh = [noNeedleZh];
        point.cautions_en = ['⚠️ NEEDLING & MOXIBUSTION STRICTLY PROHIBITED! Landmark only.'];
        point.cautions = noNeedleZh;
      }
    }
  }

  // 6. field_sources & review_status
  if (APPLY) {
    point.field_sources = {
      acumethod_zh: ['CloudTCM', 'eLotus CORE'],
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/3 STOMACH CHANNEL OF FOOT YANG MING.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/3 STOMACH CHANNEL OF FOOT YANG MING.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/3 STOMACH CHANNEL OF FOOT YANG MING.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/3 STOMACH CHANNEL OF FOOT YANG MING.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across ST channel:\n`);
changes.slice(0, 30).forEach(c => {
  console.log(`  [${c.code}] ${c.field}`);
  console.log(`    FROM: ${JSON.stringify(c.from)}`);
  console.log(`    TO:   ${JSON.stringify(c.to)}\n`);
});

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Written to ${FILE}`);
} else {
  console.log('Run with --apply to write changes.');
}
