# Antigravity Content Import Handoff

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

---

## Active Plan: Precise CloudTCM Scraper & Strict Quality Validator

1. **Scraper**: Fetch exact CloudTCM record pages (e.g. `https://cloudtcm.com/formula/<numeric_id>`).
2. **5-Formula Test Run**: Verify 5 formulas end-to-end to ensure exact fields (composition with exact herbs/doses, actions, indications, cautions, source URL, fetch date).
3. **Full 115 Formula Import**: Execute scraper across all 115 formulas, saving exact source URLs and fetch dates without fallback templates or placeholders.
4. **Strict Validator**: Reject `主藥`, `輔藥`, `所主之證候`, `調理`, category-generated doses, `/search?` URLs, and `???`.
