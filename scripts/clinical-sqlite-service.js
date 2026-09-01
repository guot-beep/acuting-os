#!/usr/bin/env node
/**
 * clinical-sqlite-service.js — 本機 SQLite 病例服務。
 * D18 的 pointer 步;Ting 2026-09-01 裁定提前執行(「別管之前了 我想現在搬移」)。
 *
 * 一個 process 做兩件事,**同源**(同一個 127.0.0.1:port),所以瀏覽器不需要 CORS、
 * 不會撞 Chrome 的 Private Network Access 提示:
 *   1. 靜態伺服 app(與 scripts/dev-server.js 同款;root 預設 repo 根目錄)
 *   2. /__clinical/* —— js/clinical-store.js 的 backend 契約
 *      (read / write / readKey / writeKey / removeKey)的 HTTP 版:
 *      key → value 原樣存進 clinical_kv,逐位元組(契約 C2 / C7)。
 *
 * 「文件 + 投影」兩層:
 *   - clinical_kv 是**正本**:app 存什麼字串,這裡就是那個字串。
 *   - schema.sql 的 29 張表是**投影**:病例 key 每次寫入後,spawn
 *     export-clinical-to-sqlite.js --into 在同一個檔案裡整組重建,供 SQL 查詢。
 *     投影失敗**不擋存檔** —— 正本已落地;失敗原因寫進 clinical_meta.projection_status,
 *     app 左下角的徽章會顯示出來(fail-visible:不靜默,也不因為查詢表而拒絕臨床存檔)。
 *   為什麼不反過來(29 張表當正本、讀回時組回病例物件):對照表有 5 條刻意未實作、
 *   多條 JOIN / EXPLODE 是有損轉換,反推 = 臨床資料遺失。正本必須是無損的那一層。
 *
 * 多分頁:全域 revision;每次寫入帶 If-Match(上次看到的 revision),不符 → 409、零寫入。
 *   這是 store 自己那層樂觀鎖(assertOwnsWrite)之外的第二道,補 TOCTOU。
 * 永不遺失:每次覆寫 / 刪除之前,舊值先進 clinical_kv_history(每個 key 留最近 200 筆)。
 * 只綁 127.0.0.1;Host 標頭不是 loopback 一律 421(DNS rebinding 防護,API 沒有別的驗證)。
 *
 * 用法:
 *   node scripts/clinical-sqlite-service.js [--db <path>] [--port 8785] [--root <dir>] [--open]
 *   node scripts/clinical-sqlite-service.js --status [--db <path>]
 * 預設 db:%USERPROFILE%\Documents\AcuTing\acuting-clinical.db(repo 外。D7:.db 絕不 commit)
 *
 * 日誌只印 key 名與長度,**永不印值**(值是病歷)。
 */
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { execFile } = require("child_process");
const { DatabaseSync } = require("node:sqlite");

const ROOT = path.resolve(__dirname, "..");
const EXPORTER = path.join(__dirname, "export-clinical-to-sqlite.js");
const SERVICE = "acuting-clinical-sqlite";
const VERSION = "1.0.0";
const API = "/__clinical";
const KEYS = {
  STORAGE: "acuting-clinical-cases-v1",
  STAGING: "acuting-clinical-v2-staging",
  POINTER: "acuting-clinical-active",
  CANDIDATE: "acuting-clinical-v2-staging-candidate",
  CONFLICT_BACKUP: "acuting-clinical-conflict-backup",
};
const PROJECTION_TRIGGER_KEYS = new Set([KEYS.STORAGE, KEYS.STAGING, KEYS.POINTER]);
const KEY_RE = /^[A-Za-z0-9._-]{1,120}$/;
const MAX_BODY = 64 * 1024 * 1024;
const HISTORY_PER_KEY = 200;
const DEFAULT_PORT = 8785;
const DEFAULT_DB = path.join(os.homedir(), "Documents", "AcuTing", "acuting-clinical.db");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

const now = () => new Date().toISOString();

// ── DB ────────────────────────────────────────────────────────────────────
function openDb(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA busy_timeout = 5000;");
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS clinical_kv (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      revision   INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS clinical_kv_history (
      seq         INTEGER PRIMARY KEY AUTOINCREMENT,
      key         TEXT NOT NULL,
      op          TEXT NOT NULL,
      prior_value TEXT,
      revision    INTEGER NOT NULL,
      written_at  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS clinical_kv_history_key ON clinical_kv_history (key, seq);
    CREATE TABLE IF NOT EXISTS clinical_meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  if (getMeta(db, "revision") === null) {
    setMeta(db, "revision", "0");
    setMeta(db, "created_at", now());
  }
  setMeta(db, "service_version", VERSION);
  return db;
}
function getMeta(db, k) {
  const r = db.prepare("SELECT value FROM clinical_meta WHERE key = ?").get(k);
  return r ? r.value : null;
}
function setMeta(db, k, v) {
  db.prepare("INSERT INTO clinical_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(k, String(v));
}
const revisionOf = (db) => Number(getMeta(db, "revision") || 0);

// ── KV store(正本)────────────────────────────────────────────────────────
function createStore(db) {
  const q = {
    get: db.prepare("SELECT value FROM clinical_kv WHERE key = ?"),
    all: db.prepare("SELECT key, value FROM clinical_kv ORDER BY key"),
    put: db.prepare("INSERT INTO clinical_kv (key, value, revision, updated_at) VALUES (?, ?, ?, ?) " +
                    "ON CONFLICT(key) DO UPDATE SET value = excluded.value, revision = excluded.revision, updated_at = excluded.updated_at"),
    del: db.prepare("DELETE FROM clinical_kv WHERE key = ?"),
    hist: db.prepare("INSERT INTO clinical_kv_history (key, op, prior_value, revision, written_at) VALUES (?, ?, ?, ?, ?)"),
    prune: db.prepare("DELETE FROM clinical_kv_history WHERE key = ? AND seq NOT IN " +
                      "(SELECT seq FROM clinical_kv_history WHERE key = ? ORDER BY seq DESC LIMIT ?)"),
    histCount: db.prepare("SELECT COUNT(*) n FROM clinical_kv_history"),
  };
  const revision = () => revisionOf(db);
  const get = (key) => { const r = q.get.get(key); return r ? r.value : null; };
  function snapshot() {
    const keys = {};
    for (const r of q.all.all()) keys[r.key] = r.value;
    return { revision: revision(), keys };
  }
  /* 單一交易:比對 revision → 舊值進 history → 寫 / 刪 → revision +1。
   * BEGIN IMMEDIATE 立刻拿寫鎖:投影子程序同時在重建時,靠 busy_timeout 排隊,
   * 不會出現「兩邊都以為自己拿到了」。 */
  function mutate(key, op, value, ifMatch) {
    db.exec("BEGIN IMMEDIATE;");
    try {
      const cur = revision();
      if (ifMatch !== undefined && ifMatch !== cur) {
        db.exec("ROLLBACK;");
        return { ok: false, status: 409, revision: cur, expected: ifMatch };
      }
      const prior = get(key);
      const next = cur + 1;
      q.hist.run(key, op, prior, next, now());
      q.prune.run(key, key, HISTORY_PER_KEY);
      if (op === "put") q.put.run(key, value, next, now()); else q.del.run(key);
      setMeta(db, "revision", String(next));
      db.exec("COMMIT;");
      return { ok: true, status: 200, revision: next };
    } catch (e) {
      try { db.exec("ROLLBACK;"); } catch (_) { /* 已經不在交易裡 */ }
      throw e;
    }
  }
  return {
    get, snapshot, revision,
    put: (k, v, m) => mutate(k, "put", v, m),
    del: (k, m) => mutate(k, "delete", null, m),
    historyCount: () => q.histCount.get().n,
  };
}

// ── 投影(schema.sql 29 張表,由 exporter --into 重建)─────────────────────
function createProjection(db, dbFile, store, opts) {
  const exporter = (opts && opts.exporter) || EXPORTER;
  const log = (opts && opts.log) || (() => {});
  let running = false, pending = false, timer = null, inflight = null, closed = false;
  const status = () => { const s = getMeta(db, "projection_status"); try { return s ? JSON.parse(s) : null; } catch (_) { return null; } };
  const setStatus = (obj) => setMeta(db, "projection_status", JSON.stringify(obj));

  function casesFromStore() {
    const pointer = store.get(KEYS.POINTER);
    const key = pointer === "v2" ? KEYS.STAGING : KEYS.STORAGE;
    const raw = store.get(key);
    if (raw === null) return { cases: [], source: key, note: "沒有病例資料(空庫)" };
    let parsed;
    try { parsed = JSON.parse(raw); } catch (_) { return { error: `正本 ${key} 不是合法 JSON(內容不轉述;長度 ${raw.length})`, source: key }; }
    const cases = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.cases)) ? parsed.cases : null;
    if (!cases) return { error: `正本 ${key} 形狀不明(不是陣列也不是 {cases:[…]})`, source: key };
    return { cases, source: key };
  }

  function schedule(reason) {
    if (closed) return;
    pending = true;
    clearTimeout(timer);
    timer = setTimeout(() => { run(reason); }, 250);
    if (timer.unref) timer.unref();
  }

  function run(reason) {
    if (closed) return Promise.resolve(null);
    if (running) { pending = true; return inflight; }
    pending = false; running = true;
    const started = Date.now();
    let src;
    try { src = casesFromStore(); }
    catch (e) {
      /* 從 timer 進來的例外絕不能往外拋 —— 那會殺掉整個服務,app 之後每一次存檔都失敗
       * (雖然是大聲失敗)。第一版就這樣:close() 之後殘留的 timer 撞到已 finalize 的
       * statement,整個 process 掛掉。記成狀態,讓徽章顯示。 */
      src = { error: `讀取正本失敗:${e.message}`, source: "?" };
    }
    if (src.error) {
      const st = { ok: false, at: now(), reason, source_key: src.source, error: src.error, summary: [src.error] };
      try { setStatus(st); } catch (e) { log(`projection: 狀態寫不進去:${e.message}`); }
      running = false;
      log(`projection ✗ ${src.error}`);
      return Promise.resolve(st);
    }
    const tmp = `${dbFile}.projection-input.tmp.json`;
    fs.writeFileSync(tmp, JSON.stringify({ schema_version: 1, cases: src.cases }));
    inflight = new Promise((resolve) => {
      execFile(process.execPath, [exporter, tmp, dbFile, "--into"],
        { timeout: 120000, maxBuffer: 8 * 1024 * 1024, windowsHide: true },
        (err, stdout, stderr) => {
          try { fs.unlinkSync(tmp); } catch (_) { /* 沒有就算了 */ }
          const code = err ? (typeof err.code === "number" ? err.code : 1) : 0;
          const lines = `${stdout || ""}\n${stderr || ""}${err && typeof err.code !== "number" ? "\n" + err.message : ""}`
            .split(/\r?\n/).map((l) => l.trimEnd()).filter(Boolean);
          const st = {
            ok: code === 0, exit_code: code, at: now(), reason, source_key: src.source,
            cases: src.cases.length, duration_ms: Date.now() - started, summary: lines.slice(-30),
          };
          try { setStatus(st); } catch (e) { log(`projection: 狀態寫不進去:${e.message}`); }
          log(`projection ${st.ok ? "✓" : "✗"} ${src.cases.length} 筆病例 → 29 張投影表(exit ${code},${st.duration_ms} ms)`);
          running = false; inflight = null;
          if (pending) schedule("pending");
          resolve(st);
        });
    });
    return inflight;
  }
  /* 關服務前呼叫:取消排程、之後的 schedule/run 都成 no-op。子程序若還在跑,
   * 它的回呼裡的 setStatus 已有 try/catch,撞到關掉的 db 只會記一行 log。 */
  function dispose() { closed = true; clearTimeout(timer); timer = null; }
  return { schedule, run, status, casesFromStore, dispose };
}

function cleanupTmp(dbFile) {
  try {
    const dir = path.dirname(dbFile), base = path.basename(dbFile);
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith(base) && f.endsWith(".projection-input.tmp.json")) fs.unlinkSync(path.join(dir, f));
    }
  } catch (_) { /* 目錄還不存在 */ }
}

// ── HTTP handler(同步;方便測試直接呼叫)────────────────────────────────
function serveStatic(root, urlPath) {
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const normRoot = path.normalize(root);
  const file = path.normalize(path.join(normRoot, rel));
  if (file !== normRoot && !file.startsWith(normRoot.endsWith(path.sep) ? normRoot : normRoot + path.sep)) {
    return { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" }, body: "forbidden" };
  }
  let data;
  try { data = fs.readFileSync(file); } catch (_) { return { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" }, body: "not found" }; }
  return {
    status: 200,
    headers: { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" },
    body: data,
  };
}

function createHandler(ctx) {
  const { dbFile, store, projection, root } = ctx;
  const log = ctx.log || (() => {});
  const json = (status, obj) => ({
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    body: JSON.stringify(obj),
  });
  /* port 要在**每次請求時**從 ctx 讀:handler 在 listen() 之前就建好,那時 ctx.port 還是
   * null。第一版在這裡解構成常數,Host 檢查因此永遠放行 —— 是測試(T6 evil Host → 421)
   * 抓到的,不是 code review。 */
  const hostOk = (host) => {
    const port = ctx.port;
    if (port === null || port === undefined) return true;   // 尚未 listen(測試直呼 handler)
    const h = String(host || "").toLowerCase();
    return h === `127.0.0.1:${port}` || h === `localhost:${port}` || h === `[::1]:${port}`;
  };
  const kvRe = new RegExp(`^${API.replace(/[/]/g, "\\/")}\\/kv\\/([^/]+)$`);

  return function handle(req) {
    const method = String(req.method || "GET").toUpperCase();
    const headers = req.headers || {};
    let urlPath;
    try { urlPath = decodeURIComponent(String(req.url || "/").split("?")[0]); } catch (_) { return json(400, { error: "bad_url" }); }
    if (!hostOk(headers.host)) return json(421, { error: "misdirected_request", message: "只接受 127.0.0.1 / localhost 的 Host" });

    if (urlPath === `${API}/ping`) {
      return json(200, { service: SERVICE, version: VERSION, db: path.basename(dbFile), revision: store.revision(), projection: projection.status() });
    }
    if (urlPath === `${API}/kv` && method === "GET") {
      const snap = store.snapshot();
      return json(200, { revision: snap.revision, keys: snap.keys, projection: projection.status() });
    }
    if (urlPath === `${API}/status` && method === "GET") {
      return json(200, statusReport(ctx.db, dbFile, store, projection));
    }
    const m = urlPath.match(kvRe);
    if (m) {
      const key = m[1];
      if (!KEY_RE.test(key)) return json(400, { error: "bad_key" });
      if (method === "GET") {
        const v = store.get(key);
        return json(v === null ? 404 : 200, { revision: store.revision(), value: v });
      }
      let ifMatch;
      const raw = headers["if-match"];
      if (raw !== undefined && raw !== "") {
        ifMatch = Number(raw);
        if (!Number.isSafeInteger(ifMatch) || ifMatch < 0) return json(400, { error: "bad_if_match" });
      }
      const conflict = (r) => json(409, {
        error: "revision_conflict", revision: r.revision, expected: r.expected,
        message: "另一個分頁(或匯入工具)在你上次讀取之後寫過檔;這次寫入被拒絕,零寫入。",
      });
      if (method === "PUT") {
        if (typeof req.body !== "string") return json(400, { error: "body_required" });
        const r = store.put(key, req.body, ifMatch);
        if (!r.ok) { log(`PUT ${key} 409(rev ${r.revision} ≠ If-Match ${r.expected})`); return conflict(r); }
        if (PROJECTION_TRIGGER_KEYS.has(key)) projection.schedule(`put ${key}`);
        log(`PUT ${key} ${req.body.length} chars → rev ${r.revision}`);
        return json(200, { revision: r.revision });
      }
      if (method === "DELETE") {
        const r = store.del(key, ifMatch);
        if (!r.ok) { log(`DELETE ${key} 409`); return conflict(r); }
        if (PROJECTION_TRIGGER_KEYS.has(key)) projection.schedule(`delete ${key}`);
        log(`DELETE ${key} → rev ${r.revision}`);
        return json(200, { revision: r.revision });
      }
      return json(405, { error: "method_not_allowed" });
    }
    if (urlPath.startsWith(`${API}/`)) return json(404, { error: "not_found" });
    if (method !== "GET" && method !== "HEAD") return json(405, { error: "method_not_allowed" });
    return serveStatic(root, urlPath);
  };
}

// ── 狀態報表(從不印值)────────────────────────────────────────────────────
function statusReport(db, dbFile, store, projection) {
  const snap = store.snapshot();
  const keys = {};
  for (const [k, v] of Object.entries(snap.keys)) keys[k] = { chars: v.length };
  const src = projection.casesFromStore();
  const tables = {};
  try {
    const names = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'clinical_%' ORDER BY name").all().map((r) => r.name);
    for (const t of names) tables[t] = db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n;
  } catch (_) { /* 投影表還沒建 */ }
  let size = null;
  try { size = fs.statSync(dbFile).size; } catch (_) { /* */ }
  return {
    service: SERVICE, version: VERSION, db: dbFile, size_bytes: size,
    revision: snap.revision, keys,
    pointer: snap.keys[KEYS.POINTER] || null,
    cases: src.error ? null : src.cases.length,
    cases_source: src.source, cases_error: src.error || null,
    history_rows: store.historyCount(),
    projection: projection.status(),
    projection_tables: tables,
  };
}

// ── server ────────────────────────────────────────────────────────────────
function startServer(opts) {
  const dbFile = opts.dbFile;
  const root = opts.root || ROOT;
  const host = opts.host || "127.0.0.1";
  const log = opts.log || (() => {});
  const db = openDb(dbFile);
  cleanupTmp(dbFile);
  const store = createStore(db);
  const projection = createProjection(db, dbFile, store, { log, exporter: opts.exporter });
  const ctx = { db, dbFile, store, projection, root, port: null, log };
  const handle = createHandler(ctx);

  const server = http.createServer((req, res) => {
    const chunks = []; let size = 0; let tooBig = false;
    req.on("data", (c) => {
      if (tooBig) return;
      size += c.length;
      if (size > MAX_BODY) { tooBig = true; res.writeHead(413); res.end(); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      if (tooBig) return;
      const hasBody = req.method === "PUT" || req.method === "POST";
      let out;
      try {
        out = handle({ method: req.method, url: req.url, headers: req.headers, body: hasBody ? Buffer.concat(chunks).toString("utf8") : undefined });
      } catch (e) {
        log(`✗ ${req.method} ${req.url}: ${e.message}`);
        out = { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ error: "internal", message: e.message }) };
      }
      res.writeHead(out.status, out.headers);
      res.end(req.method === "HEAD" ? undefined : out.body);
    });
  });
  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(opts.port === undefined ? DEFAULT_PORT : opts.port, host, () => {
      const port = server.address().port;
      ctx.port = port;
      const url = `http://${host}:${port}/`;
      const close = () => new Promise((r) => {
        projection.dispose();   // 先取消投影排程,再關 db —— 順序反過來 timer 會撞到 finalize 過的 statement
        server.close(() => { try { db.close(); } catch (_) { /* */ } r(); });
        /* server.close() 只是不再接新連線,會等瀏覽器的 keep-alive 連線自己斷 —— 那可能是
         * 永遠(測試裡就這樣掛了五分鐘)。Ctrl+C 要立刻停,不是等 Chrome 心情好。 */
        if (server.closeAllConnections) server.closeAllConnections();
      });
      resolve({ server, db, store, projection, handle, port, url, dbFile, close });
    });
  });
}

// ── CLI ───────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const o = { db: DEFAULT_DB, port: DEFAULT_PORT, root: ROOT, open: false, status: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--db") o.db = path.resolve(argv[++i]);
    else if (a === "--port") o.port = Number(argv[++i]);
    else if (a === "--root") o.root = path.resolve(argv[++i]);
    else if (a === "--open") o.open = true;
    else if (a === "--status") o.status = true;
    else if (a === "--help" || a === "-h") o.help = true;
    else { console.error(`不認得的參數:${a}`); o.help = true; }
  }
  return o;
}

function printStatus(rep) {
  console.log(`資料庫   ${rep.db}${rep.size_bytes === null ? "(還不存在)" : `  (${(rep.size_bytes / 1024).toFixed(0)} KB)`}`);
  console.log(`revision ${rep.revision}    history ${rep.history_rows} 列`);
  const ks = Object.keys(rep.keys);
  console.log(`正本 keys ${ks.length} 個${ks.length ? ":" : "(空庫)"}`);
  for (const k of ks) console.log(`  ${k}  ${rep.keys[k].chars} chars`);
  if (rep.pointer === "v2") console.log("  ⚠ pointer=v2:app 的匯出 / 匯入仍直接讀 localStorage 的 pointer,SQLite 模式下不要跑 v2 切換流程(C2b 停用中)。");
  console.log(`病例     ${rep.cases_error ? "⛔ " + rep.cases_error : `${rep.cases} 筆(來源 ${rep.cases_source})`}`);
  const p = rep.projection;
  if (!p) console.log("投影表   尚未重建過(第一次存檔後會建)");
  else console.log(`投影表   ${p.ok ? "✓" : "⚠ 上次重建失敗"}  ${p.at}  ${p.cases ?? "?"} 筆病例  exit ${p.exit_code ?? "-"}${p.ok ? "" : "\n" + (p.summary || []).slice(-8).map((l) => "         " + l).join("\n")}`);
  const t = Object.entries(rep.projection_tables).filter(([, n]) => n > 0);
  if (t.length) console.log(`         有資料的表 ${t.length} 張:` + t.map(([k, n]) => `${k}=${n}`).join(" "));
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.help) {
    console.log("用法: node scripts/clinical-sqlite-service.js [--db <path>] [--port 8785] [--root <dir>] [--open]");
    console.log("      node scripts/clinical-sqlite-service.js --status [--db <path>]");
    process.exit(2);
  }
  if (o.status) {
    if (!fs.existsSync(o.db)) { console.log(`資料庫還不存在:${o.db}\n(啟動服務並在 app 裡存過一次檔之後才會有)`); process.exit(1); }
    const db = openDb(o.db);
    const store = createStore(db);
    const projection = createProjection(db, o.db, store, {});
    printStatus(statusReport(db, o.db, store, projection));
    db.close();
    return;
  }
  const log = (m) => console.log(`[${new Date().toLocaleTimeString()}] ${m}`);
  if (!fs.existsSync(path.join(o.root, "index.html"))) {
    console.error(`⛔ --root ${o.root} 裡沒有 index.html,這不是 app 的目錄。`);
    process.exit(2);
  }
  let svc;
  try { svc = await startServer({ dbFile: o.db, port: o.port, root: o.root, log }); }
  catch (e) {
    if (e && e.code === "EADDRINUSE") {
      console.error(`⛔ 埠 ${o.port} 已被占用 —— 很可能服務已經在另一個視窗跑著。直接開 http://127.0.0.1:${o.port}/ 即可;真的要第二個就加 --port。`);
      process.exit(1);
    }
    throw e;
  }
  const rep = statusReport(svc.db, o.db, svc.store, svc.projection);
  console.log(`\n${SERVICE} v${VERSION}`);
  console.log(`app      ${o.root}`);
  printStatus(rep);
  console.log(`\n▶ 在瀏覽器開:${svc.url}   (只有這個網址會用 SQLite;workers.dev 那個仍是 localStorage)`);
  console.log("  這個視窗要一直開著。關掉 = app 存不了檔(它會大聲說,不會靜默丟)。Ctrl+C 停止。\n");
  if (o.open && process.platform === "win32") {
    require("child_process").exec(`start "" "${svc.url}"`, () => {});
  }
  const stop = async () => {
    console.log(`\n停止中… 資料都在 ${o.db}`);
    await svc.close();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

module.exports = { openDb, createStore, createProjection, createHandler, startServer, statusReport, serveStatic, KEYS, API, SERVICE, VERSION, DEFAULT_DB, DEFAULT_PORT, HISTORY_PER_KEY };

if (require.main === module) {
  main().catch((e) => { console.error("⛔", e && e.stack || e); process.exit(1); });
}
