const fs = require('fs');
const html = fs.readFileSync('scratch/sample_shaofuzhuyutang.html', 'utf8');

function decodeEntities(str) {
  return str.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}

function cleanText(s) {
  if (!s) return '';
  return decodeEntities(s)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n');
}

const cleanedAll = cleanText(html);
const lines = cleanedAll.split('\n');

console.log('Total cleaned lines:', lines.length);

// Print lines around ACTIONS and SYNDROMES
lines.forEach((line, idx) => {
  if (line.includes('FORMULA ACTIONS') || line.includes('SYNDROMES') || line.includes('CLINICAL MANIFESTATIONS') || line.includes('TCM PATTERNS')) {
    console.log(`Line ${idx}: ${line}`);
    console.log(lines.slice(Math.max(0, idx - 1), idx + 15).join('\n  '));
    console.log('---');
  }
});
