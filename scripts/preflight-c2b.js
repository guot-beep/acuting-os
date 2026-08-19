/* C2b P1 preflight 計算器(Codex P0–P2 只讀授權,b270b50)
 *
 * 只讀:吃一個 raw snapshot 檔(直接來自 localStorage 的 bytes,絕不先
 * normalize),輸出 P1.3 要求的全部驗收數字。輸出檔一律寫到 --out 指定的
 * Git 外目錄(P0.3:patientCode/ids/臨床文字不得進 repo)。
 *
 * 用法:
 *   node scripts/preflight-c2b.js <raw.json> --out <dir-outside-git>
 * 產出(在 out dir):
 *   preflight_report.json  全部數字 + hashes(含敏感 id sets —— 留在本機)
 *   preflight_summary.txt  可貼進 repo 的去識別摘要(只有 counts/hashes)
 */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("../js/clinical-store.js");
const S = globalThis.AcuTingClinicalStore;

const sha256 = (b) => crypto.createHash("sha256").update(b).digest("hex");

const KNOWN_CASE_KEYS = new Set(["id","patientCode","caseTitle","caseCategory","status","birthYearMonth","sex","genderIdentity","raceEthnicity","raceEthnicityDetail","onsetApprox","chronicity","coursePattern","previousTreatment","previousTreatmentNotes","baselineSeverity","occupation","goals","chiefComplaint","historyPresent","pastHistory","allergyStatus","allergies","currentMeds","menstrualObHistory","lifestyle","westernConditions","easternDiseases","tcmPatterns","safetyFlags","agentExposures","environmentalExposures","summary","soapNotes","createdAt","updatedAt","birthYear","display_label"]);

const args = process.argv.slice(2);
const rawFile = args[0];
const outIdx = args.indexOf("--out");
if (!rawFile || outIdx === -1 || !args[outIdx + 1]) { console.log("usage: node scripts/preflight-c2b.js <raw.json> --out <dir>"); process.exit(2); }
const outDir = args[outIdx + 1];
const repoRoot = path.resolve(__dirname, "..").toLowerCase() + path.sep;
if ((path.resolve(outDir).toLowerCase() + path.sep).startsWith(repoRoot)) { console.error("REFUSED: --out is inside the repo — P0.3 forbids committing preflight data"); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });

const rawBytes = fs.readFileSync(rawFile);
const rawText = rawBytes.toString("utf8");
const cases = JSON.parse(rawText);
if (!Array.isArray(cases)) { console.error("raw snapshot is not an array"); process.exit(1); }

const caseIds = cases.map((c) => c.id);
const soapIds = cases.flatMap((c) => (c.soapNotes || []).map((n) => n.id));
const patientCodes = [...new Set(cases.map((c) => String(c.patientCode || "").trim()).filter(Boolean))];
const nested = { agentExposures: 0, agentEvents: 0, environmentalExposures: 0, envEvents: 0, lifestyleFactors: 0, adverseEvents: 0, patternDifferentials: 0, tcmPatternSelections: 0, outcomeMetrics: 0 };
const exposureSequences = {};
const unknownKeys = new Set();
let d17testCount = 0;

for (const c of cases) {
  if (/case_d17test/.test(c.id)) d17testCount++;
  for (const k of Object.keys(c)) if (!KNOWN_CASE_KEYS.has(k)) unknownKeys.add(`case.${k}`);
  nested.agentExposures += (c.agentExposures || []).length;
  nested.environmentalExposures += (c.environmentalExposures || []).length;
  for (const [field, kind] of [["agentExposures", "agent"], ["environmentalExposures", "env"]]) {
    for (const row of c[field] || []) {
      const evs = row.events || [];
      if (kind === "agent") nested.agentEvents += evs.length; else nested.envEvents += evs.length;
      exposureSequences[`${c.id}/${field}/${row.id || row.agentId || row.exposureId}`] =
        evs.map((e) => ({ id: e.id || "", payloadSha256_12: sha256(S.canonicalEventPayload(e)).slice(0, 12) }));
    }
  }
  for (const n of c.soapNotes || []) {
    nested.lifestyleFactors += (n.lifestyleFactors || []).length;
    nested.adverseEvents += (n.adverseEvents || []).length;
    nested.patternDifferentials += (n.patternDifferentials || []).length;
    nested.tcmPatternSelections += (n.tcmPatternSelections || []).length;
    nested.outcomeMetrics += (n.outcomeMetrics || []).length;
  }
}

const dupCaseIds = caseIds.filter((id, i) => caseIds.indexOf(id) !== i);
const blankCodeCases = cases.filter((c) => !String(c.patientCode || "").trim()).map((c) => c.id);

const report = {
  captured_at_note: "fill in manually per P0.1 (profile/origin/operator/time)",
  raw_sha256: sha256(rawBytes),
  raw_bytes: rawBytes.length,
  counts: { cases: cases.length, soapNotes: soapIds.length, uniquePatientCodes: patientCodes.length, blankCodeCases: blankCodeCases.length, duplicateCaseIds: dupCaseIds.length, case_d17test: d17testCount, ...nested },
  caseIds, soapIds, patientCodes, blankCodeCases, duplicateCaseIds: dupCaseIds,
  unknownFields: [...unknownKeys],
  exposureEventSequences: exposureSequences
};
fs.writeFileSync(path.join(outDir, "preflight_report.json"), JSON.stringify(report, null, 2));

const summary = [
  `raw_sha256: ${report.raw_sha256}`,
  `raw_bytes: ${report.raw_bytes}`,
  ...Object.entries(report.counts).map(([k, v]) => `${k}: ${v}`),
  `unknownFields: ${report.unknownFields.length}${report.unknownFields.length ? " (" + report.unknownFields.join(", ") + ")" : ""}`
].join("\n");
fs.writeFileSync(path.join(outDir, "preflight_summary.txt"), summary + "\n");
console.log(summary);
console.log(`\nreport (SENSITIVE, keep outside git): ${path.join(outDir, "preflight_report.json")}`);
