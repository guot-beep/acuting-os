#!/usr/bin/env node
/**
 * fix-formula-boilerplate-gancao.js
 *
 * Defect: the string 「健脾和中，調和諸藥。」 — a description of 甘草's
 * in-formula role — was stamped by an import template onto composition rows
 * whose herb is NOT 甘草, in in_formula_zh / actions_zh / role_reason_zh.
 * On the card it renders in the 方劑分析 table's 本方功效 column, so e.g.
 * 青蒿 (君藥 of 蒿芩清膽湯) claimed it "tonifies the spleen and harmonizes
 * the other herbs". 紅線 6: a boilerplate sentence shared across records is
 * worse than an empty field.
 *
 * §0 move-not-delete: every replaced string is preserved verbatim in the
 * record's correction_note (precedent: commit 8140f1c, 柴胡加龍骨牡蠣湯)
 * BEFORE the field is cleared. No per-herb replacement text is invented —
 * the renderer (js/knowledge.js zhReason/enReason chain) falls back to the
 * row's existing in_formula_en, which is herb-specific on these rows.
 *
 * Only the exact-match boilerplate fields are deleted; rows where a curation
 * pass already wrote real in_formula_zh (e.g. batch-1 gold 銀翹散) keep that
 * content and lose only the leftover boilerplate in actions_zh.
 */
const fs = require('fs');
const path = require('path');

const BOILER = '健脾和中，調和諸藥。';
const STAMP = '2026-08-12';
const FIELDS = ['in_formula_zh', 'actions_zh', 'role_reason_zh'];

const formulasPath = path.join(__dirname, '../data/herbs/formulas.json');
const formulasData = JSON.parse(fs.readFileSync(formulasPath, 'utf8'));

let rowCount = 0;
let fieldCount = 0;
const touched = [];
const fail = [];

for (const r of formulasData.records) {
  const hits = []; // {herb, fields}
  for (const c of (r.composition || [])) {
    const matched = FIELDS.filter((f) => c[f] === BOILER);
    if (!matched.length) continue;
    const herbLabel = c.herb_zh || c.pinyin || c.herb_en || '(無名藥味)';
    // The sentence IS correct for licorice — never clear it there. As of
    // 2026-08-12 no licorice row carries it; if one appears, stop and report.
    if (c.herb_id === 'herb.gan_cao' || /甘草/.test(herbLabel) || /gan.?cao/i.test(c.pinyin || '')) {
      fail.push(`${r.id}.${herbLabel}: 甘草類藥味帶此句，屬合理內容，本腳本不處理`);
      continue;
    }
    if (!c.in_formula_en && !c.actions_en) {
      // Fallback chain would leave the cell empty — allowed (empty is honest),
      // but report it so the worklist knows the cell went blank.
      console.log(`  ⚠ ${r.id}.${herbLabel}: 無 in_formula_en/actions_en，清除後該格顯示「—」`);
    }
    hits.push({ c, herb: herbLabel, fields: matched });
    rowCount++;
    fieldCount += matched.length;
  }
  if (hits.length) touched.push({ r, hits });
}

if (fail.length) {
  console.error('拒絕寫入：');
  for (const m of fail) console.error('  ' + m);
  process.exit(1);
}

// §0: write the preservation note first, then clear.
for (const { r, hits } of touched) {
  const herbList = hits
    .map((h) => `${h.herb}（${h.fields.join('、')}）`)
    .join('、');
  const note =
    `【${STAMP} 樣板句清除 — 錯置的甘草功效】以下 ${hits.length} 味藥的所列欄位原值逐字同為` +
    `「${BOILER}」（原文保存於此）：${herbList}。` +
    `該句描述的是甘草在方中的本方功效，匯入樣板誤蓋到非甘草藥味上（紅線 6 樣板句），` +
    `與各味自身功效不符，屬錯層內容，故清空；卡片回退顯示各味既有的英文 in_formula_en。` +
    `未在無具名來源下新增逐味中文功效——留空比樣板句誠實。`;
  r.correction_note = r.correction_note ? r.correction_note + '\n' + note : note;
  for (const h of hits) for (const f of h.fields) delete h.c[f];
}

// Post-condition: zero remaining matches on non-licorice rows.
let remaining = 0;
for (const r of formulasData.records)
  for (const c of (r.composition || []))
    for (const f of FIELDS)
      if (c[f] === BOILER && c.herb_id !== 'herb.gan_cao') remaining++;
if (remaining !== 0) {
  console.error(`assert 失敗：清除後仍有 ${remaining} 個欄位帶樣板句，不寫檔`);
  process.exit(1);
}

fs.writeFileSync(formulasPath, JSON.stringify(formulasData, null, 2), 'utf8');

console.log(`方劑數 ${touched.length}`);
console.log(`藥味列數 ${rowCount}`);
console.log(`清除欄位數 ${fieldCount}`);
for (const { r, hits } of touched)
  console.log(`  ${r.id}  ${hits.length} 味  ${hits.map((h) => h.herb).join('、')}`);
