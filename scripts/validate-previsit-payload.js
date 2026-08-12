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
// Shape 驗證委派給共用模組(js/previsit-validator.js)—— 與 app.js 同一份。
// Codex P1 retest MED-4:過去 CLI 與 app 各一份規則,self-test 只跑 CLI 這份,
// 於是 app 端的 metrics-shape 漂移可以在 "ALL PASS" 底下存活。現在 self-test
// 跑的就是 app 執行的那段程式碼。
require(path.join(__dirname, "..", "js", "previsit-validator.js"));   // UMD:掛上 globalThis
function validatePayload(rawText, config, registry) {
  const mod = globalThis.AcuTingPrevisitValidator;
  if (!mod || typeof mod.validatePrevisitShape !== "function") {
    throw new Error("js/previsit-validator.js did not load — refusing to validate with a second, drifting copy of the rules.");
  }
  const result = mod.validatePrevisitShape(rawText, {
    metricConfig: config,
    registryHas: (id) => registry.has(id),
    labelOf: (id) => shortLabel(registry.get(id), id)
  });
  return { ok: result.ok, errors: result.errors };
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
    formVersion: 1,
    payloadId: "pv-good1-abc123",
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
    formVersion: 1,
    payloadId: "pv-good2-def456",
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
    formVersion: 1,
    payloadId: "pv-good3-ghi789",
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

  // SOL P1 transport audit adversarial regression (2026-08-12). One bad
  // fixture per new blocking rule so a future weakening is caught in CI.
  const stripId = (p) => { const q = { ...p }; delete q.payloadId; return q; };  // HIGH-1 replay-bypass source
  const bad5NoPayloadId = stripId(good2);
  const bad6NoFormVersion = (() => { const q = { ...good2 }; delete q.formVersion; return q; })();
  const bad7FormVersionString = { ...good2, formVersion: "1" };
  // HIGH-2 coercion set: for metric.pain_score (min 0) each of these coerces to
  // a finite number under the OLD Number() rule and must now be rejected.
  const coerce = (v) => ({ ...good2, metrics: [{ metricId: "metric.pain_score", valueNumber: v }] });
  const bad8MetricNull = coerce(null);
  const bad9MetricFalse = coerce(false);
  const bad10MetricTrue = coerce(true);
  const bad11MetricEmptyStr = coerce("");
  const bad12MetricNumStr = coerce("4");
  const bad13MetricArray = coerce([]);
  // MED-1 oversized free text (>5000 prose limit).
  const bad14HugeText = { ...good2, subjectiveText: "x".repeat(5001) };

  // ---- Codex P1 adversarial retest (2026-08-12) permanent regression ----
  // Every one of these was an ACCEPT (or an app/CLI divergence) at 0f59773.
  // HIGH-1: metrics as an object — app silently degraded it to [] and
  // prefilled zero items while the CLI rejected. Same rules now, one module.
  const bad15MetricsNotArray = { ...good2, metrics: { metricId: "metric.pain_score", valueNumber: 4 } };
  const bad16MetricsString = { ...good2, metrics: "metric.pain_score=4" };
  // HIGH-2: magnitudes JSON.parse silently rewrites, and transport/save drift.
  const bad17UnsafeInteger = { ...good2, metrics: [{ metricId: "metric.sleep_hours", valueNumber: 9007199254740993 }] };
  const bad18HugeExponent = { ...good2, metrics: [{ metricId: "metric.sleep_hours", valueNumber: 1e308 }] };
  // MED-1: metric outside the six the patient page can actually produce.
  const bad19OffSubsetMetric = { ...good2, metrics: [{ metricId: "metric.effect_duration_days", valueNumber: 3 }] };
  // MED-2: Date.parse-able but not ISO 8601.
  const bad20NonIsoTimestamp = { ...good2, filledAt: "0" };
  const bad21LooseTimestamp = { ...good2, filledAt: "2026/08/11 09:00" };
  // Deterministic duplicate handling (prefill last-write/first-write ambiguity).
  const bad22DuplicateMetricId = {
    ...good2,
    metrics: [
      { metricId: "metric.pain_score", valueNumber: 2 },
      { metricId: "metric.pain_score", valueNumber: 9 }
    ]
  };

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
      { name: "bad4_patientCode_wrong_type", payload: bad4PatientCodeType },
      { name: "bad5_no_payloadId_replay_bypass", payload: bad5NoPayloadId },
      { name: "bad6_no_formVersion", payload: bad6NoFormVersion },
      { name: "bad7_formVersion_string", payload: bad7FormVersionString },
      { name: "bad8_metric_null_coercion", payload: bad8MetricNull },
      { name: "bad9_metric_false_coercion", payload: bad9MetricFalse },
      { name: "bad10_metric_true_coercion", payload: bad10MetricTrue },
      { name: "bad11_metric_empty_string_coercion", payload: bad11MetricEmptyStr },
      { name: "bad12_metric_numeric_string", payload: bad12MetricNumStr },
      { name: "bad13_metric_array_coercion", payload: bad13MetricArray },
      { name: "bad14_oversized_free_text", payload: bad14HugeText },
      { name: "bad15_metrics_object_not_array", payload: bad15MetricsNotArray },
      { name: "bad16_metrics_string_not_array", payload: bad16MetricsString },
      { name: "bad17_unsafe_integer_precision", payload: bad17UnsafeInteger },
      { name: "bad18_huge_exponent_transport_save_drift", payload: bad18HugeExponent },
      { name: "bad19_metric_outside_p1_subset", payload: bad19OffSubsetMetric },
      { name: "bad20_non_iso_timestamp", payload: bad20NonIsoTimestamp },
      { name: "bad21_loose_timestamp_format", payload: bad21LooseTimestamp },
      { name: "bad22_duplicate_metricId", payload: bad22DuplicateMetricId }
    ]
  };
}

/* Codex P1 retest MED-4 的結構性防線:self-test 跑的是共用模組,但如果有人
 * 未來在 app.js 裡「順手」重新寫一份 shape 規則,漂移就會回來,而這支 CLI
 * 仍然全綠(這正是 0f59773 當時發生的事)。這裡靜態檢查 app.js 的
 * validatePrevisitPayload 確實委派共用模組、且沒有自己的 JSON.parse 規則。
 * 純字串檢查、零執行風險。 */
function checkAppDelegation() {
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const start = src.indexOf("function validatePrevisitPayload(raw) {");
  if (start === -1) return ["app.js: validatePrevisitPayload not found — has it been renamed?"];
  const end = src.indexOf("\n}", start);
  const body = src.slice(start, end === -1 ? src.length : end);
  const problems = [];
  if (!body.includes("AcuTingPrevisitValidator")) {
    problems.push("app.js validatePrevisitPayload no longer delegates to AcuTingPrevisitValidator — the app/CLI drift this suite exists to prevent has been reintroduced.");
  }
  if (body.includes("JSON.parse")) {
    problems.push("app.js validatePrevisitPayload parses the payload itself — shape rules must live only in js/previsit-validator.js.");
  }
  const idx = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  if (!idx.includes("js/previsit-validator.js")) {
    problems.push("index.html does not load js/previsit-validator.js — the browser app would fail closed on every paste-import.");
  }
  return problems;
}

function runSelfTest(config, registry) {
  const fixtures = selfTestFixtures();
  let allOk = true;
  const lines = [];

  const delegationProblems = checkAppDelegation();
  delegationProblems.forEach((p) => lines.push(`FAIL [parity] ${p}`));
  if (!delegationProblems.length) lines.push("PASS [parity] app.js delegates shape validation to the shared module; index.html loads it");
  allOk = allOk && delegationProblems.length === 0;

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
