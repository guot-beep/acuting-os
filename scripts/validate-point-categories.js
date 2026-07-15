#!/usr/bin/env node
/**
 * validate-point-categories.js — enforce the 特定穴 tags (PC3,
 * docs/POINT_CATEGORY_TAGS_DESIGN.md).
 *
 * Checks against data/config/point_category_vocabulary.json (labels + expected
 * counts) and data/config/point_category_members.json (canonical membership):
 *  1. every id in a point's point_categories[] exists in the vocabulary;
 *  2. per-category tagged count == the vocabulary's expected_count;
 *  3. members-file membership matches what is tagged on 361.json (no drift);
 *  4. five_shu_element is present iff the point is a five-shu point, is a valid
 *     element, and matches the members file (encodes 五行 correctly);
 *  5. every member code exists in 361.json.
 *
 * Usage: node scripts/validate-point-categories.js
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const rd = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const vocab = rd("data/config/point_category_vocabulary.json");
const members = rd("data/config/point_category_members.json");
const db = rd("data/acupoints/361.json");
const byCode = new Map(db.map((p) => [p.code, p]));

let failures = 0;
const fail = (m) => { failures++; console.error("FAIL: " + m); };

const vocabIds = new Set(vocab.categories.map((c) => c.id));
const expected = new Map(vocab.categories.map((c) => [c.id, c.expected_count]));
const VALID_ELEMENTS = new Set(["wood", "fire", "earth", "metal", "water"]);

// Build the canonical code -> {cats, element} from the members file.
const canonical = new Map();
const ensure = (code) => { if (!canonical.has(code)) canonical.set(code, { cats: new Set(), element: null }); return canonical.get(code); };
for (const [cat, codes] of Object.entries(members.membership)) {
  if (!vocabIds.has(cat)) fail(`members membership uses unknown category "${cat}"`);
  for (const code of codes) ensure(code).cats.add(cat);
}
for (const [code, info] of Object.entries(members.five_shu)) {
  if (!vocabIds.has(info.category)) fail(`members five_shu uses unknown category "${info.category}"`);
  const w = ensure(code); w.cats.add(info.category); w.element = info.element;
}

// 5. every member code exists in 361.json
for (const code of canonical.keys()) {
  if (!byCode.has(code)) fail(`member code "${code}" not in 361.json`);
}

// 1 + 4 + 3: per-point checks
const taggedCounts = {};
for (const p of db) {
  const cats = p.point_categories || [];
  for (const id of cats) {
    if (!vocabIds.has(id)) fail(`${p.code}: point_categories has unknown id "${id}"`);
    taggedCounts[id] = (taggedCounts[id] || 0) + 1;
  }
  const canon = canonical.get(p.code);
  // drift check: what's tagged must equal canonical membership
  const tagged = new Set(cats);
  const shouldHave = canon ? canon.cats : new Set();
  for (const id of shouldHave) if (!tagged.has(id)) fail(`${p.code}: missing category "${id}" (in members, not on point)`);
  for (const id of tagged) if (!shouldHave.has(id)) fail(`${p.code}: extra category "${id}" (on point, not in members)`);
  // five_shu_element
  const isFiveShu = canon && [...shouldHave].some((c) => c.startsWith("five_shu."));
  if (isFiveShu) {
    if (!p.five_shu_element) fail(`${p.code}: five-shu point missing five_shu_element`);
    else if (!VALID_ELEMENTS.has(p.five_shu_element)) fail(`${p.code}: invalid five_shu_element "${p.five_shu_element}"`);
    else if (canon.element && p.five_shu_element !== canon.element) fail(`${p.code}: five_shu_element "${p.five_shu_element}" != members "${canon.element}"`);
  } else if (p.five_shu_element) {
    fail(`${p.code}: has five_shu_element but is not a five-shu point`);
  }
}

// 2: per-category expected counts
for (const [id, exp] of expected) {
  const got = taggedCounts[id] || 0;
  if (got !== exp) fail(`category "${id}" tagged on ${got} points, expected ${exp}`);
}

if (failures) { console.error(`\n${failures} failure(s).`); process.exit(1); }
const totalTagged = new Set([...canonical.keys()]).size;
console.log(`Point category validation passed. ${totalTagged} distinct points tagged; five_shu_element on ${Object.keys(members.five_shu).length}.`);
