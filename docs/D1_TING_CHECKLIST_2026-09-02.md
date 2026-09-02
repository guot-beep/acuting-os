# D1 切換:妳要做的三件事(Cloudflare 後台,約 10 分鐘)+ 切換當下的核對

寫給 Ting。程式那邊已經做完、測完(見文末)。**只有妳的帳號能做這三件事**,做完把三個值貼給我,
我 30 分鐘內切換。可以用手機瀏覽器做。

> 先登入 https://dash.cloudflare.com/(帳號 guotingru@gmail.com)。

---

## 事 1:把網站上鎖(Cloudflare Access)—— D33 前提一

**目的**:從此打開 `https://acuting-os.guotingru.workers.dev/` 要先用妳的 email 收一次性 PIN 才進得去。
病例上雲之後,沒鎖 = 任何人拿到網址就能讀寫。

### 路徑 A(最短,建議先試)
1. 左邊選單 **Workers & Pages** → 點 **acuting-os** → 上方 **Settings** → **Domains & Routes**。
2. 找到 `acuting-os.guotingru.workers.dev` 那一列 → 右邊 **⋯** → 若有 **Enable Cloudflare Access** 就按下去。
3. 它會自動建立一個 Access 應用程式。按完後**一定要去檢查政策**(路徑 B 的第 5 步),確定只放行妳的 email。

### 路徑 B(手動,A 找不到那個按鈕時)
1. 左邊選單 **Zero Trust**(第一次會要妳選方案,選 **Free**;會要妳取一個 team name,例如 `acuting` —— **把這個 team name 記下來**)。
2. **Access** → **Applications** → **Add an application** → **Self-hosted**。
3. Application name:`AcuTing OS`;Session duration:`24 hours`。
4. Application domain:輸入 `acuting-os.guotingru.workers.dev`(Path 留空)。→ Next。
5. **Policy**:Policy name `Ting only`;Action **Allow**;Configure rules → Selector **Emails** → 值 `guotingru@gmail.com`。→ Next → 其餘預設 → **Add application**。
6. 登入方式:Zero Trust → **Settings** → **Authentication** → Login methods 至少要有 **One-time PIN**(預設就有)。

### 拿兩個值給我
- **AUD tag**:Access → Applications → 點 `AcuTing OS` → **Overview** 或 **Basic information** 裡的
  **Application Audience (AUD) Tag**(一長串 64 個字元)→ 複製。
- **Team domain**:Zero Trust → **Settings** → **Custom Pages**(或 **General**)裡的 **Team domain**,
  長得像 `acuting.cloudflareaccess.com` → 複製(我會加 `https://`)。

### 確認鎖上了
用**無痕視窗**開 `https://acuting-os.guotingru.workers.dev/` → 應該看到 Cloudflare Access 的登入頁(要 email)。
沒看到就是沒鎖,回頭檢查第 4 步的 domain 有沒有打錯。

> 鎖上以後妳自己(手機、電腦)第一次開也要登入一次(輸入 email → 收 PIN → 貼上),之後 24 小時內免登。
> **app 現在的病例(localStorage)完全不受影響**,鎖的是門,不是屋內。

---

## 事 2:建 D1 資料庫 —— 病例的新家

1. **Workers & Pages** → 左邊 **D1 SQL Database** → **Create database**。
2. Name:`acuting-clinical`;Location:預設(自動)即可 → **Create**。
3. 進到資料庫頁面,右邊(或 Settings)有 **Database ID**(UUID,像 `0f1e2d3c-4b5a-…`)→ 複製給我。

不用建表、不用綁定,程式第一次連線會自己建表;綁定由設定檔(wrangler.jsonc)宣告,我來。

---

## 事 3(選做,給自動備份用):Service token

之後要讓桌機的工具**不用手動登入**就能把整本病例拉回來當備份,需要一組機器用的鑰匙:
Zero Trust → **Access** → **Service Auth** → **Service Tokens** → **Create Service Token** → 名稱 `acuting-backup-desktop`,
Duration 1 年 → 建立後會顯示 **Client ID** 與 **Client Secret**(**Secret 只顯示這一次**,先貼到密碼管理器,再把兩個都給我)。
沒做也沒關係,備份可以先靠 app 的「匯出 JSON」。

---

## 貼給我的東西(三行)

```
DATABASE_ID = 
TEAM_DOMAIN = 
AUD_TAG     = 
```

(選做)`SERVICE_TOKEN_ID / SECRET`。

---

## 切換那天(我做,妳在旁邊 15 分鐘)

1. 我把三個值寫進設定、跑閘門、推上 main → Workers Builds 自動部署(3–5 分鐘)。
2. **妳在桌機**:開網址 → Access 登入 → 左下角出現**藍色徽章** `☁ D1 · acuting-clinical · rev 0 · guotingru@gmail.com`,病例 0 筆(新簿子,正常)。
3. **匯入桌機的病例**:病例 → 匯入 → 選桌機那份匯出 JSON → 「合併」→ 徽章 rev 1、病例出現。
4. **手機**:同一個網址 → Access 登入 → 看到同一筆病例(**這就是妳要的**)→ 手機也按「匯出 JSON」(舊的手機病例)→ 傳到桌機 → 桌機匯入「合併」→ 兩邊重新整理都看到全部。
   如果合併被拒(「事件歷史會被改寫」),停下來貼給我,不要選「完整還原」。
5. **五個核對**:(a) 桌機 F5 病例還在;(b) 手機 F5 一樣;(c) 桌機加一則 SOAP → 手機 F5 看得到;(d) 手機改一筆 → 桌機 F5 看得到;(e) 兩台同時改同一筆 → 後存的那台被擋、重新整理後再改一次成功。
6. 舊的 localStorage 病例從頭到尾沒被動過 = 回滾錨。回滾 = 我把設定切回純靜態(一個指令、一次 push),app 回到 localStorage,匯出 JSON 匯回去即可。

---

## 程式那邊已經做完什麼(給妳安心,不用讀懂)

| 元件 | 測試 |
|---|---|
| Access JWT 驗證(只認 RS256、金鑰輪替、alg 混淆與竄改都擋) | 27 條 |
| 病例正本資料層(compare-and-set 用 trigger 守門、大值分塊、每 key 留 200 版歷史) | 29 條 |
| HTTP 契約(沒登入 401 / 沒設定 503、跨站寫入 403、兩台同時寫 409) | 30 條 |
| 瀏覽器端(本機服務 + D1 共用同一套) | 43 條 |
| 部署閘門(半套設定不准上 main)+ 負控 | 17 條 |
| 本機 Worker + D1(真瀏覽器):建案、重啟後仍在、兩分頁衝突擋下並備份 | 走過一遍 |

D1 平台的兩個坑已用實測繞開:多句交易裡的條件式更新會讓過期寫入落地(改用 trigger);單列 2 MB 上限(分塊)。
