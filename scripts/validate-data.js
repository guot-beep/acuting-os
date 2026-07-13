#!/usr/bin/env node
/**
 * validate-data.js
 *
 * Phase 2 runtime-adapter validator: proves the app renders the FULL
 * data/acupoints/361.json layer as the single standard-channel source.
 *
 * This replaces the legacy deep-equal migration gate (legacy/app.js vs
 * app.js). Its retirement was approved by Ting on 2026-07-12 (PROJECT_LOG
 * entry "Runtime Adapter gate APPROVED") — the embedded->JSON migration it
 * protected is complete and legacy/app.js stays in git history untouched.
 *
 * Checks:
 *  1. every 361.json code is present in runtime defaultPoints
 *  2. no duplicate codes
 *  3. every 361-layer runtime record keeps nameZh / location / needling
 *     (techniqueNotes) non-empty and faithful to the JSON source
 *  4. every contraindication + danger line survives into runtime cautions
 *     (safety content must never be dropped)
 *  5. auricular / GB93 / Tung layer counts unchanged; EX extras retained
 *  6. total defaultPoints count matches EXPECTED_TOTAL
 *
 * Usage: node scripts/validate-data.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Expected layer totals (recorded 2026-07-12, Phase 2 landing):
//   361 standard + 2 extra points (EX-HN3, EX-HN5) + 29 auricular embedded
//   + 13 GB93 index (1 code overlaps auricular embedded) + 277 Tung = 681.
const EXPECTED_TOTAL = 681;
const EXPECTED_STANDARD = 361;
const EXPECTED_TUNG = 277;
const EXPECTED_GB93_INDEX = 13;
const EXPECTED_AURICULAR_EMBEDDED = 29;
const EXPECTED_EXTRAS = ["EX-HN3", "EX-HN5"];

globalThis.window = globalThis;
for (const rel of [
  "data/generated/app_data.js",
  "data/generated/points_361.js",
  "data/tung/point_index.js",
  "data/auricular/gb93_index.js",
  "data/auricular/gb93_worklist.js",
]) {
  new Function(fs.readFileSync(path.join(ROOT, rel), "utf8"))();
}

function makeEl() {
  const fn = function () {};
  return new Proxy(fn, {
    get(_t, prop) {
      if (prop === Symbol.toPrimitive) return () => "";
      if (prop === "length") return 0;
      if (prop === "value") return "";
      return makeEl();
    },
    set() { return true; },
    apply() { return makeEl(); },
    construct() { return makeEl(); },
  });
}
const documentStub = {
  querySelector: () => makeEl(),
  querySelectorAll: () => [],
  getElementById: () => makeEl(),
  createElement: () => makeEl(),
  addEventListener: () => {},
  body: makeEl(),
  documentElement: makeEl(),
};
const locationStub = { hash: "", href: "", assign() {}, replace() {} };
const windowStub = {
  addEventListener: () => {},
  removeEventListener: () => {},
  location: locationStub,
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  requestAnimationFrame: () => 0,
  scrollTo: () => {},
};
const localStorageStub = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

function evaluate(file) {
  const source = fs.readFileSync(path.join(ROOT, file), "utf8");
  const run = new Function(
    "document", "window", "localStorage", "location",
    "alert", "confirm", "requestAnimationFrame",
    source + "\n;return { defaultPoints };"
  );
  return run(
    documentStub, windowStub, localStorageStub, locationStub,
    () => {}, () => true, () => 0
  );
}

// Mirrors needling361Text() in app.js: `needling` is a string on most
// records, a {depth, angle, technique, moxibustion} object on BL61-BL67.
function expectedNeedlingText(needling) {
  if (typeof needling === "string") return needling;
  if (needling && typeof needling === "object") {
    return [
      needling.depth ? `針刺深度 Depth: ${needling.depth}` : "",
      needling.angle ? `角度 Angle: ${needling.angle}` : "",
      needling.technique || "",
      needling.moxibustion ? `艾灸 Moxibustion: ${needling.moxibustion}` : ""
    ].filter(Boolean).join("\n");
  }
  return "";
}

const src361 = JSON.parse(fs.readFileSync(path.join(ROOT, "data/acupoints/361.json"), "utf8"));
const runtime = evaluate("app.js").defaultPoints;
const byCode = new Map(runtime.map((p) => [p.code, p]));

let failures = 0;
function fail(msg) { failures++; console.error("FAIL: " + msg); }

// 1. coverage: every 361.json record present in runtime
const missing = src361.filter((r) => !byCode.has(r.code)).map((r) => r.code);
if (missing.length) fail(`361 records missing from runtime: ${missing.join(", ")}`);
else console.log(`OK: all ${src361.length} records from 361.json are present in runtime`);

// 2. duplicates
const codes = runtime.map((p) => p.code);
const dupes = codes.filter((c, i) => codes.indexOf(c) !== i);
if (dupes.length) fail("duplicate codes: " + [...new Set(dupes)].join(", "));
else console.log("OK: no duplicate point codes");

// 3. field integrity + adapter fidelity for the 361 layer
let fieldProblems = 0;
for (const r of src361) {
  const p = byCode.get(r.code);
  if (!p) continue;
  const problems = [];
  if (!String(p.nameZh || "").trim() || p.nameZh === p.code) problems.push("nameZh");
  if (!String(p.location || "").trim()) problems.push("location");
  if (!String(p.techniqueNotes || "").trim()) problems.push("techniqueNotes/needling");
  if (p.nameZh !== r.chinese) problems.push(`nameZh!=chinese (${p.nameZh} vs ${r.chinese})`);
  if (p.location !== r.location_zh) problems.push("location!=location_zh");
  if (p.techniqueNotes !== expectedNeedlingText(r.needling)) problems.push("techniqueNotes!=needling");
  if (problems.length) {
    if (fieldProblems < 5) console.error(`  field problem at ${r.code}: ${problems.join(", ")}`);
    fieldProblems++;
  }
}
if (fieldProblems) fail(`${fieldProblems} records with empty/unfaithful nameZh/location/needling`);
else console.log("OK: all 361 runtime records keep nameZh/location/needling non-empty and faithful");

// 4. safety content: every contraindication + danger line survives into cautions
let safetyProblems = 0;
for (const r of src361) {
  const p = byCode.get(r.code);
  if (!p) continue;
  const cautions = String(p.cautions || "");
  const requiredLines = [...(r.contraindications || []), ...(r.cautions || []), ...(r.danger || [])];
  const lost = requiredLines.filter((line) => !cautions.includes(line));
  if (lost.length) {
    if (safetyProblems < 5) console.error(`  safety line lost at ${r.code}: ${lost[0]}`);
    safetyProblems++;
  }
}
if (safetyProblems) fail(`${safetyProblems} records lost contraindication/danger lines in runtime cautions`);
else console.log("OK: all contraindication + danger lines survive into runtime cautions");

// 5. other layers unchanged
const src361Codes = new Set(src361.map((r) => r.code));
const standardCount = runtime.filter((p) => src361Codes.has(p.code)).length;
const tungCount = runtime.filter((p) => String(p.meridian || "").includes("Master Tung")).length;
if (standardCount !== EXPECTED_STANDARD) fail(`standard layer count ${standardCount}, expected ${EXPECTED_STANDARD}`);
else console.log(`OK: standard layer = ${standardCount}`);
if (tungCount !== EXPECTED_TUNG) fail(`Tung layer count ${tungCount}, expected ${EXPECTED_TUNG}`);
else console.log(`OK: Tung layer = ${tungCount}`);

const gb93Index = (globalThis.ACUTING_AURICULAR_GB93 || {}).points || [];
const auricularEmbedded = (globalThis.ACUTING_APP_DATA || {}).auricularPoints || [];
if (gb93Index.length !== EXPECTED_GB93_INDEX) fail(`GB93 index count ${gb93Index.length}, expected ${EXPECTED_GB93_INDEX}`);
else console.log(`OK: GB93 index = ${gb93Index.length}`);
if (auricularEmbedded.length !== EXPECTED_AURICULAR_EMBEDDED) fail(`auricular embedded count ${auricularEmbedded.length}, expected ${EXPECTED_AURICULAR_EMBEDDED}`);
else console.log(`OK: auricular embedded = ${auricularEmbedded.length}`);

const lostExtras = EXPECTED_EXTRAS.filter((code) => !byCode.has(code));
if (lostExtras.length) fail(`extra points lost from runtime: ${lostExtras.join(", ")}`);
else console.log(`OK: extra points retained (${EXPECTED_EXTRAS.join(", ")})`);

// 6. total
if (runtime.length !== EXPECTED_TOTAL) fail(`defaultPoints total ${runtime.length}, expected ${EXPECTED_TOTAL}`);
else console.log(`OK: defaultPoints total = ${runtime.length}`);

const counts = {};
for (const p of runtime) {
  const kind = (p.code.match(/^[A-Z]+/) || ["?"])[0];
  counts[kind] = (counts[kind] || 0) + 1;
}
console.log("Channel/prefix counts:", JSON.stringify(counts));

process.exit(failures ? 1 : 0);
