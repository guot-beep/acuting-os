#!/usr/bin/env node
/**
 * test-m1-fallback-failclosed.js — M1(C2b audit E5;review 升級裁定)
 *
 * app.js 的 loadClinicalCases/persistClinicalCases 在 window.AcuTingClinicalStore
 * 缺失時會直接讀寫 acuting-clinical-cases-v1(v1 鍵),過去完全不看 pointer。
 * 真機已切 v2:若 store 模組沒載入(檔案損壞/舊 checkout/legacy 頁),
 *   - load 會把凍結的 v1 內容當成「現況」回傳(reload 後才發現資料不見)
 *   - persist 會把 v1 鍵(回滾錨)靜默蓋掉
 *
 * 修法:兩個 fallback 路徑加 pointer 檢查。pointer=v2 時 fallback 只准拒絕
 * (load 回空值+鎖唯讀,persist 回 false+零寫入),不准假裝那是正常資料。
 * pointer 非 v2 時 fallback 行為必須完全不變(它仍是合法的救援路徑)。
 *
 * 作法:從 app.js 抽出真正在跑的 loadClinicalCases/persistClinicalCases,
 * 不複製一份邏輯來測。normalizeClinicalCase 依賴 createId/splitList/
 * splitSafetyFlags 等與本次修復無關的函式,故以 identity function 取代
 * (只影響回傳值形狀,不影響本測試要驗的 pointer-gating 行為)。
 *
 * 用法:
 *   node scripts/test-m1-fallback-failclosed.js               # 測目前 app.js(應全 PASS)
 *   node scripts/test-m1-fallback-failclosed.js <path-to-app.js>  # 測任意版本(用來對照舊碼 FAIL)
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const appPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, "app.js");
const app = fs.readFileSync(appPath, "utf8");

function grabFunction(name) {
  const start = app.indexOf("function " + name + "(");
  if (start < 0) throw new Error(`app.js(${appPath}) 裡找不到 function ${name} —— 被改名或移除了,這個測試必須跟著更新,不能默默跳過`);
  let depth = 0;
  for (let j = app.indexOf("{", start); j < app.length; j++) {
    if (app[j] === "{") depth++;
    else if (app[j] === "}") { depth--; if (depth === 0) return app.slice(start, j + 1); }
  }
  throw new Error(`function ${name} 的括號沒有收斂`);
}

// 每個情境都要一個全新的 mock localStorage,並記錄 v1 鍵被寫入的次數,
// 這樣「零寫入」才是可斷言的事實,不是讀 code 猜的。
function mockStorage(init) {
  const kv = new Map(Object.entries(init || {}));
  let v1Writes = 0;
  return {
    kv,
    get v1WriteCount() { return v1Writes; },
    getItem(k) { return kv.has(k) ? kv.get(k) : null; },
    setItem(k, v) {
      if (k === "acuting-clinical-cases-v1") v1Writes++;
      kv.set(k, String(v));
    },
    removeItem(k) { kv.delete(k); },
  };
}

function makeSandbox(storage, store) {
  const alerts = [];
  const sandbox = {
    console,
    localStorage: storage,
    // app.js 在瀏覽器裡 `window.AcuTingClinicalStore` 與裸的 `AcuTingClinicalStore`
    // 是同一顆全域繫結;loadClinicalCases/persistClinicalCases 兩種寫法都用
    // (先用 window.X 判斷存在,再用裸 X 呼叫),sandbox 裡兩者要指向同一物件。
    window: { AcuTingClinicalStore: store },
    AcuTingClinicalStore: store,
    CASE_STORAGE_KEY: "acuting-clinical-cases-v1",
    clinicalCases: [],
    clinicalStoreIntegrityError: null,
    normalizeClinicalCase: (v) => v, // 見檔頭說明:與本測試無關的依賴以 identity 取代
    alert: (msg) => { alerts.push(msg); },
    crypto: { subtle: { digest: async () => new Uint8Array(32).buffer } },
    TextEncoder,
  };
  sandbox.alerts = alerts;
  vm.createContext(sandbox);
  vm.runInContext([
    grabFunction("loadClinicalCases"),
    grabFunction("persistClinicalCases"),
  ].join("\n"), sandbox);
  return sandbox;
}

let pass = 0;
const failures = [];
function check(name, fn) {
  let ok = false;
  let detail = "";
  try { ok = !!fn(); } catch (e) { ok = false; detail = " (" + e.message + ")"; }
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${name}${ok ? "" : detail}`);
  if (ok) pass++; else failures.push(name + detail);
}

console.log(`測試目標:${appPath}\n`);

// ---- 情境 A:pointer=v2、store 缺失 → fail-closed --------------------------
console.log("情境 A — pointer=v2、store 缺失(應鎖唯讀,v1 零寫入)");
{
  const storage = mockStorage({
    "acuting-clinical-active": "v2",
    "acuting-clinical-cases-v1": JSON.stringify([{ id: "case.frozen-rollback-anchor" }]),
  });
  const sandbox = makeSandbox(storage, null); // window.AcuTingClinicalStore 缺失

  const loaded = sandbox.loadClinicalCases();
  check("load 不回傳 v1 內容(不得把凍結的回滾錨當現況)", () =>
    Array.isArray(loaded) && !loaded.some((c) => c && c.id === "case.frozen-rollback-anchor"));
  check("load 後 clinicalStoreIntegrityError 已設定(唯讀鎖啟動)", () =>
    typeof sandbox.clinicalStoreIntegrityError === "string" && sandbox.clinicalStoreIntegrityError.length > 0);
  check("load 有透過 alert 明確告知(不是靜默失敗)", () => sandbox.alerts.length > 0);

  sandbox.clinicalCases = [{ id: "case.new-would-overwrite-anchor" }];
  const persisted = sandbox.persistClinicalCases();
  check("persist 回傳 false(拒絕存檔)", () => persisted === false);
  check("v1 鍵零寫入(回滾錨沒被蓋掉)", () => storage.v1WriteCount === 0);
  check("v1 鍵內容原封不動", () =>
    storage.getItem("acuting-clinical-cases-v1") === JSON.stringify([{ id: "case.frozen-rollback-anchor" }]));
}

// ---- 情境 A2:persist 獨立呼叫(load 未先跑,clinicalStoreIntegrityError 仍是 null)----
console.log("\n情境 A2 — pointer=v2、store 缺失,persist 獨立呼叫(第二道防線)");
{
  const storage = mockStorage({
    "acuting-clinical-active": "v2",
    "acuting-clinical-cases-v1": JSON.stringify([{ id: "case.anchor-2" }]),
  });
  const sandbox = makeSandbox(storage, null);
  sandbox.clinicalCases = [{ id: "case.would-overwrite" }];
  // 刻意不呼叫 loadClinicalCases,直接測 persist 自己的 pointer 檢查
  const persisted = sandbox.persistClinicalCases();
  check("persist 獨立呼叫也回傳 false", () => persisted === false);
  check("v1 鍵零寫入", () => storage.v1WriteCount === 0);
}

// ---- 情境 B:pointer 缺/v1、store 缺失 → fallback 行為不變(回歸保護) -------
console.log("\n情境 B — pointer 缺(v1 模式)、store 缺失(fallback 應正常讀寫)");
{
  const CASES = [{ id: "case.b1" }, { id: "case.b2" }];
  const storage = mockStorage({ "acuting-clinical-cases-v1": JSON.stringify(CASES) });
  const sandbox = makeSandbox(storage, null); // 沒有 acuting-clinical-active 鍵

  const loaded = sandbox.loadClinicalCases();
  check("load 正常讀到 v1 內容", () => Array.isArray(loaded) && loaded.length === 2 && loaded[0].id === "case.b1");
  check("load 沒有誤鎖唯讀", () => sandbox.clinicalStoreIntegrityError === null);

  sandbox.clinicalCases = [{ id: "case.b3" }];
  const persisted = sandbox.persistClinicalCases();
  check("persist 正常回傳 true", () => persisted === true);
  check("v1 鍵確實被寫入一次(合法救援路徑,不受本次修法影響)", () => storage.v1WriteCount === 1);
  check("寫入內容正確", () => JSON.parse(storage.getItem("acuting-clinical-cases-v1"))[0].id === "case.b3");
}

// ---- 情境 B2:pointer 明確等於舊值 "v1" 也不受影響 --------------------------
console.log("\n情境 B2 — pointer=\"v1\"(非 v2)、store 缺失(fallback 應正常讀寫)");
{
  const storage = mockStorage({
    "acuting-clinical-active": "v1",
    "acuting-clinical-cases-v1": JSON.stringify([{ id: "case.b2-1" }]),
  });
  const sandbox = makeSandbox(storage, null);
  const loaded = sandbox.loadClinicalCases();
  check("pointer=v1 時 load 正常讀到 v1 內容", () => Array.isArray(loaded) && loaded[0]?.id === "case.b2-1");
  sandbox.clinicalCases = [{ id: "case.b2-2" }];
  check("pointer=v1 時 persist 正常寫入", () => sandbox.persistClinicalCases() === true && storage.v1WriteCount === 1);
}

// ---- 情境 C:pointer=v2、store 正常 → 完全不受影響 --------------------------
console.log("\n情境 C — pointer=v2、store 正常(不得被本次修法影響)");
{
  const storage = mockStorage({ "acuting-clinical-active": "v2" });
  let savedWith = null;
  const store = {
    load: () => [{ id: "case.v2-loaded" }],
    save: (cases) => { savedWith = cases; },
    // 刻意不提供 activeIsV2/syncPendingPatients:模擬較舊版 store 模組,
    // persistClinicalCases 的 v2 fire-and-forget 分支本就用 `&&` 短路跳過。
  };
  const sandbox = makeSandbox(storage, store);

  const loaded = sandbox.loadClinicalCases();
  check("store 存在時 load 走 store.load(),不受 pointer fallback 檢查影響", () =>
    Array.isArray(loaded) && loaded[0].id === "case.v2-loaded");
  check("store 路徑不會誤鎖唯讀", () => sandbox.clinicalStoreIntegrityError === null);

  sandbox.clinicalCases = [{ id: "case.v2-new" }];
  const persisted = sandbox.persistClinicalCases();
  check("store 存在時 persist 回傳 true", () => persisted === true);
  check("store.save() 被呼叫,且拿到正確資料", () => Array.isArray(savedWith) && savedWith[0].id === "case.v2-new");
  check("v1 鍵完全沒被寫入(v2 模式本就不寫 v1)", () => storage.v1WriteCount === 0);
}

console.log(`\n${failures.length === 0 ? "PASS" : "FAIL"} — ${pass} passed, ${failures.length} failed`);
if (failures.length) {
  console.error("\n失敗項目:");
  failures.forEach((f) => console.error("  ✗ " + f));
  process.exit(1);
}
