/**
 * refine-ki-channel.js
 * Refines Kidney Channel (足少陰腎經 KI1–KI27):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Jing-Well, Ying-Spring, Shu-Stream, Yuan-Source, Luo-Connecting, Xi-Cleft, He-Sea, Confluent of Yin Qiao Mai, Xi-Cleft of Yin Qiao/Yin Wei, etc.
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
  KI1:  'Perpendicular insertion 0.5–0.8 cun in depression at junction of anterior 1/3 and posterior 2/3 of sole when toes flexed. Jing-Well (Wood, Child/Sedation) point. Primary emergency point for resuscitation, loss of consciousness, hypertension, heat in soles & severe headache (Yongquan).',
  KI2:  'Perpendicular insertion 0.5–0.8 cun inferior to tuberosity of navicular bone. Ying-Spring (Fire) point. Key point for clearing Kidney Deficiency Fire & pudendal pain (Rangu).',
  KI3:  'Perpendicular insertion 0.5–1.0 cun in depression between medial malleolus and calcaneal tendon. Shu-Stream (Earth), Yuan-Source point. Primary point on the body for nourishing Kidney Yin/Yang, lower back pain, tinnitus & asthma (Taixi).',
  KI4:  'Perpendicular insertion 0.3–0.5 cun posterior and inferior to medial malleolus anterior to calcaneal tendon attachment. Luo-Connecting point of Kidney channel (Dazhong). Primary point for Kidney Qi deficiency asthma & dementia.',
  KI5:  'Perpendicular insertion 0.3–0.5 cun 1 cun inferior to KI3 in depression anterior and superior to calcaneal tuberosity. Xi-Cleft point of Kidney channel (Shuiquan). Primary point for acute dysmenorrhea & dysuria.',
  KI6:  'Perpendicular insertion 0.3–0.5 cun in depression 1 cun inferior to prominence of medial malleolus. Confluent point of Yin Qiao Mai. Primary point on the body for chronic dry sore throat, loss of voice, insomnia, epilepsy & constipation (Zhaohai).',
  KI7:  'Perpendicular insertion 0.8–1.0 cun 2 cun superior to KI3 at anterior border of calcaneal tendon. Jing-River (Metal, Mother) point. Primary point on the body for regulating sweating (spontaneous/night sweating), edema & Kidney Yang deficiency (Fuliu).',
  KI8:  'Perpendicular insertion 0.5–0.8 cun 0.5 cun anterior to KI7 2 cun superior to medial malleolus. Xi-Cleft point of Yin Qiao Mai (Jiaoxin). Key point for uterine bleeding & dysmenorrhea.',
  KI9:  'Perpendicular insertion 0.8–1.2 cun 5 cun superior to KI3 on line joining KI3 & KI10. Xi-Cleft point of Yin Wei Mai (Zhubin). Primary point for mania, mental disorders & detoxifying poison.',
  KI10: 'Perpendicular insertion 0.8–1.2 cun at medial end of popliteal crease between semimembranosus and semitendinosus tendons when knee flexed. He-Sea (Water, Horary) point. Primary point for clearing lower jiao damp-heat, dysuria & knee pain (Yingu).',
  KI11: 'Perpendicular insertion 0.8–1.2 cun 5 cun inferior to navel 0.5 cun lateral to CV2. CAUTION: Empty bladder before acupuncture.',
  KI12: 'Perpendicular insertion 0.8–1.2 cun 4 cun inferior to navel 0.5 cun lateral to CV3. CAUTION: Empty bladder before acupuncture.',
  KI13: 'Perpendicular insertion 0.8–1.2 cun 3 cun inferior to navel 0.5 cun lateral to CV4. CAUTION: Empty bladder before acupuncture.',
  KI14: 'Perpendicular insertion 0.8–1.2 cun 2 cun inferior to navel 0.5 cun lateral to CV5.',
  KI15: 'Perpendicular insertion 0.8–1.2 cun 1 cun inferior to navel 0.5 cun lateral to CV6.',
  KI16: 'Perpendicular insertion 0.8–1.2 cun 0.5 cun lateral to navel level with CV8.',
  KI17: 'Perpendicular insertion 0.8–1.2 cun 1 cun superior to navel 0.5 cun lateral to CV9.',
  KI18: 'Perpendicular insertion 0.8–1.2 cun 2 cun superior to navel 0.5 cun lateral to CV10.',
  KI19: 'Perpendicular insertion 0.8–1.2 cun 3 cun superior to navel 0.5 cun lateral to CV11.',
  KI20: 'Perpendicular insertion 0.8–1.2 cun 4 cun superior to navel 0.5 cun lateral to CV12.',
  KI21: 'Perpendicular insertion 0.5–0.8 cun 6 cun superior to navel 0.5 cun lateral to CV14. CAUTION: Avoid deep perpendicular insertion near liver/stomach.',
  KI22: 'Oblique or subcutaneous insertion 0.5–0.8 cun in 5th intercostal space 2 cun lateral to midline. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  KI23: 'Oblique or subcutaneous insertion 0.5–0.8 cun in 4th intercostal space 2 cun lateral to midline. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  KI24: 'Oblique or subcutaneous insertion 0.5–0.8 cun in 3rd intercostal space 2 cun lateral to midline. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  KI25: 'Oblique or subcutaneous insertion 0.5–0.8 cun in 2nd intercostal space 2 cun lateral to midline. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  KI26: 'Oblique or subcutaneous insertion 0.5–0.8 cun in 1st intercostal space 2 cun lateral to midline. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  KI27: 'Oblique or subcutaneous insertion 0.5–0.8 cun in depression at lower border of clavicle 2 cun lateral to midline. Primary point for Kidney Qi failing to grasp Qi, chronic cough & asthma (Shufu). CAUTION: Deep perpendicular insertion risks pneumothorax.'
};

// Board exam pearls & stars for KI channel key points
const KI_EXAM_PEARLS = {
  KI1: {
    star: 1,
    zh: '★ 湧泉為井穴（木/子穴）。急救昏迷、高血壓頭痛、足心熱與厥逆第一要穴（「急救開竅首選湧泉」）。直刺0.5-0.8寸。',
    en: '★ Yongquan is the Jing-Well (Wood, Child/Sedation) point. Primary emergency point for resuscitation, hypertension headache, and hot soles. Perpendicular 0.5-0.8 inch.'
  },
  KI3: {
    star: 1,
    zh: '★ 太溪為輸穴、原穴（土）。大補腎陰腎陽、腰膝酸痛、耳鳴耳聾與消渴第一要穴（「滋陰補腎第一穴」）。直刺0.5-1.0寸。',
    en: '★ Taixi is the Shu-Stream, Yuan-Source point. Primary point on the body for tonifying Kidney Yin & Yang, lower back pain, tinnitus, and asthma. Perpendicular 0.5-1.0 inch.'
  },
  KI6: {
    star: 1,
    zh: '★ 照海為八脈交會穴（通陰蹻脈，配列缺 LU7）。慢性乾咳咽痛、失眠（陰虛失眠）與便秘第一要穴（「照海陰蹻咽喉胸」）。直刺0.3-0.5寸。',
    en: '★ Zhaohai is the Confluent point of Yin Qiao Mai. Primary point on the body for chronic dry sore throat, insomnia (Yin deficiency), and constipation. Perpendicular 0.3-0.5 inch.'
  },
  KI7: {
    star: 1,
    zh: '★ 復溜為經穴（金/母穴）。調節汗液（自汗配合谷，盜汗配陰隙/太溪）、水腫與腎陽虛第一要穴（「止汗補汗首選復溜」）。直刺0.8-1.0寸。',
    en: '★ Fuliu is the Jing-River (Metal, Mother) point. Primary point on the body for regulating sweating (spontaneous or night sweating), edema, and Kidney Yang deficiency. Perpendicular 0.8-1.0 inch.'
  },
  KI9: {
    star: 1,
    zh: '★ 築賓為陰維脈之郄穴。排毒、癲狂與妊娠毒素第一要穴。直刺0.8-1.2寸。',
    en: '★ Zhubin is the Xi-Cleft point of Yin Wei Mai. Primary point for detoxifying, mania, and mental disorders. Perpendicular 0.8-1.2 inch.'
  },
  KI10: {
    star: 1,
    zh: '★ 陰谷為合穴（水/本穴）。清下焦濕熱、小便不利與膝痛要穴。直刺0.8-1.2寸。',
    en: '★ Yingu is the He-Sea (Water, Horary) point. Primary point for clearing lower jiao damp-heat, dysuria, and knee joint pain. Perpendicular 0.8-1.2 inch.'
  },
  KI27: {
    star: 1,
    zh: '★ 俞府為腎不納氣、久氣喘與胸痛第一要穴。斜刺或平刺0.5-0.8寸，⚠️ 嚴禁直刺深刺以免氣胸。',
    en: '★ Shufu is the primary point for Kidney failing to grasp Qi, chronic asthma, and chest pain. Oblique 0.5-0.8 inch.'
  }
};

const KI_SPECIFIC_CAUTIONS = {
  KI1:  { zh: '足底前 1/3 與後 2/3 交界處，直刺 0.5-0.8 寸。', en: 'Junction of anterior 1/3 & posterior 2/3 of sole; perpendicular 0.5-0.8 cun.' },
  KI2:  { zh: '舟骨粗隆下緣凹陷處，直刺 0.5-0.8 寸。', en: 'Inferior to navicular tuberosity; perpendicular 0.5-0.8 cun.' },
  KI3:  { zh: '內踝尖與跟腱之間凹陷處，直刺 0.5-1.0 寸。', en: 'Between medial malleolus & calcaneal tendon; perpendicular 0.5-1.0 cun.' },
  KI4:  { zh: '太溪下 0.5 寸稍後跟腱附著處，直刺 0.3-0.5 寸。', en: 'Posterior-inferior to medial malleolus; perpendicular 0.3-0.5 cun.' },
  KI5:  { zh: '太溪直下 1 寸跟骨結節前上方，直刺 0.3-0.5 寸。', en: '1 cun below KI3; perpendicular 0.3-0.5 cun.' },
  KI6:  { zh: '內踝尖直下 1 寸凹陷處，直刺 0.3-0.5 寸。', en: '1 cun below medial malleolus; perpendicular 0.3-0.5 cun.' },
  KI7:  { zh: '太溪直上 2 寸跟腱前緣，直刺 0.8-1.0 寸。', en: '2 cun above KI3; perpendicular 0.8-1.0 cun.' },
  KI8:  { zh: '復溜前 0.5 寸脛骨內側緣後方，直刺 0.5-0.8 寸。', en: '0.5 cun anterior to KI7; perpendicular 0.5-0.8 cun.' },
  KI9:  { zh: '太溪上 5 寸，直刺 0.8-1.2 寸。', en: '5 cun above KI3; perpendicular 0.8-1.2 cun.' },
  KI10: { zh: '膕橫紋內側端半腱肌肌腱外側，屈肘直刺 0.8-1.2 寸。', en: 'Medial end of popliteal crease; flexed knee, perpendicular 0.8-1.2 cun.' },
  KI11: { zh: '臍下 5 寸旁開 0.5 寸，直刺 0.8-1.2 寸。⚠️ 針刺前排空膀胱。', en: '5 cun below navel, 0.5 cun lateral; perpendicular 0.8-1.2 cun. ⚠️ Empty bladder first.' },
  KI12: { zh: '臍下 4 寸旁開 0.5 寸，直刺 0.8-1.2 寸。⚠️ 針刺前排空膀胱。', en: '4 cun below navel, 0.5 cun lateral; perpendicular 0.8-1.2 cun. ⚠️ Empty bladder first.' },
  KI13: { zh: '臍下 3 寸旁開 0.5 寸，直刺 0.8-1.2 寸。⚠️ 針刺前排空膀胱。', en: '3 cun below navel, 0.5 cun lateral; perpendicular 0.8-1.2 cun. ⚠️ Empty bladder first.' },
  KI14: { zh: '臍下 2 寸旁開 0.5 寸，直刺 0.8-1.2 寸。', en: '2 cun below navel, 0.5 cun lateral; perpendicular 0.8-1.2 cun.' },
  KI15: { zh: '臍下 1 寸旁開 0.5 寸，直刺 0.8-1.2 寸。', en: '1 cun below navel, 0.5 cun lateral; perpendicular 0.8-1.2 cun.' },
  KI16: { zh: '臍中旁開 0.5 寸，直刺 0.8-1.2 寸。', en: '0.5 cun lateral to navel; perpendicular 0.8-1.2 cun.' },
  KI17: { zh: '臍上 1 寸旁開 0.5 寸，直刺 0.8-1.2 寸。', en: '1 cun above navel, 0.5 cun lateral; perpendicular 0.8-1.2 cun.' },
  KI18: { zh: '臍上 2 寸旁開 0.5 寸，直刺 0.8-1.2 寸。', en: '2 cun above navel, 0.5 cun lateral; perpendicular 0.8-1.2 cun.' },
  KI19: { zh: '臍上 3 寸旁開 0.5 寸，直刺 0.8-1.2 寸。', en: '3 cun above navel, 0.5 cun lateral; perpendicular 0.8-1.2 cun.' },
  KI20: { zh: '臍上 4 寸旁開 0.5 寸，直刺 0.8-1.2 寸。', en: '4 cun above navel, 0.5 cun lateral; perpendicular 0.8-1.2 cun.' },
  KI21: { zh: '臍上 6 寸旁開 0.5 寸，直刺 0.5-0.8 寸。⚠️ 避免深刺傷及肝胃。', en: '6 cun above navel, 0.5 cun lateral; perpendicular 0.5-0.8 cun. Avoid deep insertion.' },
  KI22: { zh: '第 5 肋間隙旁開 2 寸，斜刺或平刺 0.5-0.8 寸。⚠️ 嚴禁深刺以免氣胸。', en: '5th intercostal space; oblique/transverse 0.5-0.8 cun. ⚠️ Deep insertion risks pneumothorax.' },
  KI23: { zh: '第 4 肋間隙旁開 2 寸，斜刺或平刺 0.5-0.8 寸。⚠️ 嚴禁深刺以免氣胸。', en: '4th intercostal space; oblique/transverse 0.5-0.8 cun. ⚠️ Deep insertion risks pneumothorax.' },
  KI24: { zh: '第 3 肋間隙旁開 2 寸，斜刺或平刺 0.5-0.8 寸。⚠️ 嚴禁深刺以免氣胸。', en: '3rd intercostal space; oblique/transverse 0.5-0.8 cun. ⚠️ Deep insertion risks pneumothorax.' },
  KI25: { zh: '第 2 肋間隙旁開 2 寸，斜刺或平刺 0.5-0.8 寸。⚠️ 嚴禁深刺以免氣胸。', en: '2nd intercostal space; oblique/transverse 0.5-0.8 cun. ⚠️ Deep insertion risks pneumothorax.' },
  KI26: { zh: '第 1 肋間隙旁開 2 寸，斜刺或平刺 0.5-0.8 寸。⚠️ 嚴禁深刺以免氣胸。', en: '1st intercostal space; oblique/transverse 0.5-0.8 cun. ⚠️ Deep insertion risks pneumothorax.' },
  KI27: { zh: '鎖骨下緣旁開 2 寸，斜刺或平刺 0.5-0.8 寸。⚠️ 嚴禁直刺深刺以免刺傷肺臟致氣胸。', en: 'Inferior border of clavicle; oblique/transverse 0.5-0.8 cun. ⚠️ Deep perpendicular insertion contraindicated (pneumothorax risk).' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^KI([1-9]|1[0-9]|2[0-7])$/.test(code)) return;

  const idx = parseInt(code.replace('KI', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 5), 6);

  // 1. Needling Method EN
  if (KI_NEEDLING_EN[code] && point.acumethod_en !== KI_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: KI_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = KI_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (KI_SPECIFIC_CAUTIONS[code]) {
    const spec = KI_SPECIFIC_CAUTIONS[code];
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

  // 5. field_sources & review_status
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
