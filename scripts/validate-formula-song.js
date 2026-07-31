#!/usr/bin/env node
/* validate-formula-song.js — check the 方歌 field.
 *
 * Report-only for now: the field was just introduced and almost nothing has
 * one yet, so a blocking check would only ever say "199 missing". It reports
 * coverage and flags entries that are present but malformed. Make the
 * malformed checks blocking once a real batch has landed.
 *
 * The one thing this does treat as a defect is a placeholder. 方歌 renders
 * only when it has content, so "待補" or an empty string does not appear on
 * the card yet still counts as filled in every coverage report — the field
 * looks done while the card shows nothing.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const FORMULAS = path.join(path.resolve(__dirname, '..'), 'data/herbs/formulas.json');
const PLACEHOLDER = /^(待補|待查|TBD|N\/A|—|-|無|none)$/i;

function main() {
  const F = JSON.parse(fs.readFileSync(FORMULAS, 'utf8'));
  const records = F.records || F;

  const defects = [];
  let filled = 0;
  let withSource = 0;

  records.forEach((f) => {
    const raw = f.formula_song_zh;
    if (raw === undefined) return;                     // absent is correct when unknown

    if (typeof raw !== 'string') {
      defects.push(`S1 ${f.id}: formula_song_zh 不是字串 (${typeof raw})`);
      return;
    }
    const song = raw.trim();
    if (!song) {
      defects.push(`S2 ${f.id}: formula_song_zh 是空字串 — 沒有方歌就不要建這個欄位`);
      return;
    }
    if (PLACEHOLDER.test(song)) {
      defects.push(`S2 ${f.id}: formula_song_zh 是佔位字「${song}」— 沒有方歌就不要建這個欄位`);
      return;
    }
    filled += 1;

    // A 方歌 is a Chinese verse. Latin letters mean a pinyin line or an English
    // gloss leaked in from the scrape.
    if (/[A-Za-z]{3,}/.test(song)) {
      defects.push(`S3 ${f.id}: 方歌含拉丁字母,可能混入拼音或英文 — 「${song.slice(0, 40)}…」`);
    }
    // Two verses concatenated. §1.1 says the alternates belong in
    // formula_song_alt_zh, not glued onto the main one.
    if (song.length > 200) {
      defects.push(`S4 ${f.id}: 方歌 ${song.length} 字,可能黏了兩首 — 其餘應放 formula_song_alt_zh`);
    }
    if (f.formula_song_source_zh && String(f.formula_song_source_zh).trim()) withSource += 1;

    const alt = f.formula_song_alt_zh;
    if (alt !== undefined && !Array.isArray(alt)) {
      defects.push(`S5 ${f.id}: formula_song_alt_zh 必須是陣列`);
    }
  });

  console.log('===== 方歌欄位檢查 =====\n');
  console.log(`方劑總數      ${records.length}`);
  console.log(`已有方歌      ${filled}`);
  console.log(`  其中註明出處  ${withSource}`);
  console.log(`尚無方歌      ${records.length - filled}`);

  if (defects.length) {
    console.log(`\n⚠️ ${defects.length} 個問題(目前只報告,不擋):\n`);
    defects.forEach((d) => console.log(`  ${d}`));
  } else {
    console.log('\nvalidate-formula-song: PASS — 已填的方歌格式都正確。');
  }
}

main();
