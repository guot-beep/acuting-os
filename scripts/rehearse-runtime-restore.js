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
  const stagingBeforeA = b.kv.get(S.STAGING_KEY);   // R10:before 值先存,before/after 位元組比對(修正恆真斷言)
  const truncated = JSON.parse(exported);
  truncated.cases[0].agentExposures[0].events = truncated.cases[0].agentExposures[0].events.slice(0, 1);
  const rA = await S.restoreV2Envelope(JSON.stringify(truncated), sha);
  assert.strictEqual(rA.ok, false); ok("truncated history import rejected");
  assert.ok(!b.kv.has(S.CANDIDATE_KEY)); ok("candidate cleaned after rejection");
  assert.strictEqual(b.kv.get(S.STAGING_KEY), stagingBeforeA); ok("active staging byte-identical after rejection");

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

  // === R10 反例(Codex c279794)===
  // R10-D1:pending 態 export 必須可還原(sync 前的合法 transient)
  S.setBackend(b);   // 回到主情境(staging 在場)
  const casesP = S.load();
  casesP.push({ id: "case.pend", patientCode: "P-PEND", soapNotes: [] });
  S.save(casesP);                                     // 不 sync — pending 態
  const pendingExport = b.kv.get(S.STAGING_KEY);
  assert.ok(JSON.parse(pendingExport).pending_patient_codes.includes("P-PEND"));
  const bP = fakeBackend({});                          // wipe 世界
  S.setBackend(bP);
  const rP = await S.restoreV2Envelope(pendingExport, sha);
  assert.strictEqual(rP.ok, true); ok("R10-D1: pending-state export restores");
  const rPs = await S.syncPendingPatients(sha);
  assert.strictEqual(rPs.created, 1); ok("R10-D1: pending patient minted after restore");

  // R10-D2:revision 降級必拒(active 已是 runtime-era)
  const activeRev = JSON.parse(bP.kv.get(S.STAGING_KEY)).runtime_revision;
  const older = JSON.parse(pendingExport);
  older.runtime_revision = Math.max(0, activeRev - 1);
  const rD = await S.restoreV2Envelope(JSON.stringify(older), sha);
  assert.strictEqual(rD.ok, false); ok("R10-D2: older-revision import rejected");
  assert.ok(rD.failures[0].includes("OLDER")); ok("R10-D2: rejection names downgrade");
  const migEra = JSON.parse(pendingExport); delete migEra.runtime_revision;
  const rD0 = await S.restoreV2Envelope(JSON.stringify(migEra), sha);
  assert.strictEqual(rD0.ok, false); ok("R10-D2: revision-0 cannot overwrite runtime world");

  // R10-D3:canonical patient id 竄改(含 FK 同步改)必拒
  const tampered = JSON.parse(bP.kv.get(S.STAGING_KEY));
  tampered.runtime_revision += 1;
  const victim = tampered.patients[0];
  const oldId = victim.id; victim.id = "patient.tampered0000".slice(0, 20);
  for (const c of tampered.cases) if (c.patientId === oldId) c.patientId = victim.id;
  const rT = await S.restoreV2Envelope(JSON.stringify(tampered), sha);
  assert.strictEqual(rT.ok, false); ok("R10-D3: tampered canonical id rejected");

  // R10-D4:duplicate patientCode 分裂必拒
  const dup = JSON.parse(bP.kv.get(S.STAGING_KEY));
  dup.runtime_revision += 1;
  if (dup.patients.length >= 2) { dup.patients[1].patientCode = dup.patients[0].patientCode; }
  else dup.patients.push({ ...dup.patients[0], id: "patient.differentid0" });
  const rDup = await S.restoreV2Envelope(JSON.stringify(dup), sha);
  assert.strictEqual(rDup.ok, false); ok("R10-D4: duplicate patientCode rejected");

  // R10-D5:pointer 寫入失敗 → staging 回滾,兩鍵 exact unchanged
  const goodExport = bP.kv.get(S.STAGING_KEY);
  const bF = fakeBackend({});
  const origWK = bF.writeKey.bind(bF);
  bF.writeKey = (k, v) => { if (k === S.POINTER_KEY) throw new Error("pointer write fault"); origWK(k, v); };
  S.setBackend(bF);
  const rF = await S.restoreV2Envelope(goodExport, sha);
  assert.strictEqual(rF.ok, false); ok("R10-D5: pointer fault -> ok:false");
  assert.ok(rF.failures[0].includes("ROLLED BACK")); ok("R10-D5: reports rollback");
  assert.ok(!bF.kv.has(S.STAGING_KEY)); ok("R10-D5: staging rolled back to absent (exact prior state)");
  assert.ok(!bF.kv.has(S.POINTER_KEY)); ok("R10-D5: pointer unchanged");

  // === R11 反例(Codex 6cf7782)===
  // R11-E1:restore-vs-sync TOCTOU —— 驗證 await 期間 active 被推進,寫入前必拒
  // R12-F3:夾具必須真的觸發 await race —— 含 1 個 canonical Patient(讓
  // verifyRuntimeEnvelope 呼叫 hasher)+ 1 個 pending case;三重斷言防空跑:
  // hasherCalls ≥ 1、race 動作發生時 restore 未 settled、race 動作真的執行。
  const bE = fakeBackend({});
  S.setBackend(bE);
  const linkedId = "patient." + (await sha("acuting-patient:P-LNK")).slice(0, 12);
  const baseEnv = { schema_version: 2, journal: {},
    patients: [{ id: linkedId, patientCode: "P-LNK", caseIds: ["case.lnk"] }],
    cases: [
      { id:"case.lnk", patientCode:"P-LNK", patientId: linkedId, soapNotes: [] },
      { id:"case.e1", patientCode:"PE1", patientId: null, soapNotes: [] },
    ],
    pending_patient_codes: ["PE1"], runtime_revision: 5 };
  bE.kv.set(S.STAGING_KEY, JSON.stringify(baseEnv));
  bE.kv.set(S.POINTER_KEY, "v2");
  const incomingE1 = JSON.parse(JSON.stringify(baseEnv)); incomingE1.runtime_revision = 6; incomingE1.cases[1].caseTitle = "import";
  let releaseE1; const gateE1 = new Promise((r) => { releaseE1 = r; });
  let hasherCallsE1 = 0;
  const slowShaE1 = async (s) => { hasherCallsE1++; await gateE1; return require("crypto").createHash("sha256").update(s).digest("hex"); };
  let restoreSettled = false;
  const restoreP = S.restoreV2Envelope(JSON.stringify(incomingE1), slowShaE1).then((r) => { restoreSettled = true; return r; });
  await new Promise((r) => setTimeout(r, 10));   // 讓 restore 跑到 hasher await
  assert.ok(hasherCallsE1 >= 1); ok("R12-F3: hasher actually invoked (fixture not a no-op)");
  assert.strictEqual(restoreSettled, false); ok("R12-F3: restore still pending when race action fires");
  const savedCases = [
    { id:"case.lnk", patientCode:"P-LNK", patientId: linkedId, soapNotes: [] },
    { id:"case.e1", patientCode:"PE1", patientId: null, soapNotes: [], edited:"during-restore" },
  ];
  S.save(savedCases);   // await 期間推進 active(rev 6)— race 動作確實發生
  assert.strictEqual(JSON.parse(bE.kv.get(S.STAGING_KEY)).runtime_revision, 6); ok("R12-F3: race action really advanced active");
  releaseE1();
  const rE1 = await restoreP;
  assert.strictEqual(rE1.ok, false); ok("R11-E1: TOCTOU refused (active changed during validation)");
  assert.ok(rE1.failures[0].includes("CHANGED during restore validation") || rE1.failures[0].includes("SAME revision")); ok("R11-E1: structured refusal message");
  assert.strictEqual(JSON.parse(bE.kv.get(S.STAGING_KEY)).cases[1].edited, "during-restore"); ok("R11-E1: newer save preserved, zero overwrite");

  // R11-E2:同 revision 不同內容必拒;byte-equal 冪等 no-op 放行
  const curE2 = JSON.parse(bE.kv.get(S.STAGING_KEY));
  const divergent = JSON.parse(JSON.stringify(curE2)); divergent.cases[0].caseTitle = "branch!";
  const rE2 = await S.restoreV2Envelope(JSON.stringify(divergent), sha);
  assert.strictEqual(rE2.ok, false); ok("R11-E2: equal-revision divergent payload rejected");
  const rE2b = await S.restoreV2Envelope(JSON.stringify(curE2), sha);
  assert.strictEqual(rE2b.ok, true); ok("R11-E2: byte-equal same-revision accepted as no-op");
  assert.strictEqual(rE2b.idempotent_noop, true); ok("R11-E2: flagged idempotent_noop");

  // R11-E3:runtime_revision 型別污染必拒(store 與 load 邊界)
  const typed = JSON.parse(bE.kv.get(S.STAGING_KEY)); typed.runtime_revision = "99";
  const rE3 = await S.restoreV2Envelope(JSON.stringify(typed), sha);
  assert.strictEqual(rE3.ok, false); ok("R11-E3: string revision rejected at restore");
  const bE3 = fakeBackend({ [S.POINTER_KEY]: "v2", [S.STAGING_KEY]: JSON.stringify(typed) });
  S.setBackend(bE3);
  assert.throws(() => S.load(), /runtime_revision invalid|invalid type/); ok("R11-E3: string revision rejected at load boundary");

  // R11-E4:ghost pending code / 漏列 null-FK 皆拒
  S.setBackend(bE);
  const ghost = JSON.parse(bE.kv.get(S.STAGING_KEY)); ghost.runtime_revision += 1;
  ghost.pending_patient_codes = [...(ghost.pending_patient_codes||[]), "GHOST-CODE"];
  const rE4 = await S.restoreV2Envelope(JSON.stringify(ghost), sha);
  assert.strictEqual(rE4.ok, false); ok("R11-E4: ghost pending code rejected");
  const omit = JSON.parse(bE.kv.get(S.STAGING_KEY)); omit.runtime_revision += 1;
  omit.cases.push({ id:"case.omit", patientCode:"P-OMIT", patientId: null, soapNotes: [] });   // null FK 但不進 pending
  const rE4b = await S.restoreV2Envelope(JSON.stringify(omit), sha);
  assert.strictEqual(rE4b.ok, false); ok("R11-E4: null-FK case missing from pending rejected");

  // R11-E5:rollback 失敗 → code=INCONSISTENT_STATE;一般拒絕 → REJECTED_UNCHANGED
  assert.strictEqual(rE4.code, "REJECTED_UNCHANGED"); ok("R11-E5: normal rejection carries REJECTED_UNCHANGED");
  // 先播一個低 revision 的合法 staging(rollback 才會走 writeKey 而非 removeKey)
  const seedE5 = { schema_version: 2, journal: {}, patients: [], cases: [], pending_patient_codes: [], runtime_revision: 1 };
  const bE5 = fakeBackend({ [S.STAGING_KEY]: JSON.stringify(seedE5) });
  let stagingWrites = 0;
  const origWK5 = bE5.writeKey.bind(bE5);
  bE5.writeKey = (k, v) => {
    if (k === S.POINTER_KEY) throw new Error("pointer fault");
    if (k === S.STAGING_KEY) { stagingWrites++; if (stagingWrites >= 2) throw new Error("rollback fault"); }
    origWK5(k, v);
  };
  S.setBackend(bE5);
  const goodE5 = JSON.parse(bE.kv.get(S.STAGING_KEY));
  const rE5 = await S.restoreV2Envelope(JSON.stringify(goodE5), sha);
  assert.strictEqual(rE5.ok, false); ok("R11-E5: double-fault -> ok:false");
  assert.strictEqual(rE5.code, "INCONSISTENT_STATE"); ok("R11-E5: INCONSISTENT_STATE code surfaced");
  assert.ok(rE5.failures[0].includes("INCONSISTENT STATE")); ok("R11-E5: honest state description");

  // === R12 反例(Codex e7c1a22)===
  // R12-F1:active 的 revision 非法(存在但非 safe int ≥1)→ restore 必拒,四型
  for (const bad of ["2", 1.5, -3, Number.MAX_SAFE_INTEGER + 1]) {
    const badActive = { schema_version: 2, journal: {}, patients: [], cases: [], pending_patient_codes: [], runtime_revision: bad };
    const bF1 = fakeBackend({ [S.STAGING_KEY]: JSON.stringify(badActive), [S.POINTER_KEY]: "v2" });
    S.setBackend(bF1);
    const legit = { schema_version: 2, journal: {}, patients: [], cases: [], pending_patient_codes: [], runtime_revision: 3 };
    const rF1 = await S.restoreV2Envelope(JSON.stringify(legit), sha);
    assert.strictEqual(rF1.ok, false);
    assert.strictEqual(rF1.code, "REJECTED_UNCHANGED");
    assert.strictEqual(bF1.kv.get(S.STAGING_KEY), JSON.stringify(badActive));
  }
  ok("R12-F1: invalid ACTIVE revision (string/fraction/negative/unsafe) — restore refused x4, active untouched");

  // R12-F2:revision overflow → save/sync 零寫入丟錯
  const maxEnv = { schema_version: 2, journal: {}, patients: [], cases: [], pending_patient_codes: [], runtime_revision: Number.MAX_SAFE_INTEGER };
  const bF2 = fakeBackend({ [S.STAGING_KEY]: JSON.stringify(maxEnv), [S.POINTER_KEY]: "v2" });
  S.setBackend(bF2);
  assert.throws(() => S.save([]), /overflow/); ok("R12-F2: save at MAX_SAFE revision throws, zero write");
  assert.strictEqual(bF2.kv.get(S.STAGING_KEY), JSON.stringify(maxEnv)); ok("R12-F2: staging bytes unchanged after refused save");

  // R12-F4:同 revision、同物不同字(pretty-print)必拒
  const bF4base = { schema_version: 2, journal: {}, patients: [], cases: [], pending_patient_codes: [], runtime_revision: 4 };
  const bF4 = fakeBackend({ [S.STAGING_KEY]: JSON.stringify(bF4base), [S.POINTER_KEY]: "v2" });
  S.setBackend(bF4);
  const pretty = JSON.stringify(bF4base, null, 2);   // 同 canonical 物件、不同 bytes
  const rF4 = await S.restoreV2Envelope(pretty, sha);
  assert.strictEqual(rF4.ok, false); ok("R12-F4: same-revision whitespace-variant rejected (exact-bytes contract)");
  const rF4b = await S.restoreV2Envelope(JSON.stringify(bF4base), sha);
  assert.strictEqual(rF4b.ok, true); assert.strictEqual(rF4b.idempotent_noop, true); ok("R12-F4: true byte-identical no-op still accepted");

  // === R13 反例(Codex 3d4ca4f)===
  // R13-G1:corrupt active raw 不得被當成 absent —— restore 必拒、bytes 不動
  const bG1 = fakeBackend({ [S.STAGING_KEY]: "{corrupt-json", [S.POINTER_KEY]: "v2" });
  S.setBackend(bG1);
  const legitG = { schema_version: 2, journal: {}, patients: [], cases: [], pending_patient_codes: [], runtime_revision: 3 };
  const rG1 = await S.restoreV2Envelope(JSON.stringify(legitG), sha);
  assert.strictEqual(rG1.ok, false); ok("R13-G1: corrupt active raw -> restore refused");
  assert.ok(rG1.failures[0].includes("CORRUPT")); ok("R13-G1: names corruption, not absence");
  assert.strictEqual(bG1.kv.get(S.STAGING_KEY), "{corrupt-json"); ok("R13-G1: corrupt active bytes untouched");

  // R13-G2:active shape 非法(cases 非陣列)→ 不得跳過 append-only,必拒
  const badShape = { schema_version: 2, journal: {}, patients: [], cases: "not-an-array", runtime_revision: 1 };
  const bG2 = fakeBackend({ [S.STAGING_KEY]: JSON.stringify(badShape), [S.POINTER_KEY]: "v2" });
  S.setBackend(bG2);
  const rG2 = await S.restoreV2Envelope(JSON.stringify(legitG), sha);
  assert.strictEqual(rG2.ok, false); ok("R13-G2: invalid-shape active -> restore refused");
  assert.ok(rG2.failures[0].includes("INVALID SHAPE")); ok("R13-G2: names shape problem");
  assert.strictEqual(bG2.kv.get(S.STAGING_KEY), JSON.stringify(badShape)); ok("R13-G2: active bytes untouched");

  // === R14 反例(Codex R14 H1)===
  // H1:active minimum-shape 全變體 —— 缺 journal / journal 為陣列 / pending
  // 型別錯 / schema_version≠2 / patients 非陣列,一律拒、bytes 不動
  const legitH = { schema_version: 2, journal: {}, patients: [], cases: [], pending_patient_codes: [], runtime_revision: 10 };
  const H1_VARIANTS = [
    ["missing journal", (e) => { delete e.journal; }],
    ["journal is array", (e) => { e.journal = []; }],
    ["pending is string", (e) => { e.pending_patient_codes = "GHOST"; }],
    ["schema_version 1", (e) => { e.schema_version = 1; }],
    ["patients wrong type", (e) => { e.patients = "nope"; }],
  ];
  for (const [label, mutate] of H1_VARIANTS) {
    const badActive = { schema_version: 2, journal: {}, patients: [], cases: [], pending_patient_codes: [], runtime_revision: 9 };
    mutate(badActive);
    const bH = fakeBackend({ [S.STAGING_KEY]: JSON.stringify(badActive), [S.POINTER_KEY]: "v2" });
    S.setBackend(bH);
    const rH = await S.restoreV2Envelope(JSON.stringify(legitH), sha);
    assert.strictEqual(rH.ok, false, label);
    assert.strictEqual(rH.code, "REJECTED_UNCHANGED", label);
    assert.strictEqual(bH.kv.get(S.STAGING_KEY), JSON.stringify(badActive), label);
  }
  ok("R14-H1: five active minimum-shape variants all refused, bytes untouched");
  // H1-incoming:同一把尺也擋 incoming
  const bHI = fakeBackend({});
  S.setBackend(bHI);
  const noJournal = { schema_version: 2, patients: [], cases: [], runtime_revision: 2 };
  const rHI = await S.restoreV2Envelope(JSON.stringify(noJournal), sha);
  assert.strictEqual(rHI.ok, false); ok("R14-H1: incoming missing-journal refused by same validator");

  // R14 補件:syncPendingPatients 的 MAX_SAFE overflow(F2 官方化)
  const maxSync = { schema_version: 2, journal: {}, patients: [], cases: [{ id:"case.o", patientCode:"PO", patientId: null, soapNotes: [] }], pending_patient_codes: ["PO"], runtime_revision: Number.MAX_SAFE_INTEGER };
  const bMS = fakeBackend({ [S.STAGING_KEY]: JSON.stringify(maxSync), [S.POINTER_KEY]: "v2" });
  S.setBackend(bMS);
  let syncThrew = false;
  try { await S.syncPendingPatients(sha); } catch (e) { syncThrew = /overflow/.test(e.message); }
  assert.strictEqual(syncThrew, true); ok("R14: sync at MAX_SAFE revision throws overflow");
  assert.strictEqual(bMS.kv.get(S.STAGING_KEY), JSON.stringify(maxSync)); ok("R14: staging bytes unchanged after refused sync");

  // R15(Dry Clinic #9):v1 load fail-loud —— 存在但壞的 store 必須丟錯,
  // 且 raw bytes 原封不動(靜默回 [] = 下一次 save 蓋掉可救回的資料)。
  const b15a = fakeBackend({ "acuting-clinical-cases-v1": "not found" });
  S.setBackend(b15a);
  let threw15a = false;
  try { S.load(); } catch (e) { threw15a = /CORRUPT/.test(e.message); }
  assert.strictEqual(threw15a, true); ok("R15: v1 unparseable store throws (fetch-404-body scenario)");
  assert.strictEqual(b15a.kv.get("acuting-clinical-cases-v1"), "not found"); ok("R15: raw bytes untouched after refused load");

  const b15b = fakeBackend({ "acuting-clinical-cases-v1": JSON.stringify({ cases: [] }) });
  S.setBackend(b15b);
  let threw15b = false;
  try { S.load(); } catch (e) { threw15b = /invalid shape/.test(e.message); }
  assert.strictEqual(threw15b, true); ok("R15: v1 non-array JSON throws (object-shaped store refused)");

  const b15c = fakeBackend({});
  S.setBackend(b15c);
  assert.deepStrictEqual(S.load(), []); ok("R15: absent v1 store still loads [] (fresh machine unaffected)");

  const b15d = fakeBackend({ "acuting-clinical-cases-v1": JSON.stringify([{ id: "case.x" }]) });
  S.setBackend(b15d);
  assert.strictEqual(S.load().length, 1); ok("R15: healthy v1 array still loads normally");

  console.log(`\nRUNTIME RESTORE REHEARSAL: ${pass}/${pass} PASS`);
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
