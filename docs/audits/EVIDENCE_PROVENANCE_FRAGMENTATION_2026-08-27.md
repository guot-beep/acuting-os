# Evidence & Provenance Fragmentation Inventory — Task 10D (Round 2)

- **Audit Date**: 2026-08-27
- **Base SHA (origin/main)**: `d082c56b8b9f8d8f7c6652d4a56f72501a0a38fb`
- **Audit Source SHA**: `d082c56b8b9f8d8f7c6652d4a56f72501a0a38fb`
- **Delivery Commit SHA**: `null` (The immutable delivery commit SHA is the Git branch HEAD recorded externally upon commit creation.)
- **Scope**: Canonical Evidence, Provenance, Authorship, Review State, and Source Verification Architecture
- **Core Invariant**: 「先把『誰在描述來源、誰在描述審核、誰在描述作者、誰真的被程式使用』拆清楚，再談統一。名字相似不是語意相同。」

---

## 1. 核心指標與概覽（Summary Metrics）

| 指標 | 數值 / 狀態 | 說明 |
|---|---|---|
| **Discovered Evidence Fields** | **43** | 嚴格正典來源、引用、作者、審核、核實與證據強度欄位 |
| **Candidate Related Fields (Excluded)** | **10** | 考試重要度、教材等級、圖片連結等相關但非正典來源之欄位（獨立記錄，不計入來源總數） |
| **Canonical Datasets Scanned** | **27** | 涵蓋草藥、方劑、病證、經穴、症狀、鑑別、藥理、保健品等各大正典庫 |
| **Fields with Runtime Consumers** | **23** | 在 `app.js` 或 `js/*.js` 具有實質執行期讀取/渲染之欄位 |
| **Fields with Validator-Only Consumers** | **7** | 僅由 CI / 本機驗證器檢查，未進入 UI 渲染之欄位 |
| **Dead / Dark Evidence Fields** | **7** | 正典資料中有非空數值，但整個代碼庫無任何 Consumer 之欄位 (`DATA_PRESENT_NO_CONSUMER_FOUND`) |
| **Overlap Pairs Analyzed** | **7** | 依據逐筆記錄數值比對判定之欄位重疊與相容狀態 |
| **Precedence Chains Found** | **23** | 程式碼中以 `||` 或 `??` 跨 2+ 實質來源欄位之優先序遮蔽鏈路 |

---

## 2. 欄位總表與語意分類（Field Inventory）

本表列出正典資料庫中發現之所有證據/來源/審查欄位，依保守語意分類（不憑名稱任意等同）：

| 欄位名稱 (Field Name) | 語意類別 (Semantic Category) | 記錄出現總數 (Present) | 非空值筆數 (Non-Empty) | 出現資料庫數量 (Datasets) | 觀察型別 (Observed Types) |
|---|---|---|---|---|---|
| `review_status` | `REVIEW_STATE` | 3559 | 3559 | 20 | `string` |
| `field_sources` | `SOURCE_CITATION` | 2007 | 1991 | 10 | `object` |
| `evidence` | `EVIDENCE_STRENGTH` | 1514 | 1471 | 5 | `array, string` |
| `sources` | `SOURCE_CITATION` | 1468 | 1326 | 11 | `array` |
| `source_type` | `PROVENANCE` | 1404 | 1404 | 9 | `string` |
| `authored_by` | `AUTHORSHIP` | 1150 | 1149 | 11 | `string` |
| `source_status` | `VERIFICATION_STATE` | 1056 | 1055 | 4 | `string` |
| `source` | `SOURCE_CITATION` | 887 | 438 | 4 | `null, object, string` |
| `cloudtcm_url` | `SOURCE_LOCATOR` | 875 | 874 | 3 | `array, string` |
| `american_dragon_url` | `SOURCE_LOCATOR` | 664 | 662 | 2 | `array, string` |
| `exact_source_url` | `SOURCE_LOCATOR` | 574 | 521 | 2 | `array, null, string` |
| `source_urls` | `SOURCE_LOCATOR` | 571 | 516 | 4 | `array` |
| `safety_source_url` | `SOURCE_LOCATOR` | 434 | 434 | 2 | `string` |
| `safety_source` | `SOURCE_CITATION` | 397 | 396 | 2 | `string` |
| `card_grade` | `EVIDENCE_STRENGTH` | 356 | 356 | 1 | `string` |
| `source_classic` | `SOURCE_CITATION` | 343 | 343 | 1 | `array, string` |
| `source_hint` | `PROVENANCE` | 329 | 329 | 2 | `string` |
| `original_shape` | `PROVENANCE` | 289 | 289 | 1 | `string` |
| `source_field` | `PROVENANCE` | 289 | 289 | 1 | `string` |
| `import_artifacts` | `IMPORT_HISTORY` | 263 | 263 | 2 | `array` |
| `origin` | `PROVENANCE` | 191 | 191 | 1 | `string` |
| `source_url` | `SOURCE_LOCATOR` | 190 | 190 | 1 | `string` |
| `source_citations` | `SOURCE_CITATION` | 165 | 164 | 1 | `array` |
| `last_reviewed` | `REVIEW_STATE` | 149 | 35 | 3 | `string` |
| `acupoint_protocol_evidence` | `EVIDENCE_STRENGTH` | 133 | 133 | 1 | `object` |
| `protocol_status` | `REVIEW_STATE` | 133 | 133 | 1 | `string` |
| `content_source` | `AUTHORSHIP` | 130 | 130 | 1 | `array, string` |
| `dailymed_setid` | `SOURCE_LOCATOR` | 59 | 59 | 1 | `string` |
| `dailymed_url` | `SOURCE_LOCATOR` | 59 | 59 | 1 | `string` |
| `dose_source` | `SOURCE_CITATION` | 36 | 34 | 1 | `null, object` |
| `verification_status` | `VERIFICATION_STATE` | 34 | 34 | 1 | `string` |
| `safety_review` | `REVIEW_STATE` | 1 | 1 | 1 | `object` |
| `classic_formula_source_zh` | `SOURCE_CITATION` | 1 | 1 | 1 | `string` |
| `classic_formula_source_en` | `SOURCE_CITATION` | 1 | 1 | 1 | `string` |
| `herb_pair_source_note_zh` | `SOURCE_CITATION` | 1 | 1 | 1 | `string` |
| `herb_pair_source_note_en` | `SOURCE_CITATION` | 1 | 1 | 1 | `string` |
| `reference` | `SOURCE_CITATION` | 1 | 1 | 1 | `string` |
| `reviewed_by` | `REVIEW_STATE` | 1 | 0 | 1 | `null` |
| `herb_drug_interaction_sources` | `SOURCE_CITATION` | 1 | 1 | 1 | `array` |
| `hierarchy_source_zh` | `SOURCE_CITATION` | 1 | 1 | 1 | `string` |
| `verified` | `VERIFICATION_STATE` | 1 | 1 | 1 | `string` |
| `source_hierarchy` | `SOURCE_CITATION` | 1 | 1 | 1 | `object` |
| `D_clinical_evidence` | `EVIDENCE_STRENGTH` | 1 | 1 | 1 | `string` |

### 候選相關欄位（Candidate Related Fields — Excluded from Provenance Totals）
| 欄位名稱 | 類別 | 出現總數 | 非空筆數 | 說明 |
|---|---|---|---|---|
| `exam_importance` | `CANDIDATE_RELATED_FIELD` | 986 | 964 | 考試大綱/等級/處方狀態/媒體連結 |
| `course_level_en` | `CANDIDATE_RELATED_FIELD` | 376 | 376 | 考試大綱/等級/處方狀態/媒體連結 |
| `diagram_urls_en` | `CANDIDATE_RELATED_FIELD` | 361 | 361 | 考試大綱/等級/處方狀態/媒體連結 |
| `diagram_urls_zh` | `CANDIDATE_RELATED_FIELD` | 361 | 361 | 考試大綱/等級/處方狀態/媒體連結 |
| `examImportance` | `CANDIDATE_RELATED_FIELD` | 272 | 272 | 考試大綱/等級/處方狀態/媒體連結 |
| `atlas_url` | `CANDIDATE_RELATED_FIELD` | 261 | 260 | 考試大綱/等級/處方狀態/媒體連結 |
| `updated_at` | `CANDIDATE_RELATED_FIELD` | 201 | 200 | 考試大綱/等級/處方狀態/媒體連結 |
| `acupoint_protocols` | `CANDIDATE_RELATED_FIELD` | 159 | 84 | 考試大綱/等級/處方狀態/媒體連結 |
| `rx_otc_status` | `CANDIDATE_RELATED_FIELD` | 34 | 34 | 考試大綱/等級/處方狀態/媒體連結 |
| `schema_version` | `CANDIDATE_RELATED_FIELD` | 17 | 17 | 考試大綱/等級/處方狀態/媒體連結 |

---

## 3. 代碼消費與讀寫地圖（Writer / Reader / Consumer Map）

| 欄位名稱 | 語意類別 | 消費模式 | 寫入者 (Writers) | Runtime / UI 讀取者 | 驗證器 (Validators / CI) |
|---|---|---|---|---|---|
| `review_status` | `REVIEW_STATE` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `scripts/add-missing-board-formulas.js`, `scripts/apply-curriculum-composition.js` | `app.js`, `js/knowledge.js` | `scripts/check-canon-no-loss.js`, `scripts/test-practice-audit.js`, `scripts/validate-acupoint-standard.js` |
| `field_sources` | `SOURCE_CITATION` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `scripts/add-missing-board-formulas.js`, `scripts/apply-acupoint-pattern-links.js` | `app.js`, `js/knowledge.js` | `scripts/test-pharm-negative-cases.js`, `scripts/validate-acupoint-standard.js`, `scripts/validate-condition-standard.js` |
| `source` | `SOURCE_CITATION` | `COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `data/clinical_cases/schema.sql` | `app.js`, `index.html` | `scripts/test-avs-checkout.js`, `scripts/test-pharm-source-integrity-negative-cases.js`, `scripts/test-practice-audit.js` |
| `sources` | `SOURCE_CITATION` | `COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `js/knowledge.js` | `app.js`, `index.html` | `scripts/test-pharm-negative-cases.js`, `scripts/validate-condition-sources.js`, `scripts/validate-condition-standard.js` |
| `evidence` | `EVIDENCE_STRENGTH` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `legacy/app.js` | `app.js`, `index.html` | `scripts/test-pharm-source-integrity-negative-cases.js`, `scripts/validate-acupoint-standard.js`, `scripts/validate-b123-legacy-migration.js` |
| `reference` | `SOURCE_CITATION` | `COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `scripts/lib/preflight-generated-ci.js`, `scripts/report-361-encoding-findings.js` | `app.js`, `index.html` | `scripts/validate-content-junk.js`, `scripts/validate-relations.js`, `scripts/validate-retired-id-references.js` |
| `origin` | `PROVENANCE` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, WRITES` | `scripts/build-compare-with.js`, `scripts/migrate-b123-red-flags.js` | `app.js` | `scripts/check-branch-mergeable.js`, `scripts/test-branch-mergeable.js`, `scripts/validate-b123-legacy-migration.js` |
| `source_urls` | `SOURCE_LOCATOR` | `DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `scripts/add-missing-board-formulas.js` | `app.js`, `js/knowledge.js` | `scripts/validate-condition-standard.js`, `scripts/validate-formula-quality-strict.js`, `scripts/validate-herb-card-schema.js` |
| `source_type` | `PROVENANCE` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, WRITES` | `scripts/add-missing-board-formulas.js`, `scripts/audit-herb-cloudtcm-layer.js` | 無 | `scripts/validate-condition-standard.js`, `scripts/validate-formula-quality-strict.js`, `scripts/validate-herb-quality-strict.js` |
| `source_url` | `SOURCE_LOCATOR` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, TRANSFORMS, WRITES` | `scripts/apply-b123-task-c-ledger.js`, `scripts/build-cloudtcm-ref-map.js` | `js/knowledge.js` | `scripts/validate-cloudtcm-vocabularies.js`, `scripts/validate-formula-quality-strict.js`, `scripts/validate-gyn-legacy-migration.js` |
| `verified` | `VERIFICATION_STATE` | `COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `scripts/fetch-cloudtcm-herb-map.js`, `scripts/fetch-mastertung-point-map.js` | `app.js`, `index.html` | `scripts/check-today-survives.js`, `scripts/validate-comparison-standard.js`, `scripts/validate-content-quality.js` |
| `authored_by` | `AUTHORSHIP` | `CHECKS_ENUM, READS_VALUE, TRANSFORMS, WRITES` | `scripts/build_pattern_v2_b.js`, `scripts/migrate-b123-red-flags.js` | `js/knowledge.js` | `scripts/validate-comparison-standard.js`, `scripts/validate-condition-standard.js`, `scripts/validate-pattern-standard.js` |
| `source_status` | `VERIFICATION_STATE` | `CHECKS_ENUM, DISPLAYS, READS_VALUE, WRITES` | `scripts/audit-legacy-namespace-retired-id.js`, `scripts/fetch-exact-cloudtcm-herbs.js` | `app.js` | `scripts/validate-condition-standard.js`, `scripts/validate-formula-dose-staging.js`, `scripts/validate-herb-canon.js` |
| `exact_source_url` | `SOURCE_LOCATOR` | `CHECKS_ENUM, READS_VALUE, TRANSFORMS, WRITES` | `scripts/fetch-cloudtcm-conditions-expanded.js`, `scripts/fetch-cloudtcm-conditions.js` | `js/knowledge.js` | `scripts/validate-condition-standard.js`, `scripts/validate-formula-quality-strict.js`, `scripts/validate-herb-quality-strict.js` |
| `cloudtcm_url` | `SOURCE_LOCATOR` | `CHECKS_ENUM, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `scripts/fetch-cloudtcm-acupoint-enrichment.js`, `scripts/fix-formula-cloudtcm-urls.js` | `app.js`, `js/knowledge.js` | 無 |
| `source_classic` | `SOURCE_CITATION` | `READS_VALUE, TRANSFORMS, WRITES` | `scripts/add-missing-board-formulas.js`, `scripts/apply-source-classic.js` | `js/knowledge.js` | `scripts/validate-formula-standard.js` |
| `card_grade` | `EVIDENCE_STRENGTH` | `CHECKS_ENUM, DISPLAYS, READS_VALUE, WRITES` | `app.js`, `scripts/audit-herb-cloudtcm-layer.js` | `app.js` | `scripts/validate-herb-integrity-predicates.js`, `scripts/validate-herb-standard.js` |
| `import_artifacts` | `IMPORT_HISTORY` | `READS_VALUE, TRANSFORMS` | 無 | `js/knowledge.js` | `scripts/validate-condition-standard.js`, `scripts/validate-field-shape-consistency.js`, `scripts/validate-no-template-protocol.js` |
| `source_hint` | `PROVENANCE` | `READS_VALUE, WRITES` | `scripts/fetch-exact-cloudtcm-herbs.js`, `scripts/merge-formulas-preview.js` | 無 | `scripts/validate-herb-canon.js` |
| `safety_source_url` | `SOURCE_LOCATOR` | `READS_VALUE, WRITES` | `scripts/fetch-cloudtcm-formula-safety.js`, `scripts/fetch-cloudtcm-herb-safety.js` | 無 | `scripts/validate-herb-standard.js` |
| `american_dragon_url` | `SOURCE_LOCATOR` | `READS_VALUE, TRANSFORMS, WRITES` | `scripts/link-herb-sources.js` | `js/knowledge.js` | 無 |
| `source_citations` | `SOURCE_CITATION` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | `js/knowledge.js` | `scripts/validate-herb-standard.js` |
| `last_reviewed` | `REVIEW_STATE` | `READS_VALUE, WRITES` | `scripts/merge-formulas-preview.js` | 無 | `scripts/validate-clinical-case-standard.js` |
| `reviewed_by` | `REVIEW_STATE` | `CHECKS_ENUM, READS_VALUE, TRANSFORMS, WRITES` | `js/review.js`, `scripts/apply-review-verdicts.js` | `js/review.js` | `scripts/test-pharm-negative-cases.js`, `scripts/validate-pharm-standard.js` |
| `acupoint_protocol_evidence` | `EVIDENCE_STRENGTH` | `READS_VALUE, TRANSFORMS, WRITES` | `scripts/ingest-protocol-delivery.js`, `scripts/validate-protocol-evidence-render.js` | `js/knowledge.js` | `scripts/validate-condition-standard.js`, `scripts/validate-protocol-evidence-render.js` |
| `protocol_status` | `REVIEW_STATE` | `CHECKS_ENUM, READS_VALUE, TRANSFORMS, WRITES` | `scripts/ingest-protocol-delivery.js`, `scripts/validate-protocol-evidence-render.js` | `js/knowledge.js` | `scripts/validate-condition-standard.js`, `scripts/validate-protocol-evidence-render.js` |
| `safety_source` | `SOURCE_CITATION` | `READS_VALUE, WRITES` | `scripts/fetch-cloudtcm-formula-safety.js`, `scripts/fetch-cloudtcm-herb-safety.js` | 無 | 無 |
| `verification_status` | `VERIFICATION_STATE` | `CHECKS_ENUM, READS_VALUE, WRITES` | `scripts/test-pharm-negative-cases.js`, `scripts/validate-pharm-standard.js` | 無 | `scripts/test-pharm-negative-cases.js`, `scripts/test-pharm-source-integrity-negative-cases.js`, `scripts/validate-pharm-standard.js` |
| `content_source` | `AUTHORSHIP` | `READS_VALUE` | 無 | 無 | `scripts/validate-condition-standard.js` |
| `dailymed_setid` | `SOURCE_LOCATOR` | `READS_VALUE, WRITES` | `scripts/validate-pharm-standard.js` | 無 | `scripts/validate-pharm-standard.js` |
| `classic_formula_source_zh` | `SOURCE_CITATION` | `READS_VALUE, WRITES` | `scripts/audit-dark-fields.js` | 無 | 無 |
| `classic_formula_source_en` | `SOURCE_CITATION` | `READS_VALUE, WRITES` | `scripts/audit-dark-fields.js` | 無 | 無 |
| `herb_pair_source_note_en` | `SOURCE_CITATION` | `READS_VALUE, WRITES` | `scripts/audit-dark-fields.js` | 無 | 無 |
| `herb_drug_interaction_sources` | `SOURCE_CITATION` | `READS_VALUE, TRANSFORMS` | 無 | `js/knowledge.js` | 無 |
| `hierarchy_source_zh` | `SOURCE_CITATION` | `READS_VALUE, WRITES` | `scripts/audit-dark-fields.js` | 無 | 無 |
| `dose_source` | `SOURCE_CITATION` | `READS_VALUE` | 無 | 無 | `scripts/validate-supp-standard.js` |
| `original_shape` | `PROVENANCE` | `NONE` | 無 | 無 | 無 |
| `source_field` | `PROVENANCE` | `NONE` | 無 | 無 | 無 |
| `safety_review` | `REVIEW_STATE` | `NONE` | 無 | 無 | 無 |
| `herb_pair_source_note_zh` | `SOURCE_CITATION` | `NONE` | 無 | 無 | 無 |
| `dailymed_url` | `SOURCE_LOCATOR` | `NONE` | 無 | 無 | 無 |
| `source_hierarchy` | `SOURCE_CITATION` | `NONE` | 無 | 無 | 無 |
| `D_clinical_evidence` | `EVIDENCE_STRENGTH` | `NONE` | 無 | 無 | 無 |

---

## 4. 欄位重疊與片段化矩陣（Fragmentation / Overlap Matrix）

針對系統中共存之多重來源與審查欄位進行**逐筆數值比對（Record-Level Value Correlation）**與分類：

| 比對欄位對 (Field Pair) | 共存資料庫 (Coexisting Datasets) | 共存記錄數 (Coexisting Records) | 判定分類 (Classification) | 機械判定依據 (Rationale) |
|---|---|---|---|---|
| **sources vs field_sources** | `acupoints_361, condition_canon, extra_points, pattern_library, pharm_drug_classes, symptoms, tdis_registry` | 1021 | `CLEARLY_DISTINCT` | Fields share category but represent strictly distinct values across all 1014 coexisting records. |
| **content_source vs authored_by** | `condition_canon` | 99 | `CLEARLY_DISTINCT` | Fields share category but represent strictly distinct values across all 99 coexisting records. |
| **review_status vs source_status** | `acupoints_361, condition_canon, formulas, herbs` | 618 | `CLEARLY_DISTINCT` | Fields serve different semantic dimensions (REVIEW_STATE vs VERIFICATION_STATE). |
| **exact_source_url vs safety_source_url** | `formulas, herbs` | 399 | `PARTIAL_OVERLAP` | Fields share semantic category and exhibit partial value correlation (80% identical across 399 records). |
| **cloudtcm_url vs american_dragon_url** | `formulas, herbs` | 364 | `PARTIAL_OVERLAP` | Fields share semantic category and exhibit partial value correlation (0% identical across 364 records). |
| **dose_source vs sources** | `supplements` | 36 | `CLEARLY_DISTINCT` | Fields share category but represent strictly distinct values across all 36 coexisting records. |
| **evidence vs sources** | `acupoints_361, auricular_points, condition_canon, extra_points` | 646 | `CLEARLY_DISTINCT` | Fields serve different semantic dimensions (EVIDENCE_STRENGTH vs SOURCE_CITATION). |

---

## 5. 暗數據與空欄位清單（Dead / Dark Evidence Fields）

### A. 正典有資料但代碼無消費者 (`DATA_PRESENT_NO_CONSUMER_FOUND`)
- `original_shape`: **289** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `source_field`: **289** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `safety_review`: **1** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `herb_pair_source_note_zh`: **1** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `dailymed_url`: **59** 筆非空記錄（分佈於: `pharm_drugs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `source_hierarchy`: **1** 筆非空記錄（分佈於: `source_registry`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `D_clinical_evidence`: **1** 筆非空記錄（分佈於: `source_registry`），目前無任何 UI/Runtime/Builder/Validator 讀取。

### B. 代碼有讀取但資料全空 (`CONSUMER_EXISTS_BUT_DATA_EMPTY`)
- `reviewed_by`: 代碼中存在讀取路徑，但正典資料庫中非空記錄為 0。

---

## 6. 各資料集來源與證據覆蓋率（Per-Dataset Provenance Coverage）

| 資料庫 ID | 總記錄數 | 來源定位 (Locator) | 來源引用 (Citation) | 作者資訊 (Author) | 審核狀態 (Review) | 核實狀態 (Verify) | 欄位級來源 (Field-level) | 完全無中繼資料 (No Meta) |
|---|---|---|---|---|---|---|---|---|
| `herbs` | **363** | 350 (96%) | 360 (99%) | 80 (22%) | 363 (100%) | 274 (75%) | 363 (100%) | **0** (0%) |
| `herb_pairs` | **1** | 0 (0%) | 0 (0%) | 1 (100%) | 1 (100%) | 0 (0%) | 0 (0%) | **0** (0%) |
| `formulas` | **223** | 222 (100%) | 219 (98%) | 9 (4%) | 223 (100%) | 116 (52%) | 223 (100%) | **0** (0%) |
| `conditions` | **12** | 0 (0%) | 0 (0%) | 0 (0%) | 12 (100%) | 0 (0%) | 0 (0%) | **0** (0%) |
| `condition_canon` | **508** | 0 (0%) | 258 (51%) | 417 (82%) | 508 (100%) | 101 (20%) | 465 (92%) | **0** (0%) |
| `tdis_registry` | **160** | 0 (0%) | 75 (47%) | 160 (100%) | 160 (100%) | 0 (0%) | 159 (99%) | **0** (0%) |
| `cloudtcm_diseases` | **190** | 190 (100%) | 0 (0%) | 0 (0%) | 190 (100%) | 0 (0%) | 0 (0%) | **0** (0%) |
| `pattern_library` | **154** | 0 (0%) | 154 (100%) | 55 (36%) | 117 (76%) | 0 (0%) | 150 (97%) | **0** (0%) |
| `pattern_registry` | **151** | 0 (0%) | 0 (0%) | 0 (0%) | 151 (100%) | 0 (0%) | 0 (0%) | **0** (0%) |
| `acupoints_361` | **361** | 361 (100%) | 321 (89%) | 0 (0%) | 361 (100%) | 126 (35%) | 361 (100%) | **0** (0%) |
| `extra_points` | **72** | 0 (0%) | 72 (100%) | 0 (0%) | 72 (100%) | 0 (0%) | 50 (69%) | **0** (0%) |
| `auricular_points` | **203** | 0 (0%) | 203 (100%) | 0 (0%) | 203 (100%) | 0 (0%) | 0 (0%) | **0** (0%) |
| `scalp_points` | **22** | 0 (0%) | 22 (100%) | 0 (0%) | 22 (100%) | 0 (0%) | 0 (0%) | **0** (0%) |
| `tung_points` | **1** | 0 (0%) | 1 (100%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | **0** (0%) |
| `symptoms` | **124** | 0 (0%) | 122 (98%) | 124 (100%) | 124 (100%) | 0 (0%) | 122 (98%) | **0** (0%) |
| `comparisons` | **43** | 9 (21%) | 0 (0%) | 43 (100%) | 43 (100%) | 0 (0%) | 0 (0%) | **0** (0%) |
| `red_flag_registry` | **226** | 0 (0%) | 0 (0%) | 226 (100%) | 226 (100%) | 0 (0%) | 0 (0%) | **0** (0%) |
| `formula_safety_flags` | **1** | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | **1** (100%) |
| `pharm_drugs` | **59** | 59 (100%) | 0 (0%) | 59 (100%) | 59 (100%) | 34 (58%) | 59 (100%) | **0** (0%) |
| `pharm_drug_classes` | **48** | 0 (0%) | 48 (100%) | 6 (13%) | 48 (100%) | 0 (0%) | 39 (81%) | **0** (0%) |
| `western_medications` | **12** | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | **12** (100%) |
| `supplements` | **36** | 0 (0%) | 36 (100%) | 0 (0%) | 36 (100%) | 1 (3%) | 0 (0%) | **0** (0%) |
| `outcome_metrics` | **27** | 0 (0%) | 17 (63%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | **10** (37%) |
| `avs_advice_library` | **13** | 0 (0%) | 0 (0%) | 0 (0%) | 13 (100%) | 0 (0%) | 0 (0%) | **0** (0%) |
| `content_quality` | **1** | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | **1** (100%) |
| `formula_hdi_review` | **1** | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | **1** (100%) |
| `source_registry` | **1** | 0 (0%) | 1 (100%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | **0** (0%) |

---

## 7. 隱含優先序鏈路（Consumer Precedence Chains / SSOT Shadowing）

本節僅統計跨 **2+ 實質正典來源/證據欄位** 之優先序遮蔽鏈路（排除純字串預設值 fallback）：

1. **`app.js:478`**:
   - 運算式: `sources: record.sources || (record.cloudtcm_url ? [record.cloudtcm_url] : []),`
   - 優先順序: **[1]** `sources` $\rightarrow$ **[2]** `cloudtcm_url`
   - 遮蔽欄位: `cloudtcm_url`

2. **`app.js:535`**:
   - 運算式: `sources: record.source_urls || ["https://www.tungs-acupuncture.com"],`
   - 優先順序: **[1]** `sources` $\rightarrow$ **[2]** `source_urls`
   - 遮蔽欄位: `source_urls`

3. **`app.js:579`**:
   - 運算式: `sources: (record.sources && record.sources.length) ? record.sources : (record.source_urls && record.source_urls.length ? record.source_urls : [`
   - 優先順序: **[1]** `sources` $\rightarrow$ **[2]** `source_urls`
   - 遮蔽欄位: `source_urls`

4. **`js/knowledge.js:704`**:
   - 運算式: `<small>${esc(link.label_en || link.labelEn || link.source || "Visual reference")}</small>`
   - 優先順序: **[1]** `source` $\rightarrow$ **[2]** `reference`
   - 遮蔽欄位: `reference`

5. **`js/knowledge.js:1300`**:
   - 運算式: `|| record.exact_source_url || (record.source_urls || []).find(Boolean) || "";`
   - 優先順序: **[1]** `exact_source_url` $\rightarrow$ **[2]** `source_urls`
   - 遮蔽欄位: `source_urls`

6. **`legacy/app.js:96`**:
   - 運算式: `sources: record.source_urls || ["https://www.mastertungacupuncture.org/"],`
   - 優先順序: **[1]** `sources` $\rightarrow$ **[2]** `source_urls`
   - 遮蔽欄位: `source_urls`

7. **`legacy/app.js:147`**:
   - 運算式: `sources: record.source_urls || auricularGb93.sources || [],`
   - 優先順序: **[1]** `sources` $\rightarrow$ **[2]** `source_urls`
   - 遮蔽欄位: `source_urls`

8. **`legacy/app.js:7856`**:
   - 運算式: `const english = sources.find((source) => source.includes("acupoints.org")) || `https://www.acupoints.org/${String(point.code).toLowerCase()}-acupuncture-point/`;`
   - 優先順序: **[1]** `sources` $\rightarrow$ **[2]** `source`
   - 遮蔽欄位: `source`

9. **`legacy/app.js:7857`**:
   - 運算式: `const chinese = sources.find((source) => source.includes("cloudtcm.com")) || "https://cloudtcm.com/acupoint";`
   - 優先順序: **[1]** `sources` $\rightarrow$ **[2]** `source`
   - 遮蔽欄位: `source`

10. **`legacy/app.js:7901`**:
   - 運算式: `return `${point.nameEn} (${point.pinyin}; ${point.code}) belongs to the ${shortMeridianEn(point)}. It is located in the ${regionEn(point).toLowerCase()} region.\n\nActions: ${point.functionsEn || "Actions pending professional source review."}\n\nThis public English draft should be reviewed against WHO-style location standards, professional textbooks, and English clinical safety sources before publication.`;`
   - 優先順序: **[1]** `source` $\rightarrow$ **[2]** `sources`
   - 遮蔽欄位: `sources`

11. **`legacy/app.js:8069`**:
   - 運算式: `? sources.filter((source) => !source.includes("cloudtcm.com") && !source.includes("a-hospital.com"))`
   - 優先順序: **[1]** `sources` $\rightarrow$ **[2]** `source`
   - 遮蔽欄位: `source`

12. **`scripts/apply-acupoint-pattern-links.js:92`**:
   - 運算式: `held.push(`${prop.point_id}  ${pid}  (${evs.map((e) => e.confidence + ":" + e.source).join(" | ") || "no evidence"})`);`
   - 優先順序: **[1]** `source` $\rightarrow$ **[2]** `evidence`
   - 遮蔽欄位: `evidence`

13. **`scripts/audit-cr010-condition-detail-maturity.js:143`**:
   - 運算式: `const aRisk = (!a.hard_gates.red_flags ? 4:0) + (!a.hard_gates.acupuncture_scope ? 3:0) + (!a.hard_gates.sources ? 2:0) + (!a.hard_gates.field_sources ? 2:0);`
   - 優先順序: **[1]** `sources` $\rightarrow$ **[2]** `field_sources`
   - 遮蔽欄位: `field_sources`

14. **`scripts/audit-cr010-condition-detail-maturity.js:144`**:
   - 運算式: `const bRisk = (!b.hard_gates.red_flags ? 4:0) + (!b.hard_gates.acupuncture_scope ? 3:0) + (!b.hard_gates.sources ? 2:0) + (!b.hard_gates.field_sources ? 2:0);`
   - 優先順序: **[1]** `sources` $\rightarrow$ **[2]** `field_sources`
   - 遮蔽欄位: `field_sources`

15. **`scripts/ingest-protocol-delivery.js:122`**:
   - 運算式: `rows.push(`  ${c.condition_id.padEnd(30)} ${String(c.protocol_status).padEnd(15)} 穴 ${String(pts.length).padStart(2)} | 來源 ${String((c.sources || []).length).padStart(2)}``
   - 優先順序: **[1]** `protocol_status` $\rightarrow$ **[2]** `sources`
   - 遮蔽欄位: `sources`

16. **`scripts/link-formula-family-back.js:53`**:
   - 運算式: `target.field_sources.derived_from = [fam.source || `由 ${base.name_zh} 的 formula_family 反向產生`];`
   - 優先順序: **[1]** `field_sources` $\rightarrow$ **[2]** `source`
   - 遮蔽欄位: `source`

17. **`scripts/report-361-encoding-findings.js:53`**:
   - 運算式: `- source: ${item.source_url || "-"}`
   - 優先順序: **[1]** `source` $\rightarrow$ **[2]** `source_url`
   - 遮蔽欄位: `source_url`

18. **`scripts/report-formula-completeness.js:44`**:
   - 運算式: `["來源連結", (r) => filled(r.cloudtcm_url) || filled(r.american_dragon_url)],`
   - 優先順序: **[1]** `cloudtcm_url` $\rightarrow$ **[2]** `american_dragon_url`
   - 遮蔽欄位: `american_dragon_url`

19. **`scripts/validate-condition-sources.js:54`**:
   - 運算式: `if (!sources.some((entry) => (entry || "").includes(expected))) errors.push(`cond.functional_dyspepsia: missing exact source ${expected}`);`
   - 優先順序: **[1]** `sources` $\rightarrow$ **[2]** `source`
   - 遮蔽欄位: `source`

20. **`scripts/validate-condition-sources.js:72`**:
   - 運算式: `if (!sources.some((entry) => (entry || "").includes(expected))) errors.push(`cond.trigeminal_neuralgia: missing exact source ${expected}`);`
   - 優先順序: **[1]** `sources` $\rightarrow$ **[2]** `source`
   - 遮蔽欄位: `source`

21. **`scripts/validate-gyn-legacy-migration.js:65`**:
   - 運算式: `for (const e of r.evidence || []) if (!WL.test(e.source_url || "")) defects.push(`G7 off-whitelist: ${r.id} ${e.source_url}`);`
   - 優先順序: **[1]** `evidence` $\rightarrow$ **[2]** `source_url`
   - 遮蔽欄位: `source_url`

22. **`scripts/validate-herb-integrity-predicates.js:368`**:
   - 運算式: `hb9.push({ id: h.id, name_zh: h.name_zh || "", card_grade: h.card_grade, field_sources: h.field_sources });`
   - 優先順序: **[1]** `card_grade` $\rightarrow$ **[2]** `field_sources`
   - 遮蔽欄位: `field_sources`

23. **`scripts/validate-supp-standard.js:58`**:
   - 運算式: `if (!r.typical_dose_range_en || !(r.dose_source && r.dose_source.url && r.dose_source.verified)) fail(`${id}: maturity=${r.maturity} requires dose range + verified dose_source (url + verified date)`);`
   - 優先順序: **[1]** `dose_source` $\rightarrow$ **[2]** `verified`
   - 遮蔽欄位: `verified`


---

## 8. 生成包生命週期行為（Generated-Data Behavior）

| 欄位名稱 | 生成包存活狀態 (Survival Status) | 觀察依據 (Evidence) |
|---|---|---|
| `source_hint` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `review_status` | `SURVIVES_VERBATIM` | Present in app_data.js |
| `source_status` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `source_urls` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `exact_source_url` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `source_type` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `safety_source_url` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `safety_source` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `cloudtcm_url` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `american_dragon_url` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `source_citations` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `field_sources` | `SURVIVES_VERBATIM` | Present in app_data.js |
| `card_grade` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `original_shape` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `source_field` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `import_artifacts` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `authored_by` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `safety_review` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `classic_formula_source_zh` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `classic_formula_source_en` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `herb_pair_source_note_zh` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `herb_pair_source_note_en` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `last_reviewed` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `reference` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `source_classic` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `reviewed_by` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `herb_drug_interaction_sources` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `hierarchy_source_zh` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `sources` | `SURVIVES_VERBATIM` | Present in app_data.js |
| `evidence` | `SURVIVES_VERBATIM` | Present in app_data.js |
| `source` | `SURVIVES_VERBATIM` | Present in app_data.js |
| `content_source` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `acupoint_protocol_evidence` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `protocol_status` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `source_url` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `origin` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `dailymed_setid` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `dailymed_url` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `verification_status` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `dose_source` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `verified` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `source_hierarchy` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |
| `D_clinical_evidence` | `NOT_BUNDLED` | Field omitted from generated runtime bundles |

---
