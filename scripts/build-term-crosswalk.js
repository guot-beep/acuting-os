#!/usr/bin/env node
/**
 * build-term-crosswalk.js — 從 repo 自家權威推導英→中詞表，供中文欄位回填。
 *
 * 問題：方劑卡的 `treats_zh` / `modern_applications_zh`（主治／現代運用）有 65%
 * 的格子裝的是英文——匯入時把英文同時灌進了 _zh 與 _en 兩欄，所以 Ting 在
 * 中文欄看到的是 "Gonorrhea"、"Chicken pox"。validate-encoding 抓得到
 * （chinese_field_without_cjk），但沒有任何 gate 擋，也沒人回填過。
 *
 * 權威順序：data/config/clinical_term_zh_map.json（已裁定，最高）→ repo 既有中英配對。
 * 這支的原則：**一個字都不發明**。中文只能來自 repo 既有的權威中英配對
 * （病名 canon、證型／症狀登記簿、以及同一批卡上已策展的雙語標籤），
 * 每一筆都記下出處。推不出來的就標 untranslated，留給下一波人工／查證，
 * 絕不用模型即興翻譯填進去。
 *
 * 產出 data/audits/en_zh_term_crosswalk.json，每筆 status：
 *   applied              唯一解且通過全部拒收規則 → 可機械套用
 *   ambiguous_deferred   repo 裡有多個中文候選 → 需人工裁定語域（台灣用語）
 *   rejected_<rule>      有唯一解但被拒收規則擋下
 *   untranslated         自家權威查無此詞
 *   junk                 不含英文字母的匯入殘渣（如 "( )"）
 *
 * Usage: node scripts/build-term-crosswalk.js [--quiet]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = "data/audits/en_zh_term_crosswalk.json";
const rd = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const hasCJK = (s) => /[一-鿿㐀-䶿]/.test(String(s));
const norm = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ").replace(/[.．,，;；]+$/, "");
const digits = (s) => (String(s).match(/[0-9]/g) || []).sort().join("");

// ---- 1. 蒐集自家權威的中英配對 -------------------------------------------
const pairs = new Map();               // norm(en) -> Map(zh -> Set(source))
function addPair(en, zh, src) {
  if (!en || !zh || hasCJK(en) || !hasCJK(zh)) return;
  const k = norm(en);
  if (!k) return;
  if (!pairs.has(k)) pairs.set(k, new Map());
  const m = pairs.get(k);
  const z = String(zh).trim();
  if (!m.has(z)) m.set(z, new Set());
  m.get(z).add(src);
}
const recordsOf = (o) => (Array.isArray(o) ? o : (o.records || o.entries || []));
for (const [f, src] of [
  ["data/pathology/cloudtcm_disease_entries.json", "cloudtcm_disease"],
  ["data/pathology/condition_canon_shortlist.json", "condition_canon"],
  ["data/pathology/tdis_registry.json", "tdis_registry"],
  ["data/symptoms/symptoms.json", "symptoms"],
  ["data/pathology/pattern_library.json", "pattern_library"],
  ["data/pathology/pattern_registry.json", "pattern_registry"],
]) {
  try { for (const r of recordsOf(rd(f))) addPair(r.name_en, r.name_zh, src); } catch (e) {}
}
try {
  const c = rd("data/pathology/conditions.json");
  for (const k of ["records", "eastern_diseases", "tcm_patterns"]) {
    for (const r of (c[k] || [])) addPair(r.name_en, r.name_zh, "conditions." + k);
  }
} catch (e) {}
// 同一批卡上已策展的雙語標籤——語域最貼近，出處也最近
for (const [f, src] of [["data/herbs/formulas.json", "formula"], ["data/herbs/herb_canon_shortlist.json", "herb"]]) {
  try {
    for (const r of rd(f).records) {
      for (const [zk, ek] of [["condition_tags_zh", "condition_tags_en"], ["pattern_tags_zh", "pattern_tags_en"]]) {
        const z = r[zk], e = r[ek];
        if (Array.isArray(z) && Array.isArray(e) && z.length === e.length) {
          z.forEach((v, i) => addPair(e[i], v, `${src}.${zk.replace("_zh", "")}`));
        }
      }
    }
  } catch (e) {}
}
for (const f of fs.readdirSync(path.join(ROOT, "data/config"))) {
  if (!/vocabulary|glossary/.test(f)) continue;
  try {
    const j = rd("data/config/" + f);
    const arr = j.records || j.concepts || j.categories || j.groups || j.flags || [];
    for (const r of (Array.isArray(arr) ? arr : Object.values(arr))) {
      addPair(r.label_en || r.name_en, r.label_zh || r.name_zh, "config/" + f);
    }
  } catch (e) {}
}

// 已裁定的譯名（data/config/clinical_term_zh_map.json）是最高權威：歧義在那裡
// 已經被解掉了，所以命中就直接 applied，不再走多義偵測。Ting 的裁定（method=
// ting_ruling）與雙盲收斂的結果都住在同一個檔，來源逐筆可查。
const CURATED = new Map();
try {
  for (const e of (rd("data/config/clinical_term_zh_map.json").entries || [])) {
    if (e && e.en && e.zh) CURATED.set(norm(e.en), e);
  }
} catch (err) {}

// ---- 2. 蒐集待回填的英文詞（只看會上卡的兩個中文欄位） --------------------
const TARGET_FIELDS = [["treats_zh", "treats_en"], ["modern_applications_zh", "modern_applications_en"]];
const terms = new Map();
for (const r of rd("data/herbs/formulas.json").records) {
  for (const [zk, ek] of TARGET_FIELDS) {
    const z = r[zk], e = r[ek];
    if (!Array.isArray(z)) continue;
    z.forEach((v, i) => {
      if (hasCJK(v)) return;
      const t = String(v).trim();
      const enSame = Array.isArray(e) && e[i] !== undefined && norm(e[i]) === norm(t);
      if (!terms.has(t)) terms.set(t, { term_en: t, count: 0, slots_en_mirrored: 0, sample_formula: r.name_zh || r.id });
      const rec = terms.get(t);
      rec.count++;
      if (enSame) rec.slots_en_mirrored++;
    });
  }
}

// ---- 3. 逐詞判定 ----------------------------------------------------------
const out = [];
const tally = {};
for (const rec of [...terms.values()].sort((a, b) => b.count - a.count || a.term_en.localeCompare(b.term_en))) {
  const t = rec.term_en;
  let status, zh = null, sources = [], candidates;
  if (!/[A-Za-z]/.test(t)) {
    status = "junk";                                   // "( )" 這類匯入殘渣，不碰
  } else if (CURATED.has(norm(t))) {
    const c = CURATED.get(norm(t));
    zh = c.zh;
    sources = ["curated:" + (c.method || "manual")];
    status = digits(t) !== digits(zh) ? "rejected_digit_mismatch"
      : !hasCJK(zh) ? "rejected_not_chinese"
      : rec.slots_en_mirrored !== rec.count ? "rejected_en_not_mirrored"
      : "applied";
  } else {
    const m = pairs.get(norm(t));
    if (!m) status = "untranslated";
    else if (m.size > 1) { status = "ambiguous_deferred"; candidates = [...m.keys()]; }
    else {
      zh = [...m.keys()][0];
      sources = [...m.get(zh)];
      // 拒收規則（寧可少譯，不可譯錯）
      if (digits(t) !== digits(zh)) status = "rejected_digit_mismatch";
      else if (!hasCJK(zh)) status = "rejected_not_chinese";
      else if (rec.slots_en_mirrored !== rec.count) status = "rejected_en_not_mirrored";
      else status = "applied";
    }
  }
  tally[status] = (tally[status] || 0) + 1;
  out.push({ term_en: t, zh, status, count: rec.count, slots_en_mirrored: rec.slots_en_mirrored,
             sources: sources.length ? sources : undefined, candidates, sample_formula: rec.sample_formula });
}
const slots = (s) => out.filter((o) => o.status === s).reduce((n, o) => n + o.count, 0);
const doc = {
  dataset: "EN→ZH term crosswalk for formula 主治／現代運用 backfill",
  generated_by: "scripts/build-term-crosswalk.js",
  policy: [
    "中文一律來自 repo 既有權威中英配對，逐筆記出處；模型不發明譯詞。",
    "只有 status=applied 會被 scripts/apply-zh-term-backfill.js 套用。",
    "拒收規則：數字集合必須相同、譯文必須含中文、該詞的每一格都必須在同索引的 _en 有一模一樣的英文（保證英文不會因回填而消失）。",
    "ambiguous_deferred 需人工裁定語域（台灣用語 vs 其他），不得用頻次自動取。",
  ],
  authority_pairs: pairs.size,
  curated_entries: CURATED.size,
  totals: {
    unique_terms: out.length,
    slots_total: out.reduce((n, o) => n + o.count, 0),
    by_status: tally,
    slots_by_status: Object.fromEntries(Object.keys(tally).map((s) => [s, slots(s)])),
  },
  terms: out,
};
fs.writeFileSync(path.join(ROOT, OUT), JSON.stringify(doc, null, 1) + "\n");
if (!process.argv.includes("--quiet")) {
  console.log(`Wrote ${OUT}`);
  console.log(JSON.stringify(doc.totals, null, 1));
}
