#!/usr/bin/env node
/**
 * clean-tag-vocabulary.js — repair the tag vocabulary before translating it.
 *
 * Auditing the 354 untranslated 病症 tags showed that a chunk of them are not
 * missing translations at all — they are broken source data that would have
 * been translated into equally broken English. Four kinds:
 *
 *  TYPO      OCR/typing damage from the CloudTCM scrape: 泄寫→泄瀉,
 *            肋間神終痛/肋間神經桶/助間神經痛→肋間神經痛, 腰膝疫痛→腰膝痠痛,
 *            日眩→目眩. Each maps to a term already in use elsewhere in the
 *            same file, which is what makes the repair safe rather than a guess.
 *
 *  SUFFIX    「…類辨證」 is a CloudTCM page-section heading ("the
 *            pattern-differentiation section for X"), not a clinical term. As a
 *            search tag it means nothing and it splits the vocabulary: 陽痿 and
 *            陽痿類辨證 are the same thing filed twice. Stripped to the stem.
 *
 *  MISFILED  清熱止痛 / 清熱祛風 / 安神定志 are actions sitting in
 *            disease_tags, and 陰蹻郄 / 陽蹻郄 / 陰維郄 / 陽維郄 are 特定穴
 *            identity sitting in action_tags — the template's
 *            identity_not_action rule, which the glossary already states but
 *            nothing enforced. Moved to the field they belong in.
 *
 *  FRAGMENT  Text that was cut mid-phrase by the scrape and means nothing on
 *            its own: 及盆腔炎等, 三叉神經痛等症狀, 科系統疾病, 泌尿生系統疾病,
 *            養滋陰, 胃下垂乳腺炎 (two terms glued). Dropped — a tag that is
 *            half a sentence cannot be searched for and cannot be translated.
 *
 * Nothing here is deleted for being untidy (§0). Every drop is a fragment that
 * carries no meaning, and every move keeps the term, just in the right field.
 * The _en array is kept index-aligned throughout (A4).
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/acupoints/361.json");
const APPLY = process.argv.includes("--apply");

const TYPO = {
  "泄寫": "泄瀉",
  "肋間神終痛": "肋間神經痛",
  "肋間神經桶": "肋間神經痛",
  "助間神經痛": "肋間神經痛",
  "腰膝疫痛": "腰膝痠軟",
  "日眩": "目眩"
};

// Actions parked in disease_tags → move to action_tags.
const MOVE_TO_ACTION = new Set(["清熱止痛", "清熱祛風", "安神定志"]);
// 特定穴 identity parked in action_tags → move to point_identity_zh.
const MOVE_TO_IDENTITY = new Set(["陰蹻郄", "陽蹻郄", "陰維郄", "陽維郄"]);

const FRAGMENT = new Set([
  "及盆腔炎等", "三叉神經痛等症狀", "科系統疾病", "泌尿生系統疾病", "養滋陰",
  "胃下垂乳腺炎"
]);

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = Array.isArray(data) ? data : (data.records || data.points);

const tally = { typo: 0, suffix: 0, moved: 0, dropped: 0, deduped: 0 };
const samples = { typo: new Set(), suffix: new Set(), moved: new Set(), dropped: new Set() };

for (const r of recs) {
  for (const [zk, ek, otherZk, otherEk] of [
    ["action_tags_zh", "action_tags_en", "disease_tags_zh", "disease_tags_en"],
    ["disease_tags_zh", "disease_tags_en", "action_tags_zh", "action_tags_en"]
  ]) {
    const zh = r[zk];
    if (!Array.isArray(zh) || !zh.length) continue;
    const en = Array.isArray(r[ek]) ? r[ek] : [];
    const outZh = [], outEn = [];
    const seen = new Set();

    for (let i = 0; i < zh.length; i++) {
      let t = String(zh[i] || "").trim();
      let e = en[i] == null ? "" : String(en[i]);
      if (!t) continue;

      if (TYPO[t]) { samples.typo.add(`${t}→${TYPO[t]}`); t = TYPO[t]; tally.typo++; e = ""; }

      if (/類辨證$/.test(t)) {
        const stem = t.replace(/類辨證$/, "");
        if (stem) { samples.suffix.add(`${t}→${stem}`); t = stem; tally.suffix++; e = ""; }
      }

      if (FRAGMENT.has(t)) { samples.dropped.add(t); tally.dropped++; continue; }

      const goesToAction = zk === "disease_tags_zh" && MOVE_TO_ACTION.has(t);
      const goesToIdentity = zk === "action_tags_zh" && MOVE_TO_IDENTITY.has(t);

      if (goesToIdentity) {
        r.point_identity_zh = r.point_identity_zh || [];
        if (!r.point_identity_zh.includes(t)) r.point_identity_zh.push(t);
        samples.moved.add(`${t} → point_identity_zh`);
        tally.moved++;
        continue;
      }
      if (goesToAction) {
        r[otherZk] = r[otherZk] || [];
        r[otherEk] = Array.isArray(r[otherEk]) ? r[otherEk] : [];
        if (!r[otherZk].includes(t)) {
          r[otherZk].push(t);
          // Keep the sibling array aligned: push a slot even when empty.
          while (r[otherEk].length < r[otherZk].length - 1) r[otherEk].push("");
          r[otherEk].push(e);
        }
        samples.moved.add(`${t} → ${otherZk}`);
        tally.moved++;
        continue;
      }

      // Repairs can collapse two entries onto the same term.
      if (seen.has(t)) { tally.deduped++; continue; }
      seen.add(t);
      outZh.push(t);
      outEn.push(e);
    }

    r[zk] = outZh;
    // A4: an _en array either matches its _zh length or is absent entirely.
    if (outEn.some((x) => x)) r[ek] = outEn;
    else if (Array.isArray(r[ek])) r[ek] = outEn;
  }
}

// A4 sweep — the moves above touch two arrays at once, so verify rather than
// assume.
const misaligned = [];
for (const r of recs) {
  for (const [zk, ek] of [["action_tags_zh", "action_tags_en"], ["disease_tags_zh", "disease_tags_en"]]) {
    const z = r[zk], e = r[ek];
    if (Array.isArray(z) && Array.isArray(e) && e.length && z.length !== e.length) {
      misaligned.push(`${r.code} ${zk} ${z.length} vs ${e.length}`);
    }
  }
}

const show = (s, n = 6) => [...s].slice(0, n).join("、") + (s.size > n ? ` …(${s.size})` : "");
console.log("標籤詞彙清理");
console.log(`  錯字修正   ${String(tally.typo).padStart(4)}  ${show(samples.typo)}`);
console.log(`  去「類辨證」 ${String(tally.suffix).padStart(4)}  ${show(samples.suffix)}`);
console.log(`  移到正確欄位 ${String(tally.moved).padStart(4)}  ${show(samples.moved)}`);
console.log(`  丟棄殘句   ${String(tally.dropped).padStart(4)}  ${show(samples.dropped)}`);
console.log(`  合併重複   ${String(tally.deduped).padStart(4)}`);

if (misaligned.length) {
  console.error(`\n❌ A4 中英長度不符 ${misaligned.length} 處 —— 不寫入:`);
  misaligned.slice(0, 10).forEach((m) => console.error("  " + m));
  process.exit(1);
}
console.log("\n✅ 中英標籤長度全部對齊");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/acupoints/361.json");
