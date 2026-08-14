#!/usr/bin/env node
/**
 * check-branch-mergeable.js — 讓「PR 壞掉」變成看得見的紅燈
 *
 * 為什麼需要這支:
 *   PR 一旦與 base 衝突,GitHub 就不會為它建 merge ref,於是**它產生的
 *   workflow run 是零**。gate 不是變紅,是不存在 —— 沒有人會收到失敗通知,
 *   落地檢查會一路顯示「沒有失敗」,直到有人真的按下 merge 才發現。
 *   2026-08-12 就發生了一次:main 的手機修正動到 js/knowledge.js,
 *   PR #59 靜靜變成 dirty,而分支上完全沒有紅燈。
 *
 * 這支做兩件 CI 看得到的事:
 *   1. 分支是否落後 base(behind > 0)
 *   2. 真的試合一次,看會不會衝突(git merge-tree,不動工作區)
 *
 * 搭配 validate.yml 的 push 觸發使用 —— push 事件不受 PR 可合性影響,
 * 所以即使 PR 已經 dirty,這支仍然會跑、仍然會紅。那正是重點。
 *
 * 用法:node scripts/check-branch-mergeable.js [base]   預設 base = origin/main
 */
const { execFileSync } = require("child_process");

const BASE = process.argv[2] || process.env.MERGE_BASE_REF || "origin/main";

function git(args, opts = {}) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
}

let head, base;
try {
  head = git(["rev-parse", "HEAD"]);
  base = git(["rev-parse", BASE]);
} catch (e) {
  // 抓不到 base(淺 clone、沒有 remote)就不要假裝檢查過 —— 明說跳過。
  console.log(`SKIP — 讀不到 base「${BASE}」,無法判斷可合性(${String(e.message).split("\n")[0]})`);
  process.exit(0);
}

if (head === base) {
  console.log(`PASS — HEAD 就是 ${BASE},無需比對。`);
  process.exit(0);
}

const [behind, ahead] = git(["rev-list", "--left-right", "--count", `${base}...${head}`]).split(/\s+/).map(Number);

let conflicted = false;
let conflictFiles = [];
try {
  // --write-tree 只算樹,不碰工作區。有衝突時 exit code 非 0。
  git(["merge-tree", "--write-tree", "--name-only", head, base]);
} catch (e) {
  conflicted = true;
  const out = String((e.stdout || "") + (e.stderr || ""));
  conflictFiles = [...new Set(out.split("\n").filter((l) => /^CONFLICT/.test(l)))];
  if (!conflictFiles.length) {
    conflictFiles = out.split("\n").map((l) => l.trim()).filter((l) => l && !/^\d|^[0-9a-f]{40}$/.test(l)).slice(0, 10);
  }
}

console.log(`branch mergeability vs ${BASE}\n`);
console.log(`  base   ${base.slice(0, 8)}`);
console.log(`  head   ${head.slice(0, 8)}`);
console.log(`  ahead  ${ahead}   behind ${behind}`);
console.log(`  衝突   ${conflicted ? "是" : "否"}`);

if (!conflicted && behind === 0) {
  console.log("\nPASS — 可 fast-forward,PR 會正常產生 CI run。");
  process.exit(0);
}

if (conflicted) {
  console.log("\n⛔ 這個分支與 base 衝突。");
  conflictFiles.slice(0, 10).forEach((f) => console.log(`     ${f}`));
  console.log("\n  後果不是「PR 變紅」,而是 **GitHub 不會為這個 PR 產生任何 CI run** ——");
  console.log("  gate 會安靜消失。修法:把 base 合進分支,解掉衝突,再 push。");
  console.log(`     git fetch origin && git merge ${BASE}`);
  process.exit(1);
}

console.log(`\n⛔ 分支落後 base ${behind} 個 commit。`);
console.log("  目前沒有衝突,但 base 每前進一次就多一次變成衝突的機會,");
console.log("  而衝突會讓 PR 的 CI 直接消失。趁還沒衝突先合進來:");
console.log(`     git fetch origin && git merge ${BASE}`);
process.exit(1);
