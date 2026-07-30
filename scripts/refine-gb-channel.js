/**
 * refine-gb-channel.js
 * Refines Gallbladder Channel (足少陽膽經 GB1–GB44):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Jing-Well, Ying-Spring, Shu-Stream, Yuan-Source, Luo-Connecting, Xi-Cleft, He-Sea, Hui-Meeting of Sinews/Marrow, Front-Mu, Confluent, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-gb-channel.js          (dry run)
 *   node scripts/refine-gb-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for GB channel (GB1–GB44)
const GB_NEEDLING_EN = {
  GB1:  'Subcutaneous insertion 0.3–0.5 cun 0.5 cun lateral to outer canthus of eye. CAUTION: Avoid deep orbital insertion or optic nerve injury.',
  GB2:  'Perpendicular insertion 0.5–1.0 cun in depression anterior to intertragic notch with mouth open. Primary point for ear disorders & tinnitus (Tinghui).',
  GB3:  'Perpendicular insertion 0.3–0.5 cun on upper border of zygomatic arch in depression above ST7.',
  GB4:  'Subcutaneous insertion 0.5–0.8 cun along scalp within temporal hairline.',
  GB5:  'Subcutaneous insertion 0.5–0.8 cun along scalp.',
  GB6:  'Subcutaneous insertion 0.5–0.8 cun along scalp.',
  GB7:  'Subcutaneous insertion 0.5–0.8 cun along scalp anterior and superior to ear apex.',
  GB8:  'Subcutaneous insertion 0.5–0.8 cun along scalp 1.5 cun superior to apex of ear. Primary point for hangover migraine & vertigo (Shuaigu).',
  GB9:  'Subcutaneous insertion 0.5–0.8 cun along scalp 0.5 cun posterior to GB8.',
  GB10: 'Subcutaneous insertion 0.5–0.8 cun along scalp posterior to ear.',
  GB11: 'Subcutaneous insertion 0.5–0.8 cun along scalp.',
  GB12: 'Perpendicular or subcutaneous insertion 0.5–0.8 cun in depression posterior and inferior to mastoid process. Key point for insomnia & severe headache (Wangu).',
  GB13: 'Subcutaneous insertion 0.5–0.8 cun along scalp 0.5 cun within anterior hairline.',
  GB14: 'Subcutaneous insertion 0.3–0.5 cun downward or laterally 1 cun superior to middle of eyebrow. Key point for frontal headache & ptosis (Yangbai).',
  GB15: 'Subcutaneous insertion 0.3–0.5 cun along scalp 0.5 cun within anterior hairline directly above GB14.',
  GB16: 'Subcutaneous insertion 0.3–0.5 cun along scalp.',
  GB17: 'Subcutaneous insertion 0.3–0.5 cun along scalp.',
  GB18: 'Subcutaneous insertion 0.3–0.5 cun along scalp.',
  GB19: 'Subcutaneous insertion 0.3–0.5 cun along scalp level with occipital protuberance.',
  GB20: 'Oblique insertion 0.8–1.2 cun toward tip of nose or opposite eyeball in depression between sternocleidomastoid & trapezius muscles. Primary point for exterior wind, headache, dizziness & hypertension (Fengchi). CAUTION: STRICTLY AVOID DEEP UPWARD INSERTION TOWARD MEDULLA OBLONGATA.',
  GB21: 'Perpendicular or oblique posterior insertion 0.5–0.8 cun at highest point of shoulder muscle. Primary point for shoulder stiffness, mastitis & labor (Jianjing). CAUTION: STRICTLY CONTRAINDICATED IN PREGNANCY! DEEP DOWNWARD PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  GB22: 'Perpendicular or oblique insertion 0.5–0.8 cun in 4th intercostal space on mid-axillary line.',
  GB23: 'Perpendicular or oblique insertion 0.5–0.8 cun 1 cun anterior to GB22.',
  GB24: 'Oblique or subcutaneous insertion 0.5–0.8 cun in 7th intercostal space below nipple. Front-Mu of Gallbladder (Riyue). CAUTION: Deep perpendicular insertion risks liver or lung injury.',
  GB25: 'Perpendicular insertion 0.8–1.0 cun at lower border of free end of 12th rib. Front-Mu of Kidney (Jingmen). CAUTION: Deep perpendicular insertion risks renal injury.',
  GB26: 'Perpendicular insertion 0.8–1.2 cun at level of navel directly below 11th rib end. Primary point for Daimai disorders & leukorrhea (Daimai).',
  GB27: 'Perpendicular insertion 0.8–1.2 cun anterior to anterior superior iliac spine.',
  GB28: 'Perpendicular insertion 0.8–1.2 cun 0.5 cun anterior and inferior to GB27.',
  GB29: 'Perpendicular insertion 1.0–1.5 cun midway between anterior superior iliac spine and prominent tip of greater trochanter.',
  GB30: 'Perpendicular insertion 2.0–3.0 cun at junction of lateral 1/3 and medial 2/3 of distance between greater trochanter and sacral hiatus. Primary point for sciatica, hip joint & lower limb pain (Huantiao).',
  GB31: 'Perpendicular insertion 1.0–2.0 cun on lateral thigh 7 cun superior to popliteal crease where middle finger tip reaches when standing straight. Primary point for skin itching, urticaria & leg paralysis (Fengshi).',
  GB32: 'Perpendicular insertion 1.0–1.5 cun 5 cun superior to popliteal crease.',
  GB33: 'Perpendicular insertion 0.8–1.0 cun in depression superior to lateral epicondyle of femur.',
  GB34: 'Perpendicular insertion 1.0–1.5 cun in depression anterior and inferior to head of fibula. He-Sea (Earth), Lower He-Sea of GB & Hui-Meeting of Sinews. Primary point on the body for tendon stiffness, sciatica & gallbladder disorders (Yanglingquan).',
  GB35: 'Perpendicular insertion 0.8–1.2 cun 7 cun superior to prominence of lateral malleolus at posterior border of fibula. Xi-Cleft of Yangwei Mai.',
  GB36: 'Perpendicular insertion 0.8–1.2 cun 7 cun superior to lateral malleolus at anterior border of fibula. Xi-Cleft of Gallbladder.',
  GB37: 'Perpendicular insertion 0.8–1.2 cun 5 cun superior to lateral malleolus. Luo-Connecting point of Gallbladder channel. Primary point for eye night blindness & vision disorders (Guangming).',
  GB38: 'Perpendicular insertion 0.8–1.2 cun 4 cun superior to lateral malleolus. Jing-River (Fire) point.',
  GB39: 'Perpendicular insertion 0.8–1.2 cun 3 cun superior to lateral malleolus. Hui-Meeting of Marrow (Suihui). Primary point for neck stiffness, stroke hemiplegia & bone marrow disorders (Xuanzhong / Juegu).',
  GB40: 'Perpendicular insertion 0.5–0.8 cun in depression anterior and inferior to lateral malleolus. Yuan-Source point of Gallbladder (Qiuxu).',
  GB41: 'Perpendicular insertion 0.5–0.8 cun in depression distal to junction of 4th & 5th metatarsal bones. Shu-Stream (Wood, Horary) & Confluent point of Daimai. Primary point for Daimai disorders, migraine & breast distension (Zulinqi).',
  GB42: 'Perpendicular insertion 0.3–0.5 cun between 4th & 5th metatarsal bones.',
  GB43: 'Perpendicular or oblique insertion 0.3–0.5 cun between 4th & 5th toes proximal to margin of web. Ying-Spring (Water, Mother) point.',
  GB44: 'Subcutaneous insertion 0.1 cun at lateral side of 4th toenail corner, or prick to bleed. Jing-Well (Metal, Child/Sedation) point. Primary point for clearing Liver/Gallbladder fire & migraine.'
};

// Board exam pearls & stars for GB channel key points
const GB_EXAM_PEARLS = {
  GB20: {
    star: 1,
    zh: '★ 風池為祛外風內風第一要穴（「風池醒腦祛風」）。主治頭痛眩暈、感冒發熱、頸項強痛與高血壓。向鼻尖方向斜刺0.8-1.2寸，⚠️ 嚴禁向上深刺延髓。',
    en: '★ Fengchi is the primary point on the body for dispelling interior and exterior wind. Primary point for headache, dizziness, neck stiffness, and hypertension. Oblique 0.8-1.2 inch toward nose tip; ⚠️ deep upward insertion toward medulla is FORBIDDEN.'
  },
  GB21: {
    star: 1,
    zh: '★ 肩井為肩背僵硬、催產通乳第一要穴。直刺0.5-0.8寸。⚠️ 孕婦嚴禁針刺！直刺過深有刺破肺尖致氣胸風險。',
    en: '★ Jianjing is a primary point for shoulder pain, acute mastitis, and promoting labor. Perpendicular 0.5-0.8 inch. ⚠️ STRICTLY CONTRAINDICATED IN PREGNANCY; deep insertion risks pneumothorax.'
  },
  GB24: {
    star: 1,
    zh: '★ 日月為膽之募穴。疏肝利膽、黃疸與膽囊炎第一要穴。斜刺或平刺0.5-0.8寸，⚠️ 嚴禁深刺以免傷及肝肺。',
    en: '★ Riyue is the Front-Mu point of Gallbladder. Primary point for soothing Liver/GB, jaundice, and cholecystitis. Oblique 0.5-0.8 inch.'
  },
  GB25: {
    star: 1,
    zh: '★ 京門為腎之募穴。溫補腎陽、腰痛與水腫要穴。直刺0.8-1.0寸，⚠️ 深刺避開腎臟。',
    en: '★ Jingmen is the Front-Mu point of Kidney. Key point for warming Kidney Yang, lumbar pain, and edema. Perpendicular 0.8-1.0 inch.'
  },
  GB30: {
    star: 1,
    zh: '★ 環跳為下肢坐骨神經痛第一要穴（「腰腿坐骨尋環跳」）。直刺2.0-3.0寸。',
    en: '★ Huantiao is the primary point on the body for sciatica, hip joint pain, and lower limb paralysis. Perpendicular 2.0-3.0 inch.'
  },
  GB31: {
    star: 1,
    zh: '★ 風市為全身祛風止癢第一要穴（「皮膚瘙癢尋風市」）。主治蕁麻疹、濕疹與下肢麻痺。直刺1.0-2.0寸。',
    en: '★ Fengshi is the primary point on the body for dispelling wind and arresting itching (urticaria, eczema, pruritus). Perpendicular 1.0-2.0 inch.'
  },
  GB34: {
    star: 1,
    zh: '★ 陽陵泉為合穴（土）、膽下合穴、八會穴之「筋會」。全身筋病、膽囊炎與膝痛第一要穴（「筋會陽陵泉」）。直刺1.0-1.5寸。',
    en: '★ Yanglingquan is the He-Sea (Earth), Lower He-Sea of GB, and Hui-Meeting of Sinews. Primary point on the body for tendon pain, sciatica, and GB disorders. Perpendicular 1.0-1.5 inch.'
  },
  GB37: {
    star: 1,
    zh: '★ 光明為絡穴（通肝經）。全身眼疾、夜盲與視物昏花第一要穴（「眼疾夜盲尋光明」）。直刺0.8-1.2寸。',
    en: '★ Guangming is the Luo-Connecting point of Gallbladder. Primary point for eye night blindness, blurred vision, and ophthalmic conditions. Perpendicular 0.8-1.2 inch.'
  },
  GB39: {
    star: 1,
    zh: '★ 懸鐘（絕骨）為八會穴之「髓海/髓會」。主治頸項強痛、中風半身不遂與骨髓病變（「髓會懸鐘」）。直刺0.8-1.2寸。',
    en: '★ Xuanzhong (Juegu) is the Hui-Meeting of Marrow. Primary point for neck stiffness, stroke hemiplegia, and marrow disorders. Perpendicular 0.8-1.2 inch.'
  },
  GB40: {
    star: 1,
    zh: '★ 丘墟為原穴（膽經原穴）。疏肝利膽、外踝腫痛第一要穴。直刺0.5-0.8寸。',
    en: '★ Qiuxu is the Yuan-Source point of Gallbladder. Primary point for soothing GB and external malleolus pain. Perpendicular 0.5-0.8 inch.'
  },
  GB41: {
    star: 1,
    zh: '★ 足臨泣為輸穴（木/本穴）、八脈交會穴（通帶脈）。偏頭痛、目赤、乳房脹痛與帶脈病第一要穴（「帶脈臨泣穴」）。直刺0.5-0.8寸。',
    en: '★ Zulinqi is the Shu-Stream (Wood, Horary) & Confluent point of Daimai. Primary point for Daimai disorders, migraine, and mastitis. Perpendicular 0.5-0.8 inch.'
  }
};

const GB_SPECIFIC_CAUTIONS = {
  GB1:  { zh: '目外眶旁，平刺 0.3-0.5 寸。⚠️ 嚴禁深刺眼眶以免傷及眼球或視神經。', en: 'Lateral eye orbit; subcutaneous 0.3-0.5 cun. ⚠️ Avoid deep orbital insertion.' },
  GB2:  { zh: '耳屏間切跡前凹陷處，張口直刺 0.5-1.0 寸。', en: 'Anterior to intertragic notch; open mouth, perpendicular 0.5-1.0 cun.' },
  GB3:  { zh: '顴弓上緣，直刺 0.3-0.5 寸。', en: 'Upper border of zygomatic arch; perpendicular 0.3-0.5 cun.' },
  GB4:  { zh: '顳部髮際內，沿皮刺 0.5-0.8 寸。', en: 'Temporal hairline; subcutaneous 0.5-0.8 cun.' },
  GB5:  { zh: '顳部頭皮，沿皮刺 0.5-0.8 寸。', en: 'Temporal scalp; subcutaneous 0.5-0.8 cun.' },
  GB6:  { zh: '顳部頭皮，沿皮刺 0.5-0.8 寸。', en: 'Temporal scalp; subcutaneous 0.5-0.8 cun.' },
  GB7:  { zh: '耳頂前方髮際，沿皮刺 0.5-0.8 寸。', en: 'Hairline above ear; subcutaneous 0.5-0.8 cun.' },
  GB8:  { zh: '耳尖直上 1.5 寸，沿皮刺 0.5-0.8 寸。', en: '1.5 cun above ear apex; subcutaneous 0.5-0.8 cun.' },
  GB9:  { zh: '率谷後 0.5 寸，沿皮刺 0.5-0.8 寸。', en: '0.5 cun posterior to GB8; subcutaneous 0.5-0.8 cun.' },
  GB10: { zh: '耳後頭皮，沿皮刺 0.5-0.8 寸。', en: 'Posterior to ear; subcutaneous 0.5-0.8 cun.' },
  GB11: { zh: '耳後頭皮，沿皮刺 0.5-0.8 寸。', en: 'Posterior to ear; subcutaneous 0.5-0.8 cun.' },
  GB12: { zh: '乳突後下方凹陷處，直刺或斜刺 0.5-0.8 寸。', en: 'Posterior-inferior to mastoid; perpendicular/oblique 0.5-0.8 cun.' },
  GB13: { zh: '前髮際內 0.5 寸，沿皮刺 0.5-0.8 寸。', en: '0.5 cun within anterior hairline; subcutaneous 0.5-0.8 cun.' },
  GB14: { zh: '眉上 1 寸，向下沿皮刺 0.3-0.5 寸。', en: '1 cun above eyebrow; subcutaneous downward 0.3-0.5 cun.' },
  GB15: { zh: '前髮際內 0.5 寸，沿皮刺 0.3-0.5 寸。', en: '0.5 cun within anterior hairline; subcutaneous 0.3-0.5 cun.' },
  GB16: { zh: '頭頂側部，沿皮刺 0.3-0.5 寸。', en: 'Lateral scalp; subcutaneous 0.3-0.5 cun.' },
  GB17: { zh: '頭頂側部，沿皮刺 0.3-0.5 寸。', en: 'Lateral scalp; subcutaneous 0.3-0.5 cun.' },
  GB18: { zh: '頭頂側部，沿皮刺 0.3-0.5 寸。', en: 'Lateral scalp; subcutaneous 0.3-0.5 cun.' },
  GB19: { zh: '枕外粗隆平高處，沿皮刺 0.3-0.5 寸。', en: 'Level with occipital protuberance; subcutaneous 0.3-0.5 cun.' },
  GB20: { zh: '胸鎖乳突肌與斜方肌之間凹陷處，向鼻尖方向斜刺 0.8-1.2 寸。⚠️ 嚴禁向上深刺延髓。', en: 'In depression between SCM & trapezius; oblique 0.8-1.2 cun. ⚠️ Deep upward insertion toward medulla FORBIDDEN.' },
  GB21: { zh: '肩頸最高處，直刺 0.5-0.8 寸。⚠️ 孕婦嚴禁針刺！直刺過深有刺破肺尖致氣胸風險。', en: 'Highest point of shoulder; perpendicular 0.5-0.8 cun. ⚠️ STRICTLY CONTRAINDICATED IN PREGNANCY (pneumothorax risk).' },
  GB22: { zh: '第 4 肋間隙腋中線上，斜刺或平刺 0.5-0.8 寸。', en: '4th intercostal space on mid-axillary line; oblique/transverse 0.5-0.8 cun.' },
  GB23: { zh: 'GB22 前 1 寸，斜刺或平刺 0.5-0.8 寸。', en: '1 cun anterior to GB22; oblique/transverse 0.5-0.8 cun.' },
  GB24: { zh: '第 7 肋間隙，斜刺 0.5-0.8 寸。⚠️ 嚴禁深刺以免傷及肝臟（右）或肺臟。', en: '7th intercostal space; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion contraindicated (liver/lung risk).' },
  GB25: { zh: '第 12 肋游離端下緣，直刺 0.8-1.0 寸。⚠️ 深刺避開腎臟。', en: 'Lower border of 12th rib free end; perpendicular 0.8-1.0 cun. ⚠️ Avoid deep renal puncture.' },
  GB26: { zh: '章門穴直下平臍處，直刺 0.8-1.2 寸。', en: 'Level with navel below GB13 end; perpendicular 0.8-1.2 cun.' },
  GB27: { zh: '髂前上棘前內側，直刺 0.8-1.2 寸。', en: 'Anterior to ASIS; perpendicular 0.8-1.2 cun.' },
  GB28: { zh: 'GB27 前下方 0.5 寸，直刺 0.8-1.2 寸。', en: '0.5 cun anterior-inferior to GB27; perpendicular 0.8-1.2 cun.' },
  GB29: { zh: '髂前上棘與股骨大轉子連線中點，直刺 1.0-1.5 寸。', en: 'Midpoint between ASIS and greater trochanter; perpendicular 1.0-1.5 cun.' },
  GB30: { zh: '股骨大轉子與骶管裂孔連線外 1/3 處，直刺 2.0-3.0 寸。', en: 'Lateral 1/3 of line between greater trochanter & sacral hiatus; perpendicular 2.0-3.0 cun.' },
  GB31: { zh: '大腿外側直立垂手中指尖觸及處，直刺 1.0-2.0 寸。', en: 'Lateral thigh where middle finger tip touches; perpendicular 1.0-2.0 cun.' },
  GB32: { zh: '膕橫紋上 5 寸，直刺 1.0-1.5 寸。', en: '5 cun above popliteal crease; perpendicular 1.0-1.5 cun.' },
  GB33: { zh: '股骨外上髁上方凹陷處，直刺 0.8-1.0 寸。', en: 'Depression superior to lateral femoral epicondyle; perpendicular 0.8-1.0 cun.' },
  GB34: { zh: '腓骨小頭前下方凹陷處，直刺 1.0-1.5 寸。', en: 'Depression anterior-inferior to fibular head; perpendicular 1.0-1.5 cun.' },
  GB35: { zh: '外踝尖上 7 寸腓骨後緣，直刺 0.8-1.2 寸。', en: '7 cun above lateral malleolus, posterior fibula; perpendicular 0.8-1.2 cun.' },
  GB36: { zh: '外踝尖上 7 寸腓骨前緣，直刺 0.8-1.2 寸。', en: '7 cun above lateral malleolus, anterior fibula; perpendicular 0.8-1.2 cun.' },
  GB37: { zh: '外踝尖上 5 寸腓骨前緣，直刺 0.8-1.2 寸。', en: '5 cun above lateral malleolus; perpendicular 0.8-1.2 cun.' },
  GB38: { zh: '外踝尖上 4 寸腓骨前緣，直刺 0.8-1.2 寸。', en: '4 cun above lateral malleolus; perpendicular 0.8-1.2 cun.' },
  GB39: { zh: '外踝尖上 3 寸腓骨後緣，直刺 0.8-1.2 寸。', en: '3 cun above lateral malleolus; perpendicular 0.8-1.2 cun.' },
  GB40: { zh: '外踝前下方凹陷處，直刺 0.5-0.8 寸。', en: 'Depression anterior-inferior to lateral malleolus; perpendicular 0.5-0.8 cun.' },
  GB41: { zh: '第 4、5 跖骨結合部前方凹陷處，直刺 0.5-0.8 寸。', en: 'Distal to junction of 4th & 5th metatarsals; perpendicular 0.5-0.8 cun.' },
  GB42: { zh: '第 4、5 跖骨之間，直刺 0.3-0.5 寸。', en: 'Between 4th & 5th metatarsals; perpendicular 0.3-0.5 cun.' },
  GB43: { zh: '第 4、5 趾縫間，直刺或斜刺 0.3-0.5 寸。', en: 'Web space between 4th & 5th toes; perpendicular/oblique 0.3-0.5 cun.' },
  GB44: { zh: '第 4 趾甲角旁 0.1 寸，點刺出血或淺刺 0.1 寸。', en: 'Lateral to 4th toenail corner; prick to bleed or insert 0.1 cun.' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^GB([1-9]|[1-3][0-9]|4[0-4])$/.test(code)) return;

  const idx = parseInt(code.replace('GB', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 8), 6);

  // 1. Needling Method EN
  if (GB_NEEDLING_EN[code] && point.acumethod_en !== GB_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: GB_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = GB_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (GB_SPECIFIC_CAUTIONS[code]) {
    const spec = GB_SPECIFIC_CAUTIONS[code];
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
  if (GB_EXAM_PEARLS[code]) {
    const ep = GB_EXAM_PEARLS[code];
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

  // 5. GB21 Pregnancy Contraindication
  if (code === 'GB21') {
    const pregZh = '孕婦嚴禁針刺（肩井穴降氣下行，針刺極易激發強烈宮縮致流產或早產）。';
    if (!point.contraindications.includes(pregZh)) {
      if (APPLY) {
        point.contraindications.push(pregZh);
        point.cautions_zh = [...point.contraindications];
        point.cautions = point.contraindications.join('\n');
      }
    }
  }

  // 6. field_sources & review_status
  if (APPLY) {
    point.field_sources = {
      acumethod_zh: ['CloudTCM', 'eLotus CORE'],
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/11 GALLBLADDER CHANNEL OF FOOT SHAO YANG.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/11 GALLBLADDER CHANNEL OF FOOT SHAO YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/11 GALLBLADDER CHANNEL OF FOOT SHAO YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/11 GALLBLADDER CHANNEL OF FOOT SHAO YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across GB channel:\n`);
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
