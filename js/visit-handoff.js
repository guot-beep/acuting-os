/* visit-handoff.js — 「就診交接」匯入的純函式層(2026-11-02,D34 續四)。
 *
 * 為什麼不用既有的「匯入病例」:那條路以病例 id 合併,同 id 病例的 soapNotes 整個陣列
 * 會被匯入檔取代 —— 想「替既有病人加一次就診」就得把她系統裡現有的 SOAP 全部原樣帶進來,
 * 帶錯一筆就蓋掉。每週交接的本質是「加一次就診」,所以獨立一條只會 append 的路。
 *
 * 規則(交接檔自帶的 instructionsForClaude + 專案紅線):
 *   - 配對:交接檔裡的代號只是「候選」,在她系統裡找到才算數 —— 先比病人編號(patientCode,永久鍵),
 *     再比顯示代號(displayCode,例 AQZ;只有剛好一位病人是這個代號才算);都找不到就擱著。
 *   - 沒有代號的病人不自動建立:要她在預覽裡填顯示代號(族群字母 + 名姓縮寫,例 AQZ)、並勾「建立新病人」。
 *     新病人的永久編號由系統產生(不是縮寫、不是年齡,11/02 Labeling Standard 第 5 條)。
 *   - 同一病例已有同日 SOAP → 預設不匯入(她勾了才加)。同一筆交接匯過一次 → 不再匯。
 *   - 既有病例的欄位不覆蓋:只補空白欄位(可取消)+ 新的安全旗標併進去。
 *   - visitNumber 不推算;空的就是空的。
 * 這裡不碰 DOM、不碰儲存;scripts/validate-visit-handoff.js 在 node 裡跑真值表。
 */
(function (global) {
  "use strict";

  const SCHEMA = "acuting-visit-handoff-v1";
  // 顯示代號:族群字母 + 名姓縮寫(與 js/case-search.js 的 parseDisplayCode 同一條規則)。
  const DISPLAY_CODE_RE = /^([A-Za-z])([A-Za-z]{1,4})$/;
  const str = (v) => (v === null || v === undefined ? "" : String(v));
  const arr = (v) => (Array.isArray(v) ? v : []);
  const filled = (v) => (Array.isArray(v) ? v.length > 0 : v !== "" && v !== null && v !== undefined);

  const normalizeCode = (code) => str(code).trim();
  const compactDisplay = (code) => str(code).trim().replace(/[\s.-]+/g, "");
  function isDisplayCode(code) {
    return DISPLAY_CODE_RE.test(compactDisplay(code));
  }
  const normalizeDisplay = (code) => (isDisplayCode(code) ? compactDisplay(code).toUpperCase() : str(code).trim());

  // 交接檔只收這個 schema;形狀不對就整份拒絕(訊息只講形狀,不轉述內容)。
  function parseHandoff(json) {
    const doc = typeof json === "string" ? JSON.parse(json) : json;
    if (!doc || doc.schema !== SCHEMA || !Array.isArray(doc.items)) throw new Error(`不是就診交接檔(需要 schema = ${SCHEMA} 與 items 陣列)`);
    const refs = new Set();
    doc.items.forEach((it, i) => {
      if (!it || typeof it !== "object") throw new Error(`第 ${i + 1} 筆不是物件`);
      if (!str(it.ref)) throw new Error(`第 ${i + 1} 筆缺 ref`);
      if (refs.has(it.ref)) throw new Error(`ref 重複:第 ${i + 1} 筆`);
      refs.add(it.ref);
      if (!it.note || typeof it.note !== "object") throw new Error(`第 ${i + 1} 筆缺 note`);
    });
    return doc;
  }

  const noteIdFor = (ref) => `soap.handoff.${ref}`;
  const caseIdFor = (ref) => `case.handoff.${ref}`;

  // 同一位病人有多個病例時預設接到哪一個:治療中的優先,再看最近一次就診。
  function defaultTargetCase(list) {
    const last = (c) => arr(c.soapNotes).map((n) => str(n.visitDate)).filter(Boolean).sort().pop() || "";
    return [...list].sort((a, b) => {
      const act = (str(b.status || "active") === "active") - (str(a.status || "active") === "active");
      return act || last(b).localeCompare(last(a));
    })[0];
  }

  // choices[ref] = { code, caseId, include, createNew, fillEmpty }(都可省略)
  function planHandoff(cases, items, choices) {
    choices = choices || {};
    const byCode = new Map();
    const byDisplay = new Map();   // 顯示代號 → Set(病人編號)
    for (const c of cases) {
      const code = str(c.patientCode).trim();
      if (!code) continue;
      if (!byCode.has(code)) byCode.set(code, []);
      byCode.get(code).push(c);
      const dc = normalizeDisplay(c.displayCode);
      if (dc) { if (!byDisplay.has(dc)) byDisplay.set(dc, new Set()); byDisplay.get(dc).add(code); }
    }
    const existingNoteIds = new Set(cases.flatMap((c) => arr(c.soapNotes).map((n) => n.id)));
    const existingCaseIds = new Set(cases.map((c) => c.id));
    const rows = items.map((it) => {
      const ch = choices[it.ref] || {};
      const typed = ch.code !== undefined ? ch.code : it.patientCode;
      const code = normalizeCode(typed);
      const row = { ref: it.ref, code, candidateCode: str(it.patientCode), visitDate: str(it.note.visitDate), status: "", include: false,
        targetCaseId: "", targetChoices: [], sameDate: false, newFlags: [], fillFields: [], fillEmpty: false, errors: [], warnings: [] };
      if (existingNoteIds.has(noteIdFor(it.ref)) || existingCaseIds.has(caseIdFor(it.ref))) {
        row.status = "already_imported";
        return row;
      }
      if (!code) { row.status = "needs_code"; return row; }
      // 先比病人編號;再比顯示代號(剛好一位才接上,兩位以上要她改填病人編號)
      let ownerCode = byCode.has(code) ? code : "";
      const viaDisplay = !ownerCode && byDisplay.get(normalizeDisplay(code));
      if (viaDisplay && viaDisplay.size === 1) ownerCode = [...viaDisplay][0];
      if (viaDisplay && viaDisplay.size > 1) {
        row.status = "ambiguous";
        row.errors.push(`有 ${viaDisplay.size} 位病人的顯示代號都是 ${normalizeDisplay(code)},請改填病人編號(${[...viaDisplay].join("、")})`);
        return row;
      }
      const owned = ownerCode ? byCode.get(ownerCode) : null;
      if (ownerCode) row.code = ownerCode;
      if (owned && owned.length) {
        const target = owned.find((c) => c.id === ch.caseId) || defaultTargetCase(owned);
        row.status = "append";
        row.targetCaseId = target.id;
        row.targetChoices = owned.map((c) => ({ id: c.id, title: str(c.caseTitle), status: str(c.status || "active"), visits: arr(c.soapNotes).length }));
        row.sameDate = !!row.visitDate && arr(target.soapNotes).some((n) => str(n.visitDate) === row.visitDate);
        row.include = ch.include !== undefined ? !!ch.include : !row.sameDate;
        const have = new Set(arr(target.safetyFlags).map(str));
        row.newFlags = arr(it.safetyFlags).map(str).filter((f) => f && !have.has(f));
        // safetyFlags 不走「補空白」:上面 newFlags 已經逐條併入,兩邊都做會重複處理。
        row.fillFields = Object.keys(it.newCase || {}).filter((k) => k !== "id" && k !== "patientCode" && k !== "soapNotes" && k !== "safetyFlags"
          && filled(it.newCase[k]) && !filled(target[k])
          && !(k === "birthYear" && filled(target.birthYearMonth)));   // 已有出生年月就不另補出生年
        row.fillEmpty = ch.fillEmpty !== undefined ? !!ch.fillEmpty : true;
        if (row.sameDate) row.warnings.push(`這個病例 ${row.visitDate} 已經有一筆 SOAP —— 可能重複,預設不匯入`);
        return row;
      }
      // 系統裡沒有這個代號
      if (!it.newCase) { row.status = "code_not_found"; row.errors.push("系統裡找不到這個代號,而這筆沒有附新病人的病例資料"); return row; }
      row.status = "new_patient";
      // 交接檔帶來的候選代號在系統裡找不到 → 擱著。要建立新病人,得由她自己打一個顯示代號,
      // 不拿交接檔的舊代號(例:上一批交接的舊代號)直接當新病人的代號。
      if (ch.code === undefined && row.candidateCode) {
        row.errors.push("系統裡找不到這個候選代號。是新病人的話,請在代號欄改填顯示代號(族群字母 + 名姓縮寫,例 AQZ)");
      } else if (!isDisplayCode(code)) {
        row.errors.push(code === row.candidateCode
          ? "系統裡找不到這個候選代號。是新病人的話,請填顯示代號(族群字母 + 名姓縮寫,例 AQZ)"
          : "新病人請填顯示代號:族群字母 + 名姓縮寫,例 AQZ(只用字母)");
      } else {
        row.code = normalizeDisplay(code);
        if (byDisplay.has(row.code)) row.warnings.push(`已經有病人的顯示代號是 ${row.code} —— 如果是同一人,改填他的病人編號(${[...byDisplay.get(row.code)].join("、")})`);
      }
      row.include = !row.errors.length && ch.createNew === true;
      return row;
    });
    // 兩筆新病人填同一個顯示代號:顯示代號本來就不唯一,不擋;但提醒 —— 同一人兩次就診會變成兩位病人
    const newCodes = new Map();
    for (const r of rows) if (r.status === "new_patient" && !r.errors.length) newCodes.set(r.code, (newCodes.get(r.code) || 0) + 1);
    for (const r of rows) if (r.status === "new_patient" && newCodes.get(r.code) > 1) r.warnings.push(`另一筆新病人也填了 ${r.code} —— 如果是同一人,先建立一筆、寫入後再把另一筆接上`);
    for (const r of rows) if (r.errors.length) r.include = false;
    // 每一列各自獨立:有錯的列不匯,不擋其他列。
    return { rows, toApply: rows.filter((r) => r.include) };
  }

  // 回傳新的病例陣列(不改原陣列)。只處理 plan 裡 include 的列。
  function applyHandoff(cases, items, plan, now, newPatientId) {
    now = now || new Date().toISOString();
    const taken = new Set(cases.map((c) => str(c.patientCode).trim()).filter(Boolean));
    const mintId = (ref) => {
      for (let i = 0; i < 50; i++) {
        const id = newPatientId ? newPatientId(ref, i) : "";
        if (id && !taken.has(id)) { taken.add(id); return id; }
      }
      throw new Error("無法產生不重複的病人編號");
    };
    const byRef = new Map(items.map((it) => [it.ref, it]));
    let out = cases.map((c) => c);
    const newCases = [];
    for (const r of plan.toApply) {
      const it = byRef.get(r.ref);
      const note = Object.assign({}, it.note, { id: noteIdFor(r.ref), createdAt: now, updatedAt: now });
      if (r.status === "append") {
        out = out.map((c) => {
          if (c.id !== r.targetCaseId) return c;
          const next = Object.assign({}, c, { soapNotes: [...arr(c.soapNotes), note], updatedAt: now });
          if (r.newFlags.length) next.safetyFlags = [...arr(c.safetyFlags), ...r.newFlags];
          if (r.fillEmpty) for (const k of r.fillFields) next[k] = it.newCase[k];
          return next;
        });
      } else if (r.status === "new_patient") {
        newCases.push(Object.assign({}, it.newCase, { id: caseIdFor(r.ref), patientCode: mintId(r.ref), displayCode: r.code, soapNotes: [note], createdAt: now, updatedAt: now }));
      }
    }
    return [...newCases, ...out];
  }

  const api = { SCHEMA, parseHandoff, planHandoff, applyHandoff, isDisplayCode, normalizeDisplay, noteIdFor, caseIdFor };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.AcuTingVisitHandoff = api;
})(typeof window !== "undefined" ? window : globalThis);
