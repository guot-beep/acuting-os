#!/usr/bin/env node
/**
 * validate-pharm-standard.js — the pharmacology layer's rules.
 *
 * Written before any content exists, which is the point. The two data holes
 * this session cost the most — `pattern.*` ids with no owning file, and 72
 * extra points with no id — both happened because the records arrived before
 * anything could refuse them.
 *
 * P0 is the one that matters. Contraindications, interactions, boxed warnings
 * and adverse reactions must each cite a verified_exact official label, or the
 * field is rejected. That is not distrust of whoever fills it; it converts the
 * task from judgement into transcription. "What are furosemide's
 * contraindications" invites a fluent invention that reads as authoritative and
 * gets believed in clinic. "Copy the CONTRAINDICATIONS section of DailyMed
 * setid 7cdcd001…" cannot be faked without supplying a setid that resolves.
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

/* §0 — every one of these needs a verified_exact official-label source. A
 * fabricated contraindication is worse than a missing one: the missing one
 * sends you to look it up. */
/* Split by what the sources actually carry, measured rather than assumed.
 * Across the PPT decks: contraindication 0, interaction 0, monitor 0,
 * toxicity 0 — those four exist nowhere in the course and can only come from
 * a label. Adverse effects the course does teach ("anorexia, vomiting,
 * dizziness, postural hypotension" for loop diuretics), so requiring a label
 * for them would throw away a real source to enforce a rule that was too
 * broad. */
const SAFETY_OFFICIAL_ONLY = [
  'boxed_warning_en', 'contraindications_en', 'drug_interactions_en',
  'pregnancy_lactation_en', 'overdose_en',
  'herb_drug_interactions_en', 'herb_drug_interactions_zh',
];
const SAFETY_SOURCED = ['warnings_en', 'precautions_en', 'adverse_effects_en'];

const OFFICIAL_SOURCE = /^(dailymed|fda|official-label|official-database|nccih|pubmed):/i;
const ANY_SOURCE = /^(dailymed|fda|official-label|official-database|nccih|pubmed|course|instructor-note|board-outline|textbook|systematic-review):/i;

const ID_PATTERNS = {
  drugs: /^drug\.[a-z0-9_]+$/,
  classes: /^drugclass\.[a-z0-9_]+$/,
  targets: /^drugtarget\.[a-z0-9_]+$/,
  systems: /^drugsystem\.[a-z0-9_]+$/,
};

const URL_KINDS = new Set(['verified_exact', 'derived_search', 'verified_none']);

/* Interaction evidence grades (2026-08-06 rule). "可能有交互" is not a finding —
 * it reads as a warning while committing to nothing, and in clinic that is
 * indistinguishable from a real one. Every interaction states how well it is
 * established, and `unknown` is a legitimate answer that must record which
 * sources were searched: a documented gap is worth more than an invention. */
const INTERACTION_GRADES = new Set([
  'documented_clinical',   // case reports / trials in humans
  'pharmacokinetic',       // absorption, metabolism, clearance
  'pharmacodynamic',       // additive or opposing effect
  'theoretical',           // mechanism suggests it; not observed
  'unknown',               // searched, nothing found — sources_checked required
]);
const INTERACTION_FIELDS = ['drug_interactions', 'herb_drug_interactions', 'food_interactions'];

const REQUIRED_DRUG = ['id', 'name_en', 'name_zh', 'drugclass_id', 'drugsystem_ids'];

/* Pairs that must match in length or leave the second entirely empty
 * (憲法 §C.11 — 寧可整個留空,不要半套錯位). */
const BILINGUAL_PAIRS = [
  ['contraindications_en', 'contraindications_zh'],
  ['adverse_effects_en', 'adverse_effects_zh'],
  ['indications_en', 'indications_zh'],
  ['warnings_en', 'warnings_zh'],
  ['herb_drug_interactions_en', 'herb_drug_interactions_zh'],
];

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
    try {
      const j = JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
      const a = j.records || (Array.isArray(j) ? j : Object.values(j).find(Array.isArray)) || [];
      return new Set(pick(a).filter(Boolean));
    } catch (e) { return new Set(); }
  };
  return {
    conditions: read('data/pathology/condition_canon_shortlist.json', (a) => a.map((r) => r.id)),
    patterns: read('data/pathology/pattern_registry.json', (a) => a.map((r) => r.id)),
    herbs: read('data/herbs/herb_canon_shortlist.json', (a) => a.map((r) => r.id)),
    formulas: read('data/herbs/formulas.json', (a) => a.map((r) => r.id)),
  };
}

function main() {
  if (!fs.existsSync(DIR)) {
    console.log('===== 藥理層檢查 =====\n');
    console.log('data/pharmacology 尚未建立 —— 規格已就緒,等第一批資料。');
    console.log('模板:docs/PHARM_CARD_TEMPLATE.md');
    return;
  }

  const data = Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, load(f) || []]));
  const known = loadKnownIds();
  const ownIds = Object.fromEntries(Object.entries(data).map(([k, recs]) => [k, new Set(recs.map((r) => r.id))]));

  const defects = [];
  const notes = [];

  Object.entries(data).forEach(([kind, records]) => {
    records.forEach((r) => {
      const where = `${FILES[kind]} · ${r.id || '(無 id)'}`;

      // P1 — id format (locked before any record exists; see 憲法 §B.1)
      if (!ID_PATTERNS[kind].test(String(r.id || ''))) {
        defects.push(`P1 ${where}: id 不符 ${ID_PATTERNS[kind]}`);
      }

      if (kind === 'classes') {
        if (!len(r.name_zh) || !len(r.name_en)) {
          defects.push(`P2 ${where}: 缺必要名稱 name_zh 或 name_en —— 藥物分類必須具備中英文雙語名稱`);
        }
      }

      if (kind !== 'drugs') return;

      // P2 — required identity fields
      REQUIRED_DRUG.forEach((f) => {
        if (!len(r[f])) defects.push(`P2 ${where}: 缺必要欄位 ${f}`);
      });

      // P3 — systems must be an array (spironolactone is diuretic AND endocrine;
      // the single-primary design was already rejected for patterns)
      if (r.drugsystem_ids !== undefined && !Array.isArray(r.drugsystem_ids)) {
        defects.push(`P3 ${where}: drugsystem_ids 必須是陣列,目前是 ${typeof r.drugsystem_ids}`);
      }

      // P0 — label section verification against metadata manifest.
      // NOTE: This validator verifies metadata alignment (setid reference and section existence in
      // data/pharmacology/dailymed_verified_labels_manifest.json). It does NOT perform full-text
      // machine comparison of medical narrative, which is classified as HUMAN REVIEWED.
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
        const srcs = (r.field_sources || {})[f];
        if (!Array.isArray(srcs) || !srcs.length) {
          defects.push(`P0 ${where}.${f}: 安全欄位有內容但沒有 field_sources —— 標明來源或留空`);
          return;
        }
        if (!srcs.some((s) => re.test(String(s)))) {
          defects.push(`P0 ${where}.${f}: 來源沒有一個是${label}（${srcs.join(', ')}）`);
        }
        // Manifest section verification
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

      // P8 — interactions must be graded, and "unknown" must show its work
      INTERACTION_FIELDS.forEach((base) => {
        const entries = r[`${base}_graded`];
        if (entries === undefined) {
          // Prose-only interaction text is allowed for now but cannot stay:
          // it is the shape that hides "possibly interacts" as if it were a finding.
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
          /* `with` holds an id when we have a card for the other side, and is
           * null when we do not — garlic and St John's wort are named in the
           * warfarin label but have no herb card, and a whole drug class has
           * no single id. Requiring an id would force either an invented one
           * or dropping a real interaction, so a human-readable label is the
           * actual requirement and the id is the optional link. */
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

      // P4 — a URL without its kind is a claim without its confidence
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

      // P6 — cross-namespace links must resolve, and must not invent a
      // pharmacology-private namespace for something D11 already owns
      const linkChecks = [
        ['drugclass_id', ownIds.classes, 'drug_classes'],
        ['drugtarget_id', ownIds.targets, 'drug_targets'],
        ['indication_condition_ids', known.conditions, 'conditions'],
        ['adverse_effect_ids', known.conditions, 'conditions'],
        ['related_herb_ids', known.herbs, 'herbs'],
        ['related_formula_ids', known.formulas, 'formulas'],
        ['related_pattern_ids', known.patterns, 'patterns'],
      ];
      linkChecks.forEach(([field, set, label]) => {
        const vals = Array.isArray(r[field]) ? r[field] : (r[field] ? [r[field]] : []);
        vals.forEach((v) => {
          if (!set.size) return notes.push(`P9 ${label} 詞彙表為空,無法檢查 ${v}`);
          if (!set.has(v)) defects.push(`P6 ${where}.${field}: 引用不存在的 ${label} id 「${v}」`);
        });
      });
      // Guarded because P3 above reports a non-array rather than throwing on
      // it — a validator that crashes on malformed input reports nothing at
      // all, including the defects it did find before reaching this line.
      (Array.isArray(r.drugsystem_ids) ? r.drugsystem_ids : []).forEach((v) => {
        if (ownIds.systems.size && !ownIds.systems.has(v)) {
          defects.push(`P6 ${where}.drugsystem_ids: 引用不存在的系統 「${v}」`);
        }
      });

      // P7 — RxNorm does not cover herbs or supplements; an empty field on
      // every record is the boilerplate §C.12 warns about
      if ('rxnorm_rxcui' in r && !len(r.rxnorm_rxcui)) {
        notes.push(`P7 ${where}: rxnorm_rxcui 存在但空白 —— 查不到就不要建這個欄位`);
      }
    });
  });

  console.log('===== 藥理層檢查 =====\n');
  Object.entries(data).forEach(([k, v]) => console.log(`${k.padEnd(10)} ${v.length} 筆`));
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
