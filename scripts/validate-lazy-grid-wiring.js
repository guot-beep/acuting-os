/* 延遲渲染的接線閘門(2026-09-07,包 C 審查 H2)
 *
 * 包 C 把五個知識分頁的清單改成「切到該 workspace 才畫第一次」(js/knowledge.js renderWhenWorkspaceOpens)。
 * 這批新造的失效模式是「grid 無聲留白」:樣板留空 → 卻沒有人在 workspace 打開時去畫、或 workspace 名字打錯
 * (router.js 的 WORKSPACES 裡沒有那個名字,hashchange 永遠等不到)。12 支既有驗證器全讀原始碼字串、一支都不開
 * js/knowledge.js,所以全綠也擋不住。這支只做三件事,不需要瀏覽器:
 *   1. 每個「樣板留空」的 grid 容器(id="…Grid"></div> / 交給 renderWhenWorkspaceOpens 的 symptomRecords / condition)
 *      在同一個區塊裡必須有一次 renderWhenWorkspaceOpens("<ws>", …)。
 *   2. 每個 renderWhenWorkspaceOpens 的 <ws> 必須在 js/router.js 的 WORKSPACES 裡,而且 index.html 有 data-workspace="<ws>" 的 section。
 *   3. renderWhenWorkspaceOpens 只能有一份實作(renderDxOnce 那種同機制第二套不准再長回來)。
 * 負控:把任一 <ws> 打錯、把某個空 grid 的 renderWhenWorkspaceOpens 拿掉,這裡要紅。
 * 用法:node scripts/validate-lazy-grid-wiring.js [--self-test]
 */
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

function check(knowledgeSrc, routerSrc, htmlSrc) {
  const failures = [];
  const wsMatch = routerSrc.match(/const WORKSPACES = \[([^\]]+)\]/);
  const workspaces = wsMatch ? [...wsMatch[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1]) : [];
  if (!workspaces.length) failures.push("js/router.js 找不到 WORKSPACES 清單(抽 0 筆一律 FAIL)");
  const htmlWs = new Set([...htmlSrc.matchAll(/data-workspace="([a-z]+)"/g)].map((m) => m[1]));

  // 1. 樣板留空的容器 → 必須有 renderWhenWorkspaceOpens
  const emptyGrids = [...knowledgeSrc.matchAll(/id="([a-zA-Z]+(?:Grid|Records))"><\/div>/g)].map((m) => ({ id: m[1], at: m.index }));
  const lazyCalls = [...knowledgeSrc.matchAll(/renderWhenWorkspaceOpens\("([a-z]+)",\s*([a-zA-Z_$][\w$]*)\)/g)].map((m) => ({ ws: m[1], fn: m[2], at: m.index }));
  if (!emptyGrids.length) failures.push("js/knowledge.js 沒有任何樣板留空的 grid(抽 0 筆一律 FAIL:選擇器過期了?)");
  if (!lazyCalls.length) failures.push("js/knowledge.js 沒有任何 renderWhenWorkspaceOpens(...) 呼叫");
  const WINDOW = 12000;   // 同一個區塊:容器樣板與它的 lazy 呼叫在原始碼裡相距不超過這麼多字元
  for (const g of emptyGrids) {
    // 容器 id 對應的 workspace:formulaGrid → formula、conditionGrid → condition。要對到**同名**的呼叫,
    // 不是「附近有任一個呼叫」—— 拿掉 pharm 那條時,後面 comparison 的呼叫也在視窗內,鬆的判準會漏(自測抓到)。
    const ws = g.id.replace(/(Grid|Records)$/, "");
    const near = lazyCalls.find((c) => c.ws === ws && c.at > g.at && c.at - g.at < WINDOW);
    if (!near) failures.push(`容器 #${g.id} 樣板留空,但後面 ${WINDOW} 字元內沒有 renderWhenWorkspaceOpens("${ws}", …) 去畫它 → 那一頁會無聲留白`);
  }
  // 2. ws 名字必須存在
  for (const c of lazyCalls) {
    if (!workspaces.includes(c.ws)) failures.push(`renderWhenWorkspaceOpens("${c.ws}") 的 workspace 不在 router.js WORKSPACES(${workspaces.join(",")})→ hashchange 永遠等不到`);
    if (!htmlWs.has(c.ws)) failures.push(`renderWhenWorkspaceOpens("${c.ws}") 在 index.html 沒有 data-workspace="${c.ws}" 的 section`);
  }
  // 3. 只准一份實作
  const impls = (knowledgeSrc.match(/function renderWhenWorkspaceOpens\(/g) || []).length;
  if (impls !== 1) failures.push(`renderWhenWorkspaceOpens 實作有 ${impls} 份(要剛好 1 份)`);
  const shadow = knowledgeSrc.match(/dataset\.activeWs !== "[a-z]+"\) return;/g) || [];
  if (shadow.length) failures.push(`還有 ${shadow.length} 處自己寫的 activeWs 判斷(renderDxOnce 型第二套),請改走 renderWhenWorkspaceOpens:${shadow.join(" | ")}`);
  return { failures, emptyGrids: emptyGrids.map((g) => g.id), lazyCalls: lazyCalls.map((c) => `${c.ws}←${c.fn}`), workspaces };
}

if (process.argv.includes("--self-test")) {
  const k = fs.readFileSync(path.join(root, "js/knowledge.js"), "utf8");
  const r = fs.readFileSync(path.join(root, "js/router.js"), "utf8");
  const h = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const cases = [
    ["原樣要綠", check(k, r, h).failures.length === 0],
    ["ws 打錯要紅", check(k.replace('renderWhenWorkspaceOpens("herb"', 'renderWhenWorkspaceOpens("herbs"'), r, h).failures.some((f) => /"herbs"/.test(f))],
    ["拿掉某個空 grid 的 lazy 呼叫要紅", check(k.split("\n").filter((line) => !/renderWhenWorkspaceOpens\("pharm"/.test(line)).join("\n"), r, h).failures.some((f) => /#pharmGrid/.test(f))],
    ["第二套 activeWs 判斷長回來要紅", check(k + '\n  if (document.body.dataset.activeWs !== "condition") return;\n', r, h).failures.some((f) => /第二套/.test(f))],
    ["router 沒有 WORKSPACES 要紅", check(k, "", h).failures.length > 0]
  ];
  let bad = 0;
  for (const [label, ok] of cases) { console.log(`  ${ok ? "✓" : "✗"} ${label}`); if (!ok) bad++; }
  console.log(bad ? `\nFAIL — self-test ${bad} 條` : `\nPASS — self-test ${cases.length} 條`);
  process.exit(bad ? 1 : 0);
}

const result = check(
  fs.readFileSync(path.join(root, "js/knowledge.js"), "utf8"),
  fs.readFileSync(path.join(root, "js/router.js"), "utf8"),
  fs.readFileSync(path.join(root, "index.html"), "utf8")
);
console.log(`延遲渲染接線:空樣板容器 ${result.emptyGrids.length}(${result.emptyGrids.join(", ")})· lazy 呼叫 ${result.lazyCalls.length}(${result.lazyCalls.join(", ")})· router workspaces ${result.workspaces.length}`);
for (const f of result.failures) console.log(`  ✗ ${f}`);
console.log(result.failures.length ? `\nFAIL — ${result.failures.length} 條` : "\nPASS — 每個留空的 grid 都有人在 workspace 打開時去畫,workspace 名字都存在,實作只有一份。");
process.exit(result.failures.length ? 1 : 0);
