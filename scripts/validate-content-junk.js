#!/usr/bin/env node
/**
 * validate-content-junk.js — QA wall check (Codex runs this on every batch).
 *
 * Three independent checks, all read-only:
 *
 * 1. JUNK_TOKENS (blocking) — a scraped page-structure header token (see
 *    scripts/lib/content-junk-tokens.js) leaking out of CloudTCM page
 *    structure into a herb's functions list as a standalone array element —
 *    e.g. "其他功效" / "藥理作用".
 *    Fix: node scripts/clean-content-junk.js --apply
 *
 * 2. ENCODING ANOMALY (blocking) — a U+FFFD replacement character or a
 *    Cyrillic-block character (U+0400–U+04FF) sitting inside a `_zh`
 *    field (or nested under one, e.g. `modern_functions_detail_zh[].analysis_zh`).
 *    Both are unambiguous encoding damage in this corpus: U+FFFD only ever
 *    means a byte sequence failed to decode, and Cyrillic has zero legitimate
 *    use in Traditional Chinese medical prose — real occurrences found here
 *    were homoglyph mojibake (e.g. Cyrillic "ф" U+0444 dropped in for Greek
 *    "φ" U+03C6 in "巨噬細胞（Mф）" — should read "Mφ", the standard
 *    macrophage abbreviation).
 *
 *    Greek-block characters (U+0370–U+03FF) are deliberately NOT flagged.
 *    They are extensively and legitimately used in this corpus for
 *    scientific/pharmacological notation (TNF-α, IL-1β, γ-胺基丁酸/GABA,
 *    α-葡萄糖苷酶, β受體, μL …) — verified 490+ real instances across
 *    data/herbs/*.json alone. Every adjacency heuristic tried (Latin/digit
 *    within a character window, Latin/digit anywhere in the same string)
 *    still produced dozens of false positives against confirmed-legitimate
 *    sentences and caught zero additional real defects beyond the Cyrillic
 *    case above. A Greek-letter check would be pure noise; see
 *    docs/research_packs/AUDIT_DATA_FIXES_LEDGER.md for the worked examples.
 *    If a future homoglyph incident specifically confuses Greek letters
 *    (not Cyrillic), it needs a different signal than presence/context —
 *    flag it by hand and add a token/pattern here, don't reach for "all Greek".
 *
 * 3. SHARED VERBATIM DOSAGE (warn-only, does not fail the build) — the same
 *    vendor dosage-range sentence (e.g. "6.0g～12.0g，分次開水送服。")
 *    appearing byte-identical across ≥10 formula records. One vendor's
 *    generic reference dose copy-pasted onto many formulas reads as
 *    "this formula has a sourced dosage" when it is really a single
 *    boilerplate string wearing 58 different formula names — the
 *    constitution's red line 6 (no boilerplate sentences) / red line 4
 *    (dosage needs a named per-record source) gray zone. Reported, not
 *    blocked: the fix is a real per-formula sourcing pass, not something
 *    to reject-and-lose in CI. See docs/research_packs/AUDIT_DATA_FIXES_LEDGER.md
 *    for the current 58-id list.
 *
 * Read-only. To fix junk tokens: node scripts/clean-content-junk.js --apply
 */
const fs = require("fs");
const path = require("path");
const { JUNK_TOKENS, CONTENT_FILES } = require("./lib/content-junk-tokens.js");

const ROOT = path.join(__dirname, "..");

const junkFindings = [];
const encodingFindings = [];
const dosageGroups = new Map(); // dosageClause -> [{file, id}]

const FFFD = "�";
function hasCyrillic(str) {
  for (const ch of str) {
    const c = ch.codePointAt(0);
    if (c >= 0x0400 && c <= 0x04ff) return true;
  }
  return false;
}

// Matches a dosage range like "6.0g～12.0g" or "3-9g" through to the end of
// that sentence (next 。), so two records whose intro phrasing differs but
// whose vendor dosage clause is byte-identical still group together.
const DOSAGE_CLAUSE_RE = /\d+(?:\.\d+)?\s*g\s*[～~-]\s*\d+(?:\.\d+)?\s*g[^。]*。/g;

function walkZh(value, fieldPath, insideZh, file, id) {
  if (typeof value === "string") {
    if (!insideZh) return;
    if (value.includes(FFFD)) {
      encodingFindings.push({ file, id, field: fieldPath, type: "U+FFFD", snippet: value.slice(0, 60) });
    }
    if (hasCyrillic(value)) {
      encodingFindings.push({ file, id, field: fieldPath, type: "Cyrillic", snippet: value.slice(0, 60) });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walkZh(v, `${fieldPath}[${i}]`, insideZh, file, id));
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      walkZh(v, fieldPath ? `${fieldPath}.${k}` : k, insideZh || k.endsWith("_zh"), file, id);
    }
  }
}

function walkDosage(value, file, id) {
  if (typeof value === "string") {
    const matches = value.match(DOSAGE_CLAUSE_RE);
    if (matches) {
      for (const clause of matches) {
        if (!dosageGroups.has(clause)) dosageGroups.set(clause, []);
        dosageGroups.get(clause).push({ file, id });
      }
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => walkDosage(v, file, id));
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) walkDosage(v, file, id);
  }
}

for (const rel of CONTENT_FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  let data;
  try { data = JSON.parse(fs.readFileSync(abs, "utf8")); } catch (e) { continue; }
  const recs = data.records || data.points || (Array.isArray(data) ? data : []);
  for (const r of recs) {
    const id = r.id || r.code || r.name_zh || "(unknown)";

    // 1. junk tokens (existing check, top-level array fields only)
    for (const [field, v] of Object.entries(r)) {
      if (!Array.isArray(v)) continue;
      for (const x of v) {
        if (typeof x !== "string" && typeof x !== "number") continue;
        if (JUNK_TOKENS.has(String(x).trim())) {
          junkFindings.push({ file: rel, id, field, token: String(x).trim() });
        }
      }
    }

    // 2. encoding anomalies inside _zh fields (recursive)
    walkZh(r, "", false, rel, id);

    // 3. shared verbatim dosage clauses (recursive, any field)
    walkDosage(r, rel, id);
  }
}

const sharedDosage = [...dosageGroups.entries()]
  .map(([clause, hits]) => ({ clause, hits, ids: [...new Set(hits.map((h) => h.id))] }))
  .filter((g) => g.ids.length >= 10)
  .sort((a, b) => b.ids.length - a.ids.length);

let blocking = false;

if (junkFindings.length > 0) {
  blocking = true;
  console.error(`validate-content-junk: FAIL — ${junkFindings.length} junk header token(s) found:`);
  for (const f of junkFindings.slice(0, 40)) {
    console.error(`  ${f.file}  ${f.id}  ${f.field}  →  "${f.token}"`);
  }
  if (junkFindings.length > 40) console.error(`  ... and ${junkFindings.length - 40} more`);
  console.error(`  Fix: node scripts/clean-content-junk.js --apply`);
}

if (encodingFindings.length > 0) {
  blocking = true;
  console.error(`validate-content-junk: FAIL — ${encodingFindings.length} encoding anomaly(ies) found in _zh fields:`);
  for (const f of encodingFindings.slice(0, 40)) {
    console.error(`  ${f.file}  ${f.id}  ${f.field}  [${f.type}]  →  "${f.snippet}"`);
  }
  if (encodingFindings.length > 40) console.error(`  ... and ${encodingFindings.length - 40} more`);
  console.error(`  Fix: locate the intended character from context (curriculum source / git history);`);
  console.error(`  if ambiguous, use the honest gap marker 〔字損〕 — never guess silently.`);
}

if (sharedDosage.length > 0) {
  console.warn(`validate-content-junk: WARN — ${sharedDosage.length} dosage clause(s) shared verbatim by ≥10 records (not blocking):`);
  for (const g of sharedDosage) {
    console.warn(`  "${g.clause}"  ×${g.ids.length} records`);
    console.warn(`    ${g.ids.join(", ")}`);
  }
  console.warn(`  This is vendor-generic reference dosage, not a per-formula sourced value.`);
  console.warn(`  See docs/research_packs/AUDIT_DATA_FIXES_LEDGER.md for the tracked id list.`);
}

if (!blocking) {
  console.log(
    junkFindings.length === 0 && encodingFindings.length === 0
      ? "validate-content-junk: PASS — no scraped header tokens, no encoding anomalies in _zh fields."
      : "validate-content-junk: PASS (warnings above are non-blocking)."
  );
  process.exit(0);
}

process.exit(1);
