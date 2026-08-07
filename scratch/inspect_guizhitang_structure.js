const fs = require('fs');

const guiZhiFile = fs.readdirSync('scratch/ad_cache').find(f => f.includes('GuiZhiTang'));
const html = fs.readFileSync('scratch/ad_cache/' + guiZhiFile, 'utf8');

function cleanText(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join('\n');
}

const cleaned = cleanText(html);
const lines = cleaned.split('\n');

console.log('Total cleaned lines:', lines.length);

lines.forEach((line, idx) => {
  if (line.toUpperCase().includes('ACTION') || line.toUpperCase().includes('SYNDROME') || line.toUpperCase().includes('PATTERN') || line.toUpperCase().includes('INDICATION')) {
    console.log(`Line ${idx}: ${line}`);
    console.log(lines.slice(Math.max(0, idx - 1), idx + 10).join('\n  '));
    console.log('---');
  }
});
