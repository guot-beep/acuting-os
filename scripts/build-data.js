#!/usr/bin/env node
/**
 * build-data.js
 *
 * Builds data/generated/app_data.js from the JSON source-of-truth files.
 * The app is a static site (no fetch for local files), so JSON must be
 * wrapped into a .js file loaded via <script> before app.js.
 *
 * RULE: humans and agents edit data/**.json only.
 *       data/generated/* is machine-written. Never edit it by hand.
 *
 * Usage: node scripts/build-data.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const SOURCES = {
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
const I18N_SOURCE = "data/acupoints/embedded/i18n_maps.json";

const payload = {};
for (const [name, rel] of Object.entries(SOURCES)) {
  payload[name] = JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}
const i18n = JSON.parse(fs.readFileSync(path.join(ROOT, I18N_SOURCE), "utf8"));
Object.assign(payload, i18n);

const banner = `// GENERATED FILE - DO NOT EDIT.
// Built by scripts/build-data.js on ${new Date().toISOString()}
// Source of truth: data/acupoints/embedded/*.json, data/auricular/embedded/*.json
`;
const out = banner + "globalThis.ACUTING_APP_DATA = " + JSON.stringify(payload) + ";\n";

fs.mkdirSync(path.join(ROOT, "data/generated"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "data/generated/app_data.js"), out);

const counts = Object.fromEntries(
  Object.entries(payload).map(([k, v]) => [k, Array.isArray(v) ? v.length : Object.keys(v).length])
);
console.log("Built data/generated/app_data.js");
console.log(JSON.stringify(counts, null, 2));
