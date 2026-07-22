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
const hosts = Object.fromEntries([
  "conditionRecords", "conditionFilter", "conditionGrid",
  "cloudtcmDiseaseFilter", "cloudtcmDiseaseCategoryBar", "cloudtcmDiseaseGrid",
  "cloudtcmDiseasePageStatus", "cloudtcmDiseasePrev", "cloudtcmDiseaseNext"
].map((id) => [
  id,
  {
    innerHTML: "",
    textContent: "",
    value: "",
    disabled: false,
    listeners: {},
    addEventListener(type, handler) { this.listeners[type] = handler; },
    querySelectorAll() { return []; }
  }
]));
const documentStub = {
  addEventListener() {},
  getElementById(id) { return hosts[id] || null; },
  querySelector() { return null; },
  createElement() { return { addEventListener() {}, querySelector() { return null; } }; },
  body: { appendChild() {} }
};

new Function(fs.readFileSync(path.join(ROOT, "data/generated/knowledge_data.js"), "utf8"))();
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
if (!initialMarkup.includes("Disease & Symptom Index (190)")) errors.push("CloudTCM disease directory was not mounted");

if (hosts.cloudtcmDiseaseFilter.listeners.input) {
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
