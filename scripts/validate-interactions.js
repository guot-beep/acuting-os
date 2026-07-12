const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const uiConfigPath = path.join(root, "data", "config", "ui_config.json");
const uiConfig = fs.existsSync(uiConfigPath)
  ? JSON.parse(fs.readFileSync(uiConfigPath, "utf8"))
  : {};

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
  .filter((target) => target && !target.startsWith("point/") && !target.startsWith("ws/"));

const missingHashTargets = unique(hrefs.filter((target) => !ids.has(target)));
if (missingHashTargets.length) {
  fail("Internal hash links must point to existing IDs.", missingHashTargets);
}

const workspaceRoutes = matches(/href="#(ws\/[^"]+)"/g).map((match) => match[1]);
if (workspaceRoutes.length) {
  const routerPath = path.join(root, "js", "router.js");
  if (!fs.existsSync(routerPath)) {
    fail("Workspace routes require js/router.js.", workspaceRoutes);
  } else {
    const routerJs = fs.readFileSync(routerPath, "utf8");
    const missingRouterHooks = ["#ws/", "data-workspace"].filter((hook) => !routerJs.includes(hook));
    if (missingRouterHooks.length) {
      fail("Workspace router must understand #ws routes and data-workspace sections.", missingRouterHooks);
    }
  }
}

const topicLinks = matches(/data-directory-topic-link="([^"]+)"/g).map((match) => match[1]);
const topicIds = [
  ...matches(/id: "([^"]+)"/g, js).map((match) => match[1]),
  ...((uiConfig.directoryTopics || []).map((topic) => topic.id).filter(Boolean))
];
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

const removedSectionClasses = ["public-architecture", "tung-zone-section"];
const resurrectedSectionClasses = removedSectionClasses.filter((className) => html.includes(className) || css.includes(className));
if (resurrectedSectionClasses.length) {
  fail("Removed duplicate planning section classes should not remain in markup or CSS.", resurrectedSectionClasses);
}

const stalePlanningLinks = matches(/href="#(publicArchitecture|tungZoneSection)"/g).map((match) => match[0]);
if (stalePlanningLinks.length) {
  fail("Links to removed planning sections must be updated to #systemRoadmap or a real module.", stalePlanningLinks);
}

const requiredTargetContextHooks = [
  ":target",
  "scroll-margin-top",
  ".case-workspace:target",
  ".search-panel:target"
];
const missingTargetContextHooks = requiredTargetContextHooks.filter((hook) => !css.includes(hook));
if (missingTargetContextHooks.length) {
  fail("Hash-jump destinations must provide visible target context and top offset.", missingTargetContextHooks);
}

const requiredQuicknavTargets = [
  "formulaSchema",
  "formulaCategories",
  "formulaSafety",
  "formulaProgress",
  "conditionLayers",
  "conditionGraphRule",
  "sourceEnglish",
  "sourceChinese",
  "sourceAuricular",
  "sourceCore",
  "caseToolbar",
  "caseListPanel",
  "caseDetail"
];
const missingQuicknavTargets = requiredQuicknavTargets.filter((id) => !ids.has(id));
if (missingQuicknavTargets.length) {
  fail("Dense modules must expose precise quick-navigation anchors.", missingQuicknavTargets);
}

const sectionQuicknavCount = matches(/class="section-quicknav"/g).length;
if (sectionQuicknavCount < 4) {
  fail("Formula, Condition, Sources, and Case Workspace should each have a section quicknav.", [`found ${sectionQuicknavCount}`]);
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

const staticActiveModuleChips = matches(/<a class="[^"]*\blibrary-chip\b[^"]*\bactive\b[^"]*"/g).map((match) => match[0]);
if (staticActiveModuleChips.length) {
  fail("Module navigation chips must not hard-code active state; app.js should derive active state from the current hash.", staticActiveModuleChips);
}

const requiredModuleNavigationHooks = [
  "function updateModuleNavigation",
  "function activeModuleTarget",
  "aria-current"
];
const missingModuleNavigationHooks = requiredModuleNavigationHooks.filter((hook) => !js.includes(hook));
if (missingModuleNavigationHooks.length) {
  fail("Main module chips must have dynamic active-state handling.", missingModuleNavigationHooks);
}

const requiredPointCardHooks = [
  "data-point-card",
  "role\", \"button\"",
  "Open point page",
  "開啟單穴頁",
  "event.preventDefault();",
  ".card-action-row",
  ".card:focus-visible"
];
const missingPointCardHooks = requiredPointCardHooks.filter((hook) => !html.includes(hook) && !js.includes(hook) && !css.includes(hook));
if (missingPointCardHooks.length) {
  fail("Acupoint cards must behave and read as real point-page actions.", missingPointCardHooks);
}

const requiredRelatedPointHooks = [
  "function relatedPointButton",
  "related-point-action",
  "related-point-open",
  "pairing-action-label",
  "data-related-point",
  "Open point page",
  "開啟單穴頁"
];
const missingRelatedPointHooks = requiredRelatedPointHooks.filter((hook) => !html.includes(hook) && !js.includes(hook) && !css.includes(hook));
if (missingRelatedPointHooks.length) {
  fail("Related-point controls must clearly navigate to another single-point page.", missingRelatedPointHooks);
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
