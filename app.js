
function renderRichTextFormatted(text) {
  if (!text) return '';
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="rich-bold">$1</strong>');
  html = html.replace(/^(⏰\s*<strong class="rich-bold">[^<]+<\/strong>[^\n]*)$/gm, '<div class="rich-card card-time">$1</div>');
  html = html.replace(/^(💡\s*<strong class="rich-bold">[^<]+<\/strong>[^\n]*)$/gm, '<div class="rich-card card-mind">$1</div>');
  html = html.replace(/^(🎯\s*<strong class="rich-bold">[^<]+<\/strong>[^\n]*)$/gm, '<div class="rich-card card-target">$1</div>');
  html = html.replace(/^(🧘\s*<strong class="rich-bold">[^<]+<\/strong>[^\n]*)$/gm, '<div class="rich-card card-qigong">$1</div>');
  html = html.replace(/•\s*(.*?)(?=\n|(?:\r\n)|$)/g, '<li class="rich-bullet-item">$1</li>');
  html = html.replace(/(<li class="rich-bullet-item">.*?<\/li>)+/gs, '<ul class="rich-bullet-list">$&</ul>');
  html = html.replace(/\n{2,}/g, '<div class="rich-paragraph-gap"></div>');
  return `<div class="rich-formatted-content">${html}</div>`;
}

function categoryBadgesHtml(category) {
  if (!category) return '';
  const isEn = typeof contentMode !== 'undefined' && contentMode === 'english';
  const tags = category.split(/[·,\s]+/);
  return tags.map(t => {
    const trimmed = t.trim();
    if (!trimmed) return '';
    let badgeClass = 'badge-default';
    let label = trimmed;

    if (trimmed.includes('原穴')) { badgeClass = 'badge-yuan'; label = isEn ? 'Yuan-Source' : trimmed; }
    else if (trimmed.includes('合穴')) { badgeClass = 'badge-he'; label = isEn ? 'He-Sea' : trimmed; }
    else if (trimmed.includes('八會')) { badgeClass = 'badge-hui'; label = isEn ? '8 Hui-Influential' : trimmed; }
    else if (trimmed.includes('禁針')) { badgeClass = 'badge-no-needle'; label = isEn ? '⛔ No Needling' : trimmed; }
    else if (trimmed.includes('禁灸')) { badgeClass = 'badge-no-moxa'; label = isEn ? '⚠️ No Moxa' : trimmed; }
    else if (trimmed.includes('急救') || trimmed.includes('溺水') || trimmed.includes('休克')) { badgeClass = 'badge-emergency'; label = isEn ? '🚨 Emergency' : trimmed; }
    else if (trimmed.includes('四關')) { badgeClass = 'badge-four-gates'; label = isEn ? 'Four Gates' : trimmed; }
    else if (trimmed.includes('絡穴')) { badgeClass = 'badge-luo'; label = isEn ? 'Luo-Connecting' : trimmed; }
    else if (trimmed.includes('郄穴')) { badgeClass = 'badge-xi'; label = isEn ? 'Xi-Cleft' : trimmed; }
    else if (trimmed.includes('井穴')) { badgeClass = 'badge-jing'; label = isEn ? 'Jing-Well' : trimmed; }
    else if (trimmed.includes('滎穴')) { badgeClass = 'badge-ying'; label = isEn ? 'Ying-Spring' : trimmed; }
    else if (trimmed.includes('輸穴')) { badgeClass = 'badge-shu'; label = isEn ? 'Shu-Stream' : trimmed; }
    else if (trimmed.includes('經穴')) { badgeClass = 'badge-jing-river'; label = isEn ? 'Jing-River' : trimmed; }
    else if (trimmed.includes('募穴')) { badgeClass = 'badge-mu'; label = isEn ? 'Front-Mu' : trimmed; }

    return `<span class="point-badge ${badgeClass}">${escapeHtml(label)}</span>`;
  }).join('');
}

const STORAGE_KEY = "acuting-acupoint-v3";
const CASE_STORAGE_KEY = "acuting-clinical-cases-v1";
const CONTENT_MODE_KEY = "acuting-content-mode-v1";
// FIX A (Dry Clinic #6) — UI-convenience-only draft autosave for the case/
// SOAP dialogs. Deliberately separate keys from CASE_STORAGE_KEY: drafts
// are never read/written by persistClinicalCases/loadClinicalCases, never
// touched by export/import, and never enter the clinical store. Cleared on
// successful save; otherwise survive a reload so a crash/F5 mid-form
// doesn't erase 30-60 filled fields.
const CASE_DRAFT_KEY = "acuting-draft-case-v1";
const SOAP_DRAFT_KEY = "acuting-draft-soap-v1";
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
// 診務回顧面板的開合。宣告在這裡而不是 renderPracticeAuditPanel 旁邊:
// renderClinicalCases 會讀它,而 render() 在檔案上方就執行 —— 放在下面會是 TDZ。
let practiceAuditOpen = false;

// Metadata-driven numeric outcome metric config (2026-08-09) — prototype
// covering exactly the two metrics already proven (metric.pain_score,
// metric.sleep_hours). Declared here, near OUTCOME_VERDICTS, rather than
// beside the functions that use it (getOutcomeMetricDef etc., further down
// near normalizeSoapNote): the bottom of this file calls render() at
// top-level page-load time (line ~1036, before any case dialog even opens),
// and render() can synchronously reach renderSoapNoteCard ->
// formatNumericOutcomeMetrics on first load if a case with SOAP notes is
// already selected. A `const` has no hoisting the way a function
// declaration does — declaring it after that render() call throws
// "Cannot access before initialization" the moment a real case loads.
//
// Deliberately NOT added to data/clinical_cases/outcome_metrics.json.
// That file is the canonical clinical vocabulary — id/name/label/category/
// unit/direction_good, meaning worth having independent of any UI. min/max/
// integer-vs-decimal are form-rendering constraints with no clinical
// meaning: they answer "what does an HTML input allow," not "what does
// this measurement mean." Mixing them into the vocabulary would (a) let a
// UI tweak edit a file that is supposed to be clinical content, and (b)
// make every future non-numeric metric (bbt_pattern is text, adverse_
// reaction is text) carry irrelevant numeric-only keys. Smallest clean
// design: a short array literal, label/unit still looked up from
// outcome_metrics.json (never duplicated) so there is exactly one place
// either can drift. getOutcomeMetricDef/renderNumericOutcomeMetricInputs/
// computeNumericOutcomeMetrics/formatNumericOutcomeMetrics (the functions
// that consume this) live further down, near normalizeSoapNote.
const NUMERIC_OUTCOME_METRIC_CONFIG = [
  { metricId: "metric.pain_score", min: 0, max: 10, integer: true },
  { metricId: "metric.sleep_hours", min: 0, max: null, integer: false },
  // "One fact, one home" reconciliation (2026-08-09,
  // docs/SOAP_FOLLOWUP_TRACKING_AUDIT.md's effect_duration_days duplicate-
  // capture problem): note.effectDurationDays (SOAP audit batch, a direct
  // column added before the structured-metric layer existed) and
  // metric.effect_duration_days are the same clinical fact — "how many
  // days did the last treatment's effect last," CLINICAL_GRAPH_TRACK.md
  // CG6's own words. Integer semantics kept unchanged from the existing
  // direct field (schema.sql's effect_duration_days is INTEGER, the old
  // form input was step="1") — nothing in outcome_metrics.json's plain
  // "days" unit argues for allowing half-days, and this batch isn't the
  // place to change that. legacyField marks this as the one metric with a
  // pre-existing alternate representation; resolveNumericMetricValue below
  // is the only place that property is read.
  { metricId: "metric.effect_duration_days", min: 0, max: null, integer: true, legacyField: "effectDurationDays" },
  // Batch 2 (2026-08, docs/OUTCOME_METRICS_SEMANTIC_AUDIT_V2.md §8, approved
  // as-is). All four share outcome_metrics.json's unit:"0-10" — that string
  // is a vocabulary fact and gives the RANGE (0 to 10), but it does not by
  // itself say whether entries within that range must be whole numbers; the
  // audit doc was corrected to stop implying it did. Whole-number entry for
  // every subjective 0-10 scale is an explicit AcuTing UI convention
  // (approved this batch, applies to pain_score above too), not something
  // "0-10" encodes on its own.
  { metricId: "metric.stress_level", min: 0, max: 10, integer: true },
  { metricId: "metric.mood", min: 0, max: 10, integer: true },
  { metricId: "metric.energy_level", min: 0, max: 10, integer: true },
  { metricId: "metric.sleep_quality", min: 0, max: 10, integer: true },
  // Batch 3 (2026-08, docs/OUTCOME_METRICS_SEMANTIC_AUDIT_V2.md §8 deferred
  // list, approved this batch). Deliberately mixed shapes, not four more
  // 0-10 clones — proves the generic renderer across bounded scale (A),
  // integer duration (D), and integer count (C) in one pass, same {min,
  // max, integer} shape with zero new properties either way.
  //   bloating: same bounded 0-10 whole-number AcuTing convention as
  //     stress_level/mood/energy_level/sleep_quality above.
  //   sleep_onset_minutes: unbounded (max: null) nonnegative whole-minute
  //     duration — unit:"minutes" is the vocabulary fact (a duration);
  //     whole-minute entry is the AcuTing convention, not something
  //     "minutes" proves by itself. Same shape as effect_duration_days.
  //   night_wakings: unbounded nonnegative integer count — unit:
  //     "count_per_night" is a tally, decimals are meaningless. 0 is a
  //     real value (slept through), not "not measured."
  //   bowel_frequency: unbounded nonnegative integer count — unit:
  //     "count_per_week". direction_good is "individualized" in
  //     outcome_metrics.json; this config makes no higher/lower-is-better
  //     claim, and formatNumericOutcomeMetrics below must not either.
  { metricId: "metric.bloating", min: 0, max: 10, integer: true },
  // placeholderHint (2026-08-25, dry run finding): 病人講「大概一小時」是
  // 常態,填分鐘數的欄位單獨看很容易讓人愣一下要不要自己換算。這裡直接把
  // 換算寫進佔位字,不改欄位本身(還是分鐘、還是整數)——不引入新的輸入
  // 格式或解析邏輯,純粹是提示文字,風險最低的修法。
  { metricId: "metric.sleep_onset_minutes", min: 0, max: null, integer: true, placeholderHint: "分鐘數,例如1小時填60、半小時填30" },
  { metricId: "metric.night_wakings", min: 0, max: null, integer: true },
  { metricId: "metric.bowel_frequency", min: 0, max: null, integer: true },
  // Academic-readiness batch (2026-08, pre-9/01 freeze): PGIC — the
  // IMMPACT-recommended single-item global outcome. 1-7 whole-number
  // anchor scale where the ANCHORS carry the meaning (1 very much
  // improved … 4 no change … 7 very much worse) — min is 1, not 0,
  // because 0 has no anchor on this instrument; entering it is a data
  // error, not a lower bound clamp. Registry record metric.pgic
  // introduces category "global" (IMMPACT's own domain name for this
  // instrument class).
  { metricId: "metric.pgic", min: 1, max: 7, integer: true },
];

// SOAP 開新診時帶入上一診的白名單(2026-08-25,Ting 要求)。跟上面
// NUMERIC_OUTCOME_METRIC_CONFIG 同一個 TDZ 理由,不能宣告在 openSoapEditor
// 附近——render() 在檔案最上面同步跑,若使用者一開頁就有已選病例,呼叫鏈
// 可能在這個檔案後段的 const 初始化之前就先摸到它。
//
// 新增欄位時先問:這是「醫師打算怎麼治」還是「這次觀察/量到什麼」?前者
// 直接列入 SOAP_CARRY_FORWARD_FIELDS。後者原則上不列入(見下面 SOAP_
// CARRY_FORWARD_TEXT_MARKED_FIELDS 的例外與理由)。
// scripts/test-avs-checkout.js 沒有涵蓋這支(非 AVS 引擎),下面清單本身
// 就是唯一防線——刻意寫成外顯陣列方便下次修改時一眼看穿範圍。
const SOAP_CARRY_FORWARD_FIELDS = [
  // 2026-08-25 second round(Ting 明確要求,見 soapCarryForwardFields 上方
  // 說明):S/O/A/P 這四格本來是「這次觀察到什麼」的欄位,原則上不該帶入
  // 上次內容(牴觸 D4)。但 Ting 用 AskUserQuestion 確認後選的是「自動帶入,
  // 但清楚標示沿用上次、請確認」——不是取消這個顧慮,是換一種方式處理它:
  // 帶入時強制加一段看得到的標記文字(SOAP_CARRY_FORWARD_MARKER),病歷上
  // 永遠留下「這段是沿用的」的痕跡,不會被誤讀成當場重新問診/評估的結果。
  "subjective", "objective", "assessment", "plan",
  "tcmPattern", "tcmPatternSelections", "tcmPatternLinks", "pathomechanism", "treatmentPrinciple",
  "pointsUsed", "acupointLinks", "retentionMinutes", "technique",
  "formulaHerbs", "formulaLinks", "herbLinks",
  "westernMeds", "medicationLinks",
  "modalities", "modalitiesPerformed",
  "westernConditionLinks", "easternDiseaseLinks", "safetyFlagLinks",
  "followUp"
];

// 上面四格(S/O/A/P)帶入時要加的可見標記——絕不安靜複製。病人代碼/病歷
// 內容本身無 PHI 疑慮(這段只在瀏覽器記憶體/病例物件裡,不送出、不記錄),
// 純粹是給「簽這張病歷的人」看的痕跡。刻意雙語、刻意用中括號包住,跟正常
// 診療文字有視覺區隔,選取刪除也方便。
const SOAP_CARRY_FORWARD_MARKER = "〔沿用上次內容,請確認並修改 Carried forward from last visit — please review and edit〕\n";
const SOAP_CARRY_FORWARD_TEXT_MARKED_FIELDS = new Set(["subjective", "objective", "assessment", "plan"]);

// Outcome Tracking v1 direction-hint labels (2026-08, CG8). Declared here —
// not beside renderOutcomeTrackingPanel further down — for the same TDZ
// reason NUMERIC_OUTCOME_METRIC_CONFIG lives up here instead of near the
// functions that use it: render() runs synchronously at top-level page-load
// time and can reach renderOutcomeTrackingPanel on first load if a case is
// already selected, which is before this file's later `const` declarations
// would otherwise have initialized. direction_good is displayed verbatim as
// vocabulary metadata (what the record says), never turned into a computed
// verdict — no "higher/lower is better," no color. individualized/
// contextual get the exact same neutral treatment as increase/decrease,
// which is what specifically keeps bowel_frequency (individualized) from
// reading as "more is better."
const OUTCOME_DIRECTION_HINT_LABELS = {
  increase: "方向：遞增 direction: increase",
  decrease: "方向：遞減 direction: decrease",
  individualized: "方向：因人而異 direction: individualized",
  contextual: "方向：視情境 direction: contextual",
};

// outcome_metrics.json 的 interpretation_status 三態，畫在讀數字的地方。
// 沒有這一行，Outcome Tracking 只會顯示「-3」，看的人無從分辨那是「文獻上
// 有意義的變化」還是「一個沒有任何閾值可以對照的自評分數」——兩者長得一模一樣。
// 契約寫在資料裡卻不上畫面，等於沒寫。
const OUTCOME_INTERPRETATION_BADGES = {
  no_published_threshold: { text: "無公認閾值 · 看趨勢", cls: "interp-none" },
  source_pending: { text: "判讀來源待補", cls: "interp-pending" },
};

// Config-integrity self-check (2026-08, docs/OUTCOME_METRICS_SEMANTIC_AUDIT_V2.md
// §7 — "worthwhile before more metrics," recommended there, implemented
// here alongside this batch's new entries as suggested). Catches a
// typo'd/nonexistent metricId in the array above the moment the page loads,
// before it could ever reach a save — every entry here is a hand-typed
// string a developer could mistype, unlike an entry inside a saved note's
// outcomeMetrics[], which this check never looks at and never touches.
// Deliberately narrow: checks ONLY this config array, not any note's actual
// data. A metric recorded in the past and later removed from this config
// (deprecated, or simply not yet re-added) must keep loading and
// displaying exactly as it already does via resolveNumericMetricValue's
// existing blank/legacy handling — "not currently configured" is never
// "invalid," and this check must never suggest otherwise. console.error
// only, never alert() — a config typo is a developer-facing bug to catch in
// QA, not something a clinician using the app should ever see a popup
// about. Runs once, synchronously, immediately after the array above:
// index.html loads the six knowledge shards knowledge_{core,ref,rx,mm,dx,pat}.js
// (which merge into globalThis.ACUTING_KNOWLEDGE) before app.js, so getOutcomeMetricDef has
// real data to check against from the very first line of this file — no
// deferral to page-load events needed. A correctly-configured array (the
// only state this repo should ever ship) produces zero console output.
// Guarded on the vocabulary actually being loaded: scripts/validate-data.js
// evaluates this whole file in a bare `new Function()` sandbox with no
// index.html <script> tags, so globalThis.ACUTING_KNOWLEDGE is never set
// there and every metricId would otherwise resolve to null regardless of
// whether it's a real typo — that's an unloaded-vocabulary condition, not a
// typo, and this check must not conflate the two. Only run the per-entry
// scan once outcomeMetrics.records actually has rows to check against.
if ((globalThis.ACUTING_KNOWLEDGE?.outcomeMetrics?.records || []).length > 0) {
  NUMERIC_OUTCOME_METRIC_CONFIG.forEach((cfg) => {
    if (!getOutcomeMetricDef(cfg.metricId)) {
      console.error(`NUMERIC_OUTCOME_METRIC_CONFIG: "${cfg.metricId}" does not resolve to a record in data/clinical_cases/outcome_metrics.json — check for a typo.`);
    }
  });
}

// Data-load guard: the app is data-driven; if the generated data file did not
// load (OneDrive not synced, file missing, 404), fail LOUDLY instead of
// silently degrading to placeholder-only content.
(function dataLoadGuard() {
  const missing = [];
  if (!globalThis.ACUTING_APP_DATA) missing.push("data/generated/app_data.js");
  if (!globalThis.ACUTING_POINTS_361) missing.push("data/generated/points_361.js");
  // 知識分片（P1）：單片缺席時 ACUTING_KNOWLEDGE 仍存在，各渲染線的 `|| []`
  // 會把缺片吞成「沒有錯誤的空 grid」——這裡把靜默劣化變回大聲失敗。
  // __expected 清單由 build-data 寫進 core 片（單一出處，不會與這裡漂移）；
  // core 自己缺席時先只報 core——它是最上游，其他片的登記簿就在它身上。
  const kParts = globalThis.ACUTING_KNOWLEDGE_PARTS;
  if (!kParts || !Array.isArray(kParts.__expected)) {
    missing.push("data/generated/knowledge_core.js");
  } else {
    for (const name of kParts.__expected) {
      if (!kParts[name]) missing.push("data/generated/knowledge_" + name + ".js");
    }
  }
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
  // contraindications is read FIRST and is not optional: the 2026-08-02 needling
  // -depth pass wrote lines like 「趾端穴，僅可沿皮下淺刺 0.1 吋，不可深刺」into
  // this field, and because the adapter did not read it, 21 points showed no
  // depth warning on the card while the data sat in the file. Absolute 禁忌 and
  // relative 慎用 still share one string here — splitting them into two boxes is
  // a card change, but invisible safety text was the bug that mattered.
  const rawCautions = [
    ...(Array.isArray(record.contraindications) ? record.contraindications : (typeof record.contraindications === "string" ? record.contraindications.split("\n") : [])),
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
    // 2026-08-12:361 經穴有兩個英文安全欄,而這個 adapter 一個都沒讀,
    // 於是英文模式退回去印中文的 cautions。兩者差別是致命的:
    //   contraindications_en —— 357/361 是同一句衛生教條(「Standard hygienic
    //     practice; strictly control insertion depth…」),等於沒說。
    //   cautions_en —— 逐穴手寫:LU1「⚠️ Deep medial insertion contraindicated
    //     (pneumothorax risk)」、ST9「⚠️ Avoid carotid artery」、
    //     ST17「⚠️ NEEDLING & MOXIBUSTION STRICTLY PROHIBITED! Landmark only.」
    // 361 條逐穴警告存在資料裡,從來沒有一條到過畫面。逐穴的放前面。
    pointCautionsEn: record.cautions_en || [],
    cautionsEn: record.contraindications_en || [],
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

const validGb93Index = auricularGb93Index.filter(p => p.nameZh && !p.nameZh.includes("待校對") && p.nameZh !== p.code);
const defaultPoints = enrichPoints(mergeByCode(standardPoints361, embeddedExtraPoints, extraPoints72, auricularPoints, validGb93Index, scalpPoints, tungPointIndex));

let points = loadPoints();
let selectedCode = points[0]?.code || "";
let editingCode = null;
let clinicalCases = loadClinicalCases();
let selectedCaseId = clinicalCases[0]?.id || "";
// Meds & Supplements / Environmental exposures 的標籤 const —— 必須在初始
// render() 之前宣告:renderAgentExposuresPanel / renderEnvironmentalExposuresPanel
// 在第一次 render(第 ~1200 行)就可能執行,宣告留在面板函式旁是 TDZ,
// 首個病例帶 exposures 時開機即崩(AVS v3 驗證走查實測抓到,非新引入)。
const AGENT_EXPOSURE_TYPE_LABELS = { drug: "藥 Drug", supplement: "補 Supplement" };
const AGENT_EXPOSURE_STATUS_LABELS = { current: "使用中 Current", stopped: "已停用 Stopped", prn: "需要時 PRN", unknown: "不確定 Unknown" };
const ENV_EXPOSURE_CERTAINTY_LABELS = { suspected: "疑似 Suspected", patient_reported: "病人自述 Patient reported", confirmed: "已確認 Confirmed" };
const ENV_EXPOSURE_TIMING_LABELS = { ongoing: "持續中 Ongoing", historical: "過去 Historical", unknown: "不確定 Unknown" };
const ADVERSE_EVENT_INTERVENTION_LABELS = { acupuncture: "針刺 Acupuncture", cupping: "拔罐 Cupping", moxa: "艾灸 Moxa", herbs: "中藥 Herbs", formula: "方劑 Formula", other: "其他 Other" };
const ADVERSE_EVENT_SEVERITY_LABELS = { mild: "輕度 Mild", moderate: "中度 Moderate", severe: "重度 Severe" };
const ADVERSE_EVENT_RESOLUTION_LABELS = { resolved: "已緩解 Resolved", resolving: "緩解中 Resolving", ongoing: "持續中 Ongoing", unknown: "不確定 Unknown" };
const CONSENT_LABELS = { granted: "已同意 Granted", declined: "婉拒 Declined", pending: "待決 Pending" };
const AVS_CATEGORY_LABELS = {
  aftercare: "治療後注意",
  lifestyle: "作息生活",
  diet: "飲食",
  exercise: "運動",
  special: "特別注意",
  herb_caution: "服藥提醒"
};
// §5 的證據等級類別(scripts/validate-avs-library.js 的 EVIDENCE_TYPES)。
// 只用在「為什麼建議?」面板 —— 醫師端判斷輔助,不進病人文件。
const AVS_EVIDENCE_TYPE_LABELS = {
  clinical_safety: "臨床安全",
  regulatory_or_guideline: "法規/指引",
  evidence_informed: "實證支持",
  practice_standard: "臨床常規",
  traditional_tcm_lifestyle: "中醫養生慣例",
  clinic_preference: "診所慣例"
};
let selectedPatientCode = "";   // Patient Workspace W1 — read-only, list selection only
let editingCaseId = null;
let editingSoapId = null;
let isSyncingPointHash = false;

const searchInput = document.querySelector("#searchInput");
/* These three <select> boxes were removed from index.html when the sidebar
 * became accordions, but they were the only place the meridian/region/pattern
 * filter state lived, and a dozen sites still read and write .value on them.
 * Three of those sites had no null guard, so hydrateFilters() threw on load,
 * render() aborted before it drew anything, and the acupoint directory came up
 * empty with the counters stuck at their initial "--" — silently, because the
 * throw happened during init and never reached the console.
 *
 * A stand-in with the same shape keeps that state working without reinstating
 * the boxes or scattering guards across every call site. */
/* Channel & Point Charts state. Declared here rather than beside
 * renderChannelsWorkspace() further down: render() runs during init, well
 * before that line executes, so a `let` down there sits in the temporal dead
 * zone and reading it throws — which aborted render() and left the acupoint
 * directory blank. Same failure the branch hit with activeChannelsTab. */
let activeChannelCode = "LU";
let activeChartMode = ""; // "" for channel overview, or "fiveshu", "yuanluoxi", "confluent"

const detachedFilterState = () => ({ value: "" });
const meridianFilter = document.querySelector("#meridianFilter") || detachedFilterState();
const regionFilter = document.querySelector("#regionFilter") || detachedFilterState();
const patternFilter = document.querySelector("#patternFilter") || detachedFilterState();
const meridianCategoryList = document.querySelector("#meridianCategoryList");
const regionCategoryList = document.querySelector("#regionCategoryList");
const topicCategoryList = document.querySelector("#topicCategoryList");
const pointCategoryList = document.querySelector("#pointCategoryList");
const tungZoneCategoryList = document.querySelector("#tungZoneCategoryList");
const systemCategoryList = document.querySelector("#systemCategoryList");
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
const patientSearch = document.querySelector("#patientSearch");
const patientList = document.querySelector("#patientList");
const patientDetail = document.querySelector("#patientDetail");
const patientResultCount = document.querySelector("#patientResultCount");
const caseDialog = document.querySelector("#caseDialog");
const caseForm = document.querySelector("#caseForm");
const soapDialog = document.querySelector("#soapDialog");
const soapForm = document.querySelector("#soapForm");
// FIX A draft banner + FIX B submit-failure message line (both optional —
// hidden by default in the markup, wired up further down).
const caseDraftBanner = document.querySelector("#caseDraftBanner");
const soapDraftBanner = document.querySelector("#soapDraftBanner");
const caseSaveError = document.querySelector("#caseSaveError");
const soapSaveError = document.querySelector("#soapSaveError");
const agentExposureDialog = document.querySelector("#agentExposureDialog");
const agentExposureForm = document.querySelector("#agentExposureForm");
const environmentalExposureDialog = document.querySelector("#environmentalExposureDialog");
const environmentalExposureForm = document.querySelector("#environmentalExposureForm");
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

document.querySelectorAll(".system-tab-btn, [data-system-link='channels']").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const isChannelLink = btn.dataset.systemLink === "channels" || btn.getAttribute("href") === "#ws/channels";
    if (isChannelLink) {
      e.preventDefault();
      selectedSystem = "";
      selectedSystemBranch = "";
      document.querySelectorAll(".system-tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (!activeChartMode && !activeChannelCode) activeChartMode = "fiveshu";
      if (window.location.hash !== "#ws/channels") {
        window.location.hash = "#ws/channels";
      } else {
        render();
        document.querySelector("#channelsWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    const sys = btn.dataset.system || "";
    if (selectedSystem === sys && sys !== "") {
      selectedSystem = "";
      selectedSystemBranch = "";
      document.querySelectorAll(".system-tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelector('.system-tab-btn[data-system=""]')?.classList.add("active");
    } else {
      document.querySelectorAll(".system-tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSystem = sys;
      selectedSystemBranch = "";
    }
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
    // UI/UX P1#6 (2026-08-23): symptoms / pharm drugs / comparison tables each
    // have their own workspace but were unreachable from the home search —
    // typing 「頭痛」 or a drug name said "not found" while the card existed.
    symptoms: pick(knowledgeRecords("symptoms"), (s) => [s.name_zh, s.name_en, s.pinyin, s.id,
      txt(s.aliases_zh), txt(s.aliases_en)]),
    pharmDrugs: pick(knowledgeRecords("pharmDrugs"), (d) => [d.name_zh, d.name_en, d.id,
      txt(d.brand_names_en), d.mechanism_zh, d.mechanism_en]),
    comparisons: pick(knowledgeRecords("comparisons"), (c) => [c.title_zh, c.title_en, c.id,
      txt(c.compares)]),
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
  group(modeText("症狀 Symptoms", "Symptoms"), res.symptoms, (sy) =>
    grItem("symptom", modeText("症狀", "Symptom"), "", `${sy.name_zh || sy.name_en || sy.id}`,
      [sy.name_en, sy.pinyin].filter(Boolean).join(" · "), { id: sy.id, name: sy.name_zh || sy.name_en || "" }));
  group(modeText("西藥 Drugs", "Drugs"), res.pharmDrugs, (d) =>
    grItem("pharm", modeText("西藥", "Drug"), "", `${d.name_zh || d.name_en || d.id}`,
      [d.name_en, txt(d.brand_names_en)].filter(Boolean).join(" · "), { id: d.id }));
  group(modeText("辨證鑑別 Comparisons", "Comparisons"), res.comparisons, (cp) =>
    grItem("comparison", modeText("鑑別", "Compare"), "", `${cp.title_zh || cp.title_en || cp.id}`,
      cp.title_en || "", { id: cp.id }));

  if (!groups.length) {
    globalResultsEl.innerHTML = `<p class="gr-empty">${escapeHtml(modeText(
      `找不到「${rawQuery.trim()}」相關的穴位、方劑、中藥、病症、病例、症狀、西藥或鑑別表。`,
      `No acupoints, formulas, herbs, conditions, cases, symptoms, drugs, or comparison tables found for “${rawQuery.trim()}”.`
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

/* 「開這張知識卡」的單一入口。
 *
 * 抽出來是因為現在有第二個地方要用它:診務回顧的知識缺口清單。列出
 * 「桂枝湯 · 1 診 · draft」卻不能點,等於還是要自己去搜 —— 那條迴圈就沒閉。
 * 如果那邊各寫一份路由,兩份遲早會分岔(P1 transport 的 MED-4 就是這樣來的)。
 *
 * 回傳 true = 真的把卡開起來了;false = 這一類目前沒有可用的入口。
 * **呼叫端要照 false 決定「這個東西該不該長得像可以點」** —— 點了沒反應
 * 比一開始就不做成連結更糟。
 *
 * 判斷「畫不畫成可點的」要用 canOpenKnowledgeRecord,不要只看 API 在不在:
 * API 在、但那一筆查無此人,一樣是按了沒反應。
 */
function canOpenKnowledgeRecord(kind, id) {
  if (!id) return false;
  const api = globalThis.ACUTING_KNOWLEDGE_API;
  if (!api) return false;
  if (kind === "condition") return true;   // 走 section + scrollIntoView,沒有查表這一關
  return typeof api.hasRecord === "function" && api.hasRecord(kind, id);
}

function openKnowledgeRecord(kind, id) {
  if (!id) return false;
  const api = globalThis.ACUTING_KNOWLEDGE_API;
  if ((kind === "formula" || kind === "herb" || kind === "pharm") && api && api.openDetail) {
    api.openDetail(kind, id);
    return true;
  }
  if (kind === "pattern" && api && typeof api.openPattern === "function") {
    return api.openPattern(id);
  }
  if (kind === "condition") {
    goToSection("conditionGraph");
    requestAnimationFrame(() => {
      const card = document.querySelector(`[data-record-id="${(window.CSS && CSS.escape) ? CSS.escape(id) : id}"]`);
      if (card) { card.scrollIntoView({ behavior: "smooth", block: "center" }); card.classList.add("gr-flash"); setTimeout(() => card.classList.remove("gr-flash"), 1600); }
    });
    return true;
  }
  return false;
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
    if (openKnowledgeRecord(kind, btn.dataset.id)) return;
    // API 還沒載入時的退路:至少把人帶到對的區塊
    goToSection(kind === "formula" ? "ws/formula" : "ws/herb");
    return;
  }
  if (kind === "condition") {
    openKnowledgeRecord(kind, btn.dataset.id);
    return;
  }
  if (kind === "case") {
    if (caseSearch) { caseSearch.value = btn.dataset.code || ""; renderClinicalCases(); }
    goToSection("caseWorkspace");
    return;
  }
  if (kind === "pharm") {
    if (openKnowledgeRecord(kind, btn.dataset.id)) return;   // api.openDetail 已支援 pharm
    goToSection("pharmSection");
    return;
  }
  if (kind === "symptom") {
    // 症狀區有自己的過濾框:帶著名字過去,清單直接收斂到那一筆。
    goToSection("symptomSection");
    requestAnimationFrame(() => {
      const f = document.getElementById("symptomFilter");
      if (f) { f.value = btn.dataset.name || ""; f.dispatchEvent(new Event("input", { bubbles: true })); }
    });
    return;
  }
  if (kind === "comparison") {
    goToSection("comparisonSection");
    requestAnimationFrame(() => {
      const card = document.querySelector(`[data-record-id="${(window.CSS && CSS.escape) ? CSS.escape(btn.dataset.id) : btn.dataset.id}"]`);
      if (card) { card.scrollIntoView({ behavior: "smooth", block: "center" }); card.classList.add("gr-flash"); setTimeout(() => card.classList.remove("gr-flash"), 1600); }
    });
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
document.querySelector("#pastePrevisitBtn")?.addEventListener("click", pastePrevisitImport);
document.querySelector("#closeAgentExposureDialog").addEventListener("click", () => agentExposureDialog.close());
document.querySelector("#cancelAgentExposureBtn").addEventListener("click", () => agentExposureDialog.close());
document.querySelector("#addLifestyleFactorRow")?.addEventListener("click", () => {
  document.querySelector("#lifestyleFactorRows")?.insertAdjacentHTML("beforeend", lifestyleFactorRowHtml({}));
});
document.querySelector("#addPatternDifferentialRow")?.addEventListener("click", () => {
  document.querySelector("#patternDifferentialRows")?.insertAdjacentHTML("beforeend", patternDifferentialRowHtml({}));
});
document.querySelector("#addAdverseEventRow")?.addEventListener("click", () => {
  document.querySelector("#adverseEventRows")?.insertAdjacentHTML("beforeend", adverseEventRowHtml({}));
});
agentExposureForm.addEventListener("submit", saveAgentExposureFromForm);
// Phase D batch 3: environmental exposures dialog — same wiring shape as the
// agentExposureDialog block above. The exposureId <select> options are filled
// in openEnvironmentalExposureEditor (vocab loads later in the file), but
// this change listener can be attached now: the <select> node itself is
// static markup, only its innerHTML (the <option> list) is rebuilt per open.
document.querySelector("#closeEnvironmentalExposureDialog").addEventListener("click", () => environmentalExposureDialog.close());
document.querySelector("#cancelEnvironmentalExposureBtn").addEventListener("click", () => environmentalExposureDialog.close());
document.querySelector("#environmentalExposureSelect")?.addEventListener("change", (event) => {
  const wrap = document.querySelector("#environmentalExposureNameTextWrap");
  if (wrap) wrap.hidden = event.target.value !== REPEATABLE_ROW_OTHER_VALUE;
});
environmentalExposureForm.addEventListener("submit", saveEnvironmentalExposureFromForm);
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
// FIX A — throttled draft autosave (see wireDraftAutosave near openCaseEditor/
// openSoapEditor for the read/restore/clear side of this).
wireDraftAutosave(caseForm, CASE_DRAFT_KEY, () => editingCaseId || "new");
wireDraftAutosave(soapForm, SOAP_DRAFT_KEY, () => `${selectedCaseId || ""}:${editingSoapId || "new"}`);
// FIX B — native "invalid" event fires (capture phase; it does not bubble)
// on every :invalid field when the browser blocks an attempted submit. We
// only surface the FIRST one so the message/scroll doesn't thrash across
// several bad fields at once.
wireSubmitFailureFeedback(caseForm, caseSaveError);
wireSubmitFailureFeedback(soapForm, soapSaveError);
deleteCaseBtn.addEventListener("click", deleteCurrentCase);
deleteSoapBtn.addEventListener("click", deleteCurrentSoap);
caseSearch.addEventListener("input", () => { learnFromMode = false; renderClinicalCases(); });
patientSearch?.addEventListener("input", () => renderPatientsWorkspace());
document.querySelector("#learnFromToggle")?.addEventListener("click", (e) => {
  learnFromMode = !learnFromMode;
  e.currentTarget.setAttribute("aria-pressed", String(learnFromMode));
  e.currentTarget.classList.toggle("active", learnFromMode);
  renderClinicalCases();
});
document.querySelector("#practiceAuditBtn")?.addEventListener("click", (e) => {
  practiceAuditOpen = !practiceAuditOpen;
  e.currentTarget.classList.toggle("active", practiceAuditOpen);
  renderPracticeAuditPanel();
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
  if (!el || typeof el.addEventListener !== "function") return;  // detached filter state
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
    document.querySelectorAll(".system-tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelector('.system-tab-btn[data-system-link="channels"]')?.classList.add("active");
    if (!activeChartMode && !activeChannelCode) activeChartMode = "fiveshu";
    renderChannelsWorkspace();
    requestAnimationFrame(() => {
      document.querySelector("#channelsWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return;
  }
  if (!applyPointHash()) {
    render();
    return;
  }
  render();
  document.querySelector("#acupunctureWorkspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Pointer-aware runtime + persist guard (2026-08-11, INDEPENDENT_AUDIT items
// 1 & 3; pending Codex R9). clinicalStoreIntegrityError = the store threw on
// load (pointer=v2 with missing/corrupt staging): the app runs READ-ONLY on
// whatever loaded — persist refuses, because saving over a half-loaded world
// is how data disappears.
let clinicalStoreIntegrityError = null;

// Dry Clinic #7:localhost 與 127.0.0.1 是不同 origin = 兩個互不相通的
// 病人資料庫(2026-08-11 演練實測)。同機別名陷阱只有這一組;真機部署的
// canonical 網域寫在 docs/DEPLOY_CLOUDFLARE.md SOP,不在此硬編碼。
(function warnOriginAlias() {
  if (location.hostname !== "127.0.0.1") return;
  const el = document.createElement("div");
  el.setAttribute("role", "alert");
  el.style.cssText = "position:sticky;top:0;z-index:9999;background:#8a1f1f;color:#fff;padding:8px 14px;font-size:.9em;text-align:center";
  el.textContent = "⚠️ 你正以 127.0.0.1 開啟本系統 — 這裡的病人資料庫與 localhost 的互不相通。臨床紀錄請一律使用同一個網址(建議 localhost),否則資料會分裂在兩邊。";
  document.body.prepend(el);
})();

// Dry Clinic #8:日期一律用「本地日曆日」。toISOString() 是 UTC,晚上開診
// 時 visit/start date 會預設成明天(演練實測 08-11 晚顯示 08-12)。
function localDateISO(t) {
  const d = t === undefined ? new Date() : new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadClinicalCases() {
  // Phase C seam (js/clinical-store.js): storage I/O goes through the
  // repository layer; normalization stays HERE (contract layer, not storage).
  // The direct-localStorage fallback is not dead code — if the store script
  // ever fails to load, silently returning [] would let the next save WIPE
  // every real case. Reading directly is the safe failure mode.
  if (window.AcuTingClinicalStore) {
    try {
      return AcuTingClinicalStore.load().map(normalizeClinicalCase);
    } catch (e) {
      clinicalStoreIntegrityError = e.message;
      alert("臨床儲存層完整性錯誤,已進入唯讀保護:\n" + e.message);
      return [];
    }
  }
  // M1(C2b audit E5;review 升級裁定):pointer=v2 但 store 模組沒載入 ——
  // 這不是「沒有 v2 資料」,是「有 v2 資料但讀不到」。落到這裡若照舊把
  // v1 鍵當現況顯示,凍結的回滾錨會被誤報成現況(reload 後才發現不見),
  // 而且第一次存檔會把回滾錨靜默改寫掉。鎖唯讀,不讀 v1 內容當正常資料。
  if (localStorage.getItem("acuting-clinical-active") === "v2") {
    clinicalStoreIntegrityError = "系統已切換 v2 但 clinical-store 模組未載入 —— 唯讀保護啟動,禁止存檔;請確認用正式入口開啟,勿用 legacy 頁。";
    alert("臨床儲存層完整性錯誤,已進入唯讀保護:\n" + clinicalStoreIntegrityError);
    return [];
  }
  const saved = localStorage.getItem(CASE_STORAGE_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error(`v1 store present but not an array (${typeof parsed})`);
    return parsed.map(normalizeClinicalCase);
  } catch (e) {
    // R15(Dry Clinic #9):與 store 層同等 fail-loud —— 存在但壞 = 唯讀鎖,
    // 絕不靜默回 [](那會讓下一次存檔蓋掉還救得回來的原始位元組)。
    //
    // Codex P4 seam HIGH-1(2026-08-12):這裡過去把 `e.message` 原樣放進
    // alert,而 JSON.parse 的訊息會內嵌一段原始輸入 —— 壞掉的病歷內容因此
    // 直接顯示在螢幕上。訊息改為只有 key 名與長度(長度不是 PHI,但足以
    // 分辨空/截斷/格式壞)。這條 fallback 路徑在 store 模組載入失敗時才走,
    // 所以不能依賴 store 的 parseFailureDetail,同款規則就地實作一次。
    clinicalStoreIntegrityError = `v1 store corrupt: unparseable JSON, ${saved.length} char(s) present in localStorage["${CASE_STORAGE_KEY}"](內容不轉述,避免病歷資料出現在錯誤訊息)`;
    alert("臨床儲存層完整性錯誤,已進入唯讀保護:\n" + clinicalStoreIntegrityError);
    return [];
  }
}

function persistClinicalCases() {
  if (clinicalStoreIntegrityError) {
    alert("唯讀保護中,拒絕存檔(避免覆蓋半載入的資料):\n" + clinicalStoreIntegrityError);
    return false;
  }
  // M1:pointer=v2 但 store 缺失時,loadClinicalCases 通常已經先落入上面那條
  // clinicalStoreIntegrityError 鎖。這裡是第二道防線 —— 萬一 pointer 在
  // load 之後才切成 v2,或 persist 被獨立呼叫:一律零寫入,絕不寫回
  // CASE_STORAGE_KEY(那是 v1 的回滾錨,寫了就把它蓋掉)。
  if (!window.AcuTingClinicalStore && localStorage.getItem("acuting-clinical-active") === "v2") {
    alert("唯讀保護中,拒絕存檔(pointer=v2 但 clinical-store 模組未載入):\n請確認用正式入口開啟,勿用 legacy 頁。");
    return false;
  }
  try {
    if (window.AcuTingClinicalStore) {
      AcuTingClinicalStore.save(clinicalCases);
      // v2 模式:存檔後補建 pending 病人(fire-and-forget;失敗不影響已存病歷)
      if (AcuTingClinicalStore.activeIsV2 && AcuTingClinicalStore.activeIsV2() && AcuTingClinicalStore.syncPendingPatients) {
        const sha = (s) => crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))
          .then((b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""));
        AcuTingClinicalStore.syncPendingPatients(sha).catch((e) => console.error("syncPendingPatients failed (will retry next save):", e));
      }
    } else {
      localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(clinicalCases, null, 2));
    }
    return true;
  } catch (e) {
    // 寫入失敗(配額滿/隱私模式/storage 例外):大聲告知,絕不假裝已存。
    alert("存檔失敗 —— 資料尚未寫入!請立即匯出備份再重試。\n" + e.message);
    return false;
  }
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
  renderPatientsWorkspace();   // Patient Workspace W1
  renderBackupBanner();   // CS1
  renderDirectoryFilters();
  renderSystemToggleDrawer();
  renderChannelsWorkspace();
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
  return chips;
}

function renderActiveFilterSummary(filtered) {
  if (!activeFilterSummaryEl) return;
  const chips = getActiveFilterChips();
  if (!chips.length) {
    activeFilterSummaryEl.innerHTML = "";
    activeFilterSummaryEl.style.display = "none";
    return;
  }
  activeFilterSummaryEl.style.display = "grid";

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
  if (kind === "all" || kind === "tungZone") directoryTungZone = "";
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
  renderHomeQuickGrid();
}

// Home quick-access tiles (2026-08-11 homepage pass). Counts are computed
// from the loaded bundle + live case store at every renderOsStatus, same
// honesty rule as the quality page — no hand-written numbers. The first
// tile is "continue where you left off": the most recently updated case,
// the single most common reason to open this app on a clinic day.
function renderHomeQuickGrid() {
  const host = document.getElementById("homeQuickGrid");
  if (!host) return;
  const K = globalThis.ACUTING_KNOWLEDGE || {};
  const count = (k) => ((K[k] && K[k].records) || []).length;
  const en = contentMode === "english";
  const tiles = [];
  const last = [...clinicalCases].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0];
  if (last) {
    /* updatedAt 存的是 UTC 瞬間(new Date().toISOString()),不是日曆日。
     * 直接切前 10 碼等於把「瞬間」當「日曆日」讀 —— 跟泳道軸標籤是反方向的
     * 同一類錯(那邊是日曆日被當瞬間解析)。UTC-7 晚上 5 點後 UTC 已跨到
     * 隔天,PROJECT_LOG 2026-08-12 記過:本地 08-12 晚上,卡片顯示 08-13。
     * 用 localDateISO 轉回本地日曆日,不要對 ISO 字串切片。 */
    const lastDate = last.updatedAt ? localDateISO(new Date(last.updatedAt).getTime()) : "";
    tiles.push({ href: "#ws/cases", cls: "home-tile--continue", eyebrow: en ? "Continue" : "繼續上次",
      title: last.caseTitle || last.patientCode || "Case", sub: `${last.soapNotes.length} SOAP · ${lastDate}` });
  }
  tiles.push(
    { href: "#ws/cases", eyebrow: en ? "Cases" : "病例", title: String(clinicalCases.length), sub: en ? "clinical records" : "臨床病歷" },
    { href: "#ws/acu", eyebrow: en ? "Acupoints" : "穴位", title: String(getDataQualityAudit().total), sub: en ? "channel + Tung + auricular + extra" : "經穴+董氏+耳穴+奇穴" },
    { href: "#ws/formula", eyebrow: en ? "Formulas" : "方劑", title: String(count("formulas")), sub: en ? "with composition" : "含組成加減" },
    { href: "#ws/herb", eyebrow: en ? "Herbs" : "中藥", title: String(count("herbs")), sub: en ? "materia medica" : "本草" },
    { href: "#ws/condition", eyebrow: en ? "Conditions" : "病症", title: String(count("conditionCanon")), sub: en ? "western canon" : "西醫病名庫" },
    { href: "#ws/quality", eyebrow: en ? "Quality" : "品質", title: String(count("symptoms") + count("tdisRegistry")), sub: en ? "sym + TCM disease" : "症狀+中醫病名" }
  );
  host.innerHTML = tiles.map((t) => `
    <a class="home-tile ${t.cls || ""}" href="${t.href}">
      <small>${escapeHtml(t.eyebrow)}</small>
      <strong>${escapeHtml(t.title)}</strong>
      <span>${escapeHtml(t.sub)}</span>
    </a>`).join("");
}

// Quality-page honesty rebuild (2026-08-11, Ting: 「那個地方很亂很假」).
// Every number is computed from the LOADED bundle at render time — no
// hand-written claims. "有內容" per line = the line's own irreplaceable
// field is non-empty (a card whose key field is blank counts as index-only,
// exactly how the validators see it). Verification state is only asserted
// where a real per-record status field exists.
function renderKnowledgeLineMatrix() {
  const host = document.getElementById("knowledgeLineMatrix");
  if (!host) return;
  const K = globalThis.ACUTING_KNOWLEDGE || {};
  const recs = (k) => (K[k] && K[k].records) || (Array.isArray(K[k]) ? K[k] : []);
  const filled = (list, f) => list.filter((r) => { const v = r[f]; return Array.isArray(v) ? v.length : !!v; }).length;
  const lines = [];
  const push = (zh, en, list, contentField, statusNote) => {
    const n = list.length; if (!n) return;
    const c = contentField ? filled(list, contentField) : n;
    lines.push({ zh, en, n, c, pct: Math.round((c / n) * 100), note: statusNote });
  };
  // 穴位線:記錄集在 app_data(非 bundle),用既有 audit 的真實數字。
  // 「有內容」對穴位 = source-checked(比 mere presence 嚴格,見
  // renderDatabaseHealth 的 verified % 註解 — 同一把尺)。
  const acu = getDataQualityAudit();
  // 2026-08-11 Ting 指正:穴位線是全集(經穴+董氏+耳穴+經外奇穴),不只 361。
  if (acu.total) {
    lines.push({ zh: "穴位(全集)", en: "Acupoints (all)", n: acu.total, c: acu.sourceCheckedStandard, pct: Math.round((acu.sourceCheckedStandard / acu.total) * 100), note: "經穴+董氏+耳穴+奇穴;分數 = 標準經穴已源審核數" });
  }
  push("中藥", "Herbs", recs("herbs"), "category", "");
  push("方劑", "Formulas", recs("formulas"), "composition", "");
  push("西醫病名", "Conditions", recs("conditionCanon"), "summary_zh", "目標 300;驗證器逐批收斂中");
  push("中醫病名", "TCM diseases", recs("tdisRegistry"), "definition_zh", "分批加深中");
  push("證型", "Patterns", recs("patternLibrary"), "key_signs_zh", "");
  push("症狀", "Symptoms", recs("symptoms"), "definition_zh", "驗證器 0 defects");
  push("補充劑", "Supplements", recs("supplementRecords"), "evidence_snapshot_en", "全數 skeleton 級;interaction 層已建");
  push("西藥", "Drugs", recs("pharmDrugs"), "mechanism_zh", "draft;DailyMed 補全中");
  push("鑑別比較", "Comparisons", recs("comparisons"), "", "");
  host.innerHTML = lines.map((l) => `
    <article class="kline-row">
      <div class="kline-name"><strong>${escapeHtml(l.zh)}</strong><small>${escapeHtml(l.en)}</small></div>
      <div class="kline-nums"><span class="kline-count">${l.n}</span><small>records</small></div>
      <div class="kline-bar" role="img" aria-label="${l.pct}% 有內容"><div class="kline-fill" style="width:${l.pct}%"></div></div>
      <div class="kline-pct">${l.c}/${l.n}<small>有內容 ${l.pct}%</small></div>
      <div class="kline-note">${escapeHtml(l.note || "")}</div>
    </article>`).join("");
}

function renderDatabaseHealth() {
  const audit = getStandardPointAudit();
  const quality = getDataQualityAudit();
  renderProgressMatrix();
  renderKnowledgeLineMatrix();
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

function hydrateFilters() {
  let meridianList = unique(points.map((point) => point.meridian));
  let regionList = unique(points.map((point) => point.region));

  if (selectedSystem === "standard14") {
    const stdPoints = points.filter(isStandardChannelPoint);
    meridianList = unique(stdPoints.map((p) => p.meridian));
    regionList = unique(stdPoints.map((p) => p.region));
  } else if (selectedSystem === "tung") {
    meridianList = tungZoneGroups.map((g) => g.zh);
    regionList = ["手指", "手掌", "前臂", "上臂", "腳趾", "腳掌", "小腿", "大腿", "耳朵", "頭面", "軀幹"];
  } else if (selectedSystem === "auricular") {
    meridianList = [
      "TF: 三角窩 (Triangular Fossa)",
      "AH: 對耳輪 (Antihelix)",
      "SAC: 對耳輪上腳 (Superior Antihelix Crus)",
      "IAC: 對耳輪下腳 (Inferior Antihelix Crus)",
      "AT: 對耳屏 (Antitragus)",
      "TR: 耳屏 (Tragus)",
      "CVC: 耳甲腔 (Cavum Concha)",
      "CYC: 耳甲艇 (Cymba Concha)",
      "EL: 耳垂 (Earlobe)",
      "SC: 耳舟 (Scapha)",
      "HX: 耳輪 (Helix)",
      "HCS: 耳輪腳周圍 (Helix Crus)",
      "IN: 屏間切跡 (Intertragic Notch)",
      "POS: 耳背 (Posterior of Ear)"
    ];
    regionList = ["耳部 (Ear)"];
  } else if (selectedSystem === "scalp") {
    meridianList = [
      "MS1 額中線", "MS2 額旁一線", "MS3 額旁二線", "MS4 額旁三線",
      "MS5 頂中線", "MS6 頂中前斜線", "MS7 頂中後斜線", "MS8 頂旁一線", "MS9 頂旁二線",
      "MS10 枕中線", "MS11 枕旁上線", "MS12 枕旁下線", "MS13 顳前線", "MS14 顳後線",
      "焦氏舞蹈震顫區", "焦氏言語一區", "焦氏言語二區", "焦氏言語三區", "焦氏眩暈聽覺區"
    ];
    regionList = ["頭部 (Head/Scalp)"];
  }

  fillSelect(meridianFilter, contentMode === "english" ? "All channels/zones" : "全部經絡/部位", meridianList);
  fillSelect(regionFilter, contentMode === "english" ? "All regions" : "全部身體部位", regionList);
  fillSelect(patternFilter, contentMode === "english" ? "All patterns" : "全部證型", unique(points.flatMap((point) => point.patterns)));
}

function renderDirectoryFilters() {
  renderMeridianCategories();
  renderRegionCategories();
  renderTopicCategories();
  renderTungZoneCategories();
  renderPointCategories();
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
        searchInput.value = "";   // "按原穴就列出所有原穴" — show the full category set
      }
      clearPointDetailHash();
      render();
      document.querySelector("#acupunctureWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
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
  // The filter may be the detached stand-in rather than a real <select>; there
  // are no options to build then, but the retained value must still be valid.
  if (!select || typeof select.append !== "function") {
    if (select && !values.includes(select.value)) select.value = "";
    return;
  }
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

  /* 特定穴, 臨床主題 and 身體部位 classify points across every channel rather
   * than beside them, so Ting wants all three at tab level instead of buried
   * in the sidebar under whichever system is open. Each drawer is built from
   * the same catalog its sidebar accordion uses, so the two cannot drift. */
  if (selectedSystem === "specific") {
    titleZh = "⭐️ 特定穴類別 (五輸/原絡/郄/俞募/鬼穴)";
    titleEn = "⭐️ Specific Point Groups";
    chips = pointCategoryCatalog.map((c) => ({ id: c.id, zh: c.label_zh, en: c.label_en }));
  } else if (selectedSystem === "topic") {
    titleZh = "🩺 臨床主題與證型";
    titleEn = "🩺 Clinical Topics & Patterns";
    chips = directoryTopics
      .filter((t) => (t.group || "clinical") === "clinical")
      .map((t) => ({ id: t.id, zh: t.zh, en: t.en }));
  } else if (selectedSystem === "region") {
    titleZh = "📍 身體部位";
    titleEn = "📍 Body Regions";
    chips = directoryRegionGroups.map((g) => ({ id: g.id, zh: g.zh, en: g.en }));
  } else if (selectedSystem === "standard14") {
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
      <!-- The Channel & Point Charts shortcut used to live here, visible only
           while 十四正經 was selected. It is now a top-level tab in
           #systemTabsBar, so it is not repeated inside the drawer. -->
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
  if (selectedSystem === "specific") {
    return pointMatchesCategory(point, selectedSystemBranch);
  }
  if (selectedSystem === "topic") {
    return pointMatchesTopic(point, selectedSystemBranch);
  }
  if (selectedSystem === "region") {
    return pointMatchesRegionGroup(point, selectedSystemBranch);
  }
  if (selectedSystem === "auricular") {
    const zone = String(point.zone || "").toUpperCase();
    return zone === selectedSystemBranch || code.includes(selectedSystemBranch) || loc.includes(selectedSystemBranch);
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
    return m.includes("Auricular") || m.includes("耳穴") || code.startsWith("EAR-") || code.startsWith("AT");
  }
  if (sys === "scalp") {
    return m.includes("Scalp") || m.includes("頭皮針") || code.startsWith("MS") || code.startsWith("SCALP-");
  }
  if (sys === "special") {
    return m.includes("Special") || m.includes("腹針") || m.includes("腕踝針") || m.includes("靳三針") || m.includes("平衡針");
  }
  // 特定穴 cuts across the channels rather than sitting beside them: a point is
  // a 井穴 or a 原穴 whichever channel it belongs to. Selecting this system
  // narrows to points carrying any 特定穴 tag; the drawer then picks which.
  if (sys === "specific") {
    return (point.pointCategories || []).length > 0;
  }
  // 臨床主題 and 身體部位 apply to any point, so the tab itself narrows nothing
  // — the drawer chip does. Returning true keeps the full set visible until a
  // chip is picked, rather than showing an empty directory on tab click.
  if (sys === "topic" || sys === "region") return true;
  return true;
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

function isScalpPoint(point) {
  return String(point.meridian || "").includes("頭皮")
    || String(point.meridian || "").includes("Scalp")
    || String(point.region || "").includes("頭皮")
    || String(point.code || "").startsWith("MS")
    || String(point.code || "").startsWith("SCALP-");
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
            ${isAuricularPoint(point) ? `
              ${heroFact(contentMode === "english" ? "Ear Anatomy Zone" : "耳區解剖分區", contentMode === "english" ? regionEn(point) : (point.region || "耳穴分區"), contentMode === "english" ? (point.locationEn || point.location) : point.location)}
            ` : `
              ${heroFact(contentMode === "english" ? "Channel" : "所屬經絡", contentMode === "english" ? shortMeridianEn(point) : shortMeridian(point), point.code)}
              ${heroFact(contentMode === "english" ? "Region" : "身體部位", contentMode === "english" ? regionEn(point) : (point.region || "未分類"), contentMode === "english" ? (point.locationEn || point.location) : point.location)}
              ${heroFact(contentMode === "english" ? "Needling" : "針刺/手法", shortTechnique(point), contentMode === "english" ? "Verify with professional sources and clinical training" : "依專業來源與臨床訓練判斷")}
              ${heroFact(contentMode === "english" ? "Moxibustion" : "艾灸", contentMode === "english" ? moxaTextEn(moxaText) : moxaText, contentMode === "english" ? "Based on presentation and contraindications" : (point.cautions || "依體質與病勢判斷"))}
            `}
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
        ${isAuricularPoint(point) ? `
          ${studySection(contentMode === "english" ? "Location & Anatomy Zone" : "身體部位 / 耳區解剖", pointLocationArticle(point), "location")}
          ${pointFunctionsSection(point)}
          ${(() => {
            const body = indicationArticle(point);
            return body ? studySection(contentMode === "english" ? "Indications" : "主治病症", body, "target") : "";
          })()}
          ${combinePointsSection(point)}
          ${visualLinksSection(point)}
        ` : `
          ${studySection(contentMode === "english" ? "Location & Point Finding" : "定位・取穴・解剖", pointLocationArticle(point), "location")}
          ${/* 2026-08-23 UI/UX P1#2: 361 穴中 85 筆 cautions 含「禁」（禁灸 56、絕對禁 9、禁刺 4）——
             安全內容不收合，比照藥物卡「黑框警告直接展開」的先例（見 renderDrugDetail 的註解）。 */ ""}
          ${studySection(contentMode === "english" ? "Needling, Moxibustion & Safety" : "針法・艾灸・安全", needlingArticle(point), "needle")}
          ${window.AcuTingNotes ? window.AcuTingNotes.panel("point", point.code, `${point.code} ${point.nameZh || point.nameEn || ""}`.trim()) : ""}
          ${pointIdentitySection(point)}
          ${examPearlSection(point)}
          ${pointFunctionsSection(point)}
          ${(() => {
            const body = indicationArticle(point);
            return body ? studySection(contentMode === "english" ? "Indications" : "主治病症", body, "target") : "";
          })()}
          ${pointTagSection(point)}
          ${combinePointsSection(point)}
          ${pointLinkSection(point)}
          ${pointCompareSection(point)}
          ${studySection(contentMode === "english" ? "Modern Research & Clinical Notes" : "現代研究 / 臨床提醒", evidenceText(point), "research")}
          ${classicalRefsSection(point)}
          ${studySection(contentMode === "english" ? "Name, Aliases & Background" : "穴名沿革與別名", pointIntro(point))}
          ${visualLinksSection(point)}
          ${studySection(contentMode === "english" ? "Sources" : "參考來源", formatSources(point.sources), "sources")}
        `}
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
  document.querySelector("#editBtn")?.addEventListener("click", () => openEditor(point));
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
  
  const isDuplicate = enHead.trim() === zhHead.trim() || /[\u4e00-\u9fa5]/.test(enHead);
  const renderEn = enText && !isDuplicate;

  return `<li>
    <span class="pf-zh">${escapeHtml(zhHead)}</span>
    ${zhDetail ? `<span class="pf-detail">${escapeHtml(zhDetail)}</span>` : ""}
    ${renderEn ? `<span class="pf-en">${escapeHtml(enHead)}</span>` : ""}
    ${renderEn && enDetail ? `<span class="pf-detail pf-detail--en">${escapeHtml(enDetail)}</span>` : ""}
  </li>`;
}

function pointIdentitySection(point) {
  const zh = point.pointIdentityZh || [];
  const en = point.pointIdentityEn || [];
  const list = contentMode === "english" ? (en.length ? en : zh) : zh;
  const cats = renderPointCategoryBadges(point);
  if (!list.length) return cats;
  const catText = cats.replace(/<[^>]+>/g, " ");
  const extra = list.filter((t) => {
    const core = String(t).replace(/[（(].*$/, "").trim();
    return core.length < 2 || !catText.includes(core);
  });
  if (!extra.length) return cats;
  const chips = extra.map((t) => {
    const danger = /⚠|禁針|禁灸|NEVER|deep needling|Avoid/i.test(t);
    return `<span class="point-identity-chip${danger ? " is-danger" : ""}">${escapeHtml(t)}</span>`;
  }).join("");
  return `${cats}<div class="point-identity" aria-label="${contentMode === "english" ? "Point identity" : "穴位身分"}">
    <div class="point-identity__chips">${chips}</div>
  </div>`;
}

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

function pointFunctionsSection(point) {
  const asText = (v) => (Array.isArray(v) ? v.join(" ") : String(v || ""));
  const zh = asText(point.functions).split(/[，、]/).map((x) => x.trim()).filter(Boolean);
  const en = asText(point.functionsEn).split(/\s{2,}|(?<=[a-z])\s(?=[A-Z])/).map((x) => x.trim()).filter(Boolean);
  const zhList = point.functionsZhList && point.functionsZhList.length ? point.functionsZhList : zh;
  const enList = point.functionsEnList && point.functionsEnList.length ? point.functionsEnList : en;
  if (!zhList.length && !enList.length) return "";
  const aligned = zhList.length === enList.length && zhList.length > 0;

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
    : zhList.map((t) => `<li><span class="pf-zh">${escapeHtml(t)}</span></li>`).join("");

  const enBlock = (!aligned && enList.length)
    ? `<div class="pf-en-block" style="margin-top:8px;font-style:italic;color:#4a5568;">${enList.map(t => escapeHtml(t)).join("<br>")}</div>`
    : "";

  return `<section class="study-section point-functions">
    <h3>功效</h3>
    <ol class="point-functions__list${aligned ? " is-paired" : ""}">${rows}</ol>
    ${enBlock}
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
  /* 兩個 id 空間並存:既有 44 點的 tcm_pattern_ids 是 legacy pat.<中文>
     (tcmPatternCanon 的鍵),新接的線依紅線 1 只寫 canonical pattern.<slug>
     (patternLibrary 的鍵)。只查其中一邊,另一邊就整批變暗連結。 */
  const patById = new Map([
    ...((K.patternLibrary?.records || (Array.isArray(K.patternLibrary) ? K.patternLibrary : [])) || []).map((p) => [p.id, p]),
    ...(K.tcmPatternCanon?.records || []).map((p) => [p.id, p]),
  ]);
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
    return visualLinks[0]?.url || (typeof sources[0] === "string" && sources[0].startsWith("http") ? sources[0] : "https://www.mastertungacupuncture.org/acupuncture/traditional/points/list");
  }

  code = code.replace(/^te/, "th").replace(/^sj/, "th");
  return `https://www.mastertungacupuncture.org/acupuncture/traditional/points/${code}`;
}

function externalPointLinks(point) {
  const sources = point.sources || [];
  const visualLinks = normalizeVisualLinks(point.visualLinks || []);

  // Extra-point codes are stable database identifiers, not derivable URL
  // slugs. Expose only exact pages that were explicitly stored and reviewed;
  // the standard-point builders below can otherwise produce an empty
  // CloudTCM link or send American Dragon to its home page.
  if (isExtraPoint(point)) {
    const storedUrls = [...sources, ...visualLinks.map((link) => link.url)]
      .map((url) => String(url || "").trim())
      .filter((url) => /^https?:\/\//i.test(url));
    const cloudtcm = storedUrls.find((url) => /cloudtcm\.com\/(?:dic|acupoint)\/\d+/i.test(url));
    const americanDragon = storedUrls.find((url) => /americandragon\.com\/Points\/(?!Index2\.html(?:$|[?#]))[^/?#]+\.html(?:$|[?#])/i.test(url));
    const elotus = storedUrls.find((url) => /mastertungacupuncture\.org\/acupuncture\/traditional\/points\/(?!list(?:$|[?#]))[^/?#]+/i.test(url));

    return [
      cloudtcm ? { label: contentMode === "english" ? "CloudTCM" : "雲端中醫", url: cloudtcm, kind: "chinese" } : null,
      americanDragon ? { label: "American Dragon (AD)", url: americanDragon, kind: "english" } : null,
      elotus ? { label: contentMode === "english" ? "eLotus CORE" : "eLotus 權威圖解", url: elotus, kind: "english" } : null
    ].filter(Boolean);
  }

  if (isAuricularPoint(point)) {
    const elotusLink = visualLinks.find(l => (l.url || '').includes('mastertungacupuncture.org'))?.url || sources.find(s => s.includes('mastertungacupuncture.org')) || `https://www.mastertungacupuncture.org/acupuncture/auricular/lch/points/${(point.code||'').toLowerCase().replace('ear-lch-', '').replace('ear-', '')}`;
    return [
      { label: contentMode === "english" ? "eLotus CORE (Dr. Huang)" : "eLotus 權威圖解", url: elotusLink, kind: "english" }
    ];
  }

  if (isScalpPoint(point)) {
    const verifiedLink = visualLinks.find(l => (l.url || '').includes('mastertungacupuncture.org'))?.url
      || sources.find(s => typeof s === 'string' && s.includes('mastertungacupuncture.org') && !s.includes('/scalp/overview'));
    if (verifiedLink) {
      return [
        { label: contentMode === "english" ? "eLotus CORE (Tai's Scalp)" : "eLotus 權威圖解", url: verifiedLink, kind: "english" }
      ];
    }
    return [];
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

/* 這一穴到底是不是董氏穴。
 * 2026-08-12:英文模式的簡介模板無條件寫「Master Tung Acupuncture point」,
 * 於是 LI4 合谷 —— 十四正經最常用的穴 —— 的英文卡上寫著它是董氏穴,
 * 433 個非董氏穴位全部如此。這不是翻譯不足,是**張冠李戴**:
 * 生成的句子替卡片宣稱了一個它沒有的來源,而讀的人會以為那是查過的。
 * 與假劑量 6~15g 同一類 —— 渲染層說了資料沒說過的話。 */
function isTungPoint(point) {
  const code = String(point.code || "");
  if (/^T\d/.test(code) || /^TDT|^TVT/.test(code)) return true;
  return /tung|董氏/i.test(String(point.meridian || "") + String(point.channel || "") + String(point.system || ""));
}

function pointIntro(point) {
  if (contentMode === "english") {
    // 有來源的英文簡介勝過生成的模板(49 個奇穴帶 nameIntroEn,先前完全沒被讀過)。
    const introEn = String(point.nameIntroEn || "").trim();
    const otherEn = Array.isArray(point.otherNamesEn) ? point.otherNamesEn.filter(Boolean).join(", ")
      : String(point.otherNamesEn || "").trim();
    if (introEn) {
      const parts = [`【Name & Overview】\n${introEn}`];
      if (otherEn) parts.push(`【Other names】${otherEn}`);
      return parts.join("\n\n");
    }
    const regionText = regionEn(point) || point.region || "the recorded anatomical region";
    const actionsText = point.functionsEn || "Harmonize Qi & Blood, Unblock Channels";
    const tail = isTungPoint(point)
      ? "Clinical Application Note: Master Tung Acupuncture point for targeted channel regulation and internal organ harmony. Verify needling depth, angle, and safety precautions against professional textbooks."
      : "Clinical Application Note: verify needling depth, angle and safety precautions against professional textbooks.";
    const head = [`${point.nameEn} (${point.pinyin}; ${point.code}) belongs to ${shortMeridianEn(point)}.`,
      `It is located in the ${regionText}.`].join(" ");
    return `${head}\n\nActions & Reaction Areas:\n${actionsText}\n\n${tail}`;
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

// 2026-08-12(SOL 路由建議):361 經穴的中文 needling 與英文 acumethod_en 來自
// 兩個來源(CloudTCM / eLotus),深度數字從未對帳。實測 145 穴兩邊不一致,英文較深
// 者為多數,29 穴位於胸/背/頸/眶等高風險區;另有 7 穴中文明確禁直刺而英文寫
// perpendicular(LR14 期門連自己的禁忌欄都與自己的針法欄互相矛盾)。
// 在來源覆核完成前,fail-closed:不顯示任何一邊的數字,改顯示衝突聲明。
// 顯示較淺的一邊等於替臨床選邊,顯示兩邊等於邀請讀者挑深的那個 —— 兩者都不做。
function needlingDepthConflict(point) {
  const ranges = (s) => {
    const out = [];
    const re = /(\d+(?:\.\d+)?)\s*[–\-~至]\s*(\d+(?:\.\d+)?)\s*(?:cun|寸|吋)/gi;
    let m; while ((m = re.exec(s))) out.push(parseFloat(m[2]));
    if (!out.length) { const one = /(\d+(?:\.\d+)?)\s*(?:cun|寸|吋)/gi; let s1; while ((s1 = one.exec(s))) out.push(parseFloat(s1[1])); }
    return out;
  };
  // 「胸背部穴位斜刺…嚴禁直刺過深」是整條經共用的條件句(GB29–GB43 的膽經肢體穴
  // 全都被貼上這句),它講的是胸背部穴位,不是這一穴。把條件句當成本穴禁令會在
  // 丘墟、俠溪這種四肢穴上誤報,誤報會讓整個警告失去可信度 —— 先剔除再判斷。
  const dropScoped = (s) => s.split(/[。\n]/).filter((t) => !/胸背部穴位|背部穴位/.test(t)).join("。");
  const zhOwn = dropScoped([point.techniqueNotes, point.acumethodZh].filter(Boolean).join(" "));
  const zhText = dropScoped([point.techniqueNotes, point.acumethodZh, point.cautions].filter(Boolean).join(" "));
  const enText = String(point.acumethodEn || "");
  if (!zhText || !enText) return null;
  const zhMax = Math.max(...ranges(zhText), -Infinity);
  const enMax = Math.max(...ranges(enText), -Infinity);
  // 中文卡自己打自己:針法欄寫「直刺 0.3-0.5 寸」,禁忌欄寫「嚴禁直刺」(LR14 期門)。
  // 這與語言無關,兩邊讀者看到的都是自相矛盾的卡,也不必比對英文就能判定。
  // 危險區判定用「這一穴的文字自己講了什麼器官」,不用穴位代碼名單 —— 名單是我
  // 手寫的,會漏;文字是有來源的。足通谷差 0.2 寸在腳趾上,與膏肓差 0.3 寸在肺上,
  // 不是同一件事:前者藏起數字只損失可用性,後者藏起數字才是安全的一邊。
  const hazard = /氣胸|傷及肺|肺臟|內臟|心臟|肝脾|大血管|動脈|眼球|眶|延髓|脊髓|胸腔|腹腔/.test(zhText)
    || /pneumothorax|lung|pleura|artery|eyeball|orbit|spinal cord|medulla|cardiac|heart|viscera/i.test(enText);
  const mark = (t) => (hazard ? t : t + "-soft");
  const zhForbidsPerp = /嚴禁直刺|不可直刺|禁直刺|不宜直刺|僅可斜刺|只可斜刺/.test(zhText);
  if (zhForbidsPerp && /直刺\s*\d/.test(zhOwn)) return mark("self");
  // 英文側的 perpendicular 必須是「指示」而不是「警告」:多數英文欄長成
  // 「Oblique insertion … CAUTION: deep perpendicular insertion risks pneumothorax」,
  // 對整串做 /perpendicular/ 會把警告讀成許可,在兩邊其實一致的穴上誤報衝突。
  const enInstruction = enText.split(/CAUTION|⚠|Contraindicat/i)[0];
  if (zhForbidsPerp && /perpendicular/i.test(enInstruction)) return mark("angle");
  if (Number.isFinite(zhMax) && Number.isFinite(enMax) && enMax > zhMax + 0.05) return mark("depth");
  return null;
}

function needlingArticle(point) {
  const parts = [];
  const rawConflict = needlingDepthConflict(point);
  // -soft = 兩份來源確實不一致,但文字裡沒有任何器官風險(多為四肢穴、差距 0.2-0.3 寸)。
  // 這種情況照常顯示數字,只在下面附一句提醒;只有危險區才 fail-closed 藏數字。
  const softConflict = typeof rawConflict === "string" && rawConflict.endsWith("-soft");
  const depthConflict = softConflict ? null : rawConflict;
  if (softConflict) {
    parts.push(contentMode === "english"
      ? "NOTE: the Chinese and English sources give different depth figures for this point; the Chinese figure is the shallower one. Verify before needling."
      : "提醒:本穴中英文來源的深度數字不一致(中文較淺),進針前請查證。");
  }
  if (depthConflict) {
    parts.push(contentMode === "english"
      ? {
          self: "⚠️ SOURCE CONFLICT — DO NOT USE AS A NEEDLING GUIDE\nThis card contradicts itself: its technique field prescribes perpendicular insertion while its own contraindication field forbids it. Numeric technique is withheld until the sources are reconciled. Consult a verified text.",
          angle: "⚠️ SOURCE CONFLICT — DO NOT USE AS A NEEDLING GUIDE\nThis point's two sources disagree on insertion angle: the Chinese source forbids perpendicular insertion, the English one prescribes it. Numeric technique is withheld until the sources are reconciled. Consult a verified text.",
          depth: "⚠️ SOURCE CONFLICT — DO NOT USE AS A NEEDLING GUIDE\nThis point's two sources disagree on insertion depth (the English figure is deeper). Numeric technique is withheld until the sources are reconciled. Consult a verified text.",
        }[depthConflict]
      : {
          self: "⚠️ 來源衝突 —— 禁止作為臨床進針指引\n本卡自相矛盾:針法欄寫直刺,而本卡自己的禁忌欄寫嚴禁直刺。在來源覆核完成前不顯示數字。請查證教材。",
          angle: "⚠️ 來源衝突 —— 禁止作為臨床進針指引\n本穴兩份來源對進針角度的敘述不一致(中文禁直刺而英文指示直刺),在來源覆核完成前不顯示數字。請查證教材。",
          depth: "⚠️ 來源衝突 —— 禁止作為臨床進針指引\n本穴兩份來源對進針深度的敘述不一致(英文側較深),在來源覆核完成前不顯示數字。請查證教材。",
        }[depthConflict]);
  }
  if (contentMode === "english") {
    if (depthConflict) { /* 數字已被 fail-closed 抑制,見函式頂端 */ }
    else if (point.acumethodEn) parts.push(`TECHNIQUES:\n${point.acumethodEn}`);
    else if (point.acumethodZh) parts.push(`TECHNIQUES:\n${point.acumethodZh}`);
    // 2026-08-12:21 個穴位的中文艾灸欄本身就是禁灸聲明(「不宜運用灸法」),
    // 而英文欄寫著通用的「Moxibustion applicable: 3-5 moxa cones…」。名單是
    // 睛明、攢竹、承泣、四白、瞳子髎、絲竹空(眼周)、缺盆、啞門、風府、乳中…
    // 也就是傳統禁灸穴。英文那句是事後機器產生的通用字串(全 361 穴同一句),
    // 中文那句是有來源的敘述 —— 與 cautions_en 同一個道理:來源欄勝過生成欄。
    // 這裡不翻譯、不新增內容,只是在中文明文禁灸時不顯示那句生成的「可灸」,
    // 改為原樣呈現中文禁灸聲明。寧可讓英文讀者看到中文,也不要讓他在眼睛旁邊點艾炷。
    const moxaZhText = String(point.moxaZh || "").trim();
    const moxaProhibited = /^(不宜運用灸法|禁灸|不可灸|不宜灸)/.test(moxaZhText);
    if (moxaProhibited) {
      parts.push(`MOXIBUSTION & HEAT THERAPY:\n⚠️ ${moxaZhText}`);
    } else if (point.moxaEn) {
      parts.push(`MOXIBUSTION & HEAT THERAPY:\n${point.moxaEn}`);
    }
    // cautionsEn arrives in BOTH shapes: an array from records whose
    // contraindications_en is a list, and a plain string from 206 of the 947
    // points (all of EX-UE6..UE17, EX-LE*, and others). `.join` on a string
    // threw TypeError, so English mode silently lost the contraindications
    // block on exactly those points — the safety text, on the language where
    // the reader is least able to fall back to the Chinese field.
    const asText = (v) => Array.isArray(v) ? v.filter(Boolean).join("\n") : (typeof v === "string" ? v.trim() : "");
    // 逐穴警告優先,通用句在後。兩者都印,因為 cautions_en 常同時帶進針方式,
    // 而 contraindications_en 偶爾(4/361)確實帶了逐穴內容 —— 丟掉哪一邊都會漏。
    // 逐穴那條放前面:讀的人先看到「這一穴會出什麼事」,而不是先看到衛生守則。
    const perPointEn = asText(point.pointCautionsEn);
    const genericEn = asText(point.cautionsEn);
    const enParts = [];
    if (perPointEn) enParts.push(perPointEn);
    if (genericEn && genericEn !== perPointEn) enParts.push(genericEn);
    if (enParts.length) parts.push(`CONTRAINDICATIONS:\n${enParts.join("\n")}`);
    else if (point.cautions) parts.push(`CONTRAINDICATIONS / SAFETY:\n${point.cautions}`);
  } else {
    if (depthConflict) { /* 數字已被 fail-closed 抑制,見函式頂端 */ }
    else if (point.acumethodZh) parts.push(`【針刺法】\n${point.acumethodZh}`);
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
    // clinical_pearls_en:35 個奇穴帶著,先前沒被讀過。它記的是「這一穴在來源之間
    // 有哪些延伸適應症與分歧」,與 modern_research 的整段研究敘述不同,兩者都留。
    const pearls = Array.isArray(point.clinical_pearls_en)
      ? point.clinical_pearls_en.filter(Boolean).join("\n")
      : String(point.clinical_pearls_en || "").trim();
    if (pearls && pearls !== String(modernEn || "").trim()) parts.push(`【Clinical Pearls】\n${pearls}`);
    if (point.reviewStatus === "sourced_elotus_direct") {
      parts.push("【Source Provenance】This record is sourced directly from eLotus CORE Master Tung Standard Documentation.");
    } else {
      // 同一個張冠李戴:這句原本無條件加在每一張英文卡上,包括十四正經與奇穴。
      parts.push(isTungPoint(point)
        ? "Master Tung Acupuncture Clinical Reference: Verify point selection with classic literature and professional textbooks."
        : "Verify point selection with classic literature and professional textbooks.");
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
    // Initial-intake minimum dataset (2026-08-09, docs/INTAKE_MINIMUM_DATASET_AUDIT.md).
    // All nullable/optional-by-default: an older case loaded without these
    // keys gets "" / [] here, never a fabricated value (D4 spirit).
    genderIdentity: String(value.genderIdentity || ""),
    raceEthnicity: Array.isArray(value.raceEthnicity) ? value.raceEthnicity.map(String) : splitList(String(value.raceEthnicity || "")),
    raceEthnicityDetail: String(value.raceEthnicityDetail || ""),
    onsetApprox: String(value.onsetApprox || ""),
    chronicity: String(value.chronicity || ""),
    coursePattern: String(value.coursePattern || ""),
    previousTreatment: Array.isArray(value.previousTreatment) ? value.previousTreatment.map(String) : splitList(String(value.previousTreatment || "")),
    previousTreatmentNotes: String(value.previousTreatmentNotes || ""),
    // Transitional (§7, same doc): nullable 0-10, never coerced to 0. Kept as
    // "" (not 0) when absent so "not answered" and "scored zero" stay distinct.
    baselineSeverity: (value.baselineSeverity === 0 || value.baselineSeverity) ? Number(value.baselineSeverity) : "",
    occupation: String(value.occupation || ""),
    goals: String(value.goals || ""),
    // Publication consent (academic-readiness batch, pre-9/01 freeze; CARE
    // requires informed consent BEFORE a case report can be written). Case-
    // level, D4-style: "" = never asked (the default for every existing
    // case — consent is NEVER fabricated), 'granted'|'declined'|'pending' =
    // asked, with the date the answer was given. This records consent to
    // publish a de-identified case report; it is not treatment consent.
    publicationConsent: String(value.publicationConsent || ""),
    publicationConsentDate: String(value.publicationConsentDate || ""),
    chiefComplaint: String(value.chiefComplaint || ""),
    historyPresent: String(value.historyPresent || ""),
    pastHistory: String(value.pastHistory || ""),
    // Initial-intake Phase 2 (2026-08-09): coarse status paired with the
    // existing free-text `allergies` detail below — not a replacement, and
    // not an inference from it. "" (not yet asked) stays distinct from
    // "unknown" (asked, patient doesn't know), same D4 pattern as elsewhere
    // in this batch.
    allergyStatus: String(value.allergyStatus || ""),
    allergies: String(value.allergies || ""),
    currentMeds: String(value.currentMeds || ""),
    menstrualObHistory: String(value.menstrualObHistory || ""),
    lifestyle: String(value.lifestyle || ""),
    westernConditions: Array.isArray(value.westernConditions) ? value.westernConditions.map(String) : splitList(String(value.westernConditions || "")),
    easternDiseases: Array.isArray(value.easternDiseases) ? value.easternDiseases.map(String) : splitList(String(value.easternDiseases || "")),
    tcmPatterns: Array.isArray(value.tcmPatterns) ? value.tcmPatterns.map(String) : splitList(String(value.tcmPatterns || "")),
    safetyFlags: Array.isArray(value.safetyFlags) ? value.safetyFlags.map(String) : splitSafetyFlags(String(value.safetyFlags || "")),   // FIX C
    // D17 §5 — ONE longitudinal exposure timeline, CASE level. Each entry is a
    // ledger ROW ("this patient is/was on this agent"), not a per-visit
    // snapshot; a follow-up visit that changes a dose updates the SAME entry
    // (status/changeSinceLast/lastConfirmedVisitId) so the timeline stays
    // reconstructable. currentMeds free text above is UNTOUCHED — it remains
    // the prose sibling, never auto-parsed into this array.
    // agentId namespaces: drug.* (D15) or supp.* (D17 — not suppl.*).
    // Maps to case_agent_exposures / case_environmental_exposures
    // (localstorage_sqlite_mapping.json planned_mappings_d17).
    agentExposures: Array.isArray(value.agentExposures)
      ? value.agentExposures
          .filter((e) => e && (e.agentId || e.nameText))
          .map((e) => ({
            id: String(e.id || createId("agentexp")),
            agentType: String(e.agentType || ""),          // 'drug' | 'supplement'
            agentId: String(e.agentId || ""),
            nameText: String(e.nameText || ""),
            doseText: String(e.doseText || ""),
            frequencyText: String(e.frequencyText || ""),
            route: String(e.route || ""),
            startApprox: String(e.startApprox || ""),      // D4 coarse, never fabricated
            stopApprox: String(e.stopApprox || ""),
            status: String(e.status || ""),                // 'current'|'stopped'|'prn'|'unknown'
            indicationText: String(e.indicationText || ""),
            adherenceNote: String(e.adherenceNote || ""),
            infoSource: String(e.infoSource || ""),        // 'patient_reported'|'records'
            firstNotedVisitId: String(e.firstNotedVisitId || ""),
            lastConfirmedVisitId: String(e.lastConfirmedVisitId || ""),
            changeSinceLast: String(e.changeSinceLast || ""),
            changeNote: String(e.changeNote || ""),
            notes: String(e.notes || ""),
            // B-1 fix (docs/AUDIT_PHASE_B_2026-08-12.md): append-only event
            // history — the ledger fields above are the CURRENT snapshot;
            // these rows are what make 200mg→400mg→stopped reconstructable.
            // Write rule (app-enforced, normalizer only records): any change
            // to the snapshot fields MUST push one event with the NEW values;
            // events are never edited or removed — corrections are a new
            // event with a note. Maps to case_exposure_events (parent_type
            // 'agent'). Absent key on legacy data = [] — legal, means "no
            // recorded history yet", never fabricated.
            events: Array.isArray(e.events)
              ? e.events
                  .filter((ev) => ev && ev.eventType)
                  .map((ev) => ({
                    id: String(ev.id || createId("expevt")),
                    visitId: String(ev.visitId || ""),
                    eventType: String(ev.eventType || ""),
                    doseText: String(ev.doseText || ""),
                    frequencyText: String(ev.frequencyText || ""),
                    status: String(ev.status || ""),
                    effectiveApprox: String(ev.effectiveApprox || ""),
                    note: String(ev.note || ""),
                    // SOL Phase C review item 1: a missing historical timestamp
                    // stays missing ("") — synthesizing one at load time would
                    // stamp every legacy event with today's date and destroy
                    // the very chronology the event layer exists to preserve.
                    // New events get createdAt from applyExposureChange (the
                    // write path), never from this read path.
                    createdAt: String(ev.createdAt || "")
                  }))
              : []
          }))
      : [],
    // D17 — environmental/toxic exposures, SEPARATE from lifestyle (an
    // exposure happens TO the patient). certainty × timing are two
    // independent axes; 'suspected' is never auto-promoted to 'confirmed'.
    environmentalExposures: Array.isArray(value.environmentalExposures)
      ? value.environmentalExposures
          .filter((e) => e && (e.exposureId || e.nameText))
          .map((e) => ({
            id: String(e.id || createId("envexp")),
            exposureId: String(e.exposureId || ""),        // exposure.*
            nameText: String(e.nameText || ""),
            certainty: String(e.certainty || ""),          // 'suspected'|'patient_reported'|'confirmed'
            timing: String(e.timing || ""),                // 'ongoing'|'historical'|'unknown'
            startApprox: String(e.startApprox || ""),
            endApprox: String(e.endApprox || ""),
            contextText: String(e.contextText || ""),
            firstNotedVisitId: String(e.firstNotedVisitId || ""),
            lastConfirmedVisitId: String(e.lastConfirmedVisitId || ""),
            changeSinceLast: String(e.changeSinceLast || ""),
            notes: String(e.notes || ""),
            // B-1/H-1 fix: same append-only event history as agentExposures.
            // certainty transitions (suspected→confirmed) MUST land here as
            // certainty_changed events with a source note — closing the
            // trace-less promotion channel the audit flagged. Maps to
            // case_exposure_events (parent_type 'environmental').
            events: Array.isArray(e.events)
              ? e.events
                  .filter((ev) => ev && ev.eventType)
                  .map((ev) => ({
                    id: String(ev.id || createId("expevt")),
                    visitId: String(ev.visitId || ""),
                    eventType: String(ev.eventType || ""),
                    certainty: String(ev.certainty || ""),
                    timing: String(ev.timing || ""),
                    effectiveApprox: String(ev.effectiveApprox || ""),
                    note: String(ev.note || ""),
                    // Same rule as agent events: read path never synthesizes.
                    createdAt: String(ev.createdAt || "")
                  }))
              : []
          }))
      : [],
    summary: String(value.summary || ""),
    soapNotes: Array.isArray(value.soapNotes) ? value.soapNotes.map(normalizeSoapNote) : [],
    // Codex audit HIGH#6: the READ path never synthesizes timestamps. A legacy
    // record missing createdAt/updatedAt keeps "" — C2a's latest-wins and the
    // C2b migration read these fields, and a load-time new Date() would
    // disguise "unknown age" as "newest". Write sites stamp explicitly.
    createdAt: String(value.createdAt || ""),
    updatedAt: String(value.updatedAt || "")
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
    // tcmPattern is UNCHANGED — same key, same free-text meaning it has
    // always had. Relabelled in the UI as "TCM diagnosis notes" now that
    // tcmPatternSelections below is the structured primary/secondary source,
    // but the field itself is neither renamed nor auto-populated. Legacy
    // prose here is never touched, never parsed, never destroyed.
    tcmPattern: String(value.tcmPattern || ""),
    pathomechanism: String(value.pathomechanism || ""),
    treatmentPrinciple: String(value.treatmentPrinciple || ""),
    modalities: String(value.modalities || ""),
    // AVS v3 Phase C(§2.5):結構化療法記錄,modality.* id 陣列 —— Checkout
    // 的權威來源(§7 順位 1)。自由文字 modalities 欄位原樣保留,legacy note
    // 靠文字推斷 fallback(js/avs.js resolveModalities),兩者永不互相改寫。
    modalitiesPerformed: normalizeStringList(value.modalitiesPerformed),
    advice: String(value.advice || ""),
    westernConditionLinks: normalizeStringList(value.westernConditionLinks),
    easternDiseaseLinks: normalizeStringList(value.easternDiseaseLinks),
    // TCM pattern primary/secondary reconciliation (2026-08-09). Maps
    // directly onto visit_tcm_patterns(pattern_id, is_primary) — one array
    // entry per future row, no schema change needed. Distinct name from
    // BOTH tcmPattern (free text, unrelated shape) and the CASE-level
    // case.tcmPatterns (plain string[] of pattern labels, a different level
    // of the object tree entirely) — reusing either name here would recreate
    // the exact ambiguity this batch exists to resolve.
    //
    // Presence-vs-absence matters: an explicit [] (the field was touched by
    // the new UI and left empty) is respected as-is. Only a genuinely ABSENT
    // key (value.tcmPatternSelections === undefined — i.e. this note has
    // never been through the new UI) falls back to deriving from the legacy
    // tcmPatternLinks list, with EVERY derived entry isPrimary:false. No
    // primary is ever guessed — an old multi-pattern note that never
    // recorded which was primary keeps that uncertainty (docs/
    // SOAP_FOLLOWUP_TRACKING_AUDIT.md's own instruction).
    tcmPatternSelections: Array.isArray(value.tcmPatternSelections)
      ? value.tcmPatternSelections
          .filter((e) => e && typeof e.patternId === "string" && e.patternId)
          // D17 §4 additions, both additive and never derived: role (MVP
          // vocabulary primary|secondary; root|branch reserved) and
          // confidence. role is NOT back-filled from isPrimary here — an old
          // entry that only recorded isPrimary keeps role:"" (the normalizer
          // records, it does not infer). Write-time code that SETS role must
          // keep isPrimary in agreement (role==='primary' ⇔ isPrimary), so
          // every legacy reader of isPrimary stays correct.
          .map((e) => ({
            patternId: String(e.patternId),
            isPrimary: !!e.isPrimary,
            role: String(e.role || ""),
            confidence: String(e.confidence || ""),
            // Codex HIGH#1 ruling: visit_tcm_patterns.note maps to this key
            // (per-selection clinical note), ADDed to the contract rather than
            // dropped from the schema. No form field yet — carried like
            // confidence until the UI grows one.
            note: String(e.note || "")
          }))
      : normalizeStringList(value.tcmPatternLinks).map((id) => ({ patternId: id, isPrimary: false, role: "", confidence: "", note: "" })),
    // D17 §4 — differential candidates are NOT working patterns. Patterns the
    // clinician CONSIDERED this visit (possibly ruled out) live here; adopted
    // conclusions live in tcmPatternSelections above. Same id in both =
    // considered, then adopted — legal and meaningful. Maps to
    // visit_pattern_differentials.
    patternDifferentials: Array.isArray(value.patternDifferentials)
      ? value.patternDifferentials
          .filter((e) => e && typeof e.patternId === "string" && e.patternId)
          .map((e) => ({ patternId: String(e.patternId), ruledOut: !!e.ruledOut, note: String(e.note || "") }))
      : [],
    // Kept for every existing reader that resolves patterns off this flat
    // list (window.AcuTingCases.usedIn's reverse index, the SOAP card's
    // "Pattern links" row, Last Visit at a Glance's fallback) — now DERIVED
    // from tcmPatternSelections on every save (see saveSoapFromForm) rather
    // than typed into its own form field. The field itself, and every
    // existing reader of it, is otherwise untouched.
    tcmPatternLinks: normalizeStringList(value.tcmPatternLinks),
    safetyFlagLinks: normalizeStringList(value.safetyFlagLinks),
    subjective: String(value.subjective || ""),
    // Gate 3 (9/5 sym.* structured capture path): vocabulary = data/symptoms/
    // symptoms.json (102 sym.* records), picker wired the same way
    // easternDiseaseLinks reads tdisRegistry. subjective free text is
    // untouched — this is an additive structured field, not a replacement.
    symptomLinks: normalizeStringList(value.symptomLinks),
    objective: String(value.objective || ""),
    assessment: String(value.assessment || ""),
    plan: String(value.plan || ""),
    pointsUsed: String(value.pointsUsed || ""),
    acupointLinks: normalizeStringList(value.acupointLinks),
    retentionMinutes: value.retentionMinutes ? Number(value.retentionMinutes) : "",
    technique: String(value.technique || ""),
    // STRICTA 2010 item 2 needling parameters (academic-readiness batch,
    // pre-9/01 freeze). Flat scalars beside the needling fields that already
    // existed (pointsUsed/acupointLinks = 2b, retentionMinutes = 2f,
    // technique = free text) — these five complete the checklist: 2a needle
    // count, 2c depth, 2d response sought (de qi), 2e stimulation, 2g needle
    // type/size. "" = not recorded (D4: distinct from zero/none — a visit
    // with no needling keeps "" everywhere, it does not claim needleCount 0).
    // deqiResponse vocabulary: ''|'obtained'|'partial'|'not_obtained'|
    // 'not_sought'; needleStimulation: ''|'manual'|'electro'|'none'. Free-
    // text where STRICTA itself is free-text (depth varies per point; type
    // is gauge×length+material). No form fields yet — carried like
    // tcmPatternSelections.note until the UI grows them.
    needleCount: (value.needleCount === 0 || value.needleCount) ? Number(value.needleCount) : "",
    needleDepthText: String(value.needleDepthText || ""),
    deqiResponse: String(value.deqiResponse || ""),
    needleStimulation: String(value.needleStimulation || ""),
    needleTypeText: String(value.needleTypeText || ""),
    formulaHerbs: String(value.formulaHerbs || ""),
    formulaLinks: normalizeStringList(value.formulaLinks),
    // Gate 3 (9/5 herb.* structured capture path): vocabulary = herb canon
    // (358 herb.* records), picker wired the same way formulaLinks reads the
    // formula library. formulaHerbs free text and linkifyFormulaHerbs()
    // fuzzy matching are both untouched — herbLinks is an additive
    // structured supplement, not a replacement.
    herbLinks: normalizeStringList(value.herbLinks),
    westernMeds: String(value.westernMeds || ""),
    medicationLinks: normalizeStringList(value.medicationLinks),
    outcomes: String(value.outcomes || ""),
    outcomeMetricLinks: normalizeStringList(value.outcomeMetricLinks),
    outcomeVerdict: OUTCOME_VERDICTS[value.outcomeVerdict] ? value.outcomeVerdict : "",   // LL2
    // Structured outcome metric proof-of-concept (2026-08-09,
    // docs/SOAP_FOLLOWUP_TRACKING_AUDIT.md §9 ranked item #2). ONE
    // {metricId, valueNumber} record per structured metric actually
    // measured this visit, metricId always a real id from
    // data/clinical_cases/outcome_metrics.json. Deliberately NOT a fixed
    // set of named scalar fields (painScore/sleepQuality/...) — the whole
    // point of this shape is that a future metric is one more entry
    // through the same setOutcomeMetricValue() upsert helper, not a new
    // normalizer line + a new form field wired by hand for each one.
    // outcomeMetricLinks above is UNCHANGED and UNTOUCHED by this: it stays
    // free text, never auto-parsed into this array (explicit requirement —
    // "pain 7->4" prose is not a measurement record).
    outcomeMetrics: Array.isArray(value.outcomeMetrics)
      ? value.outcomeMetrics
          .filter((m) => m && typeof m.metricId === "string" && m.metricId && Number.isFinite(Number(m.valueNumber)))
          // relatedSymId (D17 §3): optional symptom anchor for this
          // measurement — sym.* and metric.* are complementary namespaces,
          // never competing. "" when the metric has no symptom anchor
          // (routine vitals) or predates the field. Maps to
          // visit_outcomes.related_sym_id.
          .map((m) => ({ metricId: String(m.metricId), valueNumber: Number(m.valueNumber), relatedSymId: String(m.relatedSymId || "") }))
      : [],
    // SOAP/Follow-up audit (2026-08-09): nullable, never fabricated. "" (not
    // 0) when absent — matches cases.baselineSeverity's D4-style distinction
    // between "not answered" and "answered zero".
    // D17 — per-VISIT observed lifestyle behavior rows (life.*). The
    // trajectory (sleep 5h → 6h → 7h) IS the rows across visits; "current" is
    // simply the latest visit's row, never an overwrite of history (V2 §18).
    // valueNumber nullable "" — "not measured" stays distinct from zero (D4).
    // HARD RULE (D17 §6): observations only. No code path may derive a
    // pattern/tdis from these rows — TCM interpretation is typed by the
    // practitioner in Assessment. Maps to visit_lifestyle_factors.
    lifestyleFactors: Array.isArray(value.lifestyleFactors)
      ? value.lifestyleFactors
          .filter((f) => f && (f.factorId || f.nameText))
          .map((f) => ({
            id: String(f.id || createId("lifefac")),
            factorId: String(f.factorId || ""),            // life.* (hierarchical ok)
            nameText: String(f.nameText || ""),
            valueNumber: (f.valueNumber === 0 || f.valueNumber) ? Number(f.valueNumber) : "",
            unit: String(f.unit || ""),
            valueText: String(f.valueText || ""),
            frequencyText: String(f.frequencyText || ""),
            changeSinceLast: String(f.changeSinceLast || ""),
            notes: String(f.notes || "")
          }))
      : [],
    // D17 — adverse events / treatment tolerance, linked to the visit where
    // REPORTED (may be the visit after the causing treatment — onsetText
    // carries that). Maps to visit_adverse_events.
    adverseEvents: Array.isArray(value.adverseEvents)
      ? value.adverseEvents
          .filter((a) => a && (a.eventId || a.nameText))
          .map((a) => ({
            id: String(a.id || createId("advevt")),
            eventId: String(a.eventId || ""),              // adverse_event.*
            nameText: String(a.nameText || ""),
            interventionType: String(a.interventionType || ""),
            modalityId: String(a.modalityId || ""),        // modality.*
            interventionRefId: String(a.interventionRefId || ""),
            severity: String(a.severity || ""),            // 'mild'|'moderate'|'severe'
            onsetText: String(a.onsetText || ""),
            status: String(a.status || ""),                // 'patient_reported'|'observed'
            resolutionStatus: String(a.resolutionStatus || ""),
            resolvedDate: String(a.resolvedDate || ""),
            notes: String(a.notes || "")
          }))
      : [],
    // AVS v3 Phase B(§2.4/§8):Visit-owned 診後摘要 snapshot 陣列。
    // PASS-THROUGH ON PURPOSE:finalized/superseded snapshot 是不可變歷史
    // 文件,normalizer 絕不重塑/補欄/剝欄它們的內容 —— 只過濾掉根本不是
    // 物件的殘渣。狀態機與唯一認可的變更路徑在 js/avs.js(upsertDraft/
    // finalizeSnapshot/createCorrectionDraft),歷史不變量由
    // AcuTingAVS.checkAvsInvariants + E2E(scripts/test-avs-checkout.js)把關。
    avsSnapshots: Array.isArray(value.avsSnapshots)
      ? value.avsSnapshots.filter((s) => s && typeof s === "object" && s.id)
      : [],
    effectDurationDays: (value.effectDurationDays === 0 || value.effectDurationDays) ? Number(value.effectDurationDays) : "",
    referralOrSupervisorQuestion: String(value.referralOrSupervisorQuestion || ""),
    followUp: String(value.followUp || ""),
    // CARE checklist item 12 — the patient's own words on how they are doing
    // and what the episode means to them, captured per visit. This is the
    // PATIENT's perspective verbatim/paraphrased, never the practitioner's
    // assessment restated (that lives in assessment above). Academic-
    // readiness batch, pre-9/01 freeze; no form field yet.
    patientPerspective: String(value.patientPerspective || ""),
    // LL1 按語: optional structured reflection (Learning Loop track)
    differentialConsidered: String(value.differentialConsidered || ""),
    reflection: String(value.reflection || ""),
    ifIneffectivePlan: String(value.ifIneffectivePlan || ""),
    // Codex audit HIGH#6: the READ path never synthesizes timestamps. A legacy
    // record missing createdAt/updatedAt keeps "" — C2a's latest-wins and the
    // C2b migration read these fields, and a load-time new Date() would
    // disguise "unknown age" as "newest". Write sites stamp explicitly.
    createdAt: String(value.createdAt || ""),
    updatedAt: String(value.updatedAt || "")
  };
}

// Structured outcome metric proof-of-concept (2026-08-09) — upsert-by-id
// helpers for the note.outcomeMetrics array. Every future metric field
// (sleep quality, stress, mood, ...) reads/writes through these same two
// functions with its own metricId; nothing here is pain-score-specific.
function getOutcomeMetricValue(list, metricId) {
  const found = (list || []).find((m) => m.metricId === metricId);
  return found ? found.valueNumber : "";
}

function setOutcomeMetricValue(list, metricId, value) {
  // Preserve relatedSymId (D17 §3) across upserts — rebuilding the entry from
  // scratch here would silently strip the symptom anchor every time the
  // number is re-entered.
  const existing = (list || []).find((m) => m.metricId === metricId);
  const withoutThisMetric = (list || []).filter((m) => m.metricId !== metricId);
  if (value === "" || value === null || value === undefined) return withoutThisMetric;
  return [...withoutThisMetric, { metricId, valueNumber: Number(value), relatedSymId: String(existing?.relatedSymId || "") }];
}

// Metadata-driven numeric outcome metric renderer (2026-08-09) — prototype
// covering exactly the two metrics already proven in 63f0896/eda9819
// (metric.pain_score, metric.sleep_hours). Removes the per-metric
// hydration/validation/display code that pattern would have repeated 20
// more times. NUMERIC_OUTCOME_METRIC_CONFIG itself is declared near
// OUTCOME_VERDICTS at the top of the file (TDZ: render() runs at top-level
// page-load time, before this point in the file) — see that declaration's
// comment for why the config lives in JS rather than
// data/clinical_cases/outcome_metrics.json.
// 表格那一格塞不下整串作者名。壓成「Farrar 2001」這種可以直接去查的短引用；
// 完整書目留在 outcome_metrics.json，這裡只要能讓人認出是哪一篇。
function shortCitation(name) {
  const s = String(name || "").trim();
  if (!s) return "";
  const year = (s.match(/\b(1[89]|20)\d{2}\b/) || [])[0];
  const lead = s.split(/[,.]/)[0].trim();
  if (!lead) return year || "";
  return year ? `${lead} ${year}` : lead;
}

function getOutcomeMetricDef(metricId) {
  const records = globalThis.ACUTING_KNOWLEDGE?.outcomeMetrics?.records || [];
  return records.find((r) => r.id === metricId) || null;
}

function outcomeMetricLabel(metricId) {
  const def = getOutcomeMetricDef(metricId);
  if (!def) return metricId;
  return modeText(`${def.label_zh || def.name} ${def.label_en || ""}`.trim(), def.label_en || def.name);
}

// Chinese-only label minus its own parenthetical explanation (pain_score's
// label_zh is "疼痛(0 無痛 / 10 最痛)") — for validation-error sentences,
// which state the range themselves and have always been Chinese-only here
// (matches every other alert() in this file, bilingual or not).
function outcomeMetricShortLabel(metricId) {
  const def = getOutcomeMetricDef(metricId);
  const zh = def ? (def.label_zh || def.name) : metricId;
  return zh.replace(/[（(][^）)]*[）)]/g, "").trim();
}

// FIX D (Dry Clinic #15) — outcome tracking panel row label. Some
// label_zh/label_en values carry an internal semantic note AFTER the scale
// parenthetical (e.g. mood: "情緒(0 最差 / 10 最好)。與 stress_level 分開:
// 壓力是外在負荷,情緒是主觀狀態") — useful as a vocabulary-authoring
// comment, not something a clinician scanning Baseline/Today/Change/Trend
// needs. outcome_metrics.json has no separate short-name field (checked —
// only label_zh/label_en/name, no name_zh), so per spec: truncate at the
// first "(" in each language independently, same idea as
// outcomeMetricShortLabel's regex-strip above but (a) bilingual/mode-aware
// like outcomeMetricLabel, since this is a read-only display label, and
// (b) a hard truncation rather than a strip-all-parens, so trailing prose
// after the parenthetical is also dropped, not just the parenthetical
// itself. Kept as its own function rather than changing
// outcomeMetricShortLabel or outcomeMetricLabel in place — those still
// serve validation-error text and the SOAP form's own input labels/Last
// Visit at a Glance card respectively, unchanged. Baseline/Today/Change/
// Trend values themselves are untouched — only this row's label text.
function outcomeMetricPanelLabel(metricId) {
  const def = getOutcomeMetricDef(metricId);
  if (!def) return metricId;
  const truncateAtParen = (s) => {
    const str = String(s || "");
    const i = str.search(/[（(]/);
    return (i === -1 ? str : str.slice(0, i)).trim();
  };
  const zh = truncateAtParen(def.label_zh || def.name);
  const en = truncateAtParen(def.label_en || "");
  return modeText(`${zh} ${en}`.trim(), en || def.name);
}

// One-fact-one-home resolution for a metric that may still have a legacy
// direct-field representation (only metric.effect_duration_days does, via
// cfg.legacyField). Canonical (outcomeMetrics[]) wins whenever it exists —
// a deterministic, always-applied rule, not a per-case guess. When BOTH
// exist and disagree, that is surfaced (conflict:true) rather than the
// legacy value being silently discarded; when only the legacy field has
// ever been set (an old note nobody has resaved since this batch), it is
// read as-is so historical values are never lost or blanked.
function resolveNumericMetricValue(note, cfg) {
  const canonical = getOutcomeMetricValue(note.outcomeMetrics, cfg.metricId);
  const hasCanonical = canonical === 0 || !!canonical;
  if (!cfg.legacyField) return { value: canonical, hasValue: hasCanonical, conflict: false };
  const legacy = note[cfg.legacyField];
  const hasLegacy = legacy === 0 || !!legacy;
  if (hasCanonical && hasLegacy) {
    return { value: canonical, hasValue: true, conflict: Number(canonical) !== Number(legacy), legacyValue: legacy };
  }
  if (hasCanonical) return { value: canonical, hasValue: true, conflict: false };
  if (hasLegacy) return { value: legacy, hasValue: true, conflict: false };
  return { value: "", hasValue: false, conflict: false };
}

// Renders one <label><input></label> per configured metric into the given
// container, values pre-filled from `note` (canonical metric, or the
// legacy field for the one metric still carrying one — see
// resolveNumericMetricValue). Rebuilt every dialog open (like
// renderRaceEthnicityOptions) — cheap, and always exactly right for
// whichever note is being edited.
function renderNumericOutcomeMetricInputs(note) {
  const container = document.querySelector("#structuredOutcomeMetrics");
  if (!container) return;
  container.innerHTML = NUMERIC_OUTCOME_METRIC_CONFIG.map((cfg) => {
    const def = getOutcomeMetricDef(cfg.metricId);
    const unitNote = def?.unit ? ` <small>${escapeHtml(def.unit)}</small>` : "";
    const resolved = resolveNumericMetricValue(note, cfg);
    const attrs = [
      `type="number"`,
      `name="${escapeAttribute(cfg.metricId)}"`,
      `min="${cfg.min}"`,
      cfg.max != null ? `max="${cfg.max}"` : "",
      `step="${cfg.integer ? "1" : "any"}"`,
      `value="${resolved.hasValue ? escapeAttribute(String(resolved.value)) : ""}"`,
      `placeholder="${escapeAttribute(cfg.placeholderHint ? `${cfg.placeholderHint}（未測量可留空 leave blank if not measured）` : "未測量可留空 leave blank if not measured")}"`,
    ].filter(Boolean).join(" ");
    const conflictWarning = resolved.conflict
      ? `<small class="metric-conflict-warning">⚠ 與舊欄位不一致：舊值 ${escapeHtml(String(resolved.legacyValue))}，目前顯示新值 ${escapeHtml(String(resolved.value))}（儲存後舊欄位會清除）。Conflicts with the legacy field — old ${escapeHtml(String(resolved.legacyValue))}, showing new ${escapeHtml(String(resolved.value))}.</small>`
      : "";
    return `<label>${escapeHtml(outcomeMetricLabel(cfg.metricId))}${unitNote}<small>${escapeHtml(cfg.metricId)}</small><input ${attrs} />${conflictWarning}</label>`;
  }).join("");
}

// Config-driven validate-and-set for every configured numeric metric.
// `formValues` is the plain object saveSoapFromForm already builds from
// FormData — each metric's input name IS its metricId, so formValues[
// cfg.metricId] is exactly its raw string. Returns {metrics, legacyClears}
// on success or {error} on the FIRST invalid field (reject, never clamp)
// so the caller can alert and abort the save exactly like the two
// hand-written blocks did. legacyClears is {fieldName: ""} for every
// configured metric that has a legacyField — realizing "one fact, one
// home" going forward: any save (new or edited) fully migrates that
// metric to outcomeMetrics[] and blanks the old column, so only notes
// nobody has touched since this batch still carry a legacy value.
function computeNumericOutcomeMetrics(formValues, currentMetrics) {
  let metrics = currentMetrics || [];
  const legacyClears = {};
  for (const cfg of NUMERIC_OUTCOME_METRIC_CONFIG) {
    const raw = String(formValues[cfg.metricId] || "").trim();
    if (raw) {
      const shapeOk = cfg.integer ? /^\d+$/.test(raw) : /^\d+(\.\d+)?$/.test(raw);
      const num = Number(raw);
      const rangeOk = num >= cfg.min && (cfg.max == null || num <= cfg.max);
      if (!shapeOk || !rangeOk) {
        const rangeText = cfg.max != null ? `${cfg.min}–${cfg.max}` : `${cfg.min} 以上`;
        const shapeText = cfg.integer ? "整數" : "數字，可含小數";
        return { error: `${outcomeMetricShortLabel(cfg.metricId)}須為 ${rangeText} 的${shapeText}（可留空 = 未測量）。` };
      }
      // SOL R-2(瀏覽器實測確認):存檔端過去只有 regex + range,沒有量級上界,
      // 而 sleep_hours 的 max 是 null。於是超過 MAX_SAFE_INTEGER 的輸入會被
      // **靜默改成另一個數字**再存下去 —— 實測 9007199254740993 → …992、
      // 99999999999999999999 → 1e20、24 個 9 → 1e+24。傳輸層早就擋這些
      // (共用驗證器的 magnitude 規則),兩層卻不同尺。
      //
      // 這裡改用共用模組的同一把尺:值必須落在安全整數範圍內,而且「存下去的
      // 數字」與「醫師打的字」必須是同一個值(canonicalDecimal 比較的是值,
      // 不是寫法,所以 7.50 / 07.5 這種寫法差異不受影響)。
      const V = globalThis.AcuTingPrevisitValidator;
      if (Math.abs(num) > Number.MAX_SAFE_INTEGER) {
        return { error: `${outcomeMetricShortLabel(cfg.metricId)}的數值超出可精確表示的範圍（|值| 須 ≤ ${Number.MAX_SAFE_INTEGER}）——存下去會變成另一個數字。` };
      }
      if (V && typeof V.canonicalDecimal === "function") {
        const typedCanonical = V.canonicalDecimal(raw);
        const storedCanonical = V.canonicalDecimal(String(num));
        if (typedCanonical !== null && storedCanonical !== null && typedCanonical !== storedCanonical) {
          return { error: `${outcomeMetricShortLabel(cfg.metricId)}存下去的數值會與您輸入的不同（${raw} → ${num}），請確認後重新輸入。` };
        }
      }
    }
    metrics = setOutcomeMetricValue(metrics, cfg.metricId, raw);
    if (cfg.legacyField) legacyClears[cfg.legacyField] = "";
  }
  return { metrics, legacyClears };
}

// Single-value display formatter (2026-08, Outcome Tracking v1 extraction —
// byte-identical to formatNumericOutcomeMetrics's old inline expression,
// pulled out only so the new Baseline/Today columns below can render a
// value exactly the same way the SOAP card already does, instead of a
// second hand-written copy of "bounded shows /max, unbounded shows its
// unit string" that could silently drift from this one over time).
function formatMetricNumberDisplay(cfg, value) {
  const def = getOutcomeMetricDef(cfg.metricId);
  if (cfg.max != null) return `${value}/${cfg.max}`;
  if (def?.unit === "hours") return `${value} h`;
  if (def?.unit) return `${value} ${def.unit}`;
  return `${value}`;
}

// Shared display formatter — SOAP card and Last Visit at a Glance both call
// this instead of each hand-formatting pain/sleep/effect-duration
// separately. [label, valueText] pairs, one per metric that actually has a
// value (legacy-only historical notes included, via
// resolveNumericMetricValue — never a fabricated "0", never a blanked
// historical value). A conflicting metric shows its resolved (canonical)
// value with a small ⚠ suffix rather than two rows — "no duplicate rows"
// — the full explanation lives on the form, where it can actually be acted
// on.
function formatNumericOutcomeMetrics(note) {
  return NUMERIC_OUTCOME_METRIC_CONFIG.map((cfg) => {
    const resolved = resolveNumericMetricValue(note, cfg);
    if (!resolved.hasValue) return null;
    const valueText = formatMetricNumberDisplay(cfg, resolved.value) + (resolved.conflict ? " ⚠" : "");
    // FIX D 延伸(Dry Clinic #15 實測):glance 卡同樣是唯讀掃視面,
    // 用 panel 短標籤;完整語意註解留在 SOAP 表單輸入標籤(5661)那裡。
    return [outcomeMetricPanelLabel(cfg.metricId), valueText];
  }).filter(Boolean);
}

// Outcome Tracking v1 (2026-08, CG8 — docs/CLINICAL_GRAPH_TRACK.md §3):
// Baseline / Today / Change / Trend, read-only and fully derived from
// existing note.outcomeMetrics[] data. No new persisted field, no schema
// change, no chart, no trend snapshot stored anywhere.
//
// Case-scoped, per CG8's own wording ("該病程首診值,不是該病人首診值"):
// Baseline is THIS case's chronologically first visit, Today is THIS
// case's chronologically latest visit. If visit 1 didn't measure a metric,
// baseline for that metric is permanently "—" for this case — never
// silently backfilled from a later visit, and never carried forward from
// any other case even if it shares a patientCode.
//
// No LOCF anywhere: Today reads only the latest visit's own resolved
// value; if the latest visit didn't measure the metric, Today is "—", full
// stop, even if an earlier visit had a value.
//
// Trend is the CG8 first-phase contract exactly: ↑/↓/→ per consecutive
// transition in the MEASURED sequence only (unmeasured visits are skipped
// when building that sequence, never given a fabricated arrow) — the ARROW
// itself still means nothing but raw numeric movement, never "improved/
// worsened" wording, because direction_good varies per metric and some are
// explicitly individualized (bowel_frequency): an arrow can't honestly claim
// a verdict for those.
//
// 2026-08-25(dry run,Ting 現場發現):Baseline/Today/Change/Trend 這張表混
// 了「遞增為好」跟「遞減為好」的 metric 在同一欄,箭頭上上下下但意義不一致,
// 一眼掃過去看不出「這是變好還是變壞」。加 outcomeChangeGoodness() 只替
// Change/Trend 的顯示上色(綠=朝 direction_good 那個方向動、紅=反方向、
// 無色=direction_good 是 individualized/contextual/未標註,系統本來就不該
// 替這類 metric 下判斷)——箭頭本身的「原始數字動向」意義不變,顏色是額外
// 疊加的判讀層,跟 renderVisitBrief 的 brief-good/brief-bad 用同一套色碼,
// 兩個面板視覺一致。
function computeOutcomeTrackingRows(item) {
  const chronological = [...(item.soapNotes || [])].sort((a, b) => {
    const dateCompare = String(a.visitDate || "").localeCompare(String(b.visitDate || ""));
    if (dateCompare) return dateCompare;
    return Number(a.visitNumber || 0) - Number(b.visitNumber || 0);
  });
  if (!chronological.length) return [];

  const firstNote = chronological[0];
  const latestNote = chronological[chronological.length - 1];

  return NUMERIC_OUTCOME_METRIC_CONFIG.map((cfg) => {
    // Row visibility rule: show this metric only if it was measured on AT
    // LEAST ONE visit anywhere in the case — otherwise this would be an
    // 11-row wall of dashes on every new case. This is independent of
    // whether baseline/today specifically have a value (they can still be
    // "—" individually below even when the row is shown).
    const measured = chronological
      .map((note) => resolveNumericMetricValue(note, cfg))
      .filter((r) => r.hasValue)
      .map((r) => Number(r.value));
    if (!measured.length) return null;

    const baselineResolved = resolveNumericMetricValue(firstNote, cfg);
    const todayResolved = resolveNumericMetricValue(latestNote, cfg);
    const baseline = baselineResolved.hasValue ? Number(baselineResolved.value) : null;
    const today = todayResolved.hasValue ? Number(todayResolved.value) : null;
    // Floating-point cleanup only (e.g. 7.3 - 6.1 artifacts) — never a
    // clinical rounding decision; sleep_hours is the only decimal metric
    // today and this preserves whatever precision was actually entered.
    const change = (baseline != null && today != null) ? Math.round((today - baseline) * 1e6) / 1e6 : null;

    // One transition per consecutive pair in the measured-only sequence.
    // A single-visit case (or a metric measured on only one visit) has
    // measured.length === 1 → trend stays null → displayed as "—", per
    // CG8's "fewer than 2 measured observations" rule.
    let trend = null;
    if (measured.length >= 2) {
      trend = measured.slice(1).map((v, i) => {
        const prev = measured[i];
        if (v > prev) return "↑";
        if (v < prev) return "↓";
        return "→";
      }).join("");
    }

    return { cfg, baseline, today, change, trend };
  }).filter(Boolean);
}

// change 是 (today - baseline)。true=朝 direction_good 那個方向動(好事)、
// false=反方向(壞事)、null=direction_good 是 individualized/contextual/
// 未標註,或 change 本身是 null(沒有兩個測量點可比)——這三種都不下判斷,
// 顯示端一律不上色。跟 renderVisitBrief 裡內嵌的同款邏輯是同一個判斷式,
// 這裡抽成獨立函式給 Outcome Tracking 面板重用,兩處不會各自長出一套微妙
// 不同的判斷(例如一邊用 >= 一邊用 >)。
function outcomeChangeGoodness(def, change) {
  if (change == null || !def) return null;
  if (def.direction_good === "decrease") return change < 0;
  if (def.direction_good === "increase") return change > 0;
  return null;
}

function renderOutcomeTrackingPanel(item) {
  const rows = computeOutcomeTrackingRows(item);
  if (!rows.length) {
    return `
      <div class="timeline-head">
        <strong>Outcome Tracking</strong>
      </div>
      <div class="case-empty">尚無結構化 outcome 數值。No structured numeric outcome metrics recorded in this case yet.</div>
    `;
  }
  const fmt = (cfg, value) => (value == null ? "—" : formatMetricNumberDisplay(cfg, value));
  const fmtChange = (value) => {
    if (value == null) return "—";
    if (value > 0) return `+${value}`;
    return `${value}`;
  };
  return `
    <div class="timeline-head">
      <strong>Outcome Tracking</strong>
      <small class="timeline-date">Baseline = 本病程首診 · Today = 本病程最新一診 · ${rows.length} 項有記錄</small>
    </div>
    <div class="outcome-tracking-wrap">
      <table class="outcome-tracking-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Baseline</th>
            <th>Today</th>
            <th>Change</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => {
            const def = getOutcomeMetricDef(row.cfg.metricId);
            const directionHint = def?.direction_good && OUTCOME_DIRECTION_HINT_LABELS[def.direction_good]
              ? `<small class="direction-hint">${escapeHtml(OUTCOME_DIRECTION_HINT_LABELS[def.direction_good])}</small>`
              : "";
            // sourced 的 badge 直接引用來源名稱，因為那筆判讀是可查證的；
            // 另外兩態走固定措辭。未標註狀態的 metric 不畫 badge——寧可空白，
            // 也不要用一個看起來像結論的標籤去蓋住「還沒判斷過」。
            let interpHint = "";
            if (def?.interpretation_status === "sourced" && def.source?.name) {
              interpHint = `<small class="interp-hint interp-sourced" title="${escapeHtml(def.interpretation_en || "")}">判讀依據：${escapeHtml(shortCitation(def.source.name))}</small>`;
            } else if (def && OUTCOME_INTERPRETATION_BADGES[def.interpretation_status]) {
              const b = OUTCOME_INTERPRETATION_BADGES[def.interpretation_status];
              interpHint = `<small class="interp-hint ${b.cls}" title="${escapeHtml(def.interpretation_note_zh || "")}">${escapeHtml(b.text)}</small>`;
            }
            // 第二個軸(D20):沒有改善閾值,不代表沒有具名的正常範圍可以參考
            // (例如 FIGO 對月經週期的正常範圍)。跟 interpHint 分開畫,
            // 不要合成一行 —— 合成會讓讀的人把「有範圍」誤讀成「有閾值」。
            let refRangeHint = "";
            if (def?.interpretation_status !== "sourced" && def?.reference_range?.source?.name && def.reference_range.scope) {
              const rr = def.reference_range;
              const rrText = rr.text_zh || rr.text_en || "";
              refRangeHint = `<small class="interp-hint interp-refrange" title="${escapeHtml(rrText)}${rr.scope ? "\n適用範圍：" + escapeHtml(rr.scope) : ""}">參考範圍：${escapeHtml(shortCitation(rr.source.name))}</small>`;
            }
            const goodness = outcomeChangeGoodness(def, row.change);
            const goodnessCls = goodness === true ? "outcome-good" : goodness === false ? "outcome-bad" : "";
            return `<tr>
              <td>${escapeHtml(outcomeMetricPanelLabel(row.cfg.metricId))}${directionHint}${interpHint}${refRangeHint}</td>
              <td>${escapeHtml(fmt(row.cfg, row.baseline))}</td>
              <td>${escapeHtml(fmt(row.cfg, row.today))}</td>
              <td class="${goodnessCls}">${escapeHtml(fmtChange(row.change))}</td>
              <td class="${goodnessCls}">${escapeHtml(row.trend || "—")}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// Phase D batch 1 (docs/SPRINT_2026-08-12_BRIEF.md Phase D): case-level Meds &
// Supplements ledger UI over agentExposures[] (D17 §5 — ONE longitudinal
// timeline per agent, not a per-visit snapshot). Read side only queries the
// store's pure helpers (getCurrentExposures/getExposureTimeline); write side
// (openAgentExposureEditor/saveAgentExposureFromForm/promptAgentExposureAction)
// goes exclusively through AcuTingClinicalStore.applyExposureChange — never a
// direct row/events mutation (audit B-1 invariant). Legacy currentMeds /
// westernMeds / medicationLinks are untouched (M-3: the two tracks coexist).
// (宣告移至檔頭 selectedCaseId 附近 —— 初始 render() 在第 ~1200 行就會走到
// renderAgentExposuresPanel,const 留在這裡是 TDZ:首個病例帶 agentExposures
// 時開機即崩。AVS v3 驗證走查時實測抓到,非新引入。)
// (宣告已前移至檔頭 —— 見 AGENT_EXPOSURE_TYPE_LABELS 註解,TDZ 修正)

// Phase D batch 2 (docs/SPRINT_2026-08-12_BRIEF.md task 2): visit-level
// Lifestyle / Adverse events repeatable rows inside the SOAP dialog, writing
// note.lifestyleFactors[] / note.adverseEvents[] (D17 §6/§4 shapes owned by
// normalizeSoapNote — this section only builds/reads the DOM rows, the
// normalizer still enforces the actual field shapes on save). Rows are
// DRAFT/editable/removable before save — the append-only rule applies to
// case-level exposure EVENTS (applyExposureChange), never to these visit
// rows. No code path here may turn a life.*/adverse_event.* selection into a
// pattern/tdis id (D17 §6 hard rule) — these functions only read/write the
// vocab id and free text the practitioner picked.
const REPEATABLE_ROW_OTHER_VALUE = "__other__";
// (宣告已前移至檔頭 boot-order 區 —— 見 AGENT_EXPOSURE_TYPE_LABELS 註解)
// (宣告已前移至檔頭 boot-order 區 —— 見 AGENT_EXPOSURE_TYPE_LABELS 註解)
// (宣告已前移至檔頭 boot-order 區 —— 見 AGENT_EXPOSURE_TYPE_LABELS 註解)

// Shared <select> option builder for the two vocab-backed pickers below.
// selectedValue is either a real vocab id, "" (nothing chosen yet), or
// REPEATABLE_ROW_OTHER_VALUE (an "other" row whose free-text name lives in
// nameText). A selectedValue that is none of those (a legacy id the current
// vocab file no longer lists) gets its own fallback <option> rather than
// silently resetting to blank — never lose a saved value on re-render.
function vocabSelectOptionsHtml(records, selectedValue, opts = {}) {
  const { includeOther = true, otherLabel = "其他 Other…", blankLabel = "—" } = opts;
  const list = records || [];
  const knownIds = new Set(list.map((r) => r.id));
  const blank = `<option value=""${selectedValue === "" ? " selected" : ""}>${escapeHtml(blankLabel)}</option>`;
  const known = list.map((r) => {
    const label = `${r.name_zh || ""} ${r.name_en || ""}`.trim() || r.id;
    return `<option value="${escapeAttribute(r.id)}"${selectedValue === r.id ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }).join("");
  const other = includeOther
    ? `<option value="${REPEATABLE_ROW_OTHER_VALUE}"${selectedValue === REPEATABLE_ROW_OTHER_VALUE ? " selected" : ""}>${escapeHtml(otherLabel)}</option>`
    : "";
  const isRecognized = selectedValue === "" || selectedValue === REPEATABLE_ROW_OTHER_VALUE || knownIds.has(selectedValue);
  const fallback = (!isRecognized && selectedValue)
    ? `<option value="${escapeAttribute(selectedValue)}" selected>${escapeHtml(selectedValue)}</option>`
    : "";
  return blank + known + other + fallback;
}

function lifestyleFactorRowHtml(row = {}) {
  const vocab = globalThis.ACUTING_KNOWLEDGE?.lifestyleFactorVocabulary?.records || [];
  const selectValue = row.factorId ? row.factorId : (row.nameText ? REPEATABLE_ROW_OTHER_VALUE : "");
  const isOther = selectValue === REPEATABLE_ROW_OTHER_VALUE;
  const matchedRecord = vocab.find((r) => r.id === row.factorId);
  const unitPlaceholder = matchedRecord?.value_hint_en || "";
  const hasValueNumber = row.valueNumber === 0 || !!row.valueNumber;
  return `
    <div class="lifestyle-factor-row" data-row-id="${escapeAttribute(row.id || "")}">
      <label>因子 Factor<select data-role="factorId">${vocabSelectOptionsHtml(vocab, selectValue)}</select></label>
      <label data-role="nameTextWrap"${isOther ? "" : " hidden"}>名稱 Name<input type="text" data-role="nameText" value="${escapeAttribute(row.nameText || "")}" placeholder="e.g. Screen time before bed" /></label>
      <label>數值 Value<input type="number" step="any" data-role="valueNumber" value="${hasValueNumber ? escapeAttribute(row.valueNumber) : ""}" /></label>
      <label>單位 Unit<input type="text" data-role="unit" value="${escapeAttribute(row.unit || "")}" placeholder="${escapeAttribute(unitPlaceholder)}" /></label>
      <label>頻率 Frequency<input type="text" data-role="frequencyText" value="${escapeAttribute(row.frequencyText || "")}" placeholder="daily / 3x week" /></label>
      <label>備註 Notes<input type="text" data-role="notes" value="${escapeAttribute(row.notes || "")}" /></label>
      <button type="button" class="ghost repeatable-row-remove" data-remove-row data-mode-text data-bilingual="移除" data-english="Remove">移除</button>
    </div>`;
}

function adverseEventRowHtml(row = {}) {
  const vocab = globalThis.ACUTING_KNOWLEDGE?.adverseEventVocabulary?.records || [];
  const modalityVocab = globalThis.ACUTING_KNOWLEDGE?.modalityVocabulary?.records || [];
  const selectValue = row.eventId ? row.eventId : (row.nameText ? REPEATABLE_ROW_OTHER_VALUE : "");
  const isOther = selectValue === REPEATABLE_ROW_OTHER_VALUE;
  const optionRow = (value, label, current) => `<option value="${value}"${current === value ? " selected" : ""}>${escapeHtml(label)}</option>`;
  return `
    <div class="adverse-event-row" data-row-id="${escapeAttribute(row.id || "")}">
      <label>事件 Event<select data-role="eventId">${vocabSelectOptionsHtml(vocab, selectValue)}</select></label>
      <label data-role="nameTextWrap"${isOther ? "" : " hidden"}>名稱 Name<input type="text" data-role="nameText" value="${escapeAttribute(row.nameText || "")}" /></label>
      <label>處置類型 Intervention<select data-role="interventionType">
        <option value=""${row.interventionType ? "" : " selected"}>—</option>
        ${Object.entries(ADVERSE_EVENT_INTERVENTION_LABELS).map(([v, l]) => optionRow(v, l, row.interventionType || "")).join("")}
      </select></label>
      <label>手法 Modality<select data-role="modalityId">${vocabSelectOptionsHtml(modalityVocab, row.modalityId || "", { includeOther: false, blankLabel: "—（選填）" })}</select></label>
      <label>嚴重度 Severity<select data-role="severity">
        <option value=""${row.severity ? "" : " selected"}>—</option>
        ${Object.entries(ADVERSE_EVENT_SEVERITY_LABELS).map(([v, l]) => optionRow(v, l, row.severity || "")).join("")}
      </select></label>
      <label>處理狀態 Resolution<select data-role="resolutionStatus">
        <option value=""${row.resolutionStatus ? "" : " selected"}>—</option>
        ${Object.entries(ADVERSE_EVENT_RESOLUTION_LABELS).map(([v, l]) => optionRow(v, l, row.resolutionStatus || "")).join("")}
      </select></label>
      <label>備註 Notes<input type="text" data-role="notes" value="${escapeAttribute(row.notes || "")}" /></label>
      <button type="button" class="ghost repeatable-row-remove" data-remove-row data-mode-text data-bilingual="移除" data-english="Remove">移除</button>
    </div>`;
}

// Rebuilt every dialog open (like renderNumericOutcomeMetricInputs) — always
// exactly matches whichever note is being edited (new note = []), which is
// what keeps saveSoapFromForm's DOM read below honest: the container never
// sits "un-rendered" while a saved note has rows, so collecting from it can
// never clobber a saved array with [] just because the section wasn't
// clicked into (SPRINT brief task 2's explicit clobber warning).
function renderLifestyleFactorRows(rows) {
  const container = document.querySelector("#lifestyleFactorRows");
  if (!container) return;
  container.innerHTML = (Array.isArray(rows) ? rows : []).map(lifestyleFactorRowHtml).join("");
  wireRepeatableRowContainer(container, "factorId");
}

function renderAdverseEventRows(rows) {
  const container = document.querySelector("#adverseEventRows");
  if (!container) return;
  container.innerHTML = (Array.isArray(rows) ? rows : []).map(adverseEventRowHtml).join("");
  wireRepeatableRowContainer(container, "eventId");
}

/* 鑑別診斷 patternDifferentials —— 「還考慮過哪些證型、排除了沒有」。
 *
 * 這一欄的資料契約(normalizeSoapNote)、正典 id、以及 localStorage→SQLite
 * 的欄位對照都早就存在,**只有輸入欄位從來沒做**。9/5 的 20 項裡它是唯一
 * 一個「契約齊備但 UI 完全沒有」的,所以那一格永遠是空的:CG 檢查表的
 * 「8b 鑑別思路」只能靠旁邊那個自由文字欄 differentialConsidered 撐著。
 *
 * 兩者不重複:自由文字是「為什麼」,這裡是**哪一個證型、有沒有被排除** ——
 * 只有後者能被 usedIn 反查與月審統計拿去用。
 *
 * 證型清單刻意用跟 patternPickerOptions 同一批來源(patternLibrary + 舊
 * conditions.tcm_patterns),否則這裡選出來的 id 會跟 tcmPatternSelections
 * 對不起來,反查就會斷。 */
function patternDifferentialVocab() {
  const k = globalThis.ACUTING_KNOWLEDGE || {};
  const lib = k.patternLibrary?.records || [];
  const old = k.conditions?.tcm_patterns || [];
  const seen = new Set();
  return [...lib, ...old].filter((p) => {
    if (!p || !p.id || seen.has(p.id)) return false;
    seen.add(p.id);
    return p.review_status !== "deprecated";
  });
}

function patternDifferentialRowHtml(row = {}) {
  return `
    <div class="pattern-differential-row" data-row-id="${escapeAttribute(row.id || "")}">
      <label>考慮過的證型 Pattern considered<select data-role="patternId">${vocabSelectOptionsHtml(patternDifferentialVocab(), row.patternId || "", { includeOther: false })}</select></label>
      <label class="pd-ruled">已排除 Ruled out<input type="checkbox" data-role="ruledOut"${row.ruledOut ? " checked" : ""} /></label>
      <label>理由 Note<input type="text" data-role="note" value="${escapeAttribute(row.note || "")}" placeholder="為什麼考慮、又為什麼排除" /></label>
      <button type="button" class="ghost repeatable-row-remove" data-remove-row data-mode-text data-bilingual="移除" data-english="Remove">移除</button>
    </div>`;
}

function renderPatternDifferentialRows(rows) {
  const container = document.querySelector("#patternDifferentialRows");
  if (!container) return;
  container.innerHTML = (Array.isArray(rows) ? rows : []).map(patternDifferentialRowHtml).join("");
  wireRepeatableRowContainer(container, "patternId");
}

function collectPatternDifferentialRows() {
  const container = document.querySelector("#patternDifferentialRows");
  if (!container) return [];
  return [...container.querySelectorAll(".pattern-differential-row")].map((row) => ({
    patternId: row.querySelector('[data-role="patternId"]').value || "",
    ruledOut: !!row.querySelector('[data-role="ruledOut"]').checked,
    note: (row.querySelector('[data-role="note"]').value || "").trim(),
  })).filter((e) => e.patternId);   // normalizeSoapNote 也會濾,這裡先濾避免空列進存檔
}

// Delegated listeners on the container survive innerHTML rebuilds (the
// container node itself is never replaced), so this only needs to attach
// once per container — the dataset flag makes repeated calls (every dialog
// open) idempotent.
function wireRepeatableRowContainer(container, selectRole) {
  if (container.dataset.wired) return;
  container.dataset.wired = "1";
  container.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("[data-remove-row]");
    if (removeBtn) removeBtn.closest(".lifestyle-factor-row, .adverse-event-row")?.remove();
  });
  container.addEventListener("change", (event) => {
    const select = event.target.closest(`[data-role="${selectRole}"]`);
    if (!select) return;
    const row = select.closest(".lifestyle-factor-row, .adverse-event-row");
    const nameTextWrap = row?.querySelector('[data-role="nameTextWrap"]');
    if (nameTextWrap) nameTextWrap.hidden = select.value !== REPEATABLE_ROW_OTHER_VALUE;
    if (selectRole === "factorId") {
      const vocab = globalThis.ACUTING_KNOWLEDGE?.lifestyleFactorVocabulary?.records || [];
      const rec = vocab.find((r) => r.id === select.value);
      const unitInput = row?.querySelector('[data-role="unit"]');
      if (unitInput && rec?.value_hint_en) unitInput.placeholder = rec.value_hint_en;
    }
  });
}

// Read side of the two row widgets — plain objects matching
// normalizeSoapNote's lifestyleFactors[]/adverseEvents[] field names
// exactly; the normalizer still does the actual filtering/coercion, this
// only translates DOM state into the same shape saveAgentExposureFromForm
// already builds from FormData for its own dialog.
function collectLifestyleFactorRows() {
  const container = document.querySelector("#lifestyleFactorRows");
  if (!container) return [];
  return [...container.querySelectorAll(".lifestyle-factor-row")].map((row) => {
    const select = row.querySelector('[data-role="factorId"]');
    const isOther = select.value === REPEATABLE_ROW_OTHER_VALUE;
    return {
      id: row.dataset.rowId || "",
      factorId: isOther ? "" : select.value,
      nameText: (row.querySelector('[data-role="nameText"]').value || "").trim(),
      valueNumber: row.querySelector('[data-role="valueNumber"]').value,
      unit: (row.querySelector('[data-role="unit"]').value || "").trim(),
      frequencyText: (row.querySelector('[data-role="frequencyText"]').value || "").trim(),
      notes: (row.querySelector('[data-role="notes"]').value || "").trim()
    };
  });
}

function collectAdverseEventRows() {
  const container = document.querySelector("#adverseEventRows");
  if (!container) return [];
  return [...container.querySelectorAll(".adverse-event-row")].map((row) => {
    const select = row.querySelector('[data-role="eventId"]');
    const isOther = select.value === REPEATABLE_ROW_OTHER_VALUE;
    return {
      id: row.dataset.rowId || "",
      eventId: isOther ? "" : select.value,
      nameText: (row.querySelector('[data-role="nameText"]').value || "").trim(),
      interventionType: row.querySelector('[data-role="interventionType"]').value || "",
      modalityId: row.querySelector('[data-role="modalityId"]').value || "",
      severity: row.querySelector('[data-role="severity"]').value || "",
      resolutionStatus: row.querySelector('[data-role="resolutionStatus"]').value || "",
      notes: (row.querySelector('[data-role="notes"]').value || "").trim()
    };
  });
}

// SOAP note display card — mirrors how outcomes/patterns render (raw ids
// resolved to vocab labels when known, falls back to nameText/id).
function formatLifestyleFactorLine(f) {
  const vocab = globalThis.ACUTING_KNOWLEDGE?.lifestyleFactorVocabulary?.records || [];
  const rec = vocab.find((r) => r.id === f.factorId);
  const label = rec ? `${rec.name_zh} ${rec.name_en}` : (f.nameText || f.factorId || "—");
  const hasValue = f.valueNumber === 0 || !!f.valueNumber;
  const valueText = [hasValue ? `${f.valueNumber}${f.unit ? " " + f.unit : ""}` : "", f.frequencyText].filter(Boolean).join(" · ");
  return `<li><strong>${escapeHtml(label)}</strong>${valueText ? ` — ${escapeHtml(valueText)}` : ""}${f.notes ? `<br><small>${escapeHtml(f.notes)}</small>` : ""}</li>`;
}

function formatAdverseEventLine(a) {
  const vocab = globalThis.ACUTING_KNOWLEDGE?.adverseEventVocabulary?.records || [];
  const rec = vocab.find((r) => r.id === a.eventId);
  const label = rec ? `${rec.name_zh} ${rec.name_en}` : (a.nameText || a.eventId || "—");
  const meta = [
    ADVERSE_EVENT_INTERVENTION_LABELS[a.interventionType] || a.interventionType,
    ADVERSE_EVENT_SEVERITY_LABELS[a.severity] || a.severity,
    ADVERSE_EVENT_RESOLUTION_LABELS[a.resolutionStatus] || a.resolutionStatus
  ].filter(Boolean).join(" · ");
  return `<li><strong>${escapeHtml(label)}</strong>${meta ? ` — ${escapeHtml(meta)}` : ""}${a.notes ? `<br><small>${escapeHtml(a.notes)}</small>` : ""}</li>`;
}

function renderLifestyleAdverseEventsView(note) {
  const lifestyle = note.lifestyleFactors || [];
  const adverse = note.adverseEvents || [];
  if (!lifestyle.length && !adverse.length) return "";
  return `
    <div class="lifestyle-ae-view">
      ${lifestyle.length ? `<div><small>生活型態 Lifestyle</small><ul>${lifestyle.map(formatLifestyleFactorLine).join("")}</ul></div>` : ""}
      ${adverse.length ? `<div><small>不良反應 Adverse events</small><ul>${adverse.map(formatAdverseEventLine).join("")}</ul></div>` : ""}
    </div>`;
}

function renderAgentExposuresPanel(item) {
  const store = window.AcuTingClinicalStore;
  const all = item.agentExposures || [];
  const current = store ? store.getCurrentExposures(item) : all.filter((e) => e.status === "current" || e.status === "prn");
  const currentIds = new Set(current.map((e) => e.id));
  const ordered = [...current, ...all.filter((e) => !currentIds.has(e.id))];
  const unstructuredHtml = renderUnstructuredMedsHtml([item]);
  const header = `
    <div class="timeline-head">
      <strong>用藥與補充劑 Meds &amp; Supplements</strong>
      <div class="case-actions"><button class="ghost" type="button" id="addAgentExposureInline">+ 新增 Add</button></div>
    </div>
  `;
  if (!ordered.length && !unstructuredHtml) {
    return `${header}<div class="case-empty">尚未記錄用藥或補充劑。Add current or past drugs/supplements as they come up.</div>`;
  }
  const structuredHtml = ordered.length ? `<div class="agent-exposure-list">${ordered.map(renderAgentExposureRow).join("")}</div>` : "";
  return `${header}${structuredHtml}${unstructuredHtml}`;
}

/* 把已經在知識庫裡的藥物安全資訊,帶到病歷裡看得到的地方。
 *
 * 問題:59 種藥有 25 種帶 FDA 黑框警告,而且藥卡早就畫得出來 —— 但病歷的
 * 用藥列只顯示藥名與劑量。要看到黑框,得離開病例、跳到藥卡、再跳回來。
 * 那一跳正是「少查一次」的反例:最嚴重的那類警告,反而藏在最遠的地方。
 *
 * 三種狀態要分得清楚,這是本段的重點:
 *   有卡片、有警告   → 畫出來
 *   有卡片、沒警告   → 不畫。這是「查過了,沒有」
 *   沒有卡片可查     → **明說沒查**。這一條最容易被寫成「不畫」,
 *                      但兩者在畫面上長得一樣時,讀的人會把「沒查過」
 *                      讀成「查過沒事」——那比不顯示更危險
 */
function lookupAgentSafetyCard(agentId) {
  const id = String(agentId || "").trim();
  if (!id) return { checked: false, reason: "沒有連結知識庫卡片" };
  const K = globalThis.ACUTING_KNOWLEDGE;
  if (!K) return { checked: false, reason: "知識庫未載入" };
  const sections = id.startsWith("supp.") ? ["supplementRecords"]
    : id.startsWith("med.") ? ["medications", "pharmDrugs"]
    : ["pharmDrugs", "medications", "supplementRecords"];
  for (const sec of sections) {
    const recs = (K[sec] && K[sec].records) || [];
    const hit = recs.find((r) => r && r.id === id);
    if (hit) return { checked: true, card: hit, section: sec };
  }
  return { checked: false, reason: "知識庫沒有這張卡" };
}

// 安全欄位可能是字串或陣列(contraindications_zh 實測是 array[10])。
// 統一成陣列,空的就是空的 —— 不要用 || 生出預設值。
function safetyFieldList(card, zhKey, enKey) {
  const out = [];
  for (const key of [zhKey, enKey]) {
    const v = card && card[key];
    if (Array.isArray(v)) out.push(...v.map((x) => String(x || "").trim()).filter(Boolean));
    else if (typeof v === "string" && v.trim()) out.push(v.trim());
  }
  return out;
}

/* 補充劑卡片的安全資訊不是 boxed_warning/contraindications,而是
 * key_safety_notes: [{ note_en, interaction_flags[], source{name,url} }]。
 *
 * 這個形狀差異差點讓整件事失效:supp.omega_3 帶著「高劑量 omega-3 會延長
 * 出血時間,抗凝血劑使用者需評估」+ interaction_flags:["anticoagulant"],
 * 而只讀藥物欄位的渲染器對它回傳空字串 —— 畫面上等於「查過了,沒有」。
 * 一個長期吃 warfarin 的病人自己加魚油,正是這條備註存在的理由。
 *
 * 有 interaction_flags 的排前面且直接展開(那是可行動的);其餘收起來。
 * 不做交互作用比對 —— 系統不知道這個病人同時在吃什麼,判斷是醫師的。
 */
function supplementSafetyNotes(card) {
  const raw = card && card.key_safety_notes;
  if (!Array.isArray(raw)) return { flagged: [], rest: [] };
  const flagged = [], rest = [];
  for (const n of raw) {
    if (!n || typeof n !== "object") continue;
    const text = String(n.note_zh || n.note_en || "").trim();
    if (!text) continue;
    const flags = Array.isArray(n.interaction_flags) ? n.interaction_flags.filter(Boolean).map(String) : [];
    const source = n.source && n.source.name ? String(n.source.name) : "";
    (flags.length ? flagged : rest).push({ text, flags, source });
  }
  return { flagged, rest };
}

function renderAgentExposureSafety(exposure) {
  const found = lookupAgentSafetyCard(exposure.agentId);
  if (!found.checked) {
    return `<div class="agent-safety agent-safety-unchecked"><small>⃠ 未做安全檢查:${escapeHtml(found.reason)}</small></div>`;
  }
  const boxed = safetyFieldList(found.card, "boxed_warning_zh", "boxed_warning_en");
  const contra = safetyFieldList(found.card, "contraindications_zh", "contraindications_en");
  const notes = supplementSafetyNotes(found.card);
  if (!boxed.length && !contra.length && !notes.flagged.length && !notes.rest.length) return "";
  const parts = [];
  // 黑框警告直接展開:FDA 最高級別的警告不該藏在要點開的地方
  if (boxed.length) {
    parts.push(`<div class="agent-safety-boxed"><strong>⚠️ 黑框警告 BOXED WARNING</strong>${boxed.map((t) => `<p>${escapeHtml(t)}</p>`).join("")}</div>`);
  }
  // 帶交互作用標記的補充劑備註 = 可行動的,跟黑框一樣直接展開
  if (notes.flagged.length) {
    parts.push(`<div class="agent-safety-flagged"><strong>⚠ 交互作用註記 Interaction note</strong>${notes.flagged.map((n) =>
      `<p>${escapeHtml(n.text)}${n.flags.length ? ` <span class="agent-safety-flag">${n.flags.map(escapeHtml).join(" · ")}</span>` : ""}${n.source ? `<em>來源:${escapeHtml(n.source)}</em>` : ""}</p>`
    ).join("")}</div>`);
  }
  if (contra.length) {
    parts.push(`<details class="agent-safety-contra"><summary>禁忌 Contraindications（${contra.length}）</summary><ul>${contra.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul></details>`);
  }
  if (notes.rest.length) {
    parts.push(`<details class="agent-safety-contra"><summary>其他安全備註 Other safety notes（${notes.rest.length}）</summary><ul>${notes.rest.map((n) =>
      `<li>${escapeHtml(n.text)}${n.source ? `<em> — ${escapeHtml(n.source)}</em>` : ""}</li>`
    ).join("")}</ul></details>`);
  }
  return `<div class="agent-safety">${parts.join("")}</div>`;
}

function renderAgentExposureRow(exposure) {
  const store = window.AcuTingClinicalStore;
  const timeline = store ? store.getExposureTimeline(exposure) : [...(exposure.events || [])];
  const typeLabel = AGENT_EXPOSURE_TYPE_LABELS[exposure.agentType] || "—";
  const statusLabel = AGENT_EXPOSURE_STATUS_LABELS[exposure.status] || (exposure.status || "—");
  const title = exposure.nameText || exposure.agentId || "未命名 Unnamed";
  const doseFreq = [exposure.doseText, exposure.frequencyText].filter(Boolean).join(" · ") || "—";
  return `
    <div class="agent-exposure-row">
      <div class="agent-exposure-head">
        <span class="agent-exposure-type-chip">${escapeHtml(typeLabel)}</span>
        <strong>${escapeHtml(title)}</strong>
        <span class="agent-exposure-status">${escapeHtml(statusLabel)}</span>
      </div>
      <div class="agent-exposure-meta">
        <small>劑量/頻率 Dose &amp; freq</small><span>${escapeHtml(doseFreq)}</span>
      </div>
      ${renderAgentExposureSafety(exposure)}
      <div class="agent-exposure-actions">
        <button type="button" class="ghost" data-agent-exposure-action="dose_changed" data-exposure-id="${escapeHtml(exposure.id)}">改劑量</button>
        <button type="button" class="ghost" data-agent-exposure-action="frequency_changed" data-exposure-id="${escapeHtml(exposure.id)}">改頻率</button>
        <button type="button" class="ghost" data-agent-exposure-action="stopped" data-exposure-id="${escapeHtml(exposure.id)}">停用</button>
        <button type="button" class="ghost" data-agent-exposure-action="confirmed_unchanged" data-exposure-id="${escapeHtml(exposure.id)}">確認未變</button>
      </div>
      <details class="agent-exposure-timeline">
        <summary>時間線 Timeline（${timeline.length}）</summary>
        ${timeline.length ? `<ul>${timeline.map(renderAgentExposureEvent).join("")}</ul>` : `<p>尚無事件紀錄 No recorded events yet.</p>`}
      </details>
    </div>
  `;
}

function renderAgentExposureEvent(ev) {
  const head = [ev.eventType, ev.doseText, ev.frequencyText, ev.status].filter(Boolean).join(" · ");
  const meta = [ev.visitId, ev.effectiveApprox].filter(Boolean).join(" · ");
  return `<li><strong>${escapeHtml(head || ev.eventType)}</strong>${meta ? ` <small>(${escapeHtml(meta)})</small>` : ""}${ev.note ? `<br><small>${escapeHtml(ev.note)}</small>` : ""}</li>`;
}

function openAgentExposureEditor() {
  const activeCase = clinicalCases.find((item) => item.id === selectedCaseId);
  if (!activeCase) {
    alert("請先新增或選擇一筆病例。");
    return;
  }
  agentExposureForm.reset();
  agentExposureDialog.showModal();
}

function saveAgentExposureFromForm(event) {
  event.preventDefault();
  const activeCase = clinicalCases.find((item) => item.id === selectedCaseId);
  if (!activeCase) return;
  const store = window.AcuTingClinicalStore;
  if (!store) return;
  const data = Object.fromEntries(new FormData(agentExposureForm).entries());
  const agentId = (data.agentId || "").trim();
  const nameText = (data.nameText || "").trim();
  if (!data.agentType) {
    alert("請選擇類型 Type（藥 drug / 補 supplement）。");
    return;
  }
  if (!agentId && !nameText) {
    alert("請至少填寫 Agent ID 或名稱 Name。");
    return;
  }
  // Build the bare ledger row, then apply the 'started' event through the
  // ONE authorized write path — the store fills doseText/frequencyText/
  // status/startApprox from the event, never set directly here.
  // createExposure enforces the initial-event rule at API level (SOL item 2).
  // eventType: "started" = the agent actually began around startApprox;
  // "initial_recorded" = patient was ALREADY on it when we first learned of it
  // (intake) — started would falsify an onset we don't know. The form's
  // 已在使用 checkbox picks between them.
  const startedRow = store.createExposure(
    { id: createId("agentexp"), agentType: data.agentType, agentId, nameText },
    {
      eventType: data.alreadyInUse ? "initial_recorded" : "started",
      doseText: (data.doseText || "").trim(),
      frequencyText: (data.frequencyText || "").trim(),
      status: "current",
      effectiveApprox: (data.startApprox || "").trim(),
      note: (data.note || "").trim()
    },
    "agent"
  );
  startedRow.infoSource = (data.infoSource || "").trim();
  const now = new Date().toISOString();
  const snapshot = structuredClone(clinicalCases);
  clinicalCases = clinicalCases.map((c) => {
    if (c.id !== selectedCaseId) return c;
    return normalizeClinicalCase({ ...c, agentExposures: [...(c.agentExposures || []), startedRow], updatedAt: now });
  });
  // R9 gate B (docs/AI_REVIEW_FEEDBACK.md §3): commit-on-true — a persist
  // failure must not close the dialog or render as if the save landed.
  if (!persistClinicalCases()) { clinicalCases = snapshot; return; }
  agentExposureDialog.close();
  render();
}

// Quick record-change actions (改劑量/改頻率/停用/確認未變) — a `prompt()` is
// enough for Phase D batch 1's minimal-capture goal; every branch ends in the
// same applyExposureChange call, never a direct field/events write.
function promptAgentExposureAction(exposureId, eventType) {
  const activeCase = clinicalCases.find((item) => item.id === selectedCaseId);
  const exposure = activeCase && (activeCase.agentExposures || []).find((e) => e.id === exposureId);
  if (!exposure) return;
  const event = { eventType };
  if (eventType === "dose_changed") {
    const value = prompt("新劑量 New dose（例:200mg,或中藥 3克・科學中藥/水藥/丸藥）", exposure.doseText || "");
    if (value === null) return;
    event.doseText = value.trim();
  } else if (eventType === "frequency_changed") {
    const value = prompt("新頻率 New frequency（例:qd/bid,或中藥 飯後・一天三次）", exposure.frequencyText || "");
    if (value === null) return;
    event.frequencyText = value.trim();
  } else if (eventType === "stopped") {
    if (!confirm(`確定將「${exposure.nameText || exposure.agentId}」標記為停用？`)) return;
    event.status = "stopped";
    const stopDate = prompt("停用日期（約，選填）Stop date (approx, optional)", "");
    if (stopDate === null) return;
    event.effectiveApprox = stopDate.trim();
  } else if (eventType === "confirmed_unchanged") {
    if (!confirm("確認這個項目維持現狀（劑量/頻率未變）？")) return;
  } else {
    return;
  }
  event.note = (prompt("備註（選填）Note (optional)", "") || "").trim();
  const store = window.AcuTingClinicalStore;
  if (!store) return;
  const now = new Date().toISOString();
  const snapshot = structuredClone(clinicalCases);
  clinicalCases = clinicalCases.map((c) => {
    if (c.id !== selectedCaseId) return c;
    const nextExposures = (c.agentExposures || []).map((e) => e.id === exposureId ? store.applyExposureChange(e, event, "agent") : e);
    return normalizeClinicalCase({ ...c, agentExposures: nextExposures, updatedAt: now });
  });
  // R9 gate B: persist failure rolls back the in-memory mutation; no render.
  if (!persistClinicalCases()) { clinicalCases = snapshot; return; }
  render();
}

// Phase D batch 3 (docs/SPRINT_2026-08-12_BRIEF.md Phase D task 3): case-level
// Environmental/toxic exposures ledger UI over environmentalExposures[] — the
// exact mirror of the Meds & Supplements panel above, over a different vocab
// and a different pair of independent axes (certainty × timing instead of
// dose/frequency). Exposures are OBSERVATIONS, never diagnoses: no code path
// here (or anywhere) may turn an exposure.* row into a pattern/tdis id
// (SPRINT brief §5). suspected→confirmed is a safety-relevant certainty
// change, not a status tweak, so promptEnvironmentalExposureAction enforces a
// REQUIRED note on every certainty_changed event (D17 §6) — the one place
// this panel's write path is stricter than batch 1's. Write side goes
// exclusively through AcuTingClinicalStore.createExposure/applyExposureChange
// — never a direct row/events mutation (audit B-1 invariant).
// (宣告已前移至檔頭 —— 見 AGENT_EXPOSURE_TYPE_LABELS 註解,TDZ 修正)
// (宣告已前移至檔頭 —— 見 AGENT_EXPOSURE_TYPE_LABELS 註解,TDZ 修正)

function renderEnvironmentalExposuresPanel(item) {
  const all = item.environmentalExposures || [];
  const header = `
    <div class="timeline-head">
      <strong>環境/毒性暴露 Environmental exposures</strong>
      <div class="case-actions"><button class="ghost" type="button" id="addEnvironmentalExposureInline">+ 新增 Add</button></div>
    </div>
  `;
  if (!all.length) {
    return `${header}<div class="case-empty">尚未記錄環境或毒性暴露。Add suspected or confirmed exposures as they come up.</div>`;
  }
  return `${header}<div class="env-exposure-list">${all.map(renderEnvironmentalExposureRow).join("")}</div>`;
}

function renderEnvironmentalExposureRow(exposure) {
  const store = window.AcuTingClinicalStore;
  const timeline = store ? store.getExposureTimeline(exposure) : [...(exposure.events || [])];
  const vocab = globalThis.ACUTING_KNOWLEDGE?.exposureVocabulary?.records || [];
  const rec = vocab.find((r) => r.id === exposure.exposureId);
  const title = rec ? `${rec.name_zh} ${rec.name_en}` : (exposure.nameText || exposure.exposureId || "未命名 Unnamed");
  const certaintyLabel = ENV_EXPOSURE_CERTAINTY_LABELS[exposure.certainty] || (exposure.certainty || "—");
  const timingLabel = ENV_EXPOSURE_TIMING_LABELS[exposure.timing] || (exposure.timing || "—");
  return `
    <div class="env-exposure-row">
      <div class="env-exposure-head">
        <span class="env-exposure-chip certainty-${escapeAttribute(exposure.certainty || "")}">${escapeHtml(certaintyLabel)}</span>
        <strong>${escapeHtml(title)}</strong>
        <span class="env-exposure-chip">${escapeHtml(timingLabel)}</span>
      </div>
      ${exposure.contextText ? `<div class="env-exposure-meta"><small>情境 Context</small><span>${escapeHtml(exposure.contextText)}</span></div>` : ""}
      <div class="env-exposure-actions">
        <button type="button" class="ghost" data-env-exposure-action="certainty_changed" data-exposure-id="${escapeHtml(exposure.id)}">改確定度</button>
        <button type="button" class="ghost" data-env-exposure-action="timing_changed" data-exposure-id="${escapeHtml(exposure.id)}">改狀態</button>
        <button type="button" class="ghost" data-env-exposure-action="stopped" data-exposure-id="${escapeHtml(exposure.id)}">已結束</button>
        <button type="button" class="ghost" data-env-exposure-action="confirmed_unchanged" data-exposure-id="${escapeHtml(exposure.id)}">確認未變</button>
      </div>
      <details class="env-exposure-timeline">
        <summary>時間線 Timeline（${timeline.length}）</summary>
        ${timeline.length ? `<ul>${timeline.map(renderEnvironmentalExposureEvent).join("")}</ul>` : `<p>尚無事件紀錄 No recorded events yet.</p>`}
      </details>
    </div>
  `;
}

function renderEnvironmentalExposureEvent(ev) {
  const head = [ev.eventType, ENV_EXPOSURE_CERTAINTY_LABELS[ev.certainty] || ev.certainty, ENV_EXPOSURE_TIMING_LABELS[ev.timing] || ev.timing].filter(Boolean).join(" · ");
  const meta = [ev.visitId, ev.effectiveApprox].filter(Boolean).join(" · ");
  return `<li><strong>${escapeHtml(head || ev.eventType)}</strong>${meta ? ` <small>(${escapeHtml(meta)})</small>` : ""}${ev.note ? `<br><small>${escapeHtml(ev.note)}</small>` : ""}</li>`;
}

function openEnvironmentalExposureEditor() {
  const activeCase = clinicalCases.find((item) => item.id === selectedCaseId);
  if (!activeCase) {
    alert("請先新增或選擇一筆病例。");
    return;
  }
  environmentalExposureForm.reset();
  // Rebuilt every open (like the lifestyle/adverse row selects) — always
  // reflects the current exposureVocabulary bundle rather than whatever was
  // baked into static markup at page load (there is none; see index.html).
  const vocab = globalThis.ACUTING_KNOWLEDGE?.exposureVocabulary?.records || [];
  const select = document.querySelector("#environmentalExposureSelect");
  if (select) select.innerHTML = vocabSelectOptionsHtml(vocab, "");
  const nameTextWrap = document.querySelector("#environmentalExposureNameTextWrap");
  if (nameTextWrap) nameTextWrap.hidden = true;
  environmentalExposureDialog.showModal();
}

function saveEnvironmentalExposureFromForm(event) {
  event.preventDefault();
  const activeCase = clinicalCases.find((item) => item.id === selectedCaseId);
  if (!activeCase) return;
  const store = window.AcuTingClinicalStore;
  if (!store) return;
  const data = Object.fromEntries(new FormData(environmentalExposureForm).entries());
  const isOther = data.exposureId === REPEATABLE_ROW_OTHER_VALUE;
  const exposureId = isOther ? "" : (data.exposureId || "").trim();
  const nameText = (data.nameText || "").trim();
  if (!exposureId && !nameText) {
    alert("請選擇暴露項目，或選擇「其他」並填寫名稱 Name。");
    return;
  }
  const certainty = data.certainty || "suspected";
  const timing = data.timing || "unknown";
  // Build the bare ledger row, then apply the initial event through the ONE
  // authorized write path — certainty/timing land on the snapshot via
  // applyExposureChange's env branch, never set directly here. Same
  // started/initial_recorded intake-honesty split as saveAgentExposureFromForm.
  const startedRow = store.createExposure(
    { id: createId("envexp"), exposureId, nameText, contextText: (data.contextText || "").trim() },
    {
      eventType: data.alreadyExists ? "initial_recorded" : "started",
      certainty,
      timing,
      effectiveApprox: (data.startApprox || "").trim(),
      note: (data.note || "").trim()
    },
    "environmental"
  );
  const now = new Date().toISOString();
  const snapshot = structuredClone(clinicalCases);
  clinicalCases = clinicalCases.map((c) => {
    if (c.id !== selectedCaseId) return c;
    return normalizeClinicalCase({ ...c, environmentalExposures: [...(c.environmentalExposures || []), startedRow], updatedAt: now });
  });
  // R9 gate B: commit-on-true — failure keeps the dialog open with input intact.
  if (!persistClinicalCases()) { clinicalCases = snapshot; return; }
  environmentalExposureDialog.close();
  render();
}

// Quick record-change actions (改確定度/改狀態/已結束/確認未變) — same
// prompt()-based minimal-capture pattern as promptAgentExposureAction, with
// one hard addition: certainty_changed REQUIRES a non-empty note. D17 §6 —
// suspected→confirmed (or any certainty change) must never happen trace-less;
// an empty note aborts the whole action rather than silently proceeding.
function promptEnvironmentalExposureAction(exposureId, eventType) {
  const activeCase = clinicalCases.find((item) => item.id === selectedCaseId);
  const exposure = activeCase && (activeCase.environmentalExposures || []).find((e) => e.id === exposureId);
  if (!exposure) return;
  const event = { eventType };
  if (eventType === "certainty_changed") {
    const value = (prompt("新確定度 New certainty（suspected / patient_reported / confirmed）", exposure.certainty || "") || "").trim();
    if (!value) return;
    if (!["suspected", "patient_reported", "confirmed"].includes(value)) {
      alert("確定度必須是 suspected / patient_reported / confirmed 其中一個，已取消。");
      return;
    }
    const note = (prompt("備註（必填 — 例如檢測報告/病歷來源）Note (REQUIRED — e.g. lab result, chart source)", "") || "").trim();
    if (!note) {
      alert("改確定度必須附備註，已取消（D17 §6：確定度變更不得無痕發生，尤其 suspected→confirmed）。");
      return;
    }
    event.certainty = value;
    event.note = note;
  } else if (eventType === "timing_changed") {
    const value = (prompt("新狀態 New timing（ongoing / historical / unknown）", exposure.timing || "") || "").trim();
    if (!value) return;
    if (!["ongoing", "historical", "unknown"].includes(value)) {
      alert("狀態必須是 ongoing / historical / unknown 其中一個，已取消。");
      return;
    }
    event.timing = value;
    event.note = (prompt("備註（選填）Note (optional)", "") || "").trim();
  } else if (eventType === "stopped") {
    if (!confirm(`確定將「${exposure.nameText || exposure.exposureId}」標記為已結束？`)) return;
    const endDate = prompt("結束日期（約，選填）End date (approx, optional)", "");
    if (endDate === null) return;
    event.effectiveApprox = endDate.trim();
    event.note = (prompt("備註（選填）Note (optional)", "") || "").trim();
  } else if (eventType === "confirmed_unchanged") {
    if (!confirm("確認這個項目維持現狀（確定度/狀態未變）？")) return;
    event.note = (prompt("備註（選填）Note (optional)", "") || "").trim();
  } else {
    return;
  }
  const store = window.AcuTingClinicalStore;
  if (!store) return;
  const now = new Date().toISOString();
  const snapshot = structuredClone(clinicalCases);
  clinicalCases = clinicalCases.map((c) => {
    if (c.id !== selectedCaseId) return c;
    const nextExposures = (c.environmentalExposures || []).map((e) => e.id === exposureId ? store.applyExposureChange(e, event, "environmental") : e);
    return normalizeClinicalCase({ ...c, environmentalExposures: nextExposures, updatedAt: now });
  });
  // R9 gate B: persist failure rolls back the in-memory mutation; no render.
  if (!persistClinicalCases()) { clinicalCases = snapshot; return; }
  render();
}

function normalizeStringList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return splitList(String(value || ""));
}

function formatNoteList(value, fallback = "未連結") {
  const list = normalizeStringList(value);
  return list.length ? list.join("、") : fallback;
}

// TCM pattern primary/secondary reconciliation: compact display for
// tcmPatternSelections, shared by the SOAP card view and Last Visit at a
// Glance. Ids shown raw, not resolved to names — same convention every
// other link field (acupointLinks, formulaLinks, ...) already uses in these
// summary views.
function formatPatternSelections(selections) {
  const list = selections || [];
  const primary = list.find((e) => e.isPrimary);
  const secondary = list.filter((e) => !e.isPrimary);
  const parts = [];
  if (primary) parts.push(`★ ${primary.patternId}`);
  if (secondary.length) parts.push(`+ ${secondary.map((e) => e.patternId).join("、")}`);
  return parts.join("  ");
}

// Visit Brief / Case Swimlanes 共用的 id → 中文名解析。找不到就原樣回傳 id
// (讓人至少知道有東西),不要回傳空字串。不讀 legacy `.conditions.*` 影子表 ——
// 只讀 patternPickerOptions / formulaPickerOptions 已在用的同一批 canon 來源。
function knowledgeRecordName(records, id) {
  if (!id) return id;
  const rec = (records || []).find((r) => r.id === id);
  return rec ? (rec.name_zh || rec.name_en || id) : id;
}
function resolveFormulaName(id) {
  return knowledgeRecordName(globalThis.ACUTING_KNOWLEDGE?.formulas?.records, id);
}
function resolveModalityName(id) {
  return knowledgeRecordName(globalThis.ACUTING_KNOWLEDGE?.modalityVocabulary?.records, id);
}
function resolvePatternName(id) {
  if (!id) return id;
  const K = globalThis.ACUTING_KNOWLEDGE || {};
  const rec = (K.patternLibrary?.records || []).find((r) => r.id === id)
    || (K.patternRegistry?.records || []).find((r) => r.id === id)
    || (K.tcmPatternCanon?.records || []).find((r) => r.id === id);
  return rec ? (rec.name_zh || rec.name_en || id) : id;
}

function createId(prefix) {
  return `${prefix}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 8)}`;
}

/* Reverse lookup: which of Ting's own visits used this formula / point / drug.
   The link already existed one way — a SOAP note stores formulaLinks — but a
   formula card could not answer "where have I actually used this", which is the
   difference between a reference book and a clinical record. The knowledge
   cards live in js/knowledge.js and must not read the case store directly, so
   app.js owns it and exposes this, the same way notes.js and review.js are
   reached (window.AcuTingNotes / window.AcuTingReview).

   De-identified by construction: only patient_code, visit number, date, the
   case title and the outcome verdict cross this boundary. No S/O/A/P text, no
   name, no birth date — a study card must never become a place patient
   narrative leaks into (DECISIONS D4/D7). */
window.AcuTingCases = {
  usedIn(kind, id) {
    if (!id) return [];
    const field = { formula: "formulaLinks", point: "acupointLinks", drug: "medicationLinks" }[kind];
    if (!field) return [];
    const wanted = String(id).trim().toLowerCase();
    const out = [];
    for (const c of clinicalCases) {
      for (const note of c.soapNotes || []) {
        const links = (note[field] || []).map((x) => String(x).trim().toLowerCase());
        if (!links.includes(wanted)) continue;
        out.push({
          caseId: c.id,
          patientCode: c.patientCode || "",
          caseTitle: c.caseTitle || "",
          caseCategory: c.caseCategory || "",
          visitNumber: note.visitNumber || "",
          date: note.visitDate || note.date || "",
          // The label travels with the value. Handing the card a bare key would
          // make it invent its own vocabulary, which is exactly how the pattern
          // layer ended up with two sets of field names.
          verdict: note.outcomeVerdict || "",
          verdictZh: OUTCOME_VERDICTS[note.outcomeVerdict]?.zh || "",
          verdictTone: OUTCOME_VERDICTS[note.outcomeVerdict]?.tone || ""
        });
      }
    }
    return out.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  },
  open(caseId) {
    const found = clinicalCases.find((c) => c.id === caseId);
    if (!found) return false;
    selectedCaseId = caseId;
    if (typeof caseSearch !== "undefined" && caseSearch) caseSearch.value = "";
    renderClinicalCases();
    goToSection("caseWorkspace");
    return true;
  }
};

function renderClinicalCases() {
  // 病例一有變動就重算回顧,否則存完 SOAP 後面板還停在舊數字
  if (practiceAuditOpen) renderPracticeAuditPanel();
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

// ---- Patient Longitudinal Workspace W1 (docs/PATIENT_WORKSPACE_DESIGN_v1.md)
// ----------------------------------------------------------------------------
// Read-only. UI calls ONLY AcuTingClinicalStore.getPatientsView(cases) — never
// derivePatientsFromCases/activeIsV2 directly (the bridge is the one seam that
// is allowed to know which world is active). Every helper below joins back to
// `clinicalCases` by patient.caseIds, so it works unchanged whether patients
// came from the v1 derive or a v2 staging envelope. Zero new write paths —
// nothing here calls save()/persistClinicalCases()/applyExposureChange().
//
// PHI discipline: only patientCode is ever printed. Demographics render as a
// coarse birth-YEAR-BAND (decade), never a birth date; there is no name field
// on the case object to begin with, so there is nothing to accidentally leak.
//
// Shape note (resolved ambiguity): buildMigrationPlan() nests demographic
// fields under patient.fields{...}, while derivePatientsFromCases() (v1) and
// syncPendingPatients() (v2 runtime creation) both put them at the top level.
// patientFieldValue() below reads top-level first, falling back to .fields —
// this is a read-only accommodation of an existing shape wrinkle, not a fix
// to clinical-store.js (out of scope for W1).

// (宣告已前移至檔頭 boot-order 區 —— 見 AGENT_EXPOSURE_TYPE_LABELS 註解)

function patientFieldValue(patient, key) {
  const top = patient ? patient[key] : undefined;
  if (top !== undefined && top !== null && top !== "") return top;
  const nested = patient && patient.fields ? patient.fields[key] : undefined;
  if (nested !== undefined && nested !== null) return nested;
  return top !== undefined ? top : "";
}

function patientBirthYearBand(patient) {
  const bym = String(patientFieldValue(patient, "birthYearMonth") || "");
  const by = patientFieldValue(patient, "birthYear");
  const year = bym ? Number(bym.slice(0, 4)) : (by ? Number(by) : null);
  if (!year || !Number.isFinite(year)) return "";
  return `${Math.floor(year / 10) * 10}s`;
}

function casesForPatient(patient) {
  const ids = new Set(patient.caseIds || []);
  return clinicalCases.filter((c) => ids.has(c.id));
}

function patientMostRecentVisitDate(cases) {
  let latest = "";
  for (const c of cases) {
    for (const note of c.soapNotes || []) {
      if (note.visitDate && note.visitDate > latest) latest = note.visitDate;
    }
  }
  if (!latest) {
    // No dated SOAP notes anywhere for this patient — fall back to the most
    // recent case-level timestamp so the row still sorts sanely, rather than
    // silently sinking to the bottom next to patients with zero data.
    for (const c of cases) {
      const t = (c.updatedAt || c.startDate || "").slice(0, 10);
      if (t && t > latest) latest = t;
    }
  }
  return latest;
}

function patientTrackedMetricsCount(cases) {
  const ids = new Set();
  for (const c of cases) for (const note of c.soapNotes || []) for (const m of note.outcomeMetrics || []) if (m.metricId) ids.add(m.metricId);
  return ids.size;
}

function patientNeedsReview(patient) {
  return !!((patient.needsReview && patient.needsReview.length) || Object.keys(patient.conflicts || {}).length);
}

function patientConsentSummary(cases) {
  const vals = [...new Set(cases.map((c) => c.publicationConsent || "").filter(Boolean))];
  if (!vals.length) return "未詢問 Not asked";
  const label = (v) => CONSENT_LABELS[v] || v;
  if (vals.length === 1) return label(vals[0]);
  return `跨 case 不一致 Mixed: ${vals.map(label).join(" / ")}`;
}

function getFilteredPatientRows() {
  const store = window.AcuTingClinicalStore;
  if (!store || !store.getPatientsView) return { rows: [], error: "AcuTingClinicalStore.getPatientsView() 不可用" };
  let patients;
  try {
    patients = store.getPatientsView(clinicalCases) || [];
  } catch (e) {
    // Fail loud, same spirit as loadClinicalCases()'s clinicalStoreIntegrityError
    // path — a v2 staging envelope missing/corrupt must never silently render
    // as "zero patients", which would look like a healthy, empty clinic.
    return { rows: [], error: e.message };
  }
  const rows = patients.map((patient) => {
    const cases = casesForPatient(patient);
    return {
      patient, cases,
      mostRecentVisit: patientMostRecentVisitDate(cases),
      trackedMetrics: patientTrackedMetricsCount(cases),
      needsReview: patientNeedsReview(patient)
    };
  });
  rows.sort((a, b) => String(b.mostRecentVisit || "").localeCompare(String(a.mostRecentVisit || "")));
  const query = (patientSearch?.value || "").trim().toLowerCase();
  const filtered = query ? rows.filter((r) => String(r.patient.patientCode || "").toLowerCase().includes(query)) : rows;
  return { rows: filtered, error: null };
}

function renderPatientsWorkspace() {
  if (!patientList || !patientDetail) return;   // section absent from this build — defensive, mirrors other optional-panel guards in this file
  const { rows, error } = getFilteredPatientRows();
  if (patientResultCount) patientResultCount.textContent = `${rows.length} patients`;
  if (error) {
    patientList.innerHTML = `<div class="case-empty">病人視圖讀取失敗<br>Patient view failed to load:<br>${escapeHtml(error)}</div>`;
    patientDetail.innerHTML = "";
    return;
  }
  if (selectedPatientCode && !rows.some((r) => r.patient.patientCode === selectedPatientCode)) selectedPatientCode = "";
  if (!selectedPatientCode && rows.length) selectedPatientCode = rows[0].patient.patientCode;
  patientList.innerHTML = "";
  if (!rows.length) {
    patientList.innerHTML = `<div class="case-empty">尚未有病人。<br>先在「病例 Cases」建立第一筆病例。</div>`;
  } else {
    rows.forEach((row) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `case-list-item ${row.patient.patientCode === selectedPatientCode ? "active" : ""}`;
      button.innerHTML = `
        <span>${escapeHtml(row.patient.patientCode || "No code")}</span>
        <strong>${row.cases.length} case${row.cases.length === 1 ? "" : "s"}</strong>
        <small>最近就診 Last visit ${escapeHtml(row.mostRecentVisit || "—")} · ${row.trackedMetrics} metrics${row.needsReview ? ' · <span class="case-tag">⚠ needsReview</span>' : ""}</small>
      `;
      button.addEventListener("click", () => { selectedPatientCode = row.patient.patientCode; renderPatientsWorkspace(); });
      patientList.append(button);
    });
  }
  const selected = rows.find((r) => r.patient.patientCode === selectedPatientCode) || null;
  renderPatientDetail(selected);
}

function renderPatientCaseListHtml(cases) {
  if (!cases.length) return `<div class="timeline-head"><strong>Case 清單</strong></div><div class="case-empty">此病人目前沒有可見病例。</div>`;
  const cards = cases.map((c) => {
    const notes = [...c.soapNotes].sort((a, b) => String(b.visitDate || "").localeCompare(String(a.visitDate || "")));
    const readiness = computeCareReadiness(c, notes);
    const pct = readiness.max ? Math.round((readiness.score / readiness.max) * 100) : null;
    const badge = pct === null ? "" : `<span class="care-badge ${pct >= 80 ? "care-badge-good" : pct >= 50 ? "care-badge-mid" : "care-badge-low"}">${pct}%</span>`;
    return `
      <button type="button" class="case-list-item" data-open-case="${escapeAttribute(c.id)}">
        <span>${escapeHtml([c.caseCategory, c.status].filter(Boolean).join(" · ") || "—")}</span>
        <strong>${escapeHtml(c.caseTitle || "Untitled case")}</strong>
        <small>${escapeHtml(c.startDate || "—")} · ${notes.length} SOAP ${badge}</small>
      </button>`;
  }).join("");
  return `
    <div class="timeline-head"><strong>Case 清單</strong><small class="timeline-date">${cases.length} cases</small></div>
    <div class="case-list">${cards}</div>`;
}

function renderPatientConflictsHtml(patient) {
  const conflicts = patient.conflicts || {};
  const needsReview = patient.needsReview || [];
  if (!Object.keys(conflicts).length && !needsReview.length) return "";
  const rows = Object.entries(conflicts).map(([field, entries]) => `
    <div class="brief-row"><small>${escapeHtml(field)}</small><span>${(entries || []).map((e) => escapeHtml(`${e.value || "(空 empty)"} [${e.caseId || "?"}${e.updatedAt ? " · " + e.updatedAt : ""}]`)).join(" vs ")}</span></div>
  `).join("");
  return `
    <div class="visit-brief">
      <div class="brief-review">
        ⚠ 跨 case 資料落差 Cross-case data conflicts(needsReview: ${needsReview.length ? escapeHtml(needsReview.join("、")) : "0"})
      </div>
      <div class="brief-grid">${rows}</div>
    </div>`;
}

function renderPatientSafetyRollupHtml(cases) {
  const flags = [...new Set(cases.flatMap((c) => c.safetyFlags || []))];
  return `
    <div class="timeline-head"><strong>跨 case 警訊聚合 Safety flags</strong><small class="timeline-date">${flags.length}</small></div>
    ${flags.length ? `<div class="case-tags">${flags.map((f) => `<span class="case-tag">${escapeHtml(f)}</span>`).join("")}</div>` : `<div class="case-empty">尚無紀錄安全旗標。</div>`}`;
}

// Dry Clinic log #16: the structured ledger below only aggregates
// agentExposures[]; intake's free-text currentMeds is a second, unrelated
// source that can carry real agents (lorazepam + fish oil) the structured
// side has never seen. This is deliberately NOT parsed into rows — no
// invented structure over clinical free text — just surfaced verbatim,
// deduplicated by exact string, so "0 agents" never reads as "no meds".
function renderUnstructuredMedsHtml(cases) {
  const seen = new Set();
  const entries = [];
  for (const c of cases) {
    const text = (c.currentMeds || "").trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    entries.push({ caseTitle: c.caseTitle || c.id || "Untitled case", text });
  }
  if (!entries.length) return "";
  return `
    <div class="agent-exposure-unstructured">
      <small>未結構化(intake 原文) Unstructured (from intake)</small>
      <ul>
        ${entries.map((e) => `<li><strong>${escapeHtml(e.caseTitle)}</strong>：${escapeHtml(e.text)}</li>`).join("")}
      </ul>
    </div>`;
}

function renderPatientAgentLedgerHtml(cases) {
  const groups = new Map();
  for (const c of cases) {
    for (const e of c.agentExposures || []) {
      const key = `${e.agentType}|${(e.agentId || e.nameText || "").toLowerCase().trim()}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ caseItem: c, exposure: e });
    }
  }
  const unstructuredHtml = renderUnstructuredMedsHtml(cases);
  const header = `<div class="timeline-head"><strong>用藥/補充劑總帳 Meds &amp; Supplements ledger</strong><small class="timeline-date">${groups.size} agents</small></div>`;
  if (!groups.size && !unstructuredHtml) return `${header}<div class="case-empty">尚未記錄用藥或補充劑。</div>`;
  const rows = [...groups.values()].map((entries) => {
    const first = entries[0].exposure;
    const typeLabel = AGENT_EXPOSURE_TYPE_LABELS[first.agentType] || "—";
    const title = first.nameText || first.agentId || "未命名 Unnamed";
    const anyCurrent = entries.some((en) => en.exposure.status === "current" || en.exposure.status === "prn");
    const sources = entries.map((en) => {
      const label = AGENT_EXPOSURE_STATUS_LABELS[en.exposure.status] || en.exposure.status || "—";
      return escapeHtml(`${en.caseItem.caseTitle || en.caseItem.id}(${label})`);
    }).join("、");
    return `
      <div class="agent-exposure-row">
        <div class="agent-exposure-head">
          <span class="agent-exposure-type-chip">${escapeHtml(typeLabel)}</span>
          <strong>${escapeHtml(title)}</strong>
          <span class="agent-exposure-status">${anyCurrent ? "使用中 Active" : "非使用中 Inactive"}</span>
        </div>
        <div class="agent-exposure-meta"><small>來源 Source cases（${entries.length}）</small><span>${sources}</span></div>
        ${renderAgentExposureSafety(first)}
      </div>`;
  }).join("");
  const structuredHtml = groups.size ? `<div class="agent-exposure-list">${rows}</div>` : "";
  return `${header}${structuredHtml}${unstructuredHtml}`;
}

function renderPatientDetail(row) {
  if (!row) {
    patientDetail.innerHTML = `
      <div class="case-empty">
        <div>
          <strong>Patient Longitudinal Workspace</strong>
          <p>選一位病人查看跨病例總覽（頭卡、Case 清單、警訊聚合、用藥總帳）。</p>
        </div>
      </div>`;
    return;
  }
  const { patient, cases } = row;
  const sortedCases = [...cases].sort((a, b) => String(b.startDate || b.updatedAt || "").localeCompare(String(a.startDate || a.updatedAt || "")));
  const band = patientBirthYearBand(patient);
  const sex = patientFieldValue(patient, "sex");
  patientDetail.innerHTML = `
    <div class="case-detail-head">
      <div>
        <p class="eyebrow">${escapeHtml(patient.patientCode || "Patient")}</p>
        <h3>${cases.length} case${cases.length === 1 ? "" : "s"} · 最近就診 ${escapeHtml(row.mostRecentVisit || "—")}</h3>
        <div class="case-meta">${escapeHtml([band && `出生年段 Birth decade ${band}`, sex && `Sex ${sex}`, `發表同意 Consent: ${patientConsentSummary(cases)}`].filter(Boolean).join(" · "))}</div>
      </div>
    </div>
    ${renderPatientConflictsHtml(patient)}
    ${renderPatientCaseListHtml(sortedCases)}
    ${renderPatientSafetyRollupHtml(cases)}
    ${renderPatientAgentLedgerHtml(cases)}
  `;
  patientDetail.querySelectorAll("[data-open-case]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedCaseId = btn.dataset.openCase;
      if (window.location.hash === "#ws/cases") { renderClinicalCases(); window.scrollTo({ top: 0 }); }
      else window.location.hash = "#ws/cases";
    });
  });
}

// P0.5 Visit Brief(OPTIMIZATION_PLAN_2026-08 P1 鏈的桌面版,SOL 設計:
// Pre-Visit Capture → Visit Brief → clinician confirms 的中段先行)。
// 純讀取衍生 —— 上次 vs 前次的 metric 差、ledger 事件、AE、生活型態變化、
// ⚠ REVIEW 旗標。零新欄位;手機自填(P1)上線後這面板自動變得更完整。
// P2 Case Report Readiness (2026-08-11, docs/CARE_READINESS_MAP_v0.md).
// READ-ONLY over existing case/note data — computes which CARE/STRICTA
// datapoints this case can already prove and which are still gaps. The
// check list is the JUDGEABLE subset of the v0 map (denominator = what the
// code can honestly decide from fields; prose-quality rows the map marks △
// score 0.5 when their field has content). "na" rows (e.g. needling
// parameters on a case with no needling visits) leave the denominator
// entirely — an herbal-only case is not penalized for STRICTA items.
function computeCareReadiness(item, notesDesc) {
  const notes = notesDesc || [];
  const any = (fn) => notes.some(fn);
  const has = (v) => (Array.isArray(v) ? v.length > 0 : (v === 0 ? true : !!v));
  const st = (ok) => (ok ? "ok" : "missing");
  const checks = [];
  const add = (label, status) => { if (status !== "na") checks.push({ label, status }); };

  const demo = [item.sex, item.birthYearMonth || item.birthYear, item.occupation].filter(has).length;
  add("5a 基本資料", demo >= 3 ? "ok" : demo >= 1 ? "partial" : "missing");
  add("5b 主訴", st(has(item.chiefComplaint)));
  add("5c 既往史", st(has(item.pastHistory)));
  add("5c 生活/心理社會", st(has(item.lifestyle)));
  add("5c 目前用藥", st(has(item.currentMeds) || has(item.agentExposures)));
  add("5d 過往治療", st(has(item.previousTreatment) || has(item.previousTreatmentNotes)));
  add("6 客觀所見", any((n) => has(n.objective)) ? "partial" : "missing");
  add("7 Timeline(≥2 診)", st(notes.length >= 2));
  add("8c 診斷(西/中)", (has(item.westernConditions) || has(item.easternDiseases)) && any((n) => has(n.tcmPatternSelections)) ? "ok"
    : (has(item.westernConditions) || has(item.easternDiseases) || any((n) => has(n.tcmPatternSelections))) ? "partial" : "missing");
  add("8b 鑑別思路", any((n) => has(n.patternDifferentials) || has(n.differentialConsidered)) ? "ok" : "missing");
  add("9a 治療內容", st(any((n) => has(n.acupointLinks) || has(n.formulaLinks))));
  add("9b 方藥細節", any((n) => has(n.formulaHerbs)) || (item.agentExposures || []).some((e) => has(e.doseText)) ? "ok" : "missing");
  add("9c 治療調整軌跡", st((item.agentExposures || []).some((e) => (e.events || []).length > 1)));
  add("10a 結構化 outcome", st(any((n) => has(n.outcomeMetrics))));
  add("10a 療效判定", st(any((n) => has(n.outcomeVerdict))));
  // AE: rows exist = ok; none recorded is indistinguishable from not-asked → partial, never ok (D4 spirit)
  add("10d 不良事件", any((n) => has(n.adverseEvents)) ? "ok" : "partial");
  add("12 病人視角", st(any((n) => has(n.patientPerspective))));
  add("13 發表同意", item.publicationConsent === "granted" ? "ok" : item.publicationConsent ? "partial" : "missing");

  // STRICTA 2a-2g — only for cases that actually needle
  const needling = notes.filter((n) => has(n.acupointLinks) || has(n.pointsUsed));
  if (needling.length) {
    const frac = (f) => needling.filter(f).length / needling.length;
    const stFrac = (x) => (x >= 1 ? "ok" : x > 0 ? "partial" : "missing");
    add("2a 進針數", stFrac(frac((n) => has(n.needleCount))));
    add("2c 深度", stFrac(frac((n) => has(n.needleDepthText))));
    add("2d 得氣", stFrac(frac((n) => has(n.deqiResponse))));
    add("2e 刺激方式", stFrac(frac((n) => has(n.needleStimulation))));
    add("2f 留針", stFrac(frac((n) => has(n.retentionMinutes))));
    add("2g 針具", stFrac(frac((n) => has(n.needleTypeText))));
  }

  const score = checks.reduce((s, c) => s + (c.status === "ok" ? 1 : c.status === "partial" ? 0.5 : 0), 0);
  return { checks, score, max: checks.length };
}

/* 產生 CARE/STRICTA 草稿並下載成 .md —— 計算全部在 js/care-draft.js
 * (同一份邏輯 CLI 也用,見 scripts/generate-care-draft.js)。
 *
 * 這是一個 **PHI export**(2026-08-14 Ting ruling / CODEX AUDIT #1)。
 * 原本的檔頭寫「只在瀏覽器記憶體裡發生」,那描述的是計算,不是結果:按下去
 * 之後硬碟上就多了一份病歷。所以這裡有兩道,兩道都不是裝飾:
 *   1. 檔名不含 caseTitle、檔內不含 patientCode(js/care-draft.js 負責)
 *   2. 下載前二次確認,而且確認框要**逐項講清楚裡面有什麼** —— 只寫「確定
 *      下載?」等於沒問。日期處數與掃描命中數都是從真正要下載的那份文字算的。
 * 取消就是取消:不建 Blob、不觸發下載。validate-care-draft-phi.js 守這條。 */
function downloadCareDraft(item) {
  const CD = globalThis.AcuTingCareDraft;
  if (!CD) { alert("草稿產生器未載入(js/care-draft.js)。"); return; }
  const K = globalThis.ACUTING_KNOWLEDGE || {};
  const points = globalThis.ACUTING_POINTS_361 || [];
  const labelIdx = CD.buildLabelIndexFromKnowledge(K, points);
  const metricDefs = CD.metricDefMapFromKnowledge((K.outcomeMetrics && K.outcomeMetrics.records) || []);
  const draft = CD.generateDraft(item, { lang: contentMode === "english" ? "en" : "both", labelIdx, metricDefs, refDate: new Date() });

  // 黑框、確認框、CLI 警告共用 phiCounts —— 三個地方報同一組數字,
  // 不然使用者會看到「黑框說 2 個、確認框說 3 個」而不知道信哪個。
  const counts = CD.phiCounts(draft);
  const findings = counts.findings;
  const kinds = [...new Set(findings.map((f) => `${f.id} ${f.label}`))];
  const confirmed = confirm(
    "⚠️ 這份草稿含 PHI,未做任何去識別。\n\n" +
      "即將存到硬碟的檔案包含:\n" +
      `  · 精確日期 ${counts.dates.distinct} 個(就診日、暴露事件日),全文出現 ${counts.dates.total} 處\n` +
      "  · 主訴 / 病史 / 客觀所見 / 評估 / 計畫的病歷原文\n" +
      "  · 病人原話(CARE 12 病人視角)\n" +
      (kinds.length
        ? `  · 自動掃描另外命中 ${findings.length} 處識別碼樣式:${kinds.join("、")}\n`
        : "  · 自動掃描未命中識別碼樣式 —— 但掃不到不代表乾淨,姓名沒有機器特徵\n") +
      "\n檔名不含病例標題、檔內不含病人代碼;其餘內容一律照錄。\n" +
      "下載後請勿放進雲端同步資料夾、勿以附件寄出、勿直接投稿。\n\n" +
      "確定下載?"
  );
  if (!confirmed) return;

  const blob = new Blob([draft], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = CD.draftFilename(item, localDateISO());
  link.click();
  URL.revokeObjectURL(url);
}

function renderCareReadinessPanel(item, notesDesc) {
  const r = computeCareReadiness(item, notesDesc);
  if (!r.max) return "";
  const pct = Math.round((r.score / r.max) * 100);
  const gaps = r.checks.filter((c) => c.status === "missing");
  const partials = r.checks.filter((c) => c.status === "partial");
  return `
    <div class="care-readiness">
      <div class="care-readiness-head">
        <strong>Case Report Readiness</strong>
        <span class="care-badge ${pct >= 80 ? "care-badge-good" : pct >= 50 ? "care-badge-mid" : "care-badge-low"}">${r.score % 1 ? r.score.toFixed(1) : r.score}/${r.max} · ${pct}%</span>
        <small>CARE 2013 + STRICTA 2010(v0 對映,docs/CARE_READINESS_MAP_v0.md)</small>
        <button type="button" class="ghost" data-care-draft="${escapeAttribute(item.id)}" title="下載一份含 PHI 的 .md 草稿(未去識別,下載前會再確認一次)">產生草稿 Generate draft ⚠️ 含 PHI</button>
      </div>
      <div class="care-row"><small>⚠️ PHI</small><span>草稿照錄病歷原文與精確日期,屬於 PHI export。檔名不含病例標題、檔內不含病人代碼,其餘照錄 —— 投稿前必須人工去識別。</span></div>
      ${gaps.length ? `<div class="care-row"><small>○ 缺</small><span>${gaps.map((c) => escapeHtml(c.label)).join("、")}</span></div>` : ""}
      ${partials.length ? `<div class="care-row"><small>△ 部分</small><span>${partials.map((c) => escapeHtml(c.label)).join("、")}</span></div>` : ""}
      ${!gaps.length && !partials.length ? `<div class="care-row"><span>全部資料點齊備 —— 可著手 CARE 草稿。</span></div>` : ""}
    </div>`;
}

// Timeline swim-lanes (2026-08, SOL direction B — "Patient Over Time" 具象化).
// READ-ONLY rendering over existing data. Lanes: outcome metrics (dots+line),
// exposures (bars from event history), adverse events (markers). D4: coarse
// dates position at period midpoint and are drawn hollow — coarsened, never
// silently precisified into fake exact days.
function swimDateToNum(s) {
  const str = String(s || "");
  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return { t: Date.UTC(+m[1], +m[2] - 1, +m[3]), coarse: false };
  m = str.match(/^(\d{4})-(\d{2})$/);
  if (m) return { t: Date.UTC(+m[1], +m[2] - 1, 15), coarse: true };
  m = str.match(/^(\d{4})$/);
  if (m) return { t: Date.UTC(+m[1], 6, 1), coarse: true };
  return null;
}

function renderCaseSwimlanes(item, notesAsc) {
  const notes = (notesAsc || []).filter((n) => swimDateToNum(n.visitDate));
  const visitDate = (vid) => { const n = notes.find((x) => x.id === vid); return n ? n.visitDate : ""; };
  const evDate = (ev) => swimDateToNum(ev.effectiveApprox) || swimDateToNum(visitDate(ev.visitId)) || swimDateToNum(String(ev.createdAt || "").slice(0, 10));

  // 收集全部時間點
  const points = notes.map((n) => swimDateToNum(n.visitDate).t);
  const expos = (item.agentExposures || []).map((e) => ({
    label: e.nameText || e.agentId || "?", status: e.status || "",
    evs: (e.events || []).map((ev) => ({ d: evDate(ev), type: ev.eventType || "" })).filter((x) => x.d)
  })).filter((e) => e.evs.length);
  expos.forEach((e) => e.evs.forEach((x) => points.push(x.d.t)));
  if (points.length < 2 || new Set(points).size < 2) return "";

  const min = Math.min(...points), max = Math.max(...points);
  const X = (t) => 40 + ((t - min) / (max - min)) * 920;
  /* 軸標籤用 UTC 還原,不能用 localDateISO。
   *
   * swimDateToNum 把 "2026-05-01" 這種**日曆日**解析成 Date.UTC 午夜;
   * localDateISO 再用本地 getter 讀回來,在 UTC-7 就變成 2026-04-30 ——
   * 泳道上每一診的日期都往前一天。實測輸入 05-01/05-08、畫出 04-30/05-07。
   *
   * localDateISO 本身沒錯,它是為「現在幾點」那種時間戳寫的(Dry Clinic #8:
   * 晚診時 UTC 會把預設日期跳到明天)。錯在拿它去格式化一個沒有時區的日曆日:
   * 存進來的 visitDate 是「五月一日」這個日子,不是某個瞬間,來回換算就會漂。 */
  const fmt = (t) => {
    const d = new Date(t);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  };

  // metric lanes:出現次數最多的前 4 個
  const mCount = new Map();
  notes.forEach((n) => (n.outcomeMetrics || []).forEach((m) => mCount.set(m.metricId, (mCount.get(m.metricId) || 0) + 1)));
  const topMetrics = [...mCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => id);

  let y = 30, rows = [];
  // 軸
  rows.push(`<line x1="40" y1="20" x2="960" y2="20" class="sw-axis"/>
    <text x="40" y="12" class="sw-t">${fmt(min)}</text><text x="960" y="12" class="sw-t" text-anchor="end">${fmt(max)}</text>`);
  notes.forEach((n) => { const x = X(swimDateToNum(n.visitDate).t); rows.push(`<line x1="${x}" y1="16" x2="${x}" y2="24" class="sw-axis"/>`); });

  for (const id of topMetrics) {
    const def = getOutcomeMetricDef(id);
    const label = def ? (def.label_zh || def.name) : id;
    const pts = notes.map((n) => { const m = (n.outcomeMetrics || []).find((x) => x.metricId === id); return m ? { x: X(swimDateToNum(n.visitDate).t), v: m.valueNumber } : null; }).filter(Boolean);
    if (!pts.length) continue;
    const vals = pts.map((p) => p.v), vmin = Math.min(...vals), vmax = Math.max(...vals);
    const Y = (v) => y + 26 - (vmax === vmin ? 13 : ((v - vmin) / (vmax - vmin)) * 22);
    rows.push(`<text x="4" y="${y + 14}" class="sw-lane">${escapeHtml(String(label).slice(0, 14))}</text>`);
    if (pts.length > 1) rows.push(`<polyline points="${pts.map((p) => `${p.x},${Y(p.v)}`).join(" ")}" class="sw-line"/>`);
    pts.forEach((p) => rows.push(`<circle cx="${p.x}" cy="${Y(p.v)}" r="3.5" class="sw-dot"/><text x="${p.x}" y="${Y(p.v) - 6}" class="sw-v" text-anchor="middle">${p.v}</text>`));
    y += 34;
  }

  // Patterns lane — 同一實體一條的畫法跟下面 exposures lane 一致:每個歷史上
  // 出現過的證型各自一條,同證型跨診連成一條橫線,線上的 dot 是它出現過的診。
  // patternId 取 tcmPatternSelections(primary+secondary 都算,一診可能同時屬於
  // 好幾條),沒有才退回 tcmPatternLinks。
  const patternOcc = new Map();
  notes.forEach((n) => {
    const ids = (n.tcmPatternSelections && n.tcmPatternSelections.length)
      ? n.tcmPatternSelections.map((s) => s.patternId).filter(Boolean)
      : (n.tcmPatternLinks || []);
    const x = X(swimDateToNum(n.visitDate).t);
    [...new Set(ids)].forEach((id) => {
      if (!patternOcc.has(id)) patternOcc.set(id, []);
      patternOcc.get(id).push(x);
    });
  });
  for (const [pid, xs] of patternOcc) {
    const label = resolvePatternName(pid);
    const x1 = Math.min(...xs), x2 = Math.max(...xs);
    rows.push(`<text x="4" y="${y + 12}" class="sw-lane">${escapeHtml(String(label).slice(0, 14))}</text>`);
    if (xs.length > 1) rows.push(`<line x1="${x1}" y1="${y + 9}" x2="${x2}" y2="${y + 9}" class="sw-pattern-line"/>`);
    xs.forEach((x) => rows.push(`<circle cx="${x}" cy="${y + 9}" r="3" class="sw-pattern-mark"/>`));
    y += 22;
  }

  // Points lane — 單一條,一診一個標記;hover(<title>)顯示該診穴位清單。
  const pointVisits = notes.filter((n) => (n.acupointLinks && n.acupointLinks.length) || n.pointsUsed);
  if (pointVisits.length) {
    rows.push(`<text x="4" y="${y + 12}" class="sw-lane">用穴 Points</text>`);
    pointVisits.forEach((n) => {
      const x = X(swimDateToNum(n.visitDate).t);
      const list = (n.acupointLinks && n.acupointLinks.length) ? n.acupointLinks.join(" ") : n.pointsUsed;
      rows.push(`<circle cx="${x}" cy="${y + 9}" r="3.5" class="sw-point-mark"><title>${escapeHtml(list)}</title></circle>`);
    });
    y += 22;
  }

  // Formulas lane — 單一條,formulaLinks 解析成中文名;方劑換掉的那一診標記換色
  // 並加一條垂直虛線,看得出換方的時間點。只讀 formulaLinks(結構化 id),不退回
  // formulaHerbs 自由文字 —— 換方偵測需要可比對的 id,自由文字比不出「換了」。
  const formulaVisits = notes.filter((n) => n.formulaLinks && n.formulaLinks.length);
  if (formulaVisits.length) {
    rows.push(`<text x="4" y="${y + 12}" class="sw-lane">方劑 Formulas</text>`);
    let prevSig = null;
    formulaVisits.forEach((n) => {
      const x = X(swimDateToNum(n.visitDate).t);
      const names = n.formulaLinks.map(resolveFormulaName).join(" · ");
      const sig = [...n.formulaLinks].slice().sort().join("|");
      const changed = prevSig !== null && sig !== prevSig;
      if (changed) rows.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 18}" class="sw-formula-change"/>`);
      rows.push(`<circle cx="${x}" cy="${y + 9}" r="3.5" class="sw-formula-mark${changed ? " sw-formula-mark-changed" : ""}"><title>${escapeHtml(names)}</title></circle>`);
      prevSig = sig;
    });
    y += 22;
  }

  // 用藥/暴露變動 lane — 已存在的 exposures bar 就是這條(每個 agentExposure 一條
  // bar,marker 來自 events[]);這裡只補 hover title(藥名:eventType),不另開
  // 一條重複的 lane 畫同一份 item.agentExposures[].events[] 資料。
  for (const e of expos.slice(0, 6)) {
    const ts = e.evs.map((x) => x.d.t);
    const x1 = X(Math.min(...ts));
    const stopped = e.evs.some((x) => /stop|discontinu/i.test(x.type)) || /stopped|past/i.test(e.status);
    const x2 = stopped ? X(Math.max(...ts)) : 960;
    rows.push(`<text x="4" y="${y + 12}" class="sw-lane">${escapeHtml(String(e.label).slice(0, 14))}</text>
      <rect x="${x1}" y="${y + 4}" width="${Math.max(x2 - x1, 4)}" height="10" rx="5" class="sw-bar${stopped ? " sw-bar-stopped" : ""}"/>`);
    e.evs.forEach((x) => rows.push(`<circle cx="${X(x.d.t)}" cy="${y + 9}" r="3" class="sw-ev${x.d.coarse ? " sw-coarse" : ""}"><title>${escapeHtml(`${e.label}:${x.type}`)}</title></circle>`));
    y += 22;
  }

  const aes = [];
  notes.forEach((n) => (n.adverseEvents || []).forEach((a) => aes.push({ x: X(swimDateToNum(n.visitDate).t), sev: a.severity || "mild" })));
  if (aes.length) {
    rows.push(`<text x="4" y="${y + 12}" class="sw-lane">AE</text>`);
    aes.forEach((a) => rows.push(`<path d="M ${a.x} ${y + 3} l 5 9 h -10 z" class="sw-ae sw-ae-${escapeHtml(a.sev)}"/>`));
    y += 22;
  }

  return `<div class="swimlane-panel"><div class="timeline-head"><strong>病程泳道 Timeline</strong><small class="timeline-date">${notes.length} visits</small></div>
    <svg viewBox="0 0 1000 ${y + 8}" preserveAspectRatio="xMidYMin meet">${rows.join("")}</svg></div>`;
}

/* ── 診務回顧 Practice Audit ────────────────────────────────────────────
 *
 * Knowledge OS 迴圈的回饋端:臨床使用 → 結構化資料 → 回顧 → 知識缺口。
 * 目的是把「還有 300 張卡要填」換成「我的病例正在需要這 12 張」。
 *
 * 計算全部在 js/practice-audit.js —— 這裡只負責畫。月審 CLI 會呼叫同一份
 * 計算,所以畫面與腳本不可能出現兩套數字(P1 transport 的 MED-4 就是
 * app 一套規則、CLI 一套規則漂移出來的)。
 *
 * 這一層唯一的職責邊界:**不得在畫面上補計算層刻意不說的話。**
 * 沒有具名來源的 metric,計算層只給變化量與 caveat,畫面就照樣只畫那兩個,
 * 不准自己加箭頭顏色或「改善」字樣去暗示臨床顯著性。 */
function renderPracticeAuditPanel() {
  const panel = document.getElementById("practiceAuditPanel");
  if (!panel) return;
  panel.hidden = !practiceAuditOpen;
  const btn = document.getElementById("practiceAuditBtn");
  if (btn) btn.setAttribute("aria-pressed", practiceAuditOpen ? "true" : "false");
  if (!practiceAuditOpen) { panel.innerHTML = ""; return; }

  const engine = globalThis.AcuTingPracticeAudit;
  if (!engine || typeof engine.computePracticeAudit !== "function") {
    // fail loud:寧可明說算不出來,也不要畫一份空表讓人以為「都是 0」
    panel.innerHTML = `<div class="case-empty">診務回顧模組未載入(js/practice-audit.js),無法計算。這不是「沒有資料」,是算不出來。</div>`;
    return;
  }
  const r = engine.computePracticeAudit({ cases: clinicalCases, knowledge: globalThis.ACUTING_KNOWLEDGE });
  const num = (v, suffix) => (v === null || v === undefined ? "—" : `${v}${suffix || ""}`);
  const stat = (label, value, hint) =>
    `<div class="pa-stat"><small>${escapeHtml(label)}</small><strong>${escapeHtml(String(value))}</strong>${hint ? `<em>${escapeHtml(hint)}</em>` : ""}</div>`;

  const usedList = (rows, empty) => rows.length
    // known === false = 查過但知識庫裡沒有這張卡,標出來而不是安靜顯示 id。
    // undefined = 這一類本來就不查表(穴位是 LI4 這種代碼),不標。
    ? `<ol class="pa-used">${rows.map((u) => `<li><span>${escapeHtml(u.name || u.id)}</span>${u.known === false ? `<em class="pa-basis pa-basis-none">知識庫沒有這張卡</em>` : ""}<small>${u.visits} 診 · ${u.cases} 例</small></li>`).join("")}</ol>`
    : `<p class="pa-empty">${escapeHtml(empty)}</p>`;

  const verdictRows = Object.entries(r.verdictMix)
    .map(([k, v]) => `<li><span>${escapeHtml(OUTCOME_VERDICTS[k]?.zh || k)}</span><small>${v} 診</small></li>`).join("");

  const outcomeRows = r.outcomeChanges.map((o) => {
    const dir = o.medianChange === null ? "—" : (o.medianChange > 0 ? `+${o.medianChange}` : String(o.medianChange));
    // 有具名來源才給得出「拿什麼對照」;沒有的就明寫沒有,不留空白讓人自行想像
    const basis = o.interpretable
      ? `<em class="pa-basis" title="${escapeHtml(o.interpretationText)}">可對照:${escapeHtml(shortCitation(o.interpretationSource))}</em>`
      : `<em class="pa-basis pa-basis-none">${escapeHtml(o.caveat)}</em>`;
    // 第二個軸(D20):正常範圍有具名來源,但不是改善閾值 —— 跟上面那行分開列,
    // 不要合成一句,合成會讓「有範圍」看起來像「有閾值」。scope 放進 title,
    // 那是這個數字唯一的圍欄。
    const refRange = !o.interpretable && o.referenceRange
      ? `<em class="pa-basis pa-basis-refrange" title="${escapeHtml(o.referenceRange.text)}\n適用範圍：${escapeHtml(o.referenceRange.scope)}">參考範圍:${escapeHtml(shortCitation(o.referenceRange.source))}</em>`
      : "";
    return `<li><span>${escapeHtml(o.label)}</span><strong>${escapeHtml(dir)}${escapeHtml(o.unitDisplay ? " " + o.unitDisplay : "")}</strong><small>${o.casesMeasured} 例有前後值</small>${basis}${refRange}</li>`;
  }).join("");

  /* 缺口要能點開那張卡,否則「病例正在需要這 12 張」還是要自己去搜,迴圈沒閉。
   * 但**只有真的開得起來的才做成可點的** —— 逐筆問 canOpenKnowledgeRecord,
   * 不是看 API 在不在。缺口是從 patternLibrary / patternRegistry /
   * tcmPatternCanon 三個區塊找出來的,而開卡只認得 patternLibrary(且排除
   * deprecated);只在 registry 裡的證型會通過缺口那關卻開不起來。 */
  const gapKindToRecord = { "方劑": "formula", "證型": "pattern" };
  const gapRows = r.knowledgeGaps.map((g) => {
    const recordKind = gapKindToRecord[g.kind] || "";
    const canOpen = canOpenKnowledgeRecord(recordKind, g.id);
    const inner = `<span class="pa-gap-kind">${escapeHtml(g.kind)}</span><span>${escapeHtml(g.name)}</span><small>${g.visits} 診 · ${g.cases} 例</small><em>${escapeHtml(g.maturityLabel)}</em>`;
    return canOpen
      ? `<li><button type="button" class="pa-gap-open" data-gap-kind="${escapeHtml(recordKind)}" data-gap-id="${escapeHtml(g.id)}" title="開啟這張卡">${inner}</button></li>`
      : `<li>${inner}</li>`;
  }).join("");

  panel.innerHTML = `
    <div class="timeline-head">
      <strong>診務回顧 Practice Audit</strong>
      <small class="timeline-date">${r.volume.firstVisitDate || "—"} → ${r.volume.lastVisitDate || "—"} · 本機資料,不外送</small>
    </div>
    <div class="pa-stats">
      ${stat("病人 Patients", r.volume.patients)}
      ${stat("病例 Cases", r.volume.cases)}
      ${stat("就診 Visits", r.volume.visits, r.volume.undatedVisits ? `${r.volume.undatedVisits} 診沒有日期` : "")}
      ${stat("回診率 Follow-up", num(r.followUp.followUpRatePct, "%"), `${r.followUp.singleVisitCases} 例只來過一次`)}
      ${stat("療效判定填寫率", num(r.completeness.verdictRatePct, "%"), `${r.completeness.visitsWithVerdict} / ${r.volume.visits} 診`)}
      ${stat("Outcome 數值填寫率", num(r.completeness.metricRatePct, "%"), `${r.completeness.visitsWithMetric} / ${r.volume.visits} 診`)}
      ${stat("不良事件率 AE", num(r.adverseEvents.aeRatePct, "%"), `${r.adverseEvents.visitsWithAe} 診有記錄`)}
    </div>

    <div class="pa-cols">
      <div class="pa-col">
        <h4>療效判定分佈</h4>
        ${verdictRows ? `<ul class="pa-list">${verdictRows}</ul>` : `<p class="pa-empty">還沒有任何一診填過療效判定。</p>`}
        <h4>Outcome 變化(首診 → 末診中位數)</h4>
        ${outcomeRows ? `<ul class="pa-list pa-outcome">${outcomeRows}</ul>` : `<p class="pa-empty">還沒有任何 metric 在同一病例被測過兩次以上。</p>`}
        <h4>不良事件</h4>
        ${Object.keys(r.adverseEvents.bySeverity).length
          ? `<ul class="pa-list">${Object.entries(r.adverseEvents.bySeverity).map(([k, v]) => `<li><span>${escapeHtml(k)}</span><small>${v} 筆</small></li>`).join("")}</ul>`
          : `<p class="pa-empty">沒有記錄到不良事件。</p>`}
      </div>
      <div class="pa-col">
        <h4>最常用穴位</h4>${usedList(r.mostUsed.points, "還沒有記錄用穴。")}
        <h4>最常用方劑</h4>${usedList(r.mostUsed.formulas, "還沒有記錄方劑。")}
        <h4>最常用證型</h4>${usedList(r.mostUsed.patterns, "還沒有記錄證型。")}
      </div>
    </div>

    <div class="pa-gaps">
      <h4>知識缺口 — 病例正在需要,但卡片還不到位(${r.knowledgeGapTotal} 項)</h4>
      ${gapRows
        ? `<ul class="pa-list pa-gap-list">${gapRows}</ul>`
        : `<p class="pa-empty">目前用到的方劑與證型卡片都已有來源。</p>`}
    </div>

    <details class="pa-notstated">
      <summary>這份回顧刻意不說什麼</summary>
      <ul>${r.notStated.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
    </details>
  `;

  // 面板每次重畫都是新的 DOM,所以在這裡綁,不要用全域委派 —— 全域委派會在
  // 面板收起來之後還留著,是另一種安靜的漏。
  panel.querySelectorAll("[data-gap-id]").forEach((btn) => {
    btn.addEventListener("click", () => openKnowledgeRecord(btn.dataset.gapKind, btn.dataset.gapId));
  });
}

function renderVisitBrief(item, notesDesc) {
  if (!notesDesc.length) return "";
  const L = notesDesc[0], P = notesDesc[1] || null;
  const rows = [];
  // 1. metric 差值(direction_good 上色)
  const ids = [...new Set([...(L.outcomeMetrics || []), ...((P && P.outcomeMetrics) || [])].map((m) => m.metricId))];
  for (const id of ids) {
    const def = getOutcomeMetricDef(id);
    const lv = (L.outcomeMetrics || []).find((m) => m.metricId === id)?.valueNumber;
    const pv = P ? (P.outcomeMetrics || []).find((m) => m.metricId === id)?.valueNumber : undefined;
    if (lv === undefined && pv === undefined) continue;
    // FIX D 延伸(Dry Clinic #15 實測第三處):visit-brief 差值列同為
    // 唯讀掃視面,用 panel 短標籤,語意註解不外漏。
    const label = outcomeMetricPanelLabel(id);
    let delta = "", cls = "";
    if (lv !== undefined && pv !== undefined && lv !== pv) {
      const arrow = lv > pv ? "↑" : "↓";
      const good = def && def.direction_good === "decrease" ? lv < pv : def && def.direction_good === "increase" ? lv > pv : null;
      cls = good === true ? "brief-good" : good === false ? "brief-bad" : "";
      delta = `${pv} → ${lv} ${arrow}`;
    } else {
      delta = lv !== undefined ? `${pv !== undefined ? pv + " → " : ""}${lv}` : `${pv}(本次未測)`;
    }
    rows.push(`<div class="brief-row ${cls}"><small>${escapeHtml(label)}</small><span>${escapeHtml(delta)}</span></div>`);
  }
  // 1.5 上次治療 Last treatment — 全部讀既有欄位,不新增資料。找不到上一診
  // (首診)時整塊不畫,改印一行「初診」;有上一診但個別欄位沒填,那一列
  // 直接不印(不留空白列)。
  let lastTreatmentHtml = "";
  if (P) {
    const ltRows = [];
    const pointsText = (P.acupointLinks && P.acupointLinks.length) ? P.acupointLinks.join(" · ") : (P.pointsUsed || "");
    if (pointsText) ltRows.push(["用穴", pointsText]);
    const formulaText = (P.formulaLinks && P.formulaLinks.length)
      ? P.formulaLinks.map(resolveFormulaName).join(" · ")
      : (P.formulaHerbs || "");
    if (formulaText) ltRows.push(["方劑", formulaText]);
    const modalityText = (P.modalitiesPerformed || []).map(resolveModalityName).join(" · ");
    if (modalityText) ltRows.push(["處置", modalityText]);
    const retentionParts = [];
    if (P.retentionMinutes !== "" && P.retentionMinutes !== undefined && P.retentionMinutes !== null) retentionParts.push(`${P.retentionMinutes} 分鐘`);
    if (P.technique) retentionParts.push(P.technique);
    if (retentionParts.length) ltRows.push(["留針/手法", retentionParts.join(" · ")]);
    if (P.effectDurationDays !== "" && P.effectDurationDays !== undefined && P.effectDurationDays !== null) ltRows.push(["效果維持", `約 ${P.effectDurationDays} 天`]);
    if (P.advice) ltRows.push(["醫囑", P.advice.length > 60 ? P.advice.slice(0, 60) + "…" : P.advice]);
    const aeCount = (L.adverseEvents || []).length;
    ltRows.push(["上次以來的不良事件", aeCount ? `本次記錄 ${aeCount} 筆` : "無"]);
    if (L.patientPerspective) ltRows.push(["病人今日優先事項", L.patientPerspective]);
    lastTreatmentHtml = `<div class="brief-last">
      <small class="brief-last-label">上次治療 Last treatment</small>
      ${ltRows.map(([label, val]) => `<div class="brief-row"><small>${escapeHtml(label)}</small><span>${escapeHtml(val)}</span></div>`).join("")}
    </div>`;
  } else {
    lastTreatmentHtml = `<div class="brief-last brief-last-empty">初診，沒有前次紀錄</div>`;
  }
  // 2. 上次就診的 ledger 事件(用藥/補充劑/暴露變化)
  const changes = [];
  for (const [arr, kindZh] of [[item.agentExposures || [], ""], [item.environmentalExposures || [], "暴露 "]]) {
    for (const row of arr) {
      for (const ev of row.events || []) {
        if (ev.visitId === L.id) {
          const name = row.nameText || row.agentId || row.exposureId || "";
          changes.push(`${kindZh}${name}:${ev.eventType}${ev.doseText ? " → " + ev.doseText : ""}${ev.certainty ? " → " + ev.certainty : ""}`);
        }
      }
    }
  }
  // 3. 生活型態差值
  for (const f of L.lifestyleFactors || []) {
    const prev = P ? (P.lifestyleFactors || []).find((x) => x.factorId && x.factorId === f.factorId) : null;
    if (prev && prev.valueNumber !== "" && f.valueNumber !== "" && prev.valueNumber !== f.valueNumber) {
      changes.push(`${f.factorId.replace("life.", "")}:${prev.valueNumber} → ${f.valueNumber} ${f.unit || ""}`);
    }
  }
  // 4. ⚠ REVIEW:未緩解 AE、certainty 晉升、壞方向大變化
  const review = [];
  for (const ae of L.adverseEvents || []) {
    if (ae.resolutionStatus === "ongoing" || ae.resolutionStatus === "") review.push(`AE 未緩解:${ae.nameText || ae.eventId}`);
  }
  for (const row of item.environmentalExposures || []) {
    for (const ev of row.events || []) if (ev.visitId === L.id && ev.eventType === "certainty_changed") review.push(`暴露確定度變更:${row.nameText || row.exposureId} → ${ev.certainty}`);
  }
  if (!rows.length && !changes.length && !review.length && !lastTreatmentHtml) return "";
  return `
    <div class="visit-brief">
      <div class="timeline-head"><strong>Visit Brief · 上次以來</strong><small class="timeline-date">${escapeHtml(L.visitDate || "")}${P ? ` vs ${escapeHtml(P.visitDate || "")}` : "(首診)"}</small></div>
      ${rows.length ? `<div class="brief-grid">${rows.join("")}</div>` : ""}
      ${lastTreatmentHtml}
      ${changes.length ? `<div class="brief-changes"><small>變化 Changes</small><span>${changes.map(escapeHtml).join(" · ")}</span></div>` : ""}
      ${review.length ? `<div class="brief-review">⚠ ${review.map(escapeHtml).join(" · ")}</div>` : ""}
    </div>`;
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
    ${renderVisitBrief(item, notes)}
    ${renderCareReadinessPanel(item, notes)}
    ${renderOutcomeTrackingPanel(item)}
    ${renderAgentExposuresPanel(item)}
    ${renderEnvironmentalExposuresPanel(item)}
    ${renderCaseSwimlanes(item, [...notes].reverse())}
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
  // Phase D: Meds & Supplements ledger (agentExposures[]) — add button opens
  // the dialog, row action buttons go through applyExposureChange (the only
  // authorized ledger-write path, docs/AI_WORK_HANDOFF.md HANDOFF #3).
  document.querySelector("#addAgentExposureInline")?.addEventListener("click", () => openAgentExposureEditor());
  caseDetail.querySelectorAll("[data-agent-exposure-action]").forEach((button) => {
    button.addEventListener("click", () => {
      promptAgentExposureAction(button.dataset.exposureId, button.dataset.agentExposureAction);
    });
  });
  // Phase D batch 3: Environmental exposures ledger (environmentalExposures[])
  // — same wiring shape as the Meds & Supplements block above.
  document.querySelector("#addEnvironmentalExposureInline")?.addEventListener("click", () => openEnvironmentalExposureEditor());
  caseDetail.querySelectorAll("[data-env-exposure-action]").forEach((button) => {
    button.addEventListener("click", () => {
      promptEnvironmentalExposureAction(button.dataset.exposureId, button.dataset.envExposureAction);
    });
  });
  caseDetail.querySelectorAll("[data-edit-soap]").forEach((button) => {
    button.addEventListener("click", () => {
      const note = item.soapNotes.find((entry) => entry.id === button.dataset.editSoap);
      openSoapEditor(note);
    });
  });
  // AVS v3:Visit-level Checkout(§3 Step 2)。
  caseDetail.querySelectorAll("[data-checkout-soap]").forEach((button) => {
    button.addEventListener("click", () => {
      const note = item.soapNotes.find((entry) => entry.id === button.dataset.checkoutSoap);
      if (note) openAvsCheckout(note.id);
    });
  });
  // CARE readiness 面板的「產生草稿」——徽章早就告訴你缺什麼,但沒有按鈕能把
  // 已經齊備的那些欄位實際組成草稿。這裡補上那顆按鈕。
  caseDetail.querySelectorAll("[data-care-draft]").forEach((button) => {
    button.addEventListener("click", () => downloadCareDraft(item));
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

// Gate 3 herb.* structured capture path — same shape as formulaPickerOptions,
// reading the herb canon shortlist instead of the formula library.
function herbPickerOptions() {
  const records = globalThis.ACUTING_KNOWLEDGE?.herbs?.records || [];
  return records.map((h) => ({
    value: h.id,
    label: `${h.name_zh || h.id}${h.pinyin ? " · " + h.pinyin : ""}`,
    terms: `${h.name_zh || ""} ${h.pinyin || ""} ${h.name_en || ""} ${h.id}`.toLowerCase(),
    meta: h.pinyin || h.name_en || "",
  }));
}

// TCM pattern primary/secondary reconciliation (2026-08-09,
// docs/SOAP_FOLLOWUP_TRACKING_AUDIT.md §9 ranked item #1). Three optional
// behaviors added for the primary/secondary pattern pickers, all opt-in via
// `opts` so every existing call (acupointLinks, formulaLinks, ...) is
// unaffected:
//   single         one chip only; picking a new one replaces it (does not
//                  destroy it — see opts.onPick below).
//   onPick(v, old) fires only in single mode when the value actually
//                  changes. Lets the caller decide what happens to the
//                  displaced value instead of silently dropping it.
//   excludeValues  fn returning ids to hide from this field's own search
//                  results — used so the secondary picker can't offer
//                  whatever the primary picker currently holds.
function enhanceLinkField(form, fieldName, buildOptions, opts = {}) {
  const textarea = form?.elements?.[fieldName];
  if (!textarea || textarea.dataset.pickerReady) return;
  textarea.dataset.pickerReady = "1";
  textarea.hidden = true;
  const single = !!opts.single;
  const onPick = typeof opts.onPick === "function" ? opts.onPick : null;
  const excludeValues = typeof opts.excludeValues === "function" ? opts.excludeValues : () => [];

  const wrap = document.createElement("div");
  wrap.className = "link-picker";
  const chips = document.createElement("div");
  chips.className = "link-chips";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "link-picker-input";
  input.setAttribute("autocomplete", "off");
  input.placeholder = "輸入中文 / 拼音 / 代碼，從清單選取…";
  // Dry Clinic log #1/#2: cheap ARIA combobox wiring — a unique per-instance
  // id (not a shared module counter) so two dialogs open at once never
  // collide on aria-activedescendant targets.
  const uid = `linkpicker-${fieldName}-${Math.random().toString(36).slice(2, 8)}`;
  const menu = document.createElement("div");
  menu.className = "link-picker-menu";
  menu.id = `${uid}-menu`;
  menu.setAttribute("role", "listbox");
  menu.hidden = true;
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-controls", menu.id);
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
  function closeMenu() {
    menu.hidden = true;
    activeIndex = -1;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }
  function addValue(v) {
    if (single) {
      const old = getValues()[0] || null;
      setValues([v]);
      if (onPick && old !== v) onPick(v, old);
    } else {
      setValues([...getValues(), v]);
    }
    input.value = "";
    closeMenu();
    input.focus();
  }
  function renderMenu() {
    ensureOptions();
    const q = input.value.trim().toLowerCase();
    const qCompact = q.replace(/\s+/g, "");
    const chosen = new Set(getValues());
    const excluded = new Set(excludeValues());
    const matches = !q ? [] : options
      .filter((o) => !chosen.has(o.value) && !excluded.has(o.value) && (o.terms.includes(q) || o.terms.replace(/\s+/g, "").includes(qCompact)))
      .slice(0, 8);
    if (!matches.length) { closeMenu(); return; }
    menu.innerHTML = "";
    matches.forEach((o, i) => {
      const el = document.createElement("div");
      const optionId = `${uid}-option-${i}`;
      el.id = optionId;
      el.className = "link-picker-option" + (i === activeIndex ? " active" : "");
      el.setAttribute("role", "option");
      el.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
      el.innerHTML = `<span></span><small></small>`;
      el.firstChild.textContent = o.label;
      el.lastChild.textContent = o.value;
      el.addEventListener("mousedown", (e) => { e.preventDefault(); addValue(o.value); });
      menu.appendChild(el);
    });
    menu.hidden = false;
    menu._matches = matches;
    input.setAttribute("aria-expanded", "true");
    input.setAttribute("aria-activedescendant", activeIndex >= 0 ? `${uid}-option-${activeIndex}` : "");
  }
  input.addEventListener("input", () => { activeIndex = -1; renderMenu(); });
  input.addEventListener("focus", () => { if (input.value.trim()) renderMenu(); });
  input.addEventListener("blur", () => setTimeout(closeMenu, 120));
  input.addEventListener("keydown", (e) => {
    const m = menu._matches || [];
    // Dry Clinic log #2 (every-visit friction): full keyboard flow so a
    // clinical typing session never has to reach for the mouse. Arrow keys
    // wrap around the currently rendered options; Enter picks the active
    // option or, if none highlighted yet, the first match; Escape closes
    // just the menu — it must not fall through to the <dialog>'s native
    // Escape-to-close (stopPropagation), and only when the menu is actually
    // open (an Escape with no menu showing should close the dialog as usual).
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (m.length) activeIndex = (activeIndex + 1) % m.length;
      renderMenu();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (m.length) activeIndex = (activeIndex - 1 + m.length) % m.length;
      renderMenu();
    } else if (e.key === "Enter") {
      if (m.length) { e.preventDefault(); addValue(m[activeIndex >= 0 ? activeIndex : 0].value); }
    } else if (e.key === "Escape") {
      if (!menu.hidden) {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
      }
    }
  });

  linkPickerControllers[fieldName] = {
    sync() { ensureOptions(); renderChips(getValues()); input.value = ""; closeMenu(); },
    getValues,
    setValues,
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

// Gate 3 sym.* structured capture path — same shape as
// easternDiseasePickerOptions, reading the symptom vocabulary instead of tdis.
function symptomPickerOptions() {
  const records = globalThis.ACUTING_KNOWLEDGE?.symptoms?.records || [];
  return records.map((s) => ({
    value: s.id,
    label: `${s.name_zh || s.id}${s.pinyin ? " · " + s.pinyin : (s.name_en ? " · " + s.name_en : "")}`,
    terms: `${s.name_zh || ""} ${s.pinyin || ""} ${s.name_en || ""} ${(s.aliases_zh || []).join(" ")} ${(s.aliases_en || []).join(" ")} ${s.id}`.toLowerCase(),
    meta: s.id,
  }));
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

// INDEPENDENT_AUDIT_2026-08-11 #3-adjacent / TOP-10 #5: this picker used to
// read `medications.records` — the 12 legacy `med.*` stubs (D15: all 12
// contraindications empty, draft-only) — while the 40 full SPL-transcribed
// `drug.*` cards (ACUTING_KNOWLEDGE.pharmDrugs.records, build-data.js:147)
// sat unreachable from clinical UI. D15/D17 gate: a Visit saved after the
// migration must never MINT a new med.* reference; med.* is compatibility-
// only, kept so pre-migration notes keep resolving. This picker is the only
// place medicationLinks values get minted, so switching its source to
// pharmDrugs is sufficient — it does not touch any note that already links
// med.* (searched app.js for a "med."-prefix resolver / id-based dispatch on
// medicationLinks: none exists — formatNoteList()/the "Treatment record
// links" row render every linked id as raw text with no lookup, so an
// existing med.* id and a new drug.* id both already display correctly
// with zero extra wiring; data/config/medication_alias_map.json exists on
// disk from scripts/build-medication-alias-map.js but is not read by
// build-data.js into ACUTING_KNOWLEDGE, so it is out of this fix's scope —
// bundle untouched).
function medicationPickerOptions() {
  const records = globalThis.ACUTING_KNOWLEDGE?.pharmDrugs?.records || [];
  return records.map((d) => ({
    value: d.id,
    label: `${d.name_zh || d.id}${d.name_en ? " · " + d.name_en : ""}`,
    terms: `${d.name_zh || ""} ${d.name_en || ""} ${(d.brand_names_en || []).join(" ")} ${d.id}`.toLowerCase(),
    meta: d.id,
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
  enhanceLinkField(soapForm, "acupointLinks", pointPickerOptions);
  enhanceLinkField(soapForm, "formulaLinks", formulaPickerOptions);
  // Primary/secondary TCM pattern reconciliation replaces the old single
  // multi-select tcmPatternLinks field. tcmPatternPrimary is set up FIRST —
  // its onPick closure reads linkPickerControllers.tcmPatternSecondary at
  // CLICK time, not at setup time, so definition order here only matters
  // in that tcmPatternSecondary must exist by the time a user can actually
  // click anything, which the very next line guarantees.
  enhanceLinkField(soapForm, "tcmPatternPrimary", patternPickerOptions, {
    single: true,
    onPick: (newId, oldId) => {
      const secondary = linkPickerControllers.tcmPatternSecondary;
      if (!secondary) return;
      let vals = secondary.getValues();
      // Demote: the displaced primary is not destroyed, it drops to secondary
      // (unless it's already there, or there was no previous primary).
      if (oldId && oldId !== newId && !vals.includes(oldId)) vals = [...vals, oldId];
      // Promote: if the newly-picked primary was already listed as
      // secondary, remove it there — a pattern is never both at once.
      vals = vals.filter((v) => v !== newId);
      secondary.setValues(vals);
    },
  });
  enhanceLinkField(soapForm, "tcmPatternSecondary", patternPickerOptions, {
    excludeValues: () => linkPickerControllers.tcmPatternPrimary?.getValues() || [],
  });
  enhanceLinkField(soapForm, "easternDiseaseLinks", easternDiseasePickerOptions);
  enhanceLinkField(soapForm, "westernConditionLinks", westernConditionPickerOptions);
  enhanceLinkField(soapForm, "medicationLinks", medicationPickerOptions);
  enhanceLinkField(soapForm, "safetyFlagLinks", safetyFlagPickerOptions);
  enhanceLinkField(soapForm, "symptomLinks", symptomPickerOptions);   // Gate 3 sym.*
  enhanceLinkField(soapForm, "herbLinks", herbPickerOptions);         // Gate 3 herb.*
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
          ${avsStatusBadge(note)}
          <button class="ghost" type="button" data-edit-soap="${escapeAttribute(note.id)}">編輯</button>
          <button class="ghost" type="button" data-checkout-soap="${escapeAttribute(note.id)}">結帳 Checkout</button>
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
      ${(note.tcmPatternSelections?.length || note.tcmPattern || note.pathomechanism || note.treatmentPrinciple) ? `
      <div class="tcm-dx-row">
        ${note.tcmPatternSelections?.length ? `<div><small>證型 Pattern</small><span>${escapeHtml(formatPatternSelections(note.tcmPatternSelections))}</span></div>` : ""}
        ${note.tcmPattern ? `<div><small>證型/病機記錄 Dx notes</small><span>${escapeHtml(note.tcmPattern)}</span></div>` : ""}
        <div><small>病機 Pathomechanism</small><span>${escapeHtml(note.pathomechanism || "—")}</span></div>
        <div><small>治法 Tx principle</small><span>${escapeHtml(note.treatmentPrinciple || "—")}</span></div>
      </div>` : ""}
      <div class="clinical-mini-grid">
        <div><small>用穴 Points</small><span>${linkifyPointsUsed(note.pointsUsed)}</span></div>
        <div><small>手法 Modalities</small><span>${escapeHtml([note.technique, note.modalities].filter(Boolean).join(" · ") || "未填")}</span></div>
        <div><small>方藥 Formula / Herbs</small><span>${linkifyFormulaHerbs(note.formulaHerbs)}</span></div>
        <div><small>生命徵象 Vitals</small><span>${escapeHtml(note.vitals || "—")}</span></div>
        <div><small>療效 Outcomes</small><span>${escapeHtml(note.outcomes || "未填")}</span></div>
        ${formatNumericOutcomeMetrics(note).map(([label, val]) => `<div><small>${escapeHtml(label)}</small><span>${escapeHtml(val)}</span></div>`).join("")}
      </div>
      ${renderLifestyleAdverseEventsView(note)}
      <div class="soap-link-grid">
        <div><small>Western links</small><span>${escapeHtml(formatNoteList(note.westernConditionLinks))}</span></div>
        <div><small>TCM disease links</small><span>${escapeHtml(formatNoteList(note.easternDiseaseLinks))}</span></div>
        <div><small>Pattern links</small><span>${escapeHtml(formatNoteList(note.tcmPatternLinks))}</span></div>
        <div><small>Safety links</small><span>${escapeHtml(formatNoteList(note.safetyFlagLinks))}</span></div>
        <div><small>Symptom links</small><span>${escapeHtml(formatNoteList(note.symptomLinks))}</span></div>
        <div><small>Herb links</small><span>${escapeHtml(formatNoteList(note.herbLinks))}</span></div>
        <div class="wide"><small>Treatment record links</small><span>${escapeHtml(formatNoteList(linkedRecords))}</span></div>
      </div>
      ${(note.referralOrSupervisorQuestion) ? `
      <div class="tcm-dx-row">
        <div class="wide"><small>轉介/督導問題 Referral / supervisor question</small><span>${escapeHtml(note.referralOrSupervisorQuestion)}</span></div>
      </div>` : ""}
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

// FIX A (Dry Clinic #6) — form draft autosave for caseDialog/soapDialog ----
// UI convenience only: lives entirely under CASE_DRAFT_KEY/SOAP_DRAFT_KEY
// (never CASE_STORAGE_KEY), never read by persistClinicalCases/
// loadClinicalCases, and never touched by export/import — those all stay
// scoped to `clinicalCases`, which a draft never becomes part of.
//
// serializeFormDraft/restoreFormDraft round-trip every NAMED form element
// via FormData: plain text/number/select/textarea fields, checkbox groups
// (raceEthnicity, previousTreatment, modalitiesPerformed — restored via the
// existing setCheckboxGroup helper), and every link-picker's HIDDEN
// textarea (westernConditions, tcmPatternLinks, safetyFlagLinks, etc. —
// enhanceLinkField's setValues keeps that textarea's value in sync with the
// chips, and `hidden` does not exclude an element from FormData). Restoring
// those textareas' values and then re-running each controller's `sync()`
// rebuilds the chip UI through the SAME render path used on dialog open —
// full chip restore, not just plain fields.
//
// Documented boundary: the two repeatable row widgets (#lifestyleFactorRows
// / #adverseEventRows) are NOT restored. Their rows are built from
// `<div data-role="...">` elements with no `name` attribute by design (read
// via collectLifestyleFactorRows/collectAdverseEventRows querying
// data-role directly — see wireRepeatableRowContainer above), so they never
// appear in `new FormData(form)` in the first place. A restored draft
// leaves those two sections empty; every other field (including all chip
// pickers and every numeric outcome metric input) is fully covered.
function serializeFormDraft(form) {
  const fields = {};
  new FormData(form).forEach((value, key) => {
    (fields[key] || (fields[key] = [])).push(String(value));
  });
  return fields;
}

// Known gap: FormData omits a checkbox group entirely when NOTHING in it is
// checked, so a draft saved with e.g. raceEthnicity fully unchecked has no
// "raceEthnicity" key at all — restoring it then leaves whatever the
// dialog's own hydrate step already checked untouched, rather than
// force-unchecking. Acceptable for a UI-convenience recovery feature; every
// other field type round-trips exactly.
function restoreFormDraft(form, fields) {
  Object.entries(fields || {}).forEach(([key, values]) => {
    const el = form.elements[key];
    if (!el) return;
    if (typeof RadioNodeList !== "undefined" && el instanceof RadioNodeList && el[0]?.type === "checkbox") {
      setCheckboxGroup(form, key, values);
    } else if (el.type === "checkbox") {
      // Standalone (non-grouped) checkbox — none exist in caseForm/soapForm
      // today, but .value alone would silently no-op on a lone checkbox
      // (checked state is separate from its value attribute), so this is
      // handled explicitly rather than left as a latent gap.
      el.checked = values.includes(el.value);
    } else {
      el.value = values[0] ?? "";
    }
  });
}

function readDraft(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.fields) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDraft(key, context, form) {
  try {
    localStorage.setItem(key, JSON.stringify({
      context,
      savedAt: new Date().toISOString(),
      fields: serializeFormDraft(form)
    }));
  } catch (e) {
    console.error(`draft autosave failed (${key}):`, e);
  }
}

function clearDraft(key) {
  try { localStorage.removeItem(key); } catch { /* best-effort only */ }
}

// ~1s throttle: the first "input" after a save/restore starts a timer: any
// further keystrokes within that window are absorbed, one write fires when
// it elapses. Re-arms on the next input after that. getContext() is called
// at write time (not bind time) so it always reflects whichever case/SOAP
// note is currently open in the dialog.
function wireDraftAutosave(form, key, getContext) {
  let timer = null;
  form.addEventListener("input", () => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      writeDraft(key, getContext(), form);
    }, 1000);
  });
}

function formatDraftTimestamp(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
}

// Inline banner (never window.confirm — a blocking native dialog is exactly
// what log #14/#6 are both reacting against). Pass draft: null to hide it.
function renderDraftBanner(bannerEl, draft, onRestore, onDiscard) {
  if (!bannerEl) return;
  if (!draft) {
    bannerEl.hidden = true;
    bannerEl.innerHTML = "";
    return;
  }
  bannerEl.hidden = false;
  bannerEl.innerHTML = `
    <span>找到未儲存草稿（${escapeHtml(formatDraftTimestamp(draft.savedAt))}）— Unsaved draft found</span>
    <button type="button" class="ghost" data-draft-restore>還原 Restore</button>
    <button type="button" class="ghost" data-draft-discard>捨棄 Discard</button>
  `;
  bannerEl.querySelector("[data-draft-restore]").addEventListener("click", onRestore);
  bannerEl.querySelector("[data-draft-discard]").addEventListener("click", onDiscard);
}

// FIX B (Dry Clinic #14) — save-button click on an :invalid form fires the
// browser's native "invalid" event on every offending field (capture-phase
// only; it does not bubble) and silently blocks "submit" from ever firing —
// which is exactly why saveCaseFromForm/saveSoapFromForm never even run and
// nothing visible happens. Report only the FIRST invalid field (by DOM
// order) so a form with several bad fields doesn't thrash the scroll/message
// on every one of them.
function wireSubmitFailureFeedback(form, errorEl) {
  form.addEventListener("invalid", (event) => {
    // 只找真正的欄位::invalid 也會匹配包住欄位的 form/fieldset 祖先,
    // 那會讓 event.target !== firstInvalid 永遠成立而提前 return(實測抓到)。
    const firstInvalid = form.querySelector("input:invalid, select:invalid, textarea:invalid");
    if (!firstInvalid || event.target !== firstInvalid) return;
    firstInvalid.classList.add("field-invalid");
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    const labelEl = firstInvalid.closest("label");
    const labelText = labelEl
      ? [...labelEl.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent.trim()).filter(Boolean).join(" ")
      : "";
    const fieldName = labelText || firstInvalid.name || firstInvalid.id || "此欄位";
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = `有欄位格式不正確：${fieldName} — ${firstInvalid.validationMessage}`;
    }
    const clear = () => {
      firstInvalid.classList.remove("field-invalid");
      if (errorEl) { errorEl.hidden = true; errorEl.textContent = ""; }
      firstInvalid.removeEventListener("input", clear);
    };
    firstInvalid.addEventListener("input", clear);
  }, true);
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
    startDate: localDateISO(),
    birthYear: "",
    birthYearMonth: "",
    sex: "",
    genderIdentity: "",
    raceEthnicity: [],
    raceEthnicityDetail: "",
    onsetApprox: "",
    chronicity: "",
    coursePattern: "",
    previousTreatment: [],
    previousTreatmentNotes: "",
    baselineSeverity: "",
    occupation: "",
    goals: "",
    chiefComplaint: "",
    historyPresent: "",
    pastHistory: "",
    allergyStatus: "",
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
  renderRaceEthnicityOptions();                                    // build checkboxes from the bundled vocabulary before hydrating
  const CHECKBOX_GROUP_FIELDS = new Set(["raceEthnicity", "previousTreatment"]);
  Object.entries(data).forEach(([key, value]) => {
    if (CHECKBOX_GROUP_FIELDS.has(key)) return;                    // handled below — RadioNodeList.value is meaningless for checkboxes
    if (!caseForm.elements[key]) return;
    caseForm.elements[key].value = Array.isArray(value) ? value.join("、") : value;
  });
  setCheckboxGroup(caseForm, "raceEthnicity", data.raceEthnicity);
  setCheckboxGroup(caseForm, "previousTreatment", data.previousTreatment);
  syncCaseCategoryQuickPick(data.caseCategory);                    // Phase 2: quick-select assist, caseCategory itself is still the stored field
  setupCaseLinkAutocomplete();                                     // Phase 2: idempotent, reuses the SOAP chip-picker mechanism
  Object.values(linkPickerControllers).forEach((c) => c.sync());   // rebuild chips from the values just hydrated above
  if (caseSaveError) { caseSaveError.hidden = true; caseSaveError.textContent = ""; }
  // FIX A — offer a draft back only if it belongs to the SAME target (this
  // exact case being edited, or "new" for a fresh case) so a draft from a
  // different case can never bleed into this one.
  const caseDraftContext = editingCaseId || "new";
  const caseDraft = readDraft(CASE_DRAFT_KEY);
  if (caseDraft && caseDraft.context === caseDraftContext) {
    renderDraftBanner(caseDraftBanner, caseDraft, () => {
      restoreFormDraft(caseForm, caseDraft.fields);   // handles checkbox groups (raceEthnicity/previousTreatment) via setCheckboxGroup internally
      Object.values(linkPickerControllers).forEach((c) => c.sync());
      syncCaseCategoryQuickPick(caseForm.elements.caseCategory.value);
      renderDraftBanner(caseDraftBanner, null);
    }, () => {
      clearDraft(CASE_DRAFT_KEY);
      renderDraftBanner(caseDraftBanner, null);
    });
  } else {
    renderDraftBanner(caseDraftBanner, null);
  }
  caseDialog.showModal();
}

// Initial-intake Phase 2 (2026-08-09) — Category quick-pick ----------------
// docs/CASE_SOAP_FLOW_REVIEW.md's 10 recommended routing tags. This is an
// ASSIST control only: the stored field is still caseForm.elements.caseCategory
// (plain text, unchanged shape/schema). Picking a quick option writes into
// that text field; picking "Other / custom" or typing directly leaves it as
// free text — old/uncommon categories are never lost or forced into the list.
const CASE_CATEGORY_QUICK_VALUES = new Set([
  "fertility", "pain", "digestive", "sleep", "stress_mood",
  "respiratory", "gynecology", "dermatology", "internal_medicine", "general",
]);

function syncCaseCategoryQuickPick(currentCaseCategory) {
  const quick = document.querySelector("#caseCategoryQuick");
  if (!quick) return;
  const val = String(currentCaseCategory || "").trim();
  if (!val) quick.value = "";
  else if (CASE_CATEGORY_QUICK_VALUES.has(val)) quick.value = val;
  else quick.value = "__other__";                                  // legacy/custom value — shown as Other, left untouched in the text field
  if (!quick.dataset.wired) {
    quick.dataset.wired = "1";
    quick.addEventListener("change", () => {
      if (quick.value && quick.value !== "__other__") {
        caseForm.elements.caseCategory.value = quick.value;
      } else if (quick.value === "__other__") {
        caseForm.elements.caseCategory.focus();
      }
    });
  }
}

// Initial-intake Phase 2 (2026-08-09) — reuse the existing SOAP chip-picker
// mechanism (enhanceLinkField/CS4) for the three Case-level baseline fields
// that already hold canonical-id-shaped arrays (westernConditions/
// easternDiseases/tcmPatterns — same splitList/join("、") shape as the SOAP
// *Links fields). No new picker logic, no new vocabulary: same option
// builders SOAP already uses. A legacy value that isn't a canonical id still
// renders as its own chip (label falls back to the raw string) and is never
// silently dropped — see docs/CASE_SOAP_FLOW_REVIEW.md's field notes.
function setupCaseLinkAutocomplete() {
  enhanceLinkField(caseForm, "westernConditions", westernConditionPickerOptions);
  enhanceLinkField(caseForm, "easternDiseases", easternDiseasePickerOptions);
  enhanceLinkField(caseForm, "tcmPatterns", patternPickerOptions);
}

// Initial-intake minimum dataset (2026-08-09) -------------------------------
// Race/ethnicity checkboxes are rendered from data/config/demographic_vocabulary.json
// (bundled as ACUTING_KNOWLEDGE.demographicVocabulary) instead of being
// hard-coded in index.html, so the vocabulary can grow without a code change.
// Idempotent: safe to call every time the case dialog opens.
function renderRaceEthnicityOptions() {
  const container = document.querySelector("#raceEthnicityOptions");
  if (!container) return;
  const options = globalThis.ACUTING_KNOWLEDGE?.demographicVocabulary?.race_ethnicity || [];
  container.innerHTML = options.map((opt) => {
    const label = modeText(`${opt.label_zh} ${opt.label_en}`, opt.label_en);
    return `<label><input type="checkbox" name="raceEthnicity" value="${opt.id}" />${label}</label>`;
  }).join("");
}

// Checkbox groups (repeated <input> sharing one `name`) don't hydrate through
// the generic `form.elements[key].value = ...` loop above — RadioNodeList's
// value setter is only meaningful for radio buttons. This checks the boxes
// whose value is in `values`; every other box in the group is explicitly
// unchecked so re-opening the dialog on a different case never leaks a
// previous case's selections into the group.
function setCheckboxGroup(form, name, values) {
  const wanted = new Set((values || []).map(String));
  form.querySelectorAll(`input[type="checkbox"][name="${name}"]`).forEach((cb) => {
    cb.checked = wanted.has(cb.value);
  });
}

// Initial-intake minimum dataset (2026-08-09): "" (not yet answered) and the
// literal word "unknown" (asked, not known) are kept distinct on purpose —
// both are legitimate, neither is a format error. D4: coarsen, never falsify.
const ONSET_APPROX_RE = /^(\d{4}(-\d{2}(-\d{2})?)?|unknown)$/i;

function saveCaseFromForm(event) {
  event.preventDefault();
  const formData = new FormData(caseForm);
  const data = Object.fromEntries(formData.entries());
  const raceEthnicity = formData.getAll("raceEthnicity");
  const previousTreatment = formData.getAll("previousTreatment");

  const onsetApprox = (data.onsetApprox || "").trim();
  if (onsetApprox && !ONSET_APPROX_RE.test(onsetApprox)) {
    alert("大約發病時間格式須為 YYYY、YYYY-MM、YYYY-MM-DD 或 unknown（可留空）。");
    return;
  }
  const baselineSeverityRaw = (data.baselineSeverity || "").trim();
  if (baselineSeverityRaw && (!/^\d+$/.test(baselineSeverityRaw) || Number(baselineSeverityRaw) < 0 || Number(baselineSeverityRaw) > 10)) {
    alert("初診基準嚴重度須為 0–10 的整數（可留空）。");
    return;
  }

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
    genderIdentity: (data.genderIdentity || "").trim(),
    raceEthnicity,
    raceEthnicityDetail: (data.raceEthnicityDetail || "").trim(),
    onsetApprox,
    chronicity: (data.chronicity || "").trim(),
    coursePattern: (data.coursePattern || "").trim(),
    previousTreatment,
    previousTreatmentNotes: (data.previousTreatmentNotes || "").trim(),
    baselineSeverity: baselineSeverityRaw === "" ? "" : Number(baselineSeverityRaw),
    occupation: (data.occupation || "").trim(),
    goals: (data.goals || "").trim(),
    chiefComplaint: data.chiefComplaint.trim(),
    historyPresent: (data.historyPresent || "").trim(),
    pastHistory: (data.pastHistory || "").trim(),
    allergyStatus: (data.allergyStatus || "").trim(),
    allergies: (data.allergies || "").trim(),
    currentMeds: (data.currentMeds || "").trim(),
    menstrualObHistory: (data.menstrualObHistory || "").trim(),
    lifestyle: (data.lifestyle || "").trim(),
    westernConditions: splitList(data.westernConditions),
    easternDiseases: splitList(data.easternDiseases),
    tcmPatterns: splitList(data.tcmPatterns),
    safetyFlags: splitSafetyFlags(data.safetyFlags),   // FIX C: semicolon/newline split, not comma (Dry Clinic #3)
    summary: data.summary.trim(),
    // HIGH#6 companion rule: an EXISTING record whose legacy createdAt is
    // missing stays missing — stamping edit-time here would falsify creation
    // time. Only a genuinely NEW record gets createdAt = now.
    createdAt: current ? String(current.createdAt || "") : now,
    updatedAt: now,
    soapNotes: current?.soapNotes || []
  });

  if (!nextCase.patientCode || !nextCase.caseTitle) {
    alert("Patient code 和 Case title 必填。");
    return;
  }

  // INDEPENDENT_AUDIT_2026-08-11 #2 / TOP-10 #2: patientCode is a
  // Patient key, not a Case key (D5) — one patient legitimately opens
  // multiple cases (a returning patient with a NEW chief complaint). The
  // old hard block minted a false "already exists, use a different code"
  // alert that pushed Ting toward inventing a second code for the same
  // person — patientId = sha256(patientCode) (D1, irreversible), so a
  // minted code permanently forks that patient's identity going forward.
  // derivePatientsFromCases() (js/clinical-store.js:310) already groups
  // cases by patientCode and was built for multi-case-per-code from C2a —
  // this gate was the only place in app.js still assuming one-code-one-case
  // (searched: no other patientCode equality check in app.js expects a
  // single match). Same code, same patient → confirm, don't block.
  const existingCasesForCode = clinicalCases.filter((item) => item.patientCode === nextCase.patientCode && item.id !== editingCaseId);
  if (existingCasesForCode.length) {
    const titles = existingCasesForCode.map((item) => item.caseTitle || item.patientCode).join("、");
    const proceed = confirm(`此代碼已有 ${existingCasesForCode.length} 筆病例（${titles}）。要為同一位病人開新病例嗎？`);
    if (!proceed) return;
  }

  const snapshot = structuredClone(clinicalCases);
  const prevSelectedCaseId = selectedCaseId;
  if (editingCaseId) {
    clinicalCases = clinicalCases.map((item) => item.id === editingCaseId ? nextCase : item);
  } else {
    clinicalCases = [nextCase, ...clinicalCases];
  }
  selectedCaseId = nextCase.id;
  // R9 gate B: persist failure must not fire noteClinicalSave, close the
  // dialog, or render — roll clinicalCases/selectedCaseId back and keep the
  // form's input intact so the user can retry.
  if (!persistClinicalCases()) {
    clinicalCases = snapshot;
    selectedCaseId = prevSelectedCaseId;
    return;
  }
  noteClinicalSave();   // CS1
  clearDraft(CASE_DRAFT_KEY);   // FIX A: draft is only useful until a real save lands
  caseDialog.close();
  render();
}

function deleteCurrentCase() {
  if (!editingCaseId) return;
  const item = clinicalCases.find((entry) => entry.id === editingCaseId);
  // Codex NO-GO HIGH-2:含已定稿 AVS 的病例禁止 hard-delete —— 定稿文件是
  // 交給過病人的歷史記錄,UI 沒有任何刪除它的路徑;真要銷毀走 Ting 明確
  // 授權的災難流程(匯出備份 + 手動處理),不走這顆按鈕。
  const finalizedAvsCount = (item?.soapNotes || [])
    .reduce((n, note) => n + (note.avsSnapshots || []).filter((s) => s.status === "finalized" || s.status === "superseded").length, 0);
  if (finalizedAvsCount) {
    alert(`不可刪除:此病例有 ${finalizedAvsCount} 份已定稿/歷史 AVS 文件。\n定稿文件是不可變歷史;內容有誤請在該診 Checkout 建立更正版本。\n確要銷毀整筆病例,請先「立即匯出」備份並由 Ting 明確授權後手動處理。`);
    return;
  }
  if (!confirm(`確定刪除 ${item?.patientCode || "這筆病例"}？此動作會刪除其 SOAP notes。`)) return;
  const snapshot = structuredClone(clinicalCases);
  const prevSelectedCaseId = selectedCaseId;
  clinicalCases = clinicalCases.filter((entry) => entry.id !== editingCaseId);
  selectedCaseId = clinicalCases[0]?.id || "";
  // R9 gate B: persist failure restores the deleted case in memory instead
  // of closing the dialog on an unsaved deletion.
  if (!persistClinicalCases()) {
    clinicalCases = snapshot;
    selectedCaseId = prevSelectedCaseId;
    return;
  }
  caseDialog.close();
  render();
}

// Last Visit at a Glance (2026-08-09, docs/SOAP_FOLLOWUP_TRACKING_AUDIT.md
// §9 ranked item #3) — originally read-only reference only, never a data
// source (see the panel below). No new storage: derived entirely from the
// case's existing soapNotes each time the dialog opens.
//
// 2026-08-25(dry run,Ting 明確要求「帶入上一次看診的內容」推翻原本 reference-
// only 設計):新增 SOAP_CARRY_FORWARD_FIELDS(下面)——第一輪只白名單「治療
// 計畫」類欄位(證型/治法/穴位/方劑/手法)。原因跟這份文件當初刻意選
// reference-only 一樣:把上次的值當「這次」的悄悄帶入,等於沒有真的重新
// 觀察卻記錄成觀察到了(牴觸 D4「粗化,絕不寫假的臨床事實」的精神)。
//
// 同日第二輪,Ting 追問 S/O/A/P 能不能也帶入(她的原話:「這個系統半正式,
// 這樣方便我作業不要一直太多手動填寫……我有點之前的內容好對這個病人有
// 概念」)。用 AskUserQuestion 攤開風險後,Ting 選的是「自動帶入,但清楚
// 標示沿用上次、請確認」——不是取消上面那個顧慮,是換一種方式處理:S/O/A/P
// 現在也在白名單裡,但帶入時強制加 SOAP_CARRY_FORWARD_MARKER(可見的中英文
// 標記),病歷上永遠留下「這段是沿用的」的痕跡,不會被誤讀成當場重新問診/
// 評估的結果。舌脈/療效判定/指標依然不帶入——這幾格是醫師「這次量到什麼」
// 而不是「這次記得什麼」,標記解決不了同一個問題,維持原判斷。
//
// Ordering matches renderClinicalCaseDetail's own sort (visitDate then
// visitNumber) so "previous" here means the same thing the SOAP Timeline
// already shows, just ascending instead of descending.
//
//   - New visit (currentNoteId null): previous = the most recent existing
//     visit in the case.
//   - Editing visit N: previous = the visit immediately before N in
//     chronological order — never N itself, never whatever happens to be
//     newest in the case if that isn't N's actual predecessor.
//   - Editing the earliest visit, or no visits yet: null (no previous).
function findPreviousSoapNote(soapNotes, currentNoteId) {
  const chrono = [...(soapNotes || [])].sort((a, b) => {
    const d = String(a.visitDate || "").localeCompare(String(b.visitDate || ""));
    if (d) return d;
    return Number(a.visitNumber || 0) - Number(b.visitNumber || 0);
  });
  if (!currentNoteId) return chrono[chrono.length - 1] || null;
  const idx = chrono.findIndex((n) => n.id === currentNoteId);
  if (idx <= 0) return null;
  return chrono[idx - 1];
}

function truncateText(text, maxLen) {
  const s = String(text || "").trim();
  if (!s) return "";
  return s.length > maxLen ? s.slice(0, maxLen).trim() + "…" : s;
}

// Compact, read-only. Deliberately does NOT render the whole previous SOAP —
// only the fields worth glancing at before writing today's note. Every row
// except "Visit" is omitted when empty, so a sparse previous visit renders a
// short panel rather than a wall of "—".
function renderPreviousVisitPanel(note) {
  const container = document.querySelector("#previousVisitPanel");
  if (!container) return;
  if (!note) {
    container.innerHTML = `<p class="case-empty" style="margin:0;">尚無上一次就診紀錄 No previous visit yet.</p>`;
    return;
  }
  const verdict = OUTCOME_VERDICTS[note.outcomeVerdict];
  const pattern = formatPatternSelections(note.tcmPatternSelections) || note.tcmPattern || "";
  const cells = [
    ["就診 Visit", [note.visitNumber ? `Visit ${note.visitNumber}` : "", note.visitDate].filter(Boolean).join(" · ") || "—"],
    ["S 主觀 Subjective", truncateText(note.subjective, 80)],
    ["療效 Outcomes", truncateText(note.outcomes, 80)],
    ["療效判定 Verdict", verdict ? `${verdict.zh} ${verdict.en}` : ""],
    ...formatNumericOutcomeMetrics(note),
    ["證型 Pattern", pattern],
    ["治法 Tx principle", note.treatmentPrinciple || ""],
    ["用穴 Points", formatNoteList(note.acupointLinks, "")],
    ["方藥 Formula", formatNoteList(note.formulaLinks, "")],
    ["手法 Modalities", note.modalities || ""],
    ["醫囑 Advice", truncateText(note.advice, 60)],
    ["下次計畫 Follow-up", truncateText(note.followUp, 60)],
  ].filter(([, value]) => value);
  container.innerHTML = `<div class="clinical-mini-grid">${cells.map(([label, value]) =>
    `<div><small>${escapeHtml(label)}</small><span>${escapeHtml(value)}</span></div>`
  ).join("")}</div>`;
}

// 回傳 prevNote 裡白名單欄位的淺拷貝(陣列另外複製,絕不共用參照——editingSoap
// 存檔時不能不小心改到上一筆 note 的陣列)。只給「開新 SOAP、且這個 case 已有
// 上一診」的情況用;編輯既有 note 一律不呼叫這支(見呼叫端判斷)。
function soapCarryForwardFields(prevNote) {
  const out = {};
  for (const key of SOAP_CARRY_FORWARD_FIELDS) {
    const v = prevNote[key];
    // S/O/A/P:上次是空的就不加標記(沒有東西好「沿用」);有內容才加,
    // 標記永遠在最前面,選取刪除或整段貼上覆蓋(例如貼 Heidi 轉錄結果)
    // 都會自然把它帶走,不需要額外的「清除標記」步驟。
    if (SOAP_CARRY_FORWARD_TEXT_MARKED_FIELDS.has(key)) {
      const text = String(v || "").trim();
      out[key] = text ? SOAP_CARRY_FORWARD_MARKER + text : "";
      continue;
    }
    out[key] = Array.isArray(v) ? v.map((x) => (x && typeof x === "object") ? { ...x } : x) : v;
  }
  return out;
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
  const previousNote = findPreviousSoapNote(activeCase.soapNotes, editingSoapId);
  renderPreviousVisitPanel(previousNote);
  // 週期/生殖區(2026-08-11 Ting 指正):sex at birth = M 整段隱藏 —— 但
  // 若編輯中的舊 note 已有值,仍顯示且展開(已存在的資料絕不隱形,D4)。
  // F / Other / 未填(不假設)保留,預設收合;有值必展開。
  const cycleSection = document.getElementById("soapCycleSection");
  if (cycleSection) {
    const hasCycleData = !!(note && (note.cycleDay || note.cyclePhase || note.fertilityPhase || note.workflowLink));
    cycleSection.hidden = activeCase.sex === "M" && !hasCycleData;
    cycleSection.open = hasCycleData;
  }
  const fallback = {
    visitDate: localDateISO(),
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
    tcmPatternSelections: [],
    safetyFlagLinks: [],
    subjective: "",
    symptomLinks: [],
    objective: "",
    assessment: "",
    plan: "",
    pointsUsed: "",
    acupointLinks: [],
    retentionMinutes: "",
    technique: "",
    formulaHerbs: "",
    formulaLinks: [],
    herbLinks: [],
    westernMeds: "",
    medicationLinks: [],
    outcomes: "",
    outcomeMetricLinks: [],
    outcomeVerdict: "",
    outcomeMetrics: [],
    lifestyleFactors: [],
    adverseEvents: [],
    effectDurationDays: "",
    referralOrSupervisorQuestion: "",
    followUp: "",
    differentialConsidered: "",
    reflection: "",
    ifIneffectivePlan: "",
    modalitiesPerformed: []
  };
  // 2026-08-25:只有「開新 SOAP(note 為 null)且這個 case 有上一診」才帶入
  // 治療計畫白名單欄位;編輯既有 note 時 carryForward 恆為 {},最後
  // ...(note||{}) 一定覆蓋掉,不會動到已存檔的內容。
  const carryForward = (!note && previousNote) ? soapCarryForwardFields(previousNote) : {};
  const data = { ...fallback, ...carryForward, ...(note || {}) };
  // AVS v3 Phase C:modality.* checkbox 群組先渲染再水合(與 case form 的
  // raceEthnicity 同款作法)—— checkbox 群組不能走下面的 .value 泛用迴圈。
  renderModalitiesPerformedOptions();
  Object.entries(data).forEach(([key, value]) => {
    if (key === "modalitiesPerformed") return;   // checkbox group,下面 setCheckboxGroup 處理
    if (!soapForm.elements[key]) return;
    soapForm.elements[key].value = Array.isArray(value) ? value.join("、") : value;
  });
  setCheckboxGroup(soapForm, "modalitiesPerformed", data.modalitiesPerformed);
  // Metadata-driven numeric outcome metrics: one generic render instead of
  // per-metric hydration ifs. Inputs are UI-only (no soap_notes.painScore/
  // sleepHours key exists — they read/write through data.outcomeMetrics).
  // Passed the whole `data`, not just data.outcomeMetrics: effect_duration_days
  // needs data.effectDurationDays too, for the legacy-field fallback/conflict
  // check (resolveNumericMetricValue).
  renderNumericOutcomeMetricInputs(data);
  // D17 §6/§4 — visit-level Lifestyle / Adverse events repeatable rows.
  // Rebuilt every open, same as renderNumericOutcomeMetricInputs above: for
  // an existing note this hydrates from data.lifestyleFactors/adverseEvents;
  // for a new note both render as an empty list of rows.
  renderLifestyleFactorRows(data.lifestyleFactors);
  renderAdverseEventRows(data.adverseEvents);
  renderPatternDifferentialRows(data.patternDifferentials);
  // TCM pattern primary/secondary: same reasoning — tcmPatternPrimary and
  // tcmPatternSecondary are UI-only form fields, no such keys exist on the
  // note object itself (the note holds tcmPatternSelections instead).
  if (soapForm.elements.tcmPatternPrimary) {
    const primaryEntry = (data.tcmPatternSelections || []).find((e) => e.isPrimary);
    soapForm.elements.tcmPatternPrimary.value = primaryEntry ? primaryEntry.patternId : "";
  }
  if (soapForm.elements.tcmPatternSecondary) {
    soapForm.elements.tcmPatternSecondary.value = (data.tcmPatternSelections || [])
      .filter((e) => !e.isPrimary)
      .map((e) => e.patternId)
      .join("、");
  }
  setupLinkAutocomplete();                                   // CS4: idempotent
  Object.values(linkPickerControllers).forEach((c) => c.sync());  // rebuild chips from hydrated values
  // P1 pre-visit paste-import (docs/P1_PREVISIT_INTAKE_CONTRACT_v0.md §6.2):
  // patientPerspective has no form field yet, so a pasted intake stashes it
  // here (soapForm.dataset), read by saveSoapFromForm below. Reset on every
  // open so a stash from a PREVIOUS note/dialog session can never leak into
  // an unrelated save — openSoapEditor is the one place every dialog open
  // (new note or edit) passes through.
  delete soapForm.dataset.previsitPatientPerspective;
  if (soapSaveError) { soapSaveError.hidden = true; soapSaveError.textContent = ""; }
  // FIX A — context is caseId+noteId (or "new") so a draft is only ever
  // offered back for the SAME visit being edited, never a different case or
  // a different SOAP note within the same case.
  const soapDraftContext = `${selectedCaseId || ""}:${editingSoapId || "new"}`;
  const soapDraft = readDraft(SOAP_DRAFT_KEY);
  if (soapDraft && soapDraft.context === soapDraftContext) {
    renderDraftBanner(soapDraftBanner, soapDraft, () => {
      restoreFormDraft(soapForm, soapDraft.fields);
      Object.values(linkPickerControllers).forEach((c) => c.sync());
      renderDraftBanner(soapDraftBanner, null);
    }, () => {
      clearDraft(SOAP_DRAFT_KEY);
      renderDraftBanner(soapDraftBanner, null);
    });
  } else {
    renderDraftBanner(soapDraftBanner, null);
  }
  soapDialog.showModal();
}

// P1 pre-visit intake paste-import (docs/P1_PREVISIT_INTAKE_CONTRACT_v0.md
// §4 validation rules, §6.2 integration). Whole payload rejected on ANY
// violation — never partial-apply a half-valid intake (contract: "非法整筆
// 拒收並顯示原因"). metricId whitelist is NUMERIC_OUTCOME_METRIC_CONFIG
// itself — the exact same config the SOAP form's own numeric metric inputs
// already render from (declared near the top of this file) — one shared
// source of truth, never a second copy that could drift out of sync.
// P1 payload shape 驗證 —— 委派給共用模組 js/previsit-validator.js。
// Codex P1 retest MED-4/HIGH-1 根因:這裡與 CLI validator 各有一份規則,
// 兩份漂移(app 把非陣列 metrics 靜默降成 []、CLI 正確拒收),而 blocking
// self-test 只跑 CLI 那份,漂移在全綠底下存活。現在 shape 規則只有一份,
// app / CLI / self-test 跑的是同一段程式碼,漂移在結構上不可能。
// import 端三道硬規則(patientCode 比對 / 過期 / 重放)仍在
// pastePrevisitImport —— 那些需要目前開啟病例與 session 狀態,不屬 shape 層。
function validatePrevisitPayload(raw) {
  const V = globalThis.AcuTingPrevisitValidator;
  // fail-loud:模組沒載入就整筆拒收。靜默退回較弱的內建驗證 = 把安全 gate
  // 變成「載入失敗時自動關閉」,那正是這次修復要消滅的類別。
  if (!V || typeof V.validatePrevisitShape !== "function") {
    return { error: "診前資料驗證模組(js/previsit-validator.js)未載入,拒絕匯入。Validator module not loaded — import refused." };
  }
  const result = V.validatePrevisitShape(raw, {
    metricConfig: NUMERIC_OUTCOME_METRIC_CONFIG,
    registryHas: (id) => !!getOutcomeMetricDef(id),
    labelOf: (id) => outcomeMetricShortLabel(id)
  });
  if (!result.ok) return { error: result.errors[0] };
  return { data: result.data };
}

// Click handler for #pastePrevisitBtn. Prompts for pasted JSON, validates
// it (reject-whole-payload-on-any-violation, above), then PREFILLS form
// fields only — never writes clinicalCases/localStorage directly (contract
// §1: "病人裝置絕不直寫任何 store"; this function runs on the CLINICIAN's
// device, but the same rule applies here as a save-path discipline: the
// clinician still has to review every field and press Save, same as if
// they'd typed everything by hand). outcomeMetrics inputs are the SAME
// <input name="metric.xxx"> elements renderNumericOutcomeMetricInputs
// already rendered for this open dialog, so setting .value here is exactly
// what a clinician typing into them by hand would produce — saveSoapFromForm
// re-validates them again at save time regardless (computeNumericOutcomeMetrics),
// so a stale/tampered clipboard value can never bypass that check.
function pastePrevisitImport() {
  const raw = prompt(
    "貼上診前資料 JSON（病人手機頁產生的內容）\nPaste the pre-visit intake JSON (generated on the patient's phone):",
    ""
  );
  if (raw == null) return;   // cancelled
  const trimmed = raw.trim();
  if (!trimmed) return;

  const result = validatePrevisitPayload(trimmed);
  if (result.error) {
    alert(`診前資料格式不正確，整筆拒收：\n${result.error}`);
    return;
  }
  const data = result.data;

  // SOL P1 transport review(2026-08-12)硬規則,順序:比對 → 過期 → 重放。
  // 1. patientCode 硬比對:與目前開啟病例逐字相等,錯一個字就整筆拒收
  //    (不是提醒)—— wrong-patient prefill 是這條動線最危險的錯誤。
  const openCase = clinicalCases.find((c) => c.id === selectedCaseId);
  if (!openCase || data.patientCode !== openCase.patientCode) {
    alert(`診前資料拒收:payload 的 patientCode「${data.patientCode}」與目前開啟病例「${openCase ? openCase.patientCode : "(無)"}」不一致。\n請先開啟正確病人的病例再匯入。Rejected — patientCode does not match the open case.`);
    return;
  }
  // 2. 過期/未來時間 → 人工覆核(confirm),不是靜默接受:診前資料超過 72
  //    小時通常已不是「這次就診」的狀態;未來時間代表裝置時鐘或 payload 有問題。
  const PREVISIT_MAX_AGE_MS = 72 * 60 * 60 * 1000;
  if (data.filledAt) {
    const age = Date.now() - Date.parse(data.filledAt);
    if (age > PREVISIT_MAX_AGE_MS || age < -(10 * 60 * 1000)) {
      const ok = window.confirm(`⚠️ 診前資料填寫時間為 ${data.filledAt},${age < 0 ? "在未來(裝置時鐘異常?)" : "已超過 72 小時"}。\n內容可能不反映今日狀態 —— 確定仍要匯入並逐欄覆核?`);
      if (!ok) return;
    }
  } else {
    const ok = window.confirm("⚠️ 這份診前資料沒有填寫時間戳(舊版頁面產物?)。確定仍要匯入並逐欄覆核?");
    if (!ok) return;
  }
  // 3. 重放防護:同一 payloadId 本次開機期間只接受一次;重複匯入需明確確認。
  //    (跨 session 重放由 72h 過期規則涵蓋;不為此開新的持久層。)
  window.__previsitImportedIds = window.__previsitImportedIds || new Set();
  if (data.payloadId) {
    if (window.__previsitImportedIds.has(data.payloadId)) {
      const ok = window.confirm("⚠️ 這份診前資料(相同 payloadId)本次已匯入過。重複匯入會再次覆蓋表單欄位 —— 確定?");
      if (!ok) return;
    }
    window.__previsitImportedIds.add(data.payloadId);
  }
  const filledLabels = [];

  data.metrics.forEach((m) => {
    if (soapForm.elements[m.metricId]) {
      soapForm.elements[m.metricId].value = m.valueNumber;
      filledLabels.push(outcomeMetricShortLabel(m.metricId));
    }
  });

  // No dedicated AE/exposure form fields to prefill into yet (contract §2
  // items 4-5: clinician confirmation turns these into adverseEvents[] /
  // an applyExposureChange event manually, never automatically) — surfaced
  // as clearly-labeled text in Subjective, the existing free-text catch-all
  // field, rather than silently dropped.
  const extraBlocks = [];
  if (data.subjectiveText) extraBlocks.push(`[診前自填 Pre-visit self-report] ${data.subjectiveText}`);
  if (data.aeSelfReport.any) extraBlocks.push(`[診前自報：不良反應 Pre-visit AE self-report] ${data.aeSelfReport.text || "（未描述 no description given）"}`);
  if (data.exposureSelfReport.any) extraBlocks.push(`[診前自報：藥物/補品變動 Pre-visit medication/supplement change] ${data.exposureSelfReport.text || "（未描述 no description given）"}`);
  if (extraBlocks.length && soapForm.elements.subjective) {
    const existing = soapForm.elements.subjective.value.trim();
    soapForm.elements.subjective.value = extraBlocks.join("\n") + (existing ? `\n\n${existing}` : "");
    filledLabels.push("主觀 Subjective（已加在最前面 prefixed）");
  }

  if (data.patientPerspective) {
    // Stashed on the form, not on any note object — saveSoapFromForm reads
    // and consumes this exactly once (see its patientPerspective line).
    soapForm.dataset.previsitPatientPerspective = data.patientPerspective;
    filledLabels.push("病人視角 Patient perspective（存於表單，按儲存時併入 stashed — merged in when you press Save）");
  }

  alert(filledLabels.length
    ? `已預填以下欄位，請逐項確認後再按「儲存」：\nThe following fields were prefilled — please review each one before pressing Save:\n\n${filledLabels.join("\n")}`
    : "貼上的資料沒有可預填的內容（六項指標皆為空、且無文字欄位）。Nothing to prefill — every field in the pasted data was empty.");
}

function saveSoapFromForm(event) {
  event.preventDefault();
  const activeCase = clinicalCases.find((item) => item.id === selectedCaseId);
  if (!activeCase) return;
  const soapFormData = new FormData(soapForm);
  const data = Object.fromEntries(soapFormData.entries());
  // AVS v3 Phase C:checkbox 群組要用 getAll —— fromEntries 只留最後一個值。
  const modalitiesPerformed = soapFormData.getAll("modalitiesPerformed");
  const current = activeCase.soapNotes.find((note) => note.id === editingSoapId);
  // P1 pre-visit paste-import: consume the stash exactly once, at the one
  // authorized save path (pastePrevisitImport itself never writes
  // clinicalCases/localStorage — see that function's comment).
  //
  // Codex P1 retest HIGH-3:過去在這裡就 read-then-delete,但這一行之後還有
  // duplicate-visit 檢查、metric 重驗、以及 persist —— 任何一個提早 return
  // 都會讓 dialog 仍開著、stash 卻已消失,醫師再按一次儲存時病人的原話已經
  // 靜默不見。改成:此處只 READ;**只有 persist 成功後才 delete**(見本函式
  // 末端),失敗路徑上 stash 原封不動,重試仍帶得回病人原話。
  // 一次性語義由「成功後刪除」+ openSoapEditor 每次開啟的 reset 共同保證。
  const previsitPerspective = soapForm.dataset.previsitPatientPerspective || "";

  // SOAP/Follow-up audit (2026-08-09): visit numbers are meant to be unique
  // per case (the timeline, "上次" comparisons, and CG8's future Baseline/
  // Today columns all key off visitNumber). The field has always been a
  // plain editable number with no check — same class of gap as the
  // patientCode duplicate guard already had before it was added.
  const visitNumberRaw = (data.visitNumber || "").trim();
  if (visitNumberRaw) {
    const dupe = activeCase.soapNotes.find((note) => note.id !== editingSoapId && String(note.visitNumber) === visitNumberRaw);
    if (dupe) {
      alert(`Visit #${visitNumberRaw} 在這個病例裡已經用過了（${dupe.visitDate || "無日期"}）。請確認就診次數。`);
      return;
    }
  }
  // Metadata-driven numeric outcome metrics (metric.pain_score,
  // metric.sleep_hours, metric.effect_duration_days). Reject, never coerce
  // — config-driven per-metric shape/range check, same rules the hand-
  // written blocks enforced (pain: integer 0-10; sleep: non-negative
  // decimal; effect duration: non-negative integer, same as its old
  // dedicated block) but expressed once in NUMERIC_OUTCOME_METRIC_CONFIG.
  // legacyClears realizes "one fact, one home": saving any note blanks
  // effectDurationDays going forward, because outcomeMetrics[] just became
  // this save's source of truth for it (merged into normalizeSoapNote()
  // below — an explicit key always wins over the `...current` spread).
  const numericMetricsResult = computeNumericOutcomeMetrics(data, current?.outcomeMetrics || []);
  if (numericMetricsResult.error) {
    alert(numericMetricsResult.error);
    return;
  }
  const outcomeMetrics = numericMetricsResult.metrics;
  const legacyMetricClears = numericMetricsResult.legacyClears;

  // D17 §6/§4 — lifestyleFactors[] / adverseEvents[] from the repeatable row
  // widgets. openSoapEditor always renders these containers (even to an
  // empty row list) before the dialog opens, so their presence in the DOM
  // here is reliable — but the guard below is the literal backstop the
  // SPRINT brief asks for: only overwrite the saved array when the
  // container actually rendered rows this session, never fall back to []
  // just because the section markup is (for any future reason) absent.
  const lifestyleRowsContainer = document.querySelector("#lifestyleFactorRows");
  const adverseEventRowsContainer = document.querySelector("#adverseEventRows");
  const lifestyleFactors = lifestyleRowsContainer ? collectLifestyleFactorRows() : (current?.lifestyleFactors || []);
  const adverseEvents = adverseEventRowsContainer ? collectAdverseEventRows() : (current?.adverseEvents || []);
  const patternDifferentialRowsContainer = document.querySelector("#patternDifferentialRows");
  const patternDifferentials = patternDifferentialRowsContainer ? collectPatternDifferentialRows() : (current?.patternDifferentials || []);

  // TCM pattern primary/secondary reconciliation. The excludeValues live
  // filter (setupLinkAutocomplete) already keeps the current primary out of
  // the secondary picker's search results, but this is the save-time
  // backstop that guarantees the invariant regardless of how the two
  // textareas actually ended up — "a pattern is never both at once" holds
  // even if something bypassed the live UI.
  const tcmPrimaryId = (data.tcmPatternPrimary || "").trim();
  const tcmSecondaryIds = splitList(data.tcmPatternSecondary || "").filter((id) => id && id !== tcmPrimaryId);
  // D17 §4: the primary/secondary pickers ARE the role semantics, so role is
  // recorded from the same source as isPrimary (faithful recording, not
  // inference) — which also keeps the role⇔isPrimary agreement invariant
  // automatically. confidence has no form field yet, so it is CARRIED OVER
  // from the current note's entry for the same patternId rather than being
  // silently stripped by this rebuild.
  const priorSelection = (patternId) =>
    (current?.tcmPatternSelections || []).find((e) => e.patternId === patternId) || {};
  const priorConfidence = (patternId) => priorSelection(patternId).confidence || "";
  const priorNote = (patternId) => priorSelection(patternId).note || "";
  const tcmPatternSelections = [
    ...(tcmPrimaryId ? [{ patternId: tcmPrimaryId, isPrimary: true, role: "primary", confidence: priorConfidence(tcmPrimaryId), note: priorNote(tcmPrimaryId) }] : []),
    ...tcmSecondaryIds.map((id) => ({ patternId: id, isPrimary: false, role: "secondary", confidence: priorConfidence(id), note: priorNote(id) })),
  ];
  // Derived, not typed — see the tcmPatternLinks comment in normalizeSoapNote.
  const tcmPatternLinksDerived = tcmPatternSelections.map((e) => e.patternId);

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
    modalitiesPerformed,
    advice: (data.advice || "").trim(),
    westernConditionLinks: splitList(data.westernConditionLinks),
    easternDiseaseLinks: splitList(data.easternDiseaseLinks),
    tcmPatternSelections,
    tcmPatternLinks: tcmPatternLinksDerived,
    safetyFlagLinks: splitList(data.safetyFlagLinks),
    subjective: data.subjective.trim(),
    symptomLinks: splitList(data.symptomLinks),
    objective: data.objective.trim(),
    assessment: data.assessment.trim(),
    plan: data.plan.trim(),
    pointsUsed: data.pointsUsed.trim(),
    acupointLinks: splitList(data.acupointLinks),
    retentionMinutes: data.retentionMinutes,
    technique: data.technique.trim(),
    formulaHerbs: data.formulaHerbs.trim(),
    formulaLinks: splitList(data.formulaLinks),
    herbLinks: splitList(data.herbLinks),
    westernMeds: data.westernMeds.trim(),
    medicationLinks: splitList(data.medicationLinks),
    outcomes: data.outcomes.trim(),
    outcomeMetricLinks: splitList(data.outcomeMetricLinks),
    outcomeVerdict: data.outcomeVerdict || "",
    outcomeMetrics,
    lifestyleFactors,
    adverseEvents,
    ...legacyMetricClears,
    referralOrSupervisorQuestion: (data.referralOrSupervisorQuestion || "").trim(),
    followUp: data.followUp.trim(),
    differentialConsidered: (data.differentialConsidered || "").trim(),
    patternDifferentials,
    reflection: (data.reflection || "").trim(),
    ifIneffectivePlan: (data.ifIneffectivePlan || "").trim(),
    // P1 pre-visit paste-import (docs/P1_PREVISIT_INTAKE_CONTRACT_v0.md §6.2):
    // no form field exists for this yet (see the field's own comment in
    // normalizeSoapNote), so a pasted value only ever reaches this note via
    // the stash read above. Falls back to whatever this note already had —
    // a save with no paste this session must never blank out a
    // patientPerspective that was set some other way.
    patientPerspective: previsitPerspective || (current?.patientPerspective || ""),
    // HIGH#6 companion rule: an EXISTING record whose legacy createdAt is
    // missing stays missing — stamping edit-time here would falsify creation
    // time. Only a genuinely NEW record gets createdAt = now.
    createdAt: current ? String(current.createdAt || "") : now,
    updatedAt: now
  });

  const snapshot = structuredClone(clinicalCases);
  clinicalCases = clinicalCases.map((item) => {
    if (item.id !== selectedCaseId) return item;
    const notes = editingSoapId
      ? item.soapNotes.map((entry) => entry.id === editingSoapId ? nextNote : entry)
      : [...item.soapNotes, nextNote];
    return { ...item, soapNotes: notes, updatedAt: now };
  });
  // R9 gate B: persist failure must not fire noteClinicalSave, close the
  // dialog, or render — roll back and keep the form's input intact.
  if (!persistClinicalCases()) { clinicalCases = snapshot; return; }
  // Codex P1 retest HIGH-3:病人原話的 stash 只在存檔真的落盤後才清除。
  // 在此之前的任何 return(重複 visit number、metric 重驗失敗、persist 失敗)
  // 都保留 stash,醫師重試時仍帶得回病人原話。
  delete soapForm.dataset.previsitPatientPerspective;
  noteClinicalSave();   // CS1
  clearDraft(SOAP_DRAFT_KEY);   // FIX A: draft is only useful until a real save lands
  soapDialog.close();
  render();
}

function deleteCurrentSoap() {
  if (!editingSoapId) return;
  // Codex NO-GO HIGH-2(取代原「警告後仍可刪」版本):含已定稿 AVS 的 Visit
  // 禁止 hard-delete。定稿 AVS 是交給過病人的歷史文件,append-only;要修正
  // 走更正版本(supersede),要銷毀走 Ting 明確授權的災難流程,不走這顆按鈕。
  const doomedNote = clinicalCases.find((item) => item.id === selectedCaseId)?.soapNotes.find((n) => n.id === editingSoapId);
  const finalizedCount = (doomedNote?.avsSnapshots || []).filter((s) => s.status === "finalized" || s.status === "superseded").length;
  if (finalizedCount) {
    alert(`不可刪除:此診有 ${finalizedCount} 份已定稿/歷史 AVS 文件。\n內容有誤請在 Checkout 建立更正版本(舊版會標 superseded、永久保留)。\n確要銷毀請先「立即匯出」備份並由 Ting 明確授權後手動處理。`);
    return;
  }
  if (!confirm("確定刪除這筆 SOAP note？")) return;
  const snapshot = structuredClone(clinicalCases);
  clinicalCases = clinicalCases.map((item) => {
    if (item.id !== selectedCaseId) return item;
    return { ...item, soapNotes: item.soapNotes.filter((note) => note.id !== editingSoapId), updatedAt: new Date().toISOString() };
  });
  // R9 gate B: persist failure restores the deleted SOAP note in memory
  // instead of closing the dialog on an unsaved deletion.
  if (!persistClinicalCases()) { clinicalCases = snapshot; return; }
  soapDialog.close();
  render();
}

// ======================  AVS v3 — Visit Checkout  ==========================
// (AVS_V3_VISIT_CHECKOUT_INTEGRATION_PLAN,2026-08-11)
// 分工:狀態機/媒合/病人輸出渲染在 js/avs.js(零 DOM、node 可測);這裡只
// 做 Checkout UI 與持久化。snapshot 唯一落盤路徑 = persistAvsSnapshots()
// (失敗回滾,同 R9 gate B 模式)。病人可見輸出在預覽與定稿兩處都過
// checkPatientOutputSafety 零診斷自檢,命中即 abort。

// (宣告已前移至檔頭 boot-order 區 —— 見 AGENT_EXPOSURE_TYPE_LABELS 註解)

let avsCheckoutNoteId = null;
let avsWorkingDraft = null;   // 編輯中 draft(in-memory;儲存草稿/定稿才落盤)

function avsStatusBadge(note) {
  const snaps = note.avsSnapshots || [];
  if (!window.AcuTingAVS || !snaps.length) return "";
  if (AcuTingAVS.currentDraft(snaps)) return `<span class="avs-badge avs-badge-draft">AVS 草稿</span>`;
  if (AcuTingAVS.latestFinalized(snaps)) return `<span class="avs-badge avs-badge-final">AVS ✓</span>`;
  return "";
}

// SOAP 表單的 modality.* checkbox 群組(Phase C)—— 與 raceEthnicity 同款:
// 由 bundled vocabulary 渲染,詞彙成長不再改 index.html。冪等。
function renderModalitiesPerformedOptions() {
  const container = document.querySelector("#modalitiesPerformedOptions");
  if (!container) return;
  const records = globalThis.ACUTING_KNOWLEDGE?.modalityVocabulary?.records || [];
  container.innerHTML = records.map((r) =>
    `<label><input type="checkbox" name="modalitiesPerformed" value="${escapeAttribute(r.id)}" />${escapeHtml(`${r.name_zh} ${r.name_en}`)}</label>`
  ).join("");
}

function avsCheckoutContext() {
  const kase = clinicalCases.find((item) => item.id === selectedCaseId);
  const note = kase ? kase.soapNotes.find((n) => n.id === avsCheckoutNoteId) : null;
  return { kase, note };
}

function avsAgentNameOf(agentId) {
  if (!agentId) return null;
  const k = globalThis.ACUTING_KNOWLEDGE || {};
  for (const pool of [k.formulas, k.supplementRecords, k.pharmDrugs, k.medications]) {
    const rec = ((pool && pool.records) || []).find((r) => r.id === agentId);
    if (rec) return rec.name_zh || rec.name_en || null;
  }
  return null;
}

function buildAvsDraftFor(kase, note, version) {
  return AcuTingAVS.buildDraftSnapshot({
    kase,
    note,
    library: globalThis.ACUTING_KNOWLEDGE?.avsAdviceLibrary?.records || [],
    clinic: globalThis.ACUTING_KNOWLEDGE?.clinicProfile || {},
    modalityVocabulary: globalThis.ACUTING_KNOWLEDGE?.modalityVocabulary?.records || [],
    outcomeMetricDefs: globalThis.ACUTING_KNOWLEDGE?.outcomeMetrics?.records || [],
    nameOfAgent: avsAgentNameOf,
    version
  });
}

function openAvsCheckout(noteId) {
  if (!window.AcuTingAVS) { alert("AVS 引擎未載入(js/avs.js)。"); return; }
  avsCheckoutNoteId = noteId;
  const { kase, note } = avsCheckoutContext();
  if (!kase || !note) return;
  const snaps = note.avsSnapshots || [];
  const persisted = AcuTingAVS.currentDraft(snaps);
  // 有 draft → 載入編輯;無 draft 也無 finalized → 依 §3 Step 3 產生草稿
  // (draft 無副作用,不落盤;絕不自動定稿)。有 finalized 無 draft → 檢視模式。
  avsWorkingDraft = persisted
    ? structuredClone(persisted)
    : (AcuTingAVS.latestFinalized(snaps) ? null : buildAvsDraftFor(kase, note));
  const dialog = document.querySelector("#avsCheckoutDialog");
  const closeBtn = document.querySelector("#closeAvsCheckout");
  if (closeBtn && !closeBtn.dataset.wired) {
    closeBtn.dataset.wired = "1";
    closeBtn.addEventListener("click", () => dialog.close());
  }
  renderAvsCheckout();
  dialog.showModal();
}

// 把 DOM 編輯狀態收回 avsWorkingDraft(勾選/改字/自訂/回診/觀察題)。
function collectAvsDraftFromDom() {
  const body = document.querySelector("#avsCheckoutBody");
  if (!body || !avsWorkingDraft) return;
  body.querySelectorAll("[data-avs-sel]").forEach((cb) => {
    const row = avsWorkingDraft.renderedAdvice[Number(cb.dataset.avsSel)];
    if (row) row.selected = cb.checked;
  });
  body.querySelectorAll("[data-avs-text]").forEach((ta) => {
    const row = avsWorkingDraft.renderedAdvice[Number(ta.dataset.avsText)];
    if (row) row.text_zh = ta.value;
  });
  body.querySelectorAll("[data-avs-custom-text]").forEach((ta) => {
    const row = avsWorkingDraft.clinicianAddedAdvice[Number(ta.dataset.avsCustomText)];
    if (row) row.text_zh = ta.value;
  });
  body.querySelectorAll("[data-avs-custom-cat]").forEach((sel) => {
    const row = avsWorkingDraft.clinicianAddedAdvice[Number(sel.dataset.avsCustomCat)];
    if (row) row.category = sel.value;
  });
  const followUp = body.querySelector("[data-avs-followup]");
  if (followUp) avsWorkingDraft.followUpSnapshot = followUp.value.trim();
  const keptPrompts = [];
  body.querySelectorAll("[data-avs-watch]").forEach((cb) => {
    if (cb.checked) keptPrompts.push(avsWorkingDraft.patientObservationPromptsSnapshot[Number(cb.dataset.avsWatch)]);
  });
  if (body.querySelector("[data-avs-watch]") || !avsWorkingDraft.patientObservationPromptsSnapshot.length) {
    avsWorkingDraft.patientObservationPromptsSnapshot = keptPrompts.filter(Boolean);
  }
}

// snapshot 唯一落盤路徑:換掉該 Visit 的 avsSnapshots,persist 失敗回滾
// (storage 失敗絕不假裝已存 —— persistClinicalCases 已大聲告知)。
function persistAvsSnapshots(nextSnaps) {
  const backup = structuredClone(clinicalCases);
  const now = new Date().toISOString();
  clinicalCases = clinicalCases.map((item) => {
    if (item.id !== selectedCaseId) return item;
    return {
      ...item,
      updatedAt: now,
      soapNotes: item.soapNotes.map((n) => n.id === avsCheckoutNoteId ? { ...n, avsSnapshots: nextSnaps } : n)
    };
  });
  if (!persistClinicalCases()) { clinicalCases = backup; return false; }
  return true;
}

function avsOpenWindow(html, autoPrint) {
  const w = window.open("", "_blank");
  if (!w) { alert("瀏覽器阻擋了彈出視窗,請允許此網站的彈出視窗後再試。"); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
  if (autoPrint) setTimeout(() => { try { w.print(); } catch (e) { /* 使用者可自行列印 */ } }, 300);
}

// 檢視/預覽共用:渲染 + 零診斷自檢(§2.2)。命中 = abort,絕不輸出。
function avsRenderChecked(snapshot, kase, note) {
  const html = AcuTingAVS.renderPatientHtml(snapshot, { visitDate: note.visitDate || "" });
  const banned = AcuTingAVS.checkPatientOutputSafety(html, kase);
  if (banned.length) {
    alert("SAFETY ABORT:病人輸出含內部代碼/禁用詞,已中止輸出。\n命中:" + banned.join(", ") + "\n請檢查建議文字或自訂指示內容。");
    return null;
  }
  return html;
}

// 複製文字用:同一份自檢邏輯套在純文字版(2026-08-25,Ting 要求 email 可直接貼上)。
function avsRenderTextChecked(snapshot, kase, note) {
  const text = AcuTingAVS.renderPatientText(snapshot, { visitDate: note.visitDate || "" });
  const banned = AcuTingAVS.checkPatientOutputSafety(text, kase);
  if (banned.length) {
    alert("SAFETY ABORT:病人輸出含內部代碼/禁用詞,已中止輸出。\n命中:" + banned.join(", ") + "\n請檢查建議文字或自訂指示內容。");
    return null;
  }
  return text;
}

// 複製到剪貼簿,失敗(權限/非 https/舊瀏覽器)就退回 prompt() 讓使用者自己
// 全選複製 —— 跟 copyPointLink() 同一套後備邏輯,但 prompt 用 textarea 風格
// 多行文字時 alert 會被截斷/擠成一行,prompt 至少能選取。
function copyTextToClipboard(text, onDone) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => onDone(true)).catch(() => {
      prompt("瀏覽器阻擋自動複製,請手動全選複製:", text);
      onDone(false);
    });
    return;
  }
  prompt("瀏覽器不支援自動複製,請手動全選複製:", text);
  onDone(false);
}

function renderAvsCheckout() {
  const body = document.querySelector("#avsCheckoutBody");
  const { kase, note } = avsCheckoutContext();
  if (!body || !kase || !note) return;
  const snaps = note.avsSnapshots || [];
  const finalized = AcuTingAVS.latestFinalized(snaps);
  const superseded = snaps.filter((s) => s.status === "superseded").sort((a, b) => Number(b.version) - Number(a.version));
  const persistedDraft = AcuTingAVS.currentDraft(snaps);

  const historyHtml = (finalized || superseded.length) ? `
    <section class="avs-co-section avs-co-history">
      <h3>歷史版本 History</h3>
      ${finalized ? `<div class="avs-co-history-row"><span>v${escapeHtml(String(finalized.version))} 定稿 ${escapeHtml(finalized.finalizedAt || "")}</span><button class="ghost" type="button" data-avs-view="${escapeAttribute(finalized.id)}">檢視 View</button></div>` : ""}
      ${superseded.map((s) => `<div class="avs-co-history-row avs-co-superseded"><span>v${escapeHtml(String(s.version))} 已被取代(superseded)· 定稿於 ${escapeHtml(s.finalizedAt || "")}</span><button class="ghost" type="button" data-avs-view="${escapeAttribute(s.id)}">檢視 View</button></div>`).join("")}
    </section>` : "";

  if (!avsWorkingDraft) {
    // 檢視模式:已定稿、無編輯中草稿。
    body.innerHTML = `
      <div class="avs-co-meta">Visit ${escapeHtml(note.visitDate || "")} · ${escapeHtml(kase.patientCode || "")}</div>
      <section class="avs-co-section">
        <h3>AVS 已定稿 v${escapeHtml(String(finalized.version))}</h3>
        <p class="avs-co-final-time">定稿時間:${escapeHtml(finalized.finalizedAt || "")}</p>
        <div class="avs-co-actions-row">
          <button type="button" data-avs-view="${escapeAttribute(finalized.id)}">檢視 View</button>
          <button type="button" data-avs-print="${escapeAttribute(finalized.id)}">列印 / 存 PDF</button>
          <button type="button" data-avs-copy-text="${escapeAttribute(finalized.id)}">複製文字 Copy for email</button>
          <button class="ghost" type="button" id="avsCorrectionBtn">建立更正版本 Create correction</button>
        </div>
        <p class="avs-co-note">定稿文件不可修改;更正會建立 v${escapeHtml(String((Number(finalized.version) || 1) + 1))} 草稿,定稿後舊版標記為 superseded、永久保留可讀。</p>
      </section>
      ${historyHtml}`;
  } else {
    const d = avsWorkingDraft;
    const sourceNote = d.modalitySource === "inferred"
      ? `<p class="avs-co-warn">⚠ 治療項目由舊病歷自由文字推斷(legacy fallback),定稿前請確認正確。要改為結構化記錄,請在 SOAP「治療項目 Modalities performed」勾選後重新產生。</p>`
      : (d.modalitySource === "none" ? `<p class="avs-co-warn">⚠ 此診未找到任何療法記錄 —— 「今天做了什麼」會是空白。</p>` : "");
    const adviceRows = d.renderedAdvice.map((a, i) => `
      <div class="avs-co-advice-row">
        <label class="avs-co-advice-head">
          <input type="checkbox" data-avs-sel="${i}" ${a.selected !== false ? "checked" : ""} />
          <span class="avs-co-cat">${escapeHtml(AVS_CATEGORY_LABELS[a.category] || a.category)}</span>
          <button class="ghost avs-co-why-btn" type="button" data-avs-why="${i}">為什麼建議? Why?</button>
        </label>
        <textarea data-avs-text="${i}" rows="2">${escapeHtml(a.text_zh)}</textarea>
        <div class="avs-co-why" data-avs-why-panel="${i}" hidden>
          <small>Matched(僅醫師端,不進病人文件):${escapeHtml((a.matchedTriggers || []).join("、") || "—")}</small>
          ${a.evidenceType ? `<small>證據等級:${escapeHtml(AVS_EVIDENCE_TYPE_LABELS[a.evidenceType] || a.evidenceType)}</small>` : ""}
          ${(a.sourceRefs || []).length ? `<small class="avs-co-sources">來源:${a.sourceRefs.map((s) => s && s.url ? `<a href="${escapeAttribute(s.url)}" target="_blank" rel="noopener">${escapeHtml(shortCitation(s.name))}</a>` : escapeHtml(shortCitation(s && s.name))).join("、")}</small>` : ""}
        </div>
      </div>`).join("");
    const customRows = d.clinicianAddedAdvice.map((a, i) => `
      <div class="avs-co-advice-row avs-co-custom-row">
        <div class="avs-co-advice-head">
          <select data-avs-custom-cat="${i}">
            ${Object.entries(AVS_CATEGORY_LABELS).map(([id, label]) => `<option value="${escapeAttribute(id)}" ${a.category === id ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
          </select>
          <button class="ghost" type="button" data-avs-custom-remove="${i}">移除 Remove</button>
        </div>
        <textarea data-avs-custom-text="${i}" rows="2" placeholder="病人語言,不放診斷詞與內部代碼">${escapeHtml(a.text_zh)}</textarea>
      </div>`).join("");
    body.innerHTML = `
      <div class="avs-co-meta">Visit ${escapeHtml(note.visitDate || "")} · ${escapeHtml(kase.patientCode || "")} · 草稿 v${escapeHtml(String(d.version))}${finalized ? ` (更正 v${escapeHtml(String(finalized.version))})` : ""}</div>
      <section class="avs-co-section">
        <h3>1 · 今天 Today</h3>
        ${d.todayCare.length ? `<p>${d.todayCare.map(escapeHtml).join("、")}</p>` : `<p class="avs-co-empty">無療法記錄</p>`}
        ${sourceNote}
      </section>
      <section class="avs-co-section">
        <h3>2 · 建議指示 Suggested instructions</h3>
        ${adviceRows || `<p class="avs-co-empty">沒有符合的建議(可加自訂指示)。</p>`}
      </section>
      <section class="avs-co-section">
        <h3>3 · 自訂指示 Custom instructions</h3>
        ${customRows}
        <button class="ghost" type="button" id="avsAddCustomBtn">+ 新增自訂指示 Add custom instruction</button>
      </section>
      <section class="avs-co-section">
        <h3>4 · 中藥/營養品 Medicines & herbs</h3>
        ${d.medicationInstructionsSnapshot.length ? `<table class="avs-co-med-table"><tr><th>名稱</th><th>用量</th><th>頻率</th></tr>${d.medicationInstructionsSnapshot.map((r) => `<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.dose)}</td><td>${escapeHtml(r.freq)}</td></tr>`).join("")}</table><p class="avs-co-note">來源:病例用藥帳(active);要調整請回 Meds & Supplements ledger 再重新產生。</p>` : `<p class="avs-co-empty">目前沒有 active 的中藥/營養品。</p>`}
      </section>
      <section class="avs-co-section">
        <h3>5 · 回診 Follow-up</h3>
        <p class="avs-co-note">⚠ 這格文字會原文印在病人文件上——只寫病人看得懂的回診安排(例:兩週後回診),
          不要放臨床判斷、方名或「若無效就改方」這類只給自己看的內部規劃(SOAP 的回診欄位不會自動帶進來,
          就是為了避免這個)。</p>
        <input type="text" data-avs-followup value="${escapeAttribute(d.followUpSnapshot)}" placeholder="例:兩週後回診" />
      </section>
      <section class="avs-co-section">
        <h3>6 · 自我觀察 What to watch</h3>
        ${d.patientObservationPromptsSnapshot.length ? d.patientObservationPromptsSnapshot.map((p, i) => `<label class="avs-co-watch-row"><input type="checkbox" data-avs-watch="${i}" checked />${escapeHtml(p)}</label>`).join("") : `<p class="avs-co-empty">此病例尚無追蹤指標題面。</p>`}
        <p class="avs-co-note">通用警示(症狀加重/發燒/過敏反應等就醫指引)一律自動附在文件中。</p>
      </section>
      ${historyHtml}
      <div class="dialog-actions">
        <button class="ghost" type="button" id="avsRegenBtn">重新產生 Regenerate</button>
        ${persistedDraft ? `<button class="ghost" type="button" id="avsDiscardBtn">捨棄草稿 Discard draft</button>` : ""}
        <span></span>
        <button class="ghost" type="button" id="avsSaveDraftBtn">儲存草稿 Save draft</button>
        <button class="ghost" type="button" id="avsPreviewBtn">預覽 Preview</button>
        <button type="button" id="avsFinalizeBtn">定稿 Finalize</button>
      </div>`;
  }
  wireAvsCheckoutEvents();
}

function wireAvsCheckoutEvents() {
  const body = document.querySelector("#avsCheckoutBody");
  const { kase, note } = avsCheckoutContext();
  if (!body || !kase || !note) return;
  const snaps = note.avsSnapshots || [];

  body.querySelectorAll("[data-avs-view]").forEach((btn) => btn.addEventListener("click", () => {
    const snap = snaps.find((s) => s.id === btn.dataset.avsView);
    if (!snap) return;
    const html = avsRenderChecked(snap, kase, note);
    if (html) avsOpenWindow(html, false);
  }));
  body.querySelectorAll("[data-avs-print]").forEach((btn) => btn.addEventListener("click", () => {
    const snap = snaps.find((s) => s.id === btn.dataset.avsPrint);
    if (!snap) return;
    const html = avsRenderChecked(snap, kase, note);
    if (html) avsOpenWindow(html, true);
  }));
  body.querySelectorAll("[data-avs-copy-text]").forEach((btn) => btn.addEventListener("click", () => {
    const snap = snaps.find((s) => s.id === btn.dataset.avsCopyText);
    if (!snap) return;
    const text = avsRenderTextChecked(snap, kase, note);
    if (!text) return;
    const original = btn.textContent;
    copyTextToClipboard(text, (copied) => {
      if (!copied) return;   // prompt() 後備已經讓使用者自己複製,不用再覆蓋按鈕文字
      btn.textContent = contentMode === "english" ? "Copied" : "已複製,可貼上 email";
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  }));
  body.querySelectorAll("[data-avs-why]").forEach((btn) => btn.addEventListener("click", () => {
    const panel = body.querySelector(`[data-avs-why-panel="${btn.dataset.avsWhy}"]`);
    if (panel) panel.hidden = !panel.hidden;
  }));

  const correctionBtn = body.querySelector("#avsCorrectionBtn");
  if (correctionBtn) correctionBtn.addEventListener("click", () => {
    try {
      avsWorkingDraft = AcuTingAVS.createCorrectionDraft(snaps);
    } catch (e) { alert(e.message); return; }
    renderAvsCheckout();
  });

  if (!avsWorkingDraft) return;   // 以下皆 draft 編輯模式

  const addCustomBtn = body.querySelector("#avsAddCustomBtn");
  if (addCustomBtn) addCustomBtn.addEventListener("click", () => {
    collectAvsDraftFromDom();
    avsWorkingDraft.clinicianAddedAdvice.push({ category: "lifestyle", text_zh: "" });
    renderAvsCheckout();
  });
  body.querySelectorAll("[data-avs-custom-remove]").forEach((btn) => btn.addEventListener("click", () => {
    collectAvsDraftFromDom();
    avsWorkingDraft.clinicianAddedAdvice.splice(Number(btn.dataset.avsCustomRemove), 1);
    renderAvsCheckout();
  }));

  const regenBtn = body.querySelector("#avsRegenBtn");
  if (regenBtn) regenBtn.addEventListener("click", () => {
    if (!confirm("重新產生會重算媒合建議,勾選與建議文字的編輯會被重置(自訂指示與回診欄保留)。continue?")) return;
    collectAvsDraftFromDom();
    const regenerated = buildAvsDraftFor(kase, note, avsWorkingDraft.version);
    regenerated.clinicianAddedAdvice = avsWorkingDraft.clinicianAddedAdvice;
    regenerated.followUpSnapshot = avsWorkingDraft.followUpSnapshot;
    avsWorkingDraft = regenerated;
    renderAvsCheckout();
  });

  const discardBtn = body.querySelector("#avsDiscardBtn");
  if (discardBtn) discardBtn.addEventListener("click", () => {
    if (!confirm("捨棄已儲存的草稿?(已定稿的歷史版本不受影響)")) return;
    if (!persistAvsSnapshots(snaps.filter((s) => s.status !== "draft"))) return;
    avsWorkingDraft = null;
    render();
    renderAvsCheckout();
  });

  const saveDraftBtn = body.querySelector("#avsSaveDraftBtn");
  if (saveDraftBtn) saveDraftBtn.addEventListener("click", () => {
    collectAvsDraftFromDom();
    if (!persistAvsSnapshots(AcuTingAVS.upsertDraft(snaps, avsWorkingDraft))) return;
    render();
    renderAvsCheckout();
  });

  const previewBtn = body.querySelector("#avsPreviewBtn");
  if (previewBtn) previewBtn.addEventListener("click", () => {
    collectAvsDraftFromDom();
    // 預覽 = 病人會拿到的樣子(§3 Step 6):renderPatientHtml 只渲染勾選項,
    // 診斷後設資料(matchedTriggers)結構上不進渲染器。
    const html = avsRenderChecked(avsWorkingDraft, kase, note);
    if (html) avsOpenWindow(html, false);
  });

  const finalizeBtn = body.querySelector("#avsFinalizeBtn");
  if (finalizeBtn) finalizeBtn.addEventListener("click", () => {
    collectAvsDraftFromDom();
    if (avsWorkingDraft.modalitySource === "inferred") {
      if (!confirm("⚠ 治療項目由舊自由文字推斷(非結構化記錄)。已確認「今天」區塊內容正確?")) return;
    }
    let nextSnaps;
    try {
      nextSnaps = AcuTingAVS.finalizeSnapshot(AcuTingAVS.upsertDraft(snaps, avsWorkingDraft), avsWorkingDraft.id);
    } catch (e) { alert(e.message); return; }
    const fin = nextSnaps.find((s) => s.id === avsWorkingDraft.id);
    const html = avsRenderChecked(fin, kase, note);
    if (!html) return;   // 零診斷自檢未過,不定稿
    if (!confirm(`定稿 AVS v${fin.version}?定稿後文件不可修改;之後的更正會建立新版本,舊版標記 superseded。`)) return;
    if (!persistAvsSnapshots(nextSnaps)) return;
    avsWorkingDraft = null;
    render();
    renderAvsCheckout();
  });
}

function exportClinicalCases() {
  // Codex C2B-R4 finding (P3.3): after the C2b pointer switch the world is
  // {patients + cases + all V2 rows}, and an export that only serializes
  // clinicalCases[] would silently drop the patients layer from every backup.
  // Pre-switch (pointer absent/v1) the legacy array export stays byte-stable
  // so existing backups and the import round-trip keep working unchanged.
  const pointer = localStorage.getItem("acuting-clinical-active");
  let payload;
  if (pointer === "v2") {
    // SOL R-13:這裡過去是裸 JSON.parse。staging 一旦毀損就是未捕捉例外,
    // 而 V8 的 parse 訊息內嵌一段原始輸入 —— 病歷內容會出現在 console /
    // 任何 error 收集器裡。匯出是「資料出事時最想用」的功能,它自己不能
    // 在出事時再洩一次。失敗訊息只報長度,不轉述內容(與 clinical-store
    // 的 parseFailureDetail 同款規則)。
    let staging = null;
    const rawStaging = localStorage.getItem(AcuTingClinicalStore.STAGING_KEY);
    if (rawStaging) {
      try {
        staging = JSON.parse(rawStaging);
      } catch {
        alert(`匯出中止:staging 存在但無法解析(${rawStaging.length} 字元,內容不轉述)。\n原始位元組仍在 localStorage,請先人工備份該鍵再修復。未產生任何檔案。`);
        return;
      }
    }
    // Codex C2B-R4: fail closed — pointer=v2 with staging missing is a broken
    // world; exporting a fabricated {patients:[]} envelope would masquerade
    // as a valid backup and could later "restore" data loss.
    if (!staging) {
      alert("匯出中止:pointer=v2 但 staging 不存在——資料狀態異常,請先 rollback 或聯絡維護。未產生任何檔案。");
      return;
    }
    payload = staging;
  } else {
    payload = clinicalCases;
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `acuting-clinical-${pointer === "v2" ? "v2" : "cases"}-${localDateISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  markCasesBackedUp();   // CS1: reset backup age + save counter
}

// Codex audit HIGH#2: import was a silent replace-all — a hand-edited file
// could delete cases or rewrite/truncate exposure event history with no
// trace, which voided the append-only invariant globally. Split into two
// explicit modes:
//   merge   — default. Existing cases keep their identity; an incoming case
//             with a matching id may only EXTEND exposure histories: for every
//             exposure row present on both sides, the existing event sequence
//             must be a prefix of the incoming one, else the whole import is
//             rejected (nothing partially applied). New case ids are added.
//   restore — replace-all, for disaster recovery only. Requires an explicit
//             second confirmation AND auto-downloads a backup of the current
//             store first, so the pre-restore state is never unrecoverable.
// Codex re-audit gate#1: the original string startsWith comparison had two
// false negatives (evt-1 → evt-10 counted as a prefix; same-id payload
// rewrites passed). The structured per-index comparator lives in the store
// (single source, shared with the R8 CLI validator) — this wrapper only maps
// rows and formats messages.
function findImportHistoryViolations(existingCases, incomingCases) {
  const violations = [];
  const byId = new Map(existingCases.map((c) => [c.id, c]));
  for (const inc of incomingCases) {
    const cur = byId.get(inc.id);
    if (!cur) continue;
    for (const field of ["agentExposures", "environmentalExposures"]) {
      const incRows = new Map((inc[field] || []).map((r) => [r.id, r]));
      for (const row of cur[field] || []) {
        const incRow = incRows.get(row.id);
        if (!incRow) { violations.push(`${inc.id}/${field}/${row.id}: exposure row missing from import`); continue; }
        const check = AcuTingClinicalStore.exposureHistoryExtends(row, incRow);
        if (!check.ok) violations.push(`${inc.id}/${field}/${row.id}: ${check.reason}`);
      }
    }
    // Codex NO-GO HIGH-1:AVS 歷史與 exposure 同等待遇 —— merge 用 incoming
    // 整筆蓋掉同 id case 之前,現存每一份 finalized/superseded snapshot 都
    // 必須在 incoming 以同 id、同 canonical payload 存在(唯一合法變化:
    // finalized→superseded)。帶著已定稿 AVS 的 Visit 整筆消失也算截斷。
    if (window.AcuTingAVS) {
      const incNotes = new Map((inc.soapNotes || []).map((n) => [n.id, n]));
      for (const note of cur.soapNotes || []) {
        const hasHistory = (note.avsSnapshots || []).some((s) => s.status === "finalized" || s.status === "superseded");
        if (!hasHistory) continue;
        const incNote = incNotes.get(note.id);
        if (!incNote) { violations.push(`${inc.id}/${note.id}: visit with finalized AVS missing from import (history truncated)`); continue; }
        const check = AcuTingAVS.avsHistoryExtends(note, incNote);
        if (!check.ok) violations.push(`${inc.id}/${note.id}: ${check.reason}`);
      }
    }
  }
  // Codex retest(shadow bypass)整類收口:incoming 本身必須通過全部 AVS
  // 歷史不變量(id 唯一、合法版本序、合法狀態…)才准進 merge —— 上面的
  // extends 比對是「對現存歷史」的保護,這裡是「匯入資料自身健全」的保護,
  // 兩層各擋一半,重複 id 的 shadow copy 在兩層都會死。
  if (window.AcuTingAVS) {
    const inv = AcuTingAVS.checkAvsInvariants(incomingCases);
    for (const f of inv.failures || []) violations.push(`import AVS invariant: ${f}`);
  }
  return violations;
}

function importClinicalCases(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      let imported = JSON.parse(reader.result);
      // Codex C2B-R4 P3.3: a v2 envelope is NEVER silently downgraded to its
      // cases[] (that discards patients+journal — exactly the data the v2
      // backup exists to carry). In the v2 world it restores the FULL
      // envelope into staging; outside the v2 world it is refused outright.
      if (imported && !Array.isArray(imported) && imported.schema_version === 2 && Array.isArray(imported.cases)) {
        const pointer = localStorage.getItem("acuting-clinical-active");
        // R10-D6:runtime-era 備份(runtime_revision ≥ 1)在 pointer 缺席時
        // 也必須可還原 —— 那正是「v2 keys 被清後靠備份復原」的場景;
        // restoreV2Envelope 會做自洽性驗證並自行補回 pointer。
        // migration-era(revision 缺/0)維持原規則:非 v2 世界一律拒絕。
        // R11-E3(app 前置):runtime_revision 存在就必須是 safe integer ≥1;
        // 字串 "2" 這類型別污染在進 store 前擋下,零寫入。
        if (imported.runtime_revision !== undefined && imported.runtime_revision !== null
            && (!Number.isSafeInteger(imported.runtime_revision) || imported.runtime_revision < 1)) {
          alert(`匯入被拒絕:runtime_revision 型別/值非法(${JSON.stringify(imported.runtime_revision)})— 必須是 ≥1 的整數或不存在。未進行任何寫入。`);
          return;
        }
        const importedIsRuntimeEra = Number.isSafeInteger(imported.runtime_revision) && imported.runtime_revision >= 1;
        if (pointer !== "v2" && !importedIsRuntimeEra) {
          alert("匯入被拒絕:這是 v2 備份(含 patients 層),目前系統仍在 v1 模式。v2 還原屬於 migration 工具流程,不能在這裡降級匯入(會丟失 patients/journal)。");
          return;
        }
        // Codex C2B-R5 P3.3 gate:唯一認可路徑 restoreV2Envelope —— 寫入
        // candidate、以「當下 v1 raw + 重建的 deterministic plan」做完整
        // verifyStaging,全綠才原子替換 active staging;任何失敗保留原
        // staging/pointer/畫面,不 reload。竄改過的 envelope 在這裡被拒。
        const really = window.confirm(`⚠️ v2 完整還原:${imported.patients?.length ?? "?"} patients / ${imported.cases.length} cases。將先做完整驗證,通過才會替換。繼續?`);
        if (!really) return;
        const subtleSha256 = async (text) => {
          const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
          return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
        };
        AcuTingClinicalStore.restoreV2Envelope(reader.result, subtleSha256).then((res) => {
          if (res.ok) {
            alert(`v2 staging 驗證通過並已還原(${res.patients} patients / ${res.cases} cases)。頁面將重新載入。`);
            location.reload();
          } else if (res.code === "INCONSISTENT_STATE") {
            // R11-E5:部分寫入且回滾失敗 —— 絕不宣稱「未被更動」。顯示實際
            // 兩鍵狀態、設唯讀保護(擋 persist),要求先匯出後人工修復。
            clinicalStoreIntegrityError = res.failures.join("; ");
            alert(`⚠️ 還原進入不一致狀態(部分寫入且回滾失敗)。已啟動唯讀保護,存檔已鎖定。\n實際狀態:\n${res.failures.join("\n")}\n\n請先匯出 localStorage 的 staging 與 pointer 兩鍵內容,再人工修復。`);
          } else {
            alert(`匯入被拒絕 — 驗證失敗(現有資料未被更動):\n\n${res.failures.slice(0, 5).join("\n")}${res.failures.length > 5 ? "\n…" : ""}`);
          }
        }).catch((e) => {
          // Codex R6:restore 內部已收斂一切例外,這層 .catch 是縱深防禦 ——
          // 萬一仍有洩漏,fail closed:提示、不 reload、資料未動。
          alert("匯入失敗(現有資料未被更動):" + (e && e.message || e));
        });
        return;
      }
      if (!Array.isArray(imported)) throw new Error("Clinical cases JSON must be an array");
      const incoming = imported.map(normalizeClinicalCase);
      // Codex spec §4.5: import 在 persist 前先驗不變量,不以 silent
      // inference 修掉衝突 —— 規則與 CI 同一份(store.checkClinicalInvariants)。
      if (window.AcuTingClinicalStore) {
        const inv = AcuTingClinicalStore.checkClinicalInvariants(incoming);
        if (inv.failures.length) {
          alert(`匯入被拒絕 Import rejected — ${inv.failures.length} 筆契約違規:\n\n${inv.failures.slice(0, 5).join("\n")}${inv.failures.length > 5 ? "\n…" : ""}\n\n請修正匯入檔後重試(規則見 scripts/validate-clinical-invariants.js)。`);
          return;
        }
      }
      // OK = merge(安全預設), Cancel = restore(整包覆蓋)。
      const restoreMode = !window.confirm(
        "匯入模式 Import mode:\n\n【確定 OK】= 合併 Merge(安全:保留現有病例,只新增/延伸)\n【取消 Cancel】= 完整還原 Restore(整包覆蓋,僅災難復原用)"
      );
      const snapshot = structuredClone(clinicalCases);
      const prevSelectedCaseId = selectedCaseId;
      if (!restoreMode) {
        const violations = findImportHistoryViolations(clinicalCases, incoming);
        if (violations.length) {
          alert(`合併被拒絕 Merge rejected — ${violations.length} 筆事件歷史會被改寫/截短:\n\n${violations.slice(0, 5).join("\n")}${violations.length > 5 ? "\n…" : ""}\n\n事件歷史只能延伸,不能改寫(append-only)。若這是刻意的災難復原,請改用 Restore 模式。`);
          return;
        }
        const byId = new Map(clinicalCases.map((c) => [c.id, c]));
        for (const inc of incoming) byId.set(inc.id, inc);
        clinicalCases = [...byId.values()];
      } else {
        const really = window.confirm(
          `⚠️ Restore 會以匯入檔完整取代現有 ${clinicalCases.length} 個病例。\n\n目前資料會先自動下載一份備份。確定要覆蓋?`
        );
        if (!really) return;
        const backupBlob = new Blob([JSON.stringify(clinicalCases, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(backupBlob);
        a.download = `acuting-cases-pre-restore-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        clinicalCases = incoming;
      }
      selectedCaseId = clinicalCases[0]?.id || "";
      // R9 gate B: persist failure rolls back the merged/restored in-memory
      // state and skips render — the import must not appear to have applied.
      if (!persistClinicalCases()) {
        clinicalCases = snapshot;
        selectedCaseId = prevSelectedCaseId;
        return;
      }
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

// FIX C (Dry Clinic #3) — safetyFlags is safety-relevant free text scanned
// before treatment; splitList's comma split breaks one flag with an
// internal comma into two fragments (e.g. "偶服 lorazepam(鎮靜劑,注意電針/
// 放鬆反應疊加)" → two broken pieces). Semicolon/newline only — commas
// (inside or outside parentheses) never split a flag.
// MIGRATION SAFETY: this only changes how NEW textarea input is parsed.
// Every case's ALREADY-STORED safetyFlags is an array and goes through the
// `Array.isArray(value.safetyFlags) ? value.safetyFlags.map(String) : ...`
// branch in normalizeClinicalCase, never through this function — no
// existing record's flags are re-split or rewritten by this change.
function splitSafetyFlags(text) {
  return String(text || "").split(/[;；]|\r?\n/).map((item) => item.trim()).filter(Boolean);
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
  link.download = `acupoint-atlas-${localDateISO()}.json`;
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

  launcher.innerHTML = `
    <div>
      <div class="channels-launcher-title">🌐 十四正經與奇經八脈速選 / Channels & Extraordinary Meridians</div>
      <div class="meridian-pills-row">
        ${mainMeridians.map(m => `
          <button type="button" class="meridian-pill-btn ${activeChartMode === '' && activeChannelCode === m.code ? 'active' : ''}" data-ch-code="${m.code}">
            ${m.code} <small>(${contentMode === 'english' ? m.en : m.zh})</small>
          </button>
        `).join('')}
      </div>
      <div class="meridian-pills-row" style="margin-top: 0.4rem;">
        ${extraVessels.map(m => `
          <button type="button" class="meridian-pill-btn pill-extra-vessel ${activeChartMode === '' && activeChannelCode === m.code ? 'active' : ''}" data-ch-code="${m.code}">
            ${m.code} <small>(${contentMode === 'english' ? m.en : m.zh})</small>
          </button>
        `).join('')}
      </div>
    </div>

    <div>
      
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.5rem;">
    <div class="channels-launcher-title" style="margin-bottom: 0;">📊 eLotus 經典七大特定穴總表 / 7 Major Point Charts & Master Matrices</div>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <a href="https://www.mastertungacupuncture.org/acupuncture/traditional/points/list" target="_blank" rel="noreferrer" class="source-link-chip" style="font-size: 0.82rem; padding: 0.25rem 0.6rem; background: #1f5b3d; color: #ffffff; text-decoration: none; border-radius: 4px; display: inline-flex; align-items: center; gap: 0.3rem;">
        🔗 eLotus 權威穴位總表 ↗
      </a>
      <a href="https://www.mastertungacupuncture.org/acupuncture/traditional/system/pointcharts" target="_blank" rel="noreferrer" class="source-link-chip" style="font-size: 0.82rem; padding: 0.25rem 0.6rem; background: #2b704c; color: #ffffff; text-decoration: none; border-radius: 4px; display: inline-flex; align-items: center; gap: 0.3rem;">
        📊 eLotus 經脈圖表總攬 ↗
      </a>
    </div>
  </div>
      <div class="charts-pills-row">
        <button type="button" class="chart-pill-btn ${activeChartMode === 'fiveshu' ? 'active' : ''}" data-chart-mode="fiveshu">
          1. 五輸穴總表 (Five Shu Points)
        </button>
        <button type="button" class="chart-pill-btn ${activeChartMode === 'yuanluoxi' ? 'active' : ''}" data-chart-mode="yuanluoxi">
          2. 原絡郄俞募穴總表 (Yuan, Luo, Xi, Front Mu, Back Shu)
        </button>
        <button type="button" class="chart-pill-btn ${activeChartMode === 'lowerhe' ? 'active' : ''}" data-chart-mode="lowerhe">
          3. 下合穴/母子補瀉/出入穴 (Lower He Sea, Mother, Child, Entry, Exit)
        </button>
        <button type="button" class="chart-pill-btn ${activeChartMode === 'confluent' ? 'active' : ''}" data-chart-mode="confluent">
          4. 八脈交會穴與配穴 (Master & Coupled Points)
        </button>
        <button type="button" class="chart-pill-btn ${activeChartMode === 'groupluo' ? 'active' : ''}" data-chart-mode="groupluo">
          5. 組絡穴/經筋交會穴 (Group Luo & Muscle Meridian Meeting)
        </button>
        <button type="button" class="chart-pill-btn ${activeChartMode === 'huicommand' ? 'active' : ''}" data-chart-mode="huicommand">
          6. 八會穴與六總穴 (Hui Influential & Command Points)
        </button>
        <button type="button" class="chart-pill-btn ${activeChartMode === 'fourseaghost' ? 'active' : ''}" data-chart-mode="fourseaghost">
          7. 四海穴與十三鬼穴 (Four Sea Points & 13 Ghost Points)
        </button>
      </div>
    </div>
  `;

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

  // Default: Meridian/Vessel Overview Card.
  // Only 5 of the 20 channels have records so far. Falling back to
  // channelRecords[0] meant clicking ST highlighted ST and then showed the
  // Lung channel — the reader has no way to tell they are looking at the
  // wrong meridian. Say so instead.
  const chData = channelRecords.find(c => c.code === activeChannelCode);
  if (!chData) {
    const label = [...mainMeridians, ...extraVessels].find(m => m.code === activeChannelCode);
    const isEn = contentMode === "english";
    content.innerHTML = `
      <div class="channel-empty-state">
        <h3>${escapeHtml(label ? (isEn ? label.en : label.zh) : activeChannelCode)}</h3>
        <p>${isEn
          ? "No channel record yet. Only 5 of 20 channels have been entered; this one is still pending."
          : "此經脈尚無資料。目前 20 條經脈中只有 5 條建檔，這一條還沒做。"}</p>
        <p class="channel-empty-note">${isEn
          ? "Pathway, point count and clock time are factual data and are not inferred."
          : "循行、穴數與流注時辰屬事實資料，不做推測填補。"}</p>
      </div>`;
    return;
  }
  content.innerHTML = renderChannelOverviewCard(chData);
  bindMatrixPointLinks(content);
}

function bindMatrixPointLinks(container) {
  // Point clicks
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

  // Channel nav buttons (prev/next)
  container.querySelectorAll('.elotus-banner-nav button[data-ch-code]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCode = btn.dataset.chCode;
      if (targetCode) {
        activeChannelCode = targetCode;
        window.location.hash = `#channels/${targetCode}`;
        render();
      }
    });
  });

  // Sub-tab filter buttons
  container.querySelectorAll('.subtab-btn[data-subtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.subtab;

      const secPoints = container.querySelector('#section-points-curriculum');
      const secRhymes = container.querySelector('#section-rhymes-muscles');
      const secAnatomy = container.querySelector('#section-anatomy-qihua');
      const secPreserve = container.querySelector('#section-preservation-guide');

      const allSections = [secPoints, secRhymes, secAnatomy, secPreserve].filter(Boolean);

      if (tab === 'all') {
        allSections.forEach(s => { s.style.display = 'block'; });
      } else {
        allSections.forEach(s => { s.style.display = 'none'; });
        if (tab === 'points' && secPoints) secPoints.style.display = 'block';
        if (tab === 'rhymes' && secRhymes) secRhymes.style.display = 'block';
        if (tab === 'anatomy' && secAnatomy) secAnatomy.style.display = 'block';
        if (tab === 'preservation' && secPreserve) secPreserve.style.display = 'block';
      }
    });
  });

  // Real-time point search input
  const searchInput = container.querySelector('#channelPointSearchInput');
  const searchCount = container.querySelector('#channelPointSearchCount');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      const pointCards = container.querySelectorAll('.channel-point-card-item');
      let visibleCount = 0;

      pointCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          card.style.display = 'block';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (searchCount) {
        searchCount.textContent = q ? `匹配到 ${visibleCount} 穴` : `顯示全部 ${pointCards.length} 穴`;
      }
    });
  }
}

function renderChannelOverviewCard(ch) {
  const en = typeof contentMode !== 'undefined' && contentMode === 'english';
  const prevCode = ch.prev_code || 'LU';
  const nextCode = ch.next_code || 'LI';
  const pointsCount = (ch.points_curriculum && ch.points_curriculum.length) || 0;

  return `
    <article class="elotus-channel-banner">
      <div>
        <span class="elotus-banner-brand">${en ? 'TCM Acupuncture · Channel & Vessel Overview' : 'TCM Acupuncture · 經脈與奇經總覽'}</span>
        <div class="elotus-banner-title">
          <h1>${escapeHtml(ch.nameEn || ch.code)} <small>(${escapeHtml(ch.nameZh || '')})</small></h1>
        </div>
        <p class="elotus-banner-subtitle">
          ${escapeHtml((ch.aliases_en || []).join(', '))} · ${en ? 'Element' : '屬性 Element'}: ${escapeHtml(ch.element || 'Hand/Foot')} · ${en ? 'Clock' : '時辰 Clock'}: ${escapeHtml(ch.clock_time || '')}
        </p>
      </div>
      <div class="elotus-banner-nav">
        <button type="button" data-ch-code="${prevCode}">‹ ${prevCode}</button>
        <button type="button" data-ch-code="${nextCode}">${nextCode} ›</button>
      </div>
    </article>

    <!-- Sub-Tab Navigation Bar & Sticky Quick Section Anchor -->
    <nav class="channel-subtab-bar">
      <button type="button" class="subtab-btn active" data-subtab="all">${en ? '🌐 Full Overview' : '🌐 完整全覽'}</button>
      ${pointsCount ? `<button type="button" class="subtab-btn" data-subtab="points">${en ? `📚 Points Library (${pointsCount})` : `📚 穴位大字庫 (${pointsCount})`}</button>` : ''}
      ${(ch.channel_rhyme_zh || ch.divergent_channel_zh || ch.muscle_channel_zh || ch.divergent_channel_en) ? `<button type="button" class="subtab-btn" data-subtab="rhymes">${en ? '📖 Rhymes & Muscles' : '📖 歌訣與經筋'}</button>` : ''}
      ${(ch.seam_anatomy_zh || ch.qihua_zh || ch.pathomechanism_zh || ch.seam_anatomy_en) ? `<button type="button" class="subtab-btn" data-subtab="anatomy">${en ? '🩺 Anatomy & Pathomechanism' : '🩺 氣化與病理按診'}</button>` : ''}
      ${(ch.preservation_zh || ch.preservation_en) ? `<button type="button" class="subtab-btn" data-subtab="preservation">${en ? '🌿 Meridian Care' : '🌿 養生導引'}</button>` : ''}
    </nav>

    <section class="channel-article-section">
      <h3>${en ? 'PATHWAY & POINTS' : 'PATHWAY & POINTS / 循行與包含穴位'} (${(ch.points_list || []).length} ${en ? 'Points' : '穴'})</h3>
      <p style="margin-bottom: 0.75rem; color: #35473e; line-height: 1.6;">
        ${escapeHtml(en ? (ch.pathway_en || ch.pathway_zh) : ch.pathway_zh)}
      </p>
      <div class="channel-points-grid">
        ${(ch.points_list || []).map(p => `
          <a class="channel-point-chip" href="#point/${p.code}" data-point-code="${p.code}">
            <strong>${p.code}</strong> ${escapeHtml(en ? p.nameEn : p.nameZh)} <small>(${escapeHtml(en ? p.nameZh : p.nameEn)})</small>
          </a>
        `).join('')}
      </div>
    </section>

    <section class="channel-article-section">
      <h3>${en ? 'INDICATIONS' : 'INDICATIONS / 主治病症'}</h3>
      <ul style="padding-left: 1.2rem; color: #35473e; line-height: 1.6;">
        ${(en ? (ch.indications_en || ch.indications_zh) : ch.indications_zh || []).map(item => `
          <li>${escapeHtml(item)}</li>
        `).join('')}
      </ul>
    </section>

    <section class="channel-article-section">
      <h3>${en ? 'CLINICAL APPLICATIONS' : 'CLINICAL APPLICATIONS / 臨床特點與應用'}</h3>
      <ul style="padding-left: 1.2rem; color: #35473e; line-height: 1.6;">
        ${(en ? (ch.applications_en || ch.applications_zh) : ch.applications_zh || []).map(item => `
          <li>${escapeHtml(item)}</li>
        `).join('')}
      </ul>
    </section>

    ${(ch.special_points || ch.paired_channel) ? `
      <section class="channel-article-section">
        <h3>${en ? 'SPECIAL POINTS & PAIRINGS' : 'SPECIAL POINTS / 特定穴與配穴'}</h3>
        <div class="channel-special-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-top: 0.5rem;">
          ${ch.paired_channel ? `
            <div class="special-point-box" style="background: #f4f6f4; border: 1px solid #d4dfd4; border-radius: 6px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.8rem; color: #5a7566; font-weight: 700; text-transform: uppercase;">${en ? 'PAIRED CHANNEL' : 'PAIRED CHANNEL / 表裡/相配經脈'}</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #1f5b3d; margin-top: 0.2rem;">${escapeHtml(ch.paired_channel)}</div>
            </div>
          ` : ''}
          ${ch.special_points?.master_point ? `
            <div class="special-point-box" style="background: #f4f6f4; border: 1px solid #d4dfd4; border-radius: 6px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.8rem; color: #5a7566; font-weight: 700; text-transform: uppercase;">${en ? 'MASTER POINT' : 'MASTER POINT / 八脈交會主穴'}</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #1f5b3d; margin-top: 0.2rem;">${escapeHtml(ch.special_points.master_point)}</div>
            </div>
          ` : ''}
          ${ch.special_points?.coupled_point ? `
            <div class="special-point-box" style="background: #f4f6f4; border: 1px solid #d4dfd4; border-radius: 6px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.8rem; color: #5a7566; font-weight: 700; text-transform: uppercase;">${en ? 'COUPLED POINT' : 'COUPLED POINT / 八脈交會配穴'}</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #1f5b3d; margin-top: 0.2rem;">${escapeHtml(ch.special_points.coupled_point)}</div>
            </div>
          ` : ''}
          ${ch.special_points?.xi_cleft ? `
            <div class="special-point-box" style="background: #f4f6f4; border: 1px solid #d4dfd4; border-radius: 6px; padding: 0.6rem 0.8rem;">
              <div style="font-size: 0.8rem; color: #5a7566; font-weight: 700; text-transform: uppercase;">${en ? 'XI CLEFT POINT' : 'XI CLEFT POINT / 郄穴'}</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #1f5b3d; margin-top: 0.2rem;">${escapeHtml(ch.special_points.xi_cleft)}</div>
            </div>
          ` : ''}
        </div>
      </section>
    ` : ''}

    <!-- 1. 📚 穴位大字庫 Section -->
    ${(ch.points_curriculum && ch.points_curriculum.length) ? `
      <section class="channel-article-section" id="section-points-curriculum" style="margin-top: 1rem;">
        <details open style="background: #ffffff; border: 1px solid #c2e0d3; border-radius: 8px; padding: 0.85rem 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <summary style="cursor: pointer; font-size: 1.05rem; font-weight: 800; color: #164e32; outline: none; user-select: none;">
            ${en ? `📚 ${ch.nameEn} — ${ch.points_curriculum.length} Point Clinical Notes & Essentials` : `📚 課件 ${ch.points_curriculum.length} 穴位詳細臨床選穴與考綱精華 (Curriculum Point Notes)`}
          </summary>
          
          <div style="margin-top: 0.85rem;">
            <div class="channel-point-search-bar" style="margin-bottom: 0.85rem; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
              <input type="text" id="channelPointSearchInput" class="form-control" placeholder="${en ? '🔍 Search points, actions, indications (e.g. Insomnia, Hypertension, Migraine...)' : '🔍 搜尋本經穴位、主治、功用（如：失眠、高血壓、偏頭痛...）'}" style="flex: 1; min-width: 260px; max-width: 450px; padding: 0.45rem 0.8rem; border: 1px solid #bce0d0; border-radius: 6px; font-size: 0.9rem;">
              <span id="channelPointSearchCount" style="font-size: 0.82rem; color: #5a7566; font-weight: 700;">${en ? `Showing all ${ch.points_curriculum.length} points` : `顯示全部 ${ch.points_curriculum.length} 穴`}</span>
            </div>

            <div class="channel-point-cards-grid" style="display: grid; gap: 0.85rem;">
              ${ch.points_curriculum.map(p => `
                <div class="channel-point-card-item" style="background: #f9fbf9; border-left: 4px solid #1f5b3d; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #e2ece7; border-left-width: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.45rem;">
                    <a class="matrix-point-link" href="#point/${p.code}" data-point-code="${p.code}" style="font-size: 1.08rem; font-weight: 800; color: #1f5b3d; text-decoration: none;">
                      ${p.code} ${escapeHtml(en ? p.nameEn : p.nameZh)} ${en ? `<small style="color: #666;">(${escapeHtml(p.nameZh)})</small>` : ''}
                    </a>
                    <div>
                      ${categoryBadgesHtml(p.category)}
                    </div>
                  </div>
                  <div style="font-size: 0.88rem; color: #35473e; line-height: 1.6; display: grid; gap: 0.35rem;">
                    <div><strong>📍 ${en ? 'Location & Needling' : '定位與針法 Location & Needling'}:</strong> ${escapeHtml(en ? (p.location_en || p.location) : p.location)} <em style="color: #8b2500; font-style: normal;">${escapeHtml(en ? (p.needling_en || p.needling) : p.needling)}</em></div>
                    <div><strong>✨ ${en ? 'Actions' : '功用 Functions'}:</strong> ${escapeHtml(en ? (p.actions_en || p.actions) : p.actions)}</div>
                    <div><strong>🎯 ${en ? 'Indications' : '主治 Indications'}:</strong> ${escapeHtml(en ? (p.indications_en || p.indications) : p.indications)}</div>
                    ${(p.notes_en || p.notes) ? `<div style="background: #fff9e6; border-radius: 6px; padding: 0.5rem 0.75rem; border: 1px solid #f0e2b6; color: #7a5c00; margin-top: 0.2rem;"><strong>💡 ${en ? 'Clinical Essentials & Selection' : '考綱精華與選穴要領'}:</strong> ${escapeHtml(en ? (p.notes_en || p.notes) : p.notes)}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </details>
      </section>
    ` : ''}

    <!-- 2. 📖 經典歌訣與經筋 Section -->
    ${(ch.divergent_channel_zh || ch.muscle_channel_zh || ch.channel_rhyme_zh || ch.point_song_zh || ch.luo_channel_zh || ch.dermatome_zh || ch.divergent_channel_en) ? `
      <section class="channel-article-section" id="section-rhymes-muscles" style="margin-top: 1rem;">
        <details open style="background: #fdfbf7; border: 1px solid #e8dbb8; border-radius: 8px; padding: 0.85rem 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <summary style="cursor: pointer; font-size: 1.05rem; font-weight: 800; color: #7a5c00; outline: none; user-select: none;">
            ${en ? '📖 Classic Rhymes, Divergent & Muscle Channels' : '📖 經典歌訣、經別與經筋理論 (Divergent, Muscle Channel & Songs)'}
          </summary>
          <div style="display: grid; gap: 0.85rem; margin-top: 1rem;">
            ${(ch.channel_rhyme_zh || ch.point_song_zh || ch.channel_rhyme_en) ? `
              <div style="background: #ffffff; border-left: 4px solid #b8860b; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #eee2be; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #7a5c00; margin-bottom: 0.4rem;">${en ? '📜 Classic Channel Rhymes & Verse' : '📜 經脈循行歌與穴位歌括 (Classic Channel Rhymes & Songs)'}</div>
                ${(ch.channel_rhyme_en || ch.channel_rhyme_zh) ? `<pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.9rem; color: #2c3e50; line-height: 1.6; margin: 0 0 0.5rem 0;">${escapeHtml(en ? (ch.channel_rhyme_en || ch.channel_rhyme_zh) : ch.channel_rhyme_zh)}</pre>` : ''}
                ${(ch.point_song_en || ch.point_song_zh) ? `<pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.9rem; color: #2c3e50; line-height: 1.6; margin: 0;">${escapeHtml(en ? (ch.point_song_en || ch.point_song_zh) : ch.point_song_zh)}</pre>` : ''}
              </div>
            ` : ''}

            ${(ch.divergent_channel_zh || ch.divergent_channel_en) ? `
              <div style="background: #ffffff; border-left: 4px solid #2e8b57; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #d0e7d8; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #1e5e3a; margin-bottom: 0.4rem;">${en ? '🔀 Divergent Channel Pathway (Jing Bie)' : '🔀 經別循行與深層臟腑連繫 (Divergent Channel / Jing Bie)'}</div>
                ${renderRichTextFormatted(en ? (ch.divergent_channel_en || ch.divergent_channel_zh) : ch.divergent_channel_zh)}
              </div>
            ` : ''}

            ${(ch.luo_channel_zh || ch.luo_channel_en) ? `
              <div style="background: #ffffff; border-left: 4px solid #8a2be2; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #e6d7ff; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #4b0082; margin-bottom: 0.4rem;">${en ? '🔗 Luo-Connecting Vessel (Luo Mai)' : '🔗 絡脈循行與病變 (Luo-Connecting Vessel)'}</div>
                ${renderRichTextFormatted(en ? (ch.luo_channel_en || ch.luo_channel_zh) : ch.luo_channel_zh)}
              </div>
            ` : ''}

            ${(ch.muscle_channel_zh || ch.muscle_channel_en) ? `
              <div style="background: #ffffff; border-left: 4px solid #4682b4; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #d4e3f0; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #1c4966; margin-bottom: 0.4rem;">${en ? '💪 Muscle Channel Pathway (Jing Jin)' : '💪 經筋循行與病候 (Muscle Channel / Jing Jin)'}</div>
                ${renderRichTextFormatted(en ? (ch.muscle_channel_en || ch.muscle_channel_zh) : ch.muscle_channel_zh)}
              </div>
            ` : ''}

            ${(ch.dermatome_zh || ch.dermatome_en) ? `
              <div style="background: #ffffff; border-left: 4px solid #d2691e; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #f9ebdc; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #8b4513; margin-bottom: 0.4rem;">${en ? '🛡️ Cutaneous Region (Dermatome / Pi Bu)' : '🛡️ 皮部與六經之闔 (Dermatome / Yangming He-Fei)'}</div>
                ${renderRichTextFormatted(en ? (ch.dermatome_en || ch.dermatome_zh) : ch.dermatome_zh)}
              </div>
            ` : ''}
          </div>
        </details>
      </section>
    ` : ''}

    <!-- 3. 🩺 氣化與病理按診 Section -->
    ${(ch.seam_anatomy_zh || ch.qihua_zh || ch.pathomechanism_zh || ch.seam_anatomy_en) ? `
      <section class="channel-article-section" id="section-anatomy-qihua" style="margin-top: 1rem;">
        <details open style="background: #f4f8f6; border: 1px solid #c8ded3; border-radius: 8px; padding: 0.85rem 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <summary style="cursor: pointer; font-size: 1.05rem; font-weight: 800; color: #1b5e3a; outline: none; user-select: none;">
            ${en ? '🩺 Cavity Pathway, Qi Transformation & Pathomechanism' : '🩺 循行縫隙、氣化理論與常見經絡異常 (Anatomy, Qi Transformation & Pathomechanism)'}
          </summary>
          <div style="display: grid; gap: 0.85rem; margin-top: 1rem;">
            ${(ch.seam_anatomy_zh || ch.seam_anatomy_en) ? `
              <div style="background: #ffffff; border-left: 4px solid #008080; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #cce6e6; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #004d4d; margin-bottom: 0.4rem;">${en ? '🧭 Cavity Pathway & Seam Anatomy' : '🧭 體內循行與體表縫隙定位 (Seam Anatomy & Cavity Pathway)'}</div>
                ${renderRichTextFormatted(en ? (ch.seam_anatomy_en || ch.seam_anatomy_zh) : ch.seam_anatomy_zh)}
              </div>
            ` : ''}

            ${(ch.qihua_zh || ch.qihua_en) ? `
              <div style="background: #ffffff; border-left: 4px solid #6f42c1; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #e2d9f3; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #452484; margin-bottom: 0.4rem;">${en ? '🔮 Qi Transformation & Organ Physiology' : '🔮 氣化理論與臟腑解剖考證 (Qi Transformation & Organ Physiology)'}</div>
                ${renderRichTextFormatted(en ? (ch.qihua_en || ch.qihua_zh) : ch.qihua_zh)}
              </div>
            ` : ''}

            ${(ch.pathomechanism_zh || ch.pathomechanism_en) ? `
              <div style="background: #ffffff; border-left: 4px solid #d9534f; border-radius: 6px; padding: 0.85rem 1.1rem; border: 1px solid #f2dede; border-left-width: 4px;">
                <div style="font-size: 0.98rem; font-weight: 800; color: #a94442; margin-bottom: 0.4rem;">${en ? '⚠️ Pathomechanism (Shi-Dong & Suo-Sheng Diseases)' : '⚠️ 常見經絡異常：是動病、所生病與虛實病理 (Pathomechanism)'}</div>
                ${renderRichTextFormatted(en ? (ch.pathomechanism_en || ch.pathomechanism_zh) : ch.pathomechanism_zh)}
              </div>
            ` : ''}
          </div>
        </details>
      </section>
    ` : ''}

    <!-- 4. 🌿 養生導引 Section -->
    ${(ch.preservation_zh || ch.preservation_en) ? `
      <section class="channel-article-section" id="section-preservation-guide" style="margin-top: 1rem;">
        <details open style="background: #f2f9f4; border: 1px solid #b8dec9; border-radius: 8px; padding: 0.85rem 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <summary style="cursor: pointer; font-size: 1.05rem; font-weight: 800; color: #23543b; outline: none; user-select: none;">
            ${en ? '🌿 Meridian Care & Self-Care Cultivation Guide' : '🌿 經絡保養與日常養生導引 (Meridian Care & Preservation Guide)'}
          </summary>
          <div style="margin-top: 1rem;">
            ${renderRichTextFormatted(en ? (ch.preservation_en || ch.preservation_zh) : ch.preservation_zh)}
          </div>
        </details>
      </section>
    ` : ''}
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
    { ch: "LR (足厥陰肝經)", well: "LR1 大敦", spring: "LR2 行間", stream: "LR3 太衝", river: "LR4 中封", sea: "LR8 曲泉" }
  ];

  const formatCell = (txt) => {
    const m = txt.match(/^([A-Z0-9]+)s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        1. 五輸穴中英總表 (Five Shu Points: Jing-Well, Ying-Spring, Shu-Stream, Jing-River, He-Sea)
      </h3>
      
      <div style="background: #f0f7f4; border: 1px solid #c2e0d3; border-radius: 8px; padding: 1rem; margin-bottom: 1.2rem;">
        <h4 style="color: #164e32; margin: 0 0 0.5rem; font-size: 0.98rem; font-weight: 700;">💡 eLotus & Point Selection 核心知識點與選穴原理：</h4>
        <ul style="margin: 0; padding-left: 1.2rem; color: #2d4a3b; font-size: 0.88rem; line-height: 1.6;">
          <li><strong>井穴 (Jing-Well - 出):</strong> 氣血所出，主治「心下滿」、急救開竅、熱病昏迷、精神神志暴疾。位於手足末端。</li>
          <li><strong>滎穴 (Ying-Spring - 溜):</strong> 氣血所溜，主治「身熱」、清瀉本經實熱與急性發炎（如魚際瀉肺熱、行間瀉肝火）。</li>
          <li><strong>輸穴 (Shu-Stream - 注):</strong> 氣血所注，主治「體重節痛」、風濕痺痛、脾胃重滯。陰經之輸穴即本經原穴。</li>
          <li><strong>經穴 (Jing-River - 行):</strong> 氣血所行，主治「喘呼吸寒熱」、咽喉音啞、咳嗽發熱。</li>
          <li><strong>合穴 (He-Sea - 入):</strong> 氣血所入，主治「逆氣而泄」、腸胃腑病、水飲停聚與氣血上逆。位於肘膝關節附近。</li>
        </ul>
      </div>

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

  const guestHostRows = [
    { pair: "LU9 太淵 (原/主) + LI6 偏歷 (絡/客)", scope: "胸悶、手掌發熱、咽喉腫痛、喘促、風熱犯肺與大腸水腫" },
    { pair: "LI4 合谷 (原/主) + LU7 列缺 (絡/客)", scope: "牙痛、齒齦腫、鼻衄、目黃、口乾、外感風寒咳嗽、項強痛" },
    { pair: "SP3 太白 (原/主) + ST40 豐隆 (絡/客)", scope: "脾虛為本、痰濕為標：健脾益氣治本、化痰降濁治標之黃金配穴" },
    { pair: "ST42 衝陽 (原/主) + SP4 公孫 (絡/客)", scope: "胃痛、腹脹、心胸痞滿、鼻衄、足跗疼痛、消化不良" },
    { pair: "HT7 神門 (原/主) + SI7 支正 (絡/客)", scope: "心痛、咽乾、目黃、心悸驚恐、嘔血、精神失眠" },
    { pair: "SI4 腕骨 (原/主) + HT5 通里 (絡/客)", scope: "項強、咽喉腫痛、肩臂痛、耳聾、暴瘖失音" },
    { pair: "KI3 太溪 (原/主) + BL58 飛揚 (絡/客)", scope: "腎虛腰痛、清涕、尿赤、腳跟痛、耳鳴眩暈" },
    { pair: "BL64 京骨 (原/主) + KI4 大鐘 (絡/客)", scope: "鼻塞、頭痛、腰背痛、小便不利、情志鬱怒" },
    { pair: "PC7 大陵 (原/主) + TE5 外關 (絡/客)", scope: "心痛、胸脅支滿、心煩、發熱、肘臂攣痛" },
    { pair: "TE4 陽池 (原/主) + PC6 內關 (絡/客)", scope: "耳鳴、耳聾、咽喉腫痛、胸悶、嘔吐、心悸" },
    { pair: "LR3 太衝 (原/主) + GB37 光明 (絡/客)", scope: "肝陽上亢、頭痛眩暈、目赤腫痛、夜盲、脅痛" },
    { pair: "GB40 丘墟 (原/主) + LR5 蠡溝 (絡/客)", scope: "口苦、善太息、胸脅痛、少腹疝氣痛、陰癢" }
  ];

  const formatCell = (txt) => {
    const m = txt.match(/^([A-Z0-9]+)s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        2. 原絡郄俞募穴總表 (Yuan Source, Luo Connection, Xi Cleft, Front Mu, & Back Shu Points)
      </h3>

      <div style="background: #f0f7f4; border: 1px solid #c2e0d3; border-radius: 8px; padding: 1rem; margin-bottom: 1.2rem;">
        <h4 style="color: #164e32; margin: 0 0 0.5rem; font-size: 0.98rem; font-weight: 700;">💡 eLotus & Point Selection 核心知識點與選穴原理：</h4>
        <ul style="margin: 0; padding-left: 1.2rem; color: #2d4a3b; font-size: 0.88rem; line-height: 1.6;">
          <li><strong>原穴 (Yuan-Source):</strong> 五臟六腑原氣深聚處，主治本臟本腑之虛實極症。</li>
          <li><strong>絡穴 (Luo-Connecting):</strong> 聯絡表裏兩經，善治表裏兩經相兼病變及慢性絡脈瘀血。</li>
          <li><strong>主客原絡配穴法 (Host-Guest Pairing):</strong> 先病為「主」（取先病經之原穴），後病為「客」（取後病經之絡穴）。如肺先病取 LU9 太淵(原)，大腸後病取 LI6 偏歷(絡)。</li>
          <li><strong>郄穴 (Xi-Cleft):</strong> 氣血深聚之隙縫，專治本經本臟之「急性劇痛」與「急性出血」（如陰郄止心痛血暴、孔最止咯血）。</li>
          <li><strong>俞募配穴法 (Back-Shu & Front-Mu):</strong> 陰病行陽（取背俞穴治臟病、寒病、慢性病）；陽病行陰（取胸腹募穴治腑病、熱病、急性病）。</li>
        </ul>
      </div>

      <h4 style="color: #2b704c; margin: 0.75rem 0 0.4rem; font-size: 1.05rem;">一、十二經原絡郄俞募總表</h4>
      <table class="master-matrix-table" style="margin-bottom: 1.5rem;">
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

      <h4 style="color: #2b704c; margin: 0.75rem 0 0.4rem; font-size: 1.05rem;">二、主客原絡經典配穴與臨床應用 (Guest-Host Formulations)</h4>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>主客配穴對組合 Guest-Host Pair</th>
            <th>臨床主治症狀與選穴要領 Target Clinical Indications</th>
          </tr>
        </thead>
        <tbody>
          ${guestHostRows.map(g => `
            <tr>
              <td class="channel-name-cell" style="font-weight: 700;">${g.pair}</td>
              <td>${g.scope}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderLowerHeMotherChildMatrixTable() {
  const lowerHeRows = [
    { fu: "ST (胃)", point: "ST36 足三里 (Zusanli)", channel: "足陽明胃經" },
    { fu: "LI (大腸)", point: "ST37 上巨虛 (Shangjuxu)", channel: "足陽明胃經" },
    { fu: "SI (小腸)", point: "ST39 下巨虛 (Xiajuxu)", channel: "足陽明胃經" },
    { fu: "BL (膀胱)", point: "BL40 委中 (Weizhong)", channel: "足太陽膀胱經" },
    { fu: "TE (三焦)", point: "BL39 委陽 (Weiyang)", channel: "足太陽膀胱經" },
    { fu: "GB (膽)", point: "GB34 陽陵泉 (Yanglingquan)", channel: "足少陽膽經" }
  ];

  const entryExitRows = [
    { ch: "LU 手太陰肺經", entry: "LU1 中府", exit: "LU7 列缺", next: "接手陽明大腸經 (LI4/LI1)" },
    { ch: "LI 手陽明大腸經", entry: "LI4 合谷", exit: "LI20 迎香", next: "接足陽明胃經 (ST1)" },
    { ch: "ST 足陽明胃經", entry: "ST1 承泣", exit: "ST42 衝陽", next: "接足太陰脾經 (SP1)" },
    { ch: "SP 足太陰脾經", entry: "SP1 隱白", exit: "SP21 大包", next: "接手少陰心經 (HT1)" },
    { ch: "HT 手少陰心經", entry: "HT1 極泉", exit: "HT9 少衝", next: "接手太陽小腸經 (SI1)" },
    { ch: "SI 手太陽小腸經", entry: "SI1 少澤", exit: "SI19 聽宮", next: "接足太陽膀胱經 (BL1)" },
    { ch: "BL 足太陽膀胱經", entry: "BL1 睛明", exit: "BL67 至陰", next: "接足少陰腎經 (KI1)" },
    { ch: "KI 足少陰腎經", entry: "KI1 湧泉", exit: "KI22 步廊", next: "接手厥陰心包經 (PC1)" },
    { ch: "PC 手厥陰心包經", entry: "PC1 天池", exit: "PC8 勞宮", next: "接手少陽三焦經 (TE1)" },
    { ch: "TE 手少陽三焦經", entry: "TE1 關衝", exit: "TE22 和髎", next: "接足少陽膽經 (GB1)" },
    { ch: "GB 足少陽膽經", entry: "GB1 瞳子髎", exit: "GB41 足臨泣", next: "接足厥陰肝經 (LR1)" },
    { ch: "LR 足厥陰肝經", entry: "LR1 大敦", exit: "LR14 期門", next: "接手太陰肺經 (LU1 循環周天)" }
  ];

  const formatCell = (txt) => {
    const m = txt.match(/^([A-Z0-9]+)s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        3. 下合穴與母子補瀉穴總表 (Lower He-Sea & Mother-Child Tonification/Sedation Points)
      </h3>

      <div style="background: #f0f7f4; border: 1px solid #c2e0d3; border-radius: 8px; padding: 1rem; margin-bottom: 1.2rem;">
        <h4 style="color: #164e32; margin: 0 0 0.5rem; font-size: 0.98rem; font-weight: 700;">💡 eLotus & Point Selection 核心知識點與選穴原理：</h4>
        <ul style="margin: 0; padding-left: 1.2rem; color: #2d4a3b; font-size: 0.88rem; line-height: 1.6;">
          <li><strong>六腑下合穴 (Six Lower He-Sea Points):</strong> 《靈樞·邪氣臟腑病形》「合治內腑」，六腑之氣皆下合於足三陽經。大腸下合上巨虛(ST37)、小腸下合下巨虛(ST39)、三焦下合委陽(BL39)，專治六腑急性積滯與傳化病變。</li>
          <li><strong>五行母子補瀉法則 (Mother-Child Law):</strong> 「虛則補其母，實則瀉其子」。如肺金虛取太淵(LU9 土生金/母穴)補之；肺金實取尺澤(LU5 金生水/子穴)瀉之。</li>
          <li><strong>十二經氣血出入穴 (Entry & Exit Points):</strong> 經氣流注交接之門戶。若出入穴阻滯（如 LU7 列缺或 ST42 衝陽），氣血無法順利傳接至下一條經脈，會產生跨經疼痛與傳化障礙。</li>
        </ul>
      </div>

      <h4 style="color: #2b704c; margin: 0.75rem 0 0.4rem; font-size: 1.05rem;">一、六腑下合穴 (Six Lower He-Sea Points)</h4>
      <table class="master-matrix-table" style="margin-bottom: 1.5rem;">
        <thead>
          <tr>
            <th>六腑 Organ</th>
            <th>下合穴 Lower He-Sea Point</th>
            <th>所屬經脈 Location Meridian</th>
          </tr>
        </thead>
        <tbody>
          ${lowerHeRows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.fu}</td>
              <td>${formatCell(r.point)}</td>
              <td>${r.channel}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h4 style="color: #2b704c; margin: 0.75rem 0 0.4rem; font-size: 1.05rem;">二、十二經脈氣血出入穴總表 (Entry & Exit Points)</h4>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>經脈 Channel</th>
            <th>出入穴 Entry Point</th>
            <th>出口穴 Exit Point</th>
            <th>氣血交接下一經脈 Next Meridian Handover</th>
          </tr>
        </thead>
        <tbody>
          ${entryExitRows.map(e => `
            <tr>
              <td class="channel-name-cell">${e.ch}</td>
              <td>${formatCell(e.entry)}</td>
              <td>${formatCell(e.exit)}</td>
              <td>${e.next}</td>
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
    const m = txt.match(/^([A-Z0-9]+)s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        4. 八脈交會穴與奇經對應配穴總表 (Master & Coupled Points for Extraordinary Channels)
      </h3>

      <div style="background: #f0f7f4; border: 1px solid #c2e0d3; border-radius: 8px; padding: 1rem; margin-bottom: 1.2rem;">
        <h4 style="color: #164e32; margin: 0 0 0.5rem; font-size: 0.98rem; font-weight: 700;">💡 eLotus & Point Selection 核心知識點與選穴原理：</h4>
        <ul style="margin: 0; padding-left: 1.2rem; color: #2d4a3b; font-size: 0.88rem; line-height: 1.6;">
          <li><strong>八脈交會穴 (Master & Coupled Points):</strong> 奇經八脈與十二正經相通的 8 個特定穴，臨床採「上下相配」法：</li>
          <li><strong>公孫(SP4) + 內關(PC6):</strong> 主治心、胸、胃部疾病（胃痛、噁心、心悸、胸悶、安神）。</li>
          <li><strong>後溪(SI3) + 申脈(BL62):</strong> 主治目內眥、頸項、耳後、肩胛與督脈脊柱痛。</li>
          <li><strong>臨泣(GB41) + 外關(TE5):</strong> 主治目銳眥、耳後、少腹與帶脈偏頭痛、膽經疾患。</li>
          <li><strong>列缺(LU7) + 照海(KI6):</strong> 主治咽喉、胸膈、肺系疾病與陰虛咽乾。</li>
        </ul>
      </div>

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

function renderGroupLuoMatrixTable() {
  const rows = [
    { group: "手三陰組絡 (3 Arm Yin Group Luo)", point: "PC5 間使 (Jianshi)", desc: "統轄手太陰肺經、手少陰心經、手厥陰心包經" },
    { group: "手三陽組絡 (3 Arm Yang Group Luo)", point: "TE8 三陽絡 (Sanyangluo)", desc: "統轄手陽明大腸經、手太陽小腸經、手少陽三焦經" },
    { group: "足三陰組絡 (3 Leg Yin Group Luo)", point: "SP6 三陰交 (Sanyinjiao)", desc: "統轄足太陰脾經、足少陰腎經、足厥陰肝經" },
    { group: "足三陽組絡 (3 Leg Yang Group Luo)", point: "GB39 懸鐘 (Xuanzhong / 絕骨)", desc: "統轄足陽明胃經、足太陽膀胱經、足少陽膽經" },
    { group: "脾之大絡 (Great Luo of Spleen)", point: "SP21 大包 (Dabao)", desc: "總絡全身陰陽諸絡，主治全身疼痛與軟弱無力" },
    { group: "胃之大絡 (Great Luo of Stomach)", point: "ST18 乳根 (Rugen / 虛里)", desc: "貫膈絡肺，宗氣之所出，主治心悸與呼吸喘促" }
  ];

  const formatCell = (txt) => {
    const m = txt.match(/^([A-Z0-9]+)s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        5. 組絡穴與大絡總表 (Group Luo Points & Great Luo Vessels)
      </h3>

      <div style="background: #f0f7f4; border: 1px solid #c2e0d3; border-radius: 8px; padding: 1rem; margin-bottom: 1.2rem;">
        <h4 style="color: #164e32; margin: 0 0 0.5rem; font-size: 0.98rem; font-weight: 700;">💡 eLotus & Point Selection 核心知識點與選穴原理：</h4>
        <ul style="margin: 0; padding-left: 1.2rem; color: #2d4a3b; font-size: 0.88rem; line-height: 1.6;">
          <li><strong>組絡穴 (Group Luo Points):</strong> 一穴同時交會統轄同肢同陰陽屬性的三條經脈。</li>
          <li><strong>手三陰組絡 PC5 (間使):</strong> 一穴兼通肺、心、心包三經，主治心痛、心悸、胃熱嘔吐、精神神志障礙。</li>
          <li><strong>手三陽組絡 TE8 (三陽絡):</strong> 一穴兼通大腸、小腸、三焦三經，主治頭面五官熱疾、耳聾、咽痛、手手臂痛。</li>
          <li><strong>足三陰組絡 SP6 (三陰交):</strong> 一穴兼通脾、肝、腎三經，婦科、男科、消化、生殖與水腫第一要穴。</li>
          <li><strong>足三陽組絡 GB39 (懸鐘/絕骨):</strong> 一穴兼通胃、膀胱、膽三經，主治頸項強痛、下肢痿痺、髓海不足。</li>
          <li><strong>脾之大絡 SP21 (大包):</strong> 總絡全身陰陽諸絡，主治全身疼痛與周身軟弱無力。</li>
        </ul>
      </div>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>組絡種類 Group Luo Category</th>
            <th>交會穴位 Group Luo Point</th>
            <th>統轄經絡與臨床作用 Functions & Scope</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.group}</td>
              <td>${formatCell(r.point)}</td>
              <td>${r.desc}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderHuiAndCommandMatrixTable() {
  const huiRows = [
    { type: "臟會 (Zang Organs)", point: "LR13 章門 (Zhangmen)", note: "五臟精氣之所會，善治五臟積聚與脾虛腹脹" },
    { type: "腑會 (Fu Organs)", point: "CV12 中脘 (Zhongwan)", note: "六腑氣血之所會，善治胃痛、嘔吐與消化不良" },
    { type: "氣會 (Qi)", point: "CV17 膻中 (Danzhong)", note: "宗氣之所聚，善治胸悶、氣短、哮喘與心悸" },
    { type: "血會 (Blood)", point: "BL17 膈俞 (Geshu)", note: "血之所會，善治血虛、血瘀、吐血與貧血" },
    { type: "筋會 (Tendons)", point: "GB34 陽陵泉 (Yanglingquan)", note: "全身筋脈之所會，善治膝痛、筋攣與中風偏癱" },
    { type: "脈會 (Vessels / Pulse)", point: "LU9 太淵 (Taiyuan)", note: "百脈之所會，善治無脈症、脈律不齊與血管病變" },
    { type: "骨會 (Bones)", point: "BL11 大杼 (Dazhu)", note: "骨氣之所會，善治頸椎病、骨質增生與骨痛" },
    { type: "髓會 (Marrow)", point: "GB39 懸鐘 (Xuanzhong / 絕骨)", note: "精髓之所會，善治髓海不足、頸項強痛與癡呆" }
  ];

  const commandRows = [
    { song: "面口合谷收 (Face & Mouth)", point: "LI4 合谷 (Hegu)", region: "頭面五官、牙痛、面癱、鼻塞" },
    { song: "肚腹三里留 (Abdomen & Stomach)", point: "ST36 足三里 (Zusanli)", region: "胃痛、腹脹、消化不良、腸胃疾病" },
    { song: "腰背委中求 (Lumbar & Back)", point: "BL40 委中 (Weizhong)", region: "腰痛、坐骨神經痛、背痛、腿痛" },
    { song: "頭項尋列缺 (Head & Neck)", point: "LU7 列缺 (Lieque)", region: "頭痛、頸項強痛、落枕、偏頭痛" },
    { song: "心胸內關謀 (Chest & Heart)", point: "PC6 內關 (Neiguan)", region: "心悸、胸悶、心痛、嘔吐、失眠" },
    { song: "少腹三陰交 (Lower Abdomen & Gynecological)", point: "SP6 三陰交 (Sanyinjiao)", region: "痛經、月經不調、少腹痛、泌尿生殖疾病" }
  ];

  const formatCell = (txt) => {
    const m = txt.match(/^([A-Z0-9]+)s+(.+)$/);
    if (!m) return txt;
    return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        6. 八會穴與六總穴中英總表 (Eight Hui-Influential & Six Command Points)
      </h3>

      <div style="background: #f0f7f4; border: 1px solid #c2e0d3; border-radius: 8px; padding: 1rem; margin-bottom: 1.2rem;">
        <h4 style="color: #164e32; margin: 0 0 0.5rem; font-size: 0.98rem; font-weight: 700;">💡 eLotus & Point Selection 核心知識點與選穴原理：</h4>
        <ul style="margin: 0; padding-left: 1.2rem; color: #2d4a3b; font-size: 0.88rem; line-height: 1.6;">
          <li><strong>八會穴 (Hui-Influential Points):</strong> 臟腑、氣血、筋脈、骨髓等精氣聚會之 8 特殊穴。器官或組織有病即取該會穴（如骨疾取 BL11、筋疾取 GB34、血疾取 BL17）。</li>
          <li><strong>六總穴 (Six Command Points):</strong> 臨床區域特效穴口訣：面口合谷(LI4)、肚腹三里(ST36)、腰背委中(BL40)、頭項列缺(LU7)、心胸內關(PC6)、少腹三陰交(SP6)。</li>
        </ul>
      </div>
      <h4 style="color: #2b704c; margin: 0.75rem 0 0.4rem; font-size: 1.05rem;">一、八會穴 (Eight Hui-Influential Points)</h4>
      <table class="master-matrix-table" style="margin-bottom: 1.5rem;">
        <thead>
          <tr>
            <th>八會類別 Hui Category</th>
            <th>交會穴位 Hui Point</th>
            <th>主治與臨床特徵 Clinical Indications</th>
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

      <h4 style="color: #2b704c; margin: 0.75rem 0 0.4rem; font-size: 1.05rem;">二、六總穴 (Six Command Points)</h4>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>歌訣歌名 Command Song</th>
            <th>總穴穴位 Command Point</th>
            <th>主治部位 Target Region & Indications</th>
          </tr>
        </thead>
        <tbody>
          ${commandRows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.song}</td>
              <td>${formatCell(r.point)}</td>
              <td>${r.region}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderFourSeaAndGhostPointsMatrixTable() {
  const fourSeaRows = [
    { sea: "髓海 (Sea of Marrow)", points: "GV16 鳳府 (Fengfu) / GV20 百會 (Baihui)", desc: "髓海有餘則輕勁多力，自過其度；髓海不足則腦轉耳鳴，脛痠眩冒，目無所見，懈怠安臥。" },
    { sea: "血海 (Sea of Blood)", points: "BL11 大杼 (Dazhu) / ST37 上巨虛 (Shangjuxu) / ST39 下巨虛 (Xiajuxu)", desc: "血海有餘則常想身大，茫然不知其所疾；血海不足則常想身小，狹狹不知其所病。" },
    { sea: "氣海 (Sea of Qi)", points: "CV17 膻中 (Danzhong) / ST9 人迎 (Renying) / GV14 大椎 (Dazhui) / GV15 啞門 (Yamen)", desc: "氣海有餘則氣滿胸中，悗息面赤；氣海不足則氣少不足以言。" },
    { sea: "水穀之海 (Sea of Nourishment)", points: "ST30 氣衝 (Qichong) / ST36 足三里 (Zusanli)", desc: "水穀之海有餘則腹滿；水穀之海不足則飢不受穀食。" }
  ];

  const ghostRows = [
    { nameEn: "Palace", nameZh: "鬼宮", point: "GV26 人中 (Renzhong)" },
    { nameEn: "Faith", nameZh: "鬼信", point: "LU11 少商 (Shaoshang)" },
    { nameEn: "Fortress", nameZh: "鬼堡", point: "SP1 隱白 (Yinbai)" },
    { nameEn: "Heart", nameZh: "鬼心", point: "PC7 大陵 (Daling)" },
    { nameEn: "Road", nameZh: "鬼路", point: "BL62 申脈 (Shenmai)" },
    { nameEn: "Pillow", nameZh: "鬼枕", point: "GV16 鳳府 (Fengfu)" },
    { nameEn: "Bed", nameZh: "鬼床", point: "ST6 頰車 (Jiache)" },
    { nameEn: "Market", nameZh: "鬼市", point: "CV24 承漿 (Chengjiang)" },
    { nameEn: "Cave", nameZh: "鬼窟", point: "PC8 勞宮 (Laogong)" },
    { nameEn: "Hall", nameZh: "鬼堂", point: "GV23 上星 (Shangxing)" },
    { nameEn: "Store", nameZh: "鬼藏", point: "CV1 會陰 (Huiyin)" },
    { nameEn: "Leg", nameZh: "鬼腿", point: "LI11 曲池 (Quchi)" },
    { nameEn: "Seal", nameZh: "鬼封", point: "Ex-HN10 聚泉 (Juquan)" }
  ];

  const formatCell = (txt) => {
    const parts = txt.split(' / ');
    return parts.map(p => {
      const m = p.match(/^([A-Za-z0-9-]+)s+(.+)$/);
      if (!m) return p;
      return `<a class="matrix-point-link" href="#point/${m[1]}" data-point-code="${m[1]}">${m[1]} ${m[2]}</a>`;
    }).join(' / ');
  };

  return `
    <div class="master-matrix-wrap">
      <h3 style="color: #1f5b3d; margin-bottom: 0.5rem; font-size: 1.15rem; font-weight: 800;">
        7. 四海穴與孫真人十三鬼穴中英總表 (Four Sea Points & Sun Simiao 13 Ghost Points)
      </h3>

      <div style="background: #f0f7f4; border: 1px solid #c2e0d3; border-radius: 8px; padding: 1rem; margin-bottom: 1.2rem;">
        <h4 style="color: #164e32; margin: 0 0 0.5rem; font-size: 0.98rem; font-weight: 700;">💡 eLotus & Point Selection 核心知識點與選穴原理：</h4>
        <ul style="margin: 0; padding-left: 1.2rem; color: #2d4a3b; font-size: 0.88rem; line-height: 1.6;">
          <li><strong>四海穴 (Four Seas - 靈樞·海論):</strong> 人體髓海、氣海、血海、水穀之海，為精氣血津液匯聚之四大總樞紐。</li>
          <li><strong>孫真人十三鬼穴 (Sun Simiao's 13 Ghost Points):</strong> 唐代孫思邈《千金要方》專治狂癲、重度精神神志異常、卒中昏迷之古代特定十三名穴。</li>
        </ul>
      </div>

      <h4 style="color: #2b704c; margin: 0.75rem 0 0.4rem; font-size: 1.05rem;">一、四海穴總表 (Four Sea Points)</h4>
      <p style="margin-bottom: 0.75rem; color: #35473e; line-height: 1.6; font-size: 0.92rem;">
        In nature, there are east, west, north and south, thus the ancients believed the body should also have four points/seas that are pivotal for treating the four most important substances in the body: marrow, blood, qi and nourishment.
      </p>
      <table class="master-matrix-table" style="margin-bottom: 1.5rem;">
        <thead>
          <tr>
            <th>四海名稱 Four Sea Name</th>
            <th>包含穴位 Four Sea Points</th>
            <th>黃帝內經虛實病理與臨床特徵 Pathological & Clinical Features</th>
          </tr>
        </thead>
        <tbody>
          ${fourSeaRows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.sea}</td>
              <td>${formatCell(r.points)}</td>
              <td>${r.desc}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h4 style="color: #2b704c; margin: 0.75rem 0 0.4rem; font-size: 1.05rem;">二、孫真人十三鬼穴總表 (Sun Simiao 13 Ghost Points)</h4>
      <p style="margin-bottom: 0.75rem; color: #35473e; line-height: 1.6; font-size: 0.92rem;">
        Originating from <i>Qian Jin Yao Fang</i> (Thousand Ducat Prescriptions) by Sun Si-Miao in 581-685 A.D., there are a total of 13 Ghost points used to treat psychological, neurological, or shen disturbance problems.
      </p>
      <table class="master-matrix-table">
        <thead>
          <tr>
            <th>Ghost Point Name (English)</th>
            <th>鬼穴古名 Ghost Name (Chinese)</th>
            <th>對應標準穴位 Standard Point</th>
          </tr>
        </thead>
        <tbody>
          ${ghostRows.map(r => `
            <tr>
              <td class="channel-name-cell">${r.nameEn}</td>
              <td><b>${r.nameZh}</b></td>
              <td>${formatCell(r.point)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
