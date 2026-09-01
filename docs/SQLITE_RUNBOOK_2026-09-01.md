# SQLite 遷移操作流程(2026-09-01 晚,Ting 裁定「現在搬」)

寫給 Ting,不是寫給 agent。**六步,十五分鐘,隨時可以回頭。**

---

## 先講清楚這次搬的是什麼

- **搬完以後**:桌機上的 app 從 `http://127.0.0.1:8785/` 開,病例存在
  `C:\Users\guoti\Documents\AcuTing\acuting-clinical.db` —— 一個真的 SQLite 檔,
  可以複製、可以下 SQL。
- **沒搬的**:手機。手機碰不到妳桌機的檔案,仍然用 workers.dev + 它自己的 localStorage。
  手機電腦共用要等 D1,那是另一次決定,今晚不做。
- **沒動的**:workers.dev 那邊瀏覽器裡的舊病例。遷移只把它**複製**進 SQLite,一個字都不刪、
  不改。所以回頭 = 開回 workers.dev,就這樣。
- **無關的**:卡片內容(中藥/方劑/穴位)。那些在 git 裡,照常改、照常 push。

## 一張表:兩個網址 = 兩本簿子

| 開哪個網址 | 病例寫進哪 | 誰用 |
|---|---|---|
| `http://127.0.0.1:8785/`(黑視窗開著時) | **SQLite** `Documents\AcuTing\acuting-clinical.db` | 診間桌機 |
| `https://acuting-os.guotingru.workers.dev/` | 那台裝置瀏覽器的 localStorage | 手機。桌機**不要**再在這裡建病例 |

分辨方法只有一個,而且很明顯:**app 左下角有綠色徽章 `🗄 SQLite · … · rev N` = 正在寫 SQLite;
沒有徽章 = 在寫 localStorage。**

---

## 步驟

### 0. 先把最新病例匯出一份(在 workers.dev,用桌機瀏覽器)

病例 → **匯出 JSON**。記住存到哪(通常是「下載」)。
下午那份如果之後沒再加病例,直接用它也可以。

### 1. 更新工具副本(只有第一次要手動;以後啟動器自己會更新)

PowerShell 貼這一行:

```powershell
git -C C:\Projects\acuting-sqlite-tools fetch -q origin main; git -C C:\Projects\acuting-sqlite-tools checkout -q --detach origin/main; Test-Path C:\Projects\acuting-sqlite-tools\scripts\start-clinical-desktop.cmd
```

最後要印 `True`。印 `False` 就停下來貼給我。

### 2. 啟動服務

雙擊 **`C:\Projects\acuting-sqlite-tools\scripts\start-clinical-desktop.cmd`**。

會發生三件事:
1. 一個黑色視窗(標題 `acuting-clinical-sqlite`)開著,印出資料庫路徑、`revision 0`、`病例 0 筆`。
2. 瀏覽器自動開 `http://127.0.0.1:8785/`。
3. app 左下角出現綠色徽章 **`🗄 SQLite · acuting-clinical.db · rev 0`**。

病例 0 筆是**正常的** —— 這是一本新簿子,還沒匯入。

> 黑視窗要一直開著。關掉 = app 存不了檔(它會跳紅字說「這次**沒有**寫入」,不會靜默丟)。

### 3. 匯入

app 上方病例列的**匯入**(選檔案)→ 選步驟 0 的 JSON →
跳出「匯入模式 Import mode」→ 按 **確定(合併 Merge)**。

看三個地方:
- 徽章變 `rev 1`,病例列表出現妳的病例。
- 黑視窗多兩行:`PUT acuting-clinical-cases-v1 … → rev 1` 和 `projection ✓ N 筆病例 → 29 張投影表`。
- 如果跳「匯入被拒絕 … 契約違規」,整段貼給我,什麼都沒被寫入。

### 4. 核對(五個 ✓)

| # | 做 | 要看到 |
|---|---|---|
| a | app 按 F5 重新整理 | 病例還在、徽章還在 |
| b | PowerShell 跑下面兩行 | `正本 keys 1 個`、`病例 N 筆`(N = 妳匯入的數量)、`投影表 ✓`、`有資料的表 … cases=N patients=…` |
| c | 在 app 裡對某一筆加一則 SOAP(或改一個字)存檔 | 徽章 `rev` +1;黑視窗多一行 `PUT` |
| d | 再 F5 | 剛才的修改還在 |
| e | 再跑一次 b | `revision` 變大、`history` 列數變大(每次存檔前的舊版都留著,每個 key 最近 200 版) |

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
node C:\Projects\acuting-sqlite-tools\scripts\clinical-sqlite-service.js --status
```

五個都 ✓ = **搬完了**。

### 5. 從明天起怎麼用

- **桌機**:雙擊 `.cmd` → 用 `127.0.0.1:8785`。加書籤,取名「AcuTing 診所」。
- 桌機瀏覽器裡 workers.dev 的書籤改名「舊 · 手機用」。**不要再在桌機用它建病例**(那會寫進舊簿子,幾天後妳會有兩本對不起來的簿子)。
- **手機**:照舊 workers.dev。
- **備份**:關掉黑視窗之後,把 `Documents\AcuTing\acuting-clinical.db` 複製到隨身碟或雲端 = 完整備份。
  (要先關服務:SQLite 開著的時候資料有一部分在旁邊的 `-wal` 檔裡,關掉才會併回主檔。)
  或照舊在 app 裡按「匯出 JSON」。**`.db` 絕對不進 git**(D7;`.gitignore` 已擋 `*.db`)。
- **更新卡片內容**:照常 push;下次雙擊 `.cmd` 會先抓最新 main 再啟動。

### 6. 回頭(任何時候)

關黑視窗 → 開 workers.dev → 舊病例原封不動(遷移從頭到尾沒有寫過它)。
如果在 SQLite 模式已經新增了病例、想帶回去:先在 `127.0.0.1:8785` 按「匯出 JSON」,
再到 workers.dev 匯入(合併)。

---

## 會遇到的訊息

| 看到 | 意思 | 做什麼 |
|---|---|---|
| 徽章變**橘** `⚠ 查詢表未更新` | 病例**已經存好了**;只是 SQL 查詢用的 29 張表這一次沒重建成功(最常見:某筆病例沒填病人代號) | 滑鼠移到徽章上看原因。不急,下次存檔會再試 |
| 紅字「SQLite 服務沒有回應 —— 這次…**沒有**寫入」 | 黑視窗被關了 | 重開 `.cmd` → F5 → 再存一次 |
| 紅字「拒絕寫入:另一個分頁在這之後存過檔…」 | 兩個分頁同時開著 `127.0.0.1:8785` 都在改 | 照訊息:F5 這一頁再改一次。被擋的內容已備份在 SQLite 的 `acuting-clinical-conflict-backup` |
| 徽章**紅** `⛔ SQLite 服務讀取失敗 — 唯讀保護中` | 服務在,但讀不到資料 | 把黑視窗的錯誤整段貼給我。它**不會**靜默退回 localStorage |
| 黑視窗:`埠 8785 已被占用` | 服務已經在另一個視窗跑著 | 直接開 `127.0.0.1:8785` 就好 |
| 黑視窗:`FAIL — N 筆病例沒有病人代號` 或 `還沒有欄位可去` | 出現在 projection 那幾行 = 只影響查詢表,病例已存 | 同橘徽章;想修就到 app 補病人代號 |

---

## 這次做了什麼(工程摘要,給之後的自己)

- D18 的 **pointer** 步,Ting 2026-09-01 裁定提前執行(原條件觸發制:病例 ≥50 / 多裝置 / 容量)。
- pointer = **網址來源**,不是 localStorage 裡的旗標:由 `scripts/clinical-sqlite-service.js`
  供應的頁面才裝 SQLite backend(`js/clinical-sqlite-backend.js` 只在 loopback 探測同源
  `/__clinical/ping`);workers.dev / dev-server 上逐位元組不變。
- 正本 = `clinical_kv`(store 寫出的字串原樣,契約 C2/C7);29 張表 = 投影,
  每次存檔後 `export-clinical-to-sqlite.js --into` 在同一個檔裡重建;投影失敗 fail-visible,不擋存檔。
- 雙分頁:`If-Match` revision → 409 零寫入 + 備份;store 既有的樂觀鎖照樣有效。
- `clinical_kv_history` 每個 key 留最近 200 版。
- 回歸套件 `scripts/test-clinical-sqlite-service.js`(38 條,CI blocking),含負控。
- 2026-09-01 22:13 在隔離服務(port 8791、暫存 .db)用真的「新增病例」表單走過一遍:
  rev 0→1、`cases=1 patients=1`、F5 後仍在、dev-server 來源無徽章無病例。

| D18 步 | 狀態 |
|---|---|
| plan | ✅ |
| shadow | ✅ 影子匯出(下午) |
| verify | ✅ Ting 真實病例 1 筆,5/5 |
| **pointer** | ✅ **2026-09-01 晚**(本文件) |
| rollback | ✅ 設計即回滾:開回 workers.dev;localStorage 從未被寫 |

---

## 附:影子匯出(下午那一版,仍可單獨用)

把一份匯出 JSON 轉成獨立的 SQLite 檔,app 不動、不喜歡就刪 —— 現在主要用途是
**離線核對**或**把 JSON 備份轉成可查詢的檔**:

```powershell
node C:\Projects\acuting-sqlite-tools\scripts\export-clinical-to-sqlite.js "$env:USERPROFILE\Downloads\acuting-cases.json" "$env:USERPROFILE\Documents\acuting-shadow.db"
```

要看的五行:`halt-not-drop … ✓`、`寫入結果`、`對照表覆蓋 … 105 / 105 ✓`、
`病人代號前置檢查 … ✓`、`往返核對 … ✓ 全部相符`。任何 ⛔/⚠️ 整段貼給我。
