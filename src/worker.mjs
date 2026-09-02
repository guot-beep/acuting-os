/**
 * worker.mjs — AcuTing OS 的 Cloudflare Worker 入口。
 *   /__clinical/*  → 病例 kv 正本(D1;D33)
 *   其他           → 靜態資產(dist/,由 wrangler.jsonc 的 assets 綁定供應;run_worker_first 只攔 /__clinical/*)
 *
 * 認證兩種模式,永遠只啟用一種(兩種都沒設好 → 503,不放行):
 *   A. 通行碼(Ting 2026-09-02 裁定,目前採用)—— CLINICAL_SETUP_SALT / _HASH / _ITER / _EPOCH。
 *      知識庫維持公開,只有 /__clinical/* 要通行證,所以不會再發生「整個站被鎖住」。
 *   B. Cloudflare Access —— ACCESS_TEAM_DOMAIN / ACCESS_AUD。OTP 郵件事故解除後若要換回來,
 *      把 A 的變數拿掉、B 的補上即可,程式不用改。
 *
 * 通行碼雜湊為什麼不在這裡:**這個 repo 是公開的**。wrangler.jsonc 進 GitHub,
 * 寫在裡面的 salt+hash 等於把離線破解的材料全部公開,而一句記得住的通行碼撐不住那種攻擊。
 * 所以 git 裡只有一次性**設定碼**的雜湊(16 碼亂數,約 79 bits,公開也破不了);
 * 她的日常通行碼雜湊由 /__clinical/auth/setup 寫進 D1,永不進 git。
 *
 * 環境變數(wrangler.jsonc vars / secrets):
 *   CLINICAL_SETUP_SALT/HASH/ITER  scripts/make-clinical-setup-code.js 產生;對應的設定碼只用一次
 *   CLINICAL_SETUP_EPOCH           整數。調高一次 = 准許重新設定一次(忘記通行碼時的復原路徑)
 *   CLINICAL_TOKEN_SECRET          簽通行證用;不設就由 Worker 自己在 D1 產生
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
import { verifyPassphrase, makePassphraseRecord, issueToken, verifyToken, rateLimitVerdict, DEFAULT_ITERATIONS } from "./passphrase-auth.mjs";

const VERSION = "d1-1.2.0";
let jwksCache = null, jwksFor = null;   // 每個 isolate 一份

export function buildPassphraseAuth(env, dbAdapter) {
  /* git 裡只有**設定碼**的雜湊 —— 一次性、16 碼亂數(約 79 bits),公開也破不了。
   * 她的日常通行碼雜湊在 D1(見 auth-store.passRecord),永遠不進這個公開 repo。 */
  const setupSalt = String(env.CLINICAL_SETUP_SALT || "");
  const setupHash = String(env.CLINICAL_SETUP_HASH || "");
  if (!setupSalt || !setupHash) return null;                    // 設定不全 → 不啟用(交給 503,不半套放行)
  const setupIter = Number(env.CLINICAL_SETUP_ITER) || DEFAULT_ITERATIONS;
  const setupEpoch = Number(env.CLINICAL_SETUP_EPOCH) || 1;
  const ttlDays = Number(env.CLINICAL_TOKEN_TTL_DAYS) || 30;
  const store = createAuthStore(dbAdapter, {});   // 收「已經包好的 adapter」,不是 D1 本體 —— 這支才能被 node:sqlite 的測試直接跑到
  let schemaReady = null;
  const ready = () => (schemaReady ||= store.ensureSchema());
  /* 簽證秘密:優先用環境變數(想自己掌控的人可以設 Secret),沒設就用 D1 裡自動產生的那一把。
   * 自動產生讓她完全不必進 Cloudflare 後台;安全性沒有變差 —— 能讀那把鑰匙的人必須先能讀 D1,
   * 而那時病例本身早就在他手上了。 */
  let secretCache = String(env.CLINICAL_TOKEN_SECRET || "");
  const getSecret = async () => {
    if (secretCache) return secretCache;
    await ready();
    secretCache = await store.tokenSecret();
    return secretCache;
  };
  /* 限流:所有猜測(登入 + 設定)共用同一個來源計數。
   * 分開算的話,攻擊者可以在兩個端點各猜 8 次,上限等於被偷偷放寬一倍。 */
  async function guard(request) {
    await ready();
    const secret = await getSecret();
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
    const source = await sourceKey(ip, secret);
    const fails = await store.recentFails(source);
    return { secret, source, fails, verdict: rateLimitVerdict(fails, {}) };
  }

  return {
    /** 目前是不是還沒設定過通行碼(D1 沒記錄,或 env 紀元被調高要求重設)。 */
    async setupRequired() {
      await ready();
      const rec = await store.passRecord();
      if (!rec) return true;
      return (await store.setupEpoch()) < setupEpoch;
    },
    async verifyToken(token) {
      await ready();
      const rec = await store.passRecord();
      if (!rec) return { ok: false, reason: "setup_required" };
      return verifyToken(token, await getSecret(), { passVersion: rec.passVersion });
    },
    async login(passphrase, request) {
      const g = await guard(request);
      if (g.verdict.blocked) return { ok: false, blocked: true, retryAfterSec: g.verdict.retryAfterSec };
      const rec = await store.passRecord();
      if (!rec) return { ok: false, setupRequired: true };
      const okPass = await verifyPassphrase(passphrase, rec);
      if (!okPass) {
        await store.recordFail(g.source);
        return { ok: false, blocked: false, fails: g.fails.length + 1 };
      }
      await store.clearFails(g.source);   // 打對了就清空,不然自己的舊失敗會把自己鎖住
      const { token, payload } = await issueToken(g.secret, { passVersion: rec.passVersion, ttlDays });
      return { ok: true, token, expires: payload.exp };
    },
    /** 一次性設定:憑設定碼把她自己選的通行碼記錄寫進 D1,然後這個端點就對外關上。 */
    async setup(setupCode, passphrase, request) {
      const g = await guard(request);
      if (g.verdict.blocked) return { ok: false, blocked: true, retryAfterSec: g.verdict.retryAfterSec };
      /* 先確認「現在到底准不准設定」,再驗設定碼 ——
       * 設定已完成時連驗都不驗,設定碼就不會變成一個可以無限試的長期端點。 */
      const rec = await store.passRecord();
      if (rec && (await store.setupEpoch()) >= setupEpoch) return { ok: false, closed: true };
      const okCode = await verifyPassphrase(setupCode, { salt: setupSalt, hash: setupHash, iterations: setupIter });
      if (!okCode) {
        await store.recordFail(g.source);
        return { ok: false, badCode: true, fails: g.fails.length + 1 };
      }
      let saved;
      try {
        saved = await store.savePassRecord(await makePassphraseRecord(passphrase, DEFAULT_ITERATIONS), setupEpoch);
      } catch (e) {
        return { ok: false, weak: true, message: String((e && e.message) || e) };   // 強度不足:不記失敗,設定碼是對的
      }
      const { token, payload } = await issueToken(g.secret, { passVersion: saved.passVersion, ttlDays });
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
  const db = createD1Adapter(env.CLINICAL_DB);            // 一個請求一個 adapter,kv 與認證共用
  const core = createKvCore(db, {
    historyPerKey: Number(env.HISTORY_PER_KEY) || 50,
    noHistoryKeys: ["acuting-clinical-conflict-backup"],   // 備份槽不再備份自己
  });
  return createClinicalHandler({
    core,
    ensureSchema: () => core.ensureSchema(),
    passphraseAuth: buildPassphraseAuth(env, db),
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
