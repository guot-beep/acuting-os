# Condition <-> TCM Disease Crosswalk Batch G - Reproductive / Gynecology

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Relation atoms:** 21  
**Rule:** research semantics below are not permission to create new canonical edge types. Resolve both endpoints and map to CURRENT relation vocabulary at ingestion.

## Guardrail

```text
Western Condition != TCM Disease != Pattern != Symptom
association != equivalence
one authored direction + derived reverse preferred
```

# Relation atoms

| # | Source | Target | Staging relation | Endpoint status | Confidence | Guardrail |
|---:|---|---|---|---|---|---|
| 1 | `endometriosis candidate` | `tdis.tong_jing` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | dysmenorrhea common but not universal |
| 2 | `endometriosis candidate` | `tdis.bu_yun` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium-high | infertility context only |
| 3 | `endometriosis candidate` | `tdis.zheng_jia` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | mass/lesion tradition context only |
| 4 | `uterine fibroids candidate` | `tdis.zheng_jia` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | mass association, not identity equality |
| 5 | `uterine fibroids candidate` | `tdis.yue_jing_guo_duo` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | heavy bleeding phenotype |
| 6 | `uterine fibroids candidate` | `tdis.tong_jing` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | pain phenotype |
| 7 | `primary dysmenorrhea candidate` | `tdis.tong_jing` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | different ontology |
| 8 | `AUB candidate` | `tdis.beng_lou` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | phenotype dependent |
| 9 | `AUB candidate` | `tdis.yue_jing_guo_duo` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | heavy cyclic phenotype |
| 10 | `AUB candidate` | `anemia candidate` | `POSSIBLE_CONSEQUENCE` | anemia staging | medium-high | not inevitable |
| 11 | `ectopic pregnancy candidate` | `tdis.fu_tong` | `EMERGENCY_DIFFERENTIAL_CONTEXT` | TDIS exists | high | acute pelvic/abdominal pain |
| 12 | `ectopic pregnancy candidate` | `tdis.beng_lou` | `EMERGENCY_DIFFERENTIAL_CONTEXT` | TDIS exists | medium | bleeding presentation |
| 13 | `preeclampsia candidate` | `tdis.tou_tong` | `EMERGENCY_DIFFERENTIAL_CONTEXT` | TDIS exists | medium | headache severe-feature context |
| 14 | `preeclampsia candidate` | `tdis.shui_zhong` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | low-medium | edema nonspecific in pregnancy |
| 15 | `male infertility Western concept` | `tdis.bu_yu` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | cause-specific Western workup still required |
| 16 | `female infertility Western concept` | `tdis.bu_yun` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | multifactorial |
| 17 | `low milk supply Western concept` | `tdis.que_ru` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | medium-high | infant transfer/maternal cause evaluation |
| 18 | `breech/malpresentation Western concept` | `tdis.tai_wei_bu_zheng` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | obstetric state, not Pattern |
| 19 | `hyperemesis gravidarum Western concept` | `tdis.ren_shen_e_zu` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | severe dehydration safety |
| 20 | `amenorrhea Western identity` | `tdis.bi_jing` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | pregnancy/menopause boundary |
| 21 | `menopause Western context` | `tdis.jing_duan_qian_hou` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium-high | normal menopause is not automatically disease |


# Safety / semantic clusters

## Pregnancy first

Pregnancy status changes the differential for bleeding, amenorrhea, pelvic pain and vomiting. Ectopic pregnancy and preeclampsia must outrank routine TCM differentiation when red flags are present.

## Normal life stage

Menopause itself must not be pathologized simply because `tdis.jing_duan_qian_hou` exists.

# Endpoint actions

Any target written as a plain concept rather than a verified canonical ID remains `MISSING_ENDPOINT_CANDIDATE`, `IDENTITY_CHECK_REQUIRED`, or `GRANULARITY_REVIEW`. No ID is minted by this file.

# Content accounting

```yaml
relation_atoms: 21
identity_equalities_asserted: 0
new_edge_types_authorized: 0
canonical_edges_authorized: 0
```
