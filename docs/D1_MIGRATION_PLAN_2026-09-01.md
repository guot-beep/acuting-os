# D1 路線:手機、電腦開同一個網址,看同一本病例簿(計畫,2026-09-01 晚)

寫給 Ting。這份回答的是妳今晚最後說清楚的那句話:
**「這樣手機跟電腦去那個網址才會同步阿」「之前我們說好的就是 Cloudflare 那個做為病例登入的」**。

那是 **Cloudflare D1**(妳帳號底下的雲端 SQLite,由妳的 Worker 讀寫),不是今晚做的本機 SQLite。
本機那套已停用,病例照舊在 workers.dev 的 localStorage,沒動、沒丟。

---

## 妳會得到什麼

- 手機、電腦都開 `https://acuting-os.guotingru.workers.dev/`,**登入後看到同一本病例簿**。診間打的 SOAP,手機上重新整理就看得到。
- 病例存在 D1,不再存在瀏覽器裡;瀏覽器只是視窗。換手機、清瀏覽器資料,病例都還在。
- 兩台同時改同一筆會被擋下(revision),不會互相蓋掉 —— 今晚做的那套機制直接沿用。

## 兩個非做不可的前提(都是妳的裁定,不是工程)

1. **網站要先上鎖(B3)。** 現在任何人拿到網址都能開。病例一旦在雲端,沒鎖 = 任何人都能讀寫妳的病例。
   用 Cloudflare Access(妳的 email + 一次性 PIN),後台幾分鐘。**我可以陪妳一步一步按,但不能替妳登入 Cloudflare 帳號。**
2. **病例會離開妳的電腦(D7)。** 存在 Cloudflare 的資料中心。app 本來就規定只放去識別化 patient code,
   不放姓名 / 完整生日 / 電話 / 地址 —— 這條要繼續守,而且要寫進 DECISIONS 成為新的一條。**妳說 OK 才動工。**

## 架構(一句話:今晚那個本機服務搬進 Worker,資料庫換成 D1)

- **契約不變**:`/__clinical/kv` 那套 API(read / write / readKey / writeKey / removeKey、`If-Match` revision、history 表)。
  今晚 43 條測試大半直接沿用,只是後端從 `node:sqlite` 換成 D1。
- **瀏覽器 adapter 不變**:同源探測 `/__clinical/ping`,拿到服務標記就把 store 接上 ——
  這次「同源」就是 workers.dev 自己,所以**不需要換網址、不需要 CORS、不需要本機網路權限**。
- **正本 = `clinical_kv`**(app 寫出的字串原樣);29 張投影表之後用本機工具從 D1 拉回來建(查詢不必在雲端做)。
- Worker 只在驗過 Access 的 JWT(`Cf-Access-Jwt-Assertion`)後才回應 API;沒登入 → 401,零資料。
- **離線 / 服務沒回應**:app 唯讀 + 紅橫幅(今晚的毒丸那套),**絕不**靜默退回 localStorage。
- 切換用 D18 原文的機制:雲端可用 → 用雲端;localStorage 凍結成回滾錨,不再寫。

## 步驟(誰做、怎麼驗)

| # | 做什麼 | 誰 | 檢查點 |
|---|---|---|---|
| 0 | **開診第一週照舊**:workers.dev + localStorage,手機電腦各自(跟今天一樣) | 妳 | — |
| 1 | Access 上鎖 workers.dev(B3) | 妳(我陪) | 無痕視窗開網址,會被要求 email + PIN |
| 2 | Cloudflare 後台建 D1 資料庫 `acuting-clinical`,綁到 Worker,把 database_id 貼給我 | 妳(我陪) | dashboard 看得到綁定 |
| 3 | Worker 程式(`/__clinical` on D1)+ 契約測試進 CI | 我 | ✅ **2026-09-02 凌晨**:分支 `claude/d1-worker`;JWT 31 / kv 核心 29 / 處理器 34 / adapter 43 / 閘門 17 條全綠 |
| 4 | 先部署到 **staging** 網址,用假病例走一遍:兩台裝置、兩個分頁、斷網 | 我 + 妳的手機 | ✅ 本機 Miniflare D1 + 真瀏覽器已走過(建案 / 重啟仍在 / 雙分頁 409 + 備份 + 回滾);雲端 staging Worker 需第二個 D1 + Access,**列為切換後補做** |
| 5 | **遷移**:桌機匯出 JSON → 匯入雲端;手機匯出 JSON → 合併匯入(同 id 覆蓋、不同 id 追加;有衝突我列出來給妳裁) | 妳按「匯出」,其餘我做 | 兩台看到同一份;筆數 = 桌機 ∪ 手機 |
| 6 | 切換正式網址;徽章顯示 `☁ D1 · rev N` | 我 | 手機、電腦各存一筆,對方重新整理看得到 |
| 7 | 回滾演練:關掉綁定 → app 唯讀橫幅;匯出 JSON 匯回 localStorage | 我 | 🟡 `scripts/apply-d1-production-config.js --revert` 已寫並在沙盒驗過逐位元組還原;正式演練在切換日 |
| 8 | 備份:本機工具 `scripts/pull-clinical-from-d1.js`(service token)把整本拉回桌機 `backups/`(JSON + 29 表 .db) | 我 | ✅ 對本機 D1 拉回 2 筆、105/105、往返 ✓;雲端 cron→R2 列為後續 |

## 時程(實際)

- 2026-09-01 晚 Ting 追加:「今天直接做吧」「我出門 你接管電腦 做一個半小時」「可以做好這樣給你七個小時夠不夠?」
  → 程式與測試在 09-02 凌晨做完(見步驟 3、4、8)。**切換本身等她的三個帳號值**(D1 database_id、Access team domain、AUD tag),
  見 `docs/D1_TING_CHECKLIST_2026-09-02.md`。切換 = `scripts/apply-d1-production-config.js` → 閘門 → 合進 main(Workers Builds 自動部署)。

## 時程(原估,保留對照)

- 妳的部分:步驟 1、2 各約十分鐘,可以同一天。
- 我的部分:3–4 約兩個工作天;5–8 一天。
- **開診第一週不動**;第二週末切換是合理目標。要更快也行,但風險落在步驟 4 沒跑夠。

## 不做什麼(先講,免得期待落差)

- 不做「兩台同時編輯同一筆」的即時協作 —— 後存的那台會被擋,重新整理再改一次。
- 不放姓名 / 完整生日 / 電話(D7 不變)。
- 手機沒網路時不能寫(可以看最後一次載入的畫面)。

## 今晚做的本機服務怎麼辦

留在 repo(`scripts/clinical-sqlite-service.js` 等),當 (a) 離線核對與查詢工具、(b) D1 的參考實作與測試基準。不刪。
`docs/SQLITE_RUNBOOK_2026-09-01.md` 頂端已標「停用,不要照做」。

## 妳現在只要回答兩題

1. 前提 1(上鎖)與前提 2(病例存雲端、只放去識別化資料)—— **OK 嗎?**
2. 時程 —— **第二週末切換**可以嗎?還是妳要更快、接受少測?

回答之後,步驟 3 我就開工,步驟 1、2 約個時間我陪妳按。
