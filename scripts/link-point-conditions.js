#!/usr/bin/env node
/**
 * link-point-conditions.js — build the point ⇄ condition / pattern links (§6.5 B).
 *
 * Ting wants both vocabularies hung off each point: 西醫病名 so a case or a chief
 * complaint finds the point, and 中醫證候 because the actual reasoning path is
 * 病 → 證 → 穴.
 *
 * ── Both links come from authored structure, not from prose ──
 *
 *   related_conditions ← cond.acupoint_protocols[].code
 *     The condition record carries a real protocol list with the point code
 *     already separated from the name. 135 of 150 conditions have one.
 *
 *   tcm_pattern_ids    ← cond.tcm_patterns[].acupoints_zh[]
 *     Each pattern inside a condition names its own points. This is a direct
 *     pattern→point statement by the same author, which is exactly the
 *     vocabulary §6.5 (B) asks for.
 *
 * An earlier version of this script scanned `JSON.stringify(condition)` for
 * anything code-shaped and matched patterns by comparing the point's own
 * disease_tags against the canon. That was two mistakes at once: the scan
 * swept up incidental prose mentions, and tag-matching found only 24 of 361
 * points because a point's tags are not written in the canon's vocabulary.
 * Reading the structured fields gives a defensible link every time and needs
 * no fuzzy matching at all.
 *
 * ⚠️ The code format differs between the two files: conditions write SP08,
 * SP06, DU04; points are SP8, SP6, GV4. A naive match returns nothing and
 * looks like "there are no links" rather than "the join is broken", so
 * normalisation is the first thing this does and unmatched codes are reported,
 * never dropped quietly.
 *
 * Dry-run by default; --apply to write.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const POINTS = path.join(ROOT, "data/acupoints/361.json");
const CONDS = path.join(ROOT, "data/pathology/condition_canon_shortlist.json");
const PATTERNS = path.join(ROOT, "data/config/tcm_pattern_canon.json");
const APPLY = process.argv.includes("--apply");

const PREFIX = { DU: "GV", REN: "CV", UB: "BL", SJ: "TE", KD: "KI", LV: "LR" };
const CODE_RE = /\b(LU|LI|ST|SP|HT|SI|BL|UB|KI|KD|PC|TE|SJ|GB|LR|LV|CV|REN|GV|DU)-?(\d{1,2})\b/;

function normalizeCode(raw) {
  const m = CODE_RE.exec(String(raw || "").toUpperCase());
  if (!m) return null;
  return (PREFIX[m[1]] || m[1]) + Number(m[2]);
}

const raw = fs.readFileSync(POINTS, "utf8");
const data = JSON.parse(raw);
const recs = Array.isArray(data) ? data : (data.records || data.points);
const byCode = new Map(recs.map((r) => [r.code, r]));

const condRaw = JSON.parse(fs.readFileSync(CONDS, "utf8"));
const conds = condRaw.records || condRaw;
const patterns = JSON.parse(fs.readFileSync(PATTERNS, "utf8")).records;
// The canon stores 「肝氣鬱結」 while a condition may write 「肝氣鬱結證」.
const patKey = (s) => String(s || "").trim().replace(/[證症]$/, "");
const patByName = new Map(patterns.map((p) => [patKey(p.name_zh), p.id]));

const condLinks = new Map();   // point code → [condition ids]
const patLinks = new Map();    // point code → [pattern ids]
const unmatchedCodes = new Set();
const unmatchedPatterns = new Set();

const push = (map, code, id) => {
  if (!map.has(code)) map.set(code, []);
  if (!map.get(code).includes(id)) map.get(code).push(id);
};

for (const c of conds) {
  if (!c.id) continue;

  // 西醫病名 — the authored protocol list.
  for (const ap of c.acupoint_protocols || []) {
    const src = typeof ap === "string" ? ap : ap.code;
    const code = normalizeCode(src);
    if (!code || !byCode.has(code)) { unmatchedCodes.add(String(src)); continue; }
    push(condLinks, code, c.id);
  }

  // 中醫證候 — each pattern names its own points.
  for (const p of c.tcm_patterns || []) {
    const pid = patByName.get(patKey(p.pattern_zh));
    if (!pid) { if (p.pattern_zh) unmatchedPatterns.add(p.pattern_zh); continue; }
    for (const a of p.acupoints_zh || []) {
      const code = normalizeCode(a);
      if (!code || !byCode.has(code)) { unmatchedCodes.add(String(a)); continue; }
      push(patLinks, code, pid);
    }
  }
}

let nCond = 0, nPat = 0;
for (const r of recs) {
  const cs = condLinks.get(r.code);
  if (cs && cs.length) {
    r.related_conditions = cs;
    r.field_sources = r.field_sources || {};
    r.field_sources.related_conditions = ["data/pathology/condition_canon_shortlist.json（acupoint_protocols 列出本穴）"];
    nCond++;
  }
  const ps = patLinks.get(r.code);
  if (ps && ps.length) {
    r.tcm_pattern_ids = ps;
    r.field_sources = r.field_sources || {};
    r.field_sources.tcm_pattern_ids = ["data/pathology/condition_canon_shortlist.json（tcm_patterns.acupoints_zh 列出本穴）"];
    nPat++;
  }
}

const deg = (map) => {
  const v = [...map.values()].map((x) => x.length).sort((a, b) => a - b);
  return v.length ? { med: v[Math.floor(v.length / 2)], max: v[v.length - 1] } : { med: 0, max: 0 };
};
const dc = deg(condLinks), dp = deg(patLinks);

console.log(`病證連結 related_conditions   ${nCond}/${recs.length} 穴   中位數 ${dc.med}，最多 ${dc.max}`);
console.log(`證候連結 tcm_pattern_ids      ${nPat}/${recs.length} 穴   中位數 ${dp.med}，最多 ${dp.max}`);
console.log(`  代碼正規化失敗   ${unmatchedCodes.size}${unmatchedCodes.size ? " → " + [...unmatchedCodes].slice(0, 8).join(" ") : ""}`);
console.log(`  證候名不在 canon ${unmatchedPatterns.size}${unmatchedPatterns.size ? " → " + [...unmatchedPatterns].slice(0, 6).join("、") : ""}`);

// The busiest points are worth eyeballing: a point linked to nearly every
// condition means the link carries no information and should be questioned.
const top = [...condLinks.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 6);
console.log("\n病證最多的穴:");
for (const [code, ids] of top) console.log(`  ${code.padEnd(6)} ${String(ids.length).padStart(3)} 個病證  ${byCode.get(code)?.chinese || ""}`);

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(POINTS, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten: data/acupoints/361.json");
