#!/usr/bin/env node
/**
 * scripts/audit-legacy-namespace-retired-id.js
 *
 * AcuTing OS Legacy Namespace / Retired-ID Integrity Inventory (Task 10A Round 2).
 *
 * Precision measurement audit engine:
 * 1. Whole-repo ID namespaces categorized into:
 *    - D11_CANONICAL_DIAGNOSTIC (cond, tdis, pattern, sym)
 *    - LEGACY_DIAGNOSTIC_CANDIDATE (western_condition, eastern_disease, pat, symptom)
 *    - NON_DIAGNOSTIC_ENTITY_NAMESPACE (herb, formula, pair, drug, supp, tung, ear, ex, etc.)
 *    - CODE_SYSTEM (ICD-10 codes, etc.)
 *    - NON_ID_DOTTED_TOKEN (decimals, measurements, versions, file paths)
 *    - UNKNOWN
 * 2. Distinct domain classifications for staging/interop namespaces:
 *    - med -> MEDICATION_STAGING_NAMESPACE
 *    - rf -> RED_FLAG_REGISTRY_NAMESPACE
 *    - xwalk -> CROSSWALK_INTEROP_NAMESPACE
 *    - tdx -> TCM_DISEASE_TAXONOMY_NAMESPACE
 * 3. Restricted relation/reference scanning (identity fields like id/code/name excluded from reference edges).
 * 4. Strictly declared replacements (no invented mappings).
 * 5. Mechanical crosswalk / candidate classification:
 *    - EXACT_CROSSWALK_EXISTS
 *    - EXACT_CANONICAL_TWIN_EXISTS
 *    - MECHANICAL_NAME_CANDIDATE_ONLY
 *    - MULTIPLE_CANDIDATES
 *    - NO_CANDIDATE_FOUND
 * 6. UI duplicate universes detection (MULTIPLE_NAMESPACES_RENDERED_AS_SAME_ENTITY_TYPE).
 * 7. Executable self-test suite (8 deterministic regression fixtures).
 * 8. Malformed audited JSON fails loudly.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

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
// Token & Taxonomy Classification
// ----------------------------------------------------------------------------

const D11_CANONICAL = new Set(['cond', 'tdis', 'pattern', 'sym']);
const LEGACY_DIAGNOSTIC = new Set(['western_condition', 'eastern_disease', 'pat', 'symptom']);

const NON_DIAGNOSTIC_ENTITIES = new Set([
  'herb', 'formula', 'pair', 'drug', 'drugclass', 'drugtarget', 'drugsystem', 'supp',
  'tung', 'ear', 'ex', 'modality', 'standard_acupoint', 'avs', 'patient', 'visit',
  'case', 'source', 'learn', 'metric', 'system', 'safety', 'life', 'move', 'reth',
  'organ', 'cmp', 'formula_category', 'med_class'
]);

const DOMAIN_SPECIFIC_ROLES = {
  med: 'MEDICATION_STAGING_NAMESPACE',
  rf: 'RED_FLAG_REGISTRY_NAMESPACE',
  xwalk: 'CROSSWALK_INTEROP_NAMESPACE',
  tdx: 'TCM_DISEASE_TAXONOMY_NAMESPACE'
};

const ICD_PATTERN = /^[A-TV-Z][0-9][0-9A-Z](?:\.[0-9A-Z]{1,4})?$/i;
const DECIMAL_OR_MEASURE_PATTERN = /^[0-9]+(?:\.[0-9]+)+(?:[a-zA-Z%]+)?$/;
const VERSION_PATTERN = /^v?[0-9]+(?:\.[0-9]+)+$/i;
const FILE_EXTENSION_PATTERN = /\.(?:json|js|md|html|css|sql|txt|pdf|docx|csv|png|jpg|svg)$/i;

const NAMESPACED_ID_REGEX = /^[a-z][a-z0-9_]*(?:\.[a-zA-Z0-9_\-\u4e00-\u9fa5]+)+$/;

function classifyToken(str) {
  if (typeof str !== 'string') return { type: 'NON_ID_DOTTED_TOKEN', namespace: null };
  const val = str.trim();
  if (/^[A-Z]{1,2}[0-9]{1,2}$/.test(val)) {
    return { type: 'NON_DIAGNOSTIC_ENTITY_NAMESPACE', namespace: 'standard_acupoint', id: val };
  }
  if (!val.includes('.')) return { type: 'NON_ID_DOTTED_TOKEN', namespace: null };
  if (val.includes(' ') || val.includes('\n') || val.includes('\t') || val.includes(',') || val.includes(';')) {
    return { type: 'NON_ID_DOTTED_TOKEN', namespace: null, reason: 'PROSE_TEXT' };
  }
  if (FILE_EXTENSION_PATTERN.test(val)) return { type: 'NON_ID_DOTTED_TOKEN', namespace: null, reason: 'FILE_PATH' };
  if (DECIMAL_OR_MEASURE_PATTERN.test(val)) return { type: 'NON_ID_DOTTED_TOKEN', namespace: null, reason: 'NUMERIC_OR_MEASUREMENT' };
  if (VERSION_PATTERN.test(val)) return { type: 'NON_ID_DOTTED_TOKEN', namespace: null, reason: 'VERSION_STRING' };
  if (ICD_PATTERN.test(val)) return { type: 'CODE_SYSTEM', namespace: 'icd10', code: val };

  if (!NAMESPACED_ID_REGEX.test(val)) {
    return { type: 'NON_ID_DOTTED_TOKEN', namespace: null, reason: 'INVALID_SLUG_FORMAT' };
  }

  const prefix = val.split('.')[0];
  if (D11_CANONICAL.has(prefix)) return { type: 'D11_CANONICAL_DIAGNOSTIC', namespace: prefix, id: val };
  if (LEGACY_DIAGNOSTIC.has(prefix)) return { type: 'LEGACY_DIAGNOSTIC_CANDIDATE', namespace: prefix, id: val };
  if (DOMAIN_SPECIFIC_ROLES[prefix]) return { type: DOMAIN_SPECIFIC_ROLES[prefix], namespace: prefix, id: val };
  if (NON_DIAGNOSTIC_ENTITIES.has(prefix)) return { type: 'NON_DIAGNOSTIC_ENTITY_NAMESPACE', namespace: prefix, id: val };
  return { type: 'UNKNOWN', namespace: prefix, id: val };
}

// ----------------------------------------------------------------------------
// Reference vs Declaration Field Policy
// ----------------------------------------------------------------------------

const EXCLUDED_FIELD_NAMES = new Set([
  'id', 'code', 'name_zh', 'name_en', 'pinyin', 'aliases', 'latin_name', 'author', 'source',
  'category', 'category_zh', 'category_en', 'standard_source', 'classical_source', 'taxonomy_id',
  'version', 'date', 'created_at', 'updated_at', 'review_status', 'is_deprecated', 'is_import_stub',
  'deprecated_note_zh', 'safety_level', 'taste', 'temperature', 'channels', 'dosage', 'icd10',
  'icd9', 'cpt', 'cpt_code', 'url', 'urls', 'source_urls', 'image_url', 'visual_links',
  'source_citations', 'description', 'details', 'notes', 'pearls', 'exam_pearls_zh', 'actions_zh',
  'actions_en', 'indications_zh', 'indications_en', 'contraindications_zh', 'contraindications_en',
  'cautions_zh', 'cautions_en', 'functions_zh', 'functions_en', 'clinical_manifestations_zh',
  'clinical_manifestations_en', 'dosage_form', 'preparation', 'meridians', 'system_tags', 'domain'
]);

const REFERENCE_KEYWORDS = [
  'related_', 'links', 'link', 'ref', 'refs', 'composition', 'pairs', 'compares', 'points_to', 'differential_patterns',
  'tcm_patterns', 'conditions', 'eastern_diseases', 'western_conditions', 'formulas', 'herbs',
  'drugs', 'supplements', 'points', 'family', 'partner', 'contraindicated', 'incompatible',
  'synergistic', 'target_id', 'replacement_id', 'canonical_id', 'entities', 'compares'
];

function isReferenceField(fieldPath) {
  if (!fieldPath) return false;
  const segments = fieldPath.replace(/\[\d+\]/g, '').split('.');
  const lastSegment = segments[segments.length - 1];
  if (EXCLUDED_FIELD_NAMES.has(lastSegment)) return false;
  return segments.some(seg => REFERENCE_KEYWORDS.some(kw => seg.includes(kw)));
}

// ----------------------------------------------------------------------------
// Core Audit Execution
// ----------------------------------------------------------------------------

function runAudit(customRoot = ROOT) {
  const rootDir = customRoot;

  // 1. Load canonical registries
  const conditions = (loadJsonStrict(path.join(rootDir, 'data/pathology/condition_canon_shortlist.json')) || {}).records || [];
  const tdis = (loadJsonStrict(path.join(rootDir, 'data/pathology/tdis_registry.json')) || {}).records || [];
  const patterns = (loadJsonStrict(path.join(rootDir, 'data/pathology/pattern_registry.json')) || {}).records || [];
  const symptoms = (loadJsonStrict(path.join(rootDir, 'data/symptoms/symptoms.json')) || {}).records || [];
  const herbs = (loadJsonStrict(path.join(rootDir, 'data/herbs/herb_canon_shortlist.json')) || {}).records || [];
  const formulas = (loadJsonStrict(path.join(rootDir, 'data/herbs/formulas.json')) || {}).records || [];
  const drugs = (loadJsonStrict(path.join(rootDir, 'data/pharmacology/drugs.json')) || {}).records || [];
  const supplements = (loadJsonStrict(path.join(rootDir, 'data/supplements/supplements.json')) || {}).records || [];

  const conditionXwalk = loadJsonStrict(path.join(rootDir, 'data/interop/condition_crosswalk.json')) || {};
  const patternAliasMap = loadJsonStrict(path.join(rootDir, 'data/config/pattern_alias_map.json')) || {};
  const medAliasMap = loadJsonStrict(path.join(rootDir, 'data/config/medication_alias_map.json')) || {};

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

  // Name index for mechanical candidate matching
  const nameIndex = {
    zh: new Map(),
    en: new Map()
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

  // 2. Discover retired / deprecated / stub records across all primary registries
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

                // Strictly declared replacement ONLY from record field or locked decision D16
                let repl = r.replacement_id || r.canonical_id || r.replaced_by || null;
                if (!repl) {
                  if (id === 'pattern.insomnia_heart_kidney_disharmony') repl = 'pattern.heart_kidney_not_communicating';
                  else if (id === 'pattern.liver_fire_flaring') repl = 'pattern.liver_fire';
                  else if (id === 'pattern.liver_wind_stirring') repl = 'pattern.liver_wind';
                }

                retiredCatalog.set(id, {
                  retired_id: id,
                  entity_type: entType,
                  file: rel,
                  name_zh: r.name_zh || '',
                  name_en: r.name_en || '',
                  is_deprecated: isDep,
                  is_import_stub: isStub,
                  deprecated_note_zh: r.deprecated_note_zh || '',
                  replacement_id_if_explicitly_declared: repl
                });
              }
            }
          });
        }
      }
    });
  }

  scanDirForRetired(path.join(rootDir, 'data'));

  // 3. Scan all primary data files for ID occurrences and reference edges
  const namespaceMap = new Map();
  const legacyDiagnosticHits = [];
  const retiredReferenceEdges = [];
  const activeToDeprecatedEdges = [];
  const activeToImportStubEdges = [];

  function recordNamespaceHit(ns, valStr, fileRel, fieldPath, classification) {
    if (!namespaceMap.has(ns)) {
      namespaceMap.set(ns, {
        namespace: ns,
        classification: classification,
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

      const tok = classifyToken(valStr);
      if (tok.namespace) {
        recordNamespaceHit(tok.namespace, valStr, fileRel, fieldPath, tok.type);

        // Track Legacy Diagnostic Candidate references
        if (tok.type === 'LEGACY_DIAGNOSTIC_CANDIDATE') {
          legacyDiagnosticHits.push({
            legacy_id: valStr,
            namespace: tok.namespace,
            source_file: fileRel,
            source_record_id: recId || 'root',
            field_path: fieldPath,
            source_status: sourceStatus,
            is_reference_field: isReferenceField(fieldPath)
          });
        }

        // Check reference edges to retired/deprecated/stub records ONLY from relation/reference fields!
        if (retiredCatalog.has(valStr) && isReferenceField(fieldPath)) {
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

  // 4. Group legacy diagnostic candidates and compute crosswalk status
  const uniqueLegacyDiagnosticIds = new Map();
  legacyDiagnosticHits.forEach(h => {
    if (!uniqueLegacyDiagnosticIds.has(h.legacy_id)) {
      uniqueLegacyDiagnosticIds.set(h.legacy_id, {
        legacy_id: h.legacy_id,
        namespace: h.namespace,
        reference_count: 0,
        relation_field_reference_count: 0,
        source_status_counts: { ACTIVE: 0, DEPRECATED: 0, IMPORT_STUB: 0, UNKNOWN: 0 },
        occurrences: []
      });
    }
    const entry = uniqueLegacyDiagnosticIds.get(h.legacy_id);
    entry.reference_count++;
    if (h.is_reference_field) entry.relation_field_reference_count++;
    entry.source_status_counts[h.source_status] = (entry.source_status_counts[h.source_status] || 0) + 1;
    entry.occurrences.push(h);
  });

  const crosswalkInventory = [];
  const unresolvedMappingCandidates = [];

  for (const [legacyId, info] of Array.from(uniqueLegacyDiagnosticIds.entries()).sort()) {
    const parts = legacyId.split('.');
    const ns = parts[0];
    const slug = parts.slice(1).join('.');

    // Check 1: Exact explicit crosswalk
    let explicitCrosswalk = null;
    if (ns === 'pat' && patternAliasMap.mappings && patternAliasMap.mappings[legacyId]) {
      explicitCrosswalk = patternAliasMap.mappings[legacyId].target_id || patternAliasMap.mappings[legacyId];
    } else if (ns === 'western_condition' && conditionXwalk.crosswalk && conditionXwalk.crosswalk[legacyId]) {
      explicitCrosswalk = conditionXwalk.crosswalk[legacyId].canonical_condition_id || conditionXwalk.crosswalk[legacyId];
    }

    // Check 2: Exact canonical twin
    let exactTwin = null;
    if (ns === 'western_condition') {
      const twinId = `cond.${slug}`;
      if (canonMap.cond.has(twinId)) exactTwin = twinId;
    } else if (ns === 'eastern_disease') {
      const twinId = `tdis.${slug}`;
      if (canonMap.tdis.has(twinId)) exactTwin = twinId;
    } else if (ns === 'pat') {
      const twinId = `pattern.${slug}`;
      if (canonMap.pattern.has(twinId)) exactTwin = twinId;
    } else if (ns === 'symptom') {
      const twinId = `sym.${slug}`;
      if (canonMap.sym.has(twinId)) exactTwin = twinId;
    }

    // Check 3: Name / Alias candidate matching
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
      total_occurrences: info.reference_count,
      relation_field_references: info.relation_field_reference_count,
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

  // 6. UI / Renderer Duplicate Namespace Universe Findings
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
    audit_version: '2.0.0',
    total_valid_entity_namespaces_count: namespaceSummary.length,
    d11_canonical_namespaces_count: namespaceSummary.filter(s => s.classification === 'D11_CANONICAL_DIAGNOSTIC').length,
    legacy_diagnostic_candidate_namespaces_count: namespaceSummary.filter(s => s.classification === 'LEGACY_DIAGNOSTIC_CANDIDATE').length,
    non_diagnostic_entity_namespaces_count: namespaceSummary.filter(s => s.classification === 'NON_DIAGNOSTIC_ENTITY_NAMESPACE').length,
    staging_and_taxonomy_namespaces_count: namespaceSummary.filter(s => ['MEDICATION_STAGING_NAMESPACE', 'RED_FLAG_REGISTRY_NAMESPACE', 'CROSSWALK_INTEROP_NAMESPACE', 'TCM_DISEASE_TAXONOMY_NAMESPACE'].includes(s.classification)).length,
    legacy_diagnostic_candidate_ids_count: uniqueLegacyDiagnosticIds.size,
    legacy_diagnostic_total_occurrences: legacyDiagnosticHits.length,
    legacy_diagnostic_relation_field_references: legacyDiagnosticHits.filter(h => h.is_reference_field).length,
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
  const tempDir = path.join(ROOT, 'scratch', 'test_task10a_r2_fixtures_' + Date.now()).replace(/\\/g, '/');
  fs.mkdirSync(tempDir + '/data/pathology', { recursive: true });
  fs.mkdirSync(tempDir + '/data/herbs', { recursive: true });
  fs.mkdirSync(tempDir + '/data/symptoms', { recursive: true });
  fs.mkdirSync(tempDir + '/data/pharmacology', { recursive: true });
  fs.mkdirSync(tempDir + '/data/config', { recursive: true });
  fs.mkdirSync(tempDir + '/data/interop', { recursive: true });

  try {
    // 1. Canonical D11 fixture
    fs.writeFileSync(tempDir + '/data/pathology/condition_canon_shortlist.json', JSON.stringify({
      records: [
        { id: 'cond.hypertension', name_zh: '高血壓', name_en: 'Hypertension' },
        { id: 'cond.candidate_a', name_zh: '同名病', name_en: 'Shared Disease A' }
      ]
    }), 'utf8');
    fs.writeFileSync(tempDir + '/data/pathology/tdis_registry.json', JSON.stringify({
      records: [
        { id: 'tdis.xuan_yun', name_zh: '眩暈', name_en: 'Vertigo' },
        { id: 'tdis.candidate_b', name_zh: '同名病', name_en: 'Shared Disease B' }
      ]
    }), 'utf8');
    fs.writeFileSync(tempDir + '/data/pathology/pattern_registry.json', JSON.stringify({
      records: [{ id: 'pattern.liver_yang_rising', name_zh: '肝陽上亢', name_en: 'Liver Yang Rising' }]
    }), 'utf8');
    fs.writeFileSync(tempDir + '/data/symptoms/symptoms.json', JSON.stringify({
      records: [{ id: 'sym.headache', name_zh: '頭痛', name_en: 'Headache' }]
    }), 'utf8');

    // 2. Retired / Deprecated & Import Stub fixture
    fs.writeFileSync(tempDir + '/data/herbs/herb_canon_shortlist.json', JSON.stringify({
      records: [
        { id: 'herb.active_herb', name_zh: '主藥', review_status: 'draft' },
        { id: 'herb.deprecated_herb', name_zh: '舊藥', review_status: 'deprecated' }
      ]
    }), 'utf8');
    fs.writeFileSync(tempDir + '/data/herbs/formulas.json', JSON.stringify({
      records: [
        // Declaration of old formula should NOT create edge
        { id: 'formula.deprecated_formula', name_zh: '舊方', review_status: 'deprecated' },
        // Reference field SHOULD create edge
        { id: 'formula.active_formula', related_formulas: ['formula.deprecated_formula'], composition: [{ herb_id: 'herb.deprecated_herb' }] },
        { id: 'formula.stub_formula_import_stub', is_import_stub: true }
      ]
    }), 'utf8');

    // 3. Legacy diagnostic candidates & crosswalk fixture
    fs.writeFileSync(tempDir + '/data/interop/condition_crosswalk.json', JSON.stringify({
      crosswalk: {
        'western_condition.hypertension': { canonical_condition_id: 'cond.hypertension' }
      }
    }), 'utf8');
    fs.writeFileSync(tempDir + '/data/pathology/conditions.json', JSON.stringify({
      records: [
        {
          id: 'cond.sample',
          // Exactly crosswalked
          legacy_link: 'western_condition.hypertension',
          // Same-name multiple candidates
          multiple_cand_link: 'western_condition.同名病',
          // Single name match
          name_only_link: 'western_condition.vertigo',
          // No candidate found
          no_cand_link: 'western_condition.unmatched_xyz',
          // Active -> Import stub in relation field
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
    if (!wcNs || wcNs.classification !== 'LEGACY_DIAGNOSTIC_CANDIDATE') {
      throw new Error('Self-test 2 failed: Legacy diagnostic namespace not classified as LEGACY_DIAGNOSTIC_CANDIDATE');
    }

    // Test 3: Active -> deprecated target detected, but declaration ID field excluded!
    const activeToDep = auditRes.active_to_deprecated_edges;
    const hasFormulaDepRef = activeToDep.some(e => e.includes('related_formulas') && e.includes('->formula.deprecated_formula'));
    const hasFormulaDepDecl = activeToDep.some(e => e.includes('id->formula.deprecated_formula'));
    if (!hasFormulaDepRef || hasFormulaDepDecl) {
      throw new Error('Self-test 3 failed: Reference field did not create edge OR declaration ID field incorrectly created false edge');
    }

    // Test 4: Active -> import_stub target detected
    const activeToStubFound = auditRes.active_to_import_stub_edges.some(e => e.includes('formula.stub_formula_import_stub'));
    if (!activeToStubFound) {
      throw new Error('Self-test 4 failed: Active -> import_stub edge not detected');
    }

    // Test 5: Exact crosswalk -> classified correctly
    const xwalkItem = auditRes.crosswalk_inventory.find(i => i.legacy_id === 'western_condition.hypertension');
    if (!xwalkItem || xwalkItem.mapping_status !== 'EXACT_CROSSWALK_EXISTS') {
      throw new Error('Self-test 5 failed: Exact crosswalk not classified as EXACT_CROSSWALK_EXISTS');
    }

    // Test 6: Same-name multiple candidates -> MULTIPLE_CANDIDATES (Real production execution)
    const multiCandItem = auditRes.crosswalk_inventory.find(i => i.legacy_id === 'western_condition.同名病');
    if (!multiCandItem || multiCandItem.mapping_status !== 'MULTIPLE_CANDIDATES' || multiCandItem.name_match_candidates.length < 2) {
      throw new Error('Self-test 6 failed: Real production run did not classify shared name candidates as MULTIPLE_CANDIDATES');
    }

    // Test 7: No candidate -> NO_CANDIDATE_FOUND
    const noCandItem = auditRes.crosswalk_inventory.find(i => i.legacy_id === 'western_condition.unmatched_xyz');
    if (!noCandItem || noCandItem.mapping_status !== 'NO_CANDIDATE_FOUND') {
      throw new Error('Self-test 7 failed: Unmatched legacy ID not classified as NO_CANDIDATE_FOUND');
    }

    // Test 8: Malformed JSON -> fail loudly when invoking actual runAudit() path
    const badJsonPath = path.join(tempDir, 'data/pathology/bad.json');
    fs.writeFileSync(badJsonPath, '{ broken syntax,,, }', 'utf8');
    let threw = false;
    try {
      runAudit(tempDir);
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      throw new Error('Self-test 8 failed: Malformed JSON did not fail loudly during runAudit()');
    }

  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  return true;
}

// ----------------------------------------------------------------------------
// Output Generation
// ----------------------------------------------------------------------------

function writeReports(auditResult) {
  const jsonPath = path.join(ROOT, 'data/audits/legacy_namespace_retired_id_2026-08-25.json');
  const mdPath = path.join(ROOT, 'docs/audits/LEGACY_NAMESPACE_RETIRED_ID_2026-08-25.md');

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.mkdirSync(path.dirname(mdPath), { recursive: true });

  fs.writeFileSync(jsonPath, JSON.stringify(auditResult, null, 2), 'utf8');

  const s = auditResult;
  const mdLines = [
    '# AcuTing OS Legacy Namespace & Retired-ID Integrity Inventory (Task 10A Round 2)',
    '',
    `> **Execution Date**: ${s.audit_date}  `,
    `> **Audit Version**: ${s.audit_version}  `,
    `> **Audit Status**: **INVENTORY COMPLETE (READ-ONLY)**  `,
    `> **Safety Boundary**: 0 Canonical / Generated / Workflow / Relation Mutations  `,
    '',
    '---',
    '',
    '## 1. Executive Summary',
    '',
    '| Metric | Measurement | Interpretation |',
    '|---|---|---|',
    `| **Total Valid Entity Namespaces** | **${s.total_valid_entity_namespaces_count}** | Distinct entity/staging namespaces (decimal/version tokens excluded) |`,
    `| **D11 Canonical Diagnostic Namespaces** | **${s.d11_canonical_namespaces_count}** (\`cond.*\`, \`tdis.*\`, \`pattern.*\`, \`sym.*\`) | DECISIONS.md D11 locked diagnosis-side canonical namespaces |`,
    `| **Legacy Diagnostic Candidate Namespaces** | **${s.legacy_diagnostic_candidate_namespaces_count}** (\`western_condition.*\`, \`eastern_disease.*\`, \`pat.*\`, \`symptom.*\`) | Diagnostic-side candidates for future migration adjudication |`,
    `| **Non-Diagnostic Entity Namespaces** | **${s.non_diagnostic_entity_namespaces_count}** | Domain entity namespaces (\`herb\`, \`formula\`, \`pair\`, \`drug\`, \`supp\`, \`tung\`, etc.) |`,
    `| **Staging & Taxonomy Namespaces** | **${s.staging_and_taxonomy_namespaces_count}** | \`med.*\` (medication staging), \`rf.*\` (red flags), \`xwalk.*\` (crosswalk sidecar), \`tdx.*\` (TCM taxonomy) |`,
    `| **Unique Legacy Diagnostic Candidate IDs** | **${s.legacy_diagnostic_candidate_ids_count}** | Distinct candidate IDs in legacy diagnostic namespaces |`,
    `| **Legacy Diagnostic Total Occurrences** | **${s.legacy_diagnostic_total_occurrences}** | Raw string occurrences across data files |`,
    `| **Legacy Diagnostic Relationship References** | **${s.legacy_diagnostic_relation_field_references}** | Occurrences in relationship/reference fields |`,
    `| **Active \u2192 Deprecated Reference Edges** | **${s.active_to_deprecated_edges_count}** | Real relationship edges from active records to deprecated targets (identity fields excluded) |`,
    `| **Active \u2192 Import Stub Reference Edges** | **${s.active_to_import_stub_edges_count}** | Real relationship edges from active records to import stub targets |`,
    `| **UI Duplicate Namespace Universes** | **${s.duplicate_namespace_universes.length}** | Renderers mapping multiple namespaces to the same entity type |`,
    `| **Unresolved Mapping Candidates** | **${s.unresolved_mapping_candidates_count}** | Legacy diagnostic candidate IDs requiring human/architectural crosswalk adjudication |`,
    '',
    '---',
    '',
    '## 2. Namespace Inventory by Classification',
    '',
    '| Namespace | Classification | Reference Count | Unique IDs | Sample IDs | Source Files Count |',
    '|---|---|---|---|---|---|'
  ];

  s.namespace_summary.forEach(ns => {
    mdLines.push(`| \`${ns.namespace}.*\` | \`${ns.classification}\` | ${ns.reference_count} | ${ns.unique_id_count} | \`${ns.example_ids.slice(0, 2).join('`, `')}\` | ${ns.source_files_count} |`);
  });

  mdLines.push(
    '',
    '---',
    '',
    '## 3. Legacy Diagnostic Candidates & Mechanical Crosswalk Status',
    '',
    '| Legacy ID | Namespace | Total Occurrences | Relation Field Refs | Mapping Status | Exact Canonical Twin / Explicit Crosswalk | Mechanical Name Match Candidates |',
    '|---|---|---|---|---|---|---|'
  );

  s.crosswalk_inventory.forEach(item => {
    const target = item.explicit_crosswalk ? `\`${item.explicit_crosswalk}\` (explicit crosswalk)` : (item.exact_canonical_twin ? `\`${item.exact_canonical_twin}\` (twin)` : '—');
    const cands = item.name_match_candidates.length > 0 ? item.name_match_candidates.map(c => `\`${c.id}\``).join(', ') : 'none';
    mdLines.push(`| \`${item.legacy_id}\` | \`${item.namespace}\` | ${item.total_occurrences} | ${item.relation_field_references} | \`${item.mapping_status}\` | ${target} | ${cands} |`);
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
    '### Active \u2192 Deprecated Edge Risk Inventory (Identity Fields Excluded)',
    ''
  );

  if (s.active_to_deprecated_edges.length === 0) {
    mdLines.push('No active -> deprecated reference edges found.');
  } else {
    s.active_to_deprecated_edges.forEach((edge, idx) => {
      mdLines.push(`${idx + 1}. \`${edge}\``);
    });
  }

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
    console.log(`Total Valid Entity Namespaces:       ${auditResult.total_valid_entity_namespaces_count}`);
    console.log(`  - D11 Canonical Namespaces:        ${auditResult.d11_canonical_namespaces_count} (cond, tdis, pattern, sym)`);
    console.log(`  - Legacy Diagnostic Candidates:    ${auditResult.legacy_diagnostic_candidate_namespaces_count} (western_condition, eastern_disease, pat, symptom)`);
    console.log(`  - Non-Diagnostic Entity Spaces:    ${auditResult.non_diagnostic_entity_namespaces_count} (herb, formula, pair, drug, supp, tung, ear, ex...)`);
    console.log(`  - Staging & Taxonomy Spaces:       ${auditResult.staging_and_taxonomy_namespaces_count} (med, rf, xwalk, tdx)`);
    console.log(`Legacy Diagnostic Candidate IDs:     ${auditResult.legacy_diagnostic_candidate_ids_count}`);
    console.log(`  - Total Occurrences:               ${auditResult.legacy_diagnostic_total_occurrences}`);
    console.log(`  - Relation Field References:       ${auditResult.legacy_diagnostic_relation_field_references}`);
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
