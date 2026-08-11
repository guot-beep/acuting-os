# Cloudflare 部署 — 唯一正確路徑(2026-08-12)

## 為什麼一直失敗(root cause)

`dist/` 在 `.gitignore` 裡(第 13 行),所以 Cloudflare Workers Builds 每次
fresh checkout 都**沒有 dist/**。舊 Pages 時代的 build 命令設定沒有跟著搬到
Workers Static Assets,於是 `npx wrangler deploy` 找不到
`assets.directory = ./dist` → 失敗或部署空殼。這是儀表板配置漂移,不是程式碼壞。

## 修法(已入 repo,`994d8b3` 之後)

`wrangler.jsonc` 現在自帶:

```jsonc
"build": { "command": "node scripts/build-site.js" }
```

wrangler 在每次 `deploy`/`dev` 前自動先跑 build.command——管線由 repo 自身決定,
不再依賴儀表板欄位。`build-site.js` 同時是隱私閘門:
quarantine 擋 `curriculum/`、`data/imports/`、`docs/`、`clinical/`、`cases/`,
**絕不允許改成發佈 repo root**(897 檔案/137MB,含版權課件與 39MB 超限檔)。

## 2026-08 更正與補充(SOL review + 本機實測)

1. **更正**:git-connected Workers Builds 的 build 命令必須設定在 **Workers
   Builds trigger 本身**(build command = `node scripts/build-site.js`,deploy
   command = `npx wrangler deploy`,root = repo root),不能只依賴
   wrangler.jsonc 的 `build.command`。jsonc 那份保留作為第二道保險
   (`wrangler deploy` 在任何環境都會先跑它),但 trigger 設定是正道。
2. **本機部署不可行(硬限制)**:這台機器是 Windows ARM64,wrangler 依賴的
   workerd 沒有 win32-arm64 版,連 `wrangler whoami`/`login` 都無法執行。
   所以 production 部署的唯一路徑 = git-connected Workers Builds(在
   Cloudflare 的 Linux runner 上執行,不受本機限制)。
3. **本機亦無任何 Cloudflare 憑證**(無 env token、無 cached OAuth)。
   要讓 AI 自主修 trigger + 觸發 main 的 production build,Ting 需要做
   **一件事**:建立一個 API token(dash.cloudflare.com → My Profile →
   API Tokens → Create)権限:Account / **Workers Builds Configuration:
   Edit** + **Workers Scripts: Edit**,以環境變數 `CLOUDFLARE_API_TOKEN`
   提供(絕不寫進 repo)。有 token 後其餘全部可經 REST API 自動完成。

## Ting 要在 Dashboard 核對的四件事(無 token 時的手動 fallback)

1. **Workers & Pages → acuting-os → Settings → Builds**:
   Production branch = `main`。
2. **Deploy command** = `npx wrangler deploy`(預設即可)。
   Build command 欄可留空(wrangler.jsonc 已自帶);若已填
   `node scripts/build-site.js` 也無害,不用刪。
3. **Non-production branch builds** 開啟 → `codex/pattern-v2` 的 push 會產生
   preview 版本(`wrangler versions upload`),不會動到 production。
4. 看最新 build log:必須出現 `dist/ ready: N files` 這一行,才代表 build
   真的跑了。

## 分支落地策略(2026-08-11 修訂 — SOL 抓到過期假設)

- ~~`origin/main` 是 `codex/pattern-v2` 的祖先~~ **此假設已失效**:2026-08-11
  main 曾獨立前進(ca2c45b9),已由 d6356e6 merge 整合回 Clinical branch。
- **鐵則:ancestry 不是常數,是每次落地當下必須重新驗證的事實。**
  落地前必跑:`git fetch origin main && git merge-base --is-ancestor origin/main HEAD`
  —— 非祖先就先整合(merge main 進 branch、解衝突、重跑全套驗證),
  **絕不把 `git push HEAD:main` 當固定程序盲推**。
- 落地 gate(231-commit 級分支的最低門檻,SOL 2026-08-11 建議採納):
  clinical invariants PASS · C2b rehearsal 全綠 · content/build validators
  照 ratchet · build-site PHI quarantine PASS · GitHub Actions 該 commit
  有綠燈 combined status(現況:validate.yml 存在但最新 head 無 run —— 落地
  前必須先讓 CI 真的跑起來)· ancestry 當下重驗。
- 只在里程碑邊界落地:validators 全 PASS + 該里程碑該審的審完。
- 落地前 `git status` 必須乾淨確認:未提交的 js/ 藥理 WIP 與 curriculum/
  刪除檔**永遠不在落地內容裡**(它們本來就只在工作樹,不在 commit 裡)。
- Production 部署跟著 `main`;sprint 期間 `codex/pattern-v2` 只出 preview。

## 2026-08-11 API 實查結果(token 取得後)

- **Production 驗證完成**:live deployment(2026-08-09 03:38 UTC)= 乾淨 main
  `47026e5` 的 build,逐檔 md5 比對 MATCH(/、app.js、styles.css、
  js/knowledge.js);HTTP 200。**production 現況健康,無需重部署。**
- **根因確定**:這個 Worker **從未接上 GitHub**(Workers Builds API 全部
  12000 Not found = 無任何 trigger/connection)。所謂「部署失敗」不是 build
  設定漂移,是 git 連接根本不存在——歷來部署都是手動 wrangler。
- **唯一剩餘的 Ting 動作**(GitHub App 授權天生互動式,API 無法代辦):
  Dashboard → Workers & Pages → acuting-os → Settings → **Builds → Connect**
  → 選 `guot-beep/acuting-os`,設:production branch `main`、
  build command `node scripts/build-site.js`、deploy command
  `npx wrangler deploy`、root `/`。接好後 push main 即自動建置部署,
  非 main branch 出 preview 版本。
- **未解之謎(待 Ting 確認)**:2026-08-11 06:55–07:23 UTC 有 5 個版本
  (652–656)以 guotingru@gmail.com 身分經 wrangler 上傳(未 promote)。
  本機跑不了 wrangler,不是這裡做的——若不是 Codex/SOL 在別處代操作,
  應考慮 roll credentials。
