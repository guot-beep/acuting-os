# AcuTing OS — Validator Coverage Truth Table & Guard Gap Inventory

> **Audit Date**: 2026-08-26  
> **Repository**: [AcuTing OS](https://github.com/guot-beep/acuting-os)  
> **Nature**: READ-ONLY deterministic architectural guard audit  

---

## 執行摘要（Executive Summary）

- **全 Repo 腳本總數**：`366` 支
- **納管驗證/測試/稽核/報告腳本**：`95` 支
- **分類分布 (Taxonomy)**：
  - `UTILITY_OTHER`: 271
  - `AUDIT`: 5
  - `BLOCKING_VALIDATOR`: 66
  - `REHEARSAL_DASHBOARD`: 3
  - `REPORT`: 10
  - `TEST`: 9
  - `NONBLOCKING_VALIDATOR`: 2
- **CI 納管狀態 (CI Invocation Truth)**：
  - `CI_INVOKED` (直接在 CI 阻擋): 55
  - `TRANSITIVE_CI` (透過 Ratchet 等傳遞調用): 6
  - `ORPHAN_BLOCKING_VALIDATOR` (具 Fail-Closed 阻擋力但未進 CI): **13**
  - `INFORMATIONAL_CI_STEP` (在 CI 中作為報告/NOTE tier 執行): 5
  - `MANUAL_ONLY` (手動工具/輔助腳本): 287

---

## 四大核心專項問題回答（Special Invariant Questions）

### 1. Task 10A 盤點之 34 條 Active $\rightarrow$ Deprecated 引用，目前是否有 Validator 會擋？
- **判定結論**：**`GUARD_ABSENT`** (守衛完全缺失)
- **機制查證**：validate-relations.js, validate-condition-standard.js, validate-formula-standard.js, and validate-pattern-standard.js all collect lookup ID sets from target files without filtering by review_status. If the target record exists in data files, reference check returns true unconditionally.

### 2. D16 三個退役 Pattern（`insomnia_heart_kidney_disharmony`, `liver_fire_flaring`, `liver_wind_stirring`）是否有防線？是否進 CI？
- **判定結論**：**`GUARD_ABSENT`** (守衛完全缺失，未進 CI 阻擋)
- **機制查證**：The 3 retired patterns exist in pattern_library.json with review_status="deprecated". validate-condition-standard.js C6 populates patternIds from all records in pattern_library.json, thus permitting active conditions to link to them without defect.

### 3. D11 舊命名空間（`western_condition.*`, `eastern_disease.*`, `pat.*`, `symptom.*`）守護現況與 CI 狀態？
- **判定結論**：**`PARTIALLY_ENFORCED`** (分割守護 / 存在反向鎖定)
- **機制查證**：Modern canon files (condition_canon_shortlist.json, pattern_library.json) are guarded against pat.*, but legacy graph files are enforced to keep legacy prefixes by validate-relations.js in CI.
- **各 Validator 實況**：
  - `scripts/validate-condition-standard.js` (`CI_INVOKED`): C6 explicitly flags pat.* in condition related_patterns (D10). C3 enforces entity_type agreement on cond.*.
  - `scripts/validate-pattern-standard.js` (`TRANSITIVE_CI`): P3 explicitly flags pat.* in pattern records.
  - `scripts/validate-relations.js` (`CI_INVOKED`): Enforces western_condition.* and eastern_disease.* in legacy graph files (conditions.json) rather than migrating them.

### 4. 退役 Herb / Formula ID 是否有廣義防線防止 Active 關聯引用？
- **判定結論**：**`GUARD_ABSENT`** (守衛完全缺失)
- **機制查證**：validate-formula-standard.js F12 verifies composition herb_id against herb_canon_shortlist IDs without checking review_status="deprecated". validate-herb-standard.js does not check incoming composition links.

---

## 守衛缺口清冊（Guard Gap Inventory）

| 缺口 ID | 守護目標 / 決策 | 目前守衛狀態 | CI 狀態 | 缺口類型 | 事實佐證 |
|---|---|---|---|---|---|
| `GAP-01` | D6 / D16 Active -> Deprecated Reference Integrity (34 existing edges) | None (validate-relations.js and card validators ignore review_status) | `NO_GUARD` | `NO_GUARD` | 34 active -> deprecated edges exist in production data (condition -> pattern, formula -> herb, comparison -> pattern). No validator fails closed on these edges. |
| `GAP-02` | D16 Three Retired Pattern IDs (insomnia_heart_kidney_disharmony, liver_fire_flaring, liver_wind_stirring) | None (validate-condition-standard.js loads all pattern_library records into resolving set) | `NO_GUARD` | `NO_GUARD` | Active conditions in condition_canon_shortlist.json link to D16 retired pattern IDs without triggering any CI error. |
| `GAP-03` | D11 / D15 Legacy Graph Namespace Inversion in validate-relations.js | scripts/validate-relations.js | `CI_INVOKED` | `PARTIAL_SCOPE` | validate-relations.js asserts that IDs in conditions.json and clinical_graph_seed.json start with western_condition., eastern_disease., med. rather than canonical cond., tdis., drug. |
| `GAP-04` | Formula-Herb Composition Deprecated Target Protection | None (validate-formula-standard.js F12 accepts deprecated herb IDs) | `NO_GUARD` | `NO_GUARD` | validate-formula-standard.js F12 verifies herb_id against all herb_canon_shortlist records regardless of review_status. |
| `GAP-05` | 13 Orphan Blocking Validators Not Wired to CI | 13 scripts in scripts/validate-*.js and check-*.js | `ORPHAN_BLOCKING_VALIDATOR` | `MANUAL_ONLY_GUARD` | 13 fail-closed validators exist in scripts/ but are not executed in .github/workflows/validate.yml or check-validation-ratchet.js. |
| `GAP-06` | 4 NOTE Tier Informational Steps in CI Incapable of Failing Closed | validate-formula-composition-signatures.js, validate-formula-safety-predicates.js, validate-herb-integrity-predicates.js, validate-field-shape-consistency.js | `INFORMATIONAL_CI_STEP` | `POSSIBLE_FALSE_GREEN` | Steps execute in CI without --blocking flags; they report counts and always exit 0 despite backlogs. |
| `GAP-07` | D4 Clinical Free-Text De-Identification Discipline | validate-clinical-case-standard.js for tracked clinical JSON; free-text notes are unmonitored by code | `PARTIALLY_ENFORCED` | `DOCUMENTED_NON_MACHINE_ENFORCEABLE` | DECISIONS.md D4 explicitly documents: "Free-text discipline is a habit, not enforceable in code". |

---

## DECISIONS.md (D1–D21) 架構決策執行守護地圖

| 決策 | 標題 | 鎖定狀態 | 參照腳本 | 腳本存在 | CI 狀態 | 現況結果 | 守衛評級 |
|---|---|---|---|---|---|---|---|
| **D1** | IDs are opaque, immutable, decoupled from display | `LOCKED` | `scripts/check-canon-no-loss.js` | ✅ | `CI_INVOKED` | `GREEN` | `ENFORCED_IN_CI` |
| **D2** | Namespace the non-standard point families (ex.*, tung.*, ear.*) | `LOCKED` | `scripts/validate-point-ids.js` | ✅ | `CI_INVOKED` | `GREEN` | `ENFORCED_IN_CI` |
| **D3** | Formula/herb homonym disambiguation rule (__<source>) | `LOCKED` | `scripts/validate-naming.js` | ✅ | `TRANSITIVE_CI` | `GREEN` | `ENFORCED_IN_CI` |
| **D4** | De-identification is a habit, not just a schema (patient_code, no DOB, free-text discipline) | `LOCKED` | `scripts/validate-clinical-case-standard.js` | ✅ | `CI_INVOKED` | `GREEN` | `PARTIALLY_ENFORCED` |
| **D5** | Schema cardinality: choose MANY when in doubt (junction tables) | `LOCKED` | `scripts/validate-clinical-invariants.js` | ✅ | `CI_INVOKED` | `GREEN` | `ENFORCED_IN_CI` |
| **D6** | Knowledge records are never hard-deleted (review_status=deprecated, manifest) | `LOCKED` | `scripts/check-canon-no-loss.js` | ✅ | `CI_INVOKED` | `GREEN` | `ENFORCED_IN_CI` |
| **D7** | Storage split: JSON knowledge (git) + SQLite clinical (gitignored) | `LOCKED` | `.github/workflows/validate.yml` | ✅ | `CI_INVOKED` | `PASS` | `ENFORCED_IN_CI` |
| **D8** | Specialty is a cross-cutting domain TAG, never a container | `LOCKED` | `scripts/validate-condition-standard.js` | ✅ | `CI_INVOKED` | `GREEN` | `ENFORCED_IN_CI` |
| **D9** | Clinical usage stats: runtime by default, never a field inside canonical record | `LOCKED` | `scripts/validate-condition-standard.js` | ✅ | `CI_INVOKED` | `GREEN` | `ENFORCED_IN_CI` |
| **D10** | One pattern namespace: pattern.<english_slug> (retire pat.*) | `LOCKED` | `scripts/validate-condition-standard.js` | ✅ | `CI_INVOKED` | `GREEN` | `ENFORCED_IN_CI` |
| **D11** | Four canonical diagnostic namespaces (cond.*, tdis.*, pattern.*, sym.*) | `LOCKED` | `scripts/validate-condition-standard.js` | ✅ | `CI_INVOKED` | `GREEN` | `ENFORCED_IN_CI` |
| **D12** | Clinical-layer stability contract: additive-only from 2026-09-01 | `LOCKED` | `scripts/validate-clinical-case-standard.js` | ✅ | `CI_INVOKED` | `GREEN` | `PARTIALLY_ENFORCED` |
| **D13** | Every graph edge is stored on one side and derived on the other | `LOCKED` | `scripts/validate-relation-registry.js` | ✅ | `CI_INVOKED` | `GREEN` | `ENFORCED_IN_CI` |
| **D14** | Every namespace is built the same four ways (Vocab, Template, Validator, Staging) | `LOCKED` | `scripts/check-validation-ratchet.js` | ✅ | `CI_INVOKED` | `RED` | `ENFORCED_IN_CI` |
| **D15** | drug.* is the medication namespace (migrate med.*) | `LOCKED` | `scripts/validate-pharm-standard.js` | ✅ | `CI_INVOKED` | `GREEN` | `PARTIALLY_ENFORCED` |
| **D16** | Three duplicate-import Pattern IDs retired into canonical counterparts | `LOCKED` | `scripts/validate-pattern-standard.js` | ✅ | `TRANSITIVE_CI` | `GREEN` | `NO_MECHANICAL_GUARD_FOUND` |
| **D17** | Architecture Decision D17 | `NOT_DOCUMENTED` | `N/A` | ❌ | `NO_SCRIPT_REFERENCED` | `N/A` | `NO_MECHANICAL_GUARD_FOUND` |
| **D18** | Architecture Decision D18 | `NOT_DOCUMENTED` | `N/A` | ❌ | `NO_SCRIPT_REFERENCED` | `N/A` | `NO_MECHANICAL_GUARD_FOUND` |
| **D19** | Architecture Decision D19 | `NOT_DOCUMENTED` | `N/A` | ❌ | `NO_SCRIPT_REFERENCED` | `N/A` | `NO_MECHANICAL_GUARD_FOUND` |
| **D20** | Architecture Decision D20 | `NOT_DOCUMENTED` | `N/A` | ❌ | `NO_SCRIPT_REFERENCED` | `N/A` | `NO_MECHANICAL_GUARD_FOUND` |
| **D21** | Architecture Decision D21 | `NOT_DOCUMENTED` | `N/A` | ❌ | `NO_SCRIPT_REFERENCED` | `N/A` | `NO_MECHANICAL_GUARD_FOUND` |

---

## 孤立阻擋驗證器清冊（Orphan Blocking Validators）

以下 13 支驗證器具備 Fail-Closed 阻擋力（非 0 即 exit 1 / throw），但在 CI 與 Ratchet 中均未被調用：

1. `scripts/check-formula-no-loss.js`
2. `scripts/check-today-survives.js`
3. `scripts/validate-cloudtcm-vocabularies.js`
4. `scripts/validate-condition-sources.js`
5. `scripts/validate-content-quality.js`
6. `scripts/validate-formula-quality-strict.js`
7. `scripts/validate-herb-canon.js`
8. `scripts/validate-herb-quality-strict.js`
9. `scripts/validate-herbal-links.js`
10. `scripts/validate-no-boilerplate.js`
11. `scripts/validate-pattern-registry.js`
12. `scripts/validate-point-categories.js`
13. `scripts/validate-supp-standard.js`

---

## 驗證器執行與紅綠真相表（Execution & Red/Green Truth Table）

| 腳本名稱 | 分類 | CI 狀態 | Fail-Closed | 退出碼 | 狀態 | 耗時 (ms) | 缺陷數 | 輸出摘要 |
|---|---|---|---|---|---|---|---|---|
| `scripts/audit-cr010-condition-detail-maturity.js` | `AUDIT` | `MANUAL_ONLY` | YES | `0` | 🟢 GREEN | 257 | - | `{   "generated_at": "2026-08-26T09:16:34.296Z",   "input": "data/pathology/condition_canon_shortlist.json",   "live_condition_count": 505,   "expected_baseline_` |
| `scripts/audit-dark-fields.js` | `AUDIT` | `MANUAL_ONLY` | NO | `0` | 🟢 GREEN | 862 | - | `dark fields — 有內容但渲染程式沒有引用   361 經穴  (361 筆) — 畫面沒有引用的欄位:1    【導覽詞彙 —— 是篩選軸,不是卡片內容】1       action_tags                         339 筆有值  奇穴  (72 筆) — 畫面沒有引用的欄位:3` |
| `scripts/audit-herb-cloudtcm-layer.js` | `AUDIT` | `MANUAL_ONLY` | NO | `0` | 🟢 GREEN | 648 | - | `audit-herb-cloudtcm-layer — data/herbs/herb_canon_shortlist.json 全庫 363 筆；掃描層 source_type="sourced_cloudtcm_record" 194 張；其中 safety_flags 帶硬毒性 slug 17 張  判準` |
| `scripts/audit-legacy-namespace-retired-id.js` | `AUDIT` | `MANUAL_ONLY` | YES | `0` | 🟢 GREEN | 3665 | - | `{   "audit_date": "2026-08-25",   "audit_version": "2.0.0",   "total_valid_entity_namespaces_count": 93,   "d11_canonical_namespaces_count": 4,   "legacy_diagno` |
| `scripts/audit-validator-coverage-truth.js` | `AUDIT` | `MANUAL_ONLY` | YES | `0` | 🟢 GREEN | 0 | 0 | `Task 10B Self-Auditor` |
| `scripts/check-branch-mergeable.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 355 | - | `PASS — HEAD 就是 origin/main,無需比對。` |
| `scripts/check-canon-no-loss.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 543 | - | `check-canon-no-loss:   data/herbs/herb_canon_shortlist.json              363 →  363   data/herbs/formulas.json                          223 →  223   data/pathol` |
| `scripts/check-formula-no-loss.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `0` | 🟢 GREEN | 321 | - | `ok   方劑數                    223 → 223    ok   有君臣佐使                  221 → 221    ok   唯一中文字串                 7850 → 8920    ok   中文誤置於 _en              4 →` |
| `scripts/check-today-survives.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `0` | 🟢 GREEN | 165 | - | `ok   72 extra-point ids   ok   app.js reads contraindications into cautions   ok   pattern v1.0 migration   ok   add-point-ids and validate-point-ids read the` |
| `scripts/check-validation-ratchet.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `1` | 🔴 RED | 4502 | - | `validation ratchet — defect counts vs committed baseline    flat     conditions   0   flat     patterns     0   flat     tdis         0   flat     symptoms` |
| `scripts/rehearse-c2b.js` | `REHEARSAL_DASHBOARD` | `MANUAL_ONLY` | YES | `2` | 🔴 RED | 150 | - | `usage: node scripts/rehearse-c2b.js <raw.json> [--adjudications <adj.json>]` |
| `scripts/rehearse-runtime-restore.js` | `REHEARSAL_DASHBOARD` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 173 | - | `PASS switched to v2 PASS runtime_revision present PASS pending patient minted PASS runtime-era restore accepted (was rejected pre-gate-D) PASS classified runtim` |
| `scripts/report-361-encoding-findings.js` | `REPORT` | `MANUAL_ONLY` | NO | `0` | 🟢 GREEN | 308 | - | `{   "wrote": "docs\\CLOUDTCM_CANONICAL_ENCODING_FINDINGS.md",   "damaged_fields": 0,   "affected_codes": [] }` |
| `scripts/report-acupoint-content-gaps.js` | `REPORT` | `MANUAL_ONLY` | NO | `0` | 🟢 GREEN | 250 | - | `{   "records": 361,   "core_complete": false,   "findings": [     {       "field": "location_zh",       "missing_count": 0     },     {       "field": "location` |
| `scripts/report-acupoint-contradictions.js` | `REPORT` | `MANUAL_ONLY` | YES | `0` | 🟢 GREEN | 1133 | - | `{   "source": "data/acupoints/361.json",   "records": 361,   "findings": [     {       "type": "C",       "label": "cun_disagreement",       "code": "BL13",` |
| `scripts/report-cloudtcm-buildout.js` | `REPORT` | `MANUAL_ONLY` | NO | `0` | 🟢 GREEN | 129 | - | `{   "source": {     "url": "https://cloudtcm.com/disease/tcm",     "rows_on_site": 205,     "records_after_merge": 190,     "snapshot": "2026-07-22",     "merge` |
| `scripts/report-comparison-fill.js` | `REPORT` | `MANUAL_ONLY` | NO | `0` | 🟢 GREEN | 312 | - | `Wrote docs/COMPARISON_FILL_QUEUE.md {   "records": 43,   "filled_cells": 150,   "pending_cells": 756,   "empty_tables": 34,   "partial_tables": 0,   "complete_t` |
| `scripts/report-exam-coverage.js` | `REPORT` | `MANUAL_ONLY` | NO | `0` | 🟢 GREEN | 244 | - | `=== NCBAHM BIO blueprint coverage === blueprint: ncbahm_bio_2026  effective 2026-09-01 canon: 505 conditions, 447 with content  Autoimmune  4/5 Cardiovascular` |
| `scripts/report-formula-completeness.js` | `REPORT` | `MANUAL_ONLY` | NO | `0` | 🟢 GREEN | 259 | - | `方劑 223 首 —— 九個卡片區塊全到位者為「完成」  完成（不用再動）  140 接近（差 1–2 項）  74 待建（差 3 項以上） 9  ── 完成 ──  未分類 / 考點與補充劑 大补阴丸  都氣丸  二仙汤  防风通圣散  固经丸  暖肝煎  羌活胜湿汤   和解劑 小柴胡湯  大柴胡湯  逍遙散  加` |
| `scripts/report-formula-content-gaps.js` | `REPORT` | `MANUAL_ONLY` | YES | `1` | 🔴 RED | 229 | - | `C:\Projects\acuting-antigravity\scripts\report-formula-content-gaps.js:57   throw new Error(   ^  Error: Unexpected formula scope: 223 total / 204 populated` |
| `scripts/report-herb-caution-conflicts.js` | `REPORT` | `MANUAL_ONLY` | NO | `0` | 🟢 GREEN | 292 | - | `{   "T": [],   "S": [],   "X": [     {       "id": "herb.wu_zei_gu",       "name": "烏賊骨",       "other": "海螵蛸",       "otherCount": 8,       "selfCount": 0` |
| `scripts/report-pharm-coverage.js` | `REPORT` | `INFORMATIONAL_CI_STEP` | NO | `0` | 🟢 GREEN | 161 | - | `===== 藥理範圍覆蓋 =====  範圍總數    85 種 已建卡      49  層級       總數    planned skeleton course_f label_ve ting_rev P1       10          0        0        0       10` |
| `scripts/test-avs-checkout.js` | `TEST` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 146 | - | `Scenario A — routine acupuncture, no flags   ✓ modality source is structured   ✓ acupuncture aftercare candidate present   ✓ no oncology candidate   ✓ no antico` |
| `scripts/test-branch-mergeable.js` | `TEST` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 27559 | - | `check-branch-mergeable regression suite    PASS — A 完整 clone + base 是祖先 → PASS   (情境 B 起始狀態:is-shallow=true)   PASS — B 前提:這個工作區真的是 shallow(否則本情境什麼都沒測到)   PASS` |
| `scripts/test-herb-cloudtcm-fetch.js` | `TEST` | `MANUAL_ONLY` | NO | `0` | 🟢 GREEN | 400 | - | `HerbFuntion_JSON: undefined HerbTagAnalysisCH_JSON: undefined BD_Analysis sample:  MetaDescription sample:` |
| `scripts/test-knowledge-gap-logging.js` | `TEST` | `MANUAL_ONLY` | YES | `0` | 🟢 GREEN | 160 | - | `✓ 一開始沒有任何缺口   ✓ 記錄後多一筆   ✓ 欄位名記對了   ✓ 查詢文字記對了(不是被改寫過的版本)   ✓ 有中文欄位標籤(不是裸的 fieldName)   ✓ count 從 1 開始   ✓ 有時間戳   ✓ 真的寫進 localStorage(key 正確)   ✓ 寫進去的內容 round-` |
| `scripts/test-m1-fallback-failclosed.js` | `TEST` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 141 | - | `測試目標:C:\Projects\acuting-antigravity\app.js  情境 A — pointer=v2、store 缺失(應鎖唯讀,v1 零寫入)   PASS — load 不回傳 v1 內容(不得把凍結的回滾錨當現況)   PASS — load 後 clinicalStoreIntegrit` |
| `scripts/test-pharm-negative-cases.js` | `TEST` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 2827 | - | `==================================================== PHARMACOLOGY NEGATIVE TEST SUITE (TESTS A - E) ==================================================== ✅ Nega` |
| `scripts/test-pharm-source-integrity-negative-cases.js` | `TEST` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 4284 | - | `====================================================================== PHARMACOLOGY EXTERNAL RESOURCE & SCOPE EVIDENCE TEST SUITE (1 - 10) ====================` |
| `scripts/test-pointer-runtime.js` | `TEST` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 160 | - | `PASS v1 load unchanged PASS v1 save unchanged PASS v1 mode never touches staging PASS v2 load reads envelope.cases PASS v2 save never writes v1 (frozen rollback` |
| `scripts/test-practice-audit.js` | `TEST` | `MANUAL_ONLY` | YES | `0` | 🟢 GREEN | 165 | - | `PASS — 病人數   PASS — 病例數   PASS — 就診數   PASS — 最早/最晚就診   PASS — 回診率(2/3)   PASS — 單次就診病例   PASS — verdict 覆蓋(6/8)   PASS — 有 outcome 數值的就診(7/8)   PASS — 不良事件就診` |
| `scripts/validate-acupoint-source-conflicts.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 259 | - | `acupoint source conflicts — 361 穴    NOTE  APB-2    21  中文禁灸而英文寫 Moxibustion applicable   NOTE  APB-4a    4  中文卡自相矛盾:針法寫直刺,自己的禁忌欄寫嚴禁直刺   NOTE  APB-4b    1  中文禁直` |
| `scripts/validate-acupoint-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 378 | - | `validate-acupoint-standard: 361 points (361 template-grade)    中英未對齊 misaligned pairs      0   缺英文陣列 missing _en arrays     0   功效 2-8 條 curated               3` |
| `scripts/validate-avs-library.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 222 | - | `avs_advice_library: 13 records (12 active, 1 retired)   patterns resolvable against 151 registry ids; conditions against 505; modalities against 11; safety toke` |
| `scripts/validate-b123-legacy-migration.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 230 | 0 | `b123 legacy migration: 95/95 flags · 0 pending_provenance · authored 35 · batch4 96 (83/13, 142 ev) · 0 defects` |
| `scripts/validate-bilingual-render-parity.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 666 | - | `bilingual render parity — 中文有顯示、英文沒有的欄位    BLOCK 361 經穴      0 個英文缺口   BLOCK 奇穴          0 個英文缺口   BLOCK 方劑          0 個英文缺口   BLOCK 中藥          0 個英文缺口   BLOCK` |
| `scripts/validate-boot-order.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 145 | - | `validate-boot-order: initial render() at app.js:1469   top-level UPPER_CASE const declarations after it: 0 PASS — no top-level constant is declared after the fi` |
| `scripts/validate-care-draft-phi.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 217 | - | `CARE draft PHI boundary  — 1. patientCode / caseTitle 不得離開系統 —   PASS — patientCode 不出現在草稿的任何地方(含 HTML 註解)   PASS — caseTitle 不出現在草稿的任何地方   PASS — 下載檔名不含 caseTi` |
| `scripts/validate-care-draft-render.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 150 | - | `PASS — 面板有畫出來(readiness.max > 0)   PASS — 按鈕存在   PASS — 按鈕的 case id 正確   PASS — downloadCareDraft 沒有拋錯   PASS — 真的產生了一個 Blob(下載被觸發)   PASS — Blob 類型是 markdown` |
| `scripts/validate-clinical-case-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 376 | - | `===== 臨床病例層檢查 =====  受檢檔案        10  (gitignored 的 local/private/exports 不掃) 檢查的引用      2 詞彙表          conditions:505 · patterns:151 · formulas:223 · herbs:363` |
| `scripts/validate-clinical-invariants.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 142 | - | `sample_export_fixture.json sample_deidentified_case.json case_template.json checked: 3 cases · 3 pattern selections · 2 exposures · 5 events · 3 lifestyle rows` |
| `scripts/validate-clinical-store-phi-boundary.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 153 | - | `clinical-store PHI boundary    未包裝的 JSON.parse   0   行為檢查失敗          0  PASS — no blocking defects.` |
| `scripts/validate-cloudtcm-vocabularies.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `0` | 🟢 GREEN | 168 | - | `CloudTCM vocabulary validation passed. [   {     "file": "data/pathology/cloudtcm_disease_categories.json",     "records": 14,     "unique_ids": 14,     "biling` |
| `scripts/validate-comparison-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 301 | - | `===== 辨證鑑別卡驗證 =====  鑑別卡總數      43   證型鑑別      11   方劑鑑別      32   已由 Ting 填寫  9  C8 方劑鑑別群組  30 個可建卡,已建 30,缺 0  validate-comparison-standard: PASS` |
| `scripts/validate-condition-sources.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `0` | 🟢 GREEN | 952 | - | `- CloudTCM disease directory: SKIPPED (feature dissolved per js/knowledge.js; see comment above — retire-vs-fix decision needed) Condition source validation PAS` |
| `scripts/validate-condition-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 405 | 0 | `{   "file": "data/pathology/condition_canon_shortlist.json",   "scope": "all",   "records": 505,   "clean": 505,   "defects": 0,   "by_code": {},   "notes": 32` |
| `scripts/validate-content-junk.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 787 | - | `validate-content-junk: PASS — no scraped header tokens, no encoding anomalies in _zh fields.` |
| `scripts/validate-content-quality.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `0` | 🟢 GREEN | 565 | - | `=== acupoints — 361 records — data/acupoints/361.json === field                     empty  filler  shared  notZh  thin    GOOD  quality functions_zh` |
| `scripts/validate-crosswalk-mappings.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 185 | 0 | `⚠ XW7: 679 versioned entries expire within 42 days (earliest 2026-09-30).   Six-week runway is open — dispatch the FY2027 delta (docs/ANTIGRAVITY_DISPATCH_2026-` |
| `scripts/validate-data.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 808 | - | `OK: all 361 records from 361.json are present in runtime OK: no duplicate point codes OK: all 361 runtime records keep nameZh/location/needling non-empty and fa` |
| `scripts/validate-encoding.js` | `BLOCKING_VALIDATOR` | `TRANSITIVE_CI` | YES | `0` | 🟢 GREEN | 2362 | 3043 | `{"defects":3043,"by_code":{"chinese_field_without_cjk":1814,"question_mark_only":129,"replacement_character":1100},"by_file":{"data/acupoints/361.json":362,"dat` |
| `scripts/validate-exposure-safety-render.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 134 | - | `PASS — 每個用藥列都帶安全提示(2 個列表 / 2 個呼叫點)   PASS — 黑框警告的文字有出現   PASS — 黑框警告不用點開就看得到(不在 <details> 裡)   PASS — 黑框警告的文字逐字來自卡片(渲染層沒有改寫)   PASS — 禁忌有帶出來,且十筆不會全部攤開洗版(收在 <d` |
| `scripts/validate-extra-point-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 149 | - | `validate-extra-point-standard   records                 72   records with issues     22/72   mojibake suspected      0/72   missing measurable method 0/72   mis` |
| `scripts/validate-field-shape-consistency.js` | `BLOCKING_VALIDATOR` | `INFORMATIONAL_CI_STEP` | YES | `0` | 🟢 GREEN | 2770 | - | `{   "stats": {     "json_files_seen": 636,     "json_files_parsed": 636,     "parse_failures": 0,     "collections": 388,     "collections_nested": 110,     "re` |
| `scripts/validate-formula-composition-signatures.js` | `BLOCKING_VALIDATOR` | `INFORMATIONAL_CI_STEP` | YES | `0` | 🟢 GREEN | 239 | - | `{   "eligible_records": 212,   "exact_duplicate_pairs": 3,   "exact_duplicate_unresolved": 2,   "near_duplicate_pairs": 0,   "allowlisted_pairs": 0,   "pairs":` |
| `scripts/validate-formula-correctness.js` | `BLOCKING_VALIDATOR` | `TRANSITIVE_CI` | YES | `0` | 🟢 GREEN | 324 | 2 | `{"defects":2,"by_code":{"wrong-herb-count":1,"no-chief":1}}` |
| `scripts/validate-formula-dose-staging.js` | `BLOCKING_VALIDATOR` | `TRANSITIVE_CI` | YES | `0` | 🟢 GREEN | 312 | 1 | `{"defects":1,"by_code":{"unresolved_pinyin_or_herb_id":1}}` |
| `scripts/validate-formula-hdi-review.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 237 | - | `formula herb-drug interaction review    資料裡的敘述        26   已審且內容未變      26   未審                0   審後被改動          0   允許進畫面          1  formula.xiao_chai_hu_tan` |
| `scripts/validate-formula-quality-strict.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `0` | 🟢 GREEN | 212 | - | `=== Running Strict Formula Quality & Provenance Validator === Checked 223 formula records (Sourced exact CloudTCM records: 151). OK: All 223 formula records pas` |
| `scripts/validate-formula-safety-predicates.js` | `BLOCKING_VALIDATOR` | `INFORMATIONAL_CI_STEP` | YES | `0` | 🟢 GREEN | 277 | - | `{   "stats": {     "records": 223,     "with_composition": 221,     "public_safe_true": 39,     "caution_cards": 70,     "garbled_actions_cards_librarywide": 4,` |
| `scripts/validate-formula-song.js` | `NONBLOCKING_VALIDATOR` | `MANUAL_ONLY` | NO | `0` | 🟢 GREEN | 217 | - | `===== 方歌欄位檢查 =====  方劑總數      223 已有方歌      201   其中註明出處  43 尚無方歌      22  validate-formula-song: PASS — 已填的方歌格式都正確。` |
| `scripts/validate-formula-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 439 | - | `validate-formula-standard: 223 formulas (216 template-grade)    有組成 composition        221/223   有君臣佐使                221/223   有加減變化                98/223   有出` |
| `scripts/validate-gyn-legacy-migration.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 223 | 0 | `gyn legacy migration: 96/96 flags · 83 supported / 13 not_found · 142 evidence entries · 0 defects` |
| `scripts/validate-herb-canon.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `1` | 🔴 RED | 275 | - | `Herb canon validation warnings: - herb.tao_ren: channels_entered is empty - herb.tao_ren: modern_use_tags is empty - herb.chuan_niu_xi: channels_entered is empt` |
| `scripts/validate-herb-card-schema.js` | `NONBLOCKING_VALIDATOR` | `MANUAL_ONLY` | YES | `0` | 🟢 GREEN | 231 | - | `===== 中藥卡結構檢查 =====  中藥卡總數      363 參考卡          herb.gan_cao (68 個欄位) 阻擋問題        0 欄位缺漏/型別歧異 384  (舊庫既有,報告不擋) 欄位覆蓋 <50%   24  --- 欄位缺漏（報告,多為舊卡）前 10 ---   H2 h` |
| `scripts/validate-herb-dosage-shape.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 141 | - | `ok    D1 接線會被抓到   ok    D1 連 dosage_normalized 也擋(不是只擋 dosage)   ok    D1 讀 dosage_g 是允許的(不誤擋正常路徑)   ok    D1 錨點消失會被抓到(不允許空跑通過)   ok    D2 新形狀會被抓到   ok    D3` |
| `scripts/validate-herb-integrity-predicates.js` | `BLOCKING_VALIDATOR` | `INFORMATIONAL_CI_STEP` | YES | `0` | 🟢 GREEN | 331 | - | `{   "records": 363,   "counts": {     "HB-4": 913,     "HB-5": 15,     "HB-6": 11,     "HB-8": 46,     "HB-9": 0,     "HB-10": 7,     "HB-11": 182,     "HB-12":` |
| `scripts/validate-herb-quality-strict.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `0` | 🟢 GREEN | 213 | - | `=== Running Strict Single Herb Quality & Provenance Validator === Checked 363 herb records (Sourced exact CloudTCM records: 194). OK: All 363 single herb record` |
| `scripts/validate-herb-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 267 | - | `validate-herb-standard: 363 records  Coverage vs canonical record (docs/HERB_RECORD_STANDARD.md):   name_zh                   363/363  100%   name_en` |
| `scripts/validate-herbal-links.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `0` | 🟢 GREEN | 442 | - | `Herbal link validation passed: 10 draft formula relationship records.` |
| `scripts/validate-interactions.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 148 | - | `Interaction audit passed. {   "internalHashLinks": 15,   "ids": 154,   "directoryTopicShortcuts": [],   "patientCaseActions": [     "patientNewCaseLink",     "p` |
| `scripts/validate-knowledge-parts.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 2034 | - | `OK: 6 片載入，合計 47 鍵 OK: 鍵集相等（47 鍵） OK: 全部 47 鍵逐位元組等於單體 OK: __expected 清單與分片一致（core, ref, rx, mm, dx, pat） OK: K6 載入序——六片全部在 app.js 之前，app.js 在 js/knowledge.js 之前` |
| `scripts/validate-metric-interpretation.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 138 | - | `validate-metric-interpretation: 27 metrics   sourced                  10   no_published_threshold   17  PASS — 三態契約成立,沒有無來源的數字閾值。` |
| `scripts/validate-naming.js` | `BLOCKING_VALIDATOR` | `TRANSITIVE_CI` | YES | `0` | 🟢 GREEN | 315 | - | `Naming validation passed (586 records; D3 homonym rule).` |
| `scripts/validate-no-boilerplate.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `0` | 🟢 GREEN | 227 | - | `✅ Mandatory check passed: 0 boilerplate or placeholder strings found in all 201 formulas.` |
| `scripts/validate-no-template-protocol.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 224 | - | `template protocol guard    條件卡           505   仍為共用樣板     0  PASS — no blocking defects.` |
| `scripts/validate-outcome-panel-render.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 146 | - | `PASS — sourced 要顯示可查證的短引用   PASS — no_published_threshold 要明說沒有閾值   PASS — source_pending 要明說來源待補   PASS — 未標註的不畫 badge(空白好過假結論)   PASS — 未標註的仍要出現在表格裡(不能被整列吃掉` |
| `scripts/validate-pattern-registry.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `0` | 🟢 GREEN | 132 | - | `===== 證型登錄檔結構檢查 =====  證型筆數        151  (下限 59) 上位分類        10  (下限 10) 有辨證體系      151  (下限 48) 有兩軸歸屬      53  (下限 31) 待補中文名      0 待補辨證體系    0  validate-patter` |
| `scripts/validate-pattern-standard.js` | `BLOCKING_VALIDATOR` | `TRANSITIVE_CI` | YES | `0` | 🟢 GREEN | 224 | 0 | `{   "file": "data/pathology/pattern_library.json",   "scope": "all",   "records": 154,   "clean": 154,   "defects": 0,   "by_code": {},   "notes": {     "N1": 3` |
| `scripts/validate-pharm-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 416 | - | `===== 藥理層檢查 =====  drugs      59 筆 classes    48 筆 targets    38 筆 systems    7 筆  ===== PHARMACOLOGY FOUNDATION GRAPH AUDIT ===== systems total:` |
| `scripts/validate-point-categories.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `0` | 🟢 GREEN | 256 | - | `Point category validation passed. 129 distinct points tagged; five_shu_element on 60.` |
| `scripts/validate-point-ids.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 297 | - | `Point id validation passed. distinct ids by namespace: {"standard":361,"ex":72,"tung":277,"ear":215} / total: 925` |
| `scripts/validate-previsit-payload.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 173 | - | `[parity] app wrapper executed on 35 fixtures, 35 delegated calls, 0 verdict mismatches PASS [control] U+0085 NEL stripped from patient text PASS [control] U+0` |
| `scripts/validate-protocol-evidence-render.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 138 | - | `ok    沒有 evidence 就不輸出   ok    status 不在字典裡就不輸出(不亂編標籤)   ok    not_supported 會印出「現有證據不支持」   ok    evidence_note_zh 會上畫面   ok    scope_conflict_note 會上畫面   ok` |
| `scripts/validate-red-flag-registry.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 249 | 0 | `red_flag_registry: 226 records · 79 entities covered · 0 defects` |
| `scripts/validate-red-flag-runtime.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 797 | 0 | `red-flag runtime: 55 wired cards · 191 refs · ledger 151/40/0 · authored-only fallback 24 · 0 defects` |
| `scripts/validate-red-flag-wiring.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 230 | 0 | `red-flag wiring: 55 wired cards · 191 refs (151 supported / 40 not_found / 0 pending) · 0 defects` |
| `scripts/validate-relation-registry.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 682 | - | `{   "file": "data/config/relation_registry.json",   "edges": 14,   "errors": 0,   "by_code": {},   "notes": {     "N2": 10,     "N3": 1,     "N1": 3   } }` |
| `scripts/validate-relations.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 490 | - | `Relation validation passed. {   "ids": {     "western_conditions": 12,     "eastern_diseases": 6,     "tcm_patterns": 9,     "formulas": 223,     "western_medic` |
| `scripts/validate-render-blocking.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 299 | - | `OK: R1 0 個 css 檔無外部 @import OK: R2 跨網域 stylesheet 全部 media="print" OK: R3 index.html 無 inline classic script OK: R4 fonts.js 翻轉驅動完整（load+error 監聽、單一受控翻轉點） valid` |
| `scripts/validate-review-status-vocab.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 540 | 0 | `review-status vocab: 1950 record-level values checked · 2 pinned exceptions · 0 defects   （2 筆歷史單例釘在 KNOWN_EXCEPTIONS，待 Ting 裁定歸位） PASS — record 級 review_status` |
| `scripts/validate-supp-standard.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | `0` | 🟢 GREEN | 149 | 0 | `checked 36 supp records · categories 8 PASS — 0 defects, 0 warning(s)` |
| `scripts/validate-symptom-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 161 | 0 | `{   "file": "data/symptoms/symptoms.json",   "scope": "all",   "records": 122,   "clean": 122,   "defects": 0,   "by_code": {},   "notes": {     "N3": 4   } }` |
| `scripts/validate-tdis-standard.js` | `BLOCKING_VALIDATOR` | `TRANSITIVE_CI` | YES | `0` | 🟢 GREEN | 254 | 0 | `{   "file": "data/pathology/tdis_registry.json",   "scope": "all",   "records": 159,   "clean": 159,   "defects": 0,   "by_code": {},   "notes": {     "N1": 1` |
| `scripts/walkthrough-phase-e.js` | `REHEARSAL_DASHBOARD` | `CI_INVOKED` | YES | `0` | 🟢 GREEN | 159 | - | `PASS pain trajectory 8→7→5→4→3 — 8→7→5→4→3 PASS sleep trajectory 5→7 — 5→5.5→6→6.5→7 PASS exposure timeline 3 events, dose history recoverable PASS current snap` |
