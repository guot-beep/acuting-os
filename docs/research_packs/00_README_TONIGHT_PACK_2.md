# ACUTING OS — TONIGHT PACK 2

Status: **RESEARCH STAGING / IMPLEMENTATION REFERENCE / NOT CANONICAL**

Purpose:
Unblock Clinical V2 Phase C2 Patient wiring, Phase D UI/selectors, and regression testing tonight.

## Consumption order

1. **Fable / Claude**
   - `01_CLINICAL_V2_PATIENT_WIRING_PACK_v0.md`
   - `02_CLINICAL_V2_TEST_SCENARIO_PACK_v0.md`
   - `04_RESEARCH_INGESTION_CONTRACT_DRAFT_v0.md`

2. **Sonnet**
   - `03_CLINICAL_V2_SELECTOR_VOCAB_PACK_v0.md`
   - corresponding JSON in `data/research_staging/`
   - use for selector/mock scaffolding only until canonical registry review

3. **Codex**
   - use test scenarios as adversarial regression fixtures
   - verify staging candidates against actual registries before ingestion

4. **Antigravity**
   - only after template/taxonomy/validator contract is locked

## Architecture guardrails

- Patient → Case → Visit is the clinical backbone.
- Western Condition, TCM Disease, and TCM Pattern are not equivalents.
- `sym.*` = symptom/finding identity.
- `metric.*` = measurable value/trajectory.
- `drug.*` = canonical medication namespace.
- `supp.*` = supplement namespace.
- `life.*` = lifestyle factor.
- `exposure.*` = environmental/occupational exposure.
- `adverse_event.*` = observational safety/tolerance event.
- `modality.*` = treatment modality.
- Exposure history uses current snapshot + append-only events.
- No PHI.
- Do not fabricate legacy history.
- Do not hard-code unresolved Patient vs Case ownership into UI.
- Low-risk naming/taxonomy questions should not block progress; mark candidate and move on.

## Repo destination

Unzip at repository root, preserving:
- `docs/research_packs/`
- `data/research_staging/`

## Added card-data line requests (Fable CR-001/002/003)

- `SYM_SEED_RESEARCH_BATCH_B_v1.md`
- `METRIC_DEFINITIONS_v1.md`
- `SUPP_SKELETON_BATCH_01_v1.md`
- machine-readable JSON twins under `data/research_staging/`

Priority:
1. CR-001 `sym.*`
2. CR-002 new semantic-unique `metric.*`
3. CR-003 `supp.*`

Conflict rule: repo canonical schema / DECISIONS / validators override staging.
