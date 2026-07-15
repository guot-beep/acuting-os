#!/usr/bin/env node
/**
 * apply-point-categories.js — write `point_categories[]` and `five_shu_element`
 * onto data/acupoints/361.json from data/config/point_category_members.json
 * (PC2, docs/POINT_CATEGORY_TAGS_DESIGN.md).
 *
 * Adds-only: sets point_categories (sorted, deduped) and, for five-shu points,
 * five_shu_element. Never changes code/id or any existing content field; does
 * NOT change review_status (a factual tag is not a status promotion). Refuses
 * to write if any member code is missing from 361.json.
 *
 *   node scripts/apply-point-categories.js          # dry run
 *   node scripts/apply-point-categories.js --apply
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APPLY = process.argv.includes("--apply");
const DB = path.join(ROOT, "data/acupoints/361.json");

const members = JSON.parse(fs.readFileSync(path.join(ROOT, "data/config/point_category_members.json"), "utf8"));
const db = JSON.parse(fs.readFileSync(DB, "utf8"));
const byCode = new Map(db.map((p) => [p.code, p]));

// Build code -> {categories:Set, element} from membership + five_shu.
const wanted = new Map();
const ensure = (code) => { if (!wanted.has(code)) wanted.set(code, { cats: new Set(), element: null }); return wanted.get(code); };
for (const [cat, codes] of Object.entries(members.membership)) {
  for (const code of codes) ensure(code).cats.add(cat);
}
for (const [code, info] of Object.entries(members.five_shu)) {
  const w = ensure(code);
  w.cats.add(info.category);
  w.element = info.element;
}

const missing = [...wanted.keys()].filter((c) => !byCode.has(c));
if (missing.length) {
  console.error("REFUSING TO WRITE — member codes not in 361.json: " + missing.join(", "));
  process.exit(1);
}

let touched = 0;
for (const [code, w] of wanted) {
  const rec = byCode.get(code);
  const cats = [...w.cats].sort();
  const before = JSON.stringify(rec.point_categories || null) + "|" + (rec.five_shu_element || "");
  if (APPLY) {
    rec.point_categories = cats;
    if (w.element) rec.five_shu_element = w.element;
  }
  const after = JSON.stringify(cats) + "|" + (w.element || "");
  if (before !== after) touched += 1;
}

console.log(`${APPLY ? "Wrote" : "Would write"} categories on ${wanted.size} points (five_shu_element on ${Object.keys(members.five_shu).length}).`);
if (APPLY) {
  fs.writeFileSync(DB, JSON.stringify(db, null, 1) + "\n");
  console.log("Written data/acupoints/361.json. Rebuild: node scripts/build-data.js");
} else {
  console.log("Dry run. Use --apply to write.");
}
