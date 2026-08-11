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

  /* Pointer-aware runtime contract(2026-08-11,INDEPENDENT_AUDIT 修復;
   * 待 Codex R9 覆核)。切換前(pointer 缺席/v1):行為與從前逐位元相同。
   * 切換後(pointer === "v2"):
   *   - load() 讀 STAGING envelope 的 .cases;envelope 缺失/毀損 = THROW
   *     (fail-loud —— 靜默回 v1 會造成雙世界分叉,靜默回 [] 會讓下一次
   *     save 清空真資料;兩種靜默都比爆炸更危險)。
   *   - save() 更新 envelope.cases、同步既有 Patient 的 caseIds、把「沒有
   *     Patient 的新 patientCode」記進 envelope.pending_patient_codes ——
   *     不在同步路徑鑄造 patient id(sha256 是 async;臨床存檔不等雜湊)。
   *     UI 存檔後呼叫 syncPendingPatients() 補建。
   *   - v1 key 在 v2 模式下永不再寫 —— 它從切換那一刻起是凍結的回滾備份。 */
  /* R9 gate A:pointer 讀取是明確三態,絕不吞例外。只有「可靠讀到 absent/
   * v1」才走 v1;讀取例外或非法值一律 throw —— 猜錯世界比爆炸更危險。 */
  function readPointerState() {
    let v;
    try { v = readKey(POINTER_KEY); }
    catch (e) { throw new Error("clinical-store: POINTER read failed (" + e.message + ") — refusing to guess the active world; no v1/staging write will occur."); }
    if (v === null || v === undefined || v === "" || v === "v1") return "v1";
    if (v === "v2") return "v2";
    throw new Error(`clinical-store: POINTER holds invalid value "${v}" — refusing to guess the active world.`);
  }
  function activeIsV2() { return readPointerState() === "v2"; }

  /* R9 gate C:runtime 與 migration 共用唯一 id 推導(同鹽同前綴)。 */
  async function canonicalPatientIdOf(code, sha256hex) {
    return "patient." + (await sha256hex("acuting-patient:" + code)).slice(0, 12);
  }

  function readStagingEnvelopeOrThrow(context) {
    const raw = readKey(STAGING_KEY);
    if (!raw) throw new Error(`clinical-store: pointer=v2 but staging envelope is MISSING (${context}) — refusing v1 fallback to prevent silent fork. Run rollback or restore.`);
    let env;
    try { env = JSON.parse(raw); } catch (e) { throw new Error(`clinical-store: pointer=v2 but staging envelope is CORRUPT (${context}): ${e.message}`); }
    if (!env || !Array.isArray(env.cases) || !Array.isArray(env.patients)) {
      throw new Error(`clinical-store: pointer=v2 but staging envelope shape is invalid (${context})`);
    }
    return env;
  }

  function load() {
    if (activeIsV2()) {
      return readStagingEnvelopeOrThrow("load").cases;
    }
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
    if (activeIsV2()) {
      const env = readStagingEnvelopeOrThrow("save");
      env.cases = cases;
      // Patient↔Case 同步:既有 patient 的 caseIds 重算(patientCode 隸屬);
      // case.patientId 對得上的維持;沒有 patient 的 code 進 pending 清單。
      const byCode = new Map(env.patients.map((p) => [p.patientCode, p]));
      for (const p of env.patients) p.caseIds = [];
      const pending = new Set();
      for (const c of cases) {
        const code = String(c.patientCode || "").trim();
        // R9 gate C:blank code 強制 patientId=null(stale FK 違反
        // verifyStagingObject 的 blank→null invariant,不得保留)。
        if (!code) { c.patientId = null; continue; }
        const p = byCode.get(code);
        if (p) { p.caseIds.push(c.id); c.patientId = p.id; }
        else pending.add(code);
      }
      env.pending_patient_codes = [...pending].sort();
      // R9 gate C:runtime revision — 每次寫入遞增;syncPendingPatients 以
      // 「await 全部完成後重讀+同步套用」消除 lost-update,revision 供偵測。
      env.runtime_revision = (env.runtime_revision || 0) + 1;
      env.last_runtime_save_at = new Date().toISOString();
      writeKey(STAGING_KEY, JSON.stringify(env));   // 單一 setItem = 原子替換
      return;
    }
    backend.write(JSON.stringify(cases, null, 2));
  }

  /* 存檔後補建 pending 病人(async — sha256 與遷移同款 deterministic id)。
   * 冪等:pending 清空即 no-op。UI fire-and-forget 呼叫,失敗不影響已存病歷
   * (cases 已落盤;病人補建下次再試)。 */
  async function syncPendingPatients(sha256hex) {
    if (!activeIsV2()) return { ok: true, created: 0 };
    // R9 gate C(lost-update 消除):所有 await(雜湊)先完成,之後才重讀
    // 最新 envelope 並「同步、不間斷」地套用+寫回 —— JS 單執行緒下,同步
    // 區段內不可能插入其他 save,stale-envelope 覆寫在結構上不可能發生。
    // 雜湊以 code 為輸入、deterministic,先算後用不影響正確性。
    const first = readStagingEnvelopeOrThrow("syncPendingPatients:prefetch");
    const prefetchCodes = first.pending_patient_codes || [];
    if (!prefetchCodes.length) return { ok: true, created: 0 };
    const idByCode = new Map();
    for (const code of prefetchCodes) idByCode.set(code, await canonicalPatientIdOf(code, sha256hex));
    // ---- 從這裡到 writeKey 全同步,絕無 await ----
    const env = readStagingEnvelopeOrThrow("syncPendingPatients:apply");
    const codes = (env.pending_patient_codes || []).filter((c) => idByCode.has(c));
    const leftover = (env.pending_patient_codes || []).filter((c) => !idByCode.has(c));  // await 期間新出現的 code 留給下一輪
    if (!codes.length) return { ok: true, created: 0, deferred: leftover.length };
    const derived = derivePatientsFromCases(env.cases);
    const existingIds = new Set(env.patients.map((p) => p.id));
    let created = 0;
    for (const code of codes) {
      const d = derived.find((p) => p.patientCode === code);
      if (!d) continue;
      const id = idByCode.get(code);
      // R9 gate C:collision fail-closed —— 同 id 已存在但 code 不同 = 截斷
      // 雜湊撞車,拒絕鑄造(code 留在 pending,人工處理),絕不寫入重複 id。
      const clash = env.patients.find((p) => p.id === id);
      if (clash && clash.patientCode !== code) {
        leftover.push(code);
        console.error(`syncPendingPatients: patient id collision for code "${code}" vs existing "${clash.patientCode}" — minting refused, code left pending`);
        continue;
      }
      if (existingIds.has(id)) continue;   // 已存在同 code 同 id:冪等
      d.id = id;
      env.patients.push(d);
      existingIds.add(id);
      for (const c of env.cases) if (String(c.patientCode || "").trim() === code) c.patientId = id;
      created++;
    }
    env.pending_patient_codes = leftover.sort();
    env.runtime_revision = (env.runtime_revision || 0) + 1;
    writeKey(STAGING_KEY, JSON.stringify(env));
    return { ok: true, created, deferred: leftover.length };
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
  const CANDIDATE_KEY = "acuting-clinical-v2-staging-candidate";

  /* Codex C2B-R5 P3.3 修正:plan 生成搬進 store(單一來源)。
   * migrate-c2b.js 的 CLI 委派這裡;app 的 v2 匯入驗證也用這裡 —— 同一個
   * deterministic plan,兩個消費者,不可能漂移。sha256 以 async 函式注入
   * (node 包同步 crypto;browser 用 crypto.subtle)。純函數:無 Date.now、
   * 無 Math.random,同 source 必得同 plan。 */
  async function buildMigrationPlan(rawText, adjudications, sha256) {
    const patientIdOf = async (code) => "patient." + (await sha256("acuting-patient:" + code)).slice(0, 12);
    const cases = JSON.parse(rawText);
    if (!Array.isArray(cases)) throw new Error("raw snapshot must be a JSON array of cases");
    const caseIds = new Set();
    for (const c of cases) {
      if (caseIds.has(c.id)) throw new Error(`duplicate case id in source: ${c.id} — migration cannot proceed`);
      caseIds.add(c.id);
    }
    const codeByPid = new Map();
    for (const c of cases) {
      const code = String(c.patientCode || "").trim();
      if (!code) continue;
      const pid = await patientIdOf(code);
      if (codeByPid.has(pid) && codeByPid.get(pid) !== code) throw new Error(`patient id collision: "${codeByPid.get(pid)}" and "${code}" both map to ${pid}`);
      codeByPid.set(pid, code);
    }
    const derived = derivePatientsFromCases(cases);
    const patients = [];
    for (const p of derived) {
      const fields = Object.fromEntries(["birthYearMonth", "birthYear", "sex", "genderIdentity", "raceEthnicity", "raceEthnicityDetail", "occupation", "allergyStatus", "allergies"].map((f) => p.needsReview.includes(f) ? [f, null] : [f, p[f]]));
      const applied = [];
      for (const adj of adjudications || []) {
        if (adj.patientCode === p.patientCode && p.needsReview.includes(adj.field)) {
          fields[adj.field] = adj.value;
          applied.push({ field: adj.field, value: adj.value, reason: String(adj.reason || "") });
        }
      }
      patients.push({
        id: await patientIdOf(p.patientCode),
        patientCode: p.patientCode, caseIds: p.caseIds, caseCount: p.caseCount,
        fields, conflicts: p.conflicts,
        needsReview: p.needsReview.filter((f) => !applied.some((a) => a.field === f)),
        adjudicationsApplied: applied
      });
    }
    const caseAssignments = [];
    for (const c of cases) {
      const code = String(c.patientCode || "").trim();
      caseAssignments.push({ caseId: c.id, patientCode: code, patientId: code ? await patientIdOf(code) : null });
    }
    const blankCodeCases = caseAssignments.filter((a) => !a.patientId).map((a) => a.caseId);
    const reviewQueue = patients.filter((p) => p.needsReview.length || Object.keys(p.conflicts).length);
    const enc = typeof TextEncoder !== "undefined" ? new TextEncoder().encode(rawText).length : rawText.length;
    return {
      migration_version: "c2b-1",
      source_sha256: await sha256(rawText),
      source_bytes: enc,
      counts: { cases: cases.length, soapNotes: cases.reduce((s, c) => s + (Array.isArray(c.soapNotes) ? c.soapNotes.length : 0), 0), patients: patients.length, blankCodeCases: blankCodeCases.length, conflictPatients: reviewQueue.length },
      patients, caseAssignments, blankCodeCases,
      manualReviewQueue: reviewQueue.map((p) => ({ patientId: p.id, patientCode: p.patientCode, needsReview: p.needsReview, conflicts: p.conflicts }))
    };
  }

  /* Codex R5 修正 gate:v2 匯入唯一認可路徑 —— 非 active candidate → 以
   * 「當下 v1 raw + 重建的 deterministic plan」做完整 verifyStaging → 全綠才
   * 原子替換 active staging。任何失敗:active staging/pointer 原封不動。 */
  async function restoreV2Envelope(envelopeText, sha256) {
    // Codex R6 修正 gate:本函式的失敗契約是「絕不讓例外外洩」——任何
    // rejection/exception(含 candidate write、plan/hash、active 替換、
    // cleanup 自身)都收斂成 {ok:false, failures},candidate 一律 best-effort
    // 清除,active staging/pointer 保持原值。呼叫端永遠拿到可顯示的結果。
    // Codex R7 修正 gate:cleanup 不是 best-effort 裝飾 —— 它有明示的
    // success/error 回傳,且在成功路徑上「先清 candidate 並確認成功,才做
    // active 替換」。允許一次 retry;清不掉就 {ok:false},絕不吞錯回 ok:true。
    const cleanupCandidate = () => {
      try { removeKey(CANDIDATE_KEY); return { ok: true }; }
      catch (e1) {
        try { removeKey(CANDIDATE_KEY); return { ok: true, retried: true }; }
        catch (e2) { return { ok: false, error: (e2 && e2.message) || String(e2) }; }
      }
    };
    const fail = (failures) => {
      const c = cleanupCandidate();
      if (!c.ok) failures = [...failures, "additionally, candidate cleanup failed: " + c.error];
      return { ok: false, failures };
    };
    try {
      let env;
      try { env = JSON.parse(envelopeText); } catch { return fail(["envelope is not valid JSON"]); }
      if (!(env && env.schema_version === 2 && env.journal && Array.isArray(env.patients) && Array.isArray(env.cases))) {
        return fail(["envelope missing schema_version/journal/patients/cases"]);
      }
      const rawText = backend.read();
      if (rawText === null) return fail(["v1 raw store absent — cannot anchor verification"]);
      try { writeKey(CANDIDATE_KEY, JSON.stringify(env)); }
      catch (e) { return fail(["candidate write failed: " + e.message]); }
      let plan;
      try { plan = await buildMigrationPlan(rawText, env.journal.adjudicationsApplied || [], sha256); }
      catch (e) { return fail(["plan rebuild failed: " + e.message]); }
      let rawHash;
      try { rawHash = await sha256(rawText); }
      catch (e) { return fail(["hashing failed: " + e.message]); }
      const v = verifyStagingObject(env, rawText, rawHash, plan);
      if (!v.ok) return fail(v.failures);
      // 順序是 gate 本體:cleanup 先行且必須確認成功,active 替換才准發生
      // (Codex R7)。cleanup 失敗 → active 原封不動地 fail closed。
      const c = cleanupCandidate();
      if (!c.ok) return { ok: false, failures: ["candidate cleanup failed before active swap — active staging/pointer untouched: " + c.error] };
      try { writeKey(STAGING_KEY, JSON.stringify(env)); }   // 單一 setItem = 原子替換
      catch (e) { return { ok: false, failures: ["active staging replacement failed — original staging/pointer untouched: " + e.message] }; }
      return { ok: true, patients: env.patients.length, cases: env.cases.length };
    } catch (e) {
      return fail(["unexpected restore failure: " + (e && e.message || String(e))]);
    }
  }

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
      // Codex P3.2 FAIL 修正:noop 綠燈必須以「現有 staging 通過完整 verify」
      // 為前提 —— 壞 staging 靜默回 0/0/0 就是把竄改洗白。fail closed。
      const v = verifyStaging(rawText, { sha256 }, plan);
      if (!v.ok) {
        throw new Error("executeMigration: staging exists for this source but FAILS verification — refusing idempotent noop (fail closed): " + v.failures.join("; "));
      }
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

  /* 同步核心:對「記憶體中的 staging 物件」做 plan 錨定全驗證。key 版
   * verifyStaging 與 async 匯入路徑 restoreV2Envelope 都委派到這裡 ——
   * 驗證邏輯永遠只有一份(Codex R5:rehearsal 綠燈必須與 UI 行為等價)。 */
  function verifyStagingObject(staging, rawText, rawHash, plan) {
    const failures = [];
    if (!staging) return { ok: false, failures: ["staging absent"] };
    if (!staging.journal) return { ok: false, failures: ["staging.journal absent"] };
    if (staging.journal.source_sha256 !== rawHash) failures.push("journal hash != raw hash");
    // Codex C2B-R4 P3.1/P3.2 修正:verify 必須以 deterministic plan 為錨。
    if (!plan) return { ok: false, failures: ["verifyStaging requires the deterministic plan as anchor — refusing anchorless verification"] };
    if (plan.source_sha256 !== rawHash) failures.push("plan hash != raw hash");
    if (staging.journal.migration_version !== plan.migration_version) failures.push("journal.migration_version != plan");
    if (staging.journal.source_bytes !== plan.source_bytes) failures.push("journal.source_bytes != plan");
    if (JSON.stringify(staging.journal.counts) !== JSON.stringify(plan.counts)) failures.push("journal.counts != plan.counts");
    const planAdj = plan.patients.flatMap((p) => (p.adjudicationsApplied || []).map((a) => ({ patientCode: p.patientCode, ...a })));
    if (JSON.stringify(staging.journal.adjudicationsApplied) !== JSON.stringify(planAdj)) failures.push("journal.adjudicationsApplied != plan");
    // patients:九欄+conflicts+needsReview+caseIds 逐筆深度相等(順序即 plan 順序)。
    if (JSON.stringify(staging.patients) !== JSON.stringify(plan.patients)) failures.push("staged patients differ from plan (deep parity)");
    // assignments:每個 staged case 的 patientId 必須等於 plan.caseAssignments。
    const planPid = new Map(plan.caseAssignments.map((a) => [a.caseId, a.patientId]));
    for (const c of staging.cases || []) {
      if ((planPid.get(c.id) ?? null) !== (c.patientId ?? null)) failures.push(`${c.id}: patientId differs from plan assignment`);
    }
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
    // SOL 審查 BLOCKER(2026-08-11):「patientId 存在」不等於「patientId 正確」
    // —— 兩個 case 的 patientId 互換仍全員存在、無 orphan,舊檢查會放行。
    // 修正 = 三條 referential assertions + Patient→Case 反向集合相等,
    // Case↔Patient 兩個方向互相鎖死,交換/錯接/漏接都會被抓。
    const patientById = new Map(staging.patients.map((p) => [p.id, p]));
    for (const c of staging.cases) {
      const code = String(c.patientCode || "").trim();
      if (code) {
        if (!c.patientId) { failures.push(`${c.id}: nonblank patientCode but patientId null`); continue; }
        const p = patientById.get(c.patientId);
        if (!p) failures.push(`${c.id}: patientId ${c.patientId} not among staged patients`);
        else if (p.patientCode !== code) failures.push(`${c.id}: cross-wired — patientId belongs to "${p.patientCode}", case says "${code}"`);
      } else if (c.patientId !== null) {
        failures.push(`${c.id}: blank patientCode must carry patientId null`);
      }
    }
    for (const p of staging.patients) {
      const pointing = staging.cases.filter((c) => c.patientId === p.id).map((c) => c.id).sort();
      const declared = [...(p.caseIds || [])].sort();
      if (JSON.stringify(pointing) !== JSON.stringify(declared)) {
        failures.push(`${p.id}: caseIds set mismatch — declared [${declared}] vs actually-pointing [${pointing}]`);
      }
    }
    return { ok: failures.length === 0, failures };
  }

  // key 版包裝(rehearse/switch 用,同步 hasher)。
  function verifyStaging(rawText, { sha256 }, plan) {
    const staging = JSON.parse(readKey(STAGING_KEY) || "null");
    return verifyStagingObject(staging, rawText, sha256(rawText), plan);
  }

  function switchPointer(rawText, hasher, plan) {
    const v = verifyStaging(rawText, hasher, plan);
    if (!v.ok) throw new Error("switchPointer refused — verifyStaging failures: " + v.failures.join("; "));
    writeKey(POINTER_KEY, "v2");
    return { switched: true };
  }

  function rollbackMigration() {
    // 白名單刪除:只碰本 migration 建立的兩個 keys,v1 與其他一切不動。
    removeKey(POINTER_KEY);
    removeKey(STAGING_KEY);
    removeKey(CANDIDATE_KEY);
    return { removed: [POINTER_KEY, STAGING_KEY, CANDIDATE_KEY] };
  }

  // backend 介面擴充(P3 需要 per-key 讀寫;localStorage 版直接對應)。
  function readKey(k) { return backend.readKey ? backend.readKey(k) : global.localStorage.getItem(k); }
  function writeKey(k, v) { backend.writeKey ? backend.writeKey(k, v) : global.localStorage.setItem(k, v); }
  function removeKey(k) { backend.removeKey ? backend.removeKey(k) : global.localStorage.removeItem(k); }

  global.AcuTingClinicalStore = {
    STAGING_KEY,
    POINTER_KEY,
    CANDIDATE_KEY,
    executeMigration,
    verifyStaging,
    verifyStagingObject,
    buildMigrationPlan,
    restoreV2Envelope,
    switchPointer,
    rollbackMigration,
    derivePatientsFromCases,
    STORAGE_KEY,
    load,
    save,
    syncPendingPatients,
    activeIsV2,
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
