/* clinical-sqlite-backend.js — 把 AcuTingClinicalStore 的 backend 插座接到 /__clinical 病例服務:
 *   - 本機 SQLite 服務(scripts/clinical-sqlite-service.js;已實作、未採用)
 *   - Cloudflare Worker + D1(src/worker.mjs;D33,手機與電腦同一本病例簿)
 * 兩者是同一份 HTTP 契約,adapter 不分家。
 *
 * 何時探測(兩個條件任一):
 *   (a) index.html 有 <meta name="acuting-clinical-backend" content="d1">:這份部署**宣告**自己帶病例服務,
 *       所以在任何主機名上都探測,而且探測失敗 = 毒丸(唯讀),**絕不**退回 localStorage ——
 *       meta 與 Worker 在同一個 commit 出貨,不會出現「宣告了卻沒有」的正常狀態。
 *   (b) 沒有宣告時,只在 loopback 主機名探測(本機服務情境);線上純靜態部署一個請求都不發。
 * 服務回 401/503 但帶服務標記 = 「服務在、拒絕我們」(沒登入 / Access 沒設定)→ 毒丸,不是「沒服務」。
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
      x.setRequestHeader("X-Requested-With", "XMLHttpRequest");   // Access 對 XHR 傾向回 401 而不是 302 到登入頁
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
    let revision = 0, stale = false, projection = null, dbName = "", backendKind = "sqlite", email = null, authLost = false;
    const state = () => ({ kind: "sqlite", backend: backendKind, email: email, authLost: authLost, revision, projection, db: dbName, keys: mirror.size });
    // 寫入一律帶自訂標頭:逼出 CORS 預檢、而服務不回任何 CORS 標頭 → 跨站帶 cookie 的寫入到不了服務(CSRF)。
    const WRITE_HEADERS = { "X-AcuTing-Client": "clinical-store" };
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
        const r = transport("PUT", API + "/kv/" + encodeURIComponent(CONFLICT_BACKUP_KEY), payload, { "Content-Type": "text/plain; charset=utf-8", ...WRITE_HEADERS });
        return r.status === 200 && !!parseWriteAck(r.text);   // 200 + 登入頁 HTML 不算備份成功
      } catch (_) { return false; }
    }
    /** 寫入的 ack 必須是 JSON 且帶整數 revision;其他一律視為沒寫進去。 */
    function parseWriteAck(text) {
      try { const j = JSON.parse(text); return (j && Number.isSafeInteger(j.revision)) ? j : null; } catch (_) { return null; }
    }
    function put(k, v) {
      ensureFresh();
      const s = String(v);
      const r = transport("PUT", API + "/kv/" + encodeURIComponent(k), s,
        { "Content-Type": "text/plain; charset=utf-8", "If-Match": String(revision), ...WRITE_HEADERS });
      if (r.status === 200) {
        /* 200 不等於寫進去了:Access 登入過期時,同步 XHR 會跟著 302 跑到登入頁,拿回 200 + HTML。
         * 只有 JSON 且帶整數 revision 才算成功;否則當失敗拋出,app 才會回滾並提示,不會把沒存到的當存到。 */
        const j = parseWriteAck(r.text);
        if (!j) throw new Error("病例服務的回應不是預期格式(最常見:登入已過期,回的是登入頁)—— 這次" + "寫入" + "**沒有**寫入。\n重新整理頁面重新登入,再把剛才的修改做一次。");
        mirror.set(k, s);
        revision = j.revision;
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
      const r = transport("DELETE", API + "/kv/" + encodeURIComponent(k), undefined, { "If-Match": String(revision), ...WRITE_HEADERS });
      if (r.status === 200) {
        const j = parseWriteAck(r.text);
        if (!j) throw new Error("病例服務的回應不是預期格式(最常見:登入已過期)—— 這次刪除**沒有**執行。重新整理頁面重新登入後再試。");
        mirror.delete(k);
        revision = j.revision;
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
      setInfo: (i) => {
        if (!i) return;
        if (i.backend) backendKind = String(i.backend);
        if (i.email !== undefined) email = i.email;
        if (i.authLost !== undefined) authLost = !!i.authLost;
      },
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
      el.textContent = "⛔ 病例服務無法使用 — 唯讀保護中(重新整理;持續的話把訊息貼給 Claude)";
      el.title = st.message || "";
      return;
    }
    if (st.authLost) {
      el.style.background = "#7f1d1d";
      el.textContent = "⛔ 登入已過期 — 重新整理頁面重新登入(現在不會寫入)";
      el.title = "病例服務回 401/503;為了不把資料寫進錯的地方,存檔會被擋下直到重新登入。";
      return;
    }
    const p = st.projection;
    const bad = !!(p && p.ok === false);
    const cloud = st.backend === "d1";
    el.style.background = bad ? "#78350f" : (cloud ? "#1e3a8a" : "#14532d");
    el.textContent = (cloud ? "☁ D1" : "🗄 SQLite") + " · " + (st.db || "") + " · rev " + st.revision +
      (cloud && st.email ? " · " + st.email : "") + (bad ? " · ⚠ 查詢表未更新" : "");
    el.title = cloud
      ? "病例正本在 Cloudflare D1(手機與電腦是同一本);登入身分:" + (st.email || "?")
      : (bad
        ? "正本已存好。查詢用的投影表最近一次重建失敗:\n" + ((p && p.summary) || []).slice(-8).join("\n")
        : (p ? "投影表最近重建:" + p.at + "(" + p.cases + " 筆病例)" : "正本在 SQLite;投影表在第一次存檔後建立"));
  }

  function install(opts) {
    opts = opts || {};
    const transport = opts.transport || xhrTransport;
    const store = global.AcuTingClinicalStore;
    const loc = opts.location || global.location;
    const onChange = opts.onChange || renderBadge;
    if (!store || !loc) return { installed: false, why: "no-store-or-location" };
    // 部署有沒有「宣告」自己帶病例服務(index.html 的 meta,與 Worker 同一個 commit 出貨)
    const declared = (() => {
      try {
        const m = global.document && global.document.querySelector && global.document.querySelector('meta[name="acuting-clinical-backend"]');
        return m ? String(m.getAttribute("content") || "").trim() : "";
      } catch (_) { return ""; }
    })();
    const expectService = opts.expectService !== undefined ? !!opts.expectService : (declared === "d1" || declared === "sqlite");
    if (!expectService && !opts.force && !isLoopback(loc.hostname)) return { installed: false, why: "not-loopback" };

    const poisonNow = (msg) => {
      const poison = poisonBackend(msg);
      store.setBackend(poison);
      global.AcuTingClinicalBackend = poison;
      try { onChange(poison.state()); } catch (_) { /* */ }
      return { installed: true, poisoned: true, why: msg };
    };

    const p = transport("GET", API + "/ping");
    let ping = null;
    try { ping = JSON.parse(p.text); } catch (_) { ping = null; }
    const hasMarker = !!(ping && ping.service === MARKER);
    if (p.status !== 200 || !hasMarker) {
      if (hasMarker) {
        // 服務在、但拒絕我們(401 沒登入 / 503 Access 沒設定):唯讀,不退回 localStorage
        return poisonNow("病例服務拒絕連線(HTTP " + p.status + "):" + (ping.message || ping.error || "") +
          "\n重新整理頁面重新登入;若持續,把這段貼給 Claude。");
      }
      if (expectService) {
        if (p.status === 401 || p.status === 403) {
          return poisonNow("尚未登入或登入已過期(HTTP " + p.status + ")。重新整理頁面完成 Access 登入;在那之前病例唯讀。");
        }
        return poisonNow("這個部署宣告有病例服務(" + (declared || "expected") + "),但探測不到(HTTP " + p.status + (p.error ? ", " + p.error : "") + ")。" +
          "已進入唯讀保護 —— 重新整理;若持續,把這段貼給 Claude。");
      }
      return { installed: false, why: "no-service" };
    }

    // 從這裡開始,服務確定存在:任何失敗都是毒丸,不是退回 localStorage。
    let backend;
    try {
      backend = makeBackend(transport, { onChange: onChange });
      backend.setDbName(ping.db || "");
      backend.setInfo({ backend: ping.backend || "sqlite", email: ping.email || null });
      backend.refresh();
    } catch (e) {
      return poisonNow((e && e.message) || String(e));
    }
    store.setBackend(backend);
    global.AcuTingClinicalBackend = backend;
    try { onChange(backend.state()); } catch (_) { /* */ }
    // 每 10 秒 ping 一次更新徽章(投影狀態 / 別台裝置的 revision / 登入是否過期);不碰鏡像內容。
    try {
      if (global.setInterval && global.document) {
        const t = global.setInterval(() => {
          if (global.document.hidden) return;
          const r = transport("GET", API + "/ping");
          let j = null;
          try { j = JSON.parse(r.text); } catch (_) { j = null; }
          if (r.status !== 200) {
            if (j && j.service === MARKER && (r.status === 401 || r.status === 503)) { backend.setInfo({ authLost: true }); onChange(backend.state()); }
            return;
          }
          if (!j || j.service !== MARKER) {
            // 200 但不是我們的 JSON = 被 Access 轉去登入頁(登入過期)。先亮紅徽章;下一次寫入會被 parseWriteAck 擋下。
            backend.setInfo({ authLost: true }); onChange(backend.state());
            return;
          }
          backend.setInfo({ authLost: false, email: j.email !== undefined ? j.email : backend.state().email });
          const st = backend.state();
          st.projection = j.projection || st.projection;
          if (Number.isSafeInteger(j.revision) && j.revision !== st.revision) backend.markStale();
          onChange(st);
        }, 10000);
        if (t && t.unref) t.unref();
      }
    } catch (_) { /* */ }
    return { installed: true, revision: backend.state().revision, db: ping.db, backend: ping.backend || "sqlite", email: ping.email || null };
  }

  global.AcuTingClinicalSqliteBackend = { install, makeBackend, poisonBackend, renderBadge, MARKER, API, CONFLICT_BACKUP_KEY };

  // 瀏覽器裡自動安裝(script 是 defer,store 已在前面載好)。Node 測試環境只匯出,不自動跑。
  if (global.document && global.XMLHttpRequest && global.location) {
    try { install(); }
    catch (e) {
      // install 內部已把「服務存在之後」的失敗全收成毒丸;會走到這裡只剩探測階段本身炸掉
      // (例如瀏覽器擋同步 XHR)。宣告了雲端的部署**不准**因此退回 localStorage(那是兩本簿子的入口);
      // 沒宣告的(本機服務情境)才維持 localStorage 並在 console 說一聲。
      const msg = String((e && e.message) || e);
      let declared = false;
      try { declared = !!global.document.querySelector('meta[name="acuting-clinical-backend"]'); } catch (_) { declared = false; }
      if (declared && global.AcuTingClinicalStore) {
        const poison = poisonBackend("雲端病例連接器啟動失敗(" + msg + ")—— 唯讀保護。重新整理;若持續,把這段貼給 Claude。");
        global.AcuTingClinicalStore.setBackend(poison);
        global.AcuTingClinicalBackend = poison;
        try { renderBadge(poison.state()); } catch (_) { /* */ }
      } else {
        try { console.error("clinical-sqlite-backend: 探測失敗,維持 localStorage:", msg); } catch (_) { /* */ }
      }
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
