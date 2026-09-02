/**
 * clinical-handler.mjs — /__clinical/* 的 HTTP 處理(純函式:Request → Response;Worker 與 Node 測試共用)。
 *
 * 契約 = 本機服務 scripts/clinical-sqlite-service.js 的那一套,瀏覽器 adapter(js/clinical-sqlite-backend.js)
 * 靠它認得服務:
 *   GET    /__clinical/ping        {service:"acuting-clinical-sqlite", backend:"d1", version, db, revision, projection:null, email}
 *   GET    /__clinical/kv          {revision, keys:{k:v}, projection:null}
 *   GET    /__clinical/kv/:key     200 {revision, value} | 404 {revision, value:null}
 *   PUT    /__clinical/kv/:key     body = 原樣字串;If-Match(選填)→ 200 {revision} | 409 {error:"revision_conflict", revision, expected, message}
 *   DELETE /__clinical/kv/:key     同上
 *   GET    /__clinical/status      只有長度 / revision / history 筆數,沒有值
 *
 * 安全(D33):
 *   - 每一條路徑都要 Access JWT(Cf-Access-Jwt-Assertion)。驗不過 → 401,**回應仍帶 service 標記**,
 *     讓 adapter 分得出「服務在但沒登入」(→ 毒丸、唯讀)與「根本沒服務」(→ localStorage)。
 *   - Access 設定缺(團隊網域 / AUD 沒設)→ 503 auth_not_configured,永不放行。這是 fail-closed:
 *     忘了設環境變數的部署 = 一個只會說「沒設定」的服務,不是一個開放的服務。
 *   - 本機開發旁路 DEV_AUTH_BYPASS=1 只在 **loopback 主機名** 生效;正式網址永遠不是 loopback,
 *     所以就算變數外洩到正式環境也旁路不了(結構保證,不靠人記得刪)。
 *   - 寫入(PUT/DELETE)必須帶 X-AcuTing-Client 標頭:自訂標頭逼出 CORS 預檢,而我們不回任何 CORS 標頭,
 *     跨站帶 cookie 的寫入因此到不了這裡(CSRF)。
 *   - 回應一律 Cache-Control: no-store、X-Content-Type-Options: nosniff、不回 CORS。
 *   - log 只有方法 / key 名 / 長度 / 狀態碼 / email,**永不印值**(值是病歷)。
 */
import { KEY_RE } from "./clinical-kv-core.mjs";

export const SERVICE = "acuting-clinical-sqlite";   // adapter 認這個標記;D1 版沿用,另加 backend:"d1"
export const API = "/__clinical";
export const CLIENT_HEADER = "x-acuting-client";
export const AUTH_HEADER = "x-acuting-auth";
export const MAX_BODY = 64 * 1024 * 1024;
/* 正本鍵不准 DELETE:app 在 v1 世界從不刪主槽;一個失控的 client 迴圈或被劫持的 session 也不能一鍵清空整本簿子。
 * 要「清空」只能寫入 "[]"(留在 history 裡),不能刪列。 */
export const PROTECTED_KEYS = new Set(["acuting-clinical-cases-v1", "acuting-clinical-v2-staging"]);

const isLoopback = (h) => h === "127.0.0.1" || h === "localhost" || h === "[::1]" || h === "::1";

function json(status, obj, extra) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  for (const k in (extra || {})) headers.set(k, extra[k]);
  return new Response(JSON.stringify(obj), { status, headers });
}

/**
 * @param {object} deps
 *   core         createKvCore(...)
 *   verify       async (token) => {ok, email, reason}   (access-jwt 的 verifyAccessJwt 綁好 opts)
 *   authConfigured boolean                              (teamDomain 與 aud 都有)
 *   devBypass    boolean                                (env.DEV_AUTH_BYPASS === "1")
 *   version, dbName, environment
 *   log          (line) => void
 *   ensureSchema async () => void                       (每個 isolate 第一次請求時跑一次)
 */
export function createClinicalHandler(deps) {
  const log = deps.log || (() => {});
  let schemaReady = null;
  const ready = () => (schemaReady ||= Promise.resolve(deps.ensureSchema ? deps.ensureSchema() : null));

  /* 認證有兩種模式,由部署設定決定,永遠只啟用一種:
   *   passphrase —— 通行碼(Ting 2026-09-02 裁定)。瀏覽器帶 X-AcuTing-Auth 通行證。
   *   access     —— Cloudflare Access 的 JWT(保留;OTP 郵件事故解除後若要換回來不必改程式)。
   * 兩種都沒設好 → 503,永不放行。 */
  async function authenticate(request, url) {
    if (deps.devBypass && isLoopback(url.hostname)) return { ok: true, email: "dev@localhost", actor: "dev@localhost", kind: "user", bypass: true };
    if (deps.passphraseAuth) {
      const token = request.headers.get(AUTH_HEADER);
      const r = await deps.passphraseAuth.verifyToken(token);
      if (!r.ok) return { ok: false, status: 401, reason: r.reason === "no_token" ? "auth_required" : "auth_invalid", detail: r.reason };
      return { ok: true, email: null, actor: "passphrase", kind: "passphrase" };
    }
    if (!deps.authConfigured) return { ok: false, status: 503, reason: "auth_not_configured" };
    const token = request.headers.get("cf-access-jwt-assertion");
    const r = await deps.verify(token);
    if (!r.ok) return { ok: false, status: 401, reason: r.reason };
    // actor 進 history:使用者 = email;service token = svc:<common_name>(備份工具)。兩者都不是 PHI。
    return { ok: true, email: r.email || null, actor: r.email || (r.commonName ? `svc:${r.commonName}` : null), kind: r.kind || "user" };
  }

  async function handleInner(request) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    if (!url.pathname.startsWith(`${API}/`)) return json(404, { error: "not_found" });
    if (url.search) return json(400, { error: "no_query_string", message: "病例 API 不接受查詢字串(避免資料進到 URL 與存取紀錄)。" });

    /* 換通行碼的端點:唯一不需要通行證的 /__clinical/* 路徑。
     * 它自己有失敗限流,而且回應永遠是同一句話 —— 不告訴對方是「碼錯」還是「被鎖」以外的細節。 */
    if (url.pathname === `${API}/auth` && deps.passphraseAuth) {
      if (method !== "POST") return json(405, { error: "method_not_allowed" });
      if (!request.headers.get(CLIENT_HEADER)) return json(403, { error: "client_header_required" });
      let body = "";
      try { body = await request.text(); } catch (_) { body = ""; }
      let passphrase = "";
      try { const j = JSON.parse(body || "{}"); passphrase = typeof j.passphrase === "string" ? j.passphrase : ""; } catch (_) { passphrase = ""; }
      const res = await deps.passphraseAuth.login(passphrase, request);
      if (res.ok) {
        log(`POST auth 200 (通行碼正確,發證到期 ${new Date(res.expires * 1000).toISOString().slice(0, 10)})`);
        return json(200, { service: SERVICE, backend: "d1", token: res.token, expires: res.expires });
      }
      if (res.blocked) {
        log(`POST auth 429 (失敗過多,${res.retryAfterSec}s)`);
        return json(429, { service: SERVICE, backend: "d1", error: "too_many_attempts", retry_after_sec: res.retryAfterSec,
          message: `試太多次了,請等 ${Math.ceil(res.retryAfterSec / 60)} 分鐘再試。` }, { "Retry-After": String(res.retryAfterSec) });
      }
      if (res.setupRequired) {
        log("POST auth 409 (還沒設定過通行碼)");
        return json(409, { service: SERVICE, backend: "d1", error: "setup_required", setup_required: true,
          message: "這個病例庫還沒設定通行碼。請用設定碼完成第一次設定。" });
      }
      log(`POST auth 401 (通行碼不符;這個來源今天第 ${res.fails || "?"} 次)`);
      return json(401, { service: SERVICE, backend: "d1", error: "auth_invalid", message: "通行碼不對。" });
    }

    /* 一次性設定端點:憑設定碼把她自己選的通行碼寫進 D1。
     * 設定完成後(且 env 紀元沒調高)一律 410,連設定碼都不驗 —— 它不會變成長期可猜的入口。 */
    if (url.pathname === `${API}/auth/setup` && deps.passphraseAuth) {
      if (method !== "POST") return json(405, { error: "method_not_allowed" });
      if (!request.headers.get(CLIENT_HEADER)) return json(403, { error: "client_header_required" });
      let body = "";
      try { body = await request.text(); } catch (_) { body = ""; }
      let setupCode = "", passphrase = "";
      try {
        const j = JSON.parse(body || "{}");
        setupCode = typeof j.setup_code === "string" ? j.setup_code : "";
        passphrase = typeof j.passphrase === "string" ? j.passphrase : "";
      } catch (_) { /* 兩個都留空,下面一律當失敗 */ }
      const res = await deps.passphraseAuth.setup(setupCode, passphrase, request);
      if (res.ok) {
        log("POST auth/setup 200 (通行碼已設定,設定端點關閉)");
        return json(200, { service: SERVICE, backend: "d1", token: res.token, expires: res.expires });
      }
      if (res.blocked) {
        log(`POST auth/setup 429 (失敗過多,${res.retryAfterSec}s)`);
        return json(429, { service: SERVICE, backend: "d1", error: "too_many_attempts", retry_after_sec: res.retryAfterSec,
          message: `試太多次了,請等 ${Math.ceil(res.retryAfterSec / 60)} 分鐘再試。` }, { "Retry-After": String(res.retryAfterSec) });
      }
      if (res.closed) {
        log("POST auth/setup 410 (已經設定過)");
        return json(410, { service: SERVICE, backend: "d1", error: "setup_closed",
          message: "這個病例庫已經設定過通行碼了。要重設請調高 CLINICAL_SETUP_EPOCH。" });
      }
      if (res.weak) {
        log("POST auth/setup 400 (通行碼強度不足)");
        return json(400, { service: SERVICE, backend: "d1", error: "weak_passphrase", message: res.message });
      }
      log(`POST auth/setup 401 (設定碼不符;這個來源第 ${res.fails || "?"} 次)`);
      return json(401, { service: SERVICE, backend: "d1", error: "setup_code_invalid", message: "設定碼不對。" });
    }

    const auth = await authenticate(request, url);
    if (!auth.ok) {
      log(`${method} ${url.pathname} ${auth.status} ${auth.reason}${auth.detail ? " (" + auth.detail + ")" : ""}`);
      /* 帶 service 標記:adapter 據此判「服務在、沒登入」→ 毒丸或跳出輸入框,不是退回 localStorage。
       * setup_required 再決定跳哪一種框:第一次設定(要設定碼)還是日常登入(只要通行碼)。
       * 這一句多一次 D1 查詢,但只在 401 才走到,而 401 本來就少。 */
      let setupRequired = false;
      if (auth.status === 401 && deps.passphraseAuth && deps.passphraseAuth.setupRequired) {
        try { setupRequired = await deps.passphraseAuth.setupRequired(); } catch (_) { setupRequired = false; }
      }
      return json(auth.status, { service: SERVICE, backend: "d1", error: auth.reason,
        auth_mode: deps.passphraseAuth ? "passphrase" : "access",
        setup_required: setupRequired,
        message: auth.status === 503 ? "服務的認證設定不完整,拒絕所有請求(fail-closed)。"
          : (setupRequired ? "這個病例庫還沒設定通行碼,請先用設定碼完成設定。"
            : (deps.passphraseAuth ? "需要通行碼(或通行證已過期)。" : "登入無效或已過期,請重新整理頁面重新登入。")) });
    }

    try { await ready(); } catch (e) {
      log(`schema init failed: ${e.message}`);
      return json(500, { service: SERVICE, backend: "d1", error: "schema_init_failed" });
    }
    const core = deps.core;

    if (url.pathname === `${API}/ping` && method === "GET") {
      return json(200, { service: SERVICE, backend: "d1", version: deps.version || "d1", db: deps.dbName || "d1",
        environment: deps.environment || null, revision: await core.revision(), projection: null, email: auth.email || null });
    }
    if (url.pathname === `${API}/kv` && method === "GET") {
      const snap = await core.snapshot();
      log(`GET kv ${Object.keys(snap.keys).length} keys rev ${snap.revision} ${auth.email || ""}`);
      return json(200, { revision: snap.revision, keys: snap.keys, projection: null });
    }
    if (url.pathname === `${API}/status` && method === "GET") {
      const st = await core.status();
      return json(200, { service: SERVICE, backend: "d1", version: deps.version || "d1", db: deps.dbName || "d1",
        environment: deps.environment || null, email: auth.email || null, ...st, projection: null });
    }
    if (url.pathname === `${API}/whoami` && method === "GET") {
      return json(200, { email: auth.email || null, bypass: !!auth.bypass });
    }

    const m = url.pathname.match(/^\/__clinical\/kv\/([^/]+)$/);
    if (m) {
      let key;
      try { key = decodeURIComponent(m[1]); } catch (_) { return json(400, { error: "bad_key" }); }
      if (!KEY_RE.test(key)) return json(400, { error: "bad_key" });

      if (method === "GET") {
        const v = await core.get(key);
        return json(v === null ? 404 : 200, { revision: await core.revision(), value: v });
      }
      if (method !== "PUT" && method !== "DELETE") return json(405, { error: "method_not_allowed" });

      if (!request.headers.get(CLIENT_HEADER)) return json(403, { error: "client_header_required", message: "寫入必須帶 X-AcuTing-Client 標頭(防跨站寫入)。" });
      let ifMatch;
      const raw = request.headers.get("if-match");
      if (raw !== null && raw !== "") {
        ifMatch = Number(raw);
        if (!Number.isSafeInteger(ifMatch) || ifMatch < 0) return json(400, { error: "bad_if_match" });
      }
      const conflict = (r) => json(409, { error: "revision_conflict", revision: r.revision, expected: r.expected,
        message: "另一台裝置或分頁在你上次讀取之後寫過檔;這次寫入被拒絕,零寫入。" });

      if (method === "PUT") {
        // 正本鍵不接受「沒讀過就整本覆蓋」:If-Match 必帶(adapter 一定帶;只有衝突備份槽允許強制寫)
        if (PROTECTED_KEYS.has(key) && ifMatch === undefined) return json(428, { error: "if_match_required", message: "正本鍵的寫入必須帶 If-Match(先讀再寫,防止整本被沒讀過的內容覆蓋)。" });
        const len = Number(request.headers.get("content-length") || 0);
        if (len > MAX_BODY) return json(413, { error: "too_large" });
        const body = await request.text();
        if (body.length > MAX_BODY) return json(413, { error: "too_large" });
        const r = await core.put(key, body, ifMatch, auth.actor || null);
        if (!r.ok) { log(`PUT ${key} 409 (rev ${r.revision} ≠ ${r.expected})`); return conflict(r); }
        log(`PUT ${key} ${body.length} chars → rev ${r.revision} ${auth.actor || ""}`);
        return json(200, { revision: r.revision });
      }
      if (PROTECTED_KEYS.has(key)) return json(405, { error: "protected_key", message: "正本鍵不能刪除;要清空請寫入 [](會留在 history)。" });
      const r = await core.del(key, ifMatch, auth.actor || null);
      if (!r.ok) { log(`DELETE ${key} 409`); return conflict(r); }
      log(`DELETE ${key} → rev ${r.revision} ${auth.actor || ""}`);
      return json(200, { revision: r.revision });
    }
    return json(404, { error: "not_found" });
  }

  /* 任何未預期的例外都不能把訊息送回瀏覽器(D1 錯誤含 SQL 文字)也不能整段進 log。
   * 回一個短參照碼,log 只記錯誤類別 + 訊息前 120 字(bound params 不在 SQL 文字裡,所以沒有值)。 */
  return async function handle(request) {
    try { return await handleInner(request); }
    catch (e) {
      const ref = Math.random().toString(36).slice(2, 10);
      log(`✗ internal ${ref} ${(e && e.name) || "Error"}: ${String((e && e.message) || e).slice(0, 120)}`);
      return json(500, { service: SERVICE, backend: "d1", error: "internal", ref, message: `服務內部錯誤(參照 ${ref})。這次沒有寫入;把這個參照碼貼給 Claude。` });
    }
  };
}
