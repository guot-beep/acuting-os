# Antigravity Content Import Handoff

## Active Handoff Entry: 2026-07-23 - Exact CloudTCM Record Import (Formulas Batch 1 Re-execution)

- **Status**: **PASSED & COMMITTED**
- **Agent**: Antigravity Content Import Agent
- **Branch**: `antigravity/content-fill`
- **Commit Hash**: `9599b57b985ae0a56f6ed67aa9a8e0db43e498c8`
- **Domain Processed**: Herbal Formulas (方劑)
- **Data Files Modified**:
  - `data/herbs/formulas.json` (canonical formula database)
  - `data/imports/cloudtcm/formula_url_map.json` (exact page URL mapping table)
- **Script Tools Added**:
  - `scripts/build-cloudtcm-formula-map.js` (scans & maps exact CloudTCM record URLs)
  - `scripts/search-missing-cloudtcm-formulas.js` (queries missing formula names)
  - `scripts/fetch-exact-cloudtcm-formulas.js` (parses exact record pages and saves provenance)
  - `scripts/validate-formula-quality-strict.js` (strict anti-template quality validator)

### Content Import Summary

- **Total Formulas Processed**: 115
- **Exact CloudTCM Record Pages Matched & Sourced**: 94 formulas
- **Unmatched Formulas Kept as Baseline (null fields)**: 21 formulas (no fallback templates or guessed roles generated)
- **Status of Records**: All updated records set to `review_status: "draft"`, `public_safe: false`, `source_type: "sourced_cloudtcm_record"`.
- **Provenanced Data Saved per Formula**:
  - `exact_source_url`: Exact CloudTCM page URL (`https://cloudtcm.com/formula/<numeric_id>`)
  - `fetched_at`: ISO timestamp string (`2026-07-23T00:08:20.000Z`)
  - `composition`: Real herb CJK names, real gram dosages (`9g`, `6g`, etc.), and herb-specific elucidations directly from CloudTCM record pages. `role_zh` left as `null` when not explicitly stated in source (zero guessing).
  - `source_classic`: Exact classical text title (e.g. `《傷寒論》`, `《金匱要略》`)
  - `actions_zh` & `pattern_indications_zh`: Authentic action and indication sentences parsed directly from the CloudTCM record page
  - `contraindications_zh`: Authentic caution and contraindication text parsed directly from the CloudTCM record page

### Strict Quality & Provenance Validation

Passed `scripts/validate-formula-quality-strict.js` (0 errors):
- Zero `主藥` / `輔藥` placeholder herb names
- Zero `所主之證候` / `傳統所主` generic indication templates
- Zero category-generated dosage strings
- Zero search URLs (`/search?query=`) or database root homepages (`https://cloudtcm.com/formula`)
- Zero `???` or `待補` text fillers

### Standard Validation Suite

All 8 standard repository validators passed cleanly:
1. `node scripts/validate-data.js` -> PASS
2. `node scripts/validate-interactions.js` -> PASS
3. `node scripts/validate-relations.js` -> PASS
4. `node scripts/validate-herbal-links.js` -> PASS
5. `node scripts/validate-herb-canon.js` -> PASS
6. `node scripts/validate-point-ids.js` -> PASS
7. `node scripts/validate-naming.js` -> PASS
8. `node scripts/validate-point-categories.js` -> PASS

---

## [REJECTED] Handoff Entry: 2026-07-22 - Pathology Conditions Content Fill Batch 3

- **Status**: **REJECTED & REVERTED** (Revert Commit `1823ee8`)
- **Agent**: Antigravity Content Import Agent
- **Reason for Rejection**:
  - 套用分類模板與預設字串冒充內容
  - 缺乏 CloudTCM/HKBU 精確紀錄頁連結
- **Original Commit**: `d329e397554ee5e15822384a29a4a75beec00049`

---

## [REJECTED] Handoff Entry: 2026-07-22 - Single Herbs Content Fill Batch 2

- **Status**: **REJECTED & REVERTED** (Revert Commit `1823ee8`)
- **Agent**: Antigravity Content Import Agent
- **Reason for Rejection**:
  - 按分類生成性味、劑量與禁忌（未逐味依真實來源填寫）
  - 使用「調理某藥相關證候」等模板冒充內容
  - 未使用 CloudTCM/HKBU 精確紀錄頁面
- **Original Commit**: `128198a287cba6848c1a6369c0d11ebf65e23ca6`

---

## [REJECTED] Handoff Entry: 2026-07-22 - Formula Content Fill Batch 1

- **Status**: **REJECTED & REVERTED** (Revert Commit `1823ee8`)
- **Agent**: Antigravity Content Import Agent
- **Reason for Rejection**:
  - 使用「主藥／輔藥」代替真實方劑組成
  - 使用「所主之證候」等模板冒充內容
  - 使用 CloudTCM 搜尋頁而非精確紀錄頁 (`/formula/<id>`)
- **Original Commit**: `7592818d46b57ff5e84c8017bf05b254f5c9f316`
