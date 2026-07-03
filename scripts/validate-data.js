#!/usr/bin/env node
/**
 * validate-data.js
 *
 * Proves the data migration is lossless: evaluates BOTH legacy/app.js and the
 * current app.js in a stubbed browser, then deep-compares the final merged
 * point dataset (defaultPoints). Also checks for duplicate codes and counts.
 *
 * Usage: node scripts/validate-data.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

globalThis.window = globalThis;
for (const rel of [
  "data/generated/app_data.js",
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

const legacy = evaluate("legacy/app.js").defaultPoints;
const current = evaluate("app.js").defaultPoints;

let failures = 0;
function fail(msg) { failures++; console.error("FAIL: " + msg); }

if (legacy.length !== current.length) {
  fail(`defaultPoints count differs: legacy=${legacy.length} current=${current.length}`);
} else {
  console.log(`OK: defaultPoints count identical (${current.length})`);
}

// `sources` and `visualLinks` are reference-URL fields that we intentionally
// improve over time (e.g. per-point CloudTCM search instead of a generic
// directory link). Exclude them from the deep-equal so this gate still
// protects the clinical fields (location, functions, patterns, cautions...)
// against accidental data loss, without flagging deliberate URL upgrades.
const IGNORED_FIELDS = ["sources", "visualLinks"];
function stripForCompare(point) {
  const clone = { ...point };
  for (const f of IGNORED_FIELDS) delete clone[f];
  return clone;
}
const a = JSON.stringify(legacy.map(stripForCompare));
const b = JSON.stringify(current.map(stripForCompare));
if (a === b) {
  console.log("OK: defaultPoints deep-equal between legacy and current app (excluding reference-URL fields)");
} else {
  const byCode = new Map(legacy.map((p) => [p.code, stripForCompare(p)]));
  let diffs = 0;
  for (const p of current) {
    const q = byCode.get(p.code);
    if (!q || JSON.stringify(stripForCompare(p)) !== JSON.stringify(q)) {
      if (diffs < 5) console.error("  diff at code: " + p.code);
      diffs++;
    }
  }
  fail(`defaultPoints clinical fields differ (${diffs} records affected)`);
}

const codes = current.map((p) => p.code);
const dupes = codes.filter((c, i) => codes.indexOf(c) !== i);
if (dupes.length) fail("duplicate codes: " + [...new Set(dupes)].join(", "));
else console.log("OK: no duplicate point codes");

const counts = {};
for (const p of current) {
  const kind = p.pointType || p.kind || (p.code.match(/^[A-Z]+/) || ["?"])[0];
  counts[kind] = (counts[kind] || 0) + 1;
}
console.log("Channel/prefix counts:", JSON.stringify(counts));

process.exit(failures ? 1 : 0);
