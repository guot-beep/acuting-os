# REBUILD HANDOFF — for Codex

Session: 2026-07-02 (Claude Cowork). Read this top-to-bottom before touching code.

## 1. 這次目標
Phase 1「資料解放 + 工作區外殼」：把 app.js 內嵌的知識資料抽到 data/、建立
JSON→app 的單向管線、首頁改成 6 個工作區導航。app 行為需與舊版完全一致。

## 2. 修改了哪些檔案
- 新增 `legacy/` (index.html, app.js, styles.css, README.md) — 舊版凍結快照
- 新增 `scripts/extract-embedded-data.js`
- 新增 `scripts/build-data.js`
- 新增 `scripts/validate-data.js`
- 新增 `data/acupoints/embedded/` 11 個 JSON（10 資料檔 + i18n_maps.json）
- 新增 `data/auricular/embedded/auricular_points.json`
- 新增 `data/generated/app_data.js`（機器產生）
- 修改 `app.js`（8,785 → 3,266 行）
- 修改 `index.html`（導航、data-workspace 屬性、script 標籤）
- 修改 `styles.css`（檔尾附加 workspace 規則）
- 新增 `js/router.js`
- 新增 `docs/`（REBUILD_PLAN, DATA_MIGRATION_MAP, REBUILD_HANDOFF, VALIDATION_LOG）

## 3. 每個檔案改了什麼
- `app.js`：15 個資料 const（starterPoints、professionalPoints、8 條經絡
  expansion、auricularPoints、4 個英文對照 map）從字面量改為
  `globalThis.ACUTING_APP_DATA?.<name> || fallback`。其他程式碼一行未動。
- `index.html`：(a) top-nav 從 10 連結改為 6 工作區連結（#ws/home 等）；
  (b) 14 個第一層 section 加 `data-workspace` 屬性；(c) directory-layout 補
  `id="directoryLayout"`；(d) 新增 `<script src="data/generated/app_data.js">`
  於 tung/auricular 之前、`<script src="js/router.js">` 於 app.js 之後。
- `styles.css`：檔尾新增 `section[data-workspace][hidden]` 隱藏規則與
  `.workspace-nav a.active` 樣式。

## 4. 為什麼這樣改
- 消滅「資料鎖在 408KB app.js」的單點風險；資料改動不再需要動程式碼。
- 靜態站不能 fetch 本地 JSON，所以用 build 腳本把 JSON 包成 generated .js。
- Router 用「隱藏非當前工作區」而不是重寫 DOM，因此 app.js 的所有
  querySelector 都照常命中，風險最低。

## 5. 有沒有移動、刪除、重新命名任何資料
- 沒有刪除任何資料檔。app.js 內的資料是「搬家」：字面量移除前先抽成 JSON，
  並以逐字節 deep-equal 驗證合併結果一致（見 §11）。
- 舊三檔完整複製於 `legacy/`。

## 6. 有沒有改 data schema 或欄位名稱
- 沒有。embedded JSON 保留 app 原始欄位（nameZh/nameEn/location/...）。
- 361.json 的 schema 差異與統一計畫寫在 docs/DATA_MIGRATION_MAP.md 末段。

## 7. 舊資料如何被保留或遷移
- 抽取方式：`scripts/extract-embedded-data.js` 在 stub 瀏覽器環境中「執行」
  legacy/app.js，捕捉評估後的陣列（含字面量內呼叫 helper 產生的
  sources/visualLinks），寫成 JSON。非手抄，零遺漏。
- localStorage 使用者資料（兩把 key：acupoint-atlas-v1、
  acuting-clinical-cases-v1）完全未動，新舊 app 共用。

## 8. 有沒有新增 generated files
- `data/generated/app_data.js`（265KB）。規則：**永遠不要手改**，改 JSON 後
  跑 `node scripts/build-data.js` 重新產生。

## 9. 有沒有新增 scripts
- `extract-embedded-data.js`（一次性遷移工具，可重跑，只讀 legacy/app.js）
- `build-data.js`（日常：JSON → generated）
- `validate-data.js`（日常：驗證 legacy 與現行 app 資料等價 + 重複 code 檢查）

## 10. 跑了哪些 validation / test
1. `node --check app.js`、`node --check js/router.js`
2. `node scripts/validate-data.js`
3. jsdom 全頁 smoke test（模擬瀏覽器載入全部 script，測工作區切換、
   #point/LU5 深連結、舊錨點 #caseWorkspace、卡片渲染）

## 11. Validation 結果
- defaultPoints 數量一致：681；**deep-equal 通過（與舊版逐字節相同）**
- 無重複 point code
- smoke test 11/11 通過（詳見 docs/VALIDATION_LOG.md）

## 12. 目前還沒完成什麼
- git index 損壞待修（見 §15，Ting 手動一分鐘）
- 小型 UI 設定仍在 app.js（channel audit、taxonomy、ear anchors）→ Phase 2
- tung/auricular 的手寫 .js 雙檔尚未改為 generated → Phase 2
- formulas/conditions/sources/audits JSON 尚未接進畫面 → Phase 2
- 361.json schema 統一 → Phase 2（先寫欄位對照表）

## 13. 接手先看哪幾個檔案
1. `docs/REBUILD_PLAN.md`（總計畫與 Phase 2 任務清單）
2. `docs/DATA_MIGRATION_MAP.md`（哪個檔案是最新事實）
3. `scripts/build-data.js`（管線規則）
4. `js/router.js` + index.html 的 nav 區塊
5. `app.js` 開頭 200 行（看 globalThis.ACUTING_APP_DATA 的接法）

## 14. 下一步建議
按 REBUILD_PLAN Phase 2 順序做，第 1 項（361.json 統一）動手前先在
DATA_MIGRATION_MAP.md 寫欄位對照表給 Ting 確認。

## 15. 風險或需要人工檢查的地方
- **git 修復（Ting 在 Windows PowerShell 執行）**：
  ```powershell
  cd "C:\Users\guoti\OneDrive\Documents\Acedemy 學習資料\acupuncture-point-app"
  del .git\index.lock, .git\HEAD.lock, .git\objects\maintenance.lock -ErrorAction SilentlyContinue
  del .git\index
  git reset
  git status   # 應顯示今天的新檔案為未暫存變更
  git add -A
  git commit -m "Phase 1: data liberation + workspace shell"
  ```
  起因：沙盒透過 OneDrive 掛載跑 git 造成 index 損壞。**工作檔與 GitHub 歷史無損。**
  之後 git 操作一律在 Ting 電腦上做，agent 不要在掛載資料夾跑 git。
- **Ting 待辦（5 分鐘）**：開啟 app 按「匯出 JSON」+「Export cases」備份
  localStorage 使用者資料。
- 人工檢查：真實瀏覽器開 index.html 點一輪 6 個工作區 + 搜尋 + 病例表單。
- OneDrive 同步延遲：agent 寫檔後立即讀可能讀到殘缺內容，重試即可。
