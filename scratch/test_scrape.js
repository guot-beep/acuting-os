const https = require('https');

const indexUrls = [
  'https://www.americandragon.com/HerbFormulaIndexA-G.html',
  'https://www.americandragon.com/HerbFormulaIndexH-N.html',
  'https://www.americandragon.com/HerbFormulaIndexO-T.html',
  'https://www.americandragon.com/HerbFormulaIndexU-Z.html',
  'https://www.americandragon.com/HerbFormulaIndex2.html'
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  let allLinks = new Set();
  for (const url of indexUrls) {
    console.log('Fetching index:', url);
    const html = await fetchUrl(url);
    const regex = /href=["'](HerbFormulaHtml\/[^"']+)["']/gi;
    let m;
    let count = 0;
    while ((m = regex.exec(html)) !== null) {
      allLinks.add(m[1]);
      count++;
    }
    console.log(`  Found ${count} links in ${url}`);
  }
  console.log('Total unique formula links across all index pages:', allLinks.size);
  const sampleLink = Array.from(allLinks)[0];
  console.log('Sample link:', sampleLink);
  if (sampleLink) {
    const fullSampleUrl = 'https://www.americandragon.com/' + sampleLink;
    console.log('\nFetching sample formula page:', fullSampleUrl);
    const sampleHtml = await fetchUrl(fullSampleUrl);
    console.log('Sample HTML length:', sampleHtml.length);
    fs.writeFileSync('scratch/sample_formula.html', sampleHtml, 'utf8');
    console.log('Saved sample HTML to scratch/sample_formula.html');
  }
}

run().catch(console.error);
