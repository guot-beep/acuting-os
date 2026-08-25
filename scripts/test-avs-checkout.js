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
  // 2026-08-25(DRY_CLINIC_LOG.md #12 迴歸鎖定):note.followUp 是醫師寫給自己
  // 看的臨床規劃欄(這個 fixture 故意帶了值,見 makeNote() 的 followUp:
  // "兩週後回診"),draft 建立時絕不可自動帶進病人文件草稿 —— 空白逼醫師自己
  // 打一句病人看得懂的話,不會有「忘記把內部判斷刪掉」的漏改風險。
  assert(d.followUpSnapshot === "", "followUpSnapshot starts empty even when note.followUp has clinician-internal text (no silent carryover)");
}

// ---- Scenario B — cupping + anticoagulant ----------------------------------
console.log("Scenario B — cupping + anticoagulant flag");
{
  const kase = makeCase({ safetyFlags: ["anticoagulant use (warfarin)"] });
  const note = makeNote({ modalitiesPerformed: ["modality.cupping"] });
  const d = draftFor(kase, note);
  assert(ruleIds(d).includes("avs.cupping_guasha_aftercare"), "cupping aftercare candidate present");
  assert(ruleIds(d).includes("avs.anticoagulant_precautions"), "anticoagulant candidate present (alias-normalized exact match)");
  // 醫師端判斷輔助:draft 階段要帶得出證據等級與來源,不然「為什麼建議?」
  // 面板沒東西可顯示。anticoagulant_precautions 是 2026-08-13 SOL 落庫的
  // 5 筆之一,library 裡確實有 evidence_type 與 source_refs。
  {
    const acDraft = d.renderedAdvice.find((a) => a.ruleId === "avs.anticoagulant_precautions");
    assert(!!acDraft.evidenceType, "draft carries evidenceType for a rule that has one");
    assert(Array.isArray(acDraft.sourceRefs) && acDraft.sourceRefs.length > 0, "draft carries sourceRefs for a rule that has them");
  }
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
  // 跟 matchedTriggers 同一個命運:醫師端判斷輔助不該活到定稿文件裡 ——
  // finalizeSnapshot 是白名單重建,這裡確認新加的兩個欄位真的被剝了,
  // 不是只有沒寫斷言、沒被注意到而已。
  assert(fin.renderedAdvice.every((a) => a.evidenceType === undefined), "evidenceType stripped at finalize");
  assert(fin.renderedAdvice.every((a) => a.sourceRefs === undefined), "sourceRefs stripped at finalize");
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

// ---- 附加 — renderPatientText(2026-08-25,Ting 要求 email 可直接貼上)-------
console.log("Extra — renderPatientText copy-for-email output");
{
  const kase = makeCase();
  const note = makeNote({ modalitiesPerformed: ["modality.cupping", "modality.acupuncture"] });
  const d = draftFor(kase, note);
  d.clinicianAddedAdvice.push({ category: "lifestyle", text_zh: "睡前熱敷肩頸十分鐘。" });
  d.followUpSnapshot = "兩週後回診";
  const snaps = AVS.finalizeSnapshot(AVS.upsertDraft(note.avsSnapshots, d), d.id, "2026-01-15T18:00:00Z");
  const fin = AVS.latestFinalized(snaps);
  const text = AVS.renderPatientText(fin, { visitDate: note.visitDate });
  assert(typeof text === "string" && text.length > 0, "renderPatientText returns non-empty string");
  assert(!/<[a-z][\s\S]*>/i.test(text), "output has no HTML tags (plain text, paste-ready)");
  assert(text.includes("睡前熱敷肩頸十分鐘"), "clinician-added advice text present");
  assert(text.includes("兩週後回診"), "follow-up snapshot present");
  assert(text.includes(note.visitDate), "visit date present");
  const banned = AVS.checkPatientOutputSafety(text, kase);
  assert(banned.length === 0, `plain-text output has zero internal ids/banned tokens (found: ${banned.join(",") || "none"})`);
  assert(!text.includes("P-TEST-999"), "patientCode absent from plain-text patient output");

  // 同一份 findBannedTokens 掃描器對純文字一樣有效(沒有 tag 可剝,不影響命中)。
  const dirty = draftFor(kase, note);
  dirty.clinicianAddedAdvice.push({ category: "lifestyle", text_zh: "此建議誤植內部代碼 pattern.liver_qi_stagnation 於病人文字。" });
  const dirtyText = AVS.renderPatientText(dirty, { visitDate: note.visitDate });
  assert(AVS.checkPatientOutputSafety(dirtyText, kase).includes("pattern."), "diagnosis id in plain-text draft output is caught by safety check");
}

// ---- Codex NO-GO 迴歸(2026-08-12 audit HIGH-1/HIGH-3/MED-1 的反例)---------
console.log("Codex regression — HIGH-3 canonical scanner probes");
{
  const kase = makeCase();   // patientCode P-TEST-999
  const probes = [
    ["PATTERN.liver_qi", "pattern."],
    ["Pattern.blood_stasis", "pattern."],
    ["依 icd-10 編碼", "icd"],
    ["P-test-999 的資料", "P-TEST-999"],                       // case-folded patientCode
    ["pat<b>tern.split", "pattern."],                          // 跨 tag 拆字
    ["&amp;#112;attern.double_encoded", "pattern."],           // 雙層 entity
    ["Metric.pain_score from clinic field", "metric."],
    ["Safety.anticoagulant from prompt", "safety."]
  ];
  for (const [payload, expected] of probes) {
    const hits = AVS.findBannedTokens(payload, kase.patientCode);
    assert(hits.includes(expected), `probe "${payload.slice(0, 30)}" caught as "${expected}"`);
  }
  // HTML-escaped patientCode:含 & 的 code 經 esc() 後仍要被抓
  const ampCase = makeCase({ patientCode: "P&1" });
  const note = makeNote({ modalitiesPerformed: ["modality.acupuncture"] });
  const d = draftFor(ampCase, note);
  d.clinicianAddedAdvice.push({ category: "lifestyle", text_zh: "文件裡誤植 P&1 病歷代碼。" });
  const html = AVS.renderPatientHtml(d, { visitDate: "2026-01-15" });
  assert(html.includes("P&amp;1"), "renderer escapes the & in patient text (sanity)");
  assert(AVS.checkPatientOutputSafety(html, ampCase).includes("P&1"), "HTML-escaped patientCode still caught after entity decode");
  // 乾淨輸出零誤報(新尺不能把合法文件掃紅)
  const clean = draftFor(makeCase(), note);
  assert(AVS.checkPatientOutputSafety(AVS.renderPatientHtml(clean, { visitDate: "2026-01-15" }), makeCase()).length === 0, "clean patient output has zero false positives under canonical scanner");

  // Codex retest#2 — 深層巢狀 entity 繞過:patientCode 是含多層 & 的合法
  // 自由字串,render 的 esc() 再加一層,舊版 4-pass 上限讓 HTML 側停在
  // 半解碼、對不上 → hits=[]。修復後解碼到真定點,仍須抓到。
  for (const code of ["P&&&&&1", "P&amp;&amp;X", "A&&B&&C&&D&&9"]) {
    const deepCase = makeCase({ patientCode: code });
    const dd = draftFor(deepCase, note);
    dd.clinicianAddedAdvice.push({ category: "lifestyle", text_zh: `文件誤植病歷代碼 ${code}。` });
    const h = AVS.renderPatientHtml(dd, { visitDate: "2026-01-15" });
    assert(AVS.checkPatientOutputSafety(h, deepCase).includes(code), `deep-nested-entity patientCode "${code}" caught after fixpoint decode`);
  }
  // 定點解碼終止性(DoS backstop):超長 &amp; 鏈不掛、可回傳
  const bomb = "&amp;".repeat(2000) + "P-BOMB";
  assert(typeof AVS.canonicalizeForScan(bomb) === "string", "canonicalizeForScan terminates on a long entity chain");
}

console.log("Codex regression — HIGH-1 avsHistoryExtends (merge comparator)");
{
  const kase = makeCase();
  const note = makeNote({ modalitiesPerformed: ["modality.cupping"] });
  const d = draftFor(kase, note, 1);
  const snaps = AVS.finalizeSnapshot(AVS.upsertDraft([], d), d.id, "2026-01-15T18:00:00Z");
  const before = { ...note, avsSnapshots: snaps };
  // 改寫 finalized 文字 → 拒
  const rewritten = JSON.parse(JSON.stringify(before));
  rewritten.avsSnapshots[0].renderedAdvice[0].text_zh = "被改寫的歷史";
  assert(AVS.avsHistoryExtends(before, rewritten).ok === false, "rewritten finalized text refused");
  // 截短(avsSnapshots: []) → 拒
  assert(AVS.avsHistoryExtends(before, { ...note, avsSnapshots: [] }).ok === false, "truncated avsSnapshots refused");
  // 合法更正:v1 finalized→superseded + v2 finalized → 放行
  const d2 = AVS.createCorrectionDraft(snaps, "2026-01-16T09:00:00Z");
  const snaps2 = AVS.finalizeSnapshot(AVS.upsertDraft(snaps, d2), d2.id, "2026-01-16T09:05:00Z");
  assert(AVS.avsHistoryExtends(before, { ...note, avsSnapshots: snaps2 }).ok === true, "legal supersede correction passes");
  // superseded 逆轉回 finalized → 拒
  const resurrect = JSON.parse(JSON.stringify(snaps2));
  resurrect.find((s) => s.status === "superseded").status = "finalized";
  assert(AVS.avsHistoryExtends({ ...note, avsSnapshots: snaps2 }, { ...note, avsSnapshots: resurrect }).ok === false, "superseded→finalized resurrection refused");
  // draft 自由替換 → 放行
  const withDraft = AVS.upsertDraft(snaps2, { ...draftFor(kase, note, 3), version: 3 });
  assert(AVS.avsHistoryExtends({ ...note, avsSnapshots: snaps2 }, { ...note, avsSnapshots: withDraft }).ok === true, "draft replacement is free");
  // Codex retest 新發現 — merge shadow bypass:同 id 兩筆,[改寫版, 原版]。
  // 舊版 Map 索引只看最後一筆(原版)而放行,但消費者 find() 讀到第一筆
  // (改寫版)。修復後:after 出現任何重複 id 一律拒。
  const shadow = JSON.parse(JSON.stringify(before));
  const rewrittenCopy = JSON.parse(JSON.stringify(shadow.avsSnapshots[0]));
  rewrittenCopy.renderedAdvice[0].text_zh = "影子改寫版";
  shadow.avsSnapshots = [rewrittenCopy, shadow.avsSnapshots[0]];
  const shadowCheck = AVS.avsHistoryExtends(before, shadow);
  assert(shadowCheck.ok === false && /duplicate/.test(shadowCheck.reason), "shadow-copy duplicate-id merge refused (Codex retest bypass)");
  // 消費者視角 sanity:find() 確實會拿到第一筆 —— 證明這個洞是真的可利用,
  // 而不是理論性的(拿舊版邏輯對照用)。
  assert(shadow.avsSnapshots.find((s) => s.id === rewrittenCopy.id).renderedAdvice[0].text_zh === "影子改寫版", "consumer find() would have read the rewritten shadow copy (exploit sanity)");
}

console.log("Codex regression — MED-1 invariant hardening");
{
  const kase = makeCase();
  const note = makeNote({ modalitiesPerformed: ["modality.acupuncture"] });
  const wrap = (snaps) => AVS.checkAvsInvariants([{ id: "case.test.fixture", soapNotes: [{ ...note, avsSnapshots: snaps }] }]);
  const d = draftFor(kase, note, 1);
  const fin = AVS.finalizeSnapshot(AVS.upsertDraft([], d), d.id, "2026-01-15T18:00:00Z")[0];
  // duplicate id
  assert(wrap([fin, { ...fin, status: "superseded", version: 2 }]).ok === false, "duplicate snapshot id caught");
  // version -1 / 1.5
  assert(wrap([{ ...fin, id: "avs.x1", version: -1 }]).ok === false, "version -1 caught");
  assert(wrap([{ ...fin, id: "avs.x2", version: 1.5 }]).ok === false, "version 1.5 caught");
  // superseded v2 蓋 finalized v1 → 拒
  assert(wrap([{ ...fin, id: "avs.x3", version: 1 }, { ...fin, id: "avs.x4", version: 2, status: "superseded" }]).ok === false, "finalized must be strictly newer than superseded");
  // 合法序列:superseded v1 + finalized v2 → ok
  assert(wrap([{ ...fin, id: "avs.x5", version: 1, status: "superseded" }, { ...fin, id: "avs.x6", version: 2 }]).ok === true, "legal v1-superseded/v2-finalized sequence passes");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
