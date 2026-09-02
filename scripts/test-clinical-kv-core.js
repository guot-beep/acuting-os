#!/usr/bin/env node
/**
 * test-clinical-kv-core.js — src/clinical-kv-core.mjs 的回歸套件(node:sqlite adapter;不需 Cloudflare)。
 *   契約 C1–C7、trigger CAS(過期低 / 過期高 / 強制模式)、分塊(surrogate pair 不切、120 萬字往返)、
 *   history(舊值可重建、每 key 保留 N、孤兒塊 0)、snapshot / status、完整性檢查會 fail-loud、非法輸入。
 * 用小 chunkUnits(7)逼出分塊路徑;預設值另測一次大字串。
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

(async () => {
  const { createKvCore, splitChunks, isConflict } = await import(pathToFileURL(path.join(__dirname, "..", "src", "clinical-kv-core.mjs")).href);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "acuting-kvcore-"));
  const db = createNodeSqliteAdapter(path.join(dir, "t.db"));
  let tick = 0;
  const now = () => new Date(1_800_000_000_000 + (tick++) * 1000).toISOString();
  const core = createKvCore(db, { historyPerKey: 3, chunkUnits: 7, now });
  let rev = 0;
  const putOk = async (k, v) => { const r = await core.put(k, v, rev); assert(r.ok, `put ${k} 失敗: ${JSON.stringify(r)}`); assert.strictEqual(r.revision, rev + 1); rev = r.revision; return r; };

  console.log("\nschema");
  await core.ensureSchema(); await core.ensureSchema();
  assert.strictEqual(await core.revision(), 0);
  ok("ensureSchema 冪等,revision 從 0 開始");

  console.log("\n契約 C1–C7(值一律走分塊路徑)");
  assert.strictEqual(await core.get(KEY), null); ok("C1 未寫入 → null");
  const payload = JSON.stringify([{ id: "case.x", note: "中文 with ünïcode  雙空格 " }], null, 2);
  await putOk(KEY, payload);
  assert.strictEqual(await core.get(KEY), payload);
  const head = await db.first("SELECT chunk_count, char_length FROM clinical_kv WHERE key = ?", [KEY]);
  assert(head.chunk_count > 1 && head.char_length === payload.length);
  ok(`C2 put→get 逐位元組相同(${head.chunk_count} 塊)`);
  const tricky = "  \t前後空白與 \\n 跳脫  ";
  await putOk("k.tricky", tricky);
  assert.strictEqual(await core.get("k.tricky"), tricky); ok("C7 不 trim、不正規化");
  for (const k of ["acuting-clinical-v2-staging", "acuting-clinical-active", "acuting-clinical-v2-staging-candidate"]) await putOk(k, "KV-" + k);
  assert.strictEqual(await core.get(KEY), payload);
  for (const k of ["acuting-clinical-v2-staging", "acuting-clinical-active", "acuting-clinical-v2-staging-candidate"]) assert.strictEqual(await core.get(k), "KV-" + k);
  ok("C3 key 彼此獨立、不污染主槽");
  assert.strictEqual(await core.get("k.never"), null); ok("C4 未寫入的 key → null");
  await putOk("k.temp", "x");
  { const r = await core.del("k.temp", rev); assert(r.ok); rev = r.revision; }
  assert.strictEqual(await core.get("k.temp"), null); ok("C5 del 之後 → null");
  await putOk("k.atomic", "A"); await putOk("k.atomic", "B");
  assert.strictEqual(await core.get("k.atomic"), "B");
  assert.strictEqual((await db.first("SELECT COUNT(*) n FROM clinical_kv_chunks WHERE key='k.atomic'")).n, 1);
  ok("C6 原子替換:舊塊不殘留");
  await putOk("k.empty", "");
  assert.strictEqual(await core.get("k.empty"), ""); ok("空字串存得進、讀得回(不是 null)");

  console.log("\nCAS(trigger 守門)");
  {
    const before = await core.get(KEY);
    const r = await core.put(KEY, "stale-write", 0);
    assert.strictEqual(r.ok, false); assert.strictEqual(r.status, 409); assert.strictEqual(r.revision, rev);
    assert.strictEqual(await core.get(KEY), before);
    ok("過期(低)If-Match → 409,值一個位元組都沒動");
    const r2 = await core.put(KEY, "stale-high", rev + 7);
    assert.strictEqual(r2.status, 409); assert.strictEqual(await core.get(KEY), before);
    ok("過期(高)If-Match → 409(不會被當成未來的合法寫入)");
    const rd = await core.del(KEY, 0);
    assert.strictEqual(rd.status, 409); assert.strictEqual(await core.get(KEY), before);
    ok("過期的刪除也 409");
    const rf = await core.put("k.force", "forced", undefined);
    assert(rf.ok); assert.strictEqual(rf.revision, rev + 1); rev = rf.revision;
    ok("強制模式(不帶 If-Match,給衝突備份用)→ 以當下 revision 為基準寫入");
    assert.strictEqual((await db.first("SELECT COUNT(*) n FROM clinical_revision_log")).n, rev);
    ok(`revision_log 筆數 = revision(${rev}):每次成功寫入恰一筆`);
    assert(isConflict(new Error("D1_ERROR: revision_conflict: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_TRIGGER)")));
    assert(!isConflict(new Error("D1_ERROR: no such table")));
    ok("isConflict 只認 revision_conflict");
  }

  console.log("\n分塊");
  {
    const emoji = "😀中a".repeat(10);   // 😀 是 surrogate pair(2 units);chunkUnits=7 一定會撞到邊界
    const chunks = splitChunks(emoji, 7);
    for (const c of chunks) { const last = c.charCodeAt(c.length - 1); assert(!(last >= 0xd800 && last <= 0xdbff), "塊尾是高位代理"); }
    assert.strictEqual(chunks.join(""), emoji);
    ok(`surrogate pair 不會被切開(${chunks.length} 塊,拼回相同)`);
    await putOk("k.emoji", emoji);
    assert.strictEqual(await core.get("k.emoji"), emoji); ok("emoji 混中文往返相同");
    assert.deepStrictEqual(splitChunks("", 7), []); ok("空字串 → 0 塊");
  }
  {
    const big = ("病歷".repeat(100) + "x".repeat(200) + "😀".repeat(50)).repeat(3000);   // 500 units × 3000 = 1.5M code units → 3 塊
    const coreDefault = createKvCore(db, { now });
    const r = await coreDefault.put("k.big", big, rev); assert(r.ok); rev = r.revision;
    const h = await db.first("SELECT chunk_count, char_length FROM clinical_kv WHERE key='k.big'");
    const maxLen = (await db.first("SELECT MAX(length(part)) m FROM clinical_kv_chunks WHERE key='k.big'")).m;
    assert(h.chunk_count >= 3 && maxLen <= 500_000 && h.char_length === big.length);
    assert.strictEqual(await coreDefault.get("k.big"), big);
    ok(`${big.length.toLocaleString()} 字元 → ${h.chunk_count} 塊(每塊 ≤ 500,000 units),往返相同`);
  }

  console.log("\nhistory");
  {
    const vals = ["h1", "h2", "h3", "h4", "h5"];
    for (const v of vals) await putOk("k.hist", v);
    const rows = await db.all("SELECT revision, op, prior_present, prior_chunk_count FROM clinical_kv_history WHERE key='k.hist' ORDER BY revision");
    assert.strictEqual(rows.length, 3, `每 key 保留 3 版,實際 ${rows.length}`);
    ok("每個 key 只留最近 N 版(N=3)");
    const last = rows[rows.length - 1];
    const parts = await db.all("SELECT part FROM clinical_kv_history_chunks WHERE revision = ? ORDER BY seq", [last.revision]);
    assert.strictEqual(parts.map((p) => p.part).join(""), "h4");
    ok("最新一筆 history 的舊值 = 上一版內容(可從 history 塊重建)");
    const orphans = (await db.first("SELECT COUNT(*) n FROM clinical_kv_history_chunks WHERE revision NOT IN (SELECT revision FROM clinical_kv_history)")).n;
    assert.strictEqual(orphans, 0); ok("history 孤兒塊 = 0(修剪連塊一起清)");
    const first = await db.first("SELECT prior_present FROM clinical_kv_history WHERE key='k.emoji'");
    assert.strictEqual(first.prior_present, 0); ok("第一次寫入的 history 記 prior_present=0(先前不存在)");
    const coreNoHist = createKvCore(db, { now, noHistoryKeys: ["k.nohist"] });
    let r = await coreNoHist.put("k.nohist", "a", rev); rev = r.revision; r = await coreNoHist.put("k.nohist", "b", rev); rev = r.revision;
    assert.strictEqual((await db.first("SELECT COUNT(*) n FROM clinical_kv_history WHERE key='k.nohist'")).n, 0);
    assert.strictEqual(await coreNoHist.get("k.nohist"), "b");
    ok("noHistoryKeys 的 key 不留 history(值照常寫、revision 照常進)");
  }

  console.log("\nsnapshot / status");
  {
    const snap = await core.snapshot();
    assert.strictEqual(snap.revision, rev);
    assert.strictEqual(snap.keys[KEY], payload); assert.strictEqual(snap.keys["k.emoji"].length, 40); assert.strictEqual(snap.keys["k.empty"], "");
    assert(!("k.temp" in snap.keys));
    ok("snapshot:所有 key 的值與 revision 一致,已刪的不在");
    const st = await core.status();
    assert.strictEqual(st.keys[KEY].chars, payload.length); assert(st.history_rows > 0);
    ok("status 只有長度與 revision,沒有值");
  }

  console.log("\n完整性與非法輸入");
  {
    await db.batch([{ sql: "DELETE FROM clinical_kv_chunks WHERE key='k.big' AND seq = 1", params: [] }]);
    let threw = null; try { await core.get("k.big"); } catch (e) { threw = e; }
    assert(threw && /kv_integrity/.test(threw.message)); ok("塊少一塊 → get 拋 kv_integrity(不靜默回短內容)");
    for (const bad of ["", "a/b", "x".repeat(121), "有中文"]) { let t = null; try { await core.put(bad, "v", rev); } catch (e) { t = e; } assert(t && /bad_key/.test(t.message)); }
    ok("非法 key 名 → 拋 bad_key");
    let t2 = null; try { await core.put("k.obj", { a: 1 }, rev); } catch (e) { t2 = e; } assert(t2 && /value_must_be_string/.test(t2.message));
    ok("非字串值 → 拋(契約要字串,呼叫端自己 stringify)");
    let t3 = null; try { await core.put("k.x", "v", -1); } catch (e) { t3 = e; } assert(t3 && /bad_if_match/.test(t3.message));
    ok("負數 If-Match → 拋 bad_if_match");
  }

  db.close();
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) { /* */ }
  console.log(`\nPASS — ${passed} 條`);
})().catch((e) => { console.error("\nFAIL —", e && e.stack || e); process.exit(1); });
