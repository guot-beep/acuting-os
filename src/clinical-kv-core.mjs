/**
 * clinical-kv-core.mjs — 病例 kv 正本的資料層(與資料庫無關;Worker 用 D1 adapter、測試與本機工具用 node:sqlite adapter)。
 *
 * 契約 = 本機服務那套(backend C1–C7):key → 字串原樣、全域 revision、If-Match → 409、history。
 * 兩個實測出來的硬條件(scratchpad/d1-empirical-facts.md):
 *   1. compare-and-set 必須用會 RAISE 的 trigger 守門:多句 batch 裡後面的句子分不出「是我改的」。
 *      clinical_revision_log 上的 trigger 在 NEW.revision != meta.revision + 1 時 RAISE(ABORT,'revision_conflict'),
 *      整個 batch 原子回滾。後面的句子因此**不需要**任何條件。
 *   2. D1 單一 TEXT/row 上限約 2,000,000 bytes:值一律分塊(≤ 500,000 個 UTF-16 code unit/塊,
 *      最壞 3 bytes/unit = 1.5 MB;不在 surrogate pair 中間切)。history 的舊值也分塊。
 *
 * adapter 介面(全部 async):
 *   batch([{sql, params}])  → 原子執行;任一失敗就整組回滾並 throw(D1 batch 與 SQLite 交易都如此)
 *   all(sql, params)        → rows[]
 *   first(sql, params)      → row | null
 * 錯誤判斷:isConflict(err) 看訊息含 revision_conflict。
 *
 * 不做:不解析值的內容(它是病歷)、不把值寫進錯誤訊息或 log。
 */

export const CHUNK_UNITS = 500_000;
export const HISTORY_PER_KEY = 200;
export const KEY_RE = /^[A-Za-z0-9._-]{1,120}$/;

export const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS clinical_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS clinical_kv (
     key TEXT PRIMARY KEY, revision INTEGER NOT NULL, updated_at TEXT NOT NULL,
     chunk_count INTEGER NOT NULL, char_length INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS clinical_kv_chunks (
     key TEXT NOT NULL, seq INTEGER NOT NULL, part TEXT NOT NULL, PRIMARY KEY (key, seq))`,
  `CREATE TABLE IF NOT EXISTS clinical_kv_history (
     revision INTEGER PRIMARY KEY, key TEXT NOT NULL, op TEXT NOT NULL,
     prior_present INTEGER NOT NULL, prior_chunk_count INTEGER NOT NULL, prior_char_length INTEGER NOT NULL,
     written_at TEXT NOT NULL, actor TEXT)`,
  `CREATE TABLE IF NOT EXISTS clinical_kv_history_chunks (
     revision INTEGER NOT NULL, seq INTEGER NOT NULL, part TEXT NOT NULL, PRIMARY KEY (revision, seq))`,
  `CREATE TABLE IF NOT EXISTS clinical_revision_log (revision INTEGER PRIMARY KEY, at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS clinical_kv_history_key ON clinical_kv_history (key, revision)`,
  `INSERT OR IGNORE INTO clinical_meta (key, value) VALUES ('revision', '0')`,
  `CREATE TRIGGER IF NOT EXISTS clinical_cas_guard BEFORE INSERT ON clinical_revision_log
     WHEN NEW.revision != (SELECT CAST(value AS INTEGER) FROM clinical_meta WHERE key = 'revision') + 1
     BEGIN SELECT RAISE(ABORT, 'revision_conflict'); END`,
];

export const isConflict = (err) => /revision_conflict/.test(String((err && err.message) || err || ""));

/** 依 UTF-16 code unit 切塊,不切開 surrogate pair。空字串 → 0 塊(kv 列仍存在,char_length 0)。 */
export function splitChunks(value, max = CHUNK_UNITS) {
  const s = String(value);
  const out = [];
  let i = 0;
  while (i < s.length) {
    let end = Math.min(i + max, s.length);
    if (end < s.length) {
      const c = s.charCodeAt(end - 1);
      if (c >= 0xd800 && c <= 0xdbff) end -= 1;   // 尾巴是高位代理 → 留給下一塊
    }
    out.push(s.slice(i, end));
    i = end;
  }
  return out;
}

const S = (sql, ...params) => ({ sql, params });

export function createKvCore(db, opts) {
  const historyPerKey = (opts && opts.historyPerKey) || HISTORY_PER_KEY;
  const chunkUnits = (opts && opts.chunkUnits) || CHUNK_UNITS;
  const nowIso = (opts && opts.now) || (() => new Date().toISOString());

  async function ensureSchema() {
    await db.batch(SCHEMA_STATEMENTS.map((sql) => S(sql)));
    const created = await db.first(`SELECT value FROM clinical_meta WHERE key = 'created_at'`);
    if (!created) await db.batch([S(`INSERT OR IGNORE INTO clinical_meta (key, value) VALUES ('created_at', ?)`, nowIso())]);
  }

  async function revision() {
    const r = await db.first(`SELECT value FROM clinical_meta WHERE key = 'revision'`);
    return r ? Number(r.value) : 0;
  }

  async function readValue(key) {
    const head = await db.first(`SELECT revision, chunk_count, char_length FROM clinical_kv WHERE key = ?`, [key]);
    if (!head) return null;
    if (head.chunk_count === 0) return { value: "", revision: head.revision };
    const rows = await db.all(`SELECT part FROM clinical_kv_chunks WHERE key = ? ORDER BY seq`, [key]);
    if (rows.length !== head.chunk_count) throw new Error(`kv_integrity: ${key} 預期 ${head.chunk_count} 塊,讀到 ${rows.length}`);
    const value = rows.map((r) => r.part).join("");
    if (value.length !== head.char_length) throw new Error(`kv_integrity: ${key} 長度 ${value.length} ≠ 記錄 ${head.char_length}`);
    return { value, revision: head.revision };
  }

  async function get(key) {
    const r = await readValue(key);
    return r ? r.value : null;
  }

  async function snapshot() {
    const heads = await db.all(`SELECT key, revision, chunk_count, char_length FROM clinical_kv ORDER BY key`);
    const parts = await db.all(`SELECT key, seq, part FROM clinical_kv_chunks ORDER BY key, seq`);
    const byKey = new Map();
    for (const p of parts) { if (!byKey.has(p.key)) byKey.set(p.key, []); byKey.get(p.key).push(p.part); }
    const keys = {};
    for (const h of heads) {
      const v = (byKey.get(h.key) || []).join("");
      if (v.length !== h.char_length) throw new Error(`kv_integrity: ${h.key} 長度不符`);
      keys[h.key] = v;
    }
    return { revision: await revision(), keys };
  }

  /** 把「舊值」搬進 history 的語句(同一個 batch 內)。 */
  function historyStatements(next, key, op, prior, at, actor) {
    const chunks = prior ? splitChunks(prior.value, chunkUnits) : [];
    const stmts = [
      S(`INSERT INTO clinical_kv_history (revision, key, op, prior_present, prior_chunk_count, prior_char_length, written_at, actor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, next, key, op, prior ? 1 : 0, chunks.length, prior ? prior.value.length : 0, at, actor || null),
    ];
    chunks.forEach((part, i) => stmts.push(S(`INSERT INTO clinical_kv_history_chunks (revision, seq, part) VALUES (?, ?, ?)`, next, i, part)));
    // 保留最近 N 版(每個 key);孤兒塊一併清
    stmts.push(S(`DELETE FROM clinical_kv_history WHERE key = ? AND revision NOT IN
                  (SELECT revision FROM clinical_kv_history WHERE key = ? ORDER BY revision DESC LIMIT ?)`, key, key, historyPerKey));
    stmts.push(S(`DELETE FROM clinical_kv_history_chunks WHERE revision NOT IN (SELECT revision FROM clinical_kv_history)`));
    return stmts;
  }

  /**
   * ifMatch:number → 嚴格 CAS;undefined → 強制(讀當下 revision 當基準,撞到就重試幾次)。
   * 回傳 {ok:true, revision} 或 {ok:false, status:409, revision, expected}。
   */
  async function mutate(key, op, value, ifMatch, actor) {
    if (!KEY_RE.test(key)) throw new Error("bad_key");
    if (op === "put" && typeof value !== "string") throw new Error("value_must_be_string");
    const strict = ifMatch !== undefined && ifMatch !== null;
    if (strict && (!Number.isSafeInteger(ifMatch) || ifMatch < 0)) throw new Error("bad_if_match");
    for (let attempt = 0; attempt < 5; attempt++) {
      const base = strict ? ifMatch : await revision();
      const next = base + 1;
      const at = nowIso();
      const prior = await readValue(key);   // revision 不變 ⇒ 這個 prior 就是 batch 時的現況(trigger 保證)
      const stmts = [
        S(`INSERT INTO clinical_revision_log (revision, at) VALUES (?, ?)`, next, at),   // 守門:錯就 RAISE,整組回滾
        S(`UPDATE clinical_meta SET value = ? WHERE key = 'revision'`, String(next)),
        ...historyStatements(next, key, op, prior, at, actor),
        S(`DELETE FROM clinical_kv_chunks WHERE key = ?`, key),
      ];
      if (op === "put") {
        const chunks = splitChunks(value, chunkUnits);
        stmts.push(S(`INSERT INTO clinical_kv (key, revision, updated_at, chunk_count, char_length) VALUES (?, ?, ?, ?, ?)
                      ON CONFLICT(key) DO UPDATE SET revision = excluded.revision, updated_at = excluded.updated_at,
                      chunk_count = excluded.chunk_count, char_length = excluded.char_length`, key, next, at, chunks.length, value.length));
        chunks.forEach((part, i) => stmts.push(S(`INSERT INTO clinical_kv_chunks (key, seq, part) VALUES (?, ?, ?)`, key, i, part)));
      } else {
        stmts.push(S(`DELETE FROM clinical_kv WHERE key = ?`, key));
      }
      try {
        await db.batch(stmts);
        return { ok: true, revision: next };
      } catch (e) {
        if (!isConflict(e)) throw e;
        const cur = await revision();
        if (strict) return { ok: false, status: 409, revision: cur, expected: ifMatch };
        // 強制模式:別人剛寫過,重讀基準再來
      }
    }
    return { ok: false, status: 409, revision: await revision(), expected: null };
  }

  async function historyCount() {
    const r = await db.first(`SELECT COUNT(*) AS n FROM clinical_kv_history`);
    return r ? Number(r.n) : 0;
  }

  async function status() {
    const heads = await db.all(`SELECT key, revision, char_length, updated_at FROM clinical_kv ORDER BY key`);
    const keys = {};
    for (const h of heads) keys[h.key] = { chars: h.char_length, revision: h.revision, updated_at: h.updated_at };
    return { revision: await revision(), keys, history_rows: await historyCount() };
  }

  return {
    ensureSchema, revision, get, snapshot, status, historyCount,
    put: (key, value, ifMatch, actor) => mutate(key, "put", value, ifMatch, actor),
    del: (key, ifMatch, actor) => mutate(key, "delete", null, ifMatch, actor),
  };
}
