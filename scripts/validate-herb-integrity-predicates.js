#!/usr/bin/env node
/**
 * validate-herb-integrity-predicates.js — machine-enforced structural /
 * internal-consistency predicates for `data/herbs/herb_canon_shortlist.json`.
 *
 * Origin: docs/research_packs/HERB_EYESON_01.md §3.4's "HB series" — 24
 * findings from a 30-card human eyes-on read, distilled into predicates a
 * machine can decide "without any clinical knowledge, no deletion". This
 * script implements the eight that are pure mechanics: HB-4, HB-5, HB-6,
 * HB-8, HB-9, HB-10, HB-11, HB-12. (HB-1/HB-2 are js/knowledge.js rendering
 * fixes, not data predicates. HB-3 and HB-7 both require deleting or
 * rewriting existing content, which the constitution's 紅線 3 reserves for a
 * human decision — they are NOT in this script.)
 *
 * WHAT THESE PREDICATES CAN AND CANNOT GUARANTEE — read this before quoting
 * a PASS from this script. They check STRUCTURE and INTERNAL CONSISTENCY
 * only: a link resolves, a field exists, two strings do or don't match, an
 * enum value is in a closed list. They say NOTHING about clinical
 * correctness. A card can pass all eight predicates here and still carry a
 * wrong dose, an uncited safety claim, or a missing aristolochic-acid
 * warning (HERB_EYESON_01.md H-09: 細辛 has zero mentions of 馬兜鈴酸 and this
 * script cannot know that fact is missing — it has no medical knowledge, it
 * only compares fields already present in the record to each other). That
 * class of defect waits on sourced content, per 憲法第四條: 查不到就停下來
 * 回報，不要編. Nothing here writes or suggests replacement text.
 *
 * ── The predicates ──────────────────────────────────────────────────────
 *
 * HB-4  every `related_formulas` id must (a) exist in
 *       data/herbs/formulas.json and (b) that formula's `composition` must
 *       contain an entry whose `herb_id` slug equals this card's own slug.
 *
 *       SEMANTICS ARE OPEN — docs/TING_DECISION_QUEUE.md C6 has not ruled
 *       whether `related_formulas` means "formulas that CONTAIN this herb"
 *       or "formulas generally related to this herb (may or may not contain
 *       it)". If the latter, today's mismatches are not bugs, just an
 *       unsourced/unlabeled relation. So this predicate is reported as
 *       "links whose formula does not contain this herb" — never as
 *       "broken links" — and split into two buckets that are NOT equally
 *       uncertain:
 *         dead_id            the formula id does not exist in formulas.json
 *                             at all. This is a broken foreign key under
 *                             EITHER reading of C6 — nothing to rule on.
 *         no_herb_in_comp    the formula exists but its composition has no
 *                             herb_id matching this card. This bucket is
 *                             exactly what depends on C6.
 *       A third number is reported for coverage honesty, not counted as a
 *       violation of anything: within no_herb_in_comp, how many rows would
 *       be "rescued" by falling back to a herb_zh substring match against
 *       this card's name_zh (i.e. the composition row lacks a `herb_id` but
 *       its `herb_zh` text does contain the herb's name — the herb may
 *       actually be present, just not linked by id on the formula side).
 *       That bucket is NOT subtracted from HB-4's count, because the
 *       mission's literal spec is "composition must contain this herb's
 *       id" — but it is reported so a reader is not misled about how many
 *       of these are content-genuine misses vs id-linkage gaps upstream in
 *       formulas.json (owned by the formula/herb line, not this script).
 *
 *       Blocking graduation for the no_herb_in_comp bucket is BLOCKED ON
 *       C6, not on content work — see the graduation notes below.
 *       Blocking graduation for the dead_id bucket depends only on fixing
 *       3 ids and is independent of C6.
 *
 * HB-5  `safety_flags` containing toxic|toxicity_review|heavy_metal_review
 *       ⇒ `contraindications_zh` non-empty AND `dosage_g.standard_daily_g`
 *       non-empty. Herb-layer twin of the formula layer's P1
 *       (validate-formula-safety-predicates.js). A record fails if EITHER
 *       half is missing; both halves are reported per-record so a
 *       remediation batch can tell which one to fix.
 *
 * HB-6  `properties_taste_temp` must not contain both a toxicity marker
 *       (有毒|小毒|大毒) and 無毒, nor both a cold marker (寒|涼) and a hot
 *       marker (溫|熱), in the same string. This is HERB_EYESON_01.md H-10's
 *       criterion verbatim: multi-source labels concatenated without
 *       dedup, e.g. 大黃 `甘、苦、有毒、寒、無毒`.
 *
 * HB-8  `review_status` must be one of draft | source_checked | deprecated
 *       (模板 §2.7 / 憲法: AI 只能寫 draft; source_checked/deprecated come
 *       from Ting's RV1 or a formal retirement). Anything else — including
 *       `undefined`, `reviewed`, `draft_reviewed`, or the CloudTCM-import
 *       value `sourced_cloudtcm_record` — is reported by its literal value.
 *
 *       MEASURED COUNT DIFFERS FROM THE DISPATCH'S STATED EXPECTATION —
 *       see the CI-tier section below for the full explanation; the short
 *       version is the dispatch's "reviewed×1, draft_reviewed×1,
 *       undefined×5" appears to be the 30-card HERB_EYESON_01 SAMPLE's H-14
 *       finding (a different predicate: "not draft"), not the full-corpus
 *       count for THIS predicate's literal enum, which the same ledger's
 *       own §3.1 census already lists as also including
 *       `sourced_cloudtcm_record` ×41. This script measures the full
 *       corpus against the enum stated in the mission text and reports 48.
 *
 * HB-9  `card_grade === "gold"` ⇒ `field_sources` non-empty (object with
 *       ≥1 key, or non-empty array/string if the field is ever shaped that
 *       way). HERB_EYESON_01.md H-13: 炙甘草 is the only `gold` card in the
 *       corpus and its `field_sources` is `{}`.
 *
 * HB-10 no string entry may appear verbatim in BOTH `contraindications_zh`
 *       and `cautions_zh` on the same record. 模板 §2.0a: 禁用/忌服 and
 *       慎用/慎服 are different clinical judgments and render in two
 *       different card sections; an entry duplicated into both makes those
 *       sections say the same thing under two different headings.
 *
 * HB-11 `clinical_use_note` byte-identical to
 *       `chinese_depth_track.summary_zh` ⇒ report "study note not
 *       written" (模板 §11.5: this field is supposed to be a synthesized
 *       identification/differentiation note, not a re-dump of the intake
 *       summary). Reported, never rewritten — the fix is clinical
 *       synthesis work, not a mechanical predicate's job.
 *
 * HB-12 presence of a NON-EMPTY `primary_actions_en` ⇒ report. 模板 §1
 *       "已刪除、不要再加": this field was formally retired
 *       (superseded by the bilingual tags inside 功效 (Actions)) and its
 *       reappearance means either a stale merge or a regenerate that didn't
 *       read the current template.
 *
 * ── CI tier: every predicate is NOTE today ─────────────────────────────
 *
 * Measured on the live corpus (branch codex/herb-integrity-predicates, off
 * codex/pattern-v2 tip 8d24349), 358 records in
 * data/herbs/herb_canon_shortlist.json, 1666 related_formulas links, 433 of
 * them belong to the 30-card HERB_EYESON_01 sample:
 *
 *     HB-4   910 links (3 dead_id + 907 no_herb_in_comp; 48 of the 907
 *            would be rescued by a herb_zh fallback — see above)  229 cards
 *     HB-5    19 records
 *     HB-6    11 records
 *     HB-8    48 records (draft 273 / source_checked 37 / allowed — the
 *            other 48: sourced_cloudtcm_record 41, undefined 5,
 *            draft_reviewed 1, reviewed 1)
 *     HB-9     1 record  (炙甘草)
 *     HB-10    7 records (蒼耳子 + 6 more found on re-measurement: 香薷,
 *            羌活, 白芷, 辛夷, 蔥白, 藁本 — the dispatch said "≥1 expected
 *            (蒼耳子)", so the extra 6 are not a disagreement, just what a
 *            full-corpus scan finds beyond the one card the 30-card sample
 *            happened to read)
 *     HB-11  182 records — matches the dispatch's expectation exactly
 *     HB-12    6 records — matches the dispatch's expectation exactly
 *
 * DISAGREEMENTS WITH THE DISPATCH'S STATED EXPECTATIONS, explained:
 *   HB-4  dispatch/decision-queue says "864/1666". This script's literal
 *         spec (herb_id-exact match only, per the mission text) measures
 *         910. Re-running with HERB_EYESON_01's own bidirectional
 *         herb_zh-substring fallback (the method its H-03 actually used)
 *         reproduces 862 links / 225 cards — matching the ledger's 225-card
 *         figure exactly and its 864-link figure within 2. The 3-dead-id
 *         count matches ("另有 3 條指向不存在的 formula id"). Given the
 *         cards figure matches exactly, 862–864 is very likely the same
 *         measurement the ledger made, just with a herb_zh fallback this
 *         script's literal HB-4 spec (herb_id only) does not apply. This
 *         script keeps the literal herb_id-only spec — it is the one named
 *         in the mission text and it is the more conservative failure mode
 *         (a card whose formula link has no id-level match is flagged even
 *         if a name-substring would rescue it) — and reports the
 *         herb_zh-rescue count (48) separately so nobody mistakes "910" for
 *         "910 confirmed content errors" when up to 48 of them are id-
 *         linkage gaps on the formula side, not content mismatches.
 *   HB-8  dispatch says "undefined ×5, draft_reviewed ×1, reviewed ×1" (=7).
 *         Full-corpus measurement against the predicate's own enum is 48;
 *         the missing 41 is `sourced_cloudtcm_record`, which
 *         HERB_EYESON_01.md §3.1's own census already lists in the same
 *         breath ("source_checked 37・sourced_cloudtcm_record 41・reviewed
 *         1・draft_reviewed 1・undefined 5"). The dispatch's "7" reads as
 *         the 30-card SAMPLE's H-14 finding (which is a different, narrower
 *         predicate — "review_status ≠ draft" — not "review_status outside
 *         the 3-value enum"). This script measures the predicate as
 *         literally specified in the mission text against the FULL corpus
 *         and reports 48. Whether `sourced_cloudtcm_record` should be added
 *         to the allowed enum (it names a real, distinct provenance: bulk
 *         CloudTCM import) is not this script's call — flagged for Ting.
 *
 * Not one predicate is at zero, so not one is wired blocking by default.
 * `node scripts/validate-herb-integrity-predicates.js` (no flags) NEVER
 * exits 1 — same idiom as validate-formula-safety-predicates.js and
 * validate-formula-composition-signatures.js, for the same reason stated in
 * both: a gate that breaks the build over a backlog nobody has been asked
 * to fix yet gets switched off within a week.
 *
 * GRADUATION CONDITIONS — per predicate, independently:
 *
 *   HB-4  no_herb_in_comp bucket is BLOCKED ON C6 (docs/TING_DECISION_QUEUE.md)
 *         — cannot graduate before Ting rules on what the field means,
 *         because "0 violations" would otherwise be achievable by either
 *         fixing links (if C6 says "must contain") or doing nothing (if C6
 *         says "may not contain", in which case this predicate should not
 *         exist in its current form and needs to be re-scoped or dropped).
 *         The dead_id bucket has NO such dependency — it graduates when the
 *         3 dangling formula ids are corrected or the links removed, under
 *         either reading of C6.
 *   HB-5  graduates when the 19 listed records each get a non-empty
 *         contraindications_zh AND a non-empty dosage_g.standard_daily_g.
 *         Content work requiring a named source (憲法第四條); this script
 *         only gates, never fills.
 *   HB-6  graduates when the 11 records' properties_taste_temp strings are
 *         deduplicated to one toxicity marker and one temperature register.
 *         Pure cleanup, no new content — but data/herbs/** is not this
 *         script's lane to edit.
 *   HB-8  graduates when every record's review_status is one of the three
 *         allowed values — either by correcting the 6 clear mistakes
 *         (undefined/reviewed/draft_reviewed) or by a ruling on whether
 *         sourced_cloudtcm_record joins the enum (41 records hinge on that
 *         one decision).
 *   HB-9  graduates when 炙甘草 gets field_sources entries commensurate with
 *         a "gold" grade, or the grade is stepped down.
 *   HB-10 graduates when the 7 records' duplicated entries are removed from
 *         one of the two fields (which one is a clinical call — 禁用 vs
 *         慎用 — not this script's to make).
 *   HB-11 graduates when the 182 clinical_use_note fields are rewritten as
 *         genuine identification/differentiation notes. This is a content
 *         programme (模板 §11.5), not a gate fix — 182 is reported as a
 *         worklist, never expected to reach 0 via this script alone.
 *   HB-12 graduates when the 6 records' primary_actions_en fields are
 *         removed (模板 §1 already calls this field deleted; these are
 *         reappearances, likely from a merge or an import that predates the
 *         template's current version).
 *
 * Usage:
 *   node scripts/validate-herb-integrity-predicates.js
 *   node scripts/validate-herb-integrity-predicates.js --worklist
 *   node scripts/validate-herb-integrity-predicates.js --blocking=HB-5,HB-9
 *   node scripts/validate-herb-integrity-predicates.js --blocking       (all eight)
 *   node scripts/validate-herb-integrity-predicates.js --json
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HERBS_FILE = path.join(ROOT, "data/herbs/herb_canon_shortlist.json");
const FORMULAS_FILE = path.join(ROOT, "data/herbs/formulas.json");

const argv = process.argv.slice(2);
const WORKLIST = argv.includes("--worklist");
const JSON_OUT = argv.includes("--json");
const blockingArg = argv.find((a) => a === "--blocking" || a.startsWith("--blocking="));
const ALL_IDS = ["HB-4", "HB-5", "HB-6", "HB-8", "HB-9", "HB-10", "HB-11", "HB-12"];
const BLOCKING_IDS = blockingArg
  ? blockingArg.includes("=")
    ? blockingArg
        .split("=")[1]
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    : ALL_IDS.slice()
  : [];

// ── inputs ────────────────────────────────────────────────────────────────
const herbsRaw = JSON.parse(fs.readFileSync(HERBS_FILE, "utf8"));
const herbs = herbsRaw.records || herbsRaw;
const formulasRaw = JSON.parse(fs.readFileSync(FORMULAS_FILE, "utf8"));
const formulas = formulasRaw.records || formulasRaw;
const formulaById = new Map(formulas.map((f) => [f.id, f]));

// ── shared helpers ────────────────────────────────────────────────────────
const asList = (v) => (Array.isArray(v) ? v : typeof v === "string" && v.trim() !== "" ? [v] : []);
const slugOf = (id) =>
  String(id || "")
    .replace(/^herb\./, "")
    .trim()
    .toLowerCase();
const shortId = (id) => String(id).replace(/^herb\./, "");
const clip = (s, n = 96) => {
  const t = String(s == null ? "" : s).replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
};
const isEmptyField = (v) => {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
};

// ── HB-4 ─────────────────────────────────────────────────────────────────
const hb4 = { dead_id: [], no_herb_in_comp: [] };
let hb4TotalLinks = 0;
let hb4ZhRescueCount = 0;
const hb4CardsDead = new Set();
const hb4CardsMismatch = new Set();

for (const h of herbs) {
  const rf = asList(h.related_formulas);
  const mySlug = slugOf(h.id);
  const myZh = String(h.name_zh || "").trim();
  for (const fid of rf) {
    hb4TotalLinks++;
    const f = formulaById.get(fid);
    if (!f) {
      hb4.dead_id.push({ id: h.id, name_zh: h.name_zh || "", formula_id: fid });
      hb4CardsDead.add(h.id);
      continue;
    }
    const comp = Array.isArray(f.composition) ? f.composition : [];
    const containsById = comp.some((c) => slugOf(c && c.herb_id) === mySlug);
    if (!containsById) {
      const zhRescue =
        myZh &&
        comp.some((c) => {
          const cz = String((c && (c.herb_zh || c.name_zh)) || "");
          return cz && (cz.includes(myZh) || myZh.includes(cz));
        });
      if (zhRescue) hb4ZhRescueCount++;
      hb4.no_herb_in_comp.push({
        id: h.id,
        name_zh: h.name_zh || "",
        formula_id: fid,
        formula_name_zh: f.name_zh || "",
        zh_would_rescue: !!zhRescue,
      });
      hb4CardsMismatch.add(h.id);
    }
  }
}

// ── HB-5 ─────────────────────────────────────────────────────────────────
const HB5_FLAG_RE = /toxic|toxicity_review|heavy_metal_review/i;
const hb5 = [];
for (const h of herbs) {
  const flags = asList(h.safety_flags);
  if (!flags.some((f) => HB5_FLAG_RE.test(String(f)))) continue;
  const contra = asList(h.contraindications_zh);
  const doseStd = h.dosage_g && h.dosage_g.standard_daily_g;
  const contraEmpty = contra.length === 0;
  const doseEmpty = isEmptyField(doseStd);
  if (contraEmpty || doseEmpty) {
    hb5.push({
      id: h.id,
      name_zh: h.name_zh || "",
      safety_flags: flags,
      contraindications_zh_empty: contraEmpty,
      dosage_g_standard_daily_g_empty: doseEmpty,
    });
  }
}

// ── HB-6 ─────────────────────────────────────────────────────────────────
const hb6 = [];
for (const h of herbs) {
  const p = String(h.properties_taste_temp || "");
  if (!p) continue;
  const hasTox = /(有毒|小毒|大毒)/.test(p);
  const hasNoTox = /無毒/.test(p);
  const hasCold = /(寒|涼)/.test(p);
  const hasHot = /(溫|熱)/.test(p);
  const toxConflict = hasTox && hasNoTox;
  const tempConflict = hasCold && hasHot;
  if (toxConflict || tempConflict) {
    hb6.push({ id: h.id, name_zh: h.name_zh || "", properties_taste_temp: p, toxicity_conflict: toxConflict, temperature_conflict: tempConflict });
  }
}

// ── HB-8 ─────────────────────────────────────────────────────────────────
const HB8_ALLOWED = new Set(["draft", "source_checked", "deprecated"]);
const hb8 = [];
const hb8ValueCounts = {};
for (const h of herbs) {
  const rs = h.review_status;
  const key = rs === undefined ? "(undefined)" : String(rs);
  hb8ValueCounts[key] = (hb8ValueCounts[key] || 0) + 1;
  if (!HB8_ALLOWED.has(rs)) {
    hb8.push({ id: h.id, name_zh: h.name_zh || "", review_status: rs === undefined ? "(undefined)" : rs });
  }
}

// ── HB-9 ─────────────────────────────────────────────────────────────────
const hb9 = [];
for (const h of herbs) {
  if (h.card_grade === "gold" && isEmptyField(h.field_sources)) {
    hb9.push({ id: h.id, name_zh: h.name_zh || "", card_grade: h.card_grade, field_sources: h.field_sources });
  }
}

// ── HB-10 ────────────────────────────────────────────────────────────────
const hb10 = [];
for (const h of herbs) {
  const contra = asList(h.contraindications_zh).map((s) => String(s).trim());
  const caut = new Set(asList(h.cautions_zh).map((s) => String(s).trim()));
  const dupes = contra.filter((s) => s !== "" && caut.has(s));
  if (dupes.length) hb10.push({ id: h.id, name_zh: h.name_zh || "", duplicated_entries: dupes });
}

// ── HB-11 ────────────────────────────────────────────────────────────────
const hb11 = [];
for (const h of herbs) {
  const note = h.clinical_use_note;
  const summary = h.chinese_depth_track && h.chinese_depth_track.summary_zh;
  if (typeof note === "string" && note.trim() !== "" && typeof summary === "string" && note === summary) {
    hb11.push({ id: h.id, name_zh: h.name_zh || "", value: note });
  }
}

// ── HB-12 ────────────────────────────────────────────────────────────────
const hb12 = [];
for (const h of herbs) {
  if (!Object.prototype.hasOwnProperty.call(h, "primary_actions_en")) continue;
  if (isEmptyField(h.primary_actions_en)) continue;
  hb12.push({ id: h.id, name_zh: h.name_zh || "", primary_actions_en: h.primary_actions_en });
}

// ── counts ───────────────────────────────────────────────────────────────
const COUNTS = {
  "HB-4": hb4.dead_id.length + hb4.no_herb_in_comp.length,
  "HB-5": hb5.length,
  "HB-6": hb6.length,
  "HB-8": hb8.length,
  "HB-9": hb9.length,
  "HB-10": hb10.length,
  "HB-11": hb11.length,
  "HB-12": hb12.length,
};

// ── output ───────────────────────────────────────────────────────────────
if (JSON_OUT) {
  console.log(
    JSON.stringify(
      {
        records: herbs.length,
        counts: COUNTS,
        "HB-4_detail": {
          total_links: hb4TotalLinks,
          dead_id: hb4.dead_id.length,
          no_herb_in_comp: hb4.no_herb_in_comp.length,
          no_herb_in_comp_zh_would_rescue: hb4ZhRescueCount,
          cards_affected_dead_id: hb4CardsDead.size,
          cards_affected_no_herb_in_comp: hb4CardsMismatch.size,
        },
        "HB-8_value_counts": hb8ValueCounts,
        violations: { hb4, hb5, hb6, hb8, hb9, hb10, hb11, hb12 },
        blocking_requested: BLOCKING_IDS,
      },
      null,
      2
    )
  );
} else {
  console.log(`validate-herb-integrity-predicates: ${herbs.length} 筆中藥（${hb4TotalLinks} 條 related_formulas 連結）\n`);
  console.log(
    `  HB-4  related_formulas 連結不合格               ${COUNTS["HB-4"]}` +
      `  （dead_id ${hb4.dead_id.length} · no_herb_in_comp ${hb4.no_herb_in_comp.length}` +
      `，後者 ${hb4ZhRescueCount} 條可被 herb_zh 子字串救回，見腳本開頭）` +
      `  卡數：dead_id ${hb4CardsDead.size}、no_herb_in_comp ${hb4CardsMismatch.size}`
  );
  console.log(`  HB-5  慎用藥卻缺禁忌欄或缺標準劑量               ${COUNTS["HB-5"]}`);
  console.log(`  HB-6  性味溫度自相矛盾（有毒+無毒 或 寒+溫）      ${COUNTS["HB-6"]}`);
  console.log(`  HB-8  review_status 不在 draft/source_checked/deprecated  ${COUNTS["HB-8"]}` +
    `  （分布：${Object.entries(hb8ValueCounts).map(([k, v]) => `${k}=${v}`).join("、")}）`);
  console.log(`  HB-9  card_grade=gold 卻 field_sources 空             ${COUNTS["HB-9"]}`);
  console.log(`  HB-10 contraindications_zh 與 cautions_zh 逐字重複    ${COUNTS["HB-10"]}`);
  console.log(`  HB-11 clinical_use_note 與 summary_zh 逐字相同（學習筆記未撰寫）  ${COUNTS["HB-11"]}`);
  console.log(`  HB-12 primary_actions_en 復活（模板已刪除此欄）       ${COUNTS["HB-12"]}`);

  const section = (title, rows, render) => {
    if (!rows.length) return;
    console.log(`\n===== ${title} =====`);
    for (const v of rows) console.log(render(v));
  };

  section(`HB-4a dead_id — related_formulas 指向不存在的 formula id（${hb4.dead_id.length}）`, hb4.dead_id, (v) =>
    `  ${shortId(v.id)} (${v.name_zh}) -> ${v.formula_id}（不存在）`
  );

  if (hb4.no_herb_in_comp.length) {
    console.log(`\n===== HB-4b no_herb_in_comp — 形式合法但 composition 不含本味（${hb4.no_herb_in_comp.length}，依賴 C6 裁定）=====`);
    if (WORKLIST) {
      for (const v of hb4.no_herb_in_comp) {
        console.log(`  ${shortId(v.id)} (${v.name_zh}) -> ${shortId(v.formula_id)} (${v.formula_name_zh})` + (v.zh_would_rescue ? "  [herb_zh 可救回]" : ""));
      }
    } else {
      console.log(`  （加 --worklist 可列出全部 ${hb4.no_herb_in_comp.length} 條）`);
    }
  }

  section(`HB-5 慎用藥缺禁忌或缺劑量（${COUNTS["HB-5"]}）`, hb5, (v) =>
    `  ${shortId(v.id)} (${v.name_zh})  safety_flags=[${v.safety_flags.join(",")}]` +
      `  contraindications_zh空=${v.contraindications_zh_empty}  dosage_g.standard_daily_g空=${v.dosage_g_standard_daily_g_empty}`
  );

  section(`HB-6 性味溫度自相矛盾（${COUNTS["HB-6"]}）`, hb6, (v) =>
    `  ${shortId(v.id)} (${v.name_zh})  「${v.properties_taste_temp}」` +
      `  ${v.toxicity_conflict ? "[有毒+無毒]" : ""}${v.temperature_conflict ? "[寒+溫]" : ""}`
  );

  section(`HB-8 review_status 不在允許值域（${COUNTS["HB-8"]}）`, hb8, (v) =>
    `  ${shortId(v.id)} (${v.name_zh})  review_status=${JSON.stringify(v.review_status)}`
  );

  section(`HB-9 gold 卡缺 field_sources（${COUNTS["HB-9"]}）`, hb9, (v) =>
    `  ${shortId(v.id)} (${v.name_zh})  card_grade=${v.card_grade}  field_sources=${JSON.stringify(v.field_sources)}`
  );

  section(`HB-10 禁忌/慎用逐字重複（${COUNTS["HB-10"]}）`, hb10, (v) =>
    `  ${shortId(v.id)} (${v.name_zh})\n` + v.duplicated_entries.map((e) => `      「${clip(e, 120)}」`).join("\n")
  );

  if (hb11.length) {
    console.log(`\n===== HB-11 學習筆記未撰寫（${COUNTS["HB-11"]}）=====`);
    if (WORKLIST) {
      for (const v of hb11) console.log(`  ${shortId(v.id)} (${v.name_zh})`);
    } else {
      console.log(`  （加 --worklist 可列出全部 ${hb11.length} 筆 id；完整內容見 docs/research_packs/HERB_INTEGRITY_BASELINE.md）`);
    }
  }

  section(`HB-12 primary_actions_en 復活（${COUNTS["HB-12"]}）`, hb12, (v) =>
    `  ${shortId(v.id)} (${v.name_zh})  ${JSON.stringify(v.primary_actions_en).slice(0, 160)}`
  );

  console.log(
    `\n提示：本檢查目前八條 predicate 全是 NOTE 級，不會讓 CI 失敗（見腳本開頭「CI tier」與逐條畢業條件）。` +
      `\n     這八條只檢查結構與內部一致性，保證不了臨床正確性 —— 一張卡可以八條全過，劑量或安全警語仍可能是錯的或缺的。` +
      `\n     加 --blocking=HB-9 之類可預覽單條畢業後的行為；HB-4 的 no_herb_in_comp 半支持續依賴 docs/TING_DECISION_QUEUE.md C6。`
  );
}

// ── blocking preview / graduated gate ────────────────────────────────────
if (BLOCKING_IDS.length) {
  const failed = BLOCKING_IDS.filter((p) => (COUNTS[p] || 0) > 0);
  if (failed.length) {
    console.error(`\n❌ --blocking: ${failed.map((p) => `${p}=${COUNTS[p]}`).join(", ")}（見上方清單）。`);
    process.exit(1);
  }
  console.log(`\nPASS（--blocking=${BLOCKING_IDS.join(",")}，目前 0 違反）。`);
} else if (!JSON_OUT) {
  console.log("\n完成（NOTE 級，不影響 exit code）。");
}
