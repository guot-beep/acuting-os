/* 品質頁數字誠實契約(2026-09-07,包 A)
 *
 * 從 app.js 抽出 getDomainProgress(品質頁「製作與驗證進度」表的資料來源),配真的 data/generated 跑。
 * 契約:
 *   1. 「已製作」只算真的有字的:{} / [""] / {a:{b:""}} 都不算(以前 String({}) === "[object Object]" 讓 43 張
 *      空 cells 的鑑別表全算已製作)。鑑別表列必須把「cells 有字 / cells 空」分開報,兩數相加 = 總數。
 *   2. 本地卡數、template-grade 數、source_checked 分母用**載入的資料即時算**,不用快照
 *      (2026-07-28 快照說本地卡 329,實際 366;08-02 快照說 93 張 template-grade)。
 *   3. 用到快照的數字(NCBAHM 考綱覆蓋)要標快照日期。
 * 用法:node scripts/test-quality-panel-honesty.js [--json]
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { extractFunctions } = require("./lib/extract-app-functions");
const { loadKnowledge, loadGeneratedGlobal } = require("./lib/load-knowledge");

const root = path.resolve(__dirname, "..");
const appSrc = fs.readFileSync(path.join(root, "app.js"), "utf8");
const K = loadKnowledge();
const P361 = loadGeneratedGlobal("data/generated/points_361.js", "ACUTING_POINTS_361");
if (!K || !P361) { console.error("FAIL — 讀不到 data/generated 知識分片或 points_361.js(先跑 node scripts/build-data.js)"); process.exit(1); }

// 測試自己的「真的有字」判準,和 app.js 的實作獨立寫,兩邊要對得起來
const deepFilled = (v) => Array.isArray(v) ? v.some(deepFilled)
  : (v && typeof v === "object") ? Object.values(v).some(deepFilled)
  : (v != null && String(v).trim() !== "");

function makeContext(knowledge) {
  const ctx = {};
  vm.createContext(ctx);
  ctx.globalThis = ctx;
  ctx.window = ctx;                      // window.AcuTingReview 不存在 → verdicts = []
  ctx.ACUTING_KNOWLEDGE = knowledge;
  ctx.clinicalCases = [];
  // 穴位替身:品質頁只讀這幾個欄位;isStandardChannelPoint 用代碼前綴替身,不抽 channelPrefixMeta 那串
  ctx.points = P361.map((r) => ({
    code: r.code, meridian: r.meridian_display || r.channel_zh || "", fieldSources: r.field_sources || {},
    reviewStatus: r.review_status || "", functions: r.functions_zh || r.functions || [], location: r.location_zh || "", locationEn: r.location_en || ""
  }));
  ctx.isStandardChannelPoint = (p) => /^(LU|LI|ST|SP|HT|SI|BL|KI|PC|TE|SJ|GB|LR|GV|DU|CV|REN)\d/i.test(String(p.code || ""));
  vm.runInContext(extractFunctions(appSrc, ["getDomainProgress"]), ctx, { filename: "app.js(extract)" });
  return ctx;
}

const problems = [];
const check = (ok, msg) => { if (!ok) problems.push(msg); };

/* ---- 真資料 ---- */
const rows = makeContext(K).getDomainProgress();
const byLabel = (re) => rows.find((r) => re.test(r.label));
const cmpRow = byLabel(/Comparisons/);
const herbRow = byLabel(/Herbs/);
const comparisons = (K.comparisons && K.comparisons.records) || [];
const herbs = (K.herbs && K.herbs.records) || [];

const cellsFilled = comparisons.filter((r) => deepFilled(r.cells)).length;
const cellsEmpty = comparisons.length - cellsFilled;
const madeExpected = comparisons.filter((r) => ["rows", "records", "discriminators", "cells"].some((k) => deepFilled(r[k]))).length;
check(cmpRow, "找不到鑑別表列");
if (cmpRow) {
  check(cmpRow.total === comparisons.length, `鑑別表 total ${cmpRow.total} ≠ 記錄數 ${comparisons.length}`);
  check(cmpRow.made === madeExpected, `鑑別表 made ${cmpRow.made} ≠ 真的有字 ${madeExpected}(空物件被算進去了?)`);
  check(cmpRow.made <= cmpRow.total, "鑑別表 made > total");
  const m = String(cmpRow.madeNote || "").match(/cells 有字 (\d+) · cells 空 (\d+)/);
  check(m, `鑑別表 madeNote 沒有分開報 cells 有字/空:「${cmpRow.madeNote}」`);
  if (m) {
    check(Number(m[1]) === cellsFilled, `madeNote cells 有字 ${m[1]} ≠ 實算 ${cellsFilled}`);
    check(Number(m[2]) === cellsEmpty, `madeNote cells 空 ${m[2]} ≠ 實算 ${cellsEmpty}`);
    check(Number(m[1]) + Number(m[2]) === comparisons.length, "cells 有字 + 空 ≠ 總數");
  }
}
check(herbRow, "找不到中藥列");
if (herbRow) {
  const templateLive = herbs.filter((r) => r.card_grade === "template").length;
  const scLive = herbs.filter((r) => (r.review_status || "") === "source_checked").length;
  check(herbRow.framework === herbs.length, `中藥 framework ${herbRow.framework} ≠ 即時本地卡 ${herbs.length}(用了快照?)`);
  check(herbRow.gradeDenominator === herbs.length, `中藥 grade 分母 ${herbRow.gradeDenominator} ≠ ${herbs.length}`);
  check(herbRow.verifiedDenominator === herbs.length, `中藥 verified 分母 ${herbRow.verifiedDenominator} ≠ ${herbs.length}`);
  check(herbRow.grade === templateLive, `中藥 template-grade ${herbRow.grade} ≠ 即時 ${templateLive}(用了 08-02 快照 93?)`);
  check(herbRow.sourceChecked === scLive, `中藥 source_checked ${herbRow.sourceChecked} ≠ 即時 ${scLive}`);
  const snap = K.audit && K.audit.herb_outline_coverage && K.audit.herb_outline_coverage.captured_on;
  if (snap) {
    check(String(herbRow.totalNote).includes(snap) && String(herbRow.totalNote).includes("快照"), `中藥 totalNote 沒標快照日期 ${snap}:「${herbRow.totalNote}」`);
    check(String(herbRow.madeNote).includes(snap), `中藥 madeNote 沒標快照日期 ${snap}:「${herbRow.madeNote}」`);
  }
}

/* ---- 陰性對照:合成三張表,只有第三張 cells 真的有字 ---- */
const synth = {
  ...K,
  comparisons: { records: [
    { id: "cmp.t1", cells: {} },
    { id: "cmp.t2", cells: { a: { b: "" } }, rows: [""] },
    { id: "cmp.t3", cells: { a: { b: "有字" } } }
  ] },
  herbs: { records: [{ id: "herb.t1", card_grade: "template", review_status: "source_checked" }, { id: "herb.t2" }] },
  audit: { herb_outline_coverage: { captured_on: "2000-01-01", appendix_a_total: 7, matched_to_local_cards: 7, local_herb_cards: 999 } }
};
const sRows = makeContext(synth).getDomainProgress();
const sCmp = sRows.find((r) => /Comparisons/.test(r.label));
const sHerb = sRows.find((r) => /Herbs/.test(r.label));
check(sCmp && sCmp.made === 1, `陰性對照:合成鑑別表 made 應為 1,得到 ${sCmp && sCmp.made}`);
check(sCmp && /cells 有字 1 · cells 空 2/.test(sCmp.madeNote), `陰性對照:madeNote 應報「cells 有字 1 · cells 空 2」,得到「${sCmp && sCmp.madeNote}」`);
check(sHerb && sHerb.framework === 2 && sHerb.gradeDenominator === 2, `陰性對照:快照 local_herb_cards 999 不准蓋掉即時 2(得到 framework ${sHerb && sHerb.framework})`);
check(sHerb && sHerb.grade === 1 && sHerb.sourceChecked === 1, `陰性對照:即時 template 1 / source_checked 1(得到 ${sHerb && sHerb.grade}/${sHerb && sHerb.sourceChecked})`);
check(sHerb && /2000-01-01 快照/.test(sHerb.totalNote), `陰性對照:totalNote 應標「2000-01-01 快照」,得到「${sHerb && sHerb.totalNote}」`);

/* ---- 結構:不准再讀快照裡的本地卡數 / template 數 ---- */
const gdp = extractFunctions(appSrc, ["getDomainProgress"]);
check(!/Number\(herbCoverage\.local_herb_cards\)/.test(gdp), "getDomainProgress 又用快照的 local_herb_cards 當本地卡數");
check(!/qualityLayers\.herbs\?\.template_grade/.test(gdp), "getDomainProgress 又用 08-02 快照的 template_grade");

const summary = {
  comparisons: cmpRow && { total: cmpRow.total, made: cmpRow.made, cellsFilled, cellsEmpty },
  herbs: herbRow && { framework: herbRow.framework, grade: herbRow.grade, sourceChecked: herbRow.sourceChecked, denominator: herbRow.gradeDenominator, totalNote: herbRow.totalNote },
  problems
};
if (process.argv.includes("--json")) console.log(JSON.stringify(summary, null, 2));
else {
  console.log("品質頁數字誠實契約(真資料 + 陰性對照)");
  console.log(`  鑑別表:${summary.comparisons.total} 張 · 已製作 ${summary.comparisons.made} · cells 有字 ${cellsFilled} · cells 空 ${cellsEmpty}`);
  console.log(`  中藥:本地卡 ${summary.herbs.framework} · template-grade ${summary.herbs.grade} · source_checked ${summary.herbs.sourceChecked} · 分母 ${summary.herbs.denominator}`);
  console.log(`  ${summary.herbs.totalNote}`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  console.log(problems.length ? `\nFAIL — ${problems.length} 條` : "\nPASS — 品質頁只報即時數,快照有標日期,空物件不算已製作");
}
process.exit(problems.length ? 1 : 0);
