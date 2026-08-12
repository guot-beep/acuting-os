#!/usr/bin/env node
/**
 * ci-last-real-run.js
 *
 * 回答一個問題:「最近一次**真的跑過完整驗證**的 CI 是什麼結果?」
 *
 * 為什麼需要它:2026-08-12 加了 docs-only preflight 之後,只改 .md 的推送
 * 會讓 green job 被 skip,run 結論仍是 success。於是「最新一次 run 是綠的」
 * 不再等於「程式碼與資料是綠的」—— 當天就踩到:一筆資料合併漏了重建 bundle,
 * generated-data 關卡變紅,但緊接著的 docs-only 推送顯示綠燈,差點蓋過去。
 *
 * 這支腳本略過所有 green job 被 skip 的 run,只報告真正跑過的那一次。
 *
 * 用法:
 *   GH_TOKEN=<pat> node scripts/ci-last-real-run.js
 *   GH_TOKEN=<pat> node scripts/ci-last-real-run.js --branch main --limit 30
 *
 * exit 0 = 最近一次真跑是 success;exit 1 = failure 或找不到。
 * token 取得方式(不要把 token 寫進指令歷史):
 *   export GH_TOKEN=$(printf "protocol=https\nhost=github.com\n" | git credential fill | grep ^password= | cut -d= -f2)
 */
"use strict";
const https = require("https");

const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const BRANCH = arg("--branch", "codex/pattern-v2");
const LIMIT = Number(arg("--limit", "20"));
const REPO = arg("--repo", "guot-beep/acuting-os");
const TOKEN = process.env.GH_TOKEN;
if (!TOKEN) { console.error("GH_TOKEN 未設定 —— 見本檔頂端的取得方式。"); process.exit(1); }

const get = (path) => new Promise((res, rej) => {
  https.get({ host: "api.github.com", path, headers: { "User-Agent": "acuting-ci-check", Authorization: "token " + TOKEN } },
    (r) => { let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }
  ).on("error", rej);
});

// green job 名稱以 validate.yml 的 `name:` 為準;比對用開頭字串,避免改名即失效時無聲通過。
const GREEN_PREFIX = "green validators";

(async () => {
  const runs = await get(`/repos/${REPO}/actions/runs?branch=${encodeURIComponent(BRANCH)}&per_page=${LIMIT}`);
  const list = runs.workflow_runs || [];
  if (!list.length) { console.error("查無 run"); process.exit(1); }

  const skipped = [];
  for (const r of list) {
    if (r.status !== "completed") continue;
    const jobs = await get(`/repos/${REPO}/actions/runs/${r.id}/jobs`);
    const green = (jobs.jobs || []).find((j) => j.name.startsWith(GREEN_PREFIX));
    if (!green) { console.error(`⚠ run ${r.head_sha.slice(0, 7)} 找不到名為「${GREEN_PREFIX}…」的 job —— job 可能被改名,本腳本的判斷已失效,請更新 GREEN_PREFIX。`); process.exit(1); }
    if (green.conclusion === "skipped") { skipped.push(r.head_sha.slice(0, 7)); continue; }

    const fails = [];
    for (const j of jobs.jobs || []) for (const s of j.steps || []) if (s.conclusion === "failure") fails.push(`${j.name} → ${s.name}`);
    const ok = r.conclusion === "success";
    console.log(`最近一次真跑:${r.head_sha.slice(0, 7)}  結論=${r.conclusion}`);
    console.log(`  ${r.html_url}`);
    if (skipped.length) console.log(`  (其後 ${skipped.length} 次為 docs-only,green job 被 skip:${skipped.join(", ")} —— 這些的綠燈不代表程式碼與資料是綠的)`);
    for (const f of fails) console.log(`  FAIL: ${f}`);
    process.exit(ok ? 0 : 1);
  }
  console.error(`最近 ${LIMIT} 次 run 全部是 docs-only(green job 皆 skip)—— 沒有任何一次真正驗證過。`);
  process.exit(1);
})().catch((e) => { console.error(e.message); process.exit(1); });
