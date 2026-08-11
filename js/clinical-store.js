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

  global.AcuTingClinicalStore = {
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
