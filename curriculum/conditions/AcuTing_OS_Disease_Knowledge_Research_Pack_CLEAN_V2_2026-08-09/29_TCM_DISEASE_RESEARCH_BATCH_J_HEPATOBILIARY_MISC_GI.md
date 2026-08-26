# TCM Disease Research Batch J - Hepatobiliary / Misc GI

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Identities:** 4  
**Identity authority:** supplied CURRENT `data/pathology/tdis_registry.json` audit.  
**Rule:** all identities below already exist; enrich only. TCM mechanism prose is staging until approved disease-specific sources are attached.

---
# 01. `tdis.e_ni` - 呃逆 / Hiccup

## Identity
```yaml
id: tdis.e_ni
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for persistent or clinically significant hiccup presentations, centered on rebellious Stomach Qi in traditional theory.

## `bing_yin` / `bing_ji` staging
Candidate Stomach Qi rebellion due to cold, heat, food, phlegm or deficiency depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Repetitive involuntary hiccups with digestive or systemic context.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_stomach_disharmony
- pattern.stomach_fire
- pattern.stomach_yin_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- ordinary transient hiccups
- CNS/metabolic/medication causes of persistent hiccups

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- hiccups

## Biomedical safety overlay
Hiccups lasting days or with neurologic, chest, severe GI or metabolic symptoms requires biomedical evaluation.

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

# 02. `tdis.xie_tong` - 脅痛 / Hypochondriac / Flank-Rib-Side Pain

## Identity
```yaml
id: tdis.xie_tong
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for pain in the lateral rib/hypochondriac region. It overlaps hepatobiliary, musculoskeletal, pulmonary and renal causes.

## `bing_yin` / `bing_ji` staging
Candidate Liver Qi stagnation, damp-heat, blood stasis and deficiency pathways.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Lateral rib/RUQ/flank pain with emotional, digestive, respiratory or movement associations depending pattern.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_qi_stagnation
- pattern.liver_gallbladder_damp_heat
- pattern.blood_stasis

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- gallbladder disease
- hepatitis/liver disease
- rib/intercostal pain
- lower-lung/PE differential

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- RUQ_or_flank_pain

## Biomedical safety overlay
Fever/jaundice, dyspnea/chest pain, trauma, hypotension or severe progressive RUQ pain requires urgent biomedical evaluation.

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

# 03. `tdis.huang_dan` - 黃疸 / Jaundice Disease

## Identity
```yaml
id: tdis.huang_dan
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 内科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional disease identity for visible yellowing/jaundice presentations. It is a sign-driven disease layer and not a biomedical cause diagnosis.

## `bing_yin` / `bing_ji` staging
Candidate Yang jaundice damp-heat and Yin jaundice cold-damp/deficiency frameworks require approved source extraction.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Yellow sclera/skin with dark urine, fatigue, digestive or abdominal symptoms depending cause/pattern.

## Pattern candidates [DERIVED_RELATION]
- pattern.liver_gallbladder_damp_heat
- pattern.spleen_yang_deficiency

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- viral hepatitis
- biliary obstruction/gallstones
- hemolysis
- cirrhosis/pancreatic disease

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- jaundice sign

## Biomedical safety overlay
New jaundice with fever/RUQ pain, confusion, bleeding, severe weakness or obstruction signs requires prompt medical evaluation.

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

# 04. `tdis.zhi_chuang` - 痔瘡 / Hemorrhoids

## Identity
```yaml
id: tdis.zhi_chuang
identity_status: EXISTING_ENRICH
registry_status: EXISTS_IN_SUPPLIED_CURRENT_AUDIT
library_card_status: UNKNOWN_PATH_MISMATCH
family_candidate: 外科
```

## Disease scope / `summary` [CANONICAL_NOW]
Traditional anorectal disease identity for hemorrhoidal swelling/bleeding/prolapse. It often corresponds strongly to Western hemorrhoids while still requiring bleeding differential.

## `bing_yin` / `bing_ji` staging
Candidate damp-heat, Qi sinking, blood stasis and deficiency mechanisms depending source.

**Status:** `RESEARCH_SYNTHESIS_REQUIRES_APPROVED_TCM_SOURCE_RECHECK`

## `zheng_hou` / manifestation staging
Bright red rectal bleeding, prolapse, itching/discomfort or thrombosed pain.

## Pattern candidates [DERIVED_RELATION]
- pattern.spleen_qi_sinking
- pattern.blood_stasis

Do not mint a new `pattern.*` identity from an unresolved traditional phrase inside this batch.

## Western associations / differential context [DERIVED_RELATION]
- hemorrhoids — strong association
- colorectal cancer/IBD/anal fissure differential for bleeding

Association does not imply biomedical identity equality.

## Symptom/sign endpoint staging
- rectal_bleeding
- anal_pain

## Biomedical safety overlay
Do not assume rectal bleeding is hemorrhoids. Heavy/recurrent bleeding, anemia, weight loss, bowel habit change or severe thrombosed/infected symptoms requires evaluation.

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
