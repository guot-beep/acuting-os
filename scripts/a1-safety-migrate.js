#!/usr/bin/env node
/**
 * a1-safety-migrate.js — A1(a) 163-card duplicated safety-field remigration.
 *
 * Scope (defect population, reproducible):
 *   a formula record is IN SCOPE for a given language (en/zh) iff at least
 *   one normalized array item appears in BOTH contraindications_<lang> and
 *   cautions_<lang> (A1-M01: "same normalized segment appears in both legacy
 *   contraindications and cautions"). Cards with no such overlap are left
 *   completely untouched — this script never rewrites a pair that was never
 *   duplicated.
 *
 * Per pipeline (MIGRATION_RULES §2):
 *   1. pool every item from contraindications_<lang> + cautions_<lang>
 *      (original field position is NOT evidence of direction — A1-M01/§8)
 *   2. dedupe by normalized text
 *   3. classify each unique item (scripts/a1-safety-lexicon-lib.js), which
 *      may split one item into >1 sub-segment at a strong boundary
 *   4. provenance gate: canonical write requires an existing field_sources
 *      entry for one of the safety fields, OR a non-empty source_urls array
 *      (documented policy — see A1(a) report; this is a MIGRATION of already
 *      -cited legacy text, not new authorship, so the existing card-level
 *      citation is the source_ref/source_locator)
 *   5. rebuild contraindications_<lang> / cautions_<lang> from ONLY the
 *      canonical-eligible, cleanly classified sub-segments; everything else
 *      (needs_review, missing_provenance) is removed from canonical and
 *      preserved verbatim in import_artifacts + the review queue report —
 *      never silently dropped (§0 "只加深不刪除").
 *
 * Modes:
 *   --scope              print the reproducible in-scope card count and exit
 *   --plan               dry run: write a full per-card plan + summary to
 *                         the path given by --out (scratchpad), touch nothing
 *   --apply --ids a,b,c  apply the plan for exactly these card ids to
 *                         data/herbs/formulas.json (batching control)
 *   --apply --all        apply to every in-scope card in one run
 */
const fs = require("fs");
const path = require("path");
const { classifyLegacyItem } = require("./a1-safety-lexicon-lib");

const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const argVal = (f) => { const i = argv.indexOf(f); return i > -1 ? argv[i + 1] : null; };

const MODE_SCOPE = has("--scope");
const MODE_APPLY = has("--apply");
const OUT = argVal("--out");
const IDS = argVal("--ids") ? new Set(argVal("--ids").split(",").map((s) => s.trim())) : null;
const ALL = has("--all");

function normKey(s, lang) {
  const t = String(s).trim().replace(/\s+/g, " ");
  return lang === "en" ? t.toLowerCase() : t;
}

// Pool contraindications_<lang> + cautions_<lang>, dedupe by normalized text,
// remember which legacy field(s) each unique item came from.
function poolAndDedupe(record, lang) {
  const cField = `contraindications_${lang}`;
  const kField = `cautions_${lang}`;
  const cArr = Array.isArray(record[cField]) ? record[cField] : [];
  const kArr = Array.isArray(record[kField]) ? record[kField] : [];
  const byKey = new Map();
  for (const [arr, fieldName] of [[cArr, cField], [kArr, kField]]) {
    for (const item of arr) {
      const key = normKey(item, lang);
      if (!key) continue;
      if (!byKey.has(key)) byKey.set(key, { text: String(item).trim(), fields: new Set([fieldName]) });
      else byKey.get(key).fields.add(fieldName);
    }
  }
  return { cField, kField, cArr, kArr, unique: [...byKey.values()] };
}

function hasOverlap(record, lang) {
  const { unique } = poolAndDedupe(record, lang);
  return unique.some((u) => u.fields.size > 1);
}

// Provenance policy (documented in A1(a) report): a migration of ALREADY
// -cited legacy text inherits the card's existing citation. "No provenance"
// means the card has neither a source_urls entry nor any field_sources entry
// naming one of the four legacy safety fields.
function cardProvenance(record) {
  const fs_ = record.field_sources || {};
  const keys = ["contraindications_en", "contraindications_zh", "cautions_zh", "cautions_en", "contraindications", "cautions"];
  const fsHit = keys.find((k) => fs_[k] && (Array.isArray(fs_[k]) ? fs_[k].length : String(fs_[k]).trim()));
  const urls = Array.isArray(record.source_urls) ? record.source_urls.filter(Boolean) : [];
  if (fsHit) return { ok: true, source_ref: fs_[fsHit], source_locator: `field_sources.${fsHit}` };
  if (urls.length) return { ok: true, source_ref: urls, source_locator: "source_urls" };
  return { ok: false };
}

function planForRecord(record) {
  const langs = ["en", "zh"];
  const perLang = {};
  let touched = false;
  for (const lang of langs) {
    if (!hasOverlap(record, lang)) continue;
    touched = true;
    const { cField, kField, cArr, kArr, unique } = poolAndDedupe(record, lang);
    const prov = cardProvenance(record);

    const newContra = [];
    const newCaution = [];
    const reviewQueue = [];
    const allSubsegments = [];

    for (const u of unique) {
      const subs = classifyLegacyItem(u.text, lang);
      for (const sub of subs) {
        allSubsegments.push({ ...sub, from_fields: [...u.fields] });
        if (sub.classification === "needs_review") {
          reviewQueue.push({ text: sub.text, review_reason: sub.review_reason, from_fields: [...u.fields] });
          continue;
        }
        if (!prov.ok) {
          reviewQueue.push({ text: sub.text, review_reason: "missing_provenance", from_fields: [...u.fields] });
          continue;
        }
        if (sub.classification === "contraindications") newContra.push(sub.text);
        else if (sub.classification === "cautions") newCaution.push(sub.text);
      }
    }

    // Red-line guard (AI_CONSTITUTION §二.3 "不清空有內容的欄位"): if every
    // segment in this language landed in needs_review/missing_provenance,
    // the naive result is BOTH contraindications_<lang> and cautions_<lang>
    // going empty at once — the card would render NO safety text at all in
    // this language where it rendered something (duplicated, but visible)
    // before. That is a real content loss, not a quarantine. Hold the whole
    // language back untouched instead: leave both fields exactly as they
    // were, and surface it as its own worklist item rather than silently
    // wiping the card.
    const hadContent = cArr.length > 0 || kArr.length > 0;
    const wouldEmptyBoth = newContra.length === 0 && newCaution.length === 0;
    const heldBack = hadContent && wouldEmptyBoth;

    perLang[lang] = {
      cField, kField,
      before: { [cField]: cArr, [kField]: kArr },
      after: heldBack ? { [cField]: cArr, [kField]: kArr } : { [cField]: newContra, [kField]: newCaution },
      review_queue: reviewQueue,
      provenance: prov,
      unique_segment_count: unique.length,
      overlap_count: unique.filter((u) => u.fields.size > 1).length,
      held_back: heldBack,
    };
  }
  return touched ? { id: record.id, name_zh: record.name_zh, perLang } : null;
}

function loadFormulas() {
  const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
  return data;
}

function main() {
  const data = loadFormulas();
  const records = data.records;
  const plans = [];
  for (const r of records) {
    const p = planForRecord(r);
    if (p) plans.push(p);
  }

  if (MODE_SCOPE) {
    console.log(`in-scope cards: ${plans.length} / ${records.length}`);
    const enCount = plans.filter((p) => p.perLang.en).length;
    const zhCount = plans.filter((p) => p.perLang.zh).length;
    console.log(`  en overlap: ${enCount}`);
    console.log(`  zh overlap: ${zhCount}`);
    console.log(plans.map((p) => p.id).join("\n"));
    return;
  }

  if (has("--plan")) {
    const summary = {
      total_records: records.length,
      in_scope: plans.length,
      en_overlap: plans.filter((p) => p.perLang.en).length,
      zh_overlap: plans.filter((p) => p.perLang.zh).length,
    };
    let totalContraBefore = 0, totalCautionBefore = 0, totalContraAfter = 0, totalCautionAfter = 0, totalReview = 0, heldBackCount = 0;
    const heldBackIds = [];
    for (const p of plans) {
      for (const lang of ["en", "zh"]) {
        const l = p.perLang[lang];
        if (!l) continue;
        totalContraBefore += l.before[l.cField].length;
        totalCautionBefore += l.before[l.kField].length;
        if (l.held_back) {
          heldBackCount++;
          heldBackIds.push(`${p.id}[${lang}]`);
          // held-back language is untouched, so its before-counts still
          // count as "after" for the corpus-wide total (nothing changed).
          totalContraAfter += l.before[l.cField].length;
          totalCautionAfter += l.before[l.kField].length;
          continue;
        }
        totalContraAfter += l.after[l.cField].length;
        totalCautionAfter += l.after[l.kField].length;
        totalReview += l.review_queue.length;
      }
    }
    summary.held_back_lang_count = heldBackCount;
    summary.held_back_ids = heldBackIds;
    summary.totalContraBefore = totalContraBefore;
    summary.totalCautionBefore = totalCautionBefore;
    summary.totalContraAfter = totalContraAfter;
    summary.totalCautionAfter = totalCautionAfter;
    summary.totalReview = totalReview;
    const outPath = OUT || path.join(ROOT, "a1-safety-plan.json");
    fs.writeFileSync(outPath, JSON.stringify({ summary, plans }, null, 2), "utf8");
    console.log(JSON.stringify(summary, null, 2));
    console.log(`plan written to ${outPath}`);
    return;
  }

  if (MODE_APPLY) {
    const targets = ALL ? plans : plans.filter((p) => IDS && IDS.has(p.id));
    if (!ALL && !IDS) { console.error("--apply requires --ids a,b,c or --all"); process.exit(1); }
    const byId = new Map(records.map((r) => [r.id, r]));
    const now = new Date().toISOString();
    let appliedCards = 0;
    const applyLog = [];
    for (const p of targets) {
      const rec = byId.get(p.id);
      if (!rec) continue;
      appliedCards++;
      const cardLog = { id: p.id, name_zh: p.name_zh, changes: [], held_back: [] };
      for (const lang of ["en", "zh"]) {
        const l = p.perLang[lang];
        if (!l) continue;
        if (l.held_back) {
          // Every segment in this language was unclassifiable and applying
          // would empty both fields at once — leave untouched (see
          // planForRecord's heldBack guard) and just log it.
          cardLog.held_back.push({ lang, cField: l.cField, kField: l.kField, review_queue: l.review_queue });
          continue;
        }
        for (const fieldName of [l.cField, l.kField]) {
          const before = l.before[fieldName];
          const after = l.after[fieldName];
          if (before.length) {
            if (!rec.import_artifacts) rec.import_artifacts = [];
            rec.import_artifacts.push({
              original_field: fieldName,
              text: before.join(" | "),
              reason: "A1(a) legacy duplicate-pair remigration: contraindications_* and cautions_* pooled the same legacy text with no direction distinction; re-split by source-supported direction per docs/research_packs/A1_FORMULA_SAFETY_MIGRATION_RULES_2026-08-27.md — original array preserved verbatim here before rewrite.",
              moved_at: now,
              ruling: `D28/A1(a). after=[${after.join(" | ")}]; needs_review(${l.review_queue.length})=[${l.review_queue.map((q) => `${q.text} <${q.review_reason}>`).join(" | ")}]`,
            });
          }
          rec[fieldName] = after;
          cardLog.changes.push({ field: fieldName, before_len: before.length, after_len: after.length });
        }
      }
      applyLog.push(cardLog);
    }
    // formulas.json is committed with 1-space indent (verified byte-for-byte
    // round trip against the pre-edit file) — using 2-space here would rewrite
    // every line in the file and make the diff unreviewable/unmergeable.
    fs.writeFileSync(FILE, JSON.stringify(data, null, 1) + "\n", "utf8");
    console.log(`applied to ${appliedCards} cards`);
    console.log(JSON.stringify(applyLog, null, 2));
    return;
  }

  console.log("no mode given: use --scope, --plan, or --apply (--ids a,b,c | --all)");
}

main();
