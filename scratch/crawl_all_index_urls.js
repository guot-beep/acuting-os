const https = require('https');
const fs = require('fs');

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

async function collectAllFormulaUrls() {
  const allFormulaMap = new Map(); // relativePath -> fullUrl

  for (const indexUrl of indexUrls) {
    console.log('Fetching index page:', indexUrl);
    const html = await fetchUrl(indexUrl);
    
    // Find all hrefs matching .html
    const regex = /href=["']([^"']+\.html)["']/gi;
    let m;
    let count = 0;
    while ((m = regex.exec(html)) !== null) {
      let href = m[1].trim();
      // Exclude non-formula pages
      if (href.includes('Index') || href.includes('AmericanDragon') || href.includes('Newsletter') ||
          href.includes('contact') || href.includes('tutoring') || href.includes('chineseherbs') ||
          href.includes('overview') || href.includes('about') || href.includes('review') ||
          href.includes('sample') || href.includes('order')) {
        continue;
      }
      // Clean up relative path slashes
      let cleanHref = href.replace(/^(\.\.\/|\/)/, '');
      let fullUrl = 'https://www.americandragon.com/' + encodeURI(cleanHref);
      if (!allFormulaMap.has(cleanHref)) {
        allFormulaMap.set(cleanHref, fullUrl);
        count++;
      }
    }
    console.log(`  Extracted ${count} formula URLs from ${indexUrl}`);
  }

  console.log('\nTotal unique formula URLs across American Dragon:', allFormulaMap.size);

  const formulaList = Array.from(allFormulaMap.entries()).map(([rel, url]) => ({ rel, url }));
  fs.writeFileSync('scratch/all_ad_formula_urls.json', JSON.stringify(formulaList, null, 2), 'utf8');
  console.log('Saved formula list to scratch/all_ad_formula_urls.json');
}

collectAllFormulaUrls().catch(console.error);
