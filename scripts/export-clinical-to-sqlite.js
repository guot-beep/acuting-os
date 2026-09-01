#!/usr/bin/env node
/**
 * export-clinical-to-sqlite.js — 影子匯出:把一份病例 JSON 匯出成 SQLite .db。
 *
 * 這**不是**遷移。app 一行都不動,localStorage 仍是唯一正本,產出的 .db 是
 * 唯讀副本 —— 不要就刪檔,零回滾成本。D18 的遷移流程是
 * plan → shadow → verify → pointer → rollback,這支只做 shadow + verify。
 *
 * 為什麼先做這一步:
 *   1. 它把 localstorage_sqlite_mapping.json 的 105 條規則**實際跑一遍**。
 *      對照表維護得再好,沒跑過就只是一份文件;真正的遷移日才發現規則錯,
 *      是最貴的時機。
 *   2. 零風險:不碰寫入路徑、不碰 pointer、不需要 in-browser adapter
 *      (js/clinical-store.js 的 setBackend 至今仍是空的插入點)。
 *   3. 產出的 .db 可以直接下 SQL,回答 localStorage 答不出來的問題
 *      (「這半年開最多的方是哪幾個」)。
 *
 * 設計原則:**由對照表驅動,不由這支的作者記憶驅動**。
 *   - `destination` 是 `表.欄` 且轉換屬於 as-is / RENAME / Number() / Direct copy
 *     → 自動套用,不用手寫。
 *   - EXPLODE / SPLIT / JOIN 這種需要判斷的 → 逐條實作在 HANDLERS。
 *   - 兩者都不是的 → **列進「未處理」報告**,並數出這份資料裡有幾筆真的有值。
 *     少匯一個欄位而不出聲,比不匯還糟。
 *   - `no_destination_yet` 的欄位若有值 → 整支停下(對照表自己寫的 halt, not drop)。
 *
 * 用法:
 *   node scripts/export-clinical-to-sqlite.js <cases.json> [out.db]
 *   node scripts/export-clinical-to-sqlite.js --self-test
 *
 * 產出的 .db 是臨床資料,**絕對不可 commit**(D7)。預設寫到 repo 外。
 */
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const ROOT = path.resolve(__dirname, "..");
const SCHEMA = path.join(ROOT, "data/clinical_cases/schema.sql");
const MAPPING = path.join(ROOT, "data/clinical_cases/localstorage_sqlite_mapping.json");
const SAMPLE = path.join(ROOT, "data/clinical_cases/sample_export_fixture.json");

const argv = process.argv.slice(2);
const SELF_TEST = argv.includes("--self-test");
const positional = argv.filter((a) => !a.startsWith("--"));
const inFile = SELF_TEST ? SAMPLE : positional[0];
const outFile = SELF_TEST
  ? path.join(os.tmpdir(), "acuting-selftest.db")
  : (positional[1] || path.join(os.tmpdir(), "acuting-clinical.db"));

if (!inFile) {
  console.error("用法: node scripts/export-clinical-to-sqlite.js <cases.json> [out.db]");
  console.error("      node scripts/export-clinical-to-sqlite.js --self-test");
  process.exit(2);
}

const mapping = JSON.parse(fs.readFileSync(MAPPING, "utf8"));
const rules = mapping.mappings;
const raw = JSON.parse(fs.readFileSync(inFile, "utf8"));

/* 兩種形狀都吃:v1 信封與裸陣列(舊備份)。認不得的一律拒絕,不猜 ——
 * 猜錯會把不是病例的東西匯進臨床資料庫。 */
const cases = Array.isArray(raw) ? raw
  : (raw && Array.isArray(raw.cases)) ? raw.cases
  : null;
if (!cases) {
  console.error("FAIL — 認不得這份 JSON 的形狀。預期 v1 信封 {schema_version:1, cases:[…]} 或裸陣列。");
  process.exit(1);
}

console.log(`來源  ${path.basename(inFile)} —— ${cases.length} 筆病例`);
console.log(`輸出  ${outFile}\n`);

// ── halt-not-drop ────────────────────────────────────────────────────────
const hasValue = (v) => Array.isArray(v) ? v.length > 0 : (v !== undefined && v !== null && String(v).trim() !== "");
const holdersFor = (scope, c) => scope === "case" ? [c] : scope === "soap" ? (c.soapNotes || []) : [];

const noDest = rules.filter((r) => r.status === "no_destination_yet");
const blocked = [];
for (const r of noDest) {
  for (const c of cases) for (const h of holdersFor(r.source_scope, c)) {
    if (h && hasValue(h[r.source_field])) blocked.push(r);
  }
}
if (blocked.length) {
  console.error(`FAIL — ${blocked.length} 筆資料落在「還沒有欄位可去」的來源欄位上。`);
  console.error("對照表對這種情況寫的是 halt, not drop。\n");
  const seen = new Set();
  for (const r of blocked) {
    const k = `${r.source_scope}.${r.source_field}`;
    if (seen.has(k)) continue; seen.add(k);
    const n = blocked.filter((x) => x === r).length;
    console.error(`  ${k}  ${n} 筆  (遺失風險 ${r.data_loss_risk})\n     ${r.transformation}`);
  }
  /* 這句話是給 Ting 看的,不是給工程師看的。她在診所前一天照 runbook 跑這支,
   * 撞到這裡時需要知道的是「這不是我做錯什麼」以及「下一步做什麼」,
   * 不是「schema.sql 加欄」。 */
  console.error("\n這**不是**妳做錯什麼 —— 是妳的病例用到了一個還沒有對應資料庫欄位的東西,");
  console.error("這支寧可整個停下來,也不要靜靜把它丟掉(少匯一個欄位而不出聲,比不匯還糟)。");
  console.error("\n什麼都沒有被寫出去,原本的病例一個字都沒動。");
  console.error("下一步:把上面這幾行整段貼給 Claude,補完欄位再跑一次即可。");
  process.exit(1);
}
console.log(`halt-not-drop:${noDest.length} 個無去處欄位,這份資料裡都沒有值 ✓`);

// ── 建庫 ─────────────────────────────────────────────────────────────────
fs.rmSync(outFile, { force: true });
const db = new DatabaseSync(outFile);
db.exec("PRAGMA foreign_keys = ON;");
db.exec(fs.readFileSync(SCHEMA, "utf8"));
const tableList = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
).all().map((r) => r.name);
const colCache = new Map();
const colsOf = (t) => {
  if (!colCache.has(t)) colCache.set(t, db.prepare(`PRAGMA table_info(${t})`).all().map((c) => c.name));
  return colCache.get(t);
};
console.log(`schema.sql 建出 ${tableList.length} 張表 ✓\n`);

const S = (v) => (v === undefined || v === null || String(v) === "" ? null : String(v));
const N = (v) => {
  if (v === undefined || v === null || String(v).trim() === "") return null;
  const n = Number(v); return Number.isFinite(n) ? n : null;
};

const counts = new Map();
const bump = (t, n = 1) => counts.set(t, (counts.get(t) || 0) + n);
const rowErrors = [];
const put = (table, obj) => {
  if (!tableList.includes(table)) { rowErrors.push(`${table}:表不存在`); return false; }
  const cols = colsOf(table);
  const use = Object.keys(obj).filter((k) => cols.includes(k) && obj[k] !== undefined);
  if (!use.length) return false;
  try {
    db.prepare(`INSERT OR REPLACE INTO ${table} (${use.join(",")}) VALUES (${use.map(() => "?").join(",")})`)
      .run(...use.map((k) => obj[k]));
    bump(table); return true;
  } catch (e) { rowErrors.push(`${table}: ${e.message.slice(0, 90)}`); return false; }
};

/* 自動處理的轉換:值原樣進去(或轉數字)。其餘一律交給 HANDLERS 或列為未處理。 */
const SIMPLE = /^(as-is|RENAME|Number\(\)|Direct copy)/i;
const simpleRule = (r) =>
  r.status === "mapped" && SIMPLE.test(r.transformation) && /^[a-z_]+\.[a-z0-9_]+$/.test(r.destination);
const isNumeric = (r) => /^Number\(\)/.test(r.transformation);

/* 需要判斷的轉換,逐條實作。key = `<scope>.<source_field>`。
 * 回傳 true 表示「我處理了」;沒有 handler 又不是 simple 的,會被列進未處理報告。 */
const HANDLERS = {
  "case.patientCode": () => true,           // 在 patients 那段一起處理
  "case.birthYear": () => true,             // 同上(patients)
  "case.birthYearMonth": () => true,        // 同上
  "case.sex": () => true,
  "case.genderIdentity": () => true,
  "case.occupation": () => true,
  "case.soapNotes": () => true,             // 主迴圈展開
  "case.chiefComplaint": () => true,        // case_intake_baseline
  "case.historyPresent": () => true,
  "case.pastHistory": () => true,
  "case.allergies": () => true,
  "case.lifestyle": () => true,
  "case.menstrualObHistory": () => true,
  "case.westernConditions": () => true,
  "case.easternDiseases": () => true,
  "case.tcmPatterns": () => true,
  "case.safetyFlags": () => true,
  "case.raceEthnicity": () => true,
  "case.previousTreatment": () => true,
  "soap.acupointLinks": () => true,
  "soap.retentionMinutes": () => true,
  "soap.technique": () => true,
  "soap.formulaLinks": () => true,
  "soap.herbLinks": () => true,
  "soap.westernConditionLinks": () => true,
  "soap.easternDiseaseLinks": () => true,
  "case.agentExposures": () => true,
  "case.environmentalExposures": () => true,
  "soap.tcmPatternSelections": () => true,
  "soap.patternDifferentials": () => true,
  "soap.lifestyleFactors": () => true,
  "soap.adverseEvents": () => true,
  "soap.outcomeMetrics": () => true,
  "soap.formulaHerbs": () => true,
  "soap.westernMeds": () => true,
  "soap.medicationLinks": () => true,
  "soap.outcomes": () => true,
  "soap.safetyFlagLinks": () => true,
  "agentExposure.events": () => true,
  "environmentalExposure.events": () => true,
  /* 刻意**不**實作、要讓報告出聲的三條:
   *   soap.pointsUsed        自由文字,需要穴位代碼解析 —— 解錯會把針法記錯
   *   soap.tcmPattern        自由文字,需要證型 id 解析,無法回退的欄位
   *   soap.effectDurationDays 有優先序規則(outcomeMetrics 優先;兩邊都有且
   *                          不一致時 runtime 自己也不靜默裁決,要標記人工複核)
   * 這三條各自都需要判斷,不是機械轉換。留在「未實作」報告裡,比自作主張好。
   * soap.tcmPatternLinks 是 tcmPatternSelections 的衍生鏡像(對照表註明
   * SUPERSEDED),重複匯入會產生假的第二筆證型,所以也不處理。 */
};

/* array→rows 的七條規則,payload 全都是欄位名的 camelCase 鏡像
 * (`nameText` ↔ `name_text`、`valueNumber` ↔ `value_number`…),所以一個
 * 泛用轉換就吃得下,不必手寫七份 —— 手寫七份的版本每加一個欄位就要記得改,
 * 而「忘記改」不會有人發現。轉換之後只保留該表真的有的欄位,多的丟進
 * 未對應報告而不是靜默吞掉。 */
const snake = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
const droppedKeys = new Map();
const EXPOSURE_PARENT_TYPE = {
  case_agent_exposures: "agent",
  case_environmental_exposures: "environmental",
};
const explodeObjects = (table, list, parentCol, parentId, prefix) => {
  if (!Array.isArray(list) || !list.length) return;
  const cols = colsOf(table);
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const o = { [parentCol]: parentId };
    for (const [k, v] of Object.entries(item)) {
      if (k === "events") continue;                 // 巢狀時間軸另外處理
      const c = snake(k);
      if (!cols.includes(c)) {
        const key = `${table}.${c}`;
        droppedKeys.set(key, (droppedKeys.get(key) || 0) + 1);
        continue;
      }
      o[c] = (v === null || v === undefined || v === "") ? null
        : (typeof v === "boolean") ? (v ? 1 : 0)
        : (typeof v === "object") ? JSON.stringify(v) : v;
    }
    if (cols.includes("id") && !o.id) o.id = nextId(prefix);
    put(table, o);

    // D17 §5:曝觸的 events[] 是 append-only 時間軸,有自己的表
    if (Array.isArray(item.events) && tableList.includes("case_exposure_events")) {
      const ecols = colsOf("case_exposure_events");
      for (const ev of item.events) {
        if (!ev || typeof ev !== "object") continue;
        const e = {};
        for (const [k, v] of Object.entries(ev)) {
          const c = snake(k);
          if (!ecols.includes(c)) { droppedKeys.set(`case_exposure_events.${c}`, (droppedKeys.get(`case_exposure_events.${c}`) || 0) + 1); continue; }
          e[c] = (v === null || v === undefined || v === "") ? null : (typeof v === "object" ? JSON.stringify(v) : v);
        }
        /* parent_type / parent_id 是 NOT NULL,而且 payload 裡沒有 ——
         * 它們是「這筆事件掛在哪一種曝觸下」,由呼叫端的表名決定,不是猜的。 */
        e.case_id = parentId;
        e.parent_type = EXPOSURE_PARENT_TYPE[table] || null;
        e.parent_id = item.id ? String(item.id) : null;
        if (ecols.includes("id") && !e.id) e.id = nextId("expevt");
        if (!e.parent_type || !e.parent_id) {
          rowErrors.push(`case_exposure_events: 缺 parent_type/parent_id(來源 ${table})`);
          continue;
        }
        put("case_exposure_events", e);
      }
    }
  }
};

const unhandled = new Map();   // `<scope>.<field>` -> 有值的筆數

// ── 寫入 ─────────────────────────────────────────────────────────────────
const caseRules = rules.filter((r) => r.source_scope === "case");
const soapRules = rules.filter((r) => r.source_scope === "soap");
const applySimple = (ruleSet, src, tableFilter, row) => {
  for (const r of ruleSet) {
    if (!simpleRule(r)) continue;
    const [t, col] = r.destination.split(".");
    if (t !== tableFilter) continue;
    const v = src[r.source_field];
    if (v === undefined) continue;
    row[col] = isNumeric(r) ? N(v) : S(v);
  }
};
const noteUnhandled = (ruleSet, src, scope) => {
  for (const r of ruleSet) {
    if (r.status !== "mapped") continue;
    const key = `${scope}.${r.source_field}`;
    if (simpleRule(r) || HANDLERS[key]) continue;
    if (hasValue(src[r.source_field])) unhandled.set(key, (unhandled.get(key) || 0) + 1);
  }
};

let seq = 0;
const nextId = (p) => `${p}-${++seq}`;

for (const c of cases) {
  noteUnhandled(caseRules, c, "case");

  // patients:patientCode 是唯一 handle;patients.id 直接沿用它(決定性,不編造)
  const pid = S(c.patientCode);
  if (pid) {
    const p = { id: pid, patient_code: pid };
    applySimple(caseRules, c, "patients", p);
    if (hasValue(c.birthYearMonth)) {
      const [y, mo] = String(c.birthYearMonth).split("-");
      if (N(y)) p.birth_year = N(y);
      if (N(mo)) p.birth_month = N(mo);
    }
    put("patients", p);
  }

  const row = { id: S(c.id), patient_id: pid, case_title: S(c.caseTitle) || "(未命名)" };
  applySimple(caseRules, c, "cases", row);
  row.id = S(c.id); row.patient_id = pid;                       // 不讓 simple 覆蓋鍵
  if (!row.case_title) row.case_title = "(未命名)";              // NOT NULL
  put("cases", row);

  // case_intake_baseline
  const baseline = {
    case_id: S(c.id),
    chief_complaint_zh: S(c.chiefComplaint),
    history_present_illness: S(c.historyPresent),
    biomedical_history: S(c.pastHistory),
    allergies: S(c.allergies),
    lifestyle_notes: S(c.lifestyle),
    menstrual_history: S(c.menstrualObHistory),
  };
  if (Object.values(baseline).some((v) => v !== null && v !== S(c.id))) {
    if (colsOf("case_intake_baseline").includes("id")) baseline.id = nextId("cib");
    put("case_intake_baseline", baseline);
  }

  // EXPLODE:清單 → 一 id 一列
  const explodeCase = (table, list, col) => {
    for (const v of (list || [])) {
      if (!S(v)) continue;
      const o = { case_id: S(c.id), [col]: S(v) };
      if (colsOf(table).includes("id")) o.id = nextId(table);
      put(table, o);
    }
  };
  explodeCase("case_western_conditions", c.westernConditions, "condition_id");
  explodeCase("case_eastern_diseases", c.easternDiseases, "disease_id");
  explodeCase("case_tcm_patterns", c.tcmPatterns, "pattern_id");
  explodeCase("case_safety_flags", c.safetyFlags, "safety_flag_id");
  explodeCase("case_race_ethnicity", c.raceEthnicity, "race_ethnicity_id");
  explodeCase("case_previous_treatment", c.previousTreatment, "treatment_type");
  explodeObjects("case_agent_exposures", c.agentExposures, "case_id", S(c.id), "agentexp");
  explodeObjects("case_environmental_exposures", c.environmentalExposures, "case_id", S(c.id), "envexp");

  for (const s of (c.soapNotes || [])) {
    noteUnhandled(soapRules, s, "soap");
    const vid = S(s.id) || nextId("visit");

    const v = { id: vid, case_id: S(c.id) };
    applySimple(soapRules, s, "visits", v);
    v.id = vid; v.case_id = S(c.id);
    put("visits", v);

    const sn = { id: vid, visit_id: vid };
    applySimple(soapRules, s, "soap_notes", sn);
    sn.id = vid; sn.visit_id = vid;
    // JOIN 規則:清單併成欄位既有的文字塊
    if (hasValue(s.westernConditionLinks)) sn.assessment_western_condition_ids = (s.westernConditionLinks || []).join(", ");
    if (hasValue(s.easternDiseaseLinks)) sn.assessment_eastern_disease_ids = (s.easternDiseaseLinks || []).join(", ");
    put("soap_notes", sn);

    for (const code of (s.acupointLinks || [])) {
      if (!S(code)) continue;
      put("visit_acupuncture", {
        id: nextId("va"), visit_id: vid, acupoint_code: S(code),
        retention_minutes: N(s.retentionMinutes), technique: S(s.technique),
      });
    }
    for (const f of (s.formulaLinks || [])) {
      if (!S(f)) continue;
      put("visit_formulas", { id: nextId("vf"), visit_id: vid, formula_id: S(f) });
    }
    for (const h of (s.herbLinks || [])) {
      if (!S(h)) continue;
      put("visit_herbs", { id: nextId("vh"), visit_id: vid, herb_id: S(h) });
    }
    // 自由文字 → 一行一列(名稱欄,沒有 id)
    const explodeText = (table, text, col) => {
      for (const line of String(text || "").split(/[\n;、,,]+/).map((x) => x.trim()).filter(Boolean)) {
        put(table, { id: nextId(table), visit_id: vid, [col]: line });
      }
    };
    if (hasValue(s.formulaHerbs)) explodeText("visit_formulas", s.formulaHerbs, "formula_name_text");
    if (hasValue(s.westernMeds)) explodeText("visit_western_medications", s.westernMeds, "medication_name_text");
    for (const m of (s.medicationLinks || [])) {
      if (!S(m)) continue;
      put("visit_western_medications", { id: nextId("vwm"), visit_id: vid, medication_id: S(m) });
    }
    /* outcomes 是自由文字 → 一列,只設 notes,**不設 metric_name/value**。
     * 對照表說得很清楚:寫成有 metric_name 而 value 空的列,讀起來是
     * 「量過但結果不見了」,而真相是「從來沒量過」。 */
    if (hasValue(s.outcomes) && colsOf("visit_outcomes").includes("notes")) {
      const oc = colsOf("visit_outcomes");
      const row = { id: nextId("vo"), visit_id: vid, notes: S(s.outcomes) };
      if (oc.includes("metric_name")) row.metric_name = "(narrative)";   // NOT NULL,但明示不是量測
      put("visit_outcomes", row);
    }
    // safetyFlagLinks 的去處是 CASE 層(對照表註明:per-visit 旗標會失去它被提出的那一診)
    for (const f of (s.safetyFlagLinks || [])) {
      if (!S(f)) continue;
      const o = { case_id: S(c.id), safety_flag_id: S(f) };
      if (colsOf("case_safety_flags").includes("id")) o.id = nextId("csf");
      put("case_safety_flags", o);
    }
    explodeObjects("visit_tcm_patterns", s.tcmPatternSelections, "visit_id", vid, "vtp");
    explodeObjects("visit_pattern_differentials", s.patternDifferentials, "visit_id", vid, "vpd");
    explodeObjects("visit_lifestyle_factors", s.lifestyleFactors, "visit_id", vid, "vlf");
    explodeObjects("visit_adverse_events", s.adverseEvents, "visit_id", vid, "vae");
    /* visit_outcomes.metric_name 是 NOT NULL,而 app 的 outcomeMetrics 只帶
     * metricId —— 補 metric_name = metricId(決定性,不編造人看的名稱)。 */
    explodeObjects("visit_outcomes",
      (s.outcomeMetrics || []).map((m) => ({ ...m, metricName: m.metricName || m.metricId })),
      "visit_id", vid, "vo");
  }
}

// ── 報告 ─────────────────────────────────────────────────────────────────
console.log("寫入結果:");
for (const [t, n] of [...counts].sort()) console.log(`  ${String(n).padStart(5)}  ${t}`);

if (rowErrors.length) {
  const seen = new Map();
  rowErrors.forEach((e) => seen.set(e, (seen.get(e) || 0) + 1));
  console.log(`\n⛔ 寫入被拒 ${rowErrors.length} 次:`);
  [...seen].slice(0, 8).forEach(([e, n]) => console.log(`  ${n}×  ${e}`));
}

/* 覆蓋率要能相加等於總數。第一版把「simple 且同時列在 HANDLERS」的規則
 * 數了兩次,結果「其餘」變成 -6 —— 一份會出現負數的覆蓋率報告,等於這份
 * 報告不可信。改成互斥分桶,並在最後驗總和。 */
console.log("\n對照表覆蓋(互斥分桶):");
const bucket = (r) => {
  if (r.status === "no_destination_yet") return "halt";
  if (simpleRule(r)) return "auto";
  if (HANDLERS[`${r.source_scope}.${r.source_field}`]) return "hand";
  return "none";
};
const buckets = { auto: 0, hand: 0, halt: 0, none: 0 };
const noneList = [];
for (const r of rules) {
  const b = bucket(r); buckets[b]++;
  if (b === "none") noneList.push(`${r.source_scope}.${r.source_field}`);
}
console.log(`  自動套用(as-is/RENAME/Number)  ${buckets.auto}`);
console.log(`  逐條實作                        ${buckets.hand}`);
console.log(`  無去處,有值就停(halt)          ${buckets.halt}`);
console.log(`  刻意不實作,有值就報告           ${buckets.none}`);
const sum = buckets.auto + buckets.hand + buckets.halt + buckets.none;
console.log(`  合計 ${sum} / ${rules.length}${sum === rules.length ? " ✓" : "  ⛔ 分桶漏算"}`);
if (noneList.length) console.log(`     刻意不實作的:${noneList.join("、")}`);
if (unhandled.size) {
  console.log(`\n⚠️  這份資料裡有值、但這支還沒實作的來源欄位(${unhandled.size} 個):`);
  [...unhandled].sort((a, b) => b[1] - a[1]).forEach(([k, n]) => {
    const r = rules.find((x) => `${x.source_scope}.${x.source_field}` === k);
    console.log(`     ${k}  ${n} 筆 → ${r.destination}`);
  });
  console.log("     這些欄位**沒有**進資料庫。要用這支做正式遷移之前必須先補上。");
} else {
  console.log("\n  這份資料裡沒有「有值但未實作」的欄位 ✓");
}
if (droppedKeys.size) {
  console.log(`\n⚠️  array→rows 展開時,來源有、目標表沒有的欄位(${droppedKeys.size} 個):`);
  [...droppedKeys].sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(`     ${k}  ${n} 次`));
  console.log("     這些值**沒有**進資料庫。要嘛 schema 加欄,要嘛確認它不是臨床內容。");
}

// ── 往返核對 ─────────────────────────────────────────────────────────────
let mismatch = 0;
const same = (label, a, b) => {
  if (String(a ?? "") !== String(b ?? "")) { mismatch++; console.log(`  ⛔ ${label}: "${a}" ≠ "${b}"`); }
};
console.log("\n往返核對(從 SQLite 讀回 vs 來源 JSON):");
for (const c of cases) {
  const got = db.prepare("SELECT * FROM cases WHERE id = ?").get(S(c.id));
  if (!got) { mismatch++; console.log(`  ⛔ 病例 ${c.id} 沒寫進去`); continue; }
  same(`${c.id}.case_title`, got.case_title, c.caseTitle || "(未命名)");
  same(`${c.id}.start_date`, got.start_date, c.startDate || null);
  same(`${c.id}.visits 筆數`,
    db.prepare("SELECT COUNT(*) n FROM visits WHERE case_id = ?").get(S(c.id)).n,
    (c.soapNotes || []).length);
}
console.log(mismatch ? `  ⛔ ${mismatch} 處不符` : "  ✓ 全部相符");

const total = [...counts.values()].reduce((a, b) => a + b, 0);
console.log(`\n合計 ${total} 列,寫在 ${counts.size} 張表。檔案 ${(fs.statSync(outFile).size / 1024).toFixed(0)} KB`);
console.log(`\n⚠️  ${outFile} 是臨床資料,絕對不可 commit(D7)。`);
console.log("    localStorage 仍是唯一正本;不要這份副本時直接刪檔,app 完全不受影響。");

db.close();
const bad = mismatch + rowErrors.length + unhandled.size;
process.exit(bad ? 1 : 0);
