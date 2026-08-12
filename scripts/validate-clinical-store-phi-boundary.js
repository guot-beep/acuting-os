#!/usr/bin/env node
/**
 * validate-clinical-store-phi-boundary.js — Codex P4 seam HIGH-1 的機器強制面
 *
 * `JSON.parse` 失敗時,V8 會把**一段原始輸入**放進錯誤訊息:
 *   Unexpected token 'x', "PATIENT_SE"... is not valid JSON
 * 而 clinical-store 解析的是病歷。那些 throw 會被 app.js 的 catch 放進 alert、
 * 也會被 patient view 印到頁面 —— 病人資料就這樣從「儲存層壞掉」變成「螢幕上」。
 *
 * 兩件事分開檢查,因為它們會分別退化:
 *   1. 靜態:clinical-store.js 內不得出現未經 parseJsonOrThrow 包裝的 JSON.parse
 *      (已知合法例外列在 ALLOWED —— 它們自己的 catch 就地改寫成 parseFailureDetail)
 *   2. 行為:真的餵一份含病歷字樣的壞 JSON 進去,確認丟出的訊息不含其中任何片段
 *
 * 只做第 1 條會被「包了但包錯」騙過;只做第 2 條會漏掉新增的解析點 ——
 * 新的解析點在測試沒覆蓋到的路徑上,行為測試永遠不會走到它。
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "js/clinical-store.js");
const source = fs.readFileSync(SRC, "utf8");

// 就地把錯誤改寫成 parseFailureDetail 的既有解析點,逐行列出而不是用模式放行 ——
// 模式會連未來新增的一起放行。新增解析點請改用 parseJsonOrThrow。
const ALLOWED = [
  "return JSON.parse(raw);", // parseJsonOrThrow 自己
  'try { env = JSON.parse(raw); } catch (e) { throw new Error(`clinical-store: pointer=v2 but staging envelope is CORRUPT (${context}): ${parseFailureDetail(raw)}`); }',
  "parsed = JSON.parse(saved);", // load():catch 用 parseFailureDetail
  'try { env = JSON.parse(envelopeText); } catch { return fail(["envelope is not valid JSON"]); }',
  "try { currentEnv = JSON.parse(anchorRaw); }", // catch 用 parseFailureDetail
];

const bare = [];
source.split("\n").forEach((line, i) => {
  if (!/JSON\.parse\(/.test(line)) return;
  if (/^\s*\*/.test(line) || /^\s*\/\//.test(line)) return; // 註解
  if (ALLOWED.some((a) => line.includes(a))) return;
  bare.push(`js/clinical-store.js:${i + 1}  ${line.trim().slice(0, 100)}`);
});

/* app.js 也要掃(SOL R-13)。
 * 這支守衛原本只看 clinical-store.js,而 app.js 自己也解析病歷:載入的
 * fallback 路徑、匯出的 staging、匯入的備份檔。R-13 就是漏在這裡 ——
 * `exportClinicalCases()` 的裸 `JSON.parse` 未被捕捉,staging 毀損時
 * parser 訊息(含內容前 10 字)直接進 console。
 *
 * 只挑「碰臨床儲存」的解析行,其餘(知識庫快取、草稿、穴位匯入)不在此列。
 * 同樣逐行列出而不是用模式放行:模式會連未來新增的一起放行。 */
const APP = path.join(ROOT, "app.js");
const appSource = fs.readFileSync(APP, "utf8");
const CLINICAL_PARSE_RE = /STAGING_KEY|CASE_STORAGE_KEY|reader\.result|acuting-clinical/;
const APP_ALLOWED = [
  // loadClinicalCases 的 store-missing fallback:catch 只報長度,不轉述內容
  "const parsed = JSON.parse(saved);",
  // exportClinicalCases:try/catch 就地改寫成長度訊息(R-13 修復)
  "staging = JSON.parse(rawStaging);",
  // importClinicalCases:最外層 catch 是固定文案,不含 e.message;
  // 內層 restoreV2Envelope 的 failures 已經是零內容(見本檔行為檢查)
  "let imported = JSON.parse(reader.result);",
  // 穴位匯入 —— 不是臨床資料,只因為同樣用 reader.result 而被上面的網撈到。
  // catch 是固定文案(「請確認 JSON 是穴位陣列格式」),不轉述 e.message。
  // 留在網內而不是把 regex 改窄:網寬一點、例外逐條記錄,比縮小偵測面安全。
  "const imported = JSON.parse(reader.result);",
];
appSource.split("\n").forEach((line, i) => {
  if (!/JSON\.parse\(/.test(line)) return;
  if (/^\s*\*/.test(line) || /^\s*\/\//.test(line)) return;
  if (!CLINICAL_PARSE_RE.test(line)) return;          // 非臨床資料的解析不管
  if (APP_ALLOWED.some((a) => line.includes(a))) return;
  bare.push(`app.js:${i + 1}  ${line.trim().slice(0, 100)}`);
});

// --- 行為檢查:壞掉的病歷不得出現在錯誤訊息裡 ---
/* fixture 是這個檢查的全部價值,所以先講清楚它為什麼長這樣。
 *
 * V8 有兩種 JSON 解析錯誤訊息,只有一種會夾帶內容:
 *   位置型  "Expected double-quoted property name in JSON at position 66"   ← 不夾帶
 *   token 型 "Unexpected token 'P', \"PATIENT_SE\"... is not valid JSON"     ← 夾帶
 * 而且 token 型只放**開頭 10 個字元**。所以真正的外洩面是「內容的前 10 字」,
 * 不是整份病歷 —— 我第一版用尾端逗號當 fixture,那走的是位置型,
 * 於是把 parseJsonOrThrow 改成轉述 e.message 之後,測試照樣綠燈。
 * 空跑的測試比沒有測試更危險,因為它會發綠燈。
 *
 * 因此 fixture 必須:(a) 觸發 token 型,(b) 開頭就是病人資料。
 * localStorage 被別的東西覆寫、或存進 HTML 錯誤頁,都是這個形狀。 */
const PHI = "PATIENT_SECRET_MRN_88231_林小姐_主訴頭痛";
const CORRUPT = `${PHI} 血壓140/90 —— 這不是 JSON`;
const LEAK_FRAGMENTS = [PHI.slice(0, 10), PHI.slice(0, 8), "PATIENT_SE", "88231", "林小姐", "主訴頭痛"];
require(SRC); // 這個檔案掛在 global 上,不用 module.exports
const store = globalThis.AcuTingClinicalStore;

const behaviour = [];
// async 也要能檢:buildMigrationPlan 回的是 promise,同步 try 接不到它的 rejection,
// 「沒丟錯」會被誤報成 fail-loud 失效 —— 那是測試錯,不是程式錯。
async function checkThrow(label, fn) {
  try {
    await fn();
    behaviour.push(`${label}: 沒有丟出錯誤 —— fail-loud 失效`);
  } catch (e) {
    const msg = String(e && e.message);
    // 逐段比對,不是只找整串:V8 只會嵌入前 10 幾個字元
    const leaked = LEAK_FRAGMENTS.filter((frag) => msg.includes(frag));
    if (leaked.length) behaviour.push(`${label}: 錯誤訊息洩漏 ${JSON.stringify(leaked)} → ${msg.slice(0, 140)}`);
  }
}

const mem = { value: CORRUPT };
if (!store || typeof store.setBackend !== "function") {
  behaviour.push("clinical-store 沒有掛上 global 或缺少 setBackend —— 行為檢查無法執行,視為失敗(空跑不是通過)");
} else {
  globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem: () => {} };
  store.setBackend({ read: () => mem.value, write: (s) => { mem.value = s; } });
}

(async () => {
  if (store && typeof store.setBackend === "function") {
    await checkThrow("load() 讀到毀損的 v1 store", () => store.load());
    await checkThrow("buildMigrationPlan 讀到毀損的 v1 快照", () =>
      store.buildMigrationPlan(CORRUPT, [], async () => "0".repeat(64)));
    await checkThrow("verifyStaging 讀到毀損的 staging", () => {
      store.setBackend({ read: () => mem.value, write: () => {}, readKey: () => CORRUPT, writeKey: () => {} });
      return store.verifyStaging("[]", { sha256: () => "0".repeat(64) }, { source_sha256: "0".repeat(64) });
    });
  }
  report();
})();

function report() {

console.log("clinical-store PHI boundary\n");
console.log(`  未包裝的 JSON.parse   ${bare.length}`);
console.log(`  行為檢查失敗          ${behaviour.length}`);
for (const b of bare) console.log(`\n  ⛔ 未經 parseJsonOrThrow  ${b}`);
for (const b of behaviour) console.log(`\n  ⛔ ${b}`);

  const fail = bare.length + behaviour.length;
  console.log(fail ? `\nFAIL — ${fail} blocking defects.` : "\nPASS — no blocking defects.");
  process.exit(fail ? 1 : 0);
}
