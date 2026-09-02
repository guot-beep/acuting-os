/**
 * auth-store.mjs — 通行碼驗證的失敗紀錄(限流)存取層。與資料庫無關,吃 clinical-kv-core 用的同一種 adapter。
 *
 * 為什麼要存:沒有 Cloudflare Access 擋在前面,`/__clinical/auth` 是公開端點;
 * 免費方案每請求 10ms CPU 又讓 PBKDF2 不能太慢,所以強度靠「長通行碼 + 失敗次數上限」。
 * 上限的狀態必須跨請求、跨 isolate 保存 → 存 D1。
 *
 * 隱私:不存 IP 原文,存 HMAC(IP + 伺服器秘密) 的前 16 hex。
 * 目的只是「同一個來源」的識別,不需要能還原成 IP;而且沒有秘密就反推不出來。
 */

export const AUTH_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS clinical_auth_fails (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     source TEXT NOT NULL,
     at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS clinical_auth_fails_src ON clinical_auth_fails (source, at)`,
];

const enc = new TextEncoder();

/** 來源識別碼:HMAC(ip, secret) 取前 16 hex。IP 原文不落地。 */
export async function sourceKey(ip, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(String(secret || "no-secret")), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(String(ip || "unknown"))));
  return [...sig.slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function createAuthStore(db, opts) {
  const windowSec = (opts && opts.windowSec) || 900;
  const nowSec = (opts && opts.nowSec) || (() => Math.floor(Date.now() / 1000));

  async function ensureSchema() {
    await db.batch(AUTH_SCHEMA_STATEMENTS.map((sql) => ({ sql, params: [] })));
  }
  /** 這個來源在視窗內的失敗時間點。 */
  async function recentFails(source) {
    const cutoff = nowSec() - windowSec;
    const rows = await db.all(`SELECT at FROM clinical_auth_fails WHERE source = ? AND at > ? ORDER BY at`, [source, cutoff]);
    return rows.map((r) => Number(r.at));
  }
  async function recordFail(source) {
    const t = nowSec();
    await db.batch([
      { sql: `INSERT INTO clinical_auth_fails (source, at) VALUES (?, ?)`, params: [source, t] },
      // 順手清掉兩天前的:這張表只服務一個 15 分鐘的視窗,沒有理由長大
      { sql: `DELETE FROM clinical_auth_fails WHERE at < ?`, params: [t - 2 * 86400] },
    ]);
    return t;
  }
  /** 驗證成功就把這個來源的失敗紀錄清掉 —— 不然打對之後還被自己的舊失敗鎖住。 */
  async function clearFails(source) {
    await db.batch([{ sql: `DELETE FROM clinical_auth_fails WHERE source = ?`, params: [source] }]);
  }
  async function stats() {
    const r = await db.first(`SELECT COUNT(*) AS n FROM clinical_auth_fails`);
    return { rows: r ? Number(r.n) : 0 };
  }
  return { ensureSchema, recentFails, recordFail, clearFails, stats };
}
