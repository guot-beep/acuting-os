const fs = require('fs');
const html = fs.readFileSync('scratch/sample_shaofuzhuyutang.html', 'utf8');

console.log(html.slice(0, 3500));
