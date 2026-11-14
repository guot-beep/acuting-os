/* rx-profile.js — 半年開藥回顧與科學中藥採購建議(D37,2026-11-14,D32 凍結例外)。純函式,不碰 DOM、不寫任何儲存。
 *
 * Ting 2026-11-14:「每半年提醒一次:這半年接觸的病例、有開藥的病例、開了哪些方,還有用量推薦 ——
 * 例如 200 g 一罐的科學中藥大約可以採購幾罐」;「藥櫃是我自己用的,記錄的病例是學校跟診所的,分開推薦」。
 *
 * 兩條線分開算,不混:
 *   病歷線  學校 / 外部診所的病例(clinicSite ≠ home)。開方幾乎都是自由文字的科中複方比例,
 *           例「桂枝湯 40、止嗽散 40、清燥救肺湯 20;每次 5 g,一天三次」—— 數字是份數,每天總量寫在後面。
 *           2026-11-06 匯出實測:16 張有開方的 SOAP,結構化方劑 id 只有 4 張,帶天數的 0 張。
 *   藥櫃線  她自用與自家病人:直接用藥櫃帳上的實際用量(AcuTingHerbInventory.usageG)。
 *
 * 誠實規則(憲法 §二.4:劑量不准虛構):
 *   - 份數、每次幾克、一天幾次、天數 —— 只用病歷原文寫了的;沒寫就是 null,不補。
 *   - 病歷從來沒記天數,所以「每張方平均開幾天」是 Ting 在畫面上自己填的採購假設(settings.rxDays);
 *     沒填之前,罐數一律算不出來、畫面照實說。原文沒寫每天幾克的方,同理用她填的 settings.fallbackGpd。
 *   - 「單位原文未記」→ 數字可能不是份數,不換算克數;「未記服法」→ 沒有每天總量。兩者都只計張數。
 *   - 中英並列的開方(中文在前、英文翻譯在後)只算中文那一份,不重複計;整段沒有中文藥名才讀英文。
 */
(function (global) {
  "use strict";
  const DAY = 864e5;
  const str = (v) => (v === null || v === undefined ? "" : String(v));
  const arr = (v) => (Array.isArray(v) ? v : []);
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : NaN; };
  const round1 = (n) => Math.round(n * 10) / 10;
  const isISODate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(str(v)) && !Number.isNaN(Date.parse(v + "T00:00:00Z"));
  const addDays = (iso, n) => new Date(Date.parse(iso + "T00:00:00Z") + n * DAY).toISOString().slice(0, 10);
  const daysBetween = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / DAY);

  const DEFAULTS = Object.freeze({ bottleG: 200, rxDays: "", fallbackGpd: "", periodDays: 182, lastReviewedAt: "" });
  // 設定:只認數字;空字串 = 她還沒填(不是 0)
  function reviewSettings(s) {
    const src = Object.assign({}, DEFAULTS, s || {});
    const pos = (v) => { const n = num(v); return v !== "" && Number.isFinite(n) && n > 0 ? n : ""; };
    return {
      bottleG: pos(src.bottleG) || DEFAULTS.bottleG,
      rxDays: pos(src.rxDays),
      fallbackGpd: pos(src.fallbackGpd),
      periodDays: pos(src.periodDays) || DEFAULTS.periodDays,
      lastReviewedAt: isISODate(src.lastReviewedAt) ? src.lastReviewedAt : "",
    };
  }

  // ── 半年提醒 ──
  // 從沒看過 = 現在就到期;看過之後滿 periodDays 天再提醒
  function reminderState(settings, today) {
    const S = reviewSettings(settings);
    if (!isISODate(today)) throw new Error("today 要是 YYYY-MM-DD");
    if (!S.lastReviewedAt) return { due: true, firstTime: true, nextDue: today, daysLeft: 0 };
    const nextDue = addDays(S.lastReviewedAt, S.periodDays);
    const daysLeft = daysBetween(today, nextDue);
    return { due: daysLeft <= 0, firstTime: false, nextDue, daysLeft: Math.max(0, daysLeft) };
  }

  // ── 自由文字開方解析 ──
  const CJK = "\\u3400-\\u9fff";
  const UNIT_AFTER = "(?:g|G|克|公克|mg|ml|mL|毫升|次|天|日|包|錢|兩|%|週|周|月|年|歲|點|時|分|\\/|x|×|\\d)";
  const ITEM_CJK = new RegExp(`([${CJK}]{2,14})\\s*(\\d+(?:\\.\\d+)?)(?!\\s*${UNIT_AFTER})`, "g");
  const ITEM_LATIN = /([A-Z][a-z]+(?:[ -][A-Z]?[a-z]+){1,4})\s+(\d+(?:\.\d+)?)(?!\s*(?:g|G|mg|ml|mL|%|x|×|times|days?|d\b|\/|\d))/g;
  const ZH_NUM = { 一: 1, 二: 2, 兩: 2, 三: 3, 四: 4, 五: 5, 六: 6 };
  const ABBR = { QD: 1, BID: 2, TID: 3, QID: 4 };
  const PREFIXES = /^(製|炙|炒|生|酒|醋|鹽|蜜|焦)/;
  const DOSE_WORDS = /^(每次|每天|每日|一天|一日|一次|共|約|服)/;

  // 名字 → 知識庫:先整串、再逐字砍前綴(「處方桂枝湯」→「桂枝湯」)、再去炮製字(「製川烏」→「川烏」)
  function resolveName(run, resolve) {
    if (typeof resolve !== "function") return null;
    for (let i = 0; i <= run.length - 2; i++) {
      const s = run.slice(i);
      const hit = resolve(s) || (PREFIXES.test(s) ? resolve(s.replace(PREFIXES, "")) : null);
      if (hit) return { name: s, id: hit.id, kind: hit.kind };
    }
    return null;
  }

  function parseDose(chunk) {
    let perDose = null, times = null, perDay = null, days = null;
    let m = chunk.match(/每次\s*(\d+(?:\.\d+)?)\s*(?:g|G|克|公克)/) || chunk.match(/(\d+(?:\.\d+)?)\s*(?:g|G|克)\s*(?:每次|\/次|per dose)/i);
    if (m) perDose = num(m[1]);
    m = chunk.match(/(?:一天|每天|每日|一日)\s*([一二兩三四五六]|\d)\s*\/?\s*次/);
    if (m) times = ZH_NUM[m[1]] || num(m[1]);
    if (times === null) { m = chunk.match(/\b(QD|BID|TID|QID)\b/i); if (m) times = ABBR[m[1].toUpperCase()]; }
    if (perDose === null && times !== null) { m = chunk.match(/(\d+(?:\.\d+)?)\s*(?:g|G)\s*(?:QD|BID|TID|QID)\b/i); if (m) perDose = num(m[1]); }
    m = chunk.match(/(?:每天|每日|一天)\s*(\d+(?:\.\d+)?)\s*(?:g|G|克)/) || chunk.match(/(\d+(?:\.\d+)?)\s*(?:g|G|克)\s*(?:\/\s*(?:day|天|日)|per day|daily|每天|每日)/i);
    if (m) perDay = num(m[1]);
    // 天數:「7天份」「x 7 days」。不算:「11月26日」(日期)、「3 天後回診」「2 天前」(不是開藥天數)、「一天三次」(沒有阿拉伯數字)
    m = chunk.match(/(?<![月\/\d]\s?)(\d+)\s*(?:天|日)(?:份|量|藥)?(?![後前])(?![一二兩三四五六\d]*\s*\/?\s*次)/) || chunk.match(/(?:x|×|for)\s*(\d+)\s*(?:d|days?)\b/i) || chunk.match(/\b(\d+)\s*days?\b(?!\s*(?:later|ago|after|before))/i);
    if (m) days = num(m[1]);
    const gpd = perDay !== null ? perDay : (perDose !== null && times !== null ? perDose * times : null);
    return { gpd, days: days > 0 ? days : null };
  }

  /* text → { prescriptions:[{ items:[{name,id,kind,parts,share}], gpd, days, unitsUnknown, doseUnknown }], language } */
  function parseRxText(text, resolve) {
    const raw = str(text).replace(/\r/g, "");
    if (!raw.trim()) return { prescriptions: [], language: "" };
    // 先切方:編號「1. 2.」或日期「9/29/26」開新的一段
    const chunks = raw.split(/(?=(?:^|[\s:：;；。])(?:[1-9])[.．](?!\d))|(?=\b\d{1,2}\/\d{1,2}\/\d{2,4}\b)/).map((s) => s.trim()).filter(Boolean);
    const parsed = chunks.map((chunk) => {
      const unitsUnknown = /單位原文未記|單位未記|units? (?:not|un)recorded/i.test(chunk);
      const doseUnknown = /未記服法|服法未記|administration not recorded/i.test(chunk);
      const clean = chunk.replace(/[（(][^（）()]*[）)]/g, " ");
      const cjk = [], latin = [];
      let m;
      ITEM_CJK.lastIndex = 0;
      while ((m = ITEM_CJK.exec(clean))) {
        const run = m[1];
        if (DOSE_WORDS.test(run)) continue;
        const hit = resolveName(run, resolve);
        if (hit) cjk.push({ name: hit.name, id: hit.id, kind: hit.kind, parts: num(m[2]) });
        else if (run.length <= 6) cjk.push({ name: run, id: "", kind: "", parts: num(m[2]) });
      }
      ITEM_LATIN.lastIndex = 0;
      while ((m = ITEM_LATIN.exec(clean))) {
        const name = m[1].trim();
        const hit = typeof resolve === "function" ? resolve(name) : null;
        // 對到卡就顯示卡片中文名(「Bu Yang Huan Wu Tang」→ 補陽還五湯);對不到的保留原文拼音
        latin.push({ name: hit && hit.name ? hit.name : name, id: hit ? hit.id : "", kind: hit ? hit.kind : "", parts: num(m[2]) });
      }
      const dose = parseDose(clean);
      return { cjk, latin, unitsUnknown, doseUnknown, gpd: unitsUnknown || doseUnknown ? null : dose.gpd, days: dose.days };
    });
    // 中英並列只算中文:全文只要有一段讀到中文藥名,英文段一律不算(它們是翻譯)
    const anyCjk = parsed.some((p) => p.cjk.length);
    const language = anyCjk ? "zh" : (parsed.some((p) => p.latin.length) ? "en" : "");
    const prescriptions = parsed.map((p) => {
      const items = anyCjk ? p.cjk : p.latin;
      if (!items.length) return null;
      const total = items.reduce((s, it) => s + (Number.isFinite(it.parts) ? it.parts : 0), 0);
      const allParts = items.every((it) => Number.isFinite(it.parts) && it.parts > 0);
      return {
        items: items.map((it) => Object.assign({}, it, { share: allParts && total > 0 ? it.parts / total : null })),
        gpd: p.gpd, days: p.days, unitsUnknown: p.unitsUnknown, doseUnknown: p.doseUnknown,
      };
    }).filter(Boolean);
    return { prescriptions, language };
  }

  // ── 病歷 → 期間內的就診列 ──
  const inRange = (d, from, to) => isISODate(d) && d >= from && d <= to;
  function ageAt(c, today) {
    const y = num(str(c.birthYearMonth).slice(0, 4)) || num(c.birthYear);
    return Number.isFinite(y) && y > 1900 ? Number(today.slice(0, 4)) - y : null;
  }
  const AGE_BANDS = [["<18", 0, 17], ["18–39", 18, 39], ["40–59", 40, 59], ["60+", 60, 200]];
  const ageBand = (a) => (a === null ? "未填" : (AGE_BANDS.find(([, lo, hi]) => a >= lo && a <= hi) || ["未填"])[0]);

  /* opts: { from, to, today, excludeSites:["home"], resolve, nameOf(kind,id) } */
  function collectVisits(cases, opts) {
    const o = opts || {};
    if (!isISODate(o.from) || !isISODate(o.to)) throw new Error("from / to 要是 YYYY-MM-DD");
    const exclude = new Set(arr(o.excludeSites));
    const visits = [];
    let undated = 0;
    for (const c of arr(cases)) {
      if (exclude.has(str(c.clinicSite))) continue;
      for (const n of arr(c.soapNotes)) {
        const d = str(n.visitDate).slice(0, 10);
        if (!isISODate(d)) { undated++; continue; }
        if (!inRange(d, o.from, o.to)) continue;
        const parsed = parseRxText(n.formulaHerbs, o.resolve);
        const rxs = parsed.prescriptions.map((p) => Object.assign({}, p));
        // 結構化連結(formulaLinks / herbLinks)若沒被文字解析到,補成「只計張數」的一張
        const seen = new Set(rxs.flatMap((p) => p.items.map((it) => it.id)).filter(Boolean));
        const linked = [...arr(n.formulaLinks).map((id) => ["formula", id]), ...arr(n.herbLinks).map((id) => ["herb", id])]
          .filter(([, id]) => id && !seen.has(id))
          .map(([kind, id]) => ({ name: typeof o.nameOf === "function" ? (o.nameOf(kind, id) || id) : id, id, kind, parts: NaN, share: null }));
        if (linked.length) rxs.push({ items: linked, gpd: null, days: null, unitsUnknown: false, doseUnknown: false, fromLinks: true });
        const hasText = str(n.formulaHerbs).trim().length > 0;
        visits.push({
          caseId: str(c.id), patientKey: str(c.patientCode || c.id), site: str(c.clinicSite) || "(未填)",
          date: d, category: str(c.categoryPrimary), sex: str(c.sex), age: ageAt(c, o.today || o.to),
          conditions: [...arr(c.westernConditions), ...arr(c.easternDiseases)].map(str).filter(Boolean),
          prescribed: rxs.length > 0 || hasText, unparsedText: hasText && !parsed.prescriptions.length,
          prescriptions: rxs,
        });
      }
    }
    return { visits, undated };
  }

  // ── 病例輪廓 ──
  function caseMix(visits) {
    const tally = (m, k) => (m[k] = (m[k] || 0) + 1, m);
    const patients = new Map();
    visits.forEach((v) => { const p = patients.get(v.patientKey) || { visits: 0, prescribed: false, v }; p.visits++; p.prescribed = p.prescribed || v.prescribed; patients.set(v.patientKey, p); });
    const per = [...patients.values()];
    const by = (f) => per.reduce((m, p) => tally(m, f(p.v) || "未填"), {});
    const cond = {};
    per.forEach((p) => [...new Set(p.v.conditions)].forEach((k) => tally(cond, k)));
    return {
      patients: per.length, visits: visits.length,
      prescribedPatients: per.filter((p) => p.prescribed).length, prescribedVisits: visits.filter((v) => v.prescribed).length,
      bySite: by((v) => v.site), byCategory: by((v) => v.category), bySex: by((v) => v.sex), byAge: by((v) => ageBand(v.age)),
      topConditions: Object.entries(cond).sort((a, b) => b[1] - a[1]).slice(0, 10),
    };
  }

  // ── 各方 / 各味:張數、病人數、克數、罐數 ──
  function summarizeRx(visits, settings) {
    const S = reviewSettings(settings);
    const agg = new Map();
    let rxTotal = 0, rxWithGrams = 0;
    for (const v of visits) for (const p of v.prescriptions) {
      rxTotal++;
      const gpd = p.gpd !== null && p.gpd !== undefined ? p.gpd : (S.fallbackGpd || null);
      const days = p.days || S.rxDays || null;
      let anyGrams = false;
      for (const it of p.items) {
        const key = it.id || `name:${it.name}`;
        const a = agg.get(key) || { key, id: it.id, kind: it.kind, name: it.name, rxCount: 0, patients: new Set(), grams: 0, gramRx: 0, noDose: 0, noDays: 0, fromAssumption: 0 };
        a.rxCount++;
        a.patients.add(v.patientKey);
        if (it.share === null || gpd === null || p.unitsUnknown) a.noDose++;
        else if (days === null) a.noDays++;
        else {
          a.grams += gpd * it.share * days;
          a.gramRx++;
          anyGrams = true;
          if (p.gpd === null || !p.days) a.fromAssumption++;
        }
        agg.set(key, a);
      }
      if (anyGrams) rxWithGrams++;
    }
    const yearFactor = 365 / S.periodDays;
    const rows = [...agg.values()].map((a) => {
      const grams = a.gramRx ? round1(a.grams) : null;
      const bottles = grams === null ? null : grams / S.bottleG;
      return {
        key: a.key, id: a.id, kind: a.kind, name: a.name, rxCount: a.rxCount, patients: a.patients.size,
        grams, gramRx: a.gramRx, noDose: a.noDose, noDays: a.noDays, fromAssumption: a.fromAssumption,
        bottles: bottles === null ? null : round1(bottles), bottlesToBuy: bottles === null ? null : Math.ceil(bottles - 1e-9),
        bottlesPerYear: bottles === null ? null : Math.ceil(bottles * yearFactor - 1e-9),
        // 科中開封後 24 個月:兩年用不到一罐 → 開了會過期,考慮小包裝或不備
        slowForBottle: grams !== null && grams * (730 / S.periodDays) < S.bottleG,
      };
    }).sort((x, y) => y.rxCount - x.rxCount || (y.grams || 0) - (x.grams || 0) || x.name.localeCompare(y.name));
    return { rows, rxTotal, rxWithGrams, settings: S };
  }

  // ── 藥櫃線:這半年實際用量 → 下半年再買幾罐(扣掉現在可用的)──
  function inventoryPlan(H, inv, today, settings) {
    const S = reviewSettings(settings);
    if (!H || !inv) return [];
    return arr(inv.products).filter((p) => !p.archived).map((p) => {
      const used = round1(H.usageG(inv, p.id, S.periodDays, today));
      const usable = H.stats(inv, p, today).usable;
      const pkg = Number(p.packageG) > 0 ? Number(p.packageG) : S.bottleG;
      const shortG = Math.max(0, used - usable);
      return { id: p.id, name: p.nameZh, nameEn: p.nameEn, brand: p.brand, form: p.form, knowledgeId: p.knowledgeId, kind: p.kind, frequent: !!p.frequent,
        used, usable: round1(usable), packageG: pkg, bottlesUsed: round1(used / pkg), bottlesToBuy: Math.ceil(shortG / pkg - 1e-9) };
    }).filter((r) => r.used > 0 || r.frequent).sort((a, b) => b.used - a.used || a.name.localeCompare(b.name));
  }

  // ── 藥名 → 知識庫 id(畫面與測試共用同一支)──
  // 退役卡(review_status deprecated)不收:否則開方會被算到一張已經不存在的卡上(全線通病,見 dangling-scan 記憶)。
  // 同名時:名字以 湯/散/丸/飲/膏/丹/方 結尾算方劑,其餘算單味藥。
  const FORMULA_SUFFIX = /(湯|散|丸|飲|膏|丹|方|湯加減)$/;
  const SYNONYMS = { "麥冬": "麥門冬", "天冬": "天門冬" };
  function buildResolver(K) {
    const zh = new Map(), lat = new Map();
    const put = (map, key, kind, id, name) => {
      if (!key) return;
      const prev = map.get(key);
      if (!prev || (prev.kind !== kind && (kind === "formula") === FORMULA_SUFFIX.test(name))) map.set(key, { kind, id, name });
    };
    const latinKey = (s) => str(s).toLowerCase().replace(/[^a-z]+/g, " ").trim();
    for (const [kind, coll] of [["formula", "formulas"], ["herb", "herbs"]]) {
      for (const r of arr(((K || {})[coll] || {}).records)) {
        if (!r || !r.id || r.review_status === "deprecated") continue;
        const nameZh = str(r.name_zh).trim();
        put(zh, nameZh, kind, r.id, nameZh);
        arr(r.aliases_zh).forEach((a) => put(zh, str(a).trim(), kind, r.id, nameZh));
        [r.pinyin, r.name_en, ...arr(r.aliases_en)].forEach((s) => put(lat, latinKey(s), kind, r.id, nameZh));
      }
    }
    // 通用簡稱 → 卡片正名(只收沒有歧義的;「芍藥」分不出白芍赤芍、「膽南星」是天南星的另一個炮製品,都不收)
    for (const [short, full] of Object.entries(SYNONYMS)) if (!zh.has(short) && zh.has(full)) zh.set(short, zh.get(full));
    const resolve = (name) => zh.get(str(name).trim()) || lat.get(latinKey(name)) || null;
    resolve.nameOf = (kind, id) => {
      const r = arr(((K || {})[kind === "formula" ? "formulas" : "herbs"] || {}).records).find((x) => x && x.id === id);
      return r ? str(r.name_zh) : "";
    };
    resolve.size = zh.size + lat.size;
    return resolve;
  }

  const api = { DEFAULTS, reviewSettings, reminderState, parseRxText, collectVisits, caseMix, summarizeRx, inventoryPlan, buildResolver, addDays, daysBetween, isISODate, AGE_BANDS };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.AcuTingRxProfile = api;
})(typeof window !== "undefined" ? window : globalThis);
