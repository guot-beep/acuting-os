#!/usr/bin/env node
/* Report how well the condition canon covers a board exam blueprint.

   Usage: node scripts/report-exam-coverage.js [blueprint_id]

   Why this exists: the condition canon was built bottom-up from Ting's
   interests, and the board's Appendix A is the authoritative scope. This
   measures one against the other so "what should I add next" is a number
   rather than a guess. Read-only — writes nothing.

   Matching is deliberately loose (token overlap on English names plus a
   synonym table), because blueprint labels are prose like "Blood pressure
   disorders (e.g., hypertension, hypotension)". Loose matching over-reports
   coverage rather than under-reports it, so treat MISSING as reliable and
   COVERED as "probably, check it". */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const blueprintId = process.argv[2] || "ncbahm_bio_2026";

const blueprint = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "exams", `${blueprintId}.json`), "utf8")
);
const canonRaw = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "pathology", "condition_canon_shortlist.json"), "utf8")
);
const canon = Array.isArray(canonRaw) ? canonRaw : Object.values(canonRaw).find(Array.isArray);

const STOP = new Set(["and", "or", "of", "the", "with", "eg", "disorders", "disorder",
  "conditions", "condition", "affecting", "other", "including", "diseases", "disease"]);

const tokens = (s) => String(s || "")
  .toLowerCase()
  .replace(/\(.*?\)/g, " ")
  .split(/[^a-z0-9]+/)
  .filter((t) => t.length > 3 && !STOP.has(t));

/* blueprint prose often names examples in parentheses; those are strong signals */
const parenTokens = (s) => {
  const m = String(s || "").match(/\((?:e\.g\.,?)?([^)]*)\)/i);
  return m ? m[1].toLowerCase().split(/[,;]/).map((x) => x.trim()).filter(Boolean) : [];
};

const canonIndex = canon.map((r) => ({
  id: r.id,
  name_en: r.name_en || "",
  name_zh: r.name_zh || "",
  category: r.category || "",
  filled: Boolean(r.summary_zh && String(r.summary_zh).trim()),
  blob: `${r.name_en || ""} ${r.name_zh || ""} ${r.id || ""}`.toLowerCase(),
  tokens: new Set(tokens(r.name_en))
}));

function findMatch(label) {
  const want = tokens(label);
  const examples = parenTokens(label);
  let best = null;

  for (const rec of canonIndex) {
    if (examples.some((ex) => ex.length > 3 && rec.blob.includes(ex))) return { rec, how: "example" };
    const hit = want.filter((t) => rec.tokens.has(t)).length;
    if (hit && (!best || hit > best.hit)) best = { rec, hit, how: "tokens" };
  }
  return best && best.hit >= Math.min(2, tokens(label).length) ? best : null;
}

let total = 0;
let covered = 0;
let coveredFilled = 0;
const gaps = [];

console.log(`\n=== ${blueprint.board} ${blueprint.module} blueprint coverage ===`);
console.log(`blueprint: ${blueprint.blueprint_id}  effective ${blueprint.effective_date}`);
console.log(`canon: ${canon.length} conditions, ${canonIndex.filter((r) => r.filled).length} with content\n`);

for (const cat of blueprint.condition_categories) {
  const rows = [];
  for (const cond of cat.conditions) {
    total += 1;
    const match = findMatch(cond.label_en);
    if (match) {
      covered += 1;
      if (match.rec.filled) coveredFilled += 1;
      rows.push(`    ok   ${cond.label_en.slice(0, 58).padEnd(60)} -> ${match.rec.id}${match.rec.filled ? "" : "  (skeleton)"}`);
    } else {
      gaps.push({ category: cat.category, label: cond.label_en });
      rows.push(`    MISS ${cond.label_en.slice(0, 58)}`);
    }
  }
  const catCovered = rows.filter((r) => r.includes(" ok ")).length;
  console.log(`${cat.category}  ${catCovered}/${cat.conditions.length}`);
  if (process.argv.includes("--verbose")) rows.forEach((r) => console.log(r));
}

console.log(`\n--- summary ---`);
console.log(`blueprint conditions      : ${total}`);
console.log(`matched in canon          : ${covered}  (${Math.round(covered / total * 100)}%)`);
console.log(`matched AND has content   : ${coveredFilled}  (${Math.round(coveredFilled / total * 100)}%)`);
console.log(`not represented at all    : ${gaps.length}`);

if (gaps.length) {
  console.log(`\n--- gaps by category ---`);
  const byCat = {};
  gaps.forEach((g) => (byCat[g.category] = byCat[g.category] || []).push(g.label));
  Object.entries(byCat)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([cat, list]) => {
      console.log(`\n  ${cat} (${list.length})`);
      list.forEach((l) => console.log(`    - ${l}`));
    });
}
console.log("");
