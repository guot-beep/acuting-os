# C2b 真機切換執行計畫(2026-08-15)

目標:把正典臨床入口從 v1(Case 頂層)切到 v2(Patient 實體 + journal envelope),
解除 2026-08-11 以來的真機凍結。這是 9/5 硬指標的最後一塊架構工程。

**性質:獨立高風險里程碑**(SPRINT_2026-08-12_BRIEF Phase C2 規格):當日唯一
product objective、切換後立即 Codex 收斂 audit(一輪,只問 data loss / isolation /
migration / regression,無 blocker 即 CLOSE)。

## 0. 前置條件(開工時逐項重驗,不引用昨天的綠燈)

| # | 條件 | 驗法 |
|---|---|---|
| 1 | P1/P4 GO 仍有效(無新 commit 動到 clinical-store/previsit/export 路徑) | `git log --oneline <GO錨點>..HEAD -- js/clinical-store.js js/previsit-validator.js app.js` 逐條讀 |
| 2 | pointer runtime 31/31 | `node scripts/test-pointer-runtime.js` |
| 3 | restore rehearsal 65/65(或現行數字) | 對應 rehearse 腳本 |
| 4 | 全套驗證器 + ratchet 綠 | CLAUDE.md 清單 |
| 5 | 另一 session 未在 clinical 檔案上有未提交編輯 | `git status` 乾淨才開工 |
| 6 | 憲法凍結線未動:D12(additive-only)、真實病人資料永不進 GitHub | 自查 |

任何一項紅 → 當日中止,先修再排。

## 1. Phase R — 排練(dev-server origin,全虛構資料,Fable 親自跑)

在 Browser pane(acuting-static,新 port = 乾淨 localStorage origin)上走完整劇本:

1. **種 v1 資料**:經真 UI 建虛構病人 A(2 案例)、B(1 案例),各含 SOAP
   (symptomLinks/herbLinks/exposure ledger 各至少一條,覆蓋 D17 新表)。
2. **遷移**:`buildMigrationPlan` → `executeMigration` → `verifyStagingObject`
   全綠 → `switchPointer`。記錄每步輸出。
3. **v2 runtime 實測**(hard gate 1/2 的 v2 版):reload → 資料完整;
   Patient Workspace 顯示獨立 Patient 記錄;新建 case/SOAP 經 UI 寫入 v2;
   A/B 隔離重驗;export 輸出 v2 envelope(patients+journal+cases)。
4. **回滾演習**:`rollbackMigration` → pointer 回 v1 → v1 資料逐位元組未損
   (v1 keys 從頭到尾不刪,additive 鐵則)→ 再切回 v2。
5. **災難演習**:wipe v2 keys → restore(revision-aware 路徑)→ 全量 hash 對帳。
6. 排練中發現的任何 code 缺口 → 有界修復派 Sonnet(worktree),修完重跑
   Phase R 全劇本,不跳步。

**Phase R 全綠才准進 Phase P。任何一步紅 = 當日不碰真機。**

## 2. Phase P — 真機切換(Ting 的 Edge + file:// 本機 index.html)

⚠️ 真機 localStorage 在 Ting 的瀏覽器 origin 裡,**只能由 Ting 在場執行**;
Fable 提供逐步指令,Ting 操作,每步回報結果再走下一步。

1. **先備份**:切換前 export 全量 JSON → 存兩份(本機 + 私有雲),
   檔名含日期與 `pre-c2b`。備份沒落地不開始。
2. **單一分頁規則**:關閉所有其他 AcuTing 分頁/視窗(防 TOCTOU 雙寫)。
3. 依 Phase R 驗證過的同一劇本執行遷移 + 驗證 + 切換。
4. **切換後煙測**(當場):reload、開既有案例、Patient 列表、新建一筆測試 SOAP
   後刪除、export 一次留檔。
5. 任一步異常 → **當場 rollbackMigration**(排練已演過),v1 未損,擇日重來。

## 3. Phase A — 收尾與審計

1. 若 Phase R 產生了 code 修復:單獨 commit(不與其他工作混批)。
2. PROJECT_LOG + AI_WORK_HANDOFF 記錄:切換時間、每步數字、備份位置代號
   (不含路徑細節)、回滾演習結果。
3. **立即派 Codex 收斂 audit**(一輪):patient isolation / persistence /
   migration / export-import / data loss。GO → C2b CLOSE,凍結解除記錄歸檔;
   發現 blocker → 修 → 針對性 regression → CLOSE,不開新輪。
4. C2b 關閉後,gate 8(完整縱向走查)可在 v2 模式上排程——那是下一個 objective,
   不塞進 C2b 當天。

## 4. 中止線(任一即停)

- Phase R 任何一步紅
- 真機備份未完成
- 切換中 verify 失敗(fail-closed:pointer 不動,v1 繼續是正典)
- 當日另一 session 在 clinical 檔案上活躍且無法協調停手

## 5. 角色

| 誰 | 做什麼 |
|---|---|
| Fable | 全程指揮、Phase R 親跑、真機逐步指令、整合與 log |
| Sonnet | 僅 Phase R 發現的有界修復(worktree) |
| Ting | 真機操作 + 備份確認 + 最終 GO |
| Codex | Phase A 一輪收斂 audit |
| SOL | 不進場(P1/P4 已雙 GO;僅在出現架構分歧時諮詢) |
