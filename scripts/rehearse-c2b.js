/* C2b P3 rehearsal — 完整週期在「假 localStorage」上排練(Codex P3.2)。
 * 絕不接觸任何瀏覽器;輸入是 raw snapshot 檔的「隔離副本」。
 *
 * 週期:dry-run plan → executeMigration → verifyStaging → 同 source 重跑
 * (必須 0/0/0)→ switchPointer → rollbackMigration → 斷言原 raw byte 不變
 * 且 migration keys 全清。任一步失敗 = exit 1。
 *
 * 用法:node scripts/rehearse-c2b.js <raw.json> [--adjudications <adj.json>]
 */
"use strict";
const fs = require("fs");
const crypto = require("crypto");
const { execSync } = require("child_process");
require("../js/clinical-store.js");
const S = globalThis.AcuTingClinicalStore;

const sha256 = (t) => crypto.createHash("sha256").update(t, "utf8").digest("hex");
const hasher = { sha256 };

const rawFile = process.argv[2];
if (!rawFile) { console.log("usage: node scripts/rehearse-c2b.js <raw.json> [--adjudications <adj.json>]"); process.exit(2); }
const adjIdx = process.argv.indexOf("--adjudications");
const adjArg = adjIdx > -1 ? ` --adjudications ${JSON.stringify(process.argv[adjIdx + 1])}` : "";

const rawText = fs.readFileSync(rawFile, "utf8");
const rawHashBefore = sha256(rawText);

// 假 localStorage:migration 全程只能經 backend 寫 —— 這個 shim 同時記錄
// 每一次 write/remove,rehearsal 結束時斷言只碰過白名單 keys。
const kv = new Map();
const touched = [];
S.setBackend({
  read() { return kv.get("acuting-clinical-cases-v1") ?? null; },
  write() { throw new Error("REHEARSAL VIOLATION: attempted write to v1 case key"); },
  readKey(k) { return kv.get(k) ?? null; },
  writeKey(k, v) { touched.push(["write", k]); kv.set(k, v); },
  removeKey(k) { touched.push(["remove", k]); kv.delete(k); }
});
kv.set("acuting-clinical-cases-v1", rawText);

let failures = 0;
const check = (name, ok, detail = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`); if (!ok) failures++; };

// 1. deterministic plan(经由既有 dry-run 腳本,同一實作)
const planJson = execSync(`node scripts/migrate-c2b.js --dry-run ${JSON.stringify(rawFile)}${adjArg}`).toString().split("# dry-run")[0];
const plan = JSON.parse(planJson);
check("plan source hash matches raw", plan.source_sha256 === rawHashBefore);

// 2. execute → staging
const r1 = S.executeMigration(rawText, plan, hasher);
check("execute writes staging", r1.idempotent_noop === false && r1.creates === plan.counts.patients + plan.counts.cases, `creates=${r1.creates}`);

// 3. verify
const v = S.verifyStaging(rawText, hasher);
check("verifyStaging green", v.ok, v.failures.join("; "));

// 4. idempotent rerun
const r2 = S.executeMigration(rawText, plan, hasher);
check("same-source rerun is 0/0/0", r2.idempotent_noop === true && r2.creates === 0 && r2.updates === 0 && r2.deletes === 0);

// 5. pointer switch(驗證後才准)
const sw = S.switchPointer(rawText, hasher);
check("pointer switched after green verify", sw.switched === true && kv.get(S.POINTER_KEY) === "v2");

// 6. tamper guard:壞 staging 之後 switch 必須拒絕
const stagingBackup = kv.get(S.STAGING_KEY);
const tampered = JSON.parse(stagingBackup);
tampered.cases[0].caseTitle = "TAMPERED IN PLACE";   // 動真欄位,驗 verify 的逐 case 比對
kv.set(S.STAGING_KEY, JSON.stringify(tampered));
let refused = false;
try { S.switchPointer(rawText, hasher); } catch { refused = true; }
check("tampered staging refused at switch", refused);
kv.set(S.STAGING_KEY, stagingBackup);

// 6b. SOL adversarial fixture(2026-08-11 BLOCKER):兩個 valid patientId 互換
//     必須被 verifyStaging 抓到 —— 「存在」不等於「正確」。需要 ≥2 patients。
if (plan.counts.patients >= 2) {
  const st = JSON.parse(kv.get(S.STAGING_KEY));
  const twoCase = st.cases.filter((c) => c.patientId).slice(0, 2);
  if (twoCase.length === 2 && twoCase[0].patientId !== twoCase[1].patientId) {
    const tmp = twoCase[0].patientId; twoCase[0].patientId = twoCase[1].patientId; twoCase[1].patientId = tmp;
    kv.set(S.STAGING_KEY, JSON.stringify(st));
    const vSwap = S.verifyStaging(rawText, hasher);
    check("swapped patientIds caught (SOL adversarial)", !vSwap.ok && vSwap.failures.some((f) => f.includes("cross-wired")));
    kv.set(S.STAGING_KEY, stagingBackup);
  } else {
    check("swapped patientIds caught (SOL adversarial)", false, "could not construct swap — unexpected staging shape");
  }
} else {
  console.log("skip swapped-patientId adversarial (single-patient source)");
}

// 6c. blank-code case 被塞 patientId 也要抓
{
  const st = JSON.parse(kv.get(S.STAGING_KEY));
  st.cases[0] = { ...st.cases[0] };
  const origCode = st.cases[0].patientCode, origPid = st.cases[0].patientId;
  st.cases[0].patientCode = "";
  kv.set(S.STAGING_KEY, JSON.stringify(st));
  const vBlank = S.verifyStaging(rawText, hasher);
  check("blank-code integrity violation caught", !vBlank.ok);
  kv.set(S.STAGING_KEY, stagingBackup);
}

// 7. rollback
const rb = S.rollbackMigration();
check("rollback removes exactly the whitelist", JSON.stringify(rb.removed.sort()) === JSON.stringify([S.POINTER_KEY, S.STAGING_KEY].sort()));
check("staging+pointer gone after rollback", kv.get(S.STAGING_KEY) === undefined && kv.get(S.POINTER_KEY) === undefined);

// 8. 原 raw 完全未動;所有寫入都在白名單內
check("v1 raw byte-identical after full cycle", sha256(kv.get("acuting-clinical-cases-v1")) === rawHashBefore);
const offList = touched.filter(([, k]) => k !== S.STAGING_KEY && k !== S.POINTER_KEY);
check("zero writes outside whitelist", offList.length === 0, offList.map(([op, k]) => `${op}:${k}`).join(", "));

console.log(failures ? `\nREHEARSAL FAIL — ${failures} failure(s)` : `\nREHEARSAL PASS — full cycle green (${plan.counts.cases} cases → ${plan.counts.patients} patients)`);
process.exit(failures ? 1 : 0);
