const fs = require('fs');
const html = fs.readFileSync('scratch/sample_shaofuzhuyutang.html', 'utf8');

let pos = html.search(/Drive Out Stasis/i);
if (pos !== -1) {
  console.log('--- Match Drive Out Stasis at pos', pos, '---');
  console.log(html.slice(pos - 200, pos + 1000));
}

let pos2 = html.search(/SHAO FU/i);
if (pos2 !== -1) {
  console.log('--- Match SHAO FU at pos', pos2, '---');
  console.log(html.slice(pos2 - 200, pos2 + 1000));
}
