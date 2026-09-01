#!/usr/bin/env node
/**
 * test-ui-freeze-gate.js — 證明 UI 凍結閘門不是空跑(2026-08-31)。
 *
 * 為什麼需要這支:凍結閘門在 2026-08-31 之前,於**兩種真實情境下都測不到
 * 任何東西**,而它只印一行「跳過」然後 exit 0 ——
 *   淺 checkout(CI 的預設 depth 1):origin/main 與 HEAD~1 都不存在;
 *   push-to-main(本專案的落地方式):merge-base(origin/main, HEAD) === HEAD。
 * 也就是說,一支寫好、接上 CI、每次都綠的凍結閘門,守的是空氣。
 * 它綠得越穩,越沒有人會去看它。
 *
 * 這支在**os.tmpdir() 裡自己建一個拋棄式 git repo**來測,不碰真實工作樹。
 * (前一版的測試腳本直接在本 repo 上 commit + `git reset --hard`,把還沒
 *  commit 的修正洗掉了一次;而這個 repo 是多個 session 共用的 worktree,
 *  那種寫法遲早會毀掉別人的工作 —— 見 [[gates-that-mutate-tracked-files]]。)
 *
 * 用法:node scripts/test-ui-freeze-gate.js
 */
"use strict";
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const SRC = path.join(__dirname, "validate-ui-freeze.js");
const FUTURE = "2026-09-02";   // 凍結生效之後
const BEFORE = "2026-08-31";   // 凍結生效之前

let fails = 0;
const ok = (cond, name, detail) => {
  if (cond) console.log(`  ✓ ${name}`);
  else { fails++; console.log(`  ⛔ ${name}${detail ? " — " + detail : ""}`); }
};

const mkrepo = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "uifreeze-"));
  fs.mkdirSync(path.join(dir, "scripts"));
  fs.mkdirSync(path.join(dir, "js"));
  fs.mkdirSync(path.join(dir, "docs"));
  fs.copyFileSync(SRC, path.join(dir, "scripts", "validate-ui-freeze.js"));
  const g = (...a) => execFileSync("git", a, { cwd: dir, stdio: "ignore" });
  g("init", "-q");
  g("config", "user.email", "test@local");
  g("config", "user.name", "test");
  g("config", "commit.gpgsign", "false");
  return { dir, g };
};
const commit = ({ dir, g }, file, body, msg) => {
  fs.writeFileSync(path.join(dir, file), body);
  g("add", "--", file);
  g("commit", "-q", "-m", msg);
};
const run = (dir, env) => spawnSync(process.execPath, ["scripts/validate-ui-freeze.js"],
  { cwd: dir, encoding: "utf8", env: { ...process.env, ...env } });
const rmrf = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch { /* 暫存目錄清不掉不影響結論 */ } };

console.log("UI 凍結閘門 —— 反空跑證明\n");

/* T1 淺 checkout:只有一個 commit,沒有 origin/main、沒有 HEAD~1。
 * 這正是 CI 預設 checkout 的形狀。閘門必須說「我看不見」而不是報綠。 */
{
  const r = mkrepo();
  commit(r, "js/knowledge.js", "// ui\n", "順手改個排版");
  const active = run(r.dir, { FREEZE_TODAY: FUTURE });
  ok(active.status === 1, "T1 凍結生效 + 算不出範圍(depth-1)→ FAIL",
    `exit ${active.status};看不見的時候報綠比沒有 gate 更糟`);
  ok(/不知道\s*=\s*不准過/.test(active.stdout), "T1b 訊息說明了為什麼擋下來");
  const inactive = run(r.dir, { FREEZE_TODAY: BEFORE });
  ok(inactive.status === 0, "T1c 凍結生效前同樣情況 → 報告模式 exit 0", `exit ${inactive.status}`);
  rmrf(r.dir);
}

/* T2 push-to-main:origin/main 指到 HEAD 自己(CI 在 main 上跑就是這個形狀)。
 * 範圍必須退回 HEAD~1,看見剛推進來的那個 commit 動了 UI。 */
{
  const r = mkrepo();
  commit(r, "docs/seed.md", "seed\n", "seed");
  commit(r, "js/knowledge.js", "// ui\n", "順手改個排版");
  r.g("update-ref", "refs/remotes/origin/main", "HEAD");
  const res = run(r.dir, { FREEZE_TODAY: FUTURE });
  ok(res.status === 1, "T2 push-to-main + UI 變更未自稱修 bug → FAIL",
    `exit ${res.status};origin/main === HEAD 時範圍必須退回 HEAD~1`);
  ok(/HEAD~1/.test(res.stdout), "T2b 基準確實退回 HEAD~1 並印出來");
  rmrf(r.dir);
}

/* T3 誠實聲明制:同樣改 UI,訊息自稱修 bug / 凍結例外就放行。
 * 這條是在證明閘門不是「一律擋」—— 一律擋的 gate 會被關掉。 */
{
  for (const [msg, expect, label] of [
    ["順手把那個排版調一下", 1, "T3a 沒自稱 → 擋"],
    ["修正:安全區小標在 Safari 疊字", 0, "T3b 自稱修正 → 放行"],
    ["凍結例外(Ting 裁定):診間按鈕擋到輸入", 0, "T3c 聲明凍結例外 → 放行"],
    ["hotfix: null crash on empty case list", 0, "T3d 英文 hotfix → 放行"],
  ]) {
    const r = mkrepo();
    commit(r, "docs/seed.md", "seed\n", "seed");
    commit(r, "js/knowledge.js", "// ui\n", msg);
    r.g("update-ref", "refs/remotes/origin/main", "HEAD");
    const res = run(r.dir, { FREEZE_TODAY: FUTURE });
    ok(res.status === expect, `${label}(期望 exit ${expect})`, `exit ${res.status}`);
    rmrf(r.dir);
  }
}

/* T4 非 UI 檔不該被擋 —— 凍結凍的是介面,不是整個 repo。 */
{
  const r = mkrepo();
  commit(r, "docs/seed.md", "seed\n", "seed");
  commit(r, "docs/note.md", "note\n", "docs: 一則便條");
  r.g("update-ref", "refs/remotes/origin/main", "HEAD");
  const res = run(r.dir, { FREEZE_TODAY: FUTURE });
  ok(res.status === 0, "T4 只改文件 → 放行", `exit ${res.status}`);
  rmrf(r.dir);
}

/* T5 FREEZE_BASE:CI 傳 github.event.before。全零(新分支第一次 push)
 * 必須被當成「沒有值」而不是一個壞 SHA。 */
{
  const r = mkrepo();
  commit(r, "docs/seed.md", "seed\n", "seed");
  commit(r, "js/knowledge.js", "// ui\n", "順手改個排版");
  r.g("update-ref", "refs/remotes/origin/main", "HEAD");
  const zero = run(r.dir, { FREEZE_TODAY: FUTURE, FREEZE_BASE: "0".repeat(40) });
  ok(zero.status === 1, "T5a FREEZE_BASE 全零 → 退回其他基準,仍抓得到", `exit ${zero.status}`);
  const seed = execFileSync("git", ["rev-parse", "HEAD~1"], { cwd: r.dir, encoding: "utf8" }).trim();
  const good = run(r.dir, { FREEZE_TODAY: FUTURE, FREEZE_BASE: seed });
  ok(good.status === 1, "T5b FREEZE_BASE 指到 push 前的 tip → 抓得到", `exit ${good.status}`);
  ok(/FREEZE_BASE/.test(good.stdout), "T5c 基準來源有印出來(方便 CI 上除錯)");
  rmrf(r.dir);
}

console.log("");
console.log(fails ? `FAIL — ${fails} 條不符預期。` : "PASS — 凍結閘門在看得見時擋對、看不見時不裝作沒事。");
process.exit(fails ? 1 : 0);
