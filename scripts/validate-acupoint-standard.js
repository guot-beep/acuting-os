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
 *   A9 an existing content field (配穴 / 臨床要點) was emptied — never delete
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
/* Shared-ness alone is NOT boilerplate. A8 originally flagged any string used by
   >=10 points, which swept up 「⚠️ 深刺可能刺穿肺造成氣胸（課件明列）」(10 穴) and
   「⚠️ 嚴禁深刺以免氣胸。」(10 穴). Those repeat because the same real risk applies
   to many chest/back points, so the rule as written pressured an agent to DELETE
   氣胸 warnings to get the wall green — the opposite of what it is for, and a
   plausible reason a refinement pass stripped safety text. Text naming an
   anatomical structure, organ risk, pregnancy, or bleeding is therefore exempt
   however often it recurs; only content that is vacuous for any needle
   insertion ("局部皮膚破損時避開。") counts as boilerplate. */
const REAL_RISK_RE = /氣胸|肺|動脈|靜脈|神經|直腸|膀胱|腹膜|眼球|關節腔|孕|哺乳|出血|抗凝|深刺|不可深|嚴禁|骨/;
const BOILERPLATE = (() => {
  const c = new Map();
  for (const r of recs) {
    for (const v of arr(r.contraindications)) {
      const k = String(v).trim();
      c.set(k, (c.get(k) || 0) + 1);
    }
  }
  return new Set([...c.entries()]
    .filter(([k, n]) => n >= 10 && !REAL_RISK_RE.test(k))
    .map(([k]) => k));
})();

/* A10-A13 added 2026-07-30 after an HT-channel review passed this validator
   while 9/9 points were still short of docs/ACUPOINT_CARD_TEMPLATE.md. The
   lesson recorded in that doc (§6.8「驗證器全綠不等於做完」) is only useful if
   the wall actually catches the next occurrence, so the checks are here now.

   Blocking vs reporting was decided by MEASURING the library first, not by
   how bad each defect feels. A check that 260/361 points already fail cannot
   block — every batch would fail on inherited state and the wall would be
   ignored. So:
     A10, A11  → 0 current failures library-wide, so they block EVERY record.
                 Both are things that are never correct at any stage, and both
                 are exactly what fires if an older branch reintroduces
                 pre-translation tags (which is how they were found).
     A12       → 264/361 records still carry the legacy status, so it blocks
                 template-grade records only (same gate as A4-A8).
     A13, and the pinyin / evidence-duplication rows → reported with counts.
                 281/361 and 346/361 respectively: real, known, library-wide
                 cleanup, not something a single channel batch introduced. */

// Import scaffolding. The transform that built the tag arrays annotated each
// term with what it was ("心痛 (Indication)"), and that annotation is not part
// of the label — it must never reach a chip the reader sees.
const SCAFFOLD_RE = /\((?:Indication|TCM Action|Function|Pattern)\)/i;
const TAG_FIELDS = ["action_tags_zh", "action_tags_en", "disease_tags_zh", "disease_tags_en"];
const EN_ARRAY_FIELDS = ["functions_en", "indications_en", "action_tags_en", "disease_tags_en", "point_identity_en"];
const ALLOWED_STATUS = new Set(["draft", "source_checked", "deprecated"]);
// 病系分類 belongs in disease_tags. "消化系統疾病" is not something the point
// DOES, so it is not an action — same rule that keeps 「募穴」 out of action_tags.
const SYSTEM_LABEL_RE = /系統疾病|系統病|System Disorders$|^(?:Neurological|Gynecological|Respiratory|Digestive|Reproductive|Mental & Psychiatric|Locomotor & Musculoskeletal|Head, Face & Sensory)[\w\s,&]*Disorders$/;
const TONE_RE = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i;

// A14 helpers — see the check itself for why A8 was not enough.
const NEEDLING_TEXT_RE = /(直刺|斜刺|平刺|沿皮刺|透刺|刺入)|[0-9０-９．.]+\s*[-–~～]\s*[0-9０-９．.]+\s*(寸|吋)/;
/* Broad on purpose. A depth limit IS a safety statement when it is framed as a
   limit ("頸部針刺深度控制在 0.3–0.5 吋", "直刺不超過 0.3 吋", "深刺可能傷及肺").
   A first, narrower version flagged four of those as type errors, which would
   have pushed someone to delete real warnings to get the wall green — the exact
   failure this check exists to prevent. */
const SAFETY_WORD_RE = /⚠|禁|嚴禁|慎|避開|避免|不可|勿|孕|哺乳|氣胸|動脈|靜脈|神經|急症|出血|就醫|評估|風險|感染|腫塊|過深|深刺|傷及|傷到|刺傷|不超過|不宜|控制在|嚴格控制|限制|以免|恐/;

let scaffoldHits = 0, cjkInEnHits = 0, badStatusHits = 0, systemTagHits = 0, noToneHits = 0, evidenceDupHits = 0, safetyTypeHits = 0;

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
  // A point that must never be needled has no depth to state, and demanding one
  // would be actively wrong — ST17 乳中's own contraindication is "NEVER needled
  // or treated", so a depth on that card would contradict the safety rule this
  // check exists to enforce. Same reason A6 does not apply: its single
  // "function" is the prohibition itself.
  const neverNeedled = arr(r.contraindications).concat(arr(r.cautions_zh))
    .some((v) => /絕對禁針|NEVER needled/i.test(String(v)));

  const nf = arr(r.functions_zh).length;
  funcCounts.push(nf);
  // The ceiling is the real rule: 16 unranked "functions" is the misfiling this
  // check exists to catch. The floor blocks nothing, because the source
  // sometimes genuinely gives very few — Chenoweth's table has exactly two
  // actions for LU4/LU8/LU11 and exactly one for SP16 腹哀 (「調理腸道」).
  // Erroring there would force padding, which is the same defect from the other
  // direction. Thin records still surface on the worklist for Ting to review.
  if (!neverNeedled && nf < 2) flag(r, `功效只有 ${nf} 條(目標 4-6,課件若真的只給這些就不用湊)`);
  if (!neverNeedled && nf > 8) {
    flag(r, `功效 ${nf} 條(上限 8,目標 4-6)`);
    if (isTemplate) errors.push(`A6 ${id}: functions_zh has ${nf} items — condense to the 8 key actions`);
  }
  if (!neverNeedled && !/\d/.test(String(r.needling || "") + String(r.acumethod_zh || ""))) {
    flag(r, "針法缺具體深度/角度數字");
    if (isTemplate) errors.push(`A7 ${id}: needling has no numeric depth/angle (safety-critical)`);
  }
  // A9 — Ting's rule that the existing content must survive the rewrite:
  // 「配穴的地方肯定是需要的…但這部分不能刪掉」. All 361 points carry
  // combine_points_zh and clinical_pearls today, so an empty one can only mean
  // a pass removed it. Enforced for every record, not just template-grade,
  // because deletion is exactly what an unfinished pass does.
  for (const [f, label] of [["combine_points_zh", "配穴"], ["clinical_pearls", "臨床要點"]]) {
    const v = r[f];
    const empty = Array.isArray(v) ? v.length === 0 : !String(v || "").trim();
    if (empty) {
      flag(r, `${label}(${f})被清空 —— 既有內容不可刪除`);
      errors.push(`A9 ${id}: ${f} is empty — existing content must not be deleted (${label})`);
    }
  }

  const bp = arr(r.contraindications).filter((v) => BOILERPLATE.has(String(v).trim()));
  if (bp.length) {
    boilerplateHits++;
    flag(r, `禁忌為共用套話(${bp.length} 條)`);
    if (isTemplate) errors.push(`A8 ${id}: contraindications are shared boilerplate — write point-specific risk`);
  }
  // A10 — import scaffolding left in a tag label. Blocks every record.
  const scaffold = TAG_FIELDS.flatMap((f) => arr(r[f])).filter((v) => SCAFFOLD_RE.test(String(v)));
  if (scaffold.length) {
    scaffoldHits++;
    flag(r, `標籤殘留匯入標記(${scaffold.length} 條)`);
    errors.push(`A10 ${id}: tag labels still carry import scaffolding — ${scaffold.slice(0, 2).map((s) => `「${s}」`).join("、")}${scaffold.length > 2 ? ` (+${scaffold.length - 2})` : ""}`);
  }

  // A11 — Chinese sitting inside an _en array. Blocks every record: a half
  // translated _en is worse than an empty one, because the card renders it as
  // if it were the English layer.
  const cjkInEn = EN_ARRAY_FIELDS.flatMap((f) => arr(r[f]).map((v) => [f, v])).filter(([, v]) => hasCJK(v));
  if (cjkInEn.length) {
    cjkInEnHits++;
    flag(r, `英文欄位內含中文(${cjkInEn.length} 條)`);
    errors.push(`A11 ${id}: ${cjkInEn[0][0]} contains Chinese — translate it or leave the whole array empty (${cjkInEn.length} item(s))`);
  }

  // A12 — AI may only write "draft"; source_checked is Ting's RV1 promotion.
  if (r.review_status && !ALLOWED_STATUS.has(r.review_status)) {
    badStatusHits++;
    flag(r, `review_status = ${r.review_status}`);
    if (isTemplate) errors.push(`A12 ${id}: review_status "${r.review_status}" is not draft/source_checked/deprecated`);
  }

  // A13 — reported only: 281/361 library-wide, a known cleanup pass.
  const sysTags = ["action_tags_zh", "action_tags_en"].flatMap((f) => arr(r[f])).filter((v) => SYSTEM_LABEL_RE.test(String(v).trim()));
  if (sysTags.length) {
    systemTagHits++;
    flag(r, `功效標籤混入病系分類(${sysTags.length} 條)`);
  }

  /* A14 — a safety field holding a needling instruction instead of a risk.
     A8 only catches text SHARED by many points, so when a pass wrote each
     point's own "臍下 3 寸，直刺 0.8-1.2 寸。" into contraindications the string
     was unique per point and sailed through as if it were point-specific. It
     left 206 points with a depth measurement where the contraindication should
     be and no warning at all. A safety field must state a RISK; if it only
     states where and how deep to needle, it is the wrong field. Text that
     mentions technique as part of a warning ("近肺區域需斜刺或淺刺，避免深刺")
     is correct and must not trip this. */
  const safetyTypeErr = arr(r.contraindications)
    .map((v) => String(v).trim())
    .filter((v) => v && NEEDLING_TEXT_RE.test(v) && !SAFETY_WORD_RE.test(v));
  if (safetyTypeErr.length) {
    safetyTypeHits++;
    flag(r, `禁忌欄是針法文字(${safetyTypeErr.length} 條)`);
    errors.push(`A14 ${id}: contraindications holds a needling instruction, not a risk — 「${safetyTypeErr[0].slice(0, 46)}」`);
  }

  if (!TONE_RE.test(String(r.pinyin || ""))) noToneHits++;
  if (r.evidence && r.modern_research_zh && String(r.evidence).trim() === String(r.modern_research_zh).trim()) evidenceDupHits++;

  if (!isTemplate) flag(r, "尚未依模板整理(無 field_sources)");
}

const inRange = funcCounts.filter((n) => n >= 2 && n <= 8).length;
console.log(`validate-acupoint-standard: ${recs.length} points (${templateGrade} template-grade)\n`);
console.log(`  中英未對齊 misaligned pairs      ${misaligned}`);
console.log(`  缺英文陣列 missing _en arrays     ${missingEnAny}`);
console.log(`  功效 2-8 條 curated               ${inRange}/${recs.length}  (max ${Math.max(...funcCounts)})`);
// Linking layer (template §6.5). Reported, never blocking: these are fields
// Ting will fill as her 中醫/西醫 notes come in, so an empty one is a known gap,
// not a defect. Showing the coverage keeps the gap visible instead of forgotten.
const linked = {
  conditions: recs.filter((r) => arr(r.related_conditions).length).length,
  patterns: recs.filter((r) => arr(r.tcm_pattern_ids).length).length,
  compare: recs.filter((r) => arr(r.compare_with).length).length
};
console.log(`  共用套話禁忌 boilerplate safety   ${boilerplateHits}  (${BOILERPLATE.size} distinct shared strings)`);
console.log(`  標籤殘留匯入標記 A10 (擋)         ${scaffoldHits}`);
console.log(`  英文欄位內含中文 A11 (擋)         ${cjkInEnHits}`);
console.log(`  review_status 非法 A12            ${badStatusHits}  (模板級才擋)`);
console.log(`  禁忌欄是針法文字 A14 (擋)         ${safetyTypeHits}`);

console.log(`\n全庫既有清理(報告不擋，非單一批次造成):`);
console.log(`  功效標籤混入病系分類 A13         ${systemTagHits}/${recs.length}`);
console.log(`  evidence 與 modern_research_zh 重複 ${evidenceDupHits}/${recs.length}`);
/* Toned pinyin is deliberately NOT reported as a gap. Ting 2026-07-30:
   「其實我不喜歡拼音有聲調 因為這樣搜尋打拼音很難找」— and she is right:
   `pinyin` is what unified search matches on, so "Zú Sān Lǐ" makes typing
   "zusanli" fail. Plain pinyin in this field is the correct state. If a toned
   form is ever wanted for display it belongs in a separate `pinyin_toned`
   field, leaving the searchable one untouched. Counted only as information. */
console.log(`  (參考) 無聲調拼音 ${noToneHits}/${recs.length} — 依 Ting 決定，pinyin 保持無聲調以便搜尋`);

console.log(`\n連接層(§6.5，待補不擋):`);
console.log(`  病證連結 related_conditions     ${linked.conditions}/${recs.length}`);
console.log(`  證候連結 tcm_pattern_ids        ${linked.patterns}/${recs.length}`);
console.log(`  複習對比 compare_with           ${linked.compare}/${recs.length}`);

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
  console.error(`\nFAIL — ${errors.length} defect(s) (A1-A3/A10/A11 apply to every record; A4-A8/A12 to template-grade only):`);
  errors.slice(0, 40).forEach((e) => console.error("  " + e));
  if (errors.length > 40) console.error(`  ... and ${errors.length - 40} more`);
  process.exit(1);
}
console.log("\nPASS — no blocking defects.");
