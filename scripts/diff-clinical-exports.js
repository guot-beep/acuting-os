#!/usr/bin/env node
/**
 * diff-clinical-exports.js — 兩本病例簿(例如桌機匯出 A 與手機匯出 B)的離線比對,**匯入第二本之前一定要跑**。
 *
 * 為什麼:app 的「合併」對同 id 的病例是**整筆欄位覆蓋**(soapNotes 也整個換掉),只擋曝觸 / AVS 歷史被截短。
 * 如果同一個病例在兩台裝置上各自加過 SOAP,直接合併會讓後匯入的那一台把另一台的 SOAP 蓋掉,而且不會有任何警告。
 * 這支把 id 分成四類,螢幕上只印 id、patientCode、筆數與日期 —— 不印病歷內容。
 *
 * 用法:node scripts/diff-clinical-exports.js <A.json> <B.json> [--self-test]
 * 退出碼:0 = 沒有 divergent(可以直接匯入 B 合併);1 = 有 divergent(先把清單貼給 Claude,做出 R 再匯);2 = 用法錯。
 */
"use strict";
const fs = require("fs");

function unwrap(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.cases)) {
    if (parsed.schema_version === 2) throw new Error("v2 備份(含 patients 層)不在這支的範圍,先用 v1 匯出");
    return parsed.cases;
  }
  throw new Error("認不得的 JSON 形狀");
}
const stable = (v) => JSON.stringify(v, Object.keys(flatten(v)).sort());
function flatten(v, p = "", out = {}) {
  if (v && typeof v === "object" && !Array.isArray(v)) { for (const k of Object.keys(v)) flatten(v[k], p ? `${p}.${k}` : k, out); }
  else if (Array.isArray(v)) { v.forEach((x, i) => flatten(x, `${p}[${i}]`, out)); out[p] = out[p] || true; }
  else out[p] = true;
  return out;
}
const noiseless = (c) => { const x = JSON.parse(JSON.stringify(c)); delete x.updatedAt; return x; };
const noteIds = (c) => new Set((c.soapNotes || []).map((n, i) => String(n && n.id ? n.id : `#${i}`)));

function diff(A, B) {
  const byA = new Map(A.map((c) => [c.id, c])), byB = new Map(B.map((c) => [c.id, c]));
  const onlyA = [], onlyB = [], identical = [], divergent = [];
  for (const [id, a] of byA) {
    if (!byB.has(id)) { onlyA.push(a); continue; }
    const b = byB.get(id);
    if (stable(noiseless(a)) === stable(noiseless(b))) { identical.push(a); continue; }
    const na = noteIds(a), nb = noteIds(b);
    const aOnly = [...na].filter((x) => !nb.has(x)).length, bOnly = [...nb].filter((x) => !na.has(x)).length;
    const relation = aOnly === 0 && bOnly === 0 ? "同 SOAP 集合,欄位不同" : aOnly > 0 && bOnly > 0 ? "兩邊各自加過 SOAP(合併會丟一邊)" : aOnly > 0 ? "A 多出 SOAP(B 舊)" : "B 多出 SOAP(A 舊)";
    divergent.push({ id, a, b, aOnly, bOnly, relation });
  }
  for (const [id, b] of byB) if (!byA.has(id)) onlyB.push(b);
  return { onlyA, onlyB, identical, divergent };
}

function report(r, labelA, labelB) {
  const row = (c) => `${c.id}  ${c.patientCode || "(無代號)"}  SOAP ${((c.soapNotes || []).length)}  更新 ${c.updatedAt || "?"}`;
  console.log(`${labelA}:${r.onlyA.length + r.identical.length + r.divergent.length} 筆;${labelB}:${r.onlyB.length + r.identical.length + r.divergent.length} 筆`);
  console.log(`  只在 ${labelA}:${r.onlyA.length}`); for (const c of r.onlyA) console.log("    + " + row(c));
  console.log(`  只在 ${labelB}:${r.onlyB.length}`); for (const c of r.onlyB) console.log("    + " + row(c));
  console.log(`  兩邊相同:${r.identical.length}`);
  console.log(`  兩邊不同(divergent):${r.divergent.length}`);
  for (const d of r.divergent) console.log(`    ⚠ ${d.id}  ${d.a.patientCode || "?"}  ${labelA} SOAP ${(d.a.soapNotes || []).length} / ${labelB} SOAP ${(d.b.soapNotes || []).length}  ${d.relation}`);
  const union = r.onlyA.length + r.onlyB.length + r.identical.length + r.divergent.length;
  console.log(`\n聯集應為 ${union} 筆。${r.divergent.length ? "⛔ 有 divergent:先把上面這段貼給 Claude,做出合併後的 R.json 再匯入;不要直接用 app 合併第二本。" : "✓ 沒有 divergent:可以直接把第二本用 app「合併」匯入,匯入後筆數應等於聯集。"}`);
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.includes("--self-test")) {
    const A = [{ id: "c1", patientCode: "P1", soapNotes: [{ id: "n1" }], updatedAt: "1" }, { id: "c2", patientCode: "P2", soapNotes: [] }, { id: "c3", patientCode: "P3", soapNotes: [{ id: "n1" }] }];
    const B = [{ id: "c1", patientCode: "P1", soapNotes: [{ id: "n1" }], updatedAt: "2" }, { id: "c3", patientCode: "P3", soapNotes: [{ id: "n1" }, { id: "n9" }] }, { id: "c4", patientCode: "P4", soapNotes: [] }];
    const r = diff(A, B);
    const assert = require("assert");
    assert.deepStrictEqual(r.onlyA.map((c) => c.id), ["c2"]); assert.deepStrictEqual(r.onlyB.map((c) => c.id), ["c4"]);
    assert.deepStrictEqual(r.identical.map((c) => c.id), ["c1"]); assert.deepStrictEqual(r.divergent.map((d) => d.id), ["c3"]);
    assert.strictEqual(r.divergent[0].relation, "B 多出 SOAP(A 舊)");
    const C = [{ id: "c3", patientCode: "P3", soapNotes: [{ id: "n1" }, { id: "n7" }] }];
    assert.strictEqual(diff(C, B).divergent[0].relation, "兩邊各自加過 SOAP(合併會丟一邊)");
    console.log("PASS — diff-clinical-exports 自測 6 條(updatedAt 不算差異;SOAP 集合關係四類)");
    process.exit(0);
  }
  if (argv.length < 2) { console.error("用法: node scripts/diff-clinical-exports.js <A.json> <B.json>"); process.exit(2); }
  const A = unwrap(JSON.parse(fs.readFileSync(argv[0], "utf8"))), B = unwrap(JSON.parse(fs.readFileSync(argv[1], "utf8")));
  const r = diff(A, B);
  report(r, "A(" + argv[0].split(/[\\/]/).pop() + ")", "B(" + argv[1].split(/[\\/]/).pop() + ")");
  process.exit(r.divergent.length ? 1 : 0);
}
module.exports = { diff };
