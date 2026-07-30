/**
 * refine-si-channel.js
 * Refines Small Intestine Channel (手太陽小腸經 SI1–SI19):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Jing-Well, Ying-Spring, Shu-Stream, Yuan-Source, Luo-Connecting, Xi-Cleft, He-Sea, Confluent of Du Mai, Tian Chuang, Window of Sky, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-si-channel.js          (dry run)
 *   node scripts/refine-si-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for SI channel (SI1–SI19)
const SI_NEEDLING_EN = {
  SI1:  'Subcutaneous insertion 0.1 cun at ulnar side of little fingernail corner, or prick to bleed. Jing-Well (Metal, Horary) point. Primary point for acute mastitis, insufficient lactation & fever (Shaoze).',
  SI2:  'Perpendicular insertion 0.2–0.3 cun in depression distal to 5th metacarpophalangeal joint. Ying-Spring (Water, Child/Sedation) point (Qiangu).',
  SI3:  'Perpendicular insertion 0.5–0.8 cun in depression proximal to 5th metacarpophalangeal joint on ulnar side. Shu-Stream (Wood, Mother) & Confluent point of Du Mai. Primary point on the body for neck stiffness, occipital headache, spinal pain & night sweating (Houxi).',
  SI4:  'Perpendicular insertion 0.3–0.5 cun in depression between base of 5th metacarpal bone and triquetral bone. Yuan-Source point of Small Intestine channel (Wangu).',
  SI5:  'Perpendicular insertion 0.3–0.5 cun in depression between styloid process of ulna and triquetral bone. Jing-River (Fire) point (Yanggu).',
  SI6:  'Perpendicular or oblique insertion 0.5–0.8 cun in bony cleft on radial side of styloid process of ulna when palm faces chest. Xi-Cleft point of Small Intestine channel. Primary point for blurred vision in elderly & upper limb pain (Yanglao).',
  SI7:  'Perpendicular insertion 0.5–0.8 cun 5 cun proximal to wrist crease on line joining SI5 & SI8. Luo-Connecting point of Small Intestine channel (Zhizheng).',
  SI8:  'Perpendicular insertion 0.3–0.5 cun in depression between olecranon of ulna and medial epicondyle of humerus when elbow is flexed. He-Sea (Earth) point (Xiaohai).',
  SI9:  'Perpendicular insertion 0.8–1.2 cun 1 cun superior to posterior axillary fold when arm hangs down.',
  SI10: 'Perpendicular or oblique insertion 0.8–1.2 cun in depression inferior to spine of scapula directly above SI9.',
  SI11: 'Perpendicular or oblique insertion 0.5–1.0 cun in center of infraspinous fossa of scapula. Primary point for scapular pain & breast disorders (Tianzong).',
  SI12: 'Perpendicular or oblique insertion 0.5–0.8 cun in center of supraspinous fossa of scapula.',
  SI13: 'Perpendicular or oblique insertion 0.5–0.8 cun at medial end of supraspinous fossa of scapula.',
  SI14: 'Perpendicular or oblique insertion 0.5–0.8 cun 3 cun lateral to lower border of spinous process of T1.',
  SI15: 'Perpendicular or oblique insertion 0.5–0.8 cun 2 cun lateral to lower border of spinous process of C7.',
  SI16: 'Perpendicular insertion 0.5–0.8 cun at posterior border of sternocleidomastoid muscle level with laryngeal prominence. Window of Sky point (Tianchuang).',
  SI17: 'Perpendicular insertion 0.5–0.8 cun posterior to angle of mandible at anterior border of SCM muscle. Window of Sky point (Tianrong). CAUTION: Avoid internal jugular vein & carotid artery.',
  SI18: 'Perpendicular or oblique insertion 0.3–0.5 cun directly below outer canthus in depression at lower border of zygomatic bone. Primary point for facial paralysis, trigeminal neuralgia & toothache (Quanliao).',
  SI19: 'Perpendicular insertion 0.5–1.0 cun in depression between tragus and mandibular joint with mouth open. Primary point on the body for ear disorders, tinnitus, deafness & otitis media (Tinggong).'
};

// Board exam pearls & stars for SI channel key points
const SI_EXAM_PEARLS = {
  SI1: {
    star: 1,
    zh: '★ 少澤為井穴（金/本穴）。產後乳少、乳癰與急性咽喉腫痛第一要穴。淺刺0.1寸或點刺出血。',
    en: '★ Shaoze is the Jing-Well (Metal, Horary) point. Primary point for insufficient lactation, acute mastitis, and severe sore throat. Subcutaneous 0.1 inch or bleed.'
  },
  SI3: {
    star: 1,
    zh: '★ 後溪為輸穴（木/母穴）、八脈交會穴（通督脈，配申脈 BL62）。項強頭痛、脊柱腰痛、癲狂與盜汗第一要穴（「後溪通督脈」）。直刺0.5-0.8寸。',
    en: '★ Houxi is the Shu-Stream (Wood, Mother) & Confluent point of Du Mai. Primary point for neck stiffness, occipital headache, spinal pain, and night sweating. Perpendicular 0.5-0.8 inch.'
  },
  SI6: {
    star: 1,
    zh: '★ 養老為郄穴（小腸經郄穴）。老年人目視昏花、視力減退與肩背肘臂痛第一要穴（「老年目昏尋養老」）。掌心向胸屈肘直刺/斜刺0.5-0.8寸。',
    en: '★ Yanglao is the Xi-Cleft point of Small Intestine. Primary point for blurred vision in the elderly, visual impairment, and shoulder/arm pain. Perpendicular/oblique 0.5-0.8 inch.'
  },
  SI11: {
    star: 1,
    zh: '★ 天宗為肩胛骨中心、氣喘與乳房腫痛第一要穴（「肩胛痛尋天宗」）。直刺或斜刺0.5-1.0寸。',
    en: '★ Tianzong is the center point of the scapula. Primary point for scapular pain, frozen shoulder, asthma, and breast swelling. Perpendicular/oblique 0.5-1.0 inch.'
  },
  SI18: {
    star: 1,
    zh: '★ 顴髎為面部三叉神經痛、口眼喎斜與下齒痛第一要穴（「面痛面癱尋顴髎」）。直刺或斜刺0.3-0.5寸。',
    en: '★ Quanliao is the primary point for trigeminal neuralgia, facial paralysis, and toothache. Perpendicular/oblique 0.3-0.5 inch.'
  },
  SI19: {
    star: 1,
    zh: '★ 聽宮為耳門、聽宮、聽會「耳三針」之一。耳鳴耳聾、中耳炎與耳疾第一要穴（「耳疾三針首選聽宮」）。張口直刺0.5-1.0寸。',
    en: '★ Tinggong is one of the Ear Three Needles. Primary point on the body for tinnitus, deafness, otitis media, and ear disorders. Open mouth, perpendicular 0.5-1.0 inch.'
  }
};

const SI_SPECIFIC_CAUTIONS = {
  SI1:  { zh: '小指尺側指甲角旁 0.1 寸，點刺出血或淺刺 0.1 寸。', en: 'Ulnar side of little fingernail corner; prick to bleed or 0.1 cun.' },
  SI2:  { zh: '第 5 掌指關節尺側前凹陷處，直刺 0.2-0.3 寸。', en: 'Distal to 5th MCP joint; perpendicular 0.2-0.3 cun.' },
  SI3:  { zh: '第 5 掌指關節尺側後凹陷處，微握拳直刺 0.5-0.8 寸。', en: 'Proximal to 5th MCP joint; perpendicular 0.5-0.8 cun.' },
  SI4:  { zh: '第 5 掌骨基底與三角骨之間，直刺 0.3-0.5 寸。', en: 'Between 5th metacarpal base & triquetrum; perpendicular 0.3-0.5 cun.' },
  SI5:  { zh: '尺骨莖突與三角骨之間，直刺 0.3-0.5 寸。', en: 'Between ulnar styloid & triquetrum; perpendicular 0.3-0.5 cun.' },
  SI6:  { zh: '尺骨莖突橈側骨縫中，掌心向胸直刺或斜刺 0.5-0.8 寸。', en: 'Bony cleft of ulnar styloid; palm to chest, perpendicular 0.5-0.8 cun.' },
  SI7:  { zh: '腕橫紋上 5 寸，直刺 0.5-0.8 寸。', en: '5 cun above wrist crease; perpendicular 0.5-0.8 cun.' },
  SI8:  { zh: '肘後鷹嘴與肱骨內上髁之間，屈肘直刺 0.3-0.5 寸。避開尺神經。', en: 'Between olecranon & medial epicondyle; perpendicular 0.3-0.5 cun. Avoid ulnar nerve.' },
  SI9:  { zh: '腋後紋頭直上 1 寸，直刺 0.8-1.2 寸。', en: '1 cun above posterior axillary fold; perpendicular 0.8-1.2 cun.' },
  SI10: { zh: '肩胛岡下緣凹陷處，直刺或斜刺 0.8-1.2 寸。', en: 'Inferior to scapular spine; perpendicular/oblique 0.8-1.2 cun.' },
  SI11: { zh: '肩胛骨岡下窩中央，直刺或斜刺 0.5-1.0 寸。', en: 'Center of infraspinous fossa; perpendicular/oblique 0.5-1.0 cun.' },
  SI12: { zh: '肩胛岡上窩中央，直刺或斜刺 0.5-0.8 寸。', en: 'Center of supraspinous fossa; perpendicular/oblique 0.5-0.8 cun.' },
  SI13: { zh: '肩胛岡內側端上緣，直刺或斜刺 0.5-0.8 寸。', en: 'Medial end of supraspinous fossa; perpendicular/oblique 0.5-0.8 cun.' },
  SI14: { zh: '第 1 胸椎棘突下旁開 3 寸，斜刺 0.5-0.8 寸。', en: '3 cun lateral to T1 spinous process; oblique 0.5-0.8 cun.' },
  SI15: { zh: '第 7 頸椎棘突下旁開 2 寸，斜刺 0.5-0.8 寸。', en: '2 cun lateral to C7 spinous process; oblique 0.5-0.8 cun.' },
  SI16: { zh: '胸鎖乳突肌後緣平喉結，直刺 0.5-0.8 寸。', en: 'Posterior border of SCM level with laryngeal prominence; perpendicular 0.5-0.8 cun.' },
  SI17: { zh: '下頜角後方胸鎖乳突肌前緣，直刺 0.5-0.8 寸。避開頸內動靜脈。', en: 'Posterior to angle of mandible; perpendicular 0.5-0.8 cun. Avoid carotid vessels.' },
  SI18: { zh: '顴骨下緣凹陷處，直刺或斜刺 0.3-0.5 寸。', en: 'Inferior border of zygomatic bone; perpendicular/oblique 0.3-0.5 cun.' },
  SI19: { zh: '耳屏與下頜關節之間，張口直刺 0.5-1.0 寸。', en: 'Between tragus & mandibular joint; open mouth, perpendicular 0.5-1.0 cun.' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^SI([1-9]|1[0-9])$/.test(code)) return;

  const idx = parseInt(code.replace('SI', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 4), 5);

  // 1. Needling Method EN
  if (SI_NEEDLING_EN[code] && point.acumethod_en !== SI_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: SI_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = SI_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (SI_SPECIFIC_CAUTIONS[code]) {
    const spec = SI_SPECIFIC_CAUTIONS[code];
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
  if (SI_EXAM_PEARLS[code]) {
    const ep = SI_EXAM_PEARLS[code];
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
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/6 SMALL INTESTINE CHANNEL OF HAND TAI YANG.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/6 SMALL INTESTINE CHANNEL OF HAND TAI YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/6 SMALL INTESTINE CHANNEL OF HAND TAI YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/6 SMALL INTESTINE CHANNEL OF HAND TAI YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across SI channel:\n`);
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
