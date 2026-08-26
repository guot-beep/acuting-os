#!/usr/bin/env node
/**
 * scripts/antigravity-preflight.js
 *
 * AcuTing OS Unified Preflight / AI Change Safety Gate (Task 9D Round 4).
 *
 * A unified, deterministic, fail-closed preflight gate for validating repository
 * integrity, mutation scope, generated sync, generalized runtime consumption graph,
 * validator/CI coverage, hygiene, provenance transport, and identity-aware debt ratchets.
 *
 * Usage:
 *   node scripts/antigravity-preflight.js                # Fast mode (deterministic, local only, read-only)
 *   node scripts/antigravity-preflight.js --deep         # Deep mode (includes real HTTP transport audit)
 *   node scripts/antigravity-preflight.js --json         # Machine-readable JSON output
 *   node scripts/antigravity-preflight.js --base <ref>   # Custom git comparison base ref (default: origin/main)
 *   node scripts/antigravity-preflight.js --write-report # Write tracked data/audits/antigravity_preflight_run.json
 *   node scripts/antigravity-preflight.js --update-baseline --reason "<reason>"
 *   node scripts/antigravity-preflight.js --self-test    # Run negative controls suite only
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const {
  checkFileHygiene,
  checkStringOrBufferHygiene,
  validateJsonString,
  loadJsonStrict,
  auditHygieneScope
} = require('./lib/preflight-hygiene');

const {
  analyzeGitMutationScope
} = require('./lib/preflight-git');

const {
  auditCanonicalIntegrity,
  auditNameCollisions,
  auditAliasCollisions,
  findPossibleDuplicates
} = require('./lib/preflight-canonical');

const {
  compareIdSets,
  analyzeControlFlow,
  classifyValidatorType,
  getRuntimeLoadedFiles,
  buildDependencyGraph,
  classifyArtifactConsumption,
  auditRuntimeConsumptionGraph,
  auditGeneratedSync,
  auditDeterministicRebuild,
  auditValidatorTaxonomyAndCI
} = require('./lib/preflight-generated-ci');

const {
  tokenizeProvenance,
  auditSourceIntegrity
} = require('./lib/preflight-sources');

const {
  loadPreflightBaseline,
  evaluateIdentityCategory,
  evaluateDebtRatchet,
  updatePreflightBaseline
} = require('./lib/preflight-ratchet');

// ============================================================================
// Negative Controls & Regression Test Suite (13 Executable Tests)
// ============================================================================

function runStartupNegativeControls() {
  // Test 1: Duplicate canonical ID fixture -> actual scanner FAIL
  const tempDir = path.join(ROOT, 'scratch', 'test_fixture_' + Date.now()).replace(/\\/g, '/');
  fs.mkdirSync(tempDir + '/data/herbs', { recursive: true });
  fs.writeFileSync(tempDir + '/data/herbs/herb_canon_shortlist.json', JSON.stringify({
    records: [{ id: 'herb.dupe', name_zh: 'A' }, { id: 'herb.dupe', name_zh: 'B' }]
  }), 'utf8');
  fs.writeFileSync(tempDir + '/data/herbs/formulas.json', JSON.stringify({ records: [] }), 'utf8');
  try {
    const dupRes = auditCanonicalIntegrity({ root: tempDir });
    if (dupRes.passed || dupRes.hardFailures.length === 0 || !dupRes.hardFailures[0].includes('Exact duplicate')) {
      throw new Error('Negative Control 1 Failed: Duplicate canonical ID not caught by actual scanner');
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  // Test 2: Alias collision fixture -> actual alias audit catches collision
  const aliasRecords = [
    { id: 'herb.ma_huang', name_zh: '麻黃', name_en: 'Ephedra', aliases: ['草麻黃'] },
    { id: 'herb.fake_herb', name_zh: '假藥', name_en: 'Fake', aliases: ['麻黃', '草麻黃'] }
  ];
  const aliasAudit = auditAliasCollisions(aliasRecords, 'herb');
  if (aliasAudit.aliasCollidesWithCanon.length === 0 || aliasAudit.aliasToMultiple.length === 0) {
    throw new Error('Negative Control 2 Failed: Alias collision not caught by actual alias engine');
  }

  // Test 3: Working-tree uncommitted mutation -> actual git scanner FAIL
  const tempGitDir = path.join(ROOT, 'scratch', 'test_git_' + Date.now()).replace(/\\/g, '/');
  fs.mkdirSync(tempGitDir + '/data/herbs', { recursive: true });
  try {
    execSync('git init', { cwd: tempGitDir, stdio: 'ignore' });
    execSync('git config user.name "Test" && git config user.email "test@test.com"', { cwd: tempGitDir, stdio: 'ignore' });
    fs.writeFileSync(tempGitDir + '/data/herbs/test.json', '{}', 'utf8');
    execSync('git add . && git commit -m "init"', { cwd: tempGitDir, stdio: 'ignore' });
    fs.writeFileSync(tempGitDir + '/data/herbs/test.json', '{"modified":true}', 'utf8');
    const gitRes = analyzeGitMutationScope('HEAD', { root: tempGitDir });
    if (gitRes.totalChangedFiles === 0 || gitRes.changedFiles.length === 0) {
      throw new Error('Negative Control 3 Failed: Uncommitted working tree edit not caught by git scanner');
    }
  } finally {
    fs.rmSync(tempGitDir, { recursive: true, force: true });
  }

  // Test 4: Generated duplicate ID -> actual generated comparator FAIL
  const genDup = compareIdSets(['herb.a', 'herb.b'], ['herb.a', 'herb.b', 'herb.b']);
  if (genDup.status !== 'GENERATED_DUPLICATE_ID' || genDup.duplicatesInGenerated.length !== 1) {
    throw new Error('Negative Control 4 Failed: GENERATED_DUPLICATE_ID not caught');
  }

  // Test 5: Generated missing ID -> actual comparator FAIL
  const genMissing = compareIdSets(['herb.a', 'herb.b'], ['herb.a']);
  if (genMissing.status !== 'GENERATED_MISSING_CANONICAL_ID' || !genMissing.missingInGenerated.includes('herb.b')) {
    throw new Error('Negative Control 5 Failed: GENERATED_MISSING_CANONICAL_ID not caught');
  }

  // Test 6: Generated extra ID -> actual comparator FAIL
  const genExtra = compareIdSets(['herb.a'], ['herb.a', 'herb.fake']);
  if (genExtra.status !== 'GENERATED_EXTRA_ID' || !genExtra.extraInGenerated.includes('herb.fake')) {
    throw new Error('Negative Control 6 Failed: GENERATED_EXTRA_ID not caught');
  }

  // Test 7: Generalized runtime dependency graph & synthetic transitive bundling check
  const syntheticEdges = [
    { input: 'data/fixture.json', builder: 'scripts/build-bundle.js', output: 'data/generated/bundle.js' }
  ];
  const syntheticRuntime = new Set(['data/generated/bundle.js']);
  const syntheticRes = classifyArtifactConsumption('data/fixture.json', syntheticRuntime, syntheticEdges, ROOT);
  if (syntheticRes.status !== 'TRANSITIVELY_BUNDLED_AND_LOADED') {
    throw new Error('Negative Control 7 Failed: Generic classifier did not classify synthetic transitive dependency as TRANSITIVELY_BUNDLED_AND_LOADED');
  }

  // Test 8: Blocking CI validator exits 0 on defect -> POSSIBLE_FALSE_GREEN
  const falseGreen = analyzeControlFlow('console.error("error detected"); process.exit(0);');
  if (falseGreen.classification !== 'POSSIBLE_FALSE_GREEN') {
    throw new Error('Negative Control 8 Failed: False green not classified as POSSIBLE_FALSE_GREEN');
  }

  // Test 9: Informational report exits 0 -> REPORT (informational step)
  const repType = classifyValidatorType('report-pharm-coverage.js', 'console.log("report");');
  if (repType !== 'REPORT') {
    throw new Error('Negative Control 9 Failed: Report script not classified as REPORT');
  }

  // Test 10: Malformed baseline JSON fail-closed during load and rebaseline
  const badBaselinePath = path.join(ROOT, 'scratch/bad_baseline_' + Date.now() + '.json');
  fs.writeFileSync(badBaselinePath, '{ malformed json syntax,,, }', 'utf8');
  let loadThrew = false;
  let updateThrew = false;
  try {
    loadPreflightBaseline(badBaselinePath);
  } catch (e) {
    loadThrew = true;
  }
  try {
    updatePreflightBaseline({}, 'test reason', badBaselinePath);
  } catch (e) {
    updateThrew = true;
  } finally {
    if (fs.existsSync(badBaselinePath)) fs.unlinkSync(badBaselinePath);
  }
  if (!loadThrew || !updateThrew) {
    throw new Error('Negative Control 10 Failed: Malformed baseline did not fail-closed on load or update');
  }

  // Test 11: Replacement char / illegal control char -> actual scanner FAIL
  const badChar = checkStringOrBufferHygiene(Buffer.from([0x01, 0x41, 0x42]));
  if (badChar.passed || badChar.controlCharCount !== 1) {
    throw new Error('Negative Control 11 Failed: Illegal C0 control char not caught');
  }

  const badUni = checkStringOrBufferHygiene('broken \uFFFD data');
  if (badUni.passed || !badUni.hasReplacementChar) {
    throw new Error('Negative Control 11b Failed: Unicode replacement character not caught');
  }

  // Test 12: Identity-aware ratchet (new identity regression) -> FAIL
  const idRegress = evaluateIdentityCategory('test', ['a', 'b', 'c_new'], ['a', 'b']);
  if (idRegress.passed || !idRegress.newIdentities.includes('c_new')) {
    throw new Error('Negative Control 12 Failed: New identity regression not detected');
  }

  // Test 13: Identity-aware ratchet (identity improvement) -> IMPROVED
  const idImprove = evaluateIdentityCategory('test', ['a'], ['a', 'b']);
  if (!idImprove.passed || !idImprove.removedIdentities.includes('b')) {
    throw new Error('Negative Control 13 Failed: Identity improvement not detected');
  }

  return true;
}

// ============================================================================
// Main Preflight Execution
// ============================================================================

async function runPreflight(options = {}) {
  const isDeep = options.deep || false;
  const isJson = options.json || false;
  const writeReport = options.writeReport || false;
  const baseRef = options.base || 'origin/main';
  const updateBase = options.updateBaseline || false;
  const reason = options.reason || '';

  // Run startup negative controls
  runStartupNegativeControls();

  const hardFailures = [];
  const warnings = [];
  const improvements = [];
  const reports = {};

  // 1. Git Mutation Scope Gate
  const gitScope = analyzeGitMutationScope(baseRef, { root: ROOT });
  reports.mutation_scope = gitScope;
  if (!gitScope.passed) {
    gitScope.hardFailures.forEach(f => hardFailures.push(f));
  }
  if (gitScope.warnings) {
    gitScope.warnings.forEach(w => warnings.push(w));
  }

  // 2. Hygiene Gate (All changed text files + canonical JSON + baseline JSON)
  const hygieneAudit = auditHygieneScope(ROOT, gitScope.changedFiles);
  reports.hygiene = hygieneAudit;
  if (!hygieneAudit.passed) {
    hygieneAudit.hardFailures.forEach(f => hardFailures.push(f));
  }

  // 3. Canonical Duplicate, Name, Alias & Orphan Integrity Gate (Task 9B)
  const canonicalAudit = auditCanonicalIntegrity({ root: ROOT });
  reports.canonical_integrity = canonicalAudit;
  if (!canonicalAudit.passed) {
    canonicalAudit.hardFailures.forEach(f => hardFailures.push(f));
  }

  // 4. Generated Data Sync, Sandbox Rebuild & Dependency Graph Gate (Task 9C)
  const genSync = auditGeneratedSync(ROOT);
  reports.generated_sync = genSync;
  if (!genSync.passed) {
    genSync.hardFailures.forEach(f => hardFailures.push(f));
  }

  const depGraph = auditRuntimeConsumptionGraph(ROOT);
  reports.runtime_dependency_graph = depGraph;
  if (!depGraph.passed) {
    depGraph.hardFailures.forEach(f => hardFailures.push(f));
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
  const sourceAudit = await auditSourceIntegrity({ root: ROOT, deep: isDeep });
  reports.source_integrity = sourceAudit;

  // 7. Identity-Aware Baseline & Debt Ratchet Evaluation
  const currentDebtData = {
    orphan_blocking_validators: validatorCI.orphanBlockingValidators,
    rebuild_differs_artifacts: rebuildAudit.differingArtifacts,
    orphan_target_missing_references: canonicalAudit.targetMissingIdentities,
    unique_missing_local_paths: sourceAudit.unique_missing_local_paths,
    dead_http_links: isDeep && sourceAudit.httpResults && sourceAudit.httpResults.dead4xxUrls ? sourceAudit.httpResults.dead4xxUrls : []
  };

  if (updateBase) {
    const updated = updatePreflightBaseline(currentDebtData, reason);
    if (!isJson) {
      console.log(`\nUpdated preflight baseline successfully with reason: "${reason}"`);
      console.log('New ceilings:', JSON.stringify(updated.debt_counts, null, 2));
    }
  }

  const baseline = loadPreflightBaseline();
  const ratchetEval = evaluateDebtRatchet(currentDebtData, baseline, isDeep);
  reports.baseline_comparison = {
    baseline_path: 'data/audits/antigravity_preflight_baseline.json',
    current_metrics: currentDebtData,
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
    total_changed_files: gitScope.totalChangedFiles,
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

  if (writeReport) {
    const runReportPath = path.join(ROOT, 'data/audits/antigravity_preflight_run.json');
    fs.mkdirSync(path.dirname(runReportPath), { recursive: true });
    fs.writeFileSync(runReportPath, JSON.stringify(finalReport, null, 2), 'utf8');
  }

  if (isJson) {
    console.log(JSON.stringify(finalReport, null, 2));
  } else {
    console.log('\n' + '='.repeat(80));
    console.log('                               ACUTING PREFLIGHT                                ');
    console.log('='.repeat(80) + '\n');

    console.log(`STATUS: ${overallStatus}\n`);
    console.log(`Mode:            ${summary.mode}`);
    console.log(`Base Ref:        ${baseRef}`);
    console.log(`Changed Files:   ${summary.total_changed_files}`);
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
      warnings.forEach((w, idx) => console.log(`  ${idx + 1}. ${w}`));
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
  writeReport: args.includes('--write-report'),
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
  console.log('Antigravity Preflight Self-Test: 13/13 negative controls passed.');
  process.exit(0);
}

runPreflight(options);
