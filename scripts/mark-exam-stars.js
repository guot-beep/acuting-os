#!/usr/bin/env node
/**
 * Mark board-exam emphasis on every acupoint, from the curriculum's own stars.
 *
 * Ting asked for a red/orange marker on board key points across all 361. The
 * honest source for "what is a key point" is not my judgement — Chenoweth marks
 * it directly in the channel tables: `LU-7**`, `LI-4**`, `LI-11*`. One star is
 * emphasis, two is strong emphasis. Reading them off the tables means the
 * marker traces to a document Ting can open, exactly like every other field.
 *
 * The curriculum's channel prefixes differ from the database's, so they are
 * mapped rather than matched loosely — UB/DU/SJ/REN/KD/LV vs BL/GV/TE/CV/KI/LR.
 * A code that does not resolve is reported, never silently dropped.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = require("path").join(__dirname, "..");
const FILE = path.join(ROOT, "data/acupoints/361.json");
const DIR = path.join(ROOT, "curriculum/acupoints");
const APPLY = process.argv.includes("--apply");

const PREFIX = { UB: "BL", DU: "GV", SJ: "TE", REN: "CV", KD: "KI", LV: "LR" };

const marks = new Map(); // code -> {stars, file}
for (const f of fs.readdirSync(DIR).filter((n) => /^\d.*\.md$/.test(n))) {
  const text = fs.readFileSync(path.join(DIR, f), "utf8");
  for (const m of text.matchAll(/\b([A-Z]{2,3})-(\d+)(\*{1,2})/g)) {
    const pre = PREFIX[m[1]] || m[1];
    const code = `${pre}${Number(m[2])}`;
    const stars = m[3].length;
    const prev = marks.get(code);
    // A point can appear more than once in a table; keep the strongest mark.
    if (!prev || stars > prev.stars) marks.set(code, { stars, file: f.replace(/\.md$/, ".pdf") });
  }
}

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const recs = Array.isArray(data) ? data : (data.records || data.points);
const byCode = new Map(recs.map((r) => [r.code, r]));

let two = 0, one = 0, cleared = 0;
const unmatched = [];

for (const [code, info] of marks) {
  const r = byCode.get(code);
  if (!r) { unmatched.push(code); continue; }
  r.exam_star = info.stars;
  r.field_sources = r.field_sources || {};
  r.field_sources.exam_star = [`curriculum/acupoints/${info.file}`];
  if (info.stars === 2) two++; else one++;
}

// A point the curriculum did not star is not a key point. Clearing any stale
// value keeps the marker meaning "the course emphasised this", not "somebody
// once set a flag here".
for (const r of recs) {
  if (!marks.has(r.code) && r.exam_star != null) {
    delete r.exam_star;
    if (r.field_sources) delete r.field_sources.exam_star;
    cleared++;
  }
}

console.log(`curriculum stars found: ${marks.size} code(s) across 14 channel files`);
console.log(`  ★★ 強調 (2 stars)  ${two}`);
console.log(`  ★  重點 (1 star)   ${one}`);
console.log(`  cleared stale      ${cleared}`);
if (unmatched.length) {
  console.log(`\n⚠️ ${unmatched.length} code(s) in the curriculum with no record — reported, not dropped:`);
  console.log("   " + unmatched.join(" "));
}

const byChannel = {};
for (const [code, info] of marks) {
  if (!byCode.has(code)) continue;
  const ch = code.replace(/\d+$/, "");
  byChannel[ch] = byChannel[ch] || [];
  byChannel[ch].push(code + (info.stars === 2 ? "★★" : "★"));
}
console.log("\n每經考點:");
for (const [ch, list] of Object.entries(byChannel).sort()) {
  console.log(`  ${ch.padEnd(3)} ${list.length.toString().padStart(2)} 穴  ${list.join(" ")}`);
}

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten.");
