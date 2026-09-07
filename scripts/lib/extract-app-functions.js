/* 從 app.js 抽出「沒有 DOM 依賴」的頂層函式與常數,讓 node 測試能用真資料跑它們。
 *
 * app.js 是一支 12,000 行的 classic script,頂層 function 都是全域;測試不能 require 它
 * (開頭就 querySelector),只能把要測的函式**逐字**抽出來丟進 vm。抽取靠括號配對,會跳過
 * 字串 / 樣板字串 / 行註解 / 區塊註解;不處理正規表達式字面值裡的引號或括號 ——
 * 目前抽的函式都沒有那種寫法,如果將來有,extract 會丟錯(括號沒配對),測試會紅,不會靜默抽錯。
 *
 * 用法:
 *   const { extractFunctions, extractConsts } = require("./lib/extract-app-functions");
 *   const code = extractConsts(src, ["GR_PER_GROUP"]) + extractFunctions(src, ["txt", "unifiedSearch"]);
 *   vm.runInContext(code, ctx);
 * 注意:vm 裡頂層 const 不會掛到 context 物件上,extractConsts 會改成 var,測試才能從 ctx 讀到。
 */
"use strict";

function extractFunction(src, name) {
  const sig = `\nfunction ${name}(`;
  const at = src.indexOf(sig);
  if (at < 0) throw new Error(`app.js 找不到 function ${name}`);
  if (src.indexOf(sig, at + 1) >= 0) throw new Error(`app.js 有兩個 function ${name},抽取結果不可信`);
  let i = src.indexOf("{", at);
  let depth = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    const nx = src[i + 1];
    if (ch === "/" && nx === "/") { i = src.indexOf("\n", i); continue; }
    if (ch === "/" && nx === "*") { i = src.indexOf("*/", i) + 1; continue; }
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      for (i++; i < src.length && src[i] !== quote; i++) if (src[i] === "\\") i++;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) return src.slice(at + 1, i + 1); }
  }
  throw new Error(`function ${name} 括號沒配對`);
}

function extractConst(src, name) {
  const m = src.match(new RegExp(`^const ${name} = .*;$`, "m"));
  if (!m) throw new Error(`app.js 找不到 const ${name}`);
  return m[0].replace(/^const /, "var ");
}

function extractFunctions(src, names) { return names.map((n) => extractFunction(src, n)).join("\n") + "\n"; }
function extractConsts(src, names) { return names.map((n) => extractConst(src, n)).join("\n") + "\n"; }

module.exports = { extractFunction, extractConst, extractFunctions, extractConsts };
