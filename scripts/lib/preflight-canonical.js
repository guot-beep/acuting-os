/**
 * scripts/lib/preflight-canonical.js
 *
 * Full Task 9B deterministic canonical integrity engine:
 * - Exact ID duplicates (EXACT_ID_DUPLICATE)
 * - Whitespace-normalized ID collisions (WHITESPACE_NORMALIZED_ID_COLLISION)
 * - Case-normalized ID collisions (CASE_NORMALIZED_ID_COLLISION)
 * - Exact Chinese/English name collisions
 * - Normalized Chinese/English name collisions
 * - Alias collisions (ALIAS_TO_MULTIPLE_CANONICAL, ALIAS_COLLIDES_WITH_CANONICAL_NAME, ALIAS_SELF_DUPLICATE)
 * - Possible duplicate heuristics (POSSIBLE_DUPLICATE warning/inventory only)
 * - Import stub inventory & Deprecated inventory
 * - Structured references cross-registry (TARGET_EXISTS_ACTIVE, TARGET_EXISTS_DEPRECATED, TARGET_EXISTS_IMPORT_STUB, TARGET_MISSING)
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

function auditNameCollisions(records, entityType) {
  const byExactZh = new Map();
  const byExactEn = new Map();
  const byNormZh = new Map();
  const byNormEn = new Map();

  records.forEach(r => {
    const id = (r.id || r.code || '').trim();
    const nZh = (r.name_zh || '').trim();
    const nEn = (r.name_en || '').trim();

    if (nZh) {
      if (!byExactZh.has(nZh)) byExactZh.set(nZh, []);
      byExactZh.get(nZh).push(id);

      const nzh = normZh(nZh);
      if (!byNormZh.has(nzh)) byNormZh.set(nzh, []);
      byNormZh.get(nzh).push({ id, raw: nZh });
    }

    if (nEn) {
      if (!byExactEn.has(nEn)) byExactEn.set(nEn, []);
      byExactEn.get(nEn).push(id);

      const nen = normEn(nEn);
      if (!byNormEn.has(nen)) byNormEn.set(nen, []);
      byNormEn.get(nen).push({ id, raw: nEn });
    }
  });

  const exactZhCollisions = [];
  const exactEnCollisions = [];
  const normZhCollisions = [];
  const normEnCollisions = [];

  for (const [name, ids] of byExactZh.entries()) {
    if (ids.length > 1) exactZhCollisions.push({ name_zh: name, recordIds: ids, entityType });
  }

  for (const [name, ids] of byExactEn.entries()) {
    if (ids.length > 1) exactEnCollisions.push({ name_en: name, recordIds: ids, entityType });
  }

  for (const [norm, items] of byNormZh.entries()) {
    const uniqueIds = Array.from(new Set(items.map(i => i.id)));
    if (uniqueIds.length > 1) {
      const rawNames = Array.from(new Set(items.map(i => i.raw)));
      if (rawNames.length > 1) {
        normZhCollisions.push({ normalized_zh: norm, rawNames, recordIds: uniqueIds, entityType });
      }
    }
  }

  for (const [norm, items] of byNormEn.entries()) {
    const uniqueIds = Array.from(new Set(items.map(i => i.id)));
    if (uniqueIds.length > 1) {
      const rawNames = Array.from(new Set(items.map(i => i.raw)));
      if (rawNames.length > 1) {
        normEnCollisions.push({ normalized_en: norm, rawNames, recordIds: uniqueIds, entityType });
      }
    }
  }

  return { exactZhCollisions, exactEnCollisions, normZhCollisions, normEnCollisions };
}

function auditAliasCollisions(records, entityType) {
  const aliasToRecords = new Map();
  const canonNamesZh = new Map();
  const canonNamesEn = new Map();

  records.forEach(r => {
    const id = (r.id || r.code || '').trim();
    const nZh = (r.name_zh || '').trim();
    const nEn = (r.name_en || '').trim();
    // A properly-documented retirement (review_status: deprecated + a deprecated_note_zh
    // audit trail, e.g. D21) legitimately lets the surviving sibling record adopt the
    // retired record's old name as an alias — that is the merge working as designed, not
    // a naming collision. Only exempt fully-documented retirements; an undocumented
    // deprecated record still counts as canonical so it keeps getting flagged.
    const isDocumentedRetirement = r.review_status === 'deprecated' && !!(r.deprecated_note_zh || '').trim();
    if (isDocumentedRetirement) return;
    if (nZh) canonNamesZh.set(nZh, id);
    if (nEn) canonNamesEn.set(nEn.toLowerCase(), id);
  });

  const aliasToMultiple = [];
  const aliasCollidesWithCanon = [];
  const aliasSelfDuplicates = [];

  records.forEach(r => {
    const id = (r.id || r.code || '').trim();
    const nZh = (r.name_zh || '').trim();
    const nEn = (r.name_en || '').trim();

    const aliases = [];
    ['aliases', 'aliases_zh', 'aliases_en', 'alternate_names'].forEach(k => {
      const val = r[k];
      if (Array.isArray(val)) {
        val.forEach(a => { if (typeof a === 'string' && a.trim()) aliases.push(a.trim()); });
      } else if (typeof val === 'string' && val.trim()) {
        aliases.push(val.trim());
      }
    });

    const uniqueRecordAliases = Array.from(new Set(aliases));

    uniqueRecordAliases.forEach(a => {
      if (a === nZh || (nEn && a.toLowerCase() === nEn.toLowerCase())) {
        aliasSelfDuplicates.push({
          recordId: id,
          entityType,
          alias: a,
          canonicalName: a === nZh ? nZh : nEn
        });
      }

      if (!aliasToRecords.has(a)) aliasToRecords.set(a, new Set());
      aliasToRecords.get(a).add(id);
    });
  });

  for (const [alias, idSet] of aliasToRecords.entries()) {
    const idList = Array.from(idSet);
    if (idList.length > 1) {
      aliasToMultiple.push({
        alias,
        entityType,
        recordIds: idList
      });
    }

    const ownerZh = canonNamesZh.get(alias);
    const ownerEn = canonNamesEn.get(alias.toLowerCase());
    const canonOwner = ownerZh || ownerEn;

    if (canonOwner) {
      const otherCitingIds = idList.filter(rid => rid !== canonOwner);
      if (otherCitingIds.length > 0) {
        aliasCollidesWithCanon.push({
          alias,
          entityType,
          canonicalOwnerId: canonOwner,
          referencingRecordIds: otherCitingIds
        });
      }
    }
  }

  return { aliasToMultiple, aliasCollidesWithCanon, aliasSelfDuplicates };
}

function findPossibleDuplicates(records, entityType) {
  const possibleDuplicates = [];
  const n = records.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const r1 = records[i];
      const r2 = records[j];
      const id1 = (r1.id || r1.code || '').trim();
      const id2 = (r2.id || r2.code || '').trim();

      const nZh1 = (r1.name_zh || '').trim();
      const nZh2 = (r2.name_zh || '').trim();
      const nEn1 = (r1.name_en || '').trim();
      const nEn2 = (r2.name_en || '').trim();
      const pin1 = (r1.pinyin || '').trim().toLowerCase();
      const pin2 = (r2.pinyin || '').trim().toLowerCase();

      const aliases1 = new Set((r1.aliases || []).concat(r1.aliases_zh || []).concat(r1.aliases_en || []).map(a => String(a).trim().toLowerCase()));
      const aliases2 = new Set((r2.aliases || []).concat(r2.aliases_zh || []).concat(r2.aliases_en || []).map(a => String(a).trim().toLowerCase()));

      let matchingEvidence = [];
      let whyFlagged = [];

      if (normZh(nZh1) && normZh(nZh1) === normZh(nZh2)) {
        if (normEn(nEn1) && normEn(nEn1) === normEn(nEn2)) {
          matchingEvidence.push(`Same normalized Chinese name (${nZh1}) and English name (${nEn1})`);
          whyFlagged.push('EXACT_BILINGUAL_NAME_MATCH');
        } else if (pin1 && pin1 === pin2) {
          matchingEvidence.push(`Same normalized Chinese name (${nZh1}) and Pinyin (${pin1})`);
          whyFlagged.push('EXACT_PINYIN_CHINESE_NAME_MATCH');
        }
      }

      const isStub1 = id1.includes('_import_stub');
      const isStub2 = id2.includes('_import_stub');
      if ((isStub1 || isStub2) && !(isStub1 && isStub2)) {
        const cleanBase1 = id1.replace('_import_stub', '').replace('formula.', '').replace('herb.', '');
        const cleanBase2 = id2.replace('_import_stub', '').replace('formula.', '').replace('herb.', '');
        if (cleanBase1 === cleanBase2 || (normZh(nZh1) && normZh(nZh1).includes(normZh(nZh2))) || (normZh(nZh2) && normZh(nZh2).includes(normZh(nZh1)))) {
          matchingEvidence.push(`Import stub (${isStub1 ? id1 : id2}) matches active canonical record (${isStub1 ? id2 : id1})`);
          whyFlagged.push('IMPORT_STUB_CORRESPONDENCE');
        }
      }

      const commonAliases = [];
      for (const a of aliases1) {
        if (a && aliases2.has(a)) commonAliases.push(a);
      }
      if (commonAliases.length >= 2) {
        matchingEvidence.push(`Share 2+ identical aliases: ${commonAliases.join(', ')}`);
        whyFlagged.push('SUBSTANTIAL_ALIAS_OVERLAP');
      }

      if (matchingEvidence.length > 0) {
        possibleDuplicates.push({
          recordIds: [id1, id2],
          entityType,
          names: [{ id: id1, name_zh: nZh1, name_en: nEn1 }, { id: id2, name_zh: nZh2, name_en: nEn2 }],
          exactMatchingEvidence: matchingEvidence.join('; '),
          whyFlagged: whyFlagged.join('; ')
        });
      }
    }
  }

  return possibleDuplicates;
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
  // 2026-08-26 fix (independent audit of Task 9D, see docs/ANTIGRAVITY_HANDOFF.md):
  // caseCollisions was computed above but never checked here — a herb/formula ID
  // differing only by letter case is exactly the kind of silent-misroute risk this
  // module's own docstring (line 7, CASE_NORMALIZED_ID_COLLISION) says it covers.
  if (herbCollisions.caseCollisions.length > 0) {
    herbCollisions.caseCollisions.forEach(c => hardFailures.push(`Case collision in herbs: ${c.rawId1} vs ${c.rawId2}`));
  }
  if (formulaCollisions.caseCollisions.length > 0) {
    formulaCollisions.caseCollisions.forEach(c => hardFailures.push(`Case collision in formulas: ${c.rawId1} vs ${c.rawId2}`));
  }

  // 2. Name Collisions
  const herbNameCollisions = auditNameCollisions(herbs, 'herb');
  const formulaNameCollisions = auditNameCollisions(formulas, 'formula');
  // 2026-08-26 fix: same gap as above — two DIFFERENT records sharing the exact
  // same (or same-after-normalization) canonical name is a genuine identity
  // collision (a name-based lookup would silently resolve to the wrong record),
  // not just an inventory item. Was computed and returned in the report but never
  // reached hardFailures, so a real collision would not have failed the gate.
  [herbNameCollisions, formulaNameCollisions].forEach((nc) => {
    nc.exactZhCollisions.forEach(c => hardFailures.push(`Exact Chinese name collision (${c.entityType}): "${c.name_zh}" shared by ${c.recordIds.join(', ')}`));
    nc.exactEnCollisions.forEach(c => hardFailures.push(`Exact English name collision (${c.entityType}): "${c.name_en}" shared by ${c.recordIds.join(', ')}`));
    nc.normZhCollisions.forEach(c => hardFailures.push(`Normalized Chinese name collision (${c.entityType}): ${c.rawNames.join(' / ')} shared by ${c.recordIds.join(', ')}`));
    nc.normEnCollisions.forEach(c => hardFailures.push(`Normalized English name collision (${c.entityType}): ${c.rawNames.join(' / ')} shared by ${c.recordIds.join(', ')}`));
  });

  // 3. Alias Collisions
  const herbAliasCollisions = auditAliasCollisions(herbs, 'herb');
  const formulaAliasCollisions = auditAliasCollisions(formulas, 'formula');
  // 2026-08-26 fix: same gap — an alias resolving to 2+ different records
  // (ALIAS_TO_MULTIPLE_CANONICAL) or shadowing another record's canonical name
  // (ALIAS_COLLIDES_WITH_CANONICAL_NAME) is exactly the ambiguous-lookup risk
  // this module's docstring (line 10) says it covers; aliasSelfDuplicates (a
  // record listing its own name as its own alias) is harmless redundancy, not a
  // collision, so it stays informational only — surfaced via `warnings` below
  // instead of failing the gate.
  [herbAliasCollisions, formulaAliasCollisions].forEach((ac) => {
    ac.aliasToMultiple.forEach(c => hardFailures.push(`Alias "${c.alias}" (${c.entityType}) resolves to multiple records: ${c.recordIds.join(', ')}`));
    ac.aliasCollidesWithCanon.forEach(c => hardFailures.push(`Alias "${c.alias}" (${c.entityType}) on ${c.referencingRecordIds.join(', ')} collides with ${c.canonicalOwnerId}'s canonical name`));
    ac.aliasSelfDuplicates.forEach(c => warnings.push(`${c.recordId} (${c.entityType}) lists its own canonical name "${c.alias}" as an alias — harmless but redundant`));
  });

  // 4. Possible Duplicates (Warning / Inventory Only)
  const herbPossibleDuplicates = findPossibleDuplicates(herbs, 'herb');
  const formulaPossibleDuplicates = findPossibleDuplicates(formulas, 'formula');

  // 5. Structured Reference Scanner (Full Task 9B Semantics)
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

  const deprecatedHerbs = herbs.filter(h => h.review_status === 'deprecated' || h.is_deprecated);
  const deprecatedFormulas = formulas.filter(f => f.review_status === 'deprecated' || f.is_deprecated);
  const importStubsHerbs = herbs.filter(h => h.is_import_stub || (h.id && h.id.includes('_import_stub')));
  const importStubsFormulas = formulas.filter(f => f.is_import_stub || (f.id && f.id.includes('_import_stub')));

  return {
    passed: hardFailures.length === 0,
    hardFailures,
    warnings,
    exactDuplicateCount: herbCollisions.exactDups.length + formulaCollisions.exactDups.length,
    whitespaceCollisionCount: herbCollisions.wsCollisions.length + formulaCollisions.wsCollisions.length,
    caseCollisionCount: herbCollisions.caseCollisions.length + formulaCollisions.caseCollisions.length,
    nameCollisions: {
      herbs: herbNameCollisions,
      formulas: formulaNameCollisions
    },
    aliasCollisions: {
      herbs: herbAliasCollisions,
      formulas: formulaAliasCollisions
    },
    possibleDuplicates: {
      herbs: herbPossibleDuplicates,
      formulas: formulaPossibleDuplicates
    },
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
  auditNameCollisions,
  auditAliasCollisions,
  findPossibleDuplicates,
  normalizeIdWhitespace,
  normalizeIdCase,
  normalizeIdWhitespaceAndCase,
  normZh,
  normEn
};
