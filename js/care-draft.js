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
 *   - 出生年月只輸出粗略年齡層,絕不輸出精確年份
 *   - publicationConsent 不是 "granted" 時,顯示醒目 ⚠️ 區塊,但產生器照常執行
 *     (不同意不代表不能整理草稿,只代表投稿前不能送出)
 *
 * ---------------------------------------------------------------------------
 * PHI 邊界(2026-08-14,Ting ruling;CODEX AUDIT #1/#2)
 *
 * 這支的檔頭原本寫著「沒有 PHI 進出」。那句話是錯的,而且錯得危險 —— 它讓
 * 「產生草稿」看起來像一個安全動作。草稿依設計必然包含病人資訊:
 *   - 精確就診日期(CARE 7 Timeline 的全部價值就在日期)
 *   - 主訴/病史/評估/計畫的**原文照錄**
 *   - 病人原話(CARE 12 Patient perspective)
 * 舊版還額外把 patientCode 寫進第一行 HTML 註解、把 caseTitle 寫進下載檔名。
 * 前者是 D1 拿去算 patientId 的那個字串,後者是使用者自訂欄位 —— 兩個都可能
 * 直接就是姓名,而檔名是連打開檔案都不用就看得到的地方。檔案一旦落進下載
 * 資料夾,就會被雲端同步、被順手轉寄。「只在本機下載」不是一個邊界。
 *
 * 現在的規則:
 *   1. patientCode 一律不輸出 —— 連 HTML 註解都不行
 *   2. caseTitle 一律不輸出,也不進檔名;標題改用診斷標籤(知識庫詞彙)
 *   3. 每份草稿最上方掛「含 PHI」黑框,並列出它為什麼含
 *   4. 掃描直接識別碼(K1 電話 / K2 Email / K3 SSN / K5 病歷號 / K6 疑似姓名),
 *      掃到就逐條列出章節與遮蔽樣本
 *   5. **掃不到不等於乾淨** —— 本產生器永遠不宣稱任何一份草稿可以外流。
 *      FORBIDDEN_CLEARANCE_CLAIMS 把這條變成機器可驗的:
 *      scripts/validate-care-draft-phi.js 逐條斷言那些措辭不出現在輸出裡。
 * ---------------------------------------------------------------------------
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

  /* --- PHI 邊界機具(檔頭第 1-5 條的實作) ------------------------------- */

  /* 直接識別碼樣式。K1/K2/K3/K5 的正則**刻意與
   * scripts/validate-clinical-case-standard.js 的 PHI_PATTERNS 同源** ——
   * 同一個問題只能有一把尺,兩邊各寫一版就是下一次漂移。
   *
   * K4(完整日期)不在這裡,而且是故意的:草稿裡每一個就診日期都會命中它,
   * 幾十筆命中會把真正的訊號淹掉。日期改成黑框裡「一定含有」那一欄,直接
   * 報數量 —— 宣告比掃描誠實,因為日期不是「可能有」,是必然有。
   *
   * K6 是新的,只有這裡有:姓名沒有可靠的機器特徵,所以 K6 只抓「稱謂鉤子」
   * (Mr./Dr. + 大寫字、中文姓氏 + 先生/女士/小姐…)。它會誤報,而誤報在這裡
   * 是可接受的 —— 這是提醒欄不是資料驗證器,寧可多喊一次。 */
  const IDENTIFIER_PATTERNS = [
    { id: "K1", label: "電話號碼 phone", re: /(?:\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g },
    { id: "K2", label: "Email", re: /[\w.+-]+@[\w-]+\.[\w.]{2,}/g },
    { id: "K3", label: "社會安全號碼 SSN", re: /\b\d{3}-\d{2}-\d{4}\b/g },
    { id: "K5", label: "病歷號/保險號 MRN", re: /\b(?:MRN|Member\s*ID|Policy\s*(?:No|Number|#)|Chart\s*(?:No|#)|病歷號碼|病歷編號|病歷號|健保卡號)\s*[:：#]?\s*[A-Za-z0-9-]{3,}/gi },
    { id: "K6", label: "疑似姓名 probable name", re: /(?:\b(?:Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-Z][a-z]{1,20}\b)|(?:[一-鿿]{1,3}(?:先生|女士|小姐|太太))/g },
  ];

  const EXACT_DATE_RE = /\b(?:19|20)\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])\b/g;

  /* 「這份檔案已經清乾淨了」的各種說法。一句都不准出現在草稿裡 ——
   * 產生器沒有能力做那個判斷,說了就是在替使用者背書。
   * 注意黑框自己的用字必須避開這張表(例如寫「未去識別」而不是「非已去識別」,
   * 英文寫 "nothing has been removed" 而不是 "not de-identified"),
   * 否則安全宣告會被自己的斷言判定為違規。 */
  const FORBIDDEN_CLEARANCE_CLAIMS = [
    "已去識別", "去識別完成", "已完成去識別", "去識別已完成",
    "不含 PHI", "不含PHI", "無 PHI", "無PHI", "沒有 PHI", "沒有PHI",
    "可安全分享", "安全可分享", "可安全外流", "可直接投稿",
    "de-identified", "deidentified", "de identified",
    "anonymized", "anonymised", "phi-free", "no phi", "contains no phi",
  ];

  /* 遮蔽:留頭留尾,中間換成 …。黑框本身、validator 的 console 輸出都用這個 ——
   * 「提醒你這裡有電話」不需要把電話再印一次。 */
  function redactSample(s) {
    const str = String(s || "").trim();
    if (str.length <= 2) return "…";
    if (str.length <= 4) return `${str[0]}…${str[str.length - 1]}`;
    return `${str.slice(0, 2)}…${str.slice(-1)}`;
  }

  /* 掃描的是**產生出來的草稿全文**,不是病例物件 —— 要守的是真正出門的那份
   * 東西。回傳每一筆命中的所在章節(最近的一個標題),不回傳行號:黑框會被
   * 貼到檔案最上面,行號會整份位移,章節不會。 */
  function scanIdentifiers(text) {
    const lines = String(text || "").split("\n");
    const findings = [];
    let section = "(標頭)";
    lines.forEach((line) => {
      const h = line.match(/^#{1,4}\s+(.*)$/);
      if (h) { section = h[1].trim(); return; }
      for (const p of IDENTIFIER_PATTERNS) {
        p.re.lastIndex = 0;
        let m;
        while ((m = p.re.exec(line)) !== null) {
          findings.push({ id: p.id, label: p.label, section, sample: redactSample(m[0]) });
          if (m.index === p.re.lastIndex) p.re.lastIndex++;   // 零寬匹配保險
        }
      }
    });
    return findings;
  }

  function countExactDates(text) {
    const m = String(text || "").match(EXACT_DATE_RE);
    return m ? m.length : 0;
  }

  /* 兩個數字都要報,而且要分開報。一個兩診的病例全文會出現十幾次日期
   * (同一個就診日散在 6/7/8a/10a/11c 與 STRICTA 表),只印「精確日期 17 處」
   * 會讓人以為檔案裡有 17 個不同的日子 —— 那是把風險講大,而講大跟講小
   * 一樣是不準。distinct 才是「洩漏了幾天」,total 是「要改幾個地方」。 */
  function exactDateStats(text) {
    const m = String(text || "").match(EXACT_DATE_RE) || [];
    return { total: m.length, distinct: new Set(m).size };
  }

  /* 產生時間那一行不是病人資料,但它的格式是 YYYY-MM-DD,所以會被 EXACT_DATE_RE
   * 抓進來 —— 兩診的病例因此被報成「精確日期 3 個」。往安全方向誇大也還是不準,
   * 而一個會誇大的數字下次就會被當成雜訊略過。
   * 這裡只剔掉那一行本身(用它的固定前綴精準比對),不是全域排除產生日期:
   * 萬一某次就診剛好在產生當天,那個日期仍然要被算進去。
   * 黑框、瀏覽器確認框、CLI 警告三個地方都走這一支,數字才不會各報各的。 */
  const GENERATOR_META_PREFIX = "_由 `js/care-draft.js` 產生";
  function phiCounts(text) {
    const scanned = String(text || "")
      .split("\n")
      .filter((l) => !l.startsWith(">") && !l.startsWith(GENERATOR_META_PREFIX))
      .join("\n");
    return { dates: exactDateStats(scanned), findings: scanIdentifiers(scanned) };
  }

  /* 下載檔名。caseTitle 不進來(檔名不用開檔就看得到),patientCode 更不會。
   * 只留 case id —— `case.<base36 時戳>.<亂數6>`,系統流水號,不是病人識別。
   * 檔名帶 PHI 三個字是刻意的:下載資料夾一眼就能認出這是不能亂丟的檔案。 */
  function draftFilename(item, dateISO) {
    const id = String((item && item.id) || "case").replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 48);
    return `care-draft-PHI-${id}-${dateISO}.md`;
  }

  /* 黑框。always-on 的部分是「宣告」(必然含有什麼),掃描的部分是「提醒」
   * (另外找到什麼)。兩者分開寫,因為它們的可信度不同 —— 宣告是確定的,
   * 掃描永遠可能漏。中英並陳,不隨 lang 縮減:安全文字不吃 contentMode。 */
  function buildPhiBanner(body) {
    const counts = phiCounts(body);
    const findings = counts.findings;
    const d = counts.dates;
    const out = [];
    out.push("> ⚠️ **本檔含 PHI(未去識別)· THIS FILE CONTAINS PHI**");
    out.push(">");
    out.push("> 這份草稿照錄病歷原文,依設計一定包含下列病人資訊:");
    out.push(`> - 精確日期 ${d.distinct} 個 · 全文出現 ${d.total} 處(CARE 7 Timeline 的價值就在日期,本產生器不做模糊化)`);
    out.push("> - 主訴 / 病史 / 客觀所見 / 評估 / 計畫的原始敘述(照錄,未改寫)");
    out.push("> - 病人原話(CARE 12 Patient perspective)");
    out.push(">");
    out.push("> 本產生器不移除任何識別資訊,也不判斷這份檔案能不能外流。下載之後它就是");
    out.push("> 一份病歷:**請勿放進雲端同步資料夾、勿以附件寄出、勿直接投稿**。投稿前必須");
    out.push("> 人工逐段改寫(姓名、機構、精確日期、罕見職業、地名)並確認發表同意。");
    out.push(">");
    out.push("> Nothing here has been removed or masked. Treat the downloaded file as a");
    out.push("> patient record: no cloud sync, no e-mail attachment, no submission as-is.");
    out.push(">");
    if (findings.length) {
      out.push(`> 🔎 **自動掃描另外命中 ${findings.length} 處直接識別碼樣式**(樣本已遮蔽):`);
      for (const f of findings.slice(0, 30)) out.push(`> - ${f.id} ${f.label} — 〈${f.section}〉:\`${f.sample}\``);
      if (findings.length > 30) out.push(`> - …另有 ${findings.length - 30} 處未列出`);
    } else {
      out.push("> 🔎 自動掃描未命中 K1/K2/K3/K5/K6 的識別碼樣式。");
    }
    out.push(">");
    out.push("> **掃描是提醒,不是放行**:掃不到只代表沒有符合那五種樣式的字串,");
    out.push("> 上面列的日期、敘述原文、病人原話照樣在檔案裡。姓名、機構、罕見職業、");
    out.push("> 地名這一類沒有可靠的機器特徵 —— 只有人眼抓得到。");
    return out.join("\n");
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

    const dxTitle = [resolveList(item.westernConditions), resolveList(item.easternDiseases)].filter(has).join(" / ");
    push(`# ${dxTitle || "個案 Case"} — CARE Case Report Draft 個案報告草稿`);
    push("");
    // 這一行的前綴是 GENERATOR_META_PREFIX 的比對對象 —— 改文案時兩邊要一起改,
    // 不然產生日期會重新被算成病人日期。
    push(
      `_由 \`js/care-draft.js\` 產生(瀏覽器與 \`scripts/generate-care-draft.js\` 共用)· ` +
        `產生時間 ${refDate.toISOString().slice(0, 10)} · case id \`${(item.id || "(none)")}\`(系統流水號,非病人識別)。_`
    );
    push("");
    push(
      `_**病人代碼 patientCode 與病例標題 caseTitle 不輸出到本檔,也不進檔名** —— ` +
        `兩者都是使用者自填欄位,可能直接就是姓名;patientCode 另外是 D1 拿去算 patientId 的那個字串。` +
        `標題請於投稿前依 CARE 第 1 項自行撰寫。正文一律稱「本案病人」。_`
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

    /* 黑框貼在 H1 之上,而不是插在正文中間:第一眼就要看到,而且掃描必須在
     * 正文組完之後才跑 —— 掃的是真正會出門的那份文字,不是欄位的預測。 */
    const body = lines.join("\n");
    return `${buildPhiBanner(body)}\n\n${body}`;
  }

  const api = {
    VERDICT_LABELS, has, gap, ageRangeFromBirth, buildLabelIndexFromKnowledge,
    metricDefMapFromKnowledge, buildTimeline, generateDraft,
    IDENTIFIER_PATTERNS, FORBIDDEN_CLEARANCE_CLAIMS, scanIdentifiers, countExactDates,
    exactDateStats, phiCounts, redactSample, draftFilename, buildPhiBanner,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.AcuTingCareDraft = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
