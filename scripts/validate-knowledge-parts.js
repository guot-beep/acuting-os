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
 *  K6 index.html 載入序：六片各出現一次，且全部排在 app.js 之前、app.js 排在
 *     js/knowledge.js 之前——js/knowledge.js 在 IIFE 頂端一次性捕捉 const K，
 *     晚到的鍵它永遠看不到。這條是整個分片設計的地基，之前只有註解在守。
 *  K7 previsit 綁定：outcomeMetrics 必須住 core 片，且 previsit.html 載的是
 *     knowledge_core.js——previsit 有 FALLBACK_PROMPTS，這條斷開時病人只會
 *     悄悄拿到另一套題目，不會有任何錯誤。
 *  K8 node 載入器端到端：六支 node 消費者實際走的 scripts/lib/load-knowledge.js
 *     必須回傳完整鍵集——K1–K5 自己讀檔，loader 內部丟例外時它們照樣全綠。
 *  K9 core 體積天花板 400KB（現值 ~213KB）：previsit 病人端「阻塞式」載 core，
 *     而 build-data 對未分派新鍵只 console.warn——沒有天花板，一顆大鍵靜默
 *     落 core 就讓病人頁回到阻塞巨檔。
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

// ---- K6 index.html 載入序 ----
{
  // 先剝 HTML 註解再抽 <script src>，被註解掉的標籤不算數。
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const srcs = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]);
  const idxOf = (name) => srcs.findIndex((s) => s.endsWith(name));
  const appIdx = idxOf("app.js");
  const knowledgeIdx = idxOf("js/knowledge.js");
  if (appIdx < 0) fail("K6 index.html 找不到 app.js script 標籤");
  if (knowledgeIdx < 0) fail("K6 index.html 找不到 js/knowledge.js script 標籤");
  let k6ok = appIdx >= 0 && knowledgeIdx >= 0;
  for (const name of SHARDS) {
    const file = `knowledge_${name}.js`;
    const hits = srcs.filter((s) => s.endsWith(file)).length;
    const i = idxOf(file);
    if (hits !== 1) { fail(`K6 ${file} 在 index.html 出現 ${hits} 次（必須恰好 1 次）`); k6ok = false; }
    else if (appIdx >= 0 && i > appIdx) { fail(`K6 ${file} 排在 app.js 之後——js/knowledge.js 的一次性捕捉看不到它`); k6ok = false; }
  }
  if (appIdx >= 0 && knowledgeIdx >= 0 && appIdx > knowledgeIdx) { fail("K6 app.js 排在 js/knowledge.js 之後"); k6ok = false; }
  if (k6ok) console.log("OK: K6 載入序——六片全部在 app.js 之前，app.js 在 js/knowledge.js 之前");
}

// ---- K7 previsit 綁定 ----
{
  const owner = keyOwner.get("outcomeMetrics");
  const previsit = fs.readFileSync(path.join(ROOT, "previsit.html"), "utf8");
  const loadsCore = previsit.includes("data/generated/knowledge_core.js");
  if (owner !== "core") fail(`K7 outcomeMetrics 住在 ${owner} 片——previsit 只載 core，會靜默退回 FALLBACK_PROMPTS`);
  if (!loadsCore) fail("K7 previsit.html 沒有載 data/generated/knowledge_core.js");
  if (owner === "core" && loadsCore) console.log("OK: K7 previsit 載 core 片且 outcomeMetrics 在 core");
}

// ---- K8 node 載入器端到端 ----
{
  const K = require("./lib/load-knowledge.js").loadKnowledge();
  if (!K) fail("K8 loadKnowledge() 回 null——六支 node 消費者全部會靜默降級");
  else {
    const kKeys = new Set(Object.keys(K));
    const missing8 = [...keyOwner.keys()].filter((k) => !kKeys.has(k));
    if (missing8.length) fail(`K8 loader 鍵集缺：${missing8.join(", ")}`);
    else console.log(`OK: K8 loadKnowledge() 回傳完整 ${kKeys.size} 鍵`);
  }
}

// ---- K9 core 體積天花板 ----
{
  const CORE_CEILING = 400 * 1024;   // 現值 ~213KB 的兩倍寬容度；病人端阻塞載入這顆
  const size = fs.statSync(path.join(ROOT, "data/generated/knowledge_core.js")).size;
  if (size > CORE_CEILING) fail(`K9 knowledge_core.js ${size}B 超過 ${CORE_CEILING}B 天花板——previsit 病人端阻塞載入這顆檔，查 build-data 是否有新鍵誤落 core`);
  else console.log(`OK: K9 core 片 ${Math.round(size / 1024)}KB ≤ ${CORE_CEILING / 1024}KB`);
}

if (failures) { console.error(`validate-knowledge-parts: ${failures} defects`); process.exit(1); }
console.log("validate-knowledge-parts: PASS");
