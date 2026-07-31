#!/usr/bin/env node
/**
 * scripts/normalize-formula-category.js — formula category normalization & enforcement.
 *
 *   node scripts/normalize-formula-category.js          # dry run
 *   node scripts/normalize-formula-category.js --apply  # write
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const FILE = path.join(ROOT, "data/herbs/formulas.json");

const CANONICAL_CATEGORIES = [
  "解表劑 / Release Exterior",
  "清熱劑 / Clear Heat",
  "瀉下劑 / Drain Downward",
  "和解劑 / Harmonize",
  "溫裡劑 / Warm Interior",
  "補益劑 / Tonify",
  "理氣劑 / Regulate Qi",
  "理血劑 / Regulate Blood",
  "固澀劑 / Stabilize and Bind",
  "安神劑 / Calm Spirit",
  "開竅劑 / Open Orifices",
  "祛濕劑 / Dispel Dampness",
  "祛痰劑 / Transform Phlegm",
  "治風劑 / Expel Wind",
  "治燥劑 / Treat Dryness",
  "消食劑 / Reduce Food Stagnation",
  "驅蟲劑 / Expel Parasites",
  "癰瘍劑 / Treat Sores & Carbuncles"
];

const ALIASES = {
  "解表劑": "解表劑 / Release Exterior",
  "解表劑 / Release the Exterior": "解表劑 / Release Exterior",
  "清熱劑": "清熱劑 / Clear Heat",
  "清熱劑 / Clear Heat": "清熱劑 / Clear Heat",
  "瀉下劑": "瀉下劑 / Drain Downward",
  "瀉下劑 / Drain Downward": "瀉下劑 / Drain Downward",
  "和解劑": "和解劑 / Harmonize",
  "和解劑 / Harmonize": "和解劑 / Harmonize",
  "溫裡劑": "溫裡劑 / Warm Interior",
  "溫裡劑 / Warm the Interior": "溫裡劑 / Warm Interior",
  "補益劑": "補益劑 / Tonify",
  "補益劑 / Tonify": "補益劑 / Tonify",
  "理氣劑": "理氣劑 / Regulate Qi",
  "理氣劑 / Regulate Qi": "理氣劑 / Regulate Qi",
  "理血劑": "理血劑 / Regulate Blood",
  "理血劑 / Regulate Blood": "理血劑 / Regulate Blood",
  "固澀劑": "固澀劑 / Stabilize and Bind",
  "固澀劑 / Stabilize and Bind": "固澀劑 / Stabilize and Bind",
  "安神劑": "安神劑 / Calm Spirit",
  "安神劑 / Calm the Spirit": "安神劑 / Calm Spirit",
  "開竅劑": "開竅劑 / Open Orifices",
  "開竅劑 / Open the Orifices": "開竅劑 / Open Orifices",
  "祛濕劑": "祛濕劑 / Dispel Dampness",
  "祛濕劑 / Dispel Dampness": "祛濕劑 / Dispel Dampness",
  "祛痰劑": "祛痰劑 / Transform Phlegm",
  "化痰劑": "祛痰劑 / Transform Phlegm",
  "祛痰劑 / Transform Phlegm": "祛痰劑 / Transform Phlegm",
  "治風劑": "治風劑 / Expel Wind",
  "治風劑 / Expel or Extinguish Wind": "治風劑 / Expel Wind",
  "治燥劑": "治燥劑 / Treat Dryness",
  "治燥劑 / Treat Dryness": "治燥劑 / Treat Dryness",
  "消食劑": "消食劑 / Reduce Food Stagnation",
  "消食劑 / Reduce Food Stagnation": "消食劑 / Reduce Food Stagnation",
  "驅蟲劑": "驅蟲劑 / Expel Parasites",
  "驅蟲劑 / Expel Parasites": "驅蟲劑 / Expel Parasites",
  "癰瘍劑": "癰瘍劑 / Treat Sores & Carbuncles",
  "癰瘍劑 / Treat Sores & Carbuncles": "癰瘍劑 / Treat Sores & Carbuncles"
};

const CANON_SET = new Set(CANONICAL_CATEGORIES);

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);
const records = data.records || data;

let untouched = 0, rewritten = 0, unmappable = [];

for (const r of records) {
  if (r.category && CANON_SET.has(r.category)) {
    untouched++;
    continue;
  }
  if (r.category && ALIASES[r.category]) {
    console.log(`  rewrite ${r.id}: "${r.category}" -> "${ALIASES[r.category]}"`);
    if (APPLY) r.category = ALIASES[r.category];
    rewritten++;
    continue;
  }
  if (r.category) {
    unmappable.push(`${r.id}: category="${r.category}"`);
  }
}

console.log(`\nSummary: ${untouched} canonical, ${rewritten} rewritten, ${unmappable.length} unmappable.`);
if (unmappable.length) {
  console.log("Unmappable categories:");
  unmappable.forEach((u) => console.log("  " + u));
}

if (APPLY) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("\nApplied category normalization to formulas.json.");
} else {
  console.log("\nDry run completed. Run with --apply to save changes.");
}
