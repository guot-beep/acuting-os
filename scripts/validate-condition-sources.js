#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(ROOT, relativePath), "utf8")
);

const canon = readJson("data/pathology/condition_canon_shortlist.json");
const registry = readJson("data/sources/source_registry.json");
const sourceIds = new Set((registry.sources || []).map((source) => source.id));
const errors = [];
const seenIds = new Set();
let linkCount = 0;
let bilingualRecords = 0;

for (const record of canon.records || []) {
  if (!record.id || seenIds.has(record.id)) errors.push(`Duplicate or missing condition id: ${record.id || "(empty)"}`);
  seenIds.add(record.id);

  const links = record.source_links || [];
  if (!links.length) continue;
  linkCount += links.length;
  const languages = new Set();

  for (const link of links) {
    if (!/^https:\/\//.test(link.url || "")) errors.push(`${record.id}: source link must use https: ${link.url || "(empty)"}`);
    if (/google\./i.test(link.url || "")) errors.push(`${record.id}: Google links are not allowed: ${link.url}`);
    if (!sourceIds.has(link.source_id)) errors.push(`${record.id}: unknown source_id ${link.source_id}`);
    if (!link.label_zh || !link.label_en) errors.push(`${record.id}: source link needs bilingual labels`);
    if (!link.relation_type) errors.push(`${record.id}: source link needs relation_type`);
    languages.add(link.language);
  }

  if (languages.has("zh-Hant") && languages.has("en")) bilingualRecords += 1;
}

const dyspepsia = (canon.records || []).find((record) => record.id === "cond.functional_dyspepsia");
if (!dyspepsia) {
  errors.push("Missing cond.functional_dyspepsia");
} else {
  const urls = new Set((dyspepsia.source_links || []).map((link) => link.url));
  for (const expected of [
    "https://cloudtcm.com/disease/tcm/28325",
    "https://www.niddk.nih.gov/health-information/digestive-diseases/indigestion-dyspepsia"
  ]) {
    if (!urls.has(expected)) errors.push(`cond.functional_dyspepsia: missing exact source ${expected}`);
  }
  if (!(dyspepsia.related_tcm_symptoms || []).some((item) =>
    item.name_zh === "上腹胃脘痛" && item.relation_type === "related"
  )) {
    errors.push("cond.functional_dyspepsia: 上腹胃脘痛 must remain a related symptom, not an exact mapping");
  }
}

const trigeminal = (canon.records || []).find((record) => record.id === "cond.trigeminal_neuralgia");
if (!trigeminal) {
  errors.push("Missing cond.trigeminal_neuralgia");
} else {
  const urls = new Set((trigeminal.source_links || []).map((link) => link.url));
  for (const expected of [
    "https://cloudtcm.com/disease/tcm/36",
    "https://www.nhs.uk/conditions/trigeminal-neuralgia/"
  ]) {
    if (!urls.has(expected)) errors.push(`cond.trigeminal_neuralgia: missing exact source ${expected}`);
  }
  if (trigeminal.name_en !== "Trigeminal Neuralgia" || trigeminal.name_zh !== "三叉神經痛") {
    errors.push("cond.trigeminal_neuralgia: bilingual canonical names changed unexpectedly");
  }
}

// Render the real condition section against a tiny DOM contract. This catches
// data that validates but never becomes visible because the static app uses a
// generated JS bundle rather than fetching JSON at runtime.
//
// The bootstrap code in js/knowledge.js calls document.getElementById() on
// whatever ids its current UI wires up, and that list grows over time as the
// UI grows (e.g. "dxTypeBar" was added after this stub was last hand-listed,
// which crashed getElementById("dxTypeBar").addEventListener(...) on a bare
// null). Hand-listing ids here is a standing trap: every new UI control is
// another silent crash waiting to happen. Instead, `hosts` auto-vivifies an
// inert stub for ANY id on first lookup, so the eval'd bootstrap can wire up
// listeners on elements this validator doesn't otherwise care about, while
// the ids this validator DOES assert against (conditionRecords,
// cloudtcmDiseaseGrid, etc.) still resolve to the same cached object the
// assertions read afterwards.
function makeDomStub() {
  return {
    innerHTML: "",
    textContent: "",
    value: "",
    disabled: false,
    style: {},
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    listeners: {},
    addEventListener(type, handler) { this.listeners[type] = handler; },
    removeEventListener() {},
    setAttribute() {},
    getAttribute() { return null; },
    appendChild() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    options: [],
    children: [],
    parentElement: null,
    closest() { return null; },
    remove() {},
    cloneNode() { return makeDomStub(); },
    scrollIntoView() {},
    focus() {},
    blur() {},
    click() {}
  };
}
const hosts = {};
const documentStub = {
  addEventListener() {},
  getElementById(id) {
    if (!hosts[id]) hosts[id] = makeDomStub();
    return hosts[id];
  },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElement() { return makeDomStub(); },
  body: makeDomStub()
};

new Function(fs.readFileSync(path.join(ROOT, "data/generated/knowledge_data.js"), "utf8"))();
// js/knowledge.js reads `contentMode` as a free variable — in the real app it
// is `let contentMode = ...` at the top level of app.js, which in a browser
// becomes a global lexical binding shared with sibling <script> tags like
// knowledge.js. app.js is not evaluated here, so that binding does not exist;
// seed it as a real global so the eval below resolves it the same way the
// browser's shared script scope would, defaulting to app.js's own default.
global.contentMode = "bilingual";
// Same reasoning as `document`/`contentMode` above: the browser gives every
// script tag a real `window`, so the eval'd bootstrap reaches for it (hash
// routing listeners, etc.) even though this validator only stubs `document`.
global.window = {
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() {},
  location: { hash: "" },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }
};
new Function("document", fs.readFileSync(path.join(ROOT, "js/knowledge.js"), "utf8"))(documentStub);

const initialMarkup = hosts.conditionRecords.innerHTML;
for (const expected of [
  "功能性消化不良",
  "Functional Dyspepsia",
  "上腹胃脘痛",
  "https://cloudtcm.com/disease/tcm/28325",
  "https://www.niddk.nih.gov/health-information/digestive-diseases/indigestion-dyspepsia"
]) {
  if (!initialMarkup.includes(expected)) errors.push(`Rendered condition card is missing: ${expected}`);
}
for (const expected of [
  "三叉神經痛",
  "Trigeminal Neuralgia",
  "https://cloudtcm.com/disease/tcm/36",
  "https://www.nhs.uk/conditions/trigeminal-neuralgia/"
]) {
  if (!initialMarkup.includes(expected)) errors.push(`Rendered trigeminal-neuralgia card is missing: ${expected}`);
}
if (/google\./i.test(initialMarkup)) errors.push("Rendered condition cards contain a Google link");

// The CloudTCM disease-directory browser this block used to assert against
// (cloudtcmDiseaseFilter/Grid/CategoryBar/PageStatus/Prev/Next, "Disease &
// Symptom Index (190)") no longer exists anywhere in js/knowledge.js or
// index.html. js/knowledge.js documents why, in the copy it renders next to
// cloudtcmRefMap: the directory was "dissolved" — its entries redistributed
// onto condition/symptom cards and formula/herb source links — and it "no
// longer has a classification of its own." This validator predates that
// change and was never updated, so it hard-crashed on a null element instead
// of failing meaningfully (`hosts.cloudtcmDiseaseFilter` is never populated
// because nothing in the app calls getElementById for that id anymore).
//
// Rather than assert pass/fail against a UI surface that was intentionally
// removed, this skips with a note when the surface is absent, and still runs
// the original assertions if it's ever reintroduced. Whether to retire this
// block for good (recommended — the dissolution looks deliberate) or replace
// it with an assertion against wherever the dissolved content now lives is
// an architecture call, not something to guess at here.
if (initialMarkup.includes("Disease & Symptom Index (190)") || hosts.cloudtcmDiseaseFilter) {
  if (hosts.cloudtcmDiseaseFilter && hosts.cloudtcmDiseaseFilter.listeners.input) {
    hosts.cloudtcmDiseaseFilter.value = "Trigeminal Neuralgia";
    hosts.cloudtcmDiseaseFilter.listeners.input({ target: hosts.cloudtcmDiseaseFilter });
    for (const expected of [
      "cloudtcm.disease_entry.36",
      "Trigeminal Neuralgia",
      "https://cloudtcm.com/disease/tcm/36"
    ]) {
      if (!hosts.cloudtcmDiseaseGrid.innerHTML.includes(expected)) {
        errors.push(`CloudTCM disease search is missing: ${expected}`);
      }
    }
  } else {
    errors.push("CloudTCM disease search input handler was not mounted");
  }
} else {
  console.log("- CloudTCM disease directory: SKIPPED (feature dissolved per js/knowledge.js; see comment above — retire-vs-fix decision needed)");
}

if (hosts.conditionFilter.listeners.input) {
  hosts.conditionFilter.listeners.input({ target: { value: "Dyspepsia" } });
  if (!hosts.conditionGrid.innerHTML.includes("cond.functional_dyspepsia")) {
    errors.push("Condition search does not find Dyspepsia");
  }
} else {
  errors.push("Condition search input handler was not mounted");
}

if (errors.length) {
  console.error(`Condition source validation FAILED (${errors.length})`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Condition source validation PASS");
console.log(`- condition ids: ${seenIds.size}`);
console.log(`- direct source links: ${linkCount}`);
console.log(`- records with Chinese + English sources: ${bilingualRecords}`);
console.log("- rendered Dyspepsia card and search: PASS");
