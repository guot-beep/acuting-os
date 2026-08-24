#!/usr/bin/env node
/**
 * validate-knowledge-parts.js — 分片無損證明。
 *
 * P1 分包（2026-08-24）：knowledge 切成六片、以 Object.assign 合流。這支證明
 * 「六片合起來 = 單體」，逐鍵到位元組層級：
 *
 *  K1 每片可在沙箱執行且只寫 ACUTING_KNOWLEDGE / ACUTING_KNOWLEDGE_PARTS
 *  K2 分片鍵兩兩互斥（同鍵出現在兩片 = 後片靜默蓋前片，必須擋）
 *  K3 合流鍵集 === 單體鍵集（缺鍵/多鍵都抓）
 *  K4 每個鍵 JSON.stringify(合流值) === JSON.stringify(單體值)（逐位元組）
 *  K5 core 片的 __expected 清單 === 實際存在的片名集合（dataLoadGuard 的
 *     缺片守衛靠這份清單，清單漂移 = 守衛失明）
 *
 * 單體移除（P1-E）後，K3/K4 的對照組換成 build-data 的 PARTS 表宣告。
 * Usage: node scripts/validate-knowledge-parts.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SHARDS = require("./lib/load-knowledge.js").SHARDS;

let failures = 0;
const fail = (msg) => { failures++; console.error("FAIL: " + msg); };

// ---- 載入單體（對照組） ----
const mono = {};
new Function("globalThis", fs.readFileSync(path.join(ROOT, "data/generated/knowledge_data.js"), "utf8") + ";")(mono);
const M = mono.ACUTING_KNOWLEDGE;
if (!M) { console.error("FAIL: knowledge_data.js 沒有設定 ACUTING_KNOWLEDGE"); process.exit(1); }

// ---- 逐片載入 + K1/K2 ----
const merged = {};
const keyOwner = new Map();
for (const name of SHARDS) {
  const rel = `data/generated/knowledge_${name}.js`;
  const g = {};
  try {
    new Function("globalThis", fs.readFileSync(path.join(ROOT, rel), "utf8") + ";")(g);
  } catch (e) {
    fail(`K1 ${rel} 無法執行：${e.message}`);
    continue;
  }
  const extras = Object.keys(g).filter((k) => k !== "ACUTING_KNOWLEDGE" && k !== "ACUTING_KNOWLEDGE_PARTS");
  if (extras.length) fail(`K1 ${rel} 寫了額外的 global：${extras.join(", ")}`);
  const slice = g.ACUTING_KNOWLEDGE || {};
  for (const k of Object.keys(slice)) {
    if (keyOwner.has(k)) fail(`K2 鍵 "${k}" 同時出現在 ${keyOwner.get(k)} 與 ${name} 兩片`);
    keyOwner.set(k, name);
    merged[k] = slice[k];
  }
}
console.log(`OK: ${SHARDS.length} 片載入，合計 ${keyOwner.size} 鍵`);

// ---- K3 鍵集相等 ----
const mKeys = new Set(Object.keys(M));
const missing = [...mKeys].filter((k) => !(k in merged));
const extra = Object.keys(merged).filter((k) => !mKeys.has(k));
if (missing.length) fail(`K3 分片缺少單體的鍵：${missing.join(", ")}`);
if (extra.length) fail(`K3 分片多出單體沒有的鍵：${extra.join(", ")}`);
if (!missing.length && !extra.length) console.log(`OK: 鍵集相等（${mKeys.size} 鍵）`);

// ---- K4 逐鍵位元組相等 ----
let diffs = 0;
for (const k of mKeys) {
  if (!(k in merged)) continue;
  if (JSON.stringify(merged[k]) !== JSON.stringify(M[k])) { fail(`K4 鍵 "${k}" 的內容與單體不同`); diffs++; }
}
if (!diffs) console.log(`OK: 全部 ${mKeys.size} 鍵逐位元組等於單體`);

// ---- K5 __expected 清單 ----
{
  const g = {};
  new Function("globalThis", fs.readFileSync(path.join(ROOT, "data/generated/knowledge_core.js"), "utf8") + ";")(g);
  const expected = (g.ACUTING_KNOWLEDGE_PARTS || {}).__expected;
  if (!Array.isArray(expected)) fail("K5 core 片沒有 __expected 清單");
  else if (JSON.stringify([...expected].sort()) !== JSON.stringify([...SHARDS].sort()))
    fail(`K5 __expected [${expected}] ≠ 分片清單 [${SHARDS}]`);
  else console.log(`OK: __expected 清單與分片一致（${expected.join(", ")}）`);
}

if (failures) { console.error(`validate-knowledge-parts: ${failures} defects`); process.exit(1); }
console.log("validate-knowledge-parts: PASS");
