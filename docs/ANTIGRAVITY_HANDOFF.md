# Antigravity Content Import Handoff

## Active Handoff Entry: 2026-07-23 — Safety Fill + Acupoint Full Enrichment

- **Status**: **PASSED & COMMITTED** (all 3 domains)
- **Agent**: Antigravity Content Import Agent — **Claude Sonnet 4.6 (Thinking)**
- **Branch**: `antigravity/content-fill`
- **Latest Commits**:
  - `868fd02` — Enrich 361/361 acupoints from CloudTCM (9 fields per point)
  - `daf695a` — CloudTCM acupoint URL map (363 points)
  - `82c3db6` — Formula Cautions fill (83/115)
  - `fe9fc82` — Single herb Caution fill (199/202)
  - `539c374` — Single herb functions fill (201/202)

### Domain Summary

| Domain | Records | Fields Added | Commit |
|--------|---------|--------------|--------|
| 中藥 Single Herbs | 199/202 | `cautions_zh`, `safety_source_url` from `pageData.Caution` | `fe9fc82` |
| 方劑 Formulas | 83/115 | `cautions_zh`, `pharmacology_zh` from `pageData.Cautions` | `82c3db6` |
| 穴位 Acupoints | 361/361 | `cautions_zh`, `acumethod_zh`, `cloudtcm_detail`, `combine_points_zh`, `anatomy_zh`, `moxa_zh`, `massage_zh`, `classical_refs`, `acu_tags` | `868fd02` |

### Key Design Decisions

- Each domain uses its own CloudTCM field: herbs → `Caution`, formulas → `Cautions`, acupoints → `Caution` + 8 more fields
- CloudTCM code system mapped: `DU→GV`, `REN→CV`, `SJ→TE`, `LV→LR`, leading zeros stripped
- No template fallback — if CloudTCM field is null/empty, stored as `null`, not guessed

### Validation Results

All validators passed on `868fd02`:
- `validate-data.js` → PASS (361 records intact, needling/location/nameZh all non-empty)
- `validate-interactions.js` → PASS (0 warnings, 0 failures)
- `validate-relations.js` → PASS
- `validate-point-ids.js` → PASS (681 total default points)
- `validate-herb-quality-strict.js` → PASS (0 template artifacts)
- `validate-herb-canon.js` → PASS (202 herbs, 34 categories)
- `validate-formula-quality-strict.js` → PASS (115 formulas)

### What Ting Should Manually Test

1. Open a few acupoints in-app → check 刺法/安全 sections show real CloudTCM text
2. Open 附子 herb → `cautions_zh` should show 10 items including 烏頭鹼中毒劑量
3. Open 麻黃湯 formula → `cautions_zh` should show classical Shang Han Lun restriction text
4. Open SP6/三陰交 → should show pregnancy caution from CloudTCM

### Next Recommended Actions

1. Wire `cautions_zh`, `acumethod_zh`, `combine_points_zh`, `moxa_zh`, `massage_zh`, `classical_refs`, `acu_tags` into the acupoint detail UI view
2. Wire `cautions_zh` into herb and formula detail cards
3. Fill pathology conditions (`data/pathology/condition_canon_shortlist.json`) — this domain not yet started

---

### What Changed & Why

Ting flagged that the previous `safety_flags` content (e.g. "Review excess pathogens, hypertension/insomnia for stimulating tonics, pregnancy...") was category-level template boilerplate, not real herb-specific cautions. CloudTCM has per-herb 注意事項 pages with numbered contraindication items. This pass scrapes `pageData.Caution` from each herb's exact record page and stores the parsed items in `cautions_zh`.

### Sample Verified Output

| Herb | CloudTCM URL | Caution items |
|------|-------------|---------------|
| 附子 | cloudtcm.com/herb/1037 | 10 items incl. 烏頭鹼中毒劑量 (0.2mg toxic, 3-5mg lethal) |
| 麻黃 | cloudtcm.com/herb/1 | 9 items incl. 孕婦慎用, 心血管疾病, 失眠 |
| 山藥 | cloudtcm.com/herb/1162 | 5 items — matches CloudTCM display exactly |
| 甘草 | cloudtcm.com/herb/4 | 6 items incl. 反京大戟、芫花、甘遂 |
| 大黃 | cloudtcm.com/herb/1002 | 7 items incl. 孕婦、哺乳婦女、腸道梗阻 |

---

## Committed Entry: 2026-07-23 — Herb Functions Fill (HerbTagAnalysisCH_JSON)

- **Status**: **PASSED & COMMITTED**
- **Agent**: Antigravity Content Import Agent — Claude Sonnet 4.6 (Thinking)
- **Branch**: `antigravity/content-fill`
- **Commit Hash**: `539c374`
- **Task**: Fill `functions` array on all 202 single herbs from CloudTCM `HerbTagAnalysisCH_JSON` tag system
- **Result**: 201/202 herbs filled with real CloudTCM action tag names; 1 skipped (no URL match)
- **Validation**: `validate-herb-quality-strict.js` PASS, `validate-herb-canon.js` PASS, `validate-interactions.js` PASS

---

## Committed Entry: 2026-07-23 — Single Herbs Exact CloudTCM Import

- **Status**: **PASSED & COMMITTED**
- **Agent**: Antigravity Content Import Agent — Claude Sonnet 4.6 (Thinking)
- **Branch**: `antigravity/content-fill`
- **Commit Hash**: `3727665`
- **Task**: Populate 199/202 single herbs with exact CloudTCM record pages (taste/temp, channels, dosage, cautions, provenance)
- **Validation**: All validators PASS

---

## Committed Entry: 2026-07-23 — Exact CloudTCM Formula Import

- **Status**: **PASSED & COMMITTED**
- **Agent**: Antigravity Content Import Agent
- **Branch**: `antigravity/content-fill`
- **Commit Hash**: `9599b57b985ae0a56f6ed67aa9a8e0db43e498c8`
- **Domain Processed**: Herbal Formulas (方劑)
- **Data Files Modified**:
  - `data/herbs/formulas.json`
  - `data/imports/cloudtcm/formula_url_map.json`
- **Script Tools Added**:
  - `scripts/build-cloudtcm-formula-map.js`
  - `scripts/search-missing-cloudtcm-formulas.js`
  - `scripts/fetch-exact-cloudtcm-formulas.js`
  - `scripts/validate-formula-quality-strict.js`

### Content Import Summary

- **Total Formulas Processed**: 115
- **Exact CloudTCM Record Pages Matched & Sourced**: 94 formulas
- **Unmatched Formulas Kept as Baseline (null fields)**: 21 formulas
- **Status**: All records `review_status: "draft"`, `source_type: "sourced_cloudtcm_record"`

### Strict Quality & Provenance Validation

Passed `scripts/validate-formula-quality-strict.js` (0 errors):
- Zero `主藥` / `輔藥` placeholder herb names
- Zero `所主之證候` / `傳統所主` generic indication templates
- Zero category-generated dosage strings
- Zero search URLs or database root homepages
- Zero `???` or `待補` text fillers

---

## [REJECTED] Handoff Entry: 2026-07-22 — Pathology Conditions Content Fill Batch 3

- **Status**: **REJECTED & REVERTED** (Revert Commit `1823ee8`)
- **Agent**: Antigravity Content Import Agent
- **Reason for Rejection**:
  - 套用分類模板與預設字串冒充內容
  - 缺乏 CloudTCM/HKBU 精確紀錄頁連結
- **Original Commit**: `d329e397554ee5e15822384a29a4a75beec00049`

---

## [REJECTED] Handoff Entry: 2026-07-22 — Single Herbs Content Fill Batch 2

- **Status**: **REJECTED & REVERTED** (Revert Commit `1823ee8`)
- **Agent**: Antigravity Content Import Agent
- **Reason for Rejection**:
  - 按分類生成性味、劑量與禁忌（未逐味依真實來源填寫）
  - 使用「調理某藥相關證候」等模板冒充內容
  - 未使用 CloudTCM/HKBU 精確紀錄頁面
- **Original Commit**: `128198a287cba6848c1a6369c0d11ebf65e28453`

---

## [REJECTED] Handoff Entry: 2026-07-22 — Formula Content Fill Batch 1

- **Status**: **REJECTED & REVERTED** (Revert Commit `1823ee8`)
- **Agent**: Antigravity Content Import Agent
- **Reason for Rejection**:
  - 使用「主藥／輔藥」代替真實方劑組成
  - 使用「所主之證候」等模板冒充內容
  - 使用 CloudTCM 搜尋頁而非精確紀錄頁 (`/formula/<id>`)
- **Original Commit**: `7592818d46b57ff5e84c8017bf05b254f5c9f316`
