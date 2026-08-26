# Clinical Export / Import Contract Audit — Task 10C

- **Audit Date**: 2026-08-26
- **Base SHA**: `7e5aed84d7f6a2932dd2774d235ecf2e94e0bf75`
- **Head SHA**: `df40b0e651c5f8a02526e2aad8e22cb4526cb591`
- **Scope**: Private Clinical Backup / Export / Import / Restore Contract
- **Contract Boundary**: Read-only verification of `app.js`, `js/clinical-store.js`, `scripts/test-export-envelope-shapes.js`, `data/clinical_cases/sample_export_fixture.json`, `data/clinical_cases/schema.sql`. Zero production data mutation.

---

## 1. 核心指標與概覽（Summary Metrics）

| 指標 | 數值 | 說明 |
|---|---|---|
| **Clinical Backup / Export Producers** | **7** | 包含 v1/v2 UI 匯出、災難復原前自動備份、C2b 遷移產出、歷史裸陣列 |
| **Import / Restore Consumers** | **7** | 包含 v1 解包、v2 還原引擎、v1/v2 本地讀取、C2b 遷移解析、CI 驗證器 |
| **Contract Matrix Pairs** | **6** | 覆蓋全生命週期之匯出 $\rightarrow$ 匯入對應關係 |
| **Pre-envelope Bare Array Support** | **VERIFIED** | 舊裸陣列備份永久支援，由 `unwrapV1CasesPayload` 原樣通過 |
| **Future Version Fail-Closed** | **VERIFIED** | 未知/未來版本（如 `schema_version: 3`）於讀取邊界直接阻擋並拋出明確錯誤 |
| **Fail-Before-Write Protection** | **VERIFIED** | 任何格式毀損、不變量違規、歷史截斷均在儲存寫入前中止，不產生副作用 |
| **PHI-Safe Error Reporting** | **VERIFIED** | 錯誤訊息只描述長度與格式結構，絕不回顯病歷內容與原始 PHI |
| **Unknown Field Preservation** | **NOT_ENFORCED** | v1 匯入路徑走 `normalizeClinicalCase` 白名單過濾，未登錄欄位會被剔除 |
| **Case Count Verification** | **NOT_ENFORCED** | v1 信封之 `case_count` 為資訊性欄位，解包時不強制作長度比對 |

---

## 2. 契約矩陣（Contract Matrix）

| Producer | Consumer | Payload Version | Accepted Shape | Validation Before Write | Unknown Fields Preserved | Malformed Fail Closed | Future Version Fail Closed | Backward Compatible | Destructive Failure Possible | CI Status | Enforcement Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `app.js::exportClinicalCases (v1)` | `app.js::importClinicalCases (v1)` | `schema_version: 1` | `{ schema_version: 1, exported_at, case_count, cases: Case[] }` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/test-export-envelope-shapes.js, scripts/validate-clinical-invariants.js |
| `Legacy bare-array export (pre-2026-08-26)` | `app.js::importClinicalCases (v1)` | `bare_array (pre-envelope)` | `Case[] (JSON array)` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | `NOT_APPLICABLE` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/test-export-envelope-shapes.js (Fixture 1) |
| `app.js::exportClinicalCases (v2)` | `js/clinical-store.js::restoreV2Envelope` | `schema_version: 2` | `{ schema_version: 2, journal, patients, cases, runtime_revision, ... }` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/rehearse-runtime-restore.js, scripts/test-pointer-runtime.js |
| `js/clinical-store.js::buildMigrationPlan` | `js/clinical-store.js::executeMigration` | `c2b-1` | `{ migration_version: 'c2b-1', source_sha256, counts, patients, ... }` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/rehearse-c2b.js, scripts/migrate-c2b.js --self-test |
| `js/clinical-store.js::save (v1)` | `js/clinical-store.js::load (v1)` | `bare_array (v1 storage)` | `Case[] in localStorage['acuting-clinical-cases-v1']` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | `NOT_APPLICABLE` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/validate-clinical-store-phi-boundary.js, scripts/test-pointer-runtime.js |
| `js/clinical-store.js::save (v2)` | `js/clinical-store.js::load (v2)` | `schema_version: 2` | `{ schema_version: 2, journal, patients, cases, runtime_revision, ... } in staging` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/test-pointer-runtime.js |

---

## 3. 十四大專項機械性問題判定（Special Questions Breakdown）

### Q1. 列舉所有 Clinical Backup / Export 產生者 (Producers)
- **P1 (app.js::exportClinicalCases (v1 mode))** [UI_DOWNLOAD]: `schema_version: 1` — Triggered via Export Backup button in v1/pre-switch mode; wraps clinicalCases[] in schema_version:1 envelope.
- **P2 (app.js::exportClinicalCases (v2 mode))** [UI_DOWNLOAD]: `schema_version: 2` — Triggered via Export Backup button in v2 mode; exports raw staging envelope directly from localStorage[STAGING_KEY].
- **P3 (app.js::importClinicalCases (pre-restore auto-backup))** [AUTOMATIC_SAFETY_EXPORT]: `schema_version: 1` — Triggered automatically before destructive restore execution to ensure pre-restore state is recoverable.
- **P4 (js/clinical-store.js::buildMigrationPlan (CLI / migrate-c2b.js))** [CLI_PLAN_GENERATION]: `c2b-1` — Deterministic pure function generating C2b migration plan from raw v1 case snapshot bytes.
- **P5 (js/clinical-store.js::executeMigration)** [STORAGE_MIGRATION]: `schema_version: 2` — Transforms raw v1 snapshot and deterministic plan into v2 staging candidate.
- **P6 (js/clinical-store.js::save (v2 runtime))** [STORAGE_RUNTIME_SAVE]: `schema_version: 2` — Updates cases and syncs pending patient codes in localStorage[STAGING_KEY].
- **P7 (Historical pre-envelope bare array (pre-2026-08-26))** [HISTORICAL_EXPORT]: `bare_array (pre-envelope)` — Legacy backups generated before D12 envelope implementation.

### Q2. 列舉所有 Import / Restore 消費者 (Consumers)
- **C1 (app.js::importClinicalCases -> unwrapV1CasesPayload)** [UI_IMPORT_ROUTER_V1]: 接受版本 `bare_array, schema_version: 1` — Parses incoming backup file, unwraps v1 envelope or bare array, validates invariants, routes to merge or restore.
- **C2 (app.js::importClinicalCases -> AcuTingClinicalStore.restoreV2Envelope)** [UI_IMPORT_ROUTER_V2]: 接受版本 `schema_version: 2` — Identifies v2 envelope, enforces runtime_revision integer gate, invokes restoreV2Envelope.
- **C3 (js/clinical-store.js::restoreV2Envelope)** [STORAGE_RESTORE_ENGINE]: 接受版本 `schema_version: 2 (runtime-era or migration-era)` — Core two-phase restore engine with candidate staging, referential integrity verification, anti-downgrade, and atomic swap.
- **C4 (js/clinical-store.js::load (v1 mode))** [STORAGE_LOAD_V1]: 接受版本 `bare_array` — Reads v1 storage key, enforces fail-loud JSON parsing and array shape verification.
- **C5 (js/clinical-store.js::load (v2 mode))** [STORAGE_LOAD_V2]: 接受版本 `schema_version: 2` — Reads staging envelope from localStorage[STAGING_KEY], enforces minimum envelope shape, returns .cases.
- **C6 (scripts/migrate-c2b.js CLI / buildMigrationPlan)** [CLI_MIGRATION_CONSUMER]: 接受版本 `bare_array` — Consumes raw v1 snapshot to generate deterministic C2b migration plan.
- **C7 (scripts/validate-clinical-invariants.js / validate-clinical-case-standard.js)** [CI_VALIDATOR_CONSUMERS]: 接受版本 `schema_version: 1, bare_array` — CI static validators asserting R1-R7 invariants, referential integrity, and standard schema.

### Q3. 各 Producer $\rightarrow$ Consumer 配對所接受之 Payload 形狀與版本
- **v1 路徑**:
  - `Case[]` (舊裸陣列)
  - `{ schema_version: 1, exported_at: ISO, case_count: number, cases: Case[] }` (D12 信封)
- **v2 路徑**:
  - `{ schema_version: 2, journal: object, patients: Patient[], cases: Case[], pending_patient_codes?: string[], runtime_revision?: number }`
- **遷移路徑**:
  - `{ migration_version: 'c2b-1', source_sha256: string, source_bytes: number, counts: object, patients: Patient[], ... }`

### Q4. 舊裸陣列備份是否依然被接受？
- **判定**: **`VERIFIED`**
- **佐證**: `app.js` 之 `unwrapV1CasesPayload(parsed)` 第一行明文宣告：`if (Array.isArray(parsed)) return parsed;`，作為舊備份之永久相容保證。

### Q5. `schema_version: 1` Round-Trip 是否為無損 (Lossless)？
- **判定**: **`PARTIAL`**
- **佐證**: 
  - 正典定義之所有欄位（由 `normalizeClinicalCase` 與 `normalizeSoapNote` 白名單維護）為 **100% 無損**。
  - 非白名單之未知/外加自訂欄位在 v1 匯入時會被 normalizer 忽略剔除。
  - 信封頂層元資料（`exported_at`, `case_count`）在解包還原為 `clinicalCases` 後，於下次匯出時重新以當前時間與陣列長度重新打標。

### Q6. 未知/未來的 Schema Version 是否會被 Loudly 拒絕？
- **判定**: **`VERIFIED`**
- **佐證**: `unwrapV1CasesPayload` 對於非 1、非 2 的物件拋出 `userFacing = true` 之錯誤：`匯入被拒絕:認不得的物件形狀(schema_version=...)`；`restoreV2Envelope` 亦直接回傳 `REJECTED_UNCHANGED`。

### Q7. 格式毀損之信封是否在修改儲存前被拒絕？
- **判定**: **`VERIFIED`**
- **佐證**: v1 匯入於 `JSON.parse`、解包、不變量檢驗、歷史截斷比對全數通過後才執行 `persistClinicalCases()`；v2 還原於 candidate 暫存與驗證全綠後才替換 active staging。

### Q8. 不完整或無效之輸入是否可能覆寫現存有效資料？
- **判定**: **`VERIFIED` (保護成立)**
- **佐證**: 所有驗證均採 Fail-Closed 防線。v1 Restore 模式在覆蓋前自動下載現有狀態備份，若儲存寫入失敗則回滾記憶體快照；v2 還原若失敗則 active staging 與 pointer 原封不動。

### Q9. 未知/外加欄位在 Export $\rightarrow$ Import $\rightarrow$ Export 週期中是否被保留？
- **判定**: **`NOT_ENFORCED`**
- **佐證**: v1 normalizer 重新構造物件並指派已知欄位，未知外加欄位被過濾剔除；v2 在儲存層雖原樣寫入 staging，但 UI 載入時仍會經過 normalizer。

### Q10. `case_count` 是被機械性驗證還是僅具資訊性？
- **判定**: **`NOT_ENFORCED` (僅具資訊性)**
- **佐證**: `unwrapV1CasesPayload` 僅驗證 `Array.isArray(parsed.cases)`，未將 `parsed.cases.length` 與 `parsed.case_count` 做比對。

### Q11. 重複之 Case ID 如何被決定性處理？
- **判定**: **`VERIFIED`**
- **佐證**: 
  - v1 Merge 模式：透過 `Map(id -> case)` 進行合併，具備決定性之 Last-Wins 特性（且受 `findImportHistoryViolations` 歷史延伸規則約束）。
  - C2b 遷移：`buildMigrationPlan` 發現來源資料有重複 Case ID 時直接 throw 阻擋。
  - v2 還原：`verifyRuntimeEnvelope` 發現重複 Case ID 時直接登記 failure 拒收。

### Q12. 錯誤訊息是否面向使用者且不轉述病歷內容 (PHI-Safe)？
- **判定**: **`VERIFIED`**
- **佐證**: `unwrapV1CasesPayload`、`parseFailureDetail`、`parseJsonOrThrow` 均只輸出格式錯誤名與位元組長度，嚴格遵守 SOL R-13 與 Codex P4 seam HIGH-1 防線，受 `scripts/validate-clinical-store-phi-boundary.js` 監控。

### Q13. v1/v2 路由是否存在模糊 Fallback 或靜默降級？
- **判定**: **`VERIFIED` (無模糊降級)**
- **佐證**: 
  - `exportClinicalCases` 在 v2 模式下若 staging 缺失直接 alert 中止，不降級為 v1 匯出。
  - `importClinicalCases` 在 v1 模式下讀到 v2 信封直接拒絕，禁止丟失 patients/journal 之降級匯入。
  - `unwrapV1CasesPayload` 攔截 `schema_version === 2` 並拋出錯誤。

### Q14. D12 條款在今日有哪些部分已具備機械式強制執行？
- **判定**: **`PARTIAL`**
- **現行強制執行守衛**:
  - `scripts/test-export-envelope-shapes.js` (CI): 強制驗證 D12 匯出信封格式與解包拒絕邏輯。
  - `scripts/validate-clinical-invariants.js` (CI): 強制驗證 R1-R7 臨床不變量。
  - `scripts/validate-clinical-store-phi-boundary.js` (CI): 強制 PHI 邊界與解析防護。
  - `scripts/test-pointer-runtime.js` (CI): 強制 pointer 與 staging 雙向完整性。
  - `scripts/rehearse-runtime-restore.js`: 演練還原與歷史不變量防護。
- **文件約定**: 2026-09-01 起全儲存與匯出欄位採 Additive-Only 單向門。

---

## 4. 回歸測試驗證（Regression Fixtures）

本稽核腳本內建 10 項目標回歸測試（`--self-test`），全部直接載入 `app.js` 與 `js/clinical-store.js` 原始生產邏輯執行：
1. **Fixture 1**: 舊裸陣列備份直接原樣通過 (`unwrapV1CasesPayload`) $\rightarrow$ **PASS**
2. **Fixture 2**: 合法 `schema_version: 1` 信封 round-trip 解包 $\rightarrow$ **PASS**
3. **Fixture 3**: 外加未知欄位行為驗證（確認 normalizer 白名單過濾） $\rightarrow$ **PASS**
4. **Fixture 4**: 格式毀損之 cases 欄位在寫入前拋出 userFacing 錯誤 $\rightarrow$ **PASS**
5. **Fixture 5**: 未知未來版本 (`schema_version: 99`) Loudly 阻擋 $\rightarrow$ **PASS**
6. **Fixture 6**: 重複 Case ID 行為驗證 (v1 Last-Wins, v2 拒收) $\rightarrow$ **PASS**
7. **Fixture 7**: `case_count` 不一致行為驗證 (v1 解包視為資訊性) $\rightarrow$ **PASS**
8. **Fixture 8**: 毀損 JSON 注入還原引擎，確認 active staging 零寫入零更動 $\rightarrow$ **PASS**
9. **Fixture 9**: v2 信封傳入 v1 解包函式時 Fail-Closed 阻擋 $\rightarrow$ **PASS**
10. **Fixture 10**: 錯誤訊息注入假 PHI 文字，驗證錯誤回顯絕不包含敏感內容 $\rightarrow$ **PASS**

---
