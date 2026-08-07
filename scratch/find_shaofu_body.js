const fs = require('fs');
const html = fs.readFileSync('scratch/sample_shaofuzhuyutang.html', 'utf8');

// Find occurrence of Shao Fu Zhu Yu Tang in body
let pos = html.indexOf('Shao Fu Zhu Yu Tang');
while (pos !== -1) {
  console.log('--- Match at pos', pos, '---');
  console.log(html.slice(pos - 100, pos + 500));
  console.log('\n');
  pos = html.indexOf('Shao Fu Zhu Yu Tang', pos + 1);
}
