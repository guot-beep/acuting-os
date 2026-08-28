#!/usr/bin/env node
/**
 * clinical-normalizer-shape.js — D12 契約凍結的**第四個表面**(2026-08-28)。
 *
 * D30(`2f44501a`)凍結了三個表面:`schema.sql`、匯出信封形狀、localStorage
 * key 名稱。三個都是**檔案**。但真正決定 localStorage 裡存下什麼的是**程式碼**:
 * `normalizeClinicalCase()` / `normalizeSoapNote()` 是兩個白名單建構器,
 * 每次載入都跑、每次存檔都寫回 —— **白名單就是持久化 schema**。
 *
 * 缺口(IMPLEMENTATION_GAP_REVIEW_2026-08-27 §4 G2 負控實測):從
 * `normalizeClinicalCase` 刪掉 `allergyStatus` 一欄,D30 的 gate 與另外四支
 * 臨床驗證器**全部 exit 0**。刪掉的欄位在下一次存檔就從每一筆病歷消失,
 * 沒有錯誤訊息。這支就是把那條路關上。
 *
 * 做法:從 `app.js` 抽出這兩支函式的**原始碼**,在 vm 沙箱裡**真的執行它們**,
 * 讀回傳物件的鍵與型別。不是正規表示式數 `key:` 行 —— 那會把巢狀物件字面量
 * 的鍵一起算進去,也看不出實際型別。缺少的 helper 一律**從 app.js 抓真的那一支**
 * 進沙箱(遞迴),抓不到才退回 stub,並把 stub 清單回報出去(fail-loud:
 * 用假的東西推出來的形狀,必須讓人知道哪幾個是假的)。
 *
 * 巢狀列(exposure events、outcome metrics 等)也要凍:那些欄位一樣會被寫進
 * localStorage。空探針拿不到列(陣列是空的),所以第二輪用 Proxy 探針餵一列
 * 「每個屬性都回傳真值」的假資料,讓過濾器(`.filter(ev => ev && ev.eventType)`)
 * 放行。仍然抓不到形狀的欄位記成 `uncaptured`,由 gate 印出來,不靜默略過。
 */
"use strict";

const MAX_RESOLVE_ROUNDS = 80;

function makeGrabber(appSrc) {
  function braceSlice(startIdx) {
    let depth = 0;
    for (let j = appSrc.indexOf("{", startIdx); j < appSrc.length; j++) {
      if (appSrc[j] === "{") depth++;
      else if (appSrc[j] === "}") { depth--; if (depth === 0) return appSrc.slice(startIdx, j + 1); }
    }
    return null;
  }
  return {
    fn(name) {
      const start = appSrc.indexOf("function " + name + "(");
      return start < 0 ? null : braceSlice(start);
    },
    decl(name) {
      // 單行:const X = ...;
      const oneLine = appSrc.match(new RegExp(`^(?:const|let|var) ${name} = [^\\n]*;$`, "m"));
      if (oneLine) return oneLine[0];
      // 多行物件/陣列字面量:const X = { ... };
      const m = appSrc.match(new RegExp(`^(?:const|let|var) ${name} = [\\[{]`, "m"));
      if (!m) return null;
      const body = braceSlice(m.index);
      return body ? appSrc.slice(m.index, m.index + body.length) + ";" : null;
    },
  };
}

/** 每個屬性都回傳真值的探針列 —— 用來穿過 `.filter(row => row && row.xxx)` */
function probeRow() {
  return new Proxy({}, {
    get(_t, prop) {
      if (prop === Symbol.toPrimitive || prop === "toString" || prop === "valueOf") return () => "1";
      if (prop === Symbol.iterator || typeof prop === "symbol") return undefined;
      if (prop === "map" || prop === "filter" || prop === "forEach" || prop === "slice") return undefined;
      return "1";  // 既是非空字串,Number() 也有限 —— 能同時穿過字串檢查與數值檢查
    },
    has() { return true; },
  });
}

function typeOf(v) {
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  return typeof v;
}

/**
 * @param {string} appSrc app.js 全文
 * @returns {{scopes:Object, uncaptured:string[], resolved:string[], stubbed:string[]}}
 */
function readNormalizerShapes(appSrc) {
  const vm = require("vm");
  const grab = makeGrabber(appSrc);

  const srcSoap = grab.fn("normalizeSoapNote");
  const srcCase = grab.fn("normalizeClinicalCase");
  if (!srcSoap || !srcCase) {
    // fail-loud:被改名或移除本身就是破壞性變更,不能靜默回空形狀
    throw new Error(
      "app.js 裡找不到 normalizeClinicalCase / normalizeSoapNote —— " +
      "被改名或移除了。這兩支是 localStorage 的寫入白名單(D12 契約)," +
      "改名等於改 schema:先寫遷移腳本、記一條 DECISIONS,再動這支驗證器。"
    );
  }

  const sandbox = { console, JSON, Array, Object, Number, String, Boolean, Date, Math, Error, RegExp, isFinite, parseInt, parseFloat };
  vm.createContext(sandbox);
  vm.runInContext(srcSoap + "\n" + srcCase, sandbox);

  const resolved = [];
  const stubbed = [];
  const run = (fnName, arg) => {
    for (let round = 0; round < MAX_RESOLVE_ROUNDS; round++) {
      try { return sandbox[fnName](arg); }
      catch (e) {
        const m = /^(\w+) is not defined$/.exec(e.message || "");
        if (!m) throw e;
        const name = m[1];
        const src = grab.fn(name) || grab.decl(name);
        if (src) { vm.runInContext(src, sandbox); resolved.push(name); }
        else {
          // 抓不到就給一個中性 stub,並記下來讓 gate 印出去
          sandbox[name] = function () { return []; };
          stubbed.push(name);
        }
      }
    }
    throw new Error(`解析 ${fnName} 的相依超過 ${MAX_RESOLVE_ROUNDS} 輪仍未收斂`);
  };

  const emptyCase = run("normalizeClinicalCase", {});
  const emptySoap = run("normalizeSoapNote", {});

  const scopes = {};
  const uncaptured = [];

  const record = (scope, obj) => {
    scopes[scope] = scopes[scope] || {};
    for (const [k, v] of Object.entries(obj)) scopes[scope][k] = typeOf(v);
  };
  record("case", emptyCase);
  record("soap", emptySoap);

  // 巢狀列:對每個陣列欄位餵一列探針,把真的長出來的列形狀也凍住。
  // 分類的用意是把「沒東西可凍」跟「該凍卻凍不到」分開 —— 後者是缺口,要印出來。
  //   scalar_array            列是字串,沒有欄位結構可凍(links 那些)
  //   passthrough_no_whitelist 程式碼原封不動收下整個物件 —— **它根本沒有白名單**
  //   unresolved_no_row       探針穿不過過濾器,形狀沒凍到(真缺口)
  const classify = {};
  const probeRows = (fnName, key, rowValue) => {
    try {
      const rich = run(fnName, { [key]: [rowValue] });
      return Array.isArray(rich[key]) ? rich[key] : [];
    } catch { return []; }
  };
  const nested = (scope, fnName, emptyObj) => {
    for (const [key, val] of Object.entries(emptyObj)) {
      if (!Array.isArray(val)) continue;
      if (scope === "case" && key === "soapNotes") continue; // 由 soap scope 自己涵蓋
      const path = `${scope}.${key}`;
      const rows = probeRows(fnName, key, probeRow());
      if (!rows.length) { classify[path] = "unresolved_no_row"; uncaptured.push(path); continue; }
      const row = rows.find((r) => r && typeof r === "object");
      if (!row) { classify[path] = "scalar_array"; continue; }
      const keys = Object.keys(row);
      if (!keys.length) {
        // 收下整個物件、沒有逐欄位重建 —— 這不是「凍不到」,是「程式碼沒有約束」
        classify[path] = "passthrough_no_whitelist";
        uncaptured.push(path);
        continue;
      }
      classify[path] = "captured";
      record(path, row);
      // 深一層(例如 agentExposures[].events[]):用剛剛抓到的鍵組一個具體的列,
      // 只把要探的那個陣列欄位換成探針,其餘給 "1" 讓過濾器放行
      for (const [ck, cv] of Object.entries(row)) {
        if (!Array.isArray(cv)) continue;
        const deepPath = `${path}.${ck}`;
        const concrete = {};
        for (const k of keys) concrete[k] = "1";
        concrete[ck] = [probeRow()];
        const outer = probeRows(fnName, key, concrete);
        const deepRow = (outer[0] && Array.isArray(outer[0][ck]) ? outer[0][ck] : []).find((r) => r && typeof r === "object");
        if (!deepRow) { classify[deepPath] = "unresolved_no_row"; uncaptured.push(deepPath); continue; }
        if (!Object.keys(deepRow).length) { classify[deepPath] = "passthrough_no_whitelist"; uncaptured.push(deepPath); continue; }
        classify[deepPath] = "captured";
        record(deepPath, deepRow);
      }
    }
  };
  nested("case", "normalizeClinicalCase", emptyCase);
  nested("soap", "normalizeSoapNote", emptySoap);

  return {
    scopes,
    classify,
    uncaptured: [...new Set(uncaptured)].sort(),
    resolved: [...new Set(resolved)].sort(),
    stubbed: [...new Set(stubbed)].sort(),
  };
}

module.exports = { readNormalizerShapes };
