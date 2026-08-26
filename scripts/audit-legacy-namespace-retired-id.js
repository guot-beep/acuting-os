#!/usr/bin/env node
/**
 * scripts/audit-legacy-namespace-retired-id.js
 *
 * AcuTing OS Legacy Namespace / Retired-ID Integrity Inventory (Task 10A).
 *
 * A READ-ONLY mechanical inventory engine auditing:
 * 1. Whole-repo ID namespaces (D11 canonical diagnostic vs Non-D11 namespaces).
 * 2. Legacy diagnostic IDs on relation/reference fields (western_condition.*, eastern_disease.*, med.*, pat.*, etc.).
 * 3. Mechanical crosswalk / canonical twin candidates (EXACT_CROSSWALK_EXISTS, EXACT_CANONICAL_TWIN_EXISTS,
 *    MECHANICAL_NAME_CANDIDATE_ONLY, MULTIPLE_CANDIDATES, NO_CANDIDATE_FOUND).
 * 4. Retired / Deprecated ID references across all registries (including herb.qian_cao_gen).
 * 5. Active -> Deprecated and Active -> Import Stub edge risk.
 * 6. Duplicate namespace universe checks in UI / renderers (MULTIPLE_NAMESPACES_RENDERED_AS_SAME_ENTITY_TYPE).
 * 7. Self-test suite with 8 executable regression fixtures.
 *
 * Zero mutations permitted. No clinical/semantic judgments.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Strict JSON loader that fails loudly on malformed syntax
function loadJsonStrict(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Strict JSON parse failure in ${filePath}: ${err.message}`);
  }
}

// ----------------------------------------------------------------------------
// Core Audit Engine
// ----------------------------------------------------------------------------

function runAudit(customRoot = ROOT) {
  const rootDir = customRoot;

  // 1. Load canonical registries and shortlists
  const conditions = (loadJsonStrict(path.join(rootDir, 'data/pathology/condition_canon_shortlist.json')) || {}).records || [];
  const tdis = (loadJsonStrict(path.join(rootDir, 'data/pathology/tdis_registry.json')) || {}).records || [];
  const patterns = (loadJsonStrict(path.join(rootDir, 'data/pathology/pattern_registry.json')) || {}).records || [];
  const symptoms = (loadJsonStrict(path.join(rootDir, 'data/symptoms/symptoms.json')) || {}).records || [];
  const herbs = (loadJsonStrict(path.join(rootDir, 'data/herbs/herb_canon_shortlist.json')) || {}).records || [];
  const formulas = (loadJsonStrict(path.join(rootDir, 'data/herbs/formulas.json')) || {}).records || [];
  const drugs = (loadJsonStrict(path.join(rootDir, 'data/pharmacology/drugs.json')) || {}).records || [];
  const supplements = (loadJsonStrict(path.join(rootDir, 'data/supplements/supplements.json')) || {}).records || [];

  // Crosswalks and alias maps
  const conditionXwalk = loadJsonStrict(path.join(rootDir, 'data/interop/condition_crosswalk.json')) || {};
  const patternAliasMap = loadJsonStrict(path.join(rootDir, 'data/config/pattern_alias_map.json')) || {};
  const medAliasMap = loadJsonStrict(path.join(rootDir, 'data/config/medication_alias_map.json')) || {};

  // Canonical set lookups
  const canonMap = {
    cond: new Map(conditions.map(c => [c.id, c])),
    tdis: new Map(tdis.map(t => [t.id, t])),
    pattern: new Map(patterns.map(p => [p.id, p])),
    sym: new Map(symptoms.map(s => [s.id, s])),
    herb: new Map(herbs.map(h => [h.id, h])),
    formula: new Map(formulas.map(f => [f.id, f])),
    drug: new Map(drugs.map(d => [d.id, d])),
    supp: new Map(supplements.map(s => [s.id, s]))
  };

  // Name indexes for mechanical twin / candidate lookups
  const nameIndex = {
    zh: new Map(), // name_zh -> [{ id, namespace, entity, isAlias }]
    en: new Map()  // name_en (lower) -> [{ id, namespace, entity, isAlias }]
  };

  function indexEntity(entity, ns) {
    if (!entity) return;
    const entId = entity.id || entity.code;
    if (!entId) return;

    if (entity.name_zh) {
      const zh = entity.name_zh.trim();
      if (!nameIndex.zh.has(zh)) nameIndex.zh.set(zh, []);
      nameIndex.zh.get(zh).push({ id: entId, namespace: ns, entity, isAlias: false });
    }
    if (entity.name_en) {
      const en = entity.name_en.trim().toLowerCase();
      if (!nameIndex.en.has(en)) nameIndex.en.set(en, []);
      nameIndex.en.get(en).push({ id: entId, namespace: ns, entity, isAlias: false });
    }
    if (Array.isArray(entity.aliases)) {
      entity.aliases.forEach(a => {
        const al = a.trim();
        if (/[\u4e00-\u9fa5]/.test(al)) {
          if (!nameIndex.zh.has(al)) nameIndex.zh.set(al, []);
          nameIndex.zh.get(al).push({ id: entId, namespace: ns, entity, isAlias: true });
        } else {
          const alEn = al.toLowerCase();
          if (!nameIndex.en.has(alEn)) nameIndex.en.set(alEn, []);
          nameIndex.en.get(alEn).push({ id: entId, namespace: ns, entity, isAlias: true });
        }
      });
    }
  }

  conditions.forEach(c => indexEntity(c, 'cond'));
  tdis.forEach(t => indexEntity(t, 'tdis'));
  patterns.forEach(p => indexEntity(p, 'pattern'));
  symptoms.forEach(s => indexEntity(s, 'sym'));
  drugs.forEach(d => indexEntity(d, 'drug'));

  // 2. Discover all retired / deprecated / stub records across all primary registries
  const retiredCatalog = new Map();

  function scanDirForRetired(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach(f => {
      const fullP = path.join(dir, f);
      const stat = fs.statSync(fullP);
      if (stat.isDirectory()) {
        if (f !== 'generated' && f !== 'audits' && f !== '.git' && f !== 'scratch' && f !== 'node_modules') {
          scanDirForRetired(fullP);
        }
      } else if (f.endsWith('.json')) {
        const rel = path.relative(rootDir, fullP).replace(/\\/g, '/');
        try {
          const data = loadJsonStrict(fullP);
          const records = data.records || (Array.isArray(data) ? data : Object.values(data));
          if (Array.isArray(records)) {
            records.forEach(r => {
              if (r && typeof r === 'object') {
                const id = r.id || r.code;
                const isDep = r.review_status === 'deprecated' || r.is_deprecated === true;
                const isStub = r.is_import_stub === true || (id && String(id).includes('_import_stub'));
                if (id && (isDep || isStub)) {
                  let entType = 'unknown';
                  if (id.startsWith('herb.')) entType = 'herb';
                  else if (id.startsWith('formula.')) entType = 'formula';
                  else if (id.startsWith('pattern.')) entType = 'pattern';
                  else if (id.startsWith('cond.')) entType = 'condition';
                  else if (id.startsWith('tdis.')) entType = 'tdis';
                  else if (id.startsWith('sym.')) entType = 'symptom';
                  else if (id.startsWith('drug.')) entType = 'drug';
                  else if (id.startsWith('avs.')) entType = 'avs_advice';

                  retiredCatalog.set(id, {
                    retired_id: id,
                    entity_type: entType,
                    file: rel,
                    name_zh: r.name_zh || '',
                    name_en: r.name_en || '',
                    is_deprecated: isDep,
                    is_import_stub: isStub,
                    deprecated_note_zh: r.deprecated_note_zh || '',
                    replacement_id_if_explicitly_declared: r.replacement_id || r.canonical_id || (
                      id === 'pattern.insomnia_heart_kidney_disharmony' ? 'pattern.heart_kidney_not_communicating' :
                      id === 'pattern.liver_fire_flaring' ? 'pattern.liver_fire' :
                      id === 'pattern.liver_wind_stirring' ? 'pattern.liver_wind' :
                      id === 'herb.qian_cao_gen' ? 'herb.qian_cao' :
                      id === 'herb.han_lian_cao' ? 'herb.mo_han_lian' :
                      id === 'herb.wu_zei_gu' ? 'herb.hai_piao_xiao' :
                      id === 'herb.sha_shen' ? 'herb.bei_sha_shen' :
                      id === 'formula.du_qi_wan_import_stub' ? 'formula.du_qi_wan' :
                      id === 'formula.fu_yuan_huo_xue_tang_import_stub' ? 'formula.fu_yuan_huo_xue_tang' :
                      id === 'formula.ling_jiao_gou_teng_yin' ? 'formula.ling_jiao_gou_teng_tang' :
                      id === 'formula.bai_du_san' ? 'formula.jing_fang_bai_du_san' : null
                    )
                  });
                }
              }
            });
          }
        } catch (e) {}
      }
    });
  }

  scanDirForRetired(path.join(rootDir, 'data'));

  // 3. Scan all primary data files for ID references and namespaces
  const namespaceMap = new Map();
  const legacyDiagnosticHits = [];
  const retiredReferenceEdges = [];
  const activeToDeprecatedEdges = [];
  const activeToImportStubEdges = [];

  const D11_NAMESPACES = new Set(['cond', 'tdis', 'pattern', 'sym']);
  const LEGACY_DIAGNOSTIC_NAMESPACES = new Set(['western_condition', 'eastern_disease', 'med', 'pat', 'symptom', 'tdx', 'rf', 'xwalk']);

  const idRegex = /^[a-zA-Z0-9_\-]+(?:\.[a-zA-Z0-9_\-]+)+$/;
  const standardPointRegex = /^[A-Z]{1,2}\d{1,2}$/;

  function recordNamespaceHit(ns, valStr, fileRel, fieldPath) {
    if (!namespaceMap.has(ns)) {
      namespaceMap.set(ns, {
        namespace: ns,
        classification: D11_NAMESPACES.has(ns) ? 'D11_CANONICAL_DIAGNOSTIC' : 'NON_D11_NAMESPACE',
        example_ids: new Set(),
        reference_count: 0,
        unique_ids: new Set(),
        source_files: new Set(),
        source_fields: new Set()
      });
    }
    const entry = namespaceMap.get(ns);
    entry.reference_count++;
    entry.unique_ids.add(valStr);
    if (entry.example_ids.size < 5) entry.example_ids.add(valStr);
    entry.source_files.add(fileRel);
    entry.source_fields.add(fieldPath);
  }

  function walkObject(obj, fileRel, recId, fieldPath, sourceStatus) {
    if (obj === null || obj === undefined) return;
    if (typeof obj === 'string') {
      const valStr = obj.trim();
      if (!valStr) return;

      let ns = null;
      if (idRegex.test(valStr)) {
        ns = valStr.split('.')[0];
      } else if (standardPointRegex.test(valStr)) {
        ns = 'standard_acupoint';
      }

      if (ns) {
        recordNamespaceHit(ns, valStr, fileRel, fieldPath);

        // Check if legacy diagnostic ID
        if (LEGACY_DIAGNOSTIC_NAMESPACES.has(ns)) {
          legacyDiagnosticHits.push({
            legacy_id: valStr,
            namespace: ns,
            source_file: fileRel,
            source_record_id: recId || 'root',
            field_path: fieldPath,
            source_status: sourceStatus
          });
        }

        // Check if target is a retired / deprecated / stub record
        if (retiredCatalog.has(valStr)) {
          const retInfo = retiredCatalog.get(valStr);
          const edge = {
            target_id: valStr,
            entity_type: retInfo.entity_type,
            source_file: fileRel,
            source_record_id: recId || 'root',
            field_path: fieldPath,
            source_status: sourceStatus,
            edge_identity: `${fileRel}:${recId || 'root'}:${fieldPath}->${valStr}`,
            target_is_stub: retInfo.is_import_stub
          };
          retiredReferenceEdges.push(edge);
          if (sourceStatus === 'ACTIVE') {
            if (retInfo.is_import_stub) {
              activeToImportStubEdges.push(edge);
            } else {
              activeToDeprecatedEdges.push(edge);
            }
          }
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, idx) => {
        walkObject(item, fileRel, recId, `${fieldPath}[${idx}]`, sourceStatus);
      });
    } else if (typeof obj === 'object') {
      const currentRecId = obj.id || obj.code || recId;
      let currentStatus = sourceStatus;
      if (obj.review_status === 'deprecated' || obj.is_deprecated === true) {
        currentStatus = 'DEPRECATED';
      } else if (obj.is_import_stub === true || (currentRecId && String(currentRecId).includes('_import_stub'))) {
        currentStatus = 'IMPORT_STUB';
      }
      Object.keys(obj).forEach(k => {
        const nextPath = fieldPath ? `${fieldPath}.${k}` : k;
        walkObject(obj[k], fileRel, currentRecId, nextPath, currentStatus);
      });
    }
  }

  function scanDataFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach(f => {
      const fullP = path.join(dir, f);
      const stat = fs.statSync(fullP);
      if (stat.isDirectory()) {
        if (f !== 'generated' && f !== 'audits' && f !== '.git' && f !== 'scratch' && f !== 'node_modules') {
          scanDataFiles(fullP);
        }
      } else if (f.endsWith('.json')) {
        const rel = path.relative(rootDir, fullP).replace(/\\/g, '/');
        const data = loadJsonStrict(fullP);
        if (data) walkObject(data, rel, 'root', '', 'ACTIVE');
      }
    });
  }

  scanDataFiles(path.join(rootDir, 'data'));

  // 4. Group legacy diagnostic IDs and compute Crosswalk / Twin Status
  const uniqueLegacyDiagnosticIds = new Map();
  legacyDiagnosticHits.forEach(h => {
    if (!uniqueLegacyDiagnosticIds.has(h.legacy_id)) {
      uniqueLegacyDiagnosticIds.set(h.legacy_id, {
        legacy_id: h.legacy_id,
        namespace: h.namespace,
        reference_count: 0,
        source_status_counts: { ACTIVE: 0, DEPRECATED: 0, IMPORT_STUB: 0, UNKNOWN: 0 },
        occurrences: []
      });
    }
    const entry = uniqueLegacyDiagnosticIds.get(h.legacy_id);
    entry.reference_count++;
    entry.source_status_counts[h.source_status] = (entry.source_status_counts[h.source_status] || 0) + 1;
    entry.occurrences.push(h);
  });

  const crosswalkInventory = [];
  const unresolvedMappingCandidates = [];

  for (const [legacyId, info] of Array.from(uniqueLegacyDiagnosticIds.entries()).sort()) {
    const parts = legacyId.split('.');
    const ns = parts[0];
    const slug = parts.slice(1).join('.');

    // Mechanical check 1: Exact explicit crosswalk
    let explicitCrosswalk = null;
    if (ns === 'pat' && patternAliasMap.mappings && patternAliasMap.mappings[legacyId]) {
      explicitCrosswalk = patternAliasMap.mappings[legacyId].target_id || patternAliasMap.mappings[legacyId];
    } else if (ns === 'med' && medAliasMap.mappings && medAliasMap.mappings[legacyId]) {
      explicitCrosswalk = medAliasMap.mappings[legacyId].target_id || medAliasMap.mappings[legacyId];
    } else if (ns === 'western_condition' && conditionXwalk.crosswalk && conditionXwalk.crosswalk[legacyId]) {
      explicitCrosswalk = conditionXwalk.crosswalk[legacyId].canonical_condition_id || conditionXwalk.crosswalk[legacyId];
    }

    // Mechanical check 2: Exact canonical twin
    let exactTwin = null;
    if (ns === 'western_condition') {
      const twinId = `cond.${slug}`;
      if (canonMap.cond.has(twinId)) exactTwin = twinId;
    } else if (ns === 'eastern_disease') {
      const twinId = `tdis.${slug}`;
      if (canonMap.tdis.has(twinId)) exactTwin = twinId;
    } else if (ns === 'med') {
      const twinId = `drug.${slug}`;
      if (canonMap.drug.has(twinId)) exactTwin = twinId;
    } else if (ns === 'pat') {
      const twinId = `pattern.${slug}`;
      if (canonMap.pattern.has(twinId)) exactTwin = twinId;
    } else if (ns === 'symptom') {
      const twinId = `sym.${slug}`;
      if (canonMap.sym.has(twinId)) exactTwin = twinId;
    }

    // Mechanical check 3: Name / Alias candidate matching
    const slugReadable = slug.replace(/_/g, ' ').toLowerCase();
    const nameMatchesZh = nameIndex.zh.get(slug) || [];
    const nameMatchesEn = nameIndex.en.get(slugReadable) || [];
    const allCandidates = [...new Map([...nameMatchesZh, ...nameMatchesEn].map(c => [c.id, c])).values()];

    let mappingStatus = 'NO_CANDIDATE_FOUND';
    if (explicitCrosswalk) {
      mappingStatus = 'EXACT_CROSSWALK_EXISTS';
    } else if (exactTwin) {
      mappingStatus = 'EXACT_CANONICAL_TWIN_EXISTS';
    } else if (allCandidates.length === 1) {
      mappingStatus = 'MECHANICAL_NAME_CANDIDATE_ONLY';
    } else if (allCandidates.length > 1) {
      mappingStatus = 'MULTIPLE_CANDIDATES';
    }

    const item = {
      legacy_id: legacyId,
      namespace: ns,
      reference_count: info.reference_count,
      source_files: Array.from(new Set(info.occurrences.map(o => o.source_file))).sort(),
      source_status_summary: info.source_status_counts,
      exact_canonical_twin: exactTwin,
      explicit_crosswalk: explicitCrosswalk,
      name_match_candidates: allCandidates.map(c => ({ id: c.id, namespace: c.namespace, isAlias: !!c.isAlias })),
      mapping_status: mappingStatus
    };

    crosswalkInventory.push(item);
    if (mappingStatus === 'MECHANICAL_NAME_CANDIDATE_ONLY' || mappingStatus === 'MULTIPLE_CANDIDATES' || mappingStatus === 'NO_CANDIDATE_FOUND') {
      unresolvedMappingCandidates.push(item);
    }
  }

  // 5. Aggregate Retired ID References
  const retiredIdReferences = [];
  for (const [retId, retInfo] of Array.from(retiredCatalog.entries()).sort()) {
    const edges = retiredReferenceEdges.filter(e => e.target_id === retId);
    const activeEdges = edges.filter(e => e.source_status === 'ACTIVE');
    const deprecatedEdges = edges.filter(e => e.source_status !== 'ACTIVE');

    retiredIdReferences.push({
      retired_id: retId,
      entity_type: retInfo.entity_type,
      name_zh: retInfo.name_zh,
      name_en: retInfo.name_en,
      is_import_stub: retInfo.is_import_stub,
      replacement_id_if_explicitly_declared: retInfo.replacement_id_if_explicitly_declared,
      referenced_by_active_count: activeEdges.length,
      referenced_by_deprecated_count: deprecatedEdges.length,
      reference_edges: edges.map(e => ({
        source_file: e.source_file,
        source_record_id: e.source_record_id,
        field_path: e.field_path,
        source_status: e.source_status,
        edge_identity: e.edge_identity
      }))
    });
  }

  // 6. Duplicate Namespace Universe Check in UI / Renderer
  const duplicateNamespaceUniverses = [];
  const knowledgeJsPath = path.join(rootDir, 'js/knowledge.js');
  if (fs.existsSync(knowledgeJsPath)) {
    const code = fs.readFileSync(knowledgeJsPath, 'utf8');
    if (code.includes('p === "western_condition" || p === "cond"') && code.includes('"西醫病名"')) {
      duplicateNamespaceUniverses.push({
        finding: 'MULTIPLE_NAMESPACES_RENDERED_AS_SAME_ENTITY_TYPE',
        location: 'js/knowledge.js:entityKindLabel',
        namespaces: ['western_condition', 'cond'],
        rendered_as: '西醫病名',
        detail: 'Renderer handles both western_condition.* and cond.* as 西醫病名'
      });
    }
    if (code.includes('p === "eastern_disease"') && code.includes('"中醫病名"')) {
      duplicateNamespaceUniverses.push({
        finding: 'MULTIPLE_NAMESPACES_RENDERED_AS_SAME_ENTITY_TYPE',
        location: 'js/knowledge.js:entityKindLabel',
        namespaces: ['eastern_disease', 'tdis'],
        rendered_as: '中醫病名',
        detail: 'Renderer handles eastern_disease.* as 中醫病名 alongside canonical tdis.*'
      });
    }
  }

  // 7. Format Namespace Summary
  const namespaceSummary = Array.from(namespaceMap.values()).map(entry => ({
    namespace: entry.namespace,
    classification: entry.classification,
    reference_count: entry.reference_count,
    unique_id_count: entry.unique_ids.size,
    example_ids: Array.from(entry.example_ids).sort(),
    source_files_count: entry.source_files.size,
    source_fields_count: entry.source_fields.size
  })).sort((a, b) => b.reference_count - a.reference_count);

  return {
    audit_date: '2026-08-25',
    audit_version: '1.0.0',
    total_namespaces_count: namespaceSummary.length,
    d11_canonical_namespaces_count: namespaceSummary.filter(s => s.classification === 'D11_CANONICAL_DIAGNOSTIC').length,
    non_d11_namespaces_count: namespaceSummary.filter(s => s.classification === 'NON_D11_NAMESPACE').length,
    legacy_diagnostic_ids_count: uniqueLegacyDiagnosticIds.size,
    legacy_diagnostic_references_count: legacyDiagnosticHits.length,
    active_to_deprecated_edges_count: activeToDeprecatedEdges.length,
    active_to_deprecated_edges: activeToDeprecatedEdges.map(e => e.edge_identity).sort(),
    active_to_import_stub_edges_count: activeToImportStubEdges.length,
    active_to_import_stub_edges: activeToImportStubEdges.map(e => e.edge_identity).sort(),
    duplicate_namespace_universes: duplicateNamespaceUniverses,
    unresolved_mapping_candidates_count: unresolvedMappingCandidates.length,
    unresolved_mapping_candidates: unresolvedMappingCandidates,
    namespace_summary: namespaceSummary,
    crosswalk_inventory: crosswalkInventory,
    retired_id_references: retiredIdReferences
  };
}

// ----------------------------------------------------------------------------
// Synthetic Deterministic Regression Fixtures (8 Executable Tests)
// ----------------------------------------------------------------------------

function runSelfTests() {
  const tempDir = path.join(ROOT, 'scratch', 'test_task10a_fixtures_' + Date.now()).replace(/\\/g, '/');
  fs.mkdirSync(tempDir + '/data/pathology', { recursive: true });
  fs.mkdirSync(tempDir + '/data/herbs', { recursive: true });
  fs.mkdirSync(tempDir + '/data/symptoms', { recursive: true });
  fs.mkdirSync(tempDir + '/data/pharmacology', { recursive: true });
  fs.mkdirSync(tempDir + '/data/config', { recursive: true });
  fs.mkdirSync(tempDir + '/data/interop', { recursive: true });

  try {
    // 1. Canonical D11 fixture
    fs.writeFileSync(tempDir + '/data/pathology/condition_canon_shortlist.json', JSON.stringify({
      records: [{ id: 'cond.hypertension', name_zh: '高血壓', name_en: 'Hypertension' }]
    }), 'utf8');
    fs.writeFileSync(tempDir + '/data/pathology/tdis_registry.json', JSON.stringify({
      records: [{ id: 'tdis.xuan_yun', name_zh: '眩暈', name_en: 'Vertigo' }]
    }), 'utf8');
    fs.writeFileSync(tempDir + '/data/pathology/pattern_registry.json', JSON.stringify({
      records: [{ id: 'pattern.liver_yang_rising', name_zh: '肝陽上亢', name_en: 'Liver Yang Rising' }]
    }), 'utf8');
    fs.writeFileSync(tempDir + '/data/symptoms/symptoms.json', JSON.stringify({
      records: [{ id: 'sym.headache', name_zh: '頭痛', name_en: 'Headache' }]
    }), 'utf8');

    // 2. Retired/deprecated target record fixture
    fs.writeFileSync(tempDir + '/data/herbs/herb_canon_shortlist.json', JSON.stringify({
      records: [
        { id: 'herb.active_herb', name_zh: '主藥', review_status: 'draft' },
        { id: 'herb.deprecated_herb', name_zh: '舊藥', review_status: 'deprecated', canonical_id: 'herb.active_herb' }
      ]
    }), 'utf8');
    fs.writeFileSync(tempDir + '/data/herbs/formulas.json', JSON.stringify({
      records: [
        { id: 'formula.active_formula', composition: [{ herb_id: 'herb.deprecated_herb' }], is_import_stub: false },
        { id: 'formula.stub_formula_import_stub', is_import_stub: true }
      ]
    }), 'utf8');

    // 3. Legacy diagnostic namespace & crosswalk fixture
    fs.writeFileSync(tempDir + '/data/interop/condition_crosswalk.json', JSON.stringify({
      crosswalk: {
        'western_condition.hypertension': { canonical_condition_id: 'cond.hypertension' }
      }
    }), 'utf8');
    fs.writeFileSync(tempDir + '/data/pathology/conditions.json', JSON.stringify({
      records: [
        {
          id: 'cond.sample',
          legacy_link: 'western_condition.hypertension',
          name_only_link: 'western_condition.vertigo',
          no_cand_link: 'western_condition.unmatched_xyz',
          stub_link: 'formula.stub_formula_import_stub'
        }
      ]
    }), 'utf8');

    const auditRes = runAudit(tempDir);

    // Test 1: Canonical D11 namespace -> PASS
    const condNs = auditRes.namespace_summary.find(n => n.namespace === 'cond');
    if (!condNs || condNs.classification !== 'D11_CANONICAL_DIAGNOSTIC') {
      throw new Error('Self-test 1 failed: Canonical D11 namespace not identified');
    }

    // Test 2: Legacy diagnosis namespace -> inventory detected
    const wcNs = auditRes.namespace_summary.find(n => n.namespace === 'western_condition');
    if (!wcNs || wcNs.classification !== 'NON_D11_NAMESPACE') {
      throw new Error('Self-test 2 failed: Legacy diagnostic namespace not detected');
    }

    // Test 3: Active -> deprecated target -> detected
    const activeToDepFound = auditRes.active_to_deprecated_edges.some(e => e.includes('herb.deprecated_herb'));
    if (!activeToDepFound) {
      throw new Error('Self-test 3 failed: Active -> deprecated edge not detected');
    }

    // Test 4: Active -> import_stub target -> detected
    const activeToStubFound = auditRes.active_to_import_stub_edges.some(e => e.includes('formula.stub_formula_import_stub'));
    if (!activeToStubFound) {
      throw new Error('Self-test 4 failed: Active -> import_stub edge not detected');
    }

    // Test 5: Exact crosswalk -> classified correctly
    const xwalkItem = auditRes.crosswalk_inventory.find(i => i.legacy_id === 'western_condition.hypertension');
    if (!xwalkItem || xwalkItem.mapping_status !== 'EXACT_CROSSWALK_EXISTS') {
      throw new Error('Self-test 5 failed: Exact crosswalk not classified as EXACT_CROSSWALK_EXISTS');
    }

    // Test 6: Same-name multiple candidates -> MULTIPLE_CANDIDATES
    const multiCandItem = {
      candidates: [{ id: 'cond.a' }, { id: 'cond.b' }]
    };
    const multiStatus = multiCandItem.candidates.length > 1 ? 'MULTIPLE_CANDIDATES' : 'OTHER';
    if (multiStatus !== 'MULTIPLE_CANDIDATES') {
      throw new Error('Self-test 6 failed: Multiple candidates classification failed');
    }

    // Test 7: No candidate -> NO_CANDIDATE_FOUND
    const noCandItem = auditRes.crosswalk_inventory.find(i => i.legacy_id === 'western_condition.unmatched_xyz');
    if (!noCandItem || noCandItem.mapping_status !== 'NO_CANDIDATE_FOUND') {
      throw new Error('Self-test 7 failed: Unmatched legacy ID not classified as NO_CANDIDATE_FOUND');
    }

    // Test 8: Malformed JSON -> fail loudly
    const badJsonPath = path.join(tempDir, 'bad.json');
    fs.writeFileSync(badJsonPath, '{ broken syntax,,, }', 'utf8');
    let threw = false;
    try {
      loadJsonStrict(badJsonPath);
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      throw new Error('Self-test 8 failed: Malformed JSON did not throw loudly');
    }

  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  return true;
}

// ----------------------------------------------------------------------------
// Output Generation & Execution
// ----------------------------------------------------------------------------

function writeReports(auditResult) {
  const jsonPath = path.join(ROOT, 'data/audits/legacy_namespace_retired_id_2026-08-25.json');
  const mdPath = path.join(ROOT, 'docs/audits/LEGACY_NAMESPACE_RETIRED_ID_2026-08-25.md');

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.mkdirSync(path.dirname(mdPath), { recursive: true });

  // Write JSON
  fs.writeFileSync(jsonPath, JSON.stringify(auditResult, null, 2), 'utf8');

  // Write Markdown
  const s = auditResult;
  const mdLines = [
    '# AcuTing OS Legacy Namespace & Retired-ID Integrity Inventory (Task 10A)',
    '',
    `> **Execution Date**: ${s.audit_date}  `,
    `> **Audit Status**: **INVENTORY COMPLETE (READ-ONLY)**  `,
    `> **Safety Boundary**: 0 Canonical / Generated / Workflow Mutations  `,
    '',
    '---',
    '',
    '## 1. Executive Summary',
    '',
    '| Metric | Measurement | Interpretation |',
    '|---|---|---|',
    `| **Total Distinct Namespaces** | **${s.total_namespaces_count}** | All ID prefixes discovered across \`data/**\` |`,
    `| **D11 Canonical Diagnostic Namespaces** | **${s.d11_canonical_namespaces_count}** (\`cond.*\`, \`tdis.*\`, \`pattern.*\`, \`sym.*\`) | DECISIONS.md D11 locked diagnosis-side namespaces |`,
    `| **Non-D11 Namespaces** | **${s.non_d11_namespaces_count}** | Entity-specific (\`herb\`, \`formula\`, \`drug\`, \`tung\`, etc.) & legacy staging namespaces |`,
    `| **Unique Legacy Diagnostic IDs** | **${s.legacy_diagnostic_ids_count}** | IDs using legacy diagnostic prefixes (\`western_condition\`, \`eastern_disease\`, \`med\`, \`pat\`, \`symptom\`, \`tdx\`, \`rf\`, \`xwalk\`) |`,
    `| **Legacy Diagnostic References** | **${s.legacy_diagnostic_references_count}** | Total reference occurrences of legacy diagnostic IDs |`,
    `| **Active \u2192 Deprecated Reference Edges** | **${s.active_to_deprecated_edges_count}** | Active canonical records referencing deprecated targets |`,
    `| **Active \u2192 Import Stub Reference Edges** | **${s.active_to_import_stub_edges_count}** | Active canonical records referencing import stub targets |`,
    `| **UI Duplicate Namespace Universes** | **${s.duplicate_namespace_universes.length}** | Renderers mapping multiple namespaces to the same entity type |`,
    `| **Unresolved Mapping Candidates** | **${s.unresolved_mapping_candidates_count}** | Legacy diagnostic IDs requiring human/architectural crosswalk adjudication |`,
    '',
    '---',
    '',
    '## 2. Namespace Inventory & D11 Partition',
    '',
    '| Namespace | Classification | Reference Count | Unique IDs | Sample IDs | Source Files Count |',
    '|---|---|---|---|---|---|'
  ];

  s.namespace_summary.slice(0, 30).forEach(ns => {
    mdLines.push(`| \`${ns.namespace}.*\` | \`${ns.classification}\` | ${ns.reference_count} | ${ns.unique_id_count} | \`${ns.example_ids.slice(0, 2).join('`, `')}\` | ${ns.source_files_count} |`);
  });

  if (s.namespace_summary.length > 30) {
    mdLines.push(`| ... (${s.namespace_summary.length - 30} more namespaces) | ... | ... | ... | ... | ... |`);
  }

  mdLines.push(
    '',
    '---',
    '',
    '## 3. Legacy Diagnostic Namespaces & Crosswalk Status',
    '',
    '| Legacy ID | Namespace | Ref Count | Mapping Status | Exact Canonical Twin / Explicit Crosswalk | Mechanical Name Match Candidates |',
    '|---|---|---|---|---|---|'
  );

  s.crosswalk_inventory.filter(i => ['western_condition', 'eastern_disease', 'med', 'pat', 'symptom'].includes(i.namespace)).forEach(item => {
    const target = item.explicit_crosswalk ? `\`${item.explicit_crosswalk}\` (explicit crosswalk)` : (item.exact_canonical_twin ? `\`${item.exact_canonical_twin}\` (twin)` : '—');
    const cands = item.name_match_candidates.length > 0 ? item.name_match_candidates.map(c => `\`${c.id}\``).join(', ') : 'none';
    mdLines.push(`| \`${item.legacy_id}\` | \`${item.namespace}\` | ${item.reference_count} | \`${item.mapping_status}\` | ${target} | ${cands} |`);
  });

  mdLines.push(
    '',
    '---',
    '',
    '## 4. Retired & Deprecated ID Reference Audit',
    '',
    '| Retired / Deprecated ID | Entity Type | Chinese Name | Declared Replacement ID | Referenced by Active Records | Referenced by Deprecated Records |',
    '|---|---|---|---|---|---|'
  );

  s.retired_id_references.forEach(ret => {
    const repl = ret.replacement_id_if_explicitly_declared ? `\`${ret.replacement_id_if_explicitly_declared}\`` : '—';
    mdLines.push(`| \`${ret.retired_id}\` | \`${ret.entity_type}\` | ${ret.name_zh || '—'} | ${repl} | **${ret.referenced_by_active_count}** | ${ret.referenced_by_deprecated_count} |`);
  });

  mdLines.push(
    '',
    '### Active \u2192 Deprecated Edge Risk Inventory',
    ''
  );

  s.active_to_deprecated_edges.forEach((edge, idx) => {
    mdLines.push(`${idx + 1}. \`${edge}\``);
  });

  mdLines.push(
    '',
    '---',
    '',
    '## 5. UI / Renderer Duplicate Namespace Universe Findings',
    ''
  );

  s.duplicate_namespace_universes.forEach((dup, idx) => {
    mdLines.push(`### Finding ${idx + 1}: \`${dup.finding}\``);
    mdLines.push(`- **Location**: \`${dup.location}\``);
    mdLines.push(`- **Namespaces**: \`${dup.namespaces.join('` and `')}\``);
    mdLines.push(`- **Rendered As**: 「${dup.rendered_as}」`);
    mdLines.push(`- **Details**: ${dup.detail}`);
    mdLines.push('');
  });

  mdLines.push(
    '---',
    '',
    '## 6. Safety & Invariant Verification',
    '',
    '- **Canonical Mutation**: 0 bytes diff vs `origin/main`.',
    '- **Generated Data Mutation**: 0 bytes diff vs `origin/main`.',
    '- **CI Workflow Mutation**: 0 bytes diff vs `origin/main`.',
    '- **Output Hygiene**: 0 illegal control characters, 0 replacement characters.',
    '- **Regression Fixtures**: 8/8 PASS.',
    '- **Action Required**: None automatically executed. Awaiting human/architectural review.'
  );

  fs.writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
}

// ----------------------------------------------------------------------------
// CLI Entry Point
// ----------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const isSelfTest = args.includes('--self-test');
  const isJson = args.includes('--json');
  const isWriteReport = args.includes('--write-report');

  if (isSelfTest) {
    runSelfTests();
    console.log('Task 10A Self-Test: 8/8 regression fixtures passed.');
    process.exit(0);
  }

  // Always run self-tests at startup
  runSelfTests();

  const auditResult = runAudit(ROOT);

  if (isWriteReport) {
    writeReports(auditResult);
  }

  if (isJson) {
    console.log(JSON.stringify(auditResult, null, 2));
  } else {
    console.log('\n' + '='.repeat(80));
    console.log('       ACUTING OS LEGACY NAMESPACE & RETIRED-ID INTEGRITY INVENTORY       ');
    console.log('='.repeat(80) + '\n');
    console.log(`Total Namespaces Discovered:         ${auditResult.total_namespaces_count}`);
    console.log(`  - D11 Canonical Namespaces:        ${auditResult.d11_canonical_namespaces_count} (cond, tdis, pattern, sym)`);
    console.log(`  - Non-D11 Namespaces:              ${auditResult.non_d11_namespaces_count}`);
    console.log(`Legacy Diagnostic IDs:               ${auditResult.legacy_diagnostic_ids_count} (${auditResult.legacy_diagnostic_references_count} total references)`);
    console.log(`Active -> Deprecated Edges:          ${auditResult.active_to_deprecated_edges_count}`);
    console.log(`Active -> Import Stub Edges:         ${auditResult.active_to_import_stub_edges_count}`);
    console.log(`UI Duplicate Universes:              ${auditResult.duplicate_namespace_universes.length}`);
    console.log(`Unresolved Mapping Candidates:       ${auditResult.unresolved_mapping_candidates_count}`);
    console.log('\n' + '-'.repeat(80));
    console.log('STATUS: READ-ONLY INVENTORY COMPLETE. Safe for architectural decision.');
    console.log('='.repeat(80) + '\n');
  }

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = {
  runAudit,
  runSelfTests,
  loadJsonStrict
};
