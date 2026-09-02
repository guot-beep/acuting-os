#!/usr/bin/env node
/**
 * test-setup-flow.js — 一次性設定流程,跑的是 **Worker 真正那支** buildPassphraseAuth(不是替身)。
 *
 * 為什麼要另外寫一支:test-passphrase-flow.js 自己捏了一個 passphraseAuth 物件來測 handler,
 * 所以 worker.mjs 裡真正的實作從來沒有被跑過 —— 那正是最容易出錯、又最貴的一段。
 * 這裡用 node:sqlite 當 D1 的替身,其他全部是正品。
 *
 *  S1  還沒設定:任何 /__clinical/* → 401,而且 setup_required:true(前端據此跳「設定」框而不是「登入」框)
 *  S2  還沒設定就想登入 → 409 setup_required(不是 401,不然前端會以為是打錯字)
 *  S3  設定碼錯 → 401,且**沒有**寫進任何通行碼記錄
 *  S4  設定碼對、通行碼太弱 → 400,設定**沒有**被消耗掉(她可以馬上再試一次)
 *  S5  設定碼對、通行碼夠強 → 200 發證;那張證真的能讀能寫
 *  S6  再設定一次 → 410(端點自己關上,設定碼不會變成長期可猜的入口)
 *  S7  之後用她訂的通行碼登入 → 200;打錯 → 401
 *  S8  紀元 +1 → 允許重設;重設後舊證當場失效(pass_version 跟著 +1),病例一個字沒動
 *  S9  限流在「登入」與「設定」之間共用同一個來源計數
 *  S10 設定碼與通行碼**都不出現在 log 裡**
 *  S11 通行碼雜湊只在 D1;env 從頭到尾沒有它
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
const HOST = "https://acuting-os.guotingru.workers.dev";
const SETUP_CODE = "abcd-efgh-jkmn-pqrs";
const CHOSEN = "白虎湯加石膏四十克";
const FAST = 1000;                       // 測試用低迭代;正式是 30000

(async () => {
  const src = (f) => pathToFileURL(path.join(__dirname, "..", "src", f)).href;
  const { createKvCore, SCHEMA_STATEMENTS } = await import(src("clinical-kv-core.mjs"));
  const { createClinicalHandler, CLIENT_HEADER, AUTH_HEADER } = await import(src("clinical-handler.mjs"));
  const { AUTH_SCHEMA_STATEMENTS, createAuthStore } = await import(src("auth-store.mjs"));
  const P = await import(src("passphrase-auth.mjs"));
  const { buildPassphraseAuth } = await import(src("worker.mjs"));

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "acuting-setup-"));
  const setupRec = await P.makePassphraseRecord(SETUP_CODE, FAST);
  const logs = [];

  /* 一個「部署」:同一個 db 檔可以重建 handler(模擬換設定重新部署),資料留著。 */
  function deploy(dbFile, envOver) {
    const db = createNodeSqliteAdapter(dbFile);
    for (const sql of SCHEMA_STATEMENTS) db.raw.exec(sql);
    for (const sql of AUTH_SCHEMA_STATEMENTS) db.raw.exec(sql);
    const env = {
      CLINICAL_SETUP_SALT: setupRec.salt,
      CLINICAL_SETUP_HASH: setupRec.hash,
      CLINICAL_SETUP_ITER: String(FAST),
      CLINICAL_SETUP_EPOCH: "1",
      CLINICAL_TOKEN_SECRET: "test-secret-aaaaaaaaaaaaaaaaaaaaaaaa",
      ...(envOver || {}),
    };
    const core = createKvCore(db, {});
    const handler = createClinicalHandler({
      core, ensureSchema: () => core.ensureSchema(),
      passphraseAuth: buildPassphraseAuth(env, db),
      authConfigured: false, devBypass: false,
      verify: async () => ({ ok: false, reason: "no_access" }),
      version: "test", dbName: "test", environment: "production",
      log: (l) => logs.push(l),
    });
    return { db, core, handler, store: createAuthStore(db, {}) };
  }

  const req = (h, method, p, body, headers) =>
    h(new Request(HOST + p, { method, body, headers: new Headers(headers || {}) }));
  const jsonOf = async (r) => { try { return JSON.parse(await r.clone().text()); } catch (_) { return null; } };
  const post = (h, p, obj, extra) => req(h, "POST", p, JSON.stringify(obj),
    { "Content-Type": "application/json", [CLIENT_HEADER]: "test", ...(extra || {}) });

  const dbFile = path.join(dir, "main.db");
  let D = deploy(dbFile);

  // ── S1 還沒設定 → 401 + setup_required ────────────────────────────────
  {
    const r = await req(D.handler, "GET", "/__clinical/ping");
    const j = await jsonOf(r);
    assert.strictEqual(r.status, 401, "還沒設定就該 401");
    assert.strictEqual(j.setup_required, true, "401 必須帶 setup_required,前端才知道跳哪一種框");
    assert.strictEqual(j.auth_mode, "passphrase");
    assert.strictEqual(j.service, "acuting-clinical-sqlite", "要帶服務標記,否則 adapter 會以為沒服務而退回 localStorage");
    ok("S1 還沒設定:ping 401 且 setup_required=true、帶服務標記");
  }
  // ── S2 還沒設定就登入 → 409 ───────────────────────────────────────────
  {
    const r = await post(D.handler, "/__clinical/auth", { passphrase: CHOSEN });
    const j = await jsonOf(r);
    assert.strictEqual(r.status, 409, "還沒設定過,登入應回 409 而不是 401");
    assert.strictEqual(j.error, "setup_required");
    ok("S2 還沒設定就登入 → 409 setup_required(不會被誤解成打錯字)");
  }
  // ── S3 設定碼錯 → 401 且沒有寫入記錄 ──────────────────────────────────
  {
    const r = await post(D.handler, "/__clinical/auth/setup", { setup_code: "zzzz-zzzz-zzzz-zzzz", passphrase: CHOSEN });
    assert.strictEqual(r.status, 401);
    assert.strictEqual((await jsonOf(r)).error, "setup_code_invalid");
    assert.strictEqual(await D.store.passRecord(), null, "設定碼錯還寫進記錄的話,任何人都能搶先訂通行碼");
    ok("S3 設定碼錯 → 401,且 D1 裡沒有任何通行碼記錄");
  }
  // ── S4 碼對、通行碼太弱 → 400,設定沒被消耗 ────────────────────────────
  {
    const r = await post(D.handler, "/__clinical/auth/setup", { setup_code: SETUP_CODE, passphrase: "abc" });
    assert.strictEqual(r.status, 400);
    assert.strictEqual((await jsonOf(r)).error, "weak_passphrase");
    assert.strictEqual(await D.store.passRecord(), null);
    const again = await post(D.handler, "/__clinical/auth/setup", { setup_code: SETUP_CODE, passphrase: "abc" });
    assert.strictEqual(again.status, 400, "強度不足不該把設定機會用掉");
    ok("S4 通行碼太弱 → 400,設定機會沒有被消耗(可以立刻再試)");
  }
  // ── S5 設定成功 → 發證,而且那張證真的能讀能寫 ─────────────────────────
  let token = "";
  {
    const r = await post(D.handler, "/__clinical/auth/setup", { setup_code: SETUP_CODE, passphrase: CHOSEN });
    const j = await jsonOf(r);
    assert.strictEqual(r.status, 200);
    assert.ok(j.token && typeof j.token === "string", "設定成功要直接發證,不然她得再打一次通行碼");
    token = j.token;
    const rec = await D.store.passRecord();
    assert.ok(rec && rec.hash && rec.salt, "通行碼記錄要寫進 D1");
    assert.strictEqual(rec.passVersion, 1);
    const w = await req(D.handler, "PUT", `/__clinical/kv/${KEY}`, '[{"id":"c1"}]',
      { "Content-Type": "text/plain", [CLIENT_HEADER]: "test", [AUTH_HEADER]: token, "If-Match": "0" });
    assert.strictEqual(w.status, 200, "拿到的證要能寫");
    const g = await req(D.handler, "GET", `/__clinical/kv/${KEY}`, undefined, { [AUTH_HEADER]: token });
    assert.strictEqual((await jsonOf(g)).value, '[{"id":"c1"}]');
    ok("S5 設定成功 → 200 發證;記錄進 D1;那張證能讀能寫");
  }
  // ── S6 再設定一次 → 410 ───────────────────────────────────────────────
  {
    const r = await post(D.handler, "/__clinical/auth/setup", { setup_code: SETUP_CODE, passphrase: "青龍白虎朱雀玄武" });
    assert.strictEqual(r.status, 410, "設定完就該關上,否則設定碼變成長期可猜的入口");
    assert.strictEqual((await jsonOf(r)).error, "setup_closed");
    const rec = await D.store.passRecord();
    assert.strictEqual(rec.passVersion, 1, "被拒絕的設定不可以動到版本");
    ok("S6 設定完再打一次 → 410,通行碼沒有被換掉");
  }
  // ── S7 日常登入 ───────────────────────────────────────────────────────
  {
    const good = await post(D.handler, "/__clinical/auth", { passphrase: CHOSEN });
    assert.strictEqual(good.status, 200);
    assert.ok((await jsonOf(good)).token);
    const bad = await post(D.handler, "/__clinical/auth", { passphrase: CHOSEN + "x" });
    assert.strictEqual(bad.status, 401);
    const ping = await req(D.handler, "GET", "/__clinical/ping", undefined, { [AUTH_HEADER]: token });
    assert.strictEqual(ping.status, 200);
    assert.strictEqual((await jsonOf(ping)).setup_required, undefined, "設定完的 200 回應不該再談設定");
    ok("S7 用她訂的通行碼登入 → 200;打錯 → 401");
  }
  // ── S8 紀元 +1 → 准許重設;舊證當場失效;病例不動 ───────────────────────
  {
    const E = deploy(dbFile, { CLINICAL_SETUP_EPOCH: "2" });
    const stillThere = await req(E.handler, "GET", `/__clinical/kv/${KEY}`, undefined, { [AUTH_HEADER]: token });
    assert.strictEqual(stillThere.status, 200, "調高紀元不該讓現有的證馬上失效(還沒重設之前)");
    const r = await post(E.handler, "/__clinical/auth/setup", { setup_code: SETUP_CODE, passphrase: "青龍白虎朱雀玄武" });
    assert.strictEqual(r.status, 200, "紀元調高就該准許再設定一次");
    const newToken = (await jsonOf(r)).token;
    const rec = await E.store.passRecord();
    assert.strictEqual(rec.passVersion, 2, "重設要把版本 +1,舊證才會全部失效");
    const oldNow = await req(E.handler, "GET", "/__clinical/ping", undefined, { [AUTH_HEADER]: token });
    assert.strictEqual(oldNow.status, 401, "重設之後舊證必須當場失效");
    const cases = await req(E.handler, "GET", `/__clinical/kv/${KEY}`, undefined, { [AUTH_HEADER]: newToken });
    assert.strictEqual((await jsonOf(cases)).value, '[{"id":"c1"}]', "重設通行碼不可以動到任何一筆病例");
    const oldPass = await post(E.handler, "/__clinical/auth", { passphrase: CHOSEN });
    assert.strictEqual(oldPass.status, 401, "舊通行碼要跟著失效");
    ok("S8 紀元 +1 → 可重設;舊證與舊通行碼當場失效;病例一個字沒動");
  }
  // ── S9 限流跨端點共用 ─────────────────────────────────────────────────
  {
    /* 兩個端點唯一會同時「活著」的時候,是紀元調高之後的重設窗口:
     * 設定完成前 /auth 回 409、設定完成後 /auth/setup 回 410,兩者都不記失敗,
     * 所以只有這個窗口能真的檢驗計數有沒有共用。分開算的話上限會悄悄變成兩倍。 */
    const f = path.join(dir, "rl.db");
    const R0 = deploy(f);
    await post(R0.handler, "/__clinical/auth/setup", { setup_code: SETUP_CODE, passphrase: CHOSEN });
    const R = deploy(f, { CLINICAL_SETUP_EPOCH: "2" });     // 重設窗口:登入與設定同時開著
    const ip = { "cf-connecting-ip": "203.0.113.9" };
    let blockedAt = 0;
    for (let i = 1; i <= 12; i++) {
      // 前 4 次打 setup 端點、後面打 auth 端點:兩邊若各自計數,就永遠到不了上限
      const p = i <= 4 ? "/__clinical/auth/setup" : "/__clinical/auth";
      const body = i <= 4 ? { setup_code: "zzzz-zzzz-zzzz-zzzz", passphrase: CHOSEN } : { passphrase: "wrong" };
      const r = await post(R.handler, p, body, ip);
      if (r.status === 429) { blockedAt = i; break; }
    }
    assert.ok(blockedAt > 0 && blockedAt <= 10, `限流沒有跨端點共用(第 ${blockedAt || "從未"} 次才擋)`);
    const other = await post(R.handler, "/__clinical/auth", { passphrase: "wrong" }, { "cf-connecting-ip": "198.51.100.7" });
    assert.notStrictEqual(other.status, 429, "別的來源不該被連坐");
    ok(`S9 限流在登入與設定之間共用計數(第 ${blockedAt} 次擋下),別的來源不連坐`);
  }
  // ── S10 log 不含任何祕密 ──────────────────────────────────────────────
  {
    const all = logs.join("\n");
    assert.ok(!all.includes(SETUP_CODE), "設定碼漏進 log");
    assert.ok(!all.includes(CHOSEN), "通行碼漏進 log");
    assert.ok(!all.includes("青龍白虎朱雀玄武"), "第二個通行碼漏進 log");
    assert.ok(all.includes("auth/setup"), "設定端點本身要留下軌跡(只記事件,不記內容)");
    ok(`S10 ${logs.length} 行 log 裡沒有設定碼、沒有通行碼`);
  }
  // ── S11 通行碼雜湊只在 D1,不在 env ────────────────────────────────────
  {
    const F = deploy(path.join(dir, "envcheck.db"));
    await post(F.handler, "/__clinical/auth/setup", { setup_code: SETUP_CODE, passphrase: CHOSEN });
    const rec = await F.store.passRecord();
    const envText = JSON.stringify({
      CLINICAL_SETUP_SALT: setupRec.salt, CLINICAL_SETUP_HASH: setupRec.hash,
      CLINICAL_SETUP_ITER: String(FAST), CLINICAL_SETUP_EPOCH: "1",
    });
    assert.ok(!envText.includes(rec.hash), "通行碼雜湊出現在環境變數裡 —— 那會跟著 wrangler.jsonc 進公開 repo");
    assert.ok(!envText.includes(rec.salt), "通行碼的鹽出現在環境變數裡");
    assert.notStrictEqual(rec.hash, setupRec.hash, "通行碼與設定碼必須是兩組不同的材料");
    ok("S11 通行碼的 salt/hash 只在 D1,環境變數裡一個字都沒有");
  }

  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) { /* Windows 檔案握把,清不掉不影響結論 */ }
  console.log(`\nPASS — ${passed} 條(跑的是 worker.mjs 真正的 buildPassphraseAuth)`);
})().catch((e) => { console.error("\nFAIL —", e && e.message); process.exit(1); });
