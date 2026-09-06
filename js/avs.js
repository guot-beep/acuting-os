/* AcuTing OS — AVS v3 引擎(Visit Checkout Integration,2026-08-11 設計文件)
 *
 * 定位:診後摘要(AVS)是「病人照護指示單」,不是 SOAP 摘要、不是診斷證明、
 * 不是申報文件。內部診斷資料(pattern./cond./tdis./safety.)只用於「挑選」
 * 候選建議。
 *
 * checkPatientOutputSafety 擋到什麼程度(2026-09-02 逐項實測後改寫,原文寫的是
 * 「病人可見輸出永遠零診斷資訊(硬擋)」—— 那句話比實作做到的多):
 *   擋得住:BANNED_ID_PREFIXES 的七個 **id 前綴**(pattern./cond./tdis./safety./
 *           modality./metric./avs.)、icd/cpt、patientCode。解碼到定點 + 剝 tag
 *           雙變體掃描,拆字與多層 HTML 實體都繞不過去。
 *   擋不住:**中文診斷詞本身**。實測「本次辨證為肝鬱氣滯、脾陽虛」與
 *           「西醫診斷:胃食道逆流」都回傳 [] 直接放行;herb./formula./pair./
 *           point./note./case. 這些不在名單上的 id 前綴同樣放行。
 * 也就是說:它是「零診斷 **id** 洩漏」的閘門,不是「零診斷 **資訊**」的閘門。
 * 醫師在 checkout 自訂欄(app.js 的 data-avs-custom-text,placeholder 寫著
 * 「病人語言,不放診斷詞與內部代碼」)手打中文證型名,只靠醫師自律,沒有機器把關。
 * 要不要把中文診斷詞也納入(需要詞表,且有誤殺風險 —— 「痧斑」這類正當用語不能擋)
 * 是設計裁定,不在本檔逕自擴充。
 *
 * 所有權:AVS snapshot 掛在 Visit(note.avsSnapshots[]),不掛 Patient/Case。
 *
 * 狀態機(§8):
 *   draft ──finalize──▶ finalized ──(correction)──▶ 新 draft(version+1)
 *                          │                              │finalize
 *                          └──────── superseded ◀─────────┘
 *   同一 Visit 同時最多一個 draft、一個 finalized;superseded 永遠可讀、
 *   永不刪除。finalized 之後本引擎沒有任何改寫它內容的 API —— 修正 = 新版本。
 *
 * 這檔案零 DOM 依賴,node 可直接 require 跑 E2E(scripts/test-avs-checkout.js)。
 * 純函式:所有變更 API 回傳新陣列/新物件,絕不就地改動輸入。
 */
(function (global) {
  "use strict";

  const GENERATOR_VERSION = "avs-v3";

  const AVS_CATEGORIES = ["aftercare", "lifestyle", "diet", "exercise", "special", "herb_caution"];

  /* ---- 安全旗標正規化(§2.6)-------------------------------------------
   * case.safetyFlags 是自由字串(歷史資料含中英混寫)。這裡把別名正規化成
   * canonical safety.* token,規則評估一律 token 精確比對 —— 取代 v2 的
   * cf.includes(f) 子字串邏輯。已是 safety.* 形式的字串原樣通過。
   * §6.2:遠期癌症病史不得觸發「治療中」建議 —— 只有明確「進行中」的
   * 治療狀態才映射到 active_* token;單獨的 cancer/tumor 字樣不映射。 */
  const SAFETY_ALIASES = [
    { token: "safety.anticoagulant", res: [/anti[- ]?coagul/i, /warfarin|coumadin|apixaban|rivaroxaban|dabigatran|eliquis|xarelto|heparin/i, /抗凝/] },
    { token: "safety.antiplatelet", res: [/anti[- ]?platelet/i, /clopidogrel|plavix|ticagrelor|aspirin/i, /抗血小板/] },
    { token: "safety.active_chemotherapy", res: [/chemo/i, /化療/] },
    { token: "safety.active_radiation", res: [/radiat|radiotherapy/i, /放療|放射治療|電療/] },
    { token: "safety.immunosuppressed", res: [/immunosuppress|immunocompromis/i, /免疫抑制|免疫低下/] },
    { token: "safety.pregnancy", res: [/pregnan/i, /懷孕|妊娠|孕期/] },
    { token: "safety.bleeding_tendency", res: [/bleeding/i, /出血傾向|易出血/] },
    { token: "safety.pacemaker", res: [/pacemaker/i, /心律調節器|節律器/] },
    { token: "safety.diabetes", res: [/diabet/i, /糖尿病/] }
  ];

  function normalizeSafetyFlags(rawFlags) {
    const tokens = new Set();
    for (const raw of rawFlags || []) {
      const s = String(raw || "").trim();
      if (!s) continue;
      if (/^safety\./.test(s)) { tokens.add(s.toLowerCase()); continue; }
      for (const alias of SAFETY_ALIASES) {
        if (alias.res.some((re) => re.test(s))) tokens.add(alias.token);
      }
    }
    return tokens;
  }

  /* ---- 療法來源解析(§7)------------------------------------------------
   * 1. visit.modalitiesPerformed[](structured,權威)
   * 2. legacy 自由文字推斷(fallback only;draft 會標示,定稿前需醫師確認)
   * 推斷規則承接 v2 CLI,補上 modalities 自由文字欄與推拿/耳針/溫熱。 */
  function inferModalitiesFromText(note) {
    const found = new Set();
    if ((note.acupointLinks || []).length || note.pointsUsed) found.add("modality.acupuncture");
    /* 不讀 note.plan。它的欄位說明是「整體治療計畫、homecare」(index.html),
     * 本質包含**還沒做的事** —— P 欄寫「居家可自行艾灸關元」或「下次考慮加拔罐」,
     * 推斷就會把艾灸/拔罐當成今天做過,印進病人文件的〈今天做了什麼〉。
     * 推斷的目的是補救 legacy note 沒有結構化勾選,來源必須限縮在「已發生」
     * 的欄位:手法、客觀所見、處置自由文字。 */
    const t = [note.technique, note.objective, note.modalities].filter(Boolean).join(" ");
    if (/電針|e-?stim|electro/i.test(t)) found.add("modality.electroacupuncture");
    if (/拔罐|cupping/i.test(t)) found.add("modality.cupping");
    if (/刮痧|gua\s?sha/i.test(t)) found.add("modality.gua_sha");
    if (/放血|點刺|bloodletting/i.test(t)) found.add("modality.bloodletting");
    if (/灸|moxa/i.test(t)) found.add("modality.moxibustion");
    if (/推拿|tui\s?na/i.test(t)) found.add("modality.tui_na");
    if (/耳針|耳穴|auricular/i.test(t)) found.add("modality.auricular_acupuncture");
    if (/TDP|溫熱照射|熱燈/i.test(t)) found.add("modality.tdp_heat_lamp");
    if ((note.formulaLinks || []).length || note.formulaHerbs) found.add("modality.herbal_medicine");
    return found;
  }

  function resolveModalities(note) {
    const structured = (note.modalitiesPerformed || []).filter((id) => /^modality\./.test(String(id)));
    if (structured.length) return { modalityIds: new Set(structured), source: "structured" };
    const inferred = inferModalitiesFromText(note);
    return { modalityIds: inferred, source: inferred.size ? "inferred" : "none" };
  }

  /* ---- 建議媒合(§4 Step 4)---------------------------------------------
   * 回傳 [{rule, matchedTriggers[]}];matchedTriggers 僅供醫師端
   * 「為什麼建議?」展開,絕不進入病人輸出(render 端結構上拿不到它)。
   * triggers.safety 為 canonical token 精確比對;legacy triggers.safetyFlags
   * (自由字串)先過同一個別名正規化再精確比對 —— 不再有子字串誤觸。 */
  function matchAdvice(records, ctx) {
    const out = [];
    for (const rule of records || []) {
      if (rule.active === false) continue;
      const t = rule.triggers || {};
      const hits = [];
      for (const p of t.patterns || []) if (ctx.patterns.has(p)) hits.push(p);
      for (const c of t.conditions || []) if (ctx.conditions.has(c)) hits.push(c);
      for (const m of t.modalities || []) if (ctx.modalityIds.has(m)) hits.push(m);
      for (const s of t.safety || []) if (ctx.safety.has(s)) hits.push(s);
      for (const legacy of t.safetyFlags || []) {
        for (const tok of normalizeSafetyFlags([legacy])) if (ctx.safety.has(tok)) hits.push(tok);
      }
      if (t.any_herbs && ctx.hasActiveHerbs) hits.push("any_herbs");
      const mode = String(rule.trigger_mode || "ANY").toUpperCase();
      const declared = (t.patterns || []).length + (t.conditions || []).length + (t.modalities || []).length
        + (t.safety || []).length + (t.safetyFlags || []).length + (t.any_herbs ? 1 : 0);
      const matched = mode === "ALL" ? (declared > 0 && new Set(hits).size >= declared) : hits.length > 0;
      if (matched) out.push({ rule, matchedTriggers: [...new Set(hits)] });
    }
    return out;
  }

  /* 從 Visit + Case 結構化資料收集媒合上下文。絕不解析 SOAP 自由文字來
   * 「發明」診斷 —— 只讀已結構化的欄位(§2.5)。 */
  function buildMatchContext(kase, note) {
    const resolved = resolveModalities(note);
    /* 「使用中」用**肯定式**判準,與 clinical-store.getCurrentExposures 同一把尺。
     * 舊版寫成否定式 !/stopped|past/,於是 status 為 'unknown'、""(legacy)、
     * 或任何打錯的值都會被當成使用中 —— 而病人跨 case 總帳與病例的 current
     * 清單用的是肯定式,同一筆資料兩個相反結論,說得比較大聲的那個(病人文件)
     * 還印給了病人。病人文件只印確定使用中的;被排除的由 checkout 明說。 */
    const ledgerMeds = (kase.agentExposures || []).filter((e) => e.status === "current" || e.status === "prn");
    // 2026-08-25(dry run 現場發現:「我有開中藥 我的診後照顧指示裡面沒有
    // 中藥的指示」)——舊版只讀 case 層 agentExposures(獨立的「用藥與補充劑」
    // 對話框),SOAP 表單自己的「方藥 Formula」/「西藥」picker
    // (note.formulaLinks/medicationLinks)完全沒有併進來。醫師在 SOAP 表單
    // 勾了方劑,直覺會預期 AVS 看得到——不知道還要另外開那個獨立對話框
    // 補一筆才會出現。補上:用藥帳裡沒有的、但這次 note.formulaLinks/
    // medicationLinks 有勾選的 id,額外併入,doseText/frequencyText 留空,
    // 劑量與帳本路徑同規則:留空就是留空(見下方 medRows 註解),不生出
    // 「依醫囑」。用藥帳裡已經有的 id(agentId 相符)不重複併入,用藥帳的
    // doseText/frequencyText 優先——那才是真的填過劑量的資料。
    const ledgerAgentIds = new Set(ledgerMeds.map((e) => e.agentId).filter(Boolean));
    const visitOnlyIds = [...new Set([...(note.formulaLinks || []), ...(note.medicationLinks || [])])]
      .filter((id) => id && !ledgerAgentIds.has(id));
    const activeMeds = [
      ...ledgerMeds,
      ...visitOnlyIds.map((id) => ({ agentId: id, nameText: "", doseText: "", frequencyText: "", status: "current" }))
    ];
    return {
      patterns: new Set((note.tcmPatternSelections || []).map((x) => x.patternId)),
      conditions: new Set([...(kase.westernConditions || []), ...(kase.easternDiseases || []), ...(note.westernConditionLinks || []), ...(note.easternDiseaseLinks || [])]),
      modalityIds: resolved.modalityIds,
      modalitySource: resolved.source,
      safety: normalizeSafetyFlags([...(kase.safetyFlags || []), ...(note.safetyFlagLinks || [])]),
      hasActiveHerbs: activeMeds.length > 0,
      activeMeds
    };
  }

  function makeId() {
    return `avs.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 8)}`;
  }

  /* ---- Draft 生成(§4 Step 3-4)----------------------------------------- */
  function buildDraftSnapshot({ kase, note, library, clinic, modalityVocabulary, outcomeMetricDefs, nameOfAgent, now, version }) {
    const ctx = buildMatchContext(kase, note);
    const nameByModality = new Map((modalityVocabulary || []).map((r) => [r.id, r.name_zh]));
    const candidates = matchAdvice(library, ctx);
    if (typeof nameOfAgent !== "function") nameOfAgent = () => null;
    /* 劑量留空就是留空。舊版寫 `e.doseText || "依醫囑"` —— 劑量欄是選填,
     * 沒填時病人文件會印出「用量:依醫囑」,而資料裡沒有任何醫囑,那四個字
     * 是渲染層生出來的,病歷側同一筆顯示的卻是誠實的「—」。病人拿到的文件
     * 因此比病歷多說了一句話,而且看起來像醫師交代過。缺就缺,由 checkout
     * 提醒醫師回用藥帳補。 */
    const medRows = ctx.activeMeds.map((e) => ({
      name: nameOfAgent(e.agentId) || e.nameText || "",
      dose: e.doseText || "",
      freq: e.frequencyText || ""
    })).filter((r) => r.name);   // 認不出名字的不印給病人(不印 internal id);checkout 會明說被丟了幾筆
    // 自我觀察題面:此 case 追蹤中的 metric 的病人語言 prompt(≤4,承 v1)。
    const tracked = new Set();
    for (const n of kase.soapNotes || []) for (const m of n.outcomeMetrics || []) tracked.add(m.metricId);
    const prompts = [...tracked]
      .map((id) => (outcomeMetricDefs || []).find((r) => r.id === id))
      .map((def) => def && def.patient_prompt_zh ? def.patient_prompt_zh : null)
      .filter(Boolean).slice(0, 4);
    return {
      id: makeId(),
      visitId: note.id,
      version: version || 1,
      status: "draft",
      generatedAt: now || new Date().toISOString(),
      finalizedAt: null,
      modalitySource: ctx.modalitySource,
      todayCare: [...ctx.modalityIds].map((id) => nameByModality.get(id) || null).filter(Boolean),
      selectedAdviceRuleIds: candidates.map((c) => c.rule.id),
      // renderedAdvice 在 draft 階段帶 selected 旗標與 matchedTriggers(醫師
      // 端 UI 用);finalize 會剝掉 matchedTriggers、丟棄未勾選項。
      // preselect:false 的規則(如腫瘤治療中注意事項)預設不勾 —— 必須醫師
      // 明確勾選才會進入病人文件;其餘候選預設勾選、仍全數經過 review UI。
      renderedAdvice: candidates.map((c) => ({
        ruleId: c.rule.id,
        category: c.rule.category || "lifestyle",
        text_zh: c.rule.advice_zh || "",
        selected: c.rule.preselect === false ? false : true,
        matchedTriggers: c.matchedTriggers,
        // evidenceType/sourceRefs 是醫師端判斷輔助(這條建議的證據等級與
        // 具名來源),跟 matchedTriggers 同一個命運:draft 階段帶著,
        // finalizeSnapshot 的白名單重建(只留 ruleId/category/text_zh)會
        // 自動剝掉,不會進病人文件也不會進定稿歷史 —— 不需要另外寫剝除邏輯,
        // 那正是白名單而非黑名單的好處。scripts/test-avs-checkout.js 有
        // 對稱斷言確認真的被剝了。
        evidenceType: c.rule.evidence_type || "",
        sourceRefs: Array.isArray(c.rule.source_refs) ? c.rule.source_refs : []
      })),
      clinicianAddedAdvice: [],
      medicationInstructionsSnapshot: medRows,
      // 回診安排刻意「不」預填 note.followUp。SOAP 的「下次計畫」是醫師的內部
      // 盤算(「若入睡仍 >60 分鐘,考慮加梔子豉湯思路」這類),預填等於預設把
      // 它印給病人,只靠醫師記得刪掉 —— 那不是防線。與 preselect:false 同一條
      // 規矩:病人文件裡的每一句話都必須是醫師在 checkout 明確放進去的。
      // checkout UI 仍把內部計畫並排顯示成醫師端參考,並提供一鍵沿用
      // (app.js renderAvsCheckout §5),所以「照抄」只多一次點擊,不多一次打字。
      followUpSnapshot: "",
      patientObservationPromptsSnapshot: prompts,
      clinicProfileSnapshot: {
        clinic_name_zh: (clinic && clinic.clinic_name_zh) || "",
        practitioner_zh: (clinic && clinic.practitioner_zh) || "",
        phone: (clinic && clinic.phone) || "",
        website: (clinic && clinic.website) || "",
        // Phase E additive fields (print header/footer). Snapshots created
        // before this change won't carry these — renderPatientHtml treats
        // them as optional (renders only when present).
        address: (clinic && clinic.address) || "",
        booking_note_zh: (clinic && clinic.booking_note_zh) || ""
      },
      generatorVersion: GENERATOR_VERSION
    };
  }

  /* ---- Snapshot 集合查詢/變更(全部回傳新值,絕不就地改)---------------- */
  const currentDraft = (snapshots) => (snapshots || []).find((s) => s.status === "draft") || null;
  const latestFinalized = (snapshots) => (snapshots || []).find((s) => s.status === "finalized") || null;

  /* 只換 draft;finalized/superseded 一律原樣攜帶(同一參照,零改寫)。 */
  function upsertDraft(snapshots, draft) {
    if (!draft || draft.status !== "draft") throw new Error("upsertDraft: snapshot must have status=draft");
    const kept = (snapshots || []).filter((s) => s.status !== "draft");
    return [...kept, draft];
  }

  /* 定稿(§4 Step 7 / §8):
   *   - 只接受現存 draft;
   *   - 病人文字必須非空(rendered/自訂/todayCare 至少一項)——「空白定稿」拒絕;
   *   - 丟棄未勾選候選、剝除 matchedTriggers/selected(診斷後設資料不落入
   *     歷史文件);
   *   - 既有 finalized → superseded(原物件僅改 status,內容原樣);
   *   - 絕不刪除任何舊 snapshot。 */
  function finalizeSnapshot(snapshots, draftId, now) {
    const list = snapshots || [];
    const draft = list.find((s) => s.id === draftId);
    if (!draft) throw new Error(`finalizeSnapshot: draft ${draftId} not found`);
    if (draft.status !== "draft") throw new Error(`finalizeSnapshot: snapshot ${draftId} is "${draft.status}", only a draft can be finalized`);
    const kept = (draft.renderedAdvice || []).filter((a) => a.selected !== false && String(a.text_zh || "").trim());
    const custom = (draft.clinicianAddedAdvice || []).filter((a) => String(a.text_zh || "").trim());
    if (!kept.length && !custom.length && !(draft.todayCare || []).length) {
      throw new Error("finalizeSnapshot: refusing to finalize an empty AVS (no instructions, no care record)");
    }
    const finalized = {
      ...draft,
      status: "finalized",
      finalizedAt: now || new Date().toISOString(),
      selectedAdviceRuleIds: kept.map((a) => a.ruleId).filter(Boolean),
      renderedAdvice: kept.map((a) => ({ ruleId: a.ruleId || "", category: a.category || "lifestyle", text_zh: String(a.text_zh).trim() })),
      clinicianAddedAdvice: custom.map((a) => ({ category: a.category || "lifestyle", text_zh: String(a.text_zh).trim() }))
    };
    return list.map((s) => {
      if (s.id === draftId) return finalized;
      if (s.status === "finalized") return { ...s, status: "superseded" };
      return s;
    });
  }

  /* 修正流程(§8):從現行 finalized 複製出 version+1 的新 draft。
   * 原 finalized 此刻不動 —— 等新版本定稿那一刻才轉 superseded。 */
  function createCorrectionDraft(snapshots, now) {
    const fin = latestFinalized(snapshots);
    if (!fin) throw new Error("createCorrectionDraft: no finalized AVS to correct");
    if (currentDraft(snapshots)) throw new Error("createCorrectionDraft: a draft already exists — finalize or discard it first");
    return {
      ...JSON.parse(JSON.stringify(fin)),   // 深拷貝:修正草稿的編輯絕不可觸及歷史物件
      id: makeId(),
      version: (Number(fin.version) || 1) + 1,
      status: "draft",
      generatedAt: now || new Date().toISOString(),
      finalizedAt: null,
      renderedAdvice: (fin.renderedAdvice || []).map((a) => ({ ...a, selected: true }))
    };
  }

  /* ---- 病人輸出(§10)---------------------------------------------------- */
  const esc = (s) => String(s || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  /* 病人文件的共用樣式 —— 單一來源。此 CSS 走 window.open + document.write
   * 且 autoPrint 是固定 300ms setTimeout：任何 webfont 請求都會與列印時點
   * 賽跑、可能印出半套字——這裡永遠只用系統字，不准加 webfont。
   * generate-avs.js（CLI v1）與
   * renderPatientHtml（app 端）共用這一份：2026-08-23 色票同步時兩邊
   * 都要手改的教訓（cautionsEn 雙鍵同病根），從此只改這裡。 */
  const SHEET_CSS = `body{font-family:"Microsoft JhengHei","Noto Sans TC",sans-serif;background:#f6f1e7;color:#33291f;margin:0;padding:24px;line-height:1.7}
.sheet{max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5dcc9;border-radius:12px;padding:28px 32px;box-shadow:0 8px 30px rgba(23,33,38,.08)}
.clinic-header{text-align:center;margin-bottom:6px}
.clinic-header .clinic-name{font-family:"Noto Serif TC",serif;font-size:1.2em;color:#16352f}
.clinic-header .clinic-contact{font-size:.82em;color:#786c5c;margin-top:2px}
h1{font-family:"Noto Serif TC",serif;font-size:1.5em;color:#515f3e;border-bottom:2px solid #b98b44;padding-bottom:8px;margin:0 0 4px}
.date{color:#786c5c;font-size:.9em;margin-bottom:16px}
h2{font-family:"Noto Serif TC",serif;font-size:1.05em;color:#16352f;margin:18px 0 6px}
table{width:100%;border-collapse:collapse;font-size:.95em}
td,th{border:1px solid #e5e0d4;padding:6px 10px;text-align:left}
th{background:#f7f3e8}
td.note{font-size:.85em;color:#786c5c}
ul{margin:4px 0;padding-left:20px}
.footer{margin-top:22px;padding-top:10px;border-top:1px dashed #b98b44;font-size:.78em;color:#786c5c}
.footer .booking-note{margin-top:4px}
.version{font-size:.72em;color:#9aa4ab;text-align:right}
@media print{
  @page{size:A4;margin:15mm}
  body{background:#fff;padding:0}
  .sheet{max-width:100%;border:0;border-radius:0;box-shadow:none;padding:0}
  section{break-inside:avoid;page-break-inside:avoid}
  table{page-break-inside:avoid}
  tr{page-break-inside:avoid}
  td,th{border:1px solid #999}
  .footer{break-inside:avoid}
}`;

  function renderPatientHtml(snapshot, opts) {
    const clinic = snapshot.clinicProfileSnapshot || {};
    const visitDate = (opts && opts.visitDate) || "";
    const advice = [...(snapshot.renderedAdvice || []).filter((a) => a.selected !== false), ...(snapshot.clinicianAddedAdvice || [])];
    const byCat = (...cats) => advice.filter((a) => cats.includes(a.category)).map((a) => a.text_zh).filter((t) => String(t || "").trim());
    const ul = (items) => items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "";
    const sec = (title, body) => body ? `<section><h2>${title}</h2>${body}</section>` : "";
    const meds = snapshot.medicationInstructionsSnapshot || [];
    const medTable = meds.length
      // 沒記錄的劑量/頻率印「—」,不補任何指示語(見 buildDraftSnapshot 註解)
      ? `<table><tr><th>名稱</th><th>用量</th><th>頻率</th></tr>${meds.map((r) => `<tr><td>${esc(r.name)}</td><td>${esc(r.dose) || "—"}</td><td>${esc(r.freq) || "—"}</td></tr>`).join("")}${byCat("herb_caution").map((t) => `<tr><td colspan="3" class="note">${esc(t)}</td></tr>`).join("")}</table>`
      : "";
    /* 紅旗與自我觀察是兩件事,不能合成一份清單。
     * patientObservationPromptsSnapshot 來自 outcome_metrics 的 patient_prompt_zh
     * ——「上次月經到這次月經開始,間隔大約幾天?」這類**追蹤題目**;
     * 舊版把它併進「什麼情況請盡快與我們聯絡或就醫」,於是病人讀到的是
     * 「出現這個情況請盡快就醫」,語意不對,而且把診所在追蹤病人哪些身心
     * 指標整份印給病人帶走,等於外洩追蹤細節(2026-08-25 dry run,Ting 原話
     * 「這個不用填入,因為那個有洩漏病人太多細節」)。追蹤提示題面只留在
     * 結帳畫面(app.js §6「自我觀察 What to watch」)給醫師參考,
     * 不再出現在病人帶走的文件裡——拿掉,不搬去別的段落。 */
    const urgent = [
      "症狀明顯加重、或出現新的劇烈疼痛",
      "發燒、持續頭暈、異常出血或瘀腫擴大",
      "服用調理品後噁心、皮疹或任何過敏反應"
    ];
    // 頁首聯絡列:地址/電話有值才印(誠實顯示「(待填」佔位,不特判隱藏——
    // 診所自己決定何時填真實值)。舊 snapshot 沒有 address 鍵時視為空字串。
    const headerContact = [clinic.address, clinic.phone].filter((v) => String(v || "").trim()).map(esc).join("　·　");
    const bookingNote = String(clinic.booking_note_zh || "").trim();
    return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>診後照護指示</title><style>${SHEET_CSS}</style></head><body><div class="sheet">
<div class="clinic-header">
<div class="clinic-name">${esc(clinic.clinic_name_zh)}</div>
${headerContact ? `<div class="clinic-contact">${headerContact}</div>` : ""}
</div>
<h1>診後照護指示</h1>
<div class="date">日期:${esc(visitDate)}${Number(snapshot.version) > 1 ? `　<span class="version">(更正版 v${esc(snapshot.version)})</span>` : ""}</div>
${sec("今天做了什麼", (snapshot.todayCare || []).length ? `<p>${snapshot.todayCare.map(esc).join("、")}。</p>` : "")}
${sec("居家照護計畫", ul(byCat("aftercare", "lifestyle", "diet", "exercise")))}
${sec("調理品怎麼吃", medTable)}
${sec("特別注意", ul(byCat("special")))}
${sec("什麼情況請盡快與我們聯絡或就醫", ul(urgent))}
${sec("下次回診", snapshot.followUpSnapshot ? `<p>回診安排:${esc(snapshot.followUpSnapshot)}</p>` : "")}
<div style="margin-top:18px;display:flex;justify-content:space-between;font-size:.9em;align-items:flex-end"><div>醫師:${esc(clinic.practitioner_zh)}＿＿＿＿＿＿</div><div style="text-align:right;color:#786c5c">預約電話:${esc(clinic.phone)}<br>${esc(clinic.website)}</div></div>
<div class="footer">本文件為衛教與照護指示,非診斷證明,不適用於保險申報。如有疑問請聯絡診所。${bookingNote ? `<div class="booking-note">${esc(bookingNote)}</div>` : ""}</div>
</div></body></html>`;
  }

  /* 純文字版(2026-08-25,Ting 要求:「出來的表格是直接可以剪貼貼上直接
   * 寄送的」)。內容與 renderPatientHtml 同一份 snapshot、同樣的欄位取捨
   * (todayCare/byCat/medicationInstructionsSnapshot/watch/followUpSnapshot),
   * 只是排版換成 email 純文字慣用的「【小標】+ 條列」,不需要 esc()
   * (純文字沒有 HTML 注入面,不經瀏覽器解析)。checkPatientOutputSafety
   * 對純文字一樣有效 —— findBannedTokens 只是字串掃描,不依賴有沒有 tag。 */
  function renderPatientText(snapshot, opts) {
    const clinic = snapshot.clinicProfileSnapshot || {};
    const visitDate = (opts && opts.visitDate) || "";
    const advice = [...(snapshot.renderedAdvice || []).filter((a) => a.selected !== false), ...(snapshot.clinicianAddedAdvice || [])];
    const byCat = (...cats) => advice.filter((a) => cats.includes(a.category)).map((a) => a.text_zh).filter((t) => String(t || "").trim());
    const meds = snapshot.medicationInstructionsSnapshot || [];
    // 2026-08-25:同 renderPatientHtml 的理由,自我觀察追蹤提示不併入緊急
    // 就醫清單,見上面 renderPatientHtml 裡的完整說明。
    const watch = [
      "症狀明顯加重、或出現新的劇烈疼痛",
      "發燒、持續頭暈、異常出血或瘀腫擴大",
      "服用調理品後噁心、皮疹或任何過敏反應"
    ];
    const headerContact = [clinic.address, clinic.phone].filter((v) => String(v || "").trim()).join("　·　");
    const bookingNote = String(clinic.booking_note_zh || "").trim();

    const lines = [];
    const push = (s) => lines.push(s === undefined ? "" : s);
    const section = (title, items) => {
      if (!items || !items.length) return;
      push(`【${title}】`);
      items.forEach((it) => push(`・${it}`));
      push();
    };

    if (String(clinic.clinic_name_zh || "").trim()) push(clinic.clinic_name_zh);
    if (headerContact) push(headerContact);
    push();
    push("診後照護指示");
    push(`日期:${visitDate}${Number(snapshot.version) > 1 ? `(更正版 v${snapshot.version})` : ""}`);
    push();

    if ((snapshot.todayCare || []).length) {
      push("【今天做了什麼】");
      push(`${snapshot.todayCare.join("、")}。`);
      push();
    }

    section("居家照護計畫", byCat("aftercare", "lifestyle", "diet", "exercise"));

    if (meds.length) {
      push("【調理品怎麼吃】");
      // 與 HTML 版同一個規則:沒記錄的劑量/頻率印「—」。
      // 少了這個 fallback,純文字版印出來是兩個全形空白,病人看到的是「名稱　　頻率」——
      // 分不出「沒交代劑量」與「這裡本來有字」。同一份 snapshot 的兩個出口不該說不同的話。
      meds.forEach((r) => push(`・${r.name}　${r.dose || "—"}　${r.freq || "—"}`));
      byCat("herb_caution").forEach((t) => push(`　※ ${t}`));
      push();
    }

    section("特別注意", byCat("special"));
    section("什麼情況請盡快與我們聯絡或就醫", watch);

    if (String(snapshot.followUpSnapshot || "").trim()) {
      push("【下次回診】");
      push(`回診安排:${snapshot.followUpSnapshot}`);
      push();
    }

    push(`醫師:${clinic.practitioner_zh || ""}`);
    if (String(clinic.phone || "").trim()) push(`預約電話:${clinic.phone}`);
    if (String(clinic.website || "").trim()) push(clinic.website);
    push();
    push("本文件為衛教與照護指示,非診斷證明,不適用於保險申報。如有疑問請聯絡診所。");
    if (bookingNote) push(bookingNote);

    // 尾端不留多餘空行堆疊:trim 掉開頭/結尾的空字串,中段保留(段落間距)。
    while (lines.length && lines[0] === "") lines.shift();
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    return lines.join("\n");
  }

  /* 零診斷自檢(§2.2/§12;Codex NO-GO HIGH-3 修復版):
   * 舊版是大小寫敏感的 raw-HTML includes,可被 `PATTERN.`、`icd-10`、
   * HTML-escaped patientCode、跨 tag 拆字繞過。修復 = canonical 掃描器:
   *   1. HTML entity 解碼到定點(擋 &amp;#112; 雙層編碼)再全小寫;
   *   2. 同時掃「原字串」與「剝掉 tag 的 browser-visible 文字」兩個變體
   *      (前者抓藏在屬性裡的,後者抓 pat<b>tern. 拆字);
   *   3. icd/cpt 帶邊界比對(icd-10、ICD10 都中,不誤傷一般詞)。
   * 引擎與 validate-avs-library.js 共用同一把尺(findBannedTokens)。 */
  const BANNED_ID_PREFIXES = ["pattern.", "cond.", "tdis.", "safety.", "modality.", "metric.", "avs."];

  function canonicalizeForScan(text) {
    let t = String(text || "");
    // Codex retest#2 修復:必須解碼到「真正的定點」,不是「最多 N 次」。
    // render 的 esc() 對 patientCode 多加一層 & 轉義,HTML 側需要的解碼
    // passes 比原始字串多一層;寫死 4 次上限時,含多層 &amp; 的 patientCode
    // 在 HTML 側停在半解碼,與完全解碼的 code 對不上 → 洩漏。每次
    // &amp;→& 都嚴格縮短字串,while 迴圈必然終止;上界取字串長度(每輪至少
    // 消一個字元才可能繼續),純粹是 DoS backstop,正常內容一兩輪就收斂。
    const maxPasses = t.length + 1;
    for (let i = 0; i < maxPasses; i++) {
      const prev = t;
      t = t
        .replace(/&#x([0-9a-f]+);?/gi, (m, h) => { try { return String.fromCodePoint(parseInt(h, 16)); } catch { return m; } })
        .replace(/&#(\d+);?/g, (m, d) => { try { return String.fromCodePoint(Number(d)); } catch { return m; } })
        .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&apos;|&#39;/gi, "'")
        .replace(/&amp;/gi, "&");
      if (t === prev) break;   // 真定點:再解也不變
    }
    return t.toLowerCase();
  }

  function findBannedTokens(text, patientCode) {
    const canon = canonicalizeForScan(text);
    const visible = canon.replace(/<[^>]*>/g, "");   // browser-visible 變體
    const hits = new Set();
    for (const variant of [canon, visible]) {
      for (const p of BANNED_ID_PREFIXES) if (variant.includes(p)) hits.add(p);
      if (/(^|[^a-z])icd[^a-z0-9]?\d*/.test(variant)) hits.add("icd");
      if (/(^|[^a-z])cpt([^a-z0-9]|$)/.test(variant)) hits.add("cpt");
      const code = canonicalizeForScan(patientCode || "").trim();
      if (code && variant.includes(code)) hits.add(String(patientCode).trim());
    }
    return [...hits];
  }

  function checkPatientOutputSafety(html, kase) {
    return findBannedTokens(html, kase && kase.patientCode);
  }

  /* ---- 歷史 append-only 比對器(Codex NO-GO HIGH-1 修復)------------------
   * Merge/import 的唯一認可 AVS 歷史檢查:before 的每一份 finalized/
   * superseded snapshot 都必須在 after 以同 id、同 canonical payload 存在;
   * 唯一合法的欄位變化是 status finalized→superseded(更正定稿的副作用)。
   * draft 可自由替換/消失 —— 草稿不是歷史文件。深層 key 排序後比 JSON,
   * 與 clinical-store 的 exposureHistoryExtends 同哲學:結構相等,零漂移。 */
  function sortKeysDeep(v) {
    if (Array.isArray(v)) return v.map(sortKeysDeep);
    if (v && typeof v === "object") {
      const out = {};
      for (const k of Object.keys(v).sort()) out[k] = sortKeysDeep(v[k]);
      return out;
    }
    return v;
  }

  function canonicalSnapshotPayload(s) {
    const { status, ...rest } = s || {};
    return JSON.stringify(sortKeysDeep(rest));
  }

  function avsHistoryExtends(beforeNote, afterNote) {
    const afterSnaps = (afterNote && afterNote.avsSnapshots) || [];
    // Codex retest 新發現(merge shadow bypass)修復:同 id 重複時,舊版
    // Map 索引只看「最後一筆」,攻擊者放 [改寫版, 原版] 就能讓比對器對著
    // 原版放行,而 find()/latestFinalized 等消費者讀到的是第一筆改寫版 ——
    // 比對器與消費者看的不是同一筆。合法資料永遠不會有重複 id(引擎所有
    // 寫路徑都保證),所以 after 出現任何重複 id 一律直接拒絕。
    const seen = new Set();
    for (const s of afterSnaps) {
      if (seen.has(s.id)) return { ok: false, reason: `duplicate AVS snapshot id ${s.id} in incoming visit (shadow-copy attack or corruption) — refused` };
      seen.add(s.id);
    }
    const history = ((beforeNote && beforeNote.avsSnapshots) || []).filter((s) => s.status === "finalized" || s.status === "superseded");
    const afterById = new Map(afterSnaps.map((s) => [s.id, s]));
    for (const b of history) {
      const a = afterById.get(b.id);
      if (!a) return { ok: false, reason: `${b.status} AVS snapshot ${b.id} missing (history truncated)` };
      const legalStatus = a.status === b.status || (b.status === "finalized" && a.status === "superseded");
      if (!legalStatus) return { ok: false, reason: `AVS snapshot ${b.id}: status "${b.status}" → "${a.status}" is not a legal transition` };
      if (canonicalSnapshotPayload(b) !== canonicalSnapshotPayload(a)) {
        return { ok: false, reason: `AVS snapshot ${b.id} payload rewritten (finalized history is immutable)` };
      }
    }
    return { ok: true };
  }

  /* ---- 歷史不變量(§12,node 驗證器與 E2E 共用;MED-1 補強版)------------
   * Codex NO-GO MED-1:舊版沒驗 id 唯一與合法版本序 —— duplicate id、
   * version -1/1.5、superseded v2 蓋在 finalized v1 之上,全都 ok:true。
   * 補:id 唯一;version 必為 safe integer >= 1;finalized 版本必須嚴格
   * 大於所有 superseded;draft 版本必須嚴格大於現行 finalized。 */
  function checkAvsInvariants(cases) {
    const failures = [];
    for (const c of cases || []) {
      for (const note of c.soapNotes || []) {
        const snaps = note.avsSnapshots || [];
        const drafts = snaps.filter((s) => s.status === "draft");
        const finals = snaps.filter((s) => s.status === "finalized");
        const label = `${c.id}/${note.id}`;
        const ids = new Set();
        for (const s of snaps) {
          if (ids.has(s.id)) failures.push(`${label}/${s.id}: duplicate snapshot id`);
          ids.add(s.id);
          if (!["draft", "finalized", "superseded"].includes(s.status)) failures.push(`${label}/${s.id}: invalid status "${s.status}"`);
          if (s.visitId !== note.id) failures.push(`${label}/${s.id}: visitId "${s.visitId}" does not match owning visit (AVS is Visit-owned)`);
          if (!Number.isSafeInteger(s.version) || s.version < 1) failures.push(`${label}/${s.id}: version ${JSON.stringify(s.version)} must be a safe integer >= 1`);
          if (s.status !== "draft") {
            if (!s.finalizedAt) failures.push(`${label}/${s.id}: ${s.status} without finalizedAt`);
            const text = [...(s.renderedAdvice || []), ...(s.clinicianAddedAdvice || [])].map((a) => a.text_zh).join("").trim();
            if (!text && !(s.todayCare || []).length) failures.push(`${label}/${s.id}: ${s.status} snapshot has no rendered patient text`);
            for (const a of s.renderedAdvice || []) {
              if (a.matchedTriggers) failures.push(`${label}/${s.id}: finalized advice still carries matchedTriggers (diagnostic metadata must not persist past finalize)`);
            }
          }
        }
        if (drafts.length > 1) failures.push(`${label}: ${drafts.length} concurrent drafts (max 1)`);
        if (finals.length > 1) failures.push(`${label}: ${finals.length} concurrent finalized versions (correction must supersede)`);
        const versions = snaps.map((s) => Number(s.version) || 0);
        if (new Set(versions).size !== versions.length) failures.push(`${label}: duplicate snapshot versions`);
        const fin = finals[0];
        if (fin) {
          for (const s of snaps) {
            if (s.status === "superseded" && !(Number(fin.version) > Number(s.version))) {
              failures.push(`${label}: finalized v${fin.version} is not strictly newer than superseded v${s.version}`);
            }
          }
          for (const d of drafts) {
            if (!(Number(d.version) > Number(fin.version))) failures.push(`${label}: draft v${d.version} must be strictly newer than finalized v${fin.version}`);
          }
        }
      }
    }
    return { ok: failures.length === 0, failures };
  }

  global.AcuTingAVS = {
    GENERATOR_VERSION,
    AVS_CATEGORIES,
    SAFETY_CANONICAL_TOKENS: SAFETY_ALIASES.map((a) => a.token),
    normalizeSafetyFlags,
    inferModalitiesFromText,
    resolveModalities,
    matchAdvice,
    buildMatchContext,
    buildDraftSnapshot,
    currentDraft,
    latestFinalized,
    upsertDraft,
    finalizeSnapshot,
    createCorrectionDraft,
    renderPatientHtml,
    renderPatientText,
    SHEET_CSS,
    canonicalizeForScan,
    findBannedTokens,
    checkPatientOutputSafety,
    avsHistoryExtends,
    checkAvsInvariants
  };
})(typeof window !== "undefined" ? window : globalThis);
