#!/usr/bin/env node
/**
 * validate-formula-composition-signatures.js — FB-20: permanent detector for
 * the "wrong formula's composition on this card" mis-join.
 *
 * Origin: docs/research_packs/FORMULA_EYESON_02.md F-32 and F-41. A one-off
 * scan during the eyes-on read found `formula.gui_zhi_fu_ling_wan` (桂枝茯苓丸,
 * a board-exam gynecology formula, on_board_list:true, exam_star:1) carrying
 * `formula.fu_ling_wan`'s (茯苓丸) composition byte-for-byte — the card lists
 * 芒硝 (mirabilite, contraindicated in pregnancy) which the real formula does
 * not contain, and omits 桃仁 (peach kernel, also pregnancy-contraindicated)
 * which it does. Separately, `shen_qi_wan` and `jin_gui_shen_qi_wan` turned
 * out to be two records for one formula with contradictory exam_importance.
 * Both were found by a human reading 30 cards end to end. This script makes
 * the same check something every future batch gets for free.
 *
 * ── What a "signature" is, and why it is built this way ──────────────────
 *
 * For each record's `composition[]`, every entry is reduced to one token:
 *
 *     herbKey | doseKey | roleKey
 *
 *   herbKey  — `herb_id` when present (the canonical, collision-resistant
 *              key), else normalized `herb_zh`/`name_zh`. Parenthesized
 *              alternates ("(桂枝)") are kept as-is: they mark a clinically
 *              different (optional/substitute) ingredient from the bare
 *              name, and stripping the parens would manufacture a false
 *              match between "(桂枝)" and "桂枝".
 *   doseKey  — first populated of dose_range, dose_g, decoction_reference_g,
 *              classical_amount_text, granule_reference_g, whitespace- and
 *              dash-normalized. This is the field the mis-join actually
 *              copies (F-32's dose_g values are identical down to the "g"),
 *              so it is part of the signal, not noise.
 *   roleKey  — role_zh (fallback role_en/role), trimmed. 君/臣/佐/使 is a
 *              closed vocabulary (F7), so no further canonicalization needed.
 *
 * The FULL signature is the sorted, joined list of these tokens —
 * **order-insensitive across entries, but each entry's herb+dose+role stay
 * bound together before sorting.** Two reasons:
 *   1. Order-insensitive because a formula can legitimately be re-keyed in
 *      a different entry order (匯入 order vs 君臣佐使 order) without being
 *      a different formula, and a detector that a mere reorder can defeat
 *      would be trivial to accidentally dodge.
 *   2. Entry-bound because scrambling herb/dose/role across DIFFERENT
 *      entries before sorting would invent matches (or misses) that have
 *      nothing to do with whether the two composition TABLES are the same
 *      table — that is a different, unrelated defect class (see
 *      validate-formula-standard.js F7's role-vocabulary check), not this
 *      one.
 *
 * The SHAPE signature is the same construction with doseKey dropped —
 * herb+role only. Two records with the same shape but a different full
 * signature share every ingredient and every role, differing only in dose:
 * the "near-duplicate" tier this script also reports (weaker signal, never
 * blocking — see FB-20's brief in FORMULA_EYESON_02.md §3).
 *
 * MIN_ITEMS = 3: signatures are only compared for records with >=3
 * composition entries. Both known real cases have 4 and 9 entries; a 1- or
 * 2-herb match (e.g. two different single-herb decoctions using the same
 * dose) is far more likely to be coincidental than a mis-join, and dropping
 * the floor to 2 was tested against the current corpus and produced the
 * identical 4-pair result — so 3 costs nothing today and is the safer
 * default against future small formulas. Records with `composition` shorter
 * than 3, or missing entirely, are excluded from BOTH sides of a pair —
 * silence there is not evidence of anything.
 *
 * ── Honest cases vs defects ────────────────────────────────────────────
 *
 * A raw signature match is not automatically a defect. Before a pair is
 * reported as an unresolved duplicate, it is checked against, in order:
 *
 *   1. review_status:"deprecated" on either side — constitution 紅線 2 says
 *      retirement is `deprecated`, never a hard delete, so a deprecated
 *      record sharing a signature with its replacement is the RESOLUTION,
 *      not a new defect. Reported in the worklist tagged `resolved
 *      (deprecated)`, excluded from the unresolved/blocking-eligible count.
 *      No allowlist entry needed — this recognizes itself.
 *   2. formula-composition-signature-allowlist.json (co-located with this
 *      script; see its _readme) — a human has recorded a specific reason
 *      two live ids may legitimately share a signature (e.g. two dosage
 *      forms of one classical formula kept as two cards on purpose).
 *      Reported in the worklist tagged `allowlisted`, excluded from the
 *      unresolved count.
 *   3. correction_note on either side that already names the other id —
 *      the relationship has been written down (e.g. shen_qi_wan's FB-19
 *      correction_note cites jin_gui_shen_qi_wan by id), so this is a
 *      KNOWN, tracked defect rather than a fresh discovery. Still counted
 *      as unresolved (a correction_note documenting a problem is not the
 *      same as fixing it) but tagged `documented` in the worklist so a
 *      reader can tell "already on someone's list" from "brand new".
 *   Anything left is tagged `undocumented` — reported the same as
 *   `documented`, just without the paper trail.
 *
 * ── CI tier: NOTE today, not BLOCKING ──────────────────────────────────
 *
 * Default invocation (no flags) NEVER exits 1 for signature findings — it
 * always reports them and exits 0. That is deliberate: as of this script's
 * introduction there are 4 unresolved exact-duplicate pairs in the live
 * data (gui_zhi_fu_ling_wan/fu_ling_wan and shen_qi_wan/jin_gui_shen_qi_wan
 * from the ledger, plus yu_nv_jian/yu_nu_jian and
 * ling_jiao_gou_teng_tang/ling_jiao_gou_teng_yin which this script found on
 * its first run — see the report). Wiring this straight to `exit 1` in the
 * green job today would break the build over content nobody has fixed yet,
 * which AI_CONSTITUTION's own ratchet rationale calls out as how a gate
 * gets turned off within a week. So this lives in the green job as an
 * informational step for now (visible in every CI run, not gating it).
 *
 * GRADUATION CONDITION — mirrors how validate-point-ids moved out of
 * check-validation-ratchet.js's RATCHETED list into an unconditional
 * failing step in .github/workflows/validate.yml's green job on
 * 2026-08-06 (see that script's comment): once every unresolved
 * exact-duplicate pair above has been closed — by deprecating one side,
 * correcting the mis-joined composition, or an explicit allowlist entry —
 * so that `--blocking` exits 0, change the CI step for this script to pass
 * `--blocking`. From that point a NEW mis-join fails the build the same
 * day it is written, instead of waiting for the next eyes-on read.
 * Near-duplicate (dose-only) findings are NEVER part of `--blocking` — they
 * are real signal but not on their own proof of a mis-join (see FB-21,
 * which covers the sibling case of a mechanically generated dose range),
 * so they stay note-tier permanently.
 *
 * Usage:
 *   node scripts/validate-formula-composition-signatures.js
 *   node scripts/validate-formula-composition-signatures.js --worklist
 *   node scripts/validate-formula-composition-signatures.js --blocking
 *   node scripts/validate-formula-composition-signatures.js --json
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");
const ALLOWLIST_FILE = path.join(__dirname, "formula-composition-signature-allowlist.json");

const WORKLIST = process.argv.includes("--worklist");
const BLOCKING = process.argv.includes("--blocking");
const JSON_OUT = process.argv.includes("--json");

const MIN_ITEMS = 3;

const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
const recs = data.records || data;

const allowlistDoc = fs.existsSync(ALLOWLIST_FILE)
  ? JSON.parse(fs.readFileSync(ALLOWLIST_FILE, "utf8"))
  : { pairs: [] };
const allowlistSet = new Set(
  (allowlistDoc.pairs || []).map((p) => [p.a, p.b].sort().join("|"))
);
const allowlistReason = new Map(
  (allowlistDoc.pairs || []).map((p) => [[p.a, p.b].sort().join("|"), p.reason || ""])
);

const norm = (s) =>
  String(s == null ? "" : s)
    .trim()
    .replace(/[‐-―]/g, "-") // various dash glyphs -> "-"
    .replace(/\s+/g, "")
    .toLowerCase();

const herbKey = (c) => (c.herb_id ? "id:" + norm(c.herb_id) : "zh:" + norm(c.herb_zh || c.name_zh || ""));
const doseKey = (c) =>
  norm(c.dose_range || c.dose_g || c.decoction_reference_g || c.classical_amount_text || c.granule_reference_g || "");
const roleKey = (c) => norm(c.role_zh || c.role_en || c.role || "");

function signatures(comp) {
  const full = [];
  const shape = [];
  for (const c of comp) {
    full.push(`${herbKey(c)}|${doseKey(c)}|${roleKey(c)}`);
    shape.push(`${herbKey(c)}|${roleKey(c)}`);
  }
  full.sort();
  shape.sort();
  return { full: full.join(";;"), shape: shape.join(";;") };
}

const bySig = new Map(); // full signature -> [record]
const byShape = new Map(); // shape signature -> [record]
let nEligible = 0;

for (const r of recs) {
  const comp = Array.isArray(r.composition) ? r.composition : [];
  if (comp.length < MIN_ITEMS) continue;
  nEligible++;
  const { full, shape } = signatures(comp);
  if (!bySig.has(full)) bySig.set(full, []);
  bySig.get(full).push(r);
  if (!byShape.has(shape)) byShape.set(shape, []);
  byShape.get(shape).push(r);
}

function classify(rA, rB) {
  const key = [rA.id, rB.id].sort().join("|");
  if (rA.review_status === "deprecated" || rB.review_status === "deprecated") {
    return { tag: "resolved (deprecated)", blocking: false };
  }
  if (allowlistSet.has(key)) {
    return { tag: `allowlisted — ${allowlistReason.get(key) || "(no reason on file)"}`, blocking: false };
  }
  // correction_note prose conventionally drops the "formula." namespace
  // prefix (e.g. shen_qi_wan's own note reads "與 jin_gui_shen_qi_wan 組成簽章
  // 重複"), so match on the bare slug as well as the full id. "Documented"
  // means one side's OWN note names the other side — not that both notes
  // mention each other.
  const mentionsOther = (own, otherId) => {
    const note = own.correction_note || "";
    return note.includes(otherId) || note.includes(otherId.replace(/^formula\./, ""));
  };
  if (mentionsOther(rA, rB.id) || mentionsOther(rB, rA.id)) {
    return { tag: "documented (correction_note names the other id)", blocking: true };
  }
  return { tag: "undocumented", blocking: true };
}

// ── exact-duplicate pairs (full signature match across different ids) ──────
const exactPairs = [];
for (const [, group] of bySig) {
  if (group.length < 2) continue;
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const [a, b] = [group[i], group[j]];
      const info = classify(a, b);
      exactPairs.push({ a: a.id, b: b.id, nameA: a.name_zh, nameB: b.name_zh, items: (a.composition || []).length, ...info });
    }
  }
}

// ── near-duplicate pairs (same shape, dose differs) — exclude exact dups ──
const exactPairKeys = new Set(exactPairs.map((p) => [p.a, p.b].sort().join("|")));
const nearPairs = [];
for (const [, group] of byShape) {
  if (group.length < 2) continue;
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const [a, b] = [group[i], group[j]];
      const key = [a.id, b.id].sort().join("|");
      if (exactPairKeys.has(key)) continue;
      nearPairs.push({ a: a.id, b: b.id, nameA: a.name_zh, nameB: b.name_zh, items: (a.composition || []).length });
    }
  }
}

const unresolvedBlocking = exactPairs.filter((p) => p.blocking);

if (JSON_OUT) {
  console.log(
    JSON.stringify(
      {
        eligible_records: nEligible,
        exact_duplicate_pairs: exactPairs.length,
        exact_duplicate_unresolved: unresolvedBlocking.length,
        near_duplicate_pairs: nearPairs.length,
        allowlisted_pairs: allowlistDoc.pairs.length,
        pairs: exactPairs,
        near: nearPairs,
      },
      null,
      2
    )
  );
} else {
  console.log(`validate-formula-composition-signatures: ${recs.length} 筆方劑（${nEligible} 筆組成 ≥${MIN_ITEMS} 味，納入比對）\n`);
  console.log(`  組成簽章完全重複的方對（不同 id）  ${exactPairs.length}`);
  console.log(`    其中已解（deprecated / 白名單）  ${exactPairs.length - unresolvedBlocking.length}`);
  console.log(`    其中未解（documented + undocumented） ${unresolvedBlocking.length}`);
  console.log(`  近似重複的方對（僅劑量不同）        ${nearPairs.length}`);
  console.log(`  白名單筆數                          ${allowlistDoc.pairs.length}`);

  if (exactPairs.length) {
    console.log(`\n===== 組成簽章完全重複 EXACT DUPLICATE =====`);
    for (const p of exactPairs) {
      console.log(`  ${p.a} (${p.nameA}) == ${p.b} (${p.nameB})  [${p.items} 味]  — ${p.tag}`);
    }
  }
  if (WORKLIST && nearPairs.length) {
    console.log(`\n===== 近似重複（僅劑量不同）NOTE 級，不擋 =====`);
    for (const p of nearPairs) {
      console.log(`  ${p.a} (${p.nameA}) ~~ ${p.b} (${p.nameB})  [${p.items} 味]`);
    }
  } else if (!WORKLIST && nearPairs.length) {
    console.log(`\n（加 --worklist 可列出 ${nearPairs.length} 對近似重複的細節）`);
  }

  console.log(
    `\n提示：本檢查目前是 NOTE 級，不會讓 CI 失敗（見腳本開頭「CI tier」說明）。` +
      `加 --blocking 可預覽「畢業後」的行為：未解的完全重複方對會讓腳本以 exit 1 結束。`
  );
}

if (BLOCKING && unresolvedBlocking.length) {
  console.error(`\n❌ --blocking: ${unresolvedBlocking.length} 個未解的組成簽章完全重複（見上方列表）。`);
  process.exit(1);
}

console.log(BLOCKING ? "\nPASS（--blocking，目前 0 個未解）。" : "\n完成（NOTE 級，不影響 exit code）。");
