# AcuTing OS Deployment Notes

## Current Goal

This repository is prepared as a private, GitHub-ready static web app for AcuTing OS.

Primary use:

- Private study and clinical learning workspace.
- Mobile-friendly access after deployment.
- Public English content planning for a future AcuTing Learn site.

## Important Privacy Boundary

Do not commit identifiable patient information.

Use only de-identified `patient_code` values in this project unless a future version adds proper privacy, access control, encryption, backup policy, and clinic-approved workflows.

Do not commit:

- Full patient names.
- Full dates of birth.
- Phone numbers.
- Addresses.
- Insurance IDs.
- Medical record numbers.
- Real claim documents.
- Exported case files.

The `.gitignore` file excludes common private export folders, but it cannot protect data if it is manually pasted into tracked files.

## Phone Access Options

### Option A: Private Repository Only

Good for backup and collaboration, but not enough for phone browser access by itself.

You can store the code in a private GitHub repo and open it on a computer, but your phone needs a hosted website URL.

### Option B: Private Static Website

Best target for your current goal.

Deploy the static folder to a platform that supports password protection or private access, such as:

- Vercel with access protection.
- Cloudflare Pages with Access.
- Netlify with password or identity protection.
- A private acuting.com subdomain managed by the existing site workflow.

### Option C: GitHub Pages —— 沒有採用,不要拿這裡的網址去驗收

> **2026-08-31 實測:`https://guot-beep.github.io/acuting-os/` 回 404
> 「There isn't a GitHub Pages site here」。Pages 從來沒有啟用過。**
>
> 這一節寫的是「啟用之後會是什麼網址」,不是「現在在跑的網址」。
> 底下那行網址被當成上線位址讀過至少一次,白花了一輪驗收時間 ——
> 正式上線的是 **Cloudflare Pages**(見本文件〈Cloudflare Pages 部署〉)。

GitHub Pages can host static HTML/CSS/JS from a repository. Private repository support and access control depend on the GitHub plan and organization settings. Confirm current GitHub settings before using it for private clinical study access.

Do not put real patient data on GitHub Pages.

Current project repository:

```text
https://github.com/guot-beep/acuting-os
```

Expected GitHub Pages project URL after Pages is enabled:

```text
https://guot-beep.github.io/acuting-os/
```

Recommended GitHub Pages settings:

```text
Settings > Pages
Build and deployment: Deploy from a branch
Branch: main
Folder: / (root)
```

This repo includes a `.nojekyll` marker so GitHub Pages serves the static app files directly.

## Static App Entry

Main page:

```text
index.html
```

Core files:

```text
app.js
styles.css
data/
```

No build step is required right now.

## Recommended Deployment Path

1. Keep this repo private.
2. Deploy only the static app folder to a protected staging URL.
3. Use the staging URL on phone for study and data lookup.
4. Keep AcuTing Learn public English content separate from private AcuTing OS clinical notes.
5. Hand public-ready content to the acuting.com / Claude-managed workflow only after source review.


---

## Cloudflare Pages 部署(2026-07-26 定案)—— **這是正式上線的路徑**

### 正式網址(Ting 提供,2026-09-01)

```text
https://acuting-os.guotingru.workers.dev/
```

注意是 `workers.dev`,不是本節下面寫的 `*.pages.dev` —— 實際部署走的是 Worker
(或 Pages-on-Workers)。這個網址先前只存在於 Cloudflare 後台,repo 裡沒有,
2026-09-01 才由 Ting 貼出來記進這裡。

**實測(2026-09-01,從她自己的機器用純 node fetch 與獨立瀏覽器 profile 各驗一次):**
- 回 200,直接拿到 app —— **沒有經過 Cloudflare Access 的登入頁**。
  本節下面「上鎖(只有 Ting 能開)」那段描述的 Zero Trust 政策,**沒有套在這個
  hostname 上**(可能是套在 pages.dev 那個、而這個 workers.dev 是另一份沒鎖的部署)。
- 這**不是** PHI 外洩:app 是純前端 + localStorage,伺服器上沒有任何病例。
  陌生人打開只會看到知識庫 + 一本空的病例簿。
- 但文件說它是私有的而它不是 —— 要不要鎖、鎖哪一個,是 Ting 的決定
  (已列進 docs/TING_PENDING_RULINGS_2026-08-31.md B3)。
- 當天 main 的所有修正都已在線上(逐一比對 js/knowledge.js 與
  js/clinical-store.js 的標記,並開瀏覽器讀 DOM:508 張病症卡的紅旗區
  0 張印壞字串,痛風卡印「緊急轉診 ⚠ 發燒合併關節症狀 → 立即轉診排除感染性關節炎」)。

### AI session 怎麼驗收

既然這個 hostname 沒有 Access,AI session **可以**直接驗線上版 —— 但只准**唯讀**:
只導覽、只讀 DOM、**絕不碰 localStorage**。線上版在 Ting 自己的瀏覽器裡裝著她的
真實病例;AI 的瀏覽器 profile 是獨立的(看到 0 筆病例是正常的),但在線上網址
上建測試病例、清 localStorage 都是不可原諒的手滑。要做寫入測試一律用本機服務
(`node scripts/dev-server.js <port>`)。

驗收仍然兩層:
1. 本機服務開卡片眼讀(可以寫入、可以建測試病例);
2. `node scripts/build-site.js` 產出 `dist/`,驗那份產物 —— 載入
   `dist/data/generated/*.js` 取記錄比對,不要字串 grep(bundle 壓過,grep 會給
   假陰性,2026-08-31 就這樣誤判過「青木香沒有 deprecated」)。
3. 線上版只做第三層確認:fetch 標記 + 唯讀 DOM。

單檔超過 25 MiB 部署會失敗,而失敗發生在 Cloudflare 那端。`build-site.js` 從
2026-08-31 起會直接 exit 1(20 MiB 先出警告),不再只是 console.warn。

**設定**(Cloudflare Dashboard → Workers & Pages → 專案 → Settings → Build):

| 欄位 | 值 |
|---|---|
| Build command | `node scripts/build-site.js` |
| Build output directory | `dist` |
| Framework preset | None |

**為什麼要 build 步驟**:直接部署 repo 根目錄會失敗且不安全 ——
- `data/imports/cloudtcm/formula_url_map.json` 有 39 MB,超過 Cloudflare
  單一 asset 上限 25 MiB → `[ERROR] Asset too large`。
- 整個 repo 有 897 檔 / 137 MB,其中 **`curriculum/` 是 Ting 的版權課件,
  絕對不可上傳**。

`scripts/build-site.js` 只複製 `index.html` 實際引用的本地檔案(13 檔、
約 13 MB),其餘一律留在私人 repo。新增資料檔時只要在 index.html 引用,
build 會自動帶上,不用改腳本。

**上鎖(只有 Ting 能開)**:Cloudflare Zero Trust → Access → Applications →
Add self-hosted → 網域填 `<專案>.pages.dev` → Policy: Allow / Include /
Emails = Ting 的 email → 登入方式 One-time PIN。

**注意**:病例資料存在各瀏覽器 localStorage,手機與電腦各自獨立;
要搬用面板裡的 匯出/匯入 JSON。知識內容(穴位/中藥/方劑)則隨部署同步。

---

## 桌機 SQLite 模式(2026-09-01 起,Ting 裁定提前執行 D18 pointer 步)

**兩個網址 = 兩本病例簿。開哪一個,就寫哪一本。**

| 網址 | 病例存在哪 | 誰用 |
|---|---|---|
| `http://127.0.0.1:8785/`(由 `scripts/clinical-sqlite-service.js` 供應) | **SQLite** `%USERPROFILE%\Documents\AcuTing\acuting-clinical.db` | 診間桌機 |
| `https://acuting-os.guotingru.workers.dev/` | 該瀏覽器的 localStorage | 手機;桌機**不要**再在這裡建病例 |

- 判斷靠**來源**不靠旗標:`js/clinical-sqlite-backend.js` 只在 loopback 主機名上探測同源
  `/__clinical/ping`,拿到服務標記才把 `AcuTingClinicalStore.setBackend()` 接到 SQLite;
  workers.dev / `dev-server.js` 上這支什麼都不做,app 行為逐位元組不變。
- 正本是 `clinical_kv`(app 寫出的字串原樣);schema.sql 的 29 張表是每次存檔後重建的
  查詢投影,投影失敗不擋存檔、只亮徽章。左下角徽章 `🗄 SQLite · acuting-clinical.db · rev N`
  = 這個分頁正在寫 SQLite;沒有徽章 = localStorage。
- 回滾 = 開回 workers.dev。localStorage 從頭到尾只被讀出來匯入,沒有被寫。
- 桌機的 app 版本 = `C:\Projects\acuting-sqlite-tools`(釘 main 的唯讀副本);
  `scripts/start-clinical-desktop.cmd` 每次啟動會先 fetch 最新 main。卡片內容照常 push,
  下次雙擊就是新版。
- 手機↔電腦仍**不同步**;那要 D1 + 一次隱私裁定(TING_PENDING_RULINGS B2),不是 SQLite 的事。
- 操作流程:`docs/SQLITE_RUNBOOK_2026-09-01.md`。回歸套件:`scripts/test-clinical-sqlite-service.js`。
- AI session 驗收規則不變:線上版唯讀;寫入測試用本機服務,**而且要用自己的 `--db` 與 `--port`**
  (預設 8785 + Documents 那個 .db 是 Ting 的真實病例)。
