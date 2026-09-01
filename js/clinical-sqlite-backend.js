/* clinical-sqlite-backend.js — 把 AcuTingClinicalStore 的 backend 插座接到本機 SQLite 服務
 * (scripts/clinical-sqlite-service.js)。D18 的 pointer 步;Ting 2026-09-01 裁定提前執行。
 *
 * 何時生效:只有在頁面是由那個服務供應時 —— 同源 GET /__clinical/ping 回應帶服務標記。
 *   在 workers.dev / dev-server.js 上這支什麼都不做,app 行為逐位元組不變;而且只在
 *   loopback 主機名(127.0.0.1 / localhost)上才會探測,線上版連那一個請求都不會發。
 *   換句話說:**開哪個網址 = 用哪個儲存**。回滾 = 開回原本的網址;兩邊互不覆寫。
 *
 * 同步 XHR(刻意):store 的 read()/write() 是同步契約,app 的存檔路徑靠 write() 拋錯
 *   來回滾記憶體狀態(persistClinicalCases → snapshot)。改成 async 會讓「存檔失敗」變成
 *   事後通知,那正是要避免的靜默遺失。loopback 上一趟 < 1 ms。若哪天瀏覽器真的拿掉
 *   同步 XHR,改動面只有這一個檔。
 *
 * 讀:啟動時一次抓完整快照到記憶體鏡像;之後讀鏡像。別的分頁寫入 → BroadcastChannel
 *   通知 → 鏡像標記過期 → 下一次讀之前重抓。所以 store 的樂觀鎖(rawNow 比對)看得到
 *   別的分頁的寫入,行為與 localStorage 版相同。分頁切回前景也標過期(保險)。
 * 寫:PUT 帶 If-Match(上次看到的 revision);409 → 先把被拒的內容備份到
 *   acuting-clinical-conflict-backup(強制寫,不帶 If-Match),再拋錯讓 app 回滾 + 提示。
 * 服務有標記卻讀不到快照 → 裝上一個每個方法都拋錯的 backend(毒丸),store.load() 會拋,
 *   app 走既有的唯讀保護。**絕不**靜默退回 localStorage —— 那會讓她在一本空簿上建新病例,
 *   幾天後才發現兩本簿子。
 *
 * UI 凍結(D32)聲明:左下角徽章是這支唯一的介面新增,用途是讓人一眼知道「這個分頁
 *   正在寫哪一個儲存」—— 兩本簿子並存的期間,這是安全資訊,不是功能。 */
(function (global) {
  "use strict";
  const API = "/__clinical";
  const MARKER = "acuting-clinical-sqlite";
  const STORAGE_KEY = "acuting-clinical-cases-v1";
  const CONFLICT_BACKUP_KEY = "acuting-clinical-conflict-backup";
  const CHANNEL = "acuting-clinical-sqlite";
  const BADGE_ID = "acuting-sqlite-badge";

  const isLoopback = (h) => h === "127.0.0.1" || h === "localhost" || h === "[::1]";

  function xhrTransport(method, path, body, headers) {
    const x = new global.XMLHttpRequest();
    try {
      x.open(method, path, false);
      for (const k in (headers || {})) x.setRequestHeader(k, headers[k]);
      x.send(body === undefined ? null : body);
    } catch (e) {
      return { status: 0, text: "", error: String((e && e.message) || e) };
    }
    return { status: x.status, text: x.responseText || "" };
  }

  function makeBackend(transport, hooks) {
    hooks = hooks || {};
    const mirror = new Map();
    let revision = 0, stale = false, projection = null, dbName = "";
    const state = () => ({ kind: "sqlite", revision, projection, db: dbName, keys: mirror.size });
    const onChange = () => { try { if (hooks.onChange) hooks.onChange(state()); } catch (_) { /* 徽章壞了不能害存檔 */ } };

    function refresh() {
      const r = transport("GET", API + "/kv");
      if (r.status !== 200) {
        throw new Error("SQLite 服務有回應但讀不到資料(HTTP " + r.status + (r.error ? ",  " + r.error : "") + ")。" +
          "已進入唯讀保護 —— 重新載入本頁;若持續,看服務視窗印的錯誤。");
      }
      let j;
      try { j = JSON.parse(r.text); } catch (_) { throw new Error("SQLite 服務回了不是 JSON 的內容,拒絕載入(唯讀保護)。"); }
      if (!j || typeof j.keys !== "object" || j.keys === null || !Number.isSafeInteger(j.revision)) {
        throw new Error("SQLite 服務快照形狀不對,拒絕載入(唯讀保護)。");
      }
      mirror.clear();
      for (const k in j.keys) mirror.set(k, String(j.keys[k]));
      revision = j.revision;
      projection = j.projection || null;
      stale = false;
      onChange();
    }
    const ensureFresh = () => { if (stale) refresh(); };
    const get = (k) => { ensureFresh(); return mirror.has(k) ? mirror.get(k) : null; };

    function failure(r, what) {
      if (r.status === 0) {
        return new Error("SQLite 服務沒有回應 —— 這次" + what + "**沒有**寫入。\n" +
          "確認服務的黑色視窗還開著(標題 acuting-clinical-sqlite),然後重新載入本頁再做一次。" +
          (r.error ? "\n(" + r.error + ")" : ""));
      }
      let msg = "";
      try { const j = JSON.parse(r.text); msg = j.message || j.error || ""; } catch (_) { /* 非 JSON */ }
      return new Error("SQLite 服務拒絕" + what + "(HTTP " + r.status + (msg ? ":" + msg : "") + ")。零寫入。");
    }
    function stash(k, v, why) {
      try {
        let parsed = null, cases = null;
        try { parsed = JSON.parse(v); } catch (_) { /* 不是 JSON 也照樣備份 */ }
        if (Array.isArray(parsed)) cases = parsed;
        else if (parsed && Array.isArray(parsed.cases)) cases = parsed.cases;
        const payload = JSON.stringify({ stashed_at: new Date().toISOString(), reason: why, key: k, cases: cases, raw: cases ? undefined : v });
        const r = transport("PUT", API + "/kv/" + encodeURIComponent(CONFLICT_BACKUP_KEY), payload, { "Content-Type": "text/plain; charset=utf-8" });
        return r.status === 200;
      } catch (_) { return false; }
    }
    function put(k, v) {
      ensureFresh();
      const s = String(v);
      const r = transport("PUT", API + "/kv/" + encodeURIComponent(k), s,
        { "Content-Type": "text/plain; charset=utf-8", "If-Match": String(revision) });
      if (r.status === 200) {
        let j = {}; try { j = JSON.parse(r.text); } catch (_) { /* */ }
        mirror.set(k, s);
        if (Number.isSafeInteger(j.revision)) revision = j.revision;
        announce(); onChange();
        return;
      }
      if (r.status === 409) {
        const ok = stash(k, s, "另一個分頁(或匯入工具)在本分頁上次讀取之後寫入過(SQLite revision 衝突)");
        try { refresh(); } catch (_) { /* 已在錯誤路徑上 */ }
        throw new Error("拒絕寫入:另一個分頁(或匯入工具)在這之後存過檔,直接寫入會蓋掉它的內容。\n" +
          "本分頁的內容" + (ok ? "已備份到 SQLite 的 " + CONFLICT_BACKUP_KEY + "(沒有遺失)" : "**備份也失敗了**") + "。\n" +
          "做法:重新載入本頁(會看到最新內容),再把剛才的修改補一次。");
      }
      throw failure(r, "寫入");
    }
    function del(k) {
      ensureFresh();
      const r = transport("DELETE", API + "/kv/" + encodeURIComponent(k), undefined, { "If-Match": String(revision) });
      if (r.status === 200) {
        let j = {}; try { j = JSON.parse(r.text); } catch (_) { /* */ }
        mirror.delete(k);
        if (Number.isSafeInteger(j.revision)) revision = j.revision;
        announce(); onChange();
        return;
      }
      if (r.status === 409) {
        try { refresh(); } catch (_) { /* */ }
        throw new Error("拒絕刪除:另一個分頁在這之後寫過檔。重新載入本頁後再試。");
      }
      throw failure(r, "刪除");
    }

    let bc = null;
    try {
      if (typeof global.BroadcastChannel === "function") {
        bc = new global.BroadcastChannel(CHANNEL);
        bc.onmessage = () => { stale = true; };
        // Node 也有全域 BroadcastChannel,而且它會撐住 event loop(測試 PASS 之後不退出)。
        // 瀏覽器沒有 unref,這行在那裡是 no-op。
        if (typeof bc.unref === "function") bc.unref();
      }
    } catch (_) { bc = null; }
    const announce = () => { try { if (bc) bc.postMessage({ revision: revision }); } catch (_) { /* */ } };
    try {
      if (global.document && global.document.addEventListener) {
        global.document.addEventListener("visibilitychange", () => { if (!global.document.hidden) stale = true; });
      }
    } catch (_) { /* */ }

    return {
      read: () => get(STORAGE_KEY),
      write: (s) => put(STORAGE_KEY, s),
      readKey: get,
      writeKey: put,
      removeKey: del,
      refresh: refresh,
      markStale: () => { stale = true; },
      state: state,
      setDbName: (n) => { dbName = String(n || ""); },
    };
  }

  function poisonBackend(message) {
    const boom = () => { throw new Error(message); };
    return { read: boom, write: boom, readKey: boom, writeKey: boom, removeKey: boom, state: () => ({ kind: "sqlite-unavailable", message: message }) };
  }

  function renderBadge(st) {
    const d = global.document;
    if (!d || !d.body) return;
    let el = d.getElementById(BADGE_ID);
    if (!el) {
      el = d.createElement("div");
      el.id = BADGE_ID;
      el.setAttribute("role", "status");
      el.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99999;font:12px/1.4 system-ui,sans-serif;" +
        "padding:6px 10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.25);max-width:min(440px,90vw);color:#fff;";
      d.body.appendChild(el);
    }
    if (st.kind === "sqlite-unavailable") {
      el.style.background = "#7f1d1d";
      el.textContent = "⛔ SQLite 服務讀取失敗 — 唯讀保護中";
      el.title = st.message || "";
      return;
    }
    const p = st.projection;
    const bad = !!(p && p.ok === false);
    el.style.background = bad ? "#78350f" : "#14532d";
    el.textContent = "🗄 SQLite · " + (st.db || "") + " · rev " + st.revision + (bad ? " · ⚠ 查詢表未更新" : "");
    el.title = bad
      ? "正本已存好。查詢用的投影表最近一次重建失敗:\n" + ((p && p.summary) || []).slice(-8).join("\n")
      : (p ? "投影表最近重建:" + p.at + "(" + p.cases + " 筆病例)" : "正本在 SQLite;投影表在第一次存檔後建立");
  }

  function install(opts) {
    opts = opts || {};
    const transport = opts.transport || xhrTransport;
    const store = global.AcuTingClinicalStore;
    const loc = opts.location || global.location;
    const onChange = opts.onChange || renderBadge;
    if (!store || !loc) return { installed: false, why: "no-store-or-location" };
    if (!opts.force && !isLoopback(loc.hostname)) return { installed: false, why: "not-loopback" };
    const p = transport("GET", API + "/ping");
    if (p.status !== 200) return { installed: false, why: "no-service" };
    let ping = null;
    try { ping = JSON.parse(p.text); } catch (_) { return { installed: false, why: "no-service" }; }
    if (!ping || ping.service !== MARKER) return { installed: false, why: "no-service" };

    // 從這裡開始,服務確定存在:任何失敗都是毒丸,不是退回 localStorage。
    let backend;
    try {
      backend = makeBackend(transport, { onChange: onChange });
      backend.setDbName(ping.db || "");
      backend.refresh();
    } catch (e) {
      const poison = poisonBackend((e && e.message) || String(e));
      store.setBackend(poison);
      global.AcuTingClinicalBackend = poison;
      try { onChange(poison.state()); } catch (_) { /* */ }
      return { installed: true, poisoned: true, why: poison.state().message };
    }
    store.setBackend(backend);
    global.AcuTingClinicalBackend = backend;
    try { onChange(backend.state()); } catch (_) { /* */ }
    // 投影狀態是存檔之後非同步算出來的;每 10 秒用 ping 把徽章更新一次(不碰鏡像)。
    try {
      if (global.setInterval && global.document) {
        const t = global.setInterval(() => {
          if (global.document.hidden) return;
          const r = transport("GET", API + "/ping");
          if (r.status !== 200) return;
          try {
            const j = JSON.parse(r.text);
            const st = backend.state();
            st.projection = j.projection || st.projection;
            if (Number.isSafeInteger(j.revision) && j.revision !== st.revision) backend.markStale();
            onChange(st);
          } catch (_) { /* */ }
        }, 10000);
        if (t && t.unref) t.unref();
      }
    } catch (_) { /* */ }
    return { installed: true, revision: backend.state().revision, db: ping.db };
  }

  global.AcuTingClinicalSqliteBackend = { install, makeBackend, poisonBackend, renderBadge, MARKER, API, CONFLICT_BACKUP_KEY };

  // 瀏覽器裡自動安裝(script 是 defer,store 已在前面載好)。Node 測試環境只匯出,不自動跑。
  if (global.document && global.XMLHttpRequest && global.location) {
    try { install(); }
    catch (e) {
      // install 內部已把「服務存在之後」的失敗全收成毒丸;會走到這裡只剩探測階段本身炸掉
      // (例如瀏覽器擋同步 XHR)。在 loopback 上這值得被看到,但不能擋 app 啟動。
      try { console.error("clinical-sqlite-backend: 探測失敗,維持 localStorage:", e && e.message); } catch (_) { /* */ }
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
