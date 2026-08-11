# Schema Gap Frequency Audit — Clean V2

**Date:** 2026-08-09  
**Sample:** 93 Western full research entries + 75 TCM disease entries + 230 staged crosswalk atoms.  
**Schema changes authorized:** 0

## 1. Legacy Big Card correction remains in force

CURRENT Condition schema already contains:

```text
diagnosis_methods
differential_diagnosis
western_treatment
exam_tags
```

Therefore these are **not** root-schema gaps.

## 2. Western repeated model needs

| Candidate model need | Recurrence in expanded research | Existing workaround | Assessment |
|---|---|---|---|
| structured subtype / phenotype | very high | prose / notes | `TRUE_SCHEMA_GAP_CANDIDATE` |
| structured complication / emergency state | very high | red_flags / related conditions / notes | `TRUE_SCHEMA_GAP_CANDIDATE` |
| longitudinal monitoring / follow-up | very high | treatment / notes | `LONGITUDINAL_LAYER_CANDIDATE` |
| treatment-course status | high | notes | `LONGITUDINAL_LAYER_CANDIDATE` |
| medication relationships | very high | staging | `RELATION_CONTRACT_GAP` |
| diagnostic-criteria object | moderate-high | diagnosis_methods prose | `POSSIBLE_SCHEMA_GAP` |
| laterality / anatomical site qualifiers | moderate-high | prose / potential ID inflation | `STRUCTURED_QUALIFIER_CANDIDATE` |
| shared safety / red-flag object | very high | repeated prose | `SAFETY_RELATION_MODEL_CANDIDATE` |
| comorbidity clusters | high | related_condition_ids | `DERIVED_RELATION_FIRST` |
| device / procedure status | moderate | notes | `LOWER_PRIORITY_STRUCTURED_LAYER` |

### Repeated examples

```text
subtype:
  heart failure phenotype
  angina types
  VTE parent vs DVT/PE
  aneurysm territories
  IBD parent vs Crohn/UC
  hepatitis types
  eating-disorder subtypes
  substance-specific SUDs
  cancer site/subtype
  EDS subtype

complication:
  PE from DVT
  MI complications
  aneurysm rupture/dissection
  tension pneumothorax
  GCA visual ischemia
  cirrhosis decompensation
  DKA
  febrile neutropenia
  pregnancy emergencies

longitudinal:
  anticoagulation course
  aneurysm serial imaging
  post-MI secondary prevention
  CKD monitoring
  thyroid/adrenal laboratory follow-up
  cancer treatment course
```

## 3. TCM repeated model needs

| Candidate need | Recurrence | Current possible home | Assessment |
|---|---|---|---|
| TCM differential diseases | high | notes | `TRUE_SCHEMA_GAP_CANDIDATE` |
| treatment principle | medium-high | no dedicated TDIS root field | `TRUE_SCHEMA_GAP_CANDIDATE` |
| progression/transformation | medium | bing_ji / notes | `NEEDS_SEMANTIC_REVIEW` |
| biomedical safety overlay | very high | notes / Western relation | `SHARED_SAFETY_RELATION_PREFERRED` |
| formulas | high | formula_ids | `CANONICAL_NOW` |
| acupoints | high | acupoint_ids | `CANONICAL_NOW` |
| Western associations | very high | western_condition_ids | `CANONICAL_NOW` |
| manifestations | very high | zheng_hou + relation | `CANONICAL_NOW + RELATION` |
| aliases / classical terminology | high | aliases + sources | `CANONICAL_NOW` |
| episode / acute-chronic qualifier | moderate | prose | `POSSIBLE_QUALIFIER_LAYER` |

## 4. Do not confuse ontology gaps with schema gaps

```yaml
missing_symptom:
  type: ONTOLOGY_COVERAGE_GAP

TDIS_library_path_missing:
  type: REPOSITORY_CONTRACT_DEFECT

condition_medication_link:
  type: RELATION_CONTRACT_GAP

shared_emergency_route:
  type: SAFETY_RELATION_MODEL_CANDIDATE

personal_mastery_score:
  type: STUDY_UI_LAYER

structured_subtype:
  type: TRUE_SCHEMA_GAP_CANDIDATE
```

## 5. Recommendation

Do **not** change Condition or TDIS root schemas yet.

Recommended proof sequence:

```text
resolve repo blockers
-> identity-reconcile Western research
-> ingest one Western batch
-> promote first symptom wave
-> ingest one TDIS batch
-> ingest resolvable relation batch
-> prototype one shared safety object
-> measure query/render/validation pain
-> only then draft schema RFC
```

## 6. Highest-confidence future RFC candidates

```text
A. subtype / phenotype layer
B. shared safety-object relation layer
C. longitudinal monitoring / treatment-status layer
D. lightweight structured qualifiers for laterality/site where clinically essential
```

Each RFC should require deterministic migration and validator rules.
