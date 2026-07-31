const STORAGE_KEY = "acuting-acupoint-v3";
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
  const rawCautions = [
    ...(Array.isArray(record.cautions_zh) ? record.cautions_zh : (typeof record.cautions_zh === "string" ? record.cautions_zh.split("\n") : [])),
    ...(Array.isArray(record.cautions) ? record.cautions : (typeof record.cautions === "string" ? record.cautions.split("\n") : [])),
    ...(Array.isArray(record.danger) ? record.danger : (typeof record.danger === "string" ? record.danger.split("\n") : []))
  ];
  const cleanCautions = Array.from(new Set(rawCautions.map(s => String(s).trim()).filter(Boolean)));

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
    // Joined strings cannot be paired row by row; keep the arrays too.
    functionsZhList: record.functions_zh || [],
    functionsEnList: record.functions_en || [],
    patterns: record.indications_zh || [],
    patternsEn: record.indications_en || [],
    evidence: record.evidence || "",
    cautions: cleanCautions.join("\n"),
    techniqueNotes: needling361Text(record.needling),
    nccaomHighYield: record.nccaom_high_yield || [],
    // Board emphasis, read off the curriculum's own asterisks (2 = **, 1 = *).
    // See scripts/mark-exam-stars.js — never hand-set, so the badge always
    // traces back to a page Ting can open.
    examStar: Number(record.exam_star) || 0,
    // Fields the curation pass writes. They existed in the data for 76 points
    // but nothing rendered them, so the 特定穴 identity and the exam pearls were
    // invisible in the app — the two things most worth seeing on a point card.
    pointIdentityZh: record.point_identity_zh || [],
    pointIdentityEn: record.point_identity_en || [],
    examPearl: record.exam_pearl || "",
    examPearlEn: record.exam_pearl_en || "",
    examImportance: record.exam_importance || "",
    examImportanceEn: record.exam_importance_en || "",
    actionTagsZh: record.action_tags_zh || [],
    actionTagsEn: record.action_tags_en || [],
    diseaseTagsZh: record.disease_tags_zh || [],
    diseaseTagsEn: record.disease_tags_en || [],
    clinicalPearls: record.clinical_pearls || [],
    // §6.5 linking layer. Without these three the work in
    // link-point-conditions.js and build-compare-with.js is invisible.
    relatedConditions: record.related_conditions || [],
    // Curated lead conditions. related_conditions is auto-derived and unranked
    // (ST36 lands 112 of 150 because it appears in that many protocols), so it
    // can't answer "what is this point actually FOR". These are authored.
    keyConditionsZh: record.key_conditions_zh || [],
    keyConditionsEn: record.key_conditions_en || [],
    tcmPatternIds: record.tcm_pattern_ids || [],
    compareWith: record.compare_with || [],
    acumethodZh: record.acumethod_zh || "",
    acumethodEn: record.acumethod_en || "",
    moxaZh: record.moxa_zh || "",
    moxaEn: record.moxa_en || "",
    modernResearchZh: record.modern_research_zh || record.cloudtcm_detail || "",
    modernResearchEn: record.modern_research_en || "",
    combinePointsZh: record.combine_points_zh || "",
    combinePointsEn: record.combine_points_en || "",
    anatomyZh: record.anatomy_zh || "",
    anatomyEn: record.anatomy_en || "",
    massageZh: record.massage_zh || "",
    massageEn: record.massage_en || "",
    classicalRefs: record.classical_refs || [],
    acuTags: record.acu_tags || [],
    nameIntroZh: record.name_intro_zh || "",
    otherNamesZh: record.other_names_zh || "",
    wushuPoint: record.wushu_point || "",
    cloudtcmUrl: record.cloudtcm_url || "",
    reviewStatus: record.review_status || "draft",
    sourceStatus: record.source_status || "sourced_cloudtcm_record",
    enrichmentStatus: record.enrichment_status || "",
    fieldSources: record.field_sources || {},
    sources: record.sources || (record.cloudtcm_url ? [record.cloudtcm_url] : []),
    x: record.ui_map?.x ?? meta.x,
    y: record.ui_map?.y ?? meta.y
  };
}

const standardPoints361 = (globalThis.ACUTING_POINTS_361 || []).map(adapt361Record);

const tungIndexRecords = globalThis.ACUTING_TUNG_INDEX?.points || [];

function tungIndexPoint(record) {
  const funcs = record.traditional_functions_zh && record.traditional_functions_zh.length > 0 ? record.traditional_functions_zh : ["董氏奇穴特色功效"];
  const inds = record.indications_zh && record.indications_zh.length > 0 ? record.indications_zh : ["董氏奇穴常用主治"];
  const cleanCautions = (record.contraindications || []).filter(c => !c.includes("Draft index record"));
  return {
    id: record.id || record.code,   // DECISIONS D2 namespaced id
    code: record.code,
    standardCode: record.display_code || record.code,
    nameZh: record.name_zh || record.name_en,
    nameEn: record.name_en,
    pinyin: record.pinyin || record.name_en,
    meridian: `Master Tung / 董氏奇穴`,
    region: `${record.zone_zh || record.zone_en} · ${record.region_zh || record.region_en}`,
    location: record.location_zh || `董氏奇穴：${record.zone_zh || ""} ${record.region_zh || ""}循行取穴。`,
    locationEn: record.location_en || "Master Tung anatomical region.",
    cunMeasurement: "Tung regional measurement.",
    functions: funcs.join("、"),
    // Same shape as the 361 records: a joined string plus the raw list. Emitting
    // the bare array here made the card's function block call .split on it and
    // threw, so no 董氏奇穴 point would open at all.
    functionsEn: (record.traditional_functions_en || ["Master Tung specialty action"]).join(" "),
    functionsZhList: funcs,
    functionsEnList: record.traditional_functions_en || [],
    patterns: inds,
    patternsEn: record.indications_en || ["Master Tung indication"],
    evidence: "董氏奇穴臨床條目：請對照董氏針灸經典與臨床手冊對穴驗證。",
    cautions: cleanCautions.length ? cleanCautions.join(" ") : "依臨床體質辨證與針刺安全規範操作。",
    acumethodZh: record.acumethod_zh || "",
    acumethodEn: record.acumethod_en || "",
    anatomyZh: record.anatomy_zh || "",
    anatomyEn: record.anatomy_en || "",
    channelsZh: record.channels_zh || [],
    // channels_zh is empty on the 十四經 points; channel_zh is where the value
    // is. Without this the location block printed the Tung fallback 「相應經絡」
    // as the channel for every standard point.
    channelZh: record.channel_zh || "",
    channelEn: record.channel_en || "",
    needleSensationZh: record.needle_sensation_zh || "",
    applicationZh: record.application_zh || "",
    explanationZh: record.explanation_zh || "",
    combinationsStructured: record.combinations_structured || [],
    notesEn: record.notes_en || "",
    cautionsEn: record.contraindications_en || [],
    diagramUrlsEn: record.diagram_urls_en || [],
    diagramUrlsZh: record.diagram_urls_zh || [],
    sourceProvenanceNoteZh: record.source_provenance_note_zh || "",
    reviewStatus: record.review_status || "sourced_tung_record",
    sources: record.source_urls || ["https://www.tungs-acupuncture.com"],
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
  const inds = record.indications_zh && record.indications_zh.length > 0 ? record.indications_zh : ["耳穴調節"];
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
    location: record.location_zh || `GB93 耳穴標準：位於耳廓 ${zoneLabelZh} 區。`,
    locationEn: record.location_en || `GB93 auricular standard: located in ${zoneLabelEn} zone.`,
    cunMeasurement: "Auricular regional point. Cun measurement is not used.",
    functions: inds.join("、"),
    functionsEn: (record.indications_en || ["Auricular regulation"]).join(" "),
    functionsZhList: inds,
    functionsEnList: record.indications_en || [],
    patterns: inds,
    patternsEn: record.indications_en || ["Auricular indication"],
    evidence: "GB/T 13734-2008 耳穴名稱與定位標準條目。",
    cautions: "耳局部位消毒清潔，孕婦與耳朵局部傷口慎用。",
    reviewStatus: record.review_status || "index_only",
    sources: (record.sources && record.sources.length) ? record.sources : (record.source_urls && record.source_urls.length ? record.source_urls : [
      `https://www.mastertungacupuncture.org/acupuncture/auricular/points/${(record.pinyin||'').toLowerCase()}-${(record.code||'').toLowerCase()}`,
      `https://acupun.site/point_list_Ear93GB.aspx?pointId=${record.code}`
    ]),
    visualLinks: auricularPointVisualLinks(record),
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

function getEarLotusSlug(record = {}) {
  const code = String(record.code || record.id || "").toUpperCase();
  const EXACT_MAP = {
    'EAR-SM': 'shenmen',
    'EAR-SYM': 'sympathetic',
    'EAR-P0': 'listall',
    'EAR-END': 'endocrine',
    'AT4': 'nervous-subcortex',
    'EAR-ADR': 'adrenal-gland',
    'EAR-LUNG': 'lung',
    'EAR-HEART': 'groove-coronary-heart-disease',
    'EAR-LIVER': 'liver',
    'EAR-KIDNEY': 'kidney',
    'EAR-SPLEEN': 'spleen',
    'EAR-STOMACH': 'stomach',
    'EAR-LI': 'large-intestine',
    'EAR-MOUTH': 'mouth',
    'EAR-HUNGER': 'hunger-point',
    'EAR-OCC': 'occiput',
    'EAR-EYE': 'eye',
    'EAR-APEX': 'ear-apex',
    'EAR-CSP': 'cervical-vertebrae',
    'EAR-LSP': 'lumbar',
    'EAR-KNEE': 'knee-joint',
    'EAR-SHOULDER': 'shoulder',
    'EAR-UTERUS': 'uterus',
    'EAR-DIA': 'diaphragm',
    'EAR-BLADDER': 'bladder',
    'EAR-TRACHEA': 'trachea',
    'EAR-THROAT': 'larynx',
    'EAR-EXT-NOSE': 'external-nose',
    'EAR-HTN-GROOVE': 'decrease-blood-pressure-point'
  };

  if (EXACT_MAP[code]) return EXACT_MAP[code];

  const nameZh = String(record.name_zh || record.nameZh || "");
  const nameEn = String(record.name_en || record.nameEn || "").toLowerCase();

  if (nameZh.includes("神門") || nameEn.includes("shenmen")) return "shenmen";
  if (nameZh.includes("皮質下") || nameEn.includes("subcortex")) return "nervous-subcortex";
  if (nameZh.includes("腎上腺") || nameEn.includes("adrenal")) return "adrenal-gland";
  if (nameZh.includes("交感") || nameEn.includes("sympathetic")) return "sympathetic";
  if (nameZh.includes("內分泌") || nameEn.includes("endocrine")) return "endocrine";
  if (nameZh.includes("膝") || nameEn.includes("knee")) return "knee-joint";
  if (nameZh.includes("降壓") || nameEn.includes("pressure")) return "decrease-blood-pressure-point";

  const slugClean = nameEn.replace(/[^a-z0-9\-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return slugClean || "listall";
}

function auricularPointVisualLinks(record = {}) {
  if (typeof record === "string") {
    record = { code: record };
  }
  const stored = Array.isArray(record.visual_links) ? record.visual_links : [];
  const direct = stored.filter((link) => link && /^https?:\/\//.test(link.url || ""));
  if (direct.length) {
    return direct.map((link) => ({
      labelZh: link.label_zh || "耳穴權威圖解",
      labelEn: link.label_en || "Auricular Medicine Chart",
      url: link.url,
      source: link.source || "eLotus CORE / GB93"
    }));
  }

  const code = String(record.code || record.id || "").toUpperCase();
  const slug = getEarLotusSlug(record);
  const elotusUrl = `https://www.mastertungacupuncture.org/acupuncture/auricular/lch/points/${slug}`;
  const twUrl = `https://acupun.site/point_list_Ear93GB.aspx?pointId=${encodeURIComponent(code.replace(/^EAR-/, ''))}`;

  return [
    {
      labelZh: `eLotus CORE 黃麗春耳針診斷圖解 · ${record.name_zh || record.nameZh || code}`,
      labelEn: `eLotus CORE Auricular Chart · ${record.name_en || record.nameEn || code}`,
      url: elotusUrl,
      source: "eLotus CORE / Dr. Li-Chun Huang"
    },
    {
      labelZh: `國際標準耳針 3D / 區域定位對照 · ${record.name_zh || record.nameZh || code}`,
      labelEn: `Standard Auricular 3D Map · ${code}`,
      url: twUrl,
      source: "GB/T 13734-2008"
    }
  ];
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
const scalpPoints = globalThis.ACUTING_APP_DATA?.scalpPoints || [];
const extraPoints72 = globalThis.ACUTING_APP_DATA?.extraPoints || [];

// The embedded arrays stay loaded only to contribute records OUTSIDE the 361
// standard-channel scope (currently EX-HN3 印堂 and EX-HN5 太陽). Every
// standard-channel code now renders from the 361 layer.
const standard361Codes = new Set(standardPoints361.map((point) => point.code));
const embeddedExtraPoints = [starterPoints, professionalPoints, lungMeridianExpansion, largeIntestineMeridianExpansion, stomachMeridianExpansion, spleenMeridianExpansion, heartMeridianExpansion, smallIntestineMeridianExpansion, bladderMeridianExpansion, kidneyMeridianExpansion]
  .flat()
  .filter((point) => !standard361Codes.has(point.code));

const sourceByCode = Object.fromEntries(
  [...new Set([...Object.keys(locationEnglishByCode), ...defaultCodeList(standardPoints361, embeddedExtraPoints, extraPoints72, auricularGb93Index, auricularPoints, scalpPoints, tungPointIndex)])]
    .map((code) => [code, ["https://www.acupoints.org/", "https://cloudtcm.com/acupoint"]])
);

const auricularSupplementSources = [
  "https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95"
];

const defaultPoints = enrichPoints(mergeByCode(standardPoints361, embeddedExtraPoints, extraPoints72, auricularGb93Index, auricularPoints, scalpPoints, tungPointIndex));

let points = loadPoints();
let selectedCode = points[0]?.code || "";
let editingCode = null;
let clinicalCases = loadClinicalCases();
let selectedCaseId = clinicalCases[0]?.id || "";
let editingCaseId = null;
let editingSoapId = null;
let isSyncingPointHash = false;

const searchInput = document.querySelector("#searchInput");
// Removed hidden <select> filters — meridian filter now driven by sidebar buttons
const meridianFilter = { value: "" };
const regionFilter   = { value: "" };
const patternFilter  = { value: "" };
const meridianCategoryList = null;  // sidebar now JS-rendered into #directorySidebar
const regionCategoryList = null;
const topicCategoryList = null;
const pointCategoryList = null;
const tungZoneCategoryList = null;
const systemCategoryList = null;
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
let directoryTungZone = "";        // Master Tung 12-Zone filter

const tungZoneGroups = uiConfig.tungZoneGroups || [
  { id: "11", zh: "一一部位【手指】", en: "11: Fingers" },
  { id: "22", zh: "二二部位【手掌】", en: "22: Hands" },
  { id: "33", zh: "三三部位【前臂】", en: "33: Forearms" },
  { id: "44", zh: "四四部位【上臂】", en: "44: Upper Arms" },
  { id: "55", zh: "五五部位【腳趾】", en: "55: Soles" },
  { id: "66", zh: "六六部位【腳掌】", en: "66: Top of Feet" },
  { id: "77", zh: "七七部位【小腿】", en: "77: Lower Legs" },
  { id: "88", zh: "八八部位【大腿】", en: "88: Thighs" },
  { id: "99", zh: "九九部位【耳朵】", en: "99: Ears" },
  { id: "1010", zh: "十十部位【頭面】", en: "1010: Head" },
  { id: "DT", zh: "軀幹背面【DT】", en: "DT: Dorsal Torso" },
  { id: "VT", zh: "軀幹腹面【VT】", en: "VT: Ventral Torso" }
];









let selectedSystem = "";
let selectedSystemBranch = "";
let activeChannelCode = "LU";
let activeChartMode = "";
let activeChannelsTab = "meridians";

document.querySelectorAll(".system-tab-btn, .system-tab-link, [href='#channelsWorkspace'], [href='#ws/channels']").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const sys = btn.dataset.system || "";
    const href = btn.getAttribute("href") || "";
    if (sys === "channels_chart" || btn.classList.contains("system-tab-link") || href.includes("channels")) {
      e.preventDefault();
      selectedSystem = "channels_chart";
      activeChannelsTab = "charts";
      if (!activeChartMode) activeChartMode = "fiveshu";
      window.history.pushState(null, "", "#channelsWorkspace");
      render();
      document.querySelector("#channelsWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    document.querySelectorAll(".system-tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedSystem = sys;
    selectedSystemBranch = "";
    meridianFilter.value = "";
    directoryTungZone = "";
    directoryPointCategory = "";
    directoryTopic = "";
    directoryRegionGroup = "";
    if (sys === "") searchInput.value = "";
    clearPointDetailHash();
    render();
  });
});
document.querySelector("#addBtn")?.addEventListener("click", () => openEditor());
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
  if (event.key === "Escape") clearGlobalResults();
});

/* ---- Unified site-wide search -------------------------------------------
   One box searches acupoints + formulas + herbs + conditions + cases and
   shows categorized results directly under the hero search, so studying is
   "type -> see -> click", no scrolling through sections. */
const globalResultsEl = document.querySelector("#globalResults");
const GR_PER_GROUP = 6;

function knowledgeRecords(key) {
  const k = globalThis.ACUTING_KNOWLEDGE || {};
  return (k[key] && k[key].records) || [];
}

// Fields vary between array and string across datasets; flatten to text safely.
function txt(v) {
  if (Array.isArray(v)) return v.map((x) => (x && typeof x === "object" ? Object.values(x).join(" ") : x)).join(" ");
  return v == null ? "" : String(v);
}

function modeText(bilingual, english) {
  return contentMode === "english" ? english : bilingual;
}

function scoreMatch(q, ...fields) {
  const hay = fields.filter(Boolean).map((v) => String(v).toLowerCase());
  for (const h of hay) if (h === q) return 0;          // exact
  for (const h of hay) if (h.startsWith(q)) return 1;  // prefix
  const joined = hay.join("  ");
  return joined.includes(q) ? 2 : -1;                  // substring / miss
}

function unifiedSearch(rawQuery) {
  const q = String(rawQuery || "").trim().toLowerCase();
  if (q.length < 1) return null;
  const pick = (list, mapFields) => {
    const scored = [];
    for (const rec of list) {
      const s = scoreMatch(q, ...mapFields(rec));
      if (s >= 0) scored.push({ s, rec });
    }
    scored.sort((a, b) => a.s - b.s);
    return { total: scored.length, items: scored.slice(0, GR_PER_GROUP).map((x) => x.rec) };
  };

  return {
    // Tags are kept short precisely so they can be searched and joined, but the
    // point index never included them — the 151 restored/translated tags were
    // unreachable from search, which defeats the reason for keeping them short.
    // 別名 and the 特定穴 identity were missing too: 「合谷」 is also 虎口, and
    // 「郄穴」 is how you look for the acute-condition points.
    points: pick(points, (p) => [p.code, p.nameZh, p.nameEn, p.pinyin, p.meridian, p.region,
      txt(p.functions), txt(p.patterns), txt(p.functionsEn),
      txt(p.actionTagsZh), txt(p.actionTagsEn), txt(p.diseaseTagsZh), txt(p.diseaseTagsEn),
      txt(p.pointIdentityZh), txt(p.pointIdentityEn), txt(p.otherNamesZh)]),
    formulas: pick(knowledgeRecords("formulas"), (f) => [f.name_zh, f.name_en, f.pinyin, f.id,
      f.category_zh, f.category, txt(f.pattern_indications_zh), txt(f.composition)]),
    herbs: pick(knowledgeRecords("herbs"), (h) => [h.name_zh, h.name_en, h.pinyin, h.id, h.category,
      txt(h.aliases_zh),   // variant characters (三稜 -> 三棱) must still find the herb
      txt(h.channels_entered), txt(h.functions_zh || h.functions), txt(h.modern_use_tags),
      // condition tags and indications are what a symptom search actually hits
      // (clicking 腰膝痠痛 on a card searches for it and must find these herbs)
      txt(h.condition_tags_zh), txt(h.condition_tags_en), txt(h.indications_zh),
      txt(h.modern_functions_zh), txt(h.actions_en)]),
    conditions: pick(knowledgeRecords("conditionCanon"), (c) => [c.name_zh, c.name_en, c.id, c.category,
      txt(c.tcm_patterns)]),
    cases: pick(clinicalCases, (c) => [c.patientCode, c.caseTitle, c.chiefComplaint,
      txt(c.westernConditions), txt(c.tcmPatterns)]),
  };
}

// `name` is escaped, so callers cannot smuggle markup through it — that is the
// right default for record text. `nameHtml` is the deliberate exception for
// markup this file builds itself (the exam star, the English-name <small>);
// anything interpolated into it must already be escaped at the call site.
// Before nameHtml existed, callers passed raw tags through `name` and users saw
// literal "<small>Lie Que</small>" in the results.
function grItem(kind, kindLabel, code, name, sub, data, nameHtml) {
  const attrs = Object.entries(data).map(([k, v]) => `data-${k}="${escapeHtml(String(v))}"`).join(" ");
  return `<button type="button" class="gr-item" data-kind="${kind}" ${attrs}>
    ${code ? `<span class="gr-item__code">${escapeHtml(code)}</span>` : `<span class="gr-item__code"></span>`}
    <span class="gr-item__main">
      <span class="gr-item__name">${nameHtml || escapeHtml(name)}</span>
      ${sub ? `<span class="gr-item__sub">${escapeHtml(sub)}</span>` : ""}
    </span>
    <span class="gr-kind">${escapeHtml(kindLabel)}</span>
  </button>`;
}

// Board-exam emphasis, straight from the course tables: ** is the teacher's
// strong mark, * is emphasis. Two levels, not a boolean, because the ** points
// (LU7, LI4, ST36, SP6, PC6, LR3 …) are the ones worth spotting from across the
// page. Title text names the source so the marker is never mystery styling.
function examStarLabel(n) {
  return n >= 2 ? "課件標記 ★★ 重點中的重點 (board high-yield)" : "課件標記 ★ 考試重點 (board key point)";
}
function examStarBadge(point) {
  const n = Number(point && point.examStar) || 0;
  if (!n) return "";
  return `<span class="exam-star exam-star--${n}" title="${escapeAttribute(examStarLabel(n))}">${n >= 2 ? "★★" : "★"} ${n >= 2 ? "考試重點" : "考點"}</span>`;
}
function examStarMark(point) {
  const n = Number(point && point.examStar) || 0;
  if (!n) return "";
  return `<span class="exam-star-mark exam-star-mark--${n}" title="${escapeAttribute(examStarLabel(n))}">${n >= 2 ? "★★" : "★"}</span>`;
}

function renderGlobalResults(rawQuery) {
  if (!globalResultsEl) return;
  const res = unifiedSearch(rawQuery);
  if (!res) { clearGlobalResults(); return; }

  const groups = [];
  const group = (title, obj, render) => {
    if (!obj.items.length) return;
    const rows = obj.items.map(render).join("");
    const more = obj.total > obj.items.length
      ? `<p class="gr-more">${escapeHtml(modeText(`還有 ${obj.total - obj.items.length} 筆…輸入更精確的字`, `${obj.total - obj.items.length} more results… keep typing to narrow the search`))}</p>` : "";
    groups.push(`<p class="gr-group__title">${title}（${obj.total}）</p>${rows}${more}`);
  };

  group(modeText("穴位 Acupoints", "Acupoints"), res.points, (p) =>
    grItem("point", modeText("穴位", "Point"), p.code, p.nameZh || "",
      [p.meridian, p.region].filter(Boolean).join(" · "), { code: p.code },
      `${examStarMark(p)}${escapeHtml(p.nameZh || "")}${p.nameEn ? ` <small>${escapeHtml(p.nameEn)}</small>` : ""}`));
  group(modeText("方劑 Formulas", "Formulas"), res.formulas, (f) =>
    grItem("formula", modeText("方劑", "Formula"), "", `${f.name_zh || f.name_en || f.id}`,
      [f.name_en, f.category_zh || f.category].filter(Boolean).join(" · "), { id: f.id }));
  group(modeText("中藥 Herbs", "Herbs"), res.herbs, (h) =>
    grItem("herb", modeText("中藥", "Herb"), "", `${h.name_zh || h.name_en || h.id}`,
      [h.pinyin, h.category].filter(Boolean).join(" · "), { id: h.id }));
  group(modeText("病症 Conditions", "Conditions"), res.conditions, (c) =>
    grItem("condition", modeText("病症", "Condition"), "", `${c.name_zh || c.name_en || c.id}`,
      [c.name_en, c.category].filter(Boolean).join(" · "), { id: c.id }));
  group(modeText("病例 Cases", "Cases"), res.cases, (c) =>
    grItem("case", modeText("病例", "Case"), c.patientCode || "", `${c.caseTitle || c.patientCode || ""}`,
      c.chiefComplaint || "", { code: c.patientCode || "" }));

  if (!groups.length) {
    globalResultsEl.innerHTML = `<p class="gr-empty">${escapeHtml(modeText(
      `找不到「${rawQuery.trim()}」相關的穴位、方劑、中藥、病症或病例。`,
      `No acupoints, formulas, herbs, conditions, or cases found for “${rawQuery.trim()}”.`
    ))}</p>`;
  } else {
    globalResultsEl.innerHTML = groups.join("");
  }
  globalResultsEl.hidden = false;
}

function clearGlobalResults() {
  if (!globalResultsEl) return;
  globalResultsEl.innerHTML = "";
  globalResultsEl.hidden = true;
}

function openGlobalResult(btn) {
  const kind = btn.dataset.kind;
  clearGlobalResults();
  if (kind === "point") {
    homeSearch.blur();
    selectPoint(btn.dataset.code);
    return;
  }
  if (kind === "formula" || kind === "herb") {
    const api = globalThis.ACUTING_KNOWLEDGE_API;
    if (api && api.openDetail) { api.openDetail(kind, btn.dataset.id); return; }
    goToSection(kind === "formula" ? "ws/formula" : "ws/herb");
    return;
  }
  if (kind === "condition") {
    goToSection("conditionGraph");
    const id = btn.dataset.id;
    requestAnimationFrame(() => {
      const card = document.querySelector(`[data-record-id="${(window.CSS && CSS.escape) ? CSS.escape(id) : id}"]`);
      if (card) { card.scrollIntoView({ behavior: "smooth", block: "center" }); card.classList.add("gr-flash"); setTimeout(() => card.classList.remove("gr-flash"), 1600); }
    });
    return;
  }
  if (kind === "case") {
    if (caseSearch) { caseSearch.value = btn.dataset.code || ""; renderClinicalCases(); }
    goToSection("caseWorkspace");
  }
}

/* Let knowledge cards trigger a site-wide search (condition tags do this):
   close any open study card, go home, and run the unified search. */
globalThis.ACUTING_SEARCH = function (term) {
  const q = String(term || "").trim();
  if (!q) return;
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
  goToSection("ws/home");
  if (homeSearch) {
    homeSearch.value = q;
    renderGlobalResults(q);
    requestAnimationFrame(() => homeSearch.scrollIntoView({ block: "center" }));
  }
};
document.addEventListener("click", (event) => {
  const t = event.target.closest("[data-search-term]");
  if (t) globalThis.ACUTING_SEARCH(t.dataset.searchTerm);
});
// §6.5 (B) condition chips on a point card reuse the search-result routing, so
// a chip lands on the same condition card the global search would open.
document.addEventListener("click", (event) => {
  const chip = event.target.closest('.point-link[data-kind="condition"]');
  if (chip) openGlobalResult(chip);
});

if (globalResultsEl) {
  let grTimer = null;
  homeSearch.addEventListener("input", () => {
    clearTimeout(grTimer);
    grTimer = setTimeout(() => renderGlobalResults(homeSearch.value), 110);
  });
  globalResultsEl.addEventListener("click", (event) => {
    const btn = event.target.closest(".gr-item");
    if (btn) openGlobalResult(btn);
  });
  // Click outside the hero search closes the dropdown — except for a tag that
  // just RAN a search (its click is outside the box, and closing here would
  // wipe the results it opened).
  document.addEventListener("click", (event) => {
    if (globalResultsEl.hidden) return;
    if (event.target.closest(".hero-search") || event.target.closest("#globalResults")) return;
    if (event.target.closest("[data-search-term]")) return;
    clearGlobalResults();
  });
}
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

searchInput?.addEventListener("input", () => {
  clearPointDetailHash();
  render();
});

applyPointHash();
render();

function setContentMode(mode) {
  contentMode = mode;
  localStorage.setItem(CONTENT_MODE_KEY, contentMode);
  updateContentModeUI();
  document.dispatchEvent(new CustomEvent("acuting:content-mode", { detail: { mode: contentMode } }));
  render();
}

function updateContentModeUI() {
  document.body.dataset.contentMode = contentMode;
  document.documentElement.lang = contentMode === "english" ? "en" : "zh-Hant";
  document.querySelector("#modeBilingualBtn")?.classList.toggle("active", contentMode === "bilingual");
  document.querySelector("#modeEnglishBtn")?.classList.toggle("active", contentMode === "english");
  document.querySelectorAll("[data-mode-text]").forEach((el) => {
    el.textContent = modeText(el.dataset.bilingual || el.textContent || "", el.dataset.english || el.textContent || "");
  });
  document.querySelectorAll("[data-mode-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", modeText(el.dataset.bilingualAriaLabel || "", el.dataset.englishAriaLabel || ""));
  });
  if (homeSearch) {
    homeSearch.placeholder = modeText(
      "搜尋穴位、方劑、中藥、病症、病例… 例：SP6、四物、當歸、血虛",
      "Search acupoints, formulas, herbs, conditions, or cases… e.g. SP6, Si Wu Tang, Dang Gui, Blood deficiency"
    );
  }
  if (searchInput) {
    searchInput.placeholder = modeText(
      "搜尋：中文、英文、代碼、位置、功效、證型... (例：ST36, 太衝, 運動區, 神門)",
      "Search: Name, Code, Location, Action, Pattern... (e.g. ST36, Taichong, MS6, Shenmen)"
    );
  }
  const navPanel = document.querySelector("#navPanel");
  if (navPanel) navPanel.setAttribute("aria-label", modeText("主選單", "Main navigation"));
  document.querySelector("#navClose")?.setAttribute("aria-label", modeText("關閉選單", "Close navigation"));
  document.title = modeText("AcuTing OS", "AcuTing OS | TCM Study System");
  if (homeSearch && homeSearch.value.trim()) renderGlobalResults(homeSearch.value);
}

function activeModuleTarget() {
  const hash = window.location.hash || "#ws/home";
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
  try {
    if (localStorage.getItem("acupoint-atlas-v1")) {
      localStorage.removeItem("acupoint-atlas-v1");
    }
    if (localStorage.getItem("acuting-acupoint-v2")) {
      localStorage.removeItem("acuting-acupoint-v2");
      console.info("AcuTing: Purged legacy acuting-acupoint-v2 cache");
    }
    if (localStorage.getItem("acuting-acupoint-v3")) {
      const parsed = JSON.parse(localStorage.getItem("acuting-acupoint-v3"));
      if (Array.isArray(parsed)) {
        const ht5 = parsed.find((p) => p.code === "HT5");
        if (ht5 && (!ht5.point_identity_zh || !ht5.point_identity_zh.length)) {
          localStorage.removeItem("acuting-acupoint-v3");
          console.info("AcuTing: Purged stale acuting-acupoint-v3 cache to load updated point_identity fields");
        }
      }
    }
  } catch (e) {}


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
    // Drop standard 361 records from old localStorage caches unless explicitly edited by user in form
    if (standard361Codes.has(point.code) && !point.isUserEdited) {
      return false;
    }
    // Drop extra points from old localStorage cache unless explicitly edited by user
    if ((String(point.code || "").startsWith("EX-") || String(point.meridian || "").includes("Extra Point")) && !point.isUserEdited) {
      return false;
    }
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
  // If the unified dropdown is showing hits, Enter/搜尋 opens the top one.
  const firstResult = globalResultsEl && !globalResultsEl.hidden && globalResultsEl.querySelector(".gr-item");
  if (firstResult) { openGlobalResult(firstResult); return; }
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
  // Deliberately does NOT write the code into the search box. It used to, and
  // that silently filtered the browse list: opening ST37 left "ST37" in the
  // box, so returning to the list showed 2 of 751 points. Every later click
  // landed on one of those two, and once the filter matched nothing the
  // selection fell back to points[0] — which is why so many points appeared to
  // open BL1 睛明. The hash owns the detail view; the filter belongs to the
  // browse view, and one must not reach into the other.
  if (isAuricularPoint(point)) modelView = "ear";
  return true;
}

function handlePointHashChange() {
  if (isSyncingPointHash) return;
  const hash = window.location.hash || "";
  if (hash === "#ws/channels" || hash === "#channelsWorkspace") {
    activeChannelsTab = "charts";
    if (!activeChartMode) activeChartMode = "fiveshu";
    render();
    document.querySelector("#channelsWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (!applyPointHash()) {
    render();
    return;
  }
  render();
  if (hash.startsWith("#point/")) {
    document.querySelector("#acupunctureWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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
  let meridian = point.meridian;
  if (!meridian || meridian === "Extra Point / 經外奇穴" || (typeof meridian === "string" && meridian.startsWith("Extra Point"))) {
    if (String(point.code || "").startsWith("EX-") || (typeof meridian === "string" && meridian.includes("經外奇穴"))) {
      meridian = "Extra Points / 經外奇穴";
    }
  }
  return { ...point, meridian, locationEn, anatomy, functionsEn, patternsEn, sources: fixedSources, visualLinks: fixedVisualLinks };
}

function defaultVisualLinks(point) {
  if (isAuricularPoint(point)) return auricularPointVisualLinks(point.standardCode || point.code);
  if (String(point.meridian || "").includes("Master Tung")) {
    return tungPointVisualLinks({ name_en: point.nameEn, display_code: point.standardCode || point.code, code: point.code });
  }
  if (isExtraPoint && isExtraPoint(point)) {
    // Extra points: use stored visualLinks if any, else build eLotus URL from code
    const stored = Array.isArray(point.visual_links) ? point.visual_links : [];
    if (stored.length) {
      return stored.map((link) => ({
        labelZh: link.label_zh || "經外奇穴 eLotus CORE 圖解",
        labelEn: link.label_en || "Extra Point eLotus CORE Visual",
        url: link.url,
        source: link.source || "MasterTungAcupuncture.org / eLotus CORE"
      }));
    }
    const code = String(point.code || "").toLowerCase();
    const name = String(point.nameEn || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slug = name ? `${name}-${code}` : code;
    return [{
      labelZh: `經外奇穴 · ${point.nameZh || point.code} eLotus CORE`,
      labelEn: `Extra Point · ${point.nameEn || point.code} eLotus CORE`,
      url: `https://www.mastertungacupuncture.org/acupuncture/traditional/points/${slug}`,
      source: "MasterTungAcupuncture.org / eLotus CORE"
    }];
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
  // renderSystemToggleDrawer(); — retired, sidebar is now context-aware
  renderChannelsWorkspace();

  const hash = window.location.hash || "";
  const isChannelsView = selectedSystem === "channels_chart" || hash === "#ws/channels" || hash === "#channelsWorkspace";
  const channelsWorkspaceEl = document.querySelector("#channelsWorkspace");
  const directoryLayoutEl = document.querySelector("#directoryLayout");
  const channelsLinkEl = document.querySelector("#channelsWorkspaceBtn");

  if (channelsWorkspaceEl && directoryLayoutEl) {
    if (isChannelsView) {
      channelsWorkspaceEl.hidden = false;
      channelsWorkspaceEl.style.display = "block";
      directoryLayoutEl.style.display = "none";
      if (channelsLinkEl) channelsLinkEl.classList.add("active");
      document.querySelectorAll(".system-tab-btn").forEach((b) => b.classList.remove("active"));
    } else {
      channelsWorkspaceEl.hidden = true;
      channelsWorkspaceEl.style.display = "none";
      directoryLayoutEl.style.display = "grid";
      if (channelsLinkEl) channelsLinkEl.classList.remove("active");
    }
  }

  const filtered = getFilteredPoints();
  const detailMode = isPointDetailMode();
  // In detail mode the hash owns the selection. Clamping it to the browse
  // list meant that opening #point/SP6 while the list was filtered to
  // 董氏奇穴 rendered points[0] (睛明) instead — the wrong point, silently.
  if (!detailMode && !filtered.some((point) => point.code === selectedCode)) {
    selectedCode = filtered[0]?.code || points[0]?.code || "";
  }
  renderMap(filtered);
  renderCards(filtered);
  renderActiveFilterSummary(filtered);
  document.body.classList.toggle("point-detail-mode", detailMode);
  // Cards always visible except in detail mode
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
  if (directoryTungZone) {
    chips.push({
      kind: "tungZone",
      label: contentMode === "english" ? "Tung Zone" : "董氏部位",
      value: labelForDirectoryValue(tungZoneGroups, directoryTungZone)
    });
  }
  if (directoryPointCategory) {
    const cat = pointCategoryCatalog.find((c) => c.id === directoryPointCategory);
    chips.push({
      kind: "pointCategory",
      label: contentMode === "english" ? "Specific Group" : "特定穴類別",
      value: cat ? (contentMode === "english" ? cat.label_en : cat.label_zh) : directoryPointCategory
    });
  }
  if (selectedSystemBranch) {
    chips.push({
      kind: "systemBranch",
      label: contentMode === "english" ? "Sub-branch" : "子分支",
      value: selectedSystemBranch
    });
  }
  return chips;
}

function renderActiveFilterSummary() {
  // User requested no active filter summary box ("不用出現這個").
  // Hook data-clear-filter preserved for interaction audit.
}

function clearActiveFilter(kind) {
  if (kind === "all" || kind === "search") searchInput.value = "";
  if (kind === "all" || kind === "meridian") meridianFilter.value = "";
  if (kind === "all" || kind === "region") regionFilter.value = "";
  if (kind === "all" || kind === "pattern") patternFilter.value = "";
  if (kind === "all" || kind === "regionGroup") directoryRegionGroup = "";
  if (kind === "all" || kind === "topic") directoryTopic = "";
  if (kind === "all" || kind === "tungZone") directoryTungZone = "";
  if (kind === "all" || kind === "pointCategory") directoryPointCategory = "";
  if (kind === "all" || kind === "systemBranch") selectedSystemBranch = "";
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
  if (standardCountEl) standardCountEl.textContent = String(standardCount);
  if (missingCountEl) missingCountEl.textContent = String(missingCount);
  if (acupunctureProgressEl) {
    acupunctureProgressEl.textContent = contentMode === "english"
      ? "Standard · Extra Points · Master Tung · Auricular"
      : "標準經穴 · 經外奇穴 · 董氏奇穴 · 耳穴";
  }
  if (caseCountEl) caseCountEl.textContent = String(clinicalCases.length);
  if (caseProgressEl) caseProgressEl.textContent = clinicalCases.length ? `${clinicalCases.length} cases / ${clinicalCases.reduce((sum, item) => sum + item.soapNotes.length, 0)} SOAP` : "病例紀錄入口";
}

function renderDatabaseHealth() {
  const audit = getStandardPointAudit();
  const quality = getDataQualityAudit();
  renderProgressMatrix();
  if (auditGeneratedOnEl) auditGeneratedOnEl.textContent = `audit ${standardChannelAudit.generatedOn}`;
  if (healthStandardCountEl) healthStandardCountEl.textContent = `${audit.presentTotal}/${standardChannelAudit.expectedTotal}`;
  if (healthMissingCountEl) healthMissingCountEl.textContent = String(audit.missingTotal);
  // Honest "verified" %: source-checked records over the full 361, NOT mere
  // presence (which would read a misleading 100% while content is still draft).
  if (healthCompletionPercentEl) {
    const verifiedPct = standardChannelAudit.expectedTotal
      ? Math.round((quality.sourceCheckedStandard / standardChannelAudit.expectedTotal) * 100)
      : 0;
    healthCompletionPercentEl.textContent = `${verifiedPct}%`;
  }
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
    /*
    const d = {};
    const madePct = 0;
    const verifiedTotal = 0;
    const notes = "";
    const totalHtml = d.totalNote
      ? `<div>${d.total}</div><small>${escapeHtml(d.totalNote)}</small>`
      : `${d.total}`;
    const madeLabel = d.madeNote || `${d.made}/${d.total} Â· ${madePct}%`;
    const verifiedLabel = `${d.sourceChecked}/${verifiedTotal} å·²æºå¯©æ ¸${d.verifiedNote ? ` Â· ${escapeHtml(d.verifiedNote)}` : ""}${notes ? ` Â· ${escapeHtml(notes)}` : ""}`;
    */
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

// Per-layer progress, explicitly separated so Quality does not confuse
// "record exists" with "content is template-grade" or "source-checked".
function getDomainProgress() {
  const K = globalThis.ACUTING_KNOWLEDGE || {};
  const recs = (key) => (K[key] && K[key].records) || [];
  const herbCoverage = K.audit?.herb_outline_coverage || {};
  const qualityLayers = K.audit?.quality_layers || {};
  const verdicts = window.AcuTingReview ? window.AcuTingReview.allVerdicts() : [];
  const byKind = (kind, verdict) => verdicts.filter((v) => v.kind === kind && v.verdict === verdict).length;
  const filled = (v) => Array.isArray(v) ? v.length > 0 : (v != null && String(v).trim() !== "");
  const madeCount = (arr, keys) => arr.filter((r) => keys.some((k) => filled(r[k]))).length;
  const scCount = (arr) => arr.filter((r) => (r.review_status || "") === "source_checked").length;
  const hasFieldSource = (r, key) => r.field_sources && r.field_sources[key];

  const herbs = recs("herbs");
  const formulas = recs("formulas");
  const conditions = recs("conditionCanon");
  const comparisons = recs("comparisons");

  const row = (label, kind, total, framework, made, grade, sourceChecked, extra = {}) => ({
    label, kind, total, framework, made, grade, sourceChecked, ...extra,
    reviewed: byKind(kind, "confirmed"),
    issues: byKind(kind, "issue")
  });

  const herbTotal = Number(herbCoverage.appendix_a_total) || herbs.length;
  const herbMade = Number(herbCoverage.matched_to_local_cards) || madeCount(herbs, ["functions_zh", "functions", "modern_functions_zh", "actions_indications"]);
  const herbLocalCards = Number(herbCoverage.local_herb_cards) || herbs.length;
  const herbMissing = Number(herbCoverage.missing_card_count);
  const herbGrade = Number(qualityLayers.herbs?.template_grade)
    || herbs.filter((r) => r.card_grade === "template").length;
  const herbProgressRow = row("中藥 Herbs", "herb", herbTotal, herbLocalCards, herbMade, herbGrade, scCount(herbs), {
    totalNote: herbCoverage.appendix_a_total ? `NCBAHM ${herbTotal} · 本地卡 ${herbLocalCards}` : "",
    frameworkNote: `${herbLocalCards} local cards`,
    madeNote: herbCoverage.appendix_a_total
      ? `${herbMade}/${herbTotal} NCBAHM 覆蓋 · 缺 ${Number.isFinite(herbMissing) ? herbMissing : Math.max(0, herbTotal - herbMade)}`
      : "",
    gradeDenominator: herbLocalCards,
    gradeNote: `${herbGrade}/${herbLocalCards} template-grade；其餘舊卡待重修`,
    verifiedDenominator: herbLocalCards,
    verifiedNote: herbCoverage.appendix_a_total ? `本地卡 ${herbLocalCards} 張；source_checked 仍按本地卡計` : ""
  });
  const standardPoints = points.filter(isStandardChannelPoint);
  const standardTemplate = standardPoints.filter((p) => p.fieldSources?.functions_zh).length;

  return [
    row("穴位 Acupoints", "point", points.length, points.length,
      points.filter((p) => filled(p.functions) || filled(p.location) || filled(p.locationEn)).length,
      standardTemplate,
      points.filter((p) => (p.reviewStatus || "") === "source_checked").length, {
        totalNote: `全部可查點 ${points.length}；標準經穴 ${standardPoints.length}`,
        frameworkNote: `${points.length}/${points.length} cards exist`,
        gradeDenominator: standardPoints.length,
        gradeNote: `${standardTemplate}/${standardPoints.length} standard-channel template-grade`,
        verifiedNote: "source_checked across all point records"
      }),
    herbProgressRow,
    row("方劑 Formulas", "formula", formulas.length, formulas.length,
      madeCount(formulas, ["composition", "actions_zh", "pattern_indications_zh"]),
      formulas.filter((r) => r.card_grade === "template").length,
      scCount(formulas)),
    row("病症 Conditions", "condition", conditions.length, conditions.length,
      madeCount(conditions, ["tcm_patterns", "summary_zh", "etiology_zh"]),
      conditions.filter((r) => r.card_grade === "template").length,
      scCount(conditions)),
    row("辨證鑑別 Comparisons", "comparison", comparisons.length, comparisons.length,
      madeCount(comparisons, ["rows", "records", "discriminators", "cells"]),
      comparisons.filter((r) => r.card_grade === "template").length,
      scCount(comparisons)),
    row("病例 Cases", "case", clinicalCases.length, clinicalCases.length, clinicalCases.length, 0, 0)
  ];
}

function renderProgressMatrix() {
  const host = document.getElementById("progressMatrix");
  if (!host) return;
  const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);
  const rows = getDomainProgress().map((d) => {
    const frameworkPct = pct(d.framework, d.total);
    const madePct = pct(d.made, d.total);
    const gradeTotal = d.gradeDenominator || d.total;
    const gradePct = pct(d.grade, gradeTotal);
    const verifiedTotal = d.verifiedDenominator || d.total;
    const verPct = pct(d.sourceChecked, verifiedTotal);
    const notes = [
      d.reviewed ? `你標正確 ${d.reviewed}（匯出後套用）` : "",
      d.issues ? `你標問題 ${d.issues}` : ""
    ].filter(Boolean).join(" · ");
    const totalHtml = d.totalNote
      ? `<div>${d.total}</div><small>${escapeHtml(d.totalNote)}</small>`
      : `${d.total}`;
    const frameworkLabel = d.frameworkNote || `${d.framework}/${d.total} · ${frameworkPct}%`;
    const madeLabel = d.madeNote || `${d.made}/${d.total} · ${madePct}%`;
    const gradeLabel = d.gradeNote || `${d.grade}/${gradeTotal} · ${gradePct}%`;
    const verifiedLabel = `${d.sourceChecked}/${verifiedTotal} 已源審核${d.verifiedNote ? ` · ${escapeHtml(d.verifiedNote)}` : ""}${notes ? ` · ${escapeHtml(notes)}` : ""}`;
    return `
      <tr>
        <td class="pm-label">${escapeHtml(d.label)}</td>
        <td class="pm-total">${totalHtml}</td>
        <td>
          <div class="pm-bar pm-framework"><i style="width:${frameworkPct}%"></i></div>
          <small>${escapeHtml(frameworkLabel)}</small>
        </td>
        <td>
          <div class="pm-bar"><i style="width:${madePct}%"></i></div>
          <small>${escapeHtml(madeLabel)}</small>
        </td>
        <td>
          <div class="pm-bar pm-grade"><i style="width:${gradePct}%"></i></div>
          <small>${escapeHtml(gradeLabel)}</small>
        </td>
        <td>
          <div class="pm-bar pm-verify"><i style="width:${verPct}%"></i></div>
          <small>${verifiedLabel}</small>
        </td>
      </tr>`;
  }).join("");
  host.innerHTML = `
    <table class="progress-matrix">
      <thead><tr><th>層 Layer</th><th>總數</th><th>框架 Framework</th><th>製作 Made</th><th>Grade level</th><th>驗證 Verified</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
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

// hydrateFilters: <select> elements removed; sidebar handles all sub-branches directly.
function hydrateFilters() {}

// ── renderDirectoryFilters: context-aware sidebar (renders #directorySidebar) ──
function renderDirectoryFilters() {
  const sidebar = document.getElementById("directorySidebar");
  if (!sidebar) return;
  const isEn = contentMode === "english";
  let html = "";

  // ── TOP: System-specific sub-branch section ───────────────────────────────────────────
  if (!selectedSystem) {
    // 全庫: system overview counts
    const systemDefs = [
      { id: "",           zh: "全部穴道",     en: "All Points",          count: points.length,                                    action: "allSystem" },
      { id: "standard14", zh: "十四正經",     en: "14 Channels",         count: points.filter(isStandardChannelPoint).length,     action: "switchSystem" },
      { id: "extra",      zh: "經外奇穴",     en: "Extra Points (EX)",   count: points.filter((p) => pointMatchesSystem(p, "extra")).length, action: "switchSystem" },
      { id: "tung",       zh: "董氏奇穴",     en: "Master Tung",         count: points.filter((p) => pointMatchesSystem(p, "tung")).length,  action: "switchSystem" },
      { id: "auricular",  zh: "耳穴體系",     en: "Auricular Points",    count: points.filter(isAuricularPoint).length,           action: "switchSystem" },
      { id: "scalp",      zh: "頭皮針",       en: "Scalp Acupuncture",   count: points.filter((p) => pointMatchesSystem(p, "scalp")).length,  action: "switchSystem" },
      { id: "special",    zh: "特色/微針",     en: "Special Systems",     count: points.filter((p) => pointMatchesSystem(p, "special")).length, action: "switchSystem" },
    ];
    html += sidebarSection(
      isEn ? "SYSTEM OVERVIEW" : "體系概覽",
      systemDefs.map((s) => sidebarBtn(s.id === selectedSystem, s.zh, s.en, s.count, s.action, s.id)).join(""),
      true
    );
  } else if (selectedSystem === "standard14") {
    const stdPoints = points.filter(isStandardChannelPoint);
    const stdMeridians = unique(stdPoints.map((p) => p.meridian))
      .sort((a, b) => channelOrderIndex(a) - channelOrderIndex(b));
    html += sidebarSection(
      isEn ? "14 CHANNELS" : "十四正經",
      [
        sidebarBtn(!meridianFilter.value, "全部正經穴位", "All 361 pts", stdPoints.length, "meridian", ""),
        ...stdMeridians.map((m) => sidebarBtn(
          meridianFilter.value === m,
          meridianLabelZh(m), meridianLabelEn(m),
          stdPoints.filter((p) => p.meridian === m).length,
          "meridian", m
        ))
      ].join(""),
      true
    );
  } else if (selectedSystem === "tung") {
    const tungTotal = points.filter((p) => pointMatchesSystem(p, "tung")).length;
    html += sidebarSection(
      isEn ? "MASTER TUNG — 12 ZONES" : "董氏奇穴—十二部位",
      [
        sidebarBtn(!directoryTungZone, "全部部位", "All 12 Zones", tungTotal, "tungZone", ""),
        ...tungZoneGroups.map((z) => sidebarBtn(
          directoryTungZone === z.id,
          z.zh, z.en,
          points.filter((p) => pointMatchesTungZone(p, z.id)).length,
          "tungZone", z.id
        ))
      ].join(""),
      true
    );
  } else if (selectedSystem === "auricular") {
    const auricularZones = [
      { id: "TF",  zh: "TF 三角窩",          en: "TF Triangular Fossa" },
      { id: "AH",  zh: "AH 對耳輪",          en: "AH Antihelix" },
      { id: "SAC", zh: "SAC 對耳輪上腳",        en: "SAC Sup. Antihelix Crus" },
      { id: "IAC", zh: "IAC 對耳輪下腳",        en: "IAC Inf. Antihelix Crus" },
      { id: "AT",  zh: "AT 對耳屏",          en: "AT Antitragus" },
      { id: "TR",  zh: "TR 耳屏",            en: "TR Tragus" },
      { id: "CVC", zh: "CVC 耳甲腔",          en: "CVC Cavum Concha" },
      { id: "CYC", zh: "CYC 耳甲艇",          en: "CYC Cymba Concha" },
      { id: "EL",  zh: "EL 耳垂",            en: "EL Earlobe" },
      { id: "SC",  zh: "SC 耳舟",            en: "SC Scapha" },
      { id: "HX",  zh: "HX 耳輪",            en: "HX Helix" },
      { id: "HCS", zh: "HCS 耳輪腳",          en: "HCS Helix Crus" },
      { id: "IN",  zh: "IN 屏間切跡",          en: "IN Intertragic Notch" },
      { id: "POS", zh: "POS 耳背",            en: "POS Posterior" },
    ];
    const aurTotal = points.filter(isAuricularPoint).length;
    html += sidebarSection(
      isEn ? "AURICULAR — LCH 14 ZONES" : "耳穴體系—LCH十四分區",
      [
        sidebarBtn(!selectedSystemBranch, "全部分區", "All Zones", aurTotal, "sysAurBranch", ""),
        ...auricularZones.map((z) => sidebarBtn(
          selectedSystemBranch === z.id,
          z.zh, z.en,
          points.filter((p) => pointMatchesEarZone(p, z.id)).length,
          "sysAurBranch", z.id
        ))
      ].join(""),
      true
    );
  } else if (selectedSystem === "extra") {
    const extraCats = [
      { id: "EX-HN", zh: "EX-HN 頭頗部", en: "EX-HN Head & Neck" },
      { id: "EX-CA", zh: "EX-CA 胸腹部", en: "EX-CA Chest & Abdomen" },
      { id: "EX-B",  zh: "EX-B 背部",    en: "EX-B Back" },
      { id: "EX-UE", zh: "EX-UE 上肢", en: "EX-UE Upper Extremity" },
      { id: "EX-LE", zh: "EX-LE 下肢", en: "EX-LE Lower Extremity" },
    ];
    const extraTotal = points.filter((p) => pointMatchesSystem(p, "extra")).length;
    html += sidebarSection(
      isEn ? "EXTRA POINTS (EX)" : "經外奇穴 (EX)",
      [
        sidebarBtn(!selectedSystemBranch, "全部奇穴", "All Extra", extraTotal, "sysExBranch", ""),
        ...extraCats.map((c) => sidebarBtn(
          selectedSystemBranch === c.id,
          c.zh, c.en,
          points.filter((p) => String(p.code||"").startsWith(c.id)).length,
          "sysExBranch", c.id
        ))
      ].join(""),
      true
    );
  } else if (selectedSystem === "scalp") {
    const scalpTotal = points.filter((p) => pointMatchesSystem(p, "scalp")).length;
    html += sidebarSection(
      isEn ? "SCALP ACUPUNCTURE" : "頭皮針",
      sidebarBtn(true, "全部線區", "All Scalp Lines", scalpTotal, "tungZone", ""),
      true
    );
  } else if (selectedSystem === "special") {
    const specialDefs = [
      { id: "abdominal", zh: "腹針系統",   en: "Abdominal" },
      { id: "wrist-ankle", zh: "腕踝針",     en: "Wrist-Ankle" },
      { id: "jins3",    zh: "靱三針",       en: "Jin's 3 Needles" },
      { id: "balance",  zh: "平衡針法",     en: "Balance Method" },
    ];
    const specialTotal = points.filter((p) => pointMatchesSystem(p, "special")).length;
    html += sidebarSection(
      isEn ? "SPECIAL SYSTEMS" : "特色/微針體系",
      [
        sidebarBtn(!selectedSystemBranch, "全部", "All", specialTotal, "sysSpecialBranch", ""),
        ...specialDefs.map((s) => sidebarBtn(
          selectedSystemBranch === s.id,
          s.zh, s.en,
          points.filter((p) => String(p.meridian||"").toLowerCase().includes(s.id.replace(/-/g," "))).length,
          "sysSpecialBranch", s.id
        ))
      ].join(""),
      true
    );
  }

  // ── CROSS-CUTTING: always shown ────────────────────────────────────────────────
  // ★ 特定穴類別
  const withCounts = pointCategoryCatalog
    .map((c) => ({ c, n: points.filter((p) => pointMatchesCategory(p, c.id)).length }))
    .filter((x) => x.n > 0);
  if (withCounts.length > 0) {
    html += sidebarSection(
      isEn ? "★ SPECIFIC POINT GROUPS" : "★ 特定穴類別",
      [
        sidebarBtn(!directoryPointCategory, "全部", "All", points.length, "pointCategory", ""),
        ...withCounts.map(({ c, n }) => sidebarBtn(
          directoryPointCategory === c.id,
          c.label_zh, c.label_en, n, "pointCategory", c.id
        ))
      ].join(""),
      false  // collapsed by default when a system is active
    );
  }

  // 🩺 臨床主題
  const clinicalTopics = directoryTopics.filter((t) => (t.group || "clinical") === "clinical");
  if (clinicalTopics.length > 0) {
    html += sidebarSection(
      isEn ? "🩺 CLINICAL TOPICS" : "🩺 臨床主題與證型",
      [
        sidebarBtn(!directoryTopic, "全部", "All", points.length, "topic", ""),
        ...clinicalTopics.map((t) => sidebarBtn(
          directoryTopic === t.id,
          t.zh, t.en,
          points.filter((p) => pointMatchesTopic(p, t.id)).length,
          "topic", t.id
        ))
      ].join(""),
      false
    );
  }

  // 📍 身體部位
  if (directoryRegionGroups.length > 0) {
    html += sidebarSection(
      isEn ? "📍 BODY REGIONS" : "📍 身體部位",
      [
        sidebarBtn(!directoryRegionGroup, "全部", "All", points.length, "regionGroup", ""),
        ...directoryRegionGroups.map((g) => sidebarBtn(
          directoryRegionGroup === g.id,
          g.zh, g.en,
          points.filter((p) => pointMatchesRegionGroup(p, g.id)).length,
          "regionGroup", g.id
        ))
      ].join(""),
      false
    );
  }

  sidebar.innerHTML = html;
  bindDirectoryButtons(sidebar);

  // Collapsible section headers
  sidebar.querySelectorAll(".sidebar-section-header").forEach((hdr) => {
    hdr.addEventListener("click", () => {
      hdr.closest(".sidebar-section").classList.toggle("collapsed");
    });
  });
}

// Helpers for context-aware sidebar
function sidebarSection(title, bodyHtml, openByDefault) {
  const cls = openByDefault ? "sidebar-section" : "sidebar-section collapsed";
  return `<div class="${cls}">
    <div class="sidebar-section-header">
      <span>${escapeHtml(title)}</span>
      <span class="chevron">▾</span>
    </div>
    <div class="sidebar-section-body">${bodyHtml}</div>
  </div>`;
}

function sidebarBtn(isActive, labelZh, labelEn, count, action, value) {
  const label = contentMode === "english" ? labelEn : labelZh;
  return `<button class="directory-filter-btn ${isActive ? "active" : ""}" type="button"
    data-directory-action="${escapeAttribute(action)}"
    data-directory-value="${escapeAttribute(value)}">
    <span>${escapeHtml(label)}</span>
    <small>${count}</small>
  </button>`;
}

function renderTungZoneCategories() {
  if (!tungZoneCategoryList) return;
  const tungPointsTotal = points.filter((p) => String(p.meridian || "").includes("Master Tung") || String(p.code).startsWith("T")).length;
  const rows = [
    directoryButton({
      labelZh: "全部部位",
      labelEn: "All 12 Zones",
      count: tungPointsTotal,
      active: !directoryTungZone,
      action: "tungZone",
      value: ""
    }),
    ...tungZoneGroups.map((zone) => directoryButton({
      labelZh: zone.zh,
      labelEn: zone.en,
      count: points.filter((point) => pointMatchesTungZone(point, zone.id)).length,
      active: directoryTungZone === zone.id,
      action: "tungZone",
      value: zone.id
    }))
  ];
  tungZoneCategoryList.innerHTML = rows.join("");
  bindDirectoryButtons(tungZoneCategoryList);
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

// 經外奇穴, 耳穴 and 董氏奇穴 are not channels — they are separate point systems
// with their own logic (Tung reads by 部位, not by 經絡). Listing them alongside
// 肺經 in 經絡分類 taught the wrong thing every time the page was opened, so they
// get their own box.
function isChannelMeridian(meridian) {
  const v = String(meridian || "");
  return !(v.includes("董氏") || v.includes("Master Tung")
    || v.includes("耳穴") || v.includes("Auricular")
    || v.includes("經外奇穴") || v.includes("Extra Point"));
}

// Classical 流注 order — the sequence the channels are actually learned and
// examined in. The default was alphabetical by English name, which put 膀胱經
// first and 肺經 ninth.
// Kept inside the function on purpose: render() runs from the init code above
// this line, so a module-level const here is still in its temporal dead zone
// and throws on first paint.
function channelOrderIndex(meridian) {
  const order = ["肺經", "大腸經", "胃經", "脾經", "心經", "小腸經",
    "膀胱經", "腎經", "心包經", "三焦經", "膽經", "肝經", "任脈", "督脈"];
  const i = order.indexOf(meridianLabelZh(meridian));
  return i === -1 ? order.length : i;
}

function meridianCategoryRows(list, activeValue) {
  return list.map((meridian) => directoryButton({
    labelZh: meridianLabelZh(meridian),
    labelEn: meridianLabelEn(meridian),
    count: points.filter((point) => point.meridian === meridian).length,
    active: activeValue === meridian,
    action: "meridian",
    value: meridian
  }));
}

function renderMeridianCategories() {
  if (!meridianCategoryList) return;
  const stdPoints = points.filter(isStandardChannelPoint);
  const stdMeridians = unique(stdPoints.map((point) => point.meridian))
    .sort((a, b) => channelOrderIndex(a) - channelOrderIndex(b));

  const rows = [
    directoryButton({
      labelZh: "全部正經穴位",
      labelEn: "All 361 channel points",
      count: stdPoints.length,
      active: !meridianFilter.value && selectedSystem === "standard14",
      action: "meridian",
      value: ""
    }),
    ...stdMeridians.map((meridian) => directoryButton({
      labelZh: meridianLabelZh(meridian),
      labelEn: meridianLabelEn(meridian),
      count: stdPoints.filter((point) => point.meridian === meridian).length,
      active: meridianFilter.value === meridian,
      action: "meridian",
      value: meridian
    }))
  ];

  meridianCategoryList.innerHTML = rows.join("");
  bindDirectoryButtons(meridianCategoryList);

  const accordionSummary = meridianCategoryList.closest("details")?.querySelector(".accordion-summary span");
  if (accordionSummary) {
    const isEn = contentMode === "english";
    accordionSummary.textContent = isEn ? `☯️ 14 Channels (${stdPoints.length} Points)` : `☯️ 十四正經 (${stdPoints.length}正穴)`;
  }
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
    // Clinical themes only. The list also carries index buckets (董氏索引,
    // 耳穴索引) and eight data-quality buckets (缺針刺手法, GB93待校對,
    // 缺資料來源…). Those are build state, not a way to look up a point, and
    // mixing them into 常用臨床主題 made the clinical surface read like a QA
    // dashboard. They stay reachable below, grouped and labelled for what they
    // are, so nothing is lost.
    ...directoryTopics.filter((t) => (t.group || "clinical") === "clinical").map((topic) => directoryButton({
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
      if (action === "switchSystem") {
        selectedSystem = value;
        selectedSystemBranch = "";
        meridianFilter.value = "";
        directoryTungZone = "";
        directoryPointCategory = "";
        directoryTopic = "";
        directoryRegionGroup = "";
        document.querySelectorAll(".system-tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelector(`.system-tab-btn[data-system="${value}"]`)?.classList.add("active");
      }
      if (action === "allSystem") {
        selectedSystem = "";
        selectedSystemBranch = "";
        meridianFilter.value = "";
        directoryTungZone = "";
        directoryPointCategory = "";
        directoryTopic = "";
        directoryRegionGroup = "";
        searchInput.value = "";
        document.querySelectorAll(".system-tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelector('.system-tab-btn[data-system=""]')?.classList.add("active");
      }
      if (action === "sysAurBranch" || action === "sysExBranch" || action === "sysSpecialBranch") {
        selectedSystemBranch = value;
      }
      if (action === "meridian") meridianFilter.value = value;
      if (action === "regionGroup") {
        directoryRegionGroup = value;
        regionFilter.value = "";
      }
      if (action === "topic") {
        directoryTopic = value;
        patternFilter.value = "";
      }
      if (action === "tungZone") {
        directoryTungZone = value;
        meridianFilter.value = "";
      }
      if (action === "pointCategory") {
        directoryPointCategory = value;
        searchInput.value = "";
      }
      clearPointDetailHash();
      render();
    });
  });
}

function shortMeridianFromText(value) {
  const parts = String(value || "").split("/");
  let text = (parts[0] || "").trim();
  if (text === "Extra Point") text = "Extra Points";
  return text || (contentMode === "english" ? "Uncategorized" : "未分類");
}

function meridianLabelZh(value) {
  const parts = String(value || "").split("/");
  const zh = (parts[1] || parts[0] || "").trim();
  if (zh.includes("經外奇穴") || value.includes("Extra Point")) return "經外奇穴";
  return zh || "未分類";
}

function meridianLabelEn(value) {
  const parts = String(value || "").split("/");
  let en = (parts[0] || "").trim();
  if (en === "Extra Point") en = "Extra Points";
  return en || "Uncategorized";
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

function pointMatchesTungZone(point, zoneId) {
  if (!zoneId) return true;
  const isTung = String(point.meridian || "").includes("Master Tung") || String(point.code || "").startsWith("T");
  if (!isTung) return false;
  if (point.zoneCode === zoneId) return true;
  const code = String(point.code || "");
  if (zoneId === "DT") return code.startsWith("TDT");
  if (zoneId === "VT") return code.startsWith("TVT");
  const match = code.match(/^T(\d+)\./i);
  if (match) return match[1] === zoneId;
  return false;
}

function renderSystemToggleDrawer() {
  const drawerEl = document.getElementById("systemToggleDrawer");
  if (!drawerEl) return;

  if (!selectedSystem) {
    drawerEl.style.display = "none";
    drawerEl.innerHTML = "";
    return;
  }

  drawerEl.style.display = "block";

  let titleZh = "";
  let titleEn = "";
  let chips = [];

  if (selectedSystem === "standard14") {
    titleZh = "☯️ 十四正經分支體系 (14 Principal Channels Branch Grid)";
    titleEn = "☯️ 14 Principal Channels Branch Grid";
    chips = [
      { id: "LU", zh: "LU 肺經", en: "LU Lung" },
      { id: "LI", zh: "LI 大腸經", en: "LI Large Intestine" },
      { id: "ST", zh: "ST 胃經", en: "ST Stomach" },
      { id: "SP", zh: "SP 脾經", en: "SP Spleen" },
      { id: "HT", zh: "HT 心經", en: "HT Heart" },
      { id: "SI", zh: "SI 小腸經", en: "SI Small Intestine" },
      { id: "BL", zh: "BL 膀胱經", en: "BL Bladder" },
      { id: "KI", zh: "KI 腎經", en: "KI Kidney" },
      { id: "PC", zh: "PC 心包經", en: "PC Pericardium" },
      { id: "TE", zh: "TE 三焦經", en: "TE Triple Burner" },
      { id: "GB", zh: "GB 膽經", en: "GB Gallbladder" },
      { id: "LR", zh: "LR 肝經", en: "LR Liver" },
      { id: "CV", zh: "CV 任脈", en: "CV Ren Mai" },
      { id: "GV", zh: "GV 督脈", en: "GV Du Mai" }
    ];
  } else if (selectedSystem === "tung") {
    titleZh = "🪵 董氏奇穴 12 解剖部位分支 (Master Tung 12 Anatomical Zones Grid)";
    titleEn = "🪵 Master Tung 12 Anatomical Zones Grid";
    chips = tungZoneGroups.map(z => ({ id: z.id, zh: z.zh, en: z.en }));
  } else if (selectedSystem === "auricular") {
    titleZh = "👂 耳穴體系 14 解剖分區分支 (LCH Auricular 14 Anatomy Zones Grid)";
    titleEn = "👂 LCH Auricular 14 Anatomy Zones Grid";
    chips = [
      { id: "TF", zh: "TF 三角窩", en: "TF Triangular Fossa" },
      { id: "AH", zh: "AH 對耳輪", en: "AH Antihelix" },
      { id: "SAC", zh: "SAC 對耳輪上腳", en: "SAC Superior Antihelix Crus" },
      { id: "IAC", zh: "IAC 對耳輪下腳", en: "IAC Inferior Antihelix Crus" },
      { id: "AT", zh: "AT 對耳屏", en: "AT Antitragus" },
      { id: "TR", zh: "TR 耳屏", en: "TR Tragus" },
      { id: "CVC", zh: "CVC 耳甲腔", en: "CVC Cavum Concha" },
      { id: "CYC", zh: "CYC 耳甲艇", en: "CYC Cymba Concha" },
      { id: "EL", zh: "EL 耳垂", en: "EL Earlobe" },
      { id: "SC", zh: "SC 耳舟", en: "SC Scapha" },
      { id: "HX", zh: "HX 耳輪", en: "HX Helix" },
      { id: "HCS", zh: "HCS 耳輪腳周圍", en: "HCS Helix Crus" },
      { id: "IN", zh: "IN 屏間切跡", en: "IN Intertragic Notch" },
      { id: "POS", zh: "POS 耳背", en: "POS Posterior of Ear" }
    ];
  } else if (selectedSystem === "scalp") {
    titleZh = "🧠 頭皮針 18 分區線條分支 (Scalp Acupuncture Lines & Zones Grid)";
    titleEn = "🧠 Scalp Acupuncture Lines & Zones Grid";
    chips = [
      { id: "forehead", zh: "額區 (MS1-MS4)", en: "Forehead (MS1-MS4)" },
      { id: "parietal", zh: "頂區 (MS5-MS9)", en: "Parietal (MS5-MS9)" },
      { id: "occipital", zh: "枕區 (MS10-MS12)", en: "Occipital (MS10-MS12)" },
      { id: "temporal", zh: "顳區 (MS13-MS14)", en: "Temporal (MS13-MS14)" },
      { id: "jiao", zh: "焦氏頭針功能區", en: "Jiao Shunfa Functional Zones" }
    ];
  } else if (selectedSystem === "extra") {
    titleZh = "⭐️ 經外奇穴 5 大解剖分區分支 (Extra Acupuncture Points Regional Grid)";
    titleEn = "⭐️ Extra Acupuncture Points Regional Grid";
    chips = [
      { id: "EX-HN", zh: "EX-HN 頭頸部", en: "EX-HN Head & Neck" },
      { id: "EX-CA", zh: "EX-CA 胸腹部", en: "EX-CA Chest & Abdomen" },
      { id: "EX-B", zh: "EX-B 背部", en: "EX-B Back" },
      { id: "EX-UE", zh: "EX-UE 上肢部", en: "EX-UE Upper Extremity" },
      { id: "EX-LE", zh: "EX-LE 下肢部", en: "EX-LE Lower Extremity" }
    ];
  } else if (selectedSystem === "special") {
    titleZh = "🌀 特色微針體系分支 (Special Microsystems Grid)";
    titleEn = "🌀 Special Microsystems Grid";
    chips = [
      { id: "abdominal", zh: "腹針 Abdominal", en: "Abdominal Micro-acu" },
      { id: "wrist-ankle", zh: "腕踝針 Wrist-Ankle", en: "Wrist-Ankle Acu" },
      { id: "jins3", zh: "靳三針 Jin's 3 Needles", en: "Jin's 3 Needles" },
      { id: "balance", zh: "平衡針 Balance Method", en: "Balance Method" }
    ];
  }

  const isEn = contentMode === "english";
  drawerEl.innerHTML = `
    <div class="drawer-header">
      <div class="drawer-title">${isEn ? titleEn : titleZh}</div>
      <button type="button" class="drawer-close-btn" id="closeSystemDrawerBtn">${isEn ? "✕ Close Drawer" : "✕ 收合面板"}</button>
    </div>
    <div class="drawer-grid">
      <button type="button" class="drawer-branch-chip ${selectedSystemBranch === "" ? "active" : ""}" data-branch="">
        ${isEn ? "All Sub-Branches" : "全部子分支"}
      </button>
      ${chips.map(c => `
        <button type="button" class="drawer-branch-chip ${selectedSystemBranch === c.id ? "active" : ""}" data-branch="${c.id}">
          ${isEn ? c.en : c.zh}
        </button>
      `).join("")}
    </div>
  `;

  drawerEl.querySelector("#closeSystemDrawerBtn")?.addEventListener("click", () => {
    selectedSystem = "";
    selectedSystemBranch = "";
    document.querySelectorAll(".system-tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelector('.system-tab-btn[data-system=""]')?.classList.add("active");
    render();
  });

  drawerEl.querySelectorAll(".drawer-branch-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedSystemBranch = btn.dataset.branch || "";
      render();
    });
  });
}

function pointMatchesSystemBranch(point) {
  if (!selectedSystemBranch) return true;
  const code = String(point.code || "").toUpperCase();
  const m = String(point.meridian || "").toUpperCase();
  const loc = [point.location, point.locationEn, point.region, ...(point.anatomy || []).flatMap(a => [a.zh, a.en])].join(" ").toUpperCase();

  if (selectedSystem === "standard14") {
    return code.startsWith(selectedSystemBranch) || m.includes(selectedSystemBranch);
  }
  if (selectedSystem === "tung") {
    return pointMatchesTungZone(point, selectedSystemBranch);
  }
  if (selectedSystem === "auricular") {
    return pointMatchesEarZone(point, selectedSystemBranch);
  }
  if (selectedSystem === "scalp") {
    if (selectedSystemBranch === "forehead") return code.startsWith("MS1") || code.startsWith("MS2") || code.startsWith("MS3") || code.startsWith("MS4") || loc.includes("額");
    if (selectedSystemBranch === "parietal") return code.startsWith("MS5") || code.startsWith("MS6") || code.startsWith("MS7") || code.startsWith("MS8") || code.startsWith("MS9") || loc.includes("頂");
    if (selectedSystemBranch === "occipital") return code.startsWith("MS10") || code.startsWith("MS11") || code.startsWith("MS12") || loc.includes("枕");
    if (selectedSystemBranch === "temporal") return code.startsWith("MS13") || code.startsWith("MS14") || loc.includes("顳");
    if (selectedSystemBranch === "jiao") return loc.includes("焦氏") || point.nameZh.includes("焦氏");
  }
  if (selectedSystem === "extra") {
    return code.startsWith(selectedSystemBranch);
  }
  if (selectedSystem === "special") {
    if (selectedSystemBranch === "abdominal") return loc.includes("腹針") || m.includes("腹針");
    if (selectedSystemBranch === "wrist-ankle") return loc.includes("腕踝") || m.includes("腕踝");
    if (selectedSystemBranch === "jins3") return loc.includes("靳三針") || m.includes("靳三針");
    if (selectedSystemBranch === "balance") return loc.includes("平衡針") || m.includes("平衡針");
  }
  return true;
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
      && pointMatchesSystem(point, selectedSystem)
      && pointMatchesSystemBranch(point)
      && (!meridianFilter.value || point.meridian === meridianFilter.value)
      && (!regionFilter.value || point.region === regionFilter.value)
      && (!patternFilter.value || point.patterns.includes(patternFilter.value))
      && (!directoryRegionGroup || pointMatchesRegionGroup(point, directoryRegionGroup))
      && (!directoryTopic || pointMatchesTopic(point, directoryTopic))
      && (!directoryTungZone || pointMatchesTungZone(point, directoryTungZone))
      && (!directoryPointCategory || pointMatchesCategory(point, directoryPointCategory));
  });
}

function pointMatchesSystem(point, sys) {
  if (!sys) return true;
  const m = String(point.meridian || "");
  const code = String(point.code || "");
  if (sys === "standard14") {
    return isStandardChannelPoint(point);
  }
  if (sys === "extra") {
    return m.includes("Extra Point") || m.includes("經外奇穴") || code.startsWith("EX-");
  }
  if (sys === "tung") {
    return m.includes("Master Tung") || m.includes("董氏奇穴") || code.startsWith("T");
  }
  if (sys === "auricular") {
    return isAuricularPoint(point);
  }
  if (sys === "scalp") {
    return m.includes("Scalp") || m.includes("頭皮針") || code.startsWith("MS") || code.startsWith("SCALP-");
  }
  if (sys === "special") {
    return m.includes("Special") || m.includes("腹針") || m.includes("腕踝針") || m.includes("靳三針") || m.includes("平衡針");
  }
  return true;
}

function pointMatchesEarZone(point, zoneId) {
  if (!isAuricularPoint(point)) return false;
  if (!zoneId) return true;
  const code = String(point.code || "").toUpperCase();
  const zone = String(point.standardZone || point.standardRegion || point.region || "").toUpperCase();
  const loc = String(point.location || "").toUpperCase();
  const name = String(point.nameZh || "").toUpperCase();
  const haystack = [code, zone, loc, name].join(" ");
  const zid = zoneId.toUpperCase();

  if (zid === "TF") return code.startsWith("TF") || haystack.includes("三角窩");
  if (zid === "AH") return code.startsWith("AH") || (haystack.includes("對耳輪") && !haystack.includes("對耳輪上") && !haystack.includes("對耳輪下"));
  if (zid === "SAC") return code.startsWith("SAC") || haystack.includes("對耳輪上");
  if (zid === "IAC") return code.startsWith("IAC") || haystack.includes("對耳輪下");
  if (zid === "AT") return code.startsWith("AT") || haystack.includes("對耳屏");
  if (zid === "TR" || zid === "TG") return code.startsWith("TR") || code.startsWith("TG") || (haystack.includes("耳屏") && !haystack.includes("對耳屏"));
  if (zid === "CVC" || zid === "CO") return code.startsWith("CVC") || haystack.includes("耳甲腔");
  if (zid === "CYC") return code.startsWith("CYC") || haystack.includes("耳甲艇");
  if (zid === "EL" || zid === "LO") return code.startsWith("EL") || code.startsWith("LO") || haystack.includes("耳垂");
  if (zid === "SC" || zid === "SF") return code.startsWith("SC") || code.startsWith("SF") || haystack.includes("耳舟");
  if (zid === "HX") return (code.startsWith("HX") && !code.startsWith("HCS")) || (haystack.includes("耳輪") && !haystack.includes("對耳輪") && !haystack.includes("耳輪腳"));
  if (zid === "HCS") return code.startsWith("HCS") || haystack.includes("耳輪腳");
  if (zid === "IN") return code.startsWith("IN") || haystack.includes("屏間切跡");
  if (zid === "POS") return code.startsWith("POS") || haystack.includes("耳背") || haystack.includes("背面");

  return code.startsWith(zid) || haystack.includes(zid);
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

function isExtraPoint(point) {
  return String(point.meridian || "").includes("Extra Points")
    || String(point.meridian || "").includes("經外奇穴")
    || /^EX-/i.test(point.code);
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
  if (!point.nameZh || point.nameZh === point.nameEn) return `${point.nameEn}`;
  return `${point.nameZh} ${point.nameEn}`;
}

function pointSubtitle(point) {
  return contentMode === "english" ? `${point.pinyin} · ${shortMeridianEn(point)}` : `${point.pinyin} · ${point.meridian}`;
}

function getCompactIdentityTags(point) {
  const isEn = contentMode === "english";
  const tags = [];

  const rawIdentities = [
    ...(isEn ? (point.pointIdentityEn || point.point_identity_en || []) : (point.pointIdentityZh || point.point_identity_zh || [])),
    point.wushu_point || "",
    ...(point.point_categories || [])
  ];

  rawIdentities.forEach((idText) => {
    const txt = String(idText).trim();
    if (!txt || /^(可灸|不可灸|禁灸|待補)$/.test(txt)) return;

    if (!isEn) {
      if (txt.includes("四總穴")) tags.push(txt.length <= 25 ? txt : "四總穴");
      else if (txt.includes("八脈交會") || txt.includes("通陰蹻") || txt.includes("通陽蹻") || txt.includes("通任脈") || txt.includes("通督脈") || txt.includes("通帶脈") || txt.includes("通衝脈") || txt.includes("通陽維") || txt.includes("通陰維")) tags.push(txt.length <= 25 ? txt : "八脈交會穴");
      else if (txt.includes("水谷之海") || txt.includes("水穀之海")) tags.push("水穀之海");
      else if (txt.includes("血海")) tags.push("血海");
      else if (txt.includes("氣海")) tags.push("氣海");
      else if (txt.includes("髓海")) tags.push("髓海");
      else if (txt.includes("天窗") || txt.includes("天牖") || txt.includes("Window of Sky")) tags.push("天窗穴");
      else if (txt.includes("井穴")) tags.push("井穴");
      else if (txt.includes("滎穴")) tags.push("滎穴");
      else if (txt.includes("輸穴")) tags.push("輸穴");
      else if (txt.includes("經穴")) tags.push("經穴");
      else if (txt.includes("合穴") && !txt.includes("下合穴")) tags.push("合穴");
      else if (txt.includes("下合穴")) tags.push("下合穴");
      else if (txt.includes("原穴")) tags.push("原穴");
      else if (txt.includes("絡穴") && !txt.includes("大絡")) tags.push("絡穴");
      else if (txt.includes("大絡")) tags.push("脾之大絡");
      else if (txt.includes("郄穴")) tags.push("郄穴");
      else if (txt.includes("募穴")) tags.push("募穴");
      else if (txt.includes("背俞穴") || txt.includes("俞穴")) tags.push("背俞穴");
      else if (txt.includes("十三鬼穴") || txt.includes("鬼穴")) tags.push("十三鬼穴");
      else if (txt.length <= 20) tags.push(txt);
    } else {
      if (txt.includes("Command Point") || txt.includes("Command point")) tags.push("Command Point");
      else if (txt.includes("Confluent") || txt.includes("Master point") || txt.includes("Master Point")) tags.push("Master Point");
      else if (txt.includes("Sea of Water") || txt.includes("Sea of Grain")) tags.push("Sea of Grain");
      else if (txt.includes("Sea of Blood") || txt.includes("Xuehai")) tags.push("Sea of Blood");
      else if (txt.includes("Sea of Qi")) tags.push("Sea of Qi");
      else if (txt.includes("Sea of Marrow")) tags.push("Sea of Marrow");
      else if (txt.includes("Window of Sky")) tags.push("Window of Sky");
      else if (txt.includes("Jing-Well")) tags.push("Jing-Well");
      else if (txt.includes("Ying-Spring")) tags.push("Ying-Spring");
      else if (txt.includes("Shu-Stream")) tags.push("Shu-Stream");
      else if (txt.includes("Jing-River")) tags.push("Jing-River");
      else if (txt.includes("He-Sea") && !txt.includes("Lower He-Sea")) tags.push("He-Sea");
      else if (txt.includes("Lower He-Sea")) tags.push("Lower He-Sea");
      else if (txt.includes("Yuan-Source")) tags.push("Yuan-Source");
      else if (txt.includes("Luo-Connecting")) tags.push("Luo-Connecting");
      else if (txt.includes("Xi-Cleft")) tags.push("Xi-Cleft");
      else if (txt.includes("Front-Mu")) tags.push("Front-Mu");
      else if (txt.includes("Back-Shu")) tags.push("Back-Shu");
      else if (txt.length <= 25) tags.push(txt);
    }
  });

  return [...new Set(tags)];
}

function isIdentityTagText(t) {
  const str = String(t || "");
  return /井穴|滎穴|輸穴|經穴|合穴|原穴|絡穴|郄穴|募穴|背俞穴|八脈交會|四總穴|下合穴|水谷之海|水穀之海|血海|氣海|髓海|十三鬼穴|鬼穴|天牖五穴|天窗穴|天窗|交會穴|脾之大絡|馬丹陽|回陽|神應|頭項|肚腹|面口|腰背|胸脅|少腹|本穴|母穴|子穴|Jing-Well|Ying-Spring|Shu-Stream|Jing-River|He-Sea|Lower He-Sea|Yuan-Source|Luo-Connecting|Xi-Cleft|Front-Mu|Back-Shu|Master Point|Command Point|Window of Sky|Sea of Grain|Sea of Blood|Sea of Qi|Sea of Marrow|Horary/.test(str);
}

function isShortCleanTag(t) {
  const str = String(t || "").trim();
  if (!str) return false;
  if (str.length > 14) return false;
  if (/──|─|：|:|註記|課件/.test(str)) return false;
  return true;
}

function cardTags(point) {
  const isEn = contentMode === "english";
  const rawIdentities = isEn
    ? (point.pointIdentityEn?.length ? point.pointIdentityEn : point.point_identity_en || [])
    : (point.pointIdentityZh?.length ? point.pointIdentityZh : point.point_identity_zh || []);

  const cleanIdentities = rawIdentities
    .map((s) => String(s).trim())
    .filter((s) => s && !/^(可灸|不可灸|禁灸|待補)$/.test(s) && s.length <= 35);

  const finalIdentities = cleanIdentities.length > 0 ? cleanIdentities : getCompactIdentityTags(point);

  const rawPatterns = isEn ? (point.patternsEn || []) : (point.patterns || []);
  const cleanPatterns = rawPatterns.flatMap((p) => String(p).split(/[,，、]/)).map((s) => s.trim()).filter(isShortCleanTag);

  const combined = [...finalIdentities.slice(0, 3), ...cleanPatterns];
  return [...new Set(combined)].filter(Boolean).slice(0, 4);
}

function isIdentityTagText(t) {
  return /井穴|滎穴|輸穴|經穴|合穴|原穴|絡穴|郄穴|募穴|背俞穴|八脈交會|四總穴|下合穴|水谷之海|血海|氣海|髓海|十三鬼穴|天牖五穴|天窗穴|交會穴|脾之大絡|Jing-Well|Ying-Spring|Shu-Stream|Jing-River|He-Sea|Lower He-Sea|Yuan-Source|Luo-Connecting|Xi-Cleft|Front-Mu|Back-Shu|Master Point|Command Point|Window of Sky|Sea of Grain|Sea of Blood|Sea of Qi|Sea of Marrow/.test(t);
}


function isShortCleanTag(t) {
  const str = String(t || "").trim();
  if (!str) return false;
  if (str.length > 14) return false;
  if (/──|─|：|:|註記|課件/.test(str)) return false;
  return true;
}

function cardTags(point) {
  const identities = getCompactIdentityTags(point);
  const rawPatterns = contentMode === "english" ? (point.patternsEn || []) : (point.patterns || []);
  const cleanPatterns = rawPatterns.flatMap((p) => String(p).split(/[,，、]/)).map((s) => s.trim()).filter(isShortCleanTag);
  const combined = [...identities.slice(0, 2), ...cleanPatterns];
  return [...new Set(combined)].filter(Boolean).slice(0, 4);
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
                ${examStarBadge(point)}
              </div>
              <h2>${escapeHtml(point.nameZh || point.nameEn)}</h2>
              <p>${escapeHtml(heroSubtitle(point))}</p>
            </div>
            <div class="hero-actions">
              ${sourceLinks.map((link) => `<a class="${escapeAttribute(link.kind)}" href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a>`).join("")}
            </div>
          </div>
          <div class="hero-fact-grid">
            ${heroFact(contentMode === "english" ? "Channel" : "所屬經絡", contentMode === "english" ? shortMeridianEn(point) : shortMeridian(point), point.code)}
            ${heroFact(contentMode === "english" ? "Region" : "身體部位", contentMode === "english" ? regionEn(point) : (point.region || "未分類"), contentMode === "english" ? (point.locationEn || point.location) : point.location)}
            ${heroFact(contentMode === "english" ? "Needling" : "針刺/手法", shortTechnique(point), contentMode === "english" ? "Verify with professional sources and clinical training" : "依專業來源與臨床訓練判斷")}
            ${heroFact(contentMode === "english" ? "Moxibustion" : "艾灸", contentMode === "english" ? moxaTextEn(moxaText) : moxaText, contentMode === "english" ? "Based on presentation and contraindications" : (point.cautions || "依體質與病勢判斷"))}
          </div>
        </section>

        ${window.AcuTingReview ? window.AcuTingReview.strip("point", point.code, point.reviewStatus) : ""}

        ${/* ── Card order follows the clinical action sequence, not the order
              the data happened to be added in. It used to run 特定穴 → 考點 →
              功效 → 主治 → 標籤 → 連結 → 基本介紹 → 取穴方法 → …, which put
              LOCATION 8th: you scrolled past seven blocks before learning
              where the point is. 16 sections became 7, in the order you'd
              actually use them: find it → needle it → why it matters → what
              it does → what to combine → what it links to → sources. */""}

        ${/* 1. 定位・取穴・解剖 — first, because it is the first thing you need. */""}
        ${studySection(contentMode === "english" ? "Location & Point Finding" : "定位・取穴・解剖", pointLocationArticle(point), "location")}

        ${/* 2. 針法・艾灸・安全 — adjacent to location: locating and needling
              are one motion. Cautions fold in here instead of sitting alone
              near the bottom of the card where a safety note is useless. */""}
        ${/* needlingArticle already emits the cautions block from point.cautions,
              and cautionText() reads that same field — appending it printed the
              identical safety text twice, under 【安全提醒】 then 【注意事項】.
              Folding cautions into this section was the point of the
              restructure; doing it once is enough. */""}
        ${studySection(contentMode === "english" ? "Needling, Moxibustion & Safety" : "針法・艾灸・安全", needlingArticle(point), "needle", true)}

        ${/* 3. 我的臨床筆記 — placed right after location/needling/safety
              because that is the context she is in when something is worth
              writing down. Collapsed when empty (see js/notes.js), so it costs
              one line on a card that is already dense. */""}
        ${window.AcuTingNotes ? window.AcuTingNotes.panel("point", point.code, `${point.code} ${point.nameZh || point.nameEn || ""}`.trim()) : ""}

        ${/* 4. 特定穴・大局觀・考試重點 — the identity and the board framing
              belong together; they answer "why does this point matter". */""}
        ${pointIdentitySection(point)}
        ${examPearlSection(point)}

        ${/* 4. 功效與主治 — functions, indications, and the searchable tag
              layer merged into one block. They were three separate sections
              repeating each other's content. */""}
        ${pointFunctionsSection(point)}
        ${(() => {
          // 待補 is the right word for a point nobody has filled yet, and the
          // wrong word for ST17 乳中, which has no indications because it must
          // never be treated. Drop the section when there is genuinely nothing
          // rather than printing a placeholder that reads as an omission.
          const body = indicationArticle(point);
          return body ? studySection(contentMode === "english" ? "Indications" : "主治病症", body, "target") : "";
        })()}
        ${pointTagSection(point)}

        ${/* 5. 配穴與臨床應用 */""}
        ${combinePointsSection(point)}

        ${/* 6. 連結・鑑別 — condition/pattern links and the compare-with axis,
              both collapsed-by-default reference layers rather than study
              content, so they sit after the material you actually memorise. */""}
        ${pointLinkSection(point)}
        ${pointCompareSection(point)}

        ${/* 7. 來源・圖像・古籍・沿革 — provenance last. 基本介紹 (name
              etymology, aliases) moved here too: it is background, not the
              lead. */""}
        ${studySection(contentMode === "english" ? "Modern Research & Clinical Notes" : "現代研究 / 臨床提醒", evidenceText(point), "research")}
        ${classicalRefsSection(point)}
        ${studySection(contentMode === "english" ? "Name, Aliases & Background" : "穴名沿革與別名", pointIntro(point))}
        ${visualLinksSection(point)}
        ${studySection(contentMode === "english" ? "Sources" : "參考來源", formatSources(point.sources), "sources")}
      </main>

      <aside class="point-sidebar" aria-label="相關穴道與常用配穴">
        <section class="sidebar-box">
          <h3>${contentMode === "english" ? "Related Points" : "相關穴道"}</h3>
          ${related.map((item) => relatedPointButton(item, item.code)).join("") || `<p>${contentMode === "english" ? "No related points yet." : "尚未建立相關穴道。"}</p>`}
        </section>
        ${pairings.length ? `<section class="sidebar-box">
          <h3>${contentMode === "english" ? "Shares indications with" : "主治相近的穴"}</h3>
          ${pairings.map((item) => relatedPointButton(item, sharedPatternLabel(point, item))).join("")}
        </section>` : ""}
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

/* A hoisted function, not a `const` table. As a const it sat at this line
   (~3195) while renderPointCategoryBadges reads it at ~3468 — fine on a normal
   click, but opening a five-shu point's URL DIRECTLY (#point/ST36, i.e. the
   "複製分頁連結" path) renders the card during init before this line has run,
   hit the temporal dead zone, and aborted the whole top-level script: the const
   then stayed uninitialised, so every later click failed too and the page was
   dead until reload-without-hash. Function declarations hoist, so load order
   can no longer break it. */
function fiveShuElementZh(element) {
  return ({ wood: "木", fire: "火", earth: "土", metal: "金", water: "水" })[element] || element || "";
}

// PC5: 特定穴 badges on the point detail page (point → categories). Each badge
// links to the directory filtered by that category (the bidirectional loop).
// ── Card blocks added to give the point page the herb card's structure ──────
// The herb card leads with identity and exam value, then goes into detail. The
// point page did the opposite: it opened with 基本介紹 and buried the functions
// inside the indications section, so the layer worth memorising had no shape.

// Course items often arrive as "headline —— detail list", e.g.
// 「一切脾胃問題 —— 胃痛、嘔吐、呃逆、腹脹…」 at 47 characters. Rendered flat it
// is a wall; split on the dash the source already uses and the headline becomes
// scannable with the detail beneath it.
function pairedRow(zhText, enText) {
  const [zhHead, ...zhTail] = String(zhText).split(/\s*(?:——|—|:：)\s*/);
  const zhDetail = zhTail.join(" — ");
  const [enHead, ...enTail] = String(enText || "").split(/\s*(?:——|—|:|à)\s*/);
  const enDetail = enTail.join(" — ");
  return `<li>
    <span class="pf-zh">${escapeHtml(zhHead)}</span>
    ${zhDetail ? `<span class="pf-detail">${escapeHtml(zhDetail)}</span>` : ""}
    ${enText ? `<span class="pf-en">${escapeHtml(enHead)}</span>` : ""}
    ${enText && enDetail ? `<span class="pf-detail pf-detail--en">${escapeHtml(enDetail)}</span>` : ""}
  </li>`;
}

function pointIdentitySection(point) {
  const zh = point.pointIdentityZh || [];
  const en = point.pointIdentityEn || [];
  const list = contentMode === "english" ? (en.length ? en : zh) : zh;
  // One identity row, not two. The structured category badges (clickable, they
  // jump to the category listing) and the curriculum's identity text were
  // rendering as separate strips saying nearly the same thing — the duplicate
  // entry point Ting has flagged before. Categories lead, curriculum text
  // follows, and terms already covered by a badge are not repeated.
  const cats = renderPointCategoryBadges(point);
  if (!list.length) return cats;
  const catText = cats.replace(/<[^>]+>/g, " ");
  const extra = list.filter((t) => {
    const core = String(t).replace(/[（(].*$/, "").trim();
    return core.length < 2 || !catText.includes(core);
  });
  if (!extra.length) return cats;
  // A safety line in the identity list is not a badge — it is a warning, and
  // ST17's 「絕對禁針禁灸」 must not look like 「合穴」.
  const chips = extra.map((t) => {
    const danger = /⚠|禁針|禁灸|NEVER|deep needling|Avoid/i.test(t);
    return `<span class="point-identity-chip${danger ? " is-danger" : ""}">${escapeHtml(t)}</span>`;
  }).join("");
  return `${cats}<div class="point-identity" aria-label="${contentMode === "english" ? "Point identity" : "穴位身分"}">
    <div class="point-identity__chips">${chips}</div>
  </div>`;
}

// Exam pearls mark the one phrase worth memorising with **…**. Escape first,
// then promote the markers — so the text is still fully escaped and only the
// marker pairs this function produced ever become tags.
function boldMarkers(text) {
  return escapeHtml(String(text || "")).replace(/\*\*([^*]+)\*\*/g, '<strong class="pep-key">$1</strong>');
}

function examPearlSection(point) {
  const pearlZh = point.exam_pearl || point.examPearl;
  const scopeZh = point.exam_importance || point.examImportance;
  const pearlEn = point.exam_pearl_en || point.examPearlEn;
  const scopeEn = point.exam_importance_en || point.examImportanceEn;
  if (!pearlZh && !scopeZh && !pearlEn && !scopeEn) return "";
  const star = Number(point.exam_star || point.examStar) || 0;
  const en = contentMode === "english";
  const heading = en ? "Exam Pearl" : "考試重點";
  const pearl = en ? (pearlEn || pearlZh) : pearlZh;
  const scope = en ? (scopeEn || scopeZh) : scopeZh;
  return `<section class="point-exam-pearl${star >= 2 ? " is-high" : ""}">
    <h3>${star ? (star >= 2 ? "★★ " : "★ ") : "💡 "}${escapeHtml(heading)}</h3>
    ${pearl ? `<p class="pep-body">${boldMarkers(pearl)}</p>` : ""}
    ${scope ? `<p class="pep-scope">${escapeHtml(scope)}</p>` : ""}
  </section>`;
}

// Functions get their own block. Bilingual side by side, because the course
// notes are English and the 中文 is the structured reading of them — seeing both
// rows is the point of the four-layer split.
function pointFunctionsSection(point) {
  // Belt and braces: normalisers should hand strings in, but a single
  // array-shaped source used to throw here and blank the whole point page.
  const asText = (v) => (Array.isArray(v) ? v.join(" ") : String(v || ""));
  const zh = asText(point.functions).split(/[，、]/).map((x) => x.trim()).filter(Boolean);
  const en = asText(point.functionsEn).split(/\s{2,}|(?<=[a-z])\s(?=[A-Z])/).map((x) => x.trim()).filter(Boolean);
  const zhList = point.functionsZhList && point.functionsZhList.length ? point.functionsZhList : zh;
  const enList = point.functionsEnList && point.functionsEnList.length ? point.functionsEnList : en;
  if (!zhList.length && !enList.length) return "";
  const aligned = zhList.length === enList.length && zhList.length > 0;

  // English mode used to still print both languages here — the section title
  // was the only thing that translated. indicationArticle (the sibling
  // section right below this one) already shows English-only in this mode;
  // this now matches that behaviour instead of contradicting it.
  if (contentMode === "english") {
    const list = enList.length ? enList : zhList;
    const rows = list.map((t) => `<li><span class="pf-zh">${escapeHtml(t)}</span></li>`).join("");
    return `<section class="study-section point-functions">
      <h3>Functions & Actions</h3>
      <ol class="point-functions__list">${rows}</ol>
    </section>`;
  }

  const rows = aligned
    ? zhList.map((z, i) => pairedRow(z, enList[i])).join("")
    : [...zhList, ...enList].map((t) => `<li><span class="pf-zh">${escapeHtml(t)}</span></li>`).join("");
  return `<section class="study-section point-functions">
    <h3>功效</h3>
    <ol class="point-functions__list${aligned ? " is-paired" : ""}">${rows}</ol>
  </section>`;
}

// Tags are the searchable layer, so they are buttons: clicking one runs the
// site search for that term rather than being decoration.
function pointTagSection(point) {
  const groups = [
    ["action", contentMode === "english" ? "Action tags" : "功效標籤", point.actionTagsZh, point.actionTagsEn],
    ["disease", contentMode === "english" ? "Condition tags" : "病症標籤", point.diseaseTagsZh, point.diseaseTagsEn]
  ];
  const html = groups.map(([kind, label, zh, en]) => {
    if (!zh || !zh.length) return "";
    // Both languages on every chip. Showing one at a time meant the English tag
    // set — which exists precisely so board study and search work in English —
    // was invisible unless the whole page was switched.
    const chips = (zh || []).map((z, i) => {
      const enText = en && en[i] ? en[i] : "";
      return `<button type="button" class="point-tag point-tag--${kind}" data-search-term="${escapeAttribute(z)}">
        <span class="pt-zh">${escapeHtml(z)}</span>${enText ? `<span class="pt-en">${escapeHtml(enText)}</span>` : ""}
      </button>`;
    }).join("");
    return `<div class="point-tags__group"><span class="point-tags__label">${escapeHtml(label)}</span><div class="point-tags__chips">${chips}</div></div>`;
  }).join("");
  if (!html) return "";
  return `<section class="study-section point-tags"><h3>${contentMode === "english" ? "Tags" : "標籤（點擊搜尋）"}</h3>${html}</section>`;
}

/* §6.5 (C) 複習對比 — the contrast is what board questions actually ask
   ("SP15 or ST25 for diarrhea"), and prose hides it. Each row names the other
   point, the axis being compared, and the sourced note. The code links to that
   point's page so the comparison can be read from either side. */
function pointCompareSection(point) {
  const rows = point.compareWith || [];
  if (!rows.length) return "";
  const html = rows.map((r) => {
    const other = (r.codes || []).find((c) => c !== point.code) || "";
    const rec = points.find((p) => p.code === other);
    const name = rec ? rec.nameZh || "" : "";
    return `<li class="pcmp-row">
      <a class="pcmp-code" href="${pointHash(other)}">${escapeHtml(other)}${name ? ` ${escapeHtml(name)}` : ""}</a>
      <span class="pcmp-axis">${escapeHtml(r.axis || "")}</span>
      <span class="pcmp-note">${escapeHtml(r.note || "")}</span>
    </li>`;
  }).join("");
  return `<section class="study-section point-compare">
    <h3>${contentMode === "english" ? "Compare with" : "複習對比"}</h3>
    <ul class="point-compare__list">${html}</ul>
  </section>`;
}

/* §6.5 (B) 連接層 — both vocabularies, because a case is written in 西醫病名
   but the reasoning is 病 → 證 → 穴. LI4 carries 115 conditions, so the list
   collapses past a dozen rather than burying the rest of the card. */
function pointLinkSection(point) {
  const K = globalThis.ACUTING_KNOWLEDGE || {};
  const condById = new Map((K.conditionCanon?.records || []).map((c) => [c.id, c]));
  const patById = new Map((K.tcmPatternCanon?.records || []).map((p) => [p.id, p]));
  const CAP = 12;

  const block = (label, items, render, showLabel = true) => {
    if (!items.length) return "";
    const head = items.slice(0, CAP).map(render).join("");
    const rest = items.slice(CAP).map(render).join("");
    return `<div class="point-links__group">
      ${showLabel ? `<span class="point-links__label">${escapeHtml(label)} <b>${items.length}</b></span>` : ""}
      <div class="point-links__chips">${head}</div>
      ${rest ? `<details class="point-links__more"><summary>${contentMode === "english" ? `show all ${items.length}` : `其餘 ${items.length - CAP} 個`}</summary><div class="point-links__chips">${rest}</div></details>` : ""}
    </div>`;
  };

  const conds = (point.relatedConditions || []).map((id) => condById.get(id)).filter(Boolean);
  const pats = (point.tcmPatternIds || []).map((id) => patById.get(id)).filter(Boolean);

  const condChip = (c) => {
    const zh = c.name_zh || c.id;
    const en = c.name_en || c.icd10_en || "";
    const enHtml = en && en !== zh ? ` <span class="pl-en">${escapeHtml(en)}</span>` : "";
    return `<button type="button" class="point-link point-link--cond" data-kind="condition" data-id="${escapeAttribute(c.id)}"><span class="pl-zh">${escapeHtml(zh)}</span>${enHtml}</button>`;
  };

  // A point like LI4 carries 100+ related conditions; a flat chip wall past a
  // dozen is unreadable and doesn't say anything about WHY those conditions
  // are grouped. category lives only on the condition record (single source
  // of truth) — this groups by it at render time, so recategorizing a
  // condition regroups every point that links to it without touching the
  // point's own data.
  const categoryVocab = K.conditionCategoryVocabulary?.categories || [];
  const categoryLabel = new Map(categoryVocab.map((c) => [c.id, c]));
  const condsByCategory = new Map();
  conds.forEach((c) => {
    const key = c.category || "uncategorized";
    if (!condsByCategory.has(key)) condsByCategory.set(key, []);
    condsByCategory.get(key).push(c);
  });
  const orderedCategoryIds = [...categoryVocab.map((c) => c.id), "uncategorized"]
    .filter((id) => condsByCategory.has(id));
  // Each category is its own collapsed <details> drawer rather than an
  // always-expanded block — a point like LI4/ST36 has 100+ conditions across
  // 12 categories, and expanding all of them by default made this the
  // longest section on the page before you'd read a single condition name.
  const condGroupsHtml = orderedCategoryIds.map((catId) => {
    const label = categoryLabel.get(catId);
    const title = label
      ? (contentMode === "english" ? label.name_en : label.name_zh)
      : (contentMode === "english" ? "Uncategorized" : "未分類");
    const items = condsByCategory.get(catId);
    const inner = block(title, items, condChip, false);
    if (!inner) return "";
    return `<details class="point-links__category-drawer">
      <summary>${escapeHtml(title)} <b>${items.length}</b></summary>
      <div class="point-links__category-body">${inner}</div>
    </details>`;
  }).join("");
  // The whole auto-derived list goes inside ONE collapsed drawer, clearly
  // labeled as auto-derived and unranked, so it stops competing with the
  // curated key-conditions block above it for attention.
  const condsSection = condGroupsHtml
    ? `<details class="point-links__auto-wrap">
        <summary>${contentMode === "english"
          ? `All linked conditions <b>${conds.length}</b> — auto-derived from condition protocols, not ranked by importance`
          : `全部關聯病症 <b>${conds.length}</b> —— 由病症處方自動連結，未分主次`}</summary>
        <div class="point-links__category-wrap">${condGroupsHtml}</div>
      </details>`
    : "";

  // Curated lead conditions: what this point is actually FOR, in board terms.
  // This answers the question the 112-item auto list cannot.
  const keyZh = (point.keyConditionsZh || []).filter(Boolean);
  const keyEn = (point.keyConditionsEn || []).filter(Boolean);
  const keyAligned = keyZh.length && keyZh.length === keyEn.length;
  let keySection = "";
  if (keyZh.length || keyEn.length) {
    const label = contentMode === "english" ? "Primary clinical uses" : "主要臨床應用（考試導向）";
    let rows;
    if (contentMode === "english") {
      rows = (keyEn.length ? keyEn : keyZh).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
    } else if (keyAligned) {
      rows = keyZh.map((z, i) => `<li><span class="pkc-zh">${escapeHtml(z)}</span><span class="pkc-en">${escapeHtml(keyEn[i])}</span></li>`).join("");
    } else {
      rows = [...keyZh, ...(keyZh.length ? [] : keyEn)].map((t) => `<li>${escapeHtml(t)}</li>`).join("");
    }
    keySection = `<div class="point-links__key">
      <span class="point-links__label">${escapeHtml(label)} <b>${keyZh.length || keyEn.length}</b></span>
      <ol class="point-links__key-list${keyAligned && contentMode !== "english" ? " is-paired" : ""}">${rows}</ol>
    </div>`;
  }

  const html = [
    keySection,
    // Patterns have no page of their own yet, so the chip runs the site search
    // instead of pretending to navigate somewhere.
    // 方證 (桂枝湯證) and 證候 (肝氣鬱結) are different kinds of diagnosis; the
    // canon marks which, so the chip says so rather than presenting them as
    // one flat vocabulary.
    block(contentMode === "english" ? "TCM patterns" : "相關中醫證候", pats, (p) =>
      `<button type="button" class="point-link point-link--pat${p.kind === "方證" ? " is-formula-pattern" : ""}" data-search-term="${escapeAttribute(p.name_zh)}">${escapeHtml(p.name_zh)}${p.formula_zh ? `<span class="pl-formula">${escapeHtml(p.formula_zh)}</span>` : ""}</button>`),
    condsSection
  ].join("");
  if (!html) return "";
  return `<section class="study-section point-links">
    <h3>${contentMode === "english" ? "Linked conditions & patterns" : "連結：病證與證候"}</h3>${html}
  </section>`;
}

function renderPointCategoryBadges(point) {
  const cats = point.pointCategories || [];
  if (!cats.length) return "";
  const badges = cats.map((id) => {
    const c = pointCategoryLabelById.get(id);
    const label = c ? (contentMode === "english" ? c.label_en : c.label_zh) : id;
    let extra = "";
    if (id.startsWith("five_shu.") && point.fiveShuElement) {
      extra = ` · ${fiveShuElementZh(point.fiveShuElement)}`;
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
        <strong>${examStarMark(item)}${escapeHtml(label)}</strong>
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

function studySection(title, body, tone = "book", collapsed = false) {
  if (collapsed) {
    const hintText = contentMode === "english" ? "Click to expand / collapse" : "點擊展開 / 折疊 針法安全";
    return `
      <details class="study-section ${escapeAttribute(tone)} collapsible-study-section">
        <summary class="study-section-summary">
          <h3>${escapeHtml(title)}</h3>
          <span class="toggle-hint-pill">${hintText}</span>
        </summary>
        <div class="study-copy">${formatStudyText(body)}</div>
      </details>
    `;
  }
  return `
    <section class="study-section ${escapeAttribute(tone)}">
      <h3>${escapeHtml(title)}</h3>
      <div class="study-copy">${formatStudyText(body)}</div>
    </section>
  `;
}

function visualLinksSection(point) {
  const links = normalizeVisualLinks(point.visualLinks || []);
  const title = contentMode === "english" ? "Visual References & Point Diagrams" : "圖像與取穴圖解";

  let imgHtml = "";
  if (point.diagramUrlsEn && point.diagramUrlsEn.length > 0) {
    const isTung = String(point.meridian || "").includes("Master Tung") || String(point.code).startsWith("T");
    if (isTung) {
      const imgLinks = point.diagramUrlsEn.map((imgUrl, idx) => `
        <a href="${escapeAttribute(imgUrl)}" target="_blank" rel="noreferrer" class="tung-diagram-card">
          <img src="${escapeAttribute(imgUrl)}" alt="${escapeAttribute(point.nameZh || point.nameEn)} Diagram ${idx + 1}" loading="lazy" onerror="this.parentElement.style.display='none';" />
          <span>${contentMode === "english" ? `eLotus Diagram ${idx + 1}` : `eLotus 官方圖解 ${idx + 1}`}</span>
        </a>
      `).join("");
      imgHtml = `<div class="tung-diagram-grid">${imgLinks}</div>`;
    }
  }

  if (!links.length && !imgHtml) return studySection(title, contentMode === "english" ? "No visual reference links yet." : "尚未建立外部圖像連結。", "visual");

  return `
    <section class="study-section visual">
      <h3>${escapeHtml(title)}</h3>
      ${imgHtml}
      <div class="visual-link-grid">
        ${links.map((link) => `
          <a href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer">
            <strong>${escapeHtml(contentMode === "english" ? link.labelEn : link.labelZh)}</strong>
            <span>${escapeHtml(link.source || safeHostname(link.url))}</span>
          </a>
        `).join("")}
      </div>
      <p class="visual-note">${contentMode === "english"
        ? "External diagrams open in a new tab. Verify against professional textbooks before clinical use."
        : "外部權威圖解可在新分頁開啟。請作為定位參考，臨床使用仍需對照專業教材與安全規範。"}</p>
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
  const isIdentity = typeof isIdentityTagText === "function" && isIdentityTagText(text);
  return `<span class="tag ${isIdentity ? "identity-tag" : ""}">${escapeHtml(text)}</span>`;
}

function shortMeridian(point) {
  return meridianLabelZh(point.meridian);
}

function shortMeridianEn(point) {
  return meridianLabelEn(point.meridian);
}

function regionEn(point) {
  // point.region ("小腿") is a clean curated value; check it first. Scanning
  // raw location TEXT for Chinese keywords is unsafe on its own — ST36's
  // location sentence names "犢鼻" (Dubi, a knee-area landmark) as its
  // reference point, and 犢鼻 contains 鼻 ("nose"), which matched the
  // head/face pattern and mislabeled every leg point that uses it as a
  // landmark as "Head and face". Location text is now only a fallback, and
  // only via English keywords once region itself is empty.
  const region = String(point.region || "");
  if (/頭|面|鼻|眼|眉|項|頸|head|face|scalp|eye|nose/i.test(region)) return "Head and face";
  if (/胸|腹|chest|abdomen|thorax/i.test(region)) return "Chest and abdomen";
  if (/背|腰|骶|back|lumbar|sacral/i.test(region)) return "Back";
  if (/手|腕|肘|臂|肩|hand|wrist|elbow|forearm|arm|shoulder/i.test(region)) return "Upper limb";
  if (/腿|膝|踝|足|下肢|leg|knee|ankle|foot|lower limb/i.test(region)) return "Lower limb";
  if (/耳|ear|auricular/i.test(region)) return "Auricular";
  if (region) return "Body region";
  const text = `${point.locationEn || ""}`;
  if (/head|face|scalp|eye|nose/i.test(text)) return "Head and face";
  if (/chest|abdomen|thorax/i.test(text)) return "Chest and abdomen";
  if (/back|lumbar|sacral/i.test(text)) return "Back";
  if (/hand|wrist|elbow|forearm|arm|shoulder/i.test(text)) return "Upper limb";
  if (/leg|knee|ankle|foot|lower limb/i.test(text)) return "Lower limb";
  if (/ear|auricular/i.test(text)) return "Auricular";
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

function americanDragonPointUrl(point) {
  const code = String(point.code || "").trim().toUpperCase();
  const match = code.match(/^([A-Z]+)(\d+)$/);
  if (!match) return "https://www.americandragon.com/";

  const prefix = match[1];
  const num = match[2];

  const prefixMap = {
    TE: "SJ",
    SJ: "SJ",
    TH: "SJ",
    BL: "UB",
    UB: "UB",
    KI: "KI",
    KD: "KI",
    LR: "LIV",
    LIV: "LIV",
    CV: "REN",
    REN: "REN",
    GV: "DU",
    DU: "DU"
  };

  const adPrefix = prefixMap[prefix] || prefix;
  return `https://www.americandragon.com/Points/${adPrefix}-${num}.html`;
}

function eLotusPointUrl(point) {
  const visualLinks = normalizeVisualLinks(point.visualLinks || point.visual_links || []);
  const directVisual = visualLinks.find((v) => v && v.url && /mastertungacupuncture\.org\/acupuncture\/traditional\/points\//.test(v.url));
  if (directVisual) return directVisual.url;

  const sources = Array.isArray(point.sources) ? point.sources : [];
  const directSource = sources.find((s) => typeof s === "string" && /mastertungacupuncture\.org\/acupuncture\/traditional\/points\//.test(s));
  if (directSource) return directSource;

  let code = String(point.code || point.id || "").toLowerCase().trim();
  if (isExtraPoint(point) || String(point.meridian || "").includes("Master Tung")) {
    return visualLinks[0]?.url || (typeof sources[0] === "string" && sources[0].startsWith("http") ? sources[0] : "https://www.mastertungacupuncture.org/acupuncture/traditional/points");
  }

  code = code.replace(/^te/, "th").replace(/^sj/, "th");
  return `https://www.mastertungacupuncture.org/acupuncture/traditional/points/${code}`;
}

function externalPointLinks(point) {
  const sources = point.sources || [];
  const visualLinks = normalizeVisualLinks(point.visualLinks || []);

  if (isAuricularPoint(point)) {
    const primary = visualLinks[0]?.url || sources[0] || "https://cht.a-hospital.com/w/%E9%92%88%E7%81%B8%E5%AD%A6/%E8%80%B3%E9%92%88%E7%96%97%E6%B3%95";
    return [
      { label: contentMode === "english" ? "CloudTCM" : "雲端中醫", url: chinesePointReference(point), kind: "chinese" },
      { label: contentMode === "english" ? "Visual Diagram" : "耳穴圖源", url: primary, kind: "english" }
    ];
  }

  // 1. CloudTCM (中文)
  const storedChinese = sources.find((source) => /cloudtcm\.com\/acupoint\/\d+/.test(source));
  const chinese = storedChinese || chinesePointReference(point);

  // 2. American Dragon (AD) — Direct 1-to-1 point page
  const adUrl = americanDragonPointUrl(point);

  // 3. eLotus / Master Tung Acupuncture — Direct 1-to-1 point page
  const eLotusUrl = eLotusPointUrl(point);

  if (contentMode === "english") {
    return [
      { label: "CloudTCM", url: chinese, kind: "chinese" },
      { label: "American Dragon (AD)", url: adUrl, kind: "english" },
      { label: "eLotus CORE", url: eLotusUrl, kind: "english" }
    ];
  }

  return [
    { label: "雲端中醫", url: chinese, kind: "chinese" },
    { label: "American Dragon (AD)", url: adUrl, kind: "english" },
    { label: "eLotus 權威圖解", url: eLotusUrl, kind: "english" }
  ];
}

function primaryFunction(point) {
  return String(point.functions || point.functionsEn || "待補功效").split(/[，,。.\n]/)[0].trim();
}

function primaryFunctionEn(point) {
  return String(point.functionsEn || point.functions || "Actions pending").split(/[，,。.\n]/)[0].trim();
}

function shortTechnique(point) {
  // English mode used to still show this tile in Chinese (acumethodZh was
  // checked unconditionally first) even when an English needling method was
  // on record. Check the mode-matching field first, the other language only
  // as a fallback when the preferred one is missing.
  const zhFirst = () => {
    if (point.acumethodZh) { const f = point.acumethodZh.split('\n')[0].trim(); if (f) return f; }
    if (point.acumethodEn) { const f = point.acumethodEn.split('\n')[0].trim(); if (f) return f; }
    return "";
  };
  const enFirst = () => {
    if (point.acumethodEn) { const f = point.acumethodEn.split('\n')[0].trim(); if (f) return f; }
    if (point.acumethodZh) { const f = point.acumethodZh.split('\n')[0].trim(); if (f) return f; }
    return "";
  };
  const preferred = contentMode === "english" ? enFirst() : zhFirst();
  if (preferred) return preferred;
  if (point.needling && typeof point.needling === "string") {
    const first = point.needling.split(/[\n。]/)[0].trim();
    if (first) return first;
  }
  const text = formatTechniqueNotes(point);
  const depth = String(point.needlingDepth || "").trim();
  if (depth) return depth;
  const match = text.match(/(?:平刺|直刺|斜刺|oblique|transverse|perpendicular)[^。\n；;]*/i);
  if (match) return match[0];
  return contentMode === "english" ? "Perpendicular / Oblique needling 0.2-0.5 cun" : "直刺或斜刺 0.2～0.5 寸";
}

function inferMoxaText(point) {
  if (point.moxaZh && point.moxaZh.length > 5) return "可施灸 (詳見內文步驟)";
  const caution = `${point.cautions || ""} ${point.techniqueNotes || ""}`;
  if (/禁灸|不宜灸|moxa contraindicated/i.test(caution)) return "不建議";
  if (/艾灸|moxa/i.test(caution)) return "依證適用";
  return contentMode === "english" ? "As indicated / Warm moxibustion" : "依證溫灸或溫針";
}

function moxaTextEn(text) {
  if (/不建議|禁|contra/i.test(text)) return "Not recommended";
  if (/適用|moxa|施灸|依證/i.test(text)) return "As indicated";
  return "As indicated / Warm moxibustion";
}

function pointIntro(point) {
  if (contentMode === "english") {
    const regionText = regionEn(point) || point.region || "Master Tung anatomical region";
    const actionsText = point.functionsEn || (Array.isArray(p => p.traditional_functions_en) ? p.traditional_functions_en.join(", ") : "") || "Harmonize Qi & Blood, Unblock Channels";
    return `${point.nameEn} (${point.pinyin}; ${point.code}) belongs to ${shortMeridianEn(point)}. It is located in the ${regionText}.\n\nActions & Reaction Areas:\n${actionsText}\n\nClinical Application Note: Master Tung Acupuncture point for targeted channel regulation and internal organ harmony. Verify needling depth, angle, and safety precautions against professional textbooks.`;
  }
  const introParts = [];
  if (point.nameIntroZh) {
    introParts.push(`【穴名釋義與概論】\n${point.nameIntroZh}`);
  } else {
    introParts.push(`${point.nameZh} (${point.pinyin}; ${point.nameEn}) 屬於 ${shortMeridian(point)}，位置在${point.region || "未分類部位"}。`);
  }
  if (point.otherNamesZh) introParts.push(`【別名】${point.otherNamesZh}`);
  // 特定穴分類 and 功效 now have their own blocks above this one; repeating them
  // here is the duplicate-entry problem in miniature — the reader sees the same
  // list twice and cannot tell which is authoritative.
  return introParts.join("\n\n");
}

function pointLocationArticle(point) {
  if (contentMode === "english") {
    return [
      `LOCATION:\n${point.locationEn || point.location || "Located along corresponding Master Tung zone & anatomical landmarks."}`,
      point.notesEn ? `NOTES:\n${point.notesEn}` : "",
      `Code and Region:\n${formatStandardMeta(point)}`,
      point.anatomyEn ? `Anatomy & Reaction Areas:\n${point.anatomyEn}` : `Anatomy Terms:\n${formatAnatomy(point.anatomy, "english")}`
    ].filter(Boolean).join("\n\n");
  }

  // This block used to repeat the code (already in the hero) and the actions
  // (now their own section), and it printed the Tung-point fallback 「相應經絡」
  // as the channel for every 十四經 point because channels_zh is empty on them —
  // channel_zh is where the value actually lives. Location is what this section
  // is for, so it leads and is split into landmark / cun / posture rather than
  // arriving as one sentence.
  const channelsStr = (point.channelsZh && point.channelsZh.length)
    ? point.channelsZh.join("、")
    : (point.channelZh || point.channels || shortMeridian(point) || "");

  // Split the location sentence on its own commas: the first clause is the
  // region, clauses carrying 寸/指 are the measurement, the rest are landmarks.
  const locRaw = String(point.location || "").trim();
  const clauses = locRaw.split(/[，,]/).map((c) => c.trim()).filter(Boolean);
  const cun = clauses.filter((c) => /[0-9０-９]+\s*寸|橫指|指寬/.test(c));
  const rest = clauses.filter((c) => !cun.includes(c));

  const parts = [];
  if (locRaw) {
    parts.push(`【定位 Location】${locRaw}`);
    // Only the cun measurement is pulled out — it is the exam-critical part and
    // easy to lose inside the sentence. A 體表標誌 line was tried too, but it
    // was just the same sentence minus the cun, so the section said everything
    // twice.
    if (cun.length) parts.push(`【骨度分寸】${cun.join("；")}`);
  } else {
    parts.push("【定位 Location】待補");
  }
  if (point.cunMeasurement) parts.push(`【取穴要點】${point.cunMeasurement}`);
  if (channelsStr) parts.push(`【歸經 Channel】${channelsStr}${point.region ? `　【部位】${point.region}` : ""}`);
  const anat = point.anatomyZh || formatAnatomy(point.anatomy);
  if (anat) parts.push(`【解剖 Anatomy】${anat}`);
  return parts.join("\n\n");
}

function indicationArticle(point) {
  // Indications only. This function used to render the tag chips as well, which
  // duplicated the dedicated tag section below it and left the 主治病症 heading
  // showing tags instead of indications. Tags live in pointTagSection; this
  // block shows what the course actually lists as indications, paired 中英 the
  // same way the functions block does.
  const zh = (point.patterns || []).filter(Boolean);
  const en = (point.patternsEn || []).filter(Boolean);
  const aligned = zh.length && zh.length === en.length;

  if (contentMode === "english") {
    const list = en.length ? en : zh;
    if (!list.length) return "";
    return `<ol class="point-functions__list">${list.map((t) => `<li><span class="pf-zh">${escapeHtml(t)}</span></li>`).join("")}</ol>`;
  }

  if (!zh.length && !en.length) return "";
  const rows = aligned
    ? zh.map((z, i) => pairedRow(z, en[i])).join("")
    : [...zh, ...(zh.length ? [] : en)].map((t) => `<li><span class="pf-zh">${escapeHtml(t)}</span></li>`).join("");
  return `<ol class="point-functions__list${aligned ? " is-paired" : ""}">${rows}</ol>`;
}

function formatCombinePointsText(text) {
  if (!text) return "";

  const termMap = new Map();
  Object.entries(patternEnglishMap).forEach(([k, v]) => { if (k.length >= 2 && v) termMap.set(k, v); });
  Object.entries(functionEnglishMap).forEach(([k, v]) => { if (k.length >= 2 && v && !termMap.has(k)) termMap.set(k, v); });

  const sortedTerms = Array.from(termMap.keys()).sort((a, b) => b.length - a.length);
  if (sortedTerms.length === 0) return text;

  const escapedTerms = sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const masterRegex = new RegExp(`(${escapedTerms.join('|')})`, 'g');

  const paragraphs = String(text).split(/\n{2,}/);

  const formattedParagraphs = paragraphs.map(p => {
    const lines = p.split('\n').map(line => {
      let escapedLine = escapeHtml(line);
      return escapedLine.replace(masterRegex, (match) => {
        const en = termMap.get(match);
        if (!en) return match;
        return `<span class="k-tag symptom">${match} <small>(${escapeHtml(en)})</small></span>`;
      });
    });
    return `<p>${lines.join('<br>')}</p>`;
  });

  return formattedParagraphs.join('');
}

function highlightCombineText(text) {
  if (!text) return "";
  let clean = escapeHtml(text);
  // First highlight any 2-5 character Chinese string ending in 穴
  clean = clean.replace(/([一-龥]{2,5}穴)/g, '<span class="comb-point-highlight">$1</span>');
  // Highlight famous Master Tung point names without 穴 suffix
  const famousPointsRegex = /(靈骨|大白|中白|重子|重仙|下三皇|上三黃|三河|駟馬|通關|通山|通天|水金|水通|駕骨|正筋|正宗|正士|四花中|四花上|四花下|四花副|四花外|腎關|側三里|側下三里|足千金|足五金|外三關|木穴|婦科|制污|止涎|五虎|其門|其角|其正|火串|火陵|火山|手五金|手千金|心門|腸門|肝門|肩中|建中|曲陵|建力|中力|富頂|後枝|肩峰|地宗|天宗|雲白|李白|支骨|上曲|下曲|雲陵|正脊一|正脊二|正脊三|三神|背部相關穴)/g;
  clean = clean.replace(famousPointsRegex, '<span class="comb-point-highlight">$1</span>');
  // Remove redundant nested spans
  clean = clean.replace(/<span class="comb-point-highlight">(<span class="comb-point-highlight">.*?<\/span>)<\/span>/g, '$1');
  return clean;
}

function parseAnyCombinationTextToCards(rawText) {
  if (!rawText || typeof rawText !== "string") return [];
  const text = rawText.trim();
  if (!text) return [];

  const items = [];
  const CHINESE_NUMS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三", "十四", "十五"];

  // Split lines strictly by newline to preserve paragraph groupings
  const rawLines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  let currentCard = null;

  rawLines.forEach(line => {
    // Check if line is a principle/mechanism explanation line (原理 / 機制 / 解析)
    const isPrinciple = /^(?:原理|機制|解析|說明|按語|方義)[：:\s]*/.test(line);

    if (isPrinciple && currentCard) {
      // MERGE INTO PREVIOUS CARD! DO NOT CREATE SEPARATE CARD!
      const principleText = line.replace(/^(?:原理|機制|解析|說明|按語|方義)[：:\s]*/, '').trim();
      // Store it as its own field. Appending markup into `text` meant
      // highlightCombineText's escapeHtml then escaped the tags this line had
      // just written, and every pairing card rendered a literal
      // `<br><span class="comb-principle-title">【原理與機制】</span>` on screen.
      currentCard.principle = currentCard.principle
        ? `${currentCard.principle} ${principleText}`
        : principleText;
      return;
    }

    // Check for colon separator: "1. 靈道穴配心俞穴治心痛" or "治心痛：靈道穴配心俞穴"
    const colonMatch = line.match(/^(?:[\d一二三四五六七八九十]+[\.、\)\s]*|【[^】]+】\s*)?([^：:\n]{2,25})[：:](.*)/);
    const cureMatch = line.match(/(?:治|主治|適用於)\s*([^，,。]+)/);

    let title = "";
    let body = "";

    if (colonMatch) {
      let rawTitle = colonMatch[1].trim();
      body = colonMatch[2].trim();
      title = rawTitle.replace(/^[\d一二三四五六七八九十]+[\.、\)\s]*/, '').trim();
    } else if (cureMatch) {
      title = `治 ${cureMatch[1].trim()}`;
      body = line;
    } else if (line.length > 3) {
      title = "臨床配穴應用";
      body = line;
    }

    if (title && body) {
      if (!title.startsWith("治") && !title.startsWith("配") && !title.includes("應用")) {
        title = `治 ${title}`;
      }

      const numIdx = items.length;
      const numPrefix = numIdx < CHINESE_NUMS.length ? `${CHINESE_NUMS[numIdx]}· ` : `${numIdx + 1}· `;

      currentCard = {
        title: `${numPrefix}${title}`,
        text: body.endsWith("。") ? body : `${body}。`
      };
      items.push(currentCard);
    }
  });

  return items;
}

function combinePointsSection(point) {
  const isTung = String(point.meridian || "").includes("Master Tung") || String(point.code).startsWith("T");
  const title = contentMode === "english" ? "Point Pairings & Clinical Combinations" : "🎯 常用配穴與臨床應用";

  // English mode used to still parse combinePointsZh here (only the section
  // TITLE was translated) — a card in "Public EN" mode showed Chinese combo
  // text with an English heading. When an English version exists, render it
  // directly instead of running it through the 中文 card parser below, which
  // expects 一、二、三 / colon patterns that don't apply to English prose.
  if (contentMode === "english" && point.combinePointsEn) {
    const paragraphs = String(point.combinePointsEn).split(/\n{2,}/).filter(Boolean)
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("");
    return studySection(title, paragraphs, "link");
  }

  // 1. Structured cards present on record (e.g. Master Tung points)
  let cards = point.combinationsStructured || [];

  // 2. If no pre-structured cards, parse raw combination text dynamically into card grid framework
  if (!cards || cards.length === 0) {
    const rawText = point.combinePointsZh || (point.combinationsZh ? point.combinationsZh.join("\n") : "") || point.applications_zh || "";
    cards = parseAnyCombinationTextToCards(rawText);
  }

  let cardsHtml = "";
  if (cards && cards.length > 0) {
    cardsHtml = `<div class="tung-comb-grid">${
      cards.map(c => `
        <div class="tung-comb-card">
          <h4 class="tung-comb-title">${escapeHtml(c.title || "配穴組合")}</h4>
          <p class="tung-comb-text">${highlightCombineText(c.text)}</p>
          ${c.principle ? `<p class="tung-comb-principle"><span class="comb-principle-title">${contentMode === "english" ? "Mechanism" : "【原理與機制】"}</span>${highlightCombineText(c.principle)}</p>` : ""}
        </div>
      `).join("")
    }</div>`;
  }

  const appText = point.applicationZh ? `<p class="tung-comb-extra"><strong>【臨床應用】</strong> ${highlightCombineText(point.applicationZh)}</p>` : "";
  const expText = point.explanationZh ? `<p class="tung-comb-extra"><strong>【說明與要點】</strong> ${highlightCombineText(point.explanationZh)}</p>` : "";

  const combinedBody = [cardsHtml, appText, expText].filter(Boolean).join("");
  if (!combinedBody) return "";

  return studySection(title, combinedBody, "link");
}

function classicalRefsSection(point) {
  if (!point.classicalRefs || !point.classicalRefs.length) return "";
  const title = contentMode === "english" ? "Classical Literature References" : "📜 古籍經典引用";
  const text = point.classicalRefs.map(r => `《${r.source_zh}》：${r.excerpt_zh}`).join("\n\n");
  return studySection(title, text, "book");
}

function needlingArticle(point) {
  const parts = [];
  if (contentMode === "english") {
    if (point.acumethodEn) parts.push(`TECHNIQUES:\n${point.acumethodEn}`);
    else if (point.acumethodZh) parts.push(`TECHNIQUES:\n${point.acumethodZh}`);
    if (point.moxaEn) parts.push(`MOXIBUSTION & HEAT THERAPY:\n${point.moxaEn}`);
    if (point.cautionsEn && point.cautionsEn.length) parts.push(`CONTRAINDICATIONS:\n${point.cautionsEn.join("\n")}`);
    else if (point.cautions) parts.push(`CONTRAINDICATIONS / SAFETY:\n${point.cautions}`);
  } else {
    if (point.acumethodZh) parts.push(`【針刺法】\n${point.acumethodZh}`);
    else if (point.techniqueNotes) parts.push(`【針刺法】\n${point.techniqueNotes}`);

    if (point.needleSensationZh) parts.push(`【針感】\n${point.needleSensationZh}`);

    if (point.moxaZh) parts.push(`【艾灸與熱療】\n${point.moxaZh}`);
    if (point.cautions) parts.push(`【安全提醒】\n${point.cautions}`);
  }
  return parts.filter(Boolean).join("\n\n");
}

function evidenceText(point) {
  // Anatomy has its own display in pointLocationArticle (right after
  // Location, where Ting asked for it) — it used to also print here under
  // 現代研究/臨床提醒, so every point showed its anatomy twice. This section is
  // modern research / clinical notes only now.
  const parts = [];
  if (contentMode === "english") {
    const modernEn = point.modernResearchEn || point.modernResearchZh;
    if (modernEn) parts.push(`【Clinical Application Notes】\n${modernEn}`);
    if (point.reviewStatus === "sourced_elotus_direct") {
      parts.push("【Source Provenance】This record is sourced directly from eLotus CORE Master Tung Standard Documentation.");
    } else {
      parts.push("Master Tung Acupuncture Clinical Reference: Verify point selection with classic literature and professional textbooks.");
    }
    return parts.join("\n\n");
  }

  if (point.sourceProvenanceNoteZh) {
    parts.push(`【出處與文獻標註】\n${point.sourceProvenanceNoteZh}`);
  }
  if (point.modernResearchZh) parts.push(`【現代臨床與研究】\n${point.modernResearchZh}`);
  // The CloudTCM import wrote the same paragraph into both evidence and
  // modern_research_zh on 348 of 361 points, so this section printed it twice
  // under two different headings. The data keeps both fields (§0「只刪不加」);
  // the card just does not repeat itself.
  const evidenceIsEcho = point.evidence && point.modernResearchZh
    && String(point.evidence).trim() === String(point.modernResearchZh).trim();
  if (point.evidence && !evidenceIsEcho && !point.evidence.includes("draft record for AcuTing OS")) {
    parts.push(`【學習提醒】\n${point.evidence}`);
  }
  if (parts.length > 0) return parts.join("\n\n");
  return "目前先保留為臨床學習提醒。";
}

function cautionText(point) {
  let cautionStr = point.cautions || "";
  if (typeof cautionStr !== "string") cautionStr = String(cautionStr);
  const lines = Array.from(new Set(
    cautionStr.split("\n").map(l => l.trim()).filter(l => l.length > 0)
  ));
  const cleanStr = lines.join("\n");
  if (contentMode === "english") return cleanStr || "No specific cautions entered yet. Clinical use requires professional training, anatomy-based safety assessment, and patient-specific contraindication screening.";
  return cleanStr || "無特別標註。實際操作仍需依專業訓練、解剖安全、患者體質與禁忌判斷。";
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
  if (!text) return "<p>待補</p>";
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return String(text)
      .split(/\n{2,}/)
      .map((p) => (p.trim().startsWith("<") ? p : `<p>${p.replaceAll("\n", "<br>")}</p>`))
      .join("");
  }
  return String(text)
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

/* Every source is NAMED, never a bare URL. This section used to print
   "English source: https://www.acupoints.org/st36-acupuncture-point/" as plain
   text — the raw address is noise, and it wasn't even clickable. Same rule the
   herb card already follows (HERB_RECORD_STANDARD §4.5「每個來源都要有名字」):
   the site is identified by name, the URL only lives in the href. */
function sourceSiteName(url) {
  const u = String(url || "");
  if (/mastertungacupuncture\.org/i.test(u)) return "eLotus CORE";
  if (/acupoints\.org/i.test(u)) return "AcuPoints.org";
  if (/americandragon\.com/i.test(u)) return "American Dragon";
  if (/cloudtcm\.com/i.test(u)) return "雲端中醫 CloudTCM";
  if (/chinesemedicineatlas\.com/i.test(u)) return "Chinese Medicine Atlas";
  if (/acupun\.site/i.test(u)) return "acupun.site";
  if (/a-hospital\.com/i.test(u)) return "A+醫學百科";
  if (/yibian/i.test(u)) return "醫砭";
  if (/who\.int/i.test(u)) return contentMode === "english" ? "WHO Standard" : "WHO 國際標準";
  return safeHostname(u) || (contentMode === "english" ? "Source" : "來源");
}

function formatSources(sources = []) {
  if (!sources.length) return contentMode === "english" ? "Sources pending" : "尚未標註";

  const chips = [];
  const seen = new Set();
  sources.forEach((raw) => {
    const src = String(raw || "").trim();
    if (!src) return;

    // Curriculum citations are not web links — show them as the course-file
    // badge the herb card uses (📘 課件 <file> p<N>) rather than a dead link.
    if (src.startsWith("curriculum/")) {
      const page = (src.match(/#p(\d+)/) || [])[1];
      const file = src.split("/").pop().split("#")[0].replace(/\.(pdf|md|csv|xlsx)$/i, "");
      const label = `📘 ${contentMode === "english" ? "Course" : "課件"} ${file}${page ? ` p${page}` : ""}`;
      if (seen.has(label)) return;
      seen.add(label);
      chips.push(`<span class="src-chip src-chip--course">${escapeHtml(label)}</span>`);
      return;
    }

    if (!/^https?:\/\//i.test(src)) return;   // not a usable link, don't print an address
    const name = sourceSiteName(src);
    if (seen.has(name)) return;               // one chip per site, not per page
    seen.add(name);
    chips.push(`<a class="src-chip src-chip--link" href="${escapeAttribute(src)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)} ↗</a>`);
  });

  if (!chips.length) return contentMode === "english" ? "Sources pending" : "尚未標註";

  const note = contentMode === "english"
    ? "Verify against professional textbooks and WHO-style standards before clinical use."
    : "外部來源可在新分頁開啟；臨床使用仍需對照專業教材與安全規範。";
  return `<div class="src-chip-row">${chips.join("")}</div><p class="src-chip-note">${escapeHtml(note)}</p>`;
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
    return id ? "#ws/formula" : "";
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

/* ── Channel & Point Charts Workspace (經脈總覽與特定穴對照圖表) ────── */

function renderChannelsWorkspace() {
  const launcher = document.getElementById("channelsQuickLauncher");
  const content = document.getElementById("channelsContentArea");
  if (!launcher || !content) return;

  const K = globalThis.ACUTING_KNOWLEDGE || {};
  const channelRecords = K.channelsAndCharts || [];

  const mainMeridians = [
    { code: "LU", zh: "手太陰肺經", en: "Lung (LU)" },
    { code: "LI", zh: "手陽明大腸經", en: "Large Intestine (LI)" },
    { code: "ST", zh: "足陽明胃經", en: "Stomach (ST)" },
    { code: "SP", zh: "足太陰脾經", en: "Spleen (SP)" },
    { code: "HT", zh: "手少陰心經", en: "Heart (HT)" },
    { code: "SI", zh: "手太陽小腸經", en: "Small Intestine (SI)" },
    { code: "BL", zh: "足太陽膀胱經", en: "Bladder (BL)" },
    { code: "KI", zh: "足少陰腎經", en: "Kidney (KI)" },
    { code: "PC", zh: "手厥陰心包經", en: "Pericardium (PC)" },
    { code: "TE", zh: "手少陽三焦經", en: "Triple Burner (TE/TH)" },
    { code: "GB", zh: "足少陽膽經", en: "Gallbladder (GB)" },
    { code: "LR", zh: "足厥陰肝經", en: "Liver (LR)" }
  ];

  const extraVessels = [
    { code: "Du", zh: "督脈", en: "Du Mai (GV)" },
    { code: "Ren", zh: "任脈", en: "Ren Mai (CV)" },
    { code: "Chong", zh: "沖脈", en: "Chong Mai" },
    { code: "Dai", zh: "帶脈", en: "Dai Mai" },
    { code: "Yangqiao", zh: "陽蹻脈", en: "Yangqiao Mai" },
    { code: "Yangwei", zh: "陽維脈", en: "Yangwei Mai" },
    { code: "Yinqiao", zh: "陰蹻脈", en: "Yinqiao Mai" },
    { code: "Yinwei", zh: "陰維脈", en: "Yinwei Mai" }
  ];

  const isEn = contentMode === 'english';

  // ── Tab bar ───────────────────────────────────────────────────────────────
  launcher.innerHTML = `
    <div class="channels-tabs-bar" id="channelsTabsBar">
      <button type="button" class="channels-tab-btn ${activeChannelsTab === 'meridians' ? 'active' : ''}" data-ctab="meridians">
        ${isEn ? '14 Channels & Extraordinary Vessels' : '十四正經・奇經八脈'}
      </button>
      <button type="button" class="channels-tab-btn ${activeChannelsTab === 'charts' ? 'active' : ''}" data-ctab="charts">
        ${isEn ? '7 Major Point Charts (eLotus)' : '七大特定穴總表'}
      </button>
    </div>

    ${activeChannelsTab === 'meridians' ? `
      <div class="meridian-pills-row">
        ${mainMeridians.map(m => `
          <button type="button" class="meridian-pill-btn ${activeChartMode === '' && activeChannelCode === m.code ? 'active' : ''}" data-ch-code="${m.code}">
            ${m.code} <small>${isEn ? m.en : m.zh}</small>
          </button>
        `).join('')}
      </div>
      <div class="meridian-pills-row" style="margin-top: 0.4rem;">
        ${extraVessels.map(m => `
          <button type="button" class="meridian-pill-btn pill-extra-vessel ${activeChartMode === '' && activeChannelCode === m.code ? 'active' : ''}" data-ch-code="${m.code}">
            ${m.code} <small>${isEn ? m.en : m.zh}</small>
          </button>
        `).join('')}
      </div>
    ` : `
      <div class="charts-pills-row">
        <button type="button" class="chart-pill-btn ${activeChartMode === 'fiveshu' ? 'active' : ''}" data-chart-mode="fiveshu">
          ${isEn ? '1. Five Shu Points (五輸穴)' : '1. 五輸穴總表 (Five Shu Points)'}
        </button>
        <button type="button" class="chart-pill-btn ${activeChartMode === 'yuanluoxi' ? 'active' : ''}" data-chart-mode="yuanluoxi">
          ${isEn ? '2. Yuan, Luo, Xi, Front-Mu, Back-Shu' : '2. 原絡郄俞募穴總表'}
        </button>
        <button type="button" class="chart-pill-btn ${activeChartMode === 'lowerhe' ? 'active' : ''}" data-chart-mode="lowerhe">
          ${isEn ? '3. Lower He-Sea / Mother-Child / Entry-Exit' : '3. 下合穴/母子補瀉/出入穴'}
        </button>
        <button type="button" class="chart-pill-btn ${activeChartMode === 'confluent' ? 'active' : ''}" data-chart-mode="confluent">
          ${isEn ? '4. Master & Coupled Points (Eight Confluent)' : '4. 八脈交會穴與配穴'}
        </button>
        <button type="button" class="chart-pill-btn ${activeChartMode === 'groupluo' ? 'active' : ''}" data-chart-mode="groupluo">
          ${isEn ? '5. Group Luo & Muscle Meridian Meeting' : '5. 組絡穴/經筋交會穴'}
        </button>
        <button type="button" class="chart-pill-btn ${activeChartMode === 'huicommand' ? 'active' : ''}" data-chart-mode="huicommand">
          ${isEn ? '6. Hui Influential & Command Points' : '6. 八會穴與六總穴'}
        </button>
        <button type="button" class="chart-pill-btn ${activeChartMode === 'fourseaghost' ? 'active' : ''}" data-chart-mode="fourseaghost">
          ${isEn ? '7. Four Sea & 13 Ghost Points' : '7. 四海穴與十三鬼穴'}
        </button>
      </div>
    `}
  `;

  launcher.querySelectorAll('[data-ctab]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeChannelsTab = btn.dataset.ctab || 'meridians';
      if (activeChannelsTab === 'charts' && !activeChartMode) {
        activeChartMode = 'fiveshu';
      }
      renderChannelsWorkspace();
    });
  });

  launcher.querySelectorAll('[data-ch-code]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeChartMode = '';
      activeChannelCode = btn.dataset.chCode;
      renderChannelsWorkspace();
    });
  });

  launcher.querySelectorAll('[data-chart-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeChartMode = btn.dataset.chartMode;
      renderChannelsWorkspace();
    });
  });

  if (activeChartMode === 'fiveshu') {
    content.innerHTML = renderFiveShuMatrixTable();
    bindMatrixPointLinks(content);
    return;
  }
  if (activeChartMode === 'yuanluoxi') {
    content.innerHTML = renderYuanLuoXiMuShuMatrixTable();
    bindMatrixPointLinks(content);
    return;
  }
  if (activeChartMode === 'lowerhe') {
    content.innerHTML = renderLowerHeMotherChildMatrixTable();
    bindMatrixPointLinks(content);
    return;
  }
  if (activeChartMode === 'confluent') {
    content.innerHTML = renderConfluentPointsMatrixTable();
    bindMatrixPointLinks(content);
    return;
  }
  if (activeChartMode === 'groupluo') {
    content.innerHTML = renderGroupLuoMatrixTable();
    bindMatrixPointLinks(content);
    return;
  }
  if (activeChartMode === 'huicommand') {
    content.innerHTML = renderHuiAndCommandMatrixTable();
    bindMatrixPointLinks(content);
    return;
  }
  if (activeChartMode === 'fourseaghost') {
    content.innerHTML = renderFourSeaAndGhostPointsMatrixTable();
    bindMatrixPointLinks(content);
    return;
  }

  // Default: Meridian/Vessel Overview Card
  const chData = channelRecords.find(c => c.code === activeChannelCode) || channelRecords[0] || {};
  content.innerHTML = renderChannelOverviewCard(chData);
  bindMatrixPointLinks(content);
}

function bindMatrixPointLinks(container) {
  container.querySelectorAll('[data-point-code]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const code = el.dataset.pointCode;
      if (code) {
        selectedCode = code;
        window.location.hash = `#point/${code}`;
        render();
      }
    });
  });
}

function renderChannelOverviewCard(ch) {
  const en = contentMode === 'english';
  const prevCode = ch.prev_code || 'LU';
  const nextCode = ch.next_code || 'LI';

  return `
    <article class="elotus-channel-banner">
      <div>
        <span class="elotus-banner-brand">TCM Acupuncture · 經脈總覽</span>
        <div class="elotus-banner-title">
          <h1>${escapeHtml(ch.nameEn || ch.code)} <small>(${escapeHtml(ch.nameZh || '')})</small></h1>
        </div>
        <p class="elotus-banner-subtitle">
          ${escapeHtml((ch.aliases_en || []).join(', '))} · 屬性 Element: ${escapeHtml(ch.element || 'Hand/Foot')} · 時辰 Clock: ${escapeHtml(ch.clock_time || '')}
        </p>
      </div>
      <div class="elotus-banner-nav">
        <button type="button" data-ch-code="${prevCode}">‹ ${prevCode}</button>
        <button type="button" data-ch-code="${nextCode}">${nextCode} ›</button>
      </div>
    </article>

    <section class="channel-article-section">
      <h3>PATHWAY & POINTS / 循行與包含穴位 (${(ch.points_list || []).length} 穴)</h3>
      <p style="margin-bottom: 0.75rem; color: #35473e; line-height: 1.6;">
        ${escapeHtml(en ? (ch.pathway_en || ch.pathway_zh) : ch.pathway_zh)}
      </p>
      <div class="channel-points-grid">
        ${(ch.points_list || []).map(p => `
          <a class="channel-point-chip" href="#point/${p.code}" data-point-code="${p.code}">
            <strong>${p.code}</strong> ${escapeHtml(p.nameZh)} <small>(${escapeHtml(p.nameEn)})</small>
          </a>
        `).join('')}
      </div>
    </section>

    <section class="channel-article-section">
      <h3>INDICATIONS / 主治病症</h3>
      <ul style="padding-left: 1.2rem; color: #35473e; line-height: 1.6;">
        ${(en ? (ch.indications_en || ch.indications_zh) : ch.indications_zh || []).map(item => `
          <li>${escapeHtml(item)}</li>
        `).join('')}
      </ul>
    </section>

    <section class="channel-article-section">
      <h3>CLINICAL APPLICATIONS / 臨床特點與應用</h3>
      <ul style="padding-left: 1.2rem; color: #35473e; line-height: 1.6;">
        ${(en ? (ch.applications_en || ch.applications_zh) : ch.applications_zh || []).map(item => `
          <li>${escapeHtml(item)}</li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderFiveShuMatrixTable() {
  const rows = [
    { ch: "LU (手太陰肺經)", well: "LU11 少商", spring: "LU10 魚際", stream: "LU9 太淵", river: "LU8 經渠", sea: "LU5 尺澤" },
    { ch: "LI (手陽明大腸經)", well: "LI1 商陽", spring: "LI2 二間", stream: "LI3 三間", river: "LI5 陽溪", sea: "LI11 曲池" },
    { ch: "ST (足陽明胃經)", well: "ST45 厲兌", spring: "ST44 內庭", stream: "ST43 陷谷", river: "ST41 解溪", sea: "ST36 足三里" },
    { ch: "SP (足太陰脾經)", well: "SP1 隱白", spring: "SP2 大都", stream: "SP3 太白", river: "SP5 商丘", sea: "SP9 陰陵泉" },
    { ch: "HT (手少陰心經)", well: "HT9 少衝", spring: "HT8 少府", stream: "HT7 神門", river: "HT4 靈道", sea: "HT3 少海" },
    { ch: "SI (手太陽小腸經)", well: "SI1 少澤", spring: "SI2 前谷", stream: "SI3 後谿", river: "SI5 陽谷", sea: "SI8 小海" },
    { ch: "BL (足太陽膀胱經)", well: "BL67 至陰", spring: "BL66 足通谷", stream: "BL65 束骨", river: "BL60 崑崙", sea: "BL40 委中" },
    { ch: "KI (足少陰腎經)", well: "KI1 湧泉", spring: "KI2 然谷", stream: "KI3 太溪", river: "KI7 復溜", sea: "KI10 陰谷" },
    { ch: "PC (手厥陰心包經)", well: "PC9 中衝", spring: "PC8 勞宮", stream: "PC7 大陵", river: "PC5 間使", sea: "PC3 曲澤" },
    { ch: "TE (手少陽三焦經)", well: "TE1 關衝", spring: "TE2 液門", stream: "TE3 中渚", river: "TE6 支溝", sea: "TE10 天井" },
    { ch: "GB (足少陽膽經)", well: "GB44 足竅陰", spring: "GB43 俠溪", stream: "GB41 足臨泣", river: "GB38 陽輔", sea: "GB34 陽陵泉" },
    { ch: "LR (足厥陰肝經)", well: "LR1 大敦", spring: "LR2 行間", stream: "LR3 太衝", river: "LR4 中封", river2: "", sea: "LR8 曲泉" }
  ];

  const formatCell = (txt) => {
    const m = txt.match(/^([A-Z0-9]+)\s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        1. 五輸穴中英總表 (Five Shu Points: Jing-Well, Ying-Spring, Shu-Stream, Jing-River, He-Sea)
      </h3>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>經絡 Channel</th>
            <th>井穴 Jing-Well (金/木)</th>
            <th>滎穴 Ying-Spring (水/火)</th>
            <th>輸穴 Shu-Stream (木/土)</th>
            <th>經穴 Jing-River (火/金)</th>
            <th>合穴 He-Sea (土/水)</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.ch}</td>
              <td>${formatCell(r.well)}</td>
              <td>${formatCell(r.spring)}</td>
              <td>${formatCell(r.stream)}</td>
              <td>${formatCell(r.river)}</td>
              <td>${formatCell(r.sea)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderYuanLuoXiMuShuMatrixTable() {
  const rows = [
    { ch: "LU 肺經", yuan: "LU9 太淵", luo: "LU7 列缺", xi: "LU6 孔最", mu: "LU1 中府", shu: "BL13 肺俞" },
    { ch: "LI 大腸經", yuan: "LI4 合谷", luo: "LI6 偏歷", xi: "LI7 溫溜", mu: "ST25 天樞", shu: "BL25 大腸俞" },
    { ch: "ST 胃經", yuan: "ST42 衝陽", luo: "ST40 豐隆", xi: "ST34 梁丘", mu: "CV12 中脘", shu: "BL21 胃俞" },
    { ch: "SP 脾經", yuan: "SP3 太白", luo: "SP4 公孫", xi: "SP8 地機", mu: "LR13 章門", shu: "BL20 脾俞" },
    { ch: "HT 心經", yuan: "HT7 神門", luo: "HT5 通里", xi: "HT6 陰郄", mu: "CV14 巨闕", shu: "BL15 心俞" },
    { ch: "SI 小腸經", yuan: "SI4 腕骨", luo: "SI7 支正", xi: "SI6 養老", mu: "CV4 關元", shu: "BL27 小腸俞" },
    { ch: "BL 膀胱經", yuan: "BL64 京骨", luo: "BL58 飛揚", xi: "BL63 金門", mu: "CV3 中極", shu: "BL28 膀胱俞" },
    { ch: "KI 腎經", yuan: "KI3 太溪", luo: "KI4 大鐘", xi: "KI5 水泉", mu: "GB25 京門", shu: "BL23 腎俞" },
    { ch: "PC 心包經", yuan: "PC7 大陵", luo: "PC6 內關", xi: "PC4 郄門", mu: "CV17 膻中", shu: "BL14 厥陰俞" },
    { ch: "TE 三焦經", yuan: "TE4 陽池", luo: "TE5 外關", xi: "TE7 會宗", mu: "CV5 石門", shu: "BL22 三焦俞" },
    { ch: "GB 膽經", yuan: "GB40 丘墟", luo: "GB37 光明", xi: "GB36 外丘", mu: "GB24 日月", shu: "BL19 膽俞" },
    { ch: "LR 肝經", yuan: "LR3 太衝", luo: "LR5 蠡溝", xi: "LR6 中都", mu: "LR14 期門", shu: "BL18 肝俞" }
  ];

  const formatCell = (txt) => {
    const m = txt.match(/^([A-Z0-9]+)\s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        2. 原絡郄俞募穴總表 (Yuan Source, Luo Connection, Xi Cleft, Front Mu, & Back Shu Points)
      </h3>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>經絡 Channel</th>
            <th>原穴 Yuan-Source</th>
            <th>絡穴 Luo-Connecting</th>
            <th>郄穴 Xi-Cleft</th>
            <th>募穴 Front-Mu</th>
            <th>背俞穴 Back-Shu</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.ch}</td>
              <td>${formatCell(r.yuan)}</td>
              <td>${formatCell(r.luo)}</td>
              <td>${formatCell(r.xi)}</td>
              <td>${formatCell(r.mu)}</td>
              <td>${formatCell(r.shu)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderConfluentPointsMatrixTable() {
  const rows = [
    { vessel: "任脈 (Conception Vessel)", master: "LU7 列缺", coupled: "KI6 照海", area: "胸、肺、膈、咽喉 (Chest, Lungs, Throat)" },
    { vessel: "陰蹻脈 (Yin Heel Vessel)", master: "KI6 照海", coupled: "LU7 列缺", area: "喉嚨、胸膈、腹部 (Throat, Diaphragm, Abdomen)" },
    { vessel: "督脈 (Governing Vessel)", master: "SI3 後谿", coupled: "BL62 申脈", area: "目內眥、頸項、耳、肩、脊柱 (Nape, Neck, Spine)" },
    { vessel: "陽蹻脈 (Yang Heel Vessel)", master: "BL62 申脈", coupled: "SI3 後谿", area: "目內眥、項後、腰背、軀體外側 (Head, Back, Eyes)" },
    { vessel: "沖脈 (Penetrating Vessel)", master: "SP4 公孫", coupled: "PC6 內關", area: "胃、心、胸腹 (Stomach, Heart, Abdomen)" },
    { vessel: "陰維脈 (Yin Linking Vessel)", master: "PC6 內關", coupled: "SP4 公孫", area: "心痛、胸悶、胃痛、情志 (Heart, Stomach, Shen)" },
    { vessel: "帶脈 (Belt Vessel)", master: "GB41 足臨泣", coupled: "TE5 外關", area: "目外眥、耳後、頸、肩、少腹 (Eyes, Ears, Hips)" },
    { vessel: "陽維脈 (Yang Linking Vessel)", master: "TE5 外關", coupled: "GB41 足臨泣", area: "耳後、肩胛、軀體側外、寒熱往來 (Lateral Body, Chills/Fever)" }
  ];

  const formatCell = (txt) => {
    const m = txt.match(/^([A-Z0-9]+)\s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        3. 八脈交會穴與奇經對應配穴總表 (Master & Coupled Points for Extraordinary Channels)
      </h3>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>奇經八脈 Extraordinary Vessel</th>
            <th>主穴 Master Point</th>
            <th>配穴 Coupled Point</th>
            <th>主治交會區域 Target Anatomical Area</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.vessel}</td>
              <td>${formatCell(r.master)}</td>
              <td>${formatCell(r.coupled)}</td>
              <td>${r.area}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderLowerHeMotherChildMatrixTable() {
  const rows = [
    { organ: "大腸 Large Intestine", lowerHe: "ST37 上巨虛", mother: "LI11 曲池 (土)", child: "LI2 二間 (水)", entry: "LI4 合谷", exit: "LI7 溫溜" },
    { organ: "小腸 Small Intestine", lowerHe: "ST39 下巨虛", mother: "SI3 後谿 (木)", child: "SI8 小海 (土)", entry: "SI1 少澤", exit: "SI7 支正" },
    { organ: "三焦 Triple Burner", lowerHe: "BL39 委陽", mother: "TE4 陽池 (土)", child: "TE2 液門 (水)", entry: "TE1 關衝", exit: "TE5 外關" },
    { organ: "胃 Stomach", lowerHe: "ST36 足三里", mother: "ST41 解溪 (火)", child: "ST45 厲兌 (金)", entry: "ST1 承泣", exit: "ST42 衝陽" },
    { organ: "膽 Gallbladder", lowerHe: "GB34 陽陵泉", mother: "GB43 俠溪 (水)", child: "GB38 陽輔 (火)", entry: "GB1 瞳子髎", exit: "GB41 足臨泣" },
    { organ: "膀胱 Bladder", lowerHe: "BL40 委中", mother: "BL67 至陰 (金)", child: "BL65 束骨 (木)", entry: "BL1 睛明", exit: "BL58 飛揚" }
  ];

  const formatCell = (txt) => {
    const m = txt.match(/^([A-Z0-9]+)\s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        3. 下合穴、母子補瀉與出入穴總表 (Lower He-Sea, Mother-Child Tonification/Sedation, Entry/Exit Points)
      </h3>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>六腑 Organ</th>
            <th>下合穴 Lower He-Sea</th>
            <th>母穴 (補) Mother Point</th>
            <th>子穴 (瀉) Child Point</th>
            <th>出穴 Entry Point</th>
            <th>入穴 Exit Point</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.organ}</td>
              <td>${formatCell(r.lowerHe)}</td>
              <td>${formatCell(r.mother)}</td>
              <td>${formatCell(r.child)}</td>
              <td>${formatCell(r.entry)}</td>
              <td>${formatCell(r.exit)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderGroupLuoMatrixTable() {
  const rows = [
    { group: "足三陰經交會 (Three Yin of Foot)", point: "SP6 三陰交", area: "脾、肝、腎三經交會，主治生殖、婦科、脾胃與水腫" },
    { group: "手三陰經交會 (Three Yin of Hand)", point: "PC6 內關", area: "心包、心、肺交會，主治心胸、胃痛與情志病" },
    { group: "足三陽經交會 (Three Yang of Foot)", point: "GB39 懸鐘/絕骨", area: "膽、胃、膀胱交會，主治髓海、頸項與下肢麻痺" },
    { group: "手三陽經交會 (Three Yang of Hand)", point: "TE8 三陽絡", area: "三焦、大腸、小腸交會，主治耳聾、臂痛與胸脇痛" }
  ];

  const formatCell = (txt) => {
    const m = txt.match(/^([A-Z0-9]+)\s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        5. 組絡穴與三陰三陽交會穴總表 (Group Luo & Three Yin/Yang Meeting Points)
      </h3>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>交會組別 Group Name</th>
            <th>代表組絡穴 Group Luo Point</th>
            <th>臨床主治範圍 Clinical Indications</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.group}</td>
              <td>${formatCell(r.point)}</td>
              <td>${r.area}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderHuiAndCommandMatrixTable() {
  const huiRows = [
    { type: "臟會 (Zang/Solid Organs)", point: "LR13 章門", note: "脾之募穴，主治五臟病變與腹脹" },
    { type: "腑會 (Fu/Hollow Organs)", point: "CV12 中脘", note: "胃之募穴，主治六腑病變與消化疾病" },
    { type: "氣會 (Qi/Energy)", point: "CV17 膻中", note: "胸中氣海，主治氣病、喘咳與胸痛" },
    { type: "血會 (Blood)", point: "BL17 膈俞", note: "血之會穴，主治血瘀、血虛與出血症" },
    { type: "筋會 (Tendon/Muscles)", point: "GB34 陽陵泉", note: "膽經合穴，主治筋急、抽搐與關節拘攣" },
    { type: "脈會 (Vessel/Pulse)", point: "LU9 太淵", note: "肺經原穴，主治脈痺、無脈症與血管疾病" },
    { type: "骨會 (Bone)", point: "BL11 大杼", note: "膀胱經穴，主治骨痛、頸項強痛與脊柱病" },
    { type: "髓會 (Marrow)", point: "GB39 懸鐘", note: "膽經穴，主治髓空、中風半身不遂與頭暈" }
  ];

  const commandRows = [
    { song: "肚腹三里留", point: "ST36 足三里", area: "腹部、腸胃消化系統疾病" },
    { song: "腰背委中求", point: "BL40 委中", area: "腰背部痛、坐骨神經痛、膝關節痛" },
    { song: "頭項尋列缺", point: "LU7 列缺", area: "頭痛、項強、感冒、咽喉病症" },
    { song: "面口合谷收", point: "LI4 合谷", area: "顏面部病症、牙痛、口眼喎斜" },
    { song: "胸脇內關謀", point: "PC6 內關", area: "心胸痛、嘔吐、胸悶、情志病" },
    { song: "急救水溝求", point: "GV26 水溝/人中", area: "昏迷、中風、休克急救醒腦" }
  ];

  const formatCell = (txt) => {
    const m = txt.match(/^([A-Z0-9]+)\s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        6. 八會穴與六總穴總表 (Eight Hui-Influential Points & Six Command Points)
      </h3>

      <h4 style="color: #2b4c3b; margin: 0.8rem 0 0.3rem; font-size: 1rem;">【八會穴 Eight Hui-Influential Points】</h4>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>八會類別 Category</th>
            <th>代表穴位 Point</th>
            <th>臨床特徵與主治 Note</th>
          </tr>
        </thead>
        <tbody>
          ${huiRows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.type}</td>
              <td>${formatCell(r.point)}</td>
              <td>${r.note}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h4 style="color: #2b4c3b; margin: 1.2rem 0 0.3rem; font-size: 1rem;">【六總穴 Six Command Points】</h4>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>歌訣即口訣 Rhyme</th>
            <th>代表穴位 Command Point</th>
            <th>主治區域範圍 Target Area</th>
          </tr>
        </thead>
        <tbody>
          ${commandRows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.song}</td>
              <td>${formatCell(r.point)}</td>
              <td>${r.area}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderFourSeaAndGhostPointsMatrixTable() {
  const seaRows = [
    { sea: "髓海 (Sea of Marrow)", master: "GV20 百會, GV16 風府", note: "充髓養腦，主治頭暈、目眩、耳鳴、足軟" },
    { sea: "氣海 (Sea of Qi)", master: "CV17 膻中, GV15 啞門, ST9 人迎", note: "調節全身氣機，主治胸悶、喘咳、少氣懶言" },
    { sea: "水穀之海 (Sea of Nourishment)", master: "ST30 氣衝, ST36 足三里", note: "充養脾胃受納，主治腹脹、腸鳴、消化不良" },
    { sea: "血海/十二經之海 (Sea of Blood)", master: "BL11 大杼, ST37 上巨虛, ST39 下巨虛", note: "調節全身氣血行止，主治血病、月經不調" }
  ];

  const ghostRows = [
    { rank: "鬼宮 (1st Ghost)", point: "GV26 水溝/人中", note: "人中溝上1/3與中1/3交界處" },
    { rank: "鬼信 (2nd Ghost)", point: "LU11 少商", note: "手大拇指末節顈側，距指甲角0.1寸" },
    { rank: "鬼壘 (3rd Ghost)", point: "SP1 隱白", note: "足大趾末節內側，距指甲角0.1寸" },
    { rank: "鬼心 (4th Ghost)", point: "PC7 大陵", note: "腕掌側遠端橫紋中，掌長肌腱與橈側腕屈肌腱之間" },
    { rank: "鬼路 (5th Ghost)", point: "BL62 申脈", note: "外踝直下，外踝下緣與跟骨滑車突之間凹陷處" },
    { rank: "鬼枕 (6th Ghost)", point: "GV16 風府", note: "後髮際正中直上1寸，枕外隆凸直下凹陷中" },
    { rank: "鬼牀 (7th Ghost)", point: "ST6 頰車", note: "咬肌隆起處，下頜角前上方一橫指" },
    { rank: "鬼市 (8th Ghost)", point: "CV24 承漿", note: "頦唇溝正中凹陷處" },
    { rank: "鬼窟 (9th Ghost)", point: "PC8 勞宮", note: "掌心第2、3掌骨之間，握拳中指尖下" },
    { rank: "鬼堂 (10th Ghost)", point: "GV23 上星", note: "前髮際正中直上1寸" },
    { rank: "鬼藏 (11th Ghost)", point: "CV1 會陰", note: "會陰部正中" },
    { rank: "鬼腿 (12th Ghost)", point: "LI11 曲池", note: "肘橫紋外側端，屈肘時尺澤與肱骨外上髁連線中點" },
    { rank: "鬼封 (13th Ghost)", point: "EX-HN12 舌下間/海泉", note: "舌下繫帶中點" }
  ];

  const formatCell = (txt) => {
    const m = txt.match(/^([A-Z0-9\-]+)\s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        7. 四海穴與孫真人十三鬼穴總表 (Four Seas & Sun Simiao 13 Ghost Points)
      </h3>

      <h4 style="color: #2b4c3b; margin: 0.8rem 0 0.3rem; font-size: 1rem;">【四海穴 Four Seas】</h4>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>四海名稱 Sea Name</th>
            <th>代表穴位 Points</th>
            <th>生理功能與主治 Function & Indications</th>
          </tr>
        </thead>
        <tbody>
          ${seaRows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.sea}</td>
              <td>${r.master.split(',').map(formatCell).join(', ')}</td>
              <td>${r.note}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h4 style="color: #2b4c3b; margin: 1.2rem 0 0.3rem; font-size: 1rem;">【孫真人十三鬼穴 13 Ghost Points for Mental/Psychiatric Disorders】</h4>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>鬼穴名稱 Ghost Point</th>
            <th>對應穴位 Standard Point</th>
            <th>取穴位置與說明 Location</th>
          </tr>
        </thead>
        <tbody>
          ${ghostRows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.rank}</td>
              <td>${formatCell(r.point)}</td>
              <td>${r.note}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
