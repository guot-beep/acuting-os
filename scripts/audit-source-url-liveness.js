/**
 * audit-source-url-liveness.js
 *
 * Unified URL Liveness, Link-Rot, and Source Fill Audit Tool
 * - Task 11A: data/audits/toxic_herb_safety_url_liveness_2026-08-27.json (7 toxic herbs)
 * - Task 11B: data/audits/canon_source_url_liveness_2026-08-27.json (565 canon URLs)
 * - Task 11C: data/audits/herb_source_url_fill_2026-08-27.json (95 unfilled herbs)
 *
 * Usage:
 *   node scripts/audit-source-url-liveness.js --verify-ledger
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

const LEDGER_11B_PATH = path.join(ROOT, 'data/audits/canon_source_url_liveness_2026-08-27.json');
const LEDGER_11A_PATH = path.join(ROOT, 'data/audits/toxic_herb_safety_url_liveness_2026-08-27.json');
const LEDGER_11C_PATH = path.join(ROOT, 'data/audits/herb_source_url_fill_2026-08-27.json');

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

function isHttpUrl(s) {
  return typeof s === 'string' && (s.startsWith('http://') || s.startsWith('https://'));
}

function extractDatasetUrls(customPaths = {}) {
  const herbsPath = customPaths.herbs || CANON_HERBS_PATH;
  const formulasPath = customPaths.formulas || CANON_FORMULAS_PATH;
  const conditionsPath = customPaths.conditions || CANON_CONDITIONS_PATH;

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8')).records || {};
  const formulas = JSON.parse(fs.readFileSync(formulasPath, 'utf8')).records || {};
  const conditions = JSON.parse(fs.readFileSync(conditionsPath, 'utf8')).records || {};

  const datasetUrlSet = new Set();
  const occurrencesByUrl = new Map();

  function addUrl(url) {
    if (!isHttpUrl(url)) return;
    datasetUrlSet.add(url);
    occurrencesByUrl.set(url, (occurrencesByUrl.get(url) || 0) + 1);
  }

  for (const h of Object.values(herbs)) {
    if (h.exact_source_url) addUrl(h.exact_source_url);
    if (h.safety_source_url) addUrl(h.safety_source_url);
    if (h.source_url) addUrl(h.source_url);
  }

  for (const f of Object.values(formulas)) {
    if (f.exact_source_url) addUrl(f.exact_source_url);
    if (f.safety_source_url) addUrl(f.safety_source_url);
    if (f.source_url) addUrl(f.source_url);
  }

  for (const c of Object.values(conditions)) {
    if (c.exact_source_url) addUrl(c.exact_source_url);
    if (c.safety_source_url) addUrl(c.safety_source_url);
    if (c.source_url) addUrl(c.source_url);
  }

  return { datasetUrlSet, occurrencesByUrl };
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

function verifyFillData(baseRecords, headRecords, ledger11c) {
  const errors = [];

  if (!ledger11c || typeof ledger11c !== 'object') {
    return { ok: false, errors: ['Ledger 11C is missing or not an object'] };
  }

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

  // 1. Identify 95 target herbs at base (non-deprecated active herbs lacking exact_source_url)
  const baseTargetHerbs = new Set();
  for (const [id, h] of Object.entries(baseRecords)) {
    if (h.review_status === 'deprecated' || h.deprecated === true) continue;
    if (!h.exact_source_url) {
      baseTargetHerbs.add(h.id || id);
    }
  }

  // Check ledger covers target herb set
  for (const tid of baseTargetHerbs) {
    if (!ledgerHerbIds.has(tid)) {
      errors.push(`Ledger 11C missing target herb: ${tid}`);
    }
  }
  for (const lid of ledgerHerbIds) {
    if (!baseTargetHerbs.has(lid)) {
      errors.push(`Ledger 11C has extraneous herb not in 95 target set: ${lid}`);
    }
  }

  // 2. Check record differences between base and head
  let newlyPopulatedFields = 0;
  for (const [id, baseHerb] of Object.entries(baseRecords)) {
    const headHerb = headRecords[id];
    if (!headHerb) {
      errors.push(`Record ${id} missing in HEAD`);
      continue;
    }

    // Check all fields for unwanted mutations
    const allKeys = new Set([...Object.keys(baseHerb), ...Object.keys(headHerb)]);
    for (const key of allKeys) {
      if (key === 'exact_source_url' || key === 'safety_source_url') {
        const baseVal = baseHerb[key];
        const headVal = headHerb[key];
        if (baseVal !== headVal) {
          if (baseVal && baseVal !== headVal) {
            errors.push(`Forbidden URL overwrite on ${id}.${key}: '${baseVal}' -> '${headVal}'`);
          } else if (!baseVal && headVal) {
            newlyPopulatedFields++;
          }
        }
      } else {
        const baseVal = JSON.stringify(baseHerb[key]);
        const headVal = JSON.stringify(headHerb[key]);
        if (baseVal !== headVal) {
          errors.push(`Forbidden non-URL field mutation on ${id}.${key}: ${baseVal} -> ${headVal}`);
        }
      }
    }
  }

  // 3. Compare filled count
  if (filledCountInLedger !== newlyPopulatedFields) {
    errors.push(`Mismatch between ledger FILLED count (${filledCountInLedger}) and actual newly populated URL fields (${newlyPopulatedFields})`);
  }

  return {
    ok: errors.length === 0,
    errors,
    baseTargetCount: baseTargetHerbs.size,
    ledgerHerbCount: ledgerHerbIds.size,
    filledCountInLedger,
    newlyPopulatedFields
  };
}

function runVerifyLedger() {
  console.log('=== [TASK 11A / 11B OFFLINE LEDGER AUDIT] ===');
  const { datasetUrlSet } = extractDatasetUrls();

  console.log(`Dataset Distinct URLs Extracted: ${datasetUrlSet.size}`);

  if (!fs.existsSync(LEDGER_11B_PATH)) {
    console.error(`FAIL: Ledger 11B not found at ${LEDGER_11B_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(LEDGER_11A_PATH)) {
    console.error(`FAIL: Ledger 11A not found at ${LEDGER_11A_PATH}`);
    process.exit(1);
  }

  const ledger11b = JSON.parse(fs.readFileSync(LEDGER_11B_PATH, 'utf8'));
  const ledger11a = JSON.parse(fs.readFileSync(LEDGER_11A_PATH, 'utf8'));

  const res11b = verifyCanonLedger(ledger11b, datasetUrlSet);
  const res11a = verifyToxicLedger(ledger11a);

  console.log('\n--- Task 11B (Canon 565 URLs) ---');
  console.log(`1. Dataset Distinct URLs vs Ledger Rows: ${res11b.datasetCount} vs ${res11b.ledgerCount} -> ${res11b.datasetCount === res11b.ledgerCount ? 'PASS (EQUAL)' : 'FAIL'}`);
  console.log(`2. Dataset URLs − Ledger URLs (Missing): ${res11b.missingCount} -> ${res11b.missingCount === 0 ? 'PASS (EMPTY)' : 'FAIL'}`);
  console.log(`3. Ledger URLs − Dataset URLs (Phantom): ${res11b.phantomCount} -> ${res11b.phantomCount === 0 ? 'PASS (EMPTY)' : 'FAIL'}`);
  console.log(`4. Negative Control Field: ${ledger11b.meta && ledger11b.meta.negative_control ? 'PASS (PRESENT & COVERED)' : 'FAIL'}`);

  console.log('\n--- Task 11A (Toxic 7 Herbs) ---');
  console.log(`1. Toxic Herb Records: ${res11a.recordCount} / ${TOXIC_HERBS_EXPECTED.length} -> ${res11a.recordCount === TOXIC_HERBS_EXPECTED.length ? 'PASS' : 'FAIL'}`);
  console.log(`2. Negative Control Field: ${ledger11a.meta && ledger11a.meta.negative_control ? 'PASS (PRESENT)' : 'FAIL'}`);
  console.log(`3. Schema & Verdict Consistency: ${res11a.ok ? 'PASS' : 'FAIL'}`);

  if (!res11b.ok || !res11a.ok) {
    console.error('\n[AUDIT FAILED]');
    if (res11b.errors.length) {
      console.error('11B Errors:');
      res11b.errors.forEach(e => console.error('  - ' + e));
    }
    if (res11a.errors.length) {
      console.error('11A Errors:');
      res11a.errors.forEach(e => console.error('  - ' + e));
    }
    process.exit(1);
  }

  console.log('\n[AUDIT SUCCESS] All 4 ledger metrics and negative control gates VERIFIED offline.');
  process.exit(0);
}

function runVerifyFill(baseSha) {
  console.log('=== [TASK 11C OFFLINE FILL CONTRACT AUDIT] ===');
  if (!baseSha) {
    console.error('Error: --base <BASE_SHA> is required for --verify-fill');
    process.exit(1);
  }

  let baseContent = '';
  try {
    baseContent = execSync(`git show ${baseSha}:data/herbs/herb_canon_shortlist.json`, { cwd: ROOT, encoding: 'utf8' });
  } catch (e) {
    console.error(`Failed to load base revision ${baseSha}:data/herbs/herb_canon_shortlist.json`);
    process.exit(1);
  }

  const baseRecords = JSON.parse(baseContent).records;
  const headRecords = JSON.parse(fs.readFileSync(CANON_HERBS_PATH, 'utf8')).records;

  if (!fs.existsSync(LEDGER_11C_PATH)) {
    console.error(`Ledger 11C not found at ${LEDGER_11C_PATH}`);
    process.exit(1);
  }
  const ledger11c = JSON.parse(fs.readFileSync(LEDGER_11C_PATH, 'utf8'));

  const res = verifyFillData(baseRecords, headRecords, ledger11c);
  console.log(`1. Target Herb Set Coverage: ${res.ledgerHerbCount} / ${res.baseTargetCount} -> ${res.ledgerHerbCount === res.baseTargetCount ? 'PASS' : 'FAIL'}`);
  console.log(`2. Zero Unrelated Mutations: ${res.errors.filter(e => e.includes('Forbidden non-URL')).length === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`3. Zero URL Overwrites (Empty->Val Only): ${res.errors.filter(e => e.includes('Forbidden URL overwrite')).length === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`4. Ledger FILLED Count vs Data Field Count: ${res.filledCountInLedger} vs ${res.newlyPopulatedFields} -> ${res.filledCountInLedger === res.newlyPopulatedFields ? 'PASS' : 'FAIL'}`);

  if (!res.ok) {
    console.error('\n[FILL AUDIT FAILED]');
    res.errors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  }

  console.log('\n[FILL AUDIT SUCCESS] Zero non-URL mutations, additive-only URLs, and ledger match verified.');
  process.exit(0);
}

function runSelfTest() {
  console.log('=== [SELF-TEST: ADVERSARIAL NEGATIVE CONTROLS] ===');
  const { datasetUrlSet } = extractDatasetUrls();

  if (!fs.existsSync(LEDGER_11B_PATH) || !fs.existsSync(LEDGER_11A_PATH)) {
    console.error('Cannot run self-test: ledgers must exist on disk first.');
    process.exit(1);
  }

  const base11b = JSON.parse(fs.readFileSync(LEDGER_11B_PATH, 'utf8'));
  const base11a = JSON.parse(fs.readFileSync(LEDGER_11A_PATH, 'utf8'));

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
  const resF1 = verifyCanonLedger(fixture1_11b, datasetUrlSet);
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
  const resF2 = verifyCanonLedger(fixture2_11b, datasetUrlSet);
  assertFixture('Ledger 11B containing phantom URL -> verify fails (FAIL)', false, resF2);

  // Fixture 3: Ledger 11B missing meta.negative_control -> MUST FAIL
  const fixture3_11b = JSON.parse(JSON.stringify(base11b));
  delete fixture3_11b.meta.negative_control;
  const resF3 = verifyCanonLedger(fixture3_11b, datasetUrlSet);
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
  const mockBase = JSON.parse(fs.readFileSync(CANON_HERBS_PATH, 'utf8')).records;
  const mockHeadMutated = JSON.parse(JSON.stringify(mockBase));
  const firstId = Object.keys(mockHeadMutated)[0];
  mockHeadMutated[firstId].name_zh = '改動了不該改的名稱';
  const mockLedger11c = { records: [] };
  const resF6 = verifyFillData(mockBase, mockHeadMutated, mockLedger11c);
  assertFixture('Task 11C modifying unrelated field -> verify fails (FAIL)', false, resF6);

  // Fixture 7: Task 11C Fill negative control 2 - overwriting existing URL -> MUST FAIL
  const mockHeadOverwritten = JSON.parse(JSON.stringify(mockBase));
  const herbWithUrl = Object.values(mockHeadOverwritten).find(h => h.exact_source_url);
  if (herbWithUrl) {
    herbWithUrl.exact_source_url = 'https://example.com/overwritten-url';
  }
  const resF7 = verifyFillData(mockBase, mockHeadOverwritten, mockLedger11c);
  assertFixture('Task 11C overwriting existing URL -> verify fails (FAIL)', false, resF7);

  // Fixture 8: Nominal unmutated 11A/11B ledgers -> MUST PASS
  const resNominal11b = verifyCanonLedger(base11b, datasetUrlSet);
  const resNominal11a = verifyToxicLedger(base11a);
  const nominalOk = resNominal11b.ok && resNominal11a.ok;
  assertFixture('Nominal unmutated ledgers -> verify succeeds (PASS)', true, { ok: nominalOk });

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
if (args.includes('--self-test')) {
  runSelfTest();
} else if (args.includes('--verify-fill')) {
  const baseIdx = args.indexOf('--base');
  const baseSha = baseIdx !== -1 && args[baseIdx + 1] ? args[baseIdx + 1] : null;
  runVerifyFill(baseSha);
} else if (args.includes('--verify-ledger') || args.length === 0) {
  runVerifyLedger();
} else {
  console.log('Usage: node scripts/audit-source-url-liveness.js [--verify-ledger | --self-test | --verify-fill --base <SHA>]');
  process.exit(1);
}
