/* herb-inventory-ui.js — 藥櫃的畫面(D36,2026-11-03)。計算全在 js/herb-inventory.js(有真值表);這裡只畫畫面與寫入。
 *
 * 儲存:跟病例同一個雲端(AcuTingClinicalBackend.readKey / writeKey,同一個通行碼、同一個 revision),
 *   key = acuting-herb-inventory-v1。開藥紀錄有病人顯示代號與病症,所以一定要在通行碼後面,不放 localStorage。
 *   沒有雲端服務的本機開法(file://)才退回 localStorage,畫面會講清楚。
 * 寫入一律:算出新資料 → writeKey → 成功才換掉記憶體;失敗(另一台裝置剛寫過 = 409)就重讀、提示、什麼都不改。
 * 依賴 app.js 的全域:escapeHtml、escapeAttribute、openKnowledgeRecord、clinicalCases、localDateISO、AcuTingCaseSearch。 */
(function () {
  "use strict";
  const H = window.AcuTingHerbInventory;
  const root = () => document.getElementById("herbInvApp");
  if (!H) return;
  const esc = (v) => (typeof escapeHtml === "function" ? escapeHtml(v) : String(v ?? ""));
  const attr = (v) => (typeof escapeAttribute === "function" ? escapeAttribute(v) : String(v ?? ""));
  const today = () => (typeof localDateISO === "function" ? localDateISO() : H.isoOf(new Date()));
  const fmtG = (g) => (Math.abs(g) >= 100 ? Math.round(g) : Math.round(g * 10) / 10).toLocaleString() + " g";
  const newId = (p) => `${p}.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const CATS = (window.AcuTingCaseSearch && window.AcuTingCaseSearch.CASE_CATEGORIES) || {};
  const catLabel = (k) => (CATS[k] ? `${CATS[k].icon} ${CATS[k].zh}` : "");

  // ── 儲存 ──
  const backend = () => { const b = window.AcuTingClinicalBackend; return b && typeof b.readKey === "function" && typeof b.writeKey === "function" ? b : null; };
  let inv = null, loadError = "", tab = "stock", selected = "", msg = { text: "", ok: true };
  // 讀、記住基準、寫之前比對 —— 都在純函式層的 makeSession(有真值表:另一台裝置寫過就拒絕,不會把對方的帳蓋掉)
  const session = H.makeSession({
    read() {
      const b = backend();
      if (b) return b.readKey(H.STORAGE_KEY);
      try { return localStorage.getItem(H.STORAGE_KEY); } catch (_) { return null; }
    },
    write(s) {
      const b = backend();
      if (b) b.writeKey(H.STORAGE_KEY, s);
      else localStorage.setItem(H.STORAGE_KEY, s);
    },
  });
  function load() { inv = session.load(); loadError = session.error(); return inv; }
  function ensure() { inv = session.ensure(); loadError = session.error(); return inv; }
  // 成功才換掉記憶體;失敗什麼都不改、重讀、說出原因
  function commit(next, okText) {
    const r = session.commit(next);
    inv = session.data();
    loadError = session.error();
    msg = r.ok ? { text: okText || "已存", ok: true } : { text: r.message, ok: false };
    return r.ok;
  }
  const storeLabel = () => (backend() ? (backend().state && backend().state().backend === "d1" ? "雲端(與病例同一本)" : "本機病例服務") : "這個瀏覽器(沒有雲端服務)");

  // ── 共用片段 ──
  const product = (id) => inv.products.find((p) => p.id === id);
  const originText = (p) => [p.madeIn ? `${p.madeIn}製` : "", p.origin ? `產地 ${p.origin}` : "", p.organic ? "有機" : ""].filter(Boolean).join(" · ");
  function kbLink(p, text) {
    const kind = p.kind === "formula" ? "formula" : "herb";
    return `<button type="button" class="hi-kb" data-hi-kb="${attr(kind)}|${attr(p.knowledgeId)}" title="打開${kind === "formula" ? "方劑" : "中藥"}卡">${esc(text || (kind === "formula" ? "方劑卡" : "中藥卡"))} ↗</button>`;
  }
  function productName(p) {
    return `${p.frequent ? `<span class="hi-star" title="常用">★</span> ` : ""}${esc(p.nameZh)}${p.organic ? ` <span class="hi-pill hi-ok">有機</span>` : ""}
      <small>${esc(p.nameEn)} · ${esc(p.brand)}${p.code ? " · " + esc(p.code) : ""}${originText(p) ? " · " + esc(originText(p)) : ""}</small>`;
  }
  function statusPills(s) {
    const S = inv.settings, out = [];
    if (s.expired.length) out.push(`<span class="hi-pill hi-warn">已過期</span>`);
    if (s.frequentLow) out.push(`<span class="hi-pill hi-warn">常用 &lt; ${S.frequentMinG} g</span>`);
    else if (s.low) out.push(`<span class="hi-pill hi-warn">補貨</span>`);
    if (s.expiring.length) out.push(`<span class="hi-pill hi-amber">${H.daysBetween(today(), s.expiring[0].expiry)} 天到期</span>`);
    if (s.openedLong.length) out.push(`<span class="hi-pill hi-amber">開封過久</span>`);
    if (s.slow) out.push(`<span class="hi-pill">久未使用</span>`);
    return out.join(" ") || `<span class="hi-pill hi-ok">正常</span>`;
  }
  // 依名稱找知識庫的方劑 / 中藥 id(建立品項時用)
  function findKnowledgeId(kind, nameZh, nameEn) {
    const recs = (window.ACUTING_KNOWLEDGE && window.ACUTING_KNOWLEDGE[kind === "formula" ? "formulas" : "herbs"] || {}).records || [];
    const zh = String(nameZh || "").trim(), en = String(nameEn || "").trim().toLowerCase();
    const hit = recs.find((r) => r.name_zh === zh) || (en ? recs.find((r) => String(r.pinyin || "").toLowerCase() === en || String(r.name_en || "").toLowerCase() === en) : null);
    return hit ? hit.id : "";
  }

  // ── 警示條 ──
  function alertsHtml() {
    const t = today(), all = inv.products.filter((p) => !p.archived).map((p) => ({ p, s: H.stats(inv, p, t) }));
    const n = (f) => all.filter(f).length;
    const value = all.reduce((s, x) => s + x.s.value, 0);
    const month = inv.products.reduce((s, p) => s + H.usageG(inv, p.id, 30, t), 0);
    const items = [
      ["warn", n((x) => x.s.frequentLow), "常用藥快用完", `低於 ${inv.settings.frequentMinG} g`, "shop"],
      ["warn", n((x) => x.s.low), "需要補貨", "低於補貨點", "shop"],
      ["amber", n((x) => x.s.expiring.length || x.s.expired.length), "即將 / 已過期", `${inv.settings.expiryWarnDays} 天內`, "stock"],
      ["amber", n((x) => x.s.openedLong.length), "開封過久", "超過開封後期限", "stock"],
      ["", n((x) => x.s.slow), "久未使用", `${inv.settings.slowDays} 天沒用`, "stock"],
    ];
    // 半年回顧到期(D37):只在到期時多一格,沒到期不佔位
    const rem = RXP() ? RXP().reminderState(inv.settings.rxReview, t) : null;
    if (rem && rem.due) items.push(["warn", "🗓", "半年開藥回顧", rem.firstTime ? "還沒做過" : "到期了", "review"]);
    return `<div class="hi-alerts">${items.map(([cls, c, label, sub, go]) =>
      `<button type="button" class="hi-alert ${c ? cls : ""}" data-hi-go="${go}"><b>${c}</b><span>${label} · ${sub}</span></button>`).join("")}
      <button type="button" class="hi-alert hi-calm" data-hi-go="data"><b>US$ ${value.toFixed(0)}</b><span>庫存價值 · 近 30 天用 ${fmtG(month)}</span></button></div>`;
  }

  // ── 庫存 ──
  const stockFilter = { q: "", kind: "all", source: "all", alerts: false, archived: false };
  function stockHtml() {
    const t = today();
    const rows = inv.products.map((p) => ({ p, s: H.stats(inv, p, t) })).filter(({ p, s }) => {
      if (!!p.archived !== stockFilter.archived) return false;
      const q = stockFilter.q.trim().toLowerCase();
      if (q && ![p.nameZh, p.nameEn, p.brand, p.code, p.origin].join(" ").toLowerCase().includes(q)) return false;
      if (stockFilter.kind !== "all" && p.kind !== stockFilter.kind) return false;
      if (stockFilter.source !== "all" && p.source !== stockFilter.source) return false;
      if (stockFilter.alerts && !(s.low || s.expiring.length || s.expired.length || s.openedLong.length || s.slow)) return false;
      return true;
    }).sort((a, b) => { const dos = (x) => (Number.isFinite(x.s.dos) ? x.s.dos : 1e12);   // Infinity − Infinity 是 NaN,排序會亂
      return (b.s.low - a.s.low) || (dos(a) - dos(b)) || a.p.nameZh.localeCompare(b.p.nameZh); });
    const sel = selected && product(selected);
    return `<div class="hi-two">
      <section class="hi-panel">
        <div class="hi-toolbar">
          <input type="search" id="hiQ" placeholder="搜尋藥名、品牌、編號、產地…" value="${attr(stockFilter.q)}" aria-label="搜尋藥櫃">
          <select id="hiKind" aria-label="種類"><option value="all">方劑 + 單味</option>${Object.entries(H.KINDS).map(([k, v]) => `<option value="${k}" ${stockFilter.kind === k ? "selected" : ""}>${v}</option>`).join("")}</select>
          <select id="hiSource" aria-label="在哪裡買"><option value="all">所有購買地</option>${Object.entries(H.SOURCES).map(([k, v]) => `<option value="${k}" ${stockFilter.source === k ? "selected" : ""}>${v}</option>`).join("")}</select>
          <label class="hi-hint"><input type="checkbox" id="hiAlerts" ${stockFilter.alerts ? "checked" : ""}> 只看要處理的</label>
          <label class="hi-hint"><input type="checkbox" id="hiArchived" ${stockFilter.archived ? "checked" : ""}> 看封存的</label>
        </div>
        ${inv.products.length ? `<div class="hi-table-wrap"><table class="hi-table">
          <thead><tr><th>藥品</th><th class="num">庫存</th><th class="num hi-hide-sm">日均</th><th class="num">可用天數</th><th>狀態</th></tr></thead>
          <tbody>${rows.map(({ p, s }) => {
            const pct = s.reorder > 0 ? Math.min(100, (s.usable / (s.reorder * 2)) * 100) : 100;
            const expG = Math.round((s.stock - s.usable) * 10) / 10;
            return `<tr class="hi-row ${p.id === selected ? "is-sel" : ""}" data-hi-pid="${attr(p.id)}" tabindex="0">
              <td><span class="hi-kind">${H.KINDS[p.kind]} · ${H.FORMS[p.form]}</span><div class="hi-name">${productName(p)}</div></td>
              <td class="num">${fmtG(s.stock)}${expG > 0 ? `<div class="hi-hint">可用 ${fmtG(s.usable)}</div>` : ""}<div class="hi-gauge"><i class="${s.low ? "low" : ""}" style="width:${pct}%"></i></div></td>
              <td class="num hi-hide-sm">${s.adu ? s.adu.toFixed(1) + " g" : "—"}</td>
              <td class="num">${Number.isFinite(s.dos) ? Math.floor(s.dos) + " 天" : "—"}</td>
              <td>${statusPills(s)}</td></tr>`; }).join("") || `<tr><td colspan="5" class="hi-hint">沒有符合的藥品。</td></tr>`}</tbody></table></div>`
          : `<div class="hi-empty"><b>藥櫃還是空的</b><p>先到「入庫」建立第一個品項並入一批;之後用量、開方、補貨提醒都會從這裡算。</p><button type="button" class="hi-primary" data-hi-go="receive">去入庫</button></div>`}
        <p class="hi-hint">補貨點 = 日均用量 × (補貨要多久 ${inv.settings.leadDays} 天 + 安全天數 ${inv.settings.safetyDays} 天);★ 常用的低於 ${inv.settings.frequentMinG} g 另外提醒。</p>
      </section>
      <aside class="hi-panel">${sel ? detailHtml(sel) : `<h3>藥品細節</h3><p class="hi-hint">點左邊任一列:每一批的批號、效期、開封日、還剩多少、每克成本,以及下一瓶該開哪一批(先到期先用)。</p>`}</aside>
    </div>`;
  }
  function detailHtml(p) {
    const t = today(), s = H.stats(inv, p, t);
    const weeks = Array.from({ length: 12 }, (_, i) => H.usageG(inv, p.id, 7, H.addDays(t, -7 * (11 - i))));
    const max = Math.max(1, ...weeks), W = 300, HH = 70;
    const bars = weeks.map((g, i) => { const h = (g / max) * (HH - 18); return `<rect x="${i * 25 + 2}" y="${HH - 14 - h}" width="19" height="${h}" rx="2"></rect>`; }).join("");
    const lots = [...s.lots].sort((a, b) => String(a.expiry).localeCompare(String(b.expiry)));
    return `<div class="hi-detail">
      <div><span class="hi-kind">${H.KINDS[p.kind]} · ${H.FORMS[p.form]} ${esc(p.ratio)}</span><h3>${esc(p.nameZh)}${p.organic ? ` <span class="hi-pill hi-ok">有機</span>` : ""}</h3>
        <div class="hi-hint">${esc(p.nameEn)} · ${esc(p.brand)} ${esc(p.code)} · ${p.packageG} g/包裝</div>
        <div class="hi-hint">${esc(originText(p) || "產地未填")} · 常在${H.SOURCES[p.source]}買 · 開封後 ${H.shelfMonths(inv, p)} 個月內用完</div></div>
      <div class="hi-grid3">
        <div class="hi-stat"><small>庫存${s.stock > s.usable ? `(可用 ${fmtG(s.usable)})` : ""}</small><b>${fmtG(s.stock)}</b></div>
        <div class="hi-stat"><small>可用天數</small><b>${Number.isFinite(s.dos) ? Math.floor(s.dos) : "—"}</b></div>
        <div class="hi-stat"><small>補貨點</small><b>${fmtG(s.reorder)}</b></div>
      </div>
      <figure class="hi-chart"><figcaption class="hi-hint">近 12 週每週用量(g)</figcaption>
        <svg viewBox="0 0 ${W} ${HH}" role="img" aria-label="近 12 週用量">${bars}<text x="0" y="${HH - 2}">12 週前</text><text x="${W - 30}" y="${HH - 2}">本週</text><text x="${W}" y="10" text-anchor="end">${max.toFixed(0)} g</text></svg></figure>
      <div class="hi-lots">${lots.map((l) => {
        const left = H.daysBetween(t, l.expiry);
        const openedUntil = l.openedDate ? H.addMonths(l.openedDate, H.shelfMonths(inv, p)) : "";
        const isNext = s.next && s.next.id === l.id;
        return `<div class="hi-lot ${isNext ? "is-next" : ""}">
          <span><b class="hi-mono">批號 ${esc(l.lotNo || "—")}</b> ${isNext ? `<span class="hi-pill hi-ok">下一瓶用這批</span>` : ""}</span>
          <span class="num">${l.remaining > 0.001 ? fmtG(l.remaining) : "用完"}</span>
          <span class="hi-meta">效期 ${esc(l.expiry)}(${left < 0 ? `<b class="hi-warn-text">已過期 ${-left} 天</b>` : `${left} 天`})· 買於 ${esc(l.purchaseDate)} ${esc(l.place)} ·
            US$ ${l.price.toFixed(2)}(${H.costPerGram(l).toFixed(3)}/g)·
            ${l.openedDate ? `開封 ${esc(l.openedDate)}${openedUntil < t && l.remaining > 0.001 ? ` <b class="hi-amber-text">· 開封已超過建議期限</b>` : `,建議 ${openedUntil} 前用完`}` : "未開封"}</span>
          <span class="hi-lot-actions">${l.remaining > 0.001 ? `<button type="button" data-hi-adjust="${attr(l.id)}">盤點調整</button><button type="button" data-hi-discard="${attr(l.id)}">報廢這批</button>` : ""}<button type="button" data-hi-edit-lot="${attr(l.id)}">修改這批資訊</button></span>
        </div>`; }).join("") || `<p class="hi-hint">還沒有入庫紀錄。</p>`}</div>
      <div class="hi-toolbar">
        <button type="button" class="hi-primary" data-hi-quick-use="${attr(p.id)}">記一筆用量</button>
        <button type="button" data-hi-quick-recv="${attr(p.id)}">入庫一批</button>
        <button type="button" data-hi-frequent="${attr(p.id)}" aria-pressed="${p.frequent}">${p.frequent ? `★ 常用(低於 ${inv.settings.frequentMinG} g 提醒)` : "☆ 設為常用"}</button>
        ${kbLink(p, p.kind === "formula" ? "看方劑卡" : "看中藥卡")}
        <button type="button" data-hi-edit-product="${attr(p.id)}" aria-expanded="${editingProduct === p.id}">編輯品項</button>
        <button type="button" data-hi-archive="${attr(p.id)}">${p.archived ? "取消封存" : "封存(不再進貨)"}</button>
      </div>
      ${editingProduct === p.id ? productFormHtml(p) : ""}
    </div>`;
  }
  // 編輯品項:只改描述(品名、品牌、劑型、包裝、產地…);庫存數量走帳,不在這裡改
  let editingProduct = "";
  function productFormHtml(p) {
    const opt = (obj, cur) => Object.entries(obj).map(([k, v]) => `<option value="${k}" ${cur === k ? "selected" : ""}>${v}</option>`).join("");
    return `<div class="hi-panel hi-edit" id="hiEditProduct">
      <h3>編輯品項</h3>
      <div class="hi-grid2">
        <label class="hi-f"><span>中文名</span><input data-hi-ep="nameZh" value="${attr(p.nameZh)}"></label>
        <label class="hi-f"><span>英文 / 拼音</span><input data-hi-ep="nameEn" value="${attr(p.nameEn)}"></label>
        <label class="hi-f"><span>種類</span><select data-hi-ep="kind">${opt(H.KINDS, p.kind)}</select></label>
        <label class="hi-f"><span>劑型</span><select data-hi-ep="form">${opt(H.FORMS, p.form)}</select></label>
        <label class="hi-f"><span>品牌</span><input data-hi-ep="brand" list="hiBrandList" value="${attr(p.brand)}"></label>
        <label class="hi-f"><span>品牌編號</span><input data-hi-ep="code" value="${attr(p.code)}"></label>
        <label class="hi-f"><span>每包裝克數</span><input type="number" data-hi-ep="packageG" value="${attr(p.packageG)}"></label>
        <label class="hi-f"><span>濃縮比</span><input data-hi-ep="ratio" value="${attr(p.ratio)}"></label>
        <label class="hi-f"><span>製造地</span><select data-hi-ep="madeIn">${H.MADE_IN.map((x) => `<option ${p.madeIn === x ? "selected" : ""}>${x}</option>`).join("")}<option value="" ${p.madeIn ? "" : "selected"}>未填</option></select></label>
        <label class="hi-f"><span>產地 / 產區</span><input data-hi-ep="origin" value="${attr(p.origin)}"></label>
        <label class="hi-f"><span>常在哪裡買</span><select data-hi-ep="source">${opt(H.SOURCES, p.source)}</select></label>
        <label class="hi-f"><span>補貨點(g,空白 = 自動)</span><input type="number" data-hi-ep="reorderG" value="${attr(p.reorderG)}"></label>
        <label class="hi-f"><span>開封後幾個月用完(空白 = 依劑型)</span><input type="number" data-hi-ep="openedShelfMonths" value="${attr(p.openedShelfMonths)}"></label>
        <div class="hi-checks"><label><input type="checkbox" data-hi-ep="organic" ${p.organic ? "checked" : ""}> 有機</label><label><input type="checkbox" data-hi-ep="frequent" ${p.frequent ? "checked" : ""}> ★ 常用</label></div>
      </div>
      <datalist id="hiBrandList">${Object.entries(H.BRANDS).flatMap(([g, list]) => list.map((b) => `<option value="${attr(b)}">${g}</option>`)).join("")}</datalist>
      <div class="hi-toolbar"><button type="button" class="hi-primary" data-hi-ep-save="${attr(p.id)}">存品項</button><button type="button" data-hi-ep-cancel>取消</button>
        <span class="hi-hint">庫存數量不在這裡改 —— 數量不對請用該批的「盤點調整」。</span></div>
    </div>`;
  }

  // ── 記用量 ──
  const useDraft = { pid: "", grams: "", purpose: "自用", note: "", date: "" };
  function useHtml() {
    const p = useDraft.pid && product(useDraft.pid);
    const s = p ? H.stats(inv, p, today()) : null;
    const recent = inv.txns.filter((x) => x.type === "use").slice(-10).reverse();
    const nextExpired = s && s.next && H.isExpired(s.next, today());
    const expiredG = s ? Math.round((s.stock - s.usable) * 10) / 10 : 0;
    return `<div class="hi-two">
      <section class="hi-panel">
        <h3>記一筆用量</h3>
        <label class="hi-f"><span>藥品</span><select id="hiUsePid"><option value="">選一個…</option>${inv.products.filter((x) => !x.archived).map((x) => `<option value="${attr(x.id)}" ${x.id === useDraft.pid ? "selected" : ""}>${esc(x.nameZh)} · ${esc(x.brand)}</option>`).join("")}</select></label>
        ${s ? `<div class="hi-hint">庫存 ${fmtG(s.stock)} · 會先扣 ${s.next ? `批號 ${esc(s.next.lotNo || "—")}(${s.next.openedDate ? "已開封" : "未開封,這次記為開封"},效期 ${esc(s.next.expiry)})` : "—"}</div>
          ${nextExpired ? `<div class="hi-msg is-err" role="status">沒過期的已經用完,剩下的 ${fmtG(expiredG)} 都是已過期的批次。真的用了才記;不用的話到庫存頁把那批報廢。</div>`
            : expiredG > 0 ? `<div class="hi-hint"><b class="hi-warn-text">另有 ${fmtG(expiredG)} 已過期</b>,排在最後才扣;不用的話到庫存頁報廢。</div>` : ""}` : ""}
        <div class="hi-grid2">
          <label class="hi-f"><span>用了幾克</span><input id="hiUseG" type="number" inputmode="decimal" min="0.5" step="0.5" value="${attr(useDraft.grams)}" placeholder="例:6"></label>
          <label class="hi-f"><span>日期</span><input id="hiUseDate" type="date" value="${attr(useDraft.date || today())}"></label>
        </div>
        <div class="hi-chips" role="group" aria-label="給誰用">${H.PURPOSES.filter((x) => x !== "自家病人").map((x) => `<button type="button" data-hi-purpose="${attr(x)}" aria-pressed="${useDraft.purpose === x}">${x}</button>`).join("")}</div>
        <label class="hi-f"><span>備註(選填)</span><input id="hiUseNote" value="${attr(useDraft.note)}"></label>
        <div class="hi-toolbar"><button type="button" class="hi-primary" id="hiUseSave">扣庫存</button></div>
        <p class="hi-hint">給自家病人的藥請用「開藥紀錄」開方 —— 會記下病人、病症、每天幾克 × 幾天,之後可以複習。Bastyr 與外部診所的病人走他們的藥房,不從這裡扣。</p>
      </section>
      <aside class="hi-panel"><h3>最近記的</h3>
        ${recent.map((x) => { const pp = product(x.productId); return `<div class="hi-line"><span class="hi-mono">${esc(x.date.slice(5))}</span><span>${esc(pp ? pp.nameZh : "?")} <small class="hi-hint">${esc(x.purpose)}${x.note ? " · " + esc(x.note) : ""}</small></span><span class="num">${fmtG(-x.grams)}</span></div>`; }).join("") || `<p class="hi-hint">還沒有用量紀錄。</p>`}
      </aside></div>`;
  }

  // ── 入庫 / 新品項 ──
  const recvDraft = { pid: "" };
  function receiveHtml() {
    const p = recvDraft.pid && product(recvDraft.pid);
    return `<div class="hi-two">
      <section class="hi-panel">
        <h3>入庫一批</h3>
        <label class="hi-f"><span>藥品(新品項請先在右邊建立)</span><select id="hiRecvPid"><option value="">選一個…</option>${inv.products.filter((x) => !x.archived).map((x) => `<option value="${attr(x.id)}" ${x.id === recvDraft.pid ? "selected" : ""}>${esc(x.nameZh)} · ${esc(x.brand)} · ${x.packageG} g</option>`).join("")}</select></label>
        <div class="hi-grid2">
          <label class="hi-f"><span>包裝數</span><input id="hiRecvN" type="number" min="1" value="1"></label>
          <label class="hi-f"><span>每包裝克數</span><input id="hiRecvPkg" type="number" min="1" value="${p ? p.packageG : 100}"></label>
          <label class="hi-f"><span>總價(美金)</span><input id="hiRecvPrice" type="number" min="0" step="0.01" placeholder="例:24.50"></label>
          <label class="hi-f"><span>批號 Lot</span><input id="hiRecvLot" placeholder="瓶身上的批號"></label>
          <label class="hi-f"><span>有效期限</span><input id="hiRecvExp" type="date" value="${H.addMonths(today(), 30)}"></label>
          <label class="hi-f"><span>購買日</span><input id="hiRecvDate" type="date" value="${today()}"></label>
          <label class="hi-f"><span>購買地點</span><input id="hiRecvPlace" placeholder="例:百家中藥行、台北 永康藥局"></label>
        </div>
        <div class="hi-toolbar"><button type="button" class="hi-primary" id="hiRecvSave">入庫</button><span class="hi-hint" id="hiRecvCost">輸入總價後,這裡顯示每克成本。</span></div>
      </section>
      <aside class="hi-panel"><h3>新增品項</h3>
        <div class="hi-grid2">
          <label class="hi-f"><span>中文名</span><input id="hiNZh" placeholder="例:當歸芍藥散"></label>
          <label class="hi-f"><span>英文 / 拼音</span><input id="hiNEn" placeholder="Dang Gui Shao Yao San"></label>
          <label class="hi-f"><span>種類</span><select id="hiNKind">${Object.entries(H.KINDS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
          <label class="hi-f"><span>劑型</span><select id="hiNForm">${Object.entries(H.FORMS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
          <label class="hi-f"><span>品牌(可選或自己打)</span><input id="hiNBrand" list="hiBrandList" placeholder="例:順天堂 Sun Ten"></label>
          <label class="hi-f"><span>品牌編號</span><input id="hiNCode" placeholder="例:ST-089"></label>
          <label class="hi-f"><span>每包裝克數</span><input id="hiNPkg" type="number" value="100"></label>
          <label class="hi-f"><span>濃縮比(水藥、蜜丸免填)</span><input id="hiNRatio" value="5:1"></label>
          <label class="hi-f"><span>製造地</span><select id="hiNMade">${H.MADE_IN.map((x) => `<option>${x}</option>`).join("")}</select></label>
          <label class="hi-f"><span>產地 / 產區</span><input id="hiNOrigin" placeholder="例:甘肅 岷縣"></label>
          <label class="hi-f"><span>常在哪裡買</span><select id="hiNSrc">${Object.entries(H.SOURCES).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
          <label class="hi-f"><span>補貨點(g,空白 = 自動)</span><input id="hiNReorder" type="number" placeholder="自動"></label>
          <label class="hi-f"><span>開封後幾個月用完(空白 = 依劑型)</span><input id="hiNShelf" type="number" placeholder="依劑型"></label>
          <div class="hi-checks"><label><input type="checkbox" id="hiNOrganic"> 有機</label><label><input type="checkbox" id="hiNFrequent"> ★ 常用</label></div>
        </div>
        <datalist id="hiBrandList">${Object.entries(H.BRANDS).flatMap(([g, list]) => list.map((b) => `<option value="${attr(b)}">${g}</option>`)).join("")}</datalist>
        <div class="hi-toolbar"><button type="button" id="hiNSave">建立品項</button></div>
        <p class="hi-hint">名稱跟知識庫的方劑 / 中藥卡對得上時,會自動連過去。</p>
      </aside></div>
      ${bulkHtml()}`;
  }
  // 一次貼上清單:從試算表複製(或照範例用逗號)→ 預覽每一列 → 只建沒錯誤的列
  const BULK_EXAMPLE = ["品名\t品牌\t劑型\t每包克數\t包數\t現有克數\t價格\t效期\t購買地\t產地\t有機\t常用",
    "加味逍遙散\t順天堂 Sun Ten\t科中\t100\t2\t130\t48\t2027-08\t台灣\t\t\t是",
    "當歸\tMayway\t水藥\t454\t1\t300\t36.5\t2028-12-31\t網購\t甘肅 岷縣\t有\t"].join("\n");
  let bulkText = "", bulkPreview = null;
  function bulkHtml() {
    const rows = bulkPreview ? bulkPreview.rows : [];
    const ok = rows.filter((r) => !r.errors.length);
    return `<section class="hi-panel" id="hiBulk"><h3>一次貼上清單建檔</h3>
      <p class="hi-hint">從 Excel / Google 試算表選取整張表複製貼上(第一列放標題),或照下面範例一行一筆。認得的標題:品名、品牌、種類、劑型、品牌編號、每包克數、包數、現有克數、價格(美金)、效期、購買日、購買地、地點、產地、製造地、有機、常用、批號。
        效期可寫 2027-08-31、2027/8/31 或只寫 2027-08(當月最後一天)。有「包數」又有「現有克數」時,會先入買的量、再記一筆「建檔時已用掉」,每克成本才算得對。</p>
      <textarea id="hiBulkText" rows="7" spellcheck="false" placeholder="${attr(BULK_EXAMPLE)}">${esc(bulkText)}</textarea>
      <div class="hi-toolbar"><button type="button" id="hiBulkPreview">預覽</button><button type="button" id="hiBulkExample">放入範例</button>
        ${bulkPreview ? `<button type="button" class="hi-primary" id="hiBulkApply" ${ok.length ? "" : "disabled"}>建立 ${ok.length} 筆</button><span class="hi-hint">${rows.length - ok.length ? `${rows.length - ok.length} 列有錯,不會建立` : "全部可以建立"}</span>` : ""}</div>
      ${bulkPreview ? `<div class="hi-table-wrap"><table class="hi-table"><thead><tr><th>列</th><th>品名</th><th>種類 · 劑型</th><th class="num">現有</th><th class="num">US$</th><th>效期</th><th>購買地</th><th>狀態</th></tr></thead><tbody>
        ${rows.map((r) => `<tr><td class="num">${r.line}</td><td>${esc(r.product.nameZh || "—")} <small class="hi-hint">${esc(r.product.brand)}</small></td>
          <td>${H.KINDS[r.product.kind]} · ${H.FORMS[r.product.form]}</td><td class="num">${r.lot ? fmtG(r.lot.stockG) : "—"}</td><td class="num">${r.lot ? r.lot.price : "—"}</td>
          <td>${r.lot ? esc(r.lot.expiry) : "—"}</td><td>${H.SOURCES[r.product.source]}</td>
          <td>${r.errors.length ? `<span class="hi-pill hi-warn">${r.errors.map(esc).join(";")}</span>` : r.warnings.length ? `<span class="hi-pill hi-amber">${r.warnings.map(esc).join(";")}</span>` : `<span class="hi-pill hi-ok">OK</span>`}</td></tr>`).join("")}
      </tbody></table></div>` : ""}
    </section>`;
  }

  // ── 開藥紀錄 ──
  let rxLens = "patient", rxPick = "";
  const rxDraft = { patientCode: "", sexAge: "", caseId: "", condition: "", category: "", pattern: "", note: "", items: [{ productId: "", gpd: "", days: "7" }] };
  function homeCases() {
    const cases = typeof clinicalCases !== "undefined" ? clinicalCases : [];
    return cases.filter((c) => c.clinicSite === "home");
  }
  function rxCardHtml(r, showPatient) {
    const c = r.caseId && typeof clinicalCases !== "undefined" ? clinicalCases.find((x) => x.id === r.caseId) : null;
    return `<div class="hi-lot ${r.voided ? "is-voided" : ""}"><span>${r.voided ? `<span class="hi-pill">已撤銷 ${esc(r.voidedAt)}${r.voidReason ? " · " + esc(r.voidReason) : ""}</span> ` : ""}<b class="hi-mono">${esc(r.date)}</b> ${showPatient ? `<b class="hi-mono">${esc(r.patientCode)}</b> <span class="hi-hint">${esc(r.sexAge)}</span> · ` : ""}${esc(catLabel(r.category))} <b>${esc(r.condition)}</b>${r.pattern ? ` <span class="hi-hint">· ${esc(r.pattern)}</span>` : ""}</span>
      <span class="num">${fmtG(H.rxTotal(r))}</span>
      <span class="hi-meta">${r.items.map((l) => { const p = product(l.productId); return `${p ? kbLink(p, p.nameZh) : "?"} ${l.gpd} g/天 × ${l.days} 天`; }).join(" ;")} · 約 US$ ${H.rxCost(inv, r).toFixed(2)}${r.note ? " · " + esc(r.note) : ""}
        ${c ? ` · <button type="button" class="hi-kb" data-hi-open-case="${attr(c.id)}">看病例 ↗</button>` : ""}</span>
      ${r.voided ? "" : `<span class="hi-lot-actions"><button type="button" data-hi-void-rx="${attr(r.id)}">撤銷這張方(藥加回庫存)</button></span>`}</div>`;
  }
  function rxHtml() {
    const groups = H.groupRx(inv, rxLens);
    if (!groups.has(rxPick)) rxPick = groups.keys().next().value || "";
    const picked = groups.get(rxPick) || [];
    const list = [...groups.entries()].map(([k, rs]) => {
      const label = rxLens === "patient"
        ? `<b class="hi-mono">${esc(k)}</b> <span class="hi-hint">${esc(rs[0].sexAge)}</span><small>${[...new Set(rs.map((r) => r.condition))].map(esc).join("、")}</small>`
        : `${esc(catLabel(rs[0].category))} <b>${esc(rs[0].condition)}</b><small>${new Set(rs.map((r) => r.patientCode)).size} 位病人</small>`;
      return `<button type="button" class="hi-pick" data-hi-rx-pick="${attr(k)}" aria-pressed="${k === rxPick}"><span class="hi-name">${label}</span><span class="num hi-hint">${rs.length} 次 · 最近 ${esc(rs[0].date.slice(5))}</span></button>`;
    }).join("");
    let summary = "";
    if (picked.length && rxLens === "condition") {
      summary = `<div class="hi-grid3">${H.conditionSummary(picked).map((a) => { const p = product(a.productId);
        return `<div class="hi-stat"><small>${esc(p ? p.nameZh : "?")} · 開過 ${a.times} 次</small><b>${a.avgGpd.toFixed(1)} g/天</b><small>共 ${fmtG(a.totalG)}</small></div>`; }).join("")}</div>`;
    } else if (picked.length) {
      const live = picked.filter((r) => !r.voided);   // 撤銷的方不算
      summary = `<div class="hi-grid3"><div class="hi-stat"><small>開藥次數</small><b>${live.length}</b></div>
        <div class="hi-stat"><small>總用量</small><b>${fmtG(live.reduce((s, r) => s + H.rxTotal(r), 0))}</b></div>
        <div class="hi-stat"><small>藥材成本</small><b>US$ ${live.reduce((s, r) => s + H.rxCost(inv, r), 0).toFixed(2)}</b></div></div>`;
    }
    const d = rxDraft;
    const hc = homeCases();
    const S = window.AcuTingCaseSearch;
    return `<div class="hi-two">
      <section class="hi-panel">
        <div class="hi-toolbar"><h3 class="hi-grow">開藥紀錄</h3>
          <div class="hi-chips" role="group" aria-label="怎麼看">${[["patient", "依病人"], ["condition", "依病症"]].map(([k, v]) => `<button type="button" data-hi-rx-lens="${k}" aria-pressed="${rxLens === k}">${v}</button>`).join("")}</div></div>
        <div class="hi-picks">${list || `<p class="hi-hint">還沒有開藥紀錄。自家病人開方後,會依病人、依病症整理在這裡,方便複習。</p>`}</div>
        ${picked.length ? `<h3>${rxLens === "patient" ? `${esc(rxPick)} 的開藥時間軸` : `${esc(picked[0].condition)}:誰、開了什麼`}</h3>${summary}<div class="hi-lots">${picked.map((r) => rxCardHtml(r, rxLens === "condition")).join("")}</div>` : ""}
      </section>
      <aside class="hi-panel"><h3>開一張方(自家病人)</h3>
        ${hc.length ? `<label class="hi-f"><span>從自家病例帶入</span><select id="hiRxCase"><option value="">— 不連病例 —</option>${hc.map((c) => `<option value="${attr(c.id)}" ${c.id === d.caseId ? "selected" : ""}>${esc((S ? S.caseLabelText(c) : "") || c.displayCode || c.patientCode)} · ${esc(c.caseTitle || "")}</option>`).join("")}</select></label>` : `<p class="hi-hint">還沒有看診地點是「自家」的病例;可以直接填病人代號,或先在病例標籤把看診地點設成自家。</p>`}
        <div class="hi-grid2">
          <label class="hi-f"><span>病人顯示代號</span><input id="hiRxCode" list="hiRxCodes" value="${attr(d.patientCode)}" placeholder="例:AQZ"></label>
          <label class="hi-f"><span>性別/年齡</span><input id="hiRxSex" value="${attr(d.sexAge)}" placeholder="F/41"></label>
          <label class="hi-f"><span>病症</span><input id="hiRxCond" list="hiRxConds" value="${attr(d.condition)}" placeholder="例:失眠"></label>
          <label class="hi-f"><span>❤️ 類別</span><select id="hiRxCat"><option value="">—</option>${Object.keys(CATS).map((k) => `<option value="${k}" ${d.category === k ? "selected" : ""}>${esc(catLabel(k))}</option>`).join("")}</select></label>
          <label class="hi-f"><span>證型(選填)</span><input id="hiRxPat" value="${attr(d.pattern)}"></label>
          <label class="hi-f"><span>備註</span><input id="hiRxNote" value="${attr(d.note)}" placeholder="例:睡前服"></label>
        </div>
        <datalist id="hiRxCodes">${[...new Set(inv.rx.map((r) => r.patientCode))].map((c) => `<option value="${attr(c)}">`).join("")}</datalist>
        <datalist id="hiRxConds">${[...new Set(inv.rx.map((r) => r.condition))].map((c) => `<option value="${attr(c)}">`).join("")}</datalist>
        ${d.items.map((l, i) => `<div class="hi-grid3 hi-rx-line">
          <label class="hi-f"><span>藥 ${i + 1}</span><select data-hi-xi="${i}" data-hi-xk="productId"><option value="">選藥…</option>${inv.products.filter((p) => !p.archived).map((p) => `<option value="${attr(p.id)}" ${p.id === l.productId ? "selected" : ""}>${esc(p.nameZh)} · ${esc(p.brand)}</option>`).join("")}</select></label>
          <label class="hi-f"><span>每天幾克</span><input type="number" step="0.5" min="0" data-hi-xi="${i}" data-hi-xk="gpd" value="${attr(l.gpd)}"></label>
          <label class="hi-f"><span>幾天</span><input type="number" min="1" data-hi-xi="${i}" data-hi-xk="days" value="${attr(l.days)}"></label></div>`).join("")}
        <div class="hi-toolbar"><button type="button" id="hiRxAdd">+ 再加一味 / 一方</button></div>
        <div class="hi-toolbar"><button type="button" class="hi-primary" id="hiRxSave">開方並扣庫存</button></div>
      </aside></div>`;
  }

  // ── 採購清單 + email 預覽 ──
  let shopWhere = "all";
  function shopHtml() {
    const list = H.shoppingList(inv, today());
    const groups = Object.keys(H.SOURCES).map((k) => ({ k, items: list.filter((x) => x.p.source === k) })).filter((g) => g.items.length && (shopWhere === "all" || g.k === shopWhere));
    const text = groups.map((g) => `【${H.SOURCES[g.k]}】\n` + g.items.map((x) => `□ ${x.p.nameZh}(${x.p.brand} ${x.p.code})× ${x.packs} 包 ${x.p.packageG}g`).join("\n")).join("\n\n");
    const email = H.frequentLowEmail(inv, today());
    return `<section class="hi-panel">
      <div class="hi-toolbar"><h3 class="hi-grow">採購清單</h3>
        <div class="hi-chips" role="group" aria-label="我現在在哪">${[["all", "全部"], ["taiwan", "我在台灣"], ["canada", "我在加拿大"], ["baijia", "我在百家"], ["us_online", "要網購的"], ["other", "其他"]].map(([k, v]) => `<button type="button" data-hi-where="${k}" aria-pressed="${shopWhere === k}">${v}</button>`).join("")}</div>
        <button type="button" id="hiCopyShop">複製清單</button></div>
      <p class="hi-hint">低於補貨點、★ 常用低於 ${inv.settings.frequentMinG} g、或有批次快過期的品項,補到 ${inv.settings.targetDays} 天的用量,換算成整包裝。價格以美金估。</p>
      ${groups.map((g) => `<div class="hi-shop"><h4><span>${H.SOURCES[g.k]}</span><span class="num hi-hint">約 US$ ${g.items.reduce((a, x) => a + (x.estUSD || 0), 0).toFixed(0)}</span></h4>
        ${g.items.map((x) => `<div class="hi-line"><span class="hi-mono">× ${x.packs}</span><span><b>${esc(x.p.nameZh)}</b> <small class="hi-hint">${esc(x.p.brand)} ${esc(x.p.code)} · ${x.p.packageG} g/包裝 · ${esc(x.why)}${x.lastPlace ? ` · 上次在 ${esc(x.lastPlace)}` : ""}</small></span><span class="num hi-hint">${x.estUSD ? "≈ US$ " + x.estUSD.toFixed(0) : ""}</span></div>`).join("")}</div>`).join("") || `<p class="hi-hint">目前不用補貨。</p>`}
      <textarea id="hiShopText" rows="6" readonly hidden>${esc(text)}</textarea>
    </section>
    <section class="hi-panel"><h3>Email 提醒(★ 常用低於 ${inv.settings.frequentMinG} g)</h3>
      <p class="hi-hint">${inv.settings.emailTo ? `收件人:${esc(inv.settings.emailTo)}。` : "收件人還沒設定(設定頁)。"}每天自動寄信的功能是下一步(要在 Cloudflare 開寄信);現在這裡先列出那封信會寫什麼。</p>
      <div class="hi-lot"><span><b>主旨</b> ${esc(email ? email.subject : "(沒有常用藥低於門檻,今天不會寄)")}</span><span></span>
        <span class="hi-meta" style="white-space:pre-line">${esc(email ? email.lines.map((x) => "• " + x).join("\n") : "")}</span></div>
    </section>`;
  }

  // ── 數據 ──
  function dataHtml() {
    const t = today();
    const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(t + "T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() - (5 - i)); return d.toISOString().slice(0, 7); });
    const used = H.usageTxns(inv);   // 撤銷的方不算用量(跟日均用量同一把尺)
    const byMonth = months.map((m) => -used.filter((x) => x.date.startsWith(m)).reduce((s, x) => s + x.grams, 0));
    const max = Math.max(1, ...byMonth), W = 520, HH = 170, bw = 56, gap = (W - 40 - bw * 6) / 5;
    const bars = byMonth.map((g, i) => { const h = (g / max) * (HH - 40); const x = 40 + i * (bw + gap);
      return `<rect x="${x}" y="${HH - 22 - h}" width="${bw}" height="${h}" rx="4"></rect><text x="${x + bw / 2}" y="${HH - 8}" text-anchor="middle">${months[i].slice(5)}月</text><text x="${x + bw / 2}" y="${HH - 26 - h}" text-anchor="middle">${Math.round(g)}</text>`; }).join("");
    const top = inv.products.map((p) => ({ p, g: H.usageG(inv, p.id, 90, t) })).filter((x) => x.g > 0).sort((a, b) => b.g - a.g).slice(0, 10);
    const topMax = Math.max(1, ...top.map((x) => x.g));
    const purposes = {};
    used.filter((x) => x.date > H.addDays(t, -90)).forEach((x) => { purposes[x.purpose || "未填"] = (purposes[x.purpose || "未填"] || 0) - x.grams; });
    const pMax = Math.max(1, ...Object.values(purposes));
    const costs = inv.products.map((p) => { const l = H.lotsOf(inv, p.id).sort((a, b) => String(b.purchaseDate).localeCompare(String(a.purchaseDate)))[0]; return { p, c: l ? H.costPerGram(l) : null }; }).filter((x) => x.c !== null).sort((a, b) => b.c - a.c);
    return `<div class="hi-two">
      <section class="hi-panel"><h3>每月用量(g)</h3>
        <figure class="hi-chart"><svg viewBox="0 0 ${W} ${HH}" role="img" aria-label="近 6 個月每月用量">${bars}</svg></figure>
        <h3>近 90 天用最多</h3>
        ${top.map((x) => `<div class="hi-hbar"><span>${esc(x.p.nameZh)}</span><span class="hi-track"><i style="width:${(x.g / topMax) * 100}%"></i></span><span class="num">${fmtG(x.g)}</span></div>`).join("") || `<p class="hi-hint">近 90 天沒有用量。</p>`}
      </section>
      <aside class="hi-panel"><h3>用在誰身上(近 90 天)</h3>
        ${Object.entries(purposes).sort((a, b) => b[1] - a[1]).map(([k, g]) => `<div class="hi-hbar"><span>${esc(k)}</span><span class="hi-track"><i style="width:${(g / pMax) * 100}%"></i></span><span class="num">${fmtG(g)}</span></div>`).join("") || `<p class="hi-hint">—</p>`}
        <h3>每克成本(最近一批)</h3>
        <div class="hi-table-wrap"><table class="hi-table"><thead><tr><th>藥品</th><th class="num">US$/g</th><th>劑型 · 產地</th></tr></thead><tbody>
        ${costs.map((x) => `<tr><td>${esc(x.p.nameZh)} <small class="hi-hint">${esc(x.p.brand)}</small></td><td class="num">${x.c.toFixed(3)}</td><td class="hi-hint">${H.FORMS[x.p.form]}${originText(x.p) ? " · " + esc(originText(x.p)) : ""}</td></tr>`).join("")}
        </tbody></table></div>
        <div class="hi-toolbar"><button type="button" id="hiCopyCsv">複製用量明細(CSV)</button></div>
      </aside></div>`;
  }

  // ── 半年回顧(D37,Ting 2026-11-14)──
  // 兩條線分開:「學校與診所」= 病歷(clinicSite ≠ home)的自由文字開方;「藥櫃」= 自用與自家病人的實際用量帳。
  // 全部即時從病歷與藥櫃算,不另存任何病人資料;只存她的三個採購假設與「上次看過的日期」(都在藥櫃同一份雲端資料)。
  const RXP = () => window.AcuTingRxProfile;
  const CS = () => window.AcuTingCaseSearch || {};
  let reviewRange = null, resolverMemo = null;
  function rxResolver() {
    if (!resolverMemo && window.ACUTING_KNOWLEDGE && RXP()) resolverMemo = RXP().buildResolver(window.ACUTING_KNOWLEDGE);
    return resolverMemo;
  }
  const siteLabel = (k) => ((CS().CLINIC_SITES || {})[k] || {}).zh || (k === "(未填)" ? "未填" : k);
  // 不重用上面的 catLabel:那支查不到時回空字串,這裡查不到要說「未填」
  const rvCatLabel = (k) => { const c = (CS().CASE_CATEGORIES || {})[k]; return c ? `${c.icon} ${c.zh}` : (k || "未填"); };
  const SEX = { F: "女", M: "男", female: "女", male: "男" };
  const gTxt = (g) => (g === null ? "—" : fmtG(g));
  function distRows(obj, label) {
    const rows = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...rows.map((r) => r[1]));
    return rows.map(([k, n]) => `<div class="hi-hbar"><span>${esc(label(k))}</span><span class="hi-track"><i style="width:${(n / max) * 100}%"></i></span><span class="num">${n}</span></div>`).join("") || `<p class="hi-hint">—</p>`;
  }
  function rxLine(p) {
    const items = p.items.map((it) => `${esc(it.name)}${Number.isFinite(it.parts) ? ` ${it.parts}` : ""}`).join("、");
    const dose = p.unitsUnknown ? "單位原文未記" : p.gpd !== null ? `${p.gpd} g/天` : (p.fromLinks ? "只有方劑連結" : "沒寫服法");
    return `${items} <small class="hi-hint">· ${dose}${p.days ? ` · ${p.days} 天` : ""}</small>`;
  }
  function reviewData() {
    const R = RXP(), t = today();
    const S = R.reviewSettings(inv.settings.rxReview);
    const range = reviewRange || { from: R.addDays(t, -S.periodDays), to: t };
    const resolve = rxResolver();
    const cases = typeof clinicalCases !== "undefined" ? clinicalCases : [];
    const col = R.collectVisits(cases, { from: range.from, to: range.to, today: t, excludeSites: ["home"], resolve, nameOf: resolve && resolve.nameOf });
    return { R, t, S, range, cases, visits: col.visits, undated: col.undated, mix: R.caseMix(col.visits), sum: R.summarizeRx(col.visits, inv.settings.rxReview),
      plan: R.inventoryPlan(H, inv, t, inv.settings.rxReview), rem: R.reminderState(inv.settings.rxReview, t) };
  }
  // 這個分頁算的是任意病歷;算到一半出錯時只壞這一頁、大聲說原因 —— 不能讓整個藥櫃停在「載入中…」(2026-11-14 實測過一次)
  function reviewHtml() {
    try { return reviewHtmlInner(); }
    catch (e) {
      try { console.error("半年回顧:", e); } catch (_) { /* */ }
      return `<section class="hi-panel hi-error"><b>半年回顧算到一半出錯了</b><p>${esc(e && e.message || e)}</p><p class="hi-hint">其他分頁不受影響;沒有寫入任何東西。</p></section>`;
    }
  }
  function reviewHtmlInner() {
    if (!RXP()) return `<section class="hi-panel hi-error"><b>半年回顧模組沒載到</b><p class="hi-hint">重新整理頁面。</p></section>`;
    const { R, t, S, range, cases, visits, undated, mix, sum, plan, rem } = reviewData();
    const remText = rem.due
      ? (rem.firstTime ? "還沒做過半年回顧。看完按最下面的「我看過了」,半年後系統會再提醒。" : `已到半年(上次 ${esc(S.lastReviewedAt)})。看完按「我看過了」。`)
      : `上次看過 ${esc(S.lastReviewedAt)},下次提醒 ${esc(rem.nextDue)}(還有 ${rem.daysLeft} 天)。`;
    const setF = (k, label, hint, ph) => `<label class="hi-f"><span>${label}</span><input type="number" min="0" step="any" data-rv-set="${k}" value="${attr(S[k])}" placeholder="${attr(ph || "")}"><small class="hi-hint">${hint}</small></label>`;
    const caseById = new Map(cases.map((c) => [String(c.id), c]));
    // caseLabelText 的第二個參數要 Date 物件;跟其他呼叫端一樣不傳(用現在),標題空的退回顯示代號 / 病人編號
    const labelOf = (v) => { const c = caseById.get(v.caseId); return c ? ((typeof CS().caseLabelText === "function" ? CS().caseLabelText(c) : "") || c.displayCode || c.patientCode) : v.caseId; };
    const rxVisits = visits.filter((v) => v.prescribed).sort((a, b) => b.date.localeCompare(a.date));
    const noDaysYet = !S.rxDays;
    const tableRows = sum.rows.map((r) => {
      const notes = [];
      if (!r.id) notes.push(`<span class="hi-pill">知識庫沒有這張卡</span>`);
      if (r.noDose) notes.push(`<span class="hi-pill hi-amber">${r.noDose} 張沒寫服法或單位</span>`);
      if (r.slowForBottle) notes.push(`<span class="hi-pill hi-amber">兩年用不到 ${S.bottleG} g,開封會過期</span>`);
      const name = r.id ? kbLink({ kind: r.kind === "formula" ? "formula" : "single", knowledgeId: r.id }, r.name) : esc(r.name);
      return `<tr><td>${name}</td><td class="num">${r.rxCount}</td><td class="num">${r.patients}</td><td class="num">${gTxt(r.grams)}</td>
        <td class="num">${r.bottles === null ? "—" : r.bottles}</td><td class="num"><b>${r.bottlesToBuy === null ? "—" : r.bottlesToBuy}</b></td><td class="num">${r.bottlesPerYear === null ? "—" : r.bottlesPerYear}</td><td>${notes.join(" ")}</td></tr>`;
    }).join("");
    const planRows = plan.map((r) => `<tr><td>${r.frequent ? `<span class="hi-star">★</span> ` : ""}${r.knowledgeId ? kbLink({ kind: r.kind, knowledgeId: r.knowledgeId }, r.name) : esc(r.name)} <small class="hi-hint">${esc(r.brand)}</small></td>
      <td class="num">${fmtG(r.used)}</td><td class="num">${fmtG(r.usable)}</td><td class="num">${r.packageG} g</td><td class="num">${r.bottlesUsed}</td><td class="num"><b>${r.bottlesToBuy}</b></td></tr>`).join("");
    return `<section class="hi-panel rv-head">
      <h3>半年開藥回顧與科中採購建議</h3>
      <p class="${rem.due ? "hi-msg is-err" : "hi-hint"}">${remText}</p>
      <div class="hi-grid3">
        <label class="hi-f"><span>從</span><input type="date" id="rvFrom" value="${attr(range.from)}"></label>
        <label class="hi-f"><span>到</span><input type="date" id="rvTo" value="${attr(range.to)}"></label>
        <div class="hi-f"><span>&nbsp;</span><button type="button" id="rvReset">回到最近半年</button></div>
      </div>
      <h3>採購假設(你填的,不是病歷資料)</h3>
      <div class="hi-grid3">
        ${setF("bottleG", "一罐幾克", "科中常見 200 g 一罐;換算罐數用。", "200")}
        ${setF("rxDays", "每張方平均開幾天", "病歷都沒記天數。沒填之前,罐數算不出來。", "例 7")}
        ${setF("fallbackGpd", "沒寫服法的方,一天算幾克", "只用在原文沒寫「每次幾克、一天幾次」的方;不填就只計張數。", "不填")}
      </div>
    </section>

    <section class="hi-panel">
      <h3>一、學校與診所的病例(不含自家)· ${esc(range.from)} – ${esc(range.to)}</h3>
      <div class="hi-table-wrap"><table class="hi-table rv-kpi"><tbody>
        <tr><th>接觸的病人</th><td class="num">${mix.patients}</td><th>就診次數</th><td class="num">${mix.visits}</td></tr>
        <tr><th>有開藥的病人</th><td class="num">${mix.prescribedPatients}</td><th>有開藥的就診</th><td class="num">${mix.prescribedVisits}</td></tr>
      </tbody></table></div>
      ${undated ? `<p class="hi-hint">另有 ${undated} 筆 SOAP 沒有就診日期,沒算進任何期間(不拿建立日期頂替 —— 那是匯入那天,不是看診那天)。補上就診日期就會算。</p>` : ""}
      <div class="hi-two">
        <div><h3>看診地點</h3>${distRows(mix.bySite, siteLabel)}<h3>年齡</h3>${distRows(mix.byAge, (k) => k)}</div>
        <div><h3>病例類別</h3>${distRows(mix.byCategory, rvCatLabel)}<h3>性別</h3>${distRows(mix.bySex, (k) => SEX[k] || k)}</div>
      </div>
      ${mix.topConditions.length ? `<h3>最常見的病症</h3>${distRows(Object.fromEntries(mix.topConditions), (k) => k)}` : ""}

      <h3>有開藥的就診(${rxVisits.length})</h3>
      ${rxVisits.length ? `<div class="hi-table-wrap"><table class="hi-table"><thead><tr><th>日期</th><th>病例</th><th>地點</th><th>開方(原文的份數與服法)</th></tr></thead><tbody>
        ${rxVisits.map((v) => `<tr><td>${esc(v.date)}</td><td>${esc(labelOf(v))}</td><td>${esc(siteLabel(v.site))}</td>
          <td>${v.prescriptions.length ? v.prescriptions.map(rxLine).join("<br>") : `<span class="hi-hint">有寫開方文字,但讀不出藥名與份數</span>`}</td></tr>`).join("")}
      </tbody></table></div>` : `<p class="hi-hint">這段期間沒有開藥的紀錄。</p>`}

      <h3>開過的方與單味藥 → 科中採購建議</h3>
      <p class="hi-hint">${sum.rxTotal} 張方裡 ${sum.rxWithGrams} 張算得出克數。克數 = 原文的每天總量 × 該味份數比例 × 天數;份數、每次幾克、一天幾次都只用原文寫了的。${noDaysYet ? " <b>還沒填「每張方平均開幾天」,所以罐數都是 —。</b>" : ` 天數用你填的 ${S.rxDays} 天。`}「一年約」= 這段期間的量照比例換成一年。</p>
      ${sum.rows.length ? `<div class="hi-table-wrap"><table class="hi-table"><thead><tr><th>方劑 / 單味藥</th><th class="num">開過幾張</th><th class="num">病人</th><th class="num">期間克數</th><th class="num">約幾罐</th><th class="num">建議買</th><th class="num">一年約</th><th>備註</th></tr></thead>
        <tbody>${tableRows}</tbody></table></div>` : `<p class="hi-hint">這段期間沒有讀得出藥名的開方。</p>`}
    </section>

    <section class="hi-panel">
      <h3>二、藥櫃(自用與自家病人)· 這段期間的實際用量</h3>
      <p class="hi-hint">直接用藥櫃帳上的用量(撤銷的方不算),「建議再買」= 同樣用量再一段期間、扣掉現在可用的量,換算成整罐(每罐克數用品項自己設的包裝)。</p>
      ${plan.length ? `<div class="hi-table-wrap"><table class="hi-table"><thead><tr><th>品項</th><th class="num">期間用量</th><th class="num">目前可用</th><th class="num">每罐</th><th class="num">期間用了幾罐</th><th class="num">建議再買</th></tr></thead>
        <tbody>${planRows}</tbody></table></div>` : `<p class="hi-hint">藥櫃這段期間沒有用量紀錄。</p>`}
      <div class="hi-toolbar">
        <button type="button" id="rvCopy">複製採購建議(CSV,不含病人)</button>
        <button type="button" id="rvDone" class="primary">我看過了,半年後再提醒</button>
      </div>
    </section>`;
  }
  function reviewCsv() {
    const { S, sum, plan, range } = reviewData();
    const rows = [["來源", "期間", "方劑/單味藥", "開過幾張/期間用量", "病人", "期間克數", "約幾罐", "建議買(罐)", "一年約(罐)", "每罐克數"]];
    sum.rows.forEach((r) => rows.push(["學校與診所病例", `${range.from}~${range.to}`, r.name, r.rxCount, r.patients, r.grams ?? "", r.bottles ?? "", r.bottlesToBuy ?? "", r.bottlesPerYear ?? "", S.bottleG]));
    plan.forEach((r) => rows.push(["藥櫃", `${range.from}~${range.to}`, r.name, r.used, "", r.used, r.bottlesUsed, r.bottlesToBuy, "", r.packageG]));
    return rows;
  }

  // 首頁提醒:到期才畫;雲端還沒接上 / 讀不到時不畫(不准出現假提醒,也不因此寫入任何東西)。
  // render() 一頁會跑很多次,成功讀到的結果記 5 分鐘;讀失敗不記,下一次 render 再試。
  let reminderCache = null, reminderHiddenThisPage = false;
  function reviewReminderState() {
    const R = RXP();
    if (!R) return null;
    if (reminderCache && Date.now() - reminderCache.at < 5 * 60e3) return reminderCache.state;
    try {
      const data = inv || ensure();
      if (!data || loadError) return null;
      const state = R.reminderState(data.settings.rxReview, today());
      reminderCache = { at: Date.now(), state };
      return state;
    } catch (_) { return null; }
  }
  function renderReviewReminder() {
    const existing = document.querySelector(".rx-review-banner");
    const st = reminderHiddenThisPage || window.location.hash === "#ws/herbinv" ? null : reviewReminderState();
    if (!st || !st.due) { if (existing) existing.remove(); return; }
    if (existing) return;
    const banner = document.createElement("div");
    banner.className = "rx-review-banner";
    banner.setAttribute("role", "status");
    banner.innerHTML = `<span>🗓 ${st.firstTime ? "可以做第一次半年開藥回顧了" : "半年開藥回顧到了"}:這半年接觸的病例、有開藥的病例、開了哪些方,以及科中大約要買幾罐。</span>`;
    const go = document.createElement("button");
    go.type = "button";
    go.textContent = "去看";
    go.addEventListener("click", openReview);
    const later = document.createElement("button");
    later.type = "button";
    later.className = "rx-review-later";
    later.textContent = "這次先不要";
    later.addEventListener("click", () => { reminderHiddenThisPage = true; banner.remove(); });
    banner.append(go, later);
    document.body.prepend(banner);
  }
  function openReview() {
    tab = "review";
    const b = document.querySelector(".rx-review-banner");
    if (b) b.remove();
    if (window.location.hash === "#ws/herbinv") render();
    else window.location.hash = "#ws/herbinv";
  }

  // ── 設定 ──
  function settingsHtml() {
    const S = inv.settings;
    const f = (k, label, hint) => `<label class="hi-f"><span>${label}</span><input type="number" data-hi-set="${k}" value="${attr(S[k])}"><small class="hi-hint">${hint}</small></label>`;
    return `<section class="hi-panel"><h3>提醒規則</h3><div class="hi-grid2">
      ${f("leadDays", "補貨要多久(天)", "從發現要補到藥到手;常回台灣補的話,填兩次回台之間的天數。")}
      ${f("safetyDays", "安全天數", "多留幾天的量,怕用量突然變多。")}
      ${f("targetDays", "一次補多少天的量", "採購清單建議補到這麼多天。")}
      ${f("expiryWarnDays", "到期前幾天提醒", "專業藥局常用 90–180 天。")}
      ${f("slowDays", "幾天沒用算「久未使用」", "久未使用又快過期的,下次少買。")}
      ${f("frequentMinG", "★ 常用藥低於幾克提醒", "中藥與科中都適用;在藥品細節按「設為常用」。")}
      <label class="hi-f"><span>Email 寄到</span><input type="email" id="hiEmailTo" value="${attr(S.emailTo || "")}" placeholder="你的 email"><small class="hi-hint">每天自動寄信接上之後才會寄。</small></label>
    </div>
    <h3>開封後建議幾個月內用完(依劑型)</h3>
    <div class="hi-grid3">${Object.entries(H.FORMS).map(([k, v]) => `<label class="hi-f"><span>${v}</span><input type="number" data-hi-shelf="${k}" value="${attr((S.shelfByForm || {})[k] ?? 12)}"></label>`).join("")}</div>
    <p class="hi-hint">科中開封後兩年、水藥三到四年(預設三年),都以瓶身說明與保存狀況為準;個別品項可另設。價格一律美金。資料存在:${storeLabel()}。</p>
    <div class="hi-toolbar"><button type="button" id="hiExport">匯出藥櫃備份(JSON)</button></div>
    </section>`;
  }

  // ── 主畫面 ──
  const TABS = [["stock", "庫存"], ["rx", "開藥紀錄"], ["use", "記用量"], ["receive", "入庫"], ["shop", "採購清單"], ["data", "數據"], ["review", "半年回顧"], ["settings", "設定"]];
  function render() {
    const el = root();
    if (!el) return;
    if (!ensure()) {
      el.innerHTML = `<div class="hi-panel hi-error"><b>藥櫃讀不到</b><p>${esc(loadError)}</p><p class="hi-hint">病例服務沒連上或通行碼過期時會這樣;重新整理頁面。這時不會寫入任何東西。</p></div>`;
      return;
    }
    const body = { stock: stockHtml, rx: rxHtml, use: useHtml, receive: receiveHtml, shop: shopHtml, data: dataHtml, review: reviewHtml, settings: settingsHtml }[tab]();
    el.innerHTML = `${alertsHtml()}
      <nav class="hi-tabs" role="tablist" aria-label="藥櫃功能">${TABS.map(([k, v]) => `<button type="button" role="tab" data-hi-tab="${k}" aria-selected="${tab === k}">${v}</button>`).join("")}</nav>
      ${msg.text ? `<div class="hi-msg ${msg.ok ? "is-ok" : "is-err"}" role="status">${esc(msg.text)}</div>` : ""}
      ${body}`;
    msg = { text: "", ok: true };
    wire(el);
  }
  const val = (el, id) => { const x = el.querySelector("#" + id); return x ? x.value : ""; };
  function wire(el) {
    el.querySelectorAll("[data-hi-tab]").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.hiTab; render(); }));
    el.querySelectorAll("[data-hi-go]").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.hiGo; if (tab === "stock") stockFilter.alerts = true; render(); }));
    el.querySelectorAll("[data-hi-kb]").forEach((b) => b.addEventListener("click", () => {
      const [kind, id] = b.dataset.hiKb.split("|");
      if (id && typeof openKnowledgeRecord === "function" && openKnowledgeRecord(kind, id)) return;
      window.location.hash = `#ws/${kind}`;   // 對不到卡就開總頁
    }));
    el.querySelectorAll("[data-hi-open-case]").forEach((b) => b.addEventListener("click", () => {
      if (typeof selectedCaseId !== "undefined") selectedCaseId = b.dataset.hiOpenCase;   // eslint-disable-line no-global-assign
      window.location.hash = "#ws/cases";
    }));
    // 庫存
    const q = el.querySelector("#hiQ");
    if (q) q.addEventListener("input", (e) => { stockFilter.q = e.target.value; const pos = e.target.selectionStart; render(); const n = root().querySelector("#hiQ"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } });
    [["hiKind", "kind"], ["hiSource", "source"]].forEach(([id, k]) => el.querySelector("#" + id)?.addEventListener("change", (e) => { stockFilter[k] = e.target.value; render(); }));
    [["hiAlerts", "alerts"], ["hiArchived", "archived"]].forEach(([id, k]) => el.querySelector("#" + id)?.addEventListener("change", (e) => { stockFilter[k] = e.target.checked; render(); }));
    el.querySelectorAll("[data-hi-pid]").forEach((r) => {
      const pick = () => { selected = r.dataset.hiPid; render(); };
      r.addEventListener("click", pick);
      r.addEventListener("keydown", (e) => { if (e.key === "Enter") pick(); });
    });
    el.querySelectorAll("[data-hi-quick-use]").forEach((b) => b.addEventListener("click", () => { useDraft.pid = b.dataset.hiQuickUse; tab = "use"; render(); }));
    el.querySelectorAll("[data-hi-quick-recv]").forEach((b) => b.addEventListener("click", () => { recvDraft.pid = b.dataset.hiQuickRecv; tab = "receive"; render(); }));
    el.querySelectorAll("[data-hi-frequent]").forEach((b) => b.addEventListener("click", () => {
      const next = JSON.parse(JSON.stringify(inv)); const p = next.products.find((x) => x.id === b.dataset.hiFrequent); p.frequent = !p.frequent;
      commit(next, p.frequent ? `★ ${p.nameZh} 設為常用` : `${p.nameZh} 取消常用`); render();
    }));
    el.querySelectorAll("[data-hi-archive]").forEach((b) => b.addEventListener("click", () => {
      const next = JSON.parse(JSON.stringify(inv)); const p = next.products.find((x) => x.id === b.dataset.hiArchive); p.archived = !p.archived;
      commit(next, p.archived ? `${p.nameZh} 已封存(帳還在)` : `${p.nameZh} 取消封存`); render();
    }));
    // 編輯品項
    el.querySelectorAll("[data-hi-edit-product]").forEach((b) => b.addEventListener("click", () => {
      editingProduct = editingProduct === b.dataset.hiEditProduct ? "" : b.dataset.hiEditProduct; render();
      root().querySelector("#hiEditProduct")?.scrollIntoView({ block: "nearest" });
    }));
    el.querySelector("[data-hi-ep-cancel]")?.addEventListener("click", () => { editingProduct = ""; render(); });
    el.querySelector("[data-hi-ep-save]")?.addEventListener("click", (e) => {
      const patch = {};
      el.querySelectorAll("[data-hi-ep]").forEach((x) => { patch[x.dataset.hiEp] = x.type === "checkbox" ? x.checked : x.value; });
      patch.packageG = Number(patch.packageG);
      if (patch.reorderG !== "") patch.reorderG = Number(patch.reorderG);
      if (patch.openedShelfMonths !== "") patch.openedShelfMonths = Number(patch.openedShelfMonths);
      const old = product(e.target.dataset.hiEpSave);
      if (patch.nameZh !== old.nameZh || patch.kind !== old.kind) patch.knowledgeId = findKnowledgeId(patch.kind, patch.nameZh, patch.nameEn) || "";
      try { if (commit(H.editProduct(inv, old.id, patch), `已更新 ${patch.nameZh}`)) editingProduct = ""; } catch (err) { msg = { text: err.message, ok: false }; }
      render();
    });
    // 修改批次資訊(批號、效期、購買日、價格、地點;克數不能改)
    el.querySelectorAll("[data-hi-edit-lot]").forEach((b) => b.addEventListener("click", () => {
      const lot = inv.lots.find((l) => l.id === b.dataset.hiEditLot);
      const cell = b.closest(".hi-lot");
      if (!lot || !cell || cell.querySelector(".hi-adjust-form")) return;
      cell.insertAdjacentHTML("beforeend", `<span class="hi-adjust-form hi-lot-edit">
        <label class="hi-f"><span>批號</span><input data-hi-el="lotNo" value="${attr(lot.lotNo)}"></label>
        <label class="hi-f"><span>效期</span><input type="date" data-hi-el="expiry" value="${attr(lot.expiry)}"></label>
        <label class="hi-f"><span>購買日</span><input type="date" data-hi-el="purchaseDate" value="${attr(lot.purchaseDate)}"></label>
        <label class="hi-f"><span>總價(美金)</span><input type="number" step="0.01" min="0" data-hi-el="price" value="${attr(lot.price)}"></label>
        <label class="hi-f"><span>購買地點</span><input data-hi-el="place" value="${attr(lot.place)}"></label>
        <label class="hi-f"><span>開封日</span><input type="date" data-hi-el="openedDate" value="${attr(lot.openedDate)}"></label>
        <button type="button" class="hi-primary" data-hi-el-save>存這批</button></span>`);
      cell.querySelector("[data-hi-el-save]").addEventListener("click", () => {
        const patch = {};
        cell.querySelectorAll("[data-hi-el]").forEach((x) => { patch[x.dataset.hiEl] = x.value; });
        try { commit(H.editLot(inv, lot.id, patch), "這批資訊已更新(克數沒動)"); } catch (err) { msg = { text: err.message, ok: false }; }
        render();
      });
    }));
    wireVoid(el, render);
    // 一次貼上清單
    el.querySelector("#hiBulkExample")?.addEventListener("click", () => { bulkText = BULK_EXAMPLE; bulkPreview = null; render(); root().querySelector("#hiBulk")?.scrollIntoView({ block: "start" }); });
    el.querySelector("#hiBulkPreview")?.addEventListener("click", () => {
      bulkText = val(el, "hiBulkText");
      bulkPreview = H.parseBulk(bulkText, inv.products);
      if (!bulkPreview.rows.length) msg = { text: "沒有讀到任何一列", ok: false };
      render(); root().querySelector("#hiBulk")?.scrollIntoView({ block: "start" });
    });
    el.querySelector("#hiBulkApply")?.addEventListener("click", () => {
      try {
        const res = H.applyBulk(inv, H.parseBulk(bulkText, inv.products).rows, newId, today(), findKnowledgeId);
        if (commit(res.data, `已建立 ${res.products} 個品項、入庫 ${res.lots} 批`)) { bulkText = ""; bulkPreview = null; tab = "stock"; }
      } catch (err) { msg = { text: err.message, ok: false }; }
      render();
    });
    el.querySelectorAll("[data-hi-adjust]").forEach((b) => b.addEventListener("click", () => {
      const lot = inv.lots.find((l) => l.id === b.dataset.hiAdjust);
      const cell = b.closest(".hi-lot");
      if (!cell || cell.querySelector(".hi-adjust-form")) return;
      cell.insertAdjacentHTML("beforeend", `<span class="hi-adjust-form"><label class="hi-f"><span>實際還剩幾克</span><input type="number" step="0.5" min="0" value="${H.lotRemaining(inv, lot.id)}"></label><input placeholder="原因(選填)"><button type="button" class="hi-primary">記盤點</button></span>`);
      const [gEl, nEl, ok] = cell.querySelectorAll(".hi-adjust-form input, .hi-adjust-form button");
      ok.addEventListener("click", () => {
        try {
          const delta = Number(gEl.value) - H.lotRemaining(inv, lot.id);
          if (!delta) { msg = { text: "跟帳上一樣,沒有調整", ok: true }; return render(); }
          commit(H.adjust(inv, lot.id, delta, today(), "adjust", nEl.value, newId), `已記盤點(${delta > 0 ? "+" : ""}${Math.round(delta * 10) / 10} g)`);
        } catch (e) { msg = { text: e.message, ok: false }; }
        render();
      });
    }));
    el.querySelectorAll("[data-hi-discard]").forEach((b) => b.addEventListener("click", () => {
      const cell = b.closest(".hi-lot");
      if (!cell || cell.querySelector(".hi-adjust-form")) return;
      cell.insertAdjacentHTML("beforeend", `<span class="hi-adjust-form"><input placeholder="報廢原因,例:受潮、過期"><button type="button" class="hi-danger">確定報廢這一批</button></span>`);
      const [nEl, ok] = cell.querySelectorAll(".hi-adjust-form input, .hi-adjust-form button");
      ok.addEventListener("click", () => {
        try { commit(H.adjust(inv, b.dataset.hiDiscard, 0, today(), "discard", nEl.value, newId), "已報廢這一批(帳上留紀錄)"); } catch (e) { msg = { text: e.message, ok: false }; }
        render();
      });
    }));
    // 記用量
    el.querySelector("#hiUsePid")?.addEventListener("change", (e) => { useDraft.pid = e.target.value; render(); });
    el.querySelectorAll("[data-hi-purpose]").forEach((b) => b.addEventListener("click", () => { useDraft.purpose = b.dataset.hiPurpose; useDraft.grams = val(el, "hiUseG"); useDraft.note = val(el, "hiUseNote"); render(); }));
    el.querySelector("#hiUseSave")?.addEventListener("click", () => {
      Object.assign(useDraft, { grams: val(el, "hiUseG"), date: val(el, "hiUseDate"), note: val(el, "hiUseNote") });
      if (!useDraft.pid) { msg = { text: "先選藥品", ok: false }; return render(); }
      try {
        const p = product(useDraft.pid);
        if (commit(H.use(inv, useDraft.pid, Number(useDraft.grams), useDraft.date || today(), useDraft.purpose, useDraft.note, newId), "")) {
          msg = { text: `已扣 ${useDraft.grams} g ${p.nameZh},剩 ${fmtG(H.stats(inv, product(useDraft.pid), today()).stock)}`, ok: true };
          useDraft.grams = ""; useDraft.note = "";
        }
      } catch (e) { msg = { text: e.message, ok: false }; }
      render();
    });
    // 入庫
    const cost = () => { const price = Number(val(el, "hiRecvPrice")), g = Number(val(el, "hiRecvN")) * Number(val(el, "hiRecvPkg")); const c = el.querySelector("#hiRecvCost"); if (c) c.textContent = price > 0 && g > 0 ? `每克 US$ ${(price / g).toFixed(3)} · 共 ${g} g` : "輸入總價後,這裡顯示每克成本。"; };
    ["hiRecvPrice", "hiRecvN", "hiRecvPkg"].forEach((id) => el.querySelector("#" + id)?.addEventListener("input", cost));
    el.querySelector("#hiRecvPid")?.addEventListener("change", (e) => { recvDraft.pid = e.target.value; render(); });
    el.querySelector("#hiRecvSave")?.addEventListener("click", () => {
      try {
        if (!recvDraft.pid) throw new Error("先選藥品");
        const r = H.receiveLot(inv, { productId: recvDraft.pid, gramsInit: Number(val(el, "hiRecvN")) * Number(val(el, "hiRecvPkg")), price: Number(val(el, "hiRecvPrice")),
          lotNo: val(el, "hiRecvLot").trim(), expiry: val(el, "hiRecvExp"), purchaseDate: val(el, "hiRecvDate") || today(), place: val(el, "hiRecvPlace").trim() }, newId);
        commit(r.data, `已入庫 ${product(recvDraft.pid).nameZh} ${r.lot.gramsInit} g,每克 US$ ${H.costPerGram(r.lot).toFixed(3)}`);
      } catch (e) { msg = { text: e.message, ok: false }; }
      render();
    });
    el.querySelector("#hiNForm")?.addEventListener("change", (e) => { if (e.target.value === "raw" || e.target.value === "honeypill") el.querySelector("#hiNRatio").value = ""; });
    el.querySelector("#hiNSave")?.addEventListener("click", () => {
      const nameZh = val(el, "hiNZh").trim();
      if (!nameZh) { msg = { text: "中文名要填", ok: false }; return render(); }
      const kind = val(el, "hiNKind");
      const p = { id: newId("prod"), nameZh, nameEn: val(el, "hiNEn").trim(), kind, form: val(el, "hiNForm"), brand: val(el, "hiNBrand").trim(), code: val(el, "hiNCode").trim(),
        packageG: Number(val(el, "hiNPkg")) || 100, ratio: val(el, "hiNRatio").trim(), source: val(el, "hiNSrc"), madeIn: val(el, "hiNMade"), origin: val(el, "hiNOrigin").trim(),
        organic: !!el.querySelector("#hiNOrganic")?.checked, frequent: !!el.querySelector("#hiNFrequent")?.checked,
        reorderG: val(el, "hiNReorder"), openedShelfMonths: val(el, "hiNShelf"), knowledgeId: findKnowledgeId(kind, nameZh, val(el, "hiNEn")), archived: false };
      const next = H.normalize(Object.assign(JSON.parse(JSON.stringify(inv)), { products: [...inv.products, p] }));
      if (commit(next, `已建立 ${nameZh}${p.knowledgeId ? "(已連到知識庫的卡)" : ""},接著入第一批`)) recvDraft.pid = p.id;
      render();
    });
    // 開藥
    el.querySelectorAll("[data-hi-rx-lens]").forEach((b) => b.addEventListener("click", () => { rxLens = b.dataset.hiRxLens; rxPick = ""; render(); }));
    el.querySelectorAll("[data-hi-rx-pick]").forEach((b) => b.addEventListener("click", () => { rxPick = b.dataset.hiRxPick; render(); }));
    const keep = () => {
      Object.assign(rxDraft, { patientCode: val(el, "hiRxCode").trim().toUpperCase(), sexAge: val(el, "hiRxSex").trim(), condition: val(el, "hiRxCond").trim(),
        category: val(el, "hiRxCat"), pattern: val(el, "hiRxPat").trim(), note: val(el, "hiRxNote").trim() });
      el.querySelectorAll("[data-hi-xi]").forEach((x) => { rxDraft.items[Number(x.dataset.hiXi)][x.dataset.hiXk] = x.value; });
    };
    el.querySelector("#hiRxCase")?.addEventListener("change", (e) => { keep(); fillRxFromCase(e.target.value); render(); });
    el.querySelector("#hiRxAdd")?.addEventListener("click", () => { keep(); rxDraft.items.push({ productId: "", gpd: "", days: rxDraft.items[0].days || "7" }); render(); });
    el.querySelector("#hiRxSave")?.addEventListener("click", () => {
      keep();
      try {
        const r = H.prescribe(inv, Object.assign({}, rxDraft, { date: today() }), newId);
        if (commit(r.data, `已開方:${r.rx.patientCode} ${r.rx.condition},共扣 ${fmtG(H.rxTotal(r.rx))}`)) {
          rxLens = "patient"; rxPick = r.rx.patientCode;
          Object.assign(rxDraft, { note: "", items: [{ productId: "", gpd: "", days: "7" }] });
        }
      } catch (e) { msg = { text: e.message, ok: false }; }
      render();
    });
    // 採購 / 數據 / 設定
    el.querySelectorAll("[data-hi-where]").forEach((b) => b.addEventListener("click", () => { shopWhere = b.dataset.hiWhere; render(); }));
    const copy = async (text, okText) => {
      try { await navigator.clipboard.writeText(text); msg = { text: okText, ok: true }; } catch (_) { msg = { text: "這個瀏覽器不讓複製", ok: false }; }
      render();
    };
    el.querySelector("#hiCopyShop")?.addEventListener("click", () => copy(el.querySelector("#hiShopText").value, "清單已複製,可以貼到 LINE 或備忘錄"));
    el.querySelector("#hiCopyCsv")?.addEventListener("click", () => {
      const rows = [["日期", "類型", "藥品", "品牌", "批號", "克數", "用途", "備註"]].concat(inv.txns.map((x) => { const p = product(x.productId), l = inv.lots.find((y) => y.id === x.lotId); return [x.date, x.type, p && p.nameZh, p && p.brand, l && l.lotNo, x.grams, x.purpose, x.note]; }));
      copy(rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n"), `已複製 ${rows.length - 1} 筆,可貼進試算表`);
    });
    // 半年回顧(D37)
    const rvSave = (patch, okText) => {
      const next = JSON.parse(JSON.stringify(inv));
      next.settings.rxReview = Object.assign({}, next.settings.rxReview || {}, patch);
      if (commit(next, okText)) reminderCache = null;
      render();
    };
    el.querySelectorAll("[data-rv-set]").forEach((i) => i.addEventListener("change", () => {
      const v = i.value.trim();
      rvSave({ [i.dataset.rvSet]: v === "" ? "" : Number(v) }, "採購假設已存");
    }));
    const rvRange = () => {
      const f = val(el, "rvFrom"), to = val(el, "rvTo");
      if (RXP() && RXP().isISODate(f) && RXP().isISODate(to) && f <= to) { reviewRange = { from: f, to }; render(); }
      else { msg = { text: "期間要是兩個真的日期,而且「從」不能晚於「到」", ok: false }; render(); }
    };
    el.querySelector("#rvFrom")?.addEventListener("change", rvRange);
    el.querySelector("#rvTo")?.addEventListener("change", rvRange);
    el.querySelector("#rvReset")?.addEventListener("click", () => { reviewRange = null; render(); });
    el.querySelector("#rvCopy")?.addEventListener("click", () => {
      const rows = reviewCsv();
      copy(rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n"), `已複製 ${rows.length - 1} 列採購建議(不含病人),可貼進試算表`);
    });
    el.querySelector("#rvDone")?.addEventListener("click", () => {
      const t = today();
      rvSave({ lastReviewedAt: t }, `已記下:下次提醒 ${RXP().addDays(t, RXP().reviewSettings(inv.settings.rxReview).periodDays)}`);
      const b = document.querySelector(".rx-review-banner");
      if (b) b.remove();
    });
    el.querySelectorAll("[data-hi-set]").forEach((i) => i.addEventListener("change", () => { const next = JSON.parse(JSON.stringify(inv)); next.settings[i.dataset.hiSet] = Number(i.value); commit(next, "設定已存"); render(); }));
    el.querySelectorAll("[data-hi-shelf]").forEach((i) => i.addEventListener("change", () => { const next = JSON.parse(JSON.stringify(inv)); next.settings.shelfByForm[i.dataset.hiShelf] = Number(i.value); commit(next, "設定已存"); render(); }));
    el.querySelector("#hiEmailTo")?.addEventListener("change", (e) => { const next = JSON.parse(JSON.stringify(inv)); next.settings.emailTo = e.target.value.trim(); commit(next, "Email 已存"); render(); });
    el.querySelector("#hiExport")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(inv, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `acuting-herb-inventory-${today()}.json`; a.click(); URL.revokeObjectURL(a.href);
    });
  }

  // 撤銷開方:先在卡片上展開「原因 + 確定」,按了才寫(藥量以反向帳加回)。藥櫃頁與病例頁共用。
  function wireVoid(container, after) {
    container.querySelectorAll("[data-hi-void-rx]").forEach((b) => b.addEventListener("click", () => {
      const cell = b.closest(".hi-lot");
      if (!cell || cell.querySelector(".hi-adjust-form")) return;
      cell.insertAdjacentHTML("beforeend", `<span class="hi-adjust-form"><input placeholder="撤銷原因,例:開錯藥、病人沒拿"><button type="button" class="hi-danger">確定撤銷,藥加回庫存</button></span>`);
      const [reasonEl, ok] = cell.querySelectorAll(".hi-adjust-form input, .hi-adjust-form button");
      ok.addEventListener("click", () => {
        ensure();
        try { commit(H.voidRx(inv, b.dataset.hiVoidRx, today(), reasonEl.value.trim(), newId), "已撤銷這張方,藥量加回庫存(紀錄保留)"); }
        catch (err) { msg = { text: err.message, ok: false }; }
        after();
      });
    }));
  }

  // 從自家病例帶入開方欄位(代號、性別年齡、病症、類別、證型)
  function fillRxFromCase(caseId) {
    const c = caseId && typeof clinicalCases !== "undefined" ? clinicalCases.find((x) => x.id === caseId) : null;
    rxDraft.caseId = c ? c.id : "";
    if (!c) return;
    const S = window.AcuTingCaseSearch;
    const label = S ? S.caseLabel(c) : {};
    rxDraft.patientCode = label.displayCode || c.patientCode || "";
    rxDraft.sexAge = label.sexAge || "";
    rxDraft.condition = c.caseTitle || c.chiefComplaint || "";
    rxDraft.category = c.categoryPrimary || "";
    rxDraft.pattern = (c.tcmPatterns || [])[0] || "";
  }

  // 病例頁呼叫:這個病例在藥櫃的開藥紀錄(只讀),以及「開藥」入口
  function caseRxHtml(item) {
    if (!item || item.clinicSite !== "home") return "";
    if (!ensure()) return "";
    const list = inv.rx.filter((r) => r.caseId === item.id).sort((a, b) => b.date.localeCompare(a.date));
    return `<div class="timeline-head" id="caseSecHerbRx"><strong>藥櫃開藥 Herbs dispensed</strong><small class="timeline-date">${list.length} 次</small>
        <button type="button" class="ghost" data-hi-case-rx="${attr(item.id)}">+ 開藥(扣藥櫃)</button></div>
      ${list.length ? `<div class="hi-lots hi-in-case">${list.map((r) => rxCardHtml(r, false)).join("")}</div>` : `<div class="case-empty">這個病例還沒有從藥櫃開過藥。</div>`}`;
  }
  function wireCase(container) {
    container.querySelectorAll("[data-hi-case-rx]").forEach((b) => b.addEventListener("click", () => startRxForCase(b.dataset.hiCaseRx)));
    wireVoid(container, () => { if (typeof renderClinicalCases === "function") renderClinicalCases(); });
    container.querySelectorAll(".hi-in-case [data-hi-kb]").forEach((b) => b.addEventListener("click", () => {
      const [kind, id] = b.dataset.hiKb.split("|");
      if (!(id && typeof openKnowledgeRecord === "function" && openKnowledgeRecord(kind, id))) window.location.hash = `#ws/${kind}`;
    }));
  }
  function startRxForCase(caseId) {
    ensure();
    fillRxFromCase(caseId);
    rxDraft.items = [{ productId: "", gpd: "", days: "7" }];
    tab = "rx";
    if (window.location.hash === "#ws/herbinv") render();
    else window.location.hash = "#ws/herbinv";
  }

  // 半年提醒也在這裡畫:app.js 開機第一次 render() 時這支還沒載入(它是最後一支 defer),
  // 若只靠 app.js 的 render(),打開首頁什麼都不點的話提醒永遠不會出現。
  const onRoute = () => { if (window.location.hash === "#ws/herbinv") { load(); render(); } renderReviewReminder(); };
  window.addEventListener("hashchange", onRoute);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onRoute); else onRoute();

  window.AcuTingHerbInventoryUI = { render, caseRxHtml, wireCase, startRxForCase, reload: load, renderReviewReminder, openReview };
})();
