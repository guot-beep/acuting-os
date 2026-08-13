#!/usr/bin/env node
/**
 * test-practice-audit.js — Practice Audit 計算層的行為測試
 *
 * 全部用虛構病人。真實病例只讀、永不進 GitHub(AGENTS.md §資料安全)。
 *
 * 這裡測的重點不是「數字算得出來」,是三件容易靜默出錯的事:
 *   1. 只測過一次的 metric 不能被當成「變化 0」——那會把沒資料說成沒變化
 *   2. 沒有具名來源的 metric 不能帶出任何臨床顯著性的字眼
 *   3. 知識缺口要按「用得多 × 卡片差」排,而不是按 id 字母序
 *
 * 用法:node scripts/test-practice-audit.js
 */
"use strict";

const path = require("path");
const { computePracticeAudit } = require(path.join(__dirname, "..", "js", "practice-audit.js"));

const KNOWLEDGE = {
  outcomeMetrics: {
    records: [
      {
        id: "metric.pain_score", label_zh: "疼痛", unit: "0-10", direction_good: "decrease",
        interpretation_status: "sourced",
        interpretation_en: "A decrease of about 2 points is commonly cited as clinically meaningful.",
        source: { name: "Farrar JT, et al. Pain. 2001;94(2):149-158." },
      },
      {
        id: "metric.mood", label_zh: "情緒", unit: "0-10", direction_good: "increase",
        interpretation_status: "no_published_threshold",
      },
      {
        id: "metric.sleep_hours", label_zh: "睡眠時數", unit: "hours", direction_good: "individualized",
        interpretation_status: "source_pending",
      },
    ],
  },
  formulas: {
    records: [
      { id: "formula.gui_zhi_tang", name_zh: "桂枝湯", review_status: "sourced_cloudtcm_record" },
      { id: "formula.xiao_yao_san", name_zh: "逍遙散", review_status: "skeleton" },
      { id: "formula.si_ni_san", name_zh: "四逆散", review_status: "draft" },
    ],
  },
  patternLibrary: {
    records: [{ id: "pattern.liver_qi_stagnation", name_zh: "肝氣鬱結", review_status: "draft" }],
  },
};

const note = (o) => Object.assign({
  id: "note." + Math.abs(String(o.visitDate || "x").split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7)),
  outcomeMetrics: [], adverseEvents: [], acupointLinks: [], formulaLinks: [],
  modalitiesPerformed: [], tcmPatternSelections: [], tcmPatternLinks: [], outcomeVerdict: "",
}, o);

// 虛構病人 A:5 診,pain 7→3、mood 4→7、其中一診有輕度不良事件
const caseA = {
  id: "case.A", patientCode: "FICT-A", caseTitle: "虛構:慢性肩痛",
  soapNotes: [
    note({ visitDate: "2026-03-02", outcomeVerdict: "no_change", acupointLinks: ["LI4", "ST36"], formulaLinks: ["formula.xiao_yao_san"], tcmPatternSelections: [{ patternId: "pattern.liver_qi_stagnation", isPrimary: true }], modalitiesPerformed: ["modality.acupuncture"], outcomeMetrics: [{ metricId: "metric.pain_score", valueNumber: 7 }, { metricId: "metric.mood", valueNumber: 4 }] }),
    note({ visitDate: "2026-03-09", outcomeVerdict: "improved", acupointLinks: ["LI4"], formulaLinks: ["formula.xiao_yao_san"], modalitiesPerformed: ["modality.acupuncture"], outcomeMetrics: [{ metricId: "metric.pain_score", valueNumber: 6 }] }),
    note({ visitDate: "2026-03-16", outcomeVerdict: "improved", acupointLinks: ["LI4", "SP6"], formulaLinks: ["formula.si_ni_san"], modalitiesPerformed: ["modality.acupuncture", "modality.cupping"], adverseEvents: [{ severity: "mild", nameText: "拔罐後瘀青", modalityId: "modality.cupping" }], outcomeMetrics: [{ metricId: "metric.pain_score", valueNumber: 5 }] }),
    note({ visitDate: "2026-03-23", outcomeVerdict: "improved", acupointLinks: ["LI4", "SP6"], modalitiesPerformed: ["modality.acupuncture"], outcomeMetrics: [{ metricId: "metric.pain_score", valueNumber: 4 }] }),
    note({ visitDate: "2026-03-30", outcomeVerdict: "improved", acupointLinks: ["LI4"], modalitiesPerformed: ["modality.acupuncture"], outcomeMetrics: [{ metricId: "metric.pain_score", valueNumber: 3 }, { metricId: "metric.mood", valueNumber: 7 }] }),
  ],
};

// 虛構病人 B:2 診,pain 5→4;sleep_hours 只在第一診測過一次(關鍵測項)
const caseB = {
  id: "case.B", patientCode: "FICT-B", caseTitle: "虛構:失眠",
  soapNotes: [
    note({ visitDate: "2026-03-05", acupointLinks: ["HT7"], formulaLinks: ["formula.gui_zhi_tang"], tcmPatternSelections: [{ patternId: "pattern.liver_qi_stagnation" }], outcomeMetrics: [{ metricId: "metric.pain_score", valueNumber: 5 }, { metricId: "metric.sleep_hours", valueNumber: 5 }] }),
    note({ visitDate: "2026-03-12", outcomeVerdict: "improved", acupointLinks: ["HT7"], outcomeMetrics: [{ metricId: "metric.pain_score", valueNumber: 4 }] }),
  ],
};

// 虛構病人 C:單次就診,沒有任何 outcome 記錄
const caseC = { id: "case.C", patientCode: "FICT-C", caseTitle: "虛構:單次", soapNotes: [note({ visitDate: "2026-03-20" })] };

const r = computePracticeAudit({ cases: [caseA, caseB, caseC], knowledge: KNOWLEDGE });

const checks = [];
const eq = (name, got, want) => checks.push([name, JSON.stringify(got) === JSON.stringify(want), `得到 ${JSON.stringify(got)},預期 ${JSON.stringify(want)}`]);
const ok = (name, cond, detail) => checks.push([name, !!cond, detail || ""]);

eq("病人數", r.volume.patients, 3);
eq("病例數", r.volume.cases, 3);
eq("就診數", r.volume.visits, 8);
eq("最早/最晚就診", [r.volume.firstVisitDate, r.volume.lastVisitDate], ["2026-03-02", "2026-03-30"]);
eq("回診率(2/3)", r.followUp.followUpRatePct, 66.7);
eq("單次就診病例", r.followUp.singleVisitCases, 1);
eq("verdict 覆蓋(6/8)", r.completeness.visitsWithVerdict, 6);
eq("有 outcome 數值的就診(7/8)", r.completeness.visitsWithMetric, 7);
eq("不良事件就診數", r.adverseEvents.visitsWithAe, 1);
eq("AE 嚴重度分佈", r.adverseEvents.bySeverity, { mild: 1 });
eq("AE 歸因處置", r.adverseEvents.byModality.map((m) => m.id), ["modality.cupping"]);
eq("最常用穴位第一名", r.mostUsed.points[0], { id: "LI4", name: "LI4", known: undefined, visits: 5, cases: 1 });
// id 要換成看得懂的名字,否則「少查一次」不成立
eq("最常用方劑顯示名稱而非 id", r.mostUsed.formulas.map((f) => f.name).sort(), ["四逆散", "桂枝湯", "逍遙散"]);
eq("最常用證型顯示名稱而非 id", r.mostUsed.patterns[0].name, "肝氣鬱結");
ok("穴位不被誤標成「知識庫沒有這張卡」(根本沒查表)",
   r.mostUsed.points.every((p) => p.known === undefined), JSON.stringify(r.mostUsed.points.slice(0, 2)));
// 病例用到知識庫沒有的東西 = 要標出來,那是資訊不是雜訊
const unknownCase = computePracticeAudit({
  cases: [{ id: "case.X", patientCode: "FICT-X", soapNotes: [note({ visitDate: "2026-04-01", formulaLinks: ["formula.not_in_library"] })] }],
  knowledge: KNOWLEDGE,
});
ok("用到知識庫沒有的方劑會被標 known:false",
   unknownCase.mostUsed.formulas[0].known === false, JSON.stringify(unknownCase.mostUsed.formulas[0]));

const pain = r.outcomeChanges.find((o) => o.metricId === "metric.pain_score");
const mood = r.outcomeChanges.find((o) => o.metricId === "metric.mood");
const sleep = r.outcomeChanges.find((o) => o.metricId === "metric.sleep_hours");

eq("疼痛:兩位病人都算得出變化", pain.casesMeasured, 2);
eq("疼痛中位數變化(-4 與 -1)", pain.medianChange, -2.5);
ok("疼痛帶得出具名來源", pain.interpretable && /Farrar/.test(pain.interpretationSource), pain.interpretationSource);
eq("情緒:一位病人", mood.casesMeasured, 1);
ok("情緒不可對照文獻", mood.interpretable === false && /無公認閾值/.test(mood.caveat), mood.caveat);

// 這一條是本測試最重要的:只測過一次 ≠ 沒有變化
ok("只測一次的睡眠時數不進統計(不能當成變化 0)", sleep === undefined,
   sleep ? `卻出現了 casesMeasured=${sleep.casesMeasured} medianChange=${sleep.medianChange}` : "");

/* 沒有具名來源的項目,不得出現任何肯定的臨床顯著性宣稱。
 *
 * 第一版把 caveat 也一起掃,結果抓到自己那句「不能換算成臨床顯著性」——
 * 一句否定被當成肯定。放寬 regex 是錯的解法(那等於整條檢查失效),
 * 正解是分成兩半各自嚴格檢查:
 *   caveat 欄位:必須恰好是預先寫死的警語之一,不准出現自由發揮的措辭
 *   其餘欄位:一個字的顯著性宣稱都不准 */
const SAFE_CAVEATS = [
  "無公認閾值:只能看同一位病人的趨勢,不能換算成臨床顯著性",
  "判讀來源待補:變化量僅供描述",
  "未標判讀狀態",
];
const notInterpretable = r.outcomeChanges.filter((o) => !o.interpretable);
ok("無來源項目的 caveat 只能用寫死的警語",
   notInterpretable.every((o) => SAFE_CAVEATS.includes(o.caveat)),
   notInterpretable.map((o) => o.caveat).join(" | "));
const otherFields = JSON.stringify(notInterpretable.map((o) => { const c = Object.assign({}, o); delete c.caveat; return c; }));
ok("無來源項目的其餘欄位沒有任何顯著性宣稱",
   !/clinically meaningful|significant|臨床顯著|有意義的改善|MCID/i.test(otherFields), otherFields.slice(0, 140));
ok("無來源項目不得帶出來源或判讀正文",
   notInterpretable.every((o) => !o.interpretationSource && !o.interpretationText),
   JSON.stringify(notInterpretable.map((o) => [o.interpretationSource, o.interpretationText])));

// 知識缺口:逍遙散(skeleton, 2 診)應排在四逆散(draft, 1 診)之前;
// 桂枝湯有來源,不該進缺口
const gapIds = r.knowledgeGaps.map((g) => g.id);
ok("缺口排序:用得多的骨架卡在前", gapIds[0] === "formula.xiao_yao_san", gapIds.join(" > "));
ok("有來源的卡不算缺口", !gapIds.includes("formula.gui_zhi_tang"), gapIds.join(" > "));
ok("證型卡也納入缺口", gapIds.includes("pattern.liver_qi_stagnation"), gapIds.join(" > "));

// 空輸入不能爆
let emptyOk = true;
try { computePracticeAudit({ cases: [], knowledge: KNOWLEDGE }); computePracticeAudit({}); } catch (e) { emptyOk = false; }
ok("空輸入不爆", emptyOk);

let failed = 0;
for (const [name, pass, detail] of checks) {
  console.log(`  ${pass ? "PASS" : "FAIL"} — ${name}${pass || !detail ? "" : `\n         ${detail}`}`);
  if (!pass) failed++;
}
console.log(`\n${failed ? `FAIL — ${failed}/${checks.length}` : `PASS — ${checks.length}/${checks.length}`}`);
process.exit(failed ? 1 : 0);
