const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { extractSourceMedicalFacts, normalizeText, all15DrugIds } = require('./verify-source-coverage');

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

  // Pilot 1 rules
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

  // Batch 2 canonical rules
  if (drugId === 'drug.rivaroxaban') {
    if (norm.includes('-xaban -> factor Xa inhibitor.')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Direct factor Xa inhibitor.')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('Stroke prevention in nonvalvular AF; DVT/PE treatment and prophylaxis.')) return { disposition: 'canonical', canonical_field: 'indications_en', staging_field: null };
    if (norm.includes('Current label has boxed warnings for premature discontinuation')) return { disposition: 'canonical', canonical_field: 'boxed_warning_en', staging_field: null };
    if (norm.includes('https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=481b7802-5093-43e7-bbd9-1532197eb6e6')) return { disposition: 'canonical', canonical_field: 'dailymed_url', staging_field: null };
  }

  if (drugId === 'drug.lisinopril') {
    if (norm.includes('-pril -> ACE inhibitor.')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Inhibits ACE (angiotensin-converting enzyme).')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('Think: hypertension, heart failure, post-MI context.')) return { disposition: 'canonical', canonical_field: 'indications_en', staging_field: null };
    if (norm.includes('Current label has a boxed warning for fetal toxicity.')) return { disposition: 'canonical', canonical_field: 'boxed_warning_en', staging_field: null };
    if (norm.includes('Dry cough & angioedema are classic exam topics.')) return { disposition: 'canonical', canonical_field: 'exam_trap_en', staging_field: null };
    if (norm.includes('https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=0b58e778-8318-47c3-b4e0-79ea7c89f5bc')) return { disposition: 'canonical', canonical_field: 'dailymed_url', staging_field: null };
  }

  if (drugId === 'drug.metoprolol') {
    if (norm.includes('-olol -> beta-blocker.')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Selective beta-1 adrenergic receptor blocker.')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('Think: hypertension, angina, heart failure, post-MI.')) return { disposition: 'canonical', canonical_field: 'indications_en', staging_field: null };
    if (norm.includes('Current label has a boxed warning against abrupt cessation')) return { disposition: 'canonical', canonical_field: 'boxed_warning_en', staging_field: null };
    if (norm.includes('Bradycardia & masking hypoglycemia signs.')) return { disposition: 'canonical', canonical_field: 'exam_trap_en', staging_field: null };
    if (norm.includes('https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=0d29ae67-f418-4780-b210-91c68f9a2e61')) return { disposition: 'canonical', canonical_field: 'dailymed_url', staging_field: null };
  }

  if (drugId === 'drug.amlodipine') {
    if (norm.includes('-dipine -> dihydropyridine CCB.')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Dihydropyridine calcium channel blocker.')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('Think: hypertension, chronic stable angina, vasospastic angina.')) return { disposition: 'canonical', canonical_field: 'indications_en', staging_field: null };
    if (norm.includes('Peripheral edema is the key classic adverse effect.')) return { disposition: 'canonical', canonical_field: 'exam_trap_en', staging_field: null };
    if (norm.includes('https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=1e7f603c-8367-4e67-a0c6-3023fb182283')) return { disposition: 'canonical', canonical_field: 'dailymed_url', staging_field: null };
  }

  if (drugId === 'drug.atorvastatin') {
    if (norm.includes('-vastatin -> statin (HMG-CoA reductase inhibitor).')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Competitive inhibition of HMG-CoA reductase.')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('Think: hyperlipidemia, cardiovascular event risk reduction.')) return { disposition: 'canonical', canonical_field: 'indications_en', staging_field: null };
    if (norm.includes('Myopathy/rhabdomyolysis & LFT monitoring.')) return { disposition: 'canonical', canonical_field: 'exam_trap_en', staging_field: null };
    if (norm.includes('https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8a3a2e37-f0b0-4f51-b847-1936c7e16348')) return { disposition: 'canonical', canonical_field: 'dailymed_url', staging_field: null };
  }

  if (drugId === 'drug.digoxin') {
    if (norm.includes('Cardiac glycoside.')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('Inhibits Na+/K+-ATPase pump.')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('Think: heart failure, atrial fibrillation rate control.')) return { disposition: 'canonical', canonical_field: 'indications_en', staging_field: null };
    if (norm.includes('Narrow therapeutic window; visual halos & hypokalemia toxicity trap.')) return { disposition: 'canonical', canonical_field: 'exam_trap_en', staging_field: null };
    if (norm.includes('https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8e3768b4-82a1-4328-98e3-471ffb471412')) return { disposition: 'canonical', canonical_field: 'dailymed_url', staging_field: null };
  }

  if (drugId === 'drug.furosemide') {
    if (norm.includes('Loop diuretic.')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('Fast & Furious in the Loop.')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Inhibits NKCC2 in thick ascending limb.')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('Hypokalemia & ototoxicity risk.')) return { disposition: 'canonical', canonical_field: 'exam_trap_en', staging_field: null };
    if (norm.includes('Current label has a boxed warning for profound diuresis')) return { disposition: 'canonical', canonical_field: 'boxed_warning_en', staging_field: null };
    if (norm.includes('https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7cdcd001-ab4b-4210-a455-2e17a7bc4972')) return { disposition: 'canonical', canonical_field: 'dailymed_url', staging_field: null };
  }

  if (drugId === 'drug.spironolactone') {
    if (norm.includes('Potassium-sparing diuretic / aldosterone antagonist.')) return { disposition: 'canonical', canonical_field: 'mechanism_en', staging_field: null };
    if (norm.includes('-actone -> potassium-sparing.')) return { disposition: 'canonical', canonical_field: 'mnemonic_en', staging_field: null };
    if (norm.includes('Hyperkalemia & gynecomastia risk.')) return { disposition: 'canonical', canonical_field: 'exam_trap_en', staging_field: null };
  }

  // Default to staging
  const stagingField = sec.includes('Flags') ? 'source_declared_flags' : (sec.includes('BOARD') || sec.includes('Official') ? 'source_board_items' : 'source_clinical_impact_statements');
  return { disposition: 'staging', canonical_field: null, staging_field: stagingField };
}

function buildFullAtomicLedger() {
  const ledger = [];
  const seenHashes = new Map(); // itemId -> { drugId, normSec, normText, count }

  all15DrugIds.forEach(drugId => {
    const rawFacts = extractSourceMedicalFacts(drugId);
    const prefix = drugId.replace('drug.', '');

    rawFacts.forEach(src => {
      const secCode = getSectionCode(src.source_section);
      const normSec = normalizeText(src.source_section);
      const normText = normalizeText(src.source_text);

      const hashInput = `${drugId}|${normSec}|${normText}`;
      const fullHash = crypto.createHash('sha256').update(hashInput).digest('hex').slice(0, 8);

      const baseItemId = `${prefix}.${secCode}.${fullHash}`;

      let itemId = baseItemId;
      if (seenHashes.has(baseItemId)) {
        const existing = seenHashes.get(baseItemId);
        // Check if true hash collision (different input text producing same hash)
        if (existing.drugId !== drugId || existing.normSec !== normSec || existing.normText !== normText) {
          throw new Error(`FATAL HASH COLLISION DETECTED! Base ID ${baseItemId} collided between different inputs!`);
        }
        // Legitimate duplicate occurrence in same section
        existing.count += 1;
        itemId = `${baseItemId}_${existing.count}`;
      } else {
        seenHashes.set(baseItemId, { drugId, normSec, normText, count: 1 });
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
    },
    {
      derived_item_id: 'derived.flag.lisinopril.bradykinin_cough_relevance',
      drug_id: 'drug.lisinopril',
      flag: 'bradykinin_cough_relevance',
      derived: true,
      reason: 'Inferred from dry cough adverse effect notes in source narrative.'
    },
    {
      derived_item_id: 'derived.flag.metoprolol.rebound_angina_warning',
      drug_id: 'drug.metoprolol',
      flag: 'rebound_angina_warning',
      derived: true,
      reason: 'Inferred from abrupt cessation boxed warning in source narrative.'
    }
  ];

  const stagingStore = {
    purpose: 'Formal 1:1 Content-Hashed Atomic Provenance Ledger for Pilot 1 + Batch 2 (15 drugs). Every extracted source atomic item has a stable content-hashed source_item_id and exactly one primary disposition.',
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
  console.log(`Successfully generated stable content-hashed atomic provenance ledger with ${ledger.length} items across 15 drugs!`);
}

if (require.main === module) {
  buildFullAtomicLedger();
}

module.exports = { buildFullAtomicLedger };
