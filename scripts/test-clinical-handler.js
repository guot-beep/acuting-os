#!/usr/bin/env node
/**
 * test-clinical-handler.js — /__clinical/* 處理器的契約套件(Node:Request/Response + node:sqlite,不需 Cloudflare)。
 *   H1 fail-closed:Access 沒設定 → 503(帶 service 標記);token 壞 → 401(帶標記);正式主機名上 DEV_AUTH_BYPASS 無效
 *   H2 契約:ping / kv / kv/:key GET/PUT/DELETE / status 的狀態碼與 JSON 形狀 = 本機服務版
 *   H3 CSRF:寫入沒帶 X-AcuTing-Client → 403,零寫入
 *   H4 CAS:If-Match 過期 → 409 + 形狀;沒帶 If-Match → 強制
 *   H5 瀏覽器 adapter(js/clinical-sqlite-backend.js)接上這個處理器:契約 C1–C7 + install 分辨「沒登入」與「沒服務」
 *   H6 log 永不含值
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");
const { createNodeSqliteAdapter } = require("./lib/kv-node-sqlite-adapter.js");

let passed = 0;
const ok = (m) => { passed++; console.log(`  ✓ ${m}`); };
const KEY = "acuting-clinical-cases-v1";
const PROD = "https://acuting-os.guotingru.workers.dev";
const LOCAL = "http://127.0.0.1:8797";

(async () => {
  const src = (f) => pathToFileURL(path.join(__dirname, "..", "src", f)).href;
  const { createKvCore, SCHEMA_STATEMENTS } = await import(src("clinical-kv-core.mjs"));
  const { createClinicalHandler, SERVICE, CLIENT_HEADER } = await import(src("clinical-handler.mjs"));

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "acuting-handler-"));
  const logs = [];
  const mk = (over) => {
    const db = createNodeSqliteAdapter(path.join(dir, `${Math.random().toString(36).slice(2)}.db`));
    for (const sql of SCHEMA_STATEMENTS) db.raw.exec(sql);   // 測試會在任何已認證請求之前直接讀 core,先把 schema 建好
    const core = createKvCore(db, {});
    const deps = {
      core, ensureSchema: () => core.ensureSchema(),
      authConfigured: true, devBypass: false,
      verify: async (t) => (t === "GOOD" ? { ok: true, email: "guotingru@gmail.com" } : { ok: false, reason: t ? "bad_signature" : "no_token" }),
      version: "test", dbName: "t.db", environment: "test", log: (l) => logs.push(l),
      ...(over || {}),
    };
    return { handle: createClinicalHandler(deps), core, db };
  };
  const call = async (handle, origin, method, p, { body, headers } = {}) => {
    const req = new Request(origin + p, { method, body, headers });
    const res = await handle(req);
    let j = null; const text = await res.text(); try { j = JSON.parse(text); } catch (_) { /* */ }
    return { status: res.status, json: j, headers: res.headers };
  };
  const AUTH = { "cf-access-jwt-assertion": "GOOD" };
  const W = { ...AUTH, [CLIENT_HEADER]: "clinical-store", "content-type": "text/plain; charset=utf-8" };

  console.log("\nH1 fail-closed 認證");
  {
    const { handle } = mk({ authConfigured: false });
    const r = await call(handle, PROD, "GET", "/__clinical/ping");
    assert.strictEqual(r.status, 503); assert.strictEqual(r.json.service, SERVICE); assert.strictEqual(r.json.error, "auth_not_configured");
    ok("Access 沒設定 → 503,帶 service 標記(adapter 會毒丸,不會退回 localStorage)");
    const r2 = await call(handle, PROD, "PUT", "/__clinical/kv/" + KEY, { body: "[]", headers: { [CLIENT_HEADER]: "x" } });
    assert.strictEqual(r2.status, 503);
    ok("沒設定時連寫入也 503(零寫入)");
  }
  {
    const { handle, core } = mk();
    const r = await call(handle, PROD, "GET", "/__clinical/ping");
    assert.strictEqual(r.status, 401); assert.strictEqual(r.json.service, SERVICE); assert.strictEqual(r.json.error, "no_token");
    ok("沒 token → 401 + 標記");
    const r2 = await call(handle, PROD, "GET", "/__clinical/kv", { headers: { "cf-access-jwt-assertion": "BAD" } });
    assert.strictEqual(r2.status, 401); assert.strictEqual(r2.json.error, "bad_signature");
    ok("壞 token → 401,而且 JSON 裡沒有 keys");
    assert(!("keys" in r2.json));
    const r3 = await call(handle, PROD, "PUT", "/__clinical/kv/" + KEY, { body: "[]", headers: { [CLIENT_HEADER]: "x", "cf-access-jwt-assertion": "BAD" } });
    assert.strictEqual(r3.status, 401); assert.strictEqual(await core.get(KEY), null);
    ok("壞 token 的寫入 → 401,零寫入");
  }
  {
    const { handle } = mk({ devBypass: true });
    const rp = await call(handle, PROD, "GET", "/__clinical/ping");
    assert.strictEqual(rp.status, 401);
    ok("DEV_AUTH_BYPASS=1 在正式主機名上**無效**(仍 401)—— 結構保證,不靠人記得刪");
    const rl = await call(handle, LOCAL, "GET", "/__clinical/ping");
    assert.strictEqual(rl.status, 200); assert.strictEqual(rl.json.email, "dev@localhost");
    ok("同一個旁路在 127.0.0.1 上生效(本機 e2e 用)");
    const { handle: h2 } = mk({ devBypass: false });
    const rl2 = await call(h2, LOCAL, "GET", "/__clinical/ping");
    assert.strictEqual(rl2.status, 401);
    ok("沒開旁路時 127.0.0.1 也要 token");
  }

  console.log("\nH2 契約形狀");
  const { handle, core } = mk();
  {
    const r = await call(handle, PROD, "GET", "/__clinical/ping", { headers: AUTH });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.json.service, SERVICE); assert.strictEqual(r.json.backend, "d1"); assert.strictEqual(r.json.revision, 0);
    assert.strictEqual(r.json.email, "guotingru@gmail.com"); assert.strictEqual(r.json.projection, null);
    assert.strictEqual(r.headers.get("cache-control"), "no-store"); assert.strictEqual(r.headers.get("access-control-allow-origin"), null);
    ok("ping:標記 / backend d1 / revision / email / no-store / 沒有 CORS 標頭");
    const k = await call(handle, PROD, "GET", "/__clinical/kv", { headers: AUTH });
    assert.deepStrictEqual(k.json, { revision: 0, keys: {}, projection: null });
    ok("kv 快照(空)形狀 = 本機服務版");
    const g = await call(handle, PROD, "GET", "/__clinical/kv/" + KEY, { headers: AUTH });
    assert.strictEqual(g.status, 404); assert.strictEqual(g.json.value, null); assert.strictEqual(g.json.revision, 0);
    ok("GET 不存在的 key → 404 {revision, value:null}");
    const bad = await call(handle, PROD, "GET", "/__clinical/kv/" + encodeURIComponent("bad key/x"), { headers: AUTH });
    assert.strictEqual(bad.status, 400);
    ok("非法 key → 400");
    const st = await call(handle, PROD, "GET", "/__clinical/status", { headers: AUTH });
    assert.strictEqual(st.status, 200); assert.deepStrictEqual(st.json.keys, {}); assert.strictEqual(st.json.history_rows, 0);
    ok("status:只有筆數 / 長度");
    const nf = await call(handle, PROD, "GET", "/__clinical/nope", { headers: AUTH });
    assert.strictEqual(nf.status, 404);
    const mna = await call(handle, PROD, "POST", "/__clinical/kv/" + KEY, { body: "x", headers: W });
    assert.strictEqual(mna.status, 405);
    ok("未知路徑 404、POST 405");
  }

  console.log("\nH3 CSRF 標頭");
  {
    const r = await call(handle, PROD, "PUT", "/__clinical/kv/" + KEY, { body: "[]", headers: AUTH });
    assert.strictEqual(r.status, 403); assert.strictEqual(await core.get(KEY), null);
    ok("PUT 沒帶 X-AcuTing-Client → 403,零寫入");
    const d = await call(handle, PROD, "DELETE", "/__clinical/kv/" + KEY, { headers: AUTH });
    assert.strictEqual(d.status, 403);
    ok("DELETE 沒帶 → 403");
  }

  console.log("\nH4 寫入與 CAS");
  {
    const payload = JSON.stringify([{ id: "case.h", patientCode: "P-TEST", caseTitle: "中文  雙空格 \t" }], null, 2);
    const p = await call(handle, PROD, "PUT", "/__clinical/kv/" + KEY, { body: payload, headers: { ...W, "if-match": "0" } });
    assert.strictEqual(p.status, 200); assert.strictEqual(p.json.revision, 1);
    const g = await call(handle, PROD, "GET", "/__clinical/kv/" + KEY, { headers: AUTH });
    assert.strictEqual(g.json.value, payload);
    ok("PUT If-Match 0 → 200 rev 1;GET 逐位元組相同");
    const stale = await call(handle, PROD, "PUT", "/__clinical/kv/" + KEY, { body: "[]", headers: { ...W, "if-match": "0" } });
    assert.strictEqual(stale.status, 409); assert.strictEqual(stale.json.error, "revision_conflict");
    assert.strictEqual(stale.json.revision, 1); assert.strictEqual(stale.json.expected, 0); assert(/另一台裝置或分頁/.test(stale.json.message));
    assert.strictEqual(await core.get(KEY), payload);
    ok("過期 If-Match → 409 {error, revision, expected, message},值不變");
    const badIm = await call(handle, PROD, "PUT", "/__clinical/kv/" + KEY, { body: "[]", headers: { ...W, "if-match": "abc" } });
    assert.strictEqual(badIm.status, 400);
    ok("If-Match 不是整數 → 400");
    const force = await call(handle, PROD, "PUT", "/__clinical/kv/acuting-clinical-conflict-backup", { body: "{}", headers: W });
    assert.strictEqual(force.status, 200); assert.strictEqual(force.json.revision, 2);
    ok("沒帶 If-Match → 強制寫入(衝突備份用)");
    const del = await call(handle, PROD, "DELETE", "/__clinical/kv/acuting-clinical-conflict-backup", { headers: { ...W, "if-match": "2" } });
    assert.strictEqual(del.status, 200); assert.strictEqual(del.json.revision, 3);
    const snap = await call(handle, PROD, "GET", "/__clinical/kv", { headers: AUTH });
    assert.deepStrictEqual(Object.keys(snap.json.keys), [KEY]); assert.strictEqual(snap.json.revision, 3);
    ok("DELETE If-Match → 200;快照只剩主槽");
    const hist = await core.historyCount();
    assert.strictEqual(hist, 3);
    ok("history 3 筆(每次寫入一筆)");
    const forceMain = await call(handle, PROD, "PUT", "/__clinical/kv/" + KEY, { body: "[]", headers: W });
    assert.strictEqual(forceMain.status, 428); assert.strictEqual(await core.get(KEY), payload);
    ok("PUT 正本鍵沒帶 If-Match → 428,零寫入(沒讀過不准整本覆蓋)");
    const delMain = await call(handle, PROD, "DELETE", "/__clinical/kv/" + KEY, { headers: { ...W, "if-match": "3" } });
    assert.strictEqual(delMain.status, 405); assert.strictEqual(delMain.json.error, "protected_key");
    assert.strictEqual(await core.get(KEY), payload);
    ok("DELETE 正本鍵 → 405,簿子還在(要清空只能寫入 [])");
    const qs = await call(handle, PROD, "GET", "/__clinical/kv?debug=1", { headers: AUTH });
    assert.strictEqual(qs.status, 400);
    ok("帶查詢字串 → 400(資料不進 URL)");
  }

  console.log("\nH4b 內部錯誤不外洩");
  {
    const boom = mk({ core: { revision: async () => { throw new Error("D1_ERROR: near \"SELECT secret_value\": syntax error"); } } });
    const r = await call(boom.handle, PROD, "GET", "/__clinical/ping", { headers: AUTH });
    assert.strictEqual(r.status, 500); assert.strictEqual(r.json.error, "internal"); assert(r.json.ref);
    assert(!JSON.stringify(r.json).includes("secret_value"), "例外訊息洩到回應裡");
    assert(logs.some((l) => l.includes("✗ internal") && l.includes(r.json.ref)));
    ok("未預期例外 → 500 + 參照碼,回應不含例外文字,log 有參照碼可對");
  }

  console.log("\nH5 瀏覽器 adapter 接上處理器");
  {
    global.localStorage = { getItem() { throw new Error("no localStorage"); }, setItem() { throw new Error("no"); }, removeItem() { throw new Error("no"); } };
    require("../js/clinical-store.js");
    require("../js/clinical-sqlite-backend.js");
    const S = global.AcuTingClinicalStore, B = global.AcuTingClinicalSqliteBackend;
    // adapter 是同步 XHR,而 handler 是 async;這裡用預錄回應測 adapter 的**分類邏輯**
    //(401/503 帶標記 → 毒丸;宣告了卻 404 → 毒丸;沒宣告 → localStorage;200 → 裝上並帶寫入標頭)。
    // 真正的 HTTP 往返由 wrangler dev 的 e2e 覆蓋。
    const canned = (map) => (method, p, body, headers) => {
      const k = `${method} ${p}`;
      const r = map[k] || map[method] || { status: 404, text: "not found" };
      if (typeof r === "function") return r(body, headers);
      return r;
    };
    const marker = (status, extra) => ({ status, text: JSON.stringify({ service: SERVICE, backend: "d1", ...(extra || {}) }) });
    // (a) 服務在、沒登入 → 毒丸
    let r = B.install({ transport: canned({ "GET /__clinical/ping": marker(401, { error: "no_token", message: "登入無效或已過期" }) }), location: { hostname: "acuting-os.guotingru.workers.dev" }, expectService: true, onChange() {} });
    assert.strictEqual(r.installed, true); assert.strictEqual(r.poisoned, true); assert(/登入/.test(r.why), r.why);
    let threw = null; try { S.load(); } catch (e) { threw = e; } assert(threw);
    ok("ping 401 帶標記 → 毒丸(唯讀),不是退回 localStorage");
    // (b) 服務在、Access 沒設定 → 毒丸
    r = B.install({ transport: canned({ "GET /__clinical/ping": marker(503, { error: "auth_not_configured", message: "fail-closed" }) }), location: { hostname: "acuting-os.guotingru.workers.dev" }, expectService: true, onChange() {} });
    assert(r.installed && r.poisoned);
    ok("ping 503 帶標記 → 毒丸");
    // (c) 部署宣告有服務(meta)但探測不到 → 毒丸;沒宣告 → localStorage
    r = B.install({ transport: canned({ "GET /__clinical/ping": { status: 404, text: "not found" } }), location: { hostname: "acuting-os.guotingru.workers.dev" }, expectService: true, onChange() {} });
    assert(r.installed && r.poisoned && /探測不到/.test(r.why));
    ok("宣告有服務卻探測不到(404)→ 毒丸(絕不兩本簿子)");
    r = B.install({ transport: canned({ "GET /__clinical/ping": { status: 404, text: "not found" } }), location: { hostname: "acuting-os.guotingru.workers.dev" }, expectService: false, onChange() {} });
    assert.strictEqual(r.installed, false);
    ok("沒宣告服務 + 404 → 不裝(純靜態部署照舊 localStorage)");
    // (d) 正常:ping 200 → 快照 → 寫入帶 X-AcuTing-Client 與 If-Match
    let seenHeaders = null; let rev = 5;
    const store = { [KEY]: "[]" };
    const okMap = {
      "GET /__clinical/ping": marker(200, { revision: rev, email: "guotingru@gmail.com", db: "acuting-clinical" }),
      "GET /__clinical/kv": () => ({ status: 200, text: JSON.stringify({ revision: rev, keys: { ...store }, projection: null }) }),
      PUT: (body, headers) => { seenHeaders = headers; if (String(headers["If-Match"]) !== String(rev) && headers["If-Match"] !== undefined) return { status: 409, text: JSON.stringify({ error: "revision_conflict", revision: rev, expected: Number(headers["If-Match"]) }) }; rev++; return { status: 200, text: JSON.stringify({ revision: rev }) }; },
    };
    r = B.install({ transport: canned(okMap), location: { hostname: "acuting-os.guotingru.workers.dev" }, expectService: true, onChange() {} });
    assert(r.installed && !r.poisoned); assert.strictEqual(r.backend, "d1"); assert.strictEqual(r.email, "guotingru@gmail.com");
    ok("ping 200 → 裝上 D1 backend,state 帶 backend/email");
    assert.deepStrictEqual(S.load(), []);
    S.save([{ id: "case.a", patientCode: "P-1", soapNotes: [] }]);
    assert.strictEqual(seenHeaders["X-AcuTing-Client"], "clinical-store"); assert.strictEqual(seenHeaders["If-Match"], "5");
    assert.strictEqual(global.AcuTingClinicalBackend.state().revision, 6);
    ok("store.save() → PUT 帶 X-AcuTing-Client 與 If-Match,revision 跟著服務走");
    const st = global.AcuTingClinicalBackend.state();
    assert.strictEqual(st.backend, "d1"); assert.strictEqual(st.email, "guotingru@gmail.com");
    ok("state() 有 backend=d1 與 email(徽章用)");

    // (e) Access 登入過期:同步 XHR 跟著 302 到登入頁,拿回 200 + HTML —— 絕不能被當成寫入成功
    const loginPage = { status: 200, text: "<!doctype html><html><title>Cloudflare Access</title><body>Sign in</body></html>" };
    const expiredMap = { ...okMap, PUT: () => loginPage };
    B.install({ transport: canned(expiredMap), location: { hostname: "acuting-os.guotingru.workers.dev" }, expectService: true, onChange() {} });
    S.load();
    const revBefore = global.AcuTingClinicalBackend.state().revision;
    let threwExp = null;
    try { S.save([{ id: "case.expired", patientCode: "P-1", soapNotes: [] }]); } catch (e) { threwExp = e; }
    assert(threwExp && /沒有\*\*寫入|登入已過期/.test(threwExp.message), threwExp && threwExp.message);
    assert.strictEqual(global.AcuTingClinicalBackend.state().revision, revBefore);
    assert.strictEqual(global.AcuTingClinicalBackend.read(), "[]", "鏡像不得被更新成沒寫進去的內容");
    ok("寫入拿到 200 + 登入頁 HTML → 拋錯、鏡像與 revision 不變(不會把沒存到的當存到)");
  }

  console.log("\nH6 log 不含值");
  {
    const joined = logs.join("\n");
    assert(!/case\.h|P-TEST|雙空格/.test(joined), "log 裡出現了值");
    assert(/PUT acuting-clinical-cases-v1 \d+ chars → rev 1 guotingru@gmail\.com/.test(joined));
    ok("log 只有 key 名 / 長度 / revision / email");
  }

  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) { /* */ }
  console.log(`\nPASS — ${passed} 條`);
})().catch((e) => { console.error("\nFAIL —", e && e.stack || e); process.exit(1); });
