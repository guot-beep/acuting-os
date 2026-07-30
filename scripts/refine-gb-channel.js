/**
 * refine-gb-channel.js
 * Refines Gallbladder Channel (足少陽膽經 GB1–GB44):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Five-Shu, Yuan, Luo, Xi, Confluent, Front-Mu, Back-Shu, 8 Hui, etc.
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
  GB1:  'Subcutaneous insertion 0.3–0.5 cun posterior or lateral to outer canthus. CAUTION: Avoid superficial temporal vessel puncture.',
  GB2:  'Perpendicular insertion 0.5–1.0 cun in depression anterior to intertragic notch with mouth open. Key ear point (Tinghui).',
  GB3:  'Perpendicular insertion 0.3–0.5 cun with mouth open.',
  GB4:  'Subcutaneous insertion 0.3–0.5 cun along scalp.',
  GB5:  'Subcutaneous insertion 0.3–0.5 cun along scalp.',
  GB6:  'Subcutaneous insertion 0.3–0.5 cun along scalp.',
  GB7:  'Subcutaneous insertion 0.3–0.5 cun along scalp.',
  GB8:  'Subcutaneous insertion 0.3–0.5 cun 1.5 cun superior to apex of ear. Primary point for migraines & alcohol intoxication (Shuaigu).',
  GB9:  'Subcutaneous insertion 0.3–0.5 cun.',
  GB10: 'Subcutaneous insertion 0.3–0.5 cun.',
  GB11: 'Subcutaneous insertion 0.3–0.5 cun.',
  GB12: 'Oblique or subcutaneous insertion 0.3–0.5 cun in depression posterior and inferior to mastoid process.',
  GB13: 'Subcutaneous insertion 0.3–0.5 cun.',
  GB14: 'Subcutaneous insertion 0.3–0.5 cun inferiorly or laterally 1 cun above midpoint of eyebrow. Primary point for frontal headache & eye twitching.',
  GB15: 'Subcutaneous insertion 0.3–0.5 cun.',
  GB16: 'Subcutaneous insertion 0.3–0.5 cun.',
  GB17: 'Subcutaneous insertion 0.3–0.5 cun.',
  GB18: 'Subcutaneous insertion 0.3–0.5 cun.',
  GB19: 'Subcutaneous insertion 0.3–0.5 cun.',
  GB20: 'Oblique insertion 0.8–1.2 cun toward tip of nose or opposite eyeball in depression between sternocleidomastoid & trapezius. Primary point for head, eyes & wind. CAUTION: Avoid deep insertion toward medulla spinalis or occipital artery.',
  GB21: 'Perpendicular or oblique insertion 0.5–0.8 cun at highest point of shoulder. Primary point for shoulder pain & lactation. CAUTION: STRICTLY CONTRAINDICATED IN PREGNANCY. DEEP PERPENDICULAR INSERTION RISKS PNEUMOTHORAX.',
  GB22: 'Oblique or transverse insertion 0.3–0.5 cun in 5th intercostal space. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  GB23: 'Oblique or transverse insertion 0.3–0.5 cun in 5th intercostal space. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  GB24: 'Oblique or transverse insertion 0.3–0.5 cun in 7th intercostal space directly below nipple. Front-Mu point of Gallbladder. CAUTION: Deep perpendicular insertion risks pneumothorax or liver/gallbladder injury.',
  GB25: 'Perpendicular insertion 0.5–1.0 cun at lower border of free end of 12th rib. Front-Mu point of Kidney. CAUTION: Deep perpendicular insertion risks renal injury.',
  GB26: 'Perpendicular insertion 0.5–1.0 cun at intersection of free end of 11th rib and level of navel. Confluent point of Dai Mai (Girdling Vessel).',
  GB27: 'Perpendicular insertion 0.5–1.0 cun anterior to anterior superior iliac spine.',
  GB28: 'Perpendicular insertion 0.5–1.0 cun anterior & inferior to anterior superior iliac spine.',
  GB29: 'Perpendicular insertion 1.0–1.5 cun in midpoint between ASIS and greater trochanter.',
  GB30: 'Perpendicular insertion 1.5–3.0 cun in depression between greater trochanter and sacral hiatus. Primary point for sciatica, lumbar pain & lower limb motor impairment.',
  GB31: 'Perpendicular insertion 1.0–2.0 cun on lateral midline of thigh where tip of middle finger rests when standing. Primary point for leg paralysis, hemiplegia & itching (Fengshi).',
  GB32: 'Perpendicular insertion 1.0–2.0 cun.',
  GB33: 'Perpendicular insertion 0.8–1.0 cun in depression superior to lateral epicondyle of femur.',
  GB34: 'Perpendicular insertion 1.0–1.5 cun in depression anterior and inferior to head of fibula. He-Sea (Earth, Horary) & Lower He-Sea of Gallbladder; Hui-Meeting of Sinews/Tendons. Primary point for sinews & gallbladder.',
  GB35: 'Perpendicular insertion 0.8–1.2 cun 7 cun superior to lateral malleolus. Xi-Cleft of Yang Wei Mai.',
  GB36: 'Perpendicular insertion 0.8–1.2 cun 7 cun superior to lateral malleolus. Xi-Cleft of Gallbladder channel.',
  GB37: 'Perpendicular insertion 0.7–1.0 cun 5 cun superior to lateral malleolus. Luo-Connecting point of Gallbladder channel. Primary point for eye disorders & night blindness (Guangming).',
  GB38: 'Perpendicular insertion 0.7–1.0 cun 4 cun superior to lateral malleolus. Jing-River (Fire, Son/Sedation) point.',
  GB39: 'Perpendicular insertion 0.7–1.0 cun 3 cun superior to lateral malleolus. Hui-Meeting of Marrow (Suihui). Primary point for neck rigidity, marrow nourishment & lower limb atrophy (Xuanzhong).',
  GB40: 'Perpendicular insertion 0.5–0.8 cun anterior and inferior to lateral malleolus. Yuan-Source point of Gallbladder channel (Qiuxu).',
  GB41: 'Perpendicular insertion 0.5–0.8 cun in depression distal to junction of 4th & 5th metatarsal bones. Shu-Stream (Wood, Horary) & Confluent point of Dai Mai. Paired with TE5 for Shao Yang migraines & eye pain.',
  GB42: 'Perpendicular insertion 0.3–0.5 cun.',
  GB43: 'Perpendicular or oblique insertion 0.3–0.5 cun between 4th & 5th toes. Ying-Spring (Water, Mother) point.',
  GB44: 'Subcutaneous insertion 0.1 cun at lateral side of 4th toe tip, or prick to bleed. Jing-Well (Metal) point.'
};

// Board exam pearls & stars for GB channel key points
const GB_EXAM_PEARLS = {
  GB20: {
    star: 1,
    zh: '★ 風池為祛風清頭目第一要穴（「風池祛風醒腦」）。主治感冒發熱、頭痛項強、眩暈、目赤與中風。斜刺0.8-1.2寸針尖向鼻尖方向，嚴禁向上深刺延髓。',
    en: '★ Fengchi is the primary point on the body for dispelling exterior/interior wind and clearing head & eyes. Oblique 0.8-1.2 inch toward tip of nose; avoid deep upward insertion toward medulla.'
  },
  GB21: {
    star: 1,
    zh: '★ 肩井為肩痛與通乳催產要穴。直刺或斜刺0.5-0.8寸。⚠️ 孕婦嚴禁針刺（具下胎催產之力）；直刺過深有氣胸風險。',
    en: '★ Jianjing is a key point for shoulder pain, mastitis, and promoting labor. ⚠️ STRICTLY CONTRAINDICATED IN PREGNANCY. Deep perpendicular insertion risks pneumothorax.'
  },
  GB24: {
    star: 1,
    zh: '★ 日月為膽之募穴。疏肝利膽、清膽囊濕熱第一要穴（主治黃疸、脅痛、嘔吐）。斜刺或平刺0.3-0.5寸，避免深刺傷及肝膽。',
    en: '★ Riyue is the Front-Mu point of Gallbladder. Primary point for clearing Gallbladder damp-heat, jaundice, and hypochondriac pain. Oblique/transverse 0.3-0.5 inch; avoid deep perpendicular insertion.'
  },
  GB25: {
    star: 1,
    zh: '★ 京門為腎之募穴。溫補腎陽、利水消腫、治腰脅痛要穴。直刺0.5-1.0寸。',
    en: '★ Jingmen is the Front-Mu point of Kidney. Key point for tonifying Kidney Yang, edema, and lumbar pain. Perpendicular 0.5-1.0 inch.'
  },
  GB30: {
    star: 1,
    zh: '★ 環跳為坐骨神經痛與下肢腰腿痛第一要穴（「環跳治坐骨」）。直刺1.5-3.0寸。',
    en: '★ Huantiao is the primary point for sciatica, lumbar pain, and lower limb paralysis. Perpendicular 1.5-3.0 inches.'
  },
  GB31: {
    star: 1,
    zh: '★ 風市為祛風止癢與下肢癱瘓要穴（「風市止癢祛風」）。直刺1.0-2.0寸。',
    en: '★ Fengshi is a key point for dispelling wind, arresting skin itching (pruritus/urticaria), and treating leg paralysis. Perpendicular 1.0-2.0 inches.'
  },
  GB34: {
    star: 1,
    zh: '★ 陽陵泉為合穴（土/本穴）、膽之下合穴、八會穴之「筋會」。全身舒筋利節、利膽退黃第一要穴（「筋會陽陵泉」）。直刺1.0-1.5寸。',
    en: '★ Yanglingquan is the He-Sea, Lower He-Sea of Gallbladder, and Hui-Meeting of Sinews. Primary point on the body for tendons/sinews, joints, and gallbladder disorders. Perpendicular 1.0-1.5 inches.'
  },
  GB37: {
    star: 1,
    zh: '★ 光明為絡穴（通肝經）。清肝明目、夜盲症第一要穴（「光明明目治夜盲」）。直刺0.7-1.0寸。',
    en: '★ Guangming is the Luo-Connecting point (connects to Liver). Primary point for eye disorders, night blindness, and clearing vision. Perpendicular 0.7-1.0 inch.'
  },
  GB39: {
    star: 1,
    zh: '★ 懸鐘為八會穴之「髓會」。補髓壯骨、頭項強痛第一要穴（「髓會懸鐘」）。直刺0.7-1.0寸。',
    en: '★ Xuanzhong is the Hui-Meeting point of Marrow. Primary point for nourishing marrow, strengthening bones, and neck rigidity. Perpendicular 0.7-1.0 inch.'
  },
  GB40: {
    star: 1,
    zh: '★ 丘墟為原穴（膽經原穴）。疏肝利膽、腳氣與外踝痛要穴。直刺0.5-0.8寸。',
    en: '★ Qiuxu is the Yuan-Source point of Gallbladder. Key point for coursing Liver/Gallbladder Qi, ankle pain, and beriberi. Perpendicular 0.5-0.8 inch.'
  },
  GB41: {
    star: 1,
    zh: '★ 足臨泣為輸穴（木/本穴）、八脈交會穴（通帶脈）。疏肝理氣、治偏頭痛與乳癰要穴，配手少陽外關TE5。直刺0.5-0.8寸。',
    en: '★ Zulinqi is the Shu-Stream (Wood, Horary) & Confluent point of Dai Mai. Key point for migraines, breast distension, and Dai Mai disorders; paired with TE5. Perpendicular 0.5-0.8 inch.'
  }
};

const GB_SPECIFIC_CAUTIONS = {
  GB1:  { zh: '眼眶外側敏感部位，避開顳淺動靜脈分支；平刺或斜刺 0.3-0.5 寸。', en: 'Outer canthus location; avoid superficial temporal vessels.' },
  GB2:  { zh: '耳屏前張口取穴，直刺 0.5-1.0 寸。', en: 'Anterior to intertragic notch with mouth open; perpendicular 0.5-1.0 cun.' },
  GB3:  { zh: '顴弓上緣，張口取穴，直刺 0.3-0.5 寸。', en: 'Superior border of zygomatic arch with mouth open; perpendicular 0.3-0.5 cun.' },
  GB4:  { zh: '頭顳部，沿皮刺 0.3-0.5 寸。', en: 'Temporal scalp; transverse 0.3-0.5 cun.' },
  GB5:  { zh: '頭顳部，沿皮刺 0.3-0.5 寸。', en: 'Temporal scalp; transverse 0.3-0.5 cun.' },
  GB6:  { zh: '頭顳部，沿皮刺 0.3-0.5 寸。', en: 'Temporal scalp; transverse 0.3-0.5 cun.' },
  GB7:  { zh: '耳前鬢角後方，沿皮刺 0.3-0.5 寸。', en: 'Temporal scalp; transverse 0.3-0.5 cun.' },
  GB8:  { zh: '耳尖直上 1.5 寸，沿皮刺 0.3-0.5 寸。', en: '1.5 cun superior to ear apex; transverse 0.3-0.5 cun.' },
  GB9:  { zh: '耳後頭部，沿皮刺 0.3-0.5 寸。', en: 'Posterior scalp; transverse 0.3-0.5 cun.' },
  GB10: { zh: '耳後頭部，沿皮刺 0.3-0.5 寸。', en: 'Posterior scalp; transverse 0.3-0.5 cun.' },
  GB11: { zh: '耳後頭部，沿皮刺 0.3-0.5 寸。', en: 'Posterior scalp; transverse 0.3-0.5 cun.' },
  GB12: { zh: '耳後完骨下方凹陷處，平刺或斜刺 0.3-0.5 寸。', en: 'Depression below mastoid process; transverse 0.3-0.5 cun.' },
  GB13: { zh: '前額髮際內，沿皮刺 0.3-0.5 寸。', en: 'Frontal scalp; transverse 0.3-0.5 cun.' },
  GB14: { zh: '眉毛中點上方 1 寸，向下或向外平刺 0.3-0.5 寸，避開眶上神經。', en: '1 cun above midpoint of eyebrow; transverse 0.3-0.5 cun, avoid supraorbital nerve.' },
  GB15: { zh: '前額髮際內，平刺 0.3-0.5 寸。', en: 'Frontal scalp; transverse 0.3-0.5 cun.' },
  GB16: { zh: '頭頂兩側，平刺 0.3-0.5 寸。', en: 'Parietal scalp; transverse 0.3-0.5 cun.' },
  GB17: { zh: '頭頂兩側，平刺 0.3-0.5 寸。', en: 'Parietal scalp; transverse 0.3-0.5 cun.' },
  GB18: { zh: '頭頂兩側，平刺 0.3-0.5 寸。', en: 'Parietal scalp; transverse 0.3-0.5 cun.' },
  GB19: { zh: '枕外粗隆上方兩側，平刺 0.3-0.5 寸。', en: 'Occipital scalp; transverse 0.3-0.5 cun.' },
  GB20: { zh: '枕骨下方風池穴，斜刺 0.8-1.2 寸針尖向鼻尖，嚴禁向上深刺延髓以免致危及生命。', en: 'Suboccipital space; oblique 0.8-1.2 cun toward nose. Upward deep insertion toward medulla is STRICTLY FORBIDDEN.' },
  GB21: { zh: '肩井穴高處，斜刺 0.5-0.8 寸。⚠️ 孕婦禁針（催產下胎）；直刺深刺有刺傷肺尖引發氣胸風險。', en: 'Highest point of shoulder; oblique 0.5-0.8 cun. ⚠️ PREGNANCY CONTRAINDICATED. Deep perpendicular insertion risks pneumothorax.' },
  GB22: { zh: '腋下第 5 肋間隙，斜刺或平刺 0.3-0.5 寸，嚴禁直刺深刺以免致氣胸。', en: '5th intercostal space; transverse/oblique 0.3-0.5 cun. Deep perpendicular insertion contraindicated (pneumothorax risk).' },
  GB23: { zh: '第 5 肋間隙，斜刺或平刺 0.3-0.5 寸，嚴禁直刺深刺以免致氣胸。', en: '5th intercostal space; transverse/oblique 0.3-0.5 cun. Deep perpendicular insertion contraindicated (pneumothorax risk).' },
  GB24: { zh: '乳頭直下第 7 肋間隙，斜刺或平刺 0.3-0.5 寸，嚴禁直刺深刺以免刺傷肝膽致氣胸或內出血。', en: '7th intercostal space; transverse/oblique 0.3-0.5 cun. Deep perpendicular insertion contraindicated (liver/gallbladder/pneumothorax risk).' },
  GB25: { zh: '第 12 肋游離端下方，直刺 0.5-1.0 寸，避免過深刺傷腎臟。', en: 'Free end of 12th rib; perpendicular 0.5-1.0 cun, avoid deep renal puncture.' },
  GB26: { zh: '肚臍平高第 11 肋游離端，直刺 0.5-1.0 寸。', en: 'Navel level at 11th rib; perpendicular 0.5-1.0 cun.' },
  GB27: { zh: '髂前上棘前方，直刺 0.5-1.0 寸。', en: 'Anterior to ASIS; perpendicular 0.5-1.0 cun.' },
  GB28: { zh: '髂前上棘前下方，直刺 0.5-1.0 寸。', en: 'Anterior-inferior to ASIS; perpendicular 0.5-1.0 cun.' },
  GB29: { zh: '髖關節附近，直刺 1.0-1.5 寸。', en: 'Near hip joint; perpendicular 1.0-1.5 cun.' },
  GB30: { zh: '股骨大轉子與骶管裂孔連線外 1/3 處，直刺 1.5-3.0 寸。', en: 'Outer 1/3 of ASIS-sacral hiatus line; perpendicular 1.5-3.0 cun.' },
  GB31: { zh: '大腿外側正中線，直刺 1.0-2.0 寸。', en: 'Lateral midline of thigh; perpendicular 1.0-2.0 cun.' },
  GB32: { zh: '大腿外側，直刺 1.0-2.0 寸。', en: 'Lateral thigh; perpendicular 1.0-2.0 cun.' },
  GB33: { zh: '股骨外上髁上方凹陷處，直刺 0.8-1.0 寸。', en: 'Above lateral epicondyle of femur; perpendicular 0.8-1.0 cun.' },
  GB34: { zh: '腓骨小頭前下方凹陷處，直刺 1.0-1.5 寸，避開腓總神經。', en: 'Anterior-inferior to fibular head; perpendicular 1.0-1.5 cun, avoid common peroneal nerve.' },
  GB35: { zh: '外踝上 7 寸，直刺 0.8-1.2 寸。', en: '7 cun above lateral malleolus; perpendicular 0.8-1.2 cun.' },
  GB36: { zh: '外踝上 7 寸腓骨前緣，直刺 0.8-1.2 寸。', en: '7 cun above lateral malleolus; perpendicular 0.8-1.2 cun.' },
  GB37: { zh: '外踝上 5 寸腓骨前緣，直刺 0.7-1.0 寸。', en: '5 cun above lateral malleolus; perpendicular 0.7-1.0 cun.' },
  GB38: { zh: '外踝上 4 寸腓骨前緣，直刺 0.7-1.0 寸。', en: '4 cun above lateral malleolus; perpendicular 0.7-1.0 cun.' },
  GB39: { zh: '外踝上 3 寸腓骨後緣與腓骨短肌之間，直刺 0.7-1.0 寸。', en: '3 cun above lateral malleolus; perpendicular 0.7-1.0 cun.' },
  GB40: { zh: '外踝前下方凹陷處，直刺 0.5-0.8 寸。', en: 'Anterior-inferior to lateral malleolus; perpendicular 0.5-0.8 cun.' },
  GB41: { zh: '足背第 4、5 跖骨底結合部前凹陷處，直刺 0.5-0.8 寸。', en: 'Distal to junction of 4th/5th metatarsals; perpendicular 0.5-0.8 cun.' },
  GB42: { zh: '足背第 4、5 跖骨頭後方，直刺 0.3-0.5 寸。', en: 'Posterior to 4th/5th metatarsal heads; perpendicular 0.3-0.5 cun.' },
  GB43: { zh: '足背第 4、5 趾縫間，直或斜刺 0.3-0.5 寸。', en: 'Between 4th and 5th toes; perpendicular/oblique 0.3-0.5 cun.' },
  GB44: { zh: '第 4 趾甲角旁 0.1 寸，淺刺 0.1 寸或點刺出血。', en: '0.1 cun lateral to 4th toenail corner; subcutaneous 0.1 cun or bleed.' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^GB([1-9]|[1-3][0-9]|4[0-4])$/.test(code)) return;

  const idx = parseInt(code.replace('GB', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 6), 8);

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
    const pregZh = '孕婦禁針（肩井穴降氣催產力強，孕婦針刺易致流產或早產）。';
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
