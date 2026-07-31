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
  'pattern.kidney_deficiency': '腎虛',
};

/* Category-level patterns. 腎虛 is not a vague way of saying 腎陽虛 — it is the
 * class that 腎陽虛, 腎陰虛 and 腎精不足 belong to, and those three are exactly
 * what a differentiation table for it compares. So these ids are legitimate
 * and stay; they are marked level=category rather than merged away.
 *
 * Membership is deliberately many-to-many. 腎陰虛 belongs to BOTH 腎虛 (by
 * organ) and 陰虛 (by nature), because TCM patterns are classified on two
 * crossing axes, not one tree. A single parent field cannot say that. */
const CATEGORIES = {
  'pattern.kidney_deficiency': {
    axis: 'zang_fu',
    members: ['pattern.kidney_yang_deficiency', 'pattern.kidney_yin_deficiency',
      'pattern.kidney_essence_deficiency', 'pattern.kidney_qi_not_firm', 'pattern.kidney_not_grasping_qi'],
  },
  'pattern.blood_deficiency': {
    axis: 'bing_xing',
    members: ['pattern.liver_blood_deficiency', 'pattern.heart_blood_deficiency'],
  },
  'pattern.qi_deficiency': {
    axis: 'bing_xing',
    members: ['pattern.spleen_qi_deficiency', 'pattern.lung_qi_deficiency', 'pattern.heart_qi_deficiency'],
  },
  'pattern.yin_deficiency': {
    axis: 'bing_xing',
    members: ['pattern.kidney_yin_deficiency', 'pattern.lung_yin_deficiency', 'pattern.heart_yin_deficiency',
      'pattern.stomach_yin_deficiency', 'pattern.liver_yin_deficiency'],
  },
  'pattern.yang_deficiency': {
    axis: 'bing_xing',
    members: ['pattern.kidney_yang_deficiency', 'pattern.spleen_yang_deficiency',
      'pattern.heart_yang_deficiency', 'pattern.spleen_kidney_yang_deficiency'],
  },
};

// id -> the categories it belongs to (a pattern may belong to several)
const MEMBER_OF = new Map();
Object.entries(CATEGORIES).forEach(([cat, def]) => def.members.forEach((m) => {
  MEMBER_OF.set(m, [...(MEMBER_OF.get(m) || []), cat]);
}));

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

  /* A registry defines the vocabulary, not just the parts of it currently in
   * use. Category ids are registered even with zero references — otherwise
   * 腎陽虛 would point at 陽虛 as a parent that exists nowhere, which is the
   * dangling-reference problem this file was created to end. */
  Object.keys(CATEGORIES).forEach((id) => {
    if (!use.has(id)) use.set(id, { conditions: [], comparisons: [] });
  });

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

    const cat = CATEGORIES[id];
    if (cat) {
      rec.level = 'category';
      rec.classified_by = cat.axis;              // zang_fu 臟腑軸 / bing_xing 病性軸
      rec.members = cat.members;
      rec.category_note_zh = '上位分類。底下各證型是不同的證,彼此需要鑑別——本 id 適合作為鑑別卡的標題,不適合單獨作為辨證結論。';
    } else {
      rec.level = 'pattern';
      const parents = MEMBER_OF.get(id);
      if (parents) rec.member_of = parents;      // 可能同時屬於臟腑軸與病性軸
    }

    if (!u.conditions.length && !cat) {
      rec.orphan_note_zh = '僅出現於鑑別卡,病症庫從未使用——可能是打字錯誤,待確認。';
    }
    return rec;
  });

  const named = records.filter((r) => r.name_zh).length;
  const orphans = records.filter((r) => r.orphan_note_zh);
  const cats = records.filter((r) => r.level === 'category');
  const multi = records.filter((r) => (r.member_of || []).length > 1);
  console.log('===== 證型登錄檔 =====\n');
  console.log(`證型總數        ${records.length}`);
  console.log(`  上位分類      ${cats.length}`);
  console.log(`  具體證型      ${records.length - cats.length}`);
  console.log(`  已有中文名    ${named}`);
  console.log(`  待補中文名    ${records.length - named}`);
  console.log(`  孤兒          ${orphans.length}`);

  console.log('\n--- 上位分類與成員 ---');
  cats.forEach((c) => console.log(`  ${(c.name_zh || c.id).padEnd(6)} [${c.classified_by}]  ${c.members.length} 個成員`));
  console.log(`\n--- 同時屬於兩軸的證型（單一 parent 表達不了）---`);
  multi.forEach((m) => console.log(`  ${(m.name_zh || m.id).padEnd(22)} → ${m.member_of.join(' + ')}`));
  if (orphans.length) { console.log('\n--- 孤兒 id ---'); orphans.forEach((o) => console.log('  ' + o.id)); }

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
