# Ingestion Queue and Handoff — Clean V2

**Date:** 2026-08-09  
**Status:** CLEAN RESEARCH PACK FINAL HANDOFF  
**Repository reference:** `guot-beep/acuting-os` / `main`  
**Original audited commit:** `47026e57566bcf1518a730906de832cbbc063c66`  
**Canonical repo changes made by this research pack:** NONE

# 1. Clean V2 content accounting

```yaml
western_full_research_entries: 93
western_research_batches: 14

tdis_full_research_entries: 75
tdis_research_batches: 10

crosswalk_relation_atoms: 230
crosswalk_batches: 10

canonical_ids_created: 0
new_edge_types_created: 0
schema_changes_made: 0
repo_files_modified: 0

dedup:
  duplicate_western_candidate_ids: 0
  duplicate_tdis_full_entries: 0
  duplicate_crosswalk_source_target_pairs: 0
  exact_duplicate_file_hashes: 0
  forbidden_variant_filenames: 0
```

# 2. P0 blockers before ingestion

## TDIS source-of-truth path

```text
registry exists in supplied audit:
data/pathology/tdis_registry.json

template/validator expected:
data/pathology/tcm_disease_library.json

status during original audit:
NOT FOUND AT EXPECTED PATH
```

Resolve this before canonical TDIS card writes.

## Symptom source of truth

Original audit observed:

```text
sym.headache
sym.insomnia
sym.fatigue
```

But TDIS registry already references:

```text
sym.fever
sym.edema
```

Find the intended records/source before recreating either ID.

## Western identity reconciliation

Every `candidate_id` in `05–18` remains staging.

Required:

```text
exact current ID scan
name/name_zh scan
aliases/aliases_zh scan
parent/subtype decision
only then NEW_CANDIDATE if truly absent
```

See `62_WESTERN_IDENTITY_RECONCILIATION_QUEUE.md`.

# 3. Completed research domains

## Western

```text
hematology
cardiovascular / autonomic / vascular emergency
endocrine / metabolic
respiratory
renal / urinary
sleep
neurology
GI / liver
autoimmune / rheumatology
MSK
dermatology
mental / behavioral health
reproductive / gynecology / urology
ENT / ophthalmic emergencies
infectious disease
genetics
oncology
```

## TCM Disease

Research now covers the registered identities in the pack across:

```text
head / Shen / chest
GI
gynecology
respiratory / ENT
Qi / fluid / GU / metabolic
MSK / channel / neuro
dermatology / oral / eye
neuro / Shen / classical
pregnancy / additional gynecology
hepatobiliary / miscellaneous GI
```

No new TDIS identity was created.

# 4. Relation research

Crosswalk batches `40–49` contain 230 unique source→target atoms.

Rules preserved:

```text
Condition != TCM Disease != Pattern != Symptom
association != equivalence
do not invent new canonical edge vocabulary
prefer authored truth + derived reverse
```

`51_NEGATIVE_LINK_GUARDRAILS.md` explicitly records high-risk false equivalences.

# 5. Shared safety architecture

`61_SHARED_SAFETY_OBJECT_CANDIDATES.md` identifies reusable candidate safety objects:

```text
acute chest pain
acute dyspnea
acute focal neurologic deficit
acute visual loss
sudden hearing loss
major bleeding
acute abdominal/pelvic pain
airway compromise
febrile neutropenia/sepsis
acute urinary retention/cauda equina
pregnancy emergency
```

These are proposal candidates, not authorized schema changes.

# 6. Source governance

Use `63_SOURCE_AUTHORITY_LEDGER.md`.

Priority:

```text
CURRENT repo contract
-> official Board for scope
-> NIH/NLM/CDC/FDA or specialty guideline for biomedical truth
-> approved TCM/classical sources for TCM truth
-> discovery sources only for discovery-appropriate claims
```

# 7. Safe repository ingestion order

```yaml
STEP_0:
  - pin current branch + commit
  - run baseline validators
  - resolve TDIS path
  - locate symptom source of truth

STEP_1:
  - run Western identity reconciliation queue

STEP_2:
  - ingest ONE Western batch
  - CURRENT root keys only
  - no invented exact ICD specificity

STEP_3:
  - reconcile sym.fever / sym.edema
  - promote first P0 symptom wave through symptom workflow

STEP_4:
  - attach approved TCM sources
  - ingest ONE TDIS batch after library authority resolves

STEP_5:
  - ingest ONE crosswalk batch whose endpoints all resolve

STEP_6:
  - prototype ONE shared safety object

STEP_7:
  - run validators / build-data / content-junk / diff checks
  - inspect for unintended content loss
```

# 8. Residual research queue

Do **not** interpret Clean V2 as total medical completeness.

See `71_BOARD_COVERAGE_RESIDUAL_GAPS.md`.

Highest-value future areas include:

```text
arrhythmia subtypes
CAD/PAD/atherosclerosis
pituitary/parathyroid
metabolic syndrome
coagulation disorders
remaining GI Appendix A concepts
dementia/TBI/headache subtypes
more ophthalmology/dermatology
bipolar/schizophrenia/autism/panic
more pregnancy/perinatal
foodborne/parasitic/STI expansion
more genetics
more cancers and treatment toxicities
```

# 9. Do-not-repeat list for next AI

Do not redo:

```text
basic repository orientation
Condition CURRENT field audit
TDIS registry-exists proof
Pattern baseline audit
Western 05–18 research
TCM 20–29 research
crosswalk 40–49
endpoint queue 60
shared safety candidates 61
Western identity queue 62
source authority ledger 63
schema audit 70
Board residual queue 71
readiness matrix 72
dedup QA 73
```

Continue from the residual queue only after checking current repo state.

# 10. Handoff truth level

```yaml
research_pack:
  status: COMPLETE_CLEAN_V2

canonical_repo:
  status: NOT_MUTATED

western_identity:
  status: REQUIRES_CURRENT_EXACT_SCAN

tdis_identity:
  status: REGISTERED_IN_SUPPLIED_AUDIT
  blocker: CANONICAL_LIBRARY_PATH_UNRESOLVED

tcm_mechanism:
  status: STAGING_UNTIL_APPROVED_SOURCE_RECHECK

crosswalk:
  status: STAGED
  blocker: ENDPOINT_AND_RELATION_VOCAB_RESOLUTION

schema:
  status: NO_CHANGES_AUTHORIZED
```
