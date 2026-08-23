/* Pointer-aware runtime 契約測試(2026-08-11 INDEPENDENT_AUDIT 修復自測;
 * Codex R9 的注入基底)。全程 fake backend,絕不碰真 localStorage。 */
"use strict";
const assert = require("assert");
global.localStorage = { getItem(){ throw new Error("real localStorage must never be touched"); }, setItem(){ throw new Error("no"); }, removeItem(){ throw new Error("no"); } };
require("../js/clinical-store.js");
const S = globalThis.AcuTingClinicalStore;

function fakeBackend(init) {
  const kv = new Map(Object.entries(init || {}));
  return {
    kv,
    read() { return kv.get(S ? "acuting-clinical-cases-v1" : "") ?? kv.get("acuting-clinical-cases-v1") ?? null; },
    write(s) { kv.set("acuting-clinical-cases-v1", s); },
    readKey(k) { return kv.get(k) ?? null; },
    writeKey(k, v) { kv.set(k, v); },
    removeKey(k) { kv.delete(k); },
  };
}
const CASES = [{ id: "case.a", patientCode: "P001", soapNotes: [] }, { id: "case.b", patientCode: "P002", soapNotes: [] }];
const ENV = { schema_version: 2, journal: { version: "v2" }, patients: [
  { id: "patient.abc", patientCode: "P001", caseIds: ["case.a"] },
  { id: "patient.def", patientCode: "P002", caseIds: ["case.b"] },
], cases: structuredClone(CASES) };
let pass = 0; const ok = (m) => { pass++; console.log("PASS", m); };

// 1. v1 模式(無 pointer):load/save 行為不變
let b = fakeBackend({ "acuting-clinical-cases-v1": JSON.stringify(CASES) });
S.setBackend(b);
assert.deepStrictEqual(S.load().map(c=>c.id), ["case.a","case.b"]); ok("v1 load unchanged");
S.save([{ id: "case.c" }]);
assert.ok(b.kv.get("acuting-clinical-cases-v1").includes("case.c")); ok("v1 save unchanged");
assert.ok(!b.kv.has(S.STAGING_KEY)); ok("v1 mode never touches staging");

// 2. v2 模式:load 讀 envelope.cases
b = fakeBackend({ "acuting-clinical-cases-v1": JSON.stringify(CASES), [S.POINTER_KEY]: "v2", [S.STAGING_KEY]: JSON.stringify(ENV) });
S.setBackend(b);
assert.deepStrictEqual(S.load().map(c=>c.id), ["case.a","case.b"]); ok("v2 load reads envelope.cases");

// 3. v2 save:envelope 更新、v1 凍結、caseIds 同步、pending 記錄
const v1Before = b.kv.get("acuting-clinical-cases-v1");
S.save([...structuredClone(CASES), { id: "case.new", patientCode: "P003" }]);
const envAfter = JSON.parse(b.kv.get(S.STAGING_KEY));
assert.strictEqual(b.kv.get("acuting-clinical-cases-v1"), v1Before); ok("v2 save never writes v1 (frozen rollback)");
assert.strictEqual(envAfter.cases.length, 3); ok("v2 save updates envelope.cases");
assert.deepStrictEqual(envAfter.patients[0].caseIds, ["case.a"]); ok("existing patient caseIds resynced");
assert.strictEqual(envAfter.cases[0].patientId, "patient.abc"); ok("case.patientId maintained");
assert.deepStrictEqual(envAfter.pending_patient_codes, ["P003"]); ok("new code recorded as pending, no sync minting");

// 4. syncPendingPatients:deterministic id 鑄造 + 清 pending
const fakeSha = async (s) => Buffer.from(s).toString("hex").padEnd(64, "0");
(async () => {
  const r = await S.syncPendingPatients(fakeSha);
  assert.strictEqual(r.created, 1); ok("pending patient minted");
  const env2 = JSON.parse(b.kv.get(S.STAGING_KEY));
  assert.strictEqual(env2.patients.length, 3); ok("patient appended");
  const p3 = env2.patients.find(p=>p.patientCode==="P003");
  assert.ok(p3.id.startsWith("patient.")); ok("deterministic id shape");
  assert.strictEqual(env2.cases.find(c=>c.id==="case.new").patientId, p3.id); ok("case linked to minted patient");
  assert.deepStrictEqual(env2.pending_patient_codes, []); ok("pending cleared");
  const r2 = await S.syncPendingPatients(fakeSha);
  assert.strictEqual(r2.created, 0); ok("idempotent noop");

  // 5. fail-loud:pointer=v2 但 staging 缺/毀
  b = fakeBackend({ [S.POINTER_KEY]: "v2" });
  S.setBackend(b);
  assert.throws(() => S.load(), /MISSING/); ok("v2 + missing staging: load throws (no silent v1 fallback)");
  assert.throws(() => S.save([]), /MISSING/); ok("v2 + missing staging: save throws (no silent write)");
  b = fakeBackend({ [S.POINTER_KEY]: "v2", [S.STAGING_KEY]: "{corrupt" });
  S.setBackend(b);
  assert.throws(() => S.load(), /CORRUPT/); ok("v2 + corrupt staging: load throws");

  // === R9 反例(Codex 4b2cefd)===
  // R9-A: pointer 讀取例外 → load/save 必 throw,零寫入(不得靜默走 v1)
  b = fakeBackend({ "acuting-clinical-cases-v1": JSON.stringify(CASES) });
  const origReadKey = b.readKey.bind(b);
  b.readKey = (k) => { if (k === S.POINTER_KEY) throw new Error("storage fault"); return origReadKey(k); };
  let writes = 0; const origWrite = b.write.bind(b); b.write = (s) => { writes++; origWrite(s); };
  const origWriteKey = b.writeKey.bind(b); b.writeKey = (k, v) => { writes++; origWriteKey(k, v); };
  S.setBackend(b);
  assert.throws(() => S.load(), /POINTER read failed/); ok("R9-A: pointer fault -> load throws");
  assert.throws(() => S.save([]), /POINTER read failed/); ok("R9-A: pointer fault -> save throws");
  assert.strictEqual(writes, 0); ok("R9-A: zero writes on pointer fault");
  // R9-A2: 非法 pointer 值一樣 throw
  b = fakeBackend({ [S.POINTER_KEY]: "v3" }); S.setBackend(b);
  assert.throws(() => S.load(), /invalid value/); ok("R9-A: invalid pointer value -> throw");

  // R9-C1: ID 與 migration 推導完全一致(同鹽)
  const saltedSha = async (s) => require("crypto").createHash("sha256").update(s).digest("hex");
  b = fakeBackend({ [S.POINTER_KEY]: "v2", [S.STAGING_KEY]: JSON.stringify({ schema_version: 2, journal:{}, patients: [], cases: [{ id:"case.x", patientCode:"PX", soapNotes: [] }], pending_patient_codes: ["PX"] }) });
  S.setBackend(b);
  await S.syncPendingPatients(saltedSha);
  const envC = JSON.parse(b.kv.get(S.STAGING_KEY));
  const expected = "patient." + (await saltedSha("acuting-patient:PX")).slice(0, 12);
  assert.strictEqual(envC.patients[0].id, expected); ok("R9-C1: runtime id === migration derivation (salted)");

  // R9-C2: lost-update race —— sync 停在 await 期間插入新 save,新資料不得被覆蓋
  b = fakeBackend({ [S.POINTER_KEY]: "v2", [S.STAGING_KEY]: JSON.stringify({ schema_version: 2, journal:{}, patients: [], cases: [{ id:"case.1", patientCode:"PA", soapNotes: [] }], pending_patient_codes: ["PA"] }) });
  S.setBackend(b);
  let release; const gate = new Promise((r) => { release = r; });
  const slowSha = async (s) => { await gate; return require("crypto").createHash("sha256").update(s).digest("hex"); };
  const syncP = S.syncPendingPatients(slowSha);
  S.save([{ id:"case.1", patientCode:"PA", soapNotes: [], edited: true }, { id:"case.2", patientCode:"PB", soapNotes: [] }]);   // await 期間的較新 save
  release(); await syncP;
  const envR = JSON.parse(b.kv.get(S.STAGING_KEY));
  assert.strictEqual(envR.cases.length, 2); ok("R9-C2: newer save's new case survives sync");
  assert.strictEqual(envR.cases[0].edited, true); ok("R9-C2: newer edit survives sync");
  assert.ok(envR.pending_patient_codes.includes("PB")); ok("R9-C2: new pending code deferred, not lost");
  assert.ok(envR.patients.some((p)=>p.patientCode==="PA")); ok("R9-C2: prefetched patient still minted");

  // R9-C3: collision fail-closed
  b = fakeBackend({ [S.POINTER_KEY]: "v2", [S.STAGING_KEY]: JSON.stringify({ schema_version: 2, journal:{}, patients: [{ id: "patient.aaaaaaaaaaaa", patientCode: "OTHER", caseIds: [] }], cases: [{ id:"case.z", patientCode:"PZ", soapNotes: [] }], pending_patient_codes: ["PZ"] }) });
  S.setBackend(b);
  const collideSha = async () => "aaaaaaaaaaaa".padEnd(64, "a");
  const rc = await S.syncPendingPatients(collideSha);
  const envZ = JSON.parse(b.kv.get(S.STAGING_KEY));
  assert.strictEqual(rc.created, 0); ok("R9-C3: collision -> minting refused");
  assert.ok(envZ.pending_patient_codes.includes("PZ")); ok("R9-C3: code stays pending");
  assert.strictEqual(envZ.patients.length, 1); ok("R9-C3: no duplicate id written");

  // R9-C4: blank code -> patientId 強制 null(stale FK 清除)
  b = fakeBackend({ [S.POINTER_KEY]: "v2", [S.STAGING_KEY]: JSON.stringify({ schema_version: 2, journal:{}, patients: [], cases: [], pending_patient_codes: [] }) });
  S.setBackend(b);
  S.save([{ id:"case.blank", patientCode:"", patientId:"patient.stale", soapNotes: [] }]);
  const envB = JSON.parse(b.kv.get(S.STAGING_KEY));
  assert.strictEqual(envB.cases[0].patientId, null); ok("R9-C4: blank code forces patientId=null");

  console.log(`\nPOINTER RUNTIME TEST: ${pass}/${pass} PASS (18 base + 12 R9 counterexamples)`);
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
