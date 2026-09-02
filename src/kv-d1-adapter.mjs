/**
 * kv-d1-adapter.mjs — clinical-kv-core 的 Cloudflare D1 adapter。
 * D1 的 batch() 是原子的:任一句失敗整組回滾並 throw(本機 Miniflare 實測 + 文件)。
 * 這裡不做任何重試、不吞錯;core 用 isConflict() 認 trigger 的 revision_conflict。
 */
export function createD1Adapter(d1) {
  const bind = (s) => {
    const stmt = d1.prepare(s.sql);
    return s.params && s.params.length ? stmt.bind(...s.params) : stmt;
  };
  return {
    async batch(stmts) {
      if (!stmts.length) return;
      await d1.batch(stmts.map(bind));
    },
    async all(sql, params) {
      const r = await bind({ sql, params }).all();
      return r.results || [];
    },
    async first(sql, params) {
      const r = await bind({ sql, params }).first();
      return r === undefined || r === null ? null : r;
    },
  };
}
