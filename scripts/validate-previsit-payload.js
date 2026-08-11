#!/usr/bin/env node
/**
 * validate-previsit-payload.js
 *
 * CLI validator for the P1 pre-visit intake payload
 * (docs/P1_PREVISIT_INTAKE_CONTRACT_v0.md §3 shape, §4 rules). Same rules
 * as app.js's validatePrevisitPayload() (the SOAP form's "貼上診前資料"
 * paste-import) and previsit.html's own client-side check — three
 * independent implementations of one contract, so this script exists to
 * let CI/a developer check a payload file without opening the app.
 *
 * The metricId whitelist is NOT hand-duplicated here. It is extracted
 * straight out of app.js's own `const NUMERIC_OUTCOME_METRIC_CONFIG = [...]`
 * array literal at run time (loadNumericOutcomeMetricConfig below) — one
 * source of truth, so this script can never silently drift from what the
 * SOAP form itself accepts. The registry existence check reads
 * data/clinical_cases/outcome_metrics.json directly, same as
 * getOutcomeMetricDef() does in app.js.
 *
 * Usage:
 *   node scripts/validate-previsit-payload.js <path-to-payload.json>
 *   node scripts/validate-previsit-payload.js --self-test
 *
 * Exit code 0 = payload valid (or, in --self-test mode, every fixture
 * behaved as expected). Exit code 1 = invalid (or a self-test fixture
 * failed its expectation).
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// ---------------------------------------------------------------------
// Single source of truth: pull NUMERIC_OUTCOME_METRIC_CONFIG's array
// literal text straight out of app.js and evaluate ONLY that literal (not
// the rest of app.js, which assumes a DOM and would need heavy stubbing —
// see scripts/validate-data.js for that pattern elsewhere in this repo).
// A brace/bracket-depth scan finds the matching closing `]`, so this
// survives the array growing new entries or having its comments edited,
// as long as the `const NUMERIC_OUTCOME_METRIC_CONFIG = [` declaration
// text itself doesn't change.
// ---------------------------------------------------------------------
function loadNumericOutcomeMetricConfig() {
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const marker = "const NUMERIC_OUTCOME_METRIC_CONFIG = [";
  const markerStart = src.indexOf(marker);
  if (markerStart === -1) {
    throw new Error("NUMERIC_OUTCOME_METRIC_CONFIG declaration not found in app.js — has it been renamed?");
  }
  const arrayStart = markerStart + marker.length - 1; // index of the "["
  let depth = 0;
  let arrayEnd = -1;
  for (let i = arrayStart; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") {
      depth--;
      if (depth === 0) { arrayEnd = i; break; }
    }
  }
  if (arrayEnd === -1) {
    throw new Error("Could not find the matching \"]\" for NUMERIC_OUTCOME_METRIC_CONFIG in app.js.");
  }
  const arrayLiteral = src.slice(arrayStart, arrayEnd + 1);
  // eslint-disable-next-line no-new-func -- evaluating a plain array
  // literal extracted from our own app.js, not arbitrary input.
  return new Function(`"use strict"; return (${arrayLiteral});`)();
}

function loadOutcomeMetricRegistry() {
  const raw = fs.readFileSync(path.join(ROOT, "data/clinical_cases/outcome_metrics.json"), "utf8");
  const json = JSON.parse(raw);
  return new Map((json.records || []).map((r) => [r.id, r]));
}

function shortLabel(def, metricId) {
  const zh = def ? (def.label_zh || def.name || metricId) : metricId;
  return zh.replace(/[（(][^）)]*[）)]/g, "").trim();
}

// ---------------------------------------------------------------------
// Validation (contract §4). Collects EVERY problem found (not just the
// first) so a CI run / developer gets the full picture in one pass, but
// the accept/reject verdict itself is still "any error => reject the
// whole payload" — exactly the same all-or-nothing rule app.js and
// previsit.html apply ("非法整筆拒收並顯示原因").
// ---------------------------------------------------------------------
function validatePayload(rawText, config, registry) {
  const errors = [];
  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    return { ok: false, errors: [`不是合法的 JSON。Not valid JSON: ${e.message}`] };
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, errors: ["資料格式錯誤，不是一個物件。Invalid payload — not an object."] };
  }

  if (data.kind !== "acuting-previsit-v1") {
    errors.push(`kind 欄位不是 "acuting-previsit-v1"（實際："${data.kind}"）。kind is not "acuting-previsit-v1" (got: "${data.kind}").`);
  }
  if (typeof data.patientCode !== "string") {
    errors.push(`patientCode 必須是文字（實際型別："${typeof data.patientCode}"）。patientCode must be a string (got type: "${typeof data.patientCode}").`);
  }

  const rawMetrics = Array.isArray(data.metrics) ? data.metrics : [];
  if (data.metrics !== undefined && !Array.isArray(data.metrics)) {
    errors.push('metrics 必須是陣列。metrics must be an array.');
  }
  rawMetrics.forEach((m, i) => {
    if (!m || typeof m.metricId !== "string" || !m.metricId) {
      errors.push(`metrics[${i}] 缺少 metricId。metrics[${i}] is missing metricId.`);
      return;
    }
    const cfg = config.find((c) => c.metricId === m.metricId);
    if (!cfg) {
      errors.push(`metrics[${i}]：metricId「${m.metricId}」不在白名單內。metricId "${m.metricId}" is not in the allowed set.`);
      return;
    }
    if (!registry.has(m.metricId)) {
      errors.push(`metrics[${i}]：metricId「${m.metricId}」在 registry（data/clinical_cases/outcome_metrics.json）找不到對應紀錄。metricId not found in the registry.`);
      return;
    }
    const num = Number(m.valueNumber);
    if (!Number.isFinite(num)) {
      errors.push(`metrics[${i}]（${shortLabel(registry.get(m.metricId), m.metricId)}）：valueNumber 不是數字（實際："${m.valueNumber}"）。valueNumber is not a number (got: "${m.valueNumber}").`);
      return;
    }
    const shapeOk = cfg.integer ? Number.isInteger(num) : true;
    const rangeOk = num >= cfg.min && (cfg.max == null || num <= cfg.max);
    if (!shapeOk || !rangeOk) {
      const rangeText = cfg.max != null ? `${cfg.min}–${cfg.max}` : `${cfg.min} 以上`;
      const shapeText = cfg.integer ? "整數" : "數字（可含小數）";
      errors.push(`metrics[${i}]（${shortLabel(registry.get(m.metricId), m.metricId)}）：須為 ${rangeText} 的${shapeText}（實際：${m.valueNumber}）。Must be a ${shapeText} in range ${rangeText} (got: ${m.valueNumber}).`);
    }
  });

  return { ok: errors.length === 0, errors };
}

// ---------------------------------------------------------------------
// --self-test fixtures: 3 good, 4 bad — one bad fixture per distinct
// violation class (kind, whitelist membership, range/shape, patientCode
// type) so a future validator regression that only breaks ONE check class
// still gets caught.
// ---------------------------------------------------------------------
function selfTestFixtures() {
  const good1 = {
    kind: "acuting-previsit-v1",
    patientCode: "P-2026-001",
    filledAt: "2026-08-11T09:00:00.000Z",
    metrics: [
      { metricId: "metric.pain_score", valueNumber: 4 },
      { metricId: "metric.sleep_hours", valueNumber: 6.5 },
      { metricId: "metric.stress_level", valueNumber: 7 },
      { metricId: "metric.mood", valueNumber: 5 },
      { metricId: "metric.energy_level", valueNumber: 3 },
      { metricId: "metric.pgic", valueNumber: 2 }
    ],
    subjectiveText: "睡眠比較好，但壓力還是很大",
    patientPerspective: "整體覺得有進步，希望能睡更久",
    aeSelfReport: { any: true, text: "針後輕微瘀青，兩天內消退" },
    exposureSelfReport: { any: false, text: "" }
  };
  const good2 = {
    // Minimal payload: every optional field empty/absent-equivalent — must
    // still validate, since "not measured" is always legal (contract §2:
    // every metric question may be left blank).
    kind: "acuting-previsit-v1",
    patientCode: "P-min-002",
    filledAt: "2026-08-11T09:05:00.000Z",
    metrics: [],
    subjectiveText: "",
    patientPerspective: "",
    aeSelfReport: { any: false, text: "" },
    exposureSelfReport: { any: false, text: "" }
  };
  const good3 = {
    // Partial metrics + a decimal sleep_hours value (non-integer allowed
    // for that one metric specifically) + unicode patientCode.
    kind: "acuting-previsit-v1",
    patientCode: "病人代碼-三號",
    filledAt: "2026-08-11T09:10:00.000Z",
    metrics: [
      { metricId: "metric.sleep_hours", valueNumber: 5.25 },
      { metricId: "metric.pgic", valueNumber: 1 }
    ],
    subjectiveText: "",
    patientPerspective: "",
    aeSelfReport: { any: false, text: "" },
    exposureSelfReport: { any: true, text: "停用魚油" }
  };

  const bad1WrongKind = { ...good1, kind: "acuting-previsit-v2" };
  const bad2UnknownMetric = {
    ...good2,
    metrics: [{ metricId: "metric.totally_made_up_metric", valueNumber: 1 }]
  };
  const bad3OutOfRange = {
    ...good2,
    metrics: [{ metricId: "metric.pgic", valueNumber: 9 }] // pgic max is 7
  };
  const bad4PatientCodeType = { ...good2, patientCode: 12345 };

  return {
    good: [
      { name: "good1_full_payload", payload: good1 },
      { name: "good2_minimal_payload", payload: good2 },
      { name: "good3_partial_metrics_decimal_unicode", payload: good3 }
    ],
    bad: [
      { name: "bad1_wrong_kind", payload: bad1WrongKind },
      { name: "bad2_metric_not_whitelisted", payload: bad2UnknownMetric },
      { name: "bad3_value_out_of_range", payload: bad3OutOfRange },
      { name: "bad4_patientCode_wrong_type", payload: bad4PatientCodeType }
    ]
  };
}

function runSelfTest(config, registry) {
  const fixtures = selfTestFixtures();
  let allOk = true;
  const lines = [];

  fixtures.good.forEach((f) => {
    const result = validatePayload(JSON.stringify(f.payload), config, registry);
    const pass = result.ok === true;
    allOk = allOk && pass;
    lines.push(`${pass ? "PASS" : "FAIL"} [good] ${f.name}${pass ? "" : " — expected OK, got errors: " + result.errors.join(" | ")}`);
  });
  fixtures.bad.forEach((f) => {
    const result = validatePayload(JSON.stringify(f.payload), config, registry);
    const pass = result.ok === false && result.errors.length > 0;
    allOk = allOk && pass;
    lines.push(`${pass ? "PASS" : "FAIL"} [bad]  ${f.name}${pass ? " — rejected as expected: " + result.errors.join(" | ") : " — expected rejection, got OK"}`);
  });

  lines.forEach((l) => console.log(l));
  console.log(allOk ? `\nSELF-TEST: ALL PASS (${fixtures.good.length} good + ${fixtures.bad.length} bad)` : "\nSELF-TEST: FAILED");
  return allOk;
}

function main() {
  const args = process.argv.slice(2);
  const config = loadNumericOutcomeMetricConfig();
  const registry = loadOutcomeMetricRegistry();

  if (args.includes("--self-test")) {
    const ok = runSelfTest(config, registry);
    process.exit(ok ? 0 : 1);
  }

  const filePath = args[0];
  if (!filePath) {
    console.error("Usage: node scripts/validate-previsit-payload.js <path-to-payload.json>");
    console.error("       node scripts/validate-previsit-payload.js --self-test");
    process.exit(1);
  }
  const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  let rawText;
  try {
    rawText = fs.readFileSync(absPath, "utf8");
  } catch (e) {
    console.error(`無法讀取檔案 Could not read file: ${absPath}\n${e.message}`);
    process.exit(1);
  }
  const result = validatePayload(rawText, config, registry);
  if (result.ok) {
    console.log(`PASS — payload is valid: ${absPath}`);
    process.exit(0);
  } else {
    console.log(`FAIL — payload rejected: ${absPath}`);
    result.errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }
}

main();
