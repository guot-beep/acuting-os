# Evidence & Provenance Fragmentation Inventory — Task 10D (Round 3)

- **Audit Date**: 2026-08-27
- **Base SHA (origin/main)**: `302cef57608744a48b5a487c613e70a9e232722f`
- **Audit Source SHA**: `302cef57608744a48b5a487c613e70a9e232722f`
- **Delivery Commit SHA**: `null` (The immutable delivery commit SHA is the Git branch HEAD recorded externally upon commit creation.)
- **Scope**: Canonical Evidence, Provenance, Authorship, Review State, and Source Verification Architecture
- **Core Invariant**: 「A property name is not a fallback operand, and a field name appearing in a generated file is not proof that the canonical field survived into runtime.」

---

## 1. 核心指標與概覽（Summary Metrics）

| 指標 | 數值 / 狀態 | 說明 |
|---|---|---|
| **Discovered Evidence Fields** | **43** | 嚴格正典來源、引用、作者、審核、核實與證據強度欄位 |
| **Candidate Related Fields (Excluded)** | **10** | 考試重要度、教材等級、圖片連結等相關但非正典來源之欄位（獨立記錄，不計入來源總數） |
| **Canonical Datasets Scanned** | **27** | 涵蓋草藥、方劑、病證、經穴、症狀、鑑別、藥理、保健品等各大正典庫 |
| **Fields with Runtime Consumers** | **20** | 在 `app.js` 或 `js/*.js` 具有實質執行期讀取/渲染之欄位 |
| **Fields with Validator-Only Consumers** | **0** | 僅由 CI / 本機驗證器檢查，未進入 UI 渲染之欄位 |
| **Dead / Dark Evidence Fields** | **7** | 正典資料中有非空數值，但整個代碼庫無任何 Consumer 之欄位 (`DATA_PRESENT_NO_CONSUMER_FOUND`) |
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
| `review_status` | `REVIEW_STATE` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `data/auricular/gb93_index.js`, `data/tung/point_index.js` | `app.js`, `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `sources` | `SOURCE_CITATION` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `data/auricular/gb93_index.js` | `app.js`, `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `evidence` | `EVIDENCE_STRENGTH` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `legacy/app.js` | `app.js`, `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source` | `SOURCE_CITATION` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `data/tung/point_index.js` | `app.js`, `js/avs.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source_url` | `SOURCE_LOCATOR` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `scripts/apply-b123-task-c-ledger.js`, `scripts/build-cloudtcm-ref-map.js` | `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `origin` | `PROVENANCE` | `CHECKS_ENUM, COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `scripts/build-compare-with.js`, `scripts/migrate-b123-red-flags.js` | `app.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
| `source_urls` | `SOURCE_LOCATOR` | `CHECKS_ENUM, COPIES_THROUGH, READS_VALUE, TRANSFORMS, WRITES` | `data/auricular/gb93_index.js`, `data/tung/point_index.js` | `app.js`, `js/knowledge.js` | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
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
| `content_source` | `AUTHORSHIP` | `COPIES_THROUGH, WRITES` | `data/tung/point_index.js` | 無 | `scripts/check-branch-mergeable.js`, `scripts/check-canon-no-loss.js`, `scripts/check-formula-no-loss.js` |
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

| 欄位名稱 | 生成包存活狀態 (Survival Status) | 觀察依據 (Evidence) |
|---|---|---|
| `source_hint` | `SURVIVES_VERBATIM` | formulas: Preserved in runtime bundles across 116 canonical records |
| `review_status` | `SURVIVES_VERBATIM` | supplements: Preserved in runtime bundles across 36 canonical records |
| `source_status` | `SURVIVES_VERBATIM` | acupoints_361: Preserved in runtime bundles across 126 canonical records |
| `source_urls` | `SURVIVES_VERBATIM` | comparisons: Preserved in runtime bundles across 9 canonical records |
| `exact_source_url` | `SURVIVES_VERBATIM` | formulas: Preserved in runtime bundles across 217 canonical records |
| `source_type` | `SURVIVES_VERBATIM` | comparisons: Preserved in runtime bundles across 9 canonical records |
| `safety_source_url` | `SURVIVES_VERBATIM` | formulas: Preserved in runtime bundles across 83 canonical records |
| `safety_source` | `SURVIVES_VERBATIM` | formulas: Preserved in runtime bundles across 140 canonical records |
| `cloudtcm_url` | `SURVIVES_VERBATIM` | acupoints_361: Preserved in runtime bundles across 361 canonical records |
| `american_dragon_url` | `SURVIVES_VERBATIM` | formulas: Preserved in runtime bundles across 188 canonical records |
| `source_citations` | `SURVIVES_VERBATIM` | herbs: Preserved in runtime bundles across 165 canonical records |
| `field_sources` | `SURVIVES_VERBATIM` | pharm_drug_classes: Preserved in runtime bundles across 48 canonical records |
| `card_grade` | `SURVIVES_VERBATIM` | herbs: Preserved in runtime bundles across 356 canonical records |
| `original_shape` | `NOT_BUNDLED` | Dataset not in runtime build path |
| `source_field` | `NOT_BUNDLED` | Dataset not in runtime build path |
| `import_artifacts` | `SURVIVES_VERBATIM` | condition_canon: Preserved in runtime bundles across 130 canonical records |
| `authored_by` | `SURVIVES_VERBATIM` | pharm_drug_classes: Preserved in runtime bundles across 6 canonical records |
| `safety_review` | `SURVIVES_VERBATIM` | herbs: Preserved in runtime bundles across 1 canonical records |
| `classic_formula_source_zh` | `SURVIVES_VERBATIM` | herbs: Preserved in runtime bundles across 1 canonical records |
| `classic_formula_source_en` | `SURVIVES_VERBATIM` | herbs: Preserved in runtime bundles across 1 canonical records |
| `herb_pair_source_note_zh` | `SURVIVES_VERBATIM` | herbs: Preserved in runtime bundles across 1 canonical records |
| `herb_pair_source_note_en` | `SURVIVES_VERBATIM` | herbs: Preserved in runtime bundles across 1 canonical records |
| `last_reviewed` | `SURVIVES_VERBATIM` | comparisons: Preserved in runtime bundles across 9 canonical records |
| `reference` | `NOT_BUNDLED` | Dataset not in runtime build path |
| `source_classic` | `SURVIVES_VERBATIM` | formulas: Preserved in runtime bundles across 218 canonical records |
| `reviewed_by` | `NOT_BUNDLED` | Dataset not in runtime build path |
| `herb_drug_interaction_sources` | `SURVIVES_VERBATIM` | formulas: Preserved in runtime bundles across 1 canonical records |
| `hierarchy_source_zh` | `SURVIVES_VERBATIM` | formulas: Preserved in runtime bundles across 1 canonical records |
| `sources` | `SURVIVES_VERBATIM` | supplements: Preserved in runtime bundles across 36 canonical records |
| `evidence` | `SURVIVES_VERBATIM` | red_flag_registry: Preserved in runtime bundles across 226 canonical records |
| `source` | `SURVIVES_VERBATIM` | tung_points: Preserved in runtime bundles across 1 canonical records |
| `content_source` | `SURVIVES_VERBATIM` | condition_canon: Preserved in runtime bundles across 130 canonical records |
| `acupoint_protocol_evidence` | `SURVIVES_VERBATIM` | condition_canon: Preserved in runtime bundles across 133 canonical records |
| `protocol_status` | `NOT_BUNDLED` | Dataset not in runtime build path |
| `source_url` | `NOT_BUNDLED` | Dataset not in runtime build path |
| `origin` | `SURVIVES_VERBATIM` | red_flag_registry: Preserved in runtime bundles across 191 canonical records |
| `dailymed_setid` | `SURVIVES_VERBATIM` | pharm_drugs: Preserved in runtime bundles across 59 canonical records |
| `dailymed_url` | `SURVIVES_VERBATIM` | pharm_drugs: Preserved in runtime bundles across 59 canonical records |
| `verification_status` | `SURVIVES_VERBATIM` | pharm_drugs: Preserved in runtime bundles across 34 canonical records |
| `dose_source` | `SURVIVES_VERBATIM` | supplements: Preserved in runtime bundles across 34 canonical records |
| `verified` | `NOT_BUNDLED` | Dataset not in runtime build path |
| `source_hierarchy` | `NOT_BUNDLED` | Dataset not in runtime build path |
| `D_clinical_evidence` | `NOT_BUNDLED` | Dataset not in runtime build path |

---
