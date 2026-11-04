/* herb-inventory.js — 藥櫃(科學中藥 / 水藥庫存、開藥紀錄)的純函式層(2026-11-03,D36)。
 *
 * 設計在 Ting 審過的原型裡定案(claude.ai artifact「AcuTing 藥櫃」),規則照專業藥局:
 *   - 品項主檔(products)→ 批次(lots:批號 / 效期 / 開封日 / 美金價格 / 購買地點)→ 異動帳(txns)。
 *   - **帳只加不改**:入庫 +、用量 −、盤點調整 ±、報廢 −;庫存一律從帳加總,不存「剩幾克」這種會跟帳脫節的數字。
 *   - FEFO:已開封的先用完,再用效期最早的;用量依此自動從一批或多批扣,第一次扣到的批次記開封日。
 *   - 補貨點 = 日均用量 ×(補貨天數 + 安全天數);★ 常用的另有硬門檻(預設 20 g,低於就寄 email)。
 *   - 開藥紀錄(rx)只給「自家」病人(Bastyr 與外部診所走他們的藥房,不扣她家的藥);
 *     可依病人或依病症看,用來複習自己的開藥。
 *   - 價格一律美金(她自己換算)。開封後期限依劑型(科中 24 月、水藥 36 月…),品項可另設。
 * 這裡不碰 DOM、不碰儲存;scripts/validate-herb-inventory.js 在 node 裡跑真值表。
 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "acuting-herb-inventory-v1";
  const SCHEMA = "acuting-herb-inventory-v1";
  const DAY = 86400000;

  const SOURCES = { taiwan: "台灣帶回", canada: "加拿大", baijia: "百家中藥行", us_online: "美國網購", other: "其他" };
  const KINDS = { formula: "方劑", single: "單味藥" };
  const FORMS = { granule: "科中(濃縮顆粒)", powder: "濃縮散", capsule: "膠囊", honeypill: "蜜丸", raw: "水藥(飲片)", other: "其他" };
  const MADE_IN = ["台灣", "美國", "中國", "加拿大", "日本", "韓國", "其他"];
  // 常見品牌(建立品項時的選單;可直接打別的)。只是常見,不是排名;英文名不確定的不寫。
  const BRANDS = {
    "台灣科中": ["順天堂 Sun Ten", "勝昌 Sheng Chang", "莊松榮 Chuang Song Zong", "港香蘭 KPC", "科達", "明通 Ming Tong", "天明", "仙豐"],
    "美國常見": ["Sun Ten(Brion)", "KPC Herbs", "Min Tong Herbs", "Evergreen Herbs", "Mayway", "TCMzone", "Treasure of the East", "Pacific Herbs", "Neo-Green Herbs", "Golden Flower"],
  };
  const PURPOSES = ["自家病人", "自用", "家人", "練習/教學", "試吃"];
  const DEFAULT_SETTINGS = {
    leadDays: 30, safetyDays: 14, targetDays: 120, expiryWarnDays: 90, slowDays: 120,
    frequentMinG: 20, emailTo: "",
    // Ting 2026-11-03:科中開封後兩年、水藥三到四年(取 36 月)
    shelfByForm: { granule: 24, powder: 12, capsule: 12, honeypill: 12, raw: 36, other: 12 },
  };

  const str = (v) => (v === null || v === undefined ? "" : String(v));
  const arr = (v) => (Array.isArray(v) ? v : []);
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const round1 = (g) => Math.round(g * 10) / 10;
  function isoOf(d) { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); }
  const addDays = (iso, n) => new Date(Date.parse(iso + "T00:00:00Z") + n * DAY).toISOString().slice(0, 10);
  const addMonths = (iso, n) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 10); };
  const daysBetween = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / DAY);

  function emptyData() {
    return { schema: SCHEMA, products: [], lots: [], txns: [], rx: [], settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) };
  }
  // 讀進來的資料補齊形狀(舊版少的欄位給預設);不認得的 schema 一律拒絕,不猜。
  function normalize(doc) {
    if (doc === null || doc === undefined) return emptyData();
    if (typeof doc !== "object" || (doc.schema && doc.schema !== SCHEMA)) throw new Error("不是藥櫃資料(schema 不符)");
    const out = emptyData();
    out.products = arr(doc.products).map((p) => ({ id: str(p.id), nameZh: str(p.nameZh), nameEn: str(p.nameEn), kind: KINDS[p.kind] ? p.kind : "formula",
      form: FORMS[p.form] ? p.form : "granule", brand: str(p.brand), code: str(p.code), ratio: str(p.ratio), packageG: num(p.packageG) || 100,
      source: SOURCES[p.source] ? p.source : "other", madeIn: str(p.madeIn), origin: str(p.origin), organic: !!p.organic, frequent: !!p.frequent,
      reorderG: p.reorderG === "" || p.reorderG === undefined || p.reorderG === null ? "" : num(p.reorderG),
      openedShelfMonths: p.openedShelfMonths === "" || p.openedShelfMonths === undefined || p.openedShelfMonths === null ? "" : num(p.openedShelfMonths),
      knowledgeId: str(p.knowledgeId), archived: !!p.archived }));
    out.lots = arr(doc.lots).map((l) => ({ id: str(l.id), productId: str(l.productId), lotNo: str(l.lotNo), purchaseDate: str(l.purchaseDate),
      expiry: str(l.expiry), openedDate: str(l.openedDate), gramsInit: num(l.gramsInit), price: num(l.price), place: str(l.place) }));
    out.txns = arr(doc.txns).map((x) => ({ id: str(x.id), date: str(x.date), type: str(x.type), productId: str(x.productId), lotId: str(x.lotId),
      grams: num(x.grams), purpose: str(x.purpose), note: str(x.note), rxId: str(x.rxId) }));
    out.rx = arr(doc.rx).map((r) => ({ id: str(r.id), date: str(r.date), patientCode: str(r.patientCode), sexAge: str(r.sexAge),
      caseId: str(r.caseId), condition: str(r.condition), category: str(r.category), pattern: str(r.pattern), note: str(r.note),
      items: arr(r.items).map((l) => ({ productId: str(l.productId), gpd: num(l.gpd), days: num(l.days) })) }));
    out.settings = Object.assign(out.settings, doc.settings || {});
    out.settings.shelfByForm = Object.assign({}, DEFAULT_SETTINGS.shelfByForm, (doc.settings || {}).shelfByForm || {});
    return out;
  }

  // ── 計算 ──
  const lotRemaining = (data, lotId) => round1(data.txns.filter((x) => x.lotId === lotId).reduce((s, x) => s + x.grams, 0));
  const costPerGram = (lot) => (lot.gramsInit > 0 ? lot.price / lot.gramsInit : 0);
  const lotsOf = (data, pid) => data.lots.filter((l) => l.productId === pid).map((l) => Object.assign({}, l, { remaining: lotRemaining(data, l.id) }));
  // FEFO:已開封的先用完,再用效期最早的
  const fefo = (lots) => lots.filter((l) => l.remaining > 0.001)
    .sort((a, b) => (b.openedDate ? 1 : 0) - (a.openedDate ? 1 : 0) || str(a.expiry).localeCompare(str(b.expiry)));
  function shelfMonths(data, p) {
    if (p.openedShelfMonths !== "" && p.openedShelfMonths > 0) return p.openedShelfMonths;
    return num((data.settings.shelfByForm || {})[p.form]) || 12;
  }
  function usageG(data, pid, days, until) {
    const from = addDays(until, -days);
    return -data.txns.filter((x) => x.productId === pid && x.type === "use" && x.date > from && x.date <= until).reduce((s, x) => s + x.grams, 0);
  }

  function stats(data, p, today) {
    const S = data.settings, t = today || isoOf(new Date());
    const lots = lotsOf(data, p.id);
    const live = lots.filter((l) => l.remaining > 0.001);
    const stock = round1(live.reduce((s, l) => s + l.remaining, 0));
    const uses = data.txns.filter((x) => x.productId === p.id && x.type === "use").map((x) => x.date).sort();
    const firstUse = uses[0], lastUse = uses[uses.length - 1] || "";
    // 日均用量:看最近 90 天;剛開始用不到 90 天的,用實際天數,但至少 30 天 ——
    // 實測:剛建好的藥櫃只有一兩天紀錄時,14 天的底會把一次大用量放大成「建議買 9 包」。
    // (+1:第一次用的那天也要算進去;usageG 的區間是「起點之後、到今天為止」)
    const window = firstUse ? Math.min(90, Math.max(30, daysBetween(firstUse, t) + 1)) : 90;
    const adu = usageG(data, p.id, window, t) / window;
    const reorderAuto = Math.ceil(adu * (num(S.leadDays) + num(S.safetyDays)));
    const reorder = p.reorderG !== "" ? num(p.reorderG) : reorderAuto;
    const dos = adu > 0 ? stock / adu : Infinity;
    const expired = live.filter((l) => l.expiry && l.expiry < t);
    const expiring = live.filter((l) => l.expiry && l.expiry >= t && daysBetween(t, l.expiry) <= num(S.expiryWarnDays));
    const openedLong = live.filter((l) => l.openedDate && addMonths(l.openedDate, shelfMonths(data, p)) < t);
    const frequentLow = !!p.frequent && stock < num(S.frequentMinG === undefined ? 20 : S.frequentMinG);
    const low = frequentLow || (adu > 0 && stock <= reorder) || (stock <= 0.001 && !!lastUse);
    const slow = stock > 0 && (!lastUse || daysBetween(lastUse, t) > num(S.slowDays));
    const value = live.reduce((s, l) => s + l.remaining * costPerGram(l), 0);
    return { lots, live, stock, adu, reorder, reorderAuto, dos, lastUse, expired, expiring, openedLong, frequentLow, low, slow, value, next: fefo(lots)[0] || null };
  }

  // ── 寫入(都回傳新的 data,不改原物件)──
  const clone = (d) => JSON.parse(JSON.stringify(d));
  function receiveLot(data, lot, newId) {
    if (!data.products.some((p) => p.id === lot.productId)) throw new Error("找不到這個品項");
    if (!(num(lot.gramsInit) > 0)) throw new Error("克數要大於 0");
    if (!(num(lot.price) >= 0)) throw new Error("價格不能是負的");
    if (!lot.expiry) throw new Error("要填有效期限");
    const d = clone(data);
    const l = { id: newId("lot"), productId: lot.productId, lotNo: str(lot.lotNo), purchaseDate: str(lot.purchaseDate), expiry: str(lot.expiry),
      openedDate: "", gramsInit: num(lot.gramsInit), price: num(lot.price), place: str(lot.place) };
    d.lots.push(l);
    d.txns.push({ id: newId("txn"), date: l.purchaseDate, type: "receive", productId: l.productId, lotId: l.id, grams: l.gramsInit, purpose: "", note: "", rxId: "" });
    return { data: d, lot: l };
  }
  // 用量:依 FEFO 從一批或多批扣。庫存不夠就整筆拒絕(不扣半套)。
  function use(data, pid, grams, date, purpose, note, newId, rxId) {
    const g = num(grams);
    if (!(g > 0)) throw new Error("克數要大於 0");
    const order = fefo(lotsOf(data, pid));
    const avail = order.reduce((s, l) => s + l.remaining, 0);
    if (avail + 1e-9 < g) throw new Error(`庫存只剩 ${round1(avail)} g,不夠扣 ${g} g`);
    const d = clone(data);
    let need = g;
    for (const l of order) {
      if (need <= 1e-9) break;
      const take = Math.min(need, l.remaining);
      const real = d.lots.find((x) => x.id === l.id);
      if (!real.openedDate) real.openedDate = date;
      d.txns.push({ id: newId("txn"), date, type: "use", productId: pid, lotId: l.id, grams: -round1(take), purpose: str(purpose), note: str(note), rxId: str(rxId) });
      need -= take;
    }
    return d;
  }
  // 盤點調整 / 報廢:寫一筆帳,不改舊帳。報廢只能把那一批扣到 0。
  function adjust(data, lotId, deltaG, date, type, note, newId) {
    const lot = data.lots.find((l) => l.id === lotId);
    if (!lot) throw new Error("找不到這一批");
    const rem = lotRemaining(data, lotId);
    const delta = type === "discard" ? -rem : num(deltaG);
    if (rem + delta < -1e-9) throw new Error("調整後會變成負的");
    const d = clone(data);
    d.txns.push({ id: newId("txn"), date, type: type === "discard" ? "discard" : "adjust", productId: lot.productId, lotId, grams: round1(delta), purpose: "", note: str(note), rxId: "" });
    return d;
  }
  // 開方:每一味先全部檢查庫存,夠才一起扣(不會開一半)
  function prescribe(data, rx, newId) {
    const items = arr(rx.items).filter((l) => l.productId).map((l) => ({ productId: str(l.productId), gpd: num(l.gpd), days: num(l.days) }));
    if (!str(rx.patientCode)) throw new Error("要填病人代號");
    if (!str(rx.condition)) throw new Error("要填病症");
    if (!items.length) throw new Error("至少要有一味藥");
    if (items.some((l) => !(l.gpd > 0) || !(l.days > 0))) throw new Error("每一味都要有每天幾克和天數");
    const need = new Map();
    items.forEach((l) => need.set(l.productId, (need.get(l.productId) || 0) + l.gpd * l.days));
    for (const [pid, g] of need) {
      const avail = fefo(lotsOf(data, pid)).reduce((s, l) => s + l.remaining, 0);
      if (avail + 1e-9 < g) {
        const p = data.products.find((x) => x.id === pid);
        throw new Error(`${p ? p.nameZh : "?"} 庫存只剩 ${round1(avail)} g,這張方要 ${round1(g)} g`);
      }
    }
    const r = { id: newId("rx"), date: str(rx.date), patientCode: str(rx.patientCode), sexAge: str(rx.sexAge), caseId: str(rx.caseId),
      condition: str(rx.condition), category: str(rx.category), pattern: str(rx.pattern), note: str(rx.note), items };
    let d = data;
    for (const l of items) d = use(d, l.productId, l.gpd * l.days, r.date, "自家病人", `${r.patientCode} · ${r.condition}`, newId, r.id);
    d = clone(d);
    d.rx.push(r);
    return { data: d, rx: r };
  }

  // ── 報表 ──
  const rxTotal = (r) => r.items.reduce((s, l) => s + l.gpd * l.days, 0);
  function rxCost(data, r) {
    return r.items.reduce((s, l) => {
      const lot = lotsOf(data, l.productId).sort((a, b) => str(b.purchaseDate).localeCompare(str(a.purchaseDate)))[0];
      return s + (lot ? costPerGram(lot) * l.gpd * l.days : 0);
    }, 0);
  }
  // 依病人(patientCode)或依病症(category|condition)分組,每組依日期新到舊
  function groupRx(data, lens) {
    const groups = new Map();
    [...data.rx].sort((a, b) => b.date.localeCompare(a.date)).forEach((r) => {
      const k = lens === "condition" ? `${r.category}|${r.condition}` : r.patientCode;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(r);
    });
    return groups;
  }
  // 一個病症:各藥開過幾次、平均一天幾克、總量(複習開藥用)
  function conditionSummary(rxList) {
    const agg = new Map();
    rxList.forEach((r) => r.items.forEach((l) => {
      const a = agg.get(l.productId) || { productId: l.productId, times: 0, gpdSum: 0, totalG: 0 };
      a.times++; a.gpdSum += l.gpd; a.totalG += l.gpd * l.days;
      agg.set(l.productId, a);
    }));
    return [...agg.values()].map((a) => Object.assign(a, { avgGpd: a.gpdSum / a.times })).sort((a, b) => b.times - a.times || b.totalG - a.totalG);
  }
  // 採購清單:低於補貨點 / 有過期 / 快過期而且扣掉快過期的就不夠的;補到目標天數,換算整包裝
  function shoppingList(data, today) {
    const t = today || isoOf(new Date());
    return data.products.filter((p) => !p.archived).map((p) => ({ p, s: stats(data, p, t) }))
      .filter(({ s }) => s.low || s.expired.length || (s.expiring.length && s.stock - s.expiring.reduce((a, l) => a + l.remaining, 0) <= s.reorder))
      .map(({ p, s }) => {
        const usable = s.live.filter((l) => !l.expiry || l.expiry >= t).reduce((a, l) => a + l.remaining, 0);
        const needG = Math.max(0, s.adu * num(data.settings.targetDays) - usable);
        const packs = Math.max(1, Math.ceil(needG / (p.packageG || 100)));
        const lastLot = [...s.lots].sort((a, b) => str(b.purchaseDate).localeCompare(str(a.purchaseDate)))[0];
        const why = s.expired.length ? "有過期批次要換掉" : s.frequentLow ? `常用藥剩 ${s.stock} g` : s.low ? `剩 ${s.stock} g,約 ${Number.isFinite(s.dos) ? Math.floor(s.dos) : 0} 天用完` : "現有的批次快過期";
        return { p, s, packs, estUSD: lastLot ? costPerGram(lastLot) * packs * p.packageG : null, why, lastPlace: lastLot ? lastLot.place : "" };
      });
  }
  // Email 提醒內容:★ 常用而且低於門檻的。沒有就回 null(不寄)。
  function frequentLowEmail(data, today) {
    const t = today || isoOf(new Date());
    const min = num(data.settings.frequentMinG === undefined ? 20 : data.settings.frequentMinG);
    const hits = data.products.filter((p) => p.frequent && !p.archived).map((p) => ({ p, s: stats(data, p, t) })).filter((x) => x.s.frequentLow);
    if (!hits.length) return null;
    return {
      subject: `AcuTing 藥櫃:${hits.length} 個常用藥低於 ${min} g`,
      lines: hits.map((x) => `${x.p.nameZh}(${x.p.brand || "未填品牌"})剩 ${x.s.stock} g —— 常在${SOURCES[x.p.source]}買`),
      productIds: hits.map((x) => x.p.id),
    };
  }

  const api = {
    STORAGE_KEY, SCHEMA, SOURCES, KINDS, FORMS, MADE_IN, BRANDS, PURPOSES, DEFAULT_SETTINGS,
    emptyData, normalize, isoOf, addDays, addMonths, daysBetween,
    lotRemaining, costPerGram, lotsOf, fefo, shelfMonths, usageG, stats,
    receiveLot, use, adjust, prescribe, rxTotal, rxCost, groupRx, conditionSummary, shoppingList, frequentLowEmail,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.AcuTingHerbInventory = api;
})(typeof window !== "undefined" ? window : globalThis);
