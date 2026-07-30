/**
 * refine-bl-channel.js
 * Refines Urinary Bladder Channel (足太陽膀胱經 BL1–BL67):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Back-Shu points, Five-Shu, Yuan, Luo, Xi, Confluent, Four Command, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-bl-channel.js          (dry run)
 *   node scripts/refine-bl-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for BL channel (BL1–BL67)
const BL_NEEDLING_EN = {
  BL1:  'Push eyeball laterally and insert needle perpendicularly 0.3–0.5 cun slowly along the orbital wall. CAUTION: NO LIFTING/THRUSTING OR TWISTING. Apply firm pressure after removal to prevent hematoma.',
  BL2:  'Subcutaneous or transverse insertion 0.3–0.5 cun downwards or laterally.',
  BL3:  'Subcutaneous insertion 0.3–0.5 cun.',
  BL4:  'Subcutaneous insertion 0.3–0.5 cun.',
  BL5:  'Subcutaneous insertion 0.3–0.5 cun.',
  BL6:  'Subcutaneous insertion 0.3–0.5 cun.',
  BL7:  'Subcutaneous insertion 0.3–0.5 cun.',
  BL8:  'Subcutaneous insertion 0.3–0.5 cun.',
  BL9:  'Subcutaneous insertion 0.3–0.5 cun.',
  BL10: 'Perpendicular or oblique insertion 0.5–0.8 cun. Window of Sky point. CAUTION: Avoid deep insertion toward spinal cord.',
  BL11: 'Oblique insertion 0.5–0.8 cun toward the spine. Hui-Meeting of Bones. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL12: 'Oblique insertion 0.5–0.8 cun toward the spine. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL13: 'Oblique insertion 0.5–0.8 cun toward the spine. Back-Shu of Lung. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL14: 'Oblique insertion 0.5–0.8 cun toward the spine. Back-Shu of Pericardium. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL15: 'Oblique insertion 0.5–0.8 cun toward the spine. Back-Shu of Heart. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL16: 'Oblique insertion 0.5–0.8 cun toward the spine. Back-Shu of Governor. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL17: 'Oblique insertion 0.5–0.8 cun toward the spine. Hui-Meeting of Blood & Back-Shu of Diaphragm. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL18: 'Oblique insertion 0.5–0.8 cun toward the spine. Back-Shu of Liver. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL19: 'Oblique insertion 0.5–0.8 cun toward the spine. Back-Shu of Gallbladder. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL20: 'Oblique insertion 0.5–0.8 cun toward the spine. Back-Shu of Spleen. CAUTION: Deep perpendicular insertion risks pneumothorax in thoracic region.',
  BL21: 'Oblique insertion 0.5–0.8 cun toward the spine. Back-Shu of Stomach. CAUTION: Deep perpendicular insertion risks pneumothorax in thoracic region.',
  BL22: 'Oblique or perpendicular insertion 0.5–1.0 cun. Back-Shu of San Jiao. CAUTION: Avoid deep renal puncture.',
  BL23: 'Perpendicular insertion 0.5–1.0 cun. Back-Shu of Kidney. CAUTION: Deep perpendicular insertion risks puncturing the kidney.',
  BL24: 'Perpendicular insertion 0.5–1.0 cun.',
  BL25: 'Perpendicular insertion 0.8–1.2 cun. Back-Shu of Large Intestine.',
  BL26: 'Perpendicular insertion 0.8–1.2 cun.',
  BL27: 'Perpendicular insertion 0.8–1.2 cun. Back-Shu of Small Intestine.',
  BL28: 'Perpendicular insertion 0.8–1.2 cun. Back-Shu of Bladder.',
  BL29: 'Perpendicular insertion 0.8–1.2 cun.',
  BL30: 'Perpendicular insertion 0.8–1.2 cun.',
  BL31: 'Perpendicular insertion 1.0–1.5 cun into the 1st sacral foramen.',
  BL32: 'Perpendicular insertion 1.0–1.5 cun into the 2nd sacral foramen.',
  BL33: 'Perpendicular insertion 1.0–1.5 cun into the 3rd sacral foramen.',
  BL34: 'Perpendicular insertion 1.0–1.5 cun into the 4th sacral foramen.',
  BL35: 'Perpendicular or oblique insertion 0.5–1.0 cun.',
  BL36: 'Perpendicular insertion 1.0–2.0 cun.',
  BL37: 'Perpendicular insertion 1.0–2.0 cun.',
  BL38: 'Perpendicular or oblique insertion 0.5–1.0 cun.',
  BL39: 'Perpendicular insertion 0.5–1.0 cun. Lower He-Sea of San Jiao.',
  BL40: 'Perpendicular insertion 1.0–1.5 cun, or prick popliteal vein to cause bleeding. He-Sea & Lower He-Sea of Bladder; Four Command point for back.',
  BL41: 'Oblique insertion 0.5–0.8 cun toward the spine. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL42: 'Oblique insertion 0.5–0.8 cun toward the spine. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL43: 'Oblique insertion 0.5–0.8 cun toward the spine. Key point for deficiency & exhaustion. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL44: 'Oblique insertion 0.5–0.8 cun toward the spine. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL45: 'Oblique insertion 0.5–0.8 cun toward the spine. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL46: 'Oblique insertion 0.5–0.8 cun toward the spine. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL47: 'Oblique insertion 0.5–0.8 cun toward the spine. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL48: 'Oblique insertion 0.5–0.8 cun toward the spine. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL49: 'Oblique insertion 0.5–0.8 cun toward the spine. CAUTION: Deep perpendicular insertion risks pneumothorax in thoracic region.',
  BL50: 'Oblique insertion 0.5–0.8 cun toward the spine. CAUTION: Deep perpendicular insertion risks pneumothorax in thoracic region.',
  BL51: 'Oblique insertion 0.5–0.8 cun. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  BL52: 'Perpendicular insertion 0.5–1.0 cun. CAUTION: Deep perpendicular insertion risks puncturing the kidney.',
  BL53: 'Perpendicular insertion 0.8–1.2 cun.',
  BL54: 'Perpendicular insertion 1.5–2.5 cun for sciatica.',
  BL55: 'Perpendicular insertion 1.0–1.5 cun.',
  BL56: 'Perpendicular insertion 1.0–1.5 cun.',
  BL57: 'Perpendicular insertion 1.0–2.0 cun. Key point for hemorrhoids & calf cramps.',
  BL58: 'Perpendicular insertion 0.7–1.0 cun. Luo-Connecting point.',
  BL59: 'Perpendicular insertion 0.5–1.0 cun. Xi-Cleft of Yang Qiao Mai.',
  BL60: 'Perpendicular insertion 0.5–0.8 cun behind medial malleolus. Jing-River (Fire) point. CAUTION: CONTRAINDICATED IN PREGNANCY.',
  BL61: 'Perpendicular insertion 0.3–0.5 cun.',
  BL62: 'Perpendicular or oblique insertion 0.3–0.5 cun in depression below lateral malleolus. Confluent point of Yang Qiao Mai.',
  BL63: 'Perpendicular insertion 0.3–0.5 cun. Xi-Cleft of Bladder channel.',
  BL64: 'Perpendicular insertion 0.3–0.5 cun. Yuan-Source point of Bladder channel.',
  BL65: 'Perpendicular insertion 0.3–0.5 cun. Shu-Stream (Wood) point.',
  BL66: 'Perpendicular insertion 0.3–0.5 cun. Ying-Spring (Water) point.',
  BL67: 'Subcutaneous insertion 0.1 cun, or moxibustion. Jing-Well (Metal) point. Primary point for breech fetal presentation.'
};

// Exam pearls & stars for BL channel key points
const BL_EXAM_PEARLS = {
  BL1: {
    star: 1,
    zh: '★ 晴明為眼睛解剖第一要穴。推開眼球，沿眼眶壁直刺0.3-0.5寸，嚴禁提插捏轉，出針按壓止血防血腫。',
    en: '★ Jingming is the primary eye point. Push eyeball laterally and insert 0.3-0.5 inch along orbital wall. NO LIFTING/THRUSTING OR TWISTING. Apply firm pressure after removal to prevent hematoma.'
  },
  BL10: {
    star: 1,
    zh: '★ 天柱為天窗穴（Window of Sky Point），主治頭項強痛、後頭痛、目赤與咽喉痛。直刺或斜刺0.5-0.8寸，不可深刺延髓。',
    en: '★ Tianzhu is a Window of Sky point for stiff neck, occipital headache, red eyes, and sore throat. Needle 0.5-0.8 inch; avoid deep insertion toward medulla.'
  },
  BL11: {
    star: 1,
    zh: '★ 大杼為八會穴之「骨會」，海穴之一（血海）。斜刺0.5-0.8寸，不可深刺防止氣胸。',
    en: '★ Dashu is the Hui-Meeting point of Bones and a Sea of Blood point. Oblique insertion 0.5-0.8 inch; avoid deep perpendicular insertion to prevent pneumothorax.'
  },
  BL13: {
    star: 1,
    zh: '★ 肺俞為肺之背俞穴。宣肺平喘、補肺氣第一要穴。斜刺0.5-0.8寸向脊柱方向，嚴禁直刺深刺以免致氣胸。',
    en: '★ Feishu is the Back-Shu point of Lung. Primary point for tonifying Lung Qi and relieving asthma. Oblique insertion 0.5-0.8 inch toward spine; deep perpendicular insertion contraindicated due to pneumothorax risk.'
  },
  BL15: {
    star: 1,
    zh: '★ 心俞為心之背俞穴。養心安神、通心陽第一要穴，主治心悸、失眠、健忘與癲狂。斜刺0.5-0.8寸。',
    en: '★ Xinshu is the Back-Shu point of Heart. Primary point for nourishing Heart Qi/Blood and calming spirit (palpitations, insomnia, memory loss). Oblique insertion 0.5-0.8 inch.'
  },
  BL17: {
    star: 1,
    zh: '★ 膈俞為八會穴之「血會」，活血化瘀、養血止血第一要穴（「血會膈俞」）。斜刺0.5-0.8寸。',
    en: '★ Geshu is the Hui-Meeting point of Blood. Primary point for all blood disorders (blood stasis, anemia, hemorrhage). Oblique insertion 0.5-0.8 inch.'
  },
  BL18: {
    star: 1,
    zh: '★ 肝俞為肝之背俞穴。疏肝理氣、養肝明目要穴，主治黃疸、脅痛、目疾與肝氣鬱結。斜刺0.5-0.8寸。',
    en: '★ Ganshu is the Back-Shu point of Liver. Primary point for coursing Liver Qi, resolving damp-heat, and benefiting eyes. Oblique insertion 0.5-0.8 inch.'
  },
  BL20: {
    star: 1,
    zh: '★ 脾俞為脾之背俞穴。健脾益氣、運化水濕第一要穴，主治腹脹、腹瀉、水腫與脾虛證。斜刺0.5-0.8寸。',
    en: '★ Pishu is the Back-Shu point of Spleen. Primary point for fortifying Spleen Qi and resolving dampness/edema. Oblique insertion 0.5-0.8 inch.'
  },
  BL23: {
    star: 1,
    zh: '★ 腎俞為腎之背俞穴。補腎填精、壯陽滋陰第一要穴，主治腰痛、遺精、陽痿、耳鳴耳聾與水腫。直刺0.5-1.0寸，注意避免刺傷腎臟。',
    en: '★ Shenshu is the Back-Shu point of Kidney. Primary point for tonifying Kidney Essence, Yang, and Yin (lumbar pain, tinnitus, impotence, edema). Perpendicular 0.5-1.0 inch; avoid deep renal puncture.'
  },
  BL25: {
    star: 1,
    zh: '★ 大腸俞為大腸之背俞穴。理腸通便、止瀉止痛第一要穴。直刺0.8-1.2寸。',
    en: '★ Dachangshu is the Back-Shu point of Large Intestine. Primary point for bowel regulation, constipation, and diarrhea. Perpendicular 0.8-1.2 inch.'
  },
  BL28: {
    star: 1,
    zh: '★ 膀胱俞為膀胱之背俞穴。通利膀胱、清熱利濕止淋要穴。直刺0.8-1.2寸。',
    en: '★ Pangguangshu is the Back-Shu point of Bladder. Primary point for clearing Bladder damp-heat and Strangury. Perpendicular 0.8-1.2 inch.'
  },
  BL39: {
    star: 1,
    zh: '★ 委陽為三焦之下合穴。通利三焦水道與小腹脹痛要穴。直刺0.5-1.0寸。',
    en: '★ Weiyang is the Lower He-Sea point of San Jiao. Key point for regulating San Jiao fluid passages and lower abdominal pain. Perpendicular 0.5-1.0 inch.'
  },
  BL40: {
    star: 1,
    zh: '★ 委中為合穴（土）、膀胱下合穴。四總穴之一：「腰背委中求」。腰背急症、腰肌勞損第一要穴，可點刺蠐靜脈出血。直刺1.0-1.5寸。',
    en: '★ Weizhong is the He-Sea and Lower He-Sea point of Bladder. One of Four Command Points: "For lower back & spine, seek BL40". Primary point for lumbar pain; bleed popliteal vein for acute heat/stasis. Perpendicular 1.0-1.5 inch.'
  },
  BL57: {
    star: 1,
    zh: '★ 承山為治療痔疾（痔瘡出血）與小腿腓腸肌痙攣抽筋第一要穴。直刺1.0-2.0寸。',
    en: '★ Chengshan is the primary point for hemorrhoids (bleeding) and calf muscle cramps/spasms. Perpendicular 1.0-2.0 inch.'
  },
  BL58: {
    star: 1,
    zh: '★ 飛揚為絡穴（通腎經），主治腰腿痛、頭痛、目眩與痔疾。直刺0.7-1.0寸。',
    en: '★ Feiyang is the Luo-Connecting point (connects to Kidney channel). Key point for lumbar/leg pain, headache, and hemorrhoids. Perpendicular 0.7-1.0 inch.'
  },
  BL60: {
    star: 1,
    zh: '★ 崑崙為經穴（火），主治腰痛、跟痛、頭痛與難產催生。⚠️ 孕婦禁針。直刺0.5-0.8寸。',
    en: '★ Kunlun is the Jing-River (Fire) point for lumbar pain, heel pain, headache, and promoting labor. ⚠️ CONTRAINDICATED IN PREGNANCY. Perpendicular 0.5-0.8 inch.'
  },
  BL62: {
    star: 1,
    zh: '★ 申脈為八脈交會穴之一（通陽蹻脈），配手太陽後谿SI3治療頭項強痛、脊背痛與失眠症。直刺或斜刺0.3-0.5寸。',
    en: '★ Shenmai is the Confluent/Master point of Yang Qiao Mai. Paired with SI3 (Houxi) for neck, spinal pain, and insomnia. Needle 0.3-0.5 inch.'
  },
  BL67: {
    star: 1,
    zh: '★ 至陰為井穴（金）。矯正胎位第一要穴（至陰艾灸溫灸）。淺刺0.1寸或艾灸。',
    en: '★ Zhiyin is the Jing-Well (Metal) point. Primary point on the body for correcting breech fetal presentation via moxibustion. Subcutaneous 0.1 inch or moxa.'
  }
};

const DISEASE_CAT_RE = /系統疾病|系統病|五官疾病/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^BL([1-9]|[1-5][0-9]|6[0-7])$/.test(code)) return;

  const idx = parseInt(code.replace('BL', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 10), 7);

  // 1. Needling Method EN
  if (BL_NEEDLING_EN[code] && point.acumethod_en !== BL_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: BL_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = BL_NEEDLING_EN[code];
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
  if (BL_EXAM_PEARLS[code]) {
    const ep = BL_EXAM_PEARLS[code];
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

  // 4. Pregnancy Contraindication for BL60
  if (code === 'BL60') {
    const pregZh = '孕婦禁針（崑崙穴具催生下胎之力）';
    if (!point.contraindications.includes(pregZh)) {
      if (APPLY) {
        point.contraindications.push(pregZh);
        point.cautions_zh = [...point.contraindications];
        point.cautions = point.contraindications.join('\n');
      }
    }
  }

  // 5. field_sources & review_status
  if (APPLY) {
    point.field_sources = {
      acumethod_zh: ['CloudTCM', 'eLotus CORE'],
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/7 URINARY BLADDER CHANNEL OF FOOT TAI YANG.pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/7 URINARY BLADDER CHANNEL OF FOOT TAI YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/7 URINARY BLADDER CHANNEL OF FOOT TAI YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/7 URINARY BLADDER CHANNEL OF FOOT TAI YANG.pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across BL channel:\n`);
changes.slice(0, 30).forEach(c => {
  console.log(`  [${c.code}] ${c.field}`);
  console.log(`    FROM: ${JSON.stringify(c.from)}`);
  console.log(`    TO:   ${JSON.stringify(c.to)}\n`);
});
if (changes.length > 30) console.log(`  ... and ${changes.length - 30} more changes.`);

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Written to ${FILE}`);
} else {
  console.log('Run with --apply to write changes.');
}
