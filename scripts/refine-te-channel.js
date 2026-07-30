/**
 * refine-te-channel.js
 * Refines San Jiao Channel (手少陽三焦經 TE1–TE23):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Five-Shu, Yuan, Luo, Xi, Confluent, Window of Sky, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-te-channel.js          (dry run)
 *   node scripts/refine-te-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for TE channel (TE1–TE23)
const TE_NEEDLING_EN = {
  TE1:  'Subcutaneous insertion 0.1 cun at ulnar side of ring finger tip, or prick to bleed. Jing-Well (Metal) point.',
  TE2:  'Oblique insertion 0.3–0.5 cun toward palm. Ying-Spring (Water) point.',
  TE3:  'Perpendicular or oblique insertion 0.5–1.0 cun in depression proximal to 4th & 5th metacarpal heads. Shu-Stream (Wood, Mother) point. Primary point for ear disorders & hand pain.',
  TE4:  'Perpendicular insertion 0.3–0.5 cun in wrist joint depression. Yuan-Source point of San Jiao.',
  TE5:  'Perpendicular insertion 0.5–1.0 cun between radius and ulna, 2 cun proximal to wrist crease. Luo-Connecting & Confluent point of Yang Wei Mai. Paired with GB41 for Shao Yang headache & eye disorders.',
  TE6:  'Perpendicular insertion 0.8–1.0 cun between radius and ulna, 3 cun proximal to wrist crease. Jing-River (Fire, Horary) point. Primary point for constipation & hypochondriac pain (Zhigou).',
  TE7:  'Perpendicular insertion 0.5–1.0 cun on radial border of ulna. Xi-Cleft point of San Jiao channel.',
  TE8:  'Perpendicular insertion 0.5–1.0 cun 4 cun proximal to wrist crease.',
  TE9:  'Perpendicular insertion 0.5–1.0 cun 5 cun distal to olecranon.',
  TE10: 'Perpendicular insertion 0.5–1.0 cun in depression 1 cun superior to olecranon. He-Sea (Earth, Son/Sedation) point. Key point for transforming phlegm & nodules (Tianjing).',
  TE11: 'Perpendicular insertion 0.5–1.0 cun 2 cun superior to olecranon.',
  TE12: 'Perpendicular insertion 0.7–1.0 cun.',
  TE13: 'Perpendicular insertion 0.7–1.0 cun on posterior border of deltoid.',
  TE14: 'Perpendicular or oblique downward insertion 0.8–1.5 cun in depression posterior and inferior to acromion. Key point for shoulder joint periarthritis.',
  TE15: 'Perpendicular insertion 0.5–0.8 cun in midpoint between GB21 and SI13. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  TE16: 'Perpendicular insertion 0.5–0.8 cun posterior to mastoid process. Window of Sky point (Tianyou).',
  TE17: 'Perpendicular insertion 0.5–1.0 cun behind ear lobe in depression between mastoid process and mandible. Primary point for facial paralysis, tinnitus & otitis. CAUTION: Avoid deep anterior direction toward internal carotid/jugular vessels.',
  TE18: 'Subcutaneous insertion 0.1–0.3 cun along curve of ear, or prick to bleed.',
  TE19: 'Subcutaneous insertion 0.1–0.3 cun along curve of ear.',
  TE20: 'Subcutaneous insertion 0.3–0.5 cun directly above ear apex.',
  TE21: 'Perpendicular insertion 0.5–1.0 cun in depression anterior to supra-tragic notch with mouth open. Primary ear point.',
  TE22: 'Subcutaneous insertion 0.3–0.5 cun anterior to ear helix root. CAUTION: Avoid superficial temporal artery.',
  TE23: 'Subcutaneous insertion 0.3–0.5 cun laterally along eyebrow. CAUTION: MOXIBUSTION IS CONTRAINDICATED.'
};

// Board exam pearls & stars for TE channel key points
const TE_EXAM_PEARLS = {
  TE3: {
    star: 1,
    zh: '★ 中渚為輸穴（木/母穴）。耳疾與手背腱鞘痛第一要穴（「耳疾尋中渚」）。直刺0.5-1.0寸。',
    en: '★ Zhongzhu is the Shu-Stream (Wood, Mother) point. Primary distal point for ear disorders (tinnitus, deafness) and hand/wrist pain. Perpendicular 0.5-1.0 inch.'
  },
  TE5: {
    star: 1,
    zh: '★ 外關為絡穴（通心包經）、八脈交會穴（通陽維脈）。解表祛風、清少陽熱第一要穴，配足臨泣GB41治療少陽偏頭痛與目疾。直刺0.5-1.0寸。',
    en: '★ Waiguan is the Luo-Connecting & Confluent point of Yang Wei Mai. Primary point for dispelling exterior wind-heat and Shao Yang fever; paired with GB41 for Shao Yang headaches & eye pain. Perpendicular 0.5-1.0 inch.'
  },
  TE6: {
    star: 1,
    zh: '★ 支溝為經穴（火/本穴）。通便清熱、脅肋痛第一要穴（「脅痛便秘尋支溝」），配合谷LI4/照海KI6治療習慣性便秘。直刺0.8-1.0寸。',
    en: '★ Zhigou is the Jing-River (Fire, Horary) point. Primary point for constipation and hypochondriac pain; paired with LI4/KI6 for habitual constipation. Perpendicular 0.8-1.0 inch.'
  },
  TE10: {
    star: 1,
    zh: '★ 天井為合穴（土/子穴）。化痰散結、瘰癧癭氣要穴（「天井化痰散結」）。直刺0.5-1.0寸。',
    en: '★ Tianjing is the He-Sea (Earth, Child/Sedation) point. Key point for transforming phlegm and dissipating scrofula/goiter nodules. Perpendicular 0.5-1.0 inch.'
  },
  TE14: {
    star: 1,
    zh: '★ 肩髎為肩關節要穴（配肩髃LI15、肩貞SI9治肩周炎「肩三針」）。直刺或斜下刺0.8-1.5寸。',
    en: '★ Jianliao is a key shoulder joint point (part of "Jian San Zhen" for frozen shoulder with LI15 and SI9). Perpendicular/oblique 0.8-1.5 inch.'
  },
  TE17: {
    star: 1,
    zh: '★ 翳風為耳疾與面癱第一要穴，主治耳鳴耳聾、中耳炎與口眼喎斜。直刺0.5-1.0寸，避免過深刺向頸內動靜脈。',
    en: '★ Yifeng is the primary point for ear disorders (tinnitus, otitis media) and facial paralysis. Perpendicular 0.5-1.0 inch; avoid deep anterior needle direction.'
  },
  TE21: {
    star: 1,
    zh: '★ 耳門為耳前要穴（張口取穴，配聽宮SI19、聽會GB2治耳疾「耳三針」）。直刺0.5-1.0寸。',
    en: '★ Ermen is a primary ear point located with mouth open (part of "Er San Zhen" with SI19 & GB2). Perpendicular 0.5-1.0 inch.'
  },
  TE23: {
    star: 1,
    zh: '★ 絲竹空為眉梢要穴，主治偏頭痛、目赤腫痛與眼瞼瞤動。平刺0.3-0.5寸。⚠️ 禁灸。',
    en: '★ Sizhukong is the eyebrow tip point for migraines, eye inflammation, and eyelid twitching. Transverse 0.3-0.5 inch. ⚠️ MOXIBUSTION CONTRAINDICATED.'
  }
};

const TE_SPECIFIC_CAUTIONS = {
  TE1:  { zh: '無名指端敏感部位，刺痛感較強；點刺出血或淺刺 0.1 寸。', en: 'Sensitive fingertip location; prick to bleed or insert 0.1 cun.' },
  TE2:  { zh: '指間部位，斜刺 0.3-0.5 寸。', en: 'Interdigital location; oblique insertion 0.3-0.5 cun.' },
  TE3:  { zh: '掌骨間隙，直刺 0.5-1.0 寸，避免刺傷掌背動脈。', en: 'Intermetacarpal space; avoid dorsal metacarpal artery.' },
  TE4:  { zh: '腕背橫紋凹陷處，避開腕背靜脈網與伸肌腱。', en: 'Wrist crease depression; avoid dorsal wrist vein network & extensor tendons.' },
  TE5:  { zh: '前臂橈尺骨之間，避開骨間前後動靜脈。', en: 'Between radius and ulna; avoid interosseous vessels.' },
  TE6:  { zh: '前臂橈尺骨之間，直刺 0.8-1.0 寸。', en: 'Between radius and ulna; perpendicular 0.8-1.0 cun.' },
  TE7:  { zh: '尺骨橈側緣，避開骨間神經。', en: 'Radial border of ulna; avoid interosseous nerve.' },
  TE8:  { zh: '前臂橈尺骨之間，直刺 0.5-1.0 寸。', en: 'Between radius and ulna; perpendicular 0.5-1.0 cun.' },
  TE9:  { zh: '前臂背側，直刺 0.5-1.0 寸。', en: 'Dorsal forearm; perpendicular 0.5-1.0 cun.' },
  TE10: { zh: '鷹嘴上 1 寸凹陷處，避開肘關節囊。', en: 'Depression 1 cun superior to olecranon; avoid elbow joint capsule.' },
  TE11: { zh: '臂後側，直刺 0.5-1.0 寸。', en: 'Posterior arm; perpendicular 0.5-1.0 cun.' },
  TE12: { zh: '臂後側，直刺 0.7-1.0 寸。', en: 'Posterior arm; perpendicular 0.7-1.0 cun.' },
  TE13: { zh: '三角肌後緣，避開橈神經。', en: 'Posterior border of deltoid; avoid radial nerve.' },
  TE14: { zh: '肩峰後下方凹陷處，避開肩關節腔與腋神經分支。', en: 'Posterior-inferior acromion depression; avoid axillary nerve branches.' },
  TE15: { zh: '肩胛岡上窩，斜刺 0.5-0.8 寸，嚴禁直刺深刺以免致氣胸。', en: 'Supraspinous fossa; oblique 0.5-0.8 cun. Deep perpendicular insertion contraindicated due to pneumothorax risk.' },
  TE16: { zh: '胸鎖乳突肌後緣，直刺 0.5-0.8 寸，避開頸外靜脈。', en: 'Posterior border of sternocleidomastoid; avoid external jugular vein.' },
  TE17: { zh: '耳垂後下方凹陷處，避開頸內動靜脈與面神經幹，進針不宜過深或偏向前方。', en: 'Depression behind earlobe; avoid internal carotid/jugular vessels & facial nerve.' },
  TE18: { zh: '耳後完骨邊緣，沿皮刺 0.1-0.3 寸或點刺出血。', en: 'Behind ear along curve; transverse 0.1-0.3 cun or bleed.' },
  TE19: { zh: '耳後部位，沿皮刺 0.1-0.3 寸。', en: 'Behind ear; transverse 0.1-0.3 cun.' },
  TE20: { zh: '耳尖直上髮際，平刺 0.3-0.5 寸，避開顳淺動靜脈。', en: 'Directly above ear apex; transverse 0.3-0.5 cun, avoid superficial temporal vessels.' },
  TE21: { zh: '耳屏上切跡前，張口取穴，直刺 0.5-1.0 寸。', en: 'Anterior to supratragic notch with mouth open; perpendicular 0.5-1.0 cun.' },
  TE22: { zh: '耳前鬢角髮際前緣，平刺 0.3-0.5 寸，避開顳淺動脈。', en: 'Anterior to ear helix root; transverse 0.3-0.5 cun, avoid superficial temporal artery.' },
  TE23: { zh: '眉梢凹陷處，平刺 0.3-0.5 寸；⚠️ 本穴禁灸。', en: 'Depression at lateral end of eyebrow; transverse 0.3-0.5 cun. ⚠️ MOXIBUSTION CONTRAINDICATED.' }
};

const DISEASE_CAT_RE = /系統疾病|系統病|五官疾病|婦科疾病|精神神志疾病/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^TE([1-9]|1[0-9]|2[0-3])$/.test(code)) return;

  const idx = parseInt(code.replace('TE', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 4), 6);

  // 1. Needling Method EN
  if (TE_NEEDLING_EN[code] && point.acumethod_en !== TE_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: TE_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = TE_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (TE_SPECIFIC_CAUTIONS[code]) {
    const spec = TE_SPECIFIC_CAUTIONS[code];
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
  if (TE_EXAM_PEARLS[code]) {
    const ep = TE_EXAM_PEARLS[code];
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

  // 5. TE23 Moxibustion Prohibition
  if (code === 'TE23') {
    const moxaZh = '本穴禁灸（絲竹空穴位近眼眶，灸之易傷目）。';
    if (!point.contraindications.includes(moxaZh)) {
      if (APPLY) {
        point.contraindications.push(moxaZh);
        point.cautions_zh = [...point.contraindications];
        point.cautions = point.contraindications.join('\n');
      }
    }
  }

  // 6. field_sources & review_status
  if (APPLY) {
    point.field_sources = {
      acumethod_zh: ['CloudTCM', 'eLotus CORE'],
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/10 SAN JIAO CHANNEL OF HAND SHAO YANG.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/10 SAN JIAO CHANNEL OF HAND SHAO YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/10 SAN JIAO CHANNEL OF HAND SHAO YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/10 SAN JIAO CHANNEL OF HAND SHAO YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across TE channel:\n`);
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
