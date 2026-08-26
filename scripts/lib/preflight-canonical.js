/**
 * scripts/lib/preflight-canonical.js
 *
 * Task 9B deterministic canonical integrity: duplicate IDs, whitespace/case collisions,
 * import stubs, deprecated inventory, and orphan references.
 */

const fs = require('fs');
const path = require('path');

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

  const herbsData = JSON.parse(fs.readFileSync(herbsPath, 'utf8')).records || [];
  const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8')).records || [];

  const hardFailures = [];
  const warnings = [];

  // 1. ID Duplicates & Collisions
  function scanCollisions(records, entityType) {
    const rawIds = new Map();
    const wsMap = new Map();
    const caseMap = new Map();
    const fullNormMap = new Map();

    const exactDups = [];
    const wsCollisions = [];
    const caseCollisions = [];

    records.forEach(r => {
      const id = r.id;
      if (!id) return;

      // Exact Duplicate (Raw)
      if (rawIds.has(id)) {
        exactDups.push({ id, first: rawIds.get(id), current: r });
      } else {
        rawIds.set(id, r);
      }

      // Whitespace normalized collision
      const wsKey = normalizeIdWhitespace(id);
      if (wsMap.has(wsKey) && wsMap.get(wsKey).id !== id) {
        wsCollisions.push({ rawId1: wsMap.get(wsKey).id, rawId2: id, normalized: wsKey });
      } else {
        wsMap.set(wsKey, r);
      }

      // Case normalized collision
      const caseKey = normalizeIdCase(id);
      if (caseMap.has(caseKey) && caseMap.get(caseKey).id !== id) {
        caseCollisions.push({ rawId1: caseMap.get(caseKey).id, rawId2: id, normalized: caseKey });
      } else {
        caseMap.set(caseKey, r);
      }
    });

    return { exactDups, wsCollisions, caseCollisions };
  }

  const herbCollisions = scanCollisions(herbsData, 'herb');
  const formulaCollisions = scanCollisions(formulasData, 'formula');

  // Hard Invariant: Exact ID duplicates are fatal
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

  // 2. Import Stubs & Deprecated Records
  const deprecatedHerbs = herbsData.filter(h => h.review_status === 'deprecated' || h.is_deprecated);
  const deprecatedFormulas = formulasData.filter(f => f.review_status === 'deprecated' || f.is_deprecated);
  const importStubsHerbs = herbsData.filter(h => h.is_import_stub || h.review_status === 'import_stub');
  const importStubsFormulas = formulasData.filter(f => f.is_import_stub || f.review_status === 'import_stub');

  const totalDeprecated = deprecatedHerbs.length + deprecatedFormulas.length;
  const totalImportStubs = importStubsHerbs.length + importStubsFormulas.length;

  // 3. Orphan References
  const allHerbIds = new Set(herbsData.map(h => h.id));
  const orphanReferences = [];

  formulasData.forEach(f => {
    if (Array.isArray(f.composition)) {
      f.composition.forEach(comp => {
        if (comp.herb_id && comp.herb_id !== 'pending' && !allHerbIds.has(comp.herb_id)) {
          orphanReferences.push({
            sourceFile: 'data/herbs/formulas.json',
            sourceEntityId: f.id,
            targetId: comp.herb_id,
            relationType: 'formula.composition -> herb_id'
          });
        }
      });
    }
  });

  return {
    passed: hardFailures.length === 0,
    hardFailures,
    exactDuplicateCount: herbCollisions.exactDups.length + formulaCollisions.exactDups.length,
    whitespaceCollisionCount: herbCollisions.wsCollisions.length + formulaCollisions.wsCollisions.length,
    caseCollisionCount: herbCollisions.caseCollisions.length + formulaCollisions.caseCollisions.length,
    deprecatedRecordCount: totalDeprecated,
    importStubCount: totalImportStubs,
    orphanReferencesCount: orphanReferences.length,
    orphanReferences
  };
}

module.exports = {
  auditCanonicalIntegrity,
  normalizeIdWhitespace,
  normalizeIdCase,
  normalizeIdWhitespaceAndCase
};
