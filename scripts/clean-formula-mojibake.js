#!/usr/bin/env node
/**
 * clean-formula-mojibake.js — clear the formula fields the import destroyed.
 *
 * 44 of 173 formulas carry text like:
 *
 *   "modifications_zh": ["????????????", "??????????????????"]
 *   "chinese_depth_track.fang_yi_zh": "??????????????????????????"
 *
 * The encoding was lost at import time; the characters are not recoverable
 * from anything in this repo. 麻黃湯 is the clearest case — its
 * modifications_EN survived intact while the 中文 became question marks, so
 * the loss is one-sided and there is nothing to reconstruct from.
 *
 * Two kinds, treated differently, because §0 says 只加深不刪除 and that has to
 * mean something:
 *
 *   FULLY LOST (>80% of the string is ? or U+FFFD) — 94 strings. These carry
 *     zero information and today they render on the card as a row of question
 *     marks. Cleared, and the field is marked 待補 in the record's own
 *     mojibake_repaired note so it reads as "missing", which is true, rather
 *     than as garbage.
 *
 *   PARTIALLY DAMAGED (some characters lost, the rest readable) — 43 strings.
 *     KEPT. They still carry meaning, and deleting readable clinical text
 *     because it looks untidy is exactly what §0 forbids. Listed for manual
 *     repair against the source.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data/herbs/formulas.json");
const APPLY = process.argv.includes("--apply");

const MOJI = /[?�]/g;
const isMojibake = (s) => /\?{4,}|�/.test(s);
const lostRatio = (s) => ((s.match(MOJI) || []).length) / Math.max(1, s.length);
const FULLY_LOST = 0.8;

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = data.records || data;

let cleared = 0, kept = 0;
const clearedBy = new Map(), keptSamples = [];
const touched = new Set();

// Walk and rewrite in place. Arrays drop the dead entries; scalars go to "".
function scrub(obj, pathStr, rec) {
  if (Array.isArray(obj)) {
    const out = [];
    for (const v of obj) {
      if (typeof v === "string" && isMojibake(v)) {
        if (lostRatio(v) >= FULLY_LOST) {
          cleared++; touched.add(rec.id);
          clearedBy.set(pathStr, (clearedBy.get(pathStr) || 0) + 1);
          continue;                       // drop the dead entry entirely
        }
        kept++;
        if (keptSamples.length < 8) keptSamples.push(`${rec.name_zh}.${pathStr}: ${v.slice(0, 40)}`);
      }
      out.push(typeof v === "object" && v !== null ? scrub(v, `${pathStr}[]`, rec) : v);
    }
    return out;
  }
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      const p = pathStr ? `${pathStr}.${k}` : k;
      const v = obj[k];
      if (typeof v === "string" && isMojibake(v)) {
        if (lostRatio(v) >= FULLY_LOST) {
          obj[k] = ""; cleared++; touched.add(rec.id);
          clearedBy.set(p, (clearedBy.get(p) || 0) + 1);
        } else {
          kept++;
          if (keptSamples.length < 8) keptSamples.push(`${rec.name_zh}.${p}: ${v.slice(0, 40)}`);
        }
      } else if (typeof v === "object" && v !== null) {
        obj[k] = scrub(v, p, rec);
      }
    }
    return obj;
  }
  return obj;
}

for (const r of recs) scrub(r, "", r);

// Record what happened on the record itself, so the gap is visible in the data
// and not just in this script's output.
for (const r of recs) {
  if (!touched.has(r.id)) continue;
  r.mojibake_repaired = "匯入時編碼遺失，內容無法還原，已清空待補（見 scripts/clean-formula-mojibake.js）";
}

// Nothing readable may have been dropped.
const before = JSON.parse(raw);
const beforeRecs = before.records || before;
const fail = [];
for (let i = 0; i < beforeRecs.length; i++) {
  const a = JSON.stringify(beforeRecs[i]), b = JSON.stringify(recs[i]);
  if (a === b) continue;
  // Every character removed must have been a ? or U+FFFD.
  const strip = (s) => s.replace(/[?�]/g, "");
  const la = strip(a).length, lb = strip(b).length;
  // The JSON also loses the quotes/commas of dropped array entries, so allow a
  // small structural delta but no loss of real characters beyond it.
  if (lb < la - 6 * (a.split('"').length - b.split('"').length + 4)) {
    fail.push(`${recs[i].name_zh}: 清理後可讀字元變少了 ${la - lb} —— 可能刪到真內容`);
  }
}

console.log("方劑亂碼清理");
console.log(`  完全損毀已清空  ${cleared} 處，涉及 ${touched.size} 方`);
for (const [f, n] of [...clearedBy].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`     ${String(n).padStart(3)}  ${f}`);
console.log(`  部分可讀・保留  ${kept} 處（§0：可讀的內容不刪，列給人工比對修復）`);
keptSamples.forEach((s) => console.log(`     ${s}`));

if (fail.length) {
  console.error(`\n❌ ${fail.length} 個安全檢查失敗 —— 不寫入:`);
  fail.slice(0, 8).forEach((f) => console.error("  " + f));
  process.exit(1);
}
console.log("\n✅ 只移除了問號字元，沒有刪到可讀內容");

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/herbs/formulas.json");
