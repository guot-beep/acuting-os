# Condition <-> TCM Disease Crosswalk Batch F - Renal / Metabolic / Hematology

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Relation atoms:** 23  
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
| 1 | `Type 1 diabetes candidate` | `tdis.xiao_ke` | `STRONG_HISTORICAL_CLINICAL_ASSOCIATION` | TDIS exists | medium-high | not every T1D presents as classic 消渴 |
| 2 | `cond.type-2-diabetes` | `tdis.xiao_ke` | `STRONG_HISTORICAL_CLINICAL_ASSOCIATION` | both known | medium-high | not identity equality |
| 3 | `Cushing candidate` | `tdis.fei_pang` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | low-medium | weight gain alone insufficient |
| 4 | `Cushing candidate` | `tdis.han_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | low | sweating phenotype only |
| 5 | `hemochromatosis candidate` | `tdis.xu_lao` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | low-medium | fatigue/chronic depletion context only |
| 6 | `CKD candidate` | `tdis.shui_zhong` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | edema context |
| 7 | `CKD candidate` | `tdis.xu_lao` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | fatigue/deficiency context |
| 8 | `CKD candidate` | `sym.edema` | `manifestation` | RECONCILE_EXISTING_REFERENCE | high | common advanced feature |
| 9 | `kidney stone candidate` | `tdis.lin_zheng` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | stone strangury-type overlap |
| 10 | `kidney stone candidate` | `tdis.xie_tong` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | flank pain surface |
| 11 | `pyelonephritis candidate` | `tdis.lin_zheng` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | urinary infection context |
| 12 | `pyelonephritis candidate` | `sym.fever` | `manifestation` | RECONCILE_EXISTING_REFERENCE | high | upper UTI |
| 13 | `cystitis candidate` | `tdis.lin_zheng` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | dysuria/frequency context |
| 14 | `BPH candidate` | `tdis.long_bi` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | retention/obstruction phenotype |
| 15 | `BPH candidate` | `tdis.lin_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | LUTS overlap |
| 16 | `prostatitis candidate` | `tdis.lin_zheng` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | dysuria context |
| 17 | `prostatitis candidate` | `tdis.long_bi` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | retention context |
| 18 | `ED candidate` | `tdis.yang_wei` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | ontology distinct |
| 19 | `obstructive sleep apnea candidate` | `tdis.bu_mei` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | sleep complaint but different disease |
| 20 | `obstructive sleep apnea candidate` | `sym.fatigue` | `manifestation` | EXISTS | medium-high | daytime sleepiness/fatigue distinction review |
| 21 | `Raynaud candidate` | `tdis.ma_mu` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | numbness during vasospasm |
| 22 | `polycythemia vera candidate` | `tdis.xuan_yun` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | low-medium | dizziness nonspecific |
| 23 | `neutropenia candidate` | `sym.fever` | `emergency manifestation context` | RECONCILE_EXISTING_REFERENCE | high | febrile neutropenia safety |


# Safety / semantic clusters

## Fluid/urinary ontology

`tdis.shui_zhong`, `tdis.lin_zheng`, and `tdis.long_bi` are reusable TCM disease surfaces but should route to cause-specific Western cards rather than become diagnoses of cause.

## Diabetes

消渴 association is historically strong, but diabetes type, diagnostic criteria and emergencies remain biomedical truth.

# Endpoint actions

Any target written as a plain concept rather than a verified canonical ID remains `MISSING_ENDPOINT_CANDIDATE`, `IDENTITY_CHECK_REQUIRED`, or `GRANULARITY_REVIEW`. No ID is minted by this file.

# Content accounting

```yaml
relation_atoms: 23
identity_equalities_asserted: 0
new_edge_types_authorized: 0
canonical_edges_authorized: 0
```
