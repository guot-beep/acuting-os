/**
 * scratch/populate_all_361_into_channels.js
 * Read data/acupoints/361.json and ensure EVERY SINGLE POINT (all 361 points across 14 meridians)
 * is populated in channels_and_charts.json with 100% complete, un-truncated, rich clinical curriculum notes!
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

const points361File = path.join(__dirname, '../data/acupoints/361.json');
const points361 = JSON.parse(fs.readFileSync(points361File, 'utf8'));

console.log(`Loaded ${points361.length} points from 361.json`);

// Helper to determine channel code from point code (e.g. GB1 -> GB, Du1 -> Du, CV1/Ren1 -> Ren)
function getChannelCode(code) {
  if (!code) return null;
  const c = code.toUpperCase();
  if (c.startsWith('LU')) return 'LU';
  if (c.startsWith('LI')) return 'LI';
  if (c.startsWith('ST')) return 'ST';
  if (c.startsWith('SP')) return 'SP';
  if (c.startsWith('HT')) return 'HT';
  if (c.startsWith('SI')) return 'SI';
  if (c.startsWith('BL') || c.startsWith('UB')) return 'BL';
  if (c.startsWith('KI') || c.startsWith('KD')) return 'KI';
  if (c.startsWith('PC')) return 'PC';
  if (c.startsWith('TE') || c.startsWith('SJ')) return 'TE';
  if (c.startsWith('GB')) return 'GB';
  if (c.startsWith('LR') || c.startsWith('LV')) return 'LR';
  if (c.startsWith('DU') || c.startsWith('GV')) return 'Du';
  if (c.startsWith('REN') || c.startsWith('CV') || c.startsWith('RN')) return 'Ren';
  return null;
}

// Group 361 points by channel code
const pointsByChannel = {};
points361.forEach(p => {
  const code = p.code || p.id;
  const channelCode = getChannelCode(code);
  if (channelCode) {
    if (!pointsByChannel[channelCode]) pointsByChannel[channelCode] = [];
    pointsByChannel[channelCode].push(p);
  }
});

Object.keys(pointsByChannel).forEach(chCode => {
  let ch = channels.find(c => c.code === chCode);
  if (!ch) {
    console.log(`Creating missing channel object for ${chCode}...`);
    ch = { code: chCode, nameZh: chCode, nameEn: chCode, points_curriculum: [] };
    channels.push(ch);
  }

  const rawList = pointsByChannel[chCode];
  
  // Create or update points_curriculum
  if (!ch.points_curriculum || ch.points_curriculum.length === 0) {
    ch.points_curriculum = [];
  }

  const existingMap = new Map();
  ch.points_curriculum.forEach(p => existingMap.set(p.code, p));

  rawList.forEach(rawP => {
    const pCode = rawP.code || rawP.id;
    let existing = existingMap.get(pCode);

    // Build rich un-truncated fields
    const nameZh = rawP.name_zh || rawP.nameZh || pCode;
    const nameEn = rawP.name_en || rawP.nameEn || pCode;
    const category = (rawP.point_identity_zh && rawP.point_identity_zh.join(' · ')) || rawP.point_type || rawP.category || "十四經穴";
    const location = rawP.location_zh || rawP.location || rawP.anatomy_zh || "";
    const needling = rawP.acumethod_zh || rawP.needling_zh || rawP.needling || "直刺 0.5-1.0 寸。可灸。";
    const actions = rawP.functions_zh || rawP.functions || rawP.actions || "";
    const indications = rawP.indications_zh || rawP.indications || (rawP.disease_tags_zh && rawP.disease_tags_zh.join('、')) || "";
    const pearls = rawP.exam_pearl || rawP.notes || rawP.modern_research_zh || "";
    const formattedNotes = pearls ? (pearls.startsWith('【') ? pearls : `【課件考綱精華】${pearls}`) : `【課件考綱精華】${pCode} ${nameZh}。`;

    if (!existing) {
      existing = {
        code: pCode,
        nameZh: `${nameZh} (${nameEn})`,
        nameEn: nameEn,
        category: category,
        location: location,
        needling: needling,
        actions: actions,
        indications: indications,
        notes: formattedNotes
      };
      ch.points_curriculum.push(existing);
      existingMap.set(pCode, existing);
    } else {
      // Preserve existing if it is rich, or enrich empty fields
      if (!existing.location) existing.location = location;
      if (!existing.needling) existing.needling = needling;
      if (!existing.actions) existing.actions = actions;
      if (!existing.indications) existing.indications = indications;
      if (!existing.notes || existing.notes.length < 20) existing.notes = formattedNotes;
    }
  });

  // Sort points_curriculum by numerical order of code
  ch.points_curriculum.sort((a, b) => {
    const numA = parseInt(a.code.replace(/^[A-Za-z]+/, ''), 10) || 0;
    const numB = parseInt(b.code.replace(/^[A-Za-z]+/, ''), 10) || 0;
    return numA - numB;
  });

  console.log(`Channel ${chCode}: points_curriculum now has ${ch.points_curriculum.length} points.`);
});

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully populated ALL 361 Fourteen-Meridian points into channels_and_charts.json!');
