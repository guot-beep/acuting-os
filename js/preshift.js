/* preshift.js — 診前單 Pre-shift 的純函式層(2026-11-20,Ting:「我可以自己選時間,因為 preceptor 可能不固定,
 * 然後添加選擇性病例(今天要看的)……有時間有病例有內容,跟勾選今天目前完成的病人,跟一個小病歷紀錄框寫心得……
 * 這些心得新增到每個病例後面加上添加時間」)。
 *
 * 零 DOM、node 可直接 require;真值表 scripts/validate-preshift.js。畫面在 js/preshift-ui.js。
 *
 * 儲存:key = acuting-preshift-v1,跟病例同一個雲端、同一個通行碼。**病例本身一個字都不改** ——
 *   這裡只存「哪天、幾點、看哪個病例(caseId)、勾了沒」與「心得(caseId + 時間戳)」。
 *   病例頁讀這份資料把心得畫在病例最後面;病例被刪了,心得還在(只加不刪)。
 *
 * 寫入一律「操作」而不是「整本換掉」:apply(op) 先重讀最新那本、在最新那本上做這一步、再寫。
 *   另一台裝置剛加了一位病人或一則心得 → 這一步疊在它上面,不會蓋掉;寫入被拒(409)→ 重讀再做一次。
 *   (藥櫃的做法是拒絕並請她重做;心得是她剛打的字,重做等於叫她重打,所以這裡改成自動疊上去。)
 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "acuting-preshift-v1";
  const SCHEMA = 1;
  const MAX_NOTE_CHARS = 4000;

  const str = (v) => (v === null || v === undefined ? "" : String(v));
  const arr = (v) => (Array.isArray(v) ? v : []);
  const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(str(s));
  // 時間可以留空(還不知道幾點);有填就要是 HH:MM
  const isTime = (s) => s === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(str(s));

  function emptyData() { return { schema: SCHEMA, days: {}, notes: [] }; }

  // 讀進來的東西不信任:形狀不對的列丟掉,但**不丟心得的字**(text 有字就留)
  function normalize(raw) {
    const d = emptyData();
    if (!raw || typeof raw !== "object") return d;
    const days = raw.days && typeof raw.days === "object" ? raw.days : {};
    for (const date of Object.keys(days)) {
      if (!isISODate(date)) continue;
      const entries = arr(days[date] && days[date].entries)
        .filter((e) => e && str(e.id) && str(e.caseId))
        .map((e) => ({
          id: str(e.id),
          caseId: str(e.caseId),
          time: isTime(str(e.time)) ? str(e.time) : "",
          done: e.done === true,
          doneAt: e.done === true ? str(e.doneAt) : "",
          addedAt: str(e.addedAt),
        }));
      d.days[date] = { entries };
    }
    d.notes = arr(raw.notes)
      .filter((n) => n && str(n.id) && str(n.text).trim())
      .map((n) => ({
        id: str(n.id),
        caseId: str(n.caseId),            // "" = 當天的總心得,不屬於任何病例
        date: isISODate(n.date) ? str(n.date) : "",
        text: str(n.text),
        createdAt: str(n.createdAt),
      }));
    return d;
  }

  const clone = (d) => JSON.parse(JSON.stringify(d));
  const dayOf = (d, date) => (d.days[date] || (d.days[date] = { entries: [] }));

  // ── 操作(每一個都回傳新的一本,不改輸入) ──
  function addEntry(data, date, caseId, time, now, newId) {
    if (!isISODate(date)) throw new Error("日期格式不對");
    if (!str(caseId)) throw new Error("沒有選病例");
    if (!isTime(str(time))) throw new Error("時間格式要像 14:30");
    const d = clone(data), day = dayOf(d, date);
    // 同一天同一個病例只排一次:重複加 = 更新時間(另一台裝置剛好也加了同一位時不會出現兩列)
    const dup = day.entries.find((e) => e.caseId === caseId);
    if (dup) { if (str(time)) dup.time = str(time); return d; }
    day.entries.push({ id: newId("ps"), caseId: str(caseId), time: str(time), done: false, doneAt: "", addedAt: now });
    return d;
  }
  function setTime(data, date, entryId, time) {
    if (!isTime(str(time))) throw new Error("時間格式要像 14:30");
    const d = clone(data), e = arr(d.days[date] && d.days[date].entries).find((x) => x.id === entryId);
    if (!e) throw new Error("這一列已經不在名單上(可能另一台裝置移除了)");
    e.time = str(time);
    return d;
  }
  function setDone(data, date, entryId, done, now) {
    const d = clone(data), e = arr(d.days[date] && d.days[date].entries).find((x) => x.id === entryId);
    if (!e) throw new Error("這一列已經不在名單上(可能另一台裝置移除了)");
    e.done = !!done;
    e.doneAt = done ? now : "";
    return d;
  }
  // 移出名單只動排程,不碰心得,也不碰病例
  function removeEntry(data, date, entryId) {
    const d = clone(data), day = d.days[date];
    if (day) day.entries = day.entries.filter((x) => x.id !== entryId);
    return d;
  }
  // 心得只加不改不刪
  function addNote(data, note, now, newId) {
    const text = str(note && note.text).trim();
    if (!text) throw new Error("心得是空的");
    if (text.length > MAX_NOTE_CHARS) throw new Error(`心得太長(上限 ${MAX_NOTE_CHARS} 字)`);
    const date = str(note.date);
    if (date && !isISODate(date)) throw new Error("日期格式不對");
    const d = clone(data);
    d.notes.push({ id: newId("psn"), caseId: str(note.caseId), date, text, createdAt: now });
    return d;
  }

  // ── 讀 ──
  // 有時間的照時間排,沒時間的排最後(照加入順序)
  function dayEntries(data, date) {
    const list = arr(data.days[date] && data.days[date].entries).map((e, i) => ({ e, i }));
    list.sort((a, b) => {
      const ta = a.e.time || "99:99", tb = b.e.time || "99:99";
      return ta.localeCompare(tb) || a.i - b.i;
    });
    return list.map((x) => x.e);
  }
  const byCreated = (a, b) => str(a.createdAt).localeCompare(str(b.createdAt));
  function caseNotes(data, caseId) { return data.notes.filter((n) => n.caseId === caseId && caseId).sort(byCreated); }
  function dayNotes(data, date) { return data.notes.filter((n) => !n.caseId && n.date === date).sort(byCreated); }
  function datesWithEntries(data) { return Object.keys(data.days).filter((k) => data.days[k].entries.length).sort(); }

  // ── 病例摘要(只讀病例,不改) ──
  // 注意事項:安全旗標原文 + 過敏原文 + 「文字裡提到」的關鍵字(自動找的,一定附原句讓她核對)
  const KEYWORD_RULES = [
    ["pneumothorax", "氣胸 Pneumothorax", /氣胸|pneumothorax/i],
    ["pregnancy", "懷孕 / 備孕 Pregnancy / TTC", /懷孕|妊娠|孕期|備孕|試孕|不孕|pregnan|\bTTC\b|trying to conceive|\bIVF\b|\bIUI\b|embryo transfer|植入|取卵/i],
    ["hypertension", "高血壓 Hypertension", /高血壓|hypertension|\bHTN\b/i],
    ["anticoagulant", "抗凝血 / 抗血小板 Anticoagulant", /抗凝|warfarin|coumadin|apixaban|eliquis|rivaroxaban|xarelto|dabigatran|clopidogrel|plavix|heparin|enoxaparin|lovenox/i],
    ["pacemaker", "心律調節器 Pacemaker", /心律調節器|節律器|pacemaker|\bICD\b|defibrillator/i],
    ["seizure", "癲癇 Seizure", /癲癇|seizure|epilep/i],
    ["bleeding", "出血傾向 Bleeding disorder", /血友病|hemophilia|出血傾向|bleeding disorder|thrombocytopenia|血小板低/i],
    ["diabetes", "糖尿病 Diabetes", /糖尿病|diabet|\bDM\b|insulin|胰島素/i],
    ["cancer", "癌症 Cancer / 化療", /癌|cancer|carcinoma|chemo|化療|放療|tumou?r|腫瘤/i],
    ["redflag", "紅旗 Red flag", /red flag|紅旗|轉診|refer(ral)? to (er|ed|md)|急診/i],
  ];
  const NEGATION = /(無|沒有|否認|未曾|非|no|denies|denied|negative for|without|r\/o)\s*[::]?\s*$/i;

  function snippetAround(text, index, len) {
    const s = Math.max(0, index - 14), e = Math.min(text.length, index + len + 14);
    return (s > 0 ? "…" : "") + text.slice(s, e).replace(/\s+/g, " ").trim() + (e < text.length ? "…" : "");
  }

  function textSources(item, last) {
    const out = [
      ["病名", item.caseTitle], ["主訴", item.chiefComplaint], ["既往史", item.pastHistory],
      ["現病史", item.historyPresent], ["用藥", item.currentMeds], ["婦科史", item.menstrualObHistory],
      ["西醫診斷", arr(item.westernConditions).join("、")],
    ];
    if (last) out.push(["上次 S", last.subjective], ["上次 A", last.assessment], ["上次 P", last.plan], ["上次醫囑", last.advice]);
    return out.filter(([, t]) => str(t).trim());
  }

  function attentionItems(item, last) {
    const out = [];
    for (const f of arr(item.safetyFlags)) if (str(f).trim()) out.push({ level: "flag", label: str(f).trim(), source: "安全旗標" });
    for (const f of arr(last && last.safetyFlagLinks)) if (str(f).trim()) out.push({ level: "flag", label: str(f).trim(), source: "上次 SOAP 安全警示" });
    const allergies = str(item.allergies).trim();
    if (allergies && !/^(無|沒有|none|nkda|nka|no known.*|-|—)$/i.test(allergies)) out.push({ level: "flag", label: "過敏 " + allergies, source: "過敏" });
    const flagText = out.map((x) => x.label).join(" ");
    for (const [code, label, re] of KEYWORD_RULES) {
      if (re.test(flagText)) continue;   // 已經是旗標了,不重複
      for (const [src, t] of textSources(item, last)) {
        const text = str(t), m = re.exec(text);
        if (!m) continue;
        const negated = NEGATION.test(text.slice(Math.max(0, m.index - 12), m.index));
        out.push({ level: negated ? "maybe" : "mention", code, label, source: src, snippet: snippetAround(text, m.index, m[0].length), negated });
        break;
      }
    }
    return out;
  }

  const firstFilled = (...xs) => xs.map((x) => (Array.isArray(x) ? x.filter(Boolean).join(" · ") : str(x).trim())).find(Boolean) || "";
  const clip = (s, n) => (str(s).length > n ? str(s).slice(0, n) + "…" : str(s));

  function lastNoteOf(item) {
    const notes = arr(item && item.soapNotes).filter((n) => n && typeof n === "object");
    if (!notes.length) return null;
    // 就診日最新的那一診;同日或沒日期的用 updatedAt / 順序
    return [...notes].map((n, i) => ({ n, i })).sort((a, b) =>
      str(b.n.visitDate).localeCompare(str(a.n.visitDate)) || str(b.n.updatedAt).localeCompare(str(a.n.updatedAt)) || b.i - a.i)[0].n;
  }

  const daysBetween = (a, b) => (isISODate(a) && isISODate(b) ? Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000) : null);

  /** opts: { today: "YYYY-MM-DD", caseSearch: js/case-search.js 的 api(可省), formulaName(id) }
   *  caseSearch.caseLabel 第二個參數要 Date(傳 ISO 字串會在 ageOf 丟錯 —— 第一版就踩到,真值表用真的 case-search 守著)。 */
  function summarizeCase(item, opts) {
    const o = opts || {};
    if (!item) return null;
    const cs = o.caseSearch && typeof o.caseSearch.caseLabel === "function" ? o.caseSearch : null;
    const lab = cs ? cs.caseLabel(item, isISODate(o.today) ? new Date(o.today + "T12:00:00") : new Date()) || {} : {};
    const last = lastNoteOf(item);
    const fname = typeof o.formulaName === "function" ? o.formulaName : (x) => x;
    const visits = arr(item.soapNotes).length;
    const lastVisit = last ? str(last.visitDate) : "";
    return {
      caseId: str(item.id),
      displayCode: str(lab.displayCode || item.displayCode).trim(),
      patientId: str(item.patientCode).trim(),
      sexAge: str(lab.sexAge),
      title: str(item.caseTitle).trim(),
      chiefComplaint: str(item.chiefComplaint).trim(),
      visits,
      lastVisit,
      daysSince: lastVisit && o.today ? daysBetween(lastVisit, o.today) : null,
      last: last ? {
        pattern: firstFilled(last.tcmPattern, arr(last.tcmPatternSelections).map((s) => (s && typeof s === "object" ? str(s.label || s.name_zh || s.id) : str(s))), arr(item.tcmPatterns)),
        principle: clip(str(last.treatmentPrinciple).trim(), 80),
        points: firstFilled(last.pointsUsed, arr(last.acupointLinks)),
        herbs: firstFilled(last.formulaHerbs, arr(last.formulaLinks).map(fname)),
        assessment: clip(str(last.assessment).trim(), 160),
        plan: clip(str(last.plan).trim(), 160),
        followUp: clip(str(last.followUp).trim(), 120),
        askPreceptor: clip(str(last.referralOrSupervisorQuestion).trim(), 160),
      } : null,
      attention: attentionItems(item, last),
    };
  }

  // ── 讀寫 session:每一步都疊在最新那本上 ──
  // io = { read() → string|null, write(string) (可能丟錯), refresh?() }
  function makeStore(io) {
    let data = null, baseRaw = null, error = "";
    function load() {
      error = "";
      try {
        const raw = io.read();
        data = normalize(raw ? JSON.parse(raw) : null);
        baseRaw = raw;
      } catch (e) { data = null; error = str((e && e.message) || e); }
      return data;
    }
    function ensure() {
      try { if (data && str(io.read()) === str(baseRaw)) return data; } catch (_) { if (data) return data; }
      return load();
    }
    /** op(data) → 新的一本。回傳 {ok, message, retried} */
    function apply(op) {
      let lastErr = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        if (!ensure()) return { ok: false, message: "讀不到診前單:" + (error || "未知原因"), retried: attempt > 0 };
        let next;
        try { next = op(data); } catch (e) { return { ok: false, message: str(e && e.message), retried: attempt > 0 }; }
        const s = JSON.stringify(next);
        try {
          io.write(s);
          data = normalize(next); baseRaw = s;
          return { ok: true, message: "", retried: attempt > 0 };
        } catch (e) {
          lastErr = e;
          try { if (typeof io.refresh === "function") io.refresh(); } catch (_) { /* */ }
          data = null;   // 下一輪強制重讀
        }
      }
      load();
      return { ok: false, message: "沒有存到:" + str((lastErr && lastErr.message) || lastErr), retried: true };
    }
    return { load, ensure, apply, data: () => data, error: () => error };
  }

  const api = {
    STORAGE_KEY, SCHEMA, MAX_NOTE_CHARS, KEYWORD_RULES,
    emptyData, normalize, isISODate, isTime,
    addEntry, setTime, setDone, removeEntry, addNote,
    dayEntries, caseNotes, dayNotes, datesWithEntries,
    lastNoteOf, attentionItems, summarizeCase, daysBetween,
    makeStore,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.AcuTingPreshift = api;
})(typeof window !== "undefined" ? window : globalThis);
