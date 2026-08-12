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
  有綠燈 combined status(CI 已由 draft PR #59 啟動(2026-08-11,validate.yml 只在 PR/main-push/手動觸發 —— Codex R14 查明)。現況 exact-SHA 結果:PHI 隔離 ✅ / ratchet ✅ / blocking validators ❌ —— 唯一紅步驟 = formula card standard 的 10 個有帳保留(葛根湯誤植待 Ting、樣板殘根待源、F12×3 蓄意)。落地前此 10 項須逐一解決或經 Ting 正式改列 ratchet 制,不得為過 CI 而灌水)· ancestry 當下重驗。
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

## 真機使用 SOP:單一入口網址(Dry Clinic #7)

同一台機器上 `localhost` 與 `127.0.0.1` 是**兩個互不相通的病人資料庫**
(localStorage per-origin;C2b 的 pointer/staging 兩鍵同樣 per-origin,會跟著分裂)。
規則:
1. 臨床一律用**同一個網址**開系統;本機開發約定 `http://localhost:<port>`。
2. 瀏覽器書籤只設一個,開診機器不留第二個入口(app 已對 127.0.0.1 顯示紅色警示橫幅)。
3. **開診前先按「立即匯出」做一份備份**(2026-08-11 演練中匯出功能就是救回全庫的路徑)。

## CI 通知風暴處置(2026-08-12)

7 天 165 次 validate / 145 次失敗(全同一組 formula holds,非新缺陷)——
成因:多工作線高頻推送 codex/pattern-v2,PR #59 對每次 push 都跑 CI 且無
concurrency。處置:**PR #59 已關閉**,改「candidate 檢查點」模式:
1. 平時推送照常(push=備份紀律不變),不觸發 CI、不寄信。
2. landing candidate 就緒時:重開 PR #59 → 對 exact SHA 跑一次 validate →
   全綠才進上方 landing gate。重開指令:
   `curl -X PATCH -H "Authorization: token <PAT>" https://api.github.com/repos/guot-beep/acuting-os/pulls/59 -d '{"state":"open"}'`
3. 若重開後仍需高頻驗證,先由 Ting 經 GitHub 網頁編輯器為 validate.yml 加
   concurrency/cancel-in-progress(PAT 無 workflow scope;網頁編輯器有
   自動縮排陷阱,逐字最小差異+byte-level 驗證)。
4. 另一半信件來自 **main 的 123 run / 103 失敗**——同一組 formula holds
   也存在於 main 的內容線落版;4 個保留裁定後兩邊一起變綠。

## Wrangler 上傳事件歸因(2026-08-12)

08-11 的 5 個未 promote 版本(652-656):Ting 判斷「很有可能」是其他 AI
工作線(Codex 雲端/Antigravity/其他 Claude)持金鑰所為,非入侵。
維持觀察,不強制輪替;若日後出現無法歸因的上傳,立即輪替
CLOUDFLARE_API_TOKEN 並複查 Workers 版本歷史。

## CI 靜默死亡:PR 與 main 衝突時不會有任何 run(2026-08-12 實例)

現象:推送照常、PR 顯示 open,但 `actions/runs` 一筆都不建立,約 3 小時無人察覺。
機制:`pull_request` 事件的 workflow 跑在 GitHub 生成的 `refs/pull/N/merge` 上;
**PR 與 base 衝突時這個 merge ref 造不出來,於是連 run 都不會建立** —— 沒有紅叉、
沒有失敗信,看起來像「還沒跑」。在以 CI 為 landing gate 的專案裡,等於 gate 被
無聲拔掉。

- **偵測**:`GET /repos/guot-beep/acuting-os/pulls/59` 的 `mergeable_state`。
  `dirty` = 衝突 = CI 已死;`unstable` = 可合併但檢查未過(正常);`clean` = 都綠。
  landing 前的例行檢查要看這個欄位,不能只看最後一次 run 的顏色。
- **觸發條件**:任何一條線推 main(內容線經 antigravity worktree 的 update.bat
  推 main 是既有流程),而工作分支正好也改同一個檔。
- **處置**:盡快把 main 整進工作分支。衝突解法不要盲選一邊 —— 對方若把轉換腳本
  一起提交(2026-08-12 的 `scripts/fix-formula-boilerplate-gancao.js` 即是),
  正解是「檔案取我方 + 重跑對方腳本」,再逐項驗證兩邊關鍵成果都在
  (該次驗證:樣板句殘留 0 且方劑阻斷仍為 0、巢狀方中方仍在、public_safe 仍為 false)。

## docs-only preflight 的副作用:最新的綠燈不等於驗證過的綠燈

2026-08-12 加了 docs-only preflight(只改 `docs/**` 或 `*.md` 時略過重驗證器)之後,
那種 run 的結論仍是 `success`,但 green job 是 `skipped`。於是:

> **「最新一次 run 是綠的」不再等於「程式碼與資料是綠的」。**

當天就踩到:一筆條件資料合併漏了 `node scripts/build-data.js`,
generated-data 關卡在 `057ee9e` 變紅;緊接著的 docs-only 推送顯示綠燈,
差點讓那筆紅的被蓋過去。

**檢查方式**(不要只看最近一次 run 的顏色):

```bash
export GH_TOKEN=$(printf "protocol=https\nhost=github.com\n" | git credential fill | grep ^password= | cut -d= -f2)
node scripts/ci-last-real-run.js            # 預設 codex/pattern-v2
node scripts/ci-last-real-run.js --branch main
```

它會略過所有 green job 被 skip 的 run,只報告最近一次真正跑過完整驗證的結果,
並列出其後有幾次是 docs-only。green job 若被改名,腳本會**大聲失敗**而不是無聲通過。

landing 前的檢查清單因此有兩項,不是一項:`mergeable_state` 必須是 `clean`
(見上方章節),**且** `ci-last-real-run.js` 必須 exit 0。
