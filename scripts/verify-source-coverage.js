const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const manifestPath = 'data/pharmacology/v7_source_manifest.json';
const f02Path = 'curriculum/pharm/v7_extracted/02_PHARM_BATCH_P1_ANTICOAG_ANTIPLATELET.md';
const f15Path = 'curriculum/pharm/v7_extracted/15_PHARM_BATCH_P10_COMMON_OUTPATIENT_BREADTH_A.md';

function normalizeText(str) {
  if (!str) return '';
  return str
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/`/g, '')
    .replace(/^[-+*]\s+/, '')
    .replace(/^\d+\.\s+/, '')
    .replace(/”/g, '"')
    .replace(/“/g, '"')
    .replace(/’/g, "'")
    .replace(/→/g, '->')
    .replace(/\s+/g, ' ')
    .trim();
}

function verifySourceManifest() {
  if (!fs.existsSync(manifestPath)) {
    console.error(`FATAL: Source manifest file missing at ${manifestPath}`);
    return { passed: false, reason: 'MANIFEST_MISSING' };
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const results = [];

  for (const src of manifest.sources || []) {
    const p = src.logical_source_path;
    if (!fs.existsSync(p)) {
      console.error(`FATAL: Required source file missing locally: ${p}`);
      console.error(`Requirement: ${src.source_availability_requirement}`);
      return { passed: false, reason: `FILE_MISSING: ${p}` };
    }

    const buf = fs.readFileSync(p);
    const actualSha = crypto.createHash('sha256').update(buf).digest('hex');
    const actualSize = buf.length;

    if (actualSha !== src.sha256) {
      console.error(`FATAL SOURCE DRIFT: SHA-256 mismatch for ${p}`);
      console.error(`  Expected: ${src.sha256}`);
      console.error(`  Actual:   ${actualSha}`);
      return { passed: false, reason: `SOURCE_DRIFT_SHA: ${p}` };
    }

    if (actualSize !== src.byte_size) {
      console.error(`FATAL SOURCE DRIFT: Byte size mismatch for ${p}`);
      console.error(`  Expected: ${src.byte_size}`);
      console.error(`  Actual:   ${actualSize}`);
      return { passed: false, reason: `SOURCE_DRIFT_SIZE: ${p}` };
    }

    results.push({ path: p, sha256: actualSha, size: actualSize, status: 'MATCH' });
  }

  return { passed: true, manifest, results };
}

function extractSourceMedicalFacts(drugId) {
  const filePath = (drugId === 'drug.losartan' || drugId === 'drug.hydrochlorothiazide') 
    ? f15Path
    : f02Path;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Local source file not found: ${filePath}. Please unzip curriculum/pharm/AcuTing_Pharm_Master_Extraction_v7.zip into curriculum/pharm/v7_extracted/`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let start = -1;
  let end = lines.length;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('**ID:**') && lines[i].includes('`' + drugId + '`')) {
      start = i;
      break;
    }
  }

  if (start === -1) return [];

  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith('# ') || (lines[i].includes('**ID:**') && lines[i].includes('`drug.'))) {
      end = i;
      break;
    }
  }

  const drugLines = lines.slice(start, end);
  const items = [];
  let currentSection = 'Identity';

  for (let i = 0; i < drugLines.length; i++) {
    const rawLine = drugLines[i];
    const line = rawLine.trim();

    if (!line || line === '---') continue;

    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
      continue;
    }

    if (line.startsWith('**') && line.includes(':**')) {
      const parts = line.split(':**');
      const key = parts[0].replace('**', '').trim();
      const val = parts.slice(1).join(':**').trim();

      if (['ID', 'Board priority', 'Prototype', 'Board category', 'Board categories', 'Status', 'Aliases'].includes(key)) {
        continue;
      }

      if (['Class', 'Brand example', 'Brand', 'Suffix'].includes(key)) {
        items.push({
          source_file: filePath,
          source_section: 'Identity',
          source_text: line,
          normalized_text: normalizeText(line),
          key
        });
        continue;
      }

      if (key === 'Flags') {
        const flags = val.replace(/`/g, '').split(',').map(f => f.trim()).filter(Boolean);
        flags.forEach(flag => {
          items.push({
            source_file: filePath,
            source_section: currentSection + ' -> Flags',
            source_text: flag,
            normalized_text: normalizeText(flag),
            key: 'Flags'
          });
        });
        continue;
      }
    }

    // Skip structural headers
    if (['**High-yield / 考試重點**', '**Classic comparison**', '**Potential medication contribution:**', 'Compare:', 'Potential medication contribution:'].includes(line)) {
      continue;
    }

    // Bullets, provenance lines, or narrative text
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('Course provenance:') || line.startsWith('http://') || line.startsWith('https://')) {
      items.push({
        source_file: filePath,
        source_section: currentSection,
        source_text: line,
        normalized_text: normalizeText(line)
      });
      continue;
    }

    if (!line.startsWith('**ID:') && !line.startsWith('**Flags:')) {
      items.push({
        source_file: filePath,
        source_section: currentSection,
        source_text: line,
        normalized_text: normalizeText(line)
      });
    }
  }

  return items;
}

const pilotIds = [
  'drug.warfarin',
  'drug.apixaban',
  'drug.clopidogrel',
  'drug.aspirin',
  'drug.enoxaparin',
  'drug.losartan',
  'drug.hydrochlorothiazide'
];

function runSourceCoverageVerification() {
  const manifestVerification = verifySourceManifest();
  if (!manifestVerification.passed) {
    return {
      passed: false,
      reason: manifestVerification.reason,
      totalExtracted: 0,
      totalLedgerMatched: 0,
      totalMissingFromLedger: -1,
      totalLedgerNotFoundInSource: -1,
      totalDuplicateCoverage: -1
    };
  }

  const stagingData = JSON.parse(fs.readFileSync('data/pharmacology/staging_v7_ingestion.json', 'utf8'));
  const ledger = stagingData.ledger || [];

  // Map by drug_id + normalized_text
  const ledgerByDrugAndNormalized = new Map();
  ledger.forEach(item => {
    if (item.derived) return;
    const key = `${item.drug_id}|||${normalizeText(item.source_text)}`;
    if (!ledgerByDrugAndNormalized.has(key)) {
      ledgerByDrugAndNormalized.set(key, []);
    }
    ledgerByDrugAndNormalized.get(key).push(item);
  });

  const report = {
    manifestVerification,
    perDrug: {},
    totalExtracted: 0,
    totalLedgerMatched: 0,
    totalMissingFromLedger: 0,
    totalLedgerNotFoundInSource: 0,
    totalDuplicateCoverage: 0,
    missingItems: [],
    notFoundLedgerItems: [],
    duplicateCoverageItems: []
  };

  const matchedLedgerIds = new Set();

  pilotIds.forEach(drugId => {
    const extractedItems = extractSourceMedicalFacts(drugId);
    let matchedCount = 0;
    let missingCount = 0;

    extractedItems.forEach(src => {
      const key = `${drugId}|||${src.normalized_text}`;
      const matches = ledgerByDrugAndNormalized.get(key);
      if (!matches || matches.length === 0) {
        missingCount++;
        report.missingItems.push({ drugId, item: src });
      } else {
        matchedCount++;
        matches.forEach(m => matchedLedgerIds.add(m.source_item_id));
        if (matches.length > 1) {
          report.duplicateCoverageItems.push({ drugId, src, matches: matches.map(m => m.source_item_id) });
        }
      }
    });

    report.perDrug[drugId] = {
      extracted: extractedItems.length,
      matched: matchedCount,
      missing: missingCount
    };

    report.totalExtracted += extractedItems.length;
    report.totalLedgerMatched += matchedCount;
    report.totalMissingFromLedger += missingCount;
  });

  // Check ledger items not found in source
  ledger.forEach(item => {
    if (item.derived) return;
    if (!matchedLedgerIds.has(item.source_item_id)) {
      report.totalLedgerNotFoundInSource++;
      report.notFoundLedgerItems.push(item);
    }
  });

  report.totalDuplicateCoverage = report.duplicateCoverageItems.length;
  report.passed = (
    manifestVerification.passed &&
    report.totalMissingFromLedger === 0 &&
    report.totalLedgerNotFoundInSource === 0 &&
    report.totalDuplicateCoverage === 0
  );

  return report;
}

if (require.main === module) {
  console.log('====================================================');
  console.log('INDEPENDENT SOURCE-TO-LEDGER COVERAGE VERIFIER');
  console.log('====================================================');
  const rep = runSourceCoverageVerification();
  if (!rep.passed) {
    console.error(`\nFATAL: Verification failed! Reason: ${rep.reason || 'Coverage incomplete'}`);
    process.exit(1);
  }

  console.table(rep.perDrug);
  console.log('\nTotal Source Extracted Atomic Items:', rep.totalExtracted);
  console.log('Total Ledger Matched:', rep.totalLedgerMatched);
  console.log('Missing Source Items from Ledger:', rep.totalMissingFromLedger);
  console.log('Ledger Items Not Found in Source:', rep.totalLedgerNotFoundInSource);
  console.log('Duplicate Source Coverage:', rep.totalDuplicateCoverage);

  console.log('\n====================================================');
  console.log('MANIFEST HASH CHECK & SOURCE COVERAGE PASSED 100%!');
  console.log('====================================================');
}

module.exports = { runSourceCoverageVerification, verifySourceManifest, extractSourceMedicalFacts, normalizeText };
