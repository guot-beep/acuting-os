# Evidence & Provenance Fragmentation Inventory — Task 10D (Round 4.1)

- **Audit Date**: 2026-08-27
- **Base SHA (origin/main)**: `2745dcd59419c9b32adc18dca44f6feeff33be5a`
- **Audit Source SHA**: `c328ff1efc170fbb7de9f99fc6b4a6b8c1417505`
- **Delivery Commit SHA**: `null` (The immutable delivery commit SHA is the Git branch HEAD recorded externally upon commit creation.)
- **Scope**: Canonical Evidence, Provenance, Authorship, Review State, and Source Verification Architecture
- **Core Invariant**: 「SURVIVES_VERBATIM means the same canonical record carried the same field value into a runtime-loaded artifact. A matching field name somewhere else is insufficient.」

---

## 1. 核心指標與概覽（Summary Metrics）

| 指標 | 數值 / 狀態 | 說明 |
|---|---|---|
| **Discovered Evidence Fields** | **43** | 嚴格正典來源、引用、作者、審核、核實與證據強度欄位 |
| **Candidate Related Fields (Excluded)** | **10** | 考試重要度、教材等級、圖片連結等相關但非正典來源之欄位（獨立記錄，不計入來源總數） |
| **Canonical Datasets Scanned** | **27** | 涵蓋草藥、方劑、病證、經穴、症狀、鑑別、藥理、保健品等各大正典庫 |
| **Fields with Runtime Consumers** | **20** | 在 `app.js` 或 `js/*.js` 具有實質執行期讀取/渲染之欄位 |
| **Fields with Validator-Only Consumers** | **0** | 僅由 CI / 本機驗證器檢查，未進入 UI 渲染之欄位 |
| **Dead / Dark Evidence Fields** | **8** | 正典資料中有非空數值，但整個代碼庫無任何 Consumer 之欄位 (`DATA_PRESENT_NO_CONSUMER_FOUND`) |
| **Overlap Pairs Analyzed** | **7** | 依據逐筆記錄數值比對判定之欄位重疊與相容狀態 |
| **Precedence Chains Found** | **4** | 程式碼中以 `||` 或 `??` 跨 2+ 實質來源欄位之優先序遮蔽鏈路 |

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
| `field_sources` | `SOURCE_CITATION` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, TRANSFORMS, WRITES` | `scripts/add-missing-board-formulas.js`, `scripts/apply-acupoint-pattern-links.js` | `app.js`, `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `review_status` | `REVIEW_STATE` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `scripts/add-missing-board-formulas.js`, `scripts/apply-curriculum-composition.js` | `app.js`, `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `sources` | `SOURCE_CITATION` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `legacy/app.js` | `app.js`, `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `evidence` | `EVIDENCE_STRENGTH` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `legacy/app.js` | `app.js`, `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source` | `SOURCE_CITATION` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `js/avs.js` | `app.js`, `js/avs.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source_url` | `SOURCE_LOCATOR` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `scripts/apply-b123-task-c-ledger.js`, `scripts/build-cloudtcm-ref-map.js` | `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `origin` | `PROVENANCE` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `scripts/build-compare-with.js`, `scripts/migrate-b123-red-flags.js` | `app.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source_urls` | `SOURCE_LOCATOR` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, TRANSFORMS, WRITES` | `scripts/add-missing-board-formulas.js`, `scripts/apply-curriculum-composition.js` | `app.js`, `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `exact_source_url` | `SOURCE_LOCATOR` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, WRITES` | `scripts/fetch-cloudtcm-conditions-expanded.js`, `scripts/fetch-cloudtcm-conditions.js` | `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `cloudtcm_url` | `SOURCE_LOCATOR` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, TRANSFORMS, WRITES` | `scripts/build_batch1_gold_formulas.js`, `scripts/build_batch2_gold_formulas.js` | `app.js`, `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source_status` | `VERIFICATION_STATE` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, TRANSFORMS, WRITES` | `scripts/audit-legacy-namespace-retired-id.js`, `scripts/fetch-exact-cloudtcm-herbs.js` | `app.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `card_grade` | `EVIDENCE_STRENGTH` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, TRANSFORMS, WRITES` | `scripts/generate_formula_inventory.js`, `scripts/stamp-herb-card-grade.js` | `app.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `authored_by` | `AUTHORSHIP` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `scripts/build_batch1_gold_formulas.js`, `scripts/build_batch2_gold_formulas.js` | `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source_classic` | `SOURCE_CITATION` | `COPIES_THROUGH, READS_VALUE, TRANSFORMS, WRITES` | `scripts/add-missing-board-formulas.js`, `scripts/apply-source-classic.js` | `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source_type` | `PROVENANCE` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, TRANSFORMS, WRITES` | `scripts/add-missing-board-formulas.js`, `scripts/build-pattern-registry.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `acupoint_protocol_evidence` | `EVIDENCE_STRENGTH` | `COPIES_THROUGH, READS_VALUE, TRANSFORMS, WRITES` | `scripts/ingest-protocol-delivery.js`, `scripts/validate-protocol-evidence-render.js` | `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `protocol_status` | `REVIEW_STATE` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, WRITES` | `scripts/ingest-protocol-delivery.js`, `scripts/validate-protocol-evidence-render.js` | `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `verified` | `VERIFICATION_STATE` | `COPIES_THROUGH, READS_VALUE, TRANSFORMS, WRITES` | `scripts/fetch-cloudtcm-herb-map.js`, `scripts/fetch-mastertung-point-map.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source_hint` | `PROVENANCE` | `COPIES_THROUGH, READS_VALUE, WRITES` | `scripts/fetch-exact-cloudtcm-herbs.js`, `scripts/merge-formulas-preview.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `american_dragon_url` | `SOURCE_LOCATOR` | `COPIES_THROUGH, READS_VALUE, TRANSFORMS, WRITES` | `scripts/build_batch1_gold_formulas.js`, `scripts/build_batch2_gold_formulas.js` | `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source_citations` | `SOURCE_CITATION` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE` | 無 | `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `import_artifacts` | `IMPORT_HISTORY` | `COPIES_THROUGH, READS_VALUE, TRANSFORMS` | 無 | `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `reviewed_by` | `REVIEW_STATE` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, WRITES` | `js/review.js`, `scripts/apply-review-verdicts.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `dailymed_setid` | `SOURCE_LOCATOR` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE` | 無 | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `safety_source_url` | `SOURCE_LOCATOR` | `COPIES_THROUGH, READS_VALUE, WRITES` | `scripts/fetch-cloudtcm-formula-safety.js`, `scripts/fetch-cloudtcm-herb-safety.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `safety_source` | `SOURCE_CITATION` | `COPIES_THROUGH, READS_VALUE, WRITES` | `scripts/fetch-cloudtcm-formula-safety.js`, `scripts/fetch-cloudtcm-herb-safety.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `reference` | `SOURCE_CITATION` | `COPIES_THROUGH, READS_VALUE, WRITES` | `scripts/lib/preflight-generated-ci.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `herb_drug_interaction_sources` | `SOURCE_CITATION` | `COPIES_THROUGH, READS_VALUE, TRANSFORMS` | 無 | `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `verification_status` | `VERIFICATION_STATE` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, WRITES` | `scripts/test-pharm-negative-cases.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `dose_source` | `SOURCE_CITATION` | `COPIES_THROUGH, READS_VALUE` | 無 | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `original_shape` | `PROVENANCE` | `COPIES_THROUGH` | 無 | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source_field` | `PROVENANCE` | `COPIES_THROUGH` | 無 | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `safety_review` | `REVIEW_STATE` | `COPIES_THROUGH` | 無 | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `classic_formula_source_zh` | `SOURCE_CITATION` | `COPIES_THROUGH, WRITES` | `scripts/audit-dark-fields.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `classic_formula_source_en` | `SOURCE_CITATION` | `COPIES_THROUGH, WRITES` | `scripts/audit-dark-fields.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `herb_pair_source_note_zh` | `SOURCE_CITATION` | `COPIES_THROUGH` | 無 | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `herb_pair_source_note_en` | `SOURCE_CITATION` | `COPIES_THROUGH, WRITES` | `scripts/audit-dark-fields.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `last_reviewed` | `REVIEW_STATE` | `COPIES_THROUGH, WRITES` | `scripts/merge-formulas-preview.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `hierarchy_source_zh` | `SOURCE_CITATION` | `COPIES_THROUGH, WRITES` | `scripts/audit-dark-fields.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `content_source` | `AUTHORSHIP` | `COPIES_THROUGH` | 無 | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `dailymed_url` | `SOURCE_LOCATOR` | `COPIES_THROUGH` | 無 | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source_hierarchy` | `SOURCE_CITATION` | `COPIES_THROUGH` | 無 | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `D_clinical_evidence` | `EVIDENCE_STRENGTH` | `COPIES_THROUGH` | 無 | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |

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
- `content_source`: **130** 筆非空記錄（分佈於: `condition_canon`），目前無任何 UI/Runtime/Builder/Validator 讀取。
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

2. **`js/knowledge.js:1300`**:
   - 運算式: `|| record.exact_source_url || (record.source_urls || []).find(Boolean) || "";`
   - 優先順序: **[1]** `exact_source_url` $\rightarrow$ **[2]** `source_urls`
   - 遮蔽欄位: `source_urls`

3. **`legacy/app.js:147`**:
   - 運算式: `sources: record.source_urls || auricularGb93.sources || [],`
   - 優先順序: **[1]** `source_urls` $\rightarrow$ **[2]** `sources`
   - 遮蔽欄位: `sources`

4. **`scripts/report-formula-completeness.js:44`**:
   - 運算式: `["來源連結", (r) => filled(r.cloudtcm_url) || filled(r.american_dragon_url)],`
   - 優先順序: **[1]** `cloudtcm_url` $\rightarrow$ **[2]** `american_dragon_url`
   - 遮蔽欄位: `american_dragon_url`


---

## 8. 生成包生命週期行為（Generated-Data Behavior）

### A. 欄位層級彙總（Field-Level Aggregates）
| 欄位名稱 | 彙總狀態 (Aggregate Status) | 涵蓋資料集數 | 存活資料集 (Surviving) | 剔除資料集 (Dropped) | 未打包資料集 (Not Bundled) |
|---|---|---|---|---|---|
| `acupoint_protocol_evidence` | `ALL_SURVIVE_VERBATIM` | 1 | `condition_canon` | 無 | 無 |
| `american_dragon_url` | `ALL_SURVIVE_VERBATIM` | 3 | `herbs`, `formulas`, `formulas` | 無 | 無 |
| `authored_by` | `ALL_SURVIVE_VERBATIM` | 11 | `herbs`, `herb_pairs`, `formulas`, `condition_canon`, `tdis_registry`, `pattern_library`, `symptoms`, `comparisons`, `red_flag_registry`, `pharm_drugs`, `pharm_drug_classes` | 無 | 無 |
| `card_grade` | `ALL_SURVIVE_VERBATIM` | 1 | `herbs` | 無 | 無 |
| `classic_formula_source_en` | `ALL_SURVIVE_VERBATIM` | 1 | `herbs` | 無 | 無 |
| `classic_formula_source_zh` | `ALL_SURVIVE_VERBATIM` | 1 | `herbs` | 無 | 無 |
| `cloudtcm_url` | `ALL_SURVIVE_VERBATIM` | 4 | `herbs`, `formulas`, `formulas`, `acupoints_361` | 無 | 無 |
| `content_source` | `ALL_SURVIVE_VERBATIM` | 1 | `condition_canon` | 無 | 無 |
| `D_clinical_evidence` | `ALL_NOT_BUNDLED` | 1 | 無 | 無 | `source_registry` |
| `dailymed_setid` | `ALL_SURVIVE_VERBATIM` | 1 | `pharm_drugs` | 無 | 無 |
| `dailymed_url` | `ALL_SURVIVE_VERBATIM` | 1 | `pharm_drugs` | 無 | 無 |
| `dose_source` | `ALL_SURVIVE_VERBATIM` | 1 | `supplements` | 無 | 無 |
| `evidence` | `ALL_SURVIVE_VERBATIM` | 6 | `condition_canon`, `condition_canon`, `acupoints_361`, `extra_points`, `auricular_points`, `red_flag_registry` | 無 | 無 |
| `exact_source_url` | `ALL_SURVIVE_VERBATIM` | 3 | `herbs`, `formulas`, `formulas` | 無 | 無 |
| `field_sources` | `ALL_SURVIVE_VERBATIM` | 10 | `herbs`, `formulas`, `condition_canon`, `tdis_registry`, `pattern_library`, `acupoints_361`, `extra_points`, `symptoms`, `pharm_drugs`, `pharm_drug_classes` | 無 | 無 |
| `herb_drug_interaction_sources` | `ALL_SURVIVE_VERBATIM` | 1 | `formulas` | 無 | 無 |
| `herb_pair_source_note_en` | `ALL_SURVIVE_VERBATIM` | 1 | `herbs` | 無 | 無 |
| `herb_pair_source_note_zh` | `ALL_SURVIVE_VERBATIM` | 1 | `herbs` | 無 | 無 |
| `hierarchy_source_zh` | `ALL_SURVIVE_VERBATIM` | 1 | `formulas` | 無 | 無 |
| `import_artifacts` | `ALL_SURVIVE_VERBATIM` | 2 | `herbs`, `condition_canon` | 無 | 無 |
| `last_reviewed` | `ALL_SURVIVE_VERBATIM` | 3 | `herbs`, `formulas`, `comparisons` | 無 | 無 |
| `origin` | `ALL_SURVIVE_VERBATIM` | 1 | `red_flag_registry` | 無 | 無 |
| `original_shape` | `ALL_SURVIVE_VERBATIM` | 1 | `herbs` | 無 | 無 |
| `protocol_status` | `ALL_SURVIVE_VERBATIM` | 1 | `condition_canon` | 無 | 無 |
| `reference` | `ALL_SURVIVE_VERBATIM` | 1 | `herbs` | 無 | 無 |
| `review_status` | `MIXED` | 24 | `herbs`, `herbs`, `herbs`, `herb_pairs`, `formulas`, `formulas`, `formulas`, `conditions`, `condition_canon`, `tdis_registry`, `cloudtcm_diseases`, `pattern_library`, `acupoints_361`, `extra_points`, `auricular_points`, `scalp_points`, `symptoms`, `comparisons`, `red_flag_registry`, `pharm_drugs`, `pharm_drug_classes`, `supplements`, `avs_advice_library` | 無 | 無 |
| `reviewed_by` | `ALL_NOT_BUNDLED` | 1 | 無 | 無 | `formulas` |
| `safety_review` | `ALL_SURVIVE_VERBATIM` | 1 | `herbs` | 無 | 無 |
| `safety_source` | `ALL_SURVIVE_VERBATIM` | 2 | `herbs`, `formulas` | 無 | 無 |
| `safety_source_url` | `ALL_SURVIVE_VERBATIM` | 3 | `herbs`, `herbs`, `formulas` | 無 | 無 |
| `source` | `MIXED` | 6 | `condition_canon`, `condition_canon`, `supplements`, `outcome_metrics`, `outcome_metrics` | 無 | `tung_points` |
| `source_citations` | `ALL_SURVIVE_VERBATIM` | 1 | `herbs` | 無 | 無 |
| `source_classic` | `ALL_SURVIVE_VERBATIM` | 2 | `formulas`, `formulas` | 無 | 無 |
| `source_field` | `ALL_SURVIVE_VERBATIM` | 1 | `herbs` | 無 | 無 |
| `source_hierarchy` | `ALL_NOT_BUNDLED` | 1 | 無 | 無 | `source_registry` |
| `source_hint` | `ALL_SURVIVE_VERBATIM` | 2 | `herbs`, `formulas` | 無 | 無 |
| `source_status` | `ALL_SURVIVE_VERBATIM` | 8 | `herbs`, `herbs`, `herbs`, `formulas`, `formulas`, `formulas`, `condition_canon`, `acupoints_361` | 無 | 無 |
| `source_type` | `MIXED` | 9 | `herbs`, `formulas`, `conditions`, `condition_canon`, `tdis_registry`, `acupoints_361`, `symptoms`, `comparisons` | `pattern_registry` | 無 |
| `source_url` | `ALL_SURVIVE_VERBATIM` | 1 | `cloudtcm_diseases` | 無 | 無 |
| `source_urls` | `MIXED` | 5 | `herbs`, `formulas`, `formulas`, `comparisons` | 無 | `conditions` |
| `sources` | `MIXED` | 12 | `condition_canon`, `condition_canon`, `tdis_registry`, `pattern_library`, `acupoints_361`, `extra_points`, `auricular_points`, `scalp_points`, `symptoms`, `pharm_drug_classes`, `supplements` | 無 | `source_registry` |
| `verification_status` | `ALL_SURVIVE_VERBATIM` | 1 | `pharm_drugs` | 無 | 無 |
| `verified` | `ALL_SURVIVE_VERBATIM` | 1 | `supplements` | 無 | 無 |

### B. 資料集與欄位路徑細部明細（Per-Dataset & Field-Path Details）
| 欄位名稱 | 欄位路徑 (Field Path) | 資料庫 (Dataset) | 存活狀態 (Status) | 比對筆數 | 觀察依據 (Evidence) |
|---|---|---|---|---|---|
| `source_hint` | `source_hint` | `herbs` | `SURVIVES_VERBATIM` | 213 | 100% value equality verified across 213/213 sampled records |
| `review_status` | `review_status` | `herbs` | `SURVIVES_VERBATIM` | 358 | 100% value equality verified across 358/358 sampled records |
| `review_status` | `english_exam_track.review_status` | `herbs` | `SURVIVES_VERBATIM` | 200 | 100% value equality verified across 200/200 sampled records |
| `source_status` | `english_exam_track.source_status` | `herbs` | `SURVIVES_VERBATIM` | 200 | 100% value equality verified across 200/200 sampled records |
| `review_status` | `chinese_depth_track.review_status` | `herbs` | `SURVIVES_VERBATIM` | 200 | 100% value equality verified across 200/200 sampled records |
| `source_status` | `chinese_depth_track.source_status` | `herbs` | `SURVIVES_VERBATIM` | 200 | 100% value equality verified across 200/200 sampled records |
| `source_urls` | `source_urls` | `herbs` | `SURVIVES_VERBATIM` | 319 | 100% value equality verified across 319/319 sampled records |
| `exact_source_url` | `exact_source_url` | `herbs` | `SURVIVES_VERBATIM` | 266 | 100% value equality verified across 266/266 sampled records |
| `source_type` | `source_type` | `herbs` | `SURVIVES_VERBATIM` | 339 | 100% value equality verified across 339/339 sampled records |
| `safety_source_url` | `safety_source_url` | `herbs` | `SURVIVES_VERBATIM` | 347 | 100% value equality verified across 347/347 sampled records |
| `safety_source` | `safety_source` | `herbs` | `SURVIVES_VERBATIM` | 256 | 100% value equality verified across 256/256 sampled records |
| `cloudtcm_url` | `cloudtcm_url` | `herbs` | `SURVIVES_VERBATIM` | 247 | 100% value equality verified across 247/247 sampled records |
| `american_dragon_url` | `american_dragon_url` | `herbs` | `SURVIVES_VERBATIM` | 286 | 100% value equality verified across 286/286 sampled records |
| `source_citations` | `source_citations` | `herbs` | `SURVIVES_VERBATIM` | 164 | 100% value equality verified across 164/164 sampled records |
| `field_sources` | `field_sources` | `herbs` | `SURVIVES_VERBATIM` | 363 | 100% value equality verified across 363/363 sampled records |
| `card_grade` | `card_grade` | `herbs` | `SURVIVES_VERBATIM` | 356 | 100% value equality verified across 356/356 sampled records |
| `original_shape` | `dosage_normalized.original_shape` | `herbs` | `SURVIVES_VERBATIM` | 289 | 100% value equality verified across 289/289 sampled records |
| `source_field` | `dosage_normalized.source_field` | `herbs` | `SURVIVES_VERBATIM` | 289 | 100% value equality verified across 289/289 sampled records |
| `import_artifacts` | `import_artifacts` | `herbs` | `SURVIVES_VERBATIM` | 133 | 100% value equality verified across 133/133 sampled records |
| `source_status` | `source_status` | `herbs` | `SURVIVES_VERBATIM` | 80 | 100% value equality verified across 80/80 sampled records |
| `authored_by` | `authored_by` | `herbs` | `SURVIVES_VERBATIM` | 80 | 100% value equality verified across 80/80 sampled records |
| `safety_review` | `safety_review` | `herbs` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `safety_source_url` | `field_sources.safety_source_url` | `herbs` | `SURVIVES_VERBATIM` | 4 | 100% value equality verified across 4/4 sampled records |
| `classic_formula_source_zh` | `classic_formula_source_zh` | `herbs` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `classic_formula_source_en` | `classic_formula_source_en` | `herbs` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `herb_pair_source_note_zh` | `herb_pair_source_note_zh` | `herbs` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `herb_pair_source_note_en` | `herb_pair_source_note_en` | `herbs` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `last_reviewed` | `last_reviewed` | `herbs` | `SURVIVES_VERBATIM` | 25 | 100% value equality verified across 25/25 sampled records |
| `reference` | `dosage_g.reference` | `herbs` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `review_status` | `review_status` | `herb_pairs` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `authored_by` | `authored_by` | `herb_pairs` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `review_status` | `review_status` | `formulas` | `SURVIVES_VERBATIM` | 223 | 100% value equality verified across 223/223 sampled records |
| `source_urls` | `source_urls` | `formulas` | `SURVIVES_VERBATIM` | 187 | 100% value equality verified across 187/187 sampled records |
| `source_type` | `source_type` | `formulas` | `SURVIVES_VERBATIM` | 200 | 100% value equality verified across 200/200 sampled records |
| `last_reviewed` | `last_reviewed` | `formulas` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `source_status` | `source_status` | `formulas` | `SURVIVES_VERBATIM` | 116 | 100% value equality verified across 116/116 sampled records |
| `review_status` | `english_exam_track.review_status` | `formulas` | `SURVIVES_VERBATIM` | 116 | 100% value equality verified across 116/116 sampled records |
| `source_status` | `english_exam_track.source_status` | `formulas` | `SURVIVES_VERBATIM` | 116 | 100% value equality verified across 116/116 sampled records |
| `review_status` | `chinese_depth_track.review_status` | `formulas` | `SURVIVES_VERBATIM` | 116 | 100% value equality verified across 116/116 sampled records |
| `source_status` | `chinese_depth_track.source_status` | `formulas` | `SURVIVES_VERBATIM` | 116 | 100% value equality verified across 116/116 sampled records |
| `source_hint` | `source_hint` | `formulas` | `SURVIVES_VERBATIM` | 116 | 100% value equality verified across 116/116 sampled records |
| `source_classic` | `source_classic` | `formulas` | `SURVIVES_VERBATIM` | 218 | 100% value equality verified across 218/218 sampled records |
| `exact_source_url` | `exact_source_url` | `formulas` | `SURVIVES_VERBATIM` | 217 | 100% value equality verified across 217/217 sampled records |
| `safety_source` | `safety_source` | `formulas` | `SURVIVES_VERBATIM` | 140 | 100% value equality verified across 140/140 sampled records |
| `safety_source_url` | `safety_source_url` | `formulas` | `SURVIVES_VERBATIM` | 83 | 100% value equality verified across 83/83 sampled records |
| `cloudtcm_url` | `cloudtcm_url` | `formulas` | `SURVIVES_VERBATIM` | 137 | 100% value equality verified across 137/137 sampled records |
| `field_sources` | `field_sources` | `formulas` | `SURVIVES_VERBATIM` | 223 | 100% value equality verified across 223/223 sampled records |
| `american_dragon_url` | `field_sources.american_dragon_url` | `formulas` | `SURVIVES_VERBATIM` | 188 | 100% value equality verified across 188/188 sampled records |
| `source_classic` | `field_sources.source_classic` | `formulas` | `SURVIVES_VERBATIM` | 125 | 100% value equality verified across 125/125 sampled records |
| `cloudtcm_url` | `field_sources.cloudtcm_url` | `formulas` | `SURVIVES_VERBATIM` | 129 | 100% value equality verified across 129/129 sampled records |
| `authored_by` | `authored_by` | `formulas` | `SURVIVES_VERBATIM` | 9 | 100% value equality verified across 9/9 sampled records |
| `american_dragon_url` | `american_dragon_url` | `formulas` | `SURVIVES_VERBATIM` | 188 | 100% value equality verified across 188/188 sampled records |
| `reviewed_by` | `reviewed_by` | `formulas` | `NOT_BUNDLED` | 0 | No non-empty canonical records observed for field path |
| `exact_source_url` | `field_sources.exact_source_url` | `formulas` | `SURVIVES_VERBATIM` | 38 | 100% value equality verified across 38/38 sampled records |
| `herb_drug_interaction_sources` | `herb_drug_interaction_sources` | `formulas` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `source_urls` | `field_sources.source_urls` | `formulas` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `hierarchy_source_zh` | `hierarchy_source_zh` | `formulas` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `review_status` | `review_status` | `conditions` | `SURVIVES_VERBATIM` | 12 | 100% value equality verified across 12/12 sampled records |
| `source_urls` | `source_urls` | `conditions` | `NOT_BUNDLED` | 0 | No non-empty canonical records observed for field path |
| `source_type` | `source_type` | `conditions` | `SURVIVES_VERBATIM` | 12 | 100% value equality verified across 12/12 sampled records |
| `review_status` | `review_status` | `condition_canon` | `SURVIVES_VERBATIM` | 508 | 100% value equality verified across 508/508 sampled records |
| `source_type` | `source_type` | `condition_canon` | `SURVIVES_VERBATIM` | 135 | 100% value equality verified across 135/135 sampled records |
| `sources` | `sources` | `condition_canon` | `SURVIVES_VERBATIM` | 241 | 100% value equality verified across 241/241 sampled records |
| `field_sources` | `field_sources` | `condition_canon` | `SURVIVES_VERBATIM` | 472 | 100% value equality verified across 472/472 sampled records |
| `evidence` | `acupuncture_scope_zh.evidence` | `condition_canon` | `SURVIVES_VERBATIM` | 413 | 100% value equality verified across 413/413 sampled records |
| `source` | `acupuncture_scope_zh.source` | `condition_canon` | `SURVIVES_VERBATIM` | 192 | 100% value equality verified across 192/192 sampled records |
| `evidence` | `acupuncture_scope_en.evidence` | `condition_canon` | `SURVIVES_VERBATIM` | 413 | 100% value equality verified across 413/413 sampled records |
| `source` | `acupuncture_scope_en.source` | `condition_canon` | `SURVIVES_VERBATIM` | 192 | 100% value equality verified across 192/192 sampled records |
| `import_artifacts` | `import_artifacts` | `condition_canon` | `SURVIVES_VERBATIM` | 130 | 100% value equality verified across 130/130 sampled records |
| `content_source` | `content_source` | `condition_canon` | `SURVIVES_VERBATIM` | 130 | 100% value equality verified across 130/130 sampled records |
| `source_status` | `source_status` | `condition_canon` | `SURVIVES_VERBATIM` | 101 | 100% value equality verified across 101/101 sampled records |
| `acupoint_protocol_evidence` | `acupoint_protocol_evidence` | `condition_canon` | `SURVIVES_VERBATIM` | 133 | 100% value equality verified across 133/133 sampled records |
| `protocol_status` | `acupoint_protocol_evidence.protocol_status` | `condition_canon` | `SURVIVES_VERBATIM` | 133 | 100% value equality verified across 133/133 sampled records |
| `sources` | `acupoint_protocol_evidence.sources` | `condition_canon` | `SURVIVES_VERBATIM` | 31 | 100% value equality verified across 31/31 sampled records |
| `authored_by` | `authored_by` | `condition_canon` | `SURVIVES_VERBATIM` | 386 | 100% value equality verified across 386/386 sampled records |
| `sources` | `sources` | `tdis_registry` | `SURVIVES_VERBATIM` | 75 | 100% value equality verified across 75/75 sampled records |
| `field_sources` | `field_sources` | `tdis_registry` | `SURVIVES_VERBATIM` | 159 | 100% value equality verified across 159/159 sampled records |
| `source_type` | `source_type` | `tdis_registry` | `SURVIVES_VERBATIM` | 75 | 100% value equality verified across 75/75 sampled records |
| `review_status` | `review_status` | `tdis_registry` | `SURVIVES_VERBATIM` | 160 | 100% value equality verified across 160/160 sampled records |
| `authored_by` | `authored_by` | `tdis_registry` | `SURVIVES_VERBATIM` | 160 | 100% value equality verified across 160/160 sampled records |
| `source_url` | `source_url` | `cloudtcm_diseases` | `SURVIVES_VERBATIM` | 190 | 100% value equality verified across 190/190 sampled records |
| `review_status` | `review_status` | `cloudtcm_diseases` | `SURVIVES_VERBATIM` | 190 | 100% value equality verified across 190/190 sampled records |
| `review_status` | `review_status` | `pattern_library` | `SURVIVES_VERBATIM` | 117 | 100% value equality verified across 117/117 sampled records |
| `sources` | `sources` | `pattern_library` | `SURVIVES_VERBATIM` | 154 | 100% value equality verified across 154/154 sampled records |
| `field_sources` | `field_sources` | `pattern_library` | `SURVIVES_VERBATIM` | 150 | 100% value equality verified across 150/150 sampled records |
| `authored_by` | `authored_by` | `pattern_library` | `SURVIVES_VERBATIM` | 55 | 100% value equality verified across 55/55 sampled records |
| `review_status` | `review_status` | `pattern_registry` | `TRANSFORMED` | 151 | Partial/transformed survival (114 verbatim, 0 transformed, 37 dropped across 151 records) |
| `source_type` | `source_type` | `pattern_registry` | `DROPPED` | 151 | Field omitted from all 151 generated runtime records |
| `sources` | `sources` | `acupoints_361` | `SURVIVES_VERBATIM` | 321 | 100% value equality verified across 321/321 sampled records |
| `evidence` | `evidence` | `acupoints_361` | `SURVIVES_VERBATIM` | 358 | 100% value equality verified across 358/358 sampled records |
| `review_status` | `review_status` | `acupoints_361` | `SURVIVES_VERBATIM` | 361 | 100% value equality verified across 361/361 sampled records |
| `cloudtcm_url` | `cloudtcm_url` | `acupoints_361` | `SURVIVES_VERBATIM` | 361 | 100% value equality verified across 361/361 sampled records |
| `source_type` | `source_type` | `acupoints_361` | `SURVIVES_VERBATIM` | 361 | 100% value equality verified across 361/361 sampled records |
| `field_sources` | `field_sources` | `acupoints_361` | `SURVIVES_VERBATIM` | 361 | 100% value equality verified across 361/361 sampled records |
| `source_status` | `source_status` | `acupoints_361` | `SURVIVES_VERBATIM` | 126 | 100% value equality verified across 126/126 sampled records |
| `evidence` | `evidence` | `extra_points` | `SURVIVES_VERBATIM` | 72 | 100% value equality verified across 72/72 sampled records |
| `sources` | `sources` | `extra_points` | `SURVIVES_VERBATIM` | 72 | 100% value equality verified across 72/72 sampled records |
| `review_status` | `review_status` | `extra_points` | `SURVIVES_VERBATIM` | 72 | 100% value equality verified across 72/72 sampled records |
| `field_sources` | `field_sources` | `extra_points` | `SURVIVES_VERBATIM` | 50 | 100% value equality verified across 50/50 sampled records |
| `evidence` | `evidence` | `auricular_points` | `SURVIVES_VERBATIM` | 29 | 100% value equality verified across 29/29 sampled records |
| `sources` | `sources` | `auricular_points` | `SURVIVES_VERBATIM` | 203 | 100% value equality verified across 203/203 sampled records |
| `review_status` | `review_status` | `auricular_points` | `SURVIVES_VERBATIM` | 203 | 100% value equality verified across 203/203 sampled records |
| `sources` | `sources` | `scalp_points` | `SURVIVES_VERBATIM` | 22 | 100% value equality verified across 22/22 sampled records |
| `review_status` | `review_status` | `scalp_points` | `SURVIVES_VERBATIM` | 22 | 100% value equality verified across 22/22 sampled records |
| `source` | `source` | `tung_points` | `NOT_BUNDLED` | 0 | Dataset has no runtime-loaded generated build path |
| `sources` | `sources` | `symptoms` | `SURVIVES_VERBATIM` | 122 | 100% value equality verified across 122/122 sampled records |
| `field_sources` | `field_sources` | `symptoms` | `SURVIVES_VERBATIM` | 122 | 100% value equality verified across 122/122 sampled records |
| `source_type` | `source_type` | `symptoms` | `SURVIVES_VERBATIM` | 122 | 100% value equality verified across 122/122 sampled records |
| `review_status` | `review_status` | `symptoms` | `SURVIVES_VERBATIM` | 124 | 100% value equality verified across 124/124 sampled records |
| `authored_by` | `authored_by` | `symptoms` | `SURVIVES_VERBATIM` | 124 | 100% value equality verified across 124/124 sampled records |
| `authored_by` | `authored_by` | `comparisons` | `SURVIVES_VERBATIM` | 43 | 100% value equality verified across 43/43 sampled records |
| `review_status` | `review_status` | `comparisons` | `SURVIVES_VERBATIM` | 43 | 100% value equality verified across 43/43 sampled records |
| `source_urls` | `source_urls` | `comparisons` | `SURVIVES_VERBATIM` | 9 | 100% value equality verified across 9/9 sampled records |
| `source_type` | `source_type` | `comparisons` | `SURVIVES_VERBATIM` | 9 | 100% value equality verified across 9/9 sampled records |
| `last_reviewed` | `last_reviewed` | `comparisons` | `SURVIVES_VERBATIM` | 9 | 100% value equality verified across 9/9 sampled records |
| `evidence` | `evidence` | `red_flag_registry` | `SURVIVES_VERBATIM` | 186 | 100% value equality verified across 186/186 sampled records |
| `review_status` | `review_status` | `red_flag_registry` | `SURVIVES_VERBATIM` | 226 | 100% value equality verified across 226/226 sampled records |
| `authored_by` | `authored_by` | `red_flag_registry` | `SURVIVES_VERBATIM` | 226 | 100% value equality verified across 226/226 sampled records |
| `origin` | `origin` | `red_flag_registry` | `SURVIVES_VERBATIM` | 191 | 100% value equality verified across 191/191 sampled records |
| `dailymed_setid` | `dailymed_setid` | `pharm_drugs` | `SURVIVES_VERBATIM` | 59 | 100% value equality verified across 59/59 sampled records |
| `dailymed_url` | `dailymed_url` | `pharm_drugs` | `SURVIVES_VERBATIM` | 59 | 100% value equality verified across 59/59 sampled records |
| `field_sources` | `field_sources` | `pharm_drugs` | `SURVIVES_VERBATIM` | 59 | 100% value equality verified across 59/59 sampled records |
| `review_status` | `review_status` | `pharm_drugs` | `SURVIVES_VERBATIM` | 59 | 100% value equality verified across 59/59 sampled records |
| `authored_by` | `authored_by` | `pharm_drugs` | `SURVIVES_VERBATIM` | 59 | 100% value equality verified across 59/59 sampled records |
| `verification_status` | `verification_status` | `pharm_drugs` | `SURVIVES_VERBATIM` | 34 | 100% value equality verified across 34/34 sampled records |
| `field_sources` | `field_sources` | `pharm_drug_classes` | `SURVIVES_VERBATIM` | 48 | 100% value equality verified across 48/48 sampled records |
| `review_status` | `review_status` | `pharm_drug_classes` | `SURVIVES_VERBATIM` | 48 | 100% value equality verified across 48/48 sampled records |
| `sources` | `sources` | `pharm_drug_classes` | `SURVIVES_VERBATIM` | 48 | 100% value equality verified across 48/48 sampled records |
| `authored_by` | `authored_by` | `pharm_drug_classes` | `SURVIVES_VERBATIM` | 6 | 100% value equality verified across 6/6 sampled records |
| `dose_source` | `dose_source` | `supplements` | `SURVIVES_VERBATIM` | 34 | 100% value equality verified across 34/34 sampled records |
| `source` | `interaction_focus.source` | `supplements` | `SURVIVES_VERBATIM` | 36 | 100% value equality verified across 36/36 sampled records |
| `sources` | `sources` | `supplements` | `SURVIVES_VERBATIM` | 36 | 100% value equality verified across 36/36 sampled records |
| `review_status` | `review_status` | `supplements` | `SURVIVES_VERBATIM` | 36 | 100% value equality verified across 36/36 sampled records |
| `verified` | `dose_source.verified` | `supplements` | `SURVIVES_VERBATIM` | 1 | 100% value equality verified across 1/1 sampled records |
| `source` | `source` | `outcome_metrics` | `SURVIVES_VERBATIM` | 10 | 100% value equality verified across 10/10 sampled records |
| `source` | `reference_range.source` | `outcome_metrics` | `SURVIVES_VERBATIM` | 7 | 100% value equality verified across 7/7 sampled records |
| `review_status` | `review_status` | `avs_advice_library` | `SURVIVES_VERBATIM` | 13 | 100% value equality verified across 13/13 sampled records |
| `source_hierarchy` | `source_hierarchy` | `source_registry` | `NOT_BUNDLED` | 0 | Dataset has no runtime-loaded generated build path |
| `D_clinical_evidence` | `source_hierarchy.D_clinical_evidence` | `source_registry` | `NOT_BUNDLED` | 0 | Dataset has no runtime-loaded generated build path |
| `sources` | `sources` | `source_registry` | `NOT_BUNDLED` | 0 | Dataset has no runtime-loaded generated build path |

---
