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
  'pattern.fire': '火',
  'pattern.heat': '熱',
  'pattern.damp_heat': '濕熱',
  'pattern.phlegm': '痰',
  'pattern.wind_external': '外風',
  'pattern.heart_fire': '心火亢盛',
  'pattern.heart_yang_deficiency': '心陽虛',
  'pattern.heart_yin_deficiency': '心陰虛',
  'pattern.heart_qi_deficiency': '心氣虛',
  'pattern.spleen_yang_deficiency': '脾陽虛',
  'pattern.spleen_kidney_yang_deficiency': '脾腎陽虛',
  'pattern.stomach_yin_deficiency': '胃陰虛',
  'pattern.liver_yin_deficiency': '肝陰虛',
  'pattern.liver_gallbladder_damp_heat': '肝膽濕熱',
  'pattern.phlegm_damp_in_lung': '痰濕阻肺',
  'pattern.phlegm_heat_in_lung': '痰熱壅肺',
  'pattern.wind_cold_invading_lung': '風寒犯肺',
  'pattern.wind_heat_invading_lung': '風熱犯肺',
  'pattern.stomach_fire': '胃火熾盛',
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

  /* The excess patterns work the same way, per Ting: 心火, 肝火 and 胃火 are
   * all fire and all different, and the difference is the differentiation. */
  'pattern.fire': {
    axis: 'bing_xing',
    members: ['pattern.liver_fire', 'pattern.heart_fire', 'pattern.stomach_fire'],
    note_zh: '胃火與胃熱分立（Ting 2026-07-31 定案）。來源不一:部分教材視二者為同義,部分依「火為熱之極」區分——胃火熾盛症狀更劇（消谷善飢、牙齦腫痛出血、口臭、便秘、舌紅苔黃燥）。NCBAHM 用 Stomach Fire Blazing。兩說並記,不擇一。',
  },
  'pattern.heat': {
    axis: 'bing_xing',
    members: ['pattern.blood_heat', 'pattern.stomach_heat'],
  },
  'pattern.damp_heat': {
    axis: 'bing_xing',
    members: ['pattern.damp_heat_lower_burner', 'pattern.damp_heat_spleen_stomach',
      'pattern.liver_gallbladder_damp_heat'],
  },
  'pattern.phlegm': {
    axis: 'bing_xing',
    members: ['pattern.phlegm_damp', 'pattern.phlegm_damp_in_lung',
      'pattern.phlegm_heat_in_lung', 'pattern.phlegm_misting_heart'],
  },
  'pattern.wind_external': {
    axis: 'bing_xing',
    members: ['pattern.wind_cold', 'pattern.wind_heat',
      'pattern.wind_cold_invading_lung', 'pattern.wind_heat_invading_lung'],
  },
};

/* Ting's ruling: 肝脾不和 and 肝胃不和 are different situations, not subtypes
 * of 肝氣鬱結 — treating them as one thing was the mis-tagging, and the cost
 * showed up here. So these stay separate patterns and the relationship is
 * recorded as "may develop into", not as class membership. Same for 血瘀. */
const RELATED = {
  'pattern.liver_qi_stagnation': {
    develops_into: ['pattern.liver_spleen_disharmony', 'pattern.liver_stomach_disharmony'],
    note_zh: '肝氣鬱結久則橫逆犯脾或犯胃,但肝脾不和、肝胃不和各是獨立的證,不是肝鬱的下位分類——三者需鑑別。',
  },
  'pattern.blood_stasis': {
    develops_into: ['pattern.heart_blood_stasis', 'pattern.qi_stagnation_blood_stasis'],
    note_zh: '血瘀是獨立診斷;心血瘀阻、氣滯血瘀各有其病機重點,需鑑別而非包含。',
  },
};

/* 辨證體系 — the third dimension. 八綱, 臟腑, 六經 and the rest are not axes
 * of one classification; they are separate diagnostic systems that describe
 * the same patient from different angles. A pattern belongs to the system it
 * was formulated in. */
const SYSTEMS = {
  ba_gang: '八綱辨證',
  zang_fu: '臟腑辨證',
  qi_xue_jin_ye: '氣血津液辨證',
  liu_jing: '六經辨證',
  wei_qi_ying_xue: '衛氣營血辨證',
  san_jiao: '三焦辨證',
  bing_yin: '病因辨證',
};

/* Explicit assignment. Anything not listed ships with needs_system=true
 * rather than a guess — the system a pattern belongs to is a textbook fact,
 * not something to infer from its name. */
const SYSTEM_OF = {
  'pattern.yin_deficiency': 'ba_gang',
  'pattern.yang_deficiency': 'ba_gang',
  'pattern.qi_deficiency': 'qi_xue_jin_ye',
  'pattern.blood_deficiency': 'qi_xue_jin_ye',
  'pattern.qi_blood_deficiency': 'qi_xue_jin_ye',
  'pattern.blood_stasis': 'qi_xue_jin_ye',
  'pattern.qi_stagnation_blood_stasis': 'qi_xue_jin_ye',
  'pattern.blood_heat': 'qi_xue_jin_ye',
  'pattern.phlegm': 'qi_xue_jin_ye',
  'pattern.phlegm_damp': 'qi_xue_jin_ye',
  'pattern.wind_cold': 'bing_yin',
  'pattern.wind_heat': 'bing_yin',
  'pattern.cold_damp': 'bing_yin',
  'pattern.wind_damp_bi': 'bing_yin',
  'pattern.wind_external': 'bing_yin',
  'pattern.heat': 'ba_gang',
  'pattern.fire': 'ba_gang',
  'pattern.damp_heat': 'bing_yin',
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

  /* 胃火 registered alongside 胃熱, per Ting. Sources genuinely disagree —
   * some texts treat 胃熱 and 胃火 as one thing, others hold 火為熱之極 and
   * reserve 胃火熾盛 for the severe presentation, which is the name the board
   * uses. Both readings are recorded rather than one being picked. */
  if (!use.has('pattern.stomach_fire')) use.set('pattern.stomach_fire', { conditions: [], comparisons: [] });

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

    if (RELATED[id]) {
      rec.develops_into = RELATED[id].develops_into;
      rec.relation_note_zh = RELATED[id].note_zh;
    }

    // 辨證體系 — the third dimension
    const sys = SYSTEM_OF[id] || (rec.level === 'pattern' && MEMBER_OF.has(id) ? null : null);
    if (sys) {
      rec.system = sys;
      rec.system_zh = SYSTEMS[sys];
    } else if (/^pattern\.(heart|liver|spleen|lung|kidney|stomach|gallbladder|bladder|intestine)/.test(id)) {
      // Organ-named patterns are 臟腑辨證 by construction — that is what the
      // system is: patterns stated in terms of a Zang-Fu organ.
      rec.system = 'zang_fu';
      rec.system_zh = SYSTEMS.zang_fu;
    } else {
      rec.needs_system = true;
    }
    if (!u.conditions.length && !u.comparisons.length && !cat) {
      rec.newly_registered_note_zh = '登錄為正式詞彙,尚未被任何病症或鑑別卡引用。';
    } else if (!u.conditions.length && !cat) {
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
