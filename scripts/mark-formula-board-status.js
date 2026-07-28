#!/usr/bin/env node
/**
 * mark-formula-board-status.js — mark every formula against NCBAHM Appendix C.
 *
 * Ting: 「方劑卡更要標註重點 board 還是考試 或是其他提示」.
 *
 * The 2026 CH Content Outline's **Appendix C. Chinese Herbal Formulas** is the
 * official examinable list — 169 formulas by pinyin and English name. That is
 * the framework (§4 source tier 0): it decides WHICH formulas matter, and it is
 * not my opinion. A formula on the list gets `on_board_list: true`; one that is
 * not gets `false`, not "unknown", because the list is exhaustive by definition.
 *
 * `exam_importance` quotes the outline's own domain weights rather than a
 * generic sentence, because the outline breaks the formula content into six
 * distinct objectives and they map straight onto card sections:
 *
 *   Domain I.B (11%)   1 組成 · 2 君臣佐使 · 3 功效主治 · 4 配伍關係 · 5 八法 · 6 替代
 *   Domain II  (24%)   3 禁忌 · 4 毒性 · 6 藥物交互作用
 *   Domain III (30%)   A 開方
 *
 * Matching is on pinyin with spaces and case normalised. Every unmatched name
 * on BOTH sides is reported — a formula in the repo that is not on the list may
 * simply be extra study material, but a list entry with no record is a gap in
 * the database, and that is worth knowing.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");
const OUTLINE_MD = path.join(ROOT, "curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.md");
const OUTLINE_CITE = "curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.pdf（Appendix C 官方應試方劑表）";
const APPLY = process.argv.includes("--apply");

const IMPORTANCE = "★ NCBAHM 2026 CH 考綱 Appendix C 官方應試方劑 —— Domain I.B（方劑，11%：組成／君臣佐使／功效主治／配伍／八法／替代）、Domain II（安全，24%：禁忌與毒性）、Domain III.A（開方，22%）";
const OFF_LIST = "非 NCBAHM 2026 CH 考綱 Appendix C 列表方劑 —— 臨床與課程用，不在應試範圍";

// ── read Appendix C ─────────────────────────────────────────────────────────
const md = fs.readFileSync(OUTLINE_MD, "utf8");
const starts = [...md.matchAll(/Appendix C/g)].map((m) => m.index);
if (!starts.length) { console.error("找不到 Appendix C —— 考綱檔案結構變了？"); process.exit(1); }
const tail = md.slice(starts[starts.length - 1]);
const end = tail.search(/Appendix D/);
const block = end > -1 ? tail.slice(0, end) : tail;

const listed = [];
for (const line of block.split("\n")) {
  const m = /^•\s+([A-Z][A-Za-z' ]+?)\s*\(([^)]+)\)\s*$/.exec(line.trim());
  if (m) listed.push({ pinyin: m[1].trim(), name_en: m[2].trim() });
}
if (listed.length < 100) { console.error(`Appendix C 只解析出 ${listed.length} 方，明顯不對，停手`); process.exit(1); }

const key = (s) => String(s || "").toLowerCase().replace(/[^a-z]/g, "");
const byKey = new Map(listed.map((x) => [key(x.pinyin), x]));

// ── apply ───────────────────────────────────────────────────────────────────
const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = data.records || data;

let on = 0, off = 0;
const unmatchedRepo = [];
const matchedKeys = new Set();

for (const r of recs) {
  const k = key(r.pinyin);
  const hit = byKey.get(k);
  if (hit) {
    matchedKeys.add(k);
    r.on_board_list = true;
    r.exam_importance = IMPORTANCE;
    r.board_name_en = hit.name_en;
    // exam_star mirrors the acupoint card's meaning: the SOURCE says this is
    // examinable, not me. Appendix C has no ranking, so everything on it is 1.
    r.exam_star = 1;
    r.field_sources = r.field_sources || {};
    r.field_sources.exam_importance = [OUTLINE_CITE];
    r.field_sources.on_board_list = [OUTLINE_CITE];
    on++;
  } else {
    r.on_board_list = false;
    r.exam_importance = OFF_LIST;
    r.exam_star = 0;
    r.field_sources = r.field_sources || {};
    r.field_sources.on_board_list = [OUTLINE_CITE];
    off++;
    unmatchedRepo.push(`${r.name_zh}（${r.pinyin}）`);
  }
}

const missingFromRepo = listed.filter((x) => !matchedKeys.has(key(x.pinyin)));

console.log(`NCBAHM 2026 CH 考綱 Appendix C：${listed.length} 方\n`);
console.log(`  資料庫 ${recs.length} 方中，在考綱表上的   ${on}`);
console.log(`                     不在表上的     ${off}`);
console.log(`  ⚠️ 考綱有、資料庫沒有的          ${missingFromRepo.length}  ← 這是資料庫的缺口`);

if (unmatchedRepo.length) {
  console.log(`\n不在考綱表上的方（可能是拼音寫法不同，要人工看）：`);
  unmatchedRepo.slice(0, 25).forEach((n) => console.log("  " + n));
  if (unmatchedRepo.length > 25) console.log(`  … 還有 ${unmatchedRepo.length - 25}`);
}
if (missingFromRepo.length) {
  console.log(`\n考綱列了但資料庫沒有的方：`);
  missingFromRepo.slice(0, 25).forEach((x) => console.log(`  ${x.pinyin}  (${x.name_en})`));
  if (missingFromRepo.length > 25) console.log(`  … 還有 ${missingFromRepo.length - 25}`);
}

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/formulas.json");
