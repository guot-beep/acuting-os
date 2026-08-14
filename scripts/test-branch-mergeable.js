#!/usr/bin/env node
/**
 * test-branch-mergeable.js — check-branch-mergeable.js 的回歸測試
 *
 * 存在的理由很具體:2026-08-13 那支 gate 在 CI 上對一個**確定可合**的分支
 * 發了紅燈(push run 31842493764 紅、同一個 HEAD 的 PR run 31842497394 全綠,
 * GitHub 自己說 mergeable:true / behind 0)。假紅燈比沒有 gate 更糟 ——
 * 它會訓練所有人忽略這一格。
 *
 * 那次的成因是 shallow clone,而 shallow 不可能用「在真 repo 上跑一次」測到:
 * 開發機的 clone 永遠是完整的。所以這裡自己造 repo,把四種 ancestry 各造一次,
 * **包含 depth-1 的 shallow clone**,逐一跑真正的 gate、比對退出碼與結論。
 *
 * 六個情境:
 *   A  完整 clone,base 是 HEAD 的祖先          → PASS(0)
 *   B  **depth-1 shallow clone**,base 是祖先   → PASS(0)   ← 那次假紅燈
 *   C  分支落後 base(無衝突)                   → FAIL(1),結論必須是「落後」
 *   D  真的衝突                                  → FAIL(1),結論必須是「衝突」
 *   E  base ref 不存在                            → SKIP(0)
 *   F  HEAD 就是 base                             → PASS(0)
 *
 * C/D 兩個負面情境是防空跑用的:只測 A/B 的話,一支「永遠 exit 0」的 gate
 * 也會全綠。
 *
 * 全部在系統暫存目錄裡造 repo,不碰這個 repo 的任何檔案(pharm 那兩支測試
 * 曾經因為就地改 tracked 檔案而在兩個 session 並行時造成永久汙染 —— 不重演)。
 *
 * 用法:node scripts/test-branch-mergeable.js [受測 gate 的路徑]
 *
 * 那個位置參數不是裝飾:把修好之前的 gate 存成檔案再餵進來,這套測試必須在
 * 情境 B 變紅。測不出舊缺陷的回歸測試等於沒有寫 —— 這個專案發過會發綠燈的
 * 空跑測試,不再賭一次。
 */
"use strict";

const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const GATE = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "check-branch-mergeable.js");
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "acuting-mergeable-"));

// 本機 clone 會走 hardlink 傳輸而**忽略 --depth**;要造出真的 shallow clone
// 必須用 file:// URL。情境 B 的全部價值就在這一行。
const fileUrl = (p) => "file:///" + path.resolve(p).replace(/\\/g, "/").replace(/^\//, "");

const IDENT = ["-c", "user.email=test@example.invalid", "-c", "user.name=test", "-c", "commit.gpgsign=false"];
const git = (cwd, args) => execFileSync("git", [...IDENT, ...args], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

function commit(cwd, file, body, msg) {
  fs.writeFileSync(path.join(cwd, file), body);
  git(cwd, ["add", "-A"]);
  git(cwd, ["commit", "-qm", msg]);
}

/* 上游:main 五個 commit;feature 從 main 分出去再走一個。
 * 之後每個情境從這個上游 clone 出自己的工作區,情境之間互不干擾。 */
function makeUpstream(name) {
  const up = path.join(ROOT, name);
  fs.mkdirSync(up, { recursive: true });
  git(up, ["init", "-q", "-b", "main", "."]);
  commit(up, "a.txt", "base line\n", "c1");
  for (const i of [2, 3, 4, 5]) commit(up, "a.txt", `base line\nmain ${i}\n`, `c${i}`);
  git(up, ["checkout", "-qb", "feature"]);
  return up;
}

function runGate(cwd, base) {
  const r = spawnSync(process.execPath, [GATE, base || "origin/main"], { cwd, encoding: "utf8" });
  return { code: r.status, out: `${r.stdout || ""}${r.stderr || ""}` };
}

const failures = [];
function expect(label, got, want) {
  const ok = want(got);
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${label}`);
  if (!ok) {
    failures.push(label);
    console.log(`        exit=${got.code}`);
    got.out.split("\n").slice(0, 14).forEach((l) => console.log(`        | ${l}`));
  }
}

const isPass = (r) => r.code === 0 && /\bPASS\b/.test(r.out);
const isSkip = (r) => r.code === 0 && /\bSKIP\b/.test(r.out);

console.log("check-branch-mergeable regression suite\n");

// --- A: 完整 clone,base 是祖先 ------------------------------------------
{
  const up = makeUpstream("upA");
  const w = path.join(ROOT, "workA");
  git(ROOT, ["clone", "-q", "--branch", "feature", fileUrl(up), w]);
  commit(w, "f.txt", "feature work\n", "feat");
  git(w, ["fetch", "--no-tags", "-q", "origin", "main"]);
  const r = runGate(w);
  expect("A 完整 clone + base 是祖先 → PASS", r, (x) => isPass(x) && /fast-forward/.test(x.out));
}

// --- B: depth-1 shallow clone,base 是祖先(2026-08-13 的假紅燈) --------
{
  const up = makeUpstream("upB");
  // 先在上游把 feature 推進一個 commit,才有東西可以 depth-1 clone。
  git(up, ["checkout", "-q", "feature"]);
  commit(up, "f.txt", "feature work\n", "feat");
  git(up, ["checkout", "-q", "main"]);   // 上游留在 main,避免 clone 時卡在 checked-out 分支

  const w = path.join(ROOT, "workB");
  git(ROOT, ["clone", "-q", "--depth", "1", "--branch", "feature", fileUrl(up), w]);
  // 單分支 clone 的 refspec 只有 feature;actions/checkout@v4 設的是標準
  // refspec,所以這裡補回去,才是 CI 真正的形狀。
  git(w, ["config", "remote.origin.fetch", "+refs/heads/*:refs/remotes/origin/*"]);
  // validate.yml 目前就是這一行。
  git(w, ["fetch", "--no-tags", "--depth=200", "-q", "origin", "main"]);

  const shallowBefore = git(w, ["rev-parse", "--is-shallow-repository"]);
  console.log(`  (情境 B 起始狀態:is-shallow=${shallowBefore})`);
  expect("B 前提:這個工作區真的是 shallow(否則本情境什麼都沒測到)", { code: 0, out: shallowBefore },
    () => shallowBefore === "true");

  const r = runGate(w);
  expect("B shallow clone + base 是祖先 → PASS(不得報成衝突或落後)", r,
    (x) => isPass(x) && !/與 base 衝突/.test(x.out) && !/分支落後/.test(x.out));
  expect("B 有明說它自己補齊了歷史(不是矇對的)", r, (x) => /shallow clone/.test(x.out));
}

// --- C: 分支落後 base,沒有衝突 -----------------------------------------
{
  const up = makeUpstream("upC");
  const w = path.join(ROOT, "workC");
  git(ROOT, ["clone", "-q", "--branch", "feature", fileUrl(up), w]);
  commit(w, "f.txt", "feature work\n", "feat");
  // 上游 main 再往前一個,而且動的是別的檔案 → 落後但不衝突
  git(up, ["checkout", "-q", "main"]);
  commit(up, "b.txt", "main moved on\n", "main-ahead");
  git(w, ["fetch", "--no-tags", "-q", "origin", "main"]);
  const r = runGate(w);
  expect("C 落後 base → FAIL(1) 且結論是「落後」不是「衝突」", r,
    (x) => x.code === 1 && /分支落後 base 1 個 commit/.test(x.out) && !/與 base 衝突/.test(x.out));
}

// --- D: 真的衝突 ---------------------------------------------------------
{
  const up = makeUpstream("upD");
  const w = path.join(ROOT, "workD");
  git(ROOT, ["clone", "-q", "--branch", "feature", fileUrl(up), w]);
  commit(w, "a.txt", "base line\nfeature edit\n", "feat-edit");
  git(up, ["checkout", "-q", "main"]);
  commit(up, "a.txt", "base line\nmain edit\n", "main-edit");
  git(w, ["fetch", "--no-tags", "-q", "origin", "main"]);
  const r = runGate(w);
  expect("D 真衝突 → FAIL(1) 且結論是「衝突」", r,
    (x) => x.code === 1 && /與 base 衝突/.test(x.out) && /a\.txt/.test(x.out));
}

// --- E: base ref 不存在 --------------------------------------------------
{
  const up = makeUpstream("upE");
  const w = path.join(ROOT, "workE");
  git(ROOT, ["clone", "-q", "--branch", "feature", fileUrl(up), w]);
  commit(w, "f.txt", "feature work\n", "feat");
  const r = runGate(w, "origin/does-not-exist");
  expect("E base ref 不存在 → SKIP(0),明說跳過而不是假裝檢查過", r,
    (x) => isSkip(x) && /讀不到 base/.test(x.out));
}

// --- F: HEAD 就是 base ---------------------------------------------------
{
  const up = makeUpstream("upF");
  const w = path.join(ROOT, "workF");
  git(ROOT, ["clone", "-q", "--branch", "main", fileUrl(up), w]);
  git(w, ["fetch", "--no-tags", "-q", "origin", "main"]);
  const r = runGate(w);
  expect("F HEAD 就是 base → PASS(0)", r, (x) => isPass(x) && /無需比對/.test(x.out));
}

try { fs.rmSync(ROOT, { recursive: true, force: true, maxRetries: 3 }); } catch (e) { /* Windows 偶爾鎖住 .git,清不掉不影響結論 */ }

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} 個情境不符預期:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log("\nPASS — 六個 ancestry 情境的判定都正確(含 depth-1 shallow)。");
