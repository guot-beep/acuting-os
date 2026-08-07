const https = require('https');
const fs = require('fs');

https.get('https://www.americandragon.com/HerbFormulaIndexA-G.html', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('scratch/index_A-G.html', data, 'utf8');
    console.log('Saved index_A-G.html, length:', data.length);
    // Find all hrefs
    const regex = /href=["']([^"']+)["']/gi;
    let m;
    const hrefs = [];
    while ((m = regex.exec(data)) !== null) {
      if (m[1].includes('.html') && !m[1].includes('Index')) {
        hrefs.push(m[1]);
      }
    }
    console.log('Found formula hrefs:', hrefs.length);
    console.log('Sample hrefs:', hrefs.slice(0, 25));
  });
});
