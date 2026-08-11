/* R9 gate D rehearsal:切換後生命週期的備份/還原契約(blocking)。
 * switch → 新增/編輯 fake case → pending sync → export → wipe v2 keys →
 * restore → 全量比對。外加反例:截斷 exposure 歷史的 import 必拒、
 * 竄改 referential integrity 必拒。全程 fake backend。 */
"use strict";
const assert = require("assert");
const crypto = require("crypto");
global.localStorage = { getItem(){ throw new Error("no real localStorage"); }, setItem(){ throw new Error("no"); }, removeItem(){ throw new Error("no"); } };
require("../js/clinical-store.js");
const S = globalThis.AcuTingClinicalStore;
const sha = async (s) => crypto.createHash("sha256").update(s, "utf8").digest("hex");

function fakeBackend(init) {
  const kv = new Map(Object.entries(init || {}));
  return { kv,
    read() { return kv.get("acuting-clinical-cases-v1") ?? null; },
    write(s) { kv.set("acuting-clinical-cases-v1", s); },
    readKey(k) { return kv.get(k) ?? null; },
    writeKey(k, v) { kv.set(k, v); },
    removeKey(k) { kv.delete(k); },
  };
}
let pass = 0; const ok = (m) => { pass++; console.log("PASS", m); };

(async () => {
  // 0. 造一個合法 migration envelope(走正式 plan/execute 流程)
  const RAW = JSON.stringify([{ id: "case.a", patientCode: "P001", soapNotes: [], agentExposures: [
    { id: "exp.1", agentId: "supp.magnesium", events: [{ id: "evt.1", eventType: "initial_recorded", createdAt: "2026-08-01T00:00:00Z" }] }
  ] }], null, 2);
  const b = fakeBackend({ "acuting-clinical-cases-v1": RAW });
  S.setBackend(b);
  const plan = await S.buildMigrationPlan(RAW, [], sha);
  S.executeMigration(RAW, plan, { sha256: (t) => { const h = crypto.createHash("sha256").update(t, "utf8").digest("hex"); return h; } });
  S.switchPointer(RAW, { sha256: (t) => require("crypto").createHash("sha256").update(t, "utf8").digest("hex") }, plan);
  assert.strictEqual(b.kv.get(S.POINTER_KEY), "v2"); ok("switched to v2");

  // 1. runtime 寫入:編輯 + 新 case(新 code)
  const cases = S.load();
  cases[0].caseTitle = "edited after switch";
  const exp = cases[0].agentExposures[0];
  cases[0].agentExposures[0] = S.applyExposureChange(exp, { eventType: "dose_changed", doseText: "400mg" }, "agent");
  cases.push({ id: "case.b", patientCode: "P002", soapNotes: [] });
  S.save(cases);
  await S.syncPendingPatients(sha);
  const envLive = JSON.parse(b.kv.get(S.STAGING_KEY));
  assert.ok(envLive.runtime_revision >= 1); ok("runtime_revision present");
  assert.strictEqual(envLive.patients.length, 2); ok("pending patient minted");

  // 2. export = envelope 全文;wipe v2 keys;restore
  const exported = b.kv.get(S.STAGING_KEY);
  b.kv.delete(S.STAGING_KEY); b.kv.delete(S.POINTER_KEY);
  const r = await S.restoreV2Envelope(exported, sha);
  assert.strictEqual(r.ok, true); ok("runtime-era restore accepted (was rejected pre-gate-D)");
  assert.strictEqual(r.runtime_era, true); ok("classified runtime-era");
  assert.strictEqual(b.kv.get(S.POINTER_KEY), "v2"); ok("pointer restored to v2 (no silent v1 world)");
  const envBack = JSON.parse(b.kv.get(S.STAGING_KEY));
  assert.strictEqual(await sha(JSON.stringify(envBack.cases)), await sha(JSON.stringify(JSON.parse(exported).cases))); ok("cases canonical-hash exact");
  assert.strictEqual(envBack.cases[0].caseTitle, "edited after switch"); ok("runtime edit survives round-trip");
  assert.strictEqual(envBack.cases[0].agentExposures[0].events.length, 2); ok("exposure events exact");

  // 3. 反例 A:截斷 exposure 歷史的 import 必拒(現有 staging 在場)
  const truncated = JSON.parse(exported);
  truncated.cases[0].agentExposures[0].events = truncated.cases[0].agentExposures[0].events.slice(0, 1);
  const rA = await S.restoreV2Envelope(JSON.stringify(truncated), sha);
  assert.strictEqual(rA.ok, false); ok("truncated history import rejected");
  assert.ok(!b.kv.has(S.CANDIDATE_KEY)); ok("candidate cleaned after rejection");
  assert.strictEqual(b.kv.get(S.STAGING_KEY), b.kv.get(S.STAGING_KEY)); // staging untouched by failed import
  ok("active staging untouched after rejection");

  // 4. 反例 B:patientId 交換(referential integrity)必拒
  const swapped = JSON.parse(b.kv.get(S.STAGING_KEY));
  const [p1, p2] = swapped.patients;
  for (const c of swapped.cases) c.patientId = c.patientId === p1.id ? p2.id : p1.id;
  const rB = await S.restoreV2Envelope(JSON.stringify(swapped), sha);
  assert.strictEqual(rB.ok, false); ok("patientId swap rejected (code mismatch)");

  // 5. 反例 C:blank code 帶 stale patientId 必拒
  const stale = JSON.parse(b.kv.get(S.STAGING_KEY));
  stale.cases.push({ id: "case.stale", patientCode: "", patientId: "patient.ghost", soapNotes: [] });
  const rC = await S.restoreV2Envelope(JSON.stringify(stale), sha);
  assert.strictEqual(rC.ok, false); ok("blank-code stale FK rejected");

  // 6. migration-era envelope(revision 0)仍走原 plan-anchored 路徑
  const b2 = fakeBackend({ "acuting-clinical-cases-v1": RAW });
  S.setBackend(b2);
  const plan2 = await S.buildMigrationPlan(RAW, [], sha);
  S.executeMigration(RAW, plan2, { sha256: (t) => crypto.createHash("sha256").update(t, "utf8").digest("hex") });
  const migEnv = b2.kv.get(S.STAGING_KEY);
  b2.kv.delete(S.STAGING_KEY);
  const rM = await S.restoreV2Envelope(migEnv, sha);
  assert.strictEqual(rM.ok, true); ok("migration-era restore path unchanged");
  assert.ok(!rM.runtime_era); ok("migration-era not classified runtime");
  assert.ok(!b2.kv.has(S.POINTER_KEY)); ok("migration-era restore never touches pointer");

  console.log(`\nRUNTIME RESTORE REHEARSAL: ${pass}/${pass} PASS`);
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
