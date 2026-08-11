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

  /* Codex 重審 gate#1:append-only 的結構化比對器 —— 單一來源,R8 CLI 與
   * app import merge guard 都用這個。舊版把 event id 串成字串再 startsWith,
   * 產生兩類 false negative:evt-1 → evt-10 被當前綴;同 id 原地改寫 payload
   * 也放行。這裡改成逐 index 結構相等:before 的每一筆事件,id 與 canonical
   * payload 都必須與 after 同位置完全一致,新事件只能接在尾端。直接比
   * canonical JSON 而不是 hash —— 等價且零碰撞。 */
  function canonicalEventPayload(ev) {
    const keys = ["eventType", "visitId", "doseText", "frequencyText", "status", "certainty", "timing", "effectiveApprox", "note", "createdAt"];
    return JSON.stringify(keys.map((k) => [k, String((ev && ev[k]) ?? "")]));
  }

  function exposureHistoryExtends(beforeRow, afterRow) {
    const b = beforeRow.events || [], a = afterRow.events || [];
    if (a.length < b.length) return { ok: false, reason: `history truncated (${b.length} → ${a.length} events)` };
    for (let i = 0; i < b.length; i++) {
      if (String(b[i].id || "") !== String(a[i].id || "")) {
        return { ok: false, reason: `event #${i} id changed ("${b[i].id}" → "${a[i].id}")` };
      }
      if (canonicalEventPayload(b[i]) !== canonicalEventPayload(a[i])) {
        return { ok: false, reason: `event #${i} ("${b[i].id}") payload rewritten in place` };
      }
    }
    return { ok: true };
  }

  /* Clinical 契約不變量(Codex audit §2/§4)——單一來源:
   * scripts/validate-clinical-invariants.js(CI)與 app.js 的 import 前驗證
   * 都呼叫這裡,規則只寫一份。回傳 {failures:[], warnings:[]}。 */
  function checkClinicalInvariants(cases) {
    const failures = [], warnings = [];
    for (const c of cases || []) {
      const label = c.id || "(no id)";
      for (const note of c.soapNotes || []) {
        const sel = note.tcmPatternSelections || [];
        const ids = new Set();
        let primaries = 0;
        for (const e of sel) {
          if (ids.has(e.patternId)) failures.push(`${label}/${note.id}: duplicate patternId ${e.patternId} (R3)`);
          ids.add(e.patternId);
          if (e.isPrimary) primaries++;
          const role = String(e.role || "");
          if (role === "primary" && !e.isPrimary) failures.push(`${label}/${note.id}/${e.patternId}: role=primary but isPrimary=false (R1)`);
          if (role !== "primary" && role !== "" && e.isPrimary) failures.push(`${label}/${note.id}/${e.patternId}: role=${role} but isPrimary=true (R2)`);
          if (role === "") warnings.push(`${label}/${note.id}/${e.patternId}: legacy empty role (R4)`);
        }
        if (primaries > 1) failures.push(`${label}/${note.id}: ${primaries} primary patterns in one visit (R3)`);
        for (const f of note.lifestyleFactors || []) {
          const fid = String(f.factorId || "");
          if (fid && !fid.startsWith("life.")) failures.push(`${label}/${note.id}: lifestyle factorId "${fid}" outside life.* (R7)`);
        }
      }
      for (const [kind, allowed, rows] of [["agent", AGENT_EVENT_TYPES, c.agentExposures || []], ["environmental", ENV_EVENT_TYPES, c.environmentalExposures || []]]) {
        for (const row of rows) {
          const evs = row.events || [];
          if (evs.length && evs[0].eventType !== "started" && evs[0].eventType !== "initial_recorded") {
            failures.push(`${label}/${kind}/${row.id || row.agentId || row.exposureId}: first event "${evs[0].eventType}" not started|initial_recorded (R5)`);
          }
          for (const ev of evs) {
            if (!allowed.has(ev.eventType)) failures.push(`${label}/${kind}: eventType "${ev.eventType}" not in ${kind} whitelist (R6)`);
          }
        }
      }
    }
    return { failures, warnings };
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

  /* ---- C2b P3:shadow writer(Codex P3 規格,docs/AI_REVIEW_FEEDBACK.md)----
   * 鐵律:
   *   1. v1 key 永不寫。這個區塊唯一可寫的 keys = STAGING_KEY 與 POINTER_KEY
   *      (白名單,rollback 也只准刪這兩個)。
   *   2. executeMigration 冪等:staging 已存在且 source_sha256+migration_version
   *      相同 → 回報 creates/updates/deletes = 0/0/0,不動任何東西。
   *   3. pointer 只在 verifyStaging 全綠後才准切;任何錯誤/中斷都不會留下
   *      指向半成品的 pointer(先寫 staging、驗證、最後一步才寫 pointer)。
   *   4. case 物件從 raw 原樣攜帶(絕不 normalize —— HIGH#6),只additive加
   *      patientId FK。
   * hasher 由呼叫端注入(node: crypto;browser: subtle wrapper)—— store 本體
   * 保持零依賴。 */
  const STAGING_KEY = "acuting-clinical-v2-staging";
  const POINTER_KEY = "acuting-clinical-active";

  function executeMigration(rawText, plan, { sha256 }) {
    const actualHash = sha256(rawText);
    if (actualHash !== plan.source_sha256) {
      throw new Error(`executeMigration: raw hash ${actualHash.slice(0, 12)}… does not match plan.source_sha256 — refusing`);
    }
    const existing = backend === localStorageBackend ? global.localStorage.getItem(STAGING_KEY) : null;
    const existingStaging = existing ? JSON.parse(existing) : (backend.readKey ? JSON.parse(backend.readKey(STAGING_KEY) || "null") : null);
    if (existingStaging && existingStaging.journal &&
        existingStaging.journal.source_sha256 === plan.source_sha256 &&
        existingStaging.journal.migration_version === plan.migration_version) {
      return { creates: 0, updates: 0, deletes: 0, idempotent_noop: true };
    }
    const rawCases = JSON.parse(rawText);
    const pidByCase = new Map(plan.caseAssignments.map((a) => [a.caseId, a.patientId]));
    const staging = {
      schema_version: 2,
      journal: {
        migration_version: plan.migration_version,
        source_sha256: plan.source_sha256,
        source_bytes: plan.source_bytes,
        counts: plan.counts,
        adjudicationsApplied: plan.patients.flatMap((p) => (p.adjudicationsApplied || []).map((a) => ({ patientCode: p.patientCode, ...a })))
      },
      patients: plan.patients,
      // raw 原樣 + additive patientId(可為 null:blank-code case 誠實保留)。
      cases: rawCases.map((c) => ({ ...c, patientId: pidByCase.get(c.id) ?? null }))
    };
    writeKey(STAGING_KEY, JSON.stringify(staging));
    return { creates: staging.patients.length + staging.cases.length, updates: 0, deletes: 0, idempotent_noop: false };
  }

  function verifyStaging(rawText, { sha256 }) {
    const staging = JSON.parse(readKey(STAGING_KEY) || "null");
    const failures = [];
    if (!staging) return { ok: false, failures: ["staging absent"] };
    if (staging.journal.source_sha256 !== sha256(rawText)) failures.push("journal hash != raw hash");
    const rawCases = JSON.parse(rawText);
    if (staging.cases.length !== rawCases.length) failures.push(`case count ${staging.cases.length} != raw ${rawCases.length}`);
    const rawById = new Map(rawCases.map((c) => [c.id, c]));
    for (const c of staging.cases) {
      const orig = rawById.get(c.id);
      if (!orig) { failures.push(`staged case ${c.id} not in raw`); continue; }
      const { patientId, ...rest } = c;
      if (JSON.stringify(rest) !== JSON.stringify(orig)) failures.push(`case ${c.id} altered beyond patientId`);
      for (const field of ["agentExposures", "environmentalExposures"]) {
        (orig[field] || []).forEach((row, i) => {
          const stagedRow = (c[field] || [])[i];
          const check = stagedRow ? exposureHistoryExtends(row, stagedRow) : { ok: false, reason: "row missing" };
          if (!check.ok || (stagedRow.events || []).length !== (row.events || []).length) failures.push(`${c.id}/${field}[${i}]: events not exact`);
        });
      }
    }
    const nonBlank = new Set(rawCases.map((c) => String(c.patientCode || "").trim()).filter(Boolean));
    if (staging.patients.length !== nonBlank.size) failures.push(`patients ${staging.patients.length} != unique codes ${nonBlank.size}`);
    const orphanCases = staging.cases.filter((c) => String(c.patientCode || "").trim() && !staging.patients.some((p) => p.id === c.patientId)).length;
    if (orphanCases) failures.push(`${orphanCases} orphan case assignments`);
    return { ok: failures.length === 0, failures };
  }

  function switchPointer(rawText, hasher) {
    const v = verifyStaging(rawText, hasher);
    if (!v.ok) throw new Error("switchPointer refused — verifyStaging failures: " + v.failures.join("; "));
    writeKey(POINTER_KEY, "v2");
    return { switched: true };
  }

  function rollbackMigration() {
    // 白名單刪除:只碰本 migration 建立的兩個 keys,v1 與其他一切不動。
    removeKey(POINTER_KEY);
    removeKey(STAGING_KEY);
    return { removed: [POINTER_KEY, STAGING_KEY] };
  }

  // backend 介面擴充(P3 需要 per-key 讀寫;localStorage 版直接對應)。
  function readKey(k) { return backend.readKey ? backend.readKey(k) : global.localStorage.getItem(k); }
  function writeKey(k, v) { backend.writeKey ? backend.writeKey(k, v) : global.localStorage.setItem(k, v); }
  function removeKey(k) { backend.removeKey ? backend.removeKey(k) : global.localStorage.removeItem(k); }

  global.AcuTingClinicalStore = {
    STAGING_KEY,
    POINTER_KEY,
    executeMigration,
    verifyStaging,
    switchPointer,
    rollbackMigration,
    derivePatientsFromCases,
    STORAGE_KEY,
    load,
    save,
    setBackend(b) { backend = b; },       // SQLite/D1 adapter 的插入點
    checkClinicalInvariants,
    canonicalEventPayload,
    exposureHistoryExtends,
    createExposure,
    applyExposureChange,
    getCurrentExposures,
    getExposureTimeline,
    getOutcomeHistory,
    getLifestyleHistory
  };
})(typeof window !== "undefined" ? window : globalThis);
