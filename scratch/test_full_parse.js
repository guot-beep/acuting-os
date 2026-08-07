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

// Extract title from <title> tag
const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
if (titleMatch) {
  const decodedTitle = decodeEntities(titleMatch[1]);
  console.log('Decoded Page Title:', decodedTitle);
  // Splitting by ' - '
  const parts = decodedTitle.split(/\s*-\s*/);
  console.log('Title Parts:', parts);
}

// Search for FORMULA ACTIONS and SYNDROMES
const actionsPos = html.indexOf('FORMULA ACTIONS');
const syndromesPos = html.indexOf('SYNDROMES');
const herbsPos = html.indexOf('HERBS AND ACTIONS');

console.log('Actions Pos:', actionsPos, 'Syndromes Pos:', syndromesPos, 'Herbs Pos:', herbsPos);

if (actionsPos !== -1) {
  const actionsBlock = html.slice(actionsPos, syndromesPos !== -1 ? syndromesPos : actionsPos + 2000);
  console.log('\n=== ACTIONS BLOCK ===');
  console.log(cleanText(actionsBlock));
}

if (syndromesPos !== -1) {
  const syndromesBlock = html.slice(syndromesPos, herbsPos !== -1 ? herbsPos : syndromesPos + 4000);
  console.log('\n=== SYNDROMES BLOCK ===');
  console.log(cleanText(syndromesBlock));
}
