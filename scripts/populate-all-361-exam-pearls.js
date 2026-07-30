/**
 * populate-all-361-exam-pearls.js
 * Populates high-yield Board Exam Pearls (exam_pearl, exam_pearl_en, exam_star, exam_importance)
 * for all 361 acupuncture points in data/acupoints/361.json.
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const TEMP_FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json.tmp');

const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// High-Yield Board Exam Pearl Generators
function generateExamPearlZh(point) {
  const code = point.code;
  const nameZh = point.nameZh || point.chinese || '';
  const identity = Array.isArray(point.point_identity_zh) ? point.point_identity_zh.join('、') : '';
  const fns = Array.isArray(point.functions_zh) ? point.functions_zh.slice(0, 3).join('；') : (point.functions || '');
  const cautions = point.cautions_zh || point.cautions || '';

  let star = 1;
  let pearl = '';
  let importance = 'NCCAOM / US Acupuncture Board Exam Focus';

  if (/井穴|滎穴|輸穴|經穴|合穴|原穴|絡穴|郄穴|募穴|背俞穴|八脈交會|四總穴|下合穴|八會穴/.test(identity)) {
    star = 2;
  }

  if (identity.includes('四總穴')) {
    star = 3;
    pearl = `**${nameZh}（${code}）** 為 **${identity}**。考試極高頻出題：主治相應區域核心病症，臨床配伍與定位為必考重點。`;
  } else if (identity.includes('八脈交會')) {
    star = 3;
    pearl = `**${nameZh}（${code}）** 為 **${identity}**。考點：奇經八脈交會通穴與對應配穴（如 SI3 配 BL62、LU7 配 KI6、PC6 配 SP4、TE5 配 GB41）。`;
  } else if (identity.includes('原穴') || identity.includes('絡穴') || identity.includes('郄穴')) {
    star = 2;
    pearl = `**${nameZh}（${code}）** 具 **${identity}** 身分。考點：原穴補瀉本經臟腑、絡穴連絡表裡經、郄穴主治本經急症與出血證。`;
  } else if (identity.includes('背俞穴') || identity.includes('募穴')) {
    star = 2;
    pearl = `**${nameZh}（${code}）** 為 **${identity}**。考點：陰病行陽（背俞穴治五臟病）、陽病行陰（募穴治六腑病），俞募配穴法為板考高頻題。`;
  } else if (identity.includes('五輸穴') || identity.includes('井穴') || identity.includes('滎穴') || identity.includes('輸穴') || identity.includes('經穴') || identity.includes('合穴')) {
    star = 2;
    pearl = `**${nameZh}（${code}）** 為 **${identity}**。考點：五輸穴五行相生母子補瀉法（井主心下滿、滎主身熱、輸主體重節痛、經主喘咳寒熱、合主逆氣而洩）。`;
  } else {
    pearl = `**${nameZh}（${code}）**：${fns || '本經常用要穴'}。考點：解剖定位、針刺深度角度與解剖安全注意事項。`;
  }

  if (cautions.includes('氣胸')) {
    star = 3;
    pearl += ` ⚠️ **解剖安全考點：嚴禁直刺深刺，防氣胸風險。**`;
  } else if (cautions.includes('孕婦')) {
    star = 3;
    pearl += ` ⚠️ **解剖安全考點：孕婦禁針/慎針。**`;
  }

  return { pearl, importance, star };
}

function generateExamPearlEn(point, pearlZh) {
  const code = point.code;
  const nameEn = point.nameEn || point.pinyin || '';
  const identityEn = Array.isArray(point.point_identity_en) ? point.point_identity_en.join(', ') : '';

  if (point.cautions_zh && point.cautions_zh.includes('氣胸')) {
    return `High-Yield Board Pearl (${code} ${nameEn}): **${identityEn || 'Key Channel Point'}**. High-yield board exam topic: primary indications, local anatomical landmarks, and **CRITICAL SAFETY WARNING: avoid deep perpendicular insertion to prevent pneumothorax.**`;
  }
  if (point.cautions_zh && point.cautions_zh.includes('孕婦')) {
    return `High-Yield Board Pearl (${code} ${nameEn}): **${identityEn || 'Key Channel Point'}**. High-yield board exam topic: primary indications and **CONTRAINDICATION IN PREGNANCY.**`;
  }
  return `High-Yield Board Pearl (${code} ${nameEn}): **${identityEn || 'Standard Channel Point'}**. Core NCCAOM exam focus: point location landmarks, special point classifications, and clinical indications.`;
}

let populatedCount = 0;

db.forEach(p => {
  if (!p.exam_pearl && !p.examPearl) {
    const { pearl, importance, star } = generateExamPearlZh(p);
    p.exam_pearl = pearl;
    p.examPearl = pearl;
    p.exam_importance = importance;
    p.examImportance = importance;
    if (!p.exam_star && !p.examStar) {
      p.exam_star = star;
      p.examStar = star;
    }
    populatedCount++;
  }
  if (!p.exam_pearl_en && !p.examPearlEn) {
    const pearlEn = generateExamPearlEn(p, p.exam_pearl || p.examPearl);
    p.exam_pearl_en = pearlEn;
    p.examPearlEn = pearlEn;
  }

  // Dual alias normalization
  if (p.exam_pearl) p.examPearl = p.exam_pearl;
  if (p.exam_pearl_en) p.examPearlEn = p.exam_pearl_en;
  if (p.exam_importance) p.examImportance = p.exam_importance;
  if (p.exam_star) p.examStar = p.exam_star;
});

console.log(`Populated Board Exam Pearls for ${populatedCount} point(s).`);

fs.writeFileSync(TEMP_FILE, JSON.stringify(db, null, 2), 'utf8');
fs.renameSync(TEMP_FILE, FILE);
console.log(`Written to ${FILE}`);
