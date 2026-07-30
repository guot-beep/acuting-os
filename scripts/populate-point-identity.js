/**
 * populate-point-identity.js
 * Populates point_identity_zh and point_identity_en for HT and SP channels
 * based on point_categories, wushu_point, five_shu_element, and standard TCM specifications.
 *
 * Usage:
 *   node scripts/populate-point-identity.js          (dry run)
 *   node scripts/populate-point-identity.js --apply  (write to 361.json)
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const APPLY = process.argv.includes('--apply');

// HT Channel (心經 9穴) identity definitions
const HT_IDENTITIES = {
  HT1: {
    zh: ['手少陰心經第一穴', '腋窩定位標誌'],
    en: ['First point of the Heart channel', 'Anatomical axillary landmark']
  },
  HT2: {
    zh: ['古典禁刺記錄穴（《經穴匯解》）'],
    en: ['Historically recorded as forbidden to needle (《Keiketsu Kaikai》)']
  },
  HT3: {
    zh: ['合穴', '水穴（五輸穴）', '肘部主要取穴'],
    en: ['He-Sea point', 'Water point (Five-Shu)', 'Major elbow point']
  },
  HT4: {
    zh: ['經穴', '金穴（五輸穴）'],
    en: ['Jing-River point', 'Metal point (Five-Shu)']
  },
  HT5: {
    zh: ['絡穴（心經別絡，通小腸經）', '舌病與失語要穴'],
    en: ['Luo-Connecting point (connects to Small Intestine channel)', 'Key point for tongue disorders & aphasia']
  },
  HT6: {
    zh: ['郄穴（心經急症與陰虛盜汗要穴）'],
    en: ['Xi-Cleft point (key point for acute Heart conditions & night sweats)']
  },
  HT7: {
    zh: ['輸穴', '原穴', '土穴（五輸穴/本經子穴）', '安神定志第一要穴', '四總穴之「心」'],
    en: [
      'Shu-Stream point',
      'Yuan-Source point',
      'Earth point (Five-Shu, Child/Sedation point)',
      'Primary point for nourishing Heart & calming spirit',
      'Command point of the Heart'
    ]
  },
  HT8: {
    zh: ['滎穴', '火穴（五輸穴/本經本穴 Horary Point）', '瀉心火要穴'],
    en: [
      'Ying-Spring point',
      'Fire point (Five-Shu, Horary point of Heart channel)',
      'Primary point for clearing Heart fire'
    ]
  },
  HT9: {
    zh: ['井穴', '木穴（五輸穴/本經母穴 Tonification Point）', '急救醒腦復甦要穴'],
    en: [
      'Jing-Well point',
      'Wood point (Five-Shu, Mother/Tonification point)',
      'Emergency resuscitation point'
    ]
  }
};

// SP Channel (脾經 21穴) identity definitions
const SP_IDENTITIES = {
  SP1: {
    zh: ['井穴', '木穴（五輸穴/本經隱白）', '十三鬼穴之「鬼壘」', '止血要穴（脾不統血/崩漏）'],
    en: [
      'Jing-Well point',
      'Wood point (Five-Shu)',
      'One of 13 Ghost Points (Gui Lei)',
      'Essential point for stopping uterine bleeding & Spleen blood containment'
    ]
  },
  SP2: {
    zh: ['滎穴', '火穴（五輸穴/本經母穴 Tonification Point）'],
    en: ['Ying-Spring point', 'Fire point (Five-Shu, Mother/Tonification point)']
  },
  SP3: {
    zh: ['輸穴', '原穴', '土穴（五輸穴/本經本穴 Horary Point）', '健脾要穴'],
    en: [
      'Shu-Stream point',
      'Yuan-Source point',
      'Earth point (Five-Shu, Horary point of Spleen channel)',
      'Primary point for fortifying Spleen Qi'
    ]
  },
  SP4: {
    zh: ['絡穴（脾經別絡，通胃經）', '八脈交會穴（通衝脈）', '配 PC6 內關合治心胸胃病症'],
    en: [
      'Luo-Connecting point (connects to Stomach channel)',
      'Confluent/Master point of Chong Mai (Penetrating Vessel)',
      'Paired with PC6 (Neiguan) for Heart, Chest & Stomach disorders'
    ]
  },
  SP5: {
    zh: ['經穴', '金穴（五輸穴/本經子穴 Sedation Point）'],
    en: ['Jing-River point', 'Metal point (Five-Shu, Child/Sedation point)']
  },
  SP6: {
    zh: ['足三陰經（脾、肝、腎）交會穴', '婦科與生殖要穴', '⚠️ 孕婦禁針'],
    en: [
      'Meeting point of Three Yin channels of the leg (Spleen, Liver, Kidney)',
      'Primary point for gynecological & reproductive disorders',
      'CONTRAINDICATED IN PREGNANCY'
    ]
  },
  SP7: {
    zh: ['足太陰脾經循行穴'],
    en: ['Spleen channel point']
  },
  SP8: {
    zh: ['郄穴（脾經急症與痛經要穴）'],
    en: ['Xi-Cleft point (key point for acute Spleen disorders & dysmenorrhea)']
  },
  SP9: {
    zh: ['合穴', '水穴（五輸穴）', '全身運化水濕第一要穴'],
    en: [
      'He-Sea point',
      'Water point (Five-Shu)',
      'Primary point on body for resolving dampness & edema'
    ]
  },
  SP10: {
    zh: ['血證要穴（血海）', '清熱涼血、活血化瘀要穴'],
    en: ['Sea of Blood (Xuehai)', 'Primary point for clearing blood heat & invigorating blood']
  },
  SP11: {
    zh: ['股部局部穴', '通利小便與腹股溝痛'],
    en: ['Medial thigh point', 'Benefits urination & inguinal pain']
  },
  SP12: {
    zh: ['交會穴（足太陰脾經、足厥陰肝經）', '腹股溝解剖標誌'],
    en: ['Intersection point (Spleen & Liver channels)', 'Inguinal anatomical landmark']
  },
  SP13: {
    zh: ['交會穴（足太陰脾經、陰維脈）'],
    en: ['Intersection point (Spleen channel & Yin Wei Mai)']
  },
  SP14: {
    zh: ['下腹部理氣消脹穴'],
    en: ['Lower abdominal point for Qi stagnation & distension']
  },
  SP15: {
    zh: ['交會穴（足太陰脾經、陰維脈）', '臍旁4寸大腸腹部標誌穴'],
    en: ['Intersection point (Spleen channel & Yin Wei Mai)', 'Abdominal landmark for Large Intestine, 4 cun lateral to navel']
  },
  SP16: {
    zh: ['交會穴（足太陰脾經、陰維脈）'],
    en: ['Intersection point (Spleen channel & Yin Wei Mai)']
  },
  SP17: {
    zh: ['胸腹肋間理氣穴'],
    en: ['Intercostal point for unbinding chest & moving Qi']
  },
  SP18: {
    zh: ['胸部理氣通乳穴'],
    en: ['Chest point for unbinding chest & promoting lactation']
  },
  SP19: {
    zh: ['胸部寬胸理氣穴'],
    en: ['Chest point for unbinding chest & relieving oppression']
  },
  SP20: {
    zh: ['胸部宣肺理氣穴'],
    en: ['Upper chest point for diffusing Lung & unbinding chest']
  },
  SP21: {
    zh: ['脾之大絡（總統全身諸絡）', '胸脅全體疼痛要穴'],
    en: ['Great Luo-Connecting point of the Spleen (connects all Luo vessels)', 'Key point for generalized pain & hypochondriac pain']
  }
};

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const changes = [];

data.forEach(point => {
  const code = point.code;
  let def = null;

  if (HT_IDENTITIES[code]) def = HT_IDENTITIES[code];
  if (SP_IDENTITIES[code]) def = SP_IDENTITIES[code];

  if (def) {
    if (JSON.stringify(point.point_identity_zh) !== JSON.stringify(def.zh)) {
      changes.push({ code, field: 'point_identity_zh', from: point.point_identity_zh, to: def.zh });
      if (APPLY) point.point_identity_zh = def.zh;
    }
    if (JSON.stringify(point.point_identity_en) !== JSON.stringify(def.en)) {
      changes.push({ code, field: 'point_identity_en', from: point.point_identity_en, to: def.en });
      if (APPLY) point.point_identity_en = def.en;
    }
  }
});

console.log(`\n${APPLY ? '✅ APPLIED' : '🔍 DRY RUN'} — ${changes.length} change(s):\n`);
changes.forEach(c => {
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
