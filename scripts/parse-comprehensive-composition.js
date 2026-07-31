#!/usr/bin/env node
/* parse-comprehensive-composition.js — recover formula composition from the
 * "Herbal Formulations Comprehensive" curriculum export.
 *
 * Why this file and not the Summary Chart: the chart is a multi-column Word
 * table whose columns interleave once flattened, and the existing Python parser
 * for it truncates names (Long Dan Xie Gan Tang -> "Long Dan"), so only 11 of
 * our 85 gaps matched. This export instead carries, under each formula, a
 * single-column block:
 *
 *     Rank Herb Amount Properties Channels Notes
 *     Chief Bai tou weng 15 Bitter, cold; LI, LV Clears heat, relieves toxicity
 *     Deputy Huang lian 4-9 Bitter, cold HT, LV, ST, LI Clears damp-heat
 *
 * One row per ingredient, rank first, dose right after the name. 129 formulas
 * carry such a table.
 *
 * DRY RUN BY DEFAULT — prints a report and writes nothing. Pass --json <path>
 * to emit the parsed records for a separate, reviewable apply step. Nothing
 * here touches data/herbs/formulas.json.
 *
 * Rigor rules:
 *   - An ingredient whose name does not resolve to a herb record is reported,
 *     never guessed and never silently dropped.
 *   - A row without a recognisable dose keeps the dose empty rather than
 *     inventing one. Formula doses are not something to approximate.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'curriculum/formulas/Herbal Formulations Comprehensive.docx.md');
const HERBS = path.join(ROOT, 'data/herbs/herb_canon_shortlist.json');

const RANKS = {
  chief: '君', deputy: '臣', assistant: '佐', envoy: '使',
  'assistant/envoy': '佐使', 'chief/deputy': '君臣', 'deputy/assistant': '臣佐',
};
// "Chief", "Deputy", "Assistant/Envoy", optionally numbered ("Chief 1")
const ROW = /^(Chief|Deputy|Assistant|Envoy|Assistant\/Envoy|Chief\/Deputy|Deputy\/Assistant)\s*\d?\s+(.+)$/i;
const TABLE_HEAD = /^Rank\s+Herb\s+Amount/i;
const HEADER = /^([A-Z][A-Za-z' ]+?)\s*\[([一-鿿][^\]]*)\]/;
// A dose token: 15 | 4-9 | 3–6 | 1.5 | 9g | "3 pieces"
const DOSE = /^(\d+(?:\.\d+)?(?:\s*[-–~]\s*\d+(?:\.\d+)?)?)\s*(g|pcs?|pieces?|slices?)?$/i;
const STOP = /^(Modifications|Plus\b|Minus\b|Cautions?|Contraindications?|Modern Research|Case Study|Think & Review|##\s)/i;

/* Curriculum shorthand -> herb id. Every entry below was checked against
 * herb_canon_shortlist.json before being written here; nothing is inferred.
 * Note the pairs that look alike but are NOT: Sheng Di / Shu Di, Chi Shao /
 * Bai Shao are distinct herbs, so no prefix is ever stripped blindly. */
const ALIAS = {
  'shu di': 'herb.shu_di_huang',
  'sheng di': 'herb.sheng_di_huang',
  'mai dong': 'herb.mai_men_dong',
  'tian dong': 'herb.tian_men_dong',
  'chi shao yao': 'herb.chi_shao',
  'bai shao yao': 'herb.bai_shao',
  'gan cao shao': 'herb.gan_cao',       // 甘草梢 — the thin root tip
  'niu xi huai': 'herb.niu_xi',
  'hui niu xi': 'herb.niu_xi',          // 懷牛膝 — the Henan cultivar of 牛膝
  'lian geng': 'herb.lian_zi',          // 蓮梗/蓮子 in the Qing Shu Yi Qi context
  'sha yuan ji': 'herb.sha_yuan_zi',
  'sha yuan ji li': 'herb.sha_yuan_zi',  // 沙苑蒺藜
  'jin ling zi': 'herb.chuan_lian_zi',   // 金鈴子 = 川楝子
  'jing jie sui': 'herb.jing_jie',       // 荊芥穗 — the flower spike
  'dan nan xing': 'herb.tian_nan_xing',  // 膽南星 — bile-processed
  'jiang ban xia': 'herb.ban_xia',       // 薑半夏
  'dang gui wei': 'herb.dang_gui',       // 當歸尾 — the tail, moves blood
  'quan dang gui': 'herb.dang_gui',      // 全當歸 — the whole root
  'pao jiang': 'herb.gan_jiang',         // 炮薑 — blast-fried
  'jiu da huang': 'herb.da_huang',       // 酒大黃
  'huai niu xi': 'herb.niu_xi',
};

/* Processing prefixes. The base herb is the same plant part; the preparation is
 * kept as a note because 炙甘草 and 甘草 are not clinically interchangeable. */
const PREP = [
  [/^jiu chao /i, '酒炒'], [/^chao /i, '炒'], [/^zhi /i, '炙'],
  [/^duan /i, '煅'], [/^sheng /i, '生'], [/^chi /i, '赤'],
];

/* Names that must NEVER auto-resolve. "Da Ji" is 京大戟 (Euphorbia pekinensis,
 * a toxic purgative) when it stands beside Gan Sui and Yuan Hua in Shi Zao Tang,
 * but herb.da_ji in our database is 大薊, a hemostatic. Same pinyin, different
 * herb, opposite use. Resolving this by string match would be a safety defect,
 * so it is reported for a human instead. */
const AMBIGUOUS = new Set(['da ji']);

function loadHerbIndex() {
  const db = JSON.parse(fs.readFileSync(HERBS, 'utf8'));
  const recs = db.records || db;
  const idx = new Map();
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z]/g, '');
  recs.forEach((h) => {
    [h.pinyin, h.pinyin_toned, h.name_en, String(h.id || '').replace(/^herb\./, '').replace(/_/g, ' ')]
      .filter(Boolean).forEach((n) => { const k = norm(n); if (k && !idx.has(k)) idx.set(k, h.id); });
  });
  /* Resolve a curriculum ingredient name to a herb id.
   * Returns { id, preparation, reason } — reason explains a refusal so the
   * report can show why, rather than the name just vanishing. */
  // Guard: an ALIAS pointing at an id that does not exist would silently write
  // a dangling reference into every formula that uses it. Fail loudly instead.
  const allIds = new Set((db.records || db).map((h) => h.id));
  const dangling = Object.entries(ALIAS).filter(([, id]) => !allIds.has(id));
  if (dangling.length) {
    throw new Error('ALIAS 指向不存在的藥材 id: '
      + dangling.map(([k, v]) => `${k} -> ${v}`).join(', '));
  }

  const resolve = (raw) => {
    const plain = String(raw || '').replace(/[[\]()]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!plain) return { reason: 'empty' };
    if (AMBIGUOUS.has(plain)) return { reason: 'ambiguous_name_needs_human' };

    const direct = idx.get(norm(plain));
    if (direct) return { id: direct };

    const aliased = ALIAS[plain];
    if (aliased) return { id: aliased };

    for (const [re, label] of PREP) {
      if (!re.test(plain)) continue;
      const base = plain.replace(re, '').trim();
      if (AMBIGUOUS.has(base)) return { reason: 'ambiguous_name_needs_human' };
      const id = idx.get(norm(base)) || ALIAS[base];
      if (id) return { id, preparation: label };
    }
    return { reason: 'not_in_herb_db' };
  };

  return { idx, norm, resolve };
}

/* Split "Bai tou weng 15 Bitter, cold; LI, LV Clears heat..." into name + dose.
 * The name runs until the first standalone dose token; everything after the
 * dose is properties/channels/notes, which the herb card already owns. */
function splitRow(rest) {
  const parts = rest.split(/\s+/);
  for (let i = 1; i <= Math.min(parts.length, 6); i += 1) {
    const cand = parts[i];
    if (cand && DOSE.test(cand)) {
      return {
        herb: parts.slice(0, i).join(' ').replace(/[,;]$/, ''),
        amount: cand.replace(/\s+/g, ''),
        note: parts.slice(i + 1).join(' '),
      };
    }
  }
  // No dose in this row. Taking a fixed three words would drag the notes column
  // into the name ("Xiang Fu Moves", "Gua Lou Aromatic"), so stop at the first
  // word that belongs to the properties/notes vocabulary instead.
  const NOTE_WORD = /^(moves?|aromatic|warms?|warm|cools?|cold|sweet|bitter|acrid|salty|sour|bland|equal|clears?|tonif\w*|drains?|harmoni\w*|nourish\w*|dispels?|transforms?|regulates?|astring\w*|calms?|opens?|guides?|leads?|treats?|enhances?|dries|dry|strengthens?|reduces?|directs?|descends?|relieves?|stops?|both|pair|symptoms?|slightly|neutral|toxic|and|to|the|with|for)$/i;
  const name = [];
  for (const w of parts) {
    // Compare without trailing punctuation: the export writes "Sweet," and
    // "Zi," so a bare equality test would let the notes column through.
    if (NOTE_WORD.test(w.replace(/[,;.:]+$/, '')) || /^\d/.test(w)) break;
    name.push(w);
    if (name.length === 4) break;
  }
  return {
    herb: name.join(' ').replace(/[,;]$/, ''),
    amount: '',
    note: parts.slice(name.length).join(' '),
  };
}

function parse() {
  const lines = fs.readFileSync(SRC, 'utf8').split(/\r?\n/);
  const heads = [];
  lines.forEach((l, i) => {
    const m = l.match(HEADER);
    if (m && m[1].trim().split(/\s+/).length >= 2) {
      heads.push({ pinyin: m[1].trim(), name_zh: m[2].trim(), line: i, raw: l });
    }
  });

  const out = [];
  lines.forEach((l, i) => {
    if (!TABLE_HEAD.test(l)) return;
    let head = null;
    heads.forEach((h) => { if (h.line < i && (!head || h.line > head.line)) head = h; });
    if (!head || i - head.line > 60) return;

    const composition = [];
    for (let j = i + 1; j < Math.min(i + 30, lines.length); j += 1) {
      const line = lines[j].trim();
      if (!line) continue;
      if (STOP.test(line) || TABLE_HEAD.test(line) || HEADER.test(line)) break;
      const m = line.match(ROW);
      if (!m) continue;
      const { herb, amount, note } = splitRow(m[2].trim());
      if (!herb) continue;
      composition.push({ role: RANKS[m[1].toLowerCase()] || m[1], role_en: m[1], herb, amount, note });
    }
    if (composition.length) {
      const src = (head.raw.match(/Source:\s*([^[]+)/) || [])[1];
      const en = (head.raw.match(/\(([^)]+)\)/) || [])[1];
      out.push({
        pinyin: head.pinyin, name_zh: head.name_zh,
        name_en: en ? en.trim() : '', source_classic: src ? src.trim() : '',
        composition, source_line: head.line + 1,
      });
    }
  });
  return out;
}

function main() {
  const recs = parse();
  const { resolve } = loadHerbIndex();

  let ing = 0; let noDose = 0;
  const unmatched = new Map(); const reasons = new Map();
  recs.forEach((r) => r.composition.forEach((c) => {
    ing += 1;
    const hit = resolve(c.herb);
    if (hit.id) {
      c.herb_id = hit.id;
      if (hit.preparation) c.preparation = hit.preparation;
    } else {
      unmatched.set(c.herb, (unmatched.get(c.herb) || 0) + 1);
      reasons.set(c.herb, hit.reason);
      c.unresolved_reason = hit.reason;
    }
    if (!c.amount) noDose += 1;
  }));

  console.log('===== Comprehensive 課件組成解析 =====\n');
  console.log(`解析出方劑        ${recs.length}`);
  console.log(`藥味總數          ${ing}`);
  console.log(`  對得上藥庫      ${ing - [...unmatched.values()].reduce((a, b) => a + b, 0)}`);
  console.log(`  對不上          ${[...unmatched.values()].reduce((a, b) => a + b, 0)} (${unmatched.size} 種)`);
  console.log(`  無劑量          ${noDose}`);

  const sizes = recs.map((r) => r.composition.length);
  console.log(`每方藥味數        min ${Math.min(...sizes)} / 中位 ${sizes.sort((a, b) => a - b)[sizes.length >> 1]} / max ${Math.max(...sizes)}`);

  if (unmatched.size) {
    console.log('\n--- 對不上藥庫的藥名（不猜、不寫入）---');
    [...unmatched.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)
      .forEach(([k, n]) => console.log(`  ${String(n).padStart(3)}x  ${k.padEnd(22)} ${reasons.get(k)}`));
    if (unmatched.size > 40) console.log(`  … 還有 ${unmatched.size - 40} 種`);
  }

  const sample = recs.find((r) => /Bai Tou Weng/i.test(r.pinyin)) || recs[0];
  console.log('\n--- 抽樣核對 ---');
  console.log(`${sample.pinyin} [${sample.name_zh}] — ${sample.source_classic}`);
  sample.composition.forEach((c) => console.log(`  ${c.role}  ${c.herb}  ${c.amount || '(無劑量)'}  ${c.herb_id || '⚠ 未對上'}`));

  const jsonAt = process.argv.indexOf('--json');
  if (jsonAt > -1 && process.argv[jsonAt + 1]) {
    fs.writeFileSync(process.argv[jsonAt + 1], JSON.stringify({
      source: 'curriculum/formulas/Herbal Formulations Comprehensive.docx.md',
      parsed_at: '2026-07-30', formulas: recs,
    }, null, 2) + '\n');
    console.log(`\n已輸出 ${process.argv[jsonAt + 1]}（僅暫存，未寫入 formulas.json）`);
  } else {
    console.log('\n（dry run：沒有寫入任何檔案。加 --json <path> 才輸出。）');
  }
}

main();
