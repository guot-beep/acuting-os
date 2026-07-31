#!/usr/bin/env node
/* build-pattern-registry.js — give `pattern.*` ids a home.
 *
 * These ids are the backbone of both the condition atlas and the
 * differentiation tables, yet no file owns them: they exist only as strings
 * inside other records' related_patterns / tcm_patterns / compares. Nothing
 * carries their Chinese name, their aliases, or a source, and nothing can
 * detect a typo or a duplicate — which is how pattern.kidney_deficiency came
 * to sit alongside kidney_yang_deficiency, kidney_yin_deficiency and
 * kidney_essence_deficiency without anyone noticing.
 *
 * This builds data/pathology/pattern_registry.json from the actual usage.
 * Chinese names are filled ONLY where the id maps to tcm_pattern_canon with
 * confidence; the rest ship empty with needs_name=true, because inventing a
 * 證型 name is exactly the kind of guess that later reads as authoritative.
 *
 * DRY RUN BY DEFAULT. --write to persist.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONDITIONS = path.join(ROOT, 'data/pathology/condition_canon_shortlist.json');
const COMPARISONS = path.join(ROOT, 'data/knowledge/comparisons.json');
const CANON = path.join(ROOT, 'data/config/tcm_pattern_canon.json');
const OUT = path.join(ROOT, 'data/pathology/pattern_registry.json');

/* Explicit id → 中文 mapping. Every entry here was matched against a name that
 * actually appears in tcm_pattern_canon.json; nothing is transliterated. */
const NAME_ZH = {
  'pattern.blood_stasis': '血瘀',
  'pattern.phlegm_damp': '痰濕',
  'pattern.spleen_qi_deficiency': '脾氣虛',
  'pattern.liver_qi_stagnation': '肝氣鬱結',
  'pattern.qi_blood_deficiency': '氣血兩虛',
  'pattern.kidney_yang_deficiency': '腎陽虛',
  'pattern.qi_stagnation_blood_stasis': '氣滯血瘀',
  'pattern.kidney_yin_deficiency': '腎陰虛',
  'pattern.wind_damp_bi': '風濕痺阻',
  'pattern.kidney_essence_deficiency': '腎精不足',
  'pattern.damp_heat_lower_burner': '下焦濕熱',
  'pattern.damp_heat_spleen_stomach': '脾胃濕熱',
  'pattern.heart_spleen_deficiency': '心脾兩虛',
  'pattern.liver_fire': '肝火上炎',
  'pattern.blood_heat': '血熱',
  'pattern.liver_yang_rising': '肝陽上亢',
  'pattern.liver_blood_deficiency': '肝血虛',
  'pattern.stomach_heat': '胃熱',
  'pattern.lung_qi_deficiency': '肺氣虛',
  'pattern.heart_kidney_not_communicating': '心腎不交',
  'pattern.spleen_yang_deficiency': '脾陽虛',
  'pattern.lung_yin_deficiency': '肺陰虛',
  'pattern.heart_blood_deficiency': '心血虛',
  'pattern.wind_cold': '風寒',
  'pattern.wind_heat': '風熱',
  'pattern.cold_damp': '寒濕',
  'pattern.yin_deficiency': '陰虛',
  'pattern.yang_deficiency': '陽虛',
  'pattern.qi_deficiency': '氣虛',
  'pattern.blood_deficiency': '血虛',
};

/* Ids that look like a vaguer restatement of a more specific pattern already
 * in use. Not merged automatically — which one was meant in each card is a
 * clinical call, so they are flagged for Ting. */
const SUSPECTED_DUPES = {
  'pattern.kidney_deficiency': ['pattern.kidney_yang_deficiency', 'pattern.kidney_yin_deficiency', 'pattern.kidney_essence_deficiency'],
  'pattern.blood_deficiency': ['pattern.liver_blood_deficiency', 'pattern.heart_blood_deficiency', 'pattern.qi_blood_deficiency'],
};

const arr = (o, k) => (Array.isArray(o) ? o : (o && o[k]) || []);

function main() {
  const write = process.argv.includes('--write');
  const conditions = arr(JSON.parse(fs.readFileSync(CONDITIONS, 'utf8')), 'records');
  const comparisons = arr(JSON.parse(fs.readFileSync(COMPARISONS, 'utf8')), 'records');

  const use = new Map();
  const touch = (id, kind, ref) => {
    if (!String(id || '').startsWith('pattern.')) return;
    if (!use.has(id)) use.set(id, { conditions: [], comparisons: [] });
    use.get(id)[kind].push(ref);
  };
  conditions.forEach((c) => [c.related_patterns, c.tcm_patterns].forEach((l) =>
    (Array.isArray(l) ? l : []).forEach((p) => touch(typeof p === 'string' ? p : p && p.id, 'conditions', c.id))));
  comparisons.forEach((m) => (m.compares || []).forEach((p) => touch(p, 'comparisons', m.id)));

  const records = [...use.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([id, u]) => {
    const rec = {
      id,
      name_zh: NAME_ZH[id] || '',
      name_en: id.replace(/^pattern\./, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      used_by_conditions: u.conditions.length,
      used_by_comparisons: u.comparisons.length,
      review_status: 'draft',
      source_type: 'derived_from_usage',
    };
    if (!rec.name_zh) rec.needs_name_zh = true;
    if (!u.conditions.length) {
      rec.orphan_note_zh = '僅出現於鑑別卡,病症庫從未使用——可能是打字錯誤或應併入更具體的證型。';
    }
    if (SUSPECTED_DUPES[id]) {
      rec.suspected_duplicate_of = SUSPECTED_DUPES[id];
      rec.needs_owner_decision_zh = '此 id 較籠統,可能應併入上列較具體的證型。合併與否屬臨床判斷,待 Ting 決定。';
    }
    return rec;
  });

  const named = records.filter((r) => r.name_zh).length;
  const orphans = records.filter((r) => r.orphan_note_zh);
  console.log('===== 證型登錄檔 =====\n');
  console.log(`證型總數        ${records.length}`);
  console.log(`  已有中文名    ${named}`);
  console.log(`  待補中文名    ${records.length - named}`);
  console.log(`  僅見於鑑別卡  ${orphans.length}`);
  if (orphans.length) { console.log('\n--- 孤兒 id（需要你判斷）---'); orphans.forEach((o) => console.log(`  ${o.id}${o.suspected_duplicate_of ? '  疑似應併入: ' + o.suspected_duplicate_of.join(' / ') : ''}`)); }

  const noName = records.filter((r) => !r.name_zh);
  if (noName.length) { console.log('\n--- 待補中文名 ---'); noName.forEach((r) => console.log(`  ${r.id.padEnd(44)} 引用 ${r.used_by_conditions + r.used_by_comparisons}`)); }

  if (write) {
    fs.writeFileSync(OUT, JSON.stringify({
      dataset: 'pattern_registry',
      policy: '證型 id 的唯一登錄檔。name_zh 空白代表尚未由可靠來源確認——不要用音譯或推測填補（COMPARISON_CARD_TEMPLATE §0 同精神）。新增證型必須先在此登記,再被 conditions 或 comparisons 引用。',
      created: '2026-07-31',
      records,
    }, null, 2) + '\n');
    console.log(`\n已寫入 ${OUT}`);
  } else {
    console.log('\n（dry run：未寫入。加 --write 才落地。）');
  }
}

main();
