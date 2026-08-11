/* AcuTing OS — Clinical Store(Phase C 薄 repository 層,2026-08-12)
 *
 * 這一層存在的唯一理由:讓 Clinical UI 不再直接摸 localStorage,之後換
 * SQLite / D1 / 任何後端時只換 backend,不重寫 UI(SPRINT brief Phase C;
 * SQLite 實裝明確不在 9/5 範圍 —— 見 docs/MIGRATION_LOCALSTORAGE_TO_SQLITE.md)。
 *
 * 邊界(跟 app.js 的分工,故意的):
 *   - 這裡只管「原始 JSON 進出後端」+ 純函式查詢/變更助手。
 *   - normalize(normalizeClinicalCase/normalizeSoapNote)留在 app.js —— 那是
 *     資料契約層,不是儲存層;store 不重複它,也絕不半套地另寫一份。
 *   - 這檔案沒有任何 DOM 依賴,可以被 node 直接 require 做測試。
 *
 * Append-only 不變量(AUDIT_PHASE_B_2026-08-12 B-1 的機器強制面):
 *   applyExposureChange() 是「改 ledger 現況」唯一被認可的路徑 —— 它同時
 *   append 事件與更新快照,回傳新物件,從不就地改動,也沒有任何刪改事件的
 *   API。UI 程式碼一律經過它;直接改 row 欄位 = 違規,validator/audit 抓。
 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "acuting-clinical-cases-v1";

  /* 後端介面:{ read(): string|null, write(serialized: string): void }。
   * 未來的 SQLite/D1 adapter 實作同介面(或直接改成 async 版本時,load/save
   * 的呼叫點只有 app.js 兩處 seam,遷移面已經縮到最小)。 */
  const localStorageBackend = {
    read() { return global.localStorage.getItem(STORAGE_KEY); },
    write(serialized) { global.localStorage.setItem(STORAGE_KEY, serialized); }
  };

  let backend = localStorageBackend;

  function load() {
    const saved = backend.read();
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function save(cases) {
    backend.write(JSON.stringify(cases, null, 2));
  }

  function makeId(prefix) {
    return `${prefix}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 8)}`;
  }

  /* initial_recorded(SOL Phase C review item 2):intake 當下病人「已經在用」
   * 的藥/暴露,第一筆事件不是 started(那會謊報開始時間)而是 initial_recorded
   * ——「我們從這一刻開始知道」。規則:post-D17 新建的 snapshot 必須帶一筆
   * started 或 initial_recorded 初始事件(createExposure 強制);legacy 資料的
   * events=[] 保持原樣 —— 那是「完整歷史未被記錄」的誠實標記,絕不回填假事件。 */
  const AGENT_EVENT_TYPES = new Set(["started", "initial_recorded", "stopped", "dose_changed", "frequency_changed", "status_changed", "confirmed_unchanged"]);
  const ENV_EVENT_TYPES = new Set(["started", "initial_recorded", "stopped", "certainty_changed", "timing_changed", "confirmed_unchanged"]);

  /* 唯一認可的 ledger 變更路徑。
   * exposure:現有 ledger row(agentExposures[] 或 environmentalExposures[] 的
   * 一筆);event:{eventType, visitId?, doseText?, frequencyText?, status?,
   * certainty?, timing?, effectiveApprox?, note?}。
   * 回傳【新物件】:events 多一筆(append,絕不動舊事件),快照欄位只被
   * event 帶了值的欄位更新(空字串=「這個事件沒改它」,不覆寫)。 */
  function applyExposureChange(exposure, event, kind) {
    const isEnv = kind === "environmental";
    const allowed = isEnv ? ENV_EVENT_TYPES : AGENT_EVENT_TYPES;
    if (!event || !allowed.has(event.eventType)) {
      throw new Error(`applyExposureChange: invalid eventType "${event && event.eventType}" for ${isEnv ? "environmental" : "agent"} exposure`);
    }
    const stamped = {
      id: makeId("expevt"),
      visitId: String(event.visitId || ""),
      eventType: event.eventType,
      effectiveApprox: String(event.effectiveApprox || ""),
      note: String(event.note || ""),
      createdAt: new Date().toISOString(),
      ...(isEnv
        ? { certainty: String(event.certainty || ""), timing: String(event.timing || "") }
        : { doseText: String(event.doseText || ""), frequencyText: String(event.frequencyText || ""), status: String(event.status || "") })
    };
    const next = { ...exposure, events: [...(exposure.events || []), stamped] };
    // 快照更新:只有事件帶值的欄位;changeSinceLast 永遠反映最後一次事件。
    if (!isEnv) {
      if (stamped.doseText) next.doseText = stamped.doseText;
      if (stamped.frequencyText) next.frequencyText = stamped.frequencyText;
      if (stamped.status) next.status = stamped.status;
      if (stamped.eventType === "started" && !next.startApprox) next.startApprox = stamped.effectiveApprox;
      if (stamped.eventType === "stopped" && !next.stopApprox) next.stopApprox = stamped.effectiveApprox;
    } else {
      if (stamped.certainty) next.certainty = stamped.certainty;
      if (stamped.timing) next.timing = stamped.timing;
    }
    next.changeSinceLast = stamped.eventType === "confirmed_unchanged" ? "unchanged" : stamped.eventType;
    if (stamped.visitId) next.lastConfirmedVisitId = stamped.visitId;
    return next;
  }

  /* 新 ledger row 的唯一認可建立路徑:強制第一筆事件(started 或
   * initial_recorded),讓「post-D17 新資料必有事件史」成為 API 保證而不是
   * UI 紀律。fields 不可帶 events —— 事件只能從 initialEvent 進。 */
  function createExposure(fields, initialEvent, kind) {
    if (!initialEvent || (initialEvent.eventType !== "started" && initialEvent.eventType !== "initial_recorded")) {
      throw new Error('createExposure: initialEvent must be "started" or "initial_recorded"');
    }
    const { events, ...rest } = fields || {};
    return applyExposureChange({ ...rest, events: [] }, initialEvent, kind);
  }

  /* ---- 純查詢助手(Patient Now / Over Time 與 Phase E 走查都吃這些) ---- */

  function getCurrentExposures(caseObj) {
    return (caseObj.agentExposures || []).filter((e) => e.status === "current" || e.status === "prn");
  }

  function getExposureTimeline(exposure) {
    return [...(exposure.events || [])].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  }

  /* metric 軌跡:跨 visits 取同一 metricId 的數值,依 visitDate(缺則
   * visitNumber)排序 —— 「pain 8→7→5→4」的資料來源。 */
  function getOutcomeHistory(caseObj, metricId) {
    return (caseObj.soapNotes || [])
      .map((note) => {
        const hit = (note.outcomeMetrics || []).find((m) => m.metricId === metricId);
        return hit ? { visitId: note.id, visitDate: note.visitDate || "", visitNumber: note.visitNumber || "", valueNumber: hit.valueNumber, relatedSymId: hit.relatedSymId || "" } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (a.visitDate && b.visitDate) ? a.visitDate.localeCompare(b.visitDate) : Number(a.visitNumber || 0) - Number(b.visitNumber || 0));
  }

  /* 生活型態軌跡:同 factorId 跨 visits 的行(sleep 5h→6h→7h)。 */
  function getLifestyleHistory(caseObj, factorId) {
    return (caseObj.soapNotes || [])
      .map((note) => {
        const hit = (note.lifestyleFactors || []).find((f) => f.factorId === factorId);
        return hit ? { visitId: note.id, visitDate: note.visitDate || "", valueNumber: hit.valueNumber, unit: hit.unit, valueText: hit.valueText } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.visitDate.localeCompare(b.visitDate));
  }

  /* ---- Phase C2a:Patient 衍生層(read-only,不落盤) --------------------
   * 現況:patientCode 在 app 裡有唯一性 guard(一 code 一 case),所以它事實上
   * 已經是 patient 身分鍵,且每個 case 都帶著它 —— FK 早就存在,只是沒有實體。
   * C2a 只做「從 cases 衍生 Patient 視圖」的純函式:零持久化、零遷移、零
   * 真實資料風險。C2b(Codex audit 之後)才做:patients 落盤、多 case 共用
   * patientCode 的 guard 語意調整、case 建立時的 patient picker。
   * 衝突原則(D4):同 code 多 case 欄位不一致時,取 updatedAt 最新的非空值,
   * 但把全部相異值記進 conflicts —— 衍生層記錄分歧,不消滅分歧。 */
  /* Codex 審計 HIGH#8 修正(docs/AI_REVIEW_FEEDBACK.md §8):
   * 1) 補 birthYear —— legacy case 只有 birthYear 沒有 birthYearMonth,漏了它
   *    抬升時這個值就永久丟失。
   * 2) set-like 欄位(raceEthnicity)canonicalize 後再比 —— [a,b] 與 [b,a]
   *    是同一事實,不是 conflict;但 winner 保留原順序,不重排使用者輸入。
   * 3) conflict entry 帶 {value, caseId, updatedAt} 來源 —— 沒有出處的
   *    conflict 清單無法人工裁決。
   * 4) 缺 timestamp 或同 timestamp 時不自動選 winner —— latest-wins 需要
   *    「latest」真實存在;比不出先後就把欄位留空 + needsReview,輸出人工
   *    裁決清單,絕不假裝知道答案(D4)。 */
  const PATIENT_FIELDS = ["birthYearMonth", "birthYear", "sex", "genderIdentity", "raceEthnicity", "raceEthnicityDetail", "occupation", "allergyStatus", "allergies"];
  const SET_LIKE_FIELDS = new Set(["raceEthnicity"]);

  function canonicalValue(field, raw) {
    const v = raw ?? "";
    if (SET_LIKE_FIELDS.has(field) && Array.isArray(v)) return JSON.stringify([...v].map(String).sort());
    return JSON.stringify(v);
  }
  function isEmptyCanonical(cv) { return cv === '""' || cv === "[]" || cv === "0" || cv === "null"; }

  function derivePatientsFromCases(cases) {
    const byCode = new Map();
    for (const c of cases || []) {
      const code = String(c.patientCode || "").trim();
      if (!code) continue;                      // 無 code 的 case 不屬於任何 patient,誠實跳過
      if (!byCode.has(code)) byCode.set(code, []);
      byCode.get(code).push(c);
    }
    return [...byCode.entries()].map(([code, group]) => {
      const sorted = [...group].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
      const patient = { patientCode: code, caseIds: sorted.map((c) => c.id), caseCount: sorted.length, conflicts: {}, needsReview: [] };
      for (const f of PATIENT_FIELDS) {
        const nonEmpty = sorted
          .map((c) => ({ caseId: c.id, updatedAt: String(c.updatedAt || ""), value: c[f] ?? "", canonical: canonicalValue(f, c[f]) }))
          .filter((e) => !isEmptyCanonical(e.canonical));
        const distinct = [...new Set(nonEmpty.map((e) => e.canonical))];
        if (distinct.length === 0) { patient[f] = ""; continue; }
        if (distinct.length === 1) { patient[f] = nonEmpty[0].value; continue; }
        // 真 conflict:記錄全部來源。
        patient.conflicts[f] = nonEmpty.map((e) => ({ value: e.value, caseId: e.caseId, updatedAt: e.updatedAt }));
        const candidates = nonEmpty.filter((e) => e.canonical !== nonEmpty[0].canonical);
        const top = nonEmpty[0];
        const rival = candidates[0];
        // winner 只在「最新那筆有真實 timestamp 且嚴格晚於對手」時成立。
        if (top.updatedAt && rival && rival.updatedAt && top.updatedAt > rival.updatedAt) {
          patient[f] = top.value;
        } else {
          patient[f] = "";
          patient.needsReview.push(f);
        }
      }
      return patient;
    });
  }

  global.AcuTingClinicalStore = {
    derivePatientsFromCases,
    STORAGE_KEY,
    load,
    save,
    setBackend(b) { backend = b; },       // SQLite/D1 adapter 的插入點
    createExposure,
    applyExposureChange,
    getCurrentExposures,
    getExposureTimeline,
    getOutcomeHistory,
    getLifestyleHistory
  };
})(typeof window !== "undefined" ? window : globalThis);
