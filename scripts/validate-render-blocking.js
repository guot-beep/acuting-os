#!/usr/bin/env node
/**
 * validate-render-blocking.js — P0 字型不阻塞的四條不變式，從註解換成 exit 1。
 *
 * 機制背景（#92）：Chromium 讓所有 script 執行（含外部 defer）等 in-flight 的
 * render-blocking stylesheet。styles.css 第 1 行的 @import Google Fonts 讓整個
 * app 在字型服務慢/被牆時凍 12.5 秒——同一機制已復發兩次（#80 inline script
 * 版、#91）。修法全靠幾條「寫在註解裡」的約定；這支把它們機器化：
 *
 *  R1 任何 *.css（剝 CSS 註解後）不得出現外部 URL 的 @import
 *  R2 index.html / previsit.html 中跨網域 <link rel="stylesheet"> 必須帶
 *     media="print"（非匹配 media 不進 script-blocking 集合；載完由
 *     js/fonts.js 翻轉）
 *  R3 index.html 不得有 inline classic script（有 <script> 開標籤、無 src、
 *     type 非 module）——#80 的成文教訓。既有的 onclick 屬性 handler 與
 *     inline <style> 不在此規則內，規則只針對 <script> 標籤。
 *  R4 js/fonts.js 必須有 load 監聽與 error 監聽，且 media = "all" 的賦值
 *     恰好一次、位於 flip 函式體內——擋掉「精簡成一行 link.media='all'」
 *     這種善意的災難（弱守衛，但誤刪監聽會被抓到）。
 *
 * Usage: node scripts/validate-render-blocking.js
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
let failures = 0;
const fail = (msg) => { failures++; console.error("FAIL: " + msg); };
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

// ---- R1 CSS @import 外部 URL ----
{
  const cssFiles = execSync("git ls-files '*.css'", { cwd: ROOT, encoding: "utf8" }).trim().split("\n").filter(Boolean);
  for (const rel of cssFiles) {
    const src = read(rel).replace(/\/\*[\s\S]*?\*\//g, "");
    const hit = src.match(/@import\s+(?:url\(\s*)?["']?https?:[^\n]*/);
    if (hit) fail(`R1 ${rel} 有外部 @import（render-blocking 柵欄復活）：${hit[0].slice(0, 80)}`);
  }
  if (!failures) console.log(`OK: R1 ${cssFiles.length} 個 css 檔無外部 @import`);
}

// ---- R2 跨網域 stylesheet 必須 media="print" ----
{
  let r2 = 0;
  for (const page of ["index.html", "previsit.html"]) {
    const html = read(page).replace(/<!--[\s\S]*?-->/g, "");
    for (const m of html.matchAll(/<link\b[^>]*>/g)) {
      const tag = m[0];
      if (!/rel="stylesheet"/.test(tag)) continue;
      if (!/href="https?:\/\//.test(tag)) continue;
      if (!/media="print"/.test(tag)) { fail(`R2 ${page} 跨網域 stylesheet 沒帶 media="print"（會進 script-blocking 集合）：${tag.slice(0, 120)}`); r2++; }
    }
  }
  if (!r2) console.log('OK: R2 跨網域 stylesheet 全部 media="print"');
}

// ---- R3 index.html 禁 inline classic script ----
{
  let r3 = 0;
  const html = read("index.html").replace(/<!--[\s\S]*?-->/g, "");
  for (const m of html.matchAll(/<script\b[^>]*>/g)) {
    const tag = m[0];
    if (/\bsrc="/.test(tag)) continue;
    if (/type="module"/.test(tag)) continue;
    fail(`R3 index.html 有 inline classic script（parser-block 等 in-flight stylesheet——#80 教訓）：${tag.slice(0, 120)}`);
    r3++;
  }
  if (!r3) console.log("OK: R3 index.html 無 inline classic script");
}

// ---- R4 js/fonts.js 翻轉驅動完整性 ----
{
  const src = read("js/fonts.js").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/[^\n]*$/gm, "");
  let r4 = 0;
  if (!/addEventListener\("load"/.test(src)) { fail("R4 js/fonts.js 缺 load 監聽"); r4++; }
  if (!/addEventListener\("error"/.test(src)) { fail("R4 js/fonts.js 缺 error 監聽（字型伺服器 4xx/5xx 會空轉滿 6 秒）"); r4++; }
  const assigns = [...src.matchAll(/\.media\s*=\s*"all"/g)];
  if (assigns.length !== 1) { fail(`R4 js/fonts.js 的 media = "all" 賦值出現 ${assigns.length} 次（必須恰好 1 次，且在 flip 函式體內）`); r4++; }
  else {
    const flipStart = src.indexOf("function flip(");
    const nextFn = src.indexOf("function ", flipStart + 1);
    const pos = assigns[0].index;
    if (flipStart < 0 || pos < flipStart || (nextFn > 0 && pos > nextFn)) {
      fail('R4 media = "all" 賦值不在 flip 函式體內——無條件翻轉會重演凍結'); r4++;
    }
  }
  if (!r4) console.log("OK: R4 fonts.js 翻轉驅動完整（load+error 監聽、單一受控翻轉點）");
}

if (failures) { console.error(`validate-render-blocking: ${failures} defects`); process.exit(1); }
console.log("validate-render-blocking: PASS");
