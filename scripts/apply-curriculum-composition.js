#!/usr/bin/env node
/* apply-curriculum-composition.js — fill empty formula compositions from the
 * curriculum parse produced by parse-comprehensive-composition.js.
 *
 * Context: 85 formulas carry no composition. 36 of those were deliberately
 * cleared by fix-formula-name-as-ingredient.js, because their "composition"
 * was the formula name with its dosage-form suffix stripped, masquerading as
 * an ingredient. The other 49 never had one. Refilling both is legitimate.
 *
 * §0 只加深不刪除 — a formula that already has a composition is never touched.
 *
 * Restricted herbs are RECORDED, not dropped: the board exam expects the
 * original formula, so the ingredient stays and carries a flag saying it is
 * not used clinically in the US. Omitting it would hide an exam fact; leaving
 * it unmarked would imply it is prescribable.
 *
 * DRY RUN BY DEFAULT. Pass --write to persist.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FORMULAS = path.join(ROOT, 'data/herbs/formulas.json');
const HERBS = path.join(ROOT, 'data/herbs/herb_canon_shortlist.json');
const SOURCE_REF = 'curriculum/formulas/Herbal Formulations Comprehensive.docx.md';

/* Ingredients the parser could not resolve to a herb card, with the Chinese
 * name supplied by hand. `us` marks what is not used clinically in the US —
 * aristolochic-acid herbs (nephrotoxic, FDA warning), cinnabar (mercury),
 * pangolin (CITES), and the toxic purgatives. `sub_formula` marks a formula
 * used as an ingredient, which is not a herb card and should not become one. */
const UNRESOLVED = {
  'Da Ji': {
    zh: '京大戟',
    note_zh: '此處為京大戟（峻下逐水），非藥庫中的大薊（止血藥）。同拼音、不同藥。',
    us: '毒性峻下藥，美國臨床不用。',
  },
  'Yuan Hua': { zh: '芫花', us: '毒性峻下藥，美國臨床不用。' },
  'Zhu Sha': { zh: '硃砂', us: '硫化汞，具汞毒性，美國臨床不用。' },
  'Zhu sha': { zh: '硃砂', us: '硫化汞，具汞毒性，美國臨床不用。' },
  'Xi Jiao': { zh: '犀角', us: '犀牛角為 CITES 保育類，全球禁用；現代方以水牛角代之。' },
  'Xiong Huang': { zh: '雄黃', us: '含硫化砷，具砷毒性，美國臨床不用。' },
  'Dai Mao': { zh: '玳瑁', us: '玳瑁為 CITES 保育類，美國禁用。' },
  'Hu Po': { zh: '琥珀' },
  'An Xi Xiang': { zh: '安息香' },
  'Jiang Can': { zh: '殭蠶' },
  'Hu huang lian': { zh: '胡黃連' },
  'Xi Gua Pi': { zh: '西瓜皮' },
  'Qing Xiang Zi': { zh: '青葙子' },
  'Han shui shi': { zh: '寒水石' },
  'Xiao shi': { zh: '硝石' },
  'Bai Mi': { zh: '白蜜' },
  'Guan Gui': { zh: '官桂' },
  'Shi di': { zh: '柿蒂' },
  'Li Pi': { zh: '梨皮' },
  'Zong Lu Tan': { zh: '棕櫚炭' },
  'Jie Sui Tan': { zh: '荊芥穗炭' },
  'Su Zhi Gui Ban': { zh: '酥炙龜板' },
  'Jiu Zhi Gui Ban': { zh: '酒炙龜板' },
  'Huang jin': { zh: '黃金', note_zh: '安宮牛黃丸原方以金箔為衣，現代成藥多已省略。' },
  'Ma Dou Ling': { zh: '馬兜鈴', us: '含馬兜鈴酸，具腎毒性與致癌性，美國禁用。' },
  'Qing mu xiang': { zh: '青木香', us: '含馬兜鈴酸，具腎毒性，美國禁用。' },
  'Chuan Shan Jia': { zh: '穿山甲', us: '穿山甲為 CITES 保育類，美國禁用；臨床多以王不留行、皂角刺替代。' },
  'Geng Mi': { zh: '粳米' },
  'Lu Jiao': { zh: '鹿角' },
  'Chun Gen Pi': { zh: '椿根皮' },
  'Fu Hai Shi': { zh: '浮海石' },
  'Zao Xin Tu': { zh: '灶心土' },
  'Bai Jiu [White wine]': { zh: '白酒' },
  '1. Tian Dong': { zh: '天門冬' },
  'Bi Yu San [A,E]': { zh: '碧玉散', sub_formula: true },
  'Si jun zi tang': { zh: '四君子湯', sub_formula: true },
  // Left deliberately unmapped: the export truncates this one and 完帶湯 has
  // both 酒炒白芍 and no 黃柏, so either expansion would be a guess.
  'Jiu Chao Bai': { zh: null, note_zh: '課件此處名稱被截斷，無法確定為酒炒白芍或酒炒黃柏，待人工核對。' },
};

// Chapter headings the parser mistook for formula names.
const NOT_A_FORMULA = /^Formulas That\b/i;

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z]/g, '');

function main() {
  const inputAt = process.argv.indexOf('--input');
  if (inputAt < 0 || !process.argv[inputAt + 1]) {
    console.error('用法: node scripts/apply-curriculum-composition.js --input <parsed.json> [--write]');
    process.exit(1);
  }
  const write = process.argv.includes('--write');
  const parsed = JSON.parse(fs.readFileSync(process.argv[inputAt + 1], 'utf8'));

  const herbDb = JSON.parse(fs.readFileSync(HERBS, 'utf8'));
  const herbById = new Map((herbDb.records || herbDb).map((h) => [h.id, h]));

  const F = JSON.parse(fs.readFileSync(FORMULAS, 'utf8'));
  const local = F.records || F;
  const byKey = new Map();
  local.forEach((f) => {
    [f.pinyin, f.name_pinyin, String(f.id || '').replace(/^formula\./, '').replace(/_/g, ' ')]
      .filter(Boolean).forEach((n) => { const k = norm(n); if (k && !byKey.has(k)) byKey.set(k, f); });
  });

  const n = (v) => (Array.isArray(v) ? v.length : (v ? 1 : 0));
  const filled = []; const skippedHasComp = []; const noMatch = []; const flagged = [];

  parsed.formulas.forEach((p) => {
    if (NOT_A_FORMULA.test(p.pinyin)) return;
    const target = byKey.get(norm(p.pinyin));
    if (!target) { noMatch.push(p.pinyin); return; }
    if (n(target.composition)) { skippedHasComp.push(p.pinyin); return; }  // §0

    const composition = [];
    let unusable = false;
    p.composition.forEach((c) => {
      const entry = {
        herb_zh: null, herb_en: null, pinyin: c.herb,
        role_zh: c.role, role_en: c.role_en,
        dose_range: c.amount ? `${c.amount}g` : null,
      };
      if (c.herb_id) {
        const h = herbById.get(c.herb_id);
        entry.herb_zh = h ? (h.name_zh || h.chinese_name || null) : null;
        entry.herb_id = c.herb_id;
        entry.pinyin = h && h.pinyin ? h.pinyin : c.herb;
        if (c.preparation) entry.preparation_zh = c.preparation;
      } else {
        // "都收" applies here too: an ingredient we cannot name in Chinese is
        // still recorded under its curriculum pinyin and flagged, because
        // dropping it would silently shorten the formula.
        const u = UNRESOLVED[c.herb] || { zh: null, note_zh: '課件此味未能對應藥庫，待人工補中文名。' };
        entry.herb_zh = u.zh;
        if (u.note_zh) entry.note_zh = u.note_zh;
        if (u.sub_formula) entry.is_sub_formula = true;
        if (u.us) {
          entry.us_clinical_status = 'not_used_in_us';
          entry.us_clinical_note_zh = u.us;
          flagged.push(`${p.pinyin} — ${u.zh}`);
        }
        if (!u.zh) entry.needs_human_review = true;
      }
      composition.push(entry);
    });

    if (unusable || !composition.length) { noMatch.push(`${p.pinyin} (組成不完整)`); return; }

    target.composition = composition;
    target.field_sources = Object.assign({}, target.field_sources, { composition: [SOURCE_REF] });
    target.source_urls = Array.from(new Set([...(target.source_urls || []), SOURCE_REF]));
    target.composition_source_note_zh = '組成取自課件 Herbal Formulations Comprehensive 的 Rank/Herb/Amount 表（君臣佐使與劑量）。尚未經 AD / CloudTCM 交叉核對。';
    target.review_status = target.review_status === 'verified' ? target.review_status : 'draft';
    delete target.composition_cleared_note;
    filled.push({ pinyin: p.pinyin, id: target.id, count: composition.length });
  });

  console.log('===== 課件組成回填 =====\n');
  console.log(`解析檔方劑        ${parsed.formulas.length}`);
  console.log(`可回填            ${filled.length}`);
  console.log(`已有組成而跳過    ${skippedHasComp.length}  (§0 不覆蓋)`);
  console.log(`本地無對應卡      ${noMatch.length}`);
  console.log(`標註美國不用      ${flagged.length}`);

  console.log('\n--- 回填清單 ---');
  filled.forEach((f, i) => console.log(`${String(i + 1).padStart(3)}. ${f.pinyin.padEnd(30)} ${f.count} 味`));

  if (flagged.length) {
    console.log('\n--- 已收錄並標註「美國臨床不用」---');
    flagged.forEach((f) => console.log(`  ${f}`));
  }
  if (noMatch.length) {
    console.log('\n--- 未回填 ---');
    noMatch.forEach((m) => console.log(`  ${m}`));
  }

  if (write) {
    fs.writeFileSync(FORMULAS, JSON.stringify(F, null, 2) + '\n');
    console.log(`\n已寫入 ${FORMULAS}`);
  } else {
    console.log('\n（dry run：未寫入。加 --write 才落地。）');
  }
}

main();
