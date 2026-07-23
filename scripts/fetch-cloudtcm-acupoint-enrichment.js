#!/usr/bin/env node
/**
 * fetch-cloudtcm-acupoint-enrichment.js
 * 
 * Fetches all fields from CloudTCM acupoint pages and writes them into 361.json.
 * 
 * CloudTCM uses DU/REN codes, we use GV/CV — mapping table included.
 * Fetched fields:
 *   - cautions_zh        ← Caution (HTML stripped)
 *   - acumethod_zh       ← Acumethod (needling method text)
 *   - cloudtcm_detail    ← Detail (modern clinical intro)
 *   - combine_points_zh  ← CombinePoint (配穴)
 *   - anatomy_zh         ← Anatomy (解剖)
 *   - moxa_zh            ← Moxa (艾灸法)
 *   - massage_zh         ← Massage (按摩法)
 *   - classical_refs     ← AcuEbook_JSON (古籍引用)
 *   - acu_tags           ← AcuTag_JSON (功效標籤)
 *   - cloudtcm_url       ← page_url
 *   - cloudtcm_fetched_at
 * 
 * Agent: Antigravity Content Import Agent (Claude Sonnet 4.6)
 * Date: 2026-07-23
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const ACUPOINTS_FILE = path.join(__dirname, '..', 'data', 'acupoints', '361.json');
const MAP_FILE = path.join(__dirname, '..', 'data', 'imports', 'cloudtcm', 'acupoint_url_map.json');

const IS_TEST = process.argv.includes('--test');
const TEST_CODES = ['LU1', 'ST36', 'SP6', 'GV20', 'CV4', 'BL40', 'HT7', 'PC6', 'LI4'];

// CloudTCM code → our code mapping
const CODE_MAP = {
  // DU → GV (Du Mai / Governor Vessel)
  'DU': 'GV',
  // REN → CV (Ren Mai / Conception Vessel)
  'REN': 'CV',
  // LU stays LU
  // LI stays LI
  // ST stays ST
  // SP stays SP
  // HT stays HT
  // SI stays SI
  // BL stays BL
  // KI stays KI
  // PC stays PC
  // TE stays TE (CloudTCM may use SJ)
  'SJ': 'TE',
  // GB stays GB
  // LR stays LR (CloudTCM may use LV)
  'LV': 'LR',
};

function normalizeCode(cloudtcmCode) {
  if (!cloudtcmCode) return null;
  // e.g. DU01 → GV1, LU01 → LU1, ST036 → ST36
  let prefix = cloudtcmCode.match(/^[A-Z]+/)?.[0] || '';
  let num = cloudtcmCode.match(/\d+$/)?.[0] || '';
  const mappedPrefix = CODE_MAP[prefix] || prefix;
  return mappedPrefix + parseInt(num, 10); // remove leading zeros
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
  // Single paragraph caution
  const plain = stripHtml(html);
  return plain ? [plain] : null;
}

async function main() {
  console.log('=== CloudTCM Acupoint Enrichment ===');
  console.log(`Agent: Antigravity Content Import Agent (Claude Sonnet 4.6)`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('');

  // Load acupoint data
  const acuData = JSON.parse(fs.readFileSync(ACUPOINTS_FILE, 'utf8'));
  const records = Array.isArray(acuData) ? acuData : (acuData.points || acuData.records || []);

  // Load or build URL map
  let urlMap = new Map(); // ourCode → cloudtcm page URL
  if (fs.existsSync(MAP_FILE)) {
    const mapData = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    mapData.entries.forEach(e => {
      if (e.acu_code) {
        const normalized = normalizeCode(e.acu_code);
        if (normalized) urlMap.set(normalized, e.page_url);
      }
    });
    console.log(`Loaded URL map: ${urlMap.size} entries`);
  } else {
    console.log('WARNING: No URL map found. Run build-cloudtcm-acupoint-map.js first.');
    return;
  }

  const recordsToProcess = IS_TEST
    ? records.filter(r => TEST_CODES.includes(r.code))
    : records;

  let filled = 0, partial = 0, skipped = 0;

  for (const r of recordsToProcess) {
    const code = r.code; // e.g. LU1, ST36, GV20
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

      // === SAFETY: Caution field ===
      const cautionItems = parseCautionItems(pd.Caution);
      if (cautionItems) r.cautions_zh = cautionItems;

      // === NEEDLING: Acumethod ===
      const acumethod = stripHtml(pd.Acumethod);
      if (acumethod) r.acumethod_zh = acumethod;

      // === CLINICAL DETAIL ===
      const detail = stripHtml(pd.Detail);
      if (detail) r.cloudtcm_detail = detail;

      // === COMBINE POINTS 配穴 ===
      const combine = stripHtml(pd.CombinePoint);
      if (combine) r.combine_points_zh = combine;

      // === ANATOMY ===
      const anatomy = stripHtml(pd.Anatomy);
      if (anatomy) r.anatomy_zh = anatomy;

      // === MOXA ===
      const moxa = stripHtml(pd.Moxa);
      if (moxa) r.moxa_zh = moxa;

      // === MASSAGE ===
      const massage = stripHtml(pd.Massage);
      if (massage) r.massage_zh = massage;

      // === CLASSICAL REFS ===
      if (pd.AcuEbook_JSON && pd.AcuEbook_JSON.length > 0) {
        r.classical_refs = pd.AcuEbook_JSON.map(e => ({
          source_zh: e.EBookNameCH,
          excerpt_zh: e.Excerpt,
          url: e.Url ? `https://cloudtcm.com${e.Url}` : null
        })).filter(e => e.excerpt_zh);
      }

      // === ACU TAGS (功效標籤) ===
      if (pd.AcuTag_JSON && pd.AcuTag_JSON.length > 0) {
        r.acu_tags = pd.AcuTag_JSON.map(t => t.title).filter(Boolean);
      }

      // === OTHER NAME ===
      if (pd.OtherNameCH) r.other_names_zh = pd.OtherNameCH;
      if (pd.NameIntroCH) r.name_intro_zh = pd.NameIntroCH;
      if (pd.WuShuPoint) r.wushu_point = pd.WuShuPoint;

      // === PROVENANCE ===
      r.cloudtcm_url = pageUrl;
      r.cloudtcm_fetched_at = new Date().toISOString();

      const fieldsAdded = [
        cautionItems && 'cautions_zh',
        acumethod && 'acumethod_zh',
        detail && 'cloudtcm_detail',
        combine && 'combine_points_zh',
        anatomy && 'anatomy_zh',
        moxa && 'moxa_zh',
        massage && 'massage_zh',
        r.classical_refs && 'classical_refs',
        r.acu_tags && 'acu_tags',
      ].filter(Boolean);

      console.log(`[OK] ${code} ${r.chinese || ''}: ${fieldsAdded.join(', ')}`);
      filled++;
    } catch (e) {
      console.error(`  [PARSE ERR] ${code}: ${e.message}`);
      skipped++;
    }
  }

  console.log('');
  console.log(`=== Done: ${filled} enriched, ${partial} partial, ${skipped} skipped ===`);

  if (IS_TEST) {
    const sample = recordsToProcess.find(r => r.code === 'LU1');
    if (sample) {
      console.log('\nSample LU1 (中府):');
      console.log('  cautions_zh:', sample.cautions_zh);
      console.log('  acumethod_zh:', sample.acumethod_zh?.slice(0, 100));
      console.log('  acu_tags:', sample.acu_tags);
      console.log('  classical_refs count:', sample.classical_refs?.length);
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
