#!/usr/bin/env node
/**
 * test-passphrase-auth.js — src/passphrase-auth.mjs 的回歸套件(Node WebCrypto,不需 Cloudflare)。
 * 正控:對的通行碼過、發出的通行證驗得過。
 * 負控(每條都必須被擋):錯一個字、大小寫不同、空白、空字串、太短的通行碼、
 *   竄改 payload、竄改簽章、換秘密、過期、發證時間在未來、版本不符、換過通行碼的舊證、
 *   把 payload 換成別人的、非法 base64、限流開了還硬試。
 */
"use strict";
const assert = require("assert");
const path = require("path");
const { pathToFileURL } = require("url");

let passed = 0;
const ok = (m) => { passed++; console.log(`  ✓ ${m}`); };

(async () => {
  const A = await import(pathToFileURL(path.join(__dirname, "..", "src", "passphrase-auth.mjs")).href);
  const { makePassphraseRecord, verifyPassphrase, derivePassphraseHash, issueToken, verifyToken, rateLimitVerdict, normalizePassphrase, timingSafeEqual, passphraseWeight, MIN_PASSPHRASE_WEIGHT, MIN_PASSPHRASE_CHARS } = A;

  const PASS = "白虎湯 加 石膏 四十克";   // 一句話當通行碼(≥16 字)
  const FAST = 1000;                      // 測試用低迭代:測的是邏輯不是強度

  console.log("\n通行碼雜湊");
  const rec = await makePassphraseRecord(PASS, FAST);
  assert(rec.salt && rec.hash && rec.iterations === FAST);
  assert(!JSON.stringify(rec).includes(PASS), "紀錄裡不得出現通行碼本身");
  ok("makePassphraseRecord 產出 {salt, hash, iterations},且不含通行碼原文");

  assert.strictEqual(await verifyPassphrase(PASS, rec), true);
  ok("對的通行碼 → 通過");
  for (const [label, wrong] of [
    ["錯一個字", "白虎湯 加 石膏 四十剋"],
    ["少一個空白", "白虎湯加 石膏 四十克"],
    // 全中文的通行碼 .toUpperCase() 還是自己 —— 大小寫敏感要用含英文的通行碼另外測(下面那段)

    ["空字串", ""],
    ["只有空白", "    "],
    ["前綴相同但更短", "白虎湯 加 石膏"],
    ["前綴相同但更長", PASS + "x"],
  ]) {
    assert.strictEqual(await verifyPassphrase(wrong, rec), false, label);
    ok(`${label} → 拒絕`);
  }
  assert.strictEqual(await verifyPassphrase(PASS, { salt: rec.salt, hash: rec.hash, iterations: FAST + 1 }), false);
  ok("迭代次數不同 → 拒絕(設定被改過就不該通過)");
  assert.strictEqual(await verifyPassphrase(PASS, null), false);
  assert.strictEqual(await verifyPassphrase(PASS, { salt: rec.salt }), false);
  ok("設定不完整 → 拒絕(fail closed)");

  {
    const latin = "Correct Horse Battery Staple";
    const lrec = await makePassphraseRecord(latin, FAST);
    assert.strictEqual(await verifyPassphrase(latin, lrec), true);
    assert.strictEqual(await verifyPassphrase(latin.toUpperCase(), lrec), false);
    assert.strictEqual(await verifyPassphrase(latin.toLowerCase(), lrec), false);
    ok("大小寫敏感(英文通行碼):改大寫或小寫都被拒");
  }

  console.log("\n正規化");
  assert.strictEqual(normalizePassphrase("  白虎湯 加 石膏 四十克  "), PASS);
  ok("去頭尾空白,中間空白保留");
  assert.strictEqual(await verifyPassphrase("　" + PASS + " ", rec), true);
  ok("全形空白開頭 + 尾隨空白 → 仍通過(手機鍵盤常見)");
  assert.strictEqual(normalizePassphrase("ｱ"), "ア");
  ok("NFKC 正規化(半形片假名 = 全形)");

  console.log("\n通行碼強度下限(中文一字算 2)");
  assert.strictEqual(passphraseWeight("白虎湯加石膏四十克"), 18);
  assert.strictEqual(passphraseWeight("correct horse battery"), 21);
  ok("加權長度:9 個中文字 = 18;21 個英文字元 = 21");
  const rejects = async (label, pass) => { let t = null; try { await makePassphraseRecord(pass, FAST); } catch (e) { t = e; }
    assert(t && /強度不足/.test(t.message), `${label}: 竟然接受`); ok(`${label} → 建立時就拒絕`); };
  await rejects("三個中文字(加權 6)", "短短的");
  await rejects("七個英文字母", "abcdefg");
  await rejects("兩個生僻字(加權夠但字數不足)", "龘齾");
  await rejects("空字串", "");
  for (const [label, pass] of [["九個中文字", "白虎湯加石膏四十克"], ["四個英文詞", "correct horse battery staple"], ["中英混合", "四逆湯 plus 附子 9g"]]) {
    const r2 = await makePassphraseRecord(pass, FAST);
    assert.strictEqual(await verifyPassphrase(pass, r2), true);
    ok(`${label}(加權 ${passphraseWeight(pass)})→ 接受`);
  }

  console.log("\n通行證");
  const SECRET = "server-secret-abcdefghijklmnop";
  let now = 1_800_000_000;
  const { token, payload } = await issueToken(SECRET, { nowSec: now, ttlDays: 30, passVersion: 1 });
  assert(!token.includes(PASS) && !token.includes(SECRET));
  ok("通行證不含通行碼、不含伺服器秘密");
  const decoded = JSON.parse(Buffer.from(token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  assert.deepStrictEqual(Object.keys(decoded).sort(), ["exp", "iat", "pv", "v"]);
  ok("payload 只有 {v, pv, iat, exp} —— 沒有身分、沒有病例");
  let r = await verifyToken(token, SECRET, { nowSec: now, passVersion: 1 });
  assert.strictEqual(r.ok, true); assert.strictEqual(r.payload.exp, payload.exp);
  ok("剛發的證 → 通過");

  const bad = async (label, tok, secret, opts, reason) => {
    const v = await verifyToken(tok, secret, opts);
    assert.strictEqual(v.ok, false, `${label}: 竟然通過`);
    if (reason) assert.strictEqual(v.reason, reason, `${label}: reason=${v.reason}`);
    ok(`${label} → ${v.reason}`);
  };
  await bad("沒有證", null, SECRET, { nowSec: now }, "no_token");
  await bad("空字串", "", SECRET, { nowSec: now }, "no_token");
  await bad("格式不對(沒有點)", "abcdef", SECRET, { nowSec: now }, "bad_format");
  await bad("三段", "a.b.c", SECRET, { nowSec: now }, "bad_format");
  await bad("換一個秘密", token, "other-secret-aaaaaaaaaaaaaaa", { nowSec: now }, "bad_signature");
  {
    const [b, s] = token.split(".");
    const flipped = s.slice(0, -2) + (s.slice(-2) === "AA" ? "BB" : "AA");
    await bad("簽章被竄改", `${b}.${flipped}`, SECRET, { nowSec: now }, "bad_signature");
    const evil = Buffer.from(JSON.stringify({ v: 1, pv: 1, iat: now, exp: now + 999999999 })).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    await bad("payload 被換成永不過期", `${evil}.${s}`, SECRET, { nowSec: now }, "bad_signature");
    await bad("非法 base64", `${b}.!!!!`, SECRET, { nowSec: now }, "bad_format");
  }
  await bad("過期(超過容忍)", token, SECRET, { nowSec: now + 31 * 86400 }, "expired");
  {
    const v = await verifyToken(token, SECRET, { nowSec: now + 30 * 86400 + 30, passVersion: 1 });
    assert.strictEqual(v.ok, true);
    ok("剛好過期 30 秒內(時鐘誤差容忍)→ 仍通過");
  }
  await bad("換過通行碼(版本 +1)後的舊證", token, SECRET, { nowSec: now, passVersion: 2 }, "passphrase_rotated");
  {
    const future = await issueToken(SECRET, { nowSec: now + 3600, passVersion: 1 });
    await bad("發證時間在未來一小時", future.token, SECRET, { nowSec: now, passVersion: 1 }, "issued_in_future");
  }

  console.log("\n常數時間比較");
  assert.strictEqual(timingSafeEqual("AAAA", "AAAA"), true);
  assert.strictEqual(timingSafeEqual("AAAA", "AAAB"), false);
  assert.strictEqual(timingSafeEqual("AAAA", "AAAAAA"), false);
  ok("timingSafeEqual:相同 true、差一位元 false、長度不同 false");

  console.log("\n失敗限流");
  {
    const t = 1_800_000_000;
    assert.deepStrictEqual(rateLimitVerdict([], { nowSec: t }), { blocked: false, remaining: 8 });
    ok("沒有失敗紀錄 → 放行,剩 8 次");
    const seven = Array.from({ length: 7 }, (_, i) => t - i * 10);
    assert.strictEqual(rateLimitVerdict(seven, { nowSec: t }).blocked, false);
    const eight = Array.from({ length: 8 }, (_, i) => t - i * 10);
    const v = rateLimitVerdict(eight, { nowSec: t });
    assert.strictEqual(v.blocked, true); assert(v.retryAfterSec > 0 && v.retryAfterSec <= 900);
    ok(`15 分鐘內失敗 8 次 → 鎖住(${v.retryAfterSec} 秒後可再試)`);
    const old = Array.from({ length: 20 }, (_, i) => t - 1000 - i * 10);
    assert.strictEqual(rateLimitVerdict(old, { nowSec: t }).blocked, false);
    ok("視窗外的舊失敗不算(不會永久鎖死)");
    const mixed = [...old, ...Array.from({ length: 8 }, (_, i) => t - i)];
    assert.strictEqual(rateLimitVerdict(mixed, { nowSec: t }).blocked, true);
    ok("舊的不算、新的照算");
  }

  console.log("\n雜湊實際成本(免費方案每個請求 10ms CPU)");
  {
    const REAL = A.DEFAULT_ITERATIONS;
    const t0 = Date.now();
    await derivePassphraseHash(PASS, rec.salt, REAL);
    const ms = Date.now() - t0;
    console.log(`     ${REAL.toLocaleString()} 次迭代在這台機器上要 ${ms} ms(Workers 上會不同,部署後量一次)`);
    assert(ms < 5000, "慢到這樣就不能用了");
    ok("預設迭代數可算完");
  }

  console.log(`\nPASS — ${passed} 條`);
})().catch((e) => { console.error("\nFAIL —", e && e.stack || e); process.exit(1); });
