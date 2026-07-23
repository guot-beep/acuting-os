const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/acupoints/361.json', 'utf8'));
const sampleCodes = ['ST36', 'LU1', 'KI4', 'LI4', 'SP6', 'PC6'];

sampleCodes.forEach(code => {
  const p = data.find(x => x.code === code);
  console.log(`\n=== ${code} (${p.chinese}) CombinePoint ===`);
  console.log('combine_points_zh:', p.combine_points_zh?.slice(0, 400));
});
