#!/usr/bin/env node
/**
 * validate-ui-freeze.js — 9/01 UI 執行凍結(W1-4,2026-08-28 先上,9/01 生效)。
 *
 * ROADMAP/W1-4:自 2026-09-01 起,`app.js` / `js/**` / `index.html` /
 * `styles.css` 的變更**只准修 bug**;新想法進 backlog 不進 code。
 *
 * 為什麼需要機器擋:9/02 開診,那一週 Ting 會在真實診間用這個殼。凍結保護的
 * 不是「程式碼很完美」—— 它保護的是**她對介面的肌肉記憶**。開診第三天按鈕
 * 換位置,比按鈕醜三個月嚴重得多。而這件事沒人擋的話,只要有人覺得「這個
 * 順手改一下更好」就會發生 —— 昨晚就有 12 個 commit 動了渲染層,其中一個
 * 讓 main 紅了(TDZ)還沒被發現。
 *
 * 判定方式:比對本分支相對 origin/main 的 UI 檔變更。有變更時,要求 commit
 * 訊息**自稱**屬於下列其中一種(關鍵字寫在訊息裡即可,大小寫不拘):
 *   修 bug / fix / bugfix / 修正 / 紅燈 / 回歸 / regression / hotfix
 *   凍結例外 / freeze-exception(需在訊息裡說明理由與裁定出處)
 *
 * 這是**誠實聲明制**,不是防駭 —— 想繞過只要寫一個字。它擋的是「順手改一下」
 * 那種無意識的改動:被迫在 commit 訊息裡寫下「這是 bug fix」的那一秒,
 * 人會重新想一次這到底是不是 bug。這也是為什麼不做成白名單路徑或 diff 大小
 * 門檻 —— 那些擋得住手滑,擋不住判斷失誤,而後者才是凍結真正要防的。
 *
 * 凍結日之前:報告模式(印出目前狀態,永遠 exit 0),讓大家先習慣它的存在。
 *
 * 用法:
 *   node scripts/validate-ui-freeze.js            # CI 用(自動判斷是否已生效)
 *   node scripts/validate-ui-freeze.js --status   # 只印狀態
 *   FREEZE_TODAY=2026-09-05 node scripts/... # 測試用:覆寫今天日期
 */
"use strict";
const { execFileSync } = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FREEZE_DATE = "2026-09-01";
const TODAY = process.env.FREEZE_TODAY || new Date().toISOString().slice(0, 10);
const ACTIVE = TODAY >= FREEZE_DATE;
const STATUS_ONLY = process.argv.includes("--status");

const UI_PATTERNS = [/^app\.js$/, /^js\//, /^index\.html$/, /^styles\.css$/];
const EXEMPT = [/^js\/.*\.test\.js$/];   // 測試檔不算 UI

const git = (args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();

let base = "origin/main";
try { git(["rev-parse", "--verify", base]); } catch { base = "HEAD~1"; }

let changed = [];
let messages = "";
try {
  const mergeBase = git(["merge-base", base, "HEAD"]);
  changed = git(["diff", "--name-only", `${mergeBase}..HEAD`]).split("\n").filter(Boolean)
    .filter((f) => UI_PATTERNS.some((p) => p.test(f)) && !EXEMPT.some((p) => p.test(f)));
  messages = changed.length ? git(["log", "--format=%s%n%b", `${mergeBase}..HEAD`]) : "";
} catch (err) {
  console.log(`validate-ui-freeze: 無法比對 git 範圍(${err.message.split("\n")[0]}) — 跳過`);
  process.exit(0);
}

const ALLOW = /修\s*bug|bug\s*fix|bugfix|fix\(|^fix |修正|紅燈|回歸|regression|hotfix|凍結例外|freeze[- ]exception/im;
const declared = ALLOW.test(messages);

console.log("UI 執行凍結(W1-4)\n");
console.log(`  凍結日        ${FREEZE_DATE}`);
console.log(`  今天          ${TODAY}${process.env.FREEZE_TODAY ? "(env 覆寫)" : ""}`);
console.log(`  狀態          ${ACTIVE ? "已生效" : `尚未生效(還有 ${Math.ceil((new Date(FREEZE_DATE) - new Date(TODAY)) / 86400000)} 天)`}`);
console.log(`  比對基準      ${base}`);
console.log(`  本分支動到的 UI 檔  ${changed.length}`);
for (const f of changed) console.log(`      ${f}`);
console.log(`  commit 訊息自稱修 bug/例外  ${declared ? "是" : "否"}\n`);

if (STATUS_ONLY) process.exit(0);

if (!ACTIVE) {
  console.log("凍結尚未生效 —— 報告模式。9/01 起,動到 UI 檔而訊息未自稱修 bug 的分支會被擋下。");
  process.exit(0);
}
if (!changed.length) {
  console.log("PASS — 本分支沒有動到 UI 檔。");
  process.exit(0);
}
if (declared) {
  console.log("PASS — 動到 UI 檔,但 commit 訊息自稱是修 bug 或已聲明凍結例外。");
  process.exit(0);
}
console.log("FAIL — 凍結生效中,本分支動了 UI 檔但沒有自稱修 bug。\n");
console.log("這是誠實聲明制:若真的是修 bug,在 commit 訊息裡說明是哪個 bug;");
console.log("若是新想法,進 backlog 不進 code —— 開診週換介面,比介面不夠好嚴重得多。");
console.log("真的需要凍結期改介面(如診間現場擋路),寫「凍結例外」+ 理由 + Ting 的裁定。");
process.exit(1);
