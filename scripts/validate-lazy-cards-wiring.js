/* 穴位清單延遲渲染的接線閘門(2026-09-07 包 C 候選 A;2026-09-09 審查後加行為測試)
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
 * 不是同一個機制長出第二套實作。
 *
 * 靜態八件事(不需要瀏覽器):
 *   1. `ACU_WORKSPACE` 的值必須在 js/router.js 的 WORKSPACES 裡,且 index.html 有那個 data-workspace 的 section。
 *   2. render() 必須走 renderCardsWhenAcuOpen(),不准直接叫 renderCards()。
 *   3. renderCardsWhenAcuOpen 必須真的呼叫 renderCards(),而且守門用的是 acuCardsShouldRender()。
 *   4. `acuCardsRendered = true` 必須排在 renderCards() **之後**(render 丟例外時不准把旗標鎖死 → 永久留白)。
 *   5. 一定要有**活的**(沒被註解掉的)hashchange 觸發點。
 *   6. 開機期 settle 必須掛在 DOMContentLoaded(+ load 備援),而且**不准用 `readyState === "loading"` 當條件**:
 *      defer script 執行時 readyState 已是 "interactive",那個分支是死碼,實際只剩 setTimeout(0),
 *      而 timer 會搶在還沒下載完的 router.js 之前跑 → 誤判 router 沒載到 → fail-open 全畫 947 張(審查 2026-09-09,三個鏡頭各自實測到)。
 *      setTimeout(settleAcuCardsGate) 只准在 `readyState === "complete"`(兩個事件都過了)的分支裡。
 *   7. fail-open:settle 之後 activeWs 仍不存在(router.js 沒載到、所有 section 攤開)必須照舊全部畫。
 *   8. 三個狀態變數必須宣告在第一個 render() 之前(TDZ:let 在下面 = ReferenceError = render() 整個中止)。
 *
 * 行為測試(審查 2026-09-09 M2:「純形狀比對,15 種語意破壞 14 種仍綠」):
 *   9. 把五個守門函式的原始碼抽出來,在假的 document / window / render / renderCards 上跑真值表 ——
 *      空 hash 不畫、#ws/acu 畫、#ws/home 不畫、#point/ 畫、落在 acu section 的 #id 畫、activeWs=acu 畫、
 *      settle 後 activeWs 不存在才 fail-open、renderCards 收到的是同一個 filtered 陣列(不准 renderCards([]))、
 *      renderCards 丟例外時旗標留在 false、trigger 只在該畫時叫 render()、settle 冪等。
 *      反轉的判斷、永遠 false、`!==`、提前 return、換掉參數,靜態比對看不出來,真值表看得出來。
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

/* 「活的」= 不在行註解後面、也不在區塊註解裡。字串比對抓得到被 `//` 或 `/* */` 註解掉的觸發點,
   這是審查抓到的第一種靜默破壞(註解掉 hashchange 那一行,舊閘門照樣綠)。
   啟發式:同一行前面有 `//`(排除 `://`)、或最近一個 `/*` 在最近一個 `*\/` 之後,就算死的。 */
function isLive(src, idx) {
  const lineStart = src.lastIndexOf("\n", idx - 1) + 1;
  const prefix = src.slice(lineStart, idx);
  if (/(^|[^:])\/\//.test(prefix)) return false;
  const lastOpen = src.lastIndexOf("/*", idx), lastClose = src.lastIndexOf("*/", idx);
  if (lastOpen !== -1 && lastOpen > lastClose) return false;
  return true;
}
function findLive(src, rx) {
  const g = new RegExp(rx.source, rx.flags.includes("g") ? rx.flags : rx.flags + "g");
  let m;
  while ((m = g.exec(src))) { if (isLive(src, m.index)) return m; }
  return null;
}
function lineOf(src, idx) { return src.slice(src.lastIndexOf("\n", idx - 1) + 1, src.indexOf("\n", idx) === -1 ? src.length : src.indexOf("\n", idx)); }
function prevLineOf(src, idx) { const ls = src.lastIndexOf("\n", idx - 1); if (ls <= 0) return ""; return lineOf(src, ls - 1); }

/* ── 行為測試的假環境:只放五個守門函式 + 它們會碰到的全域 ── */
const GATE_FNS = ["hashTargetsAcuWorkspace", "acuCardsShouldRender", "renderCardsWhenAcuOpen", "renderAcuCardsIfWorkspaceOpen", "settleAcuCardsGate"];
function buildHarness(appSrc) {
  const acuMatch = appSrc.match(/const ACU_WORKSPACE = "([a-zA-Z0-9_-]+)"/);
  if (!acuMatch) return null;
  const fns = GATE_FNS.map((n) => { const fb = functionBody(appSrc, n); return fb ? appSrc.slice(fb.at, fb.end + 1) : null; });
  if (fns.some((f) => !f)) return null;
  const body = `
    const ACU_WORKSPACE = ${JSON.stringify(acuMatch[1])};
    let acuCardsRendered = false, acuCardsGateSettled = false;
    const calls = { render: 0, renderCards: [] };
    let renderCardsThrows = false;
    const state = { hash: "", activeWs: undefined, elements: {}, filtered: [] };
    const document = {
      get body() { return { dataset: state.activeWs === undefined ? {} : { activeWs: state.activeWs } }; },
      getElementById(id) { return state.elements[id] || null; }
    };
    const window = { get location() { return { hash: state.hash }; } };
    function renderCards(list) { calls.renderCards.push(list); if (renderCardsThrows) throw new Error("renderCards boom"); }
    function render() { calls.render++; renderCardsWhenAcuOpen(state.filtered); }
    ${fns.join("\n")}
    return {
      set(k, v) { if (k === "rendered") acuCardsRendered = v; else if (k === "settled") acuCardsGateSettled = v; else if (k === "throws") renderCardsThrows = v; else state[k] = v; },
      get() { return { rendered: acuCardsRendered, settled: acuCardsGateSettled, render: calls.render, renderCards: calls.renderCards.slice() }; },
      should: () => acuCardsShouldRender(),
      wrap: (f) => renderCardsWhenAcuOpen(f),
      trigger: () => renderAcuCardsIfWorkspaceOpen(),
      settle: () => settleAcuCardsGate(),
      reset() { acuCardsRendered = false; acuCardsGateSettled = false; calls.render = 0; calls.renderCards.length = 0; renderCardsThrows = false; state.hash = ""; state.activeWs = undefined; state.elements = {}; state.filtered = []; }
    };`;
  try { return { api: new Function(body)(), acu: acuMatch[1] }; } catch (e) { return { error: e }; }
}

function behaviorFailures(appSrc) {
  const built = buildHarness(appSrc);
  if (!built) return ["行為測試:抽不到五個守門函式或 ACU_WORKSPACE(抽 0 筆一律 FAIL)"];
  if (built.error) return [`行為測試:守門函式在假環境裡跑不起來:${built.error.message}`];
  const h = built.api, ACU = built.acu, out = [];
  const expect = (label, cond) => { if (!cond) out.push(`行為測試:${label}`); };
  const section = (ws) => ({ closest: () => ({ getAttribute: () => ws }) });
  let r;
  h.reset(); expect("空 hash、未 settle、無 activeWs 時不該畫(現在會畫)", h.should() === false);
  h.reset(); h.set("hash", "#ws/" + ACU); expect(`#ws/${ACU} 該畫(現在不畫)`, h.should() === true);
  h.reset(); h.set("hash", "#ws/home"); expect("#ws/home 不該畫(現在會畫)", h.should() === false);
  h.reset(); h.set("hash", "#ws/" + ACU + "x"); expect(`#ws/${ACU}x(前綴相同的別的 workspace)不該畫`, h.should() === false);
  h.reset(); h.set("hash", "#point/LI4"); expect("#point/LI4 該畫", h.should() === true);
  h.reset(); h.set("hash", "#pointless"); expect("#pointless(不是 #point/)不該畫", h.should() === false);
  h.reset(); h.set("hash", "#acupointDirectory"); h.set("elements", { acupointDirectory: section(ACU) }); expect("落在 acu section 的 #<id> 該畫", h.should() === true);
  h.reset(); h.set("hash", "#caseWorkspace"); h.set("elements", { caseWorkspace: section("cases") }); expect("落在別的 section 的 #<id> 不該畫", h.should() === false);
  h.reset(); h.set("hash", "#nope"); expect("找不到元素的 #<id> 不該畫", h.should() === false);
  h.reset(); h.set("activeWs", ACU); expect("activeWs=acu 該畫(router 已切好)", h.should() === true);
  h.reset(); h.set("activeWs", "home"); expect("activeWs=home 不該畫", h.should() === false);
  h.reset(); h.set("settled", true); expect("settle 後 activeWs 不存在要 fail-open 全畫(現在不畫 → router 沒載到會無聲留白)", h.should() === true);
  h.reset(); h.set("settled", true); h.set("activeWs", "home"); expect("settle 後 activeWs=home 不該畫(fail-open 判斷反了)", h.should() === false);
  h.reset(); h.set("rendered", true); h.set("activeWs", "home"); expect("畫過之後任何時候都該畫(render() 行為要與改動前相同)", h.should() === true);
  // 包裝函式
  h.reset(); h.set("hash", "#ws/home"); h.wrap([1, 2]); r = h.get(); expect("不該畫時 renderCardsWhenAcuOpen 不准叫 renderCards", r.renderCards.length === 0 && r.rendered === false);
  h.reset(); h.set("hash", "#ws/" + ACU); const arr = [{ code: "LI4" }]; h.wrap(arr); r = h.get();
  expect("該畫時 renderCardsWhenAcuOpen 要叫 renderCards 剛好一次", r.renderCards.length === 1);
  expect("renderCards 收到的必須是同一個 filtered 陣列(不准 renderCards([]) 之類的替身)", r.renderCards[0] === arr);
  expect("畫完 acuCardsRendered 要是 true", r.rendered === true);
  h.reset(); h.set("hash", "#ws/" + ACU); h.set("throws", true); let threw = false; try { h.wrap([]); } catch (e) { threw = true; } r = h.get();
  expect("renderCards 丟例外時例外要往外傳(不吞)", threw);
  expect("renderCards 丟例外時 acuCardsRendered 要留在 false(下次進 acu 再試)", r.rendered === false);
  // 觸發點
  h.reset(); h.set("hash", "#ws/home"); h.trigger(); expect("不該畫時 renderAcuCardsIfWorkspaceOpen 不准叫 render()", h.get().render === 0);
  h.reset(); h.set("hash", "#ws/" + ACU); h.trigger(); r = h.get(); expect("該畫時 renderAcuCardsIfWorkspaceOpen 要走完整 render()(一次)且畫到卡", r.render === 1 && r.renderCards.length === 1 && r.rendered === true);
  h.trigger(); expect("畫過之後 renderAcuCardsIfWorkspaceOpen 不准再叫 render()", h.get().render === 1);
  // settle
  h.reset(); h.set("activeWs", "home"); h.settle(); r = h.get(); expect("settle 要把 acuCardsGateSettled 設 true", r.settled === true); expect("settle 時 activeWs=home 不准畫", r.render === 0);
  h.reset(); h.settle(); r = h.get(); expect("settle 時 activeWs 不存在要 fail-open 走 render()", r.render === 1 && r.rendered === true);
  h.settle(); expect("settle 要冪等(第二次不准再 render)", h.get().render === 1);
  return out;
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

  // ── 5. hashchange 觸發點(要活的) ──
  const hashHook = findLive(appSrc, /window\.addEventListener\(\s*"hashchange"\s*,\s*renderAcuCardsIfWorkspaceOpen\s*\)/);
  if (!hashHook) {
    failures.push('找不到活的 window.addEventListener("hashchange", renderAcuCardsIfWorkspaceOpen)(不存在或被註解掉)—— 從別的分頁切到 acu 時沒有人補畫清單');
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

  // ── 6. 開機期 settle:DOMContentLoaded(活的、沒被 "loading" 條件關掉)+ load 備援;setTimeout 只准在 complete 分支 ──
  const dcl = findLive(appSrc, /addEventListener\(\s*"DOMContentLoaded"\s*,\s*settleAcuCardsGate\s*\)/);
  const load = findLive(appSrc, /addEventListener\(\s*"load"\s*,\s*settleAcuCardsGate\s*\)/);
  const timer = findLive(appSrc, /setTimeout\(\s*settleAcuCardsGate\s*,/);
  facts.settleHooks = [dcl && "DOMContentLoaded", load && "load", timer && "setTimeout(complete)"].filter(Boolean);
  if (!dcl) failures.push('找不到活的 addEventListener("DOMContentLoaded", settleAcuCardsGate) —— 開機期沒有結束點,fail-open 永遠不會生效');
  else {
    const around = prevLineOf(appSrc, dcl.index) + "\n" + lineOf(appSrc, dcl.index);
    if (/readyState\s*===\s*"loading"/.test(around)) {
      failures.push('DOMContentLoaded 的 settle 掛在 `readyState === "loading"` 條件下 —— defer script 執行時 readyState 已是 "interactive",這個分支是死碼;實際只剩 setTimeout(0),會搶在晚到的 router.js 之前 settle → 誤判 router 沒載到 → 首頁全畫 947 張(審查 2026-09-09)');
    }
  }
  if (!load) failures.push('找不到活的 addEventListener("load", settleAcuCardsGate) —— DOMContentLoaded 被別的例外吃掉時沒有備援');
  if (timer) {
    const around = prevLineOf(appSrc, timer.index) + "\n" + lineOf(appSrc, timer.index);
    if (!/readyState\s*===\s*"complete"/.test(around)) {
      failures.push('setTimeout(settleAcuCardsGate, …) 沒有被 `readyState === "complete"` 守著 —— defer 執行期的 timer 會在下一支 defer script(router.js)還沒到時就跑,settle 早於 router 設 data-active-ws → fail-open 全畫');
    }
  }
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

  // ── 9. 行為真值表(靜態比對看不出的:反轉、永遠 false、!==、提前 return、換參數) ──
  const beh = behaviorFailures(appSrc);
  facts.behaviorChecks = beh.length ? "FAIL" : "PASS";
  failures.push(...beh);

  return { failures, facts };
}

function read(rel) { return fs.readFileSync(path.join(root, rel), "utf8"); }

if (process.argv.includes("--self-test")) {
  const a = read("app.js");
  const r = read("js/router.js");
  const h = read("index.html");
  const hit = (src, rx) => check(src, r, h).failures.some((f) => rx.test(f));
  const must = (label, from, to) => { if (!a.includes(from)) { console.log(`  ✗ ${label}(自測樣板找不到「${from.slice(0, 60)}」,app.js 改了要同步改自測)`); return null; } return a.replace(from, to); };
  const NEW_SETTLE = 'if (document.readyState === "complete") setTimeout(settleAcuCardsGate, 0);\nelse document.addEventListener("DOMContentLoaded", settleAcuCardsGate);';
  const OLD_SETTLE = 'if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", settleAcuCardsGate);\nelse setTimeout(settleAcuCardsGate, 0);';
  const HASH_LINE = 'window.addEventListener("hashchange", renderAcuCardsIfWorkspaceOpen);';
  const cases = [
    ["原樣要綠", check(a, r, h).failures.length === 0],
    ["render() 直接叫 renderCards 要紅",
      hit(a.replace("renderCardsWhenAcuOpen(filtered);", "renderCards(filtered);"), /直接呼叫了 renderCards/)],
    ["拿掉 hashchange 觸發要紅", hit(a.replace(HASH_LINE, ""), /hashchange/)],
    ["hashchange 觸發被 // 註解掉要紅", hit(a.replace(HASH_LINE, "// " + HASH_LINE), /hashchange/)],
    ["拿掉開機期 settle 要紅",
      hit(a.split("\n").filter((l) => !/settleAcuCardsGate\)/.test(l) && !/setTimeout\(settleAcuCardsGate/.test(l)).join("\n"), /DOMContentLoaded/)],
    ["settle 接線被 /* */ 包起來要紅", (() => { const s = must("settle 接線被 /* */ 包起來要紅", NEW_SETTLE, "/* " + NEW_SETTLE + " */"); return s !== null && hit(s, /DOMContentLoaded/); })()],
    ["settle 用 readyState === \"loading\" 當條件(死碼)要紅", (() => { const s = must("settle loading", NEW_SETTLE, OLD_SETTLE); return s !== null && hit(s, /"loading"/); })()],
    ["setTimeout settle 沒有 complete 守著要紅", (() => { const s = must("setTimeout 無守", NEW_SETTLE, 'document.addEventListener("DOMContentLoaded", settleAcuCardsGate);\nsetTimeout(settleAcuCardsGate, 0);'); return s !== null && hit(s, /setTimeout\(settleAcuCardsGate/); })()],
    ["ACU_WORKSPACE 打錯要紅",
      hit(a.replace('const ACU_WORKSPACE = "acu"', 'const ACU_WORKSPACE = "acupoints"'), /不在 js\/router\.js 的 WORKSPACES/)],
    ["拿掉 fail-open 要紅",
      hit(a.split("\n").filter((l) => !/acuCardsGateSettled && active === undefined/.test(l)).join("\n"), /fail-open/)],
    ["fail-open 寫成 !== undefined 要紅", (() => { const s = must("fail-open !==", "acuCardsGateSettled && active === undefined", "acuCardsGateSettled && active !== undefined"); return s !== null && hit(s, /fail-open|行為測試/); })()],
    ["activeWs 判斷反轉(!== ACU_WORKSPACE)要紅", (() => { const s = must("activeWs 反轉", "if (active === ACU_WORKSPACE) return true;", "if (active !== ACU_WORKSPACE) return true;"); return s !== null && hit(s, /行為測試/); })()],
    ["hash 判斷永遠 false 要紅", (() => { const s = must("hash 永遠 false", "return hashTargetsAcuWorkspace();", "return false;"); return s !== null && hit(s, /行為測試|沒有問 hash/); })()],
    // 注意:`const hash = window.location.hash || "";` 在 handlePointHashChange 也有一份(排在前面),
    // replace 會先打到那一份 → 自測假綠。要換只在 hashTargetsAcuWorkspace 出現的那一行。
    ["hashTargetsAcuWorkspace 提前 return false 要紅", (() => { const s = must("提前 return", '  if (hash.startsWith("#ws/")) return hash.slice(4) === ACU_WORKSPACE;', '  return false;\n  if (hash.startsWith("#ws/")) return hash.slice(4) === ACU_WORKSPACE;'); return s !== null && hit(s, /行為測試/); })()],
    ["renderCards([]) 替身要紅", (() => { const s = must("renderCards([])", "  renderCards(filtered);\n  acuCardsRendered = true;", "  renderCards([]);\n  acuCardsRendered = true;"); return s !== null && hit(s, /同一個 filtered 陣列/); })()],
    ["旗標搬到 renderCards 之前要紅",
      hit(a.replace("  renderCards(filtered);\n  acuCardsRendered = true;", "  acuCardsRendered = true;\n  renderCards(filtered);"), /排在 renderCards|留在 false/)],
    ["包裝函式不真的畫要紅",
      hit(a.replace("  renderCards(filtered);\n  acuCardsRendered = true;", "  acuCardsRendered = true;"), /沒有真的呼叫 renderCards/)],
    ["trigger 畫過之後還叫 render() 要紅", (() => { const s = must("trigger 重複 render", "  if (acuCardsRendered) return;          // 畫過了:之後由 render() 自己維護\n", ""); return s !== null && hit(s, /不准再叫 render/); })()],
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
  `· renderCards 實作 ${result.facts.renderCardsImpls} 份· 開機期 settle 觸發點 ${(result.facts.settleHooks || []).join("+") || "(無)"}` +
  `· 行為真值表 ${result.facts.behaviorChecks || "(未跑)"}`
);
for (const f of result.failures) console.log(`  ✗ ${f}`);
console.log(result.failures.length
  ? `\nFAIL — ${result.failures.length} 條`
  : "\nPASS — 穴位清單有人在 acu 打開時畫、workspace 名字存在、router 沒載到會照舊全部畫、狀態不在 TDZ、守門真值表全對。");
process.exit(result.failures.length ? 1 : 0);
