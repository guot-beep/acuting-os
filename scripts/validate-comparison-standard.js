#!/usr/bin/env node
/* validate-comparison-standard.js — 辨證鑑別卡驗證器。
 * 規格見 docs/COMPARISON_CARD_TEMPLATE.md
 *
 * The rule this exists to enforce is C1: a card authored by a model must ship
 * with empty cells. Cells are discriminators — "how do I tell this apart from
 * that one" — and a wrong discriminator sends you to the wrong pattern while
 * reading as though it were right. It is the one field in this repository
 * where bad content is decisively worse than none, so the owner writes it.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CMP = path.join(ROOT, 'data/knowledge/comparisons.json');
/* `pattern.*` ids are owned by pattern_registry.json. Note that
 * tcm_pattern_canon.json is a different vocabulary keyed `pat.<中文>` —
 * validating against that one reports every link as broken. */
const REGISTRY = path.join(ROOT, 'data/pathology/pattern_registry.json');
const FORMULAS = path.join(ROOT, 'data/herbs/formulas.json');

const ID_RE = /^cmp\.[a-z0-9_]+$/;
const MODEL_AUTHORS = new Set(['model_draft', 'model', 'ai', 'AI_generated_pending_review']);

function loadArray(file, ...keys) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (Array.isArray(raw)) return raw;
  for (const k of keys) if (Array.isArray(raw[k])) return raw[k];
  return Object.values(raw).find(Array.isArray) || [];
}

function main() {
  const records = loadArray(CMP, 'records', 'comparisons');

  /* pattern_registry.json now owns the vocabulary, so membership is a lookup
   * rather than a union of references scraped from other files. */
  const registry = loadArray(REGISTRY, 'records');
  const patternIds = new Set(registry.map((p) => p.id));
  const categoryIds = new Set(registry.filter((p) => p.level === 'category').map((p) => p.id));
  const formulaIds = new Set(loadArray(FORMULAS, 'records').map((f) => f.id));

  const defects = []; const warnings = [];
  const seen = new Set();

  records.forEach((r) => {
    const id = r.id || '(無 id)';

    if (!ID_RE.test(String(r.id || ''))) defects.push(`C2 ${id}: id 格式須為 cmp.<slug>（小寫、底線）`);
    if (seen.has(r.id)) defects.push(`C2 ${id}: id 重複`);
    seen.add(r.id);

    const compares = Array.isArray(r.compares) ? r.compares : [];
    if (compares.length < 2) defects.push(`C5 ${id}: compares 只有 ${compares.length} 個,鑑別至少要 2 個`);

    // C3 — every compared id must exist, and match the card type
    const wantFormula = r.type === 'formula_comparison';
    compares.forEach((cid) => {
      const isPattern = patternIds.has(cid);
      const isFormula = formulaIds.has(cid);
      if (!isPattern && !isFormula) {
        defects.push(`C3 ${id}: compares 的 ${cid} 不存在於證型庫或方劑庫`);
      } else if (wantFormula && !isFormula) {
        defects.push(`C3 ${id}: type=formula_comparison 但 ${cid} 不是方劑`);
      } else if (!wantFormula && !isPattern) {
        defects.push(`C3 ${id}: type=comparison 但 ${cid} 不是證型`);
      }
    });

    /* C9 — a category and one of its own members must not be compared side by
     * side. 腎虛 contains 腎陽虛; putting both in one row asks how a class
     * differs from a thing inside it, which has no answer. */
    compares.filter((c) => categoryIds.has(c)).forEach((cat) => {
      const def = registry.find((p) => p.id === cat);
      const clash = (def && def.members || []).filter((m) => compares.includes(m));
      if (clash.length) defects.push(`C9 ${id}: ${cat} 是上位分類,不能與自己的成員 ${clash.join('、')} 並列比較`);
    });

    const cells = r.cells && typeof r.cells === 'object' ? r.cells : {};
    const filled = Object.keys(cells).length > 0
      && Object.values(cells).some((row) => row && Object.values(row).some((v) => String(v || '').trim()));

    // C1 — the rule this file exists for
    if (MODEL_AUTHORS.has(r.authored_by) && filled) {
      defects.push(`C1 ${id}: authored_by=${r.authored_by} 卻有 cells 內容 —— 鑑別點只能由 Ting 撰寫`);
    }

    // C6 — promoted status must actually have content
    if (['owner_filled', 'verified'].includes(r.status) && !filled) {
      defects.push(`C6 ${id}: status=${r.status} 但 cells 是空的`);
    }

    // C4 — axes must line up with dimensions
    const dims = Array.isArray(r.dimensions) ? r.dimensions : [];
    if (filled) {
      compares.forEach((cid) => {
        const row = cells[cid];
        if (!row) return defects.push(`C4 ${id}: cells 缺少 ${cid} 這一列`);
        const missing = dims.filter((d) => !String(row[d] || '').trim());
        if (missing.length) defects.push(`C4 ${id}.${cid}: 缺少軸 ${missing.join('、')}`);
        const extra = Object.keys(row).filter((k) => !dims.includes(k));
        if (extra.length) warnings.push(`C4 ${id}.${cid}: 多出未宣告的軸 ${extra.join('、')}`);
      });
      // C7 — cells are meant to be bilingual
      Object.entries(cells).forEach(([cid, row]) => {
        Object.entries(row || {}).forEach(([axis, v]) => {
          const s = String(v || '').trim();
          if (s && !/[A-Za-z]{3,}/.test(s)) warnings.push(`C7 ${id}.${cid}.${axis}: 疑似缺英文`);
        });
      });
    }
  });

  // C8 — coverage against the groups that are ready to become cards
  const formulas = loadArray(FORMULAS, 'records');
  const groups = new Map();
  formulas.forEach((f) => {
    if (!f.comparison_group) return;
    groups.set(f.comparison_group, [...(groups.get(f.comparison_group) || []), f.id]);
  });
  const ready = [...groups.entries()].filter(([, v]) => v.length >= 2);
  const covered = new Set();
  records.forEach((r) => { if (r.seed_basis) ready.forEach(([g]) => { if (String(r.seed_basis).includes(g)) covered.add(g); }); });

  console.log('===== 辨證鑑別卡驗證 =====\n');
  console.log(`鑑別卡總數      ${records.length}`);
  console.log(`  證型鑑別      ${records.filter((r) => r.type !== 'formula_comparison').length}`);
  console.log(`  方劑鑑別      ${records.filter((r) => r.type === 'formula_comparison').length}`);
  const done = records.filter((r) => ['owner_filled', 'verified'].includes(r.status)).length;
  console.log(`  已由 Ting 填寫  ${done}`);
  console.log(`\nC8 方劑鑑別群組  ${ready.length} 個可建卡,已建 ${covered.size},缺 ${ready.length - covered.size}`);

  if (warnings.length) {
    console.log(`\n🟡 ${warnings.length} 個提醒:`);
    warnings.slice(0, 20).forEach((w) => console.log('  ' + w));
    if (warnings.length > 20) console.log(`  … 還有 ${warnings.length - 20}`);
  }

  if (defects.length) {
    console.log(`\n❌ ${defects.length} 個阻擋問題:\n`);
    defects.forEach((d) => console.log('  ' + d));
    process.exitCode = 1;
  } else {
    console.log('\nvalidate-comparison-standard: PASS');
  }
}

main();
