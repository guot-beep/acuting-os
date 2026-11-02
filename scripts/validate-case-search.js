#!/usr/bin/env node
/**
 * validate-case-search.js — 病例頁「病人列表 + 搜尋 + 篩選 + 標籤」的行為真值表。
 *
 * 測的是 js/case-search.js 真正在跑的那份程式(require 進來,不是複製邏輯),
 * 餵虛構病例(永遠不用真實病歷),斷言輸出。任何一條斷言失敗就 exit 1。
 *
 * 守的是 Ting 明確要的行為:
 *   - 一個 patientCode 一列;沒有代號的病例不被湊成同一人
 *   - 代號/病例名稱命中排在內文命中之前,內文命中要說出「哪一診、哪個欄位」
 *   - 多個詞是 AND
 *   - 標題統一格式 [★] [AQZ] [F/41] [主❤️] [次❤️] [🌙](11/02 Labeling Standard)
 *     星星、月亮沒確認過不顯示;年齡從出生年算、不寫進代號;次分類最多 2 個、不重複主分類
 *   - ❤️ / ★ / 🌙 / 診所 / 紅旗 / 日期未填 / 未分類 / 最近 N 天 篩選
 *   - 分類建議只給建議與理由;不建議 🖤 複雜
 *   - 顯示代號批次設定只寫 displayCode、不碰 patientCode;格式錯擋、同代號只提示
 *
 * 用法:node scripts/validate-case-search.js
 */
"use strict";
const path = require("path");
const S = require(path.join(__dirname, "..", "js", "case-search.js"));

const TODAY = new Date(2026, 9, 31); // 2026-10-31(本機時區)
const note = (date, extra) => Object.assign({ id: "n" + Math.random().toString(36).slice(2, 7), visitDate: date }, extra);
const CASES = [
  { id: "c1", patientCode: "PT-0001", displayCode: "ALW", caseTitle: "慢性失眠", status: "active", chiefComplaint: "入睡困難", tcmPatterns: ["心脾兩虛"],
    sex: "F", birthYear: 1988, caseHighlight: "important", treatmentStage: "active", categoryPrimary: "mental_sleep",
    categorySecondary: ["gi_metabolic"], careContexts: [], clinicSite: "bastyr", safetyFlags: [],
    soapNotes: [note("2026-10-28", { visitNumber: 3, pointsUsed: "HT7 SP6 PC6", formulaHerbs: "歸脾湯" }), note("2026-10-20", { visitNumber: 2 })] },
  { id: "c2", patientCode: "PT-0002", displayCode: "wjd", caseTitle: "下背痛", status: "active", chiefComplaint: "右下背痛放射", westernConditions: ["Lumbar radiculopathy"],
    sex: "M", caseHighlight: "routine", categoryPrimary: "musculoskeletal", careContexts: ["chronic_pain"], clinicSite: "external", safetyFlags: ["抗凝血劑 warfarin"],
    soapNotes: [note("2026-10-30", { visitNumber: 2, pointsUsed: "BL23 GB30" }), note("", { visitNumber: 1, subjective: "初診 NRS 7" })] },
  { id: "c3", patientCode: "PT-0003", displayCode: "ACH", caseTitle: "IVF 輔助", status: "active", chiefComplaint: "第二次 IVF",
    sex: "F", birthYearMonth: "1990-12", caseHighlight: "notable", treatmentStage: "new", categoryPrimary: "womens_health",
    categorySecondary: ["womens_health", "mental_sleep", "neuro_ent", "gi_metabolic"], careContexts: ["fertility"], clinicSite: "bastyr",
    soapNotes: [note("2026-10-26", { visitNumber: 1, pointsUsed: "CV4 SP6 Zigong" })] },
  { id: "c4", patientCode: "PT-0003", caseTitle: "經前頭痛", status: "closed", treatmentStage: "closed", chiefComplaint: "經前頭痛",
    caseHighlight: "routine", categoryPrimary: "neuro_ent", soapNotes: [note("2026-05-01", { visitNumber: 1, pointsUsed: "LR3 GB20" })] },
  { id: "c5", patientCode: "PT-0005", displayCode: "WLC", caseTitle: "化療後周邊神經病變", status: "active", chiefComplaint: "手腳麻木",
    sex: "Other", birthYear: 1971, treatmentStage: "followup", categoryPrimary: "complex", careContexts: ["oncology"], clinicSite: "bastyr", safetyFlags: ["血小板偏低"],
    soapNotes: [note("2026-10-27", { visitNumber: 2, assessment: "氣血兩虛 絡脈瘀阻" })] },
  { id: "c6", patientCode: "PT-0006", caseTitle: "焦慮心悸", status: "active", chiefComplaint: "心悸", // 沒有任何標籤 = 未設定
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
const list = (o) => S.buildPatientList(CASES, Object.assign({ today: TODAY, sort: "highlight" }, o));

console.log("分組");
const patients = S.groupCasesByPatient(CASES, TODAY);
const P = (code) => patients.find((p) => p.patientCode === code);
check("8 個病例 → 7 列(同代號兩病例合一列,兩個無代號病例各自一列)", () => patients.length === 7);
check("無代號病例不會被湊成同一人", () => patients.filter((p) => !p.patientCode).length === 2);
check("同一人兩病例:主要病例是治療中(初診)那個", () => P("PT-0003").primaryCaseId === "c3");
check("同一人兩病例:❤️ 篩選看全部病例的主+次分類(次分類超過 2 個的第 3 個不算)", () => P("PT-0003").categories.sort().join() === "mental_sleep,neuro_ent,womens_health");
check("同一人兩病例:★ 取最高那顆(療效 > 一般)", () => P("PT-0003").highlight === "notable");
check("就診數與未填日期數", () => { const w = P("PT-0002"); return w.visitCount === 2 && w.undatedCount === 1 && w.lastVisit === "2026-10-30"; });
check("沒有標籤的病人:★/❤️/🌙 都是空字串(未設定),不是被補成一般/治療中", () => { const b = P("PT-0006"); return b.highlight === "" && b.category === "" && b.stage === ""; });

console.log("標題格式 [★] [AQZ] [F/41] [主❤️] [次❤️] [🌙]");
check("完整:★ ALW F/38 💜 💛 🌓", () => S.caseLabelText(CASES[0], TODAY) === "★ ALW F/38 💜 💛 🌓");
check("顯示代號小寫 → 大寫", () => S.caseLabel(CASES[1], TODAY).displayCode === "WJD");
check("沒確認治療進度 → 不畫月亮(舊 status=active 不算數)", () => S.caseLabelText(CASES[1], TODAY) === "☆ WJD M 🧡");
check("有出生年月 → 算到月:1990-12 在 2026-10 是 35 歲", () => S.ageOf(CASES[2], TODAY) === 35);
check("只有出生年 → 年相減", () => S.ageOf(CASES[0], TODAY) === 38);
check("沒有生日 → 不顯示年齡,只顯示性別", () => S.sexAgeLabel(CASES[1], TODAY) === "M");
check("性別 Other → X", () => S.sexAgeLabel(CASES[4], TODAY) === "X/55");
check("次分類:去掉跟主分類相同的、最多 2 個", () => S.caseLabel(CASES[2], TODAY).secondary.join() === "mental_sleep,neuro_ent");
check("沒有任何標籤 → 標題是空字串(畫面只顯示主訴)", () => S.caseLabelText(CASES[5], TODAY) === "");
check("中文性別也認得(女)", () => S.sexLetterOf({ sex: "女" }) === "F" && S.sexLetterOf({ sex: "不詳" }) === "");

console.log("搜尋");
check("空查詢 → 全部在 identity 組,content 組為空", () => { const r = list({}); return r.identity.length === 7 && r.content.length === 0; });
check("顯示代號命中 → identity 組", () => { const r = list({ query: "ach" }); return codes(r.identity).join() === "PT-0003" && !r.content.length; });
check("病人編號命中 → identity 組", () => codes(list({ query: "pt-0005" }).identity).join() === "PT-0005");
check("病例名稱命中 → identity 組", () => codes(list({ query: "失眠" }).identity).join() === "PT-0001");
check("穴位 SP6 → content 組 2 位,不在 identity", () => { const r = list({ query: "sp6" }); return !r.identity.length && codes(r.content).sort().join() === "PT-0001,PT-0003"; });
check("內文命中要說出欄位與哪一診", () => { const h = list({ query: "歸脾" }).content[0].hit; return h && h.label === "方藥" && /第 3 診/.test(h.where); });
check("多詞 AND:SP6 + 失眠 只剩 ALW", () => { const r = list({ query: "SP6 失眠" }); return [...codes(r.identity), ...codes(r.content)].join() === "PT-0001"; });
check("紅旗內容可搜", () => codes(list({ query: "warfarin" }).content).join() === "PT-0002");
check("標籤可搜(情緒/睡眠)", () => codes(list({ query: "睡眠" }).content).join() === "PT-0001,PT-0003");
check("查無 → total 0", () => list({ query: "zzzz" }).total === 0);

console.log("篩選");
check("★ 重要 → ALW", () => codes(list({ filters: { highlight: "important" } }).identity).join() === "PT-0001");
check("☆ 一般 → 只收她標了一般的(WJD),不收未標", () => codes(list({ filters: { highlight: "routine" } }).identity).join() === "PT-0002");
check("★ 未標 → 找得到沒標過的", () => codes(list({ filters: { highlight: "unset" } }).identity).includes("PT-0006"));
check("❤️ 婦科 → ACH", () => codes(list({ filters: { category: "womens_health" } }).identity).join() === "PT-0003");
check("❤️ 神經:次分類 / 同人另一病例也算 → ACH", () => codes(list({ filters: { category: "neuro_ent" } }).identity).join() === "PT-0003");
check("🌙 待追蹤 → WLC", () => codes(list({ filters: { stage: "followup" } }).identity).join() === "PT-0005");
check("🌙 結案:同人另一病例結案也找得到", () => codes(list({ filters: { stage: "closed" } }).identity).join() === "PT-0003");
check("🌙 未確認 → 收得到 WJD(舊 status=active 但沒確認)", () => codes(list({ filters: { stage: "unset" } }).identity).includes("PT-0002"));
check("診所=external → WJD", () => codes(list({ filters: { clinic: "external" } }).identity).join() === "PT-0002");
check("有紅旗 → WJD、WLC", () => codes(list({ filters: { flagged: true } }).identity).sort().join() === "PT-0002,PT-0005");
check("日期未填 → WJD、PT-0006", () => codes(list({ filters: { undated: true } }).identity).sort().join() === "PT-0002,PT-0006");
check("最近 3 天內就診 → ALW(10/28)、WJD(10/30)", () => codes(list({ filters: { recentDays: 3 } }).identity).sort().join() === "PT-0001,PT-0002");
check("篩選掉的人數有回報", () => list({ filters: { highlight: "important" } }).hiddenByFilters === 6);
check("未分類(沒主❤️)→ PT-0006 與兩個無代號病例", () => { const r = list({ filters: { untagged: true } }); return r.identity.length === 3 && codes(r.identity).includes("PT-0006"); });
check("未分類人數不受篩選影響", () => list({ filters: { highlight: "important" } }).untaggedCount === 3);
check("搜尋 + 篩選同時生效", () => list({ query: "sp6", filters: { category: "womens_health" } }).content.length === 1);

console.log("排序");
check("★ 優先:重要 → 療效 → 一般 → 未標", () => { const t = list({}).identity.map((x) => x.patient.highlight || "-"); return t.join() === "important,notable,routine,-,-,-,-"; });
check("最近就診:WJD(10/30) 第一", () => codes(list({ sort: "recent" }).identity)[0] === "PT-0002");
check("舊排序鍵 tier 照樣能用", () => codes(list({ sort: "tier" }).identity)[0] === "PT-0001");

console.log("分類建議");
const sug = (cc) => S.suggestCategories({ chiefComplaint: cc }).map((x) => x.code);
check("下背痛 + 坐骨神經痛 → 只有 🧡(「神經」「經痛」不誤中婦科/神經)", () => sug("右下背痛放射至小腿,坐骨神經痛").join() === "musculoskeletal");
check("糖尿病 → 💛,不誤中泌尿(糖尿病含「尿」)", () => sug("糖尿病控制不佳").join() === "gi_metabolic");
check("入睡困難 → 💜", () => sug("入睡困難 6 個月").join() === "mental_sleep");
check("多類命中 → 依命中數排,全部列出讓她選", () => sug("打呼、過敏及睡眠受干擾").join() === "respiratory_immune,mental_sleep");
check("建議附命中的字(理由)", () => S.suggestCategories({ chiefComplaint: "經前頭痛" }).every((x) => x.hits.length > 0));
check("沒中 → 空(不硬給)", () => sug("xyz").length === 0);
check("不會建議 🖤 複雜", () => !sug("中風 糖尿病 失明 腰痛 失眠 心悸").includes("complex"));

console.log("顯示代號");
check("AQZ → A / QZ / 亞洲", () => { const p = S.parseDisplayCode("AQZ"); return p && p.ethnicityLetter === "A" && p.initials === "QZ" && /Asian/.test(p.ethnicity); });
check("小寫、空白、點都收:a c.l → AQZ", () => S.parseDisplayCode("a q.z").code === "AQZ");
check("含數字或太長 → null(不猜)", () => S.parseDisplayCode("AQZ50") === null && S.parseDisplayCode("ABCDEFG") === null && S.parseDisplayCode("A") === null);

console.log("顯示代號批次設定(只寫 displayCode,不碰 patientCode)");
const MIG = [
  { id: "m1", patientCode: "OLD1", caseTitle: "鼻炎" },
  { id: "m2", patientCode: "OLD1", caseTitle: "頭痛" },
  { id: "m3", patientCode: "OLD2", displayCode: "AXY", caseTitle: "腰痛" },
  { id: "m4", patientCode: "", caseTitle: "無代號" },
];
const keyOf = (code) => "code:" + code;
const plan = (m) => S.planDisplayCodes(MIG, m);
check("沒填 = 不動", () => plan({}).changes.length === 0 && plan({}).blocked === 0);
check("同一人兩病例一起設(caseIds 2 筆),小寫正規化", () => { const c = plan({ [keyOf("OLD1")]: "aqz" }).changes[0]; return c.newCode === "AQZ" && c.caseIds.length === 2; });
check("跟現在一樣 → 不算變更", () => plan({ [keyOf("OLD2")]: "axy" }).changes.length === 0);
check("格式錯 → 擋住", () => plan({ [keyOf("OLD1")]: "AQZ50" }).blocked === 1);
check("族群字母不在 A/B/W/M → 只警告", () => { const p = plan({ [keyOf("OLD1")]: "ZCL" }); return p.blocked === 0 && /族群字母/.test(p.changes[0].warnings.join()); });
check("同代號 → 只提示,不擋", () => { const p = plan({ [keyOf("OLD1")]: "AXY" }); return p.blocked === 0 && /另有病人/.test(p.changes[0].warnings.join()); });
check("沒有病人編號的病例也能設(以病例為單位)", () => plan({ "case:m4": "BQR" }).changes.length === 1);
check("套用:只寫 displayCode,patientCode 一個字都不變、不改原陣列", () => {
  const out = S.applyDisplayCodes(MIG, plan({ [keyOf("OLD1")]: "AQZ" }));
  return out.filter((c) => c.displayCode === "AQZ").length === 2 && out.every((c, i) => c.patientCode === MIG[i].patientCode) && !MIG[0].displayCode && out[2] === MIG[2];
});
check("有錯誤時套用一律拒絕", () => { try { S.applyDisplayCodes(MIG, plan({ [keyOf("OLD1")]: "1" })); return false; } catch (e) { return true; } });

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} 項`);
  process.exit(1);
}
console.log(`\nPASS — 病人分組、兩組搜尋、標題格式、❤️/★/🌙 篩選、排序、分類建議、顯示代號都照規格。`);
