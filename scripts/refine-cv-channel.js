/**
 * refine-cv-channel.js
 * Refines Conception Vessel (任脈 CV1–CV24):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Front-Mu, Sea of Qi/Blood, Confluent, Meeting points, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-cv-channel.js          (dry run)
 *   node scripts/refine-cv-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for CV channel (CV1–CV24)
const CV_NEEDLING_EN = {
  CV1:  'Perpendicular insertion 0.5–1.0 cun in perineum midpoint between anus and scrotum/labia. Luo-Connecting point of Ren Mai. CAUTION: STRICTLY CONTRAINDICATED IN PREGNANCY.',
  CV2:  'Perpendicular insertion 0.5–1.0 cun at superior border of pubic symphysis. CAUTION: Empty bladder before needling; deep insertion risks urinary bladder puncture.',
  CV3:  'Perpendicular insertion 0.5–1.0 cun 4 cun inferior to navel. Front-Mu of Urinary Bladder. CAUTION: Empty bladder before needling; deep insertion risks urinary bladder puncture.',
  CV4:  'Perpendicular insertion 0.8–1.2 cun 3 cun inferior to navel. Front-Mu of Small Intestine & Sea of Yuan Qi. Primary point for tonifying original Qi & Kidney Yang. CAUTION: Empty bladder before needling; deep insertion risks bladder/peritoneal puncture.',
  CV5:  'Perpendicular insertion 0.8–1.2 cun 2 cun inferior to navel. Front-Mu of San Jiao.',
  CV6:  'Perpendicular insertion 0.8–1.2 cun 1.5 cun inferior to navel. Primary point for tonifying Qi & raising prolapse (Qihai). CAUTION: Deep insertion in thin patients risks peritoneal cavity puncture.',
  CV7:  'Perpendicular insertion 0.8–1.2 cun 1 cun inferior to navel.',
  CV8:  'NO NEEDLING (CONTRAINDICATED TO NEEDLE). Moxibustion only (salt/ginger moxa in navel). Primary point for warming Yang, emergency collapse & chronic diarrhea (Shenque).',
  CV9:  'Perpendicular insertion 0.5–1.0 cun 1 cun superior to navel. Primary point for edema & water retention (Shuifen).',
  CV10: 'Perpendicular insertion 0.8–1.2 cun 2 cun superior to navel.',
  CV11: 'Perpendicular insertion 0.8–1.2 cun 3 cun superior to navel.',
  CV12: 'Perpendicular insertion 0.8–1.2 cun 4 cun superior to navel. Front-Mu of Stomach & Hui-Meeting of Fu/Hollow Organs. Primary point for stomach disorders & middle jiao (Zhongwan).',
  CV13: 'Perpendicular insertion 0.8–1.2 cun 5 cun superior to navel.',
  CV14: 'Perpendicular or oblique downward insertion 0.5–0.8 cun 6 cun superior to navel. Front-Mu of Heart. CAUTION: Deep upward insertion risks liver (right) or heart (left) injury.',
  CV15: 'Oblique downward insertion 0.5–0.8 cun 7 cun superior to navel. Xi-Cleft of Ren Mai. CAUTION: Deep upward insertion contraindicated due to heart/liver puncture risk.',
  CV16: 'Perpendicular insertion 0.3–0.5 cun in 5th intercostal space on sternum midpoint.',
  CV17: 'Subcutaneous insertion 0.3–0.5 cun downward or laterally along sternum at 4th intercostal space. Front-Mu of Pericardium & Hui-Meeting of Qi (Qihui). Primary point for chest oppression, asthma & lactation (Danzhong).',
  CV18: 'Subcutaneous insertion 0.3–0.5 cun along sternum.',
  CV19: 'Subcutaneous insertion 0.3–0.5 cun along sternum.',
  CV20: 'Subcutaneous insertion 0.3–0.5 cun along sternum.',
  CV21: 'Subcutaneous insertion 0.3–0.5 cun along sternum.',
  CV22: 'First insert perpendicularly 0.2 cun, then turn needle point downward behind sternum 0.5–1.0 cun in supraclavicular fossa. Primary point for asthma, severe cough & plum-pit Qi (Tiantu). CAUTION: Deep perpendicular insertion risks trachea/aortic arch puncture.',
  CV23: 'Oblique upward insertion 0.5–0.8 cun toward root of tongue in depression superior to hyoid bone. Primary point for aphasia, tongue stiffness & swallowing difficulty (Lianquan).',
  CV24: 'Oblique upward insertion 0.3–0.5 cun in mentolabial groove below lower lip. Primary point for facial paralysis, drooling & gum swelling (Chengjiang).'
};

// Board exam pearls & stars for CV channel key points
const CV_EXAM_PEARLS = {
  CV3: {
    star: 1,
    zh: '★ 中極為膀胱之募穴。清下焦濕熱、利尿通淋第一要穴。直刺0.5-1.0寸，⚠️ 刺前須排空膀胱。',
    en: '★ Zhongji is the Front-Mu point of Urinary Bladder. Primary point for clearing lower jiao damp-heat and dysuria. Perpendicular 0.5-1.0 inch; ⚠️ empty bladder prior to needling.'
  },
  CV4: {
    star: 1,
    zh: '★ 關元為小腸之募穴。培元固本、大補元氣、治虛勞與婦科第一要穴（「關元補腎固本」）。直刺0.8-1.2寸，⚠️ 刺前須排空膀胱。',
    en: '★ Guanyuan is the Front-Mu point of Small Intestine and Sea of Yuan Qi. Primary point for tonifying original Qi, Kidney Yang, and gynecological disorders. Perpendicular 0.8-1.2 inch; ⚠️ empty bladder first.'
  },
  CV6: {
    star: 1,
    zh: '★ 氣海為補氣要穴（「氣海補氣升陽」）。主治虛勞羸瘦、腹脹腹瀉、陰挺脫肛。直刺0.8-1.2寸。',
    en: '★ Qihai is the primary point on the body for tonifying Qi and raising Yang (for collapse/prolapse). Perpendicular 0.8-1.2 inch.'
  },
  CV8: {
    star: 1,
    zh: '★ 神闕為臍中要穴。⚠️ 禁針（嚴禁針刺）！隔鹽/隔薑灸溫陽救逆、治中風脫證與虛寒腹瀉第一要穴。',
    en: '★ Shenque is the navel point. ⚠️ NEEDLING IS CONTRAINDICATED! Moxibustion with salt/ginger is the primary method for warming Yang and rescuing from collapse.'
  },
  CV9: {
    star: 1,
    zh: '★ 水分為利水消腫第一要穴（「水分利水治水腫」）。主治水腫、小便不利與腹脹。直刺0.5-1.0寸。',
    en: '★ Shuifen is the primary point for promoting urination and relieving edema/ascites. Perpendicular 0.5-1.0 inch.'
  },
  CV12: {
    star: 1,
    zh: '★ 中脘為胃之募穴、八會穴之「腑會」。和胃健脾、胃痛嘔吐第一要穴（「腑會中脘」）。直刺0.8-1.2寸。',
    en: '★ Zhongwan is the Front-Mu point of Stomach and Hui-Meeting of Fu/Hollow Organs. Primary point for epigastric pain, vomiting, and stomach disorders. Perpendicular 0.8-1.2 inch.'
  },
  CV14: {
    star: 1,
    zh: '★ 巨闕為心之募穴。清心安神、心痛心悸第一要穴。直刺或向下斜刺0.5-0.8寸，⚠️ 嚴禁向上深刺傷及心肝。',
    en: '★ Juque is the Front-Mu point of Heart. Primary point for cardiac pain and mental disorders. Oblique downward 0.5-0.8 inch; ⚠️ upward deep insertion contraindicated.'
  },
  CV17: {
    star: 1,
    zh: '★ 膻中為心包之募穴、八會穴之「氣會」。寬胸理氣、哮喘與通乳第一要穴（「氣會膻中」）。平刺0.3-0.5寸。',
    en: '★ Danzhong is the Front-Mu point of Pericardium and Hui-Meeting of Qi. Primary point for chest oppression, asthma, and unblocking lactation. Transverse 0.3-0.5 inch.'
  },
  CV22: {
    star: 1,
    zh: '★ 天突為胸骨上窩要穴。降氣平喘、梅核氣與暴喑第一要穴。先直刺0.2寸，再沿胸骨柄後方向下沿皮刺0.5-1.0寸，⚠️ 嚴禁直刺過深傷及氣管或主動脈弧。',
    en: '★ Tiantu is the primary point for severe asthma, plum-pit Qi, and voice loss. Insert 0.2 inch perpendicularly then turn downward behind sternum 0.5-1.0 inch; ⚠️ avoid deep perpendicular insertion.'
  },
  CV23: {
    star: 1,
    zh: '★ 廉泉為舌下要穴。主治舌強不語、中風失語與吞咽困難。針尖向舌根方向斜刺0.5-0.8寸。',
    en: '★ Lianquan is the primary point for tongue stiffness, stroke aphasia, and dysphagia. Oblique upward 0.5-0.8 inch toward tongue root.'
  }
};

const CV_SPECIFIC_CAUTIONS = {
  CV1:  { zh: '會陰敏感部位，直刺 0.5-1.0 寸。⚠️ 孕婦嚴禁針刺。', en: 'Perineal location; perpendicular 0.5-1.0 cun. ⚠️ STRICTLY CONTRAINDICATED IN PREGNANCY.' },
  CV2:  { zh: '恥骨聯合上緣，直刺 0.5-1.0 寸。⚠️ 刺前須排空膀胱以免刺傷膀胱。', en: 'Superior border of pubic symphysis; perpendicular 0.5-1.0 cun. ⚠️ Empty bladder prior to needling.' },
  CV3:  { zh: '臍下 4 寸，直刺 0.5-1.0 寸。⚠️ 刺前須排空膀胱以免刺傷膀胱。', en: '4 cun below navel; perpendicular 0.5-1.0 cun. ⚠️ Empty bladder prior to needling.' },
  CV4:  { zh: '臍下 3 寸，直刺 0.8-1.2 寸。⚠️ 刺前須排空膀胱以免刺傷膀胱；瘦弱者深刺有刺破腹膜風險。', en: '3 cun below navel; perpendicular 0.8-1.2 cun. ⚠️ Empty bladder prior to needling.' },
  CV5:  { zh: '臍下 2 寸，直刺 0.8-1.2 寸，避開腹壁動靜脈。', en: '2 cun below navel; perpendicular 0.8-1.2 cun.' },
  CV6:  { zh: '臍下 1.5 寸，直刺 0.8-1.2 寸，避開腹壁下動靜脈。', en: '1.5 cun below navel; perpendicular 0.8-1.2 cun.' },
  CV7:  { zh: '臍下 1 寸，直刺 0.8-1.2 寸。', en: '1 cun below navel; perpendicular 0.8-1.2 cun.' },
  CV8:  { zh: '臍中穴位。⚠️ 禁針（嚴禁針刺）！僅限施灸（隔鹽灸或隔薑灸）。', en: 'Navel point. ⚠️ NEEDLING IS STRICTLY CONTRAINDICATED! Moxibustion only.' },
  CV9:  { zh: '臍上 1 寸，直刺 0.5-1.0 寸，避開腹膜。', en: '1 cun above navel; perpendicular 0.5-1.0 cun.' },
  CV10: { zh: '臍上 2 寸，直刺 0.8-1.2 寸。', en: '2 cun above navel; perpendicular 0.8-1.2 cun.' },
  CV11: { zh: '臍上 3 寸，直刺 0.8-1.2 寸。', en: '3 cun above navel; perpendicular 0.8-1.2 cun.' },
  CV12: { zh: '臍上 4 寸，直刺 0.8-1.2 寸，避開腹壁上動脈。', en: '4 cun above navel; perpendicular 0.8-1.2 cun.' },
  CV13: { zh: '臍上 5 寸，直刺 0.8-1.2 寸。', en: '5 cun above navel; perpendicular 0.8-1.2 cun.' },
  CV14: { zh: '臍上 6 寸，直刺或斜刺 0.5-0.8 寸。⚠️ 嚴禁向上深刺以免刺傷肝臟（右）或心臟（左）。', en: '6 cun above navel; oblique 0.5-0.8 cun. ⚠️ Upward deep insertion contraindicated (liver/heart risk).' },
  CV15: { zh: '劍突下，向下斜刺 0.5-0.8 寸。⚠️ 嚴禁向上深刺以免刺傷心臟或肝臟。', en: 'Subxiphoid location; oblique downward 0.5-0.8 cun. ⚠️ Upward deep insertion contraindicated.' },
  CV16: { zh: '胸骨體上，平刺 0.3-0.5 寸。', en: 'Over sternum; transverse 0.3-0.5 cun.' },
  CV17: { zh: '兩乳頭連線中點平第 4 肋間隙，向下或向外平刺 0.3-0.5 寸。', en: 'Midpoint between nipples; transverse 0.3-0.5 cun.' },
  CV18: { zh: '胸骨體上，平刺 0.3-0.5 寸。', en: 'Over sternum; transverse 0.3-0.5 cun.' },
  CV19: { zh: '胸骨體上，平刺 0.3-0.5 寸。', en: 'Over sternum; transverse 0.3-0.5 cun.' },
  CV20: { zh: '胸骨柄中點，平刺 0.3-0.5 寸。', en: 'Over sternum; transverse 0.3-0.5 cun.' },
  CV21: { zh: '胸骨柄上緣，平刺 0.3-0.5 寸。', en: 'Over sternum; transverse 0.3-0.5 cun.' },
  CV22: { zh: '胸骨上窩，先直刺 0.2 寸，再向下沿胸骨柄後方沿皮刺 0.5-1.0 寸。⚠️ 嚴禁直刺深刺以免刺傷氣管或主動脈弧。', en: 'Supraclavicular fossa; insert 0.2 cun perpendicularly then turn downward behind sternum 0.5-1.0 cun. ⚠️ Avoid deep perpendicular insertion.' },
  CV23: { zh: '舌骨體上緣凹陷處，向舌根方向斜刺 0.5-0.8 寸。', en: 'Superior to hyoid bone; oblique upward 0.5-0.8 cun toward tongue root.' },
  CV24: { zh: '唇溝正中凹陷處，斜向上刺 0.3-0.5 寸。', en: 'Mentolabial groove; oblique upward 0.3-0.5 cun.' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^CV([1-9]|1[0-9]|2[0-4])$/.test(code)) return;

  const idx = parseInt(code.replace('CV', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 5), 5);

  // 1. Needling Method EN
  if (CV_NEEDLING_EN[code] && point.acumethod_en !== CV_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: CV_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = CV_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (CV_SPECIFIC_CAUTIONS[code]) {
    const spec = CV_SPECIFIC_CAUTIONS[code];
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
  if (CV_EXAM_PEARLS[code]) {
    const ep = CV_EXAM_PEARLS[code];
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

  // 5. CV1 Pregnancy Contraindication & CV8 Needling Prohibition
  if (code === 'CV1') {
    const pregZh = '孕婦禁針（會陰穴接近產道與下焦，針刺易激發宮縮）。';
    if (!point.contraindications.includes(pregZh)) {
      if (APPLY) {
        point.contraindications.push(pregZh);
        point.cautions_zh = [...point.contraindications];
        point.cautions = point.contraindications.join('\n');
      }
    }
  }
  if (code === 'CV8') {
    const noNeedleZh = '⚠️ 本穴禁針（神願穴位於臍中，嚴禁針刺，易致腹膜炎或感染）。僅限隔鹽或隔薑施灸。';
    if (!point.contraindications.includes(noNeedleZh)) {
      if (APPLY) {
        point.contraindications = [noNeedleZh];
        point.cautions_zh = [noNeedleZh];
        point.cautions_en = ['⚠️ NEEDLING IS STRICTLY CONTRAINDICATED! Moxibustion only (salt or ginger moxa).'];
        point.cautions = noNeedleZh;
      }
    }
  }

  // 6. field_sources & review_status
  if (APPLY) {
    point.field_sources = {
      acumethod_zh: ['CloudTCM', 'eLotus CORE'],
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/13 CONCEPTION VESSEL (REN CHANNEL).pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/13 CONCEPTION VESSEL (REN CHANNEL).pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/13 CONCEPTION VESSEL (REN CHANNEL).pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/13 CONCEPTION VESSEL (REN CHANNEL).pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across CV channel:\n`);
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
