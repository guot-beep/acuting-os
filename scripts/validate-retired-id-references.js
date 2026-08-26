#!/usr/bin/env node
/**
 * validate-retired-id-references.js — a retired (deprecated) canonical id must
 * not be referenced by any active record.
 *
 * Why this exists (2026-08-26): D21 recorded "四個退役 id…data/** 零殘留" as
 * verified, but two herb_pairs.json rows still pointed at retired herb ids —
 * the one-shot verification had no validator behind it, so the claim decayed
 * silently. D16/D21 both retire ids via review_status="deprecated"; this gate
 * makes that state mean something: deprecation is a redirect, and a reference
 * that ignores the redirect is a defect, not a style choice.
 *
 * What counts as a violation: a string value (or array element) EXACTLY equal
 * to a retired id, found outside the retired record's own subtree. Prose that
 * merely mentions an id (deprecated_note_zh and friends) is a longer string
 * and never matches exactly, so documentation stays legal.
 *
 * Layers that legitimately keep history are skipped entirely:
 *   data/audits/**           dated snapshots — they SHOULD show the past
 *   data/generated/**        rebuilt from canon; fixed by rebuilding, not editing
 *   data/imports/**          provenance layer (D11: import handles, not canon)
 *   data/research_staging/** staging, source-tiered, never canon (D14)
 *
 * Run: node scripts/validate-retired-id-references.js
 * Exit 1 on any violation. No --fix mode on purpose: every redirect is a
 * clinical-content ruling (which canonical id replaces the retired one), and
 * those are recorded in DECISIONS.md, not guessed by a script.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SKIP_DIRS = new Set(["audits", "generated", "imports", "research_staging"]);

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (dir === path.join(ROOT, "data") && SKIP_DIRS.has(name)) continue;
      walk(p, out);
    } else if (name.endsWith(".json")) {
      out.push(p);
    }
  }
  return out;
}

const files = walk(path.join(ROOT, "data"), []);

// ---- pass 1: collect retired ids (any record with review_status "deprecated")
const retired = new Map(); // id -> file it is declared in
for (const abs of files) {
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch {
    continue; // unparseable files are validate-data's job, not ours
  }
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  (function scan(node) {
    if (Array.isArray(node)) return node.forEach(scan);
    if (!node || typeof node !== "object") return;
    if (typeof node.id === "string" && node.review_status === "deprecated") {
      retired.set(node.id, rel);
    }
    for (const v of Object.values(node)) scan(v);
  })(doc);
}

// ---- pass 2: find exact-string references outside the retired record itself
const violations = [];
for (const abs of files) {
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch {
    continue;
  }
  const rel = path.relative(ROOT, abs).replace(/\\/g, "/");
  (function scan(node, trail) {
    if (Array.isArray(node)) {
      node.forEach((v, i) => scan(v, `${trail}[${i}]`));
      return;
    }
    if (node && typeof node === "object") {
      // The retired record's own subtree may say its own id — that IS the
      // deprecation record, not a reference to it.
      if (typeof node.id === "string" && retired.has(node.id) && node.review_status === "deprecated") return;
      for (const [k, v] of Object.entries(node)) scan(v, trail ? `${trail}.${k}` : k);
      return;
    }
    if (typeof node === "string" && retired.has(node)) {
      violations.push({ file: rel, path: trail, id: node, declaredIn: retired.get(node) });
    }
  })(doc, "");
}

if (process.argv.includes("--json")) {
  // check-validation-ratchet.js consumes this shape: total defects plus a
  // per-retired-id breakdown, so a regression names which retirement decayed.
  const byCode = {};
  for (const v of violations) byCode[v.id] = (byCode[v.id] || 0) + 1;
  console.log(JSON.stringify({ defects: violations.length, by_code: byCode }));
  process.exit(0);
}

console.log(`retired (deprecated) canonical ids: ${retired.size}`);
for (const [id, file] of [...retired.entries()].sort()) console.log(`  ${id}  (${file})`);
console.log();

if (violations.length === 0) {
  console.log("PASS — 0 active references to retired ids.");
  process.exit(0);
}

console.log(`FAIL — ${violations.length} active reference(s) to retired ids:`);
for (const v of violations) {
  console.log(`  ${v.file}`);
  console.log(`    at ${v.path}`);
  console.log(`    -> ${v.id} (retired in ${v.declaredIn})`);
}
console.log();
console.log("Fix by redirecting to the canonical id named in the retired record's");
console.log("deprecated_note_zh / DECISIONS.md — never by deleting the retired record.");
process.exit(1);
