#!/usr/bin/env node
/**
 * validate-visit-handoff.js — 「就診交接」匯入(js/visit-handoff.js)的行為真值表。
 *
 * require 真正在跑的模組,餵虛構病例(永遠不用真實病歷),斷言輸出。任一條失敗 exit 1。
 * 守的規則:
 *   - 只 append,不覆蓋:既有 SOAP 一筆不少、既有病例欄位不被改寫(只補空白,可關)
 *   - 候選代號在系統裡找得到才接上;找不到 / 沒代號 → 不自動建立
 *   - 配對先比病人編號、再比顯示代號(只有一位才算);新病人要顯示代號(AQZ)+ 明確勾「建立」,
 *     永久病人編號由系統產生,不是縮寫
 *   - 同日已有 SOAP → 預設不匯;同一筆交接匯過 → 不再匯
 *   - 安全旗標只併入新的
 *
 * 用法:node scripts/validate-visit-handoff.js
 */
"use strict";
const path = require("path");
const H = require(path.join(__dirname, "..", "js", "visit-handoff.js"));

const CASES = [
  { id: "c1", patientCode: "HQ", caseTitle: "腿痛", status: "active", sex: "F", historyPresent: "既有病史", birthYear: "",
    safetyFlags: ["既有旗標"], soapNotes: [{ id: "n1", visitDate: "" }, { id: "n2", visitDate: "2026-10-20" }] },
  { id: "c2", patientCode: "DUP", caseTitle: "舊病例", status: "closed", soapNotes: [{ id: "n3", visitDate: "2026-01-01" }] },
  { id: "c3", patientCode: "DUP", caseTitle: "現在的病例", status: "active", soapNotes: [{ id: "n4", visitDate: "2026-10-29" }] },
  { id: "c4", patientCode: "PT-K7Q2", displayCode: "WJD", caseTitle: "有顯示代號", status: "active", soapNotes: [] },
  { id: "c5", patientCode: "PT-M3X9", displayCode: "ATT", caseTitle: "同顯示代號之一", status: "active", soapNotes: [] },
  { id: "c6", patientCode: "PT-Z8R1", displayCode: "att", caseTitle: "同顯示代號之二", status: "active", soapNotes: [] },
];
const NEWCASE = { caseTitle: "新問題", sex: "女", birthYear: 1992, chiefComplaint: "腰痛", historyPresent: "新病史", pastHistory: "新既往史" };
const ITEMS = [
  { ref: "r01", patientCode: "HQ", safetyFlags: ["既有旗標", "新旗標"], newCase: NEWCASE, note: { visitDate: "2026-10-29", subjective: "S1" } },
  { ref: "r02", patientCode: "", newCase: NEWCASE, note: { visitDate: "2026-10-31", subjective: "S2" } },
  { ref: "r03", patientCode: "ZZ", newCase: NEWCASE, note: { visitDate: "2026-10-29", subjective: "S3" } },
  { ref: "r04", patientCode: "DUP", newCase: NEWCASE, note: { visitDate: "2026-10-29", subjective: "S4" } },
  { ref: "r05", patientCode: "HQ", newCase: NEWCASE, note: { visitDate: "2026-10-20", subjective: "S5" } },
];
const doc = { schema: H.SCHEMA, items: ITEMS };

const failures = [];
const check = (name, fn) => {
  let ok = false, detail = "";
  try { const r = fn(); ok = r === true; if (r !== true && r !== false) detail = JSON.stringify(r); } catch (e) { detail = e.message; }
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${name}${ok || !detail ? "" : "  → " + detail}`);
  if (!ok) failures.push(name);
};
const plan = (choices) => H.planHandoff(CASES, ITEMS, choices);
const row = (p, ref) => p.rows.find((r) => r.ref === ref);

console.log("讀檔");
check("schema 對才收", () => H.parseHandoff(doc).items.length === 5);
check("schema 錯 → 拒絕", () => { try { H.parseHandoff({ items: [] }); return false; } catch (e) { return true; } });
check("ref 重複 → 拒絕", () => { try { H.parseHandoff({ schema: H.SCHEMA, items: [ITEMS[0], ITEMS[0]] }); return false; } catch (e) { return true; } });

console.log("配對");
const p0 = plan({});
check("候選代號在系統裡 → 接到既有病例", () => row(p0, "r01").status === "append" && row(p0, "r01").targetCaseId === "c1" && row(p0, "r01").include);
check("沒有代號 → 等她填,不匯", () => row(p0, "r02").status === "needs_code" && !row(p0, "r02").include);
check("候選代號系統裡沒有 → 不自動建立", () => row(p0, "r03").status === "new_patient" && !row(p0, "r03").include && row(p0, "r03").errors.length === 1);
check("同一人多病例 → 預設接到治療中那個", () => row(p0, "r04").targetCaseId === "c3");
check("同一人多病例 → 可改接到另一個", () => row(plan({ r04: { caseId: "c2" } }), "r04").targetCaseId === "c2");
check("同日已有 SOAP → 標出來、預設不匯", () => row(p0, "r05").sameDate && !row(p0, "r05").include);
check("同日已有 SOAP → 她勾了才匯", () => row(plan({ r05: { include: true } }), "r05").include);
check("接到的那個病例同日有 SOAP 才算(r04 接 c3 同日 → 擋;改接 c2 → 不擋)", () => row(p0, "r04").sameDate && !row(plan({ r04: { caseId: "c2" } }), "r04").sameDate);

console.log("顯示代號配對");
check("填顯示代號、剛好一位病人 → 接到那位(列上顯示的是他的病人編號)", () => { const r = row(plan({ r02: { code: "wjd" } }), "r02"); return r.status === "append" && r.targetCaseId === "c4" && r.code === "PT-K7Q2"; });
check("填顯示代號、兩位病人同代號 → 不猜,要她改填病人編號", () => { const r = row(plan({ r02: { code: "ATT", createNew: true } }), "r02"); return r.status === "ambiguous" && !r.include && /PT-M3X9/.test(r.errors[0]); });
check("填病人編號 → 直接接上", () => row(plan({ r02: { code: "PT-M3X9" } }), "r02").targetCaseId === "c5");

console.log("新病人");
check("填了含數字的代號 → 錯誤、不匯", () => { const r = row(plan({ r02: { code: "AXM92", createNew: true } }), "r02"); return r.errors.length > 0 && !r.include; });
check("填了顯示代號但沒勾建立 → 不匯", () => !row(plan({ r02: { code: "axm" } }), "r02").include);
check("顯示代號 + 勾建立 → 匯,代號正規化成大寫", () => { const r = row(plan({ r02: { code: "a x m", createNew: true } }), "r02"); return r.include && r.code === "AXM"; });
check("兩筆新病人同一個顯示代號 → 不擋,但提醒可能是同一人", () => { const p = plan({ r02: { code: "AXM", createNew: true }, r03: { code: "AXM", createNew: true } }); return row(p, "r02").include && row(p, "r03").include && /同一人/.test(row(p, "r02").warnings.join()); });

console.log("寫入(只加不蓋)");
const pA = plan({ r02: { code: "AXM", createNew: true } });
const out = H.applyHandoff(CASES, ITEMS, pA, "2026-11-02T00:00:00.000Z", (ref, i) => ["PT-K7Q2", "PT-NEW1"][i]);
const c1 = out.find((c) => c.id === "c1");
check("既有 SOAP 一筆不少,新的接在後面", () => c1.soapNotes.length === 3 && c1.soapNotes[0].id === "n1" && c1.soapNotes[2].subjective === "S1");
check("新 SOAP id 由 ref 決定(重匯可辨識)", () => c1.soapNotes[2].id === H.noteIdFor("r01"));
check("既有欄位不覆蓋(historyPresent、sex 保留原值)", () => c1.historyPresent === "既有病史" && c1.sex === "F");
check("空白欄位補上(birthYear、pastHistory)", () => c1.birthYear === 1992 && c1.pastHistory === "新既往史");
check("補空白可關掉", () => { const o = H.applyHandoff(CASES, ITEMS, plan({ r01: { fillEmpty: false } })); const c = o.find((x) => x.id === "c1"); return !c.pastHistory && c.soapNotes.length === 3; });
check("安全旗標只併入新的", () => c1.safetyFlags.join() === "既有旗標,新旗標");
check("新病人建立一個病例、帶這次就診;顯示代號 AXM", () => { const c = out.find((x) => x.id === H.caseIdFor("r02")); return c && c.displayCode === "AXM" && c.soapNotes.length === 1 && c.caseTitle === "新問題"; });
check("新病人的永久編號由系統給、跟現有編號撞到就換一個,不是縮寫", () => { const c = out.find((x) => x.id === H.caseIdFor("r02")); return c.patientCode === "PT-NEW1" && c.patientCode !== c.displayCode; });
check("產生不出編號 → 整筆拒絕(不寫半套)", () => { try { H.applyHandoff(CASES, ITEMS, pA, "", () => "PT-K7Q2"); return false; } catch (e) { return true; } });
check("沒勾的列一律不動(r03、r05)", () => out.length === CASES.length + 1 && !out.some((c) => (c.soapNotes || []).some((n) => n.subjective === "S5" || n.subjective === "S3")));
check("不改原陣列", () => CASES[0].soapNotes.length === 2 && !CASES[0].pastHistory);
check("匯過一次 → 再預覽就是「已匯入」", () => { const p = H.planHandoff(out, ITEMS, {}); return row(p, "r01").status === "already_imported" && row(p, "r02").status === "already_imported" && !p.toApply.some((r) => r.ref === "r01"); });

console.log("只補標註(沒有 note、只有 labels;2026-11-05)");
const LC = [
  { id: "L1", patientCode: "OLDA", caseTitle: "腰痛", status: "active", categoryPrimary: "", categorySecondary: [], soapNotes: [{ id: "x1", visitDate: "2026-10-01" }] },
  { id: "L2", patientCode: "OLDA", caseTitle: "舊病例", status: "closed", soapNotes: [] },
  { id: "L3", patientCode: "OLDB", displayCode: "WQB", caseTitle: "已標過", status: "active", categoryPrimary: "mental_sleep", categorySecondary: [], treatmentStage: "followup", birthYear: 1970, soapNotes: [] },
  { id: "L4", patientCode: "OLDC", displayCode: "AQZ", caseTitle: "另一位", status: "active", soapNotes: [] },
];
const LI = [
  { ref: "L-a", patientCode: "OLDA", labels: { displayCode: "a q z", categoryPrimary: "musculoskeletal", categorySecondary: ["gi_metabolic"], treatmentStage: "active", birthYear: 1950 } },
  { ref: "L-b", patientCode: "OLDB", labels: { displayCode: "WQX", categoryPrimary: "musculoskeletal", categorySecondary: ["neuro_ent"], treatmentStage: "active", caseHighlight: "important" } },
  { ref: "L-c", patientCode: "NOPE", labels: { categoryPrimary: "musculoskeletal" } },
  { ref: "L-d", patientCode: "OLDC", labels: { categoryPrimary: "heart", treatmentStage: "soon" } },
  { ref: "L-e", patientCode: "OLDC", labels: { categoryPrimary: "musculoskeletal", chiefComplaint: "偷塞主訴" } },
];
const lp = (ch) => H.planHandoff(LC, LI, ch || {});
check("只有 labels 的項目讀得進來;note 與 labels 同時有 → 拒絕", () => H.parseHandoff({ schema: H.SCHEMA, items: LI }).items.length === 5
  && (() => { try { H.parseHandoff({ schema: H.SCHEMA, items: [{ ref: "x", note: {}, labels: {} }] }); return false; } catch (e) { return true; } })());
check("既有病人 → 只補標註,預設要寫;不加 SOAP", () => { const r = row(lp(), "L-a"); return r.status === "labels" && r.include && r.targetCaseId === "L1"; });
check("要補的欄位:顯示代號、主次類別、治療進度、出生年", () => row(lp(), "L-a").fillFields.join() === "displayCode,categoryPrimary,categorySecondary,treatmentStage,birthYear");
check("顯示代號跟別的病人一樣 → 提醒(不擋)", () => /AQZ/.test(row(lp(), "L-a").warnings.join()));
check("已經有值的欄位一律不覆蓋,並提醒;已有主類別 → 次類別也不補", () => { const r = row(lp(), "L-b"); return r.fillFields.join() === "caseHighlight" && /顯示代號 WQB/.test(r.warnings.join()) && /主類別已經有值/.test(r.warnings.join()) && /次類別不另補/.test(r.warnings.join()); });
check("系統裡沒有這個人 → 不建立、不寫", () => { const r = row(lp(), "L-c"); return r.status === "code_not_found" && !r.include; });
check("不認得的類別 / 進度 → 這列錯誤、不寫", () => { const r = row(lp(), "L-d"); return r.errors.length === 2 && !r.include; });
check("只補標註不收其他欄位(例 主訴)→ 錯誤", () => { const r = row(lp(), "L-e"); return !r.include && /chiefComplaint/.test(r.errors.join()); });
check("可以取消單列", () => !row(lp({ "L-a": { include: false } }), "L-a").include);
const lo = H.applyHandoff(LC, LI, lp(), "2026-11-05T00:00:00.000Z");
const L1o = lo.find((c) => c.id === "L1"), L2o = lo.find((c) => c.id === "L2"), L3o = lo.find((c) => c.id === "L3");
check("寫入:目標病例補上類別、進度、出生年;設了進度同步舊 status", () => L1o.categoryPrimary === "musculoskeletal" && L1o.categorySecondary.join() === "gi_metabolic" && L1o.treatmentStage === "active" && L1o.status === "active" && L1o.birthYear === 1950);
check("寫入:顯示代號補到這位病人每個病例(正規化成 AQZ),其他欄位只動目標病例", () => L1o.displayCode === "AQZ" && L2o.displayCode === "AQZ" && !L2o.categoryPrimary && L2o.status === "closed");
check("寫入:不加任何 SOAP", () => L1o.soapNotes.length === 1 && L2o.soapNotes.length === 0);
check("寫入:已有值的病人只補空白(caseHighlight),代號與類別保留原值", () => L3o.caseHighlight === "important" && L3o.displayCode === "WQB" && L3o.categoryPrimary === "mental_sleep" && L3o.treatmentStage === "followup" && L3o.status === "active");
check("寫入:不改原陣列", () => !LC[0].displayCode && !LC[0].categoryPrimary);
check("再匯一次 → 沒有空白可補,不寫", () => { const p = H.planHandoff(lo, LI, {}); return !row(p, "L-a").include && row(p, "L-a").fillFields.length === 0; });
check("就診項目的 newCase 標註也檢查:不認得的類別 → 錯誤", () => { const p = H.planHandoff(LC, [{ ref: "v1", patientCode: "OLDA", newCase: { categoryPrimary: "nope" }, note: { visitDate: "2026-11-01" } }], {}); return !p.rows[0].include && /主類別/.test(p.rows[0].errors.join()); });
check("新病人帶 🌙 → 同步舊 status", () => { const its = [{ ref: "v2", patientCode: "", newCase: { caseTitle: "x", treatmentStage: "followup" }, note: { visitDate: "2026-11-01" } }]; const p = H.planHandoff(LC, its, { v2: { code: "WZZ", createNew: true } }); const o = H.applyHandoff(LC, its, p, "", () => "PT-ZZ"); const c = o.find((x) => x.id === H.caseIdFor("v2")); return c.treatmentStage === "followup" && c.status === "paused"; });

if (failures.length) {
  console.log(`\nFAIL — ${failures.length} 項`);
  process.exit(1);
}
console.log("\nPASS — 就診交接只加不蓋、代號配對、新病人、同日重複、重匯辨識都照規格。");
