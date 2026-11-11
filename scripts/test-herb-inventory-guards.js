#!/usr/bin/env node
/**
 * test-herb-inventory-guards.js — 藥櫃帳在「儲存層」的三道保護(2026-11-11 全系統掃描補的)。
 * 走真的 handler(通行碼模式)+ auth-store + node:sqlite,再用真的 HTTP 跑備份腳本;不需 Cloudflare。資料全是虛構的。
 *
 *  G1  藥櫃鍵是保護鍵:沒帶 If-Match 的寫入 428、DELETE 405,而且雲端內容原封不動
 *  G2  衝突備份槽分開:藥櫃的 409 不會蓋掉病例的衝突備份(原本共用一格,後寫的贏)
 *  G3  備份腳本(scripts/pull-clinical-from-d1.js):
 *        用通行碼(環境變數)登入 → 病例與藥櫃都寫到站外;輸出與檔名不含通行碼
 *        通行碼錯 / 沒給 → exit 1、一個檔都不寫
 *        (這支在 2026-09-06 正式站改通行碼之後只會帶 Access token,每次 401 —— 等於沒有站外備份)
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { pathToFileURL } = require("url");
const { createNodeSqliteAdapter } = require("./lib/kv-node-sqlite-adapter.js");

let passed = 0;
const ok = (m) => { passed++; console.log(`  ✓ ${m}`); };
const CASES_KEY = "acuting-clinical-cases-v1";
const INV_KEY = "acuting-herb-inventory-v1";
const PASS = "虛構通行碼白虎湯四十克";
const SECRET = "token-secret-for-tests-abcdefgh";
const FAST = 1000;

(async () => {
  const src = (f) => pathToFileURL(path.join(__dirname, "..", "src", f)).href;
  const { createKvCore, SCHEMA_STATEMENTS } = await import(src("clinical-kv-core.mjs"));
  const { createClinicalHandler, CLIENT_HEADER, AUTH_HEADER, PROTECTED_KEYS } = await import(src("clinical-handler.mjs"));
  const { createAuthStore, sourceKey, AUTH_SCHEMA_STATEMENTS } = await import(src("auth-store.mjs"));
  const P = await import(src("passphrase-auth.mjs"));
  const H = require("../js/herb-inventory.js");

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "acuting-invguard-"));
  const rec = await P.makePassphraseRecord(PASS, FAST);
  const db = createNodeSqliteAdapter(path.join(dir, "t.db"));
  for (const sql of SCHEMA_STATEMENTS) db.raw.exec(sql);
  for (const sql of AUTH_SCHEMA_STATEMENTS) db.raw.exec(sql);
  const core = createKvCore(db, {});
  const store = createAuthStore(db, {});
  const cfg = { salt: rec.salt, hash: rec.hash, iterations: FAST, passVersion: 1, secret: SECRET };
  const passphraseAuth = {
    async verifyToken(token) { return P.verifyToken(token, cfg.secret, { passVersion: cfg.passVersion }); },
    async login(passphrase, request) {
      await store.ensureSchema();
      const source = await sourceKey(request.headers.get("cf-connecting-ip") || "unknown", cfg.secret);
      const fails = await store.recentFails(source);
      const v = P.rateLimitVerdict(fails, {});
      if (v.blocked) return { ok: false, blocked: true, retryAfterSec: v.retryAfterSec };
      if (!(await P.verifyPassphrase(passphrase, cfg))) { await store.recordFail(source); return { ok: false, blocked: false, fails: fails.length + 1 }; }
      await store.clearFails(source);
      const { token, payload } = await P.issueToken(cfg.secret, { passVersion: cfg.passVersion });
      return { ok: true, token, expires: payload.exp };
    },
  };
  const logs = [];
  const handle = createClinicalHandler({
    core, ensureSchema: () => core.ensureSchema(), passphraseAuth, authConfigured: false, devBypass: false,
    verify: async () => ({ ok: false, reason: "no_token" }), version: "test", dbName: "t.db", environment: "test", log: (l) => logs.push(l),
  });

  // 真的 HTTP(備份腳本是另一個程序,只能走網路)
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const r = await handle(new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers: req.headers, body: req.method === "GET" || req.method === "HEAD" ? undefined : body }));
    res.writeHead(r.status, Object.fromEntries(r.headers.entries()));
    res.end(Buffer.from(await r.arrayBuffer()));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const BASE = `http://127.0.0.1:${server.address().port}`;
  const call = async (method, p, { body, headers } = {}) => {
    const res = await fetch(BASE + p, { method, body, headers });
    const text = await res.text();
    let j = null; try { j = JSON.parse(text); } catch (_) { /* */ }
    return { status: res.status, json: j };
  };

  try {
    const login = await call("POST", "/__clinical/auth", { body: JSON.stringify({ passphrase: PASS }), headers: { [CLIENT_HEADER]: "test", "Content-Type": "application/json" } });
    assert.strictEqual(login.status, 200);
    const AUTH = { [AUTH_HEADER]: login.json.token, [CLIENT_HEADER]: "test" };
    const rev = async () => (await call("GET", "/__clinical/ping", { headers: AUTH })).json.revision;

    // 虛構資料
    let n = 0; const id = (p) => `${p}.${++n}`;
    let inv = H.emptyData();
    inv.products.push({ id: "p.x", nameZh: "虛構方", kind: "formula", form: "granule", brand: "虛構牌", packageG: 100 });
    inv = H.normalize(inv);
    inv = H.receiveLot(inv, { productId: "p.x", gramsInit: 100, price: 20, expiry: "2028-01-31", purchaseDate: "2026-10-01" }, id).data;
    inv = H.prescribe(inv, { date: "2026-11-01", patientCode: "ZZZ", condition: "虛構病症", items: [{ productId: "p.x", gpd: 6, days: 7 }] }, id).data;
    const invRaw = JSON.stringify(inv);
    const casesRaw = JSON.stringify([{ id: "case.fake1", patientCode: "P-FAKE-001", caseTitle: "虛構", soapNotes: [] }]);
    assert.strictEqual((await call("PUT", `/__clinical/kv/${CASES_KEY}`, { body: casesRaw, headers: { ...AUTH, "If-Match": String(await rev()) } })).status, 200);
    assert.strictEqual((await call("PUT", `/__clinical/kv/${INV_KEY}`, { body: invRaw, headers: { ...AUTH, "If-Match": String(await rev()) } })).status, 200);

    console.log("\nG1 藥櫃鍵是保護鍵");
    {
      assert.ok(PROTECTED_KEYS.has(INV_KEY));
      const blind = await call("PUT", `/__clinical/kv/${INV_KEY}`, { body: JSON.stringify(H.emptyData()), headers: AUTH });
      assert.strictEqual(blind.status, 428, "沒帶 If-Match 的整本覆蓋應 428");
      ok("沒帶 If-Match 的寫入 → 428(不能沒讀就整本覆蓋)");
      const del = await call("DELETE", `/__clinical/kv/${INV_KEY}`, { headers: { ...AUTH, "If-Match": String(await rev()) } });
      assert.strictEqual(del.status, 405, "DELETE 應 405");
      ok("DELETE → 405(整本帳不能一鍵刪掉)");
      assert.strictEqual((await call("GET", `/__clinical/kv/${INV_KEY}`, { headers: AUTH })).json.value, invRaw);
      ok("兩次被拒之後,雲端的藥櫃內容逐位元組不變");
      const stale = await call("PUT", `/__clinical/kv/${INV_KEY}`, { body: "{}", headers: { ...AUTH, "If-Match": "0" } });
      assert.strictEqual(stale.status, 409);
      ok("帶舊 revision → 409(樂觀鎖照常)");
    }

    console.log("\nG2 衝突備份槽分開");
    {
      require("../js/clinical-sqlite-backend.js");
      const B = global.AcuTingClinicalSqliteBackend;
      // adapter 的 transport 是同步的;這裡直接對 core 的同一個 SQLite 檔做同步模擬不可行(handler 是 async),
      // 所以用一個照 handler 規則回應的同步假服務:只驗 adapter「把被拒的內容存到哪一格」。
      const kv = new Map(); let r = 1;
      const transport = (method, p, body, headers) => {
        const key = decodeURIComponent(p.split("/kv/")[1] || "");
        if (method === "GET" && p.endsWith("/kv")) return { status: 200, text: JSON.stringify({ revision: r, keys: Object.fromEntries(kv) }) };
        if (method === "PUT") {
          const im = headers["If-Match"];
          if (im !== undefined && Number(im) !== r) return { status: 409, text: JSON.stringify({ error: "revision_conflict", revision: r, expected: Number(im) }) };
          kv.set(key, String(body)); r++;
          return { status: 200, text: JSON.stringify({ revision: r }) };
        }
        return { status: 404, text: "{}" };
      };
      const a = B.makeBackend(transport, {}); a.refresh();
      const b = B.makeBackend(transport, {}); b.refresh();
      a.writeKey(CASES_KEY, "[]");                                         // a 先寫,b 的 revision 過期
      assert.throws(() => b.write(JSON.stringify([{ id: "case.rejected" }])), /拒絕寫入/);
      const caseStash = kv.get("acuting-clinical-conflict-backup");
      assert.ok(caseStash && JSON.parse(caseStash).cases[0].id === "case.rejected");
      ok("病例被拒 → 內容在 acuting-clinical-conflict-backup");
      a.markStale(); a.writeKey(INV_KEY, "{\"v\":1}");                       // a 再寫藥櫃
      assert.throws(() => b.writeKey(INV_KEY, "{\"v\":\"rejected\"}"), /拒絕寫入.*acuting-herb-inventory-v1-conflict-backup/s);
      assert.strictEqual(JSON.parse(kv.get(`${INV_KEY}-conflict-backup`)).raw, "{\"v\":\"rejected\"}");
      ok("藥櫃被拒 → 內容在 acuting-herb-inventory-v1-conflict-backup,錯誤訊息講的是這一格");
      assert.strictEqual(kv.get("acuting-clinical-conflict-backup"), caseStash);
      ok("病例的衝突備份沒有被藥櫃那一次蓋掉(逐位元組相同)");
    }

    console.log("\nG3 備份腳本:通行碼登入 + 藥櫃一起備份");
    {
      const script = path.join(__dirname, "pull-clinical-from-d1.js");
      // 不能用 spawnSync:服務就開在這個程序裡,同步等子程序會把自己的 event loop 卡死(子程序永遠連不上)。
      const run = (env, outDir) => new Promise((resolve) => {
        const c = spawn(process.execPath, [script, "--url", BASE, "--out", outDir],
          { env: { ...process.env, CF_ACCESS_CLIENT_ID: "", CF_ACCESS_CLIENT_SECRET: "", ACUTING_CLINICAL_PASSPHRASE: "", ...env } });
        let stdout = "", stderr = "";
        c.stdout.on("data", (d) => { stdout += d; }); c.stderr.on("data", (d) => { stderr += d; });
        c.on("close", (status) => resolve({ status, stdout, stderr }));
      });
      const outNone = path.join(dir, "out-none");
      const none = await run({}, outNone);
      assert.strictEqual(none.status, 1);
      assert.ok(/ACUTING_CLINICAL_PASSPHRASE/.test(none.stderr), "沒給通行碼要講清楚缺哪個環境變數");
      assert.ok(!fs.existsSync(outNone) || fs.readdirSync(outNone).length === 0);
      ok("沒給通行碼 → exit 1、說明缺 ACUTING_CLINICAL_PASSPHRASE、零寫入");

      const outBad = path.join(dir, "out-bad");
      const bad = await run({ ACUTING_CLINICAL_PASSPHRASE: "不是這個通行碼不是這個" }, outBad);
      assert.strictEqual(bad.status, 1);
      assert.ok(/通行碼不對/.test(bad.stderr));
      assert.ok(!fs.existsSync(outBad) || fs.readdirSync(outBad).length === 0);
      ok("通行碼錯 → exit 1、零寫入");

      const outOk = path.join(dir, "out-ok");
      const good = await run({ ACUTING_CLINICAL_PASSPHRASE: PASS }, outOk);
      assert.strictEqual(good.status, 0, good.stderr + good.stdout);
      const files = fs.readdirSync(outOk);
      const caseFile = files.find((f) => /^acuting-clinical-d1-.*\.json$/.test(f));
      const invFile = files.find((f) => /^acuting-herb-inventory-d1-.*\.json$/.test(f));
      assert.ok(caseFile && invFile, "病例與藥櫃兩個備份檔都要在:" + files.join(","));
      const env = JSON.parse(fs.readFileSync(path.join(outOk, caseFile), "utf8"));
      assert.strictEqual(env.case_count, 1); assert.strictEqual(env.cases[0].id, "case.fake1");
      ok("通行碼對 → 病例備份寫出(1 筆,內容相符)");
      const back = JSON.parse(fs.readFileSync(path.join(outOk, invFile), "utf8"));
      assert.deepStrictEqual(back, JSON.parse(invRaw), "藥櫃備份應與雲端那本逐欄相同(不經任何轉換)");
      assert.strictEqual(H.normalize(back).rx.length, 1);
      ok("藥櫃備份寫出,讀回來與雲端那本完全相同(品項 1、批次 1、開方 1)");
      const all = good.stdout + good.stderr + files.join(" ");
      assert.ok(!all.includes(PASS) && !all.includes(login.json.token) && !/ZZZ|虛構病症/.test(good.stdout + good.stderr));
      ok("輸出與檔名不含通行碼、通行證,螢幕只印筆數不印內容");
    }
    console.log(`\nPASS — ${passed} 條`);
  } finally {
    server.close();
    if (typeof server.closeAllConnections === "function") server.closeAllConnections();   // keep-alive 連線會讓程序不退出
    try { db.raw.close(); } catch (_) { /* */ }
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) { /* */ }
  }
})().catch((e) => { console.error("FAIL —", e && e.stack || e); process.exit(1); });
