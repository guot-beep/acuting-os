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

  // 標註欄位(D35 標題:★ 顯示代號 性別/年齡 ❤️ 🌙)。2026-11-05 加「只補標註」項目(沒有 note、只有 labels):
  // 一次替既有病人補代號與標註,一樣只填空白、不覆蓋。詞彙表只認 js/case-search.js 那一份,這裡不另抄。
  const LABEL_KEYS = ["displayCode", "categoryPrimary", "categorySecondary", "treatmentStage", "caseHighlight", "careContexts", "birthYear"];
  const LABEL_NAMES = { displayCode: "顯示代號", categoryPrimary: "主類別", categorySecondary: "次類別", treatmentStage: "治療進度",
    caseHighlight: "病例價值", careContexts: "照護情境", birthYear: "出生年" };
  function vocab() {
    if (global.AcuTingCaseSearch) return global.AcuTingCaseSearch;
    if (typeof require === "function") return require("./case-search.js");
    throw new Error("找不到 AcuTingCaseSearch 詞彙表");
  }
  // 只檢查帶來的標註值認不認得;onlyLabelKeys = 只補標註項目(不收其他欄位)。
  function labelErrors(l, onlyLabelKeys) {
    const S = vocab();
    const e = [];
    if (onlyLabelKeys) for (const k of Object.keys(l)) if (!LABEL_KEYS.includes(k)) e.push(`只補標註不收「${k}」`);
    if (filled(l.displayCode) && !isDisplayCode(l.displayCode)) e.push(`顯示代號格式不對:${str(l.displayCode)}(族群字母 + 名姓縮寫,例 AQZ)`);
    if (filled(l.categoryPrimary) && !S.CASE_CATEGORIES[l.categoryPrimary]) e.push(`不認得的主類別:${str(l.categoryPrimary)}`);
    if (l.categorySecondary !== undefined && !Array.isArray(l.categorySecondary)) e.push("次類別要是清單");
    const sec = arr(l.categorySecondary);
    for (const k of sec) if (!S.CASE_CATEGORIES[k]) e.push(`不認得的次類別:${str(k)}`);
    if (sec.length > S.MAX_SECONDARY_CATEGORIES) e.push(`次類別最多 ${S.MAX_SECONDARY_CATEGORIES} 個`);
    if (filled(l.categoryPrimary) && sec.includes(l.categoryPrimary)) e.push("次類別不能跟主類別重複");
    if (filled(l.treatmentStage) && !S.CASE_STAGES[l.treatmentStage]) e.push(`不認得的治療進度:${str(l.treatmentStage)}`);
    if (filled(l.caseHighlight) && !S.CASE_HIGHLIGHTS[l.caseHighlight]) e.push(`不認得的病例價值:${str(l.caseHighlight)}`);
    if (l.careContexts !== undefined && !Array.isArray(l.careContexts)) e.push("照護情境要是清單");
    for (const k of arr(l.careContexts)) if (!S.CARE_CONTEXTS[k]) e.push(`不認得的照護情境:${str(k)}`);
    if (filled(l.birthYear)) {
      const y = Number(l.birthYear);
      if (!Number.isInteger(y) || y < 1900 || y > new Date().getFullYear()) e.push(`出生年不對:${str(l.birthYear)}`);
    }
    return e;
  }
  // 次類別跟主類別是一組:病例已經有自己的主類別時,不單獨補次類別(可能跟她的主類別重複或不搭)。
  const pickLabels = (o) => Object.fromEntries(LABEL_KEYS.filter((k) => o && o[k] !== undefined).map((k) => [k, o[k]]));
  // 設了 🌙 就同步舊 status(app 的 setCaseFields / 表單存檔也是這樣做),舊消費端才不脫節。
  const legacyStatusFor = (stage) => vocab().CASE_STAGES[stage].legacyStatus;
  function keepCategoryPair(fields, warnings) {
    if (fields.includes("categorySecondary") && !fields.includes("categoryPrimary")) {
      warnings.push("病例已有主類別,次類別不另補");
      return fields.filter((k) => k !== "categorySecondary");
    }
    return fields;
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
      const hasNote = !!it.note && typeof it.note === "object";
      const hasLabels = !!it.labels && typeof it.labels === "object" && !Array.isArray(it.labels);
      if (!hasNote && !hasLabels) throw new Error(`第 ${i + 1} 筆缺 note(或只補標註的 labels)`);
      if (hasNote && hasLabels) throw new Error(`第 ${i + 1} 筆同時有 note 與 labels —— 就診的標註請放在 newCase`);
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
      const row = { ref: it.ref, code, candidateCode: str(it.patientCode), visitDate: str(it.note && it.note.visitDate), status: "", include: false,
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
      // 只補標註:不加 SOAP,只填這位病人空著的標註欄位;已經有值的一律不動(不一樣就提醒)。
      if (!it.note) {
        if (!owned || !owned.length) { row.status = "code_not_found"; row.errors.push("只補標註只接既有病人 —— 系統裡找不到這個代號"); return row; }
        row.status = "labels";
        const L = it.labels;
        row.errors.push(...labelErrors(L, true));
        if (row.errors.length) return row;
        const target = owned.find((c) => c.id === ch.caseId) || defaultTargetCase(owned);
        row.targetCaseId = target.id;
        row.targetChoices = owned.map((c) => ({ id: c.id, title: str(c.caseTitle), status: str(c.status || "active"), visits: arr(c.soapNotes).length }));
        let fields = LABEL_KEYS.filter((k) => k !== "displayCode" && filled(L[k]) && !filled(target[k])
          && !(k === "birthYear" && filled(target.birthYearMonth)));
        fields = keepCategoryPair(fields, row.warnings);
        for (const k of LABEL_KEYS) {
          if (k !== "displayCode" && filled(L[k]) && filled(target[k]) && JSON.stringify(target[k]) !== JSON.stringify(k === "birthYear" ? Number(L[k]) : L[k])) {
            row.warnings.push(`${LABEL_NAMES[k]}已經有值,不覆蓋`);
          }
        }
        // 顯示代號是病人層級:這位病人每個病例都還沒有才補(補到他所有病例);已有不同的 → 不動、提醒。
        if (filled(L.displayCode)) {
          const want = normalizeDisplay(L.displayCode);
          const have = [...new Set(owned.map((c) => normalizeDisplay(c.displayCode)).filter(Boolean))];
          if (!have.length) {
            fields.unshift("displayCode");
            const others = [...(byDisplay.get(want) || [])].filter((p) => p !== ownerCode);
            if (others.length) row.warnings.push(`已經有別的病人的顯示代號是 ${want}(${others.join("、")})—— 顯示代號可以重複,確認不是同一人`);
          } else if (!have.includes(want)) row.warnings.push(`這位病人已經有顯示代號 ${have.join("、")},不改成 ${want}`);
        }
        row.fillFields = fields;
        row.fillEmpty = true;
        row.include = fields.length > 0 && (ch.include !== undefined ? !!ch.include : true);
        return row;
      }
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
        row.fillFields = keepCategoryPair(Object.keys(it.newCase || {}).filter((k) => k !== "id" && k !== "patientCode" && k !== "soapNotes" && k !== "safetyFlags"
          && filled(it.newCase[k]) && !filled(target[k])
          && !(k === "birthYear" && filled(target.birthYearMonth))), row.warnings);   // 已有出生年月就不另補出生年
        row.errors.push(...labelErrors(pickLabels(it.newCase), false));
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
      const newLabels = pickLabels(it.newCase);
      delete newLabels.displayCode;   // 新病人的顯示代號用她在預覽打的那個
      row.errors.push(...labelErrors(newLabels, false));
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
      if (r.status === "labels") {
        const L = it.labels;
        out = out.map((c) => {
          if (str(c.patientCode).trim() !== r.code) return c;
          const isTarget = c.id === r.targetCaseId;
          const next = Object.assign({}, c);
          let changed = false;
          for (const k of r.fillFields) {
            if (k === "displayCode") { if (!filled(c.displayCode)) { next.displayCode = normalizeDisplay(L.displayCode); changed = true; } continue; }
            if (!isTarget) continue;
            next[k] = k === "birthYear" ? Number(L[k]) : L[k];
            if (k === "treatmentStage") next.status = legacyStatusFor(L[k]);
            changed = true;
          }
          if (changed) next.updatedAt = now;
          return changed ? next : c;
        });
        continue;
      }
      const note = Object.assign({}, it.note, { id: noteIdFor(r.ref), createdAt: now, updatedAt: now });
      if (r.status === "append") {
        out = out.map((c) => {
          if (c.id !== r.targetCaseId) return c;
          const next = Object.assign({}, c, { soapNotes: [...arr(c.soapNotes), note], updatedAt: now });
          if (r.newFlags.length) next.safetyFlags = [...arr(c.safetyFlags), ...r.newFlags];
          if (r.fillEmpty) for (const k of r.fillFields) {
            next[k] = it.newCase[k];
            if (k === "treatmentStage") next.status = legacyStatusFor(it.newCase[k]);
          }
          return next;
        });
      } else if (r.status === "new_patient") {
        const nc = Object.assign({}, it.newCase, { id: caseIdFor(r.ref), patientCode: mintId(r.ref), displayCode: r.code, soapNotes: [note], createdAt: now, updatedAt: now });
        if (filled(nc.treatmentStage)) nc.status = legacyStatusFor(nc.treatmentStage);
        newCases.push(nc);
      }
    }
    return [...newCases, ...out];
  }

  const api = { SCHEMA, LABEL_KEYS, LABEL_NAMES, parseHandoff, planHandoff, applyHandoff, isDisplayCode, normalizeDisplay, noteIdFor, caseIdFor };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.AcuTingVisitHandoff = api;
})(typeof window !== "undefined" ? window : globalThis);
