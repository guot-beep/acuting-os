#!/usr/bin/env node
/**
 * validate-visit-handoff.js — 「就診交接」匯入(js/visit-handoff.js)的行為真值表。
 *
 * require 真正在跑的模組,餵虛構病例(永遠不用真實病歷),斷言輸出。任一條失敗 exit 1。
 * 守的規則:
 *   - 只 append,不覆蓋:既有 SOAP 一筆不少、既有病例欄位不被改寫(只補空白,可關)
 *   - 候選代號在系統裡找得到才接上;找不到 / 沒代號 → 不自動建立
 *   - 新病人要 ATG-1984F 格式 + 明確勾「建立」;性別/出生年不符只警告
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
  { id: "c4", patientCode: "WJD-1975M", caseTitle: "已是新代號", status: "active", soapNotes: [] },
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

console.log("新病人");
check("填了舊格式代號 → 錯誤、不匯", () => { const r = row(plan({ r02: { code: "AB", createNew: true } }), "r02"); return r.errors.length > 0 && !r.include; });
check("填了新格式但沒勾建立 → 不匯", () => !row(plan({ r02: { code: "axm-1992f" } }), "r02").include);
check("新格式 + 勾建立 → 匯,代號正規化成大寫", () => { const r = row(plan({ r02: { code: "axm-1992f", createNew: true } }), "r02"); return r.include && r.code === "AXM-1992F"; });
check("性別/出生年不符 → 只警告", () => { const r = row(plan({ r02: { code: "AXM-1990M", createNew: true } }), "r02"); return r.include && r.warnings.length === 2; });
check("兩筆新病人同一個新代號 → 兩筆都擋", () => { const p = plan({ r02: { code: "AXM-1992F", createNew: true }, r03: { code: "AXM-1992F", createNew: true } }); return !row(p, "r02").include && !row(p, "r03").include; });
check("填的代號剛好是既有病人 → 變成接到既有病例", () => row(plan({ r02: { code: "WJD-1975M" } }), "r02").status === "append");

console.log("寫入(只加不蓋)");
const pA = plan({ r02: { code: "AXM-1992F", createNew: true } });
const out = H.applyHandoff(CASES, ITEMS, pA, "2026-11-02T00:00:00.000Z");
const c1 = out.find((c) => c.id === "c1");
check("既有 SOAP 一筆不少,新的接在後面", () => c1.soapNotes.length === 3 && c1.soapNotes[0].id === "n1" && c1.soapNotes[2].subjective === "S1");
check("新 SOAP id 由 ref 決定(重匯可辨識)", () => c1.soapNotes[2].id === H.noteIdFor("r01"));
check("既有欄位不覆蓋(historyPresent、sex 保留原值)", () => c1.historyPresent === "既有病史" && c1.sex === "F");
check("空白欄位補上(birthYear、pastHistory)", () => c1.birthYear === 1992 && c1.pastHistory === "新既往史");
check("補空白可關掉", () => { const o = H.applyHandoff(CASES, ITEMS, plan({ r01: { fillEmpty: false } })); const c = o.find((x) => x.id === "c1"); return !c.pastHistory && c.soapNotes.length === 3; });
check("安全旗標只併入新的", () => c1.safetyFlags.join() === "既有旗標,新旗標");
check("新病人建立一個病例、帶這次就診", () => { const c = out.find((x) => x.patientCode === "AXM-1992F"); return c && c.id === H.caseIdFor("r02") && c.soapNotes.length === 1 && c.caseTitle === "新問題"; });
check("沒勾的列一律不動(r03、r05)", () => out.length === CASES.length + 1 && !out.some((c) => (c.soapNotes || []).some((n) => n.subjective === "S5" || n.subjective === "S3")));
check("不改原陣列", () => CASES[0].soapNotes.length === 2 && !CASES[0].pastHistory);
check("匯過一次 → 再預覽就是「已匯入」", () => { const p = H.planHandoff(out, ITEMS, {}); return row(p, "r01").status === "already_imported" && row(p, "r02").status === "already_imported" && !p.toApply.some((r) => r.ref === "r01"); });

if (failures.length) {
  console.log(`\nFAIL — ${failures.length} 項`);
  process.exit(1);
}
console.log("\nPASS — 就診交接只加不蓋、代號配對、新病人、同日重複、重匯辨識都照規格。");
