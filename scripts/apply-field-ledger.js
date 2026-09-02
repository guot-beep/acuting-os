#!/usr/bin/env node
/**
 * apply-field-ledger.js — 把「唯讀 agent 產出的帳本」落到資料檔,逐條驗證後才寫。
 *
 * 為什麼要有這支:agent 直接改 data/**.json 會有三個問題 —— 平行改同一個檔互相覆蓋、
 * 改到沒被指派的欄位沒人發現、出事無法逐條回溯。帳本模式把「決定」與「寫入」分開:
 * agent 唯讀產出 {target, expect, value},這支負責「現況必須等於 expect 才寫」。
 *
 * 帳本格式(JSON 陣列;每條都要有):
 *   { "file": "data/herbs/formulas.json",       // repo 相對路徑
 *     "record": "formula.gui_zhi_tang",          // records[] 裡的 id(找不到 → 拒絕)
 *     "path": "treats_zh[23]",                   // 記錄內的欄位路徑,支援 a、a[i]、a[i].b
 *     "expect": "Neuralgia",                     // 寫入前現況必須逐位元組等於它;null = 該處必須不存在
 *     "value": "神經痛" }                         // 要寫進去的值
 *
 * 規則(每一條都是為了「寧可少寫,不可寫錯」):
 *   - expect 不符 → 這條不寫,計入 mismatch(資料在帳本產出後被別人動過,人工看)。
 *   - 陣列索引超出長度 → 只允許「剛好接在尾端」且 expect 為 null;跳號一律拒絕(不製造空洞)。
 *   - 目標欄位不存在但 expect 為 null → 建立(這是 _en 欄位從無到有的情形)。
 *   - 一條路徑在同一批出現兩次 → 整批拒絕(帳本自己有矛盾,不能猜哪條對)。
 *   - 縮排、尾端換行沿用原檔;沒有實際變動的檔案不重寫(避免假 diff)。
 *   - --dry-run 只報告不寫;--self-test 用合成檔驗行為(不碰 repo)。
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

function parsePath(p) {
  const steps = [];
  const re = /^([A-Za-z_][A-Za-z0-9_]*)|^\[(\d+)\]|^\.([A-Za-z_][A-Za-z0-9_]*)/;
  let rest = String(p);
  while (rest.length) {
    const m = rest.match(re);
    if (!m) throw new Error(`bad path segment near "${rest}" in "${p}"`);
    if (m[1] !== undefined) steps.push({ key: m[1] });
    else if (m[2] !== undefined) steps.push({ index: Number(m[2]) });
    else steps.push({ key: m[3] });
    rest = rest.slice(m[0].length);
  }
  if (!steps.length || steps[0].key === undefined) throw new Error(`path must start with a field name: "${p}"`);
  return steps;
}

/** 走到倒數第二步,回傳 {container, last}。needed=true 時沿路建立缺少的容器。 */
function walk(record, steps, create) {
  let cur = record;
  for (let i = 0; i < steps.length - 1; i++) {
    const s = steps[i], next = steps[i + 1];
    const key = s.key !== undefined ? s.key : s.index;
    if (cur[key] === undefined || cur[key] === null) {
      if (!create) return null;
      cur[key] = next.index !== undefined ? [] : {};
    }
    cur = cur[key];
    if (typeof cur !== "object") return null;
  }
  return { container: cur, last: steps[steps.length - 1] };
}

function readAt(record, steps) {
  const w = walk(record, steps, false);
  if (!w) return undefined;
  const { container, last } = w;
  const key = last.key !== undefined ? last.key : last.index;
  if (last.index !== undefined && !Array.isArray(container)) return undefined;
  return container[key];
}

function applyEntry(record, entry) {
  const steps = parsePath(entry.path);
  const current = readAt(record, steps);
  const expect = entry.expect === undefined ? null : entry.expect;
  const currentNorm = current === undefined ? null : current;
  if (String(currentNorm) !== String(expect) || (currentNorm === null) !== (expect === null)) {
    return { ok: false, why: "mismatch", current: currentNorm };
  }
  const w = walk(record, steps, true);
  if (!w) return { ok: false, why: "unreachable_path" };
  const { container, last } = w;
  if (last.index !== undefined) {
    if (!Array.isArray(container)) return { ok: false, why: "not_an_array" };
    if (last.index > container.length) return { ok: false, why: "index_gap" };
    container[last.index] = entry.value;
  } else {
    if (Array.isArray(container)) return { ok: false, why: "field_on_array" };
    container[last.key] = entry.value;
  }
  return { ok: true };
}

function detectIndent(raw) {
  const m = raw.match(/\n([ \t]+)"/);
  return m ? m[1] : "  ";
}

function apply(ledger, opts) {
  const root = (opts && opts.root) || ROOT;
  const dryRun = !!(opts && opts.dryRun);
  const log = (opts && opts.log) || (() => {});
  const seen = new Set();
  for (const e of ledger) {
    const k = `${e.file}|${e.record}|${e.path}`;
    if (seen.has(k)) throw new Error(`帳本自我矛盾:同一個目標出現兩次 → ${k}`);
    seen.add(k);
  }
  const byFile = new Map();
  for (const e of ledger) {
    if (!byFile.has(e.file)) byFile.set(e.file, []);
    byFile.get(e.file).push(e);
  }
  const report = { applied: 0, mismatch: [], errors: [], files: {} };
  for (const [file, entries] of byFile) {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) { report.errors.push(`${file}: 檔案不存在`); continue; }
    const raw = fs.readFileSync(abs, "utf8");
    const indent = detectIndent(raw);
    const json = JSON.parse(raw);
    const records = Array.isArray(json) ? json : json.records;
    if (!Array.isArray(records)) { report.errors.push(`${file}: 找不到 records 陣列`); continue; }
    const byId = new Map(records.map((r) => [r.id, r]));
    let applied = 0;
    for (const e of entries) {
      const rec = byId.get(e.record);
      if (!rec) { report.errors.push(`${file}: 找不到記錄 ${e.record}`); continue; }
      let res;
      try { res = applyEntry(rec, e); }
      catch (err) { report.errors.push(`${file} ${e.record} ${e.path}: ${err.message}`); continue; }
      if (res.ok) { applied++; report.applied++; }
      else if (res.why === "mismatch") report.mismatch.push({ file, record: e.record, path: e.path, expect: e.expect, current: res.current });
      else report.errors.push(`${file} ${e.record} ${e.path}: ${res.why}`);
    }
    report.files[file] = applied;
    if (applied && !dryRun) {
      const out = JSON.stringify(json, null, indent) + (raw.endsWith("\n") ? "\n" : "");
      if (out !== raw) fs.writeFileSync(abs, out);
      log(`${file}: 寫入 ${applied} 條`);
    }
  }
  return report;
}

function selfTest() {
  const os = require("os");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "acuting-ledger-"));
  const file = "d.json";
  const write = (obj) => fs.writeFileSync(path.join(dir, file), JSON.stringify(obj, null, 2) + "\n");
  const read = () => JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  const assert = require("assert");
  let n = 0; const ok = (m) => { n++; console.log(`  ✓ ${m}`); };

  write({ records: [{ id: "r1", treats_zh: ["Neuralgia", "頭痛"], nested: [{ analysis_zh: "Foo Bar" }], plain: "x" }] });
  let rep = apply([{ file, record: "r1", path: "treats_zh[0]", expect: "Neuralgia", value: "神經痛" }], { root: dir });
  assert.strictEqual(rep.applied, 1); assert.strictEqual(read().records[0].treats_zh[0], "神經痛");
  assert.strictEqual(read().records[0].treats_zh[1], "頭痛");
  ok("陣列元素:expect 相符 → 寫入,鄰居不動");

  rep = apply([{ file, record: "r1", path: "treats_zh[1]", expect: "不是這個", value: "X" }], { root: dir });
  assert.strictEqual(rep.applied, 0); assert.strictEqual(rep.mismatch.length, 1);
  assert.strictEqual(read().records[0].treats_zh[1], "頭痛");
  ok("expect 不符 → 拒絕寫入並記 mismatch");

  rep = apply([{ file, record: "r1", path: "nested[0].analysis_zh", expect: "Foo Bar", value: "甲乙" }], { root: dir });
  assert.strictEqual(rep.applied, 1); assert.strictEqual(read().records[0].nested[0].analysis_zh, "甲乙");
  ok("巢狀路徑 a[i].b");

  rep = apply([{ file, record: "r1", path: "indications_en", expect: null, value: ["A"] }], { root: dir });
  assert.strictEqual(rep.applied, 1); assert.deepStrictEqual(read().records[0].indications_en, ["A"]);
  ok("欄位不存在 + expect null → 建立(_en 從無到有)");

  rep = apply([{ file, record: "r1", path: "indications_en[1]", expect: null, value: "B" }], { root: dir });
  assert.strictEqual(rep.applied, 1); assert.deepStrictEqual(read().records[0].indications_en, ["A", "B"]);
  ok("接在陣列尾端 → 允許");

  rep = apply([{ file, record: "r1", path: "indications_en[5]", expect: null, value: "C" }], { root: dir });
  assert.strictEqual(rep.applied, 0); assert(rep.errors.some((e) => /index_gap/.test(e)));
  assert.strictEqual(read().records[0].indications_en.length, 2);
  ok("跳號 → 拒絕(不製造空洞)");

  rep = apply([{ file, record: "nope", path: "x", expect: null, value: "1" }], { root: dir });
  assert(rep.errors.some((e) => /找不到記錄/.test(e))); ok("記錄 id 不存在 → 記錯誤,不寫");

  let threw = null;
  try { apply([{ file, record: "r1", path: "plain", expect: "x", value: "1" }, { file, record: "r1", path: "plain", expect: "x", value: "2" }], { root: dir }); }
  catch (e) { threw = e; }
  assert(threw && /自我矛盾/.test(threw.message)); assert.strictEqual(read().records[0].plain, "x");
  ok("同一目標在帳本出現兩次 → 整批拒絕");

  const before = fs.readFileSync(path.join(dir, file), "utf8");
  rep = apply([{ file, record: "r1", path: "plain", expect: "x", value: "y" }], { root: dir, dryRun: true });
  assert.strictEqual(rep.applied, 1); assert.strictEqual(fs.readFileSync(path.join(dir, file), "utf8"), before);
  ok("--dry-run 只報告不寫檔");

  write({ records: [{ id: "r1", a: ["p"] }] });
  const raw0 = fs.readFileSync(path.join(dir, file), "utf8");
  apply([{ file, record: "r1", path: "a[0]", expect: "p", value: "q" }], { root: dir });
  const raw1 = fs.readFileSync(path.join(dir, file), "utf8");
  assert.strictEqual(raw1.endsWith("\n"), raw0.endsWith("\n"));
  assert(/\n  "records"/.test(raw1));
  ok("縮排與尾端換行沿用原檔");

  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`\nPASS — ${n} 條`);
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.includes("--self-test")) { selfTest(); process.exit(0); }
  const file = argv.find((a) => !a.startsWith("--"));
  if (!file) { console.error("用法: node scripts/apply-field-ledger.js <ledger.json> [--dry-run]"); process.exit(2); }
  const ledger = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(ledger)) { console.error("帳本必須是陣列"); process.exit(2); }
  const rep = apply(ledger, { dryRun: argv.includes("--dry-run"), log: (m) => console.log(m) });
  console.log(`\n帳本 ${ledger.length} 條 → 寫入 ${rep.applied},現況不符 ${rep.mismatch.length},錯誤 ${rep.errors.length}`);
  for (const m of rep.mismatch.slice(0, 10)) console.log(`  ≠ ${m.record} ${m.path}  期望 ${JSON.stringify(String(m.expect).slice(0, 40))} 實際 ${JSON.stringify(String(m.current).slice(0, 40))}`);
  for (const e of rep.errors.slice(0, 10)) console.log(`  ⛔ ${e}`);
  process.exit(rep.errors.length ? 1 : 0);
}
module.exports = { apply, parsePath, readAt };
