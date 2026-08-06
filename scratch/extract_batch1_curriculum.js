/**
 * scratch/extract_batch1_curriculum.js
 * Dynamically finds curriculum files and extracts text for Yin Qiao San, Sang Ju Yin, Bai Hu Tang
 */

const fs = require('fs');
const path = require('path');

const dir1 = path.join(__dirname, '../curriculum/herbs');
const dir2 = path.join(__dirname, '../curriculum/formulas');

const files = [];
[dir1, dir2].forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(f => {
      if (f.endsWith('.md')) files.push(path.join(dir, f));
    });
  }
});

console.log(`Found ${files.length} markdown files in curriculum.`);

function searchFormula(name) {
  console.log(`\n======================================================================`);
  console.log(`                             ${name}                                  `);
  console.log(`======================================================================`);

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const re = new RegExp(name, 'i');
    const match = content.match(re);
    if (match) {
      console.log(`\n--- [Matched in ${path.basename(file)}] ---`);
      const pos = match.index;
      console.log(content.substring(pos, pos + 1500));
    }
  });
}

['Yin Qiao San', 'Sang Ju Yin', 'Bai Hu Tang'].forEach(searchFormula);
