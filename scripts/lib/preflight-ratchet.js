/**
 * scripts/lib/preflight-ratchet.js
 *
 * Identity-Aware Preflight Baseline Comparison & Debt Ratchet.
 *
 * Tracks stable identities for all high-risk technical debt:
 * - orphan blocking validator script paths
 * - rebuild differs artifact paths
 * - TARGET_MISSING structured reference edge identities
 * - unique missing local paths
 * - dead HTTP URLs (in deep mode)
 *
 * Invariant:
 * - Same known identity -> warning
 * - Known identity removed -> IMPROVEMENT
 * - New identity appears (even if count <= ceiling) -> REGRESSION (FAIL)
 * - Baseline missing or malformed -> FAIL CLOSED
 */

const fs = require('fs');
const path = require('path');
const { loadJsonStrict } = require('./preflight-hygiene');

const BASELINE_PATH = path.resolve(__dirname, '../../data/audits/antigravity_preflight_baseline.json');

function loadPreflightBaseline(customPath = BASELINE_PATH) {
  if (!fs.existsSync(customPath)) {
    throw new Error(`Preflight Baseline Error: Baseline file does not exist at ${customPath}. Initial baseline must be committed or created via --update-baseline --reason "..."`);
  }
  return loadJsonStrict(customPath);
}

function evaluateIdentityCategory(categoryName, currentIdentities, baselineIdentities) {
  const currentSet = new Set(currentIdentities || []);
  const baseSet = new Set(baselineIdentities || []);

  const newIdentities = [];
  const removedIdentities = [];
  const retainedIdentities = [];

  currentSet.forEach(id => {
    if (baseSet.has(id)) {
      retainedIdentities.push(id);
    } else {
      newIdentities.push(id);
    }
  });

  baseSet.forEach(id => {
    if (!currentSet.has(id)) {
      removedIdentities.push(id);
    }
  });

  return {
    categoryName,
    passed: newIdentities.length === 0,
    currentCount: currentSet.size,
    baselineCount: baseSet.size,
    newIdentities,
    removedIdentities,
    retainedIdentities
  };
}

function evaluateDebtRatchet(currentData, baseline = loadPreflightBaseline(), isDeep = false) {
  const known = baseline.known_identities || {};
  const regressions = [];
  const improvements = [];
  const knownWarnings = [];

  // 1. Orphan Blocking Validators
  const valEval = evaluateIdentityCategory(
    'orphan_blocking_validators',
    currentData.orphan_blocking_validators,
    known.orphan_blocking_validators
  );
  if (!valEval.passed) {
    regressions.push({
      category: 'orphan_blocking_validators',
      detail: `New orphan blocking validator(s) detected: ${valEval.newIdentities.join(', ')}`
    });
  }
  if (valEval.removedIdentities.length > 0) {
    improvements.push({
      category: 'orphan_blocking_validators',
      detail: `Orphan blocking validator(s) resolved: ${valEval.removedIdentities.join(', ')}`
    });
  }
  if (valEval.retainedIdentities.length > 0) {
    knownWarnings.push({
      category: 'orphan_blocking_validators',
      count: valEval.retainedIdentities.length,
      detail: `Existing known orphan blocking validators (${valEval.retainedIdentities.length}): ${valEval.retainedIdentities.join(', ')}`
    });
  }

  // 2. Rebuild Differs Artifacts
  const rebuildEval = evaluateIdentityCategory(
    'rebuild_differs_artifacts',
    currentData.rebuild_differs_artifacts,
    known.rebuild_differs_artifacts
  );
  if (!rebuildEval.passed) {
    regressions.push({
      category: 'rebuild_differs_artifacts',
      detail: `New artifact(s) failing deterministic rebuild: ${rebuildEval.newIdentities.join(', ')}`
    });
  }
  if (rebuildEval.removedIdentities.length > 0) {
    improvements.push({
      category: 'rebuild_differs_artifacts',
      detail: `Deterministic rebuild resolved for: ${rebuildEval.removedIdentities.join(', ')}`
    });
  }
  if (rebuildEval.retainedIdentities.length > 0) {
    knownWarnings.push({
      category: 'rebuild_differs_artifacts',
      count: rebuildEval.retainedIdentities.length,
      detail: `Existing known rebuild difference (${rebuildEval.retainedIdentities.length}): ${rebuildEval.retainedIdentities.join(', ')}`
    });
  }

  // 3. Orphan Structured References (TARGET_MISSING)
  const orphanRefEval = evaluateIdentityCategory(
    'orphan_target_missing_references',
    currentData.orphan_target_missing_references,
    known.orphan_target_missing_references
  );
  if (!orphanRefEval.passed) {
    regressions.push({
      category: 'orphan_target_missing_references',
      detail: `New orphan structured reference(s) detected: ${orphanRefEval.newIdentities.join(', ')}`
    });
  }
  if (orphanRefEval.removedIdentities.length > 0) {
    improvements.push({
      category: 'orphan_target_missing_references',
      detail: `Orphan structured reference(s) resolved: ${orphanRefEval.removedIdentities.join(', ')}`
    });
  }
  if (orphanRefEval.retainedIdentities.length > 0) {
    knownWarnings.push({
      category: 'orphan_target_missing_references',
      count: orphanRefEval.retainedIdentities.length,
      detail: `Existing known orphan structured references (${orphanRefEval.retainedIdentities.length}): ${orphanRefEval.retainedIdentities.join(', ')}`
    });
  }

  // 4. Unique Missing Local Paths
  const localMissingEval = evaluateIdentityCategory(
    'unique_missing_local_paths',
    currentData.unique_missing_local_paths,
    known.unique_missing_local_paths
  );
  if (!localMissingEval.passed) {
    regressions.push({
      category: 'unique_missing_local_paths',
      detail: `New missing local path(s) referenced in provenance: ${localMissingEval.newIdentities.join(', ')}`
    });
  }
  if (localMissingEval.removedIdentities.length > 0) {
    improvements.push({
      category: 'unique_missing_local_paths',
      detail: `Missing local path(s) resolved: ${localMissingEval.removedIdentities.join(', ')}`
    });
  }
  if (localMissingEval.retainedIdentities.length > 0) {
    knownWarnings.push({
      category: 'unique_missing_local_paths',
      count: localMissingEval.retainedIdentities.length,
      detail: `Existing known missing local paths (${localMissingEval.retainedIdentities.length}): ${localMissingEval.retainedIdentities.join(', ')}`
    });
  }

  // 5. Dead HTTP URLs (Deep Mode only)
  if (isDeep && currentData.dead_http_links && Array.isArray(currentData.dead_http_links)) {
    const httpEval = evaluateIdentityCategory(
      'dead_http_links',
      currentData.dead_http_links,
      known.dead_http_links
    );
    if (!httpEval.passed) {
      regressions.push({
        category: 'dead_http_links',
        detail: `New dead HTTP URL(s) detected: ${httpEval.newIdentities.slice(0, 5).join(', ')}`
      });
    }
    if (httpEval.removedIdentities.length > 0) {
      improvements.push({
        category: 'dead_http_links',
        detail: `Dead HTTP URL(s) resolved: ${httpEval.removedIdentities.length} URLs`
      });
    }
    if (httpEval.retainedIdentities.length > 0) {
      knownWarnings.push({
        category: 'dead_http_links',
        count: httpEval.retainedIdentities.length,
        detail: `Existing known dead HTTP URLs (${httpEval.retainedIdentities.length})`
      });
    }
  } else {
    // Fast Mode notice
    const baselineDeadCount = (known.dead_http_links || []).length || 95;
    knownWarnings.push({
      category: 'dead_http_links',
      count: baselineDeadCount,
      detail: `Historical dead HTTP links baseline (${baselineDeadCount}) [Fast Mode: network audit skipped]`
    });
  }

  return {
    passed: regressions.length === 0,
    regressions,
    improvements,
    knownWarnings
  };
}

function updatePreflightBaseline(currentData, reason, customPath = BASELINE_PATH) {
  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    throw new Error('Preflight Rebaseline Error: --reason "<explanation>" is mandatory when updating the baseline.');
  }

  let currentBaseline = { reasons: [] };
  if (fs.existsSync(customPath)) {
    try {
      currentBaseline = loadJsonStrict(customPath);
    } catch (e) {}
  }

  const updatedBaseline = {
    _version: '1.0.0',
    _description: 'AcuTing OS Unified Preflight Identity-Aware Debt Baseline',
    updated_at: new Date().toISOString(),
    reasons: [...(currentBaseline.reasons || []), `${new Date().toISOString().split('T')[0]}: ${reason.trim()}`],
    known_identities: {
      orphan_blocking_validators: currentData.orphan_blocking_validators || [],
      rebuild_differs_artifacts: currentData.rebuild_differs_artifacts || [],
      orphan_target_missing_references: currentData.orphan_target_missing_references || [],
      unique_missing_local_paths: currentData.unique_missing_local_paths || [],
      dead_http_links: currentData.dead_http_links || []
    },
    debt_counts: {
      orphan_blocking_validators: (currentData.orphan_blocking_validators || []).length,
      rebuild_differs_artifacts: (currentData.rebuild_differs_artifacts || []).length,
      orphan_target_missing_references: (currentData.orphan_target_missing_references || []).length,
      unique_missing_local_paths: (currentData.unique_missing_local_paths || []).length,
      dead_http_links: (currentData.dead_http_links || []).length
    }
  };

  fs.mkdirSync(path.dirname(customPath), { recursive: true });
  fs.writeFileSync(customPath, JSON.stringify(updatedBaseline, null, 2), 'utf8');
  return updatedBaseline;
}

module.exports = {
  BASELINE_PATH,
  loadPreflightBaseline,
  evaluateIdentityCategory,
  evaluateDebtRatchet,
  updatePreflightBaseline
};
