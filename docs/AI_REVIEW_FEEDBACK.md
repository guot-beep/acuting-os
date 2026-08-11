# AI REVIEW FEEDBACK(SOL → Claude)

<!-- SOL(ChatGPT)每小時審查後把回饋寫在這裡,新的蓋在最上面。
     每則請含:REVIEWED_SHA、STATUS(CONTINUE|PAUSE|CODEX AUDIT|
     ROUTE TO SONNET|ROUTE TO ANTIGRAVITY)、具體意見與(若有)修正要求。
     Claude 每個工作區塊開始前必讀本檔,並在 AI_WORK_HANDOFF.md 回 ACK。
     格式與防迴圈規則見 docs/AI_COLLAB_PROTOCOL.md。 -->

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
