# Condition / TCM Disease / Pattern Relation Gap Audit — Clean V2

**Date:** 2026-08-09  
**Crosswalk research files:** 10  
**Staged relation atoms:** 230

## CURRENT relation families retained from supplied repo audit

```text
edge.condition_patterns
edge.condition_symptoms
edge.tdis_patterns
edge.tdis_symptoms
edge.symptom_patterns
edge.symptom_conditions
edge.symptom_tdis
```

No new edge family is authorized by this pack.

## Crosswalk batches

- `40_COND_TDIS_CROSSWALK_BATCH_A.md` — 24 atoms
- `41_COND_TDIS_CROSSWALK_BATCH_B.md` — 26 atoms
- `42_COND_TDIS_CROSSWALK_BATCH_C_RESPIRATORY_NEURO.md` — 24 atoms
- `43_COND_TDIS_CROSSWALK_BATCH_D_EMERGENCY_VASCULAR.md` — 24 atoms
- `44_COND_TDIS_CROSSWALK_BATCH_E_GI_LIVER.md` — 24 atoms
- `45_COND_TDIS_CROSSWALK_BATCH_F_RENAL_METABOLIC_HEME.md` — 23 atoms
- `46_COND_TDIS_CROSSWALK_BATCH_G_REPRODUCTIVE.md` — 21 atoms
- `47_COND_TDIS_CROSSWALK_BATCH_H_AUTOIMMUNE_MSK_DERM.md` — 22 atoms
- `48_COND_TDIS_CROSSWALK_BATCH_I_MENTAL_NEURO.md` — 18 atoms
- `49_COND_TDIS_CROSSWALK_BATCH_J_ENT_INFECTIOUS_GENETIC_ONCOLOGY.md` — 24 atoms

## Recurrent graph bottlenecks

```text
missing symptom/sign endpoints
condition <-> TDIS authored-direction authority
condition <-> medication relation contract
shared emergency/safety objects
parent/subtype relations
reverse-link derivation policy
```

## Preferred relation policy

```text
one canonical authored direction
+
derived reverse view

rather than two manually independent inverse truths
```

## Reusable research semantics

```text
STRONG_CLINICAL_ASSOCIATION
COMMON_TCM_PRESENTATION
POSSIBLE_CONTEXTUAL_ASSOCIATION
DIFFERENTIAL_CONTEXT
EMERGENCY_DIFFERENTIAL_CONTEXT
UNSUPPORTED_DO_NOT_LINK
```

These are staging semantics only and must map to CURRENT canonical relation vocabulary during ingestion.
