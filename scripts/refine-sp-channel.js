/**
 * refine-sp-channel.js
 * Refines Spleen Channel (足太陰脾經 SP1–SP21):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Jing-Well, Ying-Spring, Shu-Stream, Yuan-Source, Luo-Connecting, Xi-Cleft, He-Sea, Confluent, Great Luo of Spleen, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-sp-channel.js          (dry run)
 *   node scripts/refine-sp-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for SP channel (SP1–SP21)
const SP_NEEDLING_EN = {
  SP1:  'Subcutaneous insertion 0.1 cun at medial side of big toenail corner, or prick to bleed. Jing-Well (Wood, Horary) point. Primary point for uterine bleeding, moxa for spleen governance & nightmares (Yinbai).',
  SP2:  'Perpendicular insertion 0.2–0.3 cun in depression distal to 1st metatarsophalangeal joint. Ying-Spring (Fire, Mother) point (Dadu).',
  SP3:  'Perpendicular insertion 0.5–0.8 cun in depression proximal to 1st metatarsophalangeal joint. Shu-Stream (Earth, Horary) & Yuan-Source point. Primary point for tonifying Spleen, diarrhea & dampness (Taibai).',
  SP4:  'Perpendicular insertion 0.5–0.8 cun in depression anterior and inferior to base of 1st metatarsal bone. Luo-Connecting point & Confluent point of Chong Mai. Primary point for Chong Mai, stomach pain, vomiting & dysmenorrhea (Gongsun).',
  SP5:  'Perpendicular insertion 0.3–0.5 cun in depression anterior and inferior to medial malleolus. Jing-River (Metal, Child/Sedation) point (Shangqiu).',
  SP6:  'Perpendicular insertion 0.8–1.0 cun 3 cun superior to medial malleolus at posterior border of tibia. Meeting point of Spleen, Liver & Kidney channels (Sanyinjiao). Primary point on the body for gynecological, urinary, digestive & insomnia disorders. CAUTION: STRICTLY CONTRAINDICATED IN PREGNANCY! CAN INDUCE UTERINE CONTRACTIONS.',
  SP7:  'Perpendicular insertion 0.8–1.2 cun 6 cun superior to medial malleolus at posterior border of tibia (Lougu).',
  SP8:  'Perpendicular insertion 0.8–1.2 cun 3 cun inferior to SP9 at posterior border of tibia. Xi-Cleft point of Spleen channel (Diji). Primary point for acute dysmenorrhea & uterine bleeding.',
  SP9:  'Perpendicular insertion 0.8–1.2 cun in depression inferior to medial condyle of tibia. He-Sea (Water) point. Primary point on the body for draining dampness, edema, ascites & dysuria (Yinlingquan).',
  SP10: 'Perpendicular or oblique upward insertion 0.8–1.5 cun 2 cun superior to medial border of patella on vastus medialis muscle. Primary point on the body for cooling blood, blood stasis & skin itching/urticaria (Xuehai).',
  SP11: 'Perpendicular insertion 0.5–1.0 cun 6 cun superior to SP10 on line joining SP10 & SP12.',
  SP12: 'Perpendicular insertion 0.5–1.0 cun 3.5 cun lateral to CV2 in groin area. CAUTION: Avoid femoral artery & vein.',
  SP13: 'Perpendicular insertion 0.8–1.0 cun 4 cun lateral to CV3.',
  SP14: 'Perpendicular insertion 0.8–1.0 cun 4 cun lateral to CV8 and 1.3 cun inferior to SP15.',
  SP15: 'Perpendicular insertion 0.8–1.2 cun 4 cun lateral to navel. Primary point for constipation, diarrhea & abdominal distension (Dahang).',
  SP16: 'Perpendicular insertion 0.5–0.8 cun 3 cun superior to SP15 4 cun lateral to midline.',
  SP17: 'Oblique or subcutaneous insertion 0.5–0.8 cun in 5th intercostal space 6 cun lateral to midline.',
  SP18: 'Oblique or subcutaneous insertion 0.5–0.8 cun in 4th intercostal space 6 cun lateral to midline.',
  SP19: 'Oblique or subcutaneous insertion 0.5–0.8 cun in 3rd intercostal space 6 cun lateral to midline.',
  SP20: 'Oblique or subcutaneous insertion 0.5–0.8 cun in 2nd intercostal space 6 cun lateral to midline.',
  SP21: 'Perpendicular or oblique insertion 0.5–0.8 cun on mid-axillary line in 6th intercostal space. Great Luo-Connecting point of Spleen. Primary point for general body aches, weakness & chest oppression (Dabao). CAUTION: Deep perpendicular insertion risks pneumothorax.'
};

// Board exam pearls & stars for SP channel key points
const SP_EXAM_PEARLS = {
  SP1: {
    star: 1,
    zh: '★ 隱白為井穴（木）。脾不統血、崩漏與月經過多第一要穴（「崩漏月經過多艾灸隱白」）。淺刺0.1寸或隔薑灸。',
    en: '★ Yinbai is the Jing-Well (Wood) point. Primary point for uterine bleeding, menorrhagia, and Spleen governing blood (moxibustion recommended). Subcutaneous 0.1 inch or moxa.'
  },
  SP3: {
    star: 1,
    zh: '★ 太白為輸穴、原穴（土/本穴）。大補脾胃、健脾化濕與腹痛腹瀉第一要穴（「健脾第一穴太白」）。直刺0.5-0.8寸。',
    en: '★ Taibai is the Shu-Stream, Yuan-Source (Earth, Horary) point. Primary point on the body for tonifying Spleen, diarrhea, and dampness. Perpendicular 0.5-0.8 inch.'
  },
  SP4: {
    star: 1,
    zh: '★ 公孫為絡穴（別走胃經）、八脈交會穴（通沖脈，配內關 PC6）。胃痛嘔吐、沖脈病與痛經第一要穴（「公孫沖脈胃心胸」）。直刺0.5-0.8寸。',
    en: '★ Gongsun is the Luo-Connecting & Confluent (Chong Mai) point. Primary point for stomach pain, vomiting, Chong Mai disorders, and dysmenorrhea. Perpendicular 0.5-0.8 inch.'
  },
  SP6: {
    star: 1,
    zh: '★ 三陰交為足三陰經（脾肝腎）交會穴。全身婦科、科泌尿、消化與失眠第一要穴（「婦科第一要穴三陰交」）。直刺0.8-1.0寸。⚠️ 孕婦嚴禁針刺！',
    en: '★ Sanyinjiao is the Meeting point of 3 Yin channels (Spleen, Liver, Kidney). Primary point on the body for gynecological, urinary, digestive, and insomnia disorders. Perpendicular 0.8-1.0 inch; ⚠️ STRICTLY CONTRAINDICATED IN PREGNANCY.'
  },
  SP8: {
    star: 1,
    zh: '★ 地機為郄穴（脾經郄穴）。痛經（急性痛經）、月經不調與崩漏第一要穴（「痛經急痛尋地機」）。直刺0.8-1.2寸。',
    en: '★ Diji is the Xi-Cleft point of Spleen. Primary point for acute dysmenorrhea, irregular menses, and uterine bleeding. Perpendicular 0.8-1.2 inch.'
  },
  SP9: {
    star: 1,
    zh: '★ 陰陵泉為合穴（水）。全身祛濕利水、水腫、小便不利與黃疸第一要穴（「全身祛濕首選陰陵泉」）。直刺0.8-1.2寸。',
    en: '★ Yinlingquan is the He-Sea (Water) point. Primary point on the body for draining dampness, edema, ascites, and dysuria. Perpendicular 0.8-1.2 inch.'
  },
  SP10: {
    star: 1,
    zh: '★ 血海為涼血活血第一要穴（「治風先治血，血行風自滅」）。主治蕁麻疹、濕疹、皮膚瘙癢與痛經崩漏。直刺0.8-1.5寸。',
    en: '★ Xuehai is the primary point on the body for cooling blood, blood stasis, urticaria, eczema, and menstrual disorders. Perpendicular 0.8-1.5 inch.'
  },
  SP21: {
    star: 1,
    zh: '★ 大包為脾之大絡。主治全身疼痛、四肢無力與胸脅痛（「脾之大絡大包」）。斜刺0.5-0.8寸，⚠️ 嚴禁深刺以免氣胸。',
    en: '★ Dabao is the Great Luo-Connecting point of Spleen. Primary point for general body aches, limb weakness, and chest pain. Oblique 0.5-0.8 inch.'
  }
};

const SP_SPECIFIC_CAUTIONS = {
  SP1:  { zh: '大趾內側趾甲角旁 0.1 寸，點刺出血或淺刺 0.1 寸；艾灸最佳。', en: 'Medial side of big toenail corner; prick to bleed or 0.1 cun (moxa preferred).' },
  SP2:  { zh: '第 1 跖趾關節前下方赤白肉際，直刺 0.2-0.3 寸。', en: 'Distal to 1st MTP joint; perpendicular 0.2-0.3 cun.' },
  SP3:  { zh: '第 1 跖趾關節後下方凹陷處，直刺 0.5-0.8 寸。', en: 'Proximal to 1st MTP joint; perpendicular 0.5-0.8 cun.' },
  SP4:  { zh: '第 1 跖骨基底前下方凹陷處，直刺 0.5-0.8 寸。', en: 'Anterior-inferior to 1st metatarsal base; perpendicular 0.5-0.8 cun.' },
  SP5:  { zh: '內踝前下方凹陷處，直刺 0.3-0.5 寸。', en: 'Depression anterior-inferior to medial malleolus; perpendicular 0.3-0.5 cun.' },
  SP6:  { zh: '內踝尖上 3 寸脛骨內側緣後方，直刺 0.8-1.0 寸。⚠️ 孕婦嚴禁針刺（針刺易激發宮縮致流產）。', en: '3 cun above medial malleolus; perpendicular 0.8-1.0 cun. ⚠️ STRICTLY CONTRAINDICATED IN PREGNANCY.' },
  SP7:  { zh: '內踝尖上 6 寸脛骨內側緣後方，直刺 0.8-1.2 寸。', en: '6 cun above medial malleolus; perpendicular 0.8-1.2 cun.' },
  SP8:  { zh: '陰陵泉下 3 寸脛骨內側緣後方，直刺 0.8-1.2 寸。', en: '3 cun below SP9; perpendicular 0.8-1.2 cun.' },
  SP9:  { zh: '脛骨內側髁下緣凹陷處，直刺 0.8-1.2 寸。', en: 'Depression below medial tibial condyle; perpendicular 0.8-1.2 cun.' },
  SP10: { zh: '髕底內側端上 2 寸股內側肌隆起處，直刺 0.8-1.5 寸。', en: '2 cun above medial patella border; perpendicular 0.8-1.5 cun.' },
  SP11: { zh: '箕門穴，直刺 0.5-1.0 寸。', en: '6 cun above SP10; perpendicular 0.5-1.0 cun.' },
  SP12: { zh: '曲骨穴旁 3.5 寸，直刺 0.5-1.0 寸。⚠️ 避開股靜脈與股動脈。', en: '3.5 cun lateral to CV2; perpendicular 0.5-1.0 cun. Avoid femoral vessels.' },
  SP13: { zh: '中極穴旁 4 寸，直刺 0.8-1.0 寸。', en: '4 cun lateral to CV3; perpendicular 0.8-1.0 cun.' },
  SP14: { zh: '臍下 1.3 寸旁開 4 寸，直刺 0.8-1.0 寸。', en: '1.3 cun below navel level, 4 cun lateral; perpendicular 0.8-1.0 cun.' },
  SP15: { zh: '臍中旁開 4 寸，直刺 0.8-1.2 寸。', en: '4 cun lateral to navel; perpendicular 0.8-1.2 cun.' },
  SP16: { zh: '臍上 3 寸旁開 4 寸，直刺 0.5-0.8 寸。', en: '3 cun above navel, 4 cun lateral; perpendicular 0.5-0.8 cun.' },
  SP17: { zh: '第 5 肋間隙旁開 6 寸，斜刺或平刺 0.5-0.8 寸。', en: '5th intercostal space; oblique/transverse 0.5-0.8 cun.' },
  SP18: { zh: '第 4 肋間隙旁開 6 寸，斜刺或平刺 0.5-0.8 寸。', en: '4th intercostal space; oblique/transverse 0.5-0.8 cun.' },
  SP19: { zh: '第 3 肋間隙旁開 6 寸，斜刺或平刺 0.5-0.8 寸。', en: '3rd intercostal space; oblique/transverse 0.5-0.8 cun.' },
  SP20: { zh: '第 2 肋間隙旁開 6 寸，斜刺或平刺 0.5-0.8 寸。', en: '2nd intercostal space; oblique/transverse 0.5-0.8 cun.' },
  SP21: { zh: '腋中線上第 6 肋間隙，斜刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肺臟致氣胸。', en: '6th intercostal space on mid-axillary line; oblique 0.5-0.8 cun. ⚠️ Deep perpendicular insertion contraindicated (pneumothorax risk).' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^SP([1-9]|1[0-9]|2[0-1])$/.test(code)) return;

  const idx = parseInt(code.replace('SP', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 4), 5);

  // 1. Needling Method EN
  if (SP_NEEDLING_EN[code] && point.acumethod_en !== SP_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: SP_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = SP_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (SP_SPECIFIC_CAUTIONS[code]) {
    const spec = SP_SPECIFIC_CAUTIONS[code];
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
  if (SP_EXAM_PEARLS[code]) {
    const ep = SP_EXAM_PEARLS[code];
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

  // 5. SP6 Pregnancy Contraindication
  if (code === 'SP6') {
    const pregZh = '孕婦嚴禁針刺（三陰交穴通交足三陰，針刺極易激發強烈宮縮致流產或早產）。';
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
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/4 SPLEEN CHANNEL OF FOOT TAI YIN.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/4 SPLEEN CHANNEL OF FOOT TAI YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/4 SPLEEN CHANNEL OF FOOT TAI YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/4 SPLEEN CHANNEL OF FOOT TAI YIN.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across SP channel:\n`);
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
