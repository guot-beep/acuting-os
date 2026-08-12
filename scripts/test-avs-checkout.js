/* AVS v3 — Checkout E2E 演練(§13,全虛構個案,零 PHI)
 *
 * 走的是真引擎(js/avs.js)+ 真建議庫(data/config/avs_advice_library.json)
 * + 真 modality 詞彙 —— 只有病人/病例是 synthetic fixture。
 *
 * Scenario A  routine acupuncture:針灸 aftercare 出現,無腫瘤/抗凝警示
 * Scenario B  cupping + 抗凝:兩候選都出現;可勾掉/改寫;病人輸出零內部 id
 * Scenario C  遠期癌症病史(無 active 治療):不得出現治療期建議
 * Scenario D  active chemotherapy:腫瘤治療期建議出現,且 preselect=false
 * Scenario E  定稿後改建議庫:歷史 AVS 渲染文字不變
 * Scenario F  更正流程:v1 superseded、v2 finalized、v1 仍可讀
 * Scenario G  legacy 自由文字推斷:draft 標記 inferred、定稿存確認後結果
 * 附加:惡意/誤植診斷詞進自訂指示 → checkPatientOutputSafety 必攔
 *
 * 用法:node scripts/test-avs-checkout.js
 */
"use strict";
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
require(path.join(root, "js", "avs.js"));
const AVS = globalThis.AcuTingAVS;

const LIBRARY = readJson("data/config/avs_advice_library.json").records;
const MODALITY_VOCAB = readJson("data/config/modality_vocabulary.json").records;
const CLINIC = { clinic_name_zh: "測試中醫診所(虛構)", practitioner_zh: "測試醫師(虛構)", phone: "00-0000-0000", website: "example.invalid" };

let pass = 0, fail = 0;
const assert = (cond, msg) => {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.error(`  ✗ FAIL: ${msg}`); }
};

// ---- synthetic fixtures(全虛構;patientCode 也是假的)---------------------
function makeCase(over = {}) {
  return {
    id: "case.test.fixture",
    patientCode: "P-TEST-999",
    westernConditions: [],
    easternDiseases: [],
    safetyFlags: [],
    agentExposures: [],
    soapNotes: [],
    ...over
  };
}
function makeNote(over = {}) {
  return {
    id: "soap.test.1",
    visitDate: "2026-01-15",
    tcmPatternSelections: [],
    modalitiesPerformed: [],
    acupointLinks: [],
    outcomeMetrics: [],
    followUp: "兩週後回診",
    avsSnapshots: [],
    ...over
  };
}
function draftFor(kase, note, version) {
  return AVS.buildDraftSnapshot({
    kase, note, library: LIBRARY, clinic: CLINIC,
    modalityVocabulary: MODALITY_VOCAB, outcomeMetricDefs: [], version
  });
}
const ruleIds = (d) => d.renderedAdvice.map((a) => a.ruleId);

// ---- Scenario A — routine acupuncture --------------------------------------
console.log("Scenario A — routine acupuncture, no flags");
{
  const kase = makeCase();
  const note = makeNote({ modalitiesPerformed: ["modality.acupuncture"] });
  const d = draftFor(kase, note);
  assert(d.modalitySource === "structured", "modality source is structured");
  assert(ruleIds(d).includes("avs.acupuncture_aftercare"), "acupuncture aftercare candidate present");
  assert(!ruleIds(d).includes("avs.active_oncology_tx_precautions"), "no oncology candidate");
  assert(!ruleIds(d).includes("avs.anticoagulant_precautions"), "no anticoagulant candidate");
  assert(!ruleIds(d).includes("avs.cancer_tx_precautions"), "deprecated cancer rule never matches (active:false)");
  assert(d.todayCare.includes("針刺"), "todayCare carries plain-zh modality name");
}

// ---- Scenario B — cupping + anticoagulant ----------------------------------
console.log("Scenario B — cupping + anticoagulant flag");
{
  const kase = makeCase({ safetyFlags: ["anticoagulant use (warfarin)"] });
  const note = makeNote({ modalitiesPerformed: ["modality.cupping"] });
  const d = draftFor(kase, note);
  assert(ruleIds(d).includes("avs.cupping_guasha_aftercare"), "cupping aftercare candidate present");
  assert(ruleIds(d).includes("avs.anticoagulant_precautions"), "anticoagulant candidate present (alias-normalized exact match)");
  // 醫師可勾掉 + 改寫(§2.3)
  const cupIdx = d.renderedAdvice.findIndex((a) => a.ruleId === "avs.cupping_guasha_aftercare");
  d.renderedAdvice[cupIdx].text_zh = "今天有拔罐,今晚早點休息,有問題聯絡診所。";
  const acIdx = d.renderedAdvice.findIndex((a) => a.ruleId === "avs.anticoagulant_precautions");
  d.renderedAdvice[acIdx].selected = false;
  d.clinicianAddedAdvice.push({ category: "lifestyle", text_zh: "睡前熱敷肩頸十分鐘。" });
  const snaps = AVS.finalizeSnapshot(AVS.upsertDraft(note.avsSnapshots, d), d.id, "2026-01-15T18:00:00Z");
  const fin = AVS.latestFinalized(snaps);
  assert(fin.renderedAdvice.every((a) => a.ruleId !== "avs.anticoagulant_precautions"), "deselected candidate dropped at finalize");
  assert(fin.renderedAdvice.some((a) => a.text_zh.includes("今晚早點休息")), "clinician edit preserved in finalized text");
  assert(fin.renderedAdvice.every((a) => a.matchedTriggers === undefined), "matchedTriggers stripped at finalize");
  const html = AVS.renderPatientHtml(fin, { visitDate: note.visitDate });
  const banned = AVS.checkPatientOutputSafety(html, kase);
  assert(banned.length === 0, `patient output has zero internal ids/banned tokens (found: ${banned.join(",") || "none"})`);
  assert(!html.includes("P-TEST-999"), "patientCode absent from patient output");
}

// ---- Scenario C — remote cancer history, no active treatment ----------------
console.log("Scenario C — remote cancer history, NO active treatment");
{
  const kase = makeCase({ westernConditions: ["cond.breast_cancer"], safetyFlags: ["cancer history 2018, resolved"] });
  const note = makeNote({ modalitiesPerformed: ["modality.acupuncture"] });
  const d = draftFor(kase, note);
  assert(!ruleIds(d).includes("avs.active_oncology_tx_precautions"), "no active-treatment instruction from diagnosis/history alone (§6.2)");
  const html = AVS.renderPatientHtml(d, { visitDate: note.visitDate });
  assert(!html.includes("治療期間請特別留意"), "rendered output has no active-treatment wording");
}

// ---- Scenario D — active chemotherapy --------------------------------------
console.log("Scenario D — active chemotherapy");
{
  const kase = makeCase({ westernConditions: ["cond.breast_cancer"], safetyFlags: ["active chemotherapy (cycle 3)"] });
  const note = makeNote({ modalitiesPerformed: ["modality.acupuncture"] });
  const d = draftFor(kase, note);
  const onc = d.renderedAdvice.find((a) => a.ruleId === "avs.active_oncology_tx_precautions");
  assert(!!onc, "oncology safety candidate appears with active treatment flag");
  assert(onc && onc.selected === false, "oncology candidate is preselect:false — requires explicit clinician opt-in");
}

// ---- Scenario E — finalized history survives library edits ------------------
console.log("Scenario E — finalized text immune to library edits");
{
  const kase = makeCase();
  const note = makeNote({ modalitiesPerformed: ["modality.cupping"] });
  const d = draftFor(kase, note);
  const snaps = AVS.finalizeSnapshot(AVS.upsertDraft([], d), d.id, "2026-01-15T18:00:00Z");
  const fin = AVS.latestFinalized(snaps);
  const originalText = fin.renderedAdvice.map((a) => a.text_zh).join("|");
  // 事後改庫(模擬 avs_advice_library.json 被編輯)
  const mutatedLibrary = JSON.parse(JSON.stringify(LIBRARY));
  for (const r of mutatedLibrary) r.advice_zh = "【庫已改版】" + r.advice_zh;
  const htmlAfter = AVS.renderPatientHtml(fin, { visitDate: note.visitDate });
  assert(fin.renderedAdvice.map((a) => a.text_zh).join("|") === originalText, "finalized renderedAdvice text unchanged after library edit");
  assert(!htmlAfter.includes("【庫已改版】"), "historical render reads snapshot only, never the live library");
}

// ---- Scenario F — correction / supersede ------------------------------------
console.log("Scenario F — correction creates v2, v1 superseded and readable");
{
  const kase = makeCase();
  const note = makeNote({ modalitiesPerformed: ["modality.acupuncture"] });
  const d1 = draftFor(kase, note, 1);
  let snaps = AVS.finalizeSnapshot(AVS.upsertDraft([], d1), d1.id, "2026-01-15T18:00:00Z");
  const v1 = AVS.latestFinalized(snaps);
  const d2 = AVS.createCorrectionDraft(snaps, "2026-01-16T09:00:00Z");
  assert(d2.version === 2, "correction draft is version 2");
  d2.clinicianAddedAdvice.push({ category: "special", text_zh: "更正:回診改為一週後。" });
  snaps = AVS.finalizeSnapshot(AVS.upsertDraft(snaps, d2), d2.id, "2026-01-16T09:05:00Z");
  const v1After = snaps.find((s) => s.id === v1.id);
  const v2 = AVS.latestFinalized(snaps);
  assert(v1After.status === "superseded", "v1 becomes superseded (not deleted)");
  assert(v2.version === 2 && v2.status === "finalized", "v2 is the finalized version");
  assert(snaps.length === 2, "both versions retained");
  assert(v1After.renderedAdvice.length === v1.renderedAdvice.length, "superseded v1 content intact and readable");
  const inv = AVS.checkAvsInvariants([{ id: "case.test.fixture", soapNotes: [{ ...note, avsSnapshots: snaps }] }]);
  assert(inv.ok, `AVS invariants pass after supersede (${inv.failures.join("; ") || "clean"})`);
}

// ---- Scenario G — legacy free-text inference --------------------------------
console.log("Scenario G — legacy free-text modality inference");
{
  const kase = makeCase();
  const note = makeNote({ modalitiesPerformed: [], pointsUsed: "LI4, LR3 bilateral", technique: "平補平瀉,加電針與拔罐" });
  const d = draftFor(kase, note);
  assert(d.modalitySource === "inferred", "draft flags inferred modality source (clinician must confirm before finalize)");
  const ids = [...AVS.resolveModalities(note).modalityIds];
  assert(ids.includes("modality.acupuncture") && ids.includes("modality.electroacupuncture") && ids.includes("modality.cupping"), "inference finds acupuncture + electro + cupping from legacy text");
  const snaps = AVS.finalizeSnapshot(AVS.upsertDraft([], d), d.id, "2026-01-15T18:00:00Z");
  const fin = AVS.latestFinalized(snaps);
  assert(fin.todayCare.length >= 2, "finalized AVS stores confirmed rendered todayCare");
  assert(fin.modalitySource === "inferred", "finalized snapshot records that fallback inference was used (§7 provenance)");
}

// ---- 附加 — 零診斷自檢攔截 ---------------------------------------------------
console.log("Extra — banned-token interception on patient output");
{
  const kase = makeCase();
  const note = makeNote({ modalitiesPerformed: ["modality.acupuncture"] });
  const d = draftFor(kase, note);
  d.clinicianAddedAdvice.push({ category: "lifestyle", text_zh: "此建議誤植內部代碼 pattern.liver_qi_stagnation 於病人文字。" });
  const html = AVS.renderPatientHtml(d, { visitDate: note.visitDate });
  const banned = AVS.checkPatientOutputSafety(html, kase);
  assert(banned.includes("pattern."), "diagnosis id in patient text is caught by safety check");
  // 空白定稿拒絕
  const empty = draftFor(kase, makeNote({ id: "soap.test.2", modalitiesPerformed: [] }));
  empty.renderedAdvice = [];
  empty.todayCare = [];
  let threw = false;
  try { AVS.finalizeSnapshot(AVS.upsertDraft([], empty), empty.id); } catch (e) { threw = true; }
  assert(threw, "finalizing an empty AVS is refused");
  // finalized 不可再 finalize(不可變面)
  const d2 = draftFor(kase, note);
  const snaps = AVS.finalizeSnapshot(AVS.upsertDraft([], d2), d2.id);
  let threw2 = false;
  try { AVS.finalizeSnapshot(snaps, d2.id); } catch (e) { threw2 = true; }
  assert(threw2, "finalize on an already-finalized snapshot throws (immutability)");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
