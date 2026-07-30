/**
 * refine-li-channel.js
 * Refines Large Intestine Channel (手陽明大腸經 LI1–LI20):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Jing-Well, Ying-Spring, Shu-Stream, Yuan-Source, Luo-Connecting, Xi-Cleft, He-Sea, Four Command, Sanjian/Hegu, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-li-channel.js          (dry run)
 *   node scripts/refine-li-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for LI channel (LI1–LI20)
const LI_NEEDLING_EN = {
  LI1:  'Subcutaneous insertion 0.1 cun at radial side of index fingernail corner, or prick to bleed. Jing-Well (Metal, Horary) point. Primary point for acute sore throat, toothache & fever (Shangyang).',
  LI2:  'Perpendicular insertion 0.2–0.3 cun in depression radial to 2nd metacarpophalangeal joint. Ying-Spring (Water, Child/Sedation) point. Key point for toothache & clearing Yangming heat (Erjian).',
  LI3:  'Perpendicular insertion 0.5–0.8 cun in depression proximal to 2nd metacarpophalangeal joint on radial side. Shu-Stream (Wood, Mother) point. Key point for finger stiffness & toothache (Sanjian).',
  LI4:  'Perpendicular insertion 0.5–1.0 cun in middle of 2nd metacarpal bone on radial side. Yuan-Source & Four Command Point for Face/Mouth (Hegu). Primary point on the body for headache, toothache, facial disorders, fever & Si Guan (Hegu). CAUTION: STRICTLY CONTRAINDICATED IN PREGNANCY! CAN INDUCE STRONG UTERINE CONTRACTIONS.',
  LI5:  'Perpendicular insertion 0.3–0.5 cun in anatomical snuffbox between tendons of extensor pollicis longus and brevis. Jing-River (Fire) point. Key point for wrist pain & headache (Yangxi).',
  LI6:  'Perpendicular or oblique insertion 0.5–0.8 cun 3 cun proximal to wrist crease on line joining LI5 & LI11. Luo-Connecting point of Large Intestine channel. Primary point for facial edema, dysuria & tinnitus (Pianli).',
  LI7:  'Perpendicular insertion 0.5–1.0 cun 5 cun proximal to wrist crease. Xi-Cleft point of Large Intestine channel. Primary point for acute abdominal pain & furuncles (Wenliu).',
  LI8:  'Perpendicular insertion 0.5–1.0 cun 4 cun distal to LI11.',
  LI9:  'Perpendicular insertion 0.8–1.2 cun 3 cun distal to LI11.',
  LI10: 'Perpendicular insertion 0.8–1.2 cun 2 cun distal to LI11. Primary point for upper limb paralysis, arm weakness & elbow pain (Shousanli).',
  LI11: 'Perpendicular insertion 1.0–1.5 cun in depression at lateral end of cubital crease when elbow is flexed. He-Sea (Earth, Mother) & Lower He-Sea candidate. Primary point on the body for high fever, hypertension, skin itching/urticaria & elbow pain (Quchi).',
  LI12: 'Perpendicular insertion 0.5–1.0 cun superior to lateral epicondyle of humerus.',
  LI13: 'Perpendicular insertion 0.8–1.2 cun 3 cun superior to lateral epicondyle of humerus.',
  LI14: 'Perpendicular or oblique insertion 0.8–1.2 cun at insertion of deltoid muscle on lateral arm.',
  LI15: 'Perpendicular or oblique downward insertion 0.8–1.5 cun in depression anterior and inferior to acromion when arm is abducted. Primary point for shoulder joint pain, frozen shoulder & Jian San Zhen (Jianyu).',
  LI16: 'Perpendicular or oblique insertion 0.5–0.8 cun in depression between acromial end of clavicle and spine of scapula.',
  LI17: 'Perpendicular insertion 0.3–0.5 cun at posterior border of sternocleidomastoid muscle level with hyoid bone.',
  LI18: 'Perpendicular insertion 0.3–0.5 cun level with laryngeal prominence between sternal & clavicular heads of SCM muscle. CAUTION: Avoid carotid artery & internal jugular vein puncture.',
  LI19: 'Perpendicular insertion 0.2–0.3 cun below margin of nostril 0.5 cun lateral to GV26.',
  LI20: 'Oblique upward or subcutaneous insertion 0.3–0.5 cun in nasolabial groove level with midpoint of lateral border of ala nasi. Primary point on the body for nasal congestion, rhinitis & sinusitis (Yingxiang).'
};

// Board exam pearls & stars for LI channel key points
const LU_EXAM_PEARLS = {
  LI4: {
    star: 1,
    zh: '★ 合谷為原穴（金）、四總穴（「面口合谷收」）、四關穴（「合谷+太衝」）。頭面五官疾病、感冒發熱、齒痛與止痛第一要穴。直刺0.5-1.0寸。⚠️ 孕婦嚴禁針刺！',
    en: '★ Hegu is the Yuan-Source, Four Command Point (Face/Mouth), and Four Gates point. Primary point on the body for headache, toothache, fever, and pain. Perpendicular 0.5-1.0 inch; ⚠️ STRICTLY CONTRAINDICATED IN PREGNANCY.'
  },
  LI6: {
    star: 1,
    zh: '★ 偏歷為絡穴（通肺經）。頭面水腫、小便不利與耳鳴第一要穴（「頭面水腫尋偏歷」）。直刺或斜刺0.5-0.8寸。',
    en: '★ Pianli is the Luo-Connecting point of Large Intestine. Primary point for facial edema, dysuria, and tinnitus. Perpendicular 0.5-0.8 inch.'
  },
  LI7: {
    star: 1,
    zh: '★ 溫溜為郄穴（大腸經郄穴）。急性腸鳴腹痛、疔瘡腫毒與喉痺要穴。直刺0.5-1.0寸。',
    en: '★ Wenliu is the Xi-Cleft point of Large Intestine. Primary point for acute abdominal pain, borborygmus, and furuncles. Perpendicular 0.5-1.0 inch.'
  },
  LI10: {
    star: 1,
    zh: '★ 手三里為上肢強壯與通絡第一要穴（「上肢麻痺手三里」）。主治手臂麻木不仁、肘臂痛與腹痛腹瀉。直刺0.8-1.2寸。',
    en: '★ Shousanli is a primary point for upper limb numbness, arm pain, and gastrointestinal disorders. Perpendicular 0.8-1.2 inch.'
  },
  LI11: {
    star: 1,
    zh: '★ 曲池為合穴（土/母穴）。全身退熱高燒、高血壓、蕁麻疹/皮膚瘙癢與肘臂痛第一要穴（「清熱降壓首選曲池」）。直刺1.0-1.5寸。',
    en: '★ Quchi is the He-Sea (Earth, Mother) point. Primary point on the body for high fever, hypertension, skin itching/urticaria, and elbow pain. Perpendicular 1.0-1.5 inch.'
  },
  LI15: {
    star: 1,
    zh: '★ 肩髃為肩周炎與肩關節痛第一要穴（「肩三針」主穴）。主治肩臂不舉、肩關節痛與半身不遂。直刺或向下斜刺0.8-1.5寸。',
    en: '★ Jianyu is the primary point for shoulder joint pain, frozen shoulder, and upper limb hemiplegia. Perpendicular 0.8-1.5 inch.'
  },
  LI20: {
    star: 1,
    zh: '★ 迎香為通鼻第一要穴（「鼻塞鼻淵尋迎香」）。主治鼻塞、鼻淵、鼻衄與口眼喎斜。斜刺或沿皮刺0.3-0.5寸。',
    en: '★ Yingxiang is the primary point on the body for unblocking nasal passages (nasal congestion, sinusitis, rhinitis). Oblique 0.3-0.5 inch.'
  }
};

const LI_SPECIFIC_CAUTIONS = {
  LI1:  { zh: '食指橈側指甲角旁 0.1 寸，點刺出血或淺刺 0.1 寸。', en: 'Radial side of index fingernail corner; prick to bleed or 0.1 cun.' },
  LI2:  { zh: '第 2 掌指關節橈側前凹陷處，直刺 0.2-0.3 寸。', en: 'Radial side of 2nd MCP joint; perpendicular 0.2-0.3 cun.' },
  LI3:  { zh: '第 2 掌指關節橈側後凹陷處，直刺 0.5-0.8 寸。', en: 'Proximal to 2nd MCP joint; perpendicular 0.5-0.8 cun.' },
  LI4:  { zh: '第 2 掌骨中點橈側，直刺 0.5-1.0 寸。⚠️ 孕婦嚴禁針刺（針刺易激發強烈宮縮致流產）。', en: 'Midpoint of 2nd metacarpal bone; perpendicular 0.5-1.0 cun. ⚠️ STRICTLY CONTRAINDICATED IN PREGNANCY.' },
  LI5:  { zh: '陽溪穴（解剖學鼻煙窩中），直刺 0.3-0.5 寸。避開橈動脈。', en: 'Anatomical snuffbox; perpendicular 0.3-0.5 cun. Avoid radial artery.' },
  LI6:  { zh: '腕橫紋上 3 寸，直刺或斜刺 0.5-0.8 寸。', en: '3 cun above wrist crease; perpendicular/oblique 0.5-0.8 cun.' },
  LI7:  { zh: '腕橫紋上 5 寸，直刺 0.5-1.0 寸。', en: '5 cun above wrist crease; perpendicular 0.5-1.0 cun.' },
  LI8:  { zh: '曲池下 4 寸，直刺 0.5-1.0 寸。', en: '4 cun below LI11; perpendicular 0.5-1.0 cun.' },
  LI9:  { zh: '曲池下 3 寸，直刺 0.8-1.2 寸。', en: '3 cun below LI11; perpendicular 0.8-1.2 cun.' },
  LI10: { zh: '曲池下 2 寸，直刺 0.8-1.2 寸。', en: '2 cun below LI11; perpendicular 0.8-1.2 cun.' },
  LI11: { zh: '屈肘肘橫紋外側端凹陷處，直刺 1.0-1.5 寸。', en: 'Lateral end of cubital crease; perpendicular 1.0-1.5 cun.' },
  LI12: { zh: '肱骨外上髁上方，直刺 0.5-1.0 寸。', en: 'Superior to lateral epicondyle; perpendicular 0.5-1.0 cun.' },
  LI13: { zh: '曲池上 3 寸，直刺 0.8-1.2 寸。', en: '3 cun above LI11; perpendicular 0.8-1.2 cun.' },
  LI14: { zh: '三角肌止點處，直刺或斜刺 0.8-1.2 寸。', en: 'Insertion of deltoid muscle; perpendicular/oblique 0.8-1.2 cun.' },
  LI15: { zh: '肩峰前下方凹陷處，直刺或向下斜刺 0.8-1.5 寸。', en: 'Anterior-inferior to acromion; perpendicular/oblique 0.8-1.5 cun.' },
  LI16: { zh: '鎖骨肩峰端與肩胛岡之間凹陷處，直刺或斜刺 0.5-0.8 寸。', en: 'Depression between clavicle & scapular spine; perpendicular/oblique 0.5-0.8 cun.' },
  LI17: { zh: '胸鎖乳突肌後緣，直刺 0.3-0.5 寸。', en: 'Posterior border of SCM; perpendicular 0.3-0.5 cun.' },
  LI18: { zh: '喉結旁 1.5 寸胸鎖乳突肌前、後緣之間，直刺 0.3-0.5 寸。⚠️ 避開頸總動脈與頸內靜脈。', en: 'Level with laryngeal prominence; perpendicular 0.3-0.5 cun. ⚠️ Avoid carotid artery & jugular vein.' },
  LI19: { zh: '水溝穴旁 0.5 寸，直刺 0.2-0.3 寸。', en: '0.5 cun lateral to GV26; perpendicular 0.2-0.3 cun.' },
  LI20: { zh: '鼻翼外緣中點旁鼻唇溝中，斜刺或沿皮刺 0.3-0.5 寸。', en: 'Nasolabial groove level with ala nasi midpoint; oblique 0.3-0.5 cun.' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^LI([1-9]|1[0-9]|20)$/.test(code)) return;

  const idx = parseInt(code.replace('LI', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 4), 5);

  // 1. Needling Method EN
  if (LI_NEEDLING_EN[code] && point.acumethod_en !== LI_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: LI_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = LI_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (LI_SPECIFIC_CAUTIONS[code]) {
    const spec = LI_SPECIFIC_CAUTIONS[code];
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
  if (LU_EXAM_PEARLS[code]) {
    const ep = LU_EXAM_PEARLS[code];
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

  // 5. LI4 Pregnancy Contraindication
  if (code === 'LI4') {
    const pregZh = '孕婦嚴禁針刺（合谷穴為下氣行血重穴，針刺易激發強烈宮縮致流產或早產）。';
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
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/2 LARGE INTESTINE CHANNEL OF HAND YANG MING.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/2 LARGE INTESTINE CHANNEL OF HAND YANG MING.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/2 LARGE INTESTINE CHANNEL OF HAND YANG MING.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/2 LARGE INTESTINE CHANNEL OF HAND YANG MING.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across LI channel:\n`);
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
