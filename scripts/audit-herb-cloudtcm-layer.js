#!/usr/bin/env node
"use strict";

/**
 * audit-herb-cloudtcm-layer.js — 全層掃描 `source_type: sourced_cloudtcm_record`
 *
 * 這支是**一次性量測工具，不是 gate**：永遠 exit 0，不進 CI，不改 data/**。
 * 目的是把 HERB_EYESON_01 / 02 兩批眼讀（60/358）確認過的缺陷型態，
 * 一次跑遍 CloudTCM 原樣落地層的 247 張卡，讓 Ting 用全層數字而不是外推
 * 決定「逐卡修」還是「整層重新取源」。
 *
 * 六條判準（每一條的 predicate 都寫死在下面，數字可一行重現）：
 *   C1 錯藥內容   本卡藥名在散文欄出現次數 < 某個他藥藥名的次數（浙貝母：自身 0、川貝母 31）
 *   C2 來源 id    field_sources 引用與 cloudtcm_url 不同的 CloudTCM herb id；
 *                 以及同一個 CloudTCM id 被兩張卡同時宣稱
 *   C3 內部矛盾   properties_taste_temp 自相矛盾；散文宣稱的性/毒/歸經與本卡結構欄相反
 *   C4 劑量一致   兩套劑量欄互相矛盾；食療上限 > 入藥上限；散文裡的克數 > 本卡自己的上限
 *   C5 配伍安全   十八反/十九畏：方向反轉、同卡多關係詞、語意反轉（把毒性講成療效減弱）、
 *                 被點名但全庫無卡的對造藥；並統計「兩側都對得上」的配伍組數
 *   C6 佔位英文   渲染器 usableText 會濾掉的匯入佔位句（濾掉 = 該欄現在是空白）
 *
 * 用法：
 *   node scripts/audit-herb-cloudtcm-layer.js
 *   node scripts/audit-herb-cloudtcm-layer.js --detail          逐卡列出命中明細
 *   node scripts/audit-herb-cloudtcm-layer.js --json tmp/x.json 機器可讀輸出
 *   node scripts/audit-herb-cloudtcm-layer.js --all             不限 CloudTCM 層，掃全 358 筆
 */

const fs = require("fs");
const path = require("path");

// ── CLI ───────────────────────────────────────────────────────────────────
function argValue(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const WANT_DETAIL = process.argv.includes("--detail");
const SCAN_ALL = process.argv.includes("--all");
const JSON_OUT = argValue("--json", "");
const INPUT = argValue("--input", "data/herbs/herb_canon_shortlist.json");

const REPO = path.resolve(__dirname, "..");
const raw = JSON.parse(fs.readFileSync(path.join(REPO, INPUT), "utf8"));
const ALL = Array.isArray(raw) ? raw : raw.records;
const LAYER_SOURCE_TYPE = "sourced_cloudtcm_record";
const LAYER = SCAN_ALL ? ALL : ALL.filter((r) => r.source_type === LAYER_SOURCE_TYPE);

// ── 安全子集判準 ───────────────────────────────────────────────────────────
// 「safety_flags 標示毒性」＝ 帶下列任一硬毒性 slug。孕期/出血等 review flag 不算，
// 因為要回答的問題是「哪些命中發生在毒藥上」，不是「哪些卡有任何安全標記」。
const TOX_FLAG = /^(toxic|very_toxic|toxicity_review|heavy_metal_review)$/;
function isToxic(r) {
  return Array.isArray(r.safety_flags) && r.safety_flags.some((f) => TOX_FLAG.test(String(f)));
}

// ── 通用小工具 ─────────────────────────────────────────────────────────────
function asList(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}
function strings(v, out) {
  out = out || [];
  if (v == null) return out;
  if (typeof v === "string") { if (v.trim()) out.push(v); return out; }
  if (Array.isArray(v)) { for (const x of v) strings(x, out); return out; }
  if (typeof v === "object") { for (const k of Object.keys(v)) strings(v[k], out); return out; }
  return out;
}
/** 走訪整筆記錄的所有字串葉節點，回傳 [欄位路徑, 字串]。 */
function walkStrings(v, prefix, out) {
  out = out || [];
  prefix = prefix || "";
  if (typeof v === "string") { if (v.trim()) out.push([prefix, v]); return out; }
  if (Array.isArray(v)) { v.forEach((x, i) => walkStrings(x, `${prefix}[${i}]`, out)); return out; }
  if (v && typeof v === "object") { for (const k of Object.keys(v)) walkStrings(v[k], prefix ? `${prefix}.${k}` : k, out); return out; }
  return out;
}
function pct(n, d) { return d ? `${((n / d) * 100).toFixed(1)}%` : "—"; }
function clip(s, n) { const t = String(s).replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n) + "…" : t; }

// ── 藥名索引（長名優先，避免 川貝母 被切成 貝母） ─────────────────────────
const NAME_TO_ID = new Map();
for (const r of ALL) {
  for (const n of [r.name_zh].concat(asList(r.aliases_zh))) {
    const s = String(n || "").trim();
    if (s.length >= 2 && /[一-鿿]/.test(s) && !NAME_TO_ID.has(s)) NAME_TO_ID.set(s, r.id);
  }
}
/**
 * 配伍對造名詞彙表 —— 只用於「把 反X／畏X 後面那串字認出來是藥名」，
 * 不寫入任何資料。列的是十八反/十九畏的經典成員（含全庫查無卡者），
 * 因為 C5 要回答的正是「被點名的對造藥有沒有卡」。
 */
const PAIR_LEXICON = [
  "甘遂", "京大戟", "大戟", "芫花", "海藻", "甘草", "炙甘草",
  "烏頭", "川烏", "草烏", "附子", "半夏", "瓜蔞", "栝樓", "瓜蔞皮", "瓜蔞仁",
  "栝樓皮", "栝樓仁", "天花粉", "貝母", "川貝母", "浙貝母", "白蘞", "白及", "白芨",
  "藜蘆", "人參", "黨參", "沙參", "丹參", "玄參", "苦參", "細辛", "芍藥", "白芍", "赤芍",
  "西洋參", "硫黃", "朴硝", "芒硝", "水銀", "砒霜", "狼毒", "密陀僧",
  "巴豆", "牽牛子", "牽牛", "丁香", "鬱金", "犀角", "牙硝", "三棱", "三稜",
  "官桂", "肉桂", "赤石脂", "石脂", "五靈脂", "蕪荑", "菖蒲", "牡蒙", "海蛤", "文蛤",
];
const MATCH_NAMES = Array.from(new Set(Array.from(NAME_TO_ID.keys()).concat(PAIR_LEXICON)))
  .sort((a, b) => b.length - a.length);
const MAX_NAME_LEN = MATCH_NAMES.reduce((m, n) => Math.max(m, n.length), 0);
const MATCH_SET = new Set(MATCH_NAMES);

/** 從 pos 起，取最長可匹配的藥名（長名優先）。 */
function nameAt(text, pos) {
  for (let len = Math.min(MAX_NAME_LEN, text.length - pos); len >= 2; len--) {
    const cand = text.slice(pos, pos + len);
    if (MATCH_SET.has(cand)) return cand;
  }
  return null;
}
/** 全文逐字掃描，回傳 {藥名: 次數}（非重疊、長名優先）。 */
function countNames(text) {
  const counts = new Map();
  for (let i = 0; i < text.length; ) {
    const n = nameAt(text, i);
    if (n) { counts.set(n, (counts.get(n) || 0) + 1); i += n.length; }
    else i += 1;
  }
  return counts;
}

// ── 散文欄位（C1 / C3 / C4 共用的「本卡散文」定義） ────────────────────────
const PROSE_PATHS = [
  "clinical_use_note", "clinical_use_note_zh", "exam_pearl", "exam_importance",
  "cautions_zh", "contraindications_zh", "cautions", "indications_zh",
  "pao_zhi_notes_zh", "classical_text_zh", "modern_pharmacology_zh",
  "property_channel_source_note_zh", "review_notes_zh", "correction_note",
];
function proseOf(r) {
  const out = [];
  for (const k of PROSE_PATHS) for (const s of strings(r[k])) out.push([k, s]);
  for (const s of strings(r.chinese_depth_track && r.chinese_depth_track.summary_zh)) out.push(["chinese_depth_track.summary_zh", s]);
  for (const d of asList(r.modern_functions_detail_zh)) {
    if (d && typeof d === "object") for (const s of strings(d.analysis_zh)) out.push(["modern_functions_detail_zh[].analysis_zh", s]);
  }
  if (r.safety_info && typeof r.safety_info === "object") {
    for (const [p, s] of walkStrings(r.safety_info, "safety_info")) out.push([p, s]);
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// C1 — 錯藥內容
// ═══════════════════════════════════════════════════════════════════════════
// predicate：把本卡散文攤平後逐字掃藥名。ownCount = 本卡 name_zh + aliases_zh 的
// 出現次數總和；intruder = 其他藥名中出現最多的那一個。
//   Tier A（強）：ownCount === 0 且 intruder >= 3
//   Tier B（弱）：ownCount > 0、intruder > ownCount 且 intruder >= 3
// 門檻 3 是為了不把「鑑別筆記提到相似藥一兩次」算成錯藥內容（陳皮 vs 青皮）。
const C1 = [];
const recIndex = new Map(ALL.map((r) => [r.id, r]));
for (const r of LAYER) {
  const text = proseOf(r).map((x) => x[1]).join("\n");
  if (!text) continue;
  const counts = countNames(text);
  const ownNames = new Set([r.name_zh].concat(asList(r.aliases_zh)).map((s) => String(s || "").trim()).filter((s) => s.length >= 2));
  let own = 0;
  for (const n of ownNames) own += counts.get(n) || 0;
  let best = null;
  for (const [n, c] of counts) {
    if (ownNames.has(n)) continue;
    if (!best || c > best.count) best = { name: n, count: c, id: NAME_TO_ID.get(n) || null };
  }
  if (best && best.count >= 3 && best.count > own) {
    // 分類：入侵名解析到誰？
    //   no_card_variant  無卡（異體字：白及/白芨）
    //   same_drug_two_cards 另一張卡，但兩張卡的 name_en 或拉丁藥名相同 = 同一味藥兩張卡
    //   distinct_card    另一張卡，是不同的藥 = 真的錯藥內容
    const other = best.id ? recIndex.get(best.id) : null;
    let relation = "distinct_card";
    if (!best.id) relation = "no_card_variant";
    else if (other && ((other.name_en && r.name_en && String(other.name_en).toLowerCase() === String(r.name_en).toLowerCase())
      || (other.pharmaceutical_latin && r.pharmaceutical_latin && other.pharmaceutical_latin === r.pharmaceutical_latin)
      || other.id.replace("herb.", "").includes(r.id.replace("herb.", ""))
      || r.id.replace("herb.", "").includes(other.id.replace("herb.", "")))) relation = "same_drug_two_cards";
    const tier = own === 0 ? "A" : (best.count >= 2 * own ? "B" : "C");
    C1.push({ id: r.id, name_zh: r.name_zh, own, intruder: best.name, intruder_count: best.count, intruder_id: best.id, relation, tier, toxic: isToxic(r) });
  }
}
C1.sort((a, b) => (a.tier === b.tier ? b.intruder_count - a.intruder_count : a.tier < b.tier ? -1 : 1));

// ═══════════════════════════════════════════════════════════════════════════
// C2 — CloudTCM id 完整性
// ═══════════════════════════════════════════════════════════════════════════
const CLOUD_ID_RE = /cloudtcm\.com\/herb\/(\d+)/g;
function idsIn(v) {
  const out = new Set();
  for (const s of strings(v)) { let m; CLOUD_ID_RE.lastIndex = 0; while ((m = CLOUD_ID_RE.exec(s))) out.add(m[1]); }
  return out;
}
function primaryId(r) {
  const a = idsIn(r.cloudtcm_url);
  if (a.size) return Array.from(a)[0];
  const b = idsIn(r.exact_source_url);
  return b.size ? Array.from(b)[0] : null;
}
// C2a：field_sources 引用與本卡主 id 不同的 CloudTCM id
const C2a = [];
for (const r of LAYER) {
  const own = primaryId(r);
  if (!own) continue;
  const foreign = new Map(); // id -> [欄位]
  for (const k of Object.keys(r.field_sources || {})) {
    for (const fid of idsIn(r.field_sources[k])) if (fid !== own) {
      if (!foreign.has(fid)) foreign.set(fid, []);
      foreign.get(fid).push(k);
    }
  }
  if (foreign.size) C2a.push({ id: r.id, name_zh: r.name_zh, own_id: own, foreign: Array.from(foreign, ([fid, fields]) => ({ id: fid, fields })), toxic: isToxic(r) });
}
// C2a2：cloudtcm_url 與 exact_source_url 本身就分裂
const C2a2 = [];
for (const r of LAYER) {
  const a = Array.from(idsIn(r.cloudtcm_url))[0] || null;
  const b = Array.from(idsIn(r.exact_source_url))[0] || null;
  if (a && b && a !== b) C2a2.push({ id: r.id, name_zh: r.name_zh, cloudtcm_url_id: a, exact_source_url_id: b, toxic: isToxic(r) });
}
// C2b：同一個 CloudTCM id 被兩張以上的卡宣稱
const URL_FIELDS = ["cloudtcm_url", "exact_source_url", "source_urls", "safety_source_url", "modern_functions_source_url", "field_sources", "source_citations"];
const idClaims = new Map(); // cloudtcm id -> Map(herb id -> Set(欄位))
for (const r of ALL) {
  for (const f of URL_FIELDS) {
    for (const cid of idsIn(r[f])) {
      if (!idClaims.has(cid)) idClaims.set(cid, new Map());
      const m = idClaims.get(cid);
      if (!m.has(r.id)) m.set(r.id, new Set());
      m.get(r.id).add(f);
    }
  }
}
const C2b = [];
for (const [cid, m] of idClaims) {
  if (m.size < 2) continue;
  const claimants = Array.from(m, ([hid, fields]) => {
    const rec = ALL.find((x) => x.id === hid);
    return { id: hid, name_zh: rec ? rec.name_zh : "?", fields: Array.from(fields), in_layer: rec ? rec.source_type === LAYER_SOURCE_TYPE : false, primary: rec ? primaryId(rec) === cid : false };
  });
  C2b.push({ cloudtcm_id: cid, claimants });
}
C2b.sort((a, b) => Number(a.cloudtcm_id) - Number(b.cloudtcm_id));
// 「主 id 撞號」＝ 至少兩張卡把同一個 id 當成自己的識別頁（比引用撞號嚴重）
const C2bPrimary = C2b.filter((g) => g.claimants.filter((c) => c.primary).length >= 2);
const c2Cards = new Set();
for (const x of C2a) c2Cards.add(x.id);
for (const x of C2a2) c2Cards.add(x.id);
for (const g of C2b) for (const c of g.claimants) if (LAYER.some((r) => r.id === c.id)) c2Cards.add(c.id);

// ═══════════════════════════════════════════════════════════════════════════
// C3 — 內部矛盾
// ═══════════════════════════════════════════════════════════════════════════
const TOX_MARK = /(有毒|小毒|大毒|劇毒)/;
const NO_TOX = /無毒/;
const TEMP_TOKENS = ["大熱", "大寒", "微寒", "微溫", "微涼", "熱", "溫", "平", "涼", "寒"];
const HOT = new Set(["大熱", "熱", "溫", "微溫"]);
const COLD = new Set(["大寒", "寒", "微寒", "涼", "微涼"]);
function tempTokens(s) {
  const out = new Set();
  let t = String(s || "");
  for (const tok of TEMP_TOKENS) { if (t.includes(tok)) { out.add(tok); t = t.split(tok).join("　"); } }
  return out;
}
function poleOf(tokens) {
  let hot = false, cold = false, neutral = false;
  for (const t of tokens) { if (HOT.has(t)) hot = true; else if (COLD.has(t)) cold = true; else if (t === "平") neutral = true; }
  if (hot && !cold) return "HOT";
  if (cold && !hot) return "COLD";
  if (!hot && !cold && neutral) return "NEUTRAL";
  return hot && cold ? "MIXED" : "";
}
function cardTempTokens(r) {
  const src = [r.properties_taste_temp];
  if (r.tcm_properties && typeof r.tcm_properties === "object") src.push(r.tcm_properties.four_natures_zh);
  src.push(r.taste_temperature_zh);
  const out = new Set();
  for (const s of strings(src)) for (const t of tempTokens(s)) out.add(t);
  return out;
}
// 十二經＋奇經的臟腑名，長名優先（心包 > 心、小腸 > 小、大腸 > 大）
const CHANNEL_NAMES = ["心包", "小腸", "大腸", "膀胱", "三焦", "肺", "胃", "脾", "心", "腎", "肝", "膽", "任", "督"];
function channelTokens(s) {
  // 「歸心肝經」沒有頓號，必須逐字切；「歸肝、大腸經」有頓號也走同一條路徑
  const out = [];
  const t = String(s || "");
  for (let i = 0; i < t.length; ) {
    let hit = null;
    for (const c of CHANNEL_NAMES) if (t.startsWith(c, i)) { hit = c; break; }
    if (hit) { out.push(hit); i += hit.length; } else i += 1;
  }
  return out;
}
function cardChannels(r) {
  const out = new Set();
  const src = asList(r.channels_zh).concat(r.tcm_properties && typeof r.tcm_properties === "object" ? asList(r.tcm_properties.meridian_tropism_zh) : []);
  for (const s of strings(src)) for (const c of channelTokens(s)) out.add(c);
  return out;
}
const PROSE_TEMP_RE1 = /性\s*(大熱|大寒|微寒|微溫|微涼|熱|溫|平|涼|寒)/g;
const PROSE_TEMP_RE2 = /[苦辛甘酸鹹澀淡微、，,]{2,10}[，,]\s*(大熱|大寒|微寒|微溫|微涼|熱|溫|平|涼|寒)\s*[。．]/g;
const PROSE_CHAN_RE = /歸([一-鿿、，,和及]{1,24}?)經/g;
const PROSE_TOX_RE = /(有大毒|有小毒|有毒|無毒)/g;

const C3 = [];
for (const r of LAYER) {
  const hits = [];
  // (a) properties_taste_temp 自相矛盾（HB-6 ＋ H-40 的溫/熱形態）
  const ptt = String(r.properties_taste_temp || "");
  if (ptt) {
    if (TOX_MARK.test(ptt) && NO_TOX.test(ptt)) hits.push({ kind: "ptt_toxicity", quote: ptt });
    const toks = tempTokens(ptt);
    const hasHot = Array.from(toks).some((t) => HOT.has(t));
    const hasCold = Array.from(toks).some((t) => COLD.has(t));
    if (hasHot && hasCold) hits.push({ kind: "ptt_temperature", quote: ptt });
    else if (toks.has("溫") && (toks.has("熱") || toks.has("大熱"))) hits.push({ kind: "ptt_temp_grade", quote: ptt });
  }
  // (b)(c)(d) 散文 vs 結構欄
  const cardTemps = cardTempTokens(r);
  const cardPole = poleOf(cardTemps);
  const chans = cardChannels(r);
  const cardTox = TOX_MARK.test(ptt) ? (ptt.match(TOX_MARK) || [])[1] : (NO_TOX.test(ptt) ? "無毒" : "");
  for (const [field, s] of proseOf(r)) {
    if (field === "property_channel_source_note_zh" || field === "review_notes_zh") continue; // 這兩欄本來就是在記來源差異
    let m;
    const proseTemps = new Set();
    PROSE_TEMP_RE1.lastIndex = 0;
    while ((m = PROSE_TEMP_RE1.exec(s))) proseTemps.add(m[1]);
    if (field === "clinical_use_note" || field === "chinese_depth_track.summary_zh") {
      PROSE_TEMP_RE2.lastIndex = 0;
      while ((m = PROSE_TEMP_RE2.exec(s))) proseTemps.add(m[1]);
    }
    if (proseTemps.size && cardPole && cardPole !== "MIXED") {
      const pp = poleOf(proseTemps);
      if (pp && pp !== "MIXED" && pp !== cardPole) {
        hits.push({ kind: pp !== "NEUTRAL" && cardPole !== "NEUTRAL" ? "prose_temp_polar" : "prose_temp_neutral", field, prose: Array.from(proseTemps).join("/"), card: Array.from(cardTemps).join("/"), quote: clip(s, 90) });
      }
    }
    if (chans.size) {
      PROSE_CHAN_RE.lastIndex = 0;
      while ((m = PROSE_CHAN_RE.exec(s))) {
        const listed = channelTokens(m[1]);
        if (!listed.length) continue;
        const extra = listed.filter((c) => !chans.has(c));
        if (extra.length) hits.push({ kind: "prose_channels", field, prose: listed.join("/"), card: Array.from(chans).join("/"), extra: extra.join("/"), quote: clip(m[0] + " …", 60) });
      }
    }
    if (cardTox && (field === "clinical_use_note" || field === "chinese_depth_track.summary_zh")) {
      PROSE_TOX_RE.lastIndex = 0;
      const found = new Set();
      while ((m = PROSE_TOX_RE.exec(s))) found.add(m[1]);
      for (const f of found) {
        const norm = f.replace(/^有/, "");
        const cardNorm = cardTox.replace(/^有/, "");
        if (norm !== cardNorm && !(norm === "毒" && cardNorm === "毒")) {
          hits.push({ kind: "prose_toxicity", field, prose: f, card: cardTox, quote: clip(s, 90) });
        }
      }
    }
  }
  if (hits.length) C3.push({ id: r.id, name_zh: r.name_zh, toxic: isToxic(r), hits });
}

// ═══════════════════════════════════════════════════════════════════════════
// C4 — 劑量一致性
// ═══════════════════════════════════════════════════════════════════════════
function parseDosage(v) {
  if (v == null) return null;
  if (typeof v === "object") return v;
  const s = String(v).trim();
  if (s.startsWith("{")) { try { return JSON.parse(s); } catch (e) { return { _raw: s }; } }
  return { _raw: s };
}
// 只抓「克 / g」的人用劑量：
//   排除 mg / 毫克 / kg（單位前綴）
//   排除 g/kg、g/ml、克/公斤 這類**動物實驗每公斤劑量** —— CloudTCM 藥理長文滿是
//   「40g/kg 灌胃小鼠」，那不是人的日劑量，混進來會把 C4 洗成雜訊。
const GRAM_RE = /(\d+(?:\.\d+)?)\s*(?:[-–~～至到]\s*(\d+(?:\.\d+)?)\s*)?(克|公克|g|G)(?![a-zA-Z])/g;
function gramHits(s) {
  const out = [];
  let m;
  GRAM_RE.lastIndex = 0;
  const t = String(s || "");
  while ((m = GRAM_RE.exec(t))) {
    const before = t.slice(Math.max(0, m.index - 2), m.index);
    if (/[m毫微千kK]/.test(before)) continue;
    const after = t.slice(m.index + m[0].length, m.index + m[0].length + 6);
    if (/^\s*[\/／]/.test(after)) continue;           // 40g/kg、0.3ml/100g
    if (/^\s*(生藥|藥材)?\s*[\/／]/.test(after)) continue;
    const vals = [Number(m[1])];
    if (m[2] !== undefined) vals.push(Number(m[2]));
    for (const v of vals) if (Number.isFinite(v)) out.push({ value: v, index: m.index, quote: t.slice(Math.max(0, m.index - 45), m.index + 55) });
  }
  return out;
}
function grams(s) { return gramHits(s).map((h) => h.value); }
const MED_KEYS = ["一般建議", "standard_daily_g", "decoction_g", "standard", "min_g", "max_g", "内服", "內服"];
const FOOD_KEYS = ["食療用量範圍", "food_therapy_g"];
function doseRange(obj, keys) {
  if (!obj) return null;
  const vals = [];
  for (const k of Object.keys(obj)) {
    if (!keys.includes(k)) continue;
    for (const g of grams(obj[k])) vals.push(g);
  }
  if (!vals.length) return null;
  return { min: Math.min.apply(null, vals), max: Math.max.apply(null, vals) };
}
const C4 = [];
for (const r of LAYER) {
  const d = parseDosage(r.dosage);
  const dg = parseDosage(r.dosage_g);
  const hits = [];
  const medA = doseRange(d, MED_KEYS) || (d && d._raw ? (function () { const g = grams(d._raw); return g.length ? { min: Math.min.apply(null, g), max: Math.max.apply(null, g) } : null; })() : null);
  const medB = doseRange(dg, MED_KEYS) || (dg && dg._raw ? (function () { const g = grams(dg._raw); return g.length ? { min: Math.min.apply(null, g), max: Math.max.apply(null, g) } : null; })() : null);
  // (a) 兩套劑量欄互相矛盾。分兩級：
  //     ceiling  = 上限不一致（≥1.2 倍或區間不相交）—— 渲染器只讀 dosage_g，讀者拿到的上限與記錄不同
  //     floor    = 只有下限差 ≥2 倍（多半是兩來源並記，臨床後果較小）
  if (medA && medB) {
    const disjoint = medA.max < medB.min || medB.max < medA.min;
    const maxGap = Math.max(medA.max, medB.max) / Math.max(0.0001, Math.min(medA.max, medB.max));
    const minGap = Math.max(medA.min, medB.min) / Math.max(0.0001, Math.min(medA.min, medB.min));
    if (disjoint || maxGap >= 1.2) hits.push({ kind: "two_dose_fields_ceiling_conflict", dosage: `${medA.min}-${medA.max}`, dosage_g: `${medB.min}-${medB.max}` });
    else if (minGap >= 2) hits.push({ kind: "two_dose_fields_floor_conflict", dosage: `${medA.min}-${medA.max}`, dosage_g: `${medB.min}-${medB.max}` });
  }
  // (b) 食療上限 > 入藥上限
  const food = doseRange(d, FOOD_KEYS) || doseRange(dg, FOOD_KEYS);
  const medCeil = Math.max(medA ? medA.max : 0, medB ? medB.max : 0) || null;
  if (food && medCeil && food.max > medCeil) hits.push({ kind: "food_over_medicinal", food: `${food.min}-${food.max}`, medicinal_ceiling: medCeil });
  // (c) 散文裡的克數 > 本卡自己的上限
  //     分兩桶：臨床/安全散文（會被當成給藥資訊讀）vs CloudTCM 藥理長文（研究敘述）。
  //     headline 只算前者；後者另計，因為那是「文獻裡的實驗劑量」而非本卡的處方主張。
  const PHARM_ESSAY = /^(modern_functions_detail_zh|modern_pharmacology_zh)/;
  if (medCeil) {
    for (const [field, s] of proseOf(r)) {
      if (/^(dosage|dosage_g)/.test(field)) continue;
      for (const h of gramHits(s)) {
        if (h.value <= medCeil) continue;
        hits.push({ kind: PHARM_ESSAY.test(field) ? "pharm_essay_dose_over_ceiling" : "prose_dose_over_ceiling", field, prose_g: h.value, medicinal_ceiling: medCeil, quote: clip(h.quote, 100) });
      }
    }
    for (const k of ["特殊說明", "source_note_zh", "source_note", "preparation_note_zh"]) {
      for (const obj of [d, dg]) {
        if (!obj || obj[k] == null) continue;
        for (const h of gramHits(obj[k])) if (h.value > medCeil) hits.push({ kind: "dose_note_over_ceiling", field: `dosage.${k}`, prose_g: h.value, medicinal_ceiling: medCeil, quote: clip(h.quote, 100) });
      }
    }
  }
  if (hits.length) C4.push({ id: r.id, name_zh: r.name_zh, toxic: isToxic(r), medicinal_ceiling: medCeil, hits, headline: hits.some((x) => x.kind !== "pharm_essay_dose_over_ceiling") });
}

// ═══════════════════════════════════════════════════════════════════════════
// C5 — 配伍安全（十八反 / 十九畏）
// ═══════════════════════════════════════════════════════════════════════════
const COMBO_FIELDS = ["contraindications_zh", "cautions_zh", "cautions", "clinical_use_note", "exam_pearl", "indications_zh", "chinese_depth_track.summary_zh"];
function comboStatements(r) {
  const out = [];
  for (const [field, s] of proseOf(r)) {
    const base = field.replace(/\[\d+\]$/, "");
    if (!COMBO_FIELDS.includes(base) && !/^safety_info/.test(field)) continue;
    for (const seg of String(s).split(/(?<=[。！!；;])/)) {
      const t = seg.trim();
      if (!t) continue;
      if (/十八反|十九畏|相反|相畏|相惡|[反畏惡][一-鿿]{2}|同用|同方/.test(t)) out.push({ field, text: t });
    }
  }
  return out;
}
const REL_WORD = { "反": "反", "畏": "畏", "惡": "惡" };
function extractCounterparts(stmt, ownNames) {
  const found = new Map(); // name -> Set(relation)
  const t = stmt;
  // P1：關係詞緊接藥名（含頓號串接：反甘遂、京大戟、芫花、海藻）
  for (let i = 0; i < t.length; i++) {
    const rel = REL_WORD[t[i]];
    if (!rel) continue;
    let j = i + 1;
    let matchedAny = false;
    while (j < t.length) {
      const n = nameAt(t, j);
      if (!n) break;
      if (!ownNames.has(n)) {
        if (!found.has(n)) found.set(n, new Set());
        found.get(n).add(rel);
      }
      matchedAny = true;
      j += n.length;
      const sep = t.slice(j, j + 1);
      if (/[、，,和及／\/]/.test(sep)) { j += 1; continue; }
      break;
    }
    if (matchedAny) i = j - 1;
  }
  // P2：句子明講十八反/十九畏/相反/相畏但 P1 沒撈到對造 → 收句中的已知藥名
  if (!found.size && /十八反|十九畏|相反|相畏/.test(t)) {
    const rel = /十九畏|相畏/.test(t) ? "畏" : "反";
    for (let i = 0; i < t.length; ) {
      const n = nameAt(t, i);
      if (n) { if (!ownNames.has(n)) { if (!found.has(n)) found.set(n, new Set()); found.get(n).add(rel); } i += n.length; }
      else i += 1;
    }
  }
  return found;
}
const EFFICACY_RE = /(?:減弱|降低|削弱|影響)[^。；;]{0,12}(?:藥效|療效|功效|作用)/;
const TOXIC_LANG_RE = /毒/;

const claimsByCard = new Map(); // herb id -> Map(counterpart -> {rels:Set, fields:Set, stmts:[]})
const C5inversion = [];
const C5multiRel = [];
const namedMissing = new Map(); // counterpart name -> Set(herb id)
for (const r of LAYER) {
  const ownNames = new Set([r.name_zh].concat(asList(r.aliases_zh)).map((s) => String(s || "").trim()).filter(Boolean));
  const map = new Map();
  for (const st of comboStatements(r)) {
    const cps = extractCounterparts(st.text, ownNames);
    for (const [n, rels] of cps) {
      if (!map.has(n)) map.set(n, { rels: new Set(), fields: new Set(), stmts: [] });
      const e = map.get(n);
      for (const x of rels) e.rels.add(x);
      e.fields.add(st.field.replace(/\[\d+\]$/, ""));
      e.stmts.push(st.text);
      if (!NAME_TO_ID.has(n)) {
        if (!namedMissing.has(n)) namedMissing.set(n, new Set());
        namedMissing.get(n).add(r.id);
      }
    }
    // 語意反轉：十八反/相反 的句子講成療效減弱，且整句不提毒
    const isFan = /十八反|相反/.test(st.text) || Array.from(cps.values()).some((s) => s.has("反"));
    if (isFan && EFFICACY_RE.test(st.text) && !TOXIC_LANG_RE.test(st.text)) {
      C5inversion.push({ id: r.id, name_zh: r.name_zh, field: st.field, quote: clip(st.text, 120), toxic: isToxic(r) });
    }
  }
  for (const [n, e] of map) {
    if (e.rels.size >= 2) C5multiRel.push({ id: r.id, name_zh: r.name_zh, counterpart: n, relations: Array.from(e.rels).join("+"), fields: Array.from(e.fields).join(","), toxic: isToxic(r) });
  }
  claimsByCard.set(r.id, map);
}
// 全庫（不限層）也建一次，才能判斷「對造卡怎麼說」
const claimsAll = new Map();
for (const r of ALL) {
  const ownNames = new Set([r.name_zh].concat(asList(r.aliases_zh)).map((s) => String(s || "").trim()).filter(Boolean));
  const map = new Map();
  for (const st of comboStatements(r)) {
    for (const [n, rels] of extractCounterparts(st.text, ownNames)) {
      if (!map.has(n)) map.set(n, { rels: new Set(), fields: new Set(), stmts: [] });
      const e = map.get(n);
      for (const x of rels) e.rels.add(x);
      e.fields.add(st.field.replace(/\[\d+\]$/, ""));
      e.stmts.push(st.text);
    }
  }
  claimsAll.set(r.id, map);
}
// 對造配對：兩張卡互相點名
const recById = new Map(ALL.map((r) => [r.id, r]));
const pairSeen = new Set();
const C5pairs = [];
for (const [hid, map] of claimsAll) {
  const a = recById.get(hid);
  for (const [n, e] of map) {
    const otherId = NAME_TO_ID.get(n);
    if (!otherId || otherId === hid) continue;
    const key = [hid, otherId].sort().join("||");
    if (pairSeen.has(key)) continue;
    const bMap = claimsAll.get(otherId) || new Map();
    const b = recById.get(otherId);
    // 對造側是否回指本卡（用本卡 name_zh 或 aliases）
    let back = null;
    for (const nm of [a.name_zh].concat(asList(a.aliases_zh))) { if (bMap.has(nm)) { back = bMap.get(nm); break; } }
    if (!back) continue;
    pairSeen.add(key);
    const relsA = Array.from(e.rels).sort().join("+");
    const relsB = Array.from(back.rels).sort().join("+");
    const fieldsA = Array.from(e.fields);
    const fieldsB = Array.from(back.fields);
    const bothContra = fieldsA.includes("contraindications_zh") && fieldsB.includes("contraindications_zh");
    const relAgree = relsA === relsB;
    const weiConflict = e.rels.has("畏") && back.rels.has("畏"); // 兩側都自稱「畏」對方 = 方向反轉
    const inverted = C5inversion.some((x) => x.id === hid || x.id === otherId);
    C5pairs.push({
      a: hid, a_name: a.name_zh, b: otherId, b_name: b.name_zh,
      rels_a: relsA, rels_b: relsB, fields_a: fieldsA.join(","), fields_b: fieldsB.join(","),
      both_contraindications: bothContra, relation_agree: relAgree, direction_conflict: weiConflict,
      semantic_inversion: inverted,
      agree: relAgree && bothContra && !weiConflict && !inverted,
      in_layer: (a.source_type === LAYER_SOURCE_TYPE) || (b.source_type === LAYER_SOURCE_TYPE),
    });
  }
}
// 同一判準跑全庫（不限層），才能給出「藜蘆被幾張卡點名」的全庫數字
const namedMissingAll = new Map();
for (const r of ALL) {
  const ownNames = new Set([r.name_zh].concat(asList(r.aliases_zh)).map((s) => String(s || "").trim()).filter(Boolean));
  for (const st of comboStatements(r)) {
    for (const [n] of extractCounterparts(st.text, ownNames)) {
      if (NAME_TO_ID.has(n)) continue;
      if (!namedMissingAll.has(n)) namedMissingAll.set(n, new Set());
      namedMissingAll.get(n).add(r.id);
    }
  }
}
const C5missing = Array.from(namedMissing, ([name, ids]) => ({ name, cards: ids.size, ids: Array.from(ids), cards_all: (namedMissingAll.get(name) || new Set()).size }))
  .sort((a, b) => b.cards_all - a.cards_all);
const c5Cards = new Set();
for (const x of C5inversion) c5Cards.add(x.id);
for (const x of C5multiRel) c5Cards.add(x.id);
for (const x of C5missing) for (const i of x.ids) c5Cards.add(i);
for (const p of C5pairs) { if (p.direction_conflict) { for (const i of [p.a, p.b]) if (LAYER.some((r) => r.id === i)) c5Cards.add(i); } }

// ═══════════════════════════════════════════════════════════════════════════
// C6 — 佔位/樣板英文
// ═══════════════════════════════════════════════════════════════════════════
// 與 js/knowledge.js 的 usableText 同一條 regex：命中 = 渲染時整條被丟掉，
// 所以那個欄位在卡片上現在是空白。
const PLACEHOLDER_RE = /^(draft:|review .+ before clinical use\.?$|verify against .+ before |pattern documentation context only)/i;
// 廣義：句中（非句首）也出現同一批匯入語 —— 這些目前仍會渲染出去
const PLACEHOLDER_LOOSE_RE = /(verify against .+ before |pattern documentation context only|before source_checked)/i;
const C6 = [];
let c6Strings = 0, c6LooseStrings = 0;
const c6FieldTally = new Map();
for (const r of LAYER) {
  const hits = [];
  const loose = [];
  for (const [p, s] of walkStrings(r)) {
    if (PLACEHOLDER_RE.test(s.trim())) {
      hits.push({ field: p, quote: clip(s, 90) });
      const base = p.replace(/\[\d+\]/g, "[]");
      c6FieldTally.set(base, (c6FieldTally.get(base) || 0) + 1);
    } else if (PLACEHOLDER_LOOSE_RE.test(s)) loose.push({ field: p, quote: clip(s, 90) });
  }
  c6Strings += hits.length;
  c6LooseStrings += loose.length;
  if (hits.length || loose.length) C6.push({ id: r.id, name_zh: r.name_zh, toxic: isToxic(r), blanked: hits.length, still_rendered: loose.length, hits, loose });
}
const C6blanked = C6.filter((x) => x.blanked > 0);

// ═══════════════════════════════════════════════════════════════════════════
// 彙總
// ═══════════════════════════════════════════════════════════════════════════
const criteriaCards = {
  C1: new Set(C1.map((x) => x.id)),
  C2: c2Cards,
  C3: new Set(C3.map((x) => x.id)),
  C4: new Set(C4.filter((x) => x.headline).map((x) => x.id)),
  C5: c5Cards,
  C6: new Set(C6blanked.map((x) => x.id)),
};
const layerIds = LAYER.map((r) => r.id);
const toxicIds = new Set(LAYER.filter(isToxic).map((r) => r.id));
const perCard = new Map(layerIds.map((id) => [id, []]));
for (const k of Object.keys(criteriaCards)) for (const id of criteriaCards[k]) if (perCard.has(id)) perCard.get(id).push(k);
const noFinding = layerIds.filter((id) => perCard.get(id).length === 0);
const ge3 = layerIds.filter((id) => perCard.get(id).length >= 3);
const ge1 = layerIds.filter((id) => perCard.get(id).length >= 1);
function inTox(set) { let n = 0; for (const id of set) if (toxicIds.has(id)) n++; return n; }

// ═══════════════════════════════════════════════════════════════════════════
// 交叉檢查 —— 兩批眼讀已經立案、但本腳本六條判準「看不到」的缺陷類
// 目的：回答「零命中是不是就等於乾淨」。答案要用數字講，不能用推論。
// ═══════════════════════════════════════════════════════════════════════════
let formulaComp = null;
try {
  const fRaw = JSON.parse(fs.readFileSync(path.join(REPO, "data/herbs/formulas.json"), "utf8"));
  const fl = fRaw.records || fRaw;
  formulaComp = new Map(fl.map((f) => [f.id, asList(f.composition)]));
} catch (e) { formulaComp = null; }
function relatedFormulaBad(r) {
  if (!formulaComp) return false;
  for (const link of asList(r.related_formulas)) {
    const fid = typeof link === "string" ? link : (link && (link.id || link.formula_id));
    if (!fid) continue;
    const comp = formulaComp.get(fid);
    if (!comp) return true; // dead id
    const has = comp.some((c) => c && (c.herb_id === r.id || (c.herb_zh && String(c.herb_zh).includes(r.name_zh))));
    if (!has) return true;
  }
  return false;
}
const KNOWN_CLASSES = {
  "H-16 clinical_use_note ≡ summary_zh": (r) => !!r.clinical_use_note && r.chinese_depth_track && r.clinical_use_note === r.chinese_depth_track.summary_zh,
  "H-11 禁忌欄整欄空": (r) => !asList(r.contraindications_zh).length && !(r.safety_info && asList(r.safety_info.contraindications_zh).length),
  "H-12 cautions_zh 有、cautions_en 無": (r) => asList(r.cautions_zh).length > 0 && !asList(r.cautions_en).length,
  "H-39 condition_tags 功效串": (r) => asList(r.condition_tags_zh).length === 1 && String(asList(r.condition_tags_zh)[0]).length >= 8,
  "H-17 functions_zh > 6 條": (r) => asList(r.functions_zh).length > 6,
  "H-32 functions_zh/actions_en 長度不等": (r) => asList(r.functions_zh).length > 0 && asList(r.actions_en).length > 0 && asList(r.functions_zh).length !== asList(r.actions_en).length,
  "H-03 related_formulas 指向不含本味的方": relatedFormulaBad,
};
const knownHits = {};
for (const k of Object.keys(KNOWN_CLASSES)) knownHits[k] = LAYER.filter(KNOWN_CLASSES[k]).map((r) => r.id);
const noFindingSet = new Set(); // 先佔位，下面 noFinding 算完再填

// ── 輸出 ──────────────────────────────────────────────────────────────────
const L = LAYER.length;
const T = toxicIds.size;
const out = [];
out.push(`audit-herb-cloudtcm-layer — ${INPUT}`);
out.push(`全庫 ${ALL.length} 筆；掃描層 source_type="${SCAN_ALL ? "(全部)" : LAYER_SOURCE_TYPE}" ${L} 張；其中 safety_flags 帶硬毒性 slug ${T} 張`);
out.push("");
out.push("判準              受影響卡數   佔本層     其中毒藥卡   佔毒藥子集");
function row(label, set) {
  const n = set.size !== undefined ? set.size : set.length;
  const t = inTox(set);
  out.push(`${label.padEnd(16)} ${String(n).padStart(6)}   ${pct(n, L).padStart(7)}   ${String(t).padStart(8)}   ${pct(t, T).padStart(8)}`);
}
row("C1 錯藥內容", criteriaCards.C1);
row("C2 來源 id", criteriaCards.C2);
row("C3 內部矛盾", criteriaCards.C3);
row("C4 劑量一致", criteriaCards.C4);
row("C5 配伍安全", criteriaCards.C5);
row("C6 佔位英文", criteriaCards.C6);
out.push("");
out.push(`零命中（六條都沒中）：${noFinding.length} / ${L}（${pct(noFinding.length, L)}）；其中毒藥卡 ${inTox(noFinding)}`);
out.push(`至少一條命中：      ${ge1.length} / ${L}（${pct(ge1.length, L)}）`);
out.push(`≥3 條命中：         ${ge3.length} / ${L}（${pct(ge3.length, L)}）；其中毒藥卡 ${inTox(ge3)}`);
const dist = [0, 1, 2, 3, 4, 5, 6].map((k) => `${k}:${layerIds.filter((id) => perCard.get(id).length === k).length}`);
out.push(`命中條數分佈：      ${dist.join("  ")}`);
out.push("");

out.push("── C1 錯藥內容 ───────────────────────────────────────────────────");
out.push(`Tier A（本卡藥名 0 次、他藥 ≥3 次）：      ${C1.filter((x) => x.tier === "A").length}`);
out.push(`Tier B（他藥 ≥ 本卡 2 倍且 ≥3 次）：       ${C1.filter((x) => x.tier === "B").length}`);
out.push(`Tier C（他藥 > 本卡但未達 2 倍，邊緣）：   ${C1.filter((x) => x.tier === "C").length}`);
out.push(`  分類：distinct_card ${C1.filter((x) => x.relation === "distinct_card").length}（真・別的藥的內容） · same_drug_two_cards ${C1.filter((x) => x.relation === "same_drug_two_cards").length}（同一味藥兩張卡） · no_card_variant ${C1.filter((x) => x.relation === "no_card_variant").length}（異體字）`);
for (const x of C1) {
  out.push(`  [${x.tier}] ${x.id} ${x.name_zh}  自身 ${x.own} 次 / ${x.intruder} ${x.intruder_count} 次（${(x.intruder_count / Math.max(1, x.own)).toFixed(1)}×）  ${x.relation}${x.intruder_id ? " → " + x.intruder_id : ""}${x.toxic ? " [毒]" : ""}`);
}
out.push("");

out.push("── C2 CloudTCM id 完整性 ─────────────────────────────────────────");
out.push(`C2a field_sources 引用外來 id：${C2a.length} 張（毒藥 ${C2a.filter((x) => x.toxic).length}）`);
out.push(`C2a2 cloudtcm_url 與 exact_source_url 分裂：${C2a2.length} 張`);
out.push(`C2b 同一 CloudTCM id 被 ≥2 張卡宣稱：${C2b.length} 組（其中「兩張卡都當成自己的主識別頁」${C2bPrimary.length} 組）`);
for (const g of (WANT_DETAIL ? C2b : C2bPrimary)) {
  out.push(`  id ${g.cloudtcm_id}: ` + g.claimants.map((c) => `${c.name_zh}(${c.id.replace("herb.", "")}${c.primary ? "*主" : ""}${c.in_layer ? "" : " 非本層"})`).join("  ⟷  "));
}
if (WANT_DETAIL) for (const x of C2a) out.push(`  ${x.id} ${x.name_zh} 主 id ${x.own_id} → 外來 ` + x.foreign.map((f) => `${f.id}(${f.fields.join(",")})`).join(" ; "));
out.push("");

out.push("── C3 內部矛盾 ───────────────────────────────────────────────────");
const c3kinds = {};
for (const c of C3) for (const h of c.hits) c3kinds[h.kind] = (c3kinds[h.kind] || 0) + 1;
for (const k of Object.keys(c3kinds).sort()) {
  const cards = new Set(C3.filter((c) => c.hits.some((h) => h.kind === k)).map((c) => c.id));
  out.push(`  ${k.padEnd(22)} ${String(cards.size).padStart(4)} 張（毒藥 ${inTox(cards)}）  命中 ${c3kinds[k]} 條`);
}
for (const c of (WANT_DETAIL ? C3 : C3.filter((c) => c.hits.some((h) => h.kind === "prose_temp_polar" || h.kind === "ptt_toxicity")))) {
  out.push(`  ${c.id} ${c.name_zh}${c.toxic ? " [毒]" : ""}`);
  for (const h of c.hits) out.push(`      ${h.kind}${h.field ? " @" + h.field : ""}  ${h.prose ? `散文=${h.prose} vs 本卡=${h.card}  ` : ""}${clip(h.quote || "", 80)}`);
}
out.push("");

out.push("── C4 劑量一致性 ─────────────────────────────────────────────────");
const c4kinds = {};
for (const c of C4) for (const h of c.hits) c4kinds[h.kind] = (c4kinds[h.kind] || 0) + 1;
for (const k of Object.keys(c4kinds).sort()) {
  const cards = new Set(C4.filter((c) => c.hits.some((h) => h.kind === k)).map((c) => c.id));
  out.push(`  ${k.padEnd(26)} ${String(cards.size).padStart(4)} 張（毒藥 ${inTox(cards)}）  命中 ${c4kinds[k]} 條`);
}
const c4NoCeil = LAYER.filter((r) => {
  const d = parseDosage(r.dosage), dg = parseDosage(r.dosage_g);
  const a = doseRange(d, MED_KEYS) || (d && d._raw ? (grams(d._raw).length ? { max: Math.max.apply(null, grams(d._raw)) } : null) : null);
  const b = doseRange(dg, MED_KEYS) || (dg && dg._raw ? (grams(dg._raw).length ? { max: Math.max.apply(null, grams(dg._raw)) } : null) : null);
  return !a && !b;
});
out.push(`  （headline = 前四類；pharm_essay_* 是 CloudTCM 藥理長文裡的實驗劑量，另計不進 headline）`);
out.push(`  （本層有 ${c4NoCeil.length} 張根本沒有可解析的入藥上限，C4c 對它們是盲的；其中毒藥 ${inTox(new Set(c4NoCeil.map((r) => r.id)))}）`);
for (const c of (WANT_DETAIL ? C4 : C4.filter((c) => c.hits.some((h) => /prose_dose_over_ceiling|two_dose_fields|dose_note_over_ceiling/.test(h.kind))))) {
  const shown = WANT_DETAIL ? c.hits : c.hits.filter((h) => h.kind !== "pharm_essay_dose_over_ceiling" && h.kind !== "food_over_medicinal");
  if (!shown.length) continue;
  out.push(`  ${c.id} ${c.name_zh}${c.toxic ? " [毒]" : ""} 上限 ${c.medicinal_ceiling}g`);
  for (const h of shown) out.push(`      ${h.kind}  ${h.prose_g !== undefined ? h.prose_g + "g @" + h.field : JSON.stringify(h)}  ${clip(h.quote || "", 80)}`);
}
out.push("");

out.push("── C5 配伍安全 ───────────────────────────────────────────────────");
out.push(`  語意反轉（十八反講成療效減弱）：${C5inversion.length} 條 / ${new Set(C5inversion.map((x) => x.id)).size} 張`);
for (const x of C5inversion) out.push(`      ${x.id} ${x.name_zh} @${x.field}：${x.quote}`);
out.push(`  同卡同對造多個關係詞：          ${C5multiRel.length} 組 / ${new Set(C5multiRel.map((x) => x.id)).size} 張`);
for (const x of C5multiRel) out.push(`      ${x.id} ${x.name_zh} ⟷ ${x.counterpart}：${x.relations}（${x.fields}）`);
const dirConf = C5pairs.filter((p) => p.direction_conflict);
out.push(`  兩側都自稱「畏」對方（方向反轉）：${dirConf.length} 組`);
for (const p of dirConf) out.push(`      ${p.a_name} ⟷ ${p.b_name}（${p.fields_a} / ${p.fields_b}）`);
const mutual = C5pairs.length;
const agreed = C5pairs.filter((p) => p.agree);
out.push(`  兩側互相點名的配伍組：          ${mutual} 組；兩側完全對得上（同關係詞＋都在禁忌欄＋無語意反轉）：${agreed.length} 組`);
for (const p of agreed) out.push(`      ✔ ${p.a_name} ⟷ ${p.b_name}（${p.rels_a}）`);
if (WANT_DETAIL) for (const p of C5pairs.filter((x) => !x.agree)) out.push(`      ✗ ${p.a_name}[${p.rels_a}|${p.fields_a}] ⟷ ${p.b_name}[${p.rels_b}|${p.fields_b}]`);
out.push(`  被點名為配伍對造、全庫查無卡的藥：${C5missing.length} 味`);
for (const m of C5missing) out.push(`      ${m.name}  被 ${m.cards} 張本層卡點名（全庫 ${m.cards_all} 張）`);
out.push("");

out.push("── C6 佔位/樣板英文 ──────────────────────────────────────────────");
out.push(`  渲染時被 usableText 丟掉（該欄現在空白）：${C6blanked.length} 張 / ${c6Strings} 條（毒藥 ${C6blanked.filter((x) => x.toxic).length} 張）`);
out.push(`  同批匯入語但出現在句中、目前仍會渲染：    ${C6.filter((x) => x.still_rendered > 0).length} 張 / ${c6LooseStrings} 條`);
out.push("  逐欄位（被丟掉的那批）：");
for (const [f, n] of Array.from(c6FieldTally).sort((a, b) => b[1] - a[1])) out.push(`      ${f.padEnd(46)} ${n}`);
out.push("");

out.push("── 交叉檢查：本腳本看不到、但兩批眼讀已立案的缺陷類 ──────────────");
out.push("  （用來回答「零命中 = 乾淨嗎」。這些類本腳本的六條判準完全不碰。）");
const noFindSet = new Set(noFinding);
for (const k of Object.keys(knownHits)) {
  const ids = knownHits[k];
  const inNoFind = ids.filter((id) => noFindSet.has(id)).length;
  out.push(`  ${k.padEnd(38)} 本層 ${String(ids.length).padStart(4)} 張   其中落在「六條零命中」那 ${noFinding.length} 張裡的：${inNoFind}`);
}
const cleanBoth = noFinding.filter((id) => !Object.keys(KNOWN_CLASSES).some((k) => knownHits[k].includes(id)));
out.push(`  → 六條零命中 **且** 上列七類也全部沒中：${cleanBoth.length} 張 = ${pct(cleanBoth.length, L)}`);
if (cleanBoth.length) out.push("    " + cleanBoth.map((i) => i.replace("herb.", "")).join(" "));
out.push("");

out.push("── 本層內部的分層：已被重新策展的卡 vs 原樣落地的卡 ──────────────");
out.push("  （`card_grade` 與 `updated_by/authored_by` 是「這張卡有沒有被 Codex/Claude 動過」的兩個機器可讀指標）");
const grades = new Map();
for (const r of LAYER) {
  const g = r.card_grade === undefined ? "(無)" : r.card_grade;
  if (!grades.has(g)) grades.set(g, []);
  grades.get(g).push(r.id);
}
for (const [g, ids] of Array.from(grades).sort((a, b) => b[1].length - a[1].length)) {
  const clean = ids.filter((id) => perCard.get(id).length === 0).length;
  const heavy = ids.filter((id) => perCard.get(id).length >= 3).length;
  const fully = ids.filter((id) => cleanBoth.includes(id)).length;
  out.push(`  card_grade=${String(g).padEnd(10)} ${String(ids.length).padStart(4)} 張   六條零命中 ${String(clean).padStart(3)}（${pct(clean, ids.length)}）  ≥3 條 ${String(heavy).padStart(3)}  十三條全零 ${fully}`);
}
const touched = LAYER.filter((r) => r.updated_by || r.authored_by).map((r) => r.id);
const untouched = layerIds.filter((id) => !touched.includes(id));
for (const [label, ids] of [["有 updated_by/authored_by", touched], ["沒有（純匯入）      ", untouched]]) {
  const clean = ids.filter((id) => perCard.get(id).length === 0).length;
  const heavy = ids.filter((id) => perCard.get(id).length >= 3).length;
  const fully = ids.filter((id) => cleanBoth.includes(id)).length;
  out.push(`  ${label} ${String(ids.length).padStart(4)} 張   六條零命中 ${String(clean).padStart(3)}（${pct(clean, ids.length)}）  ≥3 條 ${String(heavy).padStart(3)}  十三條全零 ${fully}`);
}
out.push("");

out.push("── 兩種修法的工作量切分 ──────────────────────────────────────────");
out.push("  A. 批次可修（判準已寫死、不必回頭核來源頁）：欄位缺失、佔位英文、食療欄、型別");
const batchFixable = new Set();
for (const x of C6blanked) batchFixable.add(x.id);
for (const c of C4) if (c.hits.some((h) => h.kind === "food_over_medicinal")) batchFixable.add(c.id);
for (const k of ["H-11 禁忌欄整欄空", "H-12 cautions_zh 有、cautions_en 無", "H-39 condition_tags 功效串", "H-32 functions_zh/actions_en 長度不等"]) for (const id of knownHits[k]) batchFixable.add(id);
out.push(`     C6 佔位英文 ${C6blanked.length} · C4 食療>入藥 ${C4.filter((c) => c.hits.some((h) => h.kind === "food_over_medicinal")).length} · 禁忌欄空 ${knownHits["H-11 禁忌欄整欄空"].length} · cautions_en 缺 ${knownHits["H-12 cautions_zh 有、cautions_en 無"].length} · condition_tags 功效串 ${knownHits["H-39 condition_tags 功效串"].length} · 中英長度不等 ${knownHits["H-32 functions_zh/actions_en 長度不等"].length}`);
out.push(`     聯集：${batchFixable.size} 張（毒藥 ${inTox(batchFixable)}）`);
out.push("  B. 必須回頭核 CloudTCM 原頁才修得動（誰是誰、哪個數字對、哪個方向對）：");
const needResource = new Set();
for (const x of C1) needResource.add(x.id);
for (const id of c2Cards) needResource.add(id);
for (const c of C3) if (c.hits.some((h) => /^prose_/.test(h.kind))) needResource.add(c.id);
for (const c of C4) if (c.hits.some((h) => h.kind !== "food_over_medicinal" && h.kind !== "pharm_essay_dose_over_ceiling")) needResource.add(c.id);
for (const id of c5Cards) needResource.add(id);
out.push(`     C1 ${criteriaCards.C1.size} · C2 ${criteriaCards.C2.size} · C3 散文矛盾 ${C3.filter((c) => c.hits.some((h) => /^prose_/.test(h.kind))).length} · C4 非食療類 ${C4.filter((c) => c.hits.some((h) => h.kind !== "food_over_medicinal" && h.kind !== "pharm_essay_dose_over_ceiling")).length} · C5 ${criteriaCards.C5.size}`);
out.push(`     聯集：${needResource.size} 張（毒藥 ${inTox(needResource)}） = 本層的 ${pct(needResource.size, L)}`);
out.push(`  A 與 B 都沒中：${layerIds.filter((id) => !batchFixable.has(id) && !needResource.has(id)).length} 張`);
out.push("");

out.push("── 修 vs 重建的兩面證據 ──────────────────────────────────────────");
out.push(`  六條零命中（不可丟）：${noFinding.length} 張 = ${pct(noFinding.length, L)}`);
out.push(`  六條 + 七類都零命中：${cleanBoth.length} 張 = ${pct(cleanBoth.length, L)}`);
out.push(`  1–2 條命中：          ${layerIds.filter((id) => perCard.get(id).length >= 1 && perCard.get(id).length <= 2).length} 張`);
out.push(`  ≥3 條命中：           ${ge3.length} 張 = ${pct(ge3.length, L)}（毒藥 ${inTox(ge3)}/${T}）`);
out.push(`  毒藥子集中六條零命中：${inTox(noFinding)} / ${T}`);

console.log(out.join("\n"));

if (JSON_OUT) {
  const payload = {
    input: INPUT, layer: SCAN_ALL ? "(all)" : LAYER_SOURCE_TYPE, layer_size: L, toxic_subset: T,
    counts: Object.fromEntries(Object.keys(criteriaCards).map((k) => [k, { cards: criteriaCards[k].size, toxic: inTox(criteriaCards[k]) }])),
    no_finding: noFinding, ge3, per_card: Object.fromEntries(perCard),
    C1, C2a, C2a2, C2b, C3, C4,
    C5: { inversion: C5inversion, multi_relation: C5multiRel, direction_conflict: dirConf, pairs: C5pairs, agreed, missing_counterparts: C5missing },
    C6,
  };
  fs.mkdirSync(path.dirname(path.join(REPO, JSON_OUT)), { recursive: true });
  fs.writeFileSync(path.join(REPO, JSON_OUT), JSON.stringify(payload, null, 1));
  console.log(`\n[json] ${JSON_OUT}`);
}

process.exit(0);
