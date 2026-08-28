#!/usr/bin/env node
/**
 * validate-clinical-contract-freeze.js — D12 臨床資料契約凍結閘(2026-08-27)。
 *
 * D12:自 2026-09-01 起,`data/clinical_cases/schema.sql`、case localStorage
 * 格式、匯出檔格式一律 **additive-only** —— 欄位可以加,永遠不准改名、改型別
 * 或移除。破壞性變更必須先有在測試資料上跑過的遷移腳本。
 *
 * 到今天為止那是一句紀律,沒有東西在檢查。9/2 開診之後 localStorage 裡是
 * 真實(去識別)病歷 —— 那份資產無法回填,而改名造成的損失是**靜默的**:
 * 舊備份還原時那個欄位就是不見,沒有任何錯誤訊息。
 *
 * 做法:把契約表面凍成一份基準檔(data/audits/clinical_contract_baseline.json),
 * 每次 CI 比對。三種變更的判定:
 *   新增欄位/表  → 允許(additive),提示要跑 --update 收進基準
 *   移除         → FAIL
 *   改型別       → FAIL
 *   改名         → 表現為「一移除一新增」,同樣 FAIL(訊息會點出可疑配對)
 *
 * 涵蓋四個面:
 *   1. schema.sql 的表與欄(型別一併記)
 *   2. sample_export_fixture.json 的匯出信封鍵與病例欄位形狀
 *      (這份 fixture 是 app 匯出形狀的存證,CI 已在用它守不變量)
 *   3. localStorage key 名稱(app.js 的 CASE_STORAGE_KEY / STAGING_KEY / POINTER)
 *   5. **v2 staging 的 patient 列 / envelope / journal 白名單**(2026-08-28 補)
 *      —— C2b 指針切過去之後真正在用的是 v2。envelope 層有 runtime assert,
 *      但 patient 列少一欄不會有任何人說話(見 scripts/lib/v2-store-shape.js)。
 *   4. **normalizeClinicalCase / normalizeSoapNote 的白名單**(2026-08-28 補)
 *      —— 前三個面都是「檔案」,而真正決定 localStorage 裡存下什麼的是「程式碼」。
 *      IMPLEMENTATION_GAP_REVIEW_2026-08-27 §4 G2 的負控:從 normalizeClinicalCase
 *      刪掉 allergyStatus,這支與另外四支臨床驗證器全部 exit 0。那條靜默刪除路徑
 *      由第四個面關上,形狀取得方式見 scripts/lib/clinical-normalizer-shape.js。
 *
 * 用法:
 *   node scripts/validate-clinical-contract-freeze.js            # 比對
 *   node scripts/validate-clinical-contract-freeze.js --update   # 收新增進基準
 *   node scripts/validate-clinical-contract-freeze.js --json
 *   node scripts/validate-clinical-contract-freeze.js --self-test  # 負控(不寫任何檔)
 *
 * --update 只接受「純新增」。有移除或型別變更時它會拒絕 —— 基準不是用來
 * 追認破壞的,那正是這支存在的理由。真的要破壞性變更:先寫遷移腳本、在
 * 測試資料上跑過、記一條 DECISIONS,然後用 --force-rebaseline "<理由>"。
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BASELINE = path.join(ROOT, "data/audits/clinical_contract_baseline.json");
const AS_JSON = process.argv.includes("--json");
const SELF_TEST = process.argv.includes("--self-test");
const appSrcIdx = process.argv.indexOf("--app-src");
const APP_SRC_PATH = appSrcIdx >= 0 ? process.argv[appSrcIdx + 1] : path.join(ROOT, "app.js");
const APP_SRC = fs.readFileSync(APP_SRC_PATH, "utf8");
const storeSrcIdx = process.argv.indexOf("--store-src");
const STORE_SRC_PATH = storeSrcIdx >= 0 ? process.argv[storeSrcIdx + 1] : path.join(ROOT, "js/clinical-store.js");
const STORE_SRC = fs.readFileSync(STORE_SRC_PATH, "utf8");
const { readNormalizerShapes } = require("./lib/clinical-normalizer-shape.js");
const { readV2StoreShapes } = require("./lib/v2-store-shape.js");

if (SELF_TEST) { require("./lib/clinical-contract-selftest.js").run(__filename, ROOT); return; }
const UPDATE = process.argv.includes("--update");
const rbIdx = process.argv.indexOf("--force-rebaseline");
const REBASELINE = rbIdx >= 0 ? process.argv[rbIdx + 1] : null;

// ---- 1. schema.sql ---------------------------------------------------------
function readSchema() {
  const sql = fs.readFileSync(path.join(ROOT, "data/clinical_cases/schema.sql"), "utf8");
  const tables = {};
  for (const m of sql.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g)) {
    const name = m[1];
    const start = m.index;
    const end = sql.indexOf("\n);", start);
    const body = sql.slice(start, end);
    const cols = {};
    for (const line of body.split("\n").slice(1)) {
      const c = line.trim().match(/^([a-z_]+)\s+(TEXT|INTEGER|REAL|BOOLEAN|BLOB)\b/i);
      if (c) cols[c[1]] = c[2].toUpperCase();
    }
    tables[name] = cols;
  }
  return tables;
}

// ---- 2. 匯出形狀 -----------------------------------------------------------
function readExportShape() {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "data/clinical_cases/sample_export_fixture.json"), "utf8"));
  const envelope = Array.isArray(raw) ? ["(bare array — pre-D12)"] : Object.keys(raw).sort();
  const cases = raw.cases || (Array.isArray(raw) ? raw : [raw]);
  const shape = {};
  const note = (scope, field, v) => {
    const t = Array.isArray(v) ? "array" : v === null ? "null" : typeof v;
    shape[scope] = shape[scope] || {};
    // null 不鎖型別 —— fixture 裡的 null 只代表這筆沒填,不是契約說它必須是 null
    if (shape[scope][field] === undefined || shape[scope][field] === "null") shape[scope][field] = t;
  };
  for (const c of cases) {
    for (const [k, v] of Object.entries(c)) {
      note("case", k, v);
      if (Array.isArray(v) && v.length && typeof v[0] === "object" && v[0]) {
        const child = k === "soapNotes" ? "soap" : k;
        for (const row of v) for (const [ck, cv] of Object.entries(row)) note(child, ck, cv);
      }
    }
  }
  return { envelope, shape };
}

// ---- 3. localStorage keys --------------------------------------------------
function readStorageKeys() {
  const app = APP_SRC;
  const store = STORE_SRC;
  const keys = new Set();
  for (const src of [app, store]) {
    for (const m of src.matchAll(/["'](acuting-clinical[\w-]*)["']/g)) keys.add(m[1]);
  }
  return [...keys].sort();
}

const normalizers = readNormalizerShapes(APP_SRC);
const v2Store = readV2StoreShapes(STORE_SRC);
const current = {
  schema: readSchema(),
  export: readExportShape(),
  storage_keys: readStorageKeys(),
  normalizers,
  v2_store: v2Store,
};

// ---- 比對 ------------------------------------------------------------------
const removed = [];
const retyped = [];
const added = [];

function diffCols(scope, base, now) {
  for (const [k, t] of Object.entries(base || {})) {
    if (!(k in (now || {}))) removed.push(`${scope}.${k}`);
    else if (now[k] !== t) retyped.push(`${scope}.${k}: ${t} → ${now[k]}`);
  }
  for (const k of Object.keys(now || {})) if (!(k in (base || {}))) added.push(`${scope}.${k}`);
}

let baseline = null;
if (fs.existsSync(BASELINE)) {
  baseline = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
  for (const [t, cols] of Object.entries(baseline.schema || {})) {
    if (!(t in current.schema)) { removed.push(`schema table ${t}`); continue; }
    diffCols(`schema.${t}`, cols, current.schema[t]);
  }
  for (const t of Object.keys(current.schema)) if (!(t in (baseline.schema || {}))) added.push(`schema table ${t}`);

  for (const k of baseline.export.envelope) if (!current.export.envelope.includes(k)) removed.push(`export envelope key "${k}"`);
  for (const k of current.export.envelope) if (!baseline.export.envelope.includes(k)) added.push(`export envelope key "${k}"`);

  for (const [scope, fields] of Object.entries(baseline.export.shape || {})) {
    diffCols(`export.${scope}`, fields, (current.export.shape || {})[scope]);
  }
  for (const scope of Object.keys(current.export.shape)) {
    if (!(scope in (baseline.export.shape || {}))) added.push(`export scope ${scope}`);
  }

  for (const k of baseline.storage_keys || []) if (!current.storage_keys.includes(k)) removed.push(`localStorage key "${k}"`);
  for (const k of current.storage_keys) if (!(baseline.storage_keys || []).includes(k)) added.push(`localStorage key "${k}"`);

  // 第四面:normalize* 白名單。scope 整個不見 = 那一批欄位全部移除,不是「沒事」
  const baseScopes = (baseline.normalizers && baseline.normalizers.scopes) || {};
  for (const [scope, fields] of Object.entries(baseScopes)) {
    if (!(scope in current.normalizers.scopes)) {
      for (const k of Object.keys(fields)) removed.push(`normalizer.${scope}.${k}`);
      continue;
    }
    diffCols(`normalizer.${scope}`, fields, current.normalizers.scopes[scope]);
  }
  for (const scope of Object.keys(current.normalizers.scopes)) {
    if (!(scope in baseScopes)) added.push(`normalizer scope ${scope}`);
  }

  // 第五面:v2 staging 的三個白名單(只比鍵集合 —— 靜態抽取看不到型別,
  // 不假裝看得到;少一個鍵就是靜默刪欄,這正是要擋的那件事)
  const baseV2 = (baseline.v2_store && baseline.v2_store.scopes) || {};
  for (const [scope, keys] of Object.entries(baseV2)) {
    const now = current.v2_store.scopes[scope] || [];
    for (const k of keys) if (!now.includes(k)) removed.push(`${scope}.${k}`);
    for (const k of now) if (!keys.includes(k)) added.push(`${scope}.${k}`);
  }
  for (const scope of Object.keys(current.v2_store.scopes)) {
    if (!(scope in baseV2)) added.push(`v2 scope ${scope}`);
  }
}

const breaking = removed.length + retyped.length;

// 改名偵測:同一 scope 下同時有一移除一新增,提示人類看一眼
const renameHints = [];
for (const r of removed) {
  const scope = r.split(".").slice(0, -1).join(".");
  const mate = added.find((a) => a.split(".").slice(0, -1).join(".") === scope);
  if (mate) renameHints.push(`${r}  ↔  ${mate}(疑似改名 —— D12 禁止;要改必須先有遷移腳本)`);
}

if (AS_JSON) {
  console.log(JSON.stringify({ defects: breaking, added: added.length, by_code: { removed: removed.length, retyped: retyped.length } }));
  process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
console.log("D12 臨床資料契約凍結閘\n");
console.log(`  schema 表/欄            ${Object.keys(current.schema).length} / ${Object.values(current.schema).reduce((n, c) => n + Object.keys(c).length, 0)}`);
console.log(`  匯出信封鍵              ${current.export.envelope.join(", ")}`);
console.log(`  localStorage keys       ${current.storage_keys.length}`);
console.log(`  normalize* 白名單        ${Object.keys(current.normalizers.scopes).length} 個 scope / ${Object.values(current.normalizers.scopes).reduce((n, f) => n + Object.keys(f).length, 0)} 欄`);
console.log(`  v2 staging 白名單        ${Object.keys(current.v2_store.scopes).length} 個 scope / ${Object.values(current.v2_store.scopes).reduce((n, k) => n + k.length, 0)} 鍵`);
for (const n of current.v2_store.notes) console.log(`  ⚠️  ${n}`);
if (current.normalizers.stubbed.length) {
  console.log(`  ⚠️  形狀是用 stub 推出來的(不可信,請補真實 helper):${current.normalizers.stubbed.join(", ")}`);
}
for (const [pathKey, kind] of Object.entries(current.normalizers.classify || {})) {
  if (kind === "passthrough_no_whitelist") console.log(`  ⚠️  ${pathKey} —— 程式碼原封不動收下整個物件,沒有白名單可凍`);
  if (kind === "unresolved_no_row") console.log(`  ⚠️  ${pathKey} —— 探針穿不過過濾器,這一批巢狀欄位沒有被凍住`);
}
console.log(`  基準檔                  ${baseline ? `有(${baseline.frozen_at})` : "尚未建立"}`);
if (baseline) {
  console.log(`  新增(允許)              ${added.length}`);
  console.log(`  移除(禁止)              ${removed.length}`);
  console.log(`  改型別(禁止)            ${retyped.length}\n`);
  for (const r of removed) console.log(`  ⛔ 移除  ${r}`);
  for (const r of retyped) console.log(`  ⛔ 改型別  ${r}`);
  for (const h of renameHints) console.log(`  ⚠️  ${h}`);
  for (const a of added.slice(0, 12)) console.log(`  ＋ 新增  ${a}`);
  if (added.length > 12) console.log(`  ＋ …還有 ${added.length - 12}`);
}

if (REBASELINE || (UPDATE && !breaking) || !baseline) {
  if (UPDATE && breaking && !REBASELINE) {
    console.error("\n拒絕 --update:有移除或型別變更。基準不是用來追認破壞的。");
    console.error("真要破壞性變更:先寫遷移腳本+在測試資料上跑過+記一條 DECISIONS,");
    console.error('然後 --force-rebaseline "<理由>"。');
    process.exit(1);
  }
  const next = {
    note: "D12 臨床資料契約凍結基準。additive-only:欄位可加,不准改名/改型別/移除。",
    frozen_at: baseline ? baseline.frozen_at : today,
    updated_at: today,
    rebaseline_history: [
      ...((baseline && baseline.rebaseline_history) || []),
      ...(REBASELINE ? [{ date: today, reason: REBASELINE }] : []),
    ],
    ...current,
  };
  fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + "\n");
  console.log(`\n基準${baseline ? (REBASELINE ? "已 REBASELINE(" + REBASELINE + ")" : "已更新(收進新增)") : "已建立"} → data/audits/clinical_contract_baseline.json`);
  process.exit(0);
}

if (breaking) {
  console.error(`\nFAIL — ${breaking} 個破壞性變更。D12 自 2026-09-01 起 additive-only。`);
  process.exit(1);
}
console.log(added.length ? "\nPASS — 只有新增(跑 --update 收進基準)。" : "\nPASS — 契約表面與基準一致。");
