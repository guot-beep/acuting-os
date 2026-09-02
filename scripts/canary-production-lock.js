#!/usr/bin/env node
/**
 * canary-production-lock.js — 零 cookie 探測:正式網址的每一條路徑都必須被 Cloudflare Access 擋下。
 * D33 前提一的機器檢查;切換 commit 之前跑一次(FAIL 就不准合 main),之後每次部署後再跑一次。
 *
 * 用法:node scripts/canary-production-lock.js [--url https://acuting-os.guotingru.workers.dev]
 * 通過條件(每條路徑):3xx 且 Location 指向 *.cloudflareaccess.com,或 401 / 403。**任何 200 都是 FAIL**。
 * 這支只做匿名 GET,不帶任何 cookie / token,不讀回應內容 —— 對正式站是唯讀且不接觸病歷的。
 */
"use strict";
const argv = process.argv.slice(2);
const i = argv.indexOf("--url");
const BASE = String(i >= 0 ? argv[i + 1] : "https://acuting-os.guotingru.workers.dev").replace(/\/+$/, "");
const rnd = Math.random().toString(36).slice(2, 10);
const PATHS = ["/", "/index.html", "/__clinical/ping", "/__clinical/kv", "/previsit.html", `/nope-${rnd}`];
/* 反向保證(2026-09-02 事故):帳號層級的「All Workers」Access 應用程式把主站 acuting.com 一起鎖了 2.5 小時。
 * 這些公開站**必須**匿名可看(200);任何一個被轉去 cloudflareaccess.com 就 FAIL。 */
const MUST_BE_PUBLIC = ["https://acuting.com/", "https://play.acuting.com/"];

(async () => {
  let bad = 0;
  console.log(`公開站不得被 Access 擋:`);
  for (const u of MUST_BE_PUBLIC) {
    let status = 0, loc = "", err = "";
    try { const r = await fetch(u, { redirect: "manual" }); status = r.status; loc = r.headers.get("location") || ""; } catch (e) { err = e.message; }
    const lockedByAccess = /\.cloudflareaccess\.com/i.test(loc);
    const okPublic = status === 200 && !lockedByAccess;
    if (!okPublic) bad++;
    console.log(`  ${okPublic ? "🌐" : "⛔"} ${u.padEnd(34)} ${status}${lockedByAccess ? "  → 被 Access 擋住了!" : ""}${err ? "  " + err : ""}`);
  }
  console.log(`零 cookie 探測 ${BASE}`);
  for (const p of PATHS) {
    let status = 0, loc = "", err = "";
    try {
      const r = await fetch(BASE + p, { redirect: "manual", headers: { "Accept": "text/html,application/json" } });
      status = r.status; loc = r.headers.get("location") || "";
    } catch (e) { err = e.message; }
    const redirectedToAccess = status >= 300 && status < 400 && /\.cloudflareaccess\.com/i.test(loc);
    const locked = redirectedToAccess || status === 401 || status === 403;
    if (!locked) bad++;
    console.log(`  ${locked ? "🔒" : "⛔"} ${p.padEnd(22)} ${status}${loc ? "  → " + loc.replace(/^https?:\/\//, "").split("/")[0] : ""}${err ? "  " + err : ""}`);
  }
  if (bad) {
    console.log(`\nFAIL — ${bad} 條不符:病例站每條路徑都要被 Access 擋下,而公開站(acuting.com / play)每條都要匿名 200。鎖的範圍錯了就是這裡亮。`);
    process.exit(1);
  }
  console.log(`\nPASS — 病例站 ${PATHS.length} 條路徑全部被 Access 擋下;公開站 ${MUST_BE_PUBLIC.length} 個全部匿名可看。`);
})();
