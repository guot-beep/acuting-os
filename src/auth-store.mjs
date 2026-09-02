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
  // 簽證秘密也住這裡(見 tokenSecret());clinical_meta 由 clinical-kv-core 建,這裡只確保它在
  `CREATE TABLE IF NOT EXISTS clinical_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
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

  /* 簽通行證用的秘密:**存在 D1 裡,第一次用的時候自己長出來**。
   *
   * 為什麼不放設定檔:wrangler.jsonc 在 git 裡,寫進去等於把「偽造通行證的鑰匙」推上 GitHub。
   * 為什麼不放 Cloudflare Secret:那要她自己進後台點一輪,而她的時間比這一步值錢;
   *   而且少一個「她可能設錯或忘了設」的步驟,就少一種半套上線的失敗方式。
   * 安全性代價 = 0:能讀到這個秘密的人必須先能讀 D1,而那時病例本身早就在他手上了 ——
   *   秘密保護的是「沒有 D1 存取權的人不能偽造通行證」,這一點在存 D1 的情況下仍然成立。
   * 換秘密 = 刪掉這一列(或把 CLINICAL_PASS_VERSION +1),所有裝置下次要重打通行碼。 */
  async function tokenSecret() {
    const row = await db.first(`SELECT value FROM clinical_meta WHERE key = 'token_secret'`);
    if (row && row.value && String(row.value).length >= 32) return String(row.value);
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    let s = ""; for (const b of bytes) s += String.fromCharCode(b);
    const secret = btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    /* INSERT OR IGNORE:兩個請求同時第一次登入時,只有一個會寫進去,另一個讀回同一個值 ——
     * 兩邊各自產生秘密會讓先發出的通行證當場失效。 */
    await db.batch([{ sql: `INSERT OR IGNORE INTO clinical_meta (key, value) VALUES ('token_secret', ?)`, params: [secret] }]);
    const after = await db.first(`SELECT value FROM clinical_meta WHERE key = 'token_secret'`);
    return after && after.value ? String(after.value) : secret;
  }

  /* ── 通行碼記錄:**存 D1,不存 git** ───────────────────────────────────────
   * 這個 repo 是公開的,wrangler.jsonc 跟著進 GitHub。把通行碼的 salt+hash 寫在那裡,
   * 等於把離線破解需要的材料全部公開;30,000 次迭代擋不住一句記得住的通行碼(約一天就跑完)。
   * 所以記錄住在 D1:要先能讀 D1 才拿得到 hash,而那時病例早就在他手上了 ——
   * hash 保護的是「不能離線破解」,這一點只有在它不公開時才成立。
   *
   * 那第一次怎麼寫進去?見 clinical-handler 的 /auth/setup:git 裡只放**一次性設定碼**的雜湊,
   * 設定碼是 16 碼亂數(約 79 bits),公開也破不了;用過一次那個端點就關上。 */
  async function passRecord() {
    const rows = await db.all(`SELECT key, value FROM clinical_meta WHERE key IN ('pass_salt','pass_hash','pass_iter','pass_version')`, []);
    const m = {}; for (const r of rows) m[String(r.key)] = String(r.value);
    if (!m.pass_salt || !m.pass_hash) return null;          // 還沒設定 → 交給 setup 流程
    return { salt: m.pass_salt, hash: m.pass_hash, iterations: Number(m.pass_iter) || 0, passVersion: Number(m.pass_version) || 1 };
  }

  /** 已經跑過的設定紀元。env 的紀元比它大 → 允許再設定一次(忘記通行碼時的復原路徑)。 */
  async function setupEpoch() {
    const r = await db.first(`SELECT value FROM clinical_meta WHERE key = 'setup_epoch'`);
    return r && r.value != null ? Number(r.value) : 0;
  }

  /* 寫入新的通行碼記錄。
   * passVersion 每設定一次 +1 → 先前發出去的通行證(payload 帶 pv)當場全部失效,
   * 不必去每台裝置上清東西,也不會動到任何一筆病例。
   * 一個 batch 寫完:不會出現「紀元換了、記錄沒換」的半套狀態。 */
  async function savePassRecord(rec, epoch) {
    const prev = await passRecord();
    const nextVersion = (prev ? prev.passVersion : 0) + 1;
    const put = (k, v) => ({ sql: `INSERT INTO clinical_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, params: [k, String(v)] });
    await db.batch([
      put("pass_salt", rec.salt), put("pass_hash", rec.hash),
      put("pass_iter", rec.iterations), put("pass_version", nextVersion),
      put("setup_epoch", epoch),
      { sql: `DELETE FROM clinical_auth_fails`, params: [] },   // 重設之後不該被舊的失敗紀錄鎖在門外
    ]);
    return { ...rec, passVersion: nextVersion };
  }

  return { ensureSchema, recentFails, recordFail, clearFails, stats, tokenSecret, passRecord, setupEpoch, savePassRecord };
}
