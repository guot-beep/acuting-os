#!/usr/bin/env node
/**
 * apply-icd-fy2027-restamp.js — ICD-10-CM FY2027 換版落地(2026-10-28)。
 *
 * What it records (facts only, no coding judgement):
 *   1. 675 distinct codes (678 entries) that are still billable in FY2027 with a byte-identical
 *      long description get their version window restamped:
 *        release FY2026 → FY2027 · effective 2025-10-01..2026-09-30 → 2026-10-01..2027-09-30
 *      The old window and old `source` are MOVED into `release_history` first, then changed
 *      (constitution: 先搬再改). description / status / billable / mapping_type are not touched.
 *   2. M72.2 (xwalk.plantar_fasciitis) — FY2027 deleted it as billable and added M72.20/.21/.22.
 *      Which leaf(s) the condition maps to is a coding ruling, so NOTHING is promoted:
 *      the FY2026 entry stays as history with superseded_in/superseded_by, and the record gets
 *      an icd10_correction_queue in the exact shape of the 2026-08-08 migraine_vestibular queue
 *      (XW5 precedent). validate-crosswalk-mappings.js XW7 accepts that and nothing looser.
 *   3. Record-level icd10_version "ICD-10-CM FY2026" → "ICD-10-CM FY2027" on the 80 records whose
 *      versioned entries were all restamped. plantar_fasciitis keeps FY2026 (its only mapping is FY2026).
 *
 * Sources (two, independent, must agree or nothing is written):
 *   docs/audits/ICD_FY2027_INVENTORY_2026-10-22.json  CDC/NCHS files (whitelisted canonical source)
 *   docs/audits/ICD_FY2027_NLM_CROSSCHECK_2026-10-28.json  NLM per-code cross-check (corroboration)
 *
 *   node scripts/apply-icd-fy2027-restamp.js          # dry run: verify + print the plan, write nothing
 *   node scripts/apply-icd-fy2027-restamp.js --apply  # write data/interop/condition_crosswalk.json
 *
 * The crosswalk is not bundled by build-data.js and no renderer reads it (2026-10-28 grep):
 * this changes no screen. Re-running after --apply aborts on the first expectation (already FY2027).
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const XW = "data/interop/condition_crosswalk.json";
const CDC = "docs/audits/ICD_FY2027_INVENTORY_2026-10-22.json";
const NLM = "docs/audits/ICD_FY2027_NLM_CROSSCHECK_2026-10-28.json";
const APPLY = process.argv.includes("--apply");

const OLD = { release: "FY2026", effective_from: "2025-10-01", effective_to: "2026-09-30" };
const NEW = { release: "FY2027", effective_from: "2026-10-01", effective_to: "2027-09-30" };
const SHA = "93e3ad6004badf470c55bfe679b748ae88fd9b2b421851e409eec382c7713b9a";
const NEW_SOURCE = `CDC/NCHS ICD-10-CM FY2027 code files (icd10cm-code-descriptions-2027.zip, sha256 ${SHA}; icd10cm-order-2027.txt billable flag 1, long description identical) via ${CDC.replace(/\.json$/, ".md")} · NLM Clinical Tables per-code cross-check 2026-10-28 via ${NLM}`;
const HEADER = "M72.2";
const HEADER_REC = "xwalk.plantar_fasciitis";
// Addenda wording as quoted in the CDC inventory (2026-10-22); the NLM ledger must return the same names.
const SUCCESSORS = [
  ["M72.20", "Plantar fascial fibromatosis, unspecified foot"],
  ["M72.21", "Plantar fascial fibromatosis, right foot"],
  ["M72.22", "Plantar fascial fibromatosis, left foot"],
];

const fails = [];
const expect = (cond, msg) => { if (!cond) fails.push(msg); return cond; };
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const raw = read(XW);
const xw = JSON.parse(raw);
expect(JSON.stringify(xw, null, 2) + "\n" === raw, `${XW} does not round-trip as 2-space JSON + newline — refusing to rewrite it`);
const cdc = JSON.parse(read(CDC));
const nlm = JSON.parse(read(NLM));

// ── 1. both sources say the same thing ─────────────────────────────────────
expect(cdc.source && cdc.source.sha256 === SHA, `CDC inventory sha256 is not ${SHA}`);
expect(cdc.summary.still_billable === 675 && cdc.summary.header_code_claimed_billable === 1
  && cdc.summary.removed_in_fy2027 === 0 && cdc.summary.description_drift === 0,
  `CDC inventory summary changed: ${JSON.stringify(cdc.summary)}`);
expect(JSON.stringify((cdc.header_code_claimed_billable || []).map((h) => h.code)) === JSON.stringify([HEADER]),
  "CDC inventory header list is not exactly [M72.2]");
const nlmBy = new Map(nlm.rows.map((r) => [r.code, r]));
expect(nlm.rows.length === 676, `NLM ledger has ${nlm.rows.length} rows, expected 676`);
const nlmSame = nlm.rows.filter((r) => r.verdict === "billable_same_desc").map((r) => r.code);
const nlmOther = nlm.rows.filter((r) => r.verdict !== "billable_same_desc");
expect(nlmSame.length === 675, `NLM billable_same_desc ${nlmSame.length}, expected 675`);
expect(nlmOther.length === 1 && nlmOther[0].code === HEADER && nlmOther[0].verdict === "not_billable_has_children",
  `NLM exceptions are not exactly M72.2/not_billable_has_children: ${JSON.stringify(nlmOther.map((r) => [r.code, r.verdict]))}`);
const kids = (nlmOther[0] && nlmOther[0].children) || [];
expect(JSON.stringify(kids) === JSON.stringify(SUCCESSORS), `NLM children of M72.2 differ from the CDC addenda: ${JSON.stringify(kids)}`);

// ── 2. the crosswalk is exactly in the state both sources describe ─────────
const versioned = [];
for (const rec of xw.records) for (const e of rec.icd10 || []) if (e.mapping_type) versioned.push({ rec, e });
expect(versioned.length === 679, `versioned entries ${versioned.length}, expected 679`);
const distinct = new Set(versioned.map((v) => v.e.code));
expect(distinct.size === 676, `distinct codes ${distinct.size}, expected 676`);
expect(JSON.stringify([...distinct].sort()) === JSON.stringify([...nlmSame, HEADER].sort()), "crosswalk code set differs from the NLM ledger code set");
for (const { rec, e } of versioned) {
  const at = `${rec.id} ${e.code}`;
  for (const k of Object.keys(OLD)) expect(e[k] === OLD[k], `${at}: ${k} is "${e[k]}", expected "${OLD[k]}"`);
  expect(e.status === "source_checked" && e.billable === true, `${at}: status/billable is ${e.status}/${e.billable}`);
  expect(e.release_history === undefined && e.superseded_in === undefined && e.superseded_by === undefined, `${at}: already carries release_history/superseded_* — partially applied?`);
  expect(typeof e.source === "string" && e.source.length > 0, `${at}: empty source (nothing to move into release_history)`);
}
const hdr = versioned.filter((v) => v.e.code === HEADER);
expect(hdr.length === 1 && hdr[0].rec.id === HEADER_REC, `M72.2 occurs ${hdr.length}x / not only on ${HEADER_REC}`);
const hRec = xw.records.find((r) => r.id === HEADER_REC);
expect(hRec && hRec.review_status === "source_checked", `${HEADER_REC}.review_status is "${hRec && hRec.review_status}"`);
expect(hRec && hRec.documentation_note_zh === "", `${HEADER_REC}.documentation_note_zh is not empty — would overwrite content`);
expect(hRec && hRec.icd10_correction_queue === undefined, `${HEADER_REC} already has a correction queue`);
expect(hRec && (hRec.icd10 || []).filter((e) => e.mapping_type).length === 1, `${HEADER_REC} has more than the one M72.2 versioned entry`);

if (fails.length) {
  console.log(`ABORT — ${fails.length} expectation(s) failed, nothing written:`);
  fails.slice(0, 25).forEach((f) => console.log("  " + f));
  if (fails.length > 25) console.log(`  …and ${fails.length - 25} more`);
  process.exit(1);
}

// ── 3. mutate (in memory) ──────────────────────────────────────────────────
// Rebuild an entry inserting `extra` keys right after `afterKey`, keeping every other key in place.
const withKeys = (obj, afterKey, extra) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) { out[k] = v; if (k === afterKey) Object.assign(out, extra); }
  return out;
};
let restamped = 0;
const restampedRecs = new Set();
for (const rec of xw.records) {
  if (!rec.icd10) continue;
  rec.icd10 = rec.icd10.map((e) => {
    if (!e.mapping_type || e.code === HEADER) return e;
    const hist = { release: e.release, effective_from: e.effective_from, effective_to: e.effective_to, source: e.source };   // 先搬
    const moved = withKeys(e, "source", { release_history: [hist] });
    Object.assign(moved, NEW, { source: NEW_SOURCE });                                                                   // 再改
    restamped++;
    restampedRecs.add(rec.id);
    return moved;
  });
}
for (const rec of xw.records) {
  if (!restampedRecs.has(rec.id)) continue;
  const allNew = rec.icd10.filter((e) => e.mapping_type).every((e) => e.release === NEW.release);
  if (allNew && rec.icd10_version === "ICD-10-CM FY2026") rec.icd10_version = "ICD-10-CM FY2027";
}
hRec.icd10 = hRec.icd10.map((e) => e.code !== HEADER ? e
  : withKeys(e, "effective_to", { superseded_in: "FY2027", superseded_by: SUCCESSORS.map(([c]) => c) }));
hRec.review_status = "correction_queued";
hRec.documentation_note_zh = "ICD-10-CM FY2027 起 M72.2 已不是可申報碼,拆為未指定側 / 右腳 / 左腳三碼(M72.20 / M72.21 / M72.22)。改對應哪一碼待人工編碼審查;裁定前暫勿以本對應做申報文件。";
hRec.icd10_correction_queue = {
  queued_at: "2026-10-28",
  queued_by: "claude",
  status: "requires_human_coding_review",
  superseded_mapping: { code: HEADER, release: "FY2026", superseded_in: "FY2027", mapping_type: "index_supported_close_match" },
  reason: "ICD-10-CM FY2027 (effective 2026-10-01) deleted M72.2 as a billable code and added three laterality leaves. The FY2026 mapping stays on the record as history (superseded_in / superseded_by). Which leaf or leaves this condition maps to is a coding decision, so nothing is promoted into icd10[] until Ting reviews.",
  official_evidence: [
    {
      source_url: "https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/ICD10CM/2027/",
      source_org: "CDC/NCHS",
      file: "icd10cm-code-descriptions-2027.zip",
      file_sha256: SHA,
      note: "icd10cm-codes-addenda-2027.txt: Delete M722; Add M7220 / M7221 / M7222. icd10cm-order-2027.txt: M722 billable flag 0 (header); M7220 / M7221 / M7222 flag 1.",
      icd10cm_version: "FY2027",
      source_ref: "docs/audits/ICD_FY2027_INVENTORY_2026-10-22.md",
    },
    {
      source_org: "NLM Clinical Tables (cross-check, not the canonical source)",
      note: "2026-10-28: the API no longer returns M72.2 as a code and returns M72.20 / M72.21 / M72.22 with the descriptions below.",
      source_ref: NLM,
    },
  ],
  candidate_mappings: SUCCESSORS.map(([code, official_description]) => ({ code, official_description, status: "candidate_requires_human_coding_review" })),
  candidate_note: "Recommendation carried over from the 2026-10-22 inventory, NOT applied: list all three as leaf_option (the shape the crosswalk already uses for 630 laterality/site leaves) with M72.20 as the default and the side chosen per patient, and keep the FY2026 caveat that plantar fascial fibromatosis is an index-supported close match for plantar fasciitis, not an exact one. Canon icd_hint (M72.2, now a category header) is untouched.",
};

// ── 4. post-conditions on the in-memory result ─────────────────────────────
const after = [];
for (const rec of xw.records) for (const e of rec.icd10 || []) if (e.mapping_type) after.push({ rec, e });
const post = [];
const P = (c, m) => { if (!c) post.push(m); };
P(after.length === 679, `after: versioned ${after.length}`);
P(restamped === 678, `restamped ${restamped}, expected 678`);
P(after.filter((v) => v.e.release === "FY2027").length === 678, "after: FY2027 count");
P(after.filter((v) => v.e.release === "FY2026").length === 1, "after: FY2026 count");
P(after.every((v) => v.e.status === "source_checked" && v.e.billable === true), "after: status/billable changed");
P(after.filter((v) => v.e.code !== HEADER).every((v) => v.e.release_history.length === 1 && v.e.release_history[0].source.length > 0), "after: release_history missing");
P(restampedRecs.size === 80, `records restamped ${restampedRecs.size}, expected 80`);
P(xw.records.filter((r) => r.icd10_version === "ICD-10-CM FY2027").length === 80, "after: icd10_version FY2027 count");
if (post.length) { console.log("ABORT — post-conditions failed, nothing written:"); post.forEach((p) => console.log("  " + p)); process.exit(1); }

console.log(`plan: restamp ${restamped} entries (${nlmSame.length} codes) across ${restampedRecs.size} records ${OLD.release}→${NEW.release} (${NEW.effective_from}..${NEW.effective_to}); old window+source moved to release_history`);
console.log(`plan: ${HEADER_REC} ${HEADER} kept as FY2026 history, superseded_by ${SUCCESSORS.map(([c]) => c).join(" / ")}; record review_status source_checked→correction_queued; icd10_correction_queue opened (3 candidates, none promoted)`);
console.log(`plan: icd10_version FY2026→FY2027 on 80 records; ${HEADER_REC} stays FY2026`);
if (!APPLY) { console.log("dry run — nothing written (pass --apply)"); process.exit(0); }
fs.writeFileSync(path.join(ROOT, XW), JSON.stringify(xw, null, 2) + "\n");
console.log(`wrote ${XW}`);
