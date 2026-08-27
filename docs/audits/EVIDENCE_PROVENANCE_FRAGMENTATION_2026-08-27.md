# Evidence & Provenance Fragmentation Inventory — Task 10D

- **Audit Date**: 2026-08-27
- **Base SHA (origin/main)**: `0e0eb7aefc3962e79a3dc7af1c74975dc96ee3bc`
- **Audit Source SHA**: `d840c6f7c42904949d609c094dd431fb79d1ba7a`
- **Delivery Commit SHA**: `null` (The immutable delivery commit SHA is the Git branch HEAD recorded externally upon commit creation.)
- **Scope**: Canonical Evidence, Provenance, Authorship, Review State, and Source Verification Architecture
- **Core Invariant**: 「先把『誰在描述來源、誰在描述審核、誰在描述作者、誰真的被程式使用』拆清楚，再談統一。名字相似不是語意相同。」

---

## 1. 核心指標與概覽（Summary Metrics）

| 指標 | 數值 / 狀態 | 說明 |
|---|---|---|
| **Discovered Evidence Fields** | **119** | 遍歷所有正典 JSON 資料集所識別之來源/審查/證據相關欄位名稱 |
| **Canonical Datasets Scanned** | **27** | 涵蓋草藥、方劑、病證、經穴、症狀、鑑別、藥理、保健品等各大正典庫 |
| **Fields with Runtime Consumers** | **51** | 在 `app.js` 或 `js/*.js` 具有實質執行期讀取/渲染之欄位 |
| **Fields with Validator-Only Consumers** | **19** | 僅由 CI / 本機驗證器檢查，未進入 UI 渲染之欄位 |
| **Dead / Dark Evidence Fields** | **34** | 正典資料中有非空數值，但整個代碼庫無任何 Consumer 之欄位 (`DATA_PRESENT_NO_CONSUMER_FOUND`) |
| **Overlap Pairs Classified** | **8** | 機械性比對共存欄位對之重疊與相容狀態 |
| **Precedence Chains Found** | **568** | 程式碼中以 `||` 或 `??` 隱含優先序覆蓋之 SSOT 遮蔽鏈路 |

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
| `exam_importance` | `EVIDENCE_STRENGTH` | 986 | 964 | 5 | `array, string` |
| `source` | `SOURCE_CITATION` | 887 | 438 | 4 | `null, object, string` |
| `cloudtcm_url` | `SOURCE_LOCATOR` | 875 | 874 | 3 | `array, string` |
| `american_dragon_url` | `SOURCE_LOCATOR` | 664 | 662 | 2 | `array, string` |
| `exact_source_url` | `SOURCE_LOCATOR` | 574 | 521 | 2 | `array, null, string` |
| `source_urls` | `SOURCE_LOCATOR` | 571 | 516 | 4 | `array` |
| `safety_source_url` | `SOURCE_LOCATOR` | 434 | 434 | 2 | `string` |
| `safety_source` | `SOURCE_CITATION` | 397 | 396 | 2 | `string` |
| `course_level_en` | `EVIDENCE_STRENGTH` | 376 | 376 | 1 | `array, string` |
| `diagram_urls_en` | `SOURCE_LOCATOR` | 361 | 361 | 1 | `array` |
| `diagram_urls_zh` | `SOURCE_LOCATOR` | 361 | 361 | 1 | `array` |
| `card_grade` | `EVIDENCE_STRENGTH` | 356 | 356 | 1 | `string` |
| `source_classic` | `SOURCE_CITATION` | 343 | 343 | 1 | `array, string` |
| `source_hint` | `PROVENANCE` | 329 | 329 | 2 | `string` |
| `original_shape` | `PROVENANCE` | 289 | 289 | 1 | `string` |
| `source_field` | `PROVENANCE` | 289 | 289 | 1 | `string` |
| `examImportance` | `EVIDENCE_STRENGTH` | 272 | 272 | 1 | `string` |
| `import_artifacts` | `IMPORT_HISTORY` | 263 | 263 | 2 | `array` |
| `atlas_url` | `SOURCE_LOCATOR` | 261 | 260 | 1 | `string` |
| `atlas_link_status` | `UNKNOWN_OR_AMBIGUOUS` | 261 | 260 | 1 | `string` |
| `image_url` | `SOURCE_LOCATOR` | 248 | 248 | 2 | `string` |
| `american_dragon_link_status` | `UNKNOWN_OR_AMBIGUOUS` | 228 | 228 | 1 | `string` |
| `modern_functions_source` | `SOURCE_CITATION` | 200 | 199 | 1 | `string` |
| `modern_functions_source_url` | `SOURCE_LOCATOR` | 200 | 199 | 1 | `string` |
| `functions_zh_source` | `SOURCE_CITATION` | 199 | 199 | 1 | `array` |
| `provenance_status` | `UNKNOWN_OR_AMBIGUOUS` | 191 | 191 | 1 | `string` |
| `origin` | `PROVENANCE` | 191 | 191 | 1 | `string` |
| `source_id` | `UNKNOWN_OR_AMBIGUOUS` | 190 | 190 | 1 | `number` |
| `source_url` | `SOURCE_LOCATOR` | 190 | 190 | 1 | `string` |
| `source_date` | `UNKNOWN_OR_AMBIGUOUS` | 190 | 190 | 1 | `string` |
| `translation_status` | `UNKNOWN_OR_AMBIGUOUS` | 190 | 190 | 1 | `string` |
| `enrichment_status` | `UNKNOWN_OR_AMBIGUOUS` | 170 | 170 | 1 | `string` |
| `source_citations` | `SOURCE_CITATION` | 165 | 164 | 1 | `array` |
| `acupoint_protocols` | `UNKNOWN_OR_AMBIGUOUS` | 159 | 84 | 1 | `array` |
| `level` | `UNKNOWN_OR_AMBIGUOUS` | 151 | 151 | 1 | `string` |
| `last_reviewed` | `REVIEW_STATE` | 149 | 35 | 3 | `string` |
| `source_note` | `UNKNOWN_OR_AMBIGUOUS` | 141 | 141 | 2 | `string` |
| `acupoint_protocol_evidence` | `EVIDENCE_STRENGTH` | 133 | 133 | 1 | `object` |
| `protocol_status` | `REVIEW_STATE` | 133 | 133 | 1 | `string` |
| `evidence_note_zh` | `UNKNOWN_OR_AMBIGUOUS` | 133 | 133 | 1 | `string` |
| `no_source_found` | `UNKNOWN_OR_AMBIGUOUS` | 133 | 133 | 1 | `boolean` |
| `content_source` | `AUTHORSHIP` | 130 | 130 | 1 | `array, string` |
| `safety_review_status` | `UNKNOWN_OR_AMBIGUOUS` | 126 | 126 | 1 | `string` |
| `safety_review_sources` | `SOURCE_CITATION` | 125 | 125 | 1 | `array, string` |
| `exam_importance_en` | `UNKNOWN_OR_AMBIGUOUS` | 104 | 104 | 3 | `string` |
| `source_batch` | `UNKNOWN_OR_AMBIGUOUS` | 95 | 95 | 1 | `string` |
| `provenance_review` | `UNKNOWN_OR_AMBIGUOUS` | 95 | 95 | 1 | `string` |
| `tags_source_url` | `SOURCE_LOCATOR` | 94 | 94 | 1 | `string` |
| `url` | `UNKNOWN_OR_AMBIGUOUS` | 83 | 83 | 2 | `string` |
| `source_note_zh` | `UNKNOWN_OR_AMBIGUOUS` | 80 | 80 | 1 | `string` |
| `property_channel_source_note_zh` | `UNKNOWN_OR_AMBIGUOUS` | 77 | 77 | 1 | `string` |
| `review_notes_zh` | `UNKNOWN_OR_AMBIGUOUS` | 76 | 75 | 1 | `string` |
| `safety_review_pending` | `UNKNOWN_OR_AMBIGUOUS` | 72 | 72 | 1 | `boolean, string` |
| `reviewStatus` | `UNKNOWN_OR_AMBIGUOUS` | 72 | 72 | 1 | `string` |
| `dailymed_url` | `SOURCE_LOCATOR` | 59 | 59 | 1 | `string` |
| `dailymed_url_kind` | `UNKNOWN_OR_AMBIGUOUS` | 59 | 59 | 1 | `string` |
| `classical_references_zh` | `UNKNOWN_OR_AMBIGUOUS` | 56 | 42 | 1 | `array, string` |
| `status` | `UNKNOWN_OR_AMBIGUOUS` | 45 | 45 | 3 | `string` |
| `formula_song_source_zh` | `UNKNOWN_OR_AMBIGUOUS` | 43 | 43 | 1 | `string` |
| `composition_source_note_zh` | `UNKNOWN_OR_AMBIGUOUS` | 42 | 42 | 1 | `array, string` |
| `evidence_note_en` | `UNKNOWN_OR_AMBIGUOUS` | 40 | 0 | 1 | `null` |
| `medlineplus_url` | `SOURCE_LOCATOR` | 40 | 39 | 1 | `null, string` |
| `medlineplus_url_kind` | `UNKNOWN_OR_AMBIGUOUS` | 40 | 40 | 1 | `string` |
| `medlineplus_verified_on` | `UNKNOWN_OR_AMBIGUOUS` | 40 | 40 | 1 | `string` |
| `dose_source` | `SOURCE_CITATION` | 36 | 34 | 1 | `null, object` |
| `evidence_snapshot_en` | `UNKNOWN_OR_AMBIGUOUS` | 36 | 36 | 1 | `string` |
| `evidence_source` | `SOURCE_CITATION` | 36 | 36 | 1 | `object` |
| `related_drugclass_review_flags` | `UNKNOWN_OR_AMBIGUOUS` | 36 | 0 | 1 | `array` |
| `rx_otc_status` | `UNKNOWN_OR_AMBIGUOUS` | 34 | 34 | 1 | `string` |
| `verification_status` | `VERIFICATION_STATE` | 34 | 34 | 1 | `string` |
| `drug_interactions_graded` | `UNKNOWN_OR_AMBIGUOUS` | 29 | 29 | 1 | `array` |
| `interpretation_status` | `UNKNOWN_OR_AMBIGUOUS` | 27 | 27 | 1 | `string` |
| `cloudtcm_link_status` | `UNKNOWN_OR_AMBIGUOUS` | 25 | 25 | 1 | `string` |
| `unsourced_claims_quarantine` | `UNKNOWN_OR_AMBIGUOUS` | 21 | 21 | 1 | `array` |
| `differentiation_preview_zh` | `UNKNOWN_OR_AMBIGUOUS` | 17 | 17 | 1 | `string` |
| `differentiation_preview_en` | `UNKNOWN_OR_AMBIGUOUS` | 17 | 17 | 1 | `string` |
| `last_reviewed_at` | `UNKNOWN_OR_AMBIGUOUS` | 17 | 17 | 1 | `string` |
| `classical_source` | `SOURCE_CITATION` | 16 | 15 | 1 | `string` |
| `source_refs` | `UNKNOWN_OR_AMBIGUOUS` | 14 | 5 | 2 | `array` |
| `evidence_type` | `UNKNOWN_OR_AMBIGUOUS` | 13 | 13 | 1 | `string` |
| `source_notes` | `UNKNOWN_OR_AMBIGUOUS` | 12 | 12 | 1 | `string` |
| `source_text_zh` | `UNKNOWN_OR_AMBIGUOUS` | 11 | 11 | 1 | `array, string` |
| `source_condition_id` | `UNKNOWN_OR_AMBIGUOUS` | 10 | 10 | 1 | `string` |
| `_reference_note` | `UNKNOWN_OR_AMBIGUOUS` | 9 | 9 | 1 | `string` |
| `source_text_en` | `UNKNOWN_OR_AMBIGUOUS` | 9 | 9 | 1 | `string` |
| `authored_by_note_zh` | `UNKNOWN_OR_AMBIGUOUS` | 9 | 9 | 1 | `string` |
| `source_note_en` | `UNKNOWN_OR_AMBIGUOUS` | 8 | 8 | 1 | `string` |
| `herb_drug_interactions_graded` | `UNKNOWN_OR_AMBIGUOUS` | 8 | 8 | 1 | `array` |
| `reference_range` | `UNKNOWN_OR_AMBIGUOUS` | 7 | 7 | 1 | `object` |
| `american_dragon_status` | `UNKNOWN_OR_AMBIGUOUS` | 5 | 5 | 1 | `string` |
| `exam_importance_detail` | `UNKNOWN_OR_AMBIGUOUS` | 3 | 3 | 1 | `object` |
| `board_status_zh` | `UNKNOWN_OR_AMBIGUOUS` | 3 | 3 | 1 | `string` |
| `board_status_en` | `UNKNOWN_OR_AMBIGUOUS` | 3 | 3 | 1 | `string` |
| `source_notes_zh` | `UNKNOWN_OR_AMBIGUOUS` | 3 | 3 | 1 | `string` |
| `source_notes_en` | `UNKNOWN_OR_AMBIGUOUS` | 3 | 3 | 1 | `string` |
| `instrument_source` | `SOURCE_CITATION` | 3 | 3 | 1 | `object` |
| `source_difference_zh` | `UNKNOWN_OR_AMBIGUOUS` | 2 | 2 | 1 | `string` |
| `source_difference_en` | `UNKNOWN_OR_AMBIGUOUS` | 2 | 2 | 1 | `string` |
| `hierarchy_status` | `UNKNOWN_OR_AMBIGUOUS` | 2 | 2 | 1 | `array, string` |
| `safety_review` | `REVIEW_STATE` | 1 | 1 | 1 | `object` |
| `classic_formula_source_zh` | `UNKNOWN_OR_AMBIGUOUS` | 1 | 1 | 1 | `string` |
| `classic_formula_source_en` | `UNKNOWN_OR_AMBIGUOUS` | 1 | 1 | 1 | `string` |
| `herb_pair_source_note_zh` | `UNKNOWN_OR_AMBIGUOUS` | 1 | 1 | 1 | `string` |
| `herb_pair_source_note_en` | `UNKNOWN_OR_AMBIGUOUS` | 1 | 1 | 1 | `string` |
| `reference_dose_g` | `UNKNOWN_OR_AMBIGUOUS` | 1 | 1 | 1 | `string` |
| `reference` | `SOURCE_CITATION` | 1 | 1 | 1 | `string` |
| `reviewed_by` | `REVIEW_STATE` | 1 | 0 | 1 | `null` |
| `herb_drug_interaction_sources` | `SOURCE_CITATION` | 1 | 1 | 1 | `array` |
| `hierarchy_source_zh` | `UNKNOWN_OR_AMBIGUOUS` | 1 | 1 | 1 | `string` |
| `verified` | `VERIFICATION_STATE` | 1 | 1 | 1 | `string` |
| `source_hierarchy` | `SOURCE_CITATION` | 1 | 1 | 1 | `object` |
| `D_clinical_evidence` | `EVIDENCE_STRENGTH` | 1 | 1 | 1 | `string` |

---

## 3. 代碼消費與讀寫地圖（Writer / Reader / Consumer Map）

| 欄位名稱 | 語意類別 | 消費模式 | Runtime / UI 消費者 | 構建器 (Builders) | 驗證器 (Validators / CI) | 報告專用 |
|---|---|---|---|---|---|---|
| `review_status` | `REVIEW_STATE` | `COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `js/knowledge.js`, `js/practice-audit.js` | `scripts/build-pattern-alias-map.js` | `scripts/validate-acupoint-standard.js`, `scripts/validate-avs-library.js`, `scripts/validate-condition-standard.js` | `scripts/audit-cr010-condition-detail-maturity.js`, `scripts/audit-evidence-provenance-fragmentation.js` |
| `status` | `UNKNOWN_OR_AMBIGUOUS` | `COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `index.html`, `js/avs.js`, `js/care-draft.js`, `js/clinical-store.js`, `js/knowledge.js`, `legacy/index.html` | `scripts/build-cloudtcm-acupoint-map.js`, `scripts/build-cloudtcm-formula-map.js`, `scripts/build-content-quality-overlay.js`, `scripts/build-term-crosswalk.js` | `scripts/check-branch-mergeable.js`, `scripts/test-avs-checkout.js`, `scripts/test-branch-mergeable.js` | `scripts/audit-clinical-export-contract.js`, `scripts/audit-evidence-provenance-fragmentation.js` |
| `field_sources` | `SOURCE_CITATION` | `COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `js/knowledge.js` | `scripts/build-compare-with.js` | `scripts/test-pharm-negative-cases.js`, `scripts/validate-acupoint-standard.js`, `scripts/validate-condition-standard.js` | `scripts/audit-cr010-condition-detail-maturity.js`, `scripts/audit-evidence-provenance-fragmentation.js` |
| `sources` | `SOURCE_CITATION` | `COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `index.html`, `js/knowledge.js`, `js/router.js`, `legacy/index.html` | `scripts/build-data.js`, `scripts/build-entity-registry.js` | `scripts/test-pharm-negative-cases.js`, `scripts/validate-condition-sources.js`, `scripts/validate-condition-standard.js` | `scripts/audit-cr010-condition-detail-maturity.js`, `scripts/audit-evidence-provenance-fragmentation.js` |
| `source` | `SOURCE_CITATION` | `COPIES_THROUGH, DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `index.html`, `js/avs.js`, `js/knowledge.js`, `js/practice-audit.js`, `legacy/index.html` | `scripts/build-pattern-alias-map.js` | `scripts/test-practice-audit.js`, `scripts/validate-condition-standard.js`, `scripts/validate-herb-dosage-shape.js` | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/audit-legacy-namespace-retired-id.js` |
| `evidence` | `EVIDENCE_STRENGTH` | `DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `index.html`, `js/knowledge.js`, `legacy/index.html` | 無 | `scripts/validate-acupoint-standard.js`, `scripts/validate-b123-legacy-migration.js`, `scripts/validate-condition-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/audit-validator-coverage-truth.js` |
| `origin` | `PROVENANCE` | `COPIES_THROUGH, DISPLAYS, READS_VALUE, WRITES` | `app.js` | `scripts/build-compare-with.js`, `scripts/build-data.js` | `scripts/check-branch-mergeable.js`, `scripts/test-branch-mergeable.js`, `scripts/validate-b123-legacy-migration.js` | `scripts/audit-clinical-export-contract.js`, `scripts/audit-evidence-provenance-fragmentation.js` |
| `source_urls` | `SOURCE_LOCATOR` | `DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `js/knowledge.js` | 無 | `scripts/validate-condition-standard.js`, `scripts/validate-formula-quality-strict.js`, `scripts/validate-herb-card-schema.js` | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/audit-herb-cloudtcm-layer.js` |
| `authored_by` | `AUTHORSHIP` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | 無 | `scripts/validate-comparison-standard.js`, `scripts/validate-condition-standard.js`, `scripts/validate-pattern-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/audit-herb-cloudtcm-layer.js` |
| `source_type` | `PROVENANCE` | `READS_VALUE, WRITES` | 無 | 無 | `scripts/validate-condition-standard.js`, `scripts/validate-formula-quality-strict.js`, `scripts/validate-herb-quality-strict.js` | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/audit-herb-cloudtcm-layer.js` |
| `source_status` | `VERIFICATION_STATE` | `DISPLAYS, READS_VALUE, WRITES` | `app.js` | 無 | `scripts/validate-condition-standard.js`, `scripts/validate-formula-dose-staging.js`, `scripts/validate-herb-canon.js` | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/audit-legacy-namespace-retired-id.js` |
| `exact_source_url` | `SOURCE_LOCATOR` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | 無 | `scripts/validate-condition-standard.js`, `scripts/validate-formula-quality-strict.js`, `scripts/validate-herb-quality-strict.js` | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/audit-herb-cloudtcm-layer.js` |
| `exam_importance` | `EVIDENCE_STRENGTH` | `DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `js/knowledge.js` | 無 | `scripts/validate-extra-point-standard.js`, `scripts/validate-herb-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/audit-herb-cloudtcm-layer.js` |
| `source_url` | `SOURCE_LOCATOR` | `COPIES_THROUGH, READS_VALUE, TRANSFORMS` | `js/knowledge.js` | `scripts/build-cloudtcm-ref-map.js` | `scripts/validate-cloudtcm-vocabularies.js`, `scripts/validate-gyn-legacy-migration.js` | `scripts/report-361-encoding-findings.js`, `scripts/report-cloudtcm-buildout.js` |
| `url` | `UNKNOWN_OR_AMBIGUOUS` | `DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `js/knowledge.js` | 無 | `scripts/validate-formula-dose-staging.js`, `scripts/validate-supp-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/audit-legacy-namespace-retired-id.js` |
| `cloudtcm_url` | `SOURCE_LOCATOR` | `DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `js/knowledge.js` | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/audit-herb-cloudtcm-layer.js` |
| `card_grade` | `EVIDENCE_STRENGTH` | `DISPLAYS, READS_VALUE, WRITES` | `app.js` | 無 | `scripts/validate-herb-integrity-predicates.js`, `scripts/validate-herb-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/audit-herb-cloudtcm-layer.js` |
| `acupoint_protocols` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | 無 | `scripts/validate-condition-standard.js`, `scripts/validate-no-template-protocol.js`, `scripts/validate-protocol-evidence-render.js` | `scripts/audit-cr010-condition-detail-maturity.js` |
| `provenance_status` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, WRITES` | 無 | 無 | `scripts/validate-b123-legacy-migration.js`, `scripts/validate-gyn-legacy-migration.js`, `scripts/validate-red-flag-registry.js` | 無 |
| `source_citations` | `SOURCE_CITATION` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | `scripts/validate-herb-standard.js` | `scripts/audit-herb-cloudtcm-layer.js`, `scripts/audit-legacy-namespace-retired-id.js` |
| `protocol_status` | `REVIEW_STATE` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | `scripts/validate-condition-standard.js`, `scripts/validate-protocol-evidence-render.js` | `scripts/audit-evidence-provenance-fragmentation.js` |
| `verification_status` | `VERIFICATION_STATE` | `READS_VALUE, WRITES` | 無 | 無 | `scripts/test-pharm-negative-cases.js`, `scripts/test-pharm-source-integrity-negative-cases.js`, `scripts/validate-pharm-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js` |
| `source_hint` | `PROVENANCE` | `READS_VALUE, WRITES` | 無 | 無 | `scripts/validate-herb-canon.js` | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/report-formula-content-gaps.js` |
| `safety_source_url` | `SOURCE_LOCATOR` | `READS_VALUE, WRITES` | 無 | 無 | `scripts/validate-herb-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/audit-herb-cloudtcm-layer.js` |
| `american_dragon_url` | `SOURCE_LOCATOR` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/report-formula-completeness.js` |
| `source_classic` | `SOURCE_CITATION` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | 無 | `scripts/validate-formula-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js` |
| `reviewed_by` | `REVIEW_STATE` | `READS_VALUE, WRITES` | 無 | 無 | `scripts/test-pharm-negative-cases.js`, `scripts/validate-pharm-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js` |
| `image_url` | `SOURCE_LOCATOR` | `COPIES_THROUGH, READS_VALUE` | 無 | `scripts/build-cloudtcm-ref-map.js` | `scripts/validate-cloudtcm-vocabularies.js` | `scripts/audit-legacy-namespace-retired-id.js` |
| `classical_references_zh` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | 無 | `scripts/validate-condition-standard.js`, `scripts/validate-tdis-standard.js` | 無 |
| `acupoint_protocol_evidence` | `EVIDENCE_STRENGTH` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | 無 | `scripts/validate-condition-standard.js`, `scripts/validate-protocol-evidence-render.js` | 無 |
| `evidence_note_zh` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | `scripts/validate-condition-standard.js`, `scripts/validate-protocol-evidence-render.js` | 無 |
| `classical_source` | `SOURCE_CITATION` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | 無 | `scripts/validate-tdis-standard.js` | `scripts/audit-legacy-namespace-retired-id.js` |
| `reviewStatus` | `UNKNOWN_OR_AMBIGUOUS` | `DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `js/review.js` | 無 | `scripts/validate-extra-point-standard.js` | 無 |
| `source_condition_id` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | `scripts/validate-relations.js` | `scripts/report-comparison-fill.js` |
| `verified` | `VERIFICATION_STATE` | `READS_VALUE` | 無 | 無 | `scripts/validate-comparison-standard.js`, `scripts/validate-supp-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js` |
| `interpretation_status` | `UNKNOWN_OR_AMBIGUOUS` | `DISPLAYS, READS_VALUE, TRANSFORMS, WRITES` | `app.js`, `js/practice-audit.js` | 無 | `scripts/validate-metric-interpretation.js` | 無 |
| `reference_range` | `UNKNOWN_OR_AMBIGUOUS` | `DISPLAYS, READS_VALUE, TRANSFORMS` | `app.js`, `js/practice-audit.js` | 無 | `scripts/validate-metric-interpretation.js` | 無 |
| `safety_source` | `SOURCE_CITATION` | `READS_VALUE, WRITES` | 無 | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js`, `scripts/report-herb-caution-conflicts.js` |
| `import_artifacts` | `IMPORT_HISTORY` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | `scripts/validate-condition-standard.js` | 無 |
| `last_reviewed` | `REVIEW_STATE` | `NONE` | 無 | 無 | `scripts/validate-clinical-case-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js` |
| `course_level_en` | `EVIDENCE_STRENGTH` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js` |
| `formula_song_source_zh` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | 無 | `scripts/validate-formula-song.js` | 無 |
| `herb_drug_interaction_sources` | `SOURCE_CITATION` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js` |
| `content_source` | `AUTHORSHIP` | `WRITES` | 無 | 無 | `scripts/validate-condition-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js` |
| `differentiation_preview_zh` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | `scripts/validate-pattern-standard.js` | 無 |
| `differentiation_preview_en` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | `scripts/validate-pattern-standard.js` | 無 |
| `level` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, WRITES` | 無 | 無 | `scripts/validate-comparison-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js` |
| `diagram_urls_en` | `SOURCE_LOCATOR` | `DISPLAYS, READS_VALUE, WRITES` | `app.js` | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js` |
| `diagram_urls_zh` | `SOURCE_LOCATOR` | `DISPLAYS, READS_VALUE` | `app.js` | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js` |
| `exam_importance_en` | `UNKNOWN_OR_AMBIGUOUS` | `DISPLAYS, READS_VALUE` | `app.js` | 無 | `scripts/validate-extra-point-standard.js` | 無 |
| `safety_review_sources` | `SOURCE_CITATION` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | `scripts/validate-symptom-standard.js` | 無 |
| `medlineplus_url` | `SOURCE_LOCATOR` | `READS_VALUE, WRITES` | 無 | 無 | `scripts/test-pharm-source-integrity-negative-cases.js`, `scripts/validate-pharm-standard.js` | 無 |
| `dose_source` | `SOURCE_CITATION` | `READS_VALUE` | 無 | 無 | `scripts/validate-supp-standard.js` | `scripts/audit-evidence-provenance-fragmentation.js` |
| `evidence_snapshot_en` | `UNKNOWN_OR_AMBIGUOUS` | `DISPLAYS, READS_VALUE` | `app.js` | 無 | `scripts/validate-supp-standard.js` | 無 |
| `evidence_type` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS` | `js/avs.js` | 無 | `scripts/validate-avs-library.js` | 無 |
| `modern_functions_source_url` | `SOURCE_LOCATOR` | `READS_VALUE, WRITES` | 無 | 無 | 無 | `scripts/audit-herb-cloudtcm-layer.js` |
| `safety_review_pending` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | 無 | 無 |
| `atlas_url` | `SOURCE_LOCATOR` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | 無 | 無 | 無 |
| `atlas_link_status` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | 無 | 無 | 無 |
| `original_shape` | `PROVENANCE` | `NONE` | 無 | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js` |
| `source_field` | `PROVENANCE` | `NONE` | 無 | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js` |
| `property_channel_source_note_zh` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | `scripts/audit-herb-cloudtcm-layer.js` |
| `source_note_zh` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | `scripts/audit-herb-cloudtcm-layer.js` |
| `american_dragon_link_status` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS, WRITES` | `js/knowledge.js` | 無 | 無 | 無 |
| `review_notes_zh` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | `scripts/audit-herb-cloudtcm-layer.js` |
| `source_note` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, WRITES` | 無 | 無 | 無 | `scripts/audit-herb-cloudtcm-layer.js` |
| `safety_review` | `REVIEW_STATE` | `NONE` | 無 | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js` |
| `source_refs` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS` | `js/avs.js` | 無 | 無 | 無 |
| `reference` | `SOURCE_CITATION` | `READS_VALUE` | 無 | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js` |
| `source_id` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, WRITES` | 無 | 無 | `scripts/validate-cloudtcm-vocabularies.js` | 無 |
| `translation_status` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE` | 無 | 無 | `scripts/validate-cloudtcm-vocabularies.js` | 無 |
| `last_reviewed_at` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | `scripts/validate-pattern-standard.js` | 無 |
| `enrichment_status` | `UNKNOWN_OR_AMBIGUOUS` | `DISPLAYS, READS_VALUE, WRITES` | `app.js` | 無 | 無 | 無 |
| `examImportance` | `EVIDENCE_STRENGTH` | `DISPLAYS, READS_VALUE, WRITES` | `app.js` | 無 | 無 | 無 |
| `safety_review_status` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE` | 無 | 無 | `scripts/validate-symptom-standard.js` | 無 |
| `dailymed_url` | `SOURCE_LOCATOR` | `NONE` | 無 | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js` |
| `medlineplus_url_kind` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, WRITES` | 無 | 無 | `scripts/validate-pharm-standard.js` | 無 |
| `medlineplus_verified_on` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE` | 無 | 無 | `scripts/validate-pharm-standard.js` | 無 |
| `drug_interactions_graded` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | 無 | 無 |
| `herb_drug_interactions_graded` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, TRANSFORMS` | `js/knowledge.js` | 無 | 無 | 無 |
| `evidence_source` | `SOURCE_CITATION` | `READS_VALUE` | 無 | 無 | `scripts/validate-supp-standard.js` | 無 |
| `instrument_source` | `SOURCE_CITATION` | `READS_VALUE, TRANSFORMS` | `js/practice-audit.js` | 無 | 無 | 無 |
| `source_hierarchy` | `SOURCE_CITATION` | `NONE` | 無 | 無 | 無 | `scripts/audit-evidence-provenance-fragmentation.js` |
| `functions_zh_source` | `SOURCE_CITATION` | `READS_VALUE, WRITES` | 無 | 無 | 無 | 無 |
| `modern_functions_source` | `SOURCE_CITATION` | `READS_VALUE, WRITES` | 無 | 無 | 無 | 無 |
| `source_note_en` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `exam_importance_detail` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `board_status_zh` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `board_status_en` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `source_difference_zh` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `source_difference_en` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `source_notes_zh` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `source_notes_en` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `classic_formula_source_zh` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `classic_formula_source_en` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `herb_pair_source_note_zh` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `herb_pair_source_note_en` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `cloudtcm_link_status` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `american_dragon_status` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `reference_dose_g` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `tags_source_url` | `SOURCE_LOCATOR` | `READS_VALUE, WRITES` | 無 | 無 | 無 | 無 |
| `_reference_note` | `UNKNOWN_OR_AMBIGUOUS` | `WRITES` | 無 | 無 | 無 | 無 |
| `source_text_zh` | `UNKNOWN_OR_AMBIGUOUS` | `WRITES` | 無 | 無 | 無 | 無 |
| `source_text_en` | `UNKNOWN_OR_AMBIGUOUS` | `WRITES` | 無 | 無 | 無 | 無 |
| `unsourced_claims_quarantine` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `composition_source_note_zh` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, WRITES` | 無 | 無 | 無 | 無 |
| `hierarchy_status` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `hierarchy_source_zh` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `no_source_found` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE` | 無 | 無 | 無 | 無 |
| `evidence_note_en` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `source_date` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `authored_by_note_zh` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, WRITES` | 無 | 無 | 無 | 無 |
| `source_batch` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE` | 無 | 無 | 無 | 無 |
| `provenance_review` | `UNKNOWN_OR_AMBIGUOUS` | `READS_VALUE, WRITES` | 無 | 無 | 無 | 無 |
| `dailymed_url_kind` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `rx_otc_status` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `source_notes` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `related_drugclass_review_flags` | `UNKNOWN_OR_AMBIGUOUS` | `NONE` | 無 | 無 | 無 | 無 |
| `D_clinical_evidence` | `EVIDENCE_STRENGTH` | `NONE` | 無 | 無 | 無 | 無 |

---

## 4. 欄位重疊與片段化矩陣（Fragmentation / Overlap Matrix）

針對系統中共存之多重來源與審查欄位進行機械性比對與分類：

| 比對欄位對 (Field Pair) | 共存資料庫 (Coexisting Datasets) | 共存記錄數 (Coexisting Records) | 判定分類 (Classification) | 機械判定依據 (Rationale) |
|---|---|---|---|---|
| **sources vs field_sources** | `acupoints_361, condition_canon, extra_points, pattern_library, pharm_drug_classes, symptoms, tdis_registry` | 1021 | `PARTIAL_OVERLAP` | Fields share semantic category and consumers, but exhibit differing occupancy or coverage scopes. |
| **content_source vs authored_by** | `condition_canon` | 99 | `PARTIAL_OVERLAP` | Fields share semantic category and consumers, but exhibit differing occupancy or coverage scopes. |
| **review_status vs source_status** | `acupoints_361, condition_canon, formulas, herbs` | 618 | `CLEARLY_DISTINCT` | Fields serve different semantic dimensions (REVIEW_STATE vs VERIFICATION_STATE). |
| **exact_source_url vs safety_source_url** | `formulas, herbs` | 399 | `PARTIAL_OVERLAP` | Fields share semantic category and consumers, but exhibit differing occupancy or coverage scopes. |
| **cloudtcm_url vs american_dragon_url** | `formulas, herbs` | 364 | `PARTIAL_OVERLAP` | Fields share semantic category and consumers, but exhibit differing occupancy or coverage scopes. |
| **dose_source vs sources** | `supplements` | 36 | `PARTIAL_OVERLAP` | Fields share semantic category and consumers, but exhibit differing occupancy or coverage scopes. |
| **evidence vs sources** | `acupoints_361, auricular_points, condition_canon, extra_points` | 646 | `CLEARLY_DISTINCT` | Fields serve different semantic dimensions (EVIDENCE_STRENGTH vs SOURCE_CITATION). |
| **exam_importance vs card_grade** | `herbs` | 173 | `PARTIAL_OVERLAP` | Fields share semantic category and consumers, but exhibit differing occupancy or coverage scopes. |

---

## 5. 暗數據與空欄位清單（Dead / Dark Evidence Fields）

### A. 正典有資料但代碼無消費者 (`DATA_PRESENT_NO_CONSUMER_FOUND`)
- `functions_zh_source`: **199** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `modern_functions_source`: **199** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `source_note_en`: **8** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `exam_importance_detail`: **3** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `board_status_zh`: **3** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `board_status_en`: **3** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `source_difference_zh`: **2** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `source_difference_en`: **2** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `source_notes_zh`: **3** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `source_notes_en`: **3** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `classic_formula_source_zh`: **1** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `classic_formula_source_en`: **1** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `herb_pair_source_note_zh`: **1** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `herb_pair_source_note_en`: **1** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `cloudtcm_link_status`: **25** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `american_dragon_status`: **5** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `reference_dose_g`: **1** 筆非空記錄（分佈於: `herbs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `tags_source_url`: **94** 筆非空記錄（分佈於: `formulas`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `_reference_note`: **9** 筆非空記錄（分佈於: `formulas`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `source_text_zh`: **11** 筆非空記錄（分佈於: `formulas`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `source_text_en`: **9** 筆非空記錄（分佈於: `formulas`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `unsourced_claims_quarantine`: **21** 筆非空記錄（分佈於: `formulas`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `composition_source_note_zh`: **42** 筆非空記錄（分佈於: `formulas`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `hierarchy_status`: **2** 筆非空記錄（分佈於: `formulas`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `hierarchy_source_zh`: **1** 筆非空記錄（分佈於: `formulas`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `no_source_found`: **133** 筆非空記錄（分佈於: `condition_canon`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `source_date`: **190** 筆非空記錄（分佈於: `cloudtcm_diseases`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `authored_by_note_zh`: **9** 筆非空記錄（分佈於: `comparisons`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `source_batch`: **95** 筆非空記錄（分佈於: `red_flag_registry`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `provenance_review`: **95** 筆非空記錄（分佈於: `red_flag_registry`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `dailymed_url_kind`: **59** 筆非空記錄（分佈於: `pharm_drugs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `rx_otc_status`: **34** 筆非空記錄（分佈於: `pharm_drugs`），目前無任何 UI/Runtime/Builder/Validator 讀取。
- `source_notes`: **12** 筆非空記錄（分佈於: `western_medications`），目前無任何 UI/Runtime/Builder/Validator 讀取。
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
| `outcome_metrics` | **27** | 0 (0%) | 20 (74%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | **7** (26%) |
| `avs_advice_library` | **13** | 0 (0%) | 0 (0%) | 0 (0%) | 13 (100%) | 0 (0%) | 0 (0%) | **0** (0%) |
| `content_quality` | **1** | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | **1** (100%) |
| `formula_hdi_review` | **1** | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | **1** (100%) |
| `source_registry` | **1** | 0 (0%) | 1 (100%) | 0 (0%) | 0 (0%) | 0 (0%) | 0 (0%) | **0** (0%) |

---

## 7. 隱含優先序鏈路（Consumer Precedence Chains / SSOT Shadowing）

程式碼中發現之多來源 Fallback 優先序鏈路（高優先級欄位存在時會遮蔽次要欄位）：

1. **`app.js:324`**:
   - 運算式: `needs_review: (point) => point.reviewStatus === "placeholder" || point.reviewStatus === "index_only",`
   - 優先順序: **[1]** `needs_review: (point) => point.reviewStatus === "placeholder"` $\rightarrow$ **[2]** `point.reviewStatus === "index_only",`

2. **`app.js:332`**:
   - 運算式: `missing_sources: (point) => !(point.sources || []).length,`
   - 優先順序: **[1]** `missing_sources: (point) => !(point.sources` $\rightarrow$ **[2]** `[]).length,`

3. **`app.js:414`**:
   - 運算式: `evidence: record.evidence || "",`
   - 優先順序: **[1]** `evidence: record.evidence` $\rightarrow$ **[2]** `"",`

4. **`app.js:439`**:
   - 運算式: `examImportance: record.exam_importance || "",`
   - 優先順序: **[1]** `examImportance: record.exam_importance` $\rightarrow$ **[2]** `"",`

5. **`app.js:440`**:
   - 運算式: `examImportanceEn: record.exam_importance_en || "",`
   - 優先順序: **[1]** `examImportanceEn: record.exam_importance_en` $\rightarrow$ **[2]** `"",`

6. **`app.js:473`**:
   - 運算式: `cloudtcmUrl: record.cloudtcm_url || "",`
   - 優先順序: **[1]** `cloudtcmUrl: record.cloudtcm_url` $\rightarrow$ **[2]** `"",`

7. **`app.js:474`**:
   - 運算式: `reviewStatus: record.review_status || "draft",`
   - 優先順序: **[1]** `reviewStatus: record.review_status` $\rightarrow$ **[2]** `"draft",`

8. **`app.js:475`**:
   - 運算式: `sourceStatus: record.source_status || "sourced_cloudtcm_record",`
   - 優先順序: **[1]** `sourceStatus: record.source_status` $\rightarrow$ **[2]** `"sourced_cloudtcm_record",`

9. **`app.js:476`**:
   - 運算式: `enrichmentStatus: record.enrichment_status || "",`
   - 優先順序: **[1]** `enrichmentStatus: record.enrichment_status` $\rightarrow$ **[2]** `"",`

10. **`app.js:477`**:
   - 運算式: `fieldSources: record.field_sources || {},`
   - 優先順序: **[1]** `fieldSources: record.field_sources` $\rightarrow$ **[2]** `{},`

11. **`app.js:478`**:
   - 運算式: `sources: record.sources || (record.cloudtcm_url ? [record.cloudtcm_url] : []),`
   - 優先順序: **[1]** `sources: record.sources` $\rightarrow$ **[2]** `(record.cloudtcm_url ? [record.cloudtcm_url] : []),`

12. **`app.js:531`**:
   - 運算式: `diagramUrlsEn: record.diagram_urls_en || [],`
   - 優先順序: **[1]** `diagramUrlsEn: record.diagram_urls_en` $\rightarrow$ **[2]** `[],`

13. **`app.js:532`**:
   - 運算式: `diagramUrlsZh: record.diagram_urls_zh || [],`
   - 優先順序: **[1]** `diagramUrlsZh: record.diagram_urls_zh` $\rightarrow$ **[2]** `[],`

14. **`app.js:533`**:
   - 運算式: `sourceProvenanceNoteZh: record.source_provenance_note_zh || "",`
   - 優先順序: **[1]** `sourceProvenanceNoteZh: record.source_provenance_note_zh` $\rightarrow$ **[2]** `"",`

15. **`app.js:534`**:
   - 運算式: `reviewStatus: record.review_status || "sourced_tung_record",`
   - 優先順序: **[1]** `reviewStatus: record.review_status` $\rightarrow$ **[2]** `"sourced_tung_record",`

16. **`app.js:535`**:
   - 運算式: `sources: record.source_urls || ["https:`
   - 優先順序: **[1]** `sources: record.source_urls` $\rightarrow$ **[2]** `["https:`

17. **`app.js:578`**:
   - 運算式: `reviewStatus: record.review_status || "index_only",`
   - 優先順序: **[1]** `reviewStatus: record.review_status` $\rightarrow$ **[2]** `"index_only",`

18. **`app.js:687`**:
   - 運算式: `source: link.source || "eLotus CORE / GB93"`
   - 優先順序: **[1]** `source: link.source` $\rightarrow$ **[2]** `"eLotus CORE / GB93"`

19. **`app.js:720`**:
   - 運算式: `source: link.source || "MasterTungAcupuncture.org"`
   - 優先順序: **[1]** `source: link.source` $\rightarrow$ **[2]** `"MasterTungAcupuncture.org"`

20. **`app.js:723`**:
   - 運算式: `const directSources = (record.source_urls || [])`
   - 優先順序: **[1]** `const directSources = (record.source_urls` $\rightarrow$ **[2]** `[])`


---

## 8. 生成包生命週期行為（Generated-Data Behavior）

- **構建入口**: `scripts/build-data.js`
- **原樣保留進生成包**: `review_status`, `authored_by`, `sources`, `field_sources`, `evidence`, `exam_importance`, `exact_source_url`, `source_classic`, `source_status`, `card_grade`, `cloudtcm_url`
- **構建期轉換/合成**:
  - formulaHdiReview (hashed with sha1 to filter verified_texts)
  - redFlagRegistry (resolved wired vs unwired red_flag_record_ids into conditionCanon/tdisRegistry)
  - cloudtcmRefMap (joined into canonical records via build-cloudtcm-ref-map.js)
- **裁切/過濾行為**:
  - 254 embedded point records with standard 361 codes pruned by build-data.js
  - non-eligible HDI texts pruned from runtime display

---
