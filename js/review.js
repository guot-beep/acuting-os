/* AcuTing OS — RV1 in-app review controls.

   Why this exists: reviewing content by reading markdown worksheets in the
   repo does not fit the only review capacity that actually exists — Ting
   noticing things while studying. This puts a two-second verdict control on
   the record she is already looking at.

   The app never writes canonical JSON. Verdicts live in localStorage and are
   exported as a file that scripts/apply-review-verdicts.js applies to the
   canonical records with provenance, under the normal dry-run/--apply gate.
   Knowledge verdicts are not clinical data: no PHI, safe to export to git. */
(function () {
  "use strict";

  const STORE_KEY = "acuting-review-verdicts-v1";
  const STORE_VERSION = 1;

  const VERDICTS = {
    confirmed: { label: "內容正確", glyph: "✓", tone: "ok" },
    issue: { label: "有問題", glyph: "!", tone: "warn" }
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);
  }

  function readStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (raw && raw.verdicts) return raw;
    } catch (err) {
      console.warn("[review] unreadable verdict store, starting fresh", err);
    }
    return { version: STORE_VERSION, verdicts: {} };
  }

  function writeStore(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  const keyOf = (kind, id) => `${kind}:${id}`;

  function verdictFor(kind, id) {
    return readStore().verdicts[keyOf(kind, id)] || null;
  }

  function setVerdict(kind, id, verdict, note, statusAtReview) {
    const store = readStore();
    const key = keyOf(kind, id);
    if (!verdict) delete store.verdicts[key];
    else {
      store.verdicts[key] = {
        kind,
        id,
        verdict,
        note: note || "",
        status_at_review: statusAtReview || "",
        reviewed_at: new Date().toISOString(),
        reviewed_by: "owner"
      };
    }
    writeStore(store);
    return store.verdicts[key] || null;
  }

  const allVerdicts = () => Object.values(readStore().verdicts);

  /* ---------- rendering ---------- */

  function strip(kind, id, currentStatus) {
    if (!id) return "";
    const current = verdictFor(kind, id);
    const total = allVerdicts().length;
    const done = current ? VERDICTS[current.verdict] : null;

    const buttons = Object.entries(VERDICTS).map(([name, meta]) => {
      const active = current && current.verdict === name;
      return `<button type="button" class="rv-btn rv-${meta.tone}${active ? " is-active" : ""}"
        data-review-action="${name}" data-review-kind="${esc(kind)}" data-review-id="${esc(id)}"
        data-review-status="${esc(currentStatus || "")}"
        aria-pressed="${active ? "true" : "false"}">${meta.glyph} ${esc(meta.label)}</button>`;
    }).join("");

    return `
      <section class="rv-strip" data-review-strip="${esc(keyOf(kind, id))}">
        <div class="rv-line">
          <span class="rv-label">這筆內容${done ? "已標記" : "看過了嗎？"}</span>
          ${buttons}
          ${current ? `<button type="button" class="rv-btn rv-clear" data-review-action="clear"
              data-review-kind="${esc(kind)}" data-review-id="${esc(id)}">取消標記</button>` : ""}
          ${total ? `<span class="rv-count">已標記 ${total} 筆
              <button type="button" class="rv-link" data-review-action="export">匯出審查結果</button></span>` : ""}
        </div>
        ${current ? `<p class="rv-done rv-${VERDICTS[current.verdict].tone}">
            ${esc(VERDICTS[current.verdict].glyph)} ${esc(VERDICTS[current.verdict].label)}
            ${current.note ? `· ${esc(current.note)}` : ""}
            <small>${esc((current.reviewed_at || "").slice(0, 16).replace("T", " "))}</small></p>` : ""}
        <div class="rv-note-slot" hidden></div>
      </section>`;
  }

  function noteForm(kind, id, status) {
    return `
      <label class="rv-note">哪裡有問題？（會存進審查結果，之後照著改）
        <textarea rows="2" class="rv-note-input" placeholder="例如：組成缺一味、劑量怪怪的、這個主治不對…"></textarea>
      </label>
      <div class="rv-note-actions">
        <button type="button" class="rv-btn rv-warn" data-review-action="issue-save"
          data-review-kind="${esc(kind)}" data-review-id="${esc(id)}" data-review-status="${esc(status || "")}">記下來</button>
        <button type="button" class="rv-btn rv-clear" data-review-action="issue-cancel">取消</button>
      </div>`;
  }

  function refresh(kind, id) {
    document.querySelectorAll(`[data-review-strip="${CSS.escape(keyOf(kind, id))}"]`).forEach((node) => {
      const status = node.querySelector("[data-review-status]")?.dataset.reviewStatus || "";
      node.outerHTML = strip(kind, id, status);
    });
  }

  function exportVerdicts() {
    const rows = allVerdicts();
    if (!rows.length) return;
    const payload = {
      export_version: STORE_VERSION,
      exported_at: new Date().toISOString(),
      note: "Owner review verdicts from the app. Apply with scripts/apply-review-verdicts.js (dry-run by default).",
      count: rows.length,
      verdicts: rows.sort((a, b) => (a.kind + a.id).localeCompare(b.kind + b.id))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `acuting-review-verdicts-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------- delegated events ---------- */

  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-review-action]");
    if (!btn) return;
    const { reviewAction: action, reviewKind: kind, reviewId: id, reviewStatus: status } = btn.dataset;

    if (action === "export") return exportVerdicts();

    const strip_ = btn.closest(".rv-strip");
    const slot = strip_?.querySelector(".rv-note-slot");

    if (action === "issue") {
      if (!slot) return;
      slot.innerHTML = noteForm(kind, id, status);
      slot.hidden = false;
      slot.querySelector(".rv-note-input")?.focus();
      return;
    }
    if (action === "issue-cancel") {
      if (slot) { slot.hidden = true; slot.innerHTML = ""; }
      return;
    }
    if (action === "issue-save") {
      const note = slot?.querySelector(".rv-note-input")?.value.trim() || "";
      setVerdict(kind, id, "issue", note, status);
      refresh(kind, id);
      return;
    }
    if (action === "confirmed") {
      const existing = verdictFor(kind, id);
      // second click on an active button clears it, so a mis-tap is cheap to undo
      setVerdict(kind, id, existing && existing.verdict === "confirmed" ? null : "confirmed", "", status);
      refresh(kind, id);
      return;
    }
    if (action === "clear") {
      setVerdict(kind, id, null);
      refresh(kind, id);
    }
  });

  window.AcuTingReview = { strip, verdictFor, allVerdicts, exportVerdicts, STORE_KEY };
})();
