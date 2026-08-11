# TCM Disease Research Batch I - Gynecology / Pregnancy Additional

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Identities:** 6  
**Identity authority:** supplied CURRENT `data/pathology/tdis_registry.json` audit.  
**Rule:** all identities below already exist; enrich only. TCM mechanism prose is staging until approved disease-specific sources are attached.

---
# 01. `tdis.yue_jing_guo_shao` - 月經過少 / Scanty Menstruation

## Identity
```yaml
id: tdis.yue_jing_guo_shao
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 妇科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional menstrual disease identity for abnormally scant menstrual flow within the TCM gynecologic framework.

## `bing_yin` / `bing_ji` staging
Candidate Blood deficiency, Kidney deficiency, Blood stasis and phlegm-damp pathways require approved gynecology source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Reduced menstrual volume with timing, color, clots, pain and systemic features used in differentiation.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_blood_deficiency
- pattern.kidney_essence_deficiency
- pattern.blood_stasis

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- pregnancy/hormonal contraception
- hypothalamic dysfunction
- PCOS/thyroid disease
- intrauterine adhesions differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- scant_menses/menstrual_irregularity

## Biomedical safety overlay
Pregnancy possibility, new amenorrhea, severe pelvic pain or systemic endocrine symptoms require biomedical evaluation.

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

# 02. `tdis.bu_yu` - 不育 / Male Infertility

## Identity
```yaml
id: tdis.bu_yu
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 妇科
```

## Disease scope / `summary` [CANONICAL_NOW]
Registered traditional disease identity for male-factor infertility. It should link to biomedical male infertility evaluation without assuming one TCM mechanism.

## `bing_yin` / `bing_ji` staging
Candidate Kidney Jing/Yang/Yin deficiency, damp-heat, Qi stagnation and blood stasis pathways depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Infertility context with semen/sexual/constitutional features depending pattern; often no overt symptoms.

## Pattern candidates [DERIVED_RELATION]
- pattern.kidney_essence_deficiency
- pattern.kidney_yang_deficiency
- pattern.kidney_yin_deficiency
- pattern.liver_qi_stagnation

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- male infertility — strong contextual association
- varicocele/hormonal/genetic/obstructive causes

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- manifestation endpoints pending

## Biomedical safety overlay
Infertility requires semen, reproductive and partner evaluation; testicular mass, severe pain or systemic disease needs urologic care.

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

# 03. `tdis.ren_shen_e_zu` - 妊娠惡阻 / Severe Nausea/Vomiting of Pregnancy

## Identity
```yaml
id: tdis.ren_shen_e_zu
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 妇科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional pregnancy disease identity for significant nausea/vomiting during pregnancy. It overlaps pregnancy nausea/hyperemesis presentations but must preserve dehydration/metabolic safety.

## `bing_yin` / `bing_ji` staging
Candidate Stomach Qi rebellion with Spleen/Stomach deficiency, phlegm or Liver-Stomach disharmony depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Pregnancy-related nausea/vomiting, poor intake and associated digestive features.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_stomach_disharmony
- pattern.spleen_qi_deficiency
- pattern.phlegm_damp_in_lung

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- nausea/vomiting of pregnancy
- hyperemesis gravidarum — severe differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- sym.nausea candidate
- sym.vomiting candidate

## Biomedical safety overlay
Unable to keep fluids down, dehydration, weight loss, electrolyte disturbance, abdominal pain/bleeding or altered mental status requires obstetric/medical care.

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

# 04. `tdis.tai_wei_bu_zheng` - 胎位不正 / Fetal Malpresentation

## Identity
```yaml
id: tdis.tai_wei_bu_zheng
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 妇科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional obstetric identity for abnormal fetal presentation/position near term. It is not a TCM Pattern and requires obstetric imaging/management.

## `bing_yin` / `bing_ji` staging
Traditional explanatory mechanisms require obstetric TCM source review and should not override mechanical/obstetric facts.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Usually identified by abdominal/obstetric examination or ultrasound rather than patient symptoms.

## Pattern candidates [DERIVED_RELATION]
- SOURCE_RECHECK_REQUIRED

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- breech presentation
- transverse/oblique lie

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- manifestation endpoints pending

## Biomedical safety overlay
Obstetric gestational age, placenta, fluid, fetal/maternal factors and delivery planning govern safety. Any manipulation/acupuncture discussion must remain adjunctive to obstetric care.

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

# 05. `tdis.que_ru` - 缺乳 / Insufficient Lactation

## Identity
```yaml
id: tdis.que_ru
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 妇科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional postpartum disease identity for insufficient milk production/supply in a lactating patient.

## `bing_yin` / `bing_ji` staging
Candidate Qi/Blood deficiency and Liver Qi stagnation pathways are common research families requiring source verification.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Low perceived/actual milk supply with postpartum fatigue, breast fullness/flow or emotional context depending pattern.

## Pattern candidates [DERIVED_RELATION]
- pattern.spleen_qi_deficiency
- pattern.liver_qi_stagnation
- pattern.liver_blood_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- low milk supply/lactation difficulty
- infant transfer/feeding problem differential
- endocrine/postpartum factors

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- manifestation endpoints pending

## Biomedical safety overlay
Infant weight loss/dehydration, maternal mastitis/abscess, postpartum hemorrhage/anemia or endocrine disease requires lactation/pediatric/medical evaluation.

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

# 06. `tdis.zheng_jia` - 癥瘕 / Abdominal / Pelvic Mass Disease

## Identity
```yaml
id: tdis.zheng_jia
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 妇科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for fixed or mobile abdominal/pelvic masses or accumulations. It can overlap fibroids, ovarian masses, endometriosis and malignancy but is never diagnostic of one.

## `bing_yin` / `bing_ji` staging
Qi stagnation, blood stasis, phlegm/damp and deficiency pathways are candidates; 癥 vs 瘕 distinctions require approved source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Palpable or imaging-identified pelvic/abdominal mass with pain, bleeding, pressure or fertility symptoms depending cause.

## Pattern candidates [DERIVED_RELATION]
- pattern.blood_stasis
- pattern.liver_qi_stagnation

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- uterine fibroids — common contextual association
- ovarian cyst/mass
- endometriosis
- gynecologic malignancy differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- pelvic_pressure/mass sign

## Biomedical safety overlay
Rapid growth, postmenopausal bleeding, severe acute pain/torsion, pregnancy, ascites or malignancy warning signs require biomedical imaging/evaluation.

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
