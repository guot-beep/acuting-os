/**
 * access-jwt.mjs — Cloudflare Access JWT 驗證(純函式;Worker 與 Node 測試共用)。
 *
 * D33 前提一:/__clinical/* 只回應帶有效 Access JWT 的請求。Access 在通過登入的請求上加
 * `Cf-Access-Jwt-Assertion` 標頭(同源請求也會帶 CF_Authorization cookie,但我們只認標頭)。
 *
 * 驗證(每一項都 fail-closed,缺一不可):
 *   1. 三段式、header/payload 是 JSON;alg 必須是 RS256(拒絕 none / HS256 —— alg confusion)
 *   2. kid 在 JWKS 裡找得到(找不到 → 最多每 60 秒重抓一次 JWKS,處理金鑰輪替)
 *   3. RSASSA-PKCS1-v1_5 / SHA-256 簽章成立
 *   4. iss === teamDomain(https://<team>.cloudflareaccess.com)
 *   5. aud(字串或陣列)包含這個 Access 應用程式的 AUD tag
 *   6. exp 未過(容許 skew);nbf / iat 不在未來
 *   7. 若設定 allowedEmails:payload.email 必須在名單內(Access 政策設錯時的第二道保險)
 *
 * 不做:不解析 cookie、不信任任何未簽章欄位、不把 token 內容寫進錯誤訊息。
 */

const enc = new TextEncoder();

export function b64urlDecode(s) {
  if (typeof s !== "string" || !/^[A-Za-z0-9_-]*$/.test(s)) throw new Error("bad_b64url");
  const pad = s.length % 4 === 2 ? "==" : s.length % 4 === 3 ? "=" : s.length % 4 === 1 ? null : "";
  if (pad === null) throw new Error("bad_b64url");
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function jsonFromB64url(s) {
  const txt = new TextDecoder().decode(b64urlDecode(s));
  const v = JSON.parse(txt);
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("bad_json");
  return v;
}

/** 只拆不驗。丟錯 = 格式不對。 */
export function decodeJwt(token) {
  if (typeof token !== "string") throw new Error("bad_format");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("bad_format");
  const [h, p, s] = parts;
  const header = jsonFromB64url(h);
  const payload = jsonFromB64url(p);
  const signature = b64urlDecode(s);
  return { header, payload, signature, signingInput: enc.encode(`${h}.${p}`) };
}

/**
 * JWKS 快取:同一個 isolate 內記住 keys;kid 找不到時重抓,但每 refetchMinMs 最多一次
 * (被人用亂 kid 打也不會變成對 Access 的放大攻擊)。
 */
export function createJwksCache(fetchJwks, opts) {
  const ttlMs = (opts && opts.ttlMs) || 60 * 60 * 1000;
  const refetchMinMs = (opts && opts.refetchMinMs) || 60 * 1000;
  const nowMs = (opts && opts.nowMs) || (() => Date.now());
  let keys = null, fetchedAt = -Infinity, lastRefetchAt = -Infinity, fetches = 0;
  async function load(force) {
    const t = nowMs();
    if (!force && keys && t - fetchedAt < ttlMs) return keys;
    if (force && keys && t - lastRefetchAt < refetchMinMs) return keys;   // 節流:kid 未知也不狂抓
    if (force) lastRefetchAt = t;
    const j = await fetchJwks();
    if (!j || !Array.isArray(j.keys)) throw new Error("jwks_bad_shape");
    keys = j.keys.filter((k) => k && k.kty === "RSA" && typeof k.kid === "string" && typeof k.n === "string" && typeof k.e === "string");
    fetchedAt = t; fetches++;
    return keys;
  }
  return {
    async getKey(kid) {
      let ks = await load(false);
      let k = ks.find((x) => x.kid === kid);
      if (!k) { ks = await load(true); k = ks.find((x) => x.kid === kid); }
      return k || null;
    },
    stats: () => ({ fetches, cached: keys ? keys.length : 0 }),
  };
}

async function importRsaVerifyKey(jwk) {
  return crypto.subtle.importKey(
    "jwk",
    { kty: "RSA", n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

/**
 * @param {string|null|undefined} token  Cf-Access-Jwt-Assertion 的值
 * @param {object} opts
 *   teamDomain   必填,例 "https://acuting.cloudflareaccess.com"(= 期望的 iss)
 *   aud          必填,Access 應用程式的 AUD tag
 *   jwks         必填,createJwksCache(...) 的回傳
 *   allowedEmails 選填,字串陣列;有給就強制 email 在名單內
 *   nowSec       選填,() => 秒
 *   skewSec      選填,預設 60
 * @returns {Promise<{ok:true, email:string|null, sub:string|null, exp:number} | {ok:false, reason:string}>}
 */
export async function verifyAccessJwt(token, opts) {
  const fail = (reason) => ({ ok: false, reason });
  if (!opts || !opts.teamDomain || !opts.aud || !opts.jwks) return fail("auth_not_configured");
  if (!token) return fail("no_token");
  let d;
  try { d = decodeJwt(token); } catch (_) { return fail("bad_format"); }
  const { header, payload, signature, signingInput } = d;
  if (header.alg !== "RS256") return fail("bad_alg");
  if (typeof header.kid !== "string" || !header.kid) return fail("bad_format");
  let jwk;
  try { jwk = await opts.jwks.getKey(header.kid); } catch (_) { return fail("jwks_unavailable"); }
  if (!jwk) return fail("unknown_kid");
  let ok = false;
  try {
    const key = await importRsaVerifyKey(jwk);
    ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, signingInput);
  } catch (_) { ok = false; }
  if (!ok) return fail("bad_signature");

  const now = (opts.nowSec || (() => Math.floor(Date.now() / 1000)))();
  const skew = Number.isFinite(opts.skewSec) ? opts.skewSec : 60;
  if (payload.iss !== opts.teamDomain) return fail("bad_iss");
  const auds = Array.isArray(payload.aud) ? payload.aud : (typeof payload.aud === "string" ? [payload.aud] : []);
  if (!auds.includes(opts.aud)) return fail("bad_aud");
  if (!Number.isFinite(payload.exp) || payload.exp <= now - skew) return fail("expired");
  if (Number.isFinite(payload.nbf) && payload.nbf > now + skew) return fail("not_yet_valid");
  if (Number.isFinite(payload.iat) && payload.iat > now + skew) return fail("not_yet_valid");
  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : null;
  // Service token(機器用鑰匙,給備份工具):Access 簽出的 JWT 沒有 email,身分在 common_name(= Client ID)。
  const commonName = typeof payload.common_name === "string" && payload.common_name ? payload.common_name : null;
  const emailAllow = Array.isArray(opts.allowedEmails) ? opts.allowedEmails.map((e) => String(e).toLowerCase().trim()).filter(Boolean) : [];
  const svcAllow = Array.isArray(opts.allowedServiceNames) ? opts.allowedServiceNames.map((s) => String(s).trim()).filter(Boolean) : [];
  let kind = email ? "user" : (commonName ? "service" : "unknown");
  if (emailAllow.length || svcAllow.length) {
    const okEmail = !!(email && emailAllow.includes(email));
    const okSvc = !!(commonName && svcAllow.includes(commonName));
    if (!okEmail && !okSvc) {
      if (email) return fail("email_not_allowed");
      if (commonName) return fail("service_token_not_allowed");
      return fail("email_not_allowed");
    }
    kind = okEmail ? "user" : "service";
  }
  return { ok: true, email, commonName, kind, sub: typeof payload.sub === "string" ? payload.sub : null, exp: payload.exp };
}

/** Worker 端的 JWKS 取得函式(給 createJwksCache 用)。teamDomain 不帶尾斜線。 */
export function jwksFetcher(teamDomain, fetchImpl) {
  const url = `${String(teamDomain).replace(/\/+$/, "")}/cdn-cgi/access/certs`;
  const f = fetchImpl || ((u) => fetch(u));
  return async () => {
    const r = await f(url);
    if (!r.ok) throw new Error(`jwks_http_${r.status}`);
    return r.json();
  };
}
