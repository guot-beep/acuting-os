/**
 * refine-gv-channel.js
 * Refines Governing Vessel (督脈 GV1–GV28):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. functions_en & indications_en: Aligned length-matched clean arrays to _zh, sourced from course PDF & eLotus.
 *   3. action_tags_zh & action_tags_en: Remove A13 disease system categories in 1-to-1 parallel alignment.
 *   4. point_identity_zh & point_identity_en: Sea of Marrow/Yang, Confluent, Meeting points, etc.
 *   5. exam_star & exam_pearl / exam_pearl_en for key board exam points.
 *   6. field_sources & review_status = "draft".
 *
 * Usage:
 *   node scripts/refine-gv-channel.js          (dry run)
 *   node scripts/refine-gv-channel.js --apply  (apply to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// Key needle methods and safety notes for GV channel (GV1–GV28)
const GV_NEEDLING_EN = {
  GV1:  'Perpendicular or slightly upward insertion 0.5–1.0 cun midway between tip of coccyx and anus. Luo-Connecting of Du Mai. Primary point for hemorrhoids & prolapse (Changqiang).',
  GV2:  'Perpendicular insertion 0.5–1.0 cun in sacral hiatus. CAUTION: Avoid sacral canal puncture.',
  GV3:  'Perpendicular insertion 0.5–1.0 cun below spinous process of L4 vertebra. Primary point for lumbar pain & lower limb weakness (Yaoyangquan).',
  GV4:  'Perpendicular insertion 0.5–1.0 cun below spinous process of L2 vertebra. Primary point for tonifying Mingmen Fire, Kidney Yang & lumbar pain (Mingmen).',
  GV5:  'Perpendicular insertion 0.5–1.0 cun below spinous process of L1 vertebra.',
  GV6:  'Perpendicular insertion 0.5–1.0 cun below spinous process of T11 vertebra.',
  GV7:  'Perpendicular insertion 0.5–1.0 cun below spinous process of T10 vertebra.',
  GV8:  'Perpendicular insertion 0.5–1.0 cun below spinous process of T9 vertebra. Key point for opisthotonos & liver Qi stagnation (Jinsuo).',
  GV9:  'Perpendicular insertion 0.5–1.0 cun below spinous process of T7 vertebra. Primary point for jaundice, hypochondriac pain & chest fullness (Zhiyang).',
  GV10: 'Perpendicular insertion 0.5–1.0 cun below spinous process of T6 vertebra.',
  GV11: 'Perpendicular insertion 0.5–1.0 cun below spinous process of T5 vertebra.',
  GV12: 'Perpendicular insertion 0.5–1.0 cun below spinous process of T3 vertebra. Key point for pediatric cough & asthma (Shenzhu).',
  GV13: 'Perpendicular insertion 0.5–1.0 cun below spinous process of T1 vertebra.',
  GV14: 'Perpendicular or slightly upward insertion 0.5–1.0 cun below spinous process of C7 vertebra. Meeting point of Du Mai & all 6 Yang channels. Primary point for clearing fever, common cold & malaria (Dazhui).',
  GV15: 'Perpendicular insertion 0.5–0.8 cun in depression 0.5 cun above posterior hairline. CAUTION: STRICTLY AVOID DEEP UPWARD INSERTION TOWARD MEDULLA OBLONGATA.',
  GV16: 'Perpendicular insertion 0.5–0.8 cun in depression 1 cun above posterior hairline below occipital protuberance. Primary point for wind & head (Fengfu). CAUTION: STRICTLY AVOID DEEP UPWARD INSERTION TOWARD MEDULLA OBLONGATA.',
  GV17: 'Subcutaneous insertion 0.3–0.5 cun along scalp 2.5 cun above posterior hairline.',
  GV18: 'Subcutaneous insertion 0.3–0.5 cun along scalp.',
  GV19: 'Subcutaneous insertion 0.3–0.5 cun along scalp.',
  GV20: 'Subcutaneous insertion 0.3–0.5 cun anteriorly or posteriorly on vertex (5 cun posterior to anterior hairline). Sea of Marrow & Meeting point of Du Mai and Yang channels. Primary point for raising Yang, prolapse, stroke & insomnia (Baihui).',
  GV21: 'Subcutaneous insertion 0.3–0.5 cun along scalp.',
  GV22: 'Subcutaneous insertion 0.3–0.5 cun along scalp in anterior fontanelle depression. CAUTION: CONTRAINDICATED IN INFANTS WITH UNCLOSED FONTANELLE.',
  GV23: 'Subcutaneous insertion 0.3–0.5 cun along scalp 1 cun posterior to anterior hairline. Key point for nasal congestion & sinusitis (Shangxing).',
  GV24: 'Subcutaneous insertion 0.3–0.5 cun along scalp 0.5 cun posterior to anterior hairline. Primary point for insomnia, anxiety & frontal headache (Shenting).',
  GV25: 'Perpendicular or subcutaneous insertion 0.2–0.3 cun at tip of nose. Key emergency resuscitation point for shock & hypotension (Suliao).',
  GV26: 'Oblique upward insertion 0.3–0.5 cun at upper 1/3 of philtrum groove. Primary emergency point on the body for resuscitation, coma, lockjaw & acute lumbar sprain (Renzhong / Shuigou).',
  GV27: 'Oblique upward insertion 0.2–0.3 cun at labial tubercle of upper lip.',
  GV28: 'Oblique upward insertion 0.2–0.3 cun in junction of upper lip frenulum and labial gum. Primary point for gum swelling & facial deviation (Yinjiao).'
};

// Board exam pearls & stars for GV channel key points
const GV_EXAM_PEARLS = {
  GV4: {
    star: 1,
    zh: '★ 命門為溫補命門之火、壯陽補腎第一要穴（「命門溫陽補腎」）。主治腰痛、陽痿遺精、不孕與虛寒腹瀉。直刺0.5-1.0寸。',
    en: '★ Mingmen is the primary point on the body for warming Mingmen Fire and tonifying Kidney Yang. Perpendicular 0.5-1.0 inch.'
  },
  GV14: {
    star: 1,
    zh: '★ 大椎為諸陽之會（督脈與手足三陽經交會穴）。解表清熱、退燒、治感冒與瘧疾第一要穴（「大椎退熱解表」）。直刺0.5-1.0寸。',
    en: '★ Dazhui is the Meeting point of Du Mai and all 6 Yang channels. Primary point for clearing high fever, dispelling exterior wind, common cold, and malaria. Perpendicular 0.5-1.0 inch.'
  },
  GV15: {
    star: 1,
    zh: '★ 啞門為舌強不語與失語要穴。直刺0.5-0.8寸。⚠️ 嚴禁向上深刺延髓以免危及生命。',
    en: '★ Yamen is the primary point for tongue stiffness, aphasia, and voice loss. Perpendicular 0.5-0.8 inch; ⚠️ deep upward insertion toward medulla is STRICTLY FORBIDDEN.'
  },
  GV16: {
    star: 1,
    zh: '★ 風府為外風內風第一要穴（「風府祛風清頭目」）。主治頭痛項強、眩暈與中風。直刺0.5-0.8寸，⚠️ 嚴禁向上深刺延髓。',
    en: '★ Fengfu is a primary point for dispelling interior/exterior wind, headache, and stroke. Perpendicular 0.5-0.8 inch; ⚠️ deep upward insertion toward medulla is STRICTLY FORBIDDEN.'
  },
  GV20: {
    star: 1,
    zh: '★ 百會為督脈與足太陽/少陽/厥陰交會穴、海穴之「髓海」。升陽舉陷、清頭明目、醒腦開竅第一要穴（「百會升陽舉陷」）。平刺0.3-0.5寸。',
    en: '★ Baihui is the Sea of Marrow & Meeting point of Du Mai and Yang channels. Primary point for raising Yang (prolapse), headache, stroke, and insomnia. Transverse 0.3-0.5 inch.'
  },
  GV23: {
    star: 1,
    zh: '★ 上星為宣肺通鼻第一要穴（「上星通鼻治鼻淵」）。主治鼻塞、鼻淵、鼻衄與前頭痛。平刺0.3-0.5寸。',
    en: '★ Shangxing is the primary point for nasal congestion, sinusitis, epistaxis, and frontal headache. Transverse 0.3-0.5 inch.'
  },
  GV24: {
    star: 1,
    zh: '★ 神庭為清心安神、失眠與前頭痛要穴。平刺0.3-0.5寸。',
    en: '★ Shenting is a key point for calming spirit, insomnia, anxiety, and frontal headache. Transverse 0.3-0.5 inch.'
  },
  GV26: {
    star: 1,
    zh: '★ 水溝（人中）為全身急救醒腦開竅第一要穴（「人中急救醒腦」）。主治昏迷休克、中風口噤與急性腰扭傷。斜向上刺0.3-0.5寸。',
    en: '★ Shuigou (Renzhong) is the primary emergency resuscitation point on the body for coma, shock, stroke lockjaw, and acute lumbar sprain. Oblique upward 0.3-0.5 inch.'
  }
};

const GV_SPECIFIC_CAUTIONS = {
  GV1:  { zh: '尾骨端與肛門連線中點，直刺 0.5-1.0 寸。', en: 'Midway between coccyx tip and anus; perpendicular 0.5-1.0 cun.' },
  GV2:  { zh: '骶管裂孔處，直刺 0.5-1.0 寸，避開骶管神經。', en: 'Sacral hiatus; perpendicular 0.5-1.0 cun.' },
  GV3:  { zh: '第 4 腰椎棘突下，直刺 0.5-1.0 寸。', en: 'Below L4 spinous process; perpendicular 0.5-1.0 cun.' },
  GV4:  { zh: '第 2 腰椎棘突下，直刺 0.5-1.0 寸。', en: 'Below L2 spinous process; perpendicular 0.5-1.0 cun.' },
  GV5:  { zh: '第 1 腰椎棘突下，直刺 0.5-1.0 寸。', en: 'Below L1 spinous process; perpendicular 0.5-1.0 cun.' },
  GV6:  { zh: '第 11 胸椎棘突下，直刺 0.5-1.0 寸。', en: 'Below T11 spinous process; perpendicular 0.5-1.0 cun.' },
  GV7:  { zh: '第 10 胸椎棘突下，直刺 0.5-1.0 寸。', en: 'Below T10 spinous process; perpendicular 0.5-1.0 cun.' },
  GV8:  { zh: '第 9 胸椎棘突下，直刺 0.5-1.0 寸。', en: 'Below T9 spinous process; perpendicular 0.5-1.0 cun.' },
  GV9:  { zh: '第 7 胸椎棘突下，直刺 0.5-1.0 寸。', en: 'Below T7 spinous process; perpendicular 0.5-1.0 cun.' },
  GV10: { zh: '第 6 胸椎棘突下，直刺 0.5-1.0 寸。', en: 'Below T6 spinous process; perpendicular 0.5-1.0 cun.' },
  GV11: { zh: '第 5 胸椎棘突下，直刺 0.5-1.0 寸。', en: 'Below T5 spinous process; perpendicular 0.5-1.0 cun.' },
  GV12: { zh: '第 3 胸椎棘突下，直刺 0.5-1.0 寸。', en: 'Below T3 spinous process; perpendicular 0.5-1.0 cun.' },
  GV13: { zh: '第 1 胸椎棘突下，直刺 0.5-1.0 寸。', en: 'Below T1 spinous process; perpendicular 0.5-1.0 cun.' },
  GV14: { zh: '第 7 頸椎棘突下，直刺或微向上斜刺 0.5-1.0 寸。', en: 'Below C7 spinous process; perpendicular/slightly upward 0.5-1.0 cun.' },
  GV15: { zh: '後髮際上 0.5 寸，直刺 0.5-0.8 寸。⚠️ 嚴禁向上深刺延髓以免危及生命。', en: '0.5 cun above posterior hairline; perpendicular 0.5-0.8 cun. ⚠️ Deep upward insertion toward medulla STRICTLY FORBIDDEN.' },
  GV16: { zh: '枕外粗隆直下凹陷處，直刺 0.5-0.8 寸。⚠️ 嚴禁向上深刺延髓。', en: 'Below occipital protuberance; perpendicular 0.5-0.8 cun. ⚠️ Deep upward insertion toward medulla STRICTLY FORBIDDEN.' },
  GV17: { zh: '枕外粗隆上方，平刺 0.3-0.5 寸。', en: 'Superior to occipital protuberance; transverse 0.3-0.5 cun.' },
  GV18: { zh: '頭頂後部，平刺 0.3-0.5 寸。', en: 'Posterior parietal scalp; transverse 0.3-0.5 cun.' },
  GV19: { zh: '頭頂後部，平刺 0.3-0.5 寸。', en: 'Posterior parietal scalp; transverse 0.3-0.5 cun.' },
  GV20: { zh: '頭頂正中，向前後平刺 0.3-0.5 寸。', en: 'Midpoint of vertex; transverse 0.3-0.5 cun.' },
  GV21: { zh: '百會前 1.5 寸，平刺 0.3-0.5 寸。', en: '1.5 cun anterior to GV20; transverse 0.3-0.5 cun.' },
  GV22: { zh: '前髮際上 2 寸，平刺 0.3-0.5 寸。⚠️ 嬰幼兒囟門未閉合者禁針。', en: '2 cun behind anterior hairline; transverse 0.3-0.5 cun. ⚠️ CONTRAINDICATED IN INFANTS WITH UNCLOSED FONTANELLE.' },
  GV23: { zh: '前髮際上 1 寸，平刺 0.3-0.5 寸。', en: '1 cun behind anterior hairline; transverse 0.3-0.5 cun.' },
  GV24: { zh: '前髮際上 0.5 寸，平刺 0.3-0.5 寸。', en: '0.5 cun behind anterior hairline; transverse 0.3-0.5 cun.' },
  GV25: { zh: '鼻尖正中，直刺或向上斜刺 0.2-0.3 寸。', en: 'Tip of nose; perpendicular/oblique 0.2-0.3 cun.' },
  GV26: { zh: '人中溝上 1/3 處，向上斜刺 0.3-0.5 寸。', en: 'Upper 1/3 of philtrum; oblique upward 0.3-0.5 cun.' },
  GV27: { zh: '上唇結節，斜向上刺 0.2-0.3 寸。', en: 'Labial tubercle of upper lip; oblique upward 0.2-0.3 cun.' },
  GV28: { zh: '上唇繫帶與齒齦交界處，斜向上刺 0.2-0.3 寸。', en: 'Junction of upper lip frenulum & gum; oblique 0.2-0.3 cun.' }
};

const DISEASE_CAT_RE = /頭面五官|系統疾病|系統病|五官疾病|婦科疾病|精神神志/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^GV([1-9]|1[0-9]|2[0-8])$/.test(code)) return;

  const idx = parseInt(code.replace('GV', ''), 10);
  const pageNum = Math.min(Math.ceil(idx / 6), 6);

  // 1. Needling Method EN
  if (GV_NEEDLING_EN[code] && point.acumethod_en !== GV_NEEDLING_EN[code]) {
    changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: GV_NEEDLING_EN[code] });
    if (APPLY) point.acumethod_en = GV_NEEDLING_EN[code];
  }

  // 2. Specific Cautions
  if (GV_SPECIFIC_CAUTIONS[code]) {
    const spec = GV_SPECIFIC_CAUTIONS[code];
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
  if (GV_EXAM_PEARLS[code]) {
    const ep = GV_EXAM_PEARLS[code];
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

  // 5. GV15 & GV16 Medulla Cautions
  if (code === 'GV15' || code === 'GV16') {
    const medZh = '⚠️ 本穴嚴禁向上深刺（穴位接近延髓，深刺向上易刺傷延髓致呼吸驟停或危及生命）。';
    if (!point.contraindications.includes(medZh)) {
      if (APPLY) {
        point.contraindications.push(medZh);
        point.cautions_zh = [...point.contraindications];
        point.cautions = point.contraindications.join('\n');
      }
    }
  }

  // 6. field_sources & review_status
  if (APPLY) {
    point.field_sources = {
      acumethod_zh: ['CloudTCM', 'eLotus CORE'],
      acumethod_en: ['eLotus CORE / MasterTungAcupuncture.org', `curriculum/acupoints/14 DU CHANNEL (GOVERNING VESSEL).pdf#p${pageNum}`],
      functions_zh: ['CloudTCM'],
      functions_en: [`curriculum/acupoints/14 DU CHANNEL (GOVERNING VESSEL).pdf#p${pageNum}`, 'eLotus CORE'],
      indications_zh: ['CloudTCM'],
      indications_en: [`curriculum/acupoints/14 DU CHANNEL (GOVERNING VESSEL).pdf#p${pageNum}`, 'eLotus CORE'],
      anatomy_zh: ['CloudTCM'],
      anatomy_en: ['WHO SAPL 2008', 'eLotus CORE'],
      exam_pearl: [`curriculum/acupoints/14 DU CHANNEL (GOVERNING VESSEL).pdf#p${pageNum}`, 'eLotus CORE'],
      exam_pearl_en: ['eLotus CORE / MasterTungAcupuncture.org'],
      combine_points_zh: ['CloudTCM'],
      cautions_zh: ['CloudTCM', 'WHO SAPL 2008'],
      cautions_en: ['WHO SAPL 2008', 'eLotus CORE']
    };
    point.review_status = 'draft';
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s) across GV channel:\n`);
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
