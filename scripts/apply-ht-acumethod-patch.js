/**
 * apply-ht-acumethod-patch.js
 * Minimal patch on top of origin/main:
 *   1. HT1–HT9: replace generic acumethod_en with anatomically-specific text
 *   2. HT2:      add classical forbidden-needling caution (《經穴匯解》)
 *   3. ST17:     fix acumethod_en bug (was generic needling text on a forbidden point)
 *   4. HT1:      remove other_names_zh "極泉,天泉" — 天泉 is PC2, not an alias of HT1
 *
 * Sources: eLotus CORE / MasterTungAcupuncture.org · WHO SAPL 2008 · 《針灸甲乙經》 · 《經穴匯解》
 *
 * Usage:
 *   node scripts/apply-ht-acumethod-patch.js          # dry run
 *   node scripts/apply-ht-acumethod-patch.js --apply  # write
 */

const fs   = require('fs');
const path = require('path');
const FILE  = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// ── Anatomically-specific acumethod_en per point ─────────────────────────────
const HT_NEEDLING_EN = {
  HT1: 'Avoid the axillary artery. Perpendicular or oblique insertion, 0.3–0.5 cun. The brachial plexus (ulnar, median, and medial cutaneous nerves) lies in this region; avoid strong stimulation. Do not needle if local lymph nodes are enlarged.',
  HT2: 'Perpendicular insertion, 0.5–1 cun. The basilic vein and superior ulnar collateral artery run in this region; avoid strong stimulation. NOTE: 《經穴匯解》 records this point as historically forbidden to needle ("禁刺") — exercise clinical caution.',
  HT3: 'Perpendicular insertion, 0.5–1 cun with elbow slightly flexed. The ulnar nerve lies posteriorly; avoid strong stimulation that produces radiating pain down the forearm.',
  HT4: 'Perpendicular insertion, 0.3–0.5 cun. The ulnar artery runs radial to the point; do not needle deeply. The ulnar nerve lies on the ulnar side of the flexor carpi ulnaris tendon.',
  HT5: 'Perpendicular insertion, 0.3–0.5 cun. Located between the ulnar artery (lateral) and the ulnar nerve; avoid deep insertion. The luo-connecting point of the Heart channel.',
  HT6: 'Perpendicular insertion, 0.3–0.5 cun. The ulnar artery and ulnar nerve are nearby; avoid deep insertion. Xi-cleft point — use cautiously in patients on anticoagulants.',
  HT7: 'Perpendicular insertion, 0.3–0.5 cun, medial to the flexor carpi ulnaris tendon. Avoid the ulnar artery which runs immediately lateral to the tendon. The source (yuan) point of the Heart channel.',
  HT8: 'Perpendicular insertion, 0.3–0.5 cun, between the 4th and 5th metacarpal bones. The common palmar digital vessels and nerves are present; avoid excessive depth.',
  HT9: 'Oblique insertion 0.1–0.2 cun directed proximally, or prick to bleed with a three-edged needle. The well (jing) point; pricking is the classic technique for clearing Heart-fire and resuscitation.',
};

// ── HT2 classical caution text ───────────────────────────────────────────────
const HT2_CAUTION_ZH = '《經穴匯解》記載本穴「禁刺」，臨床使用宜謹慎，確認無禁忌後方可施針。';

// ── ST17 forbidden acumethod_en ──────────────────────────────────────────────
const ST17_EN = 'FORBIDDEN: No needling or moxibustion. Used solely as an anatomical chest landmark. Source: 《針灸甲乙經》: "乳中，禁不可刺灸"';

// ── Apply ─────────────────────────────────────────────────────────────────────
const data    = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;

  // HT1–HT9: acumethod_en
  if (HT_NEEDLING_EN[code]) {
    const val = HT_NEEDLING_EN[code];
    if (point.acumethod_en !== val) {
      changes.push({ code, field: 'acumethod_en',
        from: (point.acumethod_en || '').slice(0, 60),
        to:   val.slice(0, 60) });
      if (APPLY) point.acumethod_en = val;
    }
  }

  // HT1: delete other_names_zh (天泉 is PC2)
  if (code === 'HT1' && point.other_names_zh) {
    changes.push({ code, field: 'other_names_zh',
      from: point.other_names_zh,
      to:   '(deleted — 天泉 is PC2, not an alias of HT1)' });
    if (APPLY) delete point.other_names_zh;
  }

  // HT2: add classical caution if not already present
  if (code === 'HT2') {
    const hasIt = (point.contraindications || []).some(c => c.includes('經穴匯解'));
    if (!hasIt) {
      changes.push({ code, field: 'contraindications[]',
        from: '(no classical caution)', to: HT2_CAUTION_ZH });
      if (APPLY) {
        point.contraindications = [...(point.contraindications || []), HT2_CAUTION_ZH];
        point.cautions_zh       = [...(point.cautions_zh       || []), HT2_CAUTION_ZH];
        point.cautions          = (point.cautions ? point.cautions + '\n' : '') + HT2_CAUTION_ZH;
      }
    }
  }

  // ST17: fix forbidden-point bug
  if (code === 'ST17' && point.acumethod_en !== ST17_EN) {
    changes.push({ code, field: 'acumethod_en',
      from: (point.acumethod_en || '').slice(0, 60),
      to:   ST17_EN.slice(0, 60) });
    if (APPLY) point.acumethod_en = ST17_EN;
  }
});

// ── Report ────────────────────────────────────────────────────────────────────
console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s):\n`);
changes.forEach(c => {
  console.log(`  [${c.code}] ${c.field}`);
  console.log(`    FROM: ${c.from}`);
  console.log(`    TO:   ${c.to}\n`);
});

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Written: ${FILE}`);
} else {
  console.log('Run with --apply to write.');
}
