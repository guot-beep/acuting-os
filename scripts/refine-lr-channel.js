/**
 * refine-lr-channel.js
 * Refines Liver Channel (足厥陰肝經 LR1–LR14):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Jing-Well, Ying-Spring, Shu-Stream, Yuan-Source, Luo-Connecting, Xi-Cleft, He-Sea, Hui-Meeting of Zang, Front-Mu of Liver & Spleen, etc.
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
  LR1:  'Subcutaneous insertion 0.1 cun at lateral side of big toenail corner, or prick to bleed. Jing-Well (Wood, Horary) point. Primary point for hernia, uterine bleeding & genital pain (Dadun).',
  LR2:  'Oblique insertion 0.3–0.5 cun toward heel in web space between 1st & 2nd toes. Ying-Spring (Fire, Child/Sedation) point. Primary point for clearing Liver Fire, headache, dizziness & hypertension (Xingjian).',
  LR3:  'Perpendicular or oblique insertion 0.5–1.0 cun in depression distal to junction of 1st & 2nd metatarsal bones. Shu-Stream (Earth) & Yuan-Source point. Primary point on the body for pacifying Liver wind, soothing Liver Qi & Si Guan (Taichong).',
  LR4:  'Perpendicular insertion 0.5–0.8 cun 1 cun anterior to medial malleolus. Jing-River (Metal) point.',
  LR5:  'Subcutaneous insertion 0.5–0.8 cun 5 cun superior to medial malleolus on medial surface of tibia. Luo-Connecting point of Liver channel. Primary point for pudendal itching, plum-pit Qi & genital disorders (Ligou).',
  LR6:  'Perpendicular insertion 0.8–1.0 cun 7 cun superior to medial malleolus on medial surface of tibia. Xi-Cleft point of Liver channel (Zhongdu).',
  LR7:  'Perpendicular insertion 0.8–1.2 cun posterior and inferior to medial condyle of tibia.',
  LR8:  'Perpendicular insertion 0.8–1.2 cun in depression anterior to insertion of semimembranosus and semitendinosus muscles when knee is flexed. He-Sea (Water, Mother) point. Primary point for nourishing Liver Yin & blood (Ququan).',
  LR9:  'Perpendicular insertion 1.0–1.5 cun 4 cun superior to medial epicondyle of femur.',
  LR10: 'Perpendicular insertion 0.8–1.2 cun 3 cun inferior to ST30 on medial thigh.',
  LR11: 'Perpendicular insertion 0.8–1.2 cun 2 cun inferior to ST30 on medial thigh.',
  LR12: 'Perpendicular insertion 0.5–0.8 cun 1 cun inferior to ST30 in pubic region. CAUTION: Avoid femoral vein & artery.',
  LR13: 'Perpendicular or oblique insertion 0.8–1.0 cun at lower border of free end of 11th rib. Front-Mu of Spleen & Hui-Meeting of Zang/Solid Organs. Primary point for Liver-Spleen disharmony, abdominal distension & diarrhea (Zhangmen). CAUTION: Deep perpendicular insertion risks liver (right) or spleen (left) enlargement puncture.',
  LR14: 'Oblique or subcutaneous insertion 0.5–0.8 cun in 6th intercostal space on mammillary line. Front-Mu of Liver. Primary point for hypochondriac pain, Liver Qi stagnation & breast distension (Qimen). CAUTION: Deep perpendicular insertion risks pneumothorax or liver/spleen injury.'
};

// Board exam pearls & stars for LR channel key points
const LR_EXAM_PEARLS = {
  LR1: {
    star: 1,
    zh: '★ 大敦為井穴（木/本穴）。止崩漏、疝氣與睪丸腫痛第一要穴。淺刺0.1寸或點刺出血。',
    en: '★ Dadun is the Jing-Well (Wood, Horary) point. Primary point for uterine bleeding, hernia, and testicular swelling. Subcutaneous 0.1 inch or bleed.'
  },
  LR2: {
    star: 1,
    zh: '★ 行間為滎穴（火/子穴）。瀉肝火、清頭目、高血壓與痛經第一要穴（「瀉肝火尋行間」）。斜刺0.3-0.5寸。',
    en: '★ Xingjian is the Ying-Spring (Fire, Child/Sedation) point. Primary point for draining Liver Fire, headache, hypertension, and dysmenorrhea. Oblique 0.3-0.5 inch.'
  },
  LR3: {
    star: 1,
    zh: '★ 太衝為輸穴、原穴（土）。平肝息風、疏肝理氣與四關穴第一要穴（「四關穴：合谷+太衝」）。直刺0.5-1.0寸。',
    en: '★ Taichong is the Shu-Stream, Yuan-Source point. Primary point on the body for pacifying Liver wind, soothing Liver Qi, and Four Gates (Hegu + Taichong). Perpendicular 0.5-1.0 inch.'
  },
  LR5: {
    star: 1,
    zh: '★ 蠡溝為絡穴（通膽經）。全身陰痛陰癢、梅核氣與生殖器病變第一要穴（「陰痛陰癢尋蠡溝」）。沿皮刺0.5-0.8寸。',
    en: '★ Ligou is the Luo-Connecting point of Liver. Primary point for genital itching/pain, plum-pit Qi, and urogenital disorders. Subcutaneous 0.5-0.8 inch.'
  },
  LR8: {
    star: 1,
    zh: '★ 曲泉為合穴（水/母穴）。滋陰養肝血、膝痛與清下焦濕熱要穴。直刺0.8-1.2寸。',
    en: '★ Ququan is the He-Sea (Water, Mother) point. Primary point for nourishing Liver Yin/blood, knee joint pain, and clearing lower jiao damp-heat. Perpendicular 0.8-1.2 inch.'
  },
  LR13: {
    star: 1,
    zh: '★ 章門為脾之募穴、八會穴之「臟會」。肝脾不和、腹脹腹瀉與臟病第一要穴（「臟會章門」）。直刺0.8-1.0寸，⚠️ 深刺避開肝脾。',
    en: '★ Zhangmen is the Front-Mu point of Spleen and Hui-Meeting of Zang/Solid Organs. Primary point for Liver-Spleen disharmony, abdominal distension, and diarrhea. Perpendicular 0.8-1.0 inch.'
  },
  LR14: {
    star: 1,
    zh: '★ 期門為肝之募穴。疏肝理氣、脅肋痛與乳房脹痛第一要穴。斜刺0.5-0.8寸，⚠️ 嚴禁直刺深刺以免刺傷氣胸或肝脾。',
    en: '★ Qimen is the Front-Mu point of Liver. Primary point for soothing Liver Qi, hypochondriac pain, and acute mastitis. Oblique 0.5-0.8 inch; ⚠️ deep perpendicular insertion contraindicated.'
  }
};

const LR_SPECIFIC_CAUTIONS = {
  LR1:  { zh: '大趾外側趾甲角旁 0.1 寸，點刺出血或淺刺 0.1 寸。', en: 'Lateral side of big toenail corner; prick to bleed or 0.1 cun.' },
  LR2:  { zh: '第 1、2 趾縫間，斜刺 0.3-0.5 寸。', en: 'Web space between 1st & 2nd toes; oblique 0.3-0.5 cun.' },
  LR3:  { zh: '第 1、2 跖骨結合部前方凹陷處，直刺 0.5-1.0 寸。', en: 'Distal to junction of 1st & 2nd metatarsals; perpendicular 0.5-1.0 cun.' },
  LR4:  { zh: '內踝前 1 寸，直刺 0.5-0.8 寸。', en: '1 cun anterior to medial malleolus; perpendicular 0.5-0.8 cun.' },
  LR5:  { zh: '內踝尖上 5 寸脛骨內側面上，沿皮刺 0.5-0.8 寸。', en: '5 cun above medial malleolus; subcutaneous 0.5-0.8 cun.' },
  LR6:  { zh: '內踝尖上 7 寸脛骨內側面上，直刺 0.8-1.0 寸。', en: '7 cun above medial malleolus; perpendicular 0.8-1.0 cun.' },
  LR7:  { zh: '脛骨內側髁後下方，直刺 0.8-1.2 寸。', en: 'Posterior-inferior to medial tibial condyle; perpendicular 0.8-1.2 cun.' },
  LR8:  { zh: '屈膝膝內側橫紋頭上方凹陷處，直刺 0.8-1.2 寸。', en: 'Medial popliteal crease depression; perpendicular 0.8-1.2 cun.' },
  LR9:  { zh: '股骨內上髁上 4 寸，直刺 1.0-1.5 寸。', en: '4 cun above medial femoral epicondyle; perpendicular 1.0-1.5 cun.' },
  LR10: { zh: '氣衝穴下 3 寸，直刺 0.8-1.2 寸。', en: '3 cun below ST30; perpendicular 0.8-1.2 cun.' },
  LR11: { zh: '氣衝穴下 2 寸，直刺 0.8-1.2 寸。', en: '2 cun below ST30; perpendicular 0.8-1.2 cun.' },
  LR12: { zh: '恥骨結節外下方，直刺 0.5-0.8 寸。⚠️ 避開股靜脈與股動脈。', en: 'Inferior to pubic tubercle; perpendicular 0.5-0.8 cun. ⚠️ Avoid femoral vessels.' },
  LR13: { zh: '第 11 肋游離端下緣，直刺 0.8-1.0 寸。⚠️ 深刺避開肝臟（右）或脾臟（左）。', en: 'Lower border of 11th rib end; perpendicular 0.8-1.0 cun. ⚠️ Avoid liver/spleen puncture.' },
  LR14: { zh: '第 6 肋間隙乳頭直下，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肺臟致氣胸或傷及肝脾。', en: '6th intercostal space; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion contraindicated (pneumothorax/liver risk).' }
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
