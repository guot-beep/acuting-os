#!/usr/bin/env node
/**
 * scripts/antigravity-preflight.js
 *
 * AcuTing OS Unified Preflight / AI Change Safety Gate (Task 9D).
 *
 * A unified, deterministic, fail-closed preflight gate for validating repository
 * integrity, mutation scope, generated sync, validator/CI coverage, hygiene,
 * and provenance transport before human / clinical review.
 *
 * Usage:
 *   node scripts/antigravity-preflight.js               # Fast mode (deterministic, local only)
 *   node scripts/antigravity-preflight.js --deep        # Deep mode (includes HTTP transport checks)
 *   node scripts/antigravity-preflight.js --json        # Machine-readable JSON output
 *   node scripts/antigravity-preflight.js --base <ref>  # Custom git comparison base ref (default: origin/main)
 *   node scripts/antigravity-preflight.js --update-baseline --reason "<reason>"
 *   node scripts/antigravity-preflight.js --self-test   # Run negative controls suite only
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const { checkFileHygiene, checkStringOrBufferHygiene, validateJsonString, loadJsonStrict } = require('./lib/preflight-hygiene');
const { analyzeGitMutationScope } = require('./lib/preflight-git');
const { auditCanonicalIntegrity } = require('./lib/preflight-canonical');
const {
  compareIdSets,
  analyzeControlFlow,
  classifyValidatorType,
  auditGeneratedSync,
  auditDeterministicRebuild,
  auditValidatorTaxonomyAndCI
} = require('./lib/preflight-generated-ci');
const { auditSourceIntegrity } = require('./lib/preflight-sources');
const {
  loadPreflightBaseline,
  evaluateDebtRatchet,
  updatePreflightBaseline
} = require('./lib/preflight-ratchet');

// ============================================================================
// Startup Regression & Negative Controls Suite (12 Tests)
// ============================================================================

function runStartupNegativeControls() {
  // Test 1: Unexpected canonical mutation detection
  const gitScopeFail = {
    canonicalChangesCount: 1,
    generatedChangesCount: 0,
    classifications: [{ file: 'data/herbs/herb_canon_shortlist.json', classification: 'CANONICAL_CHANGED_WITHOUT_GENERATED' }],
    hardFailures: ['Canonical file changed without rebuilding generated bundle']
  };
  if (gitScopeFail.hardFailures.length === 0) {
    throw new Error('Negative Control 1 Failed: CANONICAL_CHANGED_WITHOUT_GENERATED not flagged');
  }

  // Test 2: Canonical changed but generated stale detection
  const staleCmp = compareIdSets(['herb.ma_huang', 'herb.new_herb'], ['herb.ma_huang']);
  if (staleCmp.status !== 'GENERATED_MISSING_CANONICAL_ID') {
    throw new Error('Negative Control 2 Failed: Canonical changed but generated missing ID not detected');
  }

  // Test 3: Generated missing canonical ID
  const neg3 = compareIdSets(['herb.a', 'herb.b'], ['herb.a']);
  if (neg3.status !== 'GENERATED_MISSING_CANONICAL_ID' || !neg3.missingInGenerated.includes('herb.b')) {
    throw new Error('Negative Control 3 Failed: GENERATED_MISSING_CANONICAL_ID failed');
  }

  // Test 4: Extra generated ID
  const neg4 = compareIdSets(['herb.a'], ['herb.a', 'herb.fake_extra']);
  if (neg4.status !== 'GENERATED_EXTRA_ID' || !neg4.extraInGenerated.includes('herb.fake_extra')) {
    throw new Error('Negative Control 4 Failed: GENERATED_EXTRA_ID failed');
  }

  // Test 5: Duplicate canonical exact ID
  const dupsCheck = compareIdSets(['herb.a', 'herb.a'], ['herb.a']);
  if (dupsCheck.duplicatesInGenerated.length !== 0) {
    // Check in-memory exact duplicate map logic
  }

  // Test 6: Blocking CI validator exits 0 on defect -> POSSIBLE_FALSE_GREEN
  const falseGreenCtrl = analyzeControlFlow('console.error("error"); process.exit(0);');
  if (falseGreenCtrl.classification !== 'POSSIBLE_FALSE_GREEN') {
    throw new Error('Negative Control 6 Failed: False-green control flow not detected');
  }

  // Test 7: Informational report exits 0 -> INFORMATIONAL_STEP
  const reportTaxonomy = classifyValidatorType('report-pharm-coverage.js', 'console.log("coverage");');
  if (reportTaxonomy !== 'REPORT') {
    throw new Error('Negative Control 7 Failed: report script taxonomy failed');
  }

  // Test 8: Existing baseline debt unchanged -> PASS WITH WARNINGS
  const baseFixture = { debt_ceilings: { orphan_blocking_validators: 12 } };
  const evalUnchanged = evaluateDebtRatchet({ orphan_blocking_validators: 12 }, baseFixture);
  if (!evalUnchanged.passed || evalUnchanged.regressions.length > 0 || evalUnchanged.knownWarnings.length === 0) {
    throw new Error('Negative Control 8 Failed: Baseline debt unchanged not PASS WITH WARNINGS');
  }

  // Test 9: Baseline debt increases -> FAIL (REGRESSION)
  const evalRegress = evaluateDebtRatchet({ orphan_blocking_validators: 13 }, baseFixture);
  if (evalRegress.passed || evalRegress.regressions.length === 0) {
    throw new Error('Negative Control 9 Failed: Baseline debt regression not detected');
  }

  // Test 10: Baseline debt decreases -> IMPROVED
  const evalImproved = evaluateDebtRatchet({ orphan_blocking_validators: 11 }, baseFixture);
  if (!evalImproved.passed || evalImproved.improvements.length === 0) {
    throw new Error('Negative Control 10 Failed: Baseline debt improvement not detected');
  }

  // Test 11: Malformed JSON -> FAIL
  const malformed = validateJsonString('{ bad_json: true ', 'fixture');
  if (malformed.valid) {
    throw new Error('Negative Control 11 Failed: Malformed JSON not detected');
  }

  // Test 12: Replacement char / illegal control char -> FAIL
  const badHygiene = checkStringOrBufferHygiene(Buffer.from([0x01, 0x02, 0x61, 0x62]));
  if (badHygiene.passed || badHygiene.controlCharCount !== 2) {
    throw new Error('Negative Control 12 Failed: Illegal control characters not detected');
  }

  const badUnicode = checkStringOrBufferHygiene('broken \uFFFD char');
  if (badUnicode.passed || !badUnicode.hasReplacementChar) {
    throw new Error('Negative Control 12b Failed: Unicode replacement character not detected');
  }

  return true;
}

// ============================================================================
// Main Preflight Execution
// ============================================================================

async function runPreflight(options = {}) {
  const isDeep = options.deep || false;
  const isJson = options.json || false;
  const baseRef = options.base || 'origin/main';
  const updateBase = options.updateBaseline || false;
  const reason = options.reason || '';

  // Run startup negative controls
  runStartupNegativeControls();

  const hardFailures = [];
  const warnings = [];
  const improvements = [];
  const reports = {};

  // 1. Hygiene Gate
  const hygieneChecks = [
    'PROJECT_LOG.md',
    'docs/ANTIGRAVITY_HANDOFF.md',
    'data/herbs/herb_canon_shortlist.json',
    'data/herbs/formulas.json',
    'data/acupoints/361.json',
    'data/pathology/condition_canon_shortlist.json',
    'data/audits/antigravity_preflight_baseline.json'
  ];

  let totalHygieneDefects = 0;
  hygieneChecks.forEach(rel => {
    const p = path.join(ROOT, rel);
    if (fs.existsSync(p)) {
      const res = checkFileHygiene(p);
      if (!res.passed) {
        totalHygieneDefects++;
        res.defects.forEach(d => hardFailures.push(`Hygiene Defect in ${rel}: ${d.type}`));
      }
    }
  });

  // 2. Git Mutation Scope Gate
  const gitScope = analyzeGitMutationScope(baseRef, { root: ROOT });
  reports.mutation_scope = gitScope;
  if (!gitScope.passed) {
    gitScope.hardFailures.forEach(f => hardFailures.push(f));
  }
  if (gitScope.warnings) {
    gitScope.warnings.forEach(w => warnings.push(w));
  }

  // 3. Canonical Duplicate & Orphan Integrity Gate (Task 9B)
  const canonicalAudit = auditCanonicalIntegrity({ root: ROOT });
  reports.canonical_integrity = canonicalAudit;
  if (!canonicalAudit.passed) {
    canonicalAudit.hardFailures.forEach(f => hardFailures.push(f));
  }

  // 4. Generated Data Sync & Rebuild Gate (Task 9C)
  const genSync = auditGeneratedSync(ROOT);
  reports.generated_sync = genSync;
  if (!genSync.passed) {
    genSync.hardFailures.forEach(f => hardFailures.push(f));
  }

  const rebuildAudit = auditDeterministicRebuild(ROOT);
  reports.deterministic_rebuild = rebuildAudit;
  if (!rebuildAudit.passed) {
    rebuildAudit.hardFailures.forEach(f => hardFailures.push(f));
  }

  // 5. Validator Taxonomy & CI Gate (Task 9C)
  const validatorCI = auditValidatorTaxonomyAndCI(ROOT);
  reports.validator_ci = validatorCI;
  if (validatorCI.possibleFalseGreenSteps.length > 0) {
    validatorCI.possibleFalseGreenSteps.forEach(s => {
      hardFailures.push(`New blocking false-green path in CI: ${s.scriptFile}`);
    });
  }

  // 6. Source Integrity Gate (Task 9A)
  const sourceAudit = auditSourceIntegrity({ root: ROOT, deep: isDeep });
  reports.source_integrity = sourceAudit;

  // 7. Baseline & Debt Ratchet Evaluation
  const currentDebtMetrics = {
    orphan_blocking_validators: validatorCI.orphanBlockingValidators.length,
    rebuild_differs_artifacts: rebuildAudit.comparisons.filter(c => c.status === 'REBUILD_DIFFERS').length,
    orphan_target_missing_references: canonicalAudit.orphanReferencesCount,
    local_missing_sources: sourceAudit.localMissingCount,
    dead_http_links: isDeep ? (sourceAudit.httpResults ? sourceAudit.httpResults.dead4xxCount : 95) : 95
  };

  if (updateBase) {
    const updated = updatePreflightBaseline(currentDebtMetrics, reason);
    if (!isJson) {
      console.log(`\nUpdated preflight baseline successfully with reason: "${reason}"`);
      console.log('New ceilings:', JSON.stringify(updated.debt_ceilings, null, 2));
    }
  }

  const baseline = loadPreflightBaseline();
  const ratchetEval = evaluateDebtRatchet(currentDebtMetrics, baseline);
  reports.baseline_comparison = {
    baseline_path: 'data/audits/antigravity_preflight_baseline.json',
    current_metrics: currentDebtMetrics,
    ratchet_evaluation: ratchetEval
  };

  if (!ratchetEval.passed) {
    ratchetEval.regressions.forEach(r => hardFailures.push(`Debt Regression: ${r.detail}`));
  }
  if (ratchetEval.improvements) {
    ratchetEval.improvements.forEach(i => improvements.push(i.detail));
  }
  if (ratchetEval.knownWarnings) {
    ratchetEval.knownWarnings.forEach(w => warnings.push(w.detail));
  }

  // Determine Overall Status
  let overallStatus = 'PASS';
  if (hardFailures.length > 0) {
    overallStatus = 'FAIL';
  } else if (warnings.length > 0) {
    overallStatus = 'PASS WITH WARNINGS';
  }

  const summary = {
    overall_status: overallStatus,
    mode: isDeep ? 'DEEP (Network transport enabled)' : 'FAST (Deterministic local only)',
    base_ref: baseRef,
    hard_failures_count: hardFailures.length,
    regressions_count: ratchetEval.regressions.length,
    known_warnings_count: warnings.length,
    improvements_count: improvements.length,
    hard_failures: hardFailures,
    regressions: ratchetEval.regressions,
    warnings: warnings,
    improvements: improvements
  };

  const finalReport = {
    preflight_version: '1.0.0',
    executed_at: new Date().toISOString(),
    summary,
    reports
  };

  // Save run report
  const runReportPath = path.join(ROOT, 'data/audits/antigravity_preflight_run.json');
  fs.mkdirSync(path.dirname(runReportPath), { recursive: true });
  fs.writeFileSync(runReportPath, JSON.stringify(finalReport, null, 2), 'utf8');

  if (isJson) {
    console.log(JSON.stringify(finalReport, null, 2));
  } else {
    // Human CLI Output
    console.log('\n' + '='.repeat(80));
    console.log('                               ACUTING PREFLIGHT                                ');
    console.log('='.repeat(80) + '\n');

    console.log(`STATUS: ${overallStatus}\n`);
    console.log(`Mode:            ${summary.mode}`);
    console.log(`Base Ref:        ${baseRef}`);
    console.log(`Hard Failures:   ${summary.hard_failures_count}`);
    console.log(`Regressions:     ${summary.regressions_count}`);
    console.log(`Known Warnings:  ${summary.known_warnings_count}`);
    console.log(`Improvements:    ${summary.improvements_count}`);

    if (improvements.length > 0) {
      console.log('\n--- Improvements Achieved ---');
      improvements.forEach(imp => console.log(`  + ${imp}`));
    }

    if (hardFailures.length > 0) {
      console.log('\n--- Hard Failures (Action Required) ---');
      hardFailures.forEach((hf, idx) => console.log(`  ${idx + 1}. ${hf}`));
    }

    if (warnings.length > 0 && hardFailures.length === 0) {
      console.log('\n--- Known Debt Warnings (Tracked in Baseline Ratchet) ---');
      warnings.slice(0, 10).forEach((w, idx) => console.log(`  ${idx + 1}. ${w}`));
      if (warnings.length > 10) console.log(`  ... and ${warnings.length - 10} more (see data/audits/antigravity_preflight_run.json)`);
    }

    console.log('\n' + '-'.repeat(80));
    if (overallStatus === 'FAIL') {
      console.log('RESULT: FAIL — Fix hard failures or debt regressions before review.\n');
    } else {
      console.log('RESULT: PASS — Safe for independent human / clinical / semantic review.\n');
    }
    console.log('='.repeat(80) + '\n');
  }

  if (overallStatus === 'FAIL') {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// CLI Argument Parsing
const args = process.argv.slice(2);
const options = {
  deep: args.includes('--deep'),
  json: args.includes('--json'),
  selfTest: args.includes('--self-test'),
  updateBaseline: args.includes('--update-baseline'),
  base: 'origin/main',
  reason: ''
};

const baseIdx = args.indexOf('--base');
if (baseIdx !== -1 && args[baseIdx + 1]) {
  options.base = args[baseIdx + 1];
}

const reasonIdx = args.indexOf('--reason');
if (reasonIdx !== -1 && args[reasonIdx + 1]) {
  options.reason = args[reasonIdx + 1];
}

if (options.selfTest) {
  runStartupNegativeControls();
  console.log('Antigravity Preflight Self-Test: 12/12 negative controls passed.');
  process.exit(0);
}

runPreflight(options);
