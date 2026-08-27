# Clinical Export / Import Contract Audit — Task 10C (Round 4)

- **Audit Date**: 2026-08-26 / 2026-08-27
- **Base SHA (origin/main)**: `5001cc02cc49dcd88543f1049f5ac80e6e69d19c`
- **Audit Source SHA**: `2697decf7fd91b4ea378f92694e051ecd6394290`
- **Delivery Commit SHA**: `null` (The immutable delivery commit SHA is the Git branch HEAD recorded externally upon commit creation.)
- **Scope**: Private Clinical Backup / Export / Import / Restore Contract
- **Contract Boundary**: Read-only verification of `app.js`, `js/clinical-store.js`, `scripts/test-export-envelope-shapes.js`, `data/clinical_cases/sample_export_fixture.json`, `data/clinical_cases/schema.sql`. Zero production data mutation.

---

## 1. 核心指標與概覽（Summary Metrics）

| 指標 | 數值 / 狀態 | 說明 |
|---|---|---|
| **Clinical Backup / Export Producers** | **7** | 包含 v1/v2 UI 匯出、災難復原前自動備份、C2b 遷移產出、歷史裸陣列 |
| **Import / Restore Consumers** | **7** | 包含 v1 解包、v2 還原引擎、v1/v2 本地讀取、C2b 遷移解析、CI 驗證器 |
| **Reachable Real Routes** | **11** | 覆蓋全生命週期所有可達之匯出 $\rightarrow$ 匯入路徑 |
| **Mutation-Boundary Fixtures** | **14** | 14 組直通實體 `app.js::importClinicalCases` 與 `restoreV2Envelope` 之隔離測試 |
| **Pre-envelope Bare Array Support** | **VERIFIED** | 舊裸陣列備份永久支援，由 `unwrapV1CasesPayload` 原樣通過 |
| **Future Version Fail-Closed** | **VERIFIED** | 未知/未來版本（如 `schema_version: 99`）於讀取邊界直接阻擋並拋出明確錯誤 |
| **Fail-Before-Write Protection** | **VERIFIED** | 任何格式毀損、不變量違規、歷史截斷均在儲存寫入前中止，不產生副作用 |
| **Partial-Input Overwrite Protection** | **NOT_ENFORCED** | 實體執行證實：同 ID 部分欄位物件在 Merge 模式下因 Map 覆蓋而重置未列欄位 |
| **PHI-Safe Error Reporting** | **VERIFIED** | 錯誤訊息只描述長度與格式結構，絕不回顯病歷內容與原始 PHI |
| **Unknown Field Preservation** | **PARTIAL** | v1 匯入路徑走 normalizer 白名單過濾；v2 儲存層保留信封欄位，UI 週期剔除病例欄位 |
| **Case Count Verification** | **NOT_ENFORCED** | v1 信封之 `case_count` 為資訊性欄位，解包時不強制作長度比對 |

---

## 2. 契約矩陣（Reachable Routes Contract Matrix）

| Route | Producer | Consumer | Payload Version | Accepted Shape | Validation Before Write | Unknown Fields Preserved | Malformed Fail Closed | Future Version Fail Closed | Backward Compatible | Destructive Failure Possible | CI Status | Enforcement Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **R1** | `app.js::exportClinicalCases (v1)` | `app.js::importClinicalCases (v1 Merge)` | `schema_version: 1` | `{ schema_version: 1, exported_at, case_count, cases: Case[] }` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/test-export-envelope-shapes.js, scripts/validate-clinical-invariants.js |
| **R2** | `app.js::exportClinicalCases (v1)` | `app.js::importClinicalCases (v1 Restore)` | `schema_version: 1` | `{ schema_version: 1, exported_at, case_count, cases: Case[] }` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/test-export-envelope-shapes.js, scripts/validate-clinical-invariants.js |
| **R3** | `Legacy bare-array export (pre-2026-08-26)` | `app.js::importClinicalCases (v1 Merge)` | `bare_array (pre-envelope)` | `Case[] (JSON array)` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | `NOT_APPLICABLE` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/test-export-envelope-shapes.js (Fixture 1) |
| **R4** | `Legacy bare-array export (pre-2026-08-26)` | `app.js::importClinicalCases (v1 Restore)` | `bare_array (pre-envelope)` | `Case[] (JSON array)` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | `NOT_APPLICABLE` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/test-export-envelope-shapes.js (Fixture 1) |
| **R5** | `app.js::importClinicalCases (v1 Pre-Restore Auto-Backup)` | `app.js::importClinicalCases (v1 Restore / Merge)` | `schema_version: 1` | `{ schema_version: 1, exported_at, case_count, cases: Case[] }` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | app.js (line 11108) |
| **R6** | `app.js::exportClinicalCases (v2)` | `js/clinical-store.js::restoreV2Envelope` | `schema_version: 2` | `{ schema_version: 2, journal, patients, cases, runtime_revision, ... }` | `VERIFIED` | `PARTIAL` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/rehearse-runtime-restore.js, scripts/test-pointer-runtime.js |
| **R7** | `js/clinical-store.js::buildMigrationPlan` | `js/clinical-store.js::executeMigration` | `c2b-1` | `{ migration_version: 'c2b-1', source_sha256, counts, patients, ... }` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/rehearse-c2b.js, scripts/migrate-c2b.js --self-test |
| **R8** | `js/clinical-store.js::save (v1)` | `js/clinical-store.js::load (v1)` | `bare_array (v1 storage)` | `Case[] in localStorage['acuting-clinical-cases-v1']` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | `NOT_APPLICABLE` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/validate-clinical-store-phi-boundary.js, scripts/test-pointer-runtime.js |
| **R9** | `js/clinical-store.js::save (v2)` | `js/clinical-store.js::load (v2)` | `schema_version: 2` | `{ schema_version: 2, journal, patients, cases, runtime_revision, ... } in staging` | `VERIFIED` | `PARTIAL` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_ENFORCED` | `VERIFIED` | scripts/test-pointer-runtime.js |
| **R10** | `data/clinical_cases/sample_export_fixture.json` | `scripts/validate-clinical-invariants.js` | `schema_version: 1` | `{ schema_version: 1, exported_at, case_count, cases: Case[] }` | `VERIFIED` | `NOT_APPLICABLE` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_APPLICABLE` | `VERIFIED` | scripts/validate-clinical-invariants.js (line 28) |
| **R11** | `data/clinical_cases/sample_export_fixture.json` | `scripts/test-export-envelope-shapes.js` | `schema_version: 1` | `{ schema_version: 1, exported_at, case_count, cases: Case[] }` | `VERIFIED` | `NOT_APPLICABLE` | `VERIFIED` | `VERIFIED` | `VERIFIED` | `NOT_APPLICABLE` | `VERIFIED` | scripts/test-export-envelope-shapes.js (Fixture 9) |

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
- **佐證**: `app.js` 之 `unwrapV1CasesPayload(parsed)` 第一行宣告：`if (Array.isArray(parsed)) return parsed;`，作為舊備份之永久相容保證。

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
- **佐證**: 直通實體 `app.js::importClinicalCases` 驗證：在 `JSON.parse`、解包、不變量檢驗、歷史截斷比對全數通過後才執行 `persistClinicalCases()`；v2 還原於 candidate 暫存與驗證全綠後才替換 active staging，儲存 100% 保持未修改狀態。

### Q8. 不完整或無效之輸入是否可能覆寫現存有效資料？
- **判定**: **`NOT_ENFORCED`**
- **佐證**: 直通實體 `app.js::importClinicalCases` 實測證實：若匯入檔包含合法 JSON 但結構極為簡略（例如同 ID 但僅含 `{ id, patientCode }`），在 v1 Merge 模式下，由於無用藥/AVS 歷史違規，Map 合併將直接以該 partial case 覆蓋現有完整病例物件，導致性別、主訴、病程等欄位被重置為預設空值（`""`、`[]`）。Restore 模式則整庫替換。因此，部分輸入防護在欄位層次屬於 NOT_ENFORCED（具備欄位覆寫破壞性）。

### Q9. 未知/外加欄位在 Export $\rightarrow$ Import $\rightarrow$ Export 週期中是否被保留？
- **判定**: **`PARTIAL`**
- **佐證**: 
  - **v1 case-level**: NOT_ENFORCED（被 `normalizeClinicalCase` 重新構造白名單物件時剔除）。
  - **v2 envelope-level**: VERIFIED（在 staging 儲存層完整保留）。
  - **v2 case-level**: NOT_ENFORCED（雖然 restore raw 保存，但 UI 載入時經 normalizer 處理，於後續 save 時永久自儲存中移除）。

### Q10. `case_count` 是被機械性驗證還是僅具資訊性？
- **判定**: **`NOT_ENFORCED` (僅具資訊性)**
- **佐證**: `unwrapV1CasesPayload` 僅驗證 `Array.isArray(parsed.cases)`，未將 `parsed.cases.length` 與 `parsed.case_count` 做比對。

### Q11. 重複之 Case ID 如何被決定性處理？
- **判定**: **`VERIFIED`**
- **佐證**: 
  - v1 Merge 模式：透過 `Map(id -> case)` 進行合併，具備決定性之 Last-Wins 特性（且受 `findImportHistoryViolations` 歷史延伸規則約束）。
  - C2b 遷移：`buildMigrationPlan` 發現來源資料有重複 Case ID 時直接 throw 阻擋。
  - v2 還原：`restoreV2Envelope` 直通實測證實發現重複 Case ID 時回傳 failure 拒收。

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

本稽核腳本內建 14 項目標回歸測試（`--self-test`），全部直通 `app.js::importClinicalCases` 與 `js/clinical-store.js` 原始生產邏輯執行：
1. **Fixture 1**: 舊裸陣列備份直接原樣通過 (`unwrapV1CasesPayload`) $\rightarrow$ **PASS**
2. **Fixture 2**: 合法 `schema_version: 1` 信封 round-trip 解包 $\rightarrow$ **PASS**
3. **Fixture 3**: 格式毀損之 cases 欄位直通 `importClinicalCases` 寫入前拒收，儲存零更動 $\rightarrow$ **PASS**
4. **Fixture 4**: 毀損 JSON 直通 `importClinicalCases` 寫入前拒收，儲存零更動 $\rightarrow$ **PASS**
5. **Fixture 5**: 未知未來版本 (`schema_version: 99`) 直通 `importClinicalCases` Loudly 阻擋且儲存零寫入 $\rightarrow$ **PASS**
6. **Fixture 6**: 重複 Case ID 直通 `importClinicalCases` 在 v1 Merge 模式下呈現 Last-Wins $\rightarrow$ **PASS**
7. **Fixture 7**: 重複 Case ID 直通 `restoreV2Envelope` 驗證二階段拒收且 active staging 零變更 $\rightarrow$ **PASS**
8. **Fixture 8**: `case_count` 不一致行為驗證 (v1 解包視為資訊性) $\rightarrow$ **PASS**
9. **Fixture 9**: 部分輸入 (Partial Input) 直通 `importClinicalCases` 在 Merge 模式下重置未列欄位之破壞性實測 $\rightarrow$ **PASS**
10. **Fixture 10**: 部分輸入 (Partial Input) 直通 `importClinicalCases` 在 Restore 模式下全庫取代之破壞性實測 $\rightarrow$ **PASS**
11. **Fixture 11**: v1 case 層未知外加欄位在 `normalizeClinicalCase` 中被過濾剔除 $\rightarrow$ **PASS**
12. **Fixture 12**: v2 未知欄位完整生命週期實測（經 `restoreV2Envelope` 寫入 staging，經 `load` 讀出，經 `normalizeClinicalCase` 過濾，經 `save` 寫回，確認信封層保留、病例層剔除） $\rightarrow$ **PASS**
13. **Fixture 13**: v2 信封傳入 v1 解包函式時 Fail-Closed 阻擋 $\rightarrow$ **PASS**
14. **Fixture 14**: 錯誤訊息注入假 PHI 文字，驗證錯誤回顯絕不包含敏感內容 $\rightarrow$ **PASS**

---
