#!/usr/bin/env node
/**
 * check-validation-ratchet.js — the CI gate for layers that are mid-cleanup.
 *
 * Two kinds of validator live in this repo:
 *
 *   GREEN   already passing. CI runs them directly; any failure blocks a merge.
 *   RATCHET a real, honest backlog (conditions 631 defects, patterns 250).
 *           Demanding zero would block every merge, so nobody would keep the
 *           gate on. Demanding "no worse than the committed baseline" is a gate
 *           that can actually stay on — and it makes the numbers only ever go
 *           down.
 *
 * This is the mechanism that answers the repo's real failure mode: 27 validators
 * existed on 2026-08-02 and nothing forced any of them to be run, so a batch was
 * reported complete and had to be re-measured by the next agent.
 *
 *   node scripts/check-validation-ratchet.js            # compare to baseline
 *   node scripts/check-validation-ratchet.js --update   # accept current as new
 *                                                       # baseline (only when
 *                                                       # counts went DOWN)
 *
 * A baseline is only ever allowed to move downward. `--update` refuses to
 * record a regression — that is the whole point of a ratchet.
 *
 * The ONE legitimate reason for a ceiling to rise is the measure getting
 * stricter (a validator learns a new defect class, so the same data counts
 * higher). That path is explicit and leaves a paper trail:
 *
 *   node scripts/check-validation-ratchet.js --rebaseline "C10 added: verbatim-shared content"
 *
 * `--rebaseline` requires a reason, records it (with date) in the baseline
 * file, and is the only way a number goes up. Using it to absorb a real data
 * regression instead of a validator change is a constitution §D.17 violation.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const BASELINE = "data/audits/validation_baseline.json";

// Each entry: run the validator with --json and read `defects` (or a custom
// extractor). Adding a layer here is how it joins the ratchet.
const RATCHETED = [
  {
    key: "conditions",
    script: "scripts/validate-condition-standard.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    doc: "docs/CONDITION_CARD_TEMPLATE.md",
  },
  {
    key: "patterns",
    script: "scripts/validate-pattern-standard.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    doc: "docs/PATTERN_CARD_TEMPLATE.md",
  },
  {
    key: "tdis",
    script: "scripts/validate-tdis-standard.js",
    args: ["--json"],
    extract: (out) => JSON.parse(out).defects,
    detail: (out) => JSON.parse(out).by_code,
    doc: "docs/TDIS_CARD_TEMPLATE.md",
  },
  {
    key: "naming",
    script: "scripts/validate-naming.js",
    args: [],
    // validate-naming has no --json; count its "FAIL:" lines.
    extract: (out) => (out.match(/^FAIL:/gm) || []).length,
    detail: () => null,
    doc: "DECISIONS.md D3",
  },
  // point_ids sat here temporarily (ceiling 72) while the extra-point line
  // backfilled the D2 ids. Done 2026-08-06 — it graduated into the blocking
  // `green` job in .github/workflows/validate.yml. That is the intended life
  // of a ratchet entry: hold the line, then leave.
];

function run(script, args) {
  try {
    return execFileSync(process.execPath, [path.join(ROOT, script), ...args], {
      cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    // These validators exit 1 when defects exist — that is expected here.
    return `${err.stdout || ""}${err.stderr || ""}`;
  }
}

const UPDATE = process.argv.includes("--update");
const rbIdx = process.argv.indexOf("--rebaseline");
const REBASELINE = rbIdx >= 0;
const REBASELINE_REASON = REBASELINE ? process.argv[rbIdx + 1] : null;
if (REBASELINE && (!REBASELINE_REASON || REBASELINE_REASON.startsWith("--"))) {
  console.error("--rebaseline requires a reason string, e.g. --rebaseline \"C10 added: ...\"");
  process.exit(2);
}
const baselinePath = path.join(ROOT, BASELINE);
const baseline = fs.existsSync(baselinePath)
  ? JSON.parse(fs.readFileSync(baselinePath, "utf8"))
  : { note: "", layers: {} };

const current = {};
for (const entry of RATCHETED) {
  const out = run(entry.script, entry.args);
  let count;
  try {
    count = entry.extract(out);
  } catch {
    console.error(`RATCHET ERROR: could not read a defect count from ${entry.script}.`);
    console.error(out.slice(0, 400));
    process.exit(2);
  }
  current[entry.key] = { defects: count, by_code: entry.detail(out) || undefined, doc: entry.doc };
}

let regressed = false;
let improved = false;
const lines = [];
for (const entry of RATCHETED) {
  const now = current[entry.key].defects;
  const was = baseline.layers?.[entry.key]?.defects;
  if (was === undefined) {
    lines.push(`  NEW      ${entry.key.padEnd(12)} ${now}  (no baseline yet)`);
    improved = true;
    continue;
  }
  if (now > was) {
    lines.push(`  REGRESS  ${entry.key.padEnd(12)} ${was} → ${now}   (+${now - was})  see ${entry.doc}`);
    regressed = true;
  } else if (now < was) {
    lines.push(`  BETTER   ${entry.key.padEnd(12)} ${was} → ${now}   (−${was - now})`);
    improved = true;
  } else {
    lines.push(`  flat     ${entry.key.padEnd(12)} ${now}`);
  }
}

console.log("validation ratchet — defect counts vs committed baseline\n");
lines.forEach((l) => console.log(l));
console.log("");

if (UPDATE || REBASELINE) {
  if (regressed && !REBASELINE) {
    console.error("REFUSED to update the baseline: a count went UP.");
    console.error("A ratchet only moves one way. If a VALIDATOR got stricter (not the data worse),");
    console.error("use: --rebaseline \"<which check was added and why>\"");
    process.exit(1);
  }
  const next = {
    note: "Defect-count ceiling per layer. CI fails if any count rises. Only ever lower this file — see scripts/check-validation-ratchet.js.",
    updated_at: new Date().toISOString().slice(0, 10),
    ...(REBASELINE ? {
      rebaseline_history: [
        ...(baseline.rebaseline_history || []),
        { date: new Date().toISOString().slice(0, 10), reason: REBASELINE_REASON },
      ],
    } : baseline.rebaseline_history ? { rebaseline_history: baseline.rebaseline_history } : {}),
    layers: Object.fromEntries(Object.entries(current).map(([k, v]) => [k, { defects: v.defects, by_code: v.by_code, doc: v.doc }])),
  };
  fs.writeFileSync(baselinePath, JSON.stringify(next, null, 2) + "\n", "utf8");
  console.log(`baseline ${REBASELINE ? "REBASELINED (" + REBASELINE_REASON + ")" : "updated"} → ${BASELINE}`);
  process.exit(0);
}

if (regressed) {
  console.error("FAIL — a layer got worse than the committed baseline.");
  console.error("Fix the new defects. (Only if a VALIDATOR was tightened — not the data made");
  console.error("worse — record it: check-validation-ratchet.js --rebaseline \"<what changed>\")");
  process.exit(1);
}
console.log(improved ? "PASS — no regressions (and something improved; run --update to lock it in)." : "PASS — no regressions.");
