/* 首頁搜尋排名契約(2026-09-07,包 A)
 *
 * 從 app.js 抽出沒有 DOM 依賴的函式(txt / scoreMatch / scoreRecord / idSlug / knowledgeRecords /
 * unifiedSearch / bestGlobalResult / caseDeepText / homeSearchDestination),配**真的** data/generated
 * 資料跑 Ting 給的 10 個種子查詢。契約三條:
 *   1. 身分命中(id / code / 名字 / 拼音 / 別名)贏內文命中(功效 / 主治 / 組成 / 標籤):
 *      「黃耆」開黃耆這味藥,不開組成含黃耆的當歸六黃湯;「失眠」開失眠病症卡,不開標籤含失眠的申脈。
 *   2. Enter 開的那一筆 = bestGlobalResult = 下拉第一列(renderGlobalResults 用同一把尺排分組)。
 *   3. 無命中 → homeSearchDestination 回 "empty";任何查詢都不會回到「穴位目錄 0 筆」那條舊路。
 *
 * 穴位用 points_361.js 的原始記錄做最小替身(adapt361Record 的欄位對應),因為 loadPoints() 綁 DOM。
 * 用法:node scripts/test-unified-search.js [--json]
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const appSrc = fs.readFileSync(path.join(root, "app.js"), "utf8");

const { extractFunctions, extractConsts } = require("./lib/extract-app-functions");
const FNS = ["txt", "scoreMatch", "scoreRecord", "idSlug", "knowledgeRecords", "unifiedSearch", "bestGlobalResult", "caseDeepText", "homeSearchDestination"];
const code = extractConsts(appSrc, ["GR_PER_GROUP", "GR_GROUP_ORDER"]) + extractFunctions(appSrc, FNS);

/* ---- 真資料(走 repo 唯一的 node 端載入器,不自己解析發射格式)---- */
const { loadKnowledge, loadGeneratedGlobal } = require("./lib/load-knowledge");
const K = loadKnowledge();
const P361 = loadGeneratedGlobal("data/generated/points_361.js", "ACUTING_POINTS_361");
if (!K || !P361) { console.error("FAIL — 讀不到 data/generated 知識分片或 points_361.js(先跑 node scripts/build-data.js)"); process.exit(1); }
const ctx = {};
vm.createContext(ctx);
ctx.globalThis = ctx;
ctx.window = ctx;
ctx.ACUTING_KNOWLEDGE = K;
// 穴位替身:只搬搜尋會讀的欄位,對應 app.js adapt361Record 的命名
ctx.points = P361.map((r) => ({
  code: r.code, nameZh: r.chinese || r.code, nameEn: r.english || "", pinyin: r.pinyin || r.code,
  meridian: r.meridian_display || r.channel_zh || "", region: r.region || "",
  functions: r.functions_zh || r.functions || [], functionsEn: r.functions_en || [], patterns: r.tcm_pattern_ids || [],
  actionTagsZh: r.action_tags_zh || [], actionTagsEn: r.action_tags_en || [], diseaseTagsZh: r.disease_tags_zh || [], diseaseTagsEn: r.disease_tags_en || [],
  pointIdentityZh: r.point_identity_zh || [], pointIdentityEn: r.point_identity_en || [], otherNamesZh: r.other_names_zh || ""
}));
ctx.clinicalCases = [];
vm.runInContext(code, ctx, { filename: "app.js(extract)" });

/* ---- 契約 ---- */
const SEEDS = [
  { q: "LI4", want: { key: "points", id: "LI4" } },
  { q: "合谷", want: { key: "points", id: "LI4" } },
  { q: "黃耆", want: { key: "herbs", id: "herb.huang_qi" }, never: "formula.dang_gui_liu_huang_tang" },
  { q: "Huang Qi", want: { key: "herbs", id: "herb.huang_qi" } },
  { q: "herb.huang_qi", want: { key: "herbs", id: "herb.huang_qi" } },
  { q: "桂枝湯", want: { key: "formulas", id: "formula.gui_zhi_tang" } },
  { q: "formula.gui_zhi_tang", want: { key: "formulas", id: "formula.gui_zhi_tang" } },
  { q: "PCOS", want: { key: "conditions", id: "cond.pcos" } },
  { q: "失眠", want: { key: "conditions", id: "cond.insomnia" }, neverKey: "points" },
  { q: "zzzz_no_match_20260905", want: null }
];
const idOf = (key, rec) => (key === "points" ? rec.code : rec.id);
const rows = [];
let bad = 0;
for (const seed of SEEDS) {
  const res = ctx.unifiedSearch(seed.q);
  const dest = ctx.homeSearchDestination(seed.q);
  const best = ctx.bestGlobalResult(res);
  const totals = res ? Object.fromEntries(Object.entries(res).filter(([, g]) => g.total).map(([k, g]) => [k, `${g.total}@${g.best}`])) : {};
  const got = dest.kind === "open" ? `${dest.key}:${idOf(dest.key, dest.rec)}` : dest.kind;
  const problems = [];
  if (seed.want === null) {
    if (dest.kind !== "empty") problems.push(`應為 empty,得到 ${got}`);
    if (res && Object.values(res).some((g) => g.total)) problems.push("無命中查詢卻有分組有筆數");
  } else {
    if (dest.kind !== "open") problems.push(`應開 ${seed.want.key}:${seed.want.id},得到 ${got}`);
    else if (dest.key !== seed.want.key || idOf(dest.key, dest.rec) !== seed.want.id) problems.push(`應開 ${seed.want.key}:${seed.want.id},得到 ${got}`);
    if (seed.never && dest.rec && dest.rec.id === seed.never) problems.push(`開到禁止的 ${seed.never}`);
    if (seed.neverKey && dest.key === seed.neverKey) problems.push(`落到禁止的類別 ${seed.neverKey}`);
    // 契約 2:best 是各組 best 的最小值(同分取 GR_GROUP_ORDER 較前者)
    if (best) {
      const minScore = Math.min(...Object.values(res).map((g) => g.best));
      if (best.score !== minScore) problems.push(`bestGlobalResult 分數 ${best.score} ≠ 各組最小 ${minScore}`);
      const firstGroupWithMin = ctx.GR_GROUP_ORDER.find((k) => res[k] && res[k].best === minScore);
      if (best.key !== firstGroupWithMin) problems.push(`同分時應取 ${firstGroupWithMin},得到 ${best.key}`);
    }
  }
  if (dest.kind !== "open" && dest.kind !== "cases" && dest.kind !== "empty") problems.push(`未知的 kind ${dest.kind}`);
  if (problems.length) bad++;
  rows.push({ q: seed.q, got, totals, problems });
}

/* 契約 1 的單元斷言:身分 exact 0 < 內文 exact 3;身分 substring 2 < 內文 exact 3 */
const unit = [
  ["身分 exact", ctx.scoreRecord("失眠", ["失眠"], []), 0],
  ["內文 exact 要 +3", ctx.scoreRecord("失眠", ["申脈"], ["失眠", "癲癇"]), 3],
  ["身分 substring 仍贏內文 exact", ctx.scoreRecord("眠", ["失眠"], ["眠"]), 2],
  ["都不中 → -1", ctx.scoreRecord("x", ["失眠"], ["申脈"]), -1],
  ["idSlug:cond.pcos → pcos", ctx.idSlug("cond.pcos"), "pcos"],
  ["idSlug:formula.gui_zhi_tang → gui zhi tang", ctx.idSlug("formula.gui_zhi_tang"), "gui zhi tang"],
  ["idSlug:沒有點 → 空字串", ctx.idSlug("LI4"), ""]
];
for (const [label, got, want] of unit) if (got !== want) { bad++; rows.push({ q: `[unit] ${label}`, got: String(got), totals: {}, problems: [`應為 ${want}`] }); }

/* 契約 3 的結構斷言:runHomeSearch 不再有舊路 */
const rhs = (appSrc.match(/function runHomeSearch\(\) \{[\s\S]*?\n\}/) || [""])[0];
const stale = rhs.match(/acupointDirectory|findExactPoint|getFilteredPoints/g);
if (!rhs || stale) { bad++; rows.push({ q: "[structure] runHomeSearch", got: stale ? stale.join(",") : "missing", totals: {}, problems: ["runHomeSearch 仍有落穴位目錄的舊路"] }); }

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ pass: bad === 0, rows }, null, 2));
} else {
  console.log("首頁搜尋排名契約 — 10 個種子查詢(真資料)\n");
  for (const r of rows) {
    const t = Object.entries(r.totals).map(([k, v]) => `${k}=${v}`).join(" ");
    console.log(`  ${r.problems.length ? "✗" : "✓"} ${r.q.padEnd(26)} → ${r.got.padEnd(34)} ${t}`);
    for (const p of r.problems) console.log(`      ! ${p}`);
  }
  console.log(bad ? `\nFAIL — ${bad} 條不符契約` : `\nPASS — ${SEEDS.length} 個種子查詢 + ${unit.length} 條單元斷言 + 結構斷言全部符合`);
}
process.exit(bad ? 1 : 0);
