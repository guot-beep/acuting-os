#!/usr/bin/env node
/**
 * validate-pharm-standard.js — the pharmacology layer's rules and graph validator.
 *
 * Spec: docs/PHARM_CARD_TEMPLATE.md · docs/PHARM_SOURCE_TIERS.md
 * Usage: node scripts/validate-pharm-standard.js [--worklist]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'data/pharmacology');

const FILES = {
  drugs: 'drugs.json',
  classes: 'drug_classes.json',
  targets: 'drug_targets.json',
  systems: 'drug_systems.json',
};

const SAFETY_OFFICIAL_ONLY = [
  'boxed_warning_en', 'boxed_warning_zh',
  'contraindications_en', 'contraindications_zh',
  'class_contraindications_en', 'class_contraindications_zh',
  'drug_interactions_en', 'drug_interactions_zh',
  'pregnancy_lactation_en', 'pregnancy_lactation_zh',
  'overdose_en',
  'herb_drug_interactions_en', 'herb_drug_interactions_zh',
];
const SAFETY_SOURCED = [
  'warnings_en', 'warnings_zh',
  'class_warnings_en', 'class_warnings_zh',
  'precautions_en', 'precautions_zh',
  'adverse_effects_en', 'adverse_effects_zh',
  'serious_adverse_effects_en', 'serious_adverse_effects_zh',
  'shared_adverse_effects_en', 'shared_adverse_effects_zh',
  'renal_considerations_en', 'hepatic_considerations_en',
  'monitoring_requirements_en',
];

// OFFICIAL_SOURCE must NOT include course:, instructor-note:, board-outline:, textbook:
const OFFICIAL_SOURCE = /^(dailymed|fda|official-label|official-database|nccih|pubmed):/i;
const ANY_SOURCE = /^(dailymed|fda|official-label|official-database|nccih|pubmed|course|instructor-note|board-outline|textbook|systematic-review):/i;

const ID_PATTERNS = {
  drugs: /^drug\.[a-z0-9_]+$/,
  classes: /^drugclass\.[a-z0-9_]+$/,
  targets: /^drugtarget\.[a-z0-9_]+$/,
  systems: /^drugsystem\.[a-z0-9_]+$/,
};

const URL_KINDS = new Set(['verified_exact', 'derived_search', 'verified_none']);

const INTERACTION_GRADES = new Set([
  'documented_clinical',
  'pharmacokinetic',
  'pharmacodynamic',
  'theoretical',
  'unknown',
]);
const INTERACTION_FIELDS = ['drug_interactions', 'herb_drug_interactions', 'food_interactions'];

const REQUIRED_DRUG = ['id', 'name_en', 'name_zh', 'drugclass_id', 'drugsystem_ids'];

const BILINGUAL_PAIRS = [
  ['contraindications_en', 'contraindications_zh'],
  ['adverse_effects_en', 'adverse_effects_zh'],
  ['indications_en', 'indications_zh'],
  ['warnings_en', 'warnings_zh'],
  ['herb_drug_interactions_en', 'herb_drug_interactions_zh'],
];

const INTEGRATIVE_CLINICAL_FLAGS = new Set([
  'bleeding_risk',
  'bradycardia',
  'orthostatic_hypotension',
  'sedation_dizziness',
  'photosensitivity',
  'immunosuppression',
  'infection_risk',
  'bone_health',
  'glucose_effects',
  'masking_hypoglycemia',
  'electrolyte_hyperkalemia',
  'electrolyte_hypokalemia',
  'procedural_safety',
  'cough_side_effect',
  'angioedema_risk',
]);

const VERIFICATION_STATUSES = new Set([
  'unverified',
  'machine_metadata_verified',
  'human_reviewed',
]);

const load = (name) => {
  const p = path.join(DIR, name);
  if (!fs.existsSync(p)) return null;
  try {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    return j.records || (Array.isArray(j) ? j : []);
  } catch (e) {
    console.error(`FAIL ${name}: JSON 無法解析 — ${e.message}`);
    process.exitCode = 1;
    return [];
  }
};

const len = (v) => (Array.isArray(v) ? v.length : (typeof v === 'string' ? v.trim().length : (v ? 1 : 0)));

function loadKnownIds() {
  const read = (rel, pick) => {
    const fullPath = path.join(ROOT, rel);
    if (!fs.existsSync(fullPath)) return { set: new Set(), loaded: false, file: rel };
    try {
      const j = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const a = j.records || (Array.isArray(j) ? j : Object.values(j).find(Array.isArray)) || [];
      return { set: new Set(pick(a).filter(Boolean)), loaded: true, file: rel };
    } catch (e) {
      return { set: new Set(), loaded: false, file: rel, error: e.message };
    }
  };
  return {
    conditions: read('data/pathology/condition_canon_shortlist.json', (a) => a.map((r) => r.id)),
    symptoms: read('data/config/symptom_taxonomy.json', (a) => a.map((r) => r.id)),
    patterns: read('data/pathology/pattern_registry.json', (a) => a.map((r) => r.id)),
    herbs: read('data/herbs/herb_canon_shortlist.json', (a) => a.map((r) => r.id)),
    formulas: read('data/herbs/formulas.json', (a) => a.map((r) => r.id)),
  };
}

function main() {
  if (!fs.existsSync(DIR)) {
    console.log('===== 藥理層檢查 =====\n');
    console.log('data/pharmacology 尚未建立 —— 規格已就緒,等第一批資料。');
    return;
  }

  const data = Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, load(f) || []]));
  const known = loadKnownIds();
  const ownIds = Object.fromEntries(Object.entries(data).map(([k, recs]) => [k, new Set(recs.map((r) => r.id))]));

  const defects = [];
  const notes = [];

  const metrics = {
    systemsTotal: data.systems.length,
    targetsTotal: data.targets.length,
    classesTotal: data.classes.length,
    drugsTotal: data.drugs.length,
    duplicateIds: 0,
    unresolvedDrugClass: 0,
    unresolvedDrugTarget: 0,
    unresolvedDrugSystem: 0,
    unresolvedClassTarget: 0,
    unresolvedClassSystem: 0,
    unresolvedPrototypeDrug: 0,
    unresolvedRepDrugs: 0,
    classDrugReverseMismatch: 0,
    unresolvedCondLinks: 0,
    unresolvedSymLinks: 0,
    unresolvedHerbFormulaPatternLinks: 0,
    invalidVerificationStates: 0,
    safetyMissingProvenance: 0,
    unknownIntegrativeFlags: 0,
  };

  // 0. Check missing registries
  Object.entries(known).forEach(([name, reg]) => {
    if (!reg.loaded && name !== 'symptoms') {
      defects.push(`P9 關鍵詞彙庫 ${name} (${reg.file}) 無法載入或不存在`);
    }
  });

  // 1. Check duplicate IDs across all namespaces
  Object.entries(data).forEach(([kind, recs]) => {
    const seen = new Set();
    recs.forEach((r) => {
      if (!r.id) return;
      if (seen.has(r.id)) {
        defects.push(`P1 ${FILES[kind]}: 重覆的 id 「${r.id}」`);
        metrics.duplicateIds++;
      }
      seen.add(r.id);
    });
  });

  // 2. Validate classes
  data.classes.forEach((c) => {
    const where = `${FILES.classes} · ${c.id || '(無 id)'}`;

    if (!ID_PATTERNS.classes.test(String(c.id || ''))) {
      defects.push(`P1 ${where}: id 不符 ${ID_PATTERNS.classes}`);
    }

    if (!len(c.name_zh) || !len(c.name_en)) {
      defects.push(`P2 ${where}: 缺必要名稱 name_zh 或 name_en —— 藥物分類必須具備中英文雙語名稱`);
    }

    if (c.drugtarget_id && !ownIds.targets.has(c.drugtarget_id)) {
      defects.push(`P6 ${where}.drugtarget_id: 引用不存在的 target id 「${c.drugtarget_id}」`);
      metrics.unresolvedClassTarget++;
    }

    (Array.isArray(c.drugsystem_ids) ? c.drugsystem_ids : []).forEach((sysId) => {
      if (!ownIds.systems.has(sysId)) {
        defects.push(`P6 ${where}.drugsystem_ids: 引用不存在的 system id 「${sysId}」`);
        metrics.unresolvedClassSystem++;
      }
    });

    if (c.prototype_drug_id) {
      if (!ownIds.drugs.has(c.prototype_drug_id)) {
        defects.push(`P6 ${where}.prototype_drug_id: 引用不存在的 drug id 「${c.prototype_drug_id}」`);
        metrics.unresolvedPrototypeDrug++;
      } else {
        const pDrug = data.drugs.find((d) => d.id === c.prototype_drug_id);
        if (pDrug && pDrug.drugclass_id !== c.id) {
          defects.push(`P6 ${where}.prototype_drug_id: 反向不一致 —— ${c.id}.prototype_drug_id 為 ${c.prototype_drug_id}，但該藥物的 drugclass_id 為 「${pDrug.drugclass_id}」`);
          metrics.classDrugReverseMismatch++;
        }
      }
    }

    (Array.isArray(c.representative_drug_ids) ? c.representative_drug_ids : []).forEach((rdId) => {
      if (!ownIds.drugs.has(rdId)) {
        defects.push(`P6 ${where}.representative_drug_ids: 引用不存在的 drug id 「${rdId}」`);
        metrics.unresolvedRepDrugs++;
      } else {
        const rDrug = data.drugs.find((d) => d.id === rdId);
        if (rDrug && rDrug.drugclass_id !== c.id) {
          defects.push(`P6 ${where}.representative_drug_ids: 反向不一致 —— ${c.id}.representative_drug_ids 包含 ${rdId}，但該藥物的 drugclass_id 為 「${rDrug.drugclass_id}」`);
          metrics.classDrugReverseMismatch++;
        }
      }
    });

    (Array.isArray(c.indication_condition_ids) ? c.indication_condition_ids : []).forEach((cid) => {
      if (!known.conditions.set.has(cid)) {
        defects.push(`P6 ${where}.indication_condition_ids: 引用不存在的 condition id 「${cid}」`);
        metrics.unresolvedCondLinks++;
      }
    });

    if (c.related_condition_ids) {
      defects.push(`P2 ${where}.related_condition_ids: 已作廢欄位名稱，請使用 indication_condition_ids`);
      metrics.unresolvedCondLinks++;
    }

    // Safety fields MUST use FIELD-LEVEL provenance (c.field_sources[f]), NOT generic c.sources!
    const checkClassSafety = (f, re, label) => {
      if (!len(c[f])) return;
      const srcKey = f.endsWith('_zh') ? f.replace(/_zh$/, '_en') : f;
      const srcs = (c.field_sources || {})[f] || (c.field_sources || {})[srcKey];
      if (!Array.isArray(srcs) || !srcs.length) {
        defects.push(`P0 ${where}.${f}: 類別安全欄位有內容但沒有專屬 field_sources [${f}] —— 通用 sources 不得作為安全欄位證明`);
        metrics.safetyMissingProvenance++;
        return;
      }
      if (!srcs.some((s) => re.test(String(s)))) {
        defects.push(`P0 ${where}.${f}: 來源沒有一個是${label}（${srcs.join(', ')}）`);
        metrics.safetyMissingProvenance++;
      }
    };
    ['class_contraindications_en', 'class_contraindications_zh'].forEach((f) => checkClassSafety(f, OFFICIAL_SOURCE, '官方標籤'));
    ['class_warnings_en', 'class_warnings_zh', 'shared_adverse_effects_en', 'shared_adverse_effects_zh'].forEach((f) => checkClassSafety(f, ANY_SOURCE, '具名來源'));
  });

  // 3. Validate drugs
  data.drugs.forEach((r) => {
    const where = `${FILES.drugs} · ${r.id || '(無 id)'}`;

    if (!ID_PATTERNS.drugs.test(String(r.id || ''))) {
      defects.push(`P1 ${where}: id 不符 ${ID_PATTERNS.drugs}`);
    }

    REQUIRED_DRUG.forEach((f) => {
      if (!len(r[f])) defects.push(`P2 ${where}: 缺必要欄位 ${f}`);
    });

    if (r.drugsystem_ids !== undefined && !Array.isArray(r.drugsystem_ids)) {
      defects.push(`P3 ${where}: drugsystem_ids 必須是陣列,目前是 ${typeof r.drugsystem_ids}`);
    }

    // Deprecated overdose_toxicity_notes_en blocking check
    if ('overdose_toxicity_notes_en' in r) {
      defects.push(`P2 ${where}: overdose_toxicity_notes_en 為已作廢欄位，請遷移至 overdose_en`);
    }

    // Check forward links
    if (r.drugclass_id && !ownIds.classes.has(r.drugclass_id)) {
      defects.push(`P6 ${where}.drugclass_id: 引用不存在的 drugclass id 「${r.drugclass_id}」`);
      metrics.unresolvedDrugClass++;
    }

    if (r.drugtarget_id && !ownIds.targets.has(r.drugtarget_id)) {
      defects.push(`P6 ${where}.drugtarget_id: 引用不存在的 target id 「${r.drugtarget_id}」`);
      metrics.unresolvedDrugTarget++;
    }

    (Array.isArray(r.drugsystem_ids) ? r.drugsystem_ids : []).forEach((v) => {
      if (!ownIds.systems.has(v)) {
        defects.push(`P6 ${where}.drugsystem_ids: 引用不存在的系統 「${v}」`);
        metrics.unresolvedDrugSystem++;
      }
    });

    if (r.related_condition_ids) {
      defects.push(`P2 ${where}.related_condition_ids: 已作廢欄位名稱，請升級為 indication_condition_ids`);
      metrics.unresolvedCondLinks++;
    }

    (Array.isArray(r.indication_condition_ids) ? r.indication_condition_ids : []).forEach((v) => {
      if (!known.conditions.set.has(v)) {
        defects.push(`P6 ${where}.indication_condition_ids: 引用不存在的 condition id 「${v}」`);
        metrics.unresolvedCondLinks++;
      }
    });

    (Array.isArray(r.adverse_effect_ids) ? r.adverse_effect_ids : []).forEach((v) => {
      if (v.startsWith('cond.')) {
        if (!known.conditions.set.has(v)) {
          defects.push(`P6 ${where}.adverse_effect_ids: 引用不存在的 condition id 「${v}」`);
          metrics.unresolvedCondLinks++;
        }
      } else if (v.startsWith('sym.')) {
        if (!known.symptoms.loaded) {
          notes.push(`P9 sym.* 命名空間尚未建立 (${v}) —— 記錄為已知限制`);
          metrics.unresolvedSymLinks++;
        } else if (!known.symptoms.set.has(v)) {
          defects.push(`P6 ${where}.adverse_effect_ids: 引用不存在的 symptom id 「${v}」`);
          metrics.unresolvedSymLinks++;
        }
      } else {
        defects.push(`P6 ${where}.adverse_effect_ids: id 「${v}」命名空間不符合 cond.* 或 sym.*`);
        metrics.unresolvedCondLinks++;
      }
    });

    (Array.isArray(r.related_herb_ids) ? r.related_herb_ids : []).forEach((v) => {
      if (!known.herbs.set.has(v)) {
        defects.push(`P6 ${where}.related_herb_ids: 引用不存在的 herb id 「${v}」`);
        metrics.unresolvedHerbFormulaPatternLinks++;
      }
    });

    (Array.isArray(r.related_formula_ids) ? r.related_formula_ids : []).forEach((v) => {
      if (!known.formulas.set.has(v)) {
        defects.push(`P6 ${where}.related_formula_ids: 引用不存在的 formula id 「${v}」`);
        metrics.unresolvedHerbFormulaPatternLinks++;
      }
    });

    (Array.isArray(r.related_pattern_ids) ? r.related_pattern_ids : []).forEach((v) => {
      if (!known.patterns.set.has(v)) {
        defects.push(`P6 ${where}.related_pattern_ids: 引用不存在的 pattern id 「${v}」`);
        metrics.unresolvedHerbFormulaPatternLinks++;
      }
    });

    // Verification Status Check
    if (r.verification_status) {
      if (!VERIFICATION_STATUSES.has(r.verification_status)) {
        defects.push(`P4 ${where}.verification_status: 「${r.verification_status}」不在允許範圍 ${[...VERIFICATION_STATUSES].join('/')}`);
        metrics.invalidVerificationStates++;
      }
      if (r.verification_status === 'human_reviewed') {
        if (!r.reviewed_by || !r.reviewed_at) {
          defects.push(`P0 ${where}.verification_status: 標註為 human_reviewed 但缺少 reviewed_by 或 reviewed_at 審核者資訊`);
          metrics.invalidVerificationStates++;
        } else if (typeof r.reviewed_by === 'string' && /^(v7_ingestion|claude|antigravity|codex|chatgpt|ai_agent|script)/i.test(r.reviewed_by)) {
          defects.push(`P0 ${where}.verification_status: AI/腳本（${r.reviewed_by}）不得作為人類審核者 reviewed_by`);
          metrics.invalidVerificationStates++;
        }
      }
    }

    // Integrative Clinical Flags Controlled Vocabulary Check
    if (r.integrative_clinical_flags) {
      if (!Array.isArray(r.integrative_clinical_flags)) {
        defects.push(`P3 ${where}.integrative_clinical_flags: 必須是陣列`);
      } else {
        r.integrative_clinical_flags.forEach((flag) => {
          if (!INTEGRATIVE_CLINICAL_FLAGS.has(flag)) {
            defects.push(`P4 ${where}.integrative_clinical_flags: 未知臨床旗標 「${flag}」，不在受控詞彙中`);
            metrics.unknownIntegrativeFlags++;
          }
        });
      }
    }

    // Label Section & Safety Source Validation
    let labelManifestMap = new Map();
    try {
      const manifestPath = path.join(DIR, 'dailymed_verified_labels_manifest.json');
      if (fs.existsSync(manifestPath)) {
        const mData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        (mData.labels || []).forEach(l => labelManifestMap.set(l.drug_id, l));
      }
    } catch (e) {}

    const checkSourced = (f, re, label) => {
      if (!len(r[f])) return;
      const srcKey = f.endsWith('_zh') ? f.replace(/_zh$/, '_en') : f;
      const srcs = (r.field_sources || {})[f] || (r.field_sources || {})[srcKey];
      if (!Array.isArray(srcs) || !srcs.length) {
        defects.push(`P0 ${where}.${f}: 安全欄位有內容但沒有專屬 field_sources [${f}] —— 通用 sources 不得作為安全欄位證明`);
        metrics.safetyMissingProvenance++;
        return;
      }
      if (!srcs.some((s) => re.test(String(s)))) {
        defects.push(`P0 ${where}.${f}: 來源沒有一個是${label}（${srcs.join(', ')}）`);
        metrics.safetyMissingProvenance++;
      }
      const labelMeta = labelManifestMap.get(r.id);
      if (labelMeta && r.dailymed_setid) {
        srcs.forEach(s => {
          if (typeof s === 'string' && s.startsWith('dailymed:')) {
            if (!s.includes(r.dailymed_setid)) {
              defects.push(`P0 ${where}.${f}: field_source setid mismatch! Source "${s}" does not match drug dailymed_setid "${r.dailymed_setid}"`);
            }
          }
        });
        if (f === 'boxed_warning_en' && !labelMeta.verified_sections.includes('BOXED_WARNING')) {
          defects.push(`P0 ${where}.${f}: boxed_warning_en present but verified label manifest indicates BOXED_WARNING section is absent!`);
        }
        if (f === 'contraindications_en' && !labelMeta.verified_sections.includes('CONTRAINDICATIONS') && !labelMeta.verified_sections.includes('DO_NOT_USE')) {
          defects.push(`P0 ${where}.${f}: contraindications_en present but verified label manifest indicates CONTRAINDICATIONS section is absent!`);
        }
      }
    };
    SAFETY_OFFICIAL_ONLY.forEach((f) => checkSourced(f, OFFICIAL_SOURCE, '官方標籤'));
    SAFETY_SOURCED.forEach((f) => checkSourced(f, ANY_SOURCE, '具名來源'));

    // P8 — interactions
    INTERACTION_FIELDS.forEach((base) => {
      const entries = r[`${base}_graded`];
      if (entries === undefined) {
        if (len(r[`${base}_en`]) || len(r[`${base}_zh`])) {
          notes.push(`P8 ${where}.${base}: 只有散文,尚未分級 —— 之後要轉成 ${base}_graded`);
        }
        return;
      }
      if (!Array.isArray(entries)) {
        defects.push(`P8 ${where}.${base}_graded: 必須是陣列`);
        return;
      }
      entries.forEach((e, i) => {
        const at = `${where}.${base}_graded[${i}]`;
        if (!e || !(e.with || e.with_label_en || e.with_label_zh)) {
          defects.push(`P8 ${at}: 缺 with 或 with_label —— 至少要說得出跟什麼交互`);
        }
        if (!INTERACTION_GRADES.has(e.evidence)) {
          defects.push(`P8 ${at}: evidence「${e.evidence}」不在 ${[...INTERACTION_GRADES].join('/')}`);
        }
        if (e.evidence === 'unknown' && !(Array.isArray(e.sources_checked) && e.sources_checked.length)) {
          defects.push(`P8 ${at}: evidence=unknown 必須列出 sources_checked —— 查過哪些來源才是這一筆的價值`);
        }
        if (e.evidence !== 'unknown' && !(Array.isArray(e.sources) && e.sources.length)) {
          defects.push(`P8 ${at}: 非 unknown 的分級必須有 sources`);
        }
      });
    });

    // P4 — URL kinds
    Object.keys(r).filter((k) => k.endsWith('_url')).forEach((k) => {
      if (!len(r[k])) return;
      const kindKey = `${k}_kind`;
      if (!r[kindKey]) {
        defects.push(`P4 ${where}.${k}: 缺 ${kindKey} —— 搜尋連結與專屬頁不可長得一樣`);
      } else if (!URL_KINDS.has(r[kindKey])) {
        defects.push(`P4 ${where}.${kindKey}: 值 ${r[kindKey]} 不在 ${[...URL_KINDS].join('/')}`);
      }
    });

    // P5 — bilingual alignment
    BILINGUAL_PAIRS.forEach(([en, zh]) => {
      const a = Array.isArray(r[en]) ? r[en].length : 0;
      const b = Array.isArray(r[zh]) ? r[zh].length : 0;
      if (b > 0 && a !== b) {
        defects.push(`P5 ${where}: ${en}(${a}) 與 ${zh}(${b}) 長度不符 —— 寧可整個留空`);
      }
    });

    if ('rxnorm_rxcui' in r && !len(r.rxnorm_rxcui)) {
      notes.push(`P7 ${where}: rxnorm_rxcui 存在但空白 —— 查不到就不要建這個欄位`);
    }
  });

  console.log('===== 藥理層檢查 =====\n');
  Object.entries(data).forEach(([k, v]) => console.log(`${k.padEnd(10)} ${v.length} 筆`));

  console.log('\n===== PHARMACOLOGY FOUNDATION GRAPH AUDIT =====');
  console.log(`systems total:               ${metrics.systemsTotal}`);
  console.log(`targets total:               ${metrics.targetsTotal}`);
  console.log(`classes total:               ${metrics.classesTotal}`);
  console.log(`drugs total:                 ${metrics.drugsTotal}`);
  console.log(`duplicate IDs:               ${metrics.duplicateIds}`);
  console.log(`unresolved drug->class:      ${metrics.unresolvedDrugClass}`);
  console.log(`unresolved drug->target:     ${metrics.unresolvedDrugTarget}`);
  console.log(`unresolved drug->system:     ${metrics.unresolvedDrugSystem}`);
  console.log(`unresolved class->target:    ${metrics.unresolvedClassTarget}`);
  console.log(`unresolved class->system:    ${metrics.unresolvedClassSystem}`);
  console.log(`unresolved prototype drug:   ${metrics.unresolvedPrototypeDrug}`);
  console.log(`unresolved representative:   ${metrics.unresolvedRepDrugs}`);
  console.log(`class/drug reverse mismatch: ${metrics.classDrugReverseMismatch}`);
  console.log(`unresolved cond.* links:     ${metrics.unresolvedCondLinks}`);
  console.log(`unresolved sym.* links:      ${metrics.unresolvedSymLinks}`);
  console.log(`unresolved herb/formula/pat: ${metrics.unresolvedHerbFormulaPatternLinks}`);
  console.log(`invalid verification states: ${metrics.invalidVerificationStates}`);
  console.log(`safety missing provenance:   ${metrics.safetyMissingProvenance}`);
  console.log(`unknown integrative flags:   ${metrics.unknownIntegrativeFlags}`);

  console.log(`\n阻擋問題    ${defects.length}`);
  console.log(`提醒        ${new Set(notes).size}`);

  if (notes.length) {
    console.log('\n🟡 提醒:');
    [...new Set(notes)].slice(0, 10).forEach((n) => console.log('  ' + n));
  }
  if (defects.length) {
    console.log(`\n❌ ${defects.length} 個阻擋問題:\n`);
    const show = process.argv.includes('--worklist') ? defects : defects.slice(0, 30);
    show.forEach((d) => console.log('  ' + d));
    if (!process.argv.includes('--worklist') && defects.length > 30) {
      console.log(`  … 還有 ${defects.length - 30}（--worklist 看全部）`);
    }
    console.log('\nP0 = 安全欄位沒有官方來源。規格:docs/PHARM_CARD_TEMPLATE.md §0');
    process.exitCode = 1;
  } else {
    console.log('\nvalidate-pharm-standard: PASS');
  }
}

main();
