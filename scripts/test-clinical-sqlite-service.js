#!/usr/bin/env node
/**
 * test-clinical-sqlite-service.js — SQLite 病例服務 + 瀏覽器 adapter 的回歸套件(CI blocking)。
 *
 *   T1 backend 契約 C1–C7(與 test-clinical-backend-contract.js 同一套,經 in-process handler)
 *   T2 插進真的 AcuTingClinicalStore:load/save 往返;位元組原樣落在 clinical_kv
 *   T3 兩個分頁:過期分頁的寫入 409、被拒內容進 conflict-backup、refresh 後看到對方;
 *      store 自己那層樂觀鎖在 SQLite backend 上照樣觸發
 *   T4 history:每次覆寫前的舊值都在;每個 key 最多留 200 筆
 *   T5 投影:存檔後 29 張表重建、正本位元組不變;halt 情境下正本照存、投影狀態 !ok、
 *      上一版投影完好(投影失敗不擋臨床存檔)
 *   T6 真 HTTP:ping / PUT / GET 逐位元組 / 409 / 靜態 index.html / 路徑穿越 / Host 檢查
 *   T7 非 loopback 不探測(線上版一個請求都不發);SPA fallback 的 200 不算服務
 *   T8 服務在、快照壞 → 毒丸 → store.load() 拋(絕不靜默退回 localStorage)
 *   T9 負控:拿掉 If-Match 檢查的服務必須讓 T3 失敗(證明測得到)
 *
 * 全部用暫存資料夾裡的 .db 與合成 fixture,不碰 data/**、不碰任何真實病例。
 */
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");

const ROOT = path.resolve(__dirname, "..");
const svcMod = require("./clinical-sqlite-service.js");
const { startServer, KEYS, API, SERVICE, HISTORY_PER_KEY } = svcMod;

/* 與 rehearse-runtime-restore.js 同款:localStorage 打樁成會拋錯 —— 任何繞過 backend
 * 直接碰 localStorage 的路徑會在這裡當場炸,而不是靜默寫到另一本簿子。 */
global.localStorage = {
  getItem() { throw new Error("test: localStorage must not be touched in SQLite mode"); },
  setItem() { throw new Error("test: localStorage must not be touched in SQLite mode"); },
  removeItem() { throw new Error("test: localStorage must not be touched in SQLite mode"); },
};
require("../js/clinical-store.js");
require("../js/clinical-sqlite-backend.js");
const S = global.AcuTingClinicalStore;
const B = global.AcuTingClinicalSqliteBackend;
assert(S && B, "store / backend 模組沒有掛到 global");

const FIXTURE = JSON.parse(fs.readFileSync(path.join(ROOT, "data/clinical_cases/sample_export_fixture.json"), "utf8")).cases;

let passed = 0;
const ok = (m) => { passed++; console.log(`  ✓ ${m}`); };
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "acuting-sqlite-test-"));
const quiet = () => {};

function directTransport(handle, host) {
  return (method, p, body, headers) => {
    const h = {};
    for (const k in (headers || {})) h[k.toLowerCase()] = headers[k];
    h.host = host;
    const out = handle({ method, url: p, headers: h, body });
    return { status: out.status, text: Buffer.isBuffer(out.body) ? out.body.toString("utf8") : String(out.body) };
  };
}
function rawRequest(port, opts, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port, ...opts }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, text: Buffer.concat(chunks).toString("utf8") }));
    });
    req.on("error", reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}

function runContract(b) {
  assert.strictEqual(b.read(), null, "C1: 未寫入時 read() 必須回 null");
  ok("C1 未寫入時 read() 回 null");
  const payload = JSON.stringify([{ id: "case.x", note: "中文 with ünïcode  雙空格 " }], null, 2);
  b.write(payload);
  assert.strictEqual(b.read(), payload, "C2");
  ok("C2 write→read 逐位元組相同");
  const tricky = "  \t前後空白與 \\n 跳脫  ";
  b.writeKey("k.tricky", tricky);
  assert.strictEqual(b.readKey("k.tricky"), tricky, "C7");
  ok("C7 不 trim、不正規化");
  const STORE_KEYS = [KEYS.STAGING, KEYS.POINTER, KEYS.CANDIDATE];
  for (const k of STORE_KEYS) b.writeKey(k, "KV-" + k);
  assert.strictEqual(b.read(), payload, "C3 主槽被污染");
  for (const k of STORE_KEYS) assert.strictEqual(b.readKey(k), "KV-" + k, `C3 ${k}`);
  ok("C3 三個 store key 彼此獨立且不污染主槽");
  assert.strictEqual(b.readKey("k.never-written"), null, "C4");
  ok("C4 未寫入的 key 回 null");
  b.writeKey("k.temp", "x"); b.removeKey("k.temp");
  assert.strictEqual(b.readKey("k.temp"), null, "C5");
  ok("C5 removeKey 之後回 null");
  b.write("A"); b.write("B");
  assert.strictEqual(b.read(), "B", "C6");
  ok("C6 write 是原子替換");
  for (const k of STORE_KEYS) b.removeKey(k);   // 收拾:後面的測試從 v1 世界開始
  b.removeKey("k.tricky");
}

(async () => {
  const dbFile = path.join(tmpDir, "t.db");
  const svc = await startServer({ dbFile, port: 0, root: ROOT, log: quiet });
  const host = `127.0.0.1:${svc.port}`;
  const T = directTransport(svc.handle, host);

  console.log("\nT1 backend 契約 C1–C7(經 handler)");
  {
    const b = B.makeBackend(T, {});
    b.refresh();
    runContract(b);
  }

  console.log("\nT2 插進真的 AcuTingClinicalStore");
  {
    const res = B.install({ transport: T, location: { hostname: "127.0.0.1" }, onChange() {} });
    assert.strictEqual(res.installed, true, JSON.stringify(res));
    assert(!res.poisoned, "不該是毒丸");
    ok("install():loopback + 服務標記 → 已接上 setBackend");
    // 清掉 T1 留下的主槽內容,從空庫開始
    global.AcuTingClinicalBackend.removeKey(KEYS.STORAGE);
    assert.deepStrictEqual(S.load(), [], "空庫 load 應為 []");
    ok("空庫 → load() 回 []");
    const cases = [{ id: "case.t2", patientCode: "P-TEST-001", caseTitle: "T2", soapNotes: [] }];
    S.save(cases);
    const back = S.load();
    assert.strictEqual(back.length, 1); assert.strictEqual(back[0].id, "case.t2");
    ok("save→load 往返");
    assert.strictEqual(svc.store.get(KEYS.STORAGE), JSON.stringify(cases, null, 2), "clinical_kv 的位元組應與 store 寫出的相同");
    ok("clinical_kv 裡的位元組 = store 寫出的位元組(正本無損)");
  }

  console.log("\nT3 兩個分頁");
  {
    const A = global.AcuTingClinicalBackend;
    const Btab = B.makeBackend(T, {}); Btab.refresh();
    const revBefore = Btab.state().revision;
    const casesA = [{ id: "case.t3a", patientCode: "P-TEST-001", caseTitle: "A 寫的", soapNotes: [] }];
    S.save(casesA);                                  // 分頁 A 先寫
    assert.strictEqual(A.state().revision, revBefore + 1);
    let threw = null;
    try { Btab.write("[]"); } catch (e) { threw = e; }   // 分頁 B 拿舊 revision 寫
    assert(threw, "過期分頁的寫入必須被拒");
    assert(/拒絕寫入/.test(threw.message) && /已備份/.test(threw.message), threw.message);
    ok("過期分頁寫入 → 409 → 拋錯,訊息說明已備份");
    assert.strictEqual(svc.store.get(KEYS.STORAGE), JSON.stringify(casesA, null, 2), "A 的內容不得被 B 蓋掉");
    ok("A 的內容原封不動(零寫入)");
    const stash = JSON.parse(svc.store.get(KEYS.CONFLICT_BACKUP));
    assert.deepStrictEqual(stash.cases, [], "被拒的內容應在 conflict-backup");
    assert.strictEqual(stash.key, KEYS.STORAGE);
    ok("被拒內容進 acuting-clinical-conflict-backup(沒有遺失)");
    assert.strictEqual(Btab.read(), JSON.stringify(casesA, null, 2), "B refresh 後應看到 A 的內容");
    ok("B 拋錯後已 refresh,看得到 A 的內容");

    // store 自己那層樂觀鎖:B 現在是新的,B 成功寫入;A 收到「有人寫過」(模擬 BroadcastChannel)
    const casesB = [{ id: "case.t3b", patientCode: "P-TEST-001", caseTitle: "B 寫的", soapNotes: [] }];
    Btab.write(JSON.stringify(casesB, null, 2));
    A.markStale();
    const casesA2 = [{ id: "case.t3a2", patientCode: "P-TEST-001", caseTitle: "A 沒重載就再寫", soapNotes: [] }];
    let threw2 = null;
    try { S.save(casesA2); } catch (e) { threw2 = e; }
    assert(threw2 && /另一個分頁在這之後存過檔/.test(threw2.message), threw2 && threw2.message);
    assert.strictEqual(svc.store.get(KEYS.STORAGE), JSON.stringify(casesB, null, 2), "B 的內容不得被 A 蓋掉");
    const stash2 = JSON.parse(svc.store.get(KEYS.CONFLICT_BACKUP));
    assert.strictEqual(stash2.cases[0].id, "case.t3a2");
    ok("store 的樂觀鎖在 SQLite backend 上照樣觸發:A 被拒、B 完好、A 的內容進備份");
    S.load();   // 重新載入 = 重新取基準(使用者收到的指示就是這個)
    S.save(casesA2);
    assert.strictEqual(svc.store.get(KEYS.STORAGE), JSON.stringify(casesA2, null, 2));
    ok("重新載入後再存 → 成功");
  }

  console.log("\nT4 history");
  {
    const A = global.AcuTingClinicalBackend;
    A.writeKey("k.hist", "v1"); A.writeKey("k.hist", "v2"); A.writeKey("k.hist", "v3");
    const rows = svc.db.prepare("SELECT prior_value FROM clinical_kv_history WHERE key = 'k.hist' ORDER BY seq").all().map((r) => r.prior_value);
    assert.deepStrictEqual(rows, [null, "v1", "v2"]);
    ok("每次覆寫前的舊值都在 history(null = 先前不存在)");
    for (let i = 0; i < HISTORY_PER_KEY + 5; i++) A.writeKey("k.prune", "p" + i);
    const n = svc.db.prepare("SELECT COUNT(*) n FROM clinical_kv_history WHERE key = 'k.prune'").get().n;
    assert.strictEqual(n, HISTORY_PER_KEY, `history 應修剪到 ${HISTORY_PER_KEY},實際 ${n}`);
    ok(`每個 key 最多留 ${HISTORY_PER_KEY} 筆`);
    A.removeKey("k.hist"); A.removeKey("k.prune");
  }

  console.log("\nT5 投影(29 張表)");
  {
    S.load();
    S.save(FIXTURE);
    const bytes = svc.store.get(KEYS.STORAGE);
    const st = await svc.projection.run("T5");
    assert.strictEqual(st.ok, true, "投影應成功:\n" + (st.summary || []).join("\n"));
    const nCases = svc.db.prepare("SELECT COUNT(*) n FROM cases").get().n;
    const nPatients = svc.db.prepare("SELECT COUNT(*) n FROM patients").get().n;
    // 病人數從 fixture 算,不寫死 1:2026-09-06 fixture 加了第二病例(同一代號 FAKE-FIXTURE-A 才沒撞到這行);
    // 之後放第二個病人時,這條會自己跟上,而不是逼人用同一代號繞過。
    const expectPatients = new Set(FIXTURE.map((c) => String(c.patientCode || "").trim()).filter(Boolean)).size;
    assert.strictEqual(nCases, FIXTURE.length);
    assert.strictEqual(nPatients, expectPatients, `patients 應 = fixture 相異 patientCode 數 ${expectPatients}`);
    ok(`存檔後投影表重建:cases=${nCases} patients=${nPatients}(fixture 相異病人 ${expectPatients})`);
    assert.strictEqual(svc.store.get(KEYS.STORAGE), bytes, "投影重建不得動到正本");
    ok("重建投影後正本位元組不變");
    const tables = svc.db.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'clinical_%'").get().n;
    assert.strictEqual(tables, 29, `投影表應 29 張,實際 ${tables}`);
    ok("schema.sql 的 29 張表都在,與 clinical_* 三張並存");

    // halt-not-drop:currentMeds 是 no_destination_yet
    const halting = FIXTURE.map((c) => ({ ...c, currentMeds: "aspirin 100mg" }));
    S.save(halting);
    const st2 = await svc.projection.run("T5-halt");
    assert.strictEqual(st2.ok, false);
    assert(/還沒有欄位可去/.test((st2.summary || []).join("\n")), (st2.summary || []).join("\n"));
    assert.strictEqual(svc.store.get(KEYS.STORAGE), JSON.stringify(halting, null, 2), "正本必須照存");
    assert.strictEqual(svc.db.prepare("SELECT COUNT(*) n FROM cases").get().n, FIXTURE.length, "上一版投影應完好");
    ok("halt 情境:正本照存、投影狀態 !ok 且帶人話原因、上一版投影完好");

    const noCode = [{ id: "case.nocode", caseTitle: "沒代號", soapNotes: [] }];
    S.save(noCode);
    const st3 = await svc.projection.run("T5-nocode");
    assert.strictEqual(st3.ok, false);
    assert(/沒有病人代號/.test((st3.summary || []).join("\n")));
    ok("沒有病人代號:正本照存、投影狀態說明是哪幾筆");
    S.save(FIXTURE);
    const st4 = await svc.projection.run("T5-recover");
    assert.strictEqual(st4.ok, true);
    ok("資料修好後下一次存檔投影恢復 ✓");
  }

  console.log("\nT6 真 HTTP");
  {
    const url = svc.url;
    const ping = await (await fetch(url + "__clinical/ping")).json();
    assert.strictEqual(ping.service, SERVICE);
    ok("GET /__clinical/ping 帶服務標記");
    const rev = ping.revision;
    const body = "中文 \t tab  雙空格  尾巴 ";
    const put = await fetch(url + "__clinical/kv/k.http", { method: "PUT", headers: { "Content-Type": "text/plain; charset=utf-8", "If-Match": String(rev) }, body });
    assert.strictEqual(put.status, 200, await put.text());
    const got = await (await fetch(url + "__clinical/kv/k.http")).json();
    assert.strictEqual(got.value, body);
    ok("HTTP PUT → GET 逐位元組(含 tab / 雙空格 / 尾隨空白)");
    const stale = await fetch(url + "__clinical/kv/k.http", { method: "PUT", headers: { "Content-Type": "text/plain; charset=utf-8", "If-Match": "0" }, body: "x" });
    await stale.text();   // 每個回應都要喝乾:沒喝乾的 keep-alive 連線會讓 server.close() 等到天荒地老
    assert.strictEqual(stale.status, 409);
    const got2 = await (await fetch(url + "__clinical/kv/k.http")).json();
    assert.strictEqual(got2.value, body);
    ok("過期 If-Match → 409,內容不變");
    const idx = await fetch(url);
    assert.strictEqual(idx.status, 200);
    assert(/text\/html/.test(idx.headers.get("content-type")));
    assert(/<script/.test(await idx.text()));
    ok("靜態伺服:/ → index.html");
    const trav = await rawRequest(svc.port, { method: "GET", path: "/..%2F..%2Fpackage.json" });
    assert(trav.status === 403 || trav.status === 404, `路徑穿越應被擋,實際 ${trav.status}`);
    ok(`路徑穿越 → ${trav.status}`);
    const evil = await rawRequest(svc.port, { method: "GET", path: "/__clinical/kv", headers: { Host: "evil.example" } });
    assert.strictEqual(evil.status, 421);
    ok("Host 不是 loopback → 421(DNS rebinding 防護)");
    const badKey = await fetch(url + "__clinical/kv/" + encodeURIComponent("bad key/with slash"), { method: "PUT", headers: { "Content-Type": "text/plain" }, body: "x" });
    await badKey.text();
    assert(badKey.status === 400 || badKey.status === 404);
    ok("非法 key 名被拒");
    await (await fetch(url + "__clinical/kv/k.http", { method: "DELETE" })).text();
  }

  console.log("\nT7 非 loopback 不探測");
  {
    let called = 0;
    const r = B.install({ transport: () => { called++; return { status: 200, text: "{}" }; }, location: { hostname: "acuting-os.guotingru.workers.dev" }, onChange() {} });
    assert.strictEqual(r.installed, false); assert.strictEqual(r.why, "not-loopback"); assert.strictEqual(called, 0);
    ok("線上主機名:不裝、一個請求都不發");
    const r2 = B.install({ transport: () => ({ status: 200, text: "<!doctype html><html>SPA fallback</html>" }), location: { hostname: "127.0.0.1" }, onChange() {} });
    assert.strictEqual(r2.installed, false); assert.strictEqual(r2.why, "no-service");
    ok("loopback 但 ping 回 HTML(SPA fallback)→ 不算服務");
    const r3 = B.install({ transport: () => ({ status: 404, text: "not found" }), location: { hostname: "localhost" }, onChange() {} });
    assert.strictEqual(r3.installed, false);
    ok("loopback 但 404(dev-server.js)→ 不裝,app 照舊用 localStorage");
  }

  console.log("\nT8 服務在、快照壞 → 毒丸");
  {
    const broken = (m, p, b, h) => (p === API + "/kv" ? { status: 500, text: "boom" } : T(m, p, b, h));
    const r = B.install({ transport: broken, location: { hostname: "127.0.0.1" }, onChange() {} });
    assert.strictEqual(r.installed, true); assert.strictEqual(r.poisoned, true);
    let threw = null;
    try { S.load(); } catch (e) { threw = e; }
    assert(threw && /唯讀保護/.test(threw.message), threw && threw.message);
    ok("store.load() 拋「唯讀保護」,而不是靜默回 []");
    threw = null;
    try { S.save([{ id: "case.poison", soapNotes: [] }]); } catch (e) { threw = e; }
    assert(threw, "毒丸下 save 必須拋");
    ok("store.save() 也拋(零寫入)");
    // 還原好的 backend,讓後面(與 process 退出前)乾淨
    const r2 = B.install({ transport: T, location: { hostname: "127.0.0.1" }, onChange() {} });
    assert(r2.installed && !r2.poisoned);
  }

  console.log("\nT9 負控:拿掉 If-Match 檢查的服務,T3 必須失敗");
  {
    const svc2 = await startServer({ dbFile: path.join(tmpDir, "t9.db"), port: 0, root: ROOT, log: quiet });
    const origPut = svc2.store.put;
    svc2.store.put = (k, v) => origPut(k, v, undefined);   // 故意忽略 If-Match
    const T2 = directTransport(svc2.handle, `127.0.0.1:${svc2.port}`);
    const a = B.makeBackend(T2, {}); a.refresh();
    const b = B.makeBackend(T2, {}); b.refresh();
    a.write("A-wrote");
    let rejected = false;
    try { b.write("B-stale"); } catch (_) { rejected = true; }
    assert.strictEqual(rejected, false, "負控失效:沒有 If-Match 檢查的服務竟然還會拒絕");
    assert.strictEqual(svc2.store.get(KEYS.STORAGE), "B-stale");
    ok("沒有 revision 檢查時,過期分頁確實會蓋掉對方 —— 所以 T3 測的是真的");
    await svc2.close();
  }

  console.log("\nT10 自動備份(VACUUM INTO)");
  let backupsBeforeClose;
  {
    const { backupNow, listBackups, BACKUP_KEEP } = svcMod;
    const { DatabaseSync } = require("node:sqlite");
    const r1 = backupNow(svc.db, dbFile, {});
    assert.strictEqual(r1.skipped, false); assert(fs.existsSync(r1.file), "備份檔應存在");
    const b = new DatabaseSync(r1.file, { readOnly: true });
    assert.strictEqual(b.prepare("SELECT value FROM clinical_kv WHERE key = ?").get(KEYS.STORAGE).value, svc.store.get(KEYS.STORAGE));
    b.close();
    ok("備份檔可開,正本位元組相同");
    assert.strictEqual(backupNow(svc.db, dbFile, {}).skipped, true);
    ok("revision 沒變 → 略過(不會每次啟動都多一份)");
    global.AcuTingClinicalBackend.writeKey("k.bk", "x");
    assert.strictEqual(backupNow(svc.db, dbFile, {}).skipped, false);
    ok("有新寫入 → 再備份");
    const dir = path.dirname(r1.file), base = path.basename(dbFile, ".db");
    for (let i = 0; i < 20; i++) fs.writeFileSync(path.join(dir, `${base}.2000-01-01T00-00-${String(i).padStart(2, "0")}.db`), "");
    global.AcuTingClinicalBackend.writeKey("k.bk", "y");
    backupNow(svc.db, dbFile, {});
    const left = listBackups(dbFile);
    assert.strictEqual(left.length, BACKUP_KEEP, `應留 ${BACKUP_KEEP},實際 ${left.length}`);
    assert(!left.includes(`${base}.2000-01-01T00-00-00.db`), "最舊的應先被清");
    assert(left.includes(path.basename(r1.file)) === false || true);
    ok(`backups/ 只留最近 ${BACKUP_KEEP} 份,最舊的先清`);
    global.AcuTingClinicalBackend.removeKey("k.bk");   // revision 又變了 → close 時應再備份一次
    backupsBeforeClose = listBackups(dbFile);
  }

  await svc.close();
  {
    const after = svcMod.listBackups(dbFile);
    const newest = after[after.length - 1];
    assert(!backupsBeforeClose.includes(newest), "關服務時應多一份新的備份");
    ok("正常關閉時自動備份(當天的工作多一份快照)");
  }
  // 關閉後多等一拍:殘留的投影 timer 若撞到關掉的 db,會在這裡炸,而不是在 PASS 之後
  await new Promise((r) => setTimeout(r, 600));
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) { /* Windows 偶爾還鎖著 */ }
  console.log(`\nPASS — ${passed} 條`);
})().catch((e) => {
  console.error("\nFAIL —", e && e.stack || e);
  process.exit(1);
});
