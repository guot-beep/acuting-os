#!/usr/bin/env node
/**
 * validate-herb-dosage-shape.js — 擋住「劑量暗欄位被接上畫面」
 *
 * 背景(2026-08-12 紅線 4 與 2026-08-14 SOL 第三號查源任務):
 *
 * 中藥卡有兩個劑量欄位,長得很像,意思完全不同:
 *
 *   record.dosage_g.standard_daily_g  —— **畫面讀這個**。165/358 有值,其餘顯示「待補」。
 *   record.dosage                     —— **完全不上畫面**。299 張有內容,一張都沒渲染過。
 *
 * `dosage` 不接線是刻意的,不是遺漏。它混了「食療用量範圍」,而且形狀不統一:
 * 物件、內含 JSON 的字串、純字串、null 四種都有。誰把它接上去,就會同時放出
 * 兩顆地雷:
 *
 *   1. 食療上限高於藥用上限的卡(本檔實測 80 張)。最極端的是大黃:
 *      藥用≤9g,食療≤30g。畫面若盲撈,顯示的是更危險的那個數字。
 *   2. 給法自相矛盾的卡(實測 4 張:芒硝、阿膠、鹿角膠、鹿茸)——
 *      卡片他處寫明烊化/沖服/不入湯劑,dosage 卻寫入湯劑並給克級數字。
 *
 * 蘇合香(SOL 標的 SAFETY_HOLD)**不在上面第 2 類**:它的卡片從頭到尾
 * 沒說自己不入湯劑,所以規則推導不到它 —— 它是「卡片沒寫、但外部查證者判定可疑」。
 * 那種只能具名列管(D5),不能靠規則長出來;靠模型知識補「哪些藥不該入湯劑」就是編造。
 * 它現在沒事,純粹因為 dosage_g 是 null、畫面顯示「待補」。
 *
 * 這支的作用是把「沒人接線」這個口頭約定變成機器守則:
 * D1 守住 renderer 不讀 record.dosage;D1 一旦被放寬,D3/D4/D5 立刻從
 * 提示升級為封鎖 —— 也就是說,要接線可以,但得先把那 80 張、4 張與列管卡處理掉。
 *
 * 這支**不驗證劑量數字對不對**。2025 年版藥典正文拿不到之前,沒有人(包括
 * 這支程式)有資格判定哪個數字是對的。它只保證:沒查證過的數字不會自己跑到畫面上。
 *
 * 2026-11-12 更新(Ting:「補,用之前的規則」):145 張卡顯示「待補」而資料裡有帶出處的藥用範圍。
 * 接線改成**只有一條路**:js/herb-dose.js 的 displayDose(純函式)。js/knowledge.js 仍然不准直接讀
 * record.dosage / record.dosage_normalized(D1 照舊擋);而 displayDose 會顯示什麼,由 D6 對**每一張卡**實跑:
 * 食療數字永遠不出現、D3/D4/D5 的卡逐張確認沒有被放出來、有毒藥不靠單一來源自動顯示、顯示的字就是資料裡的原文。
 * 這仍然不是查證 —— 畫面上寫的是「單一來源的參考範圍,未經藥典核對」。
 *
 * 用法:
 *   node scripts/validate-herb-dosage-shape.js
 *   node scripts/validate-herb-dosage-shape.js --self-test   # 負控:確認每條檢查真的會失敗
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HERBS = path.join(ROOT, "data/herbs/herb_canon_shortlist.json");
const KNOWLEDGE = path.join(ROOT, "js/knowledge.js");
const HERB_DOSE = path.join(ROOT, "js/herb-dose.js");
const INDEX_HTML = path.join(ROOT, "index.html");

/* 基線。只准降,不准升 —— 與 check-validation-ratchet 同一個規矩。 */
const BASELINE = {
  json_string_shape: 176, // 內含 JSON 的字串:最糟的形狀,序列化物件假裝成文字
  dietary_over_medicinal: 80,
  self_contradictory: 4,
};

const fail = [];
const note = [];

/* ---------- 共用 ---------- */

function stripComments(src) {
  // 先拿掉 /* */ 與 // 行,否則註解裡提到 record.dosage 會被誤判成接線
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
}

function asObject(v) {
  if (v == null) return null;
  if (typeof v === "object") return v;
  if (typeof v === "string") {
    const t = v.trim();
    if (/^[{[]/.test(t)) { try { return JSON.parse(t); } catch (e) { return { __unparseable: t }; } }
    return { __plain: t };
  }
  return { __other: String(v) };
}

function shapeOf(raw) {
  if (raw == null) return "null";
  if (typeof raw === "object") return "object";
  // 型別要先擋。原本這裡直接丟進 regex,數字會被強制轉成字串、判成 plain-string,
  // D2 就永遠抓不到新的純量型別 —— 負控把這個空洞抓出來了。
  if (typeof raw !== "string") return "非字串純量(" + typeof raw + ")";
  if (/^\s*[{[]/.test(raw)) return "json-string";
  return "plain-string";
}

function upperBound(s) {
  if (!s) return null;
  const nums = String(s).match(/\d+(?:\.\d+)?/g);
  if (!nums) return null;
  return Math.max(...nums.map(Number));
}

/* ---------- D1:renderer 不准讀 record.dosage ---------- */

function checkRenderGuard(knowledgeSrc) {
  const src = stripComments(knowledgeSrc);

  // 錨點必須找得到。找不到就是被改名/移走了,這時候必須 FAIL,不能默默通過。
  const anchor = src.indexOf('detailSection("常用劑量"');
  if (anchor < 0) {
    fail.push('D1 錨點消失:js/knowledge.js 找不到 detailSection("常用劑量" —— '
      + "劑量區塊被改名或移除了。這支測試必須跟著更新,不允許空跑通過。");
    return false;
  }

  // 劑量區塊只准兩種來源:既有的 dose.standard_daily_g,或 js/herb-dose.js 的 displayDose(經 herbDoseDisplay)。
  const window = src.slice(anchor, anchor + 1400);
  if (!/dose\.standard_daily_g/.test(window)) {
    fail.push("D1 劑量區塊不再讀 dose.standard_daily_g —— 換成了別的來源,請確認不是 record.dosage。");
  }
  if (/herbDoseDisplay\(/.test(src) && !/window\.AcuTingHerbDose/.test(src)) {
    fail.push("D1 herbDoseDisplay 不是走 window.AcuTingHerbDose.displayDose —— 劑量顯示規則只准在 js/herb-dose.js。");
  }

  /* 全檔掃:record.dosage 後面沒有 _g,就是把暗欄位接上來了。
   *
   * dosage_normalized(2026-08-15,SOL 任務四的整形結果)**同樣要擋**。
   * 它是同一批數字換個形狀 —— 食療與藥用分欄了,但那 80 張的落差還在,
   * 蘇合香也還在。形狀統一不等於內容查證過。
   * 少擋這一個,前面整套耦合就等於開了後門。 */
  const wired = [...src.matchAll(/record\.dosage(?!_g\b)/g)]
    .filter((m) => !/^record\.dosage_normalized_render_is_allowed/.test(m[0]));
  if (wired.length) {
    const which = [...new Set(wired.map((m) => m[0]))].join("、");
    fail.push(`D1 未查證的劑量欄位被接上 renderer(${wired.length} 處:${which})。`
      + "dosage 與 dosage_normalized 都在此列 —— 後者只是同一批數字換了形狀,"
      + "食療與藥用分欄了,但 D3 的 80 張落差與 D5 的蘇合香都還在。"
      + "接線前必須先清掉它們。理由見本檔開頭與 docs/TING_DECISION_QUEUE.md C5c。");
    return false;
  }
  return true;
}

/* ---------- D2:形狀不准更亂 ---------- */

function checkShapes(recs) {
  const tally = {};
  for (const r of recs) { const s = shapeOf(r.dosage); tally[s] = (tally[s] || 0) + 1; }

  const known = new Set(["null", "object", "json-string", "plain-string"]);
  for (const k of Object.keys(tally)) {
    if (!known.has(k)) fail.push(`D2 出現沒見過的 dosage 形狀「${k}」(${tally[k]} 筆)。`);
  }
  const js = tally["json-string"] || 0;
  if (js > BASELINE.json_string_shape) {
    fail.push(`D2 內含 JSON 的字串從 ${BASELINE.json_string_shape} 增加到 ${js}。`
      + "這是最糟的形狀 —— 序列化物件假裝成文字。要改請往物件收斂,不要再往字串塞。");
  }
  return tally;
}

/* ---------- D3:食療上限 > 藥用上限 ---------- */

function findDietaryConflicts(recs) {
  const out = [];
  for (const r of recs) {
    const o = asObject(r.dosage);
    if (!o || o.__unparseable) continue;
    let dietary = null, medicinal = null;
    for (const [k, v] of Object.entries(o)) {
      if (typeof v !== "string") continue;
      if (/食療/.test(k)) dietary = Math.max(dietary || 0, upperBound(v) || 0);
      else if (/一般建議|decoction|standard|常用|建議/i.test(k)) medicinal = Math.max(medicinal || 0, upperBound(v) || 0);
      if (/食療/.test(v)) {
        const u = upperBound(String(v).split(/食療/)[1]);
        if (u) dietary = Math.max(dietary || 0, u);
      }
    }
    if (dietary && medicinal && dietary > medicinal) out.push({ id: r.id, name: r.name_zh, medicinal, dietary });
  }
  return out;
}

/* ---------- D4:自身矛盾(蘇合香那一類) ---------- */

function findSelfContradictory(recs) {
  const out = [];
  for (const r of recs) {
    const o = asObject(r.dosage);
    if (!o || o.__unparseable) continue;
    const text = Object.values(o).filter((v) => typeof v === "string").join(" ");
    if (!text) continue;

    // 卡片自身別處說「只入丸散/不入湯劑」,dosage 卻寫入湯劑並給克級數字
    const whole = JSON.stringify(r);
    const pillOnly = /不入湯劑|只入丸散|入丸散用|不可煎/.test(whole);
    const saysDecoction = /入湯劑|煎湯|常規煎煮/.test(text);
    const gramLevel = (upperBound(text) || 0) >= 3;
    if (pillOnly && saysDecoction && gramLevel) {
      out.push({ id: r.id, name: r.name_zh, upper: upperBound(text) });
    }
  }
  return out;
}

/* ---------- D5:具名 SAFETY_HOLD 清單 ----------
 *
 * D4 靠的是卡片自己說「不入湯劑」。蘇合香不說,所以 D4 抓不到它 ——
 * 而它正是這支 gate 的起因。差別在於:芒硝/阿膠那類卡自己寫了給法,
 * 蘇合香是**卡片沒寫、但外部查證者判定可疑**。
 *
 * 這種只能具名列管,不能靠規則推導 —— 靠模型知識補「哪些藥不該入湯劑」
 * 就是編造。所以這裡只收**有出處的**裁定,每一筆都要寫清楚誰判的、依據什麼。
 */
const SAFETY_HOLD = [
  {
    id: "herb.su_he_xiang",
    name: "蘇合香",
    reason: "芳香開竅藥,dosage 寫「9-15克、入湯劑常規煎煮」,量級與給法都可疑",
    source: "SOL 第三號查源任務 2026-08-14(docs/research_packs/sol_deliveries/HERB_DOSAGE_VERIFICATION_2025_SOL.md)",
    status: "待 2025 藥典正文裁定;在此之前不得上畫面、不得沿用",
  },
];

function checkSafetyHold(recs, guardIntact) {
  const byId = new Map(recs.map((r) => [r.id, r]));
  for (const h of SAFETY_HOLD) {
    const r = byId.get(h.id);
    if (!r) {
      fail.push(`D5 ${h.id}(${h.name})在 SAFETY_HOLD 清單上卻找不到這筆記錄 —— `
        + "被改名或刪掉了。列管中的卡不能無聲消失,請更新清單。");
      continue;
    }
    // 列管期間,這張卡的劑量不准出現在畫面讀的那個欄位裡
    const shown = (r.dosage_g || {}).standard_daily_g;
    if (shown != null && String(shown).trim() !== "") {
      fail.push(`D5 ${h.id}(${h.name})仍在 SAFETY_HOLD,但 dosage_g.standard_daily_g 已有值「${shown}」`
        + ` —— 那會直接上畫面。理由:${h.reason};出處:${h.source}`);
    }
    if (!guardIntact) {
      fail.push(`D5 ${h.id}(${h.name})仍在 SAFETY_HOLD,而 record.dosage 已被接上畫面。`);
    }
  }
  if (guardIntact) note.push(`D5 具名 SAFETY_HOLD 列管中:${SAFETY_HOLD.length} 張(均未上畫面;D6 逐張確認)`);
}

/* ---------- D6:displayDose 對每一張卡實際會顯示什麼 ----------
 *
 * D1 是字串檢查,守的是「knowledge.js 不直接讀暗欄位」。D6 守的是行為:把真的模組 require 進來,
 * 對全部記錄跑一次,逐張確認它沒有把不該出現的數字放上畫面。
 */
function loadDoseModule() {
  delete require.cache[require.resolve(HERB_DOSE)];
  return require(HERB_DOSE);
}
function checkDisplay(recs, D, dietary, contradictory) {
  const stats = { curated: 0, reference: 0, held: 0, none: 0 };
  const dietaryIds = new Set(dietary.map((c) => c.id));
  const contraIds = new Set(contradictory.map((c) => c.id));
  const holdIds = new Set(SAFETY_HOLD.map((h) => h.id));
  for (const id of holdIds) if (!D.SAFETY_HOLD_IDS.includes(id)) fail.push(`D6 ${id} 在閘門的 SAFETY_HOLD 清單上,但 js/herb-dose.js 的 SAFETY_HOLD_IDS 沒有它。`);
  for (const id of D.SAFETY_HOLD_IDS) if (!holdIds.has(id)) fail.push(`D6 js/herb-dose.js 列管了 ${id},但閘門的 SAFETY_HOLD 沒有 —— 兩邊要同一份。`);
  for (const r of recs) {
    let d;
    try { d = D.displayDose(r); } catch (e) { fail.push(`D6 ${r.id} displayDose 拋錯:${e.message}`); continue; }
    stats[d.kind] = (stats[d.kind] || 0) + 1;
    const curated = String(((r.dosage_g || {}).standard_daily_g) || "").trim();
    if (curated) {
      if (d.kind !== "curated" || d.text !== curated) fail.push(`D6 ${r.id}(${r.name_zh})已有整理過的劑量「${curated}」,displayDose 卻顯示別的(${d.kind}:${d.text})。`);
      continue;
    }
    if (d.kind !== "reference") {
      if (d.text) fail.push(`D6 ${r.id}(${r.name_zh})kind=${d.kind} 卻帶著要顯示的字「${d.text}」。`);
      continue;
    }
    // 以下:這張卡會新顯示一個數字。逐條確認它有資格。
    const dn = r.dosage_normalized || {};
    const med = Array.isArray(dn.medicinal) ? dn.medicinal : [];
    const diet = Array.isArray(dn.dietary) ? dn.dietary : [];
    const where = `D6 ${r.id}(${r.name_zh})顯示「${d.text}」`;
    if (holdIds.has(r.id)) fail.push(`${where},但它在 SAFETY_HOLD。`);
    if (contraIds.has(r.id) || (dn.flags || {}).route_contradiction) fail.push(`${where},但它是 D4 給法矛盾的卡。`);
    if ((dn.flags || {}).magnitude_suspicious) fail.push(`${where},但它被標量級可疑。`);
    if (med.length !== 1 || d.text !== String(med[0].verbatim).trim()) fail.push(`${where},不是「唯一一筆藥用範圍的原文」。`);
    // 食療那一筆的原文不准出現 —— 除非它跟藥用那一筆逐字相同(龍膽草、吳茱萸:兩欄都寫「3-6克」/「1-3克」,
    // 顯示的確實是藥用那一筆;全庫實跑時這條第一版把龍膽草誤判成食療)。
    const isMedicinalText = med.length === 1 && d.text === String(med[0].verbatim).trim();
    if (/食療/.test(d.text) || (!isMedicinalText && diet.some((x) => String(x.verbatim).trim() === d.text))) fail.push(`${where},那是食療用量。`);
    if (dietaryIds.has(r.id) && med[0] && upperBound(d.text) > Math.max(med[0].high_g, upperBound(med[0].verbatim) || 0)) fail.push(`${where},數字超過這張卡的藥用上限(D3 食療超量卡)。`);
    if (!d.source) fail.push(`${where},沒有出處。`);
    if (/待[^。;;]{0,12}(核對|確認|查證)|⚠/.test(String(med[0] && med[0].attributed_to))) fail.push(`${where},但出處寫明待核對。`);
    if (D.saysToxic(r)) fail.push(`${where},但卡片自己寫著有毒。`);
    const flags = (r.safety_flags || []).filter((f) => typeof f === "string" && /toxic|dose_preparation_review|not_for_self_treatment|heavy_metal|prohibited|safety_review_pending|aristolochic/i.test(f));
    if (flags.length) fail.push(`${where},但它帶著 ${flags.join("、")}。`);
  }
  return stats;
}
// 模組被載入頁面了嗎(沒載到的話 knowledge.js 會退回舊行為,畫面不會壞,但這次的修正就等於沒上)
function checkWiring() {
  const html = fs.readFileSync(INDEX_HTML, "utf8");
  const a = html.indexOf('src="js/herb-dose.js"'), b = html.indexOf('src="js/knowledge.js"');
  if (a < 0) fail.push("D6 index.html 沒有載入 js/herb-dose.js。");
  else if (b >= 0 && a > b) fail.push("D6 js/herb-dose.js 排在 js/knowledge.js 後面 —— 畫中藥卡時模組還沒在。");
}

/* ---------- 主流程 ---------- */

function run(opts) {
  const herbs = JSON.parse(fs.readFileSync(HERBS, "utf8"));
  const recs = herbs.records;
  const knowledgeSrc = opts.knowledgeSrc != null ? opts.knowledgeSrc : fs.readFileSync(KNOWLEDGE, "utf8");

  const guardIntact = checkRenderGuard(knowledgeSrc);
  const tally = checkShapes(recs);
  const dietary = findDietaryConflicts(recs);
  const contradictory = findSelfContradictory(recs);
  checkSafetyHold(recs, guardIntact);
  const display = checkDisplay(recs, opts.doseModule || loadDoseModule(), dietary, contradictory);
  if (!opts.doseModule) checkWiring();

  // 耦合:暗欄位沒接線時這兩類只是提示;一旦接線,立刻變成逐張封鎖。
  if (!guardIntact) {
    for (const c of dietary) {
      fail.push(`D3 ${c.id}(${c.name}) 食療上限 ${c.dietary}g > 藥用上限 ${c.medicinal}g,而 dosage 已被接上畫面。`);
    }
    for (const c of contradictory) {
      fail.push(`D4 ${c.id}(${c.name}) 卡片他處寫明只入丸散/不入湯劑,dosage 卻寫入湯劑且達 ${c.upper}g,而 dosage 已被接上畫面。`);
    }
  } else {
    note.push(`D3 食療上限 > 藥用上限:${dietary.length} 張(食療數字不上畫面,D6 逐張確認)`);
    note.push(`D4 自身矛盾(丸散 vs 湯劑):${contradictory.length} 張(不顯示,D6 逐張確認)`);
    note.push(`D6 卡上的劑量:已整理 ${display.curated}、單一來源參考範圍 ${display.reference}、有數字但扣住 ${display.held}、沒有資料 ${display.none}`);
  }

  if (dietary.length > BASELINE.dietary_over_medicinal) {
    fail.push(`D3 食療超量卡從 ${BASELINE.dietary_over_medicinal} 增加到 ${dietary.length} —— 只准降不准升。`);
  }
  if (BASELINE.self_contradictory != null && contradictory.length > BASELINE.self_contradictory) {
    fail.push(`D4 矛盾卡從 ${BASELINE.self_contradictory} 增加到 ${contradictory.length} —— 只准降不准升。`);
  }

  return { tally, dietary, contradictory, guardIntact, display };
}

/* ---------- 負控:每條檢查都必須能失敗 ---------- */

function selfTest() {
  const cases = [
    {
      name: "D1 接線會被抓到",
      run: () => {
        fail.length = 0; note.length = 0;
        checkRenderGuard('detailSection("常用劑量", "x", `${esc(record.dosage)}` + dose.standard_daily_g)');
        return fail.some((f) => f.startsWith("D1 未查證的劑量欄位被接上"));
      },
    },
    {
      name: "D1 連 dosage_normalized 也擋(不是只擋 dosage)",
      run: () => {
        fail.length = 0; note.length = 0;
        checkRenderGuard('detailSection("常用劑量", "x", `${esc(record.dosage_normalized.medicinal[0].verbatim)}` + dose.standard_daily_g)');
        return fail.some((f) => f.startsWith("D1 未查證的劑量欄位被接上"));
      },
    },
    {
      name: "D1 讀 dosage_g 是允許的(不誤擋正常路徑)",
      run: () => {
        fail.length = 0; note.length = 0;
        checkRenderGuard('detailSection("常用劑量", "x", `${esc(record.dosage_g.standard_daily_g)}` + dose.standard_daily_g)');
        return !fail.some((f) => f.startsWith("D1 未查證的劑量欄位被接上"));
      },
    },
    {
      name: "D1 錨點消失會被抓到(不允許空跑通過)",
      run: () => {
        fail.length = 0; note.length = 0;
        checkRenderGuard("const x = 1; // 劑量區塊被整個拿掉了");
        return fail.some((f) => f.startsWith("D1 錨點消失"));
      },
    },
    {
      name: "D2 新形狀會被抓到",
      run: () => {
        fail.length = 0; note.length = 0;
        checkShapes([{ id: "x", dosage: 12345 }]);
        return fail.some((f) => f.startsWith("D2 出現沒見過的"));
      },
    },
    {
      name: "D3 食療超量抓得到",
      run: () => findDietaryConflicts([
        { id: "herb.fixture", name_zh: "測試", dosage: { 一般建議: "3-9克", 食療用量範圍: "10-30克" } },
      ]).length === 1,
    },
    {
      name: "D3 食療未超量不誤報",
      run: () => findDietaryConflicts([
        { id: "herb.fixture", name_zh: "測試", dosage: { 一般建議: "3-30克", 食療用量範圍: "5-10克" } },
      ]).length === 0,
    },
    {
      name: "D4 丸散/湯劑矛盾抓得到",
      run: () => findSelfContradictory([
        { id: "herb.fixture", name_zh: "測試", note: "只入丸散,不入湯劑",
          dosage: { 一般建議: "9-15克", 特殊說明: "入湯劑常規煎煮" } },
      ]).length === 1,
    },
    {
      name: "D4 一般湯劑藥不誤報",
      run: () => findSelfContradictory([
        { id: "herb.fixture", name_zh: "測試", dosage: { 一般建議: "9-15克", 特殊說明: "入湯劑常規煎煮" } },
      ]).length === 0,
    },
    {
      name: "D5 列管卡若有可顯示劑量會被抓到",
      run: () => {
        fail.length = 0; note.length = 0;
        checkSafetyHold([{ id: "herb.su_he_xiang", name_zh: "蘇合香", dosage_g: { standard_daily_g: "9-15g" } }], true);
        return fail.some((f) => f.startsWith("D5 herb.su_he_xiang"));
      },
    },
    {
      name: "D5 列管卡消失會被抓到",
      run: () => {
        fail.length = 0; note.length = 0;
        checkSafetyHold([], true);
        return fail.some((f) => /找不到這筆記錄/.test(f));
      },
    },
    ...(() => {
      const D = loadDoseModule();
      const good = () => ({ id: "herb.fixture", name_zh: "測試", safety_flags: ["pregnancy_review"], properties_taste_temp: "辛、溫",
        dosage_normalized: { no_new_numbers: true, flags: { dietary_exceeds_medicinal: true, route_contradiction: false, magnitude_suspicious: false, unattributed_numbers: false },
          medicinal: [{ route: "unclear", low_g: 3, high_g: 9, verbatim: "3-9克", attributed_to: "https://cloudtcm.com/herb/1" }],
          dietary: [{ low_g: 10, high_g: 30, verbatim: "10-30克", attributed_to: "https://cloudtcm.com/herb/1" }] } });
      const kind = (mut) => { const r = good(); mut(r); return D.displayDose(r).kind; };
      const heldWhen = (name, mut) => ({ name: "D6 " + name + " → 不顯示", run: () => kind(mut) === "held" });
      // 「壞掉的模組」:把不該顯示的東西顯示出來,閘門必須抓到
      const caught = (name, fake, rec, re) => ({ name: "D6 閘門抓得到:" + name, run: () => {
        fail.length = 0; note.length = 0;
        const r = rec || good();
        checkDisplay([r], Object.assign({}, D, { displayDose: fake }), findDietaryConflicts([r]), findSelfContradictory([r]));
        return fail.some((f) => re.test(f));
      } });
      const ref = (text, o) => () => Object.assign({ kind: "reference", text, source: "CloudTCM", sourceUrl: "", reason: "" }, o || {});
      const toxic = good(); toxic.properties_taste_temp = "辛、溫、有毒";
      const flagged = good(); flagged.safety_flags = ["toxicity_review"];
      const curated = good(); curated.dosage_g = { standard_daily_g: "3–9g(課件)" };
      return [
        { name: "D6 乾淨的單一來源藥用範圍 → 顯示原文與出處(不誤擋)", run: () => { const d = D.displayDose(good()); return d.kind === "reference" && d.text === "3-9克" && d.source === "CloudTCM"; } },
        { name: "D6 食療上限較高的卡:顯示的是藥用 3-9克,不是食療 10-30克", run: () => !/10|30/.test(D.displayDose(good()).text) },
        { name: "D6 已整理的劑量優先,不被參考範圍蓋掉", run: () => { const d = D.displayDose(curated); return d.kind === "curated" && d.text === "3–9g(課件)"; } },
        { name: "D6 「無毒」不算有毒(不誤擋)", run: () => kind((r) => { r.properties_taste_temp = "甘、平、無毒"; }) === "reference" },
        heldWhen("卡片寫有毒", (r) => { r.properties_taste_temp = "辛、溫、有小毒"; }),
        heldWhen("safety_info 寫有毒", (r) => { r.safety_info = { toxicity_zh: "有毒" }; }),
        heldWhen("toxicity_review 旗標", (r) => { r.safety_flags = ["toxicity_review"]; }),
        heldWhen("dose_preparation_review 旗標", (r) => { r.safety_flags = ["dose_preparation_review"]; }),
        heldWhen("not_for_self_treatment 旗標", (r) => { r.safety_flags = ["not_for_self_treatment"]; }),
        heldWhen("安全審查未完", (r) => { r.safety_review_pending = true; }),
        heldWhen("給法矛盾", (r) => { r.dosage_normalized.flags.route_contradiction = true; }),
        heldWhen("量級可疑", (r) => { r.dosage_normalized.flags.magnitude_suspicious = true; }),
        heldWhen("數字沒有出處(旗標)", (r) => { r.dosage_normalized.flags.unattributed_numbers = true; }),
        heldWhen("數字沒有出處(空字串)", (r) => { r.dosage_normalized.medicinal[0].attributed_to = ""; }),
        heldWhen("出處寫明待核對", (r) => { r.dosage_normalized.medicinal[0].attributed_to = "藥典。⚠️ 數字待 Ting 以手邊藥典核對後升級。"; }),
        heldWhen("藥用範圍兩筆", (r) => { r.dosage_normalized.medicinal.push({ route: "powder", low_g: 1, high_g: 3, verbatim: "研末 1-3g", attributed_to: "x" }); }),
        heldWhen("只有食療、沒有藥用", (r) => { r.dosage_normalized.medicinal = []; }),
        heldWhen("原文與整形後數字對不上", (r) => { r.dosage_normalized.medicinal[0].high_g = 12; }),
        heldWhen("原文混有食療", (r) => { r.dosage_normalized.medicinal[0].verbatim = "3-9克(食療)"; }),
        heldWhen("沒有聲明未新增數字", (r) => { r.dosage_normalized.no_new_numbers = false; }),
        heldWhen("具名列管", (r) => { r.id = "herb.su_he_xiang"; }),
        heldWhen("沒有旗標物件", (r) => { delete r.dosage_normalized.flags; }),
        caught("顯示了食療用量", ref("10-30克"), null, /那是食療用量|不是「唯一一筆藥用範圍的原文」/),
        caught("顯示了不是原文的數字", ref("6-15g"), null, /不是「唯一一筆藥用範圍的原文」/),
        caught("有毒藥被顯示", ref("3-9克"), toxic, /卡片自己寫著有毒/),
        caught("帶毒性旗標的藥被顯示", ref("3-9克"), flagged, /帶著 toxicity_review/),
        caught("沒有出處就顯示", ref("3-9克", { source: "" }), null, /沒有出處/),
        caught("已整理的劑量被換掉", ref("3-9克"), curated, /已有整理過的劑量/),
        caught("列管卡被顯示", ref("3-9克"), Object.assign(good(), { id: "herb.su_he_xiang" }), /SAFETY_HOLD/),
        caught("模組少了列管名單", () => ({ kind: "none", text: "" }), null, /SAFETY_HOLD_IDS 沒有它/, true),
      ].map((c, i, all) => (i === all.length - 1 ? { name: c.name, run: () => { fail.length = 0; checkDisplay([], Object.assign({}, D, { SAFETY_HOLD_IDS: [] }), [], []); return fail.some((f) => /SAFETY_HOLD_IDS 沒有它/.test(f)); } } : c));
    })(),
  ];

  let bad = 0;
  for (const c of cases) {
    let ok = false;
    try { ok = c.run() === true; } catch (e) { ok = false; }
    console.log(`  ${ok ? "ok  " : "FAIL"}  ${c.name}`);
    if (!ok) bad++;
  }
  fail.length = 0; note.length = 0;
  console.log(bad ? `\n負控失敗 ${bad} 項 —— 這支測試守不住東西。` : "\n負控全過:每條檢查都證明過自己會失敗。");
  return bad === 0;
}

/* ---------- entry ---------- */

if (require.main === module) {
  if (process.argv.includes("--self-test")) {
    process.exit(selfTest() ? 0 : 1);
  }
  const res = run({});
  console.log("dosage 形狀分布:", JSON.stringify(res.tally));
  console.log(`js/knowledge.js 沒有直接讀劑量暗欄位(只經 js/herb-dose.js): ${res.guardIntact ? "是" : "否"}`);
  for (const n of note) console.log("  NOTE  " + n);
  if (fail.length) {
    console.log("");
    for (const f of fail) console.log("  FAIL  " + f);
    console.log(`\nvalidate-herb-dosage-shape: FAIL —— ${fail.length} 項。`);
    process.exit(1);
  }
  console.log("\nvalidate-herb-dosage-shape: PASS —— no blocking defects.");
}

module.exports = { run, findDietaryConflicts, findSelfContradictory, checkRenderGuard, checkShapes, checkDisplay };
