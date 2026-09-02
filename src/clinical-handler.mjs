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
export const MAX_BODY = 64 * 1024 * 1024;

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

  async function authenticate(request, url) {
    if (deps.devBypass && isLoopback(url.hostname)) return { ok: true, email: "dev@localhost", bypass: true };
    if (!deps.authConfigured) return { ok: false, status: 503, reason: "auth_not_configured" };
    const token = request.headers.get("cf-access-jwt-assertion");
    const r = await deps.verify(token);
    if (!r.ok) return { ok: false, status: 401, reason: r.reason };
    return { ok: true, email: r.email };
  }

  return async function handle(request) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    if (!url.pathname.startsWith(`${API}/`)) return json(404, { error: "not_found" });

    const auth = await authenticate(request, url);
    if (!auth.ok) {
      log(`${method} ${url.pathname} ${auth.status} ${auth.reason}`);
      // 帶 service 標記:adapter 據此判「服務在、沒登入」→ 毒丸,不是退回 localStorage
      return json(auth.status, { service: SERVICE, backend: "d1", error: auth.reason,
        message: auth.status === 503 ? "服務的 Access 設定不完整,拒絕所有請求(fail-closed)。" : "登入無效或已過期,請重新整理頁面重新登入。" });
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
        const len = Number(request.headers.get("content-length") || 0);
        if (len > MAX_BODY) return json(413, { error: "too_large" });
        const body = await request.text();
        if (body.length > MAX_BODY) return json(413, { error: "too_large" });
        const r = await core.put(key, body, ifMatch, auth.email || null);
        if (!r.ok) { log(`PUT ${key} 409 (rev ${r.revision} ≠ ${r.expected})`); return conflict(r); }
        log(`PUT ${key} ${body.length} chars → rev ${r.revision} ${auth.email || ""}`);
        return json(200, { revision: r.revision });
      }
      const r = await core.del(key, ifMatch, auth.email || null);
      if (!r.ok) { log(`DELETE ${key} 409`); return conflict(r); }
      log(`DELETE ${key} → rev ${r.revision} ${auth.email || ""}`);
      return json(200, { revision: r.revision });
    }
    return json(404, { error: "not_found" });
  };
}
