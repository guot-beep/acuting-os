# Condition <-> TCM Disease Crosswalk Batch H - Autoimmune / MSK / Dermatology

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Relation atoms:** 22  
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
| 1 | `RA candidate` | `tdis.bi_zheng` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | inflammatory arthritis one subset |
| 2 | `RA candidate` | `joint_swelling` | `manifestation` | sym/sign missing | high | infection differential |
| 3 | `SLE candidate` | `tdis.bi_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | MSK phenotype only |
| 4 | `SLE candidate` | `tdis.shi_chuang` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | low-medium | skin phenotype only; not eczema identity |
| 5 | `myasthenia gravis candidate` | `tdis.wei_zheng` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | weakness phenotype |
| 6 | `myasthenia gravis candidate` | `dyspnea` | `emergency manifestation` | sym missing | high | crisis context |
| 7 | `psoriasis candidate` | `tdis.bai_bi` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | ontology distinct |
| 8 | `psoriasis candidate` | `tdis.bi_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | psoriatic arthritis only |
| 9 | `gout candidate` | `tdis.bi_zheng` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | acute arthritic phenotype |
| 10 | `osteoporosis candidate` | `tdis.yao_tong` | `DIFFERENTIAL_CONTEXT` | TDIS exists | low-medium | vertebral fracture/back pain only |
| 11 | `fibromyalgia candidate` | `tdis.bi_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | broad pain overlap |
| 12 | `fibromyalgia candidate` | `sym.fatigue` | `manifestation` | EXISTS | high | common |
| 13 | `EDS candidate` | `tdis.jin_shang` | `DIFFERENTIAL_CONTEXT` | TDIS exists | low | recurrent injury context only |
| 14 | `EDS candidate` | `bruising` | `manifestation` | sym missing | medium | subtype/context dependent |
| 15 | `Marfan candidate` | `aortic aneurysm candidate` | `HIGH_VALUE_COMPLICATION_RISK` | both staging | high | aortic surveillance central |
| 16 | `Marfan candidate` | `pneumothorax candidate` | `POSSIBLE_ASSOCIATED_CONDITION` | pneumothorax staging | medium | known complication |
| 17 | `herpes zoster candidate` | `tdis.she_chuan_chuang` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | different ontology |
| 18 | `allergic urticaria Western concept` | `tdis.yin_zhen` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | anaphylaxis safety separate |
| 19 | `eczema/atopic dermatitis Western concept` | `tdis.shi_chuang` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | not universal equivalence |
| 20 | `alopecia areata Western concept` | `tdis.you_feng` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | other alopecias differential |
| 21 | `acne vulgaris Western concept` | `tdis.fen_ci` | `STRONG_CLINICAL_ASSOCIATION` | TDIS exists | high | ontology distinct |
| 22 | `oral aphthous ulcer Western concept` | `tdis.kou_chuang` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | persistent ulcer cancer differential |


# Safety / semantic clusters

## Immunosuppression

RA, SLE, psoriasis and oncology treatments can create infection/cytopenia safety context that should be derived from treatment status rather than hard-coded as a universal TCM mechanism.

## Hot swollen joint

Septic arthritis must remain a biomedical emergency differential even when `tdis.bi_zheng` is an appropriate TCM disease surface.

# Endpoint actions

Any target written as a plain concept rather than a verified canonical ID remains `MISSING_ENDPOINT_CANDIDATE`, `IDENTITY_CHECK_REQUIRED`, or `GRANULARITY_REVIEW`. No ID is minted by this file.

# Content accounting

```yaml
relation_atoms: 22
identity_equalities_asserted: 0
new_edge_types_authorized: 0
canonical_edges_authorized: 0
```
