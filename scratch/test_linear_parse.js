const fs = require('fs');

const guiZhiFile = fs.readdirSync('scratch/ad_cache').find(f => f.includes('GuiZhiTang'));
const html = fs.readFileSync('scratch/ad_cache/' + guiZhiFile, 'utf8');

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (m, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (m, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function cleanText(s) {
  if (!s) return '';
  return decodeEntities(s)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n');
}

function parseFormulaLinear(html, url = '') {
  const cleaned = cleanText(html);
  const lines = cleaned.split('\n');

  // Title parsing from <title> tag
  let pinyin = '';
  let chinese = '';
  let englishName = '';
  let alsoKnownAs = '';

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    const pageTitle = cleanText(titleMatch[1]);
    const parts = pageTitle.split(/\s*-\s*/).map(p => p.trim());
    if (parts.length >= 1) pinyin = parts[0];
    if (parts.length >= 2 && /[\u4e00-\u9fa5]/.test(parts[1])) chinese = parts[1];
    if (parts.length >= 3) englishName = parts[2];
    if (parts.length >= 4 && !parts[3].includes('Chinese Herbs') && !parts[3].includes('American Dragon')) {
      alsoKnownAs = parts[3];
    }
  }

  // Section collection states
  let mode = null; // 'actions', 'syndromes', null
  const actions = [];
  const syndromes = [];
  let currentSyndrome = null;

  const endSectionHeaders = [
    'CONTRAINDICATIONS', 'HERB/DRUG INTERACTIONS', 'NOTES',
    'MODIFICATIONS', 'FORMULA INGREDIENTS', 'PRECAUTIONS', 'DOSAGE'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check header triggers
    if (line === 'FORMULA ACTIONS') {
      mode = 'actions';
      continue;
    }

    if (line === 'SYNDROMES' || line === 'TCM PATTERNS') {
      mode = 'syndromes';
      continue;
    }

    if (endSectionHeaders.some(h => line.startsWith(h))) {
      mode = null;
      if (currentSyndrome) {
        syndromes.push(currentSyndrome);
        currentSyndrome = null;
      }
      continue;
    }

    if (mode === 'actions') {
      if (line.length > 2) {
        actions.push(line);
      }
    }

    if (mode === 'syndromes') {
      if (line === 'CLINICAL MANIFESTATIONS') continue;
      if (!currentSyndrome) {
        currentSyndrome = { name: line, manifestations: [] };
      } else {
        // If line starts with T:, C:, P: or is a symptom bullet
        if (line.startsWith('T:') || line.startsWith('C:') || line.startsWith('P:') || line.length > 2) {
          currentSyndrome.manifestations.push(line);
        }
      }
    }
  }

  if (currentSyndrome) syndromes.push(currentSyndrome);

  return {
    pinyin,
    chinese,
    englishName,
    alsoKnownAs,
    actions,
    syndromes
  };
}

const parsed = parseFormulaLinear(html);
console.log('Parsed GuiZhiTang Result:');
console.log(JSON.stringify(parsed, null, 2));
