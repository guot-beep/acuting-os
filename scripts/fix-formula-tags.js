#!/usr/bin/env node
/**
 * fix-formula-tags.js — repair and pair the formula tag layer.
 *
 * Ting: 「標籤都沒有中英文」. True, and the problem is bigger than missing
 * English — the tag arrays are three different things mixed together:
 *
 *   real tags in English    common_cold · wheezing_context · exterior_excess
 *   real tags in 中文        體質調理 · 暑濕感冒 · 小便赤澀疼痛
 *   NOT TAGS AT ALL         順天堂濃縮顆粒 · 香港浸會大學庫存  ← 來源名
 *                           國考必考 · 2026 NCBAHM 大綱        ← 考綱標記
 *                           香蘇散 · 荊防敗毒散                 ← 方名本身
 *                           解表劑                              ← 已在 category
 *
 * So a plain "translate the tags" pass would have produced English for a
 * supplier's name. The same misfiling that put 「其他功效」 into 109 herbs'
 * functions and 「…類辨證」 into 35 acupoint tags — third time, same shape.
 *
 * What this does:
 *   1  移出非標籤 — a source name goes to `sources`, a board marker is already
 *      covered by on_board_list/exam_importance, a formula's own name and its
 *      category carry no information as tags. Nothing is silently dropped;
 *      each is either relocated or reported.
 *   2  分成兩層 — condition_tags (病症) and pattern_tags (證型) are different
 *      questions and were jumbled into one array.
 *   3  配對中英 — glossary only. A term that is not in
 *      data/config/formula_tag_glossary.json leaves its English slot EMPTY.
 *      Half-translating is what produced 1786 fake acupoint tags.
 *
 * The English slugs already present (common_cold) are treated as the EN side
 * and matched back to 中文 through the glossary, so nothing has to be
 * re-invented in either direction.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");
const GLOSS = path.join(ROOT, "data/config/formula_tag_glossary.json");
const APPLY = process.argv.includes("--apply");

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = data.records || data;
const g = JSON.parse(fs.readFileSync(GLOSS, "utf8"));

// zh → en and en(slug) → zh, both directions from the same table.
const toEn = new Map(), toZh = new Map();
for (const bucket of ["condition", "pattern"]) {
  for (const [zh, en] of Object.entries(g[bucket] || {})) {
    if (!en) continue;
    toEn.set(zh, { en, bucket });
    toZh.set(en.toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, ""), { zh, bucket });
  }
}

const SOURCE_LIKE = /順天堂|浸會|庫存|資料庫|官網|CloudTCM/i;
const BOARD_LIKE = /國考|NCBAHM|大綱|必考|\b20\d\d\b/;
const CATEGORY_LIKE = /^[一-鿿]{2,5}劑$/;
// 「臨床常用專病處方」 sits on 57 formulas and is a classification of the
// record, not something the formula treats. It belongs beside tier/category,
// not in a tag array a reader searches by symptom.
const CLASSIFICATION_LIKE = /^臨床常用專病處方$/;
const formulaNames = new Set(recs.map((r) => String(r.name_zh || "").trim()).filter(Boolean));

const t = { moved: 0, dropped: 0, paired: 0, unpaired: 0, split: 0 };
const relocated = new Map(), unknown = new Map();

for (const r of recs) {
  const rawTags = [
    ...(Array.isArray(r.modern_clinical_use_tags) ? r.modern_clinical_use_tags : []),
    ...(Array.isArray(r.study_tags) ? r.study_tags : [])
  ].map((x) => String(x || "").trim()).filter(Boolean);
  if (!rawTags.length) continue;

  const condZh = [], condEn = [], patZh = [], patEn = [], keptSlugs = [];

  for (const tag of rawTags) {
    // ── 1. not a tag ──
    if (SOURCE_LIKE.test(tag)) {
      // NOT pushed into `sources` — that array holds URLs everywhere else, and
      // mixing a bare Chinese string into it makes the field two types at once.
      // The information is not lost: composition[].granule_concentration_ratio
      // already reads "5:1 濃縮顆粒 (順天堂 官網: …)" with the URL.
      relocated.set(tag, "→ 已在 granule_concentration_ratio（含廠牌與網址）");
      t.dropped++; continue;
    }
    if (BOARD_LIKE.test(tag)) {
      // on_board_list + exam_importance already say this, with a citation.
      relocated.set(tag, "→ 已由 on_board_list/exam_importance 表達"); t.dropped++; continue;
    }
    if (formulaNames.has(tag)) { relocated.set(tag, "→ 方名不是標籤"); t.dropped++; continue; }
    if (CATEGORY_LIKE.test(tag)) { relocated.set(tag, "→ 已在 category 欄"); t.dropped++; continue; }
    if (CLASSIFICATION_LIKE.test(tag)) {
      r.clinical_classification_zh = tag;
      relocated.set(tag, "→ clinical_classification_zh（是記錄的分類，不是主治）");
      t.moved++; continue;
    }

    // ── 2/3. pair through the glossary, whichever side it arrived on ──
    const asZh = toEn.get(tag);
    const asEn = toZh.get(tag.toLowerCase());
    if (asZh) {
      (asZh.bucket === "pattern" ? patZh : condZh).push(tag);
      (asZh.bucket === "pattern" ? patEn : condEn).push(asZh.en);
      t.paired++; t.split++;
    } else if (asEn) {
      (asEn.bucket === "pattern" ? patZh : condZh).push(asEn.zh);
      (asEn.bucket === "pattern" ? patEn : condEn).push(g[asEn.bucket][asEn.zh]);
      t.paired++; t.split++;
    } else {
      // Not in the glossary. Keep it — §0 — but do not invent the other half.
      keptSlugs.push(tag);
      unknown.set(tag, (unknown.get(tag) || 0) + 1);
      t.unpaired++;
    }
  }

  const dedupe = (zhArr, enArr) => {
    const seen = new Set(), z = [], e = [];
    zhArr.forEach((v, i) => { if (seen.has(v)) return; seen.add(v); z.push(v); e.push(enArr[i] || ""); });
    return [z, e];
  };
  [r.condition_tags_zh, r.condition_tags_en] = dedupe(condZh, condEn);
  [r.pattern_tags_zh, r.pattern_tags_en] = dedupe(patZh, patEn);
  // Whatever the glossary does not know yet stays where it was, unpaired.
  r.study_tags = [...new Set(keptSlugs)];
  delete r.modern_clinical_use_tags;

  if (r.condition_tags_zh.length || r.pattern_tags_zh.length) {
    r.field_sources = r.field_sources || {};
    for (const f of ["condition_tags_zh", "condition_tags_en", "pattern_tags_zh", "pattern_tags_en"]) {
      if ((r[f] || []).length) r.field_sources[f] = ["data/config/formula_tag_glossary.json"];
    }
  }
}

// A4: paired arrays must be the same length.
const bad = [];
for (const r of recs) {
  for (const [z, e] of [["condition_tags_zh", "condition_tags_en"], ["pattern_tags_zh", "pattern_tags_en"]]) {
    if ((r[z] || []).length !== (r[e] || []).length) bad.push(`${r.name_zh} ${z}`);
  }
}

console.log("方劑標籤層整理");
console.log(`  配對成功(中英都有)  ${t.paired}`);
console.log(`  glossary 沒有・留原樣 ${t.unpaired}`);
console.log(`  移到 sources        ${t.moved}`);
console.log(`  丟棄非標籤          ${t.dropped}`);
console.log(`\n  有病症標籤的方 ${recs.filter((r) => (r.condition_tags_zh || []).length).length}/${recs.length}`);
console.log(`  有證型標籤的方 ${recs.filter((r) => (r.pattern_tags_zh || []).length).length}/${recs.length}`);

if (relocated.size) {
  console.log(`\n  移出/丟棄的非標籤（${relocated.size} 種）：`);
  [...relocated].slice(0, 12).forEach(([k, v]) => console.log(`    ${k}  ${v}`));
}
if (unknown.size) {
  console.log(`\n  ⚠️ glossary 還沒有的詞 ${unknown.size} 個（留原樣，不半翻，待補進 glossary）：`);
  console.log("    " + [...unknown].sort((a, b) => b[1] - a[1]).slice(0, 24).map(([k, v]) => `${k}(${v})`).join(" "));
}

if (bad.length) { console.error(`\n❌ 中英長度不符 ${bad.length} 處 —— 不寫入`); process.exit(1); }
console.log("\n✅ 中英標籤長度全部對齊；沒有半翻譯");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/formulas.json");
