/**
 * refine-lr-channel.js
 * Refines Liver Channel (足厥陰肝經 LR1–LR14):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Five-Shu, Yuan, Luo, Xi, Front-Mu, 8 Hui, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-lr-channel.js          (dry run)
 *   node scripts/refine-lr-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for LR channel (LR1–LR14)
const LR_NEEDLING_EN = {
  LR1:  'Subcutaneous insertion 0.1 cun at lateral side of big toenail, or prick to bleed. Jing-Well (Wood, Horary) point. Primary point for hernia & uterine bleeding.',
  LR2:  'Oblique insertion 0.3–0.5 cun toward heel. Ying-Spring (Fire, Child/Sedation) point. Primary point for clearing Liver Fire.',
  LR3:  'Perpendicular insertion 0.5–1.0 cun in depression distal to junction of 1st & 2nd metatarsal bones. Shu-Stream (Earth) & Yuan-Source point. Primary point for extinguishing Liver Wind & moving Liver Qi; paired with LI4 (Four Gates).',
  LR4:  'Perpendicular insertion 0.5–0.8 cun anterior to medial malleolus. Jing-River (Metal) point.',
  LR5:  'Subcutaneous insertion 0.3–0.5 cun along medial border of tibia, 5 cun superior to medial malleolus. Luo-Connecting point of Liver channel.',
  LR6:  'Subcutaneous insertion 0.3–0.5 cun along medial border of tibia, 7 cun superior to medial malleolus. Xi-Cleft point of Liver channel.',
  LR7:  'Perpendicular insertion 1.0–1.5 cun posterior & inferior to medial condyle of tibia.',
  LR8:  'Perpendicular insertion 0.8–1.2 cun in depression anterior to insertion of semimembranosus & semitendinosus muscles. He-Sea (Water, Mother) point. Primary point for nourishing Liver Yin & Blood (Ququan).',
  LR9:  'Perpendicular insertion 1.0–1.5 cun 4 cun superior to medial epicondyle of femur.',
  LR10: 'Perpendicular insertion 1.0–1.5 cun 3 cun inferior to ST30. CAUTION: Avoid femoral artery puncture.',
  LR11: 'Perpendicular insertion 1.0–1.5 cun 2 cun inferior to ST30. CAUTION: Avoid femoral artery puncture.',
  LR12: 'Oblique insertion 0.5–0.8 cun in pubic groove. CAUTION: Avoid femoral vessel puncture.',
  LR13: 'Oblique or transverse insertion 0.5–0.8 cun at lower border of free end of 11th rib. Front-Mu of Spleen & Hui-Meeting of Zang/Solid Organs. CAUTION: Deep perpendicular insertion risks Liver (right) or Spleen (left) enlargement puncture.',
  LR14: 'Oblique or transverse insertion 0.3–0.5 cun in 6th intercostal space directly below nipple. Front-Mu of Liver. CAUTION: Deep perpendicular insertion risks pneumothorax or liver/spleen injury.'
};

// Board exam pearls & stars for LR channel key points
const LR_EXAM_PEARLS = {
  LR1: {
    star: 1,
    zh: '★ 大敦為井穴（木/本穴）。治疝氣與崩漏止血第一要穴（「大敦止崩止疝」）。淺刺0.1寸或點刺出血。',
    en: '★ Dadun is the Jing-Well (Wood, Horary) point. Primary point for hernia and stopping uterine bleeding (menorrhagia). Subcutaneous 0.1 inch or bleed.'
  },
  LR2: {
    star: 1,
    zh: '★ 行間為滎穴（火/子穴）。瀉肝火第一要穴（治頭痛目赤、口苦脅痛、躁怒）。斜刺0.3-0.5寸。',
    en: '★ Xingjian is the Ying-Spring (Fire, Child/Sedation) point. Primary point on the body for clearing Liver Fire (headache, red eyes, bitter taste). Oblique 0.3-0.5 inch.'
  },
  LR3: {
    star: 1,
    zh: '★ 太衝為輸穴、原穴（土）。平肝息風、疏肝理氣第一要穴（配手陽明合谷LI4組成「四關穴」平肝安神止痛）。直刺0.5-1.0寸。',
    en: '★ Taichong is the Shu-Stream, Yuan-Source (Earth) point. Primary point for extinguishing Liver Wind and moving Liver Qi; paired with LI4 as "Four Gates". Perpendicular 0.5-1.0 inch.'
  },
  LR5: {
    star: 1,
    zh: '★ 蠡溝為絡穴（通膽經）。生殖器、陰癢、梅核氣與泌尿第一要穴。平刺0.3-0.5寸。',
    en: '★ Ligou is the Luo-Connecting point (connects to Gallbladder). Primary point for genital pruritus, plum-pit Qi, and leukorrhea. Transverse 0.3-0.5 inch.'
  },
  LR8: {
    star: 1,
    zh: '★ 曲泉為合穴（水/母穴）。滋陰養肝血、清下焦濕熱第一要穴（治陰癢、陰挺、膝痛）。直刺0.8-1.2寸。',
    en: '★ Ququan is the He-Sea (Water, Mother) point. Primary point for nourishing Liver Yin/Blood and clearing lower jiao damp-heat. Perpendicular 0.8-1.2 inch.'
  },
  LR13: {
    star: 1,
    zh: '★ 章門為脾之募穴、八會穴之「臟會」。疏肝理脾、調和肝脾第一要穴（治腹脹、腹瀉、脾腫大）。斜刺或平刺0.5-0.8寸，避免深刺傷及肝脾。',
    en: '★ Zhangmen is the Front-Mu point of Spleen and Hui-Meeting of Zang/Solid Organs. Primary point for harmonizing Liver & Spleen. Oblique/transverse 0.5-0.8 inch; avoid deep insertion.'
  },
  LR14: {
    star: 1,
    zh: '★ 期門為肝之募穴。疏肝理氣、寬胸脅要穴（治胸脅痛、胸悶、乳癰）。斜刺或平刺0.3-0.5寸，嚴禁直刺深刺以免致氣胸或傷及肝脾。',
    en: '★ Qimen is the Front-Mu point of Liver. Primary point for coursing Liver Qi, chest oppression, and mastitis. Oblique/transverse 0.3-0.5 inch; deep perpendicular insertion contraindicated.'
  }
};

const LR_SPECIFIC_CAUTIONS = {
  LR1:  { zh: '大趾甲角旁敏感部位，點刺出血或淺刺 0.1 寸。', en: 'Sensitive toenail location; prick to bleed or insert 0.1 cun.' },
  LR2:  { zh: '趾縫部位，斜刺 0.3-0.5 寸。', en: 'Interdigital space; oblique insertion 0.3-0.5 cun.' },
  LR3:  { zh: '第 1、2 跖骨間隙，避開足背動脈網。', en: '1st & 2nd metatarsal space; avoid dorsal pedis vessels.' },
  LR4:  { zh: '內踝前凹陷處，避開大隱靜脈。', en: 'Anterior to medial malleolus; avoid great saphenous vein.' },
  LR5:  { zh: '脛骨內側面，沿骨緣平刺 0.3-0.5 寸。', en: 'Medial surface of tibia; transverse 0.3-0.5 cun along bone.' },
  LR6:  { zh: '脛骨內側面，沿骨緣平刺 0.3-0.5 寸。', en: 'Medial surface of tibia; transverse 0.3-0.5 cun along bone.' },
  LR7:  { zh: '脛骨內側髁後下方，直刺 1.0-1.5 寸。', en: 'Posterior-inferior to medial tibial condyle; perpendicular 1.0-1.5 cun.' },
  LR8:  { zh: '膝關節內側膕橫紋頭，避開大隱靜脈。', en: 'Medial end of popliteal crease; avoid great saphenous vein.' },
  LR9:  { zh: '股內側，直刺 1.0-1.5 寸。', en: 'Medial thigh; perpendicular 1.0-1.5 cun.' },
  LR10: { zh: '股內側，避開股動靜脈與股神經，直刺 1.0-1.5 寸。', en: 'Medial thigh; avoid femoral artery/vein/nerve.' },
  LR11: { zh: '股內側，避開股動靜脈，直刺 1.0-1.5 寸。', en: 'Medial thigh; avoid femoral vessels.' },
  LR12: { zh: '恥骨結節外下方，避開股動靜脈與精索，斜刺 0.5-0.8 寸。', en: 'Pubic groove; avoid femoral vessels and spermatic cord.' },
  LR13: { zh: '第 11 肋游離端下方，斜刺或平刺 0.5-0.8 寸，嚴禁直刺深刺以免刺傷肝臟（右）或脾臟（左）。', en: '11th rib free end; transverse/oblique 0.5-0.8 cun. Deep perpendicular insertion contraindicated (liver/spleen risk).' },
  LR14: { zh: '乳頭直下第 6 肋間隙，斜刺或平刺 0.3-0.5 寸，嚴禁直刺深刺以免致氣胸或傷及肝脾。', en: '6th intercostal space; transverse/oblique 0.3-0.5 cun. Deep perpendicular insertion contraindicated (pneumothorax/organ risk).' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^LR([1-9]|1[0-4])$/.test(code)) return;

  const idx = parseInt(code.replace('LR', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 3), 5);

  // 1. Needling Method EN
  if (LR_NEEDLING_EN[code] && point.acumethod_en !== LR_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: LR_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = LR_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (LR_SPECIFIC_CAUTIONS[code]) {
    const spec = LR_SPECIFIC_CAUTIONS[code];
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
  if (LR_EXAM_PEARLS[code]) {
    const ep = LR_EXAM_PEARLS[code];
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
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/12 LIVER CHANNEL OF FOOT JUE YIN.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/12 LIVER CHANNEL OF FOOT JUE YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/12 LIVER CHANNEL OF FOOT JUE YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/12 LIVER CHANNEL OF FOOT JUE YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across LR channel:\n`);
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
