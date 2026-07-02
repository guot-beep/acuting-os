#!/usr/bin/env node
/**
 * extract-embedded-data.js
 *
 * Migration tool (re-runnable). Evaluates legacy/app.js in a stubbed browser
 * environment and extracts the embedded knowledge arrays into data/ JSON
 * files, which become the new source of truth. Only writes JSON, never code.
 *
 * Usage: node scripts/extract-embedded-data.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const APP_SOURCE = path.join(ROOT, "legacy", "app.js");

// --- 1. Load the three data bootstrap files (they assign to window.*) ----
globalThis.window = globalThis;
for (const rel of [
  "data/tung/point_index.js",
  "data/auricular/gb93_index.js",
  "data/auricular/gb93_worklist.js",
]) {
  new Function(fs.readFileSync(path.join(ROOT, rel), "utf8"))();
}

// --- 2. Stub browser environment -----------------------------------------
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

// --- 3. Evaluate app.js and capture the embedded arrays -------------------
const EXPORTS = [
  "starterPoints",
  "professionalPoints",
  "lungMeridianExpansion",
  "largeIntestineMeridianExpansion",
  "stomachMeridianExpansion",
  "spleenMeridianExpansion",
  "heartMeridianExpansion",
  "smallIntestineMeridianExpansion",
  "bladderMeridianExpansion",
  "kidneyMeridianExpansion",
  "auricularPoints",
  "locationEnglishByCode",
  "anatomyGlossary",
  "functionEnglishMap",
  "patternEnglishMap",
];

const source = fs.readFileSync(APP_SOURCE, "utf8");
const body = source + `\n;return { ${EXPORTS.join(", ")} };`;

let captured;
try {
  const run = new Function(
    "document", "window", "localStorage", "location",
    "alert", "confirm", "requestAnimationFrame", body
  );
  captured = run(
    documentStub, windowStub, localStorageStub, locationStub,
    () => {}, () => true, () => 0
  );
} catch (err) {
  console.error("Failed to evaluate legacy/app.js:", err);
  process.exit(1);
}

// --- 4. Sanity-check: JSON-safe only --------------------------------------
function assertJsonSafe(value, trail) {
  if (value === null) return;
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean") return;
  if (t === "function" || t === "undefined") {
    throw new Error(`Non-JSON value (${t}) at ${trail}`);
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => assertJsonSafe(v, `${trail}[${i}]`));
    return;
  }
  for (const [k, v] of Object.entries(value)) assertJsonSafe(v, `${trail}.${k}`);
}
for (const name of EXPORTS) assertJsonSafe(captured[name], name);

// --- 5. Write JSON files ---------------------------------------------------
const FILE_MAP = {
  starterPoints: "data/acupoints/embedded/starter_points.json",
  professionalPoints: "data/acupoints/embedded/professional_points.json",
  lungMeridianExpansion: "data/acupoints/embedded/meridian_lu.json",
  largeIntestineMeridianExpansion: "data/acupoints/embedded/meridian_li.json",
  stomachMeridianExpansion: "data/acupoints/embedded/meridian_st.json",
  spleenMeridianExpansion: "data/acupoints/embedded/meridian_sp.json",
  heartMeridianExpansion: "data/acupoints/embedded/meridian_ht.json",
  smallIntestineMeridianExpansion: "data/acupoints/embedded/meridian_si.json",
  bladderMeridianExpansion: "data/acupoints/embedded/meridian_bl.json",
  kidneyMeridianExpansion: "data/acupoints/embedded/meridian_ki.json",
  auricularPoints: "data/auricular/embedded/auricular_points.json",
};

fs.mkdirSync(path.join(ROOT, "data/acupoints/embedded"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "data/auricular/embedded"), { recursive: true });

const summary = {};
for (const [name, rel] of Object.entries(FILE_MAP)) {
  fs.writeFileSync(path.join(ROOT, rel), JSON.stringify(captured[name], null, 2) + "\n");
  summary[name] = Array.isArray(captured[name])
    ? captured[name].length
    : Object.keys(captured[name]).length;
}

const i18n = {
  locationEnglishByCode: captured.locationEnglishByCode,
  anatomyGlossary: captured.anatomyGlossary,
  functionEnglishMap: captured.functionEnglishMap,
  patternEnglishMap: captured.patternEnglishMap,
};
fs.writeFileSync(
  path.join(ROOT, "data/acupoints/embedded/i18n_maps.json"),
  JSON.stringify(i18n, null, 2) + "\n"
);
for (const k of Object.keys(i18n)) summary[k] = Object.keys(i18n[k]).length;

console.log("Extraction complete:");
for (const [k, v] of Object.entries(summary)) console.log(`  ${k}: ${v} records`);
