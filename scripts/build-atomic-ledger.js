const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { extractSourceMedicalFacts } = require('./verify-source-coverage');

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

const pilotIds = [
  'drug.warfarin',
  'drug.apixaban',
  'drug.clopidogrel',
  'drug.aspirin',
  'drug.enoxaparin',
  'drug.losartan',
  'drug.hydrochlorothiazide'
];

function getSectionCode(sec) {
  const normSec = sec.toLowerCase();
  if (normSec.includes('identity')) return 'identity';
  if (normSec.includes('board')) return 'board';
  if (normSec.includes('mechanism')) return 'mechanism';
  if (normSec.includes('main use')) return 'uses';
  if (normSec.includes('flag')) return 'flag';
  if (normSec.includes('clinical impact')) return 'impact';
  if (normSec.includes('boxed warning') || normSec.includes('safety')) return 'safety';
  if (normSec.includes('herb') || normSec.includes('integrative')) return 'herb_int';
  if (normSec.includes('acupuncture')) return 'acu';
  if (normSec.includes('monitoring')) return 'monitoring';
  if (normSec.includes('source')) return 'sources';
  return 'item';
}

function determineDispositionAndFields(drugId, srcItem) {
  const norm = srcItem.normalized_text;
  const sec = srcItem.source_section;

  // Identity
  if (sec === 'Identity') {
    if (norm.startsWith('Class:')) {
      return { disposition: 'canonical', canonical_field: 'drugclass_id', staging_field: null };
    }
    if (norm.startsWith('Brand') || norm.startsWith('Brand example:')) {
      return { disposition: 'canonical', canonical_field: 'brand_names_en', staging_field: null };
    }
    if (norm.startsWith('Suffix:')) {
      return { disposition: 'canonical', canonical_field: 'suffix_en', staging_field: null };
    }
  }

  // Declared Flags
  if (sec.includes('Flags')) {
    return { disposition: 'staging', canonical_field: null, staging_field: 'source_declared_flags' };
  }

  // Drug-specific canonical rules
  if (drugId === 'drug.warfarin') {
    if (norm === 'Vitamin K antagonist.') return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('Narrow therapeutic window; INR monitoring')) return { disposition: 'canonical', canonical_field: 'classic_association_en', staging_field: null };
    if (norm.includes('Major/fatal bleeding is the central toxicity.')) return { disposition: 'canonical', canonical_field: 'boxed_warning_en', staging_field: null };
    if (norm.includes('warfare against Vitamin K.')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Warfarin: vitamin K pathway + INR monitoring.')) return { disposition: 'duplicated_for_provenance', canonical_field: 'classic_association_en', staging_field: 'source_board_items' };
    if (norm.includes('Course provenance:')) return { disposition: 'canonical', canonical_field: 'field_sources', staging_field: null };
    if (norm.startsWith('Reduces functional vitamin K-dependent')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.startsWith('Current label includes prevention/treatment of venous')) return { disposition: 'canonical', canonical_field: 'indications_en', staging_field: null };
    if (norm.startsWith('Current label has a boxed warning for major/fatal bleeding')) return { disposition: 'canonical', canonical_field: 'boxed_warning_en', staging_field: null };
    if (norm.includes('St. John’s wort:') || norm.includes('St. Johns wort:')) return { disposition: 'canonical', canonical_field: 'herb_drug_interactions_en', staging_field: null };
    if (norm.includes('Asian ginseng:')) return { disposition: 'canonical', canonical_field: 'herb_drug_interactions_en', staging_field: null };
    if (norm.includes('Vitamin K supplements')) return { disposition: 'canonical', canonical_field: 'herb_drug_interactions_en', staging_field: null };
    if (norm.includes('Do not interpret bruising or bleeding tendency without considering')) return { disposition: 'canonical', canonical_field: 'tcm_relation_note_zh', staging_field: null };
    if (norm.includes('https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=558b7a0d-5490-4c1b-802e-3ab3f1efe760')) return { disposition: 'canonical', canonical_field: 'dailymed_url', staging_field: null };
    if (norm.startsWith('https://')) return { disposition: 'canonical', canonical_field: 'field_sources', staging_field: null };
  }

  if (drugId === 'drug.apixaban') {
    if (norm.includes('-xaban -> factor Xa inhibitor.')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Main clinical danger: bleeding.')) return { disposition: 'canonical', canonical_field: 'warnings_en', staging_field: null };
    if (norm.includes('Do not abruptly discontinue without appropriate anticoagulation planning')) return { disposition: 'canonical', canonical_field: 'boxed_warning_en', staging_field: null };
    if (norm.includes('Neuraxial/spinal procedures carry spinal/epidural hematoma risk.')) return { disposition: 'canonical', canonical_field: 'exam_trap_en', staging_field: null };
    if (norm.includes('Mnemonic from course logic: XABAN -> Xa.')) return { disposition: 'duplicated_for_provenance', canonical_field: 'mnemonic_en', staging_field: 'source_board_items' };
    if (norm.startsWith('Direct inhibition of factor Xa reduces')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('stroke/systemic embolism risk reduction in nonvalvular atrial fibrillation;') || norm.includes('DVT prophylaxis after hip/knee replacement;')) return { disposition: 'canonical', canonical_field: 'indications_en', staging_field: null };
    if (norm.includes('premature discontinuation increases thrombotic-event risk;') || norm.includes('spinal/epidural hematoma can occur around neuraxial')) return { disposition: 'canonical', canonical_field: 'boxed_warning_en', staging_field: null };
    if (norm.includes('https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a454cd24-0c6d-46e8-b1e4-197388606175')) return { disposition: 'canonical', canonical_field: 'dailymed_url', staging_field: null };
  }

  if (drugId === 'drug.clopidogrel') {
    if (norm.includes('P in clopidogrel / aspirin')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Requires metabolic activation, especially through CYP2C19.')) return { disposition: 'canonical', canonical_field: 'boxed_warning_en', staging_field: null };
    if (norm.includes('Current boxed warning focuses on reduced antiplatelet effect in CYP2C19')) return { disposition: 'duplicated_for_provenance', canonical_field: 'boxed_warning_en', staging_field: 'source_board_items' };
    if (norm.includes('Bleeding remains a major clinical safety concern.')) return { disposition: 'canonical', canonical_field: 'warnings_en', staging_field: null };
    if (norm.startsWith('Prodrug converted to an active metabolite')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.startsWith('Current label includes acute coronary syndrome')) return { disposition: 'canonical', canonical_field: 'indications_en', staging_field: null };
    if (norm.includes('active pathological bleeding and hypersensitivity; warnings include bleeding')) return { disposition: 'canonical', canonical_field: 'contraindications_en', staging_field: null };
    if (norm.includes('https://www.dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=55530ff3-5ce4-120f-e054-00144ff8d46c')) return { disposition: 'canonical', canonical_field: 'dailymed_url', staging_field: null };
  }

  if (drugId === 'drug.aspirin') {
    if (norm.includes('NSAID: prostaglandin/COX pathway, pain/inflammation.')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('Low-dose use: antiplatelet context.')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Reye syndrome risk in children with viral illness.')) return { disposition: 'canonical', canonical_field: 'exam_trap_en', staging_field: null };
    if (norm.includes('Course provenance:')) return { disposition: 'canonical', canonical_field: 'field_sources', staging_field: null };
  }

  if (drugId === 'drug.enoxaparin') {
    if (norm.includes('Injectable anticoagulant; distinguish from oral warfarin')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Major practical issue: bleeding.')) return { disposition: 'canonical', canonical_field: 'warnings_en', staging_field: null };
    if (norm.includes('Often appears in perioperative, thromboembolism')) return { disposition: 'canonical', canonical_field: 'indications_en', staging_field: null };
  }

  if (drugId === 'drug.losartan') {
    if (norm.includes('-SARTAN -> ARB.')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Blocks angiotensin II receptor signaling.')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('Think: hypertension, diabetic nephropathy context')) return { disposition: 'canonical', canonical_field: 'indications_en', staging_field: null };
    if (norm.includes('Current label has boxed warning for fetal toxicity.')) return { disposition: 'canonical', canonical_field: 'boxed_warning_en', staging_field: null };
    if (norm.includes('Compare ACE inhibitor -pril:')) return { disposition: 'canonical', canonical_field: 'exam_trap_en', staging_field: null };
    if (norm === 'dizziness;') return { disposition: 'canonical', canonical_field: 'adverse_effects_en', staging_field: null };
    if (norm === 'low BP, especially with volume depletion;') return { disposition: 'canonical', canonical_field: 'warnings_en', staging_field: null };
    if (norm === 'renal function deterioration;') return { disposition: 'canonical', canonical_field: 'warnings_en', staging_field: null };
    if (norm === 'elevated potassium.') return { disposition: 'canonical', canonical_field: 'adverse_effects_en', staging_field: null };
    if (norm.includes('Potassium-increasing agents')) return { disposition: 'canonical', canonical_field: 'drug_interactions_en', staging_field: null };
    if (norm.includes('Lithium -> lithium toxicity risk.')) return { disposition: 'canonical', canonical_field: 'drug_interactions_en', staging_field: null };
    if (norm.includes('NSAIDs / COX-2 inhibitors')) return { disposition: 'canonical', canonical_field: 'drug_interactions_en', staging_field: null };
    if (norm.includes('Dual RAS blockade')) return { disposition: 'canonical', canonical_field: 'drug_interactions_en', staging_field: null };
    if (norm.includes('If a patient with dizziness or weakness is taking losartan plus a diuretic')) return { disposition: 'canonical', canonical_field: 'tcm_relation_note_zh', staging_field: null };
    if (norm.includes('https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=9501dfaa-c8cf-46d6-8bec-936c4fd8fe03&version=1')) return { disposition: 'canonical', canonical_field: 'dailymed_url', staging_field: null };
  }

  if (drugId === 'drug.hydrochlorothiazide') {
    if (norm === 'Thiazide diuretic.') return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('"See No Evil" and the high-yield association with secondary angle-closure glaucoma.')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Classic electrolyte associations: hypokalemia, hyponatremia')) return { disposition: 'canonical', canonical_field: 'classic_association_en', staging_field: null };
    if (norm.includes('HCTZ -> thiazide, hypokalemia/hyponatremia.')) return { disposition: 'duplicated_for_provenance', canonical_field: 'classic_association_en', staging_field: 'source_board_items' };
    if (norm.includes('acute eye pain / visual change in secondary angle-closure glaucoma.')) return { disposition: 'canonical', canonical_field: 'exam_trap_en', staging_field: null };
    if (norm.includes('digitalis/digoxin toxicity')) return { disposition: 'canonical', canonical_field: 'drug_interactions_en', staging_field: null };
    if (norm.includes('Lithium + thiazide/diuretic therapy')) return { disposition: 'canonical', canonical_field: 'drug_interactions_en', staging_field: null };
    if (norm.includes('https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8c868894-667e-4a51-906a-838d63e420ba')) return { disposition: 'canonical', canonical_field: 'dailymed_url', staging_field: null };
  }

  // Default to staging
  const stagingField = sec.includes('Flags') ? 'source_declared_flags' : (sec.includes('BOARD') || sec.includes('Official') ? 'source_board_items' : 'source_clinical_impact_statements');
  return { disposition: 'staging', canonical_field: null, staging_field: stagingField };
}

function buildFullAtomicLedger() {
  const ledger = [];
  const seenHashes = new Map();

  pilotIds.forEach(drugId => {
    const rawFacts = extractSourceMedicalFacts(drugId);
    const prefix = drugId.replace('drug.', '');

    rawFacts.forEach(src => {
      const secCode = getSectionCode(src.source_section);
      const normSec = normalizeText(src.source_section);
      const normText = normalizeText(src.source_text);

      const hashInput = `${drugId}|${normSec}|${normText}`;
      const fullHash = crypto.createHash('sha256').update(hashInput).digest('hex').slice(0, 8);

      let itemId = `${prefix}.${secCode}.${fullHash}`;

      if (seenHashes.has(itemId)) {
        const count = seenHashes.get(itemId) + 1;
        seenHashes.set(itemId, count);
        itemId = `${itemId}_${count}`;
      } else {
        seenHashes.set(itemId, 1);
      }

      const itemType = src.source_section.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const { disposition, canonical_field, staging_field } = determineDispositionAndFields(drugId, src);

      ledger.push({
        source_item_id: itemId,
        drug_id: drugId,
        source_file: src.source_file,
        source_section: src.source_section,
        source_text: src.source_text,
        source_item_type: itemType,
        disposition,
        canonical_field,
        staging_field,
        derived: false
      });
    });
  });

  const derivedCandidateFlags = [
    {
      derived_item_id: 'derived.flag.warfarin.inr_lab_relevance',
      drug_id: 'drug.warfarin',
      flag: 'inr_lab_relevance',
      derived: true,
      reason: 'Inferred from INR monitoring clinical statements in source narrative.'
    },
    {
      derived_item_id: 'derived.flag.warfarin.drug_herb_interaction_concern',
      drug_id: 'drug.warfarin',
      flag: 'drug_herb_interaction_concern',
      derived: true,
      reason: 'Inferred from St. Johns wort / Ginseng interaction notes in source narrative.'
    },
    {
      derived_item_id: 'derived.flag.clopidogrel.cyp2c19_metabolizer_relevance',
      drug_id: 'drug.clopidogrel',
      flag: 'cyp2c19_metabolizer_relevance',
      derived: true,
      reason: 'Inferred from CYP2C19 poor metabolizer boxed warning in source narrative.'
    },
    {
      derived_item_id: 'derived.flag.enoxaparin.injection_site_bruising',
      drug_id: 'drug.enoxaparin',
      flag: 'injection_site_bruising',
      derived: true,
      reason: 'Inferred from injection-site review note in acupuncture relevance section.'
    }
  ];

  const stagingStore = {
    purpose: 'Formal 1:1 Content-Hashed Atomic Provenance Ledger for Pilot 1 (7 drugs). Every extracted source atomic item has a stable content-hashed source_item_id and exactly one primary disposition.',
    audited_at: '2026-08-09',
    schema_mode: 'stable_content_hashed_atomic_ledger_v4',
    disposition_definitions: {
      canonical: 'Primary disposition is represented in canonical data/pharmacology/drugs.json',
      staging: 'Primary disposition is preserved in staging data (unmapped board/clinical impact bullets)',
      duplicated_for_provenance: 'Item is represented in canonical data BUT also preserved in staging for full provenance review (disjoint; does not double-count in sum)',
      excluded_with_reason: 'Source item is structural metadata or legacy classification excluded with explicit reason',
      lost: 'Source item was lost during ingestion (must equal 0)'
    },
    ledger,
    derived_candidate_flags: derivedCandidateFlags
  };

  fs.writeFileSync('data/pharmacology/staging_v7_ingestion.json', JSON.stringify(stagingStore, null, 2) + '\n');
  console.log(`Successfully generated stable content-hashed atomic provenance ledger with ${ledger.length} items!`);
}

if (require.main === module) {
  buildFullAtomicLedger();
}

module.exports = { buildFullAtomicLedger };
