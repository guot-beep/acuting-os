/**
 * populate-all-point-identities.js
 * Automatically derives and populates point_identity_zh and point_identity_en
 * for all 361 acupoints based on wushu_point, point_categories, five_shu_element,
 * and canonical TCM point classification rules.
 *
 * Usage:
 *   node scripts/populate-all-point-identities.js          (dry run)
 *   node scripts/populate-all-point-identities.js --apply  (write to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

const WUSHU_ZH_MAP = {
  'jing_well': '井穴',
  'ying_spring': '滎穴',
  'shu_stream': '輸穴',
  'jing_river': '經穴',
  'he_sea': '合穴'
};

const WUSHU_EN_MAP = {
  'jing_well': 'Jing-Well point',
  'ying_spring': 'Ying-Spring point',
  'shu_stream': 'Shu-Stream point',
  'jing_river': 'Jing-River point',
  'he_sea': 'He-Sea point'
};

const ELEMENT_ZH_MAP = {
  'wood': '木穴',
  'fire': '火穴',
  'earth': '土穴',
  'metal': '金穴',
  'water': '水穴'
};

const ELEMENT_EN_MAP = {
  'wood': 'Wood point',
  'fire': 'Fire point',
  'earth': 'Earth point',
  'metal': 'Metal point',
  'water': 'Water point'
};

// Known Master Points / Confluent points of Eight Extraordinary Vessels (八脈交會穴)
const CONFLUENT_MAP = {
  'LU7': { zh: '八脈交會穴（通任脈）', en: 'Confluent/Master point of Ren Mai (Directing Vessel)' },
  'K16': { zh: '八脈交會穴（通陰蹻脈）', en: 'Confluent/Master point of Yin Qiao Mai' },
  'KI6': { zh: '八脈交會穴（通陰蹻脈）', en: 'Confluent/Master point of Yin Qiao Mai' },
  'SP4': { zh: '八脈交會穴（通衝脈）', en: 'Confluent/Master point of Chong Mai (Penetrating Vessel)' },
  'PC6': { zh: '八脈交會穴（通陰維脈）', en: 'Confluent/Master point of Yin Wei Mai' },
  'SI3': { zh: '八脈交會穴（通督脈）', en: 'Confluent/Master point of Du Mai (Governing Vessel)' },
  'UB62': { zh: '八脈交會穴（通陽蹻脈）', en: 'Confluent/Master point of Yang Qiao Mai' },
  'BL62': { zh: '八脈交會穴（通陽蹻脈）', en: 'Confluent/Master point of Yang Qiao Mai' },
  'GB41': { zh: '八脈交會穴（通帶脈）', en: 'Confluent/Master point of Dai Mai (Girdling Vessel)' },
  'TE5': { zh: '八脈交會穴（通陽維脈）', en: 'Confluent/Master point of Yang Wei Mai' },
  'SJ5': { zh: '八脈交會穴（通陽維脈）', en: 'Confluent/Master point of Yang Wei Mai' }
};

// Known Four Command Points (四總穴)
const COMMAND_MAP = {
  'ST36': { zh: '四總穴之一：「肚腹三里留」', en: 'One of Four Command Points: "For abdomen, keep ST36 in reserve"' },
  'LU7':  { zh: '四總穴之一：「頭項尋列缺」', en: 'One of Four Command Points: "For head & neck, look to LU7"' },
  'LI4':  { zh: '四總穴之一：「面口合谷收」', en: 'One of Four Command Points: "For face & mouth, combine with LI4"' },
  'BL40': { zh: '四總穴之一：「腰背委中求」', en: 'One of Four Command Points: "For lower back & spine, seek BL40"' },
  'UB40': { zh: '四總穴之一：「腰背委中求」', en: 'One of Four Command Points: "For lower back & spine, seek BL40"' },
  'PC6':  { zh: '六總穴之一：「胸脅內關謀」', en: 'Command point for chest & hypochondrium (PC6)' },
  'SP6':  { zh: '六總穴之一：「少腹三陰交」', en: 'Command point for lower abdomen & gynecology (SP6)' }
};

// Known Sea Points (四海穴)
const FOUR_SEAS_MAP = {
  'ST36': { zh: '水谷之海（下合穴）', en: 'Sea of Water & Grain (Lower He-Sea point)' },
  'ST30': { zh: '水谷之海', en: 'Sea of Water & Grain' },
  'CV17': { zh: '氣海（膻中）', en: 'Sea of Qi (Danzhong)' },
  'RN17': { zh: '氣海（膻中）', en: 'Sea of Qi (Danzhong)' },
  'GV15': { zh: '髓海（啞門）', en: 'Sea of Marrow (Yamen)' },
  'DU15': { zh: '髓海（啞門）', en: 'Sea of Marrow (Yamen)' },
  'GV16': { zh: '髓海（風府）', en: 'Sea of Marrow (Fengfu)' },
  'DU16': { zh: '髓海（風府）', en: 'Sea of Marrow (Fengfu)' },
  'BL11': { zh: '血海（大杼，八會穴之骨會）', en: 'Sea of Blood (Dashu, Hui-Meeting of Bones)' },
  'UB11': { zh: '血海（大杼，八會穴之骨會）', en: 'Sea of Blood (Dashu, Hui-Meeting of Bones)' },
  'ST37': { zh: '血海（上巨虛）', en: 'Sea of Blood (Shangjuxu)' },
  'ST39': { zh: '血海（下巨虛）', en: 'Sea of Blood (Xiajuxu)' },
  'SP10': { zh: '血海（血證要穴）', en: 'Sea of Blood (Xuehai)' },
  'CV6':  { zh: '氣海（盲之原，補氣第一要穴）', en: 'Sea of Qi (Qihai, Yuan of Fat/Membranes)' },
  'RN6':  { zh: '氣海（盲之原，補氣第一要穴）', en: 'Sea of Qi (Qihai, Yuan of Fat/Membranes)' }
};

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  const existingZh = Array.isArray(point.point_identity_zh) && point.point_identity_zh.length > 0 ? point.point_identity_zh : null;
  const existingEn = Array.isArray(point.point_identity_en) && point.point_identity_en.length > 0 ? point.point_identity_en : null;

  if (existingZh && existingEn) return; // already has explicit identities

  const newZh = [];
  const newEn = [];

  // 1. Check Wushu / Five-Shu
  const cats = point.point_categories || [];
  const wushuStr = point.wushu_point || '';
  const element = point.five_shu_element || '';

  Object.entries(WUSHU_ZH_MAP).forEach(([catKey, zhLabel]) => {
    if (cats.some(c => c.includes(catKey)) || wushuStr.includes(zhLabel)) {
      let elemZh = ELEMENT_ZH_MAP[element] || '';
      let elemEn = ELEMENT_EN_MAP[element] || '';
      newZh.push(elemZh ? `${zhLabel} (${elemZh})` : zhLabel);
      newEn.push(elemEn ? `${WUSHU_EN_MAP[catKey]} (${elemEn})` : WUSHU_EN_MAP[catKey]);
    }
  });

  // 2. Check Yuan, Luo, Xi, Front-Mu, Back-Shu, Lower-He
  if (cats.includes('yuan') || wushuStr.includes('原穴')) {
    if (!newZh.some(s => s.includes('原穴'))) {
      newZh.push('原穴');
      newEn.push('Yuan-Source point');
    }
  }
  if (cats.includes('luo') || wushuStr.includes('絡穴')) {
    if (!newZh.some(s => s.includes('絡穴'))) {
      newZh.push('絡穴');
      newEn.push('Luo-Connecting point');
    }
  }
  if (cats.includes('xi') || wushuStr.includes('郄穴')) {
    if (!newZh.some(s => s.includes('郄穴'))) {
      newZh.push('郄穴');
      newEn.push('Xi-Cleft point');
    }
  }
  if (cats.includes('front_mu') || wushuStr.includes('募穴')) {
    newZh.push('募穴');
    newEn.push('Front-Mu point');
  }
  if (cats.includes('back_shu') || wushuStr.includes('背俞穴')) {
    newZh.push('背俞穴');
    newEn.push('Back-Shu point');
  }
  if (cats.includes('lower_he') || wushuStr.includes('下合穴')) {
    newZh.push('下合穴');
    newEn.push('Lower He-Sea point');
  }

  // 3. Check Confluent / Master Points
  if (CONFLUENT_MAP[code]) {
    if (!newZh.includes(CONFLUENT_MAP[code].zh)) {
      newZh.push(CONFLUENT_MAP[code].zh);
      newEn.push(CONFLUENT_MAP[code].en);
    }
  } else if (cats.includes('confluent') || wushuStr.includes('八脈交會')) {
    if (!newZh.some(s => s.includes('八脈交會'))) {
      newZh.push('八脈交會穴');
      newEn.push('Confluent/Master point of Eight Extraordinary Vessels');
    }
  }

  // 4. Check Command Points
  if (COMMAND_MAP[code]) {
    if (!newZh.includes(COMMAND_MAP[code].zh)) {
      newZh.push(COMMAND_MAP[code].zh);
      newEn.push(COMMAND_MAP[code].en);
    }
  }

  // 5. Check Sea Points
  if (FOUR_SEAS_MAP[code]) {
    if (!newZh.includes(FOUR_SEAS_MAP[code].zh)) {
      newZh.push(FOUR_SEAS_MAP[code].zh);
      newEn.push(FOUR_SEAS_MAP[code].en);
    }
  }

  // Fallback for wushuStr if nothing matched
  if (newZh.length === 0 && wushuStr) {
    wushuStr.split(/[,，]/).forEach(s => {
      const trimmed = s.trim();
      if (trimmed) {
        newZh.push(trimmed);
        newEn.push(trimmed);
      }
    });
  }

  if (newZh.length > 0) {
    changes.push({ code, zh: newZh, en: newEn });
    if (APPLY) {
      point.point_identity_zh = newZh;
      point.point_identity_en = newEn;
    }
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — Populated identity for ${changes.length} point(s):\n`);
changes.slice(0, 35).forEach(c => {
  console.log(`  [${c.code}] ${c.zh.join(' · ')}`);
});
if (changes.length > 35) console.log(`  ... and ${changes.length - 35} more points.`);

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Written to ${FILE}`);
} else {
  console.log('\nRun with --apply to write changes.');
}
