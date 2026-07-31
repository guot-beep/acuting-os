#!/usr/bin/env node
/* seed-formula-comparisons.js
 *
 * Two jobs, both on data/knowledge/comparisons.json:
 *
 * 1. Correct authored_by on the 11 existing pattern comparisons. Their cells
 *    were written by Ting from curriculum, but every record still says
 *    model_draft, which made the C1 check read them as a policy breach.
 *
 * 2. Create skeletons for the formula comparison groups. 30 comparison_group
 *    values on formula cards have two or more members and nothing built on
 *    them. Skeletons ship with EMPTY cells — the discriminators are Ting's,
 *    per COMPARISON_CARD_TEMPLATE §0.
 *
 * DRY RUN BY DEFAULT. --write to persist.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CMP = path.join(ROOT, 'data/knowledge/comparisons.json');
const FORMULAS = path.join(ROOT, 'data/herbs/formulas.json');

const DIMENSIONS = ['組成差異', '功效側重', '主治', '舌', '脈', '辨證要點'];

const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

function main() {
  const write = process.argv.includes('--write');
  const db = JSON.parse(fs.readFileSync(CMP, 'utf8'));
  const records = db.records;
  const formulas = JSON.parse(fs.readFileSync(FORMULAS, 'utf8')).records;

  // ── 1. authored_by correction ──
  let fixed = 0;
  records.forEach((r) => {
    const hasCells = r.cells && Object.values(r.cells).some((row) => row && Object.values(row).some((v) => String(v || '').trim()));
    if (hasCells && r.authored_by === 'model_draft') {
      r.authored_by = 'owner';
      r.status = r.status === 'draft' ? 'owner_filled' : r.status;
      r.authored_by_note_zh = 'Ting 依可靠課件撰寫；原 model_draft 標記為誤植,2026-07-31 更正。';
      fixed += 1;
    }
  });

  // ── 2. formula comparison skeletons ──
  const groups = new Map();
  formulas.forEach((f) => {
    if (!f.comparison_group) return;
    groups.set(f.comparison_group, [...(groups.get(f.comparison_group) || []), f]);
  });
  const ready = [...groups.entries()].filter(([, v]) => v.length >= 2);

  const existing = new Set(records.map((r) => r.id));
  const added = [];
  ready.forEach(([group, members]) => {
    const id = `cmp.${slug(group)}`;
    if (existing.has(id)) return;
    const names = members.map((m) => m.name_zh).filter(Boolean);
    added.push({
      id,
      type: 'formula_comparison',
      title_zh: `${names.slice(0, 3).join('、')}${names.length > 3 ? '等' : ''} 鑑別`,
      title_en: `${group.replace(/_/g, ' ')} — formula differentiation`,
      compares: members.map((m) => m.id),
      dimensions: [...DIMENSIONS],
      cells: {},
      authored_by: 'model_draft',
      status: 'draft',
      review_status: 'draft',
      seed_basis: `formula.comparison_group = ${group}`,
      notes_zh: '骨架由模型建立（僅結構）。鑑別點 cells 待 Ting 依課件填寫——見 docs/COMPARISON_CARD_TEMPLATE.md §0。',
    });
  });

  console.log('===== 鑑別卡種子 =====\n');
  console.log(`1) authored_by 更正        ${fixed} 筆（model_draft → owner）`);
  console.log(`2) 方劑鑑別群組可建卡      ${ready.length}`);
  console.log(`   本次新增骨架            ${added.length}`);
  console.log(`   已存在而跳過            ${ready.length - added.length}\n`);

  added.forEach((a, i) => {
    const n = a.compares.length;
    console.log(`${String(i + 1).padStart(3)}. ${a.id.padEnd(42)} ${n} 首  ${a.title_zh}`);
  });

  if (write) {
    db.records = [...records, ...added];
    db.updated_at = '2026-07-31';
    fs.writeFileSync(CMP, JSON.stringify(db, null, 2) + '\n');
    console.log(`\n已寫入 ${CMP}（總計 ${db.records.length} 筆）`);
  } else {
    console.log('\n（dry run：未寫入。加 --write 才落地。）');
  }
}

main();
