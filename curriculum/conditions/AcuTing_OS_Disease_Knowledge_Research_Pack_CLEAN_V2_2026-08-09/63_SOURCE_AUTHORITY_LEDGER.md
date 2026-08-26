# Source Authority Ledger — Clean V2

**Purpose:** make source roles explicit so a future ingestion agent does not use a discovery source for a claim it cannot support.

## A. Repository authority

```yaml
CURRENT_repo_contract:
  priority: highest_for_schema_identity_and_validator_behavior
  examples:
    - docs/CONDITION_CARD_TEMPLATE.md
    - docs/TDIS_CARD_TEMPLATE.md
    - docs/PATTERN_CARD_TEMPLATE.md
    - docs/SYMPTOM_CARD_TEMPLATE.md
    - data/pathology/condition_canon_shortlist.json
    - data/pathology/tdis_registry.json
    - data/pathology/pattern_registry.json
    - data/config/relation_registry.json
```

## B. Board scope authority

```yaml
NCBAHM_official_outline:
  role:
    - exam scope
    - system/category inclusion
    - Board tagging
  not_role:
    - exact disease prevalence
    - exact ICD coding
    - detailed treatment thresholds
```

## C. Biomedical Tier A

### CDC / NCHS

Use for:

```text
ICD-10-CM fiscal-year coding authority
infectious-disease public-health guidance where CDC is the relevant authority
influenza / COVID / TB / STI / HIV / Lyme / shingles information
```

### NIH institutes / NLM

Use institute matched to topic:

```text
NHLBI   cardiovascular, vascular, pulmonary, hematology
NIDDK   endocrine, kidney, digestive, urologic
NINDS   neurologic disorders
NIAMS   rheumatologic, autoimmune, bone, skin
NIDCD   hearing / vestibular / communication disorders
NIDCR   oral / craniofacial disorders
NICHD   reproductive / pregnancy / gynecology
NIMH    mental health
NIDA    substance use / addiction
NEI     ophthalmology
NCI     oncology
NLM / MedlinePlus / MedlinePlus Genetics
        patient-facing disease and genetics summaries
```

## D. Professional guidelines

Use when a claim depends on exact:

```text
diagnostic threshold
treatment sequence
risk score
procedure indication
monitoring interval
pregnancy-specific management
screening recommendation
```

Do not rely on a generic NIH overview when a current specialty guideline is required for the exact threshold.

## E. TCM authority

Preferred order:

```text
CURRENT repo-approved TCM sources
course / Board-approved sources
approved modern TCM textbooks
approved classical texts and commentaries
American Dragon / CloudTCM for discovery and relation leads
```

### TCM discovery-source limitation

American Dragon / CloudTCM may support:

```text
aliases
traditional action/mechanism leads
formula / point relation discovery
crosswalk hypotheses
```

They should **not** be used as the authority for:

```text
biomedical emergency thresholds
ICD coding
Western diagnostic criteria
drug safety thresholds
modern guideline treatment decisions
```

## F. Provenance labels for canonical migration

Recommended:

```text
CURRENT_REPO
OFFICIAL_BOARD
BIOMEDICAL_TIER_A
PROFESSIONAL_GUIDELINE
TCM_APPROVED_MODERN
TCM_CLASSICAL
DISCOVERY_SOURCE
RESEARCH_SYNTHESIS
```

Research synthesis should never masquerade as a directly sourced canonical fact.
