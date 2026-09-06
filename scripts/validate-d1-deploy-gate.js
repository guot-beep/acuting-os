#!/usr/bin/env node
/**
 * validate-d1-deploy-gate.js — D33 的部署閘門:一個「半設定」的 commit 不准上 main。
 *
 * main 一推就由 Workers Builds 部署到正式網址,所以這支守的是「推上去會發生什麼」:
 *   G1 wrangler.jsonc 的 main(Worker)與 index.html 的 <meta name="acuting-clinical-backend"> 必須**同時**存在或同時不存在。
 *      - 有 meta 沒 Worker:每一台裝置的 adapter 都會探測不到 → 全部毒丸(唯讀)。
 *      - 有 Worker 沒 meta:adapter 在 workers.dev 上不探測 → 靜默留在 localStorage → 兩本簿子(最糟)。
 *   G2 Worker 有設時:assets.binding=ASSETS、run_worker_first 含 /__clinical/*、d1_databases 有 CLINICAL_DB 且 database_id 是真的 UUID
 *      (不是 placeholder)、vars 有 ACCESS_TEAM_DOMAIN(https://<team>.cloudflareaccess.com)、ACCESS_AUD(64 hex)、
 *      ACCESS_ALLOWED_EMAILS 非空、ENVIRONMENT=production、**沒有** DEV_AUTH_BYPASS=1。
 *   G3 Worker 沒設時:wrangler.jsonc 不得含 d1_databases(避免半套設定讓部署失敗、擋住之後所有內容更新)。
 * 負控:scripts/test-d1-deploy-gate.js 用合成檔證明每一條都會亮紅燈。
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = process.env.D1_GATE_ROOT ? path.resolve(process.env.D1_GATE_ROOT) : path.resolve(__dirname, "..");

function stripJsonc(s) {
  // 去掉 // 與 /* */ 註解(字串裡沒有這種東西 —— 本 repo 的 wrangler.jsonc 不含 URL 以外的 //;URL 在字串裡,先保護字串)
  let out = "", i = 0, inStr = false;
  while (i < s.length) {
    const c = s[i], n = s[i + 1];
    if (inStr) { out += c; if (c === "\\") { out += n; i += 2; continue; } if (c === '"') inStr = false; i++; continue; }
    if (c === '"') { inStr = true; out += c; i++; continue; }
    if (c === "/" && n === "/") { while (i < s.length && s[i] !== "\n") i++; continue; }
    if (c === "/" && n === "*") { i += 2; while (i < s.length && !(s[i] === "*" && s[i + 1] === "/")) i++; i += 2; continue; }
    out += c; i++;
  }
  return out.replace(/,(\s*[}\]])/g, "$1");
}

function check(root) {
  const problems = [];
  const wranglerPath = path.join(root, "wrangler.jsonc");
  const indexPath = path.join(root, "index.html");
  if (!fs.existsSync(wranglerPath) || !fs.existsSync(indexPath)) return ["wrangler.jsonc 或 index.html 不存在"];
  let cfg;
  try { cfg = JSON.parse(stripJsonc(fs.readFileSync(wranglerPath, "utf8"))); } catch (e) { return [`wrangler.jsonc 解析失敗:${e.message}`]; }
  const html = fs.readFileSync(indexPath, "utf8");
  const metaMatch = html.match(/<meta\s+name="acuting-clinical-backend"\s+content="([^"]*)"/);
  const hasMeta = !!metaMatch;
  const hasWorker = typeof cfg.main === "string" && cfg.main.trim() !== "";

  if (hasMeta !== hasWorker) {
    problems.push(hasMeta
      ? `G1 index.html 宣告了病例服務(meta=${metaMatch[1]})但 wrangler.jsonc 沒有 main(Worker)—— 部署後每台裝置都會唯讀。`
      : "G1 wrangler.jsonc 有 main(Worker)但 index.html 沒有 <meta name=\"acuting-clinical-backend\"> —— adapter 在正式網址上不會探測,病例會靜默留在 localStorage(兩本簿子)。");
  }
  if (hasWorker) {
    if (metaMatch && metaMatch[1] !== "d1") problems.push(`G2 meta content 應為 d1,實際 ${metaMatch[1]}`);
    const a = cfg.assets || {};
    if (a.binding !== "ASSETS") problems.push("G2 assets.binding 必須是 ASSETS(Worker 用 env.ASSETS 供應靜態檔)");
    const rwf = Array.isArray(a.run_worker_first) ? a.run_worker_first : [];
    if (!rwf.includes("/__clinical/*")) problems.push("G2 assets.run_worker_first 必須含 \"/__clinical/*\"(否則 SPA fallback 會把 API 路徑回成 index.html)");
    const d1 = Array.isArray(cfg.d1_databases) ? cfg.d1_databases.find((d) => d.binding === "CLINICAL_DB") : null;
    if (!d1) problems.push("G2 d1_databases 缺 binding=CLINICAL_DB");
    else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(d1.database_id || ""))) problems.push(`G2 CLINICAL_DB.database_id 不是真的 UUID(${d1.database_id})—— 還是 placeholder,部署會失敗`);
    const v = cfg.vars || {};
    /* 認證模式:通行碼(Ting 2026-09-02 裁定)或 Cloudflare Access,**恰好一種**。
     * 兩種都沒設 → 部署上去每個病例請求都 503,等於白推一次;
     * 兩種都設 → 沒有人說得準當下走的是哪一條,將來換模式時會有人以為改了其實沒改。 */
    const hasPass = !!(v.CLINICAL_SETUP_SALT || v.CLINICAL_SETUP_HASH);
    const hasAccess = !!(v.ACCESS_TEAM_DOMAIN || v.ACCESS_AUD);
    /* ⛔ 最重要的一條:**這個 repo 是公開的**(github.com/guot-beep/acuting-os)。
     * 日常通行碼是一句人記得住的話;把它的 salt+hash 推上 GitHub,等於把離線破解的材料一起公開,
     * 30,000 次迭代對 GPU 只是把時間從幾分鐘拉到大約一天。所以那組雜湊只能住 D1(見 auth-store.passRecord),
     * git 裡只放一次性設定碼的雜湊(16 碼亂數,約 79 bits,公開也破不了)。 */
    for (const k of ["CLINICAL_PASS_HASH", "CLINICAL_PASS_SALT", "CLINICAL_PASS_ITER", "CLINICAL_PASS_VERSION"]) {
      if (v[k]) problems.push(`G2 ${k} 不得出現在 wrangler.jsonc —— 這個 repo 是公開的,一句記得住的通行碼的雜湊公開後大約一天就會被離線破解。通行碼雜湊只住 D1,git 裡只放 CLINICAL_SETUP_*。`);
    }
    if (hasPass && hasAccess) problems.push("G2 通行碼與 Cloudflare Access 兩種認證同時設定 —— 只能留一種");
    else if (!hasPass && !hasAccess) problems.push("G2 沒有任何認證設定(通行碼的 CLINICAL_SETUP_* 或 Access 的 ACCESS_*)—— 部署後病例 API 會全部 503");
    else if (hasPass) {
      if (!/^[A-Za-z0-9_-]{16,}$/.test(String(v.CLINICAL_SETUP_SALT || ""))) problems.push("G2 vars.CLINICAL_SETUP_SALT 格式不對(scripts/make-clinical-setup-code.js 產生的 base64url)");
      if (!/^[A-Za-z0-9_-]{40,}$/.test(String(v.CLINICAL_SETUP_HASH || ""))) problems.push("G2 vars.CLINICAL_SETUP_HASH 格式不對(base64url,256-bit)");
      const iter = Number(v.CLINICAL_SETUP_ITER || 0);
      if (!Number.isFinite(iter) || iter < 10000) problems.push(`G2 vars.CLINICAL_SETUP_ITER 太低或缺(${v.CLINICAL_SETUP_ITER || "缺"});至少 10000`);
      if (!Number.isSafeInteger(Number(v.CLINICAL_SETUP_EPOCH)) || Number(v.CLINICAL_SETUP_EPOCH) < 1) problems.push("G2 vars.CLINICAL_SETUP_EPOCH 必須是 ≥1 的整數(要重新設定通行碼時 +1)");
      // 簽證秘密預設由 Worker 在 D1 裡自動產生(auth-store.tokenSecret);真要自己指定就設成 Secret。
      // 無論如何都不能寫進這個檔 —— 它在 git 裡,而且是公開的。
      if (v.CLINICAL_TOKEN_SECRET) problems.push("G2 CLINICAL_TOKEN_SECRET 不得出現在 wrangler.jsonc(那是能偽造通行證的鑰匙,而這個檔公開在 GitHub;不設就由 Worker 自己在 D1 產生)");
    } else {
      if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/i.test(String(v.ACCESS_TEAM_DOMAIN || ""))) problems.push(`G2 vars.ACCESS_TEAM_DOMAIN 必須是 https://<team>.cloudflareaccess.com(${v.ACCESS_TEAM_DOMAIN || "缺"})`);
      if (!/^[0-9a-f]{64}$/i.test(String(v.ACCESS_AUD || ""))) problems.push("G2 vars.ACCESS_AUD 必須是 Access 應用程式的 64 hex AUD tag(缺或格式不對)");
      if (!String(v.ACCESS_ALLOWED_EMAILS || "").trim()) problems.push("G2 vars.ACCESS_ALLOWED_EMAILS 不得為空(第二道:政策設錯時仍只放行這些 email)");
    }
    if (v.ENVIRONMENT !== "production") problems.push(`G2 vars.ENVIRONMENT 必須是 production(${v.ENVIRONMENT || "缺"})`);
    if (String(v.DEV_AUTH_BYPASS || "") === "1") problems.push("G2 vars.DEV_AUTH_BYPASS=1 不得出現在正式設定(雖然只在 loopback 生效,也不留)");
    if (!/worker\.mjs$/.test(cfg.main)) problems.push(`G2 main 應為 src/worker.mjs(${cfg.main})`);
    // G4 第二道錨:app.js 自己也要在「宣告了雲端卻沒有連接器」時唯讀,不能只靠 adapter 檔案載得到
    const appPath = path.join(root, "app.js");
    const app = fs.existsSync(appPath) ? fs.readFileSync(appPath, "utf8") : "";
    if (!app.includes('meta[name="acuting-clinical-backend"]') || !app.includes("!window.AcuTingClinicalBackend")) {
      problems.push("G4 app.js 的 loadClinicalCases 缺少『宣告雲端但 AcuTingClinicalBackend 不存在 → 唯讀』守門;adapter 檔案沒載到時會靜默開本機新簿子");
    }
    // 守門在開機期(第 807 行)跑,而 clinicalStoreIntegrityError 的 let 在後面:必須經 hoisted 標記接手,否則 TDZ 讓守門靜默失效(2026-09-02 e2e 抓到)
    if (!app.includes("let clinicalStoreIntegrityError = (typeof window !== \"undefined\" && window.__acutingBootIntegrityError) || null;")) {
      problems.push("G4 clinicalStoreIntegrityError 的宣告沒有從 window.__acutingBootIntegrityError 接手 —— 開機期守門會因 TDZ 失效");
    }
  } else if (Array.isArray(cfg.d1_databases) && cfg.d1_databases.length) {
    problems.push("G3 沒有 main 卻有 d1_databases —— 半套設定;部署會失敗並擋住之後所有內容更新");
  }

  /* G5 註解不准宣稱這個檔裡沒有的設定。
   * 2026-09-01 深夜的回滾(bf0a64d4)只還原了設定,沒有還原上面那段說明,結果
   * wrangler.jsonc 有三個月的時間寫著「病例正本在 D1」「每一條 /__clinical/* 都驗 Access JWT」,
   * 而檔內只有 assets —— 讀的人會以為病例站是鎖著的,而它是公開的。
   * 這一類缺陷(文件宣稱 > 實作)在這個庫反覆出現,所以用機器守,不靠人記得改註解。 */
  const rawText = fs.readFileSync(wranglerPath, "utf8");
  const brace = rawText.indexOf("{");
  const commentText = rawText.slice(0, brace >= 0 ? brace : rawText.length);
  const mentions = (re) => re.test(commentText);
  const hasWorkerCfg = typeof cfg.main === "string" && /worker\.mjs$/.test(cfg.main);
  const talksClinical = mentions(/run_worker_first|\bD1\b|d1_databases|ACCESS_[A-Z_]|src\/worker\.mjs|__clinical/);
  /* 規則不是「不准提到這些字」—— 解釋歷史一定會提到。規則是:
   * **設定裡沒有病例服務時,註解必須有一行明講現況**。有那一行,讀的人就不會被歷史說明誤導;
   * 沒有那一行而又滿篇 D1/Access,就是 2026-09-01 回滾留下的那種假象。 */
  const declaresStatic = /現況[^\n]*(純靜態|沒有\s*Worker|沒有\s*D1)/.test(commentText);
  if (!hasWorkerCfg && talksClinical) {
    if (!declaresStatic) {
      problems.push("G5 wrangler.jsonc 沒有 Worker/D1 設定,註解卻在講 D1 / Access / __clinical,而且沒有任何一行說明現況 —— " +
        "2026-09-01 的回滾就是這樣讓這個檔宣稱病例站鎖著、實際公開了三天。請加一行「**現況(日期):純靜態…**」,或補上真的設定。");
    }
  }
  /* 反方向(2026-09-06 合併 D1 分支時實際發生):設定已經是完整 D1 + 通行碼,
   * 檔頭卻還是 main 那段「現況:純靜態、沒有 Worker、沒有 D1」—— git 自動合併把兩邊拼在一起。
   * 讀的人會以為病例還在 localStorage,去改設定時以為自己在改一個沒人用的檔。 */
  if (hasWorkerCfg && declaresStatic) {
    problems.push("G5 wrangler.jsonc 有 Worker/D1 設定,檔頭卻寫「現況:純靜態 / 沒有 Worker / 沒有 D1」—— 兩邊合併時拼出來的反向謊言。把檔頭改成描述現在這份設定。");
  }
  return problems;
}

if (require.main === module) {
  const problems = check(ROOT);
  if (problems.length) {
    console.error(`FAIL — D1 部署閘門 ${problems.length} 條不過(D33:上鎖與綁定未完成前不得部署會讀 D1 的設定):`);
    for (const p of problems) console.error("  ⛔ " + p);
    process.exit(1);
  }
  console.log("PASS — D1 部署閘門:Worker/meta 一致,設定完整(或兩者皆無)。");
}
module.exports = { check, stripJsonc };
