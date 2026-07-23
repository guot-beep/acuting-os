#!/usr/bin/env node
/**
 * fetch-cloudtcm-acupoint-enrichment.js (Enhanced)
 * 
 * Fetches all detailed clinical, needling, moxibustion, research, anatomical,
 * and classical reference fields from CloudTCM for all 361 acupoints.
 * 
 * CloudTCM fields extracted per acupoint:
 *   - cautions_zh          ← Caution (HTML stripped into item array)
 *   - acumethod_zh         ← Acumethod (針刺方法 / 角度 / 深度 / 針感)
 *   - moxa_zh              ← Moxa (艾灸方法 / 器具 / 步驟 / 時間)
 *   - modern_research_zh   ← Detail (現代研究 / 臨床應用 / 現代疾病特徵)
 *   - combine_points_zh    ← CombinePoint (經典與現代配穴指南)
 *   - anatomy_zh           ← Anatomy (解剖構造 / 神經 / 血管 / 肌膜)
 *   - massage_zh           ← Massage (自我按摩 / 指壓 / 敲打保健)
 *   - classical_refs       ← AcuEbook_JSON (古籍經典引用 e.g. 《靈樞》, 《甲乙經》)
 *   - acu_tags             ← AcuTag_JSON (功效與分類標籤 e.g. 募穴, 化痰, 健脾)
 *   - other_names_zh       ← OtherNameCH (別名)
 *   - name_intro_zh        ← NameIntroCH (穴名釋義)
 *   - wushu_point          ← WuShuPoint (五輸穴/特定穴分類)
 *   - cloudtcm_url         ← page_url
 *   - cloudtcm_fetched_at  ← ISO timestamp
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
const TEST_CODES = ['LU1', 'ST36', 'SP6', 'GV20', 'CV4', 'BL40', 'HT7', 'PC6', 'LI4', 'GB20', 'KI3', 'LR3'];

// Code normalizer: CloudTCM code (DU01, REN04, SJ05, LV03) → repository code (GV1, CV4, TE5, LR3)
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

async function main() {
  console.log('=== CloudTCM Acupoint Full Clinical & Research Enrichment ===');
  console.log(`Agent: Antigravity Content Import Agent`);
  console.log(`Date: ${new Date().toISOString()}\n`);

  const acuData = JSON.parse(fs.readFileSync(ACUPOINTS_FILE, 'utf8'));
  const records = Array.isArray(acuData) ? acuData : (acuData.points || acuData.records || []);

  let urlMap = new Map();
  if (fs.existsSync(MAP_FILE)) {
    const mapData = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    mapData.entries.forEach(e => {
      if (e.acu_code) {
        const normalized = normalizeCode(e.acu_code);
        if (normalized) urlMap.set(normalized, e.page_url);
      }
    });
    console.log(`Loaded acupoint URL map: ${urlMap.size} entries`);
  } else {
    console.error('ERROR: Missing acupoint_url_map.json');
    return;
  }

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

      // 1. Cautions (注意事項 / 禁忌)
      const cautionItems = parseCautionItems(pd.Caution);
      if (cautionItems && cautionItems.length > 0) {
        r.cautions_zh = cautionItems;
      }

      // 2. Acumethod (針刺方法)
      const acumethod = stripHtml(pd.Acumethod);
      if (acumethod) {
        r.acumethod_zh = acumethod;
      }

      // 3. Moxa (艾灸方法)
      const moxa = stripHtml(pd.Moxa);
      if (moxa) {
        r.moxa_zh = moxa;
      }

      // 4. Modern Research & Clinical Application (現代研究與臨床應用)
      const detail = stripHtml(pd.Detail);
      if (detail) {
        r.modern_research_zh = detail;
        r.cloudtcm_detail = detail;
      }

      // 5. Combine Point (配穴指南)
      const combine = stripHtml(pd.CombinePoint);
      if (combine) {
        r.combine_points_zh = combine;
      }

      // 6. Anatomy (解剖構造)
      const anatomy = stripHtml(pd.Anatomy);
      if (anatomy) {
        r.anatomy_zh = anatomy;
      }

      // 7. Massage (按摩保健)
      const massage = stripHtml(pd.Massage);
      if (massage) {
        r.massage_zh = massage;
      }

      // 8. Classical Refs (古籍文獻)
      if (pd.AcuEbook_JSON && Array.isArray(pd.AcuEbook_JSON) && pd.AcuEbook_JSON.length > 0) {
        r.classical_refs = pd.AcuEbook_JSON.map(e => ({
          source_zh: cleanText(e.EBookNameCH),
          excerpt_zh: cleanText(e.Excerpt),
          url: e.Url ? `https://cloudtcm.com${e.Url}` : null
        })).filter(e => e.excerpt_zh);
      }

      // 9. Acu Tags (功效與分類標籤)
      if (pd.AcuTag_JSON && Array.isArray(pd.AcuTag_JSON) && pd.AcuTag_JSON.length > 0) {
        r.acu_tags = pd.AcuTag_JSON.map(t => cleanText(t.title)).filter(Boolean);
      }

      // 10. Additional Metadata
      if (pd.OtherNameCH) r.other_names_zh = cleanText(pd.OtherNameCH);
      if (pd.NameIntroCH) r.name_intro_zh = cleanText(pd.NameIntroCH);
      if (pd.WuShuPoint) r.wushu_point = cleanText(pd.WuShuPoint);

      // Provenance
      r.cloudtcm_url = pageUrl;
      r.cloudtcm_fetched_at = new Date().toISOString();
      r.source_type = "sourced_cloudtcm_record";
      r.review_status = "draft";

      const fieldsAdded = [
        cautionItems && 'cautions',
        acumethod && 'needling',
        moxa && 'moxa',
        detail && 'research',
        combine && 'combine_points',
        anatomy && 'anatomy',
        massage && 'massage',
        r.classical_refs && 'classical_refs',
        r.acu_tags && 'acu_tags'
      ].filter(Boolean);

      console.log(`[OK] ${code} ${r.chinese || ''}: ${fieldsAdded.join(', ')}`);
      filled++;
    } catch (e) {
      console.error(`  [ERR] ${code}: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n=== Acupoint Enrichment Complete: ${filled} enriched, ${skipped} skipped ===`);

  if (IS_TEST) {
    const sample = toProcess.find(r => r.code === 'LU1');
    if (sample) {
      console.log('\nSample LU1 (中府):');
      console.log('  cautions_zh:', sample.cautions_zh);
      console.log('  acumethod_zh:', sample.acumethod_zh?.slice(0, 100));
      console.log('  moxa_zh:', sample.moxa_zh?.slice(0, 100));
      console.log('  modern_research_zh:', sample.modern_research_zh?.slice(0, 100));
      console.log('  combine_points_zh:', sample.combine_points_zh?.slice(0, 100));
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

function cleanText(str) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/[\uFFFD\uFFFC]+/g, '').trim();
}

main();
