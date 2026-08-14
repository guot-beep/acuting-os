/* care-draft.js — CARE 2013 / STRICTA 2010 個案報告草稿產生器,計算層
 *
 * 這是 P6 CHM-CARE readiness 的下一步。`docs/CARE_READINESS_MAP_v0.md` 定義了
 * 對映表,`renderCareReadinessPanel`(app.js)畫出 N/M 徽章告訴你缺什麼 ——
 * 但沒有任何地方能把「已經齊備的那些欄位」實際組成一份草稿。徽章說了
 * 「可以生成了」,卻沒有生成的按鈕。這支補的就是那個按鈕背後的邏輯。
 *
 * 這份邏輯本來只活在 `scripts/generate-care-draft.js`(CLI 專用,用
 * `fs.readFileSync` 讀 bundle)。抽出來是同一個理由,重複第 N 次了:
 * app 畫面要生成草稿,CLI 也要生成草稿,同一個問題不能有兩份實作 ——
 * P1 transport 的 MED-4 就是這樣漂移出來的。CLI 現在改成薄包裝,呼叫這裡。
 *
 * 誠實規則(不可協商,抄自原檔的設計說明,一併帶過來):
 *   - 每個存在的欄位,原文照登
 *   - 每個缺的欄位,輸出明確的〔缺:<CARE item> — <field>〕標記 —— 絕不悄悄省略
 *   - patientCode 只出現在標頭的 HTML 註解,標記「對外使用前必須刪除」
 *   - 出生年月只輸出粗略年齡層,絕不輸出精確年份
 *   - publicationConsent 不是 "granted" 時,顯示醒目 ⚠️ 區塊,但產生器照常執行
 *     (不同意不代表不能整理草稿,只代表投稿前不能送出)
 *
 * 沒有 PHI 進出:輸入是已經在記憶體裡的病例物件,輸出是文字。這支不寫檔、
 * 不送網路 —— 在瀏覽器裡呼叫時,草稿只存在於當次頁面,下載動作由呼叫端決定。
 */
(function (root) {
  "use strict";

  const VERDICT_LABELS = {
    improved: { zh: "改善", en: "Improved" },
    no_change: { zh: "無變化", en: "No change" },
    worsened: { zh: "加重", en: "Worsened" },
    lost_followup: { zh: "失訪", en: "Lost to follow-up" },
  };

  function has(v) {
    if (Array.isArray(v)) return v.length > 0;
    if (v === 0) return true;
    return !!v;
  }

  function gap(careItem, field) {
    return `〔缺:${careItem} — ${field}〕`;
  }

  function ageRangeFromBirth(birthYearMonth, birthYear, refDate) {
    let y = null;
    if (birthYearMonth) {
      const parsed = parseInt(String(birthYearMonth).slice(0, 4), 10);
      if (Number.isFinite(parsed)) y = parsed;
    } else if (birthYear === 0 || birthYear) {
      const parsed = Number(birthYear);
      if (Number.isFinite(parsed)) y = parsed;
    }
    if (!y) return "";
    const age = refDate.getFullYear() - y;
    if (!Number.isFinite(age) || age < 0 || age > 130) return "";
    const lo = Math.floor(age / 10) * 10;
    return `${lo}-${lo + 9}歲`;
  }

  /* 瀏覽器與 CLI 共用的標籤索引建構器,但**不做檔案 I/O** —— 呼叫端(瀏覽器
   * 直接傳 globalThis.ACUTING_KNOWLEDGE,CLI 傳讀檔解析出來的物件)負責把
   * 資料餵進來。K 的每個區塊可以是陣列,也可以是 `{records: [...]}`
   * (兩種形狀在這個專案的 bundle 裡都出現過)。*/
  function buildLabelIndexFromKnowledge(K, points) {
    const idx = new Map();
    const put = (id, zh, en) => {
      if (id && !idx.has(id)) idx.set(id, { zh: zh || "", en: en || "" });
    };
    if (K) {
      const arr = (v) => (Array.isArray(v) ? v : v && Array.isArray(v.records) ? v.records : []);
      for (const r of arr(K.patternLibrary)) put(r.id, r.name_zh, r.name_en);
      for (const r of arr(K.conditions)) put(r.id, r.name_zh, r.name_en);
      for (const r of (K.conditions && K.conditions.eastern_diseases) || []) put(r.id, r.name_zh, r.name_en);
      for (const r of arr(K.formulas)) put(r.id, r.name_zh, r.name_en);
      for (const r of arr(K.symptoms)) put(r.id, r.name_zh, r.name_en);
      for (const r of arr(K.medications)) put(r.id, "", r.generic_name_en);
      for (const r of arr(K.pharmDrugs)) put(r.id, r.name_zh, r.name_en);
      for (const r of arr(K.supplementRecords)) put(r.id, r.name_zh, r.name_en);
      for (const r of arr(K.exposureVocabulary)) put(r.id, r.name_zh, r.name_en);
      for (const r of arr(K.adverseEventVocabulary)) put(r.id, r.name_zh, r.name_en);
      for (const r of arr(K.modalityVocabulary)) put(r.id, r.name_zh, r.name_en);
      for (const r of arr(K.lifestyleFactorVocabulary)) put(r.id, r.name_zh, r.name_en);
    }
    if (Array.isArray(points)) for (const p of points) put(p.code, p.chinese, p.english);
    return idx;
  }

  function metricDefMapFromKnowledge(records) {
    const m = new Map();
    for (const r of records || []) if (r && r.id) m.set(r.id, r);
    return m;
  }

  // CARE item 7:visits + agentExposures/environmentalExposures 事件,依日期排序。
  function buildTimeline(item, resolveLabel) {
    const resolve = resolveLabel || ((id) => id || "");
    const notes = item.soapNotes || [];
    const visitDateById = new Map(notes.map((n) => [n.id, n.visitDate || ""]));
    const events = [];
    for (const n of notes) {
      if (has(n.visitDate)) {
        events.push({
          date: n.visitDate,
          label: `就診第${n.visitNumber || "?"}次 Visit`,
          detail: [n.assessment, n.plan].filter(has).join(" / ") || n.subjective || "",
        });
      }
    }
    for (const [kind, rows] of [["agent", item.agentExposures || []], ["environmental", item.environmentalExposures || []]]) {
      for (const exp of rows) {
        const name = exp.nameText || resolve(exp.agentId) || resolve(exp.exposureId) || "(未命名暴露)";
        for (const ev of exp.events || []) {
          const d = ev.effectiveApprox || visitDateById.get(ev.visitId) || "";
          const detail = ev.note || ev.doseText || ev.certainty || "";
          events.push({ date: d, label: `${kind === "agent" ? "用藥/補充品" : "環境暴露"}事件: ${name} — ${ev.eventType}`, detail });
        }
      }
    }
    for (const n of notes) {
      for (const ae of n.adverseEvents || []) {
        events.push({ date: n.visitDate || "", label: `不良事件: ${ae.nameText || resolve(ae.eventId) || "(未命名)"}`, detail: [ae.severity, ae.onsetText].filter(has).join(" / ") });
      }
    }
    events.sort((a, b) => String(a.date || "9999-99-99").localeCompare(String(b.date || "9999-99-99")));
    return events;
  }

  function generateDraft(item, opts) {
    const lang = opts.lang || "both";
    const labelIdx = opts.labelIdx || new Map();
    const metricDefs = opts.metricDefs || new Map();
    const refDate = opts.refDate || new Date();
    // outcomeMetrics 的首末值走 AcuTingClinicalStore.getOutcomeHistory ——
    // 那是唯一認可的讀法(見 js/clinical-store.js),不在這裡重寫一份掃描邏輯。
    const STORE = root.AcuTingClinicalStore;

    const t = (zh, en) => (lang === "zh" ? zh : lang === "en" ? en : `${zh} / ${en}`);
    const resolveLabel = (id) => {
      if (!id) return "";
      const hit = labelIdx.get(id);
      if (!hit) return id;
      if (hit.zh && hit.en) return `${hit.zh}(${hit.en})`;
      return hit.zh || hit.en || id;
    };
    const resolveList = (ids) => (ids || []).filter(has).map(resolveLabel).join("、");

    const notes = (item.soapNotes || [])
      .slice()
      .sort((a, b) => String(a.visitDate || "9999-99-99").localeCompare(String(b.visitDate || "9999-99-99")) || Number(a.visitNumber || 0) - Number(b.visitNumber || 0));

    const lines = [];
    const push = (s = "") => lines.push(s);

    push(`<!-- patientCode: ${item.patientCode || "(none)"} — 本行為身分索引,對外使用前必須刪除 -->`);
    const dxTitle = [resolveList(item.westernConditions), resolveList(item.easternDiseases)].filter(has).join(" / ");
    push(`# ${item.caseTitle || "(未命名病例)"} — CARE Case Report Draft 個案報告草稿${dxTitle ? " — " + dxTitle : ""}`);
    push("");
    push(
      `_本草稿由 \`scripts/generate-care-draft.js\` 產生 · 產生時間 ${refDate.toISOString().slice(0, 10)} · ` +
        `病人代碼僅存於上方 HTML 註解,正文一律稱「本案病人」。臨床敘述文字(主訴/病史/評估等)照錄病歷原文,` +
        `若含姓名或其他可識別資訊,投稿前需人工核閱刪除。_`
    );
    push("");

    if (item.publicationConsent !== "granted") {
      const status = item.publicationConsent ? item.publicationConsent : "未詢問";
      push(`> ⚠️ **發表同意:${status} — 本草稿僅供個人整理,取得同意前不得投稿**`);
      push("");
    }

    push(`## ${t("CARE 1 · 標題 Title", "CARE 1 · Title")}`);
    push("已於上方標題註明「Case Report」,符合 CARE 第 1 項。");
    push("");

    push(`## ${t("CARE 2 · 關鍵詞", "CARE 2 · Keywords")}`);
    {
      const patternIds = new Set();
      for (const n of notes) for (const s of n.tcmPatternSelections || []) if (has(s.patternId)) patternIds.add(s.patternId);
      for (const p of item.tcmPatterns || []) if (has(p)) patternIds.add(p);
      const kw = [...(item.westernConditions || []), ...(item.easternDiseases || []), ...patternIds].filter(has);
      push(kw.length ? kw.map(resolveLabel).join("、") : gap("2 Key words", "case.westernConditions / easternDiseases / soapNotes[].tcmPatternSelections"));
    }
    push("");

    push(`## ${t("摘要 Abstract", "Abstract")}`);
    push(`### ${t("3a 前言(摘要內)", "3a Introduction (within abstract)")}`);
    push(gap("3a Abstract–introduction", "對應 cond/tdis 卡片文獻背景(本產生器未讀取卡片內容,需人工撰寫)"));
    push(`### ${t("3b 病例陳述", "3b Case presentation")}`);
    {
      const parts = [];
      if (has(item.chiefComplaint)) parts.push(item.chiefComplaint);
      const dxLabel = [resolveList(item.westernConditions), resolveList(item.easternDiseases)].filter(has).join("；");
      if (dxLabel) parts.push(`主要診斷:${dxLabel}`);
      push(parts.length ? parts.join(" ") : gap("3b Abstract–case presentation", "case.chiefComplaint"));
    }
    push(`### ${t("3c 結論", "3c Conclusion")}`);
    push(gap("3c Abstract–conclusion", "人工撰寫,總結療效與意義"));
    push("");

    push(`## ${t("4 · 前言 Introduction", "4 · Introduction")}`);
    push(gap("4 Introduction", "對應 cond/tdis 卡片之 summary/etiology 背景文獻(本產生器未讀取卡片內容,需人工撰寫)"));
    push("");

    push(`## ${t("5 · 病人資訊 Patient information", "5 · Patient information")}`);
    push(`### 5a ${t("基本資料", "Demographics")}`);
    {
      const ageRange = ageRangeFromBirth(item.birthYearMonth, item.birthYear, refDate);
      push(`- ${t("性別 sex", "sex")}: ${has(item.sex) ? item.sex : gap("5a Demographics", "case.sex")}`);
      push(`- ${t("年齡層 age range", "age range")}: ${ageRange || gap("5a Demographics", "case.birthYearMonth / case.birthYear")}`);
      push(`- ${t("職業 occupation", "occupation")}: ${has(item.occupation) ? item.occupation : gap("5a Demographics", "case.occupation")}`);
      if (has(item.genderIdentity)) push(`- ${t("性別認同 gender identity", "gender identity")}: ${item.genderIdentity}`);
      if (has(item.raceEthnicity)) push(`- ${t("種族/族裔 race/ethnicity", "race/ethnicity")}: ${item.raceEthnicity.join("、")}${has(item.raceEthnicityDetail) ? `(${item.raceEthnicityDetail})` : ""}`);
    }
    push(`### 5b ${t("主訴", "Main symptoms")}`);
    push(has(item.chiefComplaint) ? item.chiefComplaint : gap("5b Main symptoms", "case.chiefComplaint"));
    push(`### 5c ${t("病史/家族史/心理社會史", "Medical/family/psychosocial history")}`);
    {
      const rows = [
        [t("既往史", "past history"), item.pastHistory, "case.pastHistory"],
        [t("月經/產科史", "menstrual/ob history"), item.menstrualObHistory, "case.menstrualObHistory"],
        [t("生活型態", "lifestyle"), item.lifestyle, "case.lifestyle"],
        [t("目前用藥", "current meds"), item.currentMeds, "case.currentMeds"],
      ];
      for (const [label, val, field] of rows) push(`- ${label}: ${has(val) ? val : gap("5c Medical/family/psychosocial history", field)}`);
      if (has(item.agentExposures)) push(`- ${t("暴露/用藥時序", "exposures ledger")}: ${item.agentExposures.map((e) => `${e.nameText || resolveLabel(e.agentId)}(${e.status || "?"})`).join("、")}`);
    }
    push(`### 5d ${t("過往治療及成效", "Relevant past interventions + outcomes")}`);
    {
      const prev = [];
      if (has(item.previousTreatment)) prev.push(item.previousTreatment.join("、"));
      if (has(item.previousTreatmentNotes)) prev.push(item.previousTreatmentNotes);
      push(prev.length ? prev.join(" — ") : gap("5d Relevant past interventions + outcomes", "case.previousTreatment / case.previousTreatmentNotes"));
    }
    push("");

    push(`## 6 · ${t("臨床所見", "Clinical findings")}`);
    {
      const withObj = notes.filter((n) => has(n.objective));
      push(withObj.length ? withObj.map((n) => `- ${n.visitDate || n.id}(第${n.visitNumber || "?"}診): ${n.objective}`).join("\n") : gap("6 Clinical findings", "soapNotes[].objective"));
    }
    push("");

    push(`## 7 · ${t("時間表 Timeline", "Timeline")}`);
    {
      const events = buildTimeline(item, resolveLabel);
      push(
        events.length
          ? events.map((e) => `- ${e.date || "(日期不詳)"} — ${e.label}${e.detail ? "：" + e.detail : ""}`).join("\n")
          : gap("7 Timeline", "soapNotes[].visitDate 及 agentExposures/environmentalExposures[].events[]")
      );
    }
    push("");

    push(`## 8 · ${t("診斷評估 Diagnostic assessment", "Diagnostic assessment")}`);
    push(`### 8a ${t("評估方法", "Methods")}`);
    {
      const withAssess = notes.filter((n) => has(n.assessment));
      push(withAssess.length ? withAssess.map((n) => `- ${n.visitDate || n.id}: ${n.assessment}`).join("\n") : gap("8a Diagnostic assessment–methods", "soapNotes[].objective / soapNotes[].assessment"));
    }
    push(`### 8b ${t("鑑別診斷思路", "Diagnostic challenges")}`);
    {
      const parts = [];
      for (const n of notes) {
        if (has(n.differentialConsidered)) parts.push(`${n.visitDate || n.id}: ${n.differentialConsidered}`);
        if (has(n.patternDifferentials)) {
          parts.push(`${n.visitDate || n.id} 證型鑑別: ` + n.patternDifferentials.map((d) => `${resolveLabel(d.patternId)}${d.ruledOut ? "(排除)" : ""}${has(d.note) ? " — " + d.note : ""}`).join("；"));
        }
        if (has(n.referralOrSupervisorQuestion)) parts.push(`${n.visitDate || n.id} 督導提問: ${n.referralOrSupervisorQuestion}`);
      }
      push(parts.length ? parts.map((p) => `- ${p}`).join("\n") : gap("8b Diagnostic challenges", "soapNotes[].differentialConsidered / patternDifferentials / referralOrSupervisorQuestion"));
    }
    push(`### 8c ${t("診斷(含鑑別)", "Diagnosis")}`);
    {
      const dx = [];
      if (has(item.westernConditions)) dx.push(`${t("西醫", "Western")}: ${resolveList(item.westernConditions)}`);
      if (has(item.easternDiseases)) dx.push(`${t("中醫病名", "Eastern disease")}: ${resolveList(item.easternDiseases)}`);
      for (const n of notes.filter((n) => has(n.tcmPatternSelections))) {
        dx.push(`${n.visitDate || n.id} ${t("證型", "pattern")}: ` + n.tcmPatternSelections.map((s) => `${resolveLabel(s.patternId)}${s.isPrimary ? "(主證)" : s.role === "secondary" ? "(次證)" : ""}`).join("、"));
      }
      push(dx.length ? dx.map((d) => `- ${d}`).join("\n") : gap("8c Diagnosis", "case.westernConditions / case.easternDiseases / soapNotes[].tcmPatternSelections"));
    }
    push(`### 8d ${t("預後特徵", "Prognosis characteristics")}`);
    push(gap("8d Prognosis characteristics", "系統無對應欄位,如有討論需人工於 assessment 散文補充"));
    push("");

    push(`## 9 · ${t("治療介入 Interventions", "Interventions")}`);
    push(`### 9a ${t("治療內容", "Types")}`);
    {
      const points = new Set(), formulas = new Set(), agentTypes = new Set();
      for (const n of notes) {
        for (const p of n.acupointLinks || []) if (has(p)) points.add(p);
        for (const f of n.formulaLinks || []) if (has(f)) formulas.add(f);
      }
      for (const e of item.agentExposures || []) if (has(e.agentType)) agentTypes.add(e.agentType);
      const parts = [];
      if (points.size) parts.push(`${t("穴位 acupoints", "acupoints")}: ${[...points].map(resolveLabel).join("、")}`);
      if (formulas.size) parts.push(`${t("方劑 formulas", "formulas")}: ${[...formulas].map(resolveLabel).join("、")}`);
      if (agentTypes.size) parts.push(`${t("其他暴露類型", "other exposure types")}: ${[...agentTypes].join("、")}`);
      push(parts.length ? parts.map((p) => `- ${p}`).join("\n") : gap("9a Intervention–types", "soapNotes[].acupointLinks / soapNotes[].formulaLinks"));
    }
    push(`### 9b ${t("方藥細節(劑量/劑型)", "Administration (dose/form)")}`);
    {
      const parts = [];
      for (const n of notes) if (has(n.formulaHerbs)) parts.push(`${n.visitDate || n.id}: ${n.formulaHerbs}`);
      for (const e of item.agentExposures || []) if (has(e.doseText)) parts.push(`${e.nameText || resolveLabel(e.agentId)}: ${e.doseText}${has(e.frequencyText) ? " " + e.frequencyText : ""}`);
      push(parts.length ? parts.map((p) => `- ${p}`).join("\n") : gap("9b Intervention–administration", "soapNotes[].formulaHerbs / agentExposures[].doseText"));
    }
    push(`### 9c ${t("治療調整軌跡(換方及理由)", "Changes (with reasons)")}`);
    {
      const changeLines = [];
      for (const e of [...(item.agentExposures || []), ...(item.environmentalExposures || [])]) {
        const evs = e.events || [];
        if (evs.length > 1) {
          const name = e.nameText || resolveLabel(e.agentId || e.exposureId);
          for (const ev of evs) changeLines.push(`${name} — ${ev.eventType}${has(ev.effectiveApprox) ? " @" + ev.effectiveApprox : ""}${has(ev.note) ? "：" + ev.note : ""}`);
        }
      }
      push(changeLines.length ? changeLines.map((l) => `- ${l}`).join("\n") : gap("9c Intervention–changes", "agentExposures[]/environmentalExposures[].events[] (length > 1)"));
    }
    push("");

    push(`## 10 · ${t("追蹤與成效 Follow-up / outcomes", "Follow-up / outcomes")}`);
    push(`### 10a ${t("結構化成效指標", "Clinician/patient-assessed outcomes")}`);
    {
      const metricIds = new Set();
      for (const n of notes) for (const m of n.outcomeMetrics || []) if (has(m.metricId)) metricIds.add(m.metricId);
      if (metricIds.size) {
        push(`| ${t("指標", "Metric")} | ${t("首次", "First")} | ${t("末次", "Last")} | ${t("變化", "Delta")} | ${t("判讀", "Direction")} |`);
        push("|---|---|---|---|---|");
        for (const mid of metricIds) {
          const hist = STORE ? STORE.getOutcomeHistory(item, mid) : [];
          if (!hist.length) continue;
          const def = metricDefs.get(mid);
          const label = def ? t(def.label_zh || mid, def.label_en || mid) : mid;
          const first = hist[0], last = hist[hist.length - 1];
          const delta = last.valueNumber - first.valueNumber;
          let dirNote = "";
          if (def && def.direction_good === "decrease") dirNote = delta < 0 ? t("朝向改善", "toward improvement") : delta > 0 ? t("朝向惡化", "toward worsening") : t("持平", "unchanged");
          else if (def && def.direction_good === "increase") dirNote = delta > 0 ? t("朝向改善", "toward improvement") : delta < 0 ? t("朝向惡化", "toward worsening") : t("持平", "unchanged");
          push(`| ${label} | ${first.valueNumber}(${first.visitDate || first.visitNumber}) | ${last.valueNumber}(${last.visitDate || last.visitNumber}) | ${delta > 0 ? "+" : ""}${delta} | ${dirNote} |`);
        }
      } else {
        push(gap("10a Follow-up–clinician/patient assessed outcomes", "soapNotes[].outcomeMetrics[]"));
      }
      const verdicts = notes.filter((n) => has(n.outcomeVerdict));
      push(
        verdicts.length
          ? verdicts.map((n) => `- ${n.visitDate || n.id} ${t("療效判定", "verdict")}: ${VERDICT_LABELS[n.outcomeVerdict] ? t(VERDICT_LABELS[n.outcomeVerdict].zh, VERDICT_LABELS[n.outcomeVerdict].en) : n.outcomeVerdict}`).join("\n")
          : gap("10a 療效判定", "soapNotes[].outcomeVerdict")
      );
    }
    push(`### 10b ${t("重要追蹤診斷檢查", "Important follow-up diagnostic evaluations")}`);
    push(gap("10b Important follow-up diagnostic evaluations", "系統無專屬欄位;複查/影像/檢驗結果如有需人工補充(可能已含於 6/8a 客觀所見)"));
    push(`### 10c ${t("遵囑與耐受性", "Intervention adherence & tolerability")}`);
    {
      const parts = [];
      const aeCount = notes.reduce((s, n) => s + (n.adverseEvents || []).length, 0);
      if (aeCount) parts.push(`${t("不良事件共", "adverse events total")} ${aeCount} ${t("筆(詳見 10d)", "(see 10d)")}`);
      for (const e of item.agentExposures || []) if (has(e.adherenceNote)) parts.push(`${e.nameText || resolveLabel(e.agentId)}: ${e.adherenceNote}`);
      push(parts.length ? parts.map((p) => `- ${p}`).join("\n") : gap("10c Intervention adherence & tolerability", "soapNotes[].adverseEvents[] / agentExposures[].adherenceNote"));
    }
    push(`### 10d ${t("不良事件及意外事件", "Adverse & unanticipated events")}`);
    {
      const rows = [];
      for (const n of notes) for (const ae of n.adverseEvents || []) {
        rows.push(`${n.visitDate || n.id}: ${resolveLabel(ae.eventId) || ae.nameText || "(未命名)"} — ${t("嚴重度", "severity")} ${ae.severity || "?"}, ${t("發生", "onset")} ${ae.onsetText || "?"}, ${t("回報", "status")} ${ae.status || "?"}, ${t("結果", "resolution")} ${ae.resolutionStatus || "?"}${has(ae.notes) ? "；" + ae.notes : ""}`);
      }
      push(rows.length ? rows.map((r) => `- ${r}`).join("\n") : gap("10d Adverse & unanticipated events", "soapNotes[].adverseEvents[]"));
    }
    push("");

    push(`## 11 · ${t("討論 Discussion", "Discussion")}`);
    push(`### 11a ${t("優點與限制", "Strengths & limitations")}`);
    push(gap("11a Discussion–strengths & limitations", "人工撰寫"));
    push(`### 11b ${t("相關文獻", "Relevant literature")}`);
    push(gap("11b Discussion–relevant literature", "對應卡片 sources(本產生器未讀取卡片內容,需人工撰寫)"));
    push(`### 11c ${t("結論理據", "Rationale for conclusions")}`);
    {
      const refl = notes.filter((n) => has(n.reflection));
      push(refl.length ? refl.map((n) => `- ${n.visitDate || n.id}: ${n.reflection}`).join("\n") : gap("11c Rationale for conclusions", "soapNotes[].reflection"));
    }
    push(`### 11d ${t("主要心得", "Main take-away lessons")}`);
    {
      const parts = [];
      for (const n of notes) {
        if (has(n.reflection)) parts.push(n.reflection);
        if (has(n.ifIneffectivePlan)) parts.push(`${t("若無效備案", "if ineffective")}: ${n.ifIneffectivePlan}`);
      }
      push(parts.length ? parts.map((p) => `- ${p}`).join("\n") : gap("11d Main take-away lessons", "soapNotes[].reflection / soapNotes[].ifIneffectivePlan"));
    }
    push("");

    push(`## 12 · ${t("病人視角 Patient perspective", "Patient perspective")}`);
    {
      const pp = notes.filter((n) => has(n.patientPerspective));
      push(pp.length ? pp.map((n) => `- ${n.visitDate || n.id}: 「${n.patientPerspective}」`).join("\n") : gap("12 Patient perspective", "soapNotes[].patientPerspective"));
    }
    push("");

    push(`## 13 · ${t("知情同意 Informed consent", "Informed consent")}`);
    {
      const status = item.publicationConsent || "";
      const label = status === "granted" ? t("已同意", "granted") : status === "declined" ? t("已拒絕", "declined") : status === "pending" ? t("詢問中", "pending") : t("未詢問", "not asked");
      push(`- ${t("發表同意狀態", "publication consent status")}: ${label}${has(item.publicationConsentDate) ? `(${item.publicationConsentDate})` : ""}`);
      if (!status) push(gap("13 Informed consent", "case.publicationConsent"));
    }
    push("");

    const needlingNotes = notes.filter(
      (n) => has(n.acupointLinks) || has(n.pointsUsed) || has(n.needleCount) || has(n.needleDepthText) || has(n.deqiResponse) || has(n.needleStimulation) || has(n.retentionMinutes) || has(n.needleTypeText)
    );
    if (needlingNotes.length) {
      push(`## ${t("STRICTA 2010 針刺報告項目", "STRICTA 2010")}`);
      push(`### 1a ${t("針刺流派/理據", "Style of acupuncture / rationale")}`);
      push(gap("1a 針刺流派/理據", "全案固定敘述(需人工撰寫)+ soapNotes[].assessment"));
      push(`### 1b ${t("治療變動理由", "Reasons for treatment variation")}`);
      {
        const parts = notes.filter((n) => has(n.plan)).map((n) => `${n.visitDate || n.id}: ${n.plan}`);
        push(parts.length ? parts.map((p) => `- ${p}`).join("\n") : gap("1b 治療變動理由", "soapNotes[].plan"));
      }
      push(`### 2 ${t("每次針刺細節", "Needling details per visit")}`);
      push(`| ${t("就診", "Visit")} | 2a ${t("進針數", "count")} | 2b ${t("穴位", "points")} | 2c ${t("深度", "depth")} | 2d ${t("得氣", "de qi")} | 2e ${t("刺激", "stim")} | 2f ${t("留針(分)", "retention (min)")} | 2g ${t("針具", "needle type")} |`);
      push("|---|---|---|---|---|---|---|---|");
      for (const n of needlingNotes) {
        const pts = has(n.acupointLinks) ? n.acupointLinks.map(resolveLabel).join("、") : has(n.pointsUsed) ? n.pointsUsed : gap("2b", "acupointLinks/pointsUsed");
        push(
          `| ${n.visitDate || n.id} | ${has(n.needleCount) ? n.needleCount : gap("2a", "needleCount")} | ${pts} | ${has(n.needleDepthText) ? n.needleDepthText : gap("2c", "needleDepthText")} | ${
            has(n.deqiResponse) ? n.deqiResponse : gap("2d", "deqiResponse")
          } | ${has(n.needleStimulation) ? n.needleStimulation : gap("2e", "needleStimulation")} | ${has(n.retentionMinutes) ? n.retentionMinutes : gap("2f", "retentionMinutes")} | ${
            has(n.needleTypeText) ? n.needleTypeText : gap("2g", "needleTypeText")
          } |`
        );
      }
      push(`### 3a ${t("療程次數/頻率", "Number/frequency of sessions")}`);
      {
        const dated = needlingNotes.filter((n) => has(n.visitDate)).map((n) => n.visitDate).sort();
        const span = dated.length >= 2 ? `${dated[0]} → ${dated[dated.length - 1]}` : dated[0] || "";
        push(`${t("共", "total")} ${needlingNotes.length} ${t("次針刺就診", "needling visits")}${span ? t(`,期間 ${span}`, `, span ${span}`) : ""}。`);
      }
      push(`### 4a ${t("合併治療", "Co-interventions")}`);
      {
        const formulas = new Set();
        for (const n of notes) for (const f of n.formulaLinks || []) if (has(f)) formulas.add(f);
        const agents = (item.agentExposures || []).map((e) => e.nameText || resolveLabel(e.agentId)).filter(has);
        const parts = [];
        if (formulas.size) parts.push(`${t("方劑", "formulas")}: ${[...formulas].map(resolveLabel).join("、")}`);
        if (agents.length) parts.push(`${t("藥物/補充品", "drugs/supplements")}: ${agents.join("、")}`);
        push(parts.length ? parts.join("；") : gap("4a 合併治療", "soapNotes[].formulaLinks / case.agentExposures"));
      }
      push(`### 5 ${t("治療者背景", "Practitioner background")}`);
      push(gap("5 治療者背景", "單一治療者情境,可全域設定;本產生器不讀取"));
      push(`### 6 ${t("對照/比較", "Control or comparison")}`);
      push(t("個案報告不適用。", "Not applicable for a case report."));
      push("");
    }

    return lines.join("\n");
  }

  const api = { VERDICT_LABELS, has, gap, ageRangeFromBirth, buildLabelIndexFromKnowledge, metricDefMapFromKnowledge, buildTimeline, generateDraft };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.AcuTingCareDraft = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
