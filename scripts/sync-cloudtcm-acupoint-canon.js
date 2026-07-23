#!/usr/bin/env node
/**
 * sync-cloudtcm-acupoint-canon.js
 * 
 * Synchronizes ALL 361 standard acupoints in data/acupoints/361.json with CloudTCM:
 *   - Overwrites location_zh with CloudTCM Location
 *   - Overwrites needling with CloudTCM Acumethod
 *   - Overwrites functions_zh with CloudTCM AcuTag_JSON tags
 *   - Populates indications_zh from CloudTCM Detail (主治: ...)
 *   - Populates cautions from CloudTCM Caution
 *   - Populates clinical_pearls from CloudTCM CombinePoint (配穴)
 *   - Populates acumethod_zh, moxa_zh, modern_research_zh, combine_points_zh,
 *     anatomy_zh, massage_zh, classical_refs, acu_tags, name_intro_zh,
 *     other_names_zh, wushu_point
 *   - Sets cloudtcm_url, cloudtcm_fetched_at, source_type, review_status
 * 
 * Agent: Antigravity Content Import Agent (Gemini 3.6 Flash)
 * Date: 2026-07-23
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ACUPOINTS_FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const MAP_FILE = path.join(__dirname, '..', 'data', 'imports', 'cloudtcm', 'acupoint_url_map.json');

const IS_TEST = process.argv.includes('--test');
const TEST_CODES = ['KI4', 'LU1', 'ST36', 'SP6', 'GV20', 'CV4', 'BL40', 'HT7', 'PC6', 'LI4'];

const CODE_MAP = {
  'DU': 'GV',
  'REN': 'CV',
  'SJ': 'TE',
  'LV': 'LR'
};

function normalizeCode(cloudtcmCode) {
  if (!cloudtcmCode) return null;
  let prefix = cloudtcmCode.match(/^[A-Z]+/)?.[0] || '';
  let num = cloudtcmCode.match(/\d+$/)?.[0] || '';
  const mappedPrefix = CODE_MAP[prefix] || prefix;
  return mappedPrefix + parseInt(num, 10);
}

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve) => {
    if (redirects > 5) return resolve({ status: 500, body: '' });
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 308) && res.headers.location) {
        const redirect = res.headers.location.startsWith('http') ? res.headers.location : `https://cloudtcm.com${res.headers.location}`;
        return fetchUrl(redirect, redirects + 1).then(resolve);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', () => resolve({ status: 500, body: '' }));
  });
}

function stripHtml(html) {
  if (!html || typeof html !== 'string') return null;
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&middot;/gi, '·')
    .replace(/[\uFFFD\uFFFC]+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text.length > 0 ? text : null;
}

function parseCautionItems(html) {
  if (!html || typeof html !== 'string') return null;
  const liMatches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
  if (liMatches.length > 1) {
    return liMatches.map(m => stripHtml(m[1])).filter(Boolean);
  }
  const plain = stripHtml(html);
  return plain ? [plain] : null;
}

function parseIndicationsFromDetail(detailText) {
  if (!detailText) return null;
  const match = detailText.match(/主治[：:](.*?)(?:。|\n|$)/);
  if (match && match[1]) {
    return match[1].split(/[，,、\s]+/).map(s => s.trim()).filter(s => s.length > 0);
  }
  return null;
}

function parseCombinePointItems(combineHtml) {
  if (!combineHtml) return null;
  const text = stripHtml(combineHtml);
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  return lines.length > 0 ? lines : null;
}

function cleanText(str) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/[\uFFFD\uFFFC]+/g, '').trim();
}

async function main() {
  console.log('=== CloudTCM Acupoint Canon Synchronization ===');
  console.log(`Agent: Antigravity Content Import Agent`);
  console.log(`Date: ${new Date().toISOString()}\n`);

  const acuData = JSON.parse(fs.readFileSync(ACUPOINTS_FILE, 'utf8'));
  const records = Array.isArray(acuData) ? acuData : (acuData.points || acuData.records || []);

  const mapData = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  let urlMap = new Map();
  mapData.entries.forEach(e => {
    if (e.acu_code) {
      const normalized = normalizeCode(e.acu_code);
      if (normalized) urlMap.set(normalized, e.page_url);
    }
  });

  console.log(`Loaded acupoint URL map: ${urlMap.size} entries`);

  const toProcess = IS_TEST ? records.filter(r => TEST_CODES.includes(r.code)) : records;
  let filled = 0, skipped = 0;

  for (const r of toProcess) {
    const code = r.code;
    const pageUrl = urlMap.get(code);

    if (!pageUrl) {
      console.log(`[NO URL] ${code} ${r.chinese || ''}`);
      skipped++;
      continue;
    }

    const res = await fetchUrl(pageUrl);
    if (res.status !== 200) {
      console.error(`  [HTTP ${res.status}] ${code} → ${pageUrl}`);
      skipped++;
      continue;
    }

    const match = res.body.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) { skipped++; continue; }

    try {
      const pd = JSON.parse(match[1]).props.pageProps.pageData || {};

      // 1. Overwrite Location
      const location = stripHtml(pd.Location);
      if (location) {
        r.location_zh = location;
      }

      // 2. Overwrite Needling (Acumethod)
      const acumethod = stripHtml(pd.Acumethod);
      if (acumethod) {
        r.needling = acumethod;
        r.acumethod_zh = acumethod;
      }

      // 3. Moxa (艾灸方法)
      const moxa = stripHtml(pd.Moxa);
      if (moxa) {
        r.moxa_zh = moxa;
      }

      // 4. Modern Research & Detail
      const detail = stripHtml(pd.Detail);
      if (detail) {
        r.modern_research_zh = detail;
        r.cloudtcm_detail = detail;
      }

      // 5. Indications parsed from Detail
      const parsedIndications = parseIndicationsFromDetail(detail);
      if (parsedIndications && parsedIndications.length > 0) {
        r.indications_zh = parsedIndications;
      }

      // 6. Combine Points (配穴) & Clinical Pearls
      const combine = stripHtml(pd.CombinePoint);
      if (combine) {
        r.combine_points_zh = combine;
        const combineItems = parseCombinePointItems(pd.CombinePoint);
        if (combineItems) {
          r.clinical_pearls = combineItems;
        }
      }

      // 7. Cautions & Contraindications
      const cautionItems = parseCautionItems(pd.Caution);
      if (cautionItems && cautionItems.length > 0) {
        r.cautions_zh = cautionItems;
        r.cautions = cautionItems;
        r.contraindications = cautionItems;
      }

      // 8. Anatomy
      const anatomy = stripHtml(pd.Anatomy);
      if (anatomy) {
        r.anatomy_zh = anatomy;
      }

      // 9. Massage
      const massage = stripHtml(pd.Massage);
      if (massage) {
        r.massage_zh = massage;
      }

      // 10. Tags & Functions
      if (pd.AcuTag_JSON && Array.isArray(pd.AcuTag_JSON) && pd.AcuTag_JSON.length > 0) {
        const tags = pd.AcuTag_JSON.map(t => cleanText(t.title)).filter(Boolean);
        if (tags.length > 0) {
          r.acu_tags = tags;
          r.functions_zh = tags;
        }
      }

      // 11. Classical Literature
      if (pd.AcuEbook_JSON && Array.isArray(pd.AcuEbook_JSON) && pd.AcuEbook_JSON.length > 0) {
        r.classical_refs = pd.AcuEbook_JSON.map(e => ({
          source_zh: cleanText(e.EBookNameCH),
          excerpt_zh: cleanText(e.Excerpt),
          url: e.Url ? `https://cloudtcm.com${e.Url}` : null
        })).filter(e => e.excerpt_zh);
      }

      // 12. Names & Categories
      if (pd.OtherNameCH) r.other_names_zh = cleanText(pd.OtherNameCH);
      if (pd.NameIntroCH) r.name_intro_zh = cleanText(pd.NameIntroCH);
      if (pd.WuShuPoint) r.wushu_point = cleanText(pd.WuShuPoint);

      // Provenance
      r.cloudtcm_url = pageUrl;
      r.cloudtcm_fetched_at = new Date().toISOString();
      r.source_type = "sourced_cloudtcm_record";
      r.review_status = "draft";

      console.log(`[SYNCED OK] ${code} ${r.chinese || ''} -> ${pageUrl}`);
      filled++;
    } catch (e) {
      console.error(`  [ERR] ${code}: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n=== Acupoint Canon Sync Complete: ${filled} synced, ${skipped} skipped ===`);

  if (IS_TEST) {
    const sample = toProcess.find(r => r.code === 'KI4');
    if (sample) {
      console.log('\nKI4 (大鐘) Synced Result:');
      console.log('  location_zh:', sample.location_zh);
      console.log('  needling:', sample.needling);
      console.log('  functions_zh (tags):', sample.functions_zh);
      console.log('  indications_zh:', sample.indications_zh);
      console.log('  clinical_pearls (combine):', sample.clinical_pearls?.slice(0, 3));
      console.log('  moxa_zh:', sample.moxa_zh?.slice(0, 80));
      console.log('  modern_research_zh:', sample.modern_research_zh);
    }
  } else {
    if (Array.isArray(acuData)) {
      fs.writeFileSync(ACUPOINTS_FILE, JSON.stringify(records, null, 2), 'utf8');
    } else {
      const out = { ...acuData };
      if (out.points) out.points = records;
      else if (out.records) out.records = records;
      fs.writeFileSync(ACUPOINTS_FILE, JSON.stringify(out, null, 2), 'utf8');
    }
    console.log(`Saved to ${ACUPOINTS_FILE}`);
  }
}

main();
