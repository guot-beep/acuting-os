const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function testFormula() {
  const targetUrl = 'https://www.americandragon.com/Herb%20Formulas%20copy/ShaoFuZhuYuTang.html';
  console.log('Fetching:', targetUrl);
  const res = await fetchUrl(targetUrl);
  console.log('Status:', res.status, 'Body length:', res.body.length);
  fs.writeFileSync('scratch/sample_shaofuzhuyutang.html', res.body, 'utf8');
}

testFormula().catch(console.error);
