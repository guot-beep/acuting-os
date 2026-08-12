#!/usr/bin/env node
/**
 * fix-formula-boilerplate-tiaohe-variants.js
 *
 * Follow-up to fix-formula-boilerplate-gancao.js (commit 38d3b1b). That pass
 * cleared 「健脾和中，調和諸藥。」; the same import template also stamped four
 * reworded variants of the licorice role sentence onto non-licorice
 * composition rows, in in_formula_zh / actions_zh / role_reason_zh:
 *
 *   「和中健脾，調和諸藥。」   194 fields / 59 formulas (荊芥、黃柏、青蒿…)
 *   「補氣，調和諸藥。」        48 fields /  5 formulas
 *   「補益氣血，調和諸藥。」    33 fields /  8 formulas
 *   「調和諸藥。」               9 fields /  3 formulas (紫蘇葉/麥芽/石菖蒲)
 *
 * 紅線 6: a boilerplate sentence shared across records is worse than empty.
 *
 * §0 move-not-delete: every replaced string is preserved verbatim in the
 * record's correction_note (precedent: 8140f1c, then 38d3b1b) BEFORE the
 * field is cleared. No per-herb replacement text is invented — the renderer
 * (js/knowledge.js zhReason/enReason chain) falls back to in_formula_en.
 *
 * Exact-match only. Mixed sentences needing per-herb judgment (陳皮「燥濕健脾，
 * 調和諸藥。」, 藿香「調和諸藥，降逆止嘔。」, 白芍「補血養血，調和諸藥，緩解。」,
 * 檀香「理氣寬中，調和諸藥，緩急止痛。」) and plausible content (炙甘草/甘草/大棗)
 * are different exact strings and are untouched by design; a post-condition
 * asserts none of them changed.
 *
 * Usage: node scripts/fix-formula-boilerplate-tiaohe-variants.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const STAMP = '2026-08-12';
const FIELDS = ['in_formula_zh', 'actions_zh', 'role_reason_zh'];
const BOILERS = [
  '和中健脾，調和諸藥。',
  '補氣，調和諸藥。',
  '補益氣血，調和諸藥。',
  '調和諸藥。',
];
// Exact strings that contain 調和諸藥 but must NOT be touched (mixed or plausible).
const LEAVE_ALONE = [
  '燥濕健脾，調和諸藥。',
  '調和諸藥，降逆止嘔。',
  '補血養血，調和諸藥，緩解。',
  '理氣寬中，調和諸藥，緩急止痛。',
  '補益，調和諸藥。',
  '補中益氣，緩急止痛，調和諸藥。',
  '清熱解毒，祛痰止咳，緩急止痛，調和諸藥。',
  '補益，清熱瀉火，緩解，止咳化痰，調和諸藥。',
];

const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));

const isLicorice = (c) => {
  const label = c.herb_zh || c.pinyin || c.herb_en || '';
  return c.herb_id === 'herb.gan_cao' || /甘草/.test(label) || /gan.?cao/i.test(c.pinyin || '');
};

// Snapshot of leave-alone occurrences to assert they survive untouched.
const countLeaveAlone = () => {
  let n = 0;
  for (const r of formulasData.records)
    for (const c of (r.composition || []))
      for (const f of FIELDS)
        if (LEAVE_ALONE.includes(c[f])) n++;
  return n;
};
const leaveAloneBefore = countLeaveAlone();

let rowCount = 0;
let fieldCount = 0;
const perBoiler = new Map(BOILERS.map((b) => [b, { fields: 0, formulas: new Set() }]));
const touched = []; // { r, byBoiler: Map(boiler -> [{c, herb, fields}]) }
const fail = [];

for (const r of formulasData.records) {
  const byBoiler = new Map();
  const seenRows = new Set();
  for (const c of (r.composition || [])) {
    for (const b of BOILERS) {
      const matched = FIELDS.filter((f) => c[f] === b);
      if (!matched.length) continue;
      const herbLabel = c.herb_zh || c.pinyin || c.herb_en || '(無名藥味)';
      // These sentences ARE plausible for licorice — never clear there.
      // Survey 2026-08-12: zero licorice rows carry them; if one appears, stop.
      if (isLicorice(c)) {
        fail.push(`${r.id}.${herbLabel}: 甘草類藥味帶「${b}」，屬合理內容，本腳本不處理`);
        continue;
      }
      if (!c.in_formula_en && !c.actions_en) {
        console.log(`  ⚠ ${r.id}.${herbLabel}: 無 in_formula_en/actions_en，清除後該格顯示「—」`);
      }
      if (!byBoiler.has(b)) byBoiler.set(b, []);
      byBoiler.get(b).push({ c, herb: herbLabel, fields: matched });
      if (!seenRows.has(c)) { seenRows.add(c); rowCount++; }
      fieldCount += matched.length;
      const s = perBoiler.get(b);
      s.fields += matched.length;
      s.formulas.add(r.id);
    }
  }
  if (byBoiler.size) touched.push({ r, byBoiler });
}

if (fail.length) {
  console.error('拒絕寫入：');
  for (const m of fail) console.error('  ' + m);
  process.exit(1);
}

console.log(`${DRY ? '[dry-run] ' : ''}方劑數 ${touched.length}  藥味列數 ${rowCount}  清除欄位數 ${fieldCount}`);
for (const [b, s] of perBoiler)
  console.log(`  「${b}」 欄位 ${s.fields} / 方劑 ${s.formulas.size}`);
for (const { r, byBoiler } of touched) {
  const herbs = [...byBoiler.values()].flat().map((h) => h.herb);
  console.log(`  ${r.id}  ${herbs.length} 味  ${herbs.join('、')}`);
}

if (DRY) process.exit(0);

// §0: write the preservation note first, then clear.
for (const { r, byBoiler } of touched) {
  const notes = [];
  for (const [b, hits] of byBoiler) {
    const herbList = hits
      .map((h) => `${h.herb}（${h.fields.join('、')}）`)
      .join('、');
    notes.push(
      `【${STAMP} 樣板句清除 — 錯置的甘草功效（變體）】以下 ${hits.length} 味藥的所列欄位原值逐字同為` +
      `「${b}」（原文保存於此）：${herbList}。` +
      `該句描述的是甘草在方中的本方功效，匯入樣板誤蓋到非甘草藥味上（紅線 6 樣板句），` +
      `與各味自身功效不符，屬錯層內容，故清空；卡片回退顯示各味既有的英文 in_formula_en。` +
      `未在無具名來源下新增逐味中文功效——留空比樣板句誠實。`
    );
  }
  const note = notes.join('\n');
  r.correction_note = r.correction_note ? r.correction_note + '\n' + note : note;
  for (const hits of byBoiler.values())
    for (const h of hits)
      for (const f of h.fields) delete h.c[f];
}

// Post-conditions: zero remaining matches on non-licorice rows; leave-alone intact.
let remaining = 0;
for (const r of formulasData.records)
  for (const c of (r.composition || []))
    for (const f of FIELDS)
      if (BOILERS.includes(c[f]) && !isLicorice(c)) remaining++;
if (remaining !== 0) {
  console.error(`assert 失敗：清除後仍有 ${remaining} 個欄位帶樣板句，不寫檔`);
  process.exit(1);
}
if (countLeaveAlone() !== leaveAloneBefore) {
  console.error(`assert 失敗：不該動的句子數量改變（${leaveAloneBefore} → ${countLeaveAlone()}），不寫檔`);
  process.exit(1);
}

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');
console.log('已寫入 data/herbs/formulas.json');
