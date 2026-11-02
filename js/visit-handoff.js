/* visit-handoff.js — 「就診交接」匯入的純函式層(2026-11-02,D34 續四)。
 *
 * 為什麼不用既有的「匯入病例」:那條路以病例 id 合併,同 id 病例的 soapNotes 整個陣列
 * 會被匯入檔取代 —— 想「替既有病人加一次就診」就得把她系統裡現有的 SOAP 全部原樣帶進來,
 * 帶錯一筆就蓋掉。每週交接的本質是「加一次就診」,所以獨立一條只會 append 的路。
 *
 * 規則(交接檔自帶的 instructionsForClaude + 專案紅線):
 *   - 代號是唯一配對鍵。交接檔裡的代號只是「候選」,在她系統裡找到才算數;找不到就擱著。
 *   - 沒有代號的病人不自動建立:要她在預覽裡填 ATG-1984F 格式代號、並勾「建立新病人」。
 *   - 同一病例已有同日 SOAP → 預設不匯入(她勾了才加)。同一筆交接匯過一次 → 不再匯。
 *   - 既有病例的欄位不覆蓋:只補空白欄位(可取消)+ 新的安全旗標併進去。
 *   - visitNumber 不推算;空的就是空的。
 * 這裡不碰 DOM、不碰儲存;scripts/validate-visit-handoff.js 在 node 裡跑真值表。
 */
(function (global) {
  "use strict";

  const SCHEMA = "acuting-visit-handoff-v1";
  const CODE_RE = /^([A-Za-z])([A-Za-z]{1,4})-(\d{4})([FMXfmx])$/;
  const str = (v) => (v === null || v === undefined ? "" : String(v));
  const arr = (v) => (Array.isArray(v) ? v : []);
  const filled = (v) => (Array.isArray(v) ? v.length > 0 : v !== "" && v !== null && v !== undefined);

  function normalizeCode(code) {
    const t = str(code).trim();
    const m = CODE_RE.exec(t);
    return m ? `${m[1].toUpperCase()}${m[2].toUpperCase()}-${m[3]}${m[4].toUpperCase()}` : t;
  }
  function isNewFormatCode(code) {
    const m = CODE_RE.exec(str(code).trim());
    if (!m) return false;
    const y = Number(m[3]);
    return y >= 1900 && y <= new Date().getFullYear();
  }

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
    for (const c of cases) {
      const code = str(c.patientCode).trim();
      if (!code) continue;
      if (!byCode.has(code)) byCode.set(code, []);
      byCode.get(code).push(c);
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
      const owned = byCode.get(code);
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
      if (!isNewFormatCode(code)) {
        row.errors.push(code === row.candidateCode
          ? "系統裡找不到這個候選代號。是新病人的話,請填 ATG-1984F 格式的新代號"
          : "新病人請用 ATG-1984F 格式(族裔字母 + 姓名縮寫 - 出生年 + 性別)");
      } else {
        const m = CODE_RE.exec(code);
        const sex = { 女: "F", 男: "M", F: "F", M: "M" }[str(it.newCase.sex).trim()] || "";
        if (sex && m[4].toUpperCase() !== sex) row.warnings.push(`病例資料性別是 ${sex},代號寫 ${m[4].toUpperCase()}`);
        if (filled(it.newCase.birthYear) && String(it.newCase.birthYear) !== m[3]) row.warnings.push(`病例資料出生年是 ${it.newCase.birthYear},代號寫 ${m[3]}`);
      }
      row.include = !row.errors.length && ch.createNew === true;
      return row;
    });
    // 兩筆新病人填了同一個新代號 → 擋(同一人兩次就診請先建一筆,再用第二筆接上)
    const newCodes = new Map();
    for (const r of rows) if (r.status === "new_patient" && !r.errors.length) newCodes.set(r.code, (newCodes.get(r.code) || 0) + 1);
    for (const r of rows) if (r.status === "new_patient" && newCodes.get(r.code) > 1) { r.errors.push(`有另一筆新病人也填了 ${r.code}`); r.include = false; }
    for (const r of rows) if (r.errors.length) r.include = false;
    // 每一列各自獨立:有錯的列不匯,不擋其他列。
    return { rows, toApply: rows.filter((r) => r.include) };
  }

  // 回傳新的病例陣列(不改原陣列)。只處理 plan 裡 include 的列。
  function applyHandoff(cases, items, plan, now) {
    now = now || new Date().toISOString();
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
        newCases.push(Object.assign({}, it.newCase, { id: caseIdFor(r.ref), patientCode: r.code, soapNotes: [note], createdAt: now, updatedAt: now }));
      }
    }
    return [...newCases, ...out];
  }

  const api = { SCHEMA, parseHandoff, planHandoff, applyHandoff, normalizeCode, isNewFormatCode, noteIdFor, caseIdFor };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.AcuTingVisitHandoff = api;
})(typeof window !== "undefined" ? window : globalThis);
