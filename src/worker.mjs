/**
 * worker.mjs — AcuTing OS 的 Cloudflare Worker 入口。
 *   /__clinical/*  → 病例 kv 正本(D1;D33)
 *   其他           → 靜態資產(dist/,由 wrangler.jsonc 的 assets 綁定供應;run_worker_first 只攔 /__clinical/*)
 *
 * 認證兩種模式,永遠只啟用一種(兩種都沒設好 → 503,不放行):
 *   A. 通行碼(Ting 2026-09-02 裁定,目前採用)—— CLINICAL_PASS_SALT / _HASH / _ITER / CLINICAL_TOKEN_SECRET。
 *      知識庫維持公開,只有 /__clinical/* 要通行證,所以不會再發生「整個站被鎖住」。
 *   B. Cloudflare Access —— ACCESS_TEAM_DOMAIN / ACCESS_AUD。OTP 郵件事故解除後若要換回來,
 *      把 A 的變數拿掉、B 的補上即可,程式不用改。
 *
 * 環境變數(wrangler.jsonc vars / secrets):
 *   CLINICAL_PASS_SALT/HASH/ITER   scripts/make-clinical-passphrase-hash.js 在她自己機器上算的(通行碼原文永不離開她的電腦)
 *   CLINICAL_PASS_VERSION          換通行碼時 +1 → 所有舊通行證當場失效
 *   CLINICAL_TOKEN_SECRET          簽通行證用(secret,不是 var)
 *   CLINICAL_TOKEN_TTL_DAYS        通行證有效天數,預設 30
 *   ACCESS_TEAM_DOMAIN / ACCESS_AUD / ACCESS_ALLOWED_EMAILS / ACCESS_ALLOWED_SERVICE_TOKENS
 *   ENVIRONMENT / CLINICAL_DB_NAME / HISTORY_PER_KEY
 *   DEV_AUTH_BYPASS                "1" 才生效,而且只在 loopback 主機名(見 clinical-handler)
 * 綁定:
 *   CLINICAL_DB  D1        ASSETS  靜態資產
 */
import { createClinicalHandler, API } from "./clinical-handler.mjs";
import { createKvCore } from "./clinical-kv-core.mjs";
import { createD1Adapter } from "./kv-d1-adapter.mjs";
import { createJwksCache, jwksFetcher, verifyAccessJwt } from "./access-jwt.mjs";
import { createAuthStore, sourceKey } from "./auth-store.mjs";
import { verifyPassphrase, issueToken, verifyToken, rateLimitVerdict, DEFAULT_ITERATIONS } from "./passphrase-auth.mjs";

const VERSION = "d1-1.1.0";
let jwksCache = null, jwksFor = null;   // 每個 isolate 一份

function buildPassphraseAuth(env, db) {
  const salt = String(env.CLINICAL_PASS_SALT || "");
  const hash = String(env.CLINICAL_PASS_HASH || "");
  const secret = String(env.CLINICAL_TOKEN_SECRET || "");
  if (!salt || !hash || !secret) return null;                    // 設定不全 → 不啟用(交給 503,不半套放行)
  const iterations = Number(env.CLINICAL_PASS_ITER) || DEFAULT_ITERATIONS;
  const passVersion = Number(env.CLINICAL_PASS_VERSION) || 1;
  const ttlDays = Number(env.CLINICAL_TOKEN_TTL_DAYS) || 30;
  const store = createAuthStore(createD1Adapter(db), {});
  let schemaReady = null;
  const ready = () => (schemaReady ||= store.ensureSchema());
  return {
    async verifyToken(token) { return verifyToken(token, secret, { passVersion }); },
    async login(passphrase, request) {
      await ready();
      const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
      const source = await sourceKey(ip, secret);
      const fails = await store.recentFails(source);
      const verdict = rateLimitVerdict(fails, {});
      if (verdict.blocked) return { ok: false, blocked: true, retryAfterSec: verdict.retryAfterSec };
      const okPass = await verifyPassphrase(passphrase, { salt, hash, iterations });
      if (!okPass) {
        await store.recordFail(source);
        return { ok: false, blocked: false, fails: fails.length + 1 };
      }
      await store.clearFails(source);   // 打對了就清空,不然自己的舊失敗會把自己鎖住
      const { token, payload } = await issueToken(secret, { passVersion, ttlDays });
      return { ok: true, token, expires: payload.exp };
    },
  };
}

function buildHandler(env) {
  const teamDomain = String(env.ACCESS_TEAM_DOMAIN || "").replace(/\/+$/, "");
  const aud = String(env.ACCESS_AUD || "");
  const allowed = String(env.ACCESS_ALLOWED_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const allowedSvc = String(env.ACCESS_ALLOWED_SERVICE_TOKENS || "").split(",").map((s) => s.trim()).filter(Boolean);   // service token 的 Client ID(備份工具)
  const accessConfigured = !!(teamDomain && aud);
  if (accessConfigured && jwksFor !== teamDomain) { jwksCache = createJwksCache(jwksFetcher(teamDomain)); jwksFor = teamDomain; }
  /* history 每 key 留 50 版(不是本機服務的 200):D1 免費方案單庫 500 MB,信封若長到 2 MB,200 版 × 2 鍵就爆了;
   * 50 版 + D1 Time Travel(7/30 天)夠用。 */
  const core = createKvCore(createD1Adapter(env.CLINICAL_DB), {
    historyPerKey: Number(env.HISTORY_PER_KEY) || 50,
    noHistoryKeys: ["acuting-clinical-conflict-backup"],   // 備份槽不再備份自己
  });
  return createClinicalHandler({
    core,
    ensureSchema: () => core.ensureSchema(),
    passphraseAuth: buildPassphraseAuth(env, env.CLINICAL_DB),
    authConfigured: accessConfigured,
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
