const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");

const failures = [];
const warnings = [];

function unique(values) {
  return [...new Set(values)];
}

function fail(message, details = []) {
  failures.push({ message, details });
}

function warn(message, details = []) {
  warnings.push({ message, details });
}

function matches(pattern, text = html) {
  return [...text.matchAll(pattern)];
}

const ids = new Set(matches(/id="([^"]+)"/g).map((match) => match[1]));
const hrefs = matches(/href="#([^"]+)"/g)
  .map((match) => match[1])
  .filter((target) => target && !target.startsWith("point/"));

const missingHashTargets = unique(hrefs.filter((target) => !ids.has(target)));
if (missingHashTargets.length) {
  fail("Internal hash links must point to existing IDs.", missingHashTargets);
}

const topicLinks = matches(/data-directory-topic-link="([^"]+)"/g).map((match) => match[1]);
const topicIds = matches(/id: "([^"]+)"/g, js).map((match) => match[1]);
const missingTopicIds = unique(topicLinks.filter((topic) => !topicIds.includes(topic)));
if (missingTopicIds.length) {
  fail("Directory topic shortcuts must point to known app.js topic IDs.", missingTopicIds);
}
if (topicLinks.length && !js.includes("[data-directory-topic-link]")) {
  fail("Directory topic shortcuts exist, but app.js has no handler.");
}

const staleSearchShortcuts = matches(/data-library-search="([^"]+)"/g).map((match) => match[1]);
if (staleSearchShortcuts.length) {
  fail("data-library-search shortcuts were removed from the IA; use real navigation or data-directory-topic-link instead.", staleSearchShortcuts);
}

const caseWorkspaceCards = matches(/<a class="patient-action-card" href="#caseWorkspace"(?: id="([^"]+)")?/g)
  .map((match) => match[1] || "missing-id");
const cardsWithoutHandlers = caseWorkspaceCards.filter((id) => id === "missing-id" || !js.includes(`#${id}`));
if (cardsWithoutHandlers.length) {
  fail("Patient action cards targeting #caseWorkspace must have an ID and a JS handler.", cardsWithoutHandlers);
}

const removedSectionIds = ["publicArchitecture", "tungZoneSection"];
const resurrectedSections = removedSectionIds.filter((id) => ids.has(id));
if (resurrectedSections.length) {
  fail("Removed duplicate planning sections should not be reintroduced.", resurrectedSections);
}

const stalePlanningLinks = matches(/href="#(publicArchitecture|tungZoneSection)"/g).map((match) => match[0]);
if (stalePlanningLinks.length) {
  fail("Links to removed planning sections must be updated to #systemRoadmap or a real module.", stalePlanningLinks);
}

const requiredPointDetailHooks = [
  "function isPointDetailMode",
  "function clearPointDetailHash",
  "function pointHash",
  "backToDirectoryBtn",
  "copyPointLinkBtn"
];
const missingPointHooks = requiredPointDetailHooks.filter((hook) => !js.includes(hook));
if (missingPointHooks.length) {
  fail("Individual acupoint page hooks must remain present.", missingPointHooks);
}

const requiredFilterStateHooks = [
  "activeFilterSummary",
  "function renderActiveFilterSummary",
  "function clearActiveFilter",
  "data-clear-filter"
];
const missingFilterStateHooks = requiredFilterStateHooks.filter((hook) => !html.includes(hook) && !js.includes(hook));
if (missingFilterStateHooks.length) {
  fail("Acupoint directory filters must expose visible, clearable active-filter state.", missingFilterStateHooks);
}

const clickableCards = matches(/<a class="([^"]*(?:library-card|roadmap-card|patient-action-card)[^"]*)" href="#([^"]+)"/g)
  .map((match) => ({ className: match[1], target: match[2] }));
const suspiciousCards = clickableCards.filter((card) => {
  if (card.target.startsWith("point/")) return false;
  return !ids.has(card.target);
});
if (suspiciousCards.length) {
  fail("Clickable cards must navigate to existing targets.", suspiciousCards.map((card) => `${card.className} -> #${card.target}`));
}

const selfReferentialCards = clickableCards.filter((card) => /Anchor$/.test(card.target));
if (selfReferentialCards.length) {
  warn("Anchor-only card targets should usually be promoted to real sections.", selfReferentialCards.map((card) => `${card.className} -> #${card.target}`));
}

const summary = {
  internalHashLinks: hrefs.length,
  ids: ids.size,
  directoryTopicShortcuts: topicLinks,
  patientCaseActions: caseWorkspaceCards,
  clickableCards: clickableCards.length,
  warnings: warnings.length,
  failures: failures.length
};

if (warnings.length) {
  console.warn("Interaction audit warnings:");
  for (const item of warnings) {
    console.warn(`- ${item.message}`);
    for (const detail of item.details) console.warn(`  - ${detail}`);
  }
}

if (failures.length) {
  console.error("Interaction audit failed:");
  for (const item of failures) {
    console.error(`- ${item.message}`);
    for (const detail of item.details) console.error(`  - ${typeof detail === "string" ? detail : JSON.stringify(detail)}`);
  }
  console.error(JSON.stringify(summary, null, 2));
  process.exit(1);
}

console.log("Interaction audit passed.");
console.log(JSON.stringify(summary, null, 2));
