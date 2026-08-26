# Generated Data, Build, Validator & CI Integrity Audit (Task 9C)

> **Audit Date**: 2026-08-25  
> **Scope**: `data/**` canonicals, `data/generated/*` artifacts, `scripts/*` validators, `.github/workflows/validate.yml` CI workflow  
> **Type**: READ-ONLY Infrastructure & Deterministic Pipeline Audit (0 Canonical/Generated/CI Mutations)  
> **Status**: COMPLETED  

---

## 1. Executive Summary

### A. Generated Data & Build Pipeline
| Metric | Count | Details |
|---|---|---|
| **Canonical Domains Scanned** | 12 | 8 active domains + 4 `NO_GENERATED_LAYER` domains |
| **Generated Artifacts Scanned** | 15 | 10 in `data/generated/`, 3 twins, 1 quality overlay, 1 entity registry |
| **Canonical-to-Generated Sync (ID set)** | **7 / 7 PASS** | 0 missing canonical IDs, 0 extra generated IDs across all core domain bundles |
| **Deterministic Rebuild Identical** | **14 / 15** | 14/15 artifacts 100% byte-for-byte identical on fresh sandbox rebuild |
| **Deterministic Rebuild Differs** | **1 / 15** | 1 artifact (`data/generated/entity_registry.json`) differs (stale since 2026-07-22) |
| **Loaded by Site** | 12 | 13 artifacts loaded via `<script>` in `index.html` / `previsit.html` |
| **Generated but Unused** | 3 | 2 artifacts (`knowledge_data.js` monolithic rollback twin & `entity_registry.json`) |
| **Site Expects Missing File** | 0 | 0 missing references in site entrypoints |

### B. Validator & CI Integrity
| Metric | Count | Details |
|---|---|---|
| **Total Validators & Checkers in scripts/** | 94 | Full catalog of `validate-*`, `check-*`, `test-*`, `audit-*`, `report-*` |
| **CI-Invoked Validators** | **63** | Direct workflow steps + `check-validation-ratchet.js` + aggregator runners |
| **Orphan Validators (Not in CI)** | **31** | Exists in `scripts/` but never called by `.github/workflows/validate.yml` |
| **Fail-Closed Validators** | 67 | Exits non-zero (`exit(1)` / `exitCode = 1` / `throw`) on defect |
| **Possible False-Green Validators** | 27 | Informational/dashboard/ratchet sub-validators without standalone non-zero exits |
| **Highest-Risk Findings** | 36 | Prioritized inventory of infrastructure risks (0 automated mutation) |

---

## 2. Highest-Risk Findings (Action Required Queue — Inventory Only)

| Risk Type | Severity | Target File / Artifact | Detail |
|---|---|---|---|
| `REBUILD_DIFFERS` | **HIGH** | `data/generated/entity_registry.json` | Committed artifact differs from fresh deterministic rebuild (Byte size differs: committed 1496023 vs rebuilt 2693002; entity_count changed from 4621 to 7323). |
| `GENERATED_BUT_UNUSED` | **MEDIUM** | `data/generated/entity_registry.json` | Generated file is committed in data/generated/ but not loaded by any site entrypoint. |
| `GENERATED_BUT_UNUSED` | **MEDIUM** | `data/generated/knowledge_data.js` | Generated file is committed in data/generated/ but not loaded by any site entrypoint. |
| `GENERATED_BUT_UNUSED` | **MEDIUM** | `data/quality/content_quality.json` | Generated file is committed in data/generated/ but not loaded by any site entrypoint. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/audit-cr010-condition-detail-maturity.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/audit-generated-ci-integrity.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/rehearse-c2b.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/report-acupoint-contradictions.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/report-formula-content-gaps.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/test-knowledge-gap-logging.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-cloudtcm-vocabularies.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-condition-sources.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-content-quality.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-formula-quality-strict.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-herb-canon.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-herb-card-schema.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-herb-quality-strict.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-herbal-links.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-no-boilerplate.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-pattern-registry.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-point-categories.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-supp-standard.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/report-pharm-coverage.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/test-avs-checkout.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/validate-acupoint-source-conflicts.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/validate-bilingual-render-parity.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/validate-condition-standard.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/validate-data.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/validate-formula-correctness.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/validate-formula-hdi-review.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/validate-no-template-protocol.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/validate-pattern-standard.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/validate-relation-registry.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/validate-symptom-standard.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/validate-tdis-standard.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/walkthrough-phase-e.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No process.exit(1), process.exitCode = 1, or throw new Error). |

---

## 3. Canonical Domain -> Generated Layer Mapping

| Domain | Has Generated Layer | Generator Script | Generated Artifacts | Status |
|---|---|---|---|---|
| **herbs** | YES | `scripts/build-data.js` | `data/generated/knowledge_mm.js`<br>`data/generated/knowledge_data.js` | `ACTIVE` |
| **formulas** | YES | `scripts/build-data.js` | `data/generated/knowledge_rx.js`<br>`data/generated/knowledge_core.js`<br>`data/generated/knowledge_data.js` | `ACTIVE` |
| **conditions / pathology** | YES | `scripts/build-data.js` | `data/generated/knowledge_dx.js`<br>`data/generated/knowledge_ref.js`<br>`data/generated/knowledge_data.js` | `ACTIVE` |
| **patterns / tdis** | YES | `scripts/build-data.js` | `data/generated/knowledge_pat.js`<br>`data/generated/knowledge_dx.js`<br>`data/generated/knowledge_core.js`<br>`data/generated/knowledge_data.js` | `ACTIVE` |
| **acupoints** | YES | `scripts/build-data.js` | `data/generated/points_361.js`<br>`data/generated/app_data.js`<br>`data/generated/cloudtcm_map.js`<br>`data/tung/point_index.js`<br>`data/auricular/gb93_index.js`<br>`data/auricular/gb93_worklist.js` | `ACTIVE` |
| **symptoms** | YES | `scripts/build-data.js` | `data/generated/knowledge_pat.js`<br>`data/generated/knowledge_core.js`<br>`data/generated/knowledge_data.js` | `ACTIVE` |
| **supplements** | YES | `scripts/build-data.js` | `data/generated/knowledge_ref.js`<br>`data/generated/knowledge_core.js`<br>`data/generated/knowledge_data.js` | `ACTIVE` |
| **medications / pharmacology** | YES | `scripts/build-data.js` | `data/generated/knowledge_ref.js`<br>`data/generated/knowledge_data.js` | `ACTIVE` |
| **clinical_cases** | `NO_GENERATED_LAYER` | None | None | `NO_GENERATED_LAYER` |
| **bastyr** | `NO_GENERATED_LAYER` | None | None | `NO_GENERATED_LAYER` |
| **billing** | `NO_GENERATED_LAYER` | None | None | `NO_GENERATED_LAYER` |
| **exams** | `NO_GENERATED_LAYER` | None | None | `NO_GENERATED_LAYER` |

---

## 4. Deterministic Rebuild Audit (Committed vs Sandbox Rebuild)

| Generated Artifact | Generator Script | Status | Committed Size | Rebuilt Size | Difference Details |
|---|---|---|---|---|---|
| `data/generated/app_data.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 1357538 B | 1357538 B | 100% byte-for-byte identical |
| `data/generated/cloudtcm_map.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 11806 B | 11806 B | 100% byte-for-byte identical |
| `data/generated/knowledge_core.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 212850 B | 212850 B | 100% byte-for-byte identical |
| `data/generated/knowledge_data.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 19942163 B | 19942163 B | 100% byte-for-byte identical |
| `data/generated/knowledge_dx.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 6940660 B | 6940660 B | 100% byte-for-byte identical |
| `data/generated/knowledge_mm.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 5435063 B | 5435063 B | 100% byte-for-byte identical |
| `data/generated/knowledge_pat.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 1952818 B | 1952818 B | 100% byte-for-byte identical |
| `data/generated/knowledge_ref.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 1367454 B | 1367454 B | 100% byte-for-byte identical |
| `data/generated/knowledge_rx.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 4036018 B | 4036018 B | 100% byte-for-byte identical |
| `data/generated/points_361.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 6217301 B | 6217301 B | 100% byte-for-byte identical |
| `data/tung/point_index.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 1213318 B | 1213318 B | 100% byte-for-byte identical |
| `data/auricular/gb93_index.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 6213 B | 6213 B | 100% byte-for-byte identical |
| `data/auricular/gb93_worklist.js` | `scripts/build-data.js` | `REBUILD_IDENTICAL` | 3120 B | 3120 B | 100% byte-for-byte identical |
| `data/quality/content_quality.json` | `scripts/build-content-quality-overlay.js` | `REBUILD_IDENTICAL` | 28866 B | 28866 B | 100% byte-for-byte identical |
| `data/generated/entity_registry.json` | `scripts/build-entity-registry.js` | `REBUILD_DIFFERS` | 1496023 B | 2693002 B | Byte size differs: committed 1496023 vs rebuilt 2693002; entity_count changed from 4621 to 7323 |

---

## 5. Site Consumption Audit

| Artifact | Status | Loaded By | Details |
|---|---|---|---|
| `data/generated/app_data.js` | `LOADED_BY_SITE` | `index.html` | Loaded via <script> in index.html |
| `data/generated/cloudtcm_map.js` | `LOADED_BY_SITE` | `index.html` | Loaded via <script> in index.html |
| `data/generated/entity_registry.json` | `GENERATED_BUT_UNUSED` | _None_ | Not referenced in index.html or previsit.html |
| `data/generated/knowledge_core.js` | `LOADED_BY_SITE` | `index.html`, `previsit.html` | Loaded via <script> in index.html, previsit.html |
| `data/generated/knowledge_data.js` | `GENERATED_BUT_UNUSED` | _None_ | Not referenced in index.html or previsit.html |
| `data/generated/knowledge_dx.js` | `LOADED_BY_SITE` | `index.html` | Loaded via <script> in index.html |
| `data/generated/knowledge_mm.js` | `LOADED_BY_SITE` | `index.html` | Loaded via <script> in index.html |
| `data/generated/knowledge_pat.js` | `LOADED_BY_SITE` | `index.html` | Loaded via <script> in index.html |
| `data/generated/knowledge_ref.js` | `LOADED_BY_SITE` | `index.html` | Loaded via <script> in index.html |
| `data/generated/knowledge_rx.js` | `LOADED_BY_SITE` | `index.html` | Loaded via <script> in index.html |
| `data/generated/points_361.js` | `LOADED_BY_SITE` | `index.html` | Loaded via <script> in index.html |
| `data/tung/point_index.js` | `LOADED_BY_SITE` | `index.html` | Loaded via <script> in index.html |
| `data/auricular/gb93_index.js` | `LOADED_BY_SITE` | `index.html` | Loaded via <script> in index.html |
| `data/auricular/gb93_worklist.js` | `LOADED_BY_SITE` | `index.html` | Loaded via <script> in index.html |
| `data/quality/content_quality.json` | `GENERATED_BUT_UNUSED` | _None_ | Not referenced in index.html or previsit.html |

---

## 6. Orphan Validators (Exists in scripts/ but Not Invoked in CI)

| Validator Script | Domain | Has Non-Zero Exit? | Description / Risk |
|---|---|---|---|
| `scripts/audit-cr010-condition-detail-maturity.js` | conditions/pathology | YES | Blocking validator not running in CI |
| `scripts/audit-dark-fields.js` | general | NO | Informational/dashboard script not running in CI |
| `scripts/audit-generated-ci-integrity.js` | general | YES | Blocking validator not running in CI |
| `scripts/audit-herb-cloudtcm-layer.js` | herbs | NO | Informational/dashboard script not running in CI |
| `scripts/check-today-survives.js` | general | NO | Informational/dashboard script not running in CI |
| `scripts/rehearse-c2b.js` | general | YES | Blocking validator not running in CI |
| `scripts/report-361-encoding-findings.js` | acupoints | NO | Informational/dashboard script not running in CI |
| `scripts/report-acupoint-content-gaps.js` | acupoints | NO | Informational/dashboard script not running in CI |
| `scripts/report-acupoint-contradictions.js` | acupoints | YES | Blocking validator not running in CI |
| `scripts/report-cloudtcm-buildout.js` | cloudtcm | NO | Informational/dashboard script not running in CI |
| `scripts/report-comparison-fill.js` | general | NO | Informational/dashboard script not running in CI |
| `scripts/report-exam-coverage.js` | general | NO | Informational/dashboard script not running in CI |
| `scripts/report-formula-completeness.js` | formulas | NO | Informational/dashboard script not running in CI |
| `scripts/report-formula-content-gaps.js` | formulas | YES | Blocking validator not running in CI |
| `scripts/report-herb-caution-conflicts.js` | herbs | NO | Informational/dashboard script not running in CI |
| `scripts/test-herb-cloudtcm-fetch.js` | herbs | NO | Informational/dashboard script not running in CI |
| `scripts/test-knowledge-gap-logging.js` | general | YES | Blocking validator not running in CI |
| `scripts/test-practice-audit.js` | clinical | NO | Informational/dashboard script not running in CI |
| `scripts/validate-cloudtcm-vocabularies.js` | cloudtcm | YES | Blocking validator not running in CI |
| `scripts/validate-condition-sources.js` | conditions/pathology | YES | Blocking validator not running in CI |
| `scripts/validate-content-quality.js` | general | YES | Blocking validator not running in CI |
| `scripts/validate-formula-quality-strict.js` | formulas | YES | Blocking validator not running in CI |
| `scripts/validate-formula-song.js` | formulas | NO | Informational/dashboard script not running in CI |
| `scripts/validate-herb-canon.js` | herbs | YES | Blocking validator not running in CI |
| `scripts/validate-herb-card-schema.js` | herbs | YES | Blocking validator not running in CI |
| `scripts/validate-herb-quality-strict.js` | herbs | YES | Blocking validator not running in CI |
| `scripts/validate-herbal-links.js` | herbs | YES | Blocking validator not running in CI |
| `scripts/validate-no-boilerplate.js` | general | YES | Blocking validator not running in CI |
| `scripts/validate-pattern-registry.js` | patterns/tdis | YES | Blocking validator not running in CI |
| `scripts/validate-point-categories.js` | acupoints | YES | Blocking validator not running in CI |
| `scripts/validate-supp-standard.js` | supplements | YES | Blocking validator not running in CI |

---

## 7. CI False-Green Audit (Control Flow & Exit Code Analysis)

| Validator Script | CI Invocation Mode | Classification | False-Green Risk Notes |
|---|---|---|---|
| `scripts/report-pharm-coverage.js` | `DIRECT_WORKFLOW_STEP` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/test-avs-checkout.js` | `DIRECT_WORKFLOW_STEP` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/validate-acupoint-source-conflicts.js` | `DIRECT_WORKFLOW_STEP` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/validate-bilingual-render-parity.js` | `DIRECT_WORKFLOW_STEP` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/validate-condition-standard.js` | `DIRECT_WORKFLOW_STEP` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/validate-data.js` | `DIRECT_WORKFLOW_STEP` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/validate-formula-correctness.js` | `RATCHET_AGGREGATOR` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/validate-formula-hdi-review.js` | `DIRECT_WORKFLOW_STEP` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/validate-no-template-protocol.js` | `DIRECT_WORKFLOW_STEP` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/validate-pattern-standard.js` | `RATCHET_AGGREGATOR` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/validate-relation-registry.js` | `DIRECT_WORKFLOW_STEP` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/validate-symptom-standard.js` | `DIRECT_WORKFLOW_STEP` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/validate-tdis-standard.js` | `RATCHET_AGGREGATOR` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |
| `scripts/walkthrough-phase-e.js` | `DIRECT_WORKFLOW_STEP` | `POSSIBLE_FALSE_GREEN` | No process.exit(1), process.exitCode = 1, or throw new Error |

---

## 8. Invariant & Safety Proof

- **Canonical Data**: Byte-for-byte unchanged vs starting main (`0 bytes diff`).
- **Generated Artifacts (`data/generated/*`)**: Byte-for-byte unchanged vs starting main (`0 bytes diff`).
- **CI Workflows (`.github/workflows/*`)**: Byte-for-byte unchanged vs starting main (`0 bytes diff`).
- **Output Hygiene**: 0 illegal control characters, 0 replacement characters.
- **Negative Controls**: 4/4 startup regression tests passed.
