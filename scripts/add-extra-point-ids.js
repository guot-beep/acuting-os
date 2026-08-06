#!/usr/bin/env node
/**
 * add-extra-point-ids.js — give data/acupoints/extra_points.json the D2 ids.
 *
 * The file grew from 2 records to 72 while sitting outside validate-point-ids.js,
 * so 70 extra points reached the repo carrying a `code` and no `id`. Clinical
 * foreign keys reference `id` (DECISIONS D2), so none of them can be linked to
 * a case until this runs.
 *
 * D2 makes the id a pure function of the code — extra point EX-* becomes
 * `ex.<code minus the EX- prefix, lowercased>` — so nothing here is a judgement
 * call and nothing is invented:
 *
 *     EX-HN1  -> ex.hn1        EX-B2  -> ex.b2        EX-LE16 -> ex.le16
 *
 * ADDS ONLY. A record that already has an id is left exactly as it is (D1: never
 * re-id an existing entity), and `code` is never touched — D2 keeps code as the
 * display value precisely so URLs and prefix matchers keep working.
 *
 * DRY RUN BY DEFAULT. Pass --write to persist.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'data/acupoints/extra_points.json');
const MANIFEST = path.join(ROOT, 'data/acupoints/point_id_manifest.json');

const idForCode = (code) => `ex.${String(code).replace(/^EX-/i, '').toLowerCase()}`;

function main() {
  const write = process.argv.includes('--write');
  const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const records = raw.records || raw.points || (Array.isArray(raw) ? raw : null);
  if (!records) {
    console.error('無法在 extra_points.json 找到紀錄陣列');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const known = new Set(manifest.ids || []);

  const added = []; const kept = []; const problems = [];
  const seen = new Map();

  records.forEach((rec) => {
    const code = rec.code || rec.display_code;
    if (!code) return problems.push(`紀錄缺 code,無法推導 id: ${JSON.stringify(rec).slice(0, 60)}`);

    if (rec.id) {
      kept.push(`${code} 已有 id ${rec.id}`);
      return;
    }
    const id = idForCode(code);

    // D2 asserts distinct code -> distinct id. Two codes colliding on one id
    // would silently merge two points, so stop rather than write it.
    if (seen.has(id)) return problems.push(`id 衝突: ${code} 與 ${seen.get(id)} 都會得到 ${id}`);
    seen.set(id, code);

    rec.id = id;
    added.push({ code, id, inManifest: known.has(id) });
  });

  const newToManifest = added.filter((a) => !a.inManifest);

  console.log('===== 經外奇穴 id 補齊 =====\n');
  console.log(`紀錄總數        ${records.length}`);
  console.log(`本次補 id       ${added.length}`);
  console.log(`已有 id 保留    ${kept.length}`);
  console.log(`帳本尚未收錄    ${newToManifest.length}`);
  console.log(`問題            ${problems.length}`);

  if (added.length) {
    console.log('\n--- 補上的 id（前 12）---');
    added.slice(0, 12).forEach((a) => console.log(`  ${a.code.padEnd(9)} -> ${a.id}${a.inManifest ? '' : '   (帳本待補)'}`));
    if (added.length > 12) console.log(`  … 還有 ${added.length - 12}`);
  }
  if (problems.length) {
    console.log('\n❌ 問題:');
    problems.forEach((p) => console.log('  ' + p));
    process.exitCode = 1;
  }

  if (write && !problems.length) {
    fs.writeFileSync(FILE, JSON.stringify(raw, null, 2) + '\n');
    console.log(`\n已寫入 ${FILE}`);
    console.log('接著跑:');
    console.log('  node scripts/validate-point-ids.js');
    console.log('  node scripts/update-point-manifest.js --write   # 把新 id 記進帳本');
    console.log('  node scripts/build-data.js');
  } else if (!write) {
    console.log('\n（dry run：未寫入。加 --write 才落地。）');
  }
}

main();
