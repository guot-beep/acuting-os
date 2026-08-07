const fs = require('fs');
const path = require('path');

const outlineText = fs.readFileSync(path.join(__dirname, '../curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.md'), 'utf8');

const lines = outlineText.split('\n');

const appendixCLines = lines.slice(615, 872);
const rawFormulas = [];

appendixCLines.forEach(l => {
  const line = l.trim();
  if (!line || line.startsWith('##') || line.startsWith('Appendix') || line.includes('NCBAHM') || line.includes('Content Outline') || line.includes('Please Note') || line.includes('Candidates') || line.includes('Formulas on this list')) return;
  if (line.includes('(') && line.includes(')')) {
    rawFormulas.push(line.replace(/^[^\w\s]*\s*/, '').trim());
  }
});

const formulasJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/herbs/formulas.json'), 'utf8'));
const recs = formulasJson.records || [];

const localByPinyin = new Map();

recs.forEach(r => {
  if (r.pinyin) localByPinyin.set(r.pinyin.toLowerCase().replace(/[^a-z]/g, ''), r);
  if (r.id) localByPinyin.set(r.id.replace('formula.', '').replace(/_/g, ''), r);
});

const matched = [];
const missing = [];

rawFormulas.forEach((item, idx) => {
  const pinyinMatch = item.match(/^([^(]+)\(([^)]+)\)/);
  if (!pinyinMatch) return;
  const pinyin = pinyinMatch[1].trim();
  const english = pinyinMatch[2].trim();
  const cleanPinyin = pinyin.toLowerCase().replace(/[^a-z]/g, '');

  let found = localByPinyin.get(cleanPinyin);
  if (!found) {
    for (const [key, record] of localByPinyin.entries()) {
      if (key === cleanPinyin || key.includes(cleanPinyin) || cleanPinyin.includes(key)) {
        found = record;
        break;
      }
    }
  }

  if (found) {
    matched.push({ idx: idx + 1, boardPinyin: pinyin, boardEnglish: english, localId: found.id, localZh: found.name_zh });
  } else {
    missing.push({ idx: idx + 1, boardPinyin: pinyin, boardEnglish: english });
  }
});

console.log(`Results:`);
console.log(`- Total Official Appendix C Formula Entries Extracted: ${rawFormulas.length}`);
console.log(`- Matched in local database (formulas.json): ${matched.length}`);
console.log(`- Missing in local database: ${missing.length}`);

if (missing.length > 0) {
  console.log('\nMissing Formulas in Local App:');
  missing.forEach(m => console.log(`  [${m.idx}] ${m.boardPinyin} (${m.boardEnglish})`));
}
