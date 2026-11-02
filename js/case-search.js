/* case-search.js — 病例頁的「病人列表 + 搜尋 + 篩選 + 標籤」純函式層(2026-10-31 起,D34)。
 *
 * 為什麼獨立成檔:搜尋與分組過去寫死在 app.js 的 getFilteredClinicalCases 裡,
 * 只能在瀏覽器裡測。這裡全部是純函式(輸入病例陣列,輸出列表模型),不碰 DOM、
 * 不碰儲存層,所以 scripts/validate-case-search.js 可以直接在 node 裡跑真值表。
 *
 * 設計規則(Ting 2026-10-29/31、11/02 的需求):
 *   1. 以「病人」為單位列出(一個 patientCode 一列),同一位病人的多個病例收在詳情的分頁。
 *   2. 搜尋分兩組:代號/病例名稱命中(身分欄)排前面,只在內文命中的排後面,並說出
 *      「在哪一診、哪個欄位」找到(見 memory: search identity fields beat body fields)。
 *   3. 病例標題統一格式(11/02 Ting 的 Clinical Case Labeling Standard):
 *        [★/☆/✨] [顯示代號] [性別/年齡] [主❤️] [次❤️…] [🌙] + 主訴
 *        例:★ AQZ F/41 🧡 💜 🌓
 *      - 顯示代號 = 族群字母 + 名姓縮寫(AQZ),只是給人看的,不唯一;病人的永久鍵仍是 patientCode。
 *      - 性別/年齡 每次顯示時從性別、出生年算,不寫進代號(年齡會變)。
 *      - 星星、月亮沒有確認過就不顯示 —— 不替她假定「一般」或「治療中」。
 *      存英文代碼,Emoji 只是畫面標籤。🚩 紅旗是獨立的臨床安全欄,不跟這三層混用。
 *      分類建議只顯示、要她按了才寫入;🖤 複雜不在建議裡,一定是她自己判斷。
 */
(function (global) {
  "use strict";

  // ❤️ 疾病類別(Ting 2026-11-02)。代碼穩定、可存可查;icon/zh/en 只給畫面用。
  const CASE_CATEGORIES = {
    derm_wellness: { icon: "🤍", zh: "皮膚/保健", en: "Dermatology / Wellness" },
    womens_health: { icon: "🩷", zh: "婦科/生殖", en: "Women's Health" },
    cardiovascular: { icon: "❤️", zh: "心血管", en: "Cardiovascular" },
    musculoskeletal: { icon: "🧡", zh: "肌肉骨骼/疼痛", en: "Musculoskeletal / Pain" },
    gi_metabolic: { icon: "💛", zh: "消化/代謝", en: "GI / Metabolic" },
    respiratory_immune: { icon: "💚", zh: "呼吸/免疫", en: "Respiratory / Immune" },
    urinary_renal: { icon: "🩵", zh: "泌尿/腎", en: "Urinary / Renal" },
    neuro_ent: { icon: "💙", zh: "神經/頭面五官/眼", en: "Neurology / ENT / Eye" },
    mental_sleep: { icon: "💜", zh: "情緒/睡眠", en: "Mental Health / Sleep" },
    complex: { icon: "🖤", zh: "複雜/多系統", en: "Complex / Multisystem" },
  };
  const MAX_SECONDARY_CATEGORIES = 2;

  // 🌙 治療進度(treatmentStage)。"" = 還沒確認 → 不顯示月亮。
  // 舊的 status 欄(active/paused/closed,空值預設 active)仍在,app 存檔時跟著月亮同步,
  // 但月亮只看 treatmentStage —— 不能因為舊欄位預設 active 就畫出 🌓。
  const CASE_STAGES = {
    new: { icon: "🌑", zh: "初診", en: "New", legacyStatus: "active" },
    active: { icon: "🌓", zh: "治療中", en: "Active", legacyStatus: "active" },
    followup: { icon: "🌙", zh: "待追蹤", en: "Follow-up", legacyStatus: "paused" },
    closed: { icon: "🌕", zh: "結案", en: "Closed", legacyStatus: "closed" },
  };

  // ★ 病例價值。"" = 還沒標 → 不顯示星星(☆ 一般也是她要選的)。rank 小的排前面。
  const CASE_HIGHLIGHTS = {
    important: { icon: "★", zh: "重要教學", en: "Important / Educational", rank: 0 },
    notable: { icon: "✨", zh: "明顯療效", en: "Notable treatment response", rank: 1 },
    routine: { icon: "☆", zh: "一般", en: "Routine", rank: 2 },
  };

  // 跨系統、會改變你怎麼治療的情境(選填,不是分類)。
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

  // 10/31 的關注度與 ICPC-2 已被上面三層取代。欄位(attentionTier / icpcChapters)還留在資料契約裡
  // (契約只准加不准減),畫面不再讀寫;這兩張表留著只為了舊匯出檔的說明與相容。
  const CASE_TIERS = {
    focus: { zh: "重點", en: "Focus", rank: 0 },
    complex: { zh: "疑難", en: "Complex", rank: 1 },
    routine: { zh: "一般", en: "Routine", rank: 2 },
  };
  const ICPC2_CHAPTERS = {
    A: { zh: "一般/全身" }, B: { zh: "血液/免疫" }, D: { zh: "消化" }, F: { zh: "眼" }, H: { zh: "耳" },
    K: { zh: "心血管" }, L: { zh: "肌肉骨骼" }, N: { zh: "神經" }, P: { zh: "心理/情志" }, R: { zh: "呼吸" },
    S: { zh: "皮膚" }, T: { zh: "內分泌/代謝" }, U: { zh: "泌尿" }, W: { zh: "妊娠/生育" }, X: { zh: "女性生殖" },
    Y: { zh: "男性生殖" }, Z: { zh: "社會問題" },
  };

  // 顯示代號(Ting 2026-11-02):族群字母 + 名姓縮寫,例 AQZ。只用已確認的資料,不從姓名猜族群。
  const DISPLAY_CODE_RE = /^([A-Za-z])([A-Za-z]{1,4})$/;
  const ETHNICITY_LETTERS = { A: "亞洲 Asian", B: "黑人 Black", W: "白人 White", M: "墨西哥 Mexican / Latino" };
  function parseDisplayCode(code) {
    const t = String(code || "").trim().replace(/[\s.-]+/g, "");
    const m = DISPLAY_CODE_RE.exec(t);
    if (!m) return null;
    const letter = m[1].toUpperCase();
    return { code: t.toUpperCase(), ethnicityLetter: letter, ethnicity: ETHNICITY_LETTERS[letter] || "", initials: m[2].toUpperCase() };
  }
  // 合格就回大寫正規化後的代號,不合格回原字串(trim 過),讓呼叫端照樣報格式錯。
  function normalizeDisplayCode(code) {
    const p = parseDisplayCode(code);
    return p ? p.code : String(code || "").trim();
  }

  const str = (v) => (v === null || v === undefined ? "" : String(v));
  const arr = (v) => (Array.isArray(v) ? v : []);
  const norm = (v) => str(v).toLowerCase();
  const tokenize = (q) => norm(q).split(/[\s,，、;；]+/).filter(Boolean);

  // 性別字母:只認病歷上明確的值;其他寫法不猜。
  function sexLetterOf(item) {
    const t = str(item && item.sex).trim().toLowerCase();
    if (t === "f" || t === "female" || t.startsWith("女")) return "F";
    if (t === "m" || t === "male" || t.startsWith("男")) return "M";
    if (t === "other" || t === "x") return "X";
    return "";
  }
  // 年齡:有出生年月就算到月;只有出生年就用年相減(可能差一歲,但不另外猜);都沒有回 null。
  function ageOf(item, today) {
    const now = today || new Date();
    const ym = /^(\d{4})-(\d{2})/.exec(str(item && item.birthYearMonth));
    if (ym) {
      const months = (now.getFullYear() - Number(ym[1])) * 12 + (now.getMonth() + 1 - Number(ym[2]));
      return months >= 0 ? Math.floor(months / 12) : null;
    }
    const y = Number(str(item && item.birthYear));
    if (Number.isInteger(y) && y >= 1900 && y <= now.getFullYear()) return now.getFullYear() - y;
    return null;
  }
  // 「F/41」;缺哪一半就只顯示有的那一半,兩半都沒有回 ""。
  function sexAgeLabel(item, today) {
    const s = sexLetterOf(item), a = ageOf(item, today);
    if (s && a !== null) return `${s}/${a}`;
    if (s) return s;
    if (a !== null) return `/${a}`;
    return "";
  }

  const highlightOf = (item) => (CASE_HIGHLIGHTS[item && item.caseHighlight] ? item.caseHighlight : "");
  const stageOf = (item) => (CASE_STAGES[item && item.treatmentStage] ? item.treatmentStage : "");
  const categoryOf = (item) => (CASE_CATEGORIES[item && item.categoryPrimary] ? item.categoryPrimary : "");
  const secondaryOf = (item) => [...new Set(arr(item && item.categorySecondary).map(str))]
    .filter((k) => CASE_CATEGORIES[k] && k !== categoryOf(item)).slice(0, MAX_SECONDARY_CATEGORIES);
  // 舊的 status 欄只拿來挑「主要病例」:空值當 active(與 normalizer 一致)。
  const inTreatment = (item) => {
    const st = stageOf(item);
    if (st) return st === "new" || st === "active";
    return (str(item && item.status) || "active") === "active";
  };

  // 一個病例的標題各段(列表、詳情、SOAP 頁共用同一份,不各自拼字串)。
  function caseLabel(item, today) {
    return {
      highlight: highlightOf(item),
      displayCode: normalizeDisplayCode(item && item.displayCode),
      sexAge: sexAgeLabel(item, today),
      primary: categoryOf(item),
      secondary: secondaryOf(item),
      stage: stageOf(item),
    };
  }
  // 純文字版(對話框標題等):★ AQZ F/41 🧡 💜 🌓
  function caseLabelText(item, today) {
    const l = caseLabel(item, today);
    return [
      l.highlight ? CASE_HIGHLIGHTS[l.highlight].icon : "",
      l.displayCode,
      l.sexAge,
      l.primary ? CASE_CATEGORIES[l.primary].icon : "",
      ...l.secondary.map((k) => CASE_CATEGORIES[k].icon),
      l.stage ? CASE_STAGES[l.stage].icon : "",
    ].filter(Boolean).join(" ");
  }

  // 病例 → 病人列。一個 patientCode 一列;沒有代號的病例各自一列(不把它們湊成同一個人)。
  function groupCasesByPatient(cases, today) {
    const byKey = new Map();
    for (const item of arr(cases)) {
      const code = str(item.patientCode).trim();
      const key = code ? "code:" + code : "case:" + str(item.id);
      if (!byKey.has(key)) byKey.set(key, { key, patientCode: code, cases: [] });
      byKey.get(key).cases.push(item);
    }
    return [...byKey.values()].map((row) => summarizePatient(row, today));
  }

  function summarizePatient(row, today) {
    const cases = row.cases;
    const notes = cases.flatMap((c) => arr(c.soapNotes).map((n) => ({ caseId: c.id, note: n })));
    const dates = notes.map((x) => str(x.note.visitDate)).filter(Boolean).sort();
    const lastVisit = dates.length ? dates[dates.length - 1] : "";
    // 主要病例:治療中(含初診)的病例裡最近就診的那一個;沒有的話用最近就診的。
    const lastOf = (c) => arr(c.soapNotes).map((n) => str(n.visitDate)).filter(Boolean).sort().pop() || "";
    const ordered = [...cases].sort((a, b) => {
      const act = inTreatment(b) - inTreatment(a);
      return act || lastOf(b).localeCompare(lastOf(a)) || str(b.updatedAt).localeCompare(str(a.updatedAt));
    });
    const primary = ordered[0];
    // 病人層的顯示代號 / 性別年齡:主要病例有就用它的,沒有就找其他病例有填的。
    const firstWith = (fn) => ordered.find((c) => fn(c)) || null;
    const codeCase = firstWith((c) => str(c.displayCode).trim());
    const sexAgeCase = firstWith((c) => sexAgeLabel(c, today));
    // ★ 取所有病例裡最高的那顆(重要 > 療效 > 一般)。
    const starred = cases.filter((c) => highlightOf(c)).sort((a, b) => CASE_HIGHLIGHTS[highlightOf(a)].rank - CASE_HIGHLIGHTS[highlightOf(b)].rank);
    const union = (pick) => [...new Set(cases.flatMap((c) => arr(c[pick]).map(str).filter(Boolean)))];
    const categories = [...new Set(cases.flatMap((c) => [categoryOf(c), ...secondaryOf(c)]).filter(Boolean))];
    return {
      key: row.key,
      patientCode: row.patientCode,
      cases: ordered,
      primaryCaseId: primary ? primary.id : "",
      label: primary ? caseLabel(primary, today) : caseLabel({}, today),
      displayCode: codeCase ? normalizeDisplayCode(codeCase.displayCode) : "",
      sexAge: sexAgeCase ? sexAgeLabel(sexAgeCase, today) : "",
      stage: primary ? stageOf(primary) : "",
      stages: [...new Set(cases.map(stageOf))],   // 含 "" = 未確認
      highlight: starred.length ? highlightOf(starred[0]) : "",
      category: primary && categoryOf(primary) ? categoryOf(primary) : (cases.map(categoryOf).find(Boolean) || ""),
      categories,
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
      ...patient.categories.map((k) => CASE_CATEGORIES[k].zh),
      patient.highlight ? CASE_HIGHLIGHTS[patient.highlight].zh : "",
      ...patient.stages.filter(Boolean).map((k) => CASE_STAGES[k].zh),
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
  // 身分欄 = 病人編號 + 顯示代號 + 病例名稱。
  function searchPatients(patients, query) {
    const tokens = tokenize(query);
    if (!tokens.length) return { tokens, identity: arr(patients).map((p) => ({ patient: p, hit: null })), content: [] };
    const identity = [], content = [];
    for (const p of arr(patients)) {
      const idText = norm([p.patientCode, p.displayCode, ...p.cases.map((c) => c.caseTitle)].join(" "));
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

  // 「未分類」= 還沒選主要疾病類別(❤️)。給 Ting 逐位補標籤時用:列出還剩誰。
  function isUntagged(p) {
    return !p.category;
  }

  // 篩選。f 的每個鍵都是可選的;"all"/""/false 代表不篩。highlight/stage 可用 "unset" 找沒標過的。
  function patientPassesFilters(p, f, today) {
    f = f || {};
    if (f.highlight && f.highlight !== "all") {
      if (f.highlight === "unset" ? p.highlight : p.highlight !== f.highlight) return false;
    }
    if (f.category && !p.categories.includes(f.category)) return false;
    if (f.clinic && f.clinic !== "all" && p.clinic !== f.clinic) return false;
    if (f.stage && f.stage !== "all") {
      if (!p.stages.includes(f.stage === "unset" ? "" : f.stage)) return false;
    }
    if (f.flagged && !p.safetyFlags.length) return false;
    if (f.undated && !p.undatedCount) return false;
    if (f.untagged && !isUntagged(p)) return false;
    if (f.recentDays) {
      if (!p.lastVisit) return false;
      if (daysBetween(p.lastVisit, today || new Date()) > Number(f.recentDays)) return false;
    }
    return true;
  }

  function sortPatients(rows, sort, pick) {
    const get = pick || ((r) => r);
    const last = (r) => get(r).lastVisit || "";
    const rank = (r) => (CASE_HIGHLIGHTS[get(r).highlight] ? CASE_HIGHLIGHTS[get(r).highlight].rank : 3);
    const name = (r) => get(r).displayCode || get(r).patientCode;
    const byHighlight = (a, b) => rank(a) - rank(b) || last(b).localeCompare(last(a)) || name(a).localeCompare(name(b));
    const cmp = {
      highlight: byHighlight,
      tier: byHighlight,   // 10/31 的排序鍵名,舊設定照樣能用
      recent: (a, b) => last(b).localeCompare(last(a)) || name(a).localeCompare(name(b)),
      code: (a, b) => name(a).localeCompare(name(b)),
      visits: (a, b) => get(b).visitCount - get(a).visitCount || last(b).localeCompare(last(a)),
    }[sort] || null;
    return cmp ? [...rows].sort(cmp) : [...rows];
  }

  // 一次做完:分組 → 搜尋 → 篩選 → 排序。app.js 的列表只呼叫這一個。
  function buildPatientList(cases, opts) {
    opts = opts || {};
    const patients = groupCasesByPatient(cases, opts.today);
    const res = searchPatients(patients, opts.query || "");
    const pass = (x) => patientPassesFilters(x.patient, opts.filters, opts.today);
    const identity = sortPatients(res.identity.filter(pass), opts.sort || "highlight", (x) => x.patient);
    const content = sortPatients(res.content.filter(pass), opts.sort || "highlight", (x) => x.patient);
    return {
      tokens: res.tokens,
      identity,
      content,
      total: identity.length + content.length,
      patientCount: patients.length,
      hiddenByFilters: (res.identity.length + res.content.length) - (identity.length + content.length),
      untaggedCount: patients.filter(isUntagged).length,
      usedCategories: Object.keys(CASE_CATEGORIES).filter((k) => patients.some((p) => p.categories.includes(k))),
    };
  }

  // ---- ❤️ 分類建議(依主訴 / 病例名稱的關鍵字)----
  // 只是建議:畫面上顯示「為什麼」(命中哪些字),要她按了才寫入。命中兩類以上就照命中數排,
  // 不替她選;一個字都沒中就回空陣列。🖤 複雜不在這裡 —— 多系統不等於複雜病例,要她判斷。
  const CATEGORY_KEYWORDS = {
    musculoskeletal: ["腰", "背痛", "頸", "肩", "膝", "髖", "臀", "坐骨", "肘", "腕", "踝", "足跟", "關節", "扭傷", "肌肉", "骨", "筋膜", "落枕",
      "sciatica", "back pain", "neck pain", "shoulder", "knee", "hip", "elbow", "ankle", "joint", "lumbar", "cervicalgia", "epicondyl"],
    neuro_ent: ["頭痛", "偏頭痛", "眩暈", "暈", "中風", "顏面", "面癱", "麻木", "神經病變", "耳鳴", "耳", "眼", "視力", "失明", "口齒", "言語",
      "headache", "migraine", "vertigo", "dizz", "stroke", "facial", "numb", "neuropathy", "tinnitus", "vision", "dysarthria"],
    mental_sleep: ["失眠", "睡眠", "入睡", "難眠", "多夢", "焦慮", "憂鬱", "抑鬱", "情緒", "壓力", "恐慌", "insomnia", "sleep", "anxiety", "depress", "stress", "panic"],
    womens_health: ["月經", "經期", "痛經", "經前", "孕", "妊娠", "產後", "婦", "IVF", "不孕", "備孕", "更年期", "停經", "PCOS", "乳",
      "menstrua", "pregnan", "fertility", "postpartum", "menopaus", "dysmenorrhea"],
    gi_metabolic: ["胃", "腹脹", "腹痛", "腹瀉", "便秘", "腸", "逆流", "消化", "噁心", "糖尿病", "血糖", "代謝", "甲狀腺", "肥胖",
      "IBS", "GERD", "reflux", "constipation", "diarrhea", "nausea", "diabetes", "thyroid"],
    respiratory_immune: ["咳", "喘", "鼻炎", "過敏", "感冒", "打呼", "鼻塞", "COPD", "氣短", "免疫",
      "cough", "asthma", "allerg", "rhinitis", "snoring", "copd", "immune"],
    cardiovascular: ["心悸", "高血壓", "血壓", "胸悶", "心臟", "靜脈曲張", "水腫", "palpitation", "hypertension", "blood pressure", "cardiac", "varicos"],
    urinary_renal: ["頻尿", "尿急", "排尿", "尿失禁", "夜尿", "泌尿", "腎", "膀胱", "攝護腺", "前列腺", "urinary", "kidney", "renal", "bladder", "prostat"],
    derm_wellness: ["皮膚", "濕疹", "痘", "掉髮", "落髮", "脫髮", "美容", "保健", "蕁麻疹", "足潰瘍", "皮膚潰瘍", "eczema", "acne", "alopecia", "hair loss", "skin", "wellness"],
  };
  function suggestCategories(item) {
    const text = norm([item && item.chiefComplaint, item && item.caseTitle].map(str).join(" "));
    if (!text.trim()) return [];
    const out = [];
    for (const [code, words] of Object.entries(CATEGORY_KEYWORDS)) {
      const hits = words.filter((w) => text.includes(norm(w)));
      if (hits.length) out.push({ code, hits });
    }
    out.sort((a, b) => b.hits.length - a.hits.length || Object.keys(CASE_CATEGORIES).indexOf(a.code) - Object.keys(CASE_CATEGORIES).indexOf(b.code));
    return out;
  }

  // ---- 顯示代號批次設定(舊病人一次補上 AQZ 這種代號)----
  // 只寫 displayCode,不碰 patientCode —— 病人的永久鍵不變,所以換代號不會把病人拆成兩個。
  // 新代號只來自 Ting 逐位輸入,這裡只檢查:格式不符 → 錯誤;族群字母不在 A/B/W/M → 警告;
  // 跟別人同代號 → 只提示(顯示代號本來就不唯一)。
  function planDisplayCodes(cases, mapping) {
    const patients = groupCasesByPatient(cases);
    const rows = patients.map((p) => {
      const typed = str((mapping || {})[p.key]).trim();
      const next = typed ? normalizeDisplayCode(typed) : "";
      const row = { key: p.key, patientCode: p.patientCode, current: p.displayCode, newCode: next, status: "unchanged",
        errors: [], warnings: [], caseIds: p.cases.map((c) => c.id) };
      if (!next || next === p.displayCode) return row;
      const parsed = parseDisplayCode(next);
      if (!parsed) row.errors.push("格式:族群字母 + 名姓縮寫,例 AQZ(只用字母)");
      else if (!ETHNICITY_LETTERS[parsed.ethnicityLetter]) row.warnings.push(`族群字母 ${parsed.ethnicityLetter} 不在 A/B/W/M 裡,確定嗎?`);
      row.status = row.errors.length ? "error" : "ok";
      return row;
    });
    // 同代號提示:顯示代號不唯一沒關係,但讓她知道列表上會有兩個長得一樣的
    const finalCode = new Map(rows.map((r) => [r.key, r.status === "ok" ? r.newCode : r.current]));
    const count = new Map();
    for (const c of finalCode.values()) if (c) count.set(c, (count.get(c) || 0) + 1);
    for (const r of rows) if (r.status === "ok" && count.get(r.newCode) > 1) r.warnings.push(`另有病人也是 ${r.newCode}(不影響資料,列表靠性別/年齡/主訴區分)`);
    const changes = rows.filter((r) => r.status === "ok");
    return { rows, changes, blocked: rows.filter((r) => r.status === "error").length };
  }
  // 只在完全沒有錯誤時套用;回傳新的病例陣列(不改原陣列)。
  function applyDisplayCodes(cases, plan) {
    if (plan.blocked) throw new Error("plan has errors — refuse to apply");
    const byCase = new Map();
    for (const r of plan.changes) for (const id of r.caseIds) byCase.set(id, r.newCode);
    return cases.map((c) => (byCase.has(c.id) ? Object.assign({}, c, { displayCode: byCase.get(c.id) }) : c));
  }

  const api = {
    CASE_CATEGORIES, MAX_SECONDARY_CATEGORIES, CASE_STAGES, CASE_HIGHLIGHTS, CARE_CONTEXTS, CLINIC_SITES,
    CASE_TIERS, ICPC2_CHAPTERS, ETHNICITY_LETTERS,
    parseDisplayCode, normalizeDisplayCode, sexLetterOf, ageOf, sexAgeLabel, highlightOf, stageOf, categoryOf, secondaryOf,
    caseLabel, caseLabelText,
    groupCasesByPatient, searchPatients, patientPassesFilters, sortPatients, buildPatientList, suggestCategories,
    tokenize, daysBetween, isUntagged, planDisplayCodes, applyDisplayCodes,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.AcuTingCaseSearch = api;
})(typeof window !== "undefined" ? window : globalThis);
