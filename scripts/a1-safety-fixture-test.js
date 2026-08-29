#!/usr/bin/env node
/**
 * a1-safety-fixture-test.js — must pass 17/17 before a1-safety-migrate.js is
 * allowed to touch data/herbs/formulas.json (dispatch red line: "先過
 * test_fixtures 再跑真資料"). Fixtures come straight from
 * data/research_staging/formula_safety_migration_classifier_A1.json —
 * nothing here is invented.
 */
const { classifySegment, classifyLegacyItem, CLASSIFIER } = require("./a1-safety-lexicon-lib");

const fixtures = CLASSIFIER.test_fixtures;
let pass = 0, fail = 0;
const failures = [];

for (const fx of fixtures) {
  if (fx.expected === "segment_if_strong_boundary_else_needs_review") {
    const segs = classifyLegacyItem(fx.text, fx.language);
    const outs = segs.map((s) => s.classification);
    const ok = JSON.stringify(outs) === JSON.stringify(fx.expected_outputs_if_segmented);
    if (ok) { pass++; } else {
      fail++;
      failures.push(`${fx.id}: expected segmented outputs ${JSON.stringify(fx.expected_outputs_if_segmented)}, got ${JSON.stringify(outs)} (segments: ${JSON.stringify(segs.map(s=>s.text))})`);
    }
    continue;
  }

  const r = classifySegment(fx.text, fx.language);
  let ok = r.classification === fx.expected;
  if (ok && fx.expected_direction_id) ok = r.direction_id === fx.expected_direction_id;
  if (ok && fx.expected_direction_ids) {
    // some fixtures (high_dose_caution_zh) want a segment to carry >1 signal;
    // our single-result classifySegment only returns one direction_id, so
    // check via the underlying hit list if present.
    const hitIds = (r.matched && (r.matched.caution || r.matched.hard || r.matched)) || [];
    const ids = new Set([r.direction_id, ...(Array.isArray(hitIds) ? hitIds.map((h) => h.direction_id).filter(Boolean) : [])]);
    ok = fx.expected_direction_ids.every((d) => ids.has(d));
  }
  if (ok && fx.expected_review_reason) ok = r.review_reason === fx.expected_review_reason;
  if (ok && fx.expected_reason_type) ok = r.reason_type === fx.expected_reason_type;

  if (ok) pass++;
  else {
    fail++;
    failures.push(`${fx.id}: expected ${JSON.stringify({classification: fx.expected, direction_id: fx.expected_direction_id, review_reason: fx.expected_review_reason, reason_type: fx.expected_reason_type})}, got ${JSON.stringify({classification: r.classification, direction_id: r.direction_id, review_reason: r.review_reason, reason_type: r.reason_type})}`);
  }
}

console.log(`A1 classifier fixtures: ${pass}/${fixtures.length} pass`);
if (failures.length) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
process.exit(0);
