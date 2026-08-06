/**
 * scratch/deduplicate_and_normalize_channel_points.js
 * Normalize all point codes in points_curriculum across 14 meridians and deduplicate:
 * - DU / GV -> DU (DU1..DU28)
 * - CV / RN / REN -> REN (REN1..REN24)
 * - UB -> BL (BL1..BL67)
 * - KD -> KI (KI1..KI27)
 * - SJ -> TE (TE1..TE23)
 * - LV -> LR (LR1..LR14)
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

channels.forEach(ch => {
  if (!ch.points_curriculum || ch.points_curriculum.length === 0) return;

  const pointMap = new Map();

  ch.points_curriculum.forEach(p => {
    let canonicalCode = p.code;
    canonicalCode = canonicalCode.replace(/^GV/, 'DU').replace(/^CV/, 'REN').replace(/^RN/, 'REN')
                                 .replace(/^UB/, 'BL').replace(/^KD/, 'KI').replace(/^SJ/, 'TE')
                                 .replace(/^LV/, 'LR');

    p.code = canonicalCode;

    if (!pointMap.has(canonicalCode)) {
      pointMap.set(canonicalCode, p);
    } else {
      // Merge rich properties into existing record
      const existing = pointMap.get(canonicalCode);
      if ((!existing.notes || existing.notes.length < 30) && p.notes && p.notes.length >= 30) {
        existing.notes = p.notes;
      }
      if ((!existing.indications || existing.indications.length < 10) && p.indications) {
        existing.indications = p.indications;
      }
      if (!existing.location && p.location) existing.location = p.location;
      if (!existing.actions && p.actions) existing.actions = p.actions;
    }
  });

  ch.points_curriculum = Array.from(pointMap.values());

  // Sort by number
  ch.points_curriculum.sort((a, b) => {
    const numA = parseInt(a.code.replace(/^[A-Za-z]+/, ''), 10) || 0;
    const numB = parseInt(b.code.replace(/^[A-Za-z]+/, ''), 10) || 0;
    return numA - numB;
  });

  console.log(`${ch.code} (${ch.nameZh}): deduplicated count = ${ch.points_curriculum.length}`);
});

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully normalized and deduplicated all points_curriculum!');
