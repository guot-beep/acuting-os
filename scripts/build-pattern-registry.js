#!/usr/bin/env node
/* build-pattern-registry.js — incremental scanner for the pattern vocabulary.
 *
 * OWNERSHIP FLIPPED (D25, 2026-08-26). data/pathology/pattern_registry.json
 * is the hand-maintained source of truth; this script no longer generates it.
 *
 * History: this file originally built the registry from usage plus its own
 * curated tables (NAME_ZH / CATEGORIES / SYSTEM_OF). By 2026-08-26 the
 * registry had been hand-advanced far past those tables — 38 Pattern V2
 * records (lin-syndrome, 六經/衛氣營血/奇經八脈 expansions) carrying 442
 * fields, 171 fields of backfill on surviving records (system ×43,
 * registration_note_zh ×52, used_by_cases ×16, legacy_ids), 52 hand-verified
 * name_zh, 9 expanded family member lists, and one correction of this
 * script's own organ-name regex (pattern.spleen_constriction is 六經, not
 * 臟腑). Regenerating would have destroyed all of it — the 2026-07-31
 * accident again, from the other side. Making the script "catch up" would
 * mean copying hand-curated data into JS literals: a second copy that
 * drifts. Data belongs in the data file, so the data file now owns itself.
 *
 * What this tool does now:
 *   (default)  report — pattern.* ids used by conditions/comparisons but not
 *              registered (the dangling-reference detector this file was
 *              always for), registered-but-unused ids, and drift between the
 *              registry's recorded usage counts and a fresh scan.
 *   --append   append minimal skeleton records for the MISSING ids only.
 *              Existing records are never touched. name_zh ships empty with
 *              needs_name_zh=true — inventing a 證型 name is still exactly
 *              the guess that later reads as authoritative.
 *   --refresh-counts
 *              update used_by_conditions / used_by_comparisons on existing
 *              records to the fresh scan (D25 supplement, 2026-08-26). These
 *              two fields are DERIVED caches by definition
 *              (data/config/relation_registry.json edge.condition_patterns),
 *              so refreshing them is not "touching hand content" — it is the
 *              one mutation this tool is still allowed on existing records,
 *              and it must never write any other field. used_by_cases comes
 *              from the clinical-case line and is NOT scanned or written here.
 *   --write    refuses, loudly. Kept so old muscle memory fails with an
 *              explanation instead of a wiped registry.
 *
 * Note: the scan sees conditions + comparisons only. used_by_cases on
 * registry records comes from the clinical-case line and is not checked here,
 * so "registered but unused" is informational, never a deletion list.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONDITIONS = path.join(ROOT, 'data/pathology/condition_canon_shortlist.json');
const COMPARISONS = path.join(ROOT, 'data/knowledge/comparisons.json');
const REGISTRY = path.join(ROOT, 'data/pathology/pattern_registry.json');

const arr = (o, k) => (Array.isArray(o) ? o : (o && o[k]) || []);
const titleCase = (id) => id.replace(/^pattern\./, '').replace(/_/g, ' ')
  .replace(/\b\w/g, (c) => c.toUpperCase());

function main() {
  if (process.argv.includes('--write')) {
    console.error('❌ --write 已移除(D25,2026-08-26)。');
    console.error('   pattern_registry.json 是手工維護的 source of truth,不再由本腳本生成——');
    console.error('   重生成會毀掉 38 筆 V2 記錄與 171 個欄位(實測 2026-08-26)。');
    console.error('   要補「已被引用但未登錄」的 id,用 --append(只增不改);');
    console.error('   要改名稱/體系/家族結構,直接編輯 pattern_registry.json,');
    console.error('   然後跑 node scripts/validate-pattern-registry.js。');
    process.exitCode = 1;
    return;
  }
  const append = process.argv.includes('--append');
  const refresh = process.argv.includes('--refresh-counts');

  const conditions = arr(JSON.parse(fs.readFileSync(CONDITIONS, 'utf8')), 'records');
  const comparisons = arr(JSON.parse(fs.readFileSync(COMPARISONS, 'utf8')), 'records');
  const registryDoc = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const records = registryDoc.records || [];
  const registered = new Set(records.map((r) => r.id));

  const use = new Map();
  const touch = (id, kind, ref) => {
    if (!String(id || '').startsWith('pattern.')) return;
    if (!use.has(id)) use.set(id, { conditions: [], comparisons: [] });
    use.get(id)[kind].push(ref);
  };
  conditions.forEach((c) => [c.related_patterns, c.tcm_patterns].forEach((l) =>
    (Array.isArray(l) ? l : []).forEach((p) => touch(typeof p === 'string' ? p : p && p.id, 'conditions', c.id))));
  comparisons.forEach((m) => (m.compares || []).forEach((p) => touch(p, 'comparisons', m.id)));

  const missing = [...use.keys()].filter((id) => !registered.has(id)).sort();
  const unused = records.filter((r) => !use.has(r.id)).map((r) => r.id);
  const drift = records.filter((r) => {
    const u = use.get(r.id);
    return (r.used_by_conditions || 0) !== (u ? u.conditions.length : 0)
      || (r.used_by_comparisons || 0) !== (u ? u.comparisons.length : 0);
  });

  console.log('===== 證型登錄檔增量偵測(登錄檔為正本,D25)=====\n');
  console.log(`已登錄            ${records.length}`);
  console.log(`使用中的 id       ${use.size}(conditions + comparisons)`);
  console.log(`已引用但未登錄    ${missing.length}  ← 這是本工具存在的原因`);
  console.log(`已登錄但掃不到    ${unused.length}(僅指 conditions/comparisons 兩處;id 可能活在 pattern_library 本尊卡、穴位主治、tdis、方劑等層——2026-08-26 查證當時 38 筆全有實引用,勿逕判死詞彙)`);
  console.log(`引用計數漂移      ${drift.length}(登錄檔記載 vs 本次實測)`);

  if (missing.length) {
    console.log('\n--- 已引用但未登錄(懸空引用)---');
    missing.forEach((id) => {
      const u = use.get(id);
      console.log(`  ${id.padEnd(46)} cond ${u.conditions.length} / cmp ${u.comparisons.length}`);
    });
  }
  if (drift.length) {
    console.log('\n--- 引用計數漂移(前 15 筆)---');
    drift.slice(0, 15).forEach((r) => {
      const u = use.get(r.id) || { conditions: [], comparisons: [] };
      console.log(`  ${r.id.padEnd(46)} cond ${r.used_by_conditions || 0}→${u.conditions.length} / cmp ${r.used_by_comparisons || 0}→${u.comparisons.length}`);
    });
    if (drift.length > 15) console.log(`  … 其餘 ${drift.length - 15} 筆`);
    if (!refresh) console.log('  (--refresh-counts 可只刷新這兩個 derived 計數欄,不碰其他欄位。)');
  }

  let dirty = false;

  if (refresh && drift.length) {
    drift.forEach((r) => {
      const u = use.get(r.id) || { conditions: [], comparisons: [] };
      r.used_by_conditions = u.conditions.length;
      r.used_by_comparisons = u.comparisons.length;
    });
    dirty = true;
    console.log(`\n--refresh-counts:已更新 ${drift.length} 筆的 used_by_conditions / used_by_comparisons(僅此兩欄,其他欄位零改動)。`);
  } else if (refresh) {
    console.log('\n--refresh-counts:計數無漂移,無事可做。');
  }

  if (!missing.length) {
    console.log('\n無懸空引用。' + (append ? '(--append 無事可做)' : ''));
  } else if (!append) {
    console.log('\n(偵測模式:懸空引用未寫入。加 --append 只補上面缺漏的骨架,不動既有記錄。)');
  }

  if (missing.length && append) {
    appendSkeletons(missing, use, records);
    dirty = true;
  }

  if (dirty) {
    fs.writeFileSync(REGISTRY, JSON.stringify(registryDoc, null, 2) + '\n');
    console.log(`\n已寫入 ${REGISTRY}。接著跑 node scripts/validate-pattern-registry.js。`);
  }
}

function appendSkeletons(missing, use, records) {
  missing.forEach((id) => {
    const u = use.get(id);
    records.push({
      id,
      name_zh: '',
      name_en: titleCase(id),
      needs_name_zh: true,
      needs_system: true,
      used_by_conditions: u.conditions.length,
      used_by_comparisons: u.comparisons.length,
      review_status: 'draft',
      source_type: 'usage_scan_append',
      level: 'pattern',
      registration_note_zh: '由 build-pattern-registry.js --append 增量登記(D25):id 已在病症/鑑別卡中被引用但未登錄。中文名與辨證體系待人工查證,不得音譯或推測。',
    });
  });
  console.log(`\n--append:已補 ${missing.length} 筆骨架(既有記錄零改動)。`);
}

main();
