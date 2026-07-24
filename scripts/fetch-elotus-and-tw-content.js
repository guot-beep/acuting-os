/**
 * fetch-elotus-and-tw-content.js
 *
 * Fetches authentic point details (Location, Indications, Techniques, Anatomy, Cautions)
 * directly from eLotus point pages for all Master Tung points needing enriched text.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const vm = require('vm');

// Load point_index.js
const TUNG_FILE = path.join(__dirname, '..', 'data', 'tung', 'point_index.js');
const tungCode = fs.readFileSync(TUNG_FILE, 'utf8');
const ctx = { window: {}, globalThis: {} };
vm.runInNewContext(tungCode, ctx);
const points = (ctx.window.ACUTING_TUNG_INDEX || {}).points || [];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function cleanHtmlText(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function main() {
  const incompletePoints = points.filter(p => !p.location_zh || p.location_zh.includes('請參考董氏針灸圖解') || p.location_zh.length < 10);
  console.log(`Found ${incompletePoints.length} points needing authentic Location & Content enrichment...\n`);

  let successCount = 0;

  for (const p of incompletePoints) {
    const elotusLink = (p.visual_links && p.visual_links[0] && p.visual_links[0].url)
      ? p.visual_links[0].url
      : `https://www.mastertungacupuncture.org/acupuncture/tung/points/${(p.name_en||'').toLowerCase()}-t-${p.code.toLowerCase().replace(/[^0-9]/g, '')}`;

    if (!elotusLink || !elotusLink.includes('mastertungacupuncture.org')) continue;

    console.log(`Fetching eLotus content for ${p.code} (${p.name_zh} / ${p.name_en})...`);
    try {
      const html = await fetchPage(elotusLink);

      // Extract LOCATION
      const locMatch = html.match(/<div class="field-name-field-location[^">]*">([\s\S]*?)<\/div>\s*<\/div>/i) || html.match(/LOCATION:?([\s\S]*?)(?:INDICATIONS|TECHNIQUES|NOTE|<\/div>)/i);
      // Extract INDICATIONS
      const indMatch = html.match(/<div class="field-name-field-indications[^">]*">([\s\S]*?)<\/div>\s*<\/div>/i) || html.match(/INDICATIONS:?([\s\S]*?)(?:TECHNIQUES|LOCATION|NOTE|<\/div>)/i);
      // Extract TECHNIQUES
      const techMatch = html.match(/<div class="field-name-field-needling-depth[^">]*">([\s\S]*?)<\/div>\s*<\/div>/i) || html.match(/TECHNIQUES:?([\s\S]*?)(?:INDICATIONS|LOCATION|NOTE|<\/div>)/i);
      // Extract REACTION AREA / ANATOMY
      const anatMatch = html.match(/<div class="field-name-field-reaction-area[^">]*">([\s\S]*?)<\/div>\s*<\/div>/i);

      if (locMatch) {
        const locText = cleanHtmlText(locMatch[1]);
        if (locText.length > 5) {
          p.location_en = locText;
        }
      }
      if (indMatch) {
        const indText = cleanHtmlText(indMatch[1]);
        if (indText.length > 5) {
          p.indications_en = indText.split(/[,;\.]+/).map(s => s.trim()).filter(Boolean);
        }
      }
      if (techMatch) {
        const techText = cleanHtmlText(techMatch[1]);
        if (techText.length > 5) {
          p.acumethod_en = techText;
        }
      }
      if (anatMatch) {
        const anatText = cleanHtmlText(anatMatch[1]);
        if (anatText.length > 3) {
          p.anatomy_en = anatText;
        }
      }

      successCount++;
    } catch (e) {
      console.error(`  Failed for ${p.code}:`, e.message);
    }
  }

  console.log(`\nSuccessfully fetched authentic eLotus details for ${successCount} / ${incompletePoints.length} points.`);
}

main();
