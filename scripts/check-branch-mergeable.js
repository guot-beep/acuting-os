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
 * ---------------------------------------------------------------------------
 * 2026-08-14 修:這支自己發過一次假紅燈(CODEX AUDIT #3)
 *
 * 同一個 HEAD,PR CI 全綠(31842497394),push CI 卻紅在這一步(31842493764),
 * 而 GitHub 自己說 mergeable:true / behind 0。錯的是這支,不是分支。
 *
 * 原因是 **shallow clone**:validate.yml 的 green job 用 actions/checkout@v4
 * 預設 fetch-depth=1,分支本身只有一個 commit,parents 被 graft 掉了。
 * 之後那句 `git fetch --depth=200 origin main` 把 main 的最後 200 個 commit
 * 拉進來,於是本機看到的是**兩段互不相連的歷史**。結果:
 *   rev-list --left-right   → behind 5(假的,真值是 0)
 *   merge-tree              → fatal: refusing to merge unrelated histories
 * 而舊版把「merge-tree 非 0 退出」一律當成衝突,於是 shallow 造成的工具錯誤
 * 被印成「這個分支與 base 衝突」。本機用 depth-1 clone 可以逐字重現。
 *
 * 三個修法一起下,少一個都還會再假紅:
 *   1. **ancestor fast-path**:base 已在 HEAD 的歷史裡 → 直接 PASS。
 *      這是最常見的情況(剛把 main 合進來),而且不必碰 merge-tree。
 *   2. **shallow 自救**:偵測到 shallow 就自己 unshallow/deepen 再判一次。
 *      不改 validate.yml 也能修好 —— 這支在 CI 以外的地方也會被跑。
 *   3. **區分「衝突」與「工具跑不起來」**:merge-tree 退出碼 1 才是衝突,
 *      其餘(128…)是環境問題,要照實說「檢查跑不起來」,不准講成衝突。
 *
 * 判不出來的時候仍然是紅燈,不是綠燈:一個跑不起來的 gate 必須看得見,
 * 否則就回到本檔一開始要解決的那個病 —— gate 安靜消失。
 *
 * 完整 ancestry 的回歸測試:scripts/test-branch-mergeable.js
 * ---------------------------------------------------------------------------
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

/* 退出碼要拿得到,才分得出「衝突」和「git 自己壞掉」。execFileSync 把兩者
 * 都變成 throw,所以這裡把 status/stdout/stderr 原封不動交出去。 */
function tryGit(args) {
  try {
    return { ok: true, status: 0, out: git(args) };
  } catch (e) {
    return {
      ok: false,
      status: typeof e.status === "number" ? e.status : -1,
      out: String((e.stdout || "") + (e.stderr || "")).trim(),
    };
  }
}

function pass(msg) { console.log(`\nPASS — ${msg}`); process.exit(0); }
function fail(lines) { lines.forEach((l) => console.log(l)); process.exit(1); }

let head;
try {
  head = git(["rev-parse", "HEAD"]);
} catch (e) {
  fail([`\n⛔ 讀不到 HEAD —— 這裡不是一個 git 工作區?(${String(e.message).split("\n")[0]})`]);
}

const baseProbe = tryGit(["rev-parse", BASE]);
if (!baseProbe.ok) {
  // 抓不到 base(沒有 remote、ref 沒 fetch 下來)就不要假裝檢查過 —— 明說跳過。
  console.log(`SKIP — 讀不到 base「${BASE}」,無法判斷可合性(${baseProbe.out.split("\n")[0]})`);
  process.exit(0);
}
let base = baseProbe.out;

if (head === base) pass(`HEAD 就是 ${BASE},無需比對。`);

/* 1. ancestor fast-path。base 若已在 HEAD 的歷史裡,合併就是 fast-forward,
 *    不可能衝突、behind 一定是 0。這是「剛把 main 合進分支」之後的常態,
 *    也是唯一一個不必動 merge-tree 就能給出的確定答案。 */
function baseIsAncestor() {
  const r = tryGit(["merge-base", "--is-ancestor", base, head]);
  if (r.ok) return true;
  if (r.status === 1) return false;   // 明確的「不是祖先」
  return null;                        // 128… = 判不出來(通常是歷史被截斷)
}

let ancestor = baseIsAncestor();
if (ancestor === true) pass(`${BASE}(${base.slice(0, 8)})已在 HEAD 的歷史裡 —— fast-forward,不可能衝突。`);

/* 2. shallow 自救。CI 的 checkout 預設 depth=1,截斷的歷史會讓上面的
 *    fast-path 與下面的 behind/merge-tree 全部給出假答案。先把歷史補齊
 *    再判 —— 補得到就繼續,補不到就照實說判不出來。 */
const shallow = () => tryGit(["rev-parse", "--is-shallow-repository"]).out === "true";
let deepened = "";
if (shallow()) {
  console.log("偵測到 shallow clone —— 截斷的歷史會讓可合性判斷全部失真,先補齊。");
  for (const attempt of [["fetch", "--no-tags", "--unshallow", "origin"], ["fetch", "--no-tags", "--deepen=2000", "origin"]]) {
    const r = tryGit(attempt);
    deepened = `git ${attempt.join(" ")} → ${r.ok ? "ok" : `exit ${r.status}`}`;
    console.log(`  ${deepened}`);
    if (!shallow()) break;
  }
  if (shallow()) {
    fail([
      "",
      "⛔ 這個 checkout 仍然是 shallow,可合性**無法判斷**。",
      "  這不是「分支有問題」,是這道檢查跑不起來。跑不起來就要看得見 ——",
      "  綠燈會讓它變回一個安靜消失的 gate,那正是本檔存在的理由。",
      "  修法(擇一):",
      "    · validate.yml 的 checkout 加 `with: { fetch-depth: 0 }`",
      "    · 或確認 CI runner 連得到 origin(本支會自己 unshallow)",
      `  嘗試過:${deepened || "(無)"}`,
    ]);
  }
  base = tryGit(["rev-parse", BASE]).out || base;
  ancestor = baseIsAncestor();
  if (ancestor === true) pass(`補齊歷史後:${BASE}(${base.slice(0, 8)})已在 HEAD 的歷史裡 —— fast-forward,不可能衝突。`);
}

/* 3. 到這裡 base 確定不是 HEAD 的祖先(或判不出來)。先確認兩邊真的有共同
 *    祖先 —— 沒有的話後面兩個計算都沒有意義,而且那正是 shallow 假紅的形狀。 */
const mb = tryGit(["merge-base", base, head]);
if (!mb.ok) {
  fail([
    "",
    "⛔ 找不到共同祖先 —— 這道檢查判不出可合性。",
    `  git merge-base ${BASE} HEAD → exit ${mb.status}`,
    `  ${mb.out.split("\n")[0]}`,
    "  常見原因:歷史被截斷(shallow)、或 base 來自另一個 repo。",
    "  這**不是**「分支與 base 衝突」的結論,不要照那個方向去解。",
  ]);
}

const counts = tryGit(["rev-list", "--left-right", "--count", `${base}...${head}`]);
if (!counts.ok) {
  fail(["", "⛔ 算不出 ahead/behind —— 這道檢查跑不起來。", `  ${counts.out.split("\n")[0]}`]);
}
const [behind, ahead] = counts.out.split(/\s+/).map(Number);

/* 4. 真的試合一次(--write-tree 只算樹,不碰工作區)。
 *    退出碼 1 = 有衝突;其餘非 0 = git 自己出錯,那是另一回事。
 *    舊版把兩者混為一談,於是 shallow 的 "refusing to merge unrelated
 *    histories"(128)被印成「這個分支與 base 衝突」。 */
const mt = tryGit(["merge-tree", "--write-tree", "--name-only", head, base]);
const conflicted = !mt.ok && mt.status === 1;
const toolError = !mt.ok && mt.status !== 1;
let conflictFiles = [];
if (conflicted) {
  conflictFiles = [...new Set(mt.out.split("\n").filter((l) => /^CONFLICT/.test(l)))];
  if (!conflictFiles.length) {
    conflictFiles = mt.out.split("\n").map((l) => l.trim()).filter((l) => l && !/^\d|^[0-9a-f]{40}$/.test(l)).slice(0, 10);
  }
}

console.log(`branch mergeability vs ${BASE}\n`);
console.log(`  base   ${base.slice(0, 8)}`);
console.log(`  head   ${head.slice(0, 8)}`);
console.log(`  ahead  ${ahead}   behind ${behind}`);
console.log(`  衝突   ${conflicted ? "是" : toolError ? "判不出來" : "否"}`);

if (toolError) {
  fail([
    "",
    "⛔ merge-tree 跑不起來 —— 這道檢查判不出可合性(不是衝突)。",
    `  git merge-tree --write-tree HEAD ${BASE} → exit ${mt.status}`,
    `  ${mt.out.split("\n")[0]}`,
    "  請照 git 的訊息處理環境問題,不要去解一個不存在的衝突。",
  ]);
}

if (!conflicted && behind === 0) pass("可 fast-forward,PR 會正常產生 CI run。");

if (conflicted) {
  fail([
    "",
    "⛔ 這個分支與 base 衝突。",
    ...conflictFiles.slice(0, 10).map((f) => `     ${f}`),
    "",
    "  後果不是「PR 變紅」,而是 **GitHub 不會為這個 PR 產生任何 CI run** ——",
    "  gate 會安靜消失。修法:把 base 合進分支,解掉衝突,再 push。",
    `     git fetch origin && git merge ${BASE}`,
  ]);
}

fail([
  "",
  `⛔ 分支落後 base ${behind} 個 commit。`,
  "  目前沒有衝突,但 base 每前進一次就多一次變成衝突的機會,",
  "  而衝突會讓 PR 的 CI 直接消失。趁還沒衝突先合進來:",
  `     git fetch origin && git merge ${BASE}`,
]);
