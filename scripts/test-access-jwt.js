#!/usr/bin/env node
/**
 * test-access-jwt.js — src/access-jwt.mjs 的回歸套件(Node ≥ 20 的 WebCrypto,不需 Cloudflare)。
 * 正控:合法 token 通過。負控(每一條都必須被擋):無 token、格式壞、alg none、alg HS256(alg confusion)、
 * 未知 kid、簽章被竄改、payload 被竄改、iss 錯、aud 錯、過期、nbf 在未來、email 不在名單。
 * 金鑰輪替:未知 kid → 重抓 JWKS 一次就找到;60 秒內再遇未知 kid 不重抓(節流)。
 */
"use strict";
const assert = require("assert");
const path = require("path");

let passed = 0;
const ok = (m) => { passed++; console.log(`  ✓ ${m}`); };
const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
const enc = new TextEncoder();

async function genKey(kid) {
  const kp = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", kp.publicKey);
  return { kid, priv: kp.privateKey, jwk: { kty: "RSA", kid, n: jwk.n, e: jwk.e, alg: "RS256", use: "sig" } };
}
async function mint(key, payload, headerOverride) {
  const header = { alg: "RS256", kid: key.kid, typ: "JWT", ...(headerOverride || {}) };
  const h = b64url(enc.encode(JSON.stringify(header)));
  const p = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key.priv, enc.encode(`${h}.${p}`));
  return `${h}.${p}.${b64url(sig)}`;
}

(async () => {
  const mod = await import(path.join(__dirname, "..", "src", "access-jwt.mjs").replace(/\\/g, "/").replace(/^([A-Za-z]):/, "file:///$1:"));
  const { verifyAccessJwt, createJwksCache, decodeJwt } = mod;

  const TEAM = "https://acuting.cloudflareaccess.com";
  const AUD = "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";
  const EMAIL = "guotingru@gmail.com";
  const k1 = await genKey("key-1");
  const k2 = await genKey("key-2");
  const bad = await genKey("key-evil");
  let nowSec = 1_800_000_000;
  const clock = () => nowSec;
  let served = [k1.jwk];
  let fetches = 0;
  const jwks = createJwksCache(async () => { fetches++; return { keys: served }; }, { nowMs: () => nowSec * 1000 });
  const base = () => ({ aud: [AUD], iss: TEAM, email: EMAIL, sub: "user-1", iat: nowSec - 10, exp: nowSec + 3600 });
  const opts = { teamDomain: TEAM, aud: AUD, jwks, allowedEmails: [EMAIL], nowSec: clock };

  console.log("\n正控");
  {
    const r = await verifyAccessJwt(await mint(k1, base()), opts);
    assert.strictEqual(r.ok, true, JSON.stringify(r));
    assert.strictEqual(r.email, EMAIL);
    ok("合法 token(RS256、kid 在 JWKS、iss/aud/exp/email 都對)→ ok");
    const r2 = await verifyAccessJwt(await mint(k1, { ...base(), aud: AUD }), opts);   // aud 為字串
    assert.strictEqual(r2.ok, true);
    ok("aud 是字串而非陣列 → 也接受");
    const r3 = await verifyAccessJwt(await mint(k1, { ...base(), email: EMAIL.toUpperCase() }), opts);
    assert.strictEqual(r3.ok, true);
    ok("email 大小寫不同 → 接受(名單比對不分大小寫)");
    const noList = await verifyAccessJwt(await mint(k1, { ...base(), email: "someone@else.com" }), { ...opts, allowedEmails: [] });
    assert.strictEqual(noList.ok, true);
    ok("沒設 allowedEmails 時不查 email(Access 政策本身守門)");
  }

  console.log("\n負控(每條都要被擋)");
  const expectFail = async (label, token, reason, o) => {
    const r = await verifyAccessJwt(token, o || opts);
    assert.strictEqual(r.ok, false, `${label}: 竟然通過`);
    if (reason) assert.strictEqual(r.reason, reason, `${label}: reason=${r.reason}`);
    ok(`${label} → ${r.reason}`);
  };
  await expectFail("無 token", null, "no_token");
  await expectFail("空字串", "", "no_token");
  await expectFail("垃圾字串", "not.a.jwt", "bad_format");
  await expectFail("只有兩段", "aaaa.bbbb", "bad_format");
  {
    const h = b64url(enc.encode(JSON.stringify({ alg: "none", kid: "key-1" })));
    const p = b64url(enc.encode(JSON.stringify(base())));
    await expectFail("alg none", `${h}.${p}.`, "bad_alg");
  }
  {
    // alg confusion:用公鑰當 HMAC 秘密簽 HS256
    const h = b64url(enc.encode(JSON.stringify({ alg: "HS256", kid: "key-1" })));
    const p = b64url(enc.encode(JSON.stringify(base())));
    const hk = await crypto.subtle.importKey("raw", enc.encode(k1.jwk.n), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const s = b64url(await crypto.subtle.sign("HMAC", hk, enc.encode(`${h}.${p}`)));
    await expectFail("alg HS256(confusion)", `${h}.${p}.${s}`, "bad_alg");
  }
  await expectFail("未知 kid(且 JWKS 裡真的沒有)", await mint(bad, base()), "unknown_kid");
  {
    const t = await mint(k1, base());
    const parts = t.split(".");
    const sig = parts[2];
    const flipped = sig.slice(0, -2) + (sig.slice(-2) === "AA" ? "BB" : "AA");
    await expectFail("簽章被竄改", `${parts[0]}.${parts[1]}.${flipped}`, "bad_signature");
    const p2 = b64url(enc.encode(JSON.stringify({ ...base(), email: "attacker@evil.com" })));
    await expectFail("payload 被竄改(換 email)", `${parts[0]}.${p2}.${parts[2]}`, "bad_signature");
  }
  await expectFail("iss 錯(別的 team)", await mint(k1, { ...base(), iss: "https://evil.cloudflareaccess.com" }), "bad_iss");
  await expectFail("aud 錯(別的 Access app)", await mint(k1, { ...base(), aud: ["ffff"] }), "bad_aud");
  await expectFail("aud 缺", await mint(k1, { ...base(), aud: undefined }), "bad_aud");
  await expectFail("過期(超過 skew)", await mint(k1, { ...base(), exp: nowSec - 120 }), "expired");
  await expectFail("exp 缺", await mint(k1, { ...base(), exp: undefined }), "expired");
  await expectFail("nbf 在未來", await mint(k1, { ...base(), nbf: nowSec + 3600 }), "not_yet_valid");
  await expectFail("email 不在名單", await mint(k1, { ...base(), email: "someone@else.com" }), "email_not_allowed");
  await expectFail("email 缺而名單有設", await mint(k1, { ...base(), email: undefined }), "email_not_allowed");
  await expectFail("設定缺(沒有 aud)", await mint(k1, base()), "auth_not_configured", { ...opts, aud: "" });
  {
    const r = await verifyAccessJwt(await mint(k1, { ...base(), exp: nowSec - 30 }), opts);
    assert.strictEqual(r.ok, true);
    ok("過期 30 秒(在 60 秒 skew 內)→ 仍接受(時鐘誤差容忍)");
  }

  console.log("\n金鑰輪替 / JWKS 節流");
  {
    nowSec += 61;   // 上面的「未知 kid」負控已用掉這一分鐘的重抓額度 —— 那正是節流在做事;時鐘往前走才輪到輪替
    const before = fetches;
    served = [k1.jwk, k2.jwk];                       // Access 輪替:新 key 上線
    const r = await verifyAccessJwt(await mint(k2, base()), opts);
    assert.strictEqual(r.ok, true);
    assert.strictEqual(fetches, before + 1, "未知 kid 應重抓一次");
    ok("未知 kid → 重抓 JWKS 一次 → 新 key 生效");
    const before2 = fetches;
    const r2 = await verifyAccessJwt(await mint(bad, base()), opts);   // 又一個未知 kid,60 秒內
    assert.strictEqual(r2.ok, false); assert.strictEqual(r2.reason, "unknown_kid");
    assert.strictEqual(fetches, before2, "60 秒內第二次未知 kid 不該再抓");
    ok("60 秒內再遇未知 kid → 不重抓(節流,防放大)");
    nowSec += 61;
    await verifyAccessJwt(await mint(bad, base()), opts);
    assert.strictEqual(fetches, before2 + 1);
    ok("過了 60 秒 → 允許再抓一次");
  }

  console.log("\ndecodeJwt 不驗簽(只拆)");
  {
    const t = await mint(k1, base());
    const d = decodeJwt(t);
    assert.strictEqual(d.header.alg, "RS256"); assert.strictEqual(d.payload.email, EMAIL);
    ok("decodeJwt 拆得出 header/payload(供除錯,不可當驗證)");
  }

  console.log(`\nPASS — ${passed} 條`);
})().catch((e) => { console.error("\nFAIL —", e && e.stack || e); process.exit(1); });
