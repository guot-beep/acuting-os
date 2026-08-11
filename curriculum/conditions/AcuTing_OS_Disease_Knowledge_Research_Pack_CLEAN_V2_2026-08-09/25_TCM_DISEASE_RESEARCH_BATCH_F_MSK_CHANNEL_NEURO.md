# TCM Disease Research Batch F - Musculoskeletal / Channel / Neuro

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Identities:** 8  
**Identity authority:** supplied CURRENT `data/pathology/tdis_registry.json` audit.  
**Rule:** all identities below already exist; enrich only. TCM mechanism prose is staging until approved disease-specific sources are attached.

---
# 01. `tdis.yao_tong` - 腰痛 / Low Back Pain

## Identity
```yaml
id: tdis.yao_tong
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for lumbar pain. It spans mechanical, degenerative, renal/visceral and neurologic causes and must preserve red-flag triage.

## `bing_yin` / `bing_ji` staging
Candidate mechanisms include cold-damp, damp-heat, blood stasis and Kidney deficiency. Exact disease differentiation requires source verification.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Lumbar aching, stiffness or sharp pain with movement/rest patterns and possible leg symptoms.

## Pattern candidates [DERIVED_RELATION]
- pattern.blood_stasis
- pattern.kidney_yang_deficiency
- pattern.kidney_yin_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- mechanical low back pain
- radiculopathy/sciatica
- kidney stone/pyelonephritis differential
- cauda equina emergency

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- low_back_pain — endpoint candidate
- leg_pain — endpoint candidate

## Biomedical safety overlay
Saddle anesthesia, urinary retention, progressive weakness, fever, trauma, cancer history or vascular abdominal/back pain requires urgent evaluation.

## Open questions
1. Attach approved disease-specific TCM source before canonical ingestion.

## Provenance
```yaml
identity:
  source: supplied CURRENT tdis_registry audit
patterns:
  source: supplied CURRENT Pattern registry/canonical review where exact IDs resolve
TCM_mechanism:
  status: approved disease-specific TCM/classical/Board source required before canonical write
biomedical_safety:
  status: must be sourced from the corresponding Western condition/safety authority at ingestion
```

## Content accounting
```yaml
identity_verified: true
canonical_write_authorized: false
new_tdis_id_authorized: false
new_pattern_id_authorized: false
```

---

# 02. `tdis.bi_zheng` - 痺證 / Bi Syndrome

## Identity
```yaml
id: tdis.bi_zheng
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Broad traditional musculoskeletal disease identity for pain, stiffness, heaviness or numbness involving joints/muscles/channels. It is not synonymous with arthritis.

## `bing_yin` / `bing_ji` staging
Wind, Cold, Damp and Heat obstruction plus deficiency/stasis in chronic disease are common source families; exact subtypes require approved TCM source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Migrating/fixed joint or muscle pain, stiffness, swelling, heaviness or numbness depending subtype.

## Pattern candidates [DERIVED_RELATION]
- pattern.blood_stasis
- pattern.spleen_qi_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- osteoarthritis
- rheumatoid arthritis
- gout
- fibromyalgia — selected context

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- joint_pain
- stiffness
- swelling

## Biomedical safety overlay
Hot swollen joint with fever may be septic arthritis; acute neurologic/vascular limb symptoms require biomedical triage.

## Open questions
1. Attach approved disease-specific TCM source before canonical ingestion.

## Provenance
```yaml
identity:
  source: supplied CURRENT tdis_registry audit
patterns:
  source: supplied CURRENT Pattern registry/canonical review where exact IDs resolve
TCM_mechanism:
  status: approved disease-specific TCM/classical/Board source required before canonical write
biomedical_safety:
  status: must be sourced from the corresponding Western condition/safety authority at ingestion
```

## Content accounting
```yaml
identity_verified: true
canonical_write_authorized: false
new_tdis_id_authorized: false
new_pattern_id_authorized: false
```

---

# 03. `tdis.wei_zheng` - 痿證 / Wei Syndrome / Flaccidity

## Identity
```yaml
id: tdis.wei_zheng
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for weakness, flaccidity or muscle wasting presentations. It is not a diagnosis of a specific neurologic disease.

## `bing_yin` / `bing_ji` staging
Candidate source families include Lung/Stomach heat, damp-heat, Spleen Qi deficiency and Liver/Kidney deficiency.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Limb weakness, reduced strength, atrophy or difficulty walking, with sensory features depending cause.

## Pattern candidates [DERIVED_RELATION]
- pattern.spleen_qi_deficiency
- pattern.liver_blood_deficiency
- pattern.kidney_essence_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- peripheral neuropathy
- motor neuron/neuromuscular disease
- stroke/MS
- myasthenia/GBS differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- weakness — P0 neuro endpoint
- muscle_atrophy — sign review

## Biomedical safety overlay
Rapid progressive weakness, bulbar/respiratory symptoms, bowel/bladder change or acute focal deficit requires urgent neurologic care.

## Open questions
1. Attach approved disease-specific TCM source before canonical ingestion.

## Provenance
```yaml
identity:
  source: supplied CURRENT tdis_registry audit
patterns:
  source: supplied CURRENT Pattern registry/canonical review where exact IDs resolve
TCM_mechanism:
  status: approved disease-specific TCM/classical/Board source required before canonical write
biomedical_safety:
  status: must be sourced from the corresponding Western condition/safety authority at ingestion
```

## Content accounting
```yaml
identity_verified: true
canonical_write_authorized: false
new_tdis_id_authorized: false
new_pattern_id_authorized: false
```

---

# 04. `tdis.jin_shang` - 筋傷 / Soft-Tissue / Tendon-Ligament Injury

## Identity
```yaml
id: tdis.jin_shang
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 外科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional injury identity for soft-tissue, tendon, ligament and muscle strain/sprain-type presentations.

## `bing_yin` / `bing_ji` staging
Trauma causing Qi/Blood stagnation and local tissue injury is a core candidate mechanism; chronic deficiency/stasis may influence recovery.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Localized pain, swelling, bruising, restricted motion and tenderness after injury.

## Pattern candidates [DERIVED_RELATION]
- pattern.blood_stasis

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- sprain/strain
- tendon injury
- fracture/dislocation differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- pain/swelling/bruising endpoints

## Biomedical safety overlay
Major deformity, inability to bear weight, neurovascular deficit, severe swelling, suspected fracture/dislocation or compartment syndrome requires imaging/emergency evaluation.

## Open questions
1. Attach approved disease-specific TCM source before canonical ingestion.

## Provenance
```yaml
identity:
  source: supplied CURRENT tdis_registry audit
patterns:
  source: supplied CURRENT Pattern registry/canonical review where exact IDs resolve
TCM_mechanism:
  status: approved disease-specific TCM/classical/Board source required before canonical write
biomedical_safety:
  status: must be sourced from the corresponding Western condition/safety authority at ingestion
```

## Content accounting
```yaml
identity_verified: true
canonical_write_authorized: false
new_tdis_id_authorized: false
new_pattern_id_authorized: false
```

---

# 05. `tdis.luo_zhen` - 落枕 / Acute Stiff Neck

## Identity
```yaml
id: tdis.luo_zhen
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 外科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for acute neck pain/stiffness, often after sleep or minor strain. It should not absorb serious cervical or neurologic causes.

## `bing_yin` / `bing_ji` staging
Candidate mechanisms include channel Qi/Blood stagnation with Wind-Cold or local strain.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Acute unilateral/bilateral neck pain, limited rotation and muscle spasm.

## Pattern candidates [DERIVED_RELATION]
- pattern.blood_stasis

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- acute cervical strain
- torticollis
- cervical radiculopathy differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- neck_pain
- limited_ROM

## Biomedical safety overlay
Trauma, fever/meningismus, severe headache, neurologic weakness/numbness or vascular symptoms requires medical evaluation.

## Open questions
1. Attach approved disease-specific TCM source before canonical ingestion.

## Provenance
```yaml
identity:
  source: supplied CURRENT tdis_registry audit
patterns:
  source: supplied CURRENT Pattern registry/canonical review where exact IDs resolve
TCM_mechanism:
  status: approved disease-specific TCM/classical/Board source required before canonical write
biomedical_safety:
  status: must be sourced from the corresponding Western condition/safety authority at ingestion
```

## Content accounting
```yaml
identity_verified: true
canonical_write_authorized: false
new_tdis_id_authorized: false
new_pattern_id_authorized: false
```

---

# 06. `tdis.jian_ning` - 肩凝症（漏肩風） / Frozen-Shoulder-Type TCM Disease

## Identity
```yaml
id: tdis.jian_ning
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 外科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional shoulder disease identity associated with painful restricted shoulder motion and frozen-shoulder-type presentations, but not every shoulder pain is adhesive capsulitis.

## `bing_yin` / `bing_ji` staging
Candidate pathways include Qi/Blood stasis, cold-damp obstruction and deficiency in chronic cases.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Shoulder pain with progressive restriction, especially overhead/external rotation movements.

## Pattern candidates [DERIVED_RELATION]
- pattern.blood_stasis

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- adhesive capsulitis — strong contextual association
- rotator cuff disease
- cervical radiculopathy differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- shoulder_pain
- restricted_ROM

## Biomedical safety overlay
Acute trauma/deformity, infection, unexplained severe weakness, chest/cardiac referral pain or neurologic deficits require alternate evaluation.

## Open questions
1. Attach approved disease-specific TCM source before canonical ingestion.

## Provenance
```yaml
identity:
  source: supplied CURRENT tdis_registry audit
patterns:
  source: supplied CURRENT Pattern registry/canonical review where exact IDs resolve
TCM_mechanism:
  status: approved disease-specific TCM/classical/Board source required before canonical write
biomedical_safety:
  status: must be sourced from the corresponding Western condition/safety authority at ingestion
```

## Content accounting
```yaml
identity_verified: true
canonical_write_authorized: false
new_tdis_id_authorized: false
new_pattern_id_authorized: false
```

---

# 07. `tdis.ma_mu` - 麻木 / Numbness

## Identity
```yaml
id: tdis.ma_mu
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity centered on numbness or altered sensation. It must remain distinct from a symptom endpoint and from any one neurologic cause.

## `bing_yin` / `bing_ji` staging
Candidate mechanisms include Qi/Blood deficiency, phlegm, blood stasis and channel obstruction.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Numbness, tingling, reduced sensation or heaviness in localized or distributed patterns.

## Pattern candidates [DERIVED_RELATION]
- pattern.blood_stasis
- pattern.liver_blood_deficiency
- pattern.spleen_qi_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- peripheral neuropathy
- radiculopathy
- stroke/TIA
- vascular ischemia

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- numbness_or_paresthesia — P0 candidate

## Biomedical safety overlay
Sudden unilateral numbness with weakness/speech/vision changes is a stroke/TIA emergency; progressive motor deficits need neurologic assessment.

## Open questions
1. Attach approved disease-specific TCM source before canonical ingestion.

## Provenance
```yaml
identity:
  source: supplied CURRENT tdis_registry audit
patterns:
  source: supplied CURRENT Pattern registry/canonical review where exact IDs resolve
TCM_mechanism:
  status: approved disease-specific TCM/classical/Board source required before canonical write
biomedical_safety:
  status: must be sourced from the corresponding Western condition/safety authority at ingestion
```

## Content accounting
```yaml
identity_verified: true
canonical_write_authorized: false
new_tdis_id_authorized: false
new_pattern_id_authorized: false
```

---

# 08. `tdis.mian_tong` - 面痛 / Facial Pain

## Identity
```yaml
id: tdis.mian_tong
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for facial pain. It includes multiple possible biomedical causes and must not be equated automatically with trigeminal neuralgia.

## `bing_yin` / `bing_ji` staging
Candidate mechanisms include Wind-Cold/Heat, channel obstruction, Liver/ Stomach heat and blood stasis depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Facial pain with location, trigger, quality and associated sensory/dental/sinus features distinguishing patterns.

## Pattern candidates [DERIVED_RELATION]
- pattern.blood_stasis
- pattern.liver_fire
- pattern.stomach_fire

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- trigeminal neuralgia — strong association
- dental disease
- sinus disease
- TMJ disorder
- herpes zoster

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- facial_pain — P0 candidate

## Biomedical safety overlay
Facial pain with neurologic deficit, vision loss, vesicular ophthalmic rash, severe swelling/infection or chest/vascular referred pain requires urgent evaluation.

## Open questions
1. Attach approved disease-specific TCM source before canonical ingestion.

## Provenance
```yaml
identity:
  source: supplied CURRENT tdis_registry audit
patterns:
  source: supplied CURRENT Pattern registry/canonical review where exact IDs resolve
TCM_mechanism:
  status: approved disease-specific TCM/classical/Board source required before canonical write
biomedical_safety:
  status: must be sourced from the corresponding Western condition/safety authority at ingestion
```

## Content accounting
```yaml
identity_verified: true
canonical_write_authorized: false
new_tdis_id_authorized: false
new_pattern_id_authorized: false
```

---
