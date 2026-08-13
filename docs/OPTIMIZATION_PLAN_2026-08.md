# AcuTing OS 體驗/效益優化計畫(PROPOSED — 待 Ting 批)

2026-08-11,Fable × SOL 共識版。研究基礎:measurement-based care(MBC)實證、
CHM-CARE 61 項案例報告規範、真實世界針灸 clinical audit(2024,232 病人/233
主訴,證明診所級資料迴圈可行)、TCM 醫案 LLM+KG 數位化文獻。
Codex 角色:每項落地後照常審計;真機資料相關項遵守既有 gate。

## 優先序(2026-08-12 改版,取代下方舊序)

**Core Loop → Visit Brief → Timeline → Audit → Previsit → CHM-CARE**

| | 做什麼 | 為什麼是這個位置 |
|---|---|---|
| **P0** | Clinical Core Loop | Patient → Case → Visit → save/reload/export 真的跑順 |
| **P1** | Visit Brief | 開病人就知道「上次怎樣、今天變什麼」——「少查一次」 |
| **P2** | Treatment Response Timeline | 資料結構已經比 UI 超前很多,把病情演進畫出來 |
| **P3** | Practice Audit Lite | 病例開始反過來說「先補這 12 張」,而不是「還有 300 張」 |
| **P4** | Safety Visibility | boxed warning / 禁忌已經有資料,畫面上看不到 |
| **P5** | Pre-Visit patient form | **FROZEN**——見下 |
| **P6** | CHM-CARE readiness | 有病例累積之後價值才成立 |
| later | SQLite / full dashboard / 全庫 source 補齊 | 現在不是瓶頸 |

**最大變動:Previsit 從 P1 降到 P5,狀態 = freeze,不是刪除。**
它本質是「資料怎麼進 AcuTing OS」的 adapter,但已經花了不成比例的時間在
「adapter 能不能接受這個奇怪的 JSON」上,而醫師每天真正要用的 Visit Brief /
Timeline / Patient Over Time 還不是最成熟的體驗。順序應該是**先把 OS 裡面的
資料循環跑順,再優化病人怎麼把資料塞進來**。

判斷任何一項值不值得做,只問三個問題:少輸入一次了嗎?少查一次資料了嗎?
這次產生的資料,下次能不能再利用?

停止驗證的規則在 `docs/SPRINT_2026-08-12_BRIEF.md` §Validation Convergence。

---

## 舊優先序(2026-08-11,已被上表取代,保留供追溯):P1 → P3-lite → P2

### P1(最高優先)診前自填 → Visit Brief → 醫師確認
不是「病人填表」,是三段流:**Pre-Visit Capture → Visit Brief → clinician confirms**。
- 病人手機頁(mobile responsive,非大型 portal):3–8 個與 Case 相關的 metric、
  症狀變化/新增、med/supp 有無變動、上次治療後不良反應、「今天最想改善什麼」
- 開診畫面 = Visit Brief:上次以來 Pain 7→4↓ / Sleep 5.2→6.3h↑ / 新增 dizziness /
  magnesium stopped / ⚠ REVIEW new dizziness / 病人今日優先事項
- 價值:MBC 文獻的核心——資料回到 clinician workflow 才產生臨床價值;
  同時直接落實 Ting 的手機願望。P0.5 = Visit Brief 桌面版可先行(資料已齊)。

### P3-lite(第二)月度 Practice Audit 簡版
只算真正可靠的:Patients/Cases/Visits/Follow-up rate、Outcome completion %、
improved/unchanged/worse、median pain/sleep change、AE rate + by modality、
most-used patterns/points/formulas、知識缺口(高使用×低卡片成熟度)。
- 這是 Knowledge OS 的 **feedback engine**:Clinical use → structured data →
  monthly audit → knowledge gaps → Research Queue → better cards → better care。
  正是 Ting 要的「實際病例反過來決定知識庫補什麼」。

### P2(第三)CHM-CARE 化匯出
不做「Export 按鈕」,做 **Case Report Readiness**:每個 case 常駐顯示
`CHM-CARE readiness: 47/61`(✓ 已有:診斷/timeline/方劑/穴位/outcomes/AE…
○ 缺:therapeutic intent/patient perspective/adherence/consent…),
completeness 足夠時一鍵 `Generate CHM-CARE Draft`。
- 價值:病人看診時順便累積 paper-ready 資料,而不是一年後翻病歷考古。

## SOL 補充三方向(均同意,排入)

- **A. Metric Registry 深化**(排最前,三功能共用脊柱):metric 加
  unit/scale/direction/instrument/interpretation/source;先收斂現有 26 個,
  不讓 metric 變無限 JSON 動物園。→ P1 病人輸入、P3 audit、P2 export 同源。
- **B. Case Timeline / Treatment Response Map**:Patient Over Time 的具體形——
  Symptoms/Patterns/Formula/Needling/Supp/Exposure/Outcome/AE 多泳道時間圖,
  「具象化病情演進,看出季節、治療、藥物改動和結果」。對臨床決策價值高於傳統 dashboard。
- **C. Research Queue 帶 Evidence Debt 計分**:
  clinical frequency × outcome relevance × safety relevance × missing evidence ×
  uncertainty(例:magnesium 被引 27 次 + interaction 欄不全 + thyroid 關係未知
  → HIGH priority)。取代單純「哪張卡缺內容」。

## 執行切分(建議,批准後排程)

| 項 | 誰 | 依賴 |
|---|---|---|
| A. Metric Registry 深化(26 個 metric 補欄) | Sonnet(契約:exact shape) | 無;先行 |
| P0.5 Visit Brief 桌面版(讀現有資料渲染) | Sonnet | A |
| P1 診前手機頁 MVP | Fable 設計契約 → Sonnet 實作 | A;入口=正典 file:// 同源方案待定(9/5 後可上 workers.dev 版) |
| P3-lite 月審腳本(node,吃 export) | Sonnet | A |
| P2 readiness 計算+徽章 | Sonnet | 61 項對映表(Fable+SOL 先做) |
| B. Timeline 泳道圖 | Fable 原型 → Sonnet | 無(資料已齊) |
| C. Evidence Debt 計分 | Fable(演算法)| P3-lite |

9/5 前只做不影響 C2b/凍結的:A、P0.5、P3-lite 腳本。其餘 9/5 後。
