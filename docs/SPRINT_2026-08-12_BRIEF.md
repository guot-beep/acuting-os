# Clinical V2 Sprint Brief — 2026-08-12(repo 內唯一真相)

Ting 核准的完整方向正文 = `docs/CLINICAL_DATA_CAPTURE_V2_DIRECTION_2026-08-10.md`
(臨床模型細節)+ `docs/CLINICAL_LAYERS_RECONCILIATION_2026-08-10.md`(對帳與
schema 提案)。本文件只放 sprint 特有的內容:硬規則、階段、路由、驗收分級。

## ⚡ 操作硬規則(每個 agent 開工前讀這十行)

1. 禁 `git add -A`;一律逐路徑 stage。
2. 工作樹裡的 `curriculum/` 刪除檔與未提交 js/ 藥理 WIP:不動、不 stage、不 commit。
3. 8/10 決定 = **D17**(supp.*、sym/metric 互補、pattern roles、單一時間線);
   不要跟 2026-08-06 的 D15(med→drug)混淆。
4. 命名空間:`supp.*` 不是 `suppl.*`;`drug.*` 正典、`med.*` 永不刪。
5. 生活型態/暴露 = 觀察值,任何程式路徑都不得自動產生 pattern/tdis。
6. 真實病人資料永不進 GitHub;測試一律虛構病人。
7. 16 GB RAM:重型 agent 循序執行,不並行。
8. D12 凍結 2026-09-01:schema/localStorage 格式/export 格式全部 additive-only;
   **export/import 與 schema 同步凍結**——新表資料不得被備份默默遺漏。
9. 落地 main = fast-forward `push HEAD:main`,只在里程碑邊界、validators PASS 後。
10. 回報逐項數字,禁「完成/100%」。部署規則見 `docs/DEPLOY_CLOUDFLARE.md`。

## Validation Convergence / Exit Rule(2026-08-12 定,優先於本文件其他節奏)

**一個 milestone 只允許一次 independent audit。**

    audit → 找到 blocker → 修 → 只跑針對那個 blocker 的 regression → PASS → milestone CLOSE

沒有新的 hard-gate blocker 就結案,**任何 agent 不得自行對同一 milestone 再開一輪
完整 adversarial review**。唯一例外:修復本身動到新的 architecture boundary。

會擋 milestone 的只有這條鏈斷掉時 ——
`Patient → Case → Visit → Treatment → Outcome → Reload → Timeline → Export`:

| 擋 | 不擋(記 backlog,不搶當週開發) |
|---|---|
| A 病人的資料跑到 B 病人 | 極端 Unicode edge case |
| Save 顯示成功但資料沒存 | CLI-only 的訊息細節 |
| Reload 後資料消失 | 理論上可能的罕見 timestamp 語法 |
| Export/import 丟欄位 | 尚未啟用的 migration corner |
| 病歷數值被靜默改寫 | schema 美化 |
| 危險 clinical claim 自動顯示 | 卡片 source 全補齊 |
| app 開不起來 / 存不了 | SQLite |
| 自動推導出診斷或證型 | CHM-CARE 61 項全數完成 |

到 9/5 的資源配比:**產品與 workflow 75–80%,QA 20–25%。**

為什麼寫這條:R9–R14、P1 transport 那幾輪確實抓到資料分叉、錯病人、值被改寫、
PHI error echo 這些實質問題,不是白做。但已經進入「修掉一個 edge case → 再做一輪
完整審計 → 找到更小的 edge case → 又一輪」的狀態,而最後兩輪有一半是在修前一輪
修壞的東西。原則從 *Find everything that can go wrong* 換成
**Protect the irreversible things, then make the loop move.**

## 階段與現況

- **Phase A** 倉庫安全 + 架構確認 — ✅ 2026-08-12 完成:分支祖先安全(main 是
  祖先,領先 20+ commits)、髒工作樹所有權標記、Cloudflare root cause 修復
  (wrangler.jsonc 自帶 build)、落地策略定案。
- **Phase B** additive Clinical schema/資料契約 —
  B1 ✅(`994d8b3`:四張 D17 表 + role/confidence + related_sym_id + mapping)。
  B2 = localStorage 契約(normalizeCase/normalizeSoapNote 新增鍵,Fable)。
  B3 = 詞彙種子五檔(Sonnet)。
  **Phase B 完成後 → 立即 Codex schema audit,再往 UI 走。**
- **Phase C** 儲存抽象層 — 成功定義 = **薄 repository 抽象包住現有 localStorage
  + 遷移路徑文件**。SQLite 上線不是 9/5 必要條件。
- **Phase C2(獨立高風險里程碑)** Patient 實體 wiring(case→patient 抬升)——
  單獨 commit、完成後立即 Codex audit;必要時先送 Opus/SOL 第二意見。
- **Phase D** 最小捕捉 UI(契約穩定後,主力 Sonnet)。
- **Phase E** 虛構病人 A/B 縱向走查(隔離、reload、export、時間線重建)。

## 路由(§F0 + ChatGPT)

| 誰 | 做什麼 |
|---|---|
| Fable | schema、契約、遷移、跨模組、高風險;每里程碑主動宣告分派 |
| Sonnet 5 | 設計定案後的有界實作:表單/CRUD/UI/測試/詞彙檔 |
| Opus 5 | 僅重大架構分歧的對抗性第二意見 |
| **ChatGPT(SOL)** | 外部高階審閱:看 GitHub、Git 歷史、架構討論;里程碑 review 由 Ting 轉發 |
| Codex | 里程碑後獨立 QA:schema 完整性、遷移、隔離、regression、diff 範圍 |
| Antigravity | ID 鎖定後的批量內容(supp 骨架卡、詞彙擴充、來源蒐集) |

## 9/5 驗收分級

**HARD GATES(缺一不算 MVP)**
1. Patient → Case → Visit 可輸入且 reload 後完整還原
2. case 與 patient 隔離(虛構病人 A/B 互不污染)
3. SOAP 自由文字 + 結構化 canonical ID 並存(cond/tdis/pattern/sym/point/
   formula/herb/drug/supp/life/exposure/modality/metric/adverse_event 至少
   各有一條捕捉路徑)
4. 用藥/補充劑單一縱向時間線(current/started/stopped/dose_changed 可重建)
5. 證型 differential vs working(primary|secondary)按 visit 保存、不覆寫歷史
6. 結果指標軌跡可重建(pain 8→7→5→4)
7. export/import 含全部新表資料(往返無損)
8. 虛構病人 A(4–5 visits 含一次 adverse event)全流程走查通過

**STRETCH(做到加分,不擋 MVP)**
- 「上次以來變化」快速跟診 UX 完整版 · Patient Now / Over Time 雙視圖 ·
  mobile 完整可用(hard gate 只要求手機可讀可輸入的 smoke test)· SQLite 實裝 ·
  research-demand hooks · modality 深度結構化
