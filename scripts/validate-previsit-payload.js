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
  // ---- Codex focused retest round 2 (2026-08-12) permanent regression ----
  // All four were ACCEPT at 38ec34ca.
  // HIGH-1: JSON.parse truncates the fraction before any value check runs, so
  // the magnitude guard sees an in-range integer and lets the rewritten value
  // through. sleep_hours has no max, which is what made it reachable.
  // MUST be raw text. Written as a JS object literal the fraction is already
  // gone before JSON.stringify runs, so the validator would receive the
  // harmless truncated integer — this defect only exists in the payload's
  // source text, which is exactly why the check operates on that text.
  const bad23FractionalTruncationRaw = JSON.stringify(good2).replace(
    '"metrics":[]',
    '"metrics":[{"metricId":"metric.sleep_hours","valueNumber":9007199254740990.5}]'
  );
  // MED-1: legal tiny decimal — transport accepted it, but prefill stringifies
  // to "1e-7" and the save-time regex rejects that, so it could never be saved.
  const bad24ExponentForm = { ...good2, metrics: [{ metricId: "metric.sleep_hours", valueNumber: 0.0000001 }] };
  // MED-2: ISO *shape* is valid but the date does not exist; engines normalise
  // it into March and the normalised time then feeds the freshness rules.
  const bad25ImpossibleDate = { ...good2, filledAt: "2026-02-31T09:00:00.000Z" };
  const bad26Month13 = { ...good2, filledAt: "2026-13-01T09:00:00.000Z" };

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
      { name: "bad22_duplicate_metricId", payload: bad22DuplicateMetricId },
      { name: "bad23_fractional_token_truncated_by_parse", rawText: bad23FractionalTruncationRaw },
      { name: "bad24_exponent_form_save_would_reject", payload: bad24ExponentForm },
      { name: "bad25_iso_shape_but_impossible_date", payload: bad25ImpossibleDate },
      { name: "bad26_iso_shape_but_month_13", payload: bad26Month13 }
    ]
  };
}

/* app 委派的**行為**證明(Codex retest MED-4)。
 *
 * 第一版是字串檢查:只要 wrapper body 提到 "AcuTingPrevisitValidator" 且不含
 * "JSON.parse" 就算過。Codex 指出這證明不了任何事 —— 把 wrapper 改成「提到那個
 * 物件、但自己造結果、從不呼叫 validatePrevisitShape()」,guard 與 3+22 仍全綠。
 *
 * 改成真的跑:把 app.js 的 validatePrevisitPayload 原始碼抽出來,在沙箱裡用
 * stub 注入它的三個依賴,然後餵真 payload,比對它的判決是否**逐筆等於**共用
 * 模組的判決。同時掛一個 call counter —— 沒有真的呼叫到共用模組就 FAIL。
 * (抽函式原始碼再 eval 是本檔既有手法,見 loadNumericOutcomeMetricConfig。)
 *
 * 這樣「app 與 CLI 用同一把尺」從宣稱變成每次 CI 都重新證明一次。 */
function extractFunctionSource(src, signature) {
  const start = src.indexOf(signature);
  if (start === -1) return null;
  let depth = 0, started = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === "{") { depth++; started = true; }
    else if (c === "}") { depth--; if (started && depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}

function checkAppDelegation() {
  const problems = [];
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const fnSrc = extractFunctionSource(src, "function validatePrevisitPayload(raw) {");
  if (!fnSrc) return ["app.js: validatePrevisitPayload not found — has it been renamed?"];

  const idx = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  if (!idx.includes("js/previsit-validator.js")) {
    problems.push("index.html does not load js/previsit-validator.js — the browser app would fail closed on every paste-import.");
  }

  const config = loadNumericOutcomeMetricConfig();
  const registry = loadOutcomeMetricRegistry();
  const real = globalThis.AcuTingPrevisitValidator;

  // Sandbox: a spy module that forwards to the real one and counts calls.
  let calls = 0;
  const spy = Object.assign({}, real, {
    validatePrevisitShape(rawText, opts) { calls++; return real.validatePrevisitShape(rawText, opts); }
  });
  let appFn;
  try {
    // eslint-disable-next-line no-new-func -- evaluating our own app.js function
    appFn = new Function(
      "globalThis_stub", "NUMERIC_OUTCOME_METRIC_CONFIG", "getOutcomeMetricDef", "outcomeMetricShortLabel",
      "\"use strict\";\n" +
      "const globalThis = globalThis_stub;\n" +
      fnSrc + "\nreturn validatePrevisitPayload;"
    )({ AcuTingPrevisitValidator: spy }, config, (id) => registry.get(id), (id) => shortLabel(registry.get(id), id));
  } catch (e) {
    return problems.concat(["app.js validatePrevisitPayload could not be evaluated in isolation (" + e.message + ") — its dependencies changed; update this guard rather than deleting it."]);
  }

  // Behavioural parity: every fixture must get the same verdict from both.
  const fixtures = selfTestFixtures();
  const cases = [...fixtures.good.map((f) => ({ ...f, expectOk: true })), ...fixtures.bad.map((f) => ({ ...f, expectOk: false }))];
  let mismatches = 0;
  for (const c of cases) {
    const raw = c.rawText !== undefined ? c.rawText : JSON.stringify(c.payload);
    const shared = real.validatePrevisitShape(raw, {
      metricConfig: config, registryHas: (id) => registry.has(id), labelOf: (id) => shortLabel(registry.get(id), id)
    });
    let appRes;
    try { appRes = appFn(raw); } catch (e) { appRes = { error: "threw: " + e.message }; }
    const appOk = !appRes.error;
    if (appOk !== shared.ok) {
      mismatches++;
      problems.push("app/CLI verdict differs on " + c.name + ": app " + (appOk ? "ACCEPT" : "REJECT") + " vs shared module " + (shared.ok ? "ACCEPT" : "REJECT"));
    }
  }
  if (calls < cases.length) {
    problems.push("app.js validatePrevisitPayload did not call validatePrevisitShape for every payload (" + calls + "/" + cases.length + ") — it is not actually delegating, only referencing the module.");
  }
  if (!problems.length) {
    console.log("  [parity] app wrapper executed on " + cases.length + " fixtures, " + calls + " delegated calls, " + mismatches + " verdict mismatches");
  }
  return problems;
}

function runSelfTest(config, registry) {
  const fixtures = selfTestFixtures();
  let allOk = true;
  const lines = [];

  // Codex retest round 2 MED-3:控制字元政策是「剝除」而不是「拒收」,所以它
  // 不是一個 bad fixture,而是一條輸出斷言 —— 這些看不見的字元一個都不准留在
  // 病歷文字裡。第一版只剝 C0/DEL 與 bidi override,以下五個全數存活。
  const controlProbes = {
    "U+0085 NEL": "\u0085",
    "U+009B CSI": "\u009B",
    "U+200E LRM": "\u200E",
    "U+200F RLM": "\u200F",
    "U+061C ALM": "\u061C",
    "U+200B ZWSP": "\u200B",
    "U+FEFF BOM": "\uFEFF",
    "U+202E RLO": "\u202E",
    "U+0000 NUL": "\u0000"
  };
  const mod = globalThis.AcuTingPrevisitValidator;
  for (const [name, ch] of Object.entries(controlProbes)) {
    const cleaned = mod.stripControlChars("A" + ch + "B");
    const ok = cleaned === "AB";
    allOk = allOk && ok;
    lines.push(`${ok ? "PASS" : "FAIL"} [control] ${name} stripped from patient text${ok ? "" : ` — got ${JSON.stringify(cleaned)}`}`);
  }
  // 合法文字不得被誤傷(tab / newline / 全形標點 / 小數點都要留著)。
  const keep = "睡眠 5.5 小時\n第二行\t欄位,還好。";
  const keepOk = mod.stripControlChars(keep) === keep;
  allOk = allOk && keepOk;
  lines.push(`${keepOk ? "PASS" : "FAIL"} [control] legitimate text with tab/newline/decimal preserved unchanged`);
  const delegationProblems = checkAppDelegation();
  delegationProblems.forEach((p) => lines.push(`FAIL [parity] ${p}`));
  if (!delegationProblems.length) lines.push("PASS [parity] app.js delegates shape validation to the shared module; index.html loads it");
  allOk = allOk && delegationProblems.length === 0;

  fixtures.good.forEach((f) => {
    const result = validatePayload(f.rawText !== undefined ? f.rawText : JSON.stringify(f.payload), config, registry);
    const pass = result.ok === true;
    allOk = allOk && pass;
    lines.push(`${pass ? "PASS" : "FAIL"} [good] ${f.name}${pass ? "" : " — expected OK, got errors: " + result.errors.join(" | ")}`);
  });
  fixtures.bad.forEach((f) => {
    const result = validatePayload(f.rawText !== undefined ? f.rawText : JSON.stringify(f.payload), config, registry);
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
