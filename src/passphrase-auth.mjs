/**
 * passphrase-auth.mjs — 病例 API 的通行碼驗證(取代 Cloudflare Access)。
 * Ting 2026-09-02 裁定:「改用通行碼」—— Access 的一次性 PIN 郵件被 Cloudflare 事故擋住,
 * 登入方式只有一條路等於隨時可能把自己鎖在門外。
 *
 * 設計(每一條都是為了「瀏覽器裡的東西一律不可信」):
 *   1. **通行碼本身永遠不進 repo、不進瀏覽器程式碼、不進 wrangler 設定**。
 *      設定裡只有 PBKDF2 的鹽與雜湊(scripts/make-clinical-passphrase-hash.js 在她自己機器上算)。
 *   2. 驗證只發生在 Worker。前端沒有任何「密碼對不對」的判斷 —— 前端的判斷等於沒有判斷。
 *   3. 驗證成功發一張**簽章通行證**(HMAC-SHA256):payload 只有版本、發證時間、到期時間,
 *      沒有通行碼、沒有病例內容。之後每個請求帶這張證,Worker 只驗簽章與到期。
 *   4. 換通行碼 = 換 hash + 版本 +1 → 所有舊通行證當場失效(不必逐台清)。
 *   5. 比對一律用**常數時間**(timingSafeEqual):字串 === 會依相同前綴長度洩漏資訊。
 *   6. 免費方案每個請求 10ms CPU,PBKDF2 迭代不能無限高;所以**強度靠「長通行碼 + 失敗限流」**,
 *      不是靠慢雜湊。預設 12 萬次迭代(本機 workerd 量過)、通行碼長度下限 16 字,
 *      失敗限流由呼叫端(D1)負責。
 *
 * 這個檔只有純函式,Node 與 Workers 都能跑,測試不需要 Cloudflare。
 */

const enc = new TextEncoder();
export const TOKEN_VERSION = 1;
export const DEFAULT_ITERATIONS = 120_000;
/* 強度下限用「加權長度」不是字元數:一個中文字的選擇空間是幾千,一個英文小寫字母只有 26。
 * 拿字元數當門檻,會逼一個習慣用中文的人打出 16 個中文字(那是一整句話),
 * 而 16 個英文小寫字母其實比 8 個中文字弱。所以:CJK 每字算 2、其餘每字算 1,要求加權 ≥ 16,
 * 並且原始長度 ≥ 8(擋住「兩個生僻字」那種看似夠強、其實好猜的東西)。 */
export const MIN_PASSPHRASE_WEIGHT = 16;
export const MIN_PASSPHRASE_CHARS = 8;
const CJK_CHAR = /[㐀-䶿一-鿿豈-﫿぀-ヿ가-힯]/;
export function passphraseWeight(p) {
  let w = 0;
  for (const ch of normalizePassphrase(p)) w += CJK_CHAR.test(ch) ? 2 : 1;
  return w;
}
export const DEFAULT_TOKEN_TTL_DAYS = 30;

const b64url = (bytes) => {
  let s = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const b64urlToBytes = (s) => {
  if (typeof s !== "string" || !/^[A-Za-z0-9_-]*$/.test(s)) throw new Error("bad_b64url");
  const pad = s.length % 4 === 2 ? "==" : s.length % 4 === 3 ? "=" : s.length % 4 === 1 ? null : "";
  if (pad === null) throw new Error("bad_b64url");
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

/** 常數時間比較。長度不同直接 false —— 長度本來就不是秘密。 */
export function timingSafeEqual(a, b) {
  const A = a instanceof Uint8Array ? a : b64urlToBytes(String(a));
  const B = b instanceof Uint8Array ? b : b64urlToBytes(String(b));
  if (A.length !== B.length) return false;
  let diff = 0;
  for (let i = 0; i < A.length; i++) diff |= A[i] ^ B[i];
  return diff === 0;
}

/** NFKC + 去頭尾空白:她在手機與桌機打同一句話,不該因為全形空白或組合字而失敗。中間的空白保留(那是通行碼的一部分)。 */
export function normalizePassphrase(p) {
  return String(p == null ? "" : p).normalize("NFKC").trim();
}

export async function derivePassphraseHash(passphrase, saltB64url, iterations = DEFAULT_ITERATIONS) {
  const salt = b64urlToBytes(saltB64url);
  const key = await crypto.subtle.importKey("raw", enc.encode(normalizePassphrase(passphrase)), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, key, 256);
  return b64url(new Uint8Array(bits));
}

/** 產生設定用的 {salt, hash, iterations}。只在她自己的機器上跑(scripts/make-clinical-passphrase-hash.js)。 */
export async function makePassphraseRecord(passphrase, iterations = DEFAULT_ITERATIONS) {
  const p = normalizePassphrase(passphrase);
  const w = passphraseWeight(p);
  if (p.length < MIN_PASSPHRASE_CHARS || w < MIN_PASSPHRASE_WEIGHT) {
    throw new Error(
      `通行碼強度不足(中文一字算 2、其餘算 1,需要 ${MIN_PASSPHRASE_WEIGHT};目前 ${w},字數 ${p.length}/${MIN_PASSPHRASE_CHARS})。` +
      `建議用一句自己記得住的話,例如「白虎湯加石膏四十克」或四五個英文詞加空格。`);
  }
  const salt = b64url(crypto.getRandomValues(new Uint8Array(16)));
  const hash = await derivePassphraseHash(p, salt, iterations);
  return { salt, hash, iterations };
}

export async function verifyPassphrase(passphrase, record) {
  if (!record || !record.salt || !record.hash) return false;
  const p = normalizePassphrase(passphrase);
  if (!p) return false;
  const got = await derivePassphraseHash(p, record.salt, record.iterations || DEFAULT_ITERATIONS);
  return timingSafeEqual(got, record.hash);
}

async function hmacKey(secret) {
  return crypto.subtle.importKey("raw", enc.encode(String(secret)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

/**
 * 通行證 = base64url(payload).base64url(hmac)。payload 只有 {v, pv, iat, exp}:
 * 沒有通行碼、沒有病例、沒有可辨識的東西 —— 拿到它只能證明「曾經知道通行碼」,不會洩漏通行碼本身。
 */
export async function issueToken(secret, opts) {
  const now = (opts && opts.nowSec) || Math.floor(Date.now() / 1000);
  const ttl = ((opts && opts.ttlDays) || DEFAULT_TOKEN_TTL_DAYS) * 86400;
  const payload = { v: TOKEN_VERSION, pv: (opts && opts.passVersion) || 1, iat: now, exp: now + ttl };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(body));
  return { token: `${body}.${b64url(new Uint8Array(sig))}`, payload };
}

/**
 * 驗證通行證。回 {ok:true, payload} 或 {ok:false, reason}。
 * reason 只給機器看,回應給瀏覽器的訊息一律是同一句 —— 不要告訴攻擊者是「簽章錯」還是「過期」。
 */
export async function verifyToken(token, secret, opts) {
  const fail = (reason) => ({ ok: false, reason });
  if (!token || typeof token !== "string") return fail("no_token");
  const parts = token.split(".");
  if (parts.length !== 2) return fail("bad_format");
  const [body, sig] = parts;
  let expected;
  try {
    expected = b64url(new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(body))));
  } catch (_) { return fail("hmac_failed"); }
  let sigOk;
  try { sigOk = timingSafeEqual(sig, expected); } catch (_) { return fail("bad_format"); }
  if (!sigOk) return fail("bad_signature");
  let payload;
  try { payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(body))); } catch (_) { return fail("bad_payload"); }
  if (!payload || typeof payload !== "object") return fail("bad_payload");
  if (payload.v !== TOKEN_VERSION) return fail("bad_version");
  const now = (opts && opts.nowSec) || Math.floor(Date.now() / 1000);
  const skew = (opts && Number.isFinite(opts.skewSec)) ? opts.skewSec : 60;
  if (!Number.isSafeInteger(payload.exp) || payload.exp <= now - skew) return fail("expired");
  if (!Number.isSafeInteger(payload.iat) || payload.iat > now + skew) return fail("issued_in_future");
  const wantPv = (opts && opts.passVersion) || 1;
  if (payload.pv !== wantPv) return fail("passphrase_rotated");   // 換過通行碼 → 舊證全部失效
  return { ok: true, payload };
}

/**
 * 失敗限流的判斷(純函式;紀錄由呼叫端存 D1)。
 * 規則:同一個來源在 windowSec 內失敗 maxFails 次 → 鎖到視窗結束。
 * 之所以要限流:沒有 Access 擋在前面,/__clinical/auth 是公開端點,慢雜湊在免費方案上又不能太慢。
 */
export function rateLimitVerdict(fails, opts) {
  const max = (opts && opts.maxFails) || 8;
  const windowSec = (opts && opts.windowSec) || 900;
  const now = (opts && opts.nowSec) || Math.floor(Date.now() / 1000);
  const recent = (fails || []).filter((t) => Number.isFinite(t) && t > now - windowSec);
  if (recent.length < max) return { blocked: false, remaining: max - recent.length };
  const oldest = Math.min(...recent);
  return { blocked: true, retryAfterSec: Math.max(1, Math.ceil(oldest + windowSec - now)) };
}
