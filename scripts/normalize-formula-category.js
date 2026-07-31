#!/usr/bin/env node
/* normalize-formula-category.js — one naming convention for formula categories.
 *
 * The field drifted into two forms. Some records carry "清熱劑 / Clear Heat"
 * with category_en either empty or "Clear Heat"; others carry a bare "清熱劑"
 * with the Chinese copied into category_en. Category browsing therefore shows
 * the same category twice, and any grouping report double-counts it.
 *
 * After this: category is always "中文 / English", category_en is always the
 * English alone. Records with no category keep none — a category cannot be
 * inferred from a formula name, and guessing one would be worse than a blank.
 *
 * DRY RUN BY DEFAULT. Pass --write to persist.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const FORMULAS = path.join(path.resolve(__dirname, '..'), 'data/herbs/formulas.json');

/* The 18 categories of the standard 方劑學 syllabus. Keyed by the Chinese
 * stem, which is what both conventions share. 化痰劑 folds into 祛痰劑: the
 * two names are the same category in different textbooks, and keeping both
 * splits one formula off on its own. */
const CANON = {
  解表劑: 'Release the Exterior',
  清熱劑: 'Clear Heat',
  瀉下劑: 'Drain Downward',
  和解劑: 'Harmonize',
  溫裡劑: 'Warm the Interior',
  補益劑: 'Tonify',
  固澀劑: 'Stabilize and Bind',
  安神劑: 'Calm the Spirit',
  開竅劑: 'Open the Orifices',
  理氣劑: 'Regulate Qi',
  理血劑: 'Regulate Blood',
  治風劑: 'Expel or Extinguish Wind',
  治燥劑: 'Treat Dryness',
  祛濕劑: 'Dispel Dampness',
  祛痰劑: 'Transform Phlegm',
  消食劑: 'Reduce Food Stagnation',
  驅蟲劑: 'Expel Parasites',
  癰瘍劑: 'Treat Abscesses and Sores',
  表裏雙解劑: 'Release Both Exterior and Interior',
};
const MERGE = { 化痰劑: '祛痰劑' };

function stemOf(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const zh = raw.split('/')[0].trim();          // "清熱劑 / Clear Heat" -> "清熱劑"
  const merged = MERGE[zh] || zh;
  return CANON[merged] ? merged : null;
}

function main() {
  const write = process.argv.includes('--write');
  const F = JSON.parse(fs.readFileSync(FORMULAS, 'utf8'));
  const records = F.records || F;

  let changed = 0; let already = 0; let blank = 0; const unknown = [];
  const merged = [];

  records.forEach((f) => {
    const stem = stemOf(f.category) || stemOf(f.category_en);
    if (!stem) {
      if (String(f.category || '').trim() || String(f.category_en || '').trim()) {
        unknown.push(`${f.id}: category="${f.category || ''}" category_en="${f.category_en || ''}"`);
      } else {
        blank += 1;
      }
      return;
    }
    if (MERGE[String(f.category || '').split('/')[0].trim()]) merged.push(f.id);

    const canonical = `${stem} / ${CANON[stem]}`;
    if (f.category === canonical && f.category_en === CANON[stem]) { already += 1; return; }
    f.category = canonical;
    f.category_en = CANON[stem];
    changed += 1;
  });

  const counts = new Map();
  records.forEach((f) => {
    const k = f.category || '（未分類）';
    counts.set(k, (counts.get(k) || 0) + 1);
  });

  console.log('===== 方劑分類正規化 =====\n');
  console.log(`方劑總數      ${records.length}`);
  console.log(`已正規        ${already}`);
  console.log(`本次修正      ${changed}`);
  console.log(`無分類        ${blank}  (保持空白,分類無法從方名推斷)`);
  console.log(`無法辨識      ${unknown.length}`);
  if (merged.length) console.log(`化痰劑 → 祛痰劑  ${merged.length}  (${merged.join(', ')})`);
  if (unknown.length) { console.log('\n--- 無法辨識 ---'); unknown.forEach((u) => console.log('  ' + u)); }

  console.log(`\n--- 正規化後分類 (${counts.size} 類) ---`);
  [...counts.entries()].sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}  ${k}`));

  if (write) {
    fs.writeFileSync(FORMULAS, JSON.stringify(F, null, 2) + '\n');
    console.log(`\n已寫入 ${FORMULAS}`);
  } else {
    console.log('\n（dry run：未寫入。加 --write 才落地。）');
  }
}

main();
