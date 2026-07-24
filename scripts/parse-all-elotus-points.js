/**
 * parse-all-elotus-points.js
 *
 * Downloads all 12 eLotus zone listgrid pages and extracts every single point record:
 * - zone_code (11, 22, 33, 44, 55, 66, 77, 88, 99, 1010, DT, VT)
 * - code (T11.01, TDT.01, TVT.01)
 * - name_en (Dajian, Linggu, Fuke)
 * - url (https://www.mastertungacupuncture.org/acupuncture/tung/points/...)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const TIDS = [
  { tid: 499, zone: '11' },
  { tid: 500, zone: '22' },
  { tid: 501, zone: '33' },
  { tid: 502, zone: '44' },
  { tid: 503, zone: '55' },
  { tid: 504, zone: '66' },
  { tid: 505, zone: '77' },
  { tid: 506, zone: '88' },
  { tid: 507, zone: '99' },
  { tid: 508, zone: '1010' },
  { tid: 509, zone: 'DT' },
  { tid: 510, zone: 'VT' }
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const allPointsMap = new Map();

  for (const z of TIDS) {
    const url = `https://www.mastertungacupuncture.org/acupuncture/tung/points/listgrid?combine=&field_point_zone_tid%5B%5D=${z.tid}`;
    console.log(`Fetching Zone ${z.zone} (TID ${z.tid})...`);
    try {
      const html = await fetchPage(url);
      const blocks = html.split('class="views-field views-field-title"');
      let count = 0;

      blocks.slice(1).forEach(block => {
        const linkM = block.match(/href="\/acupuncture\/tung\/points\/([a-z0-9\-]+)"/i);
        const numM = block.match(/field-point-number">([^<]+)<\/div>/i);
        const nameM = block.match(/field-name-standard">([^<]+)<\/div>/i);

        if (linkM && numM && nameM) {
          const slug = linkM[1];
          if (slug === 'listall' || slug === 'listgrid') return;

          const rawCode = numM[1].trim();
          const nameEn = nameM[1].trim().replace(/&amp;/g, '&');
          let code = rawCode.replace(/\s+/g, '');
          if (code.startsWith('DT')) code = `TDT.${code.slice(2).padStart(2, '0')}`;
          else if (code.startsWith('VT')) code = `TVT.${code.slice(2).padStart(2, '0')}`;

          const pUrl = `https://www.mastertungacupuncture.org/acupuncture/tung/points/${slug}`;

          if (!allPointsMap.has(code)) {
            allPointsMap.set(code, {
              zone_code: z.zone,
              code,
              rawCode,
              slug,
              name_en: nameEn,
              url: pUrl
            });
            count++;
          }
        }
      });
      console.log(`  -> Extracted ${count} points for Zone ${z.zone}`);
    } catch (e) {
      console.error(`Failed Zone ${z.zone}:`, e.message);
    }
  }

  console.log(`\nExtracted total ${allPointsMap.size} unique eLotus points across all 12 zones.`);
  const pointsArray = Array.from(allPointsMap.values());

  fs.writeFileSync(
    path.join(__dirname, '..', 'data', 'tung', 'elotus_all_points.json'),
    JSON.stringify(pointsArray, null, 2),
    'utf8'
  );
  console.log('Saved data/tung/elotus_all_points.json.');
}

main();
