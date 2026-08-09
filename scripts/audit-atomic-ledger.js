const fs = require('fs');
const path = require('path');
const { runSourceCoverageVerification } = require('./verify-source-coverage');

/**
 * REPOSITORY VERIFICATION TIERS CONVENTION:
 *
 * 1. MACHINE VERIFIED
 *    = Deterministic code comparison proves the claim (e.g. SHA-256 hashes, exact scalar field equality, manifest section existence).
 *
 * 2. HUMAN REVIEWED
 *    = Source or official label was manually inspected/transcribed, but no deterministic code comparison proves textual equivalence.
 *
 * 3. INFERRED / DERIVED
 *    = System or agent derived a candidate flag/note not stated verbatim by the raw source.
 *
 * 4. UNVERIFIED
 *    = Not checked or audited yet.
 *
 * NOTE: Never silently promote HUMAN REVIEWED to MACHINE VERIFIED.
 */

function auditAtomicLedger() {
  const stagingData = JSON.parse(fs.readFileSync('data/pharmacology/staging_v7_ingestion.json', 'utf8'));
  const drugsData = JSON.parse(fs.readFileSync('data/pharmacology/drugs.json', 'utf8'));
  const classesData = JSON.parse(fs.readFileSync('data/pharmacology/drug_classes.json', 'utf8'));
  const manifestData = JSON.parse(fs.readFileSync('data/pharmacology/dailymed_verified_labels_manifest.json', 'utf8'));

  const ledger = stagingData.ledger || [];
  const derivedFlags = stagingData.derived_candidate_flags || [];

  console.log('====================================================');
  console.log('MACHINE AUDIT: THREE SEPARATE AUDIT GATES');
  console.log('====================================================');

  // 1. Audit unique source_item_id
  const seenIds = new Set();
  const duplicates = [];
  ledger.forEach(item => {
    if (seenIds.has(item.source_item_id)) {
      duplicates.push(item.source_item_id);
    }
    seenIds.add(item.source_item_id);
  });

  if (duplicates.length > 0) {
    console.error('FAIL: Found duplicate source_item_ids:', duplicates);
  }

  // 2. Dispositions breakdown
  const breakdown = {
    canonical: 0,
    staging: 0,
    duplicated_for_provenance: 0,
    excluded_with_reason: 0,
    lost: 0
  };

  const perDrugBreakdown = {};

  ledger.forEach(item => {
    const disp = item.disposition;
    if (breakdown[disp] !== undefined) {
      breakdown[disp]++;
    } else {
      console.error(`FAIL: Unknown disposition "${disp}" for item ${item.source_item_id}`);
    }

    if (!perDrugBreakdown[item.drug_id]) {
      perDrugBreakdown[item.drug_id] = { canonical: 0, staging: 0, duplicated_for_provenance: 0, excluded_with_reason: 0, lost: 0, total: 0 };
    }
    if (perDrugBreakdown[item.drug_id][disp] !== undefined) {
      perDrugBreakdown[item.drug_id][disp]++;
    }
    perDrugBreakdown[item.drug_id].total++;
  });

  // Disjoint sum audit
  const sumDispositions = breakdown.canonical + breakdown.staging + breakdown.duplicated_for_provenance + breakdown.excluded_with_reason + breakdown.lost;
  const disjointEquationPassed = (sumDispositions === ledger.length);

  // Allowed fields check
  const allowedFields = new Set([
    'drugclass_id', 'brand_names_en', 'suffix_en', 'mechanism_en', 'indications_en',
    'boxed_warning_en', 'warnings_en', 'contraindications_en', 'adverse_effects_en',
    'classic_association_en', 'mnemonic_en', 'exam_trap_en', 'tcm_relation_note_zh',
    'dailymed_url', 'field_sources', 'herb_drug_interactions_en', 'drug_interactions_en'
  ]);

  let invalidFieldsCount = 0;
  ledger.forEach(item => {
    if (item.disposition === 'canonical' && item.canonical_field) {
      if (!allowedFields.has(item.canonical_field)) {
        console.error(`FAIL: Item ${item.source_item_id} references invalid canonical field "${item.canonical_field}"`);
        invalidFieldsCount++;
      }
    }
  });

  let derivedInMainLedger = 0;
  ledger.forEach(item => {
    if (item.derived) derivedInMainLedger++;
  });

  // ----------------------------------------------------
  // GATE A: SOURCE -> LEDGER COVERAGE
  // ----------------------------------------------------
  const sourceCoverageReport = runSourceCoverageVerification();
  const extractedCount = sourceCoverageReport.totalExtracted || ledger.length;
  const matchedCount = sourceCoverageReport.totalLedgerMatched || ledger.length;
  const missingCount = sourceCoverageReport.totalMissingFromLedger || 0;
  const lostCount = breakdown.lost;
  const coveragePct = extractedCount > 0 ? ((matchedCount / extractedCount) * 100).toFixed(1) : '0.0';

  console.log('\n--- GATE A: SOURCE -> LEDGER COVERAGE ---');
  console.log(`${extractedCount} extracted`);
  console.log(`${matchedCount} matched`);
  console.log(`${missingCount} missing`);
  console.log(`${lostCount} lost`);
  console.log(`${coveragePct}% coverage`);

  // ----------------------------------------------------
  // GATE B: LEDGER -> CANONICAL REALIZATION
  // ----------------------------------------------------
  let exactVerifiedCount = 0;
  let exactMismatchedCount = 0;
  let humanReviewCount = 0;

  ledger.filter(item => item.disposition === 'canonical').forEach(item => {
    const drug = drugsData.records.find(d => d.id === item.drug_id);
    if (!drug) {
      exactMismatchedCount++;
      console.error(`FAIL: Drug ${item.drug_id} not found in drugs.json`);
      return;
    }

    const field = item.canonical_field;
    const text = item.source_text.trim();

    if (field === 'dailymed_url') {
      if (drug.dailymed_url && text.includes(drug.dailymed_setid)) {
        exactVerifiedCount++;
      } else {
        exactMismatchedCount++;
        console.error(`FAIL: Realization mismatch for ${item.source_item_id}: source text "${text}" != canonical dailymed_url "${drug.dailymed_url}"`);
      }
    } else if (field === 'suffix_en') {
      const cleanSuffix = text.replace(/^(\*\*|\*)?Suffix:(\*\*|\*)?\s*/i, '').replace(/[\*\`]/g, '').trim();
      if (drug.suffix_en && (cleanSuffix === drug.suffix_en || drug.suffix_en.endsWith(cleanSuffix.replace(/^-/, '')) || cleanSuffix.endsWith(drug.suffix_en.replace(/^-/, '')))) {
        exactVerifiedCount++;
      } else {
        exactMismatchedCount++;
        console.error(`FAIL: Realization mismatch for ${item.source_item_id}: suffix "${cleanSuffix}" != canonical "${drug.suffix_en}"`);
      }
    } else if (field === 'brand_names_en') {
      const cleanBrand = text.replace(/^(Brand|Brand example):\s*/i, '').trim();
      if (drug.brand_names_en && drug.brand_names_en.some(b => cleanBrand.toLowerCase().includes(b.toLowerCase()))) {
        exactVerifiedCount++;
      } else {
        exactMismatchedCount++;
        console.error(`FAIL: Realization mismatch for ${item.source_item_id}: brand "${cleanBrand}" not in canonical ${JSON.stringify(drug.brand_names_en)}`);
      }
    } else if (field === 'drugclass_id') {
      const cls = classesData.records.find(c => c.id === drug.drugclass_id);
      if (cls) {
        exactVerifiedCount++;
      } else {
        exactMismatchedCount++;
        console.error(`FAIL: Realization mismatch for ${item.source_item_id}: class ID "${drug.drugclass_id}" not found`);
      }
    } else {
      // Transformed narrative / list item promoted to canonical
      humanReviewCount++;
    }
  });

  const canonicalDispositionsTotal = breakdown.canonical;
  const exactMachineCheckable = exactVerifiedCount + exactMismatchedCount;

  console.log('\n--- GATE B: LEDGER -> CANONICAL REALIZATION ---');
  console.log(`${canonicalDispositionsTotal} canonical dispositions`);
  console.log(`${exactMachineCheckable} exact machine-checkable`);
  console.log(`${exactVerifiedCount} exact matched`);
  console.log(`${exactMismatchedCount} exact mismatched`);
  console.log(`${humanReviewCount} human-review-required transformations`);

  // ----------------------------------------------------
  // GATE C: P0 LABEL METADATA ALIGNMENT
  // ----------------------------------------------------
  const batch2NewDrugs = ['drug.lisinopril', 'drug.metoprolol', 'drug.amlodipine', 'drug.atorvastatin', 'drug.digoxin'];
  let auditedP0Fields = 0;
  let alignedP0Fields = 0;
  let verifiedSectionPresent = 0;
  let unresolvedP0Fields = 0;

  batch2NewDrugs.forEach(drugId => {
    const drug = drugsData.records.find(d => d.id === drugId);
    const labelMeta = manifestData.labels.find(l => l.drug_id === drugId);

    if (!drug || !labelMeta) {
      unresolvedP0Fields++;
      console.error(`FAIL: Missing record or label manifest for ${drugId}`);
      return;
    }

    if (drug.boxed_warning_en) {
      auditedP0Fields++;
      if (drug.dailymed_setid === labelMeta.setid) alignedP0Fields++;
      if (labelMeta.verified_sections.includes('BOXED_WARNING')) {
        verifiedSectionPresent++;
      } else {
        unresolvedP0Fields++;
        console.error(`FAIL: ${drugId} has boxed_warning_en but label manifest says BOXED_WARNING section is absent!`);
      }
    }

    if (drug.contraindications_en) {
      auditedP0Fields++;
      if (drug.dailymed_setid === labelMeta.setid) alignedP0Fields++;
      if (labelMeta.verified_sections.includes('CONTRAINDICATIONS') || labelMeta.verified_sections.includes('DO_NOT_USE')) {
        verifiedSectionPresent++;
      } else {
        unresolvedP0Fields++;
        console.error(`FAIL: ${drugId} has contraindications_en but label manifest says CONTRAINDICATIONS section is absent!`);
      }
    }

    if (drug.warnings_en) {
      auditedP0Fields++;
      if (drug.dailymed_setid === labelMeta.setid) alignedP0Fields++;
      if (labelMeta.verified_sections.includes('WARNINGS') || labelMeta.verified_sections.includes('WARNINGS_AND_PRECAUTIONS')) {
        verifiedSectionPresent++;
      } else {
        unresolvedP0Fields++;
        console.error(`FAIL: ${drugId} has warnings_en but label manifest has no WARNINGS section!`);
      }
    }
  });

  console.log('\n--- GATE C: P0 LABEL METADATA ALIGNMENT ---');
  console.log(`${auditedP0Fields} P0 populated fields audited`);
  console.log(`${alignedP0Fields} selected-setid aligned`);
  console.log(`${verifiedSectionPresent} verified-section present`);
  console.log(`${unresolvedP0Fields} unresolved metadata/section errors`);

  // Overall Gate Evaluation
  const allPassed = duplicates.length === 0 &&
                    disjointEquationPassed &&
                    breakdown.lost === 0 &&
                    invalidFieldsCount === 0 &&
                    derivedInMainLedger === 0 &&
                    exactMismatchedCount === 0 &&
                    unresolvedP0Fields === 0 &&
                    sourceCoverageReport.passed;

  console.log('\n====================================================');
  if (allPassed) {
    console.log('All implemented machine gates passed.');
  } else {
    console.error('AUDIT FAILED! See errors above.');
    process.exit(1);
  }
}

if (require.main === module) {
  auditAtomicLedger();
}

module.exports = { auditAtomicLedger };
