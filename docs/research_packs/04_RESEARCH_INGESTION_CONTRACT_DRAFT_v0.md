# RESEARCH INGESTION CONTRACT DRAFT v0

Status: **DRAFT / PROCESS CONTRACT / NOT CANONICAL**

## Goal

Prevent research packs from becoming accidental production truth while keeping throughput high.

## Lifecycle

```text
Research source
↓
Staging candidate
↓
Canonical ID / duplicate review
↓
Schema + taxonomy validation
↓
Safety/provenance review where applicable
↓
Ingestion
↓
Ratchet / validators
↓
Canonical registry
↓
Later enrichment
```

## Required staging fields

Where practical:
- candidate_id
- name_en
- name_zh
- aliases
- category_candidate
- provenance/source target
- source_status
- confidence/uncertainty note
- intended target namespace
- ingestion_status

Recommended `ingestion_status`:
- `research_only`
- `candidate`
- `ready_for_dedupe`
- `ready_for_validator`
- `accepted`
- `rejected`
- `deprecated`

## Maturity model

Suggested knowledge maturity:
- skeleton
- core
- board_ready
- clinical_ready
- deep_detail

A large skeleton inventory is acceptable before every card is fully detailed.

## Deduplication order

1. exact canonical ID
2. normalized English name
3. normalized Chinese name
4. alias match
5. semantic/manual review only if still ambiguous

Do not create a second canonical object merely because spelling differs.

## Validator order

Recommended:
1. JSON/schema parse
2. namespace/ID pattern
3. duplicate ID
4. required bilingual naming
5. category validity
6. relation target existence
7. safety/provenance requirements
8. PHI/secrets scan
9. ratchet/regression

## Routing

### Fable / Claude
Use for:
- ownership/schema decisions
- migration
- canonical contract changes
- cross-module integration
- high-risk safety semantics

### Sonnet
Use for:
- bounded UI/CRUD
- selector rendering
- form wiring after ownership contract is locked
- routine tests

### Codex
Use for:
- independent audit
- adversarial regression
- branch/landing checks
- validator review
- confirming implementation claims

### Antigravity
Use for:
- bulk mechanical enrichment
- card fill
- alias/category normalization
- repetitive MD/JSON transforms

Not for:
- unresolved schema
- PHI
- irreversible migration
- clinical causality decisions

## Progress-first rule

Deep review is mandatory for:
- PHI
- data loss
- append-only history
- Patient/Case/Visit ownership
- migration
- export/import
- canonical namespace collision
- production deployment

Do not block routine progress for:
- cosmetic labels
- selector order
- minor taxonomy wording
- low-risk documentation phrasing
- incomplete deep-detail fields on otherwise valid skeleton records

## Stop conditions

Stop ingestion when:
- candidate conflicts with canonical ID;
- schema ownership is unresolved;
- history would be overwritten or fabricated;
- safety claim has no provenance;
- patient-identifiable data appears;
- validator/regression shows destructive behavior.

Otherwise:
- mark uncertainty,
- keep staging,
- continue.
