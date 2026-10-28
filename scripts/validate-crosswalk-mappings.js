#!/usr/bin/env node
/**
 * validate-crosswalk-mappings.js — the versioned ICD-10-CM mapping layer's stick.
 * Small and single-purpose (2026-08-08 merge); FK integrity stays in
 * validate-relations.js — this file checks only what the merge introduced.
 *
 * Hard failures:
 *   XW1 versioned entry missing system/release/effective window or description
 *   XW2 mapping_type not in the controlled set
 *   XW3 duplicate code within one condition's icd10[] (accidental duplicate;
 *       cross-condition reuse is intentional and allowed)
 *   XW4 a legacy_seed_nonterminal entry anywhere but position 0
 *   XW5 migraine_vestibular canonicalized: its record must keep the
 *       correction queue, keep G43.82 marked incorrect_do_not_use, and have
 *       NO source_checked versioned mapping until the queue is decided
 *   XW6 a versioned entry with status source_checked but billable !== true
 *   XW7 the calendar axis (2026-08-22): every versioned entry carries
 *       effective_to, and before this rule NOTHING compared it to today —
 *       on 2026-10-01 all 679 FY2026 codes expire and this file would keep
 *       printing 0 defects. Expired entries are a hard failure; entries
 *       inside the six-week runway print a loud warning.
 *
 *       ONE narrow exception (2026-10-28, FY2027 換版): an expired entry whose
 *       code the new release deleted as billable may stay as history IF it says
 *       so and its successors are accounted for —
 *         superseded_in   a release later than the entry's own (FY2027 > FY2026)
 *         superseded_by   non-empty list of well-formed codes, not its own code
 *         and EITHER every successor is listed in the same record's OPEN
 *         icd10_correction_queue.candidate_mappings (the XW5 pattern: a human
 *         coding ruling is pending, nothing is promoted meanwhile)
 *         OR every successor is a current versioned entry on the same record
 *         (the ruling happened and the successors were promoted).
 *       Anything short of that is still XW7. Superseded entries are printed
 *       on every run so the pending ruling never goes quiet.
 *
 *   node scripts/validate-crosswalk-mappings.js              # gate
 *   node scripts/validate-crosswalk-mappings.js --self-test  # negative controls (CI runs this first)
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const TYPES = new Set(["exact", "leaf_option", "broad_candidate", "related_not_exact",
  "candidate_context_dependent", "index_supported_close_match"]);
const RUNWAY_DAYS = 42; // the dispatch plan's six-week deadline
const ICD_CODE = /^[A-Z][0-9][0-9A-Z](\.[0-9A-Z]{1,4})?$/;
const fyNum = (s) => { const m = /^FY(\d{4})$/.exec(String(s || "")); return m ? Number(m[1]) : NaN; };

// Pure: returns { defects, expired, expiring, earliest, superseded, versioned, covered } — no I/O.
function check(xw, today, runwayEdge) {
  const defects = [];
  for (const rec of xw.records || []) {
    const seen = new Set();
    (rec.icd10 || []).forEach((e, i) => {
      if (seen.has(e.code)) defects.push(`XW3 ${rec.id}: duplicate code ${e.code}`);
      seen.add(e.code);
      if (e.mapping_status === "legacy_seed_nonterminal" || e.mapping_status === "incorrect_do_not_use") {
        if (i !== 0) defects.push(`XW4 ${rec.id}: legacy/incorrect entry ${e.code} not at position 0`);
        return; // legacy seeds are exempt from versioned-entry requirements
      }
      if (!e.mapping_type) return; // pre-merge seed shape on uncovered records
      if (!TYPES.has(e.mapping_type)) defects.push(`XW2 ${rec.id}: mapping_type "${e.mapping_type}"`);
      for (const f of ["system", "release", "effective_from", "effective_to", "description"]) {
        if (!e[f]) defects.push(`XW1 ${rec.id} ${e.code}: missing ${f}`);
      }
      if (e.status === "source_checked" && e.billable !== true) defects.push(`XW6 ${rec.id} ${e.code}: source_checked but billable=${e.billable}`);
    });
  }

  const mv = (xw.records || []).find((r) => r.condition_id === "cond.migraine_vestibular");
  if (!mv) defects.push("XW5 migraine_vestibular record missing");
  else {
    if (!mv.icd10_correction_queue) defects.push("XW5 migraine_vestibular: correction queue removed");
    if ((mv.icd10 || [])[0]?.mapping_status !== "incorrect_do_not_use") defects.push("XW5 migraine_vestibular: G43.82 no longer marked incorrect");
    if ((mv.icd10 || []).some((e) => e.mapping_type && e.status === "source_checked")) defects.push("XW5 migraine_vestibular: a mapping was canonicalized while the queue is open");
  }

  // ── XW7 calendar axis ────────────────────────────────────────────────────
  // Warn inside the runway, fail after expiry. The failure message names the
  // prepared remediation so the gate gets fixed, not switched off.
  let expired = 0, expiring = 0, earliest = null;
  const superseded = [];
  for (const rec of xw.records || []) {
    // "current" = in force today AND not itself retired; a superseded entry can never vouch for another.
    const current = new Set((rec.icd10 || [])
      .filter((x) => x.mapping_type && x.effective_to && x.effective_to >= today && x.superseded_in === undefined)
      .map((x) => x.code));
    const q = rec.icd10_correction_queue;
    const queueOpen = Boolean(q) && q.status === "requires_human_coding_review";
    const queued = new Set(queueOpen ? (q.candidate_mappings || []).map((c) => c.code) : []);
    for (const e of rec.icd10 || []) {
      if (!e.mapping_type || !e.effective_to) continue; // legacy seeds exempt, like XW1
      if (e.effective_to < today) {
        if (e.superseded_in !== undefined || e.superseded_by !== undefined) {
          const succ = Array.isArray(e.superseded_by) ? e.superseded_by : [];
          const why = [];
          if (!(fyNum(e.superseded_in) > fyNum(e.release))) why.push(`superseded_in "${e.superseded_in}" is not a release after "${e.release}"`);
          if (!succ.length) why.push("superseded_by is empty");
          const bad = succ.filter((c) => !ICD_CODE.test(c) || c === e.code);
          if (bad.length) why.push(`superseded_by has malformed/self codes: ${bad.join(", ")}`);
          const allQueued = succ.length > 0 && succ.every((c) => queued.has(c));
          const allCurrent = succ.length > 0 && succ.every((c) => current.has(c));
          if (!allQueued && !allCurrent) why.push("successors are neither all queued for coding review on this record nor all current entries on it");
          if (why.length) defects.push(`XW7 ${rec.id} ${e.code}: expired ${e.effective_to}, superseded claim rejected — ${why.join("; ")}`);
          else superseded.push({ rec: rec.id, code: e.code, release: e.release, superseded_in: e.superseded_in, succ, state: allCurrent ? "successors promoted" : "awaiting coding review" });
          continue;
        }
        expired++;
        if (expired <= 3) defects.push(`XW7 ${rec.id} ${e.code}: effective_to ${e.effective_to} is in the past`);
      } else if (e.effective_to <= runwayEdge) {
        expiring++;
        if (!earliest || e.effective_to < earliest) earliest = e.effective_to;
      }
    }
  }
  if (expired > 3) defects.push(`XW7 …and ${expired - 3} more expired entries (total ${expired})`);

  const versioned = (xw.records || []).reduce((n, r) => n + (r.icd10 || []).filter((e) => e.mapping_type).length, 0);
  const covered = (xw.records || []).filter((r) => (r.icd10 || []).some((e) => e.mapping_type)).length;
  return { defects, expired, expiring, earliest, superseded, versioned, covered };
}

function selfTest() {
  const T = "2026-10-28", EDGE = "2026-12-09";
  const mvRec = () => ({ id: "xwalk.migraine_vestibular", condition_id: "cond.migraine_vestibular",
    icd10: [{ code: "G43.82", mapping_status: "incorrect_do_not_use" }], icd10_correction_queue: { status: "requires_human_coding_review" } });
  const cur = (code) => ({ code, description: "d", system: "ICD-10-CM", release: "FY2027", effective_from: "2026-10-01",
    effective_to: "2027-09-30", billable: true, mapping_type: "leaf_option", status: "source_checked" });
  const old = (code, extra) => ({ ...cur(code), release: "FY2026", effective_from: "2025-10-01", effective_to: "2026-09-30", ...extra });
  const queue = (codes) => ({ status: "requires_human_coding_review", candidate_mappings: codes.map((code) => ({ code })) });
  const SUCC = ["M72.20", "M72.21", "M72.22"];
  const sup = (by, extra) => old("M72.2", { superseded_in: "FY2027", superseded_by: by, ...extra });
  const cases = [
    ["expired, no superseded claim -> XW7", [{ id: "x", icd10: [old("M72.2")] }], true],
    ["superseded, successors neither queued nor current -> XW7", [{ id: "x", icd10: [sup(SUCC)] }], true],
    ["superseded, queue missing one successor -> XW7", [{ id: "x", icd10: [sup(SUCC)], icd10_correction_queue: queue(SUCC.slice(0, 2)) }], true],
    ["superseded, queue closed (status changed) -> XW7", [{ id: "x", icd10: [sup(SUCC)], icd10_correction_queue: { ...queue(SUCC), status: "decided" } }], true],
    ["superseded_in not later than release -> XW7", [{ id: "x", icd10: [sup(SUCC, { superseded_in: "FY2026" })], icd10_correction_queue: queue(SUCC) }], true],
    ["superseded_in malformed -> XW7", [{ id: "x", icd10: [sup(SUCC, { superseded_in: "2027" })], icd10_correction_queue: queue(SUCC) }], true],
    ["superseded_by lists its own code -> XW7", [{ id: "x", icd10: [sup(["M72.2"])], icd10_correction_queue: queue(["M72.2"]) }], true],
    ["superseded_by empty -> XW7", [{ id: "x", icd10: [sup([])], icd10_correction_queue: queue([]) }], true],
    ["superseded_by malformed code -> XW7", [{ id: "x", icd10: [sup(["m72.20"])], icd10_correction_queue: queue(["m72.20"]) }], true],
    ["successors queued on ANOTHER record only -> XW7", [{ id: "x", icd10: [sup(SUCC)] }, { id: "y", icd10: [], icd10_correction_queue: queue(SUCC) }], true],
    ["successor current only because it is itself superseded -> XW7", [{ id: "x", icd10: [sup(["M72.20"]), { ...cur("M72.20"), superseded_in: "FY2028", superseded_by: ["M72.201"] }] }], true],
    ["successor present but expired -> XW7", [{ id: "x", icd10: [sup(["M72.20"]), old("M72.20")] }], true],
    ["superseded, all successors queued on same open record -> pass", [{ id: "x", icd10: [sup(SUCC)], icd10_correction_queue: queue(SUCC) }], false],
    ["superseded, all successors promoted as current entries -> pass", [{ id: "x", icd10: [sup(SUCC), ...SUCC.map(cur)] }], false],
    ["all current, nothing expired -> pass", [{ id: "x", icd10: [cur("E28.2")] }], false],
  ];
  let bad = 0;
  for (const [name, recs, wantFail] of cases) {
    const r = check({ records: [mvRec(), ...recs] }, T, EDGE);
    const xw7 = r.defects.filter((d) => d.startsWith("XW7"));
    const failed = xw7.length > 0;
    const ok = failed === wantFail;
    if (!ok) bad++;
    console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : `  (got ${failed ? "fail" : "pass"}: ${xw7.join(" | ") || "no XW7"})`}`);
  }
  const neg = cases.filter((c) => c[2]).length;
  console.log(bad ? `SELF-TEST FAILED — ${bad}/${cases.length} cases wrong` : `self-test PASS — ${cases.length}/${cases.length} cases (${neg} negative controls, ${cases.length - neg} positive)`);
  process.exit(bad ? 1 : 0);
}

if (require.main === module) {
  if (process.argv.includes("--self-test")) selfTest();
  const xw = JSON.parse(fs.readFileSync(path.join(ROOT, "data/interop/condition_crosswalk.json"), "utf8"));
  const today = new Date().toISOString().slice(0, 10);
  const runwayEdge = new Date(Date.now() + RUNWAY_DAYS * 864e5).toISOString().slice(0, 10);
  const r = check(xw, today, runwayEdge);
  if (r.expired) {
    console.log(`XW7: ${r.expired} versioned entries are EXPIRED — the mapping layer is stale.`);
    console.log(`     Remediation: re-verify against the new CDC/NCHS release and restamp (FY2027 precedent: scripts/apply-icd-fy2027-restamp.js).`);
  } else if (r.expiring) {
    console.log(`⚠ XW7: ${r.expiring} versioned entries expire within ${RUNWAY_DAYS} days (earliest ${r.earliest}).`);
    console.log(`  Six-week runway is open — re-verify against the next CDC/NCHS release (FY2027 precedent: scripts/apply-icd-fy2027-restamp.js).`);
  }
  if (r.superseded.length) {
    console.log(`XW7: ${r.superseded.length} superseded entr${r.superseded.length === 1 ? "y" : "ies"} kept as history:`);
    for (const s of r.superseded) console.log(`     ${s.rec} ${s.code} (${s.release}) → ${s.succ.join(" / ")} in ${s.superseded_in} — ${s.state}`);
  }
  console.log(`crosswalk mappings: ${r.versioned} versioned entries · ${r.covered} conditions covered · ${r.defects.length} defects`);
  if (r.defects.length) { r.defects.forEach((d) => console.log("  " + d)); process.exit(1); }
}

module.exports = { check };
