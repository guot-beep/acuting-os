#!/usr/bin/env node
/**
 * apply-d1-production-config.js — D33 的「切換 commit」產生器:把 Ting 從 Cloudflare 後台拿到的三個值寫進
 * wrangler.jsonc(main / assets.binding / run_worker_first / d1_databases / vars),並在 index.html 加上宣告 meta。
 * 兩件事一定一起做(閘門 validate-d1-deploy-gate.js 守的就是這個),最後自動跑閘門。
 *
 * 用法:
 *   node scripts/apply-d1-production-config.js --database-id <uuid> --team-domain https://<team>.cloudflareaccess.com --aud <64hex> [--emails a@b.com,c@d.com]
 *   node scripts/apply-d1-production-config.js --revert      # 拿掉 Worker 設定與 meta(回到純靜態部署 = 回滾)
 *
 * 不碰 git;產生的變更由人(或 Claude)檢視後 commit。上 main 前必須:Access 已在 workers.dev 上生效(無痕視窗會被要求登入)。
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const WRANGLER = path.join(ROOT, "wrangler.jsonc");
const INDEX = path.join(ROOT, "index.html");
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const REVERT = argv.includes("--revert");

const META_LINE = '    <meta name="acuting-clinical-backend" content="d1">';
const META_COMMENT = "    <!-- D33:這份部署帶病例服務(Worker + D1)。js/clinical-sqlite-backend.js 看到這個宣告就在任何主機名上探測 /__clinical/ping,探測不到 = 唯讀,不退回 localStorage。與 src/worker.mjs 同一個 commit 出貨(scripts/apply-d1-production-config.js)。 -->";

function readWrangler() {
  const raw = fs.readFileSync(WRANGLER, "utf8");
  const { stripJsonc } = require("./validate-d1-deploy-gate.js");
  return { raw, cfg: JSON.parse(stripJsonc(raw)) };
}

function writeWrangler(cfg, header) {
  const body = JSON.stringify(cfg, null, 2);
  fs.writeFileSync(WRANGLER, `${header}\n${body}\n`);
}

const HEADER_PROD = `{
  // Cloudflare deploy config for AcuTing OS(private clinical app)。
  // 靜態資產:dist/(scripts/build-site.js 只複製 index.html 引用的檔案,並擋 curriculum// clinical// imports// docs/)。
  // 病例服務:src/worker.mjs 只攔 /__clinical/*(run_worker_first),其餘交給資產;病例正本在 D1(D33)。
  // 認證:每一條 /__clinical/* 都驗 Cloudflare Access 的 JWT(vars 三個 ACCESS_*);沒設 → 503 fail-closed。
  // 這個檔由 scripts/apply-d1-production-config.js 產生;改值請改那支的參數再跑一次,並讓 validate-d1-deploy-gate.js 過。
}`.replace(/\{\n|\n\}/g, "").trim();

function setMeta(html, on) {
  const lines = html.split("\n").filter((l) => !/acuting-clinical-backend/.test(l) && !/D33:這份部署帶病例服務/.test(l));
  if (!on) return lines.join("\n");
  const i = lines.findIndex((l) => /<meta\s+name="viewport"/.test(l));
  if (i < 0) throw new Error("index.html 找不到 viewport meta,不知道插哪");
  lines.splice(i + 1, 0, META_COMMENT, META_LINE);
  return lines.join("\n");
}

(function main() {
  const { cfg } = readWrangler();
  if (REVERT) {
    delete cfg.main; delete cfg.d1_databases; delete cfg.vars;
    if (cfg.assets) { delete cfg.assets.binding; delete cfg.assets.run_worker_first; }
    writeWrangler(cfg, HEADER_PROD);
    fs.writeFileSync(INDEX, setMeta(fs.readFileSync(INDEX, "utf8"), false));
    console.log("已回到純靜態部署設定(Worker / D1 / meta 全拿掉)。");
  } else {
    /* 兩種認證模式,由參數決定,永遠只寫一種進設定(閘門 G2 會擋「兩種都設」與「都沒設」):
     *   --setup-salt/--setup-hash/--setup-iter/--setup-epoch  一次性設定碼(通行碼雜湊住 D1,不進這個公開 repo)
     *   --team-domain/--aud/--emails         Cloudflare Access(保留;OTP 事故解除後想換回來用)
     * CLINICAL_TOKEN_SECRET **不由這支寫入** —— 那是能偽造通行證的鑰匙,而 wrangler.jsonc 在 git 裡。
     * 它要用 Cloudflare 後台的 Secret 或 `wrangler secret put` 設定。 */
    const dbId = String(arg("--database-id") || "").trim();
    const salt = String(arg("--setup-salt") || "").trim();
    const hash = String(arg("--setup-hash") || "").trim();
    const iter = Number(arg("--setup-iter") || 30000);
    const setupEpoch = Number(arg("--setup-epoch") || 1);
    const team = String(arg("--team-domain") || "").trim().replace(/\/+$/, "");
    const aud = String(arg("--aud") || "").trim();
    const emails = String(arg("--emails") || "guotingru@gmail.com").trim();
    const wantPass = !!(salt || hash);
    const wantAccess = !!(team || aud);
    const bad = [];
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dbId)) bad.push("--database-id 必須是 D1 資料庫的 UUID(後台 D1 頁面的 Database ID)");
    if (wantPass && wantAccess) bad.push("通行碼與 Access 只能選一種:不要同時給 --setup-* 與 --team-domain/--aud");
    if (!wantPass && !wantAccess) bad.push("要嘛給 --setup-salt/--setup-hash(通行碼模式),要嘛給 --team-domain/--aud(Access)");
    if (wantPass) {
      if (!/^[A-Za-z0-9_-]{16,}$/.test(salt)) bad.push("--setup-salt 格式不對(make-clinical-setup-code.js 產生的那一串)");
      if (!/^[A-Za-z0-9_-]{40,}$/.test(hash)) bad.push("--setup-hash 格式不對(base64url,256-bit)");
      if (!Number.isFinite(iter) || iter < 10000) bad.push("--setup-iter 至少 10000");
      if (!Number.isSafeInteger(setupEpoch) || setupEpoch < 1) bad.push("--setup-epoch 必須是 ≥1 的整數");
      if (argv.some((a) => /^--(token-)?secret$/.test(a))) bad.push("簽證秘密不從這裡進:wrangler.jsonc 會進 git。請用 Cloudflare 後台的 Secret(名稱 CLINICAL_TOKEN_SECRET)");
    } else {
      if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/i.test(team)) bad.push("--team-domain 必須長這樣:https://<team>.cloudflareaccess.com");
      if (!/^[0-9a-f]{64}$/i.test(aud)) bad.push("--aud 必須是 Access 應用程式的 Application Audience (AUD) Tag(64 個 hex)");
      if (!emails) bad.push("--emails 不得為空");
    }
    if (bad.length) { console.error("FAIL —\n  " + bad.join("\n  ")); process.exit(2); }
    cfg.main = "src/worker.mjs";
    cfg.assets = { ...(cfg.assets || {}), directory: "./dist", binding: "ASSETS", run_worker_first: ["/__clinical/*"], not_found_handling: "single-page-application" };
    cfg.d1_databases = [{ binding: "CLINICAL_DB", database_name: "acuting-clinical", database_id: dbId }];
    cfg.vars = wantPass
      ? { ENVIRONMENT: "production", CLINICAL_DB_NAME: "acuting-clinical", CLINICAL_SETUP_SALT: salt, CLINICAL_SETUP_HASH: hash, CLINICAL_SETUP_ITER: iter, CLINICAL_SETUP_EPOCH: setupEpoch }
      : { ENVIRONMENT: "production", CLINICAL_DB_NAME: "acuting-clinical", ACCESS_TEAM_DOMAIN: team, ACCESS_AUD: aud, ACCESS_ALLOWED_EMAILS: emails };
    writeWrangler(cfg, HEADER_PROD);
    fs.writeFileSync(INDEX, setMeta(fs.readFileSync(INDEX, "utf8"), true));
    console.log(`wrangler.jsonc 與 index.html 已寫成正式(D1 + ${wantPass ? "通行碼" : "Access"})設定。`);
    if (wantPass) console.log("提醒:通行碼雜湊由 Worker 在第一次設定時寫進 D1;這個檔公開在 GitHub,永遠不會、也不准放通行碼材料。");
  }
  const out = execFileSync(process.execPath, [path.join(__dirname, "validate-d1-deploy-gate.js")], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  process.stdout.write(out);
  console.log(REVERT ? "\n下一步:git diff 看一眼 → commit(訊息含「回滾」)→ push main。"
    : "\n下一步:git diff 看一眼 → commit(訊息含「D33 切換」)→ push main → 等 Workers Builds 部署 →\n" +
      "        跑 `node scripts/canary-production-lock.js`(通行碼模式:首頁要 200、/__clinical/* 要 401)→ 請她打一次通行碼。");
})();
