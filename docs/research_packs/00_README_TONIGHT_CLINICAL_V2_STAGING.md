# ACUTING OS — TONIGHT CLINICAL V2 RESEARCH STAGING PACK

Status: **RESEARCH STAGING / NOT CANONICAL / NOT YET INGESTED**

Purpose: give Fable / Sonnet / Codex immediately usable low-risk material for Clinical V2 Phase C2 / Phase D.

## Guardrails
- Patient → Case → Visit remains the clinical backbone.
- Western Condition, TCM Disease, TCM Pattern are related but not equivalents.
- `sym.*` = symptom/finding; `metric.*` = measurement/value.
- `drug.*` = canonical medication namespace; legacy `med.*` is compatibility only.
- `supp.*`, `life.*`, `exposure.*`, `adverse_event.*` remain separate namespaces.
- Exposure history = snapshot + append-only event history.
- No PHI.
- Do not promote candidate IDs to canonical without existing registry/validator checks.

## Suggested order
1. Fable: read capture examples + sym/metric seeds for Patient wiring decisions.
2. Sonnet: use JSON only for selector/mock UI scaffolding; do not hard-code unresolved ownership.
3. Codex: validate any ingestion against canonical registries and validators.
4. Antigravity: bulk enrichment only after taxonomy/template lock.

## Repo destination
Copy this ZIP into repo root preserving:
- `docs/research_packs/`
- `data/research_staging/`
