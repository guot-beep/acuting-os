#!/usr/bin/env node
/**
 * validate-acupoint-standard.js — enforce docs/ACUPOINT_CARD_TEMPLATE.md.
 *
 * The herb wall (validate-herb-standard.js) made the herb rules machine-checked
 * instead of advisory; this is its acupoint twin. Antigravity filled all 361
 * points to ~100% field coverage, so the problem here is not emptiness but
 * quality: bilingual arrays that do not line up, function lists dumped rather
 * than curated, and shared boilerplate safety text.
 *
 * ERRORS (exit 1):
 *   A1 missing code / chinese / pinyin
 *   A2 duplicate point code
 *   A3 a *_zh field has content but no Chinese at all
 *   A4 an _en array is not index-aligned with its _zh array
 *      (English would render against the wrong item — the same defect that hit
 *      the herb cards; 352/361 points had it when this check was written)
 *   A5 template-grade record (has field_sources) missing an _en array
 *   A6 template-grade record's functions_zh outside 3-8 curated items
 *   A7 template-grade record has no needling text containing a number
 *      (depth/angle is safety-critical — never leave it prose-only)
 *   A8 template-grade record still carries shared boilerplate contraindications
 *
 * WORKLIST — `--worklist` lists the actual point codes behind the numbers,
 * grouped by channel (batches run one channel at a time).
 *   --channel LU     only that channel
 *   --all            do not truncate long lists
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "data/acupoints/361.json"), "utf8"));
const recs = Array.isArray(raw) ? raw : (raw.records || raw.points || []);

const WORKLIST = process.argv.includes("--worklist");
const SHOW_ALL = process.argv.includes("--all");
const CH_ARG = (() => {
  const i = process.argv.indexOf("--channel");
  return i > -1 ? process.argv[i + 1] : null;
})();

const hasCJK = (s) => /[㐀-鿿]/.test(String(s));
const arr = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]);
const filled = (v) => arr(v).length > 0;

const PAIRS = [
  ["functions_zh", "functions_en"],
  ["indications_zh", "indications_en"],
  ["action_tags_zh", "action_tags_en"],
  ["disease_tags_zh", "disease_tags_en"]
];
const ZH_FIELDS = ["chinese", "functions_zh", "indications_zh", "location_zh", "cautions_zh", "acumethod_zh"];

// Boilerplate = a safety string shared by many points. Generic text is not a
// contraindication for THIS point; it hides the fact nothing specific is known.
const BOILERPLATE = (() => {
  const c = new Map();
  for (const r of recs) {
    for (const v of arr(r.contraindications)) {
      const k = String(v).trim();
      c.set(k, (c.get(k) || 0) + 1);
    }
  }
  return new Set([...c.entries()].filter(([, n]) => n >= 10).map(([k]) => k));
})();

const errors = [];
const defects = new Map();
function flag(r, issue) {
  const key = r.code || r.id;
  if (!defects.has(key)) {
    defects.set(key, { code: key, name: r.chinese || "", channel: String(key).replace(/[0-9]+$/, ""), issues: [] });
  }
  defects.get(key).issues.push(issue);
}

const seen = new Map();
let templateGrade = 0;
const funcCounts = [];
let misaligned = 0, boilerplateHits = 0, missingEnAny = 0;

for (const r of recs) {
  const id = r.code || r.id || r.chinese || "(unknown)";
  // "Template-grade" means the point has actually been curated against the
  // curriculum, not merely that it carries some citation. Marking board stars
  // adds field_sources.exam_star to 145 otherwise-untouched points; keying off
  // "any field_sources" would have flipped all of them into the strict A4-A8
  // checks and reported 236 failures for work nobody had started. functions_zh
  // is the field the rewrite always sets, so it is the honest marker.
  const isTemplate = !!(r.field_sources && r.field_sources.functions_zh);
  if (isTemplate) templateGrade++;

  if (!r.code || !r.chinese || !r.pinyin) errors.push(`A1 ${id}: missing code/chinese/pinyin`);
  if (r.code) {
    if (seen.has(r.code)) errors.push(`A2 ${r.code}: duplicate code — 「${seen.get(r.code)}」 and 「${r.chinese}」`);
    else seen.set(r.code, r.chinese);
  }
  for (const f of ZH_FIELDS) {
    const vals = arr(r[f]).filter((x) => String(x).trim() !== "");
    if (vals.length && !vals.some(hasCJK)) errors.push(`A3 ${id}: ${f} has content but no Chinese`);
  }
  for (const [zhF, enF] of PAIRS) {
    const zh = arr(r[zhF]), en = arr(r[enF]);
    if (zh.length && en.length && zh.length !== en.length) {
      misaligned++;
      flag(r, `${enF} 與 ${zhF} 長度不符 (${en.length} vs ${zh.length})`);
      if (isTemplate) errors.push(`A4 ${id}: ${enF} (${en.length}) not index-aligned with ${zhF} (${zh.length})`);
    }
    if (zh.length && !en.length) {
      missingEnAny++;
      flag(r, `缺英文 ${enF}`);
      if (isTemplate) errors.push(`A5 ${id}: template-grade record missing ${enF}`);
    }
  }
  const nf = arr(r.functions_zh).length;
  funcCounts.push(nf);
  // Floor is 2, not 3. Chenoweth's own table gives LU4, LU8 and LU11 exactly two
  // curated actions; demanding a third would force padding, which is the defect
  // this check exists to prevent. Target stays 4-6, same shape as the herb rule
  // (E8 blocks outside 2-6 while the doc asks for 3-5).
  if (nf < 2 || nf > 8) {
    flag(r, `功效 ${nf} 條(需 2-8,目標 4-6)`);
    if (isTemplate) errors.push(`A6 ${id}: functions_zh has ${nf} item(s) — keep the 2-8 key actions`);
  }
  if (!/\d/.test(String(r.needling || "") + String(r.acumethod_zh || ""))) {
    flag(r, "針法缺具體深度/角度數字");
    if (isTemplate) errors.push(`A7 ${id}: needling has no numeric depth/angle (safety-critical)`);
  }
  const bp = arr(r.contraindications).filter((v) => BOILERPLATE.has(String(v).trim()));
  if (bp.length) {
    boilerplateHits++;
    flag(r, `禁忌為共用套話(${bp.length} 條)`);
    if (isTemplate) errors.push(`A8 ${id}: contraindications are shared boilerplate — write point-specific risk`);
  }
  if (!isTemplate) flag(r, "尚未依模板整理(無 field_sources)");
}

const inRange = funcCounts.filter((n) => n >= 2 && n <= 8).length;
console.log(`validate-acupoint-standard: ${recs.length} points (${templateGrade} template-grade)\n`);
console.log(`  中英未對齊 misaligned pairs      ${misaligned}`);
console.log(`  缺英文陣列 missing _en arrays     ${missingEnAny}`);
console.log(`  功效 2-8 條 curated               ${inRange}/${recs.length}  (max ${Math.max(...funcCounts)})`);
console.log(`  共用套話禁忌 boilerplate safety   ${boilerplateHits}  (${BOILERPLATE.size} distinct shared strings)`);

if (WORKLIST) {
  let rows = [...defects.values()];
  if (CH_ARG) rows = rows.filter((d) => d.channel === CH_ARG.toUpperCase());
  const byCh = new Map();
  rows.forEach((d) => {
    if (!byCh.has(d.channel)) byCh.set(d.channel, []);
    byCh.get(d.channel).push(d);
  });
  const chans = [...byCh.entries()].sort((a, b) => b[1].length - a[1].length);
  console.log(`\n===== 待整理清單 WORKLIST — ${rows.length} 穴有缺，${chans.length} 條經絡 =====`);
  for (const [ch, list] of chans) {
    console.log(`\n## ${ch}  (${list.length} 穴)`);
    const show = SHOW_ALL ? list : list.slice(0, 10);
    show.sort((a, b) => b.issues.length - a.issues.length);
    for (const d of show) console.log(`  ${d.code.padEnd(6)} ${(d.name || "").padEnd(5)} ${d.issues.length} 項：${d.issues.join("、")}`);
    if (!SHOW_ALL && list.length > show.length) console.log(`  … 還有 ${list.length - show.length} 穴（加 --all）`);
  }
  console.log(`\n用法：--channel LU 只看一條經；--all 顯示全部。批次順序見 docs/ACUPOINT_FILL_DISPATCH.md。`);
} else {
  console.log(`\n提示：加 --worklist 列出每一個不合格的穴位（--channel LU 看單一經絡）。`);
}

if (errors.length) {
  console.error(`\nFAIL — ${errors.length} defect(s) (A1-A3 apply to every record; A4-A8 to template-grade only):`);
  errors.slice(0, 40).forEach((e) => console.error("  " + e));
  if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  process.exit(1);
}
console.log("\nPASS — no blocking defects.");
