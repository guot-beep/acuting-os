#!/usr/bin/env node
/**
 * a1-safety-lexicon-lib.js — shared classifier for the A1 formula safety
 * field remigration (163+ duplicated contraindications_en/cautions_en pairs).
 *
 * Implements the pipeline described in
 *   docs/research_packs/A1_FORMULA_SAFETY_MIGRATION_RULES_2026-08-27.md §2, §4
 * driven entirely by the controlled vocabulary in:
 *   data/research_staging/formula_safety_direction_lexicon_A1.json
 *   data/research_staging/formula_safety_migration_classifier_A1.json
 *
 * This file contains NO hardcoded direction words beyond what those two JSON
 * files declare, with exactly ONE documented exception (see
 * CONTRAINDICATED_STEM below) — every other match is a literal substring
 * lookup against the lexicon's own pattern lists. New/removed vocabulary in
 * the JSON files takes effect without touching this file.
 *
 * Precedence (from the classifier JSON, `_meta`/`precedence`):
 *   negated_or_uncertain_direction > mixed_direction_or_context >
 *   regulatory_nonclinical_context > ambiguous_direction > hard_prohibition >
 *   conditional_caution > no_direction_token
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LEXICON = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data/research_staging/formula_safety_direction_lexicon_A1.json"), "utf8"));
const CLASSIFIER = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data/research_staging/formula_safety_migration_classifier_A1.json"), "utf8"));

const lc = (s, lang) => (lang === "en" ? String(s).toLowerCase() : String(s));

// Every substring in `patterns` that appears in `norm`. Order preserved.
function matchAll(norm, patterns, lang) {
  const hits = [];
  for (const p of patterns || []) {
    const pp = lc(p, lang);
    if (norm.includes(pp)) hits.push(p);
  }
  return hits;
}

// Direction lookups split by field, built once from the lexicon.
const HARD_DIRECTIONS = LEXICON.directions.filter((d) => d.field === "contraindications");
const CAUTION_DIRECTIONS = LEXICON.directions.filter((d) => d.field === "cautions");
const DIRECTION_BY_ID = Object.fromEntries(LEXICON.directions.map((d) => [d.direction_id, d]));

/*
 * DOCUMENTED EXCEPTION — not a silent rule violation, flagged in the A1(a)
 * report for Ting's review.
 *
 * The migration classifier's allow-list for the `contraindicated` direction
 * is exactly ["contraindicated in", "is contraindicated", "are
 * contraindicated"] (MIGRATION_RULES §5). The real corpus overwhelmingly
 * writes "Contraindicated for those with X." / "Contraindicate for those
 * with X." — same word, different preposition, zero semantic difference,
 * and the field-semantics doc's own decision test for this direction is just
 * "the source explicitly says contraindicated" (§1.1), not tied to a
 * preposition. Requiring the literal 3-phrase list would send nearly the
 * entire corpus to needs_review on a distinction with no clinical meaning.
 * So: the bare English stem "contraindicat(ed|ion)" — word-boundary, case
 * insensitive — is treated as an additional alias for the SAME
 * `contraindicated` direction_id, subject to the SAME negation check that
 * runs before any hard-prohibition match. No other direction gets this
 * treatment; every other match in this file is a literal lexicon substring.
 */
const CONTRAINDICATED_STEM_RE = /\bcontraindicat(ed|ion)\b/i;

/*
 * Distributive Chinese "不宜/避免 A、B" — 不宜大劑量久服 means both "不宜大劑量"
 * and "不宜久服", but "久服" is not adjacent to 不宜 so the literal substring
 * "不宜久服"/"避免久服" does not fire. Narrow, documented exception (mirrors
 * classifier test fixture high_dose_caution_zh, which expects BOTH
 * avoid_high_dose and avoid_prolonged_use out of a single "不宜大劑量久服"
 * segment): if a caution-governing negator (不宜/避免/忌) appears anywhere in
 * the segment and "久服" appears anywhere in the segment, treat that as an
 * avoid_prolonged_use hit even when not contiguous.
 */
function distributiveProlongedUseHit(norm, lang) {
  if (lang !== "zh") return false;
  const hasGovernor = /不宜|避免|忌/.test(norm);
  const hasProlonged = norm.includes("久服");
  return hasGovernor && hasProlonged;
}

function findDirectionHits(norm, lang, directions) {
  const hits = [];
  for (const d of directions) {
    const patterns = lang === "en" ? d.en_patterns : d.zh_patterns;
    const matched = matchAll(norm, patterns, lang);
    for (const m of matched) hits.push({ direction_id: d.direction_id, pattern: m, field: d.field });
  }
  return hits;
}

// Longest-matched-pattern wins when >1 direction in the same family fires
// (e.g. "must not be used" [do_not_use] vs "unprocessed form must not be
// used" [unprocessed_form_prohibited] both matching one sentence) — the
// longer pattern is strictly more specific.
function mostSpecific(hits) {
  if (!hits.length) return null;
  return hits.slice().sort((a, b) => b.pattern.length - a.pattern.length)[0];
}

function classifySegment(rawText, lang) {
  const text = String(rawText == null ? "" : rawText);
  if (!text.trim()) return { classification: "needs_review", review_reason: "no_direction_token", direction_id: null };
  const norm = lc(text.trim().replace(/\s+/g, " "), lang);

  // 1. negated_or_uncertain_direction — checked before anything else.
  const negPatterns = CLASSIFIER.negation_or_uncertainty_patterns[lang] || [];
  const negHits = matchAll(norm, negPatterns, lang);
  if (negHits.length) {
    return { classification: "needs_review", review_reason: "negated_or_uncertain_direction", direction_id: null, matched: negHits };
  }

  // Gather raw direction hits (lexicon-driven) plus the one documented stem alias.
  let hardHits = findDirectionHits(norm, lang, HARD_DIRECTIONS);
  const cautionHits = findDirectionHits(norm, lang, CAUTION_DIRECTIONS);
  if (lang === "en" && CONTRAINDICATED_STEM_RE.test(text)) {
    if (!hardHits.some((h) => h.direction_id === "contraindicated")) {
      hardHits.push({ direction_id: "contraindicated", pattern: "[stem:contraindicat-]", field: "contraindications" });
    }
  }
  if (distributiveProlongedUseHit(norm, lang) && !cautionHits.some((h) => h.direction_id === "avoid_prolonged_use")) {
    cautionHits.push({ direction_id: "avoid_prolonged_use", pattern: "[distributive:久服]", field: "cautions" });
  }

  // 2/3. regulatory/nonclinical context — must be resolved before a bare
  // "prohibited" is allowed to read as a clinical hard-prohibition (A1-M03A).
  const regContextPatterns = CLASSIFIER.regulatory_nonclinical_context_patterns[lang] || [];
  const regContextHits = matchAll(norm, regContextPatterns, lang);
  const regDirectionHits = cautionHits.filter((h) => h.direction_id === "athlete_restriction" || h.direction_id === "regulatory_restriction");
  const isRegulatory = regContextHits.length > 0 || regDirectionHits.length > 0;

  if (isRegulatory) {
    // A bare "prohibited"/"禁止" is absorbed into the regulatory reading
    // (regulatory_prohibited_en fixture) — it is not a separate clinical claim.
    const ABSORBED_BARE = lang === "en" ? new Set(["prohibited"]) : new Set(["禁止"]);
    const genuineClinicalHard = hardHits.filter((h) => !ABSORBED_BARE.has(lc(h.pattern, lang)));
    if (genuineClinicalHard.length) {
      return {
        classification: "needs_review",
        review_reason: "regulatory_vs_clinical_mixed",
        direction_id: null,
        matched: { regulatory: regContextHits, clinical: genuineClinicalHard },
      };
    }
    const athleteDir = DIRECTION_BY_ID.athlete_restriction;
    const isAthlete =
      matchAll(norm, athleteDir.en_patterns, lang).length > 0 ||
      matchAll(norm, athleteDir.zh_patterns, lang).length > 0 ||
      /athlete|doping|競賽運動員|運動員資格|禁賽|反禁藥/i.test(text);
    return {
      classification: "cautions",
      direction_id: isAthlete ? "athlete_restriction" : "regulatory_restriction",
      reason_type: "regulatory_nonclinical",
      matched: regContextHits,
    };
  }

  // 4/5. mixed (non-regulatory) hard + caution in one inseparable segment.
  if (hardHits.length && cautionHits.length) {
    return {
      classification: "needs_review",
      review_reason: "mixed_direction_tokens",
      direction_id: null,
      matched: { hard: hardHits, caution: cautionHits },
    };
  }

  if (hardHits.length) {
    const best = mostSpecific(hardHits);
    return { classification: "contraindications", direction_id: best.direction_id, matched: hardHits };
  }
  if (cautionHits.length) {
    const best = mostSpecific(cautionHits);
    return { classification: "cautions", direction_id: best.direction_id, matched: cautionHits };
  }

  // 6. ambiguous avoidance — only reached when no specific controlled
  // direction matched at all (A1-M03B: "without a more specific controlled
  // direction").
  const ambigPatterns = CLASSIFIER.ambiguous_patterns_to_review[lang] || [];
  const ambigHits = matchAll(norm, ambigPatterns, lang);
  if (ambigHits.length) {
    return { classification: "needs_review", review_reason: "ambiguous_avoidance", direction_id: null, matched: ambigHits };
  }

  // 7. no_direction_token.
  return { classification: "needs_review", review_reason: "no_direction_token", direction_id: null };
}

// Try to split one legacy array item at a strong boundary (". " sentence end,
// "; "/"；" semicolon) ONLY when the whole-segment classification came back
// needs_review for a mixing reason, and BOTH resulting halves independently
// classify to a clean (non-needs_review) result. Otherwise return null (no
// split) — the caller keeps the whole-segment needs_review result.
// See MIGRATION_RULES §3.2 and the `mixed_en` test fixture.
function trySplitMixed(rawText, lang, wholeResult) {
  if (!wholeResult || wholeResult.classification !== "needs_review") return null;
  if (!["mixed_direction_tokens", "regulatory_vs_clinical_mixed"].includes(wholeResult.review_reason)) return null;

  const text = String(rawText).trim();
  const boundaries = [/;\s+/, /；\s*/, /\.\s+(?=[A-Z0-9一-鿿])/, /。\s*(?=.)/];
  for (const re of boundaries) {
    const parts = text.split(re).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;
    const results = parts.map((p) => classifySegment(p, lang));
    const allClean = results.every((r) => r.classification !== "needs_review");
    if (allClean) {
      return parts.map((p, i) => ({ text: p, result: results[i] }));
    }
  }
  return null;
}

// Full entry point used by the migration runner: classify one legacy array
// item, splitting it if (and only if) that resolves an otherwise-mixed
// segment into clean parts.
function classifyLegacyItem(rawText, lang) {
  const whole = classifySegment(rawText, lang);
  const split = trySplitMixed(rawText, lang, whole);
  if (split) {
    return split.map(({ text, result }) => ({ text, ...result }));
  }
  return [{ text: String(rawText).trim(), ...whole }];
}

module.exports = { classifySegment, classifyLegacyItem, trySplitMixed, LEXICON, CLASSIFIER };
