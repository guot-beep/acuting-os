/**
 * refine-sp-channel.js
 * Refines SP channel (足太陰脾經 SP1–SP21):
 *   1. acumethod_en: Per-point specific anatomical depth, angle, and safety precautions.
 *   2. action_tags_zh / action_tags_en: Remove disease system category strings (A13)
 *      from action_tags in 1-to-1 index-aligned fashion, keeping _zh and _en lengths matched.
 *   3. Move removed category tags into disease_tags_zh / disease_tags_en if not already present.
 *   4. SP6 contraindications: Ensure pregnancy caution is explicit.
 *   5. Keep cautions string and cautions_zh array in sync with contraindications.
 *
 * Usage:
 *   node scripts/refine-sp-channel.js          (dry run)
 *   node scripts/refine-sp-channel.js --apply  (apply changes to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

const SP_NEEDLING_EN = {
  SP1: 'Subcutaneous or oblique insertion 0.1 cun directed proximally, or prick to bleed with a three-edged needle. Jing-Well (Wood) point.',
  SP2: 'Perpendicular insertion 0.3–0.5 cun along the medial border of the first metatarsophalangeal joint. Ying-Spring (Fire) point.',
  SP3: 'Perpendicular insertion 0.5–0.8 cun in the depression proximal to the head of the first metatarsal bone. Shu-Stream, Yuan-Source (Earth/Horary) point.',
  SP4: 'Perpendicular insertion 0.5–1.0 cun in the depression distal and inferior to the base of the first metatarsal bone. Luo-Connecting point and Master point of Chong Mai.',
  SP5: 'Perpendicular insertion 0.3–0.5 cun in the depression anterior and inferior to the medial malleolus. Jing-River (Metal) point.',
  SP6: 'Perpendicular insertion 1.0–1.5 cun, 3 cun superior to the tip of the medial malleolus behind the medial border of the tibia. CONTRAINDICATED IN PREGNANCY (promotes labor).',
  SP7: 'Perpendicular insertion 1.0–1.5 cun, 6 cun superior to the tip of the medial malleolus along the medial border of the tibia.',
  SP8: 'Perpendicular insertion 1.0–1.5 cun, 3 cun inferior to SP9. Xi-Cleft point of the Spleen channel.',
  SP9: 'Perpendicular insertion 1.0–1.5 cun in the depression inferior to the medial condyle of the tibia. He-Sea (Water) point.',
  SP10: 'Perpendicular insertion 1.0–1.5 cun, 2 cun superior to the medial-superior border of the patella on the vastus medialis muscle.',
  SP11: 'Perpendicular or oblique insertion 0.5–1.0 cun, 6 cun superior to SP10. CAUTION: Avoid the femoral artery and vein running nearby laterally.',
  SP12: 'Perpendicular insertion 0.5–1.0 cun in the inguinal groove, 3.5 cun lateral to CV2. CAUTION: Palpate and avoid the femoral artery running laterally; avoid deep peritoneal puncture.',
  SP13: 'Perpendicular insertion 0.5–1.0 cun, 0.7 cun superior and lateral to SP12. CAUTION: Avoid deep perpendicular insertion into the peritoneal cavity.',
  SP14: 'Perpendicular insertion 0.5–1.0 cun, 1.3 cun inferior to SP15. CAUTION: Avoid deep perpendicular insertion into the peritoneal cavity.',
  SP15: 'Perpendicular insertion 1.0–1.5 cun, 4 cun lateral to the center of the umbilicus. CAUTION: Avoid deep insertion into peritoneal cavity / abdominal organs in thin patients.',
  SP16: 'Perpendicular insertion 0.5–1.0 cun, 3 cun superior to SP15. CAUTION: Avoid deep perpendicular insertion into the peritoneal cavity.',
  SP17: 'Transverse or oblique insertion 0.5–0.8 cun along the 5th intercostal space. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  SP18: 'Transverse or oblique insertion 0.5–0.8 cun along the 4th intercostal space. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  SP19: 'Transverse or oblique insertion 0.5–0.8 cun along the 3rd intercostal space. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  SP20: 'Transverse or oblique insertion 0.5–0.8 cun along the 2nd intercostal space. CAUTION: Deep perpendicular insertion risks pneumothorax.',
  SP21: 'Transverse or oblique insertion 0.5–0.8 cun along the 6th intercostal space on the mid-axillary line. Great Luo-Connecting point of the Spleen. CAUTION: Deep perpendicular insertion risks pneumothorax.'
};

const DISEASE_CAT_RE = /系統疾病|系統病|五官疾病/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  if (!/^SP([1-9]|1[0-9]|2[0-1])$/.test(code)) return;

  // 1. acumethod_en update
  if (SP_NEEDLING_EN[code]) {
    const newVal = SP_NEEDLING_EN[code];
    if (point.acumethod_en !== newVal) {
      changes.push({ code, field: 'acumethod_en', from: point.acumethod_en, to: newVal });
      if (APPLY) point.acumethod_en = newVal;
    }
  }

  // 2. Clean A13 disease categories from action_tags_zh and action_tags_en in parallel
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
      changes.push({
        code,
        field: 'action_tags_zh/en (removed system categories)',
        from: movedZh.join(', '),
        to: newZh.join(', ')
      });

      if (APPLY) {
        point.action_tags_zh = newZh;
        point.action_tags_en = newEn;
        point.acu_tags = newZh;
        point.action_tags = newEn;

        // Move into disease_tags if not already present
        if (!Array.isArray(point.disease_tags_zh)) point.disease_tags_zh = [];
        if (!Array.isArray(point.disease_tags_en)) point.disease_tags_en = [];

        movedZh.forEach((dz, idx) => {
          if (!point.disease_tags_zh.includes(dz)) {
            point.disease_tags_zh.push(dz);
            if (movedEn[idx] && !point.disease_tags_en.includes(movedEn[idx])) {
              point.disease_tags_en.push(movedEn[idx]);
            }
          }
        });
      }
    }
  }

  // 3. Ensure SP6 contraindications has explicit pregnancy caution if missing
  if (code === 'SP6') {
    const pregZh = '孕婦禁針（可引產催生）';
    if (!point.contraindications.some(c => c.includes('孕'))) {
      changes.push({ code, field: 'contraindications[]', from: point.contraindications.join('; '), to: pregZh });
      if (APPLY) {
        point.contraindications.push(pregZh);
      }
    }
  }

  // 4. Sync cautions string & cautions_zh array with contraindications
  const contras = point.contraindications || [];
  if (contras.length > 0) {
    if (APPLY) {
      point.cautions_zh = [...contras];
      point.cautions = contras.join('\n');
    }
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s):\n`);
changes.forEach(c => {
  console.log(`  [${c.code}] ${c.field}`);
  console.log(`    FROM: ${c.from}`);
  console.log(`    TO:   ${c.to}\n`);
});

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Written to ${FILE}`);
} else {
  console.log('Run with --apply to write changes.');
}
