#!/usr/bin/env node
/* Verify every ICD-10-CM code in the condition crosswalk against the official
   NLM Clinical Tables API, and fill each code's official English label.

   Source: https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search — the US
   National Library of Medicine's authoritative ICD-10-CM table (the resource
   Ting pointed to). Reachable, structured JSON, no scraping.

   Does two things at once:
     - fills crosswalk icd10[].label_en with the official name
     - flags any code that the authority does NOT recognise (bad/outdated code)

   Usage:
     node scripts/fill-icd-labels.js            # dry run, report only
     node scripts/fill-icd-labels.js --apply    # write labels into the crosswalk
*/

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const CW = path.join(ROOT, "data/interop/condition_crosswalk.json");

const API = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Returns { name, matched_code, kind } or null.
   kind: "exact"    — the code is a billable leaf, name is its own
         "category" — our code is a 3-char/header; name taken from the nearest
                      child, with the shared category wording. Surfaces that the
                      code needs more specificity for billing.
   Range codes (F32-F33) and dual codes (F45.8/J31.2) are returned null with a
   reason so they land on the review list rather than being silently guessed. */
async function lookup(code) {
  if (/[\/]/.test(code)) return { skip: "dual-coded (slash)" };
  if (/-/.test(code) && !/^[A-Z]\d/.test(code.replace(/-.*/, "")) === false && code.includes("-") && code.split("-").length === 2 && code.split("-")[1].length <= 4 && /[A-Z]/.test(code.split("-")[1])) {
    return { skip: "code range" };
  }
  const url = `${API}?sf=code&terms=${encodeURIComponent(code)}&maxList=50`;
  const res = await fetch(url, { headers: { "User-Agent": "AcuTingOS/1.0 (private study app)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${code}`);
  const [, , , rows] = await res.json();
  if (!rows || !rows.length) return null;
  const exact = rows.find((r) => r[0].toUpperCase() === code.toUpperCase());
  if (exact) return { name: exact[1], matched_code: exact[0], kind: "exact" };
  // nearest child: shortest code that starts with ours
  const children = rows.filter((r) => r[0].toUpperCase().startsWith(code.toUpperCase()));
  if (!children.length) return null;
  children.sort((a, b) => a[0].length - b[0].length);
  // category name = the child name up to the first comma/parenthesis (the lead diagnosis)
  const lead = children[0][1].split(/[,(]/)[0].trim();
  return { name: lead, matched_code: children[0][0], kind: "category" };
}

(async () => {
  const doc = JSON.parse(fs.readFileSync(CW, "utf8"));
  const rows = Array.isArray(doc) ? doc : (doc.records || Object.values(doc).find(Array.isArray));

  // collect every distinct code across the crosswalk
  const codes = new Set();
  for (const r of rows) for (const e of r.icd10 || []) if (e.code) codes.add(e.code.trim());
  console.log(`${codes.size} distinct ICD-10-CM codes to verify against NLM\n`);

  const resolved = new Map();   // code -> {name, kind}
  const review = [];
  let exact = 0, category = 0;
  let i = 0;
  for (const code of codes) {
    i += 1;
    try {
      const r = await lookup(code);
      if (r && r.name) {
        resolved.set(code, r);
        if (r.kind === "exact") exact += 1; else category += 1;
      } else {
        review.push(`${code} (${r && r.skip ? r.skip : "not in NLM"})`);
      }
    } catch (err) {
      review.push(`${code} (${err.message})`);
    }
    await sleep(120);
  }

  console.log(`\nexact billable: ${exact}   category header: ${category}   need review: ${review.length}`);
  if (review.length) console.log("\n  NEEDS TING REVIEW (range / dual / needs more specific code):\n   " + review.join("\n   "));

  let filled = 0, flaggedCategory = 0;
  for (const r of rows) {
    for (const e of r.icd10 || []) {
      const hit = resolved.get((e.code || "").trim());
      if (!hit) continue;
      if (e.label_en !== hit.name) { e.label_en = hit.name; e.label_source = "nlm_icd10cm"; filled += 1; }
      if (hit.kind === "category") { e.code_specificity = "category_needs_leaf"; e.nearest_billable = hit.matched_code; flaggedCategory += 1; }
    }
  }
  console.log(`\nlabels to fill: ${filled}   flagged as category-level (need a billable leaf): ${flaggedCategory}`);

  if (!APPLY) { console.log("\ndry run — re-run with --apply to write.\n"); return; }
  fs.writeFileSync(CW, JSON.stringify(doc, null, 2) + "\n", "utf8");
  console.log(`wrote ${path.relative(ROOT, CW).replace(/\\/g, "/")}\n`);
})();
