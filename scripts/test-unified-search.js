/* 首頁搜尋排名契約(2026-09-07,包 A;第二輪加了審查 H1/H2/H4/M1/M2/M4 的案例)
 *
 * 從 app.js 抽出沒有 DOM 依賴的函式(txt / scoreMatch / scoreRecord / idSlug / knowledgeRecords /
 * unifiedSearch / bestGlobalResult / caseDeepText / homeSearchDestination / searchTargetData),配**真的**
 * data/generated 資料跑種子查詢。契約:
 *   1. 身分命中(id / code / 名字 / 拼音 / 別名;拼音帶不帶空格同義)贏內文命中(功效 / 主治 / 組成 / 標籤 / 位置)。
 *   2. Enter 開的那一筆 = bestGlobalResult = 下拉第一列(renderGlobalResults 用同一把尺排分組)。
 *   3. 無命中 → "empty";任何查詢都不會回到「穴位目錄 0 筆」那條舊路。
 *   4. 退役卡不進搜尋;同分時病症/症狀排在穴位前。
 *
 * 穴位替身:361 經穴(points_361.js)+ 董氏索引(data/tung/point_index.js)+ app_data 的耳穴/頭皮/奇穴,
 * 欄位對應 app.js 的 adapt361Record / tungIndexPoint;不是 loadPoints() 的 947 筆(那條綁 localStorage 與
 * mergeByCode),所以這裡印出替身筆數並要求 ≥ 900 —— 少於這個數表示某個來源沒載到,契約不算數(審查 H4)。
 * 用法:node scripts/test-unified-search.js [--json]
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const appSrc = fs.readFileSync(path.join(root, "app.js"), "utf8");
const { extractFunctions, extractConsts } = require("./lib/extract-app-functions");
const FNS = ["txt", "scoreMatch", "scoreRecord", "idSlug", "grGroupOrder", "knowledgeRecords", "unifiedSearch", "bestGlobalResult", "searchTargetData", "caseDeepText", "homeSearchDestination"];
const code = extractConsts(appSrc, ["GR_PER_GROUP", "GR_GROUP_ORDER", "GR_KIND_BY_GROUP", "squashSpaces"]) + extractFunctions(appSrc, FNS);

/* ---- 真資料(走 repo 唯一的 node 端載入器,不自己解析發射格式)---- */
const { loadKnowledge, loadGeneratedGlobal } = require("./lib/load-knowledge");
const K = loadKnowledge();
const P361 = loadGeneratedGlobal("data/generated/points_361.js", "ACUTING_POINTS_361");
const TUNG = loadGeneratedGlobal("data/tung/point_index.js", "ACUTING_TUNG_INDEX");
const APP = loadGeneratedGlobal("data/generated/app_data.js", "ACUTING_APP_DATA");
if (!K || !P361 || !TUNG || !APP) { console.error("FAIL — 讀不到 data/generated 知識分片 / points_361.js / tung/point_index.js / app_data.js(先跑 node scripts/build-data.js)"); process.exit(1); }
const ctx = {};
vm.createContext(ctx);
ctx.globalThis = ctx;
ctx.window = ctx;
ctx.ACUTING_KNOWLEDGE = K;
// 穴位替身:只搬搜尋會讀的欄位,對應 app.js adapt361Record / tungIndexPoint 的命名
const std = P361.map((r) => ({
  code: r.code, nameZh: r.chinese || r.code, nameEn: r.english || r.code, pinyin: r.pinyin || r.code,
  meridian: r.meridian_display || r.channel_zh || "", region: r.region || "", location: r.location_zh || "", locationEn: r.location_en || "",
  functions: r.functions_zh || r.functions || [], functionsEn: r.functions_en || [], patterns: r.tcm_pattern_ids || [], patternsEn: r.indications_en || [],
  anatomy: r.anatomy_terms || [], evidence: r.evidence || "", cautions: r.cautions || "",
  actionTagsZh: r.action_tags_zh || [], actionTagsEn: r.action_tags_en || [], diseaseTagsZh: r.disease_tags_zh || [], diseaseTagsEn: r.disease_tags_en || [],
  pointIdentityZh: r.point_identity_zh || [], pointIdentityEn: r.point_identity_en || [], otherNamesZh: r.other_names_zh || ""
}));
const tung = (TUNG.points || []).map((r) => ({
  code: r.code, standardCode: r.display_code || r.code, nameZh: r.name_zh || r.name_en, nameEn: r.name_en, pinyin: r.pinyin || r.name_en,
  meridian: "Master Tung / 董氏奇穴", region: `${r.zone_zh || r.zone_en} · ${r.region_zh || r.region_en}`,
  location: r.location_zh || "", locationEn: r.location_en || "",
  functions: (r.traditional_functions_zh || []).join("、"), functionsEn: (r.traditional_functions_en || []).join(" "),
  patterns: r.indications_zh || [], patternsEn: r.indications_en || [], cautions: (r.contraindications || []).join(" ")
}));
const extras = [...(APP.auricularPoints || []), ...(APP.scalpPoints || []), ...(APP.extraPoints || [])].filter((p) => p && p.code && (p.nameZh || p.name_zh));
const seen = new Set();
ctx.points = [...std, ...tung, ...extras].filter((p) => { if (seen.has(p.code)) return false; seen.add(p.code); return true; });
ctx.clinicalCases = [];
vm.runInContext(code, ctx, { filename: "app.js(extract)" });

/* ---- 契約 ---- */
const SEEDS = [
  // Ting 的 10 個種子
  { q: "LI4", want: { key: "points", id: "LI4" } },
  { q: "合谷", want: { key: "points", id: "LI4" } },
  { q: "黃耆", want: { key: "herbs", id: "herb.huang_qi" }, never: "formula.dang_gui_liu_huang_tang" },
  { q: "Huang Qi", want: { key: "herbs", id: "herb.huang_qi" } },
  { q: "herb.huang_qi", want: { key: "herbs", id: "herb.huang_qi" } },
  { q: "桂枝湯", want: { key: "formulas", id: "formula.gui_zhi_tang" } },
  { q: "formula.gui_zhi_tang", want: { key: "formulas", id: "formula.gui_zhi_tang" } },
  { q: "PCOS", want: { key: "conditions", id: "cond.pcos" } },
  { q: "失眠", want: { key: "conditions", id: "cond.insomnia" }, neverKey: "points" },
  { q: "zzzz_no_match_20260905", want: null },
  // 審查第二輪:拼音帶空格(H1)、董氏顯示代碼與位置文字(H2)、prefix 平手(M1)、退役卡(M2)、英文別名(M4)
  { q: "Tai Chong", want: { key: "points", id: "LR3" } },
  { q: "he gu", want: { key: "points", id: "LI4" }, never: "formula.bai_he_gu_jin_tang" },
  { q: "zu san li", want: { key: "points", id: "ST36" } },
  { q: "T 11.01", want: { key: "points", id: "T11.01" } },
  { q: "第二掌骨", want: { key: "points" } },
  { q: "感冒", want: { key: "conditions", id: "cond.common_cold" }, neverKey: "points" },
  { q: "蘇子", want: { key: null }, never: "herb.su_zi" },
  { q: "Ma Zi Ren", want: { key: "herbs" }, never: "formula.ma_zi_ren_wan" }
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
    if (dest.kind !== "open") problems.push(`應開卡,得到 ${got}`);
    else {
      if (seed.want.key && dest.key !== seed.want.key) problems.push(`應在 ${seed.want.key},得到 ${got}`);
      if (seed.want.id && idOf(dest.key, dest.rec) !== seed.want.id) problems.push(`應開 ${seed.want.id},得到 ${got}`);
      if (seed.never && (dest.rec.id === seed.never || dest.rec.code === seed.never)) problems.push(`開到禁止的 ${seed.never}`);
      if (seed.neverKey && dest.key === seed.neverKey) problems.push(`落到禁止的類別 ${seed.neverKey}`);
      if ((dest.rec.review_status || dest.rec.reviewStatus) === "deprecated") problems.push("開到退役卡");
      // 契約 2:best = 各組 best 的最小值,同分取 GR_GROUP_ORDER 較前者;searchTargetData 拿得到開卡要的鍵
      const minScore = Math.min(...Object.values(res).map((g) => g.best));
      if (best.score !== minScore) problems.push(`bestGlobalResult 分數 ${best.score} ≠ 各組最小 ${minScore}`);
      const firstGroupWithMin = ctx.GR_GROUP_ORDER.find((k) => res[k] && res[k].best === minScore);
      if (best.key !== firstGroupWithMin) problems.push(`同分時應取 ${firstGroupWithMin},得到 ${best.key}`);
      const data = ctx.searchTargetData(dest.key, dest.rec);
      if (!(data.code || data.id)) problems.push("searchTargetData 沒有 code/id,Enter 開不了");
    }
  }
  if (!["open", "cases", "empty"].includes(dest.kind)) problems.push(`未知的 kind ${dest.kind}`);
  if (problems.length) bad++;
  rows.push({ q: seed.q, got, totals, problems });
}

/* 契約 1 的單元斷言 */
const unit = [
  ["身分 exact", ctx.scoreRecord("失眠", ["失眠"], []), 0],
  ["內文 exact 要 +3", ctx.scoreRecord("失眠", ["申脈"], ["失眠", "癲癇"]), 3],
  ["身分 substring 仍贏內文 exact", ctx.scoreRecord("眠", ["失眠"], ["眠"]), 2],
  ["拼音去空格 exact", ctx.scoreRecord("tai chong", ["LR3", "太衝", "Great Surge", "Taichong"], []), 0],
  ["顯示代碼去空格 exact", ctx.scoreRecord("t 11.01", ["T11.01", "T 11.01"], []), 0],
  ["去空格後只是 substring 仍 2 分", ctx.scoreRecord("he gu", ["Bai He Gu Jin Tang"], []), 2],
  ["都不中 → -1", ctx.scoreRecord("x", ["失眠"], ["申脈"]), -1],
  ["idSlug:cond.pcos → pcos", ctx.idSlug("cond.pcos"), "pcos"],
  ["idSlug:formula.gui_zhi_tang → gui zhi tang", ctx.idSlug("formula.gui_zhi_tang"), "gui zhi tang"],
  ["idSlug:沒有點 → 空字串", ctx.idSlug("LI4"), ""],
  ["grGroupOrder 漏登記要丟錯", (() => { try { ctx.grGroupOrder("nope"); return "no-throw"; } catch (e) { return "throw"; } })(), "throw"],
  ["病症排在穴位前(同分 tie-break)", ctx.GR_GROUP_ORDER.indexOf("conditions") < ctx.GR_GROUP_ORDER.indexOf("points"), true]
];
for (const [label, got, want] of unit) if (got !== want) { bad++; rows.push({ q: `[unit] ${label}`, got: String(got), totals: {}, problems: [`應為 ${want}`] }); }

/* 替身分母:少於 900 表示某個穴位來源沒載到 */
if (ctx.points.length < 900) { bad++; rows.push({ q: "[fixture] points", got: String(ctx.points.length), totals: {}, problems: ["穴位替身少於 900 筆(361 + 董氏 + 耳穴/頭皮/奇穴),契約不算數"] }); }

/* 契約 3 的結構斷言:runHomeSearch 本體不再有舊路,且直接開 dest */
const rhs = (appSrc.match(/\nfunction runHomeSearch\(\) \{[\s\S]*?\n\}\n/) || [""])[0];
const stale = rhs.match(/acupointDirectory|findExactPoint|getFilteredPoints/g);
if (!rhs || stale) { bad++; rows.push({ q: "[structure] runHomeSearch", got: stale ? stale.join(",") : "missing", totals: {}, problems: ["runHomeSearch 仍有落穴位目錄的舊路"] }); }
if (rhs && !(/homeSearchDestination\(query\)/.test(rhs) && /openSearchTarget\(/.test(rhs))) { bad++; rows.push({ q: "[structure] runHomeSearch", got: "body", totals: {}, problems: ["runHomeSearch 本體沒有走 homeSearchDestination → openSearchTarget"] }); }

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ pass: bad === 0, points: ctx.points.length, rows }, null, 2));
} else {
  console.log(`首頁搜尋排名契約 — ${SEEDS.length} 個種子查詢(真資料;穴位替身 ${ctx.points.length} 筆 = 361 經穴 ${std.length} + 董氏 ${tung.length} + 其他 ${extras.length},去重後)\n`);
  for (const r of rows) {
    const t = Object.entries(r.totals).map(([k, v]) => `${k}=${v}`).join(" ");
    console.log(`  ${r.problems.length ? "✗" : "✓"} ${r.q.padEnd(26)} → ${r.got.padEnd(34)} ${t}`);
    for (const p of r.problems) console.log(`      ! ${p}`);
  }
  console.log(bad ? `\nFAIL — ${bad} 條不符契約` : `\nPASS — ${SEEDS.length} 個種子查詢 + ${unit.length} 條單元斷言 + 替身分母 + 結構斷言全部符合`);
}
process.exit(bad ? 1 : 0);
