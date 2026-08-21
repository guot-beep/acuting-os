#!/usr/bin/env node
/**
 * scan-unmerged-branches.js
 *
 * 2026-08-12 起的例行檢查:找出「做完卻沒併進整合分支」的工作。
 *
 * 為什麼需要它:這個 repo 同時有多條線在跑(Claude 各 session、Codex、
 * Antigravity、Ting 自己開的背景工作)。每條線做完會停在自己的 remote
 * branch 上等人來撿 —— 但沒有任何機制提醒「有東西可以撿」。2026-08-12
 * 的實例:C4 紅旗缺陷(什麼情況要立刻送醫)已在 claude/confident-hugle-*
 * 上歸零,擱置 11 小時無人察覺;同時另有羅馬拼音 237 欄位、CloudTCM 清理、
 * 藥理卡等數條完成品同樣擱著。commit 不等於送達。
 *
 * 用法:
 *   node scripts/scan-unmerged-branches.js              # 預設對 origin/codex/pattern-v2
 *   node scripts/scan-unmerged-branches.js --base origin/main
 *   node scripts/scan-unmerged-branches.js --max-age-days 30
 *   node scripts/scan-unmerged-branches.js --json
 *
 * 只讀:本腳本不 fetch、不合併、不改動任何東西(fetch 由呼叫者決定,
 * 因為在別人工作樹裡跑 fetch 會製造意外)。所以請先自行 `git fetch --prune`。
 *
 * exit code 永遠 0 —— 這是「有東西可以撿」的提醒,不是缺陷閘門。
 */
"use strict";

const { execFileSync } = require("child_process");

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trim();
}

const argv = process.argv.slice(2);
const getArg = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const BASE = getArg("--base", "origin/codex/pattern-v2");
const MAX_AGE_DAYS = Number(getArg("--max-age-days", "0")); // 0 = 不限
const AS_JSON = argv.includes("--json");

// 排除:整合分支本身、main、以及 agent 用的臨時 worktree 分支。
const EXCLUDE = /(^|\/)(HEAD|main)$|worktree-agent-/;

let branches;
try {
  branches = git(["branch", "-r", "--format=%(refname:short)"]).split("\n").map((s) => s.trim()).filter(Boolean);
} catch (e) {
  console.error("git branch -r failed:", e.message);
  process.exit(0);
}

const rows = [];
for (const b of branches) {
  if (b === BASE || EXCLUDE.test(b)) continue;
  let count = 0;
  try {
    count = Number(git(["rev-list", "--count", `${BASE}..${b}`]));
  } catch { continue; }
  if (!count) continue;

  const lastIso = git(["log", "-1", "--format=%cI", b]);
  const ageDays = (Date.now() - Date.parse(lastIso)) / 86400000;
  if (MAX_AGE_DAYS && ageDays > MAX_AGE_DAYS) continue;

  const subject = git(["log", "-1", "--format=%s", b]);
  // 只列出檔案「類別」而非全清單 —— 判斷會不會撞到熱檔案就夠了。
  let files = [];
  try {
    files = git(["diff", "--name-only", `${BASE}...${b}`]).split("\n").filter(Boolean);
  } catch {}
  const hot = new Set();
  for (const f of files) {
    if (f.startsWith("data/herbs/")) hot.add("data/herbs");
    else if (f.startsWith("data/pathology/")) hot.add("data/pathology");
    else if (f.startsWith("data/")) hot.add("data/*");
    else if (f.startsWith("scripts/")) hot.add("scripts");
    else if (f.startsWith("docs/")) hot.add("docs");
    else if (f === "app.js" || f.startsWith("js/")) hot.add("app/js");
    else if (f.startsWith(".github/")) hot.add("workflow");
  }
  rows.push({ branch: b, unmerged: count, ageDays: Math.round(ageDays * 10) / 10, lastSubject: subject, touches: [...hot].sort() });
}

rows.sort((a, b) => a.ageDays - b.ageDays);

if (AS_JSON) {
  console.log(JSON.stringify({ base: BASE, scanned: branches.length, stranded: rows }, null, 2));
  process.exit(0);
}

console.log(`未併入 ${BASE} 的分支(先跑 git fetch --prune 才準):\n`);
if (!rows.length) {
  console.log("  無 —— 沒有擱置中的完成品。");
  process.exit(0);
}
const pad = (s, n) => String(s).padEnd(n);
console.log(`  ${pad("commits", 8)}${pad("天前", 7)}${pad("觸及", 26)}分支 / 最後一筆`);
for (const r of rows) {
  console.log(`  ${pad(r.unmerged, 8)}${pad(r.ageDays, 7)}${pad(r.touches.join(",") || "-", 26)}${r.branch}`);
  console.log(`  ${" ".repeat(41)}└ ${r.lastSubject.slice(0, 80)}`);
}
console.log(`\n共 ${rows.length} 條分支有未併入的工作。撿之前先看「觸及」欄位排順序:`);
console.log("同一個熱檔案(data/herbs、data/pathology)的分支一次只整合一條,整合完驗證再下一條。");
