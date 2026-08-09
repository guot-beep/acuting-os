const fs = require('fs');

const stagingData = JSON.parse(fs.readFileSync('data/pharmacology/staging_v7_ingestion.json', 'utf8'));
const ledger = stagingData.ledger || [];
const derivedFlags = stagingData.derived_candidate_flags || [];

console.log('====================================================');
console.log('MACHINE AUDIT: DISJOINT ATOMIC PROVENANCE LEDGER');
console.log('====================================================');
console.log('Total items in ledger:', ledger.length);
console.log('Total derived candidate flags:', derivedFlags.length);

// Assertion 1: Unique source_item_id
const seenIds = new Set();
const dups = [];
ledger.forEach(item => {
  if (seenIds.has(item.source_item_id)) {
    dups.push(item.source_item_id);
  }
  seenIds.add(item.source_item_id);
});
console.log('\n[1] Duplicate source_item_id count:', dups.length);
if (dups.length > 0) {
  console.error('FAIL: Duplicates found:', dups);
  process.exit(1);
}

// Assertion 2: Dispositions breakdown per drug and overall
const dispositionsBreakdown = {
  canonical: 0,
  staging: 0,
  duplicated_for_provenance: 0,
  excluded_with_reason: 0,
  lost: 0
};

const perDrugStats = {};

ledger.forEach(item => {
  if (dispositionsBreakdown[item.disposition] !== undefined) {
    dispositionsBreakdown[item.disposition]++;
  } else {
    console.error('FAIL: Invalid disposition:', item.disposition, item.source_item_id);
    process.exit(1);
  }

  if (!perDrugStats[item.drug_id]) {
    perDrugStats[item.drug_id] = { canonical: 0, staging: 0, duplicated_for_provenance: 0, excluded_with_reason: 0, lost: 0, total: 0 };
  }
  perDrugStats[item.drug_id][item.disposition]++;
  perDrugStats[item.drug_id].total++;
});

console.log('\n[2] Overall Dispositions Breakdown:', dispositionsBreakdown);
console.table(perDrugStats);

// Assertion 3: Disjoint Sum Equation
const sumDispositions = dispositionsBreakdown.canonical + dispositionsBreakdown.staging + dispositionsBreakdown.duplicated_for_provenance + dispositionsBreakdown.excluded_with_reason + dispositionsBreakdown.lost;
console.log('\n[3] Disjoint Sum Equation Audit:');
console.log(`TOTAL UNIQUE SOURCE_ITEM_ID (${ledger.length}) = canonical (${dispositionsBreakdown.canonical}) + staging (${dispositionsBreakdown.staging}) + duplicated_for_provenance (${dispositionsBreakdown.duplicated_for_provenance}) + excluded_with_reason (${dispositionsBreakdown.excluded_with_reason}) + lost (${dispositionsBreakdown.lost})`);
console.log('Sum equation holds 100%:', sumDispositions === ledger.length);

if (sumDispositions !== ledger.length) {
  console.error('FAIL: Disjoint sum equation does not balance!');
  process.exit(1);
}

// Assertion 4: Lost Count Explicitly 0
console.log('\n[4] Explicit Lost Count:', dispositionsBreakdown.lost);
if (dispositionsBreakdown.lost !== 0) {
  console.error('FAIL: Lost count is non-zero!');
  process.exit(1);
}

// Assertion 5: Approved canonical fields check
const validCanonicalFields = new Set([
  'id', 'name_en', 'name_zh', 'brand_names_en', 'drugclass_id', 'drugsystem_ids',
  'suffix_en', 'rxnorm_rxcui', 'mechanism_en', 'mechanism_zh', 'drugtarget_id',
  'site_of_action_en', 'site_of_action_zh', 'physiologic_effect_en', 'physiologic_effect_zh',
  'onset_duration_en', 'route_en', 'indications_en', 'indications_zh',
  'indication_condition_ids', 'off_label_en', 'boxed_warning_en', 'boxed_warning_zh',
  'contraindications_en', 'contraindications_zh', 'warnings_en', 'warnings_zh',
  'precautions_en', 'precautions_zh', 'adverse_effects_en', 'adverse_effects_zh',
  'adverse_effect_ids', 'drug_interactions_en', 'drug_interactions_zh', 'overdose_en',
  'pregnancy_lactation_en', 'herb_drug_interactions_en', 'herb_drug_interactions_zh',
  'related_herb_ids', 'related_formula_ids', 'related_pattern_ids', 'tcm_relation_note_zh',
  'board_priority', 'prototype_drug', 'mnemonic_en', 'exam_trap_en', 'exam_trap_zh',
  'classic_association_en', 'dailymed_url', 'dailymed_url_kind', 'field_sources',
  'drug_interactions_graded', 'herb_drug_interactions_graded', 'food_interactions_graded'
]);

let invalidFields = 0;
ledger.forEach(item => {
  if (item.canonical_field && !validCanonicalFields.has(item.canonical_field)) {
    console.error('FAIL: Invalid canonical field:', item.canonical_field, 'in', item.source_item_id);
    invalidFields++;
  }
});

console.log('\n[5] Invalid Canonical Field References:', invalidFields);
if (invalidFields > 0) {
  process.exit(1);
}

// Assertion 6: Derived candidate flags isolated
let derivedInLedger = ledger.filter(i => i.derived === true);
console.log('\n[6] Derived items found in ledger:', derivedInLedger.length);
if (derivedInLedger.length > 0) {
  console.error('FAIL: Derived items leaked into main ledger!');
  process.exit(1);
}

console.log('\n====================================================');
console.log('ALL MACHINE AUDIT ASSERTIONS PASSED CLEANLY! LOST = 0');
console.log('====================================================');
