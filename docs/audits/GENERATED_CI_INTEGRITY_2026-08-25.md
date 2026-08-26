# Generated Data, Build, Validator & CI Integrity Audit (Task 9C Round 2)

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
| **Direct Runtime Loaded by Site** | 12 | Loaded via `<script>` in `index.html` / `previsit.html` |
| **Transitively Bundled & Loaded** | 1 | `data/quality/content_quality.json` bundled into `knowledge_core.js` |
| **Generated but Unused** | 2 | 2 artifacts (`knowledge_data.js` monolithic rollback twin & `entity_registry.json`) |
| **Site Expects Missing File** | 0 | 0 missing references in site entrypoints |

### B. Validator & CI Integrity
| Metric | Count | Details |
|---|---|---|
| **Total Scripts Analyzed in scripts/** | 94 | 68 blocking validators, 9 tests, 4 audits, 10 reports, 3 rehearsals/dashboards |
| **CI-Invoked Validators** | **63** | Direct workflow steps + `check-validation-ratchet.js` + recursive closure |
| **Orphan Validators (Not in CI)** | **14** | Only true `BLOCKING_VALIDATOR` scripts missing from CI |
| **Manual-Only Scripts** | 17 | Audits, reports, and manual inspection scripts |
| **Fail-Closed Validators** | 82 | Exits non-zero (`exit(1)`, ternary exit, exitCode assignment, or throw) on defect |
| **Possible False-Green Scripts** | 12 | Informational/dashboard scripts with no non-zero exit path |
| **Highest-Risk Findings** | 16 | Prioritized inventory of infrastructure risks (0 automated mutation) |

---

## 2. Highest-Risk Findings (Action Required Queue — Inventory Only)

| Risk Type | Severity | Target File / Artifact | Detail |
|---|---|---|---|
| `REBUILD_DIFFERS` | **HIGH** | `data/generated/entity_registry.json` | Committed artifact differs from fresh deterministic rebuild (Byte size differs: committed 1496023 vs rebuilt 2693002; entity_count changed from 4621 to 7323). |
| `GENERATED_BUT_UNUSED` | **MEDIUM** | `data/generated/entity_registry.json` | Generated file is committed in data/generated/ but not loaded by runtime HTML or bundled into loaded shards. |
| `ORPHAN_VALIDATOR` | **MEDIUM** | `scripts/check-today-survives.js` | Blocking validator exists in scripts/ with non-zero exit capabilities but is never invoked in CI workflows. |
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
| `POSSIBLE_FALSE_GREEN` | **MEDIUM** | `scripts/report-pharm-coverage.js` | Validator is invoked in CI but does not assign a non-zero exit code on failures (No non-zero exit pattern (process.exit, process.exitCode, or throw) found). |

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
| `data/generated/app_data.js` | `BUNDLE_OUTPUT` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly via <script> in index.html |
| `data/generated/cloudtcm_map.js` | `BUNDLE_OUTPUT` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly via <script> in index.html |
| `data/generated/points_361.js` | `BUNDLE_OUTPUT` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly via <script> in index.html |
| `data/generated/knowledge_core.js` | `BUNDLE_SHARD` | `DIRECT_RUNTIME_LOADED` | `index.html`, `previsit.html` | Loaded directly via <script> in index.html, previsit.html |
| `data/generated/knowledge_ref.js` | `BUNDLE_SHARD` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly via <script> in index.html |
| `data/generated/knowledge_rx.js` | `BUNDLE_SHARD` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly via <script> in index.html |
| `data/generated/knowledge_mm.js` | `BUNDLE_SHARD` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly via <script> in index.html |
| `data/generated/knowledge_dx.js` | `BUNDLE_SHARD` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly via <script> in index.html |
| `data/generated/knowledge_pat.js` | `BUNDLE_SHARD` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly via <script> in index.html |
| `data/tung/point_index.js` | `JS_TWIN` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly via <script> in index.html |
| `data/auricular/gb93_index.js` | `JS_TWIN` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly via <script> in index.html |
| `data/auricular/gb93_worklist.js` | `JS_TWIN` | `DIRECT_RUNTIME_LOADED` | `index.html` | Loaded directly via <script> in index.html |
| `data/quality/content_quality.json` | `QUALITY_OVERLAY` | `TRANSITIVELY_BUNDLED_AND_LOADED` | _None_ | Read by build-data.js and bundled into knowledge_core.js, which is loaded at runtime in index.html & previsit.html |
| `data/generated/knowledge_data.js` | `MONOLITHIC_ROLLBACK_TWIN` | `GENERATED_BUT_UNUSED` | _None_ | Monolithic bundle retained for dual-write rollback verification; runtime loads 6 modular shards |
| `data/generated/entity_registry.json` | `REGISTRY_EXPORT` | `GENERATED_BUT_UNUSED` | _None_ | Generated registry export; not loaded by runtime HTML or scripts |

---

## 6. Orphan Validators (Blocking Validators Missing from CI)

| Validator Script | Domain | Has Non-Zero Exit? | Description / Risk |
|---|---|---|---|
| `scripts/check-today-survives.js` | general | YES | Blocking validator not running in CI workflows |
| `scripts/validate-cloudtcm-vocabularies.js` | cloudtcm | YES | Blocking validator not running in CI workflows |
| `scripts/validate-condition-sources.js` | conditions/pathology | YES | Blocking validator not running in CI workflows |
| `scripts/validate-content-quality.js` | general | YES | Blocking validator not running in CI workflows |
| `scripts/validate-formula-quality-strict.js` | formulas | YES | Blocking validator not running in CI workflows |
| `scripts/validate-formula-song.js` | formulas | NO | Blocking validator not running in CI workflows |
| `scripts/validate-herb-canon.js` | herbs | YES | Blocking validator not running in CI workflows |
| `scripts/validate-herb-card-schema.js` | herbs | YES | Blocking validator not running in CI workflows |
| `scripts/validate-herb-quality-strict.js` | herbs | YES | Blocking validator not running in CI workflows |
| `scripts/validate-herbal-links.js` | herbs | YES | Blocking validator not running in CI workflows |
| `scripts/validate-no-boilerplate.js` | general | YES | Blocking validator not running in CI workflows |
| `scripts/validate-pattern-registry.js` | patterns/tdis | YES | Blocking validator not running in CI workflows |
| `scripts/validate-point-categories.js` | acupoints | YES | Blocking validator not running in CI workflows |
| `scripts/validate-supp-standard.js` | supplements | YES | Blocking validator not running in CI workflows |

---

## 7. CI False-Green Audit (Control Flow & Exit Code Analysis)

| Validator Script | CI Invocation Mode | Classification | False-Green Risk Notes |
|---|---|---|---|
| `scripts/report-pharm-coverage.js` | `DIRECT_WORKFLOW_STEP` | `POSSIBLE_FALSE_GREEN` | No non-zero exit pattern (process.exit, process.exitCode, or throw) found |

---

## 8. Invariant & Safety Proof

- **Canonical Data**: Byte-for-byte unchanged vs starting main (`0 bytes diff`).
- **Generated Artifacts (`data/generated/*`)**: Byte-for-byte unchanged vs starting main (`0 bytes diff`).
- **CI Workflows (`.github/workflows/*`)**: Byte-for-byte unchanged vs starting main (`0 bytes diff`).
- **Output Hygiene**: 0 illegal control characters, 0 replacement characters.
- **Negative Controls & Regression Suite**: 8/8 startup tests passed.
