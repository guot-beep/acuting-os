# C2b Migration Plan — case→patient 抬升(依 Codex NO-GO 前置要求 A–D 撰寫)

狀態:**計畫文件,未實作**。C2b 維持 NO-GO 直到 Codex 對本計畫 + dry-run 報告
+ fake-clone 實測給明確 GO(docs/AI_REVIEW_FEEDBACK.md §9)。真實執行另需
Ting 在場核准(不可逆動作)。

## 0. 依賴(先於一切)

- [ ] Codex HIGH#1/#2/#4/#6/#8 修正全部落地並綠(#8 已修於 clinical-store;
      #6/#2/#4-validator-wiring 的 app.js 部分排在 Codex batch-2 WIP 之後)
- [ ] `scripts/validate-clinical-invariants.js` 進 ratchet/CI
- [ ] 本計畫經 Codex 重審

## A. 真實資料 preflight 與雙備份(只讀,在持有 33-case store 的 browser profile)

1. `localStorage.getItem("acuting-clinical-cases-v1")` 原始 bytes → 存
   `%USERPROFILE%\AcuTing-backups\pre-c2b\raw-v1-<date>.json`(Git 外);
   同時做 app export → 同目錄第二份。兩份各記 SHA-256 + bytes。
2. 由 **raw snapshot**(不經 normalizer!)計算並記錄:case-id set、
   patientCode set、SOAP-id set、每類 nested row/event counts、未知欄位清單。
   預期值以此為準——不把 33/52 寫死成真理。
3. 兩次獨立 export hash 必須相同;在隔離 origin 做 restore drill,
   逐鍵 hash/count 相同後才進 B。
4. 讀取動作零回寫:preflight 全程不呼叫 persist;驗證方式 = 前後 raw bytes
   SHA-256 相同。

## B. Migration 設計(idempotent、非破壞、shadow-key)

1. 新 script `scripts/migrate-c2b.js`(node,吃 raw JSON 檔,不在 browser 跑
   第一輪):`--dry-run` 輸出 deterministic plan(JSON)。
2. **Patient id**:`patient.<sha256(patientCode)前12碼>` —— 純函數,無
   Date.now/Math.random;同 source 重跑必得同 ids。
3. Journal:`{migration_version:"c2b-1", source_sha256, executed_at, counts}`
   隨結果寫入;第二次執行同 source 必報 `creates 0 · updates 0 · deletes 0`。
4. **不動 v1**:結果寫 shadow key `acuting-clinical-v2-staging`
   `{schema_version:2, patients[], cases[]}`;v1 原封不動。驗證全綠後,單一
   pointer key `acuting-clinical-active` 從 v1 切到 v2;任何錯誤/quota/中斷
   都不產生 half-migrated state(staging 可整鍵刪除重來)。
5. case 增 `patientId`(stable FK);patientCode 降為 display。抬升 = COPY
   到 patient,case 端原欄位保留為 migration source(只加深不刪除,D1)。
6. Guard 語意(C2b UI 部分):同 patientCode 新建第二個 case 時,顯示
   「此代碼已屬於病人 X(N 個病例)——確認是同一人?」確認後掛同 patientId;
   拒絕則要求改 code。picker 選 Patient 實體,不猜字串。
7. 衝突欄位:derivePatientsFromCases(已修版)輸出 conflicts + needsReview
   → dry-run plan 列人工裁決清單 → Ting 逐筆裁決後才准 execute;無裁決的
   conflict 欄位落地為 NULL + conflicts JSON 附錄,不自動選。

## C. Rollback

1. v1 key + 雙備份保留到人工驗收後的下一個備份週期,不自動刪。
2. Pointer 切回 v1 = 立即完全回滾;rollback script 只刪 c2b 建立的
   versioned keys(staging + pointer),白名單制。
3. 在隔離 clone 實測 migrate→rollback:原始 raw SHA-256、case/SOAP id sets、
   nested counts 全部復原,才准在真機執行。

## D. 真實執行驗收(全部逐項數字)

- cases N→N、SOAP M→M(N/M 取自 preflight raw)、id sets exact match、
  未知欄位丟失 0、`case_d17test` 出現次數 = 0
- patients = unique(nonblank patientCode);blank-code cases / duplicate
  patient ids / orphan cases / orphan patients 全 = 0
- 9 個 patient 欄位(含 birthYear)逐欄 parity;conflict 每筆有來源+裁決
- 每個 exposure 的 event id 序列:migration 前後相同或 append
  (`validate-clinical-invariants.js --prefix-check` 直接可用)
- post-migration export 含 patients + 全部 V2 rows;隔離 round-trip
  canonical hash 相同
- 同 source rerun `0/0/0`;rollback 回原 hash
- 以上全綠 → Codex 最終 GO → Ting 在場執行真機切換

## 執行順序

1. app.js 修正批(等 Codex batch-2 WIP commit 後):#6 timestamps、#2 import
   restore/merge + prefix-check 接線、tcmPatternSelections.note、R1-R5 進
   import 前驗證
2. `migrate-c2b.js` + dry-run + 隔離測試(假資料)
3. Codex 重審(計畫+程式+dry-run 報告)
4. Preflight + 真機執行(Ting 在場)
