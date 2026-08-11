/* Clinical V2 invariants validator — Codex 審計要求(docs/AI_REVIEW_FEEDBACK.md §2/§4)
 *
 * 驗的是「臨床資料契約的不變量」,對象是 case-export JSON(檔案路徑作 argv;
 * 預設掃 data/clinical_cases/ 裡的 tracked sample/template 檔)。這跟 K 系列
 * (validate-clinical-case-standard.js,PHI regex)互補:那邊管隱私,這邊管
 * 契約語意。import 在 persist 前也應該跑同一套規則(app 端接線見 handoff)。
 *
 * 規則(編號對應 Codex spec):
 *  R1  role="primary"  ⟺ isPrimary=true(role 非空時)
 *  R2  role∈{secondary,root,branch} ⟹ isPrimary=false
 *  R3  同一 visit 最多一筆 primary;patternId 不得重複
 *  R4  legacy role="" → warning(不 fail);經新 UI 存過的 note 不在本檔範圍
 *  R5  exposure row 若有 events:首事件必須 started|initial_recorded
 *  R6  eventType 必須在白名單(agent/env 各自的集合)
 *  R7  lifestyleFactors[].factorId 必須是 life.* 或空(D17 §6:觀察值命名空間,
 *      絕不允許 pattern./tdis. 混進來)
 *  R8  事件序列只驗形狀不驗語意 —— append-only 的「不得縮短」屬 import 比對
 *      (需要 before/after 兩份資料),由 --prefix-check <before.json> <after.json>
 *      模式提供:對每個 exposure,before 的 event-id 序列必須是 after 的 prefix。
 */
"use strict";
const fs = require("fs");
const path = require("path");

const AGENT_EVENTS = new Set(["started", "initial_recorded", "stopped", "dose_changed", "frequency_changed", "status_changed", "confirmed_unchanged"]);
const ENV_EVENTS = new Set(["started", "initial_recorded", "stopped", "certainty_changed", "timing_changed", "confirmed_unchanged"]);
const INITIAL_EVENTS = new Set(["started", "initial_recorded"]);

let failures = 0, warnings = 0, checked = { cases: 0, selections: 0, exposures: 0, events: 0, lifestyle: 0 };
const fail = (msg) => { failures++; console.log(`  FAIL ${msg}`); };
const warn = (msg) => { warnings++; console.log(`  warn ${msg}`); };

function checkCase(c, label) {
  checked.cases++;
  for (const note of c.soapNotes || []) {
    const sel = note.tcmPatternSelections || [];
    const ids = new Set();
    let primaries = 0;
    for (const e of sel) {
      checked.selections++;
      if (ids.has(e.patternId)) fail(`${label}/${note.id}: duplicate patternId ${e.patternId} (R3)`);
      ids.add(e.patternId);
      if (e.isPrimary) primaries++;
      const role = String(e.role || "");
      if (role === "primary" && !e.isPrimary) fail(`${label}/${note.id}/${e.patternId}: role=primary but isPrimary=false (R1)`);
      if (role !== "primary" && role !== "" && e.isPrimary) fail(`${label}/${note.id}/${e.patternId}: role=${role} but isPrimary=true (R2)`);
      if (role === "" && (e.isPrimary || sel.length)) warn(`${label}/${note.id}/${e.patternId}: legacy empty role (R4)`);
    }
    if (primaries > 1) fail(`${label}/${note.id}: ${primaries} primary patterns in one visit (R3)`);
    for (const f of note.lifestyleFactors || []) {
      checked.lifestyle++;
      const fid = String(f.factorId || "");
      if (fid && !fid.startsWith("life.")) fail(`${label}/${note.id}: lifestyle factorId "${fid}" outside life.* (R7 — D17 §6)`);
    }
  }
  const groups = [["agent", AGENT_EVENTS, c.agentExposures || []], ["environmental", ENV_EVENTS, c.environmentalExposures || []]];
  for (const [kind, allowed, rows] of groups) {
    for (const row of rows) {
      checked.exposures++;
      const evs = row.events || [];
      if (evs.length && !INITIAL_EVENTS.has(evs[0].eventType)) fail(`${label}/${kind}/${row.id || row.agentId || row.exposureId}: first event "${evs[0].eventType}" not started|initial_recorded (R5)`);
      for (const ev of evs) {
        checked.events++;
        if (!allowed.has(ev.eventType)) fail(`${label}/${kind}: eventType "${ev.eventType}" not in ${kind} whitelist (R6)`);
      }
    }
  }
}

function loadCases(file) {
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  return Array.isArray(parsed) ? parsed : [parsed];
}

function prefixCheck(beforeFile, afterFile) {
  const key = (row) => row.id || `${row.agentId || row.exposureId || row.nameText}`;
  const seq = (row) => (row.events || []).map((e) => e.id || e.createdAt || e.eventType).join("→");
  let ok = 0;
  for (const [field] of [["agentExposures"], ["environmentalExposures"]]) {
    const beforeRows = new Map();
    for (const c of loadCases(beforeFile)) for (const r of c[field] || []) beforeRows.set(`${c.id}/${key(r)}`, seq(r));
    for (const c of loadCases(afterFile)) for (const r of c[field] || []) {
      const k = `${c.id}/${key(r)}`;
      if (!beforeRows.has(k)) continue;
      const b = beforeRows.get(k), a = seq(r);
      if (!a.startsWith(b)) fail(`${k}: event history is not a prefix-extension — history was rewritten or truncated (R8)`);
      else ok++;
      beforeRows.delete(k);
    }
    for (const [k] of beforeRows) fail(`${k}: exposure row disappeared between before/after (R8)`);
  }
  console.log(`  prefix-check rows compared: ${ok}`);
}

const args = process.argv.slice(2);
if (args[0] === "--prefix-check") {
  if (args.length !== 3) { console.log("usage: --prefix-check <before.json> <after.json>"); process.exit(2); }
  console.log(`prefix-check ${path.basename(args[1])} → ${path.basename(args[2])}`);
  prefixCheck(args[1], args[2]);
} else {
  const targets = args.length ? args : ["data/clinical_cases/sample_deidentified_case.json", "data/clinical_cases/case_template.json"].filter((f) => fs.existsSync(f));
  for (const file of targets) {
    console.log(path.basename(file));
    for (const c of loadCases(file)) checkCase(c, c.id || path.basename(file));
  }
  console.log(`checked: ${checked.cases} cases · ${checked.selections} pattern selections · ${checked.exposures} exposures · ${checked.events} events · ${checked.lifestyle} lifestyle rows`);
}
console.log(failures ? `FAIL — ${failures} invariant violation(s), ${warnings} warning(s)` : `PASS — 0 violations, ${warnings} warning(s)`);
process.exit(failures ? 1 : 0);
