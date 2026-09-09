/* 穴位清單延遲渲染的接線閘門(2026-09-07 包 C 候選 A)
 *
 * 包 C 候選 A 把穴位目錄 `#cards`(947 張卡 / 13,767 個節點 / 1,894 個 listener,佔開機 DOM 的 39.5%)
 * 改成「進 acu workspace 才畫第一次」(app.js renderCardsWhenAcuOpen)。這批新造的失效模式只有一種形狀:
 * **穴位清單無聲變空** —— 而 app.js 的 render() 全檔 25 處呼叫、檔頭已經有一整排 TDZ 警告,
 * 而 15 支既有的 validate-*render*.js 全都是讀原始碼字串的靜態檢查、沒有一支會發現「清單沒被畫」。
 *
 * 為什麼不併進 scripts/validate-lazy-grid-wiring.js:那支守的是 js/knowledge.js 的
 * renderWhenWorkspaceOpens,而那個 helper **只看 document.body.dataset.activeWs**。
 * 這條路不能照抄:index.html 的 script 順序是 app.js → router.js → js/knowledge.js,
 * app.js 註冊的 hashchange 監聽器跑在 router 的 route() 之前,那一刻 activeWs 還是上一頁的值。
 * 兩個機制的**契約不同**(一個看 activeWs,一個以 hash 為權威),所以是兩支閘門、兩份負控,
 * 不是同一個機制長出第二套實作。RENDER_COST_2026-09-07 §7 第 5 點那條「收斂成一份」講的是
 * renderDxOnce 與 renderWhenWorkspaceOpens,不含這一條。
 *
 * 這支只做八件事,不需要瀏覽器:
 *   1. `ACU_WORKSPACE` 的值必須在 js/router.js 的 WORKSPACES 裡,且 index.html 有那個 data-workspace 的 section。
 *   2. render() 必須走 renderCardsWhenAcuOpen(),不准直接叫 renderCards()。
 *   3. renderCardsWhenAcuOpen 必須真的呼叫 renderCards(),而且守門用的是 acuCardsShouldRender()。
 *   4. `acuCardsRendered = true` 必須排在 renderCards() **之後**(render 丟例外時不准把旗標鎖死 → 永久留白)。
 *   5. 一定要有 hashchange 觸發點(切到 acu 才補畫的唯一事件來源)。
 *   6. 一定要有開機期 settle(DOMContentLoaded / load):defer script 全部跑完才問得出 router 載到沒有。
 *   7. fail-open:settle 之後 activeWs 仍不存在(router.js 沒載到、所有 section 攤開)必須照舊全部畫。
 *   8. 三個狀態變數必須宣告在第一個 render() 之前(TDZ:let 在下面 = ReferenceError = render() 整個中止)。
 *
 * 自測全在記憶體裡的字串副本上做,**不寫工作區任何檔案**(D32 的硬規則 —— 這個專案出過
 * gate 自己寫進追蹤檔、併發 session 把資料弄成永久損壞的事)。
 *
 * 用法:node scripts/validate-lazy-cards-wiring.js [--self-test]
 */
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

/* 用大括號配對抓函式本體,不是用正規表示式抓到下一個 `}` ——
   renderCards 本體裡有樣板字串與巢狀區塊,鬆的判準會把本體截在半路,
   於是「有沒有呼叫 renderCards」這種問題會得到錯的答案(比查不到更糟)。 */
function functionBody(src, name) {
  const decl = `function ${name}(`;
  const at = src.indexOf(decl);
  if (at === -1) return null;
  const open = src.indexOf("{", at);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return { body: src.slice(open + 1, i), at, end: i };
    }
  }
  return null;
}

function countDecl(src, name) {
  return (src.match(new RegExp(`function\\s+${name}\\s*\\(`, "g")) || []).length;
}

function check(appSrc, routerSrc, htmlSrc) {
  const failures = [];
  const facts = {};

  // ── 0. 抽不到就 FAIL,絕不靜默放行(抽 0 筆的掃描每一條「查不到」都成立,報告全錯) ──
  const wsMatch = routerSrc.match(/const WORKSPACES = \[([^\]]+)\]/);
  const workspaces = wsMatch ? [...wsMatch[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1]) : [];
  if (!workspaces.length) failures.push("js/router.js 抽不到 WORKSPACES 清單(抽 0 筆一律 FAIL:選擇器過期了?)");
  const htmlWs = new Set([...htmlSrc.matchAll(/data-workspace="([a-z]+)"/g)].map((m) => m[1]));
  if (!htmlWs.size) failures.push("index.html 抽不到任何 data-workspace section(抽 0 筆一律 FAIL)");
  facts.workspaces = workspaces;

  // ── 1. ACU_WORKSPACE 的名字必須真的存在 ──
  const acuMatch = appSrc.match(/const ACU_WORKSPACE = "([a-zA-Z0-9_-]+)"/);
  const acuWs = acuMatch ? acuMatch[1] : null;
  facts.acuWorkspace = acuWs;
  if (!acuWs) {
    failures.push("app.js 找不到 `const ACU_WORKSPACE = \"…\"` —— 延遲渲染的 workspace 名字沒有單一出處");
  } else {
    if (workspaces.length && !workspaces.includes(acuWs)) {
      failures.push(`ACU_WORKSPACE = "${acuWs}" 不在 js/router.js 的 WORKSPACES(${workspaces.join(",")})→ router 永遠不會切到它,穴位清單永遠不會被畫`);
    }
    if (htmlWs.size && !htmlWs.has(acuWs)) {
      failures.push(`ACU_WORKSPACE = "${acuWs}" 在 index.html 沒有 data-workspace="${acuWs}" 的 section`);
    }
  }

  // ── 2. render() 必須走包裝函式,不准直接叫 renderCards() ──
  const render = functionBody(appSrc, "render");
  if (!render) {
    failures.push("app.js 抽不到 function render() 的本體(抽 0 筆一律 FAIL)");
  } else {
    if (!/renderCardsWhenAcuOpen\s*\(/.test(render.body)) {
      failures.push("render() 裡沒有 renderCardsWhenAcuOpen(…) —— 穴位清單沒有人畫,#cards 會永遠是空的");
    }
    if (/(^|[^a-zA-Z_$.])renderCards\s*\(/.test(render.body)) {
      failures.push("render() 直接呼叫了 renderCards(…) —— 繞過延遲閘門,開機期又會把 13,767 個節點塞回 DOM");
    }
  }

  // ── 3/4. 包裝函式:真的畫、守門正確、旗標排在畫之後 ──
  const implCount = countDecl(appSrc, "renderCardsWhenAcuOpen");
  facts.wrapperImpls = implCount;
  if (implCount !== 1) failures.push(`renderCardsWhenAcuOpen 實作有 ${implCount} 份(要剛好 1 份)`);
  const cardsDecl = countDecl(appSrc, "renderCards");
  facts.renderCardsImpls = cardsDecl;
  if (cardsDecl !== 1) failures.push(`renderCards 實作有 ${cardsDecl} 份(要剛好 1 份)`);

  const wrapper = functionBody(appSrc, "renderCardsWhenAcuOpen");
  if (!wrapper) {
    failures.push("app.js 抽不到 renderCardsWhenAcuOpen 的本體");
  } else {
    const callAt = wrapper.body.search(/(^|[^a-zA-Z_$.])renderCards\s*\(/);
    const flagAt = wrapper.body.search(/acuCardsRendered\s*=\s*true/);
    if (callAt === -1) failures.push("renderCardsWhenAcuOpen 裡沒有真的呼叫 renderCards(…) —— 閘門看起來很綠,清單一張卡都不會出現");
    if (!/acuCardsShouldRender\s*\(/.test(wrapper.body)) failures.push("renderCardsWhenAcuOpen 沒有用 acuCardsShouldRender() 守門");
    if (flagAt === -1) failures.push("renderCardsWhenAcuOpen 沒有把 acuCardsRendered 設成 true —— 每次 render() 都會重畫 947 張卡");
    else if (callAt !== -1 && flagAt < callAt) {
      failures.push("acuCardsRendered = true 排在 renderCards(…) 之前 —— renderCards 丟例外時旗標已鎖死,那一頁會永久留白(審查 M4 同一條)");
    }
  }

  // ── 5. hashchange 觸發點 ──
  const hashHook = appSrc.match(/window\.addEventListener\(\s*"hashchange"\s*,\s*(renderAcuCardsIfWorkspaceOpen)\s*\)/);
  if (!hashHook) {
    failures.push('找不到 window.addEventListener("hashchange", renderAcuCardsIfWorkspaceOpen) —— 從別的分頁切到 acu 時沒有人補畫清單');
  }
  const trigger = functionBody(appSrc, "renderAcuCardsIfWorkspaceOpen");
  if (!trigger) failures.push("app.js 抽不到 renderAcuCardsIfWorkspaceOpen 的本體");
  else {
    if (!/(^|[^a-zA-Z_$.])render\s*\(\s*\)/.test(trigger.body)) {
      failures.push("renderAcuCardsIfWorkspaceOpen 沒有呼叫 render() —— 只補畫卡片會讓 selectedCode 夾取 / detail 三態 / resultCount 不一致");
    }
    if (!/acuCardsShouldRender\s*\(/.test(trigger.body)) {
      failures.push("renderAcuCardsIfWorkspaceOpen 沒有用 acuCardsShouldRender() 判斷,會在還沒切到 acu 時就畫");
    }
  }

  // ── 6. 開機期 settle:defer script 全部跑完那一刻 ──
  const hasDcl = /addEventListener\(\s*"DOMContentLoaded"\s*,\s*settleAcuCardsGate\s*\)/.test(appSrc);
  const hasLoad = /addEventListener\(\s*"load"\s*,\s*settleAcuCardsGate\s*\)/.test(appSrc);
  const hasTimer = /setTimeout\(\s*settleAcuCardsGate\s*,/.test(appSrc);
  facts.settleHooks = [hasDcl && "DOMContentLoaded", hasLoad && "load", hasTimer && "setTimeout"].filter(Boolean);
  if (!hasDcl) failures.push('找不到 addEventListener("DOMContentLoaded", settleAcuCardsGate) —— 開機期沒有結束點,fail-open 永遠不會生效');
  if (!hasLoad && !hasTimer) failures.push("settleAcuCardsGate 只有一個觸發點,沒有備援(load 或 setTimeout)");
  const settle = functionBody(appSrc, "settleAcuCardsGate");
  if (!settle) failures.push("app.js 抽不到 settleAcuCardsGate 的本體");
  else {
    if (!/acuCardsGateSettled\s*=\s*true/.test(settle.body)) failures.push("settleAcuCardsGate 沒有把 acuCardsGateSettled 設成 true");
    if (!/renderAcuCardsIfWorkspaceOpen\s*\(/.test(settle.body)) failures.push("settleAcuCardsGate 沒有在開機期結束時重新判斷一次");
  }

  // ── 7. fail-open:router 沒載到就照舊全部畫 ──
  const gate = functionBody(appSrc, "acuCardsShouldRender");
  if (!gate) {
    failures.push("app.js 抽不到 acuCardsShouldRender 的本體");
  } else {
    if (!/acuCardsGateSettled\s*&&\s*[A-Za-z_$][\w$]*\s*===\s*undefined\s*\)\s*return true/.test(gate.body)) {
      failures.push("acuCardsShouldRender 沒有 fail-open(settle 之後 activeWs 仍是 undefined = router.js 沒載到、所有 section 攤開)→ 穴位清單會無聲留白");
    }
    if (!/hashTargetsAcuWorkspace\s*\(/.test(gate.body)) {
      failures.push("acuCardsShouldRender 沒有問 hash —— app.js 的 hashchange 監聽器跑在 router.js 的 route() 之前,只讀 activeWs 會慢一拍");
    }
    if (!/dataset\.activeWs/.test(gate.body)) {
      failures.push("acuCardsShouldRender 沒有讀 document.body.dataset.activeWs");
    }
  }
  const hashFn = functionBody(appSrc, "hashTargetsAcuWorkspace");
  if (!hashFn) failures.push("app.js 抽不到 hashTargetsAcuWorkspace 的本體");
  else {
    for (const need of ['"#ws/"', '"#point/"', 'section[data-workspace]']) {
      if (!hashFn.body.includes(need)) {
        failures.push(`hashTargetsAcuWorkspace 沒有處理 ${need} —— router.js 的 route() 有這條分支,少一條就會有一種進站方式看到空清單`);
      }
    }
  }

  // ── 8. TDZ:狀態必須宣告在第一個 render() 之前 ──
  const firstRenderCall = appSrc.search(/(^|[^a-zA-Z_$.])render\s*\(\s*\)\s*;/);
  facts.firstRenderCallAt = firstRenderCall;
  if (firstRenderCall === -1) {
    failures.push("app.js 找不到任何 render() 呼叫(抽 0 筆一律 FAIL)");
  } else {
    for (const name of ["ACU_WORKSPACE", "acuCardsRendered", "acuCardsGateSettled"]) {
      const at = appSrc.search(new RegExp(`(const|let)\\s+${name}\\b`));
      if (at === -1) failures.push(`app.js 找不到 ${name} 的宣告`);
      else if (at > firstRenderCall) {
        failures.push(`${name} 宣告在第一個 render() 之後 → TDZ:render() 讀到會丟 ReferenceError 並整個中止,穴位清單無聲變空(檔頭 boot-order 區就是為了這件事)`);
      }
    }
  }

  return { failures, facts };
}

function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }

if (process.argv.includes("--self-test")) {
  const a = read("app.js");
  const r = read("js/router.js");
  const h = read("index.html");
  const hit = (src, rx) => check(src, r, h).failures.some((f) => rx.test(f));
  const cases = [
    ["原樣要綠", check(a, r, h).failures.length === 0],
    ["render() 直接叫 renderCards 要紅",
      hit(a.replace("renderCardsWhenAcuOpen(filtered);", "renderCards(filtered);"), /直接呼叫了 renderCards/)],
    ["拿掉 hashchange 觸發要紅",
      hit(a.replace('window.addEventListener("hashchange", renderAcuCardsIfWorkspaceOpen);', ""), /hashchange/)],
    ["拿掉開機期 settle 要紅",
      hit(a.split("\n").filter((l) => !/settleAcuCardsGate\)/.test(l) && !/setTimeout\(settleAcuCardsGate/.test(l)).join("\n"), /DOMContentLoaded/)],
    ["ACU_WORKSPACE 打錯要紅",
      hit(a.replace('const ACU_WORKSPACE = "acu"', 'const ACU_WORKSPACE = "acupoints"'), /不在 js\/router\.js 的 WORKSPACES/)],
    ["拿掉 fail-open 要紅",
      hit(a.split("\n").filter((l) => !/acuCardsGateSettled && active === undefined/.test(l)).join("\n"), /fail-open/)],
    ["旗標搬到 renderCards 之前要紅",
      hit(a.replace("  renderCards(filtered);\n  acuCardsRendered = true;", "  acuCardsRendered = true;\n  renderCards(filtered);"), /排在 renderCards/)],
    ["包裝函式不真的畫要紅",
      hit(a.replace("  renderCards(filtered);\n  acuCardsRendered = true;", "  acuCardsRendered = true;"), /沒有真的呼叫 renderCards/)],
    ["狀態宣告搬到檔尾(TDZ)要紅",
      hit(a.replace(/^let acuCardsRendered = false;.*$/m, "").concat("\nlet acuCardsRendered = false;\n"), /TDZ/)],
    ["hashTargetsAcuWorkspace 少一條進站方式要紅",
      hit(a.replace('if (hash.startsWith("#point/")) return true;', ""), /#point\//)],
    ["router 抽不到 WORKSPACES 要紅", check(a, "", h).failures.some((f) => /抽 0 筆一律 FAIL/.test(f))]
  ];
  let bad = 0;
  for (const [label, ok] of cases) { console.log(`  ${ok ? "✓" : "✗"} ${label}`); if (!ok) bad++; }
  console.log(bad ? `\nFAIL — self-test ${bad} 條` : `\nPASS — self-test ${cases.length} 條`);
  process.exit(bad ? 1 : 0);
}

const result = check(read("app.js"), read("js/router.js"), read("index.html"));
console.log(
  `穴位清單延遲渲染接線:ACU_WORKSPACE="${result.facts.acuWorkspace}"` +
  `(router workspaces ${result.facts.workspaces.length})· 包裝實作 ${result.facts.wrapperImpls} 份` +
  `· renderCards 實作 ${result.facts.renderCardsImpls} 份· 開機期 settle 觸發點 ${(result.facts.settleHooks || []).join("+") || "(無)"}`
);
for (const f of result.failures) console.log(`  ✗ ${f}`);
console.log(result.failures.length
  ? `\nFAIL — ${result.failures.length} 條`
  : "\nPASS — 穴位清單有人在 acu 打開時畫、workspace 名字存在、router 沒載到會照舊全部畫、狀態不在 TDZ。");
process.exit(result.failures.length ? 1 : 0);
