#!/usr/bin/env node
/**
 * test-passphrase-flow.js — 通行碼模式走完整條 HTTP 路徑(handler + auth-store + node:sqlite,不需 Cloudflare)。
 *
 *  F1  沒有通行證 → 每一條 /__clinical/* 都 401 auth_required,且回應帶 auth_mode:"passphrase"(前端據此跳輸入框)
 *  F2  /__clinical/auth:GET 405、缺 X-AcuTing-Client 403、通行碼錯 401、通行碼對 200 發證
 *  F3  拿到證之後讀寫都通;證被竄改 / 換秘密 / 換通行碼版本 → 401,且**零寫入**
 *  F4  失敗限流:同來源錯 8 次 → 429 + Retry-After;不同來源不受影響;打對後失敗紀錄清空
 *  F5  設定不全(只有 salt 沒有 hash)→ 503,不半套放行
 *  F6  log 與回應**永不出現通行碼**;錯誤訊息不區分「碼錯」與「沒這個帳號」之類的細節
 *  F7  DEV_AUTH_BYPASS 只在 loopback:正式主機名上就算開著也要 401
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
const PASS = "白虎湯加石膏四十克";
const SECRET = "token-secret-for-tests-abcdefgh";
const FAST = 1000;

(async () => {
  const src = (f) => pathToFileURL(path.join(__dirname, "..", "src", f)).href;
  const { createKvCore, SCHEMA_STATEMENTS } = await import(src("clinical-kv-core.mjs"));
  const { createClinicalHandler, SERVICE, CLIENT_HEADER, AUTH_HEADER } = await import(src("clinical-handler.mjs"));
  const { createAuthStore, sourceKey, AUTH_SCHEMA_STATEMENTS } = await import(src("auth-store.mjs"));
  const P = await import(src("passphrase-auth.mjs"));

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "acuting-pass-"));
  const rec = await P.makePassphraseRecord(PASS, FAST);
  const logs = [];

  function build(over) {
    const db = createNodeSqliteAdapter(path.join(dir, `${Math.random().toString(36).slice(2)}.db`));
    for (const sql of SCHEMA_STATEMENTS) db.raw.exec(sql);
    for (const sql of AUTH_SCHEMA_STATEMENTS) db.raw.exec(sql);
    const core = createKvCore(db, {});
    const store = createAuthStore(db, {});
    const cfg = { salt: rec.salt, hash: rec.hash, iterations: FAST, passVersion: 1, secret: SECRET, ...(over || {}) };
    const passphraseAuth = (cfg.salt && cfg.hash && cfg.secret) ? {
      async verifyToken(token) { return P.verifyToken(token, cfg.secret, { passVersion: cfg.passVersion }); },
      async login(passphrase, request) {
        await store.ensureSchema();
        const ip = request.headers.get("cf-connecting-ip") || "unknown";
        const source = await sourceKey(ip, cfg.secret);
        const fails = await store.recentFails(source);
        const v = P.rateLimitVerdict(fails, {});
        if (v.blocked) return { ok: false, blocked: true, retryAfterSec: v.retryAfterSec };
        if (!(await P.verifyPassphrase(passphrase, cfg))) { await store.recordFail(source); return { ok: false, blocked: false, fails: fails.length + 1 }; }
        await store.clearFails(source);
        const { token, payload } = await P.issueToken(cfg.secret, { passVersion: cfg.passVersion });
        return { ok: true, token, expires: payload.exp };
      },
    } : null;
    const handle = createClinicalHandler({
      core, ensureSchema: () => core.ensureSchema(), passphraseAuth,
      authConfigured: false, devBypass: !!(over && over.devBypass),
      verify: async () => ({ ok: false, reason: "no_token" }),
      version: "test", dbName: "t.db", environment: "test", log: (l) => logs.push(l),
    });
    return { handle, core, db, store };
  }
  const call = async (handle, origin, method, p, { body, headers } = {}) => {
    const res = await handle(new Request(origin + p, { method, body, headers }));
    const text = await res.text();
    let j = null; try { j = JSON.parse(text); } catch (_) { /* */ }
    return { status: res.status, json: j, headers: res.headers };
  };
  const W = { [CLIENT_HEADER]: "clinical-store", "content-type": "application/json; charset=utf-8" };
  const login = (h, pass, ip) => call(h, PROD, "POST", "/__clinical/auth", { body: JSON.stringify({ passphrase: pass }), headers: { ...W, ...(ip ? { "cf-connecting-ip": ip } : {}) } });

  console.log("\nF1 沒有通行證");
  {
    const { handle, core } = build();
    for (const p of ["/__clinical/ping", "/__clinical/kv", "/__clinical/status"]) {
      const r = await call(handle, PROD, "GET", p);
      assert.strictEqual(r.status, 401, p);
      assert.strictEqual(r.json.service, SERVICE);
      assert.strictEqual(r.json.error, "auth_required");
      assert.strictEqual(r.json.auth_mode, "passphrase");
      assert(!("keys" in r.json) && !("value" in r.json), "401 的回應不得帶資料");
    }
    ok("ping / kv / status 全 401 auth_required,帶 service 標記與 auth_mode(前端據此跳輸入框)");
    const w = await call(handle, PROD, "PUT", "/__clinical/kv/" + KEY, { body: "[]", headers: W });
    assert.strictEqual(w.status, 401); assert.strictEqual(await core.get(KEY), null);
    ok("沒有證的寫入 → 401,零寫入");
  }

  console.log("\nF2 /__clinical/auth");
  {
    const { handle } = build();
    assert.strictEqual((await call(handle, PROD, "GET", "/__clinical/auth")).status, 405);
    ok("GET → 405");
    const noHdr = await call(handle, PROD, "POST", "/__clinical/auth", { body: JSON.stringify({ passphrase: PASS }), headers: { "content-type": "application/json" } });
    assert.strictEqual(noHdr.status, 403); assert.strictEqual(noHdr.json.error, "client_header_required");
    ok("缺 X-AcuTing-Client → 403(擋跨站送出的表單)");
    for (const [label, body] of [["空 body", ""], ["不是 JSON", "abc"], ["沒有 passphrase 欄位", "{}"], ["passphrase 不是字串", '{"passphrase":123}']]) {
      const r = await call(handle, PROD, "POST", "/__clinical/auth", { body, headers: W });
      assert.strictEqual(r.status, 401, label); assert.strictEqual(r.json.error, "auth_invalid");
      ok(`${label} → 401 auth_invalid(不當機、不洩漏細節)`);
    }
    const wrong = await login(handle, PASS + "x");
    assert.strictEqual(wrong.status, 401); assert.strictEqual(wrong.json.message, "通行碼不對。");
    ok("通行碼錯 → 401,訊息只有一句「通行碼不對」");
    const good = await login(handle, PASS);
    assert.strictEqual(good.status, 200);
    assert(typeof good.json.token === "string" && good.json.token.length > 20);
    assert(Number.isSafeInteger(good.json.expires) && good.json.expires > Math.floor(Date.now() / 1000));
    assert(!good.json.token.includes(PASS));
    ok("通行碼對 → 200 發證,證裡不含通行碼");
    const norm = await login(handle, "　" + PASS + "  ");
    assert.strictEqual(norm.status, 200);
    ok("前後有全形/半形空白也算對(手機鍵盤常見)");
  }

  console.log("\nF3 帶證之後");
  {
    const { handle, core } = build();
    const token = (await login(handle, PASS)).json.token;
    const A = { [AUTH_HEADER]: token };
    const ping = await call(handle, PROD, "GET", "/__clinical/ping", { headers: A });
    assert.strictEqual(ping.status, 200); assert.strictEqual(ping.json.backend, "d1");
    ok("帶證 → ping 200");
    const payload = JSON.stringify([{ id: "case.p", patientCode: "P-1", soapNotes: [] }], null, 2);
    const put = await call(handle, PROD, "PUT", "/__clinical/kv/" + KEY, { body: payload, headers: { ...W, ...A, "if-match": "0" } });
    assert.strictEqual(put.status, 200);
    assert.strictEqual((await call(handle, PROD, "GET", "/__clinical/kv/" + KEY, { headers: A })).json.value, payload);
    ok("帶證 → 寫入與讀回逐位元組相同");
    const [b, s] = token.split(".");
    const tampered = `${b}.${s.slice(0, -2)}${s.slice(-2) === "AA" ? "BB" : "AA"}`;
    const bad = await call(handle, PROD, "PUT", "/__clinical/kv/" + KEY, { body: "[]", headers: { ...W, [AUTH_HEADER]: tampered, "if-match": "1" } });
    assert.strictEqual(bad.status, 401); assert.strictEqual(bad.json.error, "auth_invalid");
    assert.strictEqual(await core.get(KEY), payload);
    ok("竄改過的證 → 401,值不變(零寫入)");
    const other = build({ secret: "different-secret-aaaaaaaaaaaaaa" });
    assert.strictEqual((await call(other.handle, PROD, "GET", "/__clinical/ping", { headers: A })).status, 401);
    ok("換一個伺服器秘密 → 舊證失效");
    const rotated = build({ passVersion: 2 });
    assert.strictEqual((await call(rotated.handle, PROD, "GET", "/__clinical/ping", { headers: A })).status, 401);
    ok("換過通行碼(版本 +1)→ 舊證全部失效(不必逐台清)");
  }

  console.log("\nF4 失敗限流");
  {
    const { handle, store } = build();
    const IP = "203.0.113.9";
    for (let i = 0; i < 8; i++) {
      const r = await login(handle, "錯的通行碼一二三四五", IP);
      assert.strictEqual(r.status, 401, `第 ${i + 1} 次`);
    }
    const blocked = await login(handle, "錯的通行碼一二三四五", IP);
    assert.strictEqual(blocked.status, 429);
    assert(Number(blocked.headers.get("Retry-After")) > 0);
    assert(/分鐘/.test(blocked.json.message));
    ok("同來源錯 8 次 → 第 9 次 429 + Retry-After");
    const evenCorrect = await login(handle, PASS, IP);
    assert.strictEqual(evenCorrect.status, 429);
    ok("鎖住期間就算打對也不放行(否則限流可被暴力繞過)");
    const otherIp = await login(handle, PASS, "198.51.100.7");
    assert.strictEqual(otherIp.status, 200);
    ok("另一個來源不受影響(不會因為別人亂試就把自己鎖在外面)");
    const rows = await store.stats();
    assert(rows.rows >= 8);
    const s2 = await sourceKey("198.51.100.7", SECRET);
    assert.strictEqual((await store.recentFails(s2)).length, 0);
    ok("打對的來源失敗紀錄被清空");
    const raw = JSON.stringify(await (async () => { const all = await store.recentFails(await sourceKey(IP, SECRET)); return all; })());
    assert(!raw.includes("203.0.113.9"), "IP 原文不得落地");
    ok("紀錄裡沒有 IP 原文(存的是 HMAC 前 16 hex)");
  }

  console.log("\nF5 設定不全 → 503");
  {
    const { handle, core } = build({ hash: "" });
    const r = await call(handle, PROD, "GET", "/__clinical/ping");
    assert.strictEqual(r.status, 503); assert.strictEqual(r.json.error, "auth_not_configured");
    ok("只有 salt 沒有 hash → 503(fail closed,不半套放行)");
    const w = await call(handle, PROD, "PUT", "/__clinical/kv/" + KEY, { body: "[]", headers: W });
    assert.strictEqual(w.status, 503); assert.strictEqual(await core.get(KEY), null);
    ok("設定不全時寫入也 503,零寫入");
    const a = await call(handle, PROD, "POST", "/__clinical/auth", { body: JSON.stringify({ passphrase: PASS }), headers: W });
    assert.strictEqual(a.status, 503);
    ok("設定不全時 /auth 也不受理");
  }

  console.log("\nF6 通行碼不進 log、不進回應");
  {
    const joined = logs.join("\n");
    assert(!joined.includes(PASS), "log 裡出現了通行碼");
    assert(!joined.includes(SECRET), "log 裡出現了伺服器秘密");
    ok("log 不含通行碼、不含伺服器秘密");
    assert(/POST auth 200/.test(joined) && /POST auth 401/.test(joined) && /POST auth 429/.test(joined));
    ok("log 有記成功/失敗/被鎖三種事件(可事後查有沒有人在猜)");
  }

  console.log("\nF7 開發旁路只在 loopback");
  {
    const { handle } = build({ devBypass: true });
    assert.strictEqual((await call(handle, PROD, "GET", "/__clinical/ping")).status, 401);
    ok("正式主機名上就算 DEV_AUTH_BYPASS=1 也要 401");
    assert.strictEqual((await call(handle, LOCAL, "GET", "/__clinical/ping")).status, 200);
    ok("127.0.0.1 上旁路生效(本機 e2e 用)");
  }

  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) { /* */ }
  console.log(`\nPASS — ${passed} 條`);
})().catch((e) => { console.error("\nFAIL —", e && e.stack || e); process.exit(1); });
