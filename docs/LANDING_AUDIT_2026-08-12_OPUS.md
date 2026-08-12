# Branch Landing Audit — `codex/pattern-v2` → `main`

**Status:** PLAN ONLY — no merge, no push to main, no deploy performed.
**Prepared by:** Fable(夜班總工,2026-08-12 夜)
**Decision owner:** Ting
**Audited HEAD:** `dab9ae8`(見下方「量測時的確切狀態」)

> 本文只描述「要怎麼降落、降落前必須先滿足什麼」。降落動作本身需要 Ting
> 明確授權(夜班硬邊界第 1 條:不 merge / 不 push main / 不 deploy)。

---

## 1. 量測時的確切狀態(全部可一行重現)

| 項目 | 值 | 重現指令 |
|---|---|---|
| branch HEAD | `dab9ae8` | `git rev-parse --short HEAD` |
| merge-base | `38d3b1b` | `git merge-base origin/main origin/codex/pattern-v2` |
| main-only commits | **2** | `git rev-list --left-right --count origin/main...origin/codex/pattern-v2` → `2  377` |
| branch-only commits | **377** | 同上 |

**重要**:`main` **不是** branch 的祖先。兩邊互有 commit,任何「假設 main 是祖先」
的降落腳本都會踩空。

---

## 2. main-only commits 逐筆處置建議

| commit | 主旨 | 觸及檔案 | 是否已在 branch | 處置 |
|---|---|---|---|---|
| `74c63a2` | Restore the last two sections 66d3e72 dropped: American Dragon 證型 and 方劑群組 | `js/knowledge.js` 單檔 | **否** | 必須保留 —— 三方合併會自動帶入 |
| `8cafc2a` | Reattach 現代應用/現代藥理/相關病名與證型 to the formula clinical panel | `js/knowledge.js` 單檔 | **否** | 同上 |

兩筆都是「把 branch 這條線上曾經掉掉的 UI 區塊救回來」的修復。若降落時對
`js/knowledge.js` 採「branch 全拿」的解法,**這兩筆修復會再次被靜默抹掉** ——
這正是本 repo 已經發生過的事故模式(`66d3e72` 掉了、`74c63a2` 才救回來)。

---

## 3. 唯一的高風險檔案:`js/knowledge.js`

### 3.1 三方分歧實測

| 面向 | 數字 |
|---|---|
| base(`38d3b1b`)行數 | 2673 |
| branch 行數 | 2767(base→branch:`+95 / -1`) |
| main 行數 | 2719(base→main:`+53 / -7`) |
| top-level 函式集合差異 | **0**(兩邊函式名單完全相同 —— 分歧在區塊內容,不在 API) |

### 3.2 三方合併可行性 —— 已實測

```bash
git show 38d3b1b:js/knowledge.js  > /tmp/k_base.js
git show origin/codex/pattern-v2:js/knowledge.js > /tmp/k_branch.js
git show origin/main:js/knowledge.js > /tmp/k_main.js
git merge-file -p /tmp/k_branch.js /tmp/k_base.js /tmp/k_main.js > /tmp/k_merged.js
```

結果:**零衝突**,合併後 2813 行,`node --check` 通過。

內容驗收(合併後同時保有兩邊):

| 標記 | branch | main | 合併後 |
|---|---|---|---|
| `American Dragon` | 15 | 18 | **18** |
| `現代運用` | 4 | 5 | **5** |
| `現代藥理` | 2 | 2 | **2** |
| `方劑群組` | **0** | 1 | **1** |

> 也就是說:**只要用真正的三方合併,兩邊都不會掉東西**。風險完全來自
> 「用整檔覆蓋的方式解衝突」。

### 3.3 降落時的硬規則

- ❌ 不得使用 `-X ours` / `-X theirs` / `git checkout --ours|--theirs js/knowledge.js`。
- ✅ 用一般 `git merge`(三方),讓 git 自己合。
- ✅ 合併後**必檢**上表四個標記數 ≥ main 側數字,且 `node --check js/knowledge.js` 通過。

---

## 4. 其餘檔案的風險評估

- 除 `js/knowledge.js` 外,**沒有任何檔案同時被 main-only commit 與 branch commit 修改**
  (main-only 只有那 2 個 commit,只碰一個檔案)。因此其餘 377 個 branch commit 的內容
  在降落時是單邊快進,無三方衝突風險。
- `data/generated/**`:決定論已驗 —— 在 `dab9ae8` 跑 `node scripts/build-data.js` 後
  `git status --short data/generated/` 為空(無漂移)。降落後應重跑一次同樣檢查。
- `data/research_staging/**`:內含大量 SOL 研究批次與 manifest。這些是**已被引用的
  研究資產**(CR-010 各批次的來源),不是實驗殘骸,隨 branch 一起降落是正確的。
  若要瘦身,應走獨立的 asset retirement 流程(`DO_NOT_USE_SUPERSEDED_ASSETS.md`
  已是既有機制),不要在降落時順手刪。
- `.github/workflows/validate.yml`:branch 側有 concurrency + docs-only preflight +
  AVS/P1/boot-order blocking steps。main 側無變更 → 單邊快進。
- `wrangler.jsonc` / 部署設定:branch 側無本夜變更;部署動作本身在夜班硬邊界外。

---

## 5. 降落前的先決條件(prerequisites)

| # | 條件 | 現況 |
|---|---|---|
| P-1 | P1 transport 六軸 GO(Codex 獨立覆測) | **未滿足** — 修復已落地(`aaf8b81`),等 Codex focused retest |
| P-2 | AVS v3 六軸 GO | ✅ 已滿足(Codex `2ddced2`,6/6 PASS) |
| P-3 | formula validator 0 blocking | ✅ 已滿足(本夜實測 `PASS — no blocking defects`) |
| P-4 | exact-SHA CI 三 job 全綠 | 待對最終 SHA 觸發(見 §7) |
| P-5 | export/import 無損實證 | ✅ 已滿足(本夜 P4 synthetic rehearsal,見 §6) |
| P-6 | `js/knowledge.js` 三方合併計畫 | ✅ 已驗證可行(§3) |
| P-7 | 真實病人 migration / pointer switch | **不在降落範圍** — 需 Ting 另行授權,且必須在降落後、部署前單獨演練 |

---

## 6. P4 synthetic rehearsal 結果(本夜實測,全合成資料)

建置:Patient A(2 cases / 7 visits,含用藥帳 2 筆共 4 事件、環境暴露、
生活型態、證型 primary+differential、不良反應、AVS v1 superseded + v2 finalized)、
Patient B(1 case / 1 visit,隔離對照)。

完整循環:`create → save → reload → edit → new visit → export → wipe → import → reload → compare`

| 驗收項 | 結果 |
|---|---|
| 存檔→重載無損 | LOSSLESS |
| export→wipe→import→重載 語意無損 | **SEMANTIC LOSSLESS**(所有追蹤事實逐項相同) |
| Patient→Case→Visit 階層 | A: 2 cases / 7 visits;B: 1 case / 1 visit |
| 一 patient 多 case(同 patientCode) | ✅ `P-SYN-A × 2` |
| A/B 隔離 | ✅ B 的內容未洩漏進 A |
| canonical id(drug./supp./life./exposure./modality.) | ✅ 5/5 保留 |
| append-only 事件史 | ✅ `initial_recorded, dose_changed, started, stopped` 全保留 |
| 不良反應 | ✅ 保留 |
| AVS 歷史 | ✅ `v1:superseded, v2:finalized` |
| 編輯 + 新增 visit 存活 | ✅ 兩者皆在 |
| AVS invariants / clinical invariants | ✅ ok / 0 failures |
| 真實 clinical store 讀寫 | **0 / 0**(未做 pointer switch;v2 pointer 與 staging 全程 absent) |

---

## 7. 建議的降落機制(mechanics)

前置:P-1 與 P-4 滿足後才執行。

```bash
# 1. 以 branch 為基準,先把 main 併進來(三方,不用 -X)
git fetch origin
git switch codex/pattern-v2
git merge origin/main            # 預期:js/knowledge.js 三方自動合,零衝突

# 2. 合併後必檢
node --check js/knowledge.js
grep -c "方劑群組" js/knowledge.js        # 必須 >= 1
grep -c "American Dragon" js/knowledge.js # 必須 >= 18
node scripts/build-data.js && git status --short data/generated/   # 必須為空

# 3. 全套 validator(見 §8 清單)+ push branch,對 exact SHA 取得 CI 三 job 全綠

# 4. 才降落(需 Ting 明確授權)
git push origin HEAD:main
```

> 注意兩個 worktree 的既有約定:`main` 由 `C:/Projects/acuting-antigravity`
> 佔用,本資料夾**不得** `git checkout main`;降落一律用 `push origin HEAD:main`。

---

## 8. Rollback plan

- **降落前**:branch 已推遠端,`origin/codex/pattern-v2` 本身即備份。
- **降落後若發現問題**:記下降落前的 `origin/main` SHA(降落當下先
  `git rev-parse origin/main > /tmp/main_before.txt`),回滾用
  `git push origin <main_before_sha>:main`(需 Ting 授權;force 語義,務必先確認
  期間沒有第三方 commit 落在 main)。
- **資料面**:降落只動程式碼與知識庫檔案,**不動任何病人資料**;localStorage
  裡的臨床資料不受 git 操作影響。真正需要回滾計畫的是 pointer switch,那是
  另一條線(`rollbackMigration()` 白名單刪除兩個 key)。
- **部署面**:Cloudflare 部署與 git 降落解耦;降落不自動觸發 production。

---

## 9. Production smoke checklist(降落後、公告前)

1. `index.html` 載入無 console error(含 `js/previsit-validator.js` 已載入)。
2. 開一個合成病例:SOAP 新增/編輯/存檔/重載 全綠。
3. Checkout 產生 AVS draft → finalize → 病人輸出零內部代碼(`checkPatientOutputSafety` 回 `[]`)。
4. 「貼上診前資料」對一個合法 payload 正確預填;對缺 `payloadId` 的 payload 整筆拒收。
5. 匯出一份備份,確認檔案可再匯入且事實無損。
6. 知識庫抽查:方劑卡的「現代運用/現代藥理/相關病名與證型」與「方劑群組」區塊都在
   (§3 那兩筆 main-only 修復的可見證據)。
7. `DEPLOY_CLOUDFLARE.md` 的六個 gate 逐項確認(本文不重複)。

---

## 10. 尚未解決 / 需 Ting 裁決

- **P1 真實病人使用 PAUSE 是否解除**:技術面等 Codex focused retest;解除與否是
  臨床/法遵判斷(契約 §7 第 5 點明寫不由工程單方認定)。
- **真實 patient migration / pointer switch 的時程**:不在降落範圍,需獨立演練 + 授權。
- **FULL_DETAIL 兩軸 maturity 拆分**(completeness × content-quality):已在 Ting
  的策略更新中定調,實作尚未開始;與降落無相依,可降落後再做。
