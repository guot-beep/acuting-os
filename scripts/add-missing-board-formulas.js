#!/usr/bin/env node
/**
 * add-missing-board-formulas.js — create records for the Appendix C formulas
 * the database does not have.
 *
 * Ting: 「考綱那 28 個沒有的方要不要補進資料庫 —— 要，但因為現在你好像沒辦法
 * 上網拿資料，先做課件的資料補充上去，到時候我請 codex antigravity 按照擬制定
 * 的模板再加入交叉比對內容」.
 *
 * So these are SKELETONS, and they say so. Each carries only what two sources
 * in this repo actually state:
 *
 *   name_en, pinyin   ← Appendix C of the 2026 CH outline (official)
 *   name_zh           ← the curriculum, where its 中文 appears next to the pinyin
 *   source_classic    ← the curriculum, where it states one
 *
 * Everything else is left EMPTY, review_status "skeleton", with a
 * needs_fill note naming what is missing. An empty field is honest; a
 * plausible-looking composition invented from a formula name is the defect
 * that put 「瀉心」 in 瀉心湯's ingredient list.
 *
 * The 中文 name is only taken when it sits directly beside the pinyin in the
 * curriculum text (麻黄汤 next to "Ma Huang Tang"). No name is transliterated
 * by hand.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");
const OUTLINE = path.join(ROOT, "curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.md");
const CURRICULUM_DIR = path.join(ROOT, "curriculum/formulas");
const APPLY = process.argv.includes("--apply");
const OUTLINE_CITE = "curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.pdf（Appendix C）";

// ── Appendix C ──
const md = fs.readFileSync(OUTLINE, "utf8");
const starts = [...md.matchAll(/Appendix C/g)].map((m) => m.index);
const tail = md.slice(starts[starts.length - 1]);
const end = tail.search(/Appendix D/);
const block = end > -1 ? tail.slice(0, end) : tail;
const listed = [];
for (const line of block.split("\n")) {
  const m = /^•\s+([A-Z][A-Za-z' ]+?)\s*\(([^)]+)\)\s*$/.exec(line.trim());
  if (m) listed.push({ pinyin: m[1].trim(), name_en: m[2].trim() });
}

// ── curriculum text, for the 中文 name and the classic ──
const corpus = fs.readdirSync(CURRICULUM_DIR).filter((f) => f.endsWith(".md"))
  .map((f) => ({ file: f, text: fs.readFileSync(path.join(CURRICULUM_DIR, f), "utf8") }));

// "Ma Huang Tang麻黄汤" or "Ma Huang Tang [麻黄汤]" — the 中文 must be adjacent.
function findChinese(pinyin) {
  const esc = pinyin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*");
  const re = new RegExp(esc + "\\s*\\[?\\s*([\\u4e00-\\u9fff]{2,12})", "i");
  for (const c of corpus) {
    const m = re.exec(c.text);
    if (m) return { name_zh: m[1], file: c.file };
  }
  return null;
}
function findClassic(pinyin) {
  const esc = pinyin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*");
  const re = new RegExp(esc + "[^\\n]{0,80}?(?:Source:\\s*|\\[)(Shang Han Lun|Jin Gui Yao Lue|Wen Bing Tiao Bian|Tai Ping Hui Min He Ji Ju Fang)", "i");
  for (const c of corpus) {
    const m = re.exec(c.text);
    if (m) return m[1];
  }
  return "";
}

const slug = (p) => "formula." + p.toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, "");

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = data.records || data;
const key = (s) => String(s || "").toLowerCase().replace(/[^a-z]/g, "");
const have = new Set(recs.map((r) => key(r.pinyin)));

const added = [], withZh = [], withoutZh = [];
for (const x of listed) {
  if (have.has(key(x.pinyin))) continue;
  const zh = findChinese(x.pinyin);
  const classic = findClassic(x.pinyin);
  const rec = {
    id: slug(x.pinyin),
    name_zh: zh ? zh.name_zh : "",
    name_en: x.name_en,
    pinyin: x.pinyin,
    board_name_en: x.name_en,
    on_board_list: true,
    exam_star: 1,
    exam_importance: "★ NCBAHM 2026 CH 考綱 Appendix C 官方應試方劑 —— Domain I.B（方劑，11%：組成／君臣佐使／功效主治／配伍／八法／替代）、Domain II（安全，24%：禁忌與毒性）、Domain III.A（開方，22%）",
    source_classic: classic ? `《${classic}》` : "",
    composition: [],
    actions_zh: [], actions_en: [],
    pattern_indications_zh: [], pattern_indications_en: [],
    contraindications_zh: [], contraindications_en: [],
    formula_family: [],
    review_status: "skeleton",
    source_type: "board_outline_skeleton",
    needs_fill: "骨架記錄：僅有考綱的官方方名。組成、君臣佐使、功效、主治、禁忌全部待從 curriculum/formulas 補齊，不可憑方名推測。",
    source_urls: [],
    field_sources: {
      name_en: [OUTLINE_CITE],
      pinyin: [OUTLINE_CITE],
      on_board_list: [OUTLINE_CITE],
      exam_importance: [OUTLINE_CITE],
      ...(zh ? { name_zh: [`curriculum/formulas/${zh.file.replace(/\.md$/, ".pdf")}`] } : {}),
      ...(classic ? { source_classic: ["curriculum/formulas/（課件標註出典）"] } : {})
    }
  };
  recs.push(rec);
  added.push(rec);
  (zh ? withZh : withoutZh).push(`${x.pinyin}${zh ? " " + zh.name_zh : ""}`);
}

console.log(`考綱有、資料庫沒有的方：新增 ${added.length} 筆骨架記錄\n`);
console.log(`  課件裡找到中文名的  ${withZh.length}`);
withZh.forEach((n) => console.log("    " + n));
console.log(`\n  課件裡沒找到中文名的 ${withoutZh.length}（name_zh 留空，不自己音譯）`);
withoutZh.slice(0, 20).forEach((n) => console.log("    " + n));
console.log(`\n  有出典的            ${added.filter((r) => r.source_classic).length}`);
console.log(`\n全部 review_status = "skeleton"，帶 needs_fill 說明；組成一律留空。`);

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/formulas.json");
