# TCM Disease Research Batch G - Dermatology / Oral / Eye

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Identities:** 9  
**Identity authority:** supplied CURRENT `data/pathology/tdis_registry.json` audit.  
**Rule:** all identities below already exist; enrich only. TCM mechanism prose is staging until approved disease-specific sources are attached.

---
# 01. `tdis.yin_zhen` - 癮疹 / Urticaria / Yinzhen

## Identity
```yaml
id: tdis.yin_zhen
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 外科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional skin disease identity for transient wheals/hives-type eruptions. It has strong overlap with urticaria but does not itself establish allergic trigger.

## `bing_yin` / `bing_ji` staging
Candidate mechanisms include Wind-Heat, Wind-Cold, Blood deficiency with Wind and GI-related disharmony depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Transient raised itchy wheals that migrate/change over hours.

## Pattern candidates [DERIVED_RELATION]
- pattern.wind_heat_invading_lung
- pattern.liver_blood_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- urticaria — strong association
- anaphylaxis — emergency differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- itching
- hives/wheals sign

## Biomedical safety overlay
Hives with airway swelling, wheeze, hypotension, vomiting or systemic anaphylaxis signs requires emergency care.

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

# 02. `tdis.shi_chuang` - 濕瘡 / Eczema-Type TCM Disease

## Identity
```yaml
id: tdis.shi_chuang
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 外科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional inflammatory skin disease identity with weeping/itching lesions that often overlaps eczema/dermatitis but is not a universal synonym.

## `bing_yin` / `bing_ji` staging
Candidate Damp-Heat, Spleen deficiency with Damp and Blood deficiency/Wind pathways require source verification.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Pruritic erythematous, vesicular/weeping or chronic lichenified lesions depending stage.

## Pattern candidates [DERIVED_RELATION]
- pattern.damp_heat_spleen_stomach
- pattern.spleen_qi_deficiency
- pattern.liver_blood_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- atopic dermatitis/eczema — common association
- contact dermatitis
- fungal/infectious differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- itching
- rash

## Biomedical safety overlay
Rapid spreading infection, fever, painful vesicles, ocular involvement or immunocompromised skin infection needs biomedical care.

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

# 03. `tdis.she_chuan_chuang` - 蛇串瘡 / Herpes-Zoster-Type TCM Disease

## Identity
```yaml
id: tdis.she_chuan_chuang
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 外科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity corresponding closely to shingles-type painful dermatomal vesicular eruption, while biomedical herpes zoster remains a distinct ontology.

## `bing_yin` / `bing_ji` staging
Candidate Damp-Heat/Fire toxin and later Qi/Blood stasis pathways depending source/stage.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Unilateral band-like burning pain and grouped vesicles; neuralgia can persist.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_gallbladder_damp_heat
- pattern.blood_stasis

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- herpes zoster — strong association
- postherpetic neuralgia

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- rash
- neuropathic_pain

## Biomedical safety overlay
Eye/forehead involvement, disseminated rash, immunosuppression or neurologic complications needs urgent antiviral/ophthalmic evaluation.

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

# 04. `tdis.fen_ci` - 粉刺 / Acne

## Identity
```yaml
id: tdis.fen_ci
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 外科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for acneiform comedonal/inflammatory facial or truncal eruptions. It overlaps acne vulgaris but maintains TCM differentiation.

## `bing_yin` / `bing_ji` staging
Candidate Lung/Stomach heat, damp-heat and phlegm/blood stasis pathways depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Comedones, papules, pustules, nodules and post-inflammatory changes.

## Pattern candidates [DERIVED_RELATION]
- pattern.stomach_fire
- pattern.phlegm_heat_in_lung
- pattern.blood_stasis

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- acne vulgaris — strong association
- rosacea/folliculitis differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- skin_lesion taxonomy review

## Biomedical safety overlay
Severe nodulocystic scarring disease, systemic medication adverse effects or atypical infection needs dermatology evaluation.

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

# 05. `tdis.bai_bi` - 白疕 / Psoriasis-Type TCM Disease

## Identity
```yaml
id: tdis.bai_bi
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 外科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional chronic scaly-plaque skin disease identity with strong clinical correspondence to psoriasis, while remaining a separate TCM disease layer.

## `bing_yin` / `bing_ji` staging
Candidate Blood Heat, Blood Dryness/deficiency, Wind and Blood stasis mechanisms require approved source mapping to existing Patterns.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Well-demarcated scaly plaques, chronic recurrence, itching and possible nail/joint symptoms.

## Pattern candidates [DERIVED_RELATION]
- pattern.blood_stasis
- pattern.liver_blood_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- psoriasis — strong association
- psoriatic arthritis context

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- scaly_plaque sign
- itching

## Biomedical safety overlay
Generalized pustular/erythrodermic disease, fever or immunosuppression infection risk needs urgent dermatology/medical care.

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

# 06. `tdis.you_feng` - 油風（斑禿） / Alopecia Areata-Type TCM Disease

## Identity
```yaml
id: tdis.you_feng
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 外科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for sudden patchy hair loss, commonly corresponding to alopecia areata but requiring biomedical differential for other alopecias.

## `bing_yin` / `bing_ji` staging
Candidate Blood deficiency, Liver/Kidney deficiency, Wind and Blood stasis pathways depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Well-defined patchy nonscarring hair loss; nail changes or wider hair loss may occur.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_blood_deficiency
- pattern.kidney_essence_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- alopecia areata — common association
- tinea capitis
- thyroid/iron deficiency hair loss differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- hair_loss sign

## Biomedical safety overlay
Scarring, inflamed/infected scalp, systemic autoimmune/endocrine signs or rapid diffuse loss needs medical evaluation.

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

# 07. `tdis.kou_chuang` - 口瘡 / Oral Ulcer Disease

## Identity
```yaml
id: tdis.kou_chuang
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 五官
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for recurrent or acute mouth-ulcer presentations. It spans aphthous ulcers, infection, autoimmune and medication/systemic causes.

## `bing_yin` / `bing_ji` staging
Candidate Heart/Stomach Fire, Yin deficiency heat and Spleen deficiency pathways require source verification.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Painful oral erosions/ulcers, recurrence, burning and eating discomfort.

## Pattern candidates [DERIVED_RELATION]
- pattern.heart_fire
- pattern.stomach_fire
- pattern.stomach_yin_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- recurrent aphthous stomatitis
- HSV/infection differential
- Behçet/IBD/hematologic differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- oral_ulcer sign
- oral_pain

## Biomedical safety overlay
Persistent >2–3 week ulcer, large progressive lesion, systemic illness, immunosuppression or suspicious oral cancer features require medical/dental evaluation.

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

# 08. `tdis.ya_tong` - 牙痛 / Toothache

## Identity
```yaml
id: tdis.ya_tong
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 五官
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for dental/tooth pain. It is a symptom-centered TCM disease that must not replace dental diagnosis.

## `bing_yin` / `bing_ji` staging
Candidate Stomach Fire, Wind-Fire and Kidney deficiency pathways depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Localized tooth/gum pain, thermal/chewing sensitivity and swelling depending cause.

## Pattern candidates [DERIVED_RELATION]
- pattern.stomach_fire
- pattern.kidney_yin_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- dental caries/pulpitis
- periodontal infection
- dental abscess
- trigeminal neuralgia differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- tooth_pain
- facial_swelling sign

## Biomedical safety overlay
Facial/neck swelling, fever, trismus, dysphagia, drooling or airway symptoms can indicate spreading odontogenic infection and require urgent dental/medical care.

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

# 09. `tdis.mu_yun` - 目暗昏花／視瞻昏渺 / Blurred / Dim Vision TCM Disease

## Identity
```yaml
id: tdis.mu_yun
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 五官
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional visual-impairment disease identity for dim/blurred vision presentations. It must not conceal time-sensitive ophthalmic or neurologic causes.

## `bing_yin` / `bing_ji` staging
Candidate Liver Blood/Yin deficiency, Kidney Essence deficiency and phlegm/stasis pathways depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Blurred, dim or reduced visual clarity with chronic or episodic pattern; associated floaters, flashes or pain require separate safety analysis.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_blood_deficiency
- pattern.liver_yin_deficiency
- pattern.kidney_essence_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- refractive error/cataract
- retinal detachment emergency differential
- acute angle-closure glaucoma
- GCA/TIA/stroke visual loss

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- blurred_vision
- acute_visual_loss P0

## Biomedical safety overlay
Sudden vision loss, curtain/floaters/flashes, painful red eye, diplopia or neurologic deficits requires immediate biomedical/ophthalmic evaluation.

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
