# AcuTing OS — Validator Coverage Truth Table & Guard Gap Inventory

> **Audit Date**: 2026-08-26  
> **Repository**: [AcuTing OS](https://github.com/guot-beep/acuting-os)  
> **Head SHA**: `37cdbe67ee7d5d9e0e7a6483e283d3265a124d80`  
> **Base SHA**: `37cdbe67ee7d5d9e0e7a6483e283d3265a124d80`  
> **Nature**: READ-ONLY deterministic architectural guard audit  

---

## 執行摘要（Executive Summary）

- **全 Repo 腳本總數**：`368` 支
- **納管驗證/測試/稽核/報告腳本**：`97` 支
- **分類分布 (Taxonomy)**：
  - `UTILITY_OTHER`: 271
  - `AUDIT`: 5
  - `BLOCKING_VALIDATOR`: 67
  - `REHEARSAL_DASHBOARD`: 3
  - `REPORT`: 10
  - `TEST`: 10
  - `NONBLOCKING_VALIDATOR`: 2
- **CI 納管狀態 (CI Invocation Truth)**：
  - `CI_INVOKED` (直接在 CI 阻擋): **57**
  - `TRANSITIVE_CI` (透過 Ratchet 等傳遞調用): **8**
  - `ORPHAN_BLOCKING_VALIDATOR` (具 Fail-Closed 阻擋力但未進 CI): **13**
  - `INFORMATIONAL_CI_STEP` (在 CI 中作為報告/NOTE tier 執行): 5
  - `MANUAL_ONLY` (手動工具/輔助腳本): 287
- **獨立執行狀態分類 (Execution Breakdown)**：
  - `GREEN_BLOCKING_VALIDATORS`: 63 支
  - `RED_BLOCKING_VALIDATORS`: 2 支
  - `RED_TESTS`: 0 支
  - `REHEARSAL_REQUIRES_ARGS`: 1 支
  - `RED_REPORTS`: 1 支
  - `SKIPPED_UNSAFE` (具寫入行為而安全略過): 12 支

---

## 四大核心專項問題回答（Special Invariant Questions）

### A. Task 10A 盤點之 34 條 Active $\rightarrow$ Deprecated 引用，目前是否有 Generalized Guard？
- **判定結論**：**`GUARD_FOUND`**（Primary Guard: `scripts/validate-retired-id-references.js`）
- **Guard Exists**: `true` · **Scope**: `ALL_DATA_JSON_EXCEPT_AUDITS_IMPORTS` · **CI**: `DIRECT_CI`
- **機制佐證**：scripts/validate-retired-id-references.js scans records with review_status="deprecated" and enforces 0 active references (CI: DIRECT_CI).

### B. D16 三個退役 Pattern（`insomnia_heart_kidney_disharmony`, `liver_fire_flaring`, `liver_wind_stirring`）是否有防線？是否進 CI？現況行為？
- **判定結論**：**`GUARD_FOUND`**（Primary Guard: `scripts/validate-retired-id-references.js`）
- **Guard Exists**: `true` · **Scope**: `ALL_DEPRECATED_PATTERNS` · **CI**: `DIRECT_CI`
- **現況行為**：scripts/validate-retired-id-references.js (DIRECT_CI) behaviorally queries review_status="deprecated", scans data references, and fails closed on active references to D16 patterns.

### C. D11 舊命名空間（`western_condition.*`, `eastern_disease.*`, `pat.*`, `symptom.*`）守護現況與 CI 狀態？
- **判定結論**：**`GUARD_SCOPE_PARTIAL`**
- **Guard Exists**: `true` · **Scope**: `PARTIAL_SCOPE` · **CI**: `CI_INVOKED / TRANSITIVE_CI`
- **現況行為**：validate-condition-standard.js (CI) C6 flags pat.* on condition cards; validate-relations.js (CI) mechanically enforces western_condition.* and eastern_disease.* in legacy conditions.json.

### D. 退役 Herb / Formula ID 是否有廣義防線防止 Active 關聯引用？
- **判定結論**：**`GUARD_FOUND`**（Primary Guard: `scripts/validate-retired-id-references.js`）
- **Guard Exists**: `true` · **Scope**: `ALL_DEPRECATED_HERBS_AND_FORMULAS` · **CI**: `DIRECT_CI`
- **現況行為**：scripts/validate-retired-id-references.js (DIRECT_CI) scans all JSON in data/ (including herbs and formulas) and fails closed on any reference to deprecated herb/formula IDs.

---

## 守衛缺口清冊（Guard Gap Inventory）

| 缺口 ID | 守護目標 / 決策 | 目前守衛狀態 | CI 狀態 | 缺口類型 | 事實佐證 |
|---|---|---|---|---|---|
| `GAP-02` | D11 / D15 Legacy Graph Namespace Inversion in validate-relations.js | scripts/validate-relations.js | `CI_INVOKED` | `PARTIAL_SCOPE` | validate-relations.js asserts that IDs in conditions.json and clinical_graph_seed.json start with western_condition., eastern_disease., med. rather than canonical cond., tdis., drug. |
| `GAP-03` | 13 Orphan Blocking Validators Not Wired to CI | 13 scripts in scripts/validate-*.js and check-*.js | `ORPHAN_BLOCKING_VALIDATOR` | `MANUAL_ONLY_GUARD` | 13 fail-closed validators exist in scripts/ but are not executed in .github/workflows/validate.yml or check-validation-ratchet.js. |
| `GAP-04` | 4 NOTE Tier Informational Steps in CI Incapable of Failing Closed | validate-formula-composition-signatures.js, validate-formula-safety-predicates.js, validate-herb-integrity-predicates.js, validate-field-shape-consistency.js | `INFORMATIONAL_CI_STEP` | `POSSIBLE_FALSE_GREEN` | Steps execute in CI without --blocking flags; they report counts and always exit 0 despite backlogs. |
| `GAP-05` | D4 Clinical Free-Text De-Identification Discipline | validate-clinical-case-standard.js for tracked clinical JSON; free-text notes are unmonitored by code | `DOCUMENTED_NON_MACHINE_ENFORCEABLE` | `DOCUMENTED_NON_MACHINE_ENFORCEABLE` | DECISIONS.md D4 explicitly documents: Free-text discipline is a habit, not enforceable in code. |

---

## DECISIONS.md (D1–D22) 動態架構決策守護地圖

| 決策 | 標題 | 狀態 | 參照腳本 | 腳本存在 | CI 調用 | 守衛評級 | 佐證說明 |
|---|---|---|---|---|---|---|---|
| **D1** | IDs are opaque, immutable, decoupled from display | `LOCKED (principle)` | `scripts/check-canon-no-loss.js` | ✅ | `DIRECT_CI` | `ENFORCED_IN_CI` | check-canon-no-loss.js asserts canonical ID sets never shrink |
| **D2** | Namespace the non-standard point families | `LOCKED (2026-07-13, Ting: "統一命名")` | `scripts/validate-point-ids.js` | ✅ | `DIRECT_CI` | `ENFORCED_IN_CI` | Mechanically enforced by scripts/validate-point-ids.js (DIRECT_CI) |
| **D3** | Formula/herb homonym disambiguation rule | `LOCKED (2026-07-13, Ting delegated)` | `scripts/validate-naming.js` | ✅ | `TRANSITIVE_CI` | `ENFORCED_IN_CI` | Mechanically enforced by scripts/validate-naming.js (TRANSITIVE_CI) |
| **D4** | De-identification is a habit, not just a schema | `LOCKED` | `N/A` | ❌ | `NONE` | `DOCUMENTED_NON_MACHINE_ENFORCEABLE` | DECISIONS.md D4 explicitly documents: Free-text discipline is a habit, not enforceable in code |
| **D5** | Schema cardinality: choose MANY when in doubt | `LOCKED (principle)` | `scripts/validate-clinical-invariants.js` | ✅ | `DIRECT_CI` | `ENFORCED_IN_CI` | validate-clinical-invariants.js checks junction table schema cardinality |
| **D6** | Knowledge records are never hard-deleted | `LOCKED (2026-07-13)` | `scripts/validate-point-ids.js` | ✅ | `DIRECT_CI` | `ENFORCED_IN_CI` | Mechanically enforced by scripts/validate-point-ids.js (DIRECT_CI) |
| **D7** | Storage split: JSON knowledge (git) + SQLite clinical (gitignored) | `LOCKED` | `.github/workflows/validate.yml` | ✅ | `DIRECT_CI` | `ENFORCED_IN_CI` | clinical-data-never-committed CI job checks git ls-files for clinical db files |
| **D8** | Specialty is a cross-cutting `domain` TAG, never a container | `LOCKED (2026-07-15)` | `N/A` | ❌ | `NONE` | `NO_EXPLICIT_MECHANICAL_MAPPING_FOUND` | Specialty is a cross-cutting tag; no validator mechanically enforces directory-level specialty buckets |
| **D9** | Clinical usage stats: runtime by default; a snapshot may be committed, but NEVER as a field inside a canonical knowledge record | `LOCKED (2026-07-29, Ting)` | `N/A` | ❌ | `NONE` | `NO_EXPLICIT_MECHANICAL_MAPPING_FOUND` | No explicit mechanical guard script referenced or active in codebase |
| **D10** | One pattern namespace: `pattern.<english_slug>` | `LOCKED (2026-08-05, before the conditions/patterns fill sprint)` | `scripts/validate-condition-standard.js` | ✅ | `DIRECT_CI` | `ENFORCED_IN_CI` | Mechanically enforced by scripts/validate-condition-standard.js (DIRECT_CI) |
| **D11** | Four canonical diagnostic namespaces; the namespace IS the entity type | `LOCKED (2026-08-06, Ting asked "是四套 ID 嗎?")` | `N/A` | ❌ | `NONE` | `PARTIAL` | Card validators enforce cond.* etc. in canonical records, while validate-relations.js enforces legacy prefixes in graph seed |
| **D12** | Clinical-layer stability contract: additive-only from 2026-09-01 | `LOCKED (2026-08-06, Ting delegated the call to Claude: 「你決定吧」)` | `N/A` | ❌ | `NONE` | `PARTIAL` | validate-clinical-case-standard.js enforces structure; additive-only stability gate begins 2026-09-01 |
| **D13** | Every graph edge is stored on one side and derived on the other | `LOCKED (2026-08-06, Ting: 「雙向連接…最好在目前還算草創的時候就設定好」)` | `scripts/validate-relation-registry.js` | ✅ | `DIRECT_CI` | `ENFORCED_IN_CI` | validate-relation-registry.js verifies graph edge storage symmetry |
| **D14** | Every namespace is built the same four ways | `LOCKED (2026-08-06, Ting: 「那四套也可以依照這樣建構」)` | `scripts/check-validation-ratchet.js` | ✅ | `DIRECT_CI` | `ENFORCED_IN_CI` | check-validation-ratchet.js enforces 4-part construction layers across namespaces |
| **D16** | Three duplicate-import Pattern ids retired (deprecated, not deleted) into their canonical counterparts | `LOCKED (2026-08-08, Ting + ChatGPT canonical review, during the Pattern V1 completion project)` | `scripts/validate-retired-id-references.js` | ✅ | `DIRECT_CI` | `ENFORCED_IN_CI` | validate-retired-id-references.js enforces 0 active references to retired pattern IDs |
| **D15** | `drug.*` is the medication namespace; the 12 `med.*` records are migrated into it now | `LOCKED (2026-08-06, before pharmacology content starts)` | `N/A` | ❌ | `NONE` | `PARTIAL` | validate-pharm-standard.js enforces drug.*, but legacy med.* graph files remain active |
| **D17** | Clinical Data Capture V2 namespaces and model rules | `LOCKED (2026-08-10, Ting, final low-token checkpoint)` | `N/A` | ❌ | `NONE` | `NO_EXPLICIT_MECHANICAL_MAPPING_FOUND` | No explicit mechanical guard script referenced or active in codebase |
| **D19** | TCM Pattern V1 frozen | `LOCKED (2026-08-08, Ting approved after the ChatGPT canonical review)` | `N/A` | ❌ | `NONE` | `NO_EXPLICIT_MECHANICAL_MAPPING_FOUND` | No explicit mechanical guard script referenced or active in codebase |
| **D18** | SQLite 時程正式修訂 | `LOCKED(Ting 裁定接受,2026-08-11)` | `N/A` | ❌ | `NONE` | `NO_EXPLICIT_MECHANICAL_MAPPING_FOUND` | No explicit mechanical guard script referenced or active in codebase |
| **D20** | Outcome metric 的判讀分兩個軸,不是一個 | `LOCKED(2026-08-13,Ting:「兩個軸留著」)` | `scripts/validate-metric-interpretation.js` | ✅ | `DIRECT_CI` | `ENFORCED_IN_CI` | Mechanically enforced by scripts/validate-metric-interpretation.js (DIRECT_CI) |
| **D21** | 四組中藥重複匯入卡退役(deprecated,非刪除),合併進正典藥典名 | `LOCKED(2026-08-14,SOL 鑑定 + Ting 裁定「四組照建議 沙參方案A」)` | `scripts/validate-retired-id-references.js` | ✅ | `DIRECT_CI` | `ENFORCED_IN_CI` | validate-retired-id-references.js enforces 0 active references to retired herb IDs |
| **D22** | 敗毒散(formula.bai_du_san)併入人參敗毒散,為同方 | `LOCKED(2026-08-26,Ting:「敗毒散照 D3 併入人參敗毒散 基線降 0」)` | `scripts/validate-retired-id-references.js` | ✅ | `DIRECT_CI` | `ENFORCED_IN_CI` | validate-retired-id-references.js enforces 0 active references to formula.bai_du_san |
| **D23** | Legacy 診斷 id 歸位:五點裁定與執行 | `LOCKED(2026-08-26,Ting:「D11照建議辦 C3併入本病卡 C4撤下 不孕全部bu_yun 月經不調建總稱卡 腰痠另立」)` | `N/A` | ❌ | `NONE` | `NO_EXPLICIT_MECHANICAL_MAPPING_FOUND` | No explicit mechanical guard script referenced or active in codebase |
| **D24** | 十個家族父節點升格 level=pattern(升格保留家族結構) | `LOCKED(2026-08-26,Ting:「D19照建議辦 10個升level=pattern」)` | `N/A` | ❌ | `NONE` | `NO_EXPLICIT_MECHANICAL_MAPPING_FOUND` | No explicit mechanical guard script referenced or active in codebase |
| **D25** | pattern_registry 所有權翻轉:登錄檔為正本,builder 降級 | `LOCKED(2026-08-26,Ting 授權二選一「追上 builder 或翻轉所有權」,Claude 判定翻轉)` | `N/A` | ❌ | `NONE` | `NO_EXPLICIT_MECHANICAL_MAPPING_FOUND` | No explicit mechanical guard script referenced or active in codebase |
| **D26** | 同名/近名異物藥材:承認混淆地帶,方劑層標最優選 | `LOCKED(2026-08-26,Ting:「竹葉≈淡竹葉 有些是通 有些不通 但是是單獨中藥 中醫有很多就是有混淆地帶 卻是有時候可以通用 但有最優選」)` | `N/A` | ❌ | `NONE` | `NO_EXPLICIT_MECHANICAL_MAPPING_FOUND` | No explicit mechanical guard script referenced or active in codebase |
| **D27** | formula_correctness 兩筆結案:藥引旗標與君藥補標 | `LOCKED(2026-08-26,Ting 對兩題各選 A:「a a」)` | `N/A` | ❌ | `NONE` | `NO_EXPLICIT_MECHANICAL_MAPPING_FOUND` | No explicit mechanical guard script referenced or active in codebase |

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

| 腳本名稱 | 分類 | CI 狀態 | Fail-Closed | 安全讀取 | 退出碼 | 狀態 | 耗時 (ms) | 缺陷數 | 輸出摘要 |
|---|---|---|---|---|---|---|---|---|---|
| `scripts/audit-cr010-condition-detail-maturity.js` | `AUDIT` | `MANUAL_ONLY` | YES | NO | `-` | 🛡️ SKIPPED_UNSAFE | 0 | - | `Execution skipped: script writes or mutates files` |
| `scripts/audit-dark-fields.js` | `AUDIT` | `MANUAL_ONLY` | NO | YES | `0` | 🟢 GREEN | 1608 | - | `dark fields — 有內容但渲染程式沒有引用   361 經穴  (361 筆) — 畫面沒有引用的欄位:1    【導覽詞彙 —— 是篩選軸,不是卡片內容】1       action_tags                         339 筆有值  奇穴  (72 筆) — 畫面沒有引用的欄位:3` |
| `scripts/audit-herb-cloudtcm-layer.js` | `AUDIT` | `MANUAL_ONLY` | NO | NO | `-` | 🛡️ SKIPPED_UNSAFE | 0 | - | `Execution skipped: script writes or mutates files` |
| `scripts/audit-legacy-namespace-retired-id.js` | `AUDIT` | `MANUAL_ONLY` | YES | NO | `-` | 🛡️ SKIPPED_UNSAFE | 0 | - | `Execution skipped: script writes or mutates files` |
| `scripts/audit-validator-coverage-truth.js` | `AUDIT` | `MANUAL_ONLY` | YES | YES | `0` | 🟢 GREEN | 0 | 0 | `Task 10B Self-Auditor` |
| `scripts/check-branch-mergeable.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 434 | - | `PASS — HEAD 就是 origin/main,無需比對。` |
| `scripts/check-canon-no-loss.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | NO | `-` | 🛡️ SKIPPED_UNSAFE | 0 | - | `Execution skipped: script writes or mutates files` |
| `scripts/check-formula-no-loss.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | NO | `-` | 🛡️ SKIPPED_UNSAFE | 0 | - | `Execution skipped: script writes or mutates files` |
| `scripts/check-today-survives.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | YES | `0` | 🟢 GREEN | 228 | - | `ok   72 extra-point ids   ok   app.js reads contraindications into cautions   ok   pattern v1.0 migration   ok   add-point-ids and validate-point-ids read the` |
| `scripts/check-validation-ratchet.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 6810 | - | `validation ratchet — defect counts vs committed baseline    flat     conditions   0   flat     patterns     0   flat     tdis         0   flat     symptoms` |
| `scripts/rehearse-c2b.js` | `REHEARSAL_DASHBOARD` | `MANUAL_ONLY` | YES | YES | `2` | ℹ️ REHEARSAL_ARGS | 191 | - | `usage: node scripts/rehearse-c2b.js <raw.json> [--adjudications <adj.json>]` |
| `scripts/rehearse-runtime-restore.js` | `REHEARSAL_DASHBOARD` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 215 | - | `PASS switched to v2 PASS runtime_revision present PASS pending patient minted PASS runtime-era restore accepted (was rejected pre-gate-D) PASS classified runtim` |
| `scripts/report-361-encoding-findings.js` | `REPORT` | `MANUAL_ONLY` | NO | NO | `-` | 🛡️ SKIPPED_UNSAFE | 0 | - | `Execution skipped: script writes or mutates files` |
| `scripts/report-acupoint-content-gaps.js` | `REPORT` | `MANUAL_ONLY` | NO | NO | `-` | 🛡️ SKIPPED_UNSAFE | 0 | - | `Execution skipped: script writes or mutates files` |
| `scripts/report-acupoint-contradictions.js` | `REPORT` | `MANUAL_ONLY` | YES | NO | `-` | 🛡️ SKIPPED_UNSAFE | 0 | - | `Execution skipped: script writes or mutates files` |
| `scripts/report-cloudtcm-buildout.js` | `REPORT` | `MANUAL_ONLY` | NO | YES | `0` | 🟢 GREEN | 236 | - | `{   "source": {     "url": "https://cloudtcm.com/disease/tcm",     "rows_on_site": 205,     "records_after_merge": 190,     "snapshot": "2026-07-22",     "merge` |
| `scripts/report-comparison-fill.js` | `REPORT` | `MANUAL_ONLY` | NO | NO | `-` | 🛡️ SKIPPED_UNSAFE | 0 | - | `Execution skipped: script writes or mutates files` |
| `scripts/report-exam-coverage.js` | `REPORT` | `MANUAL_ONLY` | NO | YES | `0` | 🟢 GREEN | 398 | - | `=== NCBAHM BIO blueprint coverage === blueprint: ncbahm_bio_2026  effective 2026-09-01 canon: 508 conditions, 447 with content  Autoimmune  4/5 Cardiovascular` |
| `scripts/report-formula-completeness.js` | `REPORT` | `MANUAL_ONLY` | NO | YES | `0` | 🟢 GREEN | 351 | - | `方劑 223 首 —— 九個卡片區塊全到位者為「完成」  完成（不用再動）  144 接近（差 1–2 項）  70 待建（差 3 項以上） 9  ── 完成 ──  未分類 / 考點與補充劑 大补阴丸  都氣丸  二仙汤  二至丸  防风通圣散  固经丸  暖肝煎  羌活胜湿汤   和解劑 小柴胡湯  大柴胡湯  逍` |
| `scripts/report-formula-content-gaps.js` | `REPORT` | `MANUAL_ONLY` | YES | YES | `1` | ⚠️ RED_REPORT | 305 | - | `C:\Projects\acuting-antigravity\scripts\report-formula-content-gaps.js:57   throw new Error(   ^  Error: Unexpected formula scope: 223 total / 204 populated` |
| `scripts/report-herb-caution-conflicts.js` | `REPORT` | `MANUAL_ONLY` | NO | YES | `0` | 🟢 GREEN | 407 | - | `{   "T": [],   "S": [],   "X": [     {       "id": "herb.wu_zei_gu",       "name": "烏賊骨",       "other": "海螵蛸",       "otherCount": 8,       "selfCount": 0` |
| `scripts/report-pharm-coverage.js` | `REPORT` | `INFORMATIONAL_CI_STEP` | NO | YES | `0` | 🟢 GREEN | 178 | - | `===== 藥理範圍覆蓋 =====  範圍總數    85 種 已建卡      49  層級       總數    planned skeleton course_f label_ve ting_rev P1       10          0        0        0       10` |
| `scripts/test-avs-checkout.js` | `TEST` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 3715 | - | `Scenario A — routine acupuncture, no flags   ✓ modality source is structured   ✓ acupuncture aftercare candidate present   ✓ no oncology candidate   ✓ no antico` |
| `scripts/test-branch-mergeable.js` | `TEST` | `CI_INVOKED` | YES | NO | `-` | 🛡️ SKIPPED_UNSAFE | 0 | - | `Execution skipped: script writes or mutates files` |
| `scripts/test-export-envelope-shapes.js` | `TEST` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 246 | - | `PASS 裸陣列(舊備份)原樣通過 PASS v1ExportEnvelope → unwrap round-trip PASS schema_version:1 但 cases 非陣列 PASS v2 形狀不完整落到 v1 路徑 PASS 未知 schema_version PASS 無版本欄位的物件 PASS 字串` |
| `scripts/test-herb-cloudtcm-fetch.js` | `TEST` | `MANUAL_ONLY` | NO | YES | `0` | 🟢 GREEN | 319 | - | `HerbFuntion_JSON: undefined HerbTagAnalysisCH_JSON: undefined BD_Analysis sample:  MetaDescription sample:` |
| `scripts/test-knowledge-gap-logging.js` | `TEST` | `MANUAL_ONLY` | YES | YES | `0` | 🟢 GREEN | 137 | - | `✓ 一開始沒有任何缺口   ✓ 記錄後多一筆   ✓ 欄位名記對了   ✓ 查詢文字記對了(不是被改寫過的版本)   ✓ 有中文欄位標籤(不是裸的 fieldName)   ✓ count 從 1 開始   ✓ 有時間戳   ✓ 真的寫進 localStorage(key 正確)   ✓ 寫進去的內容 round-` |
| `scripts/test-m1-fallback-failclosed.js` | `TEST` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 128 | - | `測試目標:C:\Projects\acuting-antigravity\app.js  情境 A — pointer=v2、store 缺失(應鎖唯讀,v1 零寫入)   PASS — load 不回傳 v1 內容(不得把凍結的回滾錨當現況)   PASS — load 後 clinicalStoreIntegrit` |
| `scripts/test-pharm-negative-cases.js` | `TEST` | `CI_INVOKED` | YES | NO | `-` | 🛡️ SKIPPED_UNSAFE | 0 | - | `Execution skipped: script writes or mutates files` |
| `scripts/test-pharm-source-integrity-negative-cases.js` | `TEST` | `CI_INVOKED` | YES | NO | `-` | 🛡️ SKIPPED_UNSAFE | 0 | - | `Execution skipped: script writes or mutates files` |
| `scripts/test-pointer-runtime.js` | `TEST` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 133 | - | `PASS v1 load unchanged PASS v1 save unchanged PASS v1 mode never touches staging PASS v2 load reads envelope.cases PASS v2 save never writes v1 (frozen rollback` |
| `scripts/test-practice-audit.js` | `TEST` | `MANUAL_ONLY` | YES | YES | `0` | 🟢 GREEN | 156 | - | `PASS — 病人數   PASS — 病例數   PASS — 就診數   PASS — 最早/最晚就診   PASS — 回診率(2/3)   PASS — 單次就診病例   PASS — verdict 覆蓋(6/8)   PASS — 有 outcome 數值的就診(7/8)   PASS — 不良事件就診` |
| `scripts/validate-acupoint-source-conflicts.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 215 | - | `acupoint source conflicts — 361 穴    NOTE  APB-2    21  中文禁灸而英文寫 Moxibustion applicable   NOTE  APB-4a    4  中文卡自相矛盾:針法寫直刺,自己的禁忌欄寫嚴禁直刺   NOTE  APB-4b    1  中文禁直` |
| `scripts/validate-acupoint-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 238 | - | `validate-acupoint-standard: 361 points (361 template-grade)    中英未對齊 misaligned pairs      0   缺英文陣列 missing _en arrays     0   功效 2-8 條 curated               3` |
| `scripts/validate-avs-library.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 196 | - | `avs_advice_library: 13 records (12 active, 1 retired)   patterns resolvable against 151 registry ids; conditions against 508; modalities against 11; safety toke` |
| `scripts/validate-b123-legacy-migration.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 201 | 0 | `b123 legacy migration: 95/95 flags · 0 pending_provenance · authored 35 · batch4 96 (83/13, 142 ev) · 0 defects` |
| `scripts/validate-bilingual-render-parity.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 559 | - | `bilingual render parity — 中文有顯示、英文沒有的欄位    BLOCK 361 經穴      0 個英文缺口   BLOCK 奇穴          0 個英文缺口   BLOCK 方劑          0 個英文缺口   BLOCK 中藥          0 個英文缺口   BLOCK` |
| `scripts/validate-boot-order.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 149 | - | `validate-boot-order: initial render() at app.js:1474   top-level UPPER_CASE const declarations after it: 0 PASS — no top-level constant is declared after the fi` |
| `scripts/validate-care-draft-phi.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 162 | - | `CARE draft PHI boundary  — 1. patientCode / caseTitle 不得離開系統 —   PASS — patientCode 不出現在草稿的任何地方(含 HTML 註解)   PASS — caseTitle 不出現在草稿的任何地方   PASS — 下載檔名不含 caseTi` |
| `scripts/validate-care-draft-render.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 235 | - | `PASS — 面板有畫出來(readiness.max > 0)   PASS — 按鈕存在   PASS — 按鈕的 case id 正確   PASS — downloadCareDraft 沒有拋錯   PASS — 真的產生了一個 Blob(下載被觸發)   PASS — Blob 類型是 markdown` |
| `scripts/validate-clinical-case-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 416 | - | `===== 臨床病例層檢查 =====  受檢檔案        10  (gitignored 的 local/private/exports 不掃) 檢查的引用      2 詞彙表          conditions:508 · patterns:151 · formulas:223 · herbs:363` |
| `scripts/validate-clinical-invariants.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 119 | - | `sample_export_fixture.json sample_deidentified_case.json case_template.json checked: 3 cases · 3 pattern selections · 2 exposures · 5 events · 3 lifestyle rows` |
| `scripts/validate-clinical-store-phi-boundary.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 136 | - | `clinical-store PHI boundary    未包裝的 JSON.parse   0   行為檢查失敗          0  PASS — no blocking defects.` |
| `scripts/validate-cloudtcm-vocabularies.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | YES | `0` | 🟢 GREEN | 177 | - | `CloudTCM vocabulary validation passed. [   {     "file": "data/pathology/cloudtcm_disease_categories.json",     "records": 14,     "unique_ids": 14,     "biling` |
| `scripts/validate-comparison-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 404 | - | `===== 辨證鑑別卡驗證 =====  鑑別卡總數      43   證型鑑別      11   方劑鑑別      32   已由 Ting 填寫  9  C8 方劑鑑別群組  30 個可建卡,已建 30,缺 0  validate-comparison-standard: PASS` |
| `scripts/validate-condition-sources.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | YES | `0` | 🟢 GREEN | 893 | - | `- CloudTCM disease directory: SKIPPED (feature dissolved per js/knowledge.js; see comment above — retire-vs-fix decision needed) Condition source validation PAS` |
| `scripts/validate-condition-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 248 | 0 | `{   "file": "data/pathology/condition_canon_shortlist.json",   "scope": "all",   "records": 508,   "clean": 508,   "defects": 0,   "by_code": {},   "notes": 35` |
| `scripts/validate-content-junk.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 638 | - | `validate-content-junk: PASS — no scraped header tokens, no encoding anomalies in _zh fields.` |
| `scripts/validate-content-quality.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | YES | `0` | 🟢 GREEN | 483 | - | `=== acupoints — 361 records — data/acupoints/361.json === field                     empty  filler  shared  notZh  thin    GOOD  quality functions_zh` |
| `scripts/validate-crosswalk-mappings.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 120 | 0 | `⚠ XW7: 679 versioned entries expire within 42 days (earliest 2026-09-30).   Six-week runway is open — dispatch the FY2027 delta (docs/ANTIGRAVITY_DISPATCH_2026-` |
| `scripts/validate-data.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 661 | - | `OK: all 361 records from 361.json are present in runtime OK: no duplicate point codes OK: all 361 runtime records keep nameZh/location/needling non-empty and fa` |
| `scripts/validate-encoding.js` | `BLOCKING_VALIDATOR` | `TRANSITIVE_CI` | YES | YES | `0` | 🟢 GREEN | 2513 | 2915 | `{"defects":2915,"by_code":{"chinese_field_without_cjk":1814,"replacement_character":1100,"question_mark_only":1},"by_file":{"data/acupoints/361.json":362,"data/` |
| `scripts/validate-exposure-safety-render.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 126 | - | `PASS — 每個用藥列都帶安全提示(2 個列表 / 2 個呼叫點)   PASS — 黑框警告的文字有出現   PASS — 黑框警告不用點開就看得到(不在 <details> 裡)   PASS — 黑框警告的文字逐字來自卡片(渲染層沒有改寫)   PASS — 禁忌有帶出來,且十筆不會全部攤開洗版(收在 <d` |
| `scripts/validate-extra-point-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 127 | - | `validate-extra-point-standard   records                 72   records with issues     22/72   mojibake suspected      0/72   missing measurable method 0/72   mis` |
| `scripts/validate-field-shape-consistency.js` | `BLOCKING_VALIDATOR` | `INFORMATIONAL_CI_STEP` | YES | YES | `0` | 🟢 GREEN | 2853 | - | `{   "stats": {     "json_files_seen": 636,     "json_files_parsed": 636,     "parse_failures": 0,     "collections": 388,     "collections_nested": 110,     "re` |
| `scripts/validate-formula-composition-signatures.js` | `BLOCKING_VALIDATOR` | `INFORMATIONAL_CI_STEP` | YES | YES | `0` | 🟢 GREEN | 240 | - | `{   "eligible_records": 212,   "exact_duplicate_pairs": 3,   "exact_duplicate_unresolved": 2,   "near_duplicate_pairs": 0,   "allowlisted_pairs": 0,   "pairs":` |
| `scripts/validate-formula-correctness.js` | `BLOCKING_VALIDATOR` | `TRANSITIVE_CI` | YES | YES | `0` | 🟢 GREEN | 343 | 0 | `{"defects":0,"by_code":{}}` |
| `scripts/validate-formula-dose-staging.js` | `BLOCKING_VALIDATOR` | `TRANSITIVE_CI` | YES | YES | `0` | 🟢 GREEN | 265 | 0 | `{"defects":0,"by_code":{"unresolved_pinyin_or_herb_id":0}}` |
| `scripts/validate-formula-hdi-review.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 198 | - | `formula herb-drug interaction review    資料裡的敘述        26   已審且內容未變      26   未審                0   審後被改動          0   允許進畫面          1  formula.xiao_chai_hu_tan` |
| `scripts/validate-formula-quality-strict.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | YES | `0` | 🟢 GREEN | 180 | - | `=== Running Strict Formula Quality & Provenance Validator === Checked 223 formula records (Sourced exact CloudTCM records: 151). OK: All 223 formula records pas` |
| `scripts/validate-formula-safety-predicates.js` | `BLOCKING_VALIDATOR` | `INFORMATIONAL_CI_STEP` | YES | YES | `0` | 🟢 GREEN | 184 | - | `{   "stats": {     "records": 223,     "with_composition": 221,     "public_safe_true": 39,     "caution_cards": 70,     "garbled_actions_cards_librarywide": 4,` |
| `scripts/validate-formula-song.js` | `NONBLOCKING_VALIDATOR` | `MANUAL_ONLY` | NO | YES | `0` | 🟢 GREEN | 194 | - | `===== 方歌欄位檢查 =====  方劑總數      223 已有方歌      201   其中註明出處  43 尚無方歌      22  validate-formula-song: PASS — 已填的方歌格式都正確。` |
| `scripts/validate-formula-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 359 | - | `validate-formula-standard: 223 formulas (216 template-grade)    有組成 composition        221/223   有君臣佐使                221/223   有加減變化                98/223   有出` |
| `scripts/validate-gyn-legacy-migration.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 196 | 0 | `gyn legacy migration: 96/96 flags · 83 supported / 13 not_found · 142 evidence entries · 0 defects` |
| `scripts/validate-herb-canon.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | YES | `1` | 🔴 RED_BLOCKING | 245 | - | `Herb canon validation warnings: - herb.tao_ren: channels_entered is empty - herb.tao_ren: modern_use_tags is empty - herb.chuan_niu_xi: channels_entered is empt` |
| `scripts/validate-herb-card-schema.js` | `NONBLOCKING_VALIDATOR` | `MANUAL_ONLY` | YES | YES | `0` | 🟢 GREEN | 198 | - | `===== 中藥卡結構檢查 =====  中藥卡總數      363 參考卡          herb.gan_cao (68 個欄位) 阻擋問題        0 欄位缺漏/型別歧異 384  (舊庫既有,報告不擋) 欄位覆蓋 <50%   24  --- 欄位缺漏（報告,多為舊卡）前 10 ---   H2 h` |
| `scripts/validate-herb-dosage-shape.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 120 | - | `ok    D1 接線會被抓到   ok    D1 連 dosage_normalized 也擋(不是只擋 dosage)   ok    D1 讀 dosage_g 是允許的(不誤擋正常路徑)   ok    D1 錨點消失會被抓到(不允許空跑通過)   ok    D2 新形狀會被抓到   ok    D3` |
| `scripts/validate-herb-integrity-predicates.js` | `BLOCKING_VALIDATOR` | `INFORMATIONAL_CI_STEP` | YES | YES | `0` | 🟢 GREEN | 273 | - | `{   "records": 363,   "counts": {     "HB-4": 913,     "HB-5": 15,     "HB-6": 11,     "HB-8": 46,     "HB-9": 0,     "HB-10": 7,     "HB-11": 182,     "HB-12":` |
| `scripts/validate-herb-quality-strict.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | YES | `0` | 🟢 GREEN | 238 | - | `=== Running Strict Single Herb Quality & Provenance Validator === Checked 363 herb records (Sourced exact CloudTCM records: 194). OK: All 363 single herb record` |
| `scripts/validate-herb-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 185 | - | `validate-herb-standard: 363 records  Coverage vs canonical record (docs/HERB_RECORD_STANDARD.md):   name_zh                   363/363  100%   name_en` |
| `scripts/validate-herbal-links.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | YES | `0` | 🟢 GREEN | 215 | - | `Herbal link validation passed: 10 draft formula relationship records.` |
| `scripts/validate-interactions.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 110 | - | `Interaction audit passed. {   "internalHashLinks": 15,   "ids": 156,   "directoryTopicShortcuts": [],   "patientCaseActions": [     "patientNewCaseLink",     "p` |
| `scripts/validate-knowledge-parts.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 2344 | - | `OK: 6 片載入，合計 47 鍵 OK: 鍵集相等（47 鍵） OK: 全部 47 鍵逐位元組等於單體 OK: __expected 清單與分片一致（core, ref, rx, mm, dx, pat） OK: K6 載入序——六片全部在 app.js 之前，app.js 在 js/knowledge.js 之前` |
| `scripts/validate-metric-interpretation.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 109 | - | `validate-metric-interpretation: 27 metrics   sourced                  10   no_published_threshold   17  PASS — 三態契約成立,沒有無來源的數字閾值。` |
| `scripts/validate-naming.js` | `BLOCKING_VALIDATOR` | `TRANSITIVE_CI` | YES | YES | `0` | 🟢 GREEN | 266 | - | `Naming validation passed (586 records; D3 homonym rule).` |
| `scripts/validate-no-boilerplate.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | YES | `0` | 🟢 GREEN | 215 | - | `✅ Mandatory check passed: 0 boilerplate or placeholder strings found in all 201 formulas.` |
| `scripts/validate-no-template-protocol.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 174 | - | `template protocol guard    條件卡           508   仍為共用樣板     0  PASS — no blocking defects.` |
| `scripts/validate-outcome-panel-render.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 121 | - | `PASS — sourced 要顯示可查證的短引用   PASS — no_published_threshold 要明說沒有閾值   PASS — source_pending 要明說來源待補   PASS — 未標註的不畫 badge(空白好過假結論)   PASS — 未標註的仍要出現在表格裡(不能被整列吃掉` |
| `scripts/validate-pattern-registry.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | YES | `0` | 🟢 GREEN | 108 | - | `===== 證型登錄檔結構檢查 =====  證型筆數        151  (下限 151) 家族父節點      10  (下限 10) 有辨證體系      151  (下限 151) 有兩軸歸屬      53  (下限 53) 待補中文名      0 待補辨證體系    0  validate-patte` |
| `scripts/validate-pattern-standard.js` | `BLOCKING_VALIDATOR` | `TRANSITIVE_CI` | YES | YES | `0` | 🟢 GREEN | 190 | 0 | `{   "file": "data/pathology/pattern_library.json",   "scope": "all",   "records": 154,   "clean": 154,   "defects": 0,   "by_code": {},   "notes": {     "N1": 3` |
| `scripts/validate-pharm-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 356 | - | `===== 藥理層檢查 =====  drugs      59 筆 classes    48 筆 targets    38 筆 systems    7 筆  ===== PHARMACOLOGY FOUNDATION GRAPH AUDIT ===== systems total:` |
| `scripts/validate-point-categories.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | YES | `0` | 🟢 GREEN | 206 | - | `Point category validation passed. 129 distinct points tagged; five_shu_element on 60.` |
| `scripts/validate-point-ids.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 269 | - | `Point id validation passed. distinct ids by namespace: {"standard":361,"ex":72,"tung":277,"ear":215} / total: 925` |
| `scripts/validate-previsit-payload.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 139 | - | `[parity] app wrapper executed on 35 fixtures, 35 delegated calls, 0 verdict mismatches PASS [control] U+0085 NEL stripped from patient text PASS [control] U+0` |
| `scripts/validate-protocol-evidence-render.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 160 | - | `ok    沒有 evidence 就不輸出   ok    status 不在字典裡就不輸出(不亂編標籤)   ok    not_supported 會印出「現有證據不支持」   ok    evidence_note_zh 會上畫面   ok    scope_conflict_note 會上畫面   ok` |
| `scripts/validate-red-flag-registry.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 205 | 0 | `red_flag_registry: 226 records · 79 entities covered · 0 defects` |
| `scripts/validate-red-flag-runtime.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 644 | 0 | `red-flag runtime: 55 wired cards · 191 refs · ledger 151/40/0 · authored-only fallback 24 · 0 defects` |
| `scripts/validate-red-flag-wiring.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 191 | 0 | `red-flag wiring: 55 wired cards · 191 refs (151 supported / 40 not_found / 0 pending) · 0 defects` |
| `scripts/validate-relation-registry.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 614 | - | `{   "file": "data/config/relation_registry.json",   "edges": 14,   "errors": 0,   "by_code": {},   "notes": {     "N2": 10,     "N3": 1,     "N1": 3   } }` |
| `scripts/validate-relations.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `1` | 🔴 RED_BLOCKING | 468 | - | `Relation validation warnings: - data/interop/condition_crosswalk.json.records[7].icd10: "N91.3" disagrees with canon icd_hint "N91.5" - data/interop/condition_c` |
| `scripts/validate-render-blocking.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 280 | - | `OK: R1 0 個 css 檔無外部 @import OK: R2 跨網域 stylesheet 全部 media="print" OK: R3 index.html 無 inline classic script OK: R4 fonts.js 翻轉驅動完整（load+error 監聽、單一受控翻轉點） valid` |
| `scripts/validate-retired-id-references.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 1780 | 0 | `{"defects":0,"by_code":{}}` |
| `scripts/validate-review-status-vocab.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 499 | 0 | `review-status vocab: 1956 record-level values checked · 2 pinned exceptions · 0 defects   （2 筆歷史單例釘在 KNOWN_EXCEPTIONS，待 Ting 裁定歸位） PASS — record 級 review_status` |
| `scripts/validate-supp-standard.js` | `BLOCKING_VALIDATOR` | `ORPHAN_BLOCKING_VALIDATOR` | YES | YES | `0` | 🟢 GREEN | 111 | 0 | `checked 36 supp records · categories 8 PASS — 0 defects, 0 warning(s)` |
| `scripts/validate-symptom-standard.js` | `BLOCKING_VALIDATOR` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 154 | 0 | `{   "file": "data/symptoms/symptoms.json",   "scope": "all",   "records": 124,   "clean": 124,   "defects": 0,   "by_code": {},   "notes": {     "N3": 4,     "N` |
| `scripts/validate-tdis-standard.js` | `BLOCKING_VALIDATOR` | `TRANSITIVE_CI` | YES | YES | `0` | 🟢 GREEN | 217 | 0 | `{   "file": "data/pathology/tdis_registry.json",   "scope": "all",   "records": 160,   "clean": 160,   "defects": 0,   "by_code": {},   "notes": {     "N1": 2,` |
| `scripts/walkthrough-phase-e.js` | `REHEARSAL_DASHBOARD` | `CI_INVOKED` | YES | YES | `0` | 🟢 GREEN | 188 | - | `PASS pain trajectory 8→7→5→4→3 — 8→7→5→4→3 PASS sleep trajectory 5→7 — 5→5.5→6→6.5→7 PASS exposure timeline 3 events, dose history recoverable PASS current snap` |
