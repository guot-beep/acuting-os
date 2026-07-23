const STORAGE_KEY = "acupoint-atlas-v1";
const CASE_STORAGE_KEY = "acuting-clinical-cases-v1";
const CONTENT_MODE_KEY = "acuting-content-mode-v1";
// CS1: clinical cases live only in localStorage until the durable store lands
// (NORTH_STAR §H2). Until then, export discipline is the only backup. This
// meta tracks the last export + saves since, to nudge before data is lost.
const BACKUP_META_KEY = "acuting-backup-meta-v1";
const BACKUP_STALE_DAYS = 7;
const BACKUP_NUDGE_EVERY = 10;
// LL2: per-visit outcome verdict. no_change/worsened feed the "cases to learn
// from" review — error cases (誤案) teach more than successes.
const OUTCOME_VERDICTS = {
  improved: { zh: "改善", en: "Improved", tone: "good" },
  no_change: { zh: "無變化", en: "No change", tone: "watch" },
  worsened: { zh: "加重", en: "Worsened", tone: "watch" },
  lost_followup: { zh: "失訪", en: "Lost to follow-up", tone: "muted" },
};
const LEARN_FROM_VERDICTS = ["no_change", "worsened"];
let learnFromMode = false;

// Data-load guard: the app is data-driven; if the generated data file did not
// load (OneDrive not synced, file missing, 404), fail LOUDLY instead of
// silently degrading to placeholder-only content.
(function dataLoadGuard() {
  const missing = [];
  if (!globalThis.ACUTING_APP_DATA) missing.push("data/generated/app_data.js");
  if (!globalThis.ACUTING_POINTS_361) missing.push("data/generated/points_361.js");
  if (!missing.length) return;
  const banner = document.createElement("div");
  banner.className = "data-missing-banner";
  banner.textContent = `⚠ 資料檔未載入：${missing.join("、")} 沒有被讀到，穴位內容會大量缺失。請確認專案檔案已完整同步到本機後按 Ctrl+F5 重新整理。`;
  document.body.prepend(banner);
})();


const uiConfig = globalThis.ACUTING_APP_DATA?.uiConfig || {};
const standardChannelAudit = uiConfig.standardChannelAudit || { generatedOn: "", expectedTotal: 0, nextRecommendedBatch: "", channels: [] };
const channelPrefixMeta = uiConfig.channelPrefixMeta || {};
const auricularZonePositions = uiConfig.auricularZonePositions || {};

function hydrateRegexMatch(item) {
  const { matchPattern, matchFlags, ...rest } = item;
  return matchPattern ? { ...rest, match: new RegExp(matchPattern, matchFlags || "") } : rest;
}

const directoryTopicMatchers = {
  needs_review: (point) => point.reviewStatus === "placeholder" || point.reviewStatus === "index_only",
  tung_index: (point) => String(point.meridian || "").includes("Master Tung"),
  auricular_index: (point) => isAuricularPoint(point),
  auricular_gb93_draft: (point) => /^(HX|AH|SC|TF|TG|AT|CO|LO)\d+/i.test(point.code) && point.reviewStatus !== "source_checked",
  missing_english_location: (point) => isPendingContent(point.locationEn),
  missing_technique: (point) => isMissingTechnique(point),
  missing_safety: (point) => isPendingContent(point.cautions),
  missing_indications: (point) => isMissingIndications(point),
  missing_sources: (point) => !(point.sources || []).length,
  missing_visual: (point) => normalizeVisualLinks(point.visualLinks || []).length === 0
};

function hydrateDirectoryTopic(topic) {
  const { matchType, ...rest } = topic;
  return matchType && directoryTopicMatchers[matchType] ? { ...rest, match: directoryTopicMatchers[matchType] } : rest;
}

const directoryRegionGroups = (uiConfig.directoryRegionGroups || []).map(hydrateRegexMatch);
const directoryTopics = (uiConfig.directoryTopics || []).map(hydrateDirectoryTopic);
const earAnatomyLabelData = uiConfig.earAnatomyLabelData || [];
const earPointAnchors = uiConfig.earPointAnchors || {};

// PC5: 特定穴 category vocabulary (labels for detail badges + directory filter).
const pointCategoryCatalog = globalThis.ACUTING_APP_DATA?.pointCategoryVocabulary?.categories || [];
const pointCategoryLabelById = new Map(pointCategoryCatalog.map((c) => [c.id, c]));

// standardPointPlaceholder() was removed with the Phase 2 runtime adapter:
// the 361 layer is complete, so placeholder records are never generated.
// (Old placeholder stubs saved in localStorage are dropped by
// reconcileSavedPoints() below.)

// Phase 2 runtime adapter: data/acupoints/361.json (loaded via generated
// points_361.js) is the single runtime source for the 14 standard channels.
// The embedded standard-channel arrays are retired from the runtime merge —
// see docs/RUNTIME_ADAPTER_SPEC.md. Auricular / GB93 / Tung pipelines are
// unchanged.
// `needling` in 361.json is a string on 354 records and a structured object
// ({depth, angle, technique, moxibustion}) on 7 (BL61-BL67, encoding-backlog
// records). Render whatever text exists faithfully; never invent content.
function needling361Text(needling) {
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

function adapt361Record(record) {
  const prefix = channelCodeFromPointCode(record.code);
  const meta = channelPrefixMeta[prefix] || { meridian: "Standard Channel / 標準經穴", region: "待補", x: 180, y: 320 };
  // Safety wording law: every contraindication and danger line must remain
  // visible in the runtime cautions text.
  const cautionLines = [...new Set([...(record.contraindications || []), ...(record.cautions || [])])];
  const dangerLines = record.danger || [];
  return {
    id: record.id || record.code,   // stable namespaced id (DECISIONS D2); clinical FKs reference this
    pointCategories: record.point_categories || [],   // PC4: 特定穴 tags
    fiveShuElement: record.five_shu_element || "",     // PC4: 五輸五行
    code: record.code,
    nameZh: record.chinese || record.code,
    nameEn: record.english || record.code,
    pinyin: record.pinyin || record.code,
    meridian: record.meridian_display || meta.meridian,
    region: record.region || meta.region,
    location: record.location_zh || "",
    locationEn: record.location_en || "",
    cunMeasurement: record.cun_measurement || "",
    anatomy: record.anatomy_terms || [],
    functions: (record.functions_zh || []).join("，"),
    functionsEn: (record.functions_en || []).join(" "),
    patterns: record.indications_zh || [],
    patternsEn: record.indications_en || [],
    evidence: record.evidence || "",
    cautions: [...cautionLines, ...dangerLines].join("\n"),
    techniqueNotes: needling361Text(record.needling),
    nccaomHighYield: record.nccaom_high_yield || [],
    clinicalPearls: record.clinical_pearls || [],
    acumethodZh: record.acumethod_zh || "",
    moxaZh: record.moxa_zh || "",
    modernResearchZh: record.modern_research_zh || record.cloudtcm_detail || "",
    combinePointsZh: record.combine_points_zh || "",
    anatomyZh: record.anatomy_zh || "",
    massageZh: record.massage_zh || "",
    classicalRefs: record.classical_refs || [],
    acuTags: record.acu_tags || [],
    cloudtcmUrl: record.cloudtcm_url || "",
    reviewStatus: record.review_status || "draft",
    sourceStatus: record.source_status || "sourced_cloudtcm_record",
    enrichmentStatus: record.enrichment_status || "",
    sources: record.sources || (record.cloudtcm_url ? [record.cloudtcm_url] : []),
    x: record.ui_map?.x ?? meta.x,
    y: record.ui_map?.y ?? meta.y
  };
}

const standardPoints361 = (globalThis.ACUTING_POINTS_361 || []).map(adapt361Record);

const tungIndexRecords = globalThis.ACUTING_TUNG_INDEX?.points || [];

function tungIndexPoint(record) {
  return {
    id: record.id || record.code,   // DECISIONS D2 namespaced id
    code: record.code,
    standardCode: record.display_code,
    nameZh: record.name_zh || record.name_en,
    nameEn: record.name_en,
    pinyin: record.pinyin || record.name_en,
    meridian: `Master Tung / 董氏奇穴`,
    region: `${record.zone_zh || record.zone_en} · ${record.region_zh || record.region_en}`,
    location: record.location_zh || "待依專業來源補入。",
    locationEn: record.location_en || "Pending source review.",
    cunMeasurement: "Pending source review.",
    functions: (record.traditional_functions_zh || ["待補"]).join("、"),
    functionsEn: record.traditional_functions_en || ["Pending source review"],
    patterns: record.indications_zh || ["待補"],
    patternsEn: record.indications_en || ["Pending source review"],
    evidence: "Master Tung index-only record created from the public eLotus/Master Tung navigation list. Location, indications, Dao Ma grouping, needling and safety remain pending source review.",
    cautions: (record.contraindications || []).join(" ") || "Index-only draft. Do not use clinically until source-checked.",
    reviewStatus: record.review_status || "index_only",
    sources: record.source_urls || ["https://www.mastertungacupuncture.org/"],
    visualLinks: tungPointVisualLinks(record),
    x: record.x || 180,
    y: record.y || 320
  };
}

const tungPointIndex = tungIndexRecords.map(tungIndexPoint);

const auricularGb93 = globalThis.ACUTING_AURICULAR_GB93 || {};
const auricularGb93Records = auricularGb93.points || [];
const auricularGb93Zones = auricularGb93.zones || {};
const auricularGb93Worklist = globalThis.ACUTING_AURICULAR_GB93_WORKLIST || {};
const auricularGb93NextBatch = auricularGb93Worklist.next_batch || [];



function auricularGb93Point(record) {
  const zone = auricularGb93Zones[record.zone] || {};
  const position = auricularZonePositions[record.zone] || { x: 178, y: 250 };
  const zoneLabelZh = zone.zh || record.zone || "耳廓";
  const zoneLabelEn = zone.en || record.zone || "Auricle";
  return {
    id: record.id || record.code,   // DECISIONS D2 namespaced id
    code: record.code,
    standardCode: record.code,
    nameZh: record.name_zh || record.code,
    nameEn: record.name_en || record.code,
    pinyin: record.pinyin || record.code,
    aliases: record.aliases_zh || record.aliases || [],
    meridian: "Auricular / 耳穴",
    region: "耳穴",
    standardRegion: `${zoneLabelZh} / ${zoneLabelEn}`,
    location: record.location_zh || `GB93 耳穴索引：${zoneLabelZh}區。待依專業來源補入精確定位。`,
    locationEn: record.location_en || `GB93 auricular index: ${zoneLabelEn}. Precise location pending source review.`,
    cunMeasurement: "Auricular regional point. Cun measurement is not used.",
    functions: (record.indications_zh || ["待校對"]).join("、"),
    functionsEn: record.indications_en || ["Pending source review"],
    patterns: record.indications_zh || ["待校對"],
    patternsEn: record.indications_en || ["Pending source review"],
    evidence: "GB/T 13734-2008 auricular index scaffold. Use this page as a navigation placeholder until location, indications, needling method and cautions are source-checked.",
    cautions: "Index-only draft. Do not use clinically until source-checked against auricular acupuncture references.",
    reviewStatus: record.review_status || "index_only",
    sources: record.source_urls || auricularGb93.sources || [],
    visualLinks: auricularPointVisualLinks(record.code),
    x: record.x || position.x,
    y: record.y || position.y
  };
}

const auricularGb93Index = auricularGb93Records.map(auricularGb93Point);

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const starterPoints = globalThis.ACUTING_APP_DATA?.starterPoints || [];

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const professionalPoints = globalThis.ACUTING_APP_DATA?.professionalPoints || [];

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const lungMeridianExpansion = globalThis.ACUTING_APP_DATA?.lungMeridianExpansion || [];

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const largeIntestineMeridianExpansion = globalThis.ACUTING_APP_DATA?.largeIntestineMeridianExpansion || [];

function standardPointSources(code) {
  return [`https://www.acupoints.org/${String(code).toLowerCase()}-acupuncture-point/`, "https://cloudtcm.com/acupoint"];
}

function standardPointVisualLinks(code) {
  const normalized = String(code || "").toLowerCase();
  return [
    {
      labelZh: "AcuPoints 英文定位圖",
      labelEn: "AcuPoints location image",
      url: `https://www.acupoints.org/${normalized}-acupuncture-point/`,
      source: "AcuPoints.org"
    },
    {
      labelZh: "CloudTCM 中文穴位圖",
      labelEn: "CloudTCM Chinese point page",
      url: "https://cloudtcm.com/acupoint",
      source: "CloudTCM"
    }
  ];
}

function auricularPointVisualLinks(code) {
  const normalized = String(code || "").toUpperCase();
  const links = [
    {
      labelZh: "GB93 耳穴定位圖",
      labelEn: "GB93 auricular point image",
      url: `https://acupun.site/point_list_Ear93GB.aspx?pointId=${encodeURIComponent(normalized)}`,
      source: "acupun.site"
    },
    {
      labelZh: "耳針療法總覽圖",
      labelEn: "Auricular therapy overview",
      url: "https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95",
      source: "A+醫學百科"
    }
  ];
  return links;
}

function tungPointVisualLinks(record = {}) {
  const stored = Array.isArray(record.visual_links) ? record.visual_links : [];
  const direct = stored.filter((link) => link && link.link_status === "direct" && /^https?:\/\//.test(link.url || ""));
  if (direct.length) {
    return direct.map((link) => ({
      labelZh: link.label_zh || record.name_zh || "Master Tung",
      labelEn: link.label_en || record.name_en || "Master Tung exact point page",
      url: link.url,
      source: link.source || "MasterTungAcupuncture.org"
    }));
  }
  const directSources = (record.source_urls || [])
    .filter((url) => /^https?:\/\//.test(url) && url !== "https://www.mastertungacupuncture.org/");
  if (directSources.length) {
    return directSources.map((url) => ({
      labelZh: record.name_zh || "Master Tung",
      labelEn: record.name_en || "Master Tung exact point page",
      url,
      source: "MasterTungAcupuncture.org"
    }));
  }
  return [];
}

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const stomachMeridianExpansion = globalThis.ACUTING_APP_DATA?.stomachMeridianExpansion || [];

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const spleenMeridianExpansion = globalThis.ACUTING_APP_DATA?.spleenMeridianExpansion || [];

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const heartMeridianExpansion = globalThis.ACUTING_APP_DATA?.heartMeridianExpansion || [];

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const smallIntestineMeridianExpansion = globalThis.ACUTING_APP_DATA?.smallIntestineMeridianExpansion || [];

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const bladderMeridianExpansion = globalThis.ACUTING_APP_DATA?.bladderMeridianExpansion || [];

function kidneyPoint({ code, nameZh, nameEn, pinyin, region, location, locationEn, cunMeasurement, functions, functionsEn, patterns, patternsEn, cautions, x, y }) {
  return {
    code,
    nameZh,
    nameEn,
    pinyin,
    meridian: "Kidney / 腎經",
    region,
    location,
    locationEn,
    cunMeasurement,
    functions,
    functionsEn,
    patterns,
    patternsEn,
    evidence: "Kidney channel draft record for AcuTing OS. Location and clinical notes should be cross-checked against WHO Standard Acupuncture Point Locations and professional textbooks before source_checked or public_ready status.",
    cautions: cautions || "Draft educational record. Avoid needling over local infection, wounds, severe vascular disease, or unclear anatomy; pregnancy, fertility treatment, anticoagulant use, and serious symptoms require qualified clinical supervision.",
    sources: standardPointSources(code),
    x,
    y
  };
}

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const kidneyMeridianExpansion = globalThis.ACUTING_APP_DATA?.kidneyMeridianExpansion || [];

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const locationEnglishByCode = globalThis.ACUTING_APP_DATA?.locationEnglishByCode || {};

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const anatomyGlossary = globalThis.ACUTING_APP_DATA?.anatomyGlossary || {};

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const functionEnglishMap = globalThis.ACUTING_APP_DATA?.functionEnglishMap || {};

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const patternEnglishMap = globalThis.ACUTING_APP_DATA?.patternEnglishMap || {};

// Migrated to data/: edit data/**/embedded/*.json, then run scripts/build-data.js
const auricularPoints = globalThis.ACUTING_APP_DATA?.auricularPoints || [];

// The embedded arrays stay loaded only to contribute records OUTSIDE the 361
// standard-channel scope (currently EX-HN3 印堂 and EX-HN5 太陽). Every
// standard-channel code now renders from the 361 layer.
const standard361Codes = new Set(standardPoints361.map((point) => point.code));
const embeddedExtraPoints = [starterPoints, professionalPoints, lungMeridianExpansion, largeIntestineMeridianExpansion, stomachMeridianExpansion, spleenMeridianExpansion, heartMeridianExpansion, smallIntestineMeridianExpansion, bladderMeridianExpansion, kidneyMeridianExpansion]
  .flat()
  .filter((point) => !standard361Codes.has(point.code));

const sourceByCode = Object.fromEntries(
  [...new Set([...Object.keys(locationEnglishByCode), ...defaultCodeList(standardPoints361, embeddedExtraPoints, auricularGb93Index, auricularPoints, tungPointIndex)])]
    .map((code) => [code, ["https://www.acupoints.org/", "https://cloudtcm.com/acupoint"]])
);

const auricularSupplementSources = [
  "https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95"
];

const defaultPoints = enrichPoints(mergeByCode(standardPoints361, embeddedExtraPoints, auricularGb93Index, auricularPoints, tungPointIndex));

let points = loadPoints();
let selectedCode = points[0]?.code || "";
let editingCode = null;
let clinicalCases = loadClinicalCases();
let selectedCaseId = clinicalCases[0]?.id || "";
let editingCaseId = null;
let editingSoapId = null;
let isSyncingPointHash = false;

const searchInput = document.querySelector("#searchInput");
const meridianFilter = document.querySelector("#meridianFilter");
const regionFilter = document.querySelector("#regionFilter");
const patternFilter = document.querySelector("#patternFilter");
const meridianCategoryList = document.querySelector("#meridianCategoryList");
const regionCategoryList = document.querySelector("#regionCategoryList");
const topicCategoryList = document.querySelector("#topicCategoryList");
const pointCategoryList = document.querySelector("#pointCategoryList");
const cardsEl = document.querySelector("#cards");
const detailCard = document.querySelector("#detailCard");
const bodyCanvas = document.querySelector("#bodyCanvas");
const modelStage = document.querySelector("#modelStage");
const modelLabels = document.querySelector("#modelLabels");
const earAnatomyLabels = document.querySelector("#earAnatomyLabels");
const modelRotate = document.querySelector("#modelRotate");
const modelReset = document.querySelector("#modelReset");
const viewTabs = [...document.querySelectorAll(".view-tab")];
const resultCount = document.querySelector("#resultCount");
const activeFilterSummaryEl = document.querySelector("#activeFilterSummary");
const moduleNavLinks = [...document.querySelectorAll(".library-strip .library-chip")];
const selectedCodeEl = document.querySelector("#selectedCode");
const standardCountEl = document.querySelector("#standardCount");
const missingCountEl = document.querySelector("#missingCount");
const acupunctureProgressEl = document.querySelector("#acupunctureProgress");
const caseProgressEl = document.querySelector("#caseProgress");
const caseCountEl = document.querySelector("#caseCount");
const auditGeneratedOnEl = document.querySelector("#auditGeneratedOn");
const healthStandardCountEl = document.querySelector("#healthStandardCount");
const healthMissingCountEl = document.querySelector("#healthMissingCount");
const healthCompletionPercentEl = document.querySelector("#healthCompletionPercent");
const healthNextBatchEl = document.querySelector("#healthNextBatch");
const healthNextTaskEl = document.querySelector("#healthNextTask");
const healthChannelListEl = document.querySelector("#healthChannelList");
const gb93NextBatchTextEl = document.querySelector("#gb93NextBatchText");
const gb93PromotionChecklistEl = document.querySelector("#gb93PromotionChecklist");
const gb93CandidateGridEl = document.querySelector("#gb93CandidateGrid");
const healthReviewedStandardEl = document.querySelector("#healthReviewedStandard");
const healthPlaceholderStandardEl = document.querySelector("#healthPlaceholderStandard");
const healthTungIndexEl = document.querySelector("#healthTungIndex");
const healthAuricularIndexEl = document.querySelector("#healthAuricularIndex");
const healthAuricularGb93CoverageEl = document.querySelector("#healthAuricularGb93Coverage");
const healthGb93WorklistEl = document.querySelector("#healthGb93Worklist");
const healthVisualCoverageEl = document.querySelector("#healthVisualCoverage");
const healthMissingEnglishLocationEl = document.querySelector("#healthMissingEnglishLocation");
const healthMissingTechniqueEl = document.querySelector("#healthMissingTechnique");
const healthMissingSafetyEl = document.querySelector("#healthMissingSafety");
const directoryTotalEl = document.querySelector("#directoryTotal");
const caseSearch = document.querySelector("#caseSearch");
const homeSearch = document.querySelector("#homeSearch");
const caseList = document.querySelector("#caseList");
const caseDetail = document.querySelector("#caseDetail");
const caseResultCount = document.querySelector("#caseResultCount");
const caseDialog = document.querySelector("#caseDialog");
const caseForm = document.querySelector("#caseForm");
const soapDialog = document.querySelector("#soapDialog");
const soapForm = document.querySelector("#soapForm");
const dialog = document.querySelector("#editDialog");
const form = document.querySelector("#pointForm");
const deleteBtn = document.querySelector("#deleteBtn");
const deleteCaseBtn = document.querySelector("#deleteCaseBtn");
const deleteSoapBtn = document.querySelector("#deleteSoapBtn");
const modelCtx = bodyCanvas?.getContext("2d") || null;
let contentMode = localStorage.getItem(CONTENT_MODE_KEY) || "bilingual";
let visibleMapPoints = [];
let modelView = "front";
let directoryRegionGroup = "";
let directoryTopic = "";
let directoryPointCategory = "";   // PC5: 特定穴 filter









document.querySelector("#addBtn").addEventListener("click", () => openEditor());
document.querySelector("#closeDialog").addEventListener("click", () => dialog.close());
document.querySelector("#cancelBtn").addEventListener("click", () => dialog.close());
document.querySelector("#exportBtn").addEventListener("click", exportJson);
document.querySelector("#importFile").addEventListener("change", importJson);
document.querySelector("#resetBtn").addEventListener("click", resetStarter);
document.querySelector("#modeBilingualBtn")?.addEventListener("click", () => setContentMode("bilingual"));
document.querySelector("#modeEnglishBtn")?.addEventListener("click", () => setContentMode("english"));
document.querySelector("#homeSearchBtn").addEventListener("click", runHomeSearch);
homeSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") runHomeSearch();
});
document.querySelectorAll("[data-directory-topic-link]").forEach((link) => {
  link.addEventListener("click", () => {
    const topic = link.dataset.directoryTopicLink || "";
    if (!topic) return;
    clearPointDetailHash();
    directoryTopic = topic;
    if (patternFilter) patternFilter.value = "";
    if (regionFilter) regionFilter.value = "";
    if (searchInput) searchInput.value = "";
    render();
  });
});
document.querySelector("#newCaseBtn").addEventListener("click", () => openCaseEditor());
document.querySelector("#newSoapBtn").addEventListener("click", () => openSoapEditor());
document.querySelector("#patientNewCaseLink")?.addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("#caseWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
  openCaseEditor();
});
document.querySelector("#patientSoapLink")?.addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("#caseWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
  openSoapEditor();
});
document.querySelector("#patientTrackLink")?.addEventListener("click", (event) => {
  event.preventDefault();
  if (caseSearch) caseSearch.value = "";
  renderClinicalCases();
  document.querySelector("#caseWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
});
document.querySelector("#exportCasesBtn").addEventListener("click", exportClinicalCases);
document.querySelector("#importCasesFile").addEventListener("change", importClinicalCases);
document.querySelector("#closeCaseDialog").addEventListener("click", () => caseDialog.close());
document.querySelector("#cancelCaseBtn").addEventListener("click", () => caseDialog.close());
document.querySelector("#closeSoapDialog").addEventListener("click", () => soapDialog.close());
document.querySelector("#cancelSoapBtn").addEventListener("click", () => soapDialog.close());
modelRotate?.addEventListener("input", () => renderMap(getFilteredPoints()));
modelReset?.addEventListener("click", () => {
  modelView = "front";
  updateViewTabs();
  if (modelRotate) modelRotate.value = "0";
  renderMap(getFilteredPoints());
});
viewTabs.forEach((button) => {
  button.addEventListener("click", () => {
    modelView = button.dataset.view;
    if (modelRotate) modelRotate.value = viewDefaultRotation(modelView);
    updateViewTabs();
    renderMap(getFilteredPoints());
  });
});
bodyCanvas?.addEventListener("click", handleModelClick);
form.addEventListener("submit", saveFromForm);
deleteBtn.addEventListener("click", deleteCurrent);
caseForm.addEventListener("submit", saveCaseFromForm);
soapForm.addEventListener("submit", saveSoapFromForm);
deleteCaseBtn.addEventListener("click", deleteCurrentCase);
deleteSoapBtn.addEventListener("click", deleteCurrentSoap);
caseSearch.addEventListener("input", () => { learnFromMode = false; renderClinicalCases(); });
document.querySelector("#learnFromToggle")?.addEventListener("click", (e) => {
  learnFromMode = !learnFromMode;
  e.currentTarget.setAttribute("aria-pressed", String(learnFromMode));
  e.currentTarget.classList.toggle("active", learnFromMode);
  renderClinicalCases();
});
window.addEventListener("hashchange", handlePointHashChange);

searchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const q = searchInput.value.trim();
  if (!q) return;
  const exact = findExactPoint(q);
  if (exact) { selectPoint(exact.code); return; }
  render();
  const matches = getFilteredPoints();
  if (matches.length === 1) selectPoint(matches[0].code);
});

[searchInput, meridianFilter, regionFilter, patternFilter].forEach((el) => {
  el.addEventListener("input", () => {
    if (el === regionFilter) directoryRegionGroup = "";
    if (el === patternFilter) directoryTopic = "";
    render();
  });
});

applyPointHash();
render();

function setContentMode(mode) {
  contentMode = mode;
  localStorage.setItem(CONTENT_MODE_KEY, contentMode);
  updateContentModeUI();
  render();
}

function updateContentModeUI() {
  document.body.dataset.contentMode = contentMode;
  document.querySelector("#modeBilingualBtn")?.classList.toggle("active", contentMode === "bilingual");
  document.querySelector("#modeEnglishBtn")?.classList.toggle("active", contentMode === "english");
}

function activeModuleTarget() {
  const hash = window.location.hash || "#contentLibrary";
  if (hash.startsWith("#point/") || hash === "#acupunctureWorkspace") return "#acupointDirectory";
  if (hash === "#caseWorkspace") return "#patientSystem";
  if (hash === "#fertilityWorkflow") return "#conditionGraph";
  return hash;
}

function updateModuleNavigation() {
  const activeTarget = activeModuleTarget();
  moduleNavLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === activeTarget;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function loadPoints() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultPoints;
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return defaultPoints;
    return enrichPoints(mergeByCode(defaultPoints, reconcileSavedPoints(parsed)));
  } catch {
    return defaultPoints;
  }
}

// persist() snapshots the FULL merged dataset, so localStorage written before
// the 361 adapter contains old placeholder stubs and unedited embedded copies
// that would shadow the new 361 content on merge. Drop, at load time only:
// (a) old placeholder stubs, and (b) standard-channel records without a
// techniqueNotes key — pre-adapter default copies never had one, while every
// record saved through the edit form or import does. Real user edits still
// merge over defaults as before. localStorage itself is not rewritten.
function reconcileSavedPoints(parsed) {
  const OLD_PLACEHOLDER_LOCATION = "待依 WHO Standard Acupuncture Point Locations 與專業教材補入。";
  const kept = parsed.filter((point) => {
    if (!point || typeof point !== "object") return false;
    const isOldPlaceholder = point.reviewStatus === "placeholder"
      && (point.nameZh === point.code || point.location === OLD_PLACEHOLDER_LOCATION);
    if (isOldPlaceholder) return false;
    const isPreAdapterDefaultCopy = standard361Codes.has(point.code)
      && point.techniqueNotes === undefined;
    return !isPreAdapterDefaultCopy;
  });
  const overriding = kept.filter((point) => standard361Codes.has(point.code)).map((point) => point.code);
  if (overriding.length) console.info("AcuTing: locally saved edits override 361 defaults for: " + overriding.join(", "));
  return kept;
}

function findExactPoint(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return null;
  return points.find((point) => {
    const code = String(point.code || "").toLowerCase();
    const nameZh = String(point.nameZh || "").toLowerCase();
    const nameEn = String(point.nameEn || "").toLowerCase();
    const pinyin = String(point.pinyin || "").toLowerCase().replace(/\s+/g, "");
    return code === q || nameZh === q || nameEn === q || pinyin === q.replace(/\s+/g, "");
  }) || null;
}

function goToSection(id) {
  const target = "#" + id;
  if (window.location.hash === target) {
    // Same hash: hashchange will not fire, so nudge the router manually.
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = target;
  }
}

function runHomeSearch() {
  const query = homeSearch.value.trim();
  if (!query) return;
  const caseHit = clinicalCases.some((item) => {
    const haystack = [
      item.patientCode,
      item.caseTitle,
      item.chiefComplaint,
      ...item.westernConditions,
      ...item.easternDiseases,
      ...item.tcmPatterns,
      ...item.safetyFlags,
      ...item.soapNotes.flatMap((note) => [
        note.workflowLink,
        note.cyclePhase,
        note.fertilityPhase,
        note.subjective,
        note.objective,
        note.assessment,
        note.plan,
        note.pointsUsed,
        note.formulaHerbs,
        note.westernMeds,
        note.outcomes,
        note.followUp,
        note.technique,
        ...note.westernConditionLinks,
        ...note.easternDiseaseLinks,
        ...note.tcmPatternLinks,
        ...note.safetyFlagLinks,
        ...note.acupointLinks,
        ...note.formulaLinks,
        ...note.medicationLinks,
        ...note.outcomeMetricLinks
      ])
    ].join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  if (caseHit) {
    caseSearch.value = query;
    renderClinicalCases();
    goToSection("caseWorkspace");
    return;
  }
  // Exact code / name / pinyin match → open that point's single page directly.
  const exact = findExactPoint(query);
  if (exact) {
    searchInput.value = query;
    selectPoint(exact.code);
    return;
  }
  searchInput.value = query;
  render();
  // If the query still resolves to exactly one acupoint, open it directly.
  const matches = getFilteredPoints();
  if (matches.length === 1) {
    selectPoint(matches[0].code);
    return;
  }
  goToSection("acupointDirectory");
}

function cloudtcmEntry(point) {
  const map = globalThis.ACUTING_CLOUDTCM_MAP || {};
  return map[String(point?.code || "").toUpperCase()] || null;
}

function chinesePointReference(point) {
  // Direct CloudTCM point page via the verified code->id map (data/sources/
  // cloudtcm_point_map.json, 361 standard points). No search-page fallback:
  // an absent exact record stays absent rather than misdirecting Ting.
  const entry = cloudtcmEntry(point);
  if (entry?.id) return "https://cloudtcm.com/acupoint/" + entry.id;
  return "";
}

function cloudtcmPageUrl(point) {
  const entry = cloudtcmEntry(point);
  // Full point page — thumbnails (media.cloudtcm.uk/acupoint-s) are too small to study from.
  return entry?.id ? "https://cloudtcm.com/acupoint/" + entry.id : "";
}

function pointHash(code) {
  return `#point/${encodeURIComponent(code)}`;
}

function codeFromPointHash() {
  const match = window.location.hash.match(/^#point\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : "";
}

function applyPointHash() {
  const code = codeFromPointHash();
  if (!code) return false;
  const point = points.find((item) => item.code.toLowerCase() === code.toLowerCase());
  if (!point) return false;
  selectedCode = point.code;
  searchInput.value = point.code;
  if (isAuricularPoint(point)) modelView = "ear";
  return true;
}

function handlePointHashChange() {
  if (isSyncingPointHash) return;
  if (!applyPointHash()) {
    render();
    return;
  }
  render();
  document.querySelector("#acupunctureWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function loadClinicalCases() {
  const saved = localStorage.getItem(CASE_STORAGE_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeClinicalCase) : [];
  } catch {
    return [];
  }
}

function persistClinicalCases() {
  localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(clinicalCases, null, 2));
}

// ---- CS2: knowledge counts derived at runtime (no hardcoded stats) --------
// Every number here is computed from the loaded knowledge bundle so the UI
// can never drift/lie. Counts that cannot be derived from loaded data were
// removed from index.html rather than left to rot (external-review §0.4).
function renderKnowledgeCounts() {
  const k = globalThis.ACUTING_KNOWLEDGE;
  if (!k) return;
  const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = String(value); };
  const formulas = k.formulas?.records || [];
  const herbs = k.herbs?.records || [];
  const distinct = (arr, key) => new Set(arr.map((r) => r[key]).filter(Boolean)).size;
  const sumLen = (arr, key) => arr.reduce((s, r) => s + ((r[key] || []).length), 0);

  set("statFormulas", formulas.length);
  set("statFormulaCategories", distinct(formulas, "category"));
  set("statHerbs", herbs.length);
  set("statHerbsInline", herbs.length);
  set("statHerbCategories", distinct(herbs, "category"));
  set("statHerbFormulaLinks", sumLen(herbs, "related_formulas"));
  set("statHerbSafetyFlags", sumLen(herbs, "safety_flags"));
}

// ---- CS1: backup discipline (no storage-engine change) --------------------
function getBackupMeta() {
  try {
    return JSON.parse(localStorage.getItem(BACKUP_META_KEY)) || { lastBackupAt: null, savesSinceBackup: 0 };
  } catch {
    return { lastBackupAt: null, savesSinceBackup: 0 };
  }
}

function setBackupMeta(meta) {
  localStorage.setItem(BACKUP_META_KEY, JSON.stringify(meta));
}

// Call after a real export of clinical cases: resets the age + save counter.
function markCasesBackedUp() {
  setBackupMeta({ lastBackupAt: new Date().toISOString(), savesSinceBackup: 0 });
  renderBackupBanner();
}

// Call on every case/SOAP save: counts unsaved-to-disk edits and nudges.
function noteClinicalSave() {
  const meta = getBackupMeta();
  meta.savesSinceBackup = (meta.savesSinceBackup || 0) + 1;
  setBackupMeta(meta);
  if (meta.savesSinceBackup > 0 && meta.savesSinceBackup % BACKUP_NUDGE_EVERY === 0) {
    if (confirm(`已有 ${meta.savesSinceBackup} 筆病歷變更尚未匯出備份。病歷只存在本機瀏覽器，清快取即全失。現在匯出？`)) {
      exportClinicalCases();
    }
  }
  renderBackupBanner();
}

function backupAgeDays(meta) {
  if (!meta.lastBackupAt) return Infinity;
  return (Date.now() - new Date(meta.lastBackupAt).getTime()) / 86400000;
}

// Persistent top banner shown only when there is data to lose AND it is stale.
function renderBackupBanner() {
  const existing = document.querySelector(".backup-reminder-banner");
  const meta = getBackupMeta();
  const stale = clinicalCases.length > 0 && backupAgeDays(meta) >= BACKUP_STALE_DAYS;
  if (!stale) { if (existing) existing.remove(); return; }
  if (existing) return;
  const banner = document.createElement("div");
  banner.className = "backup-reminder-banner";
  const days = meta.lastBackupAt ? Math.floor(backupAgeDays(meta)) : null;
  const label = days === null
    ? "病歷尚未匯出過備份"
    : `病歷已 ${days} 天未匯出備份`;
  banner.innerHTML = `⚠ ${label}（${clinicalCases.length} 筆病例，只存在本機瀏覽器）— `;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "立即匯出";
  btn.addEventListener("click", exportClinicalCases);
  banner.appendChild(btn);
  document.body.prepend(banner);
}

function defaultCodeList(...groups) {
  return groups.flat().map((point) => point.code).filter(Boolean);
}

function mergeByCode(...groups) {
  return groups.flat().reduce((merged, point) => {
    const index = merged.findIndex((item) => item.code === point.code);
    if (index >= 0) merged[index] = { ...merged[index], ...point };
    else merged.push(point);
    return merged;
  }, []);
}

function enrichPoints(list) {
  return list.map(enrichPoint);
}

function enrichPoint(point) {
  const locationEn = point.locationEn || locationEnglishByCode[point.code] || "";
  const anatomy = normalizeAnatomy(point.anatomy?.length ? point.anatomy : anatomyFromText(point));
  const functionsEn = point.functionsEn || translateFunctionText(point.functions || "");
  const patternsEn = point.patternsEn?.length ? point.patternsEn : (point.patterns || []).map((pattern) => patternEnglishMap[pattern] || "");
  const baseSources = point.sources?.length ? point.sources : sourceByCode[point.code] || [];
  const sources = isAuricularPoint(point) ? [...new Set([...baseSources, ...auricularSupplementSources])] : baseSources;
  const visualLinks = normalizeVisualLinks(point.visualLinks?.length ? point.visualLinks : defaultVisualLinks(point));
  // Replace the old generic CloudTCM directory URL with a reliable per-point
  // Chinese reference (CloudTCM has no derivable per-point URL).
  const GENERIC_CLOUDTCM = "https://cloudtcm.com/acupoint";
  const chineseRef = chinesePointReference(point);
  const fixedSources = sources.flatMap((u) => {
    if (u !== GENERIC_CLOUDTCM) return [u];
    return chineseRef ? [chineseRef] : [];
  });
  const cloudtcmPage = cloudtcmPageUrl(point);
  const fixedVisualLinks = visualLinks.map((link) => {
    // Link to the full CloudTCM point page (Ting: thumbnails are too small);
    // also upgrade any previously-stored thumbnail URLs to the page.
    if (link.url === GENERIC_CLOUDTCM) return cloudtcmPage || chineseRef ? { ...link, url: cloudtcmPage || chineseRef } : null;
    if (link.url.startsWith("https://media.cloudtcm.uk/")) return cloudtcmPage || chineseRef ? { ...link, url: cloudtcmPage || chineseRef } : null;
    return link;
  }).filter(Boolean);
  return { ...point, locationEn, anatomy, functionsEn, patternsEn, sources: fixedSources, visualLinks: fixedVisualLinks };
}

function defaultVisualLinks(point) {
  if (isAuricularPoint(point)) return auricularPointVisualLinks(point.standardCode || point.code);
  if (String(point.meridian || "").includes("Master Tung")) {
    return tungPointVisualLinks({ name_en: point.nameEn, display_code: point.standardCode || point.code, code: point.code });
  }
  if (isStandardChannelPoint(point)) return standardPointVisualLinks(point.code);
  return (point.sources || []).map((url) => ({
    labelZh: "外部圖像/來源頁",
    labelEn: "External visual/source page",
    url,
    source: safeHostname(url)
  }));
}

function normalizeVisualLinks(links = []) {
  return links
    .map((link) => {
      if (!link) return null;
      if (typeof link === "string") {
        return {
          labelZh: "外部圖像/來源頁",
          labelEn: "External visual/source page",
          url: link,
          source: safeHostname(link)
        };
      }
      return {
        labelZh: String(link.labelZh || link.label || "外部圖像/來源頁"),
        labelEn: String(link.labelEn || link.label || "External visual/source page"),
        url: String(link.url || ""),
        source: String(link.source || safeHostname(link.url || ""))
      };
    })
    .filter((link) => link?.url);
}

function safeHostname(url) {
  try {
    return new URL(url, window.location.href).hostname || "external";
  } catch {
    return "external";
  }
}

function anatomyFromText(point) {
  const text = [point.location, point.locationEn, point.cautions].join(" ");
  return Object.entries(anatomyGlossary)
    .filter(([zh]) => text.includes(zh))
    .map(([zh, en]) => ({ zh, en }));
}

function normalizeAnatomy(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => typeof item === "string" ? parseAnatomyLine(item) : { zh: String(item.zh || ""), en: String(item.en || "") })
      .filter((item) => item.zh || item.en);
  }
  return splitLines(String(value || "")).map(parseAnatomyLine).filter((item) => item.zh || item.en);
}

function parseAnatomyLine(line) {
  const [zh = "", en = ""] = String(line).split(/[=：:]/);
  return { zh: zh.trim(), en: en.trim() };
}

function translateFunctionText(text) {
  if (!text) return "";
  let translated = text;
  Object.entries(functionEnglishMap).forEach(([zh, en]) => {
    translated = translated.replaceAll(zh, en);
  });
  return translated
    .replaceAll("，", ", ")
    .replaceAll("、", ", ")
    .replaceAll("。", ".")
    .replace(/\s+/g, " ")
    .trim();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(points, null, 2));
}

function render() {
  updateContentModeUI();
  updateModuleNavigation();
  hydrateFilters();
  renderOsStatus();
  renderDatabaseHealth();
  renderKnowledgeCounts();   // CS2
  renderClinicalCases();
  renderBackupBanner();   // CS1
  renderDirectoryFilters();
  const filtered = getFilteredPoints();
  const detailMode = isPointDetailMode();
  if (!filtered.some((point) => point.code === selectedCode)) {
    selectedCode = filtered[0]?.code || points[0]?.code || "";
  }
  renderMap(filtered);
  renderCards(filtered);
  renderActiveFilterSummary(filtered);
  document.body.classList.toggle("point-detail-mode", detailMode);
  if (cardsEl) cardsEl.hidden = detailMode;
  if (detailCard) detailCard.hidden = !detailMode;
  if (detailMode) renderDetail(points.find((point) => point.code === selectedCode));
  else if (detailCard) detailCard.innerHTML = "";
  if (directoryTotalEl) directoryTotalEl.textContent = String(points.length);
  resultCount.textContent = contentMode === "english"
    ? `Showing ${filtered.length} / ${points.length} acupoints`
    : `目前顯示 ${filtered.length} / ${points.length} 個穴位`;
}

function labelForDirectoryValue(collection, value) {
  const item = collection.find((entry) => entry.id === value);
  if (!item) return value;
  return contentMode === "english" ? item.en : item.zh;
}

function getActiveFilterChips() {
  const chips = [];
  const query = searchInput?.value.trim() || "";
  if (query) {
    chips.push({ kind: "search", label: contentMode === "english" ? "Search" : "搜尋", value: query });
  }
  if (meridianFilter?.value) {
    chips.push({ kind: "meridian", label: contentMode === "english" ? "Channel" : "經絡", value: meridianFilter.value });
  }
  if (regionFilter?.value) {
    chips.push({ kind: "region", label: contentMode === "english" ? "Region" : "部位", value: regionFilter.value });
  }
  if (patternFilter?.value) {
    chips.push({ kind: "pattern", label: contentMode === "english" ? "Pattern" : "證型", value: patternFilter.value });
  }
  if (directoryRegionGroup) {
    chips.push({
      kind: "regionGroup",
      label: contentMode === "english" ? "Body group" : "身體分類",
      value: labelForDirectoryValue(directoryRegionGroups, directoryRegionGroup)
    });
  }
  if (directoryTopic) {
    chips.push({
      kind: "topic",
      label: contentMode === "english" ? "Topic" : "主題",
      value: labelForDirectoryValue(directoryTopics, directoryTopic)
    });
  }
  return chips;
}

function renderActiveFilterSummary(filtered) {
  if (!activeFilterSummaryEl) return;
  const chips = getActiveFilterChips();
  if (!chips.length) {
    activeFilterSummaryEl.innerHTML = `
      <span class="active-filter-empty">${contentMode === "english" ? "No active filters." : "目前未套用篩選。"}</span>
    `;
    return;
  }

  const summaryLabel = contentMode === "english"
    ? `Active filters, ${filtered.length} results`
    : `目前篩選，${filtered.length} 筆結果`;
  const clearAllLabel = contentMode === "english" ? "Clear all" : "清除全部";
  const removeLabel = contentMode === "english" ? "Remove filter" : "移除篩選";
  activeFilterSummaryEl.innerHTML = `
    <div class="active-filter-header">
      <strong>${escapeHtml(summaryLabel)}</strong>
      <button class="clear-all-filters" type="button" data-clear-filter="all">${escapeHtml(clearAllLabel)}</button>
    </div>
    <div class="active-filter-list">
      ${chips.map((chip) => `
        <span class="active-filter-chip">
          <span>${escapeHtml(chip.label)}: ${escapeHtml(chip.value)}</span>
          <button type="button" data-clear-filter="${escapeAttribute(chip.kind)}" aria-label="${escapeAttribute(`${removeLabel}: ${chip.label} ${chip.value}`)}">×</button>
        </span>
      `).join("")}
    </div>
  `;
  activeFilterSummaryEl.querySelectorAll("[data-clear-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      clearActiveFilter(button.dataset.clearFilter || "");
      clearPointDetailHash();
      render();
    });
  });
}

function clearActiveFilter(kind) {
  if (kind === "all" || kind === "search") searchInput.value = "";
  if (kind === "all" || kind === "meridian") meridianFilter.value = "";
  if (kind === "all" || kind === "region") regionFilter.value = "";
  if (kind === "all" || kind === "pattern") patternFilter.value = "";
  if (kind === "all" || kind === "regionGroup") directoryRegionGroup = "";
  if (kind === "all" || kind === "topic") directoryTopic = "";
  if (kind === "all" || kind === "pointCategory") directoryPointCategory = "";
}

function isPointDetailMode() {
  return /^#point\/.+/.test(window.location.hash);
}

function clearPointDetailHash() {
  if (!window.location.hash.startsWith("#point/")) return;
  isSyncingPointHash = true;
  window.location.hash = "#acupointDirectory";
  isSyncingPointHash = false;
}

function renderOsStatus() {
  const audit = getStandardPointAudit();
  const standardCount = audit.presentTotal;
  const missingCount = audit.missingTotal;
  standardCountEl.textContent = String(standardCount);
  missingCountEl.textContent = String(missingCount);
  acupunctureProgressEl.textContent = `${standardCount}/${standardChannelAudit.expectedTotal} 標準經穴`;
  caseCountEl.textContent = String(clinicalCases.length);
  caseProgressEl.textContent = clinicalCases.length ? `${clinicalCases.length} cases / ${clinicalCases.reduce((sum, item) => sum + item.soapNotes.length, 0)} SOAP` : "病例紀錄入口";
}

function renderDatabaseHealth() {
  const audit = getStandardPointAudit();
  const quality = getDataQualityAudit();
  if (auditGeneratedOnEl) auditGeneratedOnEl.textContent = `audit ${standardChannelAudit.generatedOn}`;
  if (healthStandardCountEl) healthStandardCountEl.textContent = `${audit.presentTotal}/${standardChannelAudit.expectedTotal}`;
  if (healthMissingCountEl) healthMissingCountEl.textContent = String(audit.missingTotal);
  if (healthCompletionPercentEl) healthCompletionPercentEl.textContent = `${audit.completionPercent}%`;
  if (healthReviewedStandardEl) healthReviewedStandardEl.textContent = String(quality.sourceCheckedStandard);
  if (healthPlaceholderStandardEl) healthPlaceholderStandardEl.textContent = String(quality.draftStandard);
  if (healthTungIndexEl) healthTungIndexEl.textContent = String(quality.tungIndex);
  if (healthAuricularIndexEl) healthAuricularIndexEl.textContent = String(quality.auricular);
  if (healthAuricularGb93CoverageEl) healthAuricularGb93CoverageEl.textContent = `${quality.auricularGb93Indexed}/${quality.auricularGb93Expected}`;
  if (healthGb93WorklistEl) healthGb93WorklistEl.textContent = `${quality.gb93WorklistCount} queued`;
  if (healthVisualCoverageEl) healthVisualCoverageEl.textContent = `${quality.visualLinked}/${quality.total}`;
  if (healthMissingEnglishLocationEl) healthMissingEnglishLocationEl.textContent = String(quality.missingEnglishLocation);
  if (healthMissingTechniqueEl) healthMissingTechniqueEl.textContent = String(quality.missingTechnique);
  if (healthMissingSafetyEl) healthMissingSafetyEl.textContent = String(quality.missingSafety);
  if (healthNextBatchEl) healthNextBatchEl.textContent = `Next batch: ${standardChannelAudit.nextRecommendedBatch}`;
  if (gb93NextBatchTextEl) {
    const preview = auricularGb93NextBatch.slice(0, 12).map((item) => item.candidate_code).join(", ");
    gb93NextBatchTextEl.textContent = preview
      ? `先查證 ${preview}${auricularGb93NextBatch.length > 12 ? " ..." : ""}，確認名稱、耳區、圖源後再升級為 index record。`
      : "目前沒有 GB93 候選清單。";
  }
  if (gb93CandidateGridEl) {
    gb93CandidateGridEl.innerHTML = auricularGb93NextBatch.map((item) => `
      <a href="${escapeAttribute(gb93CandidateUrl(item.candidate_code))}" target="_blank" rel="noreferrer">
        <strong>${escapeHtml(item.candidate_code)}</strong>
        <span>${escapeHtml(item.zone || "GB93")}</span>
      </a>
    `).join("") || `<p>目前沒有 GB93 候選清單。</p>`;
  }
  if (gb93PromotionChecklistEl) {
    const checklist = auricularGb93Worklist.promotion_checklist || [];
    gb93PromotionChecklistEl.innerHTML = checklist.map((item) => `<span>${escapeHtml(formatGb93ChecklistItem(item))}</span>`).join("");
  }
  if (healthNextTaskEl) {
    const next = audit.channels.find((item) => item.missing > 0);
    healthNextTaskEl.textContent = next
      ? `先補 ${next.code} ${next.name}：缺 ${next.missing} / ${next.expected} 個穴位。`
      : "361 標準經穴已完整，下一步改做來源審核與英文 public-ready。";
  }
  if (!healthChannelListEl) return;
  healthChannelListEl.innerHTML = audit.channels.map((item) => {
    const status = item.missing === 0 ? "complete" : item.percent >= 50 ? "partial" : "priority";
    return `
      <article class="health-channel-row ${status}">
        <div>
          <strong>${escapeHtml(item.code)}</strong>
          <span>${escapeHtml(item.name)}</span>
        </div>
        <div class="health-bar" aria-label="${escapeAttribute(item.code)} completion">
          <i style="width: ${item.percent}%"></i>
        </div>
        <small>${item.present}/${item.expected} · missing ${item.missing}</small>
      </article>
    `;
  }).join("");
}

function gb93CandidateUrl(code) {
  return `https://acupun.site/point_list_Ear93GB.aspx?pointId=${encodeURIComponent(String(code || "").toUpperCase())}`;
}

function formatGb93ChecklistItem(item) {
  const labels = {
    code_confirmed: "代碼已確認",
    chinese_name_confirmed: "中文名已確認",
    english_name_or_translation_added: "英文名/翻譯已補",
    auricular_zone_confirmed: "耳區已確認",
    visual_source_url_checked: "圖源 URL 已檢查",
    review_status_kept_index_only_until_clinical_details_are_checked: "臨床細節未查前維持 index_only"
  };
  return labels[item] || item;
}

function getDataQualityAudit() {
  const standard = points.filter(isStandardChannelPoint);
  const visualLinked = points.filter((point) => normalizeVisualLinks(point.visualLinks || []).length > 0).length;
  return {
    total: points.length,
    // Post-361-adapter: every standard point is a real record, so the quality
    // axis is review_status based (draft vs source_checked), not placeholder based.
    sourceCheckedStandard: standard.filter((point) => point.reviewStatus === "source_checked").length,
    draftStandard: standard.filter((point) => point.reviewStatus !== "source_checked").length,
    tungIndex: points.filter((point) => String(point.meridian || "").includes("Master Tung")).length,
    auricular: points.filter(isAuricularPoint).length,
    auricularGb93Indexed: auricularGb93Records.length,
    auricularGb93Expected: Number(auricularGb93.expected_total || 93),
    gb93WorklistCount: auricularGb93NextBatch.length,
    visualLinked,
    missingEnglishLocation: points.filter((point) => isPendingContent(point.locationEn)).length,
    missingTechnique: points.filter(isMissingTechnique).length,
    missingSafety: points.filter((point) => isPendingContent(point.cautions)).length
  };
}

function getStandardPointAudit() {
  const standardCodes = new Set(points.filter(isStandardChannelPoint).map((point) => point.code));
  const channels = standardChannelAudit.channels.map((channel) => {
    const present = Array.from(standardCodes).filter((code) => channelCodeFromPointCode(code) === channel.code).length;
    const missing = Math.max(0, channel.expected - present);
    const percent = Math.min(100, Math.round((present / channel.expected) * 100));
    return { ...channel, present, missing, percent };
  });
  const presentTotal = channels.reduce((sum, item) => sum + item.present, 0);
  const missingTotal = Math.max(0, standardChannelAudit.expectedTotal - presentTotal);
  const completionPercent = Math.min(100, Math.round((presentTotal / standardChannelAudit.expectedTotal) * 100));
  return { channels, presentTotal, missingTotal, completionPercent };
}

function channelCodeFromPointCode(code) {
  const match = String(code || "").match(/^[A-Z]+/);
  return match ? match[0] : "";
}

function isStandardChannelPoint(point) {
  return Boolean(channelPrefixMeta[channelCodeFromPointCode(point.code)])
    && !isAuricularPoint(point)
    && !String(point.meridian || "").includes("Extra Point")
    && !String(point.meridian || "").includes("Master Tung")
    && !String(point.code || "").startsWith("EX-");
}

function hydrateFilters() {
  fillSelect(meridianFilter, "全部經絡", unique(points.map((point) => point.meridian)));
  fillSelect(regionFilter, "全部部位", unique(points.map((point) => point.region)));
  fillSelect(patternFilter, "全部證型", unique(points.flatMap((point) => point.patterns)));
}

function renderDirectoryFilters() {
  renderMeridianCategories();
  renderRegionCategories();
  renderTopicCategories();
  renderPointCategories();
}

// PC5: 特定穴 filter group — click a category → list all points in it.
function renderPointCategories() {
  if (!pointCategoryList) return;
  const withCounts = pointCategoryCatalog
    .map((c) => ({ c, count: points.filter((p) => pointMatchesCategory(p, c.id)).length }))
    .filter((x) => x.count > 0);
  const rows = [
    directoryButton({ labelZh: "全部", labelEn: "All", count: points.length, active: !directoryPointCategory, action: "pointCategory", value: "" }),
    ...withCounts.map(({ c, count }) => directoryButton({
      labelZh: c.label_zh,
      labelEn: c.label_en,
      count,
      active: directoryPointCategory === c.id,
      action: "pointCategory",
      value: c.id
    }))
  ];
  pointCategoryList.innerHTML = rows.join("");
  bindDirectoryButtons(pointCategoryList);
}

function renderMeridianCategories() {
  if (!meridianCategoryList) return;
  const meridians = unique(points.map((point) => point.meridian));
  const rows = [
    directoryButton({
      labelZh: "全部",
      labelEn: "All",
      count: points.length,
      active: !meridianFilter.value,
      action: "meridian",
      value: ""
    }),
    ...meridians.map((meridian) => directoryButton({
      labelZh: shortMeridianFromText(meridian),
      labelEn: shortMeridianFromText(meridian),
      count: points.filter((point) => point.meridian === meridian).length,
      active: meridianFilter.value === meridian,
      action: "meridian",
      value: meridian
    }))
  ];
  meridianCategoryList.innerHTML = rows.join("");
  bindDirectoryButtons(meridianCategoryList);
}

function renderRegionCategories() {
  if (!regionCategoryList) return;
  const rows = [
    directoryButton({
      labelZh: "全部",
      labelEn: "All",
      count: points.length,
      active: !directoryRegionGroup,
      action: "regionGroup",
      value: ""
    }),
    ...directoryRegionGroups.map((group) => directoryButton({
      labelZh: group.zh,
      labelEn: group.en,
      count: points.filter((point) => pointMatchesRegionGroup(point, group.id)).length,
      active: directoryRegionGroup === group.id,
      action: "regionGroup",
      value: group.id
    }))
  ];
  regionCategoryList.innerHTML = rows.join("");
  bindDirectoryButtons(regionCategoryList);
}

function renderTopicCategories() {
  if (!topicCategoryList) return;
  const rows = [
    directoryButton({
      labelZh: "全部",
      labelEn: "All",
      count: points.length,
      active: !directoryTopic,
      action: "topic",
      value: ""
    }),
    ...directoryTopics.map((topic) => directoryButton({
      labelZh: topic.zh,
      labelEn: topic.en,
      count: points.filter((point) => pointMatchesTopic(point, topic.id)).length,
      active: directoryTopic === topic.id,
      action: "topic",
      value: topic.id
    }))
  ];
  topicCategoryList.innerHTML = rows.join("");
  bindDirectoryButtons(topicCategoryList);
}

function directoryButton({ labelZh, labelEn, count, active, action, value }) {
  const label = contentMode === "english" ? labelEn : labelZh;
  return `
    <button class="directory-filter-btn ${active ? "active" : ""}" type="button" data-directory-action="${escapeAttribute(action)}" data-directory-value="${escapeAttribute(value)}">
      <span>${escapeHtml(label)}</span>
      <small>${count}</small>
    </button>
  `;
}

function bindDirectoryButtons(scope) {
  scope.querySelectorAll("[data-directory-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.directoryAction;
      const value = button.dataset.directoryValue || "";
      if (action === "meridian") meridianFilter.value = value;
      if (action === "regionGroup") {
        directoryRegionGroup = value;
        regionFilter.value = "";
      }
      if (action === "topic") {
        directoryTopic = value;
        patternFilter.value = "";
      }
      if (action === "pointCategory") {
        directoryPointCategory = value;
        searchInput.value = "";   // "按原穴就列出所有原穴" — show the full category set
      }
      clearPointDetailHash();
      render();
      document.querySelector("#acupunctureWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function shortMeridianFromText(value) {
  return String(value || "").split("/")[0].trim() || (contentMode === "english" ? "Uncategorized" : "未分類");
}

function fillSelect(select, firstLabel, values) {
  const current = select.value;
  select.innerHTML = `<option value="">${firstLabel}</option>`;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
  select.value = values.includes(current) ? current : "";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
}

function getFilteredPoints() {
  const query = searchInput.value.trim().toLowerCase();
  return points.filter((point) => {
    const haystack = [
      point.code,
      point.nameZh,
      point.nameEn,
      point.pinyin,
      point.standardCode,
      point.standardRegion,
      point.standardZone,
      point.meridian,
      point.region,
      point.location,
      point.locationEn,
      point.functions,
      point.functionsEn,
      point.evidence,
      point.cautions,
      point.image,
      ...(point.patterns || []),
      ...(point.patternsEn || []),
      ...(point.aliases || []),
      ...(point.anatomy || []).flatMap((item) => [item.zh, item.en]),
      ...(point.visualLinks || []).flatMap((item) => [item.labelZh, item.labelEn, item.url, item.source]),
      ...(point.sources || [])
    ].join(" ").toLowerCase();

    return (!query || haystack.includes(query))
      && (!meridianFilter.value || point.meridian === meridianFilter.value)
      && (!regionFilter.value || point.region === regionFilter.value)
      && (!patternFilter.value || point.patterns.includes(patternFilter.value))
      && (!directoryRegionGroup || pointMatchesRegionGroup(point, directoryRegionGroup))
      && (!directoryTopic || pointMatchesTopic(point, directoryTopic))
      && (!directoryPointCategory || pointMatchesCategory(point, directoryPointCategory));
  });
}

function pointMatchesCategory(point, categoryId) {
  return (point.pointCategories || []).includes(categoryId);
}

function pointMatchesRegionGroup(point, groupId) {
  const group = directoryRegionGroups.find((item) => item.id === groupId);
  if (!group) return true;
  return group.match.test([point.region, point.meridian, point.location, point.locationEn, point.nameZh, point.nameEn, point.code].join(" "));
}

function pointMatchesTopic(point, topicId) {
  const topic = directoryTopics.find((item) => item.id === topicId);
  if (!topic) return true;
  if (topic.match) return topic.match(point);
  const haystack = [
    point.nameZh,
    point.nameEn,
    point.meridian,
    point.region,
    point.location,
    point.locationEn,
    point.functions,
    point.functionsEn,
    point.evidence,
    ...(point.patterns || []),
    ...(point.patternsEn || [])
  ].join(" ").toLowerCase();
  return topic.keywords.some((keyword) => haystack.includes(String(keyword).toLowerCase()));
}

function isPendingContent(value) {
  const text = String(value || "").trim();
  if (!text) return true;
  return /pending|待補|待校對|待依|source review|index-only|placeholder|not yet/i.test(text);
}

function isMissingTechnique(point) {
  return [
    point.techniqueNotes,
    point.needlingDepth,
    point.needlingAngle,
    point.needlingMethod,
    point.tonificationSedation,
    point.moxibustion,
    point.forbiddenActions
  ].every(isPendingContent);
}

function isMissingIndications(point) {
  const functionsMissing = isPendingContent(point.functions) && isPendingContent(point.functionsEn);
  const patternText = [...(point.patterns || []), ...(point.patternsEn || [])].join(" ");
  return functionsMissing || isPendingContent(patternText);
}

function renderMap(filtered) {
  if (!bodyCanvas || !modelStage || !modelLabels || !earAnatomyLabels || !modelCtx) {
    visibleMapPoints = [];
    return;
  }
  modelStage.classList.toggle("use-anatomy-plate", usesAnatomyPlate(modelView));
  modelStage.classList.toggle("use-ear-atlas", modelView === "ear");
  drawBodyModel();
  modelLabels.innerHTML = "";
  earAnatomyLabels.innerHTML = "";
  if (modelView === "ear") renderEarAnatomyLabels();
  visibleMapPoints = filtered
    .map((point) => ({ point, projected: projectPoint(point) }))
    .filter((item) => item.projected.visible);
  visibleMapPoints
    .sort((a, b) => a.projected.depth - b.projected.depth)
    .forEach(({ point, projected }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `model-point ${modelView === "ear" ? "ear-point" : ""} ${point.code === selectedCode ? "active" : ""}`;
      button.innerHTML = modelView === "ear" ? earPointLabel(point) : escapeHtml(point.code);
      button.title = `${point.code} ${point.nameZh} ${point.nameEn}`;
      button.style.left = `${(projected.x / 360) * 100}%`;
      button.style.top = `${(projected.y / 620) * 100}%`;
      button.style.opacity = String(projected.opacity);
      button.style.transform = `translate(-50%, -50%) scale(${projected.scale})`;
      button.dataset.view = modelView;
      button.addEventListener("click", () => selectPoint(point.code));
      modelLabels.append(button);
    });
}

function usesAnatomyPlate(view) {
  return ["front", "back", "head", "limbs"].includes(view);
}

function renderEarAnatomyLabels() {
  earAnatomyLabelData.forEach((label) => {
    const el = document.createElement("span");
    el.className = "ear-region-label";
    el.style.left = `${(label.x / 360) * 100}%`;
    el.style.top = `${(label.y / 620) * 100}%`;
    el.innerHTML = `${escapeHtml(label.zh)}<small>${escapeHtml(label.en)}</small>`;
    earAnatomyLabels.append(el);
  });
}

function updateViewTabs() {
  viewTabs.forEach((button) => button.classList.toggle("active", button.dataset.view === modelView));
}

function viewDefaultRotation(view) {
  return {
    front: "0",
    back: "0",
    side: "30",
    head: "0",
    limbs: "0",
    ear: "0"
  }[view] || "0";
}

function drawBodyModel() {
  const dpr = window.devicePixelRatio || 1;
  const rect = bodyCanvas.getBoundingClientRect();
  const width = Math.max(360, Math.round(rect.width || 360));
  const height = Math.round(width * 620 / 360);
  bodyCanvas.width = width * dpr;
  bodyCanvas.height = height * dpr;
  modelCtx.setTransform(width * dpr / 360, 0, 0, height * dpr / 620, 0, 0);
  modelCtx.clearRect(0, 0, 360, 620);

  const rotation = Number(modelRotate.value) / 34;
  drawAtmosphere(rotation);
  drawShadow();
  if (usesAnatomyPlate(modelView)) {
    drawPlateBackdrop(modelView);
    return;
  }
  if (modelView === "head") {
    drawHeadView(rotation);
    return;
  }
  if (modelView === "ear") {
    drawEarView(rotation);
    return;
  }
  if (modelView === "limbs") {
    drawLimbsView(rotation);
    return;
  }
  if (modelView === "back") {
    drawBackModel(rotation);
    return;
  }
  if (modelView === "side") {
    drawSideModel(rotation);
    return;
  }
  drawFrontModel(rotation);
}

function drawPlateBackdrop(view) {
  modelCtx.save();
  modelCtx.fillStyle = "rgba(255, 255, 255, 0.58)";
  modelCtx.fillRect(0, 0, 360, 620);
  modelCtx.fillStyle = "rgba(19, 60, 59, 0.78)";
  modelCtx.font = "700 13px Microsoft JhengHei, Arial";
  modelCtx.fillText(view === "front" ? "Anterior anatomical reference" : "Posterior anatomical reference", 78, 32);
  modelCtx.restore();
}

function drawFrontModel(rotation) {
  drawLimb(118, 142, 66, 304, 28, 17, rotation, "left-arm");
  drawLimb(242, 142, 294, 304, 28, 17, rotation, "right-arm");
  drawLeg(148, 392, 118, 586, 30, rotation, "left-leg");
  drawLeg(212, 392, 244, 586, 30, rotation, "right-leg");
  drawTorso(rotation);
  drawNeck(rotation);
  drawHead(rotation);
  drawSurfaceLandmarks(rotation);
}

function drawBackModel(rotation) {
  drawLimb(118, 142, 66, 304, 27, 17, -rotation, "left-arm");
  drawLimb(242, 142, 294, 304, 27, 17, -rotation, "right-arm");
  drawLeg(148, 392, 118, 586, 30, -rotation, "left-leg");
  drawLeg(212, 392, 244, 586, 30, -rotation, "right-leg");
  drawBackTorso(rotation);
  drawNeck(rotation);
  drawBackHead(rotation);
  drawBackLandmarks(rotation);
}

function drawSideModel(rotation) {
  const side = Math.sign(Number(modelRotate.value)) || 1;
  modelCtx.save();
  modelCtx.translate(side > 0 ? 10 : -10, 0);
  drawLimb(180 - side * 24, 146, 180 - side * 48, 318, 24, 15, side * 0.9, "left-arm");
  drawLeg(170 - side * 8, 390, 158 - side * 18, 588, 29, side * 0.5, "left-leg");
  drawLeg(198 + side * 7, 390, 216 + side * 16, 586, 25, -side * 0.2, "right-leg");
  drawSideTorso(side);
  drawSideHead(side);
  modelCtx.restore();
}

function drawHeadView(rotation) {
  modelCtx.save();
  modelCtx.translate(0, -5);
  modelCtx.scale(1.08, 1.08);
  const head = modelCtx.createRadialGradient(150 + rotation * 20, 132, 16, 184, 168, 116);
  head.addColorStop(0, "#f8d8c3");
  head.addColorStop(0.58, "#d8956b");
  head.addColorStop(1, "#8f523c");
  modelCtx.fillStyle = head;
  modelCtx.beginPath();
  modelCtx.ellipse(166, 150, 74, 94, 0, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.fillStyle = "rgba(91, 57, 48, 0.22)";
  modelCtx.beginPath();
  modelCtx.ellipse(141, 144, 7, 3, 0, 0, Math.PI * 2);
  modelCtx.ellipse(191, 144, 7, 3, 0, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.strokeStyle = "rgba(95, 56, 43, 0.35)";
  modelCtx.lineWidth = 2;
  modelCtx.beginPath();
  modelCtx.moveTo(166, 154);
  modelCtx.quadraticCurveTo(158, 180, 165, 196);
  modelCtx.stroke();
  modelCtx.beginPath();
  modelCtx.arc(166, 208, 19, 0.1, Math.PI - 0.1);
  modelCtx.stroke();
  modelCtx.restore();

  drawLimb(95, 350, 55, 510, 20, 14, rotation, "left-arm");
  drawLimb(265, 350, 305, 510, 20, 14, rotation, "right-arm");
  drawTorso(rotation * 0.4);
}

function drawLimbsView(rotation) {
  modelCtx.save();
  modelCtx.fillStyle = "rgba(255,255,255,0.35)";
  [[34, 42, 128, 248], [198, 42, 128, 248], [34, 338, 128, 240], [198, 338, 128, 240]].forEach(([x, y, w, h]) => {
    roundedRectPath(x, y, w, h, 18);
    modelCtx.fill();
  });
  modelCtx.restore();

  drawLimb(98, 70, 72, 244, 28, 17, rotation, "left-arm");
  drawLimb(260, 70, 286, 244, 28, 17, -rotation, "right-arm");
  drawLeg(100, 354, 76, 574, 32, rotation, "left-leg");
  drawLeg(254, 354, 284, 574, 32, -rotation, "right-leg");

  modelCtx.fillStyle = "rgba(19, 60, 59, 0.72)";
  modelCtx.font = "700 13px Microsoft JhengHei, Arial";
  modelCtx.fillText("手臂 / Arm", 55, 36);
  modelCtx.fillText("手臂 / Arm", 220, 36);
  modelCtx.fillText("腿足 / Leg & Foot", 50, 330);
  modelCtx.fillText("腿足 / Leg & Foot", 210, 330);
}

function drawEarView(rotation) {
  modelCtx.save();
  modelCtx.translate(0, -4);

  const ear = modelCtx.createRadialGradient(146 + rotation * 18, 112, 16, 188, 306, 258);
  ear.addColorStop(0, "#ffd4e8");
  ear.addColorStop(0.22, "#f5a2c9");
  ear.addColorStop(0.55, "#f58e86");
  ear.addColorStop(0.8, "#bf605b");
  ear.addColorStop(1, "#5c302d");

  modelCtx.shadowColor = "rgba(30, 20, 20, 0.44)";
  modelCtx.shadowBlur = 22;
  modelCtx.shadowOffsetX = 0;
  modelCtx.shadowOffsetY = 16;
  modelCtx.fillStyle = ear;
  modelCtx.beginPath();
  modelCtx.moveTo(188, 44);
  modelCtx.bezierCurveTo(278, 48, 326, 138, 302, 254);
  modelCtx.bezierCurveTo(284, 320, 308, 366, 266, 440);
  modelCtx.bezierCurveTo(228, 506, 240, 562, 176, 574);
  modelCtx.bezierCurveTo(112, 588, 76, 520, 98, 456);
  modelCtx.bezierCurveTo(122, 384, 66, 330, 76, 236);
  modelCtx.bezierCurveTo(88, 128, 116, 42, 188, 44);
  modelCtx.fill();
  modelCtx.shadowColor = "transparent";
  modelCtx.strokeStyle = "rgba(75, 42, 45, 0.62)";
  modelCtx.lineWidth = 2.4;
  modelCtx.stroke();

  drawEarRegion("耳輪\nHelix", [[170, 70], [238, 72], [286, 132], [278, 208], [238, 194], [216, 126], [166, 112]], "#f4a0cf", { labelY: -4, maxWidth: 70 });
  drawEarRegion("耳輪結節\nHelix Tubercle", [[104, 136], [146, 104], [172, 112], [138, 214], [96, 246], [84, 188]], "#ff7777", { maxWidth: 70 });
  drawEarRegion("耳舟\nScaphoid Fossa", [[134, 134], [166, 112], [216, 126], [210, 194], [168, 242], [122, 206]], "#7270c8", { labelY: -2, maxWidth: 72 });
  drawEarRegion("對耳輪上腳\nSuperior AntiHelix Crus", [[170, 122], [214, 128], [248, 182], [204, 184]], "#ffd76d", { maxWidth: 84 });
  drawEarRegion("三角窩\nTriangle Fossa", [[206, 186], [248, 184], [258, 238], [212, 246], [188, 218]], "#ff8180", { maxWidth: 78 });
  drawEarRegion("對耳輪下腳\nInferior AntiHelix Crus", [[180, 222], [258, 238], [242, 274], [178, 270]], "#e6a044", { maxWidth: 92 });
  drawEarRegion("對耳輪\nAntiHelix", [[168, 208], [188, 224], [178, 372], [148, 430], [118, 398], [126, 278]], "#ff7f78", { maxWidth: 76 });
  drawEarRegion("耳甲艇\nSuperior Concha", [[156, 258], [190, 224], [238, 276], [212, 338], [154, 326]], "#635ea8", { maxWidth: 78 });
  drawEarRegion("耳甲腔\nInferior Concha", [[146, 334], [214, 332], [252, 382], [212, 436], [148, 418], [116, 374]], "#ffd064", { maxWidth: 82 });
  drawEarRegion("耳屏\nTragus", [[94, 292], [132, 262], [148, 328], [122, 386], [88, 360]], "#ff8a80", { maxWidth: 60 });
  drawEarRegion("對耳屏\nAntitragus", [[150, 420], [212, 434], [224, 476], [168, 486], [126, 454]], "#f3a4d7", { maxWidth: 74 });
  drawEarRegion("耳垂\nLobe", [[122, 468], [224, 468], [240, 532], [178, 566], [112, 532]], "#ff8179", { maxWidth: 70 });

  drawEarGroove([[132, 126], [110, 206], [104, 286], [114, 366], [136, 430]], "#5a569e");
  drawEarGroove([[184, 292], [220, 300], [246, 330], [244, 374], [218, 412]], "#a35e47");
  drawEarLobeGrid();

  drawEarLeader("耳尖 / Ear apex", 170, 78, 98, 62);
  drawEarLeader("屏上切跡 / Supratragal Notch", 105, 274, 28, 236);
  drawEarLeader("屏間切跡 / Intertragal Notch", 148, 384, 44, 422);
  drawEarLeader("耳廓背面 / Posterior Surface", 258, 424, 306, 476);
  drawEarLeader("AT4 皮質下 / Subcortex", 127, 306, 34, 272);
  modelCtx.restore();
}

function drawEarRegion(label, points, color) {
  const gradient = modelCtx.createLinearGradient(120, 120, 250, 440);
  gradient.addColorStop(0, lighten(color, 0.28));
  gradient.addColorStop(0.55, color);
  gradient.addColorStop(1, darken(color, 0.22));
  modelCtx.fillStyle = gradient;
  modelCtx.strokeStyle = "rgba(82, 50, 55, 0.5)";
  modelCtx.lineWidth = 1.25;
  modelCtx.beginPath();
  points.forEach(([x, y], index) => index ? modelCtx.lineTo(x, y) : modelCtx.moveTo(x, y));
  modelCtx.closePath();
  modelCtx.save();
  modelCtx.shadowColor = "rgba(55, 30, 36, 0.24)";
  modelCtx.shadowBlur = 8;
  modelCtx.shadowOffsetY = 4;
  modelCtx.fill();
  modelCtx.restore();
  modelCtx.stroke();

  const center = polygonCenter(points);
  const options = arguments[3] || {};
  modelCtx.fillStyle = "rgba(39, 29, 32, 0.9)";
  modelCtx.font = "800 11px Microsoft JhengHei, Arial";
  modelCtx.textAlign = "center";
  label.split("\n").forEach((line, index) => modelCtx.fillText(line, center.x, center.y + (options.labelY || 0) + index * 13, options.maxWidth || 90));
  modelCtx.textAlign = "start";
}

function drawEarGroove(points, color) {
  modelCtx.save();
  modelCtx.strokeStyle = color;
  modelCtx.globalAlpha = 0.62;
  modelCtx.lineWidth = 7;
  modelCtx.lineCap = "round";
  modelCtx.lineJoin = "round";
  modelCtx.beginPath();
  points.forEach(([x, y], index) => index ? modelCtx.lineTo(x, y) : modelCtx.moveTo(x, y));
  modelCtx.stroke();
  modelCtx.globalAlpha = 0.22;
  modelCtx.strokeStyle = "#1f214d";
  modelCtx.lineWidth = 2;
  modelCtx.stroke();
  modelCtx.restore();
}

function drawEarLobeGrid() {
  modelCtx.save();
  modelCtx.strokeStyle = "rgba(125, 65, 68, 0.34)";
  modelCtx.lineWidth = 1;
  [[138, 474, 140, 540], [172, 470, 174, 558], [206, 472, 206, 540], [122, 506, 230, 508]].forEach(([x1, y1, x2, y2]) => {
    modelCtx.beginPath();
    modelCtx.moveTo(x1, y1);
    modelCtx.lineTo(x2, y2);
    modelCtx.stroke();
  });
  modelCtx.restore();
}

function polygonCenter(points) {
  const sum = points.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function drawEarLeader(text, x1, y1, x2, y2) {
  modelCtx.strokeStyle = "rgba(42, 31, 25, 0.64)";
  modelCtx.lineWidth = 1.2;
  modelCtx.beginPath();
  modelCtx.moveTo(x1, y1);
  modelCtx.lineTo(x2, y2);
  modelCtx.stroke();
  modelCtx.fillStyle = "rgba(30, 26, 22, 0.88)";
  modelCtx.font = "800 12px Microsoft JhengHei, Arial";
  modelCtx.fillText(text, x2, y2 - 4);
}

function lighten(hex, amount) {
  return shadeHex(hex, amount);
}

function darken(hex, amount) {
  return shadeHex(hex, -amount);
}

function shadeHex(hex, amount) {
  const value = hex.replace("#", "");
  const rgb = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
  const shaded = rgb.map((channel) => Math.max(0, Math.min(255, Math.round(channel + 255 * amount))));
  return `rgb(${shaded.join(",")})`;
}

function drawAtmosphere(rotation) {
  const wash = modelCtx.createLinearGradient(0, 0, 360, 620);
  wash.addColorStop(0, "#f6fbfa");
  wash.addColorStop(0.48, "#e4eef2");
  wash.addColorStop(1, "#f4eee4");
  modelCtx.fillStyle = wash;
  modelCtx.fillRect(0, 0, 360, 620);

  modelCtx.save();
  modelCtx.globalAlpha = 0.2;
  modelCtx.fillStyle = rotation >= 0 ? "#1b7c79" : "#b67828";
  modelCtx.beginPath();
  modelCtx.ellipse(184 + rotation * 24, 300, 118, 255, rotation * 0.08, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.restore();
}

function drawShadow() {
  const shadow = modelCtx.createRadialGradient(180, 594, 18, 180, 594, 126);
  shadow.addColorStop(0, "rgba(28, 37, 40, 0.26)");
  shadow.addColorStop(1, "rgba(28, 37, 40, 0)");
  modelCtx.fillStyle = shadow;
  modelCtx.beginPath();
  modelCtx.ellipse(180, 594, 118, 19, 0, 0, Math.PI * 2);
  modelCtx.fill();
}

function skinGradient(x0, y0, x1, y1, warm = 0) {
  const gradient = modelCtx.createLinearGradient(x0, y0, x1, y1);
  gradient.addColorStop(0, warm ? "#f1c6a6" : "#f6d1b7");
  gradient.addColorStop(0.5, "#d79269");
  gradient.addColorStop(1, "#9f5e43");
  return gradient;
}

function drawLimb(x1, y1, x2, y2, shoulderWidth, wristWidth, rotation, side) {
  const sideSign = side.startsWith("left") ? -1 : 1;
  const shift = rotation * sideSign * -10;
  modelCtx.save();
  modelCtx.lineCap = "round";
  modelCtx.lineJoin = "round";
  modelCtx.strokeStyle = skinGradient(x1, y1, x2, y2, sideSign > 0);
  modelCtx.lineWidth = shoulderWidth;
  modelCtx.beginPath();
  modelCtx.moveTo(x1 + shift, y1);
  modelCtx.bezierCurveTo(x1 + sideSign * 12 + shift, 182, x2 - sideSign * 13 + shift, 238, x2 + shift, y2);
  modelCtx.stroke();

  modelCtx.strokeStyle = "rgba(255,255,255,0.24)";
  modelCtx.lineWidth = Math.max(4, wristWidth / 2);
  modelCtx.beginPath();
  modelCtx.moveTo(x1 - sideSign * 5 + shift, y1 + 8);
  modelCtx.bezierCurveTo(x1 + sideSign * 4 + shift, 188, x2 - sideSign * 10 + shift, 240, x2 - sideSign * 4 + shift, y2 - 6);
  modelCtx.stroke();
  drawHand(x2 + shift, y2 + 7, sideSign);
  modelCtx.restore();
}

function drawHand(x, y, sideSign) {
  const gradient = modelCtx.createRadialGradient(x - sideSign * 6, y - 4, 3, x, y, 25);
  gradient.addColorStop(0, "#f7d5bd");
  gradient.addColorStop(1, "#b26f4c");
  modelCtx.fillStyle = gradient;
  modelCtx.beginPath();
  modelCtx.ellipse(x, y, 16, 21, sideSign * 0.18, 0, Math.PI * 2);
  modelCtx.fill();
}

function drawLeg(x1, y1, x2, y2, thighWidth, rotation, side) {
  const sideSign = side.startsWith("left") ? -1 : 1;
  const shift = rotation * sideSign * -7;
  modelCtx.save();
  modelCtx.lineCap = "round";
  modelCtx.strokeStyle = skinGradient(x1, y1, x2, y2, sideSign > 0);
  modelCtx.lineWidth = thighWidth;
  modelCtx.beginPath();
  modelCtx.moveTo(x1 + shift, y1);
  modelCtx.bezierCurveTo(x1 - sideSign * 10 + shift, 456, x2 - sideSign * 4 + shift, 516, x2 + shift, y2);
  modelCtx.stroke();

  modelCtx.strokeStyle = "rgba(255,255,255,0.22)";
  modelCtx.lineWidth = 7;
  modelCtx.beginPath();
  modelCtx.moveTo(x1 - sideSign * 4 + shift, y1 + 18);
  modelCtx.bezierCurveTo(x1 - sideSign * 14 + shift, 462, x2 - sideSign * 4 + shift, 522, x2 - sideSign * 2 + shift, y2 - 12);
  modelCtx.stroke();

  drawFoot(x2 + shift, y2 + 7, sideSign);
  modelCtx.restore();
}

function drawFoot(x, y, sideSign) {
  modelCtx.fillStyle = skinGradient(x - 22, y - 10, x + 22, y + 10, sideSign > 0);
  modelCtx.beginPath();
  modelCtx.ellipse(x + sideSign * 6, y, 24, 12, sideSign * 0.08, 0, Math.PI * 2);
  modelCtx.fill();
}

function drawTorso(rotation) {
  modelCtx.save();
  const torso = modelCtx.createRadialGradient(158 + rotation * 12, 165, 12, 184, 275, 170);
  torso.addColorStop(0, "#f8d8c1");
  torso.addColorStop(0.42, "#db9a70");
  torso.addColorStop(1, "#95563f");
  modelCtx.fillStyle = torso;
  modelCtx.beginPath();
  modelCtx.moveTo(128 + rotation * 10, 120);
  modelCtx.bezierCurveTo(150, 98, 210, 98, 232 + rotation * -10, 120);
  modelCtx.bezierCurveTo(254 + rotation * -8, 196, 258 + rotation * -10, 300, 216, 372);
  modelCtx.bezierCurveTo(202, 397, 158, 397, 144, 372);
  modelCtx.bezierCurveTo(102 + rotation * 8, 300, 106 + rotation * 10, 196, 128 + rotation * 10, 120);
  modelCtx.fill();

  modelCtx.strokeStyle = "rgba(101, 61, 45, 0.45)";
  modelCtx.lineWidth = 1.5;
  modelCtx.stroke();

  modelCtx.strokeStyle = "rgba(255,255,255,0.25)";
  modelCtx.lineWidth = 3;
  modelCtx.beginPath();
  modelCtx.moveTo(180 + rotation * 7, 126);
  modelCtx.bezierCurveTo(171 + rotation * 4, 190, 171 + rotation * 2, 310, 178, 374);
  modelCtx.stroke();

  modelCtx.strokeStyle = "rgba(97, 59, 45, 0.18)";
  modelCtx.lineWidth = 1;
  [178, 205, 234].forEach((y) => {
    modelCtx.beginPath();
    modelCtx.moveTo(136, y);
    modelCtx.bezierCurveTo(158, y + 8, 202, y + 8, 224, y);
    modelCtx.stroke();
  });

  modelCtx.fillStyle = "rgba(90, 48, 37, 0.13)";
  modelCtx.beginPath();
  modelCtx.ellipse(180 + rotation * 5, 302, 44, 74, 0, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.restore();
}

function drawBackTorso(rotation) {
  modelCtx.save();
  const torso = modelCtx.createRadialGradient(198 - rotation * 12, 155, 12, 178, 278, 165);
  torso.addColorStop(0, "#f3c8aa");
  torso.addColorStop(0.5, "#cf875f");
  torso.addColorStop(1, "#8b4d3b");
  modelCtx.fillStyle = torso;
  modelCtx.beginPath();
  modelCtx.moveTo(126 - rotation * 8, 120);
  modelCtx.bezierCurveTo(150, 100, 210, 100, 234 + rotation * 8, 120);
  modelCtx.bezierCurveTo(252, 198, 252, 306, 214, 374);
  modelCtx.bezierCurveTo(202, 398, 158, 398, 146, 374);
  modelCtx.bezierCurveTo(108, 306, 108, 198, 126 - rotation * 8, 120);
  modelCtx.fill();
  modelCtx.strokeStyle = "rgba(86, 50, 39, 0.48)";
  modelCtx.lineWidth = 1.5;
  modelCtx.stroke();

  modelCtx.strokeStyle = "rgba(80, 48, 39, 0.28)";
  modelCtx.lineWidth = 2;
  modelCtx.beginPath();
  modelCtx.moveTo(180, 118);
  modelCtx.bezierCurveTo(176, 190, 176, 292, 180, 382);
  modelCtx.stroke();
  [148, 212].forEach((x) => {
    modelCtx.strokeStyle = "rgba(255,255,255,0.18)";
    modelCtx.beginPath();
    modelCtx.moveTo(x, 140);
    modelCtx.bezierCurveTo(x - 12, 214, x - 8, 306, x + 4, 372);
    modelCtx.stroke();
  });
  modelCtx.restore();
}

function drawBackHead(rotation) {
  const head = modelCtx.createRadialGradient(194 - rotation * 8, 44, 8, 180, 64, 54);
  head.addColorStop(0, "#edc3a5");
  head.addColorStop(0.62, "#c87f5c");
  head.addColorStop(1, "#79483b");
  modelCtx.fillStyle = head;
  modelCtx.beginPath();
  modelCtx.ellipse(180 - rotation * 5, 64, 42, 49, -rotation * 0.08, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.fillStyle = "rgba(73, 48, 42, 0.2)";
  modelCtx.beginPath();
  modelCtx.ellipse(180, 47, 30, 18, 0, Math.PI, Math.PI * 2);
  modelCtx.fill();
}

function drawBackLandmarks(rotation) {
  modelCtx.save();
  modelCtx.strokeStyle = "rgba(47, 76, 76, 0.32)";
  modelCtx.setLineDash([4, 8]);
  modelCtx.beginPath();
  modelCtx.moveTo(180, 105);
  modelCtx.lineTo(180, 420);
  modelCtx.stroke();
  modelCtx.setLineDash([]);
  modelCtx.strokeStyle = "rgba(60, 43, 38, 0.22)";
  [180, 230, 285, 345, 382, 412].forEach((y) => {
    modelCtx.beginPath();
    modelCtx.moveTo(130, y);
    modelCtx.bezierCurveTo(154, y + 5, 206, y + 5, 230, y);
    modelCtx.stroke();
  });
  modelCtx.restore();
}

function drawSideTorso(side) {
  const torso = modelCtx.createRadialGradient(170 + side * 18, 170, 10, 180, 272, 150);
  torso.addColorStop(0, "#f5ceb3");
  torso.addColorStop(0.56, "#d28b62");
  torso.addColorStop(1, "#8d4f3c");
  modelCtx.fillStyle = torso;
  modelCtx.beginPath();
  modelCtx.moveTo(170, 118);
  modelCtx.bezierCurveTo(212 + side * 18, 126, 228 + side * 22, 202, 214 + side * 14, 310);
  modelCtx.bezierCurveTo(206 + side * 8, 368, 170, 392, 150, 362);
  modelCtx.bezierCurveTo(132 - side * 8, 292, 134 - side * 10, 190, 170, 118);
  modelCtx.fill();
  modelCtx.strokeStyle = "rgba(92, 55, 42, 0.42)";
  modelCtx.lineWidth = 1.5;
  modelCtx.stroke();
}

function drawSideHead(side) {
  const head = modelCtx.createRadialGradient(170 + side * 20, 48, 8, 180, 66, 54);
  head.addColorStop(0, "#f8d6c0");
  head.addColorStop(0.55, "#d48e67");
  head.addColorStop(1, "#8d523f");
  modelCtx.fillStyle = head;
  modelCtx.beginPath();
  modelCtx.ellipse(180 + side * 8, 66, 36, 49, side * 0.12, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.fillStyle = "rgba(85, 52, 44, 0.22)";
  modelCtx.beginPath();
  modelCtx.ellipse(192 + side * 12, 65, 4, 2.5, 0, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.strokeStyle = "rgba(86, 52, 42, 0.3)";
  modelCtx.beginPath();
  modelCtx.moveTo(200 + side * 12, 70);
  modelCtx.lineTo(211 + side * 13, 79);
  modelCtx.lineTo(199 + side * 11, 84);
  modelCtx.stroke();
}

function drawNeck(rotation) {
  modelCtx.fillStyle = skinGradient(150, 92, 210, 130);
  roundedRectPath(154 + rotation * 5, 92, 52, 54, 18);
  modelCtx.fill();
}

function roundedRectPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  modelCtx.beginPath();
  modelCtx.moveTo(x + r, y);
  modelCtx.lineTo(x + width - r, y);
  modelCtx.quadraticCurveTo(x + width, y, x + width, y + r);
  modelCtx.lineTo(x + width, y + height - r);
  modelCtx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  modelCtx.lineTo(x + r, y + height);
  modelCtx.quadraticCurveTo(x, y + height, x, y + height - r);
  modelCtx.lineTo(x, y + r);
  modelCtx.quadraticCurveTo(x, y, x + r, y);
  modelCtx.closePath();
}

function drawHead(rotation) {
  modelCtx.save();
  const head = modelCtx.createRadialGradient(164 + rotation * 10, 45, 8, 184, 64, 54);
  head.addColorStop(0, "#f8d7c0");
  head.addColorStop(0.56, "#d89369");
  head.addColorStop(1, "#9c5a41");
  modelCtx.fillStyle = head;
  modelCtx.beginPath();
  modelCtx.ellipse(180 + rotation * 8, 64, 42, 49, rotation * 0.08, 0, Math.PI * 2);
  modelCtx.fill();

  modelCtx.fillStyle = "rgba(78, 51, 44, 0.22)";
  modelCtx.beginPath();
  modelCtx.ellipse(166 + rotation * 12, 62, 4, 2, 0, 0, Math.PI * 2);
  modelCtx.ellipse(194 + rotation * 12, 62, 4, 2, 0, 0, Math.PI * 2);
  modelCtx.fill();
  modelCtx.strokeStyle = "rgba(88, 52, 42, 0.22)";
  modelCtx.beginPath();
  modelCtx.moveTo(180 + rotation * 10, 66);
  modelCtx.lineTo(176 + rotation * 10, 82);
  modelCtx.stroke();
  modelCtx.restore();
}

function drawSurfaceLandmarks(rotation) {
  modelCtx.save();
  modelCtx.strokeStyle = "rgba(54, 86, 85, 0.24)";
  modelCtx.setLineDash([5, 7]);
  modelCtx.beginPath();
  modelCtx.moveTo(180 + rotation * 5, 105);
  modelCtx.lineTo(180 + rotation * 2, 372);
  modelCtx.stroke();
  modelCtx.setLineDash([]);

  modelCtx.strokeStyle = "rgba(95, 58, 44, 0.22)";
  modelCtx.beginPath();
  modelCtx.moveTo(138, 134);
  modelCtx.bezierCurveTo(160, 150, 200, 150, 222, 134);
  modelCtx.stroke();
  modelCtx.restore();
}

function projectPoint(point) {
  if (isAuricularPoint(point) && modelView !== "ear") {
    return { x: Number(point.x), y: Number(point.y), depth: -100, scale: 0.7, opacity: 0, visible: false };
  }
  if (modelView === "ear") return projectEarPoint(point);
  if (modelView === "head") return projectHeadPoint(point);
  if (modelView === "limbs") return projectLimbPoint(point);
  if (modelView === "back") return projectBackPoint(point);
  if (modelView === "side") return projectSidePoint(point);
  if (modelView === "front") return projectAnatomyPlateFront(point);

  const rotation = Number(modelRotate.value) * Math.PI / 180;
  const x = Number(point.x);
  const y = Number(point.y);
  const centerX = 180;
  const dx = x - centerX;
  const depthHint = getDepthHint(point);
  const projectedX = centerX + dx * Math.cos(rotation) + depthHint * Math.sin(rotation);
  const projectedY = y + Math.abs(Math.sin(rotation)) * Math.min(18, Math.abs(dx) * 0.06);
  const depth = depthHint * Math.cos(rotation) - dx * Math.sin(rotation);
  const scale = Math.max(0.78, Math.min(1.18, 1 + depth / 420));
  const opacity = Math.max(0.5, Math.min(1, 0.86 + depth / 520));
  return { x: projectedX, y: projectedY, depth, scale, opacity, visible: true };
}

function projectAnatomyPlateFront(point) {
  const x = 248 + (Number(point.x) - 180) * 0.43;
  const y = 84 + Number(point.y) * 0.67;
  return {
    x: Math.max(186, Math.min(326, x)),
    y: Math.max(44, Math.min(500, y)),
    depth: getDepthHint(point),
    scale: isBackPoint(point) ? 0.82 : 1.02,
    opacity: isBackPoint(point) ? 0.42 : 0.96,
    visible: true
  };
}

function projectEarPoint(point) {
  if (!isAuricularPoint(point)) {
    return { x: Number(point.x), y: Number(point.y), depth: -100, scale: 0.7, opacity: 0, visible: false };
  }
  const anchor = earPointAnchors[point.code] || { x: Number(point.x), y: Number(point.y) };
  return {
    x: anchor.x,
    y: anchor.y,
    depth: 60,
    scale: point.code === selectedCode ? 1.16 : 1,
    opacity: 1,
    visible: true
  };
}

function isAuricularPoint(point) {
  return point.meridian === "Auricular / 耳穴"
    || point.region === "耳穴"
    || point.code.startsWith("EAR-")
    || /^(HX|AH|SC|TF|TG|AT|CO|LO)\d+/i.test(point.code);
}

function projectBackPoint(point) {
  const backLike = isBackPoint(point);
  const x = 108 + (180 - Number(point.x)) * 0.43;
  const y = 84 + Number(point.y) * 0.67;
  return {
    x: Math.max(34, Math.min(174, x)),
    y: Math.max(44, Math.min(500, y)),
    depth: backLike ? 42 : -28,
    scale: backLike ? 1.08 : 0.84,
    opacity: backLike ? 1 : 0.42,
    visible: backLike || /頭|頸|肩|腿|膝|踝|足/.test(point.region)
  };
}

function projectSidePoint(point) {
  const side = Math.sign(Number(modelRotate.value)) || 1;
  const x = Number(point.x);
  const y = Number(point.y);
  const lateral = Math.abs(x - 180);
  const sideBias = Math.sign(x - 180 || side);
  const depth = getDepthHint(point);
  const visibleSide = sideBias === side || /CV|GV|頭|頸|胸|腹|背|腰|骶/.test(`${point.code} ${point.region}`);
  return {
    x: 180 + side * (Math.min(72, lateral * 0.46) + depth * 0.18),
    y: y + (isBackPoint(point) ? -4 : 0),
    depth,
    scale: visibleSide ? 1.02 : 0.78,
    opacity: visibleSide ? 0.96 : 0.34,
    visible: true
  };
}

function projectHeadPoint(point) {
  const text = `${point.region} ${point.nameZh} ${point.code}`;
  const isHead = /頭|面|鼻|眉|眼|頸|GB20|GV20|GV26|EX-HN/.test(text);
  if (!isHead) {
    return { x: Number(point.x), y: Number(point.y), depth: -80, scale: 0.72, opacity: 0, visible: false };
  }
  const projected = isBackPoint(point) ? projectBackPoint(point) : projectAnatomyPlateFront(point);
  return { ...projected, scale: 1.14, opacity: 1, visible: true };
}

function projectLimbPoint(point) {
  const region = point.region || "";
  if (/手|腕|肘|前臂|肩|臂|腿|膝|足|踝|小腿|大腿/.test(region)) {
    const projected = isBackPoint(point) ? projectBackPoint(point) : projectAnatomyPlateFront(point);
    return { ...projected, scale: 1.1, opacity: 1, visible: true };
  }
  return {
    x: Number(point.x),
    y: Number(point.y),
    depth: -70,
    scale: 0.72,
    opacity: 0,
    visible: false
  };
}

function frontBackMirror(point, backLike) {
  const x = Number(point.x);
  return {
    x: backLike ? 360 - x : x,
    y: Number(point.y)
  };
}

function isBackPoint(point) {
  return /背|腰|骶|俞|BL|GV14|GV20|GB20|BL10/.test(`${point.region} ${point.nameZh} ${point.code}`);
}

function getDepthHint(point) {
  if (/背|俞|腰|骶|BL/.test(`${point.region} ${point.nameZh} ${point.code}`)) return -44;
  if (/胸|腹|CV|中脘|氣海|關元|膻中/.test(`${point.region} ${point.nameZh} ${point.code}`)) return 34;
  if (/頭|面|鼻|眉/.test(`${point.region} ${point.nameZh}`)) return 24;
  if (/手|腕|肘|前臂|肩/.test(point.region)) return Math.sign(Number(point.x) - 180 || 1) * 28;
  if (/腿|膝|足|踝/.test(point.region)) return Math.sign(Number(point.x) - 180 || 1) * 18;
  return 0;
}

function handleModelClick(event) {
  if (!bodyCanvas) return;
  const rect = bodyCanvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * 360 / rect.width;
  const y = (event.clientY - rect.top) * 620 / rect.height;
  const closest = visibleMapPoints
    .map((item) => ({ ...item, distance: Math.hypot(item.projected.x - x, item.projected.y - y) }))
    .sort((a, b) => a.distance - b.distance)[0];
  if (closest && closest.distance < 20) selectPoint(closest.point.code);
}

function renderCards(filtered) {
  cardsEl.innerHTML = "";
  filtered.forEach((point) => {
    const card = document.createElement("article");
    card.className = `card ${point.code === selectedCode ? "active" : ""}`;
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.setAttribute("data-point-card", point.code);
    card.setAttribute(
      "aria-label",
      contentMode === "english"
        ? `Open acupoint page for ${point.nameEn} ${point.code}`
        : `開啟 ${point.nameZh} ${point.code} 單穴頁`
    );
    card.innerHTML = `
      <div class="card-head">
        <div>
          <h3>${escapeHtml(pointTitle(point))}</h3>
          <p>${escapeHtml(pointSubtitle(point))}</p>
        </div>
        <span class="code-pill">${point.code}</span>
      </div>
      <p>${escapeHtml(contentMode === "english" ? (point.locationEn || point.location) : point.location)}</p>
      <div class="tag-row">${cardTags(point).map(tag).join("")}</div>
      <div class="card-action-row">
        <span>${contentMode === "english" ? "Open point page" : "開啟單穴頁"}</span>
        <small>${escapeHtml(point.code)}</small>
      </div>
    `;
    card.addEventListener("click", () => selectPoint(point.code));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectPoint(point.code);
      }
    });
    cardsEl.append(card);
  });
}

function pointTitle(point) {
  // 中文名永遠在最前；英文名跟在後面（代碼另有 code-pill 顯示）。
  if (!point.nameZh || point.nameZh === point.nameEn) return `${point.nameEn}`;
  return `${point.nameZh} ${point.nameEn}`;
}

function pointSubtitle(point) {
  return contentMode === "english" ? `${point.pinyin} · ${shortMeridianEn(point)}` : `${point.pinyin} · ${point.meridian}`;
}

function cardTags(point) {
  if (contentMode === "english") return [regionEn(point), ...(point.patternsEn || [])].filter(Boolean).slice(0, 3);
  return (point.patterns || []).slice(0, 3);
}

function renderDetail(point) {
  if (!point) {
    detailCard.innerHTML = `<div class="empty-detail">沒有符合條件的穴位。可以調整搜尋，或新增一筆資料。</div>`;
    if (selectedCodeEl) selectedCodeEl.textContent = "無選取";
    return;
  }
  if (selectedCodeEl) selectedCodeEl.textContent = `${point.code} ${point.nameZh}`;
  const related = relatedPoints(point);
  const pairings = commonPairings(point);
  const moxaText = point.moxibustion || inferMoxaText(point);
  const sourceLinks = externalPointLinks(point);
  detailCard.innerHTML = `
    <nav class="point-breadcrumb" aria-label="breadcrumb">${escapeHtml(breadcrumbText(point))}</nav>
    <div class="point-page-toolbar">
      <button class="ghost" type="button" id="backToDirectoryBtn">${contentMode === "english" ? "Back to acupoint list" : "返回穴位列表"}</button>
      <span>${escapeHtml(point.code)} ${escapeHtml(point.nameZh || point.nameEn)}</span>
    </div>
    <div class="point-study-layout">
      <main class="point-article">
        <section class="point-hero-card">
          <div class="hero-watermark">${escapeHtml((point.nameZh || point.nameEn).slice(0, 1))}</div>
          <div class="point-hero-top">
            <div>
              <div class="hero-badges">
                <span>${escapeHtml(contentMode === "english" ? shortMeridianEn(point) : shortMeridian(point))}</span>
                <span>${escapeHtml(point.code)}</span>
              </div>
              <h2>${escapeHtml(point.nameZh || point.nameEn)}</h2>
              <p>${escapeHtml(heroSubtitle(point))}</p>
            </div>
            <div class="hero-actions">
              ${sourceLinks.map((link) => `<a class="${escapeAttribute(link.kind)}" href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`).join("")}
              <button class="hero-copy-btn" type="button" id="copyPointLinkBtn">${contentMode === "english" ? "Copy page link" : "複製分頁連結"}</button>
              <button class="hero-edit-btn" type="button" id="editBtn">${contentMode === "english" ? "Edit" : "編輯資料"}</button>
            </div>
          </div>
          <div class="hero-fact-grid">
            ${heroFact(contentMode === "english" ? "Channel" : "所屬經絡", contentMode === "english" ? shortMeridianEn(point) : shortMeridian(point), point.code)}
            ${heroFact(contentMode === "english" ? "Region" : "身體部位", contentMode === "english" ? regionEn(point) : (point.region || "未分類"), contentMode === "english" ? (point.locationEn || point.location) : point.location)}
            ${heroFact(contentMode === "english" ? "Needling" : "針刺/手法", shortTechnique(point), contentMode === "english" ? "Verify with professional sources and clinical training" : "依專業來源與臨床訓練判斷")}
            ${heroFact(contentMode === "english" ? "Moxibustion" : "艾灸", contentMode === "english" ? moxaTextEn(moxaText) : moxaText, contentMode === "english" ? "Based on presentation and contraindications" : (point.cautions || "依體質與病勢判斷"))}
          </div>
        </section>

        ${renderPointCategoryBadges(point)}
        ${window.AcuTingReview ? window.AcuTingReview.strip("point", point.code, point.reviewStatus) : ""}
        ${studySection(contentMode === "english" ? "Overview" : "基本介紹", pointIntro(point))}
        ${studySection(contentMode === "english" ? "Point Location" : "取穴方法", pointLocationArticle(point), "location")}
        ${visualLinksSection(point)}
        ${studySection(contentMode === "english" ? "Indications" : "主治病症", indicationArticle(point), "target")}
        ${combinePointsSection(point)}
        ${pairingSection(pairings)}
        ${studySection(contentMode === "english" ? "Needling and Moxibustion" : "針刺與艾灸", needlingArticle(point), "needle")}
        ${studySection(contentMode === "english" ? "Clinical Notes and Evidence" : "現代研究 / 臨床提醒", evidenceText(point), "research")}
        ${classicalRefsSection(point)}
        ${studySection(contentMode === "english" ? "Cautions" : "注意事項", cautionText(point), "warning")}
        ${studySection(contentMode === "english" ? "Sources" : "參考來源", formatSources(point.sources), "sources")}
      </main>

      <aside class="point-sidebar" aria-label="相關穴道與常用配穴">
        <section class="sidebar-box">
          <h3>${contentMode === "english" ? "Related Points" : "相關穴道"}</h3>
          ${related.map((item) => relatedPointButton(item, item.code)).join("") || `<p>${contentMode === "english" ? "No related points yet." : "尚未建立相關穴道。"}</p>`}
        </section>
        <section class="sidebar-box">
          <h3>${contentMode === "english" ? "Common Pairings" : "常用配穴"}</h3>
          ${pairings.map((item) => relatedPointButton(item, sharedPatternLabel(point, item))).join("") || `<p>${contentMode === "english" ? "Pairings pending." : "待補常用配穴。"}</p>`}
        </section>
      </aside>
    </div>
  `;
  document.querySelector("#backToDirectoryBtn")?.addEventListener("click", () => {
    isSyncingPointHash = true;
    window.location.hash = "#acupointDirectory";
    isSyncingPointHash = false;
    render();
    document.querySelector("#acupointDirectory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.querySelector("#editBtn").addEventListener("click", () => openEditor(point));
  document.querySelector("#copyPointLinkBtn")?.addEventListener("click", () => copyPointLink(point));
  detailCard.querySelectorAll("[data-related-point]").forEach((button) => {
    button.addEventListener("click", () => selectPoint(button.dataset.relatedPoint));
  });
  // PC5: category badge → filter the directory by that 特定穴 category
  detailCard.querySelectorAll("[data-category-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      directoryPointCategory = button.dataset.categoryJump;
      searchInput.value = "";   // show all points in the category
      clearPointDetailHash();
      render();
      document.querySelector("#acupointDirectory")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

const FIVE_SHU_ELEMENT_ZH = { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" };

// PC5: 特定穴 badges on the point detail page (point → categories). Each badge
// links to the directory filtered by that category (the bidirectional loop).
function renderPointCategoryBadges(point) {
  const cats = point.pointCategories || [];
  if (!cats.length) return "";
  const badges = cats.map((id) => {
    const c = pointCategoryLabelById.get(id);
    const label = c ? (contentMode === "english" ? c.label_en : c.label_zh) : id;
    let extra = "";
    if (id.startsWith("five_shu.") && point.fiveShuElement) {
      extra = ` · ${FIVE_SHU_ELEMENT_ZH[point.fiveShuElement] || point.fiveShuElement}`;
    }
    return `<button type="button" class="point-cat-badge" data-category-jump="${escapeAttribute(id)}">${escapeHtml(label)}${escapeHtml(extra)}</button>`;
  }).join("");
  return `<div class="point-cat-badges" aria-label="${contentMode === "english" ? "Specific-point types" : "特定穴類型"}">
    <span class="pcb-label">${contentMode === "english" ? "Specific-point types" : "特定穴"}</span>${badges}
  </div>`;
}

function relatedPointButton(item, meta) {
  const label = contentMode === "english" ? item.nameEn : item.nameZh;
  const actionLabel = contentMode === "english" ? "Open point page" : "開啟單穴頁";
  return `
    <button type="button" class="related-point-action" data-related-point="${escapeAttribute(item.code)}" aria-label="${escapeAttribute(`${actionLabel}: ${label} ${item.code}`)}">
      <span class="related-point-main">
        <strong>${escapeHtml(label)}</strong>
        <small>${escapeHtml(meta || item.code)}</small>
      </span>
      <span class="related-point-open">${escapeHtml(actionLabel)}</span>
    </button>
  `;
}

function heroFact(title, value, detail) {
  return `
    <article>
      <span>${escapeHtml(title)}</span>
      <strong>${escapeHtml(value || "待補")}</strong>
      <small>${escapeHtml(detail || "")}</small>
    </article>
  `;
}

function copyPointLink(point) {
  const url = `${window.location.origin}${window.location.pathname}${pointHash(point.code)}`;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      const button = document.querySelector("#copyPointLinkBtn");
      if (!button) return;
      const original = button.textContent;
      button.textContent = contentMode === "english" ? "Copied" : "已複製";
      setTimeout(() => { button.textContent = original; }, 1200);
    }).catch(() => alert(url));
    return;
  }
  alert(url);
}

function studySection(title, body, tone = "book") {
  return `
    <section class="study-section ${escapeAttribute(tone)}">
      <h3>${escapeHtml(title)}</h3>
      <div class="study-copy">${formatStudyText(body)}</div>
    </section>
  `;
}

function visualLinksSection(point) {
  const links = normalizeVisualLinks(point.visualLinks || []);
  const title = contentMode === "english" ? "Visual References" : "圖像參考";
  if (!links.length) return studySection(title, contentMode === "english" ? "No visual reference links yet." : "尚未建立外部圖像連結。", "visual");
  return `
    <section class="study-section visual">
      <h3>${escapeHtml(title)}</h3>
      <div class="visual-link-grid">
        ${links.map((link) => `
          <a href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer">
            <strong>${escapeHtml(contentMode === "english" ? link.labelEn : link.labelZh)}</strong>
            <span>${escapeHtml(link.source || safeHostname(link.url))}</span>
          </a>
        `).join("")}
      </div>
      <p class="visual-note">${contentMode === "english"
        ? "External diagrams open in a new tab. Use them as visual references and verify against professional sources before clinical use."
        : "外部圖會在新分頁開啟。先作定位參考，臨床使用仍要對照專業教材與安全規範。"}</p>
    </section>
  `;
}

function pairingSection(pairings) {
  const title = contentMode === "english" ? "Common Pairings" : "常用配穴";
  if (!pairings.length) return studySection(title, contentMode === "english" ? "Pairings are pending professional source review." : "待依臨床來源補入常用配穴、功效與適應證。", "link");
  return `
    <section class="study-section link">
      <h3>${escapeHtml(title)}</h3>
      <div class="pairing-table" role="table" aria-label="${escapeAttribute(title)}">
        <div class="pairing-row head" role="row"><span>${contentMode === "english" ? "Point" : "配穴"}</span><span>${contentMode === "english" ? "Possible Use" : "可能用途"}</span><span>${contentMode === "english" ? "Action" : "動作"}</span></div>
        ${pairings.map((item) => `
          <button class="pairing-row" type="button" data-related-point="${escapeAttribute(item.code)}" role="row" aria-label="${escapeAttribute(`${contentMode === "english" ? "Open point page" : "開啟單穴頁"}: ${contentMode === "english" ? item.nameEn : item.nameZh} ${item.code}`)}">
            <span>${escapeHtml(contentMode === "english" ? item.nameEn : item.nameZh)} ${escapeHtml(item.code)}</span>
            <span>${escapeHtml(contentMode === "english" ? primaryFunctionEn(item) : primaryFunction(item))}</span>
            <span class="pairing-action-label">${contentMode === "english" ? "Open point page" : "開啟單穴頁"}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function tag(text) {
  return `<span class="tag">${escapeHtml(text)}</span>`;
}

function shortMeridian(point) {
  return String(point.meridian || "").split("/")[0].trim() || "未分類";
}

function shortMeridianEn(point) {
  return String(point.meridian || "").split("/")[0].trim() || "Uncategorized";
}

function regionEn(point) {
  const text = `${point.region || ""} ${point.locationEn || ""} ${point.location || ""}`;
  if (/head|face|scalp|eye|nose|頭|面|鼻|眼|眉|項|頸/i.test(text)) return "Head and face";
  if (/chest|abdomen|thorax|腹|胸/i.test(text)) return "Chest and abdomen";
  if (/back|lumbar|sacral|背|腰|骶/i.test(text)) return "Back";
  if (/hand|wrist|elbow|forearm|arm|shoulder|手|腕|肘|臂|肩/i.test(text)) return "Upper limb";
  if (/leg|knee|ankle|foot|lower limb|腿|膝|踝|足|下肢/i.test(text)) return "Lower limb";
  if (/ear|auricular|耳/i.test(text)) return "Auricular";
  return "Body region";
}

function breadcrumbText(point) {
  return contentMode === "english"
    ? `Home > Acupoints > ${shortMeridianEn(point)} > ${point.nameEn}`
    : `首頁 › 穴道 › ${shortMeridian(point)} › ${point.nameZh}`;
}

function heroSubtitle(point) {
  // 中文大標題在上（renderDetail 的 h2）；副標題固定放拼音、英文名、國際代碼。
  const base = [point.pinyin, point.nameEn, point.code].filter(Boolean).join(" · ");
  const fn = contentMode === "english" ? primaryFunctionEn(point) : primaryFunction(point);
  return fn && !isPendingContent(fn) ? `${base} · ${fn}` : base;
}

function externalPointLinks(point) {
  const sources = point.sources || [];
  const visualLinks = normalizeVisualLinks(point.visualLinks || []);
  if (isAuricularPoint(point)) {
    const primary = visualLinks[0]?.url || sources[0] || "https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95";
    return contentMode === "english"
      ? [{ label: "Visual source", url: primary, kind: "english" }]
      : [{ label: "耳穴圖源", url: primary, kind: "english" }];
  }
  if (String(point.meridian || "").includes("Master Tung")) {
    const primary = visualLinks[0]?.url || sources[0] || "https://www.mastertungacupuncture.org/";
    return contentMode === "english"
      ? [{ label: "eLotus source", url: primary, kind: "english" }]
      : [{ label: "董氏圖源", url: primary, kind: "english" }];
  }
  const english = sources.find((source) => source.includes("acupoints.org")) || `https://www.acupoints.org/${String(point.code).toLowerCase()}-acupuncture-point/`;
  // Only trust a stored CloudTCM URL if it uses the real numeric-id page
  // (cloudtcm.com/acupoint/123). Slug-style ones like /acupoint/bl61 are
  // fabricated and 404, so fall back to a reliable name search.
  const storedChinese = sources.find((source) => /cloudtcm\.com\/acupoint\/\d+/.test(source));
  const chinese = storedChinese || chinesePointReference(point);
  if (contentMode === "english") {
    return [
      { label: "English source", url: english, kind: "english" },
      { label: "Source policy", url: "#sourceSection", kind: "chinese" }
    ];
  }
  return [
    { label: "英文來源", url: english, kind: "english" },
    { label: "中文來源", url: chinese, kind: "chinese" }
  ];
}

function primaryFunction(point) {
  return String(point.functions || point.functionsEn || "待補功效").split(/[，,。.\n]/)[0].trim();
}

function primaryFunctionEn(point) {
  return String(point.functionsEn || point.functions || "Actions pending").split(/[，,。.\n]/)[0].trim();
}

function shortTechnique(point) {
  const text = formatTechniqueNotes(point);
  const depth = String(point.needlingDepth || "").trim();
  if (depth) return depth;
  const match = text.match(/(?:平刺|直刺|斜刺|oblique|transverse|perpendicular)[^。\n；;]*/i);
  return match ? match[0] : "待補";
}

function inferMoxaText(point) {
  const caution = `${point.cautions || ""} ${point.techniqueNotes || ""}`;
  if (/禁灸|不宜灸|moxa contraindicated/i.test(caution)) return "不建議";
  if (/艾灸|moxa/i.test(caution)) return "依證適用";
  return "待補";
}

function moxaTextEn(text) {
  if (/不建議|禁|contra/i.test(text)) return "Not recommended";
  if (/適用|moxa/i.test(text)) return "As indicated";
  return "Pending";
}

function pointIntro(point) {
  if (contentMode === "english") {
    return `${point.nameEn} (${point.pinyin}; ${point.code}) belongs to the ${shortMeridianEn(point)}. It is located in the ${regionEn(point).toLowerCase()} region.\n\nActions: ${point.functionsEn || "Actions pending professional source review."}\n\nThis public English draft should be reviewed against WHO-style location standards, professional textbooks, and English clinical safety sources before publication.`;
  }
  return `${point.nameZh} (${point.pinyin}; ${point.nameEn}) 屬於 ${shortMeridian(point)}，位置在${point.region || "未分類部位"}。${point.functions || "本穴功效待補。"}\n\n臨床學習時可同時對照中文主治、英文定位、解剖名詞與針刺安全提醒。`;
}

function pointLocationArticle(point) {
  if (contentMode === "english") {
    return [
      `Standard location draft: ${point.locationEn || "English location pending."}`,
      `Code and region:\n${formatStandardMeta(point)}`,
      `Anatomy terms:\n${formatAnatomy(point.anatomy, "english")}`
    ].filter(Boolean).join("\n\n");
  }
  return [
    `標準定位：${point.location || "待補中文定位。"}`,
    point.locationEn ? `English location: ${point.locationEn}` : "English location: pending.",
    formatStandardMeta(point),
    `解剖對照：${formatAnatomy(point.anatomy)}`
  ].filter(Boolean).join("\n\n");
}

function indicationArticle(point) {
  if (contentMode === "english") {
    const patterns = (point.patternsEn || []).filter(Boolean).join("\n") || "Indications pending.";
    return [
      point.functionsEn ? `Actions: ${point.functionsEn}` : "",
      `Common indications / patterns:\n${patterns}`
    ].filter(Boolean).join("\n\n");
  }
  const patterns = bilingualPatterns(point) || "待補主治病症。";
  return [
    point.functions ? `功效：${point.functions}` : "",
    point.functionsEn ? `Actions: ${point.functionsEn}` : "",
    `常見主治 / Patterns:\n${patterns}`
  ].filter(Boolean).join("\n\n");
}

function combinePointsSection(point) {
  if (!point.combinePointsZh) return "";
  const title = contentMode === "english" ? "Point Pairings & Clinical Combinations" : "🎯 穴位配伍與臨床應用";
  return studySection(title, point.combinePointsZh, "link");
}

function classicalRefsSection(point) {
  if (!point.classicalRefs || !point.classicalRefs.length) return "";
  const title = contentMode === "english" ? "Classical Literature References" : "📜 古籍經典引用";
  const text = point.classicalRefs.map(r => `《${r.source_zh}》：${r.excerpt_zh}`).join("\n\n");
  return studySection(title, text, "book");
}

function needlingArticle(point) {
  const parts = [];
  if (point.acumethodZh) parts.push(`【針刺方法】\n${point.acumethodZh}`);
  else if (point.techniqueNotes) parts.push(`【針刺方法】\n${point.techniqueNotes}`);

  if (point.moxaZh) parts.push(`【艾灸與遠紅外線】\n${point.moxaZh}`);
  if (point.massageZh) parts.push(`【自我保健與按摩】\n${point.massageZh}`);

  if (contentMode === "english") {
    if (point.cautions) parts.push(`Safety note: ${point.cautions}`);
    parts.push("Needling depth, angle, reinforcing/reducing method, and moxibustion should be verified against professional training, anatomy, patient presentation, and contraindications.");
  } else {
    if (point.cautions) parts.push(`【安全提醒】\n${point.cautions}`);
    parts.push("實際針刺深度、角度、補瀉與艾灸需依專業教材、解剖安全、體質、病勢與臨床訓練判斷。");
  }
  return parts.filter(Boolean).join("\n\n");
}

function evidenceText(point) {
  const parts = [];
  if (point.modernResearchZh) parts.push(`【現代臨床與研究】\n${point.modernResearchZh}`);
  if (point.anatomyZh) parts.push(`【穴位解剖構造】\n${point.anatomyZh}`);
  if (point.evidence) parts.push(`【學習提醒】\n${point.evidence}`);
  if (parts.length > 0) return parts.join("\n\n");
  if (contentMode === "english") return "Clinical and evidence notes are pending.";
  return "目前先保留為臨床學習提醒。";
}

function cautionText(point) {
  if (contentMode === "english") return point.cautions || "No specific cautions entered yet. Clinical use requires professional training, anatomy-based safety assessment, and patient-specific contraindication screening.";
  return point.cautions || "無特別標註。實際操作仍需依專業訓練、解剖安全、患者體質與禁忌判斷。";
}

function relatedPoints(point) {
  return points
    .filter((item) => item.code !== point.code && shortMeridian(item) === shortMeridian(point))
    .slice(0, 5);
}

function commonPairings(point) {
  const pointPatterns = new Set([...(point.patterns || []), ...(point.patternsEn || [])].map((item) => String(item).toLowerCase()));
  return points
    .filter((item) => item.code !== point.code)
    .map((item) => {
      const shared = [...(item.patterns || []), ...(item.patternsEn || [])].filter((pattern) => pointPatterns.has(String(pattern).toLowerCase()));
      return { ...item, sharedCount: shared.length };
    })
    .filter((item) => item.sharedCount > 0)
    .sort((a, b) => b.sharedCount - a.sharedCount)
    .slice(0, 4);
}

function sharedPatternLabel(point, item) {
  const pointPatterns = new Set([...(point.patterns || []), ...(point.patternsEn || [])].map((pattern) => String(pattern).toLowerCase()));
  const source = contentMode === "english" ? (item.patternsEn || []) : (item.patterns || []);
  const shared = source.find((pattern) => pointPatterns.has(String(pattern).toLowerCase()));
  return shared || (contentMode === "english" ? "Similar indications" : "同經/相近主治");
}

function formatStudyText(text) {
  return String(text || "待補")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

function earPointLabel(point) {
  return `
    <span class="ear-code">${escapeHtml(point.standardCode || point.code)}</span>
    <span>${escapeHtml(point.nameZh)}</span>
    <small>${escapeHtml(point.nameEn)}</small>
  `;
}

function infoBlock(title, text) {
  return `<section class="info-block"><h3>${title}</h3><p>${escapeHtml(text)}</p></section>`;
}

function bilingualText(zh, en) {
  return [zh, en].filter(Boolean).join("\n");
}

function bilingualPatterns(point) {
  /* The zh and en indication lists were compiled independently and are NOT
     parallel translations — pairing patterns[i] = patternsEn[i] produced wrong
     equivalences like 血瘀 = Vomiting on BL17. Only pair a Chinese term with an
     English one when a curated term map actually knows the translation;
     otherwise show the two lists separately rather than assert a false mapping. */
  const zh = point.patterns || [];
  const en = point.patternsEn || [];
  const paired = zh
    .map((term) => (patternEnglishMap[term] ? `${term} = ${patternEnglishMap[term]}` : null))
    .filter(Boolean);

  if (paired.length === zh.length && zh.length) return paired.join("\n");

  // No reliable per-term map: present each language's list honestly, unpaired.
  const lines = [];
  if (zh.length) lines.push(`主治（中文）：${zh.join("、")}`);
  if (en.length) lines.push(`Indications (EN): ${en.join(", ")}`);
  return lines.join("\n") || "待補主治病症。";
}

function formatTechniqueNotes(point) {
  if (point.techniqueNotes) return point.techniqueNotes;
  const rows = [
    point.needlingDepth ? `針刺深度 Depth: ${point.needlingDepth}` : "",
    point.needlingAngle ? `角度/方向 Angle: ${point.needlingAngle}` : "",
    point.needlingMethod ? `手法/得氣 Technique: ${point.needlingMethod}` : "",
    point.tonificationSedation ? `補瀉 Tonification/Sedation: ${point.tonificationSedation}` : "",
    point.moxibustion ? `艾灸 Moxibustion: ${point.moxibustion}` : "",
    point.forbiddenActions ? `禁忌 Forbidden: ${point.forbiddenActions}` : ""
  ].filter(Boolean);
  if (rows.length) return rows.join("\n");
  return contentMode === "english"
    ? "Needling details pending professional source review; include depth, angle/direction, technique, moxibustion, and contraindications."
    : "待逐穴依專業來源補入；包含針刺深度、角度/方向、補瀉、艾灸與禁忌。";
}

function formatAnatomy(anatomy = [], mode = contentMode) {
  if (!anatomy.length) return mode === "english" ? "Not yet annotated" : "尚未標註";
  if (mode === "english") return anatomy.map((item) => item.en || item.zh).filter(Boolean).join("\n");
  return anatomy.map((item) => `${item.zh} = ${item.en}`).join("\n");
}

function formatSources(sources = []) {
  if (!sources.length) return contentMode === "english" ? "Sources pending" : "尚未標註";
  const visibleSources = contentMode === "english"
    ? sources.filter((source) => !source.includes("cloudtcm.com") && !source.includes("a-hospital.com"))
    : sources;
  const rows = visibleSources.map((source) => {
    if (source.includes("acupoints.org")) return `English source: ${source}`;
    if (source.includes("cloudtcm.com")) return `中文來源: ${source}`;
    if (source.includes("who.int") || source.toLowerCase().includes("who")) return `Core standard: ${source}`;
    return `Reference: ${source}`;
  });
  if (contentMode === "english") rows.push("Public source rule: verify against WHO-style standards, professional textbooks, NCCAOM/NCCIH where relevant, and peer-reviewed evidence before publishing.");
  return rows.join("\n");
}

function formatStandardMeta(point) {
  return [
    `Code: ${point.standardCode || point.code}`,
    point.standardRegion ? `Region: ${point.standardRegion}` : "",
    point.standardZone ? `Zone: ${point.standardZone}` : ""
  ].filter(Boolean).join("\n");
}

function normalizeClinicalCase(value) {
  return {
    id: String(value.id || createId("case")),
    patientCode: String(value.patientCode || ""),
    caseTitle: String(value.caseTitle || ""),
    caseCategory: String(value.caseCategory || ""),
    status: String(value.status || "active"),
    startDate: String(value.startDate || ""),
    birthYear: value.birthYear ? Number(value.birthYear) : "",
    birthYearMonth: String(value.birthYearMonth || ""),
    sex: String(value.sex || ""),
    occupation: String(value.occupation || ""),
    goals: String(value.goals || ""),
    chiefComplaint: String(value.chiefComplaint || ""),
    historyPresent: String(value.historyPresent || ""),
    pastHistory: String(value.pastHistory || ""),
    allergies: String(value.allergies || ""),
    currentMeds: String(value.currentMeds || ""),
    menstrualObHistory: String(value.menstrualObHistory || ""),
    lifestyle: String(value.lifestyle || ""),
    westernConditions: Array.isArray(value.westernConditions) ? value.westernConditions.map(String) : splitList(String(value.westernConditions || "")),
    easternDiseases: Array.isArray(value.easternDiseases) ? value.easternDiseases.map(String) : splitList(String(value.easternDiseases || "")),
    tcmPatterns: Array.isArray(value.tcmPatterns) ? value.tcmPatterns.map(String) : splitList(String(value.tcmPatterns || "")),
    safetyFlags: Array.isArray(value.safetyFlags) ? value.safetyFlags.map(String) : splitList(String(value.safetyFlags || "")),
    summary: String(value.summary || ""),
    soapNotes: Array.isArray(value.soapNotes) ? value.soapNotes.map(normalizeSoapNote) : [],
    createdAt: String(value.createdAt || new Date().toISOString()),
    updatedAt: String(value.updatedAt || new Date().toISOString())
  };
}

function normalizeSoapNote(value) {
  return {
    id: String(value.id || createId("soap")),
    visitDate: String(value.visitDate || ""),
    visitNumber: value.visitNumber ? Number(value.visitNumber) : "",
    cycleDay: value.cycleDay ? Number(value.cycleDay) : "",
    fertilityPhase: String(value.fertilityPhase || ""),
    workflowLink: String(value.workflowLink || ""),
    cyclePhase: String(value.cyclePhase || ""),
    tongueBody: String(value.tongueBody || ""),
    tongueCoating: String(value.tongueCoating || ""),
    pulse: String(value.pulse || ""),
    vitals: String(value.vitals || ""),
    tcmPattern: String(value.tcmPattern || ""),
    pathomechanism: String(value.pathomechanism || ""),
    treatmentPrinciple: String(value.treatmentPrinciple || ""),
    modalities: String(value.modalities || ""),
    advice: String(value.advice || ""),
    westernConditionLinks: normalizeStringList(value.westernConditionLinks),
    easternDiseaseLinks: normalizeStringList(value.easternDiseaseLinks),
    tcmPatternLinks: normalizeStringList(value.tcmPatternLinks),
    safetyFlagLinks: normalizeStringList(value.safetyFlagLinks),
    subjective: String(value.subjective || ""),
    objective: String(value.objective || ""),
    assessment: String(value.assessment || ""),
    plan: String(value.plan || ""),
    pointsUsed: String(value.pointsUsed || ""),
    acupointLinks: normalizeStringList(value.acupointLinks),
    retentionMinutes: value.retentionMinutes ? Number(value.retentionMinutes) : "",
    technique: String(value.technique || ""),
    formulaHerbs: String(value.formulaHerbs || ""),
    formulaLinks: normalizeStringList(value.formulaLinks),
    westernMeds: String(value.westernMeds || ""),
    medicationLinks: normalizeStringList(value.medicationLinks),
    outcomes: String(value.outcomes || ""),
    outcomeMetricLinks: normalizeStringList(value.outcomeMetricLinks),
    outcomeVerdict: OUTCOME_VERDICTS[value.outcomeVerdict] ? value.outcomeVerdict : "",   // LL2
    followUp: String(value.followUp || ""),
    // LL1 按語: optional structured reflection (Learning Loop track)
    differentialConsidered: String(value.differentialConsidered || ""),
    reflection: String(value.reflection || ""),
    ifIneffectivePlan: String(value.ifIneffectivePlan || ""),
    createdAt: String(value.createdAt || new Date().toISOString()),
    updatedAt: String(value.updatedAt || new Date().toISOString())
  };
}

function normalizeStringList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return splitList(String(value || ""));
}

function formatNoteList(value, fallback = "未連結") {
  const list = normalizeStringList(value);
  return list.length ? list.join("、") : fallback;
}

function createId(prefix) {
  return `${prefix}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 8)}`;
}

function renderClinicalCases() {
  if (learnFromMode) return renderLearnFromReview();
  const filtered = getFilteredClinicalCases();
  if (selectedCaseId && !clinicalCases.some((item) => item.id === selectedCaseId)) selectedCaseId = clinicalCases[0]?.id || "";
  if (!selectedCaseId && filtered.length) selectedCaseId = filtered[0].id;
  caseResultCount.textContent = `${filtered.length} cases`;
  caseList.innerHTML = "";

  if (!filtered.length) {
    caseList.innerHTML = `<div class="case-empty">尚未有病例。<br>先用 patient_code 建立第一筆。</div>`;
  } else {
    filtered.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `case-list-item ${item.id === selectedCaseId ? "active" : ""}`;
      button.innerHTML = `
        <span>${escapeHtml(item.patientCode || "No code")}</span>
        <strong>${escapeHtml(item.caseTitle || "Untitled case")}</strong>
        <small>${escapeHtml([item.caseCategory, item.status, `${item.soapNotes.length} SOAP`].filter(Boolean).join(" · "))}</small>
      `;
      button.addEventListener("click", () => {
        selectedCaseId = item.id;
        renderClinicalCases();
      });
      caseList.append(button);
    });
  }

  renderClinicalCaseDetail(clinicalCases.find((item) => item.id === selectedCaseId));
}

// LL2: "cases to learn from" — a flat list of visits whose verdict is
// no_change/worsened across every case. Framed as learning, not failure.
function renderLearnFromReview() {
  const entries = [];
  clinicalCases.forEach((item) => {
    (item.soapNotes || []).forEach((note) => {
      if (LEARN_FROM_VERDICTS.includes(note.outcomeVerdict)) entries.push({ item, note });
    });
  });
  entries.sort((a, b) => String(b.note.visitDate || "").localeCompare(String(a.note.visitDate || "")));
  caseResultCount.textContent = `${entries.length} 值得學習`;
  caseList.innerHTML = "";
  if (!entries.length) {
    caseList.innerHTML = `<div class="case-empty">目前沒有標記為「無變化 / 加重」的就診。<br>在 SOAP 的成效判定填入後，這裡會集中呈現，供回顧學習。</div>`;
    renderClinicalCaseDetail(null);
    return;
  }
  entries.forEach(({ item, note }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `case-list-item ${item.id === selectedCaseId ? "active" : ""}`;
    button.innerHTML = `
      <span>${escapeHtml(item.patientCode || "No code")} · ${escapeHtml(note.visitDate || "")}</span>
      <strong>${escapeHtml(item.caseTitle || "Untitled case")}</strong>
      <small>${verdictBadge(note.outcomeVerdict)} ${escapeHtml((note.assessment || note.subjective || "").slice(0, 40))}</small>
    `;
    button.addEventListener("click", () => { selectedCaseId = item.id; renderClinicalCases(); });
    caseList.append(button);
  });
  renderClinicalCaseDetail(clinicalCases.find((item) => item.id === selectedCaseId));
}

function getFilteredClinicalCases() {
  const query = caseSearch.value.trim().toLowerCase();
  if (!query) return clinicalCases;
  return clinicalCases.filter((item) => {
    const haystack = [
      item.patientCode,
      item.caseTitle,
      item.caseCategory,
      item.status,
      item.chiefComplaint,
      item.summary,
      ...item.westernConditions,
      ...item.easternDiseases,
      ...item.tcmPatterns,
      ...item.safetyFlags,
      ...item.soapNotes.flatMap((note) => [
        note.workflowLink,
        note.cyclePhase,
        note.fertilityPhase,
        note.subjective,
        note.objective,
        note.assessment,
        note.plan,
        note.pointsUsed,
        note.formulaHerbs,
        note.westernMeds,
        note.outcomes,
        note.followUp,
        note.technique,
        ...note.westernConditionLinks,
        ...note.easternDiseaseLinks,
        ...note.tcmPatternLinks,
        ...note.safetyFlagLinks,
        ...note.acupointLinks,
        ...note.formulaLinks,
        ...note.medicationLinks,
        ...note.outcomeMetricLinks
      ])
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function renderClinicalCaseDetail(item) {
  if (!item) {
    caseDetail.innerHTML = `
      <div class="case-empty">
        <div>
          <strong>Clinical Case Notebook</strong>
          <p>新增病例後，這裡會顯示 SOAP 時間線、用穴、方藥、西藥與 outcome。</p>
        </div>
      </div>
    `;
    return;
  }

  const notes = [...item.soapNotes].sort((a, b) => {
    const dateCompare = String(b.visitDate || "").localeCompare(String(a.visitDate || ""));
    if (dateCompare) return dateCompare;
    return Number(b.visitNumber || 0) - Number(a.visitNumber || 0);
  });

  caseDetail.innerHTML = `
    <div class="case-detail-head">
      <div>
        <p class="eyebrow">${escapeHtml(item.patientCode || "Patient")}</p>
        <h3>${escapeHtml(item.caseTitle || "Untitled case")}</h3>
        <div class="case-meta">${escapeHtml([item.caseCategory, item.status, item.startDate].filter(Boolean).join(" · "))}</div>
      </div>
      <div class="case-actions">
        <button class="ghost" type="button" id="editCaseInline">編輯病例</button>
        <button type="button" id="addSoapInline">新增 SOAP</button>
      </div>
    </div>
    <div class="clinical-mini-grid">
      <div><small>主訴 Chief complaint</small><span>${escapeHtml(item.chiefComplaint || "尚未填寫")}</span></div>
      <div><small>基本 Demographics</small><span>${escapeHtml([item.sex, (item.birthYearMonth || (item.birthYear ? String(item.birthYear) : "")), item.occupation].filter(Boolean).join(" · ") || "—")}</span></div>
      <div><small>目前主證型 Working pattern</small><span>${escapeHtml(item.tcmPatterns.join("、") || "尚未辨證")}</span></div>
      <div><small>就診目標 Goals</small><span>${escapeHtml(item.goals || "—")}</span></div>
      <div><small>現病史 HPI</small><span>${escapeHtml(item.historyPresent || "—")}</span></div>
      <div><small>既往史 PMH</small><span>${escapeHtml(item.pastHistory || "—")}</span></div>
      <div><small>月經/婦科史 OB-Gyn</small><span>${escapeHtml(item.menstrualObHistory || "—")}</span></div>
      <div><small>生活習慣 Lifestyle</small><span>${escapeHtml(item.lifestyle || "—")}</span></div>
      <div><small>過敏 Allergies</small><span>${escapeHtml(item.allergies || "—")}</span></div>
      <div><small>目前用藥 Meds</small><span>${escapeHtml(item.currentMeds || "—")}</span></div>
      <div><small>Western Dx</small><span>${escapeHtml(item.westernConditions.join("、") || "—")}</span></div>
    </div>
    ${renderCaseTags(item)}
    ${renderCaseTimeline(notes)}
    <div class="timeline-head">
      <strong>SOAP Timeline</strong>
      <small class="timeline-date">${notes.length} notes</small>
    </div>
    <div class="soap-timeline">
      ${notes.length ? notes.map(renderSoapNoteCard).join("") : `<div class="case-empty">尚未有 SOAP note。點「新增 SOAP」開始第一診。</div>`}
    </div>
  `;

  document.querySelector("#editCaseInline").addEventListener("click", () => openCaseEditor(item));
  document.querySelector("#addSoapInline").addEventListener("click", () => openSoapEditor());
  caseDetail.querySelectorAll("[data-edit-soap]").forEach((button) => {
    button.addEventListener("click", () => {
      const note = item.soapNotes.find((entry) => entry.id === button.dataset.editSoap);
      openSoapEditor(note);
    });
  });
  // CS5: timeline node → scroll to that SOAP card + brief highlight
  caseDetail.querySelectorAll("[data-jump-soap]").forEach((node) => {
    node.addEventListener("click", () => {
      const card = document.getElementById(`soap-${node.dataset.jumpSoap}`);
      if (!card) return;
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("soap-note-flash");
      setTimeout(() => card.classList.remove("soap-note-flash"), 1200);
    });
  });
}

function renderCaseTags(item) {
  const tags = [
    ...item.easternDiseases.map((value) => `中醫病名 ${value}`),
    ...item.safetyFlags.map((value) => `Safety ${value}`)
  ];
  return tags.length ? `<div class="case-tags">${tags.map((tag) => `<span class="case-tag">${escapeHtml(tag)}</span>`).join("")}</div>` : "";
}

// --- CS4: autocomplete chip pickers so SOAP link fields never need typed ids ---
// Progressive enhancement: the underlying <textarea> stays the source of truth
// (form save/serialize is unchanged); we hide it and drive its value from chips.
const linkPickerControllers = {};

function pointPickerOptions() {
  return points
    .filter((p) => p.code)
    .map((p) => ({
      value: p.code,
      label: `${p.nameZh || p.code} ${p.code}`,
      terms: `${p.code} ${p.nameZh || ""} ${p.pinyin || ""}`.toLowerCase(),
      meta: p.code,
    }));
}

function formulaPickerOptions() {
  const records = globalThis.ACUTING_KNOWLEDGE?.formulas?.records || [];
  return records.map((f) => ({
    value: f.id,
    label: `${f.name_zh || f.id}${f.pinyin ? " · " + f.pinyin : ""}`,
    terms: `${f.name_zh || ""} ${f.pinyin || ""} ${f.name_en || ""} ${f.id}`.toLowerCase(),
    meta: f.pinyin || f.name_en || "",
  }));
}

function enhanceLinkField(fieldName, buildOptions) {
  const textarea = soapForm?.elements?.[fieldName];
  if (!textarea || textarea.dataset.pickerReady) return;
  textarea.dataset.pickerReady = "1";
  textarea.hidden = true;

  const wrap = document.createElement("div");
  wrap.className = "link-picker";
  const chips = document.createElement("div");
  chips.className = "link-chips";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "link-picker-input";
  input.setAttribute("autocomplete", "off");
  input.placeholder = "輸入中文 / 拼音 / 代碼，從清單選取…";
  const menu = document.createElement("div");
  menu.className = "link-picker-menu";
  menu.hidden = true;
  wrap.append(chips, input, menu);
  textarea.after(wrap);

  let options = null;
  let labelByValue = new Map();
  let activeIndex = -1;
  const ensureOptions = () => {
    if (options) return;
    options = buildOptions();
    labelByValue = new Map(options.map((o) => [o.value, o.label]));
  };
  const getValues = () => splitList(textarea.value);
  const setValues = (vals) => {
    const unique = [...new Set(vals.filter(Boolean))];
    textarea.value = unique.join("、");
    renderChips(unique);
  };
  function renderChips(vals) {
    chips.innerHTML = "";
    vals.forEach((v) => {
      const chip = document.createElement("span");
      chip.className = "link-chip";
      chip.textContent = labelByValue.get(v) || v;
      const x = document.createElement("button");
      x.type = "button";
      x.textContent = "✕";
      x.setAttribute("aria-label", "移除");
      x.addEventListener("click", () => setValues(getValues().filter((val) => val !== v)));
      chip.appendChild(x);
      chips.appendChild(chip);
    });
  }
  function closeMenu() { menu.hidden = true; activeIndex = -1; }
  function addValue(v) {
    setValues([...getValues(), v]);
    input.value = "";
    closeMenu();
    input.focus();
  }
  function renderMenu() {
    ensureOptions();
    const q = input.value.trim().toLowerCase();
    const qCompact = q.replace(/\s+/g, "");
    const chosen = new Set(getValues());
    const matches = !q ? [] : options
      .filter((o) => !chosen.has(o.value) && (o.terms.includes(q) || o.terms.replace(/\s+/g, "").includes(qCompact)))
      .slice(0, 8);
    if (!matches.length) { closeMenu(); return; }
    menu.innerHTML = "";
    matches.forEach((o, i) => {
      const el = document.createElement("div");
      el.className = "link-picker-option" + (i === activeIndex ? " active" : "");
      el.innerHTML = `<span></span><small></small>`;
      el.firstChild.textContent = o.label;
      el.lastChild.textContent = o.value;
      el.addEventListener("mousedown", (e) => { e.preventDefault(); addValue(o.value); });
      menu.appendChild(el);
    });
    menu.hidden = false;
    menu._matches = matches;
  }
  input.addEventListener("input", () => { activeIndex = -1; renderMenu(); });
  input.addEventListener("focus", () => { if (input.value.trim()) renderMenu(); });
  input.addEventListener("blur", () => setTimeout(closeMenu, 120));
  input.addEventListener("keydown", (e) => {
    const m = menu._matches || [];
    if (e.key === "ArrowDown") { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, m.length - 1); renderMenu(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); renderMenu(); }
    else if (e.key === "Enter") {
      if (m.length) { e.preventDefault(); addValue(m[activeIndex >= 0 ? activeIndex : 0].value); }
    } else if (e.key === "Escape") { closeMenu(); }
  });

  linkPickerControllers[fieldName] = {
    sync() { ensureOptions(); renderChips(getValues()); input.value = ""; closeMenu(); },
  };
}

// Union helper: several link fields draw from an old (rendered) registry plus
// the newer Track E canon; both id families are valid targets, dedupe by id.
function dedupeOptions(list) {
  const seen = new Set();
  return list.filter((o) => (seen.has(o.value) ? false : (seen.add(o.value), true)));
}

function patternPickerOptions() {
  const k = globalThis.ACUTING_KNOWLEDGE || {};
  const lib = k.patternLibrary?.records || [];
  const old = k.conditions?.tcm_patterns || [];
  return dedupeOptions([...lib, ...old].map((p) => ({
    value: p.id,
    label: `${p.name_zh || p.id}${p.name_en ? " · " + p.name_en : ""}`,
    terms: `${p.name_zh || ""} ${p.name_en || ""} ${p.id}`.toLowerCase(),
    meta: p.id,
  })));
}

function easternDiseasePickerOptions() {
  const k = globalThis.ACUTING_KNOWLEDGE || {};
  const tdis = k.tdisRegistry?.records || [];
  const old = k.conditions?.eastern_diseases || [];
  return dedupeOptions([...tdis, ...old].map((d) => ({
    value: d.id,
    label: `${d.name_zh || d.id}${d.pinyin ? " · " + d.pinyin : (d.name_en ? " · " + d.name_en : "")}`,
    terms: `${d.name_zh || ""} ${d.pinyin || ""} ${d.name_en || ""} ${d.id}`.toLowerCase(),
    meta: d.id,
  })));
}

function westernConditionPickerOptions() {
  const k = globalThis.ACUTING_KNOWLEDGE || {};
  const canon = k.conditionCanon?.records || [];
  const old = k.conditions?.records || [];
  return dedupeOptions([...canon, ...old].map((c) => ({
    value: c.id,
    label: `${c.name_zh || c.id}${c.name_en ? " · " + c.name_en : ""}`,
    terms: `${c.name_zh || ""} ${c.name_en || ""} ${c.icd_hint || ""} ${c.id}`.toLowerCase(),
    meta: c.icd_hint || c.id,
  })));
}

function medicationPickerOptions() {
  const records = globalThis.ACUTING_KNOWLEDGE?.medications?.records || [];
  return records.map((m) => ({
    value: m.id,
    label: `${m.generic_name_en || m.id}${m.drug_class_en ? " · " + m.drug_class_en : ""}`,
    terms: `${m.generic_name_en || ""} ${(m.brand_names_en || []).join(" ")} ${m.drug_class_en || ""} ${m.id}`.toLowerCase(),
    meta: m.id,
  }));
}

function safetyFlagPickerOptions() {
  const flags = globalThis.ACUTING_KNOWLEDGE?.safetyFlags?.flags || [];
  return flags.map((f) => ({
    value: f.id,
    label: `${f.label_zh || f.id}${f.label_en ? " · " + f.label_en : ""}`,
    terms: `${f.label_zh || ""} ${f.label_en || ""} ${f.id}`.toLowerCase(),
    meta: f.severity || f.id,
  }));
}

function setupLinkAutocomplete() {
  enhanceLinkField("acupointLinks", pointPickerOptions);
  enhanceLinkField("formulaLinks", formulaPickerOptions);
  enhanceLinkField("tcmPatternLinks", patternPickerOptions);
  enhanceLinkField("easternDiseaseLinks", easternDiseasePickerOptions);
  enhanceLinkField("westernConditionLinks", westernConditionPickerOptions);
  enhanceLinkField("medicationLinks", medicationPickerOptions);
  enhanceLinkField("safetyFlagLinks", safetyFlagPickerOptions);
  // outcomeMetricLinks stays free text: entries carry values ("pain_score 7->4"),
  // not bare ids — structured outcome entry is the LL-track item (LL2/LL5).
}

// --- SOAP note keyword linking: connect 用穴/方藥 free text to the knowledge base ---

function buildPointTermIndex() {
  const index = new Map();
  points.forEach((point) => {
    if (point.code) index.set(String(point.code).toUpperCase(), point.code);
    if (point.nameZh && point.nameZh !== point.code) index.set(point.nameZh, point.code);
    if (point.pinyin && point.pinyin !== point.code) index.set(String(point.pinyin).toLowerCase(), point.code);
  });
  return index;
}

function buildFormulaTermIndex() {
  const index = new Map();
  const records = globalThis.ACUTING_KNOWLEDGE?.formulas?.records || [];
  records.forEach((formula) => {
    if (formula.name_zh) index.set(formula.name_zh, formula.id);
    if (formula.pinyin) index.set(String(formula.pinyin).toLowerCase(), formula.id);
    if (formula.name_en) index.set(String(formula.name_en).toLowerCase(), formula.id);
  });
  return index;
}

function linkifyNoteTerms(value, separators, resolveTerm, fallback) {
  const text = String(value || "").trim();
  if (!text) return escapeHtml(fallback);
  return text.split(separators).map((part, partIndex) => {
    const isSeparator = partIndex % 2 === 1;
    const term = part.trim();
    if (isSeparator || !term) return escapeHtml(part);
    const link = resolveTerm(term);
    if (!link) return escapeHtml(part);
    const leading = part.slice(0, part.indexOf(term[0]));
    const trailing = part.slice(leading.length + term.length);
    return `${escapeHtml(leading)}<a class="note-term-link" href="${escapeAttribute(link)}">${escapeHtml(term)}</a>${escapeHtml(trailing)}`;
  }).join("");
}

function linkifyPointsUsed(value, fallback = "未填") {
  // Point lists split on commas or any whitespace ("LI4 LR3 太陽").
  const index = buildPointTermIndex();
  return linkifyNoteTerms(value, /([,，、;；\/\n\s]+)/, (term) => {
    const code = index.get(term.toUpperCase()) || index.get(term) || index.get(term.toLowerCase());
    return code ? `#point/${encodeURIComponent(code)}` : "";
  }, fallback);
}

function linkifyFormulaHerbs(value, fallback = "未填") {
  // Formula names keep single spaces inside one name ("Gui Zhi Tang"),
  // so only stronger separators split them.
  const index = buildFormulaTermIndex();
  return linkifyNoteTerms(value, /([,，、;；\/\n]+|\s{2,})/, (term) => {
    const id = index.get(term) || index.get(term.toLowerCase());
    return id ? "#formulaSection" : "";
  }, fallback);
}

function renderSoapNoteCard(note) {
  const title = note.visitNumber ? `Visit ${note.visitNumber}` : "SOAP Note";
  const linkedRecords = [
    ...note.acupointLinks,
    ...note.formulaLinks,
    ...note.medicationLinks,
    ...note.outcomeMetricLinks
  ];
  return `
    <article class="soap-note" id="soap-${escapeAttribute(note.id)}">
      <div class="timeline-head">
        <h4>${escapeHtml(title)}</h4>
        <div class="case-actions">
          <small class="timeline-date">${escapeHtml([note.visitDate, note.fertilityPhase, note.cyclePhase, note.workflowLink, note.cycleDay ? `CD${note.cycleDay}` : ""].filter(Boolean).join(" · "))}</small>
          ${verdictBadge(note.outcomeVerdict)}
          <button class="ghost" type="button" data-edit-soap="${escapeAttribute(note.id)}">編輯</button>
        </div>
      </div>
      <div class="soap-grid">
        ${soapBlock("S", note.subjective)}
        ${soapBlock("O", note.objective)}
        ${soapBlock("A", note.assessment)}
        ${soapBlock("P", note.plan)}
      </div>
      ${(note.tongueBody || note.tongueCoating || note.pulse) ? `
      <div class="tcm-dx-row">
        <div><small>舌質 Tongue body</small><span>${escapeHtml(note.tongueBody || "—")}</span></div>
        <div><small>舌苔 Coating</small><span>${escapeHtml(note.tongueCoating || "—")}</span></div>
        <div><small>脈象 Pulse</small><span>${escapeHtml(note.pulse || "—")}</span></div>
      </div>` : ""}
      ${(note.tcmPattern || note.pathomechanism || note.treatmentPrinciple) ? `
      <div class="tcm-dx-row">
        <div><small>證型 Pattern</small><span>${escapeHtml(note.tcmPattern || "—")}</span></div>
        <div><small>病機 Pathomechanism</small><span>${escapeHtml(note.pathomechanism || "—")}</span></div>
        <div><small>治法 Tx principle</small><span>${escapeHtml(note.treatmentPrinciple || "—")}</span></div>
      </div>` : ""}
      <div class="clinical-mini-grid">
        <div><small>用穴 Points</small><span>${linkifyPointsUsed(note.pointsUsed)}</span></div>
        <div><small>手法 Modalities</small><span>${escapeHtml([note.technique, note.modalities].filter(Boolean).join(" · ") || "未填")}</span></div>
        <div><small>方藥 Formula / Herbs</small><span>${linkifyFormulaHerbs(note.formulaHerbs)}</span></div>
        <div><small>生命徵象 Vitals</small><span>${escapeHtml(note.vitals || "—")}</span></div>
        <div><small>療效 Outcomes</small><span>${escapeHtml(note.outcomes || "未填")}</span></div>
      </div>
      <div class="soap-link-grid">
        <div><small>Western links</small><span>${escapeHtml(formatNoteList(note.westernConditionLinks))}</span></div>
        <div><small>TCM disease links</small><span>${escapeHtml(formatNoteList(note.easternDiseaseLinks))}</span></div>
        <div><small>Pattern links</small><span>${escapeHtml(formatNoteList(note.tcmPatternLinks))}</span></div>
        <div><small>Safety links</small><span>${escapeHtml(formatNoteList(note.safetyFlagLinks))}</span></div>
        <div class="wide"><small>Treatment record links</small><span>${escapeHtml(formatNoteList(linkedRecords))}</span></div>
      </div>
      ${(note.differentialConsidered || note.reflection || note.ifIneffectivePlan) ? `
      <div class="soap-reflection-view">
        ${note.differentialConsidered ? `<div><small>鑑別考量 Differential</small><span>${escapeHtml(note.differentialConsidered)}</span></div>` : ""}
        ${note.reflection ? `<div><small>按語 Reflection</small><span>${escapeHtml(note.reflection)}</span></div>` : ""}
        ${note.ifIneffectivePlan ? `<div><small>若無效 If ineffective</small><span>${escapeHtml(note.ifIneffectivePlan)}</span></div>` : ""}
      </div>` : ""}
    </article>
  `;
}

function soapBlock(label, text) {
  return `<div class="soap-block"><strong>${label}</strong><p>${escapeHtml(text || "未填寫")}</p></div>`;
}

function verdictBadge(verdict) {
  const v = OUTCOME_VERDICTS[verdict];
  if (!v) return "";
  return `<span class="verdict-badge verdict-${v.tone}">${escapeHtml(v.zh)} ${escapeHtml(v.en)}</span>`;
}

// CS5: compact horizontal outcome timeline — one node per visit (oldest left),
// coloured by outcome_verdict, click to jump to that SOAP card. Turns the LL2
// verdicts into the "did it work over time?" review artifact.
function renderCaseTimeline(notes) {
  if (!notes || notes.length < 1) return "";
  const chrono = [...notes].reverse(); // notes arrive newest-first; show oldest→newest
  const nodes = chrono.map((note) => {
    const v = OUTCOME_VERDICTS[note.outcomeVerdict];
    const tone = v ? v.tone : "none";
    const label = note.visitNumber ? `#${note.visitNumber}` : (note.visitDate || "").slice(5);
    const snippet = (note.outcomes || note.assessment || "").slice(0, 22);
    return `
      <button type="button" class="case-timeline-node" data-jump-soap="${escapeAttribute(note.id)}" title="${escapeAttribute([note.visitDate, v ? v.zh : ""].filter(Boolean).join(" · "))}">
        <span class="ctl-dot verdict-dot-${tone}"></span>
        <span class="ctl-label">${escapeHtml(label)}</span>
        <small class="ctl-date">${escapeHtml((note.visitDate || "").slice(5))}</small>
        ${snippet ? `<small class="ctl-snip">${escapeHtml(snippet)}</small>` : ""}
      </button>`;
  }).join("");
  return `
    <div class="case-timeline" aria-label="Outcome timeline">
      <div class="case-timeline-track">${nodes}</div>
    </div>`;
}

function selectPoint(code) {
  selectedCode = code;
  const selected = points.find((point) => point.code === code);
  if (selected && isAuricularPoint(selected)) {
    modelView = "ear";
    updateViewTabs();
  }
  if (selected && window.location.hash !== pointHash(selected.code)) {
    isSyncingPointHash = true;
    window.location.hash = pointHash(selected.code);
    isSyncingPointHash = false;
  }
  render();
  // Detail view now stands alone (see .point-detail-mode CSS); jump to the
  // top so the point's own header/breadcrumb is what the user lands on.
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openCaseEditor(item = null) {
  editingCaseId = item?.id || null;
  document.querySelector("#caseDialogTitle").textContent = item ? `編輯 ${item.patientCode}` : "新增病例";
  deleteCaseBtn.hidden = !item;
  const fallback = {
    patientCode: `P-${new Date().getFullYear()}-${String(clinicalCases.length + 1).padStart(3, "0")}`,
    caseTitle: "",
    caseCategory: "",
    status: "active",
    startDate: new Date().toISOString().slice(0, 10),
    birthYear: "",
    birthYearMonth: "",
    sex: "",
    occupation: "",
    goals: "",
    chiefComplaint: "",
    historyPresent: "",
    pastHistory: "",
    allergies: "",
    currentMeds: "",
    menstrualObHistory: "",
    lifestyle: "",
    westernConditions: [],
    easternDiseases: [],
    tcmPatterns: [],
    safetyFlags: [],
    summary: ""
  };
  const data = { ...fallback, ...(item || {}) };
  Object.entries(data).forEach(([key, value]) => {
    if (!caseForm.elements[key]) return;
    caseForm.elements[key].value = Array.isArray(value) ? value.join("、") : value;
  });
  caseDialog.showModal();
}

function saveCaseFromForm(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(caseForm).entries());
  const now = new Date().toISOString();
  const current = clinicalCases.find((item) => item.id === editingCaseId);
  const nextCase = normalizeClinicalCase({
    ...(current || {}),
    id: current?.id || createId("case"),
    patientCode: data.patientCode.trim(),
    caseTitle: data.caseTitle.trim(),
    caseCategory: data.caseCategory.trim(),
    status: data.status,
    startDate: data.startDate,
    birthYearMonth: (data.birthYearMonth || "").trim(),
    birthYear: (data.birthYearMonth ? Number(String(data.birthYearMonth).slice(0, 4)) : data.birthYear),
    sex: (data.sex || "").trim(),
    occupation: (data.occupation || "").trim(),
    goals: (data.goals || "").trim(),
    chiefComplaint: data.chiefComplaint.trim(),
    historyPresent: (data.historyPresent || "").trim(),
    pastHistory: (data.pastHistory || "").trim(),
    allergies: (data.allergies || "").trim(),
    currentMeds: (data.currentMeds || "").trim(),
    menstrualObHistory: (data.menstrualObHistory || "").trim(),
    lifestyle: (data.lifestyle || "").trim(),
    westernConditions: splitList(data.westernConditions),
    easternDiseases: splitList(data.easternDiseases),
    tcmPatterns: splitList(data.tcmPatterns),
    safetyFlags: splitList(data.safetyFlags),
    summary: data.summary.trim(),
    createdAt: current?.createdAt || now,
    updatedAt: now,
    soapNotes: current?.soapNotes || []
  });

  if (!nextCase.patientCode || !nextCase.caseTitle) {
    alert("Patient code 和 Case title 必填。");
    return;
  }

  const duplicate = clinicalCases.find((item) => item.patientCode === nextCase.patientCode && item.id !== editingCaseId);
  if (duplicate) {
    alert("這個 patient code 已存在，請改用不同代碼。");
    return;
  }

  if (editingCaseId) {
    clinicalCases = clinicalCases.map((item) => item.id === editingCaseId ? nextCase : item);
  } else {
    clinicalCases = [nextCase, ...clinicalCases];
  }
  selectedCaseId = nextCase.id;
  persistClinicalCases();
  noteClinicalSave();   // CS1
  caseDialog.close();
  render();
}

function deleteCurrentCase() {
  if (!editingCaseId) return;
  const item = clinicalCases.find((entry) => entry.id === editingCaseId);
  if (!confirm(`確定刪除 ${item?.patientCode || "這筆病例"}？此動作會刪除其 SOAP notes。`)) return;
  clinicalCases = clinicalCases.filter((entry) => entry.id !== editingCaseId);
  selectedCaseId = clinicalCases[0]?.id || "";
  persistClinicalCases();
  caseDialog.close();
  render();
}

function openSoapEditor(note = null) {
  const activeCase = clinicalCases.find((item) => item.id === selectedCaseId);
  if (!activeCase) {
    alert("請先新增或選擇一筆病例。");
    return;
  }
  editingSoapId = note?.id || null;
  document.querySelector("#soapDialogTitle").textContent = note ? "編輯 SOAP Note" : `新增 SOAP - ${activeCase.patientCode}`;
  deleteSoapBtn.hidden = !note;
  const fallback = {
    visitDate: new Date().toISOString().slice(0, 10),
    visitNumber: activeCase.soapNotes.length + 1,
    cycleDay: "",
    fertilityPhase: "",
    workflowLink: "",
    cyclePhase: "",
    tongueBody: "",
    tongueCoating: "",
    pulse: "",
    vitals: "",
    tcmPattern: "",
    pathomechanism: "",
    treatmentPrinciple: "",
    modalities: "",
    advice: "",
    westernConditionLinks: [],
    easternDiseaseLinks: [],
    tcmPatternLinks: [],
    safetyFlagLinks: [],
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    pointsUsed: "",
    acupointLinks: [],
    retentionMinutes: "",
    technique: "",
    formulaHerbs: "",
    formulaLinks: [],
    westernMeds: "",
    medicationLinks: [],
    outcomes: "",
    outcomeMetricLinks: [],
    outcomeVerdict: "",
    followUp: "",
    differentialConsidered: "",
    reflection: "",
    ifIneffectivePlan: ""
  };
  const data = { ...fallback, ...(note || {}) };
  Object.entries(data).forEach(([key, value]) => {
    if (!soapForm.elements[key]) return;
    soapForm.elements[key].value = Array.isArray(value) ? value.join("、") : value;
  });
  setupLinkAutocomplete();                                   // CS4: idempotent
  Object.values(linkPickerControllers).forEach((c) => c.sync());  // rebuild chips from hydrated values
  soapDialog.showModal();
}

function saveSoapFromForm(event) {
  event.preventDefault();
  const activeCase = clinicalCases.find((item) => item.id === selectedCaseId);
  if (!activeCase) return;
  const data = Object.fromEntries(new FormData(soapForm).entries());
  const current = activeCase.soapNotes.find((note) => note.id === editingSoapId);
  const now = new Date().toISOString();
  const nextNote = normalizeSoapNote({
    ...(current || {}),
    id: current?.id || createId("soap"),
    visitDate: data.visitDate,
    visitNumber: data.visitNumber,
    cycleDay: data.cycleDay,
    fertilityPhase: data.fertilityPhase.trim(),
    workflowLink: data.workflowLink.trim(),
    cyclePhase: data.cyclePhase.trim(),
    tongueBody: (data.tongueBody || "").trim(),
    tongueCoating: (data.tongueCoating || "").trim(),
    pulse: (data.pulse || "").trim(),
    vitals: (data.vitals || "").trim(),
    tcmPattern: (data.tcmPattern || "").trim(),
    pathomechanism: (data.pathomechanism || "").trim(),
    treatmentPrinciple: (data.treatmentPrinciple || "").trim(),
    modalities: (data.modalities || "").trim(),
    advice: (data.advice || "").trim(),
    westernConditionLinks: splitList(data.westernConditionLinks),
    easternDiseaseLinks: splitList(data.easternDiseaseLinks),
    tcmPatternLinks: splitList(data.tcmPatternLinks),
    safetyFlagLinks: splitList(data.safetyFlagLinks),
    subjective: data.subjective.trim(),
    objective: data.objective.trim(),
    assessment: data.assessment.trim(),
    plan: data.plan.trim(),
    pointsUsed: data.pointsUsed.trim(),
    acupointLinks: splitList(data.acupointLinks),
    retentionMinutes: data.retentionMinutes,
    technique: data.technique.trim(),
    formulaHerbs: data.formulaHerbs.trim(),
    formulaLinks: splitList(data.formulaLinks),
    westernMeds: data.westernMeds.trim(),
    medicationLinks: splitList(data.medicationLinks),
    outcomes: data.outcomes.trim(),
    outcomeMetricLinks: splitList(data.outcomeMetricLinks),
    outcomeVerdict: data.outcomeVerdict || "",
    followUp: data.followUp.trim(),
    differentialConsidered: (data.differentialConsidered || "").trim(),
    reflection: (data.reflection || "").trim(),
    ifIneffectivePlan: (data.ifIneffectivePlan || "").trim(),
    createdAt: current?.createdAt || now,
    updatedAt: now
  });

  clinicalCases = clinicalCases.map((item) => {
    if (item.id !== selectedCaseId) return item;
    const notes = editingSoapId
      ? item.soapNotes.map((entry) => entry.id === editingSoapId ? nextNote : entry)
      : [...item.soapNotes, nextNote];
    return { ...item, soapNotes: notes, updatedAt: now };
  });
  persistClinicalCases();
  noteClinicalSave();   // CS1
  soapDialog.close();
  render();
}

function deleteCurrentSoap() {
  if (!editingSoapId) return;
  if (!confirm("確定刪除這筆 SOAP note？")) return;
  clinicalCases = clinicalCases.map((item) => {
    if (item.id !== selectedCaseId) return item;
    return { ...item, soapNotes: item.soapNotes.filter((note) => note.id !== editingSoapId), updatedAt: new Date().toISOString() };
  });
  persistClinicalCases();
  soapDialog.close();
  render();
}

function exportClinicalCases() {
  const blob = new Blob([JSON.stringify(clinicalCases, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `acuting-clinical-cases-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  markCasesBackedUp();   // CS1: reset backup age + save counter
}

function importClinicalCases(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Clinical cases JSON must be an array");
      clinicalCases = imported.map(normalizeClinicalCase);
      selectedCaseId = clinicalCases[0]?.id || "";
      persistClinicalCases();
      render();
    } catch {
      alert("匯入失敗：請確認 JSON 是 AcuTing Clinical Cases 陣列格式。");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function openEditor(point = null) {
  editingCode = point?.code || null;
  document.querySelector("#dialogTitle").textContent = point ? `編輯 ${point.code}` : "新增穴位";
  deleteBtn.hidden = !point;
  const fallback = {
    code: "",
    standardCode: "",
    standardRegion: "",
    standardZone: "",
    nameZh: "",
    nameEn: "",
    pinyin: "",
    aliases: [],
    meridian: "",
    region: "",
    location: "",
    locationEn: "",
    anatomy: [],
    functions: "",
    functionsEn: "",
    patterns: [],
    patternsEn: [],
    evidence: "",
    techniqueNotes: "",
    needlingDepth: "",
    needlingAngle: "",
    needlingMethod: "",
    tonificationSedation: "",
    moxibustion: "",
    forbiddenActions: "",
    image: "",
    visualLinks: [],
    sources: [],
    cautions: "",
    x: 180,
    y: 310
  };
  const data = { ...fallback, ...(point || {}) };
  const hasLegacyTechnique = ["needlingDepth", "needlingAngle", "needlingMethod", "tonificationSedation", "moxibustion", "forbiddenActions"]
    .some((key) => data[key]);
  if (!data.techniqueNotes && hasLegacyTechnique) data.techniqueNotes = formatTechniqueNotes(data);
  Object.entries(data).forEach(([key, value]) => {
    if (!form.elements[key]) return;
    if (key === "anatomy") form.elements[key].value = formatAnatomy(value);
    else if (key === "visualLinks") form.elements[key].value = normalizeVisualLinks(value).map((item) => item.url).join("\n");
    else if (key === "sources") form.elements[key].value = value.join("\n");
    else form.elements[key].value = Array.isArray(value) ? value.join("、") : value;
  });
  dialog.showModal();
}

function saveFromForm(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const nextPoint = {
    code: data.code.trim().toUpperCase(),
    standardCode: data.standardCode.trim(),
    standardRegion: data.standardRegion.trim(),
    standardZone: data.standardZone.trim(),
    nameZh: data.nameZh.trim(),
    nameEn: data.nameEn.trim(),
    pinyin: data.pinyin.trim(),
    aliases: splitList(data.aliases || ""),
    meridian: data.meridian.trim(),
    region: data.region.trim(),
    location: data.location.trim(),
    locationEn: data.locationEn.trim(),
    anatomy: normalizeAnatomy(data.anatomy),
    functions: data.functions.trim(),
    functionsEn: data.functionsEn.trim(),
    patterns: splitList(data.patterns),
    patternsEn: splitList(data.patternsEn),
    evidence: data.evidence.trim(),
    techniqueNotes: data.techniqueNotes.trim(),
    needlingDepth: (data.needlingDepth || "").trim(),
    needlingAngle: (data.needlingAngle || "").trim(),
    needlingMethod: (data.needlingMethod || "").trim(),
    tonificationSedation: (data.tonificationSedation || "").trim(),
    moxibustion: (data.moxibustion || "").trim(),
    forbiddenActions: (data.forbiddenActions || "").trim(),
    image: String(data.image || "").trim(),
    visualLinks: splitLines(data.visualLinks),
    sources: splitLines(data.sources),
    cautions: data.cautions.trim(),
    x: Number(data.x),
    y: Number(data.y)
  };

  const duplicate = points.find((point) => point.code === nextPoint.code && point.code !== editingCode);
  if (duplicate) {
    alert("這個代碼已存在，請改用不同代碼。");
    return;
  }

  if (editingCode) {
    points = points.map((point) => (point.code === editingCode ? nextPoint : point));
  } else {
    points = [...points, nextPoint];
  }
  selectedCode = nextPoint.code;
  persist();
  dialog.close();
  render();
}

function splitList(text) {
  return text.split(/[、,，]/).map((item) => item.trim()).filter(Boolean);
}

function splitLines(text) {
  return String(text || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function deleteCurrent() {
  if (!editingCode) return;
  if (!confirm(`確定刪除 ${editingCode}？`)) return;
  points = points.filter((point) => point.code !== editingCode);
  selectedCode = points[0]?.code || "";
  persist();
  dialog.close();
  render();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(points, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `acupoint-atlas-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("Not an array");
      points = enrichPoints(imported.map(normalizePoint));
      selectedCode = points[0]?.code || "";
      persist();
      render();
    } catch {
      alert("匯入失敗：請確認 JSON 是穴位陣列格式。");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function normalizePoint(point) {
  return {
    code: String(point.code || "").toUpperCase(),
    standardCode: String(point.standardCode || ""),
    standardRegion: String(point.standardRegion || ""),
    standardZone: String(point.standardZone || ""),
    nameZh: String(point.nameZh || ""),
    nameEn: String(point.nameEn || ""),
    pinyin: String(point.pinyin || ""),
    aliases: Array.isArray(point.aliases) ? point.aliases.map(String) : splitList(String(point.aliases || "")),
    meridian: String(point.meridian || ""),
    region: String(point.region || ""),
    location: String(point.location || ""),
    locationEn: String(point.locationEn || ""),
    anatomy: normalizeAnatomy(point.anatomy || []),
    functions: String(point.functions || ""),
    functionsEn: String(point.functionsEn || ""),
    patterns: Array.isArray(point.patterns) ? point.patterns.map(String) : splitList(String(point.patterns || "")),
    patternsEn: Array.isArray(point.patternsEn) ? point.patternsEn.map(String) : splitList(String(point.patternsEn || "")),
    evidence: String(point.evidence || ""),
    techniqueNotes: String(point.techniqueNotes || ""),
    needlingDepth: String(point.needlingDepth || ""),
    needlingAngle: String(point.needlingAngle || ""),
    needlingMethod: String(point.needlingMethod || ""),
    tonificationSedation: String(point.tonificationSedation || ""),
    moxibustion: String(point.moxibustion || ""),
    forbiddenActions: String(point.forbiddenActions || ""),
    image: String(point.image || ""),
    visualLinks: normalizeVisualLinks(point.visualLinks || []),
    sources: Array.isArray(point.sources) ? point.sources.map(String) : splitLines(String(point.sources || "")),
    cautions: String(point.cautions || ""),
    x: Number(point.x || 180),
    y: Number(point.y || 310)
  };
}

function resetStarter() {
  if (!confirm("確定還原範例資料？目前瀏覽器內儲存的修改會被覆蓋。")) return;
  points = defaultPoints;
  selectedCode = points[0].code;
  persist();
  render();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

