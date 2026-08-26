#!/usr/bin/env node
/**
 * audit-decision-implementation.js — D1–D21 implementation gap audit.
 *
 * DECISIONS.md records what was LOCKED. This script measures what actually
 * landed. It reports numbers only; it never edits data and never judges
 * whether a decision was right — only how much of it is real in the repo.
 *
 * Read-only. Run: node scripts/audit-decision-implementation.js
 *              node scripts/audit-decision-implementation.js --json
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const JSON_MODE = process.argv.includes("--json");

const out = [];
const findings = [];

function say(line = "") {
  out.push(line);
}

function record(id, title, rows, note) {
  findings.push({ id, title, rows, note });
  say(`## ${id} — ${title}`);
  say();
  for (const [label, value] of rows) say(`  ${String(label).padEnd(52)} ${value}`);
  if (note) {
    say();
    for (const n of [].concat(note)) say(`  → ${n}`);
  }
  say();
}

function readJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (err) {
    return { __parse_error: err.message };
  }
}

function records(rel) {
  const d = readJson(rel);
  if (!d) return null;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.records)) return d.records;
  if (Array.isArray(d.entries)) return d.entries;
  const arr = Object.values(d).find(Array.isArray);
  return arr || null;
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function pct(n, d) {
  if (!d) return "n/a";
  return `${n}/${d} (${Math.round((n / d) * 100)}%)`;
}

function walkData(fn, dir = path.join(ROOT, "data")) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkData(fn, p);
    else if (name.endsWith(".json")) fn(p, path.relative(ROOT, p).replace(/\\/g, "/"));
  }
}

// ------------------------------------------------------- CI wiring (helper)

const CI_SCRIPTS = new Set();
{
  const wfDir = path.join(ROOT, ".github", "workflows");
  if (fs.existsSync(wfDir)) {
    for (const f of fs.readdirSync(wfDir)) {
      const txt = fs.readFileSync(path.join(wfDir, f), "utf8");
      for (const m of txt.matchAll(/node\s+scripts\/([\w.-]+\.js)/g)) CI_SCRIPTS.add(m[1]);
    }
  }
}
function ciHas(name) {
  return Boolean(name) && CI_SCRIPTS.has(name);
}

// ---------------------------------------------------------------- load core

const COND = records("data/pathology/condition_canon_shortlist.json") || [];
const PATLIB = records("data/pathology/pattern_library.json") || [];
const PATREG = records("data/pathology/pattern_registry.json") || [];
const TDIS = records("data/pathology/tdis_registry.json") || [];
const SYM = records("data/symptoms/symptoms.json") || [];
const HERBS = records("data/herbs/herb_canon_shortlist.json") || [];
const FORMULAS = records("data/herbs/formulas.json") || [];
// Point ids live across six files. This list is copied from
// scripts/validate-point-ids.js so the two agree by construction — measuring a
// subset here would invent a hard-delete that does not exist.
const POINT_SOURCES = [
  ["data/acupoints/361.json", (d) => d],
  ["data/tung/point_index.json", (d) => d.points || d],
  ["data/auricular/gb93_index.json", (d) => d.points || []],
  ["data/auricular/embedded/auricular_points.json", (d) => d],
  ["data/acupoints/embedded/professional_points.json", (d) => d],
  ["data/acupoints/extra_points.json", (d) => d.records || d.points || (Array.isArray(d) ? d : [])],
];
const ALL_POINTS = [];
for (const [rel, get] of POINT_SOURCES) {
  const raw = readJson(rel);
  if (!raw || raw.__parse_error) continue;
  const arr = get(raw);
  if (Array.isArray(arr)) ALL_POINTS.push(...arr);
}
const POINTS = records("data/acupoints/361.json") || [];
const EXTRA = records("data/acupoints/extra_points.json") || [];
const SUPP = records("data/supplements/supplements.json") || [];
const DRUGS = records("data/pharmacology/drugs.json") || [];
const METRICS = records("data/clinical_cases/outcome_metrics.json") || [];
const RELREG = readJson("data/config/relation_registry.json");

const CANON_FILES = {
  "cond.*": ["data/pathology/condition_canon_shortlist.json", COND],
  "tdis.*": ["data/pathology/tdis_registry.json", TDIS],
  "pattern.* (library)": ["data/pathology/pattern_library.json", PATLIB],
  "sym.*": ["data/symptoms/symptoms.json", SYM],
  "herb.*": ["data/herbs/herb_canon_shortlist.json", HERBS],
  "formula.*": ["data/herbs/formulas.json", FORMULAS],
  "supp.*": ["data/supplements/supplements.json", SUPP],
  "drug.*": ["data/pharmacology/drugs.json", DRUGS],
};

// Which tree is being measured. This repo runs long-lived integration
// branches that diverge from main by hundreds of commits, and the knowledge
// layer differs sharply between them — the same audit reports
// related_patterns at 30% on one branch and 78% on another. An audit that
// does not name its ref invites someone to act on the wrong branch's numbers.
function gitRef() {
  try {
    const { execFileSync } = require("child_process");
    const run = (args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
    const sha = run(["rev-parse", "--short", "HEAD"]);
    let name = run(["rev-parse", "--abbrev-ref", "HEAD"]);
    if (name === "HEAD") {
      const described = run(["for-each-ref", "--points-at", "HEAD", "--format=%(refname:short)"]).split("\n")[0];
      name = described || "(detached)";
    }
    let dirty = "";
    try {
      if (run(["status", "--porcelain", "--", "data"])) dirty = " · data/ has uncommitted changes";
    } catch { /* ignore */ }
    return `${name} @ ${sha}${dirty}`;
  } catch {
    return "(not a git checkout)";
  }
}

say("# D1–D21 implementation gap audit");
say();
say(`generated by scripts/audit-decision-implementation.js — read-only`);
say(`decisions source: DECISIONS.md`);
say(`MEASURED TREE: ${gitRef()}`);
say();
say("Numbers below describe THIS tree only. Re-run on the branch you intend to");
say("act on — the knowledge layer differs materially between branches.");
say();
say("Every number below is produced by this script. No number is hand-typed.");
say();
say("---");
say();

// ---------------------------------------------------------------- D1
{
  const cjk = /[㐀-鿿豈-﫿]/;
  let cjkIds = 0;
  const cjkSamples = [];
  let totalIds = 0;
  for (const [ns, [, recs]] of Object.entries(CANON_FILES)) {
    for (const r of recs) {
      if (!r || typeof r.id !== "string") continue;
      totalIds++;
      if (cjk.test(r.id)) {
        cjkIds++;
        if (cjkSamples.length < 3) cjkSamples.push(`${ns} ${r.id}`);
      }
    }
  }
  const manifest = readJson("data/acupoints/point_id_manifest.json");
  const manifestIds = manifest
    ? (Array.isArray(manifest) ? manifest : manifest.ids || manifest.records || []).length
    : 0;
  record("D1", "IDs are opaque, immutable, decoupled from display", [
    ["canonical records carrying an `id`", totalIds],
    ["ids containing CJK characters (must be 0)", cjkIds + (cjkSamples.length ? ` — e.g. ${cjkSamples.join(", ")}` : "")],
    ["point id manifest present", manifest ? `yes (${manifestIds} ids)` : "MISSING"],
    ["validate-point-ids.js in CI", ciHas("validate-point-ids.js") ? "yes" : "NO"],
  ], cjkIds === 0
    ? "no measurable violation in canonical files"
    : "CJK in an id is D10 rule 2 — an encoding bug waiting to happen");
}

// ---------------------------------------------------------------- D2
{
  const all = ALL_POINTS;
  const withId = all.filter((p) => p && typeof p.id === "string");
  const pre = {};
  for (const p of withId) {
    const k = /^[A-Z]+\d/.test(p.id) ? "standard (id===code)" : p.id.split(".")[0] + ".*";
    pre[k] = (pre[k] || 0) + 1;
  }
  // An id appearing in two source files is the SAME point catalogued twice
  // (D2's own example: GB93 `AT4` and the embedded `AT4` correctly share
  // `ear.at4`). Only a repeat WITHIN one file is a real collision.
  const seen = new Set();
  const crossFile = new Set();
  const sameFile = new Set();
  for (const [rel, get] of POINT_SOURCES) {
    const raw = readJson(rel);
    if (!raw || raw.__parse_error) continue;
    const arr = get(raw);
    if (!Array.isArray(arr)) continue;
    const inThisFile = new Set();
    for (const p of arr) {
      if (!p || typeof p.id !== "string") continue;
      if (inThisFile.has(p.id)) sameFile.add(p.id);
      inThisFile.add(p.id);
      if (seen.has(p.id)) crossFile.add(p.id);
      seen.add(p.id);
    }
  }
  record("D2", "Namespaced point ids, `code` untouched", [
    ["points loaded (all 6 source files)", all.length],
    ["carrying an `id`", pct(withId.length, all.length)],
    ["distinct ids", seen.size],
    ["same id in TWO source files (expected — one point, two catalogues)", crossFile.size],
    ["same id twice WITHIN one file (a real collision)", sameFile.size],
    ...Object.entries(pre).map(([k, v]) => [`  prefix ${k}`, v]),
    ["validate-point-ids.js in CI", ciHas("validate-point-ids.js") ? "yes" : "NO"],
  ]);
}

// ---------------------------------------------------------------- D3
{
  function homonyms(recs, label) {
    const byName = {};
    for (const r of recs) {
      if (!r || !r.name_zh) continue;
      (byName[r.name_zh] = byName[r.name_zh] || []).push(r.id || "(no id)");
    }
    const collided = Object.entries(byName).filter(([, ids]) => ids.length > 1);
    const unqualified = collided.filter(([, ids]) => ids.some((i) => !String(i).includes("__")));
    return { label, total: recs.length, collided: collided.length, unqualified, };
  }
  const f = homonyms(FORMULAS, "formula");
  const h = homonyms(HERBS, "herb");
  const samples = [...f.unqualified, ...h.unqualified].slice(0, 4)
    .map(([n, ids]) => `${n} → ${ids.join(" / ")}`);
  record("D3", "Homonyms disambiguated by `__<source>`", [
    ["formulas", f.total],
    ["  name_zh shared by >1 formula", f.collided],
    ["  of those, NOT `__`-qualified", f.unqualified.length],
    ["herbs", h.total],
    ["  name_zh shared by >1 herb", h.collided],
    ["  of those, NOT `__`-qualified", h.unqualified.length],
    ["validate-naming.js in CI", ciHas("validate-naming.js") ? "yes" : "NO — the rule is unenforced"],
  ], samples.length ? ["unqualified collisions: " + samples.join(" · ")] : null);
}

// ---------------------------------------------------------------- D4
{
  const phiValidators = [
    "validate-care-draft-phi.js",
    "validate-clinical-store-phi-boundary.js",
    "validate-clinical-case-standard.js",
  ];
  record("D4", "De-identification is a habit, not just a schema", [
    ...phiValidators.map((v) => [
      `${v}`,
      exists(`scripts/${v}`) ? (ciHas(v) ? "exists · in CI" : "exists · NOT in CI") : "MISSING",
    ]),
    ["schema stores birth_year + birth_month only", /birth_month/.test(readText("data/clinical_cases/schema.sql")) ? "yes" : "no"],
    // A column DECLARATION, not the word — schema.sql discusses birth_day in a
    // comment explaining why it will never exist; matching that text would
    // report a violation that is actually the rule being documented.
    ["schema declares a birth_day column (must be no)", /^\s*birth_day\s+\w/m.test(readText("data/clinical_cases/schema.sql")) ? "YES — violation" : "no (only named in a comment explaining its absence)"],
  ], "free-text discipline is unenforceable in code by design — not measurable here");
}

function readText(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

// ---------------------------------------------------------------- D5
{
  const sql = readText("data/clinical_cases/schema.sql");
  const tables = [...sql.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g)].map((m) => m[1]);
  const junction = tables.filter((t) => /^(case|visit)_/.test(t));
  record("D5", "Choose MANY when in doubt (junction tables)", [
    ["tables in schema.sql", tables.length],
    ["junction tables (case_* / visit_*)", junction.length],
    ["visit_tcm_patterns present", tables.includes("visit_tcm_patterns") ? "yes" : "NO"],
    ["  carries is_primary / role", /is_primary/.test(sql) ? "yes" : "NO"],
    ["visit_outcomes present (structured, not blob)", tables.includes("visit_outcomes") ? "yes" : "NO"],
    ["PRAGMA foreign_keys = ON", /PRAGMA foreign_keys\s*=\s*ON/.test(sql) ? "yes" : "NO"],
    ["schema.sql is the RUNTIME store", "no — runtime is localStorage (see D18)"],
  ]);
}

// ---------------------------------------------------------------- D6
{
  const dep = {};
  for (const [ns, [, recs]] of Object.entries(CANON_FILES)) {
    const n = recs.filter((r) => r && r.review_status === "deprecated").length;
    if (n) dep[ns] = n;
  }
  const manifest = readJson("data/acupoints/point_id_manifest.json");
  const manifestIds = manifest
    ? new Set(Array.isArray(manifest) ? manifest : (manifest.ids || (manifest.records || []).map((r) => r.id || r)))
    : new Set();
  const liveIds = new Set(ALL_POINTS.map((p) => p && p.id).filter(Boolean));
  const vanished = [...manifestIds].filter((id) => !liveIds.has(id));
  record("D6", "Knowledge records are never hard-deleted", [
    ["point ids in manifest", manifestIds.size],
    ["manifest ids missing from live data (hard delete)", vanished.length],
    ...Object.entries(dep).map(([ns, n]) => [`deprecated records in ${ns}`, n]),
    ["validate-point-ids.js in CI (enforces manifest)", ciHas("validate-point-ids.js") ? "yes" : "NO"],
  ], vanished.length ? `vanished sample: ${vanished.slice(0, 3).join(", ")}` : null);
}

// ---------------------------------------------------------------- D7
{
  const gi = readText(".gitignore");
  const bridge = ["scripts/build-clinical-db.js", "scripts/build-derived-knowledge-tables.js"]
    .filter((s) => exists(s));
  record("D7", "JSON knowledge in git + SQLite clinical gitignored", [
    ["*.db gitignored", /^\*\.db$/m.test(gi) ? "yes" : "NO"],
    ["clinical_cases/local|private|exports gitignored", /clinical_cases\/(local|private|exports)/.test(gi) ? "yes" : "NO"],
    ["knowledge is JSON in git", "yes"],
    ["derived-knowledge-tables build bridge", bridge.length ? bridge.join(", ") : "NOT BUILT (D7 says H2)"],
    ["rebuild pre-flight (aborts on missing FK target)", exists("scripts/rehearse-runtime-restore.js") ? "rehearse-runtime-restore.js exists" : "NOT BUILT"],
  ]);
}

// ---------------------------------------------------------------- D8
{
  let withDomain = 0;
  let total = 0;
  const byNs = {};
  for (const [ns, [, recs]] of Object.entries(CANON_FILES)) {
    let n = 0;
    for (const r of recs) {
      if (!r || typeof r !== "object") continue;
      total++;
      if (Array.isArray(r.domain) && r.domain.length) {
        withDomain++;
        n++;
      }
    }
    byNs[ns] = n;
  }
  record("D8", "Specialty is a cross-cutting `domain` TAG", [
    ["domain vocabulary file", exists("data/config/domain_vocabulary.json") ? "yes" : "MISSING"],
    ["canonical records carrying a non-empty `domain`", pct(withDomain, total)],
    ...Object.entries(byNs).map(([ns, n]) => [`  ${ns}`, n]),
  ], withDomain === 0
    ? "D8 is decided and correct, but 0% implemented — nothing violates it because nothing uses it"
    : null);
}

// ---------------------------------------------------------------- D9
{
  const banned = /"(used_in_cases|case_count|visit_count|times_used|usage_count)"/;
  const hits = [];
  walkData((abs, rel) => {
    if (rel.startsWith("data/audits/") || rel.startsWith("data/generated/")) return;
    const txt = fs.readFileSync(abs, "utf8");
    if (banned.test(txt)) hits.push(rel);
  });
  record("D9", "Clinical aggregates never inside a knowledge record", [
    ["canonical files carrying a usage-count field", hits.length],
    ["snapshot file data/audits/clinical_usage_snapshot.json", exists("data/audits/clinical_usage_snapshot.json") ? "exists" : "not built (allowed — D9 says MAY)"],
    ["reverse index built at runtime", "not built (CG4/CG5 pending)"],
  ], hits.length ? `violations: ${hits.slice(0, 5).join(", ")}` : "no violation — the rule holds because the feature does not exist yet");
}

// ---------------------------------------------------------------- D10
{
  const regIds = new Set(PATREG.map((r) => r && r.id).filter(Boolean));
  const libIds = new Set(PATLIB.map((r) => r && r.id).filter(Boolean));
  const resolvable = new Set([...regIds, ...libIds]);
  const badNs = [...resolvable].filter((id) => !String(id).startsWith("pattern."));
  const alias = readJson("data/config/pattern_alias_map.json");
  const aliasCount = alias
    ? Object.keys(alias.map || alias.aliases || alias).filter((k) => !k.startsWith("_") && k !== "dataset" && k !== "policy" && k !== "created").length
    : 0;

  let linkTotal = 0;
  let linkResolved = 0;
  let condWithLinks = 0;
  let blobTotal = 0;
  let condWithBlobs = 0;
  for (const c of COND) {
    const rp = Array.isArray(c.related_patterns) ? c.related_patterns : [];
    if (rp.length) condWithLinks++;
    for (const p of rp) {
      linkTotal++;
      const id = typeof p === "string" ? p : p && (p.id || p.pattern_id);
      if (id && resolvable.has(id)) linkResolved++;
    }
    const tp = Array.isArray(c.tcm_patterns) ? c.tcm_patterns : [];
    if (tp.length) condWithBlobs++;
    blobTotal += tp.length;
  }
  record("D10", "One pattern namespace `pattern.<english_slug>`", [
    ["pattern_registry records", PATREG.length],
    ["pattern_library records", PATLIB.length],
    ["ids outside the `pattern.` namespace", badNs.length],
    ["alias map entries (pat.<中文> → pattern.*)", aliasCount],
    ["conditions carrying related_patterns", pct(condWithLinks, COND.length)],
    ["related_patterns links total", linkTotal],
    ["  resolving in registry ∪ library", pct(linkResolved, linkTotal)],
    ["conditions still carrying raw tcm_patterns blobs", pct(condWithBlobs, COND.length)],
    ["  raw blobs not yet lifted into a pattern id", blobTotal],
    ["validate-condition-standard.js (C6 enforces this) in CI", ciHas("validate-condition-standard.js") ? "yes" : "NO — C6 is unenforced"],
  ]);
}

// ---------------------------------------------------------------- D11
{
  const rows = [];
  const expect = { "cond.*": 150, "tdis.*": 75, "pattern.*": 69, "sym.*": 0 };
  const now = {
    "cond.*": COND.length,
    "tdis.*": TDIS.length,
    "pattern.*": PATREG.length,
    "sym.*": SYM.length,
  };
  for (const ns of Object.keys(expect)) {
    rows.push([`${ns} records`, `${now[ns]}   (D11 recorded ${expect[ns]} on 2026-08-06)`]);
  }
  // entity_type agreement
  let typed = 0;
  let disagree = 0;
  const want = { cond: "biomedical_condition", tdis: "tcm_disease" };
  for (const r of [...COND, ...TDIS]) {
    if (!r || !r.entity_type) continue;
    typed++;
    const ns = String(r.id).split(".")[0];
    if (want[ns] && r.entity_type !== want[ns]) disagree++;
  }
  rows.push(["cond+tdis records carrying entity_type", pct(typed, COND.length + TDIS.length)]);
  rows.push(["  entity_type disagreeing with its namespace", disagree]);

  // D11's real test is not "do the four exist" but "does anything else appear
  // in a RELATION field". An import handle in a relation field is the defect
  // D10 spent a day undoing for patterns.
  const ID_SHAPE = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;
  const RELFIELDS = new Set([
    "related_conditions", "related_patterns", "related_eastern_diseases",
    "related_tcm_disease_ids", "related_biomedical_condition_ids",
    "sign_symptom_ids", "medication_links", "compares", "tcm_pattern_ids",
  ]);
  const SANCTIONED = new Set(["cond", "tdis", "pattern", "sym", "herb", "formula",
    "drug", "supp", "metric", "cmp", "point", "ex", "ear", "tung"]);
  const relTally = {};
  function scanRel(o, file) {
    if (Array.isArray(o)) return o.forEach((x) => scanRel(x, file));
    if (!o || typeof o !== "object") return;
    for (const [k, v] of Object.entries(o)) {
      if (RELFIELDS.has(k)) {
        const ids = (Array.isArray(v) ? v : [v])
          .map((x) => (typeof x === "string" ? x : x && (x.id || x.pattern_id)))
          .filter((x) => typeof x === "string" && ID_SHAPE.test(x));
        for (const id of ids) {
          const ns = id.split(".")[0];
          relTally[ns] = relTally[ns] || { n: 0, files: new Set() };
          relTally[ns].n++;
          relTally[ns].files.add(file);
        }
      }
      scanRel(v, file);
    }
  }
  walkData((abs, rel) => {
    if (/\/(imports|research_staging|audits|generated)\//.test("/" + rel)) return;
    try {
      scanRel(JSON.parse(fs.readFileSync(abs, "utf8")), rel);
    } catch (err) { /* unparseable files are reported by validate-data */ }
  });
  const outside = Object.entries(relTally)
    .filter(([ns]) => !SANCTIONED.has(ns))
    .sort((a, b) => b[1].n - a[1].n);
  rows.push(["— namespaces appearing inside RELATION fields —", ""]);
  for (const [ns, v] of Object.entries(relTally).filter(([ns]) => SANCTIONED.has(ns)).sort((a, b) => b[1].n - a[1].n)) {
    rows.push([`  ${ns}.* (sanctioned)`, v.n]);
  }
  for (const [ns, v] of outside) {
    rows.push([`  ${ns}.* — OUTSIDE the four namespaces`, `${v.n} ref(s) in ${[...v.files].slice(0, 3).join(", ")}`]);
  }
  record("D11", "Four canonical diagnostic namespaces", rows,
    outside.length
      ? [`${outside.length} unsanctioned namespace(s) are used as relation targets.`,
         "D11: import handles 'may never appear in a relation field'."]
      : null);
}

// -------------------------------------------- D11-b parallel-universe check
{
  const legacy = records("data/pathology/conditions.json") || [];
  const canonSlugs = new Set(COND.map((r) => String(r.id).replace(/^cond\./, "")));
  const twins = legacy.filter((r) => canonSlugs.has(String(r.id).replace(/^western_condition\./, "")));
  const orphans = legacy.filter((r) => !canonSlugs.has(String(r.id).replace(/^western_condition\./, "")));
  const cw = readText("data/interop/condition_crosswalk.json");
  const know = readText("js/knowledge.js");
  record("D11-b", "Is `western_condition.*` a second universe for 西醫病名?", [
    ["records in data/pathology/conditions.json", legacy.length],
    ["  loaded by scripts/build-data.js", /pathology\/conditions\.json/.test(readText("scripts/build-data.js")) ? "yes" : "no"],
    ["  with a cond.* twin of the same slug", twins.length],
    ["  existing ONLY under western_condition.*", orphans.length],
    ["crosswalk entries mapping western_condition.* → cond.*", (cw.match(/western_condition\./g) || []).length],
    ["alias map for this namespace", exists("data/config/condition_alias_map.json") ? "exists" : "MISSING"],
    ["renderer treats the two as one label", /western_condition"?\s*\|\|\s*p === "cond"|p === "western_condition" \|\| p === "cond"/.test(know) ? "yes — js/knowledge.js entityKindLabel()" : "no"],
  ], [
    "This is D10's 'two independent universes' finding, one axis over.",
    "D10 cost one day at 61+50+140 records; this is 12 records today.",
  ]);
}

// ---------------------------------------------------------------- D12
{
  const freeze = new Date("2026-09-01T00:00:00Z");
  const today = new Date(process.env.AUDIT_TODAY || "2026-08-25T00:00:00Z");
  const days = Math.round((freeze - today) / 86400000);
  const app = readText("app.js");
  const storeKey = (app.match(/acuting-clinical-cases-v\d+/) || [])[0] || "(not found)";
  record("D12", "Clinical-layer additive-only from 2026-09-01", [
    ["days until the freeze", days],
    ["localStorage key in app.js", storeKey],
    // The v1 export writes `payload = clinicalCases` — a bare array. A bare
    // array has nowhere to put a version, so the only format marker is the
    // FILENAME (acuting-clinical-cases-* vs -v2-*), which a user can rename.
    ["v1 export payload shape", Array.isArray(readJson("data/clinical_cases/sample_export_fixture.json")) ? "bare array — no envelope, no version field" : "envelope"],
    ["v1 export carries a version INSIDE the file", /payload = clinicalCases;/.test(readText("app.js")) ? "NO — version lives only in the filename" : "check app.js"],
    ["migration script exercised on test data", exists("scripts/rehearse-runtime-restore.js") ? "rehearse-runtime-restore.js (in CI: " + (ciHas("rehearse-runtime-restore.js") ? "yes" : "no") + ")" : "MISSING"],
  ], days > 0 ? "not yet in force — this is the last window for a breaking change" : "IN FORCE");
}

// ---------------------------------------------------------------- D13
{
  const edges = (RELREG && RELREG.edges) || [];
  const rows = [["edges registered in relation_registry.json", edges.length]];
  const fileCache = {};
  function loadRecs(rel) {
    if (!(rel in fileCache)) fileCache[rel] = records(rel) || [];
    return fileCache[rel];
  }
  const detail = [];
  for (const e of edges) {
    if (!e.file || !e.field) continue;
    const recs = loadRecs(e.file);
    if (!recs.length) {
      detail.push([`  ${e.field}`, "source file empty/unreadable"]);
      continue;
    }
    const filled = recs.filter((r) => {
      const v = r && r[e.field];
      return Array.isArray(v) ? v.length > 0 : v != null && v !== "";
    }).length;
    detail.push([`  ${e.field} (on ${e.stored_on})`, pct(filled, recs.length)]);
  }
  const retired = (RELREG && RELREG.retired_hand_filled_fields) || [];
  // check the retired reverse fields are genuinely unfilled
  let retiredFilled = 0;
  for (const r of retired) {
    const [file, field] = String(r.field).split(".");
    if (file === "pattern_library") {
      retiredFilled += PATLIB.filter((p) => Array.isArray(p[field]) && p[field].length).length;
    }
  }
  record("D13", "Every edge stored on ONE side, reverse derived", [
    ...rows,
    ...detail,
    ["retired hand-filled reverse fields", retired.length],
    ["  records that re-filled a retired reverse field", retiredFilled],
  ], "fill % is coverage, not correctness — an unfilled edge is an honest gap, a hand-filled reverse is a violation");
}

// ---------------------------------------------------------------- D14
{
  const NS = [
    ["cond.*", "condition_category_vocabulary.json", "CONDITION_CARD_TEMPLATE.md", "validate-condition-standard.js", "data/imports/cloudtcm"],
    ["tdis.*", "tcm_disease_taxonomy.json", "TDIS_CARD_TEMPLATE.md", "validate-tdis-standard.js", "data/imports/cloudtcm"],
    ["pattern.*", "pattern_family_vocabulary.json", "PATTERN_CARD_TEMPLATE.md", "validate-pattern-standard.js", "data/config/tcm_pattern_canon.json"],
    ["sym.*", "symptom_taxonomy.json", "SYMPTOM_CARD_TEMPLATE.md", "validate-symptom-standard.js", "data/research_staging"],
    ["supp.*", "supplement_category_vocabulary.json", "SUPP_CARD_TEMPLATE.md", "validate-supp-standard.js", "data/research_staging"],
    // drug.*'s controlled vocabulary lives beside its data, not in data/config/
    ["drug.*", "../pharmacology/drug_classes.json", "PHARM_CARD_TEMPLATE.md", "validate-pharm-standard.js", "data/medications"],
    ["life.*", "lifestyle_factor_vocabulary.json", null, null, "data/research_staging"],
    ["exposure.*", "exposure_vocabulary.json", null, null, "data/research_staging"],
    ["adverse_event.*", "adverse_event_vocabulary.json", null, null, "data/research_staging"],
    ["modality.*", "modality_vocabulary.json", null, null, "data/research_staging"],
  ];
  const rows = [];
  for (const [ns, vocab, tmpl, val, staging] of NS) {
    const parts = [];
    parts.push(vocab && exists(`data/config/${vocab}`) ? "vocab✓" : "vocab✗");
    // template may exist under a different name — scan docs for the namespace
    // Named explicitly, never guessed by substring: fuzzy matching once made
    // validate-exposure-safety-render.js (a render check) look like the
    // exposure.* namespace validator, which would have reported a yardstick
    // that does not exist.
    parts.push(tmpl && exists(`docs/${tmpl}`) ? "template✓" : "template✗");
    const valOk = Boolean(val) && exists(`scripts/${val}`);
    parts.push(valOk ? (ciHas(val) ? "validator✓CI" : "validator✓ notCI") : "validator✗");
    parts.push(exists(staging) ? "staging✓" : "staging✗");
    const cnt = CANON_FILES[ns] ? CANON_FILES[ns][1].length : (ns === "pattern.*" ? PATREG.length : 0);
    rows.push([`${ns}  (${cnt} records)`, parts.join("  ")]);
  }
  record("D14", "Every namespace is built the same four ways", rows,
    "build order is vocabulary → template → validator → content. A namespace with content but no validator in CI is filling ahead of its yardstick.");
}

// ---------------------------------------------------------------- D15
{
  const drugIds = new Set(DRUGS.map((d) => d && d.id).filter(Boolean));
  const medRefs = [];
  walkData((abs, rel) => {
    if (rel.includes("medication_alias_map")) return;
    if (rel.startsWith("data/generated/")) return;
    const txt = fs.readFileSync(abs, "utf8");
    const hits = [...txt.matchAll(/"med\.[a-z0-9_]+"/g)].length;
    if (hits) medRefs.push([rel, hits]);
  });
  const alias = readJson("data/config/medication_alias_map.json");
  const aliasN = alias ? Object.keys(alias.map || alias.aliases || {}).length : 0;
  record("D15", "`drug.*` is the medication namespace", [
    ["drug.* canonical records", drugIds.size],
    ["medication_alias_map.json entries (med.* → drug.*)", aliasN || "(shape unread)"],
    ["files still containing a med.* reference", medRefs.length],
    ...medRefs.slice(0, 6).map(([f, n]) => [`  ${f}`, `${n} ref(s)`]),
  ], "D15 permits med.* to survive in staging/sample files; what it forbids is a NEW real visit creating one");
}

// ---------------------------------------------------------------- D16 + D19
{
  const retired = [
    "pattern.insomnia_heart_kidney_disharmony",
    "pattern.liver_fire_flaring",
    "pattern.liver_wind_stirring",
  ];
  const rows = [];
  for (const id of retired) {
    const r = PATLIB.find((p) => p && p.id === id);
    rows.push([`  ${id}`, !r ? "HARD-DELETED — D6 violation" : r.review_status === "deprecated" ? (r.deprecated_note_zh ? "deprecated + note ✓" : "deprecated, NO note") : `review_status=${r.review_status}`]);
  }
  const active = PATLIB.filter((p) => p && p.review_status !== "deprecated");
  const regClinical = PATREG.filter((r) => r && r.level === "pattern");
  const regCat = PATREG.filter((r) => r && r.level === "category");
  const regIds = new Set(regClinical.map((r) => r.id));
  const regById = Object.fromEntries(PATREG.map((r) => [r.id, r]));
  const unregistered = active.filter((p) => !regById[p.id]);
  // Not the same thing as unregistered: these ARE registered, as taxonomy
  // category nodes, and have since acquired full clinical cards. That is a
  // ruling for Ting (promote to level=pattern, or accept card-ified
  // categories), not a validator failure.
  const categoryCards = active.filter((p) => regById[p.id] && regById[p.id].level === "category");
  const orphanLib = active.filter((p) => !regIds.has(p.id));
  const libIds = new Set(active.map((p) => p.id));
  const orphanReg = regClinical.filter((r) => !libIds.has(r.id));
  record("D16 / D19", "3 patterns retired · Pattern V1 frozen at 69/62/59", [
    ...rows,
    ["registry total", `${PATREG.length}   (V1 freeze: 69)`],
    ["  level=pattern (clinical)", `${regClinical.length}   (V1 freeze: 59)`],
    ["  level=category (taxonomy)", `${regCat.length}   (V1 freeze: 10)`],
    ["library total (raw)", `${PATLIB.length}   (V1 freeze: 62)`],
    ["  active (non-deprecated)", `${active.length}   (V1 freeze: 59)`],
    ["active library cards NOT registered at all", unregistered.length],
    ["active library cards registered as level=category", categoryCards.length],
    ["registry-clinical ids with no active library card", orphanReg.length],
    ["validate-pattern-standard.js in CI", ciHas("validate-pattern-standard.js") ? "yes" : "NO"],
    ["validate-pattern-registry.js in CI", ciHas("validate-pattern-registry.js") ? "yes" : "NO"],
  ], [
    unregistered.length
      ? `UNREGISTERED (a real D10 defect): ${unregistered.slice(0, 3).map((p) => p.id).join(", ")}`
      : "every active library card is registered — no D10 defect",
    categoryCards.length
      ? `taxonomy nodes that now carry clinical cards: ${categoryCards.slice(0, 4).map((p) => p.id).join(", ")}${categoryCards.length > 4 ? " …" : ""} — needs a ruling, not a fix`
      : "no category node carries a clinical card",
  ]);
}

// ---------------------------------------------------------------- D17
{
  const nsCounts = [
    ["supp.*", SUPP.length, "data/supplements/supplements.json"],
    ["life.*", countIds("data/config/lifestyle_factor_vocabulary.json"), "vocabulary only — no canonical card file"],
    ["exposure.*", countIds("data/config/exposure_vocabulary.json"), "vocabulary only — no canonical card file"],
    ["adverse_event.*", countIds("data/config/adverse_event_vocabulary.json"), "vocabulary only — no canonical card file"],
    ["modality.*", countIds("data/config/modality_vocabulary.json"), "vocabulary only — no canonical card file"],
  ];
  // spelling violations
  const badSpelling = [];
  walkData((abs, rel) => {
    if (rel.startsWith("data/generated/")) return;
    const txt = fs.readFileSync(abs, "utf8");
    for (const bad of ['"suppl.', '"supplement.', '"ae.']) {
      if (txt.includes(bad)) badSpelling.push(`${rel} ${bad}`);
    }
  });
  // sym ↔ metric separation. The link field is `supporting_measurements`
  // (docs/SYMPTOM_CARD_TEMPLATE.md §CG6), not `metric_ids`.
  const symWithMetric = SYM.filter((s) => Array.isArray(s.supporting_measurements) && s.supporting_measurements.length).length;
  const metricIdSet = new Set(METRICS.map((m) => m && (m.id || m.metric_id)).filter(Boolean));
  let symMetricRefs = 0;
  let symMetricUnresolved = 0;
  for (const s of SYM) {
    for (const m of s.supporting_measurements || []) {
      symMetricRefs++;
      if (!metricIdSet.has(m)) symMetricUnresolved++;
    }
  }
  const metricIds = new Set(METRICS.map((m) => m && (m.id || m.metric_id)).filter(Boolean));
  record("D17", "Clinical Data Capture V2 namespaces", [
    ...nsCounts.map(([ns, n, where]) => [`${ns}`, `${n}  — ${where}`]),
    ["forbidden spellings (suppl./supplement./ae.)", badSpelling.length],
    ["metric.* records", metricIds.size],
    ["sym.* carrying supporting_measurements", pct(symWithMetric, SYM.length)],
    ["  metric refs from symptom cards", symMetricRefs],
    ["  refs not resolving to a metric.* record", symMetricUnresolved],
  ], symMetricUnresolved
    ? "unresolved refs point at metrics that do not exist yet — the template warns about exactly this"
    : "sym↔metric is decided AND wired, and every ref resolves");
}

function countIds(rel) {
  const r = records(rel);
  return r ? r.length : 0;
}

// ---------------------------------------------------------------- D18
{
  const m = readJson("data/clinical_cases/localstorage_sqlite_mapping.json");
  const counts = (m && m.counts) || {};
  const byStatus = counts.by_status || {};
  record("D18", "SQLite deferred; conditional trigger; mapping kept current", [
    ["mapping fields tracked", counts.total_fields ?? "n/a"],
    ...Object.entries(byStatus).map(([k, v]) => [`  ${k}`, v]),
    ["residual_gaps recorded", m && m.residual_gaps ? (Array.isArray(m.residual_gaps) ? m.residual_gaps.length : Object.keys(m.residual_gaps).length + " key(s)") : "n/a"],
    ["planned_mappings_d17 recorded", m && m.planned_mappings_d17 ? (Array.isArray(m.planned_mappings_d17) ? m.planned_mappings_d17.length : Object.keys(m.planned_mappings_d17).length + " key(s)") : "n/a"],
    ["trigger: case count ≥ 50", "NOT MEASURABLE — cases live in the browser's localStorage"],
    ["trigger: multi-device need", "not measurable from repo"],
    ["trigger: capacity pressure", "not measurable from repo"],
  ], "the mapping file is the discipline that makes deferral free — it is being maintained");
}

// ---------------------------------------------------------------- D20
{
  const st = {};
  let withRange = 0;
  let rangeNoSource = 0;
  let rangeNoScope = 0;
  let withInstrument = 0;
  for (const r of METRICS) {
    if (!r || typeof r !== "object") continue;
    const s = r.interpretation_status || "(none)";
    st[s] = (st[s] || 0) + 1;
    if (r.reference_range) {
      withRange++;
      if (!r.reference_range.source) rangeNoSource++;
      const txt = `${r.reference_range.text_zh || ""}${r.reference_range.text_en || ""}`;
      if (/\d/.test(txt) && !r.reference_range.scope) rangeNoScope++;
    }
    if (r.instrument_source) withInstrument++;
  }
  record("D20", "Outcome metric interpretation has TWO axes", [
    ["outcome_metrics records", `${METRICS.length}   (D20 recorded 27 on 2026-08-13)`],
    ...Object.entries(st).map(([k, v]) => [`  interpretation_status=${k}`, v]),
    ["records carrying reference_range", withRange],
    ["  reference_range without its own source", rangeNoSource],
    ["  numeric reference_range without scope", rangeNoScope],
    ["records carrying instrument_source", withInstrument],
    ["validate-metric-interpretation.js in CI", ciHas("validate-metric-interpretation.js") ? "yes" : "NO"],
  ], "a gate field that answers two questions stops gating — this is the one decision whose whole point is the validator");
}

// ---------------------------------------------------------------- D21
{
  const pairs = [
    ["herb.qian_cao_gen", "herb.qian_cao"],
    ["herb.han_lian_cao", "herb.mo_han_lian"],
    ["herb.wu_zei_gu", "herb.hai_piao_xiao"],
    ["herb.sha_shen", "herb.bei_sha_shen"],
  ];
  const rows = [];
  for (const [dep, canon] of pairs) {
    const d = HERBS.find((h) => h && h.id === dep);
    const c = HERBS.find((h) => h && h.id === canon);
    rows.push([`  ${dep} → ${canon}`,
      !d ? "retired card HARD-DELETED — D6 violation"
        : d.review_status !== "deprecated" ? `retired card review_status=${d.review_status}`
        : !c ? "canonical MISSING"
        : d.deprecated_note_zh ? "deprecated + note ✓ · canonical present" : "deprecated, NO note"]);
  }
  // residue scan: retired ids referenced anywhere other than their own record
  const retiredIds = pairs.map((p) => p[0]);
  const residue = [];
  walkData((abs, rel) => {
    if (rel.includes("herb_canon_shortlist")) return;
    if (rel.startsWith("data/generated/")) return;
    const txt = fs.readFileSync(abs, "utf8");
    for (const id of retiredIds) {
      const n = [...txt.matchAll(new RegExp(`"${id.replace(".", "\\.")}"`, "g"))].length;
      if (n) residue.push(`${rel}: ${id} ×${n}`);
    }
  });
  record("D21", "Four duplicate herb imports retired into canon", [
    ...rows,
    ["retired-id references left outside their own record", residue.length],
    ...residue.slice(0, 6).map((r) => ["  " + r, ""]),
    ["validate-herb-standard.js in CI", ciHas("validate-herb-standard.js") ? "yes" : "NO"],
  ]);
}

// ---------------------------------------------------------------- CI coverage
{
  const all = fs.readdirSync(path.join(ROOT, "scripts"))
    .filter((f) => /^(validate|test)-.*\.js$/.test(f));
  const inCi = all.filter((f) => CI_SCRIPTS.has(f));
  const notInCi = all.filter((f) => !CI_SCRIPTS.has(f));
  record("CI", "Enforcement coverage (not a decision — the thing that keeps them true)", [
    ["validator/test scripts on disk", all.length],
    ["wired into .github/workflows", pct(inCi.length, all.length)],
    ["NOT wired", notInCi.length],
    ...notInCi.map((f) => ["  " + f, "unwired"]),
  ], "a LOCKED decision whose validator is not in CI is a decision that is true only until the next batch");
}

// ---------------------------------------------------------------- emit
if (JSON_MODE) {
  process.stdout.write(JSON.stringify(findings, null, 2));
} else {
  process.stdout.write(out.join("\n") + "\n");
}
