/* 病人編號轉換:舊的永久編號(AJK、P-2026-101、B-2026-001…)→ 標準 PT-xxxxxx(2026-11-20,Ting)
 *
 * 為什麼要一個專門的工具:patientCode 是病人的永久鍵。病例表單改它 = 新鑄一位病人、舊的那位
 * 變孤兒(v2 世界裡 patient.id 是 patientCode 的雜湊)。所以改名只能整批、原子地做:
 *   1. 這裡(純函式,有真值表 scripts/validate-patient-id-migration.js)算出對照表、擋撞號;
 *   2. app.js 畫預覽,Ting 逐列核對,先匯出備份才能套用;
 *   3. js/clinical-store.js renamePatientCodes() 一次寫入(v2:病人物件換 id+code、病例 FK
 *      跟著換;v1:就是一般 save),失敗整批退回(R9)。
 *
 * 規則:
 *   - 只動 patientCode;顯示代號(displayCode)與其他欄位一個字都不碰。
 *   - 舊編號記進 formerPatientCodes(別名):週交接檔若還寫舊編號,照樣接得上同一位病人,
 *     不會被當成新病人另開一位。
 *   - 新編號必須是 app 自己發號的格式(PT- + 6 碼,去掉 0/O/1/I/L);
 *     跟任何現有編號、任何舊編號、同批另一列撞到 = 錯誤,整批不能套用。
 *   - 已經是標準格式的不列出;沒有編號的病例不在這裡處理(那不是「舊編號」)。 */
(function (global) {
  "use strict";

  const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const STANDARD_RE = new RegExp("^PT-[" + ALPHABET + "]{6}$");
  const str = (v) => (v === undefined || v === null ? "" : String(v));
  const arr = (v) => (Array.isArray(v) ? v : []);
  const trimCode = (v) => str(v).trim();

  function isStandardPatientId(code) { return STANDARD_RE.test(trimCode(code)); }

  // 打字容錯:前後空白、小寫、中間空白;「pt 7k3qxm」→「PT-7K3QXM」不猜,只收 PT- 開頭的。
  function normalizeTypedId(typed) { return str(typed).replace(/\s+/g, "").toUpperCase(); }

  // 所有現在或以前用過的編號 —— 新編號一個都不能撞。
  function takenCodes(cases) {
    const taken = new Set();
    for (const c of arr(cases)) {
      const code = trimCode(c.patientCode);
      if (code) taken.add(code);
      for (const f of arr(c.formerPatientCodes)) if (trimCode(f)) taken.add(trimCode(f));
    }
    return taken;
  }

  function defaultRandomBytes(n) {
    const g = typeof globalThis !== "undefined" ? globalThis.crypto : null;
    if (!g || typeof g.getRandomValues !== "function") throw new Error("這個環境沒有 crypto.getRandomValues,無法發新編號");
    return g.getRandomValues(new Uint8Array(n));
  }

  // 與 app.js generatePatientId() 同一套字母與做法;taken 會被加入新發的號(同批不重複)。
  function mintPatientId(taken, randomBytes) {
    const rnd = randomBytes || defaultRandomBytes;
    for (let i = 0; i < 1000; i++) {
      const bytes = rnd(6);
      const id = "PT-" + [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("");
      if (!taken.has(id)) { taken.add(id); return id; }
    }
    throw new Error("連抽 1000 次都撞號,停止(亂數來源壞了?)");
  }

  // 需要轉換的病人:有編號、而且不是標準格式。一個編號一列(同編號的多個病例一起換)。
  function legacyPatients(cases) {
    const byCode = new Map();
    for (const c of arr(cases)) {
      const code = trimCode(c.patientCode);
      if (!code || isStandardPatientId(code)) continue;
      if (!byCode.has(code)) byCode.set(code, { key: "code:" + code, oldCode: code, caseIds: [], displayCodes: [] });
      const row = byCode.get(code);
      row.caseIds.push(str(c.id));
      const dc = trimCode(c.displayCode);
      if (dc && !row.displayCodes.includes(dc)) row.displayCodes.push(dc);
    }
    return [...byCode.values()];
  }

  // 預填:每位舊編號病人先發一個新號(她可以改成別處已經在用的 PT 號,或清空 = 這次不換)。
  function suggestPatientIds(cases, randomBytes) {
    const taken = takenCodes(cases);
    const out = {};
    for (const p of legacyPatients(cases)) out[p.key] = mintPatientId(taken, randomBytes);
    return out;
  }

  /* mapping[key] = 她確認的新編號(空白 = 不換)。回傳
   *   rows     每位舊編號病人一列 { key, oldCode, newCode, status: skip|ok|error, errors, warnings, caseIds, displayCodes }
   *   changes  status=ok 的列
   *   blocked  有錯的列數(>0 整批不能套用)
   *   standard 已經是標準格式的病人數;blankCases 沒有編號的病例數(都不在這裡處理) */
  function planPatientIdMigration(cases, mapping) {
    const list = arr(cases);
    const owners = new Map();   // 現在的編號 → 哪幾個病例
    const former = new Map();   // 以前的編號 → 現在屬於誰
    for (const c of list) {
      const code = trimCode(c.patientCode);
      if (code) owners.set(code, (owners.get(code) || 0) + 1);
      for (const f of arr(c.formerPatientCodes)) if (trimCode(f)) former.set(trimCode(f), code);
    }
    const rows = legacyPatients(list).map((p) => {
      const newCode = normalizeTypedId((mapping || {})[p.key]);
      const row = Object.assign({}, p, { newCode, status: "skip", errors: [], warnings: [] });
      if (!newCode) return row;
      if (!/^PT-[A-Z0-9]{6}$/.test(newCode)) row.errors.push("格式要是 PT- 加 6 碼,例 PT-7K3QXM");
      else if (!STANDARD_RE.test(newCode)) row.errors.push("含 0 / O / 1 / I / L —— 系統發的號不用這幾個易混字(換成系統建議的號,或確認別處寫的是哪個字)");
      if (owners.has(newCode)) row.errors.push(`${newCode} 已經是另一位病人的編號`);
      else if (former.has(newCode) && former.get(newCode) !== p.oldCode) row.errors.push(`${newCode} 是另一位病人以前用過的編號`);
      row.status = row.errors.length ? "error" : "ok";
      return row;
    });
    // 同一批裡兩列填了同一個新號
    const count = new Map();
    for (const r of rows) if (r.newCode) count.set(r.newCode, (count.get(r.newCode) || 0) + 1);
    for (const r of rows) {
      if (r.newCode && count.get(r.newCode) > 1) { r.errors.push(`這一批有 ${count.get(r.newCode)} 位都填了 ${r.newCode}`); r.status = "error"; }
    }
    const standard = new Set(list.map((c) => trimCode(c.patientCode)).filter(isStandardPatientId)).size;
    const blankCases = list.filter((c) => !trimCode(c.patientCode)).length;
    const changes = rows.filter((r) => r.status === "ok");
    return { rows, changes, blocked: rows.filter((r) => r.status === "error").length, standard, blankCases };
  }

  // 只在完全沒有錯誤時套用;回傳新的病例陣列(不改原陣列)。只動 patientCode 與 formerPatientCodes。
  function applyPatientIdMigration(cases, plan) {
    if (!plan || plan.blocked) throw new Error("plan has errors — refuse to apply");
    if (!plan.changes.length) throw new Error("plan has no changes");
    const map = new Map(plan.changes.map((r) => [r.oldCode, r.newCode]));
    return arr(cases).map((c) => {
      const code = trimCode(c.patientCode);
      if (!map.has(code)) return c;
      const prev = arr(c.formerPatientCodes).map(str).filter((f) => trimCode(f));
      return Object.assign({}, c, {
        patientCode: map.get(code),
        formerPatientCodes: prev.includes(code) ? prev : prev.concat([code])
      });
    });
  }

  function stableStringify(v) {
    if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
    if (v && typeof v === "object") return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + stableStringify(v[k])).join(",") + "}";
    return JSON.stringify(v === undefined ? null : v);
  }

  /* 寫入前的最後一道檢查(app 在 persist 前跑;失敗就不寫)。before = 快照,after = 準備寫入的陣列。
   * 失敗訊息只有病例 id 與欄位名,不帶病歷內容。 */
  function verifyPatientIdMigration(before, after, plan) {
    const failures = [];
    const b = arr(before), a = arr(after);
    const map = new Map(arr(plan && plan.changes).map((r) => [r.oldCode, r.newCode]));
    if (b.length !== a.length) failures.push(`case count ${b.length} → ${a.length}`);
    const strip = (c) => { const o = Object.assign({}, c); delete o.patientCode; delete o.formerPatientCodes; delete o.updatedAt; delete o.patientId; return stableStringify(o); };
    const n = Math.min(b.length, a.length);
    for (let i = 0; i < n; i++) {
      const x = b[i], y = a[i];
      if (str(x.id) !== str(y.id)) { failures.push(`position ${i}: case id changed`); continue; }
      if (strip(x) !== strip(y)) failures.push(`case ${x.id}: fields other than patientCode/formerPatientCodes/updatedAt changed`);
      const oldCode = trimCode(x.patientCode);
      const expect = map.has(oldCode) ? map.get(oldCode) : str(x.patientCode);
      if (str(y.patientCode) !== expect) failures.push(`case ${x.id}: patientCode not the planned value`);
      const fb = arr(x.formerPatientCodes).map(str), fa = arr(y.formerPatientCodes).map(str);
      if (fb.some((f) => !fa.includes(f))) failures.push(`case ${x.id}: formerPatientCodes lost an entry`);
      if (map.has(oldCode) && !fa.includes(oldCode)) failures.push(`case ${x.id}: old code not kept in formerPatientCodes`);
      if (!map.has(oldCode) && stableStringify(fb) !== stableStringify(fa)) failures.push(`case ${x.id}: formerPatientCodes changed on a case outside the plan`);
    }
    // 分組不變:轉換前同一位病人的病例,轉換後仍是同一位,而且沒有跟別人併在一起。
    const groups = (list) => {
      const g = new Map();
      for (const c of list) { const k = trimCode(c.patientCode); if (!k) continue; if (!g.has(k)) g.set(k, []); g.get(k).push(str(c.id)); }
      return [...g.values()].map((ids) => ids.sort().join("|")).sort();
    };
    if (stableStringify(groups(b)) !== stableStringify(groups(a))) failures.push("patient grouping changed (a patient was split or merged)");
    const stillOld = a.filter((c) => map.has(trimCode(c.patientCode))).length;
    if (stillOld) failures.push(`${stillOld} case(s) still carry an old code`);
    return { ok: failures.length === 0, failures };
  }

  const api = {
    ALPHABET, STANDARD_RE, isStandardPatientId, normalizeTypedId, takenCodes, mintPatientId,
    legacyPatients, suggestPatientIds, planPatientIdMigration, applyPatientIdMigration, verifyPatientIdMigration,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.AcuTingPatientIdMigration = api;
})(typeof window !== "undefined" ? window : globalThis);
