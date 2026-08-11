# TCM Disease Research Batch E - Qi / Fluid / GU / Metabolic

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Identities:** 11  
**Identity authority:** supplied CURRENT `data/pathology/tdis_registry.json` audit.  
**Rule:** all identities below already exist; enrich only. TCM mechanism prose is staging until approved disease-specific sources are attached.

---
# 01. `tdis.xiao_ke` - 消渴 / Xiaoke / Wasting-Thirst Disease

## Identity
```yaml
id: tdis.xiao_ke
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity centered on excessive thirst, urination and wasting-type presentations. It has strong historical overlap with diabetes symptom complexes but is not a universal synonym for diabetes mellitus.

## `bing_yin` / `bing_ji` staging
Candidate mechanism families include Yin-fluid depletion with heat and later Qi/Yin or Yin/Yang deficiency. Exact stage/differentiation wording requires approved TCM source verification.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Thirst, frequent urination, hunger, weight change, fatigue and dryness may appear depending source/pattern.

## Pattern candidates [DERIVED_RELATION]
- pattern.kidney_yin_deficiency
- pattern.stomach_yin_deficiency
- pattern.kidney_yang_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- cond.type-2-diabetes — contextual/strong historical association
- Type 1 diabetes candidate — contextual association
- diabetes insipidus — differential context

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- polydipsia — endpoint candidate
- polyuria — endpoint candidate
- sym.fatigue — EXISTS

## Biomedical safety overlay
Polyuria/thirst with dehydration, DKA symptoms, altered mental status or severe glucose instability requires biomedical evaluation; do not infer diabetes type from 消渴.

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

# 02. `tdis.han_zheng` - 汗證 / Sweating Disorder

## Identity
```yaml
id: tdis.han_zheng
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for pathologic spontaneous or night sweating presentations rather than normal thermoregulatory sweating.

## `bing_yin` / `bing_ji` staging
Candidate families include Wei-Qi instability, Qi deficiency, Yin deficiency heat, Yang deficiency and other disharmonies. Approved TCM source should define spontaneous vs night-sweat differentiation.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Spontaneous sweating, night sweating, sweating with fatigue or heat/cold sensations; context and triggers matter.

## Pattern candidates [DERIVED_RELATION]
- pattern.lung_qi_deficiency
- pattern.spleen_qi_deficiency
- pattern.kidney_yin_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- hyperthyroidism — differential
- infection including TB — differential
- menopause — context
- medication/substance effects — differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- excessive_sweating — endpoint candidate
- night_sweats — endpoint candidate

## Biomedical safety overlay
Night sweats with fever, weight loss, TB risk, malignancy signs, chest pain or severe autonomic symptoms requires medical evaluation.

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

# 03. `tdis.xu_lao` - 虛勞 / Consumptive / Deficiency Taxation Disease

## Identity
```yaml
id: tdis.xu_lao
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Broad traditional deficiency disease identity involving chronic weakness, fatigue and depletion across Qi, Blood, Yin or Yang domains. It is much broader than anemia or chronic fatigue.

## `bing_yin` / `bing_ji` staging
Candidate mechanisms include chronic constitutional/acquired deficiency of zang-fu Qi, Blood, Yin and Yang. Final disease scope requires classical/modern TCM source reconciliation.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Chronic fatigue, weakness, poor recovery, weight change, shortness of breath or palpitations may occur by pattern.

## Pattern candidates [DERIVED_RELATION]
- pattern.spleen_qi_deficiency
- pattern.lung_qi_deficiency
- pattern.heart_blood_deficiency
- pattern.kidney_yang_deficiency
- pattern.kidney_yin_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- anemia — possible contextual association
- chronic kidney disease — differential/context
- malignancy/infection/endocrine disease — differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- sym.fatigue — EXISTS
- weakness — endpoint review

## Biomedical safety overlay
New or severe fatigue with bleeding, weight loss, fever, dyspnea, chest pain, neurologic change or significant laboratory abnormality requires biomedical workup.

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

# 04. `tdis.fei_pang` - 肥胖 / Obesity (TCM Disease Layer)

## Identity
```yaml
id: tdis.fei_pang
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease-layer identity for pathologic excess body weight/adiposity presentations. It must remain distinct from the Western biomedical condition and from body-size descriptors.

## `bing_yin` / `bing_ji` staging
Candidate mechanisms include Spleen Qi deficiency, phlegm-dampness, dampness, Qi stagnation and Kidney deficiency depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Excess adiposity with fatigue, heaviness, appetite/digestive or fluid symptoms depending pattern.

## Pattern candidates [DERIVED_RELATION]
- pattern.spleen_qi_deficiency
- pattern.phlegm_damp_in_lung
- pattern.kidney_yang_deficiency
- pattern.liver_qi_stagnation

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- obesity Western condition — strong association but ontology distinct
- metabolic syndrome/type 2 diabetes — context
- sleep apnea — comorbidity context

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- sym.fatigue — EXISTS
- heaviness — granularity review

## Biomedical safety overlay
Avoid weight-stigma framing. Screen cardiometabolic and sleep-apnea risk; sudden weight change or edema may represent other disease.

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

# 05. `tdis.ying_bing` - 癭病 / Goiter / Ying Disease

## Identity
```yaml
id: tdis.ying_bing
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional neck-swelling/goiter disease identity. It can overlap thyroid enlargement in Graves, Hashimoto, nodular goiter and other thyroid disease but is not equivalent to one thyroid diagnosis.

## `bing_yin` / `bing_ji` staging
Candidate mechanisms include Qi stagnation, phlegm, blood stasis and deficiency depending chronicity and source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Visible/palpable anterior neck enlargement or nodularity with possible swallowing, voice or systemic thyroid symptoms.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_qi_stagnation
- pattern.blood_stasis

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- Graves disease — contextual association
- Hashimoto thyroiditis — contextual association
- thyroid nodules/goiter — likely strongest structural association

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- neck_mass/swelling — sign review
- dysphagia — endpoint candidate
- hoarseness — endpoint candidate

## Biomedical safety overlay
Rapidly enlarging neck mass, stridor, dysphagia, hoarseness, compressive symptoms or suspicious thyroid findings require biomedical/ENT/endocrine evaluation.

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

# 06. `tdis.lin_zheng` - 淋證 / Lin Syndrome / Painful Urinary Disorder

## Identity
```yaml
id: tdis.lin_zheng
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for dysuria, urinary frequency/urgency and related urinary difficulty presentations. It spans multiple possible Western urinary causes.

## `bing_yin` / `bing_ji` staging
Candidate pathways include damp-heat in lower burner, stone/strangury-type obstruction, Qi deficiency and other chronic patterns.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Painful urination, urgency/frequency, difficult urination, hematuria or sand/stone-like manifestations depending subtype/source.

## Pattern candidates [DERIVED_RELATION]
- pattern.damp_heat_spleen_stomach
- pattern.kidney_qi_not_firm

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- cystitis/UTI — common association
- kidney stone — contextual association
- prostatitis — contextual association
- STI/urethritis — differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- dysuria — endpoint candidate
- urinary_frequency — endpoint candidate
- hematuria — sign/symptom review

## Biomedical safety overlay
Fever with flank pain, pregnancy, urinary obstruction, sepsis, gross hematuria or severe pain requires biomedical evaluation.

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

# 07. `tdis.long_bi` - 癃閉 / Urinary Retention / Longbi

## Identity
```yaml
id: tdis.long_bi
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for difficult, scanty or absent urination, especially urinary retention-type presentations.

## `bing_yin` / `bing_ji` staging
Candidate mechanisms include bladder Qi transformation failure, damp-heat, Qi obstruction and Kidney deficiency. Exact subtypes require approved source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Hesitancy, weak output, incomplete/absent urination, suprapubic distension and discomfort.

## Pattern candidates [DERIVED_RELATION]
- pattern.kidney_qi_not_firm
- pattern.kidney_yang_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- BPH — common contextual association
- neurogenic bladder — differential
- prostatitis — differential
- urethral obstruction/medications — differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- urinary_retention — P0 endpoint candidate
- hesitancy — endpoint candidate

## Biomedical safety overlay
Complete acute urinary retention is urgent; neurologic retention with saddle anesthesia/leg weakness raises cauda-equina concern.

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

# 08. `tdis.shui_zhong` - 水腫 / Edema Disease

## Identity
```yaml
id: tdis.shui_zhong
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for clinically significant swelling/fluid retention. It is not a biomedical diagnosis of cause and spans cardiac, renal, hepatic, venous and lymphatic differentials.

## `bing_yin` / `bing_ji` staging
Candidate traditional pathways involve Lung/Spleen/Kidney fluid transformation and Yang/Qi deficiency, with excess patterns depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Pitting or nonpitting swelling, facial/limb/generalized distribution and associated dyspnea/urinary symptoms depending cause/pattern.

## Pattern candidates [DERIVED_RELATION]
- pattern.spleen_yang_deficiency
- pattern.kidney_yang_deficiency
- pattern.lung_qi_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- heart failure — common association
- CKD/nephrotic disease — differential
- cirrhosis — differential
- DVT — unilateral emergency differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- sym.edema — RECONCILE_EXISTING_REFERENCE
- dyspnea — P0 candidate

## Biomedical safety overlay
Unilateral painful swelling, acute dyspnea/chest pain, pulmonary edema, anasarca or rapid fluid gain requires biomedical assessment.

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

# 09. `tdis.yi_niao` - 遺尿 / Enuresis

## Identity
```yaml
id: tdis.yi_niao
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for involuntary urination, often nocturnal, outside developmentally expected control.

## `bing_yin` / `bing_ji` staging
Candidate mechanisms include Kidney Qi deficiency, Spleen/Lung Qi deficiency and bladder regulation weakness.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Nocturnal or involuntary urination, frequency or weak bladder control depending age/context.

## Pattern candidates [DERIVED_RELATION]
- pattern.kidney_qi_not_firm
- pattern.spleen_qi_deficiency
- pattern.lung_qi_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- nocturnal enuresis — likely strong association
- UTI/diabetes/sleep disorder — differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- urinary_incontinence — endpoint candidate
- nocturia — endpoint candidate

## Biomedical safety overlay
New adult incontinence, neurologic deficits, urinary retention overflow, infection signs or diabetes symptoms require biomedical evaluation.

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

# 10. `tdis.yi_jing` - 遺精 / Seminal Emission / Spermatorrhea

## Identity
```yaml
id: tdis.yi_jing
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for involuntary or excessive seminal emission presentations as defined in TCM literature. It should not pathologize normal nocturnal emission.

## `bing_yin` / `bing_ji` staging
Candidate pathways include Kidney Qi/Jing insecurity, Heart-Kidney disharmony, damp-heat or excessive Fire depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Involuntary seminal emission with frequency/distress and associated sleep, urinary or constitutional features.

## Pattern candidates [DERIVED_RELATION]
- pattern.kidney_qi_not_firm
- pattern.heart_kidney_not_communicating
- pattern.kidney_yin_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- normal nocturnal emission — boundary review
- prostatitis/urogenital disorder — differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- genitourinary symptom granularity review

## Biomedical safety overlay
Pain, hematuria/hematospermia, fever, urinary symptoms or neurologic changes need biomedical evaluation. Do not medicalize normal physiology.

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

# 11. `tdis.yang_wei` - 陽痿 / Erectile Dysfunction (TCM Disease Layer)

## Identity
```yaml
id: tdis.yang_wei
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for inability to achieve or maintain erection. It overlaps strongly with biomedical erectile dysfunction but remains a distinct ontology layer.

## `bing_yin` / `bing_ji` staging
Candidate mechanisms include Kidney Yang/Jing deficiency, Liver Qi stagnation, Heart/Spleen deficiency and damp-heat depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Erection difficulty with libido, ejaculation, mood, fatigue or urinary features varying by pattern.

## Pattern candidates [DERIVED_RELATION]
- pattern.kidney_yang_deficiency
- pattern.kidney_essence_deficiency
- pattern.liver_qi_stagnation

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- erectile dysfunction — strong clinical association
- cardiovascular disease/diabetes/medication effects — cause context

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- erectile_dysfunction may remain condition-level rather than sym.*

## Biomedical safety overlay
ED can be a vascular/neurologic/endocrine clue. Priapism, acute neurologic symptoms or exertional chest symptoms require appropriate evaluation.

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
