/**
 * scripts/lib/preflight-git.js
 *
 * Git mutation scope analysis, base comparison, diff classification,
 * and canonical/generated change coherence.
 */

const { execSync } = require('child_process');
const path = require('path');

const CANONICAL_TO_GENERATED_MAP = [
  { canonicalPrefix: 'data/herbs/', generatedPrefix: 'data/generated/knowledge_mm.js' },
  { canonicalPrefix: 'data/herbs/formulas.json', generatedPrefix: 'data/generated/knowledge_rx.js' },
  { canonicalPrefix: 'data/pathology/', generatedPrefix: 'data/generated/knowledge_dx.js' },
  { canonicalPrefix: 'data/acupoints/', generatedPrefix: 'data/generated/points_361.js' },
  { canonicalPrefix: 'data/symptoms/', generatedPrefix: 'data/generated/knowledge_pat.js' },
  { canonicalPrefix: 'data/supplements/', generatedPrefix: 'data/generated/knowledge_ref.js' },
  { canonicalPrefix: 'data/pharmacology/', generatedPrefix: 'data/generated/knowledge_ref.js' }
];

function analyzeGitMutationScope(baseRef = 'origin/main', options = {}) {
  const root = options.root || path.resolve(__dirname, '../..');
  const allowlist = options.allowlist || [];

  let diffOutput = '';
  try {
    diffOutput = execSync(`git diff --name-status ${baseRef} HEAD`, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch (err) {
    try {
      diffOutput = execSync(`git diff --name-status ${baseRef}`, {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      });
    } catch (e) {
      return {
        passed: false,
        error: `Failed to run git diff against baseRef: ${baseRef} (${e.message})`,
        files: []
      };
    }
  }

  const lines = diffOutput.trim().split('\n').filter(Boolean);
  const changedFiles = [];

  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2) {
      const status = parts[0];
      const filePath = parts.slice(1).join(' ').replace(/\\/g, '/');
      changedFiles.push({ status, filePath });
    }
  });

  const canonicalChanges = changedFiles.filter(f => f.filePath.startsWith('data/') && !f.filePath.startsWith('data/generated/') && !f.filePath.startsWith('data/audits/'));
  const generatedChanges = changedFiles.filter(f => f.filePath.startsWith('data/generated/'));
  const workflowChanges = changedFiles.filter(f => f.filePath.startsWith('.github/workflows/'));

  const classifications = [];
  const hardFailures = [];
  const warnings = [];

  changedFiles.forEach(item => {
    const f = item.filePath;

    // Check allowlist
    if (allowlist.some(pat => typeof pat === 'string' ? f.startsWith(pat) : pat.test(f))) {
      classifications.push({ file: f, status: item.status, classification: 'ALLOWED_CHANGE' });
      return;
    }

    // Scratch files, documentation, audits, logs, scripts are allowed changes
    if (f.startsWith('scratch/') || f.startsWith('docs/') || f.startsWith('data/audits/') || f.startsWith('scripts/') || f === 'PROJECT_LOG.md') {
      classifications.push({ file: f, status: item.status, classification: 'ALLOWED_CHANGE' });
      return;
    }

    // Workflows modification
    if (f.startsWith('.github/workflows/')) {
      classifications.push({ file: f, status: item.status, classification: 'WORKFLOW_MUTATION' });
      warnings.push(`Workflow modified: ${f}`);
      return;
    }

    // Canonical data changes
    if (f.startsWith('data/') && !f.startsWith('data/generated/')) {
      const map = CANONICAL_TO_GENERATED_MAP.find(m => f.startsWith(m.canonicalPrefix));
      if (map) {
        const genUpdated = generatedChanges.some(g => g.filePath.startsWith(map.generatedPrefix) || g.filePath.startsWith('data/generated/knowledge_'));
        if (!genUpdated) {
          classifications.push({ file: f, status: item.status, classification: 'CANONICAL_CHANGED_WITHOUT_GENERATED' });
          hardFailures.push(`Canonical file changed without rebuilding generated bundle: ${f}`);
          return;
        }
      }
      classifications.push({ file: f, status: item.status, classification: 'CANONICAL_MUTATION_WITH_SYNC' });
      return;
    }

    // Generated layer changes without canonical change
    if (f.startsWith('data/generated/')) {
      if (canonicalChanges.length === 0) {
        classifications.push({ file: f, status: item.status, classification: 'GENERATED_CHANGED_WITHOUT_CANONICAL' });
        warnings.push(`Generated file changed without canonical data change: ${f}`);
        return;
      }
      classifications.push({ file: f, status: item.status, classification: 'GENERATED_REBUILD_SYNC' });
      return;
    }

    classifications.push({ file: f, status: item.status, classification: 'UNEXPECTED_CHANGE' });
    warnings.push(`Unexpected change in file: ${f}`);
  });

  return {
    passed: hardFailures.length === 0,
    baseRef,
    totalChangedFiles: changedFiles.length,
    canonicalChangesCount: canonicalChanges.length,
    generatedChangesCount: generatedChanges.length,
    workflowChangesCount: workflowChanges.length,
    classifications,
    hardFailures,
    warnings
  };
}

module.exports = {
  analyzeGitMutationScope
};
