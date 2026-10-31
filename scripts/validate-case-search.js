#!/usr/bin/env node
/**
 * validate-case-search.js — 病例頁「病人列表 + 搜尋 + 篩選 + 標籤」的行為真值表。
 *
 * 測的是 js/case-search.js 真正在跑的那份程式(require 進來,不是複製邏輯),
 * 餵虛構病例(永遠不用真實病歷),斷言輸出。任何一條斷言失敗就 exit 1。
 *
 * 守的是改版時 Ting 明確要的行為:
 *   - 一個 patientCode 一列;沒有代號的病例不被湊成同一人
 *   - 代號/病例名稱命中排在內文命中之前,內文命中要說出「哪一診、哪個欄位」
 *   - 多個詞是 AND
 *   - 關注度/系統/診所/紅旗/日期未填/最近 N 天 篩選
 *   - 空的標籤是「未設定」:不顯示成任何一層,但「一般」篩選要收得到它
 *   - ATG-1984F 代號解析,格式不符回 null(不猜)
 *
 * 用法:node scripts/validate-case-search.js
 */
"use strict";
const path = require("path");
const S = require(path.join(__dirname, "..", "js", "case-search.js"));

const TODAY = new Date(2026, 9, 31); // 2026-10-31(本機時區)
const note = (date, extra) => Object.assign({ id: "n" + Math.random().toString(36).slice(2, 7), visitDate: date, soapNotes: undefined }, extra);
const CASES = [
  { id: "c1", patientCode: "ALW-1988F", caseTitle: "慢性失眠", status: "active", chiefComplaint: "入睡困難", tcmPatterns: ["心脾兩虛"],
    attentionTier: "focus", attentionSince: "2026-09-01", icpcChapters: ["P"], careContexts: [], clinicSite: "bastyr", safetyFlags: [],
    soapNotes: [note("2026-10-28", { visitNumber: 3, pointsUsed: "HT7 SP6 PC6", formulaHerbs: "歸脾湯" }), note("2026-10-20", { visitNumber: 2 })] },
  { id: "c2", patientCode: "WJD-1975M", caseTitle: "下背痛", status: "active", chiefComplaint: "右下背痛放射", westernConditions: ["Lumbar radiculopathy"],
    attentionTier: "routine", icpcChapters: ["L", "N"], careContexts: ["chronic_pain"], clinicSite: "external", safetyFlags: ["抗凝血劑 warfarin"],
    soapNotes: [note("2026-10-30", { visitNumber: 2, pointsUsed: "BL23 GB30" }), note("", { visitNumber: 1, subjective: "初診 NRS 7" })] },
  { id: "c3", patientCode: "ACH-1990F", caseTitle: "IVF 輔助", status: "active", chiefComplaint: "第二次 IVF", attentionTier: "focus",
    attentionSince: "2026-08-01", icpcChapters: ["W"], careContexts: ["fertility"], clinicSite: "bastyr",
    soapNotes: [note("2026-10-26", { visitNumber: 1, pointsUsed: "CV4 SP6 Zigong" })] },
  { id: "c4", patientCode: "ACH-1990F", caseTitle: "經前頭痛", status: "closed", chiefComplaint: "經前頭痛", attentionTier: "routine",
    icpcChapters: ["N"], soapNotes: [note("2026-05-01", { visitNumber: 1, pointsUsed: "LR3 GB20" })] },
  { id: "c5", patientCode: "WLC-1971F", caseTitle: "化療後周邊神經病變", status: "active", chiefComplaint: "手腳麻木", attentionTier: "complex",
    icpcChapters: ["N", "X"], careContexts: ["oncology"], clinicSite: "bastyr", safetyFlags: ["血小板偏低"],
    soapNotes: [note("2026-10-27", { visitNumber: 2, assessment: "氣血兩虛 絡脈瘀阻" })] },
  { id: "c6", patientCode: "BDH-1993F", caseTitle: "焦慮心悸", status: "active", chiefComplaint: "心悸", // 沒有任何標籤 = 未設定
    soapNotes: [note("", { subjective: "(匯入舊紀錄)" })] },
  { id: "c7", patientCode: "", caseTitle: "無代號 A", status: "active", soapNotes: [] },
  { id: "c8", patientCode: "", caseTitle: "無代號 B", status: "active", soapNotes: [] },
];

const failures = [];
const check = (name, fn) => {
  let ok = false, detail = "";
  try { const r = fn(); ok = r === true; if (r !== true && r !== false) detail = JSON.stringify(r); } catch (e) { detail = e.message; }
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${name}${ok || !detail ? "" : "  → " + detail}`);
  if (!ok) failures.push(name);
};
const codes = (rows) => rows.map((x) => x.patient.patientCode || x.patient.key);
const list = (o) => S.buildPatientList(CASES, Object.assign({ today: TODAY, sort: "tier" }, o));

console.log("分組");
const patients = S.groupCasesByPatient(CASES);
check("8 個病例 → 7 列(同代號兩病例合一列,兩個無代號病例各自一列)", () => patients.length === 7);
check("無代號病例不會被湊成同一人", () => patients.filter((p) => !p.patientCode).length === 2);
const ach = patients.find((p) => p.patientCode === "ACH-1990F");
check("同一人兩病例:主要病例是治療中那個", () => ach.primaryCaseId === "c3");
check("同一人兩病例:關注度取治療中病例的(重點),不被結案病例的一般蓋掉", () => ach.tier === "focus");
check("系統章節取聯集", () => ach.icpc.sort().join() === "N,W");
check("就診數與未填日期數", () => { const w = patients.find((p) => p.patientCode === "WJD-1975M"); return w.visitCount === 2 && w.undatedCount === 1 && w.lastVisit === "2026-10-30"; });
check("沒有標籤的病人:tier 是空字串(未設定),不是被補成一般", () => patients.find((p) => p.patientCode === "BDH-1993F").tier === "");

console.log("搜尋");
check("空查詢 → 全部在 identity 組,content 組為空", () => { const r = list({}); return r.identity.length === 7 && r.content.length === 0; });
check("代號片段命中 → identity 組", () => { const r = list({ query: "ach" }); return codes(r.identity).join() === "ACH-1990F" && !r.content.length; });
check("病例名稱命中 → identity 組", () => codes(list({ query: "失眠" }).identity).join() === "ALW-1988F");
check("穴位 SP6 → content 組 2 位(ALW、ACH),不在 identity", () => { const r = list({ query: "sp6" }); return !r.identity.length && codes(r.content).sort().join() === "ACH-1990F,ALW-1988F"; });
check("內文命中要說出欄位與哪一診", () => { const h = list({ query: "歸脾" }).content[0].hit; return h && h.label === "方藥" && /第 3 診/.test(h.where); });
check("多詞 AND:SP6 + 失眠 只剩 ALW", () => { const r = list({ query: "SP6 失眠" }); return [...codes(r.identity), ...codes(r.content)].join() === "ALW-1988F"; });
check("多詞 AND:說明列指向身分欄沒中的那個詞", () => { const h = list({ query: "失眠 歸脾" }).content[0].hit; return h && h.label === "方藥"; });
check("紅旗內容可搜", () => codes(list({ query: "warfarin" }).content).join() === "WJD-1975M");
check("標籤可搜(腫瘤)", () => codes(list({ query: "腫瘤" }).content).join() === "WLC-1971F");
check("查無 → total 0", () => list({ query: "zzzz" }).total === 0);

console.log("篩選");
check("關注度=重點 → ALW、ACH", () => codes(list({ filters: { tier: "focus" } }).identity).sort().join() === "ACH-1990F,ALW-1988F");
check("關注度=一般 → 收得到「未設定」的病人", () => codes(list({ filters: { tier: "routine" } }).identity).includes("BDH-1993F"));
check("關注度=疑難 → WLC", () => codes(list({ filters: { tier: "complex" } }).identity).join() === "WLC-1971F");
check("系統=N → WJD、ACH、WLC", () => codes(list({ filters: { icpc: "N" } }).identity).sort().join() === "ACH-1990F,WJD-1975M,WLC-1971F");
check("診所=external → WJD", () => codes(list({ filters: { clinic: "external" } }).identity).join() === "WJD-1975M");
check("有紅旗 → WJD、WLC", () => codes(list({ filters: { flagged: true } }).identity).sort().join() === "WJD-1975M,WLC-1971F");
check("日期未填 → WJD、BDH", () => codes(list({ filters: { undated: true } }).identity).sort().join() === "BDH-1993F,WJD-1975M");
check("最近 3 天內就診 → ALW(10/28)、WJD(10/30)", () => codes(list({ filters: { recentDays: 3 } }).identity).sort().join() === "ALW-1988F,WJD-1975M");
check("篩選掉的人數有回報(讓空畫面講得出原因)", () => list({ filters: { tier: "complex" } }).hiddenByFilters === 6);
check("搜尋 + 篩選同時生效", () => list({ query: "sp6", filters: { tier: "focus", clinic: "bastyr" } }).content.length === 2);

console.log("排序");
check("重點優先:重點 → 疑難 → 一般/未設定", () => { const t = list({ sort: "tier" }).identity.map((x) => x.patient.tier || "routine"); return t.join() === "focus,focus,complex,routine,routine,routine,routine"; });
check("重點優先內部再依最近就診:ALW(10/28) 在 ACH(10/26) 前", () => codes(list({ sort: "tier" }).identity).slice(0, 2).join() === "ALW-1988F,ACH-1990F");
check("最近就診:WJD(10/30) 第一", () => codes(list({ sort: "recent" }).identity)[0] === "WJD-1975M");

console.log("代號解析");
check("ATG-1984F → A / TG / 1984 / F", () => { const p = S.parsePatientCode("ATG-1984F"); return p && p.ethnicityLetter === "A" && p.initials === "TG" && p.birthYear === 1984 && p.sex === "F"; });
check("小寫也收", () => S.parsePatientCode("wjd-1975m").sex === "M");
check("舊格式代號 → null(不猜)", () => S.parsePatientCode("ATG F42") === null && S.parsePatientCode("P-2026-014") === null && S.parsePatientCode("ABC") === null);
check("未來的出生年 → null", () => S.parsePatientCode("ATG-2999F") === null);

console.log("重點輪替提醒");
check("標了 91 天 → 要提醒", () => S.focusNeedsReview("2026-08-01", TODAY) === true);
check("標了 60 天以內的 30 天 → 不提醒", () => S.focusNeedsReview("2026-10-01", TODAY) === false);
check("沒有日期 → 不提醒(不猜)", () => S.focusNeedsReview("", TODAY) === false);

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} 項`);
  process.exit(1);
}
console.log(`\nPASS — 病人分組、兩組搜尋、篩選、排序、代號解析都照規格。`);
