# Condition <-> TCM Disease Crosswalk Batch I - Mental Health / Neurology

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Relation atoms:** 18  
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
| 1 | `GAD candidate` | `tdis.yu_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | not identity equality |
| 2 | `GAD candidate` | `tdis.xin_ji` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | low-medium | palpitation phenotype |
| 3 | `MDD candidate` | `tdis.yu_zheng` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | not every 鬱證 is MDD |
| 4 | `MDD candidate` | `tdis.bu_mei` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | sleep phenotype |
| 5 | `PTSD candidate` | `tdis.yu_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | trauma diagnosis remains biomedical |
| 6 | `OCD candidate` | `tdis.yu_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | low | weak mapping; do not force |
| 7 | `eating disorder parent` | `tdis.fei_pang` | `UNSUPPORTED_DO_NOT_LINK_UNIVERSALLY` | TDIS exists | high | eating disorders occur at any body size |
| 8 | `SUD parent` | `tdis.yu_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | low | comorbid emotional context only |
| 9 | `Parkinson candidate` | `tdis.chan_zheng` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | tremor disease surface, not identity |
| 10 | `MS candidate` | `tdis.ma_mu` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium | sensory phenotype |
| 11 | `MS candidate` | `tdis.wei_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | weakness phenotype |
| 12 | `GBS candidate` | `tdis.wei_zheng` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | acute emergency still biomedical |
| 13 | `epilepsy candidate` | `seizure` | `manifestation` | sym/sign review | high | seizure != epilepsy |
| 14 | `cauda equina candidate` | `urinary_retention` | `emergency manifestation` | sym missing | high | saddle anesthesia/weakness cluster |
| 15 | `cauda equina candidate` | `tdis.yao_tong` | `EMERGENCY_DIFFERENTIAL_CONTEXT` | TDIS exists | high | red flags override routine low-back treatment |
| 16 | `TIA candidate` | `tdis.zhong_feng` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | transient ischemia is not automatically 中風 identity |
| 17 | `dementia Western concept` | `tdis.jian_wang` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | forgetfulness is broader/nonspecific |
| 18 | `globus Western concept` | `tdis.mei_he_qi` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | medium-high | true dysphagia red flags separate |


# Safety / semantic clusters

## Mental-health safety

Suicide risk, psychosis, mania, severe eating-disorder instability and dangerous withdrawal/intoxication require dedicated biomedical/mental-health safety routes. TCM Shen terminology must never lower urgency.

## Neurologic weakness

Acute progressive weakness, respiratory/bulbar symptoms, saddle anesthesia or focal deficits require urgent neurologic pathways regardless of TCM disease mapping.

# Endpoint actions

Any target written as a plain concept rather than a verified canonical ID remains `MISSING_ENDPOINT_CANDIDATE`, `IDENTITY_CHECK_REQUIRED`, or `GRANULARITY_REVIEW`. No ID is minted by this file.

# Content accounting

```yaml
relation_atoms: 18
identity_equalities_asserted: 0
new_edge_types_authorized: 0
canonical_edges_authorized: 0
```
