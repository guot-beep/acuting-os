#!/usr/bin/env node
/**
 * check-today-survives.js — assert the 2026-08-06 repairs are still in the tree.
 *
 * Why a script and not trust: on 2026-08-06 a merge silently reverted a day of
 * work (72 point ids, a field migration) and nobody noticed for 14 hours,
 * because every commit message said it was "preserving" things. Merge messages
 * are not evidence. These are the invariants; run this after anyone pushes.
 *
 *   node scripts/check-today-survives.js
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const json = (p) => JSON.parse(read(p));

let bad = 0;
const check = (label, ok, detail) => {
  console.log(`${ok ? "  ok  " : "  LOST"} ${label}${ok ? "" : "   <- " + detail}`);
  if (!ok) bad++;
};

// 1. the 72 extra-point D2 ids (reverted once by merge 11f37a9)
const ex = json("data/acupoints/extra_points.json");
const exRecs = ex.records || ex.points || ex;
check("72 extra-point ids", exRecs.filter((r) => r.id).length === 72,
  `only ${exRecs.filter((r) => r.id).length}/72 carry an id`);

// 2. contraindications reach the card (21 points had invisible depth warnings)
check("app.js reads contraindications into cautions",
  /contraindications\s*\)\s*\?\s*record\.contraindications/.test(read("app.js")),
  "adapt361Record no longer merges contraindications — safety text goes invisible");

// 3. the pattern v1.0 migration (legacy keys must stay gone)
const pl = json("data/pathology/pattern_library.json");
const plRecs = pl.records || pl.patterns;
const legacy = plRecs.filter((r) => r.tongue !== undefined || r.pulse !== undefined || r.source_ids !== undefined);
check("pattern v1.0 migration", legacy.length === 0,
  `${legacy.length} record(s) carry legacy tongue/pulse/source_ids again`);

// 4. both point-id source lists still agree (the drift that made #1 unfixable)
check("add-point-ids and validate-point-ids read the same files",
  read("scripts/add-point-ids.js").includes("extra_points.json") &&
  read("scripts/validate-point-ids.js").includes("extra_points.json"),
  "extra_points.json dropped out of one list — ids become unrepairable again");

// 5. the slimmed rule docs (not covered by any other validator)
check("AI_CONSTITUTION is still the 1-page version",
  read("docs/AI_CONSTITUTION.md").split("\n").length < 80,
  "constitution grew back past one page — obedience drops with length");

console.log(bad ? `\nFAIL — ${bad} item(s) from 2026-08-06 were reverted.\n` +
  "Restore with: git checkout safe/2026-08-06-verified -- <path>"
  : "\nPASS — every 2026-08-06 repair is still in the tree.");
process.exit(bad ? 1 : 0);
