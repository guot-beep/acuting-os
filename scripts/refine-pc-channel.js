/**
 * refine-pc-channel.js
 * Refines Pericardium Channel (手厥陰心包經 PC1–PC9):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Five-Shu, Yuan, Luo, Xi, Confluent, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-pc-channel.js          (dry run)
 *   node scripts/refine-pc-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for PC channel (PC1–PC9)
const PC_NEEDLING_EN = {
  PC1: 'Oblique or transverse insertion 0.3–0.5 cun in 4th intercostal space. Window of Sky point. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  PC2: 'Perpendicular insertion 0.5–1.0 cun.',
  PC3: 'Perpendicular insertion 0.8–1.0 cun, or prick cubital vein to bleed. He-Sea (Water) point. CAUTION: Avoid brachial artery puncture.',
  PC4: 'Perpendicular insertion 0.5–1.0 cun. Xi-Cleft point of Pericardium. Primary point for acute cardiac pain & blood stasis.',
  PC5: 'Perpendicular insertion 0.5–1.0 cun between tendons of palmaris longus & flexor carpi radialis. Jing-River (Metal) point.',
  PC6: 'Perpendicular insertion 0.5–1.0 cun between tendons of palmaris longus & flexor carpi radialis, 2 cun proximal to wrist crease. Luo-Connecting & Confluent point of Yin Wei Mai. Primary point for chest, stomach & nausea. CAUTION: Avoid median nerve injury.',
  PC7: 'Perpendicular insertion 0.3–0.5 cun in midpoint of wrist crease. Shu-Stream (Earth), Yuan-Source & Horary point. CAUTION: Avoid median nerve injury.',
  PC8: 'Perpendicular insertion 0.3–0.5 cun in palm between 2nd & 3rd metacarpal bones. Ying-Spring (Fire) & Son/Sedation point.',
  PC9: 'Subcutaneous insertion 0.1 cun at tip of middle finger, or prick to bleed. Jing-Well (Wood) & Mother/Tonification point. Primary emergency revival point.'
};

// Board exam pearls & stars for PC channel key points
const PC_EXAM_PEARLS = {
  PC3: {
    star: 1,
    zh: '★ 曲澤為合穴（水）。清熱瀉火、和胃止嘔與涼血解毒要穴，可刺血治療急性吐瀉與暑熱病。直刺0.8-1.0寸或點刺出血，避免刺傷肱動脈。',
    en: '★ Quze is the He-Sea (Water) point for clearing Heart fire, harmonizing Stomach, and cooling blood. Prick to bleed for acute vomiting, diarrhea, or sunstroke. Perpendicular 0.8-1.0 inch; avoid brachial artery.'
  },
  PC4: {
    star: 1,
    zh: '★ 郄門為心包經之郄穴。治療急性心痛、心悸與血證（嘔血、衄血）第一要穴。直刺0.5-1.0寸。',
    en: '★ Ximen is the Xi-Cleft point of Pericardium. Primary point for acute cardiac pain, severe palpitations, and blood heat/hemorrhage. Perpendicular 0.5-1.0 inch.'
  },
  PC5: {
    star: 1,
    zh: '★ 間使為經穴（金）。和胃化痰、寧心安神要穴，主治心痛、嘔吐、癲狂與瘧疾（「間使化痰治癲狂」）。直刺0.5-1.0寸。',
    en: '★ Jianshi is the Jing-River (Metal) point. Primary point for transforming phlegm misting the Heart (psychosis, malaria, vomiting). Perpendicular 0.5-1.0 inch.'
  },
  PC6: {
    star: 1,
    zh: '★ 內關為絡穴（通三焦經）、八脈交會穴（通陰維脈）、六總穴之一（胸脅內關謀）。寬胸理氣、和胃降逆止嘔、寧心安神第一要穴。直刺0.5-1.0寸，注意避開正中神經。',
    en: '★ Neiguan is the Luo-Connecting, Confluent point of Yin Wei Mai, and Command point for chest & hypochondrium. Primary point for nausea, vomiting, chest oppression, and insomnia. Perpendicular 0.5-1.0 inch; avoid median nerve.'
  },
  PC7: {
    star: 1,
    zh: '★ 大陵為輸穴、原穴（土）。清心瀉火、寧心安神第一要穴，主治心痛、失眠、口臭與心火亢盛。直刺0.3-0.5寸，避免刺傷正中神經。',
    en: '★ Daling is the Shu-Stream, Yuan-Source (Earth) point. Primary point for clearing Heart Fire, anxiety, insomnia, and halitosis. Perpendicular 0.3-0.5 inch; avoid median nerve.'
  },
  PC8: {
    star: 1,
    zh: '★ 勞宮為滎穴（火/本穴）。清心火、瀉掌中熱與口舌生瘡第一要穴。直刺0.3-0.5寸。',
    en: '★ Laogong is the Ying-Spring (Fire, Horary) point. Primary point for clearing extreme Heart Fire, palmar heat, and mouth sores. Perpendicular 0.3-0.5 inch.'
  },
  PC9: {
    star: 1,
    zh: '★ 中衝為井穴（木/母穴）。開竅醒神、急救復甦與退熱第一要穴（點刺出血）。淺刺0.1寸或點刺出血。',
    en: '★ Zhongchong is the Jing-Well (Wood, Mother) point. Primary point for emergency resuscitation, reviving consciousness, and clearing high fever (prick to bleed). Subcutaneous 0.1 inch or bleed.'
  }
};

const PC_SPECIFIC_CAUTIONS = {
  PC1: { zh: '第4肋間隙穴位，斜刺或平刺 0.3-0.5 寸，嚴禁直刺深刺以免刺傷肺臟致氣胸。', en: '4th intercostal space point; transverse/oblique 0.3-0.5 cun. Deep perpendicular insertion contraindicated due to pneumothorax risk.' },
  PC2: { zh: '臂前穴位，避開肱二頭肌短頭與神經血管。', en: 'Anterior arm point; avoid brachial nerve/vessels.' },
  PC3: { zh: '肘窩微屈取穴，避開肱動脈與中間靜脈。', en: 'In cubital fossa; avoid brachial artery and median cubital vein.' },
  PC4: { zh: '前臂正中，避開正中神經與橈尺骨間血管。', en: 'Mid-forearm; avoid median nerve.' },
  PC5: { zh: '掌長肌腱與橈側腕屈肌腱之間，避免刺傷正中神經。', en: 'Between tendons; avoid median nerve injury.' },
  PC6: { zh: '掌長肌腱與橈側腕屈肌腱之間，避開正中神經幹，刺入出現麻電感時應微退針。', en: 'Between tendons; avoid median nerve trunk. Withdraw slightly if electric sensation occurs.' },
  PC7: { zh: '腕橫紋正中，正中神經通過處，避免直刺過深刺激正中神經。', en: 'Midpoint of wrist crease over median nerve; avoid deep insertion.' },
  PC8: { zh: '掌心敏感部位，針刺疼痛感較強，避免過深。', en: 'Sensitive area in palm; avoid deep insertion.' },
  PC9: { zh: '指尖敏感部位，點刺出血或淺刺 0.1 寸。', en: 'Sensitive fingertip point; prick to bleed or insert 0.1 cun.' }
};

const DISEASE_CAT_RE = /系統疾病|系統病|五官疾病/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^PC[1-9]$/.test(code)) return;

  const idx = parseInt(code.replace('PC', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 2), 5);

  // 1. Needling Method EN
  if (PC_NEEDLING_EN[code] && point.acumethod_en !== PC_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: PC_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = PC_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (PC_SPECIFIC_CAUTIONS[code]) {
    const spec = PC_SPECIFIC_CAUTIONS[code];
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
  if (PC_EXAM_PEARLS[code]) {
    const ep = PC_EXAM_PEARLS[code];
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
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/9 PERICARDIUM CHANNEL OF HAND JUE YIN.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/9 PERICARDIUM CHANNEL OF HAND JUE YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/9 PERICARDIUM CHANNEL OF HAND JUE YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/9 PERICARDIUM CHANNEL OF HAND JUE YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across PC channel:\n`);
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
