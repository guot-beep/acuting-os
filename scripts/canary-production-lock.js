#!/usr/bin/env node
/**
 * canary-production-lock.js — 上線後的門禁探針(零 cookie、不帶任何憑證、不碰資料)。
 *
 * 兩種模式,判準完全不同,搞混就會把「沒鎖」看成「鎖好了」:
 *
 *   --mode passphrase(預設,Ting 2026-09-02 裁定的做法)
 *     知識庫**必須公開**:`/`、`/index.html`、任意路徑 → 200(這正是 acuting.com 被鎖 2.5 小時的結構性修正)
 *     病例 API **必須擋**:`/__clinical/ping`、`/kv`、`/status` → 401 且 JSON 帶 auth_mode="passphrase"
 *     寫入端點更要擋:未帶通行證的 PUT → 401,而且**不能**是 200/403 之外的假成功
 *
 *   --mode access(舊做法,保留)
 *     每一條路徑(含首頁)都要 302 → *.cloudflareaccess.com 或 401/403
 *
 * 兩種模式共同的反向斷言:acuting.com 與 play.acuting.com 必須匿名 200。
 * 2026-09-02 事故:帳號層級的「All Workers」Access 應用程式把公開主站一起鎖了,
 * 而當時的探針只檢查「該鎖的鎖了沒」,沒檢查「不該鎖的有沒有被波及」。
 *
 * 用法:node scripts/canary-production-lock.js [--url https://…] [--mode passphrase|access]
 */
"use strict";
const argv = process.argv.slice(2);
const at = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const BASE = String(at("--url", "https://acuting-os.guotingru.workers.dev")).replace(/\/+$/, "");
const MODE = String(at("--mode", "passphrase"));
const rnd = Math.random().toString(36).slice(2, 10);
const MUST_BE_PUBLIC = ["https://acuting.com/", "https://play.acuting.com/"];

async function probe(url, init) {
  try {
    const r = await fetch(url, { redirect: "manual", cache: "no-store", ...(init || {}) });
    const loc = r.headers.get("location") || "";
    let text = "";
    try { text = await r.text(); } catch (_) { /* */ }
    let json = null; try { json = JSON.parse(text); } catch (_) { /* */ }
    return { status: r.status, loc, json, text };
  } catch (e) { return { status: 0, loc: "", json: null, text: "", err: e.message }; }
}
const toAccess = (r) => /\.cloudflareaccess\.com/i.test(r.loc);

(async () => {
  let bad = 0;
  console.log(`模式:${MODE}   目標:${BASE}\n`);

  console.log("公開站不得被擋:");
  for (const u of MUST_BE_PUBLIC) {
    const r = await probe(u);
    const okPublic = r.status === 200 && !toAccess(r);
    if (!okPublic) bad++;
    console.log(`  ${okPublic ? "🌐" : "⛔"} ${u.padEnd(34)} ${r.status}${toAccess(r) ? "  → 被 Access 擋住了!" : ""}${r.err ? "  " + r.err : ""}`);
  }

  if (MODE === "access") {
    console.log("\n病例站每一條路徑都要被 Access 擋:");
    for (const p of ["/", "/index.html", "/__clinical/ping", "/__clinical/kv", "/previsit.html", `/nope-${rnd}`]) {
      const r = await probe(BASE + p);
      const locked = toAccess(r) || r.status === 401 || r.status === 403;
      if (!locked) bad++;
      console.log(`  ${locked ? "🔒" : "⛔"} ${p.padEnd(22)} ${r.status}${r.loc ? "  → " + new URL(r.loc).host : ""}`);
    }
  } else {
    console.log("\n知識庫必須公開(通行碼只保護病例):");
    for (const p of ["/", "/index.html", `/nope-${rnd}`]) {
      const r = await probe(BASE + p);
      const okPublic = r.status === 200 && !toAccess(r);
      if (!okPublic) bad++;
      console.log(`  ${okPublic ? "🌐" : "⛔"} ${p.padEnd(22)} ${r.status}${toAccess(r) ? "  → 被 Access 擋住了(通行碼模式不該有 Access)" : ""}`);
    }
    console.log("\n病例 API 必須擋下未帶通行證的請求:");
    for (const p of ["/__clinical/ping", "/__clinical/kv", "/__clinical/status"]) {
      const r = await probe(BASE + p);
      const blocked = r.status === 401 && r.json && r.json.service === "acuting-clinical-sqlite";
      const leaks = !!(r.json && (r.json.keys || r.json.value));
      if (!blocked || leaks) bad++;
      const mode = r.json && r.json.auth_mode ? ` auth_mode=${r.json.auth_mode}` : "";
      console.log(`  ${blocked && !leaks ? "🔒" : "⛔"} ${p.padEnd(22)} ${r.status}${mode}${leaks ? "  ⛔ 回應裡有資料!" : ""}`);
    }
    const w = await probe(`${BASE}/__clinical/kv/acuting-clinical-cases-v1`, {
      method: "PUT", body: "[]", headers: { "Content-Type": "text/plain", "X-AcuTing-Client": "canary", "If-Match": "0" },
    });
    const writeBlocked = w.status === 401 || w.status === 403 || w.status === 503;
    if (!writeBlocked) bad++;
    console.log(`  ${writeBlocked ? "🔒" : "⛔"} ${"PUT(無通行證)".padEnd(20)} ${w.status}${w.status === 200 ? "  ⛔ 竟然寫進去了!" : ""}`);
    /* 亂猜通行碼:401(碼錯)、429(被限流)、409(還沒設定過)都算擋住。
     * 409 是剛部署、她還沒設定的正常狀態 —— 那時連正確的通行碼都還不存在。 */
    const a = await probe(`${BASE}/__clinical/auth`, { method: "POST", body: JSON.stringify({ passphrase: `canary-${rnd}` }), headers: { "Content-Type": "application/json", "X-AcuTing-Client": "canary" } });
    const authOk = a.status === 401 || a.status === 429 || a.status === 409;
    if (!authOk) bad++;
    console.log(`  ${authOk ? "🔒" : "⛔"} ${"auth(亂猜一次)".padEnd(20)} ${a.status}${a.status === 409 ? "  (還沒設定過,正常)" : ""}${a.status === 200 ? "  ⛔ 亂猜竟然通過!" : ""}`);
    /* 設定端點:亂猜設定碼必須被擋。她設定完之後這裡會變 410;兩種都對,200 才是災難
     * —— 200 代表任何人都能搶先訂走她的通行碼。 */
    const s = await probe(`${BASE}/__clinical/auth/setup`, { method: "POST", body: JSON.stringify({ setup_code: `zzzz-${rnd}`, passphrase: "canary-probe-passphrase" }), headers: { "Content-Type": "application/json", "X-AcuTing-Client": "canary" } });
    const setupOk = s.status === 401 || s.status === 410 || s.status === 429;
    if (!setupOk) bad++;
    console.log(`  ${setupOk ? "🔒" : "⛔"} ${"setup(亂猜設定碼)".padEnd(19)} ${s.status}${s.status === 410 ? "  (已設定,端點已關)" : ""}${s.status === 200 ? "  ⛔ 被搶先設定了!" : ""}`);
  }

  if (bad) {
    console.log(`\nFAIL — ${bad} 條不符。通行碼模式下:知識庫要匿名 200、病例 API 要 401、公開站不得被擋。`);
    process.exit(1);
  }
  console.log(`\nPASS — 門禁與公開範圍都正確(模式:${MODE})。`);
})();
