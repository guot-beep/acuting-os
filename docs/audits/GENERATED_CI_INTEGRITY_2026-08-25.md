# Generated Data, Build, Validator & CI Integrity Audit (Task 9C Round 3)

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
| **Canonical-to-Generated Sync (ID Set)** | **7 / 7 PASS** | 7 sync OK, 1 `SYNC_NOT_DIRECTLY_COMPARABLE` |
| **Deterministic Rebuild Identical** | **14 / 15** | 14/15 artifacts 100% byte-for-byte identical on fresh sandbox rebuild |
| **Deterministic Rebuild Differs** | **1 / 15** | 1 artifact (`data/generated/entity_registry.json`) differs (stale since 2026-07-22) |
| **Direct Runtime Loaded by Site** | 12 | Loaded directly via `<script>` in `index.html` / `previsit.html` |
| **Transitively Bundled & Loaded** | 1 | `data/quality/content_quality.json` bundled into `knowledge_core.js` via generalized dependency graph |
| **Generated but Unused** | 2 | 2 artifacts (`knowledge_data.js` monolithic rollback twin & `entity_registry.json`) |
| **Site Expects Missing File** | 0 | 0 missing references in site entrypoints |

### B. Validator & CI Integrity
| Metric | Count | Details |
|---|---|---|
| **Total Scripts Analyzed in scripts/** | 94 | 66 blocking validators, 2 non-blocking validators, 9 tests, 4 audits, 10 reports, 3 rehearsals/dashboards |
| **CI-Invoked Validators & Tests** | **63** | Direct workflow steps + `check-validation-ratchet.js` + recursive closure |
| **Orphan Blocking Validators (Not in CI)** | **12** | Only true `BLOCKING_VALIDATOR` scripts missing from CI |
| **Manual-Only Scripts** | 19 | Non-blocking validators, audits, reports, and manual inspection scripts |
| **Fail-Closed CI Steps** | 75 | Exits non-zero (`exit(1)`, ternary exit, exitCode assignment, or throw) on defect |
| **Informational CI Steps (NOTE Tier / Dashboard)** | 7 | Explicit NOTE tier dashboards / coverage reports in CI |
| **True Possible False-Green Blocking Steps** | **0** | 0 expected blocking CI steps lack non-zero fail paths |
| **Highest-Risk Findings** | 14 | Prioritized inventory of infrastructure risks (0 automated mutation) |

---

## 2. Highest-Risk Findings (Action Required Queue — Inventory Only)

| Risk Type | Severity | Target File / Artifact | Detail |
|---|---|---|---|
| `REBUILD_DIFFERS` | **HIGH** | `data/generated/entity_registry.json` | Committed artifact differs from fresh deterministic rebuild (Byte size differs: committed 1496023 vs rebuilt 2693002; entity_count changed from 4621 to 7323). |
| `GENERATED_BUT_UNUSED` | **MEDIUM** | `data/generated/entity_registry.json` | Generated file is committed in data/generated/ but not loaded by runtime HTML or bundled into loaded shards. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/check-today-survives.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is missing from CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-cloudtcm-vocabularies.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is missing from CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-condition-sources.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is missing from CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-content-quality.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is missing from CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-formula-quality-strict.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is missing from CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-herb-canon.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is missing from CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-herb-quality-strict.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is missing from CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-herbal-links.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is missing from CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-no-boilerplate.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is missing from CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-pattern-registry.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is missing from CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-point-categories.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is missing from CI workflows. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/validate-supp-standard.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is missing from CI workflows. |

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

## 5. Site / Build Consumption Graph Audit

| Artifact | Artifact Type | Consumption Status | Loaded By / Bundle Path | Details |
|---|---|---|---|---|
| `data/generated/app_data.js` | `BUNDLE_OUTPUT` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly in HTML runtime (<script src="data/generated/app_data.js">) |
| `data/generated/cloudtcm_map.js` | `BUNDLE_OUTPUT` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly in HTML runtime (<script src="data/generated/cloudtcm_map.js">) |
| `data/generated/points_361.js` | `BUNDLE_OUTPUT` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly in HTML runtime (<script src="data/generated/points_361.js">) |
| `data/generated/knowledge_core.js` | `BUNDLE_SHARD` | `DIRECT_RUNTIME_LOADED` | `index.html`, `previsit.html` | Loaded directly in HTML runtime (<script src="data/generated/knowledge_core.js">) |
| `data/generated/knowledge_ref.js` | `BUNDLE_SHARD` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly in HTML runtime (<script src="data/generated/knowledge_ref.js">) |
| `data/generated/knowledge_rx.js` | `BUNDLE_SHARD` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly in HTML runtime (<script src="data/generated/knowledge_rx.js">) |
| `data/generated/knowledge_mm.js` | `BUNDLE_SHARD` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly in HTML runtime (<script src="data/generated/knowledge_mm.js">) |
| `data/generated/knowledge_dx.js` | `BUNDLE_SHARD` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly in HTML runtime (<script src="data/generated/knowledge_dx.js">) |
| `data/generated/knowledge_pat.js` | `BUNDLE_SHARD` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly in HTML runtime (<script src="data/generated/knowledge_pat.js">) |
| `data/tung/point_index.js` | `JS_TWIN` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly in HTML runtime (<script src="data/tung/point_index.js">) |
| `data/auricular/gb93_index.js` | `JS_TWIN` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly in HTML runtime (<script src="data/auricular/gb93_index.js">) |
| `data/auricular/gb93_worklist.js` | `JS_TWIN` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly in HTML runtime (<script src="data/auricular/gb93_worklist.js">) |
| `data/quality/content_quality.json` | `QUALITY_OVERLAY` | `TRANSITIVELY_BUNDLED_AND_LOADED` | _None_ | Read by scripts/build-data.js and bundled into data/generated/knowledge_core.js, which is loaded at runtime |
| `data/generated/knowledge_data.js` | `MONOLITHIC_ROLLBACK_TWIN` | `GENERATED_BUT_UNUSED` | _None_ | Generated build artifact; not directly loaded by runtime nor bundled into loaded output |
| `data/generated/entity_registry.json` | `REGISTRY_EXPORT` | `GENERATED_BUT_UNUSED` | _None_ | Generated build artifact; not directly loaded by runtime nor bundled into loaded output |

---

## 6. Orphan Validators (Blocking Validators Missing from CI)

| Validator Script | Domain | Has Non-Zero Exit? | Description / Risk |
|---|---|---|---|
| `scripts/check-today-survives.js` | general | YES | Blocking validator not running in CI workflows |
| `scripts/validate-cloudtcm-vocabularies.js` | cloudtcm | YES | Blocking validator not running in CI workflows |
| `scripts/validate-condition-sources.js` | conditions/pathology | YES | Blocking validator not running in CI workflows |
| `scripts/validate-content-quality.js` | general | YES | Blocking validator not running in CI workflows |
| `scripts/validate-formula-quality-strict.js` | formulas | YES | Blocking validator not running in CI workflows |
| `scripts/validate-herb-canon.js` | herbs | YES | Blocking validator not running in CI workflows |
| `scripts/validate-herb-quality-strict.js` | herbs | YES | Blocking validator not running in CI workflows |
| `scripts/validate-herbal-links.js` | herbs | YES | Blocking validator not running in CI workflows |
| `scripts/validate-no-boilerplate.js` | general | YES | Blocking validator not running in CI workflows |
| `scripts/validate-pattern-registry.js` | patterns/tdis | YES | Blocking validator not running in CI workflows |
| `scripts/validate-point-categories.js` | acupoints | YES | Blocking validator not running in CI workflows |
| `scripts/validate-supp-standard.js` | supplements | YES | Blocking validator not running in CI workflows |

---

## 7. CI False-Green Audit (Control Flow & Exit Code Analysis)

| Validator Script | CI Invocation Mode | CI Step Tier | Classification | False-Green Risk Notes |
|---|---|---|---|---|
| `scripts/check-branch-mergeable.js` | `CHILD_AGGREGATOR_CLOSURE` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/check-canon-no-loss.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/check-formula-no-loss.js` | `CHILD_AGGREGATOR_CLOSURE` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/check-validation-ratchet.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/rehearse-runtime-restore.js` | `DIRECT_WORKFLOW_STEP` | `INFORMATIONAL_CI_STEP` | `INFORMATIONAL_STEP` | Fail-closed verified |
| `scripts/report-pharm-coverage.js` | `DIRECT_WORKFLOW_STEP` | `INFORMATIONAL_CI_STEP` | `INFORMATIONAL_STEP` | No non-zero exit pattern (process.exit, process.exitCode, or throw) found |
| `scripts/test-avs-checkout.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/test-branch-mergeable.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/test-m1-fallback-failclosed.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/test-pharm-negative-cases.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/test-pharm-source-integrity-negative-cases.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/test-pointer-runtime.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-acupoint-source-conflicts.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-acupoint-standard.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-avs-library.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-b123-legacy-migration.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-bilingual-render-parity.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-boot-order.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-care-draft-phi.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-care-draft-render.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-clinical-case-standard.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-clinical-invariants.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-clinical-store-phi-boundary.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-comparison-standard.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-condition-standard.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-content-junk.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-crosswalk-mappings.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-data.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-encoding.js` | `RATCHET_AGGREGATOR` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-exposure-safety-render.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-extra-point-standard.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-field-shape-consistency.js` | `DIRECT_WORKFLOW_STEP` | `INFORMATIONAL_CI_STEP` | `INFORMATIONAL_STEP` | Fail-closed verified |
| `scripts/validate-formula-composition-signatures.js` | `DIRECT_WORKFLOW_STEP` | `INFORMATIONAL_CI_STEP` | `INFORMATIONAL_STEP` | Fail-closed verified |
| `scripts/validate-formula-correctness.js` | `RATCHET_AGGREGATOR` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-formula-dose-staging.js` | `RATCHET_AGGREGATOR` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-formula-hdi-review.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-formula-safety-predicates.js` | `DIRECT_WORKFLOW_STEP` | `INFORMATIONAL_CI_STEP` | `INFORMATIONAL_STEP` | Fail-closed verified |
| `scripts/validate-formula-standard.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-gyn-legacy-migration.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-herb-dosage-shape.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-herb-integrity-predicates.js` | `DIRECT_WORKFLOW_STEP` | `INFORMATIONAL_CI_STEP` | `INFORMATIONAL_STEP` | Fail-closed verified |
| `scripts/validate-herb-standard.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-interactions.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-knowledge-parts.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-metric-interpretation.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-naming.js` | `RATCHET_AGGREGATOR` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-no-template-protocol.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-outcome-panel-render.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-pattern-standard.js` | `RATCHET_AGGREGATOR` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-pharm-standard.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-point-ids.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-previsit-payload.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-protocol-evidence-render.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-red-flag-registry.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-red-flag-runtime.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-red-flag-wiring.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-relation-registry.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-relations.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-render-blocking.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-review-status-vocab.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-symptom-standard.js` | `DIRECT_WORKFLOW_STEP` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/validate-tdis-standard.js` | `RATCHET_AGGREGATOR` | `BLOCKING_CI_STEP` | `FAIL_CLOSED` | Fail-closed verified |
| `scripts/walkthrough-phase-e.js` | `DIRECT_WORKFLOW_STEP` | `INFORMATIONAL_CI_STEP` | `INFORMATIONAL_STEP` | Fail-closed verified |

---

## 8. Invariant & Safety Proof

- **Canonical Data**: Byte-for-byte unchanged vs starting main (`0 bytes diff`).
- **Generated Artifacts (`data/generated/*`)**: Byte-for-byte unchanged vs starting main (`0 bytes diff`).
- **CI Workflows (`.github/workflows/*`)**: Byte-for-byte unchanged vs starting main (`0 bytes diff`).
- **Output Hygiene**: 0 illegal control characters, 0 replacement characters.
- **Negative Controls & Regression Suite**: 11/11 startup tests passed.
