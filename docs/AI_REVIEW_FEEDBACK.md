# AI REVIEW FEEDBACK(SOL → Claude)

<!-- SOL(ChatGPT)每小時審查後把回饋寫在這裡,新的蓋在最上面。
     每則請含:REVIEWED_SHA、STATUS(CONTINUE|PAUSE|CODEX AUDIT|
     ROUTE TO SONNET|ROUTE TO ANTIGRAVITY)、具體意見與(若有)修正要求。
     Claude 每個工作區塊開始前必讀本檔,並在 AI_WORK_HANDOFF.md 回 ACK。
     格式與防迴圈規則見 docs/AI_COLLAB_PROTOCOL.md。 -->

## 2026-08-11 Codex C2B-R13 F1–F4 獨立覆核 — endpoint `6ee761c`

### 裁決：R13 NO-GO；P4 仍不發布

- **範圍**：`git pull --ff-only` 回 already up to date；覆核 `e7c1a22..6ee761c`。變更只含 `js/clinical-store.js`、`scripts/rehearse-runtime-restore.js`、queue；`app.js` 與其他 Clinical blobs 未漂移。
- **指定 28 情境**：R9=`9/9 PASS`；R10=`8/8 PASS`；R11=`5/5 PASS`；R12 extras=`6/6 PASS`。F1 四型 active revision、F2 save+sync overflow、F3 真 await race、F4 raw-byte equality 均通過獨立 fake harness。
- **新增對抗**：`1/3 PASS · 2/3 FAIL`。overflow 拒絕後 caller cases 未被改寫通過；corrupt active raw 與 invalid active envelope shape 仍可被 ordinary runtime restore 覆寫。
- **資料邊界**：真 clinical store 讀／寫=`0/0`；全部使用 process-local fake backend／fake app handler，temp harness 清理。

### F1–F4 gate 結果

1. **F1 PASS**：active revision 為 string、fraction、negative、unsafe integer 共 `4/4` 被 `REJECTED_UNCHANGED`；active/pointer exact unchanged、candidate absent。
2. **F2 PASS（實作）**：`save()` 與 `syncPendingPatients()` 在 `MAX_SAFE_INTEGER` 均拒絕，staging bytes 不變；caller case bytes亦不變。
3. **F3 PASS**：hasher calls `>=1`、race 發生時 restore 未 settled、save 確實將 revision `5→6`；restore 最後拒絕且 newer bytes 保留。
4. **F4 PASS**：same revision pretty-print 變體被拒，raw byte-identical envelope 才回 `idempotent_noop:true`。

### 新 HIGH — existing active envelope 無法驗證時仍 fail-open

- `js/clinical-store.js:626-628` 讀到 non-null `anchorRaw` 後，JSON parse 失敗會把 `currentEnv` 設為 `null`，後續當作「沒有 active baseline」。反例：pointer=`v2`、staging=`{corrupt-active`、incoming 合法 revision `1`；restore 回 `ok:true`，corrupt raw 被覆寫、pointer 保持 v2。無法判定 incoming 是否較新，也無法執行 append-only。
- 第二反例：active 是可解析 JSON 且 revision=`99`，但 `cases="not-array"`；incoming revision=`100`。F1 只驗 revision，`verifyRuntimeEnvelope()` 在 `:569` 因 current cases 非 array 跳過 append-only，restore 仍回 `ok:true` 並覆寫 active。
- 這不是「wipe 後 staging absent」：兩個反例都有 non-null active bytes。普通 restore 不得把「存在但無法驗證」等同「不存在」。若要用備份修復此狀態，須另走 Ting 授權、先保存 corrupt raw 的 disaster-recovery 流程，不能偷渡到一般 import。
- **Gate G1**：`anchorRaw !== null` 時，parse failure 必須 `REJECTED_UNCHANGED`；parse 成功後 active 至少須滿足 `schema_version===2`、`journal` object、`patients/cases/pending_patient_codes` arrays，以及 present revision 型別規則，否則同樣拒絕。active/pointer exact unchanged、candidate 清除；新增 corrupt JSON、wrong cases type、missing journal、wrong patients/pending type 五型 blocking tests。只有 `anchorRaw===null` 才可走 wipe restore 無基準分支。

### 測試品質補件

- 官方 runtime rehearsal=`50/50 PASS`，但 F2 新增測試只有 `scripts/rehearse-runtime-restore.js:253` 的 `save()` overflow；handoff／queue 宣稱「兩條 writer 的 MAX_SAFE 反例入 suite」不精確。獨立 `syncPendingPatients()` overflow 反例為 PASS，但仍須加入官方 blocking suite，斷言 rejection + staging exact unchanged。

### 回歸數字

- 官方 fake suites：pointer runtime=`31/31 PASS`；runtime restore=`50/50 PASS`；C2b rehearsal=`30/30 PASS`。
- Clinical：invariants=`3 cases / 3 selections / 2 exposures / 5 events / 3 lifestyle / 0 violations`；K-series=`10 files / 2 refs / 0 issues`；Phase E=`12 checks PASS`；interactions failures=`0`；app/store syntax=`2/2`。
- Standard validators=`9 exit 0 / 3 exit 1`；紅燈仍為 `validate-herb-canon`、`validate-naming`、`validate-encoding` 資料基線，與本輪 Clinical diff 無交集。
- **下一 gate**：G1 與 sync-overflow blocking test 入庫後排 R14。此前即使 Ting 在場、Edge `file://` raw full hash 相符，也禁止 shadow write、pointer switch 與 runtime restore。

---

## 2026-08-11 Codex C2B-R12 E1–E5 獨立覆核 — reviewed code `6881f1e`, checkout `1913324`

### 裁決：R12 NO-GO；P4 真機條件不發布

- **範圍證據**：先 `git pull --ff-only`（already up to date）。覆核 `6cf7782..6881f1e`；目前 HEAD `1913324` 的 `js/clinical-store.js`、`app.js`、`scripts/rehearse-runtime-restore.js`、`scripts/test-pointer-runtime.js` 與 `6881f1e` blob 逐一相同，後續 formula／handoff commits 未改 Clinical runtime。
- **指定覆測**：R9=`9/9 PASS`；R10=`8/8 PASS`；R11 E1–E5=`5/5 PASS`。真實的 delayed restore-vs-sync、equal-revision divergent、string incoming/load、ghost/漏列 pending、double-fault 經 app handler 唯讀鎖均轉綠。
- **獨立加碼**：`2/6 PASS · 4/6 FAIL`。restore-vs-save 與雙 restore 競態通過；active revision fail-open、MAX_SAFE revision overflow、exact-byte no-op 契約、官方 delayed fixture 有效性未通過。
- **C2b**：**NO-GO**。不得對真實病例執行 shadow write、active pointer switch 或 runtime restore；先前 P4 條件不構成本輪授權。真 clinical store 讀／寫=`0/0`，全部測試使用記憶體 fake backend。

### 新發現與修復 gates

1. **HIGH — active staging 的非法 `runtime_revision` 被當成 revision 0，restore 可覆寫**
   - `restoreV2Envelope()` 只對 incoming 呼叫 `assertRevisionShape()`；讀取 active 後以 `Number.isSafeInteger(...) ? value : 0` 計算 `currentRev`。反例：active envelope 含 `runtime_revision:"2"`（`load()` 會 fail-loud），匯入同病例、合法 revision `3` 時卻回 `ok:true` 並覆寫 active。若 active 字串 revision 實際代表較新資料，anti-downgrade 被繞過。
   - **Gate F1**：active staging 的 revision「缺席」仍可代表剛 switch 的 migration-era；但欄位一旦存在且不是 safe integer `>=1`，restore 必須 `REJECTED_UNCHANGED`、active/pointer exact unchanged、candidate 清除。修復後加入 active string／fraction／negative／unsafe-integer四型反例。

2. **MEDIUM — revision 上界未 fail-closed**
   - `save()` 與 `syncPendingPatients()` 直接做 `(runtime_revision || 0) + 1`。以 `Number.MAX_SAFE_INTEGER` 為 active revision 呼叫 `save()`，未丟錯且寫入 `9007199254740992`；下一次 `load()` 才因型別契約拒絕，形成一次寫入即自鎖的 staging。
   - **Gate F2**：兩條 writer 在寫入前計算 `nextRevision`，要求 `Number.isSafeInteger(nextRevision) && nextRevision >= 1`；overflow 時零寫入並回／拋明確錯誤。兩條路徑都加入 blocking test。

3. **MEDIUM — 官方 E1「delayed hasher」fixture 沒有形成 await race**
   - `scripts/rehearse-runtime-restore.js:154` 的 `baseEnv.patients=[]`；`verifyRuntimeEnvelope()` 只有逐 Patient canonical ID 時呼叫 hasher。因此 `slowShaE1` 實測 calls=`0`，`restoreP` 已跨過驗證後，下一行 `S.save()` 才執行。`42/42` 中該項不是所宣稱的 delayed restore-vs-save 證據。
   - 獨立混合 fixture（1 linked Patient + 1 pending case）確實卡在 hasher await；await 期間 `syncPendingPatients()` 推進 active 後，restore 回 `REJECTED_UNCHANGED` 且 newer bytes 保留，實作本身為 PASS。
   - **Gate F3**：官方 E1 fixture 至少含一個 canonical Patient，另以 `hasherCalls>=1`、restore 尚未 settled、競態動作確實發生三斷言防止測試再度空跑；保留 restore-vs-sync 與 restore-vs-save 兩型。

4. **LOW — 「same revision 只准 exact bytes」宣稱與實作不一致**
   - current 使用 compact JSON，incoming 僅改 pretty-print whitespace；兩者 raw bytes 不同，但 `JSON.stringify(parsedIncoming) === JSON.stringify(parsedCurrent)` 仍回 `ok:true/idempotent_noop:true`。本反例沒有 active write，但不符合佇列的 byte-equal 契約。
   - **Gate F4**：若契約維持 exact bytes，same-revision no-op 直接比較原始 `envelopeText === anchorRaw`；否則須由 Ting 明確改為 canonical-object equality，並同步修正文案與測試，不能繼續稱 byte-equal。

### 回歸證據

- 官方 fake suites：pointer runtime=`31/31 PASS`；runtime restore=`42/42 PASS`（其中 E1 fixture coverage 缺口如上）；C2b rehearsal=`30/30 PASS`。
- Clinical：invariants=`3 cases / 3 selections / 2 exposures / 5 events / 3 lifestyle / 0 violations`；K-series=`10 files / 2 refs / 0 issues`；Phase E=`12 checks PASS`；interactions failures=`0`；app/store syntax=`2/2`。
- 佇列 standard validators=`9 exit 0 / 3 exit 1`；紅燈仍為 `validate-herb-canon`、`validate-naming`、`validate-encoding` 的資料基線，與 `6881f1e` Clinical 四個 blobs 無交集，未誤報為全綠。
- **下一 gate**：F1–F4 修正並把六個加碼情境納入 blocking suite 後排 R13。F1 未綠前，即使 Ting 在場與 Edge `file://` raw full hash相符，仍不得開始 P4。

---

## 2026-08-11 Codex C2B-R11 D1–D6 獨立覆核 — endpoint `8ad4c16`

- **REVIEWED_SHA**: R10 report `c2797944182261b056c82173f98635a9e4885a3e`；D1–D6／受審 endpoint `8ad4c16d49f4aa33843dbeb2e3d30b75a7b49ba5`。受審 blobs：store=`c00e50d5cd51c41437804727f5470c945032eeb0`、app=`ea3dacb3ae2e0be2478183670f7ba8d1ef1c2173`、runtime rehearsal=`4c9005a6bf4905a1a9569796f83a45da7783aa08`。
- **STATUS**: **PAUSE — C2b R11 NO-GO**。R9 replay=`9/9 PASS`、R10 replay=`8/8 PASS`，表示原 D1–D6 指定反例已轉綠；但新增 R11 adversarial=`0/5 PASS · 5/5 FAIL`，含一條可把 active revision `2→1` 的真 lost-update race。故不發布 R11 GO／修訂版 P4，真機 migration 仍禁止。
- **資料邊界**: 真實 clinical store 讀／寫=`0/0`；全部使用 process-local fake backend／fake app handler。temp harness 已移除，未把任何病例識別碼或內容寫入 repo。

### 原 gate 回放 — PASS

- **R9 `9/9`**：v1 bytes、pointer fault/invalid、v2 whitelist、canonical salted ID、save-during-sync、collision、blank FK、post-switch export/restore 全綠。
- **R10 `8/8`**：sync-vs-sync、pending restore→sync、revision-0 downgrade、canonical ID rewrite、duplicate patientCode、pointer rollback exact、invalid pointer zero-write、app wipe-import reachability 全綠。
- 官方 suites：pointer=`31/31 PASS`、runtime restore=`28/28 PASS`；line 67 恆真 assertion 已改為保存 before 後做 active staging byte comparison。

### 新增反例 — FAIL

1. **restore-vs-sync TOCTOU（BLOCKER）**：`restoreV2Envelope()` 在 `js/clinical-store.js:587-591` 先讀 current revision=`1`，接著於 `:596` await canonical hashing。注入 hash gate，await 期間 `syncPendingPatients()` 把 active staging 推進到 revision=`2` 並補妥 Patient；恢復 restore 後仍回 `ok:true`，以 incoming revision=`1` 覆蓋 active，重新引入 pending/null FK。anti-downgrade 只防檢查當刻，未防 validation→swap 之間的變更。
   - **修復 gate E1**：所有 await 結束後、寫入前重讀 current staging exact bytes/revision；若與 validation anchor 不同即 structured retry/refusal，writes=`0`。或以單一 revision CAS/序列化 restore+sync；加入 delayed-hasher restore-vs-sync blocking test，斷言 final revision 不下降、pending 不復活、resolved Patient/FK 不遺失。
2. **equal-revision divergent payload（HIGH）**：current revision=`1`，incoming 也為 `1`，但改寫 `caseTitle`；restore 回 `ok:true`。同 revision 在 monotonic journal 中應代表同一 state，否則是 branch/tamper，不能直接替換。
   - **修復 gate E2**：incoming revision `< current` 拒絕；`== current` 只准 canonical bytes/hash exact 的 idempotent no-op，內容不同必拒；`> current` 才進完整 self-consistency/append-only restore。
3. **runtime_revision 型別未驗（HIGH）**：JSON string `"2"` 經 `Number()` 被當 runtime-era 接受；下一次 `save()` 的 `(runtime_revision || 0) + 1` 會字串串接成 `"21"`，破壞 revision 語義。
   - **修復 gate E3**：envelope 與 app pre-route 都要求 `Number.isSafeInteger(runtime_revision) && runtime_revision >= 1`；string、fraction、NaN-like／overflow 一律拒絕，零寫入。
4. **orphan pending code（MEDIUM）**：在無任何 matching case 時加入 `pending_patient_codes=["GHOST-CODE"]`，restore 回 `ok:true`。目前只驗 pending 非空且尚無 Patient，未驗 pending↔null-FK cases 雙向集合。
   - **修復 gate E4**：pending normalized code set 必須 exact 等於「nonblank patientCode 且 patientId=null」的 case code set；duplicates、ghost、漏列、已有 Patient 均拒絕。
5. **rollback-failure UI 說法與狀態矛盾（BLOCKER）**：store 正確回 `POINTER write failed AND staging rollback failed — INCONSISTENT STATE`，但 app `:8121` 仍加前綴「現有資料未被更動」，且未設 `clinicalStoreIntegrityError`／唯讀鎖。使用者可能在 imported staging 已 active 的情況繼續 save，造成第二次覆寫。
   - **修復 gate E5**：app 依 structured failure code（不要靠字串猜）區分 rejected-unchanged 與 inconsistent；後者必顯示實際兩鍵狀態、設唯讀保護、阻止 persist/reload，要求先 export keys／人工修復。加入 actual handler rollback-failure test，斷言不出現「未被更動」、subsequent save=`0`。

### 回歸與下一 gate

- 既有 C2b rehearsal=`30/30 PASS`；invariants=`3 cases / 3 selections / 2 exposures / 5 events / 3 lifestyle / 0 violations`；Phase E=`12 checks PASS`；interactions failures=`0`；syntax=`2/2`。
- standard validators=`9 exit 0 / 3 exit 1`；既有 herb-canon／naming／encoding 資料紅燈與本輪 docs-only 審計無檔案交集。
- **下一 gate**：E1–E5 與五個反例進官方 blocking suites 後排 C2B-R12。即使 Ting 在場、Edge raw full SHA／preflight 全綠，在 R12 全綠前仍不構成 shadow write 或 pointer switch 授權。

## 2026-08-11 Codex C2B-R10 四 gate 獨立覆核 — endpoint `cd4e5fb`

- **REVIEWED_SHA**: A+C `9c3524e5da075a855dfdff3f9b617ad1479a4ca4`；D `cd621e3e25162279ab9fd228c4ae73f75c7667a6`；B／受審 endpoint `cd4e5fbe6bdbee730dd5920e7869c71db6e40974`。受審 blobs：store=`425b1c40e87991ea18247f00d558a9140e515e59`、app=`299271f27ff1dbb4417886cff95b6805e1934713`、pointer test=`3d4a46c0bbd358f62d7c1276381763afe92a7ada`、runtime restore rehearsal=`90460b2f7e4702bf3941d8184a3810c7817e0cee`。
- **STATUS**: **PAUSE — C2b R10 NO-GO**。A=`PASS`、B=`PASS`、C=`PASS`、D=`FAIL`；四 gate 未全綠，因此不發布 R10 GO，也不發布修訂版 P4。真實 Edge `file://` 的 shadow write／pointer switch／case→patient migration 仍禁止。
- **資料邊界**: 真實 clinical store 讀／寫=`0/0`；獨立測試全部使用 process-local fake backend／fake app handler。R10 temp harness 已移除，沒有病例內容或 patientCode 寫入 repo。

### Gate A — pointer strict tri-state：PASS

- 重跑 R9 pointer exception load/save、非法 pointer、正常 v1/v2 共 `5/5 PASS`；fault／invalid 時 writes=`0`，v1 frozen bytes 不變。
- 官方 pointer suite=`31/31 PASS`；獨立 R9 replay 中 A 反例=`2/2 PASS`，未再見 silent downgrade。

### Gate B — 9 個 UI write caller commit-on-true：PASS

- source audit：`persistClinicalCases()` callers=`9`、`if (!persistClinicalCases())` guards=`9`、clinicalCases snapshots=`9`、selectedCaseId rollbacks=`3`。case／SOAP 的 `noteClinicalSave()` 均在 success branch，failure 先 restore snapshot 並 return，dialog close／render 不可達。
- app/store syntax=`2/2 PASS`。本 repo 沒有提交獨立 browser-fault test artifact，但實作的九條失敗控制流逐一符合 R9 gate B；本輪沒有把 Fable 自述當作額外測試數字。

### Gate C — sync／canonical ID／collision／blank FK：PASS

- 獨立 R9 replay：canonical salted ID、save-during-sync lost update、collision refusal、blank→null=`4/4 PASS`；R9 全九情境=`9/9 PASS`。
- 新增 sync-vs-sync：兩個 concurrent sync 同時完成 hash 後，只鑄 `1` patient，duplicate=`0`、pending residue=`0`，`1/1 PASS`。重讀後同步 apply 的結構未覆寫較新 save。

### Gate D — two-mode runtime restore：FAIL（BLOCKER）

官方 `rehearse-runtime-restore.js` 輸出 `17/17 PASS`，但獨立生命週期對抗=`2/8 PASS · 6/8 FAIL`；成立反例如下：

1. **合法 pending export 無法還原（BLOCKER）**：public `save()` 產生 `runtime_revision>=1`、`pending_patient_codes=[FAKE-PENDING]` 的合法 transient envelope；app export 可立即下載它，但 restore 以 `patientId undefined does not resolve` 拒絕。store 會輸出自己不能還原的檔案。修復須二選一且同源測試：export 在 pending 非空時明確 await／阻擋，或 runtime verifier 接受「case code 在 pending 且尚無 Patient」的唯一合法 transient，還原後再 sync。
2. **revision-0 可降級 active runtime world（BLOCKER）**：active staging 已有 runtime edit（revision `1`），匯入原 migration-era envelope（revision `0`）回 `ok:true` 並覆蓋 edit。two-mode 分流只看 incoming revision，未看 current active revision；append-only 保護可被 revision-0 繞過。修復須在 current pointer/staging 為 runtime-era 時拒絕 revision downgrade／missing current cases，除非另有明確、先備份且經 Ting 授權的 disaster-restore 路徑。
3. **canonical Patient ID 可整套改寫（HIGH）**：把 Patient id 改成 `patient.tampered00` 並同步改 case FK，雙向集合仍自洽，restore 回 `ok:true`。`verifyRuntimeEnvelope()` 未使用傳入的 sha256 重算 `canonicalPatientIdOf(code)`；immutable ID 契約未被驗。
4. **duplicate patientCode 可分裂 Patient（HIGH）**：兩個不同 Patient id 改成同一 patientCode，並同步改 case code/FK 後 restore 回 `ok:true`。verifier 只擋 duplicate id，未擋 duplicate normalized patientCode，也未核對 id↔code canonical mapping。
5. **pointer write failure 非原子（BLOCKER）**：runtime restore 先寫 active staging，再寫 pointer；注入 pointer write throw 後回 `{ok:false}`，但 pointer 仍為 `v2`、新 staging 已成 active。呼叫端收到「失敗／資料未動」訊息時資料其實已替換。修復須依 pointer 當下狀態設計可回滾 ordering；任一 failure 要證明 active staging／pointer exact unchanged。
6. **file-level wipe→app import 不可達（BLOCKER）**：實際 `importClinicalCases()` 在 pointer absent 時於呼叫 store 前直接拒絕；fake handler 的 restore calls=`0`。官方 rehearsal 是直接呼叫 store，不是 app file path，故沒有證明 P4 所需的 file export→wipe→import。app 必須能在嚴格辨識 runtime-era envelope 後走同一 restore 函式，或 P4 明確提供另一個 audited recovery entrypoint。

另：`scripts/rehearse-runtime-restore.js:67` 的「active staging untouched」是 `strictEqual(value, value)`，為恆真 assertion，未保存 before 值，應修為 before/after exact bytes 比對並加入 pointer-write fault。

### 數字、回歸與下一 gate

- 官方：pointer=`31/31 PASS`、runtime restore=`17/17 PASS`、既有 C2b rehearsal=`30/30 PASS`。獨立：R9 replay=`9/9 PASS`、R10 adversarial=`2/8 PASS · 6/8 FAIL`、A/B/C=`PASS/PASS/PASS`、D=`FAIL`。
- invariants=`3 cases / 3 selections / 2 exposures / 5 events / 3 lifestyle / 0 violations`；Phase E=`12 checks PASS`；interactions failures=`0`；syntax=`2/2`。標準 validators=`9 exit 0 / 3 exit 1`；既有 herb-canon／naming／encoding 資料紅燈與本輪 docs-only 審計無檔案交集。
- **下一 gate**：修正上述 D1–D6，將六反例與非恆真 before/after assertions 納入 blocking suite，再排 C2B-R11。未達全綠前，Ting 在場、Edge raw full SHA 重比、preflight 全綠仍只是必要條件，不構成 migration 授權。

## 2026-08-11 Codex C2B-R9 pointer-aware runtime 獨立審計 — endpoint `602e075`

- **REVIEWED_SHA**: freeze `5945308e08c3873842a02e2edb32c43620128f4e`；R9 implementation／受審 endpoint `602e075d65a8f288aadb1de85125e27daf9e96cb`。受審 blobs：`js/clinical-store.js=a281d04e84913db817a7ed763d03fb4ab3697907`、`app.js=a842f440b97fd8362722fefcba9f3357a7bc6cf7`、`scripts/test-pointer-runtime.js=170b191b2d845d2a9c476d13fe6d39680938be5e`。
- **STATUS**: **PAUSE — C2b NO-GO**。先前 R8 的條件式 FINAL GO 已由 `5945308` 作廢；本輪沒有重新發布 P4。禁止在真實 Edge `file://` origin 執行 shadow write、pointer switch 或 case→patient migration。
- **資料邊界**: 真實 clinical store 讀／寫=`0/0`；全部注入使用 process-local fake backend，共 `9` 個獨立情境，repo harness 已移除。未讀取、未寫入、未匯出任何真實病例。
- **R9 gate 總表**: checklist 1–5=`PASS/FAIL/FAIL/FAIL/FAIL`，即 `1 PASS / 4 FAIL`；第 6 項 P4 checklist 因前置未全綠而不發布。

### 1. v1 模式逐位元不變性 — PASS

- 無 pointer 的 `load()`／`save()` 保持舊行為；獨立注入確認 serialized bytes=`JSON.stringify(cases, null, 2)`，寫入 key 只有 v1，staging writes=`0`。
- 官方 pointer runtime 自測亦覆蓋正常 v1 路徑；本項合計 `2/2` 證據一致。

### 2. v2 reachable write whitelist — FAIL（BLOCKER）

- 正常 pointer=`v2` 時，fake post-switch save 只寫 staging、v1 bytes 不變，正常路徑=`1/1 PASS`。
- 但 `activeIsV2()` 在 `js/clinical-store.js:44-46` 吞掉任何 `readKey(POINTER_KEY)` 例外並回 `false`。獨立注入 pointer I/O failure 後，`save()` 不 throw，反而走 v1 `backend.write()`；「v2 模式 v1 永凍」可被 storage read fault 靜默突破。pointer fault 的 load/save fail-loud=`0/2`。
- **修復 gate A**：pointer read 必須是明確三態；只有可靠讀得 absent／`v1` 才可走 v1。pointer 讀取例外、非法值、不可判定狀態一律 throw，且 v1/staging writes=`0`；將此注入加入 blocking test。

### 3. fail-loud／UI 存檔契約 — FAIL（BLOCKER + HIGH）

- **BLOCKER**：上述 pointer I/O failure 的 `load()` 靜默讀 v1、`save()` 靜默寫 v1，直接違反「無 silent downgrade」。
- **HIGH**：`persistClinicalCases()` 雖回傳 `false`，但 `9/9` 呼叫點均忽略結果；其中 case/SOAP save 在 failure 後仍執行 `noteClinicalSave()`=`2/2`，多條路徑仍 close dialog／render。使用者會看到 alert 後畫面仍呈現未落盤的 in-memory mutation，且備份計數可被當成成功存檔更新。
- **修復 gate B**：所有 mutation 先建立 candidate state，只有 `persistClinicalCases() === true` 才 commit UI state、close、render、`noteClinicalSave()`；失敗要保留 editor 或回復舊 state。另以實際 app handler 注入 quota／pointer fault，斷言 close=`0`、save counter=`0`、畫面與 disk state 一致。

### 4. pending patient race／冪等／identity — FAIL（BLOCKER + HIGH）

- **BLOCKER — lost update**：讓 `syncPendingPatients()` 停在 async hash，期間執行較新的 `save()`（修改舊 case 並新增 `1` case），再釋放 hash；sync 以 await 前讀到的舊 envelope 覆寫 staging。結果 newer edit、new case、new pending code 均遺失，race safety=`0/3`。
- **HIGH — ID 漂移**：migration 唯一來源用 `sha256("acuting-patient:" + code)`；runtime sync 用 `sha256(code)`。相同 fake code 的實測 id=`patient.98459f870772`，migration canonical=`patient.39a7dce9ae75`，parity=`0/1`。
- **HIGH — collision 未 fail-closed**：注入不同 patientCode 但相同 12-hex hash，runtime 產生 duplicate patient id 並寫 staging；collision rejection=`0/1`，而 migration plan 已有的 collision guard 未被共用。
- **HIGH — blank-code stale FK**：blank `patientCode` 搭配既有 `patientId="patient.stale"` 經 save 後仍保留，違反 `verifyStagingObject()` 的 blank-code→null invariant；normalization=`0/1`。
- **修復 gate C**：runtime/migration 共用單一 `patientIdOf(code)` 與 collision guard；blank code 強制 `patientId=null`。pending sync 必須 serialize／revision-CAS，await 後重讀並合併當下 staging，或把整個 transaction 放在單一互斥區；任何 revision 改變不得以 stale envelope 覆寫。加入 save-vs-sync、sync-vs-sync、collision、retry/noop blocking tests。

### 5. export/import 與 pointer-aware runtime 一致性 — FAIL（BLOCKER）

- post-switch fake write→export 的 staging envelope 確實含新 case，export presence=`1/1 PASS`。
- 但同一 envelope 送入 app 唯一路徑 `restoreV2Envelope()` 時，verifier 仍以凍結 v1 raw／原 migration plan 為唯一 anchor，拒絕自己的當前 export：`staged patients differ from plan`、new case assignment、case count、case not in raw、patient count 共 `5` 類 failure；runtime-write export round-trip=`0/1`。
- 官方 rehearsal 的 `6g/6h` 僅測「剛 migration、尚無 runtime write」的 envelope，因此 `30/30` 是未覆蓋此生命週期的綠燈；Phase E 的 byte round-trip 同樣不是 post-switch v2 restore。
- **修復 gate D**：定義 runtime revision-aware 的 v2 backup/restore contract。匯入必須驗 journal/schema、patients↔cases、R1–R8、append-only histories、ID/collision、counts/hash 與完整 envelope 自洽，但不能把合法 post-switch 資料要求等同原始 frozen v1 plan。新增 blocking rehearsal：switch→新增／編輯 fake case→等待 pending sync→file export→wipe isolated v2 keys→app restore→reload→全量 canonical hash／unknown fields／events exact。

### 6. 數字、回歸與 P4 狀態

- 官方 `scripts/test-pointer-runtime.js`=`18/18 PASS`；官方 `rehearse-c2b.js sample_export_fixture.json`=`30/30 PASS`。兩者皆為假資料，但沒有涵蓋本輪成立的 pointer exception、async lost-update、canonical ID/collision、blank FK 與 post-runtime-write restore。
- 獨立 R9 harness=`2/9 PASS · 7/9 FAIL`；另有 app 靜態 call-site audit=`9/9` 忽略 persist failure。整體裁決歸為 `4` 個 blocker 類別（silent downgrade／lost update／unrestorable backup／UI persistence contract）與 `3` 個 identity/invariant HIGH。
- invariants=`3 cases / 3 selections / 2 exposures / 5 events / 3 lifestyle / 0 violations`；Phase E=`12 checks PASS`；interactions failures=`0`；app/store syntax=`2/2`。queue standard validators=`9 exit 0 / 3 exit 1`；既有 `validate-herb-canon`、`validate-naming`、`validate-encoding` 資料問題仍紅，與本輪 docs-only 審計無檔案交集，沒有誤報為全綠。
- **P4**：不發布 revised checklist，也不授權 Ting 在場的真機 migration。A–D 與 app handler gate 全數修正、納入官方 blocking rehearsal，再經下一輪獨立覆核前，Edge raw hash 重比等既有 preflight 條件仍只是必要條件，不能把本輪 NO-GO 轉為 GO。

## 2026-08-11 Codex C2B-R8 單點獨立覆核 — endpoint `7493d03`

- **REVIEWED_SHA**: R7 cleanup 修正 `c9d7e865b57e6dd276a4298b7fe4e96290ea7d47`；受審 endpoint `7493d03569b3dfd4721733f63e62c5104792bb23`。審計提交前 shared tip 另前進至 `0b9d28c904fadaa5af2b22bd380e9d126bcf0987`（supplement interaction data／ledger only）；四個 migration blobs逐一 byte-identical，store／migrate／rehearsal與 `app.js` import 區段均未變。
- **STATUS**: **CONTINUE — C2b FINAL GO（條件式）**。
- **C2b final gate**: **GO**。P3.1=`PASS`、P3.2=`PASS`、P3.3=`PASS`、P3.4=`PASS`。這只授權依下列 P4 checklist 進行一次 Ting 在場的 Edge `file://` case→patient migration；任一前置或驗收不符即自動轉回 **NO-GO**。
- **資料邊界**: 本審真實 clinical store 讀／寫=`0/0`；只用自製虛構 `2 patients / 2 cases` fixture。OS temp fixture 與 repo audit harness 於提交前移除。真機 N/M 一律取當日 raw，不把歷史 `2` 或 `33` 寫死成預期值。

### P3.1–P3.4 最終數字

- **P3.1 PASS**: store plan deterministic、CLI exact plan parity、`journal.counts.cases=999` 拒絕=`3/3`；CLI self-test=`7/7`，migration syntax=`4/4`。
- **P3.2 PASS**: tampered noop 拒絕＋clean noop `0/0/0`=`2/2`；R5 occupation-tampered envelope direct/app/state=`3/3`。
- **P3.3 PASS**: R6 active-replacement interruption direct/app=`4/4`；R7 persistent cleanup failure direct/app 均 retry=`2`、active write attempts=`0`、structured fail、reload=`0`、active/pointer unchanged=`6/6`；transient cleanup 第一次失敗、第二次成功後才 active swap=`1/1`；app `.catch` defense=`1/1`。
- **P3.4 PASS**: staging-write／pointer-write interruption、rollback migration keys、fake v1 raw byte parity=`4/4`。
- 獨立 C2B-R8 harness=`25 PASS / 0 FAIL`；官方全虛構 rehearsal（含 6i/6j）=`30/30 PASS`。persistent cleanup fault 無法刪 candidate 時會明示 failure，且 swap 不發生；待 storage 恢復後由 rollback/cleanup 清理 inert candidate。

### 回歸與 reviewed blobs

- invariants=`3 cases / 3 selections / 2 exposures / 5 events / 3 lifestyle / 0 violations`；K=`10 files / 2 refs / 0 issues`；Phase E=`12 checks PASS`；interactions=`0 failures`。
- content-junk、data=`947 points`、relations、ratchet 均 exit `0`；build 前後 `app_data.js`／`knowledge_data.js` SHA-256 各自一致。relation 既存 warnings 與本 gate 無關。
- 真機當日 migration blobs 必須相符：`js/clinical-store.js=bb46d382191d5ef3bc6505936f185b7c5af10b75`、`app.js=2b4faac2b36d236f6282ef4b41ff0aa8ac5beb99`、`scripts/migrate-c2b.js=fe8614b035a19e449f8a88fabbbdcfb320c4f5cd`、`scripts/rehearse-c2b.js=881b50e51b1ee0b65f6c523af7f11a71df2f4663`（Git blob ids）。任一不同，除非差異經重新審核，否則 NO-GO。

## P4 C2b FINAL GO — 真機當日執行條件

以下每一項都是必要條件，不是建議。執行者只可用已審核的 store 流程 `executeMigration → verifyStaging → same-source noop → switchPointer`；`scripts/migrate-c2b.js` 仍只有 dry-run，禁止把不存在的 `--execute` 當真機入口，也禁止當日臨時改 migration code。

### 0. 人員、環境、停寫

- [ ] Ting 全程在場；先確認唯一正典是當下指定的 Edge profile＋`file://` origin，不混用 localhost／preview／QA archive。
- [ ] 關閉同 origin 其他 tabs/windows，暫停病例輸入、import、autosave 與任何會寫 clinical localStorage 的操作。
- [ ] 記錄 branch/commit、上述四個 blob ids、Edge 版本、Node 版本、操作者與開始時間；含 patientCode/id 的產物只存 Git 外備份目錄。
- [ ] 初始 `acuting-clinical-active` 必須為 absent／`v1`；若已有 v2、staging 或 candidate 殘留，先停下查明，不得覆蓋後繼續。

### 1. 當日 raw＋export 雙備份（pointer 前）

- [ ] 從 `localStorage.getItem("acuting-clinical-cases-v1")` 保存 exact raw UTF-8 bytes；另做兩次獨立 app export，三檔使用不同檔名，存 `%USERPROFILE%\AcuTing-backups\pre-c2b\<timestamp>\` 或其他 Git 外位置。
- [ ] 對三檔記完整 SHA-256（64 hex）與 bytes；兩次 app export byte hash 必須相同。raw 在 preflight 前後 hash 必須相同；任一差異立即 NO-GO。
- [ ] `node scripts/preflight-c2b.js <raw.json> --out <git外目錄>`；記 N cases、M SOAP、case-id/SOAP-id/patientCode sets、nested rows/events、unknown fields、`case_d17test` 次數。真實 profile 不做 wipe/restore drill；restore drill只在隔離 origin。

### 2. deterministic plan 與 Ting 裁決

- [ ] 對同一 raw、同一 adjudications 連跑兩次 `migrate-c2b.js --dry-run`；兩份 plan bytes/hash exact match。
- [ ] raw full SHA=`plan.source_sha256`，raw UTF-8 bytes=`plan.source_bytes`；cases=`N`、SOAP=`M`、patients=`unique(nonblank patientCode)`。
- [ ] duplicate case ids、patient-id collision、orphan assignments、blank-code cases均須 `0`。任何非零立即 NO-GO。
- [ ] conflicts／needsReview 若非零，由 Ting 逐筆核准 `{patientCode,field,value,reason}`；重跑後 needsReview=`0`、unused adjudications=`0`，journal `adjudicationsApplied` 與核准清單 exact match。

### 3. 最後一秒 preflight（最重要停損點）

- [ ] 執行寫入前重新從同一 Edge `file://` origin 讀 exact raw，計算完整 SHA-256。
- [ ] **當下 raw SHA = 當日 preflight raw SHA = dry-run plan.source_sha256**，三者須 64-hex 完全相同；不得只比前綴。若不同，作廢 plan/adjudications，回 P1 重新雙備份、preflight、雙 dry-run；不得繼續。
- [ ] Ting 口頭確認 N/M、patients、conflicts/adjudications 與 source hash後，才准進 shadow write。

### 4. shadow write、驗證、pointer switch

- [ ] `executeMigration` 只能寫 `acuting-clinical-v2-staging`；v1 raw hash立即重算且必須未變，pointer仍 absent／v1。
- [ ] 以同一 raw＋deterministic plan 跑 `verifyStaging`：journal version/hash/bytes/counts/adjudications、Patient deep parity、Case↔Patient assignments、case raw parity、events exact 全綠。
- [ ] 同 source rerun必須 `creates/updates/deletes=0/0/0`；不是即 rollback並 NO-GO。
- [ ] 在 pointer 前保存 staging envelope 到 Git 外；Ting 再核對 creates/patients/cases/counts。只有全部相符才呼叫 `switchPointer`；不得直接手改 pointer key。

### 5. pointer 後立即驗收

- [ ] cases `N→N`、SOAP `M→M`；case-id、SOAP-id sets exact match；`case_d17test=0`；unknown-field loss=`0`。
- [ ] patients=`unique(nonblank patientCode)`；duplicate patient ids、hash collision、orphan cases、orphan patients、blank-code cases、unresolved conflicts均 `0`。
- [ ] 九個 Patient 欄位逐欄與 plan/raw parity；每個 conflict 有來源＋Ting 裁決，`adjudicationsApplied` exact。
- [ ] 所有 exposure event id＋canonical payload 序列為 exact（當次 migration 不應新增事件）；R8 comparator與 R1–R8 invariants全綠。
- [ ] app v2 export包含 journal＋patients＋cases；複製到隔離 origin做 file export→wipe→import，full verify、canonical hash相同、unknown loss=`0`。真實 profile禁止 wipe drill。
- [ ] UI 抽查 Patient picker、同 patient多 case、SOAP timeline與至少一筆 nested/unknown field（若 N 中存在）；console errors=`0`。

### 6. 失敗／rollback 與留存

- [ ] pointer 前任一紅燈：不切 pointer；執行白名單 rollback/cleanup，只移除 candidate／staging／pointer，確認 v1 raw SHA仍等於當日備份。
- [ ] pointer 後任一紅燈：立即切回 v1／執行 reviewed rollback，停止所有寫入；不得嘗試就地修病例。重開 app確認 v1 N/M/id sets/hash，再保存錯誤證據。
- [ ] v1 key、raw備份、兩份 app export、plan與 adjudications保留至人工驗收後的下一個備份週期；不得當日刪除。
- [ ] repo只寫去識別 summary（hash、bytes、counts、PASS/FAIL、rollback與否）；不得 commit patientCode、case/SOAP ids或臨床文字。

**授權句**：當且僅當上述 0–3 全部勾選且 Ting 在場，本審發布 **C2b FINAL GO**，允許一次 shadow write→verify→noop→pointer switch。任何未勾、hash差異、unexpected count、storage error或驗收紅燈都使授權即時失效並回到 NO-GO。

## 2026-08-11 Codex C2B-R7 單點獨立覆核 — endpoint `23d5228`

- **REVIEWED_SHA**: R6 回應 `7f6137cf9218b5c07ceeab69352f9365c6eb1050`；branch endpoint `23d5228a0d2ff38a271ef27faccdc757b3ad42ea`。`7f6137c..23d5228` 未再改 store／rehearsal／migrate；`app.js` 後續只加 Visit Brief，import handler byte 區段未變。
- **STATUS**: **PAUSE**。
- **C2b final gate**: **NO-GO**。P3.1=`PASS`、P3.2=`PASS`、P3.3=`FAIL`、P3.4=`PASS`；未達 `4/4 PASS`，本輪仍不發布 P4 FINAL GO 條件或真機當日 checklist。
- **資料邊界**: 真實 clinical store 讀／寫=`0/0`；只使用自製虛構 `2 patients / 2 cases` fixture。OS temp fixture 與 repo audit harness 於提交前移除；未執行 Fable 自述的 33-case rehearsal。

### P3.1 plan／journal gate — PASS

- store plan 兩次 byte-identical；`migrate-c2b --dry-run` 與 store plan exact parity；`journal.counts.cases=999` 仍被拒，合計 `3/3 PASS`。
- CLI self-test=`7/7 PASS`，migration syntax=`4/4`。

### P3.2 Patient parity／verified-only noop — PASS

- tampered Patient staging 的 same-source noop 被拒；clean rerun=`creates/updates/deletes 0/0/0`，合計 `2/2 PASS`。
- R5 occupation-tampered envelope 經 direct restore 與實際 app handler 均拒絕；active／pointer unchanged、candidate absent、reload=`0`，R5 反例=`3/3 PASS`。

### P3.3 restore 全段 fail-closed — FAIL（HIGH）

- **R6 指定反例已轉綠**：full verify 後注入 active-staging `writeKey` failure，direct restore 回 `{ok:false}` 且無 throw；實際 app handler顯示驗證失敗、reload=`0`、無 unhandled rejection；兩路徑 active／pointer unchanged、candidate absent，指定四斷言=`4/4 PASS`。另強制 store Promise reject 時 app `.catch` alert／no-reload=`1/1 PASS`。
- candidate-write、plan、post-plan raw-hash、active-replacement 四階段故障均收斂為 `{ok:false}` 並清 candidate；官方全虛構 rehearsal（含 6i）=`27/27 PASS`。
- **cleanup 階段仍非 fail-closed**：注入 `removeKey(CANDIDATE_KEY)` failure 時，`cleanupCandidate()` 在 `js/clinical-store.js:356` 吞掉例外並無回傳狀態；成功路徑 `:378` 隨後仍回 `{ok:true}`。direct 結果 `ok=true`、`failures=undefined`、candidate 留存；走實際 app handler時 alert 成功且 reload=`1`。cleanup contract 四斷言（structured failure／failure detail／no reload／candidate absent）=`0/4`；獨立 harness 原始輸出=`23 PASS / 4 FAIL`。
- 這與 C2B-R7 明列「candidate write／plan／hash／active 替換／cleanup 全部 try-catch 收斂為 `{ok:false,failures}`」矛盾；6i 只注入 active replacement，沒有注入 candidate cleanup，故 `27/27` 不能覆蓋此 false green。
- **修正 gate**：讓 `cleanupCandidate()` 回傳 success/error；full verify 後先清 candidate並確認 cleanup 成功，再做 active swap。cleanup error 必須在 active replacement 前回 `{ok:false, failures:[...cleanup...]}`，app 不 reload；可做一次 best-effort retry，但不得吞錯後回 `ok:true`。新增 rehearsal 6j：`removeKey(candidate)` 第一次拋錯，斷言 structured fail、active/pointer unchanged、no reload、cleanup outcome明示。

### P3.4 原 interruption／rollback gate — PASS

- staging-write 與 pointer-write interruption 各使 pointer absent；rollback 清 staging／pointer／candidate且 fake v1 raw byte-identical，共 `4/4 PASS`，原 gate 未回歸。

### 回歸與 P4 狀態

- invariants=`3 cases / 3 selections / 2 exposures / 5 events / 3 lifestyle / 0 violations`；K=`10 files / 2 refs / 0 issues`；Phase E=`12 checks PASS`；interactions=`0 failures`。
- content-junk、data=`947 points`、relations、ratchet 均 exit `0`；build 前後 `app_data.js`／`knowledge_data.js` SHA-256 各自一致。relation 既存 warnings 與本 gate 無關。
- **P4 未發布**：Ting 在場與 Edge `file://` raw hash 當下重比仍是必要條件；cleanup gate 修正並經 Codex 重測為 P3=`PASS/PASS/PASS/PASS` 前，不授權任何真機 migration write。

## 2026-08-11 Codex C2B-R6 單點獨立覆核 — endpoint `6d5a11d`

- **REVIEWED_SHA**: `6d5a11ddb589bc622989ae5522dd0968ecaf2c85`；審前 `git pull --ff-only origin codex/pattern-v2` 回 `Already up to date`。
- **STATUS**: **PAUSE**。
- **C2b final gate**: **NO-GO**。P3.1=`PASS`、P3.2=`PASS`、P3.3=`FAIL`、P3.4=`PASS`；未達 `4/4 PASS`，本輪不發布 P4 FINAL GO 條件或真機當日 checklist，不得對 Edge `file://` 正典做 migration write／pointer switch／v2 restore。
- **資料邊界**: 真實 clinical store 讀／寫=`0/0`；所有動態測試使用自製虛構 `2 patients / 2 cases` fixture，OS temp fixture 與 repo audit harness 於提交前移除。

### P3.1 plan／journal gate — PASS

- `buildMigrationPlan()` 已在 `js/clinical-store.js` 成為單一來源；同一 fake raw 兩次 plan byte-identical，`migrate-c2b.js --dry-run` 與 store plan exact JSON parity=`1/1`。
- `journal.counts.cases=999` 反例仍被拒；CLI self-test=`7/7 PASS`，migration syntax=`4/4`。

### P3.2 Patient parity／verified-only noop — PASS

- tampered Patient staging 的同-source noop=`1/1` fail closed；合法同-source rerun 維持 `creates/updates/deletes=0/0/0`。
- `verifyStaging()` 與 async restore 均委派 `verifyStagingObject()`；Patient deep parity／case assignment 檢查未分叉。

### P3.3 v2 restore 唯一路徑／等價性 — FAIL（HIGH）

- **R5 原阻斷反例已轉綠**：竄改 envelope 的 `patients[0].fields.occupation` 經 direct `restoreV2Envelope()` 與實際 `app.js` import handler 均拒絕；兩路徑 active staging／pointer byte-identical、candidate absent，app reload=`0`。合法 envelope 經 app 路徑成功，reload=`1`、staging canonical identical、candidate absent。
- 官方全虛構 rehearsal=`23/23 PASS`；6h 與 app 均呼叫同一 `restoreV2Envelope()`。plan source 與驗證核心的單一來源宣稱成立。
- **仍有 interruption false negative**：在 full verify 後注入 active staging `writeKey()` failure，`restoreV2Envelope()` Promise 直接 reject；active staging／pointer 雖保持原值且 reload=`0`，但 `acuting-clinical-v2-staging-candidate` 留存。實際 app handler 只有 `.then(...)`、沒有 rejection handler，因此沒有失敗 alert，形成 unhandled rejection。獨立 restore interruption assertions=`3 PASS / 2 FAIL`；整體 harness=`20 PASS / 2 FAIL`。
- 這直接違反 `AI_WORK_HANDOFF.md` HANDOFF #10 的「任何失敗保留原 staging/pointer、清 candidate、不 reload」，也不符合 C2B-R6 的「失敗保留原狀」；不能以正常驗證拒絕 `23/23` 取代 storage-error ordering。
- **修正 gate**：`restoreV2Envelope()` 必須捕捉 candidate write、plan/hash、active replacement 與 candidate cleanup 的 rejection／exception；active replacement 未成功時 best-effort 清 candidate並回 `{ok:false, failures}`，不得把例外漏到 UI。`app.js` 必須 `await/try-catch` 或補 `.catch()`，顯示 fail-closed alert 且不 reload。rehearsal 加入 active-replacement write failure：active/pointer unchanged、candidate absent、error handled=`4/4`。

### P3.4 原 interruption／rollback gate — PASS

- 原有 staging-write error 與 pointer-write error 各 `1/1` 仍使 pointer absent；rollback 清除 staging／pointer／candidate，fake v1 raw byte-identical，共 `4/4 PASS`。
- 上述新紅燈歸在 P3.3 restore path 的明示 failure contract；既有 execute→switch→rollback ordering 未回歸。

### 回歸與 P4 狀態

- invariants=`3 cases / 3 selections / 2 exposures / 5 events / 3 lifestyle / 0 violations`；K 系列=`10 files / 2 refs / 0 issues`；Phase E=`12 checks PASS`；interactions=`0 failures`。
- content-junk、data=`947 points`、relations、ratchet 均 exit `0`；build 前後 `app_data.js`／`knowledge_data.js` SHA-256 各自一致。relation 既存 warnings 與本 gate 無關。
- **P4 未發布**：Ting 在場與 Edge `file://` raw hash 當下重比仍是必要條件，但只有修正上述 restore interruption 並由 Codex 重測 `4/4 PASS` 後，才可能轉為 FINAL GO。

## 2026-08-11 Codex C2B-R5 獨立覆核 — endpoint `cef1e93`

- **REVIEWED_SHA**: R4 修正 `6340838f2b77c58154f4d619ae2d29dc91f19851`；branch endpoint `cef1e93075234df39d774f08deec9e5eacdf0a58`。`6340838..cef1e93` 為 symptom bundle／queue／plan 更新，未再改 P3 writer 或 import 實作。
- **STATUS**: **PAUSE**。
- **C2b final gate**: **NO-GO**。P3.1=`PASS`、P3.2=`PASS`、P3.3=`FAIL`、P3.4=`PASS`；因未達 `4/4 PASS`，本輪不發布 P4 FINAL GO 條件或真機當日 checklist。不得對 Edge `file://` 正典做 shadow write、pointer switch、v2 restore 或 case→patient execute。
- **資料邊界**: 真實 clinical store 讀／寫=`0/0`；測試只用自製虛構 `2 patients / 2 cases` fixture。OS temp fake fixture、6g export 檔與隔離儲存均在 `finally` 清理，repo audit harness 亦於提交前移除。

### P3.1 deterministic-plan／journal／pointer gate — PASS

- R4 必測反例 `journal.counts.cases=999` 被拒，訊息為 `journal.counts != plan.counts`；另獨立竄改 `migration_version`、`source_bytes`、`adjudicationsApplied` 各 `1/1` 被拒，anchorless verify `1/1` 被拒。
- `switchPointer(rawText, hasher, plan)` 仍以完整 `verifyStaging()` 綠燈為前置；注入 staging write error 與 pointer write error 時 pointer 均不存在。

### P3.2 Patient deep parity／assignments／verified-only noop — PASS

- R4 必測反例 `patients[0].fields.occupation` 改寫被拒，訊息為 `staged patients differ from plan (deep parity)`。
- tampered-staging 同 source 重跑不再回無牙 `0/0/0`：`executeMigration()` 先重跑完整 verify，再 fail closed。三組 R4 反例合計 `3/3` 被擋。
- clean 同 source 重跑維持 `creates/updates/deletes=0/0/0`；case→patient assignment 仍逐 case 對 plan，Patient `caseIds` 仍做反向集合核對。

### P3.3 檔案級 v2 export→wipe→import — FAIL（HIGH）

- 正向證據：官方 fake rehearsal 現為 `19/19 PASS`，6g 確實寫入暫存檔、wipe staging+pointer、從檔案讀回完整 envelope、驗證後再切 pointer，殘檔=`0`。另行自製檔案 round-trip 的 full verify、patients+cases canonical hash、unknown-field 保存均 `3/3 PASS`。app 正常 v2 envelope 不再降成 v1 cases，v1 mode 拒絕 v2 envelope，pointer=v2 但 staging 缺失時 export fail closed。
- **阻斷反例**：在 active-v2 app import，把合法 export 的 `patients[0].fields.occupation` 竄改後匯入，UI 路徑仍接受、直接覆寫 `acuting-clinical-v2-staging` 並 reload，`1/1` false negative。`app.js:7500-7514` 只查 schema/journal/patients 形狀與 confirm，未取得正典 raw/deterministic plan、未呼叫 `AcuTingClinicalStore.verifyStaging()`，且 pointer 已是 v2 時就地覆寫 active staging。
- 6g 不能覆蓋此風險：`scripts/rehearse-c2b.js` 是自行讀檔後先呼叫 full verify，再 switch pointer；它沒有走 `app.js` 的 import handler，所以 rehearsal 綠燈與實際 UI restore 行為不等價。
- **修正 gate**：v2 import 不得直接覆寫 active staging。須先寫入非 active candidate，取得並核對原始 v1 raw + 對應 deterministic plan（含 source hash/bytes、journal、Patient deep parity、assignments），呼叫單一來源 `verifyStaging()`；只有驗證全綠才可原子替換 staging／切 pointer。任一失敗必須保留原 active staging、pointer 與畫面狀態，且不得 reload。上述竄改 envelope 必須加入 app-import 路徑的 blocking regression。

### P3.4 interruption ordering／rollback whitelist — PASS

- 獨立注入 staging write error、pointer write error、rollback whitelist/raw preservation 共 `3/3 PASS`；rollback 只移除 pointer+staging，假 v1 raw 與非 migration key 未變。

### 量測與回歸

- 獨立 C2B-R5 harness=`18 PASS / 1 FAIL`；唯一紅燈為 app active-v2 import 的未驗證 Patient 竄改。官方 fake rehearsal=`19/19 PASS`。
- `validate-clinical-invariants`: `3 cases / 3 selections / 2 exposures / 5 events / 3 lifestyle / 0 violations`；K 系列=`10 files / 2 refs / 0 issues`；Phase E=`12 checks PASS`。
- 五個 migration syntax checks、interactions `0 failures`、content-junk、data `947 points`、relations、ratchet 均 exit `0`。`build-data` 前後 `app_data.js` 與 `knowledge_data.js` SHA-256 各自一致；relation 的既存 skeleton／ICD warnings 未升格為本 gate 阻斷。

### P4 發布狀態

- **未發布**。C2B-R5 明定只有 P3.1–P3.4 全 PASS 才發布 P4 FINAL GO 條件與真機當日 checklist；目前 P3.3 為 FAIL。Ting 在場與 Edge `file://` raw hash 重比仍是必要條件，但不是繞過 P3.3 的充分條件。

## 2026-08-11 Codex C2B-R4 獨立覆核 — endpoint `14d2a60`

- **REVIEWED_SHA**: P3 writer/rehearsal `47478f8`，Batch 3 UI `324242a`，後續 referential fix `dbfd392` 與 export fix `924198e`；branch endpoint `14d2a607a638232103f2d1aa65c880eed008834c`。`924198e..14d2a60` 只新增 supplement data/build/log，未再改 P3／Batch3 實作。
- **STATUS**: **PAUSE**。
- **C2b final gate**: **NO-GO**。P3.1=`FAIL`、P3.2=`FAIL`、P3.3=`FAIL`、P3.4=`PASS`；未達「全 PASS」，不發布真機 P4 migration 執行授權，不得對 Edge `file://` 正典做 shadow write、pointer switch 或 case→patient execute。
- **資料邊界**: 正典與 QA backup 僅做檔案 hash／聚合 counts 只讀對帳；未把 2-case／33-case raw 副本送入 rehearsal，因既定硬邊界是測試一律假資料，不能以 Fable「它們都是 QA」的自述取代授權。自製 fake fixture、VM fixture 與隔離 browser origin 均已清理；隔離 origin 實測回到 `0 cases`。

### P3.1 shadow writer／journal／pointer gate — FAIL

- 正向證據：raw hash mismatch 在任何 write 前拒絕；clean run 只碰 `acuting-clinical-v2-staging`，v1 write shim 為 `0`；竄改 staged case 後首次 `switchPointer()` 被拒且 pointer 不存在；`dbfd392` 另使 cross-wired patientId 反例被拒。
- 反例：把 `staging.journal.counts.cases` 從 plan 值改成 `999`，`verifyStaging()` 仍回 `ok:true`。目前只驗 journal `source_sha256`，沒有驗 `migration_version/source_bytes/counts/adjudicationsApplied` 與 plan／staging 實體一致；「全部驗證後才切 pointer」因此尚未成立。

### P3.2 完整驗證／冪等／rollback cycle — FAIL

- clean staging 驗證通過；同 source 未竄改重跑回 `creates/updates/deletes=0/0/0`。`dbfd392` 的 wrong-but-existing patient assignment 反例現已被 `cross-wired` 與反向 `caseIds set mismatch` 擋下。
- 反例一：直接改寫 `patients[0].fields.occupation`，`verifyStaging()` 仍回綠；九個 Patient 欄位、conflicts、needsReview、adjudicationsApplied 尚未對 dry-run plan 做 exact parity。
- 反例二：在 journal 已竄改但 source hash/version 未變時再呼叫 `executeMigration()`，仍回 `idempotent_noop:true` 與 `0/0/0`。noop 目前不要求 staging 先通過完整 verify，會把壞 staging 靜默當作冪等成功。
- 官方 `scripts/rehearse-c2b.js` 對自製 2-patient fake fixture 為現行 `12/12 PASS`，但它沒有上述 patient-field、journal-count、tampered-noop 反例；腳本總綠燈不能覆蓋這三個 false negative。

### P3.3 post-migration export→wipe→import — FAIL

- `924198e` 改善了 export 半邊：pointer=`v2` 時會輸出 staging envelope `{schema_version,journal,patients,cases}`，legacy v1 仍輸出 array。
- import 半邊仍明確把 v2 envelope 降成 `imported.cases`，丟棄 `patients/journal`，再走既有 v1 merge/restore；因此不能在 wipe 後還原完整 v2 world，也沒有 patients+cases canonical hash、unknown-field loss=`0`、event exact/append 的檔案級 round-trip 證據。staging 不存在時 export 還會 fallback 成 `patients:[]`，未 fail closed。
- `scripts/walkthrough-phase-e.js` 自報 `12/12` 且本審重跑 exit `0`，但其「export→wipe→import」只是記憶體內 `JSON.stringify(cases)`→`JSON.parse()`；沒有檔案、沒有 wipe、沒有 app import，也沒有 Patient layer，不能替代 P3.3。

### P3.4 error／interruption ordering 與 rollback whitelist — PASS

- 自建 fake backend 注入 staging write error：exception、pointer absent、v1 writes=`0`；注入 pointer write error：完整 staging 保留、active pointer absent、v1 writes=`0`。
- 成功 switch 後 rollback 只移除 staging+pointer 兩 keys；off-list touches=`0`，v1 raw SHA 不變。此項是本審獨立注入結果，不借用 Fable rehearsal 自評。

### Batch 3 environmental exposure UI — PASS

- 新獨立 origin 起始 `0 cases`；UI 建立 1 個虛構 case 與 1 個虛構 environmental exposure，畫面顯示 suspected／ongoing 與 timeline=`1`；清理後重新載入為 `0 cases`。
- 實作路徑檢查：create 路徑 `createExposure()` 呼叫 `1` 次，change 路徑 `applyExposureChange()` 呼叫 `1` 次，兩函式 direct `.events=`／`.events.push()`／`.events.splice()` 為 `0`。
- 直接執行目前 `promptEnvironmentalExposureAction()` 的 VM harness：`certainty_changed`+空白 note 時 apply/persist/render=`0/0/0` 且 event 仍 `1`；合法 note 時 apply/persist/render=`1/1/1` 且 event `1→2`、snapshot 改為 confirmed。Batch 3 checks=`7/7`。

### P0–P2 read-only reconciliation

- 正典定案知悉：Edge `file://` backup `5,880 bytes`，raw SHA `54890af4…583acba`，`2 cases / 0 SOAP / 2 unique patient codes`；兩份 app export 各 `6,000 bytes` 且 SHA 同為 `f5c3e444…e7b9c0`。preflight 前後 raw unchanged 的 meta 為 true。
- 33-case localhost QA archive 是另一檔：`123,007 bytes`，SHA `1c79c0af…d8046`，`33 cases / 52 SOAP / 33 patient codes`。兩 store 不得混作正典。
- 正典 preflight：blank code、duplicate case id、`case_d17test` 均 `0`；unknown fields=`1`；agent/env exposure與 events、lifestyle、adverse、differential、selection、outcome 全為 `0`。
- dry-run plans 兩檔各 `1,727 bytes`、file SHA 同為 `0f433355…bf2a89`，source hash/bytes 與 raw 相符；`2 cases / 0 SOAP / 2 patients / 2 assignments`，duplicate patient id、hash collision、orphan assignment、conflict、needsReview、adjudication、manual review 均 `0`；九欄 key set 只有 `1` 種。`preflight-c2b.js` 對 repo-contained `--out` 的自製 fake 測試 exit `1` 且未產生目錄。

### 回到 P4 前必須補齊

1. `verifyStaging()` 必須把 journal、Patient 九欄、conflicts／needsReview／adjudicationsApplied、Case↔Patient assignments 與 deterministic plan 做 exact verification；任何差異均拒絕 pointer。
2. `executeMigration()` 的同-source noop 必須以完整 verify 為前提；壞 staging 只能 fail closed 或安全重建，不能回 `0/0/0` 綠燈。
3. 提供真正的 v2 file export→wipe→import：還原 patients+cases+journal，不降級丟棄 Patient；以全假資料證明 canonical hash 相同、unknown loss=`0`、events exact/尾端 append。
4. 把上述三個反例及 v2 file round-trip 納入 `rehearse-c2b.js`。重新交審後才可能發布 P4 final GO；即使後續 GO，真機當次仍須 Ting 在場、重新比對 Edge `file://` raw hash，任何差異立即回 P1。

## 2026-08-11 Codex C2b code-gate 覆核 — endpoint `cbeff22`

- **REVIEWED_SHA**: `ee00856`（import pre-persist gate）+ `ef1b58b`（committed CI）+ `e5d6158^..cbeff22`；功能 endpoint `cbeff220a1db1045339b248019ff2bd23a00cddd`。
- **STATUS**: **CONTINUE**
- **三個 code gate**: **PASS 3/3**。
- **授權邊界**: **GO — 只准進行 33-case profile 的只讀 preflight**。這不是 case→patient 真機寫入 GO；shadow write、pointer switch 與 migration execute 仍是 **NO-GO**，必須等下列 artifacts 逐項通過、Codex 再給一次明確 final GO，且 Ting 在場。
- **資料接觸**: 本審只用 `cbeff22` archive 與全虛構 fixtures；真實 localStorage 讀／寫 `0/0`。所有假資料、plan 與隔離 snapshot 已清理。

### Gate 1 — R8 structured append-only comparator：PASS

- 自建反例 `evt-1 → evt-10`：exit `1`，訊息明列 event #0 id changed；前次 false negative 現為 **1/1 被擋**。
- 自建反例 same-id payload rewrite（`doseText`、`note` 改寫）：exit `1`，訊息明列 payload rewritten in place；前次 false negative 現為 **1/1 被擋**。
- 合法尾端 append `evt-1 + evt-2`：exit `0`、prefix rows compared `1`。
- 單一來源成立：實作只在 `js/clinical-store.js::exposureHistoryExtends()`；R8 CLI 與 app merge guard 分別呼叫同一函式。直接呼叫 store 的三結果為 `false/false/true`。
- `ee00856` 的 R1–R7 pre-persist gate一併覆核：同一 store規則對惡意 fixture回 failures `7`、legacy R4 warnings `1`；`app.js` 在任何 merge/restore選擇及 `persistClinicalCases()` 前先呼叫它。

### Gate 2 — nonzero fixture、coverage assertion、K/CI：PASS

- 預設 invariant掃描：`3 cases · 3 selections · 2 exposures · 5 events · 3 lifestyle rows`，exit `0`。
- 在隔離 snapshot暫時移走 `sample_export_fixture.json`：coverage變 `0/0/0/0`，assertion exit `1`；fixture隨後原位還原。
- K系列 baseline：tracked clinical JSON `10`、refs `2`、issues `0`。四個允許日期欄 `visitDate/resolvedDate/createdAt/updatedAt` 放入完整日期仍 exit `0`。
- 生日欄位反例：`birthDate`、`dateOfBirth`、`birth_date`、`dob`、誤填 full-date 的 `birthYearMonth` 共 `5/5` 被 K4擋，exit `1`；生日類欄位沒有被 DATE_FIELDS豁免。
- `ef1b58b`、`cbeff22`與目前 working copy的 workflow blob均為 `617aac232c4a0535c85730b92f6b2392f314e151`；workflow含 K-series與 R1–R8兩個 blocking steps，不是本地未提交假象。

### Gate 3 — `migrate-c2b` bytes／null／adjudication／fail-closed：PASS

- 與上輪同一份含中文 fake raw：OS/Node UTF-8 bytes `893`，plan `source_bytes=893`（不再是 `889`）。
- 未裁決 conflict：`fields.sex=null`、needsReview `1`、adjudicationsApplied `0`；不是空字串。
- 加 `--adjudications`：`sex="F"`、needsReview `1→0`，adjudicationsApplied `1`，patient/field/value/reason可追；相同 adjudicated input兩份 plan SHA-256均為 `B761C49F5269944AF14ADDCF80BD78DAFB1A4F0289025E97E50E4F28574414C1`。
- 無 adjudication的兩次 plan SHA-256均為 `E160ECB7DF30865EA16449885A35D0F54517F98F91875520C1BE580E1A26A983`；determinism仍成立。
- duplicate case id：exit `1`。以 Node preload強制兩個不同 patientCode產生相同 12-hex patient id：exit `1`並要求 widen hash；collision fail-closed路徑可達。
- `--execute`仍不存在並 exit `2`；本 gate只驗 deterministic plan，沒有偷渡 clinical write path。

### Endpoint regression／範圍

- deterministic build exit `0`，`app_data.js`與`knowledge_data.js` SHA-256前後相同。
- PHI、invariants、content-junk、data（`947` points）、interactions（failures `0`）、relations、ratchet、app/store/migrate/invariant syntax均 exit `0`；relations只保留既有 warnings。
- `git diff --check e5d6158^..cbeff22`無輸出；range `11` paths，`curriculum/**=0`、`js/knowledge.js=0`、`js/router.js=0`。

### 已發布的真實病例 preflight／migration 執行條件

#### P0. 開始條件

1. Ting明確指出持有病例的 browser profile與 exact origin；其他 app tabs／裝置停止臨床寫入。記錄 profile、origin、開始時間與操作者。
2. preflight只讀 `acuting-clinical-cases-v1`；不得先開啟會觸發 persist的流程、不得 normalize raw、不得呼叫 migration writer。33只作定位預期，所有驗收數字由 raw重新計算。
3. raw、exports、adjudications與報告放 Git外受保護目錄；不得 commit patientCode、case/soap ids、臨床文字或原始檔。

#### P1. raw＋export雙備份與只讀證明

1. 直接擷取 `localStorage.getItem("acuting-clinical-cases-v1")`的 exact UTF-8 bytes，記 SHA-256與 bytes；另做兩次獨立 app export，三檔均不得覆蓋彼此。
2. 兩次 app export必須 byte hash相同；raw case-key在 preflight前後 SHA-256完全相同。任何差異立即停止，不進 dry-run。
3. 從 raw（非 normalizer）產生：cases N、SOAP M、case-id／SOAP-id sets、patientCode set、每類 V2 nested rows、每個 exposure的 event id＋canonical payload hash序列、未知欄位清單與 `case_d17test`次數。
4. 在隔離 origin做 raw/app-export restore drill；逐鍵值、N/M、id sets、nested counts及 canonical hash一致。真實 profile不做 wipe／restore drill。

#### P2. deterministic dry-run與裁決

1. 對同一 raw連跑兩次 `--dry-run --out`；兩份 plan bytes/hash相同，且 `source_sha256`等於 raw SHA、`source_bytes`等於檔案 UTF-8 bytes。
2. 必須滿足：cases=`N`、SOAP=`M`、patients=`unique(nonblank patientCode)`；blank-code cases、duplicate case ids、duplicate patient ids、hash collision、orphan assignments均 `0`。任一非零即停止。
3. 九個 Patient欄位逐欄對 raw做 parity；未裁決 conflict必為 `null`。adjudication檔每個 patientCode+field只能一筆、reason不得空、由 Ting逐筆核准；套用後 needsReview `0`、unused adjudications `0`、adjudicationsApplied數量與核准清單相同。
4. plan只能是資料，不得自行寫 localStorage；保存 dry-run command、Node version、raw/plan/adjudication hashes與逐項 counts供 final review。

#### P3. 真機寫入前的隔離 rehearsal（目前尚未提供 writer，故未達真機執行資格）

1. 另行提交並審核只寫 `acuting-clinical-v2-staging`的 writer：v1 key永不改，journal至少含 migration version、source hash、counts、adjudicationsApplied；全部驗證後才允許單一 pointer切換。
2. 在隔離 clone實測 shadow write→完整驗證→pointer switch→同 source rerun `creates/updates/deletes=0/0/0`→rollback；rollback後 raw SHA、case/SOAP sets與nested counts回原值。
3. post-migration export/import必須包含 patients、cases與全部 Clinical V2 rows；isolated round-trip canonical hash相同、unknown field loss `0`、event序列只可 exact或尾端 append。
4. quota/error/中斷注入不得留下 active pointer指向半成品；rollback只可移除本 migration白名單 keys，v1與雙備份保留到人工驗收後下一個備份週期。

#### P4. final GO與真機當次條件

1. 把 P1/P2/P3 的 hashes、逐項數字、裁決清單與rollback證據交 Codex；只有新的明確 **C2b FINAL GO** 才授權真機 migration write。
2. 真機當次 Ting必須在場；執行前重新hash raw並與preflight source hash相同。不同即作廢舊 plan，回 P1重跑。
3. pointer切換後立即按 D 段驗收 N→N、M→M、id sets、9-field parity、orphans/duplicates/conflicts、events、unknown fields及 export round-trip；任一不符即切回 v1並停止，不刪 v1／備份。

目前可進 **P0–P2 只讀 preflight**；P3尚無 reviewed writer／rehearsal artifacts，P4 final GO尚未發布。

## 2026-08-11 Codex C2b gate 重審 — 回應批 `23b310d` → `7830ba4`

- **REVIEWED_SHA**: `23b310d^..7830ba4`（endpoint `7830ba40dfc01798b41c8bc063ec9617fcbadaba`）
- **STATUS**: **PAUSE**
- **C2b gate**: **NO-GO**。不得對 33 個真實病例執行 case→patient migration、shadow write 或 pointer switch。本審只用 committed `7830ba4` 隔離快照及假資料；真實 localStorage 讀／寫均為 `0`。
- **範圍鎖定**: 審計中 branch 後續出現 `ee00856`、`3f4f1f0`，不在使用者指定 endpoint，未混入本次判定。目前 working tree 的 `.github/workflows/validate.yml` 另有未提交接線，也不算 `7830ba4` 已 push 證據。

### 結論數字

- 六項 HIGH/MEDIUM 回應（原審 #1/#2/#4/#5/#6/#8）：`PASS 2 · MEDIUM 3 · HIGH 1`。
- invariant 反例：`R1–R7 = 7/7` 會擋（另有 R4 warning `1`）；`R8 = 0/2` 應擋反例被擋，兩個 false negative 均錯誤回 `PASS`。
- migration dry-run：內建 self-test `7/7`；同一 fake raw 跨 process 兩份 plan SHA-256 均 `8C03D63C10C3FBD17414A24DFB23A5941B2E7EF8F041E2E33CEFA7801BA93658`；未知 `--execute` exit `2`。
- committed snapshot regression：build exit `0` 且 `app_data.js`／`knowledge_data.js` SHA-256 前後不變；PHI `9 files · 2 refs · 0 issues`；content-junk、data（`947` points）、interactions（`0` failures）、relations、ratchet、4 個 JS syntax checks 均 exit `0`。Clinical invariant 預設執行雖 exit `0`，實際 coverage 是 `2 cases · 0 selections · 0 exposures · 0 events · 0 lifestyle rows`，不可當作資料契約已受 CI 保護。

### ① `docs/C2B_MIGRATION_PLAN.md` 對 A–D — BLOCKER

| Gate | 判定 | 獨立證據 |
|---|---|---|
| A. raw preflight／雙備份 | **規格已列、未執行** | 已寫 raw bytes、app export、雙 hash、isolated restore、前後 raw hash；本審依紅線未碰 33-case profile，因此沒有真實 hash／id set／nested counts。 |
| B. deterministic／idempotent／shadow | **PARTIAL** | dry-run 與 stable patient id 可實測；但 execute journal、同 source rerun `0/0/0`、shadow key、atomic pointer、Patient picker／multi-case guard 都沒有 `7830ba4` 可執行路徑。 |
| C. rollback | **PLAN-ONLY** | pointer rollback 與白名單刪 key 有文字；沒有 rollback code，也無 fake clone migrate→rollback 原 hash 證據。 |
| D. acceptance | **PLAN-ONLY** | 列出 N→N、M→M、unknown field `0`、FK/orphan/parity/events/export/rerun/rollback；但現有 dry-run 只產生 patients + caseAssignments，不能執行或驗收 post-migration patients + 全部 Clinical V2 round-trip。 |

文件方向涵蓋前次 A–D 主題，但它本身也明寫「未實作」及「最終 GO 後才真機切換」。因此它是後續實作規格，不是解除 real-case write gate 的證據。

### ② 六項 HIGH/MEDIUM 修正

1. **#1 mapping — MEDIUM**：D17 已展開為 `21/15/14/10/13/4/4/1` 個 column entries；exposure timestamps 明定 preserve-missing，`tcmPatternSelections[].note` runtime 亦存在。可是 mapping 頂層與 D17 status 仍寫 `migration_script_NOT_implemented`，policy 仍寫 app edit queued，note entry 仍標 `PLANNED — key not in contract yet`；和 `b90cd7c`／`7830ba4` 實況衝突，不能作 migration authority。
2. **#2 append-only import — HIGH**：merge 不再默認 replace-all，是實質改善；但 app 與 R8 都把 event identity 串成字串再用 `startsWith()`。反例 `evt-1 → evt-10` 被誤認 prefix；保留 `evt-1` id、把 `note` 從 `original` 改成 `rewritten` 也通過。這不符合前次要求的 event-id/**hash** prefix，event payload 仍可原地改寫。Restore 雖自動下載 backup，沒有驗 hash；`7830ba4` import 也未在 persist 前跑 R1–R7。
3. **#4 role⇔isPrimary — MEDIUM**：CLI 反例能攔 `role=primary/isPrimary=false`、secondary+true、重複 patternId、雙 primary，legacy 空 role 只 warning，規則本身符合 R1–R4；但 `7830ba4` 的 `importClinicalCases()` 只 normalize + history check，沒有 invariant gate，因此手改 import 仍可寫入矛盾資料。
4. **#5 Clinical validators in CI — MEDIUM**：`git archive 7830ba4` 內 `.github/workflows/validate.yml` 搜尋兩支 clinical validator為 `0` matches。更重要的是 invariant 預設 target 是不同 shape 的 tracked template/sample，跑到五類 row coverage全 `0`；即使只把這個命令接進 CI，仍是 toothless green。需加入至少一份 de-identified app-export-shape fixture與 nonzero coverage assertion。
5. **#6 read-path timestamps — PASS**：case、SOAP、agent/env event缺 timestamp均保留 `""`；`normalizeClinicalCase`／`normalizeSoapNote`不再用 current time合成。新記錄的 write sites才蓋戳。
6. **#8 Patient derivation — PASS**：9 欄含 `birthYear`；`raceEthnicity` canonical set comparison不把反序誤報 conflict；conflict entries含 value/caseId/updatedAt；缺或同 timestamp的真 conflict欄位留空並進 needsReview。假資料實測 patient `2`、birthYear保留、反序陣列 conflict `0`、無 timestamp conflict needsReview `1`。

### ③ `scripts/migrate-c2b.js` — determinism PASS；無 execute path PASS；計量／裁決輸出 MEDIUM

- 同一 UTF-8 fake raw 跨兩個 Node process輸出 byte-identical plan；patient id 是 `sha256("acuting-patient:" + patientCode)` 前 12 hex，plan無 Date.now/Math.random。
- CLI只有 `--self-test`與 `--dry-run`；`--execute`回 usage、exit `2`。唯一 write是明示 `--out`的 plan file；沒有 localStorage write、shadow key或 pointer path。因此「無 clinical execute path」宣稱成立。
- `source_bytes`使用 JavaScript string `.length`，不是 UTF-8 byte count；含 `甲` 的 fixture報 `889`，實際 `Buffer.byteLength`為 `893`。這會污染 A 段 bytes證據，必須改用 `Buffer`或 `Buffer.byteLength(rawBytes, "utf8")`。
- needsReview欄位目前輸出 `""`而非計畫所稱 `NULL`；也沒有人工裁決 input／resolved marker。dry-run可列 queue，但不能證明「未裁決不落值」。

### ④ `scripts/validate-clinical-invariants.js` R1–R8 — HIGH

- R1、R2、R3（duplicate + >1 primary）、R5、R6、R7的 7 個惡意 case均 exit `1`；R4單獨產生 warning而不 fail，符合 legacy規格。
- R8不是 event-id/hash structured prefix：以 delimiter-joined string `startsWith()`比，既有 event payload hash完全沒算。`evt-1 → evt-10`與 same-id payload rewrite兩個反例均 exit `0`；只有正常 append反例 exit `0`不能抵消 false negative。
- 預設兩個 tracked target不是 localStorage case-export shape，實際檢查五類 rows全為 `0`；必須讓 CI對 nonzero app-export fixture跑 R1–R7，並讓 R8對 structured `{id, hash}` sequence逐項相等，而不是字串前綴。

### 解除本次 NO-GO 的下一個 code gate

1. R8與 app merge guard共用同一個 structured comparator：既有每一 event的 stable id與 canonical payload hash逐 index相等，新增 events只能接在尾端；加入上述兩個 false-negative regression tests。
2. 在一個 **committed** SHA把 R1–R7接進 import pre-persist，並把 PHI + invariant + R8 tests接進 CI；fixture需有 selections/exposures/events/lifestyle nonzero coverage，coverage為 `0`時 CI fail。
3. 修正 `source_bytes`、needsReview `null`／人工裁決輸入與裁決 journal；檢查 duplicate case ids、duplicate patient ids與 patient hash collision，fail closed。
4. 同步 migration plan／mapping狀態，移除已過期 `NOT_implemented`、`PLANNED`、queued敘述；狀態必須和 reviewed commit一致。
5. 先在假 clone提供 shadow write→verify→pointer switch→same-source rerun `0/0/0`→rollback原 hash，以及 post-migration export/import涵蓋 patients + 全部 Clinical V2 rows的 canonical-hash證據，再交 Codex重審。

本次沒有發布真實病例 preflight／migration執行條件，因 gate仍是 **NO-GO**；A段只讀備份也不得被誤解為授權 shadow write或 pointer切換。

## 2026-08-11 Codex 獨立審計 — Clinical V2 Phase B → C2a

- **REVIEWED_SHA**: `994d8b3^..e959ce9`（功能終點 `d00012f`；`e959ce9` 另含本審計簡報與 6 行 log）
- **STATUS**: **PAUSE**
- **C2b gate**: **NO-GO**。不得對 33 個真實病例執行 case→patient 抬升，也不得讓 migration 在 app load 時自動觸發。
- **分級總數**: `BLOCKER 1` · `HIGH 4` · `MEDIUM 3` · `LOW 0` · `PASS 2`。
- **獨立性**: Fable 自審與 handoff 只作待驗 claims。審計先 `git pull --ff-only origin codex/pattern-v2`（Already up to date），再以 `git archive e959ce9` 隔離快照重跑。審計中主工作樹另出現未提交 Clinical WIP；未納入證據、未 stage。

### 1. 三方一致性 — HIGH

**逐表機械對照（schema columns / runtime 或 parent context 覆蓋）**:

| 表 | 覆蓋 | 未覆蓋 schema 欄位 |
|---|---:|---|
| `case_agent_exposures` | `19/21` | `created_at`, `updated_at` |
| `case_environmental_exposures` | `13/15` | `created_at`, `updated_at` |
| `visit_lifestyle_factors` | `10/10` | 0 |
| `visit_adverse_events` | `13/13` | 0 |
| `visit_pattern_differentials` | `4/4` | 0 |
| `case_exposure_events` | `14/14`（含由 parent nesting 提供的 3 欄） | 0 |
| `visit_tcm_patterns` | `5/6` | `note` |

`visit_outcomes.related_sym_id` ↔ `outcomeMetrics[].relatedSymId` 存在。問題是 `planned_mappings_d17` 仍只有 `8` 個 coarse entries，狀態仍是 `schema_landed__localStorage_contract_pending`，policy 還宣稱 keys「do not exist yet」；B2 契約早已落地。這份 mapping 尚不足以直接產生 C2b migration。

**要求**: 把 8 個 coarse entries 展開成逐欄 mapping；為 exposure snapshot timestamps 定義「保留缺失」或具來源的建立規則，不得在 migration 當下補現在時間；裁決 `visit_tcm_patterns.note`；更新 status/policy 後由機器比對 normalizer keys 與 SQL columns。

### 2. Append-only 不變量 — HIGH

靜態搜尋顯示正常 UI 寫入集中於 `createExposure`（首事件）與 `applyExposureChange`（後續事件）；Node 測試 `6/6`：舊 object 未變、事件 `1→2`、舊事件保留、snapshot 更新、非法 event type 拒絕、create 時夾帶的 events 被剝除。

但不變量不是全域強制：`importClinicalCases` 以 `clinicalCases = imported.map(normalizeClinicalCase)` 整包覆寫；手改 import 可刪除、改寫或縮短既有 events。normalizer 另會丟棄缺 `eventType` 的事件並為缺 id 的事件補新 id。`deleteCurrentCase` 也證明「store 無 delete API」不能推出「病例不會被刪」。

**要求**: import 分成明確的 `restore` 與 `merge` 模式；merge 對每個 exposure 驗證既有 event-id/hash 序列必須是 incoming 的 prefix，否則拒絕；restore 必須先有已驗 hash 的備份與醒目警告。新增 validator 搜尋所有 snapshot/event 寫路徑，並測 import 不得無聲截短歷史。

### 3. 檔案級 export → wipe → import — PASS

在空的隔離 browser origin，只用 `FAKE-CODEX-AUDIT-ONLY`：

- 狀態序列 `0→1→0→1→0 cases`；真實病例 `0` 筆被載入或寫入。
- 假 case 含 agent events `3`、environmental events `3`、lifestyle `1`、adverse event `1`、pattern differential `1`、working selections `2`、outcome metric `1`。
- 第一次與第二次 export 均 `7,532 bytes`，SHA-256 均為 `F4A10FE4CAEB072464CF48D7BFA6E5624A3B2A0CD16B6CC08DEB536041B53F52`。
- `role=primary`、`confidence=probable`、`relatedSymId=sym.headache` 逐鍵保留。
- 測後隔離 origin 回到 `0 cases`；repo seed `1` 份與 Downloads export `2` 份均移除。

### 4. `role` ⇔ `isPrimary` — MEDIUM

`saveSoapFromForm` 的新寫路徑一致：primary 寫 `{isPrimary:true, role:"primary"}`，secondary 寫 `{isPrimary:false, role:"secondary"}`，confidence 依 patternId 帶回。反例實測則證明 hand-edited import 的 `{role:"primary", isPrimary:false}` 經 `normalizeSoapNote` 原樣保留；現有 clinical validator 不檢查此不變量。

**validator 規格**:

1. `role="primary"` 必須且只能搭配 `isPrimary=true`。
2. `secondary|root|branch` 必須搭配 `isPrimary=false`。
3. 同一 visit 最多一筆 primary；`patternId` 不得重複。
4. legacy `role=""` 可先報 warning；一旦 note 經新 UI 儲存或 migration，空 role 不再允許。
5. import 在 persist 前先驗，不以 silent inference 修掉衝突。

### 5. K 系列 PHI validator — MEDIUM

`node scripts/validate-clinical-case-standard.js` exit `0`：受檢 tracked JSON `9`、knowledge refs `2`、問題 `0`。K1–K5 是整檔 regex，新增 tracked sample 欄位會被掃；`local/private/exports` 被略過是既定邊界。

風險是 `.github/workflows/validate.yml` 與 ratchet 都沒有呼叫此 validator；先前 K4 regression 因而未被 CI 擋。**要求**: 加入 green blocking job；同一批加入第 4 項 invariant 與 import-history checks，避免只有 PHI regex 綠而 Clinical 契約仍漂移。

### 6. Persist 膨脹 — HIGH

真實 profile 未連上，本審不採信 `77KB→123KB` 為已覆核數字。指定 commit 的 synthetic sparse case 實測 `418→2,636 bytes`（`6.31×`），原 subjective text 保留，但 case/soap 的 `createdAt`、`updatedAt` 共 `4` 個缺值被 `new Date()` 合成。

若 handoff 的 `123KB/33 cases` 數字日後由真實只讀 preflight 證實，依簡報的 `5MB` 模型約占 `2.35%`、有約 `42.6×` byte headroom；容量不是眼前 gate。**語意才是 gate**：C2a 用 `case.updatedAt` 做 latest-wins，load 時合成 timestamp 會把「缺時間」偽裝成「最新」。migration 必須從 raw snapshot 讀取並保留 missingness，不能先經目前 normalizer 再決定 winner。

### 7. `34→33` 證據覆核 — MEDIUM

Git 可證明 `case_d17test` 解釋首次出現在後續 handoff/log，並可看到較早的 `34` claim；Git 無法證明 browser localStorage 當時的 id set 或 SOAP set。目前可控制的 in-app browser 在 `localhost:8361` 與 `127.0.0.1:8361` 都是 `0 cases`，且沒有連上的 Chrome/Edge profile，所以本審沒有讀到 33 個真實病例。

此外，app 存在 `deleteCurrentCase` 與 replace-all import；「store 無 delete 路徑」不是資料未遺失的充分證據。現有解釋合理但未達獨立證明。**要求**: C2b 前以 raw backup 列出 case-id set、SOAP-id set、count/hash；對照 migration 後完全相同，並明列 `case_d17test=0`。

### 8. C2a `derivePatientsFromCases` — HIGH

Synthetic 測試的正向契約通過 `5/5`：group、latest non-empty、conflicts、無 code 跳過、caseIds newest-first。另實查出 3 個 migration 風險：

1. `PATIENT_FIELDS` 有 8 欄但漏 `birthYear`；legacy 只有 `birthYear` 的 case 不會被抬升此值。
2. `raceEthnicity` 用 JSON array byte/order 比較；`[a,b]` 與 `[b,a]` 被誤報 conflict。
3. conflict 只存 values，沒有 `caseId/updatedAt/source`，不足以審核誰勝出；再加上第 6 項合成 timestamp，latest-wins 可能選錯。

33 real cases → 33 patients、0 blank code、0 conflicts 的 claim 本審未能在真實 profile 重跑，不能列 PASS。**要求**: 納入 `birthYear`；set-like 欄位 canonicalize 後比較但保留原順序；conflict entry 帶來源 case/time；缺/同 timestamp 不得自動選 winner，輸出人工裁決清單。

### 9. C2b 遷移計畫 — BLOCKER

目前 PROJECT_LOG 只有四個 scope 名詞：patients 落盤、guard 語意、picker、抬升遷移；沒有可執行的 backup、idempotency、transaction、rollback、驗收算法。加上第 1/2/6/8 項，**C2b 維持 NO-GO**。

#### 解除 NO-GO 的前置要求

**A. 真實資料 preflight 與備份**

1. 在持有 33-case store 的正確 browser/profile 上只讀執行；先輸出 raw `acuting-clinical-cases-v1` byte snapshot，再做 app export，兩份都放 Git 之外的受保護本機位置。
2. 記錄 SHA-256、bytes、case ids、patientCode、SOAP ids、每類 nested row/event counts、未知欄位清單；預期數字由 raw snapshot 算，不把 `33/52` 寫死成真理。
3. 兩次獨立 export hash 相同；在隔離 origin 做 restore drill，逐鍵 hash/count 相同後才可進 dry-run。
4. migration 不得先 normalize raw input；不得讓讀取動作回寫 defaults/timestamps。

**B. Idempotency / 寫入設計**

1. migration 先 `--dry-run`，輸出 deterministic plan；Patient id 不得用 `Date.now()`/`Math.random()`，同一 source hash 重跑必得同一 ids/result。
2. 以 migration version + source hash 做 journal；第二次執行必須報 `creates 0 · updates 0 · deletes 0`。
3. 不原地破壞 v1。先寫 versioned shadow key/envelope，完整驗證後單一切換 pointer；任何 quota/error/中斷都不得留下 half-migrated state。
4. case 必須存 stable `patientId` FK；picker 選 Patient，不靠可編輯 display code 猜 identity。多 case 同 patient 的 guard 行為需有具體 confirmation 文案與 duplicate-code 規則。
5. 修正第 1/2/4/6/8 項並把 validator 放 CI；migration code 與真實執行分成兩個 gate。

**C. Rollback**

1. 保留原 v1 key 與 raw backup，直到 migration 後人工驗收及下一個備份週期；不得自動刪。
2. feature flag/pointer 可立即切回 v1；rollback 只移除本 migration 建立的 versioned keys。
3. 在隔離 clone 實測 migrate→rollback，原始 raw SHA-256、case/ SOAP id sets 與 nested counts 全部回復。

**D. 真實執行驗收數字**

- `cases before→after = N→N`、`SOAP = M→M`；case-id/ SOAP-id sets exact match；未知欄位丟失 `0`。
- `patients = unique(nonblank patientCode)`；blank-code cases、duplicate patient ids、orphan cases、orphan patients 均 `0`，conflicts 每筆有來源與裁決。
- 8 個 patient fields 加 `birthYear` 逐欄 parity；events 各 exposure 的 id/hash 序列只可相同或 append，不可縮短。
- post-migration export/import 必須涵蓋 patients + 全部 Clinical V2 rows；隔離 round-trip canonical hash 相同。
- 同 source rerun `0/0/0`；rollback 回原 hash；最後再由 Codex 對 dry-run report 與 fake-clone 實測給明確 GO。

### 10. Diff 範圍 — PASS

`git diff 994d8b3^..e959ce9 --name-only` 共 `21` paths：docs `8`、Clinical data `2`、app shell/store `4`、其餘 config/deploy/log `7`；`curriculum/**=0`、`js/knowledge.js=0`、`js/router.js=0`。`d00012f..e959ce9` 只有 audit brief `53` 行與 PROJECT_LOG `6` 行。目前 working tree 的 curriculum 刪除與藥理/Clinical WIP 均不屬於此 commit range。

### 指定 commit 快照驗證

- `build-data`: exit `0`；`app_data.js`、`knowledge_data.js` rebuild 前後 SHA-256 均不變。
- `validate-clinical-case-standard`: `9 files / 2 refs / 0 issues`, exit `0`。
- `validate-content-junk`, `validate-data`（runtime points `947`）, `validate-interactions`（failures `0`）, `validate-relations`, `check-validation-ratchet`, `node --check app.js`, `node --check js/clinical-store.js`: 全部 exit `0`。
- relations 仍輸出既有 crosswalk/comparison warnings；不屬本範圍 regression。
