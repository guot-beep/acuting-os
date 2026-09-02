/**
 * kv-node-sqlite-adapter.js — clinical-kv-core 的 node:sqlite adapter(測試、本機工具用)。
 * 模擬 D1 的 batch 語意:一個交易、任一句失敗整組回滾並 throw。
 */
"use strict";
const { DatabaseSync } = require("node:sqlite");

function createNodeSqliteAdapter(file) {
  const db = new DatabaseSync(file);
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec("PRAGMA foreign_keys = ON;");
  return {
    raw: db,
    async batch(stmts) {
      db.exec("BEGIN IMMEDIATE;");
      try {
        for (const s of stmts) db.prepare(s.sql).run(...(s.params || []));
        db.exec("COMMIT;");
      } catch (e) {
        try { db.exec("ROLLBACK;"); } catch (_) { /* 已不在交易裡 */ }
        throw e;
      }
    },
    async all(sql, params) { return db.prepare(sql).all(...(params || [])); },
    async first(sql, params) { const r = db.prepare(sql).get(...(params || [])); return r === undefined ? null : r; },
    close() { db.close(); },
  };
}

module.exports = { createNodeSqliteAdapter };
