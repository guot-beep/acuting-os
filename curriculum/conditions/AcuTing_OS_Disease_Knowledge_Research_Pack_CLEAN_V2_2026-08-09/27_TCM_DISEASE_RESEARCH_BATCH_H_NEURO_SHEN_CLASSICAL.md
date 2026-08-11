# TCM Disease Research Batch H - Neuro / Shen / Classical

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Identities:** 8  
**Identity authority:** supplied CURRENT `data/pathology/tdis_registry.json` audit.  
**Rule:** all identities below already exist; enrich only. TCM mechanism prose is staging until approved disease-specific sources are attached.

---
# 01. `tdis.zhong_feng` - 中風 / Zhongfeng / Wind-Stroke Disease

## Identity
```yaml
id: tdis.zhong_feng
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 急症
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional acute neurologic disease identity historically corresponding strongly to stroke syndromes but not equivalent to one biomedical stroke subtype.

## `bing_yin` / `bing_ji` staging
Candidate internal Wind, phlegm, Fire, Qi/Blood disruption and deficiency mechanisms vary by source and stage. Acute safety supersedes pattern elaboration.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Sudden facial droop, weakness/numbness, speech disturbance, altered consciousness or other focal deficits.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_wind
- pattern.liver_yang_rising
- pattern.phlegm_heat_in_lung
- pattern.blood_stasis

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- cond.stroke — strong clinical association
- TIA — differential/warning context

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- facial_weakness
- unilateral_weakness
- speech_difficulty

## Biomedical safety overlay
Any new stroke signs require EMS/stroke-system evaluation; acupuncture must not delay reperfusion assessment.

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

# 02. `tdis.mian_tan` - 面癱／口僻 / Facial Paralysis

## Identity
```yaml
id: tdis.mian_tan
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for facial paralysis, commonly associated with peripheral facial palsy but requiring stroke differentiation.

## `bing_yin` / `bing_ji` staging
Candidate external Wind with channel obstruction, Qi/Blood deficiency and phlegm/stasis depending stage/source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Unilateral facial weakness, mouth deviation, incomplete eye closure and altered facial movement.

## Pattern candidates [DERIVED_RELATION]
- pattern.wind_cold_invading_lung
- pattern.blood_stasis

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- Bell palsy — strong association
- stroke — emergency differential
- Lyme/Ramsay Hunt — differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- facial_weakness sign

## Biomedical safety overlay
Sudden facial weakness with limb/speech deficits or uncertain central vs peripheral pattern requires emergency stroke evaluation.

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

# 03. `tdis.chan_zheng` - 顫證 / Tremor Disease

## Identity
```yaml
id: tdis.chan_zheng
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity centered on tremor/shaking. It spans multiple Western movement, medication and metabolic causes.

## `bing_yin` / `bing_ji` staging
Candidate Liver Wind, Liver/Kidney Yin deficiency, phlegm and Qi/Blood deficiency mechanisms.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Resting, action or postural tremor with possible rigidity, slowness or constitutional features.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_wind
- pattern.liver_yin_deficiency
- pattern.kidney_yin_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- Parkinson disease
- essential tremor
- hyperthyroidism/medication effects

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- tremor — endpoint candidate

## Biomedical safety overlay
Acute tremor with altered mental status, toxin/withdrawal, severe weakness or new neurologic deficit needs urgent evaluation.

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

# 04. `tdis.yu_zheng` - 鬱證 / Constraint / Depressive-Emotion Disease

## Identity
```yaml
id: tdis.yu_zheng
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity involving emotional constraint, depressed mood, irritability and somatic manifestations. It is not a biomedical diagnosis of major depression or anxiety.

## `bing_yin` / `bing_ji` staging
Liver Qi stagnation with secondary Fire, phlegm, Blood or Heart/Spleen deficiency are common candidate families.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Low mood, emotional constraint, sighing, irritability, chest/throat/GI symptoms and sleep changes depending pattern.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_qi_stagnation
- pattern.liver_fire
- pattern.heart_blood_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- major depressive disorder — contextual
- GAD — contextual
- PTSD — contextual

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- depressed_mood/anxiety endpoints review

## Biomedical safety overlay
Suicidal thoughts, mania, psychosis or inability to maintain safety requires urgent mental-health evaluation; TCM language must not dilute risk assessment.

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

# 05. `tdis.zang_zao` - 臟躁 / Zangzao / Restless Emotional Disease

## Identity
```yaml
id: tdis.zang_zao
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional emotional disease identity from classical literature involving episodic distress, restlessness or emotional dysregulation. Modern biomedical equivalence is uncertain and should not be forced.

## `bing_yin` / `bing_ji` staging
Candidate Heart/Blood/Yin deficiency and related Shen disturbance mechanisms require source-specific classical review.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Emotional lability, restlessness, crying or sleep disturbance as defined by source.

## Pattern candidates [DERIVED_RELATION]
- pattern.heart_blood_deficiency
- pattern.heart_yin_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- anxiety/depression/menopausal context — possible, not equivalence

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- emotional_distress granularity review

## Biomedical safety overlay
Severe psychiatric symptoms, suicidality, psychosis or neurologic change needs biomedical assessment.

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

# 06. `tdis.mei_he_qi` - 梅核氣 / Plum-Pit Qi / Globus

## Identity
```yaml
id: tdis.mei_he_qi
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for persistent lump/obstruction sensation in the throat without an obvious swallowed mass. It overlaps globus but requires ENT/GI differential.

## `bing_yin` / `bing_ji` staging
Liver Qi stagnation with phlegm is a core candidate pathway requiring approved source confirmation.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Intermittent/persistent throat lump sensation often influenced by emotion, without true obstructive swallowing in classic descriptions.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_qi_stagnation

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- globus sensation
- GERD/laryngopharyngeal reflux
- thyroid/ENT structural disease differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- globus_sensation
- dysphagia endpoint

## Biomedical safety overlay
True dysphagia, weight loss, voice change, neck mass, aspiration, bleeding or progressive symptoms require ENT/GI evaluation.

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

# 07. `tdis.jian_wang` - 健忘 / Forgetfulness

## Identity
```yaml
id: tdis.jian_wang
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for clinically significant forgetfulness/memory difficulty. It is not equivalent to dementia or Alzheimer disease.

## `bing_yin` / `bing_ji` staging
Candidate Heart/Spleen deficiency, Kidney Essence deficiency, phlegm and blood stasis mechanisms.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Memory lapses, poor concentration and cognitive fatigue depending source/pattern.

## Pattern candidates [DERIVED_RELATION]
- pattern.heart_blood_deficiency
- pattern.kidney_essence_deficiency
- pattern.spleen_qi_deficiency
- pattern.blood_stasis

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- normal aging
- depression/sleep disorder
- mild cognitive impairment/dementia
- thyroid/B12/medication causes

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- memory_problem endpoint

## Biomedical safety overlay
Acute confusion, sudden cognitive change, focal deficits or delirium triggers require urgent biomedical evaluation.

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

# 08. `tdis.bai_he_bing` - 百合病 / Baihe Disease

## Identity
```yaml
id: tdis.bai_he_bing
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 其他
```

## Disease scope / `summary` [CANONICAL_NOW]
Classical TCM disease identity with mental, behavioral and somatic disturbance described in traditional source literature. Modern biomedical mapping is uncertain.

## `bing_yin` / `bing_ji` staging
Do not synthesize a definitive mechanism from modern analogies; requires classical source extraction and commentary provenance.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Manifestations must be sourced directly from approved classical/teaching references rather than reconstructed from Western categories.

## Pattern candidates [DERIVED_RELATION]
- SOURCE_RECHECK_REQUIRED

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- NO_FORCED_MODERN_EQUIVALENCE
- mental-health/systemic differential only after source extraction

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- manifestation endpoints pending

## Biomedical safety overlay
If modern presentation includes psychiatric or systemic red flags, apply ordinary biomedical safety evaluation independent of the classical label.

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
