#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const readJson = (relativePath) => JSON.parse(
  fs.readFileSync(path.join(ROOT, relativePath), "utf8")
);

const canon = readJson("data/pathology/condition_canon_shortlist.json");
const errors = [];
const seenIds = new Set();
let linkCount = 0;
let recordsWithSources = 0;

// `sources` is the only canonical source field (docs/CONDITION_CARD_TEMPLATE.md
// §3.4 — "只用 sources"). `source_links` was a one-off drift field (C7) that
// got folded into `sources` by scripts/fix-condition-pattern-mechanical.js;
// no condition record has used `source_links` since. Unlike the old link-object
// shape (url/source_id/label_zh/label_en/relation_type), `sources` is a flat
// array of strings — a bare URL, or a "Label: URL" citation, or (for board/
// curriculum references) plain text with no URL at all. There is no per-entry
// source_id/bilingual-label/relation_type metadata in this shape, so those
// checks don't carry over; what does carry over is the actual intent (condition
// records should cite sources, and any URL they cite should be https and not a
// Google search link).
for (const record of canon.records || []) {
  if (!record.id || seenIds.has(record.id)) errors.push(`Duplicate or missing condition id: ${record.id || "(empty)"}`);
  seenIds.add(record.id);

  const sources = record.sources || [];
  if (!sources.length) continue;
  linkCount += sources.length;
  recordsWithSources += 1;

  for (const entry of sources) {
    const urlMatch = /https?:\/\/\S+/.exec(entry || "");
    if (!urlMatch) continue; // plain-text citation (curriculum file, board-scope anchor) — no URL to check
    const url = urlMatch[0];
    if (!/^https:\/\//.test(url)) errors.push(`${record.id}: source link must use https: ${url}`);
    if (/google\./i.test(url)) errors.push(`${record.id}: Google links are not allowed: ${url}`);
  }
}

const dyspepsia = (canon.records || []).find((record) => record.id === "cond.functional_dyspepsia");
if (!dyspepsia) {
  errors.push("Missing cond.functional_dyspepsia");
} else {
  const sources = dyspepsia.sources || [];
  for (const expected of [
    "https://cloudtcm.com/disease/tcm/28325",
    "https://www.niddk.nih.gov/health-information/digestive-diseases/indigestion-dyspepsia"
  ]) {
    if (!sources.some((entry) => (entry || "").includes(expected))) errors.push(`cond.functional_dyspepsia: missing exact source ${expected}`);
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
  const sources = trigeminal.sources || [];
  for (const expected of [
    "https://cloudtcm.com/disease/tcm/36",
    "https://www.nhs.uk/conditions/trigeminal-neuralgia/"
  ]) {
    if (!sources.some((entry) => (entry || "").includes(expected))) errors.push(`cond.trigeminal_neuralgia: missing exact source ${expected}`);
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

// 分片載入走共用 lib；js/knowledge.js 稍後在本行程 eval，讀的是真 globalThis，
// 所以把合流結果掛上去。讀不到 = 大聲失敗（維持原本 ENOENT 的響度），
// 絕不讓這支變成 vacuous pass。
{
  const K = require("./lib/load-knowledge.js").loadKnowledge();
  if (!K) { console.error("validate-condition-sources: 知識分片載入失敗 — 先跑 node scripts/build-data.js"); process.exit(1); }
  globalThis.ACUTING_KNOWLEDGE = K;
}
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

// RETIRED (architecture call, not a fix-it-later skip): this block used to
// assert that hosts.conditionRecords.innerHTML already contained the
// Dyspepsia/Trigeminal card markup right after boot, before any search was
// simulated. That assumption predates the mobile lazy-render change
// (commit e73095d4), which deliberately made condition cards render on
// demand rather than on page load — so `initialMarkup` here is boot-time
// DOM, and asserting it contains rendered card content fails permanently and
// tells us nothing about the app. The search-first pattern lower in this
// file (simulate the search input event, then assert against the post-search
// DOM) is the correct shape for testing render output under lazy-render, and
// already exercises the same "does the condition surface actually show up"
// intent this block was going for. Deleted rather than skip-with-note (unlike
// the CloudTCM block below) because lazy-render is a permanent, deliberate
// architecture decision, not a feature that might come back.
const initialMarkup = hosts.conditionRecords.innerHTML;

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
console.log(`- direct sources entries: ${linkCount}`);
console.log(`- records with at least one source: ${recordsWithSources}`);
console.log("- Dyspepsia/Trigeminal exact sources + Dyspepsia search: PASS");
