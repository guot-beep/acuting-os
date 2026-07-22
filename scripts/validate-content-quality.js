#!/usr/bin/env node
/* Content QUALITY validator — the check this repo never had.

   Every other validator in scripts/ checks FORM: ids resolve, no duplicates,
   encoding is clean, relations point somewhere. None of them ever asked
   whether a field actually says anything. That is how 202 herbs sharing 26
   template sentences passed the whole suite, and how a coverage report based
   on "field is not empty" was able to call that layer complete.

   This checks SUBSTANCE:
     PLACEHOLDER  - 待補 / pending / verify-before-use filler text
     SHARED       - the same value copy-pasted across many records
     NOT_ZH       - a _zh / Chinese field holding no Chinese characters
     THIN         - present but too short to be useful

   Usage:
     node scripts/validate-content-quality.js            # summary
     node scripts/validate-content-quality.js --detail   # list offending records
     node scripts/validate-content-quality.js --layer herbs

   Reports, does not block. Exit 1 only with --strict. */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DETAIL = process.argv.includes("--detail");
const STRICT = process.argv.includes("--strict");
const ONLY = (process.argv.find((a) => a.startsWith("--layer=")) || "").split("=")[1]
  || (process.argv.includes("--layer") ? process.argv[process.argv.indexOf("--layer") + 1] : null);

const PLACEHOLDER = /待補|待確認|尚未|暫無|pending|to be (added|filled|verified)|\bTBD\b|draft pending|verify (against|individual|before)|depending on herb|context only|documentation context|study differentiation|not a treatment claim|review pending|placeholder/i;

const CJK = /[㐀-䶿一-鿿]/;

const LAYERS = [
  {
    id: "acupoints",
    file: "data/acupoints/361.json",
    key: "code",
    label: (r) => `${r.code} ${r.chinese || ""}`,
    fields: [
      { name: "functions_zh", zh: true, minLen: 8 },
      { name: "indications_zh", zh: true, minLen: 6 },
      { name: "functions_en", minLen: 12 },
      { name: "indications_en", minLen: 8 },
      { name: "contraindications", minLen: 8 },
      { name: "clinical_pearls", minLen: 12 },
      { name: "muscles", minLen: 3 },
      { name: "nerves", minLen: 3 }
    ]
  },
  {
    id: "herbs",
    file: "data/herbs/herb_canon_shortlist.json",
    key: "id",
    label: (r) => `${r.id} ${r.name_zh || ""}`,
    fields: [
      { name: "functions", minLen: 12 },
      { name: "properties_taste_temp", minLen: 8 },
      { name: "clinical_use_note", minLen: 20 },
      { name: "dosage", minLen: 3 },
      { name: "cautions", minLen: 8 }
    ]
  },
  {
    id: "formulas",
    file: "data/herbs/formulas.json",
    key: "id",
    label: (r) => `${r.id} ${r.name_zh || ""}`,
    fields: [
      { name: "composition", minLen: 3 },
      { name: "actions_zh", zh: true, minLen: 6 },
      { name: "indications_zh", zh: true, minLen: 6 },
      { name: "fang_yi_zh", zh: true, minLen: 10 }
    ]
  },
  {
    id: "conditions",
    file: "data/pathology/condition_canon_shortlist.json",
    key: "id",
    label: (r) => `${r.id} ${r.name_zh || ""}`,
    fields: [
      { name: "summary_zh", zh: true, minLen: 20 },
      { name: "red_flags_zh", zh: true, minLen: 8 },
      { name: "western_context_zh", zh: true, minLen: 20 }
    ]
  }
];

/* Wrapper files hold several arrays (formulas.json has starter_categories[8]
   AND records[115]). Picking the first array found silently measured the wrong
   one — exactly the class of bug this validator exists to catch. Prefer the
   known record keys, then fall back to the LONGEST array. */
const RECORD_KEYS = ["records", "herbs", "formulas", "points", "conditions", "entries", "items"];

function loadArray(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return null;
  const raw = JSON.parse(fs.readFileSync(full, "utf8"));
  if (Array.isArray(raw)) return raw;
  for (const key of RECORD_KEYS) if (Array.isArray(raw[key])) return raw[key];
  const arrays = Object.values(raw).filter(Array.isArray);
  if (!arrays.length) return null;
  return arrays.sort((a, b) => b.length - a.length)[0];
}

const flatten = (v) => (Array.isArray(v) ? v.join(" ") : v == null ? "" : String(v));

let anyFail = false;
const grand = { fields: 0, good: 0 };

for (const layer of LAYERS) {
  if (ONLY && ONLY !== layer.id) continue;
  const records = loadArray(layer.file);
  if (!records) { console.log(`\n${layer.id}: file not found (${layer.file}) — skipped`); continue; }

  console.log(`\n=== ${layer.id} — ${records.length} records — ${layer.file} ===`);
  console.log(
    "field".padEnd(24) + "empty".padStart(7) + "filler".padStart(8) +
    "shared".padStart(8) + "notZh".padStart(7) + "thin".padStart(6) + "GOOD".padStart(8) + "  quality"
  );

  for (const spec of layer.fields) {
    const counts = { empty: 0, filler: 0, shared: 0, notZh: 0, thin: 0, good: 0 };
    const offenders = { filler: [], shared: [], notZh: [], thin: [] };

    /* how many records share each exact value */
    const freq = new Map();
    for (const r of records) {
      const v = JSON.stringify(r[spec.name] ?? "");
      if (v === '""' || v === "[]" || v === "null") continue;
      freq.set(v, (freq.get(v) || 0) + 1);
    }

    for (const r of records) {
      const raw = r[spec.name];
      const text = flatten(raw).trim();
      if (!text) { counts.empty += 1; continue; }

      const key = JSON.stringify(raw ?? "");
      if (PLACEHOLDER.test(text)) {
        counts.filler += 1; offenders.filler.push(layer.label(r)); continue;
      }
      if ((freq.get(key) || 0) > 1) {
        counts.shared += 1; offenders.shared.push(`${layer.label(r)} (x${freq.get(key)})`); continue;
      }
      if (spec.zh && !CJK.test(text)) {
        counts.notZh += 1; offenders.notZh.push(layer.label(r)); continue;
      }
      if (text.length < (spec.minLen || 0)) {
        counts.thin += 1; offenders.thin.push(`${layer.label(r)} "${text.slice(0, 24)}"`); continue;
      }
      counts.good += 1;
    }

    const pct = Math.round((counts.good / records.length) * 100);
    grand.fields += records.length;
    grand.good += counts.good;
    if (pct < 50) anyFail = true;

    console.log(
      spec.name.padEnd(24) +
      String(counts.empty).padStart(7) + String(counts.filler).padStart(8) +
      String(counts.shared).padStart(8) + String(counts.notZh).padStart(7) +
      String(counts.thin).padStart(6) + String(counts.good).padStart(8) +
      `  ${pct}%${pct < 50 ? "  <-- " : ""}`
    );

    if (DETAIL) {
      for (const kind of ["filler", "shared", "notZh", "thin"]) {
        if (!offenders[kind].length) continue;
        console.log(`    ${kind} (${offenders[kind].length}): ${offenders[kind].slice(0, 6).join(", ")}${offenders[kind].length > 6 ? " …" : ""}`);
      }
    }
  }
}

console.log(`\n=== overall ===`);
console.log(`field-instances checked : ${grand.fields}`);
console.log(`substantive             : ${grand.good}  (${Math.round(grand.good / grand.fields * 100)}%)`);
console.log(`\nempty  = nothing there            filler = 待補/pending/verify-later text`);
console.log(`shared = same value as other records (template, not content)`);
console.log(`notZh  = Chinese field with no Chinese   thin = present but too short\n`);

if (STRICT && anyFail) process.exit(1);
