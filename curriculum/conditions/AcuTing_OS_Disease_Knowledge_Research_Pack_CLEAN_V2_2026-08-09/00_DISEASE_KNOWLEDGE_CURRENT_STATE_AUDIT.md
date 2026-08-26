# AcuTing OS Disease Knowledge Current-State Audit — Clean V2

**Date:** 2026-08-09  
**Repository reference:** `guot-beep/acuting-os` / `main`  
**Original audited commit:** `47026e57566bcf1518a730906de832cbbc063c66`  
**Mode:** research / source packaging only; no canonical repo mutation.  
**Clean-pack rule:** one canonical final file per topic; no `(1)`, `(2)`, or `UPDATED` variants.

## 1. Repository contract retained from the supplied current audit

Western Condition canonical authority:

```text
data/pathology/condition_canon_shortlist.json
declared V1 count in current contract: 150
```

CURRENT approved Condition root fields retained:

```text
id
category
name
name_zh
aliases
aliases_zh
source
category_path
summary
clinical_definition
etiology
pathophysiology
presentation_clinical
key_features
red_flags
diagnosis_methods
exam_tags
differential_diagnosis
western_treatment
tcm_patterns
acupuncture_role
notes
related_condition_ids
related_pattern_ids
related_symptom_ids
review_status
authored_by
content_accounting
```

TCM Disease registry:

```text
data/pathology/tdis_registry.json
```

P0 unresolved contract mismatch from the original audit:

```text
expected by TDIS template/validator:
data/pathology/tcm_disease_library.json

status during original audit:
NOT FOUND AT EXPECTED PATH
```

Symptom pilot observed in the original audit:

```text
sym.headache
sym.insomnia
sym.fatigue
```

TDIS registry additionally referenced:

```text
sym.fever
sym.edema
```

Those two must be reconciled before recreating them.

## 2. Clean V2 research coverage

```yaml
western_full_research_entries: 93
tdis_research_entries: 75
staged_crosswalk_atoms: 230
canonical_ids_created: 0
new_edge_types_created: 0
schema_changes_made: 0
repo_files_modified: 0
```

## 3. Ontology boundary

```text
cond.*    Western biomedical condition
tdis.*    TCM disease
pattern.* TCM pattern
sym.*     symptom/sign candidate layer

Condition != TCM Disease != Pattern != Symptom
association != identity equality
```

## 4. Main finding after expansion

The research bottleneck is no longer simply “too few disease names.” The next repository bottlenecks are:

```text
1. exact Western identity reconciliation against all current canonical names/aliases
2. TDIS canonical library path authority
3. symptom/sign endpoint coverage
4. shared safety/red-flag routing
5. parent/subtype modeling for broad disease families
6. longitudinal treatment/monitoring representation
```

## 5. What Clean V2 deliberately did NOT do

```text
no canonical JSON writes
no schema edits
no invented ICD codes
no new Pattern IDs
no new TDIS IDs
no invented relation-edge vocabulary
no automatic Western<->TCM equivalence
no treatment-threshold claims from TCM discovery sources
```

## 6. Navigation

- `01` = Western masterlist and residual gaps
- `02` = TCM masterlist and residual source gaps
- `03` = relation architecture audit
- `04` = Board coverage matrix
- `05–18` = Western full research batches
- `19` = Western research index
- `20–29` = TCM full research batches
- `30–32` = TCM index/source/safety queues
- `40–49` = crosswalk batches
- `50–52` = relation index/guardrails/readiness
- `60–63` = endpoint/safety/identity/source audits
- `70–73` = schema/Board/ingestion/QA
- `90` = final handoff

The unused numbers are reserved namespace space, not missing files.
