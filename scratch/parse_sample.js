const fs = require('fs');

const html = fs.readFileSync('scratch/sample_shaofuzhuyutang.html', 'utf8');

// Strip HTML tags helper
function stripTags(str) {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

console.log('--- Searching for Formula Name / Header ---');
const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
console.log('Title/H1:', h1Match ? stripTags(h1Match[1]) : 'Not found');

// Find FORMULA ACTIONS section
console.log('\n--- Searching for FORMULA ACTIONS ---');
const actionsIdx = html.indexOf('FORMULA ACTIONS');
if (actionsIdx !== -1) {
  console.log('Found FORMULA ACTIONS snippet:');
  console.log(stripTags(html.slice(actionsIdx, actionsIdx + 1000)));
} else {
  console.log('FORMULA ACTIONS text not found directly');
}

// Find SYNDROMES section
console.log('\n--- Searching for SYNDROMES ---');
const syndromesIdx = html.indexOf('SYNDROMES');
if (syndromesIdx !== -1) {
  console.log('Found SYNDROMES snippet:');
  console.log(stripTags(html.slice(syndromesIdx, syndromesIdx + 1500)));
} else {
  console.log('SYNDROMES text not found directly');
}
