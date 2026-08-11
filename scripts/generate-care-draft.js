#!/usr/bin/env node
/* CARE case-report draft generator v1 (blueprint 6-12m item, 2026-08-11)
 *
 * Reads an app export (v1 array or v2 {cases:[...]} envelope), picks one
 * case, and emits a CARE 2013-structured markdown draft (+ STRICTA 2010 when
 * the case has needling data). Spec/mapping = docs/CARE_READINESS_MAP_v0.md;
 * judgeable-check logic pattern mirrors app.js's computeCareReadiness
 * (~line 6529) but this file does NOT require app.js (browser/DOM globals) —
 * it reads the same raw field shapes documented by normalizeClinicalCase /
 * normalizeSoapNote directly. js/clinical-store.js IS node-requirable
 * (zero DOM deps) so getOutcomeHistory is reused from there rather than
 * reimplemented.
 *
 * Honesty rules (non-negotiable, see task brief):
 *   - every datapoint that exists is rendered from the actual field, verbatim
 *   - every datapoint that is ABSENT renders an explicit
 *     〔缺:<CARE item> — <field to fill>〕 gap marker — never silently omitted
 *   - patientCode appears ONLY in a header HTML comment marked for removal
 *   - birthYear/birthYearMonth render as a coarse age RANGE, never exact year
 *   - publicationConsent != "granted" → prominent ⚠️ block, generator still runs
 *
 * Usage:
 *   node scripts/generate-care-draft.js <cases-export.json> --case <caseId> [--out draft.md] [--lang zh|en|both]
 *   node scripts/generate-care-draft.js --self-test
 */
"use strict";
const fs = require("fs");
const path = require("path");

require(path.join(__dirname, "..", "js", "clinical-store.js"));
const STORE = globalThis.AcuTingClinicalStore;

// ---------------------------------------------------------------------------
// Small closed vocabulary mirrored from app.js's OUTCOME_VERDICTS (~line 56).
// Reproducing a 4-entry UI vocabulary locally is not "fabricating clinical
// data" — it is a fixed label set, same as any other i18n string table.
// ---------------------------------------------------------------------------
const VERDICT_LABELS = {
  improved: { zh: "改善", en: "Improved" },
  no_change: { zh: "無變化", en: "No change" },
  worsened: { zh: "加重", en: "Worsened" },
  lost_followup: { zh: "失訪", en: "Lost to follow-up" }
};

// ---------------------------------------------------------------------------
// Knowledge label resolver — best-effort, NEVER throws. Any bundle that is
// missing/unparseable is silently skipped; resolveLabel() falls back to the
// raw id. This generator must still work on a fresh checkout that has not
// run build-data.js.
// ---------------------------------------------------------------------------
function loadGeneratedGlobalAssignment(relPath) {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
    const jsonText = raw.replace(/^[^=]*=\s*/, "").replace(/;\s*$/, "");
    return JSON.parse(jsonText);
  } catch (e) {
    return null;
  }
}

function buildLabelIndex() {
  const idx = new Map();
  const put = (id, zh, en) => {
    if (id && !idx.has(id)) idx.set(id, { zh: zh || "", en: en || "" });
  };
  const K = loadGeneratedGlobalAssignment(path.join("data", "generated", "knowledge_data.js"));
  if (K) {
    const arr = (v) => (Array.isArray(v) ? v : v && Array.isArray(v.records) ? v.records : []);
    for (const r of arr(K.patternLibrary)) put(r.id, r.name_zh, r.name_en);
    for (const r of arr(K.conditions)) put(r.id, r.name_zh, r.name_en);
    for (const r of (K.conditions && K.conditions.eastern_diseases) || []) put(r.id, r.name_zh, r.name_en);
    for (const r of arr(K.formulas)) put(r.id, r.name_zh, r.name_en);
    for (const r of arr(K.symptoms)) put(r.id, r.name_zh, r.name_en);
    for (const r of arr(K.medications)) put(r.id, "", r.generic_name_en);
    for (const r of arr(K.pharmDrugs)) put(r.id, r.name_zh, r.name_en);
    for (const r of arr(K.supplementRecords)) put(r.id, r.name_zh, r.name_en);
    for (const r of arr(K.exposureVocabulary)) put(r.id, r.name_zh, r.name_en);
    for (const r of arr(K.adverseEventVocabulary)) put(r.id, r.name_zh, r.name_en);
    for (const r of arr(K.modalityVocabulary)) put(r.id, r.name_zh, r.name_en);
    for (const r of arr(K.lifestyleFactorVocabulary)) put(r.id, r.name_zh, r.name_en);
  }
  const points = loadGeneratedGlobalAssignment(path.join("data", "generated", "points_361.js"));
  if (Array.isArray(points)) for (const p of points) put(p.code, p.chinese, p.english);
  return idx;
}

function loadOutcomeMetricDefs() {
  const m = new Map();
  try {
    const raw = fs.readFileSync(path.join(__dirname, "..", "data", "clinical_cases", "outcome_metrics.json"), "utf8");
    const j = JSON.parse(raw);
    for (const r of j.records || []) m.set(r.id, r);
  } catch (e) {
    /* absent bundle -> empty map, resolveMetricLabel falls back to raw id */
  }
  return m;
}

// ---------------------------------------------------------------------------
// Field-shape helpers (mirrors normalizeClinicalCase / normalizeSoapNote
// truthiness rules from app.js ~5108-5476, without requiring app.js itself).
// ---------------------------------------------------------------------------
function has(v) {
  if (Array.isArray(v)) return v.length > 0;
  if (v === 0) return true;
  return !!v;
}

function gap(careItem, field) {
  return `〔缺:${careItem} — ${field}〕`;
}

function ageRangeFromBirth(birthYearMonth, birthYear, refDate) {
  let y = null;
  if (birthYearMonth) {
    const parsed = parseInt(String(birthYearMonth).slice(0, 4), 10);
    if (Number.isFinite(parsed)) y = parsed;
  } else if (birthYear === 0 || birthYear) {
    const parsed = Number(birthYear);
    if (Number.isFinite(parsed)) y = parsed;
  }
  if (!y) return "";
  const age = refDate.getFullYear() - y;
  if (!Number.isFinite(age) || age < 0 || age > 130) return "";
  const lo = Math.floor(age / 10) * 10;
  return `${lo}-${lo + 9}歲`;
}

function loadCasesFile(file) {
  const raw = fs.readFileSync(file, "utf8");
  let parsed = JSON.parse(raw);
  if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.cases)) parsed = parsed.cases; // v2 envelope
  if (!Array.isArray(parsed)) throw new Error(`${file}: not a v1 array nor a v2 envelope with .cases`);
  return parsed;
}

function findCase(cases, caseId) {
  const found = cases.find((c) => c.id === caseId);
  if (!found) {
    const ids = cases.map((c) => c.id).join(", ");
    throw new Error(`case "${caseId}" not found. Available ids: ${ids || "(none)"}`);
  }
  return found;
}

// Chronological timeline (CARE item 7): visits + agentExposures/
// environmentalExposures events[], sorted by date. Event date prefers its own
// effectiveApprox, falls back to the visitDate of the visitId it references.
function buildTimeline(item, resolveLabel) {
  const resolve = resolveLabel || ((id) => id || "");
  const notes = item.soapNotes || [];
  const visitDateById = new Map(notes.map((n) => [n.id, n.visitDate || ""]));
  const events = [];
  for (const n of notes) {
    if (has(n.visitDate)) {
      events.push({
        date: n.visitDate,
        label: `就診第${n.visitNumber || "?"}次 Visit`,
        detail: [n.assessment, n.plan].filter(has).join(" / ") || n.subjective || ""
      });
    }
  }
  for (const [kind, rows] of [["agent", item.agentExposures || []], ["environmental", item.environmentalExposures || []]]) {
    for (const exp of rows) {
      const name = exp.nameText || resolve(exp.agentId) || resolve(exp.exposureId) || "(未命名暴露)";
      for (const ev of exp.events || []) {
        const d = ev.effectiveApprox || visitDateById.get(ev.visitId) || "";
        const detail = ev.note || ev.doseText || ev.certainty || "";
        events.push({ date: d, label: `${kind === "agent" ? "用藥/補充品" : "環境暴露"}事件: ${name} — ${ev.eventType}`, detail });
      }
    }
  }
  for (const n of notes) {
    for (const ae of n.adverseEvents || []) {
      events.push({ date: n.visitDate || "", label: `不良事件: ${ae.nameText || resolve(ae.eventId) || "(未命名)"}`, detail: [ae.severity, ae.onsetText].filter(has).join(" / ") });
    }
  }
  events.sort((a, b) => String(a.date || "9999-99-99").localeCompare(String(b.date || "9999-99-99")));
  return events;
}

// ---------------------------------------------------------------------------
// Draft generator
// ---------------------------------------------------------------------------
function generateDraft(item, opts) {
  const lang = opts.lang || "both";
  const labelIdx = opts.labelIdx || new Map();
  const metricDefs = opts.metricDefs || new Map();
  const refDate = opts.refDate || new Date();

  const t = (zh, en) => (lang === "zh" ? zh : lang === "en" ? en : `${zh} / ${en}`);
  const resolveLabel = (id) => {
    if (!id) return "";
    const hit = labelIdx.get(id);
    if (!hit) return id;
    if (hit.zh && hit.en) return `${hit.zh}(${hit.en})`;
    return hit.zh || hit.en || id;
  };
  const resolveList = (ids) => (ids || []).filter(has).map(resolveLabel).join("、");

  const notes = (item.soapNotes || [])
    .slice()
    .sort((a, b) => String(a.visitDate || "9999-99-99").localeCompare(String(b.visitDate || "9999-99-99")) || Number(a.visitNumber || 0) - Number(b.visitNumber || 0));

  const lines = [];
  const push = (s = "") => lines.push(s);

  // ---- de-identification header comment (item 6 of the honesty rules) ----
  push(`<!-- patientCode: ${item.patientCode || "(none)"} — 本行為身分索引,對外使用前必須刪除 -->`);
  const dxTitle = [resolveList(item.westernConditions), resolveList(item.easternDiseases)].filter(has).join(" / ");
  push(`# ${item.caseTitle || "(未命名病例)"} — CARE Case Report Draft 個案報告草稿${dxTitle ? " — " + dxTitle : ""}`);
  push("");
  push(
    `_本草稿由 \`scripts/generate-care-draft.js\` 產生 · 產生時間 ${refDate.toISOString().slice(0, 10)} · ` +
      `病人代碼僅存於上方 HTML 註解,正文一律稱「本案病人」。臨床敘述文字(主訴/病史/評估等)照錄病歷原文,` +
      `若含姓名或其他可識別資訊,投稿前需人工核閱刪除。_`
  );
  push("");

  // ---- consent gate (requirement #4) ----
  if (item.publicationConsent !== "granted") {
    const status = item.publicationConsent ? item.publicationConsent : "未詢問";
    push(`> ⚠️ **發表同意:${status} — 本草稿僅供個人整理,取得同意前不得投稿**`);
    push("");
  }

  // ---- CARE 1 Title ----
  push(`## ${t("CARE 1 · 標題 Title", "CARE 1 · Title")}`);
  push("已於上方標題註明「Case Report」,符合 CARE 第 1 項。");
  push("");

  // ---- CARE 2 Keywords ----
  push(`## ${t("CARE 2 · 關鍵詞", "CARE 2 · Keywords")}`);
  {
    const patternIds = new Set();
    for (const n of notes) for (const s of n.tcmPatternSelections || []) if (has(s.patternId)) patternIds.add(s.patternId);
    for (const p of item.tcmPatterns || []) if (has(p)) patternIds.add(p);
    const kw = [...(item.westernConditions || []), ...(item.easternDiseases || []), ...patternIds].filter(has);
    push(kw.length ? kw.map(resolveLabel).join("、") : gap("2 Key words", "case.westernConditions / easternDiseases / soapNotes[].tcmPatternSelections"));
  }
  push("");

  // ---- Abstract skeleton (3a/3b/3c) ----
  push(`## ${t("摘要 Abstract", "Abstract")}`);
  push(`### ${t("3a 前言(摘要內)", "3a Introduction (within abstract)")}`);
  push(gap("3a Abstract–introduction", "對應 cond/tdis 卡片文獻背景(本產生器未讀取卡片內容,需人工撰寫)"));
  push(`### ${t("3b 病例陳述", "3b Case presentation")}`);
  {
    const parts = [];
    if (has(item.chiefComplaint)) parts.push(item.chiefComplaint);
    const dxLabel = [resolveList(item.westernConditions), resolveList(item.easternDiseases)].filter(has).join("；");
    if (dxLabel) parts.push(`主要診斷:${dxLabel}`);
    push(parts.length ? parts.join(" ") : gap("3b Abstract–case presentation", "case.chiefComplaint"));
  }
  push(`### ${t("3c 結論", "3c Conclusion")}`);
  push(gap("3c Abstract–conclusion", "人工撰寫,總結療效與意義"));
  push("");

  // ---- CARE 4 Introduction ----
  push(`## ${t("4 · 前言 Introduction", "4 · Introduction")}`);
  push(gap("4 Introduction", "對應 cond/tdis 卡片之 summary/etiology 背景文獻(本產生器未讀取卡片內容,需人工撰寫)"));
  push("");

  // ---- CARE 5 Patient information ----
  push(`## ${t("5 · 病人資訊 Patient information", "5 · Patient information")}`);
  push(`### 5a ${t("基本資料", "Demographics")}`);
  {
    const ageRange = ageRangeFromBirth(item.birthYearMonth, item.birthYear, refDate);
    push(`- ${t("性別 sex", "sex")}: ${has(item.sex) ? item.sex : gap("5a Demographics", "case.sex")}`);
    push(`- ${t("年齡層 age range", "age range")}: ${ageRange || gap("5a Demographics", "case.birthYearMonth / case.birthYear")}`);
    push(`- ${t("職業 occupation", "occupation")}: ${has(item.occupation) ? item.occupation : gap("5a Demographics", "case.occupation")}`);
    if (has(item.genderIdentity)) push(`- ${t("性別認同 gender identity", "gender identity")}: ${item.genderIdentity}`);
    if (has(item.raceEthnicity)) push(`- ${t("種族/族裔 race/ethnicity", "race/ethnicity")}: ${item.raceEthnicity.join("、")}${has(item.raceEthnicityDetail) ? `(${item.raceEthnicityDetail})` : ""}`);
  }
  push(`### 5b ${t("主訴", "Main symptoms")}`);
  push(has(item.chiefComplaint) ? item.chiefComplaint : gap("5b Main symptoms", "case.chiefComplaint"));
  push(`### 5c ${t("病史/家族史/心理社會史", "Medical/family/psychosocial history")}`);
  {
    const rows = [
      [t("既往史", "past history"), item.pastHistory, "case.pastHistory"],
      [t("月經/產科史", "menstrual/ob history"), item.menstrualObHistory, "case.menstrualObHistory"],
      [t("生活型態", "lifestyle"), item.lifestyle, "case.lifestyle"],
      [t("目前用藥", "current meds"), item.currentMeds, "case.currentMeds"]
    ];
    for (const [label, val, field] of rows) push(`- ${label}: ${has(val) ? val : gap("5c Medical/family/psychosocial history", field)}`);
    if (has(item.agentExposures)) push(`- ${t("暴露/用藥時序", "exposures ledger")}: ${item.agentExposures.map((e) => `${e.nameText || resolveLabel(e.agentId)}(${e.status || "?"})`).join("、")}`);
  }
  push(`### 5d ${t("過往治療及成效", "Relevant past interventions + outcomes")}`);
  {
    const prev = [];
    if (has(item.previousTreatment)) prev.push(item.previousTreatment.join("、"));
    if (has(item.previousTreatmentNotes)) prev.push(item.previousTreatmentNotes);
    push(prev.length ? prev.join(" — ") : gap("5d Relevant past interventions + outcomes", "case.previousTreatment / case.previousTreatmentNotes"));
  }
  push("");

  // ---- CARE 6 Clinical findings ----
  push(`## 6 · ${t("臨床所見", "Clinical findings")}`);
  {
    const withObj = notes.filter((n) => has(n.objective));
    push(withObj.length ? withObj.map((n) => `- ${n.visitDate || n.id}(第${n.visitNumber || "?"}診): ${n.objective}`).join("\n") : gap("6 Clinical findings", "soapNotes[].objective"));
  }
  push("");

  // ---- CARE 7 Timeline ----
  push(`## 7 · ${t("時間表 Timeline", "Timeline")}`);
  {
    const events = buildTimeline(item, resolveLabel);
    push(
      events.length
        ? events.map((e) => `- ${e.date || "(日期不詳)"} — ${e.label}${e.detail ? "：" + e.detail : ""}`).join("\n")
        : gap("7 Timeline", "soapNotes[].visitDate 及 agentExposures/environmentalExposures[].events[]")
    );
  }
  push("");

  // ---- CARE 8 Diagnostic assessment ----
  push(`## 8 · ${t("診斷評估 Diagnostic assessment", "Diagnostic assessment")}`);
  push(`### 8a ${t("評估方法", "Methods")}`);
  {
    const withAssess = notes.filter((n) => has(n.assessment));
    push(withAssess.length ? withAssess.map((n) => `- ${n.visitDate || n.id}: ${n.assessment}`).join("\n") : gap("8a Diagnostic assessment–methods", "soapNotes[].objective / soapNotes[].assessment"));
  }
  push(`### 8b ${t("鑑別診斷思路", "Diagnostic challenges")}`);
  {
    const parts = [];
    for (const n of notes) {
      if (has(n.differentialConsidered)) parts.push(`${n.visitDate || n.id}: ${n.differentialConsidered}`);
      if (has(n.patternDifferentials)) {
        parts.push(`${n.visitDate || n.id} 證型鑑別: ` + n.patternDifferentials.map((d) => `${resolveLabel(d.patternId)}${d.ruledOut ? "(排除)" : ""}${has(d.note) ? " — " + d.note : ""}`).join("；"));
      }
      if (has(n.referralOrSupervisorQuestion)) parts.push(`${n.visitDate || n.id} 督導提問: ${n.referralOrSupervisorQuestion}`);
    }
    push(parts.length ? parts.map((p) => `- ${p}`).join("\n") : gap("8b Diagnostic challenges", "soapNotes[].differentialConsidered / patternDifferentials / referralOrSupervisorQuestion"));
  }
  push(`### 8c ${t("診斷(含鑑別)", "Diagnosis")}`);
  {
    const dx = [];
    if (has(item.westernConditions)) dx.push(`${t("西醫", "Western")}: ${resolveList(item.westernConditions)}`);
    if (has(item.easternDiseases)) dx.push(`${t("中醫病名", "Eastern disease")}: ${resolveList(item.easternDiseases)}`);
    for (const n of notes.filter((n) => has(n.tcmPatternSelections))) {
      dx.push(`${n.visitDate || n.id} ${t("證型", "pattern")}: ` + n.tcmPatternSelections.map((s) => `${resolveLabel(s.patternId)}${s.isPrimary ? "(主證)" : s.role === "secondary" ? "(次證)" : ""}`).join("、"));
    }
    push(dx.length ? dx.map((d) => `- ${d}`).join("\n") : gap("8c Diagnosis", "case.westernConditions / case.easternDiseases / soapNotes[].tcmPatternSelections"));
  }
  push(`### 8d ${t("預後特徵", "Prognosis characteristics")}`);
  push(gap("8d Prognosis characteristics", "系統無對應欄位,如有討論需人工於 assessment 散文補充"));
  push("");

  // ---- CARE 9 Interventions ----
  push(`## 9 · ${t("治療介入 Interventions", "Interventions")}`);
  push(`### 9a ${t("治療內容", "Types")}`);
  {
    const points = new Set(), formulas = new Set(), agentTypes = new Set();
    for (const n of notes) {
      for (const p of n.acupointLinks || []) if (has(p)) points.add(p);
      for (const f of n.formulaLinks || []) if (has(f)) formulas.add(f);
    }
    for (const e of item.agentExposures || []) if (has(e.agentType)) agentTypes.add(e.agentType);
    const parts = [];
    if (points.size) parts.push(`${t("穴位 acupoints", "acupoints")}: ${[...points].map(resolveLabel).join("、")}`);
    if (formulas.size) parts.push(`${t("方劑 formulas", "formulas")}: ${[...formulas].map(resolveLabel).join("、")}`);
    if (agentTypes.size) parts.push(`${t("其他暴露類型", "other exposure types")}: ${[...agentTypes].join("、")}`);
    push(parts.length ? parts.map((p) => `- ${p}`).join("\n") : gap("9a Intervention–types", "soapNotes[].acupointLinks / soapNotes[].formulaLinks"));
  }
  push(`### 9b ${t("方藥細節(劑量/劑型)", "Administration (dose/form)")}`);
  {
    const parts = [];
    for (const n of notes) if (has(n.formulaHerbs)) parts.push(`${n.visitDate || n.id}: ${n.formulaHerbs}`);
    for (const e of item.agentExposures || []) if (has(e.doseText)) parts.push(`${e.nameText || resolveLabel(e.agentId)}: ${e.doseText}${has(e.frequencyText) ? " " + e.frequencyText : ""}`);
    push(parts.length ? parts.map((p) => `- ${p}`).join("\n") : gap("9b Intervention–administration", "soapNotes[].formulaHerbs / agentExposures[].doseText"));
  }
  push(`### 9c ${t("治療調整軌跡(換方及理由)", "Changes (with reasons)")}`);
  {
    const changeLines = [];
    for (const e of [...(item.agentExposures || []), ...(item.environmentalExposures || [])]) {
      const evs = e.events || [];
      if (evs.length > 1) {
        const name = e.nameText || resolveLabel(e.agentId || e.exposureId);
        for (const ev of evs) changeLines.push(`${name} — ${ev.eventType}${has(ev.effectiveApprox) ? " @" + ev.effectiveApprox : ""}${has(ev.note) ? "：" + ev.note : ""}`);
      }
    }
    push(changeLines.length ? changeLines.map((l) => `- ${l}`).join("\n") : gap("9c Intervention–changes", "agentExposures[]/environmentalExposures[].events[] (length > 1)"));
  }
  push("");

  // ---- CARE 10 Follow-up / outcomes ----
  push(`## 10 · ${t("追蹤與成效 Follow-up / outcomes", "Follow-up / outcomes")}`);
  push(`### 10a ${t("結構化成效指標", "Clinician/patient-assessed outcomes")}`);
  {
    const metricIds = new Set();
    for (const n of notes) for (const m of n.outcomeMetrics || []) if (has(m.metricId)) metricIds.add(m.metricId);
    if (metricIds.size) {
      push(`| ${t("指標", "Metric")} | ${t("首次", "First")} | ${t("末次", "Last")} | ${t("變化", "Delta")} | ${t("判讀", "Direction")} |`);
      push("|---|---|---|---|---|");
      for (const mid of metricIds) {
        const hist = STORE.getOutcomeHistory(item, mid);
        if (!hist.length) continue;
        const def = metricDefs.get(mid);
        const label = def ? t(def.label_zh || mid, def.label_en || mid) : mid;
        const first = hist[0], last = hist[hist.length - 1];
        const delta = last.valueNumber - first.valueNumber;
        let dirNote = "";
        if (def && def.direction_good === "decrease") dirNote = delta < 0 ? t("朝向改善", "toward improvement") : delta > 0 ? t("朝向惡化", "toward worsening") : t("持平", "unchanged");
        else if (def && def.direction_good === "increase") dirNote = delta > 0 ? t("朝向改善", "toward improvement") : delta < 0 ? t("朝向惡化", "toward worsening") : t("持平", "unchanged");
        push(`| ${label} | ${first.valueNumber}(${first.visitDate || first.visitNumber}) | ${last.valueNumber}(${last.visitDate || last.visitNumber}) | ${delta > 0 ? "+" : ""}${delta} | ${dirNote} |`);
      }
    } else {
      push(gap("10a Follow-up–clinician/patient assessed outcomes", "soapNotes[].outcomeMetrics[]"));
    }
    const verdicts = notes.filter((n) => has(n.outcomeVerdict));
    push(
      verdicts.length
        ? verdicts.map((n) => `- ${n.visitDate || n.id} ${t("療效判定", "verdict")}: ${VERDICT_LABELS[n.outcomeVerdict] ? t(VERDICT_LABELS[n.outcomeVerdict].zh, VERDICT_LABELS[n.outcomeVerdict].en) : n.outcomeVerdict}`).join("\n")
        : gap("10a 療效判定", "soapNotes[].outcomeVerdict")
    );
  }
  push(`### 10b ${t("重要追蹤診斷檢查", "Important follow-up diagnostic evaluations")}`);
  push(gap("10b Important follow-up diagnostic evaluations", "系統無專屬欄位;複查/影像/檢驗結果如有需人工補充(可能已含於 6/8a 客觀所見)"));
  push(`### 10c ${t("遵囑與耐受性", "Intervention adherence & tolerability")}`);
  {
    const parts = [];
    const aeCount = notes.reduce((s, n) => s + (n.adverseEvents || []).length, 0);
    if (aeCount) parts.push(`${t("不良事件共", "adverse events total")} ${aeCount} ${t("筆(詳見 10d)", "(see 10d)")}`);
    for (const e of item.agentExposures || []) if (has(e.adherenceNote)) parts.push(`${e.nameText || resolveLabel(e.agentId)}: ${e.adherenceNote}`);
    push(parts.length ? parts.map((p) => `- ${p}`).join("\n") : gap("10c Intervention adherence & tolerability", "soapNotes[].adverseEvents[] / agentExposures[].adherenceNote"));
  }
  push(`### 10d ${t("不良事件及意外事件", "Adverse & unanticipated events")}`);
  {
    const rows = [];
    for (const n of notes) for (const ae of n.adverseEvents || []) {
      rows.push(`${n.visitDate || n.id}: ${resolveLabel(ae.eventId) || ae.nameText || "(未命名)"} — ${t("嚴重度", "severity")} ${ae.severity || "?"}, ${t("發生", "onset")} ${ae.onsetText || "?"}, ${t("回報", "status")} ${ae.status || "?"}, ${t("結果", "resolution")} ${ae.resolutionStatus || "?"}${has(ae.notes) ? "；" + ae.notes : ""}`);
    }
    push(rows.length ? rows.map((r) => `- ${r}`).join("\n") : gap("10d Adverse & unanticipated events", "soapNotes[].adverseEvents[]"));
  }
  push("");

  // ---- CARE 11 Discussion skeleton ----
  push(`## 11 · ${t("討論 Discussion", "Discussion")}`);
  push(`### 11a ${t("優點與限制", "Strengths & limitations")}`);
  push(gap("11a Discussion–strengths & limitations", "人工撰寫"));
  push(`### 11b ${t("相關文獻", "Relevant literature")}`);
  push(gap("11b Discussion–relevant literature", "對應卡片 sources(本產生器未讀取卡片內容,需人工撰寫)"));
  push(`### 11c ${t("結論理據", "Rationale for conclusions")}`);
  {
    const refl = notes.filter((n) => has(n.reflection));
    push(refl.length ? refl.map((n) => `- ${n.visitDate || n.id}: ${n.reflection}`).join("\n") : gap("11c Rationale for conclusions", "soapNotes[].reflection"));
  }
  push(`### 11d ${t("主要心得", "Main take-away lessons")}`);
  {
    const parts = [];
    for (const n of notes) {
      if (has(n.reflection)) parts.push(n.reflection);
      if (has(n.ifIneffectivePlan)) parts.push(`${t("若無效備案", "if ineffective")}: ${n.ifIneffectivePlan}`);
    }
    push(parts.length ? parts.map((p) => `- ${p}`).join("\n") : gap("11d Main take-away lessons", "soapNotes[].reflection / soapNotes[].ifIneffectivePlan"));
  }
  push("");

  // ---- CARE 12 Patient perspective ----
  push(`## 12 · ${t("病人視角 Patient perspective", "Patient perspective")}`);
  {
    const pp = notes.filter((n) => has(n.patientPerspective));
    push(pp.length ? pp.map((n) => `- ${n.visitDate || n.id}: 「${n.patientPerspective}」`).join("\n") : gap("12 Patient perspective", "soapNotes[].patientPerspective"));
  }
  push("");

  // ---- CARE 13 Informed consent ----
  push(`## 13 · ${t("知情同意 Informed consent", "Informed consent")}`);
  {
    const status = item.publicationConsent || "";
    const label = status === "granted" ? t("已同意", "granted") : status === "declined" ? t("已拒絕", "declined") : status === "pending" ? t("詢問中", "pending") : t("未詢問", "not asked");
    push(`- ${t("發表同意狀態", "publication consent status")}: ${label}${has(item.publicationConsentDate) ? `(${item.publicationConsentDate})` : ""}`);
    if (!status) push(gap("13 Informed consent", "case.publicationConsent"));
  }
  push("");

  // ---- STRICTA 2010 — only if any visit has needling data ----
  const needlingNotes = notes.filter(
    (n) => has(n.acupointLinks) || has(n.pointsUsed) || has(n.needleCount) || has(n.needleDepthText) || has(n.deqiResponse) || has(n.needleStimulation) || has(n.retentionMinutes) || has(n.needleTypeText)
  );
  if (needlingNotes.length) {
    push(`## ${t("STRICTA 2010 針刺報告項目", "STRICTA 2010")}`);
    push(`### 1a ${t("針刺流派/理據", "Style of acupuncture / rationale")}`);
    push(gap("1a 針刺流派/理據", "全案固定敘述(需人工撰寫)+ soapNotes[].assessment"));
    push(`### 1b ${t("治療變動理由", "Reasons for treatment variation")}`);
    {
      const parts = notes.filter((n) => has(n.plan)).map((n) => `${n.visitDate || n.id}: ${n.plan}`);
      push(parts.length ? parts.map((p) => `- ${p}`).join("\n") : gap("1b 治療變動理由", "soapNotes[].plan"));
    }
    push(`### 2 ${t("每次針刺細節", "Needling details per visit")}`);
    push(`| ${t("就診", "Visit")} | 2a ${t("進針數", "count")} | 2b ${t("穴位", "points")} | 2c ${t("深度", "depth")} | 2d ${t("得氣", "de qi")} | 2e ${t("刺激", "stim")} | 2f ${t("留針(分)", "retention (min)")} | 2g ${t("針具", "needle type")} |`);
    push("|---|---|---|---|---|---|---|---|");
    for (const n of needlingNotes) {
      const pts = has(n.acupointLinks) ? n.acupointLinks.map(resolveLabel).join("、") : has(n.pointsUsed) ? n.pointsUsed : gap("2b", "acupointLinks/pointsUsed");
      push(
        `| ${n.visitDate || n.id} | ${has(n.needleCount) ? n.needleCount : gap("2a", "needleCount")} | ${pts} | ${has(n.needleDepthText) ? n.needleDepthText : gap("2c", "needleDepthText")} | ${
          has(n.deqiResponse) ? n.deqiResponse : gap("2d", "deqiResponse")
        } | ${has(n.needleStimulation) ? n.needleStimulation : gap("2e", "needleStimulation")} | ${has(n.retentionMinutes) ? n.retentionMinutes : gap("2f", "retentionMinutes")} | ${
          has(n.needleTypeText) ? n.needleTypeText : gap("2g", "needleTypeText")
        } |`
      );
    }
    push(`### 3a ${t("療程次數/頻率", "Number/frequency of sessions")}`);
    {
      const dated = needlingNotes.filter((n) => has(n.visitDate)).map((n) => n.visitDate).sort();
      const span = dated.length >= 2 ? `${dated[0]} → ${dated[dated.length - 1]}` : dated[0] || "";
      push(`${t("共", "total")} ${needlingNotes.length} ${t("次針刺就診", "needling visits")}${span ? t(`,期間 ${span}`, `, span ${span}`) : ""}。`);
    }
    push(`### 4a ${t("合併治療", "Co-interventions")}`);
    {
      const formulas = new Set();
      for (const n of notes) for (const f of n.formulaLinks || []) if (has(f)) formulas.add(f);
      const agents = (item.agentExposures || []).map((e) => e.nameText || resolveLabel(e.agentId)).filter(has);
      const parts = [];
      if (formulas.size) parts.push(`${t("方劑", "formulas")}: ${[...formulas].map(resolveLabel).join("、")}`);
      if (agents.length) parts.push(`${t("藥物/補充品", "drugs/supplements")}: ${agents.join("、")}`);
      push(parts.length ? parts.join("；") : gap("4a 合併治療", "soapNotes[].formulaLinks / case.agentExposures"));
    }
    push(`### 5 ${t("治療者背景", "Practitioner background")}`);
    push(gap("5 治療者背景", "單一治療者情境,可全域設定;本產生器不讀取"));
    push(`### 6 ${t("對照/比較", "Control or comparison")}`);
    push(t("個案報告不適用。", "Not applicable for a case report."));
    push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--case") args.case = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--lang") args.lang = argv[++i];
    else if (a === "--self-test") args.selfTest = true;
    else args._.push(a);
  }
  return args;
}

function assert(cond, msg) {
  if (!cond) throw new Error("SELF-TEST FAIL: " + msg);
}

function runSelfTest() {
  console.log("=== generate-care-draft.js self-test ===");
  const labelIdx = buildLabelIndex();
  const metricDefs = loadOutcomeMetricDefs();

  const fixtureFile = path.join(__dirname, "..", "data", "clinical_cases", "sample_export_fixture.json");
  const cases = loadCasesFile(fixtureFile);
  assert(cases.length > 0, "fixture has no cases");
  const item = cases[0];
  const draft = generateDraft(item, { lang: "both", labelIdx, metricDefs, refDate: new Date("2026-08-11") });

  const CARE_HEADERS = ["CARE 1", "CARE 2", "摘要 Abstract", "4 · ", "5 · ", "6 · ", "7 · ", "8 · ", "9 · ", "10 · ", "11 · ", "12 · ", "13 · "];
  for (const h of CARE_HEADERS) assert(draft.includes(h), `missing CARE A-section header containing "${h}"`);
  console.log(`PASS: all ${CARE_HEADERS.length} CARE A-section headers present`);

  assert(draft.includes("⚠️") && draft.includes("發表同意"), "consent warning missing for non-granted case");
  console.log("PASS: consent warning renders for non-granted publicationConsent");

  const gapCount = (draft.match(/〔缺:/g) || []).length;
  assert(gapCount > 0, "expected gap markers > 0 for the sparse fixture case");
  console.log(`PASS: gap markers present (count=${gapCount})`);

  const bodyLines = draft.split("\n");
  assert(bodyLines[0].includes("patientCode"), "header HTML comment missing");
  const bodyOnly = bodyLines.slice(1).join("\n");
  assert(!item.patientCode || !bodyOnly.includes(item.patientCode), "patientCode leaked into draft body outside the header comment");
  console.log("PASS: patientCode confined to header comment only");

  assert(!draft.includes("STRICTA"), "fixture case has no needling data — STRICTA section should be absent");
  console.log("PASS: STRICTA section absent for the fixture case (no needling data)");

  // Synthetic needling case — inline only, never written to data/. Exercises
  // the other half of "STRICTA presence follows needling data" that the
  // fixture (deliberately needling-free) cannot cover on its own.
  const needlingCase = {
    id: "case.selftest_needling",
    patientCode: "SELFTEST-ONLY-NOT-REAL",
    caseTitle: "Self-test needling case",
    publicationConsent: "granted",
    soapNotes: [
      {
        id: "soap.st1",
        visitDate: "2026-01-01",
        visitNumber: 1,
        acupointLinks: ["LI4", "ST36"],
        needleCount: 6,
        needleDepthText: "0.5-1 cun",
        deqiResponse: "obtained",
        needleStimulation: "manual",
        retentionMinutes: 20,
        needleTypeText: "0.25x40mm"
      }
    ]
  };
  const draft2 = generateDraft(needlingCase, { lang: "both", labelIdx, metricDefs, refDate: new Date("2026-08-11") });
  assert(draft2.includes("STRICTA"), "synthetic needling case should render the STRICTA section");
  console.log("PASS: STRICTA section present when needling data exists (synthetic case)");

  console.log("=== ALL SELF-TESTS PASSED ===");
}

function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  if (args.selfTest) {
    runSelfTest();
    return;
  }
  const file = args._[0];
  if (!file || !args.case) {
    console.log("usage: node scripts/generate-care-draft.js <cases-export.json> --case <caseId> [--out draft.md] [--lang zh|en|both]");
    console.log("       node scripts/generate-care-draft.js --self-test");
    process.exit(2);
  }
  const lang = args.lang || "both";
  if (!["zh", "en", "both"].includes(lang)) {
    console.error(`invalid --lang "${lang}" (must be zh|en|both)`);
    process.exit(2);
  }
  let cases;
  try {
    cases = loadCasesFile(file);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  let item;
  try {
    item = findCase(cases, args.case);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  const labelIdx = buildLabelIndex();
  const metricDefs = loadOutcomeMetricDefs();
  const draft = generateDraft(item, { lang, labelIdx, metricDefs, refDate: new Date() });
  if (args.out) {
    fs.writeFileSync(args.out, draft);
    console.log(`draft written: ${args.out}`);
  } else {
    console.log(draft);
  }
}

if (require.main === module) main();

module.exports = { generateDraft, loadCasesFile, findCase, buildLabelIndex, loadOutcomeMetricDefs, ageRangeFromBirth, buildTimeline };
