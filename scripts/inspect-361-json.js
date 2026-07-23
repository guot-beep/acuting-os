const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/acupoints/361.json', 'utf8'));
const pts = Array.isArray(data) ? data : (data.points || data.records || data);

console.log('Total acupoints in 361.json:', pts.length);
console.log('Sample record (ST36 or LU1):');
const lu1 = pts.find(p => p.code === 'LU1') || pts[0];
console.log(JSON.stringify(lu1, null, 2).slice(0, 1500));
