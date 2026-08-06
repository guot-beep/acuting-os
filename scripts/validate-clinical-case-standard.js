#!/usr/bin/env node
/**
 * validate-clinical-case-standard.js — the case layer's two hard rules.
 *
 * This layer had no validator at all, which matters more here than elsewhere
 * because both of its rules are things you cannot walk back.
 *
 * K-series · PHI. 憲法 §B.4 forbids patient data in `data/` — the real record
 * lives in data/clinical_cases/{local,private,exports}, which are gitignored.
 * Until now that rule existed only as a sentence in case_template.json's
 * privacy_note. A phone number committed once is in git history forever, so
 * this is checked before anything else and it blocks.
 *
 * F-series · foreign keys. Cases reference knowledge records by id (D2). A
 * reference to an id that does not exist is a link that silently resolves to
 * nothing — and we have just seen how that happens: all 72 extra points carry
 * a `code` and no `id`, so any case pointing at one of them would dangle.
 * Checked against the real vocabularies, not a regex on the shape of the id.
 *
 * Usage: node scripts/validate-clinical-case-standard.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CASE_DIR = path.join(ROOT, 'data/clinical_cases');

/* Directories holding the real records. They are gitignored, so they are not
 * scanned for PHI — that is where PHI is supposed to be. */
const PRIVATE_DIRS = new Set(['local', 'private', 'exports']);

/* Direct identifiers. Deliberately narrow: a rule that fires on ordinary
 * clinical prose gets switched off, and then it protects nothing. Each pattern
 * matches something that is an identifier and is not plausibly anything else. */
const PHI_PATTERNS = [
  { id: 'K1', label: '電話號碼', re: /(?:\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/ },
  { id: 'K2', label: 'Email', re: /[\w.+-]+@[\w-]+\.[\w.]{2,}/ },
  { id: 'K3', label: '社會安全號碼', re: /\b\d{3}-\d{2}-\d{4}\b/ },
  { id: 'K4', label: '完整出生日期', re: /\b(?:19|20)\d{2}[-/](?:0?[1-9]|1[0-2])[-/](?:0?[1-9]|[12]\d|3[01])\b/ },
  { id: 'K5', label: '保險/病歷號', re: /\b(?:MRN|Member\s*ID|Policy\s*(?:No|Number|#))\s*[:#]?\s*\S+/i },
];

/* Fields whose value is a date by design — a visit date is not an identifier,
 * and flagging it would make K4 unusable. Birth dates are the thing K4 exists
 * for, so they are not exempted. */
const DATE_FIELDS = new Set([
  'visit_date', 'next_follow_up', 'date', 'start_date', 'end_date', 'onset_date',
  'updated', 'updated_at', 'created', 'created_at', 'reviewed', 'last_reviewed',
  'fetched_at', 'generated_at', 'parsed_at', 'authored_at',
]);

/* Matched against the FIELD the string sits in, never the whole path. Matching
 * the path meant every string under `acupuncture` — side, technique, "bilateral",
 * "tonify Spleen qi" — was read as a point id and reported as a dangling
 * reference. A check that fires on ordinary prose gets ignored, and then it
 * guards nothing. */
const REF_KINDS = [
  { field: /^(western_conditions|condition_ids|cond_ids)$/, prefix: 'cond.', vocab: 'conditions' },
  { field: /^(tcm_patterns|pattern_ids|related_patterns)$/, prefix: 'pattern.', vocab: 'patterns' },
  { field: /^eastern_diseases$/, prefix: 'tdis.', vocab: 'eastern' },
  { field: /^(formulas|formula_ids|formula_id)$/, prefix: 'formula.', vocab: 'formulas' },
  { field: /^(herbs|herb_ids|herb_id)$/, prefix: 'herb.', vocab: 'herbs' },
  { field: /^(point|point_id|point_ids|code|acupoint_id)$/, prefix: null, vocab: 'points' },
];

function loadVocabularies() {
  const read = (rel, pick) => {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
      return new Set(pick(j).filter(Boolean));
    } catch (e) { return null; }
  };
  const arr = (j) => j.records || j.points || (Array.isArray(j) ? j : Object.values(j).find(Array.isArray)) || [];
  return {
    conditions: read('data/pathology/condition_canon_shortlist.json', (j) => arr(j).map((r) => r.id)),
    patterns: read('data/pathology/pattern_registry.json', (j) => arr(j).map((r) => r.id)),
    formulas: read('data/herbs/formulas.json', (j) => arr(j).map((r) => r.id)),
    herbs: read('data/herbs/herb_canon_shortlist.json', (j) => arr(j).map((r) => r.id)),
    points: read('data/acupoints/point_id_manifest.json', (j) => j.ids || []),
    eastern: null,   // tdis.* has no owning file yet — reported, not blocked
  };
}

function walkJson(node, visit, keyPath = []) {
  if (Array.isArray(node)) return node.forEach((v, i) => walkJson(v, visit, keyPath.concat(String(i))));
  if (node && typeof node === 'object') {
    return Object.entries(node).forEach(([k, v]) => walkJson(v, visit, keyPath.concat(k)));
  }
  visit(node, keyPath);
}

function main() {
  if (!fs.existsSync(CASE_DIR)) {
    console.log('data/clinical_cases 不存在,略過。');
    return;
  }
  const files = fs.readdirSync(CASE_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.json'))
    .map((e) => e.name);

  const vocab = loadVocabularies();
  const defects = [];
  const notes = [];
  let refsChecked = 0;

  files.forEach((name) => {
    const rel = `data/clinical_cases/${name}`;
    let json;
    try { json = JSON.parse(fs.readFileSync(path.join(CASE_DIR, name), 'utf8')); }
    catch (e) { return defects.push(`K0 ${rel}: JSON 無法解析 — ${e.message}`); }

    walkJson(json, (value, keyPath) => {
      if (typeof value !== 'string' || !value) return;
      const field = keyPath[keyPath.length - 1] || '';

      // K-series — PHI
      PHI_PATTERNS.forEach((p) => {
        if (p.id === 'K4' && DATE_FIELDS.has(field)) return;
        if (p.re.test(value)) {
          defects.push(`${p.id} ${rel} · ${keyPath.join('.')}: 疑似${p.label} — 「${value.slice(0, 40)}」`);
        }
      });

      // F-series — foreign keys
      REF_KINDS.forEach((kind) => {
        // An array's elements arrive with a numeric field, so fall back to the
        // key that owns the array: case_links.tcm_patterns.0 -> tcm_patterns.
        const owner = /^\d+$/.test(field) ? (keyPath[keyPath.length - 2] || '') : field;
        if (!kind.field.test(owner)) return;
        if (kind.prefix && !value.startsWith(kind.prefix)) return;
        const set = vocab[kind.vocab];
        if (!set) { notes.push(`F9 ${rel}: ${kind.vocab} 詞彙表不存在,無法檢查 ${value}`); return; }
        refsChecked += 1;
        if (!set.has(value)) defects.push(`F1 ${rel} · ${keyPath.join('.')}: 引用不存在的 ${kind.vocab} id 「${value}」`);
      });
    });
  });

  console.log('===== 臨床病例層檢查 =====\n');
  console.log(`受檢檔案        ${files.length}  (gitignored 的 ${[...PRIVATE_DIRS].join('/')} 不掃)`);
  console.log(`檢查的引用      ${refsChecked}`);
  console.log(`詞彙表          ${Object.entries(vocab).filter(([, v]) => v).map(([k, v]) => `${k}:${v.size}`).join(' · ')}`);
  console.log(`問題            ${defects.length}`);

  if (notes.length) {
    console.log(`\n🟡 ${new Set(notes).size} 個提醒:`);
    [...new Set(notes)].slice(0, 8).forEach((n) => console.log('  ' + n));
  }

  if (defects.length) {
    console.log(`\n❌ ${defects.length} 個阻擋問題:\n`);
    defects.slice(0, 30).forEach((d) => console.log('  ' + d));
    if (defects.length > 30) console.log(`  … 還有 ${defects.length - 30}`);
    console.log('\nK 系列 = 病人識別資訊。真正的病歷放 data/clinical_cases/local|private|exports(已 gitignore)。');
    console.log('提交過的 PHI 會永久留在 git 歷史裡,發現了不要只是刪掉檔案 —— 告訴 Ting。');
    process.exitCode = 1;
  } else {
    console.log('\nvalidate-clinical-case-standard: PASS');
  }
}

main();
