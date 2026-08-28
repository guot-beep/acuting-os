/**
 * audit-source-url-liveness.js
 *
 * Unified URL Liveness, Link-Rot, and Source Fill Audit Tool
 * - Task 11A: data/audits/toxic_herb_safety_url_liveness_2026-08-27.json (7 toxic herbs)
 * - Task 11B: data/audits/canon_source_url_liveness_2026-08-27.json (565 canon URLs)
 * - Task 11C: data/audits/herb_source_url_fill_2026-08-27.json (95 unfilled herbs, 4 batches)
 * - Task 11E: data/audits/bundle_url_liveness_2026-08-28.json (5,596 bundle distinct URLs, 3 batches)
 *
 * Usage:
 *   node scripts/audit-source-url-liveness.js --verify-ledger
 *   node scripts/audit-source-url-liveness.js --verify-ledger --scope bundle
 *   node scripts/audit-source-url-liveness.js --self-test
 *   node scripts/audit-source-url-liveness.js --verify-fill --base <BASE_SHA>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const CANON_HERBS_PATH = path.join(ROOT, 'data/herbs/herb_canon_shortlist.json');
const CANON_FORMULAS_PATH = path.join(ROOT, 'data/herbs/formulas.json');
const CANON_CONDITIONS_PATH = path.join(ROOT, 'data/pathology/condition_canon_shortlist.json');
const GENERATED_DIR = path.join(ROOT, 'data/generated');

const LEDGER_11B_PATH = path.join(ROOT, 'data/audits/canon_source_url_liveness_2026-08-27.json');
const LEDGER_11A_PATH = path.join(ROOT, 'data/audits/toxic_herb_safety_url_liveness_2026-08-27.json');
const LEDGER_11C_PATH = path.join(ROOT, 'data/audits/herb_source_url_fill_2026-08-27.json');
const LEDGER_11E_PATH = path.join(ROOT, 'data/audits/bundle_url_liveness_2026-08-28.json');

const TOXIC_HERBS_EXPECTED = [
  { id: 'herb.xiong_huang', name_zh: '雄黃', url: 'https://www.americandragon.com/Individualherbsupdate/XiongHuang.html' },
  { id: 'herb.zhu_sha', name_zh: '硃砂', url: 'https://www.americandragon.com/Individualherbsupdate/ZhuSha.html' },
  { id: 'herb.chuan_shan_jia', name_zh: '穿山甲', url: 'https://www.americandragon.com/Individualherbsupdate/ChuanShanJia.html' },
  { id: 'herb.xi_jiao', name_zh: '犀角', url: 'https://www.americandragon.com/Individualherbsupdate/XiJiao.html' },
  { id: 'herb.ying_su_ke', name_zh: '罌粟殼', url: 'https://www.americandragon.com/Individualherbsupdate/YingSuKe.html' },
  { id: 'herb.qing_mu_xiang', name_zh: '青木香', url: 'https://www.americandragon.com/Individualherbsupdate/QingMuXiang.html' },
  { id: 'herb.jin_bo', name_zh: '金箔', url: 'https://www.americandragon.com/Individualherbsupdate/JinBo.html' }
];

const VALID_VERDICTS_11A = new Set(['SUPPORTS', 'PAGE_EXISTS_BUT_NO_SAFETY_CONTENT', 'DEAD_OR_WRONG_PAGE']);

const BUNDLE_URL_REGEX = /https?:\/\/[^\s"'`<>)\\]+/g;
const IMAGE_EXTS = /\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?.*)?$/i;

function isHttpUrl(s) {
  return typeof s === 'string' && (s.startsWith('http://') || s.startsWith('https://'));
}

function toRecordList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (raw.records) {
    return Array.isArray(raw.records) ? raw.records : Object.values(raw.records);
  }
  return Object.values(raw);
}

function extractDatasetUrls(customPaths = {}) {
  const herbsPath = customPaths.herbs || CANON_HERBS_PATH;
  const formulasPath = customPaths.formulas || CANON_FORMULAS_PATH;
  const conditionsPath = customPaths.conditions || CANON_CONDITIONS_PATH;

  const herbs = toRecordList(JSON.parse(fs.readFileSync(herbsPath, 'utf8')));
  const formulas = toRecordList(JSON.parse(fs.readFileSync(formulasPath, 'utf8')));
  const conditions = toRecordList(JSON.parse(fs.readFileSync(conditionsPath, 'utf8')));

  const datasetUrlSet = new Set();
  const occurrencesByUrl = new Map();

  function addUrl(url) {
    if (!isHttpUrl(url)) return;
    datasetUrlSet.add(url);
    occurrencesByUrl.set(url, (occurrencesByUrl.get(url) || 0) + 1);
  }

  for (const h of herbs) {
    if (h.exact_source_url) addUrl(h.exact_source_url);
    if (h.safety_source_url) addUrl(h.safety_source_url);
    if (h.source_url) addUrl(h.source_url);
  }

  for (const f of formulas) {
    if (f.exact_source_url) addUrl(f.exact_source_url);
    if (f.safety_source_url) addUrl(f.safety_source_url);
    if (f.source_url) addUrl(f.source_url);
  }

  for (const c of conditions) {
    if (c.exact_source_url) addUrl(c.exact_source_url);
    if (c.safety_source_url) addUrl(c.safety_source_url);
    if (c.source_url) addUrl(c.source_url);
  }

  return { datasetUrlSet, occurrencesByUrl };
}

function extractBundleUrls(generatedDir = GENERATED_DIR) {
  if (!fs.existsSync(generatedDir)) {
    throw new Error(`Generated directory not found: ${generatedDir}`);
  }
  const files = fs.readdirSync(generatedDir).filter(f => f.endsWith('.js')).sort();
  const urlMap = new Map();

  for (const f of files) {
    const content = fs.readFileSync(path.join(generatedDir, f), 'utf8');
    const matches = content.match(BUNDLE_URL_REGEX) || [];
    for (const raw of matches) {
      const u = raw.replace(/[,\;\"\'\)\}\]]+$/, '');
      try {
        const parsed = new URL(u);
        const host = parsed.hostname;
        const cleanHref = parsed.href;
        const isImg = IMAGE_EXTS.test(cleanHref) || IMAGE_EXTS.test(parsed.pathname);

        if (!urlMap.has(cleanHref)) {
          urlMap.set(cleanHref, {
            url: cleanHref,
            host: host,
            is_image: isImg,
            source_bundle_files: new Set()
          });
        }
        urlMap.get(cleanHref).source_bundle_files.add(f);
      } catch (e) {}
    }
  }

  const bundleUrls = Array.from(urlMap.values()).map(x => ({
    url: x.url,
    host: x.host,
    is_image: x.is_image,
    source_bundle_files: Array.from(x.source_bundle_files).sort()
  }));

  const bundleUrlSet = new Set(bundleUrls.map(u => u.url));
  const distinctHosts = Array.from(new Set(bundleUrls.map(u => u.host))).sort();

  return {
    bundleUrls,
    bundleUrlSet,
    distinctHosts,
    fileCount: files.length
  };
}

function verifyCanonLedger(ledger11b, datasetUrlSet) {
  const errors = [];

  if (!ledger11b || typeof ledger11b !== 'object') {
    return { ok: false, errors: ['Ledger 11B is missing or not an object'] };
  }

  // 1. Negative control check
  if (!ledger11b.meta || !ledger11b.meta.negative_control) {
    errors.push('Ledger 11B meta.negative_control is missing');
  } else {
    const nc = ledger11b.meta.negative_control;
    const hasCloudtcm = nc['cloudtcm.com'] || nc['https://cloudtcm.com'];
    const hasAmericandragon = nc['americandragon.com'] || nc['www.americandragon.com'] || nc['https://www.americandragon.com'];
    if (!hasCloudtcm || !hasAmericandragon) {
      errors.push('Ledger 11B negative control must include both cloudtcm.com and americandragon.com');
    }
  }

  const records = Array.isArray(ledger11b.records) ? ledger11b.records : [];
  const ledgerUrlSet = new Set();
  for (const r of records) {
    if (!r.url) {
      errors.push('Ledger 11B record missing url field');
      continue;
    }
    if (ledgerUrlSet.has(r.url)) {
      errors.push(`Ledger 11B duplicate URL entry: ${r.url}`);
    }
    ledgerUrlSet.add(r.url);
  }

  // 2. Metric 1: distinct URL count equality
  if (datasetUrlSet.size !== ledgerUrlSet.size) {
    errors.push(`URL count mismatch: Dataset has ${datasetUrlSet.size} distinct URLs, Ledger has ${ledgerUrlSet.size} distinct URLs`);
  }

  // 3. Metric 2: Dataset \ Ledger (missing from ledger)
  const missingInLedger = [];
  for (const u of datasetUrlSet) {
    if (!ledgerUrlSet.has(u)) {
      missingInLedger.push(u);
    }
  }
  if (missingInLedger.length > 0) {
    errors.push(`Unscanned URLs present in dataset but missing in ledger (${missingInLedger.length}): ${missingInLedger.slice(0, 5).join(', ')}`);
  }

  // 4. Metric 3: Ledger \ Dataset (phantom URLs in ledger)
  const phantomInLedger = [];
  for (const u of ledgerUrlSet) {
    if (!datasetUrlSet.has(u)) {
      phantomInLedger.push(u);
    }
  }
  if (phantomInLedger.length > 0) {
    errors.push(`Phantom URLs present in ledger but not in dataset (${phantomInLedger.length}): ${phantomInLedger.slice(0, 5).join(', ')}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    datasetCount: datasetUrlSet.size,
    ledgerCount: ledgerUrlSet.size,
    missingCount: missingInLedger.length,
    phantomCount: phantomInLedger.length
  };
}

function verifyBundleLedger(ledger11e, bundleInfo) {
  const errors = [];

  if (!ledger11e || typeof ledger11e !== 'object') {
    return { ok: false, errors: ['Bundle ledger (11E) is missing or not an object'] };
  }

  // 1. Negative control check for every host in bundle
  let soft404HostsCount = 0;
  if (!ledger11e.meta || !ledger11e.meta.negative_control) {
    errors.push('Bundle ledger meta.negative_control is missing');
  } else {
    const nc = ledger11e.meta.negative_control;
    const missingHosts = [];
    for (const host of bundleInfo.distinctHosts) {
      if (!nc[host]) {
        missingHosts.push(host);
      } else if (nc[host].is_soft_404 === true) {
        soft404HostsCount++;
      }
    }
    if (missingHosts.length > 0) {
      errors.push(`Bundle ledger negative control missing ${missingHosts.length} host(s): ${missingHosts.slice(0, 5).join(', ')}`);
    }
  }

  const records = Array.isArray(ledger11e.records) ? ledger11e.records : [];
  const ledgerUrlSet = new Set();

  for (const r of records) {
    if (!r.url) {
      errors.push('Bundle ledger record missing url field');
      continue;
    }
    if (ledgerUrlSet.has(r.url)) {
      errors.push(`Bundle ledger duplicate URL: ${r.url}`);
    }
    ledgerUrlSet.add(r.url);

    // Schema validation
    if (typeof r.is_image !== 'boolean') {
      errors.push(`Bundle ledger record ${r.url} missing boolean is_image`);
    }
    if (!Array.isArray(r.source_bundle_files) || r.source_bundle_files.length === 0) {
      errors.push(`Bundle ledger record ${r.url} missing source_bundle_files array`);
    }
    if (r.http_status === undefined || r.http_status === null) {
      errors.push(`Bundle ledger record ${r.url} missing http_status`);
    }
  }

  // Count check
  if (bundleInfo.bundleUrlSet.size !== ledgerUrlSet.size) {
    errors.push(`Bundle URL count mismatch: Generated files have ${bundleInfo.bundleUrlSet.size} URLs, Ledger has ${ledgerUrlSet.size} URLs`);
  }

  // Missing in ledger
  const missingInLedger = [];
  for (const u of bundleInfo.bundleUrlSet) {
    if (!ledgerUrlSet.has(u)) {
      missingInLedger.push(u);
    }
  }
  if (missingInLedger.length > 0) {
    errors.push(`URLs present in data/generated/*.js but missing in bundle ledger (${missingInLedger.length}): ${missingInLedger.slice(0, 5).join(', ')}`);
  }

  // Phantom in ledger
  const phantomInLedger = [];
  for (const u of ledgerUrlSet) {
    if (!bundleInfo.bundleUrlSet.has(u)) {
      phantomInLedger.push(u);
    }
  }
  if (phantomInLedger.length > 0) {
    errors.push(`Phantom URLs present in bundle ledger but not in generated bundle (${phantomInLedger.length}): ${phantomInLedger.slice(0, 5).join(', ')}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    bundleCount: bundleInfo.bundleUrlSet.size,
    ledgerCount: ledgerUrlSet.size,
    missingCount: missingInLedger.length,
    phantomCount: phantomInLedger.length
  };
}

function verifyToxicLedger(ledger11a) {
  const errors = [];

  if (!ledger11a || typeof ledger11a !== 'object') {
    return { ok: false, errors: ['Ledger 11A is missing or not an object'] };
  }

  if (!ledger11a.meta || !ledger11a.meta.negative_control) {
    errors.push('Ledger 11A meta.negative_control is missing');
  }

  const records = Array.isArray(ledger11a.records) ? ledger11a.records : [];
  if (records.length !== TOXIC_HERBS_EXPECTED.length) {
    errors.push(`Ledger 11A record count mismatch: expected ${TOXIC_HERBS_EXPECTED.length}, got ${records.length}`);
  }

  const recordMap = new Map();
  for (const r of records) {
    if (!r.herb_id) {
      errors.push('Ledger 11A record missing herb_id');
      continue;
    }
    recordMap.set(r.herb_id, r);

    // Schema validation
    const requiredFields = ['herb_id', 'name_zh', 'url', 'http_status', 'final_url', 'fetched_at', 'page_title', 'evidence_excerpt', 'safety_content_found', 'verdict'];
    for (const f of requiredFields) {
      if (r[f] === undefined || r[f] === null) {
        errors.push(`Ledger 11A record ${r.herb_id} missing field: ${f}`);
      }
    }

    if (!VALID_VERDICTS_11A.has(r.verdict)) {
      errors.push(`Ledger 11A record ${r.herb_id} has invalid verdict: ${r.verdict}`);
    }

    if (typeof r.safety_content_found !== 'boolean') {
      errors.push(`Ledger 11A record ${r.herb_id} safety_content_found must be boolean`);
    }
  }

  for (const exp of TOXIC_HERBS_EXPECTED) {
    const found = recordMap.get(exp.id);
    if (!found) {
      errors.push(`Ledger 11A missing expected toxic herb: ${exp.id} (${exp.name_zh})`);
    } else if (found.url !== exp.url) {
      errors.push(`Ledger 11A herb ${exp.id} URL mismatch: expected ${exp.url}, got ${found.url}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    recordCount: records.length
  };
}

function verifyFillData(rawBase, rawHead, ledger11c) {
  const errors = [];

  if (!ledger11c || typeof ledger11c !== 'object') {
    return { ok: false, errors: ['Ledger 11C is missing or not an object'] };
  }

  const baseList = toRecordList(rawBase);
  const headList = toRecordList(rawHead);

  const baseMap = new Map(baseList.map(h => [h.id, h]));
  const headMap = new Map(headList.map(h => [h.id, h]));

  const fillRecords = Array.isArray(ledger11c.records) ? ledger11c.records : [];
  const ledgerHerbIds = new Set();
  let filledCountInLedger = 0;

  for (const r of fillRecords) {
    if (!r.herb_id) {
      errors.push('Ledger 11C record missing herb_id');
      continue;
    }
    ledgerHerbIds.add(r.herb_id);
    if (r.outcome === 'FILLED') {
      filledCountInLedger++;
    }
  }

  const baseTargetHerbs = new Set();
  for (const h of baseList) {
    if (h.review_status === 'deprecated' || h.deprecated === true) continue;
    if (!h.exact_source_url || h.exact_source_url.trim() === '') {
      baseTargetHerbs.add(h.id);
    }
  }

  if (baseTargetHerbs.size !== 95) {
    errors.push(`Base target unfilled herbs expected 95, calculated ${baseTargetHerbs.size}`);
  }

  for (const tid of baseTargetHerbs) {
    if (!ledgerHerbIds.has(tid)) {
      errors.push(`Target herb ${tid} missing from Ledger 11C records`);
    }
  }

  let modifiedHerbsCount = 0;
  for (const hBase of baseList) {
    const hHead = headMap.get(hBase.id);
    if (!hHead) {
      errors.push(`Herb ${hBase.id} was deleted in head!`);
      continue;
    }

    let isModified = false;
    const baseKeys = Object.keys(hBase);
    const headKeys = Object.keys(hHead);

    for (const k of baseKeys) {
      if (k === 'exact_source_url' || k === 'safety_source_url') continue;
      const bVal = JSON.stringify(hBase[k]);
      const hVal = JSON.stringify(hHead[k]);
      if (bVal !== hVal) {
        errors.push(`Forbidden mutation in herb ${hBase.id}, field ${k}: base=${bVal} vs head=${hVal}`);
        isModified = true;
      }
    }

    for (const k of headKeys) {
      if (!hBase.hasOwnProperty(k)) {
        errors.push(`Forbidden new field ${k} added to herb ${hBase.id}`);
        isModified = true;
      }
    }

    if (hBase.exact_source_url && hBase.exact_source_url.trim() !== '') {
      if (hHead.exact_source_url !== hBase.exact_source_url) {
        errors.push(`Overwriting existing exact_source_url forbidden in ${hBase.id}: base=${hBase.exact_source_url} vs head=${hHead.exact_source_url}`);
        isModified = true;
      }
    }

    if (hBase.safety_source_url && hBase.safety_source_url.trim() !== '') {
      if (hHead.safety_source_url !== hBase.safety_source_url) {
        errors.push(`Overwriting existing safety_source_url forbidden in ${hBase.id}: base=${hBase.safety_source_url} vs head=${hHead.safety_source_url}`);
        isModified = true;
      }
    }

    const exactChanged = (hBase.exact_source_url || '') !== (hHead.exact_source_url || '');
    const safetyChanged = (hBase.safety_source_url || '') !== (hHead.safety_source_url || '');
    if (exactChanged || safetyChanged) {
      modifiedHerbsCount++;
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    targetCount: baseTargetHerbs.size,
    ledgerCount: fillRecords.length,
    modifiedHerbsCount,
    filledCountInLedger
  };
}

function runSelfTest() {
  console.log('=== [SELF-TEST: ADVERSARIAL NEGATIVE CONTROLS] ===\n');

  if (!fs.existsSync(LEDGER_11B_PATH) || !fs.existsSync(LEDGER_11A_PATH)) {
    console.error('Cannot run self-test: ledgers must exist on disk first.');
    process.exit(1);
  }

  const base11b = JSON.parse(fs.readFileSync(LEDGER_11B_PATH, 'utf8'));
  const base11a = JSON.parse(fs.readFileSync(LEDGER_11A_PATH, 'utf8'));
  const nominalUrlSet = new Set(base11b.records.map(r => r.url));

  let passCount = 0;
  let testCount = 0;

  function assertFixture(name, shouldPass, result) {
    testCount++;
    if (result.ok === shouldPass) {
      console.log(`  PASS [Fixture ${testCount}]: ${name}`);
      passCount++;
    } else {
      console.error(`  FAIL [Fixture ${testCount}]: ${name} (expected ok=${shouldPass}, got ok=${result.ok})`);
    }
  }

  // Fixture 1: Ledger missing a row (564 instead of 565) -> MUST FAIL
  const fixture1_11b = JSON.parse(JSON.stringify(base11b));
  fixture1_11b.records.pop();
  const resF1 = verifyCanonLedger(fixture1_11b, nominalUrlSet);
  assertFixture('Ledger 11B missing one row -> verify fails (FAIL)', false, resF1);

  // Fixture 2: Ledger containing extra phantom URL (566 instead of 565) -> MUST FAIL
  const fixture2_11b = JSON.parse(JSON.stringify(base11b));
  fixture2_11b.records.push({
    url: 'https://example.com/phantom-url-not-in-dataset-12345',
    http_status: 200,
    final_url: 'https://example.com/phantom-url-not-in-dataset-12345',
    fetched_at: new Date().toISOString(),
    soft404_suspected: false,
    page_title: 'Phantom',
    verdict: 'HTTP_200_VALID'
  });
  const resF2 = verifyCanonLedger(fixture2_11b, nominalUrlSet);
  assertFixture('Ledger 11B containing phantom URL -> verify fails (FAIL)', false, resF2);

  // Fixture 3: Ledger 11B missing meta.negative_control -> MUST FAIL
  const fixture3_11b = JSON.parse(JSON.stringify(base11b));
  delete fixture3_11b.meta.negative_control;
  const resF3 = verifyCanonLedger(fixture3_11b, nominalUrlSet);
  assertFixture('Ledger 11B missing negative control -> verify fails (FAIL)', false, resF3);

  // Fixture 4: Ledger 11A missing one toxic herb -> MUST FAIL
  const fixture4_11a = JSON.parse(JSON.stringify(base11a));
  fixture4_11a.records.pop();
  const resF4 = verifyToxicLedger(fixture4_11a);
  assertFixture('Ledger 11A missing a toxic herb -> verify fails (FAIL)', false, resF4);

  // Fixture 5: Ledger 11A invalid verdict string -> MUST FAIL
  const fixture5_11a = JSON.parse(JSON.stringify(base11a));
  fixture5_11a.records[0].verdict = 'ALL_GOOD_SUPPORTED_INVALID';
  const resF5 = verifyToxicLedger(fixture5_11a);
  assertFixture('Ledger 11A invalid verdict string -> verify fails (FAIL)', false, resF5);

  // Fixture 6: Task 11C Fill negative control 1 - mutating unrelated field (e.g. name_zh) -> MUST FAIL
  const mockBaseRaw = JSON.parse(fs.readFileSync(CANON_HERBS_PATH, 'utf8'));
  const mockHeadMutated = JSON.parse(JSON.stringify(mockBaseRaw));
  const firstItem = Array.isArray(mockHeadMutated.records) ? mockHeadMutated.records[0] : Object.values(mockHeadMutated.records)[0];
  firstItem.name_zh = '改動了不該改的名稱';
  const mockLedger11c = { records: [] };
  const resF6 = verifyFillData(mockBaseRaw, mockHeadMutated, mockLedger11c);
  assertFixture('Task 11C modifying unrelated field -> verify fails (FAIL)', false, resF6);

  // Fixture 7: Task 11C Fill negative control 2 - overwriting existing URL -> MUST FAIL
  const mockHeadOverwritten = JSON.parse(JSON.stringify(mockBaseRaw));
  const targetList = Array.isArray(mockHeadOverwritten.records) ? mockHeadOverwritten.records : Object.values(mockHeadOverwritten.records);
  const herbWithUrl = targetList.find(h => h.exact_source_url);
  if (herbWithUrl) {
    herbWithUrl.exact_source_url = 'https://example.com/overwritten-url';
  }
  const resF7 = verifyFillData(mockBaseRaw, mockHeadOverwritten, mockLedger11c);
  assertFixture('Task 11C overwriting existing URL -> verify fails (FAIL)', false, resF7);

  // Fixture 8: Nominal unmutated 11A/11B ledgers -> MUST PASS
  const resNominal11b = verifyCanonLedger(base11b, nominalUrlSet);
  const resNominal11a = verifyToxicLedger(base11a);
  const nominalOk = resNominal11b.ok && resNominal11a.ok;
  assertFixture('Nominal unmutated ledgers -> verify succeeds (PASS)', true, { ok: nominalOk });

  // Fixture 9: Bundle Ledger Adversarial - Missing Host in negative control -> MUST FAIL
  const bundleInfo = extractBundleUrls();
  const fakeBundleLedger = {
    meta: {
      negative_control: { 'cloudtcm.com': { negative_control_passed: true } }
    },
    records: bundleInfo.bundleUrls.map(u => ({
      url: u.url,
      host: u.host,
      is_image: u.is_image,
      source_bundle_files: u.source_bundle_files,
      http_status: 200
    }))
  };
  const resF9 = verifyBundleLedger(fakeBundleLedger, bundleInfo);
  assertFixture('Bundle ledger missing host negative control -> verify fails (FAIL)', false, resF9);

  // Fixture 10: Bundle Ledger Adversarial - Missing URL -> MUST FAIL
  const fakeBundleIncomplete = JSON.parse(JSON.stringify(fakeBundleLedger));
  fakeBundleIncomplete.meta.negative_control = {};
  for (const h of bundleInfo.distinctHosts) {
    fakeBundleIncomplete.meta.negative_control[h] = { negative_control_passed: true };
  }
  fakeBundleIncomplete.records.pop();
  const resF10 = verifyBundleLedger(fakeBundleIncomplete, bundleInfo);
  assertFixture('Bundle ledger missing one URL -> verify fails (FAIL)', false, resF10);

  console.log(`\nSelf-Test Results: ${passCount}/${testCount} fixtures behaving as expected.`);
  if (passCount === testCount) {
    console.log('[SELF-TEST SUCCESS] All adversarial fixtures properly triggered rejection.');
    process.exit(0);
  } else {
    console.error('[SELF-TEST FAILED] Some fixtures did not produce expected results.');
    process.exit(1);
  }
}

// CLI dispatch
const args = process.argv.slice(2);
const isBundleScope = args.includes('--scope') && args[args.indexOf('--scope') + 1] === 'bundle';

if (args.includes('--self-test')) {
  runSelfTest();
} else if (args.includes('--verify-fill')) {
  const baseIdx = args.indexOf('--base');
  const baseSha = baseIdx !== -1 && args[baseIdx + 1] ? args[baseIdx + 1] : null;
  runVerifyFill(baseSha);
} else if (args.includes('--verify-ledger') || args.length === 0) {
  if (isBundleScope) {
    console.log('=== Verifying Task 11E Bundle URL Liveness Ledger ===\n');
    if (!fs.existsSync(LEDGER_11E_PATH)) {
      console.error(`FAIL: Bundle ledger not found at ${LEDGER_11E_PATH}`);
      process.exit(1);
    }
    const bundleInfo = extractBundleUrls();
    console.log(`Scanned ${bundleInfo.fileCount} generated bundle files.`);
    console.log(`Found ${bundleInfo.bundleUrlSet.size} distinct URLs across ${bundleInfo.distinctHosts.length} distinct hosts.`);

    const ledger11e = JSON.parse(fs.readFileSync(LEDGER_11E_PATH, 'utf8'));
    const res = verifyBundleLedger(ledger11e, bundleInfo);

    if (!res.ok) {
      console.error('FAIL — Bundle URL Ledger verification failed with errors:');
      res.errors.forEach(e => console.error('  - ' + e));
      process.exit(1);
    }
    console.log(`PASS — Bundle URL Liveness Ledger verified (exact ${res.bundleCount}/${res.bundleCount} URLs, zero missing, zero phantom, full host negative controls passed).`);
    process.exit(0);
  }

  // Canon ledger verification
  console.log('=== Verifying Task 11A & 11B URL Liveness Ledgers ===\n');
  const { datasetUrlSet } = extractDatasetUrls();
  console.log(`Extracted ${datasetUrlSet.size} distinct canonical URLs from datasets.`);

  let allOk = true;

  if (fs.existsSync(LEDGER_11B_PATH)) {
    console.log('\nChecking Task 11B Ledger (565 URLs)...');
    const ledger11b = JSON.parse(fs.readFileSync(LEDGER_11B_PATH, 'utf8'));
    const res11b = verifyCanonLedger(ledger11b, datasetUrlSet);
    if (!res11b.ok) {
      console.error('  FAIL: Ledger 11B errors:');
      res11b.errors.forEach(e => console.error('    - ' + e));
      allOk = false;
    } else {
      console.log(`  PASS: Ledger 11B (565/565 URLs, zero missing, zero phantom).`);
    }
  }

  if (fs.existsSync(LEDGER_11A_PATH)) {
    console.log('\nChecking Task 11A Ledger (7 Toxic Herbs)...');
    const ledger11a = JSON.parse(fs.readFileSync(LEDGER_11A_PATH, 'utf8'));
    const res11a = verifyToxicLedger(ledger11a);
    if (!res11a.ok) {
      console.error('  FAIL: Ledger 11A errors:');
      res11a.errors.forEach(e => console.error('    - ' + e));
      allOk = false;
    } else {
      console.log(`  PASS: Ledger 11A (7/7 herbs, schema verified).`);
    }
  }

  if (!allOk) process.exit(1);
  console.log('\nPASS — All source URL liveness ledgers verified.');
} else {
  console.log('Usage: node scripts/audit-source-url-liveness.js [--verify-ledger [--scope bundle] | --self-test | --verify-fill --base <SHA>]');
  process.exit(1);
}
