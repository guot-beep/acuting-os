#!/usr/bin/env node
/**
 * validate-patient-id-migration.js — 病人編號轉換(舊編號 → PT-xxxxxx)的行為真值表。
 *
 * require 真正在跑的 js/patient-id-migration.js、js/clinical-store.js、js/visit-handoff.js、
 * js/case-search.js,餵虛構病例(永遠不用真實病歷/真實代號),斷言輸出。任一條失敗 exit 1。
 * 守的規則:
 *   - 只動 patientCode(+ 舊編號別名 formerPatientCodes);顯示代號與其他欄位一個字不動
 *   - 同一位病人的所有病例一起換;不拆、不併
 *   - 新編號 = app 發號格式;撞現有編號 / 撞舊編號 / 同批重複 → 錯誤,整批不能套用
 *   - v1:一般 save;v2:同一個病人物件換 id(= 新編號的 canonical 雜湊)與 code,病例 FK 跟著換,
 *     不留空殼病人;任何撞號/缺 id/分頁衝突 → throw 且零寫入
 *   - 交接檔寫舊編號照樣接到同一位病人;新發的號不撞舊編號;搜尋舊編號找得到人
 *   - app.js / index.html 接線(normalize 留住別名、persist 走 renamePatientCodes、腳本有載入)
 *
 * 用法:node scripts/validate-patient-id-migration.js
 */
"use strict";
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const ROOT = path.join(__dirname, "..");
const M = require(path.join(ROOT, "js", "patient-id-migration.js"));
const H = require(path.join(ROOT, "js", "visit-handoff.js"));
const S = require(path.join(ROOT, "js", "case-search.js"));
require(path.join(ROOT, "js", "clinical-store.js"));
const store = globalThis.AcuTingClinicalStore;

const failures = [];
let total = 0;
async function check(name, fn) {
  total++;
  let ok = false, detail = "";
  try { const r = await fn(); ok = r === true; if (r !== true && r !== false) detail = JSON.stringify(r); } catch (e) { detail = e.message; }
  console.log(`  ${ok ? "PASS" : "FAIL"} — ${name}${ok || !detail ? "" : "  → " + detail}`);
  if (!ok) failures.push(name);
}
const throwsSync = (fn) => { try { fn(); return false; } catch (e) { return true; } };
const clone = (v) => JSON.parse(JSON.stringify(v));
// 虛構病例。代號都是編的,刻意涵蓋 Ting 資料裡出現過的三種舊格式長相(縮寫 / P-年-序號 / B-年-序號)。
const CASES = () => [
  { id: "c1", patientCode: "ZQX", displayCode: "AZQ", caseTitle: "虛構甲", sex: "F", updatedAt: "2026-01-01T00:00:00Z", soapNotes: [{ id: "n1" }] },
  { id: "c2", patientCode: "ZQX ", displayCode: "AZQ", caseTitle: "虛構甲第二案", updatedAt: "2026-01-02T00:00:00Z", soapNotes: [] },
  { id: "c3", patientCode: "P-2099-901", displayCode: "", caseTitle: "虛構乙", updatedAt: "2026-01-03T00:00:00Z", soapNotes: [] },
  { id: "c4", patientCode: "B-2099-001", displayCode: "WQQ", caseTitle: "虛構丙", updatedAt: "2026-01-04T00:00:00Z", soapNotes: [] },
  { id: "c5", patientCode: "PT-23456A", displayCode: "MZZ", caseTitle: "已標準", updatedAt: "2026-01-05T00:00:00Z", soapNotes: [] },
  { id: "c6", patientCode: "", caseTitle: "沒有編號", soapNotes: [] },
];
const MAP = { "code:ZQX": "PT-AAAAAA", "code:P-2099-901": "pt-bbbbbb", "code:B-2099-001": " PT-CCCCCC " };
const seqBytes = (vals) => { let i = 0; return (n) => Uint8Array.from({ length: n }, () => vals[i++ % vals.length]); };
const sha256hex = async (s) => crypto.createHash("sha256").update(s).digest("hex");
const pidOf = (code) => store.canonicalPatientIdOf(code, sha256hex);

// 記憶體 backend:跟 D1 adapter 同介面(read/write/readKey/writeKey/removeKey)。
function memBackend(init) {
  const kv = new Map(Object.entries(init || {}));
  return {
    kv,
    read() { return kv.has(store.STORAGE_KEY) ? kv.get(store.STORAGE_KEY) : null; },
    write(v) { kv.set(store.STORAGE_KEY, v); },
    readKey(k) { return kv.has(k) ? kv.get(k) : null; },
    writeKey(k, v) { kv.set(k, v); },
    removeKey(k) { kv.delete(k); },
  };
}
async function v2World(cases) {
  const patients = [];
  for (const p of store.derivePatientsFromCases(cases)) {
    patients.push({ id: await pidOf(p.patientCode), patientCode: p.patientCode, caseIds: p.caseIds, caseCount: p.caseCount,
      fields: { sex: p.sex || "" }, conflicts: {}, needsReview: [], adjudicationsApplied: [{ field: "sex", value: "F", reason: "虛構裁決" }] });
  }
  const byCode = new Map(patients.map((p) => [p.patientCode, p.id]));
  const env = { schema_version: 2, journal: { migration_version: "c2b-1" }, patients,
    cases: cases.map((c) => Object.assign({}, c, { patientId: String(c.patientCode || "").trim() ? byCode.get(String(c.patientCode).trim()) : null })),
    pending_patient_codes: [], runtime_revision: 3 };
  const b = memBackend({ [store.POINTER_KEY]: "v2", [store.STAGING_KEY]: JSON.stringify(env) });
  store.setBackend(b);
  return b;
}
const envOf = (b) => JSON.parse(b.kv.get(store.STAGING_KEY));

(async () => {
  console.log("A. 標準格式");
  await check("PT- + 6 碼(發號字母)= 標準", () => M.isStandardPatientId("PT-7K3QXM") && M.isStandardPatientId(" PT-7K3QXM "));
  await check("縮寫 / P-年-序號 / 小寫 / 易混字 / 長度不對 = 不標準", () =>
    !["ZQX", "P-2099-901", "B-2099-001", "pt-7k3qxm", "PT-0K3QXM", "PT-7K3QX", "PT-7K3QXMM", ""].some(M.isStandardPatientId));

  console.log("B. 發號");
  await check("發出的號是標準格式", () => M.isStandardPatientId(M.mintPatientId(new Set(), seqBytes([0, 1, 2, 3, 4, 5]))));
  await check("撞到現有編號就重抽", () => {
    const first = M.mintPatientId(new Set(), seqBytes([0])); // PT-222222
    return M.mintPatientId(new Set([first]), seqBytes([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1])) === "PT-333333";
  });
  await check("taken 包含舊編號別名", () => M.takenCodes([{ patientCode: "PT-AAAAAA", formerPatientCodes: ["ZQX"] }]).has("ZQX"));
  await check("預填建議:每位舊編號病人一個、互不相同、不撞現有", () => {
    const s = M.suggestPatientIds(CASES());
    const vals = Object.values(s);
    return Object.keys(s).length === 3 && new Set(vals).size === 3 && vals.every(M.isStandardPatientId) && !vals.includes("PT-23456A");
  });
  await check("亂數源一直撞 → 停止而不是無窮迴圈", () => throwsSync(() => M.mintPatientId(new Set(["PT-222222"]), seqBytes([0]))));

  console.log("C. 規劃");
  const plan = M.planPatientIdMigration(CASES(), MAP);
  await check("舊編號 3 位列出(前後空白算同一位),標準 1 位、無編號 1 筆不列", () =>
    plan.rows.length === 3 && plan.standard === 1 && plan.blankCases === 1);
  await check("同編號的 2 個病例在同一列", () => JSON.stringify(plan.rows.find((r) => r.oldCode === "ZQX").caseIds) === '["c1","c2"]');
  await check("小寫、前後空白自動正規化", () => plan.changes.map((r) => r.newCode).join() === "PT-AAAAAA,PT-BBBBBB,PT-CCCCCC" && plan.blocked === 0);
  await check("空白 = 這次不換(skip,不算錯)", () => {
    const p = M.planPatientIdMigration(CASES(), { "code:ZQX": "PT-AAAAAA" });
    return p.changes.length === 1 && p.rows.filter((r) => r.status === "skip").length === 2 && p.blocked === 0;
  });
  const errOf = (mapping, code) => M.planPatientIdMigration(CASES(), mapping).rows.find((r) => r.oldCode === code);
  await check("格式不對 → 錯誤", () => errOf({ "code:ZQX": "AB-123456" }, "ZQX").status === "error");
  await check("含易混字 0/O/1/I/L → 錯誤", () => errOf({ "code:ZQX": "PT-AAAAA0" }, "ZQX").status === "error");
  await check("撞到現有病人的編號 → 錯誤", () => errOf({ "code:ZQX": "PT-23456A" }, "ZQX").status === "error");
  await check("撞到別人的舊編號 → 錯誤", () => {
    const cs = CASES().concat([{ id: "c7", patientCode: "PT-DDDDDD", formerPatientCodes: ["PT-EEEEEE"] }]);
    return M.planPatientIdMigration(cs, { "code:ZQX": "PT-EEEEEE" }).blocked === 1;
  });
  await check("同批兩位填同一個號 → 兩列都錯", () => M.planPatientIdMigration(CASES(), { "code:ZQX": "PT-AAAAAA", "code:P-2099-901": "PT-AAAAAA" }).blocked === 2);

  console.log("D. 套用");
  const before = CASES();
  const frozen = JSON.stringify(before);
  const after = M.applyPatientIdMigration(before, plan);
  await check("原陣列不被改", () => JSON.stringify(before) === frozen);
  await check("新編號寫上、舊編號進別名", () => after[0].patientCode === "PT-AAAAAA" && after[1].patientCode === "PT-AAAAAA"
    && JSON.stringify(after[0].formerPatientCodes) === '["ZQX"]' && after[2].patientCode === "PT-BBBBBB");
  await check("顯示代號與其他欄位不動", () => after.every((c, i) => c.displayCode === before[i].displayCode && c.caseTitle === before[i].caseTitle
    && JSON.stringify(c.soapNotes) === JSON.stringify(before[i].soapNotes) && c.updatedAt === before[i].updatedAt));
  await check("計畫外的病例是同一個物件(標準 / 無編號)", () => after[4] === before[4] && after[5] === before[5]);
  await check("有錯的計畫拒絕套用", () => throwsSync(() => M.applyPatientIdMigration(CASES(), M.planPatientIdMigration(CASES(), { "code:ZQX": "bad" }))));
  await check("空計畫拒絕套用", () => throwsSync(() => M.applyPatientIdMigration(CASES(), M.planPatientIdMigration(CASES(), {}))));
  await check("已有別名的病例再換:別名累加不重複", () => {
    const cs = [{ id: "x", patientCode: "OLD2", formerPatientCodes: ["OLD1"] }];
    const r = M.applyPatientIdMigration(cs, M.planPatientIdMigration(cs, { "code:OLD2": "PT-FFFFFF" }));
    return JSON.stringify(r[0].formerPatientCodes) === '["OLD1","OLD2"]';
  });

  console.log("E. 寫入前檢查(故意弄壞)");
  await check("正確的轉換 → 通過", () => M.verifyPatientIdMigration(before, after, plan).ok);
  await check("別的欄位被改 → 擋", () => { const t = clone(after); t[0].caseTitle = "x"; return !M.verifyPatientIdMigration(before, t, plan).ok; });
  await check("顯示代號被改 → 擋", () => { const t = clone(after); t[3].displayCode = "QQQ"; return !M.verifyPatientIdMigration(before, t, plan).ok; });
  await check("同一位病人被拆開 → 擋", () => { const t = clone(after); t[1].patientCode = "PT-GGGGGG"; return !M.verifyPatientIdMigration(before, t, plan).ok; });
  await check("兩位病人被併起來 → 擋", () => { const t = clone(after); t[2].patientCode = "PT-AAAAAA"; return !M.verifyPatientIdMigration(before, t, plan).ok; });
  await check("別名沒記 → 擋", () => { const t = clone(after); t[0].formerPatientCodes = []; return !M.verifyPatientIdMigration(before, t, plan).ok; });
  await check("病例少一筆 → 擋", () => !M.verifyPatientIdMigration(before, after.slice(0, 5), plan).ok);
  await check("順序 / id 變了 → 擋", () => !M.verifyPatientIdMigration(before, [after[1], after[0], ...after.slice(2)], plan).ok);

  console.log("F. 儲存層 v1(沒有病人層)");
  {
    const b = memBackend({ [store.STORAGE_KEY]: JSON.stringify(CASES()) });
    store.setBackend(b);
    const loaded = store.load();
    const next = M.applyPatientIdMigration(loaded, M.planPatientIdMigration(loaded, MAP));
    const r = store.renamePatientCodes(next, plan.changes.map((x) => ({ from: x.oldCode, to: x.newCode })), new Map());
    const saved = JSON.parse(b.kv.get(store.STORAGE_KEY));
    await check("v1:一次寫入,新編號在、舊編號只在別名", () => r.world === "v1" && saved[0].patientCode === "PT-AAAAAA"
      && !saved.some((c) => ["ZQX", "P-2099-901", "B-2099-001"].includes(String(c.patientCode).trim())));
    await check("病例還帶舊編號 → 拒絕寫入", () => {
      const raw = b.kv.get(store.STORAGE_KEY);
      return throwsSync(() => store.renamePatientCodes(CASES(), [{ from: "ZQX", to: "PT-AAAAAA" }], new Map())) && b.kv.get(store.STORAGE_KEY) === raw;
    });
    await check("renames 有重複 / 空白 → 拒絕", () => throwsSync(() => store.renamePatientCodes(next, [{ from: "A", to: "PT-AAAAAA" }, { from: "B", to: "PT-AAAAAA" }], new Map()))
      && throwsSync(() => store.renamePatientCodes(next, [{ from: "", to: "PT-AAAAAA" }], new Map()))
      && throwsSync(() => store.renamePatientCodes(next, [], new Map())));
  }

  console.log("G. 儲存層 v2 envelope(病人層 id = 編號的雜湊)");
  {
    const b = await v2World(CASES());
    const env0 = envOf(b);
    const oldPid = env0.patients.find((p) => p.patientCode === "ZQX").id;
    const loaded = store.load();
    const p2 = M.planPatientIdMigration(loaded, MAP);
    const next = M.applyPatientIdMigration(loaded, p2);
    const idByCode = new Map();
    for (const r of p2.changes) idByCode.set(r.newCode, await pidOf(r.newCode));
    const res = store.renamePatientCodes(next, p2.changes.map((x) => ({ from: x.oldCode, to: x.newCode })), idByCode);
    const env = envOf(b);
    const pA = env.patients.find((p) => p.patientCode === "PT-AAAAAA");
    await check("v2:3 位病人換 id 與 code,病人數不變(沒有空殼)", () => res.world === "v2" && res.rekeyed === 3 && env.patients.length === env0.patients.length
      && !env.patients.some((p) => ["ZQX", "P-2099-901", "B-2099-001"].includes(p.patientCode)));
    await check("新 id = 新編號的 canonical 雜湊", async () => pA.id === await pidOf("PT-AAAAAA") && pA.id !== oldPid);
    await check("病例 FK 跟著換、caseIds 不變", () => JSON.stringify(pA.caseIds.slice().sort()) === '["c1","c2"]'
      && env.cases.filter((c) => c.patientId === pA.id).map((c) => c.id).sort().join() === "c1,c2");
    await check("病人層欄位與人工裁決保留,舊 id/code 記在 renamedFrom", () => pA.adjudicationsApplied.length === 1 && pA.fields.sex === "F"
      && pA.renamedFrom.length === 1 && pA.renamedFrom[0].patientCode === "ZQX" && pA.renamedFrom[0].id === oldPid);
    await check("沒換的病人原封不動", () => JSON.stringify(env.patients.find((p) => p.patientCode === "PT-23456A")) === JSON.stringify(env0.patients.find((p) => p.patientCode === "PT-23456A")));
    await check("pending 乾淨、revision +1", () => env.pending_patient_codes.length === 0 && env.runtime_revision === env0.runtime_revision + 1);
    await check("verifyRuntimeEnvelope(含 canonical id 檢查)全綠", async () => { const v = await store.verifyRuntimeEnvelope(env, sha256hex, null); return v.ok || v.failures; });
    await check("轉換後重新載入 → 看得到新編號", () => store.load().filter((c) => c.patientCode === "PT-AAAAAA").length === 2);
  }
  {
    // 對照組:直接 save()(= 病例表單改編號的效果)會留下空殼病人 —— 這正是需要 renamePatientCodes 的原因。
    const b = await v2World(CASES());
    const loaded = store.load();
    store.save(M.applyPatientIdMigration(loaded, M.planPatientIdMigration(loaded, { "code:ZQX": "PT-AAAAAA" })));
    const env = envOf(b);
    await check("對照:直接 save → 舊病人變 0 病例空殼 + 新編號進 pending", () =>
      env.patients.some((p) => p.patientCode === "ZQX" && p.caseIds.length === 0) && env.pending_patient_codes.includes("PT-AAAAAA"));
  }
  {
    const b = await v2World(CASES());
    const loaded = store.load();
    const p2 = M.planPatientIdMigration(loaded, { "code:ZQX": "PT-AAAAAA" });
    const next = M.applyPatientIdMigration(loaded, p2);
    const raw = b.kv.get(store.STAGING_KEY);
    await check("v2:沒給 canonical id → throw、零寫入", () => throwsSync(() => store.renamePatientCodes(next, [{ from: "ZQX", to: "PT-AAAAAA" }], new Map())) && b.kv.get(store.STAGING_KEY) === raw);
    await check("v2:新 id 撞到另一位病人 → throw、零寫入", async () => {
      const otherId = (envOf(b).patients.find((p) => p.patientCode === "PT-23456A")).id;
      return throwsSync(() => store.renamePatientCodes(next, [{ from: "ZQX", to: "PT-AAAAAA" }], new Map([["PT-AAAAAA", otherId]]))) && b.kv.get(store.STAGING_KEY) === raw;
    });
    await check("v2:新編號已經是某位病人 → throw、零寫入", async () => {
      const id = await pidOf("PT-23456A");
      return throwsSync(() => store.renamePatientCodes(next, [{ from: "ZQX", to: "PT-23456A" }], new Map([["PT-23456A", id]]))) && b.kv.get(store.STAGING_KEY) === raw;
    });
    await check("v2:另一個分頁先寫過 → 拒絕(樂觀鎖)、不覆蓋", async () => {
      const env = envOf(b); env.runtime_revision += 1; const other = JSON.stringify(env);
      b.kv.set(store.STAGING_KEY, other);
      const id = await pidOf("PT-AAAAAA");
      return throwsSync(() => store.renamePatientCodes(next, [{ from: "ZQX", to: "PT-AAAAAA" }], new Map([["PT-AAAAAA", id]]))) && b.kv.get(store.STAGING_KEY) === other;
    });
  }
  {
    // 還在 pending(病人 id 還沒鑄)的病人換編號:新編號進 pending,syncPendingPatients 補鑄,舊編號不殘留
    const b = await v2World(CASES().filter((c) => c.id !== "c3"));
    const env = envOf(b);
    env.cases.push(Object.assign({}, CASES()[2], { patientId: null }));
    env.pending_patient_codes = ["P-2099-901"];
    b.kv.set(store.STAGING_KEY, JSON.stringify(env));
    store.setBackend(b);
    const loaded = store.load();
    const p2 = M.planPatientIdMigration(loaded, { "code:P-2099-901": "PT-BBBBBB" });
    const res = store.renamePatientCodes(M.applyPatientIdMigration(loaded, p2), [{ from: "P-2099-901", to: "PT-BBBBBB" }], new Map([["PT-BBBBBB", await pidOf("PT-BBBBBB")]]));
    const e1 = envOf(b);
    await check("v2 pending:新編號換進 pending、舊的消失", () => res.rekeyed === 0 && JSON.stringify(e1.pending_patient_codes) === '["PT-BBBBBB"]');
    await store.syncPendingPatients(sha256hex);
    const e2 = envOf(b);
    await check("v2 pending:補鑄後病人 id = 新編號雜湊、envelope 全綠", async () => {
      const p = e2.patients.find((x) => x.patientCode === "PT-BBBBBB");
      const v = await store.verifyRuntimeEnvelope(e2, sha256hex, null);
      return !!p && p.id === await pidOf("PT-BBBBBB") && e2.pending_patient_codes.length === 0 && (v.ok || v.failures);
    });
  }

  console.log("H. 交接 / 搜尋 / 發號認得舊編號");
  const migrated = M.applyPatientIdMigration(CASES(), plan);
  const items = [{ ref: "h1", patientCode: "ZQX", note: { visitDate: "2099-02-01", subjective: "虛構" } }];
  const hp = H.planHandoff(migrated, items, {});
  await check("交接檔寫舊編號 → 接到同一位病人(不另開新病人)", () => hp.rows[0].status === "append" && hp.rows[0].code === "PT-AAAAAA" && hp.rows[0].warnings.length >= 1);
  await check("交接檔寫新編號 → 照常接上", () => H.planHandoff(migrated, [{ ref: "h2", patientCode: "PT-AAAAAA", note: { visitDate: "2099-02-01" } }], {}).rows[0].status === "append");
  await check("同一個舊編號對到兩位 → 要她改填,不猜", () => {
    const cs = migrated.concat([{ id: "c9", patientCode: "PT-HHHHHH", formerPatientCodes: ["ZQX"], soapNotes: [] }]);
    return H.planHandoff(cs, items, {}).rows[0].status === "ambiguous";
  });
  await check("交接建新病人發號時不撞舊編號", () => {
    const cs = [{ id: "c1", patientCode: "PT-AAAAAA", formerPatientCodes: ["PT-JJJJJJ"], soapNotes: [] }];
    const its = [{ ref: "r9", patientCode: "QZZ", newCase: { caseTitle: "虛構新" }, note: { visitDate: "2099-03-01" } }];
    const p = H.planHandoff(cs, its, { r9: { code: "AQZ", createNew: true } });
    if (!p.toApply || !p.toApply.length) return "plan has nothing to apply";
    const out = H.applyHandoff(cs, its, p, "2099-03-01T00:00:00Z", (ref, i) => (i === 0 ? "PT-JJJJJJ" : "PT-KKKKKK"));
    const nc = out.find((c) => c.id !== "c1");
    return !!nc && nc.patientCode === "PT-KKKKKK";
  });
  await check("搜尋舊編號 → 找得到那位病人(身分欄)", () => {
    const r = S.searchPatients(S.groupCasesByPatient(migrated), "ZQX");
    return r.identity.length === 1 && r.identity[0].patient.patientCode === "PT-AAAAAA";
  });

  console.log("I. app.js / index.html 接線");
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  await check("normalizeClinicalCase 留住 formerPatientCodes(否則下次存檔就丟)", () => /formerPatientCodes: Array\.isArray\(value\.formerPatientCodes\)/.test(app));
  await check("generatePatientId 避開舊編號", () => /function generatePatientId\(\)[\s\S]{0,300}formerPatientCodes/.test(app));
  await check("persist 的轉換分支走 renamePatientCodes", () => /if \(renames\) AcuTingClinicalStore\.renamePatientCodes\(clinicalCases, renames, opts\.idByCode\)/.test(app));
  await check("套用前跑 verifyPatientIdMigration、失敗退回快照", () => /verifyPatientIdMigration\(snapshot, next, plan\)/.test(app) && /persistClinicalCases\(\{ renames, idByCode \}\)\)[\s\S]{0,80}clinicalCases = snapshot/.test(app));
  await check("套用要先匯出備份 + 勾核對", () => /!patientIdMigBackedUp \|\| !patientIdMigChecked \|\| plan\.blocked/.test(app));
  await check("index.html 載入模組(在 app.js 之前)+ 按鈕 + 面板", () => {
    const i = html.indexOf('src="js/patient-id-migration.js"'), j = html.indexOf('src="app.js"');
    return i > 0 && i < j && html.includes('id="patientIdMigBtn"') && html.includes('id="patientIdMigPanel"');
  });

  console.log(failures.length ? `\nFAIL — ${failures.length}/${total} 條沒過:\n  ${failures.join("\n  ")}` : `\nPASS — ${total}/${total}:病人編號轉換只換永久鍵、同一位不拆不併、撞號擋下、v1/v2 一次寫入失敗零寫入、交接與搜尋認得舊編號。`);
  process.exit(failures.length ? 1 : 0);
})();
