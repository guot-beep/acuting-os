const fs = require('fs');

const html = fs.readFileSync('scratch/sample_shaofuzhuyutang.html', 'utf8');

function cleanText(s) {
  if (!s) return '';
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n');
}

function parseFormulaPage(html, url = '') {
  // Extract formula title header line
  // e.g. SHAO FU ZHU YU TANG - 少腹逐瘀汤 - DRIVE OUT STASIS...
  let titleMatch = html.match(/class=["']?style43["']?[^>]*>([\s\S]*?)<\/span>/i) ||
                 html.match(/<font[^>]*size=["']?\+2["']?[^>]*>([\s\S]*?)<\/font>/i) ||
                 html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
                 html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  
  let headerText = '';
  // Or look for string like PIN YIN - Chinese - English
  const headerRegex = /([A-Z\s\'-]+)\s*[-–—]\s*([\u4e00-\u9fa5\u3400-\u4dbf]+)\s*[-–—]\s*([A-Z0-9\s\'-]+)/i;
  const matchHeader = html.match(headerRegex);
  
  // Extract English Name & Also Known As from table if available
  let englishName = '';
  let alsoKnownAs = '';
  const engMatch = html.match(/English:\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
  if (engMatch) englishName = cleanText(engMatch[1]);

  const akaMatch = html.match(/Also Known As:\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
  if (akaMatch) alsoKnownAs = cleanText(akaMatch[1]);

  // Extract FORMULA ACTIONS
  let actions = [];
  const actionsMatch = html.match(/FORMULA ACTIONS([\s\S]*?)(?=SYNDROMES|HERBS AND ACTIONS|INDICATIONS|CONTRAINDICATIONS|<table class="style43"|$)/i);
  if (actionsMatch) {
    const rawActions = actionsMatch[1];
    // extract li or lines
    const liMatches = rawActions.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (liMatches) {
      actions = liMatches.map(li => cleanText(li)).filter(Boolean);
    } else {
      actions = cleanText(rawActions).split('\n').filter(line => line.length > 2 && !line.includes('FORMULA ACTIONS'));
    }
  }

  // Extract SYNDROMES
  let syndromes = [];
  const syndromesMatch = html.match(/SYNDROMES([\s\S]*?)(?=HERBS AND ACTIONS|FORMULA INGREDIENTS|CLINICAL MANIFESTATIONS|CONTRAINDICATIONS|TCM PATTERNS|$)/i);
  if (syndromesMatch) {
    const rawSyndromes = syndromesMatch[1];
    const liMatches = rawSyndromes.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (liMatches) {
      syndromes = liMatches.map(li => cleanText(li)).filter(Boolean);
    } else {
      syndromes = cleanText(rawSyndromes).split('\n').filter(line => line.length > 2 && !line.includes('SYNDROMES'));
    }
  }

  // Extract full Chinese / Pinyin Title
  let fullTitle = '';
  if (matchHeader) {
    fullTitle = matchHeader[0].trim();
  } else {
    // fallback search for Chinese + Pinyin
    const simpleZh = html.match(/([\u4e00-\u9fa5]{2,10})/);
    fullTitle = simpleZh ? simpleZh[1] : 'Unknown Title';
  }

  return {
    url,
    headerTitle: fullTitle,
    pinyin: matchHeader ? matchHeader[1].trim() : '',
    chinese: matchHeader ? matchHeader[2].trim() : '',
    englishName: englishName || (matchHeader ? matchHeader[3].trim() : ''),
    alsoKnownAs,
    actions,
    syndromes
  };
}

const parsed = parseFormulaPage(html, 'https://www.americandragon.com/Herb%20Formulas%20copy/ShaoFuZhuYuTang.html');
console.log('Parsed Result:', JSON.stringify(parsed, null, 2));
