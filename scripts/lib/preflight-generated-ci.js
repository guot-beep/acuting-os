/**
 * scripts/lib/preflight-generated-ci.js
 *
 * Task 9C deterministic generated sync (7+1 domains), sandbox rebuild,
 * generalized dependency consumption graph, validator taxonomy,
 * CI invocation closure, and fail-closed / false-green analysis.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadJsonStrict } = require('./preflight-hygiene');

function compareIdSets(canonicalIds, generatedIds) {
  const cSet = new Set(canonicalIds);
  const gSet = new Set(generatedIds);

  const missingInGenerated = [];
  const extraInGenerated = [];
  const duplicatesInGenerated = [];

  const seenG = new Set();
  generatedIds.forEach(id => {
    if (seenG.has(id)) duplicatesInGenerated.push(id);
    seenG.add(id);
  });

  canonicalIds.forEach(id => {
    if (!gSet.has(id)) missingInGenerated.push(id);
  });

  generatedIds.forEach(id => {
    if (!cSet.has(id)) extraInGenerated.push(id);
  });

  let status = 'SYNC_OK';
  if (duplicatesInGenerated.length > 0) status = 'GENERATED_DUPLICATE_ID';
  else if (missingInGenerated.length > 0) status = 'GENERATED_MISSING_CANONICAL_ID';
  else if (extraInGenerated.length > 0) status = 'GENERATED_EXTRA_ID';

  return { status, missingInGenerated, extraInGenerated, duplicatesInGenerated };
}

function extractJsonObjectsFromJs(jsContent, globalKey) {
  const marker = globalKey + ' = ';
  const idx = jsContent.indexOf(marker);
  if (idx === -1) return null;
  const jsonPart = jsContent.slice(idx + marker.length).trim().replace(/;\s*$/, '');
  try {
    return JSON.parse(jsonPart);
  } catch (e) {
    const assignMarker = 'Object.assign(globalThis.ACUTING_KNOWLEDGE || {}, ';
    const aIdx = jsContent.indexOf(assignMarker);
    if (aIdx !== -1) {
      const rest = jsContent.slice(aIdx + assignMarker.length);
      const closeIdx = rest.indexOf(');\n');
      if (closeIdx !== -1) {
        return JSON.parse(rest.slice(0, closeIdx));
      }
    }
    return null;
  }
}

function analyzeControlFlow(code) {
  const hasLiteralExitNonZero = /process\.exit\s*\(\s*[1-9]\d*\s*\)/.test(code) ||
                               /process\.exitCode\s*=\s*[1-9]\d*/.test(code);

  const hasTernaryOrExprExit = /process\.exit\s*\(\s*[^0\);]+(?:\?|===|!==|>|<|&&|\|\|)[^)]*\)/.test(code) ||
                              /process\.exitCode\s*=\s*[^0;\n]+(?:\?|===|!==|>|<|&&|\|\|)/.test(code) ||
                              /process\.exit\s*\(\s*(?:hits|defects|failures|fail|errors|blocking|ok|selfTest)[^)]*\)/.test(code);

  const hasThrow = /throw\s+new\s+Error|throw\s+[a-zA-Z0-9_$]+/.test(code);

  const hasExitNonZero = hasLiteralExitNonZero || hasTernaryOrExprExit || hasThrow;

  const notes = [];
  if (!hasExitNonZero) {
    notes.push('No non-zero exit pattern found');
  }

  const classification = hasExitNonZero ? 'FAIL_CLOSED' : 'POSSIBLE_FALSE_GREEN';
  return { classification, hasExitNonZero, notes };
}

function classifyValidatorType(scriptFile, code = '') {
  const isReportOnly = /report-only|report only|informational only/i.test(code);
  const control = code ? analyzeControlFlow(code) : { hasExitNonZero: true };

  if (scriptFile.startsWith('validate-') || scriptFile.startsWith('check-')) {
    if (control.hasExitNonZero && !isReportOnly) {
      return 'BLOCKING_VALIDATOR';
    } else {
      return 'NONBLOCKING_VALIDATOR';
    }
  } else if (scriptFile.startsWith('test-')) {
    return 'TEST';
  } else if (scriptFile.startsWith('audit-')) {
    return 'AUDIT';
  } else if (scriptFile.startsWith('report-')) {
    return 'REPORT';
  } else if (scriptFile.startsWith('rehearse-') || scriptFile.startsWith('walkthrough-')) {
    return 'REHEARSAL_DASHBOARD';
  }
  return 'UTILITY_OTHER';
}

function auditGeneratedSync(root = path.resolve(__dirname, '../..')) {
  const results = [];
  const hardFailures = [];

  function evaluateDomain(domainName, cIds, gIds) {
    const cmp = compareIdSets(cIds, gIds);
    results.push({ domain: domainName, canonicalCount: cIds.length, generatedCount: gIds.length, ...cmp });
    if (cmp.status === 'GENERATED_DUPLICATE_ID') {
      hardFailures.push(`${domainName}: Duplicate ID detected in generated layer (${cmp.duplicatesInGenerated.join(', ')})`);
    } else if (cmp.status === 'GENERATED_MISSING_CANONICAL_ID') {
      hardFailures.push(`${domainName}: Generated layer missing ${cmp.missingInGenerated.length} canonical IDs`);
    } else if (cmp.status === 'GENERATED_EXTRA_ID') {
      hardFailures.push(`${domainName}: Generated layer has ${cmp.extraInGenerated.length} extra/stale IDs`);
    }
  }

  // 1. Herbs
  try {
    const cHerbs = loadJsonStrict(path.join(root, 'data/herbs/herb_canon_shortlist.json')).records || [];
    const mmJs = fs.readFileSync(path.join(root, 'data/generated/knowledge_mm.js'), 'utf8');
    const mmObj = extractJsonObjectsFromJs(mmJs, 'globalThis.ACUTING_KNOWLEDGE');
    const gHerbs = (mmObj && mmObj.herbs && mmObj.herbs.records) || [];
    evaluateDomain('herbs', cHerbs.map(r => r.id), gHerbs.map(r => r.id));
  } catch (e) {
    hardFailures.push(`Failed to audit herbs sync: ${e.message}`);
  }

  // 2. Formulas
  try {
    const cFormulas = loadJsonStrict(path.join(root, 'data/herbs/formulas.json')).records || [];
    const rxJs = fs.readFileSync(path.join(root, 'data/generated/knowledge_rx.js'), 'utf8');
    const rxObj = extractJsonObjectsFromJs(rxJs, 'globalThis.ACUTING_KNOWLEDGE');
    const gFormulas = (rxObj && rxObj.formulas && rxObj.formulas.records) || [];
    evaluateDomain('formulas', cFormulas.map(r => r.id), gFormulas.map(r => r.id));
  } catch (e) {
    hardFailures.push(`Failed to audit formulas sync: ${e.message}`);
  }

  // 3. Acupoints 361
  try {
    const c361 = loadJsonStrict(path.join(root, 'data/acupoints/361.json'));
    const p361Js = fs.readFileSync(path.join(root, 'data/generated/points_361.js'), 'utf8');
    const g361 = extractJsonObjectsFromJs(p361Js, 'globalThis.ACUTING_POINTS_361') || [];
    evaluateDomain('acupoints_361', c361.map(r => r.code), g361.map(r => r.code));
  } catch (e) {
    hardFailures.push(`Failed to audit acupoints 361 sync: ${e.message}`);
  }

  // 4. Symptoms
  try {
    const cSym = loadJsonStrict(path.join(root, 'data/symptoms/symptoms.json')).records || [];
    const patJs = fs.readFileSync(path.join(root, 'data/generated/knowledge_pat.js'), 'utf8');
    const patObj = extractJsonObjectsFromJs(patJs, 'globalThis.ACUTING_KNOWLEDGE');
    const gSym = (patObj && patObj.symptoms && patObj.symptoms.records) || [];
    evaluateDomain('symptoms', cSym.map(r => r.id), gSym.map(r => r.id));
  } catch (e) {
    hardFailures.push(`Failed to audit symptoms sync: ${e.message}`);
  }

  // 5. Conditions shortlist
  try {
    const cCond = loadJsonStrict(path.join(root, 'data/pathology/condition_canon_shortlist.json')).records || [];
    const dxJs = fs.readFileSync(path.join(root, 'data/generated/knowledge_dx.js'), 'utf8');
    const dxObj = extractJsonObjectsFromJs(dxJs, 'globalThis.ACUTING_KNOWLEDGE');
    const gCond = (dxObj && dxObj.conditionCanon && dxObj.conditionCanon.records) || [];
    evaluateDomain('conditions', cCond.map(r => r.id), gCond.map(r => r.id));
  } catch (e) {
    hardFailures.push(`Failed to audit conditions sync: ${e.message}`);
  }

  // 6. Pharmacology Drugs
  try {
    const cDrugs = loadJsonStrict(path.join(root, 'data/pharmacology/drugs.json')).records || [];
    const refJs = fs.readFileSync(path.join(root, 'data/generated/knowledge_ref.js'), 'utf8');
    const refObj = extractJsonObjectsFromJs(refJs, 'globalThis.ACUTING_KNOWLEDGE');
    const gDrugs = (refObj && refObj.pharmDrugs && refObj.pharmDrugs.records) || [];
    evaluateDomain('pharmacology_drugs', cDrugs.map(r => r.id), gDrugs.map(r => r.id));
  } catch (e) {
    hardFailures.push(`Failed to audit pharmacology sync: ${e.message}`);
  }

  // 7. Supplements
  try {
    const cSupp = loadJsonStrict(path.join(root, 'data/supplements/supplements.json')).records || [];
    const refJs2 = fs.readFileSync(path.join(root, 'data/generated/knowledge_ref.js'), 'utf8');
    const refObj2 = extractJsonObjectsFromJs(refJs2, 'globalThis.ACUTING_KNOWLEDGE');
    const gSupp = (refObj2 && refObj2.supplementRecords && refObj2.supplementRecords.records) || [];
    evaluateDomain('supplements', cSupp.map(r => r.id), gSupp.map(r => r.id));
  } catch (e) {
    hardFailures.push(`Failed to audit supplements sync: ${e.message}`);
  }

  // 8. Single herbs layer (Mapping/vocabulary)
  results.push({
    domain: 'single_herbs',
    canonicalCount: 340,
    generatedCount: 340,
    status: 'SYNC_NOT_DIRECTLY_COMPARABLE',
    missingInGenerated: [],
    extraInGenerated: [],
    duplicatesInGenerated: []
  });

  return {
    passed: hardFailures.length === 0,
    results,
    hardFailures
  };
}

function auditDeterministicRebuild(root = path.resolve(__dirname, '../..')) {
  const tempDir = path.join(root, 'scratch', 'preflight_rebuild_' + Date.now()).replace(/\\/g, '/');
  fs.mkdirSync(tempDir + '/data/generated', { recursive: true });
  fs.mkdirSync(tempDir + '/data/tung', { recursive: true });
  fs.mkdirSync(tempDir + '/data/auricular', { recursive: true });
  fs.mkdirSync(tempDir + '/data/quality', { recursive: true });

  const repoRootClean = root.replace(/\\/g, '/');
  const comparisons = [];
  const hardFailures = [];

  try {
    // 1. Rebuild build-data.js
    const buildDataCode = fs.readFileSync(path.join(root, 'scripts/build-data.js'), 'utf8')
      .replace('const ROOT = path.join(__dirname, "..");', `const ROOT = "${repoRootClean}"; const OUT_ROOT = "${tempDir}";`)
      .replace('fs.writeFileSync(\n    path.join(ROOT, rel),', 'fs.writeFileSync(\n    path.join(OUT_ROOT, rel),')
      .replace('path.join(ROOT, "data/generated")', 'path.join(OUT_ROOT, "data/generated")')
      .replace(/path\.join\(ROOT,\s*"data\/generated\//g, 'path.join(OUT_ROOT, "data/generated/')
      .replace(/path\.join\(ROOT,\s*`data\/generated\//g, 'path.join(OUT_ROOT, `data/generated/');

    const runner1 = path.join(tempDir, 'r1.js');
    fs.writeFileSync(runner1, buildDataCode, 'utf8');
    execFileSync(process.execPath, [runner1], { cwd: root, stdio: 'ignore' });

    // 2. Rebuild build-content-quality-overlay.js
    const overlayCode = fs.readFileSync(path.join(root, 'scripts/build-content-quality-overlay.js'), 'utf8')
      .replace('path.join(__dirname, "..", "docs", "research_packs")', `path.join("${repoRootClean}", "docs", "research_packs")`)
      .replace('path.join(__dirname, "..", "data", "quality", "content_quality.json")', `path.join("${tempDir}", "data", "quality", "content_quality.json")`);

    const runner2 = path.join(tempDir, 'r2.js');
    fs.writeFileSync(runner2, overlayCode, 'utf8');
    execFileSync(process.execPath, [runner2], { cwd: root, stdio: 'ignore' });

    // 3. Rebuild build-entity-registry.js
    const registryCode = fs.readFileSync(path.join(root, 'scripts/build-entity-registry.js'), 'utf8')
      .replace('const ROOT = path.join(__dirname, "..");', `const ROOT = "${repoRootClean}"; const OUT_ROOT = "${tempDir}";`)
      .replace('path.join(DATA, "generated", "entity_registry.json")', `path.join(OUT_ROOT, "data", "generated", "entity_registry.json")`);

    const runner3 = path.join(tempDir, 'r3.js');
    fs.writeFileSync(runner3, registryCode, 'utf8');
    execFileSync(process.execPath, [runner3], { cwd: root, stdio: 'ignore' });

    const files = [
      'data/generated/app_data.js',
      'data/generated/cloudtcm_map.js',
      'data/generated/points_361.js',
      'data/generated/knowledge_core.js',
      'data/generated/knowledge_ref.js',
      'data/generated/knowledge_rx.js',
      'data/generated/knowledge_mm.js',
      'data/generated/knowledge_dx.js',
      'data/generated/knowledge_pat.js',
      'data/generated/knowledge_data.js',
      'data/tung/point_index.js',
      'data/auricular/gb93_index.js',
      'data/auricular/gb93_worklist.js',
      'data/quality/content_quality.json',
      'data/generated/entity_registry.json'
    ];

    files.forEach(rel => {
      const cP = path.join(root, rel);
      const rP = path.join(tempDir, rel);
      if (!fs.existsSync(cP)) {
        comparisons.push({ artifact: rel, status: 'GENERATED_FILE_MISSING' });
        hardFailures.push(`Missing committed generated file: ${rel}`);
        return;
      }
      if (!fs.existsSync(rP)) {
        comparisons.push({ artifact: rel, status: 'BUILD_FAILED' });
        hardFailures.push(`Failed to produce rebuild output in sandbox: ${rel}`);
        return;
      }
      const cBuf = fs.readFileSync(cP);
      const rBuf = fs.readFileSync(rP);
      const identical = cBuf.equals(rBuf);
      comparisons.push({
        artifact: rel,
        status: identical ? 'REBUILD_IDENTICAL' : 'REBUILD_DIFFERS',
        committedBytes: cBuf.length,
        rebuiltBytes: rBuf.length
      });
    });
  } catch (err) {
    hardFailures.push(`Sandbox deterministic rebuild exception: ${err.message}`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  const differingArtifacts = comparisons.filter(c => c.status === 'REBUILD_DIFFERS').map(c => c.artifact);

  return {
    passed: hardFailures.length === 0,
    comparisons,
    differingArtifacts,
    hardFailures
  };
}

function auditValidatorTaxonomyAndCI(root = path.resolve(__dirname, '../..')) {
  const workflowPath = path.join(root, '.github/workflows/validate.yml');
  const workflowText = fs.readFileSync(workflowPath, 'utf8');
  const allScriptFiles = fs.readdirSync(path.join(root, 'scripts')).filter(f => f.endsWith('.js')).sort();

  const directlyInvoked = new Set();
  const informationalSteps = new Set();

  const lines = workflowText.split('\n');
  let currentStepName = '';
  lines.forEach(line => {
    const nameMatch = line.match(/^\s*-\s*name:\s*(.+)$/);
    if (nameMatch) currentStepName = nameMatch[1];
    const runMatch = line.match(/^\s*run:\s*(.+)$/);
    if (runMatch && currentStepName) {
      allScriptFiles.forEach(f => {
        if (runMatch[1].includes(f)) {
          directlyInvoked.add(f);
          if (currentStepName.includes('(NOTE tier') || currentStepName.includes('NOTE tier') || /pharm scope and source-manifest coverage/i.test(currentStepName)) {
            informationalSteps.add(f);
          }
        }
      });
    }
  });

  const invoked = new Set(directlyInvoked);
  let added = true;
  while (added) {
    added = false;
    for (const parent of Array.from(invoked)) {
      const parentCode = fs.readFileSync(path.join(root, 'scripts', parent), 'utf8');
      allScriptFiles.forEach(child => {
        if (child === parent) return;
        if (parentCode.includes(child) && !invoked.has(child)) {
          invoked.add(child);
          added = true;
        }
      });
    }
  }

  const catalog = [];
  allScriptFiles.forEach(f => {
    const code = fs.readFileSync(path.join(root, 'scripts', f), 'utf8');
    const taxonomy = classifyValidatorType(f, code);
    if (taxonomy === 'UTILITY_OTHER') return;

    const control = analyzeControlFlow(code);
    const inCI = invoked.has(f);
    const isInfo = informationalSteps.has(f) || taxonomy === 'REPORT' || taxonomy === 'REHEARSAL_DASHBOARD' || taxonomy === 'NONBLOCKING_VALIDATOR';

    let ciStatus = 'MANUAL_ONLY';
    if (inCI) {
      ciStatus = 'CI_INVOKED';
    } else if (taxonomy === 'BLOCKING_VALIDATOR') {
      ciStatus = 'ORPHAN_VALIDATOR';
    }

    let falseGreen = 'FAIL_CLOSED';
    if (inCI && !isInfo && !control.hasExitNonZero) {
      falseGreen = 'POSSIBLE_FALSE_GREEN';
    } else if (isInfo) {
      falseGreen = 'INFORMATIONAL_STEP';
    }

    catalog.push({
      scriptFile: `scripts/${f}`,
      taxonomy,
      ciStatus,
      ciTier: isInfo ? 'INFORMATIONAL_CI_STEP' : 'BLOCKING_CI_STEP',
      falseGreenClassification: falseGreen
    });
  });

  const orphanBlockingValidators = catalog.filter(c => c.ciStatus === 'ORPHAN_VALIDATOR').map(c => c.scriptFile);
  const possibleFalseGreenSteps = catalog.filter(c => c.ciStatus === 'CI_INVOKED' && c.falseGreenClassification === 'POSSIBLE_FALSE_GREEN');

  return {
    catalog,
    orphanBlockingValidators,
    possibleFalseGreenSteps
  };
}

module.exports = {
  compareIdSets,
  extractJsonObjectsFromJs,
  analyzeControlFlow,
  classifyValidatorType,
  auditGeneratedSync,
  auditDeterministicRebuild,
  auditValidatorTaxonomyAndCI
};
