#!/usr/bin/env node
/**
 * report-pharm-coverage.js — 範圍 vs 實作的對帳。
 *
 * Ting: 「我要把整個框架先做好,才能掌控進度跟不重複做,而且知道做到哪個程度。」
 * 這支就是那個框架的儀表。drug_scope_manifest.json 說要做什麼,drugs.json 說
 * 做了什麼,兩邊對不上就報出來。
 *
 * 狀態不是宣稱,是算出來的。manifest 裡的 status 只是預期值 —— 這支重新從
 * drugs.json 的實際欄位推導,不一致就報 M3。這個專案有過太多次「回報 100%
 * 但資料不是」,所以進度數字必須能被一行指令重現(憲法 §D21)。
 *
 * Usage: node scripts/report-pharm-coverage.js [--tier P1] [--todo]
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'data/pharmacology');

const read = (f) => {
  const p = path.join(DIR, f);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
};

const len = (v) => (Array.isArray(v) ? v.length : (typeof v === 'string' ? v.trim().length : (v ? 1 : 0)));

/* Derived, not trusted. A record claims nothing; the fields decide the state. */
function deriveStatus(rec) {
  if (!rec) return 'planned';
  const hasIdentity = len(rec.name_en) && len(rec.drugclass_id);
  if (!hasIdentity) return 'planned';

  const officialSourced = ['contraindications_en', 'boxed_warning_en', 'drug_interactions_en']
    .some((f) => len(rec[f]) && ((rec.field_sources || {})[f] || []).some((s) => /^(dailymed|fda|official-label):/i.test(String(s))));
  if (officialSourced) return 'label_verified';

  const courseSourced = ['mechanism_en', 'indications_en', 'adverse_effects_en']
    .some((f) => len(rec[f]) && ((rec.field_sources || {})[f] || []).length);
  if (courseSourced) return 'course_filled';

  return 'skeleton';
}

const ORDER = ['planned', 'skeleton', 'course_filled', 'label_verified', 'ting_reviewed'];

function main() {
  const manifest = read('drug_scope_manifest.json');
  const drugsFile = read('drugs.json');
  if (!manifest) {
    console.log('找不到 drug_scope_manifest.json —— 範圍尚未定義。');
    return;
  }
  const scope = manifest.records || [];
  const built = new Map(((drugsFile && drugsFile.records) || []).map((d) => [d.id, d]));

  const tierFilter = (() => {
    const i = process.argv.indexOf('--tier');
    return i > -1 ? process.argv[i + 1] : null;
  })();

  const rows = scope
    .filter((s) => !tierFilter || s.tier === tierFilter)
    .map((s) => {
      const rec = built.get(s.id);
      const actual = deriveStatus(rec);
      return { ...s, actual, drift: rec && s.status !== actual };
    });

  // Tier summary
  const tiers = [...new Set(scope.map((s) => s.tier))].sort();
  console.log('===== 藥理範圍覆蓋 =====\n');
  console.log(`範圍總數    ${scope.length} 種`);
  console.log(`已建卡      ${scope.filter((s) => built.has(s.id)).length}\n`);

  console.log('層級'.padEnd(6) + '總數'.padStart(5) + '  ' + ORDER.map((o) => o.slice(0, 8).padStart(9)).join(''));
  tiers.forEach((t) => {
    const inTier = scope.filter((s) => s.tier === t);
    const counts = ORDER.map((st) => inTier.filter((s) => deriveStatus(built.get(s.id)) === st).length);
    console.log(t.padEnd(6) + String(inTier.length).padStart(5) + '  ' + counts.map((c) => String(c).padStart(9)).join(''));
  });

  console.log('\n層級說明:');
  Object.entries(manifest.tiers || {}).forEach(([k, v]) => console.log(`  ${k}  ${v}`));

  // M3 — manifest status disagreeing with the data
  const drift = rows.filter((r) => r.drift);
  if (drift.length) {
    console.log(`\n⚠️ M3 manifest 宣稱與資料不符 ${drift.length} 筆（以資料為準）:`);
    drift.forEach((d) => console.log(`  ${d.id.padEnd(30)} manifest=${d.status}  實際=${d.actual}`));
  }

  // M4 — built but not in scope
  const scopeIds = new Set(scope.map((s) => s.id));
  const extra = [...built.keys()].filter((id) => !scopeIds.has(id));
  if (extra.length) {
    console.log(`\n⚠️ M4 已建卡但不在範圍清單 ${extra.length} 筆:`);
    extra.forEach((id) => console.log('  ' + id));
  }

  if (process.argv.includes('--todo')) {
    const todo = rows.filter((r) => r.actual !== 'label_verified' && r.actual !== 'ting_reviewed');
    console.log(`\n--- 待辦 ${todo.length} 筆${tierFilter ? `（${tierFilter}）` : ''} ---`);
    todo.forEach((r) => {
      const note = r.acupuncture_note_zh ? `  ← ${r.acupuncture_note_zh}` : '';
      console.log(`  [${r.tier}] ${r.actual.padEnd(14)} ${r.name_zh} ${r.name_en} · ${r.class_hint}${note}`);
    });
  } else {
    console.log('\n（加 --todo 看待辦清單,--tier P1 只看某一層）');
  }
}

main();
