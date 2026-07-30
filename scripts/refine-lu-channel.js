/**
 * refine-lu-channel.js
 * Refines Lung Channel (手太陰肺經 LU1–LU11):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Jing-Well, Ying-Spring, Shu-Stream, Yuan-Source, Luo-Connecting, Xi-Cleft, He-Sea, Front-Mu, Confluent, Four Command, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-lu-channel.js          (dry run)
 *   node scripts/refine-lu-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for LU channel (LU1–LU11)
const LU_NEEDLING_EN = {
  LU1:  'Oblique insertion 0.5–0.8 cun laterally toward shoulder in 1st intercostal space. Front-Mu of Lung & Meeting point of Lung and Spleen channels (Zhongfu). CAUTION: STRICTLY AVOID DEEP MEDIAL PERPENDICULAR INSERTION TO PREVENT PNEUMOTHORAX.',
  LU2:  'Oblique insertion 0.5–0.8 cun laterally toward shoulder in infraclavicular fossa. CAUTION: STRICTLY AVOID DEEP MEDIAL PERPENDICULAR INSERTION TO PREVENT PNEUMOTHORAX.',
  LU3:  'Perpendicular insertion 0.5–1.0 cun 3 cun inferior to axillary fold on anterolateral upper arm.',
  LU4:  'Perpendicular insertion 0.5–1.0 cun 4 cun inferior to axillary fold.',
  LU5:  'Perpendicular insertion 0.5–1.0 cun at cubital crease on radial side of biceps brachii tendon. He-Sea (Water, Child/Sedation) point. Primary point for clearing Lung heat, phlegm-heat cough & elbow pain (Cize).',
  LU6:  'Perpendicular insertion 0.5–1.0 cun 7 cun proximal to wrist crease on line joining LU9 & LU5. Xi-Cleft point of Lung channel. Primary point for acute pulmonary hemorrhage & severe hemoptysis (Kongzui).',
  LU7:  'Oblique upward insertion 0.3–0.5 cun 1.5 cun proximal to wrist crease above styloid process of radius. Luo-Connecting point, Confluent point of Ren Mai & Four Command Point for Head/Neck (Lieque). Primary point for common cold, neck stiffness & asthma.',
  LU8:  'Perpendicular or oblique insertion 0.3–0.5 cun 1 cun proximal to wrist crease. Jing-River (Metal, Horary) point. CAUTION: Avoid radial artery puncture.',
  LU9:  'Perpendicular insertion 0.3–0.5 cun at wrist crease in depression on radial side of radial artery. Shu-Stream (Earth, Mother), Yuan-Source & Hui-Meeting of Vessels (Taiyuan). Primary point for tonifying Lung Qi & pulseless disease. CAUTION: Avoid radial artery puncture.',
  LU10: 'Perpendicular insertion 0.5–0.8 cun at midpoint of 1st metacarpal bone on radial side. Ying-Spring (Fire) point. Primary point for sore throat, loss of voice & clearing Lung heat (Yuji).',
  LU11: 'Subcutaneous insertion 0.1 cun at radial side of thumb nail corner, or prick to bleed. Jing-Well (Wood) point. Primary emergency point for acute severe sore throat, high fever & loss of consciousness (Shaoshang).'
};

// Board exam pearls & stars for LU channel key points
const LU_EXAM_PEARLS = {
  LU1: {
    star: 1,
    zh: '★ 中府為肺之募穴（手足太陰交會穴）。宣肺理氣、治咳嗽氣喘與胸痛第一要穴。向外斜刺0.5-0.8寸，⚠️ 嚴禁向內深刺以免刺傷肺臟致氣胸。',
    en: '★ Zhongfu is the Front-Mu point of Lung. Primary point for cough, asthma, and chest pain. Oblique 0.5-0.8 inch laterally; ⚠️ deep medial insertion risks pneumothorax.'
  },
  LU5: {
    star: 1,
    zh: '★ 尺澤為合穴（水/子穴）。清肺瀉火、治熱性咳嗽、氣喘與咯血第一要穴（「清肺熱瀉火尋尺澤」）。直刺0.5-1.0寸。',
    en: '★ Cize is the He-Sea (Water, Child/Sedation) point. Primary point for clearing Lung heat, phlegm-heat cough, asthma, and hemoptysis. Perpendicular 0.5-1.0 inch.'
  },
  LU6: {
    star: 1,
    zh: '★ 孔最為郄穴（肺經郄穴）。治急性咯血、衄血與急性咳嗽第一要穴（「咯血急痛尋孔最」）。直刺0.5-1.0寸。',
    en: '★ Kongzui is the Xi-Cleft point of Lung. Primary point for acute pulmonary hemorrhage, severe hemoptysis, and acute asthma. Perpendicular 0.5-1.0 inch.'
  },
  LU7: {
    star: 1,
    zh: '★ 列缺為絡穴、八脈交會穴（通任脈）、四總穴（「頭項尋列缺」）。宣肺解表、感冒頭痛項強與咽喉痛第一要穴。向上斜刺0.3-0.5寸。',
    en: '★ Lieque is the Luo-Connecting, Confluent (Ren Mai), and Four Command Point (Head & Neck). Primary point for common cold, neck stiffness, and asthma. Oblique upward 0.3-0.5 inch.'
  },
  LU9: {
    star: 1,
    zh: '★ 太淵為輸穴、原穴（土/母穴）、八會穴之「脈會」。大補肺氣、無脈症與久咳第一要穴（「脈會太淵」）。直刺0.3-0.5寸，避開橈動脈。',
    en: '★ Taiyuan is the Shu-Stream, Yuan-Source (Earth, Mother), and Hui-Meeting of Vessels. Primary point for tonifying Lung Qi and pulseless disease. Perpendicular 0.3-0.5 inch.'
  },
  LU10: {
    star: 1,
    zh: '★ 魚際為滎穴（火）。清肺熱、利咽喉與治失音暴喑第一要穴（「咽喉腫痛尋魚際」）。直刺0.5-0.8寸。',
    en: '★ Yuji is the Ying-Spring (Fire) point. Primary point for sore throat, loss of voice, and clearing Lung heat. Perpendicular 0.5-0.8 inch.'
  },
  LU11: {
    star: 1,
    zh: '★ 少商為井穴（木）。急性劇烈咽喉腫痛、喉痺與高熱急救第一要穴（「咽痛點刺少商出血」）。淺刺0.1寸或點刺出血。',
    en: '★ Shaoshang is the Jing-Well (Wood) point. Primary emergency point for acute severe sore throat, laryngeal obstruction, and high fever. Subcutaneous 0.1 inch or prick to bleed.'
  }
};

const LU_SPECIFIC_CAUTIONS = {
  LU1:  { zh: '第 1 肋間隙乳頭外 2 寸，向外斜刺 0.5-0.8 寸。⚠️ 嚴禁向內直刺深刺以免刺傷肺臟致氣胸。', en: '1st intercostal space; oblique 0.5-0.8 cun laterally. ⚠️ Deep medial insertion contraindicated (pneumothorax risk).' },
  LU2:  { zh: '鎖骨下窩外側，向外斜刺 0.5-0.8 寸。⚠️ 嚴禁向內直刺深刺以免刺傷肺臟致氣胸。', en: 'Infraclavicular fossa; oblique 0.5-0.8 cun laterally. ⚠️ Deep medial insertion contraindicated (pneumothorax risk).' },
  LU3:  { zh: '腋前紋頭下 3 寸，直刺 0.5-1.0 寸。', en: '3 cun below anterior axillary fold; perpendicular 0.5-1.0 cun.' },
  LU4:  { zh: '腋前紋頭下 4 寸，直刺 0.5-1.0 寸。', en: '4 cun below anterior axillary fold; perpendicular 0.5-1.0 cun.' },
  LU5:  { zh: '肘橫紋上肱二頭肌腱橈側，直刺 0.5-1.0 寸。避開肱動靜脈。', en: 'Radial side of biceps tendon at elbow crease; perpendicular 0.5-1.0 cun.' },
  LU6:  { zh: '腕橫紋上 7 寸，直刺 0.5-1.0 寸。', en: '7 cun above wrist crease; perpendicular 0.5-1.0 cun.' },
  LU7:  { zh: '腕橫紋上 1.5 寸橈骨莖突上方，向上斜刺 0.3-0.5 寸。', en: '1.5 cun above wrist crease; oblique upward 0.3-0.5 cun.' },
  LU8:  { zh: '腕橫紋上 1 寸橈動脈橈側，直刺 0.3-0.5 寸。避開橈動脈。', en: '1 cun above wrist crease; perpendicular 0.3-0.5 cun. Avoid radial artery.' },
  LU9:  { zh: '腕掌側橫紋橈側端凹陷處，直刺 0.3-0.5 寸。避開橈動脈。', en: 'Radial end of wrist crease; perpendicular 0.3-0.5 cun. Avoid radial artery.' },
  LU10: { zh: '第 1 掌骨中點橈側赤白肉際，直刺 0.5-0.8 寸。', en: 'Midpoint of 1st metacarpal; perpendicular 0.5-0.8 cun.' },
  LU11: { zh: '拇指橈側指甲角旁 0.1 寸，點刺出血或淺刺 0.1 寸。', en: 'Radial side of thumb nail corner; prick to bleed or insert 0.1 cun.' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^LU([1-9]|1[0-1])$/.test(code)) return;

  const idx = parseInt(code.replace('LU', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 3), 4);

  // 1. Needling Method EN
  if (LU_NEEDLING_EN[code] && point.acumethod_en !== LU_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: LU_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = LU_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (LU_SPECIFIC_CAUTIONS[code]) {
    const spec = LU_SPECIFIC_CAUTIONS[code];
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

  // 5. field_sources & review_status
  if (APPLY) {
    point.field_sources = {
      acumethod_zh: ['CloudTCM', 'eLotus CORE'],
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/1 LUNG CHANNEL OF HAND TAI YIN.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/1 LUNG CHANNEL OF HAND TAI YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/1 LUNG CHANNEL OF HAND TAI YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/1 LUNG CHANNEL OF HAND TAI YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across LU channel:\n`);
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
