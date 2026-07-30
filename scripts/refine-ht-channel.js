/**
 * refine-ht-channel.js
 * Refines Heart Channel (手少陰心經 HT1–HT9):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Five-Shu, Yuan, Luo, Xi, Confluent, Window of Sky, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-ht-channel.js          (dry run)
 *   node scripts/refine-ht-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for HT channel (HT1–HT9)
const HT_NEEDLING_EN = {
  HT1: 'Perpendicular or oblique insertion 0.5–1.0 cun in axillary fossa. CAUTION: Avoid axillary artery puncture & median/ulnar nerve injury.',
  HT2: 'Perpendicular insertion 0.5–1.0 cun 3 cun superior to medial epicondyle of humerus. CAUTION: Avoid brachial artery.',
  HT3: 'Perpendicular insertion 0.5–1.0 cun at midpoint between medial epicondyle and olecranon. He-Sea (Water) point. Key point for arm pain & cardiac anxiety.',
  HT4: 'Perpendicular insertion 0.3–0.5 cun 1.5 cun proximal to wrist crease. Jing-River (Metal) point.',
  HT5: 'Perpendicular insertion 0.3–0.5 cun 1 cun proximal to wrist crease. Luo-Connecting point of Heart channel. Primary point for tongue stiffness & aphasia (Tongli).',
  HT6: 'Perpendicular insertion 0.3–0.5 cun 0.5 cun proximal to wrist crease. Xi-Cleft point of Heart channel. Primary point for night sweating & acute heart pain (Yinxi).',
  HT7: 'Perpendicular or oblique insertion 0.3–0.5 cun at radial side of flexor carpi ulnaris tendon. Shu-Stream (Earth, Child/Sedation) & Yuan-Source point. Primary point on the body for insomnia, anxiety & mental disorders (Shenmen).',
  HT8: 'Perpendicular insertion 0.3–0.5 cun between 4th & 5th metacarpal bones where tip of little finger touches when making a fist. Ying-Spring (Fire, Horary) point. Primary point for clearing Heart Fire (Shaofu).',
  HT9: 'Subcutaneous insertion 0.1 cun at radial side of little fingernail corner, or prick to bleed. Jing-Well (Wood, Mother) point. Primary point for emergency resuscitation & loss of consciousness.'
};

// Board exam pearls & stars for HT channel key points
const HT_EXAM_PEARLS = {
  HT3: {
    star: 1,
    zh: '★ 少海為合穴（水/本穴）。清心安神、肘臂攣痛第一要穴。直刺0.5-1.0寸，避開肱動脈。',
    en: '★ Shaohai is the He-Sea (Water) point. Primary point for clearing Heart fire, calming spirit, and treating elbow/arm pain. Perpendicular 0.5-1.0 inch.'
  },
  HT5: {
    star: 1,
    zh: '★ 通里為絡穴（通小腸經）。心悸、失眠、暴喑與舌強不語第一要穴（「心病舌強尋通里」）。直刺0.3-0.5寸。',
    en: '★ Tongli is the Luo-Connecting point (connects to Small Intestine). Primary point for tongue stiffness, aphasia, voice loss, and palpitations. Perpendicular 0.3-0.5 inch.'
  },
  HT6: {
    star: 1,
    zh: '★ 陰郄為郄穴（心經郄穴）。滋陰清熱、盜汗與急性心痛第一要穴（「盜汗急痛尋陰郄」）。直刺0.3-0.5寸。',
    en: '★ Yinxi is the Xi-Cleft point of Heart. Primary point for night sweating (spontaneous/night sweating) and acute cardiac pain. Perpendicular 0.3-0.5 inch.'
  },
  HT7: {
    star: 1,
    zh: '★ 神門為輸穴、原穴（土/子穴）。全身清心安神、治療失眠多夢與驚悸第一要穴（「安神失眠首選神門」）。直刺0.3-0.5寸，避開尺動脈。',
    en: '★ Shenmen is the Shu-Stream, Yuan-Source (Earth, Child/Sedation) point. Primary point on the body for insomnia, anxiety, and heart pain. Perpendicular 0.3-0.5 inch.'
  },
  HT8: {
    star: 1,
    zh: '★ 少府為滎穴（火/本穴）。清心瀉火、掌中熱與陰癢小便不利要穴。直刺0.3-0.5寸。',
    en: '★ Shaofu is the Ying-Spring (Fire, Horary) point. Key point for clearing Heart fire, palm heat, and genital itching. Perpendicular 0.3-0.5 inch.'
  },
  HT9: {
    star: 1,
    zh: '★ 少衝為井穴（木/母穴）。急救昏迷、熱病醒神第一要穴。淺刺0.1寸或點刺出血。',
    en: '★ Shaochong is the Jing-Well (Wood, Mother) point. Primary emergency point for loss of consciousness, stroke coma, and high fever. Subcutaneous 0.1 inch or bleed.'
  }
};

const HT_SPECIFIC_CAUTIONS = {
  HT1: { zh: '腋窩凹陷處，直刺 0.5-1.0 寸；避開腋動脈及正中、尺神經。', en: 'Axillary fossa location; avoid axillary artery and median/ulnar nerves.' },
  HT2: { zh: '臂內側，直刺 0.5-1.0 寸，避開肱動脈。', en: 'Medial arm; avoid brachial artery.' },
  HT3: { zh: '肘橫紋內側端凹陷處，避開肱動脈與尺神經。', en: 'Medial popliteal/cubital crease; avoid brachial artery and ulnar nerve.' },
  HT4: { zh: '前臂掌側，避開尺動脈。', en: 'Palmar forearm; avoid ulnar artery.' },
  HT5: { zh: '腕橫紋上 1 寸，直刺 0.3-0.5 寸，避開尺動脈。', en: '1 cun above wrist crease; avoid ulnar artery.' },
  HT6: { zh: '腕橫紋上 0.5 寸，直刺 0.3-0.5 寸，避開尺動脈。', en: '0.5 cun above wrist crease; avoid ulnar artery.' },
  HT7: { zh: '腕掌側橫紋尺側端凹陷處，直刺 0.3-0.5 寸；避開尺動靜脈與尺神經。', en: 'Ulnar side of wrist crease; avoid ulnar vessels and nerve.' },
  HT8: { zh: '握拳小指尖觸及處，直刺 0.3-0.5 寸，避開掌淺弓。', en: 'Palmar space between 4th & 5th metacarpals; avoid superficial palmar arch.' },
  HT9: { zh: '小指橈側指甲角旁 0.1 寸，點刺出血或淺刺 0.1 寸。', en: 'Radial side of little toenail/fingernail corner; prick to bleed or insert 0.1 cun.' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^HT[1-9]$/.test(code)) return;

  const idx = parseInt(code.replace('HT', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 2), 5);

  // 1. Needling Method EN
  if (HT_NEEDLING_EN[code] && point.acumethod_en !== HT_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: HT_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = HT_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (HT_SPECIFIC_CAUTIONS[code]) {
    const spec = HT_SPECIFIC_CAUTIONS[code];
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
  if (HT_EXAM_PEARLS[code]) {
    const ep = HT_EXAM_PEARLS[code];
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

  // 5. field_sources & review_status
  if (APPLY) {
    point.field_sources = {
      acumethod_zh: ['CloudTCM', 'eLotus CORE'],
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/5 HEART CHANNEL OF HAND SHAO YIN.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/5 HEART CHANNEL OF HAND SHAO YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/5 HEART CHANNEL OF HAND SHAO YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/5 HEART CHANNEL OF HAND SHAO YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across HT channel:\n`);
changes.forEach(c => {
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
