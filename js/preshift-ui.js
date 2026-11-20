/* preshift-ui.js — 診前單 Pre-shift 的畫面(2026-11-20)。計算全在 js/preshift.js(真值表 scripts/validate-preshift.js)。
 *
 * 一頁看完今天:時間 → 病人(顯示代號 / 系統病人 ID / 性別年齡 / 病名)→ 注意事項置頂 → 上次 SOAP 摘要 → 勾完成 → 寫心得。
 * 病例只讀不改;診前單與心得存在跟病例同一個雲端(AcuTingClinicalBackend.readKey / writeKey,同一個通行碼)。
 * 沒有雲端服務的本機開法(file://)才退回 localStorage,畫面會講清楚。
 * 依賴 app.js 的全域:escapeHtml、escapeAttribute、clinicalCases、selectedCaseId、renderClinicalCases、localDateISO、
 *   resolveFormulaName、AcuTingCaseSearch。 */
(function () {
  "use strict";
  const P = window.AcuTingPreshift;
  const root = () => document.getElementById("preshiftApp");
  if (!P) return;
  const esc = (v) => (typeof escapeHtml === "function" ? escapeHtml(v) : String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])));
  const attr = (v) => (typeof escapeAttribute === "function" ? escapeAttribute(v) : esc(v));
  const isoOf = (t) => { const d = t || new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const today = () => (typeof localDateISO === "function" ? localDateISO() : isoOf());
  const nowStamp = () => new Date().toISOString();
  const newId = (p) => `${p}.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const cases = () => (typeof clinicalCases !== "undefined" && Array.isArray(clinicalCases) ? clinicalCases : []);
  const S = () => window.AcuTingCaseSearch;
  const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
  const fmtStamp = (iso) => {
    const d = new Date(iso);
    if (isNaN(d)) return String(iso || "");
    return `${isoOf(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const shiftDate = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return isoOf(d); };

  // ── 儲存 ──
  const backend = () => { const b = window.AcuTingClinicalBackend; return b && typeof b.readKey === "function" && typeof b.writeKey === "function" ? b : null; };
  const store = P.makeStore({
    read() { const b = backend(); if (b) return b.readKey(P.STORAGE_KEY); try { return localStorage.getItem(P.STORAGE_KEY); } catch (_) { return null; } },
    write(s) { const b = backend(); if (b) b.writeKey(P.STORAGE_KEY, s); else localStorage.setItem(P.STORAGE_KEY, s); },
    refresh() { const b = backend(); if (b && typeof b.refresh === "function") b.refresh(); },
  });
  const storeLabel = () => (backend() ? (backend().state && backend().state().backend === "d1" ? "雲端(與病例同一本)" : "本機病例服務") : "這個瀏覽器(沒有雲端服務)");

  let date = "", q = "", addTime = "", msg = { text: "", ok: true };
  const openNotes = new Set();   // 哪幾位的心得框是打開的
  const drafts = {};             // 還沒存的心得(重畫畫面時不要把她打的字吃掉)

  function run(op, okText) {
    const r = store.apply(op);
    msg = r.ok ? { text: okText + (r.retried ? "(另一台裝置剛更新過,已疊在最新內容上)" : ""), ok: true } : { text: r.message, ok: false };
    return r.ok;
  }

  // ── 片段 ──
  const caseById = (id) => cases().find((c) => c.id === id) || null;
  function summary(c) {
    return P.summarizeCase(c, {
      today: today(),
      caseSearch: S(),
      // 「可能遇到的問題」只引用知識庫穴位卡自己的注意事項(中文 + 英文都看)
      pointCautions: (code) => {
        const list = typeof points !== "undefined" && Array.isArray(points) ? points : [];
        const p = list.find((x) => String(x.code || "").toUpperCase() === code);
        if (!p) return "";
        const en = Array.isArray(p.pointCautionsEn) ? p.pointCautionsEn.join("\n") : String(p.pointCautionsEn || "");
        return [p.cautions, en].filter(Boolean).join("\n");
      },
      metricLabel: (id) => (typeof outcomeMetricPanelLabel === "function" ? outcomeMetricPanelLabel(id) : String(id).replace(/^metric\./, "")),
      formulaName: (id) => (typeof resolveFormulaName === "function" ? resolveFormulaName(id) : id),
    });
  }
  function idLine(s) {
    return `<span class="ps-code">${esc(s.displayCode || "(未設顯示代號)")}</span>
      ${s.patientId ? `<span class="ps-pid" title="系統病人 ID">${esc(s.patientId)}</span>` : ""}
      ${s.sexAge ? `<span class="ps-sexage">${esc(s.sexAge)}</span>` : ""}`;
  }
  function attentionHtml(list) {
    if (!list.length) return `<div class="ps-attn ps-attn-none">沒有記錄的安全旗標或過敏 —— 不等於沒有,問診時仍要確認。</div>`;
    return `<ul class="ps-attn">${list.map((a) => {
      if (a.level === "flag") return `<li class="ps-flag"><b>⚠ ${esc(a.label)}</b><small>${esc(a.source)}</small></li>`;
      return `<li class="${a.level === "maybe" ? "ps-maybe" : "ps-mention"}"><b>${a.level === "maybe" ? "?" : "⚑"} ${esc(a.label)}</b>
        <small>${esc(a.source)}提到${a.negated ? "(可能是否定句)" : ""}:「${esc(a.snippet)}」· 自動找到,請核對</small></li>`;
    }).join("")}</ul>`;
  }
  // 1–2:病歷事實(原文)
  function chartHtml(s) {
    const rows = [...s.conditions.map((c) => [c.label, c.text])];
    if (s.last) {
      if (s.last.pattern) rows.push(["上次證型", s.last.pattern]);
      if (s.last.assessment) rows.push(["上次評估 A", s.last.assessment]);
    }
    return `<section class="ps-chart" aria-label="病歷資料">
      <h5>病歷資料 <small>Chart · 原文</small></h5>
      <div class="ps-sub">1 注意事項</div>
      ${attentionHtml(s.attention)}
      <div class="ps-sub">2 病況</div>
      ${rows.length ? `<dl class="ps-last">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : `<div class="ps-last-empty">病歷沒有填診斷、證型或用藥。</div>`}
    </section>`;
  }
  // 3–7:草稿(依上次 SOAP + 規則整理,不是決定)。每一行都寫出處。
  function draftsHtml(s) {
    const D = s.drafts;
    const block = (n, title, list, empty) => `<div class="ps-sub">${n} ${esc(title)}</div>${list.length
      ? `<ul class="ps-draft-list">${list.map((x) => `<li class="${x.level === "high" ? "ps-d-high" : x.level === "low" ? "ps-d-low" : ""}"><span>${x.warn ? "⚠ " : ""}${esc(x.text)}</span><small>出處:${esc(x.source)}</small></li>`).join("")}</ul>`
      : `<div class="ps-last-empty">${esc(empty)}</div>`}`;
    const pts = D.points.length
      ? `<div class="ps-sub">5 要扎的穴位</div><div class="ps-pointchips">${D.points.map((p) => `<span class="ps-pt${p.warn ? " is-warn" : ""}" title="${attr(p.source)}">${p.warn ? "⚠ " : ""}${esc(p.text)}</span>`).join("")}</div><small class="ps-src">出處:${esc(D.points[0].source)}(延續上次)</small>`
      : `<div class="ps-sub">5 要扎的穴位</div><div class="ps-last-empty">上次 SOAP 沒有記錄用穴。</div>`;
    if (!s.last) return `<section class="ps-drafts" aria-label="草稿">
      <h5>草稿 <small>Draft · 不是決定,看診時再確認</small></h5>
      ${block(3, "本次要問", D.ask, "病歷文字裡沒有找到要特別確認的事。")}
      <div class="ps-last-empty">還沒有 SOAP —— 初診,4–7 沒有可以延續的內容。</div>
    </section>`;
    return `<section class="ps-drafts" aria-label="草稿">
      <h5>草稿 <small>Draft · 依上次 SOAP 整理,不是決定,看診時再確認</small></h5>
      ${block(3, "本次要問", D.ask, "上次沒有留下要追蹤的問題。")}
      ${block(4, "可能遇到的問題", D.problems, "沒有從病人旗標 × 穴位卡注意事項對到的問題。")}
      ${pts}
      ${block(6, "建議", D.suggestions, "上次沒有填治則、計畫或醫囑。")}
      ${block(7, "中藥處方(延續上次)", D.herbs, "上次沒有開藥。")}
    </section>`;
  }
  function notesListHtml(list) {
    return list.length ? `<ol class="ps-notes">${list.map((n) => `<li><time>${esc(fmtStamp(n.createdAt))}</time><p>${esc(n.text)}</p></li>`).join("")}</ol>` : "";
  }

  function entryHtml(e) {
    const c = caseById(e.caseId);
    const data = store.data();
    const notes = P.caseNotes(data, e.caseId);
    if (!c) {
      return `<article class="ps-card ps-missing"><div class="ps-row1"><span class="ps-time">${esc(e.time || "--:--")}</span>
        <span>這個病例找不到了(可能被刪除或還沒同步)。</span>
        <button type="button" class="ghost" data-ps-remove="${attr(e.id)}">移出名單</button></div></article>`;
    }
    const s = summary(c);
    const open = openNotes.has(e.id);
    const flags = s.attention.filter((a) => a.level === "flag").length;
    return `<article class="ps-card${e.done ? " is-done" : ""}${flags ? " has-flag" : ""}" data-ps-entry="${attr(e.id)}">
      <div class="ps-row1">
        <label class="ps-check" title="完成 Done"><input type="checkbox" data-ps-done="${attr(e.id)}" ${e.done ? "checked" : ""} aria-label="完成"><span></span></label>
        <input type="time" class="ps-time-input" value="${attr(e.time)}" data-ps-time="${attr(e.id)}" aria-label="時間">
        <div class="ps-ident">${idLine(s)}</div>
      </div>
      <div class="ps-title"><strong>${esc(s.title || s.chiefComplaint || "未命名病例")}</strong>
        ${s.title && s.chiefComplaint && s.chiefComplaint !== s.title ? `<small>主訴 ${esc(s.chiefComplaint)}</small>` : ""}</div>
      <div class="ps-lastvisit">上次就診 <b>${esc(s.lastVisit || "—")}</b>${s.daysSince !== null && s.daysSince >= 0 ? `(${s.daysSince} 天前)` : ""} · 共 ${s.visits} 診
        ${e.done && e.doneAt ? `<span class="ps-donetag">✓ ${esc(fmtStamp(e.doneAt).slice(11))} 完成</span>` : ""}</div>
      ${chartHtml(s)}
      ${draftsHtml(s)}
      <div class="ps-actions">
        <button type="button" class="ghost" data-ps-open="${attr(c.id)}">打開病例 / 寫 SOAP</button>
        <button type="button" class="ghost" data-ps-togglenote="${attr(e.id)}" aria-expanded="${open}">心得${notes.length ? `(${notes.length})` : ""}</button>
        <button type="button" class="ghost ps-remove" data-ps-remove="${attr(e.id)}">移出名單</button>
      </div>
      ${open ? `<div class="ps-notebox">
        ${notesListHtml(notes)}
        <textarea rows="3" maxlength="${P.MAX_NOTE_CHARS}" data-ps-notetext="${attr(e.id)}" placeholder="這位病人的心得、觀察、下次想試的(會加上時間,存在病例最後面;只加不改)">${esc(drafts[e.id] || "")}</textarea>
        <button type="button" data-ps-savenote="${attr(e.id)}" data-ps-case="${attr(c.id)}">存心得</button>
      </div>` : ""}
    </article>`;
  }

  function hitsHtml() {
    const inList = new Set(P.dayEntries(store.data() || P.emptyData(), date).map((e) => e.caseId));
    const term = q.trim().toLowerCase();
    if (!term) return "";
    const hits = cases().filter((c) => !inList.has(c.id)).map((c) => ({ c, s: summary(c) })).filter(({ c, s }) =>
      [s.displayCode, s.patientId, s.title, s.chiefComplaint, c.id].join(" ").toLowerCase().includes(term))
      .sort((a, b) => String(b.s.lastVisit).localeCompare(String(a.s.lastVisit))).slice(0, 12);
    return hits.length ? `<ul class="ps-hits">${hits.map(({ c, s }) => `<li><button type="button" data-ps-add="${attr(c.id)}">
        <span class="ps-ident">${idLine(s)}</span><span class="ps-hit-title">${esc(s.title || s.chiefComplaint || "未命名病例")}</span>
        <small>上次 ${esc(s.lastVisit || "—")} · ${s.visits} 診</small><b>＋ 加入</b></button></li>`).join("")}</ul>`
      : `<p class="hi-hint">找不到符合的病例${inList.size ? "(已在名單上的不列出)" : ""}。</p>`;
  }
  // 搜尋框本身不重畫(重畫會打斷中文輸入法的選字),只換下面的結果
  function pickerHtml() {
    return `<section class="ps-picker ps-noprint" aria-label="加入病人">
      <div class="ps-picker-bar">
        <input type="search" id="psQ" placeholder="搜尋顯示代號、病人 ID、病名… 加入${date === today() ? "今天" : date}名單" value="${attr(q)}" autocomplete="off">
        <input type="time" id="psAddTime" value="${attr(addTime)}" aria-label="預約時間(可留空)" title="時間(可留空,之後再填)">
      </div>
      <div id="psHits">${hitsHtml()}</div>
    </section>`;
  }
  function wireHits(el) {
    el.querySelectorAll("[data-ps-add]").forEach((b) => b.addEventListener("click", () => {
      const t = (root().querySelector("#psAddTime") || {}).value || "";
      if (run((d) => P.addEntry(d, date, b.dataset.psAdd, t, nowStamp(), newId), "已加入名單")) { q = ""; addTime = ""; }
      render();
    }));
  }

  function render() {
    const el = root();
    if (!el) return;
    if (!date) date = today();
    const data = store.ensure();
    if (!data) {
      el.innerHTML = `<p class="note warn">讀不到診前單:${esc(store.error())}<br>病例也讀不到的話,先在病例頁輸入通行碼。</p>`;
      return;
    }
    const entries = P.dayEntries(data, date);
    const done = entries.filter((e) => e.done).length;
    const d = new Date(date + "T12:00:00");
    const flagged = entries.filter((e) => { const c = caseById(e.caseId); return c && summary(c).attention.some((a) => a.level === "flag"); }).length;
    const dayNoteList = P.dayNotes(data, date);
    el.innerHTML = `
      <header class="ps-head">
        <div class="ps-datebar ps-noprint">
          <button type="button" class="ghost" data-ps-day="-1" aria-label="前一天">‹</button>
          <input type="date" id="psDate" value="${attr(date)}" aria-label="日期">
          <button type="button" class="ghost" data-ps-day="1" aria-label="後一天">›</button>
          ${date !== today() ? `<button type="button" class="ghost" data-ps-day="0">回今天</button>` : ""}
          <button type="button" class="ghost" id="psPrint">列印</button>
        </div>
        <h3 class="ps-dayline">${esc(date)}(${WEEK[d.getDay()]})${date === today() ? " · 今天" : ""}</h3>
        <div class="ps-stats">
          <span><b>${entries.length}</b> 位</span>
          <span><b>${done}</b> / ${entries.length} 完成</span>
          ${flagged ? `<span class="ps-stat-warn"><b>${flagged}</b> 位有安全旗標</span>` : ""}
          <small class="hi-hint">存在:${esc(storeLabel())}</small>
        </div>
        ${entries.length ? `<div class="ps-progress" aria-hidden="true"><i style="width:${Math.round((done / entries.length) * 100)}%"></i></div>` : ""}
      </header>
      ${msg.text ? `<p class="ps-msg ${msg.ok ? "ok" : "bad"}" role="status">${esc(msg.text)}</p>` : ""}
      ${pickerHtml()}
      <div class="ps-list">
        ${entries.length ? entries.map(entryHtml).join("") : `<div class="case-empty">這天還沒有排病人。用上面的搜尋框加入要看的病例,時間可以先留空。</div>`}
      </div>
      <section class="ps-daynote" aria-label="當天心得">
        <h4>當天心得 Shift notes</h4>
        ${notesListHtml(dayNoteList)}
        <textarea rows="3" maxlength="${P.MAX_NOTE_CHARS}" id="psDayNote" class="ps-noprint" placeholder="有空檔或下班後寫一下今天的整體心得(會加上時間;只加不改)">${esc(drafts["day:" + date] || "")}</textarea>
        <button type="button" id="psSaveDayNote" class="ps-noprint">存當天心得</button>
      </section>`;
    wire(el);
  }

  function wire(el) {
    const keepDraft = (k, v) => { if (v) drafts[k] = v; else delete drafts[k]; };
    el.querySelector("#psDate")?.addEventListener("change", (ev) => { if (P.isISODate(ev.target.value)) { date = ev.target.value; msg = { text: "", ok: true }; render(); } });
    el.querySelectorAll("[data-ps-day]").forEach((b) => b.addEventListener("click", () => {
      const n = Number(b.dataset.psDay); date = n === 0 ? today() : shiftDate(date, n); msg = { text: "", ok: true }; render();
    }));
    el.querySelector("#psPrint")?.addEventListener("click", () => window.print());
    const qEl = el.querySelector("#psQ");
    if (qEl) {
      const refresh = () => { q = qEl.value; const box = root().querySelector("#psHits"); if (box) { box.innerHTML = hitsHtml(); wireHits(box); } };
      qEl.addEventListener("input", (ev) => { if (!ev.isComposing) refresh(); });
      qEl.addEventListener("compositionend", refresh);
    }
    el.querySelector("#psAddTime")?.addEventListener("change", (ev) => { addTime = ev.target.value; });
    wireHits(el);
    el.querySelectorAll("[data-ps-time]").forEach((inp) => inp.addEventListener("change", () => {
      run((d) => P.setTime(d, date, inp.dataset.psTime, inp.value), "時間已更新"); render();
    }));
    el.querySelectorAll("[data-ps-done]").forEach((cb) => cb.addEventListener("change", () => {
      run((d) => P.setDone(d, date, cb.dataset.psDone, cb.checked, nowStamp()), cb.checked ? "已勾完成" : "已取消完成"); render();
    }));
    el.querySelectorAll("[data-ps-remove]").forEach((b) => b.addEventListener("click", () => {
      run((d) => P.removeEntry(d, date, b.dataset.psRemove), "已移出名單(病例與心得都沒動)"); render();
    }));
    el.querySelectorAll("[data-ps-togglenote]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.psTogglenote; if (openNotes.has(id)) openNotes.delete(id); else openNotes.add(id); render();
      root().querySelector(`[data-ps-notetext="${CSS.escape(id)}"]`)?.focus();
    }));
    el.querySelectorAll("[data-ps-notetext]").forEach((ta) => ta.addEventListener("input", () => keepDraft(ta.dataset.psNotetext, ta.value)));
    el.querySelectorAll("[data-ps-savenote]").forEach((b) => b.addEventListener("click", () => {
      const id = b.dataset.psSavenote, ta = root().querySelector(`[data-ps-notetext="${CSS.escape(id)}"]`);
      if (run((d) => P.addNote(d, { caseId: b.dataset.psCase, date, text: ta ? ta.value : "" }, nowStamp(), newId), "心得已存,病例頁最後面也看得到")) delete drafts[id];
      render();
    }));
    const dn = el.querySelector("#psDayNote");
    dn?.addEventListener("input", () => keepDraft("day:" + date, dn.value));
    el.querySelector("#psSaveDayNote")?.addEventListener("click", () => {
      if (run((d) => P.addNote(d, { caseId: "", date, text: dn ? dn.value : "" }, nowStamp(), newId), "當天心得已存")) delete drafts["day:" + date];
      render();
    });
    el.querySelectorAll("[data-ps-open]").forEach((b) => b.addEventListener("click", () => openCase(b.dataset.psOpen)));
  }

  function openCase(id) {
    if (typeof selectedCaseId !== "undefined") selectedCaseId = id;   // eslint-disable-line no-global-assign
    window.location.hash = "#ws/cases";
    if (typeof renderClinicalCases === "function") renderClinicalCases();
    setTimeout(() => document.getElementById("caseDetail")?.scrollIntoView({ block: "start" }), 0);
  }

  // ── 病例頁:最後面的心得(只讀)+ 「加入今天名單」 ──
  function caseNotesHtml(item) {
    if (!item) return "";
    const data = store.ensure();
    if (!data) return "";
    const list = P.caseNotes(data, item.id);
    const todayIn = P.dayEntries(data, today()).some((e) => e.caseId === item.id);
    return `<div class="timeline-head" id="caseSecPreshiftNotes"><strong>心得 Notes</strong><small class="timeline-date">${list.length} 則</small>
        ${todayIn ? `<a class="ghost" href="#ws/preshift">已在今天名單 →</a>` : `<button type="button" class="ghost" data-ps-case-add="${attr(item.id)}">+ 加入今天診前單</button>`}</div>
      ${list.length ? notesListHtml(list) : `<div class="case-empty">還沒有心得。在「今日診前單」每位病人下面的「心得」寫,會加上時間出現在這裡。</div>`}`;
  }
  function wireCase(container) {
    container.querySelectorAll("[data-ps-case-add]").forEach((b) => b.addEventListener("click", () => {
      run((d) => P.addEntry(d, today(), b.dataset.psCaseAdd, "", nowStamp(), newId), "已加入今天名單(時間到診前單再填)");
      date = today();
      window.location.hash = "#ws/preshift";
    }));
  }

  const onRoute = () => { if (window.location.hash === "#ws/preshift") { store.load(); render(); } };
  window.addEventListener("hashchange", onRoute);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onRoute); else onRoute();

  window.AcuTingPreshiftUI = { render, caseNotesHtml, wireCase, reload: () => store.load() };
})();
