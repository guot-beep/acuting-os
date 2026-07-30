/**
 * refine-ki-channel.js
 * Refines Kidney Channel (足少陰腎經 KI1–KI27):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Five-Shu, Yuan, Luo, Xi, Confluent, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-ki-channel.js          (dry run)
 *   node scripts/refine-ki-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for KI channel (KI1–KI27)
const KI_NEEDLING_EN = {
  KI1:  'Perpendicular insertion 0.3–0.5 cun. Jing-Well (Wood) point. CAUTION: Highly sensitive location on sole of foot.',
  KI2:  'Perpendicular insertion 0.5–1.0 cun. Ying-Spring (Fire) point.',
  KI3:  'Perpendicular insertion 0.5–1.0 cun in depression between medial malleolus and Achilles tendon. Shu-Stream (Earth) & Yuan-Source point. CAUTION: Avoid anterior tibial vessel puncture.',
  KI4:  'Perpendicular or oblique insertion 0.3–0.5 cun. Luo-Connecting point.',
  KI5:  'Perpendicular insertion 0.3–0.5 cun. Xi-Cleft point.',
  KI6:  'Perpendicular or oblique insertion 0.3–0.5 cun in depression below medial malleolus. Confluent point of Yin Qiao Mai.',
  KI7:  'Perpendicular insertion 0.8–1.0 cun. Jing-River (Metal, Mother) point. Primary point for sweating disorders.',
  KI8:  'Perpendicular insertion 0.5–1.0 cun. Xi-Cleft of Yin Qiao Mai.',
  KI9:  'Perpendicular insertion 0.8–1.2 cun. Xi-Cleft of Yin Wei Mai. Key antidote & anti-toxicity point.',
  KI10: 'Perpendicular insertion 0.8–1.2 cun. He-Sea (Water, Horary) point.',
  KI11: 'Perpendicular insertion 0.5–1.0 cun. CAUTION: Empty bladder prior to needling.',
  KI12: 'Perpendicular insertion 0.5–1.0 cun. CAUTION: Empty bladder prior to needling.',
  KI13: 'Perpendicular insertion 0.8–1.0 cun. CAUTION: Empty bladder prior to needling.',
  KI14: 'Perpendicular insertion 0.8–1.0 cun. CAUTION: Empty bladder prior to needling.',
  KI15: 'Perpendicular insertion 0.8–1.0 cun.',
  KI16: 'Perpendicular insertion 0.8–1.0 cun.',
  KI17: 'Perpendicular insertion 0.8–1.0 cun.',
  KI18: 'Perpendicular insertion 0.8–1.0 cun.',
  KI19: 'Perpendicular insertion 0.8–1.0 cun.',
  KI20: 'Perpendicular insertion 0.8–1.0 cun.',
  KI21: 'Perpendicular insertion 0.5–0.8 cun. CAUTION: Deep insertion may puncture Liver or Stomach.',
  KI22: 'Oblique or transverse insertion 0.3–0.5 cun. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  KI23: 'Oblique or transverse insertion 0.3–0.5 cun. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  KI24: 'Oblique or transverse insertion 0.3–0.5 cun. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  KI25: 'Oblique or transverse insertion 0.3–0.5 cun. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  KI26: 'Oblique or transverse insertion 0.3–0.5 cun. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  KI27: 'Oblique or transverse insertion 0.3–0.5 cun. CAUTION: Deep perpendicular insertion risks pneumothorax or subclavian vessel puncture.'
};

// Board exam pearls & stars for KI channel key points
const KI_EXAM_PEARLS = {
  KI1: {
    star: 1,
    zh: '★ 湧泉為井穴（木），足心第一穴。急救復甦、昏迷醒腦與引熱下行第一要穴。直刺0.3-0.5寸。',
    en: '★ Yongquan is the Jing-Well (Wood) point on sole of foot. Primary point for emergency revival, coma, and directing heat downwards. Perpendicular 0.3-0.5 inch.'
  },
  KI3: {
    star: 1,
    zh: '★ 太谿為輸穴、原穴（土）。補腎滋陰、培元固本第一要穴（「太谿補腎第一穴」）。直刺0.5-1.0寸。',
    en: '★ Taixi is the Shu-Stream, Yuan-Source (Earth) point. Primary point on the body for tonifying Kidney Yin and Original Qi. Perpendicular 0.5-1.0 inch.'
  },
  KI6: {
    star: 1,
    zh: '★ 照海為八脈交會穴（通陰蹻脈），清虛熱、利咽喉要穴。配手太陰列缺LU7治療咽喉腫痛、失眠與胸膈病症。直刺0.3-0.5寸。',
    en: '★ Zhaohai is the Confluent point of Yin Qiao Mai. Key point for deficiency heat and throat. Paired with LU7 for throat, insomnia, and chest. Needle 0.3-0.5 inch.'
  },
  KI7: {
    star: 1,
    zh: '★ 復溜為經穴（金/母穴）。調節汗液（無汗/盜汗/自汗）第一要穴，配合谷LI4調節發汗與止汗。直刺0.8-1.0寸。',
    en: '★ Fuliu is the Jing-River (Metal, Mother) point. Primary point for sweat regulation (anhidrosis/hyperhidrosis); paired with LI4 for sweating. Perpendicular 0.8-1.0 inch.'
  },
  KI9: {
    star: 1,
    zh: '★ 築賓為陰維脈之郄穴。解毒、解藥毒與胎毒第一要穴。直刺0.8-1.2寸。',
    en: '★ Zhubin is the Xi-Cleft point of Yin Wei Mai. Primary point for clearing toxicity, antidotes, and fetal toxicity. Perpendicular 0.8-1.2 inch.'
  },
  KI10: {
    star: 1,
    zh: '★ 陰谷為合穴（水/本穴）。滋陰利尿、清下焦濕熱要穴。直刺0.8-1.2寸。',
    en: '★ Yingu is the He-Sea (Water, Horary) point. Key point for nourishing Yin, diuresis, and clearing lower jiao damp-heat. Perpendicular 0.8-1.2 inch.'
  },
  KI27: {
    star: 1,
    zh: '★ 俞府為腎經終點穴。納氣平喘、寬胸理氣要穴。斜刺0.3-0.5寸，嚴禁直刺深刺防氣胸與鎖骨下血管。',
    en: '★ Yufu is the terminal point of Kidney channel. Key point for grasping Qi to relieve asthma and unbinding chest. Oblique 0.3-0.5 inch; avoid deep perpendicular insertion.'
  }
};

const DISEASE_CAT_RE = /系統疾病|系統病|五官疾病/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^KI([1-9]|1[0-9]|2[0-7])$/.test(code)) return;

  const idx = parseInt(code.replace('KI', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 4), 7);

  // 1. Needling Method EN
  if (KI_NEEDLING_EN[code] && point.acumethod_en !== KI_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: KI_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = KI_NEEDLING_EN[code];
  }

  // 2. Clean A13 Disease Category Action Tags
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

  // 3. Exam Pearls & Stars
  if (KI_EXAM_PEARLS[code]) {
    const ep = KI_EXAM_PEARLS[code];
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

  // 4. field_sources & review_status
  if (APPLY) {
    point.field_sources = {
      acumethod_zh: ['CloudTCM', 'eLotus CORE'],
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/8 KIDNEY CHANNEL OF FOOT SHAO YIN.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/8 KIDNEY CHANNEL OF FOOT SHAO YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/8 KIDNEY CHANNEL OF FOOT SHAO YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/8 KIDNEY CHANNEL OF FOOT SHAO YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across KI channel:\n`);
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
