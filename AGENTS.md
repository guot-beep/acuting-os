# Repository Guidelines — AcuTing OS

## 規則地圖（正本只有這幾份，其他 docs/ 檔案都是歷史紀錄）

| 檔案 | 內容 | 誰要讀 |
|---|---|---|
| `docs/AI_CONSTITUTION.md` | **共同規則全文**（所有權、紅線、工作法、回報）。派工時整段貼進 prompt | 每個 AI，每次 |
| `docs/BLUEPRINT.md` | 架構定案。**不要重新發明**；架構變更走 Claude，方向變更只來自 Ting | 動架構前 |
| `DECISIONS.md` | 一次性決策（id 不可變、schema、儲存分層、never-hard-delete） | 動 id/schema 前 |
| `docs/*_CARD_TEMPLATE.md` | 各卡片的格式正本（herb / formula / acupoint / condition / pattern / comparison / symptom / tdis / pharm） | 做該卡片前 |
| `skills/` | 各線工作流程（extra-point / condition-fill / dispatch） | 被派到該線時 |

模板與 skill 衝突時，**以模板為準**。

## 這個專案是什麼

AcuTing OS：Ting 的私人 TCM 學習與臨床工作站（查資料、寫 SOAP、考試準備）。
**私人內部使用，不公開**，不是行銷網站。優先序：準確、可查、雙語、資料安全。

## 內容政策（2026-07-22，Ting 原話：「直接填上，然後標註來源」）

- **填，然後標來源。** 留空加「待補」不是安全選項，是失敗案例。逐筆內容，絕不套類別樣板。
- 新內容以 `review_status:"draft"` 直接上線，Ting 在 app 內審（RV1）——**不需要 staging gate**。
- Gate 只留給三件事：**覆蓋既有 canonical 內容、刪除／退役、範圍變更**——這些先問 Ting。
- 安全欄位（劑量、毒性、刺深、孕期、藥物交互）照常填，但**數字必須具名來源**；查不到就停下來回報。

## 資料安全

`data/` 是知識庫本體。未經 Ting 同意不得：刪記錄、改欄位名、改 id/anchor/code、
重組檔案、移除雙語欄位、覆蓋病例內容。大型遷移先提：改什麼／為何／備份／驗證／回滾。
不得 commit 任何可識別病人資訊；只用去識別化 `patient_code`。

## 工作流程（所有 agent）

1. 開工：`git pull` → 讀 `PROJECT_LOG.md` 最上方 → 確認你的路徑沒有別人未合併的變更 → 開自己的 branch。
2. 進行：小批次（20–30 筆）、小 commit；照憲法 §三 跑驗證。
3. 收工：工作樹留乾淨、push（commit 不等於安全）、在 `PROJECT_LOG.md` **最上方**留 5 行
   handoff（做了什麼／數字 before→after／驗證結果／已知未解／下一步）。
   Codex 另外更新 `docs/CODEX_HANDOFF.md`（機器可讀、最新在前）。
4. 回報格式照憲法 §四：逐欄位數字，禁用「完成」「100%」。

## 技術約定

- 純 HTML/CSS/vanilla JS，無 build step。本機預覽：`node scripts/dev-server.js`。
- JS 用 camelCase，CSS 用 kebab-case，hash 導航依賴穩定的 id anchor。
- 資料檔保持既有欄位名（`code` `name_zh` `name_en` …）；改了 `data/**.json` 必跑
  `node scripts/build-data.js`；UI/導航改動跑 `node scripts/validate-interactions.js`。
- 重構：漸進、小步、不引框架、不一次重寫；中高風險先問 Ting。
