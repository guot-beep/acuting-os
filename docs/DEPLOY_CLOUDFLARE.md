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

## Ting 要在 Dashboard 核對的四件事

1. **Workers & Pages → acuting-os → Settings → Builds**:
   Production branch = `main`。
2. **Deploy command** = `npx wrangler deploy`(預設即可)。
   Build command 欄可留空(wrangler.jsonc 已自帶);若已填
   `node scripts/build-site.js` 也無害,不用刪。
3. **Non-production branch builds** 開啟 → `codex/pattern-v2` 的 push 會產生
   preview 版本(`wrangler versions upload`),不會動到 production。
4. 看最新 build log:必須出現 `dist/ ready: N files` 這一行,才代表 build
   真的跑了。

## 分支落地策略(Phase A 定案)

- `origin/main` 是 `codex/pattern-v2` 的祖先(已驗證)→ 落地 = fast-forward
  `git push origin HEAD:main`,**無 merge、無 knowledge.js 被整包覆寫的風險**
  (那個教訓來自反向 merge,不是 fast-forward)。
- 只在里程碑邊界落地:validators 全 PASS + 該里程碑該審的審完(Phase B 之後
  第一次落地前,先過 Codex schema audit)。
- 落地前 `git status` 必須乾淨確認:未提交的 js/ 藥理 WIP 與 curriculum/
  刪除檔**永遠不在落地內容裡**(它們本來就只在工作樹,不在 commit 裡)。
- Production 部署跟著 `main`;sprint 期間 `codex/pattern-v2` 只出 preview。
