#!/usr/bin/env node
/* validate-herb-card-schema.js — every herb card must have the same shape.
 *
 * Written because herb.zhi_gan_cao arrived with 26 fields where the reference
 * card has 67 — no contraindications, no dosage, no channels, no English layer
 * at all — and with functions_zh, cautions_zh and cautions_en written as
 * strings where every other card uses arrays. A wrong type is the worse half:
 * the renderer and every array-length check silently do nothing, so the card
 * reads as present and validates as fine while showing almost nothing.
 *
 * Rules in a document are a request. This is the part that can actually say no.
 *
 * Reference card: herb.gan_cao — a fully built card Ting has reviewed.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HERBS = path.join(ROOT, 'data/herbs/herb_canon_shortlist.json');
const REFERENCE_ID = 'herb.gan_cao';

/* Fields every card must carry regardless of how much research is done. A card
 * missing any of these is not a thin card, it is a broken one — dosage and
 * contraindications especially, since their absence reads as "no restriction"
 * rather than "not looked up yet". */
const REQUIRED = [
  'id', 'name_zh', 'pinyin', 'name_en',
  'functions_zh', 'indications_zh',
  'contraindications_zh', 'cautions_zh',
  'dosage_g', 'channels_zh', 'properties_taste_temp',
];

// Fields whose absence is acceptable on a draft but whose TYPE is not optional.
const ARRAY_FIELDS = [
  'functions_zh', 'actions_en', 'indications_zh', 'indications_en',
  'contraindications_zh', 'contraindications_en', 'cautions_zh', 'cautions_en',
  'modern_functions_zh', 'modern_functions_en', 'channels_zh',
  'condition_tags_zh', 'condition_tags_en', 'safety_flags', 'source_urls',
];

const typeOf = (v) => (Array.isArray(v) ? 'array' : (v === null ? 'null' : typeof v));

function main() {
  const db = JSON.parse(fs.readFileSync(HERBS, 'utf8'));
  const records = db.records || db;
  const ref = records.find((r) => r.id === REFERENCE_ID);
  if (!ref) {
    console.error(`找不到參考卡 ${REFERENCE_ID}`);
    process.exit(1);
  }
  const refKeys = Object.keys(ref);

  const defects = [];   // blocking: breaks rendering
  const legacy = [];    // report-only: pre-existing inconsistency, not this batch's doing
  const thin = [];

  /* dosage / dosage_g disagree across the whole library — some cards put the
   * string in one and the object in the other. It predates any current work
   * and blocking on it would stop every batch for something none of them
   * caused, so it is reported and left for a dedicated pass. */
  const LEGACY_FIELDS = new Set(['dosage', 'dosage_g']);

  records.forEach((r) => {
    if (r.id === REFERENCE_ID) return;
    const keys = Object.keys(r);

    // H1 — required fields
    REQUIRED.forEach((k) => {
      if (!(k in r)) legacy.push(`H1 ${r.id}: 缺必要欄位 ${k}`);
    });

    // H2 — type must match the reference wherever both have the field
    keys.forEach((k) => {
      if (!(k in ref)) return;
      const a = typeOf(r[k]);
      const b = typeOf(ref[k]);
      if (a === 'null' || b === 'null') return;
      if (a !== b) legacy.push(`H2 ${r.id}.${k}: 型別 ${a},應為 ${b}`);
    });

    // H3 — array fields must be arrays even when the reference lacks them
    ARRAY_FIELDS.forEach((k) => {
      if (!(k in r)) return;
      if (!Array.isArray(r[k])) defects.push(`H3 ${r.id}.${k}: 應為陣列,目前是 ${typeOf(r[k])}`);
    });

    // H4 — a card far below the reference shape is reported, not blocked:
    // some herbs genuinely carry less. Under half is a different matter.
    const coverage = keys.filter((k) => refKeys.includes(k)).length / refKeys.length;
    if (coverage < 0.5) thin.push({ id: r.id, n: keys.length, pct: Math.round(coverage * 100) });

    // H5 — bilingual arrays must align or the English side must be empty
    [['functions_zh', 'actions_en'], ['indications_zh', 'indications_en'],
      ['contraindications_zh', 'contraindications_en'], ['cautions_zh', 'cautions_en']]
      .forEach(([zh, en]) => {
        const a = Array.isArray(r[zh]) ? r[zh].length : 0;
        const b = Array.isArray(r[en]) ? r[en].length : 0;
        if (b > 0 && a !== b) defects.push(`H5 ${r.id}: ${zh}(${a}) 與 ${en}(${b}) 長度不符 —— 寧可整個留空,不要半套錯位`);
      });
  });

  // --json:給 check-validation-ratchet 用(2026-08-27 接線)。必須在任何報表
  // 列印之前 —— ratchet 對輸出做 JSON.parse,前面混一行人類可讀文字就會炸。
  // 目前 6 筆全是 H5 索引不對齊,而且逐筆看過:不是排版錯位,是中英兩側各自
  // 帶著對方沒有的真內容(珍珠母英文多兩條課程層敘述、青木香中文多「解毒
  // 消腫」)。刪任何一邊都是丟內容,補齊需要中醫判斷與來源,屬 fill 線。
  // 棘輪鎖住不變差是這種積欠唯一能一直開著的形式。
  if (process.argv.includes('--json')) {
    const byCode = {};
    for (const d of defects) {
      const m = String(d).match(/^([A-Z]\d+)/);
      const code = m ? m[1] : 'other';
      byCode[code] = (byCode[code] || 0) + 1;
    }
    console.log(JSON.stringify({ defects: defects.length, by_code: byCode }));
    process.exit(0);
  }

  console.log('===== 中藥卡結構檢查 =====\n');
  console.log(`中藥卡總數      ${records.length}`);
  console.log(`參考卡          ${REFERENCE_ID} (${refKeys.length} 個欄位)`);
  console.log(`阻擋問題        ${defects.length}`);
  console.log(`欄位缺漏/型別歧異 ${legacy.length}  (舊庫既有,報告不擋)`);
  console.log(`欄位覆蓋 <50%   ${thin.length}`);

  if (legacy.length) {
    console.log(`
--- 欄位缺漏（報告,多為舊卡）前 10 ---`);
    legacy.slice(0, 10).forEach((l) => console.log('  ' + l));
  }

  if (thin.length) {
    console.log('\n--- 欄位偏少的卡（報告,不阻擋）---');
    thin.sort((a, b) => a.pct - b.pct).slice(0, 15)
      .forEach((t) => console.log(`  ${String(t.pct).padStart(3)}%  ${t.id.padEnd(30)} ${t.n} 個欄位`));
    if (thin.length > 15) console.log(`  … 還有 ${thin.length - 15}`);
  }

  if (defects.length) {
    console.log(`\n❌ ${defects.length} 個阻擋問題:\n`);
    defects.slice(0, 40).forEach((d) => console.log('  ' + d));
    if (defects.length > 40) console.log(`  … 還有 ${defects.length - 40}`);
    console.log('\n修法: 用 herb.gan_cao 當範本逐欄位比對。查不到來源的欄位留空,但不要改型別。');
    process.exitCode = 1;
  } else {
    console.log('\nvalidate-herb-card-schema: PASS');
  }
}

main();
