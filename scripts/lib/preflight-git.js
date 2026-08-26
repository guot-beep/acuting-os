/**
 * scripts/lib/preflight-git.js
 *
 * Comprehensive Git mutation scope analysis:
 * - Committed changes since baseRef
 * - Staged changes
 * - Unstaged tracked modifications
 * - Untracked files
 * - Safe null-delimited parsing for filenames with spaces and unicode.
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

function parseGitDiffZ(buffer) {
  const entries = [];
  let i = 0;
  while (i < buffer.length) {
    let nextNull = buffer.indexOf(0, i);
    if (nextNull === -1) break;
    const statusLine = buffer.toString('utf8', i, nextNull).trim();
    i = nextNull + 1;

    if (!statusLine) continue;

    nextNull = buffer.indexOf(0, i);
    if (nextNull === -1) break;
    const filePath = buffer.toString('utf8', i, nextNull).replace(/\\/g, '/');
    i = nextNull + 1;

    if (statusLine.startsWith('R')) {
      nextNull = buffer.indexOf(0, i);
      if (nextNull !== -1) {
        const destPath = buffer.toString('utf8', i, nextNull).replace(/\\/g, '/');
        i = nextNull + 1;
        entries.push({ status: statusLine, filePath: destPath, oldPath: filePath });
        continue;
      }
    }

    entries.push({ status: statusLine, filePath });
  }
  return entries;
}

function parseGitStatusZ(buffer) {
  const entries = [];
  let i = 0;
  while (i < buffer.length) {
    if (i + 3 > buffer.length) break;
    const status = buffer.toString('utf8', i, i + 2);
    i += 3;

    let nextNull = buffer.indexOf(0, i);
    if (nextNull === -1) break;
    const filePath = buffer.toString('utf8', i, nextNull).replace(/\\/g, '/');
    i = nextNull + 1;

    if (status.startsWith('R')) {
      nextNull = buffer.indexOf(0, i);
      if (nextNull !== -1) {
        const destPath = buffer.toString('utf8', i, nextNull).replace(/\\/g, '/');
        i = nextNull + 1;
        entries.push({ status: status.trim(), filePath: destPath, oldPath: filePath });
        continue;
      }
    }

    entries.push({ status: status.trim(), filePath });
  }
  return entries;
}

const GIT_STATUS_LABELS = { M: 'modified', A: 'added', D: 'deleted', R: 'renamed', C: 'copied', U: 'unmerged', T: 'type-changed' };

// 2026-08-26 fix (independent audit of Task 9D, see docs/ANTIGRAVITY_HANDOFF.md):
// this used to store git's raw porcelain codes verbatim (e.g. "??" for
// untracked) in changedFiles[].status. Nothing in this file or its caller
// branches on the exact code string (confirmed: classification below is
// entirely file-path-based), so translating it here is safe — and it fixes a
// real side effect: scripts/validate-encoding.js's mojibake heuristic treats
// any bare "??" string as a sign of corrupted/untranslated Chinese text, so
// every run of this tool that touched an untracked file poisoned
// data/audits/antigravity_preflight_run.json with false "encoding defect"
// hits (2915->3043 in check-validation-ratchet.js, entirely from this cause).
function describeGitStatus(rawStatus) {
  const raw = String(rawStatus || '').trim();
  if (!raw) return 'unknown';
  if (raw === '??') return 'untracked';
  if (raw === '!!') return 'ignored';
  const simMatch = raw.match(/^([RC])(\d+)$/);
  if (simMatch) return `${GIT_STATUS_LABELS[simMatch[1]]} (${simMatch[2]}% similar)`;
  if (/^[MADRCUT]{1,2}$/.test(raw)) {
    const labels = [...new Set(raw.split('').map((ch) => GIT_STATUS_LABELS[ch] || ch))];
    return labels.join('+');
  }
  return `unrecognized-git-status(${raw})`;
}

function analyzeGitMutationScope(baseRef = 'origin/main', options = {}) {
  const root = options.root || path.resolve(__dirname, '../..');
  const allowlist = options.allowlist || [];

  const changedFilesMap = new Map();

  try {
    const diffBuf = execSync(`git diff -z --name-status ${baseRef} HEAD`, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const parsedDiff = parseGitDiffZ(diffBuf);
    parsedDiff.forEach(p => changedFilesMap.set(p.filePath, p.status));
  } catch (e) {
    try {
      const diffBuf2 = execSync(`git diff -z --name-status ${baseRef}`, {
        cwd: root,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      const parsedDiff2 = parseGitDiffZ(diffBuf2);
      parsedDiff2.forEach(p => changedFilesMap.set(p.filePath, p.status));
    } catch (err) {}
  }

  try {
    const stagedBuf = execSync(`git diff -z --cached --name-status`, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const parsedStaged = parseGitDiffZ(stagedBuf);
    parsedStaged.forEach(p => changedFilesMap.set(p.filePath, p.status));
  } catch (e) {}

  try {
    const statusBuf = execSync(`git status -z --porcelain=v1`, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    const parsedStatus = parseGitStatusZ(statusBuf);
    parsedStatus.forEach(p => {
      if (!changedFilesMap.has(p.filePath)) {
        changedFilesMap.set(p.filePath, p.status || 'M');
      }
    });
  } catch (e) {}

  const changedFiles = [];
  for (const [filePath, status] of changedFilesMap.entries()) {
    changedFiles.push({ filePath, status: describeGitStatus(status) });
  }

  const canonicalChanges = changedFiles.filter(f => f.filePath.startsWith('data/') && !f.filePath.startsWith('data/generated/') && !f.filePath.startsWith('data/audits/'));
  const generatedChanges = changedFiles.filter(f => f.filePath.startsWith('data/generated/'));
  const workflowChanges = changedFiles.filter(f => f.filePath.startsWith('.github/workflows/'));

  const classifications = [];
  const hardFailures = [];
  const warnings = [];

  changedFiles.forEach(item => {
    const f = item.filePath;

    if (allowlist.some(pat => typeof pat === 'string' ? f.startsWith(pat) : pat.test(f))) {
      classifications.push({ file: f, status: item.status, classification: 'ALLOWED_CHANGE' });
      return;
    }

    if (f.startsWith('scratch/') || f.startsWith('docs/') || f.startsWith('data/audits/') || f.startsWith('scripts/') || f === 'PROJECT_LOG.md') {
      classifications.push({ file: f, status: item.status, classification: 'ALLOWED_CHANGE' });
      return;
    }

    if (f.startsWith('.github/workflows/')) {
      classifications.push({ file: f, status: item.status, classification: 'WORKFLOW_MUTATION' });
      warnings.push(`Workflow modified: ${f}`);
      return;
    }

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
    changedFiles,
    classifications,
    hardFailures,
    warnings
  };
}

module.exports = {
  analyzeGitMutationScope,
  parseGitDiffZ,
  parseGitStatusZ
};
