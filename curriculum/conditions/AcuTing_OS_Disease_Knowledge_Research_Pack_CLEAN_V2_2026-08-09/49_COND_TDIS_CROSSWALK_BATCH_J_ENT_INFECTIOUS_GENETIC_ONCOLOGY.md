# Condition <-> TCM Disease Crosswalk Batch J - ENT / Infectious / Genetic / Oncology

**Date:** 2026-08-09  
**Status:** COMPLETE RESEARCH STAGING  
**Relation atoms:** 24  
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
| 1 | `acute angle-closure glaucoma candidate` | `tdis.mu_yun` | `EMERGENCY_DIFFERENTIAL_CONTEXT` | TDIS exists | high | painful red eye/vision loss |
| 2 | `retinal detachment candidate` | `tdis.mu_yun` | `EMERGENCY_DIFFERENTIAL_CONTEXT` | TDIS exists | high | floaters/flashes/curtain |
| 3 | `SSHL candidate` | `tdis.er_ming_er_long` | `EMERGENCY_DIFFERENTIAL_CONTEXT` | TDIS exists | high | time-sensitive hearing loss |
| 4 | `Ménière candidate` | `tdis.xuan_yun` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | vertigo phenotype |
| 5 | `Ménière candidate` | `tdis.er_ming_er_long` | `COMMON_TCM_PRESENTATION` | TDIS exists | high | hearing/tinnitus phenotype |
| 6 | `acute bacterial sinusitis candidate` | `tdis.bi_yuan` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | bacterial criteria remain biomedical |
| 7 | `otitis media candidate` | `tdis.er_ming_er_long` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | conductive hearing/ear symptoms |
| 8 | `influenza candidate` | `tdis.gan_mao` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium-high | virus-specific identity remains Western |
| 9 | `influenza candidate` | `tdis.ke_sou` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | cough phenotype |
| 10 | `COVID-19 candidate` | `tdis.gan_mao` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium | not identity equality |
| 11 | `COVID-19 candidate` | `tdis.chuan_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | dyspnea phenotype |
| 12 | `active TB candidate` | `tdis.ke_sou` | `COMMON_TCM_PRESENTATION` | TDIS exists | medium | chronic cough context |
| 13 | `active TB candidate` | `tdis.han_zheng` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | medium | night sweats context |
| 14 | `Lyme disease candidate` | `tdis.mian_tan` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | facial palsy manifestation |
| 15 | `HIV candidate` | `tdis.xu_lao` | `UNSUPPORTED_DO_NOT_LINK_UNIVERSALLY` | TDIS exists | high | avoid stigmatizing false equivalence |
| 16 | `syphilis candidate` | `tdis.er_ming_er_long` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | otosyphilis can cause hearing loss/tinnitus |
| 17 | `syphilis candidate` | `tdis.mu_yun` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | ocular syphilis/vision context |
| 18 | `Down syndrome candidate` | `tdis.jian_wang` | `UNSUPPORTED_DO_NOT_LINK` | TDIS exists | high | developmental disability is not forgetfulness |
| 19 | `breast cancer candidate` | `tdis.zheng_jia` | `UNSUPPORTED_DO_NOT_LINK_UNIVERSALLY` | TDIS exists | high | gynecologic mass identity not breast cancer |
| 20 | `colorectal cancer candidate` | `tdis.zhi_chuang` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | rectal bleeding must not be assumed hemorrhoids |
| 21 | `lung cancer candidate` | `tdis.ke_sou` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | persistent cough cause evaluation |
| 22 | `prostate cancer candidate` | `tdis.long_bi` | `DIFFERENTIAL_CONTEXT` | TDIS exists | medium | urinary obstruction symptom overlap |
| 23 | `cancer parent` | `tdis.xu_lao` | `POSSIBLE_CONTEXTUAL_ASSOCIATION` | TDIS exists | low | fatigue/wasting context only, never equivalence |
| 24 | `Marfan candidate` | `tdis.xiong_bi` | `DIFFERENTIAL_CONTEXT` | TDIS exists | low | acute chest symptoms must route to aortic emergency |


# Safety / semantic clusters

## Time-sensitive sensory emergencies

Acute angle closure, retinal detachment and sudden sensorineural hearing loss should link to shared eye/hearing emergency objects rather than routine `tdis.mu_yun` or `tdis.er_ming_er_long` care.

## Infectious identity discipline

Pathogen-specific Western diagnoses must not become aliases of broad TCM disease names.

## Oncology

TCM disease associations should remain symptom/differential context. Do not map cancer identities to traditional mass/wasting labels as if they were equivalent.

# Endpoint actions

Any target written as a plain concept rather than a verified canonical ID remains `MISSING_ENDPOINT_CANDIDATE`, `IDENTITY_CHECK_REQUIRED`, or `GRANULARITY_REVIEW`. No ID is minted by this file.

# Content accounting

```yaml
relation_atoms: 24
identity_equalities_asserted: 0
new_edge_types_authorized: 0
canonical_edges_authorized: 0
```
