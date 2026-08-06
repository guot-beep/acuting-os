#!/usr/bin/env node
/**
 * fix-condition-pattern-mechanical.js — the L5-A mechanical batch, done as a
 * script instead of a model.
 *
 * 憲法 §E2 splits work by "can this field be plausibly fabricated". These three
 * transforms sit below even that line: they are DETERMINISTIC, so no model —
 * of any tier — should be spent (or trusted) on them:
 *
 *   C3  entity_type on conditions.  D11: the namespace IS the type, so every
 *       cond.* record gets "biomedical_condition". Zero judgment.
 *   C7  source-field fold on conditions.  exact_source_url / source_urls /
 *       source_links MOVE into the canonical `sources`, then the old fields
 *       are removed. Move first, delete second (§0 order).
 *   P9  tongue/pulse migration on patterns.  Value moves verbatim from the
 *       pre-bilingual field name into *_zh. No translation is attempted here —
 *       English twins are the Sonnet line's job, not a script's.
 *
 * Plus one repair discovered while shaping the fold, logged loudly because it
 * is a data-integrity finding, not housekeeping:
 *
 *   FABRICATED SOURCES.  All 89 existing `sources` entries follow the pattern
 *   https://cloudtcm.com/disease/cond.<record_id> — a URL template-generated
 *   from the record's own id. CloudTCM has no such pages; the real pages are
 *   numeric (/disease/tcm/1543) and live in exact_source_url on 81 records.
 *   A fabricated URL is not content, it is a defect wearing provenance's
 *   clothes — every card would render a dead link that LOOKS cited. They are
 *   removed and the removal is counted per record below; real URLs replace
 *   them where they exist.
 *
 * Re-runnable: running twice changes nothing the second time.
 *
 *   node scripts/fix-condition-pattern-mechanical.js          # dry run
 *   node scripts/fix-condition-pattern-mechanical.js --write
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CONDITIONS = "data/pathology/condition_canon_shortlist.json";
const PATTERNS = "data/pathology/pattern_library.json";
const WRITE = process.argv.includes("--write");

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const saveJson = (rel, obj) =>
  fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(obj, null, 2) + "\n", "utf8");

const FABRICATED_RE = /^https?:\/\/cloudtcm\.com\/disease\/cond\./;

const stats = {
  entity_type_added: 0,
  fabricated_sources_removed: 0,
  real_urls_folded: 0,
  source_link_objects_folded: 0,
  fields_removed: { exact_source_url: 0, source_urls: 0, source_links: 0 },
  records_left_without_sources: 0,
  tongue_migrated: 0,
  pulse_migrated: 0,
};

// ---- conditions: C3 + C7 + fabricated-source removal -----------------------
const condFile = readJson(CONDITIONS);
for (const rec of condFile.records || []) {
  // C3 — D11: namespace decides. This file holds cond.* only; assert anyway.
  if (String(rec.id || "").startsWith("cond.") && rec.entity_type !== "biomedical_condition") {
    rec.entity_type = "biomedical_condition";
    stats.entity_type_added += 1;
  }

  // C7 — build the folded sources list. Order: real exact page first, then
  // other real URLs, then rich source_link objects. Fabricated entries drop.
  const folded = [];
  const seen = new Set();
  const pushUrl = (u) => {
    if (typeof u !== "string" || !u.trim() || seen.has(u)) return;
    seen.add(u);
    folded.push(u);
  };

  if (typeof rec.exact_source_url === "string") {
    pushUrl(rec.exact_source_url);
    stats.real_urls_folded += 1;
  }
  for (const u of rec.source_urls || []) { pushUrl(u); stats.real_urls_folded += 1; }
  for (const s of rec.sources || []) {
    if (typeof s === "string" && FABRICATED_RE.test(s)) {
      stats.fabricated_sources_removed += 1;
      continue; // template-generated dead link — see header
    }
    if (typeof s === "string") pushUrl(s);
    else if (s && typeof s === "object") { folded.push(s); if (s.url) seen.add(s.url); }
  }
  for (const s of rec.source_links || []) {
    if (s && typeof s === "object" && !seen.has(s.url)) {
      folded.push(s);
      if (s.url) seen.add(s.url);
      stats.source_link_objects_folded += 1;
    }
  }

  for (const f of ["exact_source_url", "source_urls", "source_links"]) {
    if (f in rec) { delete rec[f]; stats.fields_removed[f] += 1; }
  }
  if (folded.length) rec.sources = folded;
  else { delete rec.sources; stats.records_left_without_sources += 1; }
}

// ---- patterns: P9 ----------------------------------------------------------
const patFile = readJson(PATTERNS);
for (const rec of patFile.records || []) {
  // Move first, then delete — reversing the order is how content gets lost.
  if (typeof rec.tongue === "string" && rec.tongue.trim()) {
    if (!rec.tongue_zh) rec.tongue_zh = rec.tongue;
    delete rec.tongue;
    stats.tongue_migrated += 1;
  }
  if (typeof rec.pulse === "string" && rec.pulse.trim()) {
    if (!rec.pulse_zh) rec.pulse_zh = rec.pulse;
    delete rec.pulse;
    stats.pulse_migrated += 1;
  }
}

// ---- report / write --------------------------------------------------------
console.log((WRITE ? "APPLIED" : "DRY RUN") + " — mechanical batch\n");
console.log(JSON.stringify(stats, null, 2));
console.log(`
records now without any source: ${stats.records_left_without_sources} — honest
emptiness; the fill line cites real pages per docs/CONDITION_CARD_TEMPLATE.md.`);
if (WRITE) {
  saveJson(CONDITIONS, condFile);
  saveJson(PATTERNS, patFile);
  console.log(`\nwrote ${CONDITIONS} and ${PATTERNS}`);
  console.log("now run: validate-condition-standard, validate-pattern-standard, build-data, check-validation-ratchet --update");
} else {
  console.log("\npass --write to apply.");
}
