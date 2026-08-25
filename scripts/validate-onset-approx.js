#!/usr/bin/env node
/**
 * validate-onset-approx.js — 發病時間收得下病人真的會講的話,而且不偷偷猜
 *
 * 起因(Ting 2026-08-24):舊格式只收 YYYY / YYYY-MM / YYYY-MM-DD / unknown。
 * 門診裡病人講的是「大概五年」「十年以上」「從小就有」—— 那些既不是日期,
 * 旁邊的 chronicity(急性/慢性)也裝不下「多久了」,於是這些話無處可記。
 *
 * 這支守三條線:
 *   1. 病人真的會講的說法都收得下,而且解析成同一個正規形式。
 *   2. **期間絕不換算成日期** —— 今天記「約五年」不得變成 2021。那會把病人
 *      給的模糊精度偽裝成年份精度,正是 D4「coarsen, never falsify」禁止的事。
 *   3. 歧義不猜 —— 「6月」是六月還是六個月?猜錯會讓慢性病變成急性病。
 *      看不懂就要說看不懂,而且要說出可以怎麼寫。
 *   外加:舊資料(純日期 / unknown)一律仍然合法,不得因為擴充而失效。
 *
 * 用法:node scripts/validate-onset-approx.js [app.js 的路徑]
 *   路徑參數專為反空跑證明:餵一份動過手腳的副本,確認它真的會 FAIL。
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const TARGET = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, "app.js");
const app = fs.readFileSync(TARGET, "utf8");

function grab(kind, name) {
  const needle = kind === "fn" ? `function ${name}(` : `const ${name} = `;
  const start = app.indexOf(needle);
  if (start < 0) throw new Error(`${TARGET} 裡找不到 ${name} —— 被改名或移除了,這支測試必須跟著更新,不能默默跳過`);
  if (kind === "const") {
    let depth = 0;
    for (let i = start; i < app.length; i++) {
      const ch = app[i];
      if ("([{".includes(ch)) depth++;
      else if (")]}".includes(ch)) depth--;
      if (depth === 0 && ch === ";") return app.slice(start, i + 1);
    }
    throw new Error(`${name} 的宣告沒有收斂`);
  }
  let depth = 0;
  for (let i = app.indexOf("{", start); i < app.length; i++) {
    if (app[i] === "{") depth++;
    else if (app[i] === "}") { depth--; if (depth === 0) return app.slice(start, i + 1); }
  }
  throw new Error(`function ${name} 的括號沒有收斂`);
}

const sandbox = { console };
vm.createContext(sandbox);
try {
  vm.runInContext([
    grab("const", "ONSET_APPROX_RE"),
    grab("const", "ONSET_CJK_NUMERALS"),
    grab("const", "ONSET_UNIT_MAP"),
    grab("const", "ONSET_UNIT_LABEL"),
    grab("fn", "parseOnsetApprox"),
    grab("fn", "formatOnsetApprox"),
    // const 在 vm context 裡是語彙作用域,不會變成 context 的屬性(函式宣告才會),
    // 所以要明確掛出來給下面的斷言用。
    "this.ONSET_APPROX_RE = ONSET_APPROX_RE;",
  ].join("\n"), sandbox);
} catch (e) {
  console.error("FAIL — 無法從 app.js 抽出發病時間的解析器:");
  console.error("  " + e.message);
  process.exit(1);
}
const { parseOnsetApprox: parse, formatOnsetApprox: fmt } = sandbox;

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log(`  PASS  ${msg}`); } else { fail++; console.error(`  FAIL  ${msg}`); } };

// ---- 1. 病人真的會講的說法 -------------------------------------------------
console.log("病人會這樣講,系統要收得下");
const ACCEPT = [
  // 期間
  ["5年", "P5Y"], ["五年", "P5Y"], ["約5年", "P5Y"], ["大概五年", "P5Y"], ["差不多 5 年", "P5Y"],
  ["5 years", "P5Y"], ["5y", "P5Y"], ["5yr", "P5Y"],
  ["半年", "P6M"], ["6個月", "P6M"], ["6 months", "P6M"], ["6mo", "P6M"],
  ["3週", "P3W"], ["三週", "P3W"], ["3 weeks", "P3W"], ["3w", "P3W"],
  ["10天", "P10D"], ["10 days", "P10D"], ["兩天", "P2D"],
  // 以上
  ["10年以上", "P10Y+"], ["超過10年", "P10Y+"], [">10年", "P10Y+"], ["10年多", "P10Y+"], ["十年以上", "P10Y+"],
  // 天生
  ["天生", "congenital"], ["從小", "congenital"], ["出生就有", "congenital"],
  ["先天", "congenital"], ["since birth", "congenital"], ["congenital", "congenital"],
  // 不確定
  ["不確定", "unknown"], ["不知道", "unknown"], ["unknown", "unknown"],
  // 舊資料必須繼續合法
  ["2020", "2020"], ["2020-03", "2020-03"], ["2020-03-15", "2020-03-15"],
  // 已是正規形式
  ["P5Y", "P5Y"], ["P10Y+", "P10Y+"],
  // 留空 = 還沒問,合法
  ["", ""],
];
for (const [input, expected] of ACCEPT) {
  const r = parse(input);
  ok(r.ok && r.value === expected, `${JSON.stringify(input)} → ${expected}${r.ok ? (r.value === expected ? "" : `(實際 ${r.value})`) : `(被拒:${r.error})`}`);
}

// ---- 2. 期間絕不換算成日期 -------------------------------------------------
console.log("\n期間不得被換算成年份(D4:coarsen, never falsify)");
for (const input of ["5年", "10年以上", "半年", "從小"]) {
  const r = parse(input);
  ok(r.ok && !/^\d{4}/.test(r.value), `${JSON.stringify(input)} 存下來不是年份`);
  ok(r.ok && !/\d{4}/.test(r.display || ""), `${JSON.stringify(input)} 的顯示文字不含任何四位數年份`);
}

// ---- 3. 歧義不猜 -----------------------------------------------------------
console.log("\n看不懂就說看不懂,不猜");
const REJECT = ["6月", "12月", "五", "年", "很久", "好幾年", "abc", "2020/03/15"];
for (const input of REJECT) {
  const r = parse(input);
  ok(!r.ok && !!r.error, `${JSON.stringify(input)} 被拒${r.ok ? `(卻收成 ${r.value})` : ""}`);
}
{
  /* 這一條先前寫鬆了,自己空跑過一次:守衛拿掉之後「6月」仍會掉進通用的
   * 「無法辨識」訊息,而那段訊息剛好也含「6個月」與「年月日」,於是
   * /六個月|個月/ 與 /2026-06|年月/ 都誤中。歧義訊息的價值在於**點名兩種讀法**,
   * 所以斷言要盯住那件事本身,不是盯住碰巧共用的字。 */
  const r = parse("6月");
  ok(!r.ok, "「6月」被拒");
  ok(!r.ok && /月份/.test(r.error) && /個月/.test(r.error),
    "「6月」的錯誤訊息要同時點出「月份」與「個月」兩種讀法(而不是丟一句通用格式錯誤)");
  ok(!r.ok && !/無法辨識/.test(r.error),
    "「6月」走的是專屬的歧義訊息,不是通用的無法辨識(否則等於沒有針對歧義說明)");
  const r2 = parse("很久");
  ok(!r2.ok && /5年|半年|天生/.test(r2.error), "看不懂時要列出可以怎麼寫,不是只說格式錯誤");
}

// ---- 4. 顯示層 -------------------------------------------------------------
console.log("\n顯示成人看得懂的話");
ok(fmt("P5Y") === "約 5 年前", `P5Y → 約 5 年前(實際:${fmt("P5Y")})`);
ok(fmt("P10Y+") === "10 年以上", `P10Y+ → 10 年以上(實際:${fmt("P10Y+")})`);
ok(fmt("congenital") === "天生 / 出生即有", `congenital → 天生 / 出生即有`);
ok(fmt("unknown") === "問過,病人不確定", `unknown 與空白分得出來`);
ok(fmt("") === "", `空白(還沒問)顯示為空,不是「不確定」`);
ok(fmt("2020-03") === "2020-03", `絕對日期原樣顯示`);

// ---- 5. 正規形式一律通過既有的格式驗證 -------------------------------------
console.log("\n正規形式與舊格式都通過 ONSET_APPROX_RE");
for (const v of ["2020", "2020-03", "2020-03-15", "unknown", "congenital", "P5Y", "P6M", "P3W", "P10D", "P10Y+"]) {
  ok(sandbox.ONSET_APPROX_RE.test(v), `${v} 合法`);
}
for (const v of ["P0Y", "PY", "P5X", "5Y", "P5Y++"]) {
  ok(!sandbox.ONSET_APPROX_RE.test(v), `${v} 不合法(不得放寬到亂七八糟)`);
}

console.log(`\nvalidate-onset-approx: ${pass} passed, ${fail} failed`);
if (fail) {
  console.error("\n發病時間要收得下病人真的會講的話,而且看不懂時要說看不懂 —— 不猜。");
  process.exit(1);
}
console.log("PASS —— 期間、天生、日期、不確定四種都收得下,歧義一律不猜。");
