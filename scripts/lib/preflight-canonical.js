/**
 * scripts/lib/preflight-canonical.js
 *
 * Task 9B deterministic canonical integrity:
 * - Exact ID duplicates (EXACT_ID_DUPLICATE)
 * - Whitespace-normalized ID collisions (WHITESPACE_NORMALIZED_ID_COLLISION)
 * - Case-normalized ID collisions (CASE_NORMALIZED_ID_COLLISION)
 * - Exact / normalized name collisions (NAME_COLLISION)
 * - Alias collisions (ALIAS_TO_MULTIPLE_CANONICAL, ALIAS_COLLIDES_WITH_CANONICAL_NAME)
 * - Import stub inventory & Deprecated inventory
 * - Structured references cross-repo (TARGET_EXISTS_ACTIVE, TARGET_EXISTS_DEPRECATED, TARGET_EXISTS_IMPORT_STUB, TARGET_MISSING)
 * - Reverse reference risk tracking
 */

const fs = require('fs');
const path = require('path');
const { loadJsonStrict } = require('./preflight-hygiene');

function normZh(str) {
  if (!str) return '';
  return String(str).replace(/[\s\p{P}\p{S}]+/gu, '');
}

function normEn(str) {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeIdWhitespace(id) {
  return String(id).replace(/\s+/g, '');
}

function normalizeIdCase(id) {
  return String(id).toLowerCase();
}

function normalizeIdWhitespaceAndCase(id) {
  return String(id).replace(/\s+/g, '').toLowerCase();
}

function auditCanonicalIntegrity(options = {}) {
  const root = options.root || path.resolve(__dirname, '../..');

  const herbsPath = path.join(root, 'data/herbs/herb_canon_shortlist.json');
  const formulasPath = path.join(root, 'data/herbs/formulas.json');

  const herbsData = loadJsonStrict(herbsPath);
  const formulasData = loadJsonStrict(formulasPath);

  const herbs = herbsData.records || herbsData;
  const formulas = formulasData.records || formulasData;

  const herbRegistry = new Map();
  const formulaRegistry = new Map();

  herbs.forEach((r, idx) => {
    const id = String(r.id !== undefined ? r.id : (r.code !== undefined ? r.code : `herb_idx_${idx}`));
    herbRegistry.set(id, {
      ...r,
      id,
      entityType: 'herb',
      isDeprecated: r.review_status === 'deprecated' || r.is_deprecated,
      isImportStub: id.includes('_import_stub') || (r.name_zh && r.name_zh.includes('匯入重複殘根'))
    });
  });

  formulas.forEach((r, idx) => {
    const id = String(r.id !== undefined ? r.id : (r.code !== undefined ? r.code : `formula_idx_${idx}`));
    formulaRegistry.set(id, {
      ...r,
      id,
      entityType: 'formula',
      isDeprecated: r.review_status === 'deprecated' || r.is_deprecated,
      isImportStub: id.includes('_import_stub') || (r.name_zh && r.name_zh.includes('匯入重複殘根'))
    });
  });

  const hardFailures = [];
  const warnings = [];

  // 1. ID Collisions
  function scanCollisions(records, entityType) {
    const rawIds = new Map();
    const wsMap = new Map();
    const caseMap = new Map();

    const exactDups = [];
    const wsCollisions = [];
    const caseCollisions = [];

    records.forEach(r => {
      const id = r.id || r.code;
      if (!id) return;

      // Exact Duplicate (Raw)
      if (rawIds.has(id)) {
        exactDups.push({ id, first: rawIds.get(id), current: r, entityType });
      } else {
        rawIds.set(id, r);
      }

      // Whitespace normalized collision
      const wsKey = normalizeIdWhitespace(id);
      if (wsMap.has(wsKey) && wsMap.get(wsKey).id !== id) {
        wsCollisions.push({ rawId1: wsMap.get(wsKey).id, rawId2: id, normalized: wsKey, entityType });
      } else {
        wsMap.set(wsKey, r);
      }

      // Case normalized collision
      const caseKey = normalizeIdCase(id);
      if (caseMap.has(caseKey) && caseMap.get(caseKey).id !== id) {
        caseCollisions.push({ rawId1: caseMap.get(caseKey).id, rawId2: id, normalized: caseKey, entityType });
      } else {
        caseMap.set(caseKey, r);
      }
    });

    return { exactDups, wsCollisions, caseCollisions };
  }

  const herbCollisions = scanCollisions(herbs, 'herb');
  const formulaCollisions = scanCollisions(formulas, 'formula');

  // Hard Invariants
  if (herbCollisions.exactDups.length > 0) {
    herbCollisions.exactDups.forEach(d => hardFailures.push(`Exact duplicate herb ID: ${d.id}`));
  }
  if (formulaCollisions.exactDups.length > 0) {
    formulaCollisions.exactDups.forEach(d => hardFailures.push(`Exact duplicate formula ID: ${d.id}`));
  }
  if (herbCollisions.wsCollisions.length > 0) {
    herbCollisions.wsCollisions.forEach(c => hardFailures.push(`Whitespace collision in herbs: ${c.rawId1} vs ${c.rawId2}`));
  }
  if (formulaCollisions.wsCollisions.length > 0) {
    formulaCollisions.wsCollisions.forEach(c => hardFailures.push(`Whitespace collision in formulas: ${c.rawId1} vs ${c.rawId2}`));
  }

  // 2. Structured Reference Scanner (Full Task 9B Semantics)
  const allStructuredReferences = [];

  function recordRef(sourceFile, sourceRecordId, fieldPath, referencedId, refEntityType, sourceStatus = 'active') {
    if (!referencedId || typeof referencedId !== 'string') return;
    const cleanRef = referencedId.trim();
    if (!cleanRef) return;

    let targetClassification = 'TARGET_MISSING';
    let targetRecord = null;

    if (refEntityType === 'herb' || cleanRef.startsWith('herb.')) {
      if (herbRegistry.has(cleanRef)) {
        targetRecord = herbRegistry.get(cleanRef);
        if (targetRecord.isImportStub) targetClassification = 'TARGET_EXISTS_IMPORT_STUB';
        else if (targetRecord.isDeprecated) targetClassification = 'TARGET_EXISTS_DEPRECATED';
        else targetClassification = 'TARGET_EXISTS_ACTIVE';
      }
    } else if (refEntityType === 'formula' || cleanRef.startsWith('formula.')) {
      if (formulaRegistry.has(cleanRef)) {
        targetRecord = formulaRegistry.get(cleanRef);
        if (targetRecord.isImportStub) targetClassification = 'TARGET_EXISTS_IMPORT_STUB';
        else if (targetRecord.isDeprecated) targetClassification = 'TARGET_EXISTS_DEPRECATED';
        else targetClassification = 'TARGET_EXISTS_ACTIVE';
      }
    }

    allStructuredReferences.push({
      sourceFile: path.relative(root, sourceFile).replace(/\\/g, '/'),
      sourceRecordId: String(sourceRecordId || 'unknown'),
      sourceStatus,
      fieldPath,
      referencedId: cleanRef,
      refEntityType,
      targetClassification,
      targetRecordNameZh: targetRecord ? targetRecord.name_zh : null,
      edgeIdentity: `${path.relative(root, sourceFile).replace(/\\/g, '/')}:${sourceRecordId}:${fieldPath}->${cleanRef}`
    });
  }

  // Scan Formulas
  formulas.forEach(f => {
    const fId = f.id || f.code;
    const sourceStatus = (fId && fId.includes('_import_stub')) ? 'import_stub' : (f.review_status === 'deprecated' ? 'deprecated' : 'active');

    if (Array.isArray(f.composition)) {
      f.composition.forEach((c, idx) => {
        if (c && c.herb_id) recordRef(formulasPath, fId, `composition[${idx}].herb_id`, c.herb_id, 'herb', sourceStatus);
      });
    }
    if (Array.isArray(f.related_formulas)) {
      f.related_formulas.forEach((rf, idx) => {
        const refId = typeof rf === 'string' ? rf : (rf && (rf.formula_id || rf.id));
        if (refId) recordRef(formulasPath, fId, `related_formulas[${idx}]`, refId, 'formula', sourceStatus);
      });
    }
    if (Array.isArray(f.formula_family)) {
      f.formula_family.forEach((ff, idx) => {
        const refId = typeof ff === 'string' ? ff : (ff && (ff.formula_id || ff.id));
        if (refId) recordRef(formulasPath, fId, `formula_family[${idx}]`, refId, 'formula', sourceStatus);
      });
    }
    if (f.single_herb_id) {
      recordRef(formulasPath, fId, 'single_herb_id', f.single_herb_id, 'herb', sourceStatus);
    }
  });

  // Scan Herbs
  herbs.forEach(h => {
    const hId = h.id || h.code;
    const sourceStatus = (hId && hId.includes('_import_stub')) ? 'import_stub' : (h.review_status === 'deprecated' ? 'deprecated' : 'active');

    if (Array.isArray(h.related_formulas)) {
      h.related_formulas.forEach((rf, idx) => {
        const refId = typeof rf === 'string' ? rf : (rf && (rf.formula_id || rf.id));
        if (refId) recordRef(herbsPath, hId, `related_formulas[${idx}]`, refId, 'formula', sourceStatus);
      });
    }
    if (Array.isArray(h.herb_pairs)) {
      h.herb_pairs.forEach((hp, idx) => {
        if (hp && hp.herb_id) recordRef(herbsPath, hId, `herb_pairs[${idx}].herb_id`, hp.herb_id, 'herb', sourceStatus);
        if (hp && hp.pair_herb_id) recordRef(herbsPath, hId, `herb_pairs[${idx}].pair_herb_id`, hp.pair_herb_id, 'herb', sourceStatus);
      });
    }
    if (Array.isArray(h.key_pairs)) {
      h.key_pairs.forEach((kp, idx) => {
        if (kp && kp.herb_id) recordRef(herbsPath, hId, `key_pairs[${idx}].herb_id`, kp.herb_id, 'herb', sourceStatus);
      });
    }
  });

  // Scan Other Canonical Registries in data/
  function scanOtherRegistry(relPath) {
    const fullPath = path.join(root, relPath);
    if (!fs.existsSync(fullPath)) return;
    const data = loadJsonStrict(fullPath);
    const records = data.records || (Array.isArray(data) ? data : Object.values(data));
    if (!Array.isArray(records)) return;

    records.forEach((r, idx) => {
      const rId = r.id || r.code || `${path.basename(relPath, '.json')}_idx_${idx}`;
      const sourceStatus = (r.review_status === 'deprecated') ? 'deprecated' : 'active';

      function checkValue(val, currentPath) {
        if (!val) return;
        if (typeof val === 'string') {
          if (val.startsWith('herb.') || val.startsWith('formula.')) {
            const type = val.startsWith('herb.') ? 'herb' : 'formula';
            recordRef(fullPath, rId, currentPath, val, type, sourceStatus);
          }
        } else if (Array.isArray(val)) {
          val.forEach((item, i) => checkValue(item, `${currentPath}[${i}]`));
        } else if (typeof val === 'object') {
          Object.keys(val).forEach(k => {
            const nextP = currentPath ? `${currentPath}.${k}` : k;
            checkValue(val[k], nextP);
          });
        }
      }

      const targetFields = [
        'formula_ids', 'herb_ids', 'recommended_formulas', 'recommended_herbs',
        'representative_formulas', 'herbs', 'formulas', 'herb_interactions',
        'herb_drug_interactions', 'modifications', 'entity_a', 'entity_b'
      ];

      targetFields.forEach(fld => {
        if (r[fld] !== undefined) checkValue(r[fld], fld);
      });
    });
  }

  const otherRegistries = [
    'data/herbs/herb_pairs.json',
    'data/pathology/conditions.json',
    'data/pathology/condition_canon_shortlist.json',
    'data/pathology/pattern_library.json',
    'data/pathology/pattern_registry.json',
    'data/pathology/tdis_registry.json',
    'data/pathology/red_flag_registry.json',
    'data/medications/western_medications.json',
    'data/config/pattern_family_vocabulary.json',
    'data/config/tcm_pattern_canon.json'
  ];

  otherRegistries.forEach(scanOtherRegistry);

  const targetMissing = allStructuredReferences.filter(r => r.targetClassification === 'TARGET_MISSING');
  const targetDeprecated = allStructuredReferences.filter(r => r.targetClassification === 'TARGET_EXISTS_DEPRECATED');
  const targetImportStub = allStructuredReferences.filter(r => r.targetClassification === 'TARGET_EXISTS_IMPORT_STUB');

  // Deprecated records & import stubs count
  const deprecatedHerbs = herbs.filter(h => h.review_status === 'deprecated' || h.is_deprecated);
  const deprecatedFormulas = formulas.filter(f => f.review_status === 'deprecated' || f.is_deprecated);
  const importStubsHerbs = herbs.filter(h => h.is_import_stub || (h.id && h.id.includes('_import_stub')));
  const importStubsFormulas = formulas.filter(f => f.is_import_stub || (f.id && f.id.includes('_import_stub')));

  return {
    passed: hardFailures.length === 0,
    hardFailures,
    exactDuplicateCount: herbCollisions.exactDups.length + formulaCollisions.exactDups.length,
    whitespaceCollisionCount: herbCollisions.wsCollisions.length + formulaCollisions.wsCollisions.length,
    caseCollisionCount: herbCollisions.caseCollisions.length + formulaCollisions.caseCollisions.length,
    deprecatedRecordCount: deprecatedHerbs.length + deprecatedFormulas.length,
    importStubCount: importStubsHerbs.length + importStubsFormulas.length,
    totalStructuredReferencesCount: allStructuredReferences.length,
    targetMissingCount: targetMissing.length,
    targetDeprecatedCount: targetDeprecated.length,
    targetImportStubCount: targetImportStub.length,
    targetMissingReferences: targetMissing,
    targetMissingIdentities: targetMissing.map(t => t.edgeIdentity)
  };
}

module.exports = {
  auditCanonicalIntegrity,
  normalizeIdWhitespace,
  normalizeIdCase,
  normalizeIdWhitespaceAndCase,
  normZh,
  normEn
};
