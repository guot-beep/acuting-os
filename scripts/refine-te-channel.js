/**
 * refine-te-channel.js
 * Refines Triple Burner Channel (手少陽三焦經 TE1–TE23):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Jing-Well, Ying-Spring, Shu-Stream, Yuan-Source, Luo-Connecting, Xi-Cleft, He-Sea, Confluent of Yang Wei Mai, Window of Sky, etc.
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
  TE1:  'Subcutaneous insertion 0.1 cun at ulnar side of ring fingernail corner, or prick to bleed. Jing-Well (Metal, Horary) point. Primary point for acute sore throat, fever & earache (Guanchong).',
  TE2:  'Perpendicular insertion 0.2–0.3 cun in web space between ring & little fingers. Ying-Spring (Water, Child/Sedation) point (Yemen). Primary point for earache & toothache.',
  TE3:  'Perpendicular insertion 0.5–0.8 cun in depression proximal to 4th metacarpophalangeal joint between 4th & 5th metacarpal bones. Shu-Stream (Wood, Mother) point (Zhongzhu). Primary point for temporal headache, tinnitus & deafness.',
  TE4:  'Perpendicular insertion 0.3–0.5 cun in wrist crease depression between tendons of extensor digitorum communis and extensor digiti minimi. Yuan-Source point of Triple Burner channel (Yangchi).',
  TE5:  'Perpendicular or oblique insertion 0.5–1.0 cun 2 cun proximal to wrist crease between radius & ulna. Luo-Connecting point & Confluent point of Yang Wei Mai. Primary point on the body for common cold, fever, migraine, tinnitus & frozen shoulder (Waiguan).',
  TE6:  'Perpendicular insertion 0.8–1.0 cun 3 cun proximal to wrist crease between radius & ulna. Primary point on the body for constipation, hypochondriac pain & sudden loss of voice (Zhigou).',
  TE7:  'Perpendicular insertion 0.5–0.8 cun 3 cun proximal to wrist crease level with TE6 on ulnar side of EDC tendon. Xi-Cleft point of Triple Burner channel (Huizong).',
  TE8:  'Perpendicular insertion 0.8–1.0 cun 4 cun proximal to wrist crease between radius & ulna.',
  TE9:  'Perpendicular insertion 0.8–1.2 cun 5 cun distal to olecranon of ulna.',
  TE10: 'Perpendicular insertion 0.5–0.8 cun 1 cun superior to olecranon in depression when elbow is flexed. He-Sea (Earth) point. Primary point for scrofula, migraine & elbow pain (Tianjing).',
  TE11: 'Perpendicular insertion 0.5–0.8 cun 1 cun superior to TE10.',
  TE12: 'Perpendicular or oblique insertion 0.5–0.8 cun midway between olecranon & TE14.',
  TE13: 'Perpendicular or oblique insertion 0.8–1.2 cun on posterior border of deltoid muscle level with TE14.',
  TE14: 'Perpendicular or oblique downward insertion 0.8–1.5 cun in depression posterior and inferior to acromion when arm is abducted. Primary point for shoulder joint pain & frozen shoulder (Jianliao).',
  TE15: 'Perpendicular or oblique insertion 0.5–0.8 cun midway between GB21 & SI13 at superior angle of scapula. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  TE16: 'Perpendicular insertion 0.5–0.8 cun posterior and inferior to mastoid process at posterior border of SCM muscle. Window of Sky point (Tianling).',
  TE17: 'Perpendicular insertion 0.8–1.2 cun in depression posterior to lobule of ear between mastoid process and angle of mandible. Primary point on the body for ear disorders, otitis media, tinnitus & facial paralysis (Yifeng).',
  TE18: 'Subcutaneous insertion 0.3–0.5 cun along curve of ear in posterior helix.',
  TE19: 'Subcutaneous insertion 0.3–0.5 cun posterior to ear apex.',
  TE20: 'Subcutaneous insertion 0.3–0.5 cun directly above ear apex within hairline.',
  TE21: 'Perpendicular insertion 0.5–1.0 cun in depression anterior to supratragic notch with mouth open. Primary point for tinnitus, deafness & TMJ pain (Ermen).',
  TE22: 'Subcutaneous insertion 0.3–0.5 cun anterior to superior border of ear root behind superficial temporal artery.',
  TE23: 'Subcutaneous insertion 0.3–0.5 cun laterally in depression at lateral end of eyebrow. Primary point for eye pain, twitching & frontal headache (Sizhukong). CAUTION: MOXIBUSTION PROHIBITED.'
};

// Board exam pearls & stars for TE channel key points
const TE_EXAM_PEARLS = {
  TE3: {
    star: 1,
    zh: '★ 中渚為輸穴（木/母穴）。耳鳴耳聾、偏頭痛與手指麻木關節屈伸不利第一要穴（「耳鳴耳聾尋中渚」）。直刺0.5-0.8寸。',
    en: '★ Zhongzhu is the Shu-Stream (Wood, Mother) point. Primary point for tinnitus, deafness, migraine, and finger stiffness. Perpendicular 0.5-0.8 inch.'
  },
  TE5: {
    star: 1,
    zh: '★ 外關為絡穴（別走心包經）、八脈交會穴（通陽維脈，配足臨泣 GB41）。外感風熱發熱、少陽頭痛、耳鳴耳聾與肩痛第一要穴（「外關陽維耳目肩」）。直刺0.5-1.0寸。',
    en: '★ Waiguan is the Luo-Connecting & Confluent (Yang Wei Mai) point. Primary point on the body for common cold, fever, migraine, tinnitus, and frozen shoulder. Perpendicular 0.5-1.0 inch.'
  },
  TE6: {
    star: 1,
    zh: '★ 支溝為便秘、脅肋痛與暴喑第一要穴（「便秘脅痛首選支溝」）。直刺0.8-1.0寸。',
    en: '★ Zhigou is the primary point on the body for constipation, hypochondriac pain, and sudden loss of voice. Perpendicular 0.8-1.0 inch.'
  },
  TE10: {
    star: 1,
    zh: '★ 天井為合穴（土/子穴）。瘰癧（頸部淋巴結核）、偏頭痛與肘痛第一要穴（「瘰癧尋天井」）。直刺0.5-0.8寸。',
    en: '★ Tianjing is the He-Sea (Earth, Child/Sedation) point. Primary point for scrofula, migraine, and elbow joint pain. Perpendicular 0.5-0.8 inch.'
  },
  TE14: {
    star: 1,
    zh: '★ 肩髎為肩周炎與肩關節痛（「肩三針」主穴之一）。主治肩臂痛與手臂不舉。直刺或向下斜刺0.8-1.5寸。',
    en: '★ Jianliao is a primary point for shoulder joint pain and frozen shoulder. Perpendicular/oblique 0.8-1.5 inch.'
  },
  TE17: {
    star: 1,
    zh: '★ 翳風為耳疾（耳鳴、耳聾、中耳炎）與面癱第一要穴（「耳疾面癱首選翳風」）。直刺0.8-1.2寸。',
    en: '★ Yifeng is the primary point on the body for ear disorders (tinnitus, deafness, otitis media) and facial paralysis. Perpendicular 0.8-1.2 inch.'
  },
  TE21: {
    star: 1,
    zh: '★ 耳門為「耳三針」（耳門、聽宮、聽會）之一。耳鳴耳聾與聤耳第一要穴。張口直刺0.5-1.0寸。',
    en: '★ Ermen is one of the Ear Three Needles. Primary point for tinnitus, deafness, and otitis media. Open mouth, perpendicular 0.5-1.0 inch.'
  },
  TE23: {
    star: 1,
    zh: '★ 絲竹空為眉梢凹陷處。眼疾、眉頭痛與眼瞼瞤動第一要穴。沿皮刺0.3-0.5寸。⚠️ 禁灸！',
    en: '★ Sizhukong is at the lateral end of eyebrow. Primary point for eye pain, eyelid twitching, and headache. Subcutaneous 0.3-0.5 inch; ⚠️ MOXIBUSTION PROHIBITED.'
  }
};

const TE_SPECIFIC_CAUTIONS = {
  TE1:  { zh: '無名指尺側指甲角旁 0.1 寸，點刺出血或淺刺 0.1 寸。', en: 'Ulnar side of ring fingernail corner; prick to bleed or 0.1 cun.' },
  TE2:  { zh: '第 4、5 指縫間赤白肉際，直刺 0.2-0.3 寸。', en: 'Web space between 4th & 5th fingers; perpendicular 0.2-0.3 cun.' },
  TE3:  { zh: '第 4、5 掌骨結合部前方凹陷處，直刺 0.5-0.8 寸。', en: 'Distal to junction of 4th & 5th metacarpals; perpendicular 0.5-0.8 cun.' },
  TE4:  { zh: '腕背橫紋中指總伸肌腱尺側凹陷處，直刺 0.3-0.5 寸。', en: 'Wrist crease depression; perpendicular 0.3-0.5 cun.' },
  TE5:  { zh: '腕背橫紋上 2 寸橈骨與尺骨之間，直刺 0.5-1.0 寸。', en: '2 cun above wrist crease between radius & ulna; perpendicular 0.5-1.0 cun.' },
  TE6:  { zh: '腕背橫紋上 3 寸橈骨與尺骨之間，直刺 0.8-1.0 寸。', en: '3 cun above wrist crease; perpendicular 0.8-1.0 cun.' },
  TE7:  { zh: '腕背橫紋上 3 寸支溝穴尺側，直刺 0.5-0.8 寸。', en: '3 cun above wrist crease on ulnar side of TE6; perpendicular 0.5-0.8 cun.' },
  TE8:  { zh: '腕背橫紋上 4 寸橈骨與尺骨之間，直刺 0.8-1.0 寸。', en: '4 cun above wrist crease; perpendicular 0.8-1.0 cun.' },
  TE9:  { zh: '肘尖下 5 寸橈骨與尺骨之間，直刺 0.8-1.2 寸。', en: '5 cun below olecranon; perpendicular 0.8-1.2 cun.' },
  TE10: { zh: '肘尖上 1 寸凹陷處，屈肘直刺 0.5-0.8 寸。', en: '1 cun above olecranon; flexed elbow, perpendicular 0.5-0.8 cun.' },
  TE11: { zh: '天井上 1 寸，直刺 0.5-0.8 寸。', en: '1 cun above TE10; perpendicular 0.5-0.8 cun.' },
  TE12: { zh: '肘尖與肩髎連線中點，直刺或斜刺 0.5-0.8 寸。', en: 'Midpoint of olecranon & TE14 line; perpendicular/oblique 0.5-0.8 cun.' },
  TE13: { zh: '三角肌後緣，直刺或斜刺 0.8-1.2 寸。', en: 'Posterior border of deltoid; perpendicular/oblique 0.8-1.2 cun.' },
  TE14: { zh: '肩峰後下方凹陷處，直刺或向下斜刺 0.8-1.5 寸。', en: 'Posterior-inferior to acromion; perpendicular/oblique 0.8-1.5 cun.' },
  TE15: { zh: '肩胛骨上角處，直刺 0.5-0.8 寸。⚠️ 嚴禁向內深刺以免刺傷肺臟致氣胸。', en: 'Superior angle of scapula; perpendicular 0.5-0.8 cun. ⚠️ Deep medial insertion risks pneumothorax.' },
  TE16: { zh: '乳突後下方胸鎖乳突肌後緣，直刺 0.5-0.8 寸。', en: 'Posterior-inferior to mastoid process; perpendicular 0.5-0.8 cun.' },
  TE17: { zh: '耳垂後方乳突與下頜角之間凹陷處，直刺 0.8-1.2 寸。', en: 'Depression posterior to ear lobe; perpendicular 0.8-1.2 cun.' },
  TE18: { zh: '耳後髮際沿耳輪弧形，沿皮刺 0.3-0.5 寸。', en: 'Posterior ear hairline curve; subcutaneous 0.3-0.5 cun.' },
  TE19: { zh: '耳尖後方，沿皮刺 0.3-0.5 寸。', en: 'Posterior to ear apex; subcutaneous 0.3-0.5 cun.' },
  TE20: { zh: '耳尖正上方髮際內，沿皮刺 0.3-0.5 寸。', en: 'Directly above ear apex; subcutaneous 0.3-0.5 cun.' },
  TE21: { zh: '耳屏上切跡前凹陷處，張口直刺 0.5-1.0 寸。', en: 'Anterior to supratragic notch; open mouth, perpendicular 0.5-1.0 cun.' },
  TE22: { zh: '耳前髮際下，沿皮刺 0.3-0.5 寸。避開顳淺動脈。', en: 'Anterior to ear root; subcutaneous 0.3-0.5 cun. Avoid superficial temporal artery.' },
  TE23: { zh: '眉梢外側凹陷處，沿皮刺 0.3-0.5 寸。⚠️ 本穴禁灸。', en: 'Depression at lateral end of eyebrow; subcutaneous 0.3-0.5 cun. ⚠️ MOXIBUSTION PROHIBITED.' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^TE([1-9]|1[0-9]|2[0-3])$/.test(code)) return;

  const idx = parseInt(code.replace('TE', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 5), 5);

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

  // 5. TE23 Moxibustion Contraindication
  if (code === 'TE23') {
    const noMoxaZh = '⚠️ 本穴禁灸（絲竹空穴位於眉梢，灸之易傷眼目與肌膚瘢痕）。';
    if (!point.contraindications.includes(noMoxaZh)) {
      if (APPLY) {
        point.contraindications = [noMoxaZh];
        point.cautions_zh = [noMoxaZh];
        point.cautions_en = ['⚠️ MOXIBUSTION PROHIBITED (Sizhukong).'];
        point.cautions = noMoxaZh;
      }
    }
  }

  // 6. field_sources & review_status
  if (APPLY) {
    point.field_sources = {
      acumethod_zh: ['CloudTCM', 'eLotus CORE'],
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/10 TRIPLE BURNER CHANNEL OF HAND SHAO YANG.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/10 TRIPLE BURNER CHANNEL OF HAND SHAO YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/10 TRIPLE BURNER CHANNEL OF HAND SHAO YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/10 TRIPLE BURNER CHANNEL OF HAND SHAO YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across TE channel:\n`);
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
