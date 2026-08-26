/**
 * scripts/lib/preflight-ratchet.js
 *
 * Preflight baseline comparison and debt ratchet mechanism.
 * Allows known existing debt without causing permanent red lights,
 * while preventing any debt regressions and celebrating improvements.
 */

const fs = require('fs');
const path = require('path');

const BASELINE_PATH = path.resolve(__dirname, '../../data/audits/antigravity_preflight_baseline.json');

const INITIAL_DEFAULT_BASELINE = {
  _version: '1.0.0',
  _description: 'AcuTing OS Unified Preflight Debt Ratchet Baseline',
  updated_at: '2026-08-25T22:00:00.000Z',
  reasons: ['Task 9D initial unified preflight baseline calibration'],
  debt_ceilings: {
    orphan_blocking_validators: 12,
    rebuild_differs_artifacts: 1,
    orphan_target_missing_references: 5,
    local_missing_sources: 617,
    dead_http_links: 95
  }
};

function loadPreflightBaseline(customPath = BASELINE_PATH) {
  if (fs.existsSync(customPath)) {
    try {
      return JSON.parse(fs.readFileSync(customPath, 'utf8'));
    } catch (e) {
      console.warn(`Warning: Could not parse baseline at ${customPath}, using default baseline.`);
    }
  }
  return INITIAL_DEFAULT_BASELINE;
}

function evaluateDebtRatchet(currentMetrics, baseline = loadPreflightBaseline()) {
  const ceilings = baseline.debt_ceilings || {};
  const regressions = [];
  const improvements = [];
  const knownWarnings = [];

  for (const [key, ceiling] of Object.entries(ceilings)) {
    const currentVal = currentMetrics[key] !== undefined ? currentMetrics[key] : 0;
    if (currentVal > ceiling) {
      regressions.push({
        metric: key,
        ceiling,
        current: currentVal,
        delta: currentVal - ceiling,
        detail: `Debt ceiling exceeded for ${key}: current ${currentVal} > ceiling ${ceiling}`
      });
    } else if (currentVal < ceiling) {
      improvements.push({
        metric: key,
        ceiling,
        current: currentVal,
        delta: ceiling - currentVal,
        detail: `Debt reduced for ${key}: ${ceiling} -> ${currentVal}`
      });
    } else {
      if (currentVal > 0) {
        knownWarnings.push({
          metric: key,
          count: currentVal,
          detail: `Existing known debt within ceiling for ${key}: ${currentVal}`
        });
      }
    }
  }

  return {
    passed: regressions.length === 0,
    regressions,
    improvements,
    knownWarnings
  };
}

function updatePreflightBaseline(newMetrics, reason, customPath = BASELINE_PATH) {
  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    throw new Error('Preflight Rebaseline Error: --reason "<explanation>" is mandatory when updating the baseline.');
  }

  const currentBaseline = loadPreflightBaseline(customPath);
  const updatedCeilings = Object.assign({}, currentBaseline.debt_ceilings, newMetrics);

  const updatedBaseline = {
    _version: '1.0.0',
    _description: 'AcuTing OS Unified Preflight Debt Ratchet Baseline',
    updated_at: new Date().toISOString(),
    reasons: [...(currentBaseline.reasons || []), `${new Date().toISOString().split('T')[0]}: ${reason.trim()}`],
    debt_ceilings: updatedCeilings
  };

  fs.mkdirSync(path.dirname(customPath), { recursive: true });
  fs.writeFileSync(customPath, JSON.stringify(updatedBaseline, null, 2), 'utf8');
  return updatedBaseline;
}

module.exports = {
  BASELINE_PATH,
  INITIAL_DEFAULT_BASELINE,
  loadPreflightBaseline,
  evaluateDebtRatchet,
  updatePreflightBaseline
};
