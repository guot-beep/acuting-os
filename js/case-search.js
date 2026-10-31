/* case-search.js — 病例頁的「病人列表 + 搜尋 + 篩選 + 標籤」純函式層(2026-10-31,病例頁改版)。
 *
 * 為什麼獨立成檔:搜尋與分組過去寫死在 app.js 的 getFilteredClinicalCases 裡,
 * 只能在瀏覽器裡測。這裡全部是純函式(輸入病例陣列,輸出列表模型),不碰 DOM、
 * 不碰儲存層,所以 scripts/validate-case-search.js 可以直接在 node 裡跑真值表。
 *
 * 三條設計規則(Ting 2026-10-29/31 的需求):
 *   1. 以「病人」為單位列出(一個 patientCode 一列),同一位病人的多個病例收在詳情的分頁。
 *   2. 搜尋分兩組:代號/病例名稱命中(身分欄)排前面,只在內文命中的排後面,並說出
 *      「在哪一診、哪個欄位」找到(見 memory: search identity fields beat body fields)。
 *   3. 標籤三層各管一件事:關注度(重點/疑難/一般,工作流程用,會變)、ICPC-2 系統章節、
 *      照護情境。空值一律是「未設定」,不推斷、不補值(D4)。
 */
(function (global) {
  "use strict";

  // ① 關注度:工作流程標記,不是臨床分級。"" = 未設定,列表上當「一般」排序但不顯示徽章。
  const CASE_TIERS = {
    focus: { zh: "重點", en: "Focus", rank: 0, hint: "最近想深入了解,每次都細看" },
    complex: { zh: "疑難", en: "Complex", rank: 1, hint: "罕見、多系統、常規治療無效或需共同照護" },
    routine: { zh: "一般", en: "Routine", rank: 2, hint: "常見、預後清楚(腰痛、肩頸、坐骨神經痛…)" },
  };
  // 重點標記超過這個天數,詳情頁提醒要不要改回一般(重點病人該是少數、會輪替)。
  const FOCUS_REVIEW_DAYS = 42;

  // ② ICPC-2(WONCA International Classification of Primary Care)17 個章節。
  //    腫瘤依部位歸在各章節裡,所以「化療中」放在 ③ 情境,不是這裡。
  const ICPC2_CHAPTERS = {
    A: { zh: "一般/全身", en: "General and unspecified" },
    B: { zh: "血液/免疫", en: "Blood, blood forming organs, immune" },
    D: { zh: "消化", en: "Digestive" },
    F: { zh: "眼", en: "Eye" },
    H: { zh: "耳", en: "Ear" },
    K: { zh: "心血管", en: "Cardiovascular" },
    L: { zh: "肌肉骨骼", en: "Musculoskeletal" },
    N: { zh: "神經", en: "Neurological" },
    P: { zh: "心理/情志", en: "Psychological" },
    R: { zh: "呼吸(含鼻)", en: "Respiratory" },
    S: { zh: "皮膚", en: "Skin" },
    T: { zh: "內分泌/代謝", en: "Endocrine, metabolic, nutritional" },
    U: { zh: "泌尿", en: "Urological" },
    W: { zh: "妊娠/生育", en: "Pregnancy, childbearing, family planning" },
    X: { zh: "女性生殖", en: "Female genital (incl. breast)" },
    Y: { zh: "男性生殖", en: "Male genital" },
    Z: { zh: "社會問題", en: "Social problems" },
  };

  // ③ 照護情境:跨系統、會改變你怎麼治療的情況。
  const CARE_CONTEXTS = {
    oncology: { zh: "腫瘤整合照護", en: "Integrative oncology" },
    fertility: { zh: "備孕 / IVF", en: "Fertility / IVF" },
    pregnancy: { zh: "妊娠", en: "Pregnancy" },
    chronic_pain: { zh: "慢性疼痛 > 3 個月", en: "Chronic pain > 3 mo" },
    pediatric: { zh: "兒童", en: "Pediatric" },
    geriatric: { zh: "高齡 / 多重用藥", en: "Geriatric / polypharmacy" },
  };

  const CLINIC_SITES = {
    bastyr: { zh: "Bastyr", short: "B" },
    external: { zh: "外部診所", short: "O" },
  };

  // 代號格式(Ting 2026-10-31):族裔字母 + 姓名縮寫 + "-" + 出生年 + 性別,例 ATG-1984F。
  // 只用來「建議」帶入性別/出生年,從不覆蓋已填的值;格式不符就回 null。
  const PATIENT_CODE_RE = /^([A-Za-z])([A-Za-z]{1,4})-(\d{4})([FMXfmx])$/;
  const ETHNICITY_LETTERS = { A: "Asian", B: "Black", W: "White", M: "Mexican / Latino" };
  function parsePatientCode(code) {
    const m = PATIENT_CODE_RE.exec(String(code || "").trim());
    if (!m) return null;
    const year = Number(m[3]);
    const thisYear = new Date().getFullYear();
    if (year < 1900 || year > thisYear) return null;
    const sexLetter = m[4].toUpperCase();
    return {
      ethnicityLetter: m[1].toUpperCase(),
      ethnicity: ETHNICITY_LETTERS[m[1].toUpperCase()] || "",
      initials: m[2].toUpperCase(),
      birthYear: year,
      sex: sexLetter === "X" ? "Other" : sexLetter,
    };
  }

  const str = (v) => (v === null || v === undefined ? "" : String(v));
  const arr = (v) => (Array.isArray(v) ? v : []);
  const norm = (v) => str(v).toLowerCase();
  const tokenize = (q) => norm(q).split(/[\s,，、;；]+/).filter(Boolean);

  function tierOf(item) {
    return CASE_TIERS[item && item.attentionTier] ? item.attentionTier : "";
  }

  // 病例 → 病人列。一個 patientCode 一列;沒有代號的病例各自一列(不把它們湊成同一個人)。
  function groupCasesByPatient(cases) {
    const byKey = new Map();
    for (const item of arr(cases)) {
      const code = str(item.patientCode).trim();
      const key = code ? "code:" + code : "case:" + str(item.id);
      if (!byKey.has(key)) byKey.set(key, { key, patientCode: code, cases: [] });
      byKey.get(key).cases.push(item);
    }
    return [...byKey.values()].map(summarizePatient);
  }

  function summarizePatient(row) {
    const cases = row.cases;
    const notes = cases.flatMap((c) => arr(c.soapNotes).map((n) => ({ caseId: c.id, note: n })));
    const dates = notes.map((x) => str(x.note.visitDate)).filter(Boolean).sort();
    const lastVisit = dates.length ? dates[dates.length - 1] : "";
    // 主要病例:治療中的病例裡最近就診的那一個;沒有治療中的就用最近就診的。
    const lastOf = (c) => arr(c.soapNotes).map((n) => str(n.visitDate)).filter(Boolean).sort().pop() || "";
    const ordered = [...cases].sort((a, b) => {
      const act = (str(b.status || "active") === "active") - (str(a.status || "active") === "active");
      return act || lastOf(b).localeCompare(lastOf(a)) || str(b.updatedAt).localeCompare(str(a.updatedAt));
    });
    const primary = ordered[0];
    // 關注度:取治療中病例裡最需要注意的那一個(重點 > 疑難 > 一般)。
    const pool = cases.filter((c) => str(c.status || "active") === "active");
    const tiered = (pool.length ? pool : cases).filter((c) => tierOf(c));
    tiered.sort((a, b) => CASE_TIERS[tierOf(a)].rank - CASE_TIERS[tierOf(b)].rank);
    const tierCase = tiered[0] || null;
    const union = (pick) => [...new Set(cases.flatMap((c) => arr(c[pick]).map(str).filter(Boolean)))];
    return {
      key: row.key,
      patientCode: row.patientCode,
      cases: ordered,
      primaryCaseId: primary ? primary.id : "",
      statuses: [...new Set(cases.map((c) => str(c.status || "active")))],
      tier: tierCase ? tierOf(tierCase) : "",
      tierSince: tierCase ? str(tierCase.attentionSince) : "",
      icpc: union("icpcChapters").filter((k) => ICPC2_CHAPTERS[k]),
      contexts: union("careContexts").filter((k) => CARE_CONTEXTS[k]),
      safetyFlags: union("safetyFlags"),
      clinic: (cases.find((c) => CLINIC_SITES[c.clinicSite]) || {}).clinicSite || "",
      chiefComplaint: str(primary && primary.chiefComplaint),
      lastVisit,
      visitCount: notes.length,
      undatedCount: notes.filter((x) => !str(x.note.visitDate)).length,
    };
  }

  // 內文欄位。label 是畫面上告訴使用者「在哪裡找到」的字。
  const CASE_BODY_FIELDS = [
    ["chiefComplaint", "主訴"], ["caseCategory", "類別"], ["westernConditions", "西醫診斷"], ["easternDiseases", "中醫病名"],
    ["tcmPatterns", "證型"], ["safetyFlags", "紅旗"], ["historyPresent", "現病史"], ["currentMeds", "目前用藥"], ["summary", "摘要"],
  ];
  const NOTE_BODY_FIELDS = [
    ["pointsUsed", "用穴"], ["acupointLinks", "用穴"], ["formulaHerbs", "方藥"], ["formulaLinks", "方劑"], ["herbLinks", "中藥"],
    ["subjective", "S"], ["objective", "O"], ["assessment", "A"], ["plan", "P"], ["tcmPattern", "證型紀錄"],
    ["treatmentPrinciple", "治法"], ["pathomechanism", "病機"], ["tongueBody", "舌"], ["tongueCoating", "苔"], ["pulse", "脈"],
    ["westernMeds", "西藥"], ["outcomes", "療效"], ["followUp", "追蹤"], ["advice", "衛教"], ["technique", "手法"],
    ["tcmPatternLinks", "證型"], ["westernConditionLinks", "西醫診斷"], ["easternDiseaseLinks", "中醫病名"], ["medicationLinks", "西藥"],
  ];
  const flat = (v) => (Array.isArray(v) ? v.map(str).join("、") : str(v));

  function bodyFieldsOf(patient) {
    const out = [];
    const tagText = [
      patient.tier ? CASE_TIERS[patient.tier].zh : "",
      ...patient.icpc.map((k) => k + " " + ICPC2_CHAPTERS[k].zh),
      ...patient.contexts.map((k) => CARE_CONTEXTS[k].zh),
      patient.clinic ? CLINIC_SITES[patient.clinic].zh : "",
    ].filter(Boolean).join("、");
    if (tagText) out.push({ label: "標籤", text: tagText, where: "" });
    for (const c of patient.cases) {
      const where = patient.cases.length > 1 ? str(c.caseTitle) : "";
      for (const [k, label] of CASE_BODY_FIELDS) { const t = flat(c[k]); if (t) out.push({ label, text: t, where, caseId: c.id }); }
      const notes = [...arr(c.soapNotes)];
      notes.forEach((n) => {
        const visit = (n.visitNumber ? "第 " + n.visitNumber + " 診" : "SOAP") + " · " + (str(n.visitDate) ? str(n.visitDate).slice(5).replace("-", "/") : "日期未填");
        for (const [k, label] of NOTE_BODY_FIELDS) { const t = flat(n[k]); if (t) out.push({ label, text: t, where: visit, caseId: c.id, noteId: n.id }); }
      });
    }
    return out;
  }

  // 搜尋:全部 token 都要在同一位病人身上出現(AND)。身分欄全中 → identity 組;否則內文全中 → content 組。
  function searchPatients(patients, query) {
    const tokens = tokenize(query);
    if (!tokens.length) return { tokens, identity: arr(patients).map((p) => ({ patient: p, hit: null })), content: [] };
    const identity = [], content = [];
    for (const p of arr(patients)) {
      const idText = norm([p.patientCode, ...p.cases.map((c) => c.caseTitle)].join(" "));
      if (tokens.every((t) => idText.includes(t))) { identity.push({ patient: p, hit: null }); continue; }
      const fields = bodyFieldsOf(p);
      const all = idText + " " + norm(fields.map((f) => f.label + " " + f.text).join(" "));
      if (!tokens.every((t) => all.includes(t))) continue;
      // 說明列:優先挑「身分欄沒中的那個 token」實際出現的欄位,那才是這位病人被找到的原因。
      const reason = tokens.find((t) => !idText.includes(t)) || tokens[0];
      const hit = fields.find((f) => norm(f.text).includes(reason)) || fields.find((f) => norm(f.label).includes(reason)) || null;
      content.push({ patient: p, hit });
    }
    return { tokens, identity, content };
  }

  function daysBetween(fromIso, today) {
    return Math.round((Date.parse(localIso(today)) - Date.parse(fromIso)) / 86400000);
  }
  function localIso(d) {
    const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().slice(0, 10);
  }

  // 篩選。f 的每個鍵都是可選的;"all"/""/false 代表不篩。
  function patientPassesFilters(p, f, today) {
    f = f || {};
    if (f.tier && f.tier !== "all") {
      const t = p.tier || "routine";
      if (t !== f.tier) return false;
    }
    if (f.icpc && !p.icpc.includes(f.icpc)) return false;
    if (f.clinic && f.clinic !== "all" && p.clinic !== f.clinic) return false;
    if (f.status && f.status !== "all" && !p.statuses.includes(f.status)) return false;
    if (f.flagged && !p.safetyFlags.length) return false;
    if (f.undated && !p.undatedCount) return false;
    if (f.recentDays) {
      if (!p.lastVisit) return false;
      if (daysBetween(p.lastVisit, today || new Date()) > Number(f.recentDays)) return false;
    }
    return true;
  }

  function sortPatients(rows, sort, pick) {
    const get = pick || ((r) => r);
    const last = (r) => get(r).lastVisit || "";
    const rank = (r) => (CASE_TIERS[get(r).tier] || CASE_TIERS.routine).rank;
    const cmp = {
      tier: (a, b) => rank(a) - rank(b) || last(b).localeCompare(last(a)) || get(a).patientCode.localeCompare(get(b).patientCode),
      recent: (a, b) => last(b).localeCompare(last(a)) || get(a).patientCode.localeCompare(get(b).patientCode),
      code: (a, b) => get(a).patientCode.localeCompare(get(b).patientCode),
      visits: (a, b) => get(b).visitCount - get(a).visitCount || last(b).localeCompare(last(a)),
    }[sort] || null;
    return cmp ? [...rows].sort(cmp) : [...rows];
  }

  // 一次做完:分組 → 搜尋 → 篩選 → 排序。app.js 的列表只呼叫這一個。
  function buildPatientList(cases, opts) {
    opts = opts || {};
    const patients = groupCasesByPatient(cases);
    const res = searchPatients(patients, opts.query || "");
    const pass = (x) => patientPassesFilters(x.patient, opts.filters, opts.today);
    const identity = sortPatients(res.identity.filter(pass), opts.sort || "tier", (x) => x.patient);
    const content = sortPatients(res.content.filter(pass), opts.sort || "tier", (x) => x.patient);
    return {
      tokens: res.tokens,
      identity,
      content,
      total: identity.length + content.length,
      patientCount: patients.length,
      hiddenByFilters: (res.identity.length + res.content.length) - (identity.length + content.length),
      usedIcpc: Object.keys(ICPC2_CHAPTERS).filter((k) => patients.some((p) => p.icpc.includes(k))),
    };
  }

  function focusNeedsReview(tierSince, today) {
    if (!tierSince) return false;
    return daysBetween(tierSince.slice(0, 10), today || new Date()) >= FOCUS_REVIEW_DAYS;
  }

  const api = {
    CASE_TIERS, ICPC2_CHAPTERS, CARE_CONTEXTS, CLINIC_SITES, FOCUS_REVIEW_DAYS, ETHNICITY_LETTERS,
    parsePatientCode, groupCasesByPatient, searchPatients, patientPassesFilters, sortPatients, buildPatientList,
    focusNeedsReview, tokenize, daysBetween,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.AcuTingCaseSearch = api;
})(typeof window !== "undefined" ? window : globalThis);
