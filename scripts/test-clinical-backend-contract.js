#!/usr/bin/env node
/**
 * test-clinical-backend-contract.js — 任何 clinical store backend 都必須通過
 * 的同一套契約(W2-1 前置,2026-08-28)。
 *
 * D18 把 SQLite 遷移改成條件觸發,Phase C 已把遷移面縮到
 * `AcuTingClinicalStore.setBackend(adapter)` 一個插入點。剩下的風險不在
 * 「adapter 寫不寫得出來」,而在**沒有人定義過 adapter 必須滿足什麼**——
 * 到了真的要換 backend 那天,唯一的規格是讀 clinical-store.js 反推,
 * 而那正是最容易漏掉邊角行為的方式。
 *
 * 這支把契約寫成可執行的測試:同一組斷言跑過兩個實作 ——
 *   1. 記憶體 backend(參考實作,本檔內建)
 *   2. localStorage backend(store 的預設路徑)
 * 未來 SQLite/D1 adapter 只要跑得過同一支,就能安全插進 setBackend。
 *
 * 契約(從 clinical-store.js 的 7 個呼叫點反推,逐條驗證過):
 *   C1 read() 回字串或 null —— **不得回空字串代替 null**
 *      (null = 從來沒存過;"" = 存過一個空的東西。兩者在還原時意義相反)
 *   C2 write(s) 之後 read() 必須拿回同一個字串(byte-for-byte)
 *   C3 readKey/writeKey/removeKey 是獨立命名空間,不互相污染
 *   C4 readKey 對沒寫過的 key 回 null
 *   C5 removeKey 之後 readKey 回 null
 *   C6 write 是原子替換 —— 不是 append(存兩次不會變兩份)
 *   C7 任何方法都不得改動傳入的字串(不 trim、不正規化 unicode)
 *
 * 用法:node scripts/test-clinical-backend-contract.js
 */
"use strict";
const assert = require("assert");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// clinical-store.js 在載入時就會摸 global.localStorage,先給一個會爆的樁,
// 確保測試裡任何「忘了設 backend」的路徑都會當場現形而不是靜默用到真的。
global.localStorage = {
  getItem() { throw new Error("test: real localStorage must not be touched"); },
  setItem() { throw new Error("test: real localStorage must not be touched"); },
  removeItem() { throw new Error("test: real localStorage must not be touched"); },
};
require(path.join(ROOT, "js/clinical-store.js"));
const S = globalThis.AcuTingClinicalStore;

let pass = 0;
const ok = (m) => { pass++; console.log("    ✓ " + m); };

/* 參考實作:最小的合格 backend。SQLite adapter 的形狀應該與它等價 ——
   差別只在 read/write 打到哪裡,契約行為必須一模一樣。 */
function memoryBackend() {
  const main = { value: null };
  const kv = new Map();
  return {
    read: () => main.value,
    write: (s) => { main.value = s; },
    readKey: (k) => (kv.has(k) ? kv.get(k) : null),
    writeKey: (k, v) => { kv.set(k, v); },
    removeKey: (k) => { kv.delete(k); },
  };
}

/* localStorage backend:store 的預設路徑。用假的 localStorage 驗同一套契約,
   確認「預設行為」與「參考實作」沒有分歧 —— 有分歧的話,換 backend 那天
   會出現只在某一邊發生的 bug。 */
function localStorageBackend() {
  const kv = new Map();
  const KEY = "acuting-clinical-cases-v1";
  return {
    read: () => (kv.has(KEY) ? kv.get(KEY) : null),
    write: (s) => { kv.set(KEY, s); },
    readKey: (k) => (kv.has(k) ? kv.get(k) : null),
    writeKey: (k, v) => { kv.set(k, String(v)); },
    removeKey: (k) => { kv.delete(k); },
  };
}

function runContract(name, make) {
  console.log(`\n  ${name}`);
  const b = make();

  // C1 未寫入時 read() 回 null,不是 ""
  assert.strictEqual(b.read(), null, "C1: 未寫入時 read() 必須回 null");
  ok("C1 未寫入時 read() 回 null(不是空字串 —— 兩者在還原時意義相反)");

  // C2 round-trip 逐位元組
  const payload = JSON.stringify([{ id: "case.x", note: "中文 with ünïcode  雙空格 " }], null, 2);
  b.write(payload);
  assert.strictEqual(b.read(), payload, "C2: read 回來的字串與寫進去的不同");
  ok("C2 write→read 逐位元組相同(含中文/unicode/尾隨空白)");

  // C7 不得改動字串
  const tricky = "  \t前後空白與 \\n 跳脫  ";
  b.writeKey("k.tricky", tricky);
  assert.strictEqual(b.readKey("k.tricky"), tricky, "C7: 字串被改動了(trim?正規化?)");
  ok("C7 不 trim、不正規化 —— 存什麼讀什麼");

  /* C3 store 實際使用的 key 不得污染主槽。
     第一版測的是「writeKey 到主槽 key 也不能影響 read()」—— 那在
     localStorage backend 上必然失敗,因為主槽的 key 就是
     acuting-clinical-cases-v1,同一個 key 當然是同一格。查過 store 的
     7 個呼叫點:writeKey 只用在 STAGING/POINTER/CANDIDATE 三個 key,
     從不寫主槽 key。所以契約該說的是這三個,不是「任意 key」——
     一個比實際用法更嚴的契約會擋掉合格的 adapter。 */
  const STORE_KEYS = ["acuting-clinical-v2-staging", "acuting-clinical-active", "acuting-clinical-v2-staging-candidate"];
  for (const k of STORE_KEYS) b.writeKey(k, "KV-" + k);
  assert.strictEqual(b.read(), payload, "C3: store 用的 key 污染了 read() 的主槽");
  for (const k of STORE_KEYS) assert.strictEqual(b.readKey(k), "KV-" + k, `C3: ${k} 互相覆蓋`);
  ok("C3 store 的三個 key(staging/pointer/candidate)彼此獨立且不污染主槽");

  // C4 沒寫過的 key
  assert.strictEqual(b.readKey("k.never-written"), null, "C4: 未寫入的 key 應回 null");
  ok("C4 未寫入的 key 回 null");

  // C5 removeKey
  b.writeKey("k.temp", "x");
  b.removeKey("k.temp");
  assert.strictEqual(b.readKey("k.temp"), null, "C5: removeKey 之後仍讀得到");
  ok("C5 removeKey 之後回 null");

  // C6 write 是原子替換不是 append
  b.write("A");
  b.write("B");
  assert.strictEqual(b.read(), "B", "C6: write 不是原子替換");
  ok("C6 write 是原子替換(存兩次不會變兩份)");
}

console.log("clinical store backend 契約(任何 backend 都要通過同一套)");
runContract("記憶體 backend(參考實作 —— SQLite adapter 應與它等價)", memoryBackend);
runContract("localStorage backend(store 預設路徑)", localStorageBackend);

/* 真正插進 store 跑一次:契約測試若只測 backend 自己,可能測到一個
   「行為正確但 store 用不了」的實作。這段把它接上 setBackend 走真實 API。 */
console.log("\n  插進 AcuTingClinicalStore 走真實 API");
{
  const b = memoryBackend();
  S.setBackend(b);
  assert.deepStrictEqual(S.load(), [], "空 backend 應載出空陣列");
  ok("空 backend → load() 回 []");

  const cases = [{ id: "case.contract", patientCode: "P-2099-999", caseTitle: "契約測試", soapNotes: [] }];
  S.save(cases);
  const back = S.load();
  assert.strictEqual(back.length, 1, "存一筆讀回來應有一筆");
  assert.strictEqual(back[0].id, "case.contract");
  ok("save→load round-trip 經過 store 的正規化仍保住 id");

  // backend 換掉之後,舊 backend 的資料不該漏過來
  const b2 = memoryBackend();
  S.setBackend(b2);
  assert.deepStrictEqual(S.load(), [], "換 backend 之後仍讀到舊資料 —— 有快取沒清");
  ok("換 backend 後不殘留舊資料(store 沒有偷偷快取)");
}

/* 負控:證明這支測得到不合格的 backend。 */
console.log("\n  負控(不合格的 backend 必須被抓出來)");
{
  const badNull = { ...memoryBackend(), read: () => "" };   // C1 違規:空字串冒充 null
  let caught = false;
  try { runContract("(不該印出)", () => badNull); } catch { caught = true; }
  assert(caught, "負控失效:read() 回空字串竟然通過 C1");
  ok("負控1 read() 用 \"\" 冒充 null → C1 會失敗");

  const badTrim = memoryBackend();
  const origWriteKey = badTrim.writeKey;
  badTrim.writeKey = (k, v) => origWriteKey(k, String(v).trim());   // C7 違規
  caught = false;
  try { runContract("(不該印出)", () => badTrim); } catch { caught = true; }
  assert(caught, "負控失效:writeKey 偷偷 trim 竟然通過 C7");
  ok("負控2 writeKey 偷偷 trim → C7 會失敗");
}

console.log(`\n${pass} passed — backend 契約成立。SQLite/D1 adapter 跑得過這支即可插進 setBackend。`);
