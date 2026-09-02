#!/usr/bin/env node
/**
 * validate-board-pair-attribution.js — 「NCBAHM 考綱官方對藥」這個宣稱對不對得上考綱正本
 *
 * 為什麼有這一支(2026-08-27):
 * 藥卡的 key_pairs 與 herb_pairs 記錄都會宣稱某個組合是「2026 NCBAHM Appendix B 官方對藥」。
 * 考綱正本就在 repo 裡(curriculum/board/NCBAHM_CH_...md),但沒有任何東西在核對這個宣稱。
 * 實際一核:Appendix B 全部是「A and B」二味對藥,而庫裡有 3–4 味的組合掛著同一個宣稱,
 * 也有二味組合根本不在清單上。考綱宣稱是學生判斷「這題會不會考」的依據,標錯比留空更糟。
 *
 * 這支做三件事:
 *   1. 從考綱 md 解析 Appendix B(錨定行首「Appendix B.」——內文第 36 行有一句
 *      「See Appendix B.」,抓到它會讓區段落在錯地方、解析出 0 組而不自知;
 *      所以解析出 0 組一律視為 FAIL,不允許空跑通過)
 *   2. 逐條核對 herb_pairs 的 ncbahm_official_pair:true
 *   3. 逐條核對藥卡 key_pairs 標籤裡的 NCBAHM / Appendix B 字樣
 *
 * 比對用拼音,並吃別名:考綱寫 Xin Yi Hua / Han Lian Cao / Sha Shen,
 * 本庫正名是 辛夷 / 墨旱蓮 / 北沙參,中文別名對得上就算命中——
 * 別名差異是命名問題,不是歸屬錯誤,不能混為一談。
 *
 * 用法: node scripts/validate-board-pair-attribution.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const OUTLINE = path.join(ROOT, "curriculum/board/NCBAHM_CH_Exam_Content_Outline-w-Bibliography_Jan_2026.md");

const problems = [];
const notes = [];

if (!fs.existsSync(OUTLINE)) {
  console.log("validate-board-pair-attribution — SKIP");
  console.log("  考綱正本不在 curriculum/board/,無法核對。這不是 PASS,是量不到。");
  process.exit(0);
}
const lines = fs.readFileSync(OUTLINE, "utf8").split("\n");
const start = lines.findIndex((l) => /^Appendix B\. Chinese Herbal Pairs/.test(l.trim()));
const end = lines.findIndex((l, i) => i > start && /^Appendix C\./.test(l.trim()));
if (start < 0 || end < 0) {
  console.log("FAIL — 考綱裡找不到 Appendix B 區段(start=" + start + " end=" + end + "),解析規則要跟著考綱更新");
  process.exit(1);
}
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z]/g, "");
const appB = [];
for (const l of lines.slice(start, end)) {
  const m = l.match(/([A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)*)\s*\([^)]*\)\s+and\s+([A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)*)\s*\([^)]*\)/);
  if (m) appB.push([m[1].trim(), m[2].trim()]);
}
if (!appB.length) {
  console.log("FAIL — Appendix B 解析出 0 組。區段錨點或行格式變了,不允許空跑通過。");
  process.exit(1);
}
const appSet = new Set(appB.map((p) => [norm(p[0]), norm(p[1])].sort().join("|")));
notes.push("考綱 Appendix B 解析出 " + appB.length + " 組(全為二味對藥)");

const bundle = path.join(ROOT, "data/generated/knowledge_mm.js");
if (!fs.existsSync(bundle)) { console.log("FAIL — 先跑 node scripts/build-data.js"); process.exit(1); }
globalThis.window = globalThis;
require(bundle);
const K = globalThis.ACUTING_KNOWLEDGE || {};
const herbs = (K.herbs && K.herbs.records) || [];
const pairs = (K.herbPairs && K.herbPairs.pairs) || [];
if (!herbs.length || !pairs.length) { console.log("FAIL — bundle 讀不到 herbs/herbPairs"); process.exit(1); }

// 一味藥可用的所有拼音寫法:正名拼音 + 別名(中文別名沒有拼音欄,用考綱那側的中文對照不可行,
// 故改以「考綱英文詞 ↔ 本庫某味藥」的候選集合比對:正名拼音,以及別名去掉常見詞綴後的變體)
const pyOf = new Map(herbs.map((h) => [h.id, norm(h.pinyin)]));
const zhOf = new Map(herbs.map((h) => [h.id, h.name_zh]));
// 考綱英文詞 → 本庫藥 id 的對照表:先用正名拼音,再用「考綱詞是本庫拼音的延伸或被延伸」補
const idByPy = new Map();
for (const h of herbs) if (h.pinyin) { const k = norm(h.pinyin); if (!idByPy.has(k)) idByPy.set(k, h.id); }
// 同一味藥在本庫可能有兩張卡(旱蓮草/墨旱蓮、沙參/北沙參)。中文名或別名有交集就視為同一味,
// 否則考綱寫 Han Lian Cao、藥對用 herb.mo_han_lian 會被誤判成「不在清單上」——
// 那是重複卡的命名問題,不是歸屬錯誤,兩者不能混為一談。
const zhNamesOf = (h) => new Set([h.name_zh, ...(h.aliases_zh || [])].filter(Boolean));
const groupOf = new Map();   // herb.id -> group id
{
  let g = 0;
  for (const h of herbs) {
    if (groupOf.has(h.id)) continue;
    const mine = zhNamesOf(h);
    const key = "g" + (g++);
    groupOf.set(h.id, key);
    for (const o of herbs) {
      if (groupOf.has(o.id)) continue;
      const theirs = zhNamesOf(o);
      if ([...mine].some((x) => theirs.has(x))) groupOf.set(o.id, key);
    }
  }
}
const resolveOutlineTerm = (term) => {
  const t = norm(term);
  if (idByPy.has(t)) return idByPy.get(t);
  // Xin Yi Hua ↔ Xin Yi 這類詞綴差異
  for (const [k, id] of idByPy) if (k && (t.startsWith(k) || k.endsWith(t) || t.endsWith(k))) return id;
  return null;
};
const appPairsAsIds = appB.map(([a, b]) => [resolveOutlineTerm(a), resolveOutlineTerm(b)]).filter((p) => p[0] && p[1]);
const appGroupSet = new Set(appPairsAsIds.map((p) => p.map((i) => groupOf.get(i)).sort().join("|")));
const appIdSet = new Set(appPairsAsIds.map((p) => [...p].sort().join("|")));
notes.push("其中 " + appPairsAsIds.length + " 組的兩味都對得上本庫藥 id");

const onAppB = (ids) => ids.length === 2 && (
  appIdSet.has([...ids].sort().join("|")) ||
  appGroupSet.has(ids.map((i) => groupOf.get(i)).sort().join("|")) ||
  appSet.has(ids.map((i) => pyOf.get(i) || "").sort().join("|"))
);

// ---- 1. herb_pairs 的 ncbahm_official_pair ----------------------------------
const badPairs = [];
let okPairs = 0;
for (const p of pairs) {
  if (p.ncbahm_official_pair !== true) continue;
  if (onAppB(p.herbs || [])) okPairs++;
  else badPairs.push(p);
}
notes.push("herb_pairs 標 ncbahm_official_pair:true — 成立 " + okPairs + " 條 / 不成立 " + badPairs.length + " 條");
for (const p of badPairs) {
  problems.push({
    known: p.id,
    disclosed: p.official_claim_status === "unmatched_ncbahm_appendix_b__source_unverified",
    text: "herb_pairs " + p.id + "（" + p.name_zh + "，" + (p.herbs || []).length + " 味）標 ncbahm_official_pair:true，"
      + ((p.herbs || []).length !== 2 ? "但 Appendix B 全為二味對藥" : "但該組合不在 Appendix B 清單上")
      + (p.migrated_from ? "；migrated_from " + p.migrated_from : ""),
  });
}

// ---- 2. 藥卡 key_pairs 標籤裡的宣稱 ------------------------------------------
const tok = new Map();
for (const h of herbs) for (const a of (h.aliases_zh || [])) if (h.name_zh) tok.set(a, h.name_zh);
for (const h of herbs) if (h.name_zh) tok.set(h.name_zh, h.name_zh);   // 正名一定贏
const tokens = [...tok.keys()].sort((a, b) => b.length - a.length);
const idByZh = new Map(herbs.map((h) => [h.name_zh, h.id]).filter((x) => x[0]));
const namesIn = (l) => { const s = new Set(); let r = String(l || ""); for (const t of tokens) if (r.includes(t)) { s.add(tok.get(t)); r = r.split(t).join(" "); } return s; };
let okCards = 0; const badCards = [];
for (const h of herbs) for (const kp of (h.key_pairs || [])) {
  if (!/NCBAHM|Appendix\s*B/i.test(kp.pair || "")) continue;
  const ids = [...namesIn(kp.pair)].map((x) => idByZh.get(x)).filter(Boolean);
  if (onAppB(ids)) okCards++;
  else badCards.push({ h, kp, n: ids.length });
}
notes.push("藥卡 key_pairs 標籤宣稱 NCBAHM — 成立 " + okCards + " 條 / 不成立 " + badCards.length + " 條");
for (const b of badCards) {
  problems.push({
    known: b.h.id + "|" + b.kp.pair,
    disclosed: /未能以本庫/.test(String(b.kp.rationale_zh || "")),
    text: "藥卡 " + b.h.id + "「" + b.kp.pair + "」宣稱 NCBAHM，"
      + (b.n !== 2 ? "但辨識出 " + b.n + " 味而 Appendix B 全為二味對藥" : "但該組合不在 Appendix B 清單上"),
  });
}

/* ---- 3. contains_ncbahm_official_pair 指標(2026-09-01)---------------------
   9 條「把官方對藥身分套到臨床擴充組合上」更正後,改用這個欄位指向真正的官方那筆。
   指標會腐:被指的記錄可能改名、被拆、或自己不再是 Appendix B 對藥。
   這裡守三件事 —— 指得到、被指的確實在 Appendix B 上、而且確實被本組合包含。
   沒有這一段,更正過的 9 條就從閘門視野裡消失了(它們已不是 ncbahm_official_pair:true)。 */
const pairById = new Map(pairs.map((p) => [p.id, p]));
let okPtr = 0;
for (const p of pairs) {
  const target = p.contains_ncbahm_official_pair;
  if (!target) continue;
  const t = pairById.get(target);
  if (!t) {
    problems.push({ known: p.id, disclosed: false, text: "herb_pairs " + p.id + " 的 contains_ncbahm_official_pair 指向不存在的 " + target });
  } else if (!onAppB(t.herbs || [])) {
    problems.push({ known: p.id, disclosed: false, text: "herb_pairs " + p.id + " 指向 " + target + "，但那筆自己不在 Appendix B 上" });
  } else if (!(t.herbs || []).every((h) => (p.herbs || []).includes(h))) {
    problems.push({ known: p.id, disclosed: false, text: "herb_pairs " + p.id + " 指向 " + target + "，但那兩味並不都在本組合裡" });
  } else okPtr++;
}
notes.push("contains_ncbahm_official_pair 指標 — 成立 " + okPtr + " 條");

// Ting 裁定(2026-08-27):對不上本庫 NCBAHM 正本 **不等於** 宣稱是假的 ——
// 來源可能是 NCCAOM 或其他考綱版本,那些正本不在 repo,無從核對。
// 所以規則不是「不在清單上就 FAIL」,而是:**核不到就必須帶標記**。
//   herb_pairs → official_claim_status: "unmatched_ncbahm_appendix_b__source_unverified"
//   藥卡標籤   → rationale_zh 裡寫明未能核實
// 帶了標記 = 已誠實揭露,放行;沒帶 = FAIL。這樣不必維護一份會腐的名單,
// 而且新加的宣稱只要核不到又沒揭露就會被擋下。
const marked = problems.filter((p) => p.disclosed);
const undisclosed = problems.filter((p) => !p.disclosed);

console.log("validate-board-pair-attribution — 考綱官方對藥宣稱是否對得上考綱正本");
notes.forEach((n) => console.log("  " + n));
console.log("  核不到但已標未確認(放行): " + marked.length + " 項");
if (marked.length) {
  console.log("");
  marked.forEach((p) => console.log("  · " + p.text));
}
if (undisclosed.length) {
  console.log("");
  undisclosed.forEach((p) => console.log("  ✗ " + p.text));
  console.log("\nFAIL — " + undisclosed.length + " 項宣稱核不到而且沒有標未確認。");
  console.log("  處置:不必刪除宣稱 —— herb_pairs 加 official_claim_status:"
    + "\"unmatched_ncbahm_appendix_b__source_unverified\" 並在 teaching_note_zh 寫明核對範圍;"
    + "藥卡則在 rationale_zh 附註未能核實。");
  process.exit(1);
}
console.log("\nPASS — 所有考綱宣稱要嘛對得上正本,要嘛已標未確認。");
