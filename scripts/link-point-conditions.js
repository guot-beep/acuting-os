#!/usr/bin/env node
/**
 * link-point-conditions.js — build the point ⇄ condition / pattern links (§6.5 B).
 *
 * Ting wants both vocabularies hung off each point: 西醫病名 so a case or a chief
 * complaint finds the point, and 中醫證候 because the actual reasoning path is
 * 病 → 證 → 穴.
 *
 * Two sources, deliberately different in kind:
 *
 *   related_conditions — the condition records name point codes in their prose,
 *     so this is a real clinical link, just never structured. Extracted and
 *     normalised.
 *
 *   tcm_pattern_ids — matched from the point's OWN disease_tags against the
 *     pattern canon, exact match only. Deriving patterns transitively through
 *     conditions was considered and rejected: ST36 appears in 117 conditions, so
 *     it would inherit nearly every pattern in the canon and mean nothing. Exact
 *     matching gives 14 of 532 tags — low recall, but every hit is defensible,
 *     and Ting fills the rest as her notes come in.
 *
 * ⚠️ The code format differs between the two files: conditions write SP08, SP06,
 * DU04; points are SP8, SP6, GV4. A naive match returns nothing and looks like
 * "there are no links" rather than "the join is broken", so normalisation is the
 * first thing this does and unmatched codes are reported, never dropped quietly.
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
const CODE_RE = /\b(?:LU|LI|ST|SP|HT|SI|BL|UB|KI|KD|PC|TE|SJ|GB|LR|LV|CV|REN|GV|DU)-?\d{1,2}\b/g;

function normalizeCode(raw) {
  const m = /^([A-Z]{2,3})-?0*(\d+)$/.exec(raw);
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
// Patterns are matched on the bare name: the canon stores 「肝氣鬱結」 and
// 「外感風寒」, and a tag may carry a trailing 證/症.
const patByName = new Map(patterns.map((p) => [p.name_zh.replace(/[證症]$/, ""), p.id]));

const condLinks = new Map();
const unmatched = new Set();
for (const c of conds) {
  if (!c.id) continue;
  const found = new Set(JSON.stringify(c).match(CODE_RE) || []);
  for (const rawCode of found) {
    const code = normalizeCode(rawCode);
    if (!code || !byCode.has(code)) { unmatched.add(rawCode); continue; }
    if (!condLinks.has(code)) condLinks.set(code, []);
    if (!condLinks.get(code).includes(c.id)) condLinks.get(code).push(c.id);
  }
}

let nCond = 0, nPat = 0;
const patHits = new Set();
for (const r of recs) {
  const cs = condLinks.get(r.code);
  if (cs && cs.length) {
    r.related_conditions = cs;
    r.field_sources = r.field_sources || {};
    r.field_sources.related_conditions = ["data/pathology/condition_canon_shortlist.json（病證敘述中提及本穴）"];
    nCond++;
  }
  const pats = [];
  for (const tag of r.disease_tags_zh || []) {
    const id = patByName.get(String(tag).trim().replace(/[證症]$/, ""));
    if (id && !pats.includes(id)) { pats.push(id); patHits.add(String(tag).trim()); }
  }
  if (pats.length) {
    r.tcm_pattern_ids = pats;
    r.field_sources = r.field_sources || {};
    r.field_sources.tcm_pattern_ids = ["data/config/tcm_pattern_canon.json（由本穴 disease_tags_zh 精準比對）"];
    nPat++;
  }
}

const degrees = [...condLinks.values()].map((v) => v.length).sort((a, b) => a - b);
console.log(`病證連結 related_conditions   ${nCond}/${recs.length} 穴`);
console.log(`  中位數 ${degrees[Math.floor(degrees.length / 2)]} 個病證，最多 ${degrees[degrees.length - 1]}`);
console.log(`  代碼正規化失敗           ${unmatched.size}${unmatched.size ? " → " + [...unmatched].slice(0, 8).join(" ") : ""}`);
console.log(`證候連結 tcm_pattern_ids      ${nPat}/${recs.length} 穴（比對到 ${patHits.size} 個標籤）`);
console.log(`  命中的證候標籤: ${[...patHits].join("、")}`);

if (!APPLY) { console.log("\n(dry run — pass --apply)"); process.exit(0); }
const indent = /^\{?\[?\n(\s+)"/.exec(raw)?.[1]?.length || 2;
fs.writeFileSync(POINTS, JSON.stringify(data, null, indent) + (raw.endsWith("\n") ? "\n" : ""), "utf8");
console.log("\nwritten.");
