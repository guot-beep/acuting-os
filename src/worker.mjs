/**
 * worker.mjs — AcuTing OS 的 Cloudflare Worker 入口。
 *   /__clinical/*  → 病例 kv 正本(D1;D33)
 *   其他           → 靜態資產(dist/,由 wrangler.jsonc 的 assets 綁定供應;run_worker_first 只攔 /__clinical/*)
 *
 * 環境變數(wrangler.jsonc vars / secrets):
 *   ACCESS_TEAM_DOMAIN     https://<team>.cloudflareaccess.com   (= JWT iss)
 *   ACCESS_AUD             Access 應用程式的 AUD tag
 *   ACCESS_ALLOWED_EMAILS  逗號分隔;有設就只放行這些 email(第二道)
 *   ENVIRONMENT            "production" | "staging" | "local"(只用於顯示與 log)
 *   DEV_AUTH_BYPASS        "1" 才生效,而且只在 loopback 主機名(見 clinical-handler)
 * 綁定:
 *   CLINICAL_DB  D1        ASSETS  靜態資產
 */
import { createClinicalHandler, API } from "./clinical-handler.mjs";
import { createKvCore } from "./clinical-kv-core.mjs";
import { createD1Adapter } from "./kv-d1-adapter.mjs";
import { createJwksCache, jwksFetcher, verifyAccessJwt } from "./access-jwt.mjs";

const VERSION = "d1-1.0.0";
let jwksCache = null, jwksFor = null;   // 每個 isolate 一份

function buildHandler(env) {
  const teamDomain = String(env.ACCESS_TEAM_DOMAIN || "").replace(/\/+$/, "");
  const aud = String(env.ACCESS_AUD || "");
  const allowed = String(env.ACCESS_ALLOWED_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const allowedSvc = String(env.ACCESS_ALLOWED_SERVICE_TOKENS || "").split(",").map((s) => s.trim()).filter(Boolean);   // service token 的 Client ID(備份工具)
  const authConfigured = !!(teamDomain && aud);
  if (authConfigured && jwksFor !== teamDomain) { jwksCache = createJwksCache(jwksFetcher(teamDomain)); jwksFor = teamDomain; }
  /* history 每 key 留 50 版(不是本機服務的 200):D1 免費方案單庫 500 MB,信封若長到 2 MB,200 版 × 2 鍵就爆了;
   * 50 版 + D1 Time Travel(7/30 天)夠用。 */
  const core = createKvCore(createD1Adapter(env.CLINICAL_DB), {
    historyPerKey: Number(env.HISTORY_PER_KEY) || 50,
    noHistoryKeys: ["acuting-clinical-conflict-backup"],   // 備份槽不再備份自己
  });
  return createClinicalHandler({
    core,
    ensureSchema: () => core.ensureSchema(),
    authConfigured,
    devBypass: env.DEV_AUTH_BYPASS === "1",
    verify: (token) => verifyAccessJwt(token, { teamDomain, aud, jwks: jwksCache, allowedEmails: allowed, allowedServiceNames: allowedSvc }),
    version: VERSION,
    dbName: env.CLINICAL_DB_NAME || "acuting-clinical",
    environment: env.ENVIRONMENT || null,
    log: (line) => console.log(`[clinical] ${line}`),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith(`${API}/`)) return env.ASSETS.fetch(request);
    if (!env.CLINICAL_DB) {
      return new Response(JSON.stringify({ service: "acuting-clinical-sqlite", backend: "d1", error: "db_not_bound",
        message: "這個部署沒有綁 D1(CLINICAL_DB)。拒絕所有病例請求。" }),
        { status: 503, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
    }
    return buildHandler(env)(request);
  },
};
