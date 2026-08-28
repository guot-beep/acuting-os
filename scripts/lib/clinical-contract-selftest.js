#!/usr/bin/env node
/**
 * clinical-contract-selftest.js — D12 契約凍結閘的負控(2026-08-28)。
 *
 * 「安全 gate 改完自測綠不算數」的另一半:綠燈不算數,是因為沒人證明它**紅得起來**。
 * 這支就是去證明它紅得起來 —— 每一條都把 `app.js` 或 `js/clinical-store.js` 的一個
 * 副本改壞,再叫 gate 跑,**必須 exit 1**;最後兩條不改,必須 exit 0。
 *
 * **絕不碰工作區的任何檔案**:所有變異寫進 os.tmpdir() 的暫存副本,用
 * `--app-src` / `--store-src` 餵給 gate。(硬規則 —— 這個專案出過 gate 自己
 * 寫進追蹤檔、兩個 session 併發時把資料弄成永久損壞的事。)
 */
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

function region(src, fnName) {
  const start = src.indexOf("function " + fnName + "(");
  if (start < 0) throw new Error("找不到 " + fnName);
  let depth = 0;
  for (let j = src.indexOf("{", start); j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") { depth--; if (depth === 0) return [start, j + 1]; }
  }
  throw new Error(fnName + " 括號沒收斂");
}

/** 在指定函式範圍內刪掉 `key: ...` 那一整行 */
function dropKeyLine(src, fnName, key) {
  const [a, b] = region(src, fnName);
  const body = src.slice(a, b);
  const re = new RegExp(`\\n[ \\t]*${key}:[^\\n]*\\n`);
  if (!re.test(body)) throw new Error(`${fnName} 裡找不到 ${key}: 這一行 —— 負控本身壞了,不是 gate 壞了`);
  return src.slice(0, a) + body.replace(re, "\n") + src.slice(b);
}

/** 在指定函式範圍內做一次字串替換 */
function editIn(src, fnName, from, to) {
  const [a, b] = region(src, fnName);
  const body = src.slice(a, b);
  if (!body.includes(from)) throw new Error(`${fnName} 裡找不到「${from.slice(0, 60)}」—— 負控本身壞了`);
  return src.slice(0, a) + body.replace(from, to) + src.slice(b);
}

/** 全檔字串替換(給 v2 store 那三個字面量用) */
function editGlobal(src, from, to) {
  if (!src.includes(from)) throw new Error(`找不到「${from.slice(0, 60)}」—— 負控本身壞了`);
  return src.replace(from, to);
}

function run(gatePath, ROOT) {
  const appPath = path.join(ROOT, "app.js");
  const storePath = path.join(ROOT, "js/clinical-store.js");
  const app = fs.readFileSync(appPath, "utf8");
  const store = fs.readFileSync(storePath, "utf8");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "acuting-contract-selftest-"));

  // [說明, 動哪一支, 變異函式, 期望 exit(0 = 必須放行 / 1 = 必須擋)]
  const cases = [
    ["第四面:刪掉 case 的 allergyStatus(缺口審查 §4 G2 的原始負控)", "app",
      () => dropKeyLine(app, "normalizeClinicalCase", "allergyStatus"), 1],
    ["第四面:刪掉 soap 的 followUp", "app",
      () => dropKeyLine(app, "normalizeSoapNote", "followUp"), 1],
    ["第四面:改型別 case.baselineSeverity string→number", "app",
      () => editIn(app, "normalizeClinicalCase",
        `baselineSeverity: (value.baselineSeverity === 0 || value.baselineSeverity) ? Number(value.baselineSeverity) : "",`,
        `baselineSeverity: Number(value.baselineSeverity || 0),`), 1],
    ["第四面:改名 soap.patientPerspective → patientVoice(一移除一新增)", "app",
      () => editIn(app, "normalizeSoapNote", "patientPerspective: String(value.patientPerspective", "patientVoice: String(value.patientPerspective"), 1],
    ["第四面:刪掉巢狀列一欄 soap.outcomeMetrics[].relatedSymId", "app",
      () => editIn(app, "normalizeSoapNote", `, relatedSymId: String(m.relatedSymId || "")`, ``), 1],
    ["第四面:整支 normalizeClinicalCase 被改名(必須 fail loud,不得靜默回空形狀)", "app",
      () => app.replace("function normalizeClinicalCase(", "function normalizeClinicalCaseV2("), 1],
    ["第五面:刪掉 v2 patient 列的 needsReview(待審裁決狀態靜默消失)", "store",
      () => editGlobal(store, "needsReview: p.needsReview.filter((f) => !applied.some((a) => a.field === f)),\n", ""), 1],
    ["第五面:刪掉 v2 staging envelope 的 patients 鍵", "store",
      () => editGlobal(store, "      patients: plan.patients,\n", ""), 1],
    ["第五面:patients.push 錨點被改寫(必須 fail loud)", "store",
      () => editGlobal(store, "patients.push({", "patients.push(Object.assign({"), 1],
    ["純新增一個欄位(additive,必須放行)", "app",
      () => editIn(app, "normalizeClinicalCase", `    id: String(value.id || createId("case")),`,
        `    id: String(value.id || createId("case")),\n    selfTestProbeField: String(value.selfTestProbeField || ""),`), 0],
    ["兩支都不動(必須 PASS —— 證明前面的紅燈不是背景噪音)", "app", () => app, 0],
  ];

  let pass = 0;
  const fails = [];
  cases.forEach(([label, target, mutate, expect], i) => {
    let mutated;
    try { mutated = mutate(); } catch (e) { fails.push(`${label} —— 負控自身錯誤:${e.message}`); return; }
    const file = path.join(dir, `case-${i}-${target}.js`);
    fs.writeFileSync(file, mutated);
    const args = [gatePath];
    if (target === "app") args.push("--app-src", file);
    else args.push("--store-src", file);
    const r = spawnSync(process.execPath, args, { encoding: "utf8" });
    const got = r.status === 0 ? 0 : 1;
    if (got === expect) { pass++; console.log(`PASS  ${label}  → exit ${r.status}`); }
    else fails.push(`${label}:預期 exit ${expect ? "非 0" : "0"},實得 ${r.status}\n${(r.stdout || r.stderr || "").split("\n").slice(-6).join("\n")}`);
  });

  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* 暫存清不掉不影響結論 */ }

  console.log(`\n負控 ${pass}/${cases.length}`);
  if (fails.length) {
    console.error("\nFAIL —— 下列負控沒有得到預期結果:");
    for (const f of fails) console.error("  ⛔ " + f);
    process.exit(1);
  }
  console.log("PASS —— gate 在該紅的時候紅得起來,在該綠的時候也沒有亂紅。");
  process.exit(0);
}

module.exports = { run };
