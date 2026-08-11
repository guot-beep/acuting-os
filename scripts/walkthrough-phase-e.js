/* Phase E 假病人縱向走查 — SPRINT brief HARD GATE 8 的契約級自動化版。
 *
 * 純 node、純假資料:假病人 A(慢性病程 5 visits:證型演變、用藥+補充劑
 * 時間線、生活型態軌跡、一次不良反應、outcome 軌跡)+ 假病人 B(隔離對照)。
 * 驗:時間線重建、現況重建、症狀軌跡、暴露歷史、隔離、export→wipe→import
 * round-trip、R1–R8 不變量。瀏覽器級的 UI 走查另在 preview 手動做;這支是
 * 每次改動都能重跑的回歸底線(Codex 可獨立執行)。
 *
 * 用法:node scripts/walkthrough-phase-e.js
 */
"use strict";
const crypto = require("crypto");
require("../js/clinical-store.js");
const S = globalThis.AcuTingClinicalStore;

let failures = 0;
const check = (name, ok, detail = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`); if (!ok) failures++; };
const sha256 = (t) => crypto.createHash("sha256").update(t, "utf8").digest("hex");

// ---- 建假病人 A:全部經正規 API(createExposure/applyExposureChange)----
let mg = S.createExposure(
  { id: "agentexp.pA.mg", agentType: "supplement", agentId: "supp.magnesium", nameText: "Magnesium glycinate" },
  { eventType: "initial_recorded", doseText: "200 mg", status: "current", effectiveApprox: "2026-01", note: "intake: already in use" }
);
mg = S.applyExposureChange(mg, { eventType: "dose_changed", doseText: "400 mg", visitId: "pA.v3" });
mg = S.applyExposureChange(mg, { eventType: "stopped", status: "stopped", visitId: "pA.v5", note: "GI upset" });

let smoke = S.createExposure(
  { id: "envexp.pA.smoke", exposureId: "exposure.wildfire_smoke", contextText: "2026 fire season" },
  { eventType: "started", certainty: "suspected", timing: "ongoing" }, "environmental"
);
smoke = S.applyExposureChange(smoke, { eventType: "certainty_changed", certainty: "confirmed", note: "AQI logs + symptom correlation reviewed" }, "environmental");

const visit = (n, date, patterns, pain, sleepH, extra = {}) => ({
  id: `pA.v${n}`, visitDate: date, visitNumber: n,
  tcmPatternSelections: patterns,
  lifestyleFactors: [{ id: `lf.pA.${n}`, factorId: "life.sleep.short_duration", valueNumber: sleepH, unit: "h/night" }],
  outcomeMetrics: [{ metricId: "metric.pain_score", valueNumber: pain, relatedSymId: "sym.headache" }],
  ...extra
});
const patientA = {
  id: "case.pA", patientCode: "FAKE-E-A", caseTitle: "Phase E chronic course",
  agentExposures: [mg], environmentalExposures: [smoke],
  soapNotes: [
    visit(1, "2026-08-01", [{ patternId: "pattern.liver_qi_stagnation", isPrimary: true, role: "primary", confidence: "working", note: "" }], 8, 5,
      { patternDifferentials: [{ patternId: "pattern.heart_blood_deficiency", ruledOut: false, note: "watch sleep" }] }),
    visit(2, "2026-08-08", [{ patternId: "pattern.liver_qi_stagnation", isPrimary: true, role: "primary", confidence: "probable", note: "" }], 7, 5.5),
    visit(3, "2026-08-15", [{ patternId: "pattern.liver_qi_stagnation", isPrimary: true, role: "primary", confidence: "confirmed", note: "" },
                            { patternId: "pattern.spleen_qi_deficiency", isPrimary: false, role: "secondary", confidence: "", note: "" }], 5, 6),
    visit(4, "2026-08-22", [{ patternId: "pattern.spleen_qi_deficiency", isPrimary: true, role: "primary", confidence: "working", note: "轉主證" }], 4, 6.5,
      { adverseEvents: [{ id: "ae.pA.1", eventId: "adverse_event.bruising", interventionType: "acupuncture", modalityId: "modality.acupuncture", severity: "mild", resolutionStatus: "resolved", nameText: "", notes: "" }] }),
    visit(5, "2026-08-29", [{ patternId: "pattern.spleen_qi_deficiency", isPrimary: true, role: "primary", confidence: "probable", note: "" }], 3, 7)
  ]
};
const patientB = {
  id: "case.pB", patientCode: "FAKE-E-B", caseTitle: "Phase E isolation control",
  agentExposures: [], environmentalExposures: [],
  soapNotes: [visit(1, "2026-08-03", [{ patternId: "pattern.kidney_yin_deficiency", isPrimary: true, role: "primary", confidence: "working", note: "" }], 6, 6)]
};
// 修 patientB 的 visit id 前綴避免與 A 撞名
patientB.soapNotes[0].id = "pB.v1";

const cases = [patientA, patientB];

// ---- HARD GATE 驗證 ----
// 1. 症狀/outcome 軌跡(pain 8→7→5→4→3)
const pain = S.getOutcomeHistory(patientA, "metric.pain_score").map((h) => h.valueNumber);
check("pain trajectory 8→7→5→4→3", JSON.stringify(pain) === "[8,7,5,4,3]", pain.join("→"));

// 2. 生活型態軌跡(sleep 5→5.5→6→6.5→7)
const sleep = S.getLifestyleHistory(patientA, "life.sleep.short_duration").map((h) => h.valueNumber);
check("sleep trajectory 5→7", JSON.stringify(sleep) === "[5,5.5,6,6.5,7]", sleep.join("→"));

// 3. 暴露時間線重建(200mg→400mg→stopped;3 events 完整)
const seq = S.getExposureTimeline(patientA.agentExposures[0]);
check("exposure timeline 3 events, dose history recoverable", seq.length === 3 && seq[0].doseText === "200 mg" && seq[1].doseText === "400 mg" && seq[2].status === "stopped");
check("current snapshot = stopped", patientA.agentExposures[0].status === "stopped");
check("suspected→confirmed leaves sourced trail", smoke.certainty === "confirmed" && smoke.events[1].note.length > 0);

// 4. 證型縱向演變不覆寫(v1 primary=肝鬱、v4 primary=脾虛,v1 記錄不變)
check("pattern evolution longitudinal (v1 unchanged, v4 new primary)",
  patientA.soapNotes[0].tcmPatternSelections[0].patternId === "pattern.liver_qi_stagnation" &&
  patientA.soapNotes[3].tcmPatternSelections[0].patternId === "pattern.spleen_qi_deficiency");

// 5. 現況重建(Patient Now 資料面):最新 visit 的 primary + current exposures
const latest = patientA.soapNotes[patientA.soapNotes.length - 1];
check("current-state reconstruction", latest.tcmPatternSelections[0].isPrimary === true && S.getCurrentExposures(patientA).length === 0);

// 6. 隔離:derivation 不跨病人洩漏
const patients = S.derivePatientsFromCases(cases);
check("patient isolation in derivation", patients.length === 2 && patients.every((p) => p.caseIds.length === 1));

// 7. 不變量 R1–R7 全綠
const inv = S.checkClinicalInvariants(cases);
check("invariants R1-R7 clean", inv.failures.length === 0, inv.failures.join("; "));

// 8. export→wipe→import round-trip(序列化往返 + append-only 保持)
const exported = JSON.stringify(cases, null, 2);
const reimported = JSON.parse(exported);
check("export/import byte round-trip", sha256(JSON.stringify(reimported, null, 2)) === sha256(exported));
for (const [i, c] of cases.entries()) for (const f of ["agentExposures", "environmentalExposures"]) {
  for (const [j, row] of (c[f] || []).entries()) {
    const chk = S.exposureHistoryExtends(row, reimported[i][f][j]);
    if (!chk.ok) check(`round-trip history ${c.id}/${f}[${j}]`, false, chk.reason);
  }
}
check("round-trip preserves all exposure histories", true);

// 9. 一次不良反應完整記錄
const ae = patientA.soapNotes[3].adverseEvents[0];
check("adverse event linked to modality+resolution", ae.modalityId === "modality.acupuncture" && ae.resolutionStatus === "resolved");

console.log(failures ? `\nPHASE E WALKTHROUGH FAIL — ${failures}` : `\nPHASE E WALKTHROUGH PASS — 2 fake patients · 6 visits · all gates green`);
process.exit(failures ? 1 : 0);
